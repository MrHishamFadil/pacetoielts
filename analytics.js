// Tutor analytics (read-only). Client gate mirrors session.js; real enforcement is Firestore isAdmin().
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, collectionGroup, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const TUTORS=['hisham.abdelfadil2@gmail.com','hisham.abdelfadil@gmail.com'];
const $=id=>document.getElementById(id);
const mk=(t,x,c)=>{const e=document.createElement(t);if(x!=null)e.textContent=String(x);if(c)e.className=c;return e;};
const ts=x=>x&&x.toDate?x.toDate():null;const DAY=864e5;
const fmt=d=>d?d.toLocaleDateString('en-GB',{timeZone:'Asia/Riyadh',dateStyle:'medium'}):'\u2013';
const TAGN=()=>window.IYP_TAGS||{};
function skillOf(sec){if(/^reading_|^r-/.test(sec))return'Reading';if(/^listening_|^l-/.test(sec))return'Listening';return null;}
let D,started=false;
function gate(u){if(!u||!TUTORS.includes((u.email||'').toLowerCase())){location.replace('index.html');return;}if(started)return;started=true;load().catch(e=>{$('an').replaceChildren(mk('p','Access denied or failed to load.'));});}
document.addEventListener('iyp-auth',e=>gate(e.detail));if(window.IYP_USER!==undefined)gate(window.IYP_USER);
async function load(){const db=getFirestore(getApp());
  const g=p=>getDocs(p).catch(()=>({forEach(){},docs:[]}));
  const [us,at,mi,me,cl,as,su,fb]=await Promise.all([g(collection(db,'users')),g(collectionGroup(db,'attempts')),g(collectionGroup(db,'mistakes')),g(collection(db,'members')),g(collection(db,'classes')),g(collection(db,'assignments')),g(collection(db,'submissions')),g(collection(db,'feedback'))]);
  D={users:{},att:[],mis:[],members:{},classes:{all:{name:'All students'}},asg:[],subs:[],fb:{}};
  us.forEach(d=>{const x=d.data();if(TUTORS.includes(x.email))return;D.users[d.id]={name:x.displayName||x.email||'(no name)',email:x.email,first:ts(x.firstSeen),last:ts(x.lastSeen)};});
  at.forEach(d=>{const x=d.data();D.att.push({...x,uid:x.uid||d.ref.parent.parent.id,date:ts(x.date)});});
  mi.forEach(d=>D.mis.push({...d.data(),uid:d.ref.parent.parent.id}));
  me.forEach(d=>D.members[d.id]=d.data());cl.forEach(d=>{if(d.id!=='all')D.classes[d.id]=d.data();});
  as.forEach(d=>D.asg.push({id:d.id,...d.data()}));su.forEach(d=>D.subs.push({id:d.id,...d.data(),createdAt:ts(d.data().createdAt)}));fb.forEach(d=>D.fb[d.id]=d.data());
  render('');}
function inClass(uid,c){return !c||(D.members[uid]||{}).classId===c;}
function assignedTo(a,uid){return a.studentUid===uid||a.classId==='all'||(a.classId&&(D.members[uid]||{}).classId===a.classId);}
function lastActive(uid){const u=D.users[uid];return [u.last,...D.att.filter(a=>a.uid===uid).map(a=>a.date),...D.subs.filter(s=>s.uid===uid).map(s=>s.createdAt)].filter(Boolean).sort((a,b)=>b-a)[0]||null;}
function bars(rows,navy){const w=mk('div',null,'bars');rows.forEach(([l,v,txt])=>{const r=mk('div',null,'row');const t=mk('div',null,'trk');const f=mk('div',null,'fill'+(navy?' n':''));f.style.width=Math.max(0,Math.min(100,v))+'%';t.append(f);r.append(mk('span',l),t,mk('span',txt));w.append(r);});if(!rows.length)w.append(mk('p','No data yet.'));return w;}
function weekChart(uids){const now=Date.now(),N=8,c=Array(N).fill(0);uids.forEach(u=>{const f=D.users[u].first;if(!f)return;const k=Math.floor((now-f)/(7*DAY));if(k<N)c[N-1-k]++;});
  const mx=Math.max(1,...c),W=420,H=150,bw=W/N;const NS='http://www.w3.org/2000/svg';const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox',`0 0 ${W} ${H+24}`);s.setAttribute('role','img');s.setAttribute('aria-label','New sign-ups per week');
  c.forEach((v,i)=>{const h=v/mx*(H-20);const r=document.createElementNS(NS,'rect');r.setAttribute('x',i*bw+8);r.setAttribute('y',H-h);r.setAttribute('width',bw-16);r.setAttribute('height',h);r.setAttribute('rx',4);r.setAttribute('fill','#1B2A4A');s.append(r);
    const t=document.createElementNS(NS,'text');t.setAttribute('x',i*bw+bw/2);t.setAttribute('y',H-h-4);t.setAttribute('text-anchor','middle');t.setAttribute('font-size','12');t.textContent=v;s.append(t);
    const l=document.createElementNS(NS,'text');l.setAttribute('x',i*bw+bw/2);l.setAttribute('y',H+16);l.setAttribute('text-anchor','middle');l.setAttribute('font-size','11');l.setAttribute('fill','#5a6478');l.textContent=i===N-1?'this wk':`-${N-1-i}w`;s.append(l);});
  const d=mk('div',null,'achart');d.append(s);return d;}
