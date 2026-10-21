# Data Source - Assignment 3 Portfolio

![Data Source](images/data-source-logo.png)

A responsive careers website demonstrating a job application and HR management journey. This portfolio continues the Data Source Assignment 2 design with application records, filtering, sorting, status changes and deletion.

**Planned live URL:** [Data Source Assignment 3](https://nikolaosanestakis.github.io/data-source-assignment3-portfolio/). The URL becomes available after this repository is pushed and GitHub Pages finishes deploying.

## Overview

The private academic application uses PHP, `mysqli` and MySQL. This public version is a static demonstration built with HTML, CSS and plain JavaScript so it can run on GitHub Pages. Fictional initial records come from `data/eois.json`. New submissions and management changes are saved in the visitor's browser.

There is no server-side application database in this portfolio. The hosted JSON file is read-only and visitors do not share their saved records. Use fictional details when testing.

## Pages

| Page | Purpose |
| --- | --- |
| Home | Introduction to Data Source and its cloud services |
| Jobs | DevOps and technical support positions with Apply links |
| Apply | Validated application form, completion meter and local confirmation |
| About | Profile, portrait, personal details and sample timetable from the earlier design |
| Enhancements | Original responsive design and image/content references |
| Enhancements2 | Completion meter, HamburgerElegant navigation and optional timer |
| Backend features | Explains the PHP/MySQL implementation and static adaptation |
| Manage applications | Open demonstration of HR filters, sorting, status changes and deletion |

## Design and navigation

The logos, images, page content and styles continue Assignment 2. About, Jobs, Apply and the enhancements pages use matching banner size, type and layout. The private PHP implementation produces these shared sections through includes; this repository contains rendered HTML for static hosting.

Above 1200px the desktop navigation is visible. At 1200px and below, HamburgerElegant opens a modal navigation drawer. The hamburger and X share a position, the branded header remains visible, a light grey line separates it from the drawer, and the active page is underlined. Link selection completes the closing animation before navigation. Reduced-motion preferences are respected. Without JavaScript the ordinary navigation remains available.

## Application journey

1. Choose Apply on a job listing, or enter a five-character job reference manually.
2. Complete the required applicant fields and any selected Other skills description.
3. Submit to receive a browser-local EOI number with status New.
4. Open Manage applications through the footer to inspect the new record.
5. Filter by job reference, first name, last name or both; choose the sort field and direction.
6. Save a status of New, Current or Final, delete records for a job reference, or reset the demonstration data.

The demo number is allocated from the current browser dataset. It is not a globally unique database identifier. The private application obtains its EOI number from MySQL auto-increment.

## Validation

| Field | Browser demonstration rule |
| --- | --- |
| Job reference | Exactly five letters or digits |
| First and last name | Required; at most 20 letters, following the coursework model |
| Date of birth | Real dd/mm/yyyy calendar date; age 15-80 inclusive |
| Gender | A selected form option |
| Street and suburb/town | Required; maximum 40 characters |
| State | One of the eight defined Australian state/territory options |
| Postcode | Four digits with the coursework state-prefix check |
| Email | Browser email-format validation |
| Phone | 8-12 digits or spaces |
| Other skills | Required when selected |

Errors appear in a linked summary and invalid controls receive `aria-invalid`. A progress meter updates as required fields become complete. This visual guidance does not replace validation. The private project repeats format and required-field checks on the server even when JavaScript is disabled or bypassed.

## Browser storage and JSON

| Storage | Key | Purpose |
| --- | --- | --- |
| localStorage | datasource.portfolio.assignment3.eois.v1 | Demo applications and management changes |
| localStorage | datasource.portfolio.assignment3.job | Selected job reference |
| sessionStorage | datasource.portfolio.assignment3.applicant | Applicant autofill within the tab |

`data/eois.json` supplies three fictional applicants. `data/jobs.json` records the two advertised job references and titles; the detailed job listings remain HTML. The application checks loaded record shape before using it and builds the results table with DOM text nodes instead of interpolated record HTML.

Form Reset clears applicant autofill and the current form fields while retaining the selected job. It does not remove a submitted demonstration EOI. Reset demonstration data on Manage restores the original three JSON records. If local storage is blocked, the page reports that changes cannot be saved.

## Run locally

Serve this repository over HTTP so the browser can fetch JSON:

```bash
python3 -m http.server 8084
```

Open [localhost:8084](http://localhost:8084/). Do not open the HTML through `file://`; browsers may block JSON loading in that context. Node is not required to run or deploy the website.

## GitHub Pages

Publish the public repository `NikolaosAnestakis/data-source-assignment3-portfolio`. In Settings > Pages, choose **Deploy from a branch**, **main**, and **/(root)**, then save. The package's installation script configures the same source through `gh`.

All local links and asset URLs are relative, allowing deployment under the repository path. No PHP files, database passwords or real application records belong in this repository. GitHub Pages serves the static site; it cannot run the private PHP endpoints or write submitted records into this repository's JSON file.

## Tests

```bash
npm install
npm test
```

The DOM suite checks valid submission, invalid dates, generated identifiers, initial status, record persistence across pages, combined filtering, descending sorting, status updates, deletion, reset and safe text rendering. Fourteen checks passed with jsdom 26.1.0. Asset and relative-link checks also passed. The private application separately passed 29 validation checks and 31 HTTP checks against PHP 8.3.6 and a real MySQL 8.0.46 server.

Full browser visual checks, keyboard/screen-reader evaluation and the published deployment remain to be verified. DOM tests do not establish pixel accuracy or WCAG conformance.

## Private application differences

| Capability | This portfolio | Private working application |
| --- | --- | --- |
| Rendering | Static HTML | PHP with shared .inc files |
| Validation authority | Browser demonstration | PHP server |
| Data | Fictional JSON seed and localStorage | MySQL eoi table through mysqli |
| EOI number | Browser dataset counter | Database auto-increment |
| HR access | Open demonstration | Manager login and session checks |
| Changes | Local to a browser | Persisted in MySQL |
| Account security | No authentication claim | Invitation registration, hashed passwords, account lockout, logout, CSRF |

The two assessed PHP enhancements are manager-selectable sorting and protected manager accounts. They are documented on the Backend features page. The portfolio demonstrates sorting and explains authentication rather than pretending browser-only code can protect server data.

## Accessibility and privacy

The interface includes a skip link, landmarks, labelled controls, fieldsets, visible focus styling, an error summary, status messages, table headers and reduced-motion styles. The drawer uses native dialog focus handling. The application timer is off by default, can be extended repeatedly, and can be disabled.

The application code does not set cookies in this static version. Hosting providers may collect access logs. The About page retains the owner's portrait and profile content; its tutor label is generic and its timetable is a sample. Demo applicant details are fictional and should stay that way.

## Sources

Design, page content and assets originate from Nikolaos Anestakis' Data Source Assignment 1 and Assignment 2 projects. Existing content and image references remain on Enhancements. The menu animation is adapted from [HamburgerElegant](https://github.com/NikolaosAnestakis/HamburgerElegant/blob/main/menudrawer.html). Technical references: [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [MDN Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), and the [PHP mysqli manual](https://www.php.net/manual/en/book.mysqli.php).
