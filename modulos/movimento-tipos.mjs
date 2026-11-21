/* Nauren RPG — Tipos de movimento (livro 0.9). Só contas, sem Foundry: a janela, o HUD,
 * a ficha, o modo automático e os testes usam as mesmas funções.
 *
 * Livro: ao fazer uma ação de movimento, escolhe um tipo.
 *   Ofensivo  · P/I (Prioridade para um inimigo) · 1 PdE · movimento total
 *   Defensivo · P/A (Prioridade para um aliado)  · 1 PdE · metade (arredonda para baixo)
 *   Disparada · N/P (não gera Prioridade)        · 3 PdE · dobro
 * Bônus e Condições que mexem no Movimento entram antes (movimentoTotal). Caído divide por 2
 * antes do tipo (Caído + Defensivo = metade da metade). Medo e afins somam o custo extra
 * por ação de movimento. O saldo que sobra só vale para o MESMO tipo, dentro do turno.
 */

export const NAUREN_TIPOS_MOVIMENTO = Object.freeze({
  ofensivo: Object.freeze({ id: "ofensivo", nome: "Ofensivo", indicador: "PI", sigla: "P/I", custo: 1, icone: "fa-person-running", resumo: "Prioridade para um inimigo", lado: "inimigos" }),
  defensivo: Object.freeze({ id: "defensivo", nome: "Defensivo", indicador: "PA", sigla: "P/A", custo: 1, icone: "fa-shield-halved", resumo: "Prioridade para um aliado", lado: "aliados" }),
  disparada: Object.freeze({ id: "disparada", nome: "Disparada", indicador: "NP", sigla: "N/P", custo: 3, icone: "fa-wind", resumo: "Não gera Prioridade", lado: null })
});

export const NAUREN_ORDEM_TIPOS_MOVIMENTO = Object.freeze(["ofensivo", "defensivo", "disparada"]);

export function naurenTipoMovimentoValido(tipo) {
  return Object.hasOwn(NAUREN_TIPOS_MOVIMENTO, tipo) ? tipo : "ofensivo";
}

/** Metros de UMA ação de movimento do tipo. Caído divide antes; Defensivo arredonda para baixo. */
export function naurenMetrosDoTipo(movTotal, tipo, { caido = false } = {}) {
  let base = Math.max(0, Math.floor(Number(movTotal) || 0));
  if (caido) base = Math.floor(base / 2);
  switch (naurenTipoMovimentoValido(tipo)) {
    case "defensivo": return Math.floor(base / 2);
    case "disparada": return base * 2;
    default: return base;
  }
}

/** Custo em PdE de UMA ação do tipo (o extra de Medo e afins soma por ação). */
export function naurenCustoDoTipo(tipo, custoExtra = 0) {
  return NAUREN_TIPOS_MOVIMENTO[naurenTipoMovimentoValido(tipo)].custo + Math.max(0, Number(custoExtra) || 0);
}

/**
 * Plano de uma ação de movimento.
 * @returns {{tipo, metrosPorAcao, acoes, custoPorAcao, custoTotal, saldoUsado, saldoDescartado, novoSaldo, sobra, indicador, possivel}}
 */
export function naurenPlanoMovimento({ movTotal, caido = false, tipo = "ofensivo", distancia = 0, saldo = 0, saldoTipo = null, custoExtra = 0 }) {
  tipo = naurenTipoMovimentoValido(tipo);
  const metrosPorAcao = naurenMetrosDoTipo(movTotal, tipo, { caido });
  const saldoAtual = Math.max(0, Number(saldo) || 0);
  const mesmoTipo = saldoAtual > 0 && saldoTipo === tipo;
  const saldoUsado = mesmoTipo ? saldoAtual : 0;
  const dist = Math.max(0, Number(distancia) || 0);
  const custoPorAcao = naurenCustoDoTipo(tipo, custoExtra);
  const possivel = metrosPorAcao > 0;
  const acoes = possivel ? Math.max(1, Math.ceil((dist - saldoUsado - 0.01) / metrosPorAcao)) : 0;
  const novoSaldo = saldoUsado + acoes * metrosPorAcao;
  return {
    tipo, metrosPorAcao, acoes, custoPorAcao, custoTotal: acoes * custoPorAcao,
    saldoUsado, saldoDescartado: mesmoTipo ? 0 : saldoAtual, novoSaldo,
    sobra: Math.max(0, novoSaldo - dist), indicador: NAUREN_TIPOS_MOVIMENTO[tipo].indicador, possivel
  };
}

/** Os três tipos de uma vez (para a ficha e o HUD). */
export function naurenDistanciasDosTipos(movTotal, { caido = false } = {}) {
  return NAUREN_ORDEM_TIPOS_MOVIMENTO.map(id => ({ ...NAUREN_TIPOS_MOVIMENTO[id], metros: naurenMetrosDoTipo(movTotal, id, { caido }) }));
}

/**
 * Tipo sugerido na janela: o do saldo (se ainda há saldo), senão o que faz o trajeto
 * com o menor custo; empate fica com a ordem Ofensivo → Defensivo → Disparada.
 */
export function naurenTipoSugerido({ movTotal, caido = false, distancia = 0, saldo = 0, saldoTipo = null, custoExtra = 0 }) {
  if (saldo > 0 && Object.hasOwn(NAUREN_TIPOS_MOVIMENTO, saldoTipo)) return saldoTipo;
  let melhor = null;
  for (const id of NAUREN_ORDEM_TIPOS_MOVIMENTO) {
    const p = naurenPlanoMovimento({ movTotal, caido, tipo: id, distancia, saldo, saldoTipo, custoExtra });
    if (!p.possivel) continue;
    if (!melhor || p.custoTotal < melhor.custoTotal) melhor = p;
  }
  return melhor?.tipo ?? "ofensivo";
}

/** Blocos (ações) do modo automático: quantas ações o total andado no turno já exige. */
export function naurenAcoesParaDistancia(distanciaTotal, metrosPorAcao) {
  if (!(metrosPorAcao > 0)) return 0;
  return Math.ceil((Math.max(0, Number(distanciaTotal) || 0) - 0.01) / metrosPorAcao);
}
