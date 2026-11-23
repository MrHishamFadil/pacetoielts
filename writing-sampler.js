(function(){
  function itemOf(el){return el.closest('[data-sampler-item]');}

  function selected(item){
    const input=item.querySelector('input[type="radio"]:checked');
    return input?input.value:null;
  }

  function markChoice(item){
    const correct=item.getAttribute('data-correct');
    const choice=selected(item);
    item.querySelectorAll('.sampler-options label').forEach(function(label){
      label.classList.remove('is-selected','is-correct','is-wrong');
      const input=label.querySelector('input');
      if(!input)return;
      if(input.checked)label.classList.add('is-selected');
      if(item.classList.contains('is-revealed')){
        if(input.value===correct)label.classList.add('is-correct');
        else if(input.checked)label.classList.add('is-wrong');
      }
    });
    return choice;
  }

  function reveal(item){
    const status=item.querySelector('.sampler-status');
    const choice=selected(item);
    if(!choice){
      if(status){
        status.classList.remove('is-ok');
        status.textContent='Choose one option first.';
      }
      return;
    }
    item.classList.add('is-revealed');
    markChoice(item);
    const ok=choice===item.getAttribute('data-correct');
    if(status){
      status.classList.toggle('is-ok',ok);
      status.textContent=ok?'Yes — that is the strongest fix.':'Not quite — see the explanation below.';
    }
    const result=item.querySelector('[data-sampler-result]');
    if(result)result.textContent=ok?'You chose the option that adds real support.':'The paragraph still needs a concrete reason or example.';
    const panel=item.querySelector('.sampler-reveal');
    if(panel){
      panel.hidden=false;
      if(!panel.hasAttribute('tabindex'))panel.setAttribute('tabindex','-1');
      panel.focus();
    }
    item.querySelectorAll('input[type="radio"]').forEach(function(input){input.disabled=true;});
    const btn=item.querySelector('[data-sampler-reveal]');
    if(btn)btn.disabled=true;
    const next=item.nextElementSibling;
    if(next&&next.hasAttribute('data-sampler-followup'))next.hidden=false;
  }

  function ready(){
    document.querySelectorAll('[data-sampler-item]').forEach(function(item){
      item.addEventListener('change',function(){markChoice(item);});
      const btn=item.querySelector('[data-sampler-reveal]');
      if(btn)btn.addEventListener('click',function(){reveal(item);});
      const form=item.querySelector('form');
      if(form)form.addEventListener('submit',function(e){e.preventDefault();reveal(item);});
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);
  else ready();
})();
