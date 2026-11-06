/* Nauren RPG — Inventor: Recarga de usos e Bancada de Invenção. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { naurenEhItem, naurenNomeBate, naurenResolverSelfEmObjeto, naurenUsosExtrasPara, naurenValidarFormula } from "./entidades-campo.mjs";
import { ATRIBUTOS_BONUS, NAUREN_CAMPOS_MODIFICADOR_OPCOES, naurenFormulaComTokensDoAtor, naurenFormulaParaTexto, naurenInterpretarModificador, naurenPostarCard, naurenResolverPorNivel, naurenTextoRolagem } from "../nauren.mjs";
import { naurenConcederRecurso, naurenProcessarGatilhos } from "./icone-condicao-token.mjs";
import { naurenLimiteOfensivoBase, naurenPesoOfensivo, naurenPesoOfensivoEquipado } from "./equipamento-regras.mjs";
import { NaurenAlambique, NaurenObraPrima, naurenAbrirLoja, naurenTextoEfeitoFrasco } from "./inventor.mjs";



/* ===================== 0.94 - Inventor: Recarga de usos (G1) =====================
 * Uma Ação com "recarregaUsos" devolve usos ao item (usos compartilhados da arma) ou, sem eles,
 * à 1ª Ação do item com usos. O valor vem de "recarregaFormula" + "recarregaBonus", nunca passa do
 * máximo e dispara o gatilho "aoRecarregar".
 * ================================================================================ */
function naurenAlvoDaRecarga(item, acao) {
  // 0.94.1: recarregar outro item da ficha (ex.: Exercício Teórico devolve o "Preparar Frasco").
  if (acao?.recarregaItemNome) {
    const outro = (item?.actor?.items ?? []).find(i => i !== item && naurenEhItem(i, acao.recarregaItemNome));
    if (!outro) return null;
    if (acao.recarregaAcaoNome) {
      const idxO = (outro.system.acoes ?? []).findIndex(a => a.usaUsos && naurenNomeBate(a.nome, acao.recarregaAcaoNome));
      if (idxO < 0) return null;
      const aO = outro.system.acoes[idxO];
      const nivelO = outro.actor?.system?.nivel || 1;
      const pnO = naurenResolverPorNivel(aO.usosMaxPorNivel, nivelO, "valor");
      const maxO = (pnO !== null ? pnO : (aO.usosMax ?? 0)) + naurenUsosExtrasPara(outro.actor, outro, aO.nome);
      return { nome: aO.nome, atual: aO.usosAtual ?? 0, max: maxO, aplicar: v => { const ac = foundry.utils.deepClone(outro.system.acoes); ac[idxO].usosAtual = v; return outro.update({ "system.acoes": ac }); } };
    }
    return naurenAlvoDaRecarga(outro, { ...acao, recarregaItemNome: "" });
  }
  const sys = item?.system;
  if (!sys) return null;
  const nivel = item.actor?.system?.nivel || 1;
  if (sys.usaUsos) {
    const porNivel = naurenResolverPorNivel(sys.usosMaxPorNivel, nivel, "valor");
    const max = porNivel !== null ? porNivel : (sys.usosMax ?? 0);
    return { nome: item.name, atual: sys.usosAtual ?? 0, max, aplicar: v => item.update({ "system.usosAtual": v }) };
  }
  const idx = (sys.acoes ?? []).findIndex(a => a.usaUsos && a !== acao && !a.recarregaUsos);
  if (idx < 0) return null;
  const a = sys.acoes[idx];
  const porNivel = naurenResolverPorNivel(a.usosMaxPorNivel, nivel, "valor");
  const max = porNivel !== null ? porNivel : (a.usosMax ?? 0);
  return { nome: a.nome || item.name, atual: a.usosAtual ?? 0, max, aplicar: v => {
    const acoes = foundry.utils.deepClone(sys.acoes); acoes[idx].usosAtual = v; return item.update({ "system.acoes": acoes });
  } };
}

async function naurenExecutarRecarga(actor, item, acao) {
  const alvo = naurenAlvoDaRecarga(item, acao);
  if (!alvo) return null;
  const formula = [acao.recarregaFormula || "1d6", acao.recarregaBonus].filter(f => String(f ?? "").trim()).map(f => `(${f})`).join("+");
  let total = 0, texto = "";
  try {
    const roll = await new Roll(naurenFormulaComTokensDoAtor(formula, actor)).evaluate();
    total = Math.max(0, Math.round(roll.total || 0));
    texto = naurenTextoRolagem(roll);
    if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true).catch(() => {});
  } catch (err) { console.warn("Nauren RPG | Recarga: fórmula inválida", formula, err); }
  const novo = Math.min(alvo.max, alvo.atual + total);
  await alvo.aplicar(novo);
  naurenProcessarGatilhos("aoRecarregar", actor, { itemUsadoUuid: item.uuid, acaoNome: acao.nome, recarregou: novo - alvo.atual })
    .catch(err => console.warn("Nauren RPG | gatilhos de recarga", err));
  // Fórmula fixa grande (ex.: "99" do Exercício Teórico) = "enche": não mostra o número, só que voltou ao máximo.
  const enche = /^\(?\d+\)?$/.test(formula.trim()) && total >= 50;
  return { label: alvo.nome && alvo.nome !== item.name ? `Recarregou ${alvo.nome}` : "Recarregou", value: `+${novo - alvo.atual} uso(s) → ${novo}/${alvo.max}`,
    breakdown: enche ? "volta ao máximo" : `${texto}${alvo.atual + total > alvo.max ? ` (o resto passou do máximo de ${alvo.max})` : ""}` };
}


/* ===================== 0.94 - Bancada de Invenção (G2): construção de itens por pontos =====================
 * Uma Habilidade com "construcao" descreve fórmulas (o item base) e linhas (características com custo,
 * categoria, limite e operações). O item final é sempre recalculado do zero: base da fórmula + escolhas
 * (nada se acumula de uma reconstrução para outra). O projeto fica em flags.nauren.projeto do item.
 * Operações de uma linha (aplicadas N vezes, N = quantas vezes a linha foi escolhida):
 *   formula     soma uma fórmula ("1d6", "3") ao campo; dados iguais se juntam (1d6+1d6 = 2d6)
 *   somar       soma um número (usosMax, recarregaGratisPorCena...)
 *   substituir  troca o valor
 *   modificador soma um modificador da ficha (defesa, bloqueio, movimento, reducaoDano...) no Efeito
 *               Vinculado do item (vale com ele equipado); "$escolha" vira o atributo escolhido na Bancada
 *   adicionar   põe um objeto numa lista (uma vez só por nome: ex. a Ação "Estouro")
 *   lista       acrescenta valores a uma lista sem repetir (ex.: Condições à escolha)
 * Caminhos aceitam "acoes[Nome]" para achar a Ação pelo nome.
 * ========================================================================================================= */
/** 0.94.3: itens criados pela Habilidade de construção com este nome (ex.: "Arma de Inventor"). */
function naurenItensDoProjetoPorNome(actor, nomeFonte) {
  if (!actor || !nomeFonte) return [];
  const habs = (actor.items ?? []).filter(i => naurenEhItem(i, nomeFonte) && naurenConstrucaoDe(i));
  return habs.flatMap(h => naurenItensDoProjeto(actor, h));
}

