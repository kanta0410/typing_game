import { describe, expect, it } from "vitest";
import {
  aggregateChars,
  aggregatePairs,
  accuracy,
  cpm,
  emptySession,
  summarizeSession,
} from "./stats";

describe("stats", () => {
  it("computes accuracy and cpm", () => {
    const s = emptySession();
    s.correct = 30;
    s.misses = 10;
    s.durationMs = 60_000;
    expect(accuracy(s)).toBe(75);
    expect(cpm(s)).toBe(30);
  });

  it("ranks slow chars by avg CV", () => {
    const rows = aggregateChars([
      { kana: "き", romaji: "ki", cvMs: 200, completedAt: 1 },
      { kana: "き", romaji: "ki", cvMs: 300, completedAt: 2 },
      { kana: "か", romaji: "ka", cvMs: 100, completedAt: 3 },
      { kana: "あ", romaji: "a", cvMs: null, completedAt: 4 },
    ]);
    expect(rows[0].kana).toBe("き");
    expect(rows[0].avgCvMs).toBe(250);
  });

  it("ranks slow pairs by avg gap", () => {
    const rows = aggregatePairs([
      { from: "き", to: "で", gapMs: 400 },
      { from: "き", to: "で", gapMs: 600 },
      { from: "あ", to: "い", gapMs: 120 },
    ]);
    expect(rows[0].from).toBe("き");
    expect(rows[0].to).toBe("で");
    expect(rows[0].avgGapMs).toBe(500);
  });

  it("summarizeSession returns top lists", () => {
    const s = emptySession();
    s.correct = 2;
    s.misses = 0;
    s.durationMs = 60_000;
    s.chars = [
      { kana: "ぜ", romaji: "ze", cvMs: 500, completedAt: 10 },
      { kana: "ざ", romaji: "za", cvMs: 100, completedAt: 20 },
    ];
    s.pairs = [{ from: "ぜ", to: "ざ", gapMs: 800 }];
    const out = summarizeSession(s);
    expect(out.slowChars[0].kana).toBe("ぜ");
    expect(out.slowPairs[0].avgGapMs).toBe(800);
  });
});
