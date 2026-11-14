import { useEffect, useState } from 'react';
import { Camera, UserRound, ShieldCheck, Save, RefreshCw, CalendarDays, Mail, Hash, BadgeCheck } from 'lucide-react';

const words = {
 ar: { kicker:'FAMILY WORLD · MEMBER IDENTITY', title:'ملفي الشخصي', intro:'دي مساحتك الخاصة في عالم الأسرة. عدّل اسمك ولقبك، وخلي صورتك اختيارية.', display:'الاسم المعروض', nickname:'اللقب / الاسم المستعار', email:'البريد الإلكتروني المسجل', member:'رقم العضوية الدائم', status:'حالة العضوية', joined:'تاريخ الانضمام', save:'حفظ التعديلات', saving:'جارٍ الحفظ…', upload:'إضافة / تغيير الصورة', uploading:'جارٍ رفع الصورة…', photoHint:'JPG أو PNG أو WebP · حتى 2 ميجابايت', private:'بيانات الحساب ورقم العضوية مصدرها النظام ولا يمكن تعديلها هنا. لا نعرض بريدك الإلكتروني للآخرين.', active:'نشط', pending:'قيد المراجعة', suspended:'موقوف', rejected:'مرفوض', saved:'تم حفظ ملفك الشخصي.', uploaded:'تم تحديث الصورة الشخصية.', noProfile:'لم نعثر على ملف العضوية. تواصل مع الدعم بدل إنشاء رقم عضوية جديد.', error:'تعذر إكمال العملية: ', required:'اكتب اسمًا معروضًا قبل الحفظ.', placeholderName:'اكتب الاسم اللي تحب يظهر', placeholderNick:'مثال: أبو يوسف أو Captain', fallback:'عضو Family World' },
 en: { kicker:'FAMILY WORLD · MEMBER IDENTITY', title:'My Profile', intro:'Your personal space in Family World. Choose your display name and nickname; your photo is optional.', display:'Display name', nickname:'Nickname', email:'Registered email', member:'Permanent member number', status:'Membership status', joined:'Joined', save:'Save changes', saving:'Saving…', upload:'Add / change photo', uploading:'Uploading photo…', photoHint:'JPG, PNG or WebP · up to 2 MB', private:'Your account email and member number come from the system and cannot be edited here. Your email is not shown to other members.', active:'Active', pending:'Under review', suspended:'Suspended', rejected:'Rejected', saved:'Your profile has been saved.', uploaded:'Profile photo updated.', noProfile:'Membership profile not found. Contact support instead of creating another member number.', error:'Could not complete the action: ', required:'Enter a display name before saving.', placeholderName:'Name you want others to see', placeholderNick:'e.g. Abu Yusuf or Captain', fallback:'Family World member' },
 zh: { kicker:'FAMILY WORLD · MEMBER IDENTITY', title:'我的个人资料', intro:'这是你在 Family World 的个人空间。可设置显示名称和昵称，头像为可选。', display:'显示名称', nickname:'昵称', email:'注册邮箱', member:'永久会员编号', status:'会员状态', joined:'加入日期', save:'保存更改', saving:'正在保存…', upload:'添加 / 更换头像', uploading:'正在上传头像…', photoHint:'JPG、PNG 或 WebP · 最大 2 MB', private:'邮箱和会员编号来自系统，不能在此修改。你的邮箱不会向其他会员显示。', active:'正常', pending:'审核中', suspended:'已暂停', rejected:'已拒绝', saved:'个人资料已保存。', uploaded:'头像已更新。', noProfile:'未找到会员资料。请联系支持人员，不要重新创建会员编号。', error:'操作失败：', required:'请先填写显示名称。', placeholderName:'输入你希望显示的名称', placeholderNick:'例如：Abu Yusuf 或 Captain', fallback:'Family World 会员' }
};