/** O item foi criado pela Habilidade de construção com este nome? */
function naurenItemEhDoProjeto(item, nomeFonte) {
  const fonte = item?.getFlag?.("nauren", "projeto")?.fonte;
  if (!fonte || !nomeFonte || !item.actor) return false;
  return naurenItensDoProjetoPorNome(item.actor, nomeFonte).some(i => i.id === item.id);
}

/** Regras extras ativas (Habilidades com system.regrasExtras[chave]). */
function naurenRegrasExtras(actor, chave) {
  const out = [];
  for (const it of actor?.items ?? []) {
    if (it.type !== "habilidade" || it.system.ativo === false) continue;
    const r = it.system.regrasExtras?.[chave];
    if (r) out.push({ item: it, regra: r, rank: Math.max(1, it.system.rankAtual || 1) });
  }
  return out;
}

function naurenConstrucaoDe(item) {
  const c = item?.system?.construcao;
  return c && Array.isArray(c.linhas) && Array.isArray(c.formulas) && c.formulas.length ? c : null;
}

/** Valor, máximo e nome de um recurso ("recursoCustom:pdi", "estaminaCombate", "mana", "vida"). */
function naurenRecursoDoAtor(actor, spec) {
  const s = String(spec ?? "");
  if (s.startsWith("recursoCustom:")) {
    const r = (actor?.system?.recursosCustom ?? []).find(x => x.id === s.slice(14));
    return r ? { valor: r.valor ?? 0, max: r.max ?? 0, nome: r.nome || s.slice(14) } : null;
  }
  const mapa = { estamina: "estaminaCombate", estaminaCombate: "estaminaCombate", mana: "mana", vida: "vida", destino: "dadosDestino", dadosDestino: "dadosDestino" };
  const k = mapa[s];
  if (!k) return null;
  const o = actor?.system?.[k];
  return o ? { valor: o.value ?? 0, max: o.max ?? 0, nome: { estaminaCombate: "Estamina", mana: "Mana", vida: "Vida", dadosDestino: "Dados de Destino" }[k] } : null;
}

/** Resolve "a.b[Nome].c" num objeto: devolve { pai, chave } do último passo (cria objetos no caminho). */
function naurenCaminhoProjeto(raiz, caminho) {
  const partes = String(caminho ?? "").split(".").filter(Boolean);
  let atual = raiz;
  for (let i = 0; i < partes.length; i++) {
    let p = partes[i];
    const m = /^([^\[]+)\[(.+)\]$/.exec(p);
    const ultimo = i === partes.length - 1;
    if (m) {
      const lista = atual?.[m[1]];
      if (!Array.isArray(lista)) return null;
      const idx = lista.findIndex(x => x && (x.nome === m[2] || x.name === m[2] || x.id === m[2]));
      if (idx < 0) return null;
      if (ultimo) return { pai: lista, chave: idx };
      atual = lista[idx];
      continue;
    }
    if (/^\d+$/.test(p)) p = Number(p);
    if (ultimo) return { pai: atual, chave: p };
    if (atual[p] === undefined || atual[p] === null) atual[p] = typeof partes[i + 1] === "string" && /^\d+$/.test(partes[i + 1]) ? [] : {};
    atual = atual[p];
    if (typeof atual !== "object") return null;
  }
  return null;
}

/** Junta termos iguais de uma soma simples: "1d6+1d6+3+3" -> "2d6+6". Fórmulas com parênteses ficam como estão. */
function naurenJuntarFormula(f) {
  const t = String(f ?? "").replace(/\s+/g, "");
  if (!t || /[()*\/]/.test(t)) return t;
  const termos = t.replace(/-/g, "+-").split("+").filter(Boolean);
  const dados = new Map(); let num = 0; const outros = [];
  for (const termo of termos) {
    const d = /^(-?)(\d*)d(\d+)$/i.exec(termo);
    if (d) { const k = `d${d[3]}`; dados.set(k, (dados.get(k) ?? 0) + (d[1] ? -1 : 1) * (Number(d[2] || 1))); continue; }
    if (/^-?\d+(\.\d+)?$/.test(termo)) { num += Number(termo); continue; }
    outros.push(termo);
  }
  const partes = [...[...dados].filter(([, q]) => q).map(([k, q]) => `${q}${k}`), ...outros];
  if (num) partes.push(String(num));
  return partes.join("+").replace(/\+-/g, "-") || "0";
}

function naurenAplicarOperacaoProjeto(sys, op, ctx = {}) {
  let valor = op.valor;
  if (typeof valor === "string" && valor.includes("$escolha")) valor = valor.replace(/\$escolha/g, ctx.escolha ?? "");
  if (op.modo === "modificador") {
    const campo = String(op.campo ?? "").replace(/\$escolha/g, ctx.escolha ?? "");
    if (!campo) return;
    sys.efeitosVinculados ??= [];
    if (!sys.efeitosVinculados.length) sys.efeitosVinculados.push({ id: "", ativo: true, modificadores: [], condicoesAplicadas: [] });
    const ev = sys.efeitosVinculados[0];
    ev.modificadores ??= [];
    const ja = ev.modificadores.find(m => m.campo === campo && !m.restringirTipoItem && /^[+-]?\d+(\.\d+)?$/.test(String(m.valor ?? "")) && /^[+-]?\d+(\.\d+)?$/.test(String(valor)));
    if (ja) ja.valor = String(Number(ja.valor) + Number(valor));
    else ev.modificadores.push({ campo, valor: String(valor), porRank: [] });
    return;
  }
  const alvo = naurenCaminhoProjeto(sys, op.campo);
  if (!alvo || alvo.pai === undefined || alvo.pai === null) return;
  const atual = alvo.pai[alvo.chave];
  switch (op.modo) {
    case "formula": {
      const a = String(atual ?? "").trim();
      alvo.pai[alvo.chave] = naurenJuntarFormula(!a || a === "0" ? String(valor) : `${a}+${valor}`);
      break;
    }
    case "somar": {
      const n = Number(valor) || 0;
      if (typeof atual === "number" || atual === undefined || atual === null || atual === "") alvo.pai[alvo.chave] = (Number(atual) || 0) + n;
      else alvo.pai[alvo.chave] = naurenJuntarFormula(`${atual}+${n}`);
      break;
    }
    case "substituir": alvo.pai[alvo.chave] = foundry.utils.deepClone(valor); break;
    case "adicionar": {
      const lista = Array.isArray(atual) ? atual : (alvo.pai[alvo.chave] = []);
      const nome = valor?.nome ?? valor?.name;
      if (!nome || !lista.some(x => (x?.nome ?? x?.name) === nome)) {
        const novo = foundry.utils.deepClone(valor);
        // "copiarDe": copia campos de outra entrada da mesma lista (ex.: o Disparo em Área herda o dano e o
        // acerto do Disparo). Use com "tardio" para copiar já com todas as outras características aplicadas.
        if (op.copiarDe !== undefined && op.copiarDe !== null && op.copiarDe !== "" && novo && typeof novo === "object") {
          const fonte = typeof op.copiarDe === "number" ? lista[op.copiarDe] : lista.find(x => (x?.nome ?? x?.name) === op.copiarDe);
          if (fonte) for (const k of op.copiarCampos ?? []) if (fonte[k] !== undefined) novo[k] = foundry.utils.deepClone(fonte[k]);
        }
        lista.push(novo);
      }
      break;
    }
    case "lista": {
      const lista = Array.isArray(atual) ? atual : (alvo.pai[alvo.chave] = []);
      for (const v of [].concat(valor ?? [])) if (!lista.includes(v)) lista.push(v);
      break;
    }
  }
}

/** Linhas válidas para a fórmula escolhida (as com "so" de outra fórmula ficam de fora). */
function naurenLinhaValeNaFormula(linha, formulaId) {
  if (formulaId === "loja" && linha.loja === false) return false;
  return !(linha.so ?? []).length || linha.so.includes(formulaId);
}

/** Pontos gastos num projeto (só linhas válidas para a fórmula). */
function naurenCustoProjeto(construcao, projeto) {
  let total = 0;
  for (const l of construcao.linhas) {
    const n = projeto.escolhas?.[l.id] ?? 0;
    if (n > 0 && naurenLinhaValeNaFormula(l, projeto.formula)) total += (Number(l.custo) || 0) * n;
  }
  return total;
}

/** Fórmula do projeto - "loja" é virtual: a base é a própria arma escolhida (guardada no projeto). */
function naurenFormulaDoProjeto(construcao, projeto) {
  if (projeto?.formula === "loja") return { id: "loja", nome: "Loja de Invenções", tipo: projeto.base?.system?.categoria || "Arma", esboco: "generico", base: projeto.base ?? {}, loja: true };
  return construcao.formulas.find(f => f.id === projeto?.formula) ?? construcao.formulas[0];
}

/** Dados do item final (name/type/img/system/flags) a partir da fórmula base e das escolhas. */
function naurenMontarItemDoProjeto(construcao, projeto, actor = null) {
  const formula = naurenFormulaDoProjeto(construcao, projeto);
  const dados = foundry.utils.deepClone(formula.base ?? {});
  dados.system ??= {};
  // Duas passadas: primeiro as operações normais, depois as "tardio" (que copiam o resultado das outras).
  for (const tardio of [false, true]) {
    for (const linha of construcao.linhas) {
      const n = projeto.escolhas?.[linha.id] ?? 0;
      if (!n || !naurenLinhaValeNaFormula(linha, formula.id)) continue;
      let ops = (linha.aplica ?? []).filter(op => !!op.tardio === tardio);
      // Loja de Invenções: o que vale no ataque principal vale em todos os ataques da arma (básico e pesado).
      if (formula.loja) {
        const ataques = (dados.system.acoes ?? []).map((a, i) => a?.ehAtaque ? i : -1).filter(i => i >= 0);
        ops = ops.flatMap(op => /^acoes\.0\./.test(String(op.campo ?? "")) ? ataques.map(i => ({ ...op, campo: String(op.campo).replace(/^acoes\.0\./, `acoes.${i}.`) })) : [op]);
      }
      for (let i = 0; i < n; i++) for (const op of ops) naurenAplicarOperacaoProjeto(dados.system, op, { escolha: projeto.detalhes?.[linha.id] });
    }
  }
  // Frascos: catálogo de benefícios (para sorteios como a Cobaia) e nome automático pelos benefícios.
  if (formula.catalogo) {
    dados.system.frasco ??= {};
    dados.system.frasco.catalogo = construcao.linhas.filter(l => naurenLinhaValeNaFormula(l, formula.id) && (!l.requer || actor?.items?.some(i => naurenEhItem(i, l.requer)))).map(l => {
      const tmp = foundry.utils.deepClone(formula.base?.system ?? {});
      for (const op of l.aplica ?? []) naurenAplicarOperacaoProjeto(tmp, op, { escolha: (l.escolha ?? [])[0] });
      return { nome: l.nome, efeitos: tmp.frasco?.efeitos ?? [] };
    });
  }
  if (!projeto.nome && formula.nomeAutomatico) {
    const nomes = construcao.linhas.filter(l => (projeto.escolhas?.[l.id] ?? 0) > 0 && naurenLinhaValeNaFormula(l, formula.id)).map(l => (l.nomeCurto || l.nome) + ((projeto.escolhas[l.id] ?? 0) > 1 ? ` ×${projeto.escolhas[l.id]}` : ""));
    if (nomes.length) dados.name = `${formula.nomeAutomatico}: ${nomes.length > 1 ? `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}` : nomes[0]}`;
  }
  // "self:Nome" (Condições do sistema) vira o UUID deste mundo.
  if (actor) dados.system = naurenResolverSelfEmObjeto(dados.system, actor);
  if (projeto.nome) dados.name = projeto.nome;
  return dados;
}

