import { useEffect, useMemo, useState } from 'react';

const labels = {
 ar: {
  title:'الدومينو', subtitle:'اختار إعداداتك… واللمة تبدأ', back:'العودة للألعاب', setup:'إعداد المباراة', players:'عدد اللاعبين', decks:'نوع الطقم', single:'سنجل · 28 قطعة', double:'دبل · 56 قطعة', teams:'فرق', solo:'فردي', match:'نظام اللعب', oneRound:'جولة واحدة', target:'تجميع نقاط', targetScore:'الفوز عند', points:'نقطة', board:'شكل الطاولة', classic:'كلاسيك', emerald:'زمردي', midnight:'ليلي', tiles:'شكل القطع', ivory:'عاجي', blue:'أزرق', wood:'خشبي', start:'ابدأ المباراة', hand:'قطعك', draw:'اسحب قطعة', pass:'تخطي الدور', restart:'مباراة جديدة', change:'تغيير الإعدادات', left:'الطرف الأول', right:'الطرف الثاني', yourTurn:'دورك الآن', botTurn:'اللاعب التالي بيفكر…', place:'القطعة تنفع للطرفين؛ اختار مكانها', chooseLeft:'الطرف الأول', chooseRight:'الطرف الثاني', noMove:'مفيش قطعة مناسبة. اسحب قطعة أو انتظر انتهاء السحب.', blocked:'اللعب اتقفل', roundWin:'كسبت الجولة 🎉', roundLose:'الجولة للمنافسين', drawResult:'الجولة انتهت بالتعادل', matchWin:'كسبت المباراة بالكامل! 🏆', matchLose:'المنافس كسب المباراة', score:'النقاط', round:'الجولة', remaining:'قطعة', pips:'نقطة في القطع', pile:'المخزون', rules:'طابق رقم أحد طرفي قطعتك مع أحد طرفي السلسلة. أول لاعب يخلص قطعه يكسب الجولة. ولو اللعب اتقفل، الأقل في مجموع القطع المتبقية يكسب.', online:'نسخة اللعب الحالية ضد لاعبين آليين. غرف اللعب بين أشخاص حقيقيين أونلاين ومزامنة النتائج الدائمة مرحلة تطوير مستقلة.', winner:'الفائز', roundPoints:'نقاط الجولة', targetReached:'وصل للهدف', chooseStyle:'اختار الشكل اللي يعجبك', teamMode:'فرق: المقاعد بالتبادل فريق واحد', soloMode:'فردي: كل لاعب لنفسه', needEven:'نظام الفرق يحتاج عدد لاعبين زوجي', deckAuto:'مع 5 إلى 8 لاعبين لازم طقم دبل (56 قطعة).', newRound:'جولة تالية', turn:'الدور'
 },
 en: {
  title:'Dominoes',subtitle:'Set your match. Bring everyone to the table.',back:'Back to games',setup:'Match setup',players:'Players',decks:'Tile set',single:'Single · 28 tiles',double:'Double · 56 tiles',teams:'Teams',solo:'Solo',match:'Scoring',oneRound:'One round',target:'Race to points',targetScore:'Play to',points:'points',board:'Table theme',classic:'Classic',emerald:'Emerald',midnight:'Midnight',tiles:'Tile style',ivory:'Ivory',blue:'Blue',wood:'Wood',start:'Start match',hand:'Your hand',draw:'Draw tile',pass:'Pass turn',restart:'New match',change:'Change settings',left:'Left end',right:'Right end',yourTurn:'Your turn',botTurn:'Next player is thinking…',place:'This tile fits both ends. Choose where to place it:',chooseLeft:'Left end',chooseRight:'Right end',noMove:'No playable tile. Draw a tile or wait for the pile to empty.',blocked:'Blocked game',roundWin:'Round won! 🎉',roundLose:'Your opponents won the round',drawResult:'The round ended in a draw',matchWin:'You won the whole match! 🏆',matchLose:'An opponent won the match',score:'Score',round:'Round',remaining:'tiles',pips:'pips in hand',pile:'Pile',rules:'Match one end of your tile to either open end. First to empty their hand wins the round. If blocked, the lowest remaining pip total wins.',online:'This version is played against bots. Real-player online rooms and persistent score syncing are a separate development phase.',winner:'Winner',roundPoints:'Round points',targetReached:'Target reached',chooseStyle:'Choose your look',teamMode:'Teams: alternating seats form a team',soloMode:'Solo: every player competes individually',needEven:'Team mode requires an even player count',deckAuto:'5–8 players require the double set (56 tiles).',newRound:'Next round',turn:'Turn'
 },
 zh: {
  title:'多米诺骨牌',subtitle:'设置比赛，邀请大家入座',back:'返回游戏',setup:'比赛设置',players:'玩家人数',decks:'牌组',single:'单套 · 28 张',double:'双套 · 56 张',teams:'团队',solo:'个人',match:'计分方式',oneRound:'单局',target:'累计积分',targetScore:'目标分数',points:'分',board:'桌面主题',classic:'经典',emerald:'翡翠',midnight:'夜色',tiles:'骨牌样式',ivory:'象牙白',blue:'蓝色',wood:'木纹',start:'开始比赛',hand:'你的手牌',draw:'摸牌',pass:'跳过',restart:'新比赛',change:'更改设置',left:'左端',right:'右端',yourTurn:'轮到你了',botTurn:'下一位玩家思考中…',place:'这张牌两端都能连接，请选择放置位置：',chooseLeft:'左端',chooseRight:'右端',noMove:'没有可出的牌，请摸牌或等待牌堆结束。',blocked:'牌局被堵住',roundWin:'你赢得本局 🎉',roundLose:'对手赢得本局',drawResult:'本局平局',matchWin:'你赢得整场比赛！🏆',matchLose:'对手赢得比赛',score:'分数',round:'回合',remaining:'张牌',pips:'手牌点数',pile:'牌堆',rules:'将骨牌一端与牌链任一开放端匹配。先出完手牌者赢得本局；若无法继续，剩余点数最低者获胜。',online:'当前版本与电脑玩家对战。真人在线房间和永久积分同步将在后续独立开发。',winner:'获胜者',roundPoints:'本局得分',targetReached:'达到目标',chooseStyle:'选择喜欢的外观',teamMode:'团队：交替座位组成一队',soloMode:'个人：每位玩家独立竞争',needEven:'团队模式需要偶数名玩家',deckAuto:'5 至 8 名玩家必须使用双套牌（56 张）。',newRound:'下一局',turn:'回合'
 }
};

