const SQ=['การให้ข้อมูลเกี่ยวกับการผ่าตัด','การอธิบายขั้นตอนก่อนและหลังผ่าตัด','การให้ข้อมูลเกี่ยวกับการระงับความรู้สึก','การให้คำแนะนำเกี่ยวกับการปฏิบัติตัวก่อนผ่าตัด','การเปิดโอกาสให้ซักถามข้อสงสัย','ความเอาใจใส่ของพยาบาล','ความรวดเร็วในการให้บริการ','ความสุภาพและการสื่อสารของเจ้าหน้าที่','ความมั่นใจในการดูแลของบุคลากร','ความพึงพอใจโดยรวม'];
const AQ=['รู้สึกกังวลเกี่ยวกับการผ่าตัด','กลัวผลแทรกซ้อนจากการผ่าตัด','กลัวความเจ็บปวดหลังผ่าตัด','กังวลเกี่ยวกับการดมยาสลบหรือการระงับความรู้สึก','กลัวว่าจะเกิดอันตรายระหว่างผ่าตัด','กังวลเกี่ยวกับผลการผ่าตัด','กังวลเกี่ยวกับการฟื้นตัวหลังผ่าตัด','กังวลเกี่ยวกับค่าใช้จ่ายในการรักษา','นอนไม่หลับเนื่องจากความกังวล','รู้สึกไม่สบายใจเมื่อนึกถึงการผ่าตัด'];
const SL=['พึงพอใจน้อยที่สุด','พึงพอใจน้อย','ปานกลาง','พึงพอใจมาก','พึงพอใจมากที่สุด'];
const AL=['ไม่วิตกกังวล','วิตกกังวลเล็กน้อย','ปานกลาง','วิตกกังวลมาก','วิตกกังวลมากที่สุด'];
const F=['hn','assessDate','name','age','sex','ward','surgeryType','surgeryDate','priorSurgery','disease','comment','improve','prepSuggest','concern'];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const API='https://script.google.com/macros/s/AKfycbw41YnJeQHJWfyBkKmdZn-LSlUaW9t3kpcO9_dquwJQXvF9BcFrSI0vyfVHXhYL2TZT/exec';
let KEY=sessionStorage.getItem('key')||'';
const gs=async(fn,...args)=>{
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({key:KEY,fn:fn,args:args})});
  const j=await r.json();if(!j.ok)throw new Error(j.error);return j.data;
};
function start(){if(!KEY){KEY=prompt('กรุณากรอกรหัสเข้าใช้งานระบบ')||'';sessionStorage.setItem('key',KEY)}init()}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lv=m=>m>=4.5?4:m>=3.5?3:m>=2.5?2:m>=1.5?1:0;
let editId=null,token=newToken(),busy=false,DATA=[],charts={};

function newToken(){return (crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random()).toString()}
function toast(m,t){const e=$('#toast');e.textContent=m;e.className=t;e.style.display='block';clearTimeout(e.h);e.h=setTimeout(()=>e.style.display='none',4500)}
const msg=e=>{const m=(e&&e.message?e.message:String(e)).replace(/^Error:\s*/,'');
  if(m.includes('รหัสเข้าใช้งานไม่ถูกต้อง')){sessionStorage.removeItem('key');KEY='';setTimeout(()=>{if(confirm('รหัสไม่ถูกต้อง ต้องการกรอกใหม่หรือไม่?'))start()},300)}
  return m};
function lock(b){busy=b;$$('.btns .btn').forEach(x=>x.disabled=b)}
function todayStr(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}

