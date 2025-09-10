// js/cards.js
import { API_BASE, euro, priceFrom } from "./utils.js";
import { db } from "./firebase.js";
import { els, state } from "./state.js";
import { collection, getDocs, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function selectSet(set) {
  state.currentSet = set;
  els.currentSetTitle.textContent = `Carte – ${set.name}`;
  els.cards.innerHTML = '';
  els.setCount.textContent = set.total || 0;
  els.status.textContent = 'Carico carte…';

  let all = [], page = 1, hasMore = true;
  while (hasMore) {
    const res = await fetch(`${API_BASE}/cards?q=set.id:${encodeURIComponent(set.id)}&pageSize=250&page=${page}`);
    const data = await res.json();
    const batch = data.data || [];
    all = all.concat(batch);
    hasMore = batch.length === 250;
    page++;
  }
  state.cards = all;
  applyCardFilters();
  els.status.textContent = `${all.length} carte caricate`;
}

export async function loadUserCollection() {
  if (!state.user) return;
  const uid = state.user.uid;
  const snapshot = await getDocs(collection(db, "users", uid, "cards"));
  state.own = {};
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    state.own[data.setId] = state.own[data.setId] || {};
    state.own[data.setId][docSnap.id] = data;
  });
  renderCards();
  updateTotals();
}

async function toggleOwnFirebase(card, owned, user) {
  debugger;
  if (!user) return;
  const uid = user.uid;
  const setId = card.set.id;
  const cardRef = doc(db, "users", uid, "cards", card.id);

  if (owned) {
    await setDoc(cardRef, {
      owned: true,
      lastPrice: priceFrom(card),
      setId,
      name: card.name,
      number: card.number
    });
    state.own[setId] = state.own[setId] || {};
    state.own[setId][card.id] = { owned: true, lastPrice: priceFrom(card) };
  } else {
    await deleteDoc(cardRef);
    if (state.own[setId]) delete state.own[setId][card.id];
  }
  updateTotals();
}

function renderCards() {
  const tpl = document.getElementById('cardTpl');
  const setId = state.currentSet?.id;
  els.cards.innerHTML = '';
  state.filteredCards.forEach(card => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.querySelector('.image').src = card.images?.small || '';
    node.querySelector('.name').textContent = card.name;
    node.querySelector('.meta').textContent = `#${card.number || '?'} • ${card.rarity || '—'}`;
    const price = priceFrom(card);
    node.querySelector('.price').textContent = price ? `Prezzo stimato: ${euro(price)}` : 'Prezzo non disponibile';
    const ownBox = node.querySelector('.own');
    const owned = !!state.own?.[setId]?.[card.id];
    ownBox.checked = owned;
    ownBox.addEventListener('change', () => toggleOwnFirebase(card, ownBox.checked, state.user));
    els.cards.appendChild(node);
  });
}

export function applyCardFilters() {
  const q = els.cardSearch.value.trim().toLowerCase();
  let arr = [...state.cards];
  if (q) arr = arr.filter(c => 
    (c.name || '').toLowerCase().includes(q) || 
    (c.number || '').toLowerCase().includes(q)
  );
  state.filteredCards = arr;
  renderCards();
  updateTotals();
}

export function bulkSelect(val) {
  if (!state.currentSet) return;
  state.filteredCards.forEach(c => toggleOwnFirebase(c, val));
}

function updateTotals() {
  const setId = state.currentSet?.id;
  const ownedIds = Object.keys(state.own[setId] || {});
  els.selCount.textContent = ownedIds.length;
  let total = 0;
  state.cards.forEach(c => { if (ownedIds.includes(c.id)) total += priceFrom(c) || 0; });
  els.selTotal.textContent = euro(total);
}