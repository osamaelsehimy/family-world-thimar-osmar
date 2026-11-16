import React, { useEffect, useMemo, useState } from 'react';
import { Users, UserRound, Bot, Sparkles, Plus, Search, ImagePlus, Trash2, PawPrint, BriefcaseBusiness, Heart } from 'lucide-react';

const STORAGE_KEY = 'family-world-character-studio-v1';
const starterCards = [
  { id:'starter-analyst', name:{ar:'محللة البيانات',en:'Data Analyst',zh:'数据分析师'}, subtitle:{ar:'تحليل وفهم المؤشرات',en:'Insights & performance',zh:'数据洞察与表现'}, kind:'skill', image:'analyst-card.jpg', badge:'ROLE' },
  { id:'starter-thimmy', name:{ar:'ثيمي',en:'THIMMY',zh:'THIMMY'}, subtitle:{ar:'المرافق الذكي والتميمة',en:'AI companion & mascot',zh:'AI 助手与吉祥物'}, kind:'thimmy-pet', image:'thimmy-card.jpg', badge:'PET' },
  { id:'starter-explorer', name:{ar:'مستكشف العائلة',en:'Family Explorer',zh:'家庭探索者'}, subtitle:{ar:'فضول واكتشاف ومغامرة',en:'Curiosity & discovery',zh:'好奇与探索'}, kind:'character', image:'baby-treasure-card.jpg', badge:'CHARACTER' },
  { id:'starter-team', name:{ar:'فريق المشروع',en:'Project Team',zh:'项目团队'}, subtitle:{ar:'مشاركة وتعاون وإنجاز',en:'Contribution & teamwork',zh:'参与与协作'}, kind:'skill', image:'work-entity-card.jpg', badge:'TEAM' },
  { id:'starter-leadership', name:{ar:'القيادة',en:'Leadership',zh:'领导力'}, subtitle:{ar:'تخطيط ومسؤولية وتوجيه',en:'Planning & responsibility',zh:'规划与责任'}, kind:'skill', image:'founder-vision-card.jpg', badge:'SKILL' },
  { id:'starter-insights', name:{ar:'بصيرة الأداء',en:'Performance Insights',zh:'绩效洞察'}, subtitle:{ar:'مؤشرات وتطوير مستمر',en:'Metrics & growth',zh:'指标与成长'}, kind:'skill', image:'data-insight-card.jpg', badge:'SKILL' },
  { id:'fw-wise-grandfather', name:{ar:'الجد الحكيم',en:'Wise Grandfather',zh:'智慧祖父'}, subtitle:{ar:'الحكمة والخبرة ورعاية الأسرة',en:'Wisdom, experience & family care',zh:'智慧、经验与家庭关怀'}, kind:'character', image:'family-world-character-sprite.svg', spriteIndex:0, badge:'CHARACTER · LV.18' },
  { id:'fw-family-leader', name:{ar:'قائد العائلة',en:'Family Leader',zh:'家庭领袖'}, subtitle:{ar:'القيادة والمسؤولية',en:'Leadership & responsibility',zh:'领导与责任'}, kind:'character', image:'family-world-character-sprite.svg', spriteIndex:1, badge:'CHARACTER · LV.24' },
  { id:'fw-inspiring-mother', name:{ar:'الأم الملهمة',en:'Inspiring Mother',zh:'鼓舞人心的母亲'}, subtitle:{ar:'الإلهام والرعاية',en:'Inspiration & care',zh:'启发与关怀'}, kind:'character', image:'family-world-character-sprite.svg', spriteIndex:2, badge:'CHARACTER · LV.22' },
  { id:'fw-life-partner', name:{ar:'الزوجة الشريكة',en:'Life Partner',zh:'人生伴侣'}, subtitle:{ar:'الشراكة والتوازن',en:'Partnership & balance',zh:'伙伴关系与平衡'}, kind:'character', image:'family-world-character-sprite.svg', spriteIndex:3, badge:'CHARACTER · LV.22' },
  { id:'fw-digital-creator', name:{ar:'المبدع الرقمي',en:'Digital Creator',zh:'数字创作者'}, subtitle:{ar:'الإبداع وصناعة المحتوى',en:'Creativity & digital making',zh:'创意与数字创作'}, kind:'character', image:'family-world-character-sprite.svg', spriteIndex:4, badge:'CHARACTER · LV.21' },
  { id:'fw-explorer', name:{ar:'المستكشفة',en:'The Explorer',zh:'探索者'}, subtitle:{ar:'الفضول والاكتشاف',en:'Curiosity & discovery',zh:'好奇与探索'}, kind:'character', image:'family-world-character-sprite.svg', spriteIndex:5, badge:'CHARACTER · LV.17' },
  { id:'fw-project-builder', name:{ar:'رائد المشروعات',en:'Project Builder',zh:'项目建设者'}, subtitle:{ar:'التخطيط والتنفيذ',en:'Planning & delivery',zh:'规划与执行'}, kind:'character', image:'family-world-character-sprite.svg', spriteIndex:6, badge:'CHARACTER · LV.23' },
  { id:'fw-challenge-hero', name:{ar:'بطل التحديات',en:'Challenge Hero',zh:'挑战达人'}, subtitle:{ar:'المثابرة وروح التحدي',en:'Persistence & challenge',zh:'坚持与挑战'}, kind:'character', image:'family-world-character-sprite.svg', spriteIndex:7, badge:'CHARACTER · LV.19' },
  { id:'fw-young-inventor', name:{ar:'المخترع الصغير',en:'Young Inventor',zh:'少年发明家'}, subtitle:{ar:'الابتكار والتجربة',en:'Innovation & experiments',zh:'创新与实验'}, kind:'character', image:'family-world-character-sprite.svg', spriteIndex:8, badge:'CHARACTER · LV.15' },
  { id:'fw-learning-buddy', name:{ar:'صديقة التعلم',en:'Learning Buddy',zh:'学习伙伴'}, subtitle:{ar:'التعلم والمشاركة',en:'Learning & sharing',zh:'学习与分享'}, kind:'character', image:'family-world-character-sprite.svg', spriteIndex:9, badge:'CHARACTER · LV.16' },
  { id:'fw-data-analyst', name:{ar:'محللة البيانات',en:'Data Analyst',zh:'数据分析师'}, subtitle:{ar:'تحليل وفهم المؤشرات',en:'Insights & performance',zh:'数据洞察与表现'}, kind:'character', image:'family-world-character-sprite.svg', spriteIndex:10, badge:'CHARACTER · LV.20' },
];
const labels = {
 ar:{eyebrow:'FAMILY WORLD · CHARACTER STUDIO',title:'شخصياتنا وكروتنا',intro:'كل شخصية لها مكان وحكاية، وكل عائلة تقدر تكبر وتضيف أفرادًا وشخصيات جديدة من غير حد أقصى.',all:'الكل',character:'شخصيات',family:'كروت عائلية',pet:'ثيمي Pet',bot:'ثيمي AI Bot',skill:'أدوار ومهارات',search:'ابحث عن شخصية أو كارت',add:'أضف كارت جديد',name:'اسم الشخصية أو الكارت',subtitle:'الدور أو الوصف',type:'نوع الكارت',image:'صورة الشخصية (اختياري)',members:'أفراد العائلة (افصل بينهم بفاصلة)',save:'إضافة إلى مجموعتي',cancel:'إلغاء',local:'يُحفظ على هذا الجهاز حاليًا',empty:'لا توجد كروت في هذا التصنيف بعد.',starter:'مجموعة البداية',remove:'حذف الكارت',required:'اكتب اسم الكارت أولًا.',upload:'اختيار صورة',noImage:'أضف صورة لشخصيتك',role:'شخصية',familyType:'كارت عائلي',petType:'THIMMY · Pet',botType:'THIMMY · AI Bot',skillType:'دور أو مهارة',membersLabel:'معًا',count:'كارت',familyHint:'اجمع فردين أو أكثر في كارت واحد',expand:'المجموعة قابلة للتوسع بلا حد ثابت',},
 en:{eyebrow:'FAMILY WORLD · CHARACTER STUDIO',title:'Characters & Cards',intro:'Every character has a place and a story. Families can keep growing and add new members and characters without a fixed limit.',all:'All',character:'Characters',family:'Family cards',pet:'THIMMY Pet',bot:'THIMMY AI Bot',skill:'Roles & skills',search:'Search characters or cards',add:'Add a card',name:'Character or card name',subtitle:'Role or description',type:'Card type',image:'Character image (optional)',members:'Family members (separate with commas)',save:'Add to my collection',cancel:'Cancel',local:'Currently saved on this device',empty:'No cards in this category yet.',starter:'Starter collection',remove:'Remove card',required:'Please enter a card name first.',upload:'Choose image',noImage:'Add your character artwork',role:'Character',familyType:'Family card',petType:'THIMMY · Pet',botType:'THIMMY · AI Bot',skillType:'Role or skill',membersLabel:'Together',count:'cards',familyHint:'Bring two or more members together on one card',expand:'An expandable collection with no fixed limit',},
 zh:{eyebrow:'FAMILY WORLD · CHARACTER STUDIO',title:'角色与卡牌',intro:'每个角色都有自己的位置和故事，家庭可以持续成长，不设固定数量上限。',all:'全部',character:'角色',family:'家庭卡',pet:'THIMMY 宠物',bot:'THIMMY AI 助手',skill:'角色与技能',search:'搜索角色或卡牌',add:'添加卡牌',name:'角色或卡牌名称',subtitle:'角色或描述',type:'卡牌类型',image:'角色图片（可选）',members:'家庭成员（用逗号分隔）',save:'加入我的收藏',cancel:'取消',local:'目前保存在此设备',empty:'此分类暂无卡牌。',starter:'初始收藏',remove:'删除卡牌',required:'请先填写卡牌名称。',upload:'选择图片',noImage:'添加角色图片',role:'角色',familyType:'家庭卡',petType:'THIMMY · 宠物',botType:'THIMMY · AI 助手',skillType:'角色或技能',membersLabel:'共同参与',count:'张卡牌',familyHint:'将两位或更多家庭成员放在同一张卡上',expand:'收藏可持续扩展，没有固定数量上限',}
};
const kindOptions = ['character','family','thimmy-pet','thimmy-bot','skill'];
const kindLabel = (kind,t) => ({character:t.role,family:t.familyType,'thimmy-pet':t.petType,'thimmy-bot':t.botType,skill:t.skillType}[kind] || t.role);

