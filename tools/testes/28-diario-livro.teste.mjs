// 0.122.2: diário "Regras do Livro" com o texto inteiro do livro.
export default async function (t) {
  const { NAUREN_LIVRO_PAGINAS: P, NAUREN_LIVRO_VERSAO: V } = await import("../../data/livro-regras.mjs");
  t(V === "0.9.1", "versão do livro 0.9.1");
  t(P.length >= 20 && P.every(p => p.nome && p.html.startsWith('<div class="nauren-regras">')), "páginas montadas");
  const nomes = P.map(p => p.nome).join(" | ");
  for (const c of ["Druida", "Guerreiro", "Ladino", "Místico", "Caçador", "Mago", "Sacerdote", "Empíreo", "Inventor"]) t(nomes.includes(`Classe — ${c}`), `página da classe ${c}`);
  const tudo = P.map(p => p.html).join("\n");
  t(/Movimento Ofensivo/.test(tudo) && /Disparada/.test(tudo), "regra nova de movimento");
  t(!/removido em breve/i.test(tudo) && !/Nova regra que entra em Teste/i.test(tudo), "sem a regra antiga de movimento nem marcas de rascunho");
  t(/Ataque Desarmado/.test(tudo) && /Ataques de Condição/.test(tudo), "Ataque Desarmado e Ataques de Condição");
  t(!/<h[1-6]>\s*Com 1 peculiaridade/.test(tudo), "parágrafos que o Docs marcou como título viraram parágrafo");
  t(!/\\\+/.test(tudo), "sem barras de escape do Markdown");
  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../../modulos/compendios.mjs", import.meta.url), "utf8");
  t(/NAUREN_REGRAS_VERSAO = 5;/.test(src) && /paginas: NAUREN_LIVRO_PAGINAS/.test(src), "diário recriado com as páginas novas (versão 5)");
  t(/Ctrl<\/b> e clique/.test(src) && /Disparada<\/td>/.test(src), "Guia do Jogador: movimento com tipos e ponto a ponto");
}
