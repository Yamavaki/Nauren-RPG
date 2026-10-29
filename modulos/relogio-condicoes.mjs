/* Nauren RPG — Relógio de combate: tempo das Condições. Separado do nauren.mjs na 0.94.31. */
import { NAUREN_CAMPOS_MODIFICADOR_OPCOES, NaurenHabilidadeData, NaurenMagiaData, campoAcao, campoCuraBloco, campoDanoBloco, campoModificador, naurenDefinirCaminhoProfundo, naurenInterpretarModificador, naurenItemCorrespondeAoAlvo, naurenPostarCard, naurenResolverPorNivel, naurenUsosExtrasPara, naurenUsosPassivaMax } from "../nauren.mjs";
import { NaurenActorSheet, NaurenAlvoHelper } from "./ficha-ator.mjs";
import { NaurenItemSheet, USOS_RESET_OPCOES } from "./ficha-item.mjs";
import { naurenCaminhoImagemSubclasse, naurenGarantirItemNoPack } from "./compendios.mjs";
import { naurenReaplicarUpgradesDeSubclasse, naurenReconciliarItemComCompendio } from "./icone-condicao-token.mjs";
import { naurenRelogioProcessarTransicao } from "./relogio-combate.mjs";
/* =======================================
 * RELÓGIO DE COMBATE - tempo das Condições
 * -----------------------------------------------------------------------
 * Vocabulário único de momentos, usado por efeitos periódicos, durações,
 * usos, recursos declarados e gatilhos (ver naurenRelogioProcessarTransicao):
 *   inicioRodada / fimRodada           - exatamente na virada da rodada
 *   inicioTurnoQualquer / fimTurnoQualquer - em TODO turno, de qualquer um
 *   inicioTurnoPortador / fimTurnoPortador - só no turno de quem tem o efeito
 * ======================================= */
const NAUREN_MOMENTOS_PERIODICOS = {
  inicioRodada: "Início da rodada",
  fimRodada: "Fim da rodada",
  inicioTurnoQualquer: "Início de cada turno (de qualquer um)",
  fimTurnoQualquer: "Fim de cada turno (de qualquer um)",
  inicioTurnoPortador: "Início do turno de quem tem a Condição",
  fimTurnoPortador: "Fim do turno de quem tem a Condição"
};
const NAUREN_MODOS_DURACAO = {
  rodadas: "Rodadas (termina no mesmo ponto do turno em que foi aplicada)",
  turnosPortador: "Turnos de quem tem a Condição",
  turnosQualquer: "Turnos de qualquer um",
  cena: "Até o fim do combate (cena)"
};

/** Momento de um efeito periódico, com compatibilidade para "porTurno". */
function naurenMomentoEfeitoPeriodico(ef, cond = null) {
  if (ef?.quando && NAUREN_MOMENTOS_PERIODICOS[ef.quando]) return ef.quando;
  // Esta Condição, neste alvo, age por turno (ex.: veneno de flecha/lança com Ingrediente Ofídico).
  if (cond?.getFlag?.("nauren", "periodicoPorTurno")) return "inicioTurnoQualquer";
  return ef?.porTurno ? "inicioTurnoQualquer" : "inicioRodada";
}

/** Modo de duração de uma Condição, com compatibilidade para "duracaoPorTurno". */
function naurenModoDuracaoCondicao(sys) {
  if (sys?.duracaoModo && NAUREN_MODOS_DURACAO[sys.duracaoModo]) return sys.duracaoModo;
  return sys?.duracaoPorTurno ? "turnosQualquer" : "rodadas";
}

/**
 * Âncora de duração para "agora": o combatente cujo turno está em curso
 * (mesmo que a aplicação aconteça dentro de uma Prioridade, no turno de
 * outro). Fora de um combate iniciado, devolve âncora vazia - a duração
 * passa a contar pela virada da rodada quando houver combate.
 */
function naurenAncoraDuracaoAtual(prefixo = "") {
  const combate = game.combat;
  const ativo = combate?.started ? combate.combatant : null;
  return {
    [`${prefixo}duracaoAncoraCombatenteId`]: ativo?.id ?? "",
    [`${prefixo}duracaoAncoraCombateId`]: ativo ? combate.id : "",
    [`${prefixo}duracaoAncoraIniciativa`]: ativo && Number.isFinite(ativo.initiative) ? ativo.initiative : null,
    [`${prefixo}duracaoUltimaRodada`]: ativo ? (combate.round ?? 0) : 0
  };
}

/**
 * Avança as durações das Condições de um ator no momento indicado.
 * ctx = { combate, combatenteAtualId, portadorEstaNoTurno }.
 *   "rodadas":        com âncora válida (mesmo combate, âncora ainda na
 *                     iniciativa) desconta quando o turno da âncora começa;
 *                     sem âncora (ou âncora removida) desconta na virada
 *                     da rodada.
 *   "turnosPortador": desconta no início do turno do portador.
 *   "turnosQualquer": desconta no início de qualquer turno.
 * Expiração vai para o chat com o motivo.
 */
async function naurenAvancarDuracoesCondicoes(actor, momento, ctx = {}) {
  if (!actor?.system?.vida) return;
  const condicoes = actor.items.filter(i => i.type === "condicao" && i.system.ativo && (i.system.duracaoRodadas || 0) > 0);
  if (!condicoes.length) return;
  const combate = ctx.combate ?? game.combat;
  const rodada = combate?.round ?? 0;
  const iniciativaAtual = combate?.combatants?.get?.(ctx.combatenteAtualId)?.initiative;
  const expiradas = [];
  for (const cond of condicoes) {
    const sys = cond.system;
    const modo = naurenModoDuracaoCondicao(sys);
    if (modo === "cena") continue; // só termina quando o combate acaba (deleteCombat)
    let desconta = false;
    if (modo === "turnosQualquer") {
      desconta = momento === "inicioTurnoQualquer";
    } else if (modo === "turnosPortador") {
      desconta = momento === "inicioTurnoPortador";
    } else {
      // "rodadas": uma vez por rodada, ao passar pelo ponto da âncora.
      const doMesmoCombate = !!sys.duracaoAncoraCombatenteId && !!combate && sys.duracaoAncoraCombateId === combate.id;
      const ultima = sys.duracaoUltimaRodada ?? 0;
      if (doMesmoCombate && combate.combatants.has(sys.duracaoAncoraCombatenteId)) {
        // Âncora presente: desconta quando o turno dela começa.
        // Aplicada (ou renovada) nesta mesma rodada antes do turno da âncora começar (ex.: renovação de área
        // no início da rodada): ainda não deu a volta - não desconta agora.
        desconta = momento === "inicioTurnoQualquer" && ctx.combatenteAtualId === sys.duracaoAncoraCombatenteId && (sys.duracaoUltimaRodada ?? 0) < rodada;
      } else if (doMesmoCombate && Number.isFinite(sys.duracaoAncoraIniciativa)) {
        // Âncora saiu do combate: desconta no primeiro turno que vem depois
        // da posição dela na ordem; se ninguém vier depois naquela rodada,
        // desconta na virada.
        if (momento === "inicioTurnoQualquer") {
          desconta = ultima < rodada && Number.isFinite(iniciativaAtual) && iniciativaAtual < sys.duracaoAncoraIniciativa;
        } else if (momento === "inicioRodada") {
          desconta = ultima < rodada - 1;
        }
      } else {
        // Sem âncora (aplicada fora de combate): conta pela virada da rodada.
        desconta = momento === "inicioRodada";
      }
    }
    if (!desconta) continue;
    const restante = (sys.duracaoRestante || sys.duracaoRodadas) - 1;
    if (restante <= 0) {
      expiradas.push(cond.name);
      await cond.delete();
    } else {
      const upd = { "system.duracaoRestante": restante };
      if (modo === "rodadas") upd["system.duracaoUltimaRodada"] = momento === "inicioRodada" ? rodada - 1 : rodada;
      await cond.update(upd);
    }
  }
  if (expiradas.length) {
    naurenPostarCard({ ator: actor, titulo: "Duração encerrada", icone: "icons/magic/time/hourglass-tilted-gray.webp", fonte: "Relógio de Combate",
      linhas: expiradas.map(nome => ({ label: nome, value: "expirou" })) });
  }
}

/**
 * Recarrega os "Usos por dia/cena/rodada/turno" (campoAcao > usaUsos) de
 * TODAS as Ações de TODOS os itens de um ator que estejam no escopo pedido
 * (ver USOS_RESET_OPCOES). Chamado ao fim do combate (escopo "cena"), a cada
 * rodada/turno durante o combate (escopos "rodada"/"turno"), ou pelo botão
 * manual "Descansar" na aba Opções da ficha (escopo "dia").
 */
