export const state = { 
  user: null, 
  sets: [], 
  filteredSets: [], 
  currentSet: null, 
  cards: [], 
  filteredCards: [], 
  own: {},

  // 🔽 paginazione carte
  currentPageCards: 1,
  pageSizeCards: 20,

  // paginazione server-side
  currentPageSets: 1,
  pageSizeSets: 2,
  totalPagesSets: 1000
};


export const els = {
  loginBtn: document.getElementById('loginBtn'),
  status: document.getElementById('status'),
  mainApp: document.getElementById('mainApp'),
  sets: document.getElementById('sets'),
  setSearch: document.getElementById('setSearch'),
  orderBy: document.getElementById('orderBy'),
  cards: document.getElementById('cards'),
  cardSearch: document.getElementById('cardSearch'),
  selectAll: document.getElementById('selectAll'),
  clearAll: document.getElementById('clearAll'),
  selCount: document.getElementById('selCount'),
  selTotal: document.getElementById('selTotal'),
  setCount: document.getElementById('setCount'),
  currentSetTitle: document.getElementById('currentSetTitle')
};
