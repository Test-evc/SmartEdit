/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global global, Office, self, window */

Office.onReady(() => {
  // If needed, Office.js is ready to be called
  // Add event listener for the ExecuteFunction control
});

async function indexValidation(event) {
  //	window.open("../../assets/Index-Validation.log");
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
        // Get the response text as plain text
        //        console.log(response.text());
        return response.text();
      })
      .then(function (processedText) {
        // Queue a command to set the body content with the processed text
        //body.clear();
        //body.insertText(processedText, Word.InsertLocation.replace);
        console.log(processedText);
        window.open("../../assets/Index-Validation.log");

        // Run the queued commands
        return context.sync();
      });
  });
  console.log("passToServer Completed");

  //	Required, call event.completed to let the platform know you are done processing.
  event.completed();
}

/**
 * Shows a notification when the add-in command is executed.
 * @param event {Office.Add-inCommands.Event}
 */
function action(event) {
  const message = {
    type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
    message: "Performed action.",
    icon: "Icon.80x80",
    persistent: true,
  };

  // Show a notification message
  Office.context.mailbox.item.notificationMessages.replaceAsync("action", message);

  // Be sure to indicate when the add-in command function is complete
  event.completed();
}

function getGlobal() {
  return typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;
}

const g = getGlobal();

// The add-in command functions need to be available in global scope
g.action = action;

Office.actions.associate("indexValidation", indexValidation);
