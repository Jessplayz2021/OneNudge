

function button_employer() {
    let studentName = document.getElementById("studentName").value;
    let employerEmail = document.getElementById("EmployerEmail").value;
    let subject = 'Onefile Reminder';
    let encodedSubject = encodeURIComponent(subject);
    let body = `Dear Employer,

    Please remind ${studentName} to update their portfolio.

    Kind regards,
    Sophie Money`;
    let encodedBody = encodeURIComponent(body);
    window.location.href = `mailto:${employerEmail}?subject=${encodedSubject}&body=${encodedBody}`;
}

