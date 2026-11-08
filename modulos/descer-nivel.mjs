/* Nauren RPG — Descer de nível. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { NaurenConcessaoHelper, NaurenProgressaoHelper, NaurenSubclasseHelper } from "./relogio-condicoes.mjs";
import { naurenProcessarGatilhos, naurenSincronizarNivelDosMascotes, naurenSincronizarRecursosCustom } from "./icone-condicao-token.mjs";


// 0.94.31: Relógio de combate (turnos e rodadas) foi para modulos/relogio-combate.mjs.

/* =======================================
 * DESCER DE NÍVEL: reverte automaticamente o que a Classe concedeu nos
 * níveis perdidos. Guarda o nível ANTIGO no preUpdate (mesmo padrão
 * de _naurenMoveOrigin, no hook de movimento mais abaixo) pra comparar com o
 * novo no updateActor - só reage quando o nível realmente DIMINUIU (subir de
 * nível já é tratado direto pelo botão "Subir de Nível", não por este hook).
 * ======================================= */
/**
 * Pra Escala por Nível de monstro (ver NaurenActorData#escalaAtributos):
 * devolve o valor que UM atributo (sua tabela própria) deveria ter num
 * nível específico - busca a linha com o MAIOR "nivelMinimo" que ainda
 * seja ≤ esse nível. Busca direta, sem estado nem histórico - o MESMO
 * nível sempre devolve o MESMO valor, então subir e descer de nível
 * usam exatamente esta função, sem lógica separada pra cada direção.
 */
function naurenValorAtributoNoNivel(tabela, nivel) {
  if (!tabela?.length) return null;
  let valor = null;
  for (const entrada of tabela) {
    if (entrada.nivelMinimo <= nivel) valor = entrada.valor;
  }
  return valor;
}


/**
 * Aplica a Escala por Nível de monstro (ver
 * NaurenActorData#escalaAtributos) - chamada tanto ao SUBIR quanto ao
 * DESCER de nível, com exatamente a mesma lógica dos dois lados (busca
 * direta na tabela de cada atributo, sem incremento nem histórico).
 * Cada atributo com uma tabela configurada é TRAVADO no valor que a
 * tabela diz pro nível NOVO - se não houver entrada aplicável na
 * tabela pro nível atual (ex: a tabela só começa no nível 5 e a
 * criatura está no nível 1), esse atributo específico não é tocado.
 * A Defesa continua incremental (piso(novoNível/2) - piso(nivelAntigo/2)),
 * já que não tem uma "tabela" própria - soma por cima do valor atual.
 */
async function naurenAplicarEscalaPorNivel(actor, novoNivel, nivelAntigo) {
  const entradas = actor.system.escalaAtributos ?? [];
  const atualizacoes = {};

  for (const entrada of entradas) {
    const novoValor = naurenValorAtributoNoNivel(entrada.tabela, novoNivel);
    if (novoValor === null) continue; // tabela vazia, ou nivel atual abaixo da 1a linha
    atualizacoes[`system.atributos.${entrada.atributo}.value`] = novoValor;
  }

  const deltaDefesa = Math.floor(novoNivel / 2) - Math.floor(nivelAntigo / 2);
  if (deltaDefesa !== 0) {
    atualizacoes["system.defesa"] = Math.max(0, (actor.system.defesa ?? 10) + deltaDefesa);
  }

  if (Object.keys(atualizacoes).length) await actor.update(atualizacoes);
}


// Guarda o "nível antigo" entre preUpdateActor e updateActor por UUID
// (não como propriedade solta na instância do Ator, ex: "actor._x = y")
// - mais robusto contra qualquer cenário onde a MESMA instância JS não
// sobreviva de forma confiável entre os dois hooks (ex: Atores vistos
// direto de dentro de uma compêndio, que podem ter um ciclo de vida de
// objeto diferente de um Ator já solto no mundo). Chave por "uuid"
// funciona igual pros dois casos.
const naurenNivelAntigoPorAtor = new Map();


