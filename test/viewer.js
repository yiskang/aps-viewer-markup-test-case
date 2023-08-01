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

(async function () {
  /////////////////////////////////////////////////////////
  // Initialize viewer environment
  //
  /////////////////////////////////////////////////////////
  function initialize(options) {
    return new Promise((resolve, reject) => {
      Autodesk.Viewing.Initializer(options,
        function () {
          resolve();
        }, function (error) {
          reject(error);
        });
    });
  }

  /////////////////////////////////////////////////////////
  // load document from URN
  //
  /////////////////////////////////////////////////////////
  function loadDocument(urn) {
    return new Promise(function (resolve, reject) {
      let paramUrn = !urn.startsWith('urn:') ? 'urn:' + urn : urn;

      Autodesk.Viewing.Document.load(paramUrn,
        function (doc) {
          resolve(doc);
        }, function (error) {
          reject(error);
        })
    })
  }

  /////////////////////////////////////////////////////////
  // get query parameter
  //
  /////////////////////////////////////////////////////////
  function getQueryParam(name, url) {
    if (!url) url = window.location.href;

    name = name.replace(/[\[\]]/g, '\\$&');

    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    let results = regex.exec(url);

    if (!results) return null;
    if (!results[2]) return '';

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  /////////////////////////////////////////////////////////
  // Initialize Environment
  //
  /////////////////////////////////////////////////////////
  await initialize({
    accessToken: getQueryParam('accessToken'),
    env: 'AutodeskProduction2',
    api: 'streamingV2'
  });

  let viewableId = getQueryParam('viewableId');
  let doc = await loadDocument('urn:' + getQueryParam('urn'));

  let viewables = (viewableId ? doc.getRoot().findByGuid(viewableId) : doc.getRoot().getDefaultGeometry());
  let viewerDiv = document.getElementById('viewer');

  let viewer = getQueryParam('showToolbar')
    ? new Autodesk.Viewing.GuiViewer3D(viewerDiv)
    : new Autodesk.Viewing.Viewer3D(viewerDiv);

  viewer.start();
  await viewer.loadDocumentNode(doc, viewables);
  await viewer.waitForLoadDone();

  viewerDiv.classList.add('geometry-loaded');

  let markupCoreExt = await viewer.loadExtension('Autodesk.Viewing.MarkupsCore');
  markupCoreExt.enterEditMode();
  markupCoreExt.changeEditMode(new Autodesk.Viewing.Extensions.Markups.Core.EditModeRectangle(markupCoreExt));

  viewerDiv.classList.add('markupCoreExt-loaded');
})();