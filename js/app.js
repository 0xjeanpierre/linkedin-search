"use strict";

// Tema: respeita a escolha salva; sem escolha, o padrão é o claro.
const THEME_KEY = "li_theme";
const savedTheme = () => { try { return localStorage.getItem(THEME_KEY); } catch { return null; } };
const currentTheme = () => savedTheme() || "light";

function applyTheme() {
  const t = currentTheme();
  document.documentElement.dataset.bsTheme = t;
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = t === "dark" ? "☀ Claro" : "🌙 Escuro";
}

function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  try { localStorage.setItem(THEME_KEY, next); } catch { /* sem armazenamento: vale só nesta sessão */ }
  document.documentElement.dataset.bsTheme = next;
  applyTheme();
}

applyTheme();

const $ = id => document.getElementById(id);
const BASE_URL = "https://www.linkedin.com/jobs/search/?";
const STORAGE_KEY = "li_saved_searches";
const DEFAULT_GEO = "106057199";
const DRAFT_KEY = "li_draft";
const HISTORY_KEY = "li_history";

/* ---------- helpers ---------- */
const checked = id => [...$(id).querySelectorAll("input:checked")].map(i => i.value);
const splitList = v => v.split(",").map(s => s.trim()).filter(Boolean);
const quote = t => (/\s/.test(t) && !/^".*"$/.test(t) ? `"${t}"` : t);
const say = text => { $("msg").textContent = text; };

/* ---------- URL building ---------- */
function buildKeywords() {
  const terms = [$("kw").value.trim(), ...splitList($("kwOr").value).map(quote)].filter(Boolean);
  const nots = splitList($("kwNot").value).map(quote);
  let q = terms.join(" OR ");
  if (nots.length) {
    if (terms.length > 1) q = `(${q})`;
    q += nots.map(n => ` NOT ${n}`).join("");
  }
  return q.trim();
}

const BOOL_FLAGS = [["easy", "f_AL"], ["fea", "f_EA"], ["fvj", "f_VJ"], ["fjiyn", "f_JIYN"]];
const CHECK_GROUPS = [["wt", "f_WT"], ["exp", "f_E"], ["jt", "f_JT"]];
const ID_FIELDS = [["fc", "f_C"], ["fi", "f_I"], ["fjc", "f_JC"], ["fpp", "f_PP"]];

function buildUrl() {
  const p = new URLSearchParams();
  const set = (k, v) => { if (v) p.set(k, v); };

  set("keywords", buildKeywords());
  set("location", $("loc").value.trim());
  set("distance", $("dist").value);

  set("geoId", $("geo").value === "custom" ? $("geoC").value.trim() : $("geo").value);

  const tpr = $("tpr").value === "custom" ? "r" + (parseInt($("tprC").value, 10) || 0) : $("tpr").value;
  if (tpr !== "r0") set("f_TPR", tpr);

  CHECK_GROUPS.forEach(([id, key]) => set(key, checked(id).join(",")));
  BOOL_FLAGS.forEach(([id, key]) => { if ($(id).checked) p.set(key, "true"); });
  set("f_SB2", $("sal").value);
  ID_FIELDS.forEach(([id, key]) => set(key, splitList($(id).value).join(",")));

  const start = parseInt($("start").value, 10);
  if (start > 0) p.set("start", start);
  p.set("sortBy", $("sort").value);

  return BASE_URL + p.toString().replace(/%2C/g, ",");
}

// Conta filtros preenchidos no grupo avançado e mostra no selo.
function advancedActive() {
  return [...document.querySelectorAll("#advanced input, #advanced select")]
    .filter(e => (e.type === "checkbox" ? e.checked : e.value !== "")).length;
}

function syncAdvanced(openIfActive = false) {
  const n = advancedActive();
  const badge = $("advBadge");
  badge.textContent = n === 1 ? "1 ativo" : `${n} ativos`;
  badge.classList.toggle("d-none", n === 0);
  if (openIfActive && n > 0) bootstrap.Collapse.getOrCreateInstance($("c-advanced"), { toggle: false }).show();
}

function update() {
  $("geoWrap").classList.toggle("d-none", $("geo").value !== "custom");
  $("tprWrap").classList.toggle("d-none", $("tpr").value !== "custom");
  const url = buildUrl();
  $("out").textContent = url;
  document.querySelectorAll("[data-action=open]").forEach(a => { a.href = url; });
  syncAdvanced();
  saveDraft();
}

