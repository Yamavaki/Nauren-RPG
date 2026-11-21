// Poesia Ghurua (livro 0.9, 0.121).
export default async function (t) {
  const pg = await import("../../modulos/poesia-ghurua.mjs");
  const tira = pg.naurenTirarDadosDaFormula;
  t(tira("3d6+2", 1).formula === "2d6+2" && tira("3d6+2", 1).tirados === 1, "3d6+2 com 1 dado a menos = 2d6+2");
  t(tira("1d8+4", 1).formula === "0+4", "1d8+4 com 1 dado a menos = só o bônus");
  t(tira("d6", 1).formula === "0", "d6 sozinho some");
  t(tira("1d4+1d6", 1).formula === "0+1d6", "tira do 1º termo de dado");
  t(tira("5+3", 1).tirados === 0, "sem dado: nada a tirar");
  const lado = pg.naurenLadoNaPoesia;
  t(lado({ dispFonte: 1, dispAlvo: -1, distancia: 12 }) === "inimigo", "inimigo a 12 m: Condição de inimigo");
  t(lado({ dispFonte: 1, dispAlvo: 1, distancia: 20 }) === "aliado", "aliado a 20 m: dentro");
  t(lado({ dispFonte: 1, dispAlvo: 1, distancia: 20.5 }) === null, "a 20,5 m: fora");
  t(lado({ dispFonte: 1, dispAlvo: 0, distancia: 3 }) === null, "neutro: fora");
  t(lado({ dispFonte: 1, dispAlvo: 1, ehFonte: true, distancia: 0 }) === null, "o próprio Místico não recebe a Condição de aliado");
  t(Object.keys(pg.NAUREN_POESIAS_GHURUA).join() === "chuva,aroma,veu" && pg.NAUREN_POESIA_RAIO === 20 && pg.NAUREN_CABACA_RAIO === 4, "3 poesias, 20 m, cabaças a 4 m");

  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../../modulos/compendios.mjs", import.meta.url), "utf8");
  for (const seed of ["condicao-poesia-ghurua-chuva", "condicao-sob-chuva-infinita-inimigo", "condicao-sob-chuva-infinita-aliado", "condicao-poesia-ghurua-aroma", "condicao-poesia-ghurua-veu", "condicao-sob-veu-das-brumas-inimigo", "condicao-sob-veu-das-brumas-aliado"])
    t(src.includes(`"${seed}"`), `semente ${seed}`);
  t(/custoEstaminaExtraAtaques: 1, dadosDanoAMenos: 1/.test(src), "Chuva (inimigo): +1 Estamina e 1 dado a menos");
  t(/recurso: "cura", formula: "1d6", aumentaPorAcumulo: false, quando: "inicioTurnoQualquer"/.test(src), "Chuva (aliado): 1d6 de Vida no início de cada turno (de qualquer um)");
  t(/recurso: "recursoCustom:energia", formula: "1", aumentaPorAcumulo: false, quando: "inicioTurnoQualquer"/.test(src), "Aroma: +1 Energia no início de cada turno (de qualquer um)");
  t(/bloqueiaPrimeiraPrioridadeTurno: true/.test(src) && /campo: "vantagemAtaque", valor: "vantagem"/.test(src), "Véu: sem 1ª Prioridade (inimigo) e Facilidade (aliado)");
  t(/rolarBrinde: true, beberCabacaGhurua: true,\s*\n\s*prioridadeIndicador: "PA"/.test(src) && /nome: "Beber cabaça \(Aroma de Licor\)", categoria: "Subclasse", custoEstamina: 1/.test(src), "Beber cabaça: 1 PdE, P/A, ativa o Brinde");
  t(/para ter Conjuração Poderosa/.test(src), "Páginas em Chamas: texto novo");
  const nm = fs.readFileSync(new URL("../../nauren.mjs", import.meta.url), "utf8");
  t(/custoEstaminaExtraAtaques: new NumberField/.test(nm) && /dadosDanoAMenos: new NumberField/.test(nm) && /bloqueiaPrimeiraPrioridadeTurno: new BooleanField/.test(nm) && /beberCabacaGhurua: new BooleanField/.test(nm), "campos novos no esquema");
  const fa = fs.readFileSync(new URL("../../modulos/ficha-ator.mjs", import.meta.url), "utf8");
  t(/naurenEscolherPoesiaGhurua/.test(fa) && !/condicao-poesia-lunar", label: "Poesia Lunar \(dado no próximo ataque\)"/.test(fa), "Dança oferece as 3 Poesias Ghurua");
}
