import { useEffect, useMemo, useState } from 'react';
import { Armchair, BedDouble, CookingPot, Bath, DoorOpen, Grid3X3, Save, RotateCcw, Info, Refrigerator, Utensils, ShowerHead, Toilet, Shirt, DoorClosed, Cloud, CloudOff, Trash2, RotateCw, Ruler, Wallet } from 'lucide-react';
import '../styles/apartment-planner.css';

const copy={
 ar:{title:'استوديو البيت التفاعلي',sub:'قسّم الشقة، أضف الأبواب، ثم اختار قطع الأثاث وضعها داخل الغرف. كل مربع = 1 م².',bed:'نوم',living:'معيشة',kitchen:'مطبخ',bath:'حمام',entry:'مدخل',corridor:'ممر',empty:'غير محدد',area:'المساحة الموزعة',cells:'م²',reset:'مسح المخطط',save:'حفظ المخطط',saved:'تم الحفظ على الجهاز',cloudSaved:'تم الحفظ على حسابك',cloudPending:'الحفظ السحابي غير متاح الآن؛ احتفظنا بنسخة على الجهاز',legend:'اختار أداة التخطيط',zones:'تقسيم الغرف',furnish:'الأثاث والتجهيز',doorTool:'إضافة باب',placeHint:'اختار قطعة ثم اضغط على مكان وضعها في المخطط.',zoneHint:'اختار نوع الغرفة ثم اضغط على مربعات المخطط.',doorHint:'اضغط على خلية عند فتحة الباب، وحدد اتجاه الفتحة.',catalog:'كتالوج الأثاث',bedItem:'سرير مزدوج',sofa:'كنبة',dining:'سفرة',fridge:'ثلاجة',counter:'وحدة مطبخ',shower:'دش',toilet:'مرحاض',wardrobe:'دولاب',door:'باب',rotate:'تدوير',remove:'إزالة',cost:'تكلفة القطعة (جنيه)',total:'إجمالي تقديري',budgetNote:'التكاليف قيم تخطيطية يحددها المستخدم وليست أسعار سوق مباشرة.',dimensions:'الأبعاد',cloud:'حفظ سحابي',local:'حفظ محلي',cloudLoading:'جارٍ تحميل المخطط…',footprint:'المساحة',items:'قطع الأثاث',doors:'الأبواب',tip:'حدود الغرف تظهر تلقائيًا حسب تقسيم المناطق. ضع الأبواب عند نقاط الاتصال المناسبة. راجع المقاسات الفعلية مع مهندس قبل التنفيذ.',notRoom:'قسّم المنطقة أولًا إلى غرفة مناسبة قبل وضع القطعة.',collision:'المكان غير مناسب أو متداخل مع قطعة أخرى.',tooLarge:'القطعة لا تتسع في هذا المكان.',furniturePlaced:'تمت إضافة القطعة.',doorDirection:'اتجاه فتحة الباب',north:'شمال',east:'شرق',south:'جنوب',west:'غرب',roomOnly:'يجب أن تكون مساحة القطعة داخل الغرفة المناسبة.',clearConfirm:'تم مسح المخطط.',none:'لا توجد قطع أثاث بعد.',currency:'جنيه',planTitle:'المخطط والقياسات',scale:'متر لكل مربع',saveHint:'الحفظ السحابي يربط المخطط بحسابك ومشروع الشقة.',error:'تعذر حفظ المخطط سحابيًا.'},
 en:{title:'Interactive Home Studio',sub:'Zone the apartment, add doors, then choose furniture and place it inside rooms. Each cell = 1 m².',bed:'Bedroom',living:'Living',kitchen:'Kitchen',bath:'Bathroom',entry:'Entry',corridor:'Hallway',empty:'Unassigned',area:'Assigned area',cells:'m²',reset:'Clear plan',save:'Save plan',saved:'Saved on this device',cloudSaved:'Saved to your account',cloudPending:'Cloud save is unavailable; a device copy was kept',legend:'Choose a planning tool',zones:'Room zoning',furnish:'Furniture & fittings',doorTool:'Add a door',placeHint:'Choose an item, then tap its starting cell on the plan.',zoneHint:'Choose a room type, then tap cells on the plan.',doorHint:'Tap a cell at a doorway and choose the opening direction.',catalog:'Furniture catalogue',bedItem:'Double bed',sofa:'Sofa',dining:'Dining table',fridge:'Fridge',counter:'Kitchen unit',shower:'Shower',toilet:'Toilet',wardrobe:'Wardrobe',door:'Door',rotate:'Rotate',remove:'Remove',cost:'Item cost (EGP)',total:'Estimated total',budgetNote:'Costs are editable planning inputs, not live market prices.',dimensions:'Dimensions',cloud:'Cloud save',local:'Device save',cloudLoading:'Loading your plan…',footprint:'Footprint',items:'Furniture items',doors:'Doors',tip:'Room boundaries are inferred from your zones. Place doors at suitable connections. Have actual dimensions checked by a qualified professional before construction.',notRoom:'Zone the area into the matching room before placing this item.',collision:'This location is unsuitable or overlaps another item.',tooLarge:'The item does not fit here.',furniturePlaced:'Item added.',doorDirection:'Door opening direction',north:'North',east:'East',south:'South',west:'West',roomOnly:'The item must fit inside its matching room.',clearConfirm:'Plan cleared.',none:'No furniture placed yet.',currency:'EGP',planTitle:'Plan & dimensions',scale:'1 metre per cell',saveHint:'Cloud save links this plan to your account and apartment project.',error:'Could not save the plan to the cloud.'},
 zh:{title:'互动家居工作室',sub:'划分房间、添加门，再选择家具并放置在房间内。每格 = 1 平方米。',bed:'卧室',living:'客厅',kitchen:'厨房',bath:'浴室',entry:'入口',corridor:'走廊',empty:'未分配',area:'已分配面积',cells:'平方米',reset:'清空平面图',save:'保存平面图',saved:'已保存在此设备',cloudSaved:'已保存到你的账户',cloudPending:'云端暂不可用，已保留本地副本',legend:'选择规划工具',zones:'房间分区',furnish:'家具与设备',doorTool:'添加门',placeHint:'选择家具，然后点击平面图中的起始格。',zoneHint:'选择房间类型，然后点击方格。',doorHint:'点击门口位置的方格并选择开启方向。',catalog:'家具目录',bedItem:'双人床',sofa:'沙发',dining:'餐桌',fridge:'冰箱',counter:'厨房柜',shower:'淋浴',toilet:'马桶',wardrobe:'衣柜',door:'门',rotate:'旋转',remove:'移除',cost:'单件费用（埃及镑）',total:'估算总额',budgetNote:'费用为可编辑的规划输入，并非实时市场价格。',dimensions:'尺寸',cloud:'云端保存',local:'本地保存',cloudLoading:'正在加载平面图…',footprint:'占地面积',items:'家具数量',doors:'门',tip:'房间边界根据分区自动显示。请在合适的连接位置放置门。施工前请由专业人员核对实际尺寸。',notRoom:'请先将区域划分为对应房间，再放置家具。',collision:'此位置不合适或与其他家具重叠。',tooLarge:'家具尺寸超出空间。',furniturePlaced:'已添加家具。',doorDirection:'门的开启方向',north:'北',east:'东',south:'南',west:'西',roomOnly:'家具必须完全位于对应房间内。',clearConfirm:'平面图已清空。',none:'尚未放置家具。',currency:'埃及镑',planTitle:'平面图与尺寸',scale:'每格一米',saveHint:'云端保存会将平面图关联到你的账户和住宅项目。',error:'无法将平面图保存到云端。'}
};
const types=[
 ['bed','bedroom',BedDouble,'#c9c0df'],['living','living',Armchair,'#b8d5c2'],['kitchen','kitchen',CookingPot,'#e8d5a9'],['bath','bathroom',Bath,'#b9d4df'],['entry','entry',DoorOpen,'#dec5b4'],['corridor','corridor',Grid3X3,'#cbd5cf']
];
const furniture=[
 {id:'bed',zone:'bed',w:2,h:2,cost:0,icon:BedDouble},{id:'sofa',zone:'living',w:3,h:1,cost:0,icon:Armchair},{id:'dining',zone:'living',w:2,h:2,cost:0,icon:Utensils},
 {id:'fridge',zone:'kitchen',w:1,h:1,cost:0,icon:Refrigerator},{id:'counter',zone:'kitchen',w:2,h:1,cost:0,icon:CookingPot},{id:'shower',zone:'bath',w:1,h:1,cost:0,icon:ShowerHead},
 {id:'toilet',zone:'bath',w:1,h:1,cost:0,icon:Toilet},{id:'wardrobe',zone:'bed',w:2,h:1,cost:0,icon:Shirt}
];
const blank=()=>({cells:Array(100).fill(''),furniture:[],doors:[]});
const validDesign=value=>value&&Array.isArray(value.cells)&&value.cells.length===100&&Array.isArray(value.furniture)&&Array.isArray(value.doors);
export default function ApartmentPlanner({lang='ar',userId,projectId,supabase}){
 const t=copy[lang]||copy.ar,rtl=lang==='ar';
 const [design,setDesign]=useState(blank),[tool,setTool]=useState('zone'),[selectedZone,setSelectedZone]=useState('bed'),[selectedItem,setSelectedItem]=useState('bed'),[rotated,setRotated]=useState(false),[doorDirection,setDoorDirection]=useState('east'),[itemCost,setItemCost]=useState('0'),[saved,setSaved]=useState(false),[cloudState,setCloudState]=useState('loading'),[notice,setNotice]=useState('');
 const key='fw-apartment-plan:'+userId+':'+projectId;
 useEffect(()=>{
  let alive=true;
  const load=async()=>{
   try{const raw=localStorage.getItem(key);if(raw){const local=JSON.parse(raw);if(alive&&validDesign(local))setDesign(local);else if(alive&&Array.isArray(local)&&local.length===100)setDesign({...blank(),cells:local});}}catch{}
   if(!supabase||!userId||!projectId){if(alive)setCloudState('local');return;}
   const result=await supabase.from('apartment_designs').select('design_json').eq('project_id',projectId).maybeSingle();
   if(!alive)return;
   if(!result.error&&result.data?.design_json&&validDesign(result.data.design_json)){setDesign(result.data.design_json);try{localStorage.setItem(key,JSON.stringify(result.data.design_json));}catch{}setCloudState('cloud');}
   else setCloudState(result.error?'local':'local');
  };
  load();return()=>{alive=false};
 },[key,supabase,userId,projectId]);
 useEffect(()=>{setSaved(false);},[design]);
 const counts=useMemo(()=>Object.fromEntries(types.map(([id])=>[id,design.cells.filter(x=>x===id).length])),[design.cells]);
 const item= furniture.find(x=>x.id===selectedItem)||furniture[0];
 const total=useMemo(()=>design.furniture.reduce((sum,x)=>sum+(Number(x.cost)||0),0),[design.furniture]);
 const placeZone=i=>setDesign(old=>({...old,cells:old.cells.map((v,n)=>n===i?(v===selectedZone?'':selectedZone):v)}));
 const placeDoor=i=>setDesign(old=>{const key=String(i)+':'+doorDirection;const exists=old.doors.some(d=>d.key===key);return {...old,doors:exists?old.doors.filter(d=>d.key!==key):[...old.doors,{key,cell:i,direction:doorDirection}]};});
 const placeFurniture=i=>{
  const w=rotated?item.h:item.w,h=rotated?item.w:item.h,x=i%10,y=Math.floor(i/10);
  if(x+w>10||y+h>10){setNotice(t.tooLarge);return;}
  const cells=[];for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)cells.push(yy*10+xx);
  if(cells.some(n=>design.cells[n]!==item.zone)){setNotice(t.roomOnly);return;}
  const overlap=design.furniture.some(f=>{const fw=f.rotated?f.h:f.w,fh=f.rotated?f.w:f.h;return x<f.x+fw&&x+w>f.x&&y<f.y+fh&&y+h>f.y;});
  if(overlap){setNotice(t.collision);return;}
  setDesign(old=>({...old,furniture:[...old.furniture,{key:'f-'+Date.now()+'-'+i,type:item.id,x,y,w:item.w,h:item.h,rotated,cost:Math.max(0,Number(itemCost)||0)}]}));setNotice(t.furniturePlaced);
 };
 const activateCell=i=>{setNotice('');if(tool==='zone')placeZone(i);else if(tool==='door')placeDoor(i);else placeFurniture(i);};
 const removeFurniture=key=>setDesign(old=>({...old,furniture:old.furniture.filter(f=>f.key!==key)}));
 const rotateFurniture=key=>setDesign(old=>({...old,furniture:old.furniture.map(f=>f.key===key?{...f,rotated:!f.rotated}:f)}));
 const clear=()=>{setDesign(blank());setSaved(false);try{localStorage.removeItem(key)}catch{}};
 const save=async()=>{
  const payload={...design,version:1,updatedAt:new Date().toISOString()};
  try{localStorage.setItem(key,JSON.stringify(payload));setSaved(true);}catch{setSaved(false);}
  if(!supabase||!userId||!projectId){setCloudState('local');setNotice(t.saved);return;}
  const existing=await supabase.from('apartment_designs').select('id').eq('project_id',projectId).maybeSingle();
  let result;
  if(existing.error){setCloudState('local');setNotice(t.cloudPending);return;}
  if(existing.data?.id)result=await supabase.from('apartment_designs').update({design_json:payload,updated_at:new Date().toISOString()}).eq('id',existing.data.id);
  else result=await supabase.from('apartment_designs').insert({project_id:projectId,owner_id:userId,design_json:payload});
  if(result?.error){setCloudState('local');setNotice(t.cloudPending);}else{setCloudState('cloud');setNotice(t.cloudSaved);}
 };
 const placed=design.furniture;
 return <section className="ap-planner" dir={rtl?'rtl':'ltr'}>
  <header className="ap-head"><div><span>THIMAR HOME STUDIO · 01</span><h3>{t.title}</h3><p>{t.sub}</p></div><div className="ap-dimension"><Ruler size={15}/>10 × 10 <small>100 m²</small></div></header>
  <div className="ap-toolbar"><button className={tool==='zone'?'active':''} onClick={()=>setTool('zone')}><Grid3X3 size={15}/>{t.zones}</button><button className={tool==='furniture'?'active':''} onClick={()=>setTool('furniture')}><Armchair size={15}/>{t.furnish}</button><button className={tool==='door'?'active':''} onClick={()=>setTool('door')}><DoorClosed size={15}/>{t.doorTool}</button></div>
  <div className="ap-workspace">
   <div className="ap-board-wrap"><div className="ap-axis ap-axis-top">{Array.from({length:10},(_,i)=><span key={i}>{i+1}</span>)}</div><div className="ap-board-row"><div className="ap-axis ap-axis-side">{Array.from({length:10},(_,i)=><span key={i}>{i+1}</span>)}</div><div className="ap-board">{design.cells.map((v,i)=>{const x=i%10,y=Math.floor(i/10),top=y===0||design.cells[i-10]!==v,left=x===0||design.cells[i-1]!==v;return <button key={i} className={'ap-cell '+(v?'ap-'+v:'')} style={{borderTop:top?'2px solid #647b6c':0,borderInlineStart:left?'2px solid #647b6c':0}} onClick={()=>activateCell(i)} aria-label={(t[v]||t.empty)+' '+(i+1)} title={t[v]||t.empty}>{design.doors.some(d=>d.cell===i)&&<DoorOpen size={11} className="ap-door-marker"/>}</button>})}
    {placed.map(f=>{const meta=furniture.find(x=>x.id===f.type),Icon=meta?.icon||Armchair,w=f.rotated?f.h:f.w,h=f.rotated?f.w:f.h;return <div key={f.key} className="ap-furniture-item" style={{gridColumn:(f.x+1)+' / span '+w,gridRow:(f.y+1)+' / span '+h}}><Icon size={Math.min(22,14+w*2)}/><span>{t[f.type==='bed'?'bedItem':f.type]}</span><button onClick={()=>removeFurniture(f.key)} aria-label={t.remove}><Trash2 size={10}/></button></div>})}
   </div></div><div className="ap-board-caption">10 m × 10 m · 100 m² · {t.scale}</div></div>
   <aside className="ap-tools"><b>{t.legend}</b>
    {tool==='zone'&&<><div className="ap-type-list">{types.map(([id,key,Icon,color])=><button key={id} className={selectedZone===id?'active':''} onClick={()=>setSelectedZone(id)}><span style={{'--zone':color}}><Icon size={17}/></span><b>{t[id]}</b><small>{counts[id]} {t.cells}</small></button>)}</div><p className="ap-tool-hint">{t.zoneHint}</p></>}
    {tool==='furniture'&&<><b className="ap-subhead">{t.catalog}</b><div className="ap-furniture-list">{furniture.map(f=>{const Icon=f.icon;return <button key={f.id} className={selectedItem===f.id?'active':''} onClick={()=>{setSelectedItem(f.id);setRotated(false);}}><Icon size={16}/><span>{t[f.id==='bed'?'bedItem':f.id]}</span><small>{rotated&&selectedItem===f.id?f.h+'×'+f.w:f.w+'×'+f.h} m</small></button>})}</div><div className="ap-item-controls"><label>{t.cost}<input type="number" min="0" step="100" value={itemCost} onChange={e=>setItemCost(e.target.value)}/></label><button onClick={()=>setRotated(v=>!v)}><RotateCw size={14}/>{t.rotate}</button></div><p className="ap-tool-hint">{t.placeHint}</p></>}
    {tool==='door'&&<><label className="ap-direction">{t.doorDirection}<select value={doorDirection} onChange={e=>setDoorDirection(e.target.value)}><option value="north">{t.north}</option><option value="east">{t.east}</option><option value="south">{t.south}</option><option value="west">{t.west}</option></select></label><p className="ap-tool-hint">{t.doorHint}</p></>}
    <div className="ap-area-summary"><span className="ap-total"><i className="ap-dot ap-total-dot"/>{t.area}<b>{design.cells.filter(Boolean).length}/100 {t.cells}</b></span>{types.map(([id])=><span key={id}><i className={'ap-dot ap-'+id}/>{t[id]} <b>{counts[id]} {t.cells}</b></span>)}</div>
    <div className="ap-budget"><div><Wallet size={16}/><b>{t.total}</b></div><strong>{total.toLocaleString(lang==='ar'?'ar-EG':'en-US')} {t.currency}</strong><small>{placed.length} {t.items} · {design.doors.length} {t.doors}</small><p>{t.budgetNote}</p></div>
    <div className="ap-actions"><button onClick={clear}><RotateCcw size={14}/>{t.reset}</button><button className="ap-save" onClick={save}><Save size={14}/>{t.save}</button></div>
    <p className="ap-cloud-state">{cloudState==='cloud'?<Cloud size={13}/>:cloudState==='local'?<CloudOff size={13}/>:<Cloud size={13}/>} {cloudState==='cloud'?t.cloudSaved:cloudState==='local'?t.local:t.cloudLoading}</p>
    {notice&&<p className="ap-saved" role="status">{notice}</p>}
   </aside>
  </div><p className="ap-tip"><Info size={16}/>{t.tip}</p>
  <div className="ap-area-summary ap-summary-footer"><span className="ap-total"><i className="ap-dot ap-total-dot"/>{t.footprint}<b>{placed.reduce((s,f)=>s+(f.rotated?f.h*f.w:f.w*f.h),0)} {t.cells}</b></span><span>{t.saveHint}</span></div>
 </section>;
}
