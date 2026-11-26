# OneNudge

Keeping apprenticeships on track, one reminder at a time.

OneNudge helps apprenticeship tutors prepare employer emails and student SMS reminders in seconds, without rewriting the same message every time.

**Live demo:** <https://onenudge.jsspec.uk>

## Features

- **Reminder types:** portfolio update, missing evidence, off-the-job hours, progress review and assessment booking.
- **Tone:** friendly nudge, firm follow-up or final reminder.
- **Optional due date**, added to the message as "by Friday 5 December".
- **Editable previews:** check and tweak the wording before copying it or opening it in your email or messaging app.
- **SMS character counter** that shows how many texts a message will use.
- **Batch mode:** paste a list of students from a spreadsheet and work through them one by one, with a tick list of what's been sent.
- **Custom templates:** change the wording of any message, using placeholders such as `{student}` and `{due}`.
- **Light and dark mode**, following your system setting by default.
- **Installable and works offline**, as a Progressive Web App.

## How to use

1. Open `index.html` in a browser, or serve the folder with any local web server.
2. Choose a reminder type, a tone and (optionally) a due date.
3. Enter the student's details, or open **Batch mode** and paste a list. Use dummy data for the demo.
4. Click **Prepare Employer Email** or **Prepare Student SMS**, check the preview, then:
   - **Open in email app** / **Open in Messages** opens your app with everything filled in.
   - **Copy message** / **Copy SMS text** copies the text to your clipboard.

Nothing is ever sent automatically. You always review the message and press send yourself. Open in Messages works best on a phone, or on Windows with Phone Link.

### Batch mode format

One student per row: student name, mobile number, employer email and (optionally) employer contact name. Copying rows straight from Excel works, as does comma-separated text. A header row is optional; if there is one, columns can be in any order.

```
Student name, Mobile, Employer email, Employer contact
Alex Smith, 07123 456789, manager@example.com, Mark
```

## Privacy

- Student details stay in the page and are never stored or sent to a server. A pasted batch list disappears when you close the page.
- The only things saved, in your browser's local storage, are your light/dark choice and any custom template wording.
- Do not use real student data without college IT approval.

Sending SMS directly from a college number would need an SMS provider, a secure backend, authentication, access controls and an approved data-processing arrangement.

## Project structure

| File                         | Purpose                                              |
| ---------------------------- | ---------------------------------------------------- |
| `index.html`                 | Main page: reminder dashboard                        |
| `support.html`               | Support page: FAQ, contact, saying thanks            |
| `style.css`                  | Styling, light and dark themes, responsive layout    |
| `common.js`                  | Shared by both pages: theme toggle, offline support  |
| `script.js`                  | Templates, validation, previews, batch mode          |
| `sw.js`                      | Service worker for offline use                       |
| `manifest.webmanifest`       | App name and icons for installing                    |
| `favicon.svg`, `*.png`       | Favicon, app icons and social preview image          |
| `CNAME`                      | Custom domain for GitHub Pages                       |

The tutor sign-off ("Sophie Money") is set by `TUTOR_NAME` at the top of `script.js`.
