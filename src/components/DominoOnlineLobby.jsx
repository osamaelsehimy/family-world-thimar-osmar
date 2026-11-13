import { useCallback, useEffect, useState } from 'react';

const words={
 ar:{title:'غرف الدومينو أونلاين',sub:'العب مع أفراد مجتمع Family World الموثوقين',players:'عدد المقاعد',mode:'نظام اللعب',solo:'فردي',teams:'فرق',sets:'طقم الدومينو',single:'سنجل · 28 قطعة',double:'دبل · 56 قطعة',scoring:'نظام النقاط',one:'جولة واحدة',points:'تجميع نقاط',target:'الهدف',board:'شكل الطاولة',classic:'كلاسيك',emerald:'زمردي',midnight:'ليلي',tiles:'شكل القطع',ivory:'عاجي',blue:'أزرق',wood:'خشبي',create:'إنشاء غرفة',join:'دخول بكود',code:'كود الغرفة',codeHint:'اكتب كود الدعوة المكوّن من 6 حروف/أرقام',back:'رجوع للدومينو',room:'غرفتك',copy:'نسخ الكود',copied:'تم النسخ',roster:'اللاعبون',host:'منشئ الغرفة',you:'أنت',waiting:'في انتظار بقية اللاعبين',full:'اكتملت المقاعد',leave:'مغادرة الغرفة',seat:'مقعد',empty:'مقعد شاغر',online:'متصل لحظيًا',error:'حصلت مشكلة',needAuth:'سجّل الدخول بعضوية موثوقة مفعّلة لإنشاء أو دخول غرفة.',needEven:'نظام الفرق يحتاج عددًا زوجيًا من اللاعبين.',needDouble:'من 5 إلى 8 لاعبين يلزم طقم الدبل.',min:'الغرفة تحتاج لاعبين على الأقل لبدء المباراة.',notStarted:'الغرفة الآن في مرحلة انتظار اللاعبين. محرك اللعب المتزامن وحفظ النقلات والنتائج هو المرحلة التالية.',joinError:'تأكد من الكود وأن الغرفة ما زالت تستقبل لاعبين.',createError:'تعذر إنشاء الغرفة. تأكد أن عضويتك مفعّلة.'},
 en:{title:'Online Domino Rooms',sub:'Play with trusted Family World members',players:'Seats',mode:'Match mode',solo:'Solo',teams:'Teams',sets:'Domino set',single:'Single · 28 tiles',double:'Double · 56 tiles',scoring:'Scoring',one:'One round',points:'Race to points',target:'Target',board:'Table theme',classic:'Classic',emerald:'Emerald',midnight:'Midnight',tiles:'Tile style',ivory:'Ivory',blue:'Blue',wood:'Wood',create:'Create room',join:'Join with code',code:'Room code',codeHint:'Enter the 6-character invitation code',back:'Back to dominoes',room:'Your room',copy:'Copy code',copied:'Copied',roster:'Players',host:'Room host',you:'You',waiting:'Waiting for more players',full:'All seats filled',leave:'Leave room',seat:'Seat',empty:'Open seat',online:'Live updates',error:'Something went wrong',needAuth:'Sign in with an active trusted membership to create or join a room.',needEven:'Team mode requires an even number of players.',needDouble:'5–8 players require the double set.',min:'At least two players are needed to start.',notStarted:'The room is currently waiting for players. Synchronized gameplay, move validation and permanent results are the next development phase.',joinError:'Check the code and make sure the room is still accepting players.',createError:'Could not create the room. Confirm that your membership is active.'},
 zh:{title:'在线多米诺房间',sub:'与 Family World 可信会员一起游戏',players:'座位数',mode:'比赛模式',solo:'个人',teams:'团队',sets:'骨牌套装',single:'单套 · 28 张',double:'双套 · 56 张',scoring:'计分方式',one:'单局',points:'累计积分',target:'目标',board:'桌面主题',classic:'经典',emerald:'翡翠',midnight:'夜色',tiles:'骨牌样式',ivory:'象牙白',blue:'蓝色',wood:'木纹',create:'创建房间',join:'输入代码加入',code:'房间代码',codeHint:'输入 6 位邀请码',back:'返回多米诺',room:'你的房间',copy:'复制代码',copied:'已复制',roster:'玩家',host:'房主',you:'你',waiting:'等待其他玩家',full:'座位已满',leave:'离开房间',seat:'座位',empty:'空位',online:'实时更新',error:'发生错误',needAuth:'请使用已激活的可信会员账户登录。',needEven:'团队模式需要偶数名玩家。',needDouble:'5 至 8 名玩家需要双套牌。',min:'至少需要两名玩家才能开始。',notStarted:'房间正在等待玩家。同步游戏、验证出牌和永久保存成绩将在下一阶段开发。',joinError:'请检查代码以及房间是否仍在招募玩家。',createError:'无法创建房间，请确认会员资格已激活。'}
};