const shuffle = items => { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const makeDeck = sets => { const d=[]; for(let s=0;s<sets;s++) for(let a=0;a<=6;a++) for(let b=a;b<=6;b++) d.push({id:s+'-'+a+'-'+b,a,b,set:s}); return d; };
const pipTotal = hand => hand.reduce((sum,t)=>sum+t.a+t.b,0);
const ends = board => board.length ? [board[0].a,board[board.length-1].b] : null;
const faceSpots = {0:[],1:[[2,2]],2:[[1,1],[3,3]],3:[[1,1],[2,2],[3,3]],4:[[1,1],[1,3],[3,1],[3,3]],5:[[1,1],[1,3],[2,2],[3,1],[3,3]],6:[[1,1],[1,2],[1,3],[3,1],[3,2],[3,3]]};
function PipFace({value}) { return <span className="domino-face">{faceSpots[value].map(([x,y],i)=><i key={i} style={{gridColumn:x,gridRow:y}} />)}</span>; }

export default function DominoGame({lang='ar',onBack}) {
 const t=labels[lang]||labels.ar;
 const [players,setPlayers]=useState(4);
 const [sets,setSets]=useState(1);
 const [mode,setMode]=useState('solo');
 const [scoring,setScoring]=useState('101');
 const [boardTheme,setBoardTheme]=useState('emerald');
 const [tileTheme,setTileTheme]=useState('ivory');
 const [game,setGame]=useState(null);
 const [choice,setChoice]=useState(null);
 const [notice,setNotice]=useState('');
 const [round,setRound]=useState(0);
 const [totals,setTotals]=useState([]);
 const [matchWinner,setMatchWinner]=useState(null);
 const [showSetup,setShowSetup]=useState(true);
 const openEnds=useMemo(()=>ends(game?.board||[]),[game?.board]);
 const current=game?.turn??0;
 const target=scoring==='one'?null:Number(scoring);
 const getMoves=(tile,board)=>{ if(!board.length)return ['right']; const e=ends(board),moves=[]; if(tile.a===e[0]||tile.b===e[0])moves.push('left'); if(tile.a===e[1]||tile.b===e[1])moves.push('right'); return moves; };
 const canPlay=(tile,board)=>getMoves(tile,board).length>0;
 const nameOf=i=>i===0?(lang==='ar'?'أنت':lang==='zh'?'你':'You'):(lang==='ar'?'لاعب':lang==='zh'?'玩家':'Player')+' '+(i+1);
 const sideWinner=(seat)=>mode==='teams'?(seat%2===0?'teamA':'teamB'):'p'+seat;
 const scoreWinner=(g,winner)=> {
  const hands=g.hands;
  const winningSeats=mode==='teams'?hands.map((_,i)=>((i%2===0)===(winner==='teamA'))?i:-1).filter(i=>i>=0):[Number(winner.slice(1))];
  const losingSeats=hands.map((_,i)=>winningSeats.includes(i)?-1:i).filter(i=>i>=0);
  return losingSeats.reduce((sum,i)=>sum+pipTotal(hands[i]),0);
 };
 const finishRound=(g,winner)=>{
  if(!winner)return g;
  const earned=winner==='draw'?0:scoreWinner(g,winner);
  const nextTotals=[...totals];
  if(winner!=='draw'){
   if(mode==='teams'){const idx=winner==='teamA'?0:1;nextTotals[idx]=(nextTotals[idx]||0)+earned;}
   else {const idx=Number(winner.slice(1));nextTotals[idx]=(nextTotals[idx]||0)+earned;}
  }
  let champion=null;
  if(target!==null){if(mode==='teams'){if((nextTotals[0]||0)>=target)champion='teamA';else if((nextTotals[1]||0)>=target)champion='teamB';}else{const idx=nextTotals.findIndex(v=>v>=target);if(idx>=0)champion='p'+idx;}}
  setTotals(nextTotals);
  if(champion)setMatchWinner(champion);
  return {...g,winner,earned,totals:nextTotals,champion};
 };
 const startRound=(fresh=false)=>{
  const count=players,deck=shuffle(makeDeck(sets));
  const perPlayer=sets===1?Math.min(7,Math.floor(deck.length/count)):Math.min(7,Math.floor(deck.length/count));
  const hands=Array.from({length:count},(_,i)=>deck.slice(i*perPlayer,(i+1)*perPlayer));
  const pile=deck.slice(count*perPlayer);
  setGame({hands,pile,board:[],turn:0,passes:0,winner:null,earned:0,round:round+1});
  setChoice(null);setNotice('');setRound(v=>v+1);setShowSetup(false);
  if(fresh){setTotals(Array(mode==='teams'?2:count).fill(0));setMatchWinner(null);}
 };
 const startMatch=()=>{setTotals(Array(mode==='teams'?2:players).fill(0));setMatchWinner(null);setRound(0);startRound(true);};
 const orientTile=(tile,side,board)=>{const e=ends(board);if(!board.length)return {...tile};if(side==='left')return tile.b===e[0]?{...tile}:{...tile,a:tile.b,b:tile.a};return tile.a===e[1]?{...tile}:{...tile,a:tile.b,b:tile.a};};
 const placeTile=(seat,tile,side)=>{
  setGame(g=>{
   if(!g||g.winner||g.turn!==seat)return g;
   const oriented=orientTile(tile,side,g.board);
   const hands=g.hands.map((h,i)=>i===seat?h.filter(x=>x.id!==tile.id):h);
   const board=side==='left'?[oriented,...g.board]:[...g.board,oriented];
   let next={...g,hands,board,passes:0,turn:(seat+1)%players};
   if(!hands[seat].length){const winner=sideWinner(seat);next=finishRound(next,winner);}
   return next;
  });
  setChoice(null);setNotice('');
 };
 const playHuman=tile=>{
  if(!game||game.turn!==0||game.winner)return;
  const moves=getMoves(tile,game.board);
  if(!moves.length){setNotice(t.noMove);return;}
  if(moves.length===2)setChoice({tile});else placeTile(0,tile,moves[0]);
 };
 const drawHuman=()=>{
  setGame(g=>{if(!g||g.winner||g.turn!==0||!g.pile.length)return g;const [tile,...pile]=g.pile;return {...g,pile,hands:g.hands.map((h,i)=>i===0?[...h,tile]:h)};});
  setNotice(t.noMove);
 };
 const passHuman=()=>{
  setGame(g=>{
   if(!g||g.winner||g.turn!==0||g.pile.length||g.hands[0].some(tile=>canPlay(tile,g.board)))return g;
   const passes=g.passes+1;
   if(passes>=players){const scores=g.hands.map(pipTotal);let winner;if(mode==='teams'){const a=scores.filter((_,i)=>i%2===0).reduce((x,y)=>x+y,0),b=scores.filter((_,i)=>i%2===1).reduce((x,y)=>x+y,0);winner=a===b?'draw':a<b?'teamA':'teamB';}else{const min=Math.min(...scores),w=scores.map((v,i)=>v===min?i:-1).filter(i=>i>=0);winner=w.length===1?'p'+w[0]:'draw';}return finishRound({...g,passes},winner);}
   return {...g,passes,turn:(g.turn+1)%players};
  });
 };
 useEffect(()=>{
  if(!game||game.winner||game.turn===0)return;
  const timer=setTimeout(()=>{
   setGame(g=>{
    if(!g||g.winner||g.turn===0)return g;
    const seat=g.turn,hand=g.hands[seat],options=hand.filter(tile=>canPlay(tile,g.board));
    if(options.length){options.sort((a,b)=>(b.a+b.b)-(a.a+a.b));const tile=options[0],moves=getMoves(tile,g.board),side=moves.includes('right')?'right':moves[0],oriented=orientTile(tile,side,g.board),hands=g.hands.map((h,i)=>i===seat?h.filter(x=>x.id!==tile.id):h),board=side==='left'?[oriented,...g.board]:[...g.board,oriented];let next={...g,hands,board,turn:(seat+1)%players,passes:0};if(!hands[seat].length)next=finishRound(next,sideWinner(seat));return next;}
    if(g.pile.length){const [tile,...pile]=g.pile;return {...g,pile,hands:g.hands.map((h,i)=>i===seat?[...h,tile]:h)};}
    const passes=g.passes+1;
    if(passes>=players){const scores=g.hands.map(pipTotal);let winner;if(mode==='teams'){const a=scores.filter((_,i)=>i%2===0).reduce((x,y)=>x+y,0),b=scores.filter((_,i)=>i%2===1).reduce((x,y)=>x+y,0);winner=a===b?'draw':a<b?'teamA':'teamB';}else{const min=Math.min(...scores),w=scores.map((v,i)=>v===min?i:-1).filter(i=>i>=0);winner=w.length===1?'p'+w[0]:'draw';}return finishRound({...g,passes},winner);}
    return {...g,passes,turn:(seat+1)%players};
   });
  },650);
  return ()=>clearTimeout(timer);
 },[game?.turn,game?.winner,game?.hands,game?.board,game?.pile,game?.passes,players,mode]);
 const result=game?.winner==='draw'?t.drawResult:game?.winner?(game.winner==='teamA'||game.winner==='p0'?t.roundWin:t.roundLose):'';
 const championText=matchWinner?(matchWinner==='teamA'||matchWinner==='p0'?t.matchWin:t.matchLose):'';
 const boardClass='domino-table theme-'+boardTheme;
 const tileClass='domino-tile tile-'+tileTheme;
 const scoreLabel=i=>mode==='teams'?(i===0?(lang==='ar'?'فريقك':lang==='zh'?'你的队伍':'Your team'):(lang==='ar'?'الفريق المنافس':lang==='zh'?'对方队伍':'Opposing team')):nameOf(i);
 return <section className="domino-game" dir={lang==='ar'?'rtl':'ltr'}>
  <div className="domino-head"><div><span className="domino-kicker">FAMILY WORLD · THIMAR OSMAR · GAME OPERATIONS</span><h1>🁣 {t.title}</h1><p>{t.subtitle}</p></div><button className="domino-back" onClick={onBack}>{t.back}</button></div>
  {showSetup||!game?<div className="domino-setup domino-setup-pro">
   <div className="domino-setup-intro"><span>♟</span><div><h3>{t.setup}</h3><p>{t.rules}</p></div></div>
   <div className="domino-setting"><label>{t.players}</label><div className="domino-player-picker">{Array.from({length:7},(_,i)=>i+2).map(n=><button key={n} className={players===n?'selected':''} onClick={()=>{setPlayers(n);if(n>4)setSets(2);if(mode==='teams'&&n%2)setMode('solo');}}>{n}</button>)}</div></div>
   <div className="domino-setting"><label>{t.decks}</label><div className="domino-option-row"><button className={sets===1?'selected':''} disabled={players>4} onClick={()=>setSets(1)}>🁣 {t.single}</button><button className={sets===2?'selected':''} onClick={()=>setSets(2)}>🁣🁣 {t.double}</button></div>{players>4&&<small>{t.deckAuto}</small>}</div>
   <div className="domino-setting"><label>{t.match}</label><div className="domino-option-row"><button className={mode==='solo'?'selected':''} onClick={()=>setMode('solo')}>👤 {t.solo}</button><button className={mode==='teams'?'selected':''} disabled={players%2!==0} onClick={()=>setMode('teams')}>👥 {t.teams}</button></div><small>{mode==='teams'?t.teamMode:t.soloMode}</small></div>
   <div className="domino-setting"><label>{t.match}</label><div className="domino-option-row"><button className={scoring==='one'?'selected':''} onClick={()=>setScoring('one')}>🎯 {t.oneRound}</button><button className={scoring!=='one'?'selected':''} onClick={()=>setScoring('101')}>🏆 {t.target}</button></div>{scoring!=='one'&&<div className="domino-targets">{['101','151','201'].map(n=><button key={n} className={scoring===n?'selected':''} onClick={()=>setScoring(n)}>{n}</button>)}</div>}</div>
   <div className="domino-setting"><label>{t.board}</label><div className="domino-swatch-row">{[['classic','🟫',t.classic],['emerald','🟢',t.emerald],['midnight','🌌',t.midnight]].map(([v,e,l])=><button key={v} className={boardTheme===v?'selected':''} onClick={()=>setBoardTheme(v)}>{e} {l}</button>)}</div></div>
   <div className="domino-setting"><label>{t.tiles}</label><div className="domino-swatch-row">{[['ivory','◻️',t.ivory],['blue','🔹',t.blue],['wood','🪵',t.wood]].map(([v,e,l])=><button key={v} className={tileTheme===v?'selected':''} onClick={()=>setTileTheme(v)}>{e} {l}</button>)}</div></div>
   <button className="domino-start domino-start-pro" onClick={startMatch}>{t.start} <span>←</span></button>
  </div>:<>
   <div className="domino-toolbar"><div><b>{t.round} {round}</b><small>{players} {t.players} · {sets===1?t.single:t.double} · {mode==='teams'?t.teams:t.solo}</small></div><button onClick={()=>setShowSetup(true)}>{t.change}</button></div>
   <div className="domino-scoreboard">{totals.map((v,i)=><div key={i} className="domino-score-card"><small>{scoreLabel(i)}</small><strong>{v||0}</strong>{target&&<span>{t.targetScore} {target}</span>}</div>)}</div>
   <div className={boardClass}>
    <div className="domino-seats">{game.hands.map((h,i)=><span key={i} className={'domino-seat '+(i===current?'current':'')}>{i===0?'🧑':'🤖'} {nameOf(i)} · {h.length}</span>)}</div>
    <div className="domino-chain-wrap"><div className="domino-chain" aria-label="Domino chain">{game.board.length?game.board.map(tile=><div key={tile.id} className={tileClass+' board-tile '+(tile.a===tile.b?'is-double':'')}><PipFace value={tile.a}/><PipFace value={tile.b}/></div>):<span className="domino-empty">{t.start}</span>}</div></div>
    <div className="domino-ends">{openEnds?<span>{t.left}: <b>{openEnds[0]}</b>　·　{t.right}: <b>{openEnds[1]}</b></span>:<span>{t.start}</span>}</div>
   </div>
   <div className="domino-livebar"><b>{game.winner?result:current===0?t.yourTurn:t.botTurn}</b><span>{t.pile}: {game.pile.length}</span></div>
   {choice&&<div className="domino-choice"><b>{t.place}</b><button onClick={()=>placeTile(0,choice.tile,'left')}>{t.chooseLeft}</button><button onClick={()=>placeTile(0,choice.tile,'right')}>{t.chooseRight}</button></div>}
   <div className="domino-hand-panel"><h3>{t.hand} <span>{game.hands[0].length}</span></h3><div className="domino-hand">{game.hands[0].map(tile=><button key={tile.id} className={tileClass+' hand-tile '+(canPlay(tile,game.board)?'is-playable':'')+(tile.a===tile.b?' is-double':'')} onClick={()=>playHuman(tile)} disabled={current!==0||!!game.winner}><PipFace value={tile.a}/><PipFace value={tile.b}/></button>)}</div></div>
   <div className="domino-actions"><button onClick={drawHuman} disabled={current!==0||!!game.winner||!game.pile.length}>{t.draw} ({game.pile.length})</button><button onClick={passHuman} disabled={current!==0||!!game.winner||game.hands[0].some(tile=>canPlay(tile,game.board))||game.pile.length>0}>{t.pass}</button></div>
   {game.winner&&<div className="domino-round-result"><div><small>{t.winner}</small><h3>{result}</h3><p>{t.roundPoints}: <b>{game.earned||0}</b></p></div>{matchWinner?<h2>{championText}</h2>:<button onClick={()=>startRound(false)}>{t.newRound}</button>}<button className="secondary" onClick={()=>setShowSetup(true)}>{t.change}</button></div>}
   <p className="domino-online-note">{t.online}</p>
  </>}
 </section>;
}
