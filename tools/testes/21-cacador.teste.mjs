// Caçador no livro 0.9 (0.119): Marca do Caçador +2 … +7 e custos do Espírito do Caçador.
export default async function (t) {
  const c = await import("../../modulos/cacador-espirito.mjs");
  // Rank da Marca pelo nível: 1 (nível 1), 2 (6), 3 (9), 4 (12), 5 (15), 6 (18).
  [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]].forEach(([rk, v]) => t(c.naurenValorMarcaDoCacador(rk) === v, `Marca rank ${rk} → +${v}`));
  t(c.naurenValorMarcaDoCacador(0) === 2 && c.naurenValorMarcaDoCacador(9) === 7, "rank fora da faixa fica entre +2 e +7");
  t(c.NAUREN_ASPECTOS_CACADOR.harpia.custo === 1 && c.NAUREN_ASPECTOS_CACADOR.tubarao.custo === 1 && c.NAUREN_ASPECTOS_CACADOR.mantis.custo === 3, "custos Harpia 1, Tubarão 1, Mantis 3");
  t(c.naurenCustoAspectos(["harpia", "tubarao"]) === 2 && c.naurenCustoAspectos([]) === 0, "Harpia + Tubarão = 2 pontos");
  t(c.naurenAspectosPreAtaqueDisponiveis(0).length === 0 && c.naurenAspectosPreAtaqueDisponiveis(1).join() === "harpia,tubarao", "com 1 ponto, oferece os dois (um de cada vez)");
  const ator = { items: [{ type: "habilidade", name: "Espírito do Caçador", system: { ativo: true } }], system: { recursosCustom: [{ id: "espiritodocacador", valor: 3, max: 4 }] } };
  t(c.naurenTemEspiritoDoCacador(ator) && c.naurenPontosEspiritoCacador(ator).valor === 3, "lê a reserva do Espírito do Caçador");

  // Semente: fórmulas da Marca e o Espírito do Caçador no nível 1 do Caçador.
  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../../modulos/compendios.mjs", import.meta.url), "utf8");
  t(/soComBeneficioMarca: "focoMortal", alcanceExtra: "1\+@rank"/.test(src), "Foco Mortal: 1 + rank metros (+2 no rank 1)");
  t(/soComBeneficioMarca: "tiroLetal", danoExtraFixoPor: "rank", danoExtraFixoValor: "1", danoExtraFixoSoma: "1"/.test(src), "Tiro Letal: rank + 1 de dano");
  t(/nivel: 1, itensConcedidos: \[\{ uuid: h\.marcaDoCacador \}, \.\.\.\(h\.espiritoDoCacador/.test(src), "Caçador nível 1 concede o Espírito do Caçador");
  t(/"habilidade-cacador-espirito-do-cacador"[\s\S]{0,400}maxFormula: "@espirito"/.test(src), "reserva do Espírito do Caçador = Espírito");
  // Campo novo existe no esquema (senão o Foundry apagaria a soma fixa).
  const nm = fs.readFileSync(new URL("../../nauren.mjs", import.meta.url), "utf8");
  t((nm.match(/danoExtraFixoSoma: new StringField/g) ?? []).length === 3, "danoExtraFixoSoma está nos 3 esquemas de efeitosEmAtaques");
}
