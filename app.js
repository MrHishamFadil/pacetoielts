// Quizzes with per-question feedback, micro-skill tags, mistake log, results dashboard, quick-nav.
// All learner data is rendered with textContent (never innerHTML).
(function(){
const TAGS={'L-PRED':'Predicting the answer type','L-KEY':'Hearing key words and paraphrase','L-DETAIL':'Catching specific detail','L-DIST':'Avoiding distractors','L-OPIN':'Recognising opinion and attitude','L-SPELL':'Spelling and numbers','R-PREV':'Previewing a text','R-PRED':'Predicting content','R-SKIM':'Skimming for gist','R-SCAN':'Scanning for detail','R-INT':'Inference','R-PARA':'Recognising paraphrase','R-COH':'Following cohesion','R-OPIN':'Writer\u2019s views and claims','W1-OV':'Overview','W1-FEAT':'Selecting key features','W1-COMP':'Comparisons','W1-TREND':'Trend language','W1-PREC':'Data precision','W1-PASS':'Passive and process language','W2-QAN':'Question analysis','W2-POS':'Clear position','W2-IDEA':'Idea development','W2-COH':'Coherence and cohesion','W2-LR':'Lexical resource','W2-GRA':'Grammatical range and accuracy','S-FLU':'Fluency','S-COH':'Coherence','S-LR':'Lexical resource','S-GRA':'Grammatical range and accuracy','S-PRON':'Pronunciation','S-EXT':'Extending answers','S-P3DISC':'Part 3 discussion'};
window.IYP_TAGS=TAGS;
const LESSON={'L-PRED':'l-predicting.html','L-KEY':'l-keywords.html','L-DETAIL':'l-specific-info.html','L-DIST':'l-distractors.html','L-OPIN':'l-attitude.html','L-SPELL':'l-spelling-numbers.html','R-COH':'r-cohesion.html','R-INT':'r-guessing-context.html','R-PARA':'lessons.html','R-SCAN':'lessons.html','R-SKIM':'lessons.html','R-OPIN':'lessons.html','R-PREV':'lessons.html','R-PRED':'lessons.html'};
const lessonFor=t=>LESSON[t]||(t[0]==='W'?'writing.html':t[0]==='S'?'speaking.html':'lessons.html');
window.IYP_LESSON=lessonFor;
const FORM={'R-SKIM':'Choose the heading number (i, ii, iii\u2026) that sums up the whole paragraph, not one detail.','R-PARA':'Write TRUE, FALSE or NOT GIVEN exactly. NOT GIVEN means the text says nothing either way.','R-SCAN':'Copy words from the text, within the word limit, spelled exactly as written.','R-INT':'Write one letter only. The answer must be supported by the text, not by general knowledge.','R-COH':'The missing word must fit the grammar of the summary and agree with any reference word.','R-OPIN':'Write YES, NO or NOT GIVEN for the writer\u2019s views.','L-SPELL':'Write numbers as digits; spelling and plural endings must be exact.','L-DIST':'Write one letter only, the option the speakers finally agree on.','L-DETAIL':'Keep within the word limit and match the grammar around the gap.','L-KEY':'Write the words you hear, in the form the gap needs.','L-OPIN':'Choose the option that matches the speaker\u2019s feeling, not just their words.','L-PRED':'Check the gap needs the part of speech you wrote.'};
const STOP=new Set('the a an of to in on and or is are was were be been for with that this which what who by as at from it its their his her than more most some any each other into about should must can could will would does did do has have had not no only all both your you write words answer questions choose letter paragraph text complete'.split(' '));
const norm=s=>s.toLowerCase().replace(/&[a-z]+;/g,'').replace(/[.'"’()]/g,'').replace(/\s+/g,' ').trim();
function keys(a){const k=a.split(/:\s/)[0];const out=[];k.split(/\s*\/\s*/).forEach(o=>{out.push(norm(o));out.push(norm(o.replace(/\(.*?\)/g,'')));});return out.filter(Boolean);}
const NUMW={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50};
const MINW={'oclock':0,'fifteen':15,'thirty':30,'fortyfive':45,'fortyfive':45,'oh five':5};
// Canonical form for times and numbers: "6:30", "6.30 a.m.", "six thirty", "half past six" -> "6:30"; "three" -> "3".
function canon(x){const r=canon0(x);return r.replace(/^(\d{1,2}):00$/,'$1');}
function canon0(x){let s=String(x).toLowerCase().replace(/&[a-z]+;/g,'').replace(/[’']/g,'').replace(/\s+/g,' ').trim();
  s=s.replace(/\s?(a\.?\s?m\.?|p\.?\s?m\.?|in the (morning|afternoon|evening)|at night)$/,'').trim();
  const w=t=>t in NUMW?NUMW[t]:(/^\d+$/.test(t)?+t:null);
  let m;
  if(m=s.match(/^half past (\w+)$/)){const h=w(m[1]);if(h!=null)return h+':30';}
  if(m=s.match(/^quarter past (\w+)$/)){const h=w(m[1]);if(h!=null)return h+':15';}
  if(m=s.match(/^quarter to (\w+)$/)){const h=w(m[1]);if(h!=null)return (h-1)+':45';}
  if(m=s.match(/^(\w+) ?o ?clock$/)){const h=w(m[1]);if(h!=null)return h+':00';}
  if(m=s.match(/^(\d{1,2}) ?[:.] ?(\d{2})$/))return (+m[1])+':'+m[2];
  if(m=s.match(/^(\w+) (\w+(?:[- ]\w+)?)$/)){const h=w(m[1]);const mm=m[2].replace(/[- ]/g,'');const mv=mm==='thirty'?30:mm==='fifteen'?15:mm==='fortyfive'?45:null;if(h!=null&&h<=12&&mv!=null)return h+':'+String(mv).padStart(2,'0');}
  if((m=s.match(/^(\d{1,2})$/))&&/(a\.?m|p\.?m|morning|evening|afternoon)/.test(String(x).toLowerCase()))return (+m[1])+':00';
  if(s in NUMW)return String(NUMW[s]);
  if(m=s.match(/^(twenty|thirty|forty|fifty)[- ]?(one|two|three|four|five|six|seven|eight|nine)$/))return String(NUMW[m[1]]+NUMW[m[2]]);
  return s.replace(/\s+/g,'');}
window.IYP_MATCH=function(given,answer){const v=norm(given);if(!v)return false;const k=keys(answer);const cv=canon(given);
  return k.some(x=>x===v||x.replace(/\s+/g,'')===v.replace(/\s+/g,'')||(x.length>2&&v.replace(/^the /,'')===x.replace(/^the /,'')))||answer.split(/:\s/)[0].split('/').some(o=>[o,o.replace(/\(.*?\)/g,'')].some(r=>canon(r)===cv));};
function lev(a,b){const m=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=m[0];m[0]=i;for(let j=1;j<=b.length;j++){const t=m[j];m[j]=Math.min(m[j]+1,m[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t;}}return m[b.length];}
function tagFor(q,li,ans,i){
  if(q.dataset.tags){const t=q.dataset.tags.split(',');return t[i%t.length];}
  let h=li.closest('ol');while(h&&!/^H[23]$/.test(h.tagName))h=h.previousElementSibling;const ht=h?h.textContent.toLowerCase():'';
  if(location.pathname.includes('listening')){const a=ans.split(/:\s/)[0].trim();return /\d/.test(a)?'L-SPELL':/^[A-H]$/.test(a)?'L-DIST':'L-DETAIL';}
  if(ht.includes('heading'))return 'R-SKIM';if(ht.includes('true'))return 'R-PARA';if(ht.includes('yes'))return 'R-OPIN';if(ht.includes('multiple'))return 'R-INT';if(ht.includes('summary'))return 'R-COH';return 'R-SCAN';}
function cause(given,correct,tag,transcript){
  const g=norm(given),c=norm(correct.split(/:\s/)[0].split('/')[0]);if(!g)return '';
  if(/\d/.test(c)&&/\d/.test(g))return 'number';
  if(g.replace(/s$/,'')===c.replace(/s$/,''))return 'plural';
  if(lev(g,c)<=2)return 'spelling';
  if(tag==='L-OPIN')return 'attitude';
  if(transcript&&transcript.includes(g))return 'distractor';
  if(tag.startsWith('L-'))return 'paraphrase';return 'word-form';}
const CAUSE={distractor:'You wrote something that was mentioned but then rejected or changed (a distractor).',spelling:'Very close: a spelling slip costs the mark.',plural:'Check singular/plural: the -s ending matters.',number:'Number confusion: check teen/ty stress and the final figure the speaker confirmed.',attitude:'The speaker\u2019s attitude differs from the literal words.',paraphrase:'The audio used different words with the same meaning; listen for meaning, not matching words.','word-form':'Check the word form and the word limit.'};
function mk(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=String(x);return e;}
function link(href,text){const a=mk('a',null,text);a.href=href;return a;}
function feedback(li,qText,ansText,tag,cz){
  const box=mk('div','qfb');const kw=[...new Set(qText.toLowerCase().match(/[a-z][a-z-]{3,}/g)||[])].filter(w=>!STOP.has(w)).sort((a,b)=>b.length-a.length).slice(0,3);
  const exp=ansText.includes(': ')?ansText.split(/:\s/).slice(1).join(': '):'Find the sentence that means the same as the key words; the answer is usually close to them.';
  const rows=[['Skill to work on',`${tag} \u00b7 ${TAGS[tag]||''}`],['Key words',kw.join(', ')||'(look at the nouns in the question)'],['Paraphrase in the text',exp],['Answer form',FORM[tag]||'Follow the instructions and word limit.']];
  if(cz)rows.push(['Likely cause',CAUSE[cz]]);
  rows.forEach(([k,v])=>{const p=mk('p');p.append(mk('strong',null,k+': '),v);box.append(p);});
  const p=mk('p');p.append(mk('strong',null,'Next lesson: '),link(lessonFor(tag),'Review this skill \u2192'));box.append(p);li.append(box);}
window.IYP_INIT=function(){
document.querySelectorAll('.quiz').forEach(q=>{
  const qs=[...q.querySelectorAll('ol')].filter(o=>!o.closest('details')).flatMap(o=>[...o.children]);
  const as=[...q.querySelectorAll('details.answers li')];
  if(!qs.length||qs.length!==as.length) return;
  const qtext=qs.map(li=>li.textContent);const tags=qs.map((li,i)=>tagFor(q,li,as[i].textContent,i));
  const tr=(q.querySelector('.transcript')||q.querySelector('details:not(.answers)')||{textContent:''}).textContent.toLowerCase();
  qs.forEach((li,i)=>{const inp=mk('input','ans-in');inp.placeholder='Your answer';inp.setAttribute('aria-label','Answer '+(i+1));inp.dataset.k=JSON.stringify(keys(as[i].textContent));li.append(inp);li.append(mk('span','fb'));});
  const bar=mk('div','toolbar');const mins=+q.dataset.min||20;
  const chk=mk('button','gold chk','Check answers'),sc=mk('span','score',`Score: \u2013/${qs.length}`),tmb=mk('button','tm',`Start ${mins}:00 timer`),tm=mk('span','timer'),rs=mk('button','rs','Reset');
  bar.append(chk,sc,tmb,tm,rs);q.insertBefore(bar,q.children[1]);
  let t0=Date.now(),iv=null;const sid=location.pathname.split('/').pop().replace('.html','')+'_'+q.id;
  chk.onclick=()=>{let n=0;const given=[],right=[];q.querySelectorAll('.qfb').forEach(x=>x.remove());
    q.querySelectorAll('.ans-in').forEach((inp,i)=>{const ok=window.IYP_MATCH(inp.value,as[i].textContent);
      inp.classList.toggle('ok',ok);inp.classList.toggle('bad',!ok);const fb=inp.nextSibling;fb.className='fb '+(ok?'ok':'bad');fb.textContent=ok?'\u2713 Correct':'\u2717 Answer: '+as[i].textContent.split(/:\s/)[0];
      if(ok)n++;else{const cz=tags[i].startsWith('L-')?cause(inp.value,as[i].textContent,tags[i],tr):'';feedback(qs[i],qtext[i],as[i].textContent,tags[i],cz);
        window.IYP_MISTAKE&&window.IYP_MISTAKE({section:sid,q:i+1,tag:tags[i],cause:cz,given:inp.value.slice(0,80),correct:as[i].textContent.split(/:\s/)[0].slice(0,120)}).catch(()=>{});}
      given.push(inp.value.slice(0,80));right.push(ok?'1':'0');});
    sc.textContent=`Score: ${n}/${qs.length}`;
    window.IYP_SAVE&&window.IYP_SAVE(sid,n,qs.length,q.querySelector('h2').textContent).catch(()=>{});
    window.IYP_ATTEMPT&&window.IYP_ATTEMPT({section:sid,score:n,max:qs.length,timeSec:Math.round((Date.now()-t0)/1000),given,correct:as.map(a=>a.textContent.split(/:\s/)[0].trim().slice(0,80)),results:right.join(''),tags:tags.join(',')}).catch(()=>{});
    if(iv){clearInterval(iv);iv=null;}};
  tmb.onclick=()=>{if(iv)clearInterval(iv);let s=mins*60;const t=()=>{tm.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');if(s--<=0){clearInterval(iv);iv=null;tm.textContent="Time's up";}};t();iv=setInterval(t,1000);};
  rs.onclick=()=>{t0=Date.now();q.querySelectorAll('.qfb').forEach(x=>x.remove());q.querySelectorAll('.ans-in').forEach(i=>{i.value='';i.className='ans-in';i.nextSibling.textContent='';});sc.textContent=`Score: \u2013/${qs.length}`;if(iv)clearInterval(iv);iv=null;tm.textContent='';};
});
quicknav();dash();results();mistakes();if(location.hash){const t=document.getElementById(location.hash.slice(1));if(t)t.scrollIntoView();}};
function quicknav(){const main=document.querySelector('main');const hs=[...main.querySelectorAll('section.quiz[id], h2[id]')];if(hs.length<3||main.querySelector('.qnav'))return;
  const n=mk('nav','qnav');n.setAttribute('aria-label','On this page');hs.forEach(h=>{const t=h.tagName==='H2'?h.textContent:(h.querySelector('h2')||h).textContent;n.append(link('#'+h.id,t.slice(0,40)));});
  const c=main.querySelector('.content');if(c)c.prepend(n);}
function bar(pc){const d=mk('div','progress'),i=mk('i');i.style.width=pc+'%';d.append(i);return d;}
async function dash(){const el=document.getElementById('dash');if(!el||!window.IYP_LOADP)return;
  let p={};try{p=await window.IYP_LOADP();}catch(e){}
  const u=window.IYP_USER;el.replaceChildren();
  const w=mk('p',null,'Welcome back, ');w.append(mk('strong',null,(u&&u.name)||'learner'));w.append('. Your progress is saved to your account and follows you across devices.');
  const ids=Object.keys(p);
  if(!ids.length){el.append(w);const c=mk('div','card');c.append(mk('p',null,'No scores yet. Start with the '),link('diagnostic.html','diagnostic'));el.append(c);return;}
  let a=0,b=0;const g=mk('div','grid g2');
  ids.forEach(id=>{const r=p[id];a+=r.score;b+=r.total;const pc=Math.round(100*r.score/r.total);const c=mk('div','card');c.append(mk('h3',null,r.title),mk('p',null,`${r.score}/${r.total} (${pc}%) \u00b7 ${r.date?new Date(r.date).toLocaleDateString('en-GB'):''}`),bar(pc));g.append(c);});
  const o=mk('div','card');o.append(mk('h3',null,'Overall'),mk('p',null,`${a}/${b} correct across ${ids.length} sections`),bar(Math.round(100*a/b)),link('mocks.html#results','See micro-skills and weaknesses \u2192'));
  el.append(o,w,g);}
// Shared analytics: used by results dashboard and the tutor dashboard.
window.IYP_ANALYSE=function(atts){const sec={},task={},micro={};
  atts.forEach(a=>{const skill=a.section.startsWith('listening')||a.section.startsWith('l-')?'Listening':'Reading';(sec[skill]=sec[skill]||[0,0]);sec[skill][0]+=a.score;sec[skill][1]+=a.max;
    const tg=(a.tags||'').split(',');[...(a.results||'')].forEach((r,i)=>{const t=tg[i];if(!t)return;(micro[t]=micro[t]||[0,0]);micro[t][0]+=r==='1'?1:0;micro[t][1]++;
      const ty=t.startsWith('L-')?'Listening: '+(TAGS[t]||t):'Reading: '+(TAGS[t]||t);(task[ty]=task[ty]||[0,0]);task[ty][0]+=r==='1'?1:0;task[ty][1]++;});});
  const weak=Object.entries(micro).filter(([,v])=>v[1]>=2).map(([k,v])=>[k,Math.round(100*v[0]/v[1])]).sort((x,y)=>x[1]-y[1]).slice(0,3);
  return {sec,task,micro,weak};};
function table(rows){const t=mk('table');const h=mk('tr');['Area','Correct','%'].forEach(x=>h.append(mk('th',null,x)));t.append(h);
  Object.entries(rows).forEach(([k,v])=>{const r=mk('tr');r.append(mk('td',null,k),mk('td',null,`${v[0]}/${v[1]}`),mk('td',null,Math.round(100*v[0]/v[1])+'%'));t.append(r);});return t;}
async function results(){const el=document.getElementById('results');if(!el||!window.IYP_LOADATT)return;let at=[];try{at=await window.IYP_LOADATT();}catch(e){}
  el.replaceChildren();if(!at.length){el.append(mk('p',null,'No results yet. '),link('diagnostic.html','Take the diagnostic'));return;}
  const A=window.IYP_ANALYSE(at);const w=mk('div','card');w.append(mk('h3',null,'Your top 3 weaknesses'));const ol=mk('ol');
  A.weak.forEach(([t,p])=>{const li=mk('li',null,`${t} \u00b7 ${TAGS[t]} (${p}%) `);li.append(link(lessonFor(t),'Lesson'),' \u00b7 ',link(lessonFor(t).replace(/\.html$/,'.html#drill'),'Drill'));ol.append(li);});
  if(!A.weak.length)ol.append(mk('li',null,'Answer a few more questions to see weaknesses.'));w.append(ol);
  const s=mk('div','card');s.append(mk('h3',null,'By section'),table(A.sec));const tk=mk('div','card');tk.append(mk('h3',null,'By task type and micro-skill'),table(A.task));
  el.append(w,mk('div','grid g2')),el.lastChild.append(s,tk);}
async function mistakes(){const el=document.getElementById('mistakes');if(!el||!window.IYP_LOADMIS)return;let m=[];try{m=await window.IYP_LOADMIS();}catch(e){}
  el.replaceChildren();if(!m.length){el.append(mk('p',null,'No mistakes logged yet. They appear here when you check answers.'));return;}
  const t=mk('table');const h=mk('tr');['Date','Section','Q','Skill','You wrote','Answer','Cause','Review',''].forEach(x=>h.append(mk('th',null,x)));t.append(h);
  m.forEach(x=>{const r=mk('tr');const del=mk('button',null,'Done');del.onclick=async()=>{try{await window.IYP_DELMIS(x.id);r.remove();}catch(e){}};
    const lt=mk('td');lt.append(link(lessonFor(x.tag),'Lesson'));const d=mk('td');d.append(del);
    r.append(mk('td',null,x.date?x.date.toLocaleDateString('en-GB'):''),mk('td',null,x.section),mk('td',null,x.q),mk('td',null,x.tag),mk('td',null,x.given||'(blank)'),mk('td',null,x.correct),mk('td',null,x.cause||'\u2013'),lt,d);t.append(r);});
  const wrap=mk('div','tablewrap');wrap.append(t);el.append(wrap);}
})();
