/**
 * Testes automáticos do Nauren RPG (sem Foundry): node tools/testes/rodar.mjs [filtro]
 * Cada arquivo tools/testes/*.teste.mjs exporta `default async function (t)`; t(condição, "mensagem").
 * Sai com código 1 se algum falhar — a GitHub Action não publica a versão nesse caso.
 */
import "./foundry-falso.mjs";
import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
const aqui = path.dirname(fileURLToPath(import.meta.url));
const filtro = process.argv[2] ?? "";
const arquivos = readdirSync(aqui).filter(a => a.endsWith(".teste.mjs") && a.includes(filtro)).sort();
// os módulos imprimem avisos de "faltou o Foundry de verdade"; só mostramos o que é dos testes
const logOriginal = { log: console.log, warn: console.warn, error: console.error };
let total = 0, falhas = 0;
for (const a of arquivos) {
  let ok = 0; const erros = [];
  const t = (cond, msg) => { total++; if (cond) ok++; else { falhas++; erros.push(msg); } };
  console.warn = console.error = console.log = () => {};
  try { await (await import(pathToFileURL(path.join(aqui, a)).href)).default(t); }
  catch (err) { falhas++; total++; erros.push(`quebrou: ${err?.stack?.split("\n").slice(0, 3).join(" | ") ?? err}`); }
  Object.assign(console, logOriginal);
  console.log(`${erros.length ? "✗" : "✓"} ${a.replace(".teste.mjs", "")}: ${ok} ok${erros.length ? `, ${erros.length} falha(s)` : ""}`);
  for (const e of erros) console.log(`    - ${e}`);
}
console.log(`\n${total - falhas}/${total} verificações passaram${falhas ? ` — ${falhas} FALHARAM` : ""}.`);
process.exit(falhas ? 1 : 0);
