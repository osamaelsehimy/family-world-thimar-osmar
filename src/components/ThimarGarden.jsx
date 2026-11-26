import { useEffect, useState } from 'react';
import { Sprout, Leaf, Sun, CheckCircle2, TreePine, Flower2, RotateCcw } from 'lucide-react';
import '../styles/premium-experience.css';

const words = {
  ar: {
    kicker:'THIMAR UNIVERSE',title:'حديقة الثمار',subtitle:'كل عمل نافع بذرة، وكل تعاون يخلّي عالم الأسرة أجمل.',
    today:'مهام اليوم',progress:'إنجازات اليوم',plants:'نباتات حديقتك',growth:'مجموع البذور المزروعة',
    tasks:[
      {id:'home',icon:'🏡',title:'ساعد في ترتيب ركن في البيت',detail:'مشاركة بسيطة تخفف عن حد من الأسرة'},
      {id:'learn',icon:'📚',title:'اتعلم حاجة جديدة لمدة 10 دقايق',detail:'معلومة أو مهارة تنفعك وتنفع غيرك'},
      {id:'kind',icon:'💚',title:'قدّم مساعدة أو كلمة طيبة',detail:'اختار تصرفًا لطيفًا مع حد من العيلة أو المجتمع'},
      {id:'green',icon:'🌿',title:'اهتم بنعمة من حولك',detail:'اسقِ نباتًا أو حافظ على نظافة المكان'},
    ],
    plantsList:[
      {name:'شتلة الأمل',need:0,icon:'🌱',desc:'أول خطوة في رحلتك'},
      {name:'زهرة التعاون',need:2,icon:'🌼',desc:'تنمو بالمشاركة'},
      {name:'شجرة العطاء',need:5,icon:'🌳',desc:'جذورها في العمل النافع'},
      {name:'بستان الثمار',need:10,icon:'🍎',desc:'ثمرة الاستمرار والتعاون'},
    ],
    done:'تم الإنجاز',mark:'أنجزت المهمة',locked:'تحتاج',more:'إنجازات إضافية لفتحها',
    note:'التقدم محفوظ على هذا الجهاز فقط في هذه النسخة. النقاط والشتلات رمزية داخل اللعبة، وليست أموالًا أو مكافآت مادية.',
    reset:'إعادة ضبط بيانات هذا الجهاز',resetConfirm:'هل تريد مسح تقدم الحديقة المحفوظ على هذا الجهاز؟',
    resetDone:'تمت إعادة ضبط الحديقة على هذا الجهاز.',verse:'﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى ﴾',reference:'المائدة: ٢',
  },
  en: {
    kicker:'THIMAR UNIVERSE',title:'Thimar Garden',subtitle:'Every helpful action is a seed. Every act of teamwork makes our family world bloom.',
    today:"Today's missions",progress:"Today's progress",plants:'Your garden plants',growth:'Seeds planted in total',
    tasks:[
      {id:'home',icon:'🏡',title:'Help tidy a corner at home',detail:'A small contribution that makes family life easier'},
      {id:'learn',icon:'📚',title:'Learn something for 10 minutes',detail:'A useful fact or skill to share'},
      {id:'kind',icon:'💚',title:'Offer help or a kind word',detail:'Choose a thoughtful act for family or community'},
      {id:'green',icon:'🌿',title:'Care for a gift around you',detail:'Water a plant or help keep a place clean'},
    ],
    plantsList:[
      {name:'Hope Seedling',need:0,icon:'🌱',desc:'The first step of your journey'},
      {name:'Teamwork Bloom',need:2,icon:'🌼',desc:'Grows through cooperation'},
      {name:'Giving Tree',need:5,icon:'🌳',desc:'Rooted in helpful actions'},
      {name:'Thimar Orchard',need:10,icon:'🍎',desc:'The fruit of consistency and teamwork'},
    ],
    done:'Completed',mark:'Mark complete',locked:'Need',more:'more achievements to unlock',
    note:'Progress is stored on this device only in this version. Seeds and plants are symbolic game progress, not money or material rewards.',
    reset:'Reset this device’s garden',resetConfirm:'Clear the garden progress saved on this device?',
    resetDone:'Garden progress on this device has been reset.',verse:'“Cooperate in goodness and mindfulness.”',reference:'Qur’an 5:2',
  },
  zh: {
    kicker:'THIMAR UNIVERSE',title:'Thimar 花园',subtitle:'每一个有益的行动都是一粒种子，每一次合作都让家庭世界更加美好。',
    today:'今日任务',progress:'今日进度',plants:'你的花园植物',growth:'累计种下的种子',
    tasks:[
      {id:'home',icon:'🏡',title:'帮忙整理家里的一个角落',detail:'小小的付出，让家庭生活更轻松'},
      {id:'learn',icon:'📚',title:'学习新知识十分钟',detail:'学习一项有用的信息或技能'},
      {id:'kind',icon:'💚',title:'提供帮助或一句善意的话',detail:'为家人或社区做一件贴心的小事'},
      {id:'green',icon:'🌿',title:'爱护身边的美好事物',detail:'给植物浇水或保持环境整洁'},
    ],
    plantsList:[
      {name:'希望幼苗',need:0,icon:'🌱',desc:'旅程的第一步'},
      {name:'合作之花',need:2,icon:'🌼',desc:'在合作中成长'},
      {name:'奉献之树',need:5,icon:'🌳',desc:'扎根于有益的行动'},
      {name:'Thimar 果园',need:10,icon:'🍎',desc:'坚持与合作结出的果实'},
    ],
    done:'已完成',mark:'标记完成',locked:'还需',more:'项成就即可解锁',
    note:'此版本的进度仅保存在本设备上。种子和植物是游戏中的象征性进度，不是金钱或物质奖励。',
    reset:'重置本设备花园',resetConfirm:'确定清除此设备上保存的花园进度吗？',
    resetDone:'此设备上的花园进度已重置。',verse:'“你们当以善行和敬畏互相帮助。”',reference:'古兰经 5:2',
  }
};