/** Teto de vezes de uma linha (fórmula da construção, ex.: "2+(@nivel>=16)"; a linha pode ter o seu "max"). */
function naurenMaxPorLinha(construcao, linha, actor) {
  if (Number(linha?.max) > 0) return Number(linha.max);
  const v = naurenInterpretarModificador(String(construcao.maxPorLinha ?? "2"), actor)?.valor;
  return Math.max(1, Number(v) || 2);
}

/** Melhorias ("Retornar ao Projeto") liberadas pelo nível e quantas já foram feitas. */
function naurenMelhoriasDoProjeto(construcao, projeto, actor) {
  const nivel = actor?.system?.nivel ?? 1;
  const lista = (construcao.melhorias ?? []).filter(m => (Number(m.nivel) || 1) <= nivel);
  const feitas = projeto?.melhoriasFeitas ?? 0;
  return { liberadas: lista.length, feitas, proxima: lista[feitas] ?? null };
}

/** Itens deste ator feitos por esta construção. */
function naurenItensDoProjeto(actor, habilidade) {
  const chave = naurenChaveConstrucao(habilidade);
  return (actor?.items ?? []).filter(i => i.getFlag?.("nauren", "projeto")?.fonte === chave);
}

/**
 * Pode criar esta fórmula agora? Fórmulas comuns dividem o limite do projeto (maximoItens).
 * Uma fórmula liberada por habilidade (requer, ex.: "Nova Fórmula: Martelo") ganha a própria vaga:
 * dá para ter a arma original e o Martelo (efeitos iguais entre elas não se acumulam).
 */
function naurenFormulaCriavel(c, actor, habilidade, f) {
  if (!f) return { ok: false, motivo: "Fórmula desconhecida." };
  if (f.requer && !(actor?.items ?? []).some(i => naurenEhItem(i, f.requer))) return { ok: false, motivo: `Precisa de ${f.requer}` };
  const feitos = naurenItensDoProjeto(actor, habilidade);
  const extras = new Set((c?.formulas ?? []).filter(x => x.requer).map(x => x.id));
  if (f.requer) {
    const ja = feitos.find(i => i.getFlag("nauren", "projeto")?.formula === f.id);
    return ja ? { ok: false, motivo: `Já tem ${ja.name}` } : { ok: true };
  }
  const limite = Math.max(1, Math.round(naurenInterpretarModificador(String(c?.maximoItens ?? "1"), actor)?.valor ?? 1));
  const comuns = feitos.filter(i => !extras.has(i.getFlag("nauren", "projeto")?.formula));
  return comuns.length >= limite ? { ok: false, motivo: `Já tem ${comuns.map(i => i.name).join(", ")}` } : { ok: true };
}

function naurenChaveConstrucao(hab) {
  return hab?.getFlag?.("nauren", "seedId") || hab?.system?.construcao?.id || hab?.name || "";
}

