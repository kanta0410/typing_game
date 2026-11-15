import { ALL_QUOTES } from "../data/quotes";
import {
  applyCaretTheme,
  CARET_THEMES,
  loadSettings,
  saveSettings,
  type CaretTheme,
} from "../engine/settings";
import { downloadSessionsBackup, sessionCount } from "../engine/storage";

const PREVIEW_COLORS: Record<
  CaretTheme,
  { c: string; bg: string; u: string }
> = {
  red: { c: "#e11d48", bg: "rgba(225,29,72,0.16)", u: "transparent" },
  coral: { c: "#f04323", bg: "rgba(240,67,35,0.18)", u: "transparent" },
  crimson: { c: "#be123c", bg: "transparent", u: "#be123c" },
  rose: { c: "#e11d8a", bg: "rgba(225,29,138,0.15)", u: "transparent" },
  amber: { c: "#d97706", bg: "rgba(217,119,6,0.2)", u: "transparent" },
};

export function renderHome(
  root: HTMLElement,
  onStart: () => void,
): void {
  const n = sessionCount();
  let settings = loadSettings();
  applyCaretTheme(settings.caretTheme);

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

      <p style="margin-top:1rem;color:var(--ink)"><strong>いま打つ位置の色</strong>（クリックで選択）</p>
      <div class="theme-grid" id="theme-grid" role="radiogroup"></div>

      <p>名言: <strong>${ALL_QUOTES.length}</strong> 件　／　保存セッション: <strong>${n}</strong> 件</p>
      <div class="btn-row">
        <button class="btn" id="start-btn" type="button">1分スタート</button>
        <button class="btn secondary" id="backup-btn" type="button">データをバックアップ</button>
      </div>
    </div>
  `;

  const grid = root.querySelector("#theme-grid")!;
  for (const t of CARET_THEMES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-card";
    btn.setAttribute("role", "radio");
    btn.setAttribute(
      "aria-checked",
      t.id === settings.caretTheme ? "true" : "false",
    );
    btn.innerHTML = `
      <div class="theme-label">${t.label}</div>
      <div class="theme-blurb">${t.blurb}</div>
      <div class="theme-preview theme-preview-kanji">
        <span class="done">人生</span><span class="caret quote-caret">は</span><span class="rest">重荷</span>
      </div>
    `;
    const caretEl = btn.querySelector(".caret") as HTMLElement;
    const col = PREVIEW_COLORS[t.id];
    caretEl.style.color = col.c;
    caretEl.style.background = col.bg;
    caretEl.style.borderBottom = `3px solid ${col.u === "transparent" ? col.c : col.u}`;
    caretEl.style.fontWeight = "800";
    caretEl.style.borderRadius = "6px";
    caretEl.style.padding = "0.08em 0.12em";
    caretEl.style.boxShadow = `0 0 0 2px ${col.bg}`;

    btn.addEventListener("click", () => {
      settings = { ...settings, caretTheme: t.id };
      saveSettings(settings);
      for (const el of grid.querySelectorAll(".theme-card")) {
        el.setAttribute("aria-checked", el === btn ? "true" : "false");
      }
    });
    grid.appendChild(btn);
  }

  root.querySelector("#punct-toggle")?.addEventListener("change", (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    settings = { ...settings, typePunctuation: checked };
    saveSettings(settings);
  });
  root.querySelector("#start-btn")?.addEventListener("click", onStart);
  root.querySelector("#backup-btn")?.addEventListener("click", () => {
    downloadSessionsBackup();
  });
}
