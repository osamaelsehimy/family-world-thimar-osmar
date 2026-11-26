import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowDownRight, ArrowUpLeft, ArrowUpRight, BookOpen, HeartHandshake, House, Leaf, LoaderCircle, Map, ShieldCheck, Sparkles, Sprout, Users } from 'lucide-react';
import { FAMILY_WORLD_CHARACTERS } from './CharacterStudio.jsx';
import '../styles/family-home.css';

const words = {
  ar: {
    eyebrow: 'OSMAR · بيتي العائلي', title: 'بيتكم يكبر بالمحبة والتعاون', intro: 'مساحة خاصة تجمع أفراد دائرتكم وشخصياتهم، وتفتح لكم أبواب التعلم واللعب والعمل النافع.',
    circle: 'دائرة الأسرة', members: 'أفراد الأسرة', roomLabel: 'مساحات البيت', character: 'شخصيتك النشطة', choose: 'اختار شخصيتك', noCharacter: 'اختار شخصية من استوديو الشخصيات لتظهر هنا.',
    private: 'البيت متصل بدائرة أسرتكم الخاصة.', noCircleTitle: 'ابدأوا بيتكم معًا', noCircle: 'أنشئ دائرة الأسرة أو انضم إليها من حديقة الثمار لعرض أفرادها هنا.', openGarden: 'افتح حديقة الثمار', loading: 'جارٍ تجهيز البيت العائلي…', loadError: 'تعذر تحميل بيانات الأسرة حاليًا. حاول التحديث أو افتح حديقة الثمار.', retry: 'إعادة المحاولة',
    gathering: 'مجلس الأسرة', gatheringSub: 'لقاء هادئ، حديث طيب، ووقت يجمعكم.', learning: 'ركن التعلّم', learningSub: 'اكتشفوا المهارات والمشروعات خطوة بخطوة.', garden: 'حديقة الثمار', gardenSub: 'ازرعوا أثر التعاون بأعمال نافعة اختيارية.', planning: 'مرسم البيت 100 م²', planningSub: 'خططوا مساحةً مريحة تناسب احتياجات الأسرة.', open: 'افتح المساحة', values: 'قيم البيت', valuesSub: 'الرحمة · التشاور · حفظ الخصوصية · التعاون', verse: '﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى ﴾', verseRef: 'المائدة · ٢', valuesNote: 'الإنجازات هنا رمزية واختيارية، ولا تُحوّل العبادات إلى نقاط أو مكافآت.', owner: 'صاحب الدائرة', member: 'فرد في الأسرة',
  },
  en: {
    eyebrow: 'OSMAR · MY FAMILY HOME', title: 'A home that grows through care', intro: 'A private place for your family circle and its characters, with paths to learning, play, and helpful projects.',
    circle: 'Family circle', members: 'Family members', roomLabel: 'Explore your home', character: 'Your active character', choose: 'Choose a character', noCharacter: 'Choose a character in the Character Studio to see it here.',
    private: 'Connected to your private family circle.', noCircleTitle: 'Start your home together', noCircle: 'Create or join your family circle in Thimar Garden to see your family here.', openGarden: 'Open Thimar Garden', loading: 'Preparing your family home…', loadError: 'Family details could not load. Try again or open Thimar Garden.', retry: 'Try again',
    gathering: 'Family lounge', gatheringSub: 'A calm place for kind words and time together.', learning: 'Learning nook', learningSub: 'Explore skills and projects one step at a time.', garden: 'Thimar Garden', gardenSub: 'Grow cooperation through optional helpful activities.', planning: '100 m² Home Studio', planningSub: 'Plan a comfortable space around your family’s needs.', open: 'Explore space', values: 'A home guided by values', valuesSub: 'Mercy · consultation · privacy · cooperation', verse: '“Help one another in goodness and mindfulness.”', verseRef: 'Qur’an 5:2', valuesNote: 'Achievements are optional and symbolic. Worship is never turned into points or rewards.', owner: 'Circle owner', member: 'Family member',
  },
  zh: {
    eyebrow: 'OSMAR · 我的家庭之家', title: '以关爱与协作，让家不断成长', intro: '一个连接家庭圈与角色的私密空间，并为学习、游戏和有益项目开启新的旅程。',
    circle: '家庭圈', members: '家庭成员', roomLabel: '探索家庭空间', character: '当前角色', choose: '选择角色', noCharacter: '请在角色工作室选择一个角色，它将显示在这里。',
    private: '已连接到你的私人家庭圈。', noCircleTitle: '一起开启家庭之家', noCircle: '请在 Thimar 花园创建或加入家庭圈，以显示家庭成员。', openGarden: '打开 Thimar 花园', loading: '正在准备家庭之家…', loadError: '暂时无法加载家庭信息。请重试或打开 Thimar 花园。', retry: '重试',
    gathering: '家庭客厅', gatheringSub: '共享温馨时光与善意交流的空间。', learning: '学习角', learningSub: '循序探索技能与家庭项目。', garden: 'Thimar 花园', gardenSub: '通过自愿的有益活动，培育协作成果。', planning: '100 平方米家居工作室', planningSub: '根据家庭需求规划舒适的生活空间。', open: '探索空间', values: '以价值观守护家庭', valuesSub: '仁爱 · 协商 · 隐私 · 协作', verse: '“你们当以善行和敬畏互相帮助。”', verseRef: '古兰经 5:2', valuesNote: '成就为自愿参与的象征性进度。崇拜不会被转化为积分或奖励。', owner: '家庭圈创建者', member: '家庭成员',
  },
};

