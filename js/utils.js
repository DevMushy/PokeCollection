// js/utils.js
export const API_BASE = 'https://api.pokemontcg.io/v2';

export const euro = n => new Intl.NumberFormat('it-IT', { 
  style: 'currency', currency: 'EUR' 
}).format(n || 0);

export const debounce = (fn, ms = 250) => {
  let t; 
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms) }
};

export function priceFrom(card) {
  return card.cardmarket?.prices?.trendPrice || 0;
}

export function getTotalPages(items, pageSize) {
  return Math.ceil(items.length / pageSize) || 1;
}