/**
 * Grava o projeto: cria o item (ou atualiza o existente) e cobra os pontos novos do recurso.
 * modo: "criar" | "melhorar". Devolve o item ou lança erro com mensagem para o jogador.
 */
async function naurenGravarProjeto(actor, habilidade, projeto, { modo = "criar", itemAlvo = null, lojaHab = null } = {}) {
  const c = naurenConstrucaoDe(habilidade);
  if (!c) throw new Error(`${habilidade?.name ?? "Item"} não tem tabela de construção.`);
  const anterior = itemAlvo?.getFlag("nauren", "projeto") ?? null;
  const gastoNovo = naurenCustoProjeto(c, projeto);
  const gastoAntes = (modo === "melhorar" || modo === "loja") ? (anterior?.gasto ?? 0) : 0;
  const cobrar = Math.max(0, gastoNovo - gastoAntes);
  const rec = c.recurso ? naurenRecursoDoAtor(actor, c.recurso) : null;
  if (rec && rec.valor < cobrar) throw new Error(`Faltam ${cobrar - rec.valor} de ${rec.nome} (você tem ${rec.valor}, precisa de ${cobrar}).`);
  // Preparos limitados por uma Ação com usos da mesma Habilidade (ex.: "Preparar Frasco", 1 por descanso).
  let acaoUso = null;
  if (modo === "criar" && c.usoDaAcao) {
    const idxU = (habilidade.system.acoes ?? []).findIndex(a => naurenNomeBate(a.nome, c.usoDaAcao));
    const aU = habilidade.system.acoes?.[idxU];
    if (aU?.usaUsos) {
      const maxU = (naurenResolverPorNivel(aU.usosMaxPorNivel, actor.system?.nivel || 1, "valor") ?? aU.usosMax ?? 0);
      if ((aU.usosAtual ?? 0) <= 0) throw new Error(`Sem ${aU.nome} agora (0 de ${maxU}). Volta no descanso${c.usoDaAcaoDica ? ` ou ${c.usoDaAcaoDica}` : ""}.`);
      acaoUso = { idx: idxU, atual: aU.usosAtual ?? 0 };
    }
  }
  if (modo === "criar") {
    const pode = naurenFormulaCriavel(c, actor, habilidade, (c.formulas ?? []).find(f => f.id === projeto.formula) ?? { id: projeto.formula });
    if (!pode.ok) throw new Error(`${pode.motivo}: não dá para criar outro de ${c.titulo || habilidade.name}.`);
  }
  const dados = naurenMontarItemDoProjeto(c, projeto, actor);
  const registro = {
    fonte: naurenChaveConstrucao(habilidade) + (modo === "loja" ? "#loja" : ""), fonteNome: modo === "loja" ? (lojaHab?.name ?? "Loja de Invenções") : habilidade.name, formula: projeto.formula,
    ...(modo === "loja" ? { base: foundry.utils.deepClone(projeto.base ?? {}) } : {}),
    escolhas: foundry.utils.deepClone(projeto.escolhas ?? {}), detalhes: foundry.utils.deepClone(projeto.detalhes ?? {}),
    gasto: gastoNovo, melhoriasFeitas: (anterior?.melhoriasFeitas ?? 0) + (modo === "melhorar" ? 1 : 0), nome: projeto.nome || "", versao: 1
  };
  let item;
  if ((modo === "melhorar" || modo === "loja") && itemAlvo) {
    const sys = dados.system;
    // Usos: quem ganhou usos máximos ganha também os atuais; nunca passa do máximo.
    if (sys.usaUsos && itemAlvo.system.usaUsos) {
      const ganho = Math.max(0, (sys.usosMax ?? 0) - (itemAlvo.system.usosMax ?? 0));
      sys.usosAtual = Math.min(sys.usosMax ?? 0, (itemAlvo.system.usosAtual ?? 0) + ganho);
    }
    sys.equipado = itemAlvo.system.equipado;
    await itemAlvo.update({ name: projeto.nome || itemAlvo.name, system: sys, "flags.nauren.projeto": registro });
    item = itemAlvo;
  } else {
    if (dados.system.usaUsos) dados.system.usosAtual = dados.system.usosMax ?? 0;
    // Já nasce equipada se a fórmula pedir (ex.: Prótese) e couber no limite de equipamentos ofensivos.
    const formulaCriada = c.formulas.find(f => f.id === projeto.formula);
    if (dados.type === "arma" && formulaCriada?.equiparAoCriar) {
      const limite = actor.system?.limiteOfensivoTotal ?? naurenLimiteOfensivoBase();
      const cabe = !naurenLimiteOfensivoBase() || naurenPesoOfensivoEquipado(actor) + naurenPesoOfensivo({ type: "arma", system: dados.system }) <= limite;
      dados.system.equipado = cabe;
      if (!cabe) ui.notifications?.warn?.(`${dados.name} foi para o inventário sem equipar: passaria do limite de equipamentos ofensivos.`);
    }
    foundry.utils.setProperty(dados, "flags.nauren.projeto", registro);
    [item] = await actor.createEmbeddedDocuments("Item", [dados]);
  }
  if (rec && cobrar > 0) await naurenConcederRecurso(actor, c.recurso, String(-cobrar), habilidade);
  if (acaoUso) { const ac = foundry.utils.deepClone(habilidade.system.acoes); ac[acaoUso.idx].usosAtual = Math.max(0, acaoUso.atual - 1); await habilidade.update({ "system.acoes": ac }); }
  if (modo === "loja" && lojaHab) await lojaHab.setFlag("nauren", "lojaNiveis", [...new Set([...(lojaHab.getFlag("nauren", "lojaNiveis") ?? []), actor.system?.nivel ?? 1])]);
  // Card auditável: fórmula, cada característica e os pontos.
  const formula = naurenFormulaDoProjeto(c, projeto);
  const linhas = [{ label: "Fórmula", value: formula?.nome ?? projeto.formula }];
  for (const l of c.linhas) {
    const n = projeto.escolhas?.[l.id] ?? 0;
    if (!n || !naurenLinhaValeNaFormula(l, projeto.formula)) continue;
    const det = projeto.detalhes?.[l.id];
    linhas.push({ label: `${l.nome}${n > 1 ? ` ×${n}` : ""}`, value: `${(Number(l.custo) || 0) * n} ${rec?.nome ?? "pontos"}`, breakdown: `${l.efeito ?? ""}${det ? ` (${NAUREN_ROTULO_ESCOLHA_PROJETO[det] ?? det})` : ""}` });
  }
  linhas.push({ label: modo !== "criar" ? "Pontos novos" : "Total", value: `${cobrar} ${rec?.nome ?? "pontos"}`, breakdown: modo !== "criar" ? `projeto agora soma ${gastoNovo}` : "" });
  if (modo === "loja") linhas.push({ label: "Horas de trabalho", value: `${cobrar}`, breakdown: "1 hora por Ponto de Invenção gasto" });
  naurenPostarCard({ ator: actor, titulo: item?.name ?? dados.name, icone: item?.img ?? dados.img, fonte: modo === "melhorar" ? `${habilidade.name}: melhoria` : (modo === "loja" ? (lojaHab?.name ?? "Loja de Invenções") : habilidade.name), linhas }).catch(() => {});
  return item;
}

