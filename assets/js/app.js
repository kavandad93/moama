const topViews=[...document.querySelectorAll('.view')];
const caseViews=[...document.querySelectorAll('.case-view')];
const caseSection=document.getElementById('case');

function show(id,{updateHash=true}={}){
  const target=document.getElementById(id);
  if(!target)return;

  const insideCase=target.classList.contains('case-view');

  if(insideCase){
    topViews.forEach(v=>v.classList.toggle('active',v.id==='case'));
    caseViews.forEach(v=>v.classList.toggle('active',v.id===id));
  }else{
    topViews.forEach(v=>v.classList.toggle('active',v.id===id));
    caseViews.forEach(v=>v.classList.remove('active'));
  }

  document.querySelectorAll('.case-nav [data-open]').forEach(button=>{
    button.classList.toggle('active',button.dataset.open===id);
  });

  if(updateHash){
    const nextHash=`#${id}`;
    if(location.hash!==nextHash)history.replaceState(null,'',nextHash);
  }

  window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelectorAll('[data-open]').forEach(el=>{
  el.addEventListener('click',event=>{
    event.preventDefault();
    show(el.dataset.open);
  });
});

window.addEventListener('hashchange',()=>{
  const id=decodeURIComponent(location.hash.slice(1));
  show(id||'archive',{updateHash:false});
});

const answer=document.getElementById('answer');
const result=document.getElementById('result');
const normalize=s=>s.trim().replace(/[ي]/g,'ی').replace(/[ك]/g,'ک').replace(/\s+/g,' ');
const hashes=new Set(['5b28b787963550776214fd5589ba817604805d308e004ba1af53f8f5756a306d','174b7e4e517adf0c2c88ff6fefd503b9c86a50e221b7b6bfc09e0c0faa25e748','fdc85a15ee260012b75611fae7477d6d77ab947065758e7f04a910b61653e7e0']);

async function digest(text){
  const data=new TextEncoder().encode(normalize(text));
  const hash=await crypto.subtle.digest('SHA-256',data);
  return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

document.getElementById('submitAnswer').addEventListener('click',async()=>{
  const value=normalize(answer.value);
  if(value.length<4){
    result.textContent='نظریه کمی کوتاه است؛ نام فرد و دلیل را بنویس.';
    return;
  }
  const words=value.split(/[^\u0600-\u06FF]+/).filter(Boolean);
  let matched=false;
  for(let i=0;i<words.length;i++){
    for(let size=1;size<=2;size++){
      if(hashes.has(await digest(words.slice(i,i+size).join(' '))))matched=true;
    }
  }
  if(matched){
    result.textContent='✓ نظریه ثبت شد. شواهد اصلی با آن سازگارند.';
    result.style.color='#b79a69';
    setTimeout(()=>show('resolved'),800);
  }else{
    result.textContent='✕ این نظریه با شواهد فعلی پرونده سازگار نیست. زمان‌بندی، دسترسی و لاگ سیستم را دوباره بررسی کن.';
    result.style.color='#9a6f62';
  }
});

answer.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter')document.getElementById('submitAnswer').click();
});

const initialId=decodeURIComponent(location.hash.slice(1));
show(initialId&&document.getElementById(initialId)?initialId:'archive',{updateHash:false});
