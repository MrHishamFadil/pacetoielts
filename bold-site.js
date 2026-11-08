/* Shared presentation controls. Authentication and assessment remain separate. */
(()=>{const b=document.querySelector('.bp-menu'),n=document.querySelector('.bp-nav');if(!b||!n)return;
const more=[...n.querySelectorAll('.bp-more')];
function sync(d){const s=d.querySelector('summary'),panel=d.querySelector('div');if(!s||!panel)return;if(!panel.id)panel.id='bp-explore-'+more.indexOf(d);s.setAttribute('aria-controls',panel.id);s.setAttribute('aria-expanded',String(d.open));}
function closeMore(focus){more.forEach(d=>{if(!d.open)return;d.open=false;sync(d);if(focus)d.querySelector('summary').focus();});}
function close(focus){b.setAttribute('aria-expanded','false');n.classList.remove('open');closeMore(false);if(focus)b.focus();}
more.forEach(d=>{sync(d);d.addEventListener('toggle',()=>sync(d));});
b.addEventListener('click',()=>{const open=b.getAttribute('aria-expanded')!=='true';if(!open){close(false);return;}b.setAttribute('aria-expanded','true');n.classList.add('open');});
n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>close(false)));
document.addEventListener('click',e=>{more.forEach(d=>{if(d.open&&!d.contains(e.target)){d.open=false;sync(d);}});if(!n.contains(e.target)&&!b.contains(e.target))close(false);});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const inMore=more.some(d=>d.open&&d.contains(document.activeElement));closeMore(inMore);if(b.getAttribute('aria-expanded')==='true')close(true);});
matchMedia('(min-width:851px)').addEventListener('change',()=>close(false));})();
