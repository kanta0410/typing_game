import { pickQuote, type Quote } from "../data/quotes";
import {
  furiganaProgress,
  planRomaji,
  type MoraSpan,
  type RomajiPlan,
} from "./kana-romaji";
import { loadSettings } from "./settings";
import {
  emptySession,
  type CharSample,
  type PairSample,
  type SessionStats,
} from "./stats";

export const ROUND_MS = 60_000;

export type QuoteSnapshot = {
  quote: Quote;
  furigana: string;
  romaji: string;
  typed: number;
  furiDoneEnd: number;
  furiCaretStart: number;
  furiCaretEnd: number;
  quoteRatio: number;
  remainingMs: number;
  correct: number;
  misses: number;
  quotesDone: number;
  running: boolean;
  typePunctuation: boolean;
};

type Listener = (snap: QuoteSnapshot) => void;

export class QuoteTypingGame {
  private stats: SessionStats = emptySession();
  private quote: Quote = pickQuote();
  private typePunctuation = loadSettings().typePunctuation;
  private plan: RomajiPlan = planRomaji(this.quote.furigana, {
    typePunctuation: this.typePunctuation,
  });
  private typed = 0;
  private moraIndex = 0;
  private moraStartedAt: number | null = null;
  private lastMoraAt: number | null = null;
  private prevMoraKana: string | null = null;
  private quotesDone = 0;
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
    this.typePunctuation = loadSettings().typePunctuation;
    this.stats = emptySession();
    this.loadQuote();
    this.quotesDone = 0;
    this.lastMoraAt = null;
    this.prevMoraKana = null;
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

    const expected = this.plan.romaji[this.typed];
    if (!expected) {
      this.nextQuote();
      return;
    }

    if (key.length !== 1) return;
    const got = /[a-zA-Z]/.test(key) ? key.toLowerCase() : key;
    if (got !== expected) {
      this.stats.misses += 1;
      this.emit();
      return;
    }

    const now = performance.now();
    if (this.moraStartedAt == null) this.moraStartedAt = now;

    this.typed += 1;
    this.maybeCompleteMoras(now);

    if (this.typed >= this.plan.romaji.length) {
      this.quotesDone += 1;
      this.nextQuote();
    }

    this.emit();
  }

  snapshot(): QuoteSnapshot {
    const remainingMs = this.running
      ? Math.max(0, this.endsAtPerf - performance.now())
      : 0;
    const prog = furiganaProgress(this.plan, this.typed);
    const quoteRatio =
      this.plan.romaji.length === 0
        ? 0
        : Math.min(1, this.typed / this.plan.romaji.length);
    return {
      quote: this.quote,
      furigana: this.quote.furigana,
      romaji: this.plan.romaji,
      typed: this.typed,
      furiDoneEnd: prog.doneEnd,
      furiCaretStart: prog.caretStart,
      furiCaretEnd: prog.caretEnd,
      quoteRatio,
      remainingMs,
      correct: this.stats.correct,
      misses: this.stats.misses,
      quotesDone: this.quotesDone,
      running: this.running,
      typePunctuation: this.typePunctuation,
    };
  }

  private loadQuote(excludeId?: string): void {
    this.quote = pickQuote(excludeId);
    this.plan = planRomaji(this.quote.furigana, {
      typePunctuation: this.typePunctuation,
    });
    let guard = 0;
    while (this.plan.romaji.length === 0 && guard++ < 20) {
      this.quote = pickQuote(this.quote.id);
      this.plan = planRomaji(this.quote.furigana, {
        typePunctuation: this.typePunctuation,
      });
    }
    this.typed = 0;
    this.moraIndex = 0;
    this.moraStartedAt = null;
  }

  private nextQuote(): void {
    this.loadQuote(this.quote.id);
  }

  private maybeCompleteMoras(now: number): void {
    while (this.moraIndex < this.plan.moras.length) {
      const mora = this.plan.moras[this.moraIndex];
      if (this.typed < mora.end) break;
      this.recordMora(mora, now);
      this.moraIndex += 1;
      this.moraStartedAt = now;
    }
  }

  private recordMora(mora: MoraSpan, now: number): void {
    const isKana = /[\u3041-\u3096ー]/.test(mora.kana[0] ?? "");
    const cvMs =
      mora.romaji.length >= 2 && this.moraStartedAt != null
        ? now - this.moraStartedAt
        : null;

    if (!isKana && mora.romaji.length <= 1 && ",.!?:;/".includes(mora.romaji)) {
      // 句読点は文字カウントに入れるが CV はなし
      this.stats.correct += 1;
      this.stats.chars.push({
        kana: mora.kana,
        romaji: mora.romaji,
        cvMs: null,
        completedAt: now,
      });
      return;
    }

    const sample: CharSample = {
      kana: mora.kana.length <= 2 ? mora.kana : mora.kana.slice(0, 2),
      romaji: mora.romaji,
      cvMs: isKana ? cvMs : null,
      completedAt: now,
    };
    this.stats.chars.push(sample);
    this.stats.correct += 1;

    if (this.prevMoraKana != null && this.lastMoraAt != null) {
      const pair: PairSample = {
        from: this.prevMoraKana,
        to: sample.kana,
        gapMs: now - this.lastMoraAt,
      };
      this.stats.pairs.push(pair);
    }
    this.prevMoraKana = sample.kana;
    this.lastMoraAt = now;
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
