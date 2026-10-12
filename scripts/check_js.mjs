// Confere a sintaxe do JavaScript do site: assets/app.js e todos os módulos de assets/js/.
// Lê cada arquivo como módulo ES (é assim que o navegador o carrega), sem depender do "type" do package.json.
// Uso: npm run check:js
import { readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const files = ["assets/app.js", ...readdirSync("assets/js").filter((f) => f.endsWith(".js")).map((f) => join("assets/js", f))];
let bad = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, ["--input-type=module", "--check"], { input: readFileSync(f), encoding: "utf8" });
  if (r.status !== 0) {
    bad++;
    console.error(`${f}: ${(r.stderr || "").split("\n").slice(0, 5).join("\n")}`);
  }
}
if (bad) process.exit(1);
console.log(`OK: sintaxe de ${files.length} arquivos JavaScript.`);