async function naurenRecarregarUsos(actor, escopo) {
  if (!actor?.items) return;
  const nivelAtor = actor.system?.nivel || 1;
  for (const item of actor.items) {
    const updateData = {};
    const sys = item.system;
    const acoes = sys?.acoes;
    // Quando o item tem "usaUsos" (pool compartilhado - ver Comungar),
    // nenhuma Ação individual dele tem usosAtual próprio real, então a
    // recarga por Ação abaixo é pulada por completo pra este item -
    // o pool do próprio item é recarregado separadamente mais abaixo.
    if (acoes?.length && (!sys?.usaUsos || acoes.some(a => a.usosProprios))) {
      let mudouAcoes = false;
      const clonadas = foundry.utils.deepClone(acoes);
      for (const a of clonadas) {
        if (sys?.usaUsos && !a.usosProprios) continue;
        const usosMaxPorNivel = naurenResolverPorNivel(a.usosMaxPorNivel, nivelAtor, "valor");
        const usosMaxEfetivo = (usosMaxPorNivel !== null ? usosMaxPorNivel : (a.usosMax ?? 0)) + naurenUsosExtrasPara(actor, item, a.nome);
        if (a.usaUsos && (a.usosReset || "cena") === escopo && ((a.usosAtual ?? 0) < usosMaxEfetivo || (a.usosBonusConsumidoAtual ?? 0) > 0)) {
          a.usosAtual = usosMaxEfetivo;
          a.usosBonusConsumidoAtual = 0;
          mudouAcoes = true;
        }
      }
      if (mudouAcoes) updateData["system.acoes"] = clonadas;
    }
    // Usos da Habilidade (nível do item, ver NaurenHabilidadeData/
    // NaurenMagiaData > usaUsos) - mesmo motor de reset dos de Ação,
    // só que com uma tabela "usosMaxPorNivel" própria (Usos Passivos
    // abaixo não escalam por nível).
    if (sys?.usaUsos) {
      const usosMaxPorNivelItem = naurenResolverPorNivel(sys.usosMaxPorNivel, nivelAtor, "valor");
      const usosMaxEfetivoItem = (usosMaxPorNivelItem !== null ? usosMaxPorNivelItem : (sys.usosMax ?? 0)) + naurenUsosExtrasPara(actor, item, "item");
      if ((sys.usosReset || "dia") === escopo && (sys.usosAtual ?? 0) < usosMaxEfetivoItem) {
        updateData["system.usosAtual"] = usosMaxEfetivoItem;
      }
    }
    // Usos de Habilidade Passiva - mesmo motor de reset, só que no
    // nível do item inteiro (não dentro de uma Ação específica dele).
    if (sys?.usaUsosPassiva && (sys.usosPassivaReset || "turno") === escopo && (sys.usosPassivaAtual ?? 0) < naurenUsosPassivaMax(sys)) {
      updateData["system.usosPassivaAtual"] = naurenUsosPassivaMax(sys);
    }
    if (Object.keys(updateData).length) await item.update(updateData);
  }
}

/**
 * Migração one-shot: liga, em todo Ator (personagem ou NPC) que ainda
 * estiver com o valor antigo (false), qualquer opção da aba Opções cujo
 * padrão do schema mudou de "desligado" pra "ligado" - isso só afeta atores
 * CRIADOS a partir da mudança; os que já existiam no mundo continuam com o
 * que foi gravado na criação deles. Cada opção listada em CAMPOS_MIGRADOS
 * roda só uma vez por mundo, com sua PRÓPRIA setting de controle (assim,
 * adicionar uma nova opção aqui no futuro não re-roda as que já migraram).
 */
const CAMPOS_MIGRADOS_PARA_LIGADO = [
  { campo: "popupDefesaAoTomarDano", setting: "migracaoPopupDefesaV1", label: "Popup de defesa ao tomar dano" },
  { campo: "perguntarAcaoAoUsar", setting: "migracaoPerguntarAcaoV1", label: "Perguntar qual Ação usar" }
];

async function naurenMigrarOpcoesPadraoLigado() {
  for (const { campo, setting, label } of CAMPOS_MIGRADOS_PARA_LIGADO) {
    try {
      if (game.settings.get("nauren", setting)) continue;
      const alvos = game.actors.filter(a =>
        ["personagem", "npc"].includes(a.type) && a.system?.[campo] === false
      );
      for (const actor of alvos) {
        await actor.update({ [`system.${campo}`]: true });
      }
      await game.settings.set("nauren", setting, true);
      if (alvos.length) {
        console.log(`Nauren RPG | Migração: "${label}" habilitado automaticamente em ${alvos.length} personagem(ns)/NPC(s) que ainda estavam com o valor antigo.`);
      }
    } catch (err) {
      console.warn(`Nauren RPG | Falha ao rodar a migração de "${campo}".`, err);
    }
  }
}

/**
 * Migração one-shot: unifica os campos antigos de Dano/Cura ("Atributo" +
 * "Bônus fixo") e de Ataque ("Bônus fixo" + "Dado extra") num único campo de
 * Fórmula livre (aceita "@atributo" embutido) - ver campoDanoBloco/
 * campoCuraBloco/campoAcao. Sem essa migração, itens já configurados
 * ANTES dessa mudança perderiam silenciosamente o bônus de atributo/fixo
 * que tinham (o schema novo simplesmente não sabe mais ler esses campos).
 * Usa item.toObject() (dados crus) pra ainda enxergar os campos antigos,
 * já que a leitura normal (item.system) só devolve o que o schema ATUAL
 * define. Roda em todo item do mundo e em todo item embutido em todo Ator.
 */
/**
 * Migração one-shot: preenche "imagemFundo" nas Subclasses que já
 * existiam no compêndio ANTES desta convenção (naurenCaminhoImagemSubclasse)
 * existir - sem isso, só Subclasses CRIADAS DO ZERO depois desta versão
 * ganhariam o caminho automaticamente (naurenGarantirItemNoPack nunca
 * sobrescreve um item já existente). Só toca em Subclasses com
 * "imagemFundo" VAZIO - se alguém já configurou uma imagem própria
 * manualmente, isso nunca é sobrescrito.
 */
async function naurenMigrarImagemFundoSubclasse(packs) {
  try {
    if (game.settings.get("nauren", "migracaoImagemFundoSubclasseV1")) return;
    let total = 0;
    const docs = await packs.subclasses.getDocuments();
    for (const doc of docs) {
      if (doc.type !== "subclasse") continue;
      if (doc.system.imagemFundo) continue; // já tem imagem própria (ou já migrado) - não mexe
      const cid = doc.system.classeIdentifier;
      if (!cid) continue;
      await doc.update({ "system.imagemFundo": naurenCaminhoImagemSubclasse(cid) });
      total++;
    }
    await game.settings.set("nauren", "migracaoImagemFundoSubclasseV1", true);
    if (total > 0) {
      console.log(`Nauren RPG | Migração: caminho de imagem de fundo preenchido em ${total} Subclasse(s) que ainda estavam sem nenhuma configurada.`);
    }
  } catch (err) {
    console.warn("Nauren RPG | Falha ao rodar a migração de imagem de fundo das Subclasses.", err);
  }
}

/**
 * Migração one-shot SEPARADA: a convenção de imagem de fundo mudou de
 * ".webp" pra ".png" logo depois de naurenMigrarImagemFundoSubclasse já
 * ter rodado em alguns mundos (gravando ".webp"). Como aquela migração só
 * roda 1 vez, só trocar a extensão no código não bastaria pra corrigir
 * quem já foi migrado. Só troca a extensão se o caminho gravado bater
 * EXATAMENTE com o padrão automático (evita mexer em qualquer imagem que
 * o usuário tenha customizado por conta própria, mesmo que termine em
 * ".webp" por coincidência).
 */
async function naurenMigrarExtensaoImagemFundoSubclasse(packs) {
  try {
    if (game.settings.get("nauren", "migracaoImagemFundoExtensaoV1")) return;
    let total = 0;
    const docs = await packs.subclasses.getDocuments();
    for (const doc of docs) {
      if (doc.type !== "subclasse") continue;
      const cid = doc.system.classeIdentifier;
      if (!cid) continue;
      const caminhoAntigo = `systems/nauren/assets/subclasses/${cid}.webp`;
      if (doc.system.imagemFundo !== caminhoAntigo) continue;
      await doc.update({ "system.imagemFundo": naurenCaminhoImagemSubclasse(cid) });
      total++;
    }
    await game.settings.set("nauren", "migracaoImagemFundoExtensaoV1", true);
    if (total > 0) {
      console.log(`Nauren RPG | Migração: extensão de imagem de fundo corrigida de .webp pra .png em ${total} Subclasse(s).`);
    }
  } catch (err) {
    console.warn("Nauren RPG | Falha ao rodar a migração de extensão de imagem de fundo.", err);
  }
}

/**
 * Migração one-shot: "Corpo de Pedra" (Guerreiro) foi escrito numa versão
 * anterior SEM o Efeito Vinculado (Redução de Dano + Força) que a
 * descrição já prometia - "naurenGarantirItemNoPack" NUNCA atualiza um
 * item que já existe no compêndio, então mundos que já tinham semeado
 * essa Habilidade ANTES da correção ficaram travados com a versão velha
 * (sem efeito nenhum) pra sempre, mesmo depois do código ser corrigido.
 * Corrige em DOIS níveis: o MOLDE no compêndio de Habilidades (pra
 * concessões futuras já saírem certas) e toda CÓPIA já concedida a um
 * Ator ou token não vinculado (que clonou os dados errados na hora da
 * concessão, e não seria corrigida só por arrumar o molde).
 */
