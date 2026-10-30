// Tutor dashboard. Access is enforced by Firestore rules (2 tutor emails, verified). Everything is rendered as plain text.
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, collectionGroup, getDocs, doc, setDoc, addDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const ADMINS=['hisham.abdelfadil2@gmail.com','hisham.abdelfadil@gmail.com'];
const SEP='\u241F';const $=id=>document.getElementById(id);
const mk=(t,x,c)=>{const e=document.createElement(t);if(x!=null)e.textContent=String(x);if(c)e.className=c;return e;};
const btn=(x,fn,c)=>{const b=mk('button',x,c);b.addEventListener('click',fn);return b;};
const fmt=d=>d?d.toLocaleString('en-GB',{timeZone:'Asia/Riyadh',dateStyle:'medium',timeStyle:'short'}):'';
const day=d=>d.toLocaleDateString('en-CA',{timeZone:'Asia/Riyadh'});
const TAGS=()=>window.IYP_TAGS||{};const LESSON=t=>(window.IYP_LESSON||(()=>'lessons.html'))(t);
const CRIT={writing:['Task achievement / response','Coherence and cohesion','Lexical resource','Grammatical range and accuracy'],speaking:['Fluency and coherence','Lexical resource','Grammatical range and accuracy','Pronunciation']};
const PAGES=['','reading.html','listening.html','writing.html','speaking.html','vocabulary.html','lessons.html','mocks.html','diagnostic.html','l-sections-1-2.html','l-sections-3-4.html','l-predicting.html','l-keywords.html','l-specific-info.html','l-distractors.html','l-spelling-numbers.html','l-completion.html','l-mcq-matching.html','l-attitude.html','r-cohesion.html','r-guessing-context.html','plan-5-6.html','plan-6-65.html','plan-65-7.html','plan-7-plus.html'];
let db,D={users:{},att:[],mis:[],members:{},classes:{},asg:[],subs:[],fb:{}},sel=null;
function csvDl(rows,name){const q=v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
  const b=new Blob(['\ufeff'+rows.map(r=>r.map(q).join(',')).join('\r\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();}
function streak(uid){const days=new Set([...D.att.filter(a=>a.uid===uid).map(a=>day(a.date)),...D.subs.filter(s=>s.uid===uid).map(s=>day(s.createdAt))]);let n=0;const d=new Date();
  if(!days.has(day(d)))d.setDate(d.getDate()-1);while(days.has(day(d))){n++;d.setDate(d.getDate()-1);}return n;}
function stats(uid){const at=D.att.filter(a=>a.uid===uid);const A=window.IYP_ANALYSE?window.IYP_ANALYSE(at):{sec:{},micro:{},weak:[],task:{}};
  const pc=k=>A.sec[k]?Math.round(100*A.sec[k][0]/A.sec[k][1])+'%':'\u2013';const u=D.users[uid]||{};const last=[u.lastSeen,...at.map(a=>a.date)].filter(Boolean).sort((x,y)=>y-x)[0];
  return {at,A,reading:pc('Reading'),listening:pc('Listening'),avg:at.length?Math.round(at.reduce((s,a)=>s+a.pct,0)/at.length):'',last,streak:streak(uid)};}
const tabs=['Students','Classes','Assignments','Marking','Report'];
function nav(){const n=$('tabs');n.replaceChildren();tabs.forEach(t=>n.append(btn(t,()=>show(t),'tab')));}
function show(t){document.querySelectorAll('#tabs .tab').forEach(b=>b.classList.toggle('gold',b.textContent===t));const v=$('view');v.replaceChildren();({Students,Classes,Assignments,Marking,Report})[t](v);}
function Students(v){const cf=mk('select');cf.append(new Option('All classes',''));Object.entries(D.classes).forEach(([id,c])=>cf.append(new Option(c.name,id)));
  const tb=mk('tbody');const draw=()=>{tb.replaceChildren();Object.keys(D.users).filter(uid=>!cf.value||(D.members[uid]||{}).classId===cf.value).map(uid=>[uid,stats(uid)]).sort((x,y)=>(y[1].last||0)-(x[1].last||0)).forEach(([uid,s])=>{const u=D.users[uid];
    const r=mk('tr');const nm=mk('td');nm.append(btn(u.displayName||'(no name)',()=>{sel=uid;show('Report');},'linkbtn'));
    r.append(nm,mk('td',u.email),mk('td',(D.classes[(D.members[uid]||{}).classId]||{}).name||'\u2013'),mk('td',s.reading),mk('td',s.listening),mk('td',s.A.weak.map(w=>`${w[0]} ${w[1]}%`).join(', ')||'\u2013'),mk('td',fmt(s.last)),mk('td',s.streak?s.streak+' d':'0'),mk('td',s.at.length));tb.append(r);});};
  cf.onchange=draw;const t=mk('table');const h=mk('tr');['Name','Email','Class','Reading','Listening','Top weaknesses','Last active','Streak','Tests'].forEach(x=>h.append(mk('th',x)));t.append(h,tb);
  const w=mk('div',null,'tablewrap');w.append(t);v.append(mk('p',`${Object.keys(D.users).length} students \u00b7 ${D.att.length} tests \u00b7 ${D.subs.length} submissions`),cf,w,btn('Export all results (CSV)',exportAll));draw();}
function exportAll(){const rows=[['name','email','class','section','score','max','pct','time_sec','date_riyadh','question','tag','given','correct','result']];
  D.att.forEach(a=>{const u=D.users[a.uid]||{};const g=(a.given||'').split(SEP),k=(a.correct||'').split(SEP),tg=(a.tags||'').split(',');[...(a.results||'')].forEach((r,i)=>rows.push([u.displayName,u.email,(D.classes[(D.members[a.uid]||{}).classId]||{}).name,a.section,a.score,a.max,a.pct,a.timeSec,fmt(a.date),i+1,tg[i]||'',g[i],k[i],r==='1'?'correct':'wrong']));});
  csvDl(rows,'pacetoielts-all-results.csv');}
function Classes(v){const f=mk('div','card');const nm=mk('input',null,'ans-in');nm.placeholder='Class name, e.g. Jeddah Saturday group';nm.maxLength=80;const m=mk('p');
  f.append(mk('h3','Create a class'),nm,btn('Create',async()=>{const name=nm.value.trim();if(!name){m.textContent='Enter a name.';return;}const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const r=crypto.getRandomValues(new Uint8Array(6));const code=[...r].map(x=>A[x%A.length]).join('');
    try{const ref=doc(collection(db,'classes'));await setDoc(ref,{name,code,createdAt:serverTimestamp()});await setDoc(doc(db,'joinCodes',code),{classId:ref.id});D.classes[ref.id]={name,code};show('Classes');}catch(e){m.textContent='Could not create the class.';}},'gold'),m);v.append(f);
  Object.entries(D.classes).forEach(([id,c])=>{const k=mk('div',null,'card');const n=Object.values(D.members).filter(x=>x.classId===id).length;k.append(mk('h3',c.name),mk('p',id==='all'?`Everyone joins automatically (no code) \u00b7 ${n} students`:`Join code: ${c.code} \u00b7 ${n} students`),mk('p','Students open My homework and enter this code once.','disclaimer'));v.append(k);});}
function Assignments(v){const f=mk('div','card');f.append(mk('h3','New assignment'));const g=mk('div',null,'formgrid');
  const title=mk('input',null,'ans-in');title.placeholder='Title';title.maxLength=120;const kind=mk('select');['lesson','mock','writing','speaking'].forEach(k=>kind.append(new Option(k,k)));
  const lk=mk('select');PAGES.forEach(p=>lk.append(new Option(p||'(no page link)',p)));const task=mk('select');['','W1','W2','S1','S2','S3'].forEach(k=>task.append(new Option(k||'(task type)',k)));
  const pr=mk('textarea');pr.rows=3;pr.maxLength=2000;pr.placeholder='Instructions or the task question (original wording)';
  const to=mk('select');Object.entries(D.classes).forEach(([id,c])=>to.append(new Option('Class: '+c.name,'c:'+id)));Object.entries(D.users).forEach(([id,u])=>to.append(new Option('Student: '+(u.displayName||u.email),'s:'+id)));
  const due=mk('input');due.type='datetime-local';const m=mk('p');
  [['Title',title],['Type',kind],['Page',lk],['Task',task],['Assign to',to],['Due',due]].forEach(([l,e])=>{const L=mk('label',l);L.append(e);g.append(L);});f.append(g,pr);
  f.append(btn('Assign',async()=>{if(!title.value.trim()||!to.value||!due.value){m.textContent='Title, who and due date are required.';return;}
    const [t,id]=[to.value[0],to.value.slice(2)];const k=kind.value;const tk=(k==='writing'&&!/^W/.test(task.value))?'W2':(k==='speaking'&&!/^S/.test(task.value))?'S2':(k==='writing'||k==='speaking')?task.value:'';
    const data={title:title.value.trim(),kind:k,link:lk.value,prompt:pr.value,task:tk,classId:t==='c'?id:'',studentUid:t==='s'?id:'',due:Timestamp.fromDate(new Date(due.value+':00+03:00')),createdAt:serverTimestamp()};
    try{const r=await addDoc(collection(db,'assignments'),data);D.asg.push({id:r.id,...data,due:data.due.toDate()});show('Assignments');if(window.PTI_NOTIFY){const rc=t==='s'?[D.users[id]||{}]:Object.keys(D.members).filter(u=>D.members[u].classId===id).map(u=>D.users[u]||{});window.PTI_NOTIFY(rc,{...data,due:data.due.toDate()}).then(x=>{const n=mk('p',x.skipped?'Assigned. Email not set up yet, so no email was sent.':`Assigned. Emails sent: ${x.sent}${x.failed?`, failed: ${x.failed}`:''}.`,'disclaimer');document.getElementById('view').prepend(n);setTimeout(()=>n.remove(),8000);});}}catch(e){m.textContent='Could not save the assignment.';}},'gold'),m);v.append(f);
  const t=mk('table');const h=mk('tr');['Title','Type','To','Due','Submitted','Marked',''].forEach(x=>h.append(mk('th',x)));t.append(h);
  D.asg.slice().sort((x,y)=>y.due-x.due).forEach(a=>{const s=D.subs.filter(x=>x.assignmentId===a.id);const r=mk('tr');const d=mk('td');d.append(btn('Delete',async()=>{if(!confirm('Delete this assignment?'))return;await deleteDoc(doc(db,'assignments',a.id));D.asg=D.asg.filter(x=>x!==a);show('Assignments');}));
    r.append(mk('td',a.title),mk('td',a.kind),mk('td',a.classId?(D.classes[a.classId]||{}).name:(D.users[a.studentUid]||{}).displayName),mk('td',fmt(a.due)),mk('td',s.length),mk('td',s.filter(x=>D.fb[x.id]).length),d);t.append(r);});
  const w=mk('div',null,'tablewrap');w.append(t);v.append(w);}
function Marking(v){const only=mk('select');only.append(new Option('Unmarked first','u'),new Option('All','a'));const list=mk('div');
  const draw=()=>{list.replaceChildren();D.subs.slice().sort((x,y)=>(!!D.fb[x.id]-!!D.fb[y.id])||(y.createdAt-x.createdAt)).filter(s=>only.value==='a'||!D.fb[s.id]).forEach(s=>list.append(card(s)));if(!list.children.length)list.append(mk('p','Nothing to mark.'));};
  only.onchange=draw;v.append(only,list);draw();}
function card(s){const c=mk('div',null,'card');const u=D.users[s.uid]||{};c.append(mk('h3',`${u.displayName||s.name} \u00b7 ${s.task} \u00b7 ${fmt(s.createdAt)}`),mk('p',`${s.words} words \u00b7 ${Math.floor(s.timeSec/60)} min${D.fb[s.id]?' \u00b7 marked':''}`));
  if(s.prompt)c.append(mk('p',s.prompt,'prompt'));let txt=null;if(s.text){txt=mk('div',s.text,'subtext');c.append(txt);}
  if(s.audio){const b=Uint8Array.from(atob(s.audio),ch=>ch.charCodeAt(0));const a=mk('audio');a.controls=true;a.src=URL.createObjectURL(new Blob([b],{type:s.audioMime}));c.append(a);}
  if(s.link){const a=mk('a','Open recording link');a.href=s.link;a.rel='noopener noreferrer';a.target='_blank';c.append(a);}
  const F=D.fb[s.id]||{};const g=mk('div',null,'formgrid');const bands=[];CRIT[s.kind].forEach((n,i)=>{const sl=mk('select');for(let b=9;b>=0;b-=0.5)sl.append(new Option(b,b));sl.value=F['c'+(i+1)]??6;const L=mk('label',n);L.append(sl);g.append(L);bands.push(sl);});
  const ov=mk('select');for(let b=9;b>=0;b-=0.5)ov.append(new Option(b,b));const calc=()=>{ov.value=Math.round(bands.reduce((a,b)=>a+ +b.value,0)/4*2)/2;};bands.forEach(b=>b.onchange=calc);if(F.overall!=null)ov.value=F.overall;else calc();
  const L=mk('label','Overall band');L.append(ov);g.append(L);const cm=mk('textarea');cm.rows=4;cm.maxLength=6000;cm.value=F.comments||'';cm.placeholder='One comment per line. Select text above and press Quote to add an inline comment.';
  const q=btn('Quote selection',()=>{const t=String(getSelection()).trim().slice(0,200);if(t)cm.value+=(cm.value?'\n':'')+`\u201c${t}\u201d \u2192 `;cm.focus();});
  const pref=s.kind==='writing'?(s.task==='W1'?'W1-':'W2-'):'S-';const lb=mk('div',null,'labels');Object.keys(TAGS()).filter(t=>t.startsWith(pref)).forEach(t=>{const l=mk('label');const cb=mk('input');cb.type='checkbox';cb.value=t;cb.checked=(F.labels||[]).includes(t);l.append(cb,` ${t} ${TAGS()[t]}`);lb.append(l);});
  const nl=mk('select');PAGES.forEach(p=>nl.append(new Option(p||'(no lesson)',p)));nl.value=F.nextLesson||(s.kind==='writing'?'writing.html':'speaking.html');const m=mk('p');
  c.append(g,q,cm,mk('p','Feedback labels'),lb,mk('p','Recommended next lesson'),nl,btn('Save marks',async()=>{const labels=[...lb.querySelectorAll('input:checked')].map(x=>x.value).slice(0,12);
    const data={uid:s.uid,c1:+bands[0].value,c2:+bands[1].value,c3:+bands[2].value,c4:+bands[3].value,overall:+ov.value,comments:cm.value.slice(0,6000),labels,nextLesson:nl.value,markedAt:serverTimestamp()};
    try{await setDoc(doc(db,'feedback',s.id),data);D.fb[s.id]={...data,markedAt:new Date()};m.textContent='Saved. The student can see it now.';}catch(e){m.textContent='Could not save.';}},'gold'),m);return c;}
function Report(v){const s=mk('select');s.append(new Option('Choose a student',''));Object.entries(D.users).forEach(([id,u])=>s.append(new Option(u.displayName||u.email,id)));s.value=sel||'';s.onchange=()=>{sel=s.value;show('Report');};
  v.append(s);if(!sel)return;const u=D.users[sel]||{},st=stats(sel);const r=mk('div',null,'report');
  r.append(mk('h2',`Progress report: ${u.displayName||''}`),mk('p',`${u.email||''} \u00b7 ${(D.classes[(D.members[sel]||{}).classId]||{}).name||'No class'} \u00b7 generated ${fmt(new Date())} (Riyadh)`),
    mk('p',`Reading ${st.reading} \u00b7 Listening ${st.listening} \u00b7 ${st.at.length} tests \u00b7 streak ${st.streak} days \u00b7 last active ${fmt(st.last)}`));
  const w=mk('div',null,'card');w.append(mk('h3','Top weaknesses and next steps'));const ol=mk('ol');st.A.weak.forEach(([t,p])=>ol.append(mk('li',`${t} ${TAGS()[t]||''}: ${p}% \u2192 ${LESSON(t)}`)));if(!st.A.weak.length)ol.append(mk('li','Not enough data yet.'));w.append(ol);r.append(w);
  const ms=mk('table');const h=mk('tr');['Micro-skill','Correct','%'].forEach(x=>h.append(mk('th',x)));ms.append(h);Object.entries(st.A.micro).sort().forEach(([k,x])=>{const tr=mk('tr');tr.append(mk('td',`${k} ${TAGS()[k]||''}`),mk('td',`${x[0]}/${x[1]}`),mk('td',Math.round(100*x[0]/x[1])+'%'));ms.append(tr);});r.append(mk('h3','Micro-skills'),ms);
  r.append(mk('h3','Tests'));st.at.slice().sort((a,b)=>b.date-a.date).forEach(a=>{const d=mk('details');d.append(mk('summary',`${fmt(a.date)} \u00b7 ${a.section} \u00b7 ${a.score}/${a.max} (${a.pct}%) \u00b7 ${Math.floor(a.timeSec/60)}m ${a.timeSec%60}s`));
    const t=mk('table');const g=(a.given||'').split(SEP),k=(a.correct||'').split(SEP),tg=(a.tags||'').split(',');[...(a.results||'')].forEach((x,i)=>{const tr=mk('tr');tr.append(mk('td',i+1),mk('td',tg[i]||''),mk('td',g[i]||''),mk('td',k[i]||''),mk('td',x==='1'?'\u2713':'\u2717'));t.append(tr);});d.append(t);r.append(d);});
  r.append(mk('h3','Writing and speaking'));D.subs.filter(x=>x.uid===sel).forEach(x=>{const f=D.fb[x.id];r.append(mk('p',`${fmt(x.createdAt)} \u00b7 ${x.task} \u00b7 ${x.words} words \u00b7 ${f?'band '+f.overall+' ('+[f.c1,f.c2,f.c3,f.c4].join(' / ')+')':'not marked'}`));});
  const mis=D.mis.filter(x=>x.uid===sel);r.append(mk('p',`Mistake log: ${mis.length} entries`));
  v.append(btn('Print / Save as PDF',()=>{document.querySelectorAll('.report details').forEach(d=>d.open=true);print();},'gold'),' ',btn('Export CSV',()=>{const rows=[['date_riyadh','section','question','tag','given','correct','result']];st.at.forEach(a=>{const g=(a.given||'').split(SEP),k=(a.correct||'').split(SEP),tg=(a.tags||'').split(',');[...(a.results||'')].forEach((x,i)=>rows.push([fmt(a.date),a.section,i+1,tg[i]||'',g[i],k[i],x==='1'?'correct':'wrong']));});csvDl(rows,`report-${(u.displayName||'student').replace(/\W+/g,'-')}.csv`);}),r);}
async function load(){db=getFirestore(getApp());const ts=x=>x&&x.toDate?x.toDate():null;
  const [us,at,mi,me,cl,as,su,fb]=await Promise.all([getDocs(collection(db,'users')),getDocs(collectionGroup(db,'attempts')),getDocs(collectionGroup(db,'mistakes')),getDocs(collection(db,'members')),getDocs(collection(db,'classes')),getDocs(collection(db,'assignments')),getDocs(collection(db,'submissions')),getDocs(collection(db,'feedback'))]);
  us.forEach(d=>{const x=d.data();D.users[d.id]={displayName:x.displayName,email:x.email,lastSeen:ts(x.lastSeen)};});
  at.forEach(d=>{const x=d.data();D.att.push({...x,date:ts(x.date)||new Date(0)});});mi.forEach(d=>D.mis.push({...d.data(),uid:d.ref.parent.parent.id}));
  me.forEach(d=>D.members[d.id]=d.data());D.classes.all={name:'All students',code:''};cl.forEach(d=>{if(d.id!=='all')D.classes[d.id]=d.data();});as.forEach(d=>D.asg.push({id:d.id,...d.data(),due:ts(d.data().due)}));
  su.forEach(d=>D.subs.push({id:d.id,...d.data(),createdAt:ts(d.data().createdAt)||new Date(0)}));fb.forEach(d=>D.fb[d.id]=d.data());
  $('adm').replaceChildren();nav();show('Students');}
document.addEventListener('iyp-auth',()=>{const u=getAuth(getApp()).currentUser;
  if(!u||!u.emailVerified||!ADMINS.includes(u.email)){location.replace('index.html');return;}
  load().catch(()=>{$('adm').replaceChildren(mk('p','Access denied or failed to load.'));});},{once:true});
