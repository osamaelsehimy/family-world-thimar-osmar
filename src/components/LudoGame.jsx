import { useMemo, useState } from 'react';

const I18N = {
 ar:{title:'ليدو العائلية',subtitle:'لعبة محلية بالتناوب على نفس الجهاز · 2 إلى 4 لاعبين',players:'عدد اللاعبين',start:'ابدأ لعبة جديدة',roll:'ارمِ النرد',turn:'الدور على',dice:'نتيجة النرد',choose:'اختار الحجر الذي تريد تحريكه',home:'في البيت',finish:'وصل للبيت',safe:'مربع آمن',six:'ستة! لك رمية إضافية',blocked:'لا توجد حركة متاحة',win:'فاز اللاعب',again:'لعبة جديدة',rules:'تحتاج 6 لإخراج الحجر من البيت. تحرك حسب نتيجة النرد، والوقوف على خصم في مربع غير آمن يعيده للبيت. تحتاج الرقم المناسب للوصول إلى خط النهاية.',back:'العودة للألعاب',p:['الأحمر','الأزرق','الأخضر','الأصفر']},
 en:{title:'Family Ludo',subtitle:'Local pass-and-play · 2 to 4 players on one device',players:'Players',start:'Start new game',roll:'Roll dice',turn:"Player's turn",dice:'Dice',choose:'Choose a token to move',home:'At home',finish:'Home',safe:'Safe square',six:'Six! Roll again',blocked:'No legal move',win:'Winner',again:'New game',rules:'You need a 6 to leave home. Move by the dice result. Landing on an opponent on a non-safe square sends them home. Reach the finish with the exact roll.',back:'Back to games',p:['Red','Blue','Green','Yellow']},
 zh:{title:'家庭飞行棋',subtitle:'本地轮流游戏 · 2 至 4 人共用一台设备',players:'玩家人数',start:'开始新游戏',roll:'掷骰子',turn:'当前玩家',dice:'骰子',choose:'选择要移动的棋子',home:'在基地',finish:'到达终点',safe:'安全格',six:'掷出六点！再来一次',blocked:'没有可走的棋子',win:'获胜者',again:'新游戏',rules:'掷出 6 才能离开基地。按点数移动。在非安全格落到对手位置可将其送回基地。必须掷出准确点数到达终点。',back:'返回游戏',p:['红色','蓝色','绿色','黄色']}
};
const COLORS=['#d94b4b','#3984d6','#3d9a69','#e0ae35'];
const SAFE=new Set([0,8,13,21,26,34,39,47]);
function fresh(players){return {players,tokens:Array.from({length:players},()=>[-1,-1,-1,-1]),turn:0,dice:null,rolled:false,winner:null,log:'',sixCount:0};}
export default function LudoGame({lang='ar',onBack}){
 const t=I18N[lang]||I18N.ar;
 const [count,setCount]=useState(4);
 const [game,setGame]=useState(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const current=game?.turn||0;
 const roll=()=>{
  if(!game||game.winner!==null||game.rolled)return;
  const value=Math.floor(Math.random()*6)+1;
  const can=game.tokens[current].some(p=>p<57&&(p>=0||value===6));
  setGame(g=>({...g,dice:value,rolled:true,log:can?'':t.blocked}));
  if(!can)setMessage(t.blocked);
  else setMessage('');
 };
 const legal=useMemo(()=>game?.rolled?game.tokens[current].map((p,i)=>({p,i})).filter(({p})=>p<57&&(p>=0||game.dice===6))||[]:[],[game,current]);
 const move=(index)=>{
  if(!game||!game.rolled||game.winner!==null)return;
  const value=game.dice;
  const tokens=game.tokens.map(row=>[...row]);
  const before=tokens[current][index];
  const next=before===-1?0:before+value;
  if(next>57)return;
  tokens[current][index]=next;
  let captured=false;
  if(next>=0&&next<52){
   const global=(current*13+next)%52;
   if(!SAFE.has(global)){
    tokens.forEach((row,player)=>{if(player!==current)row.forEach((pos,token)=>{if(pos>=0&&pos<52&&(player*13+pos)%52===global){tokens[player][token]=-1;captured=true;}});});
   }
  }
  const winner=tokens[current].every(p=>p===57)?current:null;
  const six=value===6;
  const nextTurn=six||captured?current:(current+1)%game.players;
  setGame(g=>({...g,tokens,turn:nextTurn,dice:null,rolled:false,winner,log:winner!==null? t.win+' · '+t.p[winner]:six?t.six:captured?'Captured!':''}));
  setMessage(winner!==null?t.win+' · '+t.p[winner]:six?t.six:captured?'Captured!':'');
 };
 const board=game?.tokens||[];
 const globalPos=(player,pos)=>(player*13+pos)%52;
 return <section className="ludo-page" dir={lang==='ar'?'rtl':'ltr'}>
  <header className="ludo-head"><div><small>FAMILY WORLD · THIMAR OSMAR</small><h1>🎲 {t.title}</h1><p>{t.subtitle}</p></div><button onClick={onBack}>{t.back}</button></header>
  {!game?<div className="ludo-setup"><label>{t.players}<select value={count} onChange={e=>setCount(Number(e.target.value))}>{[2,3,4].map(n=><option key={n} value={n}>{n}</option>)}</select></label><button className="primary" onClick={()=>{setGame(fresh(count));setMessage('');}}>{t.start}</button><p>{t.rules}</p></div>:<>
   <div className="ludo-status"><b style={{color:COLORS[current]}}>{t.turn}: {t.p[current]}</b><span>{t.dice}: {game.dice??'—'}</span><button disabled={game.rolled||game.winner!==null} onClick={roll}>{t.roll}</button></div>
   <div className="ludo-board" aria-label={t.title}>
    {Array.from({length:52},(_,space)=>{const pieces=[];board.forEach((row,player)=>row.forEach((pos,token)=>{if(pos>=0&&pos<52&&globalPos(player,pos)===space)pieces.push({player,token});}));return <div key={space} className={'ludo-space '+(SAFE.has(space)?'safe':'')}>{space+1}{pieces.map(piece=><span key={piece.player+'-'+piece.token} style={{background:COLORS[piece.player]}} title={t.p[piece.player]+' '+(piece.token+1)} />)}</div>;})}
   </div>
   <p className="ludo-hint">{game.winner!==null?t.win+' · '+t.p[game.winner]:game.rolled? t.choose: t.rules}</p>
   <div className="ludo-players">{board.map((row,player)=><article key={player} style={{borderColor:COLORS[player]}}><b style={{color:COLORS[player]}}>{t.p[player]}</b><div>{row.map((pos,index)=><button key={index} disabled={player!==current||!legal.some(x=>x.i===index)||game.winner!==null} onClick={()=>move(index)} style={{background:pos===57?COLORS[player]:'#f5f5f2',color:pos===57?'white':COLORS[player],borderColor:COLORS[player]}}>{pos===-1?'⌂':pos===57?'✓':pos+1}</button>)}</div><small>{row.filter(x=>x===57).length}/4 {t.finish}</small></article>)}</div>
   {message&&<p className="ludo-message">{message}</p>}
   <button className="primary ludo-new" onClick={()=>{setGame(fresh(count));setMessage('');}}>{t.again}</button>
  </>}
 </section>;
}