async function naurenMigrarCorpoDePedraV1(packs) {
  try {
    if (game.settings.get("nauren", "migracaoCorpoDePedraV1")) return;
    const efeitosCorretos = [{
      ativo: true,
      modificadores: [
        { campo: "reducaoDano", valor: "1", porRank: [{ rank: 2, valor: "2" }, { rank: 3, valor: "3" }] },
        { campo: "forca", valor: "1", porRank: [{ rank: 2, valor: "2" }, { rank: 3, valor: "3" }] }
      ]
    }];

    await packs.habilidades.getIndex({ fields: ["flags.nauren.seedId"] });
    const entradaMolde = packs.habilidades.index.find(i => i.flags?.nauren?.seedId === "habilidade-guerreiro-corpo-de-pedra");
    if (!entradaMolde) {
      await game.settings.set("nauren", "migracaoCorpoDePedraV1", true);
      return; // mundo novo, nunca semeado ainda - a criação normal já vem certa
    }
    const molde = await packs.habilidades.getDocument(entradaMolde._id);
    let total = 0;
    if (!molde.system.efeitosVinculados?.length) {
      await molde.update({ "system.efeitosVinculados": efeitosCorretos });
      total++;
    }

    // Cópias já concedidas: qualquer Ator (game.actors) OU token não
    // vinculado de qualquer cena (mesmo alcance já usado na migração de
    // Emanação) com um item "origemUuid" apontando pro molde.
    const atoresJaVistos = new Set();
    const corrigirCopiasDoAtor = async (actor) => {
      if (!actor || atoresJaVistos.has(actor.uuid)) return;
      atoresJaVistos.add(actor.uuid);
      for (const item of actor.items) {
        if (item.getFlag("nauren", "origemUuid") !== molde.uuid) continue;
        if (item.system.efeitosVinculados?.length) continue; // já tem, não sobrescreve customização do jogador
        await item.update({ "system.efeitosVinculados": efeitosCorretos });
        total++;
      }
    };
    for (const actor of game.actors) await corrigirCopiasDoAtor(actor);
    for (const cena of game.scenes) {
      for (const tokenDoc of cena.tokens) await corrigirCopiasDoAtor(tokenDoc.actor);
    }

    await game.settings.set("nauren", "migracaoCorpoDePedraV1", true);
    if (total > 0) {
      console.log(`Nauren RPG | Migração: "Corpo de Pedra" corrigido (Efeito Vinculado adicionado) em ${total} lugar(es) - molde e/ou cópias já concedidas.`);
    }
  } catch (err) {
    console.warn("Nauren RPG | Falha ao rodar a migração de \"Corpo de Pedra\".", err);
  }
}


async function naurenMigrarFormulasUnificadas() {
  try {
    if (game.settings.get("nauren", "migracaoFormulaUnificadaV1")) return;
    let totalItens = 0;

    const migrarItem = async (item) => {
      const fonte = item.toObject();
      const acoesFonte = fonte.system?.acoes;
      if (!acoesFonte?.length) return;

      let mudou = false;
      const acoesMigradas = foundry.utils.deepClone(acoesFonte);
      for (const acao of acoesMigradas) {
        if ((acao.ataqueBonus || acao.ataqueBonusDado) && !acao.ataqueBonusExtra) {
          const partes = [];
          if (acao.ataqueBonus) partes.push(String(acao.ataqueBonus));
          if (acao.ataqueBonusDado) partes.push(acao.ataqueBonusDado);
          acao.ataqueBonusExtra = partes.join(" + ");
          mudou = true;
        }
        delete acao.ataqueBonus;
        delete acao.ataqueBonusDado;

        for (const bloco of [...(acao.danos ?? []), ...(acao.curas ?? [])]) {
          const temAtributo = bloco.atributo && bloco.atributo !== "nenhum";
          if (temAtributo || bloco.bonus) {
            const partes = [bloco.formula || "0"];
            if (temAtributo) partes.push(`@${bloco.atributo}`);
            if (bloco.bonus) partes.push(String(bloco.bonus));
            bloco.formula = partes.join(" + ");
            mudou = true;
          }
          delete bloco.atributo;
          delete bloco.bonus;
        }
      }

      if (mudou) {
        await item.update({ "system.acoes": acoesMigradas });
        totalItens++;
      }
    };

    for (const item of game.items) await migrarItem(item);
    for (const actor of game.actors) {
      for (const item of actor.items) await migrarItem(item);
    }

    await game.settings.set("nauren", "migracaoFormulaUnificadaV1", true);
    if (totalItens > 0) {
      console.log(`Nauren RPG | Migração: fórmula de Dano/Cura/Ataque unificada em ${totalItens} item(ns) que ainda usavam os campos antigos (Atributo/Bônus fixo/Dado extra).`);
    }
  } catch (err) {
    console.warn("Nauren RPG | Falha ao rodar a migração de fórmulas unificadas.", err);
  }
}

// Os 18 campos compartilhados de bônus/modificador (Bônus Manual, Efeito,
// Condição, Pigmento) - ver naurenInterpretarModificador pra entender a
// sintaxe nova ("+2"/"-3" soma, número/fórmula sem sinal fixa).
const NAUREN_CAMPOS_MODIFICADOR_18 = [
  "ataque", "defesa", "bloqueio", "esquiva", "pontosSubclasse", "movimento",
  "forca", "agilidade", "estamina", "inteligencia", "destino",
  "espirito", "poderAtaque", "poderMagia", "vitalidade", "vida", "mana", "estresse"
];

/**
 * Migração one-shot: os 18 campos acima eram NÚMEROS simples (sempre um
 * bônus ADITIVO); agora são TEXTO, aceitando "+2"/"-3" (soma, igual sempre
 * foi) OU um número/fórmula SEM sinal na frente pra FIXAR o valor (ver
 * naurenInterpretarModificador). Sem esta migração, um valor antigo como
 * "2" (que sempre significou "+2") passaria a ser lido como "fixar em 2" -
 * mudando o comportamento de tudo que já existia ANTES dessa mudança. Usa
 * toObject() (dados crus) pra pegar o número original, antes do schema
 * atual convertê-lo pra texto sozinho (o que perderia o sinal).
 */
async function naurenMigrarModificadoresParaTexto() {
  try {
    if (game.settings.get("nauren", "migracaoModificadorTextoV1")) return;
    let totalItens = 0;
    let totalAtores = 0;

    const converterNumeroPraTexto = (n) => {
      if (typeof n !== "number") return null; // já é texto (ou não existe) - nada a fazer
      if (n === 0) return ""; // "sem bônus" continua "sem bônus", não vira "fixar em 0"
      return n > 0 ? `+${n}` : String(n); // negativo já sai com o "-" embutido
    };

    const montarPatch = (fonteSystem) => {
      const patch = {};
      let mudou = false;
      for (const campo of NAUREN_CAMPOS_MODIFICADOR_18) {
        const convertido = converterNumeroPraTexto(fonteSystem?.[campo]);
        if (convertido !== null) { patch[campo] = convertido; mudou = true; }
      }
      return mudou ? patch : null;
    };

    const migrarItem = async (item) => {
      // Efeito e Condição saíram desta migração - eles agora usam a lista
      // dinâmica "modificadores" (ver naurenMigrarModificadoresParaLista
      // logo abaixo), não a grade fixa de 18 campos. Só Pigmento (Cor)
      // continua com a grade fixa por enquanto.
      if (item.type !== "cor") return;
      const patch = montarPatch(item.toObject().system);
      if (patch) { await item.update({ system: patch }); totalItens++; }
    };

    for (const item of game.items) await migrarItem(item);
    for (const actor of game.actors) {
      for (const item of actor.items) await migrarItem(item);
      const patchBonus = montarPatch(actor.toObject().system?.bonus);
      if (patchBonus) { await actor.update({ system: { bonus: patchBonus } }); totalAtores++; }
    }

    await game.settings.set("nauren", "migracaoModificadorTextoV1", true);
    if (totalItens > 0 || totalAtores > 0) {
      console.log(`Nauren RPG | Migração: campos de bônus convertidos pro formato de texto (+X soma, número puro fixa) em ${totalItens} item(ns) e ${totalAtores} personagem(ns)/NPC(s).`);
    }
  } catch (err) {
    console.warn("Nauren RPG | Falha ao rodar a migração dos modificadores pra texto.", err);
  }
}

/**
 * Migração one-shot: Efeito e Condição trocaram os 18 campos fixos de
 * bônus (Ataque, Defesa, os 5 Atributos, etc., cada um sempre visível na
 * ficha mesmo vazio) por uma lista dinâmica "modificadores" (cada linha
 * escolhe seu próprio campo - ver campoModificador) - só aparece na ficha o
 * que o item realmente usa. Lê os valores antigos direto de toObject()
 * (dados crus, ainda presentes mesmo depois do campo sumir do schema
 * atual) - funciona tanto pra quem já tinha passado pela migração anterior
 * (naurenMigrarModificadoresParaTexto, valores já em texto com sinal)
 * quanto pra quem nunca migrou (valores ainda como número puro) - e monta
 * uma linha na lista nova pra cada campo que tinha algo preenchido.
 * Acúmulos/Evolução/Duração NÃO são tocados aqui - são campos totalmente
 * separados dos modificadores, e a cópia de um item (origem.toObject(), em
 * NaurenAlvoHelper.aplicarCondicao) já carrega "modificadores" sozinha,
 * então a cadeia de evolução continua funcionando sem nenhuma mudança.
 */
