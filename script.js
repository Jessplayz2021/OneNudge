// OneNudge: browser-only. Student details never leave this page and are never stored.
// The only things saved (in this browser's localStorage) are the theme choice (see common.js)
// and custom template wording.

// Sign-off used in the messages.
const TUTOR_NAME = "Sophie Money";

const TEMPLATES_KEY = "onenudge.templates.v1";

const byId = (id) => document.getElementById(id);

const fields = {
  studentName: byId("studentName"),
  studentPhone: byId("studentPhone"),
  employerEmail: byId("employerEmail"),
  employerContact: byId("employerContact"),
};

const options = {
  reminderType: byId("reminderType"),
  tone: byId("tone"),
  dueDate: byId("dueDate"),
};

// ---------------------------------------------------------------------------
// Storage (may be unavailable in private windows or with blocked site data)
// ---------------------------------------------------------------------------

const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* not critical */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* not critical */ }
  },
};

// ---------------------------------------------------------------------------
// Message content
// ---------------------------------------------------------------------------

// What each reminder type asks for. "student" is written to the student (SMS),
// "employer" is written about the student (email), "topic" is used in subjects.
const REMINDER_TYPES = {
  portfolio: {
    topic: "OneFile update",
    student: "update your OneFile portfolio and upload any outstanding evidence",
    employer: "log in to OneFile and ensure their portfolio is up to date",
  },
  evidence: {
    topic: "Outstanding evidence",
    student: "upload your outstanding evidence to OneFile",
    employer: "upload their outstanding evidence to OneFile",
  },
  otj: {
    topic: "Off-the-job hours",
    student: "log your off-the-job training hours on OneFile",
    employer: "log their off-the-job training hours on OneFile",
  },
  review: {
    topic: "Progress review",
    student: "get in touch to confirm a time for your progress review",
    employer: "confirm a time for their progress review",
  },
  assessment: {
    topic: "Assessment booking",
    student: "book your upcoming assessment",
    employer: "book their upcoming assessment",
  },
};

const DEFAULT_TEMPLATES = {
  email: {
    friendly: {
      subject: "{topic} reminder – {student}",
      body: `Dear {employer},

I hope you are well.

Could you please remind {student} to {action}{due}?

Thank you for your support.

Kind regards,
{tutor}`,
    },
    firm: {
      subject: "Follow-up: {topic} – {student}",
      body: `Dear {employer},

I'm following up on my earlier reminder. {student} still needs to {action}{due}.

Could you please make sure they have some time set aside to do this?

Kind regards,
{tutor}`,
    },
    final: {
      subject: "Action needed: {topic} – {student}",
      body: `Dear {employer},

Despite several reminders, {student} still needs to {action}{due}. This is starting to affect their progress on the apprenticeship.

Could we arrange a quick call this week to agree next steps?

Kind regards,
{tutor}`,
    },
  },
  sms: {
    friendly: {
      body: `Hi {studentFirst},

Just a friendly reminder to {action}{due}.

Many thanks,
{tutorFirst}`,
    },
    firm: {
      body: `Hi {studentFirst},

Following up on my last message: please {action}{due}. Let me know if you need any help.

Thanks,
{tutorFirst}`,
    },
    final: {
      body: `Hi {studentFirst},

This is a final reminder to {action}{due}. If it isn't done, I'll need to raise it with your employer. Please get in touch if something is stopping you.

{tutorFirst}`,
    },
  },
};

