// Tabela de XP e "diminuir o XP desce o nível" (0.116.4).
import { hooks } from "./foundry-falso.mjs";
export default async function (t) {
  const { naurenXpParaNivel, naurenNivelPeloXp } = await import("../../modulos/ficha-ator.mjs");
  const tabela = [0, 200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400, 6500, 7700, 9000, 10400, 11900, 13500, 15200, 17000, 18900, 20900];
  tabela.forEach((xp, i) => t(naurenXpParaNivel(i + 1) === xp, `XP do nível ${i + 1} = ${xp}`));
  t(naurenNivelPeloXp(600) === 3 && naurenNivelPeloXp(199) === 1 && naurenNivelPeloXp(20900) === 20, "nível pelo XP");
  await import("../../nauren.mjs");
  const pre = hooks.on.filter(h => h[0] === "preUpdateActor").map(h => h[1]);
  const caso = (nivel, novoXp, tipo = "personagem") => { const ator = { type: tipo, uuid: "A", system: { nivel, xp: 0, vida: {}, estaminaCombate: {}, stress: {} } }; const ch = { system: { xp: novoXp } }; for (const f of pre) { try { f(ator, ch, {}); } catch (err) { /* outro gancho */ } } return ch.system.nivel; };
  t(caso(5, 600) === 3, "nível 5 com 600 XP desce para 3");
  t(caso(5, 1450) === undefined, "XP dentro do nível não mexe no nível");
  t(caso(2, 5000) === undefined, "aumentar XP não sobe sozinho");
  t(caso(5, 0, "npc") === undefined, "NPC não desce");
}