export default function DominoOnlineLobby({supabase,userId,lang='ar',onBack}){
 const t=words[lang]||words.ar;
 const [players,setPlayers]=useState('4');
 const [sets,setSets]=useState('1');
 const [mode,setMode]=useState('solo');
 const [scoring,setScoring]=useState('101');
 const [boardTheme,setBoardTheme]=useState('emerald');
 const [tileTheme,setTileTheme]=useState('ivory');
 const [code,setCode]=useState('');
 const [roomId,setRoomId]=useState('');
 const [room,setRoom]=useState(null);
 const [roster,setRoster]=useState([]);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const refresh=useCallback(async(id=roomId)=>{
  if(!id||!supabase)return;
  const [{data:roomData,error:roomError},{data:playerData,error:playerError}]=await Promise.all([
   supabase.from('domino_rooms').select('id,room_code,host_id,settings,status,created_at').eq('id',id).single(),
   supabase.from('domino_room_players').select('id,user_id,seat,member_code,is_ready,joined_at').eq('room_id',id).order('seat')
  ]);
  if(roomError||playerError){setMessage(roomError?.message||playerError?.message||t.error);return;}
  setRoom(roomData);setRoster(playerData||[]);
 },[roomId,supabase,t.error]);
 useEffect(()=>{
  if(!roomId||!supabase)return undefined;
  refresh(roomId);
  const channel=supabase.channel('domino-lobby-'+roomId)
   .on('postgres_changes',{event:'*',schema:'public',table:'domino_rooms',filter:'id=eq.'+roomId},()=>refresh(roomId))
   .on('postgres_changes',{event:'*',schema:'public',table:'domino_room_players',filter:'room_id=eq.'+roomId},()=>refresh(roomId))
   .subscribe();
  return ()=>{supabase.removeChannel(channel);};
 },[roomId,supabase,refresh]);
 const createRoom=async()=>{
  if(!supabase||!userId){setMessage(t.needAuth);return;}
  if(mode==='teams'&&Number(players)%2){setMessage(t.needEven);return;}
  if(Number(players)>4&&Number(sets)!==2){setMessage(t.needDouble);return;}
  setBusy(true);setMessage('');
  const settings={players:Number(players),sets:Number(sets),mode,scoring,boardTheme,tileTheme};
  const {data,error}=await supabase.rpc('create_domino_room',{p_settings:settings});
  if(error){setMessage(error.message||t.createError);}else if(data?.room_id){setRoomId(data.room_id);setCode(data.room_code||'');}else setMessage(t.createError);
  setBusy(false);
 };
 const joinRoom=async()=>{
  if(!supabase||!userId){setMessage(t.needAuth);return;}
  if(!code.trim()){setMessage(t.joinError);return;}
  setBusy(true);setMessage('');
  const {data,error}=await supabase.rpc('join_domino_room',{p_room_code:code.trim().toUpperCase()});
  if(error){setMessage(error.message||t.joinError);}else if(data?.room_id){setRoomId(data.room_id);setCode(data.room_code||code.trim().toUpperCase());}else setMessage(t.joinError);
  setBusy(false);
 };
 const leaveRoom=async()=>{
  if(!roomId)return;
  setBusy(true);
  const {error}=await supabase.rpc('leave_domino_room',{p_room_id:roomId});
  if(error)setMessage(error.message);else{setRoomId('');setRoom(null);setRoster([]);setCode('');}
  setBusy(false);
 };
 const copyCode=async()=>{try{await navigator.clipboard.writeText(room?.room_code||code);setMessage(t.copied);}catch{setMessage(room?.room_code||code);}};
 const capacity=Number(room?.settings?.players||players);
 const occupied=new Set(roster.map(p=>p.seat));
 const isHost=room?.host_id===userId;
 return <section className="domino-game domino-online-page" dir={lang==='ar'?'rtl':'ltr'}>
  <div className="domino-head"><div><span className="domino-kicker">FAMILY WORLD · THIMAR OSMAR · TRUSTED PLAY</span><h1>🌐 {t.title}</h1><p>{t.sub}</p></div><button className="domino-back" onClick={onBack}>{t.back}</button></div>
  {!roomId?<div className="domino-online-layout">
   <div className="domino-setup domino-setup-pro">
    <div className="domino-setup-intro"><span>🛡️</span><div><h3>{t.create}</h3><p>{t.sub}</p></div></div>
    <div className="domino-setting"><label>{t.players}</label><div className="domino-player-picker">{Array.from({length:7},(_,i)=>i+2).map(n=><button key={n} className={Number(players)===n?'selected':''} onClick={()=>{setPlayers(String(n));if(n>4)setSets('2');if(n%2&&mode==='teams')setMode('solo');}}>{n}</button>)}</div></div>
    <div className="domino-setting"><label>{t.mode}</label><div className="domino-option-row"><button className={mode==='solo'?'selected':''} onClick={()=>setMode('solo')}>👤 {t.solo}</button><button className={mode==='teams'?'selected':''} disabled={Number(players)%2!==0} onClick={()=>setMode('teams')}>👥 {t.teams}</button></div></div>
    <div className="domino-setting"><label>{t.sets}</label><div className="domino-option-row"><button className={sets==='1'?'selected':''} disabled={Number(players)>4} onClick={()=>setSets('1')}>{t.single}</button><button className={sets==='2'?'selected':''} onClick={()=>setSets('2')}>{t.double}</button></div></div>
    <div className="domino-setting"><label>{t.scoring}</label><div className="domino-option-row"><button className={scoring==='one'?'selected':''} onClick={()=>setScoring('one')}>{t.one}</button><button className={scoring!=='one'?'selected':''} onClick={()=>setScoring('101')}>{t.points}</button></div>{scoring!=='one'&&<div className="domino-targets">{['101','151','201'].map(v=><button key={v} className={scoring===v?'selected':''} onClick={()=>setScoring(v)}>{v}</button>)}</div>}</div>
    <div className="domino-setting"><label>{t.board}</label><div className="domino-swatch-row">{[['classic','🟫',t.classic],['emerald','🟢',t.emerald],['midnight','🌌',t.midnight]].map(([v,e,l])=><button key={v} className={boardTheme===v?'selected':''} onClick={()=>setBoardTheme(v)}>{e} {l}</button>)}</div></div>
    <div className="domino-setting"><label>{t.tiles}</label><div className="domino-swatch-row">{[['ivory','◻️',t.ivory],['blue','🔹',t.blue],['wood','🪵',t.wood]].map(([v,e,l])=><button key={v} className={tileTheme===v?'selected':''} onClick={()=>setTileTheme(v)}>{e} {l}</button>)}</div></div>
    <button className="domino-start domino-start-pro" disabled={busy} onClick={createRoom}>{busy?'…':t.create}<span>←</span></button>
   </div>
   <div className="domino-join-panel"><h3>🔑 {t.join}</h3><label>{t.code}<input value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6))} placeholder={t.codeHint} maxLength={6} /></label><button disabled={busy||code.length!==6} onClick={joinRoom}>{busy?'…':t.join}</button><p>{t.needAuth}</p></div>
  </div>:<div className="domino-lobby-card">
   <div className="domino-lobby-top"><div><small>{t.room}</small><h2>{room?.room_code||code}</h2><span><i/> {t.online} · {room?.status||'waiting'}</span></div><button onClick={copyCode}>{t.copy}</button></div>
   <div className="domino-room-settings"><span>{capacity} {t.players}</span><span>{room?.settings?.mode==='teams'?t.teams:t.solo}</span><span>{room?.settings?.sets===2?t.double:t.single}</span><span>{room?.settings?.scoring==='one'?t.one:(room?.settings?.scoring||'101')+' '+t.points}</span></div>
   <h3>{t.roster} · {roster.length}/{capacity}</h3>
   <div className="domino-room-seats">{Array.from({length:capacity},(_,seat)=>{const p=roster.find(x=>x.seat===seat);return <div key={seat} className={p?'occupied':''}><b>{p?('🧑 '+(p.user_id===userId?t.you:p.member_code)):'＋ '+t.empty}</b><small>{t.seat} {seat+1}{p&&p.user_id===room?.host_id?' · '+t.host:''}</small></div>;})}</div>
   <p className="domino-online-note">{roster.length===capacity?t.full:t.waiting}. {t.notStarted}</p>
   <div className="domino-actions"><button onClick={refresh}>{lang==='ar'?'تحديث':'Refresh'}</button><button onClick={leaveRoom} disabled={busy}>{t.leave}</button></div>
  </div>}
  {message&&<p className="notice" role="status">{message}</p>}
 </section>;
}
