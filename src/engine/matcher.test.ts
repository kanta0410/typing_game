import { describe, expect, it } from "vitest";
import { canMeasureCv, matchKey } from "./matcher";

describe("matchKey", () => {
  it("completes か with ka", () => {
    expect(matchKey("か", "", "k")).toEqual({
      kind: "progress",
      buffer: "k",
      chosen: "ka",
    });
    expect(matchKey("か", "k", "a")).toEqual({
      kind: "complete",
      chosen: "ka",
      buffer: "ka",
    });
  });

  it("accepts shi and si for し", () => {
    expect(matchKey("し", "s", "h").kind).toBe("progress");
    expect(matchKey("し", "sh", "i")).toEqual({
      kind: "complete",
      chosen: "shi",
      buffer: "shi",
    });
    expect(matchKey("し", "s", "i")).toEqual({
      kind: "complete",
      chosen: "si",
      buffer: "si",
    });
  });

  it("accepts nn and xn for ん", () => {
    expect(matchKey("ん", "n", "n")).toEqual({
      kind: "complete",
      chosen: "nn",
      buffer: "nn",
    });
    expect(matchKey("ん", "x", "n")).toEqual({
      kind: "complete",
      chosen: "xn",
      buffer: "xn",
    });
  });

  it("counts wrong key as miss without advancing buffer", () => {
    expect(matchKey("き", "", "x")).toEqual({ kind: "miss", buffer: "" });
    expect(matchKey("き", "k", "a")).toEqual({ kind: "miss", buffer: "k" });
  });
});

describe("canMeasureCv", () => {
  it("is false for single vowel", () => {
    expect(canMeasureCv("a")).toBe(false);
  });
  it("is true for CV romaji", () => {
    expect(canMeasureCv("ki")).toBe(true);
    expect(canMeasureCv("shi")).toBe(true);
  });
});
