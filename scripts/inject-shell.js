#!/usr/bin/env node
/* Adds the shared shell (back pill + recently-used tracking) to every tool page. Safe to re-run. */
const fs = require("fs"), path = require("path");
const T = path.join(__dirname, "..", "tools"), TAG = '<!-- ahp-shell --><script src="../../data/tools.js"></script><script src="../../assets/js/hub-shell.js"></script><!-- /ahp-shell -->';
fs.readdirSync(T, {withFileTypes: true}).filter(d => d.isDirectory() && !/^[._]/.test(d.name)).forEach(d => {
  const f = path.join(T, d.name, "index.html"); if (!fs.existsSync(f)) return;
  let h = fs.readFileSync(f, "utf8");
  if (h.includes("<!-- ahp-shell -->")) return console.log("already has shell:", d.name);
  const i = h.lastIndexOf("</body>"); if (i < 0) return console.log("no </body>, skipped:", d.name);
  fs.writeFileSync(f, h.slice(0, i) + TAG + "\n" + h.slice(i)); console.log("injected:", d.name);
});
