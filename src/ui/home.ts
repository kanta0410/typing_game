import { downloadSessionsBackup, sessionCount } from "../engine/storage";

export function renderHome(
  root: HTMLElement,
  onStart: () => void,
): void {
  const n = sessionCount();
  root.innerHTML = `
    <div class="brand">Hiragana Timing Lab</div>
    <h1>ひらがなタイピング計測</h1>
    <p>1分間で、文字数・正確性・子音→母音の間隔・ひらがな同士のつなぎを測ります。</p>
    <div class="panel">
      <p class="warn">IME（日本語入力）はオフにしてください。半角英字のローマ字で打ちます。</p>
      <p>例: 「か」→ <code>k</code> のあと <code>a</code>　／　「ん」→ <code>nn</code> または <code>xn</code></p>
      <p>保存済みセッション: <strong>${n}</strong> 件（追記のみ・削除しません）</p>
      <div class="btn-row">
        <button class="btn" id="start-btn" type="button">1分スタート</button>
        <button class="btn secondary" id="backup-btn" type="button">データをバックアップ</button>
      </div>
    </div>
  `;

  root.querySelector("#start-btn")?.addEventListener("click", onStart);
  root.querySelector("#backup-btn")?.addEventListener("click", () => {
    downloadSessionsBackup();
  });
}
