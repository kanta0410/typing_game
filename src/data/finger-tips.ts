/** キー → 指の簡易ヒント（QWERTY 想定） */
const KEY_FINGER: Record<string, string> = {
  a: "左手小指（ホーム）",
  s: "左手薬指（ホーム）",
  d: "左手中指（ホーム）",
  f: "左手人差し指（ホーム）",
  g: "左手人差し指",
  h: "右手人差し指",
  j: "右手人差し指（ホーム）",
  k: "右手中指（ホーム）",
  l: "右手薬指（ホーム）",
  q: "左手小指",
  w: "左手薬指",
  e: "左手中指",
  r: "左手人差し指",
  t: "左手人差し指",
  y: "右手人差し指",
  u: "右手人差し指",
  i: "右手中指",
  o: "右手薬指",
  p: "右手小指",
  z: "左手小指（下段）",
  x: "左手薬指（下段）",
  c: "左手中指（下段）",
  v: "左手人差し指（下段）",
  b: "左手人差し指（下段）",
  n: "右手人差し指（下段）",
  m: "右手人差し指（下段）",
};

export function tipForRomaji(romaji: string): string {
  const keys = [...romaji.toLowerCase()];
  const parts = keys.map((k) => {
    const finger = KEY_FINGER[k] ?? "（不明なキー）";
    return `${k.toUpperCase()} → ${finger}`;
  });
  if (keys.length >= 2) {
    return `${parts.join(" / ")}。子音→母音の間隔を短くする練習を。`;
  }
  return `${parts.join(" / ")}。単母音は押し遅れを減らす。`;
}

export function tipForCharPair(from: string, to: string): string {
  return `「${from}→${to}」のつなぎが遅い。前の文字の確定直後に、次の子音へ指を先に動かす意識を。`;
}
