// Confere a sintaxe do JavaScript do site: assets/app.js e todos os módulos de assets/js/.
// Uso: npm run check:js
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const files = ["assets/app.js", ...readdirSync("assets/js").filter((f) => f.endsWith(".js")).map((f) => join("assets/js", f))];
let bad = 0;
for (const f of files) {
  try {
    execFileSync(process.execPath, ["--check", f], { stdio: "pipe" });
  } catch (e) {
    bad++;
    console.error(`${f}: ${String(e.stderr || e.message).split("\n").slice(0, 4).join("\n")}`);
  }
}
if (bad) process.exit(1);
console.log(`OK: sintaxe de ${files.length} arquivos JavaScript.`);
