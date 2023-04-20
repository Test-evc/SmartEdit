/* Copyright (c) eVC-Tech. All rights reserved. Licensed under the MIT license. */

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    // Determine if the user's version of Office supports all the Office.js APIs that are used in the tutorial.
    if (!Office.context.requirements.isSetSupported("WordApi", "1.4")) {
      console.log("Word JavaScript API 1.4 is Supported");
    } else {
      console.log("Word JavaScript API 1.4 is not Supported");
    }
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("checkPairedSymbols").onclick = checkPairedSymbols;
  }
});

async function checkPairedSymbols() {
  await Word.run(async (context) => {
    const body = context.document.body;
    // Search for instances of text that contain double quotes
    const regex = '[“”]';
    const matches = body.search(regex, {matchWildcards: true});
    matches.load("text");

    await context.sync();

    const matchesCount = matches.items.length;
    let nextMatch = 0;
    console.log(matchesCount);

    for (let i = 0; i < matchesCount; i++) {
      const thisMatch = matches.items[i].text.charCodeAt(0);
      //console.log(matches.items[i].text);
      if (i != matchesCount - 1) {
        nextMatch = matches.items[i + 1].text.charCodeAt(0);
      } else { nextMatch = 0; }
      if (thisMatch == nextMatch - 1) {
        console.log("Pair matched: " + thisMatch + " open and close " + nextMatch);
        i++;
      } else {
        matches.items[i].insertComment("Mismatched pair");
        console.log("Mismatched pair");
      }
    }
  }).catch(function (error) {
    console.log("Error: " + error);
    if (error instanceof OfficeExtension.Error) {
      console.log("Debug info: " + JSON.stringify(error.debugInfo));
    }
  });
}
