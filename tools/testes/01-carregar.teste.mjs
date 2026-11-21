// O sistema inteiro carrega no Node e nenhum gancho é registrado duas vezes (duplicaria efeitos, itens e condições).
import { hooks } from "./foundry-falso.mjs";
export default async function (t) {
  const m = await import("../../nauren.mjs");
  t(Object.keys(m).length > 100, "nauren.mjs exporta as funções");
  for (const [n, fn] of hooks.once.filter(h => h[0] === "init")) { try { await fn(); } catch (err) { /* sem Foundry de verdade */ } }
  const cont = new Map();
  for (const [n, fn] of hooks.on) { const k = `${n}|${fn.toString()}`; cont.set(k, (cont.get(k) ?? 0) + 1); }
  const dup = [...cont].filter(([, c]) => c > 1).map(([k]) => k.split("|")[0]);
  t(!dup.length, `ganchos repetidos: ${dup.join(", ")}`);
}