async function naurenMigrarModificadoresParaLista() {
  try {
    if (game.settings.get("nauren", "migracaoModificadorListaV1")) return;
    let totalItens = 0;

    const paraTexto = (v) => {
      if (typeof v === "number") return v === 0 ? "" : (v > 0 ? `+${v}` : String(v));
      if (typeof v === "string") return v.trim();
      return "";
    };

    const migrarItem = async (item) => {
      if (!["efeito", "condicao"].includes(item.type)) return;
      const fonte = item.toObject().system ?? {};
      // Já tem alguma coisa na lista nova? Não reprocessa (evita duplicar
      // linhas se a migração rodar mais de uma vez por qualquer motivo).
      if (fonte.modificadores?.length) return;

      const modificadores = [];
      for (const campo of Object.keys(NAUREN_CAMPOS_MODIFICADOR_OPCOES)) {
        const valor = paraTexto(fonte[campo]);
        if (valor) modificadores.push({ campo, valor, porRank: [] });
      }
      if (!modificadores.length) return;

      await item.update({ "system.modificadores": modificadores });
      totalItens++;
    };

    for (const item of game.items) await migrarItem(item);
    for (const actor of game.actors) {
      for (const item of actor.items) await migrarItem(item);
    }

    await game.settings.set("nauren", "migracaoModificadorListaV1", true);
    if (totalItens > 0) {
      console.log(`Nauren RPG | Migração: campos de bônus de Efeito/Condição convertidos pra lista dinâmica de modificadores em ${totalItens} item(ns).`);
    }
  } catch (err) {
    console.warn("Nauren RPG | Falha ao rodar a migração dos modificadores pra lista.", err);
  }
}

/**
 * ============================================================
 * GRUPO DE JOGADORES: Graça do Destinado / Perjúrio do Acaso
 * ============================================================
 * Um item do tipo "grupo" (normalmente solto na barra lateral de Itens, sem
 * precisar estar embutido em nenhum ator) guarda os dois contadores
 * compartilhados do Capítulo III. A detecção automática NÃO depende de uma
 * lista de membros: qualquer d20 rolado pelo sistema (teste de atributo ou
 * ataque de QUALQUER ator - personagem OU NPC, incluindo NPCs controlados
 * pelo mestre) que sair 20 ou 1 natural soma o ponto correspondente em todo
 * Grupo com a detecção ligada (ver NaurenActorSheet#_notificarGrupoSeNaturalExtremo).
 * A lista de "Membros" na ficha do Grupo é só um ROSTER de referência (pra
 * lembrar quem está na mesa) - não filtra mais quem conta ou não.
 *
 * Problema de permissão: um item solto no mundo normalmente só pode ser
 * editado por quem tem posse dele (o GM, por padrão) - um jogador comum não
 * teria permissão de update. Por isso, se quem rolou o dado não for "dono"
 * do item de Grupo, o ajuste é delegado a um GM ativo através da mesma API
 * de Queries usada em NaurenAlvoHelper.
 */
class NaurenGrupoHelper {
  static QUERY_NOME = "nauren.grupoAjustar";

  /** Registrado em CONFIG.queries no init - roda no cliente que RECEBE o pedido (um GM). */
  static async handleQuery({ itemUuid, campo, delta }) {
    const item = await fromUuid(itemUuid);
    if (!item) return false;
    // Chamado pelo Foundry sem "this" (canal registrado solto): usar o nome da classe.
    return NaurenGrupoHelper._ajustarLocalmente(item, campo, delta);
  }

  /** Todo item de tipo "grupo" no mundo com a detecção automática ligada - vale pra QUALQUER rolagem do sistema, não só de quem está na lista de membros. */
  static gruposAtivos() {
    return game.items.filter(i => i.type === "grupo" && i.system.automatico !== false);
  }

  /**
   * Nível de Ameaça de um Ator, procurando em TODO item de tipo "grupo"
   * do mundo (não filtra pelo toggle "automatico" - Ameaça é
   * independente disso) por um membro com esse "actorUuid". Devolve
   * "null" se o Ator não estiver cadastrado em nenhum Grupo (a Combat
   * Tracker não mostra nada nesse caso, em vez de mostrar "0"). Se
   * cadastrado em mais de um Grupo, usa o PRIMEIRO encontrado.
   */
  static ameacaDoAtor(actor) {
    if (!actor) return null;
    const uuid = actor.uuid;
    for (const grupo of game.items.filter(i => i.type === "grupo")) {
      const membro = (grupo.system.membros ?? []).find(m => m.actorUuid === uuid);
      if (membro) return membro.ameaca ?? 0;
    }
    return null;
  }

  /** Ponto de entrada: soma 1 ponto de Graça (face 20) ou Perjúrio (face 1) em todo Grupo ativo, e avisa no chat. Roda pra qualquer ator (personagem ou NPC). */
  /** Limiares de Perjúrio/Graça para este ator: o do Grupo (definido pelo Mestre) ampliado pelas habilidades dele. */
  static limiares(actor) {
    const g = this.gruposAtivos()[0];
    const basePerj = Number(g?.system?.limiarPerjurio) || 1, baseGraca = Number(g?.system?.limiarGraca) || 20;
    return {
      perjurioMax: basePerj + (actor?.system?.perjurioLimiarTotal ?? 0),
      gracaMin: baseGraca - (actor?.system?.gracaLimiarTotal ?? 0)
    };
  }

  static async notificarRolagem(actor, face, tipo) {
    const grupos = this.gruposAtivos();
    if (!grupos.length) return;
    const campo = tipo === "graca" ? "graca" : "perjurio";
    for (const grupo of grupos) await this.ajustar(grupo, campo, 1);
    const label = tipo === "graca" ? "Graça do Destinado" : "Perjúrio do Acaso";
    naurenPostarCard({
      ator: actor ?? null, titulo: label, icone: "icons/sundries/gaming/dice-runed-tan.webp", fonte: "Grupo de Jogadores",
      linhas: [{ label: `${actor?.name ?? "Alguém"} tirou ${face} natural`, value: `+1 ${label}` }]
    });
  }

  /** Ajuste manual (botões +/- e "resetar" na ficha do Grupo) ou automático - sempre passando por aqui, que decide se aplica local ou delega pro GM. */
  static async ajustar(grupoItem, campo, delta) {
    if (grupoItem.isOwner) return this._ajustarLocalmente(grupoItem, campo, delta);
    const gm = game.users.find(u => u.isGM && u.active);
    if (!gm) { ui.notifications.warn("Nenhum mestre online pra atualizar o Grupo de Jogadores."); return; }
    if (typeof gm.query !== "function") { ui.notifications.warn("API de Query indisponível - peça pro mestre ajustar manualmente."); return; }
    try {
      await gm.query(this.QUERY_NOME, { itemUuid: grupoItem.uuid, campo, delta }, { timeout: 20000 });
    } catch (err) {
      console.warn("Nauren RPG | Falha ao ajustar Grupo via Query.", err);
    }
  }

  static async _ajustarLocalmente(item, campo, delta) {
    const atual = item.system[campo]?.value ?? 0;
    const novo = Math.max(0, atual + delta);
    await item.update({ [`system.${campo}.value`]: novo });
    return true;
  }
}

/**
 * ============================================================
 * CONCESSÃO DE ITENS COM HISTÓRICO (base de Classe / Subclasse)
 * ============================================================
 * Helper genérico pra "conceder uma cópia de um item do mundo/compêndio a um
 * ator, guardando um registro de exatamente o que foi criado/alterado" - vai
 * ser usado pelas próximas fases de Classe (grant por nível) e Subclasse
 * (grant por nó da árvore). Cada evento de concessão é identificado por uma
 * chave "origem" (ex: "nivel:3", "no:corpo-de-pedra:rank:2") e fica
 * registrado dentro do campo "historico" do item QUE CONCEDEU (a cópia da
 * Classe ou Subclasse já embutida no ator) - nunca no ator diretamente,
 * assim reverter uma Subclasse não mexe no histórico da Classe nem de outra
 * Subclasse equipada ao mesmo tempo.
 *
 * IMPORTANTE: "itemConcedente" precisa ter um campo `system.historico`
 * (Array) no schema dele - ainda não existe em nenhum tipo de item hoje
 * (Classe e Subclasse chegam nas próximas fases). Até lá, este helper fica
 * pronto e testável isoladamente, mas sem nenhum consumidor - não muda o
 * comportamento de nada que já existe.
 */
