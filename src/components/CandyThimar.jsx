import { useCallback, useState } from 'react';

const FRUITS = ['🍓','🍋','🍇','🍊','🍏','🫐'];
const SIZE = 8;
const LEVELS = [
  { target: 18, moves: 22, title: { ar: 'بداية الحصاد', en: 'First Harvest', zh: '初次收获' } },
  { target: 24, moves: 24, title: { ar: 'بستان الثمار', en: 'Fruit Orchard', zh: '水果果园' } },
  { target: 30, moves: 26, title: { ar: 'مهرجان الثمار', en: 'Thimar Festival', zh: '丰收庆典' } }
];
const TEXT = {
  ar: { back:'العودة للألعاب', kicker:'THIMAR ARCADE', title:'كاندي ثمار', subtitle:'بدّل مكان الثمار المتجاورة، واجمع 3 أو أكثر من نفس النوع لتحقق هدف المرحلة.', level:'المرحلة', moves:'الحركات', score:'النقاط', goal:'المطلوب', next:'المرحلة التالية', won:'أحسنت! اكتمل الحصاد 🌟', lost:'انتهت الحركات! جرّب مرة أخرى.', restart:'إعادة اللعب', continue:'كمّل الرحلة', finished:'بطل الثمار! أنهيت المراحل الثلاث.', hint:'اضغط على ثمرة ثم ثمرة مجاورة لتبديل المكان.', noMove:'لا توجد حركة متاحة — تم خلط اللوحة.', badge:'ثمارك تكبر مع كل حركة ذكية', },
  en: { back:'Back to games', kicker:'THIMAR ARCADE', title:'Candy Thimar', subtitle:'Swap adjacent fruits and match 3 or more of the same kind to reach each level goal.', level:'Level', moves:'Moves', score:'Score', goal:'Target', next:'Next level', won:'Great harvest! Level complete 🌟', lost:'Out of moves! Give it another try.', restart:'Restart', continue:'Continue journey', finished:'Thimar Champion! All three levels completed.', hint:'Tap a fruit, then an adjacent fruit to swap.', noMove:'No moves available — the board was shuffled.', badge:'Every smart move grows your harvest', },
  zh: { back:'返回游戏', kicker:'THIMAR ARCADE', title:'Thimar 糖果乐园', subtitle:'交换相邻水果，连成三个或更多相同水果，完成每关目标。', level:'关卡', moves:'步数', score:'得分', goal:'目标', next:'下一关', won:'太棒了！本关收获完成 🌟', lost:'步数用完了！再试一次。', restart:'重新开始', continue:'继续旅程', finished:'水果冠军！你完成了全部三关。', hint:'先点一个水果，再点相邻水果进行交换。', noMove:'没有可用步数，棋盘已重新排列。', badge:'每一步巧妙交换，都让收获成长', }
};
function randomFruit(){ return FRUITS[Math.floor(Math.random()*FRUITS.length)]; }
function makeBoard(){
  const board=[];
  for(let r=0;r<SIZE;r++){
    const row=[];
    for(let c=0;c<SIZE;c++){
      let fruit=randomFruit(), guard=0;
      while(guard++<20 && ((c>1&&row[c-1]===fruit&&row[c-2]===fruit)||(r>1&&board[r-1][c]===fruit&&board[r-2][c]===fruit))) fruit=randomFruit();
      row.push(fruit);
    }
    board.push(row);
  }
  return board;
}
function findMatches(board){
  const found=new Set();
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    const fruit=board[r][c]; if(!fruit) continue;
    let end=c+1; while(end<SIZE&&board[r][end]===fruit) end++;
    if(end-c>=3) for(let x=c;x<end;x++) found.add(r*SIZE+x);
    end=r+1; while(end<SIZE&&board[end][c]===fruit) end++;
    if(end-r>=3) for(let y=r;y<end;y++) found.add(y*SIZE+c);
  }
  return [...found];
}
function resolveBoard(source){
  let board=source.map(row=>[...row]), cleared=0, rounds=0;
  while(rounds++<12){
    const matches=findMatches(board); if(!matches.length) break;
    cleared+=matches.length;
    matches.forEach(index=>{board[Math.floor(index/SIZE)][index%SIZE]=null;});
    for(let c=0;c<SIZE;c++){
      const remaining=[];
      for(let r=SIZE-1;r>=0;r--) if(board[r][c]) remaining.push(board[r][c]);
      for(let r=SIZE-1;r>=0;r--) board[r][c]=remaining[SIZE-1-r]||randomFruit();
    }
  }
  return {board,cleared};
}
function adjacent(a,b){return Math.abs(a.r-b.r)+Math.abs(a.c-b.c)===1;}
function hasPossibleMove(board){
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    for(const [dr,dc] of [[0,1],[1,0]]){
      const nr=r+dr,nc=c+dc;if(nr>=SIZE||nc>=SIZE) continue;
      const candidate=board.map(row=>[...row]);
      [candidate[r][c],candidate[nr][nc]]=[candidate[nr][nc],candidate[r][c]];
      if(findMatches(candidate).length) return true;
    }
  }
  return false;
}
export default function CandyThimar({lang='ar',onBack=()=>{},onResult=()=>{}}){
  const t=TEXT[lang]||TEXT.ar;
  const [level,setLevel]=useState(0);
  const [board,setBoard]=useState(makeBoard);
  const [selected,setSelected]=useState(null);
  const [moves,setMoves]=useState(LEVELS[0].moves);
  const [score,setScore]=useState(0);
  const [harvest,setHarvest]=useState(0);
  const [phase,setPhase]=useState('playing');
  const [notice,setNotice]=useState('');
  const [startedAt,setStartedAt]=useState(Date.now());
  const config=LEVELS[level];
  const progress=Math.min(100,Math.round(harvest/config.target*100));
  const reset=useCallback((nextLevel=0)=>{
    setLevel(nextLevel);setBoard(makeBoard());setSelected(null);setMoves(LEVELS[nextLevel].moves);setScore(0);setHarvest(0);setPhase('playing');setNotice('');setStartedAt(Date.now());
  },[]);
  const finish=useCallback((outcome,finalScore)=>{
    onResult({sessionKey:'candy-thimar-'+Date.now(),gameId:'candy-thimar',outcome,score:finalScore,durationSeconds:Math.round((Date.now()-startedAt)/1000)});
  },[onResult,startedAt]);
  const playCell=useCallback((r,c)=>{
    if(phase!=='playing') return;
    if(!selected){setSelected({r,c});return;}
    const current={r,c};
    if(selected.r===r&&selected.c===c){setSelected(null);return;}
    if(!adjacent(selected,current)){setSelected(current);return;}
    const swapped=board.map(row=>[...row]);
    const temp=swapped[selected.r][selected.c];swapped[selected.r][selected.c]=swapped[r][c];swapped[r][c]=temp;
    if(!findMatches(swapped).length){setSelected(null);return;}
    const result=resolveBoard(swapped);
    const gained=result.cleared*10;
    const nextHarvest=harvest+result.cleared;
    const nextMoves=moves-1;
    const nextScore=score+gained;
    const nextBoard=hasPossibleMove(result.board)?result.board:makeBoard();
    setBoard(nextBoard);setSelected(null);setMoves(nextMoves);setScore(nextScore);setHarvest(nextHarvest);
    setNotice(nextBoard===result.board?'':t.noMove);
    if(nextHarvest>=config.target){
      setPhase('won');
      finish('won',nextScore);
    }else if(nextMoves<=0){
      setPhase('lost');
      finish('lost',nextScore);
    }
  },[phase,selected,board,harvest,moves,score,config.target,level,finish,t.noMove]);
  const next=()=>{
    if(level<LEVELS.length-1) reset(level+1);
    else reset(0);
  };
  return <section className="candy-game" dir={lang==='ar'?'rtl':'ltr'}>
    <style>{`
      .candy-game{--cg-ink:#183d35;--cg-green:#246447;--cg-gold:#efc66e;color:var(--cg-ink);max-width:980px;margin:12px auto 38px;padding:clamp(12px,3vw,26px);border:1px solid #e4eadf;border-radius:26px;background:radial-gradient(circle at 90% 0%,#fff3d9 0,transparent 34%),linear-gradient(145deg,#fbfff7,#f1f7ed);box-shadow:0 18px 48px #173c2410}
      .candy-top{display:flex;justify-content:space-between;align-items:center;gap:12px}.candy-back{padding:9px 13px;border:1px solid #dce8dc;border-radius:11px;background:#fff;color:#286047;font-weight:800;font-size:12px}.candy-kicker{font-size:10px;letter-spacing:2px;color:#a17b3b;font-weight:900}.candy-game h1{font-size:clamp(26px,4vw,38px);margin:5px 0;color:#164b3b}.candy-subtitle{max-width:700px;margin:0;color:#718278;font-size:13px;line-height:1.8}.candy-badge{display:inline-flex;margin-top:12px;padding:7px 11px;border-radius:99px;background:#e7f2df;color:#39734e;font-size:10px;font-weight:800}
      .candy-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:20px 0 13px}.candy-stat{padding:11px 13px;border:1px solid #e6ebdf;border-radius:14px;background:#fff}.candy-stat small{display:block;color:#829187;font-size:10px}.candy-stat strong{display:block;margin-top:3px;color:#205a40;font-size:23px;font-variant-numeric:tabular-nums}
      .candy-progress{height:9px;overflow:hidden;border-radius:99px;background:#e4eadf;margin:8px 0 15px}.candy-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#63a66f,#e8bb60);transition:width .2s}
      .candy-board-wrap{padding:clamp(8px,2vw,15px);border:5px solid #d9c08b;border-radius:22px;background:linear-gradient(145deg,#22634b,#164b3b);box-shadow:inset 0 0 0 2px #ffffff25,0 12px 26px #153a2818}
      .candy-board{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:clamp(3px,1vw,8px);max-width:650px;margin:auto;touch-action:manipulation}
      .candy-cell{display:grid;place-items:center;aspect-ratio:1;min-width:0;border:1px solid #ffffff75;border-radius:clamp(7px,1.5vw,13px);background:linear-gradient(145deg,#fff,#e9f2e7);box-shadow:0 3px 5px #0c30234a,inset 0 1px 0 #fff;cursor:pointer;font-size:clamp(18px,4.4vw,37px);line-height:1;transition:transform .12s,border-color .12s,box-shadow .12s}.candy-cell:active{transform:scale(.92)}.candy-cell.selected{border:3px solid #ffd66f;box-shadow:0 0 0 3px #ffd66f55,0 3px 5px #0c30234a;transform:scale(1.04)}.candy-cell:focus-visible{outline:3px solid #fff;outline-offset:2px}
      .candy-hint{text-align:center;color:#e4f0e4;font-size:11px;padding:12px 5px 1px}.candy-status{margin-top:14px;padding:14px;border:1px solid #e5eadf;border-radius:15px;background:#fff;text-align:center;color:#52695b;font-size:13px;line-height:1.7}.candy-status strong{display:block;color:#246447;font-size:17px}.candy-actions{display:flex;justify-content:center;gap:9px;flex-wrap:wrap;margin-top:12px}.candy-actions button{padding:11px 17px;border-radius:11px;background:#245c43;color:#fff;font-weight:800;font-size:12px}.candy-actions button.secondary{border:1px solid #dce8dc;background:#fff;color:#245c43}
      @media(max-width:560px){.candy-game{padding:12px;border-radius:18px}.candy-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.candy-stat{padding:9px}.candy-stat strong{font-size:20px}.candy-board-wrap{padding:6px;border-width:4px;border-radius:15px}.candy-board{gap:3px}.candy-cell{border-radius:7px;font-size:clamp(19px,6.4vw,30px)}.candy-top{align-items:flex-start}}
      @media(prefers-reduced-motion:reduce){.candy-cell,.candy-progress i{transition:none}}
    `}</style>
    <div className="candy-top"><div><div className="candy-kicker">{t.kicker}</div><h1>🍬 {t.title}</h1><p className="candy-subtitle">{t.subtitle}</p><span className="candy-badge">🌱 {t.badge}</span></div><button className="candy-back" onClick={onBack}>‹ {t.back}</button></div>
    <div className="candy-stats">
      <div className="candy-stat"><small>{t.level}</small><strong>{level+1}/3</strong></div>
      <div className="candy-stat"><small>{t.moves}</small><strong>{moves}</strong></div>
      <div className="candy-stat"><small>{t.score}</small><strong>{score}</strong></div>
      <div className="candy-stat"><small>{t.goal}</small><strong>{Math.min(harvest,config.target)}/{config.target}</strong></div>
    </div>
    <div className="candy-progress" aria-label={`${progress}%`}><i style={{width:progress+'%'}}/></div>
    <div className="candy-board-wrap"><div className="candy-board" role="group" aria-label={t.title}>
      {board.map((row,r)=>row.map((fruit,c)=><button key={r+'-'+c} type="button" className={'candy-cell'+(selected?.r===r&&selected?.c===c?' selected':'')} aria-label={fruit+' '+(r+1)+'-'+(c+1)} aria-pressed={selected?.r===r&&selected?.c===c} onClick={()=>playCell(r,c)}>{fruit}</button>))}
    </div><div className="candy-hint">{t.hint}</div></div>
    {phase!=='playing'&&<div className="candy-status" role="status"><strong>{phase==='won'?t.won:t.lost}</strong>{phase==='won'&&level===LEVELS.length-1?t.finished:null}</div>}
    {phase==='playing'&&notice&&<div className="candy-status" role="status">{notice}</div>}
    {phase==='won'&&<div className="candy-actions"><button onClick={next}>{level===LEVELS.length-1?t.restart:t.next}</button></div>}
    {phase==='lost'&&<div className="candy-actions"><button onClick={()=>reset(level)}>{t.restart}</button><button className="secondary" onClick={onBack}>{t.back}</button></div>}
    {phase==='playing'&&<div className="candy-actions"><button className="secondary" onClick={()=>reset(level)}>{t.restart}</button></div>}
  </section>;
}
