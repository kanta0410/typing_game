import { ALL_QUOTES } from "../data/quotes";
import { applyCaretTheme, loadSettings, saveSettings } from "../engine/settings";
import { downloadSessionsBackup, sessionCount } from "../engine/storage";

export function renderHome(
  root: HTMLElement,
  onStart: () => void,
): void {
  const n = sessionCount();
  let settings = loadSettings();
  applyCaretTheme("red");

  root.innerHTML = `
    <div class="brand">Hiragana Timing Lab</div>
    <h1>名言タイピング</h1>
    <p>偉人の名言をローマ字で打つ。結果は回数つきの平均CV・つなぎ間隔。</p>
    <div class="panel">
      <p class="warn">IME オフ。ち=<code>ti</code>、し=<code>si</code>、つ=<code>tu</code>、ふ=<code>hu</code>、じ=<code>zi</code></p>
      <label class="toggle">
        <input type="checkbox" id="punct-toggle" ${settings.typePunctuation ? "checked" : ""} />
        句読点も打つ（、。！？ など）
      </label>
      <p class="theme-note">いま打つ漢字は <strong class="caret-swatch">赤（A）</strong> で強調します</p>
      <p>名言: <strong>${ALL_QUOTES.length}</strong> 件　／　保存セッション: <strong>${n}</strong> 件</p>
      <div class="btn-row">
        <button class="btn" id="start-btn" type="button">1分スタート</button>
        <button class="btn secondary" id="backup-btn" type="button">データをバックアップ</button>
      </div>
    </div>
  `;

  root.querySelector("#punct-toggle")?.addEventListener("change", (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    settings = { ...settings, typePunctuation: checked, caretTheme: "red" };
    saveSettings(settings);
  });
  root.querySelector("#start-btn")?.addEventListener("click", onStart);
  root.querySelector("#backup-btn")?.addEventListener("click", () => {
    downloadSessionsBackup();
  });
}
