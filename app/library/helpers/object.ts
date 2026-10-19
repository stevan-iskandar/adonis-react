/**
 * Drops the keys whose value is `undefined`, so `merge()` leaves those columns
 * unchanged while `null` still clears them.
 */
export function definedOnly<T extends object>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Partial<T>
}
