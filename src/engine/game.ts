import { getRomajiVariants, HIRAGANA_LIST } from "../data/romaji-map";
import { canMeasureCv, matchKey } from "./matcher";
import {
  emptySession,
  type CharSample,
  type PairSample,
  type SessionStats,
} from "./stats";

export const ROUND_MS = 60_000;

export type GameSnapshot = {
  kana: string;
  buffer: string;
  hint: string;
  remainingMs: number;
  correct: number;
  misses: number;
  running: boolean;
};

type Listener = (snap: GameSnapshot) => void;

function pickKana(exclude?: string): string {
  let kana = HIRAGANA_LIST[Math.floor(Math.random() * HIRAGANA_LIST.length)];
  if (HIRAGANA_LIST.length > 1) {
    let guard = 0;
    while (kana === exclude && guard++ < 20) {
      kana = HIRAGANA_LIST[Math.floor(Math.random() * HIRAGANA_LIST.length)];
    }
  }
  return kana;
}

export class TypingGame {
  private stats: SessionStats = emptySession();
  private kana = pickKana();
  private buffer = "";
  private consonantAt: number | null = null;
  private lastCompleteAt: number | null = null;
  private prevKana: string | null = null;
  private startedAtPerf = 0;
  private endsAtPerf = 0;
  private running = false;
  private timerId: number | null = null;
  private listeners = new Set<Listener>();
  private onFinished: ((stats: SessionStats) => void) | null = null;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.snapshot());
    return () => {
      this.listeners.delete(fn);
    };
  }

  setOnFinished(fn: (stats: SessionStats) => void): void {
    this.onFinished = fn;
  }

  start(): void {
    this.stats = emptySession();
    this.kana = pickKana();
    this.buffer = "";
    this.consonantAt = null;
    this.lastCompleteAt = null;
    this.prevKana = null;
    this.startedAtPerf = performance.now();
    this.endsAtPerf = this.startedAtPerf + ROUND_MS;
    this.running = true;
    this.clearTimer();
    this.timerId = window.setInterval(() => this.tick(), 100);
    this.emit();
  }

  stop(): SessionStats {
    if (!this.running) return this.stats;
    this.running = false;
    this.clearTimer();
    this.stats.durationMs = Math.min(
      ROUND_MS,
      performance.now() - this.startedAtPerf,
    );
    this.emit();
    this.onFinished?.(this.stats);
    return this.stats;
  }

  handleKey(key: string): void {
    if (!this.running) return;
    if (performance.now() >= this.endsAtPerf) {
      this.stop();
      return;
    }

    const now = performance.now();
    const result = matchKey(this.kana, this.buffer, key);

    if (result.kind === "miss") {
      this.stats.misses += 1;
      this.emit();
      return;
    }

    if (this.buffer.length === 0 && result.buffer.length === 1) {
      this.consonantAt = now;
    }

    this.buffer = result.buffer;

    if (result.kind === "complete") {
      const cvMs =
        canMeasureCv(result.chosen) && this.consonantAt != null
          ? now - this.consonantAt
          : null;

      const sample: CharSample = {
        kana: this.kana,
        romaji: result.chosen,
        cvMs,
        completedAt: now,
      };
      this.stats.chars.push(sample);
      this.stats.correct += 1;

      if (this.prevKana != null && this.lastCompleteAt != null) {
        const pair: PairSample = {
          from: this.prevKana,
          to: this.kana,
          gapMs: now - this.lastCompleteAt,
        };
        this.stats.pairs.push(pair);
      }

      this.prevKana = this.kana;
      this.lastCompleteAt = now;
      this.kana = pickKana(this.kana);
      this.buffer = "";
      this.consonantAt = null;
    }

    this.emit();
  }

  snapshot(): GameSnapshot {
    const remainingMs = this.running
      ? Math.max(0, this.endsAtPerf - performance.now())
      : 0;
    return {
      kana: this.kana,
      buffer: this.buffer,
      hint: this.hintRomaji(),
      remainingMs,
      correct: this.stats.correct,
      misses: this.stats.misses,
      running: this.running,
    };
  }

  private hintRomaji(): string {
    const variants = getRomajiVariants(this.kana);
    return variants.find((v) => v.startsWith(this.buffer)) ?? variants[0];
  }

  private tick(): void {
    if (!this.running) return;
    if (performance.now() >= this.endsAtPerf) {
      this.stop();
      return;
    }
    this.emit();
  }

  private emit(): void {
    const snap = this.snapshot();
    for (const fn of this.listeners) fn(snap);
  }

  private clearTimer(): void {
    if (this.timerId != null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
