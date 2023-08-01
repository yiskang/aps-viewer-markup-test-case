# aps-viewer-markup-core-ext-test-case

![platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![node.js](https://img.shields.io/badge/Node.js-18.16-blue.svg)](https://nodejs.org)
[![license](https://img.shields.io/:license-mit-green.svg)](https://opensource.org/licenses/MIT)

Test case of generating data string using `generateData()` of the `Autodesk.Viewing.MarkupsCore` extension.

## Test Case

This sample will do the following in the test:

1. Load the model you specified automatically with [Puppeteer](https://pptr.dev/), Node.js API for Google Chrome.
2. Load the `Autodesk.Viewing.MarkupsCore` extension.
3. Create two rectangle markups using API provided by the `Autodesk.Viewing.MarkupsCore` extension.
4. Take a snapshot of viewer screen and save it as `test.png` in the project folder.
5. Call `generateData()` of the `Autodesk.Viewing.MarkupsCore` extension to generating markup data string (XML).
6. Verify if any markup in the generated markup data string has no valid markup metadata by converting the data string from XML to JSON.

Here is an example of console output from this sample:

```bash
[2023-08-01T09:02:16.372Z] Node.js version: v18.16.0
[2023-08-01T09:02:19.905Z] Loading Model ...
[2023-08-01T09:02:35.177Z] Loading MarkupCoreExt ...
[2023-08-01T09:02:36.654Z] Drawing two markups ...
[2023-08-01T09:02:36.778Z] Start testing `generateData()` ...
[2023-08-01T09:02:36.783Z] Remaining time (mins): 60.00, Call `generateData()` count: 1
[2023-08-01T09:05:00.002Z] Remaining time (mins): 57.61, Call `generateData()` count: 36
[2023-08-01T09:10:00.003Z] Remaining time (mins): 52.61, Call `generateData()` count: 111
[2023-08-01T09:15:00.032Z] Remaining time (mins): 47.61, Call `generateData()` count: 186

##...
```

### Notes

- This sample will run the test for 30 mins by default.
- This sample uses [xml-js](https://www.npmjs.com/package/xml-js) for converting XAML to JSON.
- If any invalid markup found in the generated markup data string (no markup metadata), it will report the finding in the console.
- This sample will report remaining time in the console per 5 mins.

## Running locally

1. Get your APS app client ID and client secret (see how to [create an app](https://aps.autodesk.com/en/docs/oauth/v2/tutorials/create-app))
2. Clone this repository, and navigate to the project's folder in your terminal
3. Install npm dependencies
    - `npm install`
4. Specify env. variables `APS_CLIENT_ID`, `APS_CLIENT_SECRET`, and `URN`
    - `export APS_CLIENT_ID=<your client id>`
    - `export APS_CLIENT_SECRET=<your client secret>`
    - `export URN=<your model urn>`
5. Run the app
    - `npm start`

If you're using [Visual Studio Code](https://code.visualstudio.com), skip the steps 4 and 5,
and instead create a `.env`` in the project's folder with env. variables below:

```
APS_CLIENT_ID=<your client id>
APS_CLIENT_SECRET=<your client secret>
URN=<your model urn>
```

Then you can run _and debug_ the application with `F5`, or by going to `Run` > `Start Debugging`.

# License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).
Please see the [LICENSE](LICENSE) file for full details.

## Written by

Eason Kang [@yiskang](https://twitter.com/yiskang), [Developer Advocacy and Support](http://aps.autodesk.com)