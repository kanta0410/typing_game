import { TypingGame } from "../engine/game";
import type { SessionStats } from "../engine/stats";

function formatRemain(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function paintRomaji(hint: string, buffer: string): string {
  const done = hint.slice(0, buffer.length);
  const rest = hint.slice(buffer.length);
  return `<span class="done">${done}</span><span class="rest">${rest}</span>`;
}

export function renderPlay(
  root: HTMLElement,
  onFinished: (stats: SessionStats) => void,
): void {
  const game = new TypingGame();

  root.innerHTML = `
    <div class="brand">Playing</div>
    <p class="warn">IME オフ・半角英字で入力</p>
    <div class="panel">
      <div class="kana" id="kana">あ</div>
      <div class="romaji" id="romaji"></div>
      <div class="meta">
        <div><strong id="time">1:00</strong><span>残り</span></div>
        <div><strong id="correct">0</strong><span>正解</span></div>
        <div><strong id="misses">0</strong><span>ミス</span></div>
      </div>
    </div>
  `;

  const kanaEl = root.querySelector("#kana")!;
  const romajiEl = root.querySelector("#romaji")!;
  const timeEl = root.querySelector("#time")!;
  const correctEl = root.querySelector("#correct")!;
  const missesEl = root.querySelector("#misses")!;

  const unsub = game.subscribe((snap) => {
    kanaEl.textContent = snap.kana;
    romajiEl.innerHTML = paintRomaji(snap.hint, snap.buffer);
    timeEl.textContent = formatRemain(snap.remainingMs);
    correctEl.textContent = String(snap.correct);
    missesEl.textContent = String(snap.misses);
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
