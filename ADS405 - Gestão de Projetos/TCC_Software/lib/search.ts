// Text-search helpers for pt-BR content.
//
// MongoDB `$regex` queries do not honor collation, so a naive regex search for
// "vicosa" would never match the stored "Viçosa". To keep search usable without
// maintaining a separate normalized column, we expand each accent-bearing letter
// into a character class that matches every accented variant.

const ACCENT_GROUPS: Record<string, string> = {
  a: "aàáâãä",
  e: "eèéêë",
  i: "iìíîï",
  o: "oòóôõö",
  u: "uùúûü",
  c: "cç",
  n: "nñ",
};

const REGEX_META = /[.*+?^${}()|[\]\\]/;

/**
 * Builds a case- and accent-insensitive RegExp source for a free-text term.
 * Use together with `$options: "i"`.
 */
export function accentInsensitivePattern(term: string): string {
  return Array.from(term.trim())
    .map((char) => {
      const lower = char.toLowerCase();
      const group = ACCENT_GROUPS[lower];
      if (group) {
        return `[${group}${group.toUpperCase()}]`;
      }
      return REGEX_META.test(char) ? `\\${char}` : char;
    })
    .join("");
}
