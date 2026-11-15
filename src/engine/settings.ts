const KEY = "typing_game_settings_v1";

export type GameSettings = {
  /** true なら 、。！？ なども打つ */
  typePunctuation: boolean;
};

const DEFAULTS: GameSettings = {
  typePunctuation: false,
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
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(next: GameSettings): void {
  localStorage.setItem(KEY, JSON.stringify(next));
}
