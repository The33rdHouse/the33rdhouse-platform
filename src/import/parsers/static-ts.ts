import { staticSourceRecordSchema } from "../schemas/backend";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractExportedArrayObjects(source: string, exportName: string): string[] {
  const marker = new RegExp(`export\\s+const\\s+${escapeRegExp(exportName)}\\b[\\s\\S]*?=`).exec(source);
  if (!marker || marker.index === undefined) {
    throw new Error(`Static export ${exportName} was not found`);
  }

  const arrayStart = source.indexOf("[", marker.index + marker[0].length);
  if (arrayStart < 0) {
    throw new Error(`Static export ${exportName} does not contain an array literal`);
  }

  const objects: string[] = [];
  let squareDepth = 1;
  let curlyDepth = 0;
  let objectStart = -1;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = arrayStart + 1; index < source.length; index += 1) {
    const char = source[index]!;
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === "[") {
      squareDepth += 1;
      continue;
    }
    if (char === "]") {
      squareDepth -= 1;
      if (squareDepth === 0) break;
      continue;
    }
    if (char === "{") {
      if (curlyDepth === 0 && squareDepth === 1) objectStart = index;
      curlyDepth += 1;
      continue;
    }
    if (char === "}") {
      if (curlyDepth === 0) throw new Error(`Unbalanced object literal in ${exportName}`);
      curlyDepth -= 1;
      if (curlyDepth === 0 && objectStart >= 0) {
        objects.push(source.slice(objectStart, index + 1));
        objectStart = -1;
      }
    }
  }

  if (squareDepth !== 0 || curlyDepth !== 0 || quote || blockComment) {
    throw new Error(`Unbalanced static array export ${exportName}`);
  }

  return objects;
}

function readQuotedValue(source: string, start: number, quote: string): string {
  let value = "";
  let escaped = false;
  const escapes: Record<string, string> = {
    n: "\n",
    r: "\r",
    t: "\t",
    "\\": "\\",
    "'": "'",
    '"': '"',
    "`": "`",
  };

  for (let index = start + 1; index < source.length; index += 1) {
    const char = source[index]!;
    if (escaped) {
      value += escapes[char] ?? char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === quote) return value;
    value += char;
  }

  throw new Error("Unterminated string literal in static source");
}

export function extractStaticFields(
  objectSource: string,
  keys: readonly string[],
): Record<string, string | number | boolean> {
  const fields: Record<string, string | number | boolean> = {};

  for (const key of keys) {
    const match = new RegExp(`\\b${escapeRegExp(key)}\\s*:\\s*`).exec(objectSource);
    if (!match || match.index === undefined) continue;

    const valueStart = match.index + match[0].length;
    const char = objectSource[valueStart];
    if (char === "'" || char === '"' || char === "`") {
      fields[key] = readQuotedValue(objectSource, valueStart, char);
      continue;
    }

    const tail = objectSource.slice(valueStart);
    const numberMatch = /^-?\d+(?:\.\d+)?/.exec(tail);
    if (numberMatch) {
      fields[key] = Number(numberMatch[0]);
      continue;
    }
    const booleanMatch = /^(true|false)\b/.exec(tail);
    if (booleanMatch) fields[key] = booleanMatch[1] === "true";
  }

  return fields;
}

export function parseStaticExportedArray(
  source: string,
  exportName: string,
  scalarKeys: readonly string[],
): Array<{ rawSource: string; fields: Record<string, string | number | boolean> }> {
  return extractExportedArrayObjects(source, exportName).map((rawSource) =>
    staticSourceRecordSchema.parse({
      rawSource,
      fields: extractStaticFields(rawSource, scalarKeys),
    }),
  );
}
