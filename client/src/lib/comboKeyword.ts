export function matchesComboKeyword(value: string, keyword: string): boolean {
  if (keyword === "すべて") return true;

  return value
    .split(/[・、,/／\s]+/)
    .filter(Boolean)
    .some((part) => part === keyword || part.includes(keyword) || keyword.includes(part));
}
