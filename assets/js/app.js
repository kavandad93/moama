const topViews=[...document.querySelectorAll('.view')];
const caseViews=[...document.querySelectorAll('.case-view')];

function show(id,{updateHash=true}={}){
  const target=document.getElementById(id);
  if(!target)return false;
  const insideCase=target.classList.contains('case-view');
  if(insideCase){
    topViews.forEach(v=>v.classList.toggle('active',v.id==='case'));
    caseViews.forEach(v=>v.classList.toggle('active',v.id===id));
  }else{
    topViews.forEach(v=>v.classList.toggle('active',v.id===id));
    caseViews.forEach(v=>v.classList.remove('active'));
  }
  document.querySelectorAll('.case-nav [data-open]').forEach(button=>button.classList.toggle('active',button.dataset.open===id));
  if(updateHash){const nextHash=`#${id}`;if(location.hash!==nextHash)history.replaceState(null,'',nextHash);}
  window.scrollTo({top:0,behavior:'smooth'});
  return true;
}

document.addEventListener('click',event=>{
  const el=event.target.closest('[data-open]');
  if(!el)return;
  event.preventDefault();
  show(el.dataset.open);
});

window.addEventListener('hashchange',()=>{
  const id=decodeURIComponent(location.hash.slice(1));
  show(id&&document.getElementById(id)?id:'archive',{updateHash:false});
});

const cctvStatus=document.getElementById('cctv-status');
const cctvMessages={
  archive:'CAM-01 بازسازی شد: آخرین حضور قطعی سامان در 23:09:14. فریم‌های بعدی برای تحلیل نگه‌داری شدند.',
  east:'CAM-EAST: شکاف 71 ثانیه‌ای انتخاب شد. شروع 23:16:51، بازگشت 23:18:02. فرمان شبکه‌ای در همین بازه ثبت شده است.',
  exit:'CAM-03: بازه 23:40:48 تا 23:41:20 بررسی شد. ورود نگهبان دیده می‌شود؛ خروج مشخصی از در اصلی ثبت نشده است.'
};
document.querySelectorAll('[data-cctv]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.cctv;
  if(cctvStatus){cctvStatus.textContent='● '+cctvMessages[key];cctvStatus.style.borderColor=key==='east'?'#70543e':'#46443d';}
  document.querySelectorAll('.cctv-card').forEach(card=>card.classList.remove('selected'));
  button.closest('.cctv-card')?.classList.add('selected');
}));

const answer=document.getElementById('answer');
const result=document.getElementById('result');
const normalize=s=>s.trim().replace(/[ي]/g,'ی').replace(/[ك]/g,'ک').replace(/\s+/g,' ');
const hashes=new Set(['5b28b787963550776214fd5589ba817604805d308e004ba1af53f8f5756a306d','174b7e4e517adf0c2c88ff6fefd503b9c86a50e221b7b6bfc09e0c0faa25e748','fdc85a15ee260012b75611fae7477d6d77ab947065758e7f04a910b61653e7e0']);

async function digest(text){
  const data=new TextEncoder().encode(normalize(text));
  const hash=await crypto.subtle.digest('SHA-256',data);
  return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

if(document.getElementById('submitAnswer'))document.getElementById('submitAnswer').addEventListener('click',async()=>{
  const value=normalize(answer.value);
  if(value.length<4){result.textContent='نظریه کمی کوتاه است؛ نام فرد و دلیل را بنویس.';return;}
  const words=value.split(/[^\u0600-\u06FF]+/).filter(Boolean);
  let matched=false;
  for(let i=0;i<words.length&&!matched;i++)for(let size=1;size<=2;size++)if(hashes.has(await digest(words.slice(i,i+size).join(' ')))){matched=true;break;}
  if(matched){result.textContent='✓ نظریه ثبت شد. شواهد اصلی با آن سازگارند.';result.style.color='#b79a69';setTimeout(()=>show('resolved'),800);}
  else{result.textContent='✕ این نظریه با شواهد فعلی پرونده سازگار نیست. دوربین، زمان‌بندی، دسترسی و لاگ سیستم را دوباره بررسی کن.';result.style.color='#9a6f62';}
});

if(answer)answer.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')document.getElementById('submitAnswer')?.click();});

const initialId=decodeURIComponent(location.hash.slice(1));
show(initialId&&document.getElementById(initialId)?initialId:'archive',{updateHash:false});