function todayKey() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
}
function loadGarden(key) {
  const fresh = { date: todayKey(), done: [], total: 0 };
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || 'null');
    if (!saved || typeof saved !== 'object') return fresh;
    return { date: todayKey(), done: saved.date === fresh.date && Array.isArray(saved.done) ? saved.done : [], total: Math.max(0, Number(saved.total) || 0) };
  } catch { return fresh; }
}

export default function ThimarGarden({ lang='ar', userId='guest' }) {
  const t = words[lang] || words.ar;
  const storageKey = 'thimar-garden-v1-' + String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const [garden, setGarden] = useState(() => loadGarden(storageKey));
  const [message, setMessage] = useState('');
  useEffect(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(garden)); } catch { /* local storage may be unavailable */ }
  }, [garden, storageKey]);
  const complete = (id) => {
    if (garden.done.includes(id)) return;
    setGarden(current => ({ ...current, done: [...current.done, id], total: current.total + 1 }));
    setMessage('');
  };
  const reset = () => {
    if (!window.confirm(t.resetConfirm)) return;
    const next = { date: todayKey(), done: [], total: 0 };
    setGarden(next);
    setMessage(t.resetDone);
  };
  const percent = Math.round(garden.done.length / t.tasks.length * 100);
  return <section className="thimar-garden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <style>{`
      .thimar-garden{max-width:1100px;margin:10px auto 36px;padding:clamp(14px,3vw,28px);color:#214536}
      .tg-hero{position:relative;overflow:hidden;padding:clamp(22px,4vw,38px);border-radius:26px;background:linear-gradient(125deg,#174c3b,#347653 65%,#8cac64);color:#fff;box-shadow:0 18px 40px #153d241c}
      .tg-hero:after{content:'🌳';position:absolute;font-size:clamp(90px,17vw,170px);opacity:.2;inset-inline-end:5%;bottom:-22px}
      .tg-kicker{font-size:10px;letter-spacing:2px;font-weight:900;color:#e9d99b}.tg-hero h1{font-size:clamp(27px,4vw,40px);margin:8px 0}.tg-hero p{max-width:650px;line-height:1.9;color:#e5f2e7;font-size:14px;margin:0}
      .tg-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:16px 0}.tg-metric{padding:16px;border:1px solid #e3eadf;border-radius:17px;background:#fff}.tg-metric small{display:block;color:#718778;font-size:11px}.tg-metric strong{display:block;color:#246044;font-size:27px;margin-top:4px}.tg-progress{height:9px;border-radius:99px;background:#e8eee3;overflow:hidden;margin-top:10px}.tg-progress i{display:block;height:100%;background:linear-gradient(90deg,#6eaa6a,#e4bf66);border-radius:99px}
      .tg-section-title{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:24px 0 12px}.tg-section-title h2{font-size:19px;margin:0;color:#214c38}.tg-section-title span{font-size:11px;color:#829184}
      .tg-task-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.tg-task{display:flex;gap:12px;align-items:center;padding:15px;border:1px solid #e5ebdf;border-radius:17px;background:#fff;min-width:0}.tg-task.is-done{background:#f2f8ed;border-color:#cfe1c9}.tg-task-icon{display:grid;place-items:center;flex:0 0 42px;width:42px;height:42px;border-radius:13px;background:#edf4e8;font-size:22px}.tg-task-copy{flex:1;min-width:0}.tg-task-copy b{display:block;font-size:13px;color:#2c533d}.tg-task-copy small{display:block;margin-top:4px;color:#849187;font-size:11px;line-height:1.5}.tg-task button{flex:0 0 auto;border:0;border-radius:10px;padding:9px 11px;background:#286347;color:#fff;font-size:11px;font-weight:800}.tg-task button:disabled{background:#e5f0e0;color:#3b714b;cursor:default}
      .tg-plant-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.tg-plant{padding:17px 12px;text-align:center;border:1px solid #e3eadf;border-radius:17px;background:#fff}.tg-plant.locked{opacity:.55;background:#f7f8f5}.tg-plant-icon{font-size:42px;display:block;margin-bottom:8px}.tg-plant b{display:block;color:#2b5a40;font-size:12px}.tg-plant small{display:block;margin-top:5px;color:#829184;font-size:10px;line-height:1.5}.tg-plant em{display:block;margin-top:8px;color:#9b8046;font-size:10px;font-style:normal}
      .tg-verse{display:flex;gap:12px;align-items:center;margin-top:17px;padding:17px;border-radius:16px;background:#f4f7ed;color:#41644b}.tg-verse span{font-size:25px}.tg-verse b{display:block;font-size:14px}.tg-verse small{display:block;margin-top:4px;color:#829184}
      .tg-note{margin-top:13px;padding:12px 14px;border:1px solid #eee8d5;border-radius:13px;background:#fffdf6;color:#7d755e;font-size:11px;line-height:1.7}.tg-reset{margin-top:12px;border:1px solid #e1e8df;border-radius:10px;background:#fff;color:#778579;padding:9px 12px;font-size:11px}.tg-message{color:#286347;font-size:12px;margin-top:8px}
      @media(max-width:680px){.tg-task-grid{grid-template-columns:1fr}.tg-plant-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.tg-task{padding:12px}.tg-task button{padding:9px}.tg-hero{border-radius:20px}}
      @media(prefers-reduced-motion:reduce){.tg-progress i{transition:none}}
    `}</style>
    <header className="tg-hero"><div className="tg-kicker">{t.kicker}</div><h1>🌿 {t.title}</h1><p>{t.subtitle}</p></header>
    <div className="tg-summary">
      <div className="tg-metric"><small>{t.progress}</small><strong>{garden.done.length}/{t.tasks.length}</strong><div className="tg-progress"><i style={{width:percent+'%'}} /></div></div>
      <div className="tg-metric"><small>{t.growth}</small><strong>🌱 {garden.total}</strong></div>
    </div>
    <div className="tg-section-title"><h2><Sun size={18} style={{verticalAlign:'middle'}} /> {t.today}</h2><span>{percent}%</span></div>
    <div className="tg-task-grid">{t.tasks.map(task => {
      const isDone = garden.done.includes(task.id);
      return <article className={'tg-task'+(isDone?' is-done':'')} key={task.id}>
        <span className="tg-task-icon">{task.icon}</span><div className="tg-task-copy"><b>{task.title}</b><small>{task.detail}</small></div>
        <button type="button" disabled={isDone} onClick={() => complete(task.id)}>{isDone ? <><CheckCircle2 size={13} /> {t.done}</> : t.mark}</button>
      </article>;
    })}</div>
    <div className="tg-section-title"><h2><Leaf size={18} style={{verticalAlign:'middle'}} /> {t.plants}</h2><span>{t.plantsList.filter(p => garden.total >= p.need).length}/4</span></div>
    <div className="tg-plant-grid">{t.plantsList.map((plant,i) => {
      const unlocked = garden.total >= plant.need;
      return <article className={'tg-plant'+(!unlocked?' locked':'')} key={plant.name}>
        <span className="tg-plant-icon">{unlocked ? plant.icon : '🔒'}</span><b>{plant.name}</b><small>{unlocked ? plant.desc : t.locked+' '+(plant.need-garden.total)+' '+t.more}</small>
      </article>;
    })}</div>
    <div className="tg-verse"><span>🤝</span><div><b>{t.verse}</b><small>{t.reference}</small></div></div>
    <p className="tg-note">{t.note}</p>
    <button className="tg-reset" type="button" onClick={reset}><RotateCcw size={13} style={{verticalAlign:'middle'}} /> {t.reset}</button>
    {message && <p className="tg-message" role="status">{message}</p>}
  </section>;
}
