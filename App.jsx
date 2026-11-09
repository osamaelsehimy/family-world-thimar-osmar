import { useEffect, useMemo, useState } from 'react';
import { supabase, configured } from './src/lib/supabase';
import { Home, Globe2, Gamepad2, Users, LogOut, Sprout, Star, ShieldCheck, Menu, X, ChevronLeft } from 'lucide-react';

const worlds = [
  { id: 'home', icon: '🏡', ar: 'البيت والمعيشة', en: 'Home & Daily Life', zh: '家庭与日常', desc: 'نشارك المسؤولية ونعتني ببيتنا.', enDesc: 'Share responsibilities and care for home.', zhDesc: '分担责任，一起照顾家。' },
  { id: 'family', icon: '💚', ar: 'الأسرة والعلاقات', en: 'Family & Relationships', zh: '家庭与关系', desc: 'كلمة طيبة ووقت جميل يجمعنا.', enDesc: 'Kind words and good time bring us closer.', zhDesc: '善意的话语与陪伴让我们更亲近。' },
  { id: 'learning', icon: '📚', ar: 'التعليم والمهارات', en: 'Learning & Skills', zh: '学习与技能', desc: 'نتعلم شيئًا جديدًا خطوة بخطوة.', enDesc: 'Learn something new, one step at a time.', zhDesc: '一步一步学习新知识。' },
  { id: 'nature', icon: '🌿', ar: 'الطبيعة والاستدامة', en: 'Nature & Sustainability', zh: '自然与可持续', desc: 'نحافظ على النعمة والبيئة.', enDesc: 'Care for the gifts around us.', zhDesc: '珍惜恩典，爱护环境。' },
  { id: 'work', icon: '💼', ar: 'الأعمال والتجارة', en: 'Work & Enterprise', zh: '工作与事业', desc: 'نتعاون ونخطط ونتقن العمل.', enDesc: 'Plan together and do good work.', zhDesc: '一起计划，认真做好每件事。' },
  { id: 'health', icon: '⚽', ar: 'الصحة والرياضة', en: 'Health & Movement', zh: '健康与运动', desc: 'حركة وراحة وعادات صحية.', enDesc: 'Build healthy habits with movement and rest.', zhDesc: '通过运动与休息养成健康习惯。' },
  { id: 'community', icon: '🤲', ar: 'المجتمع والعمل النافع', en: 'Community & Service', zh: '社区与公益', desc: 'نساعد وننشر الخير من حولنا.', enDesc: 'Help others and spread good nearby.', zhDesc: '帮助他人，把善意带给身边的人。' },
];
const games = [
  { id: 'treasure', icon: '🗝️', ar: 'صيد الكنز العائلي', en: 'Family Treasure Hunt', zh: '家庭寻宝', desc: 'اخفوا غرضًا آمنًا واكتبوا ثلاث تلميحات.', enDesc: 'Hide a safe object and write three clues.', zhDesc: '藏好安全的小物件，写下三个提示。', points: 15 },
  { id: 'guess', icon: '🤔', ar: 'مين أنا؟', en: 'Who Am I?', zh: '我是谁？', desc: 'خمنوا شخصية أو حيوانًا بأسئلة نعم أو لا.', enDesc: 'Guess a person or animal with yes-or-no questions.', zhDesc: '用是非题猜人物或动物。', points: 10 },
  { id: 'story', icon: '📖', ar: 'حكاية على الدور', en: 'A Story in Turns', zh: '接龙故事', desc: 'كل واحد يضيف جملة ونبني حكاية معًا.', enDesc: 'Each person adds a line to a shared story.', zhDesc: '每个人接着讲一句，共同编故事。', points: 10 },
];
const copy = {
  ar: { dir: 'rtl', tagline: 'عالمنا.. لمتنا.. ثمارنا', welcome: 'أهلاً بيكم في عالم الأسرة!', intro: 'مساحة عائلية آمنة تجمعنا على التعلم واللعب والعمل النافع.', login: 'دخول', signup: 'حساب جديد', email: 'البريد الإلكتروني', password: 'كلمة المرور', guardian: 'أقرّ أنني ولي أمر بالغ وسأشرف على استخدام الأطفال.', tryDemo: 'ادخل جرّب اللعبة', demoInfo: 'العب كضيف فورًا. التقدم تجريبي ولا يُحفظ.', demoLabel: 'عرض تجريبي', demoFamily: 'بدون حساب أو حفظ بيانات', submitLogin: 'تسجيل الدخول', submitSignup: 'إنشاء الحساب والبدء', checkEmail: 'راجع بريدك لتأكيد الحساب، ثم سجّل الدخول.', logout: 'تسجيل الخروج', home: 'الرئيسية', worlds: 'العوالم السبعة', play: 'الألعاب', characters: 'الشخصيات', points: 'نقاط تجريبية', explore: 'استكشف عالمًا', playNow: 'ابدأ اللعب', name: 'Family World – Thimar OSMAR', privacy: 'لا تدخل أسماء الأطفال أو بياناتهم الشخصية. هذه النسخة لا تعرض بيانات الأسرة للآخرين.', noBackend: 'التسجيل بالبريد غير مفعّل بعد.', charactersIntro: 'دليل أسامة، تميمة ثيمي، ومحللة البيانات شخصيات إرشادية للرحلة.', char1: 'أسامة · قائد الرحلة', char2: 'ثيمي · تميمة البهجة', char3: 'محللة البيانات · دليل التعلم', completed: 'أحسنت! أضيفت نقاط تجريبية لهذه الجلسة.', install: 'تثبيت التطبيق' },
  en: { dir: 'ltr', tagline: 'Our world. Our family. Our growth.', welcome: 'Welcome to Family World!', intro: 'A safe family space to learn, play, and do good together.', login: 'Log in', signup: 'Create account', email: 'Email', password: 'Password', guardian: 'I am an adult parent or guardian and will supervise children.', tryDemo: 'Play the demo', demoInfo: 'Play as a guest right away. Demo progress is not saved.', demoLabel: 'Demo preview', demoFamily: 'No account or saved data', submitLogin: 'Log in', submitSignup: 'Create account and start', checkEmail: 'Check your email to confirm your account, then log in.', logout: 'Log out', home: 'Home', worlds: 'Seven worlds', play: 'Games', characters: 'Characters', points: 'Demo points', explore: 'Explore a world', playNow: 'Start playing', name: 'Family World – Thimar OSMAR', privacy: 'Do not enter children’s names or personal details. This version does not share family data with others.', noBackend: 'Email registration is not active yet.', charactersIntro: 'Osama guides the journey, Thimmy brings cheer, and the Analyst supports learning.', char1: 'Osama · Journey guide', char2: 'Thimmy · Cheerful mascot', char3: 'Data Analyst · Learning guide', completed: 'Nice work! Demo points were added for this session.', install: 'Install app' },
  zh: { dir: 'ltr', tagline: '我们的世界，我们的家庭，共同成长。', welcome: '欢迎来到 Family World！', intro: '一个安全的家庭空间，一起学习、游戏、行善。', login: '登录', signup: '创建账户', email: '电子邮箱', password: '密码', guardian: '我是成年家长或监护人，并会监督儿童使用。', tryDemo: '体验游戏', demoInfo: '无需注册即可试玩。体验进度不会保存。', demoLabel: '体验预览', demoFamily: '无需账户，不保存数据', submitLogin: '登录', submitSignup: '创建账户并开始', checkEmail: '请先查看邮箱并确认账户，然后登录。', logout: '退出登录', home: '首页', worlds: '七大世界', play: '游戏', characters: '角色', points: '体验积分', explore: '探索世界', playNow: '开始游戏', name: 'Family World – Thimar OSMAR', privacy: '请勿输入儿童姓名或个人资料。本版本不会向他人公开家庭数据。', noBackend: '邮箱注册尚未启用。', charactersIntro: 'Osama 指引旅程，Thimmy 带来欢乐，数据分析师陪伴学习。', char1: 'Osama · 旅程向导', char2: 'Thimmy · 快乐吉祥物', char3: '数据分析师 · 学习向导', completed: '做得好！本次体验已增加演示积分。', install: '安装应用' },
};

