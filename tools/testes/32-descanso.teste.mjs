// Descansar recupera toda a Mana (0.124.4), além dos usos por dia/cena.
export default async function (t) {
  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../../modulos/ficha-ator.mjs", import.meta.url), "utf8");
  const ini = src.indexOf("static async onDescansar("), fim = src.indexOf("\n  }\n", ini);
  const corpo = src.slice(ini, fim);
  t(ini > 0 && /naurenRecarregarUsos\(this\.actor, escopo\)/.test(corpo), "descanso recarrega usos por dia, cena e turno");
  t(/"system\.mana\.value": manaMax/.test(corpo), "descanso põe a Mana no máximo");
  t(corpo.indexOf("system.mana.value") < corpo.indexOf('naurenProcessarGatilhos("aoDescansar"'), "a Mana volta antes dos gatilhos \"ao descansar\"");
  const tpl = fs.readFileSync(new URL("../../templates/personagem-sheet.html", import.meta.url), "utf8");
  t(tpl.includes("Recupera toda a Mana") && !tpl.includes("Vida, Mana, Estamina e Estresse ficam"), "textos da ficha falam da Mana");
}
