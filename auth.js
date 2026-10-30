// Sign-in gate + protected content loader (project: pacetoielts). SDK versions pinned.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, deleteDoc, getDocs, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({prompt:'select_account'});
const G='<svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.3 5.7c4.3-3.9 7-9.8 7-17.1z"/><path fill="#FBBC05" d="M10.6 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2.2 1.5-5 2.3-8.6 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';

const PAGES=['reading','listening','writing','speaking','vocabulary','lessons','band-scores','study-plan','dashboard','faq','tips'];
const page=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
const gated=document.querySelector('main[data-gated]')!==null;
function safeNext(){const n=new URLSearchParams(location.search).get('next');return (n&&/^[a-z0-9-]{1,40}$/.test(n)&&n!=='admin'&&n!=='index')?n+'.html':null;}
async function login(){ try{ await signInWithPopup(auth,provider);}catch(e){ if(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment'){await signInWithRedirect(auth,provider);} else if(e.code!=='auth/popup-closed-by-user'&&e.code!=='auth/cancelled-popup-request'){alert('Sign-in failed. Please try again.');} } }
window.iypLogin=login;
window.PTI_LOAD_LESSON=async(id)=>{const s=await getDoc(doc(db,'tutorLessons',id));return s.exists()?s.data():null;};
function el(tag,attrs,text){const e=document.createElement(tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;return e;}
function bindLogin(){document.querySelectorAll('[data-login]').forEach(b=>{if(!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',login);}});}
function renderBox(u){
  const box=document.getElementById('authbox'); if(!box) return; box.replaceChildren();
  if(u){
    if(u.photoURL&&/^https:\/\/[a-z0-9.-]+\.googleusercontent\.com\//.test(u.photoURL)){const i=el('img',{alt:'',referrerpolicy:'no-referrer'});i.src=u.photoURL;box.append(i);}
    box.append(el('a',{class:'nm',href:'dashboard.html',title:'My progress'},u.displayName||u.email||'Account'));
    const so=el('button',{class:'gbtn'},'Sign out'); so.addEventListener('click',()=>signOut(auth).then(()=>location.replace('index.html'))); box.append(so);
  } else {
    const b=el('button',{class:'gbtn','data-login':''}); b.innerHTML=G; b.append(' Continue with Google'); box.append(b);
  }
  bindLogin();
}
// progress API used by app.js (owner-only per Firestore rules)
const SID=/^(reading_passage[1-3]|listening_section[1-6]|[a-z0-9-]{2,30}_drill[1-3])$/;
window.IYP_SAVE=async(id,score,total,title)=>{const u=auth.currentUser;if(!u||!SID.test(id))return;
  await setDoc(doc(db,'users',u.uid,'scores',id),{score:Math.trunc(score),total:Math.trunc(total),title:String(title).slice(0,120),date:serverTimestamp()});};
const SEP='\u241F';
window.IYP_ATTEMPT=async(r)=>{const u=auth.currentUser;if(!u||!SID.test(r.section))return;const max=Math.trunc(r.max),score=Math.trunc(r.score);
  await addDoc(collection(db,'users',u.uid,'attempts'),{uid:u.uid,section:r.section,score:score,max:max,pct:Math.round(100*score/max),timeSec:Math.min(36000,Math.max(0,Math.trunc(r.timeSec))),
    given:r.given.map(x=>x.replace(SEP,' ')).join(SEP).slice(0,2000),correct:r.correct.map(x=>x.replace(SEP,' ')).join(SEP).slice(0,4000),results:r.results,tags:String(r.tags||'').slice(0,400),date:serverTimestamp()});};
window.IYP_MISTAKE=async(m)=>{const u=auth.currentUser;if(!u||!SID.test(m.section))return;await addDoc(collection(db,'users',u.uid,'mistakes'),{section:m.section,q:m.q,tag:m.tag,cause:m.cause,given:m.given,correct:m.correct,date:serverTimestamp()});};
window.IYP_LOADATT=async()=>{const u=auth.currentUser;if(!u)return[];const s=await getDocs(collection(db,'users',u.uid,'attempts'));return s.docs.map(d=>d.data());};
window.IYP_LOADMIS=async()=>{const u=auth.currentUser;if(!u)return[];const s=await getDocs(collection(db,'users',u.uid,'mistakes'));return s.docs.map(d=>({id:d.id,...d.data(),date:d.data().date?d.data().date.toDate():null})).sort((x,y)=>(y.date||0)-(x.date||0));};
window.IYP_DELMIS=async(id)=>{const u=auth.currentUser;await deleteDoc(doc(db,'users',u.uid,'mistakes',id));};
const TUTORS=['hisham.abdelfadil2@gmail.com','hisham.abdelfadil@gmail.com'];
async function autoJoin(u){try{if(TUTORS.includes(u.email))return;const r=doc(db,'members',u.uid);const m=await getDoc(r);if(!m.exists())await setDoc(r,{classId:'all',code:'',joinedAt:serverTimestamp()});}catch(e){}}
async function touchProfile(u){autoJoin(u);try{const t=(await u.getIdTokenResult()).claims;const ref=doc(db,'users',u.uid);
  const base={displayName:t.name||'',email:t.email||'',photoURL:t.picture||'',lastSeen:serverTimestamp()};
  const s=await getDoc(ref); if(s.exists()) await setDoc(ref,base,{merge:true}); else await setDoc(ref,{...base,firstSeen:serverTimestamp()});}catch(e){}}
window.IYP_LOADP=async()=>{const u=auth.currentUser;if(!u)return{};const s=await getDocs(collection(db,'users',u.uid,'scores'));const o={};
  s.forEach(d=>{const r=d.data();o[d.id]={score:r.score,total:r.total,title:r.title,date:r.date?r.date.toDate().toISOString():''};});return o;};
async function loadContent(){
  const main=document.querySelector('main');
  try{const snap=await getDoc(doc(db,'content',page));
    if(!snap.exists()) throw new Error('missing');
    main.innerHTML=snap.data().html; // trusted, write-locked author content (rules: write=false)
    main.removeAttribute('data-gated');
    if(window.IYP_INIT) window.IYP_INIT();
    document.dispatchEvent(new CustomEvent('iyp-content',{detail:page}));
  }catch(e){const g=document.getElementById('gate');if(g){g.replaceChildren(el('p',{},'Sorry, this page could not load. Please refresh, or sign in again.'));}}
}
onAuthStateChanged(auth,u=>{
  if(u) touchProfile(u);
  renderBox(u);
  window.IYP_USER=u?{uid:u.uid,name:u.displayName,email:u.email}:null;
  if(gated){ if(!u){location.replace('index.html?next='+encodeURIComponent(page));return;} loadContent(); }
  else if(u){ const n=safeNext(); if(n){location.replace(n);return;} document.querySelectorAll('[data-login]').forEach(b=>{if(b.closest('#authbox'))return;const a=el('a',{class:b.className||'btn gold',href:'reading.html'},'Start practising');b.replaceWith(a);}); const m=document.getElementById('gate-msg'); if(m)m.textContent='You are signed in. Pick a skill below to start.'; }
  else { const m=document.getElementById('gate-msg'); if(m&&safeNext())m.textContent='Please continue with Google to open that page.'; }
  document.dispatchEvent(new CustomEvent('iyp-auth',{detail:window.IYP_USER}));
});
bindLogin();
