import elon from "../../data/quotes/elon-musk.json";
import fromUser from "../../data/quotes/from-user-photo.json";
import japanese from "../../data/quotes/japanese-greats.json";
import nietzsche from "../../data/quotes/nietzsche.json";
import world from "../../data/quotes/world-thinkers.json";

export type Quote = {
  id: string;
  author: string;
  authorEn: string;
  textJa: string;
  furigana: string;
  source: string;
  tags: string[];
};

export const ALL_QUOTES: Quote[] = [
  ...(fromUser as Quote[]),
  ...(elon as Quote[]),
  ...(nietzsche as Quote[]),
  ...(japanese as Quote[]),
  ...(world as Quote[]),
].filter((q) => q.furigana && q.furigana.trim().length > 0);

export function pickQuote(excludeId?: string): Quote {
  if (ALL_QUOTES.length === 0) {
    throw new Error("名言がありません");
  }
  let q = ALL_QUOTES[Math.floor(Math.random() * ALL_QUOTES.length)];
  let guard = 0;
  while (excludeId && q.id === excludeId && guard++ < 30) {
    q = ALL_QUOTES[Math.floor(Math.random() * ALL_QUOTES.length)];
  }
  return q;
}
