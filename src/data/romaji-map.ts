/**
 * ひらがな → 許容ローマ字列（複数可）
 * v1: 五十音 + 濁音 + 半濁音。拗音・小書きは対象外。
 * んは nn / xn を許可（単独 n は次字依存のため v1 では不採用）。
 */
export type RomajiVariants = readonly string[];

export const ROMAJI_MAP: Record<string, RomajiVariants> = {
  あ: ["a"],
  い: ["i"],
  う: ["u"],
  え: ["e"],
  お: ["o"],
  か: ["ka", "ca"],
  き: ["ki"],
  く: ["ku", "cu", "qu"],
  け: ["ke"],
  こ: ["ko", "co"],
  さ: ["sa"],
  し: ["si", "shi", "ci"],
  す: ["su"],
  せ: ["se", "ce"],
  そ: ["so"],
  た: ["ta"],
  ち: ["ti", "chi"],
  つ: ["tu", "tsu"],
  て: ["te"],
  と: ["to"],
  な: ["na"],
  に: ["ni"],
  ぬ: ["nu"],
  ね: ["ne"],
  の: ["no"],
  は: ["ha"],
  ひ: ["hi"],
  ふ: ["hu", "fu"],
  へ: ["he"],
  ほ: ["ho"],
  ま: ["ma"],
  み: ["mi"],
  む: ["mu"],
  め: ["me"],
  も: ["mo"],
  や: ["ya"],
  ゆ: ["yu"],
  よ: ["yo"],
  ら: ["ra"],
  り: ["ri"],
  る: ["ru"],
  れ: ["re"],
  ろ: ["ro"],
  わ: ["wa"],
  を: ["wo"],
  ん: ["nn", "xn"],
  が: ["ga"],
  ぎ: ["gi"],
  ぐ: ["gu"],
  げ: ["ge"],
  ご: ["go"],
  ざ: ["za"],
  じ: ["zi", "ji"],
  ず: ["zu"],
  ぜ: ["ze"],
  ぞ: ["zo"],
  だ: ["da"],
  ぢ: ["di"],
  づ: ["du"],
  で: ["de"],
  ど: ["do"],
  ば: ["ba"],
  び: ["bi"],
  ぶ: ["bu"],
  べ: ["be"],
  ぼ: ["bo"],
  ぱ: ["pa"],
  ぴ: ["pi"],
  ぷ: ["pu"],
  ぺ: ["pe"],
  ぽ: ["po"],
};

/** 出題に使うひらがな一覧（マップのキー順ではない。読みやすい五十音順） */
export const HIRAGANA_LIST: readonly string[] = Object.keys(ROMAJI_MAP);

export function getRomajiVariants(kana: string): RomajiVariants {
  const variants = ROMAJI_MAP[kana];
  if (!variants) {
    throw new Error(`未知のひらがな: ${kana}`);
  }
  return variants;
}

/** 表示用の代表ローマ字（最初のバリアント） */
export function getPrimaryRomaji(kana: string): string {
  return getRomajiVariants(kana)[0];
}
