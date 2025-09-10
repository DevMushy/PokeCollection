// js/auth.js
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { auth } from "./firebase.js";
import { state, els } from "./state.js";
import { loadUserCollection } from "./cards.js";



export function initAuth() {
  els.loginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      state.user = result.user;
      els.status.textContent = `Ciao ${state.user.displayName}`;
      els.loginBtn.style.display = 'none';
      els.mainApp.classList.remove('hidden');
      
    await loadUserCollection();
    } catch (e) {
      console.error(e);
      alert("Login fallito: " + e.message);
    }
  });
}
