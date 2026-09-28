/* AUDIT HUB PRO — portal logic. Everything is generated from window.AHP_REGISTRY (data/tools.js). Developed by Vicky Shaw */
(function () {
"use strict";
var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var R = window.AHP_REGISTRY || { tools: [], categories: {}, stages: [] }, ICONS = window.AHP_ICONS || {};
var DEV = /^(localhost|127\.|\[::1\])/.test(location.hostname) || location.protocol === "file:";
var PH = /your tool name|one or two sentences|lorem ipsum|placeholder/i;

/* ---- registry validation: never render broken or placeholder cards ---- */
var ids = {}, tools = R.tools.filter(function (t) {
  var why = !t.name || !t.url || !t.description ? "missing fields" : PH.test(t.name + " " + t.description) ? "placeholder content" : !R.categories[t.category] ? "invalid category" : ids[t.id] ? "duplicate id" : "";
  if (why) { if (DEV) console.warn("[Audit HUB] tool hidden (" + why + "):", t.folder || t.name); return false; }
  ids[t.id] = 1; return true;
});
var byId = function (id) { return tools.filter(function (t) { return t.id === id; })[0]; };
var cats = Object.keys(R.categories).filter(function (c) { return tools.some(function (t) { return t.category === c; }); });
var catName = function (c) { return R.categories[c] ? R.categories[c].name : c; };

function icon(n, cls) { return '<svg class="i ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[n] || ICONS.wrench || "") + "</svg>"; }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
$$("[data-i]").forEach(function (el) { el.innerHTML = ICONS[el.getAttribute("data-i")] || ""; });

/* ---- local storage helpers (private to this browser) ---- */
function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
var favs = load("ahp-favs", []), recents = load("ahp-recent", []);
function ago(ts) { var m = Math.round((Date.now() - ts) / 60000); if (m < 1) return "Just now"; if (m < 60) return m + " min ago"; var h = Math.round(m / 60); if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago"); var d = Math.round(h / 24); return d === 1 ? "Yesterday" : d + " days ago"; }
function track(id) { recents = recents.filter(function (r) { return r.id !== id; }); recents.unshift({ id: id, t: Date.now() }); recents = recents.slice(0, 8); save("ahp-recent", recents); }
function isNew(t) { return t.badge === "new" || (t.badge === "" && Date.now() - new Date(t.createdDate) < 14 * 864e5); }

/* ---- cards ---- */
function badge(t) { var b = t.badge; return b ? '<span class="bdg ' + b + '">' + b + "</span>" : ""; }
function card(t, big) {
  var f = favs.indexOf(t.id) > -1, soon = t.status !== "active";
  return '<article class="card' + (big ? " big" : "") + '" data-id="' + t.id + '">' +
    '<a class="stretch" href="' + t.url + '" data-launch="' + t.id + '" aria-label="Launch ' + esc(t.name) + '"></a>' +
    '<div class="ct"><div class="ico">' + icon(t.icon) + '</div><div><h3>' + esc(t.name) + '</h3></div>' +
    '<div class="acts"><button class="mini' + (f ? " on" : "") + '" data-fav="' + t.id + '" aria-pressed="' + f + '" aria-label="Favourite ' + esc(t.name) + '" title="Favourite">' + icon("star") + '</button>' +
    '<button class="mini" data-info="' + t.id + '" aria-label="Quick view of ' + esc(t.name) + '" title="Quick view">' + icon("info") + "</button></div></div>" +
    "<p>" + esc(t.description) + "</p>" +
    '<div class="meta"><span class="pill">' + esc(catName(t.category)) + '</span><span>v' + esc(t.version) + '</span><span class="st' + (soon ? " soon" : "") + '">' + (soon ? "Coming soon" : "Live") + "</span>" + badge(t) + "</div>" +
    '<span class="launch">Launch Tool ' + icon("arrow") + "</span></article>";
}
function mini(t, sub) { return '<a class="mini-card" href="' + t.url + '" data-launch="' + t.id + '"><div class="ico">' + icon(t.icon) + '</div><div><b>' + esc(t.name) + "</b><small>" + sub + "</small></div></a>"; }

/* ---- filters ---- */
var cur = "all", favOnly = false;
function visible() { return tools.filter(function (t) { return (cur === "all" || t.category === cur) && (!favOnly || favs.indexOf(t.id) > -1); }); }
function renderAll() {
  var list = visible();
  $("#all").innerHTML = list.map(function (t) { return card(t); }).join("");
  $("#none").hidden = list.length > 0;
  $("#allSub").textContent = (favOnly ? "Your favourites" : cur === "all" ? "Every tool on the platform" : catName(cur)) + " · " + list.length + (list.length === 1 ? " tool" : " tools");
}
function renderCats() {
  var h = '<button class="chip" data-cat="all" aria-pressed="' + (cur === "all") + '">' + icon("grid") + "All Tools <em>" + tools.length + "</em></button>";
  cats.forEach(function (c) { var n = tools.filter(function (t) { return t.category === c; }).length; h += '<button class="chip" data-cat="' + c + '" aria-pressed="' + (cur === c) + '">' + icon(R.categories[c].icon) + esc(catName(c)) + " <em>" + n + "</em></button>"; });
  $("#catBar").innerHTML = h;
}

/* ---- static-but-generated sections ---- */
function renderStatic() {
  var pw = tools.filter(function (t) { return t.featured; }).sort(function (a, b) { return b.popularity - a.popularity; });
  $("#powerGrid").innerHTML = pw.map(function (t) { return card(t, true); }).join("");
  var recent = tools.slice().sort(function (a, b) { return (b.updatedDate + b.createdDate).localeCompare(a.updatedDate + a.createdDate) || b.popularity - a.popularity; }).slice(0, 4);
  $("#recentAdded").innerHTML = recent.map(function (t) { return mini(t, (isNew(t) ? "NEW · " : "") + esc(t.updatedDate)); }).join("");
  var used = recents.map(function (r) { return { t: byId(r.id), at: r.t }; }).filter(function (x) { return x.t; }).slice(0, 5);
  $("#usedTitle").textContent = used.length ? "Continue where you left off" : "Recently Used";
  $("#recentUsed").innerHTML = used.length ? used.map(function (x) { return mini(x.t, "Opened " + ago(x.at).toLowerCase()); }).join("") : '<div class="empty">Tools you open will show up here. This stays only in your browser.</div>';
  var favT = favs.map(byId).filter(Boolean);
  var s = [[tools.length + "+", "Tools"], [cats.length, "Categories"], ["100%", "Free"], ["24/7", "Available"]];
  $("#stats").innerHTML = s.map(function (x) { return '<div class="stat"><b>' + x[0] + "</b><span>" + x[1] + "</span></div>"; }).join("");
  var INT = [["📦", "Verify Inventory", "Perform barcode-level stock verification", "inventory-verification"], ["📊", "Analyse Audit Data", "Turn Excel data into actionable insights", "retailiq"], ["📑", "Create Reports", "Generate professional audit reports", "reportiq"], ["🧾", "Calculate GST", "Calculate CGST, SGST and IGST", "gst-breakup"], ["💰", "Analyse Finance", "Calculate receivables and profitability", "invoice-receivable"], ["🏷", "Generate QR / Barcodes", "Create operational labels and codes", "qr-barcode-studio"], ["🛣", "Plan Travel", "Plan field audit travel efficiently", "travel-planner"]];
  $("#intents").innerHTML = INT.filter(function (x) { return byId(x[3]); }).map(function (x) { var t = byId(x[3]); return '<a class="intent" href="' + t.url + '" data-launch="' + t.id + '"><span class="e" aria-hidden="true">' + x[0] + "</span><b>" + x[1] + "</b><span>" + x[2] + "</span></a>"; }).join("");
  var LBL = { prepare: "Prepare", scan: "Scan & Verify", analyze: "Analyze", reconcile: "Reconcile", report: "Report", decide: "Decide" };
  $("#flow").innerHTML = R.stages.map(function (st, i) {
    var ts = tools.filter(function (t) { return (t.stages || []).indexOf(st) > -1; });
    return '<div class="step"><div class="num">0' + (i + 1) + "</div><h3>" + LBL[st] + "</h3><ul>" + ts.map(function (t) { return '<li><a href="' + t.url + '" data-launch="' + t.id + '">' + esc(t.name) + "</a></li>"; }).join("") + "</ul></div>";
  }).join("");
  $("#areas").innerHTML = ["Inventory Audit", "Retail Operations", "Audit Analytics", "Finance", "GST", "Reporting", "Field Operations", "Productivity"].map(function (a) { return '<span class="chip">' + a + "</span>"; }).join("");
  function fl(id, cs) { $(id).innerHTML = tools.filter(function (t) { return cs.indexOf(t.category) > -1; }).map(function (t) { return '<li><a href="' + t.url + '" data-launch="' + t.id + '">' + esc(t.name) + "</a></li>"; }).join(""); }
  fl("#fAudit", ["audit", "inventory"]); fl("#fAnalytics", ["analytics", "reporting", "finance"]); fl("#fUtil", ["gst", "utilities", "operations"]);
  $$("[data-count=tools]").forEach(function (e) { e.textContent = tools.length; });
  $("#yr").textContent = new Date().getFullYear();
}

/* ---- animations (light, respect reduced motion) ---- */
var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
function countUp(el) {
  var to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, suf = el.dataset.suf || "", sep = el.dataset.sep, t0 = performance.now();
  function fmt(v) { v = v.toFixed(dec); return (sep ? Number(v).toLocaleString("en-IN") : v) + suf; }
  if (RM) { el.textContent = fmt(to); return; }
  (function tick(n) { var p = Math.min(1, (n - t0) / 1400); el.textContent = fmt(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0);
}
$$("[data-to]").forEach(countUp);
$$(".bar i").forEach(function (b) { b.style.setProperty("--w", b.dataset.w + "%"); setTimeout(function () { b.style.width = b.dataset.w + "%"; }, 200); });
if ("IntersectionObserver" in window) { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .08 }); $$(".reveal").forEach(function (e) { io.observe(e); }); }
else $$(".reveal").forEach(function (e) { e.classList.add("in"); });

/* ---- modals (focus trap, ESC, restore focus) ---- */
var lastFocus = null;
function openOv(ov) { lastFocus = document.activeElement; ov.classList.add("open"); document.body.style.overflow = "hidden"; }
function closeOv() { $$(".ov.open").forEach(function (o) { o.classList.remove("open"); }); document.body.style.overflow = ""; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
$$(".ov").forEach(function (o) { o.addEventListener("mousedown", function (e) { if (e.target === o) closeOv(); }); });

/* command palette */
var sel = 0, results = [];
function score(t, q) {
  var hay = [t.name, t.code, t.category, catName(t.category), t.description, (t.tags || []).join(" ")].join(" ").toLowerCase(), s = 0;
  return q.split(/\s+/).every(function (w) { var i = hay.indexOf(w); if (i < 0) return false; s += t.name.toLowerCase().indexOf(w) > -1 ? 3 : (t.tags || []).join(" ").toLowerCase().indexOf(w) > -1 ? 2 : 1; return true; }) ? s : 0;
}
function drawPalette() {
  var q = $("#pq").value.trim().toLowerCase();
  results = q ? tools.map(function (t) { return { t: t, s: score(t, q) }; }).filter(function (x) { return x.s; }).sort(function (a, b) { return b.s - a.s || b.t.popularity - a.t.popularity; }).map(function (x) { return x.t; }) : tools.slice().sort(function (a, b) { return b.popularity - a.popularity; });
  sel = 0;
  $("#plist").innerHTML = results.length ? results.map(function (t, i) { return '<button class="pi" role="option" id="po' + i + '" aria-selected="' + (i === 0) + '" data-i="' + i + '"><div class="ico">' + icon(t.icon) + "</div><div><b>" + esc(t.name) + "</b><small>" + esc(t.description) + '</small></div><span class="cat">' + esc(catName(t.category)) + "</span></button>"; }).join("") : '<div class="empty" style="border:0">No tools found for "' + esc(q) + '"</div>';
}
function move(d) { if (!results.length) return; sel = (sel + d + results.length) % results.length; $$(".pi").forEach(function (p, i) { p.setAttribute("aria-selected", i === sel); if (i === sel) { p.scrollIntoView({ block: "nearest" }); $("#pq").setAttribute("aria-activedescendant", p.id); } }); }
function launch(t) { track(t.id); location.href = t.url; }
function openPalette() { closeOv(); openOv($("#palette")); $("#pq").value = ""; drawPalette(); setTimeout(function () { $("#pq").focus(); }, 30); }
$("#pq").addEventListener("input", drawPalette);
$("#plist").addEventListener("click", function (e) { var b = e.target.closest(".pi"); if (b) launch(results[+b.dataset.i]); });
$("#palette").addEventListener("keydown", function (e) { if (e.key === "ArrowDown") { e.preventDefault(); move(1); } else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); } else if (e.key === "Enter" && results[sel]) { e.preventDefault(); launch(results[sel]); } });

/* quick view */
function quick(id) {
  var t = byId(id); if (!t) return; var li = function (a) { return (a || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join(""); };
  $("#qvBody").innerHTML = '<div class="meta" style="margin-bottom:8px"><span class="pill">' + esc(catName(t.category)) + "</span><span>v" + esc(t.version) + "</span><span>" + esc(t.code) + "</span>" + badge(t) + '</div><h3 id="qvTitle">' + esc(t.name) + '</h3><p style="color:var(--muted)">' + esc(t.description) + "</p>" +
    (t.capabilities.length ? "<h5>Capabilities</h5><ul>" + li(t.capabilities) + "</ul>" : "") + (t.bestFor.length ? "<h5>Best used for</h5><ul>" + li(t.bestFor) + "</ul>" : "") +
    '<div style="display:flex;gap:10px;margin-top:18px"><a class="btn pri" href="' + t.url + '" data-launch="' + t.id + '">Launch Tool ' + icon("arrow", "go") + '</a><button class="btn" data-close>Close</button></div>';
  openOv($("#quick")); $("#qvBody .btn").focus();
}
document.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); }
  else if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName) && !$(".ov.open")) { e.preventDefault(); openPalette(); }
  else if (e.key === "Escape") closeOv();
  else if (e.key === "Tab" && $(".ov.open")) { var f = $$("button,a[href],input", $(".ov.open")).filter(function (x) { return x.offsetParent; }); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
});
["#openSearch", "#heroSearch"].forEach(function (s) { $(s).addEventListener("click", openPalette); });

