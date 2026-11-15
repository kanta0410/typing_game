import { describe, expect, it } from "vitest";
import { furiganaProgress, planRomaji } from "./kana-romaji";

describe("planRomaji", () => {
  it("uses kunrei: ti si tu hu zi", () => {
    expect(planRomaji("ち").romaji).toBe("ti");
    expect(planRomaji("し").romaji).toBe("si");
    expect(planRomaji("つ").romaji).toBe("tu");
    expect(planRomaji("ふ").romaji).toBe("hu");
    expect(planRomaji("じ").romaji).toBe("zi");
  });

  it("handles youon and sokuon", () => {
    expect(planRomaji("ちょっと").romaji).toBe("tyotto");
  });

  it("handles long vowel", () => {
    expect(planRomaji("いのべーしょん").romaji).toBe("inobeesyon");
  });

  it("skips punctuation by default", () => {
    expect(planRomaji("じんせい。").romaji).toBe("zinsei");
  });

  it("types punctuation when enabled", () => {
    expect(
      planRomaji("じんせい。", { typePunctuation: true }).romaji,
    ).toBe("zinsei.");
  });

  it("keeps ascii", () => {
    expect(planRomaji("fold0").romaji).toBe("fold0");
  });

  it("uses n before na-row", () => {
    expect(planRomaji("みんな").romaji).toBe("minna");
  });

  it("tracks furigana progress indices", () => {
    const plan = planRomaji("あいう");
    expect(plan.moras[0].srcStart).toBe(0);
    const p = furiganaProgress(plan, 1); // typed "a"
    expect(p.doneEnd).toBe(1);
  });
});
