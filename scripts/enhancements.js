/* Data Source | Assignment 2 enhancements.
 * 1. Live completion meter using querySelector and form input events.
 * 2. Explicitly enabled application timer, with warning and extension control.
 */
"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#application-form");
  if (!form) return;
  const progress = document.querySelector("#application-progress");
  const caption = document.querySelector("#progress-caption");
  const other = form.elements.namedItem("otherSkillsSelected");
  const notes = form.elements.namedItem("otherSkills");
  function update() {
    notes.required = other.checked;
    const required = [...form.querySelectorAll("[required]:not([type=radio])")];
    const total = required.length + 1;
    const complete = required.filter(el => {
      if (el.id === "dateOfBirth") { const age = DataSourceRules.age(el.value); return age !== null && age >= 15 && age <= 80; }
      if (el.id === "postcode") return DataSourceRules.postcode(form.elements.namedItem("state").value, el.value);
      return Boolean(el.value.trim()) && el.validity.valid;
    }).length + Number(Boolean(form.elements.namedItem("gender").value));
    progress.max = total;
    progress.value = complete;
    caption.textContent = `${complete} of ${total} required fields complete`;
  }
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("reset", () => setTimeout(update, 0));
  update();

  const toggle = document.querySelector("#enable-timer");
  const extend = document.querySelector("#extend-timer");
  const warning = document.querySelector("#timer-warning");
  const clock = document.querySelector("#timer-clock");
  let deadline = 0;
  let interval;
  function stop() {
    clearInterval(interval);
    warning.hidden = true;
    clock.textContent = "Timer off. Take the time you need.";
  }
  function tick() {
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    clock.textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")} remaining`;
    warning.hidden = remaining > 60;
    if (!remaining) { stop(); window.location.assign("index.html"); }
  }
  function start() { deadline = Date.now() + 20 * 60 * 1000; tick(); }
  toggle.addEventListener("change", () => {
    stop();
    if (toggle.checked) { start(); interval = setInterval(tick, 1000); }
  });
  extend.addEventListener("click", start);
  form.addEventListener("datasource:reset", () => { toggle.checked = false; stop(); });
  stop();
});




/* HamburgerElegant responsive drawer adaptation.
 * Original: https://github.com/NikolaosAnestakis/HamburgerElegant/blob/main/menudrawer.html
 * Native dialog adds focus containment, background inertness and Escape support.
 */
document.addEventListener("DOMContentLoaded", () => {
  const opener = document.querySelector("#ds-menu-open");
  const drawer = document.querySelector("#ds-menu-drawer");
  const closer = document.querySelector("#ds-menu-close");
  if (!opener || !drawer || !closer || typeof drawer.showModal !== "function") return;
  document.documentElement.classList.add("ds-menu-ready");
  const mobile = window.matchMedia("(max-width: 1200px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let closing = false;
  let closeTimer;
  // Keep the real branded header visible. Position the modal below it and
  // place its close control over the exact original hamburger rectangle.
  function alignDrawer() {
    const button = opener.getBoundingClientRect();
    const header = opener.closest(".site-header").getBoundingClientRect();
    drawer.style.setProperty("--ds-menu-top", `${Math.max(0, header.bottom)}px`);
    drawer.style.setProperty("--ds-toggle-top", `${button.top}px`);
    drawer.style.setProperty("--ds-toggle-left", `${button.left}px`);
    drawer.style.setProperty("--ds-toggle-width", `${button.width}px`);
    drawer.style.setProperty("--ds-toggle-height", `${button.height}px`);
    closer.style.backgroundColor = getComputedStyle(opener.closest(".site-header")).backgroundColor;
  }
  function reset() {
    window.clearTimeout(closeTimer);
    closing = false;
    drawer.classList.remove("ds-menu-closing");
    opener.setAttribute("aria-expanded", "false");
    opener.classList.remove("open");
    opener.classList.add("closed");
    document.body.classList.remove("ds-menu-open");
    if (mobile.matches) opener.focus();
  }
  opener.addEventListener("click", () => {
    if (!mobile.matches) return;
    opener.classList.remove("closed");
    opener.classList.add("open");
    opener.setAttribute("aria-expanded", "true");
    drawer.showModal();
    document.body.classList.add("ds-menu-open");
    alignDrawer();
    closer.focus();
  });
  function smoothClose(destination) {
    if (closing || !drawer.open) return;
    closing = true;
    drawer.classList.add("ds-menu-closing");
    const finish = () => {
      drawer.close();
      if (destination) window.location.assign(destination);
    };
    if (reducedMotion.matches) finish();
    else closeTimer = window.setTimeout(finish, 260);
  }
  closer.addEventListener("click", () => smoothClose());
  drawer.addEventListener("close", reset);
  drawer.addEventListener("cancel", event => { event.preventDefault(); smoothClose(); });
  drawer.querySelectorAll("a").forEach(link => link.addEventListener("click", event => {
    // Preserve browser shortcuts such as Cmd/Ctrl-click and new-tab links.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    event.preventDefault();
    smoothClose(link.href);
  }));
  mobile.addEventListener("change", () => { if (!mobile.matches && drawer.open) drawer.close(); });
  window.addEventListener("resize", () => { if (drawer.open) alignDrawer(); });
});

