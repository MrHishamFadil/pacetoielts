// My homework: join a class, see assignments, submit writing/speaking, read tutor feedback. Plain-text rendering only.
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, getDocs, collection, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=String(x);return e;};
const link=(h,t)=>{const a=mk('a',null,t);a.href=h;return a;};
const TASKS={W1:'Writing Task 1 (150+ words, 20 min)',W2:'Writing Task 2 (250+ words, 40 min)',S1:'Speaking Part 1',S2:'Speaking Part 2 (2 min talk)',S3:'Speaking Part 3'};
const CRIT={writing:['Task achievement / response','Coherence and cohesion','Lexical resource','Grammatical range and accuracy'],speaking:['Fluency and coherence','Lexical resource','Grammatical range and accuracy','Pronunciation']};
let db,auth,u,root;
document.addEventListener('iyp-content',e=>{if(e.detail!=='homework')return;db=getFirestore(getApp());auth=getAuth(getApp());u=auth.currentUser;root=document.getElementById('hw');if(u&&root)load().catch(()=>{root.replaceChildren(mk('p',null,'Could not load homework. Please refresh.'));});});
async function load(){
  const mem=await getDoc(doc(db,'members',u.uid));const classId=mem.exists()?mem.data().classId:'';
  const qs=[getDocs(query(collection(db,'assignments'),where('studentUid','==',u.uid)))];if(classId)qs.push(getDocs(query(collection(db,'assignments'),where('classId','==',classId))));
  const [subs,fbs,...as]=await Promise.all([getDocs(query(collection(db,'submissions'),where('uid','==',u.uid))),getDocs(query(collection(db,'feedback'),where('uid','==',u.uid))),...qs]);
  const S=subs.docs.map(d=>({id:d.id,...d.data()})),F=Object.fromEntries(fbs.docs.map(d=>[d.id,d.data()]));
  const A=as.flatMap(s=>s.docs.map(d=>({id:d.id,...d.data()}))).sort((x,y)=>x.due.toMillis()-y.due.toMillis());
  root.replaceChildren();
  // class
  const cc=mk('div','card');if(classId){const c=await getDoc(doc(db,'classes',classId)).catch(()=>null);cc.append(mk('p',null,'Class: '+(c&&c.exists()?c.data().name:classId)));}
  else{cc.append(mk('h3',null,'Join your class'),mk('p',null,'Enter the 6-character code from your tutor.'));const i=mk('input','ans-in');i.maxLength=6;i.placeholder='e.g. K7Q2MX';const b=mk('button','gold','Join');const m=mk('p');
    b.onclick=async()=>{const code=i.value.trim().toUpperCase();if(!/^[A-Z0-9]{6}$/.test(code)){m.textContent='Codes are 6 letters or numbers.';return;}
      try{const j=await getDoc(doc(db,'joinCodes',code));if(!j.exists())throw 0;await setDoc(doc(db,'members',u.uid),{classId:j.data().classId,code,joinedAt:serverTimestamp()});load();}catch(e){m.textContent='That code did not work. Check it with your tutor.';}};
    cc.append(i,b,m);}
  root.append(cc);
  // assignments
  root.append(mk('h2',null,'Homework'));if(!A.length)root.append(mk('p',null,'No homework yet.'));
  A.forEach(a=>{const sub=S.filter(s=>s.assignmentId===a.id).sort((x,y)=>y.createdAt-x.createdAt)[0];const st=sub?(F[sub.id]?'Marked':'Submitted'):'To do';
    const c=mk('div','card hw');const h=mk('h3',null,a.title);h.append(' ',mk('span','pill '+st.toLowerCase().replace(' ',''),st));c.append(h,mk('p',null,`Due ${a.due.toDate().toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'})} \u00b7 ${a.kind}`));
    if(a.prompt)c.append(mk('p','prompt',a.prompt));if(a.link)c.append(link(a.link,'Open the '+a.kind+' \u2192'));
    if((a.kind==='writing'||a.kind==='speaking')&&!sub){const b=mk('button','gold','Start');b.onclick=()=>{b.remove();form(c,a.kind,a.task||(a.kind==='writing'?'W2':'S2'),a.prompt,a.id);};c.append(mk('p'),b);}
    if(sub&&F[sub.id])showFb(c,F[sub.id],sub.kind);root.append(c);});
  // free submission
  const fc=mk('div','card');fc.append(mk('h3',null,'Practise and submit for marking'));const sel=mk('select');Object.entries(TASKS).forEach(([k,v])=>{const o=mk('option',null,v);o.value=k;sel.append(o);});
  const pr=mk('textarea');pr.rows=2;pr.placeholder='Paste the task question here (optional)';pr.maxLength=2000;const go=mk('button','gold','Start');
  go.onclick=()=>{go.remove();form(fc,sel.value[0]==='W'?'writing':'speaking',sel.value,pr.value,'');};fc.append(sel,pr,go);root.append(fc);
  // past submissions
  const other=S.filter(s=>!s.assignmentId).sort((x,y)=>y.createdAt-x.createdAt);if(other.length){root.append(mk('h2',null,'My other submissions'));
    other.forEach(s=>{const c=mk('div','card');c.append(mk('h3',null,`${TASKS[s.task]} \u00b7 ${s.createdAt.toDate().toLocaleDateString('en-GB')}`),mk('span','pill '+(F[s.id]?'marked':'submitted'),F[s.id]?'Marked':'Submitted'));if(F[s.id])showFb(c,F[s.id],s.kind);root.append(c);});}
}
function showFb(c,f,kind){const b=mk('div','fbbox');b.append(mk('h4',null,`Overall band ${f.overall}`));const t=mk('table');CRIT[kind].forEach((n,i)=>{const r=mk('tr');r.append(mk('td',null,n),mk('td',null,f['c'+(i+1)]));t.append(r);});b.append(t);
  if(f.comments){b.append(mk('h4',null,'Comments'));f.comments.split('\n').filter(Boolean).forEach(l=>b.append(mk('p','cmt',l)));}
  if(f.labels&&f.labels.length){const p=mk('p',null,'Focus on: ');p.append(f.labels.map(l=>`${l} (${(window.IYP_TAGS||{})[l]||''})`).join(', '));b.append(p);}
  if(f.nextLesson)b.append(link(f.nextLesson,'Recommended next lesson \u2192'));c.append(b);}