class NaurenConcessaoHelper {
  /**
   * Concede uma cópia de "uuidOrigem" ao ator, registrando o evento no
   * histórico do item concedente. Se já existir uma entrada de histórico com
   * essa mesma "origem" (ex: reprocessar o mesmo nível de novo sem querer),
   * NÃO duplica. Devolve o Item criado no ator, ou null se o item de origem
   * não foi encontrado ou se aquela origem já tinha sido concedida antes.
   */
  static async concederItem(actor, itemConcedente, origem, uuidOrigem) {
    if (!uuidOrigem) return null;
    const fonte = await fromUuid(uuidOrigem);
    if (!fonte) {
      console.warn(`Nauren RPG | Concessão: item de origem "${uuidOrigem}" não encontrado.`);
      return null;
    }
    const historicoAtual = foundry.utils.deepClone(itemConcedente.system.historico ?? []);
    // BUG CORRIGIDO: a checagem antiga era "já existe ALGUMA entrada com
    // esta origem? então não concede nada" - isso bloqueava silenciosamente
    // o 2º, 3º... item de um nível que concede MAIS DE UM item ao mesmo
    // tempo (ex: a Habilidade de assinatura + "Dar Prioridade" no nível 1
    // de toda Classe), já que a 1ª chamada já registrava a origem "nivel:1"
    // e a 2ª achava essa entrada e desistia. Agora a checagem é por ITEM
    // (via a flag "origemUuid" de cada cópia já criada), não por origem -
    // então vários itens da MESMA origem continuam sendo concedidos, só
    // não duplicam o MESMO item se a função rodar de novo pra ele.
    let entrada = historicoAtual.find(h => h.origem === origem);
    if (entrada) {
      const jaTemEsteItem = (entrada.itensCriados ?? []).some(itemId => actor.items.get(itemId)?.getFlag("nauren", "origemUuid") === uuidOrigem);
      if (jaTemEsteItem) return null;
    }

    const dados = fonte.toObject();
    delete dados._id;
    // "flags.core.sourceId" foi REMOVIDO no Foundry V14 (a própria
    // documentação oficial confirma) - não confiar mais nele pra
    // localizar o item depois (ver "origemUuid" abaixo). Mantido aqui só
    // por compatibilidade caso algum outro módulo externo ainda o leia.
    foundry.utils.setProperty(dados, "flags.core.sourceId", uuidOrigem);
    foundry.utils.setProperty(dados, "flags.nauren.origemUuid", uuidOrigem);
    foundry.utils.setProperty(dados, "flags.nauren.concedidoPor", { itemId: itemConcedente.id, origem });
    const [criado] = await actor.createEmbeddedDocuments("Item", [dados]);

    if (entrada) {
      entrada.itensCriados = [...(entrada.itensCriados ?? []), criado.id];
    } else {
      historicoAtual.push({ origem, itensCriados: [criado.id], upgrades: [], em: Date.now() });
    }
    // O histórico fica no item de ORIGEM (ex.: a Matilha do Druida). Quando
    // quem concede é outro personagem (ex.: o alvo é de outro jogador), este
    // cliente pode não ter permissão sobre ele: a concessão vale mesmo assim.
    if (itemConcedente.isOwner) {
      await itemConcedente.update({ "system.historico": historicoAtual }).catch(err => console.warn("Nauren RPG | Concessão: histórico não gravado.", err));
    }
    return criado;
  }

  /**
   * Altera um campo de um item JÁ concedido (ex: subir o rank de uma
   * Habilidade, ou trocar a fórmula de um dano por causa de um novo rank),
   * registrando o valor ANTERIOR no histórico pra dar pra desfazer depois.
   * "caminho" é um path tipo "system.rankAtual" ou
   * "system.acoes.0.danos.0.formula". Não faz nada (nem grava histórico) se
   * o valor novo for igual ao atual.
   */
  static async registrarUpgrade(itemConcedente, origem, itemAlvo, caminho, novoValor) {
    const valorAnterior = foundry.utils.getProperty(itemAlvo, caminho);
    // Coerção pro tipo real do campo (mesma lógica de _aplicarModificadoresExternos):
    // "campoCustomizado" pode mirar um campo BOOLEANO (ex:
    // "forcarMaximoEfeitoPeriodico") - sem isto, a string "false" (texto)
    // é truthy em JS e acabaria virando "true" de verdade ao salvar,
    // bug real corrigido antes de expor esses campos num seletor onde
    // fica fácil escolher um booleano sem querer.
    if (typeof valorAnterior === "boolean") novoValor = (novoValor === true || novoValor === "true");
    else if (typeof valorAnterior === "number") novoValor = Number(novoValor);
    if (valorAnterior === novoValor) return;
    // Bug real corrigido, achado com log de diagnóstico ao vivo (a
    // escrita simplesmente não persistia - "valor DEPOIS de escrever"
    // continuava igual ao de antes, mesmo com o código parecendo certo
    // por leitura): "foundry.utils.deepClone" só clona de fato um objeto
    // PURO (constructor === Object) - "item.system" é uma INSTÂNCIA de
    // DataModel, não um objeto puro, então deepClone devolvia a MESMA
    // referência viva em vez de uma cópia. Eu estava mutando e
    // remandando pro update() o PRÓPRIO objeto que o Foundry usa
    // internamente pra comparar "o que mudou" - o que confundia esse
    // diff e a escrita nunca ia pro banco de dados de verdade. Correção
    // de raiz: usa "item.toObject().system", o jeito garantido do
    // próprio Foundry de tirar uma cópia PLANA e independente (nunca uma
    // instância de classe) - daí sim editar essa cópia com
    // naurenDefinirCaminhoProfundo e mandar de volta funciona de
    // verdade, sem depender de update() reconstruir índice de array
    // numa chave "dot-path".
    const systemClonado = itemAlvo.toObject().system;
    naurenDefinirCaminhoProfundo(systemClonado, caminho.replace(/^system\./, ""), novoValor);
    await itemAlvo.update({ system: systemClonado });
    // Tentativa preventiva (sem certeza de ser a causa exata do "Defesa
    // travada em +1 na ficha principal" relatado, ver Guardas/Guerreiro):
    // força um re-render da ficha do Ator dono, caso o Foundry não
    // propague isso sozinho de forma confiável quando o campo mudado é
    // de um item EMBUTIDO (Efeito) que a ficha do Ator lê indiretamente
    // (via modificadores), em vez de ser o próprio Ator sendo atualizado.
    if (itemAlvo.actor?.sheet?.rendered) itemAlvo.actor.sheet.render(false);

    const historicoAtual = foundry.utils.deepClone(itemConcedente.system.historico ?? []);
    let entrada = historicoAtual.find(h => h.origem === origem);
    if (!entrada) {
      entrada = { origem, itensCriados: [], upgrades: [], em: Date.now() };
      historicoAtual.push(entrada);
    }
    entrada.upgrades.push({ itemId: itemAlvo.id, campo: caminho, valorAnterior });
    await itemConcedente.update({ "system.historico": historicoAtual });
  }

  /**
   * Reverte um evento específico: apaga todo item que ele criou, devolve
   * cada campo alterado ao valor anterior (na ordem inversa, caso o mesmo
   * campo tenha sido upado mais de uma vez dentro do mesmo evento), e remove
   * a entrada do histórico. Devolve true se encontrou e reverteu algo (false
   * se não havia nenhuma entrada com essa "origem").
   */
  static async reverterEvento(actor, itemConcedente, origem) {
    const historicoAtual = foundry.utils.deepClone(itemConcedente.system.historico ?? []);
    const idx = historicoAtual.findIndex(h => h.origem === origem);
    if (idx === -1) return false;
    const entrada = historicoAtual[idx];

    for (const itemId of entrada.itensCriados ?? []) {
      const item = actor.items.get(itemId);
      if (item) await item.delete();
    }
    for (const up of [...(entrada.upgrades ?? [])].reverse()) {
      const item = actor.items.get(up.itemId);
      // Mesmo fix de raiz de registrarUpgrade (ver comentário lá): usa
      // "item.toObject().system" (cópia PLANA garantida), não
      // "foundry.utils.deepClone(item.system)" (devolvia a MESMA
      // referência viva, já que "system" é uma instância de DataModel,
      // não um objeto puro - a escrita nunca persistia de verdade).
      if (item) {
        const systemClonado = item.toObject().system;
        naurenDefinirCaminhoProfundo(systemClonado, up.campo.replace(/^system\./, ""), up.valorAnterior);
        await item.update({ system: systemClonado });
      }
    }

    historicoAtual.splice(idx, 1);
    await itemConcedente.update({ "system.historico": historicoAtual });
    return true;
  }

  /**
   * Reverte TODOS os eventos do histórico de um item concedente de uma vez
   * (ex: respec de uma Subclasse inteira) - do mais recente pro mais antigo.
   * Devolve quantos eventos foram revertidos.
   */
  static async reverterTudo(actor, itemConcedente) {
    const historicoAtual = foundry.utils.deepClone(itemConcedente.system.historico ?? []);
    let total = 0;
    for (const entrada of [...historicoAtual].reverse()) {
      const ok = await this.reverterEvento(actor, itemConcedente, entrada.origem);
      if (ok) total++;
    }
    return total;
  }
}

/**
 * ============================================================
 * PROGRESSÃO DE CLASSE
 * ============================================================
 * Aplica (e permite reverter) o que a Classe concede num nível específico,
 * usando o NaurenConcessaoHelper por baixo dos panos. Chamado pelo
 * botão "Subir de Nível" da ficha do personagem (NaurenActorSheet#_subirDeNivel)
 * e pelo hook de "descer de nível" (ver Hooks.on("updateActor", ...) mais
 * abaixo).
 */