const NAUREN_ROTULO_ESCOLHA_PROJETO = { forca: "Força", agilidade: "Agilidade", estamina: "Estamina", inteligencia: "Inteligência", destino: "Destino" };


/* ---- Bancada de Invenção: janela ---- */
const NAUREN_ESBOCOS = {
  fogo: `<svg viewBox="0 0 240 120" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Esboço da arma de fogo"><path d="M66 50L14 58v28l52-12z"/><path d="M22 62v18" class="fio"/><rect x="66" y="46" width="56" height="28" rx="4"/><circle cx="94" cy="60" r="8"/><circle cx="94" cy="60" r="2.5"/><rect x="122" y="50" width="96" height="9" rx="2"/><rect x="122" y="61" width="58" height="9" rx="4"/><rect x="216" y="47" width="10" height="15" rx="2"/><path d="M146 48v13M152 48v13M158 48v13"/><path d="M76 74l-6 24h14l6-24"/><path d="M90 74c2 14 22 14 24 0"/><path d="M101 74l-2 8"/><rect x="76" y="30" width="50" height="10" rx="5"/><path d="M88 40v6M114 40v6"/><path d="M76 14h30M91 14v14" class="fio tracejado"/><text x="110" y="17">luneta</text><path d="M230 55h8" class="destaque"/></svg>`,
  protese: `<svg viewBox="0 0 240 120" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Esboço da prótese"><circle cx="26" cy="58" r="14"/><circle cx="26" cy="58" r="5"/><rect x="40" y="49" width="56" height="18" rx="7"/><path d="M48 54h40M48 62h40" class="fio"/><circle cx="108" cy="58" r="11"/><circle cx="108" cy="58" r="4"/><path d="M108 43v4M108 69v4M93 58h4M119 58h4M97.4 47.4l2.8 2.8M115.8 65.8l2.8 2.8M97.4 68.6l2.8-2.8M115.8 50.2l2.8-2.8"/><rect x="122" y="48" width="58" height="20" rx="6"/><circle cx="132" cy="53" r="1.5"/><circle cx="132" cy="63" r="1.5"/><circle cx="170" cy="53" r="1.5"/><circle cx="170" cy="63" r="1.5"/><path d="M140 58h22" class="fio"/><rect x="180" y="50" width="8" height="16" rx="2"/><rect x="188" y="47" width="18" height="22" rx="4"/><path d="M206 51h11l7 2M206 58h13l7 1M206 65h11l7-2"/><path d="M194 47l5-10 7-3"/><path d="M40 26h56M68 26v20" class="fio tracejado"/><text x="72" y="22">pistões</text></svg>`,
  martelo: `<svg viewBox="0 0 240 120" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Esboço do martelo"><rect x="70" y="14" width="100" height="36" rx="5"/><path d="M90 14v36M150 14v36"/><circle cx="120" cy="32" r="8"/><path d="M120 50v60"/><path d="M114 70h12M114 84h12M114 98h12"/><path d="M170 24h16v16h-16" class="fio tracejado"/></svg>`,
  botas: `<svg viewBox="0 0 240 120" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Esboço das botas"><path d="M88 14h34v52l40 14c10 4 14 10 14 18v6H82V60z"/><path d="M82 92h94"/><path d="M88 30h34M88 44h34" class="fio"/><circle cx="105" cy="74" r="6"/><circle cx="105" cy="74" r="2"/><path d="M122 66l18 6M136 72v-10l10 4" /><path d="M150 98l6 12M164 98l6 12M98 98l-4 12" class="fio tracejado"/><path d="M40 40h40M60 40v-14" class="fio tracejado"/><text x="36" y="22">molas</text></svg>`,
  frasco: `<svg viewBox="0 0 240 120" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Esboço do frasco"><path d="M108 10h24v28l26 50a18 18 0 0 1-16 26H98a18 18 0 0 1-16-26l26-50z"/><path d="M94 80h52" class="fio"/></svg>`,
  generico: `<svg viewBox="0 0 240 120" fill="none" stroke-linecap="round" role="img" aria-label="Esboço"><circle cx="120" cy="60" r="22"/><circle cx="120" cy="60" r="8"/><path d="M120 28v10M120 82v10M88 60h10M142 60h10M97 37l7 7M136 76l7 7M97 83l7-7M136 44l7-7"/></svg>`
};

const NAUREN_ICONES_FORMULA = {
  fogo: `<svg viewBox="0 0 32 32" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13.5L2.5 15v4.5L10 18z"/><rect x="10" y="12.5" width="8" height="5.5" rx="1"/><rect x="18" y="13.5" width="11.5" height="2.5" rx=".8"/><path d="M12.5 18l-1.5 5.5h3l1.5-5.5"/><rect x="11" y="9" width="7" height="2" rx="1"/><path d="M22 13.5v2.5M24.5 13.5v2.5"/></svg>`,
  protese: `<svg viewBox="0 0 32 32" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5" cy="16" r="3"/><rect x="8" y="14" width="7.5" height="4" rx="2"/><circle cx="18" cy="16" r="2.5"/><rect x="20.5" y="14" width="4.5" height="4" rx="1.2"/><path d="M25 14.6h3.5M25 16h4.5M25 17.4h3.5M23 14l1.8-3"/></svg>`,
  martelo: `<svg viewBox="0 0 32 32" fill="none" stroke-linecap="round" aria-hidden="true"><rect x="6" y="5" width="20" height="9" rx="2"/><path d="M16 14v14M10 9.5h12"/></svg>`,
  botas: `<svg viewBox="0 0 32 32" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4h7v13l8 3c2 1 3 2 3 4v2H9V15z"/><path d="M9 25h19"/></svg>`,
  generico: `<svg viewBox="0 0 32 32" fill="none" stroke-linecap="round" aria-hidden="true"><circle cx="16" cy="16" r="4"/><circle cx="16" cy="16" r="9"/></svg>`
};

const NAUREN_ROTULO_CURTO_MOD = {
  defesa: "Defesa", bloqueio: "Bloqueio", esquiva: "Esquiva", movimento: "Movimento", reducaoDano: "Redução de dano", reducaoDanoAtaque: "Redução de dano",
  estresse: "Estresse máx.", forca: "Força", agilidade: "Agilidade", estamina: "Estamina", inteligencia: "Inteligência", destino: "Destino",
  danoBonus: "Dano", ataque: "Acerto", limiarDeflexao: "Limiar de Deflexão", vida: "Vida máx.", vitalidade: "Vitalidade", espirito: "Espírito", poderAtaque: "Poder de Ataque", poderMagia: "Poder de Magia", reducaoDanoAtaque: "Redução de dano", limiteOfensivo: "Limite ofensivo", categoria: "Categoria"
};