function likert(box,pre,qs){
  $(box).innerHTML=qs.map((q,i)=>`<div class="q"><span>${i+1}. ${q}</span><div class="opts">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="${pre}${i}" value="${n}"><b>${n}</b></label>`).join('')}</div></div>`).join('');
  $(box).addEventListener('change',liveScore);
}
function getScores(pre){return Array.from({length:10},(_,i)=>{const c=document.querySelector(`input[name="${pre}${i}"]:checked`);return c?+c.value:0})}
function liveScore(){
  [['s','#sLive',SL],['a','#aLive',AL]].forEach(([p,id,L])=>{
    const v=getScores(p),n=v.filter(Boolean).length,t=v.reduce((a,b)=>a+b,0);
    $(id).textContent=n<10?`ตอบแล้ว ${n}/10 ข้อ`:`คะแนนรวม ${t} · เฉลี่ย ${(t/10).toFixed(2)} · ${L[lv(t/10)]}`;
  });
}
function setScores(pre,arr){arr.forEach((v,i)=>{const r=document.querySelector(`input[name="${pre}${i}"][value="${v}"]`);if(r)r.checked=true});liveScore()}

function fill(sel,arr,blank){$(sel).innerHTML=(blank?'<option value="">— เลือก —</option>':'')+arr.map(x=>`<option>${esc(x)}</option>`).join('')}
async function init(){
  likert('#sat','s',SQ);likert('#anx','a',AQ);resetForm();
  try{
    const o=await gs('getOptions');
    fill('#sex',o.sex,1);fill('#priorSurgery',o.priorSurgery,1);
    $('#wardList').innerHTML=o.wards.map(x=>`<option value="${esc(x)}">`).join('');
    $('#surgList').innerHTML=o.surgeryTypes.map(x=>`<option value="${esc(x)}">`).join('');
    if(o.systemName)$('#title').textContent=o.systemName;
  }catch(e){toast('โหลดการตั้งค่าไม่สำเร็จ: '+msg(e),'err')}
}
function resetForm(){
  F.forEach(k=>$('#'+k).value='');$$('input[type=radio]').forEach(r=>r.checked=false);
  $('#assessDate').value=todayStr();editId=null;token=newToken();
  $('#saveBtn').style.display='';$('#updBtn').style.display=$('#delBtn').style.display=$('#editNote').style.display='none';liveScore();
}
function collect(){
  const r={id:editId};F.forEach(k=>r[k]=$('#'+k).value.trim());r.s=getScores('s');r.a=getScores('a');
  if(!r.hn)throw new Error('กรุณากรอกเลขที่ผู้ป่วย (HN)');
  if(!r.assessDate)throw new Error('กรุณาระบุวันที่ประเมิน');
  if(r.s.includes(0))throw new Error('กรุณาตอบแบบประเมินความพึงพอใจให้ครบ 10 ข้อ');
  if(r.a.includes(0))throw new Error('กรุณาตอบแบบประเมินความวิตกกังวลให้ครบ 10 ข้อ');
  return r;
}
async function run(fn,okMsg,after){
  if(busy)return;let r;
  try{r=collect()}catch(e){return toast(msg(e),'err')}
  lock(true);
  try{await fn(r);toast(okMsg,'ok');after&&after()}catch(e){toast(msg(e),'err')}finally{lock(false)}
}
$('#saveBtn').onclick=()=>run(r=>gs('saveData',r,token),'บันทึกข้อมูลสำเร็จ',()=>{resetForm();window.scrollTo(0,0)});
$('#updBtn').onclick=()=>run(r=>gs('updateData',r),'แก้ไขข้อมูลสำเร็จ',()=>{resetForm();show('list');search()});
$('#clearBtn').onclick=()=>{if(confirm('ต้องการล้างข้อมูลในแบบฟอร์มทั้งหมดหรือไม่?'))resetForm()};
$('#delBtn').onclick=()=>delRec(editId,()=>{resetForm();show('list');search()});
async function delRec(id,after){
  if(busy||!id||!confirm('ยืนยันการลบข้อมูลนี้? การลบไม่สามารถกู้คืนได้'))return;
  lock(true);try{await gs('deleteData',id);toast('ลบข้อมูลสำเร็จ','ok');after&&after()}catch(e){toast(msg(e),'err')}finally{lock(false)}
}

/* รายการ */
async function search(){
  $('#rows').innerHTML='<tr><td colspan="8" class="empty">กำลังโหลด...</td></tr>';
  try{DATA=await gs('searchData',{hn:$('#qHn').value,from:$('#qFrom').value,to:$('#qTo').value});renderRows()}
  catch(e){$('#rows').innerHTML='';toast(msg(e),'err')}
}
function renderRows(){
  $('#cnt').textContent=`(${DATA.length} ราย)`;
  $('#rows').innerHTML=DATA.length?DATA.map((r,i)=>`<tr><td>${esc(r.hn)}</td><td>${esc(r.assessDate)}</td><td>${esc(r.age)} / ${esc(r.sex)}</td><td>${esc(r.ward)}</td><td>${esc(r.surgeryType)}</td><td>${r.sMean.toFixed(2)} (${esc(r.sLevel)})</td><td>${r.aMean.toFixed(2)} (${esc(r.aLevel)})</td><td class="noprint"><button class="btn sm" data-a="v" data-i="${i}">ดู</button> <button class="btn sm" data-a="e" data-i="${i}">แก้ไข</button> <button class="btn sm d" data-a="d" data-i="${i}">ลบ</button></td></tr>`).join(''):'<tr><td colspan="8" class="empty">ไม่พบข้อมูล</td></tr>';
}
$('#rows').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;const r=DATA[+b.dataset.i];
  if(b.dataset.a==='v')report(r);
  if(b.dataset.a==='e')edit(r);
  if(b.dataset.a==='d')delRec(r.id,search);
};
function edit(r){
  resetForm();F.forEach(k=>$('#'+k).value=r[k]||'');setScores('s',r.s);setScores('a',r.a);editId=r.id;
  $('#saveBtn').style.display='none';$('#updBtn').style.display=$('#delBtn').style.display='';
  $('#editNote').style.display='block';$('#editNote').textContent=`กำลังแก้ไขข้อมูล HN ${r.hn} (วันที่ประเมิน ${r.assessDate})`;
  show('form');window.scrollTo(0,0);
}
$('#qBtn').onclick=search;
$('#qClear').onclick=()=>{$('#qHn').value=$('#qFrom').value=$('#qTo').value='';search()};
$('#csvBtn').onclick=()=>{
  if(!DATA.length)return toast('ไม่มีข้อมูลสำหรับส่งออก','err');
  const h=['HN','วันที่ประเมิน','ชื่อ/รหัส','อายุ','เพศ','หอผู้ป่วย','ชนิดการผ่าตัด','วันที่ผ่าตัด','ประสบการณ์ผ่าตัด','โรคประจำตัว',...SQ.map((q,i)=>'พึงพอใจ'+(i+1)),'พึงพอใจรวม','พึงพอใจเฉลี่ย','ระดับพึงพอใจ',...AQ.map((q,i)=>'กังวล'+(i+1)),'กังวลรวม','กังวลเฉลี่ย','ระดับกังวล','ความคิดเห็น','ควรปรับปรุง','ข้อเสนอแนะเตรียมตัว','ข้อกังวล'];
  const rows=DATA.map(r=>[r.hn,r.assessDate,r.name,r.age,r.sex,r.ward,r.surgeryType,r.surgeryDate,r.priorSurgery,r.disease,...r.s,r.sTotal,r.sMean,r.sLevel,...r.a,r.aTotal,r.aMean,r.aLevel,r.comment,r.improve,r.prepSuggest,r.concern]);
  const csv='\uFEFF'+[h,...rows].map(l=>l.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.download='patient_assessment_'+todayStr()+'.csv';a.click();
};
function printAs(m){document.body.dataset.print=m;setTimeout(()=>{window.print();setTimeout(()=>delete document.body.dataset.print,500)},100)}
$('#printList').onclick=()=>printAs('view');
$('#printDash').onclick=()=>printAs('view');
$('#printOne').onclick=()=>printAs('modal');
$('#closeM').onclick=()=>$('#modal').classList.remove('on');
function report(r){
  const tb=(qs,v)=>`<table><tbody>${qs.map((q,i)=>`<tr><td>${i+1}. ${q}</td><td>${v[i]}</td></tr>`).join('')}</tbody></table>`;
  $('#report').innerHTML=`<h2>รายงานคะแนนรายบุคคล</h2>
