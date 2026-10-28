/* Nauren RPG — Ficha de Item (NaurenItemSheet). Separado do nauren.mjs na 0.94.22. */
import { ARMADURA_TIPOS, ARMA_TIPOS, ATRIBUTOS_BASE_OPCOES, ATRIBUTOS_BONUS, HABILIDADE_CATEGORIAS, NAUREN_CAMPOS_MODIFICADOR_OPCOES, NAUREN_CAPACIDADES, NAUREN_EQUIPAMENTO_CLASSE_LIVRO, NAUREN_EQUIP_CATEGORIAS, NAUREN_LOGICA_CONDICOES_OPCOES, NAUREN_MODOS_DURACAO, NAUREN_MODOS_MODIFICADOR_EXTERNO_OPCOES, NAUREN_MOMENTOS_PERIODICOS, NAUREN_PAGAR_CUSTO_OPCOES, NAUREN_PAGAR_RECURSO_OPCOES, NAUREN_PRIORIDADE_DISPOSICAO, NAUREN_PRIORIDADE_INDICADORES, NAUREN_PRIORIDADE_INDICADORES_ACAO, NAUREN_PRIORIDADE_QUEM_RECEBE, NaurenCondicaoData, NaurenEfeitoData, NaurenGrupoHelper, NaurenHabilidadeData, NaurenMagiaData, NaurenSubclasseHelper, TEMPLATE_FORMATOS, campoCondicaoAplicada, campoModificador, campoModificadorExterno, campoRecursoDeclarado, naurenAjustarListasLargas, naurenBotoesDeFormula, naurenCategoriaDaArma, naurenClassificarCampoAcao, naurenCombatenteEhDoAtor, naurenCondicaoDoSistemaPorNome, naurenCondicaoNegativa, naurenGruposExclusivosConhecidos, naurenModificacoesRecebidas, naurenModoDuracaoCondicao, naurenMomentoEfeitoPeriodico, naurenMostrarNomesDosCamposUuid, naurenMunicoesCompativeis, naurenNomeParaUuid, naurenOpcoesDeCampoParaModificadorExterno, naurenPersistirDetalhesAbertos, naurenPesoOfensivo, naurenPostarCard, naurenProcessarEmanacoes, naurenProcessarGatilhos, naurenRecursosCustomConhecidos, naurenResumoDaAcao, naurenResumoEquipamentoClasse, naurenResumoModificador, naurenResumoPrioridadeAcao, naurenSincronizarRecursosCustom, naurenUsarAcalanto } from "../nauren.mjs";
import { NAUREN_MOTION_CONDICAO_OPCOES, naurenMotionPresetCondicao } from "./animacoes.mjs";
import { NAUREN_TORRE_LOJAS, NAUREN_TORRE_PIGMENTOS, NAUREN_TORRE_RARIDADES, NAUREN_TORRE_TIERS, naurenDisponivelNoInicio, naurenTierTorre } from "./compendios.mjs";
import { NaurenActorSheet } from "./ficha-ator.mjs";
/* =======================================
 * 5. FICHA DE ITEM (ApplicationV2 - padrão atual do Foundry V13/V14)
 * ======================================= */
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

// Rótulo legível de cada tipo de item, usado no título da janela da ficha
// (em vez do padrão do Foundry, que mostraria a chave crua "TYPES.Item.x"
// caso não exista uma tradução cadastrada para ela).
const TIPO_ITEM_LABEL = {
  arma: "Arma",
  armadura: "Armadura",
  consumivel: "Consumível",
  habilidade: "Habilidade",
  magia: "Magia",
  efeito: "Efeito",
  cor: "Pigmento",
  condicao: "Condição",
  grupo: "Grupo de Jogadores",
  classe: "Classe",
  subclasse: "Subclasse",
  peculiaridade: "Peculiaridade"
};

/**
 * Devolve os IDs de todos os usuários com permissão de Mestre (GM) - usado
 * pra mandar os avisos de progressão (subir/descer de nível, desbloquear
 * item de Classe/Subclasse) só pro Mestre em vez de pro chat público. Se
 * ninguém com GM estiver logado no momento (raro, mas possível), a lista
 * fica vazia e o Foundry trata como sussurro "sem destinatário" - a
 * mensagem ainda existe no histórico do chat, só não aparece "pop-up" pra
 * ninguém especificamente enquanto não houver GM online.
 */
function naurenWhisperGMs() {
  return game.users.filter(u => u.isGM).map(u => u.id);
}

/**
 * Sussurra só pra quem tem permissão OWNER sobre este Ator (o(s)
 * jogador(es) dono(s) + Mestres, que normalmente já têm OWNER em tudo
 * por padrão) - usado pra notificações curtas e privadas de "você
 * ganhou/perdeu X" (ver naurenNotificarGanhoPerda), que não fazem
 * sentido pra quem não é dono daquele personagem ver no chat geral.
 */
function naurenWhisperAtor(actor) {
  return game.users.filter(u => actor.testUserPermission(u, "OWNER")).map(u => u.id);
}

/**
 * Notificação curta e objetiva de "você ganhou/perdeu X de [recurso]
 * por causa de [origem]" - chat PRIVADO (só quem tem OWNER sobre o
 * Ator vê, ver naurenWhisperAtor), sem texto longo. Pensada pra
 * regeneração automática, efeitos periódicos de Condição (Sangramento,
 * Queimando, etc.) e Gatilhos por Evento - qualquer lugar que já muda
 * um recurso/atributo sozinho, sem o jogador clicar em nada, e por
 * isso corre o risco de passar despercebido sem essa notificação.
 * "quantidade" já vem com o sinal certo (negativo = perda); o rótulo
 * troca sozinho pra "recebeu"/"perdeu" conforme o sinal.
 */
function naurenNotificarGanhoPerda(actor, { quantidade, rotulo, origemNome, breakdown = "" }) {
  if (!quantidade) return;
  // Público (não whisper): todo ganho/perda de recurso é auditável pelo grupo.
  naurenPostarCard({
    ator: actor, titulo: origemNome || rotulo, fonte: quantidade > 0 ? "Ganho" : "Perda",
    linhas: [{ label: rotulo, value: `${quantidade > 0 ? "+" : "−"}${Math.abs(quantidade)}`, breakdown }]
  });
}

// Formas padrão de bloco novo, usadas pelos botões "+ Adicionar" dentro de uma Ação
const NOVO_BLOCO_PADRAO = {
  danos: () => ({ formula: "1d6+@poderAtaque", rolarSeparado: false, nomeCustom: "", aplicarNoAlvo: true, porRank: [] }),
  curas: () => ({ formula: "1d6+@poderMagia", rolarSeparado: false, nomeCustom: "", aplicarNoAlvo: true, porRank: [] })
};

// Forma padrão de uma Ação nova, usada pelo botão "+ Adicionar Ação"
function novaAcaoPadrao() {
  return {
    nome: "Nova Ação", custoEstamina: 0, custoMana: 0,
    tipo: "Média", alcance: "1m", categoria: "Classe",
    usaCargas: false, cargasFonte: "propria", cargasConsumivelId: "",
    cargasAtual: 0, cargasMax: 1, consumirCargaAoUsar: false, cargasCustoPorUso: 1,
    usaUsos: false, usosAtual: 1, usosMax: 1, usosReset: "cena",
    efeitosVinculados: [], usaTemplate: false, templateTipo: "circle", templateTamanho: 3,
    modoAlvo: "nenhum", condicoesAplicadas: [], gastosRecurso: [],
    ehAtaque: false, atributoAtaque: "poderAtaque", ataqueBonusExtra: "", ataqueBonusPorRank: [],
    danos: [], curas: []
  };
}

/** Forma padrão de uma entrada nova de "Por Rank" (dano/cura/ataque), usada pelo botão "+ Adicionar" correspondente. */
function novoPorRankPadrao() {
  return { rank: 1, formula: "" };
}

// Opções do seletor "Fonte das cargas" de uma Ação
const CARGAS_FONTE_OPCOES = { propria: "Própria (definida aqui)", consumivel: "Consumível da ficha (ex: Flechas)" };

// Opções do seletor "Recarrega" dos Usos por dia/cena de uma Ação
const USOS_RESET_OPCOES = {
  cena: "Por cena (recarrega ao fim do combate)",
  dia: "Por dia (recarrega ao clicar em Descansar)",
  rodada: "Por rodada (recarrega a cada rodada do combate)",
  turno: "Por turno (recarrega a cada turno, de qualquer um)",
  meuTurno: "No seu turno (recarrega só no início do seu turno)",
  manual: "Só pela Recarga (não volta sozinho)"
};
// Opções do dropdown de "Recurso Declarado" (Classe/Subclasse/Habilidade)
// pro campo "resetarNoEscopo" - ver campoRecursoDeclarado().
const RESETAR_NO_ESCOPO_OPCOES = {
  "": "Nunca (padrão)",
  combate: "Ao fim de cada combate",
  rodada: "No início de cada rodada",
  turno: "No início de cada turno (de qualquer um)",
  meuTurno: "No início do seu turno"
};
const USOS_RESET_LABEL = {
  cena: "no fim do combate", dia: "ao descansar", rodada: "a cada rodada", turno: "a cada turno", meuTurno: "no início do seu turno", manual: "pela Recarga"
};

// Quais valores de "usosReset" só fazem sentido DENTRO de um combate ativo
// (ver NaurenActorSheet#_atorEstaEmCombateAtivo) - fora de combate, o
// limite de usos não bloqueia nem desconta nada (não há "turno"/"rodada"
// de verdade pra contar).
const USOS_RESET_POR_COMBATE = new Set(["turno", "meuTurno", "rodada"]);

// Gatilhos por Evento - ver NaurenHabilidadeData#gatilhos e naurenProcessarGatilhos.
const NAUREN_GATILHO_EVENTO_OPCOES = {
  inicioCombate: "Início do combate (1x, quando o combate começa)",
  euGasteiDadoDeDestino: "Eu gastei um Dado de Destino",
  aliadoGastouDadoDeDestino: "Um aliado gastou um Dado de Destino",
  aliadoSofreuDano: "Um aliado sofreu dano",
  aliadoAcertouAtaque: "Um aliado acertou um ataque",
  euSofriDano: "Eu sofri dano",
  euDeiDano: "Eu dei dano",
  euCurei: "Eu curei alguém",
  euUseiCuraEm: "Usei uma cura em alguém (mesmo com a Vida cheia)",
  euMateiAlguem: "Eu matei alguém",
  euAcerteiCritico: "Eu acertei um crítico",
  aliadoAcertouCritico: "Um aliado acertou um crítico",
  alguemRecebeuCondicao: "Alguém recebeu uma Condição",
  euRecebiCondicao: "Eu recebi uma Condição (ou acúmulos dela)",
  euAcerteiAtaque: "Eu acertei um ataque",
  euErreiAtaque: "Eu errei um ataque",
  alguemErrouAtaque: "Alguém errou um ataque (qualquer um, não só eu)",
  euRealizeiDeflexao: "Eu realizei uma Deflexão",
  useiMagia: "Eu usei uma Magia",
  useiArma: "Eu usei uma Arma",
  useiHabilidade: "Eu usei uma Habilidade",
  penitenciaAceita: "Eu aceitei uma Penitência (ver Sacerdote)",
  usoCrescimento: "Eu usei Crescimento (numa Ação com essa opção)",
  metadeVida: "Fiquei com metade (ou menos) de Vida",
  semEstamina: "Fiquei sem Estamina de Combate",
  estresseAtingiu: "Meu Estresse atingiu um valor",
  recebeuPrioridade: "Eu recebi Prioridade",
  entrouOuEvoluiuProfusao: "Um recurso meu chegou ao máximo (ex.: entrei em Profusão)",
  condicaoAtingiuLimiar: "Uma Condição minha atingiu X acúmulos",
  inicioTurno: "Início do meu turno",
  fimTurno: "Fim do meu turno",
  inicioTurnoQualquer: "Início de cada turno (de qualquer um)",
  fimTurnoQualquer: "Fim de cada turno (de qualquer um)",
  inicioRodada: "Início da rodada",
  fimRodada: "Fim da rodada",
  fuiAlvoDeAtaque: "Fui alvo de um teste de ataque (acertando ou não)",
  fuiAtingidoPorAtaque: "Fui atingido por um ataque (o ataque acertou)",
  euEsquivei: "Esquivei de um ataque",
  euFalheiEsquiva: "Falhei ao esquivar",
  euBloqueei: "Bloqueei um ataque",
  euFalheiBloqueio: "Falhei ao bloquear",
  euUseiAcao: "Usei uma Ação (filtre por tipo/nome abaixo)",
  euConcediPrioridade: "Concedi Prioridade (pelo card)",
  euRoubeiPrioridade: "Tomei a Prioridade de alguém",
  minhaPrioridadeFoiRoubada: "Tomaram a minha Prioridade",
  vidaZerou: "Minha Vida chegou a 0 (antes de cair)",
  aliadoCaiu: "Um aliado caiu a 0 de Vida",
  aoRecarregar: "Recarreguei uma arma ou item (Ação de Recarga)",
  bebeuFrasco: "Bebi um Frasco (ou recebi um)"
};
// Tipos de efeito de um Gatilho (campo "recurso"). "efeitoUuid" guarda o
// UUID da Condição ou o id do Recurso Customizado quando o tipo precisa.
const NAUREN_GATILHO_EFEITO_OPCOES = {
  removerCondicaoEmMim: "Remover uma Condição de mim (todos os acúmulos)",
  vida: "Ganhar Vida", mana: "Ganhar Mana", estaminaCombate: "Ganhar Estamina",
  dadosDestino: "Ganhar Dado de Destino", estresse: "Alterar Estresse (negativo reduz)",
  recursoCustom: "Ganhar Recurso Customizado (id no campo ao lado)",
  condicaoEmMim: "Aplicar Condição em mim (arraste ao lado)",
  condicaoNoAtacante: "Aplicar Condição em quem me atacou (arraste ao lado)",
  consumirAcumuloProprio: "Consumir acúmulo(s) deste item (Condição)",
  danoNoAtacante: "Dano em quem me atacou",
  ataqueBasicoNoAtacante: "Ataque básico grátis em quem me atacou",
  estresseNoAtacante: "Estresse em quem me atacou",
  rolarLimiar: "Rolar dado com limiar (avisa; pode aplicar Condição ao passar)",
  condicaoEmQuemRecebeu: "Aplicar Condição em quem recebeu a Prioridade / no alvo",
  roubarEstamina: "Roubar Estamina (de quem perdeu a Prioridade ou do alvo)",
  roubarDestino: "Roubar Dado de Destino (de quem perdeu a Prioridade ou do alvo)",
  moverEscolhendo: "Mover-me escolhendo no mapa (metros)",
  recuperarUsoEscolhido: "Recuperar 1 uso de uma habilidade minha (escolher)",
  recuperarUsoACada: "A cada N vezes, recuperar 1 uso deste item (N no campo ao lado)",
  escolherCondicaoEmMim: "Escolher uma Condição (das opções) e aplicar em mim",
  removerCondicaoEscolhida: "Remover 1 acúmulo de uma Condição minha (escolher)",
  removerCondicaoRecebida: "Remover a Condição que acabei de receber",
  transferirCondicaoRecebida: "Passar a Condição recebida a um aliado ao lado",
  prioridadeParaMascotes: "Dar Prioridade aos meus mascotes",
  oferecerAcaoDesteItem: "Perguntar se quer usar a Ação deste item agora",
  condicaoEmAliadoEscolhido: "Aplicar Condição num aliado que eu escolher (arraste ao lado)",
  virarPaginaGratis: "Virar a página do meu Grimório (sem custo)",
  copiarCondicaoRecebida: "Copiar 1 acúmulo da Condição recebida para outro inimigo perto"
};
const NAUREN_REACAO_PRE_ATAQUE_OPCOES = {
  "": "Nenhuma",
  proteger: "Proteger: tornar-se o alvo no lugar do aliado",
  dificuldade: "Impor Dificuldade à rolagem do atacante",
  escudoVivo: "Escudo Vivo: quando EU sou atacado, um aliado perto de mim vira o alvo",
  desviar: "Desviar: o ataque contra mim vai para outra criatura"
};
const NAUREN_REACAO_RESISTIR_OPCOES = { "": "Não pode resistir", estaminaCombate: "Estamina", mana: "Mana", estresse: "Estresse (+1 por ponto)" };
const NAUREN_REACAO_QUEM_OPCOES = { aliado: "Quando um aliado é atacado", euOuAliado: "Quando eu ou um aliado somos atacados" };
const NAUREN_REACAO_CUSTO_OPCOES = { "": "Sem custo extra", estaminaCombate: "Estamina", mana: "Mana", dadosDestino: "Dado de Destino" };
const NAUREN_TOMA_PRIORIDADE_OPCOES = {
  "": "Não",
  aliado: "De um aliado",
  inimigo: "De um inimigo",
  qualquer: "De qualquer um"
};
const NAUREN_GATILHO_MOMENTO_ACAO = {
  "": "Em qualquer momento",
  emPrioridade: "Só em Prioridade (fora do próprio turno)",
  meuTurno: "Só no próprio turno"
};
const NAUREN_GATILHO_LIMITE_ESCOPO = {
  turno: "por turno (de qualquer um)", meuTurno: "por turno meu", rodada: "por rodada", cena: "por combate"
};

/**
 * Visão de um Gatilho para a ficha: tipo de efeito separado do alvo (aceita
 * o formato antigo "condicaoEmMim:<uuid>"), rótulo do campo de alvo e um
 * resumo em linguagem natural.
 */
function naurenVisaoGatilho(g) {
  const bruto = String(g.recurso ?? "");
  const [prefixo, ...resto] = bruto.split(":");
  const tipoEfeito = NAUREN_GATILHO_EFEITO_OPCOES[bruto] ? bruto : (NAUREN_GATILHO_EFEITO_OPCOES[prefixo] ? prefixo : bruto);
  const efeitoAlvo = g.efeitoUuid || (resto.length ? resto.join(":") : "");
  const precisaAlvoEfeito = ["recursoCustom", "condicaoEmMim", "removerCondicaoEmMim", "condicaoNoAtacante", "rolarLimiar", "condicaoEmQuemRecebeu", "condicaoEmAliadoEscolhido"].includes(tipoEfeito);
  const rotuloAlvoEfeito = tipoEfeito === "recursoCustom" ? "Id do Recurso Customizado" : tipoEfeito === "rolarLimiar" ? "Condição em mim se passar (opcional)" : "Condição (arraste)";
  const evento = (NAUREN_GATILHO_EVENTO_OPCOES[g.evento] ?? g.evento ?? "").replace(/ \(.*\)$/, "").toLowerCase();
  const efeito = (NAUREN_GATILHO_EFEITO_OPCOES[tipoEfeito] ?? tipoEfeito).replace(/ \(.*\)$/, "").toLowerCase();
  const limite = String(g.limiteUsos ?? "").trim() ? `, no máximo ${g.limiteUsos} ${NAUREN_GATILHO_LIMITE_ESCOPO[g.limiteEscopo || "turno"]}` : "";
  const filtros = [g.apenasAtaque && "só ataques", g.soSeCura && "só curas", g.condicaoNecessariaUuid && "com Condição exigida", g.nomeAcaoContem && `Ação contendo "${g.nomeAcaoContem}"`, g.tipoItemUsado && `item do tipo ${g.tipoItemUsado}`, g.filtroAlcanceAtaque && (g.filtroAlcanceAtaque === "distancia" ? "só ataques à distância" : "só ataques corpo a corpo"), g.filtroOrigemAtaque && `só ataques com ${g.filtroOrigemAtaque}`].filter(Boolean);
  return {
    ...g, tipoEfeito, efeitoAlvo, precisaAlvoEfeito, rotuloAlvoEfeito,
    temFiltros: !!(String(g.limiteUsos ?? "").trim() || g.momentoAcao || g.apenasAtaque || g.soSeCura || g.condicaoNecessariaUuid || g.condicaoFormula || g.itemUsadoUuid || g.nomeAcaoContem || g.tipoItemUsado || g.condicaoDoContextoUuid || g.alcance),
    resumo: `Quando ${evento}: ${efeito} ${g.quantidade || "1"}${limite}${filtros.length ? ` (${filtros.join(", ")})` : ""}.`
  };
}

/**
 * Chave do escopo atual do Relógio para contar disparos limitados: muda
 * sozinha quando o turno/rodada/combate muda, então não precisa de reset.
 */
function naurenChaveEscopoRelogio(escopo, actor) {
  const c = game.combat;
  if (!c?.started) return `fora:${escopo}`;
  if (escopo === "cena") return `${c.id}`;
  if (escopo === "rodada") return `${c.id}:${c.round}`;
  if (escopo === "meuTurno") {
    // Vale do início do meu turno até o próximo início do meu turno.
    const meu = c.combatants.find(cb => naurenCombatenteEhDoAtor(cb, actor));
    const passou = meu && c.turns.indexOf(meu) <= c.turn;
    return `${c.id}:${passou ? c.round : c.round - 1}:meu`;
  }
  return `${c.id}:${c.round}:${c.turn}`;
}

// Opções do seletor "Contar" do campo "Contar em Área" de uma Ação.
const NAUREN_CONTAGEM_DISPOSICAO_OPCOES = {
  aliados: "Aliados",
  inimigos: "Inimigos",
  todos: "Todos"
};
// Mesmas opções, mas pra mecanismos que SEMPRE excluem o próprio ator
// fonte da varredura (ver naurenProcessarEmanacoes e
// _contarComCondicaoEmArea, ambos com "if (t === tokenFonte) continue"
// incondicional, a menos que a opção "todosComVoce" abaixo seja
// escolhida) - "todos" aqui sempre exclui você; pra incluir, existe uma
// 4ª opção dedicada na MESMA lista (não um checkbox separado - mais
// simples de usar e mais compacto na ficha).
const NAUREN_CONTAGEM_DISPOSICAO_OPCOES_SEM_DONO = {
  aliados: "Aliados",
  inimigos: "Inimigos",
  todos: "Todos (menos você)",
  todosComVoce: "Todos (incluindo você)"
};

// Opções do seletor "Evento" de uma Emanação (só turno/rodada fazem
// sentido pra uma aura persistente).
const NAUREN_EMANACAO_EVENTO_OPCOES = {
  inicioTurno: "Início do meu turno",
  fimTurno: "Fim do meu turno",
  inicioRodada: "Início da rodada",
  fimRodada: "Fim da rodada",
  inicioTurnoNaArea: "Início do turno de quem estiver na área"
};

// Opções do seletor "Efeito" de uma Emanação.
const NAUREN_EMANACAO_EFEITO_OPCOES = {
  nenhum: "Nenhum (só o visual, sem efeito)",
  dano: "Dano",
  cura: "Cura",
  estresse: "Estresse",
  estamina: "Perda de Estamina",
  condicao: "Aplicar Condição/Efeito"
};

// Opções do seletor "Evento periódico" de um Template Persistente -
// SEPARADO das de Emanação (que são sempre "meu turno", pessoal): aqui
// o efeito periódico (dano/cura/condição) sempre bate em TODO turno de
// TODO mundo dentro da área, decoupled do "Sustentar" abaixo (que
// continua só no turno de quem criou - só ele pode pagar pra manter a
// área ativa). Confirmado: uma magia "por turno" acerta a cada turno
// de qualquer personagem na rodada, não só no turno de quem lançou -
// mesma regra já usada pras Condições "por turno" (Hemorragia).
const NAUREN_TEMPLATE_PERSISTENTE_EVENTO_OPCOES = {
  "": "Nenhum (não periódico)",
  inicioTurno: "Início do turno de cada um na área",
  fimTurno: "Fim do turno de cada um na área",
  inicioRodada: "Início da rodada (todos na área, 1 vez)",
  fimRodada: "Fim da rodada (todos na área, 1 vez)"
};

// Opções do seletor "Efeito" de um Template Persistente - diferente da
// Emanação, "Condição" NÃO é uma opção exclusiva aqui: um Template pode
// causar dano E aplicar uma Condição ao mesmo tempo (ex: Armadilha de
// Caça - 1d6 de dano E fica Preso), então a Condição é um campo à parte,
// sempre visível, e este dropdown só escolhe o efeito NUMÉRICO opcional.
const NAUREN_TEMPLATE_PERSISTENTE_EFEITO_OPCOES = {
  "": "Nenhum (só a Condição abaixo, se houver)",
  dano: "Dano",
  cura: "Cura",
  estresse: "Estresse",
  reduzEstresse: "Reduz Estresse",
  estamina: "Perda de Estamina",
  restauraEstamina: "Restaura Estamina"
};

// Opções do seletor "Automação de Alvo" de cada Ação
const MODOS_ALVO = {
  nenhum: "Nenhum (tudo manual)",
  selecionado: "Alvos selecionados (tecla T)",
  area: "Área no mapa (todos dentro da forma)"
};

// Recursos que um Efeito Periódico de Condição pode alterar
const RECURSOS_PERIODICOS = { dano: "Dano", cura: "Cura", estamina: "Estamina", mana: "Mana", acumuloProprio: "Acúmulo Próprio (soma na mesma Condição)" };

// Recursos do ALVO que uma Ação pode gastar diretamente, ou que o alvo pode
// pagar como custo pra evitar uma condição/gasto ("perguntarParaEvitar").
// Estresse é o único que SOMA (causa Estresse); os demais SUBTRAEM
// (gasta/drena/causa dano). Todas as quantidades aceitam fórmula de dado.
const RECURSOS_ALVO = { vida: "Vida", estamina: "Estamina", mana: "Mana", destino: "Dado de Destino", estresse: "Estresse" };

// Forma padrão de um Gasto de Recurso novo, usada pelo botão "+ Adicionar" da Ação
function novoGastoRecursoPadrao() {
  return { recurso: "vida", quantidade: "1", ativo: true, soSeAcertar: true, perguntarParaEvitar: false, custoParaEvitarRecurso: "estamina", custoParaEvitarQuantidade: "1", quantidadePorRank: [], custoParaEvitarQuantidadePorRank: [] };
}

// Forma padrão de um Efeito Periódico novo, usada pelo botão "+ Adicionar" da Condição
function novoEfeitoPeriodicoPadrao() {
  return { recurso: "dano", formula: "1", aumentaPorAcumulo: true, porTurno: false };
}