const naurenMaximosAntesDoNivel = new Map();

const naurenLerMaximos = actor => ({ vida: actor.system.vida?.max ?? 0, mana: actor.system.mana?.max ?? 0, estaminaCombate: actor.system.estaminaCombate?.max ?? 0, dadosDestino: actor.system.dadosDestino?.max ?? 0 });


/**
 * Ao mudar de nível, os recursos ficam EXATAMENTE como estavam: só o máximo muda
 * (ex.: Vida 12/40 vira 12/48). Se o máximo diminuir, o valor só trava no novo máximo.
 * Assim, subir no meio de um combate não cura nem recarrega nada.
 */
async function naurenAjustarRecursosAoMudarNivel(actor, maximosAntes) {
  const agora = naurenLerMaximos(actor);
  const upd = {};
  for (const [chave, maxNovo] of Object.entries(agora)) {
    const atual = actor.system[chave]?.value ?? 0;
    const novo = Math.max(0, Math.min(maxNovo, atual));
    if (novo !== atual) upd[`system.${chave}.value`] = novo;
  }
  if (Object.keys(upd).length) await actor.update(upd);
}

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_descer_nivel() {


Hooks.on("preUpdateActor", (actor, changes) => {
  const novoNivel = foundry.utils.getProperty(changes, "system.nivel");
  if (novoNivel === undefined) return;
  naurenNivelAntigoPorAtor.set(actor.uuid, actor.system.nivel);
  naurenMaximosAntesDoNivel.set(actor.uuid, naurenLerMaximos(actor));
});


Hooks.on("updateActor", async (actor, changes, options, userId) => {
  if (userId !== game.user.id) return;
  const novoNivel = foundry.utils.getProperty(changes, "system.nivel");
  if (novoNivel === undefined) return;
  const nivelAntigo = naurenNivelAntigoPorAtor.get(actor.uuid);
  naurenNivelAntigoPorAtor.delete(actor.uuid);
  const maximosAntes = naurenMaximosAntesDoNivel.get(actor.uuid);
  naurenMaximosAntesDoNivel.delete(actor.uuid);
  if (nivelAntigo === undefined || novoNivel === nivelAntigo) return;

  const classeItem = actor.items.find(i => i.type === "classe");

  // SUBIU de nível (pelo botão "Subir de Nível" OU editando o campo "Nível"
  // manualmente - os dois caminhos passam por aqui, pra nunca ter granting
  // duplicado/divergente entre eles): aplica a progressão da Classe pra
  // todo nível novo alcançado. NaurenConcessaoHelper já evita duplicar caso
  // algum nível já tivesse sido aplicado antes por outro caminho.
  // SUBIU de nível (pelo botão "Subir de Nível" OU editando o campo "Nível"
  // manualmente - os dois caminhos passam por aqui, pra nunca ter granting
  // duplicado/divergente entre eles): aplica a progressão da Classe pra
  // todo nível novo alcançado e credita os Pontos de Subclasse ganhos
  // (nível 5 destrava com o total acumulado, +1 por nível dali em diante -
  // mesma regra de NaurenActor#prepareDerivedData). NaurenConcessaoHelper já
  // evita duplicar caso algum nível já tivesse sido aplicado antes.
  if (novoNivel > nivelAntigo) {
    if (classeItem) await NaurenProgressaoHelper.aplicarAteNivel(actor, classeItem, novoNivel);

    let pontosParaGanhar = 0;
    for (let n = nivelAntigo + 1; n <= novoNivel; n++) {
      if (n >= 5) pontosParaGanhar += (n === 5 ? 5 : 1);
    }
    if (pontosParaGanhar > 0) {
      const atual = actor.system.pontosSubclasse?.value ?? 0;
      await actor.update({ "system.pontosSubclasse.value": atual + pontosParaGanhar });
    }
    // Escala por Nível de monstro (ver
    // NaurenActorData#usaEscalaPorNivel/escalaAtributos): só roda se
    // "usaEscalaPorNivel" estiver ligado. Dois efeitos independentes:
    // (1) cada atributo com sua própria tabela é TRAVADO no valor que a
    // tabela diz pro nível NOVO (busca direta, não incremental - ver
    // naurenValorAtributoNoNivel); (2) Defesa sobe piso(novoNível/2)
    // menos piso(nivelAntigo/2) - a MESMA fórmula "10 + metade do
    // nível" do documento, como incremento por cima do valor já
    // configurado, nunca recalculando a Defesa inteira do zero.
    if (actor.system.usaEscalaPorNivel) {
      await naurenAplicarEscalaPorNivel(actor, novoNivel, nivelAntigo);
    }
    // Vida/Mana/Estamina de Combate/Dados de Destino: ressincroniza pro
    // MÁXIMO sempre que o Nível muda, pra QUALQUER Ator (não só os com
    // Escala por Nível ligada) - "vida.max" já recalcula sozinho a
    // partir de Vitalidade×Nível (fórmula padrão), mas "vida.value"
    // nunca segue esse recálculo automaticamente (guia de IA, seção 3)
    // - sem isto, subir/descer de nível deixa a barra mostrando "atual
    // > máximo" (ex: 66/6) sempre que o máximo mudar. Roda só AQUI, DEPOIS
    // de qualquer mudança de atributo do bloco acima (se houver) já ter
    // se aplicado - senão o "máximo" usado pra preencher seria o valor
    // ANTIGO, de antes da Escala por Nível somar os pontos deste nível.
    await naurenAjustarRecursosAoMudarNivel(actor, maximosAntes);
    // Recursos Customizados: re-sincroniza porque a fórmula de
    // máximo de um recurso pode referenciar "@nivel" (ex: Determinação
    // crescer com o personagem) - sem isso, o máximo ficaria travado no
    // valor calculado da 1ª vez que a Subclasse foi equipada.
    naurenSincronizarRecursosCustom(actor).catch(err => console.warn("Nauren RPG | Falha ao sincronizar recursos customizados (subiu de nível).", err));
    // Mascote/Companheiro: "sobe de nível sempre que você
    // sobe de nível" (manual, tópico Mascontes) - o resto (Vida, Meta
    // Atributos etc) recalcula sozinho no PRÓPRIO prepareDerivedData do
    // mascote, contanto que a fórmula de Vida dele use "@nivel" (mesmo
    // sistema de "Cálculo de Vida customizado" já usado em qualquer ator).
    naurenSincronizarNivelDosMascotes(actor, novoNivel).catch(err => console.warn("Nauren RPG | Falha ao sincronizar nível dos mascotes (subiu de nível).", err));
    return;
  }

  // DESCEU de nível: reverte com precisão só o que os níveis perdidos
  // concederam, e devolve os Pontos de Subclasse ganhos neles.
  const revertidos = [];
  if (classeItem) {
    for (let n = nivelAntigo; n > novoNivel; n--) {
      const ok = await NaurenConcessaoHelper.reverterEvento(actor, classeItem, `nivel:${n}`);
      // A escolha de itens daquele nível também volta, para ser oferecida de novo ao subir.
      const okEscolha = await NaurenConcessaoHelper.reverterEvento(actor, classeItem, `escolha:${n}`);
      if (ok || okEscolha) revertidos.push(n);
    }
  }

  let pontosParaRemover = 0;
  for (let n = nivelAntigo; n > novoNivel; n--) {
    if (n >= 5) pontosParaRemover += (n === 5 ? 5 : 1);
  }
  if (pontosParaRemover > 0) {
    const atual = actor.system.pontosSubclasse?.value ?? 0;
    await actor.update({ "system.pontosSubclasse.value": Math.max(0, atual - pontosParaRemover) });
  }

  // Escala por Nível de monstro: mesma lógica exata da subida (busca
  // direta na tabela, não incremental) - ver naurenAplicarEscalaPorNivel.
  if (actor.system.usaEscalaPorNivel) {
    await naurenAplicarEscalaPorNivel(actor, novoNivel, nivelAntigo);
  }

  // Mesmo motivo do ramo "SUBIU" acima - ver comentário lá. Roda DEPOIS
  // do bloco de Escala por Nível (se houver), nunca antes.
  await naurenAjustarRecursosAoMudarNivel(actor, maximosAntes);

  if (revertidos.length) {
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p class="nauren-aviso-chat"><i class="fas fa-arrow-down"></i> <b>${actor.name}</b> desceu para o nível ${novoNivel} — o que foi concedido pela Classe no(s) nível(is) ${revertidos.join(", ")} foi removido.</p>`
    });
  }
  naurenSincronizarRecursosCustom(actor).catch(err => console.warn("Nauren RPG | Falha ao sincronizar recursos customizados (desceu de nível).", err));
  naurenSincronizarNivelDosMascotes(actor, novoNivel).catch(err => console.warn("Nauren RPG | Falha ao sincronizar nível dos mascotes (desceu de nível).", err));
});


/**
 * Gatilhos por Evento a partir de mudanças de Vida, Estamina de Combate e
 * Estresse: digitar um valor menor de Vida direto na ficha (sem passar
 * pelo popup de reação a dano) também conta como "sofri dano" pros
 * Gatilhos. "Fiquei com metade de Vida", "Fiquei sem Estamina" e "Meu
 * Estresse atingiu" disparam em QUALQUER redução/aumento que cruze o
 * limiar - manual ou vinda do fluxo normal de combate - já que
 * representam um ESTADO do personagem, não uma reação a um ataque
 * específico (por isso não são protegidos por options.naurenOrigemCombate
 * como "euSofriDano"/"aliadoSofreuDano" são).
 */
Hooks.on("preUpdateActor", (actor, changes) => {
  const novaVida = foundry.utils.getProperty(changes, "system.vida.value");
  const novaEstamina = foundry.utils.getProperty(changes, "system.estaminaCombate.value");
  const novoEstresse = foundry.utils.getProperty(changes, "system.stress.value");
  if (novaVida === undefined && novaEstamina === undefined && novoEstresse === undefined) return;
  actor._naurenVidaAntigaManual = actor.system.vida?.value ?? 0;
  actor._naurenEstaminaAntigaManual = actor.system.estaminaCombate?.value ?? 0;
  actor._naurenEstresseAntigoManual = actor.system.stress?.value ?? 0;
});


Hooks.on("updateActor", (actor, changes, options, userId) => {
  if (userId !== game.user.id) return;

  const novaVida = foundry.utils.getProperty(changes, "system.vida.value");
  const vidaAntiga = actor._naurenVidaAntigaManual;
  delete actor._naurenVidaAntigaManual;
  if (novaVida !== undefined && vidaAntiga !== undefined) {
    if (novaVida < vidaAntiga && !options?.naurenOrigemCombate) {
      naurenProcessarGatilhos("aliadoSofreuDano", actor).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (edição manual - aliado sofreu dano).", err));
      naurenProcessarGatilhos("euSofriDano", actor).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (edição manual - eu sofri dano).", err));
    }
    const maxVida = actor.system.vida?.max ?? 0;
    if (maxVida > 0) {
      const metade = maxVida / 2;
      if (novaVida <= metade && vidaAntiga > metade) {
        naurenProcessarGatilhos("metadeVida", actor).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (metade de vida).", err));
      }
    }
  }

  const novaEstamina = foundry.utils.getProperty(changes, "system.estaminaCombate.value");
  const estaminaAntiga = actor._naurenEstaminaAntigaManual;
  delete actor._naurenEstaminaAntigaManual;
  if (novaEstamina !== undefined && estaminaAntiga !== undefined && novaEstamina <= 0 && estaminaAntiga > 0) {
    naurenProcessarGatilhos("semEstamina", actor).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (sem estamina).", err));
  }

  const novoEstresse = foundry.utils.getProperty(changes, "system.stress.value");
  const estresseAntigo = actor._naurenEstresseAntigoManual;
  delete actor._naurenEstresseAntigoManual;
  if (novoEstresse !== undefined && estresseAntigo !== undefined && novoEstresse > estresseAntigo) {
    naurenProcessarGatilhos("estresseAtingiu", actor, { valorAtual: novoEstresse }).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (estresse atingiu).", err));
  }
});


/**
 * Correção automática de Subclasse: roda em QUALQUER atualização do ator
 * (não só descer de nível - também cobre perder um Efeito/Pigmento que
 * concedia Pontos de Subclasse, um ajuste manual do GM no valor, etc.),
 * conferindo se o total investido nos nós de todas as Subclasses ainda
 * cabe no "max" atual. Ver NaurenSubclasseHelper.corrigirExcessoDeInvestimento
 * pra reverte com precisão (mais recente primeiro) quando não cabe mais.
 * Idempotente: se já estiver tudo dentro do limite, não faz nada - inclusive
 * quando esta mesma correção dispara sua própria atualização (o "excesso"
 * já vai ter sido zerado na segunda passada).
 */
Hooks.on("updateActor", async (actor, changes, options, userId) => {
  if (userId !== game.user.id) return;
  if (!actor.system?.pontosSubclasse) return;
  await NaurenSubclasseHelper.corrigirExcessoDeInvestimento(actor);
});


/**
 * Propaga mudanças no Token Padrão (aba "Ator" > "Token Padrão" da ficha,
 * ou "prototypeToken" no código) pra QUALQUER token JÁ COLOCADO deste
 * mesmo Ator, em QUALQUER cena - o Foundry nativamente só usa o Token
 * Padrão pra tokens NOVOS a partir daí, nunca atualiza retroativamente
 * os que já existem numa cena (comportamento do próprio Foundry, não um
 * bug deste sistema) - sem isso, era preciso arrastar o Ator pra cena de
 * novo pra "pegar" a mudança.
 *
 * De propósito NÃO sincroniza campos de INSTÂNCIA (posição, rotação,
 * elevação, se está oculto, ordem de sobreposição) - só o que é
 * "configuração padrão" (barras de recurso, política de nome/barra
 * visível, tamanho, luz, aparência etc.) - um token que o Mestre moveu,
 * escondeu ou girou manualmente numa cena específica não deveria voltar
 * do zero só porque o Token Padrão do Ator mudou.
 */
Hooks.on("updateActor", async (actor, changes, options, userId) => {
  if (userId !== game.user.id) return;
  if (!game.user.isGM) return;
  if (!changes.prototypeToken) return;

  const CAMPOS_DE_INSTANCIA = ["x", "y", "rotation", "elevation", "level", "levels", "hidden", "sort", "_id", "actorId"]; // "level": andar do token (V14)
  const atualizacao = foundry.utils.deepClone(changes.prototypeToken);
  for (const campo of CAMPOS_DE_INSTANCIA) delete atualizacao[campo];
  if (!Object.keys(atualizacao).length) return;

  for (const cena of game.scenes) {
    const tokensDoAtor = cena.tokens.filter(t => t.actorId === actor.id);
    if (!tokensDoAtor.length) continue;
    await cena.updateEmbeddedDocuments("Token", tokensDoAtor.map(t => ({ _id: t.id, ...atualizacao })));
  }
});
}

export { naurenAjustarRecursosAoMudarNivel, naurenAplicarEscalaPorNivel, naurenLerMaximos, naurenMaximosAntesDoNivel, naurenNivelAntigoPorAtor, naurenValorAtributoNoNivel };