class NaurenProgressaoHelper {
  /**
   * Aplica tudo que o nível "nivel" da Classe concede: itens NOVOS (uma
   * cópia é criada no ator) e "upgrades de rank" de itens já concedidos em
   * níveis anteriores (acha a cópia pelo flags.core.sourceId gravado na hora
   * da concessão original). Cada evento fica registrado no histórico da
   * CÓPIA da Classe já embutida no ator, sob a chave "nivel:N" - chamar de
   * novo pro mesmo nível não duplica nada (NaurenConcessaoHelper já cuida
   * disso). Posta um aviso no chat pra cada coisa nova concedida/upada.
   */
  static async aplicarNivel(actor, classeItem, nivel) {
    const entrada = (classeItem.system.niveis ?? []).find(n => n.nivel === nivel);
    if (!entrada) return;
    const origem = `nivel:${nivel}`;

    for (const it of entrada.itensConcedidos ?? []) {
      if (!it.uuid) continue;
      const criado = await NaurenConcessaoHelper.concederItem(actor, classeItem, origem, it.uuid);
      if (criado) {
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p class="nauren-aviso-chat"><i class="fas fa-arrow-up"></i> <b>${actor.name}</b> ganhou <b>${criado.name}</b> ao alcançar o nível ${nivel}!</p>`
        });
      }
    }

    // Escolha de itens (ex: equipamento inicial do nível 1) - mostra o
    // popup e concede exatamente os que o jogador escolheu, pela mesma
    // via reversível de "itensConcedidos" acima. Roda de novo pro mesmo
    // nível não duplica nada, já que concederItem já verifica isso por
    // item específico - mas o POPUP em si reapareceria; evita isso
    // checando se este nível já tem alguma entrada no histórico com
    // origem "escolha:N" antes de perguntar de novo.
    if (entrada.escolhaItens?.ativo && (entrada.escolhaItens.itensDisponiveis ?? []).some(i => i.uuid)) {
      const origemEscolha = `escolha:${nivel}`;
      const jaEscolheu = (classeItem.system.historico ?? []).some(h => h.origem === origemEscolha);
      if (!jaEscolheu) {
        const escolhidos = await this._popupEscolhaItens(actor, entrada.escolhaItens, nivel);
        for (const uuid of escolhidos) {
          const criado = await NaurenConcessaoHelper.concederItem(actor, classeItem, origemEscolha, uuid);
          if (criado) {
            ChatMessage.create({
              speaker: ChatMessage.getSpeaker({ actor }),
              content: `<p class="nauren-aviso-chat"><i class="fas fa-hand-sparkles"></i> <b>${actor.name}</b> escolheu <b>${criado.name}</b> ao alcançar o nível ${nivel}!</p>`
            });
          }
        }
        // Marca que este nível já foi "perguntado", mesmo se o jogador
        // escolher 0 itens (ou o popup expirar sem resposta) - senão o
        // popup voltaria a aparecer pra sempre nesse mesmo nível.
        if (!escolhidos.length) {
          const historicoAtual = foundry.utils.deepClone(classeItem.system.historico ?? []);
          historicoAtual.push({ origem: origemEscolha, itensCriados: [], upgrades: [], em: Date.now() });
          await classeItem.update({ "system.historico": historicoAtual });
        }
      }
    }

    for (const up of entrada.upgradesDeRank ?? []) {
      if (!up.uuidOrigem) continue;
      const itemAlvo = actor.items.find(i => i.getFlag("nauren", "origemUuid") === up.uuidOrigem || i.getFlag("core", "sourceId") === up.uuidOrigem);
      if (!itemAlvo) {
        console.warn(`Nauren RPG | Upgrade de rank (nível ${nivel}): não encontrei no ator nenhum item concedido a partir de "${up.uuidOrigem}".`);
        continue;
      }
      if ((itemAlvo.system.rankAtual ?? 0) >= up.novoRank) continue; // já está nesse rank ou acima, nada a fazer
      await NaurenConcessaoHelper.registrarUpgrade(classeItem, origem, itemAlvo, "system.rankAtual", up.novoRank);
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p class="nauren-aviso-chat"><i class="fas fa-arrow-up"></i> <b>${actor.name}</b> — <b>${itemAlvo.name}</b> subiu para o rank ${up.novoRank} (nível ${nivel})!</p>`
      });
    }
  }

  /**
   * Aplica TODOS os níveis configurados na Classe que sejam ≤ nivelAlvo, em
   * ordem crescente - usado tanto quando uma Classe é arrastada pra ficha de
   * um personagem que já não está no nível 1 (senão ele só receberia o que
   * viesse dos níveis FUTUROS, nunca o que já devia ter desde o nível 1),
   * quanto sempre que o campo "Nível" sobe (pelo botão "Subir de Nível" OU
   * editado manualmente - ver Hooks.on("updateActor", ...)). Chamar de novo
   * pra níveis já aplicados não duplica nada (NaurenConcessaoHelper cuida
   * disso internamente).
   */
  static async aplicarAteNivel(actor, classeItem, nivelAlvo) {
    const niveisAAplicar = (classeItem.system.niveis ?? [])
      .map(n => n.nivel)
      .filter(n => n <= nivelAlvo)
      .sort((a, b) => a - b);
    for (const n of niveisAAplicar) {
      await this.aplicarNivel(actor, classeItem, n);
    }
  }

  /**
   * Mostra o popup de "escolha de itens" (equipamento inicial, ou
   * qualquer outra escolha configurada num nível de Classe) - reaproveita
   * o MESMO estilo visual de card usado na lista de itens da ficha
   * (".item-entry", ícone + nome + descrição), com um checkbox de seleção
   * em cada um. Limita a escolha à quantidade calculada (número fixo ou
   * fórmula com token, ex: "@destino") - o botão "Confirmar" só habilita
   * quando o jogador tiver marcado exatamente esse número. Devolve um
   * array de UUIDs escolhidos (vazio se não houver nenhum item válido no
   * pool, se a quantidade calculada for 0, ou se o popup for fechado sem
   * confirmar).
   */
  static async _popupEscolhaItens(actor, config, nivel) {
    const quantidade = Math.max(0, naurenInterpretarModificador(config.quantidadeEscolhas, actor)?.valor ?? 0);
    if (!quantidade) return [];

    const itens = [];
    for (const entrada of config.itensDisponiveis ?? []) {
      if (!entrada.uuid) continue;
      // Já possui uma cópia concedida a partir deste uuid (mesmo padrão já
      // usado em upgradesDeRank) - não mostra de novo, senão o jogador
      // conseguiria escolher a MESMA magia/item em vários níveis (ex: Mago
      // escolhendo 1 Magia por nível, sem repetir as que já tem).
      const jaPossui = actor.items.some(i => i.getFlag("nauren", "origemUuid") === entrada.uuid || i.getFlag("core", "sourceId") === entrada.uuid);
      if (jaPossui) continue;
      const item = await fromUuid(entrada.uuid).catch(() => null);
      if (item) itens.push(item);
    }
    if (!itens.length) return [];

    const cards = itens.map(item => {
      // Resumo em texto puro da descrição (sem tags HTML) - a descrição
      // completa pode ser bem longa, o popup é pra decidir rápido, não
      // pra ler o texto inteiro de novo.
      const textoPuro = (item.system.descricao ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const resumo = textoPuro.length > 220 ? textoPuro.slice(0, 220) + "…" : textoPuro;
      // Descrição inteira (com a formatação do item), aberta pelo botão "Ver tudo" sem marcar a escolha.
      const completa = String(item.system.descricao ?? "").replace(/<script[\s\S]*?<\/script>/gi, "");
      const temMais = textoPuro.length > 140;
      return `
        <li class="item-entry nauren-escolha-item">
          <div class="nauren-escolha-linha">
            <label style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; cursor: pointer;">
              <input type="checkbox" name="escolha" value="${item.uuid}" class="nauren-escolha-checkbox">
              <div class="item-img-container"><img src="${item.img}" title="${item.name}"></div>
              <div class="item-info">
                <h4>${item.name}</h4>
                <span class="item-category nauren-escolha-resumo">${resumo}</span>
              </div>
            </label>
            ${temMais ? `<button type="button" class="nauren-escolha-ver" data-ver aria-expanded="false" title="Ler a descrição inteira"><i class="fas fa-chevron-down"></i> Ver tudo</button>` : ""}
          </div>
          ${temMais ? `<div class="nauren-escolha-completa" hidden>${completa}</div>` : ""}
        </li>`;
    }).join("");

    const content = `
      <p class="nauren-popup-intro">Escolha <b>${quantidade}</b> ${quantidade === 1 ? "item" : "itens"} (nível ${nivel}):</p>
      <ul class="nauren-escolha-lista" style="list-style: none; padding: 0; margin: 0; max-height: 420px; overflow-y: auto; overflow-x: hidden;">${cards}</ul>
      <p class="nauren-escolha-contador" style="text-align: center; margin-top: 6px;">Selecionados: <span data-contador>0</span> / ${quantidade}</p>
    `;

    let escolhidos = [];
    // Usa Hooks.once("renderDialogV2",...) em vez de uma opção "render:"
    // direta no DialogV2.wait - a mesma técnica já confirmada em
    // "_mostrarDialogPopupReacao" (não há garantia de que "render:" exista
    // como opção da API, mas o Hook nativo do Foundry sempre dispara).
    const aoRenderizar = (app, html) => {
      if (app?.options?.window?.title !== `${actor.name} — escolha de itens (nível ${nivel})`) return;
      const root = html instanceof HTMLElement ? html : (html?.[0] ?? app.element);
      if (!root) return;
      const checkboxes = root.querySelectorAll(".nauren-escolha-checkbox");
      const contador = root.querySelector("[data-contador]");
      const atualizar = () => {
        const marcados = root.querySelectorAll(".nauren-escolha-checkbox:checked").length;
        if (contador) contador.textContent = marcados;
        checkboxes.forEach(cb => {
          cb.disabled = quantidade > 1 && !cb.checked && marcados >= quantidade;
          // Limite atingido: as não escolhidas escurecem (com limite 1 continuam clicáveis para trocar).
          cb.closest(".nauren-escolha-item")?.classList.toggle("nauren-escolha-apagado", !cb.checked && marcados >= quantidade);
          cb.closest(".nauren-escolha-item")?.classList.toggle("nauren-escolha-marcado", cb.checked);
        });
        const botaoOk = root.querySelector('button[data-action="ok"]');
        if (botaoOk) botaoOk.disabled = marcados !== quantidade;
      };
      // "Ver tudo": abre/fecha a descrição inteira daquele item (não mexe na seleção).
      root.querySelectorAll("[data-ver]").forEach(bt => bt.addEventListener("click", ev => {
        ev.preventDefault(); ev.stopPropagation();
        const li = bt.closest(".nauren-escolha-item");
        const box = li?.querySelector(".nauren-escolha-completa");
        if (!box) return;
        const abrir = box.hidden;
        box.hidden = !abrir;
        li.classList.toggle("nauren-escolha-aberto", abrir);
        bt.setAttribute("aria-expanded", String(abrir));
        bt.innerHTML = abrir ? '<i class="fas fa-chevron-up"></i> Fechar' : '<i class="fas fa-chevron-down"></i> Ver tudo';
      }));
      checkboxes.forEach(cb => cb.addEventListener("change", () => {
        // Limite 1: marcar outro desmarca o anterior (não precisa desmarcar antes).
        if (quantidade === 1 && cb.checked) checkboxes.forEach(o => { if (o !== cb) o.checked = false; });
        atualizar();
      }));
      atualizar();
    };
    Hooks.on("renderDialogV2", aoRenderizar);
    try {
      await foundry.applications.api.DialogV2.wait({
        window: { title: `${actor.name} — escolha de itens (nível ${nivel})` },
        // Largura fixa: sem isto o Foundry media a janela pelo conteúdo e "Ver tudo" a esticava para os lados.
        classes: ["nauren-escolha-janela"], position: { width: 640 },
        content,
        buttons: [{
          label: "Confirmar",
          action: "ok",
          default: true,
          callback: (event, button, dialog) => {
            const root = dialog?.element ?? button?.form ?? event?.currentTarget?.form;
            const marcados = root?.querySelectorAll?.(".nauren-escolha-checkbox:checked") ?? [];
            escolhidos = Array.from(marcados).map(cb => cb.value);
          }
        }],
        rejectClose: false
      });
    } finally {
      Hooks.off("renderDialogV2", aoRenderizar);
    }
    return escolhidos;
  }
}