/**
 * Adiciona um Recurso Customizado novo (Cap. IV/campoRecursoDeclarado) -
 * função solta (não presa a nenhuma classe específica) porque tanto
 * NaurenItemSheet (Classe) quanto NaurenSubclasseSheet (Subclasse) a usam,
 * e sendo função ela é "hoisted" - evita problema de ordem de declaração
 * entre as duas classes de ficha (uma referenciando método estático da
 * outra ANTES dela existir travaria o carregamento do sistema inteiro).
 */
async function naurenOnAddRecurso(event, target) {
  const lista = foundry.utils.deepClone(this.item.system.recursosDeclarados ?? []);
  lista.push({ id: "", nome: "Novo Recurso", maxFormula: "5", icone: "fa-star", cor1: "#4a3a7a", cor2: "#8a6fd4", chaveInterna: foundry.utils.randomID() });
  await this.item.update({ "system.recursosDeclarados": lista });
}

/**
 * Remove um Recurso Customizado da declaração (Classe ou Subclasse). Se
 * este item estiver equipado num personagem (this.item.actor) e o
 * recurso correspondente na ficha dele AINDA estiver intocado (valor 0 -
 * ou seja, ninguém chegou a gastar/ganhar nada dele), remove também de lá
 * automaticamente, numa cascata segura. Se já tiver algum valor acumulado
 * (valor > 0), NÃO remove sozinho (evita apagar progresso sem querer) -
 * avisa que precisa remover manualmente pelo ícone de lixeira na própria
 * ficha do personagem.
 */
async function naurenOnRemoveRecurso(event, target) {
  const index = Number(target.dataset.index);
  const declaracao = (this.item.system.recursosDeclarados ?? [])[index];
  const lista = foundry.utils.deepClone(this.item.system.recursosDeclarados ?? []).filter((_, i) => i !== index);
  await this.item.update({ "system.recursosDeclarados": lista });

  const actor = this.item.actor;
  if (!actor || !declaracao?.id) return;
  const recursosAtuais = foundry.utils.deepClone(actor.system.recursosCustom ?? []);
  // Casa por "chaveInterna" (estável) - não pelo "id" (editável).
  const indiceNoAtor = declaracao.chaveInterna
    ? recursosAtuais.findIndex(r => r.chaveInterna === declaracao.chaveInterna)
    : recursosAtuais.findIndex(r => r.id === declaracao.id); // fallback pra declaração antiga sem chaveInterna ainda
  if (indiceNoAtor === -1) return;

  if ((recursosAtuais[indiceNoAtor].valor ?? 0) === 0) {
    recursosAtuais.splice(indiceNoAtor, 1);
    await actor.update({ "system.recursosCustom": recursosAtuais });
  } else {
    ui.notifications.warn(`"${declaracao.nome || declaracao.id}" já tem valor acumulado em ${actor.name} - não foi removido de lá automaticamente. Remova pelo ícone de lixeira na ficha do personagem, se quiser.`);
  }
}

class NaurenItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  // Fila de gravações POR CAMPO RAIZ (ex: "acoes", "efeitosVinculados") -
  // GARANTE que cada edição (campo isolado, +Adicionar, remover...) sempre
  // lê o estado mais recente antes de escrever, mesmo que o jogador edite
  // rápido em sequência (ex: digita a fórmula de um dano e já clica em
  // "+Adicionar Dano" em outra Ação antes da primeira gravação terminar).
  // Sem isso, duas gravações quase simultâneas corriam risco real de uma
  // apagar a outra com dado velho. Serve tanto pra "acoes" (lista dentro do
  // item) quanto pra "efeitosVinculados" (lista de vínculos passivos de
  // Armadura/Consumível) - ambas são "listas de objetos com vários campos",
  // e por isso sofrem do mesmo problema se editadas com o auto-save nativo
  // do formulário (ver _onArrayFieldChange).
  #filas = new Map();

  // Quais entradas do Inventário Compartilhado (do item "grupo") estão com
  // a descrição/notas expandida - mesmo padrão de "#itensDescricaoExpandida"
  // já usado na ficha de Ator, só que essa aqui é PRÓPRIA da ficha de Item
  // (classes diferentes, não dava pra reaproveitar a mesma propriedade).
  #inventarioExpandido = new Set();

  // Qual aba do item "grupo" está aberta (Membros/Itens/Anotações) entre um
  // render e outro - mesmo motivo/padrão já documentado em
  // "NaurenActorSheet#abaAtiva".
  #abaAtivaGrupo = "membros";

  // Posição de rolagem do corpo da ficha de Item entre um render e outro
  // (mesma ideia/problema já resolvido em "NaurenActorSheet#scrollSheetBody"
  // - qualquer edição que dispare um re-render, tipo os botões +/- do
  // Nível de Perigo, senão sempre voltava pro topo da ficha).
  #scrollItemBody = 0;

  /** Enfileira uma alteração num array de nível de item (ex: "acoes",
   *  "efeitosVinculados"): lê o estado mais recente (só depois que
   *  qualquer gravação pendente anterior daquele MESMO campo já terminou),
   *  aplica "mutador" nele, e salva a lista inteira de volta. */
  _enfileirarArray(campoRaiz, mutador) {
    const anterior = this.#filas.get(campoRaiz) ?? Promise.resolve();
    const proxima = anterior
      .then(() => {
        const atual = foundry.utils.deepClone(this.item.system[campoRaiz] ?? []);
        mutador(atual);
        return this.item.update({ [`system.${campoRaiz}`]: atual });
      })
      .catch(err => console.error(`Nauren RPG | Erro ao salvar "${campoRaiz}":`, err));
    this.#filas.set(campoRaiz, proxima);
    return proxima;
  }

  /**
   * Igual "_enfileirarArray", mas pra mexer num array "modificadores" que
   * mora ANINHADO dentro do campoRaiz - usado pelo editor de modificadores
   * embutidos direto num Efeito Vinculado (sem apontar pra um item de
   * Efeito separado por UUID). "caminhoRelativo" é o caminho, dentro do
   * array clonado de campoRaiz, até o array de modificadores - ex:
   * "0.modificadores" (vínculo 0 no nível do item) ou
   * "2.efeitosVinculados.0.modificadores" (Ação 2, vínculo 0 dela). Clona
   * o array INTEIRO de campoRaiz, aplica o mutador só no array apontado
   * pelo caminho, e salva de volta o array inteiro - mesma fila por
   * "campoRaiz" que a versão simples, pra nunca perder uma edição rápida
   * em sequência.
   */
  _enfileirarArrayAninhado(campoRaiz, caminhoRelativo, mutador) {
    const anterior = this.#filas.get(campoRaiz) ?? Promise.resolve();
    const proxima = anterior
      .then(() => {
        const atual = foundry.utils.deepClone(this.item.system[campoRaiz] ?? []);
        let lista = foundry.utils.getProperty(atual, caminhoRelativo);
        if (!lista) {
          foundry.utils.setProperty(atual, caminhoRelativo, []);
          lista = foundry.utils.getProperty(atual, caminhoRelativo);
        }
        mutador(lista);
        return this.item.update({ [`system.${campoRaiz}`]: atual });
      })
      .catch(err => console.error(`Nauren RPG | Erro ao salvar "${campoRaiz}" (aninhado):`, err));
    this.#filas.set(campoRaiz, proxima);
    return proxima;
  }

  static DEFAULT_OPTIONS = {
    classes: ["nauren-rpg", "sheet", "item"],
    position: { width: 580, height: 680 },
    window: { resizable: true },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      editImage: NaurenItemSheet.onEditImage,
      escolherImagemTransformacao: NaurenItemSheet.onEscolherImagemTransformacao,
      escolherImagemEntidade: NaurenItemSheet.onEscolherImagemEntidade,
      limparCorEmanacao: NaurenItemSheet.onLimparCorEmanacao,
      addAcao: NaurenItemSheet.onAddAcao,
      toggleCapacidade: NaurenItemSheet.onToggleCapacidade,
      toggleEquipCategoria: NaurenItemSheet.onToggleEquipCategoria,
      equipPadraoLivro: NaurenItemSheet.onEquipPadraoLivro,
      addUsoExtra: NaurenItemSheet.onAddUsoExtra,
      addPagarMovimento: NaurenItemSheet.onAddPagarMovimento,
      removePagarMovimento: NaurenItemSheet.onRemovePagarMovimento,
      removeUsoExtra: NaurenItemSheet.onRemoveUsoExtra,
      addOpcaoConsumivel: NaurenItemSheet.onAddOpcaoConsumivel,
      removeOpcaoConsumivel: NaurenItemSheet.onRemoveOpcaoConsumivel,
      addOpcaoGatilho: NaurenItemSheet.onAddOpcaoGatilho,
      removeOpcaoGatilho: NaurenItemSheet.onRemoveOpcaoGatilho,
      addImunidade: NaurenItemSheet.onAddImunidade,
      removeImunidade: NaurenItemSheet.onRemoveImunidade,
      toggleArmaTipoAcao: NaurenItemSheet.onToggleArmaTipoAcao,
      addAjusteMana: NaurenItemSheet.onAddAjusteMana,
      removeAjusteMana: NaurenItemSheet.onRemoveAjusteMana,
      duplicateAcao: NaurenItemSheet.onDuplicateAcao,
      removeAcao: NaurenItemSheet.onRemoveAcao,
      setAcaoAtiva: NaurenItemSheet.onSetAcaoAtiva,
      addAcaoBlock: NaurenItemSheet.onAddAcaoBlock,
      addModificadorPoderosa: NaurenItemSheet.onAddModificadorPoderosa,
      addLimiteGrupo: NaurenItemSheet.onAddLimiteGrupo,
      addPagarCusto: NaurenItemSheet.onAddPagarCusto,
      addReduzCusto: NaurenItemSheet.onAddReduzCusto,
      toggleArmaTipo: NaurenItemSheet.onToggleArmaTipo,
      addTipoEstudo: NaurenItemSheet.onAddTipoEstudo,
      addBonusPeriodico: NaurenItemSheet.onAddBonusPeriodico,
      removeBonusPeriodico: NaurenItemSheet.onRemoveBonusPeriodico,
      removeTipoEstudo: NaurenItemSheet.onRemoveTipoEstudo,
      addEfeitoAtaque: NaurenItemSheet.onAddEfeitoAtaque,
      removeEfeitoAtaque: NaurenItemSheet.onRemoveEfeitoAtaque,
      addEmanacaoVariante: NaurenItemSheet.onAddEmanacaoVariante,
      removeEmanacaoVariante: NaurenItemSheet.onRemoveEmanacaoVariante,
      removeReduzCusto: NaurenItemSheet.onRemoveReduzCusto,
      addConcederItem: NaurenItemSheet.onAddConcederItem,
      removeConcederItem: NaurenItemSheet.onRemoveConcederItem,
      removePagarCusto: NaurenItemSheet.onRemovePagarCusto,
      removeLimiteGrupo: NaurenItemSheet.onRemoveLimiteGrupo,
      removeModificadorPoderosa: NaurenItemSheet.onRemoveModificadorPoderosa,
      removeAcaoBlock: NaurenItemSheet.onRemoveAcaoBlock,
      limparCorTemplate: NaurenItemSheet.onLimparCorTemplate,
      addPorRank: NaurenItemSheet.onAddPorRank,
      addDefesaPorRank: NaurenItemSheet.onAddDefesaPorRank,
      removeDefesaPorRank: NaurenItemSheet.onRemoveDefesaPorRank,
      addModificadorExterno: NaurenItemSheet.onAddModificadorExterno,
      removeModificadorExterno: NaurenItemSheet.onRemoveModificadorExterno,
      addModificadorExternoPorRank: NaurenItemSheet.onAddModificadorExternoPorRank,
      removeModificadorExternoPorRank: NaurenItemSheet.onRemoveModificadorExternoPorRank,
      addGatilhoTemplatePersistente: NaurenItemSheet.onAddGatilhoTemplatePersistente,
      removeGatilhoTemplatePersistente: NaurenItemSheet.onRemoveGatilhoTemplatePersistente,
      addModificador: NaurenItemSheet.onAddModificador,
      toggleAcaoBoolCampo: NaurenItemSheet.onToggleAcaoBoolCampo,
      removeModificador: NaurenItemSheet.onRemoveModificador,
      addModificadorPorRank: NaurenItemSheet.onAddModificadorPorRank,
      removeModificadorPorRank: NaurenItemSheet.onRemoveModificadorPorRank,
      addEfeitoVinculadoModificador: NaurenItemSheet.onAddEfeitoVinculadoModificador,
      removeEfeitoVinculadoModificador: NaurenItemSheet.onRemoveEfeitoVinculadoModificador,
      addEfeitoVinculadoCondicao: NaurenItemSheet.onAddEfeitoVinculadoCondicao,
      removeEfeitoVinculadoCondicao: NaurenItemSheet.onRemoveEfeitoVinculadoCondicao,
      addEfeitoVinculadoModificadorPorRank: NaurenItemSheet.onAddEfeitoVinculadoModificadorPorRank,
      removeEfeitoVinculadoModificadorPorRank: NaurenItemSheet.onRemoveEfeitoVinculadoModificadorPorRank,
      addAcaoEfeitoVinculadoModificador: NaurenItemSheet.onAddAcaoEfeitoVinculadoModificador,
      removeAcaoEfeitoVinculadoModificador: NaurenItemSheet.onRemoveAcaoEfeitoVinculadoModificador,
      addAcaoEfeitoVinculadoModificadorPorRank: NaurenItemSheet.onAddAcaoEfeitoVinculadoModificadorPorRank,
      removeAcaoEfeitoVinculadoModificadorPorRank: NaurenItemSheet.onRemoveAcaoEfeitoVinculadoModificadorPorRank,
      limparVeneno: NaurenItemSheet.onLimparVeneno,
      addGatilho: NaurenItemSheet.onAddGatilho,
      removeGatilho: NaurenItemSheet.onRemoveGatilho,
      addBonusCondicionalAoAlvo: NaurenItemSheet.onAddBonusCondicionalAoAlvo,
      removeBonusCondicionalAoAlvo: NaurenItemSheet.onRemoveBonusCondicionalAoAlvo,
      removePorRank: NaurenItemSheet.onRemovePorRank,
      addAcaoEfeitoVinculado: NaurenItemSheet.onAddAcaoEfeitoVinculado,
      removeAcaoEfeitoVinculado: NaurenItemSheet.onRemoveAcaoEfeitoVinculado,
      addAcaoCondicao: NaurenItemSheet.onAddAcaoCondicao,
      removeAcaoCondicao: NaurenItemSheet.onRemoveAcaoCondicao,
      addCondicaoAlvoMultipla: NaurenItemSheet.onAddCondicaoAlvoMultipla,
      removeCondicaoAlvoMultipla: NaurenItemSheet.onRemoveCondicaoAlvoMultipla,
      addCondicaoEscolhida: NaurenItemSheet.onAddCondicaoEscolhida,
      removeCondicaoEscolhida: NaurenItemSheet.onRemoveCondicaoEscolhida,
      addPorNivel: NaurenItemSheet.onAddPorNivel,
      removePorNivel: NaurenItemSheet.onRemovePorNivel,
      addPorNivelItem: NaurenItemSheet.onAddPorNivelItem,
      addReacaoPaga: NaurenItemSheet.onAddReacaoPaga,
      removeReacaoPaga: NaurenItemSheet.onRemoveReacaoPaga,
      removePorNivelItem: NaurenItemSheet.onRemovePorNivelItem,
      addAcaoGasto: NaurenItemSheet.onAddAcaoGasto,
      removeAcaoGasto: NaurenItemSheet.onRemoveAcaoGasto,
      addCustoRecursoProprio: NaurenItemSheet.onAddCustoRecursoProprio,
      removeCustoRecursoProprio: NaurenItemSheet.onRemoveCustoRecursoProprio,
      addConcessaoAoAtacante: NaurenItemSheet.onAddConcessaoAoAtacante,
      removeConcessaoAoAtacante: NaurenItemSheet.onRemoveConcessaoAoAtacante,
      addEfeitoVinculado: NaurenItemSheet.onAddEfeitoVinculado,
      escolherBonusItem: NaurenItemSheet.onEscolherBonusItem,
      marcarTorre: NaurenItemSheet.onMarcarTorre,
      tirarTorre: NaurenItemSheet.onTirarTorre,
      removeEfeitoVinculado: NaurenItemSheet.onRemoveEfeitoVinculado,
      addEfeitoPeriodico: NaurenItemSheet.onAddEfeitoPeriodico,
      removeEfeitoPeriodico: NaurenItemSheet.onRemoveEfeitoPeriodico,
      addEfeitoPeriodicoPorRank: NaurenItemSheet.onAddEfeitoPeriodicoPorRank,
      removeEfeitoPeriodicoPorRank: NaurenItemSheet.onRemoveEfeitoPeriodicoPorRank,
      removeGrupoMembro: NaurenItemSheet.onRemoveGrupoMembro,
      ajustarGrupo: NaurenItemSheet.onAjustarGrupo,
      usarAcalanto: NaurenItemSheet.onUsarAcalanto,
      ajustarAmeacaMembro: NaurenItemSheet.onAjustarAmeacaMembro,
      distribuirXpGrupo: NaurenItemSheet.onDistribuirXpGrupo,
      addInventarioItem: NaurenItemSheet.onAddInventarioItem,
      removeInventarioItem: NaurenItemSheet.onRemoveInventarioItem,
      criarJournalGrupo: NaurenItemSheet.onCriarJournalGrupo,
      abrirJournalGrupo: NaurenItemSheet.onAbrirJournalGrupo,
      toggleInventarioExpandido: NaurenItemSheet.onToggleInventarioExpandido,
      removeNota: NaurenItemSheet.onRemoveNota,
      resetarGrupo: NaurenItemSheet.onResetarGrupo,
      addNivel: NaurenItemSheet.onAddNivel,
      removeNivel: NaurenItemSheet.onRemoveNivel,
      addNivelItem: NaurenItemSheet.onAddNivelItem,
      removeNivelItem: NaurenItemSheet.onRemoveNivelItem,
      toggleNivelEscolhaAtivo: NaurenItemSheet.onToggleNivelEscolhaAtivo,
      addNivelEscolhaItem: NaurenItemSheet.onAddNivelEscolhaItem,
      removeNivelEscolhaItem: NaurenItemSheet.onRemoveNivelEscolhaItem,
      addNivelUpgrade: NaurenItemSheet.onAddNivelUpgrade,
      removeNivelUpgrade: NaurenItemSheet.onRemoveNivelUpgrade,
      // Funções soltas (não presas a nenhuma classe) que operam em
      // "this.item.system.recursosDeclarados" sem checar o tipo do item -
      // ver naurenOnAddRecurso/naurenOnRemoveRecurso, também usadas por
      // NaurenSubclasseSheet.
      addRecurso: naurenOnAddRecurso,
      removeRecurso: naurenOnRemoveRecurso
    }
  };

  static PARTS = {
    body: { template: "systems/nauren/templates/item-sheet.html", scrollable: [""] }
  };

  /** @override - título limpo tipo "Habilidade: Bola de Fogo" em vez de "TYPES.Item.habilidade: ..." */
  get title() {
    const label = TIPO_ITEM_LABEL[this.item.type] ?? this.item.type;
    return `${label}: ${this.item.name}`;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.item;

    context.item = item;
    context.system = item.system;
    context.owner = item.isOwner;
    context.editable = this.isEditable;

    context.isArma = item.type === "arma";
    context.isMagia = item.type === "magia";
    context.isArmadura = item.type === "armadura";
    context.isConsumivel = item.type === "consumivel";
    context.isHabilidade = item.type === "habilidade";
    // Blocos de recursos avançados (Usos Passivos, Recursos Próprios,
    // Gatilhos, Emanação) valem tanto pra Habilidade quanto pra Magia -
    // desde que Magia ganhou o mesmo schema (ver NaurenMagiaData), ela
    // também precisa dessa UI. Um campo só, pra não duplicar o
    // "{{#if isHabilidade}}" grande duas vezes no template.
    context.temRecursosAvancados = context.isHabilidade || context.isMagia;
    // Bônus Condicional ao Alvo: tipos que têm o campo no schema.
    context.temBonusCondicional = ["habilidade", "efeito", "condicao"].includes(item.type);
    context.temLimitesDeGrupo = ["habilidade", "efeito"].includes(item.type);
    context.temPagarCustoCom = ["condicao", "efeito"].includes(item.type);
    context.temReduzCusto = ["condicao", "efeito", "habilidade"].includes(item.type);
    context.empurrarAleatorioOpcoes = { "": "— não —", "1": "1m", "1d4": "1d4 m", "1d6": "1d6 m", "2d4": "2d4 m" };
    context.profusaoTipoOpcoes = { "": "Qualquer", ousada: "Só Ousada", retraida: "Só Retraída" };
    context.negativaOpcoes = { auto: `Automático (${item.type === "condicao" ? (naurenCondicaoNegativa(item) ? "negativa" : "não negativa") : "-"})`, sim: "Sim, negativa", nao: "Não" };
    context.categoriaArmaDeduzida = item.type === "arma" ? naurenCategoriaDaArma({ name: item.name, system: { ...item.system, categoria: "" } }) : "";
    if (item.type === "armadura") context.pesoOfensivoPorCategoria = naurenPesoOfensivo({ type: "armadura", system: { ...item.system, pesoOfensivo: 0 } });
    if (item.type === "arma") {
      // 0.94: peso no limite de equipamentos ofensivos, reações pagas e aviso de item de projeto (Bancada).
      context.pesoOfensivoPorCategoria = naurenPesoOfensivo({ type: "arma", name: item.name, system: { ...item.system, pesoOfensivo: 0 } });
      context.reacaoPagaTipoOpcoes = { defesa: "Somar à Defesa ao ser atacado", reduzirDano: "Reduzir o dano sofrido" };
      context.reacaoPagaRecursoOpcoes = { "": "Sem custo", estaminaCombate: "Estamina", mana: "Mana",
        ...Object.fromEntries((item.actor?.system?.recursosCustom ?? []).map(r => [`recursoCustom:${r.id}`, r.nome])) };
      for (const r of item.system.reacoesPagas ?? []) if (r.recurso && !(r.recurso in context.reacaoPagaRecursoOpcoes)) context.reacaoPagaRecursoOpcoes[r.recurso] = r.recurso.replace(/^recursoCustom:/, "");
      const proj = item.getFlag?.("nauren", "projeto");
      context.projetoInfo = proj ? { fonte: proj.fonteNome, gasto: proj.gasto, melhorias: proj.melhoriasFeitas ?? 0 } : null;
    }
    context.categoriaArmaOpcoes = Object.fromEntries(Object.keys(ARMA_TIPOS).filter(t => t !== "Escudo").map(t => [t, ARMA_TIPOS[t]]));
    context.recursosConversaoOpcoes = { estresse: "Estresse", estamina: "Estamina", mana: "Mana", vida: "Vida", destino: "Dados de Destino" };
    context.converterModoOpcoes = { escolher: "O jogador escolhe quanto", tudo: "Tudo o que tiver", fixo: "Quantidade fixa" };
    context.armaQualAtaqueOpcoes = { "": "Qualquer ataque da arma", pesado: "Só o Ataque Pesado", basico: "Só o Ataque Básico" };
    context.efeitoAtaqueTipoOpcoes = { pesadoOuEspecial: "Ataques pesados e especiais", pesado: "Só ataques pesados", especial: "Só ataques especiais (habilidades)", especialComArma: "Especiais com arma escolhida", comArma: "Qualquer ataque com a arma", basico: "Só ataques básicos", qualquer: "Qualquer ataque" };
    context.efeitoAtaqueArmaOpcoes = { "": "Qualquer arma", ...Object.fromEntries(Object.keys(ARMA_TIPOS).filter(t => t !== "Escudo").map(t => [t, t])) };
    context.efeitoDanoFixoPorOpcoes = { "": "— nada —", estresseAliados: "Estresse dos seus aliados", prioridadesGeradas: "Prioridade que você deu a aliados", informacoes: "informação sua sobre o alvo" };
    context.efeitoAtaqueDadoOpcoes = { "": "— nenhum —", "1d4": "+1d4", "1d6": "+1d6", "1d8": "+1d8", "1d10": "+1d10", "1d12": "+1d12", "2d6": "+2d6" };
    context.temTiposEstudo = ["habilidade", "efeito"].includes(item.type);
    context.estudoDuracaoOpcoes = { proximoAtaque: "Até o próximo ataque contra ele", rodada: "Até o fim da rodada", cena: "A cena toda" };
    context.tiposEstudoView = await Promise.all((item.system.tiposEstudo ?? []).map(async t => ({ ...t, nomeCondicao: t.condicaoUuid ? await this._nomeParaUuid(t.condicaoUuid) : "" })));
    context.efeitosEmAtaquesView = await Promise.all((item.system.efeitosEmAtaques ?? []).map(async ea => ({ ...ea, nomeCondicao: ea.condicaoUuid ? await this._nomeParaUuid(ea.condicaoUuid) : "" })));
    context.moverQuemOpcoes = { eu: "Você (quem usou)", alvo: "Cada alvo afetado" };
    context.moverMomentoOpcoes = { depois: "Depois da Ação", antes: "Antes do ataque (ex.: Investida)" };
    context.movimentoEvitarOpcoes = { "": "Prioridade ou 1 Estamina (padrão)", custo: "Prioridade ou outro custo", nunca: "Não pode resistir" };
    context.movimentoEvitarRecursoOpcoes = { ...RECURSOS_ALVO };
    context.gruposExclusivosConhecidos ??= naurenGruposExclusivosConhecidos();
    context.concederDuracaoOpcoes = { permanente: "Permanente", cena: "Até o fim do combate" };
    context.nomeConcederItem = (() => {
      const uuid = item.system.concederItemUuid;
      if (!uuid) return "";
      try { return fromUuidSync(uuid)?.name ?? "(não encontrado)"; } catch (err) { return "(não encontrado)"; }
    })();
    context.concederItensView = (item.system.concederItensUuids ?? []).map(uuid => {
      let nome = "";
      try { nome = uuid ? (fromUuidSync(uuid)?.name ?? "(não encontrado)") : ""; } catch (err) { nome = "(não encontrado)"; }
      return { uuid, nome };
    });
    context.pagarCustoOpcoes = NAUREN_PAGAR_CUSTO_OPCOES;
    context.pagarRecursoOpcoes = NAUREN_PAGAR_RECURSO_OPCOES;
    context.empurrarDirecaoOpcoes = { afastar: "Empurrar (afasta de quem usou)", puxar: "Puxar (aproxima de quem usou)" };
    context.gruposExclusivosConhecidos = ["condicao", "efeito", "habilidade"].includes(item.type) ? naurenGruposExclusivosConhecidos() : [];
    context.proximaAcaoTipoItemOpcoes = { "": "Qualquer", habilidade: "Habilidade", magia: "Magia", arma: "Arma" };
    // Gatilhos por Evento (Fase 4): também em Condição e Efeito.
    context.temGatilhos = context.isHabilidade || context.isMagia || item.type === "condicao" || item.type === "efeito";
    context.gatilhoEfeitoOpcoes = NAUREN_GATILHO_EFEITO_OPCOES;
    context.gatilhoLimiteEscopoOpcoes = NAUREN_GATILHO_LIMITE_ESCOPO;
    context.gatilhoMomentoAcaoOpcoes = NAUREN_GATILHO_MOMENTO_ACAO;
    context.tomaPrioridadeOpcoes = NAUREN_TOMA_PRIORIDADE_OPCOES;
    context.reacaoPreAtaqueOpcoes = NAUREN_REACAO_PRE_ATAQUE_OPCOES;
    context.reacaoResistirOpcoes = NAUREN_REACAO_RESISTIR_OPCOES;
    context.reacaoEscolheNovoAlvo = ["escudoVivo", "desviar"].includes(item.system?.reacaoPreAtaque);
    context.reacaoEhDesviar = item.system?.reacaoPreAtaque === "desviar";
    context.reacaoQuemOpcoes = NAUREN_REACAO_QUEM_OPCOES;
    context.reacaoCustoOpcoes = NAUREN_REACAO_CUSTO_OPCOES;
    const nomeDeUuid = uuid => {
      if (!uuid) return "";
      try { return fromUuidSync(uuid)?.name ?? "(não encontrado)"; } catch (err) { return "(não encontrado)"; }
    };
    context.gatilhosView = (item.system.gatilhos ?? []).map(g => {
      const v = naurenVisaoGatilho(g);
      return {
        ...v,
        nomeEfeitoAlvo: v.tipoEfeito === "recursoCustom" ? "" : nomeDeUuid(v.efeitoAlvo),
        nomeCondicaoNecessaria: nomeDeUuid(g.condicaoNecessariaUuid),
        nomeItemUsado: nomeDeUuid(g.itemUsadoUuid),
        nomeCondicaoDoContexto: nomeDeUuid(g.condicaoDoContextoUuid)
      };
    });
    context.isEfeito = item.type === "efeito";
    context.isCor = item.type === "cor";
    context.isCondicao = item.type === "condicao";
    context.isGrupo = item.type === "grupo";
    context.isGM = game.user.isGM;
    context.isClasse = item.type === "classe";
    context.isPeculiaridade = item.type === "peculiaridade";
    // Rank: qualquer um destes tipos pode subir de rank -
    // Pigmento/Condição usam "@rank" direto nos campos de bônus.
    context.temRank = context.isArma || context.isMagia || context.isHabilidade
      || context.isArmadura || context.isEfeito || context.isCor || context.isCondicao;

    // Todo tipo (menos Efeito, Cor, Condição, Grupo e Classe) pode ter uma
    // lista de Ações agora. Pra Armadura/Consumível isso é só um EXTRA
    // opcional (poderes ativos especiais) - o funcionamento principal deles
    // continua no nível do item.
    context.temAcoes = !context.isEfeito && !context.isCor && !context.isCondicao && !context.isGrupo && !context.isClasse && !context.isPeculiaridade;
    context.acoesOpcionais = context.isArmadura || context.isConsumivel;
    // Transformação de Token (ver NaurenCondicaoData/NaurenEfeitoData#usaTransformacao) - disponível pros dois tipos.
    context.isCondicaoOuEfeito = context.isCondicao || context.isEfeito;
    if (context.isCondicao) {
      context.motionCondicaoOpcoes = NAUREN_MOTION_CONDICAO_OPCOES;
      const autoP = (item.system.motion || "auto") === "auto" ? naurenMotionPresetCondicao(item) : null;
      context.motionCondicaoAuto = autoP ? (NAUREN_MOTION_CONDICAO_OPCOES[autoP] ?? autoP) : "nenhum";
    }

    // Efeito Vinculado NO NÍVEL DO ITEM (passivo, sempre ligado enquanto o
    // "estado" certo estiver ativo - equipado/ativo/no inventário) existe
    // pra Armadura, Arma, Habilidade e Consumível. Magia fica de fora: não
    // tem um estado natural de "ligado/desligado" (equipar, ativar) pra
    // servir de gatilho. Cargas no nível do item continuam só em Armadura.
    context.podeVincularEfeitoNoItem = ["armadura", "arma", "habilidade", "magia", "consumivel"].includes(item.type);
    context.podeTerCargasNoItem = item.type === "armadura";
    // Origem (Classe/Subclasse/nenhuma) - ver campo "origem" no schema de
    // Habilidade/Magia/Efeito e naurenGarantirHabilidadeDe*/
    // naurenGarantirEfeitoDe*. Antes só dava pra marcar via código
    // (seed) - agora também dá pra ajustar direto na ficha, pra corrigir
    // um item feito à mão ou um que veio de antes desse campo existir.
    context.podeTerOrigem = context.isHabilidade || context.isMagia || context.isEfeito;
    context.origemOpcoes = { "": "(nenhuma - item comum)", classe: "Classe", subclasse: "Subclasse" };

    context.armaTipos = ARMA_TIPOS;
    context.habilidadeCategorias = HABILIDADE_CATEGORIAS;
    context.logicaCondicoesOpcoes = NAUREN_LOGICA_CONDICOES_OPCOES;
    context.armaduraTipos = ARMADURA_TIPOS;
    context.camposModificadorOpcoes = NAUREN_CAMPOS_MODIFICADOR_OPCOES;
    context.modosModificadorExternoOpcoes = NAUREN_MODOS_MODIFICADOR_EXTERNO_OPCOES;
    context.recursoResistirOpcoes = { estamina: "Estamina", estresse: "Estresse" };
    context.gatilhoTemplateEventoOpcoes = {
      inicioTurno: "Início do Turno (de cada um, dentro da área)",
      fimTurno: "Fim do Turno",
      inicioRodada: "Início da Rodada",
      fimRodada: "Fim da Rodada",
      aoEntrar: "Ao Entrar na Área"
    };
    context.gatilhoTemplateDisposicaoOpcoes = { aliados: "Aliados", inimigos: "Inimigos", todos: "Todos" };
    // "Modificadores Externos" (Efeito que ajusta outro item, ver
    // campoModificadorExterno) - view enriquecida com as opções de campo
    // já detectadas pro item alvo de CADA linha (ver
    // naurenOpcoesDeCampoParaModificadorExterno), pra o seletor da ficha
    // não depender do autor saber/lembrar o dot-path de cabeça. Mantém o
    // mesmo índice do array real ("system.modificadoresExternos"), então
    // os "data-field" do template continuam apontando pro lugar certo -
    // isto aqui é só pra DESENHAR a lista, nunca é o que é salvo.
    if (context.isEfeito) {
      context.modificadoresExternosView = await Promise.all(
        (item.system.modificadoresExternos ?? []).map(async entrada => {
          const { opcoes, tipos, nomeItemAlvo } = await naurenOpcoesDeCampoParaModificadorExterno(entrada.itemAlvoUuid);
          // Tipo do campo ATUALMENTE escolhido nesta linha - decide se o
          // "Valor" de cada rank aparece como checkbox (boolean), lista
          // fechada (select), UUID arrastado (condicaoUuid - modo
          // "adicionar" numa lista de Condições) ou texto livre (numero/
          // formula/desconhecido - ver naurenClassificarCampoAcao). Um
          // campo ainda não escolhido, ou digitado manualmente fora da
          // lista detectada, cai em "formula" (texto livre), nunca trava
          // a edição.
          const infoTipo = tipos[entrada.campo] ?? { tipo: "formula" };
          return {
            ...entrada,
            camposOpcoes: opcoes,
            nomeItemAlvo,
            tipoBoolean: infoTipo.tipo === "boolean",
            tipoSelect: infoTipo.tipo === "select",
            tipoCondicaoUuid: infoTipo.tipo === "condicaoUuid",
            tipoFormula: infoTipo.tipo === "formula" || infoTipo.tipo === "numero",
            opcoesValorAtual: infoTipo.opcoesValor ?? null
          };
        })
      );
    }
    context.restringirTipoItemOpcoes = { "": "Vale para tudo", magia: "Só Magias", arma: "Só Armas", habilidade: "Só Habilidades" };
    // Bônus do item (efeitos vinculados): título legível de cada linha, a escolha "ao receber" e os dados do bot.
    {
      const rotuloCampo = c => NAUREN_CAMPOS_MODIFICADOR_OPCOES[c] ?? c;
      const textoMod = m => {
        const v = String(m.valor ?? "").trim();
        if (/^(vantagem|desvantagem)$/i.test(v)) return `${/^vant/i.test(v) ? "Facilidade" : "Dificuldade"}: ${rotuloCampo(m.campo)}`;
        if (v.startsWith("=")) return `${rotuloCampo(m.campo)} = ${v.slice(1)}`;
        return `${/^[-+]/.test(v) ? v : `+${v}`} ${rotuloCampo(m.campo)}`;
      };
      const vinculos = item.system.efeitosVinculados ?? [];
      context.vinculosResumo = vinculos.map(v => {
        const mods = (v.modificadores ?? []).filter(m => m.campo);
        if (mods.length) return mods.map(textoMod).join(" · ");
        if (v.id) return `Efeito da ficha: ${item.actor?.items.get(v.id)?.name ?? "(não encontrado)"}`;
        return "Bônus vazio — adicione abaixo";
      });
      const esc = item.getFlag("nauren", "escolhaAoReceber");
      context.escolhaBonus = esc?.rotulos?.length ? esc.rotulos.map((rotulo, k) => ({ rotulo, indice: k, ativo: !!vinculos[(esc.inicio ?? 0) + k]?.ativo })) : null;
      const torre = item.getFlag("nauren", "torre");
      context.torreInfo = torre ? { ...torre, tier: torre.tier ? (NAUREN_TORRE_TIERS[torre.tier] ?? torre.tier) : "sem tier", pigmento: torre.pigmento ?? "—" } : null;
      context.torreDados = torre ? { ...torre, tier: torre.tier ?? "", pigmento: torre.pigmento ?? "" } : null;
      context.tierTorre = naurenTierTorre(item);
      context.torreOpcoes = { tiers: NAUREN_TORRE_TIERS, raridades: NAUREN_TORRE_RARIDADES, lojas: NAUREN_TORRE_LOJAS, pigmentos: NAUREN_TORRE_PIGMENTOS };
      context.podeEditarTorre = game.user.isGM;
      if (item.type === "arma" || item.type === "armadura") {
        const padraoSim = naurenDisponivelNoInicio({ system: { disponivelNoInicio: "" }, flags: item.flags });
        context.disponivelNoInicioOpcoes = { "": `Padrão do sistema (${padraoSim ? "aparece" : "não aparece"})`, sim: "Sempre disponível", nao: "Nunca" };
      }
    }
    context.templateFormatos = TEMPLATE_FORMATOS;
    context.atributosBonus = ATRIBUTOS_BONUS;
    context.atributosBaseOpcoes = ATRIBUTOS_BASE_OPCOES;
    context.peculiaridadeTipoOpcoes = { beneficio: "Benefício", fardo: "Fardo" };

    // Itens de Efeito e Consumível disponíveis no ator (Efeito Vinculado do
    // item E de cada Ação; Consumível pra usar como fonte de cargas/munição
    // de uma Ação de arma/magia/habilidade/armadura).
    // Sem dono (item aberto num compêndio ou no diretório): as listas existem vazias,
    // senão os menus de Efeito Vinculado / fonte de cargas quebram a ficha ao desenhar.
    context.efeitosDisponiveis = { "": "-- Escolha um efeito --" };
    context.consumiveisDisponiveis = { "": "-- Escolha um consumível --" };
    if (item.actor) {
      context.efeitosDisponiveis = { "": "-- Escolha um efeito --" };
      for (const efeito of item.actor.items.filter(i => i.type === "efeito")) {
        context.efeitosDisponiveis[efeito.id] = efeito.name;
      }
      context.consumiveisDisponiveis = { "": "-- Escolha um consumível --" };
      for (const cons of item.actor.items.filter(i => i.type === "consumivel")) {
        context.consumiveisDisponiveis[cons.id] = `${cons.name} (${cons.system.quantidade ?? 0}/${cons.system.quantidadeMax ?? 0})`;
      }
    }

    // Automação de alvo: opções do seletor de modo. Condições/Efeitos que uma
    // Ação aplica no alvo agora são referenciados por UUID (copiar/colar via
    // "Copy Document UUID" no menu do item, ou arrastar o item pro campo) em
    // vez de um seletor com todos os itens do mundo - fica ambíguo rápido
    // quando há muitos itens com nomes parecidos, e UUID nunca é ambíguo.
    context.modosAlvo = MODOS_ALVO;
    context.recursosPeriodicos = RECURSOS_PERIODICOS;
    // Relógio de Combate: valores efetivos (itens antigos sem o campo novo
    // mostram o modo derivado do checkbox legado).
    context.momentosPeriodicos = NAUREN_MOMENTOS_PERIODICOS;
    context.modosDuracao = NAUREN_MODOS_DURACAO;
    context.duracaoModoEfetivo = naurenModoDuracaoCondicao(this.item.system);
    context.momentosEfeitosPeriodicos = (this.item.system.efeitosPeriodicos ?? []).map(ef => naurenMomentoEfeitoPeriodico(ef));
    // Recursos Alvo dinâmico: além dos 5 fixos, inclui qualquer Recurso
    // Customizado que o ATOR atual já tenha sincronizado (via Classe ou
    // Subclasse - ver campoRecursoDeclarado/naurenSincronizarRecursosCustom),
    // permitindo que "Gastos de Recurso" gaste algo como "Energia" (Místico)
    // ou "Espírito da Batalha" (Guerreiro) direto pelo dropdown, não só
    // escrevendo o valor cru na mão. Editando um item de compêndio ainda
    // sem dono (item.actor null), só os 5 fixos aparecem.
    // Recursos próprios (Energia, Espírito da Batalha...): os da ficha + todos os declarados por
    // Classes/Subclasses/Habilidades do mundo e dos compêndios - funciona também num item solto.
    const usadosNaAcao = (item.system.acoes ?? []).flatMap(a => [...(a.custosRecursoProprio ?? []), ...(a.gastosRecurso ?? [])].map(c => c.recurso));
    context.recursosAlvo = { ...foundry.utils.deepClone(RECURSOS_ALVO), ...(await naurenRecursosCustomConhecidos(item.actor, usadosNaAcao)) };
    // Mesma lista, mas com uma opção "Nenhum" explícita na frente - usada
    // pro "Custo pra Remover" de uma Condição (ver campoCondicaoAplicada/
    // schema da Condição), onde vazio é um valor válido e comum (remoção
    // livre, o padrão de sempre).
    context.recursosAlvoComNenhum = { "": "Nenhum (remoção livre)", ...context.recursosAlvo };
    context.recursosCustoProprio = { "": "— escolha o recurso —", ...context.recursosAlvo };
    context.recursosPenitencia = { "": "Nenhum (sem custo)", ...context.recursosAlvo };
    context.quandoAplicarOpcoes = { acertar: "Se Acertar", errar: "Se Errar", sempre: "Sempre" };
    context.cargasFonteOpcoes = CARGAS_FONTE_OPCOES;
    context.areaCondicaoModoOpcoes = { com: "Só quem tem", sem: "Só quem não tem" };
    context.filtroAlcanceOpcoes = { "": "Qualquer ataque", corpoACorpo: "Só corpo a corpo", distancia: "Só à distância" };
    context.filtroOrigemOpcoes = { "": "Arma ou Magia", arma: "Só com Arma", magia: "Só com Magia" };
    context.usosResetOpcoes = USOS_RESET_OPCOES;
    // Prioridade (livro, Cap. III): opções e resumo legível por Ação.
    context.temAcoesNoItem = Array.isArray(this.item.system.acoes);
    // "Recebe modificações de" (Fase 3): só para itens dentro de um ator.
    context.modificacoesRecebidas = this.item.actor ? naurenModificacoesRecebidas(this.item.actor, this.item) : [];
    context.prioridadeIndicadores = NAUREN_PRIORIDADE_INDICADORES;
    context.prioridadeIndicadoresAcao = NAUREN_PRIORIDADE_INDICADORES_ACAO;
    context.prioridadeQuemRecebeOpcoes = NAUREN_PRIORIDADE_QUEM_RECEBE;
    context.modosModificadorPoderosa = NAUREN_MODOS_MODIFICADOR_EXTERNO_OPCOES;
    context.prioridadeDisposicaoOpcoes = NAUREN_PRIORIDADE_DISPOSICAO;
    context.prioridadeAcoesInfo = (this.item.system.acoes ?? []).map(acao => naurenResumoPrioridadeAcao(this.item, acao));
    context.resetarNoEscopoOpcoes = RESETAR_NO_ESCOPO_OPCOES;
    context.gatilhoEventoOpcoes = NAUREN_GATILHO_EVENTO_OPCOES;
    context.contagemDisposicaoOpcoes = NAUREN_CONTAGEM_DISPOSICAO_OPCOES;
    context.contagemDisposicaoOpcoesSemDono = NAUREN_CONTAGEM_DISPOSICAO_OPCOES_SEM_DONO;
    context.areaDisposicaoComNenhum = { "": "Sem filtro (afeta todo mundo na área)", ...NAUREN_CONTAGEM_DISPOSICAO_OPCOES };
    context.emanacaoEventoOpcoes = NAUREN_EMANACAO_EVENTO_OPCOES;
    context.emanacaoEfeitoOpcoes = NAUREN_EMANACAO_EFEITO_OPCOES;
    context.templatePersistenteEventoOpcoes = NAUREN_TEMPLATE_PERSISTENTE_EVENTO_OPCOES;
    context.templatePersistenteEfeitoOpcoes = NAUREN_TEMPLATE_PERSISTENTE_EFEITO_OPCOES;
    context.bonusCondicionalAoAlvoCampoOpcoes = { dano: "Dano", ataque: "Ataque", alcance: "Alcance", criticoMin: "Crítico Mínimo (negativo = mais fácil critar)", bloqueio: "Bloqueio (contra esse alvo)", esquiva: "Esquiva (contra esse alvo)" };
    // Não existe helper de igualdade no Handlebars deste sistema (mesmo
    // motivo do comentário logo abaixo, sobre "acaoAtivaIndex") - resolve
    // aqui se o efeito da Emanação é "condicao", pra mostrar os campos
    // certos na ficha.
    context.emanacaoEhCondicao = context.system.emanacaoEfeito === "condicao";
    context.emanacaoEhNenhum = context.system.emanacaoEfeito === "nenhum";
    context.emanacaoCondicaoNome = await this._nomeParaUuid(context.system.emanacaoCondicaoUuid);
    context.emanacaoAtivaSePorCondicaoNome = await this._nomeParaUuid(context.system.emanacaoAtivaSePorCondicaoUuid);
    context.emanacaoVariantesView = await Promise.all((context.system.emanacaoVariantes ?? []).map(async v => ({ ...v, nomeSe: v.seCondicaoUuid ? await this._nomeParaUuid(v.seCondicaoUuid) : "", nomeAplica: v.condicaoUuid ? await this._nomeParaUuid(v.condicaoUuid) : "" })));
    context.concedeBonusTesteAreaDadoCondicaoNome = await this._nomeParaUuid(context.system.concedeBonusTesteAreaDadoCondicaoUuid);
    context.concedeBonusTesteAreaBloqueadaPorCondicaoNome = await this._nomeParaUuid(context.system.concedeBonusTesteAreaBloqueadaPorCondicaoUuid);
    context.bonusCondicionalAoAlvoView = await Promise.all((item.system.bonusCondicionalAoAlvo ?? []).map(async (b, i) => ({
      ...b, index: i, nomeResolvido: await this._nomeParaUuid(b.condicaoUuid)
    })));
    // Um <input type="color"> nativo nunca fica vazio - se o campo estiver
    // em branco (usar a cor do jogador), mostra a cor atual do jogador só
    // pra exibição no seletor, sem gravar nada até o usuário realmente
    // escolher uma cor diferente.
    context.emanacaoCorAtual = context.system.emanacaoCor || game.user.color?.css || "#a15c2e";

    // Monta a lista de Ações com a flag "_ativa" já resolvida (não dá pra
    // comparar índice == acaoAtivaIndex direto no Handlebars, não existe
    // helper de igualdade aqui), resolve o NOME de cada UUID de Condição
    // aplicada (só pra mostrar uma confirmação visual - "→ Nome do item"), e
    // se as cargas desta Ação vêm de um Consumível vinculado.
    // Campos detectados deste item (mesmo detector das camadas), por Ação,
    // para a lista "Outras mudanças" da Conjuração Poderosa.
    const camposDetectados = item.type === "magia" ? (await naurenOpcoesDeCampoParaModificadorExterno(item.uuid).catch(() => null))?.opcoes ?? {} : {};
    const camposPoderosaDaAcao = i => {
      const prefixo = `acoes.${i}.`;
      const saida = {};
      for (const [chave, rotulo] of Object.entries(camposDetectados)) {
        if (chave.startsWith(prefixo)) saida[chave.slice(prefixo.length)] = String(rotulo).replace(/^Ação \d+[^:]*:\s*/, "");
      }
      return saida;
    };
    context.acoesView = await Promise.all((item.system.acoes ?? []).map(async (acao, i) => ({
      ...acao,
      _ativa: i === (item.system.acaoAtivaIndex ?? 0),
      ...naurenResumoDaAcao(acao, item),
      _camposPoderosa: camposPoderosaDaAcao(i),
      _maisOpcoesEmUso: !!(acao.virarPagina || acao.usaConjurarArma || acao.usaConjurarConsumivel || acao.aplicarVeneno || acao.consomePerjurio || acao.sustentarPorTurno || acao.usosDeOutroItemNome
        || acao.aprenderMagia || acao.escolherBeneficioMarca || acao.condicaoEmMimExtraUuid || acao.danoExtraEmCritico || acao.acumulosExtraSePrioridade
        || acao.condicoesEscolhidasAcumulosFormula || acao.usaPerguntarPrioridade || acao.usaPerguntarQuantidadeMana || (acao.armaEscolhidaTipos ?? []).length),
      _poderosaConfigurada: !!(acao.condensarDobraAcumulos || acao.condensarDobraDanoDado || acao.condensarSustentarSemCusto || acao.condensarAlcanceExtraMetros || (acao.condensarModificadores ?? []).length),
      _cargasViaConsumivel: acao.cargasFonte === "consumivel",
      _resistirMovimento: !!(acao.usaEmpurrar || (acao.usaMoverEscolhendo && acao.moverQuem === "alvo")),
      condicoesAplicadas: await Promise.all((acao.condicoesAplicadas ?? []).map(async c => ({
        ...c,
        nomeResolvido: await this._nomeParaUuid(c.uuid)
      }))),
      condicoesAlvoMultiplasView: await Promise.all((acao.condicoesAlvoMultiplas ?? []).map(async (uuid, ci) => ({
        uuid, index: ci, nomeResolvido: await this._nomeParaUuid(uuid)
      }))),
      condicoesEscolhidasOpcoesView: await Promise.all((acao.condicoesEscolhidasOpcoes ?? []).map(async (uuid, ci) => ({
        uuid, index: ci, nomeResolvido: await this._nomeParaUuid(uuid), rotulo: (acao.condicoesEscolhidasRotulos ?? [])[ci] ?? ""
      }))),
      condicaoAlvoNome: await this._nomeParaUuid(acao.condicaoAlvoUuid),
      condicaoPropriaNome: await this._nomeParaUuid(acao.condicaoPropriaUuid),
      condicaoPropriaNome2: await this._nomeParaUuid(acao.condicaoPropriaUuid2),
      usosMaxBonusCondicaoNome: await this._nomeParaUuid(acao.usosMaxBonusCondicaoUuid),
      contagemAreaNome: await this._nomeParaUuid(acao.contagemAreaUuid),
      condicaoEmMimNome: await this._nomeParaUuid(acao.condicaoEmMimUuid),
      curaExcedenteCondicaoNome: await this._nomeParaUuid(acao.curaExcedenteCondicaoUuid),
      armaEscolhidaTiposView: Object.keys(ARMA_TIPOS).filter(t => t !== "Escudo").map(t => ({ tipo: t, marcado: (acao.armaEscolhidaTipos ?? []).includes(t) })),
      // Mesmo motivo do "emanacaoCorAtual" - um <input type="color"> nunca
      // fica vazio, então mostra a cor do jogador só como valor de
      // exibição quando o campo está em branco.
      templateCorAtual: acao.templateCor || game.user.color?.css || "#a15c2e",
      condicaoAoDefletirNome: await this._nomeParaUuid(acao.condicaoAoDefletir),
      condicaoAoContraAtacarNome: await this._nomeParaUuid(acao.condicaoAoContraAtacar),
      templatePersistenteCondicaoNome: await this._nomeParaUuid(acao.templatePersistenteCondicaoUuid),
      templatePersistenteCondicaoPresencaNome: await this._nomeParaUuid(acao.templatePersistenteCondicaoPresencaUuid)
    })));

    // Idem pro "evolui para" de uma Condição
    if (context.isCondicao) {
      context.proximaEvolucaoNome = await this._nomeParaUuid(item.system.proximaEvolucaoUuid);
      context.rankVemDeItemNome = await this._nomeParaUuid(item.system.rankVemDeItemUuid);
    }

    // Idem pro Veneno Carregado de uma Arma
    if (context.isArma) {
      context.venenoCarregadoNome = await this._nomeParaUuid(item.system.venenoCarregado);
      // Lista de Consumíveis do MESMO Ator que possui esta arma, pra
      // escolher qual usar como fonte de cargas do veneno (ver
      // "venenoCargasConsumivelId") - só existe sentido nisso quando o
      // item já está DENTRO de um Ator (equipado), não solto num
      // compêndio ou na sidebar.
      if (item.actor) {
        context.consumiveisDoAtor = item.actor.items
          .filter(i => i.type === "consumivel")
          .map(i => ({ id: i.id, nome: i.name, quantidade: i.system.quantidade ?? 0, selecionado: i.id === item.system.venenoCargasConsumivelId }));
      }
    }

    // GRUPO DE JOGADORES: resolve nome/imagem de cada membro (por Actor UUID)
    if (context.isGrupo) {
      const pctSeguro = (value, max) => max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
      const campoRecurso = (value, max) => ({ value, max, pct: pctSeguro(value, max) });

      context.membrosView = await Promise.all((item.system.membros ?? []).map(async (m, i) => {
        const actor = m.actorUuid ? await fromUuid(m.actorUuid) : null;
        // Recursos puxados DIRETO do actor.system a cada renderização - não
        // é uma cópia guardada no item "grupo" (que ficaria desatualizada),
        // é sempre o valor atual de verdade. O Hook "updateActor" (ver mais
        // abaixo) força essa ficha a re-renderizar sozinha sempre que
        // QUALQUER membro cadastrado mudar algo na ficha dele.
        // Cores iguais às da ficha do personagem (inclusive as que ele customizou).
        const coresPadrao = { vida: ["#1b4d2e", "#4caf50"], mana: ["#1b3a4d", "#4a90d9"], estaminaCombate: ["#4d1b1b", "#e53935"], dadosDestino: ["#3d1b4d", "#9c5fc7"], stress: ["#4d3a1b", "#cca162"] };
        const comCor = (chave, valor, max) => {
          let b = null; try { b = chave !== "stress" ? actor.sheet?._prepararBarraRecurso?.(chave) : null; } catch (err) { b = null; }
          return { ...campoRecurso(valor, max), cor1: b?.cor1 || coresPadrao[chave][0], cor2: b?.cor2 || coresPadrao[chave][1] };
        };
        const recursos = actor ? {
          vida: comCor("vida", actor.system.vida?.value ?? 0, actor.system.vida?.max ?? 0),
          mana: comCor("mana", actor.system.mana?.value ?? 0, actor.system.mana?.max ?? 0),
          estaminaCombate: comCor("estaminaCombate", actor.system.estaminaCombate?.value ?? 0, actor.system.estaminaCombate?.max ?? 0),
          dadosDestino: comCor("dadosDestino", actor.system.dadosDestino?.value ?? 0, actor.system.dadosDestino?.max ?? 0),
          stress: comCor("stress", actor.system.stress?.value ?? 0, actor.system.stress?.max ?? 0)
        } : null;
        // "classe"/"nivel" já são campos DIRETOS do Ator (não precisam
        // resolver um item de Classe equipado pra achar isso).
        return {
          index: i, actorUuid: m.actorUuid, nome: actor?.name ?? "⚠ não encontrado",
          img: actor?.img ?? "icons/svg/mystery-man.svg", ameaca: m.ameaca ?? 0, recursos,
          classe: actor?.system?.classe || "", nivel: actor?.system?.nivel ?? null
        };
      }));

      // Médias do grupo - só considera membros com ator encontrado de
      // verdade (ignora entradas "não encontrado"), e só entra na conta se
      // pelo menos 1 membro válido existir (senão fica tudo zerado, o que
      // seria enganoso mostrar como "média").
      const membrosComRecurso = context.membrosView.filter(mv => mv.recursos);
      if (membrosComRecurso.length) {
        const media = campo => Math.round(membrosComRecurso.reduce((soma, mv) => soma + mv.recursos[campo].value, 0) / membrosComRecurso.length);
        const mediaMax = campo => Math.round(membrosComRecurso.reduce((soma, mv) => soma + mv.recursos[campo].max, 0) / membrosComRecurso.length);
        const campoMedia = campo => campoRecurso(media(campo), mediaMax(campo));
        context.mediasGrupo = {
          vida: campoMedia("vida"),
          mana: campoMedia("mana"),
          estaminaCombate: campoMedia("estaminaCombate"),
          dadosDestino: campoMedia("dadosDestino"),
          stress: campoMedia("stress")
        };
      } else {
        context.mediasGrupo = null;
      }

      // inventarioView: cópia de "system.inventario" só pra EXIBIÇÃO, com
      // a flag de "expandida" resolvida (guardada só em memória, não é
      // salva no item - ver "#inventarioExpandido").
      context.inventarioView = (item.system.inventario ?? []).map((entrada, i) => ({
        ...entrada, index: i, expandida: this.#inventarioExpandido.has(i)
      }));

      // notasView: resolve cada "journalUuid" pro Documento de Diário DE
      // VERDADE (nome/ícone puxados dele, não guardados aqui) - uma
      // referência "quebrada" (Diário apagado por fora) aparece como
      // aviso, mas não quebra o resto da ficha.
      context.notasView = await Promise.all((item.system.notas ?? []).map(async (n, i) => {
        const journal = n.journalUuid ? await fromUuid(n.journalUuid) : null;
        return { index: i, journalUuid: n.journalUuid, nome: journal?.name ?? "⚠ Diário não encontrado", encontrado: !!journal };
      }));
    }

    // CLASSE: monta a view de níveis ORDENADA por número de nível (a lista
    // guardada não precisa estar em ordem - "_index" é o índice REAL no
    // array, usado por todo data-field/data-action pra editar/remover o
    // nível certo mesmo depois de ordenar pra exibição), e resolve o nome de
    // cada UUID (itens concedidos e "sobe o rank de") só pra confirmação
    // visual - "→ Nome do item".
    if (context.isClasse) {
      const comIndice = (item.system.niveis ?? []).map((n, i) => ({ ...n, _index: i }));
      comIndice.sort((a, b) => (a.nivel ?? 0) - (b.nivel ?? 0));
      {
        const eqCfg = this.item.system.equipamentoRecomendado ?? {};
        const marcadasEq = new Set(eqCfg.categorias ?? []);
        const listaEq = Object.entries(NAUREN_EQUIP_CATEGORIAS).map(([chave, c]) => ({ chave, nome: c.nome, grupo: c.grupo, marcada: marcadasEq.has(chave) }));
        context.equipCategoriasArmas = listaEq.filter(c => c.grupo === "arma");
        context.equipCategoriasArmaduras = listaEq.filter(c => c.grupo === "armadura");
        context.equipRecomendadoResumo = naurenResumoEquipamentoClasse(eqCfg);
        context.equipLivroDisponivel = !!NAUREN_EQUIPAMENTO_CLASSE_LIVRO[this.item.system.identifier];
      }
      context.niveisView = await Promise.all(comIndice.map(async n => ({
        ...n,
        itensConcedidos: await Promise.all((n.itensConcedidos ?? []).map(async it => ({
          ...it, nomeResolvido: await this._nomeParaUuid(it.uuid)
        }))),
        upgradesDeRank: await Promise.all((n.upgradesDeRank ?? []).map(async up => ({
          ...up, nomeResolvido: await this._nomeParaUuid(up.uuidOrigem)
        }))),
        escolhaItens: {
          ...n.escolhaItens,
          itensDisponiveis: await Promise.all((n.escolhaItens?.itensDisponiveis ?? []).map(async it => ({
            ...it, nomeResolvido: await this._nomeParaUuid(it.uuid)
          })))
        }
      })));

      // Recursos Próprios da Classe - mesmo padrão da Subclasse (ver
      // NaurenSubclasseSheet._prepareContext), resolvendo o nome de cada
      // "Condição ao Atingir o Máximo" só pra confirmação visual.
      context.recursosDeclaradosView = await Promise.all((item.system.recursosDeclarados ?? []).map(async r => ({
        ...r,
        condicaoAoAtingirMaxNome: await this._nomeParaUuid(r.condicaoAoAtingirMax)
      })));
    }

    // Mesma coisa, mas pra uma Habilidade (ver
    // NaurenHabilidadeData#recursosDeclarados) - só populado aqui fora do
    // "if (context.isClasse)" acima, já que Habilidade é um tipo
    // diferente com seu próprio bloco na UI.
    if (context.isHabilidade) {
      context.recursosDeclaradosView = await Promise.all((item.system.recursosDeclarados ?? []).map(async r => ({
        ...r,
        condicaoAoAtingirMaxNome: await this._nomeParaUuid(r.condicaoAoAtingirMax)
      })));
    }

    const { TextEditor } = foundry.applications.ux;
    context.enrichedDescricao = await (foundry.applications?.ux?.TextEditor?.implementation ?? TextEditor).enrichHTML(item.system.descricao ?? "", {
      secrets: item.isOwner,
      relativeTo: item
    });

    if (["habilidade", "condicao", "efeito"].includes(this.item.type)) {
      const marcadas = new Set(this.item.system.capacidades ?? []);
      context.capacidadesLista = Object.entries(NAUREN_CAPACIDADES).map(([chave, c]) => ({ chave, nome: c.nome, desc: c.desc, marcada: marcadas.has(chave) }))
        .sort((a, b) => (b.marcada - a.marcada) || a.nome.localeCompare(b.nome));
      context.capacidadesMarcadas = marcadas.size;
    }
    context.opcoesListaEfeitos = ["escolherCondicaoEmMim"];
    context.recursoMovimentoOpcoes = { mana: "Mana", estamina: "Estamina", vida: "Vida", destino: "Dado de Destino", estresse: "Estresse", "recursoCustom:energia": "Energia", "recursoCustom:determinacao": "Determinação", "recursoCustom:ofuscacao": "Ofuscação" };
    context.recursoAlternativoOpcoes = { "": "— nenhum (sem escolha) —", "recursoCustom:determinacao": "Determinação", "recursoCustom:ofuscacao": "Ofuscação", "recursoCustom:energia": "Energia",
      mana: "Mana", estaminaCombate: "Estamina", vida: "Vida", dadosDestino: "Dado de Destino" };
    {
      const it = this.item, sy = it.system ?? {};
      const tipos = { habilidade: "Habilidade", magia: "Magia", arma: "Arma", armadura: "Armadura", consumivel: "Consumível", condicao: "Condição", efeito: "Efeito", cor: "Pigmento", peculiaridade: "Peculiaridade", classe: "Classe", subclasse: "Subclasse", grupo: "Grupo" };
      const et = [tipos[it.type] ?? it.type];
      if (it.type === "magia" && sy.ehMagiaDeMago) et.push("Magia de Mago");
      if (it.type === "arma") { const cat = naurenCategoriaDaArma(it); if (cat) et.push(cat); if (sy.usaMunicao) et.push(`usa ${sy.tipoMunicao || "munição"}`); }
      if (it.type === "consumivel" && sy.ehMunicao) et.push("Munição");
      if (it.type === "consumivel" && sy.venenoCondicaoUuid) et.push("Frasco de veneno");
      if (it.type === "condicao" && sy.ehVeneno) et.push("Veneno");
      if (it.type === "condicao" && sy.acumulativel) et.push("Acumulável");
      const pri = { PI: "Prioridade para o inimigo", PA: "Prioridade para um aliado", NP: "Não gera Prioridade" }[sy.prioridadeIndicador];
      if (pri) et.push(pri);
      if ((sy.capacidades ?? []).length) et.push(`${sy.capacidades.length} capacidade(s) especial(is)`);
      context.etiquetasCabecalho = et;
      // Frase-resumo da aba Geral (arma, armadura, consumível, munição, frasco).
      {
        const escG = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
        const emG = v => `<em>${escG(v)}</em>`;
        const nomeU = u => { try { return fromUuidSync(u)?.name ?? "?"; } catch (err) { return "?"; } };
        const legivelG = f => String(f ?? "").replace(/@poderAtaque/g, "PdA").replace(/@poderMagia/g, "PdM").replace(/\s*\+\s*/g, " + ");
        const fr = [];
        if (it.type === "arma") {
          const a0 = (sy.acoes ?? [])[0];
          const dano = a0?.danos?.[0]?.formula;
          fr.push(`Arma ${emG(naurenCategoriaDaArma(it) || "sem categoria")}${dano ? `: ${emG(legivelG(dano))} de dano` : ""}${a0?.alcance ? `, alcance ${escG(a0.alcance)}` : ""}.`);
          if (sy.usaMunicao) {
            const comp = it.actor ? naurenMunicoesCompativeis(it.actor, it) : [];
            const emUso = comp.find(m => m.id === sy.municaoSelecionadaId) ?? comp[0];
            fr.push(`Usa ${emG(sy.tipoMunicao || "munição")}${it.actor ? (emUso ? ` (em uso: ${escG(emUso.name)} ×${emUso.system.quantidade ?? 0})` : " (sem munição no inventário)") : ""}.`);
          }
          if (sy.venenoCarregado) fr.push(`Veneno: ${emG(nomeU(sy.venenoCarregado))}${sy.venenoGolpesRestantes ? `, ${sy.venenoGolpesRestantes} golpe(s)` : ", até ser removido"}.`);
        } else if (it.type === "armadura") {
          fr.push(`Defesa ${emG(`+${sy.defesaBonus ?? 0}`)}${sy.tipo ? ` (${escG(sy.tipo)})` : ""}.`);
        } else if (it.type === "consumivel") {
          fr.push(`${emG(`${sy.quantidade ?? 0}${sy.quantidadeMax ? ` de ${sy.quantidadeMax}` : ""}`)} no inventário.`);
          if (sy.ehMunicao) fr.push(`Munição do tipo ${emG(sy.tipoMunicao || "qualquer")}${sy.municaoDanoExtra ? `, +${escG(sy.municaoDanoExtra)} de dano` : ""}${sy.municaoVenenoUuid ? `, veneno ${escG(nomeU(sy.municaoVenenoUuid))} (${sy.municaoVenenoTodas ? "todas" : `${sy.municaoVenenoQuantidade ?? 0} envenenadas`})` : ""}.`);
          if (sy.venenoCondicaoUuid) fr.push(`Frasco de ${emG(nomeU(sy.venenoCondicaoUuid))}: aplica numa arma ou munição.`);
          if (!sy.ehMunicao && !(sy.acoes ?? []).length && sy.efeito) fr.push(`Ao usar: ${escG(sy.efeito)}.`);
        }
        context.resumoGeral = fr.join(" ");
      }
      // Frase-resumo da aba Passivas: o que este item faz sozinho, sem ser usado.
      const escP = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
      const emP = v => `<em>${escP(v)}</em>`;
      const pl = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
      const partesP = [];
      const gat = (sy.gatilhos ?? []);
      if (gat.length) {
        const quando = [...new Set(gat.map(g => String(NAUREN_GATILHO_EVENTO_OPCOES[g.evento] ?? g.evento ?? "").replace(/\s*\(.*\)$/, "").toLowerCase()))].slice(0, 3);
        partesP.push(`${emP(pl(gat.length, "gatilho", "gatilhos"))} (${escP(quando.join("; "))})`);
      }
      const ef = (sy.efeitosEmAtaques ?? []).filter(e => e.ativo !== false);
      if (ef.length) partesP.push(emP(pl(ef.length, "efeito nos seus ataques", "efeitos nos seus ataques")));
      if ((sy.modificadores ?? []).length) partesP.push(emP(pl(sy.modificadores.length, "modificador", "modificadores")));
      if ((sy.capacidades ?? []).length) partesP.push(emP(pl(sy.capacidades.length, "capacidade especial", "capacidades especiais")));
      if ((sy.bonusCondicionalAoAlvo ?? []).length) partesP.push(emP(pl(sy.bonusCondicionalAoAlvo.length, "bônus contra alvo com Condição", "bônus contra alvos com Condição")));
      if ((sy.efeitosVinculados ?? []).length) partesP.push(emP(pl(sy.efeitosVinculados.length, "efeito vinculado", "efeitos vinculados")));
      const custosP = (sy.reduzCustoEstamina ?? []).length + (sy.ajusteCustoMana ?? []).length + (sy.pagarCustoCom ?? []).length;
      if (custosP) partesP.push(emP(pl(custosP, "ajuste de custo", "ajustes de custo")));
      if ((sy.bonusDanoPeriodico ?? []).length) partesP.push(emP("bônus no dano periódico"));
      if (sy.danoRecebidoPercentual) partesP.push(emP(`−${sy.danoRecebidoPercentual}% de dano recebido`));
      if (sy.usaTransformacao) partesP.push(emP("transforma o token"));
      if (sy.usaConcederItem) partesP.push(emP("concede um item"));
      if (sy.usaEmanacao) partesP.push(emP("emanação (aura)"));
      if ((sy.tiposEstudo ?? []).length) partesP.push(emP(pl(sy.tiposEstudo.length, "tipo de estudo", "tipos de estudo")));
      context.resumoPassivas = partesP.length ? `Funciona sozinho: ${partesP.join(", ")}.` : "Nenhuma passiva configurada ainda. Use as seções abaixo para criar.";
    }
    context.venenoModoOpcoes = { auto: "Automático (corpo-a-corpo: efeito único; lança e à distância: cravado)", curto: "Efeito único (age 1 vez e sai)", cravado: "Cravado (fica até ser removido)" };
    context.efeitoAtaqueTipoOpcoesComVazio = { "": "Qualquer ataque", basico: "Só ataques básicos", pesado: "Só ataques pesados", especial: "Só ataques especiais (habilidades)", pesadoOuEspecial: "Pesados e especiais" };
    context.armaTiposLista = Object.keys(ARMA_TIPOS).filter(t => !["Escudo", "Classe", "Subclasse"].includes(t));
    context.virarPaginaOpcoes = { "0": "— não —", "1": "Virar para frente", "-1": "Voltar", "99": "Ir para a página marcada" };
    context.beneficioMarcaOpcoes = { "": "— qualquer —", focoMortal: "Foco Mortal", tiroLetal: "Tiro Letal", reflexos: "Reflexos de Caça" };
    return context;
  }

  /**
   * @override
   * Depois de renderizar, liga um listener em todo campo com data-field
   * (dentro de uma Ação, ou dentro da lista de Efeitos Vinculados do
   * próprio item). Esses campos não podem usar o salvamento automático
   * nativo do formulário (name="system.X") - o Foundry, ao salvar um
   * ArrayField de objetos, reconstrói o elemento inteiro daquele índice a
   * partir do que foi enviado, preenchendo com o valor padrão do schema
   * qualquer campo que não veio junto. Como o formulário nativo só envia o
   * campo que mudou, isso "resetava" os outros campos daquele elemento a
   * cada edição. A correção: cada campo salva manualmente, sempre
   * reenviando a lista INTEIRA daquele campo raiz (igual os botões de
   * +Adicionar/Remover já faziam).
   */
  _onRender(context, options) {
    // Campos de fórmula: botão ƒ com os termos disponíveis (insere no cursor).
    naurenBotoesDeFormula(this.element, { actor: this.item.actor ?? null, item: this.item });
    // Dicas longas ficam em 2 linhas; clicar abre o resto.
    this.element.querySelectorAll(".item-meta-hint").forEach(p => {
      if (p.dataset.naurenDica) return;
      p.dataset.naurenDica = "1";
      p.addEventListener("click", () => p.classList.toggle("aberta"));
    });
    // Abas da ficha de item: troca sem redesenhar, lembra a escolha e esconde abas vazias.
    {
      const botoes = [...this.element.querySelectorAll(".nauren-aba-botao")];
      const paineis = [...this.element.querySelectorAll(".nauren-aba-painel")];
      const temConteudo = pn => !!pn.querySelector("input, select, textarea, img, prose-mirror, .editor") || pn.textContent.trim().length > 0;
      // Aba que não serve para este tipo de item some.
      const visiveis = new Set(paineis.filter(temConteudo).map(pn => pn.dataset.aba));
      botoes.forEach(b => { b.hidden = !visiveis.has(b.dataset.aba); });
      const mostrar = aba => {
        this._abaItem = aba;
        botoes.forEach(b => b.classList.toggle("ativa", b.dataset.aba === aba));
        paineis.forEach(pn => pn.classList.toggle("ativa", pn.dataset.aba === aba));
        requestAnimationFrame(() => naurenAjustarListasLargas(this.element));
      };
      const inicial = [this._abaItem, context.temAcoes ? "acoes" : null, "geral", "passivas", "descricao", "avancado"].find(a => a && visiveis.has(a)) ?? "geral";
      mostrar(inicial);
      botoes.forEach(b => b.addEventListener("click", ev => { ev.preventDefault(); mostrar(b.dataset.aba); }));
    }
    naurenPersistirDetalhesAbertos(this);
    // Lista com texto maior que a caixa: passar o mouse mostra a opção escolhida inteira.
    this.element.querySelectorAll("select").forEach(sel => {
      const titulo = () => { const t = sel.selectedOptions?.[0]?.textContent?.trim() ?? ""; if (t) sel.title = t; };
      titulo();
      sel.addEventListener("change", () => { titulo(); naurenAjustarListasLargas(this.element); });
    });
    // Opção escolhida maior que a caixa: a caixa ganha a linha inteira (ver naurenAjustarListasLargas).
    requestAnimationFrame(() => naurenAjustarListasLargas(this.element));
    this.element.querySelectorAll("details").forEach(d => d.addEventListener("toggle", () => naurenAjustarListasLargas(this.element)));
    super._onRender(context, options);
    if (this.item.type === "grupo") this._ligarAbasGrupo();
    this._ligarScrollItemBody();
    this.element.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('change', ev => this._onArrayFieldChange(ev));
    });

    // Campos de UUID (Condição/Efeito aplicados por uma Ação, "evolui para"):
    // aceitam colar um UUID copiado (menu "..." > Copy Document UUID no
    // topo da ficha do item) OU arrastar o item direto da barra lateral/
    // compendium pra cima do campo.
    naurenMostrarNomesDosCamposUuid(this.element, this.item?.actor ?? this.document?.actor ?? null);
    this.element.querySelectorAll('.nauren-uuid-input').forEach(el => {
      el.addEventListener('dragover', ev => ev.preventDefault());
      el.addEventListener('drop', async ev => {
        ev.preventDefault();
        let dados;
        try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
        const uuid = dados?.uuid;
        if (!uuid) { ui.notifications.warn("Isso não parece ser um item válido pra arrastar aqui."); return; }
        el.value = uuid;
        if (el.dataset.field) {
          await this._onArrayFieldChange({ currentTarget: el, stopPropagation() {} });
        } else if (el.name) {
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });

    // Área de soltar Atores no Grupo de Jogadores (arraste o retrato do
    // personagem, ou o próprio Ator na sidebar, pra cima da caixa).
    this.element.querySelectorAll('.nauren-grupo-dropzone').forEach(el => {
      el.addEventListener('dragover', ev => ev.preventDefault());
      el.addEventListener('drop', async ev => {
        ev.preventDefault();
        let dados;
        try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
        if (dados?.type !== "Actor" || !dados.uuid) {
          ui.notifications.warn("Arraste um Personagem (a ficha ou o retrato dele) pra cima desta área.");
          return;
        }
        const jaTem = (this.item.system.membros ?? []).some(m => m.actorUuid === dados.uuid);
        if (jaTem) { ui.notifications.info("Este personagem já está no Grupo."); return; }
        await this._enfileirarArray("membros", arr => arr.push({ actorUuid: dados.uuid }));
      });
    });

    // Área de soltar Itens no Inventário Compartilhado do Grupo (arraste
    // um Item de dentro de uma ficha, da sidebar, ou de um compêndio) -
    // resolve o Item de verdade só pra puxar nome/quantidade/imagem no
    // momento do drop; depois disso vira só texto no "inventario" (não
    // fica um vínculo vivo com o Item original - se ele mudar depois, a
    // entrada aqui não atualiza sozinha, é só uma cópia de referência).
    this.element.querySelectorAll('.nauren-grupo-item-dropzone').forEach(el => {
      el.addEventListener('dragover', ev => ev.preventDefault());
      el.addEventListener('drop', async ev => {
        ev.preventDefault();
        let dados;
        try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
        if (dados?.type !== "Item" || !dados.uuid) {
          ui.notifications.warn("Arraste um Item pra cima desta área.");
          return;
        }
        const itemArrastado = await fromUuid(dados.uuid);
        if (!itemArrastado) { ui.notifications.warn("Não consegui encontrar esse Item."); return; }
        const quantidadeArrastada = itemArrastado.system?.quantidade ?? 1;
        await this._enfileirarArray("inventario", arr => arr.push({ nome: itemArrastado.name, quantidade: quantidadeArrastada, notas: "", img: itemArrastado.img || "icons/svg/item-bag.svg" }));
      });
    });

    // Área de soltar um JournalEntry JÁ EXISTENTE (arrastado da barra
    // lateral) pra vincular ao Grupo, sem precisar criar um novo.
    this.element.querySelectorAll('.nauren-grupo-journal-dropzone').forEach(el => {
      el.addEventListener('dragover', ev => ev.preventDefault());
      el.addEventListener('drop', async ev => {
        ev.preventDefault();
        let dados;
        try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
        if (dados?.type !== "JournalEntry" || !dados.uuid) {
          ui.notifications.warn("Arraste um Diário (JournalEntry) da barra lateral pra cima desta área.");
          return;
        }
        const jaTem = (this.item.system.notas ?? []).some(n => n.journalUuid === dados.uuid);
        if (jaTem) { ui.notifications.info("Este Diário já está vinculado."); return; }
        await this._enfileirarArray("notas", arr => arr.push({ journalUuid: dados.uuid }));
      });
    });

    // Recursos Próprios da Classe (mesmo campo/padrão que a Subclasse já
    // usa - ver NaurenSubclasseSheet._onRecursoFieldChange).
    this.element.querySelectorAll('[data-recurso-field]').forEach(el => {
      el.addEventListener('change', ev => this._onRecursoFieldChange(ev));
    });
    this.element.querySelectorAll('.nauren-uuid-input[data-recurso-field]').forEach(el => {
      el.addEventListener('dragover', ev => ev.preventDefault());
      el.addEventListener('drop', async ev => {
        ev.preventDefault();
        let dados;
        try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
        if (!dados?.uuid) { ui.notifications.warn("Isso não parece ser um item válido pra arrastar aqui."); return; }
        el.value = dados.uuid;
        await this._onRecursoFieldChange({ currentTarget: el });
      });
    });
  }

  /** Handler genérico dos campos de "Recursos Declarados" (data-recurso-field, dentro de um bloco com data-recurso-index) - mesma lógica de NaurenSubclasseSheet, duplicada aqui pra Classe (não vale a pena herdar/misturar as duas classes de ficha só por isto). */
  async _onRecursoFieldChange(event) {
    const el = event.currentTarget;
    const campo = el.dataset.recursoField;
    const index = Number(el.closest("[data-recurso-index]")?.dataset.recursoIndex);
    if (!campo || Number.isNaN(index)) return;
    const lista = foundry.utils.deepClone(this.item.system.recursosDeclarados ?? []);
    if (!lista[index]) return;
    lista[index][campo] = el.type === "checkbox" ? el.checked : el.value;
    await this.item.update({ "system.recursosDeclarados": lista });
  }

  /** Resolve um UUID de item pra um texto curto de confirmação (ou aviso se não achar). */
  async _nomeParaUuid(uuid) {
    if (typeof uuid === "string" && uuid.startsWith("self:")) {
      const nome = uuid.slice(5).trim();
      const ator = this.item?.actor;
      if (!ator) return `${nome} (Condição da criatura)`;
      const it = ator.items.find(i => (i.type === "condicao" || i.type === "efeito") && i.name.trim().toLowerCase() === nome.toLowerCase());
      if (it) return `${it.name} (Condição desta criatura)`;
      if (naurenCondicaoDoSistemaPorNome(nome)) return `${nome} (Condição do sistema)`;
      return `⚠ "${nome}" não existe na ficha nem nas Condições do sistema`;
    }
    return naurenNomeParaUuid(uuid);
  }

  /** Salva um campo isolado de dentro de "acoes" ou "efeitosVinculados", sempre pela fila daquele campo. */
  async _onArrayFieldChange(event) {
    event.stopPropagation(); // evita o auto-save nativo do formulário disparar em cima
    const el = event.currentTarget;
    const path = el.dataset.field; // ex: "acoes.0.danos.1.formula" ou "efeitosVinculados.0.ativo"
    if (!path) return;

    let value;
    if (el.type === "checkbox") value = el.checked;
    else if (el.type === "number") value = el.value === "" ? 0 : Number(el.value);
    else value = el.value;

    const campoRaiz = path.split(".")[0];

    // Auto-seleção do Modo Alvo: a primeira vez que o jogador marca "É um
    // teste de ataque" ou "Cria uma área no mapa", o Modo Alvo é
    // preenchido automaticamente com a opção correspondente. Isso só
    // ocorre enquanto o Modo Alvo permanecer no valor padrão "nenhum" e
    // nunca tiver sido alterado - uma vez definido (automática ou
    // manualmente), a automação não volta a mexer nele.
    const matchEhAtaque = path.match(/^acoes\.(\d+)\.ehAtaque$/);
    const matchUsaTemplate = path.match(/^acoes\.(\d+)\.usaTemplate$/);
    const matchModoAlvo = path.match(/^acoes\.(\d+)\.modoAlvo$/);

    const matchRotulo = path.match(/^acoes\.(\d+)\.condicoesEscolhidasRotulos\.(\d+)$/);
    await this._enfileirarArray(campoRaiz, arr => {
      // Lista de nomes paralela a outra lista: garante que é um array do tamanho certo antes de gravar no índice.
      if (matchRotulo && arr[Number(matchRotulo[1])]) {
        const ac = arr[Number(matchRotulo[1])];
        const rot = Array.isArray(ac.condicoesEscolhidasRotulos) ? ac.condicoesEscolhidasRotulos : [];
        while (rot.length <= Number(matchRotulo[2])) rot.push("");
        ac.condicoesEscolhidasRotulos = rot;
      }
      foundry.utils.setProperty({ [campoRaiz]: arr }, path, value);
      if (matchModoAlvo) {
        const idx = Number(matchModoAlvo[1]);
        if (arr[idx]) arr[idx].modoAlvoTravado = true;
      } else if (value === true && (matchEhAtaque || matchUsaTemplate)) {
        const idx = Number((matchEhAtaque || matchUsaTemplate)[1]);
        const acao = arr[idx];
        if (acao && !acao.modoAlvoTravado && (acao.modoAlvo ?? "nenhum") === "nenhum") {
          acao.modoAlvo = matchEhAtaque ? "selecionado" : "area";
          acao.modoAlvoTravado = true;
        }
      }
    });

    // Campo de UUID (termina em "uuid" tipo "...uuid", ou contém "uuid" no
    // meio tipo "uuidOrigem"): re-renderiza pra mostrar o nome resolvido
    // ("→ Nome do item"). O mesmo vale para os campos acima, já que a
    // automação pode ter mudado o valor exibido no seletor de Modo Alvo.
    if (path.toLowerCase().includes("uuid") || matchEhAtaque || matchUsaTemplate || matchModoAlvo) this.render();
  }

  /** Aplica manualmente qual aba do item "grupo" fica visível (Membros/Itens/Anotações) e guarda a escolha pra sobreviver a um re-render - mesmo padrão de "NaurenActorSheet#_ligarAbas", só com nomes de classe próprios pra não interferir com nenhum outro sistema de aba que exista em outro tipo de item. */
  _ligarAbasGrupo() {
    const abaSalva = this.#abaAtivaGrupo;
    this.element.querySelectorAll('.nauren-grupo-tabs .item').forEach(botao => {
      botao.classList.toggle('active', botao.dataset.tabGrupo === abaSalva);
      botao.addEventListener('click', ev => {
        ev.preventDefault();
        const aba = botao.dataset.tabGrupo;
        this.#abaAtivaGrupo = aba;
        // Trocar de aba de verdade começa do topo - só preserva a rolagem
        // quando é a MESMA aba re-renderizando (ex: clicou +/- em algo nela).
        this.#scrollItemBody = 0;
        const corpo = this.element.querySelector('.nauren-sheet.item-sheet');
        if (corpo) corpo.scrollTop = 0;
        this.element.querySelectorAll('.nauren-grupo-tabs .item').forEach(b => b.classList.toggle('active', b === botao));
        this.element.querySelectorAll('.nauren-grupo-tab-painel').forEach(t => t.classList.toggle('active', t.dataset.tabGrupo === aba));
      });
    });
    this.element.querySelectorAll('.nauren-grupo-tab-painel').forEach(t => t.classList.toggle('active', t.dataset.tabGrupo === abaSalva));
  }

  /**
   * Restaura manualmente a posição de rolagem da ficha de Item entre um
   * render e outro - mesmo problema/solução já usados em
   * "NaurenActorSheet#_ligarScrollSheetBody": qualquer clique que dispare
   * um re-render (ex: +/- do Nível de Perigo, trocar quantidade do
   * Inventário) sem isso sempre jogava a ficha de volta pro topo.
   */
  _ligarScrollItemBody() {
    const corpo = this.element.querySelector('.nauren-sheet.item-sheet');
    if (!corpo) return;
    corpo.scrollTop = this.#scrollItemBody;
    corpo.addEventListener('scroll', () => {
      this.#scrollItemBody = corpo.scrollTop;
    });
  }

  /**
   * Handler de clique no retrato do item, para trocar a imagem (data-action="editImage").
   * @this {NaurenItemSheet}
   */
  static async onEditImage(event, target) {
    const current = this.item.img;
    const FilePickerImpl = foundry.applications.apps.FilePicker.implementation;
    const fp = new FilePickerImpl({
      type: "image",
      current,
      callback: path => this.item.update({ img: path }),
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    return fp.browse();
  }

  /** Escolhe a imagem de "Transformação de Token" (Condição/Efeito) - mesmo padrão de onEditImage, mas grava em system.transformacaoImagem em vez de img. */
  /** Imagem do token de uma entidade de campo (por Ação). */
  static async onEscolherImagemEntidade(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const atual = this.item.system.acoes?.[acaoIndex]?.entidadeImagem || this.item.img;
    const FilePickerImpl = foundry.applications.apps.FilePicker.implementation;
    const fp = new FilePickerImpl({
      type: "image",
      current: atual,
      callback: caminho => this._enfileirarArray("acoes", acoes => { if (acoes[acaoIndex]) acoes[acaoIndex].entidadeImagem = caminho; }),
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    return fp.browse();
  }

  static async onEscolherImagemTransformacao(event, target) {
    const current = this.item.system.transformacaoImagem || this.item.img;
    const FilePickerImpl = foundry.applications.apps.FilePicker.implementation;
    const fp = new FilePickerImpl({
      type: "image",
      current,
      callback: path => this.item.update({ "system.transformacaoImagem": path }),
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    return fp.browse();
  }

  /** Limpa a Cor customizada da Emanação, voltando a usar a cor do jogador. */
  static async onLimparCorEmanacao(event, target) {
    await this.item.update({ "system.emanacaoCor": "" });
  }

  /** Adiciona uma Ação nova no fim da lista. */
  /** Gatilho "escolher Condição em mim": adiciona/remove uma opção da lista. */
  static async onAddOpcaoGatilho(event, target) {
    const gi = Number(target.dataset.gatilho);
    const campo = this.element.querySelector(`.nauren-opcao-nova[data-gatilho="${gi}"]`);
    const uuid = String(campo?.value ?? "").trim();
    if (!uuid) { ui.notifications.info("Arraste uma Condição para o campo antes de adicionar."); return; }
    const gatilhos = foundry.utils.deepClone(this.item.system.gatilhos ?? []);
    if (!gatilhos[gi]) return;
    gatilhos[gi].opcoesUuids = [...new Set([...(gatilhos[gi].opcoesUuids ?? []), uuid])];
    await this.item.update({ "system.gatilhos": gatilhos });
  }
  /** Imunidade a Condições (M08): adiciona/remove uma Condição da lista do item. */
  static async onAddImunidade(event, target) {
    const campo = this.element.querySelector(".nauren-imunidade-nova");
    const ref = String(campo?.value ?? "").trim();
    if (!ref) { ui.notifications.info("Arraste uma Condição para o campo (ou escreva o nome) antes de adicionar."); return; }
    const lista = [...new Set([...(this.item.system.imunidadesCondicoes ?? []), ref])];
    await this.item.update({ "system.imunidadesCondicoes": lista });
  }
  static async onRemoveImunidade(event, target) {
    const lista = [...(this.item.system.imunidadesCondicoes ?? [])];
    lista.splice(Number(target.dataset.index), 1);
    await this.item.update({ "system.imunidadesCondicoes": lista });
  }
  static async onRemoveOpcaoGatilho(event, target) {
    const gi = Number(target.dataset.gatilho);
    const gatilhos = foundry.utils.deepClone(this.item.system.gatilhos ?? []);
    if (!gatilhos[gi]) return;
    (gatilhos[gi].opcoesUuids ?? []).splice(Number(target.dataset.index), 1);
    await this.item.update({ "system.gatilhos": gatilhos });
  }
  /** "Criar um consumível": adiciona/remove uma opção da lista de escolha. */
  static async onAddOpcaoConsumivel(event, target) {
    const ai = Number(target.dataset.acaoIndex);
    const campo = this.element.querySelector(`.nauren-opcao-consumivel[data-acao-index="${ai}"]`);
    const uuid = String(campo?.value ?? "").trim();
    if (!uuid) { ui.notifications.info("Arraste um consumível para o campo antes de adicionar."); return; }
    const acoes = foundry.utils.deepClone(this.item.system.acoes ?? []);
    if (!acoes[ai]) return;
    acoes[ai].consumivelCriadoOpcoesUuids = [...new Set([...(acoes[ai].consumivelCriadoOpcoesUuids ?? []), uuid])];
    await this.item.update({ "system.acoes": acoes });
  }
  static async onRemoveOpcaoConsumivel(event, target) {
    const ai = Number(target.dataset.acaoIndex);
    const acoes = foundry.utils.deepClone(this.item.system.acoes ?? []);
    if (!acoes[ai]) return;
    (acoes[ai].consumivelCriadoOpcoesUuids ?? []).splice(Number(target.dataset.index), 1);
    await this.item.update({ "system.acoes": acoes });
  }
  static async onAddPagarMovimento() {
    const lista = foundry.utils.deepClone(this.item.system.pagarMovimentoCom ?? []);
    lista.push({ recurso: "mana", quantidade: "1" });
    await this.item.update({ "system.pagarMovimentoCom": lista });
  }
  static async onRemovePagarMovimento(event, target) {
    const lista = foundry.utils.deepClone(this.item.system.pagarMovimentoCom ?? []);
    lista.splice(Number(target.dataset.index), 1);
    await this.item.update({ "system.pagarMovimentoCom": lista });
  }
  static async onAddUsoExtra() {
    const lista = foundry.utils.deepClone(this.item.system.usosExtrasEm ?? []);
    lista.push({ itemNome: "", valor: "1" });
    await this.item.update({ "system.usosExtrasEm": lista });
  }
  static async onRemoveUsoExtra(event, target) {
    const lista = foundry.utils.deepClone(this.item.system.usosExtrasEm ?? []);
    lista.splice(Number(target.dataset.index), 1);
    await this.item.update({ "system.usosExtrasEm": lista });
  }
  /** Liga/desliga uma capacidade especial do item. */
  /** Classe: liga/desliga uma categoria de equipamento recomendada (Criador de Personagem). */
  static async onToggleEquipCategoria(event, target) {
    const lista = new Set(this.item.system.equipamentoRecomendado?.categorias ?? []);
    const c = target.dataset.chave;
    lista.has(c) ? lista.delete(c) : lista.add(c);
    await this.item.update({ "system.equipamentoRecomendado.categorias": [...lista] });
  }
  /** Classe: volta o equipamento recomendado ao padrão do livro (pelo identifier). */
  static async onEquipPadraoLivro(event, target) {
    const padrao = NAUREN_EQUIPAMENTO_CLASSE_LIVRO[this.item.system.identifier];
    if (!padrao) return ui.notifications.warn("Não há padrão do livro para este identificador.");
    await this.item.update({ "system.equipamentoRecomendado": foundry.utils.deepClone(padrao) });
  }
  static async onToggleCapacidade(event, target) {
    const lista = new Set(this.item.system.capacidades ?? []);
    const c = target.dataset.chave;
    lista.has(c) ? lista.delete(c) : lista.add(c);
    await this.item.update({ "system.capacidades": [...lista] });
  }
  /** Liga/desliga um tipo de arma no filtro "arma escolhida" de uma Ação. */
  static async onToggleArmaTipoAcao(event, target) {
    const idx = Number(target.dataset.acaoIndex);
    const acoes = foundry.utils.deepClone(this.item.system.acoes ?? []);
    if (!acoes[idx]) return;
    const tipos = new Set(acoes[idx].armaEscolhidaTipos ?? []);
    tipos.has(target.dataset.tipo) ? tipos.delete(target.dataset.tipo) : tipos.add(target.dataset.tipo);
    acoes[idx].armaEscolhidaTipos = [...tipos];
    await this.item.update({ "system.acoes": acoes });
  }
  static async onAddAjusteMana() {
    const lista = foundry.utils.deepClone(this.item.system.ajusteCustoMana ?? []);
    lista.push({ valor: "-1", multiplicarPeloRank: false, soMagiaComDano: false, soItemNome: "", minimo: "0" });
    await this.item.update({ "system.ajusteCustoMana": lista });
  }
  static async onRemoveAjusteMana(event, target) {
    const lista = foundry.utils.deepClone(this.item.system.ajusteCustoMana ?? []);
    lista.splice(Number(target.dataset.index), 1);
    await this.item.update({ "system.ajusteCustoMana": lista });
  }
  static async onAddAcao(event, target) {
    await this._enfileirarArray("acoes", acoes => acoes.push(novaAcaoPadrao()));
  }

  /** Remove a Ação no índice data-index, ajustando qual fica ativa se necessário. */
  static async onRemoveAcao(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("acoes", acoes => acoes.splice(index, 1));
    const novoTotal = this.item.system.acoes?.length ?? 0;
    if ((this.item.system.acaoAtivaIndex ?? 0) >= novoTotal) {
      await this.item.update({ "system.acaoAtivaIndex": Math.max(0, novoTotal - 1) });
    }
  }

  /**
   * Duplica a Ação no índice data-index (cópia profunda - inclui danos,
   * curas, gastosRecurso, condicoesAplicadas, tudo) e insere logo depois
   * dela na lista, já marcando a cópia como a Ação ativa. Existe pra não
   * precisar montar do zero uma Ação parecida com outra que já existe
   * (ex: a versão "(Penitência)" de uma Palavra de Destino, ou variações
   * de dano de uma arma).
   */
  static async onDuplicateAcao(event, target) {
    const index = Number(target.dataset.index);
    const original = this.item.system.acoes?.[index];
    if (!original) return;
    const copia = foundry.utils.deepClone(original.toObject ? original.toObject() : original);
    copia.nome = `${copia.nome || "Ação"} (cópia)`;
    await this._enfileirarArray("acoes", acoes => acoes.splice(index + 1, 0, copia));
    await this.item.update({ "system.acaoAtivaIndex": index + 1 });
  }

  /** Marca a Ação no índice data-index como a "ativa" (usada ao clicar no dado). */
  static async onSetAcaoAtiva(event, target) {
    const index = Number(target.dataset.index);
    await this.item.update({ "system.acaoAtivaIndex": index });
  }

  /** Adiciona um bloco de Dano/Cura DENTRO de uma Ação específica (data-acao-index + data-campo). */
  static async onAddAcaoBlock(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const campo = target.dataset.campo; // "danos" | "curas"
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex][campo] = acoes[acaoIndex][campo] ?? [];
      acoes[acaoIndex][campo].push(NOVO_BLOCO_PADRAO[campo]());
      // Dano/Cura precisam de alvo: se o modo ainda é "nenhum" e ninguém o
      // escolheu à mão, passa para "alvo selecionado" (mesma regra de
      // marcar "É um ataque").
      const acao = acoes[acaoIndex];
      if (!acao.modoAlvoTravado && (acao.modoAlvo ?? "nenhum") === "nenhum") {
        acao.modoAlvo = "selecionado";
        acao.modoAlvoTravado = true;
      }
    });
  }

  /** Fase 6: itens extras concedidos por uma Condição. */
  static async onAddConcederItem(event, target) {
    await this._enfileirarArray("concederItensUuids", lista => { lista.push(""); });
  }
  static async onRemoveConcederItem(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("concederItensUuids", lista => { lista.splice(index, 1); });
  }

  /** Fase 7: tipos de arma permitidos na escolha de arma (liga/desliga). */
  static async onToggleArmaTipo(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const tipo = target.dataset.tipo;
    await this._enfileirarArray("acoes", acoes => {
      const lista = new Set(acoes[acaoIndex]?.armaEscolhidaTipos ?? []);
      if (lista.has(tipo)) lista.delete(tipo); else lista.add(tipo);
      if (acoes[acaoIndex]) acoes[acaoIndex].armaEscolhidaTipos = [...lista];
    });
  }
  /** Bônus no dano periódico das Condições que você aplica. */
  static async onAddBonusPeriodico(event, target) {
    await this._enfileirarArray("bonusDanoPeriodico", lista => { lista.push({ condicaoNome: "Sangramento", valor: "1", multiplicarPeloRank: false }); });
  }
  static async onRemoveBonusPeriodico(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("bonusDanoPeriodico", lista => { lista.splice(index, 1); });
  }

  /** Estudos: tipos de estudo deste item. */
  static async onAddTipoEstudo(event, target) {
    await this._enfileirarArray("tiposEstudo", lista => { lista.push({ id: foundry.utils.randomID(8), nome: "Novo estudo", bonusAcerto: true, valor: "1", sobeComRank: true, duracao: "proximoAtaque", maxAcumulos: "3", contaComoInformacao: true }); });
  }
  static async onRemoveTipoEstudo(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("tiposEstudo", lista => { lista.splice(index, 1); });
  }

  /** Variantes da Emanação por Condição do dono (Semblante Mutável). */
  static async onAddEmanacaoVariante(event, target) {
    await this._enfileirarArray("emanacaoVariantes", lista => { lista.push({ seCondicaoUuid: "", condicaoUuid: "", acumulos: "1" }); });
  }
  static async onRemoveEmanacaoVariante(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("emanacaoVariantes", lista => { lista.splice(index, 1); });
  }

  /** Fase 7: efeitos nos seus ataques. */
  static async onAddEfeitoAtaque(event, target) {
    await this._enfileirarArray("efeitosEmAtaques", lista => { lista.push({ ativo: true, tipoAtaque: "pesadoOuEspecial", tipoArma: "", condicaoUuid: "", acumulos: "1", multiplicarPeloRank: false, danoExtraDado: "" }); });
  }
  static async onRemoveEfeitoAtaque(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("efeitosEmAtaques", lista => { lista.splice(index, 1); });
  }

  /** Fase 7: reduções de custo de Estamina. */
  static async onAddReduzCusto(event, target) {
    await this._enfileirarArray("reduzCustoEstamina", lista => { lista.push({ quantidade: "1", tipoItem: "", soCura: false, minimo: "0" }); });
  }
  static async onRemoveReduzCusto(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("reduzCustoEstamina", lista => { lista.splice(index, 1); });
  }

  /** Fase 6: pagar um custo com outro recurso. */
  static async onAddPagarCusto(event, target) {
    await this._enfileirarArray("pagarCustoCom", lista => { lista.push({ custo: "mana", recurso: "vida", tipoItem: "", multiplicador: "1" }); });
  }
  static async onRemovePagarCusto(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("pagarCustoCom", lista => { lista.splice(index, 1); });
  }

  /** Fase 6: ajustes de máximo de grupo exclusivo. */
  static async onAddLimiteGrupo(event, target) {
    await this._enfileirarArray("limitesDeGrupo", lista => { lista.push({ grupo: "", maximo: 2 }); });
  }
  static async onRemoveLimiteGrupo(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("limitesDeGrupo", lista => { lista.splice(index, 1); });
  }

  /** Conjuração Poderosa: adiciona/remove uma modificação própria da magia. */
  static async onAddModificadorPoderosa(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].condensarModificadores = acoes[acaoIndex].condensarModificadores ?? [];
      acoes[acaoIndex].condensarModificadores.push({ campo: "", modo: "somar", valor: "" });
    });
  }
  static async onRemoveModificadorPoderosa(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("acoes", acoes => {
      acoes[acaoIndex]?.condensarModificadores?.splice(index, 1);
    });
  }

  /** Remove um bloco de Dano/Cura de dentro de uma Ação específica. */
  static async onRemoveAcaoBlock(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const campo = target.dataset.campo;
    const index = Number(target.dataset.index);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex][campo].splice(index, 1);
    });
  }

  /** Limpa a Cor customizada do Template de área de uma Ação, voltando a usar a cor do jogador. */
  static async onLimparCorTemplate(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].templateCor = "";
    });
  }

  /**
   * Adiciona uma linha nova na tabela "Por Rank" de um Dano/Cura/Ataque
   * (data-campo="danos"|"curas"|"ataque", + data-bloco-index quando for
   * dano/cura, já que cada Ação pode ter vários blocos).
   */
  /** Adiciona uma linha na tabela "Defesa por Rank" da Armadura - array simples no topo do item.system, não precisa navegar "acoes" como o addPorRank genérico abaixo. */
  /** Adiciona uma linha na lista dinâmica de modificadores (Efeito/Condição) - ver campoModificador. */
  /**
   * Liga/desliga um campo booleano QUALQUER dentro de UMA Ação específica
   * (ex: "templatePersistenteAoEntrar") - genérico, reaproveitável por
   * qualquer campo futuro do tipo, não hardcoded pra um só. ÍCONE clicável
   * em vez de <input type="checkbox"> de propósito (mesmo motivo
   * documentado em ".nauren-subclasse-toggle-icone" no CSS - o tema
   * padrão do Foundry desenha um "::before" decorativo por baixo do
   * checkbox nativo em alguns contextos, sem jeito de remover só ele via
   * CSS). "data-campo" no HTML diz qual campo dentro da Ação; "data-acao-
   * index" diz qual Ação da lista.
   */
  static async onToggleAcaoBoolCampo(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const campo = target.dataset.campo;
    if (!campo || Number.isNaN(acaoIndex)) return;
    await this._enfileirarArray("acoes", lista => {
      const acao = lista[acaoIndex];
      if (!acao) return;
      acao[campo] = !acao[campo];
    });
  }

  /**
   * Modificadores Externos (ver campoModificadorExterno()) - mesmo padrão
   * dos 4 handlers de "modificadores" logo abaixo, só que no array
   * "modificadoresExternos" (só existe em Efeito, com "modificaOutroItem"
   * ligado).
   */
  /**
   * Gatilhos Externos de Template Persistente (ver
   * NaurenEfeitoData#gatilhosTemplatePersistente) - array simples, sem
   * tabela por rank (cada entrada é fixa enquanto o Efeito existir).
   */
  static async onAddGatilhoTemplatePersistente(event, target) {
    await this._enfileirarArray("gatilhosTemplatePersistente", lista => {
      lista.push({ itemAlvoUuid: "", evento: "inicioTurno", disposicao: "aliados", efeito: "", quantidade: "1", condicaoUuid: "", condicaoAcumulos: "1" });
    });
  }

  static async onRemoveGatilhoTemplatePersistente(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("gatilhosTemplatePersistente", lista => {
      lista.splice(index, 1);
    });
  }

  static async onAddModificadorExterno(event, target) {
    await this._enfileirarArray("modificadoresExternos", lista => {
      lista.push({ itemAlvoUuid: "", campo: "", modo: "substituir", valorPorRank: [{ rank: 1, valor: "" }] });
    });
  }

  static async onRemoveModificadorExterno(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("modificadoresExternos", lista => {
      lista.splice(index, 1);
    });
  }

  static async onAddModificadorExternoPorRank(event, target) {
    const modIndex = Number(target.dataset.modIndex);
    await this._enfileirarArray("modificadoresExternos", lista => {
      const mod = lista[modIndex];
      if (!mod) return;
      mod.valorPorRank = mod.valorPorRank ?? [];
      mod.valorPorRank.push({ rank: (mod.valorPorRank[mod.valorPorRank.length - 1]?.rank ?? 0) + 1, valor: "" });
    });
  }

  static async onRemoveModificadorExternoPorRank(event, target) {
    const modIndex = Number(target.dataset.modIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("modificadoresExternos", lista => {
      lista[modIndex]?.valorPorRank?.splice(index, 1);
    });
  }

  static async onAddModificador(event, target) {
    await this._enfileirarArray("modificadores", lista => {
      lista.push({ campo: "forca", valor: "", porRank: [] });
    });
  }

  static async onRemoveModificador(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("modificadores", lista => {
      lista.splice(index, 1);
    });
  }

  /** Tabela "Por Rank" PRÓPRIA de uma linha específica da lista de modificadores (data-mod-index diz qual linha). */
  static async onAddModificadorPorRank(event, target) {
    const modIndex = Number(target.dataset.modIndex);
    await this._enfileirarArray("modificadores", lista => {
      const mod = lista[modIndex];
      if (!mod) return;
      mod.porRank = mod.porRank ?? [];
      mod.porRank.push({ rank: (mod.porRank[mod.porRank.length - 1]?.rank ?? 0) + 1, valor: "" });
    });
  }

  static async onRemoveModificadorPorRank(event, target) {
    const modIndex = Number(target.dataset.modIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("modificadores", lista => {
      lista[modIndex]?.porRank?.splice(index, 1);
    });
  }

  /**
   * As 4 abaixo são a versão "aninhada" das 4 acima - mexem no array
   * "modificadores" que mora DENTRO de uma entrada de "efeitosVinculados"
   * (Efeito Vinculado embutido direto numa Habilidade/Arma/Armadura/
   * Consumível, sem apontar pra um item de Efeito por UUID). "data-vinculo-
   * index" (no HTML) diz QUAL vínculo da lista está sendo editado.
   */
  static async onAddEfeitoVinculadoModificador(event, target) {
    const vinculoIndex = Number(target.dataset.vinculoIndex);
    await this._enfileirarArrayAninhado("efeitosVinculados", `${vinculoIndex}.modificadores`, lista => {
      lista.push({ campo: "forca", valor: "", porRank: [] });
    });
  }

  static async onRemoveEfeitoVinculadoModificador(event, target) {
    const vinculoIndex = Number(target.dataset.vinculoIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArrayAninhado("efeitosVinculados", `${vinculoIndex}.modificadores`, lista => {
      lista.splice(index, 1);
    });
  }

  /** Adiciona uma Condição a Aplicar dentro de um Efeito Vinculado (nível de item) - enquanto ele estiver ativo, um ATAQUE feito com este item também aplica esta Condição no alvo. */
  static async onAddEfeitoVinculadoCondicao(event, target) {
    const vinculoIndex = Number(target.dataset.vinculoIndex);
    await this._enfileirarArrayAninhado("efeitosVinculados", `${vinculoIndex}.condicoesAplicadas`, lista => {
      lista.push({ uuid: "", acumulos: 1, ativo: true, soSeAcertar: true });
    });
  }

  /** Remove uma Condição a Aplicar de dentro de um Efeito Vinculado. */
  static async onRemoveEfeitoVinculadoCondicao(event, target) {
    const vinculoIndex = Number(target.dataset.vinculoIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArrayAninhado("efeitosVinculados", `${vinculoIndex}.condicoesAplicadas`, lista => {
      lista.splice(index, 1);
    });
  }

  static async onAddEfeitoVinculadoModificadorPorRank(event, target) {
    const vinculoIndex = Number(target.dataset.vinculoIndex);
    const modIndex = Number(target.dataset.modIndex);
    await this._enfileirarArrayAninhado("efeitosVinculados", `${vinculoIndex}.modificadores`, lista => {
      const mod = lista[modIndex];
      if (!mod) return;
      mod.porRank = mod.porRank ?? [];
      mod.porRank.push({ rank: (mod.porRank[mod.porRank.length - 1]?.rank ?? 0) + 1, valor: "" });
    });
  }

  static async onRemoveEfeitoVinculadoModificadorPorRank(event, target) {
    const vinculoIndex = Number(target.dataset.vinculoIndex);
    const modIndex = Number(target.dataset.modIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArrayAninhado("efeitosVinculados", `${vinculoIndex}.modificadores`, lista => {
      lista[modIndex]?.porRank?.splice(index, 1);
    });
  }

  /**
   * Mesma coisa, mas pro Efeito Vinculado que mora DENTRO de uma Ação
   * específica ("acoes.{acaoIndex}.efeitosVinculados.{vinculoIndex}.
   * modificadores") - "data-acao-index" identifica a Ação, "data-vinculo-
   * index" identifica o vínculo dentro dela.
   */
  static async onAddAcaoEfeitoVinculadoModificador(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const vinculoIndex = Number(target.dataset.vinculoIndex);
    await this._enfileirarArrayAninhado("acoes", `${acaoIndex}.efeitosVinculados.${vinculoIndex}.modificadores`, lista => {
      lista.push({ campo: "forca", valor: "", porRank: [] });
    });
  }

  static async onRemoveAcaoEfeitoVinculadoModificador(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const vinculoIndex = Number(target.dataset.vinculoIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArrayAninhado("acoes", `${acaoIndex}.efeitosVinculados.${vinculoIndex}.modificadores`, lista => {
      lista.splice(index, 1);
    });
  }

  static async onAddAcaoEfeitoVinculadoModificadorPorRank(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const vinculoIndex = Number(target.dataset.vinculoIndex);
    const modIndex = Number(target.dataset.modIndex);
    await this._enfileirarArrayAninhado("acoes", `${acaoIndex}.efeitosVinculados.${vinculoIndex}.modificadores`, lista => {
      const mod = lista[modIndex];
      if (!mod) return;
      mod.porRank = mod.porRank ?? [];
      mod.porRank.push({ rank: (mod.porRank[mod.porRank.length - 1]?.rank ?? 0) + 1, valor: "" });
    });
  }

  static async onRemoveAcaoEfeitoVinculadoModificadorPorRank(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const vinculoIndex = Number(target.dataset.vinculoIndex);
    const modIndex = Number(target.dataset.modIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArrayAninhado("acoes", `${acaoIndex}.efeitosVinculados.${vinculoIndex}.modificadores`, lista => {
      lista[modIndex]?.porRank?.splice(index, 1);
    });
  }

  /** Descarrega o veneno desta arma. */
  static async onLimparVeneno(event, target) {
    await this.item.update({ "system.venenoCarregado": "" });
  }

  /** Adiciona um Gatilho por Evento novo - ver NaurenHabilidadeData#gatilhos. */
  static async onAddGatilho(event, target) {
    await this._enfileirarArray("gatilhos", lista => {
      lista.push({ evento: "aliadoSofreuDano", recurso: "estaminaCombate", quantidade: "1" });
    });
  }

  static async onRemoveGatilho(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("gatilhos", lista => {
      lista.splice(index, 1);
    });
  }

  static async onAddBonusCondicionalAoAlvo(event, target) {
    await this._enfileirarArray("bonusCondicionalAoAlvo", lista => {
      lista.push({ ativo: true, condicaoUuid: "", campo: "dano", valor: "1" });
    });
  }

  static async onRemoveBonusCondicionalAoAlvo(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("bonusCondicionalAoAlvo", lista => {
      lista.splice(index, 1);
    });
  }

  static async onAddDefesaPorRank(event, target) {
    await this._enfileirarArray("defesaBonusPorRank", lista => {
      lista.push({ rank: (lista[lista.length - 1]?.rank ?? 0) + 1, valor: 0 });
    });
  }

  static async onRemoveDefesaPorRank(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("defesaBonusPorRank", lista => {
      lista.splice(index, 1);
    });
  }

  static async onAddPorRank(event, target) {
    const campo = target.dataset.campo; // "danos" | "curas" | "ataque" | "condicoes" | "gastos"
    // Campo no NÍVEL RAIZ do item (não dentro de uma Ação específica) -
    // ex: emanacaoRaioPorRank (Presença, Empíreo). Sem "data-acao-index".
    if (campo === "emanacaoRaioPorRank") {
      await this._enfileirarArray("emanacaoRaioPorRank", lista => {
        lista.push({ rank: (lista[lista.length - 1]?.rank ?? 0) + 1, valor: "" });
      });
      return;
    }
    const acaoIndex = Number(target.dataset.acaoIndex);
    const blocoIndex = target.dataset.blocoIndex !== undefined ? Number(target.dataset.blocoIndex) : null;
    await this._enfileirarArray("acoes", acoes => {
      const acao = acoes[acaoIndex];
      if (!acao) return;
      if (campo === "ataque") {
        acao.ataqueBonusPorRank = acao.ataqueBonusPorRank ?? [];
        acao.ataqueBonusPorRank.push(novoPorRankPadrao());
      } else if (campo === "penitenciaBonusDano") {
        acao.penitenciaBonusDanoDadoPorRank = acao.penitenciaBonusDanoDadoPorRank ?? [];
        acao.penitenciaBonusDanoDadoPorRank.push(novoPorRankPadrao());
      } else if (campo === "penitenciaBonusCura") {
        acao.penitenciaBonusCuraDadoPorRank = acao.penitenciaBonusCuraDadoPorRank ?? [];
        acao.penitenciaBonusCuraDadoPorRank.push(novoPorRankPadrao());
      } else if (campo === "numeroAlvos") {
        acao.numeroAlvosPorRank = acao.numeroAlvosPorRank ?? [];
        acao.numeroAlvosPorRank.push({ rank: 1, quantidade: 1 });
      } else if (campo === "condicoes") {
        const bloco = acao.condicoesAplicadas?.[blocoIndex];
        if (!bloco) return;
        bloco.acumulosPorRank = bloco.acumulosPorRank ?? [];
        bloco.acumulosPorRank.push({ rank: 1, acumulos: 1 });
      } else if (campo === "condicoesEvitar") {
        const bloco = acao.condicoesAplicadas?.[blocoIndex];
        if (!bloco) return;
        bloco.custoParaEvitarQuantidadePorRank = bloco.custoParaEvitarQuantidadePorRank ?? [];
        bloco.custoParaEvitarQuantidadePorRank.push({ rank: 1, quantidade: "" });
      } else if (campo === "gastos") {
        const bloco = acao.gastosRecurso?.[blocoIndex];
        if (!bloco) return;
        bloco.quantidadePorRank = bloco.quantidadePorRank ?? [];
        bloco.quantidadePorRank.push({ rank: 1, quantidade: "" });
      } else if (campo === "custoProprio") {
        const bloco = acao.custosRecursoProprio?.[blocoIndex];
        if (!bloco) return;
        bloco.quantidadePorRank = bloco.quantidadePorRank ?? [];
        bloco.quantidadePorRank.push({ rank: 1, quantidade: "" });
      } else if (campo === "gastosEvitar") {
        const bloco = acao.gastosRecurso?.[blocoIndex];
        if (!bloco) return;
        bloco.custoParaEvitarQuantidadePorRank = bloco.custoParaEvitarQuantidadePorRank ?? [];
        bloco.custoParaEvitarQuantidadePorRank.push({ rank: 1, quantidade: "" });
      } else {
        const bloco = acao[campo]?.[blocoIndex];
        if (!bloco) return;
        bloco.porRank = bloco.porRank ?? [];
        bloco.porRank.push(novoPorRankPadrao());
      }
    });
  }

  /** Remove uma linha da tabela "Por Rank" de um Dano/Cura/Ataque/Condição/Gasto de Recurso. */
  static async onRemovePorRank(event, target) {
    const campo = target.dataset.campo;
    const index = Number(target.dataset.index);
    // Campo no NÍVEL RAIZ do item (ver mesmo caso em onAddPorRank).
    if (campo === "emanacaoRaioPorRank") {
      await this._enfileirarArray("emanacaoRaioPorRank", lista => {
        lista.splice(index, 1);
      });
      return;
    }
    const acaoIndex = Number(target.dataset.acaoIndex);
    const blocoIndex = target.dataset.blocoIndex !== undefined ? Number(target.dataset.blocoIndex) : null;
    await this._enfileirarArray("acoes", acoes => {
      const acao = acoes[acaoIndex];
      if (!acao) return;
      if (campo === "ataque") {
        acao.ataqueBonusPorRank?.splice(index, 1);
      } else if (campo === "penitenciaBonusDano") {
        acao.penitenciaBonusDanoDadoPorRank?.splice(index, 1);
      } else if (campo === "penitenciaBonusCura") {
        acao.penitenciaBonusCuraDadoPorRank?.splice(index, 1);
      } else if (campo === "numeroAlvos") {
        acao.numeroAlvosPorRank?.splice(index, 1);
      } else if (campo === "condicoes") {
        acao.condicoesAplicadas?.[blocoIndex]?.acumulosPorRank?.splice(index, 1);
      } else if (campo === "condicoesEvitar") {
        acao.condicoesAplicadas?.[blocoIndex]?.custoParaEvitarQuantidadePorRank?.splice(index, 1);
      } else if (campo === "gastos") {
        acao.gastosRecurso?.[blocoIndex]?.quantidadePorRank?.splice(index, 1);
      } else if (campo === "custoProprio") {
        acao.custosRecursoProprio?.[blocoIndex]?.quantidadePorRank?.splice(index, 1);
      } else if (campo === "gastosEvitar") {
        acao.gastosRecurso?.[blocoIndex]?.custoParaEvitarQuantidadePorRank?.splice(index, 1);
      } else {
        acao[campo]?.[blocoIndex]?.porRank?.splice(index, 1);
      }
    });
  }

  /** Adiciona um vínculo vazio (ativo por padrão) na lista de Efeitos Vinculados DE UMA AÇÃO. */
  static async onAddAcaoEfeitoVinculado(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].efeitosVinculados = acoes[acaoIndex].efeitosVinculados ?? [];
      acoes[acaoIndex].efeitosVinculados.push({ id: "", ativo: true });
    });
  }

  /** Remove um vínculo da lista de Efeitos Vinculados DE UMA AÇÃO. */
  static async onRemoveAcaoEfeitoVinculado(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].efeitosVinculados.splice(index, 1);
    });
  }

  /** Adiciona uma Condição/Efeito vazio na lista "aplicar no alvo" de uma Ação. */
  static async onAddAcaoCondicao(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].condicoesAplicadas = acoes[acaoIndex].condicoesAplicadas ?? [];
      acoes[acaoIndex].condicoesAplicadas.push({ uuid: "", acumulos: 1, ativo: true, soSeAcertar: true, perguntarParaEvitar: false, custoParaEvitarRecurso: "estamina", custoParaEvitarQuantidade: "1", acumulosPorRank: [], custoParaEvitarQuantidadePorRank: [] });
    });
  }

  /** Remove uma entrada da lista "aplicar no alvo" de uma Ação. */
  static async onRemoveAcaoCondicao(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].condicoesAplicadas.splice(index, 1);
    });
  }

  /** Adiciona um UUID vazio na lista de "Verificar Múltiplas Condições no Alvo" de uma Ação. */
  static async onAddCondicaoAlvoMultipla(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].condicoesAlvoMultiplas = acoes[acaoIndex].condicoesAlvoMultiplas ?? [];
      acoes[acaoIndex].condicoesAlvoMultiplas.push("");
    });
  }

  /** Remove uma entrada da lista de "Verificar Múltiplas Condições no Alvo" de uma Ação. */
  static async onRemoveCondicaoAlvoMultipla(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].condicoesAlvoMultiplas.splice(index, 1);
    });
  }

  /** Adiciona uma entrada na lista de opções de "Escolher uma Condição" de uma Ação. */
  static async onAddCondicaoEscolhida(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].condicoesEscolhidasOpcoes = acoes[acaoIndex].condicoesEscolhidasOpcoes ?? [];
      acoes[acaoIndex].condicoesEscolhidasOpcoes.push("");
      const rotA = acoes[acaoIndex].condicoesEscolhidasRotulos ?? [];
      while (rotA.length < acoes[acaoIndex].condicoesEscolhidasOpcoes.length) rotA.push("");
      acoes[acaoIndex].condicoesEscolhidasRotulos = rotA;
    });
  }

  /** Remove uma entrada da lista de opções de "Escolher uma Condição" de uma Ação. */
  static async onRemoveCondicaoEscolhida(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].condicoesEscolhidasOpcoes.splice(index, 1);
      if (Array.isArray(acoes[acaoIndex].condicoesEscolhidasRotulos)) acoes[acaoIndex].condicoesEscolhidasRotulos.splice(index, 1);
    });
  }

  /** Adiciona uma linha (nível → valor) numa das 3 tabelas "por Nível" de uma Ação (usosMaxPorNivel/custoEstaminaPorNivel/custoManaPorNivel) - campo escolhido por data-campo. */
  static async onAddPorNivel(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const campo = target.dataset.campo;
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex] || !campo) return;
      const lista = acoes[acaoIndex][campo] ?? [];
      acoes[acaoIndex][campo] = lista;
      lista.push({ nivel: (lista[lista.length - 1]?.nivel ?? 0) + 1, valor: 0 });
    });
  }

  /** Remove uma linha de uma das 3 tabelas "por Nível" de uma Ação. */
  static async onRemovePorNivel(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const campo = target.dataset.campo;
    const index = Number(target.dataset.index);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex] || !campo) return;
      acoes[acaoIndex][campo].splice(index, 1);
    });
  }

  /** Igual onAddPorNivel, mas pra uma tabela "por Nível" no CAMPO RAIZ do item (ex: system.usosMaxPorNivel, ver "Usos" da Habilidade/Magia inteira), não dentro de uma Ação específica. */
  static async onAddReacaoPaga() {
    await this._enfileirarArray("reacoesPagas", lista => { lista.push({ nome: "Nova reação", tipo: "defesa", formula: "1d4", recurso: "", custo: "1", custoVariavel: false, soEmPrioridade: false, usosPorTurno: 1 }); });
  }
  static async onRemoveReacaoPaga(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("reacoesPagas", lista => { lista.splice(index, 1); });
  }

  static async onAddPorNivelItem(event, target) {
    const campo = target.dataset.campo;
    await this._enfileirarArray(campo, lista => {
      lista.push({ nivel: (lista[lista.length - 1]?.nivel ?? 0) + 1, valor: 0 });
    });
  }

  /** Igual onRemovePorNivel, mas pra uma tabela "por Nível" no CAMPO RAIZ do item. */
  static async onRemovePorNivelItem(event, target) {
    const campo = target.dataset.campo;
    const index = Number(target.dataset.index);
    await this._enfileirarArray(campo, lista => {
      lista.splice(index, 1);
    });
  }

  /** Adiciona um Gasto de Recurso vazio na Ação (drena Estamina/Mana/Destino, ou causa Estresse). */
  static async onAddAcaoGasto(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].gastosRecurso = acoes[acaoIndex].gastosRecurso ?? [];
      acoes[acaoIndex].gastosRecurso.push(novoGastoRecursoPadrao());
    });
  }

  /** Remove um Gasto de Recurso da Ação. */
  static async onRemoveAcaoGasto(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].gastosRecurso.splice(index, 1);
    });
  }

  /** Adiciona um Custo de Recurso Próprio vazio na Ação (consome de VOCÊ, não do alvo - ex: Energia). */
  static async onAddCustoRecursoProprio(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].custosRecursoProprio = acoes[acaoIndex].custosRecursoProprio ?? [];
      acoes[acaoIndex].custosRecursoProprio.push({ recurso: "", quantidade: "1", ativo: true, quantidadePorRank: [] });
    });
  }

  /** Remove um Custo de Recurso Próprio da Ação. */
  static async onRemoveCustoRecursoProprio(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].custosRecursoProprio.splice(index, 1);
    });
  }

  /** Adiciona uma Concessão ao Atacante vazia na Ação (concede um Recurso Customizado a VOCÊ MESMO, condicionado a acertar/errar). */
  static async onAddConcessaoAoAtacante(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].concessaoAoAtacante = acoes[acaoIndex].concessaoAoAtacante ?? [];
      acoes[acaoIndex].concessaoAoAtacante.push({ recurso: "", quandoAplicar: "acertar", quantidade: "1", ativo: true });
    });
  }

  /** Remove uma Concessão ao Atacante da Ação. */
  static async onRemoveConcessaoAoAtacante(event, target) {
    const acaoIndex = Number(target.dataset.acaoIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("acoes", acoes => {
      if (!acoes[acaoIndex]) return;
      acoes[acaoIndex].concessaoAoAtacante.splice(index, 1);
    });
  }

  /** Adiciona um vínculo vazio (ativo por padrão) na lista de Efeitos Vinculados DO ITEM (Armadura/Consumível, passivo). */
  static async onAddEfeitoVinculado(event, target) {
    await this._enfileirarArray("efeitosVinculados", arr => arr.push({ id: "", ativo: true }));
  }

  /** Remove um vínculo da lista de Efeitos Vinculados DO ITEM. */
  /** Marca este item como da Torre Infinita (flags.nauren.torre), com a chave a partir do nome. */
  static async onMarcarTorre() {
    if (!game.user.isGM) return;
    const chave = String(this.document.name ?? "item").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
    const raridade = this.document.type === "consumivel" ? "consumivel" : "magico";
    await this.document.setFlag("nauren", "torre", { chave, tier: null, raridade, preco: 0, pigmento: null, loja: "galeria" });
  }

  static async onTirarTorre() {
    if (!game.user.isGM) return;
    const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: "Tirar da Torre Infinita" }, content: "<p>Remover os dados da Torre deste item? O bot deixa de reconhecê-lo.</p>", rejectClose: false }).catch(() => false);
    if (ok) await this.document.unsetFlag("nauren", "torre");
  }

  /** Item com bônus "escolhido ao receber": liga só a opção clicada (as outras do grupo desligam). */
  static async onEscolherBonusItem(event, target) {
    const esc = this.document.getFlag("nauren", "escolhaAoReceber");
    if (!esc?.rotulos?.length) return;
    const escolhido = Number(target.dataset.indice);
    const lista = foundry.utils.deepClone(this.document.system.efeitosVinculados ?? []);
    esc.rotulos.forEach((r, k) => { const e = lista[(esc.inicio ?? 0) + k]; if (e) e.ativo = k === escolhido; });
    await this.document.update({ "system.efeitosVinculados": lista, "flags.nauren.escolhaFeita": escolhido });
  }

  static async onRemoveEfeitoVinculado(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("efeitosVinculados", arr => arr.splice(index, 1));
  }

  /** Adiciona um Efeito Periódico novo na Condição (Sangramento, tira Estamina, etc.). */
  static async onAddEfeitoPeriodico(event, target) {
    await this._enfileirarArray("efeitosPeriodicos", arr => arr.push(novoEfeitoPeriodicoPadrao()));
  }

  /** Remove um Efeito Periódico da Condição. */
  static async onRemoveEfeitoPeriodico(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("efeitosPeriodicos", arr => arr.splice(index, 1));
  }

  /**
   * Tabela "Por Rank" PRÓPRIA de um Efeito Periódico específico (ex:
   * Infusão Floral - Comunhão Natural sobe o dado de cura de 1d4 pra
   * 1d6/1d8/1d10 por rank) - mesmo padrão de "onAddModificadorPorRank",
   * só que no array "efeitosPeriodicos" em vez de "modificadores".
   */
  static async onAddEfeitoPeriodicoPorRank(event, target) {
    const efIndex = Number(target.dataset.efIndex);
    await this._enfileirarArray("efeitosPeriodicos", arr => {
      const ef = arr[efIndex];
      if (!ef) return;
      ef.porRank = ef.porRank ?? [];
      ef.porRank.push({ rank: (ef.porRank[ef.porRank.length - 1]?.rank ?? 0) + 1, formula: "" });
    });
  }

  static async onRemoveEfeitoPeriodicoPorRank(event, target) {
    const efIndex = Number(target.dataset.efIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("efeitosPeriodicos", arr => {
      arr[efIndex]?.porRank?.splice(index, 1);
    });
  }

  /** Remove um membro da lista do Grupo de Jogadores. */
  static async onRemoveGrupoMembro(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("membros", arr => arr.splice(index, 1));
  }

  /** Botões +/- de Graça do Destinado / Perjúrio do Acaso na ficha do Grupo (data-campo="graca"|"perjurio", data-delta="1"|"-1"). */
  /** Dado de Acalanto do Destino (livro 0.8): escolhe o efeito e em quem. */
  static async onUsarAcalanto(event, target) {
    await naurenUsarAcalanto(this.item);
  }

  static async onAjustarGrupo(event, target) {
    const campo = target.dataset.campo;
    const delta = Number(target.dataset.delta);
    await NaurenGrupoHelper.ajustar(this.item, campo, delta);
  }

  /** Ajusta o Nível de Ameaça de UM membro específico do Grupo (+1/-1) - só o Mestre vê esse controle (ver context.isGM). */
  static async onAjustarAmeacaMembro(event, target) {
    const index = Number(target.dataset.index);
    const delta = Number(target.dataset.delta);
    if (Number.isNaN(index) || Number.isNaN(delta)) return;
    await this._enfileirarArray("membros", membros => {
      const membro = membros[index];
      if (!membro) return;
      membro.ameaca = Math.max(0, (membro.ameaca ?? 0) + delta);
    });
  }

  /** Zera Graça do Destinado e Perjúrio do Acaso de uma vez (o manual diz que ambos "desaparecem ao final da sessão"). */
  static async onResetarGrupo(event, target) {
    await this.item.update({ "system.graca.value": 0, "system.perjurio.value": 0 });
  }

  /**
   * Distribui XP pra todo mundo cadastrado em "Membros do Grupo" - lê a
   * quantidade e o modo (dividir/igual) de dois campos NÃO vinculados por
   * "name=" (mesmo padrão de "Adicionar Atributo" na Escala por Nível),
   * já que só importam no momento do clique, não fazem parte dos dados
   * salvos do item. "Dividir" reparte a quantidade entre todos
   * (arredondando pra baixo - sobra descartada, avisada no chat); "Mesmo
   * valor" dá o valor inteiro pra cada um.
   */
  static async onDistribuirXpGrupo(event, target) {
    const inputQtd = this.element.querySelector(".nauren-grupo-xp-quantidade");
    const selectModo = this.element.querySelector(".nauren-grupo-xp-modo");
    const quantidade = Number(inputQtd?.value ?? 0);
    const modo = selectModo?.value ?? "dividir";
    if (!quantidade || quantidade <= 0) {
      ui.notifications.warn("Digite uma quantidade de XP maior que 0 antes de distribuir.");
      return;
    }
    const membros = this.item.system.membros ?? [];
    const atores = (await Promise.all(membros.map(m => m.actorUuid ? fromUuid(m.actorUuid) : null))).filter(a => a);
    if (!atores.length) {
      ui.notifications.warn("Nenhum membro válido cadastrado no Grupo pra receber XP.");
      return;
    }
    const porPessoa = modo === "dividir" ? Math.floor(quantidade / atores.length) : quantidade;
    if (porPessoa <= 0) {
      ui.notifications.warn(`Dividindo ${quantidade} XP entre ${atores.length} membros dá menos de 1 XP por pessoa - aumente a quantidade ou use "Mesmo valor pra todos".`);
      return;
    }
    for (const actor of atores) {
      await actor.update({ "system.xp": (actor.system.xp ?? 0) + porPessoa });
    }
    const sobra = modo === "dividir" ? quantidade - porPessoa * atores.length : 0;
    ChatMessage.create({
      content: `<p class="nauren-aviso-chat"><i class="fas fa-arrow-up-right-dots" style="color: #cca162;"></i> <b>${this.item.name}</b>: ${porPessoa} XP concedido pra cada um dos ${atores.length} membros (${atores.map(a => a.name).join(", ")}).${sobra > 0 ? ` (${sobra} XP não distribuído por causa do arredondamento)` : ""}</p>`
    });
    if (inputQtd) inputQtd.value = "";
  }

  /** Adiciona uma entrada vazia no Inventário Compartilhado do Grupo. */
  static async onAddInventarioItem(event, target) {
    await this._enfileirarArray("inventario", arr => arr.push({ nome: "Novo item", quantidade: 1, notas: "" }));
  }

  /** Remove uma entrada do Inventário Compartilhado. */
  static async onRemoveInventarioItem(event, target) {
    const index = Number(target.dataset.index);
    if (Number.isNaN(index)) return;
    await this._enfileirarArray("inventario", arr => arr.splice(index, 1));
  }

  /**
   * Cria um JournalEntry NOVO de verdade (não texto solto guardado no
   * item) e já o vincula ao Grupo - abre a ficha de Diário nativa do
   * Foundry imediatamente depois de criar, pra já começar a escrever.
   */
  static async onCriarJournalGrupo(event, target) {
    const journal = await JournalEntry.create({
      name: "Nova Anotação",
      pages: [{ name: "Nova Anotação", type: "text", text: { content: "" } }]
    });
    if (!journal) return;
    await this._enfileirarArray("notas", arr => arr.push({ journalUuid: journal.uuid }));
    journal.sheet.render(true);
  }

  /** Abre a ficha de Diário nativa do Foundry pro JournalEntry vinculado nesta linha. */
  static async onAbrirJournalGrupo(event, target) {
    const index = Number(target.dataset.index);
    const entrada = (this.item.system.notas ?? [])[index];
    if (!entrada?.journalUuid) return;
    const journal = await fromUuid(entrada.journalUuid);
    if (!journal) { ui.notifications.warn("Esse Diário não existe mais."); return; }
    journal.sheet.render(true);
  }

  /** Remove uma Anotação/Missão. */
  static async onRemoveNota(event, target) {
    const index = Number(target.dataset.index);
    if (Number.isNaN(index)) return;
    await this._enfileirarArray("notas", arr => arr.splice(index, 1));
  }

  /** Expande/recolhe as notas de uma entrada do Inventário Compartilhado direto na lista (mesma ideia de "onItemToggleDescricao" da ficha de Ator, só que própria da ficha de Item). */
  static async onToggleInventarioExpandido(event, target) {
    const index = Number(target.dataset.index);
    if (Number.isNaN(index)) return;
    if (this.#inventarioExpandido.has(index)) this.#inventarioExpandido.delete(index);
    else this.#inventarioExpandido.add(index);
    this.render();
  }

  /** Remove um nível da Progressão da Classe. */
  static async onRemoveNivel(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("niveis", niveis => niveis.splice(index, 1));
  }

  /** Adiciona um "item concedido" vazio dentro de um nível específico da Classe. */
  static async onAddNivelItem(event, target) {
    const nivelIndex = Number(target.dataset.nivelIndex);
    await this._enfileirarArray("niveis", niveis => {
      const nivel = niveis[nivelIndex];
      if (!nivel) return;
      nivel.itensConcedidos = nivel.itensConcedidos ?? [];
      nivel.itensConcedidos.push({ uuid: "" });
    });
  }

  /** Remove um "item concedido" de dentro de um nível da Classe. */
  static async onRemoveNivelItem(event, target) {
    const nivelIndex = Number(target.dataset.nivelIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("niveis", niveis => {
      niveis[nivelIndex]?.itensConcedidos?.splice(index, 1);
    });
  }

  /** Liga/desliga a "Escolha de Itens" de um nível da Classe. */
  static async onToggleNivelEscolhaAtivo(event, target) {
    const nivelIndex = Number(target.dataset.nivelIndex);
    await this._enfileirarArray("niveis", niveis => {
      const nivel = niveis[nivelIndex];
      if (!nivel) return;
      nivel.escolhaItens = nivel.escolhaItens ?? { ativo: false, itensDisponiveis: [], quantidadeEscolhas: "1" };
      nivel.escolhaItens.ativo = !nivel.escolhaItens.ativo;
    });
  }

  /** Adiciona um item vazio ao POOL de "Escolha de Itens" de um nível da Classe. */
  static async onAddNivelEscolhaItem(event, target) {
    const nivelIndex = Number(target.dataset.nivelIndex);
    await this._enfileirarArray("niveis", niveis => {
      const nivel = niveis[nivelIndex];
      if (!nivel) return;
      nivel.escolhaItens = nivel.escolhaItens ?? { ativo: false, itensDisponiveis: [], quantidadeEscolhas: "1" };
      nivel.escolhaItens.itensDisponiveis = nivel.escolhaItens.itensDisponiveis ?? [];
      nivel.escolhaItens.itensDisponiveis.push({ uuid: "" });
    });
  }

  /** Remove um item do POOL de "Escolha de Itens" de um nível da Classe. */
  static async onRemoveNivelEscolhaItem(event, target) {
    const nivelIndex = Number(target.dataset.nivelIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("niveis", niveis => {
      niveis[nivelIndex]?.escolhaItens?.itensDisponiveis?.splice(index, 1);
    });
  }

  /** Adiciona um "upgrade de rank" vazio dentro de um nível específico da Classe. */
  static async onAddNivelUpgrade(event, target) {
    const nivelIndex = Number(target.dataset.nivelIndex);
    await this._enfileirarArray("niveis", niveis => {
      const nivel = niveis[nivelIndex];
      if (!nivel) return;
      nivel.upgradesDeRank = nivel.upgradesDeRank ?? [];
      nivel.upgradesDeRank.push({ uuidOrigem: "", novoRank: 1 });
    });
  }

  /** Remove um "upgrade de rank" de dentro de um nível da Classe. */
  static async onRemoveNivelUpgrade(event, target) {
    const nivelIndex = Number(target.dataset.nivelIndex);
    const index = Number(target.dataset.index);
    await this._enfileirarArray("niveis", niveis => {
      niveis[nivelIndex]?.upgradesDeRank?.splice(index, 1);
    });
  }
}

/**
 * ============================================================
 * FICHA DA SUBCLASSE: editor visual da árvore
 * ============================================================
 * Uma ApplicationV2 dedicada (não usa a NaurenItemSheet genérica, já que a
 * árvore precisa de posicionamento livre por mouse + SVG, algo bem diferente
 * de formulário comum). A MESMA ficha abre tanto pro item no mundo/
 * compêndio (o "molde") quanto pra cópia embutida num personagem - a
 * diferença é o botão de Modo Edição/Jogo no cabeçalho da própria janela
 * (via _getHeaderControls, API oficial do ApplicationV2).
 *
 * Modo Edição: arrastar nós (mousedown+mousemove+mouseup), redimensionar
 * pelo canto, e um painel de propriedades pra quem estiver selecionado
 * (nome, tipo, rank máximo, item concedido, aparência, pré-requisitos).
 * Modo Jogo (padrão ao abrir): clicar num nó investe 1 Ponto de Subclasse
 * nele (NaurenSubclasseHelper), só funciona na cópia embutida (o molde do
 * mundo/compêndio não tem um "personagem dono" pra gastar ponto de).
 */
class NaurenSubclasseSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  #modoEdicao = false;
  #noSelecionadoId = null;
  #noCopiado = null; // { copiaDe: idDoNoOriginal, dados: {...} } - preenchido por Ctrl+C, consumido por Ctrl+V
  #zoomPendingRestore = null; // { fractionX, fractionY, cursorX, cursorY } - aplicado no _onRender seguinte a um zoom via Ctrl+Scroll
  #scrollCanvasWrap = { left: 0, top: 0 }; // posição de rolagem (pan) de ".nauren-subclasse-canvas-wrap" entre renders - mesma lógica de #scrollSheetBody/#scrollPainel, mas em 2 eixos (o canvas rola tanto na horizontal quanto na vertical). Sem isso, qualquer "item.update()" durante a edição (mover/redimensionar um nó, editar um campo do painel) recriava o wrap do zero e a visão voltava pro canto superior esquerdo.
  #scrollPainel = 0; // mesma lógica de NaurenActorSheet#_ligarScrollSheetBody - o "scrollable" nativo da V2 num seletor aninhado não restaura direito

  static DEFAULT_OPTIONS = {
    classes: ["nauren-rpg", "sheet", "item", "nauren-subclasse-sheet"],
    position: { width: 920, height: 720 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      toggleModoEdicao: NaurenSubclasseSheet.onToggleModoEdicao,
      editBackground: NaurenSubclasseSheet.onEditBackground,
      editNoImagem: NaurenSubclasseSheet.onEditNoImagem,
      addNo: NaurenSubclasseSheet.onAddNo,
      deleteNo: NaurenSubclasseSheet.onDeleteNo,
      fecharPainel: NaurenSubclasseSheet.onFecharPainel,
      togglePrereq: NaurenSubclasseSheet.onTogglePrereq,
      toggleNoBoolCampo: NaurenSubclasseSheet.onToggleNoBoolCampo,
      toggleLinhaPrereq: NaurenSubclasseSheet.onToggleLinhaPrereq,
      addValorCustomizadoPorRank: NaurenSubclasseSheet.onAddValorCustomizadoPorRank,
      addModificadorNo: NaurenSubclasseSheet.onAddModificadorNo,
      removeModificadorNo: NaurenSubclasseSheet.onRemoveModificadorNo,
      addModificadorNoRank: NaurenSubclasseSheet.onAddModificadorNoRank,
      removeModificadorNoRank: NaurenSubclasseSheet.onRemoveModificadorNoRank,
      removeValorCustomizadoPorRank: NaurenSubclasseSheet.onRemoveValorCustomizadoPorRank,
      resetarSubclasse: NaurenSubclasseSheet.onResetarSubclasse,
      addRecurso: naurenOnAddRecurso,
      removeRecurso: naurenOnRemoveRecurso
    }
  };

  static PARTS = {
    body: { template: "systems/nauren/templates/subclasse-sheet.html", scrollable: [".nauren-subclasse-painel"] }
  };

  /** @override */
  get title() {
    return `Subclasse: ${this.item.name}`;
  }

  /**
   * @override
   * Botão de alternar Edição/Jogo na barra de título da própria janela -
   * mesmo mecanismo que o Foundry usa pros botões nativos tipo "Configurar
   * Ficha" (API oficial ApplicationV2#_getHeaderControls). Só aparece pra
   * quem tem permissão de editar o item. O clique é despachado pelo mesmo
   * pipeline de "actions" registrado em DEFAULT_OPTIONS logo acima (ver
   * onToggleModoEdicao) - uma tentativa anterior de capturar isso via
   * _onClickAction não funcionava (esse método só roda pra ações SEM
   * handler registrado, e nunca chegava a ser chamado pros controles do
   * cabeçalho da janela).
   */
  _getHeaderControls() {
    const controls = super._getHeaderControls();
    if (this.isEditable) {
      controls.unshift({
        icon: this.#modoEdicao ? "fas fa-play" : "fas fa-pen-to-square",
        label: this.#modoEdicao ? "Modo Jogo" : "Modo Edição",
        action: "toggleModoEdicao"
      });
    }
    return controls;
  }

  /** Alterna Modo Edição/Jogo (botão no cabeçalho da janela). */
  static async onToggleModoEdicao(event, target) {
    this.#modoEdicao = !this.#modoEdicao;
    this.#noSelecionadoId = null;
    this.render();
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.item;
    context.item = item;
    context.system = item.system;
    context.owner = item.isOwner;
    context.editable = this.isEditable;
    context.modoEdicao = this.#modoEdicao && this.isEditable;
    context.temAtor = !!item.actor;
    context.zoomFundo = item.system.zoomFundo || 100;

    const nosBrutos = item.system.nos ?? [];
    context.nos = nosBrutos.map(no => {
      const adquirido = (no.rankAtual ?? 0) > 0;
      return {
        ...no,
        corBordaEfetiva: adquirido ? (no.corBordaAdquirido || "#cca162") : (no.corBordaPadrao || "#2a2a2a"),
        // O número do rank (0/3) precisa ser lido mesmo com a borda escura de um nó ainda não comprado.
        corTextoRank: adquirido ? (no.corBordaAdquirido || "#cca162") : "#b9b0cf",
        mostrarImagemEfetiva: !!(no.imagemPropria && no.mostrarImagem !== false),
        selecionado: no.id === this.#noSelecionadoId,
        // O visual "travado" (escurecido/acinzentado) só faz sentido pra um
        // nó que AINDA NÃO foi adquirido e não dá pra investir nele agora -
        // uma vez adquirido (rankAtual > 0), ele nunca mais fica acinzentado
        // mesmo que já esteja no rank máximo ou falte ponto pra subir mais -
        // a cor/imagem dele têm que continuar limpas, só a borda muda de cor.
        travado: !context.modoEdicao && item.actor && !adquirido
          ? !NaurenSubclasseHelper.podeInvestir(item.actor, item, no).pode
          : false
      };
    });

    // Uma linha por (nó, pré-requisito) que tenha "linhaVisivel" ligado -
    // desenhada BORDA a BORDA (não centro a centro), na cor EFETIVA atual
    // do nó de origem (o pré-requisito) - assim ela já reflete sozinha se
    // aquele nó foi adquirido ou não.
    context.conexoes = [];
    for (const no of nosBrutos) {
      const noCentro = { x: no.x + no.largura / 2, y: no.y + no.altura / 2 };
      for (const prereq of no.prerequisitos ?? []) {
        if (prereq.linhaVisivel === false) continue;
        const pre = nosBrutos.find(n => n.id === prereq.id);
        if (!pre) continue;
        const preCentro = { x: pre.x + pre.largura / 2, y: pre.y + pre.altura / 2 };
        const p1 = this._pontoNaBorda(pre, noCentro.x, noCentro.y);
        const p2 = this._pontoNaBorda(no, preCentro.x, preCentro.y);
        const corLinha = (pre.rankAtual ?? 0) > 0 ? (pre.corBordaAdquirido || "#cca162") : (pre.corBordaPadrao || "#2a2a2a");
        context.conexoes.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, cor: corLinha });
      }
    }

    const noSelecionado = nosBrutos.find(n => n.id === this.#noSelecionadoId) ?? null;
    if (noSelecionado && context.modoEdicao) {
      // Campo Customizado (ver campoCustomizado/apenasUpgrade no schema do
      // nó) - mesmo seletor "detecta os campos do item alvo" já usado no
      // Modificador Externo de Efeito (ver naurenOpcoesDeCampoParaModificadorExterno),
      // reaproveitado aqui de propósito: antes era só um campo de texto
      // puro, exigindo digitar o dot-path de cabeça (ex:
      // "acoes.1.gastosRecurso.0.quantidade") - agora aparece uma lista
      // pra escolher, e o campo "Novo valor" (e cada linha de "Valor Por
      // Rank") se adapta ao tipo detectado (checkbox pra booleano, texto
      // livre pro resto) - exatamente como já funciona pro Efeito.
      const { opcoes: camposOpcoes, tipos: camposTipos, nomeItemAlvo: nomeItemAlvoCampo } = noSelecionado.apenasUpgrade
        ? await naurenOpcoesDeCampoParaModificadorExterno(noSelecionado.itemUuid)
        : { opcoes: {}, tipos: {}, nomeItemAlvo: null };
      const infoTipoCampo = camposTipos[noSelecionado.campoCustomizado] ?? { tipo: "formula" };
      // Camadas (Fase 3): cada modificador do nó com seus campos detectados,
      // tipo do valor e um resumo em linguagem natural.
      const modificadoresView = await Promise.all((noSelecionado.modificadores ?? []).map(async m => {
        const det = await naurenOpcoesDeCampoParaModificadorExterno(m.itemAlvoUuid);
        const camposOpcoesMod = { rank: "Rank do item (rank efetivo)", ...det.opcoes };
        const tipo = m.campo === "rank" ? "numero" : (det.tipos[m.campo]?.tipo ?? "formula");
        return {
          ...m,
          camposOpcoes: camposOpcoesMod,
          nomeItemAlvo: det.nomeItemAlvo,
          nomeCondicao: m.condicaoNecessariaUuid ? await this._nomeParaUuidSimples(m.condicaoNecessariaUuid) : "",
          tipoBoolean: tipo === "boolean",
          resumo: naurenResumoModificador(m, det.nomeItemAlvo)
        };
      }));
      context.modosModificador = NAUREN_MODOS_MODIFICADOR_EXTERNO_OPCOES;
      context.noSelecionado = {
        ...noSelecionado,
        modificadoresView,
        nomeItemVinculado: await this._nomeParaUuidSimples(noSelecionado.itemUuid),
        camposOpcoes,
        nomeItemAlvoCampo,
        tipoCampoBoolean: infoTipoCampo.tipo === "boolean",
        logicaQualquer: (noSelecionado.prerequisitoLogica ?? "qualquer") === "qualquer",
        logicaTodos: noSelecionado.prerequisitoLogica === "todos",
        outrosNos: nosBrutos.filter(n => n.id !== noSelecionado.id).map(n => {
          const prereq = (noSelecionado.prerequisitos ?? []).find(p => p.id === n.id);
          return {
            id: n.id, nome: n.nome, tipo: n.tipo,
            corBorda: (n.rankAtual ?? 0) > 0 ? (n.corBordaAdquirido || "#cca162") : (n.corBordaPadrao || "#2a2a2a"),
            ligado: !!prereq,
            linhaVisivel: prereq ? prereq.linhaVisivel !== false : true
          };
        })
      };
    }

    context.pontosDisponiveis = item.actor?.system?.pontosSubclasse?.value ?? null;

    // Resolve o nome da Condição de cada Recurso Declarado - mesmo padrão do nó selecionado, só que pra lista inteira.
    context.recursosDeclaradosView = await Promise.all((item.system.recursosDeclarados ?? []).map(async (r, i) => ({
      ...r,
      condicaoAoAtingirMaxNome: await this._nomeParaUuidSimples(r.condicaoAoAtingirMax)
    })));
    context.resetarNoEscopoOpcoes = RESETAR_NO_ESCOPO_OPCOES;

    return context;
  }

  /**
   * Calcula onde a linha reta entre o centro de "no" e o ponto
   * (alvoX, alvoY) cruza a BORDA do retângulo de "no" - usado pra desenhar
   * as conexões saindo/chegando na BORDA de cada nó, não no centro (regra
   * clássica de "clip de raio contra retângulo": acha qual dos dois eixos
   * bate na borda primeiro).
   */
  _pontoNaBorda(no, alvoX, alvoY) {
    const cx = no.x + no.largura / 2, cy = no.y + no.altura / 2;
    const dx = alvoX - cx, dy = alvoY - cy;
    if (!dx && !dy) return { x: cx, y: cy };
    const meiaLargura = no.largura / 2, meiaAltura = no.altura / 2;
    const tX = dx ? Math.abs(meiaLargura / dx) : Infinity;
    const tY = dy ? Math.abs(meiaAltura / dy) : Infinity;
    const t = Math.min(tX, tY);
    return { x: cx + t * dx, y: cy + t * dy };
  }

  /** Resolve um UUID pra um texto curto ("Nome do item" ou aviso) - versão simplificada da de NaurenItemSheet, sem tipo. */
  async _nomeParaUuidSimples(uuid) {
    if (!uuid) return "";
    try {
      const doc = await fromUuid(uuid);
      return doc ? doc.name : "⚠ não encontrado";
    } catch (err) {
      return "⚠ UUID inválido";
    }
  }

  /** @override - liga os listeners de arrastar/redimensionar/editar campos do painel a cada render. */
  _onRender(context, options) {
    naurenPersistirDetalhesAbertos(this);
    super._onRender(context, options);
    this._ligarArrastarNos();
    this._ligarRedimensionarNos();
    this._ligarDropDeItemNoCanvas();
    this._ligarTeclado();
    this._ligarZoomEPan();
    this._ligarScrollPainel();

    // Precisa que ALGO dentro da ficha esteja com foco pra Ctrl+C/Ctrl+V
    // (Copiar/Colar) funcionarem - o canvas é recriado a cada render, então
    // refoca ele sempre que houver um nó selecionado, exceto se o usuário
    // estiver digitando em algum campo do painel (senão roubaria o foco no
    // meio da digitação).
    const canvas = this.element.querySelector('.nauren-subclasse-canvas');
    if (canvas && this.#noSelecionadoId) {
      const focoAtualEhCampo = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      if (!focoAtualEhCampo) canvas.focus({ preventScroll: true });
    }

    // Camadas do nó: campos de cada modificador (data-mod-index / data-mod-field,
    // e data-mod-rank-index nas linhas de valor por rank). Aceita arrastar item.
    this.element.querySelectorAll('[data-mod-field]').forEach(el => {
      el.addEventListener("change", ev => this._onModificadorNoChange(ev));
      if (el.dataset.modField === "itemAlvoUuid" || el.dataset.modField === "condicaoNecessariaUuid") {
        el.addEventListener("dragover", ev => ev.preventDefault());
        el.addEventListener("drop", async ev => {
          ev.preventDefault();
          let dados; try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
          if (!dados?.uuid) return;
          el.value = dados.uuid;
          await this._onModificadorNoChange({ currentTarget: el });
        });
      }
    });
    this.element.querySelectorAll('[data-node-field]').forEach(el => {
      el.addEventListener('change', ev => this._onNoFieldChange(ev));
    });

    this.element.querySelectorAll('[data-recurso-field]').forEach(el => {
      el.addEventListener('change', ev => this._onRecursoFieldChange(ev));
    });

    this.element.querySelectorAll('[data-porrank-field]').forEach(el => {
      el.addEventListener('change', ev => this._onPorRankFieldChange(ev));
    });

    this.element.querySelectorAll('[data-node-field-clear]').forEach(el => {
      el.addEventListener('click', async ev => {
        ev.preventDefault();
        if (!this.#noSelecionadoId) return;
        await this._atualizarNo(this.#noSelecionadoId, { [el.dataset.nodeFieldClear]: "" });
      });
    });

    naurenMostrarNomesDosCamposUuid(this.element, this.item?.actor ?? this.document?.actor ?? null);
    this.element.querySelectorAll('.nauren-uuid-input[data-node-field]').forEach(el => {
      el.addEventListener('dragover', ev => ev.preventDefault());
      el.addEventListener('drop', async ev => {
        ev.preventDefault();
        let dados;
        try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
        if (!dados?.uuid) { ui.notifications.warn("Isso não parece ser um item válido pra arrastar aqui."); return; }
        // "itensExtrasUuids" aceita VÁRIOS itens (separados por vírgula) -
        // arrastar um novo ACRESCENTA em vez de substituir o que já
        // estava. Os outros campos de UUID são de item único, então
        // continuam sobrescrevendo normalmente.
        if (el.dataset.nodeField === "itensExtrasUuids") {
          const atuais = String(el.value || "").split(",").map(s => s.trim()).filter(Boolean);
          if (!atuais.includes(dados.uuid)) atuais.push(dados.uuid);
          el.value = atuais.join(", ");
        } else {
          el.value = dados.uuid;
        }
        await this._onNoFieldChange({ currentTarget: el });
      });
    });

    // Idem, mas pro campo "Condição ao Atingir o Máximo" de um Recurso
    // Declarado.
    this.element.querySelectorAll('.nauren-uuid-input[data-recurso-field]').forEach(el => {
      el.addEventListener('dragover', ev => ev.preventDefault());
      el.addEventListener('drop', async ev => {
        ev.preventDefault();
        let dados;
        try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
        if (!dados?.uuid) { ui.notifications.warn("Isso não parece ser um item válido pra arrastar aqui."); return; }
        el.value = dados.uuid;
        await this._onRecursoFieldChange({ currentTarget: el });
      });
    });
  }

  /**
   * Arrastar um item (Habilidade, Arma, Magia...) da barra lateral ou de um
   * compêndio direto pro canvas cria um nó automaticamente NO PONTO onde foi
   * solto, já com o item vinculado, nome e imagem preenchidos - só em Modo
   * Edição.
   */
  _ligarDropDeItemNoCanvas() {
    const canvas = this.element.querySelector('.nauren-subclasse-canvas');
    if (!canvas) return;
    canvas.addEventListener('dragover', ev => { if (this.#modoEdicao) ev.preventDefault(); });
    canvas.addEventListener('drop', async ev => {
      if (!this.#modoEdicao) return;
      ev.preventDefault();
      let dados;
      try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
      if (dados?.type !== "Item" || !dados.uuid) return; // deixa outros tipos de drop (ex: nada) passarem batido
      const item = await fromUuid(dados.uuid);
      if (!item) { ui.notifications.warn("Não encontrei esse item."); return; }

      const rect = canvas.getBoundingClientRect();
      const largura = 14, altura = 14;
      let x = ((ev.clientX - rect.left) / rect.width) * 100 - largura / 2;
      let y = ((ev.clientY - rect.top) / rect.height) * 100 - altura / 2;
      x = Math.max(0, Math.min(100 - largura, x));
      y = Math.max(0, Math.min(100 - altura, y));

      const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
      const novoId = foundry.utils.randomID();
      nos.push(this._noPadrao(novoId, x, y, { nome: item.name, itemUuid: item.uuid, imagemPropria: item.img || "" }));
      await this.item.update({ "system.nos": nos });
      this.#noSelecionadoId = novoId;
      this.#scrollPainel = 0;
      this.render();
    });
  }

  /**
   * Copiar/Colar um nó (Ctrl+C / Ctrl+V, só em Modo Edição, com um nó
   * selecionado): Ctrl+C guarda uma cópia dos dados do nó selecionado (sem
   * id nem rankAtual - isso é sempre novo). Ctrl+V cria um nó novo ao lado
   * com os MESMOS parâmetros, já tendo o nó ORIGINAL copiado como
   * pré-requisito - agiliza montar uma cadeia de nós parecidos em sequência.
   */
  _ligarTeclado() {
    // Mesmo motivo do guard de _ligarZoomEPan: marca o ELEMENTO, não um
    // campo da classe - se "this.element" for trocado por um nó novo
    // (ex: reabrir a ficha dentro de um "container"), o campo de classe
    // continuaria "true" e os atalhos de teclado (Ctrl+C/Ctrl+V) parariam
    // de responder no elemento novo, sem nenhum jeito de religar sozinho.
    if (this.element.dataset.nrcTecladoLigado) return;
    this.element.dataset.nrcTecladoLigado = "true";
    this.element.addEventListener('keydown', async ev => {
      if (!this.#modoEdicao || !this.#noSelecionadoId) return;
      const noAtual = (this.item.system.nos ?? []).find(n => n.id === this.#noSelecionadoId);
      if (!noAtual) return;
      const alvoEhCampoDeTexto = ["INPUT", "TEXTAREA", "SELECT"].includes(ev.target.tagName);

      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "c" && !alvoEhCampoDeTexto) {
        ev.preventDefault();
        const { id, rankAtual, ...copiavel } = noAtual;
        this.#noCopiado = { copiaDe: noAtual.id, dados: foundry.utils.deepClone(copiavel) };
        ui.notifications.info(`"${noAtual.nome}" copiado - use Ctrl+V pra colar.`);
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "v" && this.#noCopiado) {
        ev.preventDefault();
        const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
        const novoId = foundry.utils.randomID();
        const origem = nos.find(n => n.id === this.#noCopiado.copiaDe) ?? noAtual;
        const x = Math.max(0, Math.min(100 - origem.largura, origem.x + origem.largura + 2));
        nos.push({
          ...this.#noCopiado.dados,
          id: novoId, x, y: origem.y, rankAtual: 0,
          prerequisitos: [{ id: this.#noCopiado.copiaDe, linhaVisivel: true }]
        });
        await this.item.update({ "system.nos": nos });
        this.#noSelecionadoId = novoId;
        this.#scrollPainel = 0;
        this.render();
      }
    });
  }

  /**
   * Zoom (Ctrl + scroll do mouse) e Pan (clicar e arrastar o FUNDO, não um
   * nó, pra empurrar a visão) - funciona nos dois modos (Edição e Jogo).
   * Listeners ficam no elemento ESTÁVEL da ficha (this.element, que não é
   * recriado entre renders) usando delegação de evento, já que o próprio
   * canvas/wrap SÃO recriados a cada render (o template inteiro é
   * reconstruído) - anexar direto neles se perderia no primeiro re-render.
   */
  _ligarZoomEPan() {
    // Restaura a posição de rolagem depois de um zoom via Ctrl+Scroll -
    // sem isso, cada zoom re-renderizaria e "pularia" a visão de volta pro
    // canto superior esquerdo, em vez de manter o zoom centrado no cursor.
    const wrap = this.element.querySelector('.nauren-subclasse-canvas-wrap');
    const canvas = this.element.querySelector('.nauren-subclasse-canvas');
    if (wrap && canvas && this.#zoomPendingRestore) {
      const { fractionX, fractionY, cursorX, cursorY } = this.#zoomPendingRestore;
      this.#zoomPendingRestore = null;
      wrap.scrollLeft = fractionX * canvas.scrollWidth - cursorX;
      wrap.scrollTop = fractionY * canvas.scrollHeight - cursorY;
    } else if (wrap) {
      // Caso GERAL (qualquer outro motivo de re-render: mover/redimensionar
      // um nó, editar um campo do painel, adicionar/remover nó, etc.) -
      // restaura de onde o usuário estava rolado, guardado continuamente
      // pelo listener de 'scroll' logo abaixo. 'scroll' não borbulha
      // (bubbles) no DOM, então precisa ser religado no wrap RECRIADO a
      // cada render - por isso fica FORA do guard "#zoomPanLigado" (que só
      // liga uma vez os listeners delegados em this.element, que não é
      // recriado).
      wrap.scrollLeft = this.#scrollCanvasWrap.left;
      wrap.scrollTop = this.#scrollCanvasWrap.top;
      wrap.addEventListener('scroll', () => {
        this.#scrollCanvasWrap = { left: wrap.scrollLeft, top: wrap.scrollTop };
      });
    }

    // Guard contra religar os listeners de wheel/mousedown 2x - marca o
    // próprio ELEMENTO (não um campo da classe) porque, em certos
    // contextos (ex: a ficha reaberta dentro de um "container"),
    // "this.element" pode ser trocado por um nó NOVO entre renders sem um
    // "close()" de verdade acontecer. Um campo de classe continuaria
    // "true" (achando que já tinha ligado) mesmo com os listeners de
    // fato presos num nó antigo e órfão - o elemento novo, sem marcador
    // nenhum, ficava sem NENHUM listener, e o zoom/pan parava de
    // responder (só as barras de rolagem nativas continuavam funcionando,
    // já que essas não dependem de listener nenhum nosso).
    if (this.element.dataset.nrcZoomLigado) return;
    this.element.dataset.nrcZoomLigado = "true";

    this.element.addEventListener('wheel', async ev => {
      const wrapAlvo = ev.target.closest('.nauren-subclasse-canvas-wrap');
      if (!wrapAlvo || !ev.ctrlKey) return;
      ev.preventDefault();
      const canvasAlvo = wrapAlvo.querySelector('.nauren-subclasse-canvas');
      if (!canvasAlvo) return;

      const rect = wrapAlvo.getBoundingClientRect();
      const cursorX = ev.clientX - rect.left, cursorY = ev.clientY - rect.top;
      const fractionX = (wrapAlvo.scrollLeft + cursorX) / canvasAlvo.scrollWidth;
      const fractionY = (wrapAlvo.scrollTop + cursorY) / canvasAlvo.scrollHeight;

      const zoomAtual = this.item.system.zoomFundo || 100;
      const novoZoom = Math.max(20, Math.min(400, zoomAtual + (ev.deltaY < 0 ? 10 : -10)));
      if (novoZoom === zoomAtual) return;

      this.#zoomPendingRestore = { fractionX, fractionY, cursorX, cursorY };
      await this.item.update({ "system.zoomFundo": novoZoom });
    }, { passive: false });

    this.element.addEventListener('mousedown', ev => {
      if (ev.button !== 0) return;
      const wrapAlvo = ev.target.closest('.nauren-subclasse-canvas-wrap');
      if (!wrapAlvo || ev.target.closest('.nauren-subclasse-no')) return;
      ev.preventDefault();
      const inicio = { x: ev.clientX, y: ev.clientY, scrollLeft: wrapAlvo.scrollLeft, scrollTop: wrapAlvo.scrollTop };
      wrapAlvo.classList.add('arrastando');

      const onMove = moveEv => {
        wrapAlvo.scrollLeft = inicio.scrollLeft - (moveEv.clientX - inicio.x);
        wrapAlvo.scrollTop = inicio.scrollTop - (moveEv.clientY - inicio.y);
      };
      const onUp = () => {
        wrapAlvo.classList.remove('arrastando');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  /**
   * Restaura manualmente a posição de rolagem do painel de propriedades
   * entre um render e outro - mesma lógica de
   * NaurenActorSheet#_ligarScrollSheetBody (o "scrollable" nativo da V2
   * declarado em PARTS não restaura direito pra um seletor aninhado como
   * ".nauren-subclasse-painel", só funciona bem no elemento raiz da PART).
   */
  _ligarScrollPainel() {
    const painel = this.element.querySelector('.nauren-subclasse-painel');
    if (!painel) return;
    painel.scrollTop = this.#scrollPainel;
    painel.addEventListener('scroll', () => {
      this.#scrollPainel = painel.scrollTop;
    });
  }

  /** Clique num nó: em Modo Edição seleciona (abre o painel); em Modo Jogo investe 1 ponto (só na cópia embutida no personagem). */
  async _onCliqueNo(noId) {
    if (this.#modoEdicao) {
      this.#noSelecionadoId = (this.#noSelecionadoId === noId) ? null : noId;
      this.#scrollPainel = 0;
      this.render();
      return;
    }
    const actor = this.item.actor;
    if (!actor) {
      ui.notifications.info("Abra esta Subclasse pela ficha de um personagem pra investir Pontos de Subclasse.");
      return;
    }
    await NaurenSubclasseHelper.investirPonto(actor, this.item, noId);
    this.render();
  }

  /** Arrastar um nó pra reposicionar (só em Modo Edição) - distingue "clique" de "arrasto" por uma distância mínima de movimento. */
  _ligarArrastarNos() {
    const canvas = this.element.querySelector('.nauren-subclasse-canvas');
    if (!canvas) return;
    this.element.querySelectorAll('.nauren-subclasse-no').forEach(el => {
      const noId = el.dataset.noId;
      el.addEventListener('mousedown', ev => {
        if (ev.button !== 0 || ev.target.closest('.nauren-subclasse-resize-handle')) return;
        ev.preventDefault();
        const inicio = { x: ev.clientX, y: ev.clientY };
        let moveu = false;
        const noOriginal = (this.item.system.nos ?? []).find(n => n.id === noId);
        if (!noOriginal) return;

        const onMove = moveEv => {
          const dx = moveEv.clientX - inicio.x, dy = moveEv.clientY - inicio.y;
          if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moveu = true;
          if (!this.#modoEdicao || !moveu) return;
          // Lê o retângulo do canvas A CADA movimento, não uma vez só no
          // início do arrasto - se algo mudar o layout entre o clique e o
          // 1º movimento (ex: o painel de propriedades aparecendo pela
          // primeira vez, mudando o espaço disponível), um retângulo
          // "congelado" no começo faria o nó pular pra um lugar errado.
          const rect = canvas.getBoundingClientRect();
          const novoX = Math.max(0, Math.min(100 - noOriginal.largura, noOriginal.x + (dx / rect.width) * 100));
          const novoY = Math.max(0, Math.min(100 - noOriginal.altura, noOriginal.y + (dy / rect.height) * 100));
          el.style.left = `${novoX}%`;
          el.style.top = `${novoY}%`;
          el.dataset.pendingX = novoX;
          el.dataset.pendingY = novoY;
        };
        const onUp = async () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          if (this.#modoEdicao && moveu && el.dataset.pendingX !== undefined) {
            const patch = { x: Number(el.dataset.pendingX), y: Number(el.dataset.pendingY) };
            delete el.dataset.pendingX; delete el.dataset.pendingY;
            await this._atualizarNo(noId, patch);
          } else if (!moveu) {
            await this._onCliqueNo(noId);
          }
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
  }

  /** Redimensionar um nó pelo canto (só em Modo Edição). */
  _ligarRedimensionarNos() {
    const canvas = this.element.querySelector('.nauren-subclasse-canvas');
    if (!canvas) return;
    this.element.querySelectorAll('.nauren-subclasse-resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const noEl = handle.closest('.nauren-subclasse-no');
        const noId = noEl.dataset.noId;
        const noOriginal = (this.item.system.nos ?? []).find(n => n.id === noId);
        if (!noOriginal) return;
        const inicio = { x: ev.clientX, y: ev.clientY };

        const onMove = moveEv => {
          // Mesmo motivo do arrasto de posição (_ligarArrastarNos): lê o
          // retângulo a cada movimento, não uma vez só no início.
          const rect = canvas.getBoundingClientRect();
          const dx = ((moveEv.clientX - inicio.x) / rect.width) * 100;
          const dy = ((moveEv.clientY - inicio.y) / rect.height) * 100;
          const novaLargura = Math.max(2, Math.min(100 - noOriginal.x, noOriginal.largura + dx));
          const novaAltura = Math.max(2, Math.min(100 - noOriginal.y, noOriginal.altura + dy));
          noEl.style.width = `${novaLargura}%`;
          noEl.style.height = `${novaAltura}%`;
          noEl.dataset.pendingLargura = novaLargura;
          noEl.dataset.pendingAltura = novaAltura;
        };
        const onUp = async () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          if (noEl.dataset.pendingLargura !== undefined) {
            const patch = { largura: Number(noEl.dataset.pendingLargura), altura: Number(noEl.dataset.pendingAltura) };
            delete noEl.dataset.pendingLargura; delete noEl.dataset.pendingAltura;
            await this._atualizarNo(noId, patch);
          }
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
  }

  /** Grava um patch de campos num nó específico (por id), sempre reescrevendo a lista "nos" inteira (mesmo motivo do _onArrayFieldChange da ficha genérica: evitar resetar campos irmãos). */
  async _atualizarNo(noId, patch) {
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
    const no = nos.find(n => n.id === noId);
    if (!no) return;
    Object.assign(no, patch);
    await this.item.update({ "system.nos": nos });
  }

  /** Handler genérico dos campos do painel de propriedades (data-node-field). */
  async _onNoFieldChange(event) {
    const el = event.currentTarget;
    const campo = el.dataset.nodeField;
    if (!campo || !this.#noSelecionadoId) return;
    let valor;
    if (el.type === "checkbox") valor = el.checked;
    else if (el.type === "number") valor = el.value === "" ? 0 : Number(el.value);
    else valor = el.value;
    await this._atualizarNo(this.#noSelecionadoId, { [campo]: valor });
  }

  /** Handler genérico dos campos de "Recursos Declarados" (data-recurso-field, dentro de um bloco com data-recurso-index) - . */
  async _onRecursoFieldChange(event) {
    const el = event.currentTarget;
    const campo = el.dataset.recursoField;
    const index = Number(el.closest("[data-recurso-index]")?.dataset.recursoIndex);
    if (!campo || Number.isNaN(index)) return;
    const lista = foundry.utils.deepClone(this.item.system.recursosDeclarados ?? []);
    if (!lista[index]) return;
    lista[index][campo] = el.type === "checkbox" ? el.checked : el.value;
    await this.item.update({ "system.recursosDeclarados": lista });
  }

  /**
   * Handler genérico de cada linha de "Valor Por Rank" (ver
   * campoCustomizado/apenasUpgrade, data-porrank-field dentro de um
   * bloco com data-porrank-index) do nó SELECIONADO no momento.
   */
  async _onPorRankFieldChange(event) {
    const el = event.currentTarget;
    const campo = el.dataset.porrankField;
    const index = Number(el.closest("[data-porrank-index]")?.dataset.porrankIndex);
    if (!campo || Number.isNaN(index) || !this.#noSelecionadoId) return;
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
    const no = nos.find(n => n.id === this.#noSelecionadoId);
    const linha = no?.valorCustomizadoPorRank?.[index];
    if (!linha) return;
    if (el.type === "number") linha[campo] = el.value === "" ? 0 : Number(el.value);
    else linha[campo] = el.value;
    await this.item.update({ "system.nos": nos });
  }


  /** Troca a imagem de fundo da árvore inteira. */
  static async onEditBackground(event, target) {
    const FilePickerImpl = foundry.applications.apps.FilePicker.implementation;
    const fp = new FilePickerImpl({
      type: "image",
      current: this.item.system.imagemFundo,
      callback: path => this.item.update({ "system.imagemFundo": path }),
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    return fp.browse();
  }

  /** Troca a imagem própria do nó selecionado. */
  static async onEditNoImagem(event, target) {
    if (!this.#noSelecionadoId) return;
    const noAtual = (this.item.system.nos ?? []).find(n => n.id === this.#noSelecionadoId);
    const FilePickerImpl = foundry.applications.apps.FilePicker.implementation;
    const fp = new FilePickerImpl({
      type: "image",
      current: noAtual?.imagemPropria ?? "",
      callback: path => this._atualizarNo(this.#noSelecionadoId, { imagemPropria: path }),
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    return fp.browse();
  }

  /** Adiciona um nó novo (posição/tamanho padrão, editáveis depois pelo painel ou arrastando). */
  static async onAddNo(event, target) {
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
    const novoId = foundry.utils.randomID();
    nos.push(this._noPadrao(novoId, 40, 40));
    await this.item.update({ "system.nos": nos });
    this.#noSelecionadoId = novoId;
    this.#scrollPainel = 0;
    this.render();
  }

  /** Forma padrão de um nó novo - reaproveitada pelo botão "+ Adicionar Nó", pelo drop de item no canvas, e pelo copiar/colar. */
  _noPadrao(id, x, y, extra = {}) {
    return {
      id, x, y, largura: 14, altura: 14,
      nome: "Novo Nó", mostrarNome: false, tipo: "Habilidade Passiva",
      corBordaPadrao: "#2a2a2a", corBordaAdquirido: "#cca162",
      curvaturaBorda: 2, sombra: true, corPreenchimento: "",
      imagemPropria: "", mostrarImagem: true, rankMax: 1, itemUuid: "",
      prerequisitos: [], prerequisitoLogica: "qualquer", rankAtual: 0,
      ...extra
    };
  }

  /** Remove o nó selecionado (e o próprio vínculo dele como pré-requisito de outros nós). */
  static async onDeleteNo(event, target) {
    if (!this.#noSelecionadoId) return;
    const idRemovido = this.#noSelecionadoId;
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []).filter(n => n.id !== idRemovido);
    for (const no of nos) no.prerequisitos = (no.prerequisitos ?? []).filter(p => p.id !== idRemovido);
    this.#noSelecionadoId = null;
    await this.item.update({ "system.nos": nos });
  }

  /** Fecha o painel de propriedades sem apagar nada. */
  static async onFecharPainel(event, target) {
    this.#noSelecionadoId = null;
    this.render();
  }

  /**
   * Alterna um campo BOOLEANO qualquer do nó selecionado (usado pelos
   * toggles em ícone tipo "Sombra leve", "Mostrar nome no nó", "Mostrar
   * imagem no nó" - propositalmente NÃO usa <input type="checkbox"> nesta
   * ficha: o tema padrão do próprio Foundry desenha um ::before decorativo
   * por baixo do checkbox nativo em alguns contextos, e nada que a gente
   * tentasse no CSS conseguia remover só ELE sem também esconder o
   * checkbox de verdade - um ícone clicável simples evita o problema de
   * vez, já que a gente desenha o "check" inteiro sozinho).
   */
  static async onToggleNoBoolCampo(event, target) {
    if (!this.#noSelecionadoId) return;
    const campo = target.dataset.campo;
    if (!campo) return;
    const no = (this.item.system.nos ?? []).find(n => n.id === this.#noSelecionadoId);
    if (!no) return;
    await this._atualizarNo(this.#noSelecionadoId, { [campo]: !no[campo] });
  }

  /** Liga/desliga um outro nó como pré-requisito do nó selecionado (a linha nasce visível por padrão). */
  static async onTogglePrereq(event, target) {
    if (!this.#noSelecionadoId) return;
    const outroId = target.dataset.noId;
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
    const no = nos.find(n => n.id === this.#noSelecionadoId);
    if (!no) return;
    no.prerequisitos = no.prerequisitos ?? [];
    const idx = no.prerequisitos.findIndex(p => p.id === outroId);
    if (idx === -1) no.prerequisitos.push({ id: outroId, linhaVisivel: true });
    else no.prerequisitos.splice(idx, 1);
    await this.item.update({ "system.nos": nos });
  }

  /** Mostra/esconde só a LINHA de conexão de um pré-requisito já marcado, sem desfazer o vínculo em si. */
  static async onToggleLinhaPrereq(event, target) {
    if (!this.#noSelecionadoId) return;
    const outroId = target.dataset.noId;
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
    const no = nos.find(n => n.id === this.#noSelecionadoId);
    const prereq = no?.prerequisitos?.find(p => p.id === outroId);
    if (!prereq) return;
    prereq.linhaVisivel = !prereq.linhaVisivel;
    await this.item.update({ "system.nos": nos });
  }

  /**
   * "Valor Por Rank" (ver campoCustomizado/apenasUpgrade) - permite um
   * nó com Rank Máximo > 1 escrever um valor DIFERENTE a cada rank
   * investido, em vez de travado no mesmo "Novo Valor" pra sempre (ex:
   * Transbordar, Druida: +1/+2/+3 de Mana por rank). Sem nenhuma linha
   * aqui, o nó usa "Novo Valor" sozinho, sempre, pra qualquer rank.
   */
  /** Altera um campo de um modificador (camada) do nó selecionado. */
  async _onModificadorNoChange(event) {
    const el = event.currentTarget;
    if (!this.#noSelecionadoId) return;
    const modIndex = Number(el.dataset.modIndex);
    const campo = el.dataset.modField;
    const rankIndex = el.dataset.modRankIndex !== undefined ? Number(el.dataset.modRankIndex) : null;
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
    const no = nos.find(n => n.id === this.#noSelecionadoId);
    const mod = no?.modificadores?.[modIndex];
    if (!mod || !campo) return;
    let valor = el.type === "checkbox" ? el.checked : el.type === "number" ? (el.value === "" ? 0 : Number(el.value)) : el.value;
    if (rankIndex !== null) {
      if (!mod.valorPorRank?.[rankIndex]) return;
      mod.valorPorRank[rankIndex][campo] = campo === "rank" ? Math.max(1, Number(valor) || 1) : String(valor);
    } else {
      mod[campo] = valor;
    }
    await this.item.update({ "system.nos": nos });
  }

  static async onAddModificadorNo(event, target) {
    if (!this.#noSelecionadoId) return;
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
    const no = nos.find(n => n.id === this.#noSelecionadoId);
    if (!no) return;
    no.modificadores = no.modificadores ?? [];
    no.modificadores.push({
      itemAlvoUuid: no.itemUuid ?? "", campo: "", modo: "substituir", prioridade: 0, condicaoNecessariaUuid: "",
      valorPorRank: Array.from({ length: Math.max(1, no.rankMax ?? 1) }, (_, k) => ({ rank: k + 1, valor: "" }))
    });
    await this.item.update({ "system.nos": nos });
  }

  static async onRemoveModificadorNo(event, target) {
    if (!this.#noSelecionadoId) return;
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
    const no = nos.find(n => n.id === this.#noSelecionadoId);
    if (!no?.modificadores) return;
    no.modificadores.splice(Number(target.dataset.modIndex), 1);
    await this.item.update({ "system.nos": nos });
  }

  static async onAddModificadorNoRank(event, target) {
    if (!this.#noSelecionadoId) return;
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
    const mod = nos.find(n => n.id === this.#noSelecionadoId)?.modificadores?.[Number(target.dataset.modIndex)];
    if (!mod) return;
    mod.valorPorRank = mod.valorPorRank ?? [];
    mod.valorPorRank.push({ rank: (mod.valorPorRank.at(-1)?.rank ?? 0) + 1, valor: "" });
    await this.item.update({ "system.nos": nos });
  }

  static async onRemoveModificadorNoRank(event, target) {
    if (!this.#noSelecionadoId) return;
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
    const mod = nos.find(n => n.id === this.#noSelecionadoId)?.modificadores?.[Number(target.dataset.modIndex)];
    if (!mod?.valorPorRank) return;
    mod.valorPorRank.splice(Number(target.dataset.index), 1);
    await this.item.update({ "system.nos": nos });
  }

  static async onAddValorCustomizadoPorRank(event, target) {
    if (!this.#noSelecionadoId) return;
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
    const no = nos.find(n => n.id === this.#noSelecionadoId);
    if (!no) return;
    no.valorCustomizadoPorRank = no.valorCustomizadoPorRank ?? [];
    no.valorCustomizadoPorRank.push({ rank: (no.valorCustomizadoPorRank[no.valorCustomizadoPorRank.length - 1]?.rank ?? 0) + 1, valor: "" });
    await this.item.update({ "system.nos": nos });
  }

  static async onRemoveValorCustomizadoPorRank(event, target) {
    if (!this.#noSelecionadoId) return;
    const index = Number(target.dataset.index);
    const nos = foundry.utils.deepClone(this.item.system.nos ?? []);
    const no = nos.find(n => n.id === this.#noSelecionadoId);
    no?.valorCustomizadoPorRank?.splice(index, 1);
    await this.item.update({ "system.nos": nos });
  }

  /** Botão "Resetar esta Subclasse" (Modo Jogo, só na cópia embutida). */
  static async onResetarSubclasse(event, target) {
    const actor = this.item.actor;
    if (!actor) return;
    const confirmar = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Resetar Subclasse?" },
      content: `<p>Isso vai remover todos os itens concedidos por <b>${this.item.name}</b>, zerar o rank de todos os nós, e devolver os pontos investidos nela. Confirma?</p>`,
      rejectClose: false
    });
    if (!confirmar) return;
    await NaurenSubclasseHelper.resetarSubclasse(actor, this.item);
    this.render();
  }
}


export { CARGAS_FONTE_OPCOES, MODOS_ALVO, NAUREN_CONTAGEM_DISPOSICAO_OPCOES, NAUREN_CONTAGEM_DISPOSICAO_OPCOES_SEM_DONO, NAUREN_EMANACAO_EFEITO_OPCOES, NAUREN_EMANACAO_EVENTO_OPCOES, NAUREN_GATILHO_EFEITO_OPCOES, NAUREN_GATILHO_EVENTO_OPCOES, NAUREN_GATILHO_LIMITE_ESCOPO, NAUREN_GATILHO_MOMENTO_ACAO, NAUREN_REACAO_CUSTO_OPCOES, NAUREN_REACAO_PRE_ATAQUE_OPCOES, NAUREN_REACAO_QUEM_OPCOES, NAUREN_REACAO_RESISTIR_OPCOES, NAUREN_TEMPLATE_PERSISTENTE_EFEITO_OPCOES, NAUREN_TEMPLATE_PERSISTENTE_EVENTO_OPCOES, NAUREN_TOMA_PRIORIDADE_OPCOES, NOVO_BLOCO_PADRAO, NaurenItemSheet, NaurenSubclasseSheet, RECURSOS_ALVO, RECURSOS_PERIODICOS, RESETAR_NO_ESCOPO_OPCOES, TIPO_ITEM_LABEL, USOS_RESET_LABEL, USOS_RESET_OPCOES, USOS_RESET_POR_COMBATE, naurenChaveEscopoRelogio, naurenNotificarGanhoPerda, naurenOnAddRecurso, naurenOnRemoveRecurso, naurenVisaoGatilho, naurenWhisperAtor, naurenWhisperGMs, novaAcaoPadrao, novoEfeitoPeriodicoPadrao, novoGastoRecursoPadrao, novoPorRankPadrao };
