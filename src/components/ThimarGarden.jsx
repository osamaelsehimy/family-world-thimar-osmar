import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sprout, Leaf, Sun, CheckCircle2, RotateCcw, Users, Copy, RefreshCw, TreePine } from 'lucide-react';
import '../styles/premium-experience.css';

const words = {
  ar: {
    kicker:'THIMAR UNIVERSE',title:'حديقة الثمار',subtitle:'كل عمل نافع بذرة، وكل تعاون يخلّي عالم الأسرة أجمل.',
    today:'مهام اليوم',progress:'إنجازاتك اليوم',plants:'نباتات حديقتكم',growth:'إجمالي إنجازات الأسرة',
    tasks:[
      {id:'home',icon:'🏡',title:'ساعد في ترتيب ركن في البيت',detail:'مشاركة بسيطة تخفف عن حد من الأسرة'},
      {id:'learn',icon:'📚',title:'اتعلم حاجة جديدة لمدة 10 دقايق',detail:'معلومة أو مهارة تنفعك وتنفع غيرك'},
      {id:'kind',icon:'💚',title:'قدّم مساعدة أو كلمة طيبة',detail:'اختار تصرفًا لطيفًا مع حد من العيلة أو المجتمع'},
      {id:'green',icon:'🌿',title:'اهتم بنعمة من حولك',detail:'اسقِ نباتًا أو حافظ على نظافة المكان'},
    ],
    plantsList:[
      {name:'شتلة الأمل',need:0,icon:'🌱',desc:'أول خطوة في رحلتكم'},
      {name:'زهرة التعاون',need:2,icon:'🌼',desc:'تنمو بالمشاركة'},
      {name:'شجرة العطاء',need:5,icon:'🌳',desc:'جذورها في العمل النافع'},
      {name:'بستان الثمار',need:10,icon:'🍎',desc:'ثمرة الاستمرار والتعاون'},
    ],
    done:'تم الإنجاز',mark:'أنجزت المهمة',locked:'تحتاج',more:'إنجازات إضافية لفتحها',
    note:'النقاط والشتلات رمزية داخل اللعبة وليست أموالًا أو مكافآت مادية. إنجازات الأسرة مشتركة، وكل عضو يحتفظ بسجل إنجازاته اليومية.',
    reset:'إعادة ضبط بيانات هذا الجهاز',resetConfirm:'هل تريد مسح تقدم الحديقة المحفوظ على هذا الجهاز؟',
    resetDone:'تمت إعادة ضبط الحديقة على هذا الجهاز.',verse:'﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى ﴾',reference:'المائدة: ٢',
    family:'دائرتكم العائلية',members:'أفراد الأسرة',invite:'كود دعوة الأسرة',copy:'نسخ الكود',copied:'تم نسخ الكود',shareHint:'شارك الكود مع أفراد أسرتك الموثوقين فقط.',
    createTitle:'ابدأوا حديقتكم العائلية',createHint:'أنشئ دائرة خاصة لأسرتك، وبعدها شارك كود الدعوة مع أفرادها.',
    familyName:'اسم الأسرة أو الدائرة',create:'إنشاء دائرة الأسرة',joinTitle:'عندك كود دعوة؟',joinHint:'اكتب الكود اللي وصلك من أحد أفراد الأسرة.',invitePlaceholder:'مثال: A1B2C3D4E5',join:'انضم للأسرة',
    owner:'منشئ الدائرة',member:'عضو',loading:'بنجهز حديقتكم…',refresh:'تحديث',cloudNote:'تقدم الأسرة محفوظ على الحساب ومتاح لأعضائها من أجهزتهم بعد تسجيل الدخول.',
    error:'حصلت مشكلة: ',local:'وضع تجريبي على هذا الجهاز',familyToday:'إنجازات الأسرة اليوم',yourDone:'أنجزتها أنت اليوم',
  },
  en: {
    kicker:'THIMAR UNIVERSE',title:'Thimar Garden',subtitle:'Every helpful action is a seed. Every act of teamwork makes our family world bloom.',
    today:"Today's missions",progress:"Your progress today",plants:'Your family garden',growth:'Family achievements total',
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
    note:'Seeds and plants are symbolic game progress, not money or material rewards. Family achievements are shared, while each member keeps their own daily activity record.',
    reset:'Reset this device’s garden',resetConfirm:'Clear the garden progress saved on this device?',
    resetDone:'Garden progress on this device has been reset.',verse:'“Cooperate in goodness and mindfulness.”',reference:'Qur’an 5:2',
    family:'Your family circle',members:'Family members',invite:'Family invitation code',copy:'Copy code',copied:'Code copied',shareHint:'Share this code only with trusted family members.',
    createTitle:'Start your family garden',createHint:'Create a private family circle, then share its invitation code with your family.',
    familyName:'Family or circle name',create:'Create family circle',joinTitle:'Have an invitation code?',joinHint:'Enter the code shared by a family member.',invitePlaceholder:'Example: A1B2C3D4E5',join:'Join family',
    owner:'Circle owner',member:'Member',loading:'Preparing your garden…',refresh:'Refresh',cloudNote:'Family progress is saved to your account and available to members on their own devices after sign-in.',
    error:'Something went wrong: ',local:'Device-only demo mode',familyToday:"Family achievements today",yourDone:'Completed by you today',
  },
  zh: {
    kicker:'THIMAR UNIVERSE',title:'Thimar 花园',subtitle:'每一个有益的行动都是一粒种子，每一次合作都让家庭世界更加美好。',
    today:'今日任务',progress:'你的今日进度',plants:'家庭花园植物',growth:'家庭累计成就',
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
    note:'种子和植物是游戏中的象征性进度，不是金钱或物质奖励。家庭成就共享，每位成员保留自己的每日活动记录。',
    reset:'重置本设备花园',resetConfirm:'确定清除此设备上保存的花园进度吗？',
    resetDone:'此设备上的花园进度已重置。',verse:'“你们当以善行和敬畏互相帮助。”',reference:'古兰经 5:2',
    family:'你的家庭圈',members:'家庭成员',invite:'家庭邀请码',copy:'复制代码',copied:'代码已复制',shareHint:'请只与可信赖的家庭成员分享此代码。',
    createTitle:'创建家庭花园',createHint:'创建一个私密家庭圈，然后与家人分享邀请码。',
    familyName:'家庭或圈子名称',create:'创建家庭圈',joinTitle:'已有邀请码？',joinHint:'输入家庭成员分享给你的代码。',invitePlaceholder:'例如：A1B2C3D4E5',join:'加入家庭',
    owner:'圈子创建者',member:'成员',loading:'正在准备花园…',refresh:'刷新',cloudNote:'家庭进度保存在账户中，成员登录后可在自己的设备上查看。',
    error:'发生错误：',local:'仅限本设备的体验模式',familyToday:'家庭今日成就',yourDone:'你今日完成的任务',
  }
};