/**
 * ============================================================
 * SUBCLASSE: investimento de pontos na árvore
 * ============================================================
 * Mesmo princípio da Classe (NaurenProgressaoHelper), mas o gatilho é o
 * jogador clicando num nó em Modo Jogo em vez de subir de nível. Cada rank
 * investido custa 1 Ponto de Subclasse do pool COMPARTILHADO do Ator (não é
 * um pool por Subclasse - várias Subclasses equipadas disputam o mesmo
 * total). Usa NaurenConcessaoHelper por baixo dos panos, com a chave de
 * histórico "no:<idDoNó>:rank:<rankAtingido>".
 */
class NaurenSubclasseHelper {
  /**
   * Verifica se dá pra investir mais 1 ponto no nó agora: não pode já estar
   * no rank máximo, precisa ter ponto disponível no pool do Ator, e (se
   * ainda não tiver nenhum rank) o pré-requisito precisa estar cumprido -
   * "qualquer um" (OR) ou "todos" (AND) os nós listados em prerequisitos já
   * terem pelo menos 1 rank, conforme prerequisitoLogica. Devolve
   * { pode: boolean, motivo?: string }.
   */
  static podeInvestir(actor, subclasseItem, no) {
    if (!no) return { pode: false, motivo: "Nó não encontrado." };
    if ((no.rankAtual ?? 0) >= (no.rankMax ?? 1)) return { pode: false, motivo: "Este nó já está no rank máximo." };
    if ((actor.system.pontosSubclasse?.value ?? 0) <= 0) return { pode: false, motivo: "Sem Pontos de Subclasse disponíveis." };

    // Pré-requisito só precisa estar cumprido pra DESBLOQUEAR (1º rank) - já
    // desbloqueado, subir mais ranks não pede o pré-requisito de novo.
    if ((no.rankAtual ?? 0) === 0 && (no.prerequisitos ?? []).length) {
      const nos = subclasseItem.system.nos ?? [];
      const satisfeitos = no.prerequisitos.map(p => (nos.find(n => n.id === p.id)?.rankAtual ?? 0) > 0);
      const ok = no.prerequisitoLogica === "todos" ? satisfeitos.every(Boolean) : satisfeitos.some(Boolean);
      if (!ok) return { pode: false, motivo: `Pré-requisito não cumprido (precisa de ${no.prerequisitoLogica === "todos" ? "todos os nós ligados" : "pelo menos um nó ligado"}).` };
    }
    return { pode: true };
  }

