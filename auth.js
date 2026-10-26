// Firebase Google sign-in (project: pacetoielts). Practice stays free; sign-in only personalises progress.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyA-Qwag6CftRpdXnLgEuXQwfQ158l9gv-o",
  authDomain: "pacetoielts.firebaseapp.com",
  projectId: "pacetoielts",
  storageBucket: "pacetoielts.firebasestorage.app",
  messagingSenderId: "334975374555",
  appId: "1:334975374555:web:f6297b0c2f72f599d3e8fe"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const G='<svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.3 5.7c4.3-3.9 7-9.8 7-17.1z"/><path fill="#FBBC05" d="M10.6 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2.2 1.5-5 2.3-8.6 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
async function login(){ try{ await signInWithPopup(auth,provider);}catch(e){ if(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment'){await signInWithRedirect(auth,provider);} else {alert('Sign-in failed: '+e.code);} } }
window.iypLogin=login;
function render(u){
  const box=document.getElementById('authbox'); if(!box) return;
  if(u){
    const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    box.innerHTML=(u.photoURL?`<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">`:'')+`<a class="nm" href="dashboard.html" title="My progress">${esc(u.displayName||u.email)}</a><button class="gbtn" id="so">Sign out</button>`;
    document.getElementById('so').onclick=()=>signOut(auth);
  } else {
    box.innerHTML=`<button class="gbtn" id="si">${G} Sign in with Google</button>`;
    document.getElementById('si').onclick=login;
  }
  window.IYP_USER=u?{uid:u.uid,name:u.displayName,email:u.email}:null;
  document.dispatchEvent(new CustomEvent('iyp-auth',{detail:window.IYP_USER}));
}
onAuthStateChanged(auth,render);
