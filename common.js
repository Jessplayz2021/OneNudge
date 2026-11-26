// OneNudge: shared by every page. Light/dark theme toggle and offline support.

(() => {
  const THEME_KEY = "onenudge.theme";
  const THEME_COLOURS = { dark: "#0c0e14", light: "#f4f7f5" };

  function currentTheme() {
    const chosen = document.documentElement.dataset.theme;
    if (chosen === "light" || chosen === "dark") return chosen;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function updateThemeUi() {
    const theme = currentTheme();
    const next = theme === "light" ? "dark" : "light";
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.setAttribute("aria-label", `Switch to ${next} mode`);
      toggle.title = `Switch to ${next} mode`;
    }
    const icon = document.getElementById("themeIcon");
    if (icon) icon.textContent = theme === "light" ? "☾︎" : "☀︎";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOURS[theme]);
  }

  function toggleTheme() {
    const next = currentTheme() === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* not critical */ }
    updateThemeUi();
  }

  document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
  window.matchMedia?.("(prefers-color-scheme: light)").addEventListener?.("change", updateThemeUi);
  updateThemeUi();

  // Offline support / installable app. Service workers need http(s), so skip when opened as a file.
  if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => { /* the app still works without it */ });
    });
  }
})();
