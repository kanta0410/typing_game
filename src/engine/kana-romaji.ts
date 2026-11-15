/** 訓令式寄り（ち=ti, し=si, つ=tu, ふ=hu, じ=zi） */
const BASE: Record<string, string> = {
  あ: "a",
  い: "i",
  う: "u",
  え: "e",
  お: "o",
  か: "ka",
  き: "ki",
  く: "ku",
  け: "ke",
  こ: "ko",
  さ: "sa",
  し: "si",
  す: "su",
  せ: "se",
  そ: "so",
  た: "ta",
  ち: "ti",
  つ: "tu",
  て: "te",
  と: "to",
  な: "na",
  に: "ni",
  ぬ: "nu",
  ね: "ne",
  の: "no",
  は: "ha",
  ひ: "hi",
  ふ: "hu",
  へ: "he",
  ほ: "ho",
  ま: "ma",
  み: "mi",
  む: "mu",
  め: "me",
  も: "mo",
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  ら: "ra",
  り: "ri",
  る: "ru",
  れ: "re",
  ろ: "ro",
  わ: "wa",
  を: "wo",
  ん: "n",
  が: "ga",
  ぎ: "gi",
  ぐ: "gu",
  げ: "ge",
  ご: "go",
  ざ: "za",
  じ: "zi",
  ず: "zu",
  ぜ: "ze",
  ぞ: "zo",
  だ: "da",
  ぢ: "di",
  づ: "du",
  で: "de",
  ど: "do",
  ば: "ba",
  び: "bi",
  ぶ: "bu",
  べ: "be",
  ぼ: "bo",
  ぱ: "pa",
  ぴ: "pi",
  ぷ: "pu",
  ぺ: "pe",
  ぽ: "po",
  ぁ: "xa",
  ぃ: "xi",
  ぅ: "xu",
  ぇ: "xe",
  ぉ: "xo",
  ゃ: "xya",
  ゅ: "xyu",
  ょ: "xyo",
  っ: "xtu",
  ゐ: "wyi",
  ゑ: "wye",
  ゔ: "vu",
};

const YOUON: Record<string, Record<string, string>> = {
  き: { ゃ: "kya", ゅ: "kyu", ょ: "kyo" },
  し: { ゃ: "sya", ゅ: "syu", ょ: "syo" },
  ち: { ゃ: "tya", ゅ: "tyu", ょ: "tyo" },
  に: { ゃ: "nya", ゅ: "nyu", ょ: "nyo" },
  ひ: { ゃ: "hya", ゅ: "hyu", ょ: "hyo" },
  み: { ゃ: "mya", ゅ: "myu", ょ: "myo" },
  り: { ゃ: "rya", ゅ: "ryu", ょ: "ryo" },
  ぎ: { ゃ: "gya", ゅ: "gyu", ょ: "gyo" },
  じ: { ゃ: "zya", ゅ: "zyu", ょ: "zyo" },
  び: { ゃ: "bya", ゅ: "byu", ょ: "byo" },
  ぴ: { ゃ: "pya", ゅ: "pyu", ょ: "pyo" },
};

/** 句読点オフ時に飛ばす文字 */
const ALWAYS_SKIP = new Set([
  "「",
  "」",
  "『",
  "』",
  "（",
  "）",
  "(",
  ")",
  "　",
  " ",
  "\n",
  "\t",
  "—",
  "–",
  "…",
  "／",
  "/",
  "＋",
  "+",
  "％",
  "%",
]);

/** 句読点オン時に打つ対応 */
const PUNCT: Record<string, string> = {
  "、": ",",
  "，": ",",
  ",": ",",
  "。": ".",
  ".": ".",
  "・": "/",
  "：": ":",
  ":": ":",
  "！": "!",
  "!": "!",
  "？": "?",
  "?": "?",
  "；": ";",
  ";": ";",
  "〜": "~",
  "～": "~",
  "ー": "-", // 長音は別処理。ここには通常来ない
};

export type PlanOptions = {
  typePunctuation?: boolean;
};

export type MoraSpan = {
  kana: string;
  romaji: string;
  start: number;
  end: number;
  /** ふりがな原文上の [srcStart, srcEnd) */
  srcStart: number;
  srcEnd: number;
};

export type RomajiPlan = {
  romaji: string;
  moras: MoraSpan[];
};

function isHiragana(ch: string): boolean {
  return /[\u3041-\u3096]/.test(ch);
}

function lastVowel(romaji: string): string {
  for (let i = romaji.length - 1; i >= 0; i--) {
    const c = romaji[i];
    if ("aiueo".includes(c)) return c;
  }
  return "u";
}