/** Linhas do quadro "Protótipo": o item já montado, em linguagem de mesa. */
function naurenResumoItemProjeto(dados, actor) {
  const sys = dados.system ?? {};
  const linhas = [];
  const add = (rotulo, valor, classe = "") => { if (valor !== "" && valor !== null && valor !== undefined) linhas.push({ rotulo, valor: String(valor), classe }); };
  const acoes = sys.acoes ?? [];
  const ataque = acoes.find(a => a.ehAtaque && !a.recarregaUsos) ?? null;
  if (ataque) {
    const f = String(ataque.danos?.[0]?.formula ?? "").trim();
    if (!f || f === "0") add("Dano", "sem dano", "fraco");
    else {
      const v = actor ? naurenValidarFormula(f, actor) : null;
      const media = v?.ok && v.media !== null ? ` (média ${Math.round(v.media * 10) / 10})` : "";
      add("Dano", `${naurenFormulaParaTexto(f, actor)}${media}`);
    }
    const atr = ataque.atributoAtaque && ataque.atributoAtaque !== "nenhum" ? (ATRIBUTOS_BONUS[ataque.atributoAtaque] ?? ataque.atributoAtaque) : "";
    const bonus = String(ataque.ataqueBonusExtra ?? "").trim();
    add("Acerto", [atr ? `+${atr}` : "", bonus ? `+${bonus}` : ""].filter(Boolean).join(" ") || "1d20 puro");
    const alc = String(ataque.alcance ?? "").trim();
    const area = acoes.find(a => a !== ataque && a.usaTemplate && a.ehAtaque);
    add("Alcance", `${alc || "—"} · alvo único${area ? ` · ${area.nome}: raio ${area.templateTamanho} m (${area.usosMax}×/cena)` : ""}`);
    add("Custo", `${ataque.custoEstamina ?? 0} Estamina por ataque`);
  }
  if (sys.usaUsos) add("Usos", `${sys.usosMax ?? 0}${sys.usosReset === "manual" ? " (voltam pela Recarga)" : ` por ${sys.usosReset}`}`);
  const rec = acoes.find(a => a.recarregaUsos);
  if (rec) {
    const b = String(rec.recarregaBonus ?? "").trim();
    const gratis = (rec.recarregaGratisPorCena ?? 0) > 0 ? ` · ${rec.recarregaGratisPorCena}ª grátis por combate` : "";
    add("Recarga", `${rec.recarregaFormula || "1d6"}${b && b !== "0" ? ` + ${b}` : ""}${rec.recarregaSoSeVazio ? " sem usos" : ""} · ${rec.custoEstamina ?? 0} Estamina${gratis}`);
  }
  for (const m of sys.efeitosVinculados?.[0]?.modificadores ?? []) {
    const v = String(m.valor ?? "");
    const rot = NAUREN_ROTULO_CURTO_MOD[m.campo] ?? String(NAUREN_CAMPOS_MODIFICADOR_OPCOES?.[m.campo] ?? m.campo).replace(/\s*\(.*$/, "");
    const txt = /^(vantagem|desvantagem)$/.test(v) ? (v === "vantagem" ? "Facilidade" : "Dificuldade") : (/^[+-]/.test(v) ? v : `+${v}`);
    add(rot, `${txt}${m.campo === "movimento" ? " m" : ""}`, "bom");
  }
  if (ataque?.usaCondicaoEscolhida && (ataque.condicoesEscolhidasOpcoes ?? []).length) {
    const nomes = ataque.condicoesEscolhidasOpcoes.map(u => { try { return fromUuidSync(u)?.name ?? ""; } catch (err) { return ""; } }).filter(Boolean);
    add("Ao acertar", `${ataque.condicoesEscolhidasAcumulosFormula || 1} de ${nomes.join(", ") || "Condição à escolha"}`, "bom");
  }
  const extras = acoes.filter(a => a !== ataque && a !== rec && !(a.usaTemplate && a.ehAtaque)).map(a => `${a.nome}${a.usosProprios && a.usosMax ? ` (${a.usosMax}×/cena)` : ""}`);
  if (extras.length) add("Ações extras", extras.join(" · "), "bom");
  for (const r of sys.reacoesProjeto ?? []) add("Reação", r.texto, "bom");
  for (const r of sys.reacoesPagas ?? []) add(r.tipo === "reduzirDano" ? "Ao sofrer dano" : "Ao ser atacado", `${r.nome}: ${r.custoVariavel ? "PdI reduzem o dano 1 a 1" : `${r.custo} PdI → +${r.formula} de Defesa`}${r.soEmPrioridade ? " (em Prioridade)" : ""}${r.usosPorTurno ? `, ${r.usosPorTurno}×/turno` : ""}`, "bom");
  // Itens com efeitos montados (Botas do Inventor): Defesa e o que ativar dá.
  if (dados.type === "armadura") add("Defesa", `+${sys.defesaBonus ?? 0} (${sys.tipo ?? "equipamento"})`);
  if (Array.isArray(sys.frasco?.efeitos)) {
    if (sys.frasco.efeitos.length) add("Ao ativar", sys.frasco.efeitos.map(e => naurenTextoEfeitoFrasco(e)).join(" · "), "bom");
    const nB = Math.min(6, Number(sys.frasco.beneficios) || 0);
    add("Colateral", nB ? `${nB} em 6 (1d6 ao ativar)` : "nenhum", nB ? "fraco" : "");
  }
  return linhas;
}


class NaurenBancada extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "nauren-bancada-{id}",
    classes: ["nauren-rpg", "nauren-bancada"],
    position: { width: 1100, height: 800 },
    window: { title: "Bancada de Invenção", resizable: true, minimizable: true, icon: "fas fa-gears" },
    actions: {
      formula: NaurenBancada.onFormula,
      mais: NaurenBancada.onMais,
      menos: NaurenBancada.onMenos,
      limpar: NaurenBancada.onLimpar,
      forjar: NaurenBancada.onForjar
    }
  };
  static PARTS = { body: { template: "systems/nauren/templates/bancada.html" } };

  /** Tamanho inicial cabe na tela (Full HD: 1100×800; notebook: encolhe e a janela reorganiza as colunas). */
  _initializeApplicationOptions(options) {
    const o = super._initializeApplicationOptions?.(options) ?? options;
    if (o?.position) {
      o.position.width = Math.max(640, Math.min(1100, (window.innerWidth || 1100) - 40));
      o.position.height = Math.max(560, Math.min(800, (window.innerHeight || 800) - 90));
    }
    return o;
  }

  /** @param {{actor, habilidade, modo?: "criar"|"melhorar", item?}} options */
  constructor(options = {}) {
    super(options);
    this.actor = options.actor;
    this.habilidade = options.habilidade;
    this.modo = options.modo ?? "criar";
    this.itemAlvo = options.item ?? null;
    this.lojaHab = options.lojaHab ?? null;
    const c = naurenConstrucaoDe(this.habilidade);
    const anterior = this.itemAlvo?.getFlag("nauren", "projeto");
    this.minimos = (this.modo === "melhorar" || this.modo === "loja") ? foundry.utils.deepClone(anterior?.escolhas ?? {}) : {};
    // Loja: a base é a arma como era antes da primeira melhoria (guardada no projeto).
    const baseLoja = this.modo === "loja" ? (anterior?.base ?? (() => { const o = this.itemAlvo?.toObject?.() ?? {}; delete o._id; delete o.flags; delete o._stats; delete o.folder; delete o.sort; delete o.ownership; return o; })()) : null;
    this.projeto = {
      base: baseLoja,
      formula: this.modo === "loja" ? "loja" : (anterior?.formula ?? this._primeiraFormulaLiberada(c)?.id ?? c?.formulas?.[0]?.id),
      escolhas: foundry.utils.deepClone(anterior?.escolhas ?? {}),
      detalhes: foundry.utils.deepClone(anterior?.detalhes ?? {}),
      nome: anterior?.nome || this.itemAlvo?.name || ""
    };
  }

  static abrir(actor, habilidade, { modo = "criar", item = null, lojaHab = null } = {}) {
    if (!naurenConstrucaoDe(habilidade)) return ui.notifications.warn(`${habilidade?.name ?? "Item"} não tem tabela de construção.`);
    const Janela = naurenConstrucaoDe(habilidade).janela === "alambique" ? NaurenAlambique : NaurenBancada;
    new Janela({ actor, habilidade, modo, item, lojaHab, id: `nauren-bancada-${actor.id}-${habilidade.id}${modo === "loja" ? "-loja" : ""}` }).render(true);
  }

  get title() { return `${naurenConstrucaoDe(this.habilidade)?.titulo || this.habilidade?.name || "Bancada"} · Bancada de Invenção`; }

  /** Uma fórmula pode exigir um item na ficha (ex.: Martelo: "Nova Fórmula: Martelo", do Engenheiro). */
  _formulaLiberada(f) {
    if (this.modo === "criar") return naurenFormulaCriavel(naurenConstrucaoDe(this.habilidade), this.actor, this.habilidade, f).ok;
    if (!f?.requer) return true;
    return this.actor.items.some(i => naurenEhItem(i, f.requer));
  }
  _primeiraFormulaLiberada(c) { return (c?.formulas ?? []).find(f => this._formulaLiberada(f)); }

  _orcamento(c) {
    const anterior = this.itemAlvo?.getFlag("nauren", "projeto");
    if (this.modo === "loja") {
      const rec = c.recurso ? naurenRecursoDoAtor(this.actor, c.recurso) : null;
      const extra = rec?.valor ?? 0;
      return { total: (anterior?.gasto ?? 0) + extra, extra, base: anterior?.gasto ?? 0 };
    }
    if (this.modo === "melhorar") {
      const m = naurenMelhoriasDoProjeto(c, anterior, this.actor);
      const extra = m.proxima ? Math.max(0, Math.round(naurenInterpretarModificador(String(m.proxima.orcamento ?? "0"), this.actor)?.valor ?? 0)) : 0;
      return { total: (anterior?.gasto ?? 0) + extra, extra, base: anterior?.gasto ?? 0 };
    }
    const total = Math.max(0, Math.round(naurenInterpretarModificador(String(c.orcamento ?? "0"), this.actor)?.valor ?? 0));
    return { total, extra: total, base: 0 };
  }

  async _prepareContext() {
    const c = naurenConstrucaoDe(this.habilidade);
    const p = this.projeto;
    const formula = naurenFormulaDoProjeto(c, p);
    const orc = this._orcamento(c);
    const usados = naurenCustoProjeto(c, p);
    const resta = orc.total - usados;
    const rec = c.recurso ? naurenRecursoDoAtor(this.actor, c.recurso) : null;
    const cobrar = Math.max(0, usados - orc.base);
    const siglaRecurso = c.siglaRecurso || "pts";
    const categorias = (c.categorias ?? []).map(cat => {
      let total = 0;
      const linhas = c.linhas.filter(l => l.categoria === cat.id && (!l.requer || this.actor.items.some(i => naurenEhItem(i, l.requer)))).map(l => {
        const n = p.escolhas[l.id] ?? 0;
        const max = naurenMaxPorLinha(c, l, this.actor);
        const vale = naurenLinhaValeNaFormula(l, formula.id);
        if (vale) total += n;
        const minimo = this.minimos[l.id] ?? 0;
        const escolhas = Array.isArray(l.escolha) && l.escolha.length ? l.escolha.map(v => ({ valor: v, rotulo: NAUREN_ROTULO_ESCOLHA_PROJETO[v] ?? v, marcada: (p.detalhes[l.id] ?? l.escolha[0]) === v })) : null;
        const nomesSo = (l.so ?? []).map(id => c.formulas.find(f => f.id === id)?.nome ?? id).join(" ou ");
        return {
          id: l.id, nome: l.nome, efeito: vale ? l.efeito : `${l.efeito} · só ${nomesSo}`, custo: l.custo, n, max, origem: l.origem ?? "", cor: l.cor ?? "", nomeCurto: l.nomeCurto ?? "",
          escolhida: vale && n > 0, bloqueada: !vale, escolhas,
          pips: Array.from({ length: max }, (_, i) => ({ cheio: vale && i < n })),
          semMais: !vale || n >= max || (Number(l.custo) || 0) > resta,
          semMenos: n <= minimo || !vale
        };
      });
      return { ...cat, linhas, total, totalTexto: total ? `${total} escolhida${total > 1 ? "s" : ""}` : "nenhuma" };
    });
    const dados = naurenMontarItemDoProjeto(c, p, this.actor);
    const frac = orc.total > 0 ? Math.max(0, Math.min(1, usados / orc.total)) : 0;
    const comp = Math.PI * 70;
    const m = naurenMelhoriasDoProjeto(c, this.itemAlvo?.getFlag("nauren", "projeto"), this.actor);
    const formulas = c.formulas.map(f => {
      const liberada = this._formulaLiberada(f);
      return {
        id: f.id, nome: f.nome, sub: f.sub ?? "", icone: NAUREN_ICONES_FORMULA[f.esboco] ?? NAUREN_ICONES_FORMULA.generico,
        ativa: f.id === formula.id, bloqueada: !liberada || this.modo !== "criar", travada: !liberada,
        selo: !liberada ? (this.modo === "criar" ? naurenFormulaCriavel(c, this.actor, this.habilidade, f).motivo : `Precisa de ${f.requer}`) : (f.selo ?? ""), dica: this.modo === "melhorar" ? "A fórmula não muda numa melhoria." : (f.dica ?? "")
      };
    });
    let semForjar = usados === 0 || resta < 0 || (rec && rec.valor < cobrar);
    if (this.modo !== "criar" && cobrar === 0) semForjar = true;
    return {
      titulo: c.titulo || this.habilidade.name,
      subtitulo: this.modo === "loja" ? `Loja de Invenções · ${this.itemAlvo?.name ?? "arma"} · 1 hora por ponto` : (this.modo === "melhorar" ? `Retornar ao Projeto · ${m.proxima ? `melhoria do nível ${m.proxima.nivel}` : "sem melhoria liberada"}` : "Etapa de Invenção"),
      aviso: rec && rec.valor < cobrar ? `Você tem ${rec.valor} de ${rec.nome}: medite antes de forjar.` : "",
      formulas, categorias, siglaRecurso,
      recursoNome: rec?.nome ?? "Pontos",
      usados, orcamento: orc.total,
      restaTexto: resta > 0 ? `Restam ${resta} para gastar` : (resta === 0 ? "Orçamento completo" : `Passou ${-resta} do orçamento`),
      restaClasse: resta > 0 ? "sobra" : (resta === 0 ? "cheio" : "passou"),
      saldoTexto: rec ? `Na ficha agora: ${rec.valor} de ${rec.max}. Este projeto cobra ${cobrar}.` : "",
      passou: resta < 0,
      arco: `${(frac * comp).toFixed(1)} ${comp.toFixed(1)}`,
      agulha: (-90 + 180 * frac).toFixed(1),
      melhoriaTitulo: this.modo === "loja" ? "Loja de Invenções" : (this.modo === "melhorar" ? "Melhoria" : "Retornar ao Projeto"),
      melhoriaTexto: this.modo === "loja" ? `A arma guarda o que já ganhou; você gasta Pontos de Invenção da ficha agora (${orc.extra}). Usos, Recarga e Estouro são só da Arma de Inventor.` : this.modo === "melhorar"
        ? `Você mantém o que já tinha e ganha ${orc.extra} pontos para características novas.`
        : ((c.melhorias ?? []).length ? `Nos níveis ${(c.melhorias ?? []).map(x => x.nivel).join(", ")} a bancada reabre com mais pontos.` : ""),
      dicaLinhas: `Cada característica entra até ${naurenMaxPorLinha(c, {}, this.actor)} vezes. O + apaga quando faltam pontos.`,
      esboco: NAUREN_ESBOCOS[formula.esboco] ?? NAUREN_ESBOCOS.generico,
      nomeItem: p.nome, formulaNome: formula.nome, formulaTipo: formula.tipo ?? "",
      resultado: naurenResumoItemProjeto(dados, this.actor),
      notaRegra: [formula.regra, c.notaRegra].filter(Boolean).join(" "),
      rodape: "Ao forjar, o card no chat registra a fórmula, cada característica e os pontos gastos.",
      rotuloLimpar: this.modo !== "criar" ? "Voltar ao que era" : "Desfazer tudo",
      rotuloForjar: this.modo === "loja" ? "Aplicar na arma" : (this.modo === "melhorar" ? "Aplicar melhoria" : "Forjar invenção"),
      semForjar
    };
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    const r = this.element;
    // Rolagem das colunas sobrevive a cada clique.
    for (const [sel, top] of Object.entries(this._rolagens ?? {})) { const el = r.querySelector(sel); if (el) el.scrollTop = top; }
    r.querySelectorAll(".nbc-lista, .nbc-ficha").forEach((el, i) => el.addEventListener("scroll", () => {
      this._rolagens ??= {}; this._rolagens[el.classList.contains("nbc-ficha") ? ".nbc-ficha" : `.nbc-categoria:nth-child(${i + 1}) .nbc-lista`] = el.scrollTop;
    }));
    r.querySelector(".nbc-nome")?.addEventListener("change", ev => { this.projeto.nome = ev.target.value.trim(); });
    r.querySelectorAll(".nbc-escolha").forEach(sel => sel.addEventListener("change", ev => {
      this.projeto.detalhes[sel.dataset.linha] = ev.target.value; this.render();
    }));
  }

  _mudar(id, d) {
    const c = naurenConstrucaoDe(this.habilidade);
    const l = c.linhas.find(x => x.id === id);
    if (!l) return;
    const n = Math.max(this.minimos[id] ?? 0, Math.min(naurenMaxPorLinha(c, l, this.actor), (this.projeto.escolhas[id] ?? 0) + d));
    this.projeto.escolhas[id] = n;
    if (n > 0 && Array.isArray(l.escolha) && l.escolha.length && !this.projeto.detalhes[id]) this.projeto.detalhes[id] = l.escolha[0];
    this.render();
  }
  static onMais(ev, t) { this._mudar(t.dataset.id, 1); }
  static onMenos(ev, t) { this._mudar(t.dataset.id, -1); }
  static onFormula(ev, t) { if (this.modo !== "criar") return; const f = naurenConstrucaoDe(this.habilidade)?.formulas?.find(x => x.id === t.dataset.id); if (f && !this._formulaLiberada(f)) return; this.projeto.formula = t.dataset.id; this.render(); }
  static onLimpar() { this.projeto.escolhas = foundry.utils.deepClone(this.minimos); this.render(); }
  static async onForjar() {
    const nomeEl = this.element.querySelector(".nbc-nome");
    if (nomeEl) this.projeto.nome = nomeEl.value.trim();
    try {
      const item = await naurenGravarProjeto(this.actor, this.habilidade, this.projeto, { modo: this.modo, itemAlvo: this.itemAlvo, lojaHab: this.lojaHab });
      ui.notifications.info(`${item?.name ?? "Invenção"} ${this.modo === "criar" ? "forjada" : "melhorada"}.`);
      this.close();
    } catch (err) {
      ui.notifications.warn(err.message ?? String(err));
    }
  }
}


