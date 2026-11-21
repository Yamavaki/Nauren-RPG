// Tipos de movimento do livro 0.9 (0.118): metros, custo, saldo por tipo e Prioridade.
export default async function (t) {
  const m = await import("../../modulos/movimento-tipos.mjs");
  const { naurenMetrosDoTipo: metros, naurenPlanoMovimento: plano, naurenCustoDoTipo: custo, NAUREN_TIPOS_MOVIMENTO: TIPOS } = m;

  // Tabela do livro: 6 m → 6 / 3 / 12; com +2 m → 8 / 4 / 16; com −2 m → 4 / 2 / 8.
  for (const [mov, o, d, x] of [[6, 6, 3, 12], [8, 8, 4, 16], [4, 4, 2, 8], [7, 7, 3, 14], [1, 1, 0, 2], [0, 0, 0, 0]]) {
    t(metros(mov, "ofensivo") === o && metros(mov, "defensivo") === d && metros(mov, "disparada") === x, `Movimento ${mov} m → ${o} / ${d} / ${x}`);
  }
  // Caído divide antes do tipo: Caído + Defensivo = metade da metade (6 → 1).
  t(metros(6, "ofensivo", { caido: true }) === 3, "Caído + Ofensivo: 6 → 3");
  t(metros(6, "defensivo", { caido: true }) === 1, "Caído + Defensivo: 6 → 1");
  t(metros(6, "disparada", { caido: true }) === 6, "Caído + Disparada: 6 → 6");
  t(metros(1, "ofensivo", { caido: true }) === 0, "Preso/Caído com 1 m: 0");

  // Custo e Prioridade.
  t(custo("ofensivo") === 1 && custo("defensivo") === 1 && custo("disparada") === 3, "custo 1 / 1 / 3 PdE");
  t(custo("ofensivo", 1) === 2 && custo("disparada", 1) === 4, "Medo soma +1 por ação");
  t(TIPOS.ofensivo.indicador === "PI" && TIPOS.defensivo.indicador === "PA" && TIPOS.disparada.indicador === "NP", "indicadores P/I, P/A, N/P");
  t(TIPOS.ofensivo.lado === "inimigos" && TIPOS.defensivo.lado === "aliados" && TIPOS.disparada.lado === null, "Ofensivo escolhe inimigo, Defensivo aliado, Disparada ninguém");
  t(m.naurenTipoMovimentoValido("xyz") === "ofensivo", "tipo inválido vira Ofensivo");

  // Planos.
  let p = plano({ movTotal: 6, tipo: "ofensivo", distancia: 6 });
  t(p.acoes === 1 && p.custoTotal === 1 && p.sobra === 0, "6 m Ofensivo: 1 ação, 1 PdE");
  p = plano({ movTotal: 6, tipo: "ofensivo", distancia: 7 });
  t(p.acoes === 2 && p.custoTotal === 2 && p.sobra === 5, "7 m Ofensivo: 2 ações, sobram 5 m");
  p = plano({ movTotal: 6, tipo: "disparada", distancia: 12 });
  t(p.acoes === 1 && p.custoTotal === 3 && p.indicador === "NP", "12 m Disparada: 1 ação, 3 PdE, N/P");
  p = plano({ movTotal: 6, tipo: "defensivo", distancia: 5 });
  t(p.acoes === 2 && p.custoTotal === 2 && p.metrosPorAcao === 3, "5 m Defensivo: 2 × 3 m");
  p = plano({ movTotal: 6, tipo: "disparada", distancia: 10, custoExtra: 1 });
  t(p.custoTotal === 4, "Disparada com Medo: 4 PdE");
  p = plano({ movTotal: 6, caido: true, tipo: "defensivo", distancia: 3 });
  t(p.acoes === 3 && p.metrosPorAcao === 1, "Caído + Defensivo 3 m: 3 ações de 1 m");
  p = plano({ movTotal: 1, tipo: "defensivo", distancia: 1 });
  t(!p.possivel && p.acoes === 0, "Defensivo com 1 m: impossível");
  t(plano({ movTotal: 6, tipo: "ofensivo", distancia: 6.0000001 }).acoes === 1, "erro de arredondamento não cobra ação a mais");

  // Saldo só vale para o mesmo tipo.
  p = plano({ movTotal: 6, tipo: "ofensivo", distancia: 8, saldo: 2, saldoTipo: "ofensivo" });
  t(p.acoes === 1 && p.saldoUsado === 2 && p.saldoDescartado === 0 && p.novoSaldo === 8, "saldo Ofensivo de 2 m + 1 ação cobre 8 m");
  p = plano({ movTotal: 6, tipo: "ofensivo", distancia: 8, saldo: 2, saldoTipo: "defensivo" });
  t(p.acoes === 2 && p.saldoUsado === 0 && p.saldoDescartado === 2, "saldo Defensivo não vale para Ofensivo (é descartado)");
  p = plano({ movTotal: 6, tipo: "disparada", distancia: 14, saldo: 3, saldoTipo: "disparada" });
  t(p.acoes === 1 && p.sobra === 1, "saldo de Disparada vale para Disparada");

  // Sugestão e listas.
  t(m.naurenTipoSugerido({ movTotal: 6, distancia: 6 }) === "ofensivo", "sugestão: Ofensivo quando 1 ação basta");
  t(m.naurenTipoSugerido({ movTotal: 6, distancia: 3, saldo: 1, saldoTipo: "defensivo" }) === "defensivo", "sugestão: continua o tipo do saldo");
  const lista = m.naurenDistanciasDosTipos(8);
  t(lista.map(x => x.metros).join("/") === "8/4/16" && lista.map(x => x.id).join() === "ofensivo,defensivo,disparada", "lista dos três tipos (8 / 4 / 16)");
  t(m.naurenAcoesParaDistancia(13, 6) === 3 && m.naurenAcoesParaDistancia(12, 6) === 2 && m.naurenAcoesParaDistancia(5, 0) === 0, "ações no modo automático");

  // O módulo de movimento carrega e o tipo preferido começa Ofensivo.
  const mov = await import("../../modulos/movimento.mjs");
  const ator = { uuid: "Actor.X" };
  t(mov.naurenTipoPreferido(ator) === "ofensivo", "tipo preferido padrão: Ofensivo");
  mov.naurenDefinirTipoPreferido(ator, "disparada");
  t(mov.naurenTipoPreferido(ator) === "disparada", "HUD muda o tipo preferido");
  mov.naurenDefinirTipoPreferido(ator, "??");
  t(mov.naurenTipoPreferido(ator) === "ofensivo", "tipo preferido inválido volta a Ofensivo");
}