<p>HN: <b>${esc(r.hn)}</b> · วันที่ประเมิน: ${esc(r.assessDate)} · อายุ ${esc(r.age)} ปี · เพศ ${esc(r.sex)}<br>หอผู้ป่วย: ${esc(r.ward)} · การผ่าตัด: ${esc(r.surgeryType)} (กำหนด ${esc(r.surgeryDate)})<br>ประสบการณ์ผ่าตัด: ${esc(r.priorSurgery)} · โรคประจำตัว: ${esc(r.disease)}</p>
<h2>ความพึงพอใจ: รวม ${r.sTotal}/50 · เฉลี่ย ${r.sMean.toFixed(2)} · ${esc(r.sLevel)}</h2>${tb(SQ,r.s)}
<h2 style="margin-top:14px">ความวิตกกังวล: รวม ${r.aTotal}/50 · เฉลี่ย ${r.aMean.toFixed(2)} · ${esc(r.aLevel)}</h2>${tb(AQ,r.a)}
<h2 style="margin-top:14px">ข้อเสนอแนะ</h2><p>ความคิดเห็น: ${esc(r.comment)||'-'}<br>สิ่งที่ควรปรับปรุง: ${esc(r.improve)||'-'}<br>ข้อเสนอแนะการเตรียมตัว: ${esc(r.prepSuggest)||'-'}<br>สิ่งที่ยังกังวล/อยากถาม: ${esc(r.concern)||'-'}</p>`;
  $('#modal').classList.add('on');
}

/* Dashboard */
function distRows(id,counts,labels,cls){
  const n=counts.reduce((a,b)=>a+b,0);
  $(id).innerHTML=labels.map((l,i)=>{const p=n?counts[i]/n*100:0;return `<tr><td>${l}</td><td style="width:40%"><div class="bar ${cls}"><i style="width:${p}%"></i></div></td><td>${p.toFixed(1)}%</td><td>${counts[i]} ราย</td></tr>`}).join('');
}
function chart(id,cfg){if(typeof Chart==='undefined')return;charts[id]&&charts[id].destroy();charts[id]=new Chart($('#'+id),cfg)}
async function dash(){
  try{
    const d=await gs('getDashboardData',$('#dFrom').value,$('#dTo').value);
    $('#kN').textContent=d.total;$('#kS').textContent=d.total?d.avgS.toFixed(2):'-';$('#kA').textContent=d.total?d.avgA.toFixed(2):'-';
    $('#kSL').textContent=d.total?SL[lv(d.avgS)]:'';$('#kAL').textContent=d.total?AL[lv(d.avgA)]:'';
    distRows('#sDist',d.sDist,SL,'');distRows('#aDist',d.aDist,AL,'anx-bar');
    chart('c1',{type:'bar',data:{labels:['ความพึงพอใจ','ความวิตกกังวล'],datasets:[{data:[d.avgS,d.avgA],backgroundColor:['#0d6b73','#b4472f']}]},options:{maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:5}}}});
    chart('c2',{type:'line',data:{labels:d.monthly.map(m=>m.month),datasets:[{label:'ความพึงพอใจ',data:d.monthly.map(m=>m.s),borderColor:'#0d6b73',backgroundColor:'#0d6b73'},{label:'ความวิตกกังวล',data:d.monthly.map(m=>m.a),borderColor:'#b4472f',backgroundColor:'#b4472f'}]},options:{maintainAspectRatio:false,scales:{y:{min:0,max:5}}}});
  }catch(e){toast(msg(e),'err')}
}
$('#dBtn').onclick=dash;
$('#dClear').onclick=()=>{$('#dFrom').value=$('#dTo').value='';dash()};

function show(v){$$('.view').forEach(x=>x.classList.toggle('on',x.id==='v-'+v));$$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));if(v==='list')search();if(v==='dash')dash()}
$$('nav button').forEach(b=>b.onclick=()=>show(b.dataset.v));
start();
