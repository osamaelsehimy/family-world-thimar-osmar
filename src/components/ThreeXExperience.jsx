import React from 'react';
import { Home, Building2, Map, BookOpen, ArrowUpRight, Sparkles } from 'lucide-react';
import '../styles/three-x.css';

const copy={
 ar:{kicker:'THIMAR · FAMILY WORLD',title:'ثلاثي الأثر | 3X',intro:'ثلاث مساحات للخيال والتخطيط والعمل النافع. اختار التحدي اللي يناسبك وابدأ بخطوة صغيرة.',guide:'افتح دليل اللعب',tracks:[
 {n:'01',name:'بيت يبدأ بفكرة',tag:'تحدي البيت · 100 م²',desc:'صمّم بيتًا عمليًا ومريحًا يخدم احتياجات الأسرة.',cta:'ابدأ تحدي البيت',icon:Home},
 {n:'02',name:'مشروع يصنع فرقًا',tag:'المشروعات · 10,000 م²',desc:'حوّل فكرة مشروع إلى مخطط وفريق وخطة تنفيذ.',cta:'قريبًا · مسار متخصص',icon:Building2},
 {n:'03',name:'مدينة نبنيها سوا',tag:'المدينة · 1000 × 1000',desc:'شارك في تخطيط مدينة مترابطة بخدمات ومساحات خضراء.',cta:'قريبًا · عالم تعاوني',icon:Map}
 ],note:'ابدأ من تحدي البيت 100 م²؛ باقي المسارات تتفتح على مراحل.'},
 en:{kicker:'THIMAR · FAMILY WORLD',title:'Thimar 3X · Threefold Impact',intro:'Three spaces for imagination, planning, and meaningful action. Choose a challenge and begin with one small step.',guide:'Open the play guide',tracks:[
 {n:'01',name:'A Home Starts with an Idea',tag:'Home challenge · 100 m²',desc:'Design a practical, comfortable home around family needs.',cta:'Start the home challenge',icon:Home},
 {n:'02',name:'A Project That Makes a Difference',tag:'Enterprise · 10,000 m²',desc:'Turn a project idea into a plan, team, and delivery path.',cta:'Coming soon · Expert track',icon:Building2},
 {n:'03',name:'A City We Build Together',tag:'City · 1000 × 1000',desc:'Help plan a connected city with services and green spaces.',cta:'Coming soon · Collaborative world',icon:Map}
 ],note:'Start with the 100 m² home challenge. Other tracks will open in stages.'},
 zh:{kicker:'THIMAR · FAMILY WORLD',title:'Thimar 3X · 三重影响力',intro:'三个空间，激发创意、规划与有益行动。选择一个挑战，从小小一步开始。',guide:'打开游戏指南',tracks:[
 {n:'01',name:'从构想到家',tag:'住宅挑战 · 100 平方米',desc:'围绕家庭需求设计实用舒适的住宅。',cta:'开始住宅挑战',icon:Home},
 {n:'02',name:'创造价值的项目',tag:'企业项目 · 10,000 平方米',desc:'把项目构想转化为计划、团队与执行路径。',cta:'即将推出 · 专家路线',icon:Building2},
 {n:'03',name:'共同建设的城市',tag:'城市 · 1000 × 1000',desc:'参与规划服务完善、绿色宜居的互联城市。',cta:'即将推出 · 协作世界',icon:Map}
 ],note:'先从 100 平方米住宅挑战开始，其他路线将分阶段开放。'}
};
export default function ThreeXExperience({lang='ar',onGuide,onStart}){
 const t=copy[lang]||copy.en,rtl=lang==='ar',sectionTitle=lang==='ar'?'اختار رحلتك':lang==='zh'?'选择你的挑战':'Choose your challenge',sectionEyebrow=lang==='ar'?'ثلاثة عوالم · هدف واحد':lang==='zh'?'三个世界 · 一个目标':'THREE WORLDS · ONE PURPOSE';
 return <main className="threex-page threex-landing" dir={rtl?'rtl':'ltr'}>
  <header className="threex-hero"><span><Sparkles size={13}/> {t.kicker}</span><h1>{t.title}</h1><p>{t.intro}</p><button className="threex-guide-button" onClick={onGuide}><BookOpen size={17}/>{t.guide}<ArrowUpRight size={16}/></button></header>
  <section className="threex-section"><div className="threex-heading"><span>{sectionEyebrow}</span><h2>{sectionTitle}</h2></div><div className="threex-grid">{t.tracks.map((x,i)=>{const Icon=x.icon;return <article className="threex-card threex-short-card" key={x.n}><div className="threex-card-head"><span>{x.n}</span><Icon/><small>{x.tag}</small></div><h3>{x.name}</h3><p>{x.desc}</p><button className="threex-card-action" onClick={()=>i===0&&onStart?.()} disabled={i!==0}>{x.cta}</button></article>})}</div></section>
  <p className="threex-note">{t.note}</p>
 </main>;
}
