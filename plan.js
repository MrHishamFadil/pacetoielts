// Pace Paths step 1: save/read the student's own plan at users/{uid}/plan/current.
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, getDocs, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const app=getApp(), auth=getAuth(app), db=getFirestore(app);
export const PATHS={p6:{name:'Pace 6',band:'6'},p7:{name:'Pace 7',band:'7'},p7plus:{name:'Pace 7+',band:'7.5+'}};
export const PACES={light:'Light (3 h/week)',standard:'Standard (5 h/week)',intensive:'Intensive (8+ h/week)'};
// Course length in weeks (teaching estimate from the plan): Light = longest, Intensive = shortest.
const WEEKS={p6:{light:16,standard:12,intensive:8},p7:{light:20,standard:14,intensive:10},p7plus:{light:16,standard:12,intensive:8}};
const $=id=>document.getElementById(id);
const planRef=u=>doc(db,'users',u.uid,'plan','current');
const DAY=864e5;
function fmt(d){return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'});}
async function suggest(u){ // rough suggestion from diagnostic sections (reading_passage1 / listening_section1)
  try{const s=await getDocs(collection(db,'users',u.uid,'scores'));let sc=0,t=0;
    s.forEach(d=>{if(d.id==='reading_passage1'||d.id==='listening_section1'){sc+=d.data().score;t+=d.data().total;}});
    if(!t)return null;const p=sc/t;return {pct:Math.round(p*100),path:p<0.55?'p6':p<0.75?'p7':'p7plus'};}catch(e){return null;}
}
async function choosePage(u){
  const form=$('form'),diag=$('diag');
  if(!u){form.hidden=true;$('login').hidden=false;diag.textContent='Sign in to choose and save your plan.';return;}
  $('login').hidden=true;form.hidden=false;
  const pace=$('pace'),exam=$('exam');
  const upd=()=>document.querySelectorAll('[data-path]').forEach(c=>{c.querySelector('.wk').textContent=WEEKS[c.dataset.path][pace.value]+' weeks at this pace';});
  pace.onchange=upd;
  const [cur,sg]=await Promise.all([getDoc(planRef(u)).catch(()=>null),suggest(u)]);
  if(cur&&cur.exists()){const p=cur.data();pace.value=p.pace;exam.value=p.examDate||'';}
  upd();
  if(sg){diag.textContent=`Your diagnostic (Reading + Listening): ${sg.pct}% correct. We suggest ${PATHS[sg.path].name}.`;
    const c=document.querySelector(`[data-path="${sg.path}"]`);c.classList.add('on');c.querySelector('.tag').textContent+=' ★ Suggested';}
  else{diag.textContent='No diagnostic result yet. You can take the diagnostic first, or pick a path now.';const a=document.createElement('a');a.href='diagnostic.html';a.textContent=' Take the diagnostic';diag.append(a);}
  document.querySelectorAll('[data-path] button').forEach(b=>b.onclick=async()=>{
    const path=b.closest('[data-path]').dataset.path, ed=exam.value;
    if(ed&&!/^\d{4}-\d{2}-\d{2}$/.test(ed)){$('msg').textContent='Please enter a valid exam date.';return;}
    b.disabled=true;$('msg').textContent='Saving…';
    try{await setDoc(planRef(u),{path,pace:pace.value,examDate:ed,startedAt:serverTimestamp()});location.href='my-plan.html';}
    catch(e){b.disabled=false;$('msg').textContent='Could not save. Please try again.';}
  });
}
async function myPage(u){
  const out=$('out');if(!u)return;
  const s=await getDoc(planRef(u)).catch(()=>null);
  out.replaceChildren();const h=document.createElement('h1'),p=document.createElement('p'),a=document.createElement('a');
  a.className='btn';a.href='choose-plan.html';
  if(!s||!s.exists()){h.textContent='My Plan';p.textContent='You have not chosen a plan yet.';a.textContent='Choose your Pace';out.append(h,p,a);return;}
  const d=s.data(),total=WEEKS[d.path][d.pace],start=d.startedAt?d.startedAt.toDate():new Date();
  const week=Math.min(total,Math.floor((Date.now()-start)/(7*DAY))+1),pct=Math.round(100*(week-1)/total);
  h.textContent=`My Plan: ${PATHS[d.path].name} · ${PACES[d.pace]}`;
  let line=`Target band ${PATHS[d.path].band} · Week ${week} of ${total} · Started ${fmt(start)}`;
  if(d.examDate){const ex=new Date(d.examDate+'T00:00:00'),wl=Math.ceil((ex-Date.now())/(7*DAY));
    line+=` · Exam ${fmt(ex)} (${wl>0?wl+' weeks left':'exam date passed'})`;
    if(wl>0&&wl<total-week+1)line+=' · ⚠ fewer weeks left than the plan needs; consider a faster pace';}
  p.textContent=line;
  const c=document.createElement('div');c.className='c';const b=document.createElement('b');b.textContent=`Course progress (by time) ${pct}%`;
  const bar=document.createElement('div');bar.className='bar';const i=document.createElement('i');i.style.width=pct+'%';bar.append(i);c.append(b,bar);
  a.textContent='Change my plan';const sp=document.createElement('p');sp.append(a);
  out.append(h,p,c,sp);
}
const isChoose=!!$('form');
onAuthStateChanged(auth,u=>{(isChoose?choosePage:myPage)(u).catch(()=>{});});