function loadCustomTemplates() {
  try {
    const parsed = JSON.parse(storage.get(TEMPLATES_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

let customTemplates = loadCustomTemplates();

function saveCustomTemplates() {
  if (Object.keys(customTemplates).length) {
    storage.set(TEMPLATES_KEY, JSON.stringify(customTemplates));
  } else {
    storage.remove(TEMPLATES_KEY);
  }
}

function getTemplate(channel, tone) {
  const template = { ...DEFAULT_TEMPLATES[channel][tone] };
  const custom = customTemplates[`${channel}.${tone}`];
  if (custom && typeof custom.body === "string") template.body = custom.body;
  if (custom && typeof custom.subject === "string" && channel === "email") template.subject = custom.subject;
  return template;
}

// Replaces {placeholders}; unknown ones are left as typed so mistakes are visible.
function renderTemplate(text, values) {
  return text.replace(/\{(\w+)\}/g, (match, key) => (Object.hasOwn(values, key) ? values[key] : match));
}

function firstName(fullName) {
  return fullName.trim().split(/\s+/)[0];
}

// "2026-12-05" -> " by Friday 5 December" (or "" when no date is set).
function formatDue(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || "");
  if (!match) return "";
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return "";
  const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
  const dayMonth = date.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  return ` by ${weekday} ${dayMonth}`;
}

function messageValues(channel) {
  const type = REMINDER_TYPES[options.reminderType.value] ?? REMINDER_TYPES.portfolio;
  const student = value(fields.studentName);
  return {
    student,
    studentFirst: firstName(student),
    employer: value(fields.employerContact) || "Employer",
    action: channel === "email" ? type.employer : type.student,
    topic: type.topic,
    due: formatDue(options.dueDate.value),
    tutor: TUTOR_NAME,
    tutorFirst: firstName(TUTOR_NAME),
  };
}

// ---------------------------------------------------------------------------
// Inline validation
// ---------------------------------------------------------------------------

function value(input) {
  return input.value.trim();
}

function showError(input, message) {
  const error = byId(`${input.id}Error`);
  error.textContent = message;
  error.hidden = false;
  input.setAttribute("aria-invalid", "true");
}

function clearError(input) {
  const error = byId(`${input.id}Error`);
  if (!error) return;
  error.textContent = "";
  error.hidden = true;
  input.removeAttribute("aria-invalid");
}

// Each check is [input, errorMessage]; an empty message means the field is valid.
// Shows every error at once and focuses the first invalid field.
function validate(checks) {
  let firstInvalid = null;
  for (const [input, message] of checks) {
    if (message) {
      showError(input, message);
      firstInvalid ??= input;
    } else {
      clearError(input);
    }
  }
  firstInvalid?.focus();
  return !firstInvalid;
}

function requiredMessage(input, message) {
  return value(input) ? "" : message;
}

// ---------------------------------------------------------------------------
// Phone numbers and SMS length
// ---------------------------------------------------------------------------

// Accepts UK mobiles as 07…, +447…, 447… or 00447…, ignoring spaces, dashes, dots and brackets.
function parseUkMobile(raw) {
  const compact = raw.replace(/[\s().-]/g, "");
  const match = compact.match(/^(?:07|\+447|447|00447)(\d{9})$/);
  if (!match) return null;
  const national = `07${match[1]}`;
  return {
    display: `${national.slice(0, 5)} ${national.slice(5)}`,
    international: `+447${match[1]}`,
  };
}

// Plain GSM text fits 160 characters per text (153 when split).
// Any other character (emoji, curly quotes, many accents) drops that to 70 (67 when split).
const GSM_BASIC = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_EXTENDED = "^{}\\[~]|€";

function smsLength(text) {
  let units = 0;
  let isGsm = true;
  for (const ch of text) {
    if (GSM_BASIC.includes(ch)) units += 1;
    else if (GSM_EXTENDED.includes(ch)) units += 2;
    else { isGsm = false; break; }
  }
  if (!isGsm) units = text.length; // UTF-16 code units
  const single = isGsm ? 160 : 70;
  const multi = isGsm ? 153 : 67;
  const segments = units <= single ? 1 : Math.ceil(units / multi);
  return { units, segments, perText: segments === 1 ? single : multi, isGsm };
}

function describeSmsLength(text) {
  const { units, segments, perText, isGsm } = smsLength(text);
  const count = segments === 1
    ? `${units} / ${perText} characters · fits in 1 text`
    : `${units} characters · sent as ${segments} texts`;
  return isGsm ? count : `${count} (contains special characters, so each text holds only ${perText})`;
}

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------

const preview = {
  placeholder: byId("previewPlaceholder"),
  email: byId("emailPreview"),
  sms: byId("smsPreview"),
};

const sendState = {
  emailAddress: "",
  smsNumber: "",
  // Which batch student each preview belongs to (-1 = not from a batch).
  owner: { email: -1, sms: -1 },
};

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function showPreview(block) {
  block.hidden = false;
  preview.placeholder.hidden = true;
  block.scrollIntoView?.({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  block.querySelector("h3")?.focus({ preventScroll: true });
}

function hidePreviews() {
  preview.email.hidden = true;
  preview.sms.hidden = true;
  preview.placeholder.hidden = false;
  sendState.owner = { email: -1, sms: -1 };
  byId("emailStatus").textContent = "";
  byId("smsStatus").textContent = "";
}

function mailtoHref(address, subject, body) {
  // Encode the address too, so characters like "?" or "&" can't add extra fields to the draft.
  const to = encodeURIComponent(address).replace(/%40/g, "@");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function updateEmailLink() {
  byId("openEmailLink").href = mailtoHref(sendState.emailAddress, byId("emailSubject").value, byId("emailBody").value);
}

function updateSmsPreview() {
  const message = byId("smsMessage").value;
  byId("smsLength").textContent = describeSmsLength(message);
  // "?&body=" is the form that both iOS and Android understand.
  byId("openSmsLink").href = `sms:${sendState.smsNumber}?&body=${encodeURIComponent(message)}`;
}

function prepareEmployerEmail() {
  const ok = validate([
    [fields.studentName, requiredMessage(fields.studentName, "Please enter the student's name.")],
    [fields.employerEmail,
      !value(fields.employerEmail) ? "Please enter the employer's email address."
        : !fields.employerEmail.checkValidity() ? "That doesn't look like a valid email address."
          : ""],
  ]);
  if (!ok) return;

  const values = messageValues("email");
  const template = getTemplate("email", options.tone.value);
  sendState.emailAddress = value(fields.employerEmail);
  sendState.owner.email = batch.index;

  // textContent / value, never innerHTML: typed input is treated as text, not markup.
  byId("emailRecipient").textContent = sendState.emailAddress;
  byId("emailSubject").value = renderTemplate(template.subject, values);
  byId("emailBody").value = renderTemplate(template.body, values);
  byId("emailStatus").textContent = "";
  updateEmailLink();
  showPreview(preview.email);
}

function prepareStudentSms() {
  const phone = parseUkMobile(value(fields.studentPhone));
  const ok = validate([
    [fields.studentName, requiredMessage(fields.studentName, "Please enter the student's name.")],
    [fields.studentPhone,
      !value(fields.studentPhone) ? "Please enter the student's mobile number."
        : !phone ? "Please enter a UK mobile number, such as 07123 456789."
          : ""],
  ]);
  if (!ok) return;

  const template = getTemplate("sms", options.tone.value);
  sendState.smsNumber = phone.international;
  sendState.owner.sms = batch.index;

  byId("smsRecipient").textContent = phone.display;
  byId("smsMessage").value = renderTemplate(template.body, messageValues("sms"));
  byId("smsStatus").textContent = "";
  updateSmsPreview();
  showPreview(preview.sms);
}

async function copyText(textarea, status, label) {
  try {
    await navigator.clipboard.writeText(textarea.value);
    status.textContent = `${label} copied. Nothing has been sent.`;
  } catch {
    textarea.focus();
    textarea.select();
    status.textContent = "Couldn't copy automatically. The text is selected — press Ctrl+C (or ⌘C) to copy it.";
  }
}

function clearStudentDetails() {
  for (const input of Object.values(fields)) {
    input.value = "";
    clearError(input);
  }
  hidePreviews();
  fields.studentName.focus();
}

// ---------------------------------------------------------------------------
// Batch mode
// ---------------------------------------------------------------------------

const batch = { students: [], index: -1 };

// Splits one CSV line, honouring "quoted, values" and "" escapes.
function splitCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i += 1; }
      else if (ch === '"') inQuotes = false;
      else current += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { cells.push(current); current = ""; }
    else current += ch;
  }
  cells.push(current);
  return cells;
}

// Turns pasted spreadsheet rows (tab- or comma-separated) into students.
// Columns default to: name, mobile, employer email, employer contact.
// A header row is detected and used to map columns in any order.
function parseStudentList(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return { students: [], skipped: 0 };

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const rows = lines.map((line) => (delimiter === "\t" ? line.split("\t") : splitCsvLine(line)).map((cell) => cell.trim()));

  let columns = { name: 0, phone: 1, email: 2, contact: 3 };
  const header = rows[0].map((cell) => cell.toLowerCase());
  const looksLikeHeader = !rows[0].some((cell) => parseUkMobile(cell) || cell.includes("@"))
    && header.some((cell) => /name|student|learner|phone|mobile|e-?mail/.test(cell));

  if (looksLikeHeader) {
    const find = (pattern, exclude = []) => header.findIndex((cell, i) => pattern.test(cell) && !exclude.includes(i));
    const contact = find(/contact|manager|supervisor|line ?manager/);
    const email = find(/e-?mail/, [contact]);
    const phone = find(/phone|mobile|tel|number/, [contact, email]);
    const name = find(/name|student|learner|apprentice/, [contact, email, phone]);
    columns = { name: name >= 0 ? name : 0, phone, email, contact };
    rows.shift();
  }

  const cell = (row, index) => (index >= 0 ? row[index] ?? "" : "");
  const students = rows
    .map((row) => ({
      name: cell(row, columns.name),
      phone: cell(row, columns.phone),
      email: cell(row, columns.email),
      contact: cell(row, columns.contact),
    }))
    .filter((student) => student.name);

  return { students, skipped: rows.length - students.length };
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function loadBatch() {
  const input = byId("batchInput");
  const { students, skipped } = parseStudentList(input.value);
  if (!students.length) {
    showError(input, "No students found. Paste at least one row that includes a student name.");
    input.focus();
    return;
  }
  clearError(input);

  batch.students = students.map((student) => ({ ...student, done: { email: false, sms: false } }));
  byId("batchQueue").hidden = false;
  byId("clearBatchButton").hidden = false;
  byId("batchSummary").textContent = `Loaded ${plural(students.length, "student")}.`
    + (skipped ? ` Skipped ${plural(skipped, "row")} with no student name.` : "");
  selectBatchStudent(0);
}

function selectBatchStudent(index) {
  const student = batch.students[index];
  if (!student) return;
  batch.index = index;
  fields.studentName.value = student.name;
  fields.studentPhone.value = student.phone;
  fields.employerEmail.value = student.email;
  fields.employerContact.value = student.contact;
  for (const input of Object.values(fields)) clearError(input);
  hidePreviews();
  renderBatch();
}

function renderBatch() {
  const list = byId("batchList");
  list.replaceChildren();
  batch.students.forEach((student, i) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "batch-item";
    if (i === batch.index) button.setAttribute("aria-current", "true");

    const name = document.createElement("span");
    name.className = "batch-name";
    name.textContent = student.name;

    const status = document.createElement("span");
    const done = [student.done.email && "Email ✓", student.done.sms && "SMS ✓"].filter(Boolean);
    status.className = done.length ? "batch-status is-done" : "batch-status";
    status.textContent = done.join(" · ") || "To do";

    button.append(name, status);
    button.addEventListener("click", () => selectBatchStudent(i));
    item.append(button);
    list.append(item);
  });

  const current = batch.students[batch.index];
  byId("batchPosition").textContent = current ? `Student ${batch.index + 1} of ${batch.students.length}: ${current.name}` : "";
  byId("batchPrev").disabled = batch.index <= 0;
  byId("batchNext").disabled = batch.index >= batch.students.length - 1;
}

function markSent(channel) {
  const student = batch.students[sendState.owner[channel]];
  if (!student) return;
  student.done[channel] = true;
  renderBatch();
}

function clearBatch() {
  batch.students = [];
  batch.index = -1;
  sendState.owner = { email: -1, sms: -1 };
  byId("batchInput").value = "";
  clearError(byId("batchInput"));
  byId("batchList").replaceChildren();
  byId("batchQueue").hidden = true;
  byId("clearBatchButton").hidden = true;
  byId("batchInput").focus();
}

// ---------------------------------------------------------------------------
// Custom template editor
// ---------------------------------------------------------------------------

const editor = {
  channel: byId("templateChannel"),
  tone: byId("templateTone"),
  subjectField: byId("templateSubjectField"),
  subject: byId("templateSubject"),
  body: byId("templateBody"),
  status: byId("templateStatus"),
};

function editorKey() {
  return `${editor.channel.value}.${editor.tone.value}`;
}

function showTemplateInEditor() {
  const channel = editor.channel.value;
  const template = getTemplate(channel, editor.tone.value);
  editor.subjectField.hidden = channel !== "email";
  editor.subject.value = template.subject ?? "";
  editor.body.value = template.body;
  clearError(editor.subject);
  clearError(editor.body);
  editor.status.textContent = customTemplates[editorKey()]
    ? "You're using your own wording for this one."
    : "This is the default wording.";
}

function saveTemplate() {
  const isEmail = editor.channel.value === "email";
  const ok = validate([
    ...(isEmail ? [[editor.subject, requiredMessage(editor.subject, "The subject can't be empty.")]] : []),
    [editor.body, requiredMessage(editor.body, "The message can't be empty.")],
  ]);
  if (!ok) return;

  const entry = { body: editor.body.value.trim() };
  if (isEmail) entry.subject = value(editor.subject);
  customTemplates[editorKey()] = entry;
  saveCustomTemplates();
  editor.status.textContent = "Saved. New messages will use this wording.";
}

function resetTemplate() {
  delete customTemplates[editorKey()];
  saveCustomTemplates();
  showTemplateInEditor();
  editor.status.textContent = "Back to the default wording.";
}

function insertPlaceholder(placeholder) {
  const { body } = editor;
  body.focus();
  body.setRangeText(placeholder, body.selectionStart, body.selectionEnd, "end");
  clearError(body);
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

// Keep the nav highlight in step with the section the user jumped to.
function updateActiveNav() {
  const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const hash = window.location.hash;
  const current = links.some((link) => link.getAttribute("href") === hash) ? hash : "#home";
  for (const link of links) {
    const isActive = link.getAttribute("href") === current;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

for (const input of [...Object.values(fields), byId("batchInput"), editor.subject, editor.body]) {
  input.addEventListener("input", () => clearError(input));
}

byId("reminderForm").addEventListener("submit", (event) => event.preventDefault());
byId("employerButton").addEventListener("click", prepareEmployerEmail);
byId("studentButton").addEventListener("click", prepareStudentSms);
byId("clearButton").addEventListener("click", clearStudentDetails);

byId("emailSubject").addEventListener("input", updateEmailLink);
byId("emailBody").addEventListener("input", updateEmailLink);
byId("openEmailLink").addEventListener("click", () => markSent("email"));
byId("copyEmailButton").addEventListener("click", () => {
  copyText(byId("emailBody"), byId("emailStatus"), "Message");
  markSent("email");
});

byId("smsMessage").addEventListener("input", updateSmsPreview);
byId("openSmsLink").addEventListener("click", () => markSent("sms"));
byId("copySmsButton").addEventListener("click", () => {
  copyText(byId("smsMessage"), byId("smsStatus"), "SMS text");
  markSent("sms");
});

byId("loadBatchButton").addEventListener("click", loadBatch);
byId("clearBatchButton").addEventListener("click", clearBatch);
byId("batchPrev").addEventListener("click", () => selectBatchStudent(batch.index - 1));
byId("batchNext").addEventListener("click", () => selectBatchStudent(batch.index + 1));

editor.channel.addEventListener("change", showTemplateInEditor);
editor.tone.addEventListener("change", showTemplateInEditor);
byId("saveTemplateButton").addEventListener("click", saveTemplate);
byId("resetTemplateButton").addEventListener("click", resetTemplate);
for (const chip of document.querySelectorAll("[data-placeholder]")) {
  chip.addEventListener("click", () => insertPlaceholder(chip.dataset.placeholder));
}
showTemplateInEditor();

window.addEventListener("hashchange", updateActiveNav);
updateActiveNav();