/* ---------- actions ---------- */
async function copyUrl() {
  try {
    await navigator.clipboard.writeText(buildUrl());
    addHistory(buildUrl());
    say("URL copiada.");
  } catch {
    const range = document.createRange();
    range.selectNodeContents($("out"));
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    addHistory(buildUrl());
    say("Selecionei a URL, use Ctrl+C para copiar.");
  }
}

function resetForm() {
  document.querySelectorAll("input[type=checkbox]").forEach(c => { c.checked = false; });
  document.querySelectorAll("#filterNav input[type=number], #basic input[type=text], #basic input[type=number], #advanced input[type=text], #advanced input[type=number]")
    .forEach(i => { i.value = ""; });
  $("dist").value = "";
  $("sal").value = "";
  $("geo").value = DEFAULT_GEO;
  $("tpr").value = "";
  $("sort").value = "DD";
  update();
}

/* ---------- estado dos filtros ---------- */
// Cada controle é identificado pelo próprio id (ex.: {kw:"devops", wt2:true}).
const formControls = () =>
  [...document.querySelectorAll("#filterNav input, #filterNav select, #basic input, #basic select, #advanced input, #advanced select")];
const snapshot = () =>
  Object.fromEntries(formControls().map(e => [e.id, e.type === "checkbox" ? e.checked : e.value]));

function restore(state) {
  formControls().forEach(e => {
    if (!(e.id in state)) return;
    if (e.type === "checkbox") e.checked = !!state[e.id];
    else e.value = state[e.id];
  });
  update();
  syncAdvanced(true);
}

// Buscas salvas na versão antiga eram uma lista posicional ({v:[...]}).
const LEGACY_ORDER = ["kw", "kwOr", "kwNot", "geo", "geoC", "loc", "dist", "tpr", "tprC",
  "wt1", "wt2", "wt3", "exp1", "exp2", "exp3", "exp4", "exp5", "exp6",
  "jtF", "jtP", "jtC", "jtT", "jtI", "jtV", "jtO", "sort", "easy", "fea", "fvj", "fjiyn",
  "sal", "start", "fc", "fi", "fjc", "fpp"];
const legacyToState = values =>
  Object.fromEntries(LEGACY_ORDER.map((id, i) => [id, values[i]]).filter(([, v]) => v !== undefined));

/* ---------- buscas salvas (localStorage) ---------- */
function loadSaved() {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return list.map(i => (i.s ? i : { name: i.name, s: legacyToState(i.v || []) }));
  } catch { return []; }
}

function storeSaved(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    say("Não foi possível salvar neste navegador.");
    return false;
  }
}

function smallButton(label, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "btn btn-sm btn-outline-primary";
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

function renderSaved() {
  const saved = loadSaved();
  const ul = $("list");
  ul.replaceChildren();

  if (!saved.length) {
    const li = document.createElement("li");
    li.className = "list-group-item";
    const s = document.createElement("small");
    s.textContent = "Nenhuma busca salva ainda.";
    li.appendChild(s);
    ul.appendChild(li);
    return;
  }

  saved.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    const name = document.createElement("span");
    name.textContent = item.name;
    li.append(
      name,
      smallButton("Carregar", () => { restore(item.s); say("Busca carregada."); }),
      smallButton("Excluir", () => {
        const next = loadSaved();
        next.splice(i, 1);
        storeSaved(next);
        renderSaved();
      })
    );
    ul.appendChild(li);
  });
}

function saveCurrent() {
  const name = $("sname").value.trim() || buildKeywords() || "Busca sem nome";
  const list = loadSaved().filter(s => s.name !== name);
  list.push({ name, s: snapshot() });
  if (storeSaved(list)) {
    $("sname").value = "";
    say("Busca salva.");
  }
  renderSaved();
}

/* ---------- rascunho automático ---------- */
function saveDraft() {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(snapshot())); } catch { /* ignora */ }
}

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { return null; }
}

/* ---------- link compartilhável (#f=...) ---------- */
const encodeState = st => btoa(unescape(encodeURIComponent(JSON.stringify(st))))
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const decodeState = str => JSON.parse(decodeURIComponent(escape(atob(str.replace(/-/g, "+").replace(/_/g, "/")))));

function stateFromHash() {
  const m = location.hash.match(/^#f=(.+)$/);
  if (!m) return null;
  try { return decodeState(m[1]); } catch { return null; }
}

async function copyShareLink() {
  const link = `${location.origin}${location.pathname}#f=${encodeState(snapshot())}`;
  try {
    await navigator.clipboard.writeText(link);
    say("Link da busca copiado. Quem abrir verá os mesmos filtros.");
  } catch {
    prompt("Copie o link:", link);
  }
}

/* ---------- histórico de URLs (sem limite) ---------- */
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; }
}

