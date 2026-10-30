// Session teaching flow (tutor only). Client-side gate: NOT a security boundary.
(function(){
const TUTORS=['hisham.abdelfadil2@gmail.com','hisham.abdelfadil@gmail.com'];
const $=id=>document.getElementById(id);
let started=false;
function gate(u){ if(!u||!TUTORS.includes((u.email||'').toLowerCase())){location.replace('index.html');return;}
  if(started)return;started=true;load();}
async function load(){
 try{let n=0;while(!window.PTI_LOAD_LESSON&&n++<50)await new Promise(r=>setTimeout(r,100));
  const d=await window.PTI_LOAD_LESSON('session-1');if(!d)throw new Error('missing');window.PTI_LESSON=d;
  document.querySelectorAll('[data-slot]').forEach(s=>{const h=(d.slots||[])[+s.dataset.slot];if(h!=null)s.outerHTML=h;});
  const f=document.querySelectorAll('[data-quiz] select,[data-quiz] input');(d.answers||[]).forEach((a,i)=>{if(f[i])f[i].dataset.a=a;});
 }catch(e){$('gatemsg').textContent='Could not load the tutor notes. Check you are signed in with a tutor account, then reload.';return;}
 $('gatemsg').remove();$('app').hidden=false;init();}
document.addEventListener('iyp-auth',e=>gate(e.detail));
if(window.IYP_USER!==undefined)gate(window.IYP_USER);

function init(){
 const steps=[...document.querySelectorAll('.step')],tabs=$('stabs');let cur=0;
 const T=steps.map(()=>({ms:0,run:false,t0:0,extra:0}));
 steps.forEach((s,i)=>{const b=document.createElement('button');b.textContent=s.dataset.title;b.onclick=()=>go(i);tabs.append(b);});
 function el(i){const t=T[i];return t.ms+(t.run?Date.now()-t.t0:0);}
 function sug(i){return (+steps[i].dataset.min+T[i].extra)*60000;}
 function f(ms){const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
 function draw(){const e=el(cur),g=sug(cur);$('tclock').textContent=f(e);
  $('tsug').textContent=g?'of about '+Math.round(g/60000)+' min (take longer if needed)':'(no timer needed)';
document.querySelector('.tbar').classList.toggle('over',g>0&&e>g);
  $('tstart').textContent=T[cur].run?'Pause':(e?'Resume':'Start');}
 function go(i){cur=Math.max(0,Math.min(steps.length-1,i));steps.forEach((s,j)=>s.classList.toggle('on',j===cur));
  [...tabs.children].forEach((b,j)=>b.classList.toggle('on',j===cur));$('back').disabled=cur===0;$('next').disabled=cur===steps.length-1;draw();scrollTo(0,0);}
 $('tstart').onclick=()=>{const t=T[cur];if(t.run){t.ms+=Date.now()-t.t0;t.run=false;}else{t.t0=Date.now();t.run=true;}draw();};
 $('tplus').onclick=()=>{T[cur].extra+=5;draw();};
 $('treset').onclick=()=>{T[cur]={ms:0,run:false,t0:0,extra:0};draw();};
 $('back').onclick=()=>go(cur-1);$('next').onclick=()=>go(cur+1);
 setInterval(draw,500);
 // quizzes
 const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
 document.querySelectorAll('[data-quiz]').forEach(q=>{q.querySelector('[data-check]').onclick=()=>{let n=0;const f=q.querySelectorAll('[data-a]');
  f.forEach(x=>{const ok=x.dataset.a.split('|').includes(norm(x.value));x.classList.toggle('ok',ok);x.classList.toggle('bad',!ok);if(ok)n++;});
  q.querySelector('.score').textContent=n+' / '+f.length;};});
 // listening: two British voices
 const L=(window.PTI_LESSON&&window.PTI_LESSON.script||[]).map(x=>[x.w,x.t]);
 const N={R:'Receptionist',O:'Omar'};
 L.forEach(([w,t])=>{const p=document.createElement('p');p.className='line';const b=document.createElement('b');b.textContent=N[w]+': ';p.append(b,t);$('script').append(p);});
 const S=window.speechSynthesis;let V={R:null,O:null},idx=0,playing=false;
 function pick(){if(!S)return;const all=S.getVoices(),gb=all.filter(v=>/en[-_]GB/i.test(v.lang));
  const fem=gb.find(v=>/female|libby|sonia|serena|kate|hazel|susan|martha|amy|emma/i.test(v.name)),mal=gb.find(v=>/male|ryan|daniel|arthur|george|oliver|brian|thomas/i.test(v.name)&&!/female/i.test(v.name));
  V.R=fem||gb[0]||null;V.O=(mal&&mal!==V.R)?mal:(gb.find(v=>v!==V.R)||V.R);
  $('lvoices').textContent=!gb.length?'No British voice on this device: a default voice will be used (or read it aloud).':(V.R===V.O?'Only one British voice found: pitch is changed for Omar.':'Voices: '+V.R.name+' / '+V.O.name);}
 if(S){pick();S.onvoiceschanged=pick;}else{$('lvoices').textContent='This browser cannot play speech. Please read the script aloud.';}
 function say(){if(!playing||idx>=L.length){playing=false;if(idx>=L.length)idx=0;return;}const[w,t]=L[idx];const u=new SpeechSynthesisUtterance(t);
  u.lang='en-GB';if(V[w])u.voice=V[w];u.rate=0.95;if(V.R===V.O&&w==='O')u.pitch=0.7;u.onend=()=>{if(!playing)return;idx++;setTimeout(say,450);};S.speak(u);}
 $('lplay').onclick=()=>{if(!S)return;if(S.paused){S.resume();playing=true;return;}if(playing)return;playing=true;say();};
 $('lpause').onclick=()=>{if(S&&S.speaking)S.pause();};
 $('lstop').onclick=()=>{playing=false;idx=0;if(S)S.cancel();};
 // score sheet
 const K='pti_s1_sheet';let D={};try{D=JSON.parse(localStorage.getItem(K)||'{}');}catch(e){}
 document.querySelectorAll('#sheet [data-k]').forEach(x=>{if(D[x.dataset.k]!=null)x.value=D[x.dataset.k];x.oninput=()=>{D[x.dataset.k]=x.value;localStorage.setItem(K,JSON.stringify(D));};});
 $('sprint').onclick=()=>print();
 $('sclear').onclick=()=>{if(!confirm('Clear the score sheet?'))return;localStorage.removeItem(K);D={};document.querySelectorAll('#sheet [data-k]').forEach(x=>x.value='');};
 go(0);
}})();
