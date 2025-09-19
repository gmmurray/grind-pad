export function alphabeticalDedupe(input: string[]) {
  return dedupe(input).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );
}

export function dedupe(input: string[]) {
  return [...new Set(input).values()];
}
