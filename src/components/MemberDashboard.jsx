import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Trophy, Gamepad2, Target, Clock3, ShieldCheck, RefreshCw } from 'lucide-react';

const words = {
 ar: {
  title:'لوحة إنجازاتي',subtitle:'ملخص لعبك وتقدمك في Family World',
  played:'إجمالي المباريات',wins:'مرات الفوز',losses:'مرات الخسارة',draws:'تعادلات',xp:'نقاط FWP',
  games:'أدائي حسب اللعبة',recent:'آخر المباريات',empty:'لسه مفيش مباريات مسجلة. ابدأ لعبة الدومينو أو 1024 وهتظهر نتائجك هنا.',
  domino:'الدومينو',number:'1024',win:'فوز',loss:'خسارة',draw:'تعادل',score:'النتيجة',duration:'المدة',date:'التاريخ',
  refresh:'تحديث',loading:'بنحمّل إحصائياتك…',error:'تعذر تحميل الإحصائيات',demo:'أنت في وضع التجربة. سجلات اللعب لا تُحفظ في الحساب التجريبي.',
  pmo:'من اللعب إلى مؤشرات الأداء',pmoIntro:'نستخدم دورة الإدارة لقياس النشاط وتحسين التجربة، وليس لتقييم قيمة الشخص.',
  plan:'خطّط',planText:'اختار تحديًا أو هدفًا واضحًا قبل اللعب.',
  execute:'نفّذ',executeText:'عدد الجولات المكتملة يوضح مستوى المشاركة.',
  measure:'قِس',measureText:'الفوز والخسارة والتعادل والنتيجة مؤشرات أداء للعبة.',
  improve:'حسّن',improveText:'راجع تقدمك واختر مهارة أو تحديًا جديدًا.',
  osmarLink:'كيف ترتبط المؤشرات بأهداف المنظومة؟',osmarFamily:'Family World: المشاركة، إكمال الأنشطة، والاحتفاظ بالمستخدمين.',osmarThimar:'Thimar: إكمال الدروس والمهام التطبيقية بعد التعلم.',osmarBusiness:'OSMAR: حالة المشروعات، الالتزام بالمواعيد، تقدم المراحل، التكلفة، الجودة والمخاطر — داخل مساحة العمل وبصلاحياتها فقط.',integrity:'شفافية البيانات',integrityText:'نتائج هذه النسخة المحلية مسجلة كتقارير ذاتية من اللاعب؛ ليست نتائج أونلاين موثقة ولا تُستخدم في تقييم وظيفي أو مالي.',
  winRate:'معدل الفوز',noHistory:'لا يوجد سجل حديث بعد',pointsNote:'XP نقاط تقدم رمزية وليست أموالًا أو أداة استثمار.'
 },
 en: {
  title:'My Performance',subtitle:'Your Family World game and progress summary',
  played:'Games played',wins:'Wins',losses:'Losses',draws:'Draws',xp:'FWP points',
  games:'Performance by game',recent:'Recent games',empty:'No games recorded yet. Play Dominoes or 1024 and your results will appear here.',
  domino:'Dominoes',number:'1024',win:'Won',loss:'Lost',draw:'Draw',score:'Score',duration:'Duration',date:'Date',
  refresh:'Refresh',loading:'Loading your stats…',error:'Could not load statistics',demo:'You are in demo mode. Game records are not saved to a demo account.',
  pmo:'From play to performance indicators',pmoIntro:'We use the management cycle to measure activity and improve the experience—not to rate a person’s worth.',
  plan:'Plan',planText:'Choose a clear challenge or goal before you play.',
  execute:'Execute',executeText:'Completed rounds show participation.',
  measure:'Measure',measureText:'Wins, losses, draws, and scores measure game performance.',
  improve:'Improve',improveText:'Review progress and choose a new skill or challenge.',
  osmarLink:'How do these indicators connect to ecosystem objectives?',osmarFamily:'Family World: participation, activity completion, and user retention.',osmarThimar:'Thimar: lesson completion and applied tasks after learning.',osmarBusiness:'OSMAR: project health, schedule adherence, milestone progress, cost, quality, and risks—inside its own workspace and permissions.',integrity:'Data transparency',integrityText:'Local game results are self-reported by the player. They are not verified online results and are not used for employment or financial evaluation.',
  winRate:'Win rate',noHistory:'No recent game history yet',pointsNote:'XP are symbolic progress points, not money or an investment instrument.'
 },
 zh: {
  title:'我的表现',subtitle:'Family World 游戏与成长概览',
  played:'已玩场次',wins:'胜利',losses:'失败',draws:'平局',xp:'FWP 积分',
  games:'各游戏表现',recent:'最近游戏',empty:'还没有游戏记录。开始玩多米诺或 1024，结果就会显示在这里。',
  domino:'多米诺',number:'1024',win:'胜利',loss:'失败',draw:'平局',score:'分数',duration:'时长',date:'日期',
  refresh:'刷新',loading:'正在加载统计…',error:'无法加载统计数据',demo:'当前为体验模式。体验账户不会保存游戏记录。',
  pmo:'从游戏到绩效指标',pmoIntro:'我们用管理循环衡量活动并改进体验，而不是评价个人价值。',
  plan:'计划',planText:'开始前选择明确的挑战或目标。',
  execute:'执行',executeText:'已完成的回合反映参与情况。',
  measure:'衡量',measureText:'胜负、平局和分数用于衡量游戏表现。',
  improve:'改进',improveText:'回顾进步并选择新的技能或挑战。',
  osmarLink:'这些指标如何关联生态系统目标？',osmarFamily:'Family World：参与度、活动完成率和用户留存。',osmarThimar:'Thimar：课程完成率和学习后的实践任务。',osmarBusiness:'OSMAR：项目健康度、进度遵循、里程碑、成本、质量与风险——仅在其独立工作区和权限内。',integrity:'数据透明',integrityText:'本地游戏结果由玩家自行申报，并非经过验证的在线结果，不用于雇佣或财务评价。',
  winRate:'胜率',noHistory:'暂无最近游戏记录',pointsNote:'XP 是象征性的成长积分，不是货币或投资工具。'
 }
};

