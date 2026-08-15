function boundedInteger(value: number, label: string, minimum: number, maximum: number): number {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer`);
  }
  if (value < minimum || value > maximum) {
    throw new Error(`${label} must be between ${minimum} and ${maximum}`);
  }
  return value;
}

export function gateId(ordinal: number): string {
  return `gate-${String(boundedInteger(ordinal, "Gate ordinal", 1, 12)).padStart(2, "0")}`;
}

export function pathId(ordinal: number): string {
  return `path-${String(boundedInteger(ordinal, "Path ordinal", 1, 12)).padStart(2, "0")}`;
}

export function realmId(realmNumber: number): string {
  return `realm-${String(boundedInteger(realmNumber, "Realm number", 1, 144)).padStart(3, "0")}`;
}
