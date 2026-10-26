// Click-to-check answers, timers; progress saved to Firestore users/{uid}/scores (owner-only).
(function(){
const norm=s=>s.toLowerCase().replace(/&[a-z]+;/g,'').replace(/[.'"’()]/g,'').replace(/\s+/g,' ').trim();
function keys(a){
  let k=a.split(/:\s/)[0];                 // drop explanation
  const opts=k.split(/\s*\/\s*/);
  const out=[];opts.forEach(o=>{out.push(norm(o));out.push(norm(o.replace(/\(.*?\)/g,'')));});
  return out.filter(Boolean);
}
window.IYP_INIT=function(){
document.querySelectorAll('.quiz').forEach(q=>{
  const qs=[...q.querySelectorAll('ol')].filter(o=>!o.closest('details')).flatMap(o=>[...o.children]);
  const as=[...q.querySelectorAll('details.answers li')];
  if(!qs.length||qs.length!==as.length) return;
  qs.forEach((li,i)=>{const inp=document.createElement('input');inp.className='ans-in';inp.placeholder='Your answer';inp.setAttribute('aria-label','Answer '+(i+1));inp.dataset.k=JSON.stringify(keys(as[i].textContent));li.appendChild(inp);const fb=document.createElement('span');fb.className='fb';li.appendChild(fb);});
  const bar=document.createElement('div');bar.className='toolbar';
  const mins=+q.dataset.min||20;
  bar.innerHTML=`<button class="gold chk">Check answers</button><span class="score">Score: –/${qs.length}</span><button class="tm">Start ${mins}:00 timer</button><span class="timer"></span><button class="rs">Reset</button>`;
  q.insertBefore(bar,q.children[1]);
  let t0=Date.now();q.addEventListener('focusin',()=>{if(!t0)t0=Date.now();});
  const sc=bar.querySelector('.score'),tm=bar.querySelector('.timer');let iv=null;
  bar.querySelector('.chk').onclick=()=>{let n=0;const given=[],right=[];q.querySelectorAll('.ans-in').forEach((inp,i)=>{const k=JSON.parse(inp.dataset.k);const v=norm(inp.value);const ok=v&&k.some(x=>x===v||(x.length>2&&v.replace(/^the /,'')===x.replace(/^the /,'')));inp.classList.toggle('ok',!!ok);inp.classList.toggle('bad',!ok);const fb=inp.nextSibling;fb.className='fb '+(ok?'ok':'bad');fb.textContent=ok?'✓ Correct':'✗ Answer: '+as[i].textContent;if(ok)n++;given.push(inp.value.slice(0,80));right.push(ok?'1':'0');});sc.textContent=`Score: ${n}/${qs.length}`;window.IYP_SAVE&&window.IYP_SAVE(location.pathname.split('/').pop().replace('.html','')+'_'+q.id,n,qs.length,q.querySelector('h2').textContent).catch(()=>{});window.IYP_ATTEMPT&&window.IYP_ATTEMPT({section:location.pathname.split('/').pop().replace('.html','')+'_'+q.id,score:n,max:qs.length,timeSec:Math.round((Date.now()-(t0||Date.now()))/1000),given:given,correct:as.map(a=>a.textContent.split(/:\s/)[0].trim().slice(0,80)),results:right.join('')}).catch(()=>{});if(iv){clearInterval(iv);iv=null;}};
  bar.querySelector('.tm').onclick=()=>{if(iv)clearInterval(iv);let s=mins*60;const t=()=>{tm.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');if(s--<=0){clearInterval(iv);iv=null;tm.textContent="Time's up";}};t();iv=setInterval(t,1000);};
  bar.querySelector('.rs').onclick=()=>{t0=Date.now();q.querySelectorAll('.ans-in').forEach(i=>{i.value='';i.className='ans-in';i.nextSibling.textContent='';});sc.textContent=`Score: –/${qs.length}`;if(iv)clearInterval(iv);iv=null;tm.textContent='';};
});
dash();};
function mk(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function bar(pc){const d=mk('div','progress'),i=mk('i');i.style.width=pc+'%';d.append(i);return d;}
async function dash(){const el=document.getElementById('dash');if(!el||!window.IYP_LOADP)return;
  let p={};try{p=await window.IYP_LOADP();}catch(e){}
  const u=window.IYP_USER;el.replaceChildren();
  const w=mk('p',null,'Welcome back, ');w.append(mk('strong',null,(u&&u.name)||'learner'));w.append('. Your progress is saved to your account and follows you across devices.');
  const ids=Object.keys(p);
  if(!ids.length){el.append(w);const c=mk('div','card'),q=mk('p',null,'No scores yet. Open a reading passage or listening section and press Check answers.');c.append(q);el.append(c);return;}
  let a=0,b=0;const g=mk('div','grid g2');
  ids.forEach(id=>{const r=p[id];a+=r.score;b+=r.total;const pc=Math.round(100*r.score/r.total);const c=mk('div','card');c.append(mk('h3',null,r.title),mk('p',null,`${r.score}/${r.total} (${pc}%) · ${r.date?new Date(r.date).toLocaleDateString():''}`),bar(pc));g.append(c);});
  const o=mk('div','card');o.append(mk('h3',null,'Overall'),mk('p',null,`${a}/${b} correct across ${ids.length} sections`),bar(Math.round(100*a/b)));
  el.append(o,w,g);}
})();
