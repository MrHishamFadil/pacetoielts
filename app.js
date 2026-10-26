// Click-to-check answers, per-section score, timers, progress in localStorage.
(function(){
const KEY=()=> 'iyp_progress_'+((window.IYP_USER&&window.IYP_USER.uid)||'guest');
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY()))||{}}catch(e){return{}}};
const save=(id,sc,tot,title)=>{const p=load();p[id]={score:sc,total:tot,title:title,date:new Date().toISOString()};localStorage.setItem(KEY(),JSON.stringify(p));};
window.IYP_LOAD=load;
const norm=s=>s.toLowerCase().replace(/&[a-z]+;/g,'').replace(/[.'"’()]/g,'').replace(/\s+/g,' ').trim();
function keys(a){
  let k=a.split(/:\s/)[0];                 // drop explanation
  const opts=k.split(/\s*\/\s*/);
  const out=[];opts.forEach(o=>{out.push(norm(o));out.push(norm(o.replace(/\(.*?\)/g,'')));});
  return out.filter(Boolean);
}
document.querySelectorAll('.quiz').forEach(q=>{
  const qs=[...q.querySelectorAll('ol')].filter(o=>!o.closest('details')).flatMap(o=>[...o.children]);
  const as=[...q.querySelectorAll('details.answers li')];
  if(!qs.length||qs.length!==as.length) return;
  qs.forEach((li,i)=>{const inp=document.createElement('input');inp.className='ans-in';inp.placeholder='Your answer';inp.setAttribute('aria-label','Answer '+(i+1));inp.dataset.k=JSON.stringify(keys(as[i].textContent));li.appendChild(inp);const fb=document.createElement('span');fb.className='fb';li.appendChild(fb);});
  const bar=document.createElement('div');bar.className='toolbar';
  const mins=+q.dataset.min||20;
  bar.innerHTML=`<button class="gold chk">Check answers</button><span class="score">Score: –/${qs.length}</span><button class="tm">Start ${mins}:00 timer</button><span class="timer"></span><button class="rs">Reset</button>`;
  q.insertBefore(bar,q.children[1]);
  const sc=bar.querySelector('.score'),tm=bar.querySelector('.timer');let iv=null;
  bar.querySelector('.chk').onclick=()=>{let n=0;q.querySelectorAll('.ans-in').forEach((inp,i)=>{const k=JSON.parse(inp.dataset.k);const v=norm(inp.value);const ok=v&&k.some(x=>x===v||(x.length>2&&v.replace(/^the /,'')===x.replace(/^the /,'')));inp.classList.toggle('ok',!!ok);inp.classList.toggle('bad',!ok);const fb=inp.nextSibling;fb.className='fb '+(ok?'ok':'bad');fb.textContent=ok?'✓ Correct':'✗ Answer: '+as[i].textContent;if(ok)n++;});sc.textContent=`Score: ${n}/${qs.length}`;save(location.pathname.split('/').pop()+'#'+q.id,n,qs.length,q.querySelector('h2').textContent);if(iv){clearInterval(iv);iv=null;}};
  bar.querySelector('.tm').onclick=()=>{if(iv)clearInterval(iv);let s=mins*60;const t=()=>{tm.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');if(s--<=0){clearInterval(iv);iv=null;tm.textContent="Time's up";}};t();iv=setInterval(t,1000);};
  bar.querySelector('.rs').onclick=()=>{q.querySelectorAll('.ans-in').forEach(i=>{i.value='';i.className='ans-in';i.nextSibling.textContent='';});sc.textContent=`Score: –/${qs.length}`;if(iv)clearInterval(iv);iv=null;tm.textContent='';};
});
// dashboard
function dash(){const el=document.getElementById('dash');if(!el)return;const p=load();const u=window.IYP_USER;
  let h=u?`<p>Welcome back, <strong>${(u.name||'').replace(/</g,'')}</strong>. Your progress is saved on this device.</p>`:`<p>You are practising as a guest. <button class="gold" onclick="iypLogin()">Sign in with Google</button> to keep a personal record.</p>`;
  const ids=Object.keys(p);if(!ids.length){h+='<div class="card"><p>No scores yet. Try a <a href="reading.html">reading passage</a> or a <a href="listening.html">listening section</a> and press <em>Check answers</em>.</p></div>';}
  else{let a=0,b=0;h+='<div class="grid g2">'+ids.map(id=>{const r=p[id];a+=r.score;b+=r.total;const pc=Math.round(100*r.score/r.total);return `<div class="card"><h3>${r.title}</h3><p>${r.score}/${r.total} (${pc}%) &middot; ${new Date(r.date).toLocaleDateString()}</p><div class="progress"><i style="width:${pc}%"></i></div></div>`}).join('')+'</div>';h=`<div class="card"><h3>Overall</h3><p>${a}/${b} correct across ${ids.length} sections</p><div class="progress"><i style="width:${Math.round(100*a/b)}%"></i></div></div>`+h;}
  el.innerHTML=h;}
document.addEventListener('iyp-auth',dash);dash();
})();
