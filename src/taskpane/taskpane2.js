/* Copyright (c) eVC-Tech. All rights reserved. Licensed under the MIT license. */

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    // Determine if the user's version of Office supports all the Office.js APIs that are used in the tutorial.
    if (!Office.context.requirements.isSetSupported("WordApi", "1.4")) {
      console.log("Word JavaScript API 1.40 is Supported");
    } else {
      console.log("Word JavaScript API 1.40 is not Supported");
    }
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    //document.getElementById("checkPairedSymbols").onclick = checkPairedSymbols;
    document.getElementById("Validate").onclick = tryCatch(Validate);
  }
});

async function Validate() {
  console.log("passToServer Started");
  await Word.run(function (context) {
    // Get the body content
    var body = context.document.body;

    // Queue a command to load the body content
    context.load(body, "text");

    // Run the queued commands
    return context
      .sync()
      .then(function () {
        // Get the text of the body content
        var bodyText = body.text;
        // eslint-disable-next-line no-undef
        //console.log(bodyText);

        // Send the bodyText to the server for processing
        return fetch("http://localhost:4000/process-body", {
          method: "POST",
          body: bodyText,
          headers: {
            "Content-Type": "text/plain",
          },
        });
      })
      .then(function (response) {
        return response.text();
      })
      .then(function (processedText) {
        console.log(processedText);
        window.open("../../assets/Index-Validation.log");
        return context.sync();
      });
  });
  console.log("passToServer Completed");
}

/** Default helper for invoking an action and handling errors. */
async function tryCatch(callback) {
  try {
    await callback();
  } catch (error) {
    // Note: In a production add-in, you'd want to notify the user through your add-in's UI.
    console.error("Error running the function: " + error);
  }
}
