import { ArrowDownLeft, ArrowDownRight, ArrowUpLeft, ArrowUpRight, BookOpen, Compass, Gamepad2, House, Leaf, MapPinned, Sparkles, Sprout, Users } from 'lucide-react';
import '../styles/orbit-city.css';

const text = {
  ar: { eyebrow: 'OSMAR ECOSYSTEMS · FAMILY WORLD', title: 'OSMAR Orbit City', arabic: 'مدينة OSMAR المدارية', intro: 'مدينة عائلية حيّة؛ لكل بيت مكان، ولكل فكرة مسار، وينمو العالم بالتعلّم واللعب والتعاون.', explore: 'اختار وجهتك', home: 'بيتي العائلي', homeSub: 'مساحة الأسرة والشخصيات', garden: 'حديقة الثمار', gardenSub: 'أعمال نافعة تنمو معًا', learn: 'مختبر التعلّم', learnSub: 'مهارات ومشروعات واقعية', play: 'ساحة الألعاب', playSub: 'ألعاب عائلية وتحديات', city: 'مدينة تدور حول الإنسان والأسرة', citySub: 'أحياء مترابطة · أهداف واضحة · إنجازات ذات معنى', values: 'نحترم الأسرة والخصوصية، ونشجع التعاون والأمانة والإتقان. التقدّم رمزي واختياري، والعبادات ليست نقاطًا أو مكافآت.', cta: 'ادخل الحي', journey: 'رحلتكم تبدأ من البيت' },
  en: { eyebrow: 'OSMAR ECOSYSTEMS · FAMILY WORLD', title: 'OSMAR Orbit City', arabic: 'مدينة OSMAR المدارية', intro: 'A living family city with a place for every home and a path for every idea—growing through learning, play, and cooperation.', explore: 'Choose your destination', home: 'My Family Home', homeSub: 'Your circle and characters', garden: 'Thimar Garden', gardenSub: 'Helpful things grow together', learn: 'Learning Lab', learnSub: 'Practical skills and projects', play: 'Game Plaza', playSub: 'Family games and challenges', city: 'A city that keeps people at its heart', citySub: 'Connected districts · clear goals · meaningful progress', values: 'We honour family and privacy, and encourage cooperation, trust, and care. Progress is optional and symbolic; worship is never a point or reward.', cta: 'Enter district', journey: 'Your journey starts at home' },
  zh: { eyebrow: 'OSMAR ECOSYSTEMS · FAMILY WORLD', title: 'OSMAR Orbit City', arabic: 'OSMAR 轨道之城', intro: '一个充满活力的家庭城市：每个家庭都有归属，每个想法都有方向，在学习、游戏与协作中共同成长。', explore: '选择目的地', home: '我的家庭之家', homeSub: '家庭圈与角色', garden: 'Thimar 花园', gardenSub: '有益行动共同成长', learn: '学习实验室', learnSub: '实践技能与家庭项目', play: '游戏广场', playSub: '家庭游戏与挑战', city: '以人与家庭为中心的城市', citySub: '互联街区 · 清晰目标 · 有意义的成长', values: '尊重家庭与隐私，鼓励协作、诚信与认真。成长进度自愿且具象征意义；崇拜不会转化为积分或奖励。', cta: '进入街区', journey: '旅程从家开始' },
};

export default function OSMAROrbitCity({ lang = 'ar', onNavigate }) {
  const t = text[lang] || text.ar;
  const rtl = lang === 'ar';
  const To = rtl ? ArrowDownLeft : ArrowDownRight;
  const From = rtl ? ArrowUpLeft : ArrowUpRight;
  const districts = [
    { id: 'family-home', icon: House, title: t.home, description: t.homeSub, tone: 'sand', number: '01' },
    { id: 'garden', icon: Sprout, title: t.garden, description: t.gardenSub, tone: 'leaf', number: '02' },
    { id: 'threex', icon: BookOpen, title: t.learn, description: t.learnSub, tone: 'sky', number: '03' },
    { id: 'play', icon: Gamepad2, title: t.play, description: t.playSub, tone: 'plum', number: '04' },
  ];
  return <section className="orbit-city" dir={rtl ? 'rtl' : 'ltr'}>
    <header className="oc-hero">
      <img className="oc-art" src={`${import.meta.env.BASE_URL}assets/worlds/osmar-orbit-city.svg`} alt="" />
      <div className="oc-shade" />
      <div className="oc-hero-copy"><span className="oc-eyebrow"><Sparkles size={14}/>{t.eyebrow}</span><h1>{t.title}</h1><b>{t.arabic}</b><p>{t.intro}</p><span className="oc-live"><i/>{t.city}</span></div>
      <span className="oc-scroll"><span>01 / 04</span><To size={14}/></span>
    </header>
    <section className="oc-districts"><div className="oc-section-title"><div><small>01 · ORBIT DISTRICTS</small><h2>{t.explore}</h2></div><span><MapPinned size={15}/>{t.citySub}</span></div>
      <div className="oc-grid">{districts.map(item=>{const Icon=item.icon;return <button className={`oc-card oc-${item.tone}`} key={item.id} onClick={()=>onNavigate(item.id)}><span className="oc-card-number">{item.number}</span><span className="oc-card-icon"><Icon size={23}/></span><span className="oc-card-copy"><b>{item.title}</b><small>{item.description}</small></span><From size={17} className="oc-card-arrow"/><span className="oc-card-orbit"/></button>})}</div>
    </section>
    <section className="oc-note"><div className="oc-note-icon"><Leaf size={20}/></div><div><small>02 · OSMAR PRINCIPLES</small><h2>{t.journey}</h2><p>{t.values}</p></div><Compass className="oc-compass" size={43}/></section>
    <footer className="oc-footer"><Users size={15}/><span>OSMAR Ecosystems</span><i/>Family World · Thimar OSMAR</footer>
  </section>;
}
