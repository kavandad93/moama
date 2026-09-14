const params=new URLSearchParams(location.hash.slice(1));if(location.hash.slice(1)!=='018'){document.querySelector('.gate h1').textContent='3D فقط برای CASE 018';document.querySelector('.gate p:nth-of-type(2)').textContent='این محیط برای پرونده دیگری فعال نیست.';document.getElementById('start').disabled=true}
const canvas=document.getElementById('scene');const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x030708);scene.fog=new THREE.Fog(0x030708,12,42);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.05,80);camera.position.set(0,1.7,9);let yaw=Math.PI, pitch=0;camera.rotation.order='YXZ';
scene.add(new THREE.HemisphereLight(0x91d8ff,0x111318,1.1));const moon=new THREE.DirectionalLight(0xb7eaff,1.8);moon.position.set(-6,10,5);moon.castShadow=true;scene.add(moon);
function mat(c,rough=.75,metal=0){return new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal})}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(34,28),mat(0x172126));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
function box(name,x,y,z,sx,sy,sz,c){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat(c,.55,.2));m.name=name;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);return m}
// walls / architectural shell
box('back',0,4,-9,30,8,.4,0x111b1e);box('left',-15,4,0,.4,8,18,0x111b1e);box('right',15,4,0,.4,8,18,0x111b1e);box('frontL',-10,4,9,10,8,.4,0x111b1e);box('frontR',10,4,9,10,8,.4,0x111b1e);
// exhibition islands
box('pedestalA',-6,1.0,-2,3,2,3,0x26373b);box('pedestalB',5,1.0,-1,3,2,3,0x26373b);box('display',0,1.3,-6,4,2.6,2.4,0x1b3036);
// glass case
const glass=new THREE.Mesh(new THREE.BoxGeometry(3.5,2.3,2),new THREE.MeshPhysicalMaterial({color:0x65d8ff,transparent:true,opacity:.12,roughness:.05,metalness:.1}));glass.position.set(0,2.5,-6);scene.add(glass);
// hanging lights
for(let x=-10;x<=10;x+=5){const lamp=new THREE.PointLight(0x8bdfff,1.4,9);lamp.position.set(x,6,2);scene.add(lamp);box('lamp',x,7,2,.25,.25,.25,0x83dff5)}
// central artwork
const art=box('art',0,3.0,-6,1.1,1.3,.4,0x365b66);const artLight=new THREE.PointLight(0x57dcff,3,6);artLight.position.set(0,3,-4);scene.add(artLight);
// service desk and objects
box('desk',-8,1.2,5,5,2.4,1.2,0x263238);box('cabinet',8,2.0,5,2.5,4,1.2,0x1d292d);box('electric-panel',11,2.4,3,1.2,2.2,.3,0x263f45);
const clueDefs=[
{x:-8,y:2.6,z:4,title:'رسید برق',text:'مدار C-4 در ساعت 21:53 افت ولتاژ داشته. روی رسید کنار تابلو برق، علامت یک پریز مخفی دیده می‌شود.',id:'E-018-01'},
{x:11,y:2.8,z:2.6,title:'تابلو برق',text:'یکی از کلیدها تازه دست‌کاری شده؛ برچسب آن به سیستم پرده‌ی سالن وصل است.',id:'E-018-02'},
{x:6,y:1.9,z:-1,title:'نخ آبی',text:'یک رشته نخ از لباس یک مانکن نمایشگاهی جدا شده و روی آن ذرات رنگ سفید دیده می‌شود.',id:'E-018-03'},
{x:-6,y:2.1,z:-2,title:'پشت پایه',text:'پشت پایه یک برچسب انبار پیدا می‌کنی: مسیر تحویل فقط از راهروی شرقی انجام می‌شود.',id:'E-018-04'},
{x:9,y:2.4,z:-6,title:'دوربین خاموش',text:'دوربین این بخش 14 ثانیه خاموش شده. زمان خاموشی دقیقاً با حرکت یک پرده‌ی سنگین هم‌زمان است.',id:'E-018-05'},
{x:-12,y:2.3,z:-4,title:'جعبه ابزار',text:'داخل جعبه ابزار یک کلید مخصوص موتور پرده و یک برگه با حروف «س.م.» پیدا می‌شود.',id:'E-018-06'}];
const hotspots=[];const clueGroup=new THREE.Group();scene.add(clueGroup);
for(const d of clueDefs){const g=new THREE.Group();g.position.set(d.x,d.y,d.z);const orb=new THREE.Mesh(new THREE.SphereGeometry(.16,16,16),new THREE.MeshStandardMaterial({color:0x7ceaff,emissive:0x2bd5ff,emissiveIntensity:5}));g.add(orb);const ring=new THREE.Mesh(new THREE.TorusGeometry(.3,.025,8,24),new THREE.MeshBasicMaterial({color:0x75e8ff}));g.add(ring);g.userData=d;hotspots.push(g);clueGroup.add(g)}
const found=new Set();const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let locked=false,drag=false,lastX=0,lastY=0;const keys={};
function updateCam(){camera.rotation.y=yaw;camera.rotation.x=pitch}
function move(dt){const dir=new THREE.Vector3();camera.getWorldDirection(dir);dir.y=0;dir.normalize();const side=new THREE.Vector3().crossVectors(dir,new THREE.Vector3(0,1,0)).normalize();let v=new THREE.Vector3();if(keys.KeyW)v.add(dir);if(keys.KeyS)v.sub(dir);if(keys.KeyD)v.add(side);if(keys.KeyA)v.sub(side);if(v.length()){v.normalize().multiplyScalar(4.2*dt);camera.position.add(v)}camera.position.x=Math.max(-13,Math.min(13,camera.position.x));camera.position.z=Math.max(-7.8,Math.min(7.8,camera.position.z));camera.position.y=1.7}
function openClue(d){found.add(d.id);document.getElementById('clueCounter').textContent=`${found.size} / 6 سرنخ`;document.getElementById('clueTitle').textContent=d.title;document.getElementById('clueText').textContent=d.text;document.getElementById('clueId').textContent=d.id;document.getElementById('cluePanel').classList.remove('hidden');if(found.size===6)setTimeout(()=>document.getElementById('complete').classList.remove('hidden'),500)}
addEventListener('keydown',e=>{keys[e.code]=true});addEventListener('keyup',e=>{keys[e.code]=false});canvas.addEventListener('click',e=>{if(!locked)return;mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(hotspots,true)[0];if(hit){let o=hit.object;while(o&&!o.userData.id)o=o.parent;openClue(o.userData)}});
canvas.addEventListener('mousedown',e=>{if(!locked)return;drag=true;lastX=e.clientX;lastY=e.clientY});addEventListener('mouseup',()=>drag=false);addEventListener('mousemove',e=>{if(!drag||!locked)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw-=dx*.003;pitch-=dy*.002;pitch=Math.max(-1.2,Math.min(1.2,pitch));updateCam()});
// mobile fallback: touch drag + tap
let touchX=0,touchY=0;canvas.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;touchY=e.touches[0].clientY});canvas.addEventListener('touchmove',e=>{const t=e.touches[0];yaw-=(t.clientX-touchX)*.004;pitch-=(t.clientY-touchY)*.003;pitch=Math.max(-1.2,Math.min(1.2,pitch));touchX=t.clientX;touchY=t.clientY;updateCam()},{passive:true});
document.getElementById('start').onclick=()=>{if(location.hash.slice(1)!=='018')return;document.getElementById('gate').style.display='none';locked=true;canvas.requestPointerLock?.();};document.getElementById('closePanel').onclick=()=>document.getElementById('cluePanel').classList.add('hidden');
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});let last=performance.now();function animate(t){requestAnimationFrame(animate);const dt=Math.min((t-last)/1000,.05);last=t;move(dt);hotspots.forEach((h,i)=>{h.rotation.y+=dt*1.8;h.position.y=clueDefs[i].y+Math.sin(t*.002+i)*.08});renderer.render(scene,camera)}updateCam();animate(last);