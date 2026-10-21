/* Data Source | Nikolaos Anestakis | Assignment 3 static portfolio.
 * JSON is read-only seed data. Mutations remain in this browser.
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage */
"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("application-form");
  const filters = document.getElementById("manager-filters");
  if (!form && !filters) return;
  const KEY = "datasource.portfolio.assignment3.eois.v1";
  const STATUSES = ["New", "Current", "Final"];
  let records = [], seed = [], ready = false;
  const message = document.getElementById("manager-message") || document.getElementById("demo-outcome");
  function announce(text) { message.hidden = false; message.textContent = text; }
  function persist(next) {
    try { localStorage.setItem(KEY, JSON.stringify(next)); records = next; return true; }
    catch { announce("Browser storage is unavailable. Allow local storage to save demonstration changes."); return false; }
  }
  function validRecord(row) {
    return row && typeof row === "object" && Number.isSafeInteger(row.EOInumber) && row.EOInumber > 0 &&
      STATUSES.includes(row.Status) && ["jobReference","firstName","lastName","email","phone","streetAddress","suburbTown","state","postcode","dateOfBirth","gender","skills","otherSkills","createdAt"].every(key => typeof row[key] === "string");
  }
  function validRecords(rows) {
    return Array.isArray(rows) && rows.every(validRecord) && new Set(rows.map(row => row.EOInumber)).size === rows.length;
  }
  function element(tag, text, attrs = {}) {
    const node = document.createElement(tag);
    node.textContent = text;
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  }
  function render() {
    if (!filters || !ready) return;
    const data = new FormData(filters);
    const rows = records.filter(row => ["jobReference", "firstName", "lastName"].every(key => {
      const value = String(data.get(key) || "").trim().toLowerCase();
      return !value || row[key].toLowerCase() === value;
    }));
    const allowed = ["EOInumber", "jobReference", "firstName", "lastName", "Status", "createdAt"];
    const key = allowed.includes(data.get("sort")) ? data.get("sort") : "EOInumber";
    const direction = data.get("direction") === "DESC" ? -1 : 1;
    rows.sort((a, b) => direction * (key === "EOInumber" ? a[key] - b[key] : a[key].localeCompare(b[key])) || a.EOInumber - b.EOInumber);
    const body = document.getElementById("eoi-rows");
    body.replaceChildren();
    for (const row of rows) {
      const tr = element("tr", "");
      tr.append(element("th", row.EOInumber, {scope: "row"}));
      for (const value of [row.jobReference, `${row.firstName} ${row.lastName}`, `${row.email} / ${row.phone}`, `${row.streetAddress}, ${row.suburbTown} ${row.state} ${row.postcode}`]) tr.append(element("td", value));
      const detailsCell = element("td", "");
      const details = element("details", "");
      details.append(element("summary", "Applicant details"), element("p", `Born: ${row.dateOfBirth}. Gender: ${row.gender}. Skills: ${row.skills}. Other skills: ${row.otherSkills}`));
      detailsCell.append(details); tr.append(detailsCell);
      const statusCell = element("td", "");
      const statusForm = element("form", "");
      const id = `status-${row.EOInumber}`;
      const select = element("select", "", {id, name: "status"});
      for (const status of STATUSES) { const option = element("option", status, {value: status}); option.selected = row.Status === status; select.append(option); }
      statusForm.append(element("label", `Status for EOI ${row.EOInumber}`, {for: id}), select, element("button", "Save status", {type: "submit"}));
      statusForm.addEventListener("submit", event => {
        event.preventDefault();
        if (persist(records.map(item => item.EOInumber === row.EOInumber ? {...item, Status: select.value} : item))) {
          render(); announce(`EOI ${row.EOInumber} status updated in this browser.`);
        }
      });
      statusCell.append(statusForm); tr.append(statusCell); body.append(tr);
    }
    announce(`${rows.length} demonstration applications found.`);
  }
  if (form) form.addEventListener("datasource:submit", event => {
    if (!ready) { announce("Demonstration data is still loading. Please try again shortly."); return; }
    const {details, reference} = event.detail;
    const EOInumber = Math.max(0, ...records.map(row => row.EOInumber)) + 1;
    const skills = [["programming","Programming"],["networking","Networking"],["desktopSupport","Desktop Support"],["otherSkillsSelected","Other skills"]].filter(([key]) => details[key]).map(([,label]) => label).join(", ");
    if (persist([...records, {...details, EOInumber, jobReference: reference, skills, Status: "New", createdAt: new Date().toISOString()}])) {
      announce(`Demonstration application received. Your EOI number is ${EOInumber}; status: New. Saved in this browser only.`);
      message.focus();
    }
  });
  if (filters) {
    filters.addEventListener("submit", event => { event.preventDefault(); render(); });
    filters.addEventListener("reset", () => setTimeout(render, 0));
    document.getElementById("delete-applications").addEventListener("submit", event => {
      event.preventDefault();
      if (!ready) return;
      const data = new FormData(event.currentTarget);
      const reference = String(data.get("jobReference") || "").trim();
      if (!/^[A-Za-z0-9]{5}$/.test(reference) || !data.has("confirmed")) { announce("Enter five letters or digits and confirm deletion."); return; }
      const next = records.filter(row => row.jobReference.toLowerCase() !== reference.toLowerCase());
      const count = records.length - next.length;
      if (persist(next)) { render(); announce(`${count} demonstration applications deleted for ${reference}.`); event.currentTarget.reset(); }
    });
    document.getElementById("reset-demo").addEventListener("click", () => {
      if (!ready) return;
      if (persist(structuredClone(seed))) { filters.reset(); render(); announce("Original fictional demonstration records restored."); }
    });
  }
  fetch("data/eois.json").then(response => {
    if (!response.ok) throw new Error("seed fetch");
    return response.json();
  }).then(data => {
    if (!validRecords(data)) throw new Error("seed format");
    seed = data;
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(KEY)); } catch { /* Use seed without losing the page. */ }
    records = validRecords(stored) ? stored : structuredClone(seed);
    ready = true;
    if (filters) render();
  }).catch(() => announce("Demonstration data could not load. Serve this folder over HTTP and reload the page."));
});
