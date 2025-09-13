/**
 * Calculate the new position value when moving an item.
 * Works on plain number arrays (positions only).
 */
export function calcNewPosition(positions: number[], newIndex: number): number {
  if (positions.length === 0) return 1000; // first item baseline

  if (newIndex <= 0) {
    // Insert at start: take smallest and subtract a step
    return positions[0] - 1000;
  }

  if (newIndex >= positions.length) {
    // Insert at end: take largest and add a step
    return positions[positions.length - 1] + 1000;
  }

  // Insert between two neighbors
  const prev = positions[newIndex - 1];
  const next = positions[newIndex];
  return (prev + next) / 2;
}

/**
 * Check if the candidate position collided with its neighbors.
 * If true, caller should trigger a full rebalance.
 */
export function isOutOfSpace(
  candidate: number,
  prev: number,
  next: number,
): boolean {
  // Too close to distinguish (or equal)
  return !(candidate > prev && candidate < next);
}

/**
 * Rebuild a full set of positions with consistent gaps.
 * Usually index * 1000, but configurable step.
 */
export function rebalancePositions(length: number, step = 1000): number[] {
  return Array.from({ length }, (_, i) => (i + 1) * step);
}

/**
 * Convenience wrapper for arrays of objects with a `position` field.
 * Returns the new position value for the moved item.
 */
export function calcNewItemPosition<T extends { position: number }>(
  items: T[],
  newIndex: number,
): number {
  const positions = items.map(i => i.position).sort((a, b) => a - b);
  return calcNewPosition(positions, newIndex);
}
