function button_employer() {
  const studentName = document.getElementById("studentName").value.trim();
  const employerEmail = document.getElementById("EmployerEmail").value.trim();
  if (!studentName || !employerEmail) return;

  const subject = "OneFile Reminder";
  const body = `Dear Employer,

Could you please remind ${studentName} to update their OneFile portfolio, ensuring any outstanding evidence and progress records are up to date?

Kind regards,
Sophie Money`;

  const mailto = `mailto:${employerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

document.getElementById("employerForm").addEventListener("submit", function (event) {
  event.preventDefault();
  button_employer();
});
