import {
  downloadSessionsBackup,
  sessionCount,
} from "../engine/storage";
import {
  summarizeSession,
  type SessionStats,
} from "../engine/stats";

function fmtMs(v: number | null): string {
  if (v == null) return "—";
  return `${Math.round(v)} ms`;
}

export function renderResult(
  root: HTMLElement,
  stats: SessionStats,
  onHome: () => void,
  onRetry: () => void,
): void {
  const s = summarizeSession(stats);
  const n = sessionCount();

  const charRows = s.slowChars
    .map(
      (c) => `
      <tr>
        <td>${c.kana}</td>
        <td>${c.count}</td>
        <td>${fmtMs(c.avgCvMs)}</td>
        <td class="tip">${c.tip}</td>
      </tr>`,
    )
    .join("");

  const pairRows = s.slowPairs
    .map(
      (p) => `
      <tr>
        <td>${p.from}→${p.to}</td>
        <td>${p.count}</td>
        <td>${fmtMs(p.avgGapMs)}</td>
        <td class="tip">${p.tip}</td>
      </tr>`,
    )
    .join("");

  root.innerHTML = `
    <div class="brand">Result</div>
    <h1>1分の結果</h1>
    <div class="stats-grid panel" style="margin-top:1rem">
      <div class="stat-card">
        <strong>${Math.round(s.cpm)}</strong>
        <span>文字/分 (CPM)</span>
      </div>
      <div class="stat-card">
        <strong>${s.accuracy.toFixed(1)}%</strong>
        <span>正確性（正解 ${s.correct} / ミス ${s.misses}）</span>
      </div>
    </div>

    <h2>遅いひらがな（子音→母音の平均間隔）</h2>
    <div class="panel">
      <table class="table">
        <thead>
          <tr><th>文字</th><th>回数</th><th>平均CV</th><th>改善ヒント</th></tr>
        </thead>
        <tbody>
          ${charRows || `<tr><td colspan="4">CV計測できる文字がまだありません</td></tr>`}
        </tbody>
      </table>
    </div>

    <h2>遅いつなぎ（ひらがな→ひらがな）</h2>
    <div class="panel">
      <table class="table">
        <thead>
          <tr><th>チャンク</th><th>回数</th><th>平均間隔</th><th>改善ヒント</th></tr>
        </thead>
        <tbody>
          ${pairRows || `<tr><td colspan="4">つなぎデータがまだありません</td></tr>`}
        </tbody>
      </table>
    </div>

    <p>累計セッション: <strong>${n}</strong> 件（削除しません・バックアップ推奨）</p>
    <div class="btn-row">
      <button class="btn" id="retry-btn" type="button">もう1回</button>
      <button class="btn secondary" id="home-btn" type="button">ホーム</button>
      <button class="btn secondary" id="backup-btn" type="button">データをバックアップ</button>
    </div>
  `;

  root.querySelector("#retry-btn")?.addEventListener("click", onRetry);
  root.querySelector("#home-btn")?.addEventListener("click", onHome);
  root.querySelector("#backup-btn")?.addEventListener("click", () => {
    downloadSessionsBackup();
  });
}
