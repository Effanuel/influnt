export function promisify<T>(item: Record<string, T>): Record<string, () => Promise<T>> {
  return Object.assign(
    {} as Record<string, () => Promise<T>>,
    Object.entries(item).map(([key, value]) => ({[key]: () => Promise.resolve(value)})),
  );
}
