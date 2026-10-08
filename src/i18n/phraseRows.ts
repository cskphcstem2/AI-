export type PhraseRow = readonly [string, string, string, string, string, string];

export function phraseMap(rows: readonly PhraseRow[]) {
  const map = new Map<string, { en: string; fr: string; es: string; ru: string; ar: string }>();
  for (const [zh, en, fr, es, ru, ar] of rows) {
    map.set(zh, { en, fr, es, ru, ar });
  }
  return map;
}
