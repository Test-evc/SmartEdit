/* Copyright (c) eVC-Tech. All rights reserved. Licensed under the MIT license. */

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    // Determine if the user's version of Office supports all the Office.js APIs that are used in the tutorial.
    if (Office.context.requirements.isSetSupported("WordApi", "1.5")) {
      console.log("Word JavaScript API 1.5 is Supported");
    } else {
      console.log("Word JavaScript API 1.5 is not Supported");
    }
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("checkPairedSymbols").onclick = checkPairedSymbols;
    // Usage: Provide the file system path as an argument when calling the function
    document.getElementById("loadStyles").onclick = readTemplate;
    $("#file").change(getBase64);
    $("#getExternalStyles").click(() => tryCatch(getExternalStyles));
    $("#count").click(() => tryCatch(getCount));
  }
});

async function getCount() {
  // Gets the number of styles.
  await Word.run(async (context) => {
    const styles = context.document.getStyles();
    const count = styles.getCount();
    await context.sync();

    console.log(`Number of styles: ${count.value}`);
  });
}

let externalDocument;

function readTemplate() {
  const filePath = "https://localhost:3000/assets/ScMLStyles.docx";
  console.log("Starting to read the external document from path: " + filePath);

  // Read the file from the specified file system path
  return fetch(filePath)
    .then((response) => response.blob())
    .then((blob) => {
      // Use the retrieved blob (DOCX file) as needed
      // For example, you can save it or process it further
      const reader = new FileReader();
      reader.onload = (event) => {
        // Get the Base64-encoded string from the FileReader result
        const base64Content = reader.result.split(",")[1];
        externalDocument = base64Content;
        //console.log("Base64-encoded content:", externalDocument);
      };
      // Read the file as a data URL so that we can parse the Base64-encoded string.
      reader.readAsDataURL(blob);
      console.log("Successfully read the template file:", filePath);
      getExternalStyles();
    })
    .catch((error) => {
      console.error("Error fetching the DOCX file:", error);
    });
}

function isBase64(str) {
  try {
    if (btoa(atob(str)) === str) {
      console.log("Valid Base64-encoded string");
      return true;
    } else {
      console.log("Invalid Base64-encoded string");
      return false;
    }
  } catch (err) {
    console.log("Invalid Base64-encoded string");
    return false;
  }
}

async function getExternalStyles() {
  // Gets style info from another document passed in as a Base64-encoded string.
  await Word.run(async (context) => {
    const retrievedStyles = context.application.retrieveStylesFromBase64(externalDocument);
    await context.sync();

    console.log("Styles from the other document:");
    console.log(retrievedStyles.value.split("nameLocal").length);

    isBase64(externalDocument);
    // Apply the document theme to import the styles
    context.document.insertFileFromBase64(externalDocument, Word.InsertLocation.end, {
      importTheme: false,
      importStyles: true,
      importParagraphSpacing: false,
      importPageColor: false,
      importChangeTrackingMode: false
    });
    await context.sync();

    console.log("Styles copied from the other document:");
    //console.log(retrievedStyles.value);
  });
}

function getBase64() {
  // Retrieve the file and set up an HTML FileReader element.
  const myFile = document.getElementById("file");
  const reader = new FileReader();

  reader.onload = (event) => {
    // Remove the metadata before the Base64-encoded string.
    const startIndex = reader.result.toString().indexOf("base64,");
    externalDocument = reader.result.toString().substr(startIndex + 7);
  };

  // Read the file as a data URL so that we can parse the Base64-encoded string.
  reader.readAsDataURL(myFile.files[0]);
}

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
  console.log("checkPairedSymbols Completed");
}

/** Default helper for invoking an action and handling errors. */
async function tryCatch(callback) {
  try {
    await callback();
  } catch (error) {
    // Note: In a production add-in, you'd want to notify the user through your add-in's UI.
    console.error(error);
  }
}
