// Livro 0.9.1 (0.122.3): mudanças nas classes.
export default async function (t) {
  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../../modulos/compendios.mjs", import.meta.url), "utf8");
  t(/\{ campo: "reducaoDanoAtaque", valor: "1", porRank: porRank\(2, 3, 4, 5\) \}/.test(src), "Guarda Defensiva com Escudo: não reduz dano de Condição");
  const iL = src.indexOf(`seedId: "magia-pagina-21-conjurar-espada-lunar"`); const lunar = src.slice(iL, iL + 3000);
  const custos = [...lunar.matchAll(/armaConjuradaCustoMana: (\d)/g)].map(m => m[1]).join(",");
  t(custos === "1,2,3", `Espada Lunar: Mana por ataque 1/2/3 (achou ${custos})`);
  const inv = fs.readFileSync(new URL("../../modulos/inventor.mjs", import.meta.url), "utf8");
  t(/id: "blindagem", categoria: "df", custo: 4/.test(inv), "Inventor: característica defensiva nova (4 PdI)");
  t(/Só uma por fórmula que você possua/.test(inv), "Inventor: uma arma por fórmula");
  const mov = fs.readFileSync(new URL("../../modulos/movimento.mjs", import.meta.url), "utf8");
  t(/if \(!naurenTemAliadoParaPrioridade\(tokenDoc\)\) planos\.defensivo/.test(mov), "Defensivo só com aliado em cena (janela)");
  const bt = fs.readFileSync(new URL("../../modulos/borda-token.mjs", import.meta.url), "utf8");
  t(/tipoA === "defensivo" && !movTipos\.naurenTemAliadoParaPrioridade/.test(bt), "Defensivo só com aliado em cena (modo automático)");
  const { NAUREN_LIVRO091_SEEDS } = await import("../../modulos/livro-09.mjs");
  t(NAUREN_LIVRO091_SEEDS.length === 3, "fichas existentes recebem as 3 mudanças");
}
