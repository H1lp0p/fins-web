import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wsDir = path.resolve(__dirname, "../src/generated/ws");

const isEnumFile = (filename) => /^AnonymousSchema_\d+\.ts$/.test(filename);

for (const name of fs.readdirSync(wsDir)) {
  if (!name.endsWith(".ts") || name === "index.ts") continue;
  const fp = path.join(wsDir, name);
  let s = fs.readFileSync(fp, "utf8");
  const lines = s.split(/\r?\n/);
  const out = lines.map((line) => {
    const im = line.match(
      /^import \{([^}]+)\} from '(\.\/AnonymousSchema[^']+)';$/,
    );
    if (im) return line;

    const im2 = line.match(/^import \{([^}]+)\} from '(\.\/[^']+)';$/);
    if (im2) {
      return `import type {${im2[1]}} from '${im2[2]}';`;
    }

    if (isEnumFile(name)) return line;

    const ex = line.match(/^export \{ (\w+) \};$/);
    if (ex) {
      return `export type { ${ex[1]} };`;
    }
    return line;
  });
  fs.writeFileSync(fp, out.join("\n"), "utf8");
}

const indexTs = `export type { ClientSubscribePayload } from "./ClientSubscribePayload";
export type { ClientUnsubscribePayload } from "./ClientUnsubscribePayload";
export type { ServerSnapshotPayload } from "./ServerSnapshotPayload";
export type { ServerTransactionPayload } from "./ServerTransactionPayload";
export type { ServerErrorPayload } from "./ServerErrorPayload";
export type { TransactionsStream } from "./TransactionsStream";
export type { PageTransactionOperation } from "./PageTransactionOperation";
export type { TransactionOperation } from "./TransactionOperation";
export type { MoneyValueDto } from "./MoneyValueDto";
export type { SortObject } from "./SortObject";
export type { PageableObject } from "./PageableObject";
export { AnonymousSchema_16 } from "./AnonymousSchema_16";
export { AnonymousSchema_18 } from "./AnonymousSchema_18";
export { AnonymousSchema_20 } from "./AnonymousSchema_20";
`;
fs.writeFileSync(path.join(wsDir, "index.ts"), indexTs, "utf8");

console.log("patched modelina ws output for verbatimModuleSyntax");