/* clicks: launch tracking, favourites, info, categories */
document.addEventListener("click", function (e) {
  var l = e.target.closest("[data-launch]"); if (l) track(l.dataset.launch);
  var f = e.target.closest("[data-fav]");
  if (f) { var id = f.dataset.fav, i = favs.indexOf(id); if (i > -1) favs.splice(i, 1); else favs.push(id); save("ahp-favs", favs); $$('[data-fav="' + id + '"]').forEach(function (b) { var on = favs.indexOf(id) > -1; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); }); if (favOnly) renderAll(); return; }
  var inf = e.target.closest("[data-info]"); if (inf) return quick(inf.dataset.info);
  var c = e.target.closest("[data-cat]"); if (c) { cur = c.dataset.cat; favOnly = false; $("#favOnly").setAttribute("aria-pressed", "false"); renderCats(); renderAll(); return; }
  if (e.target.closest("[data-close]")) closeOv();
});
$("#favOnly").addEventListener("click", function () { favOnly = !favOnly; this.setAttribute("aria-pressed", favOnly); if (favOnly) cur = "all"; renderCats(); renderAll(); if (favOnly && !favs.length) $("#none").textContent = "No favourites yet. Tap the star on any tool to add it here."; else $("#none").textContent = "No tools match. Try another keyword or category."; });

/* theme + mobile nav */
$("#themeToggle").addEventListener("click", function () { var n = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"; document.documentElement.setAttribute("data-theme", n); try { localStorage.setItem("ahp-theme", n); } catch (e) {} });
$("#burger").addEventListener("click", function () { var o = $("#links").classList.toggle("open"); this.setAttribute("aria-expanded", o); });
$$("#links a").forEach(function (a) { a.addEventListener("click", function () { $("#links").classList.remove("open"); }); });
window.addEventListener("pageshow", function () { recents = load("ahp-recent", []); renderStatic(); });

renderCats(); renderAll(); renderStatic();
if (DEV) console.info("[Audit HUB] " + tools.length + " tools, " + cats.length + " categories loaded.");
})();
