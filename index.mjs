/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Eason Kang 2023 - Developer Advocacy and Support
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
////////////////////////////////////////////////////////////////////////////////

import path from 'path';
import { fileURLToPath } from 'url';
import Aps from 'forge-apis';
import puppeteer from 'puppeteer';
import { xml2json } from 'xml-js';
import logTimestamp from 'log-timestamp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`Node.js version: ${process.version}`);

// Fetch Forge token
const getToken = () => {
    const scope = [
        'viewables:read'
    ];

    const oAuth2TwoLegged = new Aps.AuthClientTwoLeggedV2(
        process.env.APS_CLIENT_ID,
        process.env.APS_CLIENT_SECRET,
        scope
    );

    return oAuth2TwoLegged.authenticate()
};

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

// Runs the test
(async () => {
    // Using the workaround to run chrome with
    // WebGL enabled
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--hide-scrollbars',
            '--mute-audio',
            '--headless'
        ]
    });

    ['SIGINT', 'SIGTERM', 'SIGQUIT']
        .forEach(signal => process.on(signal, async () => {
            console.log('Received terminating request from user. Closing Browser ...');
            browser.close();

            process.exit();
        }));

    try {
        // assumes files are in ./test relative directory
        // chrome doesn't support relative path
        const filename = path.resolve(__dirname, './test/viewer.html')
        const token = await getToken();

        // assumes URN is defined in ENV var
        const urn = process.env.URN;

        const url = `file://${filename}?accessToken=${token.access_token}&urn=${urn}`;

        const page = await browser.newPage();

        await page.goto(url);

        console.log('Loading Model ...');
        // waits for .geometry-loaded class being added
        await page.mainFrame().waitForSelector(
            '.geometry-loaded', {
            timeout: 30000
        });

        console.log('Loading MarkupCoreExt ...');
        const frame = await page.mainFrame().waitForSelector(
            '.markupCoreExt-loaded', {
            timeout: 30000
        });

        console.log('Drawing two markups ...');
        const rect = await page.evaluate(el => {
            const { x, y } = el.getBoundingClientRect();
            return { x, y };
        }, frame);

        await page.mouse.move(rect.x + 50, rect.y + 50);
        await page.mouse.down();
        await page.mouse.move(rect.x + 150, rect.y + 150);
        await page.mouse.up();

        await page.mouse.move(rect.x + 250, rect.y + 250);
        await page.mouse.down();
        await page.mouse.move(rect.x + 250 + 150, rect.y + 250 + 150);
        await page.mouse.up();

        console.log('Start testing `generateData()` ...');
        let startTime = Date.now();
        let testPeriod = 30 * 60 * 1000; //!<<< 30 mins, Change this value to extend the test time
        let endTime = new Date(startTime + testPeriod);
        let count = 0;

        const REPORT_BASE_TIME = 5 * 60 * 1000; //!<<< Report remaining time per 5 mins.
        function reportTestProgressByBase() {
            const msToNextRounded = REPORT_BASE_TIME - (Date.now() % REPORT_BASE_TIME);

            let minutesRemained = (endTime - Date.now()) / 1000 / 60;
            console.log(`Remaining time (mins): ${minutesRemained.toFixed(2)}, Call \`generateData()\` count: ${count}`);

            setTimeout(() => {
                reportTestProgressByBase();
            }, msToNextRounded);
        }

        //for (let i = 0; i < 10; i++) {
        while ((Date.now() - startTime) < testPeriod) {
            let markupXml = await page.evaluate(() => {
                return NOP_VIEWER.getExtension('Autodesk.Viewing.MarkupsCore')?.generateData();
            });

            ++count;

            //console.log(markupXml);

            let markupJsonStr = xml2json(markupXml);
            let markupJson = JSON.parse(markupJsonStr);
            //console.log(markupJson);

            if (markupJson?.elements && markupJson?.elements.length > 0) {
                let markupDataRoot = markupJson?.elements[0];
                let isAllMarkupsHaveMetadata = markupDataRoot.elements.filter(n => n.name === 'g').every(g => g.elements.find(n => n.name == 'metadata'));

                if (isAllMarkupsHaveMetadata) {
                    //console.log(`Is valid: ${isAllMarkupsHaveMetadata}, count: ${count}`);
                } else {
                    console.error(`Is valid: ${isAllMarkupsHaveMetadata}, count: ${count}, ${markupXml}`);
                }
            }

            if (count === 1)
                reportTestProgressByBase();

            await delay(4000);
        }

        // saves screenshot in process.env.IMGPATH
        // or defaults to test.png
        // await page.screenshot({
        //     path: process.env.IMGPATH || 'test.png'
        // });

        console.log('Test successful :)');
    } catch (ex) {
        console.log('Test failed :(');
        console.log(ex);

    } finally {
        await browser.close();
    }
})();