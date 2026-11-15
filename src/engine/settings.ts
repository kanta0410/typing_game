const KEY = "typing_game_settings_v1";

/** 実装は A（赤）固定 */
export type CaretTheme = "red";

export type GameSettings = {
  /** true なら 、。！？ なども打つ */
  typePunctuation: boolean;
  caretTheme: CaretTheme;
};

const DEFAULTS: GameSettings = {
  typePunctuation: false,
  caretTheme: "red",
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return {
      typePunctuation:
        typeof parsed.typePunctuation === "boolean"
          ? parsed.typePunctuation
          : DEFAULTS.typePunctuation,
      // 常に A（赤）
      caretTheme: "red",
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(next: GameSettings): void {
  localStorage.setItem(
    KEY,
    JSON.stringify({ ...next, caretTheme: "red" as const }),
  );
  applyCaretTheme("red");
}

export function applyCaretTheme(_theme: CaretTheme = "red"): void {
  document.documentElement.dataset.caret = "red";
}
