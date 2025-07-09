document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
  // Attach event listener to the compose form
  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);
  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide emails views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  // Clear out compose fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the emails view and hide compose views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;
  // Fetch the emails from "/emails/<mailbox>"
  fetch(`/emails/${mailbox}`)
    // Get the response from get and translate to JSON
    .then((response) => response.json())
    // Handle the array of emails received in JSON response
    .then((emails) => {
      // Loop through emails and render them
      const emailsView = document.querySelector("#emails-view");
      emails.forEach((email) => {
        // Loop through emails and add a summary in a new div tag
        // email address span block
        const address = document.createElement("span");
        // email address style - read=normal, unread=bold
        address.style.fontWeight = email.read ? "normal" : "bold";
        // email address list sent mail "To: <recipients>", other "<sender>"
        address.innerHTML =
          mailbox === "sent"
            ? "To: " + email.recipients.join(", ")
            : email.sender;
        // email subject span block
        const subject = document.createElement("span");
        subject.innerHTML = email.subject;
        // email header (address + subject) div block
        const headerDiv = document.createElement("div");
        headerDiv.appendChild(address);
        headerDiv.appendChild(document.createElement("br"));
        headerDiv.appendChild(subject);
        // email timestamp div block
        const timestampDiv = document.createElement("div");
        timestampDiv.className = "text-muted small";
        timestampDiv.innerHTML = email.timestamp;
        // email item (header + timestamp) div block
        const emailDiv = document.createElement("div");
        emailDiv.className =
          "p-2 border d-flex justify-content-between align-items-center mb-1";
        emailDiv.style.backgroundColor = email.read ? "whitesmoke" : "white";
        emailDiv.style.cursor = "pointer";
        emailDiv.appendChild(headerDiv);
        emailDiv.appendChild(timestampDiv);
        // When clicked, show the full email
        emailDiv.addEventListener("click", () => view_email(email.id));
        // Add the email item div tag to the emails view
        emailsView.appendChild(emailDiv);
      });
    });
}

function send_email(event) {
  // Handle submit here, prevent default behavior for submit
  event.preventDefault();
  // Fetch (post) an email to "/emails" translating the fields in the body.
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value,
    }),
  })
    // Get the response from post and translate to JSON
    .then((response) => response.json())
    // Get the response from post and translate to JSON
    .then((result) => {
      if (result.message) {
        // After sending successfully, load sent mailbox
        load_mailbox("sent");
      } else if (result.error) {
        // After sending unsuccessfully, show error to the user
        alert(result.error);
      }
    });
}

function view_email(id) {
  // Show the emails view and hide compose views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  // Clear the email view
  document.querySelector("#emails-view").innerHTML = ``;
  // Fetch the email from "/emails/<id>"
  fetch(`/emails/${id}`)
    // Get the response from get and translate to JSON
    .then((response) => response.json())
    // Handle the single emails received in JSON response
    .then((email) => {
      const emailsView = document.querySelector("#emails-view");
      if (!email.read) {
        // Use fetch (post) to mark the email as read
        // Ignore the response
        fetch(`/emails/${id}`, {
          method: "PUT",
          body: JSON.stringify({ read: true }),
        });
      }
      // Show full email content in a new div tag
      const container = document.createElement("div");
      container.innerHTML = `
        <strong>From:</strong> ${email.sender}<br>
        <strong>To:</strong> ${email.recipients.join(", ")}<br>
        <strong>Subject:</strong> ${email.subject}<br>
        <strong>Timestamp:</strong> ${email.timestamp}<br><br>
      `;
      // Add a Reply button
      const replyBtn = document.createElement("button");
      replyBtn.className = "btn btn-sm btn-outline-secondary mb-2";
      replyBtn.id = "reply-btn";
      replyBtn.innerHTML = "Reply";
      // Add a listener to the reply button.
      replyBtn.addEventListener("click", () => {
        // Compose a new reply email
        compose_email();
        // Pre-fill the fields for a reply based on the current email.
        document.querySelector("#compose-recipients").value = email.sender;
        document.querySelector("#compose-subject").value =
          email.subject.startsWith("Re:")
            ? email.subject
            : `Re: ${email.subject}`;
        document.querySelector(
          "#compose-body"
        ).value = `\n\nOn ${email.timestamp}, ${email.sender} wrote:\n${email.body}`;
      });
      container.appendChild(replyBtn);
      // If not the sender, then add an Archive/Unarchive button
      if (email.user !== email.sender && email.archived !== undefined) {
        const archiveBtn = document.createElement("button");
        archiveBtn.id = "archive-btn";
        if (email.archived) {
          archiveBtn.className = "btn btn-sm btn-success mb-2 ml-2";
          archiveBtn.innerHTML = "Unarchive";
        } else {
          archiveBtn.className = "btn btn-sm btn-warning mb-2 ml-2";
          archiveBtn.innerHTML = "Archive";
        }
        // Add a listener to the archive button, if there is one.
        archiveBtn.addEventListener("click", () => {
          // Use fetch (post) to toggle the archived status of the email.
          fetch(`/emails/${id}`, {
            method: "PUT",
            body: JSON.stringify({ archived: !email.archived }),
          })
            // Reload the inbox to account for the email's new archived status
            .then(() => load_mailbox("inbox"));
        });
        container.appendChild(archiveBtn);
      }
      // Add a horizontal ruler
      container.appendChild(document.createElement("hr"));
      // Add the <pre> email body
      const preBody = document.createElement("pre");
      preBody.style = "white-space: pre-wrap;";
      preBody.innerHTML = email.body;
      container.appendChild(preBody);
      // Add the new div tag to the emails view
      emailsView.appendChild(container);
    });
}
