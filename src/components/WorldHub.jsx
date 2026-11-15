import React from 'react';
import {
  ArrowUpLeft, ArrowUpRight, Home, Gamepad2, BookOpen, Store, Users,
  BriefcaseBusiness, Leaf, Sparkles, Trophy, Map, ClipboardList, UserRound
} from 'lucide-react';
import '../styles/world-hub.css';

const words = {
  ar: {
    eyebrow:'OSMAR ECOSYSTEMS · FAMILY WORLD',title:'عالم واحد… وكل خطوة فيه بتثمر',
    intro:'مساحة عائلية مترابطة نتعلم ونلعب ونخطط وننجز فيها معًا، ونحوّل الأفكار إلى أثر نافع في حياتنا.',
    explore:'ابدأ رحلتك',featured:'أول تحدياتنا الواقعية',apartment:'بيت الأسرة · 100 م²',
    apartmentDesc:'خطّط شقتك خطوة بخطوة، وشارك الأسرة في اختيار الاحتياجات وتوزيع المساحات.',
    openChallenge:'افتح تحدي الشقة',worlds:'عوالمنا',games:'ساحة الألعاب',learning:'التعلّم والقصص',
    market:'السوق الافتراضي',community:'الأسرة والمجتمع',projects:'المشروعات وWBS',
    dashboard:'إنجازاتي',profile:'ملفي الشخصي',coming:'مساحة تعريفية · قيد التطوير',
    available:'متاح الآن',earned:'نقاط مسجلة',awards:'إنجازات',privacy:'كل تجربة لها هدف واضح، وبيانات الأسرة تظل خاصة.',
    categories:'اكتشف مساحات عالم الأسرة'
  },
  en: {
    eyebrow:'OSMAR ECOSYSTEMS · FAMILY WORLD',title:'One world. Every step grows something good.',
    intro:'A connected family space to learn, play, plan and achieve together—turning ideas into meaningful impact.',
    explore:'Begin your journey',featured:'Our first real-world challenge',apartment:'Family Home · 100 m²',
    apartmentDesc:'Plan your apartment step by step and shape the rooms around your household’s needs.',
    openChallenge:'Open the home challenge',worlds:'Our Worlds',games:'Game Arcade',learning:'Learning & Stories',
    market:'Virtual Marketplace',community:'Family & Community',projects:'Projects & WBS',
    dashboard:'My Progress',profile:'My Profile',coming:'Introduction space · In development',
    available:'Available now',earned:'Recorded points',awards:'Achievements',privacy:'Every experience has a clear purpose. Family data stays private.',
    categories:'Explore the Family World spaces'
  },
  zh: {
    eyebrow:'OSMAR ECOSYSTEMS · FAMILY WORLD',title:'一个世界，每一步都创造美好',
    intro:'一个相互连接的家庭空间，让我们共同学习、游戏、规划与行动，把想法转化为有益的影响。',
    explore:'开启旅程',featured:'我们的首个现实挑战',apartment:'家庭住宅 · 100 平方米',
    apartmentDesc:'逐步规划您的公寓，与家人一起确定需求和空间布局。',
    openChallenge:'打开住宅挑战',worlds:'我们的世界',games:'游戏天地',learning:'学习与故事',
    market:'虚拟市场',community:'家庭与社区',projects:'项目与 WBS',
    dashboard:'我的进度',profile:'个人资料',coming:'介绍页面 · 开发中',
    available:'现已开放',earned:'已记录积分',awards:'成就',privacy:'每项体验都有明确目标，家庭资料保持私密。',
    categories:'探索家庭世界的各个空间'
  }
};
function OriginalHomeIllustration() {
  return <div className="wh-art" role="img" aria-label="Original illustrated family home and garden">
    <div className="wh-sun"/><div className="wh-cloud wh-cloud-a"/><div className="wh-cloud wh-cloud-b"/>
    <div className="wh-island"><div className="wh-path"/><div className="wh-house"><i/><i/><i/><b/></div>
      <div className="wh-room"><i/><i/><i/><b/></div><div className="wh-tree wh-tree-a"/><div className="wh-tree wh-tree-b"/>
      <div className="wh-flower wh-flower-a"/><div className="wh-flower wh-flower-b"/><div className="wh-lamp"/>
    </div><span className="wh-art-label">THIMAR · HOME & GROWTH</span>
  </div>;
}
const spaces = [
  ['worlds',GlobeIcon,'worlds','worlds'],
  ['play',Gamepad2,'games','games'],
  ['learning',BookOpen,'learning','learning'],
  ['market',Store,'market','market'],
  ['community',Users,'community','community'],
  ['projects',BriefcaseBusiness,'projects','projects'],
  ['dashboard',Trophy,'dashboard','dashboard'],
  ['profile',UserRound,'profile','profile']
];
function GlobeIcon(){return <Map/>}
export default function WorldHub({lang='ar',points=0,awards=0,onNavigate,onChallenge}) {
  const t=words[lang]||words.ar, rtl=lang==='ar', Arrow=rtl?ArrowUpLeft:ArrowUpRight;
  const labels={worlds:t.worlds,games:t.games,learning:t.learning,market:t.market,community:t.community,projects:t.projects,dashboard:t.dashboard,profile:t.profile};
  return <div className="world-hub" dir={rtl?'rtl':'ltr'}>
    <section className="wh-hero">
      <div className="wh-copy"><span className="wh-eyebrow"><Sparkles size={14}/>{t.eyebrow}</span>
        <h1>{t.title}</h1><p>{t.intro}</p>
        <button className="wh-primary" onClick={()=>onNavigate('worlds')}>{t.explore}<Arrow size={17}/></button>
        <div className="wh-stats"><span><b>{points}</b><small>{t.earned}</small></span><i/><span><b>{awards}</b><small>{t.awards}</small></span></div>
      </div><OriginalHomeIllustration/>
    </section>
    <section className="wh-feature">
      <div className="wh-feature-copy"><span>{t.featured}</span><h2>{t.apartment}</h2><p>{t.apartmentDesc}</p>
        <button onClick={onChallenge}>{t.openChallenge}<Arrow size={16}/></button>
      </div><div className="wh-plan" aria-hidden="true"><div className="wh-plan-room room-living">LIVING</div><div className="wh-plan-room room-bed">BED</div><div className="wh-plan-room room-kitchen">KITCHEN</div><div className="wh-plan-room room-bath">BATH</div><small>10 m × 10 m · 100 m²</small></div>
    </section>
    <section className="wh-spaces"><div className="wh-section-head"><span>FAMILY WORLD / 01</span><h2>{t.categories}</h2></div>
      <div className="wh-grid">{spaces.map(([id,Icon,key])=><button className={'wh-card wh-'+id} key={id} onClick={()=>onNavigate(id==='market'?'play':id==='learning'?'worlds':id==='community'?'worlds':id==='projects'?'threex':id)}>
        <span className="wh-card-icon"><Icon size={22}/></span><b>{labels[key]}</b>
        <small>{id==='play'?t.available:t.coming}</small><Arrow size={16} className="wh-card-arrow"/>
      </button>)}</div>
    </section>
    <p className="wh-footnote"><Leaf size={15}/>{t.privacy}</p>
  </div>;
}
