import { useCallback, useEffect, useMemo, useState } from 'react';
import { Home, CheckCircle2, Circle, Plus, Send, RefreshCw, ShieldCheck, ClipboardCheck, Clock3, Trophy, AlertCircle, ExternalLink } from 'lucide-react';
import '../styles/three-x-studio.css';
import ApartmentPlanner from './ApartmentPlanner.jsx';

const taskTranslations={family_needs:{title:'家庭需求',description:'确定居住人数、日常活动与优先事项。'},space_layout:{title:'空间规划',description:'安排房间、服务区域与通行路线。'},privacy_access:{title:'隐私与通行',description:'考虑隐私、无障碍与安全通行。'},climate_energy:{title:'舒适、能源与用水',description:'规划采光、通风以及节能节水。'},materials_budget:{title:'材料与预算',description:'选择合适材料并制定初步预算。'}};
const words={
 ar:{title:'استوديو تحدي البيت · 100 م²',sub:'ابدأ مشروعك خطوة بخطوة. احفظ تقدمك، أكمل المهام، ثم أرسل عملك للمراجعة.',create:'ابدأ مشروع الشقة',project:'اسم المشروع',projectPlaceholder:'مثال: بيت عائلتي المستقبلي',tasks:'خطة الإنجاز',done:'مكتمل',of:'من',save:'حفظ المهمة',notes:'ملاحظاتك (اختياري)',submit:'إرسال للمراجعة',narrative:'اشرح فكرتك وماذا أنجزت',narrativeHint:'اكتب 30 حرفًا على الأقل: كيف يخدم التصميم الأسرة؟ وما القرارات التي اتخذتها؟',link:'رابط المخطط أو الملف (HTTPS اختياري)',progress:'التقدم',status:{draft:'مسودة',submitted:'قيد المراجعة',approved:'معتمد',revision_requested:'مطلوب تعديل'},noProject:'لم تبدأ مشروعًا بعد.',createError:'تعذر إنشاء المشروع. تأكد من أن عضويتك معتمدة.',loadError:'تعذر تحميل بيانات التحدي.',completeAll:'أكمل كل المهام المطلوبة قبل الإرسال.',submitError:'تعذر إرسال المشروع.',submitOk:'تم إرسال مشروعك للمراجعة بنجاح.',review:'مراجعة تسليمات 3X',pending:'تسليمات تنتظر المراجعة',approve:'اعتماد ومنح النقاط',revise:'طلب تعديل',reject:'رفض',reviewNote:'ملاحظة المراجع',reviewOk:'تم حفظ قرار المراجعة.',reviewError:'تعذر حفظ المراجعة.',points:'نقطة FWP عند الاعتماد',earned:'تُمنح بعد اعتماد المشروع فقط',signin:'سجّل الدخول بعضوية نشطة لبدء التحدي.',emptyQueue:'لا توجد تسليمات معلّقة.',refresh:'تحديث',retry:'أعد المحاولة',deliver:'مخرج التحدي',deliverText:'مخطط مفاهيمي + جدول مساحات + قصة استخدام + تقدير تكلفة أولي',guard:'النقاط ليست أموالًا أو أسهمًا. لا تُمنح إلا بعد مراجعة واعتماد OSMAR.',myProjects:'مشاريعي',urlError:'الرابط يجب أن يبدأ بـ https://',minText:'اكتب وصفًا من 30 حرفًا على الأقل.',saving:'جارٍ الحفظ…'},
 en:{title:'Home Challenge Studio · 100 m²',sub:'Build your project step by step. Save progress, complete the tasks, and submit your work for review.',create:'Start apartment project',project:'Project name',projectPlaceholder:'e.g. My future family home',tasks:'Delivery plan',done:'completed',of:'of',save:'Save task',notes:'Your notes (optional)',submit:'Submit for review',narrative:'Explain your idea and what you completed',narrativeHint:'Write at least 30 characters: how does the design serve the family, and what decisions did you make?',link:'Plan or file link (optional HTTPS)',progress:'Progress',status:{draft:'Draft',submitted:'In review',approved:'Approved',revision_requested:'Revision requested'},noProject:'You have not started a project yet.',createError:'Could not create the project. Your membership may not be active.',loadError:'Could not load challenge data.',completeAll:'Complete all required tasks before submitting.',submitError:'Could not submit the project.',submitOk:'Your project was submitted for review.',review:'3X submission review',pending:'Submissions awaiting review',approve:'Approve and award points',revise:'Request revision',reject:'Reject',reviewNote:'Reviewer note',reviewOk:'Review decision saved.',reviewError:'Could not save review.',points:'FWP points on approval',earned:'Awarded only after project approval',signin:'Sign in with an active membership to start.',emptyQueue:'No pending submissions.',refresh:'Refresh',retry:'Retry',deliver:'Challenge deliverable',deliverText:'Concept floor plan + area schedule + user story + initial cost estimate',guard:'Points are not money or shares. They are awarded only after OSMAR review and approval.',myProjects:'My projects',urlError:'The link must start with https://',minText:'Write at least 30 characters.',saving:'Saving…'},
 zh:{title:'家庭住宅挑战工作室 · 100 平方米',sub:'逐步完成项目、保存进度并提交审核。',create:'开始住宅项目',project:'项目名称',projectPlaceholder:'例如：我们的未来之家',tasks:'项目计划',done:'已完成',of:'共',save:'保存任务',notes:'备注（可选）',submit:'提交审核',narrative:'介绍设计理念与完成内容',narrativeHint:'至少输入30个字符：设计如何满足家庭需求？做出了哪些决定？',link:'平面图或文件链接（可选 HTTPS）',progress:'进度',status:{draft:'草稿',submitted:'审核中',approved:'已通过',revision_requested:'需要修改'},noProject:'你还没有开始项目。',createError:'无法创建项目，请确认会员状态。',loadError:'无法加载挑战数据。',completeAll:'请先完成所有必做任务。',submitError:'提交失败。',submitOk:'项目已成功提交审核。',review:'3X 项目审核',pending:'等待审核的提交',approve:'通过并奖励积分',revise:'要求修改',reject:'拒绝',reviewNote:'审核意见',reviewOk:'审核决定已保存。',reviewError:'无法保存审核决定。',points:'审核通过后获得 FWP 积分',earned:'仅在项目通过审核后发放',signin:'请使用有效会员账户登录后开始挑战。',emptyQueue:'没有待审核的提交。',refresh:'刷新',retry:'重试',deliver:'挑战交付成果',deliverText:'概念平面图 + 面积表 + 使用场景 + 初步成本估算',guard:'积分不是现金或股份，仅在 OSMAR 审核通过后发放。',myProjects:'我的项目',urlError:'链接必须以 https:// 开头。',minText:'请输入至少30个字符。',saving:'正在保存…'}
};
export default function ThreeXChallengeStudio({supabase,user,lang='ar',isAdmin=false}){
 const t=words[lang]||words.en,rtl=lang==='ar';
 const [challenge,setChallenge]=useState(null),[tasks,setTasks]=useState([]),[projects,setProjects]=useState([]),[active,setActive]=useState(null),[progress,setProgress]=useState([]),[submissions,setSubmissions]=useState([]),[queue,setQueue]=useState([]),[queuePlans,setQueuePlans]=useState([]);
 const [projectName,setProjectName]=useState(''),[narrative,setNarrative]=useState(''),[url,setUrl]=useState(''),[reviewNote,setReviewNote]=useState('');
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const demo=!user||user.id==='demo';
 const completed=useMemo(()=>progress.filter(x=>x.status==='completed').length,[progress]);
 const pct=tasks.length?Math.round(completed/tasks.length*100):0;
 const load=useCallback(async()=>{
  if(!supabase){setLoading(false);return;}
  setLoading(true);setError('');
  const c=await supabase.from('challenge_catalog').select('id,slug,title_ar,title_en,description_ar,description_en,area_sqm,points_award').eq('slug','home-100m2').eq('is_active',true).maybeSingle();
  if(c.error||!c.data){setError(t.loadError);setLoading(false);return;}
  setChallenge(c.data);
  const [taskRes,projectRes]=await Promise.all([
   supabase.from('challenge_tasks').select('id,task_key,title_ar,title_en,description_ar,description_en,sort_order,points_weight,is_required').eq('challenge_id',c.data.id).order('sort_order'),
   demo?Promise.resolve({data:[],error:null}):supabase.from('challenge_projects').select('id,title,status,challenge_id,created_at').eq('owner_id',user.id).eq('challenge_id',c.data.id).order('created_at',{ascending:false})
  ]);
  if(taskRes.error||projectRes.error){setError(t.loadError);setLoading(false);return;}
  setTasks(taskRes.data||[]);setProjects(projectRes.data||[]);
  const selected=active?(projectRes.data||[]).find(p=>p.id===active.id):(projectRes.data||[])[0];
  setActive(selected||null);
  if(selected){
   const [pr,su]=await Promise.all([
    supabase.from('challenge_task_progress').select('id,task_id,status,notes').eq('project_id',selected.id).eq('user_id',user.id),
    supabase.from('challenge_submissions').select('id,submission_no,status,review_note,created_at').eq('project_id',selected.id).order('submission_no',{ascending:false}).limit(5)
   ]);
   setProgress(pr.data||[]);setSubmissions(su.data||[]);
  }else{setProgress([]);setSubmissions([]);}
  if(isAdmin){
   const q=await supabase.from('challenge_submissions').select('id,project_id,user_id,submission_no,narrative,deliverable_url,created_at,challenge_projects(title,challenge_catalog(title_ar,title_en,points_award))').eq('status','pending').order('created_at');
   setQueue(q.data||[]);
   const plans=await supabase.from('apartment_designs').select('project_id,design_json');
   setQueuePlans(plans.data||[]);
  }
  setLoading(false);
 },[supabase,user?.id,demo,isAdmin,active?.id,t.loadError]);
 useEffect(()=>{load();},[load]);
 async function createProject(){
  if(demo||!challenge)return;
  setBusy(true);setError('');const title=projectName.trim()|| (rtl?'شقة عائلتي 100 متر':'My 100 m² family apartment');
  const r=await supabase.from('challenge_projects').insert({challenge_id:challenge.id,title,owner_id:user.id}).select('id,title,status,challenge_id,created_at').single();
  if(r.error){setError(t.createError);setBusy(false);return;}
  setProjects(p=>[r.data,...p]);setActive(r.data);setProgress([]);setSubmissions([]);setProjectName('');setBusy(false);
 }
 async function switchProject(p){
  setActive(p);setError('');
  const [pr,su]=await Promise.all([
   supabase.from('challenge_task_progress').select('id,task_id,status,notes').eq('project_id',p.id).eq('user_id',user.id),
   supabase.from('challenge_submissions').select('id,submission_no,status,review_note,created_at').eq('project_id',p.id).order('submission_no',{ascending:false}).limit(5)
  ]);
  setProgress(pr.data||[]);setSubmissions(su.data||[]);setNarrative('');setUrl('');
 }
 async function toggleTask(task){
  if(!active||busy||!['draft','revision_requested'].includes(active.status))return;
  setBusy(true);setError('');const old=progress.find(p=>p.task_id===task.id);
  const next=old?.status==='completed'?'todo':'completed';
  const r=await supabase.from('challenge_task_progress').upsert({project_id:active.id,task_id:task.id,user_id:user.id,status:next,updated_at:new Date().toISOString()},{onConflict:'project_id,task_id'}).select('id,task_id,status,notes').single();
  if(r.error)setError(r.error.message);else setProgress(prev=>[...prev.filter(p=>p.task_id!==task.id),r.data]);
  setBusy(false);
 }
 async function submit(){
  if(!active)return;
  if(narrative.trim().length<30){setError(t.minText);return;}
  if(url.trim()&&!url.trim().startsWith('https://')){setError(t.urlError);return;}
  if(completed!==tasks.length){setError(t.completeAll);return;}
  setBusy(true);setError('');const r=await supabase.rpc('submit_3x_challenge',{p_project_id:active.id,p_narrative:narrative.trim(),p_deliverable_url:url.trim()||null});
  if(r.error){setError(r.error.message||t.submitError);setBusy(false);return;}
  setNotice(t.submitOk);setNarrative('');setUrl('');await load();setBusy(false);
 }
 async function review(id,decision){
  setBusy(true);setError('');const r=await supabase.rpc('osmar_review_3x_submission',{p_submission_id:id,p_decision:decision,p_review_note:reviewNote.trim()||null});
  if(r.error)setError(r.error.message||t.reviewError);else{setNotice(t.reviewOk);setReviewNote('');}
  await load();setBusy(false);
 }
 const taskStatus=(id)=>progress.find(p=>p.task_id===id)?.status||'todo';
 if(demo)return <section className="threex-studio" dir={rtl?'rtl':'ltr'}><header><Home/><div><h2>{t.title}</h2><p>{t.signin}</p></div></header></section>;
 return <section className="threex-studio" dir={rtl?'rtl':'ltr'}>
  <header><Home/><div><h2>{t.title}</h2><p>{t.sub}</p></div><button onClick={load} disabled={loading}><RefreshCw size={15}/>{t.refresh}</button></header>
  {error&&<div className="tx-message error"><AlertCircle size={16}/>{error}</div>}{notice&&<div className="tx-message success">{notice}</div>}
  {loading?<p className="tx-loading">{t.saving}</p>:!challenge?<p>{t.loadError}</p>:<>
   <div className="tx-challenge-summary"><div><span>10 × 10</span><b>100 m²</b><small>{challenge.title_ar} / {challenge.title_en}</small></div><div><Trophy/><b>{challenge.points_award} {t.points}</b><small>{t.earned}</small></div></div>
   <div className="tx-deliver"><b>{t.deliver}</b><span>{t.deliverText}</span></div>
   <div className="tx-project-create"><label>{t.project}<input value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder={t.projectPlaceholder}/></label><button onClick={createProject} disabled={busy}><Plus size={16}/>{t.create}</button></div>
   {projects.length>0&&<div className="tx-project-switch"><b>{t.myProjects}</b>{projects.map(p=><button key={p.id} className={active?.id===p.id?'selected':''} onClick={()=>switchProject(p)}>{p.title}<small>{t.status[p.status]||p.status}</small></button>)}</div>}
   {!active?<p className="tx-empty">{t.noProject}</p>:<><div className="tx-progress-head"><div><b>{active.title}</b><span>{t.status[active.status]||active.status}</span></div><strong>{completed} {t.of} {tasks.length} · {pct}%</strong></div><div className="tx-progress-bar"><i style={{width:pct+'%'}}/></div>
    <ApartmentPlanner lang={lang} userId={user.id} projectId={active.id} supabase={supabase} />
    <div className="tx-task-list"><h3>{t.tasks}</h3>{tasks.map((task,i)=>{const isDone=taskStatus(task.id)==='completed';const locked=!['draft','revision_requested'].includes(active.status);return <article key={task.id} className={isDone?'completed':''}><button onClick={()=>toggleTask(task)} disabled={busy||locked} aria-label={task.title_ar}>{isDone?<CheckCircle2/>:<Circle/>}</button><div><b>{i+1}. {lang==='zh'?(taskTranslations[task.task_key]?.title||task.title_en):(rtl?task.title_ar:task.title_en)}</b><p>{lang==='zh'?(taskTranslations[task.task_key]?.description||task.description_en):(rtl?task.description_ar:task.description_en)}</p></div><small>{task.points_weight}%</small></article>})}</div>
    {['draft','revision_requested'].includes(active.status)&&<div className="tx-submit"><label>{t.narrative}<textarea rows="4" value={narrative} onChange={e=>setNarrative(e.target.value)} placeholder={t.narrativeHint}/></label><label>{t.link}<input type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..."/></label><button onClick={submit} disabled={busy||completed!==tasks.length||narrative.trim().length<30}><Send size={16}/>{busy?t.saving:t.submit}</button></div>}
    {submissions.length>0&&<div className="tx-history"><h3><Clock3/>{t.status[active.status]||active.status}</h3>{submissions.map(s=><p key={s.id}>#{s.submission_no} · {t.status[s.status]||s.status}{s.review_note?' · '+s.review_note:''}</p>)}</div>}
   </>}
   <p className="tx-guard"><ShieldCheck size={16}/>{t.guard}</p>
   {isAdmin&&<div className="tx-admin"><h3><ClipboardCheck/>{t.review}</h3><p>{t.pending}</p>{queue.length?queue.map(q=><article key={q.id}><b>{q.challenge_projects?.title||'3X Project'}</b><p>{q.narrative}</p>{(()=>{const plan=queuePlans.find(x=>x.project_id===q.project_id)?.design_json;if(!plan)return null;const cost=(plan.furniture||[]).reduce((sum,item)=>sum+(Number(item.cost)||0),0);return <div className="tx-plan-review"><b>{lang==='ar'?'ملخص المخطط':lang==='zh'?'平面图摘要':'Plan summary'}</b><span>{(plan.cells||[]).filter(Boolean).length}/100 m² · {(plan.furniture||[]).length} {lang==='ar'?'قطعة أثاث':lang==='zh'?'件家具':'furniture items'} · {(plan.doors||[]).length} {lang==='ar'?'باب':lang==='zh'?'扇门':'doors'}</span><strong>{cost.toLocaleString('en-US')} EGP</strong></div>})()}{q.deliverable_url&&<a href={q.deliverable_url} target="_blank" rel="noreferrer"><ExternalLink size={13}/> {q.deliverable_url}</a>}<textarea rows="2" value={reviewNote} onChange={e=>setReviewNote(e.target.value)} placeholder={t.reviewNote}/><div><button onClick={()=>review(q.id,'approved')} disabled={busy}>{t.approve}</button><button onClick={()=>review(q.id,'revision_requested')} disabled={busy}>{t.revise}</button><button onClick={()=>review(q.id,'rejected')} disabled={busy}>{t.reject}</button></div></article>):<p>{t.emptyQueue}</p>}</div>}
  </>}
 </section>;
}