/** Ação "abrir a Bancada": criar (se ainda não tem o item) ou melhorar (Retornar ao Projeto). */
function naurenAbrirConstrucaoPorAcao(actor, habilidade, modo, fonteNome = "") {
  if (modo === "obraPrima") return NaurenObraPrima.abrir(actor, habilidade);
  const habOrigem = habilidade;
  // A tabela pode estar em outra Habilidade (Retornar ao Projeto -> Arma de Inventor).
  if (!naurenConstrucaoDe(habilidade)) {
    const outra = (actor?.items ?? []).find(i => i !== habilidade && naurenConstrucaoDe(i) && (!fonteNome || naurenEhItem(i, fonteNome)));
    if (outra) habilidade = outra;
  }
  const c = naurenConstrucaoDe(habilidade);
  if (!c) return ui.notifications.warn(`${habilidade.name} não tem tabela de construção.`);
  const feitos = naurenItensDoProjeto(actor, habilidade);
  if (modo === "loja") return naurenAbrirLoja(actor, habilidade, habOrigem);
  if (modo === "melhorar") {
    const alvo = feitos[0];
    if (!alvo) return ui.notifications.warn(`Você ainda não criou ${c.titulo || "o item"}: use ${habilidade.name} primeiro.`);
    const m = naurenMelhoriasDoProjeto(c, alvo.getFlag("nauren", "projeto"), actor);
    if (!m.proxima) return ui.notifications.warn(m.liberadas ? `Você já fez as ${m.liberadas} melhoria(s) liberada(s) até o seu nível.` : "Nenhuma melhoria liberada no seu nível ainda.");
    return NaurenBancada.abrir(actor, habilidade, { modo: "melhorar", item: alvo });
  }
  if (!(c.formulas ?? []).some(f => naurenFormulaCriavel(c, actor, habilidade, f).ok)) {
    const limite = Math.max(1, Math.round(naurenInterpretarModificador(String(c.maximoItens ?? "1"), actor)?.valor ?? 1));
    return ui.notifications.warn(`Você já tem ${feitos.map(i => i.name).join(", ")}. ${limite > 1 ? "" : "Só pode existir um por vez."}`);
  }
  return NaurenBancada.abrir(actor, habilidade, { modo: "criar" });
}

export { NAUREN_ESBOCOS, NAUREN_ICONES_FORMULA, NAUREN_ROTULO_CURTO_MOD, NAUREN_ROTULO_ESCOLHA_PROJETO, NaurenBancada, naurenAbrirConstrucaoPorAcao, naurenAlvoDaRecarga, naurenAplicarOperacaoProjeto, naurenCaminhoProjeto, naurenChaveConstrucao, naurenConstrucaoDe, naurenCustoProjeto, naurenExecutarRecarga, naurenFormulaCriavel, naurenFormulaDoProjeto, naurenGravarProjeto, naurenItemEhDoProjeto, naurenItensDoProjeto, naurenItensDoProjetoPorNome, naurenJuntarFormula, naurenLinhaValeNaFormula, naurenMaxPorLinha, naurenMelhoriasDoProjeto, naurenMontarItemDoProjeto, naurenRecursoDoAtor, naurenRegrasExtras, naurenResumoItemProjeto };
