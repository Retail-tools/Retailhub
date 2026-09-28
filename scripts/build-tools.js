#!/usr/bin/env node
/* AUDIT HUB PRO — build script
   Scans tools/<folder>/tool.json, validates every manifest and writes data/tools.js.
   Usage:  node scripts/build-tools.js [--strict]      (--strict exits 1 on any error, for CI)
   Folders starting with "_" or "." (e.g. _template) are ignored. Developed by Vicky Shaw */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), TOOLS = path.join(ROOT, "tools"), OUT = path.join(ROOT, "data", "tools.js");
const ICONS = require(path.join(ROOT, "assets", "js", "icons.js"));
const STRICT = process.argv.includes("--strict");

const CATEGORIES = {
  audit:{name:"Audit",icon:"clipboard"}, inventory:{name:"Inventory",icon:"box"}, analytics:{name:"Analytics",icon:"chart"},
  reporting:{name:"Reporting",icon:"report"}, finance:{name:"Finance",icon:"coins"}, gst:{name:"GST",icon:"percent"},
  operations:{name:"Operations",icon:"truck"}, utilities:{name:"Utilities",icon:"wrench"}
};
const STAGES = ["prepare","scan","analyze","reconcile","report","decide"];
const BADGES = ["", "new", "updated", "popular", "featured"];
const PLACEHOLDER = /your tool name|one or two sentences|lorem ipsum|todo|placeholder/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const errors = [], warnings = [], tools = [];
const err = (f, m) => errors.push(`${f}: ${m}`), warn = (f, m) => warnings.push(`${f}: ${m}`);

if (!fs.existsSync(TOOLS)) { console.error("No tools/ folder found."); process.exit(1); }
const folders = fs.readdirSync(TOOLS, {withFileTypes:true}).filter(d => d.isDirectory() && !/^[._]/.test(d.name)).map(d => d.name).sort();
const seenId = {}, seenName = {};

for (const f of folders) {
  const mf = path.join(TOOLS, f, "tool.json");
  if (!fs.existsSync(path.join(TOOLS, f, "index.html"))) { err(f, "missing index.html"); continue; }
  if (!fs.existsSync(mf)) { err(f, "missing tool.json (folder exists but is not listed)"); continue; }
  let m; try { m = JSON.parse(fs.readFileSync(mf, "utf8")); } catch (e) { err(f, "tool.json is not valid JSON: " + e.message); continue; }
  const bad = [];
  ["name","description","category"].forEach(k => { if (!m[k] || typeof m[k] !== "string") bad.push(`"${k}" is required`); });
  if (m.name && PLACEHOLDER.test(m.name)) bad.push(`placeholder name "${m.name}"`);
  if (m.description && PLACEHOLDER.test(m.description)) bad.push("placeholder description");
  if (m.category && !CATEGORIES[m.category]) bad.push(`invalid category "${m.category}" (use: ${Object.keys(CATEGORIES).join(", ")})`);
  if (m.badge && !BADGES.includes(m.badge)) bad.push(`invalid badge "${m.badge}"`);
  const id = m.id || f.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (seenId[id]) bad.push(`duplicate id "${id}" (also ${seenId[id]})`);
  if (m.name && seenName[m.name.toLowerCase()]) bad.push(`duplicate name "${m.name}" (also ${seenName[m.name.toLowerCase()]})`);
  if (bad.length) { bad.forEach(b => err(f, b)); continue; }
  seenId[id] = f; seenName[m.name.toLowerCase()] = f;
  if (m.icon && !ICONS[m.icon]) warn(f, `unknown icon "${m.icon}", using default`);
  ["createdDate","updatedDate"].forEach(k => { if (m[k] && !DATE.test(m[k])) warn(f, `${k} should be YYYY-MM-DD`); });
  const stages = (m.stages || []).filter(s => STAGES.includes(s));
  if ((m.stages || []).length !== stages.length) warn(f, `unknown workflow stage (use: ${STAGES.join(", ")})`);
  if (!m.tags || !m.tags.length) warn(f, "no tags: search will only match name, description and category");
  const created = DATE.test(m.createdDate || "") ? m.createdDate : new Date().toISOString().slice(0, 10);
  tools.push({
    id, code: null, folder: f, url: `tools/${f}/index.html`, name: m.name, description: m.description, category: m.category,
    icon: ICONS[m.icon] ? m.icon : "wrench", version: String(m.version || "1.0"), status: m.status === "coming-soon" ? "coming-soon" : "active",
    featured: !!m.featured, badge: m.badge || "", tags: m.tags || [], capabilities: m.capabilities || [], bestFor: m.bestFor || [], stages,
    popularity: Number(m.popularity) || 0, createdDate: created, updatedDate: DATE.test(m.updatedDate || "") ? m.updatedDate : created,
    order: typeof m.order === "number" ? m.order : 9999
  });
}
tools.sort((a, b) => a.order - b.order || a.folder.localeCompare(b.folder));
tools.forEach((t, i) => { t.code = "AH-" + String(i + 1).padStart(2, "0"); delete t.order; });

// what changed since the last build
let prev = []; try { const s = fs.readFileSync(OUT, "utf8"); prev = [...s.matchAll(/"folder":\s*"([^"]+)"/g)].map(x => x[1]); } catch (e) {}
const now = tools.map(t => t.folder);
const added = now.filter(x => !prev.includes(x)), removed = prev.filter(x => !now.includes(x));

const counts = {}; tools.forEach(t => counts[t.category] = (counts[t.category] || 0) + 1);
const registry = { generated: new Date().toISOString(), config: { name: "Audit HUB Pro", version: "6.0", author: "Vicky Shaw" },
  categories: CATEGORIES, stages: STAGES, tools };
fs.writeFileSync(OUT, `/* AUTO-GENERATED by scripts/build-tools.js. Do not hand-edit; edit tools/<folder>/tool.json and re-run the build. */\nwindow.AHP_REGISTRY = ${JSON.stringify(registry, null, 1)};\n`);

console.log(`\n✓ data/tools.js written: ${tools.length} tools, ${Object.keys(counts).length} categories`);
console.log("  " + Object.entries(counts).map(([k, v]) => `${CATEGORIES[k].name} ${v}`).join(" · "));
if (added.length) console.log("  + added:   " + added.join(", "));
if (removed.length) console.log("  - removed: " + removed.join(", "));
if (warnings.length) { console.log("\n⚠ Warnings"); warnings.forEach(w => console.log("  - " + w)); }
if (errors.length) { console.log("\n✗ Errors (these tools are NOT shown on the site)"); errors.forEach(e => console.log("  - " + e)); }
console.log("");
if (errors.length && STRICT) process.exit(1);
