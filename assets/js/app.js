const views=[...document.querySelectorAll('.view')];
const show=id=>{views.forEach(v=>v.classList.toggle('active',v.id===id));window.scrollTo({top:0,behavior:'smooth'});history.replaceState(null,'','#'+id)};
document.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',()=>show(el.dataset.open)));
const answer=document.getElementById('answer');
const result=document.getElementById('result');
document.getElementById('submitAnswer').addEventListener('click',()=>{
  const value=answer.value.trim();
  if(value==='2317'){result.textContent='✓ پاسخ صحیح است. پیوست رمزگذاری‌شده باز شد.';result.style.color='#b69b62';setTimeout(()=>show('secret'),650)}
  else if(value.length<4){result.textContent='رمز باید چهار رقم باشد.'}
  else{result.textContent='✕ این رمز با مدارک پرونده سازگار نیست.'}
});
answer.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('submitAnswer').click()});
document.getElementById('lockedEvidence').addEventListener('click',()=>show('solve'));
if(location.hash&&document.getElementById(location.hash.slice(1)))show(location.hash.slice(1));
// Konami-style Easter egg: ↑ ↑ ↓ ↓ ← → ← → B A
const konami=[ 'ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA' ];
let k=0;
document.addEventListener('keydown',e=>{if(e.code===konami[k]){k++;if(k===konami.length){k=0;document.body.classList.add('konami');show('secret');setTimeout(()=>document.body.classList.remove('konami'),1200)}}else{k=e.code===konami[0]?1:0}});
