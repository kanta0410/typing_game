const KEY = "typing_game_settings_v1";

export type CaretTheme = "red" | "coral" | "crimson" | "rose" | "amber";

export type GameSettings = {
  /** true なら 、。！？ なども打つ */
  typePunctuation: boolean;
  /** いま打つ位置の色パターン */
  caretTheme: CaretTheme;
};

export const CARET_THEMES: {
  id: CaretTheme;
  label: string;
  blurb: string;
}[] = [
  { id: "red", label: "A 赤", blurb: "真っ赤＋薄い赤背景" },
  { id: "coral", label: "B コーラル", blurb: "暖かめの赤オレンジ" },
  { id: "crimson", label: "C クリムゾン", blurb: "濃い赤＋下線" },
  { id: "rose", label: "D ローズ", blurb: "ピンク寄りの赤" },
  { id: "amber", label: "E アンバー", blurb: "赤寄りオレンジ（比較用）" },
];

const DEFAULTS: GameSettings = {
  typePunctuation: false,
  caretTheme: "red",
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    const theme = CARET_THEMES.some((t) => t.id === parsed.caretTheme)
      ? (parsed.caretTheme as CaretTheme)
      : DEFAULTS.caretTheme;
    return {
      typePunctuation:
        typeof parsed.typePunctuation === "boolean"
          ? parsed.typePunctuation
          : DEFAULTS.typePunctuation,
      caretTheme: theme,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(next: GameSettings): void {
  localStorage.setItem(KEY, JSON.stringify(next));
  applyCaretTheme(next.caretTheme);
}

export function applyCaretTheme(theme: CaretTheme): void {
  document.documentElement.dataset.caret = theme;
}