export default function MemberProfile({ supabase, user, lang='ar' }) {
 const t = words[lang] || words.ar;
 const [profile,setProfile] = useState(null);
 const [displayName,setDisplayName] = useState('');
 const [nickname,setNickname] = useState('');
 const [loading,setLoading] = useState(true);
 const [busy,setBusy] = useState(false);
 const [message,setMessage] = useState('');
 const [isError,setIsError] = useState(false);
 const locale = lang==='ar'?'ar-EG':lang==='zh'?'zh-CN':'en-US';

 async function load() {
  if (!supabase || !user?.id || user.id==='demo') { setLoading(false); return; }
  setLoading(true); setMessage('');
  const {data,error} = await supabase.from('profiles').select('member_code,membership_status,created_at,display_name,nickname,avatar_url').eq('id',user.id).maybeSingle();
  if (error) { setMessage(t.error+error.message); setIsError(true); }
  else if (data) { setProfile(data); setDisplayName(data.display_name || user.user_metadata?.full_name || ''); setNickname(data.nickname || ''); }
  else { setMessage(t.noProfile); setIsError(true); }
  setLoading(false);
 }
 useEffect(()=>{load();},[supabase,user?.id,lang]);

 async function save(event) {
  event.preventDefault();
  if (!displayName.trim()) { setMessage(t.required); setIsError(true); return; }
  setBusy(true); setMessage('');
  const {data,error} = await supabase.from('profiles').update({display_name:displayName.trim(),nickname:nickname.trim() || null}).eq('id',user.id).select('member_code,membership_status,created_at,display_name,nickname,avatar_url').maybeSingle();
  if (error) { setMessage(t.error+error.message); setIsError(true); }
  else if (!data) { setMessage(t.noProfile); setIsError(true); }
  else { setProfile(data); setMessage(t.saved); setIsError(false); }
  setBusy(false);
 }

 async function uploadPhoto(event) {
  const file=event.target.files?.[0];
  event.target.value='';
  if (!file) return;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>2*1024*1024) {
   setMessage(t.photoHint); setIsError(true); return;
  }
  setBusy(true); setMessage('');
  try {
   const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
   const path=user.id+'/'+crypto.randomUUID()+'.'+ext;
   const {error:uploadError}=await supabase.storage.from('avatars').upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
   if(uploadError) throw uploadError;
   const {data:{publicUrl}}=supabase.storage.from('avatars').getPublicUrl(path);
   const {data,error}=await supabase.from('profiles').update({avatar_url:publicUrl}).eq('id',user.id).select('member_code,membership_status,created_at,display_name,nickname,avatar_url').maybeSingle();
   if(error) throw error;
   if(!data) throw new Error(t.noProfile);
   setProfile(data); setMessage(t.uploaded); setIsError(false);
  } catch(error) { setMessage(t.error+(error.message||'Upload failed')); setIsError(true); }
  setBusy(false);
 }

 const status=profile?.membership_status || 'pending';
 return <section className="member-profile" dir={lang==='ar'?'rtl':'ltr'}>
  <header className="profile-heading"><div><span className="profile-kicker">{t.kicker}</span><h1>{t.title}</h1><p>{t.intro}</p></div><button className="profile-refresh" type="button" onClick={load} disabled={loading||busy}><RefreshCw size={15}/></button></header>
  {message && <p className={isError?'profile-message error':'profile-message'} role="status">{message}</p>}
  {loading ? <div className="profile-loading">{t.saving}</div> : profile ? <>
   <div className="profile-card">
    <div className="profile-avatar-wrap">{profile.avatar_url?<img className="profile-avatar" src={profile.avatar_url} alt={displayName||t.fallback}/>:<div className="profile-avatar profile-avatar-empty"><UserRound size={48}/></div>}
     <label className="profile-photo-button"><Camera size={15}/>{t.upload}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={busy}/></label>
     <small>{t.photoHint}</small>
    </div>
    <div className="profile-identity"><h2>{displayName||t.fallback}</h2>{nickname&&<span className="profile-nickname">{nickname}</span>}<div className="profile-member-code"><Hash size={16}/><strong>{profile.member_code}</strong></div><span className={'profile-status '+status}><BadgeCheck size={14}/>{t[status]||status}</span></div>
   </div>
   <form className="profile-form" onSubmit={save}>
    <label>{t.display}<input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={60} required placeholder={t.placeholderName}/></label>
    <label>{t.nickname}<input value={nickname} onChange={e=>setNickname(e.target.value)} maxLength={30} placeholder={t.placeholderNick}/></label>
    <div className="profile-readonly"><span><Mail size={16}/>{t.email}</span><strong dir="ltr">{user.email||'—'}</strong></div>
    <div className="profile-readonly"><span><Hash size={16}/>{t.member}</span><strong>{profile.member_code}</strong></div>
    <div className="profile-readonly"><span><ShieldCheck size={16}/>{t.status}</span><strong>{t[status]||status}</strong></div>
    <div className="profile-readonly"><span><CalendarDays size={16}/>{t.joined}</span><strong>{profile.created_at?new Date(profile.created_at).toLocaleDateString(locale):'—'}</strong></div>
    <button className="primary profile-save" disabled={busy}><Save size={16}/>{busy?t.saving:t.save}</button>
   </form>
   <p className="profile-privacy"><ShieldCheck size={17}/>{t.private}</p>
  </> : null}
 </section>;
}
