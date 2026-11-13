import { useEffect, useMemo, useState } from 'react';

const labels = {
  ar: { title:'الدومينو', subtitle:'جولة عائلية ضد الكمبيوتر · مجموعة مزدوجة من 6', you:'أنت', cpu:'الكمبيوتر', hand:'قطعك', left:'الطرف الأيسر', right:'الطرف الأيمن', play:'العب القطعة', draw:'اسحب قطعة', pass:'تخطي الدور', restart:'لعبة جديدة', choose:'القطعة تصلح للطرفين. اختار مكانها:', chooseLeft:'الطرف الأيسر', chooseRight:'الطرف الأيمن', yourTurn:'دورك الآن', cpuTurn:'الكمبيوتر بيفكر…', won:'مبروك! كسبت الجولة 🎉', lost:'الكمبيوتر كسب الجولة. حظ أوفر!', blocked:'الجولة مقفولة؛ الفائز صاحب أقل مجموع نقاط.', drawNeeded:'مفيش قطعة مناسبة. اسحب من السحب أو تخطى لو السحب خلص.', remaining:'المتبقي', pip:'مجموع النقط', back:'العودة للألعاب', rules:'العب قطعة تطابق أحد طرفي السلسلة. لو مفيش، اسحب قطعة. أول لاعب يخلص قطعه يفوز؛ ولو اللعب اتقفل، الأقل في مجموع النقط يفوز.', start:'ابدأ الجولة', invalid:'القطعة دي مش مناسبة للطرفين.' },
  en: { title:'Dominoes', subtitle:'Family round vs computer · Double-six set', you:'You', cpu:'Computer', hand:'Your tiles', left:'Left end', right:'Right end', play:'Play tile', draw:'Draw tile', pass:'Pass turn', restart:'New game', choose:'This tile fits both ends. Choose where to place it:', chooseLeft:'Left end', chooseRight:'Right end', yourTurn:'Your turn', cpuTurn:'Computer thinking…', won:'You won the round! 🎉', lost:'Computer won. Better luck next time!', blocked:'The round is blocked; the player with fewer pips wins.', drawNeeded:'No playable tile. Draw, or pass if the pile is empty.', remaining:'Remaining', pip:'Pip total', back:'Back to games', rules:'Match one end of a tile to either open end. If you cannot play, draw. First to empty their hand wins; if blocked, the lowest pip total wins.', start:'Start round', invalid:'That tile does not match either end.' },
  zh: { title:'多米诺骨牌', subtitle:'与电脑进行家庭对局 · 双六牌组', you:'你', cpu:'电脑', hand:'你的牌', left:'左端', right:'右端', play:'出牌', draw:'摸一张', pass:'跳过回合', restart:'新游戏', choose:'这张牌两端都能连接，请选择：', chooseLeft:'左端', chooseRight:'右端', yourTurn:'轮到你了', cpuTurn:'电脑思考中…', won:'恭喜，你赢了！🎉', lost:'电脑获胜，再接再厉！', blocked:'牌局被堵住；点数较少者获胜。', drawNeeded:'没有可出的牌。请摸牌；牌堆为空时可以跳过。', remaining:'剩余', pip:'点数总和', back:'返回游戏', rules:'将牌的一端与牌链任一开放端匹配。无法出牌时摸牌。先出完手牌者获胜；若无法继续，点数较少者获胜。', start:'开始本局', invalid:'这张牌与两端都不匹配。' }
};

const makeDeck = () => {
  const deck = [];
  for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) deck.push({ id: a + '-' + b + '-' + deck.length, a, b });
  return deck;
};
const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
};
const pips = (hand) => hand.reduce((sum, tile) => sum + tile.a + tile.b, 0);
const ends = (board) => board.length ? [board[0].a, board[board.length - 1].b] : null;

function PipFace({ value }) {
  const spots = {
    0: [], 1: [[2,2]], 2: [[1,1],[3,3]], 3: [[1,1],[2,2],[3,3]],
    4: [[1,1],[1,3],[3,1],[3,3]], 5: [[1,1],[1,3],[2,2],[3,1],[3,3]],
    6: [[1,1],[1,2],[1,3],[3,1],[3,2],[3,3]]
  };
  return <span className="domino-face">{spots[value].map(([x,y],i)=><i key={i} style={{gridColumn:x,gridRow:y}} />)}</span>;
}