  /**
   * Investe 1 ponto no nó: gasta do pool compartilhado, sobe o rankAtual
   * daquele nó, e concede (1º rank) ou upa o rank (ranks seguintes) do item
   * vinculado - tudo registrado no histórico da Subclasse pra dar pra
   * desfazer depois (ver resetarSubclasse).
   */
  static async investirPonto(actor, subclasseItem, noId) {
    const nos = foundry.utils.deepClone(subclasseItem.system.nos ?? []);
    const no = nos.find(n => n.id === noId);
    const check = this.podeInvestir(actor, subclasseItem, no);
    if (!check.pode) { ui.notifications.warn(check.motivo); return; }

    const novoRank = (no.rankAtual ?? 0) + 1;
    no.rankAtual = novoRank;
    await subclasseItem.update({ "system.nos": nos });

    const pontosAtuais = actor.system.pontosSubclasse?.value ?? 0;
    await actor.update({ "system.pontosSubclasse.value": Math.max(0, pontosAtuais - 1) });

    // Nó em camadas (Fase 3): investir só muda o rank do nó. Os
    // modificadores são aplicados no momento do uso, sem tocar no item alvo.
    if ((no.modificadores ?? []).length && no.apenasUpgrade) {
      // Entrada de histórico sem itens nem upgrades: só marca o investimento,
      // para "corrigirExcessoDeInvestimento" saber o que desfazer primeiro.
      const historico = foundry.utils.deepClone(subclasseItem.system.historico ?? []);
      historico.push({ origem: `no:${noId}:rank:${novoRank}`, itensCriados: [], upgrades: [], em: Date.now() });
      await subclasseItem.update({ "system.historico": historico });
      const alvo = no.itemUuid ? actor.items.find(i => naurenItemCorrespondeAoAlvo(i, no.itemUuid)) : null;
      naurenPostarCard({
        ator: actor, titulo: no.nome, icone: alvo?.img ?? subclasseItem.img, fonte: `Subclasse • ${subclasseItem.name}`,
        linhas: [{ label: "Rank", value: `${novoRank} / ${no.rankMax}` }, alvo ? { label: "Modifica", value: alvo.name } : null].filter(Boolean)
      });
      return;
    }

    if (!no.itemUuid) return;
    const origem = `no:${noId}:rank:${novoRank}`;
    // Itens EXTRAS (ex: armas-modelo das Subclasses) - entregues só na 1ª
    // vez que o nó é investido, valendo tanto pra nó normal quanto
    // "apenasUpgrade" (um nó que só melhora algo da Classe também pode vir
    // acompanhado de uma arma pré-configurada). Registrados no MESMO
    // histórico do item principal, então o "respec" da Subclasse remove
    // tudo junto.
    if (novoRank === 1 && no.itensExtrasUuids) {
      for (const uuidExtra of String(no.itensExtrasUuids).split(",").map(s => s.trim()).filter(Boolean)) {
        const extra = await NaurenConcessaoHelper.concederItem(actor, subclasseItem, origem, uuidExtra);
        if (extra) {
          ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: `<p class="nauren-aviso-chat"><i class="fas fa-gift"></i> <b>${actor.name}</b> recebeu <b>${extra.name}</b> junto de ${no.nome} — use direto ou edite como preferir.</p>`
          });
        }
      }
    }

    // "apenasUpgrade" força SEMPRE o caminho de "acha o item já concedido
    // pela Classe e sobe o rank dele", mesmo no 1º ponto investido - só o
    // rank 2+ normal (nó com item PRÓPRIO) usa esse caminho por padrão.
    if (novoRank === 1 && !no.apenasUpgrade) {
      const criado = await NaurenConcessaoHelper.concederItem(actor, subclasseItem, origem, no.itemUuid);
      if (criado) {
        // Bug real corrigido, sistêmico (afeta QUALQUER nó normal com
        // rankMax > 1, não só um caso específico): o item recém-concedido
        // nascia com "rankAtual" no valor padrão do schema (0), nunca 1 -
        // então nenhuma tabela "Por Rank" nem token "@rank" (ex: Habilidade
        // com efeitosPeriodicos.porRank, ou um Gatilho com "quantidade:
        // @rank") reconhecia o 1º ponto investido como rank 1 de verdade.
        // Só a partir do 2º ponto (ramo "else" abaixo, que ESCREVE
        // "rankAtual") o campo passava a refletir algo - só que direto
        // pro rank 2, pulando o 1 por completo. Agora o item já nasce
        // alinhado com "novoRank" (sempre 1 aqui).
        if ((criado.system.rankAtual ?? 0) !== novoRank) {
          await criado.update({ "system.rankAtual": novoRank });
        }
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content: `<p class="nauren-aviso-chat"><i class="fas fa-code-branch"></i> <b>${actor.name}</b> desbloqueou <b>${criado.name}</b>${no.nome && no.nome !== criado.name ? ` (${no.nome})` : ""}!</p>`
        });
      }
    } else {
      const itemAlvo = actor.items.find(i => i.getFlag("nauren", "origemUuid") === no.itemUuid || i.getFlag("core", "sourceId") === no.itemUuid);
      if (!itemAlvo) {
        const motivo = `Nauren RPG | Subclasse "${subclasseItem.name}": não encontrei no ator o item concedido a partir de "${no.itemUuid}" pra subir o rank.`;
        console.warn(motivo);
        ui.notifications.warn(`Não encontrei "${no.nome}" na ficha de ${actor.name} pra subir o rank - confirme que a Classe (ou um nó anterior) já concedeu esse item antes de investir aqui.`);
        return;
      }
      // Bug real corrigido (achado num teste ao vivo: investir em
      // Transbordar "trocou o nome" das Ações de Comungar): se a cópia
      // de "itemAlvo" na ficha estava desatualizada em relação ao
      // compêndio (ex: a estrutura de "acoes" mudou depois que este
      // personagem já tinha ganhado o item, e ele nunca clicou
      // "Ressincronizar com o Compêndio"), a escrita de "campoCustomizado"
      // logo abaixo (ex: "acoes.1.gastosRecurso.0.quantidade") criava um
      // índice novo na hora, do NADA, com todos os OUTROS campos daquela
      // Ação (nome, custo, alcance...) voltando pro valor padrão do
      // schema, já que só o campo específico foi enviado - "acoes.1"
      // simplesmente não existia ainda na cópia antiga. Reconciliar AQUI,
      // ANTES de qualquer campoCustomizado, garante que a estrutura já
      // está em dia (todas as Ações existem, com nome/custo certos) antes
      // de mexer num campo específico dentro dela.
      await naurenReconciliarItemComCompendio(itemAlvo).catch(err => console.warn(`Nauren RPG | Falha ao reconciliar "${itemAlvo.name}" antes do upgrade de "${no.nome}".`, err));
      // "campoCustomizado" escreve DIRETO nesse campo em vez de rankAtual -
      // usado quando outro nó já controla o rankAtual do MESMO item (ver
      // schema do nó pra explicação completa). Se o nó tiver
      // "valorCustomizadoPorRank" preenchido, usa a entrada de maior rank
      // ≤ ao rank ATUAL DESTE NÓ (novoRank) - permite um nó com rankMax >
      // 1 sobrescrever um valor DIFERENTE a cada rank investido, em vez
      // de travado num valor fixo pra sempre.
      if (no.campoCustomizado) {
        let valorFinal = no.valorCustomizado;
        if (no.valorCustomizadoPorRank?.length) {
          const aplicavel = no.valorCustomizadoPorRank.filter(p => p.rank <= novoRank).sort((a, b) => b.rank - a.rank)[0];
          if (aplicavel) valorFinal = aplicavel.valor;
        }
        await NaurenConcessaoHelper.registrarUpgrade(subclasseItem, origem, itemAlvo, `system.${no.campoCustomizado}`, valorFinal);
        // Reaplica TAMBÉM qualquer outro upgrade "campoCustomizado" já
        // investido que mire o MESMO item (ex: dois nós diferentes
        // mexendo em campos diferentes de Comungar) - a reconciliação
        // acima só sabia proteger o campo DESTE nó específico; isto
        // cobre os outros de uma vez, reaproveitando a mesma função do
        // botão "Ressincronizar com o Compêndio".
        await naurenReaplicarUpgradesDeSubclasse(actor).catch(err => console.warn("Nauren RPG | Falha ao reaplicar outros upgrades de Subclasse.", err));
      } else {
        await NaurenConcessaoHelper.registrarUpgrade(subclasseItem, origem, itemAlvo, "system.rankAtual", novoRank);
      }
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p class="nauren-aviso-chat"><i class="fas fa-code-branch"></i> <b>${actor.name}</b> — <b>${itemAlvo.name}</b> subiu para o rank ${novoRank} (${no.nome})!</p>`
      });
    }
  }

  /**
   * Reseta TODOS os nós desta Subclasse de uma vez ("respec"): reverte todo
   * o histórico (apaga itens concedidos, desfaz upgrades de rank), zera o
   * rank de cada nó, e devolve ao pool COMPARTILHADO do Ator a soma de
   * pontos que estavam investidos só nesta Subclasse - as outras Subclasses
   * equipadas (se houver) não são afetadas.
   */
  static async resetarSubclasse(actor, subclasseItem) {
    const nos = foundry.utils.deepClone(subclasseItem.system.nos ?? []);
    const pontosGastos = nos.reduce((soma, n) => soma + (n.rankAtual ?? 0), 0);
    for (const n of nos) n.rankAtual = 0;

    await NaurenConcessaoHelper.reverterTudo(actor, subclasseItem);
    await subclasseItem.update({ "system.nos": nos, "system.historico": [] });

    if (pontosGastos > 0) {
      const atual = actor.system.pontosSubclasse?.value ?? 0;
      await actor.update({ "system.pontosSubclasse.value": atual + pontosGastos });
    }
    ui.notifications.info(`"${subclasseItem.name}" foi resetada — ${pontosGastos} ponto(s) de Subclasse devolvido(s).`);
  }

  /**
   * Garante que o total investido em nós de Subclasse nunca ultrapasse o
   * "max" ATUAL de Pontos de Subclasse do ator - se ultrapassar por
   * qualquer motivo (descer de nível, perder um Efeito/Pigmento que dava
   * bônus, ajuste manual do GM no valor, etc.), desfaz sozinho o(s)
   * investimento(s) mais RECENTE(s) primeiro - olhando o timestamp de cada
   * evento de histórico em TODAS as Subclasses do ator ao mesmo tempo, não
   * só numa - removendo o item concedido (ou desfazendo o upgrade de rank)
   * e descendo o rank do nó em 1. Mesmo princípio de "desfazer com precisão"
   * já usado pra Classe (ver Hooks.on("updateActor", ...) mais abaixo), só
   * que reagindo à mudança de PONTOS DISPONÍVEIS em vez de NÍVEL
   * especificamente - cobre qualquer causa, não só descer de nível.
   */
  static async corrigirExcessoDeInvestimento(actor) {
    const subclasses = actor.items.filter(i => i.type === "subclasse");
    if (!subclasses.length) return;

    const somarInvestido = () => {
      let total = 0;
      for (const sub of actor.items.filter(i => i.type === "subclasse")) {
        for (const no of sub.system.nos ?? []) total += (no.rankAtual ?? 0);
      }
      return total;
    };

    const maxAtual = actor.system.pontosSubclasse?.max ?? 0;
    let excesso = somarInvestido() - maxAtual;
    if (excesso <= 0) return;

    // Junta os eventos "no:<id>:rank:<N>" de histórico de TODAS as
    // Subclasses numa lista só, ordenada do mais recente pro mais antigo.
    const eventos = [];
    for (const sub of subclasses) {
      for (const entrada of sub.system.historico ?? []) {
        if (entrada.origem?.startsWith("no:")) {
          eventos.push({ subclasseId: sub.id, origem: entrada.origem, em: entrada.em ?? 0 });
        }
      }
    }
    eventos.sort((a, b) => b.em - a.em);

    const desfeitos = [];
    for (const evento of eventos) {
      if (excesso <= 0) break;
      const sub = actor.items.get(evento.subclasseId);
      if (!sub) continue;

      const partes = evento.origem.split(":"); // "no" : "<id>" : "rank" : "<N>"
      const noId = partes[1];
      const rankRevertido = Number(partes[3]);

      const ok = await NaurenConcessaoHelper.reverterEvento(actor, sub, evento.origem);
      if (!ok) continue;

      const nos = foundry.utils.deepClone(sub.system.nos ?? []);
      const no = nos.find(n => n.id === noId);
      if (no && (no.rankAtual ?? 0) >= rankRevertido) {
        no.rankAtual = rankRevertido - 1;
        await sub.update({ "system.nos": nos });
      }

      desfeitos.push(`${sub.name} (${no?.nome ?? "nó removido"})`);
      excesso--;
    }

    if (desfeitos.length) {
      // Recalcula do zero em vez de descontar manualmente - mais seguro
      // contra qualquer contagem que já estivesse dessincronizada antes.
      const totalFinal = somarInvestido();
      await actor.update({ "system.pontosSubclasse.value": Math.max(0, maxAtual - totalFinal) });
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p class="nauren-aviso-chat"><i class="fas fa-arrow-down"></i> <b>${actor.name}</b> perdeu Ponto(s) de Subclasse — desfeito automaticamente: ${desfeitos.join(", ")}.</p>`
      });
    }
  }
}

// 0.94.22: Ficha de Item (NaurenItemSheet) foi para modulos/ficha-item.mjs.


export { CAMPOS_MIGRADOS_PARA_LIGADO, NAUREN_CAMPOS_MODIFICADOR_18, NAUREN_MODOS_DURACAO, NAUREN_MOMENTOS_PERIODICOS, NaurenConcessaoHelper, NaurenGrupoHelper, NaurenProgressaoHelper, NaurenSubclasseHelper, naurenAncoraDuracaoAtual, naurenAvancarDuracoesCondicoes, naurenMigrarCorpoDePedraV1, naurenMigrarExtensaoImagemFundoSubclasse, naurenMigrarFormulasUnificadas, naurenMigrarImagemFundoSubclasse, naurenMigrarModificadoresParaLista, naurenMigrarModificadoresParaTexto, naurenMigrarOpcoesPadraoLigado, naurenModoDuracaoCondicao, naurenMomentoEfeitoPeriodico, naurenRecarregarUsos };