function card(title,...kids){const c=mk('div',null,'card');c.append(mk('h3',title),...kids);return c;}
function render(cls){const v=$('an');v.replaceChildren();const now=Date.now();
  const cf=mk('select');cf.append(new Option('All classes',''));Object.entries(D.classes).forEach(([id,c])=>cf.append(new Option(c.name,id)));cf.value=cls;cf.onchange=()=>render(cf.value);
  const uids=Object.keys(D.users).filter(u=>inClass(u,cls));const S=new Set(uids);
  const att=D.att.filter(a=>S.has(a.uid)),mis=D.mis.filter(m=>S.has(m.uid)),subs=D.subs.filter(s=>S.has(s.uid));
  const act=n=>uids.filter(u=>{const l=lastActive(u);return l&&now-l<=n*DAY;}).length;
  const k=mk('div',null,'kpis');[[uids.length,'Total students'],[act(7),'Active last 7 days'],[act(30),'Active last 30 days'],[att.length,'Tests taken'],[subs.length,'Homework submissions']].forEach(([n,l])=>{const x=mk('div',null,'kpi');x.append(mk('b',n),mk('span',l));k.append(x);});
  // skills: R/L from attempt %, W/S from tutor feedback bands (shown as band, bar = band/9)
  const sk={Reading:[],Listening:[]};att.forEach(a=>{const s=skillOf(a.section||'');if(s)sk[s].push(a.pct);});
  const bandBy={writing:[],speaking:[]};subs.forEach(s=>{const f=D.fb[s.id];if(f&&bandBy[s.kind])bandBy[s.kind].push(f.overall);});
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  const skr=[];['Reading','Listening'].forEach(s=>{const m=avg(sk[s]);skr.push([s,m||0,m==null?'\u2013':Math.round(m)+'%']);});
  [['Writing','writing'],['Speaking','speaking']].forEach(([l,k2])=>{const m=avg(bandBy[k2]);skr.push([l,m?m/9*100:0,m==null?'\u2013':'B'+(Math.round(m*2)/2)]);});
  const tc={};mis.forEach(m=>{if(m.tag)tc[m.tag]=(tc[m.tag]||0)+1;});const top=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,5);const tmx=top.length?top[0][1]:1;
  const hw=D.asg.filter(a=>!cls||a.classId===cls||a.classId==='all'||S.has(a.studentUid)).map(a=>{const tgt=uids.filter(u=>assignedTo(a,u));const done=new Set(subs.filter(s=>s.assignmentId===a.id).map(s=>s.uid));const n=tgt.filter(u=>done.has(u)).length;return [a.title,tgt.length?100*n/tgt.length:0,`${n}/${tgt.length}`];});
  const grid=mk('div',null,'agrid');
  grid.append(card('New sign-ups per week',weekChart(uids)),card('Average score by skill',bars(skr),mk('p','Reading/Listening: average test %. Writing/Speaking: average marked band (bar = band out of 9).','disclaimer')),
    card('Top 5 weak micro-skills (mistake log)',bars(top.map(([t,n])=>[`${t} ${TAGN()[t]||''}`.slice(0,22),100*n/tmx,n]),true)),card('Homework completion by assignment',bars(hw)));
  // per-student table
  const rows=uids.map(u=>{const a=att.filter(x=>x.uid===u);const tgt=D.asg.filter(x=>assignedTo(x,u));const done=new Set(subs.filter(s=>s.uid===u).map(s=>s.assignmentId));
    const marked=subs.filter(s=>s.uid===u&&D.fb[s.id]).sort((x,y)=>(y.createdAt||0)-(x.createdAt||0));
    return {name:D.users[u].name,last:lastActive(u),n:a.length,avg:a.length?Math.round(avg(a.map(x=>x.pct))):-1,hd:tgt.filter(x=>done.has(x.id)).length,ht:tgt.length,band:marked.length?D.fb[marked[0].id].overall:-1};});
  const cols=[['Name','name'],['Last active','last'],['Attempts','n'],['Avg %','avg'],['Homework','hd'],['Latest band','band']];let sk2='last',dir=-1;
  const tb=mk('tbody');const draw=()=>{tb.replaceChildren();rows.slice().sort((x,y)=>{const a=x[sk2]??0,b=y[sk2]??0;return (a>b?1:a<b?-1:0)*dir;}).forEach(r=>{const tr=mk('tr');tr.append(mk('td',r.name),mk('td',fmt(r.last)),mk('td',r.n),mk('td',r.avg<0?'\u2013':r.avg+'%'),mk('td',`${r.hd}/${r.ht}`),mk('td',r.band<0?'\u2013':r.band));tb.append(tr);});};
  const t=mk('table');const h=mk('tr');cols.forEach(([l,key])=>{const th=mk('th',l,'sort');th.onclick=()=>{if(sk2===key)dir=-dir;else{sk2=key;dir=key==='name'?1:-1;}draw();};h.append(th);});t.append(h,tb);draw();
  const w=mk('div',null,'tablewrap');w.append(t);
  const fl=mk('p');fl.append('Filter by class: ',cf);
  v.append(fl,k,grid,card('Students (click a heading to sort)',w));}