function form(c,kind,task,prompt,aid){const f=mk('div','subform');let t0=Date.now();const timer=mk('span','timer');const iv=setInterval(()=>{const s=Math.round((Date.now()-t0)/1000);timer.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;},1000);
  f.append(mk('p',null,TASKS[task]),timer);const ta=mk('textarea');ta.rows=kind==='writing'?14:4;ta.maxLength=10000;ta.placeholder=kind==='writing'?'Type your answer here':'Optional notes or a transcript';
  const wc=mk('p','wc','0 words');ta.oninput=()=>{const n=(ta.value.trim().match(/\S+/g)||[]).length;wc.textContent=`${n} words`+(task==='W1'&&n<150?' (aim for 150+)':task==='W2'&&n<250?' (aim for 250+)':'');};f.append(ta,wc);
  let audio='',mime='';const msg=mk('p');
  if(kind==='speaking'){const rec=mk('button',null,'\u25cf Record (max 2 min)'),pl=mk('audio');pl.controls=true;const lk=mk('input','ans-in');lk.placeholder='Or paste a https:// link to your recording';lk.maxLength=300;f.append(rec,pl,lk);f.dataset.link='';
    let mr,chunks=[],to;rec.onclick=async()=>{if(mr&&mr.state==='recording'){mr.stop();return;}
      try{const st=await navigator.mediaDevices.getUserMedia({audio:true});const types=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4'];const ty=types.find(x=>window.MediaRecorder&&MediaRecorder.isTypeSupported(x))||'';
        mr=new MediaRecorder(st,{mimeType:ty,audioBitsPerSecond:24000});chunks=[];mr.ondataavailable=e=>chunks.push(e.data);
        mr.onstop=async()=>{clearTimeout(to);st.getTracks().forEach(t=>t.stop());rec.textContent='\u25cf Record again';const bl=new Blob(chunks,{type:mr.mimeType});pl.src=URL.createObjectURL(bl);
          mime=mr.mimeType.split(';')[0];const b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(String(fr.result).split(',')[1]);fr.readAsDataURL(bl);});
          if(b64.length>900000){audio='';msg.textContent='Recording too long to save. Please keep it under 2 minutes.';}else{audio=b64;msg.textContent='Recording ready ('+Math.round(b64.length/1365)+' KB).';}};
        mr.start();rec.textContent='\u25a0 Stop';to=setTimeout(()=>mr.state==='recording'&&mr.stop(),120000);}catch(e){msg.textContent='Microphone not available. You can paste a link or type notes instead.';}};
    f.linkInput=lk;}
  const sb=mk('button','gold','Submit');sb.onclick=async()=>{const words=(ta.value.trim().match(/\S+/g)||[]).length;const lnk=f.linkInput?f.linkInput.value.trim():'';
    if(lnk&&!/^https:\/\/[^ <>"]+$/.test(lnk)){msg.textContent='Links must start with https://';return;}
    if(!ta.value.trim()&&!audio&&!lnk){msg.textContent='Nothing to submit yet.';return;}
    sb.disabled=true;try{const tk=(await u.getIdTokenResult()).claims;await addDoc(collection(db,'submissions'),{uid:u.uid,name:tk.name||'',assignmentId:aid,kind,task,prompt:String(prompt||'').slice(0,2000),text:ta.value.slice(0,10000),words,timeSec:Math.min(36000,Math.round((Date.now()-t0)/1000)),audio,audioMime:audio?mime:'',link:lnk,createdAt:serverTimestamp()});
      clearInterval(iv);msg.textContent='Submitted. Your tutor will mark it.';setTimeout(load,800);}catch(e){sb.disabled=false;msg.textContent='Could not submit. Please try again.';}};
  f.append(sb,msg);c.append(f);}