function translated(item, key, lang) {
  if (!key) return item[lang] || item.ar;
  if (key === 'Desc') return lang === 'en' ? item.enDesc : lang === 'zh' ? item.zhDesc : item.desc;
  return item[lang + key] || item[key];
}
export default function App() {
  const [lang, setLang] = useState('ar');
  const t = copy[lang];
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guardian, setGuardian] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('home');
  const [points, setPoints] = useState(0);
  const [done, setDone] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeWorld, setActiveWorld] = useState(null);
  const [authReady, setAuthReady] = useState(!configured);
  const [installPrompt, setInstallPrompt] = useState(null);
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    document.documentElement.dir = t.dir;
  }, [lang, t.dir]);
  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, value) => setSession(value));
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const onInstall = (event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener('beforeinstallprompt', onInstall);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
    return () => window.removeEventListener('beforeinstallprompt', onInstall);
  }, []);
  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }
  async function auth(event) {
    event.preventDefault(); setBusy(true); setNotice('');
    try {
      if (!configured) { setNotice(t.noBackend); return; }
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { guardian_attested: true }, emailRedirectTo: window.location.href } });
        if (error) throw error;
        if (!data.session) setNotice(t.checkEmail);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (error) { setNotice(error.message || 'Please try again.'); }
    finally { setBusy(false); }
  }
  async function logout() { await supabase?.auth.signOut(); setSession(null); setPoints(0); setDone([]); }
  function completeGame(game) { setPoints(value => value + game.points); setDone(value => [...value, game.id]); setNotice(t.completed); }
  const nav = useMemo(() => [['home', t.home, Home], ['worlds', t.worlds, Globe2], ['play', t.play, Gamepad2], ['characters', t.characters, Users]], [t]);
  if (!authReady) return <div className="auth-page"><header className="auth-head"><Brand /><Language lang={lang} setLang={setLang} /></header><p className="auth-card" role="status">…</p></div>;
  if (!session) return <div className="auth-page"><header className="auth-head"><Brand /><div className="auth-actions">{installPrompt && <button className="install-button" onClick={installApp}>{t.install}</button>}<Language lang={lang} setLang={setLang} /></div></header><form className="auth-card" onSubmit={auth}>
    <span className="mark">🌱</span><p className="eyebrow">THIMAR OSMAR PRESENTS</p><h1>{t.welcome}</h1><p>{t.intro}</p>
    <div className="auth-tabs"><button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => setMode('login')}>{t.login}</button><button type="button" className={mode === 'signup' ? 'selected' : ''} onClick={() => setMode('signup')}>{t.signup}</button></div>
    <label>{t.email}<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label>{t.password}<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="8" required value={password} onChange={e => setPassword(e.target.value)} /></label>
    {mode === 'signup' && <label className="guardian-check"><input type="checkbox" required checked={guardian} onChange={e => setGuardian(e.target.checked)} />{t.guardian}</label>}
    <button className="primary wide" disabled={busy}>{busy ? '…' : mode === 'login' ? t.submitLogin : t.submitSignup}</button>
    <button className="demo-button" type="button" onClick={() => setSession({ user: { id: 'demo' } })}>{t.tryDemo}</button><p className="demo-info">{t.demoInfo}</p>{!configured && <p className="notice">{t.noBackend}</p>}{notice && <p className="notice" role="status">{notice}</p>}
    <p className="privacy"><ShieldCheck size={16} />{t.privacy}</p>
  </form><footer>{t.name} © 2026</footer></div>;
  return <div className={`layout ${t.dir}`}><aside className={`sidebar ${mobileOpen ? 'show' : ''}`}><div className="brand-row"><Brand /><button className="icon-btn close-btn" onClick={() => setMobileOpen(false)} aria-label="Close"><X /></button></div><div className="family-badge">🌿 <span><b>{session.user.id === 'demo' ? t.demoLabel : lang === 'en' ? 'Your family space' : lang === 'zh' ? '你的家庭空间' : 'مساحة أسرتكم'}</b><small>{session.user.id === 'demo' ? t.demoFamily : lang === 'en' ? 'Private to your account' : lang === 'zh' ? '仅你的账户可见' : 'خاصة بحسابك'}</small></span></div><nav>{nav.map(([id, label, Icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setActiveWorld(null); setMobileOpen(false); }}><Icon size={19} />{label}<ChevronLeft size={16} /></button>)}</nav><div className="sidebar-bottom"><p>﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى ﴾<small>المائدة: ٢</small></p><button className="logout" onClick={logout}><LogOut size={16} />{t.logout}</button></div></aside>
    {mobileOpen && <button className="scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
    <main><header className="topbar"><button className="icon-btn menu-btn" onClick={() => setMobileOpen(true)} aria-label="Menu"><Menu /></button><div className="page-title"><small>{t.tagline}</small><h2>{nav.find(item => item[0] === tab)?.[1]}</h2></div><span className="points"><Star size={16} />{points} {t.points}</span>{installPrompt && <button className="install-button" onClick={installApp}>{t.install}</button>}<Language lang={lang} setLang={setLang} /></header>
      {notice && <button className="notice" onClick={() => setNotice('')} role="status">{notice}　×</button>}
    {tab === 'home' && <>{session.user.id === 'demo' && <p className="notice">{t.demoInfo}</p>}<section className="hero"><div><span className="hero-tag">✨ {t.tagline}</span><h1>{t.welcome}</h1><p>{t.intro}</p><button className="light" onClick={() => setTab('worlds')}>{t.explore} <ChevronLeft size={16} /></button></div><div className="hero-art" aria-hidden="true"><span>☀️</span><b>🏡</b><span>🌳</span><i>👨‍👩‍👧‍👦</i></div></section><section className="section"><small>SEVEN WORLDS</small><h2>{t.worlds}</h2></section><WorldGrid lang={lang} worlds={worlds.slice(0, 3)} onSelect={id => { setTab('worlds'); setActiveWorld(id); }} /><section className="section"><small>PLAY & LEARN</small><h2>{t.play}</h2></section><GameGrid lang={lang} items={games.slice(0, 2)} done={done} onPlay={completeGame} /><p className="notice">{t.privacy}</p></>}
      {tab === 'worlds' && <>{activeWorld ? <><button className="back" onClick={() => setActiveWorld(null)}>‹ {t.worlds}</button><WorldDetail lang={lang} world={worlds.find(w => w.id === activeWorld)} onPlay={() => setTab('play')} /></> : <><section className="section"><small>OUR FAMILY JOURNEY</small><h2>{t.worlds}</h2></section><WorldGrid lang={lang} worlds={worlds} onSelect={setActiveWorld} /></>}</>}
      {tab === 'play' && <><section className="section"><small>FAMILY FUN</small><h2>{t.play}</h2></section><p className="muted">{t.privacy}</p><GameGrid lang={lang} items={games} done={done} onPlay={completeGame} /></>}
      {tab === 'characters' && <><section className="section"><small>OUR GUIDES</small><h2>{t.characters}</h2><p className="muted">{t.charactersIntro}</p></section><div className="characters"><Character emoji="🧑🏻‍💼" title={t.char1} color="mint" /><Character emoji="🐥" title={t.char2} color="gold" /><Character emoji="👩🏻‍💻" title={t.char3} color="rose" /></div><p className="notice">Character concepts follow the project reference. Portrait artwork is not embedded because third-party image rights could not be confirmed.</p></>}
      <footer>{t.name} © 2026</footer></main></div>;
}