const gameName=(id,t)=>id==='domino'?t.domino:id==='1024'?t.number:id;
const formatDuration=(seconds,lang)=>seconds<60?seconds+'s':Math.floor(seconds/60)+(lang==='ar'?' د':'m')+' '+(seconds%60)+'s';

export default function MemberDashboard({supabase,userId,lang='ar'}){
 const t=words[lang]||words.ar;
 const [stats,setStats]=useState([]);
 const [recent,setRecent]=useState([]);
 const [points,setPoints]=useState(0);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const demo=userId==='demo';

 async function load(){
  if(demo||!supabase){setStats([]);setRecent([]);setPoints(0);setLoading(false);return;}
  setLoading(true);setError('');
  const [statsResult,recentResult,pointsResult]=await Promise.all([
   supabase.from('member_game_stats').select('game_id,games_played,wins,losses,draws,total_score,average_duration_seconds,last_played_at').eq('user_id',userId),
   supabase.from('game_sessions').select('game_id,outcome,score,duration_seconds,created_at').eq('user_id',userId).order('created_at',{ascending:false}).limit(8),
   supabase.from('member_points_summary').select('total_points').eq('user_id',userId).maybeSingle()
  ]);
  if(statsResult.error||recentResult.error||pointsResult.error){setError(statsResult.error?.message||recentResult.error?.message||pointsResult.error?.message||t.error);}
  setStats(statsResult.data||[]);setRecent(recentResult.data||[]);setPoints(pointsResult.data?.total_points||0);setLoading(false);
 }
 useEffect(()=>{load();},[userId,supabase]);
 const totals=useMemo(()=>stats.reduce((a,s)=>({played:a.played+Number(s.games_played||0),wins:a.wins+Number(s.wins||0),losses:a.losses+Number(s.losses||0),draws:a.draws+Number(s.draws||0)}),{played:0,wins:0,losses:0,draws:0}),[stats]);
 const rate=totals.played?Math.round(totals.wins/totals.played*100):0;
 return <section className="member-dashboard" dir={lang==='ar'?'rtl':'ltr'}>
  <header className="member-dashboard-head"><div><span className="dashboard-kicker">FAMILY WORLD · THIMAR OSMAR · PMO SCORECARD</span><h1><BarChart3 size={25}/>{t.title}</h1><p>{t.subtitle}</p></div><button className="dashboard-refresh" onClick={load} disabled={loading}><RefreshCw size={15}/>{t.refresh}</button></header>
  {demo&&<p className="dashboard-note">{t.demo}</p>}
  {error&&<p className="notice" role="status">{t.error}: {error}</p>}
  {loading?<div className="dashboard-loading">{t.loading}</div>:<>
   <div className="member-kpi-grid">
    <article><span>🎮</span><small>{t.played}</small><strong>{totals.played}</strong></article>
    <article><span>🏆</span><small>{t.wins}</small><strong>{totals.wins}</strong></article>
    <article><span>↘️</span><small>{t.losses}</small><strong>{totals.losses}</strong></article>
    <article><span>🤝</span><small>{t.draws}</small><strong>{totals.draws}</strong></article>
    <article><span>⭐</span><small>{t.xp}</small><strong>{Number(points).toLocaleString(lang==='ar'?'ar-EG':lang==='zh'?'zh-CN':'en-US')}</strong></article>
   </div>
   <div className="dashboard-performance-grid">
    <section className="dashboard-panel"><div className="dashboard-panel-head"><h2><Gamepad2 size={18}/>{t.games}</h2><span>{t.winRate}: {rate}%</span></div>
     {stats.length?stats.map(s=><div className="game-stat-row" key={s.game_id}><div><b>{gameName(s.game_id,t)}</b><small>{s.games_played} {t.played}</small></div><div className="game-stat-numbers"><span className="won">{s.wins} {t.win}</span><span className="lost">{s.losses} {t.loss}</span><span>{s.draws} {t.draw}</span></div><div className="game-stat-track"><i style={{width:(s.games_played?Math.round(s.wins/s.games_played*100):0)+'%'}}/></div></div>):<p className="dashboard-empty">{t.empty}</p>}
    </section>
    <section className="dashboard-panel"><div className="dashboard-panel-head"><h2><Clock3 size={18}/>{t.recent}</h2></div>
     {recent.length?recent.map((g,i)=><div className="recent-game-row" key={g.created_at+'-'+i}><div><b>{gameName(g.game_id,t)}</b><small>{new Date(g.created_at).toLocaleString(lang==='ar'?'ar-EG':lang==='zh'?'zh-CN':'en-US')}</small></div><strong className={g.outcome==='won'?'won':g.outcome==='lost'?'lost':'drawn'}>{g.outcome==='won'?t.win:g.outcome==='lost'?t.loss:t.draw}</strong><small>{t.score}: {g.score} · {formatDuration(g.duration_seconds||0,lang)}</small></div>):<p className="dashboard-empty">{t.noHistory}</p>}
    </section>
   </div>
   <section className="dashboard-panel pmo-panel"><div className="dashboard-panel-head"><h2><Target size={18}/>{t.pmo}</h2></div><p className="pmo-intro">{t.pmoIntro}</p><div className="pmo-cycle-grid"><article><b>01 · {t.plan}</b><p>{t.planText}</p></article><article><b>02 · {t.execute}</b><p>{t.executeText}</p></article><article><b>03 · {t.measure}</b><p>{t.measureText}</p></article><article><b>04 · {t.improve}</b><p>{t.improveText}</p></article></div></section>
   <section className="dashboard-panel ecosystem-link-panel"><div className="dashboard-panel-head"><h2>{t.osmarLink}</h2></div><div className="ecosystem-link-grid"><article><b>🌱 Family World</b><p>{t.osmarFamily}</p></article><article><b>📚 Thimar</b><p>{t.osmarThimar}</p></article><article><b>🏗️ OSMAR</b><p>{t.osmarBusiness}</p></article></div></section>
   <div className="dashboard-integrity"><ShieldCheck size={19}/><div><b>{t.integrity}</b><p>{t.integrityText} {t.pointsNote}</p></div></div>
  </>}
 </section>;
}
