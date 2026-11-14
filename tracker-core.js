// Tutor progress tracker: pure, read-only aggregation of data the dashboard already loads (no Firestore access here).
(function(){
var DRILLS={'reading':3,'listening':6,'listening-note-completion':3,'listening-multiple-choice':3,'listening-matching':3,'listening-map-labelling':3,'listening-sentence-completion':3,'listening-distractors':2,'listening-full-part':1,'listening-test-1':1,'reading-tfng':3,'reading-headings':3,'reading-matching-info':3,'reading-completion':3,'reading-multiple-choice':3,'reading-short-answer':2,'reading-full-passage-1':1,'reading-test-1':1,'r-cohesion':1,'r-guessing-context':1,'l-attitude':1,'l-completion':1,'l-distractors':1,'l-keywords':1,'l-mcq-matching':1,'l-predicting':1,'l-sections-1-2':1,'l-sections-3-4':1,'l-specific-info':1,'l-spelling-numbers':1};
function isDate(x){return !!x&&typeof x.getTime==='function'&&!isNaN(x.getTime());}
function toDate(x){return x&&typeof x.toDate==='function'?x.toDate():(isDate(x)?x:null);}
function skillOf(tag,section){var t=String(tag||'');if(/^R-/.test(t))return 'Reading';if(/^L-/.test(t))return 'Listening';if(/^W[12]-/.test(t))return 'Writing';if(/^S-/.test(t))return 'Speaking';
  var s=String(section||'');if(/^(reading|r-)/.test(s))return 'Reading';if(/^(listening|l-)/.test(s))return 'Listening';return 'Other';}
function riyadhDay(d){return d.toLocaleDateString('en-CA',{timeZone:'Asia/Riyadh'});}
// Week key = the Sunday (Riyadh calendar) on or before the date; Saudi weeks start on Sunday.
function weekKey(d){var p=riyadhDay(d).split('-').map(Number),u=new Date(Date.UTC(p[0],p[1]-1,p[2]));u.setUTCDate(u.getUTCDate()-u.getUTCDay());return u.toISOString().slice(0,10);}
function pct(c,n){return n?Math.round(100*c/n):null;}
function trend(series){// series: [{date,pct}] oldest first
  if(series.length<2)return {label:'not enough data',delta:null};var h=Math.floor(series.length/2),a=series.slice(0,h),b=series.slice(series.length-h);
  var m=function(x){return x.reduce(function(s,y){return s+y.pct;},0)/x.length;};var d=Math.round(m(b)-m(a));
  return {label:d>=5?'improving':d<=-5?'declining':'steady',delta:d};}
function sectionPage(section){var i=String(section).lastIndexOf('_');return i>0?section.slice(0,i):section;}
function appliesTo(a,uid,user,member){var em=String((user&&user.email)||'').toLowerCase();
  return a.studentUid===uid||(!!a.studentEmail&&a.studentEmail===em)||a.classId==='all'||(!!a.classId&&!!member&&member.classId===a.classId);}
function analyse(o){
  var uid=o.uid,now=o.now||new Date(),user=o.user||{};
  var att=(o.att||[]).filter(function(a){return a.uid===uid&&isDate(a.date);}).sort(function(x,y){return x.date-y.date;});
  // per-question rows
  var rows=[];att.forEach(function(a,ai){var tg=String(a.tags||'').split(','),res=String(a.results||''),g=String(a.given||'').split('\u241F'),k=String(a.correct||'').split('\u241F');
    for(var i=0;i<res.length;i++)rows.push({ai:ai,date:a.date,section:a.section,q:i+1,tag:tg[i]||'',skill:skillOf(tg[i],a.section),ok:res[i]==='1',given:g[i]||'',correct:k[i]||''});});
  // skills: per attempt % by skill, first vs latest, weekly, trend
  var skills={};att.forEach(function(a,ai){var by={};rows.forEach(function(r){if(r.ai!==ai)return;(by[r.skill]=by[r.skill]||[0,0]);by[r.skill][1]++;if(r.ok)by[r.skill][0]++;});
    Object.keys(by).forEach(function(s){(skills[s]=skills[s]||{series:[],c:0,n:0,weeks:{}});var S=skills[s],p=pct(by[s][0],by[s][1]);S.series.push({date:a.date,pct:p,section:a.section});S.c+=by[s][0];S.n+=by[s][1];
      var w=weekKey(a.date);(S.weeks[w]=S.weeks[w]||[0,0]);S.weeks[w][0]+=by[s][0];S.weeks[w][1]+=by[s][1];});});
  var skillList=Object.keys(skills).sort().map(function(s){var S=skills[s];return {skill:s,answered:S.n,pct:pct(S.c,S.n),attempts:S.series.length,first:S.series[0],latest:S.series[S.series.length-1],trend:trend(S.series),
    weekly:Object.keys(S.weeks).sort().map(function(w){return {week:w,pct:pct(S.weeks[w][0],S.weeks[w][1]),n:S.weeks[w][1]};})};});
  // question types (data-tags)
  var tags={};rows.forEach(function(r){if(!r.tag)return;var T=tags[r.tag]=tags[r.tag]||{c:0,n:0,per:{}};T.n++;if(r.ok)T.c++;var P=T.per[r.ai]=T.per[r.ai]||{date:r.date,c:0,n:0};P.n++;if(r.ok)P.c++;});
  var tagList=Object.keys(tags).map(function(t){var T=tags[t],ser=Object.keys(T.per).map(Number).sort(function(a,b){return a-b;}).map(function(i){return {date:T.per[i].date,pct:pct(T.per[i].c,T.per[i].n)};});
    return {tag:t,skill:skillOf(t,''),answered:T.n,correct:T.c,pct:pct(T.c,T.n),first:ser[0],latest:ser[ser.length-1],trend:trend(ser)};}).sort(function(a,b){return a.pct-b.pct||b.answered-a.answered;});
  // sections: first vs latest attempt
  var secs={};att.forEach(function(a){(secs[a.section]=secs[a.section]||[]).push(a);});
  var sectionList=Object.keys(secs).map(function(s){var L=secs[s],f=L[0],l=L[L.length-1];return {section:s,page:sectionPage(s),attempts:L.length,first:{date:f.date,score:f.score,max:f.max,pct:f.pct},latest:{date:l.date,score:l.score,max:l.max,pct:l.pct},best:Math.max.apply(null,L.map(function(x){return x.pct;}))};}).sort(function(a,b){return b.latest.date-a.latest.date;});
  // recurring mistakes: same question wrong in 2+ attempts, and tags with most wrong answers
  var qm={};rows.forEach(function(r){if(r.ok)return;var k=r.section+'#'+r.q,M=qm[k]=qm[k]||{section:r.section,q:r.q,tag:r.tag,count:0,given:[],correct:r.correct,last:r.date};M.count++;if(r.given&&M.given.indexOf(r.given)<0)M.given.push(r.given);M.last=r.date;});
  var fixed={};rows.forEach(function(r){var k=r.section+'#'+r.q;if(qm[k]&&r.ok&&r.date>=qm[k].last)fixed[k]=true;});
  var recurring=Object.keys(qm).filter(function(k){return qm[k].count>=2;}).map(function(k){var M=qm[k];M.nowCorrect=!!fixed[k];return M;}).sort(function(a,b){return b.count-a.count||b.last-a.last;});
  var wrongTags={};rows.forEach(function(r){if(!r.ok&&r.tag)wrongTags[r.tag]=(wrongTags[r.tag]||0)+1;});
  var topWrong=Object.keys(wrongTags).map(function(t){return {tag:t,wrong:wrongTags[t]};}).sort(function(a,b){return b.wrong-a.wrong;}).slice(0,5);
  var logged=(o.mis||[]).filter(function(m){return m.uid===uid;}).length;
  // assignments: status per student
  var subs=(o.subs||[]).filter(function(s){return s.uid===uid;});
  var asg=(o.asg||[]).filter(function(a){return appliesTo(a,uid,user,o.member);}).map(function(a){var due=toDate(a.due),created=toDate(a.createdAt);
    var page=String(a.link||'').replace(/\.html$/,'').replace(/^.*\//,''),total=DRILLS[page]||null,since=created||new Date(0);
    var mine=att.filter(function(x){return page&&sectionPage(x.section)===page&&x.date>=since;});var done=0,secSeen={};mine.forEach(function(x){secSeen[x.section]=x;});done=Object.keys(secSeen).length;
    var sub=subs.filter(function(s){return s.assignmentId===a.id;});var complete,started;
    if(a.kind==='writing'||a.kind==='speaking'){complete=sub.length>0;started=complete;}else{complete=total?done>=total:done>0;started=done>0;}
    var lastAt=mine.length?mine[mine.length-1]:null,scoreTxt=Object.keys(secSeen).map(function(s){var x=secSeen[s];return x.score+'/'+x.max;}).join(', ');
    var status=complete?'Done':(due&&due<now)?'Overdue':started?'In progress':'Not started';
    return {id:a.id,title:a.title||page||a.kind,kind:a.kind,link:a.link||'',due:due,created:created,week:created?weekKey(created):due?weekKey(due):'',status:status,done:done,total:total,submitted:sub.length,scores:scoreTxt,last:lastAt?lastAt.date:null,completedLate:complete&&due&&lastAt&&lastAt.date>due};})
    .sort(function(x,y){return (y.due||0)-(x.due||0);});
  var weeks={};asg.forEach(function(a){var W=weeks[a.week]=weeks[a.week]||{week:a.week,items:[],done:0,overdue:0};W.items.push(a);if(a.status==='Done')W.done++;if(a.status==='Overdue')W.overdue++;});
  var weekList=Object.keys(weeks).sort().reverse().map(function(k){return weeks[k];});
  var last=att.length?att[att.length-1].date:null;
  return {totals:{attempts:att.length,answered:rows.length,correct:rows.filter(function(r){return r.ok;}).length,pct:pct(rows.filter(function(r){return r.ok;}).length,rows.length),last:last,logged:logged,assignments:asg.length,done:asg.filter(function(a){return a.status==='Done';}).length,overdue:asg.filter(function(a){return a.status==='Overdue';}).length},
    skills:skillList,tags:tagList,sections:sectionList,recurring:recurring,topWrong:topWrong,assignments:asg,weeks:weekList};}
// Students the tutor can track: not tutors; those with assignments or recent work first.
function students(o){var admins=(o.admins||[]).map(function(x){return x.toLowerCase();});
  return Object.keys(o.users||{}).filter(function(uid){return admins.indexOf(String(o.users[uid].email||'').toLowerCase())<0;}).map(function(uid){var u=o.users[uid];
    var at=(o.att||[]).filter(function(a){return a.uid===uid;}),nA=(o.asg||[]).filter(function(a){return appliesTo(a,uid,u,(o.members||{})[uid])&&a.classId!=='all';}).length;
    var last=at.reduce(function(m,a){return a.date>m?a.date:m;},new Date(0));return {uid:uid,name:u.displayName||u.email||uid,email:u.email||'',assigned:nA,attempts:at.length,last:last};})
    .sort(function(a,b){return (b.assigned>0)-(a.assigned>0)||(b.attempts>0)-(a.attempts>0)||b.last-a.last||b.attempts-a.attempts||a.name.localeCompare(b.name);});}
var api={analyse:analyse,students:students,weekKey:weekKey,skillOf:skillOf,trend:trend,DRILLS:DRILLS};
if(typeof window!=='undefined')window.PTI_TRACK=api;if(typeof module!=='undefined')module.exports=api;
})();
