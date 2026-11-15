import { getRomajiVariants } from "../data/romaji-map";

export type MatchResult =
  | { kind: "progress"; buffer: string; chosen: string }
  | { kind: "complete"; chosen: string; buffer: string }
  | { kind: "miss"; buffer: string };

/**
 * 現在のひらがなに対し、打った1キーを評価する。
 * 複数ローマ字（shi/si 等）は、いまのバッファと両立する候補だけ残す。
 */
export function matchKey(
  kana: string,
  buffer: string,
  key: string,
): MatchResult {
  const k = key.toLowerCase();
  if (!/^[a-z]$/.test(k)) {
    return { kind: "miss", buffer };
  }

  const next = buffer + k;
  const variants = getRomajiVariants(kana);
  const stillPossible = variants.filter((v) => v.startsWith(next));

  if (stillPossible.length === 0) {
    return { kind: "miss", buffer };
  }

  const exact = stillPossible.find((v) => v === next);
  if (exact) {
    return { kind: "complete", chosen: exact, buffer: next };
  }

  return {
    kind: "progress",
    buffer: next,
    chosen: stillPossible[0],
  };
}

/** 期待ローマ字が2キー以上なら CV 間隔を測れる */
export function canMeasureCv(romaji: string): boolean {
  return romaji.length >= 2;
}
