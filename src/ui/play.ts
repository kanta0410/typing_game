import { applyCaretTheme, loadSettings } from "../engine/settings";
import { QuoteTypingGame } from "../engine/quote-game";
import type { SessionStats } from "../engine/stats";

function formatRemain(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function paintRomaji(romaji: string, typed: number): string {
  const done = romaji.slice(0, typed);
  const rest = romaji.slice(typed);
  const next = rest.slice(0, 1);
  const after = rest.slice(1);
  return `<span class="done">${escapeHtml(done)}</span><span class="caret">${escapeHtml(next)}</span><span class="rest">${escapeHtml(after)}</span>`;
}

function paintFurigana(
  furi: string,
  doneEnd: number,
  caretStart: number,
  caretEnd: number,
): string {
  const chars = [...furi];
  let html = "";
  for (let i = 0; i < chars.length; i++) {
    const ch = escapeHtml(chars[i]);
    if (i < doneEnd) html += `<span class="done">${ch}</span>`;
    else if (i >= caretStart && i < caretEnd)
      html += `<span class="caret">${ch}</span>`;
    else html += `<span class="rest">${ch}</span>`;
  }
  return html;
}

/** 漢字本文：比率で進捗。いまの1文字を大きく強調 */
function paintQuote(text: string, ratio: number): string {
  const chars = [...text];
  if (chars.length === 0) return "";
  const doneCount = Math.min(
    chars.length,
    Math.floor(chars.length * ratio + 1e-9),
  );
  // 完了直後は次の文字を caret。全文完了時は最後を done のまま
  const caretIndex = doneCount >= chars.length ? -1 : doneCount;
  let html = "";
  for (let i = 0; i < chars.length; i++) {
    const ch = escapeHtml(chars[i]);
    if (i < (caretIndex < 0 ? chars.length : caretIndex)) {
      html += `<span class="done">${ch}</span>`;
    } else if (i === caretIndex) {
      html += `<span class="caret quote-caret">${ch}</span>`;
    } else {
      html += `<span class="rest">${ch}</span>`;
    }
  }
  return html;
}

export function renderPlay(
  root: HTMLElement,
  onFinished: (stats: SessionStats) => void,
): void {
  applyCaretTheme(loadSettings().caretTheme);
  const game = new QuoteTypingGame();

  root.innerHTML = `
    <div class="brand">Quote Typing</div>
    <p class="warn">IME オフ・半角ローマ字。漢字を見ながら打て</p>
    <div class="panel play-panel">
      <div class="author" id="author"></div>
      <div class="furigana furigana-above" id="furigana"></div>
      <div class="quote-text" id="quote"></div>
      <div class="romaji romaji-line" id="romaji"></div>
      <div class="meta">
        <div><strong id="time">1:00</strong><span>残り</span></div>
        <div><strong id="correct">0</strong><span>文字</span></div>
        <div><strong id="misses">0</strong><span>ミス</span></div>
        <div><strong id="quotes">0</strong><span>名言</span></div>
      </div>
    </div>
  `;

  const authorEl = root.querySelector("#author")!;
  const quoteEl = root.querySelector("#quote")!;
  const furiEl = root.querySelector("#furigana")!;
  const romajiEl = root.querySelector("#romaji")!;
  const timeEl = root.querySelector("#time")!;
  const correctEl = root.querySelector("#correct")!;
  const missesEl = root.querySelector("#misses")!;
  const quotesEl = root.querySelector("#quotes")!;

  const unsub = game.subscribe((snap) => {
    authorEl.textContent = snap.quote.author;
    quoteEl.innerHTML = paintQuote(snap.quote.textJa, snap.quoteRatio);
    furiEl.innerHTML = paintFurigana(
      snap.furigana,
      snap.furiDoneEnd,
      snap.furiCaretStart,
      snap.furiCaretEnd,
    );
    romajiEl.innerHTML = paintRomaji(snap.romaji, snap.typed);
    timeEl.textContent = formatRemain(snap.remainingMs);
    correctEl.textContent = String(snap.correct);
    missesEl.textContent = String(snap.misses);
    quotesEl.textContent = String(snap.quotesDone);
  });

  const onKey = (e: KeyboardEvent) => {
    if (e.isComposing || e.key === "Process") return;
    if (e.key.length !== 1) return;
    e.preventDefault();
    game.handleKey(e.key);
  };

  game.setOnFinished((stats) => {
    window.removeEventListener("keydown", onKey);
    unsub();
    onFinished(stats);
  });

  window.addEventListener("keydown", onKey);
  game.start();
}