function localCharacter() {
  try { return window.localStorage.getItem('family-world-active-character-v1') || ''; } catch { return ''; }
}

export default function MyFamilyHome({ lang = 'ar', userId, supabase, onNavigate }) {
  const t = words[lang] || words.ar;
  const rtl = lang === 'ar';
  const Forward = rtl ? ArrowDownLeft : ArrowDownRight;
  const Back = rtl ? ArrowUpLeft : ArrowUpRight;
  const [circle, setCircle] = useState(null);
  const [activeCharacter, setActiveCharacter] = useState(localCharacter);
  const [loading, setLoading] = useState(Boolean(supabase && userId !== 'demo'));
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let alive = true;
    if (!supabase || !userId || userId === 'demo') {
      setCircle(null);
      setActiveCharacter(localCharacter());
      setLoading(false);
      return () => { alive = false; };
    }
    setLoading(true);
    setError(false);
    Promise.all([
      supabase.rpc('family_circle_dashboard'),
      supabase.from('profiles').select('active_character_id').eq('id', userId).maybeSingle(),
    ]).then(([familyResult, profileResult]) => {
      if (!alive) return;
      if (familyResult.error || profileResult.error) setError(true);
      else {
        setCircle(familyResult.data?.circle || null);
        setActiveCharacter(profileResult.data?.active_character_id || '');
      }
    }).catch(() => { if (alive) setError(true); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [supabase, userId, retry]);

  const character = useMemo(() => FAMILY_WORLD_CHARACTERS.find(item => item.id === activeCharacter), [activeCharacter]);
  const characterName = character?.name?.[lang] || character?.name?.en || t.choose;
  const characterImage = character?.image
    ? `${import.meta.env.BASE_URL}${character.image.endsWith('.svg') ? 'assets/characters/' : 'assets/ideas/'}${character.image}`
    : '';
  const rooms = [
    { id: 'family', icon: HeartHandshake, title: t.gathering, description: t.gatheringSub, color: 'peach', route: 'garden' },
    { id: 'learning', icon: BookOpen, title: t.learning, description: t.learningSub, color: 'blue', route: 'threex' },
    { id: 'garden', icon: Sprout, title: t.garden, description: t.gardenSub, color: 'green', route: 'garden' },
    { id: 'planning', icon: House, title: t.planning, description: t.planningSub, color: 'gold', route: 'threex' },
  ];

  return <section className="family-home" dir={rtl ? 'rtl' : 'ltr'}>
    <header className="fh-hero">
      <div className="fh-hero-glow" aria-hidden="true" />
      <div className="fh-hero-copy">
        <span className="fh-eyebrow"><Sparkles size={14} />{t.eyebrow}</span>
        <h1>{t.title}</h1><p>{t.intro}</p>
        <div className="fh-home-status"><ShieldCheck size={16} />{t.private}</div>
      </div>
      <div className="fh-house-art" aria-hidden="true"><div className="fh-moon"/><div className="fh-window window-one"/><div className="fh-window window-two"/><div className="fh-door"/><House size={150} strokeWidth={0.85}/><span className="fh-plant plant-one">🌿</span><span className="fh-plant plant-two">🌱</span></div>
      <div className="fh-hero-orbit" aria-hidden="true">OSMAR <i/> FAMILY HOME</div>
    </header>

    {activeCharacter && <article className="fh-character">
      <div className="fh-character-art">{characterImage ? <img src={characterImage} alt="" /> : <span>✨</span>}</div>
      <div className="fh-character-copy"><span>{t.character}</span><strong>{characterName}</strong><small>{circle?.members?.find(member => member.user_id === userId)?.display_name || ''}</small></div>
      <button onClick={() => onNavigate('characters')}>{t.choose}<Back size={16}/></button>
    </article>}
    {!activeCharacter && <button className="fh-character fh-character-empty" onClick={() => onNavigate('characters')}><span className="fh-character-art"><Users size={34}/></span><span className="fh-character-copy"><span>{t.character}</span><strong>{t.noCharacter}</strong></span><Back size={17}/></button>}

    <section className="fh-circle">
      <div className="fh-section-heading"><span className="fh-section-mark"><Users size={18}/></span><div><small>01 · FAMILY CIRCLE</small><h2>{t.circle}</h2></div>
        {!loading && circle && <span className="fh-member-count">{circle.members?.length || 0} <small>{t.members}</small></span>}
      </div>
      {loading ? <div className="fh-state"><LoaderCircle className="fh-spin" size={18}/>{t.loading}</div>
        : error ? <div className="fh-state fh-state-error"><span>{t.loadError}</span><button onClick={() => setRetry(value => value + 1)}>{t.retry}</button></div>
        : circle ? <div className="fh-family-card"><div className="fh-family-heading"><div className="fh-family-emblem"><House size={19}/></div><div><strong>{circle.name}</strong><small>{t.private}</small></div><span className="fh-connected"><i/>CONNECTED</span></div>
          <div className="fh-members">{(circle.members || []).map((member, index) => <article className="fh-member" key={member.user_id} style={{ '--member-index': index }}>
            <span className="fh-member-avatar">{member.avatar_url ? <img src={member.avatar_url} alt="" loading="lazy"/> : <Users size={18}/>}</span>
            <span className="fh-member-info"><strong>{member.display_name}</strong><small>{member.role === 'owner' ? t.owner : t.member}</small></span>
            {member.user_id === userId && <i className="fh-you-dot" title={t.character}/>}
          </article>)}</div>
        </div>
        : <div className="fh-empty-circle"><span>🏡</span><div><strong>{t.noCircleTitle}</strong><p>{t.noCircle}</p></div><button onClick={() => onNavigate('garden')}>{t.openGarden}<Forward size={16}/></button></div>}
    </section>

    <section className="fh-rooms"><div className="fh-section-heading"><span className="fh-section-mark"><Map size={18}/></span><div><small>02 · YOUR FAMILY WORLD</small><h2>{t.roomLabel}</h2></div></div>
      <div className="fh-room-grid">{rooms.map((room, index) => { const Icon = room.icon; return <button type="button" key={room.id} className={`fh-room fh-room-${room.color}`} onClick={() => onNavigate(room.route)} style={{ '--room-index': index }}>
        <span className="fh-room-icon"><Icon size={21}/></span><span className="fh-room-copy"><strong>{room.title}</strong><small>{room.description}</small></span><Back className="fh-room-arrow" size={16}/>
      </button>; })}</div>
    </section>

    <section className="fh-values"><div className="fh-values-emblem">بِسْمِ اللهِ</div><div className="fh-values-copy"><span>{t.values}</span><strong>{t.valuesSub}</strong><small>{t.verse}</small><small>{t.verseRef} · {t.valuesNote}</small></div><Leaf className="fh-values-leaf" size={42}/></section>
  </section>;
}
