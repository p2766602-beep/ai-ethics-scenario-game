'use client';

import { useEffect, useMemo, useState } from 'react';
import { cardsForDeck, deckLabels, generalPrompts, type DeckId, type ScenarioCard } from './cards';

type ModeId = 'same' | 'random' | 'assigned' | 'choice';
type View = 'setup' | 'choice' | 'play' | 'summary';

const modes: { id: ModeId; icon: string; title: string; note: string; best: string }[] = [
  { id: 'same', icon: '◎', title: '大家一起想同一題', note: '和其他小組探索相同情境', best: '一起暖身' },
  { id: 'random', icon: '⤨', title: '每組探索不同題', note: '依組號優先取得不同情境', best: '推薦玩法' },
  { id: 'assigned', icon: '⌁', title: '老師指定給我們', note: '一起聚焦這回合的主題', best: '聚焦主題' },
  { id: 'choice', icon: '◇', title: '我們自己三選一', note: '小組共同決定想討論的題目', best: '自己決定' },
];

const perspectiveOptions = ['想到不同角色', '檢查 AI 產出', '注意隱私風險', '發現公平問題', '釐清責任歸屬', '提出改善做法'];

function hashCode(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return hash;
}

function assignedCard(deck: ScenarioCard[], code: string, group: number, offset = 0) {
  const base = hashCode(code || '2026');
  return deck[(base + Math.max(0, group - 1) + offset) % deck.length];
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function Home() {
  const [view, setView] = useState<View>('setup');
  const [deckId, setDeckId] = useState<DeckId>('teacher');
  const [mode, setMode] = useState<ModeId>('random');
  const [activityCode, setActivityCode] = useState('2026');
  const [groupNumber, setGroupNumber] = useState(1);
  const [groupTotal, setGroupTotal] = useState(6);
  const [duration, setDuration] = useState(4);
  const [teacherCardId, setTeacherCardId] = useState('T2');
  const [currentCard, setCurrentCard] = useState<ScenarioCard | null>(null);
  const [offeredCards, setOfferedCards] = useState<ScenarioCard[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(240);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState({ initial: '', changed: '', difference: '', action: '' });
  const [perspectives, setPerspectives] = useState<string[]>([]);
  const [round, setRound] = useState(1);

  const deck = useMemo(() => cardsForDeck(deckId), [deckId]);
  const prompts = currentCard?.prompts ?? generalPrompts;

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  function resetRound(card: ScenarioCard) {
    setCurrentCard(card);
    setFlipped(false);
    setSecondsLeft(duration * 60);
    setRunning(false);
    setNotes({ initial: '', changed: '', difference: '', action: '' });
    setPerspectives([]);
    setView('play');
  }

  function startActivity() {
    if (mode === 'choice') {
      const first = assignedCard(deck, activityCode, groupNumber, round - 1);
      const indexes = [deck.indexOf(first), (deck.indexOf(first) + Math.ceil(deck.length / 3)) % deck.length, (deck.indexOf(first) + Math.ceil((deck.length * 2) / 3)) % deck.length];
      setOfferedCards(indexes.map((index) => deck[index]).filter((card, index, list) => list.findIndex((item) => item.id === card.id) === index));
      setView('choice');
      return;
    }
    if (mode === 'assigned') {
      resetRound(deck.find((card) => card.id === teacherCardId) ?? deck[0]);
      return;
    }
    resetRound(assignedCard(deck, activityCode, mode === 'same' ? 1 : groupNumber, round - 1));
  }

  function nextRound() {
    setRound((value) => value + 1);
    setView('setup');
    setFlipped(false);
  }

  function togglePerspective(item: string) {
    setPerspectives((items) => items.includes(item) ? items.filter((value) => value !== item) : [...items, item]);
  }

  function downloadSummary() {
    if (!currentCard) return;
    const content = [
      `思辨島｜第 ${round} 回合討論紀錄`, `活動代碼：${activityCode}　組別：第 ${groupNumber} 組`,
      `情境：${currentCard.id} ${currentCard.title}`, `核心提問：${currentCard.question}`, '',
      `初步看法：${notes.initial || '未填寫'}`, `想法改變：${notes.changed || '未填寫'}`,
      `最大分歧：${notes.difference || '未填寫'}`, `建議做法：${notes.action || '未填寫'}`,
      `運用觀點：${perspectives.join('、') || '未勾選'}`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `思辨島_${currentCard.id}_第${groupNumber}組.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <button className="brand brand-button" onClick={() => setView('setup')} aria-label="回到活動首頁">
          <span className="brand-mark">AI</span><span><strong>思辨島</strong><small>AI 倫理情境桌遊</small></span>
        </button>
        <div className="top-actions">
          {view !== 'setup' && <span className="session-pill">活動 {activityCode}・第 {groupNumber} 組</span>}
          <span className="privacy-pill">不需登入・不蒐集姓名</span>
          <button className="icon-button" aria-label="玩法說明" title="3–4 人一組，以口說討論為主">?</button>
        </div>
      </header>

      {view === 'setup' && (
        <>
          <section className="intro">
            <div><span className="eyebrow">小組出發前・一起準備</span><h1>讓每一組，都說出不一樣的理由。</h1><p>和全班使用同一個活動代碼，再填入你們的組號，系統就會準備這一組的情境卡。每個人的聲音都值得被聽見。</p></div>
            <div className="round-map" aria-label="建議活動流程"><span className="round active"><b>1</b>同題示範</span><i /><span className="round"><b>2</b>隨機探索</span><i /><span className="round"><b>3</b>自主選題</span></div>
          </section>

          <section className="setup-workspace">
            <div className="setup-main">
              <div className="section-title"><span>01</span><div><small>選題方式</small><h2>我們想怎麼取得題目？</h2></div></div>
              <div className="mode-grid">
                {modes.map((item) => (
                  <button key={item.id} className={`mode-card ${mode === item.id ? 'selected' : ''}`} onClick={() => setMode(item.id)}>
                    <span className="mode-icon">{item.icon}</span><span className="mode-best">{item.best}</span>
                    <strong>{item.title}</strong><small>{item.note}</small><span className="radio" />
                  </button>
                ))}
              </div>

              <div className="section-title second"><span>02</span><div><small>小組資料</small><h2>告訴系統我們是哪一組</h2></div></div>
              <div className="fields-grid">
                <label><span>我們使用的牌組</span><select value={deckId} onChange={(event) => { const id = event.target.value as DeckId; setDeckId(id); setTeacherCardId(cardsForDeck(id)[0].id); }}><option value="teacher">教師體驗版・6 張</option><option value="junior">國中版・10 張</option><option value="elementary">國小版・8 張</option></select></label>
                <label><span>全班共同代碼</span><input value={activityCode} maxLength={8} onChange={(event) => setActivityCode(event.target.value.replace(/\s/g, ''))} /><small>每一組輸入相同代碼</small></label>
                <label><span>我們是第幾組？</span><input type="number" min="1" max={groupTotal} value={groupNumber} onChange={(event) => setGroupNumber(Math.max(1, Number(event.target.value)))} /></label>
                <label><span>班上共有幾組？</span><input type="number" min="1" max="30" value={groupTotal} onChange={(event) => setGroupTotal(Math.max(1, Number(event.target.value)))} /></label>
                <label><span>我們想討論多久？</span><select value={duration} onChange={(event) => setDuration(Number(event.target.value))}><option value="3">3 分鐘</option><option value="4">4 分鐘</option><option value="5">5 分鐘</option><option value="6">6 分鐘</option><option value="8">8 分鐘</option></select></label>
                {mode === 'assigned' && <label><span>老師指定的情境</span><select value={teacherCardId} onChange={(event) => setTeacherCardId(event.target.value)}>{deck.map((card) => <option key={card.id} value={card.id}>{card.id}・{card.title}</option>)}</select></label>}
              </div>
            </div>

            <aside className="launch-panel">
              <span className="launch-label">我們的活動</span><div className="mini-deck"><i /><i /><i /><b>{deck.length}</b></div>
              <h2>{deckLabels[deckId]}</h2><p>{modes.find((item) => item.id === mode)?.title}・第 {groupNumber} 組</p>
              <ul><li>3–4 人圍成一組</li><li>每個人先想，再輪流說</li><li>只留下小組想法，不寫姓名</li></ul>
              {groupTotal > deck.length && mode === 'random' && <div className="notice">小組數比卡片多，有些組可能遇到相同情境。分享時，我們可以比較彼此的想法。</div>}
              <button className="primary-button" onClick={startActivity}>領取第 {round} 回合情境 <span>→</span></button>
            </aside>
          </section>
        </>
      )}

      {view === 'choice' && (
        <section className="choice-screen">
          <span className="eyebrow">我們自己三選一・第 {groupNumber} 組</span><h1>一起選一張，我們真正想討論的卡。</h1><p>先看看三個標題，再輪流說說自己想選哪一張，以及為什麼。</p>
          <div className="choice-grid">{offeredCards.map((card, index) => <button key={card.id} className="choice-card" onClick={() => resetRound(card)}><span>選項 {index + 1}</span><b>{card.id}</b><h2>{card.title}</h2><div><em>{card.level}</em>{card.ethics.slice(0, 1).map((tag) => <i key={tag}>{tag}</i>)}</div><strong>我們就選這張 →</strong></button>)}</div>
          <button className="text-button" onClick={() => setView('setup')}>← 返回設定</button>
        </section>
      )}

      {view === 'play' && currentCard && (
        <section className="play-layout">
          <aside className="play-sidebar">
            <span className="eyebrow">第 {String(round).padStart(2, '0')} 回合</span><h2>我們這回合要完成</h2>
            <ol><li><b>1</b><span>每個人先說出自己的想法</span></li><li><b>2</b><span>聽聽彼此哪裡想得不一樣</span></li><li><b>3</b><span>一起提出兼顧不同角色的做法</span></li></ol>
            <div className={`live-timer ${secondsLeft === 0 ? 'done' : ''}`}><span>留給我們的討論時間</span><strong>{formatTime(secondsLeft)}</strong><button onClick={() => setRunning((value) => !value)}>{secondsLeft === 0 ? '時間到' : running ? '先暫停' : '開始倒數'}</button></div>
            <button className="text-button" onClick={() => setView('setup')}>← 回到設定</button>
          </aside>

          <section className="game-stage live-stage">
            <div className="stage-top"><span className="stage-kicker">{deckLabels[currentCard.deck]}・{currentCard.level}</span><span className="card-count">{currentCard.id}</span></div>
            <article className="scenario-card">
              {!flipped ? <div className="card-face"><div className="card-meta"><span>我們的 AI 倫理情境</span><span>先說想法，不急著找答案</span></div><div className="scenario-number">{currentCard.id.replace(/\D/g, '').padStart(2, '0')}</div><h2>{currentCard.title}</h2><p>{currentCard.situation}</p><div className="question-box"><small>一起想一想</small><strong>{currentCard.question}</strong></div></div>
              : <div className="card-face guide-face"><div className="card-meta"><span>幫助我們想得更完整</span><span>沒有唯一的標準答案</span></div><h2>聽完彼此，再換一個角度想。</h2><ol>{prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ol><div className="tag-row">{currentCard.ethics.map((tag) => <span key={tag}>{tag}</span>)}</div></div>}
            </article>
            <button className="flip-button" onClick={() => setFlipped((value) => !value)}><span>{flipped ? '↶' : '↻'}</span>{flipped ? '回到情境' : '翻開引導觀點'}</button>
          </section>

          <aside className="record-panel">
            <div className="section-title small"><span>✎</span><div><small>想法紀錄</small><h2>留下想法改變的瞬間</h2></div></div>
            <label><span>一開始，我們怎麼想？</span><textarea value={notes.initial} onChange={(event) => setNotes({ ...notes, initial: event.target.value })} placeholder="用一句話寫下來…" /></label>
            <label><span>聽完彼此後，我們改變了什麼？</span><textarea value={notes.changed} onChange={(event) => setNotes({ ...notes, changed: event.target.value })} placeholder="我們開始注意到…" /></label>
            <label><span>我們還有哪些不同看法？</span><textarea value={notes.difference} onChange={(event) => setNotes({ ...notes, difference: event.target.value })} placeholder="我們還沒有共識的是…" /></label>
            <label><span>我們共同提出的做法</span><textarea value={notes.action} onChange={(event) => setNotes({ ...notes, action: event.target.value })} placeholder="我們想試試看…" /></label>
            <button className="primary-button" onClick={() => setView('summary')}>整理我們的討論 <span>→</span></button>
          </aside>
        </section>
      )}

      {view === 'summary' && currentCard && (
        <section className="summary-screen">
          <div className="summary-heading"><span className="eyebrow">我們的第 {round} 回合討論</span><h1>想法可以不同，每個理由都值得被看見。</h1><p>{currentCard.id}・{currentCard.title}</p></div>
          <div className="summary-grid">
            <div className="perspective-card"><h2>我們剛剛用了哪些思考方法？</h2><p>回想剛才的對話，勾選真正出現過的思考，不需要每一項都選。</p><div className="perspective-grid">{perspectiveOptions.map((item) => <button key={item} className={perspectives.includes(item) ? 'checked' : ''} onClick={() => togglePerspective(item)}><span>{perspectives.includes(item) ? '✓' : '+'}</span>{item}</button>)}</div><div className="thinking-score"><strong>{perspectives.length}</strong><span>個思考角度<br />被我們看見</span></div></div>
            <div className="report-card"><div className="report-top"><span>我們是第 {groupNumber} 組</span><b>{currentCard.id}</b></div><h2>{currentCard.title}</h2><dl><div><dt>我們還有不同看法的地方</dt><dd>{notes.difference || '我們還沒記錄這個部分。'}</dd></div><div><dt>我們想採取的做法</dt><dd>{notes.action || '我們還沒記錄這個部分。'}</dd></div></dl><div className="tag-row">{currentCard.ethics.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
          </div>
          <div className="summary-actions"><button className="secondary-button" onClick={downloadSummary}>帶走我們的討論紀錄</button><button className="primary-button" onClick={nextRound}>再探索一個情境 <span>→</span></button></div>
        </section>
      )}
    </main>
  );
}
