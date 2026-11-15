import { useEffect, useMemo, useState } from 'react';
import { Armchair, BedDouble, CookingPot, Bath, DoorOpen, Grid3X3, Save, RotateCcw, Info } from 'lucide-react';
import '../styles/apartment-planner.css';

const copy={
 ar:{title:'مخطط شقتك التفاعلي',sub:'قسّم مساحة 10 × 10 متر إلى غرف ومناطق. كل مربع = متر مربع واحد. اضغط على الخلايا لتلوينها حسب الغرفة.',bed:'نوم',living:'معيشة',kitchen:'مطبخ',bath:'حمام',entry:'مدخل',corridor:'ممر',empty:'غير محدد',area:'المساحة الموزعة',cells:'م²',reset:'إعادة ضبط',save:'حفظ على هذا الجهاز',saved:'تم حفظ المسودة على هذا الجهاز',tip:'ابدأ بتوزيع الغرف، ثم راجع احتياجات الأسرة والخصوصية والحركة. هذا مخطط مفاهيمي وليس رسومات تنفيذية.',legend:'اختار نوع المساحة ثم اضغط على مربعات المخطط.'},
 en:{title:'Interactive apartment planner',sub:'Divide the 10 × 10 metre space into rooms and zones. Each cell represents 1 m². Select a room type, then tap cells to paint the plan.',bed:'Bedroom',living:'Living',kitchen:'Kitchen',bath:'Bathroom',entry:'Entry',corridor:'Hallway',empty:'Unassigned',area:'Assigned area',cells:'m²',reset:'Reset',save:'Save on this device',saved:'Draft saved on this device',tip:'Start by zoning rooms, then review household needs, privacy, and circulation. This is a concept planner, not construction documentation.',legend:'Choose a zone, then tap cells on the plan.'},
 zh:{title:'互动公寓规划器',sub:'将 10 × 10 米空间划分为房间和区域。每个方格代表 1 平方米。选择房间类型，然后点击方格进行分配。',bed:'卧室',living:'客厅',kitchen:'厨房',bath:'浴室',entry:'入口',corridor:'走廊',empty:'未分配',area:'已分配面积',cells:'平方米',reset:'重置',save:'保存到此设备',saved:'草稿已保存在此设备',tip:'先划分空间，再检查家庭需求、隐私和动线。本工具仅用于概念规划，不是施工图。',legend:'选择一个区域类型，然后点击平面图中的方格。'}
};
const types=[
 ['bed','bedroom',BedDouble,'#b6a5e8'],['living','living',Armchair,'#8ecdb0'],['kitchen','kitchen',CookingPot,'#edc27c'],['bath','bathroom',Bath,'#8fc5e2'],['entry','entry',DoorOpen,'#d9aa8c'],['corridor','corridor',Grid3X3,'#c7d3c9']
];
const empty=()=>Array(100).fill('');
export default function ApartmentPlanner({lang='ar',userId,projectId}){
 const t=copy[lang]||copy.ar,rtl=lang==='ar';
 const [selected,setSelected]=useState('bed'),[cells,setCells]=useState(empty),[saved,setSaved]=useState(false);
 const key='fw-apartment-plan:'+userId+':'+projectId;
 useEffect(()=>{try{const raw=localStorage.getItem(key);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed)&&parsed.length===100)setCells(parsed);}}catch{}},[key]);
 const counts=useMemo(()=>Object.fromEntries(types.map(([id])=>[id,cells.filter(x=>x===id).length])),[cells]);
 const assign=i=>{setCells(old=>old.map((v,n)=>n===i?(v===selected?'':selected):v));setSaved(false)};
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(cells));setSaved(true)}catch{setSaved(false)}};
 const reset=()=>{setCells(empty());setSaved(false);try{localStorage.removeItem(key)}catch{}};
 return <section className="ap-planner" dir={rtl?'rtl':'ltr'}>
  <header className="ap-head"><div><span>THIMAR HOME STUDIO · 01</span><h3>{t.title}</h3><p>{t.sub}</p></div><div className="ap-dimension">10 × 10 <small>100 m²</small></div></header>
  <div className="ap-workspace">
   <div className="ap-board-wrap"><div className="ap-axis ap-axis-top">{Array.from({length:10},(_,i)=><span key={i}>{i+1}</span>)}</div><div className="ap-board-row"><div className="ap-axis ap-axis-side">{Array.from({length:10},(_,i)=><span key={i}>{i+1}</span>)}</div><div className="ap-board">{cells.map((v,i)=><button key={i} className={'ap-cell '+(v?'ap-'+v:'')} onClick={()=>assign(i)} aria-label={t[v]||t.empty+' '+(i+1)} title={t[v]||t.empty}/>)}</div></div><div className="ap-board-caption">10 m × 10 m · 100 m² · {100-cells.filter(Boolean).length} {t.empty}</div></div>
   <aside className="ap-tools"><b>{t.legend}</b><div className="ap-type-list">{types.map(([id,key,Icon,color])=><button key={id} className={selected===id?'active':''} onClick={()=>setSelected(id)}><span style={{'--zone':color}}><Icon size={17}/></span><b>{t[id]}</b><small>{counts[id]} {t.cells}</small></button>)}</div><div className="ap-unassigned"><span/>{t.empty}<b>{cells.filter(x=>!x).length} {t.cells}</b></div><div className="ap-actions"><button onClick={reset}><RotateCcw size={15}/>{t.reset}</button><button className="ap-save" onClick={save}><Save size={15}/>{t.save}</button></div>{saved&&<p className="ap-saved">{t.saved}</p>}</aside>
  </div><p className="ap-tip"><Info size={16}/>{t.tip}</p>
  <div className="ap-area-summary"><span className="ap-total"><i className="ap-dot ap-total-dot"/>{t.area} <b>{cells.filter(Boolean).length} / 100 {t.cells}</b></span>{types.map(([id])=><span key={id}><i className={'ap-dot ap-'+id}/>{t[id]} <b>{counts[id]} {t.cells}</b></span>)}</div>
 </section>;
}
