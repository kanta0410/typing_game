import { tipForCharPair, tipForRomaji } from "../data/finger-tips";
import { getPrimaryRomaji } from "../data/romaji-map";

export type CharSample = {
  kana: string;
  romaji: string;
  /** 子音→母音間隔 (ms)。単母音は null */
  cvMs: number | null;
  completedAt: number;
};

export type PairSample = {
  from: string;
  to: string;
  /** 前のひらがな完了 → 次のひらがな完了までの間隔 (ms) */
  gapMs: number;
};

export type SessionStats = {
  correct: number;
  misses: number;
  durationMs: number;
  chars: CharSample[];
  pairs: PairSample[];
  startedAt: string;
};

export type CharAgg = {
  kana: string;
  count: number;
  avgCvMs: number | null;
  tip: string;
};

export type PairAgg = {
  from: string;
  to: string;
  count: number;
  avgGapMs: number;
  tip: string;
};

export function emptySession(startedAt = new Date().toISOString()): SessionStats {
  return {
    correct: 0,
    misses: 0,
    durationMs: 0,
    chars: [],
    pairs: [],
    startedAt,
  };
}

export function accuracy(stats: SessionStats): number {
  const denom = stats.correct + stats.misses;
  if (denom === 0) return 100;
  return (stats.correct / denom) * 100;
}

/** 1分あたりの正しいひらがな数（実際の経過時間で正規化） */
export function cpm(stats: SessionStats): number {
  if (stats.durationMs <= 0) return 0;
  return (stats.correct / stats.durationMs) * 60_000;
}

export function aggregateChars(samples: CharSample[]): CharAgg[] {
  const map = new Map<
    string,
    { sum: number; n: number; cvN: number; romaji: string }
  >();
  for (const s of samples) {
    const cur = map.get(s.kana) ?? {
      sum: 0,
      n: 0,
      cvN: 0,
      romaji: s.romaji,
    };
    cur.n += 1;
    if (s.cvMs != null) {
      cur.sum += s.cvMs;
      cur.cvN += 1;
    }
    map.set(s.kana, cur);
  }

  const rows: CharAgg[] = [];
  for (const [kana, v] of map) {
    const avgCvMs = v.cvN > 0 ? v.sum / v.cvN : null;
    let tipRoma = v.romaji;
    try {
      tipRoma = getPrimaryRomaji(kana);
    } catch {
      // 拗音・ASCII などマップ外はそのまま
    }
    rows.push({
      kana,
      count: v.n,
      avgCvMs,
      tip: tipForRomaji(tipRoma),
    });
  }

  return rows.sort((a, b) => {
    const av = a.avgCvMs ?? -1;
    const bv = b.avgCvMs ?? -1;
    return bv - av;
  });
}

export function aggregatePairs(samples: PairSample[]): PairAgg[] {
  const map = new Map<string, { sum: number; n: number; from: string; to: string }>();
  for (const s of samples) {
    const key = `${s.from}→${s.to}`;
    const cur = map.get(key) ?? { sum: 0, n: 0, from: s.from, to: s.to };
    cur.sum += s.gapMs;
    cur.n += 1;
    map.set(key, cur);
  }

  const rows: PairAgg[] = [];
  for (const v of map.values()) {
    rows.push({
      from: v.from,
      to: v.to,
      count: v.n,
      avgGapMs: v.sum / v.n,
      tip: tipForCharPair(v.from, v.to),
    });
  }

  return rows.sort((a, b) => b.avgGapMs - a.avgGapMs);
}

export function summarizeSession(stats: SessionStats) {
  return {
    correct: stats.correct,
    misses: stats.misses,
    accuracy: accuracy(stats),
    cpm: cpm(stats),
    slowChars: aggregateChars(stats.chars).slice(0, 10),
    slowPairs: aggregatePairs(stats.pairs).slice(0, 10),
  };
}
