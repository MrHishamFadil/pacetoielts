// Run with jsdom installed outside the deployed site; see tests/README.md.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');
const source=f=>fs.readFileSync(path.join(root,f),'utf8');
const moduleSource=f=>source(f).replace(/^import .*;\r?$/gm,'').replace(/^export /gm,'');
let count=0;
const results=[];
async function test(name,fn){await fn();count++;results.push(name);console.log('PASS '+name);}
function dom(html='<main></main>'){return new JSDOM(html,{url:'https://pacetoielts.com/',runScripts:'outside-only'});}
const flush=()=>new Promise(r=>setTimeout(r,5));
(async()=>{
  const d=dom();d.window.eval(source('app.js'));const match=d.window.IYP_MATCH;
  const cases=[
    ['6:30 p.m.','6:30 a.m.',false],['6:30 am','6:30 (a.m.)',true],['6:30 pm','6:30 (a.m.)',false],
    ['6.30 a.m.','6:30 am',true],['6:30','6:30 (a.m.)',true],['6:30am','6:30pm',false],
    ['18:30','6:30 pm',true],['6:30 am','18:30',false],['6:30 am','6:30 pm / 6:30 am',true],
    ['12:45','quarter to one',true],['11:45','quarter to twelve',true],['1:15','quarter past one',true],
    ['6:30','half past six',true],['six thirty','6:30',true],['6','six oclock',true],
    ['noon','12 p.m.',true],['midnight','12 a.m.',true],['noon','midnight',false],['00:00','midnight',true],
    ['6 at night','6 pm',true],['6 in the morning','6 am',true],['6 in the evening','6 am',false],
    ['icecream','ice cream',false],['ice cream','icecream',false],['ice cream','icecream / ice cream',true],
    [' ICE   CREAM ','ice cream',true],['notgiven','NOT GIVEN',false],['not given','NOT GIVEN',true],
    ['check-in','check-in',true],['check in','check-in',false],['fitnessclasses','fitness classes',false],
    ['32','thirty-two',true],['seventy-five','75 / seventy-five',true],['three','3',true],
    ['Okafor','Okafor',true],['BN4 7TR','BN4 7TR',true],['B','B',true],['A','B',false],
    ['history','history (of urban beekeeping)',true],['history of urban beekeeping','history (of urban beekeeping)',true],
    ['cortex','cortex: Long-term memory store.',true],['','cortex',false],['tyre','tyres',false],
    ['noun','noun',true],['number','number',true],['map room','Map Room',true],['4:30','4.30 / 4:30 / half past four / 16:30',true]
  ];
  for(const [given,key,expected]of cases)await test('grading '+JSON.stringify([given,key]),()=>assert.equal(match(given,key),expected));
  d.window.close();
  for(const saved of ['denied','NaN','Infinity','999','0','-1','0.850junk','0.85','1'])await test('storage '+saved,async()=>{
    const d=dom('<main data-gated="1"><div id="gate"></div></main>'),w=d.window;
    Object.defineProperty(w,'localStorage',{value:{getItem(){if(saved==='denied')throw new w.DOMException('denied','SecurityError');return saved;},setItem(){if(saved==='denied')throw new w.DOMException('denied','SecurityError');}}});
    Object.assign(w,{initializeApp:()=>({}),getAuth:()=>({}),getFirestore:()=>({}),GoogleAuthProvider:class{setCustomParameters(){}},onAuthStateChanged(){},getDoc:async()=>({exists:()=>true,data:()=>({html:'<audio src="audio/listening-1.mp3"></audio><div id="hw"></div>'})}),doc:()=>({})});
    w.eval(source('app.js'));w.eval(moduleSource('auth.js')+'\nwindow.__load=loadContent;');let events=0;w.document.addEventListener('iyp-content',()=>events++);
    await w.__load();assert.equal(events,1);assert.equal(w.document.querySelector('audio').playbackRate,saved==='0.85'?0.85:1);
    w.document.querySelector('.speed-b').click();assert.equal(w.document.querySelector('audio').playbackRate,1);w.close();
  });
  function adminDOM(){const d=dom('<div id="adm">Checking access</div><div id="tabs"></div><div id="view"></div>'),w=d.window;let observer,reads=0,revoked=0;
    Object.assign(w,{getApp:()=>({}),getAuth:()=>({}),getFirestore:()=>({}),onAuthStateChanged:(_a,cb)=>observer=cb,collection:(_db,n)=>n,collectionGroup:(_db,n)=>n,getDocs:async()=>{reads++;return{forEach(){}}}});
    w.URL.createObjectURL=()=> 'blob:synthetic-recording';w.URL.revokeObjectURL=()=>revoked++;
    w.eval(moduleSource('admin.js')+'\nwindow.__admin={card,Marking,setData:x=>D=x,tutor:ADMINS[0]};');
    return{d,w,api:w.__admin,observe:u=>observer(u),reads:()=>reads,revoked:()=>revoked};
  }
  const submission=audio=>({uid:'synthetic',name:'Synthetic',kind:'speaking',task:'S2',words:0,timeSec:1,createdAt:new Date(0),audio,audioMime:'audio/webm',text:'<img src=x onerror=alert(1)>'});
  for(const audio of ['', '?','not base64!','"><img src=x onerror=alert(1)>','AQID'])await test('marking audio '+JSON.stringify(audio),()=>{
    const {w,api}=adminDOM();api.setData({users:{},fb:{}});const c=api.card(submission(audio));
    assert.equal(c.querySelectorAll('img,script').length,0);assert.ok(c.textContent.includes('<img src=x onerror=alert(1)>'));
    assert.equal(c.querySelectorAll('audio').length,audio==='AQID'?1:0);assert.ok(c.textContent.includes('Save marks'));
    if(audio&&audio!=='AQID')assert.ok(c.textContent.includes('Recording unavailable'));w.close();
  });
  await test('marking list continues after corrupt audio',()=>{const{w,api}=adminDOM();api.setData({users:{},fb:{},subs:[{id:'bad',...submission('?')},{id:'good',...submission('AQID')}]});api.Marking(w.document.getElementById('view'));assert.equal(w.document.querySelectorAll('.card').length,2);assert.equal(w.document.querySelectorAll('audio').length,1);w.close();});
  await test('invalid MIME and oversized audio are isolated',()=>{const{w,api}=adminDOM();api.setData({users:{},fb:{}});for(const s of [{...submission('AQID'),audioMime:'text/html'},submission('A'.repeat(900004))])assert.ok(api.card(s).textContent.includes('Recording unavailable'));w.close();});
  await test('maximum permitted base64 does not overflow validator',()=>{const{w,api}=adminDOM();api.setData({users:{},fb:{}});const c=api.card(submission('A'.repeat(900000)));assert.equal(c.querySelectorAll('audio').length,1);w.close();});
  await test('media decode error removes audio but preserves marking',()=>{const x=adminDOM();x.api.setData({users:{},fb:{}});const c=x.api.card(submission('AQID'));c.querySelector('audio').dispatchEvent(new x.w.Event('error'));assert.equal(c.querySelector('audio'),null);assert.equal(x.revoked(),1);assert.ok(c.textContent.includes('Save marks'));x.w.close();});
  for(const kind of ['signed-out','unverified','non-tutor'])await test('admin access state '+kind,()=>{const x=adminDOM();const u=kind==='signed-out'?null:{email:kind==='non-tutor'?'synthetic@example.invalid':x.api.tutor,emailVerified:kind!=='unverified'};x.observe(u);assert.equal(x.reads(),0);assert.ok(x.w.document.getElementById('adm').textContent.includes('authorised tutor'));x.w.close();});
  await test('admin observes current auth without requiring prior DOM event',async()=>{const x=adminDOM();x.observe({email:x.api.tutor,emailVerified:true});await flush();assert.equal(x.reads(),8);assert.ok(!x.w.document.getElementById('adm').textContent.includes('Checking access'));x.w.close();});
  await test('stale tutor read cannot redraw after sign-out',async()=>{const x=adminDOM();let release=[];x.w.getDocs=()=>new Promise(resolve=>release.push(resolve));x.observe({email:x.api.tutor,emailVerified:true});x.observe(null);release.forEach(r=>r({forEach(){}}));await flush();assert.ok(x.w.document.getElementById('adm').textContent.includes('authorised tutor'));assert.equal(x.w.document.getElementById('view').children.length,0);x.w.close();});
  for(const [weeks,pct,week]of [[-1,0,1],[0,0,1],[1,8,2],[11,92,12],[12,100,12],[20,100,12]])await test('plan elapsed weeks '+weeks,async()=>{
    const d=dom('<div id="out"></div>'),w=d.window,start=Date.UTC(2026,0,1),now=start+weeks*7*864e5;
    w.Date=class extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};
    Object.assign(w,{getApp:()=>({}),getAuth:()=>({}),getFirestore:()=>({}),onAuthStateChanged(){},doc:()=>({}),getDoc:async()=>({exists:()=>true,data:()=>({path:'p6',pace:'standard',examDate:'',startedAt:{toDate:()=>new Date(start)}})})});
    w.eval(moduleSource('plan.js')+'\nwindow.__myPage=myPage;');await w.__myPage({uid:'synthetic'});assert.ok(w.document.getElementById('out').textContent.includes('Week '+week+' of 12'));assert.equal(w.document.querySelector('.bar i').style.width,pct+'%');w.close();
  });
  await test('homepage keeps both FAQ and existing skills anchors',()=>{const d=dom(source('index.html'));assert.equal(d.window.document.querySelectorAll('#practice').length,1);assert.equal(d.window.document.querySelectorAll('#skills').length,1);d.window.close();});
  await test('menu outside, Escape, links, responsive reset and disclosure semantics',async()=>{
    const d=dom(source('index.html')),w=d.window;let resize;w.matchMedia=()=>({addEventListener:(_e,fn)=>resize=fn});w.eval(source('bold-site.js'));
    const doc=w.document,b=doc.querySelector('.bp-menu'),n=doc.querySelector('.bp-nav'),more=doc.querySelector('.bp-more'),summary=more.querySelector('summary');
    assert.equal(summary.getAttribute('aria-expanded'),'false');assert.equal(doc.getElementById(summary.getAttribute('aria-controls')),more.querySelector('div'));
    more.open=true;await flush();assert.equal(summary.getAttribute('aria-expanded'),'true');summary.focus();summary.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(more.open,false);assert.equal(doc.activeElement,summary);
    more.open=true;await flush();doc.querySelector('main').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert.equal(more.open,false);assert.equal(summary.getAttribute('aria-expanded'),'false');
    b.click();assert.equal(b.getAttribute('aria-expanded'),'true');assert.ok(n.classList.contains('open'));doc.querySelector('main').click();assert.equal(b.getAttribute('aria-expanded'),'false');assert.ok(!n.classList.contains('open'));
    b.click();more.open=true;summary.focus();summary.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(b.getAttribute('aria-expanded'),'false');assert.equal(more.open,false);assert.equal(doc.activeElement,b);
    b.click();resize();assert.equal(b.getAttribute('aria-expanded'),'false');b.click();n.querySelector('a').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));assert.equal(b.getAttribute('aria-expanded'),'false');w.close();
  });
  console.log(JSON.stringify({passed:count,failed:0,scope:'Real source functions in isolated JSDOM; stub Firebase responses/identity, no production calls or playback',tests:results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