export default function DominoGame({ lang='ar', onBack }) {
  const t = labels[lang] || labels.ar;
  const [round, setRound] = useState(0);
  const [player, setPlayer] = useState([]);
  const [computer, setComputer] = useState([]);
  const [pile, setPile] = useState([]);
  const [board, setBoard] = useState([]);
  const [turn, setTurn] = useState('player');
  const [message, setMessage] = useState('');
  const [winner, setWinner] = useState('');
  const [choice, setChoice] = useState(null);
  const [selected, setSelected] = useState(null);
  const [drawnThisTurn, setDrawnThisTurn] = useState(false);
  const [passes, setPasses] = useState(0);

  function startRound() {
    const deck = shuffle(makeDeck());
    setPlayer(deck.slice(0,7)); setComputer(deck.slice(7,14)); setPile(deck.slice(14));
    setBoard([]); setTurn('player'); setMessage(''); setWinner(''); setChoice(null); setSelected(null); setDrawnThisTurn(false); setPasses(0); setRound(v=>v+1);
  }
  useEffect(() => { if (!round) startRound(); }, []);
  const openEnds = useMemo(() => ends(board), [board]);
  const playable = (tile) => !board.length || tile.a === openEnds[0] || tile.b === openEnds[0] || tile.a === openEnds[1] || tile.b === openEnds[1];
  const movesFor = (tile) => {
    if (!board.length) return ['right'];
    const options=[];
    if (tile.a===openEnds[0] || tile.b===openEnds[0]) options.push('left');
    if (tile.a===openEnds[1] || tile.b===openEnds[1]) options.push('right');
    return options;
  };
  function placeTile(tile, side) {
    if (!playable(tile)) { setMessage(t.invalid); return; }
    let oriented={...tile};
    if (board.length && side==='left') {
      if (tile.b !== openEnds[0]) oriented={...tile,a:tile.b,b:tile.a};
    } else if (board.length && side==='right') {
      if (tile.a !== openEnds[1]) oriented={...tile,a:tile.b,b:tile.a};
    }
    setBoard(old => side==='left' ? [oriented,...old] : [...old,oriented]);
    setPlayer(old => old.filter(x=>x.id!==tile.id));
    setSelected(null); setChoice(null); setMessage(''); setDrawnThisTurn(false); setPasses(0);
    if (player.length===1) { setWinner('player'); setTurn('done'); return; }
    setTurn('computer');
  }
  function playSelected(tile) {
    const options=movesFor(tile);
    if (!options.length) { setMessage(t.invalid); return; }
    setSelected(tile.id);
    if (options.length===2 && board.length) setChoice({tile,options});
    else placeTile(tile,options[0]);
  }
  function drawTile() {
    if (!pile.length || drawnThisTurn || turn!=='player' || winner) return;
    const [next,...rest]=pile;
    setPile(rest); setPlayer(old=>[...old,next]); setDrawnThisTurn(true); setMessage(t.drawNeeded);
  }
  function passTurn() {
    if (turn!=='player' || winner) return;
    if (player.some(playable)) { setMessage(t.invalid); return; }
    if (pile.length) { setMessage(t.drawNeeded); return; }
    if (passes>=1) { finishBlocked(); return; }
    setPasses(v=>v+1); setTurn('computer'); setMessage('');
  }
  function finishBlocked() {
    const p=pips(player), c=pips(computer);
    setWinner(p===c?'draw':p<c?'player':'computer'); setTurn('done');
  }
  useEffect(() => {
    if (turn!=='computer' || winner) return;
    const timer=setTimeout(()=>{
      const options=computer.filter(playable);
      if (options.length) {
        const tile=options.sort((x,y)=>(y.a+y.b)-(x.a+x.b))[0];
        const sides=movesFor(tile); const side=sides.includes('right')?'right':sides[0];
        let oriented={...tile};
        if (board.length && side==='left' && tile.b!==openEnds[0]) oriented={...tile,a:tile.b,b:tile.a};
        if (board.length && side==='right' && tile.a!==openEnds[1]) oriented={...tile,a:tile.b,b:tile.a};
        setBoard(old=>side==='left'?[oriented,...old]:[...old,oriented]);
        setComputer(old=>old.filter(x=>x.id!==tile.id)); setTurn('player'); setDrawnThisTurn(false); setPasses(0);
        if (computer.length===1) { setWinner('computer'); setTurn('done'); }
      } else if (pile.length) {
        const [next,...rest]=pile; setPile(rest); setComputer(old=>[...old,next]); setTurn('player'); setMessage('');
      } else {
        if (passes>=1) finishBlocked();
        else { setPasses(v=>v+1); setTurn('player'); }
      }
    },650);
    return ()=>clearTimeout(timer);
  },[turn,winner,computer,pile,board,openEnds,passes]);
  const result = winner==='player'?t.won:winner==='computer'?t.lost:winner==='draw'?t.blocked:'';
  return <section className="domino-game" dir={lang==='ar'?'rtl':'ltr'}>
    <div className="domino-head"><div><span className="domino-kicker">FAMILY WORLD · THIMAR OSMAR</span><h1>🁣 {t.title}</h1><p>{t.subtitle}</p></div><button className="domino-back" onClick={onBack}>{t.back}</button></div>
    <p className="domino-rules">{t.rules}</p>
    <div className="domino-score"><div><b>🤖 {t.cpu}</b><strong>{computer.length}</strong><small>{t.remaining} · {pips(computer)} {t.pip}</small></div><div><b>🧑 {t.you}</b><strong>{player.length}</strong><small>{t.remaining} · {pips(player)} {t.pip}</small></div><div><b>🂠 {lang==='ar'?'السحب':lang==='zh'?'摸牌堆':'Draw pile'}</b><strong>{pile.length}</strong></div></div>
    <div className="domino-table"><div className="domino-opponent">{Array.from({length:computer.length},(_,i)=><span className="domino-backtile" key={i}>✦</span>)}</div>
      <div className="domino-chain" aria-label="Domino chain">{board.length?board.map((tile,i)=><div className="domino-tile board-tile" key={tile.id}><PipFace value={tile.a}/><PipFace value={tile.b}/></div>):<span className="domino-empty">{lang==='ar'?'ابدأ بوضع أي قطعة في المنتصف':lang==='zh'?'从中间放置任意一张牌':'Play any tile to start the chain'}</span>}</div>
      <div className="domino-ends">{openEnds?<span>{t.left}: <b>{openEnds[0]}</b>　·　{t.right}: <b>{openEnds[1]}</b></span>:<span>{t.start}</span>}</div>
    </div>
    {result && <div className="domino-result" role="status">{winner==='draw'?'🤝 ':''}{result}<button onClick={startRound}>{t.restart}</button></div>}
    <div className="domino-status">{turn==='player'?t.yourTurn:turn==='computer'?t.cpuTurn:result}</div>
    {choice && <div className="domino-choice"><b>{t.choose}</b><button onClick={()=>placeTile(choice.tile,'left')}>{t.chooseLeft}</button><button onClick={()=>placeTile(choice.tile,'right')}>{t.chooseRight}</button></div>}
    <h3 className="domino-hand-title">{t.hand}</h3>
    <div className="domino-hand">{player.map(tile=><button key={tile.id} className={`domino-tile hand-tile ${selected===tile.id?'chosen':''} ${playable(tile)?'is-playable':''}`} onClick={()=>playSelected(tile)} disabled={turn!=='player'||!!winner}><PipFace value={tile.a}/><PipFace value={tile.b}/></button>)}</div>
    <div className="domino-actions"><button onClick={drawTile} disabled={turn!=='player'||!!winner||!pile.length||drawnThisTurn}>{t.draw}</button><button onClick={passTurn} disabled={turn!=='player'||!!winner||player.some(playable)||pile.length>0}>{t.pass}</button><button onClick={startRound}>{t.restart}</button></div>
    {message && <p className="domino-message" role="status">{message}</p>}
  </section>;
}
