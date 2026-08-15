import ts from "typescript";

export type StaticValue =
  | string
  | number
  | boolean
  | StaticValue[]
  | { [key: string]: StaticValue };

function unsupported(node: ts.Node): never {
  throw new Error(`Unsupported static TypeScript expression: ${ts.SyntaxKind[node.kind]}`);
}

function propertyName(name: ts.PropertyName): string {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return unsupported(name);
}

function staticValue(node: ts.Expression): StaticValue {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;

  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand)
  ) {
    return -Number(node.operand.text);
  }

  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => {
      if (ts.isSpreadElement(element) || ts.isOmittedExpression(element)) return unsupported(element);
      return staticValue(element);
    });
  }

  if (ts.isObjectLiteralExpression(node)) {
    const output: Record<string, StaticValue> = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) return unsupported(property);
      output[propertyName(property.name)] = staticValue(property.initializer);
    }
    return output;
  }

  return unsupported(node);
}

function findExportedInitializer(sourceFile: ts.SourceFile, exportName: string): ts.Expression {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const exported = statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== exportName) continue;
      if (!declaration.initializer) {
        throw new Error(`Static export ${exportName} has no initializer`);
      }
      return declaration.initializer;
    }
  }

  throw new Error(`Static export ${exportName} was not found`);
}

export function parseStaticExportedArray(
  source: string,
  exportName: string,
): Array<Record<string, StaticValue>> {
  const sourceFile = ts.createSourceFile(
    "source-data.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const parseDiagnostics = (sourceFile as ts.SourceFile & { parseDiagnostics?: readonly ts.Diagnostic[] })
    .parseDiagnostics;
  if (parseDiagnostics?.length) {
    const diagnostic = parseDiagnostics[0]!;
    throw new Error(`Invalid static TypeScript source: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`);
  }

  const initializer = findExportedInitializer(sourceFile, exportName);
  if (!ts.isArrayLiteralExpression(initializer)) return unsupported(initializer);

  return initializer.elements.map((element) => {
    if (ts.isSpreadElement(element) || ts.isOmittedExpression(element)) return unsupported(element);
    const value = staticValue(element);
    if (Array.isArray(value) || typeof value !== "object") return unsupported(element);
    return value;
  });
}