function storeHistory(list) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); return true; } catch {
    say("Não foi possível gravar o histórico neste navegador.");
    return false;
  }
}

// Uma URL repetida sobe para o topo com a data atualizada, sem duplicar.
function addHistory(url) {
  const list = loadHistory().filter(h => h.url !== url);
  list.unshift({ url, t: Date.now(), s: snapshot() });
  storeHistory(list);
  renderHistory();
}

function historyButton(label, onClick) {
  const b = smallButton(label, onClick);
  b.classList.add("flex-shrink-0");
  return b;
}

function renderHistory() {
  const list = loadHistory();
  const ul = $("historyList");
  ul.replaceChildren();
  $("historyCount").textContent = list.length ? `(${list.length})` : "";
  $("historyClear").disabled = !list.length;

  if (!list.length) {
    const li = document.createElement("li");
    li.className = "list-group-item";
    const s = document.createElement("small");
    s.textContent = "Nenhuma URL no histórico ainda.";
    li.appendChild(s);
    ul.appendChild(li);
    return;
  }

  const frag = document.createDocumentFragment();
  list.forEach(item => {
    const li = document.createElement("li");
    li.className = "list-group-item li-history-item";

    const info = document.createElement("div");
    info.className = "li-history-info";
    const when = document.createElement("small");
    when.className = "text-body-secondary d-block";
    when.textContent = new Date(item.t).toLocaleString("pt-BR");
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = item.url;
    info.append(when, link);

    const actions = document.createElement("div");
    actions.className = "d-flex flex-wrap gap-1";
    actions.append(
      historyButton("Copiar", async () => {
        try { await navigator.clipboard.writeText(item.url); say("URL copiada do histórico."); }
        catch { prompt("Copie a URL:", item.url); }
      }),
      historyButton("Carregar filtros", () => { if (item.s) restore(item.s); say("Filtros carregados."); }),
      historyButton("Excluir", () => {
        storeHistory(loadHistory().filter(h => h.url !== item.url));
        renderHistory();
      })
    );

    li.append(info, actions);
    frag.appendChild(li);
  });
  ul.appendChild(frag);
}

/* ---------- exportar / importar JSON ---------- */
function exportSaved() {
  const blob = new Blob([JSON.stringify(loadSaved(), null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "buscas-linkedin.json";
  a.click();
  URL.revokeObjectURL(a.href);
  say("Arquivo exportado.");
}

async function importSaved(file) {
  try {
    const incoming = JSON.parse(await file.text());
    if (!Array.isArray(incoming)) throw new Error("formato");
    const clean = incoming
      .filter(i => i && typeof i.name === "string" && i.s && typeof i.s === "object")
      .map(i => ({ name: i.name, s: i.s }));
    const names = new Set(clean.map(i => i.name));
    const merged = [...loadSaved().filter(i => !names.has(i.name)), ...clean];
    if (storeSaved(merged)) say(`${clean.length} busca(s) importada(s).`);
    renderSaved();
  } catch {
    say("Arquivo inválido.");
  }
}

/* ---------- init ---------- */
document.querySelectorAll("input, select").forEach(e => {
  e.addEventListener("input", update);
  e.addEventListener("change", update);
});
document.querySelectorAll("[data-action=copy]").forEach(b => b.addEventListener("click", copyUrl));
document.querySelectorAll("[data-action=open]").forEach(a => a.addEventListener("click", () => addHistory(buildUrl())));
document.querySelectorAll("[data-action=reset]").forEach(b => b.addEventListener("click", resetForm));
document.getElementById("themeToggle").addEventListener("click", toggleTheme);
applyTheme();
const panels = () => document.querySelectorAll("#blocks .accordion-collapse, #c-advanced");
$("expandAll").addEventListener("click", () => panels().forEach(p => bootstrap.Collapse.getOrCreateInstance(p, { toggle: false }).show()));
$("collapseAll").addEventListener("click", () => panels().forEach(p => bootstrap.Collapse.getOrCreateInstance(p, { toggle: false }).hide()));
$("save").addEventListener("click", saveCurrent);

$("historyClear").addEventListener("click", () => {
  if (confirm("Apagar todo o histórico de URLs?")) { storeHistory([]); renderHistory(); }
});
$("share").addEventListener("click", copyShareLink);
$("export").addEventListener("click", exportSaved);
$("import").addEventListener("change", e => { if (e.target.files[0]) importSaved(e.target.files[0]); e.target.value = ""; });

renderSaved();
renderHistory();
const initial = stateFromHash() || loadDraft();
if (initial) restore(initial); else update();
