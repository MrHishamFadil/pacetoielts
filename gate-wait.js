// If the sign-in check is slow, replace "Checking your sign-in" with a helpful message after 5 seconds.
setTimeout(function(){var g=document.getElementById('gate');if(!g||!document.querySelector('main[data-gated]'))return;if(!/Checking your sign-in/.test(g.textContent))return;
var p=document.createElement('p');p.textContent='This is taking longer than usual. Use Continue with Google at the top to sign in, or refresh the page.';
var a=document.createElement('a');a.className='btn gold';a.href=location.href;a.textContent='Refresh';g.replaceChildren(p,a);},5000);