function firstConsonant(romaji: string): string {
  if (!romaji) return "t";
  if ("aiueo".includes(romaji[0])) return "t";
  if (romaji.startsWith("ch")) return "t";
  if (romaji.startsWith("sh")) return "s";
  if (romaji.startsWith("ts")) return "t";
  if (romaji.startsWith("ty")) return "t";
  if (romaji.startsWith("sy")) return "s";
  if (romaji.startsWith("zy")) return "z";
  return romaji[0];
}

function needsNn(nextKana: string | undefined): boolean {
  if (!nextKana) return false;
  if (!isHiragana(nextKana)) return false;
  return "あいうえおやゆよんぁぃぅぇぉゃゅょ".includes(nextKana);
}

function pushMora(
  moras: MoraSpan[],
  romajiRef: { value: string },
  kana: string,
  r: string,
  srcStart: number,
  srcEnd: number,
): void {
  const start = romajiRef.value.length;
  romajiRef.value += r;
  moras.push({
    kana,
    romaji: r,
    start,
    end: romajiRef.value.length,
    srcStart,
    srcEnd,
  });
}

/**
 * ふりがな → 打鍵用ローマ字 + モーラ境界（ふりがな位置つき）
 */
export function planRomaji(
  furigana: string,
  options: PlanOptions = {},
): RomajiPlan {
  const typePunctuation = options.typePunctuation ?? false;
  const chars = [...furigana.normalize("NFKC")];
  const romajiRef = { value: "" };
  const moras: MoraSpan[] = [];
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];

    if (ALWAYS_SKIP.has(ch)) {
      i += 1;
      continue;
    }

    if (ch in PUNCT && ch !== "ー") {
      if (typePunctuation) {
        pushMora(moras, romajiRef, ch, PUNCT[ch], i, i + 1);
      }
      i += 1;
      continue;
    }

    if (/[a-zA-Z0-9]/.test(ch)) {
      let j = i;
      let chunk = "";
      while (j < chars.length && /[a-zA-Z0-9]/.test(chars[j])) {
        chunk += chars[j].toLowerCase();
        j += 1;
      }
      pushMora(moras, romajiRef, chunk, chunk, i, j);
      i = j;
      continue;
    }

    if (ch === "ー" || ch === "ｰ") {
      const v = lastVowel(romajiRef.value);
      pushMora(moras, romajiRef, "ー", v, i, i + 1);
      i += 1;
      continue;
    }

    if (ch === "っ") {
      let k = i + 1;
      while (
        k < chars.length &&
        (ALWAYS_SKIP.has(chars[k]) ||
          (!typePunctuation && chars[k] in PUNCT && chars[k] !== "ー"))
      ) {
        k += 1;
      }
      let nextRoma = "tu";
      if (k < chars.length) {
        const n0 = chars[k];
        const n1 = chars[k + 1];
        if (n1 && YOUON[n0]?.[n1]) nextRoma = YOUON[n0][n1];
        else if (BASE[n0]) nextRoma = BASE[n0];
      }
      pushMora(moras, romajiRef, "っ", firstConsonant(nextRoma), i, i + 1);
      i += 1;
      continue;
    }

    if (ch === "ん") {
      let k = i + 1;
      while (
        k < chars.length &&
        (ALWAYS_SKIP.has(chars[k]) ||
          (!typePunctuation && chars[k] in PUNCT && chars[k] !== "ー"))
      ) {
        k += 1;
      }
      const r = needsNn(chars[k]) ? "nn" : "n";
      pushMora(moras, romajiRef, "ん", r, i, i + 1);
      i += 1;
      continue;
    }

    const small = chars[i + 1];
    if (small && YOUON[ch]?.[small]) {
      pushMora(moras, romajiRef, ch + small, YOUON[ch][small], i, i + 2);
      i += 2;
      continue;
    }

    if (BASE[ch]) {
      pushMora(moras, romajiRef, ch, BASE[ch], i, i + 1);
      i += 1;
      continue;
    }

    i += 1;
  }

  return { romaji: romajiRef.value, moras };
}

/** typed ローマ字位置から、完了したふりがな文字数（srcEnd）を返す */
export function furiganaProgress(
  plan: RomajiPlan,
  typed: number,
): { doneEnd: number; caretStart: number; caretEnd: number } {
  let doneEnd = 0;
  let caretStart = 0;
  let caretEnd = 0;
  for (const m of plan.moras) {
    if (typed >= m.end) {
      doneEnd = m.srcEnd;
      continue;
    }
    if (typed > m.start) {
      caretStart = m.srcStart;
      caretEnd = m.srcEnd;
      return { doneEnd: m.srcStart, caretStart, caretEnd };
    }
    caretStart = m.srcStart;
    caretEnd = m.srcEnd;
    return { doneEnd, caretStart, caretEnd };
  }
  return { doneEnd, caretStart: doneEnd, caretEnd: doneEnd };
}
