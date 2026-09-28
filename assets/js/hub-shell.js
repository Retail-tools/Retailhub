/* AUDIT HUB PRO — shared tool-page shell: a small "Back to Audit HUB Pro" pill + records the tool in "recently used".
   Does not touch the tool's own layout, styles or theme. Injected by scripts/inject-shell.js. */
(function () {
  try {
    var m = location.pathname.match(/\/tools\/([^\/]+)\//), R = window.AHP_REGISTRY;
    if (m && R) { var f = decodeURIComponent(m[1]), t = R.tools.filter(function (x) { return x.folder === f; })[0];
      if (t) { var r = JSON.parse(localStorage.getItem("ahp-recent") || "[]").filter(function (x) { return x.id !== t.id; }); r.unshift({ id: t.id, t: Date.now() }); localStorage.setItem("ahp-recent", JSON.stringify(r.slice(0, 8))); } }
  } catch (e) {}
  function add() {
    if (document.getElementById("ahp-back")) return;
    var s = document.createElement("style");
    s.textContent = "#ahp-back{position:fixed;left:14px;bottom:14px;z-index:2147483000;display:flex;align-items:center;gap:8px;padding:8px 14px 8px 10px;border-radius:99px;background:#0a1428;color:#fff;font:600 12.5px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.14);opacity:.92;transition:transform .15s,opacity .15s}#ahp-back:hover{opacity:1;transform:translateY(-2px)}#ahp-back svg{width:15px;height:15px;fill:none;stroke:#34d399;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}@media print{#ahp-back{display:none}}";
    document.head.appendChild(s);
    var a = document.createElement("a"); a.id = "ahp-back"; a.href = "../../index.html"; a.title = "Back to Audit HUB Pro";
    a.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>Audit HUB Pro';
    document.body.appendChild(a);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add); else add();
})();
