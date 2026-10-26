// Admin view. Data access is enforced by Firestore rules (admin emails, verified); this page only displays.
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, collectionGroup, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const ADMINS=['hisham.abdelfadil2@gmail.com','hisham.abdelfadil@gmail.com'];
const SEP='\u241F';
const $=id=>document.getElementById(id);
const mk=(t,x,c)=>{const e=document.createElement(t);if(x!=null)e.textContent=String(x);if(c)e.className=c;return e;};
const fmt=d=>d?d.toLocaleString('en-GB',{timeZone:'Asia/Riyadh'}):'';
let users={},attempts=[],sel=null;
function filtered(){const s=$('fsec').value,f=$('ffrom').value,t=$('fto').value;
  return attempts.filter(a=>(!s||a.section===s)&&(!f||a.date>=new Date(f+'T00:00:00+03:00'))&&(!t||a.date<=new Date(t+'T23:59:59+03:00')));}
function render(){const list=filtered();const tb=$('ut');tb.replaceChildren();
  const ids=new Set([...Object.keys(users),...list.map(a=>a.uid)]);
  [...ids].sort((x,y)=>((users[y]||{}).lastSeen||0)-((users[x]||{}).lastSeen||0)).forEach(uid=>{const u=users[uid]||{};const mine=list.filter(a=>a.uid===uid);
    const avg=mine.length?Math.round(mine.reduce((s,a)=>s+a.pct,0)/mine.length):'';
    const tr=mk('tr');const nm=mk('td');const b=mk('button',u.displayName||'(no name)');b.addEventListener('click',()=>{sel=uid;detail();});nm.append(b);
    tr.append(nm,mk('td',u.email||''),mk('td',fmt(u.lastSeen)),mk('td',mine.length),mk('td',avg));tb.append(tr);});
  detail();}
function detail(){const box=$('det');box.replaceChildren();if(!sel){box.append(mk('p','Click a name to see that learner\u2019s attempts.'));return;}
  const u=users[sel]||{};$('dh').textContent='Attempts: '+(u.displayName||sel);
  const mine=filtered().filter(a=>a.uid===sel).sort((x,y)=>y.date-x.date);if(!mine.length){box.append(mk('p','No attempts match the filters.'));return;}
  mine.forEach(a=>{const c=mk('div',null,'card');c.append(mk('h3',`${a.section} \u00b7 ${a.score}/${a.max} (${a.pct}%)`),mk('p',`${fmt(a.date)} (Riyadh) \u00b7 time taken ${Math.floor(a.timeSec/60)}m ${a.timeSec%60}s`));
    const t=mk('table');const h=mk('tr');['Q','Given','Correct answer','Result'].forEach(x=>h.append(mk('th',x)));t.append(h);
    const g=a.given.split(SEP),k=a.correct.split(SEP);[...a.results].forEach((r,i)=>{const tr=mk('tr');tr.append(mk('td',i+1),mk('td',g[i]||''),mk('td',k[i]||''),mk('td',r==='1'?'\u2713':'\u2717'));t.append(tr);});
    c.append(t);box.append(c);});}
function csv(){const q=v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
  const rows=[['name','email','section','score','max','pct','time_sec','date_riyadh','question','given','correct','result']];
  filtered().forEach(a=>{const u=users[a.uid]||{};const g=a.given.split(SEP),k=a.correct.split(SEP);[...a.results].forEach((r,i)=>rows.push([u.displayName,u.email,a.section,a.score,a.max,a.pct,a.timeSec,fmt(a.date),i+1,g[i],k[i],r==='1'?'correct':'wrong']));});
  const blob=new Blob(['\ufeff'+rows.map(r=>r.map(q).join(',')).join('\r\n')],{type:'text/csv'});const l=document.createElement('a');l.href=URL.createObjectURL(blob);l.download='pacetoielts-results.csv';l.click();}
async function load(){const db=getFirestore(getApp());
  const us=await getDocs(collection(db,'users'));us.forEach(d=>{const x=d.data();users[d.id]={displayName:x.displayName,email:x.email,lastSeen:x.lastSeen?x.lastSeen.toDate():null};});
  const at=await getDocs(collectionGroup(db,'attempts'));at.forEach(d=>{const x=d.data();attempts.push({...x,date:x.date?x.date.toDate():new Date(0)});});
  [...new Set(attempts.map(a=>a.section))].sort().forEach(s=>{const o=mk('option',s);o.value=s;$('fsec').append(o);});
  ['fsec','ffrom','fto'].forEach(i=>$(i).addEventListener('change',render));$('fclear').addEventListener('click',()=>{$('fsec').value='';$('ffrom').value='';$('fto').value='';render();});
  $('csv').addEventListener('click',csv);$('adm').replaceChildren(mk('p',`${Object.keys(users).length} learners \u00b7 ${attempts.length} attempts`));$('admui').hidden=false;render();}
document.addEventListener('iyp-auth',e=>{const u=getAuth(getApp()).currentUser;
  if(!u||!u.emailVerified||!ADMINS.includes(u.email)){location.replace('index.html');return;}
  load().catch(()=>{$('adm').replaceChildren(mk('p','Access denied or failed to load.'));});},{once:true});
