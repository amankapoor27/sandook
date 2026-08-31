export const themeInitScript = `
(function () {
  try {
    var theme = localStorage.getItem("sandook-theme");
    if (theme !== "light" && theme !== "dark") {
      theme = window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }
    document.documentElement.setAttribute("data-site-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-site-theme", "dark");
  }
})();
`;