function readSaved(){
  try { const raw=localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function makeId(){ return globalThis.crypto?.randomUUID?.() || `card-${Date.now()}-${Math.random().toString(36).slice(2)}`; }

export default function CharacterStudio({lang='ar'}){
 const t=labels[lang]||labels.ar;
 const [saved,setSaved]=useState(readSaved);
 const [filter,setFilter]=useState('all');
 const [query,setQuery]=useState('');
 const [showForm,setShowForm]=useState(false);
 const [name,setName]=useState('');
 const [subtitle,setSubtitle]=useState('');
 const [kind,setKind]=useState('character');
 const [members,setMembers]=useState('');
 const [image,setImage]=useState('');
 const [error,setError]=useState('');
 const rtl=lang==='ar';
 useEffect(()=>{ try{localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));}catch{setError(lang==='ar'?'مساحة التخزين المحلية ممتلئة؛ جرّب صورة أصغر.':'Local storage is full; try a smaller image.');} },[saved,lang]);
 const allCards=useMemo(()=>[...starterCards,...saved],[saved]);
 const visible=useMemo(()=>allCards.filter(card=>(filter==='all'||card.kind===filter)&&(`${typeof card.name==='string'?card.name:(card.name?.[lang]||card.name?.en||'')} ${typeof card.subtitle==='string'?card.subtitle:(card.subtitle?.[lang]||card.subtitle?.en||'')}`).toLowerCase().includes(query.toLowerCase())),[allCards,filter,query,lang]);
 function resetForm(){setName('');setSubtitle('');setKind('character');setMembers('');setImage('');setError('');setShowForm(false);}
 function handleImage(file){
   if(!file)return;
   if(!file.type.startsWith('image/')){setError('');return;}
   const reader=new FileReader();
   reader.onload=()=>{
     const img=new Image();
     img.onload=()=>{
       const scale=Math.min(1,2000/Math.max(img.width,img.height));
       const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
       const context=canvas.getContext('2d',{alpha:true});
       context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
       context.drawImage(img,0,0,canvas.width,canvas.height);
       const outputType=file.type==='image/png'?'image/png':'image/jpeg';
       setImage(canvas.toDataURL(outputType,0.92));
     };
     img.src=reader.result;
   };
   reader.readAsDataURL(file);
 }
 function addCard(event){
   event.preventDefault();
   if(!name.trim()){setError(t.required);return;}
   const item={id:makeId(),name:name.trim(),subtitle:subtitle.trim(),kind,image,members:members.split(',').map(v=>v.trim()).filter(Boolean),createdAt:new Date().toISOString(),badge:kind.toUpperCase()};
   setSaved(current=>[item,...current]);resetForm();setFilter('all');
 }
 function removeCard(id){setSaved(current=>current.filter(card=>card.id!==id));}
 return <section className="character-studio" dir={rtl?'rtl':'ltr'}>
  <header className="character-studio-head"><div><span className="cs-eyebrow"><Sparkles size={14}/>{t.eyebrow}</span><h2>{t.title}</h2><p>{t.intro}</p><small className="cs-expand">{t.expand}</small></div><button className="cs-add" onClick={()=>setShowForm(v=>!v)}><Plus size={17}/>{t.add}</button></header>
  <div className="cs-original-art" aria-label="Official Family World character artwork"><img src={`${import.meta.env.BASE_URL}assets/brand/family-world-character-board.webp`} alt="Official Family World character and card visual reference" onError={e=>{e.currentTarget.hidden=true;}}/><img src={`${import.meta.env.BASE_URL}assets/brand/family-world-game-board.webp`} alt="Official Family World game experience visual reference" onError={e=>{e.currentTarget.hidden=true;}}/></div>
  <div className="cs-toolbar"><label className="cs-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search}/></label><div className="cs-filters">{[['all',t.all],['character',t.character],['family',t.family],['thimmy-pet',t.pet],['thimmy-bot',t.bot],['skill',t.skill]].map(([value,label])=><button key={value} className={filter===value?'active':''} onClick={()=>setFilter(value)}>{label}</button>)}</div></div>
  {showForm&&<form className="cs-form" onSubmit={addCard}>
    <div className="cs-form-head"><div><b>{t.add}</b><small>{t.local}</small></div><button type="button" onClick={resetForm}>{t.cancel}</button></div>
    <div className="cs-form-grid">
      <label>{t.name}<input value={name} onChange={e=>setName(e.target.value)} maxLength={70} required/></label>
      <label>{t.subtitle}<input value={subtitle} onChange={e=>setSubtitle(e.target.value)} maxLength={120}/></label>
      <label>{t.type}<select value={kind} onChange={e=>setKind(e.target.value)}>{kindOptions.map(v=><option key={v} value={v}>{kindLabel(v,t)}</option>)}</select></label>
      {kind==='family'&&<label>{t.members}<input value={members} onChange={e=>setMembers(e.target.value)} placeholder={t.familyHint}/></label>}
      <label className="cs-upload"><ImagePlus size={18}/><span>{t.image}</span><input type="file" accept="image/*" onChange={e=>handleImage(e.target.files?.[0])}/></label>
      {image&&<img className="cs-preview" src={image} alt="Card preview"/>}
    </div>
    {error&&<p className="cs-error">{error}</p>}
    <button className="cs-save" type="submit">{t.save}</button>
  </form>}
  <div className="cs-section-label"><span>{t.starter}</span><small>{allCards.length} {t.count}</small></div>
  {visible.length===0?<div className="cs-empty">{t.empty}</div>:<div className="cs-grid">{visible.map(card=>{
    const title=typeof card.name==='string'?card.name:(card.name?.[lang]||card.name?.en||'');
    const desc=typeof card.subtitle==='string'?card.subtitle:(card.subtitle?.[lang]||card.subtitle?.en||'');
    const src=card.image?.startsWith('data:')?card.image:card.image==='family-world-character-sprite.svg'?`${import.meta.env.BASE_URL}assets/characters/${card.image}`:card.image? `${import.meta.env.BASE_URL}assets/ideas/${card.image}`:null;
    return <article className={`cs-card cs-${card.kind}`} key={card.id}>
      <div className="cs-art">{src?<img src={src} alt={title} style={Number.isInteger(card.spriteIndex)?{objectPosition:`center ${card.spriteIndex*10}%`}:undefined}/>:<div className="cs-placeholder">{card.kind==='family'?<Users/>:card.kind==='thimmy-pet'?<PawPrint/>:card.kind==='thimmy-bot'?<Bot/>:card.kind==='skill'?<BriefcaseBusiness/>:<UserRound/>}<span>{card.kind==='family'?'FAMILY':card.kind.startsWith('thimmy')?'THIMMY':'FW'}</span></div>}<span className="cs-badge">{card.badge||card.kind.toUpperCase()}</span></div>
      <div className="cs-card-copy"><span className="cs-kind">{kindLabel(card.kind,t)}</span><h3>{title}</h3>{desc&&<p>{desc}</p>}{card.members?.length>0&&<small className="cs-members"><Heart size={12}/>{t.membersLabel}: {card.members.join(' · ')}</small>}</div>
      {card.id.startsWith('starter-')?null:<button className="cs-remove" onClick={()=>removeCard(card.id)} title={t.remove} aria-label={t.remove}><Trash2 size={15}/></button>}
    </article>;
  })}</div>}
  <p className="cs-local-note">{t.local}</p>
 </section>;
}
