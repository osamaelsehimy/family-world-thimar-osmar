import React from 'react';
import { Clapperboard, Sparkles } from 'lucide-react';

const copy={
 ar:{eyebrow:'FAMILY WORLD · ENTERTAINMENT',title:'ثيمي والبوت',subtitle:'مسلسل كرتوني قادم قريبًا',description:'رحلة ممتعة تجمع ثيمي ورفيقه الآلي في عالم الأسرة، والتعلّم، والتعاون، والاكتشاف.',status:'قريبًا',poster:'البوستر الرسمي للعمل القادم',credit:'Family World · Developed by OSMAR Ecosystems'},
 en:{eyebrow:'FAMILY WORLD · ENTERTAINMENT',title:'Thimmy & The Bot',subtitle:'An animated series coming soon',description:'A fun journey with Thimmy and his robot companion through family life, learning, teamwork and discovery.',status:'Coming soon',poster:'Official poster for the upcoming series',credit:'Family World · Developed by OSMAR Ecosystems'},
 zh:{eyebrow:'FAMILY WORLD · 娱乐',title:'Thimmy 与机器人',subtitle:'动画系列即将推出',description:'与 Thimmy 和他的机器人伙伴一起，在家庭生活、学习、合作与探索中展开有趣旅程。',status:'即将推出',poster:'即将推出的动画系列官方海报',credit:'Family World · Developed by OSMAR Ecosystems'}
};
export default function EntertainmentHub({lang='ar'}){
 const t=copy[lang]||copy.ar;
 return <main className="entertainment-hub" dir={lang==='ar'?'rtl':'ltr'}>
  <header className="entertainment-heading"><span><Clapperboard size={15}/>{t.eyebrow}</span><h1>{t.title}</h1><p>{t.subtitle}</p><small>{t.description}</small></header>
  <article className="entertainment-poster">
   <img src={`${import.meta.env.BASE_URL}assets/brand/family-world-character-board.webp`} alt={t.poster}/>
   <div className="entertainment-poster-caption"><Sparkles size={16}/><strong>{t.status}</strong><span>{t.credit}</span></div>
  </article>
 </main>;
}
