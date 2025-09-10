import { els, state } from "./state.js";
import { selectSet } from "./cards.js";
import { debounce } from "./utils.js";

const CACHE_KEY = "pokemon_sets_cache";
const CACHE_TTL = 1000 * 60 * 30; // 30 minuti

// ---- CACHE ----
function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (Date.now() - obj.timestamp > CACHE_TTL) return null;
    return obj;
  } catch (e) {
    console.warn("Cache non valida", e);
    return null;
  }
}

function saveCache(data, totalPages) {
  const payload = {
    timestamp: Date.now(),
    sets: data,
    totalPages
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

// ---- FETCH ----
async function fetchSetsPage(page, pageSize) {
  els.status.textContent = `Carico set (pagina ${page})…`;
  const res = await fetch(`https://api.pokemontcg.io/v2/sets?page=${page}&pageSize=${pageSize}`);
  const data = await res.json();
  return {
    sets: data.data || [],
    totalCount: data.totalCount || 0
  };
}

// ---- INIT ----
export async function initSets() {
  bindUI(); // attiva subito i listener

  const cached = loadCache();
  if (cached) {
    state.sets = cached.sets;
    state.totalPagesSets = cached.totalPages;
    applySetFilters();
    els.status.textContent = `Caricati da cache (${state.sets.length} set)`;
  } else {
    await loadSetsPage(1); // prima pagina da API
  }
}

// ---- UI BIND ----
function bindUI() {
  els.setSearch.addEventListener("input", debounce(applySetFilters, 200));
  els.orderBy.addEventListener("change", applySetFilters);
}

// ---- CARICA E RENDER ----
export async function loadSetsPage(page) {
  const { sets, totalCount } = await fetchSetsPage(page, state.pageSizeSets);

  if (page === 1) {
    state.sets = sets;
  } else {
    state.sets = [...state.sets, ...sets];
  }

  state.filteredSets = [...state.sets];
  state.totalPagesSets = Math.ceil(totalCount / state.pageSizeSets);
  state.currentPageSets = page;

  applySetFilters();
  saveCache(state.sets, state.totalPagesSets);

  els.status.textContent = `${state.sets.length}/${totalCount} set caricati`;
}

// ---- FILTRI ----
function applySetFilters() {
  const q = els.setSearch.value.trim().toLowerCase();
  let arr = [...state.sets];
  switch (els.orderBy.value) {
    case "releaseDateAsc": arr.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate)); break;
    case "nameAsc": arr.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "nameDesc": arr.sort((a, b) => b.name.localeCompare(a.name)); break;
    default: arr.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  }
  if (q) {
    arr = arr.filter(s =>
      (s.name || "").toLowerCase().includes(q) ||
      (s.series || "").toLowerCase().includes(q)
    );
  }
  state.filteredSets = arr;
  renderSets();
}

// ---- RENDER SET ----
function renderSets() {
  const tpl = document.getElementById("setCardTpl");
  els.sets.innerHTML = "";

  const start = (state.currentPageSets - 1) * state.pageSizeSets;
  const end = start + state.pageSizeSets;
  const pageSets = state.filteredSets.slice(start, end);

  pageSets.forEach(s => {
    const n = tpl.content.firstElementChild.cloneNode(true);
    const logoImg = n.querySelector(".logo");
    logoImg.src = s.images?.symbol || "";
    logoImg.loading = "lazy";

    n.querySelector(".name").textContent = s.name;
    n.querySelector(".meta").textContent = `${s.series} • ${s.releaseDate}`;
    n.querySelector(".count").textContent = `${s.total || 0} carte`;
    n.addEventListener("click", () => selectSet(s));
    els.sets.appendChild(n);
  });

  renderSetsPagination();
}

// ---- PAGINAZIONE ----
function renderSetsPagination() {
  const paginationEl = document.getElementById("paginationSets");
  if (!paginationEl) return;

  paginationEl.innerHTML = "";
  const totalPages = state.totalPagesSets;

  const btn = (label, page, disabled = false) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.disabled = disabled;
    b.className = "px-0 py-1 border rounded m-1";
    b.addEventListener("click", async () => {
      if (page < 1 || page > state.totalPagesSets) return;
      state.currentPageSets = page;

      // se non ho ancora i dati da API per questa pagina, li carico
      if ((state.sets.length / state.pageSizeSets) < page) {
        await loadSetsPage(page);
      } else {
        renderSets();
      }
    });
    return b;
  };

  paginationEl.appendChild(btn("Inizio", 1, state.currentPageSets === 1));
  paginationEl.appendChild(btn("<", state.currentPageSets - 1, state.currentPageSets === 1));

  let start = Math.max(1, state.currentPageSets - 2);
  let end = Math.min(totalPages, state.currentPageSets + 2);

  for (let i = start; i <= end; i++) {
    const b = btn(i, i, i === state.currentPageSets);
    if (i === state.currentPageSets) b.classList.add("bg-gray-300");
    paginationEl.appendChild(b);
  }

  paginationEl.appendChild(btn(">", state.currentPageSets + 1, state.currentPageSets === totalPages));
  paginationEl.appendChild(btn("Fine", totalPages, state.currentPageSets === totalPages));
}
