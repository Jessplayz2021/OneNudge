// OneNudge: browser-only demo. No student information is sent to a server.
function getInput(id) {
  return document.getElementById(id).value.trim();
}

function button_employer() {
  const studentName = getInput("studentName");
  const employerEmail = getInput("EmployerEmail");
  const emailInput = document.getElementById("EmployerEmail");

  if (!studentName) {
    alert("Please enter the student's name.");
    document.getElementById("studentName").focus();
    return;
  }
  if (!employerEmail || !emailInput.checkValidity()) {
    alert("Please enter a valid employer email address.");
    emailInput.focus();
    return;
  }

  const subject = "OneFile Update Reminder";
  const body = `Dear Employer,

I hope you are well.

Could you please remind ${studentName} to log in to OneFile and ensure their portfolio is up to date?

Thank you for your support.

Kind regards,
Sophie Money`;

  window.location.href = `mailto:${employerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function button_student() {
  const studentName = getInput("studentName");
  const studentPhone = getInput("studentPhone");

  if (!studentName) {
    alert("Please enter the student's name.");
    document.getElementById("studentName").focus();
    return;
  }
  // UK mobile numbers only, in 07... or +447... format, allowing spaces or dashes.
  const normalizedPhone = studentPhone.replace(/[\s()-]/g, "");
  if (!/^(?:07\d{9}|\+447\d{9})$/.test(normalizedPhone)) {
    alert("Please enter a UK mobile number, such as 07123 456789.");
    document.getElementById("studentPhone").focus();
    return;
  }

  const message = `Hi ${studentName},

Just a friendly reminder to update your OneFile portfolio and upload any outstanding evidence.

Many thanks,
Sophie`;

  // Use textContent, not innerHTML: student input is treated as text, not markup.
  document.getElementById("smsRecipient").textContent = studentPhone;
  document.getElementById("smsMessage").textContent = message;
  document.getElementById("smsPreview").hidden = false;
  document.getElementById("smsPlaceholder").hidden = true;
  document.getElementById("copyStatus").textContent = "";
}

async function copyStudentSms() {
  const message = document.getElementById("smsMessage").textContent;
  const status = document.getElementById("copyStatus");
  try {
    await navigator.clipboard.writeText(message);
    status.textContent = "Message copied. Nothing has been sent.";
  } catch {
    status.textContent = "Clipboard unavailable. Select the message above to copy it manually.";
  }
}

document.getElementById("employerButton").addEventListener("click", button_employer);
document.getElementById("studentButton").addEventListener("click", button_student);
document.getElementById("copySmsButton").addEventListener("click", copyStudentSms);
// Prevent Enter from submitting and refreshing the dashboard.
document.getElementById("reminderForm").addEventListener("submit", (event) => event.preventDefault());