function todayKey() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
}
function loadLocal(key) {
  const fresh = { date: todayKey(), done: [], total: 0 };
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || 'null');
    if (!saved || typeof saved !== 'object') return fresh;
    return { date: todayKey(), done: saved.date === fresh.date && Array.isArray(saved.done) ? saved.done : [], total: Math.max(0, Number(saved.total) || 0) };
  } catch { return fresh; }
}

export default function ThimarGarden({ lang='ar', userId='guest', supabase=null }) {
  const t = words[lang] || words.ar;
  const localMode = !supabase || userId === 'demo';
  const storageKey = 'thimar-garden-v1-' + String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const [localGarden, setLocalGarden] = useState(() => loadLocal(storageKey));
  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(!localMode);
  const [busy, setBusy] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (localMode) return;
    setLoading(true); setError('');
    try {
      const { data, error: rpcError } = await supabase.rpc('family_circle_dashboard');
      if (rpcError) throw rpcError;
      setCircle(data?.circle || null);
    } catch (e) {
      setError((t.error || '') + (e?.message || 'Unable to load family circle'));
    } finally { setLoading(false); }
  }, [localMode, supabase, t.error]);

  useEffect(() => {
    if (!localMode) refresh();
  }, [localMode, refresh]);

  useEffect(() => {
    if (!localMode) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify(localGarden)); } catch { /* storage may be unavailable */ }
  }, [localMode, storageKey, localGarden]);

  const cloudDone = useMemo(() => new Set(circle?.my_done || []), [circle]);
  const todayCounts = useMemo(() => Object.fromEntries((circle?.today_completions || []).map(x => [x.task_key, Number(x.count) || 0])), [circle]);
  const total = localMode ? localGarden.total : Number(circle?.total_completions || 0);
  const doneToday = localMode ? localGarden.done : [...cloudDone];
  const familyToday = localMode ? localGarden.done.length : Object.values(todayCounts).reduce((sum,n)=>sum+n,0);
  const percent = Math.round(doneToday.length / t.tasks.length * 100);

  const complete = async (id) => {
    if (doneToday.includes(id) || busy) return;
    setBusy(true); setNotice(''); setError('');
    if (localMode) {
      setLocalGarden(current => ({ ...current, done: [...current.done, id], total: current.total + 1 }));
      setBusy(false); return;
    }
    try {
      const { error: rpcError } = await supabase.rpc('complete_family_mission', { p_task_key: id });
      if (rpcError) throw rpcError;
      await refresh();
    } catch (e) { setError(t.error + (e?.message || 'Unable to save mission')); }
    finally { setBusy(false); }
  };

  const createCircle = async (event) => {
    event.preventDefault();
    if (!familyName.trim() || busy) return;
    setBusy(true); setNotice(''); setError('');
    try {
      const { error: rpcError } = await supabase.rpc('create_family_circle', { p_name: familyName.trim() });
      if (rpcError) throw rpcError;
      setFamilyName('');
      await refresh();
    } catch (e) { setError(t.error + (e?.message || 'Unable to create family circle')); }
    finally { setBusy(false); }
  };

  const joinCircle = async (event) => {
    event.preventDefault();
    if (!inviteInput.trim() || busy) return;
    setBusy(true); setNotice(''); setError('');
    try {
      const { error: rpcError } = await supabase.rpc('join_family_circle', { p_invite_code: inviteInput.trim().toUpperCase() });
      if (rpcError) throw rpcError;
      setInviteInput('');
      await refresh();
    } catch (e) { setError(t.error + (e?.message || 'Unable to join family circle')); }
    finally { setBusy(false); }
  };

  const resetLocal = () => {
    if (!window.confirm(t.resetConfirm)) return;
    setLocalGarden({ date: todayKey(), done: [], total: 0 });
    setNotice(t.resetDone);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(circle.invite_code);
      setNotice(t.copied);
    } catch { setError(t.error + 'Clipboard is not available on this device.'); }
  };

  return <section className="thimar-garden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <style>{`
      .thimar-garden{max-width:1100px;margin:10px auto 36px;padding:clamp(14px,3vw,28px);color:#214536}
      .tg-hero{position:relative;overflow:hidden;padding:clamp(22px,4vw,38px);border-radius:26px;background:linear-gradient(125deg,#174c3b,#347653 65%,#8cac64);color:#fff;box-shadow:0 18px 40px #153d241c}
      .tg-hero:after{content:'🌳';position:absolute;font-size:clamp(90px,17vw,170px);opacity:.2;inset-inline-end:5%;bottom:-22px}
      .tg-kicker{font-size:10px;letter-spacing:2px;font-weight:900;color:#e9d99b}.tg-hero h1{font-size:clamp(27px,4vw,40px);margin:8px 0}.tg-hero p{max-width:650px;line-height:1.9;color:#e5f2e7;font-size:14px;margin:0}
      .tg-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:16px 0}.tg-metric{padding:16px;border:1px solid #e3eadf;border-radius:17px;background:#fff}.tg-metric small{display:block;color:#718778;font-size:11px}.tg-metric strong{display:block;color:#246044;font-size:27px;margin-top:4px}.tg-progress{height:9px;border-radius:99px;background:#e8eee3;overflow:hidden;margin-top:10px}.tg-progress i{display:block;height:100%;background:linear-gradient(90deg,#6eaa6a,#e4bf66);border-radius:99px}
      .tg-section-title{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:24px 0 12px}.tg-section-title h2{font-size:19px;margin:0;color:#214c38}.tg-section-title span{font-size:11px;color:#829184}
      .tg-task-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.tg-task{display:flex;gap:12px;align-items:center;padding:15px;border:1px solid #e5ebdf;border-radius:17px;background:#fff;min-width:0}.tg-task.is-done{background:#f2f8ed;border-color:#cfe1c9}.tg-task-icon{display:grid;place-items:center;flex:0 0 42px;width:42px;height:42px;border-radius:13px;background:#edf4e8;font-size:22px}.tg-task-copy{flex:1;min-width:0}.tg-task-copy b{display:block;font-size:13px;color:#2c533d}.tg-task-copy small{display:block;margin-top:4px;color:#849187;font-size:11px;line-height:1.5}.tg-task button{flex:0 0 auto;border:0;border-radius:10px;padding:9px 11px;background:#286347;color:#fff;font-size:11px;font-weight:800}.tg-task button:disabled{background:#e5f0e0;color:#3b714b;cursor:default}
      .tg-plant-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.tg-plant{padding:17px 12px;text-align:center;border:1px solid #e3eadf;border-radius:17px;background:#fff}.tg-plant.locked{opacity:.55;background:#f7f8f5}.tg-plant-icon{font-size:42px;display:block;margin-bottom:8px}.tg-plant b{display:block;color:#2b5a40;font-size:12px}.tg-plant small{display:block;margin-top:5px;color:#829184;font-size:10px;line-height:1.5}
      .tg-verse{display:flex;gap:12px;align-items:center;margin-top:17px;padding:17px;border-radius:16px;background:#f4f7ed;color:#41644b}.tg-verse span{font-size:25px}.tg-verse b{display:block;font-size:14px}.tg-verse small{display:block;margin-top:4px;color:#829184}
      .tg-note{margin-top:13px;padding:12px 14px;border:1px solid #eee8d5;border-radius:13px;background:#fffdf6;color:#7d755e;font-size:11px;line-height:1.7}.tg-message{color:#286347;font-size:12px;margin-top:8px}.tg-error{color:#9d3939;font-size:12px;margin:10px 0;padding:10px;border-radius:10px;background:#fff2f0}
      .tg-family-panel{margin-top:16px;padding:16px;border:1px solid #e3eadf;border-radius:18px;background:#fff}.tg-family-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.tg-family-head h2{margin:0;font-size:18px}.tg-family-head button,.tg-copy{display:inline-flex;align-items:center;gap:6px;border:1px solid #dce8dc;border-radius:10px;background:#fff;color:#286047;padding:9px 11px;font-size:11px;font-weight:800}
      .tg-code{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:13px;padding:13px;border-radius:12px;background:#f4f7ed}.tg-code code{font-size:18px;font-weight:900;letter-spacing:2px;color:#245c43}.tg-family-members{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:9px;margin-top:13px}.tg-person{display:flex;align-items:center;gap:9px;padding:10px;border:1px solid #e8eee5;border-radius:12px}.tg-person img,.tg-person-avatar{width:38px;height:38px;border-radius:50%;object-fit:cover;background:#edf4e8;display:grid;place-items:center}.tg-person b{display:block;font-size:12px}.tg-person small{display:block;color:#839084;font-size:10px;margin-top:3px}
      .tg-entry-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:17px}.tg-entry{padding:17px;border:1px solid #e3eadf;border-radius:17px;background:#fff}.tg-entry h2{font-size:17px;margin:0 0 7px}.tg-entry p{font-size:11px;line-height:1.6;color:#839084;margin:0 0 12px}.tg-entry label{display:block;font-size:11px;color:#506c59;margin:8px 0}.tg-entry input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #dfe8dc;border-radius:10px;background:#fbfdf9;color:#244b38}.tg-entry form button{width:100%;margin-top:8px;border:0;border-radius:10px;background:#286347;color:#fff;padding:11px;font-weight:800}.tg-entry form button:disabled{opacity:.55}
      .tg-reset{margin-top:12px;border:1px solid #e1e8df;border-radius:10px;background:#fff;color:#778579;padding:9px 12px;font-size:11px}
      @media(max-width:680px){.tg-task-grid,.tg-entry-grid{grid-template-columns:1fr}.tg-plant-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.tg-task{padding:12px}.tg-task button{padding:9px}.tg-hero{border-radius:20px}.tg-family-head{align-items:flex-start}}
      @media(prefers-reduced-motion:reduce){.tg-progress i{transition:none}}
    `}</style>
    <header className="tg-hero"><div className="tg-kicker">{t.kicker}</div><h1>🌿 {t.title}</h1><p>{t.subtitle}</p></header>

    {localMode ? <div className="tg-family-panel"><b>{t.local}</b><p className="tg-note">{t.note}</p></div> : loading ? <div className="tg-family-panel" role="status">{t.loading}</div> : circle ? <div className="tg-family-panel">
      <div className="tg-family-head"><h2><Users size={18} style={{verticalAlign:'middle'}} /> {t.family}: {circle.name}</h2><button type="button" onClick={refresh} disabled={loading}><RefreshCw size={13}/>{t.refresh}</button></div>
      {circle.invite_code && <div className="tg-code"><div><small>{t.invite}</small><br/><code>{circle.invite_code}</code></div><button className="tg-copy" type="button" onClick={copyCode}><Copy size={13}/>{t.copy}</button></div>}
      {circle.invite_code && <small>{t.shareHint}</small>}
      <div className="tg-section-title"><h2>{t.members}</h2><span>{(circle.members||[]).length}</span></div>
      <div className="tg-family-members">{(circle.members||[]).map(person=><article className="tg-person" key={person.user_id}>{person.avatar_url?<img src={person.avatar_url} alt=""/>:<span className="tg-person-avatar"><Users size={17}/></span>}<div><b>{person.display_name}</b><small>{person.role==='owner'?t.owner:t.member}</small></div></article>)}</div>
      <p className="tg-note">{t.cloudNote}</p>
    </div> : <div className="tg-entry-grid">
      <article className="tg-entry"><h2>{t.createTitle}</h2><p>{t.createHint}</p><form onSubmit={createCircle}><label>{t.familyName}<input value={familyName} onChange={e=>setFamilyName(e.target.value)} maxLength={50} minLength={2} required /></label><button type="submit" disabled={busy}>{t.create}</button></form></article>
      <article className="tg-entry"><h2>{t.joinTitle}</h2><p>{t.joinHint}</p><form onSubmit={joinCircle}><label>{t.invite}<input value={inviteInput} onChange={e=>setInviteInput(e.target.value.toUpperCase())} maxLength={10} minLength={10} placeholder={t.invitePlaceholder} required /></label><button type="submit" disabled={busy}>{t.join}</button></form></article>
    </div>}

    {error && <p className="tg-error" role="alert">{error}</p>}
    {notice && <p className="tg-message" role="status">{notice}</p>}
    <div className="tg-summary">
      <div className="tg-metric"><small>{t.progress}</small><strong>{doneToday.length}/{t.tasks.length}</strong><div className="tg-progress"><i style={{width:percent+'%'}} /></div></div>
      <div className="tg-metric"><small>{localMode?t.growth:t.familyToday}</small><strong>🌱 {localMode?total:familyToday}</strong></div>
    </div>
    <div className="tg-section-title"><h2><Sun size={18} style={{verticalAlign:'middle'}} /> {t.today}</h2><span>{percent}%</span></div>
    <div className="tg-task-grid">{t.tasks.map(task => {
      const isDone = doneToday.includes(task.id);
      return <article className={'tg-task'+(isDone?' is-done':'')} key={task.id}>
        <span className="tg-task-icon">{task.icon}</span><div className="tg-task-copy"><b>{task.title}</b><small>{task.detail}{!localMode && ' · '+(todayCounts[task.id]||0)}</small></div>
        <button type="button" disabled={isDone||busy||(!localMode&&!circle)} onClick={() => complete(task.id)}>{isDone ? <><CheckCircle2 size={13} /> {t.done}</> : t.mark}</button>
      </article>;
    })}</div>
    <div className="tg-section-title"><h2><Leaf size={18} style={{verticalAlign:'middle'}} /> {t.plants}</h2><span>{t.plantsList.filter(p => total >= p.need).length}/4</span></div>
    <div className="tg-plant-grid">{t.plantsList.map(plant => {
      const unlocked = total >= plant.need;
      return <article className={'tg-plant'+(!unlocked?' locked':'')} key={plant.name}>
        <span className="tg-plant-icon">{unlocked ? plant.icon : '🔒'}</span><b>{plant.name}</b><small>{unlocked ? plant.desc : t.locked+' '+(plant.need-total)+' '+t.more}</small>
      </article>;
    })}</div>
    <div className="tg-verse"><span>🤝</span><div><b>{t.verse}</b><small>{t.reference}</small></div></div>
    <p className="tg-note">{t.note}</p>
    {localMode && <button className="tg-reset" type="button" onClick={resetLocal}><RotateCcw size={13} style={{verticalAlign:'middle'}} /> {t.reset}</button>}
  </section>;
}