function Brand() { return <div className="brand"><span className="brand-mark"><Sprout size={22} /></span><span><b>Family World</b><small>THIMAR OSMAR</small></span></div>; }
function Language({ lang, setLang }) { return <select className="language" value={lang} onChange={event => setLang(event.target.value)} aria-label="Language"><option value="ar">العربية</option><option value="en">English</option><option value="zh">简体中文</option></select>; }
function WorldGrid({ lang, worlds: list, onSelect }) { return <div className="world-grid">{list.map(world => <button className="world-card" key={world.id} onClick={() => onSelect(world.id)}><span>{world.icon}</span><h3>{translated(world, '', lang)}</h3><p>{translated(world, 'Desc', lang)}</p><b>{copy[lang].explore} <ChevronLeft size={14} /></b></button>)}</div>; }
function GameGrid({ lang, items, done, onPlay }) { return <div className="game-grid">{items.map(game => <article className="game-card" key={game.id}><span className="game-icon">{game.icon}</span><span className="score">+{game.points} ⭐</span><h3>{translated(game, '', lang)}</h3><p>{translated(game, 'Desc', lang)}</p><button onClick={() => onPlay(game)}>{done.includes(game.id) ? copy[lang].completed : copy[lang].playNow}</button></article>)}</div>; }
function Character({ emoji, title, color }) { return <article className={`character ${color}`}><span>{emoji}</span><h3>{title}</h3><small>Family World · Thimar OSMAR</small></article>; }
function WorldDetail({ lang, world, onPlay }) { return <section className="world-detail"><span>{world.icon}</span><h1>{translated(world, '', lang)}</h1><p>{translated(world, 'Desc', lang)}</p><button className="primary" onClick={onPlay}>{copy[lang].playNow}</button></section>; }
