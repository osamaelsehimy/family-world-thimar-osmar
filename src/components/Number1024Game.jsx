import { useCallback, useEffect, useRef, useState } from 'react';

const copy = {
 ar:{title:'1024',sub:'ادمج الأرقام واصنع 1024 بأقل عدد من الحركات.',score:'النقاط',best:'أفضل نتيجة',new:'لعبة جديدة',undo:'تراجع',won:'وصلت إلى 1024! أحسنت 🎉',over:'مفيش حركات متاحة. جرّب من جديد!',rules:'حرّك المربعات في أي اتجاه. الأرقام المتساوية تندمج في رقم أكبر. هدفك الوصول إلى 1024.',back:'العودة للألعاب',moves:'الحركات',keep:'كمل اللعب'},
 en:{title:'1024',sub:'Merge the numbers and reach 1024 in as few moves as you can.',score:'Score',best:'Best score',new:'New game',undo:'Undo',won:'You reached 1024! Great job 🎉',over:'No moves left. Try a new game!',rules:'Move the tiles in any direction. Equal numbers merge into a larger number. Your goal is 1024.',back:'Back to games',moves:'Moves',keep:'Keep playing'},
 zh:{title:'1024',sub:'合并数字，尽可能少移动地达到 1024。',score:'得分',best:'最高分',new:'新游戏',undo:'撤销',won:'你达到 1024 了！🎉',over:'没有可用移动了，请重新开始。',rules:'向任意方向移动方块。相同数字会合并成更大的数字。目标是达到 1024。',back:'返回游戏',moves:'步数',keep:'继续游戏'}
};
const empty=()=>Array.from({length:4},()=>Array(4).fill(0));
const spawn=board=>{
 const cells=[];board.forEach((row,r)=>row.forEach((v,c)=>{if(!v)cells.push([r,c]);}));
 if(!cells.length)return board;
 const [r,c]=cells[Math.floor(Math.random()*cells.length)];
 const next=board.map(row=>[...row]);next[r][c]=Math.random()<.9?2:4;return next;
};
const start=()=>spawn(spawn(empty()));
const slide=line=>{
 const values=line.filter(Boolean);let gained=0;
 for(let i=0;i<values.length-1;i++)if(values[i]===values[i+1]){values[i]*=2;gained+=values[i];values.splice(i+1,1);}
 while(values.length<4)values.push(0);
 return {line:values,gained};
};
const move=(board,direction)=>{
 const next=empty();let gained=0;
 for(let i=0;i<4;i++){
  let line=(direction==='left'||direction==='right')?[...board[i]]:board.map(row=>row[i]);
  if(direction==='right'||direction==='down')line.reverse();
  const result=slide(line);gained+=result.gained;line=result.line;
  if(direction==='right'||direction==='down')line.reverse();
  if(direction==='left'||direction==='right')next[i]=line;else line.forEach((v,j)=>next[j][i]=v);
 }
 return {board:next,gained,changed:next.some((row,r)=>row.some((v,c)=>v!==board[r][c]))};
};
const hasMoves=board=>board.some(row=>row.some(v=>v===0))||board.some(row=>row.some((v,c)=>c<3&&v===row[c+1]))||board.some((row,r)=>row.some((v,c)=>r<3&&v===board[r+1][c]));
export default function Number1024Game({lang='ar',onBack}){
 const t=copy[lang]||copy.ar;const [board,setBoard]=useState(start);const [score,setScore]=useState(0);const [best,setBest]=useState(0);const [moves,setMoves]=useState(0);const [won,setWon]=useState(false);const [over,setOver]=useState(false);const [keep,setKeep]=useState(false);const [history,setHistory]=useState([]);const touch=useRef(null);
 const reset=()=>{setBoard(start());setScore(0);setMoves(0);setWon(false);setOver(false);setKeep(false);setHistory([]);};
 const play=useCallback(direction=>{
  if(over||won&&!keep)return;
  const result=move(board,direction);if(!result.changed)return;
  setHistory(h=>[...h.slice(-19),{board,score,moves,won,over}]);
  const next=spawn(result.board);setBoard(next);setScore(s=>s+result.gained);setBest(b=>Math.max(b,score+result.gained));setMoves(m=>m+1);
  if(!won&&next.some(row=>row.includes(1024)))setWon(true);
  if(!hasMoves(next))setOver(true);
 },[board,score,moves,won,over,keep]);
 useEffect(()=>{const handler=e=>{const map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(map[e.key]){e.preventDefault();play(map[e.key]);}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[play]);
 const undo=()=>{const previous=history.at(-1);if(!previous)return;setBoard(previous.board);setScore(previous.score);setMoves(previous.moves);setWon(previous.won);setOver(previous.over);setHistory(h=>h.slice(0,-1));};
 const touchStart=e=>{const p=e.touches[0];touch.current=[p.clientX,p.clientY];};
 const touchEnd=e=>{if(!touch.current)return;const p=e.changedTouches[0],dx=p.clientX-touch.current[0],dy=p.clientY-touch.current[1];touch.current=null;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;play(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');};
 return <section className="number-game" dir={lang==='ar'?'rtl':'ltr'}>
  <header className="number-head"><div><span className="number-kicker">THIMAR OSMAR · PUZZLE STUDIO</span><h1>🔢 {t.title}</h1><p>{t.sub}</p></div><button onClick={onBack}>{t.back}</button></header>
  <div className="number-scorebar"><div><small>{t.score}</small><strong>{score}</strong></div><div><small>{t.best}</small><strong>{best}</strong></div><div><small>{t.moves}</small><strong>{moves}</strong></div></div>
  <div className="number-board" onTouchStart={touchStart} onTouchEnd={touchEnd}>{board.map((row,r)=><div className="number-row" key={r}>{row.map((value,c)=><div className={'number-cell '+(value?'filled n-'+Math.min(value,2048):'')} key={c}>{value||''}</div>)}</div>)}
   {(over||(won&&!keep))&&<div className="number-overlay"><h2>{over?t.over:t.won}</h2>{won&&!over&&!keep&&<button onClick={()=>setKeep(true)}>{t.keep}</button>}<button onClick={reset}>{t.new}</button></div>}
  </div>
  <div className="number-controls"><button onClick={undo} disabled={!history.length}>{t.undo}</button><button onClick={reset}>{t.new}</button></div>
  <p className="number-rules">{t.rules}</p>
  <div className="number-dpad"><button onClick={()=>play('up')}>↑</button><div><button onClick={()=>play('left')}>←</button><button onClick={()=>play('down')}>↓</button><button onClick={()=>play('right')}>→</button></div></div>
 </section>;
}
