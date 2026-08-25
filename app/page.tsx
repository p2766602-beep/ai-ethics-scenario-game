'use client';

import { useEffect, useMemo, useState } from 'react';
import { cardsForDeck, deckLabels, generalPrompts, type DeckId, type ScenarioCard } from './cards';

type ModeId = 'same' | 'random' | 'assigned' | 'choice';
type View = 'setup' | 'choice' | 'play' | 'summary';

const modes: { id: ModeId; icon: string; title: string; note: string; best: string }[] = [
  { id: 'same', icon: '◎', title: '全班同一題', note: '所有組別取得相同情境', best: '首回合示範' },
  { id: 'random', icon: '⤨', title: '各組隨機題', note: '依組號優先分配不重複題目', best: '預設推薦' },
  { id: 'assigned', icon: '⌁', title: '教師指定題', note: '精準控制主題與難度', best: '目標教學' },
  { id: 'choice', icon: '◇', title: '學生三選一', note: '小組從三張題目共同選擇', best: '自主探索' },
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
        <button className="brand brand-button" onClick={() => setView('setup')} aria-label="回到活動設定">
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
            <div><span className="eyebrow">教師模式・活動設定</span><h1>讓每一組，都說出不一樣的理由。</h1><p>口說討論為主，數位紀錄為輔。輸入相同活動代碼與組號，就能在不登入的情況下分配題目。</p></div>
            <div className="round-map" aria-label="建議活動流程"><span className="round active"><b>1</b>同題示範</span><i /><span className="round"><b>2</b>隨機探索</span><i /><span className="round"><b>3</b>自主選題</span></div>
          </section>

          <section className="setup-workspace">
            <div className="setup-main">
              <div className="section-title"><span>01</span><div><small>ASSIGNMENT</small><h2>選擇派題方式</h2></div></div>
              <div className="mode-grid">
                {modes.map((item) => (
                  <button key={item.id} className={`mode-card ${mode === item.id ? 'selected' : ''}`} onClick={() => setMode(item.id)}>
                    <span className="mode-icon">{item.icon}</span><span className="mode-best">{item.best}</span>
                    <strong>{item.title}</strong><small>{item.note}</small><span className="radio" />
                  </button>
                ))}
              </div>

              <div className="section-title second"><span>02</span><div><small>GROUP</small><h2>設定牌組與組別</h2></div></div>
              <div className="fields-grid">
                <label><span>使用牌組</span><select value={deckId} onChange={(event) => { const id = event.target.value as DeckId; setDeckId(id); setTeacherCardId(cardsForDeck(id)[0].id); }}><option value="teacher">教師體驗版・6 張</option><option value="junior">國中版・10 張</option><option value="elementary">國小版・8 張</option></select></label>
                <label><span>活動代碼</span><input value={activityCode} maxLength={8} onChange={(event) => setActivityCode(event.target.value.replace(/\s/g, ''))} /><small>全班輸入相同代碼</small></label>
                <label><span>我的組號</span><input type="number" min="1" max={groupTotal} value={groupNumber} onChange={(event) => setGroupNumber(Math.max(1, Number(event.target.value)))} /></label>
                <label><span>全班組數</span><input type="number" min="1" max="30" value={groupTotal} onChange={(event) => setGroupTotal(Math.max(1, Number(event.target.value)))} /></label>
                <label><span>討論時間</span><select value={duration} onChange={(event) => setDuration(Number(event.target.value))}><option value="3">3 分鐘</option><option value="4">4 分鐘</option><option value="5">5 分鐘</option><option value="6">6 分鐘</option><option value="8">8 分鐘</option></select></label>
                {mode === 'assigned' && <label><span>教師指定情境</span><select value={teacherCardId} onChange={(event) => setTeacherCardId(event.target.value)}>{deck.map((card) => <option key={card.id} value={card.id}>{card.id}・{card.title}</option>)}</select></label>}
              </div>
            </div>

            <aside className="launch-panel">
              <span className="launch-label">本次設定</span><div className="mini-deck"><i /><i /><i /><b>{deck.length}</b></div>
              <h2>{deckLabels[deckId]}</h2><p>{modes.find((item) => item.id === mode)?.title}・第 {groupNumber} 組</p>
              <ul><li>3–4 人一組</li><li>先想，再輪流口說</li><li>只記錄摘要，不輸入姓名</li></ul>
              {groupTotal > deck.length && mode === 'random' && <div className="notice">全班組數多於牌數，部分題目會重複，可用來比較不同組的觀點。</div>}
              <button className="primary-button" onClick={startActivity}>開始第 {round} 回合 <span>→</span></button>
            </aside>
          </section>
        </>
      )}

      {view === 'choice' && (
        <section className="choice-screen">
          <span className="eyebrow">學生三選一・第 {groupNumber} 組</span><h1>先看標題，選一張最想討論的卡。</h1><p>不要急著選最簡單的。說說看：為什麼這個情境值得我們花時間討論？</p>
          <div className="choice-grid">{offeredCards.map((card, index) => <button key={card.id} className="choice-card" onClick={() => resetRound(card)}><span>選項 {index + 1}</span><b>{card.id}</b><h2>{card.title}</h2><div><em>{card.level}</em>{card.ethics.slice(0, 1).map((tag) => <i key={tag}>{tag}</i>)}</div><strong>選擇這張卡 →</strong></button>)}</div>
          <button className="text-button" onClick={() => setView('setup')}>← 返回設定</button>
        </section>
      )}

      {view === 'play' && currentCard && (
        <section className="play-layout">
          <aside className="play-sidebar">
            <span className="eyebrow">ROUND {String(round).padStart(2, '0')}</span><h2>小組口說任務</h2>
            <ol><li><b>1</b><span>每人先說出初步判斷</span></li><li><b>2</b><span>找出組內最大的分歧</span></li><li><b>3</b><span>提出兼顧不同角色的做法</span></li></ol>
            <div className={`live-timer ${secondsLeft === 0 ? 'done' : ''}`}><span>討論時間</span><strong>{formatTime(secondsLeft)}</strong><button onClick={() => setRunning((value) => !value)}>{secondsLeft === 0 ? '時間到' : running ? '暫停' : '開始計時'}</button></div>
            <button className="text-button" onClick={() => setView('setup')}>← 回到設定</button>
          </aside>

          <section className="game-stage live-stage">
            <div className="stage-top"><span className="stage-kicker">{deckLabels[currentCard.deck]}・{currentCard.level}</span><span className="card-count">{currentCard.id}</span></div>
            <article className="scenario-card">
              {!flipped ? <div className="card-face"><div className="card-meta"><span>AI 倫理情境</span><span>先別急著找答案</span></div><div className="scenario-number">{currentCard.id.replace(/\D/g, '').padStart(2, '0')}</div><h2>{currentCard.title}</h2><p>{currentCard.situation}</p><div className="question-box"><small>核心提問</small><strong>{currentCard.question}</strong></div></div>
              : <div className="card-face guide-face"><div className="card-meta"><span>引導觀點</span><span>不是標準答案</span></div><h2>換一個角度，再想一次。</h2><ol>{prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ol><div className="tag-row">{currentCard.ethics.map((tag) => <span key={tag}>{tag}</span>)}</div></div>}
            </article>
            <button className="flip-button" onClick={() => setFlipped((value) => !value)}><span>{flipped ? '↶' : '↻'}</span>{flipped ? '回到情境' : '翻開引導觀點'}</button>
          </section>

          <aside className="record-panel">
            <div className="section-title small"><span>✎</span><div><small>GROUP NOTES</small><h2>只記錄關鍵轉折</h2></div></div>
            <label><span>我們原本的看法</span><textarea value={notes.initial} onChange={(event) => setNotes({ ...notes, initial: event.target.value })} placeholder="一句話即可…" /></label>
            <label><span>聽完彼此後，改變了什麼？</span><textarea value={notes.changed} onChange={(event) => setNotes({ ...notes, changed: event.target.value })} placeholder="可以寫：沒有改變，但…" /></label>
            <label><span>組內最大的分歧</span><textarea value={notes.difference} onChange={(event) => setNotes({ ...notes, difference: event.target.value })} placeholder="我們不同意的地方是…" /></label>
            <label><span>我們建議的做法</span><textarea value={notes.action} onChange={(event) => setNotes({ ...notes, action: event.target.value })} placeholder="兼顧不同角色的做法…" /></label>
            <button className="primary-button" onClick={() => setView('summary')}>完成本回合 <span>→</span></button>
          </aside>
        </section>
      )}

      {view === 'summary' && currentCard && (
        <section className="summary-screen">
          <div className="summary-heading"><span className="eyebrow">第 {round} 回合・討論統整</span><h1>答案可以不同，理由要看得見。</h1><p>{currentCard.id}・{currentCard.title}</p></div>
          <div className="summary-grid">
            <div className="perspective-card"><h2>這回合，我們用到了哪些觀點？</h2><p>不是計分測驗，請勾選討論中真正出現過的思考。</p><div className="perspective-grid">{perspectiveOptions.map((item) => <button key={item} className={perspectives.includes(item) ? 'checked' : ''} onClick={() => togglePerspective(item)}><span>{perspectives.includes(item) ? '✓' : '+'}</span>{item}</button>)}</div><div className="thinking-score"><strong>{perspectives.length}</strong><span>個思辨視角<br />已經被看見</span></div></div>
            <div className="report-card"><div className="report-top"><span>第 {groupNumber} 組分享小卡</span><b>{currentCard.id}</b></div><h2>{currentCard.title}</h2><dl><div><dt>最大的分歧</dt><dd>{notes.difference || '我們還沒記錄這個部分。'}</dd></div><div><dt>討論後的建議</dt><dd>{notes.action || '我們還沒記錄這個部分。'}</dd></div></dl><div className="tag-row">{currentCard.ethics.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
          </div>
          <div className="summary-actions"><button className="secondary-button" onClick={downloadSummary}>下載討論紀錄</button><button className="primary-button" onClick={nextRound}>進入下一回合 <span>→</span></button></div>
        </section>
      )}
    </main>
  );
}
