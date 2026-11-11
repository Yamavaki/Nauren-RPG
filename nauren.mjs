import "./data/habilidades-monstros.mjs";
import { naurenMesmoAndar } from "./modulos/andares.mjs";
import { naurenKitJanela, naurenKitSistema } from "./modulos/janelas-kit.mjs";
import { naurenArteInit } from "./modulos/arte-hover.mjs";
import { naurenChatInit } from "./modulos/chat.mjs";
import { naurenArmazemInit, naurenArmazemHooks } from "./modulos/armazenamento.mjs";
import { naurenTreinosInit } from "./modulos/treinos.mjs";
import "./modulos/molduras-modelos.mjs";
import { naurenMoldurasProntasInit, naurenMoldurasProntasHooks } from "./modulos/molduras-prontas.mjs";
import { naurenAparenciaHooks, naurenAparenciaMigrar } from "./modulos/aparencia.mjs";
import { naurenImportarMassaInit } from "./modulos/importar-massa.mjs";
import { naurenEscritosInit } from "./modulos/escritos.mjs";
import { naurenConfiguracoesInit } from "./modulos/configuracoes.mjs";
import { naurenMoldurasInit, naurenMoldurasHooks } from "./modulos/molduras-token.mjs";
import "./modulos/molduras-editor.mjs";
import "./modulos/seletor-icones.mjs";
import { naurenItensCatalogoHooks, naurenItensCatalogoInit } from "./modulos/itens-catalogo.mjs";
import { naurenItensScriptsHooks, naurenItensScriptsInit } from "./modulos/itens-scripts.mjs";
import "./modulos/animacoes.mjs";
import { NAUREN_TORRE_RETIRADOS, NAUREN_TORRE, NAUREN_TORRE_VERSAO } from "./modulos/compendios.mjs";
import { naurenCoresDoAtor, naurenFichaPaleta, NaurenActorSheet, NaurenAlvoHelper } from "./modulos/ficha-ator.mjs";
import { NAUREN_REACAO_RESISTIR_OPCOES, NAUREN_TEMPLATE_PERSISTENTE_EFEITO_OPCOES, NaurenItemSheet, NaurenSubclasseSheet, RECURSOS_ALVO, RECURSOS_PERIODICOS, USOS_RESET_LABEL, USOS_RESET_POR_COMBATE, naurenChaveEscopoRelogio, naurenNotificarGanhoPerda } from "./modulos/ficha-item.mjs";
import { naurenAbrirBorda, naurenAvisarSeLinkBloqueado, naurenBordaPrepararSujeito, naurenBordaPreviaDataUrl, naurenBordaPreviaDoAtor, naurenReaplicarEscalaInterface } from "./modulos/borda-token.mjs";
import { NAUREN_CAMPOS_ESTADO_ACAO, NAUREN_CAMPOS_ESTADO_ITEM, NAUREN_QUERY_AREA_AO_CRIAR, NAUREN_QUERY_DANO_COLISAO, NAUREN_QUERY_PRESENCA, NAUREN_QUERY_RESISTIR_AREA, naurenAtorTemRecurso, naurenAtualizarCondicaoPresenca, naurenBuscarMascotesDe, naurenCalcularEmpurrao, naurenCelulasNaArea, naurenChecarCondicaoAoAtingirMax, naurenClamparRecursosAoMaximo, naurenConcederRecurso, naurenConcederRecursoAoAtacante, naurenEmpurrarToken, naurenHandleQueryAreaAoCriar, naurenHandleQueryDanoColisao, naurenHandleQueryPresenca, naurenHandleQueryResistirArea, naurenNomeRecurso, naurenPontoDentroDaRegiao, naurenPreencherRecursosNoMaximo, naurenProcessarEmanacoes, naurenProcessarGatilhos, naurenProcessarTemplatesPersistentes, naurenReaplicarUpgradesDeSubclasse, naurenReconciliarTodosOsItens, naurenReconjurarPendente, naurenRecursoEstaTravado, naurenRegistrarStatusDeCondicao, naurenSincronizarRecursosCustom, naurenTokenElegivelPorDisposicao, naurenTransferirRecursoDoAlvo } from "./modulos/icone-condicao-token.mjs";
import { naurenAplicarEfeitosPeriodicos, naurenAtaqueBasicoNaReacao, naurenMestreDaMesa, naurenUsuarioResponsavel } from "./modulos/relogio-combate.mjs";
import { CAMPOS_MIGRADOS_PARA_LIGADO, NAUREN_MODOS_DURACAO, NAUREN_MOMENTOS_PERIODICOS, NaurenConcessaoHelper, NaurenGrupoHelper, NaurenProgressaoHelper, NaurenSubclasseHelper, naurenAncoraDuracaoAtual, naurenAvancarDuracoesCondicoes, naurenMigrarFormulasUnificadas, naurenMigrarModificadoresParaLista, naurenMigrarModificadoresParaTexto, naurenMigrarOpcoesPadraoLigado, naurenModoDuracaoCondicao, naurenMomentoEfeitoPeriodico, naurenRecarregarUsos } from "./modulos/relogio-condicoes.mjs";
import { NAUREN_CAMPOS_ACIMA_AUTOMATICOS, NAUREN_CAMPOS_ACIMA_GERAIS, NAUREN_CAMPOS_ANALISE_CRIATIVA, NAUREN_CAPACIDADES, NAUREN_CAPACIDADE_POR_NOME, NAUREN_CORES_PINTURA, NAUREN_PODEROSA_EFEITOS, NAUREN_QUERY_ACALANTO, NAUREN_QUERY_ACOVARDAR, NAUREN_QUERY_APLICAR_CONDICAO, NAUREN_QUERY_APLICAR_CONDICAO_ECO, NAUREN_QUERY_AUREUM, NAUREN_QUERY_BESTA_INICIAL, NAUREN_QUERY_CRIAR_ITEM, NAUREN_QUERY_DISPARAR_EVENTO, NAUREN_QUERY_DOMAR, NAUREN_QUERY_ENTIDADE, NAUREN_QUERY_ESCOLHA_DRUIDISMO, NAUREN_QUERY_ESCOLHA_PALAVRA, NAUREN_QUERY_ESTRELA, NAUREN_QUERY_ESTUDO, NAUREN_QUERY_ITEM_MESTRE, NAUREN_QUERY_MANIPULAR, NAUREN_QUERY_MOVER_TOKEN, NAUREN_QUERY_RECURSO, NAUREN_QUERY_RESISTIR_ROUBO, naurenAcaoEhCura, naurenAcaoEhGolpe, naurenAcaoSemCustoEstaminaMana, naurenAjusteCriticoDoGrupo, naurenAjusteCustoManaMagia, naurenAliadosAte, naurenAnotarModsRecebidosNoCard, naurenApagarItensSeExistirem, naurenAplicarAcalanto, naurenAplicarPalavraComEscolha, naurenArmarPoderosa, naurenAtacouNoTurnoAtual, naurenAtualizarItemViaMestre, naurenAvisarEstrelaDoArcoIris, naurenBeneficiosDoEstado, naurenBonusAcimaContra, naurenBonusDanoPeriodico, naurenBotoesDeFormula, naurenBotoesDirecaoGrimorio, naurenCategoriaDaArma, naurenCondicaoDoSistemaPorNome, naurenCondicaoNegativa, naurenCriarItemNoAtor, naurenCronometroNoDialog, naurenDeslocarToken, naurenEhCondicaoModelo, naurenEhGolpeEspiritual, naurenEhItem, naurenEscolherCorDaPintura, naurenEscolherEfeitoPoderosa, naurenEscolherPontoNoMapa, naurenEstresseDosAliados, naurenEstudoNoAlvo, naurenFaceD20, naurenFixarTipoAlcanceSemeado, naurenFotografarModsRecebidos, naurenGrimorio, naurenGuardarD20Roubado, naurenHandleQueryAcalanto, naurenHandleQueryAcovardar, naurenHandleQueryAplicarCondicaoEco, naurenHandleQueryAureum, naurenHandleQueryBestaInicial, naurenHandleQueryCriarItem, naurenHandleQueryDomar, naurenHandleQueryEntidade, naurenHandleQueryEscolhaDruidismo, naurenHandleQueryEscolhaPalavra, naurenHandleQueryEstrela, naurenHandleQueryEstudo, naurenHandleQueryItemMestre, naurenHandleQueryManipular, naurenHandleQueryMoverToken, naurenHandleQueryRecurso, naurenHandleQueryResistirRoubo, naurenMaisDadosPoderosa, naurenModsAcima, naurenMontarSelecaoPrioridade, naurenMostrarNomesDosCamposUuid, naurenMoverGrimorio, naurenMoverTokenPara, naurenMoverTokenViaMestre, naurenMunicoesCompativeis, naurenNomeDeToken, naurenNomeDoRecurso, naurenNomeNormalizado, naurenOferecerAcovardar, naurenOferecerDestino, naurenOperarEntidade, naurenOperarEstudo, naurenOperarRecursoViaMestre, naurenOrdemListaMagias, naurenPersonagensEmCena, naurenPreparacaoUsadas, naurenPresosPorArmadilha, naurenPrioridadesGeradas, naurenRegistrarAtaqueNoTurno, naurenReordenarGrimorio, naurenResolverSelf, naurenResolverSelfEmObjeto, naurenResumoDaAcao, naurenSincronizarCriativasDoLadino, naurenSincronizarGrimorio, naurenSomarEfeitoPermanente, naurenTemEstado, naurenTempoReacao, naurenTextoHistoricoDestino, naurenTimeoutReacaoMs, naurenTipoAlcanceAdivinhado, naurenTipoAlcanceDaAcao, naurenTiposEstudoDoAtor, naurenTokensDeslocando, naurenUltimoAtacante, naurenUsarAcalanto, naurenUsosExtrasPara, naurenUuidPorSeed, naurenValorEstudo } from "./modulos/entidades-campo.mjs";
import { naurenLog } from "./modulos/depuracao.mjs";
import { NAUREN_QUERY_REACAO_PRE_ATAQUE, NAUREN_QUERY_REGISTRO_PRIORIDADE, NAUREN_TOKENS_CONTEXTO, naurenAgindoForaDoTurno, naurenConsumirUsoDaHabilidade, naurenDescricaoParaChat, naurenDispararEventoNoDono, naurenFontesDeModificadores, naurenHandleQueryAplicarCondicao, naurenHandleQueryDispararEvento, naurenHandleQueryReacaoPreAtaque, naurenHandleQueryRegistroPrioridade, naurenMapearStrings, naurenModificacoesRecebidas, naurenMontarDescricao, naurenOperarRegistroPrioridade, naurenPrioridadesNoTurno, naurenResumoModificador, naurenSubstituirTokensDeContexto, naurenUsoDisponivel } from "./modulos/prioridades.mjs";
import { NAUREN_NOMES_ATRIBUTO_CURTO, NAUREN_QUERY_ROLAGEM_AUDITADA, __naurenIniciar_registro_rolagens, naurenAnotarNoRegistro, naurenHandleQueryRolagemAuditada, naurenRegistroParaExport, naurenRegistroParaFicha, naurenRolagemAuditada } from "./modulos/registro-rolagens.mjs";
import { __naurenIniciar_desfazer_acao, naurenDiferencaDesfazer, naurenFotoCenaDesfazer } from "./modulos/desfazer-acao.mjs";
import { NaurenHudCombate, __naurenIniciar_hud_combate, naurenAlvosSaoVelhos, naurenHud, naurenHudAlvos, naurenLimparMeusAlvos, naurenMarcarAlvosAgora } from "./modulos/hud-combate.mjs";
import { __naurenIniciar_discord_resumo, naurenConcederPrioridadePeloCard } from "./modulos/discord-resumo.mjs";
import { __naurenIniciar_descer_nivel } from "./modulos/descer-nivel.mjs";
import { __naurenIniciar_movimento, naurenCardMovimento, naurenDepoisDoMovimento, naurenGastarRecursoSimples, naurenJanelaMovimento, naurenModoMovimento, naurenMoverSemMovimento, naurenMovimentoSaldo, naurenRecursosCustomConhecidos } from "./modulos/movimento.mjs";
import { __naurenIniciar_monstros_regras, naurenCasasLivresEmVolta, naurenCompensacoesContraOrigem, naurenCondicoesAtivas, naurenCondicoesLigadasA, naurenCriarInvocacoes, naurenMovSemPrioridadeUsado, naurenTravaDaAcao, naurenTravaPrioridade, naurenUuidEhEsteToken } from "./modulos/monstros-regras.mjs";
import { NAUREN_QUERY_OFERECER_ITEM, naurenHandleQueryOferecerItem } from "./modulos/entrega-itens.mjs";
import { NAUREN_CM_PECS, NaurenCriadorMonstro, __naurenIniciar_criador_monstros, naurenResetarCompendios } from "./modulos/criador-monstros.mjs";
import { NaurenBarrasEditor, __naurenIniciar_barras_token, naurenHudAnimacoesLigadas, naurenRestaurarArmasDaLoja } from "./modulos/barras-token.mjs";
import { __naurenIniciar_carrossel } from "./modulos/carrossel.mjs";
import { NaurenHudRecursosEditor } from "./modulos/hud-recursos.mjs";
import { __naurenIniciar_bando, naurenAlcanceEmMetros, naurenAtoresDoTurno, naurenBandoCfg, naurenBandoChave, naurenBandoMembros, naurenBandoNoAlcance, naurenCombatenteEhDoAtor } from "./modulos/bando.mjs";
import { naurenAbrirConstrucaoPorAcao, naurenAlvoDaRecarga, naurenExecutarRecarga, naurenItemEhDoProjeto, naurenItensDoProjetoPorNome, naurenRecursoDoAtor, naurenRegrasExtras } from "./modulos/inventor-bancada.mjs";
import { __naurenIniciar_equipamento_regras, naurenLimiteOfensivoBase, naurenLimiteVagaDefesa, naurenPesoOfensivo, naurenPesoOfensivoEquipado, naurenReacoesPagasDano, naurenReacoesPagasDefesa, naurenRegraVagasDefesa, naurenVagaDefesa } from "./modulos/equipamento-regras.mjs";
import { __naurenIniciar_inventor, naurenAplicarEfeitoSimples, naurenContextoInvencoes, naurenCriarFrascoEspecial, naurenCriarObraPrima, naurenEfeitoComSubst, naurenEscolherFrasco, naurenEscolherPeculiaridade, naurenFrascoParaPacote, naurenObraPrimaDe, naurenProcessarFrascoNoAlvo, naurenTextoEfeitoFrasco, naurenTextoFrascoEspecial, naurenUmaVezMarcar, naurenUmaVezRecusa } from "./modulos/inventor.mjs";
import { __naurenIniciar_condicao_hud_token } from "./modulos/condicao-hud-token.mjs";
import { naurenOrganizadorInit } from "./modulos/organizador.mjs";
import { naurenCorrespondeAlvoComposto, naurenSistemaEfetivo, naurenBonusPigmentosDoItem } from "./modulos/aprimoramentos.mjs";
const { HTMLField, SchemaField, NumberField, StringField, BooleanField, ArrayField, ObjectField } = foundry.data.fields;

/* =======================================
 * 0. SUB-ESQUEMAS REPETÍVEIS
 * Dano e Cura continuam sendo listas (um item pode ter vários - ex: dano
 * físico + fogo na mesma Ação). "Ataque" agora é só 1 por Ação (não faz
 * sentido testar acerto duas vezes na mesma ação), então vive direto nos
 * campos de campoAcao(), sem precisar de um array próprio.
 * ======================================= */
function campoDanoBloco() {
  return {
    // Fórmula LIVRE e COMPLETA: pode ser só um dado ("2d6"), incluir bônus
    // fixo ("2d6+3") e/ou referenciar um atributo/meta-atributo do
    // personagem com "@nome" (ex: "1d6+@poderAtaque", "@poderMagia+4") - a
    // referência é trocada pelo valor ATUAL na hora de rolar (ver
    // NaurenActorSheet#_substituirAtributosNaFormula). Nomes aceitos:
    // poderAtaque, poderMagia, vitalidade, espirito, forca, agilidade,
    // estamina, inteligencia, destino. Substitui os antigos campos
    // separados "Atributo" (dropdown) e "Bônus fixo".
    formula: new StringField({ initial: "1d6+@poderAtaque" }),
    rolarSeparado: new BooleanField({ initial: false }),
    // Nome customizado do card quando "rolarSeparado" está marcado - se
    // vazio, usa o nome da própria Ação (ex: "Nova Ação — Dano").
    nomeCustom: new StringField({ initial: "" }),
    // Quando a Ação tem automação de alvo ligada (modoAlvo != "nenhum"),
    // este bloco entra na soma aplicada automaticamente no(s) alvo(s)?
    aplicarNoAlvo: new BooleanField({ initial: true }),
    // Tabela "por rank" (só relevante em item com rankAtual - Habilidade,
    // Arma, Magia): cada entrada troca a FÓRMULA INTEIRA (incluindo
    // qualquer "@atributo" nela) a partir do rank indicado, igual "1d6 no
    // rank 1, 1d8+@poderAtaque no rank 2, 2d6+@poderAtaque+2 no rank 3".
    // Usa a entrada de maior rank que seja ≤ rank atual; sem nenhuma
    // entrada aplicável, usa a "formula" normal acima.
    porRank: new ArrayField(new SchemaField({
      rank: new NumberField({ initial: 1, min: 1, integer: true }),
      formula: new StringField({ initial: "" })
    })),
    // Gatilho Condicional (ex: um 2º bloco de Dano que só soma se você
    // já atacou este turno, ou se escolheu certa quantidade de recurso)
    // - mesmo campo/mesma fórmula de campoCondicaoAplicada (aceita
    // "@atacouNesteTurno"/"@quantidadeEscolhida"/"@crescimento", ou
    // qualquer "@atributo") - resolvido por
    // NaurenActorSheet#_condicaoParaAtivarPassou. Vazio (padrão) =
    // sempre ativo, como sempre foi. Pra "adicionar um bônus condicional"
    // sem afetar o bloco principal, crie um 2º bloco pequeno (ex:
    // "+1d4") com isto preenchido - os dois se somam normalmente.
    condicaoParaAtivar: new StringField({ initial: "" }),
    // Dano Verdadeiro (ex: Implosão Arcana - "ignora Defesa, não pode
    // ser bloqueado nem esquivado") - o manual já usa este conceito em
    // várias magias, mas até agora era só narrativo ("aplique
    // manualmente"). Marcado, este bloco específico de dano ignora
    // Redução de Dano Sofrido na hora de aplicar (Escudo continua
    // absorvendo normalmente - Escudo é uma barreira separada, não
    // uma "redução"). Não desliga Bloquear/Esquivar por si só (essas
    // são escolhas do popup de reação, não uma propriedade do dano em
    // si) - descreva na Ação que este ataque específico não permite
    // essas reações, se for o caso.
    verdadeiro: new BooleanField({ initial: false })
  };
}
function campoCuraBloco() {
  return {
    formula: new StringField({ initial: "1d6+@poderMagia" }),
    rolarSeparado: new BooleanField({ initial: false }),
    nomeCustom: new StringField({ initial: "" }),
    aplicarNoAlvo: new BooleanField({ initial: true }),
    porRank: new ArrayField(new SchemaField({
      rank: new NumberField({ initial: 1, min: 1, integer: true }),
      formula: new StringField({ initial: "" })
    })),
    // Ver mesmo campo/comentário completo em campoDanoBloco.
    condicaoParaAtivar: new StringField({ initial: "" })
  };
}

/**
 * Uma AÇÃO: a unidade completa de "algo que este item faz quando usado".
 * Um item (arma/magia/habilidade/armadura/consumível) pode ter VÁRIAS Ações
 * (ex: uma espada com "Ataque Normal" e "Ataque Pesado") - só UMA fica
 * "ativa" por vez (system.acaoAtivaIndex no item), e é essa que roda quando
 * o jogador clica no dado. Tudo que uma Ação PRECISA pra funcionar sozinha
 * mora dentro dela: nome, custo, cargas, Efeitos Vinculados (só valem
 * enquanto ESSA ação é usada, não ficam ligados o tempo todo), template de
 * área, teste de ataque, e listas de dano/cura.
 */
/**
 * Um vínculo com um item de Efeito: guarda o ID do efeito + um checkbox
 * "ativo" PRÓPRIO desse vínculo (liga/desliga sem precisar remover da lista
 * nem mexer no "Efeito ativo" da própria ficha do Efeito).
 */
/**
 * Uma linha de "Condição a Aplicar" - reaproveitada tanto dentro de uma
 * Ação (condicoesAplicadas, o uso original) quanto dentro de um Efeito
 * Vinculado (condicoesAplicadas - NOVO: permite que uma Arma/Habilidade
 * com um Efeito Vinculado ATIVO também aplique uma Condição no alvo ao
 * acertar, não só ajustar os PRÓPRIOS atributos de quem porta o item).
 */
function campoCondicaoAplicada() {
  return {
    uuid: new StringField({ initial: "" }),
    acumulos: new NumberField({ initial: 1, min: 1, integer: true }),
    // Acúmulos ALEATÓRIOS (ex: Sutra da Lâmina Carmesim, Místico -
    // "sofrem 1d4 acúmulos de Sangramento") - diferente de "acumulos"
    // acima (sempre um número fixo): quando preenchido, SUBSTITUI
    // "acumulos" por uma rolagem de verdade (ex: "1d4"), feita no
    // momento de aplicar em cada alvo - o resultado (dado rolado e
    // fórmula) aparece no chat, auditável. Vazio (padrão) = usa
    // "acumulos" normalmente, sem rolar nada.
    acumulosFormula: new StringField({ initial: "" }),
    ativo: new BooleanField({ initial: true }),
    soSeAcertar: new BooleanField({ initial: true }),
    acumulosPorInformacoes: new BooleanField({ initial: false }), // acúmulos = suas informações (estudos) sobre o alvo (Verdade Atordoante)
    acumulosPorEscolhida: new BooleanField({ initial: false }),   // acúmulos = a quantidade escolhida ao usar (Epigrafia da Morte)
    perguntarParaEvitar: new BooleanField({ initial: false }),
    custoParaEvitarRecurso: new StringField({ initial: "estamina" }),
    custoParaEvitarQuantidade: new StringField({ initial: "1" }),
    // Recurso Alternativo pra Evitar (ex: Pressão Gravitacional,
    // Polimorfia - "gaste 1 Estamina OU 1 Estresse") - quando
    // preenchido, o popup mostra as DUAS opções de recurso pra evitar
    // esta Condição (mutuamente exclusivas - o alvo escolhe UMA),
    // além de "não resistir". Vazio (padrão) = só o recurso principal
    // acima, comportamento de sempre.
    custoParaEvitarRecursoAlternativo: new StringField({ initial: "" }),
    custoParaEvitarQuantidadeAlternativo: new StringField({ initial: "1" }),
    // Vincular à Resistência da 1ª Condição (ex: Pressão Gravitacional
    // - "gaste 1 Estamina OU 1 Estresse OU fique Caído E sofra
    // Fragmentado 1" - uma ÚNICA decisão evita AMBAS as Condições, não
    // duas perguntas/custos separados) - quando true, esta Condição
    // não aparece como sua própria linha no popup: segue exatamente a
    // mesma decisão (evitou ou não, sem custo adicional) da PRIMEIRA
    // Condição desta MESMA Ação que tiver "perguntarParaEvitar"
    // ativo. Sem efeito se não houver nenhuma Condição assim antes
    // dela na lista.
    vinculadoAPrimeiraCondicao: new BooleanField({ initial: false }),
    acumulosPorRank: new ArrayField(new SchemaField({
      rank: new NumberField({ initial: 1, min: 1, integer: true }),
      acumulos: new NumberField({ initial: 1, min: 1, integer: true })
    })),
    custoParaEvitarQuantidadePorRank: new ArrayField(new SchemaField({
      rank: new NumberField({ initial: 1, min: 1, integer: true }),
      quantidade: new StringField({ initial: "" })
    })),
    copiarRankDoItem: new BooleanField({ initial: false }),
    // Grupo de Condições exclusivas (ex.: Orações do Ciclo): o alvo só fica com tantas Condições do grupo quanto
    // o rank do item que aplica (1 oração no rank 1, 3 no rank 3); a mais antiga sai para dar lugar à nova.
    grupoExclusivo: new StringField({ initial: "" }),
    // Força o(s) Efeito(s) Periódico(s) da Condição aplicada a sempre
    // rolar no valor MÁXIMO do dado (mesma técnica de "Dano Máximo
    // Condicional" das Ações normais, só que pra cura/dano que rola
    // TURNO/RODADA após turno através da própria Condição, não na hora
    // de conjurar - ex: Abundância de Vida, Druida: "Infusão Floral...
    // restaura o máximo de pontos de vida"). Aplicado no campo
    // "forcarMaximo" de CADA entrada de efeitosPeriodicos da Condição
    // criada/renovada - ver NaurenAlvoHelper.aplicarCondicao.
    forcarMaximoEfeitoPeriodico: new BooleanField({ initial: false }),
    // Duração Extra por Crescimento (ex: Infusão Floral, Druida - "+2
    // Mana, a duração aumenta em 3 turnos") - fórmula (aceita
    // "@crescimento", o número de níveis que o jogador escolheu no popup
    // de Crescimento desta Ação) que resolve pra quantas RODADAS extras
    // somar à duração da Condição aplicada. Só funciona se a Ação também
    // tiver "usaCrescimento" ligado, e a Condição referenciada tiver
    // "Duração (Rodadas)" > 0. Vazio = nenhum ajuste.
    duracaoExtraPorCrescimento: new StringField({ initial: "" }),
    // Custo pra o ALVO remover esta Condição depois (ver
    // custoParaRemoverRecurso/Quantidade no schema da Condição em si) -
    // configurado AQUI, na Ação que concede, e COPIADO pra dentro da
    // INSTÂNCIA aplicada no ator quando criada (ver aplicarCondicao).
    // Recurso vazio ("") = remoção livre, sem popup nenhum (padrão).
    custoParaRemoverRecurso: new StringField({ initial: "" }),
    custoParaRemoverQuantidade: new StringField({ initial: "1" }),
    // Sobrescreve a fórmula do 1º "Efeito Periódico" da Condição SÓ
    // NESTA INSTÂNCIA aplicada (ex: Névoa de Esporos, Druida - a
    // Condição base "Envenenamento" causa 1 de dano por acúmulo, mas
    // esta magia especificamente causa 1d4 por acúmulo). Não toca na
    // Condição de origem no compêndio (outras fontes do mesmo
    // Envenenamento continuam com o valor padrão dela) - e, por ser a
    // MESMA Condição/raiz (não uma cópia duplicada), continua
    // acumulando normalmente com Envenenamento vindo de QUALQUER outra
    // fonte/personagem. Vazio = usa a fórmula normal da Condição.
    overrideFormulaEfeitoPeriodico: new StringField({ initial: "" }),
    // Aplicar CONDICIONALMENTE (ex: Prisão das Brumas, Místico - "Preso"
    // sempre aplica, mas "Cego" só se você já atacou um inimigo neste
    // turno) - fórmula (aceita "@atacouNesteTurno", "@quantidadeEscolhida"
    // etc., os mesmos tokens de qualquer fórmula desta Ação) que, se
    // resolver pra 0/falso, IMPEDE esta entrada específica de
    // condicoesAplicadas de ser aplicada nesta execução - as outras
    // entradas da lista continuam funcionando normalmente. Vazio
    // (padrão) = sempre aplica, como sempre foi.
    condicaoParaAtivar: new StringField({ initial: "" })
  };
}

/**
 * 0.99: Luz e visão dadas por um item (Equipamento, Arma, Armadura, Habilidade, Efeito, Condição).
 * Os nomes dos campos são os mesmos da luz (LightData) e da visão (sight / detectionModes) do token no Foundry V14,
 * para irem direto para o token pelas mudanças de efeito (Actor#tokenActiveEffectChanges), sem gravar nada nele.
 */
function campoLuzVisao() {
  const num = (initial, extra = {}) => new NumberField({ initial, nullable: false, ...extra });
  return new SchemaField({
    luz: new SchemaField({
      ativa: new BooleanField({ initial: false }),        // o item emite luz
      quando: new StringField({ initial: "equipado" }),   // equipado | ativo | sempre
      acesa: new BooleanField({ initial: true }),         // acender/apagar sem desequipar
      bright: num(0, { min: 0 }), dim: num(0, { min: 0 }),
      color: new StringField({ initial: "" }), alpha: num(0.5, { min: 0, max: 1 }),
      angle: num(360, { min: 0, max: 360 }),
      animation: new SchemaField({ type: new StringField({ initial: "" }), speed: num(5, { min: 0, max: 10, integer: true }), intensity: num(5, { min: 1, max: 10, integer: true }), reverse: new BooleanField({ initial: false }) }),
      coloration: num(1, { integer: true }), luminosity: num(0.5, { min: 0, max: 1 }), attenuation: num(0.5, { min: 0, max: 1 }),
      saturation: num(0, { min: -1, max: 1 }), contrast: num(0, { min: -1, max: 1 }), shadows: num(0, { min: 0, max: 1 }),
      negative: new BooleanField({ initial: false }), priority: num(0, { integer: true }),
      darkness: new SchemaField({ min: num(0, { min: 0, max: 1 }), max: num(1, { min: 0, max: 1 }) })
    }),
    visao: new SchemaField({
      ativa: new BooleanField({ initial: false }),        // o item concede visão
      quando: new StringField({ initial: "equipado" }),
      range: num(0, { min: 0 }), angle: num(360, { min: 0, max: 360 }),
      visionMode: new StringField({ initial: "darkvision" }),
      color: new StringField({ initial: "" }), attenuation: num(0.1, { min: 0, max: 1 }),
      brightness: num(0, { min: -1, max: 1 }), saturation: num(0, { min: -1, max: 1 }), contrast: num(0, { min: -1, max: 1 }),
      deteccoes: new ArrayField(new SchemaField({ id: new StringField({ initial: "seeInvisibility" }), range: num(0, { min: 0 }) }))
    })
  });
}

function campoEfeitoVinculado() {
  return {
    id: new StringField({ initial: "" }),
    ativo: new BooleanField({ initial: true }),
    // Formato embutido (b) - ver comentário em prepareDerivedData, seção
    // "Itens de Efeito VINCULADOS": a maioria das Habilidades passivas
    // simples usa ISSO (modificadores direto aqui, sem "id" nenhum),
    // não o formato (a) de apontar pra um Efeito externo por "id". Sem
    // este campo no schema, o Foundry DESCARTA silenciosamente
    // qualquer "modificadores" que um item tente gravar aqui - bug
    // crítico encontrado ao investigar por que "Estatísticas
    // Originais" (Poder de Ataque/Poder de Magia/Espírito/Estresse
    // travados) nunca funcionava de verdade em NENHUMA das Habilidades
    // que usam esse padrão em todo o sistema, não só numa criatura.
    modificadores: new ArrayField(new SchemaField(campoModificador())),
    // NOVO: enquanto este Efeito Vinculado estiver ATIVO, qualquer Ação
    // de ATAQUE deste mesmo item (Arma/Habilidade/Magia) também aplica
    // estas Condições no alvo - reaproveita a MESMA estrutura e lógica
    // de resolução já usada em "condicoesAplicadas" de uma Ação (ver
    // _resolverAlvosDaAcao). Pensado pra coisas como "enquanto a Runa de
    // Gelo estiver ativa, meus ataques também Enraízam o alvo".
    condicoesAplicadas: new ArrayField(new SchemaField(campoCondicaoAplicada()))
  };
}

/**
 * Uma linha da lista dinâmica de modificadores de Efeito/Condição: escolhe
 * QUAL dos 18 campos compartilhados (Ataque, Defesa, Atributos, etc. - ver
 * NAUREN_CAMPOS_MODIFICADOR_18) esta linha afeta, com "valor" no formato
 * flexível de sempre ("+2"/"-3" soma, número/fórmula sem sinal fixa, aceita
 * "@atributo" e "@rank" - ver naurenInterpretarModificador). Tem sua PRÓPRIA
 * tabela "Por Rank" (troca "valor" a partir do rank indicado), independente
 * das outras linhas - assim só aparece na ficha o que o item realmente usa,
 * em vez de uma grade fixa com os 18 campos sempre visíveis.
 */
function campoModificador() {
  return {
    campo: new StringField({ initial: "forca" }),
    valor: new StringField({ initial: "" }),
    // Restringe ESTE modificador específico a um tipo de item sendo
    // usado no momento (magia|arma|habilidade) - vazio (padrão,
    // retrocompatível) = vale pra tudo, como sempre foi. Só faz
    // diferença de fato pros campos "de rolagem" (ataque, ataqueDado,
    // danoBonus, danoDado, curaBonus, curaDado, vantagemAtaque) - os
    // demais (atributos, stats fixos) ignoram este campo, pois não
    // têm um "tipo de item sendo rolado" no momento em que valem.
    // Ex: Terra Mágica (Mago) - "+1 dado de dano/cura E Facilidade em
    // testes de ataque com MAGIAS" usa isto pra não afetar Armas.
    restringirTipoItem: new StringField({ initial: "" }), // "" (todos) | magia | arma | habilidade
    porRank: new ArrayField(new SchemaField({
      rank: new NumberField({ initial: 1, min: 1, integer: true }),
      valor: new StringField({ initial: "" })
    }))
  };
}

/**
 * Modificador EXTERNO (ver NaurenEfeitoData#modificadoresExternos) - ao
 * contrário de campoModificador() (que só ajusta um Atributo/Meta-Atributo
 * do PRÓPRIO Ator, de uma lista fechada de campos), este aponta pra um
 * campo QUALQUER (dot-path dentro de "system", igual "campoCustomizado" de
 * nó de Subclasse) de um item ESPECÍFICO (itemAlvoUuid) - e nunca escreve
 * nele: é lido a cada execução da Ação daquele item (ver
 * NaurenActorSheet#_coletarModificadoresExternos/_aplicarModificadoresExternos
 * em _executarAcao) e aplicado numa CÓPIA em memória, exatamente como
 * Crescimento/Condensar Magia/Penitência já fazem (nunca muta o documento
 * salvo). Isso permite que vários Efeitos independentes (de Subclasses
 * diferentes, com ranks próprios) mirem o MESMO campo do MESMO item ao
 * mesmo tempo sem um sobrescrever o outro - o problema que
 * "campoCustomizado" de Subclasse (escrita direta e permanente) tinha
 * quando duas fontes independentes competiam pelo mesmo campo.
 */
function campoModificadorExterno() {
  return {
    itemAlvoUuid: new StringField({ initial: "" }),
    // Desempate dentro da mesma fase (menor aplica primeiro). Ver
    // NAUREN_FASE_MODIFICADOR para a ordem entre fases.
    prioridade: new NumberField({ initial: 0, integer: true }),
    // Só vale enquanto o portador tiver esta Condição/Efeito (ex.: uma Forma).
    condicaoNecessariaUuid: new StringField({ initial: "" }),
    // Só vale enquanto você tiver um estado ativo (Condição OU Efeito) cujo
    // nome contém este texto (ex.: "Guarda Ofensiva").
    estadoAtivoNome: new StringField({ initial: "" }),
    // Dot-path dentro de "system" do item alvo, ex: "acoes.0.danos.0.formula"
    // ou "acoes.0.usaTemplatePersistente" - mesmo formato de sempre, sem
    // escrever "system." no começo.
    campo: new StringField({ initial: "" }),
    // substituir: troca o valor inteiro (funciona em qualquer tipo de
    // campo - fórmula, número, texto, boolean). somar: soma numérico
    // (funciona em fórmula ou número puro, nunca em boolean/texto).
    // trocarTamanhoDado: troca só o TAMANHO do maior dado da fórmula,
    // mantendo o resto (+@atributo etc.) intacto - "valor" é só o tamanho
    // novo (ex: "d8", sem quantidade). dadoExtra: soma N dados do MESMO
    // tamanho já presente na fórmula - "valor" é só a quantidade (ex: "2").
    // Pra "sempre maximizar o dano/cura" (ex: Abundância de Vida, Druida)
    // não existe um modo dedicado - use "substituir" em DUAS linhas
    // separadas apontando pros campos que a Ação já usa pra isso (ex:
    // "acoes.1.usaDanoMaximoCondicional" = "true" e
    // "acoes.1.formulaDanoMaximoCondicional" = "1") - reaproveita o
    // mecanismo de "Dano Máximo Condicional" que já existe, em vez de um
    // caminho novo e paralelo só pra esse caso.
    modo: new StringField({ initial: "substituir" }),
    // Mesma tabela "Por Rank" de qualquer outro lugar do sistema - o rank
    // usado pra escolher a linha é o "Rank" DESTE Efeito (rankAtual, mais
    // abaixo no schema), sincronizado com o rank do nó de Subclasse que o
    // concedeu, igual todo Efeito de Guarda já faz. Cada linha desta
    // tabela é independente - um Efeito pode ter várias entradas de
    // "modificadoresExternos" (uma por campo que precisa mudar), e cada
    // uma evolui na sua própria velocidade, sem exigir que todas mudem
    // junto a cada rank.
    valorPorRank: new ArrayField(new SchemaField({
      rank: new NumberField({ initial: 1, min: 1, integer: true }),
      valor: new StringField({ initial: "" })
    })),
    // ===== Config extra, SÓ quando modo="adicionar" numa lista de
    // Condições (ver NAUREN_ARRAYS_ADICIONAVEIS > condicoesAplicadas) -
    // o "valor" de cada rank acima já é o UUID da Condição a adicionar;
    // estes campos abaixo são o RESTO da configuração dessa entrada nova
    // (mesmos campos que qualquer Condição Aplicada de uma Ação normal
    // já tem), pra nunca cair só no padrão fixo "sempre ativa, sempre
    // acumula 1, nunca resistível". Não variam por rank (diferente do
    // UUID acima) - se precisar de comportamento diferente por rank,
    // "condicaoNovaAcumulos" aceita "@rank" na fórmula.
    condicaoNovaAcumulos: new StringField({ initial: "1" }),
    condicaoNovaSoSeAcertar: new BooleanField({ initial: true }),
    condicaoNovaPerguntarParaEvitar: new BooleanField({ initial: false }),
    condicaoNovaCustoParaEvitarRecurso: new StringField({ initial: "estamina" }),
    condicaoNovaCustoParaEvitarQuantidade: new StringField({ initial: "1" })
  };
}

/**
 * 0.110: pigmento aplicado num item (Códex Inventariun). "cor" é uma das 8 cores, "qualidade" 1 a 3
 * (o bônus), "escolha" só para Branco (qualquer meta atributo) e Vermelho (PdA ou PdM) - definida ao aplicar.
 * O bônus só vale com o item EQUIPADO (ver naurenBonusPigmentosDoItem em modulos/aprimoramentos.mjs).
 */
function campoPigmentoAplicado() {
  return {
    cor: new StringField({ initial: "" }),
    qualidade: new NumberField({ initial: 1, min: 1, max: 3, integer: true }),
    escolha: new StringField({ initial: "" })
  };
}

/**
 * 0.110: "Modifica habilidade" de um item EQUIPADO (arma/armadura). Cada linha aponta para uma Habilidade,
 * Magia ou Condição pelo seedId (estável entre atualizações do compêndio), com o UUID e o nome de reserva.
 * Entra no mesmo motor dos modificadores de Subclasse (naurenFontesDeModificadores), DEPOIS deles, e só com
 * os modos aditivos (somar, dado extra, subir dado, adicionar Condição) - ver modulos/aprimoramentos.mjs.
 */
function campoModificaHabilidade() {
  return {
    alvoUuid: new StringField({ initial: "" }),
    alvoSeedId: new StringField({ initial: "" }),
    alvoNome: new StringField({ initial: "" }),
    alvoTipo: new StringField({ initial: "" }),
    // Habilidade/Magia de onde a linha foi escolhida (quando o alvo é a Condição que ela aplica).
    viaUuid: new StringField({ initial: "" }),
    viaSeedId: new StringField({ initial: "" }),
    viaNome: new StringField({ initial: "" }),
    campo: new StringField({ initial: "" }),
    rotulo: new StringField({ initial: "" }),
    modo: new StringField({ initial: "somar" }),
    valor: new StringField({ initial: "" }),
    condicaoNovaAcumulos: new StringField({ initial: "1" })
  };
}

/**
 * Bônus Condicional ao Alvo (extraído pra ser reaproveitado por
 * Habilidade E Efeito - ver NaurenHabilidadeData/NaurenEfeitoData):
 * soma um valor a QUALQUER ataque/dano/alcance sempre que o alvo
 * atualmente selecionado (tecla T) tiver a Condição indicada, sem
 * precisar configurar cada Arma/Ação manualmente. Ver
 * NaurenActorSheet#_resolverBonusCondicionalAoAlvo pra como é lido.
 */
function campoBonusCondicionalAoAlvo() {
  return {
    ativo: new BooleanField({ initial: true }),
    condicaoUuid: new StringField({ initial: "" }),
    campo: new StringField({ initial: "dano" }), // dano|ataque|alcance (contra o alvo mirado por MIM) | bloqueio|esquiva (contra o alvo, quando ELE me ataca - ver NaurenAlvoHelper#_bonusDefesaContraAtacante)
    valor: new StringField({ initial: "1" }), // fórmula, aceita @rank
    // Se ligado, multiplica "valor" pelos ACÚMULOS reais que o alvo
    // mirado tem da Condição, em vez de só somar "valor" uma vez.
    porAcumulo: new BooleanField({ initial: false }),
    // Só em alguns ataques: "" = qualquer | distancia (ataques à distância) | arma (ataques com arma).
    filtroAtaque: new StringField({ initial: "" })
  };
}

/**
 * Um GATILHO POR EVENTO completo (extraído de dentro do schema de
 * Habilidade pra ser reaproveitado - ver "usaGatilhos"/"gatilhos" -
 * também usado por Peculiaridade, ex: "Ferida Antiga" reage a
 * "euSofriDano" pra causar +1 de dano automaticamente).
 */
function campoGatilho() {
  return {
    gravarAlvoNaCondicao: new BooleanField({ initial: false }), // a Condição aplicada guarda de qual alvo veio (ex.: Gatilho Rápido)
    limitePorAlvo: new BooleanField({ initial: false }), // o limite de usos conta separado para cada alvo (ex.: Gatilho Rápido)
    // Fase 4: alvo do efeito (UUID de Condição/Efeito ou id de Recurso
    // Customizado, conforme o tipo de efeito escolhido em "recurso").
    efeitoUuid: new StringField({ initial: "" }),
    // Limite de disparos por escopo do Relógio de Combate ("" = sem limite).
    limiteUsos: new StringField({ initial: "" }),
    limiteEscopo: new StringField({ initial: "turno" }),
    // Só reage quando a Ação do evento for um teste de ataque.
    apenasAtaque: new BooleanField({ initial: false }),
    // Só quando o ataque do evento acertou (eventos de ataque).
    soSeAcertou: new BooleanField({ initial: false }),
    // Quando a Ação do evento foi feita: "" qualquer, "emPrioridade", "meuTurno".
    momentoAcao: new StringField({ initial: "" }),
    evento: new StringField({ initial: "aliadoSofreuDano" }), // aliadoSofreuDano|aliadoAcertouAtaque|euSofriDano|euAcerteiAtaque|euErreiAtaque|alguemErrouAtaque|euRealizeiDeflexao|euDeiDano|euCurei|euMateiAlguem|usoCrescimento|entrouOuEvoluiuProfusao|recebeuPrioridade|condicaoAtingiuLimiar|euAcerteiCritico|aliadoAcertouCritico|alguemRecebeuCondicao|inicioCombate|euGasteiDadoDeDestino|aliadoGastouDadoDeDestino|useiMagia|useiArma|useiHabilidade|metadeVida|semEstamina|estresseAtingiu|inicioTurno|fimTurno|inicioRodada|fimRodada
    // "danoNoAtacante" é um caso especial: em vez de conceder recurso
    // pro DONO deste item, causa dano em quem o atacou (só funciona
    // com evento "euSofriDano" - fora dele, nunca dispara, já que só
    // ataques diretos têm um "atacante" identificável no contexto).
    recurso: new StringField({ initial: "estaminaCombate" }), // vida|mana|estaminaCombate|dadosDestino|estresse|recursoCustom:<id>|danoNoAtacante
    recursoAlternativo: new StringField({ initial: "" }), // se preenchido, o dono escolhe na hora: "recurso" ou este (ex.: Raiva: Determinação ou Ofuscação)|condicaoEmMim:<uuid>
    quantidade: new StringField({ initial: "1" }), // aceita fórmula/@token
    // Alcance - só usado em "aliadoSofreuDano": limita
    // o gatilho a só disparar se o dono deste item estiver a até
    // X metros do aliado que sofreu o dano. Vazio = sem limite de alcance.
    alcance: new StringField({ initial: "" }),
    // Limiar de Estresse - só usado no evento "estresseAtingiu": o
    // gatilho dispara quando o Estresse ATUAL chega a este valor (ou
    // mais), vindo de um valor menor.
    limiarEstresse: new StringField({ initial: "1" }),
    // Opcional: só dispara se o dono deste item JÁ tiver esta
    // Condição/Efeito ativo (uuid da Condição de referência).
    condicaoNecessariaUuid: new StringField({ initial: "" }),
    // Opcional: fórmula livre (aceita qualquer @token) que precisa
    // resolver pra um valor DIFERENTE DE ZERO pro gatilho disparar.
    condicaoFormula: new StringField({ initial: "" }),
    // Opcional: só dispara se o evento veio de um item ESPECÍFICO (uuid).
    itemUsadoUuid: new StringField({ initial: "" }),
    // Opcional: só dispara se o NOME da Ação que disparou o evento
    // CONTIVER este texto (case-sensitive).
    nomeAcaoContem: new StringField({ initial: "" }),
    // Opcional: só dispara se o item que causou o evento for de um TIPO
    // específico (ex: "magia" - Bênção Solar, Druida: "sempre que
    // conjurar uma magia..."). Vazio = qualquer tipo, sem filtro.
    tipoItemUsado: new StringField({ initial: "" }),
    // Filtros de ataque (Criador de Monstros, M04): só reage a ataques corpo a corpo ou só
    // à distância (ver tipoAlcance da Ação; ex.: Defesa Espinhosa do Javatusco), e só a
    // ataques com Arma ou com Magia (atributo de ataque).
    filtroAlcanceAtaque: new StringField({ initial: "" }),  // "" | corpoACorpo | distancia
    filtroOrigemAtaque: new StringField({ initial: "" }),   // "" | arma (Poder de Ataque/Agilidade) | magia (Poder de Magia)
    soDeQuemAplicou: new BooleanField({ initial: false }),
    condicaoNomeContem: new StringField({ initial: "" }),  // "eu recebi/alguém recebeu Condição": só se o NOME da Condição contiver este texto (Vontade Férrea)
    perguntarPagarEstresse: new BooleanField({ initial: false }), // pergunta antes e cobra 1 Estresse para disparar (Recusar o Destino)
    pagarEstamina: new StringField({ initial: "" }),       // cobra esta Estamina ao disparar (vazio = nada); sem Estamina suficiente, não dispara (Transferir Aflição)
    itemNomeContem: new StringField({ initial: "" }),      // só se o item do evento tiver este nome (ex.: "Análise Paciente")
    umaVezPorEvento: new BooleanField({ initial: false }), // ignora as instâncias (ex.: dano de Queimando com 4 acúmulos conta como 1)
    soSemPrioridade: new BooleanField({ initial: false }), // só se quem sofreu o dano NÃO reagiu (não usou Prioridade)
    paraMeuMascote: new BooleanField({ initial: false }),  // só se o outro envolvido (quem recebeu / o alvo) for seu mascote
    naoDoMeuMascote: new BooleanField({ initial: false }), // não dispara se veio do seu próprio mascote (ex.: Parceria de Batalha)
    soDeAliado: new BooleanField({ initial: false }),      // só se quem causou o evento é do seu lado (ex.: Prioridade de um aliado)
    duasArmas: new BooleanField({ initial: false }),       // só se você empunha duas armas
    alvoComMinhaCondicaoNome: new StringField({ initial: "" }), // só se o alvo do evento tinha uma Condição SUA com este nome
    opcoesUuids: new ArrayField(new StringField()),        // "Escolher uma Condição em mim": as opções
    soAtaque: new BooleanField({ initial: false }),        // "usei habilidade": só se ela for um ataque
    soSemFacilidade: new BooleanField({ initial: false }), // "acertei": só se o ataque não teve Facilidade (Euforia)
    semEstadoNome: new StringField({ initial: "" }),       // só se você NÃO estiver num estado com este nome (ex.: Profusão)
    excetoComHabilidade: new StringField({ initial: "" }), // ...a não ser que tenha uma destas habilidades (separadas por vírgula)
    profusaoTipo: new StringField({ initial: "" }),        // "entrou em Profusão": "" | ousada | retraida
    alvoInimigoAteMetros: new StringField({ initial: "" }),// o alvo do evento é inimigo e está a até N metros de você
    // Opcional, só pro evento "usoCrescimento": só dispara se a Ação em
    // que o Crescimento foi usado for de CURA (tem "curas[]" ou template
    // persistente de cura) - ex: Forma Sábio dos Matos, Druida: "ao usar
    // Crescimento numa magia de cura...".
    soSeCura: new BooleanField({ initial: false }),
    // "Rolar e Informar" (ex: Bênção Solar, Druida - "role 1d6, em um 6
    // conjure a magia de novo sem gastar Estamina") - usado com
    // "recurso: rolarLimiar" (ver naurenProcessarGatilhos): rola 1
    // dado de "rolarDadoFace" faces e, se o resultado for >= o valor de
    // "rolarLimiarFormula" (aceita "@rank" deste item), só AVISA no
    // chat - nunca concede nem gasta nada sozinho, porque o efeito
    // (reconjurar de graça) é uma decisão manual do jogador em seguida.
    rolarDadoFace: new NumberField({ initial: 6, min: 2, integer: true }),
    rolarLimiarFormula: new StringField({ initial: "" }),
    condicaoContadoraNome: new StringField({ initial: "" }),       // atacarComArmaNoAtacante: oferece de novo enquanto houver esta Condição em você (Esquiva Galante)
    passarDoMaximo: new BooleanField({ initial: false }),         // o ganho de recurso pode passar do máximo (ex.: Vigilante)
    umaVezPorAcao: new BooleanField({ initial: false }),          // dispara 1 vez por uso de Ação, mesmo atingindo vários alvos (ex.: Bênção Solar)
    reconjurarMesmaMagia: new BooleanField({ initial: false }),   // rolarLimiar com sucesso: oferece conjurar a mesma magia de novo no mesmo alvo (Bênção Solar)
    // Opcional, só pro evento "Alguém recebeu uma Condição": filtra
    // por QUAL Condição foi recebida (uuid).
    condicaoDoContextoUuid: new StringField({ initial: "" }),
    // 0.94.3: custo pago ao disparar (qualquer recurso; ex.: Doutor da Peste, 1 PdI). Pergunta antes.
    pagarRecurso: new StringField({ initial: "" }),
    pagarQuantidade: new StringField({ initial: "1" })
  };
}

function campoAcao() {
  return {
    nome: new StringField({ initial: "Ação" }),
    // Custo de Estamina/Mana pra usar ESTA ação especificamente
    custoEstamina: new NumberField({ initial: 0, min: 0, integer: true }),
    custoMana: new NumberField({ initial: 0, min: 0, integer: true }),
    // "Custo por Nível" (ex: Comungar, Druida - "no nível 9, deixa de
    // custar Estamina") - mesma tabela em degraus indexada pelo NÍVEL DE
    // PERSONAGEM que "usosMaxPorNivel" acima (ver naurenResolverPorNivel).
    // Uma entrada aqui SUBSTITUI custoEstamina/custoMana simples (não
    // soma) - deixe vazia se não precisar. Pra "fica de graça a partir
    // do nível X", basta uma entrada com valor 0 nesse nível.
    // "usaCustoPorNivel" só controla a VISIBILIDADE da seção na ficha
    // (a resolução em si olha direto pras tabelas, estejam vazias ou
    // não - mesmo padrão visual de usaCrescimento/usaEscudo).
    usaCustoPorNivel: new BooleanField({ initial: false }),
    custoEstaminaPorNivel: new ArrayField(new SchemaField({
      nivel: new NumberField({ initial: 1, min: 1, integer: true }),
      valor: new NumberField({ initial: 0, min: 0, integer: true })
    })),
    custoManaPorNivel: new ArrayField(new SchemaField({
      nivel: new NumberField({ initial: 1, min: 1, integer: true }),
      valor: new NumberField({ initial: 0, min: 0, integer: true })
    })),
    // Campos que fazem sentido conforme o tipo do item hospedeiro (o
    // template só mostra os relevantes, mas todos ficam salvos por simplicidade)
    tipo: new StringField({ initial: "Média" }),       // relevante pra Arma
    alcance: new StringField({ initial: "1m" }),        // relevante pra Arma/Magia
    // Corpo a corpo ou à distância (golpe com alvo). "auto" = o sistema decide pela
    // categoria da arma, pelo nome (arco, flecha, dispar...) e pelo alcance (6 m ou
    // mais); com Arma Escolhida, "auto" segue a arma/ataque escolhido na hora.
    // Lança e Armas de Alcance contam como corpo a corpo. Ver naurenTipoAlcanceDaAcao.
    tipoAlcance: new StringField({ initial: "auto" }),     // auto | corpoACorpo | distancia
    // 0.94.16: movimento dos tokens (Sequencer Motion) - ver NAUREN_MOTION_USUARIO_OPCOES / NAUREN_MOTION_ALVO_OPCOES.
    motionUsuario: new StringField({ initial: "auto" }),
    motionAlvo: new StringField({ initial: "auto" }),
    // Soma ao custo a Estamina extra por ataque da Categoria do monstro (+0/+1/+2/+3,
    // ver @estCat) - assim a mesma Ação do catálogo serve da Categoria 1 à 4.
    custoEstaminaPorCategoria: new BooleanField({ initial: false }),
    categoria: new StringField({ initial: "Classe" }),  // relevante pra Habilidade
    // Cargas/munição desta ação. Por padrão são PRÓPRIAS (não compartilhadas
    // com outras Ações do mesmo item - uma "Rajada" pode gastar cargas
    // diferente de um "Tiro Único"), mas também podem vir de um item
    // Consumível do MESMO ator (ex: um Arco usando "Flechas" como munição -
    // ver cargasFonte/cargasConsumivelId, resolvidos em _resolverCargasDaAcao).
    usaCargas: new BooleanField({ initial: false }),
    cargasFonte: new StringField({ initial: "propria" }), // "propria" | "consumivel"
    cargasConsumivelId: new StringField({ initial: "" }), // id do item Consumível no ator (só quando cargasFonte="consumivel")
    cargasAtual: new NumberField({ initial: 0, min: 0, integer: true }),
    cargasMax: new NumberField({ initial: 1, min: 0, integer: true }),
    consumirCargaAoUsar: new BooleanField({ initial: false }),
    cargasCustoPorUso: new NumberField({ initial: 1, min: 0, integer: true }),
    // Usos "por dia/cena/rodada/turno" (ex: Comungar "1 vez por dia",
    // Investida "1 vez por cena de combate") - diferente de Cargas/Munição:
    // aqui sempre consome exatamente 1 por uso, e RECARREGA sozinho
    // conforme o escopo escolhido (ver naurenRecarregarUsos).
    soNoMeuTurno: new BooleanField({ initial: false }), // em combate, só pode ser usada no próprio turno (ex.: Retalhador Brutal)
    usaUsos: new BooleanField({ initial: false }),
    usosAtual: new NumberField({ initial: 1, min: 0, integer: true }),
    usosMax: new NumberField({ initial: 1, min: 0, integer: true }),
    // Quanto de um Bônus de Usos condicional (ver usosMaxBonusCondicaoUuid
    // mais abaixo, ex: Fadiga em Profusão Ousada) já foi consumido neste
    // ciclo de recarga - campo SEPARADO de "usosAtual" de propósito:
    // "usosAtual" tem min:0, então nunca poderia guardar "quanto foi
    // gasto ALÉM do disponível" (precisaria ir negativo). Reseta junto
    // com "usosAtual" (ver naurenRecarregarUsos).
    usosBonusConsumidoAtual: new NumberField({ initial: 0, min: 0, integer: true }),
    usosReset: new StringField({ initial: "cena" }), // cena | dia | rodada | turno (qualquer turno) | meuTurno (início do próprio turno)
    // Prioridade (livro, Cap. III). "" = herda o indicador do item.
    prioridadeIndicador: new StringField({ initial: "" }),
    // Quem recebe: "" = padrão do indicador (P/I: alvos afetados;
    // P/A: aliados à escolha). Opções em NAUREN_PRIORIDADE_QUEM_RECEBE.
    prioridadeQuemRecebe: new StringField({ initial: "" }),
    // Quantos aliados à escolha (fórmula; aceita @rank) e raio em metros
    // para "aliados no raio".
    prioridadeQuantidade: new StringField({ initial: "1" }),
    prioridadeRaio: new StringField({ initial: "" }),
    // Lado de quem pode receber em "à escolha"/"no raio": "" = padrão do
    // indicador (P/A: aliados, P/I: inimigos), "aliados", "inimigos", "todos".
    prioridadeDisposicao: new StringField({ initial: "" }),
    // "Usos Máximos por Nível" (ex: Comungar, Druida - "1 uso por dia no
    // nível 2, subindo pra 2/3/4/5 nos níveis 6/10/17/19") - tabela em
    // degraus indexada pelo NÍVEL DE PERSONAGEM (não rank do item, ver
    // naurenResolverPorNivel), calculada de novo sempre que o nível do
    // Ator muda (ver prepareDerivedData). Uma entrada aqui SUBSTITUI o
    // "usosMax" simples acima (não soma) - deixe vazia se não precisar.
    usosMaxPorNivel: new ArrayField(new SchemaField({
      nivel: new NumberField({ initial: 1, min: 1, integer: true }),
      valor: new NumberField({ initial: 1, min: 0, integer: true })
    })),
    // Bônus de Usos condicional (ex: Fadiga, Empíreo - "+1 uso adicional
    // durante o combate em Profusão Ousada") - enquanto a Condição de
    // referência estiver ativa em quem usa, soma o valor TANTO em
    // usosMax QUANTO em usosAtual (preserva a proporção certa mostrada
    // no card, ex: "2/2" em vez de "2/1"). Resolvido a cada uso (não
    // fixo), então liga/desliga sozinho ao entrar/sair da Condição.
    usosMaxBonusCondicaoUuid: new StringField({ initial: "" }),
    usosMaxBonusQuantidade: new StringField({ initial: "1" }),
    // IDs de itens "efeito" que só se aplicam ENQUANTO esta ação específica
    // está sendo usada/rolada (resolvidos na hora, não ficam ligados o tempo
    // todo como o Efeito Vinculado de Armadura/Consumível, que é passivo).
    efeitosVinculados: new ArrayField(new SchemaField(campoEfeitoVinculado())),
    // ===== VERIFICAR CONDIÇÃO NO ALVO (pra fórmulas escalarem com acúmulos
    // de um alvo específico, ex: Ladino que causa +1 dado de dano e reduz o
    // crítico necessário pra cada acúmulo de "Estudado" no alvo) =====
    usaCondicaoAlvo: new BooleanField({ initial: false }),
    // "condicaoAlvoUuid": aponta pro item de Condição de referência (mesmo
    // uuid usado em condicoesAplicadas, mundo/compêndio) - ao rolar esta
    // Ação, olha o(s) alvo(s) selecionado(s) (game.user.targets, primeiro
    // alvo) e conta quantos acúmulos ele(s) têm dessa Condição específica,
    // disponibilizando o número como "@alvoAcumulos" em QUALQUER fórmula
    // desta Ação (Dano, Cura, Bônus de Ataque). Ex: "(1+@alvoAcumulos)d6"
    // cresce um dado inteiro por acúmulo; "@alvoAcumulos" sozinho também
    // funciona como bônus fixo simples.
    condicaoAlvoUuid: new StringField({ initial: "" }),
    // ===== VERIFICAR MÚLTIPLAS CONDIÇÕES NO ALVO (bônus binário
    // condicional, diferente de "@alvoAcumulos" acima, que escala por
    // acúmulo de UMA condição só - ex: Florescer de Espinhos, Druida:
    // "+2 de dano se o alvo já estiver Enraizado OU Envenenado"). Campo
    // PARALELO e INDEPENDENTE de usaCondicaoAlvo acima (que continua
    // intacto, servindo pra escalar por acúmulo de uma condição
    // específica) - este aqui responde "o alvo tem QUALQUER UMA (ou
    // TODAS, conforme a lógica escolhida) de uma LISTA de Condições?",
    // expondo o resultado (1 ou 0) como "@alvoTemCondicao" em qualquer
    // fórmula desta Ação (ex: "2d8+@poderMagia+(@alvoTemCondicao*2)").
    usaCondicoesAlvoMultiplas: new BooleanField({ initial: false }),
    condicoesAlvoMultiplas: new ArrayField(new StringField()),
    logicaCondicoesAlvo: new StringField({ initial: "ou" }), // "ou" | "e"
    // ===== VERIFICAR CONDIÇÃO EM MIM (ex: Arte Divina, Místico: "se você
    // tiver 3+ Pontos de Pintura, seu próximo ataque causa dano máximo") -
    // igual "Verificar Múltiplas Condições no Alvo" acima, mas checando o
    // PRÓPRIO ATOR (quem usa a Ação) em vez do alvo, com um MÍNIMO de
    // acúmulos em vez de só presença/ausência. Expõe o resultado (1 ou 0)
    // como "@euTenhoCondicao" em qualquer fórmula desta Ação. Diferente
    // de "condicaoEmMimUuid" (que APLICA uma Condição em você) - este
    // aqui só VERIFICA, nunca aplica nada.
    usaCondicaoPropria: new BooleanField({ initial: false }),
    condicaoPropriaUuid: new StringField({ initial: "" }),
    condicaoPropriaAcumulosMin: new NumberField({ initial: 1, min: 1, integer: true }),
    // Segunda verificação, INDEPENDENTE da primeira (ex: Ímpeto, Empíreo -
    // Profusão Ousada dá +dano, Profusão Retraída dá +alcance na MESMA
    // Ação: a 1ª verifica Ousada, a 2ª verifica Retraída, cada uma
    // expondo seu próprio token) - use quando a Ação precisa reagir
    // diferente a DUAS Condições distintas ao mesmo tempo. Vazio =
    // desligada (não afeta a 1ª verificação em nada). Expõe o resultado
    // (1 ou 0) como "@euTenhoCondicao2".
    condicaoPropriaUuid2: new StringField({ initial: "" }),
    condicaoPropriaAcumulosMin2: new NumberField({ initial: 1, min: 1, integer: true }),
    // Bônus de Alcance fixo/condicional (ex: Ímpeto, Empíreo - "+1m de
    // alcance em Profusão Retraída") - "acao.alcance" só extrai o
    // PRIMEIRO número literal da string resolvida (não avalia expressões
    // aritméticas), então uma fórmula tipo "1+(@euTenhoCondicao2*@rank)"
    // direto em "Alcance" não funcionaria - este campo à parte É avaliado
    // como expressão de verdade (ver _calcularAlcanceEfetivo), aceitando
    // "@euTenhoCondicao"/"@euTenhoCondicao2"/"@rank". Somado ao Alcance
    // base da Ação. Vazio = nenhum bônus extra.
    alcanceBonusExtraFormula: new StringField({ initial: "" }),
    // ===== DANO MÁXIMO CONDICIONAL (ex: Arte Divina, Andarilhos das
    // Peles) - fórmula (aceita "@alvoTemCondicao"/"@euTenhoCondicao",
    // entre outros) que, ao resolver pra um valor diferente de zero, usa
    // o MÁXIMO POSSÍVEL de cada dado do bloco de Dano em vez de rolar
    // (ex: "4d10" sempre vira "40"). Vazio/zero = rola normalmente.
    usaDanoMaximoCondicional: new BooleanField({ initial: false }),
    formulaDanoMaximoCondicional: new StringField({ initial: "" }),
    // ===== DANO MÁXIMO POR MARGEM DE ACERTO (ex: Guilhotina Devastadora,
    // Guerreiro - "se o teste superar em 10 a Defesa do alvo, o dano é
    // máximo") - mecanismo DIFERENTE do "Dano Máximo Condicional" acima,
    // porque a margem (ataque total - Defesa do alvo) só é conhecida no
    // lado de quem processa o ALVO (pode ser outro cliente), não em quem
    // executa a Ação. Por isso, quando ligado, o dano é rolado DAS DUAS
    // FORMAS (normal e máximo) e as duas viajam dentro do pacote - só no
    // lado do alvo, já sabendo a margem de verdade, escolhe qual delas
    // aplicar de fato.
    usaDanoMaximoPorMargem: new BooleanField({ initial: false }),
    // ===== Condicionais de ataque (Criador de Monstros, M15) =====
    // Dano no erro: quando o teste de ataque ERRA, o alvo ainda sofre esta fórmula (sem reação).
    danoNoErroFormula: new StringField({ initial: "" }),
    // Execução: se, depois do dano, a Vida do alvo ficar ≤ esta fórmula, ela vai a 0 (card avisa).
    limiarExecucaoFormula: new StringField({ initial: "" }),
    // ===== Filtro de área por Condição (M03): a área só atinge quem tem (ou não tem) a Condição;
    // "soMinha" exige que ela tenha sido aplicada por mim (ex.: "esmaga quem está Preso por mim").
    areaSoComCondicaoUuid: new StringField({ initial: "" }),
    areaCondicaoModo: new StringField({ initial: "com" }),      // com | sem
    areaCondicaoSoMinha: new BooleanField({ initial: false }),
    danoMaximoEmPoderosa: new BooleanField({ initial: false }),
    bonusDanoPorAcumuloUuid: new StringField({ initial: "" }),   // + dano por acúmulo desta Condição em CADA alvo (Piromancia: Congelando)
    bonusDanoPorAcumuloValor: new StringField({ initial: "" }),  // quanto por acúmulo (ex.: 10)
    cadeiaCondicaoUuid: new StringField({ initial: "" }),        // acertando um alvo com esta Condição, o dano salta (Esfera de Raios: Queimando)
    cadeiaRaio: new StringField({ initial: "1" }),                // metros ao redor do alvo
    templatePersistentePuxarAoCentro: new BooleanField({ initial: false }), // Singularidade: puxa quem é afetado para o centro
    templatePersistenteIgnorarConjurador: new BooleanField({ initial: false }), // Armadilha de Caça: não afeta quem a criou
    templatePersistenteCargasEstamina: new StringField({ initial: "" }),  // a área guarda cargas que aliados dentro dela usam no lugar de Estamina (ex.: Pintura da Alegria: @quantidadeEscolhida)
    templatePersistenteResistirEstamina: new StringField({ initial: "" }),  // Éolos: pagar N Estamina evita o efeito
    templatePersistenteEmpurrarAleatorio: new StringField({ initial: "" }), // Éolos: empurra (ex.: 1d4) metros em direção aleatória   // em Conjuração Poderosa, o dano sai no máximo (Impacto Arcano, Bola de Fogo com Piromancia)
    margemMinimaDanoMaximo: new NumberField({ initial: 10, min: 1, integer: true }),
    // ===== ATACAR COM ARMA ESCOLHIDA (ex: Investida, Superioridade -
    // Guerreiro) - quando ligado, esta Ação NÃO usa seu próprio bloco de
    // Dano/Ataque: ao usar, mostra um popup pedindo pra escolher uma Arma
    // EQUIPADA e uma das Ações dela (ex: "Ataque Básico" ou "Ataque
    // Pesado") - o dano/ataque/tipo dessa Ação da Arma é usado pra
    // resolver ESTA execução, mas o Custo (Estamina/Mana), Condições
    // Aplicadas, Usos etc. continuam sendo os DESTA Ação (a da
    // Habilidade), não os da Arma - "usa somente a Estamina da
    // Habilidade", nunca soma os dois custos.
    usaArmaEscolhida: new BooleanField({ initial: false }),
    // Fase 7 (Guerreiro): filtros e soma na escolha de arma.
    armaEscolhidaTipos: new ArrayField(new StringField()),             // vazio = qualquer tipo (Leve, Média, Pesada...)
    armaEscolhidaQualAtaque: new StringField({ initial: "" }),         // "" | pesado | basico
    armaEscolhidaSomarDanoProprio: new BooleanField({ initial: false }), // soma os danos desta habilidade ao da arma
    // Quando ligado, o custo (Estamina/Mana) da AÇÃO da arma escolhida
    // SOMA ao custo próprio desta Habilidade, em vez de ser ignorado
    // (comportamento padrão, ver comentário completo em _executarAcao -
    // ex: Investida usa só a Estamina dela mesma, não soma com o "Ataque
    // Pesado" escolhido). Ex: Superioridade - o manual diz "gasta 1
    // Espírito de Batalha COMO PARTE do custo do ataque", ou seja, o
    // custo normal do ataque escolhido (Estamina da arma, +1 extra se
    // for Ataque Pesado, etc) continua valendo por cima.
    usaArmaEscolhidaSomaCusto: new BooleanField({ initial: false }),
    // Escala o(s) dado(s) de dano da Ação da arma ESCOLHIDA (ver
    // usaArmaEscolhida acima) em N "casas" na sequência d4→d6→d8→d10→
    // d12 (nunca passa de d12), ANTES do dano ser rolado - ex: Disparo
    // Carregado (Caçador): "escale o dado de dano da arma em uma casa"
    // (2 no nível 14, 3 no nível 19), funcionando com QUALQUER arma
    // equipada (não precisa de uma arma pré-configurada específica).
    // Ver NaurenActorSheet#_escalarDadosNaFormula.
    usaArmaEscolhidaEscalarDado: new BooleanField({ initial: false }),
    // Quantas casas escalar (fórmula, aceita "@rank") - só usado quando
    // "usaArmaEscolhidaEscalarDado" está ligado.
    armaEscolhidaEscalarCasas: new StringField({ initial: "1" }),
    // Se ligado, "Alcance" desta Ação passa a ser o da AÇÃO da arma
    // escolhida (ex: Disparo Carregado - o alcance real da arma
    // equipada, não um texto genérico sem número) - opt-in porque
    // Investida/Superioridade têm "Alcance" próprio intencional (ex:
    // "seu deslocamento"), que NÃO deveria virar o alcance da arma.
    usaArmaEscolhidaHerdarAlcance: new BooleanField({ initial: false }),
    // Adiciona N dado(s) EXTRA do MESMO tamanho que o maior dado já
    // presente na fórmula de dano da arma escolhida (ex: arma com "1d8"
    // ganha "+1d8" a mais, não um dado fixo pré-configurado) - "N" é uma
    // fórmula (aceita "@rank"), resolvida ANTES de rolar. Ex: Ímpeto
    // (Empíreo) - "causa +1 dado de dano extra", com "@rank" fazendo o
    // número de dados subir junto com o rank da Habilidade (1 dado no
    // rank 1, 2 no rank 2...). Vazio = nenhum dado extra.
    armaEscolhidaDadoExtraFormula: new StringField({ initial: "" }),
    // Bônus de dano FIXO (ou condicional) somado à fórmula da arma
    // escolhida, DEPOIS do dado extra acima - aceita qualquer token,
    // incluindo "@euTenhoCondicao"/"@euTenhoCondicao2" (ver "Verificar
    // Condição em Mim" acima). Ex: Ímpeto (Empíreo) - "+1 de dano extra
    // em Profusão Ousada": "@euTenhoCondicao*(1+@rank-1)" ou similar.
    // Vazio = nenhum bônus extra.
    armaEscolhidaBonusExtraFormula: new StringField({ initial: "" }),
    // ===== ESCOLHER QUANTIDADE DE RECURSO (ex: Prisão das Brumas,
    // Místico - "X alvos, sendo X o número de pontos de Energia
    // gastos") - parecido com Crescimento, mas GENÉRICO pra qualquer
    // Recurso Customizado (Crescimento é sempre atrelado a Mana). Ao
    // usar, mostra um popup pedindo um número (mínimo configurável,
    // máximo = quanto o Ator tem disponível), verifica se há o
    // suficiente, e expõe a escolha como "@quantidadeEscolhida" em
    // qualquer fórmula desta Ação (ex: no Número de Alvos Extra por
    // Crescimento abaixo, ou na quantidade de um Custo de Recurso
    // Próprio).
    usaEscolhaDeRecurso: new BooleanField({ initial: false }),
    escolhaDeRecursoTipo: new StringField({ initial: "" }), // "recursoCustom:ID"
    escolhaDeRecursoMinimo: new NumberField({ initial: 1, min: 1, integer: true }),
    // ===== ESCOLHER UMA CONDIÇÃO (ex: Superioridade, Guerreiro - "Rompe
    // Tornozelo/Rasgar/Desarmar, escolha UM") - lista de UUIDs de
    // Condição pra oferecer num popup na hora de usar a Ação; a
    // escolhida vira uma entrada de "condicoesAplicadas" só PARA ESTA
    // execução (soSeAcertar sempre true, sem custo pra evitar - pra
    // opções mais elaboradas, use "condicoesAplicadas" normal em vez
    // deste campo).
    usaCondicaoEscolhida: new BooleanField({ initial: false }),
    condicoesEscolhidasOpcoes: new ArrayField(new StringField()),
    condicoesEscolhidasRotulos: new ArrayField(new StringField()), // nome de cada opção na janela (ex.: "Rompe Tornozelo"); vazio = nome da Condição
    somarEmAtaquesEspeciais: new BooleanField({ initial: false }), // esta Ação também pode ser somada a um Ataque Especial (ex.: Superioridade)
    // Acúmulos da Condição Escolhida (ex: Estouro de Magma - "1d4
    // acúmulos de Queimando OU Fragmentado") - aceita dado, não só um
    // número fixo. Vazio (padrão) = 1 acúmulo, comportamento de sempre.
    condicoesEscolhidasAcumulosFormula: new StringField({ initial: "" }),
    // ===== PERGUNTAR "ATACOU UM INIMIGO NESTE TURNO?" (ex: várias
    // Habilidades do Místico - Canalizar o Espírito, Restauração
    // Interior, Golpe Espiritual, Prisão das Brumas, Chute do Nascer do
    // Sol, Tinta Celestial: "Efeito Extra: caso tenha realizado um
    // ataque contra um inimigo no mesmo turno...") - o sistema não
    // rastreia automaticamente o histórico de ações do turno, então
    // mostra um popup Sim/Não ao usar a Ação, e expõe a resposta como
    // "@atacouNesteTurno" (1 ou 0) em qualquer fórmula desta Ação -
    // ex: "@atacouNesteTurno" na quantidade de um Gasto de Recurso pra
    // conceder um bônus condicional.
    usaPerguntaAtaqueNoTurno: new BooleanField({ initial: false }),
    // ===== ESCOLHER EFEITO AO USAR (ex: Marca do Caçador - "escolha UM
    // benefício": Foco Mortal, Tiro Letal ou Reflexos de Caça) - lista
    // de UUIDs de itens "efeito" MUTUAMENTE EXCLUSIVOS já concedidos ao
    // Ator (mesmo padrão de "Guardas", Guerreiro: todos vêm junto na
    // ficha, desativados por padrão). Ao usar esta Ação, mostra um
    // popup com um botão por Efeito - o escolhido é ATIVADO e todos os
    // outros da lista são DESATIVADOS automaticamente (garantindo que
    // nunca mais de um fique ativo ao mesmo tempo, diferente de
    // "Guardas" hoje, que depende do jogador lembrar de desativar o
    // antigo manualmente). Resolve a cópia REAL no Ator a partir do
    // UUID de origem (mesmo método de "_alvoTemCondicoes"), não do
    // item do compêndio.
    escolherEfeitoUuids: new ArrayField(new StringField()),
    // ===== CUSTO DE RECURSO PRÓPRIO (ex: Golpe Espiritual, Místico -
    // "Custo: 1 Estamina + 2 Energia") - DIFERENTE de "Gastos de
    // Recurso" acima, que SEMPRE drena do ALVO do ataque, nunca de quem
    // usa a Ação (nome mantido por compatibilidade, mesmo confuso).
    // Este campo aqui é o equivalente de "Custo de Estamina/Mana" pra
    // Recursos Customizados (ex: Energia, Espírito da Batalha) - sempre
    // descontado de VOCÊ MESMO, verificado como um bloqueio ANTES de
    // executar a Ação (igual Estamina/Mana insuficiente já bloqueia
    // hoje), nunca do alvo.
    custosRecursoProprio: new ArrayField(new SchemaField({
      recurso: new StringField({ initial: "" }), // "recursoCustom:ID" (ex: "recursoCustom:energia")
      quantidade: new StringField({ initial: "1" }),
      ativo: new BooleanField({ initial: true }),
      quantidadePorRank: new ArrayField(new SchemaField({
        rank: new NumberField({ initial: 1, min: 1, integer: true }),
        quantidade: new StringField({ initial: "" })
      })),
      // Ver mesmo campo/comentário completo em campoDanoBloco.
      condicaoParaAtivar: new StringField({ initial: "" })
    })),
    // ===== CONCESSÃO AO ATACANTE, CONDICIONAL A ACERTAR/ERRAR (ex:
    // Ímpeto, Empíreo - "Caso o ataque seja bem-sucedido, você recebe +2
    // pontos extras de Determinação. Caso o ataque erre, você recebe +2
    // pontos de Ofuscação extras") - diferente de "Custo de Recurso
    // Próprio" acima (sempre cobrado, ANTES de saber o resultado do
    // ataque): isto aqui CONCEDE (nunca cobra) a VOCÊ MESMO (quem
    // atacou, não o alvo), resolvido DEPOIS da rolagem de ataque, então
    // sabe se acertou ou errou. Só funciona em Ações com "ehAtaque"
    // ligado (precisa de um resultado de acerto/erro pra decidir qual
    // lado aplicar) - reaproveita o mesmo caminho de "Roubar Recurso"
    // pra voltar ao cliente de quem atacou, mesmo quando o alvo é
    // processado no cliente de outro jogador.
    concessaoAoAtacante: new ArrayField(new SchemaField({
      recurso: new StringField({ initial: "" }), // "recursoCustom:ID"
      quandoAplicar: new StringField({ initial: "acertar" }), // "acertar" | "errar" | "sempre"
      quantidade: new StringField({ initial: "1" }),
      ativo: new BooleanField({ initial: true })
    })),
    // ===== ESCUDO (ex: "Escudo de Mana" do Mago, Página 2: "cria uma
    // barreira... possui X pontos de vida sendo X o valor de mana gasto
    // vezes 2") - ao usar esta Ação, DEFINE (não soma) o Escudo do
    // ATOR que a usou pro valor da fórmula (aceita "@mana"/"@rank"/
    // dado). Conjurar de novo SUBSTITUI o Escudo anterior (não
    // acumula) - mesma regra do manual. Todo dano que o Ator sofrer
    // depois disso desconta do Escudo primeiro; só o excedente chega
    // na Vida de verdade (ver NaurenAlvoHelper.calcularDanoComEscudo).
    usaEscudo: new BooleanField({ initial: false }),
    escudoFormula: new StringField({ initial: "" }),
    escudoNoAlvo: new BooleanField({ initial: false }),        // o escudo vai para o(s) alvo(s), não para quem usa
    escudoDuracao: new StringField({ initial: "" }),           // "" = até ser gasto | "fimRodada" | "rodadas"
    escudoDuracaoRodadas: new NumberField({ initial: 1, min: 1, integer: true }),
    escudoSustentarRecurso: new StringField({ initial: "" }),  // "" = não sustenta | "mana"... ao vencer a duração, pergunta se paga para manter mais 1 rodada (Escudo de Mana)
    escudoSustentarQuantidade: new StringField({ initial: "1" }),
    escudoEstresseNaoReduz: new BooleanField({ initial: false }), // o Estresse não corta o dano que o escudo absorve, só o que passa dele (Escudo de Mana)
    // Popup pergunta quantos pontos de Mana o jogador quer gastar
    // NESTA execução, antes de qualquer coisa - substitui o "Custo de
    // Mana" configurado acima só nesta rolagem (ex: Escudo de Mana -
    // "gastar quanto quiser, a barreira sai do dobro disso"). Limitado
    // à Mana atual do Ator. Reutilizável por qualquer Ação com custo
    // variável, não só Escudo.
    usaPerguntarQuantidadeMana: new BooleanField({ initial: false }),
    // Popup pergunta "foi conjurada na Prioridade?" antes de executar
    // (ex: Retardo Temporal - "conjurada na Prioridade causa 2
    // acúmulos adicionais") - se "sim", soma "acumulosExtraSePrioridade"
    // a TODOS os acúmulos de TODAS as Condições Aplicadas configuradas
    // nesta Ação. Sem hardcoded de qual magia é - qualquer Ação com
    // Condições Aplicadas pode usar isso.
    usaPerguntarPrioridade: new BooleanField({ initial: false }),
    acumulosExtraSePrioridade: new NumberField({ initial: 0, integer: true }),
    // ===== Teste de Falha Escalonado (ex: Provação do Entrelaço,
    // Sacerdote - "role 1d6, falha em 1; a cada uso consecutivo a
    // faixa de falha aumenta") - genérico e sem hardcoded de qual
    // Habilidade/classe é: qualquer Ação pode compor estes campos.
    // Ao usar esta Ação, rola "testeFalhaDado" e falha se o resultado
    // for MENOR OU IGUAL ao valor atual (+1) do Recurso Customizado
    // apontado em "testeFalhaContadorRecurso" (0 = falha só em 1,
    // 1 = falha em 1-2, e assim por diante, até o próprio dado
    // esgotar as faces). Mostra o resultado no chat (card de rolagem
    // padrão) dizendo se falhou ou não. "testeFalhaIncrementaAoUsar"
    // (padrão true) soma 1 ao contador depois de cada uso - outra
    // Ação (ex: "Aceitar a Penitência" de uma Magia) pode ZERAR esse
    // mesmo contador via "penitenciaResetaContadorRecurso" abaixo,
    // reiniciando a escalada. Uma Subclasse pode compor uma versão
    // própria (dado diferente, contador próprio) sem tocar nesta.
    usaTesteDeFalhaEscalonado: new BooleanField({ initial: false }),
    testeFalhaDado: new StringField({ initial: "1d6" }),
    testeFalhaContadorRecurso: new StringField({ initial: "" }), // "recursoCustom:ID"
    testeFalhaIncrementaAoUsar: new BooleanField({ initial: true }),
    // Texto mostrado no card quando o teste FALHA (ex: "A magia
    // falha!") - vazio usa um texto padrão genérico.
    testeFalhaTextoFalha: new StringField({ initial: "" }),
    testeFalhaAntesDoEfeito: new BooleanField({ initial: false }), // o teste antecede o efeito: falhou = paga o custo sem efeito; passou = a Ação segue
    testeFalhaSoMostrar: new BooleanField({ initial: false }),     // só mostra o risco atual no chat, sem rolar nem mexer no contador
    // ===== Penitência (Sacerdote - "Toda vez que usa uma magia, o
    // jogador deve escolher: Evitar a penitência... ou Aceitar a
    // penitência: sofre o dano ou estresse descrito na magia... e
    // ainda ganha um bônus adicional") - genérico e sem hardcoded de
    // qual Magia é: qualquer Ação com "ehMagiaDeSacerdote" (no item
    // pai) marcado e "usaPenitencia" aqui mostra o popup "Evitar/
    // Aceitar a Penitência" antes de conjurar.
    usaPenitencia: new BooleanField({ initial: false }),
    // "Evitar": rola "penitenciaTesteDado" e falha se o resultado for
    // ≤ o valor atual (+1) do Recurso Customizado em
    // "penitenciaTesteContadorRecurso" (mesma mecânica de
    // "usaTesteDeFalhaEscalonado" acima, reaproveitada aqui direto na
    // Magia em vez de precisar apontar pra uma Habilidade separada).
    penitenciaTesteDado: new StringField({ initial: "1d6" }),
    penitenciaTesteContadorRecurso: new StringField({ initial: "" }), // "recursoCustom:ID"
    penitenciaFalhaZeraRisco: new BooleanField({ initial: true }), // 0.94.15: a magia que falha ao Evitar zera o contador (o risco volta a 1)
    // "Aceitar": sofre este custo (aceita "vida"/"estresse"/"estamina"/
    // "mana"/"recursoCustom:ID" - qualquer chave de RECURSOS_ALVO ou
    // Recurso Customizado). "vida" já desconta direto, sem passar por
    // Redução de Dano Sofrido nem Escudo (mesmo caminho de "Custo de
    // Recurso Próprio") - é o "dano verdadeiro em você mesmo" que a
    // Penitência pede. Zera também "penitenciaTesteContadorRecurso"
    // (reinicia a escalada de risco de Evitar, já que a sequência
    // "consecutiva sem penitência" foi interrompida).
    penitenciaCustoRecurso: new StringField({ initial: "" }),
    penitenciaCustoQuantidade: new StringField({ initial: "1" }),
    // Dado(s) extra concedido(s) SÓ se aceitar a penitência - "auto" =
    // maior dado já presente na fórmula BASE do bloco de dano/cura
    // sendo rolado (mesma resolução de "auto" já usada em
    // campoModificador > danoDado/curaDado). Tabela "Por Rank" PRÓPRIA
    // e INDEPENDENTE da tabela do bloco de dano/cura normal - a magia
    // pode escalar os dois em ranks diferentes (ex: Sanatio: cura vai
    // de d6 pro rank 3, o bônus de penitência já sobe pro rank 2).
    penitenciaBonusDanoDado: new StringField({ initial: "" }),
    penitenciaBonusDanoDadoPorRank: new ArrayField(new SchemaField({
      rank: new NumberField({ initial: 1, min: 1, integer: true }),
      formula: new StringField({ initial: "" })
    })),
    penitenciaBonusCuraDado: new StringField({ initial: "" }),
    penitenciaBonusCuraDadoPorRank: new ArrayField(new SchemaField({
      rank: new NumberField({ initial: 1, min: 1, integer: true }),
      formula: new StringField({ initial: "" })
    })),
    // Se aceitar a penitência, o popup de reação da Cura (ver
    // _resolverUmEventoDeCura) também oferece ao alvo a escolha entre
    // remover 1 acúmulo de uma Condição ativa dele (à escolha) OU 1
    // ponto de Estresse (se houver) - sem hardcoded de qual Condição.
    penitenciaRemoverCondicaoOuEstresse: new BooleanField({ initial: false }),
    penitenciaSemPrioridade: new BooleanField({ initial: false }), // aceitar: esta Ação não gera Prioridade (ex.: Condemnatio)
    // Texto puramente narrativo mostrado no card quando a Penitência é
    // aceita (ex: Condemnatio - "Este ataque não gera Prioridade") -
    // pra efeitos que o sistema não tem como automatizar de verdade,
    // mas que ainda devem aparecer registrados no resultado, junto do
    // dano/cura e do dado da Penitência - nunca silenciosos.
    penitenciaTextoEfeitoNarrativo: new StringField({ initial: "" }),
    // Dobra o CUSTO desta MESMA Ação (Estamina e Mana) quando a
    // Penitência é aceita (ex: Redemptio - "dobrar o custo: 6
    // Estamina, 10 Mana") - aplicado ANTES do custo normal ser
    // descontado (a cópia local de "acao" ainda não foi processada
    // pra custo neste ponto do fluxo).
    penitenciaDobraCustoPrincipal: new BooleanField({ initial: false }),
    // Dobra os acúmulos de TODAS as Condições Aplicadas desta Ação
    // quando a Penitência é aceita (mesmo padrão de
    // condensarDobraAcumulos, mas pro caminho de Penitência - ex:
    // Redemptio, se representar "-3/-6 Vida Máxima permanente" como
    // 1/2 acúmulos de uma Condição "-3 Vida Máxima" por acúmulo).
    penitenciaDobraCondicoesAcumulos: new BooleanField({ initial: false }),
    // Dobra a quantidade de TODOS os Gastos de Recurso do ALVO desta
    // Ação quando a Penitência é aceita (ex: Benedictio - "concede 2
    // Dados de Destino em vez de 1", representado como um Gasto de
    // Recurso negativo "-1" que dobra pra "-2").
    penitenciaDobraGastosRecurso: new BooleanField({ initial: false }),
    // Muda o Modo de Alvo desta Ação de "selecionado" (padrão) pra
    // "area" quando a Penitência é aceita (ex: Fortitudo - "o efeito
    // se estende a todos os aliados num raio de 6 metros" em vez de 1
    // aliado escolhido). Coloca um Template no mapa normalmente (igual
    // qualquer outra Ação de área) - sem hardcoded de qual Magia é.
    penitenciaMudaParaArea: new BooleanField({ initial: false }),
    penitenciaAreaTamanho: new StringField({ initial: "6" }),
    penitenciaAreaTipo: new StringField({ initial: "circle" }), // circle|cone|rect|emanacao (mesmas opções de templateTipo)
    penitenciaAreaDisposicao: new StringField({ initial: "aliados" }), // aliados|inimigos|todos
    // ===== Conjuração Poderosa - efeito EXTRA fixo (some por cima da
    // escolha normal de 5 opções em _popupCondensarMagia, nunca a
    // substitui) - algumas magias têm um efeito PRÓPRIO e específico
    // descrito no texto delas quando conjuradas de forma poderosa (ex:
    // Retardo Temporal "dobra todos os acúmulos", Espada Lunar "dobra
    // o dado e aumenta 1m de alcance", Chuva de Estrelas "dura 1
    // rodada sem pagar sustentação") - qualquer que seja a opção das 5
    // escolhida, se a Ação tiver um destes campos configurados, o
    // efeito extra some também. Compostos livremente, sem exigir
    // todos. Continua sem hardcoded de qual magia é - qualquer Ação
    // pode compor estes campos como quiser. =====
    condensarDobraAcumulos: new BooleanField({ initial: false }),
    condensarDobraDanoDado: new BooleanField({ initial: false }),
    condensarAlcanceExtraMetros: new NumberField({ initial: 0 }),
    condensarSustentarSemCusto: new BooleanField({ initial: false }),
    // Efeito próprio da magia em Conjuração Poderosa, em qualquer campo da
    // Ação (mesmo motor das camadas: substituir, somar, multiplicar...).
    // Ex.: Arco Glacial - templateLargura somar 1 e templateTamanho somar 4.
    condensarModificadores: new ArrayField(new SchemaField({
      campo: new StringField({ initial: "" }),
      modo: new StringField({ initial: "somar" }),
      valor: new StringField({ initial: "" })
    })),
    // ===== Conjurar Arma (ex: Espada Lunar, Mago) - ao usar esta Ação,
    // cria (ou SUBSTITUI, se já existir uma da MESMA origem - nunca
    // duplica) um Item de arma real no inventário do Ator, pronta
    // equipada. Os dados abaixo descrevem essa arma - "armaConjuradaFormula"
    // e "armaConjuradaAlcance" são os mesmos afetados por
    // condensarDobraDanoDado/condensarAlcanceExtraMetros acima (ver
    // bloco de Conjuração Poderosa), então uma magia como Espada Lunar
    // usa o MESMO mecanismo fixo de Conjuração Poderosa já existente,
    // só que aplicado na arma gerada em vez da própria Ação de
    // conjurar. Sem hardcoded de qual magia é - qualquer Ação pode
    // ativar isso. =====
    usaConjurarArma: new BooleanField({ initial: false }),
    armaConjuradaNome: new StringField({ initial: "" }),
    armaConjuradaImg: new StringField({ initial: "" }),
    armaConjuradaFormula: new StringField({ initial: "" }),
    armaConjuradaAtributoAtaque: new StringField({ initial: "poderAtaque" }),
    armaConjuradaAlcance: new StringField({ initial: "1m" }),
    armaConjuradaCustoMana: new NumberField({ initial: 0 }),
    armaConjuradaCustoEstamina: new NumberField({ initial: 0 }),
    armaConjuradaTipo: new StringField({ initial: "" }),
    armaConjuradaArremesso: new StringField({ initial: "" }),       // "" = não arremessa; ex.: "4m" (Arma Leve, livro)
    // ===== Conjurar Consumível (ex: Criar Comida e Bebida, Mago) - ao
    // usar esta Ação, cria (ou SOMA quantidade, se já existir uma da
    // MESMA origem - diferente de Conjurar Arma, que substitui, comida
    // faz sentido acumular) um Item consumível real no inventário do
    // Ator. "consumivelCriadoGastosRecurso" usa o mesmo formato de
    // gastosRecurso (ver campoAcao acima) - aceita fórmula com dado
    // (ex: "-1d4" restaura vida, valores negativos restauram em vez de
    // gastar, já que gastosRecurso sempre subtrai o recurso do alvo).
    // Sem hardcoded de qual magia é - qualquer Ação pode ativar isso.
    // =====
    usaConjurarConsumivel: new BooleanField({ initial: false }),
    consumivelCriadoNome: new StringField({ initial: "" }),
    consumivelCriadoImg: new StringField({ initial: "" }),
    consumivelCriadoQuantidade: new NumberField({ initial: 1, integer: true }),
    consumivelCriadoGastosRecurso: new ArrayField(new SchemaField({
      recurso: new StringField({ initial: "vida" }),
      quantidade: new StringField({ initial: "1" })
    })),
    // Desloca o Crítico Mínimo desta Ação especificamente (não mexe na
    // configuração geral da ficha, em Opções) - aceita "+"/"-" (desloca) ou
    // "@alvoAcumulos" (ex: "-@alvoAcumulos" reduz 1 no crítico necessário
    // pra cada acúmulo que o alvo tiver, então Estudado 3 = precisa de
    // 17+ em vez de 20 pra ser crítico).
    critMinAjuste: new StringField({ initial: "" }),
    // Dano Extra em Crítico (ex: Estouro de Magma, Mago - "em um
    // acerto crítico, causa 5d12 de dano extra") - diferente da dobra
    // padrão de crítico (que já dobra os dados normais da fórmula de
    // dano): esta fórmula soma um dano ADICIONAL só quando o ataque
    // for crítico, por cima da dobra normal, sem participar dela
    // (rolada separadamente, uma vez só). Vazio (padrão) = desligado.
    danoExtraEmCritico: new StringField({ initial: "" }),
    // Roubar Recurso (ex: "Roubar Destino" do Ladino): ao
    // ACERTAR este ataque, transfere uma quantidade de um recurso do alvo
    // pra quem usou a Ação - ver naurenTransferirRecursoDoAlvo. Nunca rouba
    // mais do que o alvo tem, nem concede mais do que cabe no atacante.
    usaRoubarRecurso: new BooleanField({ initial: false }),
    roubarRecursoTipo: new StringField({ initial: "dadosDestino" }), // vida|mana|estaminaCombate|dadosDestino|recursoCustom:<id>
    roubarQuantidade: new StringField({ initial: "1" }),
    // Empurrar ao Acertar (ex: Golpe de Escudo, Investida
    // Relâmpago) - move o alvo N metros PRA LONGE de quem atacou, em linha
    // reta (não verifica parede/colisão - simplificação deliberada de V1).
    usaEmpurrar: new BooleanField({ initial: false }),
    empurrarMetros: new StringField({ initial: "2" }),          // aceita @rank (ex.: "@rank")
    // Fase 6 (Mv): direção e colisão.
    empurrarDirecao: new StringField({ initial: "afastar" }),   // afastar | puxar
    empurrarColisaoDano: new StringField({ initial: "" }),     // ex.: "1d8" - ao bater em parede ou personagem
    empurrarColisaoAmbos: new BooleanField({ initial: false }),// o personagem atingido também sofre o dano
    // Resistir a ser movido (empurrar, puxar ou mover o alvo): por padrão o alvo pode usar a Prioridade
    // dele para não sair do lugar (livro: Ações com Múltiplas Etapas). "custo": paga um recurso; "nunca": não resiste.
    movimentoEvitar: new StringField({ initial: "" }),           // "" (Prioridade ou 1 Estamina) | custo (Prioridade ou o custo abaixo) | nunca
    movimentoEvitarRecurso: new StringField({ initial: "estamina" }),
    movimentoEvitarQuantidade: new StringField({ initial: "1" }),
    // ===== ATROPELADOR (Peculiaridade de monstro - ver Codex Bestiariun,
    // "As Feras de Nauren") ===== Ao ACERTAR esta Ação, causa dano direto
    // (sem teste de ataque, sem Prioridade/reação do afetado) em todo
    // inimigo ADJACENTE ao alvo PRINCIPAL - representa "cada inimigo
    // adjacente ao alvo de um atropelador recebe o indicador numérico em
    // dano sempre que o atropelador acertar". "adjacente" (Cap. III do
    // manual) = até 1m de distância por padrão, mas o raio é configurável
    // porque o próprio Codex diz que pode variar de espécie pra espécie.
    usaAtropelador: new BooleanField({ initial: false }),
    atropeladorQuantidade: new StringField({ initial: "2" }), // fórmula, aceita @token
    atropeladorRaio: new StringField({ initial: "1" }),
    // ===== IMPARÁVEL (Peculiaridade de monstro - mesma origem acima) =====
    // Garante que uma quantidade FIXA de dano passa mesmo se o alvo
    // Bloquear com sucesso (que normalmente reduz pro "dano mínimo" - ver
    // _aplicarReacaoDano). Não afeta Esquivar (que evita o dano por
    // completo) nem um acerto normal sem bloqueio (que já causa o dano
    // cheio de qualquer forma) - só existe pra "furar" especificamente um
    // Bloqueio bem-sucedido.
    imparavelQuantidade: new StringField({ initial: "" }), // fórmula, vazio = desligado
    // Aplicar ao Defletir/Contra-Atacar: quando esta Ação
    // (de uma Arma) é usada pra Contra-Atacar (ver _aplicarReacaoDano), se
    // o resultado for Deflexão, aplica a Condição/Efeito referenciada aqui
    // no ATACANTE ORIGINAL - permite ex: aplicar "Caído" automaticamente,
    // sem precisar de ajuste manual. "condicaoAoContraAtacar" é parecido,
    // mas dispara em QUALQUER contra-ataque bem-sucedido (acertou o
    // atacante), não só em Deflexão especificamente.
    condicaoAoDefletir: new StringField({ initial: "" }),
    condicaoAoContraAtacar: new StringField({ initial: "" }),
    // Dar Prioridade (início da integração de Prioridade): Ação SEM
    // rolagem (funciona como um ataque, mas sem 1d20 - o card de chat sai
    // no mesmo padrão visual, só que sem a caixinha de dado) que avisa um
    // alvo escolhido que "recebeu Prioridade" - dispara o Gatilho por
    // Evento "recebeuPrioridade" nele (ver naurenProcessarGatilhos), pra
    // que uma Habilidade dele reaja automaticamente (ex: ganhar 1 de
    // Estamina). NÃO implementa o sistema de Prioridade completo do
    // manual (turno de reação, "roubar" prioridade etc - fica de fora de
    // propósito) - é só o gatilho + a narração no chat, uma peça que já
    // destrava vários usos (ex: "Gerar Abertura" de qualquer classe).
    usaDarPrioridade: new BooleanField({ initial: false }),
    // Conceder Habilidade ao Alvo (ex: Matilha, Druida - "um aliado seu
    // recebe [uma Habilidade] de sua forma") - concede uma cópia da
    // Habilidade/Magia/Arma indicada (UUID) DIRETO em cada alvo
    // resolvido por esta Ação, sem depender de acerto nem gerar
    // Prioridade. Não se desfaz sozinho - remova manualmente quando não
    // fizer mais sentido (ex: ao desativar a Forma que a concedeu).
    concederHabilidadeAoAlvoUuid: new StringField({ initial: "" }),
    // Fase 6 (A): "permanente" ou "cena" (removida quando o combate termina).
    concederHabilidadeDuracao: new StringField({ initial: "permanente" }),
    // Fase 6 (O): entidade de campo (orbe, estrutura...) controlada por um
    // card no chat. Todos os textos aceitam @rank e atributos de quem usou.
    // Fase 7: depois da Ação, quem usou escolhe no mapa para onde mover
    // (você ou cada alvo afetado), até X metros. "Teleporte" ignora paredes.
    // Marca a Ação como "de cura" para reduções de custo e filtros "só curas"
    // (útil quando a cura vem de uma Condição periódica, ex.: Infusão Floral).
    marcadaComoCura: new BooleanField({ initial: false }),
    naoGeraPrioridade: new BooleanField({ initial: false }),       // esta Ação nunca gera Prioridade
    lembreteNoCard: new StringField({ initial: "" }),               // linha "Na mesa" no card: o que o Mestre resolve à mão ("@alvo" = nomes)
    usaEstudar: new BooleanField({ initial: false }),
    usaConjuracaoPoderosa: new BooleanField({ initial: false }),    // Conjuração Poderosa (Mago, 0.91): escolhe um efeito e arma na próxima magia              // esta Ação é "Estudar" um alvo (Análise Paciente)
    estudosPorSucesso: new StringField({ initial: "1" }),
    semPoderMagiaNoDano: new BooleanField({ initial: false }),     // Magia cuja descrição diz que NÃO soma o Poder Mágico no dano
          // quantos estudos um sucesso no "Estudar" dá (Olhar da Morte: 2)
    puxarInimigosEstudados: new BooleanField({ initial: false }),  // Manipular a Verdade: inimigos estudados a até 9m vão até o aliado alvo (ou sofrem Estresse)
    usaEmprestarHabilidade: new BooleanField({ initial: false }),  // Falsificar Seu Destino: pegar uma habilidade de um aliado
    usaDomar: new BooleanField({ initial: false }),                // Domar Besta: cada uso avança a doma do alvo
    // Esta Ação usa o efeito de OUTRO item do personagem (ex.: Punição Celestial = Condemnatio com o bônus de
    // penitência; Banhar-se em Graças = Sanatio com o bônus de penitência em você). Sem custo, sem sofrer a penitência.
    danoSemBonus: new BooleanField({ initial: false }),
    curaMultiplicador: new StringField({ initial: "" }),
    exigeCondicaoEmMimNome: new StringField({ initial: "" }), // só dá para usar com esta Condição (ex.: Milagres só com Santificado)
    consumirCondicaoExigida: new BooleanField({ initial: false }), // ao usar, a Condição exigida sai // multiplica a cura total desta Ação (ex.: Milagre A Cura das Chagas: Sanatio cura o dobro) // o dano é exatamente a fórmula (ex.: Halo repete o dano da penitência): sem bônus nem penalidades
    executarItemSeedId: new StringField({ initial: "" }),
    executarItemNome: new StringField({ initial: "" }),
    executarComBonusPenitencia: new BooleanField({ initial: false }),
    executarAcertoAutomatico: new BooleanField({ initial: false }), // sem teste de ataque: o efeito acerta
    executarEmMim: new BooleanField({ initial: false }),
    usaBestaInicial: new BooleanField({ initial: false }),         // Domar Besta: escolher a besta inicial (Urso, Cobra ou Lobo), 1 vez
    condicaoEmMimExtraUuid: new StringField({ initial: "" }),      // uma 2ª Condição em você (1 acúmulo), junto da primeira
    escolherBeneficioMarca: new BooleanField({ initial: false }),  // Marca do Caçador: escolher Foco Mortal / Tiro Letal / Reflexos e gravar na marca
    rolarBrinde: new BooleanField({ initial: false }),             // Brinde ao Destino: rola 1d6 (1 = Estresse; Dança/Inundação)
    exigirCondicaoAlvo: new BooleanField({ initial: false }),      // com "Verificar Condição no Alvo": sem ela no alvo, não deixa usar
    exigirCondicaoAlvoMinimo: new NumberField({ initial: 1, min: 1, integer: true }),
    // Recupera um recurso por INIMIGO atingido por esta Ação (Gruhua, Senhor das Brumas: 1 Energia por inimigo,
    // só se você atacou neste turno - pergunta "Você atacou neste turno?" quando a opção estiver ligada).
    recursoPorAlvoAtingido: new StringField({ initial: "" }),
    recursoPorAlvoAtingidoQtd: new StringField({ initial: "1" }),
    recursoPorAlvoSoSeAtacou: new BooleanField({ initial: false }), // quantos acúmulos o alvo precisa ter (Shirintou: 5 Palavras)
    umaVezPorCenaPorAlvo: new BooleanField({ initial: false }),    // cada alvo só pode receber esta Ação 1 vez por cena (Shirintou, livro 0.8)
    trocarLugarSeAtacou: new BooleanField({ initial: false }),     // Surgir da Palavra: se já atacou no turno, pode trocar de lugar com o alvo
    trocarLugarComAlvo: new BooleanField({ initial: false }),      // troca de lugar com o alvo marcado, sem perguntar (ex.: Permuta, monstros)
    danoComoGolpeEspiritual: new BooleanField({ initial: false }), // Sequência Caligráfica: o dado segue o rank do Golpe Espiritual
    usaConcederHeranca: new BooleanField({ initial: false }),      // Colorir!: dar uma Herança de Cor nova ao alvo
    usaDobrarHeranca: new BooleanField({ initial: false }),        // Conexão com a Arte: dobrar uma Herança de Cor do alvo
    subirIniciativa: new BooleanField({ initial: false }),         // Comoção: os alvos sobem 1 casa na Ordem de Combate
    consumivelCriadoModeloUuid: new StringField({ initial: "" }),   // cria uma cópia deste consumível do compêndio (com as Ações dele)
    consumivelCriadoOpcoesUuids: new ArrayField(new StringField()),  // ou escolhe qual criar numa lista (ex.: Receita Antiga: um veneno)
    consumivelCriadoCuraFormula: new StringField({ initial: "" }),   // troca a cura da 1ª Ação do item criado (ex.: Receita Antiga: 6)
    aplicarVeneno: new BooleanField({ initial: false }),
    consomePerjurio: new BooleanField({ initial: false }),           // só pode ser usada gastando 1 Perjúrio do Acaso do Grupo (habilidade de monstro)
    sustentarPorTurno: new BooleanField({ initial: false }),        // Raio Dourado: a cada turno de QUALQUER combatente, pergunta se sustenta; acerta direto
    sustentarCustoMana: new NumberField({ initial: 2, min: 0, integer: true }),
    sustentarFormula: new StringField({ initial: "" }),             // vazio = a fórmula do 1º dano da Ação
    sustentarIncremento: new NumberField({ initial: 5, integer: true }), // + este valor a cada turno sustentado
    usosDeOutroItemNome: new StringField({ initial: "" }),
    // ===== Recarga (0.94, Inventor e armas com usos): esta Ação devolve usos ao item (ou à Ação indicada).
    seguirOExemplo: new BooleanField({ initial: false }),            // 0.102.4: Seguir o Exemplo (Empíreo): treino com um aliado, conta 5 e dá +1 de atributo aos dois
    abrirConstrucao: new StringField({ initial: "" }),            // "criar" | "melhorar": abre a Bancada desta Habilidade (sem custo)
    abrirConstrucaoFonte: new StringField({ initial: "" }),       // nome da Habilidade com a tabela (ex.: Retornar ao Projeto abre a da Arma de Inventor)
    recarregaUsos: new BooleanField({ initial: false }),
    recarregaFormula: new StringField({ initial: "1d6" }),        // quanto volta (aceita dado e @termos)
    recarregaBonus: new StringField({ initial: "" }),             // somado ao valor rolado (ex.: +1 por Carregador)
    recarregaSoSeVazio: new BooleanField({ initial: true }),      // só pode recarregar sem usos
    recarregaGratisPorCena: new NumberField({ initial: 0, min: 0, integer: true }), // quantas Recargas por combate saem sem Estamina
    // Restaurar um recurso seu (0.94, genérico): ex.: Meditar 1 hora devolve todos os Pontos de Invenção.
    // restauraRecurso: "recursoCustom:pdi" | "estaminaCombate" | "mana"...; quantidade vazia = até o máximo.
    restauraRecurso: new StringField({ initial: "" }),
    // 0.94.1 (Frascos): sem alvo marcado, a Ação vale em você; "bebeFrasco" aplica o Frasco deste item
    // (benefícios + colateral); "usaFrascoDoInventario" escolhe um Frasco da mochila (Frasco Explosivo).
    alvoPadraoEu: new BooleanField({ initial: false }),
    bebeFrasco: new BooleanField({ initial: false }),
    usaFrascoDoInventario: new BooleanField({ initial: false }),
    // Recarga de outro item (ex.: Exercício Teórico devolve o "Preparar Frasco"); se não existir, nada acontece.
    recarregaItemNome: new StringField({ initial: "" }),
    // 0.94.3 (genéricos): efeitos simples em você / no alvo (mesmo vocabulário dos Frascos), criar um Frasco
    // especial na mochila e gastar 1 uso de um item de projeto (ex.: a Arma de Inventor).
    efeitosEmMim: new ArrayField(new ObjectField()),
    efeitosNoAlvo: new ArrayField(new ObjectField()),
    criaFrasco: new ObjectField({ initial: {} }),
    gastaUsoDeProjeto: new StringField({ initial: "" }),
    soEmPrioridade: new BooleanField({ initial: false }), // 0.94.3: em combate, só dentro de uma Prioridade (Frasco Explosivo)
    recarregaAcaoNome: new StringField({ initial: "" }),
    restauraQuantidade: new StringField({ initial: "" }),
    // Usos PRÓPRIOS desta Ação mesmo num item com usos compartilhados (ex.: Estouro: 1 por cena, além do uso da arma).
    usosProprios: new BooleanField({ initial: false }),
    custoUsosItem: new NumberField({ initial: 0, min: 0, integer: true }),  // também gasta N usos do item           // gasta os usos da 1ª Ação de outro item (ex.: Preparar veneno usa os do Remédios do Caçador)            // aplica o veneno deste consumível numa arma ou munição do inventário
    virarPagina: new NumberField({ initial: 0, integer: true }),   // Grimório: 1 = frente, -1 = voltar, 99 = página marcada
    aprenderMagia: new BooleanField({ initial: false }),           // Onisciência: escolher uma magia nova da lista do Mago
    escolherAtributos: new BooleanField({ initial: false }),       // Virtude da Nobreza: escolher os 2 atributos que sobem
    moverPertoDoAlvo: new BooleanField({ initial: false }),        // "Mover escolhendo": a distância conta a partir do ALVO (Surgir da Palavra)
    usaRevelarHabilidades: new BooleanField({ initial: false }),   // Conhecimento das Selvas: mostra as habilidades do alvo
    danoDiretoSemTeste: new BooleanField({ initial: false }),      // Ação Anunciada: o dano vai direto, sem teste de ataque (os alvos reagem)
    repetirSeDanoMaximo: new BooleanField({ initial: false }),
    removerImobilizacaoEmMim: new BooleanField({ initial: false }), // tira de você as Condições que travam o Movimento em 0 (Preso, Enraizar...) - Salto Etéreo     // todos os dados no máximo: a Ação se repete sem custo, na mesma Ação (Mísseis Arcanos)
    // Converter um recurso SEU em outro (ex.: Retalhador Brutal - Estresse em Estamina).
    usaConverterRecurso: new BooleanField({ initial: false }),
    converterDe: new StringField({ initial: "estresse" }),         // estresse | estamina | mana | vida | destino
    converterPara: new StringField({ initial: "estamina" }),
    converterModo: new StringField({ initial: "escolher" }),       // escolher | tudo | fixo
    converterQuantidade: new StringField({ initial: "1" }),        // no modo "fixo"
    converterMaximo: new StringField({ initial: "" }),             // no modo "escolher": teto de quanto pode converter (aceita @crescimento, ex.: Sabedoria das Copas "2+2*@crescimento")
    requerEscudo: new BooleanField({ initial: false }),            // só pode usar com um escudo equipado
    // Fase 7 (Sacerdote):
    curaExcedenteCondicaoUuid: new StringField({ initial: "" }),  // Condição no alvo se a cura passar do máximo (Costurar a Vida)
    penitenciaRemocoesExtras: new StringField({ initial: "0" }),  // remoções extras de Condição/Estresse com penitência (Símbolo Sagrado)
    curaAliadosFormula: new StringField({ initial: "" }),
    curaAliadosSoComPenitencia: new BooleanField({ initial: false }), // a cura em aliados só vale aceitando a penitência
    alvoSoAliadosMenosEu: new BooleanField({ initial: false }),       // só aliados, nunca você (Benedictio)         // cura aliados a até X m de você (Nova Sagrada com penitência)
    curaAliadosRaio: new StringField({ initial: "" }),
    penitenciaTambemEmMim: new BooleanField({ initial: false }),
    penitenciaAreaExcluirEu: new BooleanField({ initial: false }),  // com penitência, a área não inclui você (Fortitudo)
    areaExcluirEu: new BooleanField({ initial: false }),            // a área (com filtro de lado) não inclui você
    // Efeito permanente em você (soma num único Efeito, sem ícone no token).
    // Ex.: Redemptio - "-3-3*@penitenciaAceita" de Vida máxima.
    efeitoPermanenteNome: new StringField({ initial: "" }),
    efeitoPermanenteCampo: new StringField({ initial: "" }),
    efeitoPermanenteValor: new StringField({ initial: "" }),              // a cada uso (número)
    efeitoPermanenteValorPenitencia: new StringField({ initial: "" }),    // a cada uso com penitência (vazio = igual)   // com penitência, as Condições da Ação também caem em você (Fortalecer a Palavra)
    // Fase 7: concede ao alvo N benefícios do SEU estado ativo de um grupo
    // exclusivo (ex.: Matilha - benefícios da Forma do Druida), até o fim
    // do combate.
    usaConcederBeneficios: new BooleanField({ initial: false }),
    beneficiosGrupo: new StringField({ initial: "" }),
    beneficiosQuantidade: new StringField({ initial: "2" }),      // aceita @rank
    usaMoverEscolhendo: new BooleanField({ initial: false }),
    moverQuem: new StringField({ initial: "eu" }),              // eu | alvo
    moverMetros: new StringField({ initial: "1" }),             // aceita @rank
    moverTeleporte: new BooleanField({ initial: false }),
    moverMomento: new StringField({ initial: "depois" }),        // depois (da Ação) | antes (do ataque, ex.: Investida)
    usaEntidade: new BooleanField({ initial: false }),
    entidadeNome: new StringField({ initial: "" }),
    entidadeCargas: new StringField({ initial: "" }),              // vazio = sem cargas
    entidadeVida: new StringField({ initial: "" }),                // vazio = não pode ser destruída por dano
    entidadeInteracaoCusto: new StringField({ initial: "0" }),      // Estamina de quem interage
    entidadeInteracaoCura: new StringField({ initial: "" }),       // cura em quem interage
    entidadeInteracaoCondicaoUuid: new StringField({ initial: "" }),
    entidadeAoEsgotarCura: new StringField({ initial: "" }),       // cura em área ao acabar as cargas
    entidadeAoEsgotarRaio: new StringField({ initial: "" }),       // metros (aliados de quem criou)
    entidadeTamanho: new StringField({ initial: "1" }),             // casas (compatibilidade: largura = altura)
    entidadeLargura: new StringField({ initial: "" }),              // casas; vazio = usa "Tamanho"
    entidadeAltura: new StringField({ initial: "" }),               // casas; vazio = usa "Tamanho"
    entidadeMaximo: new StringField({ initial: "" }),
    entidadeImagem: new StringField({ initial: "" }),               // imagem do token (vazio = ícone do item)               // quantas desta entidade o mesmo personagem mantém ao mesmo tempo (vazio = sem limite)
    entidadeBloqueia: new BooleanField({ initial: false }),         // cria paredes em volta (bloqueia passagem e visão)
    // Fase 5 (M13): a entidade nasce colada no alvo e segura as Condições desta Ação (Rede, Amarra).
    entidadeNoAlvo: new BooleanField({ initial: false }),           // surge ao lado do alvo atingido, sem escolher no mapa
    entidadeSeguraCondicoes: new BooleanField({ initial: false }),  // destruir a entidade solta o alvo; o alvo se soltar desfaz a entidade
    // Fase 5 (M10): invocar ficha - põe tokens no mapa e na iniciativa (Chamar Reforços, Ninhada, Cisão).
    usaInvocar: new BooleanField({ initial: false }),
    invocarAtorUuid: new StringField({ initial: "" }),              // ficha (mundo ou compêndio) a invocar
    invocarCopiaDeMim: new BooleanField({ initial: false }),        // invoca uma cópia de quem usou (com as Condições atuais)
    invocarDividirVida: new BooleanField({ initial: false }),       // com cópia: a Vida atual é dividida entre as duas
    invocarQuantidade: new StringField({ initial: "1" }),           // aceita @categoria, @rank, @nivel
    invocarDistancia: new StringField({ initial: "2" }),            // metros em volta de quem usou
    invocarNaIniciativa: new BooleanField({ initial: true }),       // entra logo depois de quem invocou
    // Múltiplos Ataques (ex: Mísseis Arcanos do Mago - "dispare até 3
    // projéteis, faça uma jogada de ataque para cada"): repete o teste de
    // ataque e o(s) bloco(s) de Dano da Ação a quantidade de vezes
    // indicada, cada repetição com sua própria rolagem de 1d20 e sua
    // própria checagem de acerto contra a Defesa do alvo. Só o dano das
    // repetições que realmente acertarem entra na soma total aplicada.
    usaMultiplosAtaques: new BooleanField({ initial: false }),
    quantidadeAtaques: new StringField({ initial: "3" }),
    // Contar em Área (ex: Empíreo que ganha Poder Mágico por aliado
    // amedrontado próximo): conta quantos tokens num raio ao redor de
    // quem usa a Ação possuem uma Condição/Efeito específico ativo,
    // disponibilizando o total como "@contagemArea" em qualquer fórmula
    // desta Ação.
    usaContagemArea: new BooleanField({ initial: false }),
    contagemAreaUuid: new StringField({ initial: "" }),
    contagemAreaRaio: new StringField({ initial: "9" }),
    // Bug real corrigido: a exclusão do próprio ator (_contarComCondicaoEmArea)
    // era HARDCODED e incondicional - nunca havia como contar "você mesmo"
    // dentro do total. Consolidado numa 4ª opção NESTE mesmo campo
    // ("todosComVoce", ver NAUREN_CONTAGEM_DISPOSICAO_OPCOES_SEM_DONO) em
    // vez de um checkbox separado - mais simples de usar.
    contagemAreaDisposicao: new StringField({ initial: "aliados" }), // aliados|inimigos|todos|todosComVoce
    // Aplicar em Mim Mesmo: além de (ou em vez de) aplicar Condições no
    // alvo, esta Ação também pode aplicar uma Condição/Efeito em quem a
    // usou - sempre dispara ao usar a Ação, independente de acertar ou
    // não (não é "só se acertar", já que é sobre você mesmo).
    condicaoEmMimUuid: new StringField({ initial: "" }),
    condicaoEmMimAcumulos: new StringField({ initial: "1" }),
    // Cria uma área no mapa ao usar esta ação. No V14 isso vira uma Scene
    // Region (Measured Template não existe mais) - ver NaurenRegionHelper.
    usaTemplate: new BooleanField({ initial: false }),
    templateTipo: new StringField({ initial: "circle" }),
    templateTamanho: new NumberField({ initial: 3, min: 0 }),
    // Filtro de Disposição pra "modoAlvo: area" (diferente de
    // templatePersistenteDisposicao, que é só pra Template Persistente,
    // e de penitenciaAreaDisposicao, só pro modo que a Penitência
    // ativa) - "modoAlvo: area" normal NÃO filtra disposição sozinho
    // (correto pra dano em área tipo Bola de Fogo, que afeta todo
    // mundo sem distinção), então este campo só entra em vigor quando
    // EXPLICITAMENTE preenchido (ex: Orações do Ciclo, Sacerdote -
    // "todos aliados ganham..." precisa excluir inimigos). Vazio
    // (padrão) = sem filtro, comportamento de sempre, preservado pra
    // toda Ação já existente.
    areaDisposicao: new StringField({ initial: "" }), // "" (sem filtro) | aliados | inimigos | todos
    // Largura de um template "ray"/"line" (Linha Reta) - por padrão
    // (0) usa a largura fixa de 1m que sempre existiu. Configure em
    // metros quando precisar de uma linha mais larga (ex: Sutra da
    // Lâmina Carmesim, Místico - "corta em linha reta de 10m de
    // comprimento e 2m de largura": templateTamanho: 10,
    // templateLargura: 2). Não afeta os outros tipos de forma.
    templateLargura: new NumberField({ initial: 0, min: 0 }),
    // Aumenta o Tamanho do Template acima conforme o Crescimento (ex:
    // Névoa de Esporos, Druida: "+2 Mana, o raio aumenta em 3m") - fórmula
    // (aceita "@crescimento") SOMADA ao Tamanho base, resolvida na hora de
    // colocar a área no mapa. Só faz sentido com "usaCrescimento" ligado.
    // Vazio = tamanho sempre fixo (comportamento de sempre).
    templateTamanhoExtraPorCrescimento: new StringField({ initial: "" }),
    // Cor da área no mapa - vazio usa a cor que o próprio jogador escolheu
    // no Foundry (Configurações > Minha Cor de Usuário).
    templateCor: new StringField({ initial: "" }),
    // Área invisível durante o jogo normal: a Região continua existindo e
    // funcionando igual (pega quem está dentro, dispara efeitos, tudo),
    // mas só aparece visualmente quando o mestre entra na camada de
    // Regiões - útil pra armadilhas escondidas, zonas secretas, etc.
    // Usa REGION_VISIBILITY.LAYER (nativo do V14) em vez de ALWAYS; não
    // interfere em nada mecânico, é só visual.
    templateInvisivel: new BooleanField({ initial: false }),
    // ===== TEMPLATE PERSISTENTE =====
    // A área colocada no mapa (usaTemplate acima) já fica visível
    // indefinidamente por padrão - isso aqui liga um COMPORTAMENTO a ela:
    // efeito periódico (dano/estresse/estamina/condição) em quem estiver
    // dentro a cada início/fim de turno ou rodada, e/ou dispara uma vez
    // quando alguém ENTRA na área (efeito de armadilha, ver Armadilha de
    // Caça). Duração em rodadas (0 = permanente até ser apagada
    // manualmente do mapa) - expira sozinha quando a contagem zera.
    usaTemplatePersistente: new BooleanField({ initial: false }),
    templatePersistenteDuracaoRodadas: new StringField({ initial: "0" }),
    // Rodadas em que a área se mantém sem pagar a sustentação (ex.:
    // Fortificar as Bênçãos no Jardim). Aceita número ou @rank.
    templatePersistenteRodadasGratis: new StringField({ initial: "0" }),
    templatePersistenteEventoPeriodico: new StringField({ initial: "" }), // "" (desligado) | inicioRodada | fimRodada | inicioTurno | fimTurno
    // Aplica o Evento Periódico acima IMEDIATAMENTE em quem já estiver
    // dentro da área no momento de criá-la, além do gatilho normal (que
    // só renova/repete a partir do próximo tick) - ex: Jardim das Flores
    // Silvestres (Druida), "você e aliados na área recebem +2 Defesa"
    // deveria valer assim que a magia é lançada, não só na próxima
    // rodada. Deixe DESLIGADO pra Templates com "efeito: dano" que
    // representam armadilhas (ex: Criar Cogumelos) - nesses casos, quem
    // já estava ali no momento de criar não deveria ser atingido de
    // graça (mesma lógica de "Ao Entrar" abaixo, que só afeta quem
    // entra DEPOIS).
    templatePersistenteAplicarAoCriar: new BooleanField({ initial: false }),
    templatePersistenteAoEntrar: new BooleanField({ initial: false }),
    templatePersistenteDisposicao: new StringField({ initial: "inimigos" }), // aliados|inimigos|todos
    // Restringe o Efeito Periódico (ver "templatePersistenteEventoPeriodico"
    // "inicioTurno"/"fimTurno") a só quem TEM o turno começando/acabando
    // agora, em vez de todo mundo na área que bate a Disposição - ex:
    // Florescer da Vida (Druida): "aliados que INICIAREM seus turnos na
    // área curam" é pessoal (só quem está de fato começando o turno
    // AGORA, e só se essa pessoa estiver dentro), nunca dispara no turno
    // de OUTRO aliado nem durante Prioridade tomada no turno de alguém
    // (Prioridade não muda de quem é o turno). Desligado (padrão) mantém
    // o comportamento de área de sempre (ex: Chuva de Estrelas, Névoa de
    // Esporos - acerta todo mundo dentro, a cada turno de QUALQUER um).
    templatePersistenteEfeitoPessoal: new BooleanField({ initial: false }),
    templatePersistenteEfeito: new StringField({ initial: "" }), // "" (nenhum) | dano | cura | estresse | reduzEstresse | estamina | restauraEstamina
    templatePersistenteQuantidade: new StringField({ initial: "1d6" }),
    templatePersistenteCondicaoUuid: new StringField({ initial: "" }),
    templatePersistenteCondicaoAcumulos: new StringField({ initial: "1" }),
    // Soma ao valor do 1º Modificador da Condição aplicada por este
    // Template Persistente, por nível de Crescimento investido (ex:
    // Jardim das Flores Silvestres, Druida: "+2 Mana adicionais, ganham
    // +1 em Defesa"). Aceita "@crescimento" - resolvido no momento de
    // LANÇAR (onde o nível escolhido no popup de Crescimento ainda está
    // disponível, ver #nivelCrescimentoAtual em _executarAcao), viajando
    // já como número puro dentro da configuração da Região (a Condição
    // em si continua com seu valor BASE normal - isto só soma a diferença).
    templatePersistenteModificadorExtraPorCrescimento: new StringField({ initial: "" }),
    // Soma à "Duração (Rodadas)" acima, por nível de Crescimento
    // investido (ex: Florescer de Flores, Druida: "+1 rodada de duração
    // por nível") - mesma fórmula/tokens de qualquer outro campo
    // "...ExtraPorCrescimento" desta Ação (aceita @crescimento,
    // @atacouNesteTurno, @quantidadeEscolhida ou qualquer @atributo).
    // Vazio = duração sempre fixa, como sempre foi.
    templatePersistenteDuracaoExtraPorCrescimento: new StringField({ initial: "" }),
    // ===== SUSTENTAR (ex: Jardim das Flores Silvestres, Druida: "pagar 2
    // de Mana por rodada pra manter o efeito") - só faz sentido com
    // "usaTemplatePersistente" e "duracaoRodadas: 0" (permanente até ser
    // apagada). SE preenchido, no INÍCIO DO TURNO de quem CRIOU a área
    // (não de qualquer personagem - a Região grava "origemAtorUuid" na
    // hora de ser colocada), mostra um popup perguntando se quer gastar
    // "sustentadoQuantidade" de "sustentadoRecurso" pra manter - "Não" ou
    // recurso insuficiente REMOVE a área do mapa (a magia "acaba" ali).
    // Recurso vazio ("") = sem custo de manutenção, área permanente até
    // apagar manualmente (comportamento de sempre).
    templatePersistenteSustentadoRecurso: new StringField({ initial: "" }),
    templatePersistenteSustentadoQuantidade: new StringField({ initial: "1" }),
    // Sustentar Por Rodada (padrão: false = por TURNO, pessoal, só no
    // início do turno de quem CRIOU a área - regra confirmada pelo
    // usuário: "só é por rodada quando especificado na magia", o
    // padrão do manual é por turno) - true SÓ pras poucas magias cujo
    // texto diz explicitamente "X Mana por rodada" (ex: Terra Mágica,
    // Jardim das Flores Silvestres), onde TODOS na cena disparam a
    // checagem, não só quem criou.
    templatePersistenteSustentarPorRodada: new BooleanField({ initial: false }),
    // ===== REGENERAÇÃO AUTOMÁTICA (ex: mesma magia - "você recupera 1 de
    // Mana no início do seu turno") - diferente de "Sustentar" acima (sem
    // popup, sempre concede, só pra quem CRIOU a área, no início do turno
    // DELE). Recurso vazio = nenhuma regeneração.
    templatePersistenteRegeneraRecurso: new StringField({ initial: "" }),
    templatePersistenteRegeneraQuantidade: new StringField({ initial: "1" }),
    // Sobrescreve a fórmula do 1º Efeito Periódico da Condição aplicada
    // acima SÓ nesta instância (mesma ideia de "overrideFormulaEfeitoPeriodico"
    // em condicoesAplicadas, mas pro caminho de Template Persistente -
    // ex: Névoa de Esporos, que reaplica Envenenamento a cada turno via
    // template, mas causa 1d4 por acúmulo em vez do 1 padrão).
    templatePersistenteOverrideFormulaCondicao: new StringField({ initial: "" }),
    // ===== BUFF DE CONJURAÇÃO (mecanismo ANTIGO, mantido só por
    // compatibilidade - Terra Mágica migrou pra "Condição de Presença"
    // abaixo, que já cobre o mesmo caso de forma mais flexível e
    // consistente com o resto do sistema, ex: também afeta Cura, e
    // pode ser restrita a Arma/Habilidade também, não só Magia). Some
    // um dado extra de dano ("1d8", ou "auto" = maior dado da própria
    // fórmula) E/OU Facilidade em testes de ataque, só pra itens type
    // "magia", só enquanto o conjurador estiver FISICAMENTE dentro da
    // área (checado na hora de rolar, sem popup nem Condição visível
    // na ficha - por isso a preferência agora é pela Condição de
    // Presença, que já aparece normalmente entre as Condições ativas).
    templatePersistenteBuffConjuracaoDado: new StringField({ initial: "" }), // ex: "1d8" - some 1 desse dado na fórmula de dano
    templatePersistenteBuffConjuracaoFacilidade: new BooleanField({ initial: false }),
    // ===== CONDIÇÃO DE PRESENÇA (ex: Terra Mágica, Mago - já usa isto
    // em vez do Buff de Conjuração acima, com uma Condição que tem
    // "danoDado"/"curaDado"/"vantagemAtaque" restritos a "magia" no
    // modificador - ver campoModificador > restringirTipoItem; também
    // serve pra qualquer Ação futura que precise de "só vale enquanto
    // estiver literalmente dentro" - terreno difícil, escuridão, uma
    // zona sagrada etc) - diferente de TUDO mais acima nesta seção:
    // não depende de rodada/turno/evento nenhum. A Condição
    // configurada aqui é aplicada automaticamente no INSTANTE em que
    // um alvo elegível (filtrado por "templatePersistenteDisposicao"
    // acima) entra fisicamente na área, e REMOVIDA no instante em que
    // sai - sem popup, sem acúmulos, sem depender do motor de
    // rodada/turno. Várias áreas diferentes concedendo a MESMA
    // Condição a um alvo coexistem (só desaparece quando ele sai de
    // TODAS elas). Vazio (padrão) = nenhuma Condição de Presença
    // configurada nesta Ação.
    templatePersistenteCondicaoPresencaUuid: new StringField({ initial: "" }),
    // Número Máximo de Áreas Simultâneas desta MESMA Ação (ex:
    // Armadilha de Caça - "até 4 armadilhas simultâneas", subindo
    // conforme o rank). Fórmula (aceita "@rank") - vazio (padrão) =
    // sem limite, como sempre foi. Ao colocar uma área nova além do
    // limite, a mais ANTIGA (por ordem de criação) desta mesma Ação é
    // apagada automaticamente - ver
    // NaurenRegionHelper._limitarRegioesSimultaneas.
    templatePersistenteLimiteSimultaneas: new StringField({ initial: "" }),
    // Só faz sentido junto de "templatePersistenteAoEntrar" - a área é
    // apagada do mapa automaticamente na primeira vez que QUALQUER
    // alvo a ativar (comportamento clássico de "armadilha consumida
    // ao disparar", ex: Armadilha de Caça) - sem isto (padrão), a área
    // continua no mapa depois de ativada, e cada personagem só sofre o
    // efeito uma vez (ver "tokensJaAtivaram"), mas outros ainda podem
    // ativá-la depois.
    templatePersistenteRemoverAoAtivar: new BooleanField({ initial: false }),
    // ===== AUTOMAÇÃO DE ALVO =====
    // "nenhum" = tudo manual (comportamento clássico, padrão).
    // "selecionado" = usa os alvos marcados com T (game.user.targets).
    // "area" = coloca a área no mapa (usa templateTipo/templateTamanho) e
    //          pega automaticamente todo token dentro dela.
    // Com alvo ligado: checa alcance (só "selecionado"), compara o ataque
    // com a Defesa de cada alvo, e aplica dano/cura/condições automaticamente.
    modoAlvo: new StringField({ initial: "nenhum" }),
    // Campo interno, não exibido na ficha: uma vez que o Modo Alvo tenha
    // sido definido (automaticamente ou pelo próprio jogador), este
    // sinalizador impede que a automação de "Modo Alvo" tente
    // sobrescrevê-lo de novo mais tarde.
    modoAlvoTravado: new BooleanField({ initial: false }),
    // Só relevante pra "selecionado": quantos alvos marcados com T essa
    // Ação afeta de verdade. O Foundry deixa marcar quantos alvos
    // quiser, então sem isso NADA limitava o jogador de marcar 5 alvos
    // numa Ação pensada pra 1 só - este campo corta a lista pro limite
    // configurado (avisando se marcou mais do que isso), e permite
    // Habilidades como "Ataque múltiplo" (Caçador) ou uma Subclasse que
    // dê "+1 alvo adicional" numa magia de alvo único.
    numeroAlvos: new NumberField({ initial: 1, min: 1, integer: true }),
    numeroAlvosPorRank: new ArrayField(new SchemaField({
      rank: new NumberField({ initial: 1, min: 1, integer: true }),
      quantidade: new NumberField({ initial: 1, min: 1, integer: true })
    })),
    // Aumenta o Número de Alvos acima conforme o Crescimento (ex: Prisão
    // das Brumas, Místico - "X alvos, sendo X o número de pontos de
    // Energia gastos") - fórmula (aceita "@crescimento") SOMADA ao
    // Número de Alvos base, resolvida antes de marcar/escolher os alvos.
    // Só faz sentido com "usaCrescimento" ligado. Vazio = número de
    // alvos sempre fixo (comportamento de sempre).
    numeroAlvosExtraPorCrescimento: new StringField({ initial: "" }),
    // ===== CRESCIMENTO (Capítulo IV/Druida - "pague mais Mana por mais
    // efeito, uma vez por conjuração", regra base da Classe) ===== Antes
    // disso era só uma nota na descrição ("ajuste manualmente"); agora é
    // de verdade: ligando isto, ao usar a Ação o jogador escolhe quantos
    // níveis investir (0 até o máximo), cada nível soma "custoPorNivel"
    // de Mana ao custo total (o total escala de verdade: 2 níveis com
    // custo 2 = +4 de Mana, não +2), e o número escolhido fica disponível
    // como "@crescimento" em QUALQUER fórmula desta MESMA Ação (dano,
    // cura, acúmulos de Condição aplicada, gasto de recurso) - ex:
    // "2d8+(@crescimento)d8" pra "+1d8 de dano por nível".
    // "crescimentoMaxNiveis" (padrão 99, ou seja, sem teto de verdade na
    // prática) SUBSTITUIU de propósito a regra base "só uma vez por
    // conjuração" - o teto agora é livre pra qualquer Magia/Habilidade,
    // escalando o custo de Mana automaticamente por nível investido. Uma
    // Habilidade de Subclasse ainda pode restringir isso pra uma Ação
    // ESPECÍFICA (campoCustomizado nesse mesmo campo, valor mais baixo),
    // ou somar mais (ver "crescimentoMaxNivelExtra" em Condição/Efeito).
    usaCrescimento: new BooleanField({ initial: false }),
    crescimentoCustoPorNivel: new StringField({ initial: "2" }),
    crescimentoMaxNiveis: new NumberField({ initial: 1, min: 1, integer: true }), // 1 vez por magia (livro); 99 = valor antigo, lido como 1
    // Condições (ou Efeitos) aplicados no(s) alvo(s) ao usar esta Ação.
    // "uuid" aponta pro item de Condição/Efeito no MUNDO (sidebar de Itens)
    // - a aplicação cria uma CÓPIA no ator alvo, empilhando acúmulos se a
    // condição for acumulável (ver NaurenAlvoHelper.aplicarCondicao).
    // "perguntarParaEvitar": se marcado, o alvo recebe a CHANCE de pagar um
    // custo (custoParaEvitarRecurso/Quantidade) pra NÃO receber esta
    // condição - aparece no mesmo popup de reação de dano, independente do
    // alvo ter ligado o popup dele ou não (é decisão de quem criou a Ação).
    condicoesAplicadas: new ArrayField(new SchemaField(campoCondicaoAplicada())),
    // Gasta um recurso do ALVO diretamente (drena Estamina/Mana/Dado de
    // Destino, ou causa Estresse) - mais simples que criar uma Condição só
    // pra isso. Mesma lógica de "perguntarParaEvitar" das condições acima.
    // Gasta um recurso do ALVO diretamente (drena Estamina/Mana/Dado de
    // Destino/Vida, ou causa Estresse) - mais simples que criar uma
    // Condição só pra isso. "quantidade" é uma FÓRMULA (aceita "3" ou
    // "1d4"), rolada uma vez na hora de aplicar. Mesma lógica de
    // "perguntarParaEvitar" das condições acima.
    gastosRecurso: new ArrayField(new SchemaField({
      recurso: new StringField({ initial: "vida" }), // vida|estamina|mana|destino|estresse
      quantidade: new StringField({ initial: "1" }),
      ativo: new BooleanField({ initial: true }),
      soSeAcertar: new BooleanField({ initial: true }),
      soSeSobreviver: new BooleanField({ initial: false }), // só se o alvo continuar de pé depois do dano (Explosão Púrpura: "que não morrerem")
      perguntarParaEvitar: new BooleanField({ initial: false }),
      custoParaEvitarRecurso: new StringField({ initial: "estamina" }),
      custoParaEvitarQuantidade: new StringField({ initial: "1" }),
      // Mesma lógica: troca a fórmula de "quantidade" inteira a partir do
      // rank indicado (ex: rank 1 = "1d4", rank 2 = "1d4+2").
      quantidadePorRank: new ArrayField(new SchemaField({
        rank: new NumberField({ initial: 1, min: 1, integer: true }),
        quantidade: new StringField({ initial: "" })
      })),
      // Mesma lógica pro custo que o ALVO paga pra EVITAR este gasto.
      custoParaEvitarQuantidadePorRank: new ArrayField(new SchemaField({
        rank: new NumberField({ initial: 1, min: 1, integer: true }),
        quantidade: new StringField({ initial: "" })
      })),
      // Por padrão, um "gasto" com quantidade NEGATIVA (uma CONCESSÃO ao
      // alvo, ex: "-1d4" de Mana) nem aparece no popup de pré-Ação - é
      // aplicado direto, sem checkbox (comportamento de sempre, várias
      // Habilidades já dependem disso). Ligue este campo quando quiser o
      // OPOSTO: uma concessão CONDICIONAL/OPCIONAL, que precisa aparecer
      // como um checkbox marcável no popup (ex: Restauração Interior -
      // "remove 1 de Estresse do alvo, só se você atacou um inimigo
      // neste turno" - o próprio checkbox marcado/desmarcado no popup É
      // a decisão do jogador, sem precisar de um popup separado).
      mostrarConcessaoNoPopup: new BooleanField({ initial: false }),
      // Ver mesmo campo/comentário completo em campoDanoBloco.
      condicaoParaAtivar: new StringField({ initial: "" })
    })),
    // Teste de ataque (no máximo 1 por Ação)
    ehAtaque: new BooleanField({ initial: false }),
    atributoAtaque: new StringField({ initial: "poderAtaque" }),
    // Fórmula LIVRE somada ao "1d20 + atributoAtaque" - pode ser um número
    // ("2"), um dado ("1d4"), os dois combinados ("1d4+2"), e também aceita
    // "@atributo" (ex: "@destino"). Substitui os antigos campos separados
    // "Bônus fixo" e "Dado extra".
    ataqueBonusExtra: new StringField({ initial: "" }),
    // Tabela "por rank" pro bônus de ataque: mesma lógica do porRank de
    // campoDanoBloco/campoCuraBloco - troca (não soma) o "ataqueBonusExtra"
    // inteiro a partir do rank indicado.
    ataqueBonusPorRank: new ArrayField(new SchemaField({
      rank: new NumberField({ initial: 1, min: 1, integer: true }),
      formula: new StringField({ initial: "" })
    })),
    // Dano(s) e Cura(s) - podem ter vários dentro da MESMA ação
    danos: new ArrayField(new SchemaField(campoDanoBloco())),
    curas: new ArrayField(new SchemaField(campoCuraBloco()))
  };
}

/* =======================================
 * 1. MODELOS DE DADOS DE ATORES
 * ======================================= */
class NaurenActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      nivel: new NumberField({ initial: 1, min: 1, integer: true }),
      xp: new NumberField({ initial: 0, min: 0, integer: true }),
      classe: new StringField({ initial: "" }),
      atributos: new SchemaField({
        forca: new SchemaField({ value: new NumberField({ initial: 2, min: 0, integer: true }) }),
        agilidade: new SchemaField({ value: new NumberField({ initial: 2, min: 0, integer: true }) }),
        estamina: new SchemaField({ value: new NumberField({ initial: 2, min: 0, integer: true }) }),
        inteligencia: new SchemaField({ value: new NumberField({ initial: 2, min: 0, integer: true }) }),
        destino: new SchemaField({ value: new NumberField({ initial: 2, min: 0, integer: true }) })
      }),
      defesa: new NumberField({ initial: 10, min: 0, integer: true }),
      movimento: new NumberField({ initial: 6, min: 0, integer: true }),
      // Estresse permanente (0.94, ex.: Cirurgia Sinistra): sempre ocupado, nada tira. Só sai pela aba Opções.
      estressePermanente: new NumberField({ initial: 0, min: 0, integer: true }),
      soAgeEmPrioridade: new BooleanField({ initial: false }), // 0.94.3 (G7): só age quando recebe Prioridade (Obra Prima)
      stress: new SchemaField({
        value: new NumberField({ initial: 0, min: 0, integer: true }),
        max: new NumberField({ initial: 2, integer: true })
      }),
      vida: new SchemaField({
        value: new NumberField({ initial: 0, min: 0, integer: true }),
        max: new NumberField({ initial: 0, min: 0, integer: true })
      }),
      // Escudo temporário (ex: "Escudo de Mana" do Mago) - some entre
      // Vida e o dano recebido: todo dano desconta do Escudo PRIMEIRO,
      // só o excedente (se houver) chega na Vida de verdade. Sem UI
      // própria de edição manual (nasce/morre só por Ação - ver
      // "usaEscudo"/"escudoFormula" em campoAcao) - "max" existe só pra
      // desenhar a barra proporcional na ficha (% preenchido), não
      // acumula como um teto separado do "value" atual.
      escudo: new SchemaField({
        value: new NumberField({ initial: 0, min: 0, integer: true }),
        max: new NumberField({ initial: 0, min: 0, integer: true })
      }),
      mana: new SchemaField({
        value: new NumberField({ initial: 0, min: 0, integer: true }),
        max: new NumberField({ initial: 0, min: 0, integer: true })
      }),
      estaminaCombate: new SchemaField({
        value: new NumberField({ initial: 0, min: 0, integer: true }),
        max: new NumberField({ initial: 0, min: 0, integer: true })
      }),
      dadosDestino: new SchemaField({
        value: new NumberField({ initial: 0, min: 0, integer: true }),
        max: new NumberField({ initial: 0, min: 0, integer: true })
      }),
      // Cor customizada da barra de cada recurso (Vida/Mana/Estamina de
      // Combate/Dados de Destino) - "" em qualquer um dos dois lados
      // significa "usa o degradê padrão daquele recurso" (ver
      // NAUREN_BARRA_CORES_PADRAO). Só o jogador (em Modo Edição da ficha,
      // no ícone de engrenagem ao lado da barra) escolhe isso - não tem
      // efeito mecânico nenhum, é só visual/gosto pessoal.
      corBarra: new SchemaField({
        vida: new SchemaField({ cor1: new StringField({ initial: "" }), cor2: new StringField({ initial: "" }) }),
        mana: new SchemaField({ cor1: new StringField({ initial: "" }), cor2: new StringField({ initial: "" }) }),
        estaminaCombate: new SchemaField({ cor1: new StringField({ initial: "" }), cor2: new StringField({ initial: "" }) }),
        dadosDestino: new SchemaField({ cor1: new StringField({ initial: "" }), cor2: new StringField({ initial: "" }) })
      }),
      // ===== RECURSOS CUSTOMIZADOS =====
      // Populado automaticamente por naurenSincronizarRecursosCustom sempre
      // que um item com "recursosDeclarados" (hoje só Subclasse) é
      // adicionado/muda no ator - NUNCA editar a lista aqui manualmente
      // esperando que "nasça" um recurso novo, é sincronização de mão única
      // (item declara -> ator recebe). "valor" É preservado entre
      // sincronizações (não reseta o progresso do jogador); "max" é
      // recalculado a cada sincronização a partir da fórmula declarada.
      recursosCustom: new ArrayField(new SchemaField({
        id: new StringField({ initial: "" }),
        nome: new StringField({ initial: "" }),
        valor: new NumberField({ initial: 0, integer: true }),
        max: new NumberField({ initial: 0, integer: true }),
        icone: new StringField({ initial: "fa-star" }),
        cor1: new StringField({ initial: "#4a3a7a" }),
        cor2: new StringField({ initial: "#8a6fd4" }),
        // Espelha a mesma chave interna e estável da declaração na
        // Subclasse (ver NaurenSubclasseData#recursosDeclarados) - é isso
        // que a sincronização usa pra achar "qual barra é essa", não o
        // "id" (editável e por isso não confiável como chave).
        chaveInterna: new StringField({ initial: "" }),
        // Trava de "recurso par" (ver campoRecursoDeclarado#travaRecursoId
        // - ex: Determinação trava Ofuscação ao chegar no máximo, e
        // vice-versa, pra Ambivalência do Empíreo fazer sentido existir).
        // "auto" = segue a regra automática (trava se o par estiver no
        // máximo, a menos que uma Habilidade ativa destrave). "travado"/
        // "destravado" força manualmente, ignorando a regra automática -
        // sempre visível e clicável na ficha, pra nunca travar o jogador
        // numa situação que o sistema calculou errado.
        travaManual: new StringField({ initial: "auto" })
      })),
      // ===== MASCOTE/COMPANHEIRO =====
      // Se preenchido, ESTE ator é o MASCOTE de outro (aponta pro UUID do
      // dono) - fica vazio em personagens normais e na maioria dos NPCs.
      // Descobrir "quais mascotes eu tenho" é sempre por BUSCA (ver
      // naurenBuscarMascotesDe) em vez de uma lista no dono, de propósito -
      // evita os dois lados ficarem dessincronizados um do outro.
      mascoteDeUuid: new StringField({ initial: "" }),
      // ===== ESCALA POR NÍVEL (monstros/NPCs - Codex Bestiariun) =====
      // "usaEscalaPorNivel" é o interruptor mestre - PRECISA estar
      // ligado pra qualquer coisa nesta seção fazer efeito. Sem isso,
      // um Ator comum (que nunca configurou nada aqui) nunca é afetado.
      usaEscalaPorNivel: new BooleanField({ initial: false }),
      // "Modo de Mira": quando uma Ação precisa de alvo e nenhum (ou não o
      // suficiente) está marcado, mostra um contador ao vivo esperando o
      // jogador marcar (tecla T ou o ícone de mira do próprio Foundry) e
      // continua a Ação sozinha assim que o número necessário for
      // atingido - ver Hooks.on("targetToken"). Ligado por padrão; cada
      // jogador pode desligar individualmente na aba Opções, se preferir
      // marcar o alvo ANTES de clicar na Ação, do jeito antigo.
      usaModoMira: new BooleanField({ initial: true }),
      // "escalaAtributos": um item por atributo que o usuário decidiu
      // fazer escalar (ex: só Força; ou Força E Estamina, cada um com
      // sua PRÓPRIA tabela independente - diferente do sistema antigo,
      // que tinha uma tabela ÚNICA compartilhada e distribuía pontos
      // alternando entre os atributos marcados). Cada entrada tem uma
      // tabela de {nivelMinimo, valor} - ao mudar de nível, o sistema
      // busca a linha com o MAIOR "nivelMinimo" que ainda seja ≤ o
      // nível atual, e TRAVA o atributo NAQUELE valor diretamente (não
      // soma/distribui pontos - substitui o valor pelo que a tabela diz
      // pro nível atual). Por ser busca direta (não incremental), não
      // precisa de um "nível de referência" pra funcionar - subir e
      // descer de nível usam exatamente a mesma lógica, sempre
      // recalculando do zero a partir da tabela, nunca guardando
      // histórico. IMPORTANTE pra quem monta a ficha: o valor do
      // atributo na hora da criação deve BATER com o que a própria
      // tabela diz pro nível inicial da criatura, senão o atributo "salta"
      // pro valor da tabela na primeira mudança de nível.
      escalaAtributos: new ArrayField(new SchemaField({
        atributo: new StringField({ initial: "forca" }), // forca|agilidade|estamina|inteligencia|destino
        tabela: new ArrayField(new SchemaField({
          nivelMinimo: new NumberField({ initial: 1, min: 1, integer: true }),
          valor: new NumberField({ initial: 1, min: 0, integer: true })
        }))
      })),
      // Só documentação/referência (não entra em nenhum cálculo do
      // sistema atual) - o nível em que a ficha foi originalmente
      // configurada, útil pro Mestre lembrar de onde essa criatura
      // "começou".
      nivelBase: new NumberField({ initial: 1, min: 1, integer: true }),
      // Pontos de Subclasse:
      // "value" é quanto ainda NÃO foi gasto - fica persistido (não é
      // recalculado do zero a cada render, ao contrário de quase tudo nesta
      // ficha) porque representa uma escolha acumulada ao longo do tempo,
      // igual Vida/Mana/Estamina atuais. Só sobe quando o personagem sobe de
      // nível ou ganha um bônus NOVO (fluxo ainda não construído - até lá,
      // ajuste manual mesmo). "max" (calculado logo abaixo, em
      // NaurenActor#prepareDerivedData) é só o teto: nível 5 dá o 1º ponto,
      // +1 por nível depois disso, mais qualquer bônus de Efeito/Pigmento/
      // Condição/Bônus Manual.
      pontosSubclasse: new SchemaField({
        value: new NumberField({ initial: 0, min: 0, integer: true })
      }),
      vitalidade: new SchemaField({ max: new NumberField({ initial: 0, min: 0, integer: true }) }),
      espirito: new SchemaField({ max: new NumberField({ initial: 0, min: 0, integer: true }) }),
      poderAtaque: new SchemaField({ value: new NumberField({ initial: 0, min: 0, integer: true }) }),
      poderMagia: new SchemaField({ value: new NumberField({ initial: 0, min: 0, integer: true }) }),
      // Modo padrão de qualquer rolagem de d20 feita pela ficha: "normal" | "vantagem" | "desvantagem"
      modoRolagem: new StringField({ initial: "normal" }),
      // Como a Vida máxima base é calculada a partir da Vitalidade:
      // "vitalidadeNivel" (padrão, regra do sistema) = Vitalidade × Nível
      // "vitalidade" = só a Vitalidade (desliga a multiplicação por nível)
      // "categoria" = Vitalidade × Multiplicador de Categoria (documento de
      // balanceamento do Codex Bestiariun - ver "categoriaMonstro" abaixo)
      // "customizado" = usa a fórmula de vidaFormula (@vitalidade, @nivel,
      // @categoria) - ou só um número fixo, ex: "900", pra bater exatamente
      // com uma ficha de monstro que não segue nenhuma fórmula geral.
      calculoVida: new StringField({ initial: "vitalidadeNivel" }),
      vidaFormula: new StringField({ initial: "@vitalidade * @nivel" }),
      // Mesma ideia de "calculoVida" acima, mas pros outros 3 recursos.
      // "categoria" não existe pra estes 3 (só faz sentido pra Vida no
      // documento de balanceamento) - as opções são só o padrão do sistema
      // ou "customizado" (fórmula ou número fixo).
      calculoMana: new StringField({ initial: "espirito" }),
      manaFormula: new StringField({ initial: "@espirito" }),
      calculoEstaminaCombate: new StringField({ initial: "estamina" }),
      estaminaCombateFormula: new StringField({ initial: "@estamina" }),
      calculoDadosDestino: new StringField({ initial: "destino" }),
      dadosDestinoFormula: new StringField({ initial: "@destino" }),
      // Categoria (1 a 4, documento de balanceamento do Codex Bestiariun) -
      // só usada quando "calculoVida" está em "categoria" acima. Multiplicador:
      // 1→×1, 2→×2, 3→×3, 4→×4 (igual a própria Categoria, sem tabela à parte).
      categoriaMonstro: new NumberField({ initial: 1, min: 1, max: 4, integer: true }),
      // Gasta Estamina automaticamente ao mover em combate (1 por "bloco" de Movimento usado)
      gastarEstaminaMovimento: new BooleanField({ initial: true }),
      modoMovimento: new StringField({ initial: "" }), // "" = padrão do mundo | popup | automatico | manual
      // Recupera a Estamina de Combate inteira automaticamente sempre que uma nova RODADA começa
      recuperarEstaminaPorRodada: new BooleanField({ initial: true }),
      // Ao clicar no dado de um item com 2+ Ações, pergunta num popup qual usar
      // (desligado = usa a Ação marcada com a estrela, como sempre). Vem
      // HABILITADO por padrão - com vários itens tendo 2+ Ações hoje (Ataque
      // Normal/Pesado, cargas via Consumível etc.), escolher toda vez é mais
      // seguro que assumir sempre a mesma Ação em silêncio.
      perguntarAcaoAoUsar: new BooleanField({ initial: true }),
      // Quando ESTE personagem for alvo de dano automático, mostra um popup pro
      // dono dele escolher a reação: Bloquear / Esquivar / Tomar Estresse /
      // Tomar o dano (desligado = toma o dano cheio direto, sem perguntar).
      // Vem HABILITADO por padrão pra já refletir o Capítulo III do manual
      // (Bloquear/Esquivar são reações do jogador, não deveriam ser "opt-in").
      popupDefesaAoTomarDano: new BooleanField({ initial: true }),
      // Quando ESTE personagem VAI USAR uma Ação (Arma/Magia/Habilidade),
      // mostra um popup de confirmação ANTES de rolar/gastar qualquer
      // coisa: escolher Facilidade/Normal/Dificuldade (já reconhecendo o
      // que estiver ativo por Condição/Efeito/Opções), ver um resumo do
      // que vai rolar (ataque, dano, alcance, área), somar um bônus/
      // penalidade pontual, e checar o alcance contra o alvo marcado.
      // Vem HABILITADO por padrão - desligue se preferir o fluxo direto
      // de sempre (sem esse popup extra a cada uso).
      usaPopupPreAcao: new BooleanField({ initial: true }),
      // Rerolagem com Dado de Destino: perguntar depois de cada d20 (ataque,
      // teste de atributo, esquiva) - desligável por ficha.
      perguntarDestino: new BooleanField({ initial: true }),
      // Limiares customizáveis de acerto/falha crítica (padrão: 20 e 1)
      critMin: new NumberField({ initial: 20, min: 2, max: 20, integer: true }),
      critFailMax: new NumberField({ initial: 1, min: 1, max: 19, integer: true }),
      // Limiar de Deflexão: margem de diferença permitida
      // entre um ataque e um Contra-Ataque pra ocorrer Deflexão (Cap. III do
      // manual) - 0 (padrão) exige resultado EXATAMENTE igual; Habilidades
      // como "Deflexão Áurea" do Guerreiro aumentam isso via Modificador.
      limiarDeflexao: new NumberField({ initial: 0, min: 0, integer: true }),
      // Redução de Dano Sofrido: valor fixo subtraído de qualquer dano
      // recebido, depois de já aplicada a reação (Bloquear/Esquivar/
      // Estresse/dano cheio) - nunca deixa o dano negativo. Somado com
      // Modificadores de Condição/Efeito/Armadura (que aceitam fórmulas
      // como "@poderMagia").
      reducaoDano: new NumberField({ initial: 0, min: 0, integer: true }),
      // Totais "derivados" para campos que também podem ser editados diretamente
      // (Defesa/Movimento continuam com seu próprio valor base editável; estes
      // são o valor final já somando os bônus manuais e efeitos ativos)
      defesaTotal: new NumberField({ initial: 10, integer: true }),
      movimentoTotal: new NumberField({ initial: 9, integer: true }),
      notas: new HTMLField({ initial: "" }),
      // Bônus manuais configuráveis na aba Opções da ficha
      bonus: new SchemaField({
        ataque: new StringField({ initial: "" }),
        ataqueDado: new StringField({ initial: "" }),
        defesa: new StringField({ initial: "" }),
        bloqueio: new StringField({ initial: "" }),
        esquiva: new StringField({ initial: "" }),
        pontosSubclasse: new StringField({ initial: "" }),
        movimento: new StringField({ initial: "" }),
        forca: new StringField({ initial: "" }),
        agilidade: new StringField({ initial: "" }),
        estamina: new StringField({ initial: "" }),
        inteligencia: new StringField({ initial: "" }),
        destino: new StringField({ initial: "" }),
        espirito: new StringField({ initial: "" }),
        poderAtaque: new StringField({ initial: "" }),
        poderMagia: new StringField({ initial: "" }),
        vitalidade: new StringField({ initial: "" }),
        vida: new StringField({ initial: "" }),
        mana: new StringField({ initial: "" }),
        estresse: new StringField({ initial: "" }),
        critMin: new StringField({ initial: "" }),
        critFailMax: new StringField({ initial: "" }),
        limiarDeflexao: new StringField({ initial: "" }),
        reducaoDano: new StringField({ initial: "" }),
        danoBonus: new StringField({ initial: "" }),
        curaBonus: new StringField({ initial: "" }),
        // Limiar de Perjúrio/Graça e Vida ganha por Nível: mesma grade de
        // Bônus Manual que os demais campos acima (fórmula/@atributo,
        // processada por "somar()" igual qualquer outro) - Peculiaridade
        // "Doente"/"Traumatizado" também somam aqui via Modificador.
        perjurioLimiar: new StringField({ initial: "" }),
        gracaLimiar: new StringField({ initial: "" }),
        vidaBonusPorNivel: new StringField({ initial: "" })
      })
    };
  }

  prepareDerivedData() {
    const attr = this.atributos;
    this.espirito.max = attr.inteligencia.value + attr.destino.value;
    this.vitalidade.max = Math.floor((attr.forca.value + attr.estamina.value) / 2);
    this.poderMagia.value = Math.floor((attr.inteligencia.value + attr.estamina.value) / 2);
    const maiorFisico = Math.max(attr.forca.value, attr.agilidade.value);
    this.poderAtaque.value = Math.floor((maiorFisico + attr.estamina.value) / 2);

    // Máximos usados pelas barras de recurso do Token (precisam de value + max)
    this.vida.max = this.vitalidade.max;
    this.mana.max = this.espirito.max;
    this.estaminaCombate.max = attr.estamina.value;
    this.dadosDestino.max = attr.destino.value;

    // Totais base (os bônus manuais e efeitos ativos são somados depois,
    // em NaurenActor#prepareDerivedData, quando os itens já estão disponíveis).
    // IMPORTANTE: nenhum desses valores abaixo é lido por um <input> editável -
    // são só para exibição/cálculo. Os atributos base (Força, Agilidade etc.)
    // e Defesa/Movimento continuam intocados aqui de propósito, para não
    // corromper o valor que o jogador edita diretamente na ficha.
    this.defesaTotal = this.defesa;
    this.movimentoTotal = this.movimento;
    this.stress.max = 2;
    this.atributosTotais = {
      forca: attr.forca.value,
      agilidade: attr.agilidade.value,
      estamina: attr.estamina.value,
      inteligencia: attr.inteligencia.value,
      destino: attr.destino.value
    };
  }
}

/* =======================================
 * 2. MODELOS DE DADOS DE ITENS
 * ======================================= */
class NaurenHabilidadeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      luzVisao: campoLuzVisao(), // 0.99: luz e visão do item no token
      pagarMovimentoCom: new ArrayField(new SchemaField({ recurso: new StringField({ initial: "mana" }), quantidade: new StringField({ initial: "1" }) })), // outra forma de pagar um movimento (aparece na janela de movimento)
      usosExtrasEm: new ArrayField(new SchemaField({            // +usos na Ação de outro item (ex.: Receita Antiga -> Remédios do Caçador)
        itemNome: new StringField({ initial: "" }),
        valor: new StringField({ initial: "1" }),               // aceita @rank (ex.: @rank-1)
        alvo: new StringField({ initial: "" })                  // 0.94.3: "" qualquer | "item" (usos do item) | nome da Ação
      })),
      capacidades: new ArrayField(new StringField()), // capacidades especiais marcadas na ficha (ver NAUREN_CAPACIDADES)
      modificadoresSoComEstado: new StringField({ initial: "" }), // os modificadores da Habilidade só valem neste estado (ex.: "Guarda Defensiva")
      // Ajusta o custo de Mana das SUAS magias (ex.: Combustão −1 × rank nas de dano,
      // mínimo 1; Buraco de Minhoca −1 × rank no Salto Etéreo; Empoderamento +1).
      ajusteCustoMana: new ArrayField(new SchemaField({
        valor: new StringField({ initial: "-1" }),
        multiplicarPeloRank: new BooleanField({ initial: false }),
        soMagiaComDano: new BooleanField({ initial: false }),
        soItemNome: new StringField({ initial: "" }),
        minimo: new StringField({ initial: "0" })
      })),
      moverAposPrioridade: new BooleanField({ initial: false }), // Mímica de Libélula: depois de agir em Prioridade (sem ser movimento), pode mover metade do movimento
      bonusTesteEstudo: new StringField({ initial: "" }),          // + no teste de "Estudar" (× rank) - Olhar do Inquisidor
      acoesGratisPrimeiraRodada: new StringField({ initial: "" }), // N primeiras Ações da 1ª rodada sem Estamina (× rank) - Preparação
      // Aumenta o dano periódico das Condições que VOCÊ aplica (ex.: Técnica
      // Suja: Sangramento e Hemorragia +1 por acúmulo, por rank).
      bonusDanoPeriodico: new ArrayField(new SchemaField({
        soVenenos: new BooleanField({ initial: false }), // vale em qualquer Condição marcada como veneno (em vez do nome)
        condicaoNome: new StringField({ initial: "" }),
        valor: new StringField({ initial: "1" }),
        multiplicarPeloRank: new BooleanField({ initial: false }),
        substituirFormula: new StringField({ initial: "" })   // troca a fórmula por tique (ex.: Ingrediente Ofídico: 1d4)
      })),
      // Estudos (Ladino): tipos de informação que este item oferece ao
      // "Estudar" um alvo. Cada tipo arma um efeito no próximo ataque
      // contra o alvo (ou na esquiva contra ele), com acúmulos e duração.
      tiposEstudo: new ArrayField(new SchemaField({
        id: new StringField({ initial: "" }),
        nome: new StringField({ initial: "Novo estudo" }),
        bonusAcerto: new BooleanField({ initial: false }),
        bonusDano: new BooleanField({ initial: false }),
        criticoMais: new BooleanField({ initial: false }),
        semPrioridade: new BooleanField({ initial: false }),
        esquivaContra: new BooleanField({ initial: false }),
        danoExtraDado: new StringField({ initial: "" }),
        condicaoUuid: new StringField({ initial: "" }),
        valor: new StringField({ initial: "1" }),
        sobeComRank: new BooleanField({ initial: true }),
        duracao: new StringField({ initial: "proximoAtaque" }),   // proximoAtaque | rodada | cena
        maxAcumulos: new StringField({ initial: "3" }),
        contaComoInformacao: new BooleanField({ initial: true }),
        // Livro 0.8 (Análise Paciente nova): o bônus vale "por acúmulo de Analisado" (total de
        // informações no alvo), não pelos acúmulos do próprio tipo - o tipo só fica desbloqueado (0/1).
        porAnalisado: new BooleanField({ initial: false }),
        dadosDaArma: new BooleanField({ initial: false }),        // +1 dado da arma no dano (× valor)
        criativa: new StringField({ initial: "" }),               // "" | "acima" (Eu estou acima) | "abaixo" (Você está abaixo)
        dificuldadeExtra: new StringField({ initial: "0" })       // soma na S.I do teste (criativa: +4 → 12 + Int do alvo)
      })),
      // Fase 7: efeito passivo nos SEUS ataques que batem com o filtro
      // (ex.: Golpe Decisivo - pesados e especiais causam Fragmentado).
      efeitosEmAtaques: new ArrayField(new SchemaField({
        ativo: new BooleanField({ initial: true }),
        tipoAtaque: new StringField({ initial: "pesadoOuEspecial" }), // qualquer | pesado | especial | pesadoOuEspecial | basico | especialComArma (habilidade em que se escolhe a arma)
        tipoArma: new StringField({ initial: "" }),                    // "" = qualquer
        condicaoUuid: new StringField({ initial: "" }),
        acumulos: new StringField({ initial: "1" }),
        multiplicarPeloRank: new BooleanField({ initial: false }),
        danoExtraDado: new StringField({ initial: "" }),               // ex.: 1d6
        multiplicarPorInformacoes: new BooleanField({ initial: false }), // × suas informações (estudos) sobre o alvo
        criticoPorInformacao: new BooleanField({ initial: false }),      // crítico 1 mais fácil por informação
        danoMaximo: new BooleanField({ initial: false }),                // o dano da arma sai no máximo (ex.: Lâmina Corrupta)
        soPrimeiroAtaque: new BooleanField({ initial: false }),          // só no seu 1º ataque contra cada alvo (zera no fim do combate)
        soPrimeiroAtaqueTurno: new BooleanField({ initial: false }),     // só no seu 1º ataque de cada turno (ex.: Esgrima da Chuva)
        soComEstadoNome: new StringField({ initial: "" }),               // só enquanto você estiver num estado com este nome (ex.: Profusão)
        soComBeneficioMarca: new StringField({ initial: "" }),           // Marca do Caçador: só se a SUA marca no alvo tiver este benefício
        perguntarEstresse: new BooleanField({ initial: false }),         // pergunta "pagar 1 Estresse?" (Ímpeto Frenético, Destruição Mútua)
        dadosExtrasDaArma: new StringField({ initial: "" }),             // + N dados do mesmo tamanho do maior dado do ataque (Fogo Divino)
        criticoMaisFacil: new StringField({ initial: "" }),              // crítico N mais fácil (Fogo Divino)
        acertoExtraDado: new StringField({ initial: "" }),               // + dado no teste de ataque (ex.: 1d6)
        escalarDadoCasas: new StringField({ initial: "" }),              // escala o dado da arma N casas (aceita @rank; ex.: Disparo Carregado)
        empurrarMetros: new StringField({ initial: "" }),                // o acerto empurra o alvo N metros (aceita @rank; ex.: Rastro do Vendaval)
        empurrarColisaoDano: new StringField({ initial: "" }),           // dano extra se colidir ao ser empurrado (ex.: @dadoDano)
        soEmPrioridadeRoubada: new BooleanField({ initial: false }),     // só em ataques feitos numa Prioridade que você roubou
        danoExtraFixoPor: new StringField({ initial: "" }),              // "" | estresseAliados | prioridadesGeradas | informacoes
        danoExtraFixoValor: new StringField({ initial: "1" }),           // quanto por unidade (× rank se marcado)
        soNoCritico: new BooleanField({ initial: false }),               // o dano extra só entra em acertos críticos
        soComFacilidade: new BooleanField({ initial: false }),           // o dano extra só entra se o ataque saiu com Facilidade (ex.: Euforia)
        danoExtraDadoPorRank: new BooleanField({ initial: false }),      // o "dano extra" (dado) sobe com o rank: 1d10, 2d10, 3d10 (ex.: Euforia)
        semCusto: new BooleanField({ initial: false }),                  // o ataque sai sem custo (ex.: Gatilho Rápido)
        alvoMarcadoPorMimNome: new StringField({ initial: "" }),         // só se o alvo tiver uma Condição SUA com este nome (ex.: Marca do Caçador)
        ignoraBloqueio: new BooleanField({ initial: false }),            // o alvo não pode Bloquear (ex.: Mira Afiada)
        alcanceExtra: new StringField({ initial: "" }),                  // + metros de alcance (× rank se marcado)
        morteInstantanea20: new BooleanField({ initial: false }),        // 20 natural mata alvo com menos Vida que você (Tiro Mortal)
        danoVerdadeiroExtra: new StringField({ initial: "" }),           // + dano VERDADEIRO (fórmula, aceita @vb/@categoria) - Golpe Penetrante (monstros)
        danoNoErro: new StringField({ initial: "" }),                    // "Dano no erro" em todo ataque que ainda não tenha um (fórmula) - Golpe Tenaz (monstros)
        danoMaximoSeAlvoCondicaoNome: new StringField({ initial: "" }),  // dano máximo só se o alvo (1) tiver uma Condição com este nome (ex.: Caído) - Pisoteador
        acertoExtraFormula: new StringField({ initial: "" }),            // + fórmula livre no teste de ataque (aceita @aliados_6m, @vb...) - Táticas de Bando
        soAcaoNomeContem: new StringField({ initial: "" }),              // só em Ações/itens cujo nome contém este texto (ex.: "Ataque em Bando") - Massa Crítica
        soSeFormula: new StringField({ initial: "" }),                   // só quando a fórmula der verdadeiro (ex.: "@aliados_6m>=2") - Massa Crítica
        curarMetade: new BooleanField({ initial: false })                // 0.94.24: quem ataca recupera a metade do dado extra se acertar (Dreno)
      })),
      // Fase 7: reduz o custo de Estamina de certas Ações enquanto ativo
      // (ex.: Forma Sábio dos Matos - magias de cura custam 1 a menos).
      reduzCustoEstamina: new ArrayField(new SchemaField({
        soCategoriaArma: new StringField({ initial: "" }), // só ataques com armas desta categoria (ex.: Pesada)
        quantidade: new StringField({ initial: "1" }),
        tipoItem: new StringField({ initial: "" }),        // "" | habilidade | magia | arma
        soCura: new BooleanField({ initial: false }),      // só Ações que curam
        minimo: new StringField({ initial: "0" })          // o custo nunca fica abaixo disso
      ,
        soItemNome: new StringField({ initial: "" })})),
      // Fase 6 (P): enquanto no ator, muda o máximo de um grupo exclusivo.
      limitesDeGrupo: new ArrayField(new SchemaField({
        grupo: new StringField({ initial: "" }),
        maximo: new NumberField({ initial: 2, min: 1, integer: true }),
        maximoIgualAoRank: new BooleanField({ initial: false }) // ex.: Força da Natureza: 1/2/3 escolhas juntas nos ranks 1/2/3
      })),
      // Fase 5b: reação ANTES da rolagem de um ataque inimigo.
      //   reacaoPreAtaque: "" | "proteger" (vira o alvo no lugar do aliado)
      //                    | "dificuldade" (impõe Dificuldade à rolagem)
      //   reacaoAlcance: metros entre você e quem é atacado ("" = sem limite)
      //   reacaoQuem: "aliado" (só aliados) | "euOuAliado"
      //   reacaoCustoRecurso/Quantidade: custo pago ao aceitar (ex.: 1 Estamina,
      //   1 Dado de Destino), além de 1 uso se a habilidade tiver usos.
      reacaoPreAtaque: new StringField({ initial: "" }),
      reacaoAlcance: new StringField({ initial: "" }),
      reacaoQuem: new StringField({ initial: "aliado" }),
      reacaoCustoRecurso: new StringField({ initial: "" }),
      reacaoCustoQuantidade: new StringField({ initial: "1" }),
      // Fase 6 (M14): "desviar" - quem ataca pode pagar para resistir ao desvio (vazio = não pode resistir).
      reacaoNovoAlvoRaio: new StringField({ initial: "1" }),      // Escudo Vivo: m de mim até o aliado; Desviar: m de quem ataca até a nova vítima (1 = colado)
      reacaoResistirRecurso: new StringField({ initial: "" }),     // "" | estaminaCombate | mana | estresse
      reacaoResistirQuantidade: new StringField({ initial: "1" }),
      // Fase 5b: pode entregar a Prioridade gerada pelo próprio ataque a um
      // aliado, em vez do alvo (ex.: Ataque Combinado). Gasta 1 uso.
      transferePrioridadeDoAtaque: new BooleanField({ initial: false }),
      // Fase 5 (Prioridade Nível 3): pode tomar uma Prioridade concedida a
      // outro personagem ("aliado", "inimigo" ou "qualquer" em relação a
      // quem usa). Gasta 1 uso e o custo da 1ª Ação com usos (ex.: Oportunismo).
      tomaPrioridade: new StringField({ initial: "" }),
      // Fase 5: soma à rolagem de ataque de quem ataca este personagem, antes
      // de comparar com a Defesa (ex.: "-1d10" - Olhar Culposo). Aceita @rank
      // e tokens do dono. Aparece no card do ataque.
      ataqueRecebidoFormula: new StringField({ initial: "" }),
      ataqueRecebidoSoOrigem: new StringField({ initial: "" }), // "" qualquer | magia | arma | corpoACorpo | distancia - filtro do ajuste acima (Pele Antimágica)
      descricao: new HTMLField({ initial: "" }),
      mostrarDescricao: new BooleanField({ initial: false }),
      // Não envia a descrição no card de uso (exceção à configuração do mundo).
      ocultarDescricaoNoChat: new BooleanField({ initial: false }),
      // Indicador do livro: "PI" (gera Prioridade para inimigo), "PA" (para
      // aliado), "NP" (não gera), "" (não informado). Cada Ação pode sobrescrever.
      prioridadeIndicador: new StringField({ initial: "" }),
      // Permite ligar/desligar a habilidade sem apagá-la (afeta os Efeitos Vinculados de qualquer Ação dela)
      ativo: new BooleanField({ initial: true }),
      // Bug real corrigido: este campo era escrito por várias Habilidades
      // passivas simples (ex: Maestria Interior, Místico - "+1 no
      // Espírito, escalando por rank") desde antes de existir aqui no
      // schema - o Foundry SEMPRE descartava esses dados na criação do
      // item (um DataModel só aceita campos que ele mesmo declara), então
      // "item.system.modificadores" nunca existia de verdade, e o loop
      // "2.5" de prepareDerivedData (que lê exatamente este campo) nunca
      // tinha nada pra somar - a causa raiz real por trás de "não dá +1
      // no meta atributo", não um problema na lógica de soma em si.
      modificadores: new ArrayField(new SchemaField(campoModificador())),
      // Categoria/origem do ITEM inteiro (não de uma Ação específica) -
      // "" (Classe/genérico) ou "subclasse". Existe porque a categoria de
      // uma Ação (ver campoAcao > categoria) só aparece na ficha quando a
      // Habilidade TEM uma Ação ativa - a maioria das Habilidades de
      // Subclasse é 100% passiva (sem Ação nenhuma), então nunca tinha
      // como mostrar "Subclasse" na lista da ficha. Preenchido
      // automaticamente por naurenGarantirHabilidadeDeSubclasse (usada
      // por toda função de Subclasse) - não precisa configurar à mão.
      origem: new StringField({ initial: "" }),
      // Enquanto esta Habilidade estiver ATIVA no ator, a penalidade
      // automática de Estresse (-1 Ataque/Defesa/Dano/Movimento por ponto
      // atual) para de ser aplicada por inteiro (ex: "Berserker" do
      // Guerreiro - "não sofre penalidade por possuir pontos de
      // estresse"). É tudo-ou-nada (não reduz parcialmente).
      ignoraPenalidadeEstresse: new BooleanField({ initial: false }),
      // ===== "1ª VEZ POR TURNO/RODADA/CENA/DIA" (reaproveita o MESMO
      // contador de usaUsosPassiva/usosPassivaMax/usosPassivaReset já
      // usado por Habilidades passivas comuns - só ADICIONA dois pontos
      // de consumo automático a esse contador, sem precisar de UI nova) =====
      // "reducaoDanoPorUso": quando preenchido (uma fórmula, aceita
      // @token), e esta Habilidade tem "usaUsosPassiva" ligado com 1+ uso
      // disponível, a PRÓXIMA vez que o dono sofrer dano o valor é
      // subtraído (depois de Bloquear/Esquivar/Redução de Dano fixa, tudo
      // ANTES de tirar da Vida) e 1 uso é consumido - ex: "Indestrutível"
      // (Guerreiro): "reducaoDanoPorUso: @poderAtaque" com usosPassivaMax
      // 1/turno. Não empilha com "Redução de Dano Sofrido" comum (soma
      // normalmente, os dois reduzem o MESMO dano final em sequência).
      reducaoDanoPorUso: new StringField({ initial: "" }),
      reducaoDanoPorUsoCustoMana: new NumberField({ initial: 0, min: 0, integer: true }), // cada uso também gasta Mana (sem Mana, não reduz) - ex.: Escudo Reativo
      // "suprimePrioridadePorUso": quando ligado, e esta Habilidade tem
      // "usaUsosPassiva" com 1+ uso disponível, o PRÓXIMO ataque que o
      // dono desferir (com "Dar Prioridade" ativo na Ação, automático em
      // qualquer ataque bem-sucedido) NÃO concede Prioridade ao alvo, e 1
      // uso é consumido - ex: "Postura Real" (Guerreiro): "o 1º ataque do
      // turno não concede Prioridade ao alvo".
      suprimePrioridadePorUso: new BooleanField({ initial: false }),
      // Enquanto esta Habilidade estiver ATIVA, o(s) recurso(s)
      // customizado(s) com este "id" nunca ficam travados por outro
      // recurso par (ver campoRecursoDeclarado#travaRecursoId) - aceita
      // vários ids separados por vírgula (ex: "determinacao,ofuscacao")
      // já que "Ambivalência" (Empíreo) precisa desbloquear os DOIS ao
      // mesmo tempo (funciona pra qualquer lado que o personagem esteja).
      desbloqueiaTravaDeRecurso: new StringField({ initial: "" }),
      // Mesmo mecanismo de Classe/Subclasse (ver campoRecursoDeclarado) -
      // uma Habilidade TAMBÉM pode declarar recursos próprios. Existe
      // especificamente pra recursos que só devem aparecer na ficha
      // quando UM NÓ ESPECÍFICO de Subclasse é investido (não a
      // Subclasse inteira) - ex: "Pontos Elevados" de Elevar a Dualidade
      // (Empíreo), que só faz sentido existir pra quem tem essa
      // Habilidade concedida, não pra todo Empíreo com qualquer
      // Subclasse equipada.
      recursosDeclarados: new ArrayField(new SchemaField(campoRecursoDeclarado())),
      // Efeito Vinculado NO NÍVEL DO ITEM (passivo): aplica sozinho, sem
      // precisar "usar" a habilidade, desde que ela esteja ATIVA (checkbox
      // acima) - igual o de Armadura/Consumível, mas gatilhado por "ativo"
      // em vez de "equipado". Independe do "Efeito ativo" da ficha do
      // próprio Efeito - só o checkbox de CADA vínculo manda (ver
      // NaurenActor#prepareDerivedData). Diferente do Efeito Vinculado DE
      // UMA AÇÃO (dentro de "acoes" abaixo), que só vale enquanto aquela
      // Ação específica está sendo usada/rolada.
      efeitosVinculados: new ArrayField(new SchemaField(campoEfeitoVinculado())),
      // Rank desta Habilidade:
      // representa "quantos pontos foram investidos nela" (via Classe subindo
      // automaticamente ao bater um nível, ou via Subclasse quando o jogador
      // clica no nó da árvore e gasta 1 ponto - nenhum dos dois ainda existe,
      // chegam nas próximas fases). Uma Ação desta Habilidade pode ter blocos
      // de dano/cura ou o bônus de ataque com uma tabela "porRank" (ver
      // campoDanoBloco/campoCuraBloco/campoAcao) que troca a fórmula/bônus
      // usado conforme o rank atual - ex: um dado de dano que vai de 1d6
      // (rank 1) pra 1d8 (rank 2) pra 1d10 (rank 3).
      rankAtual: new NumberField({ initial: 0, min: 0, integer: true }),
      rankMax: new NumberField({ initial: 1, min: 0, integer: true }),
      // Qual Ação da lista abaixo é usada quando o jogador clica no dado
      acaoAtivaIndex: new NumberField({ initial: 0, min: 0, integer: true }),
      // Usos de Habilidade PASSIVA - pra habilidades que reagem
      // SOZINHAS (ex: "Indestrutível: a 1ª vez a cada turno que sofrer
      // dano, reduza-o..."), sem o jogador precisar "usar" nada com um
      // clique - diferente do "usaUsos" de DENTRO de uma Ação (campoAcao),
      // que é pra Ações ATIVAS/roláveis. Reaproveita o MESMO motor de reset
      // por turno/rodada/cena/dia (ver naurenRecarregarUsos) e a MESMA UI
      // de contador +/- que "cargas" já usa (ver _resolverFonteCargas) -
      // o consumo pode ser MANUAL (o jogador clica "-1" quando a passiva
      // dispara) ou automático, quando associado a um Gatilho por Evento.
      usaUsosPassiva: new BooleanField({ initial: false }),
      // Máximo de usos por fórmula (aceita @rank). Vazio = usa usosPassivaMax.
      usosPassivaMaxFormula: new StringField({ initial: "" }),
      usosPassivaAtual: new NumberField({ initial: 1, min: 0, integer: true }),
      usosPassivaMax: new NumberField({ initial: 1, min: 0, integer: true }),
      usosPassivaReset: new StringField({ initial: "turno" }), // turno|rodada|cena|dia
      // Usos da HABILIDADE inteira, compartilhados entre TODAS as suas
      // Ações (ver campoAcao > usaUsos) - diferente de "usaUsosPassiva"
      // acima (que é pra reações automáticas, sem clique) e do "usaUsos"
      // DENTRO de uma Ação (que é um contador exclusivo daquela Ação só).
      // Ex: Comungar (Druida) - "Comungar — Vida" e "Comungar — Mana" são
      // a MESMA Habilidade com 1 uso/dia no manual, não duas Ações com 1
      // uso cada: liga "usaUsos" AQUI (no item) e marca "usaUsos: true"
      // em CADA Ação que deve consumir dele - nenhuma delas precisa (nem
      // deve) ter seu próprio usosAtual/usosMax/usosMaxPorNivel nesse
      // caso. Se este campo estiver DESLIGADO, cada Ação com "usaUsos"
      // continua com seu contador próprio, exatamente como sempre foi.
      usaUsos: new BooleanField({ initial: false }),
      usosAtual: new NumberField({ initial: 1, min: 0, integer: true }),
      usosMax: new NumberField({ initial: 1, min: 0, integer: true }),
      usosReset: new StringField({ initial: "dia" }), // cena|dia|rodada|turno
      usosMaxPorNivel: new ArrayField(new SchemaField({
        nivel: new NumberField({ initial: 1, min: 1, integer: true }),
        valor: new NumberField({ initial: 1, min: 0, integer: true })
      })),
      // Gatilhos por Evento: reações AUTOMÁTICAS a algo que
      // acontece no combate (aliado sofreu dano, você acertou/errou um
      // ataque, você mesmo sofreu dano) - ver naurenProcessarGatilhos. Cada
      // entrada concede uma quantidade de um recurso (padrão ou
      // Customizado) quando o evento acontece. Compartilha o limite de uso
      // desta MESMA Habilidade (usaUsosPassiva acima) se estiver ligado -
      // um contador só pra todos os gatilhos dela, não um por gatilho.
      usaGatilhos: new BooleanField({ initial: false }),
      // Imunidade a Condições (Criador de Monstros, M08): enquanto este item estiver ativo, o dono
      // nunca recebe estas Condições (UUID do compêndio, "self:Nome" ou o nome). A tentativa é
      // registrada no card ("imune a X").
      imunidadesCondicoes: new ArrayField(new StringField()),
      imuneMovimentoForcado: new BooleanField({ initial: false }), // 0.94.2: não pode ser empurrado/puxado contra a vontade
      movimentoSemPrioridadeMetros: new StringField({ initial: "" }), // Fase 4 (M02): metros por turno que não geram Prioridade ao chegar perto (aceita @rank, @categoria, @nivel; 99 = qualquer distância)
      dividirDanoPercentual: new NumberField({ initial: 0, min: 0, max: 100 }), // Fase 6 (M14): % do dano de ataque que sofro passa para quem tem a Condição abaixo, aplicada por mim
      dividirDanoCondicaoUuid: new StringField({ initial: "" }),
      gatilhos: new ArrayField(new SchemaField(campoGatilho())),
      // Emanação (auras persistentes: "fica sempre ligada, centrada no meu
      // token, e quem estiver dentro do raio sofre um efeito"): enquanto
      // esta Habilidade estiver ATIVA, no evento de turno/rodada
      // escolhido, aplica dano/estresse/perda de Estamina em todo mundo
      // (aliados/inimigos/todos) a até um raio do MEU token. Não existe
      // nenhuma área "desenhada" que precisa acompanhar o token - a
      // distância é sempre recalculada na hora, a partir da posição ATUAL
      // do token, então segue o personagem automaticamente sem esforço.
      usaEmanacao: new BooleanField({ initial: false }),
      emanacaoEvento: new StringField({ initial: "inicioTurno" }), // inicioTurno|fimTurno|inicioRodada|fimRodada
      emanacaoRaio: new StringField({ initial: "3" }),
      // Troca "emanacaoRaio" a partir do rank indicado (mesmo mecanismo
      // de campoDanoBloco/campoCuraBloco) - ex: Presença, Empíreo - 2m
      // no rank 1, 3m no rank 2 (nível 8), 4m no rank 3 (nível 13), 5m
      // no rank 4 (nível 18). Usa "rankAtual" DESTA Habilidade.
      emanacaoRaioPorRank: new ArrayField(new SchemaField({
        rank: new NumberField({ initial: 1, min: 1, integer: true }),
        valor: new StringField({ initial: "" })
      })),
      // Bug real corrigido: a exclusão do próprio dono era HARDCODED e
      // incondicional (naurenProcessarEmanacoes: "if (t === tokenFonte)
      // continue"), então "todos" nunca incluía de verdade quem concedeu
      // a Emanação - não existia NENHUMA forma de configurar uma que
      // afetasse o próprio dono também. Consolidado numa 4ª opção NESTE
      // mesmo campo ("todosComVoce", ver
      // NAUREN_CONTAGEM_DISPOSICAO_OPCOES_SEM_DONO) em vez de um
      // checkbox separado - mais simples de usar e mais compacto.
      emanacaoDisposicao: new StringField({ initial: "inimigos" }), // aliados|inimigos|todos|todosComVoce
      emanacaoEfeito: new StringField({ initial: "dano" }), // dano|cura|estresse|estamina|condicao
      emanacaoQuantidade: new StringField({ initial: "1d4" }),
      // Cor da área no mapa - vazio usa a cor que o próprio jogador
      // escolheu no Foundry (Configurações > Minha Cor de Usuário).
      emanacaoCor: new StringField({ initial: "" }),
      // Mesma ideia de "templateInvisivel": a Emanação continua seguindo o
      // token e aplicando efeitos normalmente, mas fica invisível durante o
      // jogo (só aparece na camada de Regiões). "visibility" e
      // "attachToToken" são independentes no Foundry, então esconder a
      // área NÃO quebra o acompanhamento do token.
      emanacaoInvisivel: new BooleanField({ initial: false }),
      // Só usados quando "emanacaoEfeito" é "condicao" - aplica a
      // Condição/Efeito escolhido em cada alvo atingido, somando os
      // acúmulos indicados (1 se não for acumulável).
      emanacaoCondicaoUuid: new StringField({ initial: "" }),
      emanacaoCondicaoAcumulos: new StringField({ initial: "1" }),
      // Ativação condicional do efeito periódico da Emanação (ex:
      // Presença, Empíreo - o dreno de Estamina só acontece em Profusão
      // Retraída) - vazio (padrão) = o efeito sempre dispara enquanto a
      // Emanação estiver ligada (comportamento de sempre); preenchido =
      // só dispara quando o DONO desta Habilidade tiver a Condição
      // indicada ativa. Não afeta a Região visual em si (continua
      // aparecendo no mapa igual), só o efeito mecânico.
      emanacaoAtivaSePorCondicaoUuid: new StringField({ initial: "" }),
      // Variantes por Condição do dono (Semblante Mutável, monstros): se o dono tiver a
      // Condição "seCondicaoUuid", a Emanação aplica "condicaoUuid" (× acumulos) em vez da
      // padrão. Com variantes preenchidas, a Emanação só dispara quando o dono tiver a
      // Condição de uma delas ou a de "emanacaoAtivaSePorCondicaoUuid".
      emanacaoVariantes: new ArrayField(new SchemaField({
        seCondicaoUuid: new StringField({ initial: "" }),
        condicaoUuid: new StringField({ initial: "" }),
        acumulos: new StringField({ initial: "1" })
      })),
      // ===== BÔNUS DE TESTE EM ÁREA, 1x POR TURNO (ex: Presença, Empíreo -
      // "você e aliados na área podem rolar 1d4 adicional uma vez por
      // turno num teste de ataque") - MESMA área da Emanação acima
      // (reaproveita "usaEmanacao"/"ativo"/"emanacaoRaio"), mas um efeito
      // TOTALMENTE diferente: em vez de algo automático que dispara
      // sozinho, oferece uma ESCOLHA no popup de pré-Ação de QUALQUER
      // ataque de QUALQUER ator (incluindo o próprio dono) que esteja
      // dentro do raio agora - "1x por turno" é rastreado no ATOR QUE
      // USA o bônus (flags.nauren.bonusAreaUsadoNoTurno, guarda o
      // identificador do turno em que foi usado - ver
      // naurenIdentificadorTurnoAtual) - reseta sozinho a cada mudança
      // de turno de QUALQUER combatente, sem precisar de nenhum hook.
      concedeBonusTesteArea: new BooleanField({ initial: false }),
      concedeBonusTesteAreaDado: new StringField({ initial: "1d4" }),
      // Se o DONO desta Habilidade tiver esta Condição ativa, troca o
      // dado acima pelo alternativo (ex: Profusão Ousada - 1d4 vira 1d6).
      concedeBonusTesteAreaDadoCondicaoUuid: new StringField({ initial: "" }),
      concedeBonusTesteAreaDadoAlternativo: new StringField({ initial: "1d6" }),
      // Se o DONO tiver esta Condição ativa, o bônus inteiro para de ser
      // oferecido (ex: Profusão Retraída - vira dreno de Estamina, ver
      // Emanação acima, em vez do bônus de ataque).
      concedeBonusTesteAreaBloqueadaPorCondicaoUuid: new StringField({ initial: "" }),
      // Bônus Condicional ao Alvo: enquanto esta Habilidade existir no
      // Ator (não precisa de nenhuma Ação pra isto - é 100% passivo),
      // soma um valor a QUALQUER ataque/dano/alcance sempre que o alvo
      // atualmente selecionado (tecla T) tiver a Condição indicada -
      // reaproveita o MESMO método de "@alvoTemCondicao" (ver
      // _alvoTemCondicoes), mas resolvido automaticamente pra TODA
      // Ação de ataque do Ator, sem precisar configurar cada Arma/Ação
      // manualmente com "Verificar Condição no Alvo". Ex: Marca do
      // Caçador - "Foco Mortal" concede alcance, "Tiro Letal" concede
      // dano, cada um dentro do EFEITO correspondente (ver
      // NaurenEfeitoData), só contando enquanto esse Efeito estiver
      // ativo - ver "Escolher Efeito ao Usar" em campoAcao.
      bonusCondicionalAoAlvo: new ArrayField(new SchemaField(campoBonusCondicionalAoAlvo())),
      // Construção por pontos (0.94, Bancada de Invenção): tabela de fórmulas e características que
      // montam um item (arma, frasco, botas, criatura). Ver naurenMontarItemDoProjeto.
      construcao: new ObjectField({ initial: {} }),
      // 0.94.1: como esta Habilidade mexe nos Frascos (bonus, maximizado, sem colateral, ao beber, perfumes...).
      frascoMods: new ObjectField({ initial: {} }),
      obraPrima: new ObjectField({ initial: {} }), // 0.94.3: configuração da janela da Obra Prima (Estudioso do Oculto)
      // 0.94.3: regras extras genéricas (ultimoUsoCritico, condicaoAoAcertarProjeto, bonusComEquipamento).
      regrasExtras: new ObjectField({ initial: {} }),
      acoes: new ArrayField(new SchemaField(campoAcao()))
    };
  }
}

class NaurenArmaData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      luzVisao: campoLuzVisao(), // 0.99: luz e visão do item no token
      venenoModo: new StringField({ initial: "auto" }), // auto (pela categoria: corpo-a-corpo = efeito único; Alcance/Distância = cravado) | curto | cravado
      venenoGolpesRestantes: new NumberField({ initial: 0, min: 0, integer: true }), // veneno por N golpes (0 = até ser removido); conta cada uso
      usaMunicao: new BooleanField({ initial: false }),         // cada ataque gasta 1 munição
      tipoMunicao: new StringField({ initial: "" }),            // tipo de munição aceito (ex.: flecha, municao)
      municaoSelecionadaId: new StringField({ initial: "" }),   // qual munição do inventário está em uso
      descricao: new HTMLField({ initial: "" }),
      disponivelNoInicio: new StringField({ initial: "" }), // Criador de Personagem: "" = padrão do sistema | "sim" | "nao"
      mostrarDescricao: new BooleanField({ initial: false }),
      // Não envia a descrição no card de uso (exceção à configuração do mundo).
      ocultarDescricaoNoChat: new BooleanField({ initial: false }),
      // Indicador do livro: "PI" (gera Prioridade para inimigo), "PA" (para
      // aliado), "NP" (não gera), "" (não informado). Cada Ação pode sobrescrever.
      prioridadeIndicador: new StringField({ initial: "" }),
      equipado: new BooleanField({ initial: false }),
      // Efeito Vinculado NO NÍVEL DO ITEM (passivo): aplica sozinho enquanto
      // esta arma estiver EQUIPADA (checkbox acima) - igual o de Armadura,
      // independente do "Efeito ativo" da ficha do próprio Efeito. Diferente
      // do Efeito Vinculado DE UMA AÇÃO (dentro de "acoes" abaixo), que só
      // vale enquanto aquela Ação específica está sendo usada/rolada.
      efeitosVinculados: new ArrayField(new SchemaField(campoEfeitoVinculado())),
      // 0.94.24: Efeitos (passivas com gatilho, efeito nos ataques, imunidade) que o item coloca na ficha
      // enquanto estiver EQUIPADO e tira ao desequipar/remover - ver naurenSincronizarEfeitosAoEquipar.
      efeitosAoEquipar: new ArrayField(new StringField()),
      // 0.110: pigmentos aplicados (Códex) e modificações de habilidades enquanto equipada.
      pigmentosAplicados: new ArrayField(new SchemaField(campoPigmentoAplicado())),
      modificaHabilidades: new ArrayField(new SchemaField(campoModificaHabilidade())),
      // Rank desta arma (mesmo mecanismo da Habilidade - útil pra
      // armas concedidas/melhoradas por Classe ou Subclasse). Ver
      // NaurenHabilidadeData pra explicação completa de rankAtual/rankMax
      // e da tabela "porRank" dentro de cada bloco de dano/cura/ataque.
      rankAtual: new NumberField({ initial: 0, min: 0, integer: true }),
      rankMax: new NumberField({ initial: 1, min: 0, integer: true }),
      acaoAtivaIndex: new NumberField({ initial: 0, min: 0, integer: true }),
      // Veneno Carregado (Toxina Laminar e afins): UUID de um item de
      // Condição representando o veneno (ver Capítulo VII do manual - "Um
      // golpe... aplica 1 acúmulo de veneno"). Aplicado automaticamente a
      // cada acerto desta arma (ver _resolverAlvosDaAcao), reaproveitando o
      // mesmo caminho de "Condições Aplicadas" de uma Ação. Fica carregado
      // até ser trocado/removido manualmente - não se consome sozinho após
      // 1 acerto (assim cobre tanto golpes corpo-a-corpo repetidos quanto
      // flechas/lanças, cujo efeito "dura enquanto estiverem cravadas").
      venenoCarregado: new StringField({ initial: "" }),
      // Leve | Média | Pesada | Alcance | Distância | Catalisador ("" = deduzir)
      categoria: new StringField({ initial: "" }),
      // Opcional: vincula o veneno carregado acima a um Consumível REAL do
      // inventário do Ator (mesma ideia já usada em "cargasConsumivelId"
      // de uma Ação, pra munição) - guarda o ID do item (não UUID, já que
      // sempre é um item do MESMO Ator). Cada acerto usando esta arma
      // desconta 1 do "quantidade" desse Consumível; ao chegar em 0, o
      // veneno é removido (venenoCarregado volta a "") automaticamente.
      // Se vazio, o veneno continua "infinito" (comportamento de sempre).
      venenoCargasConsumivelId: new StringField({ initial: "" }),
      // Usos da ARMA inteira (0.94), compartilhados entre as Ações com "usaUsos" (ex.: Arma de Inventor:
      // 5 usos, recarregados só pela Ação de Recarga - usosReset "manual"). Mesmo motor das Habilidades.
      usaUsos: new BooleanField({ initial: false }),
      usosAtual: new NumberField({ initial: 1, min: 0, integer: true }),
      usosMax: new NumberField({ initial: 1, min: 0, integer: true }),
      usosReset: new StringField({ initial: "cena" }),
      usosMaxPorNivel: new ArrayField(new SchemaField({
        nivel: new NumberField({ initial: 1, min: 1, integer: true }),
        valor: new NumberField({ initial: 1, min: 0, integer: true })
      })),
      // Peso no limite de equipamentos ofensivos (0 = pela categoria, ver naurenPesoOfensivo).
      pesoOfensivo: new NumberField({ initial: 0, min: 0, integer: true }),
      // Reações pagas (0.94, genérico): enquanto a arma está equipada, o dono pode pagar um recurso
      // ao ser atacado para somar à Defesa ("defesa") ou, ao sofrer dano, para reduzi-lo ("reduzirDano").
      // custoVariavel: escolhe quanto pagar e reduz o mesmo tanto (Inventor: 1 PdI = 1 de dano).
      reacoesPagas: new ArrayField(new SchemaField({
        nome: new StringField({ initial: "" }),
        tipo: new StringField({ initial: "defesa" }),          // defesa | reduzirDano
        formula: new StringField({ initial: "1d4" }),          // bônus por compra (defesa) ou por ponto (reduzirDano fixo)
        recurso: new StringField({ initial: "" }),             // recursoCustom:id | estaminaCombate | mana
        custo: new StringField({ initial: "1" }),
        custoVariavel: new BooleanField({ initial: false }),
        soEmPrioridade: new BooleanField({ initial: false }),  // só contra ataques feitos numa Prioridade
        usosPorTurno: new NumberField({ initial: 0, min: 0, integer: true }) // 0 = sem limite
      })),
      // Nasce vazia de propósito - a Ação padrão "Ataque" é adicionada na
      // hora da CRIAÇÃO do item (ver NaurenActorSheet, botão "+ Armas"),
      // passando pelo mesmo caminho de uma Ação criada manualmente. Usar o
      // "initial" do próprio schema aqui causava um bug: essa primeira Ação
      // não passava pela mesma limpeza/validação que as outras, e campos
      // como "usaCargas"/"usaTemplate" se comportavam de forma inconsistente.
      acoes: new ArrayField(new SchemaField(campoAcao()))
    };
  }
}

class NaurenMagiaData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: new HTMLField({ initial: "" }),
      mostrarDescricao: new BooleanField({ initial: false }),
      // Não envia a descrição no card de uso (exceção à configuração do mundo).
      ocultarDescricaoNoChat: new BooleanField({ initial: false }),
      // Indicador do livro: "PI" (gera Prioridade para inimigo), "PA" (para
      // aliado), "NP" (não gera), "" (não informado). Cada Ação pode sobrescrever.
      prioridadeIndicador: new StringField({ initial: "" }),
      // Igual à Habilidade Ativa - desliga o item (e os Efeitos Vinculados
      // dele) sem apagar. Nasce true (diferente de Habilidade, que também
      // nasce true - mantido igual de propósito).
      ativo: new BooleanField({ initial: true }),
      // Mesmo bug real corrigido em NaurenHabilidadeData acima - este
      // campo nunca esteve declarado aqui, então qualquer Magia com
      // "modificadores" no nível raiz (ex: um bônus passivo simples,
      // fora de Efeito Vinculado) tinha esse dado descartado pelo
      // Foundry na criação, e o loop "2.5" de prepareDerivedData nunca
      // tinha nada pra somar.
      modificadores: new ArrayField(new SchemaField(campoModificador())),
      origem: new StringField({ initial: "" }),
      ignoraPenalidadeEstresse: new BooleanField({ initial: false }),
      reducaoDanoPorUso: new StringField({ initial: "" }),
      reducaoDanoPorUsoCustoMana: new NumberField({ initial: 0, min: 0, integer: true }), // cada uso também gasta Mana (sem Mana, não reduz) - ex.: Escudo Reativo
      suprimePrioridadePorUso: new BooleanField({ initial: false }),
      desbloqueiaTravaDeRecurso: new StringField({ initial: "" }),
      recursosDeclarados: new ArrayField(new SchemaField(campoRecursoDeclarado())),
      efeitosVinculados: new ArrayField(new SchemaField(campoEfeitoVinculado())),
      // Rank desta magia (mesmo mecanismo da Habilidade/Arma).
      rankAtual: new NumberField({ initial: 0, min: 0, integer: true }),
      rankMax: new NumberField({ initial: 1, min: 0, integer: true }),
      acaoAtivaIndex: new NumberField({ initial: 0, min: 0, integer: true }),
      usaUsosPassiva: new BooleanField({ initial: false }),
      // Máximo de usos por fórmula (aceita @rank). Vazio = usa usosPassivaMax.
      usosPassivaMaxFormula: new StringField({ initial: "" }),
      usosPassivaAtual: new NumberField({ initial: 1, min: 0, integer: true }),
      usosPassivaMax: new NumberField({ initial: 1, min: 0, integer: true }),
      usosPassivaReset: new StringField({ initial: "turno" }),
      // Usos da Magia inteira, compartilhados entre TODAS as suas Ações
      // (ver mesmo comentário completo em NaurenHabilidadeData).
      usaUsos: new BooleanField({ initial: false }),
      usosAtual: new NumberField({ initial: 1, min: 0, integer: true }),
      usosMax: new NumberField({ initial: 1, min: 0, integer: true }),
      usosReset: new StringField({ initial: "dia" }),
      usosMaxPorNivel: new ArrayField(new SchemaField({
        nivel: new NumberField({ initial: 1, min: 1, integer: true }),
        valor: new NumberField({ initial: 1, min: 0, integer: true })
      })),
      usaGatilhos: new BooleanField({ initial: false }),
      // Imunidade a Condições (Criador de Monstros, M08): enquanto este item estiver ativo, o dono
      // nunca recebe estas Condições (UUID do compêndio, "self:Nome" ou o nome). A tentativa é
      // registrada no card ("imune a X").
      imunidadesCondicoes: new ArrayField(new StringField()),
      imuneMovimentoForcado: new BooleanField({ initial: false }), // 0.94.2: não pode ser empurrado/puxado contra a vontade
      movimentoSemPrioridadeMetros: new StringField({ initial: "" }), // Fase 4 (M02): metros por turno que não geram Prioridade ao chegar perto (aceita @rank, @categoria, @nivel; 99 = qualquer distância)
      dividirDanoPercentual: new NumberField({ initial: 0, min: 0, max: 100 }), // Fase 6 (M14): % do dano de ataque que sofro passa para quem tem a Condição abaixo, aplicada por mim
      dividirDanoCondicaoUuid: new StringField({ initial: "" }),
      gatilhos: new ArrayField(new SchemaField(campoGatilho())),
      usaEmanacao: new BooleanField({ initial: false }),
      emanacaoEvento: new StringField({ initial: "inicioTurno" }),
      emanacaoRaio: new StringField({ initial: "3" }),
      emanacaoDisposicao: new StringField({ initial: "inimigos" }), // aliados|inimigos|todos|todosComVoce
      emanacaoEfeito: new StringField({ initial: "dano" }),
      emanacaoQuantidade: new StringField({ initial: "1d4" }),
      emanacaoCor: new StringField({ initial: "" }),
      emanacaoInvisivel: new BooleanField({ initial: false }),
      emanacaoCondicaoUuid: new StringField({ initial: "" }),
      emanacaoCondicaoAcumulos: new StringField({ initial: "1" }),
      // Grimório do Mago (ver Habilidade "Grimório do Mago") - marca
      // esta Magia como estando "na página aberta" agora, mesmo padrão
      // visual/mecânico de "equipado" nas Armas (ícone clicável, sem
      // limite de quantas podem estar marcadas ao mesmo tempo - o
      // manual diz "duas páginas", mas isso fica a critério da mesa,
      // não é travado pelo sistema). Só aparece na ficha quando
      // "ehMagiaDeMago" também estiver ligado.
      paginaAberta: new BooleanField({ initial: false }),
      paginaGrimorio: new NumberField({ initial: 0, integer: true }), // posição da magia no Grimório (1, 2, 3...)
      // Marca esta Magia como pertencente ao sistema de Grimório do
      // Mago - controla se "paginaAberta" (acima) e o popup de aviso
      // ao conjurar fora da página aparecem na ficha desta Magia
      // específica. Reutilizável por futuros mecanismos que também só
      // devam se aplicar a Magias de Mago (ex: Condensar Magia/
      // Conjuração Poderosa).
      ehMagiaDeMago: new BooleanField({ initial: false }),
      // Marca esta Magia como pertencente ao sistema de Penitência do
      // Sacerdote (ver Provação do Entrelaço) - qualquer Ação desta
      // Magia com "usaPenitencia" (ver campoAcao) marcado mostra o
      // popup "Evitar/Aceitar a Penitência" antes de conjurar. Mesmo
      // padrão de "ehMagiaDeMago" acima - reutilizável por futuros
      // mecanismos que só devam valer pra Magias de Sacerdote.
      ehMagiaDeSacerdote: new BooleanField({ initial: false }),
      acoes: new ArrayField(new SchemaField(campoAcao()))
    };
  }
}

class NaurenArmaduraData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      luzVisao: campoLuzVisao(), // 0.99: luz e visão do item no token
      descricao: new HTMLField({ initial: "" }),
      disponivelNoInicio: new StringField({ initial: "" }), // Criador de Personagem: "" = padrão do sistema | "sim" | "nao"
      mostrarDescricao: new BooleanField({ initial: false }),
      // Não envia a descrição no card de uso (exceção à configuração do mundo).
      ocultarDescricaoNoChat: new BooleanField({ initial: false }),
      // Indicador do livro: "PI" (gera Prioridade para inimigo), "PA" (para
      // aliado), "NP" (não gera), "" (não informado). Cada Ação pode sobrescrever.
      prioridadeIndicador: new StringField({ initial: "" }),
      defesaBonus: new NumberField({ initial: 1, min: 0, integer: true }),
      tipo: new StringField({ initial: "Couro" }),
      // 0.94.9: pontos no limite de equipamentos de Ataque (Cap. VI: escudos contam). 0 = escudo pela tabela, o resto não conta.
      pesoOfensivo: new NumberField({ initial: 0, min: 0, integer: true }),
      // 0.94.2: efeitos montados (Botas do Inventor): mesma forma do Frasco - ativar aplica e rola o colateral.
      frasco: new ObjectField({ initial: {} }),
      equipado: new BooleanField({ initial: false }),
      // Passivo: aplica automaticamente enquanto a armadura estiver EQUIPADA
      // (continua funcionando exatamente como antes - isso NÃO é uma Ação).
      efeitosVinculados: new ArrayField(new SchemaField(campoEfeitoVinculado())),
      // 0.94.24: Efeitos (passivas com gatilho, efeito nos ataques, imunidade) que o item coloca na ficha
      // enquanto estiver EQUIPADO e tira ao desequipar/remover - ver naurenSincronizarEfeitosAoEquipar.
      efeitosAoEquipar: new ArrayField(new StringField()),
      // 0.110: pigmentos aplicados (Códex) e modificações de habilidades enquanto equipada.
      pigmentosAplicados: new ArrayField(new SchemaField(campoPigmentoAplicado())),
      modificaHabilidades: new ArrayField(new SchemaField(campoModificaHabilidade())),
      usaCargas: new BooleanField({ initial: false }),
      cargasAtual: new NumberField({ initial: 0, min: 0, integer: true }),
      cargasMax: new NumberField({ initial: 1, min: 0, integer: true }),
      consumirCargaAoUsar: new BooleanField({ initial: false }),
      cargasCustoPorUso: new NumberField({ initial: 1, min: 0, integer: true }),
      // Opcional: poderes ATIVOS especiais (ex: "Escudo Reativo: 1x/dia +5 Defesa").
      // A imensa maioria das armaduras não precisa disso - fica vazio por padrão.
      acaoAtivaIndex: new NumberField({ initial: 0, min: 0, integer: true }),
      acoes: new ArrayField(new SchemaField(campoAcao())),
      // Rank desta armadura (mesmo mecanismo de Habilidade/Arma/Magia, ver
      // NaurenHabilidadeData) - permite que o Bônus de Defesa suba sozinho
      // conforme o rank avança, através da tabela abaixo (ex: rank 1 = +2,
      // rank 2 = +4). Sem nenhuma entrada na tabela pro rank atual, o campo
      // "Bônus de Defesa" simples continua valendo normalmente.
      rankAtual: new NumberField({ initial: 0, min: 0, integer: true }),
      rankMax: new NumberField({ initial: 1, min: 0, integer: true }),
      defesaBonusPorRank: new ArrayField(new SchemaField({
        rank: new NumberField({ initial: 1, min: 1, integer: true }),
        valor: new NumberField({ initial: 0, integer: true })
      }))
    };
  }
}

/** 0.98.7: categorias do Equipamento (tipo de item "consumivel" por dentro). Só a de Consumível gasta 1 a cada uso. */
const NAUREN_CATEGORIAS_EQUIPAMENTO = { consumivel: "Consumível", ferramenta: "Ferramenta", acessorio: "Acessório", utensilio: "Utensílio", vestimenta: "Vestimenta", escrito: "Escrito (nota, carta, livro)", moeda: "Moeda", outro: "Outro", pigmento: "Pigmento (aplicar em item)" };
/** 0.99: maior quantidade que um item guarda (cabe em qualquer tela com os pontos de milhar). */
const NAUREN_QUANTIDADE_MAXIMA = 999999999;
/** Número inteiro por extenso com pontos de milhar: 1250000 → "1.250.000". */
function naurenFormatarNumero(n) {
  const v = Math.trunc(Number(n) || 0);
  return (v < 0 ? "-" : "") + String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
/** Número curto para caixas pequenas: 12.500 → "12,5 mil"; 1.250.000 → "1,25 mi". Abaixo de 10.000 fica inteiro. */
function naurenFormatarNumeroCurto(n) {
  const v = Math.trunc(Number(n) || 0), a = Math.abs(v);
  const corta = (x, casas) => String(Math.floor(x * 10 ** casas) / 10 ** casas).replace(".", ",");
  if (a < 10000) return naurenFormatarNumero(v);
  if (a < 1e6) return `${v < 0 ? "-" : ""}${corta(a / 1e3, a < 1e5 ? 1 : 0)} mil`;
  return `${v < 0 ? "-" : ""}${corta(a / 1e6, a < 1e7 ? 2 : a < 1e8 ? 1 : 0)} mi`;
}
/** Lê um número digitado com pontos/espaços ("1.250.000") e limita entre 0 e o máximo. */
function naurenLerNumero(txt) {
  const v = Number(String(txt ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(v) ? Math.max(0, Math.min(NAUREN_QUANTIDADE_MAXIMA, Math.trunc(v))) : 0;
}
/** O item é uma moeda (Equipamento da categoria Moeda)? */
function naurenEhMoeda(item) { return item?.type === "consumivel" && item.system?.categoria === "moeda"; }
// 0.101.3: Florins (ou outra moeda) chegou a 0 na ficha de um personagem/PNJ: sai da ficha.
Hooks.on("updateItem", (item, mudancas, opcoes, userId) => {
  try {
    if (userId !== game.user.id || !naurenEhMoeda(item)) return;
    if (foundry.utils.getProperty(mudancas, "system.quantidade") === undefined) return;
    const ator = item.parent;
    if (ator?.documentName !== "Actor" || ator.type === "armazenamento") return;
    if ((Number(item.system?.quantidade) || 0) <= 0) item.delete().catch(() => {});
  } catch (err) { console.warn("Nauren RPG | moeda zerada", err); }
});
/** O Equipamento gasta 1 da quantidade a cada uso (e some ao zerar)? Só a categoria Consumível. */
function naurenEquipamentoGasta(item) {
  if (item?.type !== "consumivel") return false;
  const cat = item.system?.categoria || "consumivel";
  return cat === "consumivel" || (cat === "escrito" && !!item.system?.escrito?.gastaAoUsar); // 0.106: pergaminho de magia some ao usar
}

/* ---------- 0.99: luz e visão vindas dos itens ---------- */
/** O item tem luz configurada (ligada e com alcance)? */
function naurenItemTemLuz(item) {
  const L = item?.system?.luzVisao?.luz;
  return !!(L?.ativa && Math.max(Number(L.dim) || 0, Number(L.bright) || 0) > 0);
}
/** O item vale agora? "equipado" (itens que se equipam; os outros valem enquanto ativos), "ativo" ou "sempre". */
function naurenItemValeAgora(item, quando) {
  const s = item?.system ?? {};
  if (quando === "sempre") return true;
  if (quando === "ativo") return "equipado" in s ? true : s.ativo !== false; // itens que se equipam: basta estar na mochila
  if ("equipado" in s) return !!s.equipado;
  return s.ativo !== false;
}
/** Luz (a maior), visão (a de maior alcance) e detecções (maior alcance de cada uma) que os itens dão agora. */
function naurenLuzVisaoDoAtor(actor) {
  let luz = null, visao = null;
  const deteccoes = {};
  const tamanho = l => Math.max(Number(l.dim) || 0, Number(l.bright) || 0);
  for (const it of actor?.items ?? []) {
    const lv = it.system?.luzVisao;
    if (!lv) continue;
    const L = lv.luz;
    if (L?.ativa && L.acesa !== false && tamanho(L) > 0 && naurenItemValeAgora(it, L.quando)) {
      const melhor = !luz || (L.priority ?? 0) > (luz.priority ?? 0) || ((L.priority ?? 0) === (luz.priority ?? 0) && tamanho(L) > tamanho(luz));
      if (melhor) luz = { ...foundry.utils.deepClone(L), origem: it.name, itemId: it.id };
    }
    const V = lv.visao;
    if (V?.ativa && naurenItemValeAgora(it, V.quando)) {
      if ((V.range ?? 0) > 0 && (!visao || V.range > visao.range)) visao = { ...foundry.utils.deepClone(V), origem: it.name, itemId: it.id };
      for (const d of V.deteccoes ?? []) if (d?.id && (d.range ?? 0) > 0) deteccoes[d.id] = Math.max(deteccoes[d.id] ?? 0, d.range);
    }
  }
  return { luz, visao, deteccoes };
}
/** As mudanças de token (formato do V14: { key, type, value, priority, phase }) que a luz e a visão dos itens pedem. */
function naurenMudancasTokenLuzVisao(actor) {
  let ligado = true;
  try { ligado = game.settings.get("nauren", "luzDosItens") !== false; } catch (err) { ligado = true; }
  if (!ligado) return [];
  const { luz, visao, deteccoes } = naurenLuzVisaoDoAtor(actor);
  const out = [];
  const add = (key, value) => out.push({ key, value, type: "override", priority: 20, phase: "initial" });
  if (luz) {
    add("light.bright", luz.bright); add("light.dim", Math.max(luz.dim, luz.bright));
    add("light.color", luz.color || null); add("light.alpha", luz.alpha); add("light.angle", luz.angle);
    add("light.animation.type", luz.animation?.type || null); add("light.animation.speed", luz.animation?.speed ?? 5);
    add("light.animation.intensity", luz.animation?.intensity ?? 5); add("light.animation.reverse", !!luz.animation?.reverse);
    for (const k of ["coloration", "luminosity", "attenuation", "saturation", "contrast", "shadows", "negative", "priority"]) add(`light.${k}`, luz[k]);
    add("light.darkness.min", luz.darkness?.min ?? 0); add("light.darkness.max", luz.darkness?.max ?? 1);
  }
  if (visao) {
    add("sight.enabled", true);
    for (const k of ["range", "angle", "visionMode", "attenuation", "brightness", "saturation", "contrast"]) add(`sight.${k}`, visao[k]);
    add("sight.color", visao.color || null);
    deteccoes.basicSight = Math.max(deteccoes.basicSight ?? 0, visao.range);
  }
  for (const [id, alcance] of Object.entries(deteccoes)) { add(`detectionModes.${id}.enabled`, true); add(`detectionModes.${id}.range`, alcance); }
  return out;
}
/** Redesenha luz e visão dos tokens (deste ator, ou de todos), só na tela deste usuário. */
function naurenAtualizarLuzVisaoDosTokens(actor = null) {
  try {
    const tokens = actor ? (actor.getActiveTokens?.(false, false) ?? []) : (canvas?.tokens?.placeables ?? []);
    for (const t of tokens) {
      try { t.document?.reset?.(); } catch (err) { /* segue */ }
      t.initializeSources?.();
    }
    canvas?.perception?.update?.({ initializeLighting: true, initializeVision: true, refreshLighting: true, refreshVision: true });
  } catch (err) { console.warn("Nauren RPG | luz/visão dos tokens", err); }
}
/** Mudou algo que liga/desliga luz ou visão de um item? (equipar, ativar, acender, editar a seção) */
function naurenMudancaMexeLuzVisao(item, changes) {
  if (!item?.system?.luzVisao) return false;
  if (!changes) return true;
  const sys = changes.system ?? {};
  return "luzVisao" in sys || "equipado" in sys || "ativo" in sys || Object.keys(changes).some(k => k.startsWith("system.luzVisao") || k === "system.equipado" || k === "system.ativo");
}
class NaurenConsumivelData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      luzVisao: campoLuzVisao(), // 0.99: luz e visão do item no token
      // 0.98.7: o tipo "consumivel" aparece como "Equipamento"; a categoria diz o que ele é. Só "consumivel" gasta 1 ao usar.
      categoria: new StringField({ initial: "consumivel" }),
      // 0.110: categoria "pigmento": a cor e a qualidade (1 a 3) que ele dá ao ser aplicado num item.
      pigmentoCor: new StringField({ initial: "Azul" }),
      pigmentoQualidade: new NumberField({ initial: 1, min: 1, max: 3, integer: true }),
      venenoCondicaoUuid: new StringField({ initial: "" }),     // frasco de veneno: a Condição que ele aplica
      ehMunicao: new BooleanField({ initial: false }),          // é munição (flecha, bala...)
      tipoMunicao: new StringField({ initial: "" }),            // tipo (ex.: flecha, municao) - a arma usa munição deste tipo
      municaoDanoExtra: new StringField({ initial: "" }),       // dano extra somado ao ataque (ex.: 1d6)
      municaoVenenoUuid: new StringField({ initial: "" }),      // veneno aplicado por esta munição
      municaoVenenoQuantidade: new NumberField({ initial: 0, min: 0, integer: true }), // quantas das próximas munições estão envenenadas
      municaoVenenoTodas: new BooleanField({ initial: false }), // todas envenenadas
      descricao: new HTMLField({ initial: "" }),
      mostrarDescricao: new BooleanField({ initial: false }),
      // Não envia a descrição no card de uso (exceção à configuração do mundo).
      ocultarDescricaoNoChat: new BooleanField({ initial: false }),
      // Indicador do livro: "PI" (gera Prioridade para inimigo), "PA" (para
      // aliado), "NP" (não gera), "" (não informado). Cada Ação pode sobrescrever.
      prioridadeIndicador: new StringField({ initial: "" }),
      quantidade: new NumberField({ initial: 1, min: 0, max: 999999999, integer: true }),
      // Capacidade de referência (ex: "3/5 poções", "12/20 flechas") - puramente
      // informativo/opcional para o próprio item, mas também é o teto usado
      // quando este Consumível é escolhido como fonte de cargas/munição de
      // uma Ação de arma/magia/habilidade (ver campoAcao > cargasConsumivelId).
      quantidadeMax: new NumberField({ initial: 1, min: 0, integer: true }),
      manterAoZerar: new BooleanField({ initial: false }), // fica na ficha mesmo com quantidade 0 (ex.: algo que é reposto)
      // 0.94.1: Frasco montado no Alambique: { efeitos: [...], beneficios: N, colateral: { dado, linhas: [...] }, semColateral }.
      frasco: new ObjectField({ initial: {} }),
      // 0.106: Escrito (categoria "escrito"): formato, papel, letra, capa, lacre e as páginas (ver modulos/escritos.mjs).
      escrito: new ObjectField({ initial: {} }),
      efeito: new StringField({ initial: "Cura 1d6 PV" }),
      custoEstamina: new NumberField({ initial: 0, min: 0, integer: true }),
      custoMana: new NumberField({ initial: 0, min: 0, integer: true }),
      equipado: new BooleanField({ initial: false }),
      // Passivo: aplica automaticamente enquanto o consumível existir no
      // inventário (continua funcionando exatamente como antes).
      efeitosVinculados: new ArrayField(new SchemaField(campoEfeitoVinculado())),
      // Opcional: usos alternativos especiais (ex: poção que cura OU é
      // arremessada causando dano). Se vazio, usa o campo simples "Efeito" acima.
      acaoAtivaIndex: new NumberField({ initial: 0, min: 0, integer: true }),
      acoes: new ArrayField(new SchemaField(campoAcao()))
    };
  }
}

/**
 * Efeito: um item que, quando ativo, aplica automaticamente bônus/penalidades
 * (valores negativos) em qualquer combinação de campos da ficha - o mesmo
 * conjunto de campos da grade "Bônus Manuais" da aba Opções. Pode existir
 * solto no inventário (sempre aplicado enquanto "Ativo" estiver marcado) ou
 * vinculado a uma arma/armadura/habilidade/magia/consumível através do campo
 * "Efeito Vinculado" daquele item (nesse caso, para armas/armaduras também
 * exige que o item esteja equipado).
 */
class NaurenEfeitoData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      luzVisao: campoLuzVisao(), // 0.99: luz e visão do item no token
      capacidades: new ArrayField(new StringField()), // capacidades especiais marcadas na ficha (ver NAUREN_CAPACIDADES)
      // Ajusta o custo de Mana das SUAS magias (ex.: Combustão −1 × rank nas de dano,
      // mínimo 1; Buraco de Minhoca −1 × rank no Salto Etéreo; Empoderamento +1).
      ajusteCustoMana: new ArrayField(new SchemaField({
        valor: new StringField({ initial: "-1" }),
        multiplicarPeloRank: new BooleanField({ initial: false }),
        soMagiaComDano: new BooleanField({ initial: false }),
        soItemNome: new StringField({ initial: "" }),
        minimo: new StringField({ initial: "0" })
      })),
      // Aumenta o dano periódico das Condições que VOCÊ aplica (ex.: Técnica
      // Suja: Sangramento e Hemorragia +1 por acúmulo, por rank).
      bonusDanoPeriodico: new ArrayField(new SchemaField({
        soVenenos: new BooleanField({ initial: false }),
        condicaoNome: new StringField({ initial: "" }),
        valor: new StringField({ initial: "1" }),
        multiplicarPeloRank: new BooleanField({ initial: false }),
        substituirFormula: new StringField({ initial: "" })   // troca a fórmula por tique (ex.: Ingrediente Ofídico: 1d4)
      })),
      // Estudos (Ladino): tipos de informação que este item oferece ao
      // "Estudar" um alvo. Cada tipo arma um efeito no próximo ataque
      // contra o alvo (ou na esquiva contra ele), com acúmulos e duração.
      tiposEstudo: new ArrayField(new SchemaField({
        id: new StringField({ initial: "" }),
        nome: new StringField({ initial: "Novo estudo" }),
        bonusAcerto: new BooleanField({ initial: false }),
        bonusDano: new BooleanField({ initial: false }),
        criticoMais: new BooleanField({ initial: false }),
        semPrioridade: new BooleanField({ initial: false }),
        esquivaContra: new BooleanField({ initial: false }),
        danoExtraDado: new StringField({ initial: "" }),
        condicaoUuid: new StringField({ initial: "" }),
        valor: new StringField({ initial: "1" }),
        sobeComRank: new BooleanField({ initial: true }),
        duracao: new StringField({ initial: "proximoAtaque" }),   // proximoAtaque | rodada | cena
        maxAcumulos: new StringField({ initial: "3" }),
        contaComoInformacao: new BooleanField({ initial: true }),
        // Livro 0.8 (Análise Paciente nova): o bônus vale "por acúmulo de Analisado" (total de
        // informações no alvo), não pelos acúmulos do próprio tipo - o tipo só fica desbloqueado (0/1).
        porAnalisado: new BooleanField({ initial: false }),
        dadosDaArma: new BooleanField({ initial: false }),        // +1 dado da arma no dano (× valor)
        criativa: new StringField({ initial: "" }),               // "" | "acima" (Eu estou acima) | "abaixo" (Você está abaixo)
        dificuldadeExtra: new StringField({ initial: "0" })       // soma na S.I do teste (criativa: +4 → 12 + Int do alvo)
      })),
      // Fase 7: efeito passivo nos SEUS ataques que batem com o filtro
      // (ex.: Golpe Decisivo - pesados e especiais causam Fragmentado).
      efeitosEmAtaques: new ArrayField(new SchemaField({
        ativo: new BooleanField({ initial: true }),
        tipoAtaque: new StringField({ initial: "pesadoOuEspecial" }), // qualquer | pesado | especial | pesadoOuEspecial | basico | especialComArma (habilidade em que se escolhe a arma)
        tipoArma: new StringField({ initial: "" }),                    // "" = qualquer
        condicaoUuid: new StringField({ initial: "" }),
        acumulos: new StringField({ initial: "1" }),
        multiplicarPeloRank: new BooleanField({ initial: false }),
        danoExtraDado: new StringField({ initial: "" }),               // ex.: 1d6
        multiplicarPorInformacoes: new BooleanField({ initial: false }), // × suas informações (estudos) sobre o alvo
        criticoPorInformacao: new BooleanField({ initial: false }),      // crítico 1 mais fácil por informação
        danoMaximo: new BooleanField({ initial: false }),                // o dano da arma sai no máximo (ex.: Lâmina Corrupta)
        soPrimeiroAtaque: new BooleanField({ initial: false }),          // só no seu 1º ataque contra cada alvo (zera no fim do combate)
        soPrimeiroAtaqueTurno: new BooleanField({ initial: false }),     // só no seu 1º ataque de cada turno (ex.: Esgrima da Chuva)
        soComEstadoNome: new StringField({ initial: "" }),               // só enquanto você estiver num estado com este nome (ex.: Profusão)
        soComBeneficioMarca: new StringField({ initial: "" }),           // Marca do Caçador: só se a SUA marca no alvo tiver este benefício
        perguntarEstresse: new BooleanField({ initial: false }),         // pergunta "pagar 1 Estresse?" (Ímpeto Frenético, Destruição Mútua)
        dadosExtrasDaArma: new StringField({ initial: "" }),             // + N dados do mesmo tamanho do maior dado do ataque (Fogo Divino)
        criticoMaisFacil: new StringField({ initial: "" }),              // crítico N mais fácil (Fogo Divino)
        acertoExtraDado: new StringField({ initial: "" }),               // + dado no teste de ataque (ex.: 1d6)
        escalarDadoCasas: new StringField({ initial: "" }),              // escala o dado da arma N casas (aceita @rank; ex.: Disparo Carregado)
        empurrarMetros: new StringField({ initial: "" }),                // o acerto empurra o alvo N metros (aceita @rank; ex.: Rastro do Vendaval)
        empurrarColisaoDano: new StringField({ initial: "" }),           // dano extra se colidir ao ser empurrado (ex.: @dadoDano)
        soEmPrioridadeRoubada: new BooleanField({ initial: false }),     // só em ataques feitos numa Prioridade que você roubou
        danoExtraFixoPor: new StringField({ initial: "" }),              // "" | estresseAliados | prioridadesGeradas | informacoes
        danoExtraFixoValor: new StringField({ initial: "1" }),           // quanto por unidade (× rank se marcado)
        soNoCritico: new BooleanField({ initial: false }),               // o dano extra só entra em acertos críticos
        soComFacilidade: new BooleanField({ initial: false }),           // o dano extra só entra se o ataque saiu com Facilidade (ex.: Euforia)
        danoExtraDadoPorRank: new BooleanField({ initial: false }),      // o "dano extra" (dado) sobe com o rank: 1d10, 2d10, 3d10 (ex.: Euforia)
        semCusto: new BooleanField({ initial: false }),                  // o ataque sai sem custo (ex.: Gatilho Rápido)
        alvoMarcadoPorMimNome: new StringField({ initial: "" }),         // só se o alvo tiver uma Condição SUA com este nome (ex.: Marca do Caçador)
        ignoraBloqueio: new BooleanField({ initial: false }),            // o alvo não pode Bloquear (ex.: Mira Afiada)
        alcanceExtra: new StringField({ initial: "" }),                  // + metros de alcance (× rank se marcado)
        morteInstantanea20: new BooleanField({ initial: false }),        // 20 natural mata alvo com menos Vida que você (Tiro Mortal)
        danoVerdadeiroExtra: new StringField({ initial: "" }),           // + dano VERDADEIRO (fórmula, aceita @vb/@categoria) - Golpe Penetrante (monstros)
        danoNoErro: new StringField({ initial: "" }),                    // "Dano no erro" em todo ataque que ainda não tenha um (fórmula) - Golpe Tenaz (monstros)
        danoMaximoSeAlvoCondicaoNome: new StringField({ initial: "" }),  // dano máximo só se o alvo (1) tiver uma Condição com este nome (ex.: Caído) - Pisoteador
        acertoExtraFormula: new StringField({ initial: "" }),            // + fórmula livre no teste de ataque (aceita @aliados_6m, @vb...) - Táticas de Bando
        soAcaoNomeContem: new StringField({ initial: "" }),              // só em Ações/itens cujo nome contém este texto (ex.: "Ataque em Bando") - Massa Crítica
        soSeFormula: new StringField({ initial: "" }),                   // só quando a fórmula der verdadeiro (ex.: "@aliados_6m>=2") - Massa Crítica
        curarMetade: new BooleanField({ initial: false })                // 0.94.24: quem ataca recupera a metade do dado extra se acertar (Dreno)
      })),
      // Fase 7: reduz o custo de Estamina de certas Ações enquanto ativo
      // (ex.: Forma Sábio dos Matos - magias de cura custam 1 a menos).
      reduzCustoEstamina: new ArrayField(new SchemaField({
        soCategoriaArma: new StringField({ initial: "" }), // só ataques com armas desta categoria (ex.: Pesada)
        quantidade: new StringField({ initial: "1" }),
        tipoItem: new StringField({ initial: "" }),        // "" | habilidade | magia | arma
        soCura: new BooleanField({ initial: false }),      // só Ações que curam
        minimo: new StringField({ initial: "0" })          // o custo nunca fica abaixo disso
      ,
        soItemNome: new StringField({ initial: "" })})),
      // Fase 6 (Rc): enquanto ativo, paga um custo com outro recurso.
      // Ex.: Escrituras Sagradas - custo de Mana das magias pago com Vida.
      pagarCustoCom: new ArrayField(new SchemaField({
        custo: new StringField({ initial: "mana" }),        // mana | estamina
        recurso: new StringField({ initial: "vida" }),      // vida | mana | estaminaCombate | id de Recurso Customizado
        tipoItem: new StringField({ initial: "" }),         // "" (qualquer) | magia | habilidade | arma
        multiplicador: new StringField({ initial: "1" })    // quanto do recurso por ponto de custo
      })),
      // Fase 6 (P): enquanto no ator, muda o máximo de um grupo exclusivo.
      limitesDeGrupo: new ArrayField(new SchemaField({
        grupo: new StringField({ initial: "" }),
        maximo: new NumberField({ initial: 2, min: 1, integer: true }),
        maximoIgualAoRank: new BooleanField({ initial: false }) // ex.: Força da Natureza: 1/2/3 escolhas juntas nos ranks 1/2/3
      })),
      grupoExclusivo: new StringField({ initial: "" }),
      grupoMaximo: new NumberField({ initial: 1, min: 1, integer: true }),
      // Fase 5: soma à rolagem de ataque de quem ataca este personagem, antes
      // de comparar com a Defesa (ex.: "-1d10" - Olhar Culposo). Aceita @rank
      // e tokens do dono. Aparece no card do ataque.
      ataqueRecebidoFormula: new StringField({ initial: "" }),
      ataqueRecebidoSoOrigem: new StringField({ initial: "" }), // "" qualquer | magia | arma | corpoACorpo | distancia - filtro do ajuste acima (Pele Antimágica)
      // Fase 4: reações a eventos enquanto este item estiver no ator.
      usaGatilhos: new BooleanField({ initial: false }),
      // Imunidade a Condições (Criador de Monstros, M08): enquanto este item estiver ativo, o dono
      // nunca recebe estas Condições (UUID do compêndio, "self:Nome" ou o nome). A tentativa é
      // registrada no card ("imune a X").
      imunidadesCondicoes: new ArrayField(new StringField()),
      imuneMovimentoForcado: new BooleanField({ initial: false }), // 0.94.2: não pode ser empurrado/puxado contra a vontade
      movimentoSemPrioridadeMetros: new StringField({ initial: "" }), // Fase 4 (M02): metros por turno que não geram Prioridade ao chegar perto (aceita @rank, @categoria, @nivel; 99 = qualquer distância)
      dividirDanoPercentual: new NumberField({ initial: 0, min: 0, max: 100 }), // Fase 6 (M14): % do dano de ataque que sofro passa para quem tem a Condição abaixo, aplicada por mim
      dividirDanoCondicaoUuid: new StringField({ initial: "" }),
      gatilhos: new ArrayField(new SchemaField(campoGatilho())),
      descricao: new HTMLField({ initial: "" }),
      mostrarDescricao: new BooleanField({ initial: false }),
      // Não envia a descrição no card de uso (exceção à configuração do mundo).
      ocultarDescricaoNoChat: new BooleanField({ initial: false }),
      // Indicador do livro: "PI" (gera Prioridade para inimigo), "PA" (para
      // aliado), "NP" (não gera), "" (não informado). Cada Ação pode sobrescrever.
      prioridadeIndicador: new StringField({ initial: "" }),
      ativo: new BooleanField({ initial: true }),
      // "classe"|"subclasse"|"" - mesmo campo/mesmo propósito de
      // NaurenHabilidadeData/NaurenMagiaData (ver naurenGarantirEfeitoDe*
      // mais abaixo no arquivo): mostra a origem na lista de Efeitos da
      // ficha, pra um jogador olhando a aba Efeitos saber que "Guarda
      // Defensiva" veio da Classe e "Oásis Verdejante" veio de um nó de
      // Subclasse, sem precisar abrir cada item.
      origem: new StringField({ initial: "" }),
      // Custo pra ATIVAR este Efeito (ex: Guardas, Guerreiro - "Ativa (1
      // Estamina)") - 0 (padrão) = ativa livremente, sem popup nenhum,
      // igual sempre foi. > 0: ao marcar "Ativo" (nunca ao desmarcar),
      // mostra um popup perguntando se quer pagar esse custo em Estamina
      // (reconhece a troca por Espírito da Batalha, se o Ator for
      // Guerreiro) ou ativar sem pagar nada - ver
      // NaurenActorSheet#onItemToggleAtivo.
      custoParaAtivarEstamina: new NumberField({ initial: 0, min: 0, integer: true }),
      ataqueDado: new StringField({ initial: "" }),
      // Lista dinâmica: cada linha escolhe QUAL campo afeta (Ataque, Defesa,
      // um Atributo, etc.) e com que valor - ver campoModificador(). Só
      // aparece na ficha o que este Efeito realmente usa, em vez de uma
      // grade fixa com os 18 campos possíveis sempre visíveis.
      modificadores: new ArrayField(new SchemaField(campoModificador())),
      // Acúmulos (mesmo mecanismo de Condição): um Efeito acumulável pode
      // empilhar múltiplas aplicações, escalando automaticamente qualquer
      // Modificador que SOME (não os que travam) por acúmulo, e ficando
      // disponível como "@acumulos" em qualquer fórmula deste Efeito.
      acumulativel: new BooleanField({ initial: false }),
      acumulos: new NumberField({ initial: 1, min: 1, integer: true }),
      acumulosMax: new NumberField({ initial: 99, min: 1, integer: true }),
      // Bônus/dado extra somado em QUALQUER rolagem de dano ou cura que o
      // personagem fizer (arma, magia ou habilidade), enquanto o efeito
      // estiver ativo. O dado extra participa da dobra em acerto crítico
      // junto com o resto da fórmula de dano.
      danoBonus: new NumberField({ initial: 0, integer: true }),
      danoDado: new StringField({ initial: "" }),
      curaBonus: new NumberField({ initial: 0, integer: true }),
      curaDado: new StringField({ initial: "" }),
      // Emanação (ex: uma magia que cria uma aura persistente ao redor de
      // quem a conjurou): enquanto este Efeito estiver ATIVO, no evento de
      // turno/rodada escolhido, aplica dano/estresse/perda de Estamina em
      // todo mundo a até um raio do MEU token. Ative/desative manualmente
      // (junto do "Efeito ativo" da ficha) quando a magia entrar/sair de
      // vigor - a distância é sempre recalculada a partir da posição ATUAL
      // do token, então acompanha o personagem automaticamente.
      usaEmanacao: new BooleanField({ initial: false }),
      emanacaoEvento: new StringField({ initial: "inicioTurno" }), // inicioTurno|fimTurno|inicioRodada|fimRodada
      emanacaoRaio: new StringField({ initial: "3" }),
      emanacaoDisposicao: new StringField({ initial: "inimigos" }), // aliados|inimigos|todos|todosComVoce
      emanacaoEfeito: new StringField({ initial: "dano" }), // dano|cura|estresse|estamina|condicao
      emanacaoQuantidade: new StringField({ initial: "1d4" }),
      // Cor da área no mapa - vazio usa a cor que o próprio jogador
      // escolheu no Foundry (Configurações > Minha Cor de Usuário).
      emanacaoCor: new StringField({ initial: "" }),
      // Mesma ideia de "templateInvisivel": a Emanação continua seguindo o
      // token e aplicando efeitos normalmente, mas fica invisível durante o
      // jogo (só aparece na camada de Regiões). "visibility" e
      // "attachToToken" são independentes no Foundry, então esconder a
      // área NÃO quebra o acompanhamento do token.
      emanacaoInvisivel: new BooleanField({ initial: false }),
      // Só usados quando "emanacaoEfeito" é "condicao" - aplica a
      // Condição/Efeito escolhido em cada alvo atingido, somando os
      // acúmulos indicados (1 se não for acumulável).
      emanacaoCondicaoUuid: new StringField({ initial: "" }),
      emanacaoCondicaoAcumulos: new StringField({ initial: "1" }),
      // Bônus Condicional ao Alvo (ver campoBonusCondicionalAoAlvo) -
      // mesma ideia de NaurenHabilidadeData, mas aqui só conta ENQUANTO
      // este Efeito estiver "ativo" - ver "Escolher Efeito ao Usar" em
      // campoAcao, que ativa/desativa Efeitos como este ao usar uma
      // Ação (ex: Marca do Caçador escolhendo entre Foco Mortal, Tiro
      // Letal ou Reflexos de Caça).
      bonusCondicionalAoAlvo: new ArrayField(new SchemaField(campoBonusCondicionalAoAlvo())),
      // Rank deste Efeito (mesmo mecanismo de Habilidade/Arma/Magia) -
      // disponível como "@rank" em qualquer modificador acima (ex:
      // "+@rank*2"), além da tabela "Por Rank" própria de cada linha.
      rankAtual: new NumberField({ initial: 0, min: 0, integer: true }),
      rankMax: new NumberField({ initial: 1, min: 0, integer: true }),
      // ===== MODIFICADOR EXTERNO (Subclasse) ===== (ver
      // campoModificadorExterno() acima) - desligado por padrão, a
      // imensa maioria dos Efeitos (bônus fixo de atributo) não usa nada
      // disto. Só liga quando este Efeito existe especificamente PRA
      // ajustar como outra Ação/Habilidade se comporta (ex: Oásis
      // Verdejante, Druida - liga template persistente numa Habilidade de
      // Classe que originalmente não tinha).
      modificaOutroItem: new BooleanField({ initial: false }),
      modificadoresExternos: new ArrayField(new SchemaField(campoModificadorExterno())),
      // ===== GATILHO EXTERNO DE TEMPLATE PERSISTENTE (Subclasse) =====
      // Diferente de "modificadoresExternos" (edita UM campo do item
      // alvo): aqui não edita nada no item alvo - enquanto este Efeito
      // estiver ativo, some um EVENTO/EFEITO A MAIS na Região que a Ação
      // do item alvo colocar no mapa, com seu PRÓPRIO evento (pode ser
      // diferente do evento "principal" configurado na própria Ação -
      // ex: Jardim das Flores Silvestres já usa "inicioRodada" pra
      // renovar a Defesa; Bênção dos Cristais precisa de "inicioTurno" -
      // já que TURNO é diferente de RODADA, uma rodada tem os turnos de
      // todo mundo - então precisa ser um gatilho A PARTE, não pode
      // reaproveitar o mesmo slot). Ver
      // naurenColetarGatilhosTemplatePersistenteExternos, chamado tanto
      // no tick periódico (naurenProcessarTemplatesPersistentes) quanto
      // no "Ao Entrar" (Hooks updateToken).
      usaGatilhoTemplatePersistente: new BooleanField({ initial: false }),
      gatilhosTemplatePersistente: new ArrayField(new SchemaField({
        itemAlvoUuid: new StringField({ initial: "" }),
        // "aoEntrar" dispara quando um token entra na área (mesma regra
        // de "só ativa se SE MOVER pra dentro" do mecanismo original) -
        // os outros 4 disparam no evento de combate escolhido, em TODO
        // turno/rodada enquanto a Região existir.
        evento: new StringField({ initial: "inicioTurno" }), // inicioTurno|fimTurno|inicioRodada|fimRodada|aoEntrar
        disposicao: new StringField({ initial: "aliados" }), // aliados|inimigos|todos
        efeito: new StringField({ initial: "" }), // ""|dano|cura|estresse|reduzEstresse|estamina|restauraEstamina
        quantidade: new StringField({ initial: "1" }),
        condicaoUuid: new StringField({ initial: "" }),
        condicaoAcumulos: new StringField({ initial: "1" })
      })),
      // ===== TRANSFORMAÇÃO DE TOKEN ===== (mesmo mecanismo de Condição -
      // ver NaurenCondicaoData#usaTransformacao)
      usaTransformacao: new BooleanField({ initial: false }),
      transformacaoImagem: new StringField({ initial: "" }),
      transformacaoTamanho: new StringField({ initial: "" })
    };
  }
}

/**
 * PECULIARIDADE - "raça" de Nauren em forma de Benefícios e Fardos que
 * o jogador escolhe na criação (arrastando o par direto de um
 * compêndio): escolhe um Benefício, rola pra ver qual Fardo recebe (ou
 * o inverso) - sempre em par, pode ter vários pares. A maioria dos
 * pares é só um Efeito Vinculado simples (reaproveita "modificadores",
 * igual Efeito/Condição) - os poucos mecanismos especiais (Escolha de
 * Atributo, Gatilho automático, Conceder Item companheiro) cobrem os
 * casos que um modificador simples não alcança.
 */
class NaurenPeculiaridadeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: new HTMLField({ initial: "" }),
      mostrarDescricao: new BooleanField({ initial: true }),
      // Não envia a descrição no card de uso (exceção à configuração do mundo).
      ocultarDescricaoNoChat: new BooleanField({ initial: false }),
      // Indicador do livro: "PI" (gera Prioridade para inimigo), "PA" (para
      // aliado), "NP" (não gera), "" (não informado). Cada Ação pode sobrescrever.
      prioridadeIndicador: new StringField({ initial: "" }),
      ativo: new BooleanField({ initial: true }),
      // "beneficio"|"fardo" - só organiza visualmente na aba (grupo
      // separado) e no compêndio, não muda nenhum comportamento mecânico.
      tipo: new StringField({ initial: "beneficio" }),
      // Nome do par ligado (ex: Fardo "Traumatizado" preenche isto com
      // "Sortudo", se foi o Benefício sorteado junto) - só informativo,
      // pra lembrar qual veio com qual; não precisa ser um uuid exato.
      parNome: new StringField({ initial: "" }),
      // Efeito Vinculado simples - cobre a maioria dos pares (Forte,
      // Ágil, Sábio, Resiliente, Pelo Grossa, Fôlego Curto, Peito
      // Estufado, Ligeiro, Braço Forte, Casco Duro, Reflexos Rápidos,
      // Casca Grossa e os Fardos equivalentes) - mesmo mecanismo de
      // Efeito/Condição.
      modificadores: new ArrayField(new SchemaField(campoModificador())),
      // ===== ESCOLHA DE ATRIBUTO (ex: "Desafortunado": -1 num atributo
      // à escolha do jogador) - liga isto e deixa "atributoEscolhido"
      // vazio; o jogador preenche na própria ficha do item depois de
      // arrastar pra ficha dele. Sem isso ligado, use "modificadores"
      // normal (que já trava um atributo fixo).
      usaEscolhaAtributo: new BooleanField({ initial: false }),
      atributoEscolhido: new StringField({ initial: "" }), // forca|agilidade|estamina|inteligencia|destino
      escolhaAtributoValor: new StringField({ initial: "-1" }),
      // ===== GATILHO AUTOMÁTICO (ex: "Ferida Antiga": sempre que sofre
      // dano, sofre 1 de dano extra) - mesmo mecanismo de Habilidade
      // (ver campoGatilho()), reaproveitado aqui.
      usaGatilhos: new BooleanField({ initial: false }),
      // Imunidade a Condições (Criador de Monstros, M08): enquanto este item estiver ativo, o dono
      // nunca recebe estas Condições (UUID do compêndio, "self:Nome" ou o nome). A tentativa é
      // registrada no card ("imune a X").
      imunidadesCondicoes: new ArrayField(new StringField()),
      imuneMovimentoForcado: new BooleanField({ initial: false }), // 0.94.2: não pode ser empurrado/puxado contra a vontade
      movimentoSemPrioridadeMetros: new StringField({ initial: "" }), // Fase 4 (M02): metros por turno que não geram Prioridade ao chegar perto (aceita @rank, @categoria, @nivel; 99 = qualquer distância)
      dividirDanoPercentual: new NumberField({ initial: 0, min: 0, max: 100 }), // Fase 6 (M14): % do dano de ataque que sofro passa para quem tem a Condição abaixo, aplicada por mim
      dividirDanoCondicaoUuid: new StringField({ initial: "" }),
      gatilhos: new ArrayField(new SchemaField(campoGatilho())),
      // ===== CONCEDER ITEM COMPANHEIRO (ex: "Feroz": ganha uma Arma
      // "Garras/Presas" já configurada, 1d6+Pda, 1m de alcance, junto
      // desta Peculiaridade) - concedido uma vez, na mesma hora em que
      // esta Peculiaridade é adicionada à ficha (ver
      // NaurenConcessaoHelper, mesmo mecanismo de nível de Classe).
      usaConcederItem: new BooleanField({ initial: false }),
      bonusTesteVisao: new StringField({ initial: "" }), // dado somado em testes de visão, como o estudo do Ladino (ex.: "1d4" - Olhar)
      concederItemUuid: new StringField({ initial: "" })
    };
  }
}

/**
 * Pigmento (Cor): igual um Efeito nos 15 campos de bônus fixo (Ataque,
 * Defesa, Movimento, os 5 Atributos, os 4 Meta-atributos, Vida/Mana/
 * Estresse), mas conceitualmente diferente - representa a identidade
 * permanente do personagem (a cor que ele carrega), não um buff temporário.
 * Por isso NÃO tem dado de dano/cura (os pigmentos do manual são só bônus
 * fixos) e tem sua própria identidade visual (corHex vira o ícone circular
 * na ficha, em vez de imagem enviada). Também tem a regra especial do
 * Pigmento Roxo: um bônus extra que sempre recai sobre QUALQUER que seja o
 * atributo mais baixo no momento (recalculado a cada render, nunca travado
 * num atributo fixo).
 */
class NaurenCorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: new HTMLField({ initial: "" }),
      mostrarDescricao: new BooleanField({ initial: false }),
      // Não envia a descrição no card de uso (exceção à configuração do mundo).
      ocultarDescricaoNoChat: new BooleanField({ initial: false }),
      // Indicador do livro: "PI" (gera Prioridade para inimigo), "PA" (para
      // aliado), "NP" (não gera), "" (não informado). Cada Ação pode sobrescrever.
      prioridadeIndicador: new StringField({ initial: "" }),
      ativo: new BooleanField({ initial: true }),
      corHex: new StringField({ initial: "#724da1" }),
      ataque: new StringField({ initial: "" }),
      defesa: new StringField({ initial: "" }),
      bloqueio: new StringField({ initial: "" }),
      esquiva: new StringField({ initial: "" }),
      pontosSubclasse: new StringField({ initial: "" }),
      movimento: new StringField({ initial: "" }),
      forca: new StringField({ initial: "" }),
      agilidade: new StringField({ initial: "" }),
      estamina: new StringField({ initial: "" }),
      inteligencia: new StringField({ initial: "" }),
      destino: new StringField({ initial: "" }),
      espirito: new StringField({ initial: "" }),
      poderAtaque: new StringField({ initial: "" }),
      poderMagia: new StringField({ initial: "" }),
      vitalidade: new StringField({ initial: "" }),
      vida: new StringField({ initial: "" }),
      mana: new StringField({ initial: "" }),
      estresse: new StringField({ initial: "" }),
      bonusMenorAtributo: new BooleanField({ initial: false }),
      bonusMenorAtributoValor: new NumberField({ initial: 0, integer: true }),
      // Rank deste Pigmento (mesmo mecanismo de Efeito/Habilidade/Arma/
      // Magia) - disponível como "@rank" em qualquer um dos campos de
      // bônus acima, pra um Pigmento raro/lapidado crescer sozinho.
      rankAtual: new NumberField({ initial: 0, min: 0, integer: true }),
      rankMax: new NumberField({ initial: 1, min: 0, integer: true })
    };
  }
}

/**
 * Condição: como um Efeito nos 15 campos de bônus/penalidade, mas cobrindo
 * os dois padrões especiais do manual (Capítulo V):
 * - Acumulável (E/C): Alvejado, Envenenamento, Sangramento, Fragmentado,
 *   Queimando, Congelando, Lerdeza... Cada campo de bônus vale por acúmulo
 *   (Fragmentado 3 = -3 Defesa). "acumulos" guarda quantos o alvo tem agora.
 * - Evolutiva (E): Amedrontado -> Pânico -> Pavor / Atordoado -> Desacordado.
 *   Receber de novo uma condição evolutiva já presente TROCA pela próxima da
 *   cadeia (proximaEvolucaoUuid) em vez de empilhar.
 * - Efeitos Periódicos: uma lista (Dano/Cura/Estamina/Mana), cada um podendo
 *   aumentar por acúmulo e disparar por RODADA (padrão) ou por TURNO do
 *   personagem (Hemorragia é a exceção clássica que dispara por turno).
 * Uma condição no inventário do ator soma suas penalidades no MESMO motor
 * seguro dos Efeitos (recalculado do zero, nunca muta o campo base).
 */
class NaurenCondicaoData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      luzVisao: campoLuzVisao(), // 0.99: luz e visão do item no token
      custoEstaminaExtraAcoes: new NumberField({ initial: 0, min: 0, integer: true }), // Amedrontado/Pânico/Pavor: +N de Estamina em ações e movimentos
      vooCusto: new StringField({ initial: "" }), // "" | estamina | mana - manter o voo custa 1 por turno
      // 0.94.16: aparência do token enquanto a Condição durar (Sequencer Motion) - ver NAUREN_MOTION_CONDICAO_OPCOES.
      motion: new StringField({ initial: "auto" }),
      motionCor: new StringField({ initial: "#ffffff" }),
      molduraCor: new StringField({ initial: "" }),
      // 0.105: onde o ícone desta Condição aparece: "sempre" (token, HUD e ficha) ou "ficha" (só na ficha; útil para Condições só de aparência)
      iconeVisivel: new StringField({ initial: "sempre", choices: ["sempre", "ficha"] }), // 0.103: enquanto a Condição durar, a aura da moldura do token fica nesta cor ("" = não muda)
      pagarMovimentoCom: new ArrayField(new SchemaField({ recurso: new StringField({ initial: "mana" }), quantidade: new StringField({ initial: "1" }) })),
      proximaAcaoEscolherAcertoOuDano: new BooleanField({ initial: false }), // o bônus de dano pode ir para o acerto: pergunta ao usar (ex.: Poesia Lunar)
      danoRecebidoPercentual: new NumberField({ initial: 0, min: 0, max: 100, integer: true }), // reduz o dano recebido em % (ex.: Instinto de Sobrevivência: 50)
      ehVeneno: new BooleanField({ initial: false }), // é um veneno (Ingrediente Ofídico, Veneno Potencializado reconhecem por aqui)
      capacidades: new ArrayField(new StringField()), // capacidades especiais marcadas na ficha (ver NAUREN_CAPACIDADES)
      // Ajusta o custo de Mana das SUAS magias (ex.: Combustão −1 × rank nas de dano,
      // mínimo 1; Buraco de Minhoca −1 × rank no Salto Etéreo; Empoderamento +1).
      ajusteCustoMana: new ArrayField(new SchemaField({
        valor: new StringField({ initial: "-1" }),
        multiplicarPeloRank: new BooleanField({ initial: false }),
        soMagiaComDano: new BooleanField({ initial: false }),
        soItemNome: new StringField({ initial: "" }),
        minimo: new StringField({ initial: "0" })
      })),
      // Fase 7: efeito passivo nos SEUS ataques que batem com o filtro
      // (ex.: Golpe Decisivo - pesados e especiais causam Fragmentado).
      efeitosEmAtaques: new ArrayField(new SchemaField({
        ativo: new BooleanField({ initial: true }),
        tipoAtaque: new StringField({ initial: "pesadoOuEspecial" }), // qualquer | pesado | especial | pesadoOuEspecial | basico | especialComArma (habilidade em que se escolhe a arma)
        tipoArma: new StringField({ initial: "" }),                    // "" = qualquer
        condicaoUuid: new StringField({ initial: "" }),
        acumulos: new StringField({ initial: "1" }),
        multiplicarPeloRank: new BooleanField({ initial: false }),
        danoExtraDado: new StringField({ initial: "" }),               // ex.: 1d6
        multiplicarPorInformacoes: new BooleanField({ initial: false }), // × suas informações (estudos) sobre o alvo
        criticoPorInformacao: new BooleanField({ initial: false }),      // crítico 1 mais fácil por informação
        danoMaximo: new BooleanField({ initial: false }),                // o dano da arma sai no máximo (ex.: Lâmina Corrupta)
        soPrimeiroAtaque: new BooleanField({ initial: false }),          // só no seu 1º ataque contra cada alvo (zera no fim do combate)
        soPrimeiroAtaqueTurno: new BooleanField({ initial: false }),     // só no seu 1º ataque de cada turno (ex.: Esgrima da Chuva)
        soComEstadoNome: new StringField({ initial: "" }),               // só enquanto você estiver num estado com este nome (ex.: Profusão)
        soComBeneficioMarca: new StringField({ initial: "" }),           // Marca do Caçador: só se a SUA marca no alvo tiver este benefício
        perguntarEstresse: new BooleanField({ initial: false }),         // pergunta "pagar 1 Estresse?" (Ímpeto Frenético, Destruição Mútua)
        dadosExtrasDaArma: new StringField({ initial: "" }),             // + N dados do mesmo tamanho do maior dado do ataque (Fogo Divino)
        criticoMaisFacil: new StringField({ initial: "" }),              // crítico N mais fácil (Fogo Divino)
        acertoExtraDado: new StringField({ initial: "" }),               // + dado no teste de ataque (ex.: 1d6)
        escalarDadoCasas: new StringField({ initial: "" }),              // escala o dado da arma N casas (aceita @rank; ex.: Disparo Carregado)
        empurrarMetros: new StringField({ initial: "" }),                // o acerto empurra o alvo N metros (aceita @rank; ex.: Rastro do Vendaval)
        empurrarColisaoDano: new StringField({ initial: "" }),           // dano extra se colidir ao ser empurrado (ex.: @dadoDano)
        soEmPrioridadeRoubada: new BooleanField({ initial: false }),     // só em ataques feitos numa Prioridade que você roubou
        danoExtraFixoPor: new StringField({ initial: "" }),              // "" | estresseAliados | prioridadesGeradas | informacoes
        danoExtraFixoValor: new StringField({ initial: "1" }),           // quanto por unidade (× rank se marcado)
        soNoCritico: new BooleanField({ initial: false }),               // o dano extra só entra em acertos críticos
        soComFacilidade: new BooleanField({ initial: false }),           // o dano extra só entra se o ataque saiu com Facilidade (ex.: Euforia)
        danoExtraDadoPorRank: new BooleanField({ initial: false }),      // o "dano extra" (dado) sobe com o rank: 1d10, 2d10, 3d10 (ex.: Euforia)
        semCusto: new BooleanField({ initial: false }),                  // o ataque sai sem custo (ex.: Gatilho Rápido)
        alvoMarcadoPorMimNome: new StringField({ initial: "" }),         // só se o alvo tiver uma Condição SUA com este nome (ex.: Marca do Caçador)
        ignoraBloqueio: new BooleanField({ initial: false }),            // o alvo não pode Bloquear (ex.: Mira Afiada)
        alcanceExtra: new StringField({ initial: "" }),                  // + metros de alcance (× rank se marcado)
        morteInstantanea20: new BooleanField({ initial: false }),        // 20 natural mata alvo com menos Vida que você (Tiro Mortal)
        danoVerdadeiroExtra: new StringField({ initial: "" }),           // + dano VERDADEIRO (fórmula, aceita @vb/@categoria) - Golpe Penetrante (monstros)
        danoNoErro: new StringField({ initial: "" }),                    // "Dano no erro" em todo ataque que ainda não tenha um (fórmula) - Golpe Tenaz (monstros)
        danoMaximoSeAlvoCondicaoNome: new StringField({ initial: "" }),  // dano máximo só se o alvo (1) tiver uma Condição com este nome (ex.: Caído) - Pisoteador
        acertoExtraFormula: new StringField({ initial: "" }),            // + fórmula livre no teste de ataque (aceita @aliados_6m, @vb...) - Táticas de Bando
        soAcaoNomeContem: new StringField({ initial: "" }),              // só em Ações/itens cujo nome contém este texto (ex.: "Ataque em Bando") - Massa Crítica
        soSeFormula: new StringField({ initial: "" }),                   // só quando a fórmula der verdadeiro (ex.: "@aliados_6m>=2") - Massa Crítica
        curarMetade: new BooleanField({ initial: false })                // 0.94.24: quem ataca recupera a metade do dado extra se acertar (Dreno)
      })),
      // Fase 7: reduz o custo de Estamina de certas Ações enquanto ativo
      // (ex.: Forma Sábio dos Matos - magias de cura custam 1 a menos).
      reduzCustoEstamina: new ArrayField(new SchemaField({
        soCategoriaArma: new StringField({ initial: "" }), // só ataques com armas desta categoria (ex.: Pesada)
        quantidade: new StringField({ initial: "1" }),
        tipoItem: new StringField({ initial: "" }),        // "" | habilidade | magia | arma
        soCura: new BooleanField({ initial: false }),      // só Ações que curam
        minimo: new StringField({ initial: "0" })          // o custo nunca fica abaixo disso
      ,
        soItemNome: new StringField({ initial: "" })})),
      // Fase 6 (Rc): enquanto ativo, paga um custo com outro recurso.
      // Ex.: Escrituras Sagradas - custo de Mana das magias pago com Vida.
      pagarCustoCom: new ArrayField(new SchemaField({
        custo: new StringField({ initial: "mana" }),        // mana | estamina
        recurso: new StringField({ initial: "vida" }),      // vida | mana | estaminaCombate | id de Recurso Customizado
        tipoItem: new StringField({ initial: "" }),         // "" (qualquer) | magia | habilidade | arma
        multiplicador: new StringField({ initial: "1" })    // quanto do recurso por ponto de custo
      })),
      // Fase 6 (P): estados exclusivos. Condições (e Efeitos) do mesmo grupo
      // não coexistem além do máximo (padrão 1): a mais antiga sai.
      // Ex.: "forma-druida", "guarda", "profusao", "juramento".
      grupoExclusivo: new StringField({ initial: "" }),
      grupoMaximo: new NumberField({ initial: 1, min: 1, integer: true }),
      // Restrições enquanto ativa (ex.: Juramentos): somem do popup de reação.
      proibeBloqueio: new BooleanField({ initial: false }),
      proibeEsquiva: new BooleanField({ initial: false }),
      // Fase 6 (N): buff de próxima ação. Consome acúmulos quando uma Ação
      // que passa nos filtros é usada; enquanto ativa, os modificadores
      // normais da Condição também valem.
      usaProximaAcao: new BooleanField({ initial: false }),
      proximaAcaoTipoItem: new StringField({ initial: "" }),     // "" | habilidade | magia | arma
      proximaAcaoApenasAtaque: new BooleanField({ initial: false }),
      proximaAcaoTipoAtaque: new StringField({ initial: "" }),
      proximaAcaoSoContraAlvoGravado: new BooleanField({ initial: false }), // só contra o alvo gravado na Condição (ex.: Gatilho Rápido) // "" = qualquer | basico | pesado | especial | pesadoOuEspecial (ex.: Gatilho Rápido: só básico)
      proximaAcaoNomeContem: new StringField({ initial: "" }),
      proximaAcaoConsumir: new NumberField({ initial: 1, min: 0, integer: true }),
      proximaAcaoFacilidade: new BooleanField({ initial: false }),
      proximaAcaoDanoMaximo: new BooleanField({ initial: false }),
      proximaAcaoSoComDano: new BooleanField({ initial: false }),        // só vale (e só é gasta) numa Ação que cause dano (ex.: Arte Divina)
      proximaAcaoSemCusto: new BooleanField({ initial: false }),
      proximaAcaoReducaoEstamina: new StringField({ initial: "" }),
      proximaAcaoReducaoMana: new StringField({ initial: "" }),          // o próximo uso custa X de Mana a menos
      proximaAcaoReducaoManaMinimo: new NumberField({ initial: 0, min: 0, integer: true }), // ...sem ficar abaixo deste custo
      removerAoSofrerDano: new BooleanField({ initial: false }),         // a Condição some depois do próximo dano sofrido (após reduzi-lo)
      removerAoAtacar: new BooleanField({ initial: false }),             // a Condição some quando o portador faz um teste de ataque (ex.: Invisível, Fascinado)
      removerAoTestar: new BooleanField({ initial: false }),             // 0.94.1: some na próxima rolagem de d20 (teste ou ataque) do portador (ex.: Monóculo)
      removerAoConjurarMagia: new BooleanField({ initial: false }),      // a Condição some quando o portador conjura outra Magia (ex.: Invisível)
      imuneAoEvitar: new BooleanField({ initial: false }),               // quem evita esta Condição (pagando o custo) fica imune a ela pelo resto do combate
      // Fase 5 (M11): travas.
      travaAcoesMana: new BooleanField({ initial: false }),              // não pode usar Ações que custam Mana (ex.: Emudecido)
      travaAtaques: new BooleanField({ initial: false }),                // não pode fazer testes de ataque (ex.: forma fechada, névoa)
      travaHabilidades: new BooleanField({ initial: false }),            // não pode usar Habilidades nem Magias (ex.: Polimorfizado); Dar Prioridade continua
      proibeContraAtaque: new BooleanField({ initial: false }),          // não pode Contra-Atacar (ex.: Hesitante)
      contraAtaqueEmPrioridade: new BooleanField({ initial: false }),    // 1 Contra-Ataque por turno mesmo contra um ataque feito em Prioridade (ex.: Juramento da Honra)
      naoRecebePrioridade: new StringField({ initial: "" }),             // "" | "aliados" (de aliados) | "todos" (de ninguém)
      // Fase 4 (M05): a Condição lembra quem a aplicou (conjuradorUuid) e reage a ele.
      origemAfastaMetros: new NumberField({ initial: 0, min: 0 }),       // sai se quem aplicou ficar a mais de N m do portador (0 = não)
      origemCaiRemove: new BooleanField({ initial: false }),             // sai se quem aplicou cair (Vida 0) ou sumir da cena
      arrastarComOrigem: new BooleanField({ initial: false }),           // o portador é levado junto quando quem aplicou se move
      modificadoresExcetoOrigem: new BooleanField({ initial: false }),   // os modificadores (Facilidade/Dificuldade, ataque, dano) não valem contra quem aplicou (ex.: Provocado)
      periodicoCuraOrigem: new BooleanField({ initial: false }),         // o dano periódico desta Condição cura quem aplicou (ex.: Parasita Interno)
      proximaAcaoBonusAcerto: new StringField({ initial: "" }),
      proximaAcaoBonusDano: new StringField({ initial: "" }),
      proximaAcaoDanoVerdadeiro: new BooleanField({ initial: false }), // o bônus de dano é VERDADEIRO: nada o reduz (bloqueio, Estresse, reduções, Escudo)
      proximaAcaoSemPrioridade: new BooleanField({ initial: false }),
    proximaAcaoInformacoesDoConjurador: new BooleanField({ initial: false }), // + informações de quem aplicou sobre o alvo (Impiedoso)
    proximaAcaoItemNomeContem: new StringField({ initial: "" }),     // só vale em itens com estes nomes (vírgula) - ex.: "Ímpeto, Fadiga"
    proximaAcaoSoProjeto: new StringField({ initial: "" }),          // 0.94.3: só em itens criados por esta Habilidade de construção (ex.: "Arma de Inventor")
    proximaAcaoZerarRecurso: new StringField({ initial: "" }),       // ao ser gasto, zera este recurso customizado (ex.: adrenalina)
    proximaAcaoPrioridadeParaAliado: new BooleanField({ initial: false }), // Ataque Combinado: a Prioridade do ataque vai para um aliado
    unicaPorConjurador: new BooleanField({ initial: false }),   // quem aplica só mantém UMA desta (aplicar em outro alvo tira do anterior)
    salvaguardaVida: new BooleanField({ initial: false }),      // ao chegar a 0 de Vida, fica com 1 e a Condição sai (ex.: Costurar a Vida)
    destinoCustaEstresse: new BooleanField({ initial: false }), // usar Dado de Destino custa 1 Estresse a mais (ex.: Romper o Caminho)
    foraDeCena: new BooleanField({ initial: false }),           // some do mapa enquanto durar; ao acabar volta com Vida, Mana, Destino e Estresse restaurados e sem Condições (ex.: Arrebatamento)
    repeteMagiasDoPortador: new BooleanField({ initial: false }), // cada magia de Sacerdote do portador pode ser repetida de graça contra outro alvo (ex.: Anjo da Guarda)
    negativa: new StringField({ initial: "auto" }),            // auto | sim | nao - negativas custam 1 Estamina para remover
      // Bônus contra alvos com uma Condição, enquanto esta Condição estiver em você.
      bonusCondicionalAoAlvo: new ArrayField(new SchemaField(campoBonusCondicionalAoAlvo())),
      // Fase 5: soma à rolagem de ataque de quem ataca este personagem, antes
      // de comparar com a Defesa (ex.: "-1d10" - Olhar Culposo). Aceita @rank
      // e tokens do dono. Aparece no card do ataque.
      ataqueRecebidoFormula: new StringField({ initial: "" }),
      ataqueRecebidoSoOrigem: new StringField({ initial: "" }), // "" qualquer | magia | arma | corpoACorpo | distancia - filtro do ajuste acima (Pele Antimágica)
      // Fase 4: reações a eventos enquanto este item estiver no ator.
      usaGatilhos: new BooleanField({ initial: false }),
      // Imunidade a Condições (Criador de Monstros, M08): enquanto este item estiver ativo, o dono
      // nunca recebe estas Condições (UUID do compêndio, "self:Nome" ou o nome). A tentativa é
      // registrada no card ("imune a X").
      imunidadesCondicoes: new ArrayField(new StringField()),
      imuneMovimentoForcado: new BooleanField({ initial: false }), // 0.94.2: não pode ser empurrado/puxado contra a vontade
      movimentoSemPrioridadeMetros: new StringField({ initial: "" }), // Fase 4 (M02): metros por turno que não geram Prioridade ao chegar perto (aceita @rank, @categoria, @nivel; 99 = qualquer distância)
      dividirDanoPercentual: new NumberField({ initial: 0, min: 0, max: 100 }), // Fase 6 (M14): % do dano de ataque que sofro passa para quem tem a Condição abaixo, aplicada por mim
      dividirDanoCondicaoUuid: new StringField({ initial: "" }),
      gatilhos: new ArrayField(new SchemaField(campoGatilho())),
      descricao: new HTMLField({ initial: "" }),
      mostrarDescricao: new BooleanField({ initial: false }),
      // Não envia a descrição no card de uso (exceção à configuração do mundo).
      ocultarDescricaoNoChat: new BooleanField({ initial: false }),
      // Indicador do livro: "PI" (gera Prioridade para inimigo), "PA" (para
      // aliado), "NP" (não gera), "" (não informado). Cada Ação pode sobrescrever.
      prioridadeIndicador: new StringField({ initial: "" }),
      ativo: new BooleanField({ initial: true }),
      // Lista dinâmica: cada linha escolhe QUAL campo afeta (Ataque, Defesa,
      // um Atributo, etc.) e com que valor - ver campoModificador(). Se a
      // condição for acumulável, um modificador que SOMA (não os que
      // travam) vale por acúmulo (Fragmentado 3 linhas de "-1" em Defesa =
      // -3, contando os acúmulos do item, não linhas repetidas na lista).
      modificadores: new ArrayField(new SchemaField(campoModificador())),
      // Aumenta o teto de níveis de Crescimento (ver campoAcao >
      // crescimentoMaxNiveis) em quem tiver esta Condição/Efeito ativo,
      // em QUALQUER Ação com "Crescimento" ligado - não precisa saber
      // qual Magia vai ser usada de antemão (ex: Forma Arauto Lunar,
      // Druida - "Pode usar Crescimento duas vezes por magia" enquanto
      // durar). Fórmula (aceita "@rank" desta Condição); vazio = sem
      // bônus, comportamento de sempre. Somado direto ao teto base da
      // Ação sendo usada, não escreve nada nela - lido ao vivo a cada
      // execução (ver _executarAcao).
      crescimentoMaxNivelExtra: new StringField({ initial: "" }),
      acumulativel: new BooleanField({ initial: false }),
      acumulos: new NumberField({ initial: 1, min: 1, integer: true }),
      acumulosMax: new NumberField({ initial: 99, min: 1, integer: true }),
      // Custo pra REMOVER (clicando na lixeira, ou no "-" se acumulável) -
      // diferente de "evitar receber" (ver campoCondicaoAplicada, que é um
      // teste no momento da APLICAÇÃO). Este aqui é lido na hora que o
      // próprio jogador tenta se LIVRAR de uma condição que ele já tem,
      // mostrando um popup ("Gaste X de [recurso] pra perder a condição").
      // Recurso vazio ("") = remoção livre, como sempre foi (comportamento
      // padrão, sem popup nenhum). Preenchido AUTOMATICAMENTE pela cópia
      // aplicada no ator quando o valor vem configurado na Ação que
      // concedeu (ver campoCondicaoAplicada/aplicarCondicao) - editável
      // também direto aqui, pra Condições feitas/ajustadas à mão.
      custoParaRemoverRecurso: new StringField({ initial: "" }),
      custoParaRemoverQuantidade: new StringField({ initial: "1" }),
      // Ao ATINGIR este número de acúmulos (transição, não todo update),
      // dispara o Gatilho por Evento "condicaoAtingiuLimiar" em quem tem a
      // Condição - mesmo espírito de "Condição ao Atingir o Máximo" dos
      // Recursos Declarados, mas pra Condições acumuláveis. 0 = desativado.
      // Ex: "Ponto de Pintura" (Místico) dispara Estrela do Arco Íris ao
      // chegar em 5 acúmulos - qualquer Habilidade pode reagir com um
      // Gatilho "Condição Atingiu Limiar" + "Condição Necessária"
      // apontando pra esta mesma Condição.
      limiarParaGatilho: new NumberField({ initial: 0, min: 0, integer: true }),
      // Efeito Direto ao Atingir o Limiar (ex: Bomba Cronometrada,
      // Mago - "ao chegar em 10 acúmulos, explode causando 10d6 de
      // dano") - usa o MESMO "limiarParaGatilho" acima como ponto de
      // disparo (uma transição só, não tinha alcançado antes/agora
      // alcançou), mas em vez de depender de uma Habilidade externa
      // reagindo ao evento "condicaoAtingiuLimiar", aplica os efeitos
      // abaixo DIRETO no alvo que tem a Condição, e posta no chat -
      // sem hardcoded de qual Condição é, qualquer uma pode configurar
      // isto. Todos compostos livremente, sem exigir todos.
      limiarDanoFormula: new StringField({ initial: "" }),
      limiarCondicaoUuid: new StringField({ initial: "" }),
      limiarCondicaoAcumulos: new StringField({ initial: "1" }),
      // Aviso ao Atingir o Limiar (0.94): texto livre que vai num card quando a
      // Condição chega em "limiarParaGatilho" (ex.: Encantado - "quem aplicou
      // deixa de ser inimigo"). Serve pra efeitos narrativos que o Mestre
      // resolve; soma com dano/Condição acima se houver. "" = sem aviso.
      limiarAviso: new StringField({ initial: "" }),
      frascoMods: new ObjectField({ initial: {} }), // 0.94.1: ex.: Composto Refinado (próximo Frasco sem colateral), Cobaia Perfeita (maximizado)
      // 0.94.3: efeitos (vocabulário dos Frascos) ao sair no fim da cena, ao atingir o limiar e ao ser removida pagando.
      efeitosAoTerminar: new ArrayField(new ObjectField()),
      limiarEfeitos: new ArrayField(new ObjectField()),
      efeitosAoRemover: new ArrayField(new ObjectField()),
      acoesExtrasNaPrioridade: new NumberField({ initial: 0, min: 0, integer: true }), // G8
      // Remover esta Condição ao Atingir X Acúmulos - INDEPENDENTE de
      // "limiarParaGatilho" acima (não o mesmo número): permite
      // desacoplar completamente quando o dano/Condição dispara de
      // quando a própria Condição se remove, pra mais customização
      // (ex: uma Condição poderia causar dano a cada 5 acúmulos, mas
      // só se remover ao chegar em 10). 0 = nunca remove sozinha.
      limiarRemoverAcumulos: new NumberField({ initial: 0, min: 0, integer: true }),
      // Rank desta Condição (mesmo mecanismo de Efeito/Pigmento/Habilidade/
      // Arma/Magia) - disponível como "@rank" em qualquer modificador
      // acima, além da tabela "Por Rank" própria de cada linha. Independente
      // de "acumulos" (que já escala o bônus automaticamente por pilha) -
      // "rank" é um eixo à parte, útil quando o crescimento não é "por
      // pilha" mas por uma escolha/evolução manual.
      rankAtual: new NumberField({ initial: 0, min: 0, integer: true }),
      rankMax: new NumberField({ initial: 1, min: 0, integer: true }),
      evolutiva: new BooleanField({ initial: false }),
      proximaEvolucaoUuid: new StringField({ initial: "" }),
      // Evolução automática por LIMIAR de acúmulos (ex: Sangramento chega a 5
      // acúmulos -> vira Hemorragia sozinho), além da evolução clássica por
      // "receber de novo" já coberta acima. 0 = desligado (só evolui ao
      // receber de novo). Só faz sentido quando acumulativel + evolutiva.
      limiarAcumulos: new NumberField({ initial: 0, min: 0, integer: true }),
      // Duração automática: a condição TERMINA sozinha após N rodadas (ou N
      // turnos DO PRÓPRIO personagem, se duracaoPorTurno). 0 = permanente
      // (comportamento clássico, precisa remover manualmente). duracaoRestante é a
      // contagem regressiva ATUAL - reaplicar a condição (sem evoluir/
      // acumular) RENOVA a duração de volta ao máximo em vez de duplicar o item.
      duracaoRodadas: new NumberField({ initial: 0, min: 0, integer: true }),
      duracaoRestante: new NumberField({ initial: 0, min: 0, integer: true }),
      // Legado: true equivale a duracaoModo "turnosQualquer". Mantido só
      // pra ler Condições antigas - ver naurenModoDuracaoCondicao.
      duracaoPorTurno: new BooleanField({ initial: false }),
      // Como "duracaoRodadas" é contada (Relógio de Combate):
      //   "rodadas"         - N rodadas a partir do turno em que foi aplicada:
      //                       termina quando o turno de referência (âncora)
      //                       voltar N vezes. Imune a combatentes entrando/
      //                       saindo; se a âncora sair do combate, passa a
      //                       contar pela virada da rodada.
      //   "turnosPortador"  - N turnos de quem TEM a Condição.
      //   "turnosQualquer"  - N turnos de qualquer um.
      // "" = deriva de duracaoPorTurno (compatibilidade).
      duracaoModo: new StringField({ initial: "" }),
      // Âncora gravada ao aplicar (estado da instância, nunca do compêndio).
      duracaoAncoraCombatenteId: new StringField({ initial: "" }),
      duracaoAncoraCombateId: new StringField({ initial: "" }),
      // Posição da âncora na iniciativa e última rodada em que a duração
      // descontou - permitem continuar contando no mesmo ponto da ordem
      // se o combatente âncora sair do combate.
      duracaoAncoraIniciativa: new NumberField({ initial: null, nullable: true }),
      duracaoUltimaRodada: new NumberField({ initial: 0, integer: true }),
      // Efeitos periódicos (Sangramento, Queimando, Envenenamento, mas
      // também "tira 1 de Estamina por turno" etc.) - uma lista, cada
      // entrada dispara sozinha no início da RODADA ou do TURNO do
      // personagem (Hemorragia é a exceção que dispara por turno).
      efeitosPeriodicos: new ArrayField(new SchemaField({
        recurso: new StringField({ initial: "dano" }), // dano|cura|estamina|mana
        formula: new StringField({ initial: "1" }),
        aumentaPorAcumulo: new BooleanField({ initial: true }),
        // Legado: true equivale a quando "inicioTurnoQualquer".
        porTurno: new BooleanField({ initial: false }),
        // Momento em que dispara (Relógio de Combate) - ver
        // NAUREN_MOMENTOS_PERIODICOS. "" = deriva de porTurno.
        quando: new StringField({ initial: "" }),
        // Sempre rola no valor MÁXIMO do dado, ignorando o resultado
        // sorteado - mesma técnica de "Dano Máximo Condicional" das
        // Ações normais (Roll com {maximize:true}), só que aqui pro
        // efeito periódico da Condição. Ligado automaticamente pelo
        // "forcarMaximoEfeitoPeriodico" de uma Condição Aplicada (ver
        // campoCondicaoAplicada), nunca precisa marcar à mão pra isso -
        // mas também pode ser marcado direto aqui numa Condição feita
        // do zero, sem depender de nenhuma Ação.
        forcarMaximo: new BooleanField({ initial: false }),
        removerCondicaoApos: new BooleanField({ initial: false }), // depois de aplicar este efeito, a Condição sai (ex.: Envenenamento: dano e então os acúmulos são removidos)
        // Troca a fórmula a partir do rank indicado (mesmo mecanismo de
        // campoDanoBloco/campoCuraBloco) - usa "rankAtual" DESTA instância
        // de Condição, não do item que a concedeu. Só é útil quando algo
        // copia o rank do item concedente pra cá na hora de aplicar (ver
        // "copiarRankDoItem" em condicoesAplicadas) - sem isso, rankAtual
        // fica sempre 0 e porRank nunca entra em ação.
        porRank: new ArrayField(new SchemaField({
          rank: new NumberField({ initial: 1, min: 1, integer: true }),
          formula: new StringField({ initial: "" })
        }))
      })),
      // UUID do Token de quem CONCEDEU esta Condição (preenchido
      // automaticamente ao aplicar, ver NaurenAlvoHelper.aplicarCondicao)
      // - bug real corrigido: "efeitosPeriodicos.formula" com um token
      // do conjurador (ex: "1d4+@poderMagia" em Infusão Floral, Druida)
      // resolvia contra QUEM TEM a condição (o alvo curado/atingido),
      // não contra quem a lançou - um Guerreiro com Infusão Floral
      // aplicada por um Druida nunca deveria usar o PRÓPRIO Poder de
      // Magia (provavelmente 0) pra calcular a própria cura. Agora
      // naurenAplicarEfeitosPeriodicos busca este Ator (se ainda
      // existir) pra resolver "@token" na fórmula, com o alvo como
      // fallback se o conjurador não existir mais.
      conjuradorUuid: new StringField({ initial: "" }),
      // ===== TRANSFORMAÇÃO DE TOKEN =====
      // Enquanto esta Condição estiver ativa no alvo, troca a imagem (e
      // opcionalmente o tamanho) do TOKEN dele no mapa - útil pra
      // Polimorfia, formas de animal (Bestiário), ou qualquer "visual de
      // transformação" que uma Habilidade queira dar. Reverte sozinho
      // quando a Condição é removida (duração automática expirando,
      // clique na lixeira da ficha, ou desativando o toggle "Ativo") -
      // ver naurenAplicarTransformacaoToken/naurenReverterTransformacaoToken.
      usaTransformacao: new BooleanField({ initial: false }),
      transformacaoImagem: new StringField({ initial: "" }),
      // Tamanho em quadrados (ex: "2" = 2x2) - vazio mantém o tamanho atual do token.
      transformacaoTamanho: new StringField({ initial: "" }),
      // ===== CONCEDE ITEM COMPANHEIRO (mesmo mecanismo de
      // NaurenPeculiaridadeData - ver Hooks "createItem"/"deleteItem") -
      // enquanto esta CÓPIA da Condição existir no Ator (aplicada, ainda
      // não removida/expirada), o item apontado aqui fica concedido
      // junto - some sozinho quando a Condição sai, do mesmo jeito que a
      // Transformação de Token acima reverte sozinha. Pensado pra Formas
      // de Druida (Senhor da Floresta concede "Garras/Presas" enquanto
      // durar) e qualquer outra Condição temporária que devesse trazer
      // uma arma/habilidade junto, sem ficar "esquecida" na ficha depois
      // que a transformação acaba.
      usaConcederItem: new BooleanField({ initial: false }),
      concederItemUuid: new StringField({ initial: "" }),
      // Fase 6 (A): itens extras concedidos junto (removidos quando a Condição sai).
      concederItensUuids: new ArrayField(new StringField({ initial: "" })),
      // ===== TROCA DE ATRIBUTO DE ATAQUE OPCIONAL (ex: Profusão Retraída,
      // Empíreo - "pode usar Poder de Magia pra atacar com arma no lugar
      // de Poder de Ataque") - enquanto esta Condição estiver ativa em
      // quem vai atacar, o popup de pré-Ação de qualquer Ação de ataque
      // (arma/habilidade, nunca uma Magia que já usa este atributo)
      // mostra um checkbox opcional pra usar ESTE atributo no lugar do
      // configurado na Ação, só nesta rolagem - nunca muda a Ação em si.
      // Vazio = nenhuma troca oferecida (comportamento de sempre).
      // Genérico: qualquer Condição pode preencher isto, não é
      // específico do Empíreo.
      trocaAtributoAtaqueOpcional: new StringField({ initial: "" }),
      // Rank vindo de um item do portador (ex.: Profusão Ousada/Retraída
      // seguem o rank da Dualidade do Empíreo). Quando a Condição entra
      // sem rank explícito, usa o rank atual do item do portador que
      // corresponde a este UUID. Vazio = comportamento de sempre.
      rankVemDeItemUuid: new StringField({ initial: "" })
    };
  }
}

/**
 * Classe: um item que descreve a
 * progressão por nível de uma classe do Capítulo IV do manual (Guerreiro,
 * Mago, etc.) - normalmente vive num compêndio e é arrastado pra ficha do
 * personagem uma única vez (o sistema não permite multiclasse, ver
 * NaurenActorSheet). Cada linha de "niveis" descreve o que aquele nível
 * concede: itens NOVOS (uma Habilidade, Arma, Magia...) e/ou o "upgrade" de
 * rank de algo já concedido num nível anterior (ex: "Guarda melhoria" do
 * Guerreiro, que sobe o rank da MESMA Habilidade repetidas vezes em vez de
 * conceder itens novos empilhados - ver NaurenHabilidadeData#rankAtual).
 * O granting automático em si (o que roda quando o jogador sobe de nível)
 * usa o NaurenConcessaoHelper.
 */
class NaurenClasseData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: new HTMLField({ initial: "" }),
      mostrarDescricao: new BooleanField({ initial: false }),
      // Não envia a descrição no card de uso (exceção à configuração do mundo).
      ocultarDescricaoNoChat: new BooleanField({ initial: false }),
      // Indicador do livro: "PI" (gera Prioridade para inimigo), "PA" (para
      // aliado), "NP" (não gera), "" (não informado). Cada Ação pode sobrescrever.
      prioridadeIndicador: new StringField({ initial: "" }),
      // Slug estável (ex: "guerreiro") - usado por itens de Subclasse (Fase
      // 5) pra saber a qual Classe pertencem. Não precisa ser único no
      // sistema todo, só precisa bater com o que a Subclasse espera -
      // convenção livre de quem monta o compêndio.
      identifier: new StringField({ initial: "" }),
      // Criador de Personagem: equipamento que esta Classe usa (só destaca, não bloqueia).
      // categorias = chaves de NAUREN_EQUIP_CATEGORIAS; nomes = itens específicos separados por vírgula; dica = texto ao jogador.
      equipamentoRecomendado: new SchemaField({
        categorias: new ArrayField(new StringField({ initial: "" })),
        nomes: new StringField({ initial: "" }),
        dica: new StringField({ initial: "" })
      }),
      // 0.101 — Criador: metas e atributos que a Classe mais usa (o passo Atributos destaca e sugere).
      // metas = espirito/poderAtaque/poderMagia/vitalidade; atributos = chaves na ordem (1º, 2º, 3º); dica = texto livre.
      atributosRecomendados: new SchemaField({
        metas: new ArrayField(new StringField({ initial: "" })),
        atributos: new ArrayField(new StringField({ initial: "" })),
        dica: new StringField({ initial: "" })
      }),
      niveis: new ArrayField(new SchemaField({
        nivel: new NumberField({ initial: 1, min: 1, max: 20, integer: true }),
        itensConcedidos: new ArrayField(new SchemaField({
          uuid: new StringField({ initial: "" })
        })),
        upgradesDeRank: new ArrayField(new SchemaField({
          // uuid do item ORIGINAL (mundo/compêndio) que foi concedido antes -
          // o sistema acha a cópia correspondente no ator por
          // flags.core.sourceId (ver NaurenConcessaoHelper), e sobe o rank
          // dela pro valor abaixo.
          uuidOrigem: new StringField({ initial: "" }),
          novoRank: new NumberField({ initial: 1, min: 1, integer: true })
        })),
        // Escolha de itens ao alcançar este nível (ex: nível 1 de toda
        // Classe - "escolha seu equipamento inicial") - mostra um popup
        // com TODOS os itens do pool abaixo (ícone, nome, descrição, no
        // mesmo estilo visual usado no resto do sistema) e o jogador
        // escolhe exatamente quantos "quantidadeEscolhas" permitir. Os
        // escolhidos são concedidos pela MESMA infraestrutura reversível
        // de "itensConcedidos" acima (NaurenConcessaoHelper.concederItem),
        // então descer de nível desfaz igual.
        escolhaItens: new SchemaField({
          ativo: new BooleanField({ initial: false }),
          itensDisponiveis: new ArrayField(new SchemaField({ uuid: new StringField({ initial: "" }) })),
          // Número fixo ("2") ou fórmula com token ("@destino",
          // "@dadosDestino", "@destino+1"...) - reaproveita EXATAMENTE a
          // mesma interpretação usada em Dano/Custo/Bônus Manual em
          // qualquer lugar do sistema (ver naurenInterpretarModificador).
          quantidadeEscolhas: new StringField({ initial: "1" })
        })
      })),
      // Histórico de concessões (NaurenConcessaoHelper) - só existe
      // de verdade na CÓPIA embutida no personagem (o molde no mundo/
      // compêndio nunca acumula histórico, já que nunca é "usado"
      // diretamente). Cada entrada representa um nível já aplicado, usada
      // pra desfazer com precisão se o personagem descer de nível.
      historico: new ArrayField(new SchemaField({
        origem: new StringField({ initial: "" }),
        itensCriados: new ArrayField(new StringField()),
        upgrades: new ArrayField(new SchemaField({
          itemId: new StringField({ initial: "" }),
          campo: new StringField({ initial: "" }),
          // Sempre gravado como texto (mesmo pra campos numéricos, tipo
          // rankAtual) - na hora de restaurar, o próprio campo de destino
          // converte de volta ("2" vira 2 num NumberField automaticamente).
          valorAnterior: new StringField({ initial: "", blank: true })
        })),
        // Timestamp (Date.now()) de quando este evento aconteceu - usado
        // pra saber a ordem cronológica certa quando é preciso desfazer o
        // MAIS RECENTE primeiro (ex: perder um Ponto de Subclasse por
        // qualquer motivo reverte o último nó investido, nunca um mais
        // antigo).
        em: new NumberField({ initial: 0 })
      })),
      // Mesmo mecanismo de Subclasse (ver campoRecursoDeclarado) - uma
      // Classe também pode declarar recursos próprios, necessário pra
      // habilidades de NÍVEL 1 que já usam um recurso customizado, antes
      // do jogador sequer poder escolher uma Subclasse (ex: Espírito de
      // Batalha do Guerreiro).
      recursosDeclarados: new ArrayField(new SchemaField(campoRecursoDeclarado()))
    };
  }
}

/**
 * Subclasse: a árvore de habilidades desenhada sobre uma imagem de
 * fundo (ver PDF de referência do Guerreiro). Cada "nó" é um retângulo
 * posicionado livremente em cima da arte, com pré-requisito(s) de outro(s)
 * nó(s) e um item vinculado que é concedido/upado quando o jogador investe
 * um Ponto de Subclasse nele. Diferente da Classe (só uma por personagem),
 * várias Subclasses podem estar equipadas ao mesmo tempo, todas puxando do
 * MESMO pool de pontos do Ator (system.pontosSubclasse).
 *
 * A ficha (NaurenSubclasseSheet) tem dois modos alternáveis pelo cabeçalho
 * da própria janela (Edição/Jogo) - a mesma ficha abre tanto pro item no
 * mundo/compêndio (o "molde") quanto pra cópia embutida no personagem (onde
 * o estado de jogo - rankAtual de cada nó, historico - realmente evolui).
 */

/**
 * Definição de um Recurso Customizado declarado por um item (hoje:
 * Subclasse e Classe) - vira uma barra própria no ator quando o item é
 * equipado (ver naurenSincronizarRecursosCustom). Fatorada numa função
 * própria pra Subclasse e Classe usarem exatamente o mesmo formato, sem
 * duplicar a definição.
 */
function campoRecursoDeclarado() {
  return {
    // "id" tem que ser um identificador simples (sem espaço/acento) -
    // usado só no token de fórmula "@recurso_<id>" (ver
    // naurenResolverTokenFormula) - pode ser editado livremente a
    // qualquer momento, SEM afetar a sincronização (essa usa
    // "chaveInterna" abaixo, escondida do jogador).
    id: new StringField({ initial: "" }),
    nome: new StringField({ initial: "Novo Recurso" }),
    // Fórmula de máximo (aceita @nivel, @destino etc, resolvida no
    // momento da sincronização - não é "ao vivo" como Vida/Mana ainda,
    // então uma habilidade que muda o máximo depois precisa disparar
    // uma nova sincronização, não é automático a cada render).
    maxFormula: new StringField({ initial: "5" }),
    icone: new StringField({ initial: "fa-star" }),
    cor1: new StringField({ initial: "#4a3a7a" }),
    cor2: new StringField({ initial: "#8a6fd4" }),
    // Condição ao Atingir o Máximo: quando um Gatilho
    // por Evento (ver naurenConcederRecurso) empurra este recurso pro
    // seu próprio teto, aplica automaticamente esta Condição no ator -
    // é assim que "Profusão" (Empíreo) se encaixa no motor existente
    // sem precisar de um sistema de "estado" novo: a Condição É o
    // estado, com seus próprios Modificadores (ex: +1 PdA, +1 Defesa
    // pra "Profusão Ousada") - reaproveita 100% do motor de Condição.
    condicaoAoAtingirMax: new StringField({ initial: "" }),
    // Trava de "recurso par": quando ESTE recurso chega no próprio
    // máximo, o recurso com este "id" (não a chaveInterna - o "id" é o
    // identificador legível, igual usado em "@recurso_<id>") para de
    // aceitar ganhos por Gatilho, A MENOS QUE uma Habilidade ativa do
    // ator tenha "desbloqueiaTravaDeRecurso" apontando pro MESMO id (ex:
    // Ambivalência do Empíreo), OU o jogador force "destravado" na
    // ficha. Pensado pra pares tipo Determinação↔Ofuscação: cada um trava
    // o outro, então por padrão só um dos dois consegue estar no máximo
    // (Profusão) de cada vez - sem isso, Ambivalência não teria nada
    // especial pra desbloquear.
    travaRecursoId: new StringField({ initial: "" }),
    // Zera o VALOR ATUAL deste recurso (não remove a barra) no escopo
    // escolhido - "combate" (fim de cada combate) ou "rodada" (início de
    // cada rodada, útil pra contadores tipo "3 vezes NESTA rodada").
    // "" = nunca zera sozinho. Pra recursos explicitamente "durante o
    // combate"/"por combate" (ex: Determinação/Ofuscação do Empíreo,
    // Pontos Elevados de Elevar a Dualidade, Penitências no Combate do
    // Sacerdote, Pontos de Poesia da Chuva do Místico) ou "nesta rodada"
    // (ex: Instinto de Sobrevivência do Caçador). Sem isso, o valor
    // ficaria acumulando indefinidamente entre combates/rodadas diferentes.
    resetarNoEscopo: new StringField({ initial: "" }), // ""|combate|rodada
    // Se o recurso deve nascer CHEIO (valor = max) na primeira vez que a
    // barra é criada, ou vazio (0, o padrão de sempre) - "cheio" faz
    // sentido pra recursos que representam algo que o personagem JÁ
    // POSSUI (ex: Espírito da Batalha, Guerreiro - "possui uma
    // quantidade de pontos... igual ao seu meta atributo de Espírito"),
    // diferente de CONTADORES que se acumulam ao longo do jogo (ex:
    // Determinação/Ofuscação, Pontos de Poesia da Chuva, Penitências no
    // Combate, Vezes que sofri dano - todos devem continuar nascendo
    // vazios). Só afeta a CRIAÇÃO da barra - sincronizações seguintes
    // sempre preservam o valor atual, nunca reenchem.
    nasceCheio: new BooleanField({ initial: false }),
    // Chave INTERNA e estável - NUNCA exibida/editada
    // pelo jogador, gerada 1x na criação (ver onAddRecurso) e nunca
    // muda depois. A sincronização (naurenSincronizarRecursosCustom)
    // casa por ISSO, não pelo "id" - editar "id"/"nome" livremente
    // depois de criado só ATUALIZA a barra existente, nunca cria uma
    // nova (bug corrigido: antes casava pelo "id", editável, então
    // mudar o id "abandonava" a barra antiga e criava outra).
    chaveInterna: new StringField({ initial: "" })
  };
}

class NaurenSubclasseData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: new HTMLField({ initial: "" }),
      mostrarDescricao: new BooleanField({ initial: false }),
      // Não envia a descrição no card de uso (exceção à configuração do mundo).
      ocultarDescricaoNoChat: new BooleanField({ initial: false }),
      // Indicador do livro: "PI" (gera Prioridade para inimigo), "PA" (para
      // aliado), "NP" (não gera), "" (não informado). Cada Ação pode sobrescrever.
      prioridadeIndicador: new StringField({ initial: "" }),
      identifier: new StringField({ initial: "" }),
      // A qual Classe esta Subclasse pertence (bate com o "identifier" da
      // Classe) - só informativo/organizacional por enquanto, o sistema não
      // impede equipar uma Subclasse "errada" pra Classe atual.
      classeIdentifier: new StringField({ initial: "" }),
      imagemFundo: new StringField({ initial: "" }),
      // Zoom da imagem de fundo (% - 100 é tamanho "natural"). A imagem
      // nunca é cortada (diferente de um "cover" comum): ela sempre aparece
      // inteira, na proporção original, dentro de uma área com rolagem -
      // aumentar o zoom só faz ela (e os nós, que ficam na MESMA escala)
      // crescerem juntos, sem distorcer nada.
      zoomFundo: new NumberField({ initial: 100, min: 20, max: 400, integer: true }),
      // Cada nó guarda posição/tamanho em % (0-100) DA IMAGEM (não da
      // janela) - fica alinhado com a arte em qualquer zoom. "rankAtual" é
      // estado do PERSONAGEM (fica 0 pra sempre no molde do mundo/
      // compêndio, só sobe na cópia embutida).
      nos: new ArrayField(new SchemaField({
        id: new StringField({ initial: "" }),
        x: new NumberField({ initial: 10, min: 0, max: 100 }),
        y: new NumberField({ initial: 10, min: 0, max: 100 }),
        largura: new NumberField({ initial: 12, min: 2, max: 100 }),
        altura: new NumberField({ initial: 12, min: 2, max: 100 }),
        nome: new StringField({ initial: "Novo Nó" }),
        // Nome não aparece no quadrado por padrão (a arte já é o visual
        // principal) - só quando "mostrarNome" está marcado.
        mostrarNome: new BooleanField({ initial: false }),
        tipo: new StringField({ initial: "Habilidade Passiva" }),
        // Duas cores separadas: a borda (e a linha que sai deste nó pros
        // que dependem dele) mostra "corBordaPadrao" enquanto rankAtual for
        // 0, e troca pra "corBordaAdquirido" assim que o jogador investir o
        // 1º ponto nele - os dois lados totalmente customizáveis.
        corBordaPadrao: new StringField({ initial: "#2a2a2a" }),
        corBordaAdquirido: new StringField({ initial: "#cca162" }),
        curvaturaBorda: new NumberField({ initial: 2, min: 0, max: 50, integer: true }),
        sombra: new BooleanField({ initial: true }),
        // Preenchimento de fundo do nó (além da borda) - fica DESLIGADO por
        // padrão (transparente) pra não tampar a arte atrás; "" = sem
        // preenchimento. Só um detalhe visual opcional pra quem quiser
        // destacar nós sem imagem própria.
        corPreenchimento: new StringField({ initial: "" }),
        imagemPropria: new StringField({ initial: "" }),
        // Permite ter uma imagem salva no nó mas ESCONDIDA (ex: item
        // arrastado já veio com a imagem dele, mas você prefere não
        // mostrar) sem precisar apagar o caminho - liga/desliga fácil.
        mostrarImagem: new BooleanField({ initial: true }),
        rankMax: new NumberField({ initial: 1, min: 1, integer: true }),
        // Quando ligado, este nó NUNCA concede um item novo (mesmo no
        // rank 1) - sempre procura, no ator, um item já concedido pela
        // CLASSE base (mesmo uuid) e sobe o rank dele direto. Cobre o
        // caso "esta Habilidade da Subclasse só melhora algo que a
        // Classe já deu" (ex: "Transbordar: Comungar restaura +1 de
        // mana"), sem duplicar item nenhum.
        apenasUpgrade: new BooleanField({ initial: false }),
        // Alternativa a "system.rankAtual" quando DOIS nós diferentes
        // precisam mexer no MESMO item concedido pela Classe, mas em
        // aspectos DIFERENTES dele (ex: um nó ajusta a cura, outro ajusta
        // o custo de mana da MESMA Habilidade - os dois teriam que brigar
        // pelo mesmo "rankAtual" compartilhado, sobrescrevendo um ao
        // outro). Preenchendo isto, "apenasUpgrade" escreve DIRETO neste
        // campo (dot-path dentro de "system", ex:
        // "acoes.1.gastosRecurso.0.quantidade") em vez de mexer em
        // rankAtual.
        campoCustomizado: new StringField({ initial: "" }),
        valorCustomizado: new StringField({ initial: "" }),
        // Pra nó com rankMax > 1 que precisa de um valor DIFERENTE em cada
        // rank investido (ex: "Toque da Graça" do Sacerdote-Agraciado,
        // que sobrescreve o dado de cura de Sanatio pra d8/d10/d12
        // conforme o rank deste MESMO nó) - cada entrada aqui vale a
        // partir do rank indicado (mesmo padrão de "porRank" usado em
        // todo o resto do sistema: usa a entrada de maior rank ≤ rank
        // atual do NÓ). Se vazio, cai de volta pro "valorCustomizado"
        // fixo acima - retrocompatível com todo nó já existente.
        valorCustomizadoPorRank: new ArrayField(new SchemaField({
          rank: new NumberField({ initial: 1, min: 1, integer: true }),
          valor: new StringField({ initial: "" })
        })),
        itemUuid: new StringField({ initial: "" }),
        // Itens EXTRAS entregues junto quando este nó é investido pela 1ª
        // vez (rank 1), além do "itemUuid" principal - UUIDs separados por
        // vírgula. Pensado pras "armas-modelo" das Subclasses: o nó
        // concede a Habilidade E já coloca na ficha uma arma com o efeito
        // dela pré-configurado, que o jogador pode usar direto ou editar
        // como quiser. Reverte junto ao resetar a Subclasse (mesmo
        // histórico do item principal).
        itensExtrasUuids: new StringField({ initial: "" }),
        // Camadas (Fase 3): como este nó modifica outros itens. Aplicadas no
        // momento do uso, com o rank DESTE nó - nunca gravadas no item alvo.
        modificadores: new ArrayField(new SchemaField(campoModificadorExterno())),
        // Cada pré-requisito é um objeto (não só um id) pra poder desligar
        // a LINHA de conexão individualmente sem desfazer o vínculo em si -
        // "linhaVisivel" controla só o desenho, o pré-requisito continua
        // valendo mesmo com a linha escondida.
        prerequisitos: new ArrayField(new SchemaField({
          id: new StringField({ initial: "" }),
          linhaVisivel: new BooleanField({ initial: true })
        })),
        prerequisitoLogica: new StringField({ initial: "qualquer" }), // "qualquer" (OR) | "todos" (AND)
        rankAtual: new NumberField({ initial: 0, min: 0, integer: true })
      })),
      historico: new ArrayField(new SchemaField({
        origem: new StringField({ initial: "" }),
        itensCriados: new ArrayField(new StringField()),
        upgrades: new ArrayField(new SchemaField({
          itemId: new StringField({ initial: "" }),
          campo: new StringField({ initial: "" }),
          valorAnterior: new StringField({ initial: "", blank: true })
        })),
        em: new NumberField({ initial: 0 })
      })),
      // ===== RECURSOS CUSTOMIZADOS =====
      // Uma Subclasse pode DECLARAR recursos próprios que não são Vida/Mana/
      // Estamina de Combate/Dados de Destino (ex: Determinação e Ofuscação
      // do Empíreo, Energia do Místico, Pontos de Pintura). Ao ser equipada
      // num ator, cada entrada aqui vira uma entrada correspondente em
      // "system.recursosCustom" do ATOR (ver naurenSincronizarRecursosCustom)
      // - o jogador então tem uma barra própria pra cada um, igual as 4
      // padrão, só que dinâmica em quantidade.
      recursosDeclarados: new ArrayField(new SchemaField(campoRecursoDeclarado()))
    };
  }
}

/**
 * Grupo de Jogadores: um item (normalmente solto no MUNDO, na barra lateral
 * de Itens - não precisa estar embutido em nenhum ator) que rastreia os
 * pontos compartilhados de Graça do Destinado (nat 20) e Perjúrio do Acaso
 * (nat 1) descritos no Capítulo III. A detecção é automática e GLOBAL: conta
 * qualquer d20 rolado pelo sistema (teste de atributo ou ataque), de
 * QUALQUER ator - personagem ou NPC, inclusive um NPC que o mestre esteja
 * rolando - sem precisar cadastrar ninguém numa lista (ver NaurenGrupoHelper).
 * A lista de "Membros" abaixo é só um roster de referência (pra lembrar quem
 * está na mesa), não filtra a detecção. Os dois contadores também podem ser
 * ajustados/zerados manualmente na ficha, já que segundo o manual eles
 * "desaparecem ao final da sessão".
 */
class NaurenGrupoData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: new HTMLField({ initial: "" }),
      mostrarDescricao: new BooleanField({ initial: false }),
      // Não envia a descrição no card de uso (exceção à configuração do mundo).
      ocultarDescricaoNoChat: new BooleanField({ initial: false }),
      // Indicador do livro: "PI" (gera Prioridade para inimigo), "PA" (para
      // aliado), "NP" (não gera), "" (não informado). Cada Ação pode sobrescrever.
      prioridadeIndicador: new StringField({ initial: "" }),
      // Desliga a detecção automática de nat 20/nat 1 (de QUALQUER rolagem
      // do sistema, não só dos membros) sem precisar apagar o item.
      automatico: new BooleanField({ initial: true }),
      limiarPerjurio: new NumberField({ initial: 1, min: 1, max: 19, integer: true }),  // d20 até este valor = Perjúrio do Acaso (só o Mestre edita)
      limiarGraca: new NumberField({ initial: 20, min: 2, max: 20, integer: true }),    // d20 a partir deste valor = Graça do Destinado (só o Mestre edita)
      // Roster de referência (não filtra a detecção automática - ver acima).
      membros: new ArrayField(new SchemaField({
        actorUuid: new StringField({ initial: "" }),
        // Nível de Ameaça - só o Mestre vê/edita (ver context.isGM no
        // item-sheet.html). Livre pro Mestre usar como quiser (não afeta
        // nenhuma automação de combate hoje) - referência rápida de
        // "quão perigoso este personagem está sendo pra cena atual".
        ameaca: new NumberField({ initial: 0, integer: true })
      })),
      graca: new SchemaField({ value: new NumberField({ initial: 0, min: 0, integer: true }) }),
      perjurio: new SchemaField({ value: new NumberField({ initial: 0, min: 0, integer: true }) }),
      // Livro 0.8 - Dado de Acalanto do Destino (Aureum, Sacerdote): do grupo, não some no fim da sessão.
      acalanto: new SchemaField({ value: new NumberField({ initial: 0, min: 0, integer: true }) }),
      // Inventário Compartilhado - lista de referência simples (não são
      // Itens de verdade do Foundry, só nome/quantidade/notas em texto -
      // um item NÃO consegue possuir Itens embutidos como um Ator
      // consegue, então essa é a forma mais direta de fazer uma lista
      // compartilhada sem precisar de um Ator "fantasma" só pra isso).
      // "img" só é preenchida de verdade quando a entrada nasce de um
      // arrastar-e-soltar de Item de verdade (ver o dropzone) - criada
      // manualmente pelo botão "+Adicionar" fica com o ícone genérico.
      inventario: new ArrayField(new SchemaField({
        nome: new StringField({ initial: "" }),
        quantidade: new NumberField({ initial: 1, min: 0, integer: true }),
        notas: new StringField({ initial: "" }),
        img: new StringField({ initial: "icons/svg/item-bag.svg" })
      })),
      // Anotações/Missões - cada entrada é uma REFERÊNCIA a um JournalEntry
      // de verdade do Foundry (não texto solto guardado aqui dentro) - ao
      // clicar, abre a ficha de Diário nativa do Foundry, com tudo que ela
      // já oferece (formatação rica, múltiplas páginas, imagens etc.).
      // Remover a referência aqui NÃO apaga o JournalEntry em si (só
      // desvincula do Grupo) - de propósito, pra nunca destruir conteúdo
      // por engano.
      notas: new ArrayField(new SchemaField({
        journalUuid: new StringField({ initial: "" })
      }))
    };
  }
}

/* =======================================
 * 3. LISTAS DE OPÇÕES COMPARTILHADAS
 * (usadas pelo helper {{selectOptions}} nas fichas de item, e pela
 * ficha de ator para resolver o valor numérico de cada atributo)
 * ======================================= */
const ARMA_TIPOS = {
  "Leve": "Leve (1d4)",
  "Média": "Média (1d6)",
  "Pesada": "Pesada (1d10 / +1 Est)",
  "Alcance": "De Alcance (2m)",
  "Distância": "À Distância (9m)",
  "Catalisador": "Catalisador",
  "Escudo": "Escudo"
};

const HABILIDADE_CATEGORIAS = {
  "Classe": "Habilidade de Classe",
  "Subclasse": "Habilidade de Subclasse",
  "Passiva": "Passiva",
  "Ativa": "Ativa",
  "Especial": "Ação Especial"
};

const NAUREN_LOGICA_CONDICOES_OPCOES = {
  "ou": "QUALQUER UMA (ou)",
  "e": "TODAS (e)"
};

const ARMADURA_TIPOS = {
  "Tecido": "Armadura de Tecido",
  "Couro": "Armadura de Couro",
  "Malha": "Armadura de Malha",
  "Placa": "Armadura de Placa",
  "Capa": "Capa",
  "Bota": "Bota",
  "Escudo": "Escudo",
  "Manopla": "Manopla",
  "Acessório": "Acessório"
};

/**
 * Equipamento recomendado por Classe (Criador de Personagem): a Classe lista as
 * CATEGORIAS que usa (tipos de arma do campo "categoria" e tipos de armadura do
 * campo "tipo") e, se precisar de algo mais fino, NOMES de itens (ex.: "Arco, Arma
 * de Fogo" sem a Besta). Nada é bloqueado: só destaca e separa no Criador.
 */
const NAUREN_EQUIP_CATEGORIAS = {
  "Leve": { nome: "Arma Leve", grupo: "arma" },
  "Média": { nome: "Arma Média", grupo: "arma" },
  "Pesada": { nome: "Arma Pesada", grupo: "arma" },
  "Alcance": { nome: "Arma de Alcance", grupo: "arma" },
  "Distância": { nome: "Arma à Distância (todas)", grupo: "arma" },
  "Catalisador": { nome: "Catalisador", grupo: "arma" },
  "Escudo": { nome: "Escudo", grupo: "arma" },
  "Tecido": { nome: "Armadura de Tecido", grupo: "armadura" },
  "Couro": { nome: "Armadura de Couro", grupo: "armadura" },
  "Malha": { nome: "Armadura de Malha", grupo: "armadura" },
  "Placa": { nome: "Armadura de Placa", grupo: "armadura" },
  "Capa": { nome: "Capa", grupo: "armadura" },
  "Bota": { nome: "Botas", grupo: "armadura" }
};

/**
 * Padrão do livro 0.8 (seção de cada Classe, "Armas" / "Armaduras"). Só preenche
 * a Classe do compêndio quando ela ainda não tem nada configurado: o Mestre pode
 * mudar à vontade na ficha da Classe. Tradução para as categorias do sistema:
 * adagas e armas de punho = Leve; espadas e machados = Média (e Pesada quando o
 * livro diz espadas/machados/martelos de guerra); martelos = Pesada; lanças =
 * Alcance; cajados, varinhas e catalisadores = Catalisador; "leve" = Tecido.
 * Capas e botas complementam qualquer armadura, então valem para todas.
 */
const NAUREN_EQUIPAMENTO_CLASSE_LIVRO = {
  druida: { categorias: ["Pesada", "Catalisador", "Alcance", "Tecido", "Couro", "Capa", "Bota"], nomes: "", dica: "Armas: cajados, martelos, catalisadores e lanças. Armaduras: leves e de couro." },
  guerreiro: { categorias: ["Média", "Pesada", "Alcance", "Escudo", "Tecido", "Couro", "Malha", "Placa", "Capa", "Bota"], nomes: "", dica: "Armas: espadas, martelos, escudos, machados e lanças. Armaduras: todas." },
  ladino: { categorias: ["Leve", "Média", "Tecido", "Couro", "Capa", "Bota"], nomes: "Arco, Arma de Fogo", dica: "Armas: adagas, espadas, machados pequenos, martelos pequenos, arcos e armas de fogo. Armaduras: tecido e couro." },
  mistico: { categorias: ["Catalisador", "Alcance", "Média", "Leve", "Tecido", "Capa", "Bota"], nomes: "", dica: "Armas: cajados, catalisador, lanças, espadas e armas de punho. Armaduras: tecido." },
  cacador: { categorias: ["Alcance", "Média", "Leve", "Malha", "Tecido", "Couro", "Capa", "Bota"], nomes: "Arco, Besta", dica: "Armas: arcos, bestas, lanças, espadas, machados e adagas. Armaduras: malha, tecido e couro." },
  mago: { categorias: ["Catalisador", "Tecido", "Capa", "Bota"], nomes: "", dica: "Armas: cajados, varinhas e catalisadores. Armaduras: tecido." },
  sacerdote: { categorias: ["Catalisador", "Pesada", "Tecido", "Capa", "Bota"], nomes: "", dica: "Armas: cajados, martelos e catalisadores. Armaduras: tecido." },
  empireo: { categorias: ["Média", "Pesada", "Catalisador", "Tecido", "Malha", "Capa", "Bota"], nomes: "", dica: "Armas: espadas, machados, martelos e catalisadores. Armaduras: tecido e malha." },
  inventor: { categorias: ["Tecido", "Couro", "Capa", "Bota"], nomes: "Arma de Fogo, Martelo", dica: "Armas: armas de fogo e martelos. Armaduras: tecido e couro." }
};

/* 0.101 — Atributos recomendados pelo livro 0.8.1 ("Atributos e meta atributos recomendados" de cada Classe).
 * A ordem dos atributos foi conferida testando as combinações de 5, 4, 3, 3, 2 e de várias rolagens
 * (o arredondamento para baixo muda o que rende mais). "motivos" explica no Criador por que cada um. */
const NAUREN_ATRIBUTOS_CLASSE_LIVRO = {
  cacador: { metas: ["poderAtaque"], atributos: ["estamina", "agilidade", "forca", "destino", "inteligencia"], dica: "Livro: Poder de Ataque e Estamina. O Poder de Ataque usa o maior entre Força e Agilidade." },
  druida: { metas: ["espirito", "poderMagia"], atributos: ["estamina", "inteligencia", "destino", "forca", "agilidade"], dica: "Livro: Espírito, Poder de Magia e Estamina." },
  empireo: { metas: ["espirito", "poderMagia"], atributos: ["estamina", "destino", "inteligencia", "forca", "agilidade"], dica: "Livro: Espírito, Poder de Magia ou Poder de Ataque e Estamina. De armas? Use a sugestão \"Armas\" (Força no lugar da Inteligência)." },
  guerreiro: { metas: ["vitalidade", "poderAtaque"], atributos: ["estamina", "forca", "destino", "agilidade", "inteligencia"], dica: "Livro: Vitalidade e Poder de Ataque. O Espírito vira Espírito da Batalha." },
  inventor: { metas: ["espirito"], atributos: ["inteligencia", "destino", "estamina", "forca", "agilidade"], dica: "Livro: Espírito, Inteligência e Destino. O Espírito vira Pontos de Invenção." },
  ladino: { metas: [], atributos: ["estamina", "inteligencia", "agilidade", "destino", "forca"], dica: "Livro: Estamina e Inteligência. O Espírito vira Espírito Ardiloso." },
  mago: { metas: ["espirito", "poderMagia"], atributos: ["inteligencia", "estamina", "destino", "agilidade", "forca"], dica: "Livro: Espírito e Poder de Magia." },
  mistico: { metas: ["espirito"], atributos: ["estamina", "destino", "inteligencia", "agilidade", "forca"], dica: "Livro: Espírito e Estamina. A Energia tem o limite do seu Espírito." },
  sacerdote: { metas: ["espirito", "poderMagia"], atributos: ["destino", "inteligencia", "estamina", "forca", "agilidade"], dica: "Livro: Espírito, Poder de Magia e Destino." }
};
/* 0.101.0 semeou estes valores; quem ainda está com eles (sem edição do Mestre) passa para os de cima. */
const NAUREN_ATRIBUTOS_CLASSE_LIVRO_0_101_0 = {
  cacador: ["estamina", "agilidade", "destino"], druida: ["inteligencia", "destino", "estamina"], empireo: ["inteligencia", "destino", "estamina"],
  guerreiro: ["estamina", "forca", "destino"], inventor: ["inteligencia", "destino", "estamina"], ladino: ["estamina", "inteligencia", "agilidade"],
  mago: ["inteligencia", "destino", "estamina"], mistico: ["inteligencia", "destino", "estamina"], sacerdote: ["inteligencia", "destino", "estamina"]
};
/* Perfis da "Sugestão": a ordem do livro (a Estamina é o número de Ações, então vem cedo). Empíreo de armas troca a Inteligência pela Força. */
const NAUREN_CRIADOR_PERFIS_CLASSE = {
  empireo: [{ nome: "Magia", ordem: ["estamina", "destino", "inteligencia", "forca", "agilidade"] }, { nome: "Armas", ordem: ["estamina", "destino", "forca", "inteligencia", "agilidade"] }]
};
/** A Classe já tem atributos recomendados configurados? */
function naurenAtributosRecomendadosPreenchido(cfg) {
  return !!((cfg?.metas ?? []).length || (cfg?.atributos ?? []).length || String(cfg?.dica ?? "").trim());
}
/**
 * Perfis de sugestão da Classe: a ordem dos 5 atributos (a configurada na Classe; o que faltar vai no fim).
 * Empíreo com a ordem do livro: dois perfis (Magia e Armas).
 */
function naurenPerfisSugestaoClasse(identifier, cfg) {
  const todos = ["estamina", "destino", "inteligencia", "forca", "agilidade"];
  const ordem = [...new Set([...(cfg?.atributos ?? []).filter(a => todos.includes(a)), ...todos])];
  const livro = NAUREN_ATRIBUTOS_CLASSE_LIVRO[identifier];
  const igualLivro = livro && JSON.stringify((cfg?.atributos ?? []).slice(0, 3)) === JSON.stringify(livro.atributos.slice(0, 3));
  if ((igualLivro || !(cfg?.atributos ?? []).length) && NAUREN_CRIADOR_PERFIS_CLASSE[identifier]) return NAUREN_CRIADOR_PERFIS_CLASSE[identifier];
  return [{ nome: "", ordem }];
}
/**
 * Sugestão: o maior valor no 1º atributo da ordem, o seguinte no 2º, e assim por diante (como no livro).
 * Devolve { forca, agilidade, estamina, inteligencia, destino } com o ÍNDICE do valor usado.
 */
function naurenMelhorDistribuicao(valores, ordem) {
  const chaves = ["forca", "agilidade", "estamina", "inteligencia", "destino"];
  const lista = Array.isArray(ordem) ? [...new Set([...ordem.filter(k => chaves.includes(k)), ...chaves])] : chaves;
  const indices = valores.map((v, i) => i).sort((x, y) => (Number(valores[y]) || 0) - (Number(valores[x]) || 0) || x - y);
  return Object.fromEntries(lista.map((k, i) => [k, indices[i]]));
}

/** A Classe já tem equipamento recomendado configurado? */
function naurenEquipRecomendadoPreenchido(cfg) {
  return !!((cfg?.categorias ?? []).length || String(cfg?.nomes ?? "").trim() || String(cfg?.dica ?? "").trim());
}

/** Categoria de um item de equipamento: "categoria" da arma ou "tipo" da armadura. */
function naurenCategoriaEquipamento(item) {
  if (item?.type === "arma") return item.system?.categoria ?? "";
  if (item?.type === "armadura") return item.system?.tipo ?? "";
  return "";
}

/** O item é recomendado pela configuração da Classe? (categoria marcada ou nome listado) */
function naurenEquipamentoRecomendado(cfg, item) {
  if (!cfg) return false;
  const cat = naurenCategoriaEquipamento(item);
  if (cat && (cfg.categorias ?? []).includes(cat)) return true;
  const norm = t => String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const nomes = String(cfg.nomes ?? "").split(/[,;\n]/).map(norm).filter(Boolean);
  const nomeItem = norm(item?.name);
  return nomes.some(n => nomeItem === n || nomeItem.startsWith(n + " ") || nomeItem.startsWith(n + "("));
}

/** Texto curto das categorias marcadas (ex.: "Arma Média, Escudo, Armadura de Tecido + Arco"). */
function naurenResumoEquipamentoClasse(cfg) {
  const partes = (cfg?.categorias ?? []).map(c => NAUREN_EQUIP_CATEGORIAS[c]?.nome ?? c);
  const nomes = String(cfg?.nomes ?? "").split(/[,;\n]/).map(t => t.trim()).filter(Boolean);
  return [...partes, ...nomes].join(", ");
}

const TEMPLATE_FORMATOS = {
  "circle": "Círculo / Raio",
  "emanacao": "Emanação (centrada em você)",
  "cone": "Cone",
  "rect": "Quadrado",
  "ray": "Linha Reta"
};

// Atributos e meta-atributos que podem ser somados a testes de ataque, dano ou cura
// Lista de referência de todos os "@token" que podem ser usados em
// fórmulas (Ataque/Dano/Cura de uma Ação, modificadores de Efeito/
// Condição/Pigmento/Bônus Manual) - mostrada na aba Opções, numa caixa
// expansível, pros jogadores consultarem sem precisar perguntar ao mestre.
// Preenchida à mão (não gerada de NAUREN_CAMPOS_MODIFICADOR_OPCOES) porque
// aqui cabem tokens que NÃO são "modificáveis" (ex: @vida, @nivel) e
// também os especiais (@rank, @alvoAcumulos) que só existem em contexto.
const NAUREN_REFERENCIA_FORMULAS = [
  {
    categoria: "Grupos exclusivos (estados que não coexistem)",
    itens: [
      { token: "Como funciona", desc: "Não é fórmula: é um nome que você escreve no campo \"Grupo exclusivo\" de Condições e Efeitos. Itens com o MESMO nome de grupo não ficam ativos juntos além do máximo; ao entrar um novo, o mais antigo sai. Use letras minúsculas e hífen (ex.: minha-postura). O campo sugere os grupos existentes enquanto você digita." },
      { token: "forma-druida", desc: "Formas do Druida (Arauto Lunar, Senhor da Floresta, Sábio dos Matos). Máximo 1." },
      { token: "guarda", desc: "Guardas do Guerreiro (Defensiva e Ofensiva, todas as variantes). Máximo 1; 2 com Juramento da Guarda." },
      { token: "Mudar o máximo", desc: "Em Habilidades e Efeitos: \"Muda o máximo de um grupo exclusivo\" → escreva o mesmo nome de grupo e o novo máximo (ex.: guarda = 2). Vale enquanto o item estiver no personagem." }
    ]
  },
  {
    categoria: "Contexto do uso (alvo, grupo e rank)",
    itens: [
      { token: "@rank", desc: "Rank efetivo do item (o salvo, ajustado por nós de Subclasse que modificam o rank)." },
      { token: "@estresseAlvo", desc: "Estresse atual do 1º alvo marcado." },
      { token: "@vidaAlvo", desc: "Pontos de Vida atuais do 1º alvo marcado." },
      { token: "@vidaMaxAlvo", desc: "Vida máxima do 1º alvo marcado. Ex.: reviver com metade da Vida: floor(@vidaMaxAlvo/2)." },
      { token: "@condicoesDistintasAlvo", desc: "Quantas Condições diferentes o 1º alvo tem (ex.: Disparo Quimérico)." },
      { token: "@acumulosAlvo(Nome)", desc: "Acúmulos da Condição \"Nome\" no 1º alvo. Ex.: @acumulosAlvo(Sangramento)." },
      { token: "@acumulosMeu(Nome)", desc: "Acúmulos da Condição \"Nome\" em você. Ex.: @acumulosMeu(Adrenalina)." },
      { token: "@estresseMeu", desc: "Seu Estresse atual (ex.: Explorar a Dor)." },
      { token: "@estresseAliados", desc: "Soma do Estresse dos seus aliados em cena. Ex.: \"@estresseAliados*2\" = 2 de dano por Estresse (A Isca Perfeita)." },
      { token: "@aliadosNoRaio(m)", desc: "Quantos aliados estão a até m metros de você. Ex.: @aliadosNoRaio(4)." },
      { token: "@bandoNoAlcance", desc: "Bando: quantos lacaios vivos do grupo têm o alvo dentro do alcance desta Ação (sem alvo: todos os vivos)." },
      { token: "@bandoDados(XdY)", desc: "Bando: multiplica os dados pelos lacaios no alcance. Ex.: @bandoDados(1d6) com 3 no alcance = 3d6." },
      { token: "@bandoVivos", desc: "Bando: quantos lacaios do grupo estão vivos." },
      { token: "@bandoMembros", desc: "Bando: quantos lacaios o grupo tinha (configurado no NPC; vazio = os tokens da cena)." },
      { token: "@bandoExtra", desc: "Bando: bônus por cercar o alvo = (lacaios no alcance − 1) × o bônus por lacaio do NPC (padrão 1). Ex.: 4 no alcance = +3." },
      { token: "@inimigosNoRaio(m)", desc: "Quantos inimigos estão a até m metros de você. Ex.: @inimigosNoRaio(6)." },
      { token: "@prioridadesGeradas", desc: "Quantas Prioridades você concedeu (pelo card) neste combate. Ex.: Fazer em Silêncio." }
    ]
  },
  {
    categoria: "Atributos",
    itens: [
      { token: "@forca", desc: "Força atual (já com bônus de Efeitos/Condições/Pigmentos somados)." },
      { token: "@agilidade", desc: "Agilidade atual (com bônus)." },
      { token: "@estamina", desc: "Estamina (o Atributo, usado em Vitalidade/Poder de Magia/etc.) - não confundir com @estaminaCombate, o recurso que se gasta em combate." },
      { token: "@inteligencia", desc: "Inteligência atual (com bônus)." },
      { token: "@destino", desc: "Destino atual (com bônus)." }
    ]
  },
  {
    categoria: "Meta-Atributos",
    itens: [
      { token: "@espirito", desc: "Espírito atual (Inteligência + Destino, com bônus)." },
      { token: "@poderAtaque", desc: "Poder de Ataque atual." },
      { token: "@poderMagia", desc: "Poder de Magia atual." },
      { token: "@vitalidade", desc: "Vitalidade atual." }
    ]
  },
  {
    categoria: "Recursos (atual e máximo são tokens separados)",
    itens: [
      { token: "@vida", desc: "Pontos de Vida ATUAIS (o número que desce quando toma dano)." },
      { token: "@vidaMax", desc: "Vida MÁXIMA (o teto)." },
      { token: "@mana", desc: "Mana atual." },
      { token: "@manaMax", desc: "Mana máxima." },
      { token: "@estaminaCombate", desc: "Estamina de Combate atual (o recurso que se gasta em Ações)." },
      { token: "@estaminaCombateMax", desc: "Estamina de Combate máxima." },
      { token: "@dadosDestino", desc: "Dados de Destino atuais." },
      { token: "@dadosDestinoMax", desc: "Dados de Destino máximos." }
    ]
  },
  {
    categoria: "Outros",
    itens: [
      { token: "@defesa", desc: "Defesa TOTAL (já com bônus de Armadura/Efeitos/Condições)." },
      { token: "@movimento", desc: "Movimento total, em metros." },
      { token: "@estresse", desc: "Pontos de Estresse atuais." },
      { token: "@estresseMax", desc: "Limite de Estresse." },
      { token: "@limiarDeflexao", desc: "Limiar de Deflexão TOTAL - margem de diferença permitida entre um Ataque e um Contra-Ataque pra ocorrer Deflexão." },
      { token: "@reducaoDano", desc: "Redução de Dano Sofrido TOTAL - valor subtraído de qualquer dano recebido, aplicado por último, depois de qualquer reação já ter reduzido o dano." },
      { token: "@nivel", desc: "Nível atual do personagem." }
    ]
  },
  {
    categoria: "Recursos Customizados (Determinação, Energia, etc - )",
    itens: [
      { token: "@recurso_<id>", desc: "Valor ATUAL de um Recurso Customizado da sua Subclasse (ex: \"@recurso_determinacao\") - o \"id\" é o mesmo definido na ficha da Subclasse. Vira 0 se você não tiver esse recurso." },
      { token: "@recurso_<id>Max", desc: "Máximo desse mesmo recurso (ex: \"@recurso_determinacaoMax\")." }
    ]
  },
  {
    categoria: "Especiais (só funcionam em certos lugares)",
    itens: [
      { token: "@rank", desc: "Rank ATUAL do item que tem a fórmula (Efeito, Pigmento, Condição, Habilidade, Arma ou Magia) - só funciona escrevendo a fórmula DENTRO daquele item." },
      { token: "@acumulos", desc: "Acúmulos ATUAIS da própria Condição que tem a fórmula (só funciona dentro de uma Condição) - vira 0 em qualquer outro tipo de item. IMPORTANTE: um Modificador de Condição acumulável já multiplica sozinho pelos acúmulos quando você escreve só um número simples (ex: \"-1\" numa Condição com 3 acúmulos já vira \"-3\" automaticamente) - só use \"@acumulos\" explicitamente se quiser uma escala DIFERENTE da linear simples (ex: \"-@acumulos*2\")." },
      { token: "@alvoAcumulos", desc: "Quantos acúmulos o alvo selecionado (tecla T) tem de uma Condição específica - só funciona dentro de uma Ação com \"Verificar Condição no Alvo\" ligado e a Condição de referência escolhida." },
      { token: "@alvoEstresse", desc: "Quantos pontos de Estresse ATUAL o primeiro alvo marcado (tecla T) possui agora - sempre disponível, não precisa de nenhum toggle ligado. Diferente de \"@estresse\", que é sempre o SEU próprio Estresse." },
      { token: "@magiasNoGrimorio", desc: "Quantas magias de Mago você tem no Grimório. Ex.: Reserva Azul (+1 Espírito por magia), Adentrar o Infinito (restaura Mana igual a esse número)." },
      { token: "@herancasDeCor", desc: "Quantas Heranças de Cor (Pigmentos) você possui - conta itens do tipo \"cor\" na sua ficha. Sempre disponível." },
      { token: "@alvoCondicoesDiferentes", desc: "Quantos TIPOS diferentes de Condição ativa o alvo selecionado tem (não é acúmulo de uma só - é a contagem de condições distintas) - só funciona com \"Verificar Condição no Alvo\" ligado (não precisa escolher uma Condição de referência pra este)." },
      { token: "@alvoTemCondicao", desc: "1 (verdadeiro) ou 0 (falso) - se o alvo selecionado (tecla T) tem QUALQUER UMA (ou TODAS, conforme a lógica escolhida) das Condições de uma lista - só funciona com \"Verificar Múltiplas Condições no Alvo\" ligado. Ex: \"2d8+(@alvoTemCondicao*2)\" pra +2 de dano fixo se o alvo tiver ao menos uma das condições da lista (lógica \"ou\")." },
      { token: "@euTenhoCondicao", desc: "1 (verdadeiro) ou 0 (falso) - se VOCÊ (quem está usando a Ação, não o alvo) tem a Condição de referência com pelo menos um mínimo de acúmulos - só funciona com \"Verificar Condição em Mim\" ligado. Útil combinado com \"Dano Máximo Condicional\"." },
      { token: "@euTenhoCondicao2", desc: "Mesma coisa que \"@euTenhoCondicao\", mas pra uma SEGUNDA Condição independente (campo \"Verificar Condição em Mim (2ª)\") - use quando a Ação reage diferente a duas Condições distintas (ex: Ímpeto, Empíreo - Profusão Ousada dá +dano, Profusão Retraída dá +alcance)." },
      { token: "Comparação (>=, <=, ==, >, <)", desc: "Qualquer fórmula do sistema (não só \"Dano Máximo Condicional\") aceita comparar dois valores, resultando em 1 (verdadeiro) ou 0 (falso) - ex: \"@alvoAcumulos>=3\" vale 1 se o alvo tiver 3 ou mais acúmulos da Condição de referência. Cada lado pode ser uma expressão inteira (com +, -, *, /, parênteses), não só um número puro." },
      { token: "@aliados_<N>m", desc: "Quantos aliados (mesma disposição - Amigável/Neutro/Hostil - do seu token) estão a até N metros de você (ex: \"@aliados_4m\") - sempre disponível, não precisa de nenhum toggle ligado. Precisa ter um token seu no mapa e controlado pra funcionar." },
      { token: "@contagemArea", desc: "Quantos tokens (filtrados por aliados/inimigos/todos, conforme configurado em \"Contar em Área\") a até um raio configurado de você possuem uma Condição/Efeito específico ativo. Só funciona com \"Contar em Área\" ligado nesta Ação." },
      { token: "@crescimento", desc: "Quantos níveis de Crescimento o jogador escolheu pagar nesta conjuração específica (0 se não usou) - só funciona com \"Crescimento\" ligado nesta Ação. Pra somar um dado extra por nível, escreva entre parênteses antes do \"d\" (ex: \"2d8+(@crescimento)d8\" - os parênteses são obrigatórios, \"@crescimentod8\" sozinho não funciona)." },
      { token: "@custoManaDaAcao", desc: "O custo de Mana desta MESMA Ação (campo \"Custo de Mana\") - só funciona no campo \"Valor do Escudo\" (\"Concede Escudo\" ligado nesta Ação), ex: \"Escudo de Mana\" usa \"@custoManaDaAcao*2\". Útil pra Ações com custo variável, editado pelo jogador antes de usar." },
      { token: "@categoria", desc: "Categoria do monstro (1 a 4) - o campo \"Categoria\" do cabeçalho da ficha de NPC (ou o item \"Categoria N\" em fichas antigas). Funciona em qualquer fórmula." },
      { token: "@vb", desc: "Valor Base da criatura pelo nível (1-5: 3, 6-10: 4, 11-15: 5, 16-18: 6, 19-20: 10, 21-23: 12, 24-26: 15, 27-29: 18, 30: 22) - a escala do criador de monstros. Ex.: Envenenador = \"@vb-1\"." },
      { token: "@danoCat", desc: "Dado de dano da Categoria (1d6 / 2d8 / 3d10 / 4d12; +1 dado a cada 5 níveis a partir do 6) - é um DADO, use só em fórmulas de dano/cura (ex.: \"@danoCat+@poderAtaque\"); num modificador vira 0." },
      { token: "@meioCat", desc: "Metade do dado da Categoria, arredondando para cima (1d6 / 1d8 / 2d10 / 2d12) - para efeitos secundários, dano em área ou sopros." },
      { token: "@estCat", desc: "Estamina extra por ataque da Categoria (+0 / +1 / +2 / +3). Ex.: custo \"1+@estCat\"." },
      { token: "@armaduraCompleta", desc: "1 (verdadeiro) ou 0 (falso) - se você está com Armadura de corpo + Capa + Bota, todas EQUIPADAS ao mesmo tempo (\"Armadura Completa\", Cap. VII do manual). Sempre disponível, não precisa de nenhum toggle ligado." },
      { token: "@atacouNesteTurno", desc: "1 (verdadeiro) ou 0 (falso) - resposta do popup \"Você atacou um inimigo neste turno?\" - só funciona com \"Perguntar Atacou um Inimigo Neste Turno\" ligado nesta Ação." },
      { token: "@quantidadeEscolhida", desc: "O número escolhido no popup de quanto de um recurso gastar - só funciona com \"Escolher Quantidade de Recurso\" ligado nesta Ação." },
      { token: "@rodadaCombate", desc: "O número da rodada ATUAL do combate ativo (1, 2, 3...) - 0 se não houver combate rolando agora. Sempre disponível, em QUALQUER fórmula do sistema (dano, custo, custo pra remover Condição, gatilho, etc), não só numa Ação. Ex: \"1+min(3,max(0,@rodadaCombate-1))\" pra um custo que sobe 1 por rodada, travando em +3." }
    ]
  }
];

const ATRIBUTOS_BONUS = {
  "nenhum": "Nenhum",
  "poderAtaque": "Poder de Ataque",
  "poderMagia": "Poder de Magia",
  "maiorPoder": "Maior Poder (Ataque ou Magia)",
  "vitalidade": "Vitalidade",
  "espirito": "Espírito",
  "forca": "Força",
  "agilidade": "Agilidade",
  "estamina": "Estamina",
  "inteligencia": "Inteligência",
  "destino": "Destino"
};
// Só os 5 atributos BASE (sem meta-atributos nem "Nenhum") - usado pro
// dropdown de "Escolha de Atributo" de uma Peculiaridade (ex:
// Desafortunado: "-1 em atributo à sua escolha" - o jogador escolhe
// aqui, depois de arrastar o item pra ficha dele).
const ATRIBUTOS_BASE_OPCOES = {
  "": "— escolha um —",
  forca: "Força",
  agilidade: "Agilidade",
  estamina: "Estamina",
  inteligencia: "Inteligência",
  destino: "Destino"
};

// Cor fixa por atributo nas barras de recurso do Token (independente de estar
// na Bar 1 ou na Bar 2). Se o atributo escolhido não estiver aqui, cai no
// padrão de CONFIG.Token.barConfig (verde para Bar 1, vermelho para Bar 2).
const BAR_ATTRIBUTE_COLORS = {
  vida: { empty: "#1b4d2e", full: "#4caf50" },          // verde
  estaminaCombate: { empty: "#4d1b1b", full: "#e53935" }, // vermelho
  mana: { empty: "#0d2b4d", full: "#2196f3" },          // azul
  dadosDestino: { empty: "#2e1b4d", full: "#9c27b0" },  // roxo
  stress: { empty: "#4d3300", full: "#ff9800" }         // laranja
};

const MODOS_ROLAGEM = {
  normal: "Normal",
  vantagem: "Facilidade (rola 2d20, usa o maior)",
  desvantagem: "Dificuldade (rola 2d20, usa o menor)"
};

const CALCULO_VIDA_OPCOES = {
  vitalidadeNivel: "Vitalidade × Nível (padrão do sistema)",
  vitalidade: "Somente Vitalidade (sem multiplicar por nível)",
  categoria: "Vitalidade × Categoria (documento de balanceamento)",
  customizado: "Fórmula customizada (ou um número fixo, ex: \"900\")"
};
const CALCULO_MANA_OPCOES = {
  espirito: "Espírito (padrão do sistema)",
  customizado: "Fórmula customizada (ou um número fixo)"
};
const CALCULO_ESTAMINA_COMBATE_OPCOES = {
  estamina: "Atributo Estamina (padrão do sistema)",
  customizado: "Fórmula customizada (ou um número fixo)"
};
const CALCULO_DADOS_DESTINO_OPCOES = {
  destino: "Atributo Destino (padrão do sistema)",
  customizado: "Fórmula customizada (ou um número fixo)"
};

/**
 * Avaliador de expressão aritmética simples (+ - * / e parênteses, com sinal
 * unário) SEM usar eval/Function - usado por naurenInterpretarModificador
 * pra resolver o número final de um campo de bônus/modificador. Só
 * matemática, nunca dados (isso é pra MODIFICAR um atributo, não rolar).
 */
function naurenAvaliarExpressaoSimples(texto) {
  const s = String(texto).replace(/\s+/g, "");
  if (!s) return 0;
  let i = 0;
  function parseNumero() {
    const inicio = i;
    while (i < s.length && /[0-9.]/.test(s[i])) i++;
    if (i === inicio) throw new Error(`número esperado em "${s}" (posição ${i})`);
    return parseFloat(s.slice(inicio, i));
  }
  // "min(a,b)" / "max(a,b)" - só estas duas, e só com exatamente 2
  // argumentos (o suficiente pra travar um valor num teto/piso, ex:
  // Vinhas Sagradas, Druida: "min(3,max(0,@rodadaCombate-1))"). Cada
  // argumento é uma expressão aritmética completa. Checado ANTES de
  // "parseNumero" em parseFator, porque "min"/"max" não começam com
  // dígito nem com os símbolos já tratados ali.
  function tentarParseFuncao() {
    // floor(x) / ceil(x) / round(x) / abs(x): 1 argumento ("metade do Espírito, para cima" etc.).
    for (const [fn, f] of [["floor", Math.floor], ["ceil", Math.ceil], ["round", Math.round], ["abs", Math.abs]]) {
      if (s.slice(i, i + fn.length + 1) !== fn + "(") continue;
      i += fn.length + 1;
      const v = parseExpressao();
      if (s[i] !== ")") throw new Error(`parêntese não fechado em "${fn}()" em "${s}"`);
      i++;
      return f(v);
    }
    const nome = s.slice(i, i + 3);
    if ((nome !== "min" && nome !== "max") || s[i + 3] !== "(") return null;
    i += 4; // pula "min(" ou "max("
    const a = parseExpressao();
    if (s[i] !== ",") throw new Error(`"${nome}()" precisa de 2 argumentos separados por vírgula em "${s}"`);
    i++;
    const b = parseExpressao();
    if (s[i] !== ")") throw new Error(`parêntese não fechado em "${nome}()" em "${s}"`);
    i++;
    return nome === "min" ? Math.min(a, b) : Math.max(a, b);
  }
  function parseFator() {
    if (s[i] === "(") {
      i++;
      const v = parseComparacao(); // 0.94.2: "(@nivel>=19)" dentro de uma soma vale 1 ou 0
      if (s[i] !== ")") throw new Error(`parêntese não fechado em "${s}"`);
      i++;
      return v;
    }
    if (s[i] === "-") { i++; return -parseFator(); }
    if (s[i] === "+") { i++; return parseFator(); }
    const viaFuncao = tentarParseFuncao();
    if (viaFuncao !== null) return viaFuncao;
    return parseNumero();
  }
  function parseTermo() {
    let v = parseFator();
    while (s[i] === "*" || s[i] === "/") {
      const op = s[i]; i++;
      v = op === "*" ? v * parseFator() : v / parseFator();
    }
    return v;
  }
  function parseExpressao() {
    let v = parseTermo();
    while (s[i] === "+" || s[i] === "-") {
      const op = s[i]; i++;
      v = op === "+" ? v + parseTermo() : v - parseTermo();
    }
    return v;
  }
  // Comparação (>=, <=, ==, >, <) - um NÍVEL ACIMA da aritmética normal,
  // pensado pra fórmulas booleanas tipo "Dano Máximo Condicional" (ex:
  // "@alvoAcumulos>=3" -> 1 se o alvo tiver 3+ acúmulos, senão 0). Cada
  // lado da comparação ainda é uma expressão aritmética completa (pode
  // ter +/-/*//, parênteses, etc.) - só o OPERADOR de comparação em si é
  // novo. Checa ">="/"<=" ANTES de ">"/"<" isolados, senão cortaria o "="
  // sobrando sem interpretar.
  function parseComparacao() {
    const v = parseExpressao();
    const doisChar = s.slice(i, i + 2);
    if (doisChar === ">=" || doisChar === "<=" || doisChar === "==") {
      i += 2;
      const v2 = parseExpressao();
      if (doisChar === ">=") return v >= v2 ? 1 : 0;
      if (doisChar === "<=") return v <= v2 ? 1 : 0;
      return v === v2 ? 1 : 0;
    }
    if (s[i] === ">" || s[i] === "<") {
      const op = s[i]; i++;
      const v2 = parseExpressao();
      return op === ">" ? (v > v2 ? 1 : 0) : (v < v2 ? 1 : 0);
    }
    return v;
  }
  const resultado = parseComparacao();
  if (i !== s.length) throw new Error(`sobrou "${s.slice(i)}" sem interpretar em "${s}"`);
  return resultado;
}

/**
 * Resolve o valor ATUAL de um "@token" de fórmula, dado o ator - função
 * ÚNICA usada tanto pelas fórmulas de Ação (Dano/Cura/Ataque, ver
 * _substituirAtributosNaFormula) quanto pelos modificadores de Efeito/
 * Condição/Pigmento/Bônus Manual (ver naurenInterpretarModificador) - as
 * DUAS pontas de entrada de fórmula do sistema usam esta MESMA lista,
 * garantindo que "@vida" (por exemplo) signifique a mesma coisa em
 * QUALQUER lugar que você escrever. Nomes não reconhecidos viram 0
 * silenciosamente. "@rank" (rank do ITEM que tem a fórmula) e
 * "@alvoAcumulos" (acúmulos da Condição de referência no alvo mirado) são
 * tratados À PARTE antes de chegar aqui, pois dependem de contexto que só
 * quem está montando a fórmula (o item, a Ação) tem - ver os pontos de
 * chamada.
 */
/**
 * Sanitiza uma string (tipicamente um UUID de item, formato
 * "Actor.<id>.Item.<id>") pra uso seguro como CHAVE de objeto dentro de
 * uma Flag - o Foundry (no update/setFlag) trata pontos em chaves de
 * objeto como caminhos aninhados e EXPANDE eles automaticamente
 * ("{'Actor.xxx.Item.yyy': true}" vira "{Actor: {xxx: {Item: {yyy:
 * true}}}}" por baixo dos panos, silenciosamente) - qualquer Flag que
 * use um UUID como chave direta precisa passar por aqui primeiro, dos
 * dois lados (escrita E leitura), senão a chave nunca bate de volta.
 */
function naurenChaveFlagSegura(texto) {
  return String(texto ?? "").replace(/\./g, "_");
}

/**
 * Identificador único do TURNO atual do combate ativo (combate x rodada
 * x turno), ou null se não houver combate rolando. Usado pra Bônus "1x
 * por turno" (ver campoAcao > concedeBonusTesteArea, ex: Presença) -
 * comparar esse identificador (salvo no momento do uso) contra o atual
 * é mais robusto do que uma Flag booleana "já usei" que precisa de um
 * hook pra ser limpa manualmente: aqui não tem "resetar" nenhum, só
 * comparar - o identificador muda sozinho a cada turno de QUALQUER
 * combatente (uma rodada tem o turno de todo mundo, então "1x por
 * turno" já fica automaticamente mais frequente que "1x por rodada").
 */
function naurenIdentificadorTurnoAtual() {
  const combate = game.combat;
  if (!combate || !combate.started) return null;
  return `${combate.id}:${combate.round}:${combate.turn}`;
}

/**
 * Distância BORDA-A-BORDA entre dois pontos/tokens, em unidades da cena
 * (metros) - corrige o bug de medir sempre centro-a-centro, que soma
 * distância fantasma quando um dos dois é um token GRANDE (2x2, 3x3):
 * um alvo 3x3 "do lado" do atacante mediria ~3m de centro a centro
 * mesmo estando literalmente adjacente, porque o centro dele fica bem
 * mais longe que a borda mais próxima.
 * Aceita tanto um Token/TokenDocument (usa o footprint real, W×H em
 * quadrados) quanto um ponto simples {x,y} (footprint de 1 ponto, sem
 * área) - cobre os dois casos já usados no sistema (token-a-token e
 * ponto-a-token, ex: centro de um Template).
 */
function naurenMedirDistanciaBordas(a, b) {
  if (!a || !b || !canvas?.grid) return Infinity;
  const paraRetangulo = (obj) => {
    // Token/TokenDocument tem "x"/"y" (canto superior esquerdo, não o
    // centro) e "document.width"/"document.height" em QUADRADOS - já
    // "obj.document" existe direto num TokenDocument também (self).
    const doc = obj.document ?? obj;
    if (doc?.width && canvas.grid.sizeX) {
      const larguraPx = doc.width * canvas.grid.sizeX;
      const alturaPx = doc.height * canvas.grid.sizeY;
      return { x1: doc.x, y1: doc.y, x2: doc.x + larguraPx, y2: doc.y + alturaPx };
    }
    // Ponto simples (sem footprint) - trata como um retângulo de área 0
    // centrado nele mesmo (ex: {x,y} do centro de um Template).
    const px = obj.x ?? obj.center?.x ?? 0;
    const py = obj.y ?? obj.center?.y ?? 0;
    return { x1: px, y1: py, x2: px, y2: py };
  };
  const ra = paraRetangulo(a);
  const rb = paraRetangulo(b);
  // Vão entre as BORDAS, contado em quadrados e com a regra de diagonal da cena
  // (a mesma da régua do Foundry) - não em linha reta (dava "7m e pouco" na diagonal).
  const dx = Math.max(ra.x1 - rb.x2, rb.x1 - ra.x2, 0);
  const dy = Math.max(ra.y1 - rb.y2, rb.y1 - ra.y2, 0);
  let vao;
  try { vao = canvas.grid.measurePath([{ x: 0, y: 0 }, { x: dx, y: dy }])?.distance; } catch (err) { vao = undefined; }
  if (!Number.isFinite(vao)) vao = Math.max(dx / (canvas.grid.sizeX || canvas.grid.size), dy / (canvas.grid.sizeY || canvas.grid.size)) * canvas.grid.distance;
  // 0.108.2 — andares/altura: soma a diferença de altura (elevação, em metros) entre os dois, como a régua 3D do
  // Foundry (mesma regra de diagonal da cena). Ponto sem altura (centro de área) conta como na mesma altura.
  const ea = Number((a.document ?? a)?.elevation), eb = Number((b.document ?? b)?.elevation);
  const dz = Number.isFinite(ea) && Number.isFinite(eb) ? Math.abs(ea - eb) : 0;
  if (dz > 0) {
    let v3;
    try { v3 = canvas.grid.measurePath([{ x: 0, y: 0, elevation: 0 }, { x: dx, y: dy, elevation: dz }])?.distance; } catch (err) { v3 = undefined; }
    vao = Number.isFinite(v3) && v3 > vao ? v3 : Math.max(vao, Math.hypot(vao, dz));
  }
  // +1 quadrado: tokens lado a lado estão a 1m (alcance corpo a corpo, como sempre foi calibrado).
  return Math.round((vao + canvas.grid.distance) * 100) / 100;
}


/**
 * Formata uma Roll já avaliada como texto auditável (mostra cada dado
 * rolado e cada bônus fixo, ex: "1d20(4) + 5 + 4") - extraído de
 * NaurenActorSheet#_rollToBreakdownText (que agora só chama esta versão
 * global) pra poder ser usado também em contextos ESTÁTICOS, sem uma
 * instância de ficha (ex: NaurenAlvoHelper._aplicarReacaoDano, que roda
 * pro Ator que está DEFENDENDO, resolvendo Bloqueio/Esquiva/Esquiva
 * Instintiva com o dado e o bônus sempre visíveis no chat).
 */
/**
 * Escreve "valor" dentro de "raiz" navegando "caminho" (ex:
 * "acoes.1.gastosRecurso.0.quantidade") NA MÃO, sem usar
 * foundry.utils.setProperty nem qualquer forma de update() com chave
 * "dot-path" contendo índice de array. Bug real corrigido (achado num
 * teste ao vivo, com log de diagnóstico confirmando: a escrita de um
 * upgrade de Subclasse com "campoCustomizado" mirando um índice de
 * array NUNCA persistia de verdade, voltando pro valor de antes mesmo
 * imediatamente depois de escrever) - não dava pra confirmar com certeza
 * se a causa era o setProperty do Foundry não reconhecendo "1"/"0" como
 * índice de array numa estrutura array-dentro-de-array, ou outra coisa
 * por baixo dos panos; em vez de continuar tentando adivinhar, esta
 * função nunca delega essa navegação pra nenhum utilitário externo -
 * cada segmento numérico ("0", "1"...) é convertido pra Number ANTES de
 * indexar, garantindo acesso de array de verdade (nunca uma chave de
 * texto tipo "1" virando propriedade de objeto por engano).
 */
function naurenDefinirCaminhoProfundo(raiz, caminho, valor) {
  const partes = caminho.split(".");
  let atual = raiz;
  for (let i = 0; i < partes.length - 1; i++) {
    const parteEhIndice = /^\d+$/.test(partes[i]);
    const chave = parteEhIndice ? Number(partes[i]) : partes[i];
    if (atual[chave] === undefined || atual[chave] === null) {
      const proximaParteEhIndice = /^\d+$/.test(partes[i + 1]);
      atual[chave] = proximaParteEhIndice ? [] : {};
    }
    atual = atual[chave];
  }
  const ultimaParteEhIndice = /^\d+$/.test(partes[partes.length - 1]);
  const ultimaChave = ultimaParteEhIndice ? Number(partes[partes.length - 1]) : partes[partes.length - 1];
  atual[ultimaChave] = valor;
}

function naurenRollToBreakdownText(roll) {
  return naurenRollToBreakdownTextBruto(roll).replace(/\+\s*-\s*(?=\d)/g, "− ");
}
function naurenRollToBreakdownTextBruto(roll) {
  return roll.terms.map(t => {
    if (t.results?.length) {
      const vals = t.results.filter(r => r.active !== false).map(r => r.result);
      return `${t.number}d${t.faces}(${vals.join(",")})`;
    }
    if (typeof t.operator === "string") return t.operator;
    if (t.number !== undefined) return String(t.number);
    return t.expression ?? "";
  }).join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Breakdown ROBUSTO pra fórmulas SIMPLES (dado + modificador fixo, ex:
 * "-1d6", "-1d6-2", "2d8+3") - usado em Gasto de Recurso, onde uma
 * fórmula com sinal invertido pra representar concessão (ex: "-1d6-2")
 * fazia "naurenRollToBreakdownText" andar por "roll.terms" (Dado,
 * Operador "*", Número "-1" - é assim que o Foundry normaliza um "-"
 * na frente de um termo, virando multiplicação) e mostrar algo tipo
 * "1d6 * -1" sem o valor do dado NUNCA aparecer nem antes. Em vez de
 * tentar reconstruir a sequência de termos igual do jeito genérico,
 * usa "roll.dice" (só os termos de dado de verdade, sempre populado
 * certo depois de evaluate()) e calcula o modificador fixo por
 * diferença (total - soma dos dados) - nunca precisa adivinhar como o
 * Foundry estruturou operadores/multiplicação por dentro.
 *
 * "usarValorAbsoluto": quando a fórmula original tinha o "-" na frente
 * negando TUDO (uma concessão, ex: "-1d6-3"), "roll.total" vem negativo
 * (ex: -8 pra um dado 5 + bônus 3), enquanto a soma dos dados
 * ("roll.dice") sempre reporta a face de verdade, sempre POSITIVA (5) -
 * usar o total negativo direto dava "modificador fixo" sem sentido (ex:
 * -8 - 5 = -13, nunca o "+3" esperado). Usar o valor ABSOLUTO do total
 * como referência resolve os dois casos com a mesma conta: dado(5) +
 * modificador(3) = |−8| = 8, bate certo.
 */
/**
 * Texto de auditoria de uma rolagem qualquer: dados com o valor de cada
 * face + modificador fixo; sem dados, só o total. Sinal negativo à frente
 * (concessão) é tratado pelo valor absoluto.
 */
function naurenTextoRolagem(roll) {
  if (!roll) return "";
  if (!(roll.dice ?? []).length) return String(roll.total ?? 0);
  return naurenBreakdownSimples(roll, (roll.total ?? 0) < 0);
}

function naurenBreakdownSimples(roll, usarValorAbsoluto = false) {
  const dados = roll.dice ?? [];
  const partesDados = dados.map(t => {
    const vals = (t.results ?? []).filter(r => r.active !== false).map(r => r.result);
    return `${t.number}d${t.faces}(${vals.join(",")})`;
  });
  const somaDados = dados.reduce((soma, t) => soma + (t.results ?? []).filter(r => r.active !== false).reduce((s, r) => s + r.result, 0), 0);
  const totalReferencia = usarValorAbsoluto ? Math.abs(roll.total ?? 0) : (roll.total ?? 0);
  const modificadorFixo = Math.round(totalReferencia - somaDados);
  const partes = [...partesDados];
  if (modificadorFixo !== 0 || !partesDados.length) {
    partes.push(modificadorFixo >= 0 ? `+${modificadorFixo}` : `${modificadorFixo}`);
  }
  return partes.join(" ").trim();
}

/**
 * Resolve um UUID (de Condição, Efeito, Habilidade etc.) pro nome
 * legível "Nome (Tipo)" - extraído pra função global (era um método só
 * de NaurenItemSheet) pra ser reaproveitado também por
 * NaurenActorSheet (ex: NaurenActorSheet#_popupEscolherEfeito), que
 * antes chamava "this._nomeParaUuid" sem esse método existir ali,
 * quebrando com "is not a function" toda vez que "Marca do Caçador"
 * era usada.
 */
async function naurenNomeParaUuid(uuid) {
  if (!uuid) return "";
  try {
    const doc = await fromUuid(uuid);
    if (!doc) return "⚠ não encontrado";
    const tipo = doc.type === "condicao" ? "Condição" : doc.type === "efeito" ? "Efeito" : doc.type;
    return `${doc.name} (${tipo})`;
  } catch (err) {
    return "⚠ UUID inválido";
  }
}

function naurenResolverTokenFormula(nome, actor) {
  // "@rodadaCombate" é global (não depende de nenhum Ator específico) -
  // resolvida ANTES do "if (!actor)" abaixo, que bloquearia qualquer
  // token nesse caso. 0 fora de combate (ex: Vinhas Sagradas, Druida -
  // "aumenta em 1 o custo pra cada rodada do combate").
  if (nome === "rodadaCombate") return game.combat?.round ?? 0;
  if (!actor) return 0;
  const sys = actor.system;
  // "@aliados_<N>m" também em Efeitos/Condições da ficha (ex.: Muralha de Escudos: +1 Defesa por aliado a 6 m).
  { const mA = /^aliados_(\d+(?:\.\d+)?)m$/.exec(nome); if (mA) { try { return canvas?.ready ? naurenContarAliadosProximos(actor, Number(mA[1])) : 0; } catch (err) { return 0; } } }
  // 0.94.3: "@equipados_Capa" = quantas armaduras deste tipo estão equipadas (Alcançar os Céus).
  { const mE = /^equipados_(.+)$/.exec(nome); if (mE) { const tipo = naurenNomeNormalizado(mE[1].replace(/_/g, " ")); return (actor.items ?? []).filter(i => i.type === "armadura" && i.system.equipado && naurenNomeNormalizado(i.system.tipo ?? "") === tipo).length; } }
  // Enquanto o Ator prepara os dados, os derivados ainda não estão prontos: usa os da preparação anterior.
  if (actor._naurenPreparando && actor._naurenMetaPrep && nome in actor._naurenMetaPrep) return actor._naurenMetaPrep[nome];
  // 0.94.24: "PdA ou PdM" do livro - o maior dos dois (ataque de Condição de item sem arma).
  if (nome === "maiorPoder") return Math.max(Number(naurenResolverTokenFormula("poderAtaque", actor)) || 0, Number(naurenResolverTokenFormula("poderMagia", actor)) || 0);
  switch (nome) {
    // Atributos base - sempre o TOTAL já com bônus/efeitos, nunca o valor
    // bruto editável (o mesmo número que aparece na ficha).
    case "forca": case "agilidade": case "estamina": case "inteligencia": case "destino":
      return sys.atributosTotais?.[nome] ?? sys.atributos?.[nome]?.value ?? 0;
    // Quantidade de itens de "Como o destino te tratou até agora?" (Cap.
    // II do manual) - tabela em degraus, NÃO o valor bruto do atributo
    // Destino: 1-2 -> 1 item, 3-4 -> 2, 5-6 -> 3, 7-8 -> 4 (e continua na
    // mesma proporção acima de 8). Token separado de "@destino" de
    // propósito - "@destino" continua sendo o valor bruto do atributo em
    // qualquer outra fórmula do sistema (dano, custo, etc), só este uso
    // específico (equipamento inicial) segue a tabela do manual.
    case "destinoItensIniciais": {
      const destinoBruto = sys.atributosTotais?.destino ?? sys.atributos?.destino?.value ?? 0;
      return Math.max(0, Math.ceil(destinoBruto / 2));
    }
    // Meta-atributos
    case "espirito": return sys.espirito?.max ?? 0;
    case "poderAtaque": return sys.poderAtaque?.value ?? 0;
    case "poderMagia": return sys.poderMagia?.value ?? 0;
    case "vitalidade": return sys.vitalidade?.max ?? 0;
    // Recursos - "atual" (o número que sobe e desce em combate) e "Max"
    // (o teto) são tokens SEPARADOS de propósito, pra nunca confundir.
    case "vida": return sys.vida?.value ?? 0;
    case "vidaMax": return sys.vida?.max ?? 0;
    case "mana": return sys.mana?.value ?? 0;
    case "manaMax": return sys.mana?.max ?? 0;
    case "estaminaCombate": return sys.estaminaCombate?.value ?? 0;
    case "estaminaCombateMax": return sys.estaminaCombate?.max ?? 0;
    case "dadosDestino": return sys.dadosDestino?.value ?? 0;
    case "dadosDestinoMax": return sys.dadosDestino?.max ?? 0;
    // Defesa/Movimento - sempre o TOTAL já com bônus/efeitos.
    case "defesa": return sys.defesaTotal ?? sys.defesa ?? 0;
    case "movimento": return sys.movimentoTotal ?? sys.movimento ?? 0;
    // Estresse
    case "estresse": return sys.stress?.value ?? 0;
    case "estresseMax": return sys.stress?.max ?? 0;
    // Limiar de Deflexão
    case "limiarDeflexao": return sys.limiarDeflexaoTotal ?? 0;
    case "reducaoDano": return sys.reducaoDanoTotal ?? 0;
    case "reducaoDanoPercentual": return sys.reducaoDanoPercentualTotal ?? 0;
    case "danoRecebido": return sys.danoRecebidoTotal ?? 0;
    case "curaRecebidaPercentual": return sys.curaRecebidaPercentualTotal ?? 0;
    // Nível do PERSONAGEM (não confundir com "@rank", que é do ITEM)
    case "nivel": return sys.nivel ?? 1;
    // Escala de monstro (criador de monstros): Valor Base pelo nível e Categoria 1-4
    // (campo da ficha ou item "Categoria N"). @danoCat/@meioCat são DADOS ("2d8"): só
    // servem em fórmulas de dado (dano, cura, gatilhos); num modificador viram 0.
    case "vb": case "valorBase": return sys.valorBase ?? naurenValorBasePorNivel(sys.nivel ?? 1);
    case "categoria": return sys.categoriaTotal ?? naurenCategoriaDoAtor(actor);
    case "danoCat": return (sys.escalaMonstro ?? naurenEscalaPorCategoria(sys.categoriaTotal ?? 1)).danoCat;
    case "meioCat": return (sys.escalaMonstro ?? naurenEscalaPorCategoria(sys.categoriaTotal ?? 1)).meioCat;
    case "estCat": return (sys.escalaMonstro ?? naurenEscalaPorCategoria(sys.categoriaTotal ?? 1)).estCat;
    // Quantas Heranças de Cor (Pigmentos, itens tipo "cor") o personagem
    // possui - ex: Tinta Energética (Místico), "1 Energia por Herança de
    // Cor que possua".
    case "herancasDeCor": return actor.items.filter(i => i.type === "cor").length;
    case "magiasNoGrimorio": return actor.items.filter(i => i.type === "magia" && i.system.ehMagiaDeMago).length;
    // Dano que a penitência acabou de causar (Halo: "cada inimigo sofre o mesmo dano").
    case "danoPenitencia": return Number(actor._naurenContextoGatilho?.danoPenitencia) || 0;
    // 1 (verdadeiro) ou 0 (falso) - "Armadura Completa" (Cap. VII do
    // manual): usando Armadura de corpo (Tecido/Couro/Malha/Placa) +
    // Capa + Bota, todas as 3 EQUIPADAS ao mesmo tempo. Ex: Resiliente
    // (Guerreiro) - "enquanto estiver usando armadura completa, seu
    // limite de Estresse aumenta em 1" - use em qualquer Modificador,
    // ex: "1*@armaduraCompleta" (0 ou o valor, nunca fracionado).
    case "armaduraCompleta": {
      const equipadas = actor.items.filter(i => i.type === "armadura" && i.system.equipado);
      const temCorpo = equipadas.some(i => ["Tecido", "Couro", "Malha", "Placa"].includes(i.system.tipo));
      const temCapa = equipadas.some(i => i.system.tipo === "Capa");
      const temBota = equipadas.some(i => i.system.tipo === "Bota");
      return (temCorpo && temCapa && temBota) ? 1 : 0;
    }
    default:
      // Recursos Customizados - "@recurso_<id>" pro valor ATUAL,
      // "@recurso_<id>Max" pro teto (mesmo padrão de Vida/Mana/etc). "id" é
      // o mesmo definido em NaurenSubclasseData#recursosDeclarados.
      if (nome.startsWith("recurso_")) {
        const ehMax = nome.endsWith("Max");
        const id = ehMax ? nome.slice(8, -3) : nome.slice(8);
        const recurso = (sys.recursosCustom ?? []).find(r => r.id === id);
        if (!recurso) return 0;
        if (!ehMax && actor._naurenRecursosNoInicio && id in actor._naurenRecursosNoInicio) return actor._naurenRecursosNoInicio[id];
        return ehMax ? (recurso.max ?? 0) : (recurso.valor ?? 0);
      }
      return 0;
  }
}

/**
 * Interpreta um campo de bônus/modificador flexível (usado nos 18 campos
 * compartilhados de Bônus Manual/Efeito/Condição/Pigmento - Ataque, Defesa,
 * Bloqueio, Esquiva, Pontos de Subclasse, Movimento, os 5 Atributos e os 4
 * Meta-atributos, Vida, Mana, Estresse). Convenção:
 *
 * - "+2", "-3", ou um número/fórmula SEM NENHUM sinal na frente (ex: "2",
 *   "@destino"): tudo isso SOMA (ou subtrai) do que já estava calculado -
 *   comportamento tradicional de bônus, empilha com outras fontes. Um "0"
 *   sozinho continua sendo "sem bônus nenhum", exatamente como sempre foi.
 * - Começa com "=" (ex: "=0", "=10", "=@inteligencia"): TRAVA o campo
 *   exatamente naquele valor, ignorando a base e qualquer bônus aditivo de
 *   QUALQUER fonte pra aquele mesmo campo. "=0" trava em zero (ex:
 *   paralisia total), "=@inteligencia" trava sempre igual à Inteligência
 *   atual. Precisa do "=" na frente de propósito - assim um "0" ou "10"
 *   digitado sem querer (ou vindo de uma ficha antiga, de antes desse
 *   recurso existir) nunca é confundido com "travar nesse valor".
 * - Aceita @nomeDoAtributo dentro da expressão (ver
 *   naurenResolverTokenFormula pra lista completa - a mesma aba "Consultar
 *   Fórmulas" na ficha documenta tudo pro jogador).
 * - Aceita também "@rank" quando "item" for informado (só existe em Efeito,
 *   por enquanto) - resolve pro rank ATUAL daquele item, permitindo um
 *   bônus crescer sozinho conforme o rank sobe (ex: "+@rank*2").
 * - Vazio ("") não faz nada, igual não preencher o campo.
 *
 * Devolve null (nada a fazer) ou {tipo: "somar"|"fixar", valor: number}.
 */
/**
 * Parte COMPARTILHADA de interpretar um modificador: detecta o prefixo "="
 * (fixar), e substitui @rank/@acumulos/@atributo pelo valor NUMÉRICO atual
 * - mas NÃO resolve o resultado final ainda (isso cabe a cada chamador:
 * "naurenInterpretarModificador", síncrona, sem suporte a dado, usada em
 * TODO lugar que roda dentro de "prepareDerivedData" - Efeito/Condição/
 * Pigmento/Bônus Manual - já que o Foundry exige que isso seja síncrono;
 * ou "naurenInterpretarModificadorComDado", assíncrona, COM suporte a
 * dado via Roll de verdade, usada só onde já se está dentro de uma
 * função "async" de qualquer forma - hoje, a quantidade concedida por um
 * Gatilho por Evento). Devolve "null" se não sobrar nada útil pra
 * resolver (texto vazio), ou "{ ehFixar, bruto }" com os tokens já
 * substituídos, prontos pra avaliação final.
 */
function naurenPrepararModificador(texto, actor, item) {
  if (texto === undefined || texto === null) return null;
  let bruto = String(texto).trim();
  if (!bruto) return null;

  const ehFixar = bruto[0] === "=";
  if (ehFixar) bruto = bruto.slice(1).trim();
  if (!bruto) return null; // só um "=" sozinho, sem nada depois - ignora

  if (/@rank\b/i.test(bruto)) {
    bruto = bruto.replace(/@rank\b/gi, String(item?.system?.rankAtual ?? 0));
  }
  // "@acumulos" - só faz sentido dentro de um item de Condição
  // (o único tipo com esse campo) - resolve pro número de acúmulos ATUAL
  // daquela mesma Condição. Fora de Condição vira 0, igual @rank em item
  // sem rank. Principal uso: venenos e outras Condições que reduzem um
  // atributo (Defesa, Movimento etc) proporcionalmente ao próprio acúmulo,
  // ex: "-@acumulos" na Defesa.
  if (/@acumulos\b/i.test(bruto)) {
    bruto = bruto.replace(/@acumulos\b/gi, String(item?.system?.acumulos ?? 0));
  }
  if (actor && /@\w+/.test(bruto)) {
    bruto = bruto.replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, actor)));
  }

  return { ehFixar, bruto };
}

const naurenModificadoresAvisados = new Set();
function naurenInterpretarModificador(texto, actor, item = null) {
  const preparado = naurenPrepararModificador(texto, actor, item);
  if (!preparado) return null;

  let valor;
  try {
    valor = naurenAvaliarExpressaoSimples(preparado.bruto);
  } catch (err) {
    // Dados em Modificador (ex.: "1d6" de Esquiva Elegante) são rolados na hora da reação, não na ficha:
    // avisa uma vez só por texto, em vez de a cada atualização da ficha.
    if (!/\d*d\d+/i.test(String(texto)) && !naurenModificadoresAvisados.has(String(texto))) { // dado: esperado (rola na hora), sem aviso
      naurenModificadoresAvisados.add(String(texto));
      console.warn(`Nauren RPG | Não consegui interpretar o modificador "${texto}" - tratando como 0 na ficha (dados são rolados na hora).`, err);
    }
    valor = 0;
  }
  if (!Number.isFinite(valor)) valor = 0;

  return { tipo: preparado.ehFixar ? "fixar" : "somar", valor: Math.round(valor) };
}

/**
 * Igual "naurenInterpretarModificador", mas ASSÍNCRONA e com suporte a
 * dado de verdade (ex: "1d4+2", "2d6*@rank") - usa o motor de rolagem do
 * Foundry (Roll) em vez do parser aritmético simples. Só pode ser usada
 * em contextos que já são "async" (Gatilhos por Evento, Emanação,
 * Template Persistente) - NUNCA dentro de "prepareDerivedData"
 * (Efeito/Condição/Pigmento/Bônus Manual), que o Foundry exige síncrono.
 * Em caso de fórmula inválida, devolve valor 0 (mesmo comportamento da
 * versão síncrona) em vez de lançar erro pra quem chamou.
 */
async function naurenInterpretarModificadorComDado(texto, actor, item = null) {
  const preparado = naurenPrepararModificador(texto, actor, item);
  if (!preparado) return null;

  let valor = 0;
  let breakdown = "";
  try {
    const roll = await new Roll(preparado.bruto).evaluate();
    valor = roll.total;
    breakdown = naurenTextoRolagem(roll);
    if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true).catch(() => {});
  } catch (err) {
    console.warn(`Nauren RPG | Não consegui rolar o modificador "${texto}" - tratando como 0.`, err);
    valor = 0;
  }
  if (!Number.isFinite(valor)) valor = 0;

  return { tipo: preparado.ehFixar ? "fixar" : "somar", valor: Math.round(valor), breakdown };
}

/**
 * Calcula a Vida máxima BASE (antes dos bônus manuais/efeitos de "vida
 * extra"), a partir da Vitalidade já finalizada (com bônus/efeitos) e do
 * Nível do personagem, respeitando a opção escolhida na aba Opções.
 */
/**
 * Acha, numa lista de entradas {rank, [campo]}, a de MAIOR rank que ainda
 * seja <= rankAtual - usado tanto pelas Ações (Dano/Cura/Ataque "Por Rank")
 * quanto pela Defesa por Rank da Armadura. Função solta (não um método da
 * ficha) porque também precisa rodar dentro de NaurenActor#prepareDerivedData,
 * que opera no documento, não na ficha.
 */
function naurenResolverPorRank(lista, rankAtual, campo = "formula") {
  if (!lista?.length || !rankAtual) return null;
  const validas = lista.filter(e => (e.rank ?? 0) <= rankAtual && (e[campo] || e[campo] === 0));
  if (!validas.length) return null;
  return validas.reduce((maior, atual) => (atual.rank > maior.rank ? atual : maior))[campo];
}

/**
 * Compara um "itemAlvoUuid" configurado por um autor (o UUID do item no
 * Compêndio, arrastado na hora de montar um Modificador Externo/Gatilho
 * de Template Persistente numa Subclasse) contra um item de VERDADE que
 * um Ator específico tem na ficha. NUNCA são o mesmo UUID: toda cópia
 * concedida a um Ator (Classe, Subclasse, level-up) ganha seu PRÓPRIO
 * UUID (Actor.X.Item.Y) na hora de ser criada, diferente do UUID do
 * Compêndio de origem. Confere três coisas: (1) o UUID direto (cobre o
 * caso raro de um Efeito apontar pra um item que já é dele mesmo); (2)
 * "flags.nauren.origemUuid" (NaurenConcessaoHelper.concederItem grava a
 * origem de TODA concessão automática, inclusive as de nível de Classe -
 * ver linha ~4550); (3) "flags.core.sourceId" (o próprio Foundry grava
 * isso em qualquer item importado de Compêndio, cobre o caso de o item
 * ter sido arrastado manualmente em vez de concedido pelo sistema). Bug
 * real corrigido: sem isso, NENHUM Modificador Externo/Gatilho que
 * aponte pra uma Magia/Habilidade de CLASSE (em vez de um item concedido
 * pelo PRÓPRIO nó de Subclasse, cujo UUID só existe depois de concedido)
 * funcionava de verdade - ex: Abundância de Vida (Druida) nunca
 * encontrava a cópia de Infusão Floral na ficha do jogador, porque
 * comparava contra o UUID do Compêndio.
 */
function naurenItemCorrespondeAoAlvo(item, alvoUuid) {
  if (!item || !alvoUuid) return false;
  // 0.110: alvo composto dos itens que modificam habilidade (seedId|uuid|tipo|nome) - ver modulos/aprimoramentos.mjs.
  if (String(alvoUuid).startsWith("alvo:")) return naurenCorrespondeAlvoComposto(item, alvoUuid);
  return item.uuid === alvoUuid ||
    item.getFlag("nauren", "origemUuid") === alvoUuid ||
    item.getFlag("core", "sourceId") === alvoUuid ||
    item._stats?.compendiumSource === alvoUuid;
}

/**
 * Mesma lógica de naurenResolverPorRank (pega a entrada de maior "gatilho"
 * que ainda seja <= o valor atual), mas indexada por NÍVEL DE PERSONAGEM
 * (campo "nivel" de cada entrada) em vez de RANK DO ITEM - existe porque
 * nível é uma propriedade do ATOR (actor.system.nivel), não do item, então
 * não faz sentido reaproveitar a mesma chave "rank" (ficaria confuso editar
 * uma tabela "por rank" que na prática representa níveis de Classe). Usada
 * por "Usos Máximos por Nível" e "Custo por Nível" (ver campoAcao) - ex:
 * Comungar (Druida), cujos usos por dia e custo de Estamina mudam conforme
 * o nível do personagem, não um rank de Subclasse investido.
 */
function naurenResolverPorNivel(lista, nivelAtual, campo = "valor") {
  if (!lista?.length || !nivelAtual) return null;
  const validas = lista.filter(e => (e.nivel ?? 0) <= nivelAtual && (e[campo] || e[campo] === 0));
  if (!validas.length) return null;
  return validas.reduce((maior, atual) => (atual.nivel > maior.nivel ? atual : maior))[campo];
}

/**
 * Falsificar Seu Destino: em que nível a Classe concede a Habilidade, e com
 * que rank ela está nesse nível (upgradesDeRank até ele). null = a Classe não
 * concede (ex.: veio de Subclasse ou foi arrastada à mão).
 */
function naurenNivelDeOrigemNaClasse(classe, hab) {
  const niveis = [...(classe?.system?.niveis ?? [])].sort((a, b) => (a.nivel ?? 0) - (b.nivel ?? 0));
  const casa = u => u && (naurenItemCorrespondeAoAlvo(hab, u) || fromUuidSync(u, { strict: false })?.name === hab.name);
  const entrada = niveis.find(n => (n.itensConcedidos ?? []).some(c => casa(c.uuid)));
  if (!entrada) return null;
  let rank = 1;
  for (const n of niveis) {
    if ((n.nivel ?? 0) > entrada.nivel) break;
    for (const up of n.upgradesDeRank ?? []) if (casa(up.uuidOrigem)) rank = Math.max(rank, Number(up.novoRank) || 1);
  }
  return { nivel: entrada.nivel, rank };
}

/**
 * Congela um "system" de item num nível fixo: cada tabela "por nível" vira uma
 * entrada só (o valor desse nível) e "@nivel" nas fórmulas vira o número.
 * Assim a cópia nunca sobe com o nível de quem a tem (Falsificar Seu Destino).
 */
function naurenCongelarNoNivel(system, nivel) {
  const TABELAS = ["usosMaxPorNivel", "custoEstaminaPorNivel", "custoManaPorNivel"];
  const congelarTabela = lista => {
    if (!Array.isArray(lista) || !lista.length) return lista;
    const validas = lista.filter(e => (e.nivel ?? 0) <= nivel);
    if (!validas.length) return [];
    const e = validas.reduce((m, a) => ((a.nivel ?? 0) > (m.nivel ?? 0) ? a : m));
    return [{ ...e, nivel: 1 }];
  };
  const andar = (obj, chave) => {
    if (typeof obj === "string") return chave === "descricao" ? obj : obj.replace(/@nivel\b/g, String(nivel));
    if (Array.isArray(obj)) return obj.map(x => andar(x, chave));
    if (obj && typeof obj === "object") {
      for (const k of Object.keys(obj)) obj[k] = TABELAS.includes(k) ? congelarTabela(obj[k]) : andar(obj[k], k);
      return obj;
    }
    return obj;
  };
  andar(system, "");
  return system;
}

/**
 * Conta quantos aliados (mesma disposição de TOKEN) estão a até
 * "raioMetros" do token ATIVO de "actor" no mapa. Versão solta de
 * NaurenActorSheet#_contarAliadosProximos (que só existe presa a uma
 * ficha aberta, this.actor) - esta aqui recebe o ator direto, pra poder
 * ser chamada de qualquer lugar (ex: naurenProcessarGatilhos, resolvendo
 * o filtro "condicaoFormula" de um Gatilho, que não tem ficha aberta
 * necessariamente). 0 se o ator não tiver token ativo na cena atual.
 */
function naurenContarAliadosProximos(actor, raioMetros) {
  const meuToken = actor?.getActiveTokens?.(true)?.[0] ?? null;
  if (!meuToken || !canvas?.ready) return 0;
  let contagem = 0;
  for (const t of canvas.tokens.placeables) {
    if (t === meuToken || !t.actor) continue;
    if (t.document.disposition !== meuToken.document.disposition) continue;
    if (!naurenMesmoAndar(t, meuToken)) continue; // andares (V14)
    let distancia;
    try {
      distancia = naurenMedirDistanciaBordas(meuToken, t);
    } catch (err) { continue; }
    if (distancia <= raioMetros) contagem++;
  }
  return contagem;
}

/* ---------- Escala de monstro (Nível -> Valor Base; Categoria -> dado/custo) ---------- */
/** Valor Base por faixa de nível (guia de criação, Passo 1). */
function naurenValorBasePorNivel(nivel) {
  const n = Number(nivel) || 1;
  if (n <= 5) return 3; if (n <= 10) return 4; if (n <= 15) return 5; if (n <= 18) return 6;
  if (n <= 20) return 10;
  // 21-30 (0.87): extrapolação SUAVE, +1 por faixa. Antes saltava 12/15/18/22 e a Vida dos monstros
  // explodia (os jogadores param de crescer no 20 - só ganham Vida). Ver guia, seção 4.9.
  if (n <= 23) return 11; if (n <= 26) return 12; if (n <= 29) return 13;
  return 14;
}
/**
 * Dado de dano, metade do dado (arredondando para cima) e Estamina extra por ataque, pela Categoria.
 * 0.108 (rebalanceamento): o dado cresce com o nível da criatura — +1 dado a cada 5 níveis a partir do 6
 * (6-10: +1, 11-15: +2, 16-20: +3, 21-25: +4, 26-30: +5); o meio dado ganha a metade disso (para cima).
 * Nos níveis 1-5 nada muda. Sem nível (0), devolve o dado base.
 */
function naurenEscalaPorCategoria(categoria, nivel = 0) {
  const c = Math.max(1, Math.min(4, Number(categoria) || 1));
  const n = Math.max(0, Number(nivel) || 0);
  const extra = n >= 6 ? Math.floor((n - 1) / 5) : 0, extraMeio = Math.ceil(extra / 2);
  const faces = [6, 8, 10, 12][c - 1], base = c, baseMeio = [1, 1, 2, 2][c - 1];
  return { categoria: c, danoCat: `${base + extra}d${faces}`, meioCat: `${baseMeio + extraMeio}d${faces}`, estCat: c - 1, dadosExtraNivel: extra };
}
/** Categoria final da criatura: campo da ficha, ou o item "Categoria N" quando o campo ficou no padrão. */
function naurenCategoriaDoAtor(actor) {
  const campo = Number(actor?.system?.categoriaMonstro) || 1;
  if (campo > 1 || actor?.type !== "npc") return Math.max(1, Math.min(4, campo));
  for (const it of actor.items ?? []) {
    const m = /^Categoria\s+([1-4])$/i.exec(String(it.name ?? "").trim());
    if (m) return Number(m[1]);
  }
  return campo;
}

function calcularVidaBase(sys) {
  // Some ANTES do switch, de propósito: como "vitalidadeNivel"/"categoria"
  // já multiplicam por nível, ajustar a Vitalidade aqui vira "±N de Vida
  // por nível" automaticamente (nível 3 = ±3 no total) sem duplicar a
  // lógica em cada case - ex: Peculiaridade "Doente" (-1) faz uma
  // criatura de Vitalidade 3 ganhar só +2 de Vida por nível, em vez de
  // +3. Nunca deixa a Vitalidade efetiva ir a menos de 1 (min 1) - uma
  // penalidade grande não deveria zerar ou inverter a Vida.
  // "Number.isFinite" (defesa extra): se por qualquer motivo o total do
  // bônus vier NaN/inválido, ignora-o completamente em vez de propagar
  // NaN pra Vida (já causou "0/NaN" na ficha e travou a criação de Ator
  // por completo - nunca deixar essa conta "vazar" de novo).
  const bonusPorNivel = Number.isFinite(sys.vidaBonusPorNivelTotal) ? sys.vidaBonusPorNivelTotal : 0;
  const vitalidadeBase = Number.isFinite(sys.vitalidade?.max) ? sys.vitalidade.max : 0;
  const vitalidade = Math.max(1, vitalidadeBase + bonusPorNivel);
  const nivel = sys.nivel || 1;
  const categoria = sys.categoriaMonstro || 1;

  switch (sys.calculoVida) {
    case "vitalidade":
      return vitalidade;

    case "categoria":
      return vitalidade * categoria * nivel;

    case "customizado": {
      let formula = (sys.vidaFormula || "@vitalidade * @nivel")
        .replace(/@vitalidade\b/gi, vitalidade)
        .replace(/@categoria\b/gi, categoria)
        .replace(/@nivel\b/gi, nivel);
      // Outros termos (@espirito, @forca...) também valem (0.93.3); antes viravam erro e a Vida caía em Vitalidade × Nível.
      if (/@\w/.test(formula)) formula = formula.replace(/@(\w+)/g, (m, n) => { try { return String(naurenResolverTokenFormula(n, sys?.parent ?? null) ?? 0); } catch (err) { return "0"; } });
      try {
        let v;
        try { v = naurenAvaliarExpressaoSimples(formula); } catch (e1) { v = Roll.safeEval(formula); }
        return Math.max(0, Math.floor(v));
      } catch (err) {
        console.warn(`Nauren RPG | Fórmula de vida customizada inválida ("${formula}"), usando Vitalidade × Nível.`, err);
        return vitalidade * nivel;
      }
    }

    case "vitalidadeNivel":
    default:
      return vitalidade * nivel;
  }
}

/**
 * Mesma ideia de calcularVidaBase, mas pra Mana/Estamina de Combate/Dados
 * de Destino - cada um só tem 2 modos ("padrão do sistema" ou
 * "customizado", sem o modo "categoria" que só existe pra Vida no
 * documento de balanceamento). "baseValor" é o valor padrão do sistema
 * pra esse recurso (Espírito pra Mana, o atributo Estamina pra Estamina
 * de Combate, o atributo Destino pra Dados de Destino) - usado tanto
 * quando o modo é "padrão" quanto como fallback se a fórmula
 * customizada der erro.
 */
function calcularRecursoBase(sys, modoCampo, formulaCampo, baseValor) {
  const nivel = sys.nivel || 1;
  const categoria = sys.categoriaMonstro || 1;
  const modo = sys[modoCampo];
  if (modo === "customizado") {
    const formula = (sys[formulaCampo] || String(baseValor))
      .replace(/@vitalidade/gi, sys.vitalidade.max)
      .replace(/@espirito/gi, sys.espirito.max)
      .replace(/@estamina/gi, sys.atributosTotais?.estamina ?? sys.atributos?.estamina?.value ?? 0)
      .replace(/@destino/gi, sys.atributosTotais?.destino ?? sys.atributos?.destino?.value ?? 0)
      .replace(/@categoria/gi, categoria)
      .replace(/@nivel/gi, nivel);
    try {
      return Math.max(0, Math.floor(Roll.safeEval(formula)));
    } catch (err) {
      console.warn(`Nauren RPG | Fórmula customizada inválida ("${formula}") pra "${modoCampo}", usando o padrão.`, err);
      return baseValor;
    }
  }
  return baseValor;
}

// Rótulos dos 15 campos que tanto o "Bônus Manual" (aba Opções) quanto um
// item de "Efeito" podem somar/subtrair na ficha. Usado para montar o resumo
// legível de cada Efeito na lista da aba Efeitos.
const BONUS_CAMPOS = {
  ataque: "Bônus de Ataque",
  ataqueDado: "Dado de Ataque",
  defesa: "Defesa",
  bloqueio: "Bônus de Bloqueio",
  contraAtaque: "Bônus no Contra-Ataque (aceita dado)",
  esquiva: "Bônus de Esquiva",
  pontosSubclasse: "Ponto(s) de Subclasse",
  movimento: "Movimento",
  alcanceBonus: "Bônus de Alcance (metros)",
  categoria: "Categoria (soma, de 1 a 4)",
  forca: "Força",
  agilidade: "Agilidade",
  estamina: "Estamina",
  inteligencia: "Inteligência",
  destino: "Destino",
  espirito: "Espírito",
  poderAtaque: "Poder de Ataque",
  poderMagia: "Poder de Magia",
  vitalidade: "Vitalidade",
  vida: "Vida Máxima",
  mana: "Mana Máxima",
  estresse: "Limite de Estresse",
  danoBonus: "Bônus de Dano",
  danoDado: "Dado de Dano",
  curaBonus: "Bônus de Cura",
  curaDado: "Dado de Cura",
  perjurioLimiar: "Limiar de Perjúrio",
  gracaLimiar: "Limiar de Graça",
  vidaBonusPorNivel: "Vida por Nível",
  reducaoDano: "Redução de Dano",
  reducaoDanoAtaque: "Redução de Dano de Ataques",
  reducaoDanoPercentual: "Redução de Dano (%)",
  danoRecebido: "Dano Sofrido Extra",
  curaRecebidaPercentual: "Cura Recebida reduzida (%)"
};

// Campos que fazem sentido como alvo de UMA linha da lista dinâmica de
// modificadores (ver campoModificador). "danoBonus"/"curaBonus" aqui são
// SEMPRE aditivos (não fazem sentido "fixar") e vão pro mesmo acumulador
// que os campos "Bônus fixo de Dano/Cura" de um Efeito já preenchiam - só
// oferecem outro jeito de configurar a mesma coisa. "critMin"/
// "critFailMax" afetam sys.critMinTotal/critFailMaxTotal (o valor que a
// rolagem realmente usa - ver _isCrit/_buildD20Boxes), não a config base
// da aba Opções.
// Modos válidos pra uma linha de "modificadoresExternos" (ver
// campoModificadorExterno()) - ver NaurenActorSheet#_aplicarModificadorExterno
// pra como cada um é aplicado na cópia em memória da Ação alvo.
const NAUREN_MODOS_MODIFICADOR_EXTERNO_OPCOES = {
  substituir: "Substituir valor",
  somar: "Somar (numérico ou fórmula)",
  trocarTamanhoDado: "Trocar tamanho do dado (fórmula)",
  dadoExtra: "Somar dado(s) extra do mesmo tamanho (fórmula)",
  adicionar: "Adicionar um novo (numa lista - Condição/Dano/Cura)",
  multiplicar: "Multiplicar (numérico ou fórmula)",
  minimo: "No mínimo (piso)",
  maximo: "No máximo (teto)",
  subirDado: "Subir o dado N passos (d4→d6→d8→d10→d12→d20)"
};
// Ordem de composição (plano, seção 4): estrutura -> substituições ->
// somas -> multiplicações -> pisos/tetos. Mesma fase: "prioridade", depois nome.
const NAUREN_FASE_MODIFICADOR = {
  adicionar: 1, substituir: 2, trocarTamanhoDado: 2, subirDado: 2, somar: 3, dadoExtra: 3, multiplicar: 4, minimo: 5, maximo: 5
};
const NAUREN_ROTULO_FASE_MODIFICADOR = { 1: "estrutura", 2: "substituição", 3: "soma", 4: "multiplicação", 5: "limite" };

// Opções de valor pra campos StringField com vocabulário FECHADO (ver
// naurenClassificarCampoAcao) - reaproveita constantes que já existem
// pro resto do sistema sempre que possível, só cria as que faltam.
const NAUREN_OPCOES_VALOR_CAMPO_ACAO = {
  modoAlvo: { nenhum: "Nenhum", selecionado: "Alvo selecionado", area: "Área" },
  templatePersistenteDisposicao: { aliados: "Aliados", inimigos: "Inimigos", todos: "Todos" },
  templatePersistenteEventoPeriodico: { "": "(desligado)", inicioTurno: "Início do Turno", fimTurno: "Fim do Turno", inicioRodada: "Início da Rodada", fimRodada: "Fim da Rodada" },
  usosReset: { cena: "Fim do combate (cena)", dia: "Ao descansar (dia)", rodada: "A cada rodada", turno: "A cada turno (de qualquer um)", meuTurno: "No início do seu turno" }
  // templateTipo, templatePersistenteEfeito e atributoAtaque são
  // preenchidos mais abaixo (naurenClassificarCampoAcao), reaproveitando
  // TEMPLATE_FORMATOS/NAUREN_TEMPLATE_PERSISTENTE_EFEITO_OPCOES/
  // ATRIBUTOS_BONUS que já existem - não duplicados aqui.
};

/**
 * Classifica UM campo de campoAcao() (ou um sub-campo de array, ver
 * NAUREN_SUBCAMPOS_ARRAY_ACAO) pro tipo de INPUT certo no "Valor" de um
 * Modificador Externo - boolean (checkbox), select (lista fechada de
 * opções) ou formula (texto livre, aceita dado/tokens - cobre tanto
 * fórmula de dano quanto número puro, já que a maioria dos campos
 * "numéricos" deste sistema na verdade são StringField de propósito,
 * pra aceitar "@rank"/dado). Nunca bloqueia nada: um campo não
 * reconhecido (ainda) cai em "formula", que sempre aceita texto puro
 * também.
 */
function naurenClassificarCampoAcao(nomeCampo, campoOuSufixo) {
  if (NAUREN_OPCOES_VALOR_CAMPO_ACAO[nomeCampo]) return { tipo: "select", opcoesValor: NAUREN_OPCOES_VALOR_CAMPO_ACAO[nomeCampo] };
  if (nomeCampo === "templateTipo") return { tipo: "select", opcoesValor: TEMPLATE_FORMATOS };
  if (nomeCampo === "templatePersistenteEfeito") return { tipo: "select", opcoesValor: NAUREN_TEMPLATE_PERSISTENTE_EFEITO_OPCOES };
  if (nomeCampo === "atributoAtaque") return { tipo: "select", opcoesValor: ATRIBUTOS_BONUS };
  if (campoOuSufixo instanceof BooleanField || campoOuSufixo === "boolean") return { tipo: "boolean" };
  if (campoOuSufixo instanceof NumberField || campoOuSufixo === "numero") return { tipo: "numero" };
  return { tipo: "formula" };
}


// mais comuns de propósito. Qualquer campo que NÃO esteja aqui ainda
// aparece no seletor de "Item alvo" de um Modificador Externo (ver
// naurenCamposDaAcao) - só com um rótulo automático (humanizado do nome
// do campo) em vez de um mais bonito. Cadastrar aqui é opcional, nunca
// obrigatório - é assim que um campo NOVO em campoAcao() (futuro) já
// aparece sozinho na lista sem eu precisar lembrar de atualizar nada.
const NAUREN_ROTULOS_CAMPO_ACAO = {
  custoEstamina: "Custo de Estamina",
  custoMana: "Custo de Mana",
  alcance: "Alcance",
  tipo: "Tipo de dano/efeito",
  ehAtaque: "É um teste de Ataque",
  atributoAtaque: "Atributo usado no Ataque",
  quantidadeAtaques: "Quantidade de Ataques (Múltiplos Ataques)",
  usaMultiplosAtaques: "Usa Múltiplos Ataques",
  numeroAlvos: "Número de Alvos",
  modoAlvo: "Modo de Alvo",
  critMinAjuste: "Ajuste no Crítico Mínimo",
  usaEmpurrar: "Empurra o Alvo",
  empurrarMetros: "Metros de Empurrão",
  usaTemplate: "Cria uma Área (Template)",
  templateTipo: "Formato da Área",
  templateTamanho: "Tamanho da Área",
  usaTemplatePersistente: "Área é Persistente",
  templatePersistenteAoEntrar: "Aplica ao Entrar na Área",
  templatePersistenteDisposicao: "Quem a Área Afeta",
  templatePersistenteEfeito: "Efeito Periódico da Área",
  templatePersistenteQuantidade: "Quantidade do Efeito Periódico",
  templatePersistenteCondicaoUuid: "Condição Aplicada pela Área",
  templatePersistenteCondicaoAcumulos: "Acúmulos da Condição da Área",
  templatePersistenteDuracaoRodadas: "Duração da Área (rodadas)",
  templatePersistenteEventoPeriodico: "Evento do Efeito Periódico",
  templatePersistenteSustentadoRecurso: "Recurso pra Sustentar a Área",
  templatePersistenteSustentadoQuantidade: "Quantidade pra Sustentar a Área",
  usaArmaEscolhida: "Usa Arma Escolhida (popup)",
  usaArmaEscolhidaEscalarDado: "Escala o Dado da Arma Escolhida",
  usaCrescimento: "Usa Crescimento",
  crescimentoCustoPorNivel: "Custo de Mana por Nível de Crescimento",
  usaDanoMaximoCondicional: "Dano/Cura Máximo Condicional (liga)",
  formulaDanoMaximoCondicional: "Condição pro Dano/Cura Máximo",
  usaCondicaoEscolhida: "Deixa Escolher uma Condição (popup)",
  usaEscolhaDeRecurso: "Deixa Escolher Quantidade de Recurso (popup)",
  usaUsos: "Tem Usos Limitados",
  usosMax: "Usos Máximos",
  usaCargas: "Usa Cargas",
  cargasMax: "Cargas Máximas"
};

// Sub-campos mais usados de cada array "container" de campoAcao() (danos,
// curas, condicoesAplicadas, gastosRecurso) - ver naurenCamposDaAcao. Só
// esses 4 arrays são expandidos automaticamente (um por ENTRADA que a
// Ação alvo realmente já tiver); arrays mais raros/profundos (ex:
// custosRecursoProprio, efeitosVinculados) não aparecem no seletor, mas
// continuam alcançáveis escrevendo o caminho à mão no campo avançado.
const NAUREN_SUBCAMPOS_ARRAY_ACAO = {
  danos: [{ sufixo: "formula", rotulo: "Fórmula de Dano", tipo: "formula" }],
  curas: [{ sufixo: "formula", rotulo: "Fórmula de Cura", tipo: "formula" }],
  condicoesAplicadas: [
    { sufixo: "ativo", rotulo: "Está Ativa", tipo: "boolean" },
    { sufixo: "acumulos", rotulo: "Acúmulos Aplicados", tipo: "numero" },
    { sufixo: "custoParaEvitarQuantidade", rotulo: "Custo pro Alvo Resistir", tipo: "formula" },
    { sufixo: "forcarMaximoEfeitoPeriodico", rotulo: "Maximizar Efeito Periódico da Condição", tipo: "boolean" }
  ],
  gastosRecurso: [{ sufixo: "quantidade", rotulo: "Quantidade do Gasto", tipo: "formula" }]
};

/** "custoEstamina" -> "Custo Estamina" (fallback automático de rótulo, ver NAUREN_ROTULOS_CAMPO_ACAO). */
function naurenHumanizarNomeCampo(nome) {
  return nome.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()).trim();
}

/**
 * Monta as opções de "campo" pro seletor de um Modificador Externo (ver
 * campoModificadorExterno()), pra UMA Ação específica (acaoIndex) de um
 * item alvo já resolvido - detecta TODO campo escalar de campoAcao()
 * automaticamente (nunca precisa de manutenção quando um campo novo é
 * adicionado ao sistema), mais os sub-campos de NAUREN_SUBCAMPOS_ARRAY_ACAO,
 * um por entrada que "acao" já tiver de cada array. Devolve um objeto
 * plano {valor: rótulo}, mesmo formato de NAUREN_CAMPOS_MODIFICADOR_OPCOES,
 * pra usar direto no helper "selectOptions" já usado em todo o resto do
 * sistema.
 */
// Arrays "container" onde o modo "adicionar" (ver
// NAUREN_MODOS_MODIFICADOR_EXTERNO_OPCOES) sabe empurrar uma entrada
// NOVA (não editar uma que já existe - isso é o resto dos modos, via
// NAUREN_SUBCAMPOS_ARRAY_ACAO). Cada entrada diz o rótulo da opção que
// aparece no seletor (apontando pro array INTEIRO, sem índice) e o tipo
// de "Valor" certo pra montar a entrada nova (ver
// naurenClassificarCampoAcao / _aplicarModificadoresExternos): uma
// Condição usa um UUID arrastado (mesmo padrão de "Item alvo"), Dano/
// Cura usam a fórmula da entrada nova direto.
const NAUREN_ARRAYS_ADICIONAVEIS = {
  condicoesAplicadas: { rotulo: "Adicionar uma Condição nova (lista inteira)", tipo: "condicaoUuid" },
  danos: { rotulo: "Adicionar um bloco de Dano novo (lista inteira)", tipo: "formula" },
  curas: { rotulo: "Adicionar um bloco de Cura novo (lista inteira)", tipo: "formula" }
};

function naurenCamposDaAcaoParaSelect(acao, acaoIndex, prefixoRotulo) {
  const prefixoCampo = `acoes.${acaoIndex}.`;
  const opcoes = {};
  const tipos = {};
  for (const [nome, campo] of Object.entries(campoAcao())) {
    if (campo instanceof ArrayField || nome === "nome") continue;
    const valor = `${prefixoCampo}${nome}`;
    opcoes[valor] = `${prefixoRotulo} — ${NAUREN_ROTULOS_CAMPO_ACAO[nome] || naurenHumanizarNomeCampo(nome)}`;
    tipos[valor] = naurenClassificarCampoAcao(nome, campo);
  }
  for (const [nomeArray, subcampos] of Object.entries(NAUREN_SUBCAMPOS_ARRAY_ACAO)) {
    (acao?.[nomeArray] ?? []).forEach((_, i) => {
      for (const sub of subcampos) {
        const valor = `${prefixoCampo}${nomeArray}.${i}.${sub.sufixo}`;
        opcoes[valor] = `${prefixoRotulo} — ${sub.rotulo} (${nomeArray} ${i + 1})`;
        tipos[valor] = naurenClassificarCampoAcao(sub.sufixo, sub.tipo);
      }
    });
    if (NAUREN_ARRAYS_ADICIONAVEIS[nomeArray]) {
      const infoAdicionavel = NAUREN_ARRAYS_ADICIONAVEIS[nomeArray];
      const valorArray = `${prefixoCampo}${nomeArray}`;
      opcoes[valorArray] = `${prefixoRotulo} — ${infoAdicionavel.rotulo}`;
      tipos[valorArray] = { tipo: infoAdicionavel.tipo };
    }
  }
  return { opcoes, tipos };
}

/**
 * Resolve o item apontado por "itemAlvoUuid" (ver campoModificadorExterno)
 * e devolve as opções de campo (mais o tipo de cada uma, ver
 * naurenClassificarCampoAcao) de TODAS as Ações dele juntas, prontas pro
 * seletor da ficha de Efeito - ver NaurenItemSheet#_prepareContext. ""
 * (vazio) ou item não encontrado devolve tudo vazio (o template cai pro
 * campo de texto avançado sozinho, já que nenhuma opção existe pra
 * mostrar).
 */
async function naurenOpcoesDeCampoParaModificadorExterno(itemAlvoUuid) {
  if (!itemAlvoUuid) return { opcoes: {}, tipos: {}, nomeItemAlvo: null };
  const itemAlvo = await fromUuid(itemAlvoUuid).catch(() => null);
  if (!itemAlvo) return { opcoes: {}, tipos: {}, nomeItemAlvo: null };
  if (!Array.isArray(itemAlvo.system?.acoes)) return { opcoes: {}, tipos: {}, nomeItemAlvo: itemAlvo.name };
  let opcoes = {};
  let tipos = {};
  itemAlvo.system.acoes.forEach((acao, i) => {
    const prefixoRotulo = `Ação ${i + 1} (${acao.nome || "sem nome"})`;
    const resultado = naurenCamposDaAcaoParaSelect(acao, i, prefixoRotulo);
    opcoes = { ...opcoes, ...resultado.opcoes };
    tipos = { ...tipos, ...resultado.tipos };
  });
  return { opcoes, tipos, nomeItemAlvo: itemAlvo.name };
}

const NAUREN_CAMPOS_MODIFICADOR_OPCOES = {
  ataque: "Bônus de Ataque",
  defesa: "Defesa",
  bloqueio: "Bônus de Bloqueio",
  contraAtaque: "Bônus no Contra-Ataque (aceita dado)",
  esquiva: "Bônus de Esquiva",
  pontosSubclasse: "Ponto(s) de Subclasse",
  movimento: "Movimento",
  alcanceBonus: "Bônus de Alcance (metros)",
  categoria: "Categoria (soma, de 1 a 4)",
  forca: "Força",
  agilidade: "Agilidade",
  estamina: "Estamina",
  inteligencia: "Inteligência",
  destino: "Destino",
  espirito: "Espírito",
  poderAtaque: "Poder de Ataque",
  poderMagia: "Poder de Magia",
  vitalidade: "Vitalidade",
  vida: "Vida Máxima",
  mana: "Mana Máxima",
  estaminaCombate: "Estamina de Combate Máxima",
  dadosDestino: "Dados de Destino Máximo",
  estresse: "Limite de Estresse",
  critMin: "Crítico Mínimo (nat. pra ser crítico)",
  critFailMax: "Falha Crítica Máxima (nat. pra ser falha)",
  limiarDeflexao: "Limiar de Deflexão",
  // "Perjúrio do Acaso" dispara sempre num 1 natural, "Graça do
  // Destinado" sempre num 20 natural - os dois eram FIXOS até esta
  // Peculiaridade (Traumatizado: "seu limiar de perjúrio do acaso
  // aumenta em 1 (1 e 2 no d20)") precisar de um jeito de alargar essa
  // faixa. Some ao limiar (ex: "+1" no Perjúrio faz 1 E 2 disparar;
  // "+1" na Graça faz 19 E 20 disparar) - nunca reduz abaixo de 0
  // pontos de faixa.
  perjurioLimiar: "Limiar de Perjúrio do Acaso (some p/ alargar)",
  gracaLimiar: "Limiar de Graça do Destinado (some p/ alargar)",
  // Some na Vitalidade ANTES do cálculo de Vida (ver calcularVidaBase) -
  // como a fórmula padrão já multiplica Vitalidade por Nível, isto vira
  // "±N de Vida por nível" sozinho (ex: Peculiaridade "Doente": -1).
  vidaBonusPorNivel: "Vida ganha por Nível (±, ver Vitalidade × Nível)",
  danoBonus: "Bônus de Dano (soma em qualquer rolagem)",
  curaBonus: "Bônus de Cura (soma em qualquer rolagem)",
  // Diferente dos campos acima (número puro): o VALOR aqui é uma
  // fórmula de dado ("1d8", "2d6"...) que se CONCATENA na rolagem
  // (nunca substitui, sempre soma um dado extra) - ou a palavra "auto"
  // (só pra danoDado/curaDado), que resolve pro MAIOR dado já presente
  // na própria fórmula de dano/cura da Ação sendo rolada no momento
  // (ex: uma Ação com "4d6" ganha "+1d6"; uma com "8d8" ganha "+1d8" -
  // ex: Terra Mágica, Mago: "+1 dado de dano E cura em Magias
  // conjuradas" enquanto a Condição de Presença dela estiver ativa).
  danoDado: "Dado Extra de Dano (1d8, ou \"auto\")",
  curaDado: "Dado Extra de Cura (1d8, ou \"auto\")",
  ataqueDado: "Dado Extra de Ataque (ex.: 1d4)",
  reducaoDano: "Redução de Dano Sofrido",
  // Igual à de cima, mas não vale no dano de Condições (só em ataques, magias e armadilhas).
  reducaoDanoAtaque: "Redução de Dano Sofrido (só de ataques)",
  limiteOfensivo: "Limite de Equipamentos Ofensivos (+N)",
  // Percentual (0-100), aplicado ANTES da redução fixa acima, em
  // QUALQUER dano recebido (ex: Santuário Selvagem, Druida - "você e
  // aliados na área recebem metade do dano" = 50). Somatório de várias
  // fontes trava em 100 (nunca reduz além de 100% do dano).
  reducaoDanoPercentual: "Redução de Dano Sofrido (%, 0-100)",
  // Inverso da Redução de Dano: some ao dano de QUALQUER fonte (ataque, área,
  // periódico) antes das reduções - ex.: Exposto ("+2"). Negativo nunca cura.
  danoRecebido: "Dano Sofrido Extra (±N em todo dano recebido)",
  // Cura recebida cortada em % (100 = cura negada, 50 = metade) - ex.: Putrefato.
  curaRecebidaPercentual: "Cura Recebida reduzida (%, 100 = sem cura)",
  // ===== FACILIDADE / DIFICULDADE ("facilidade"/"dificuldade" do manual) =====
  // Diferente dos campos acima, o VALOR destes não é um número: escreva
  // "vantagem" (rola 2d20 e usa o maior) ou "desvantagem" (usa o menor).
  // Se a mesma rolagem receber os dois ao mesmo tempo, eles se ANULAM e a
  // rolagem sai normal - igual à regra clássica de mesa.
  vantagemAtaque: "Facilidade/Dificuldade nos MEUS ataques",
  vantagemAtaqueRecebido: "Facilidade/Dificuldade em ataques CONTRA mim",
  vantagemAtaqueRecebidoPrioridade: "Facilidade/Dificuldade em ataques CONTRA mim feitos numa Prioridade",
  vantagemEsquiva: "Facilidade/Dificuldade nas minhas Esquivas",
  vantagemTeste: "Facilidade/Dificuldade em testes de atributo"
};

/** Monta um texto curto tipo "Poder de Ataque +3, Dado de Dano +1d4" a partir dos modificadores de um efeito/condição (lista dinâmica) OU dos campos antigos ainda usados por Pigmento. */
/**
 * Texto legível de UMA linha de modificador, como o jogador fala: "Movimento fixado em 0",
 * "Ataques contra você com Facilidade", "Cura recebida −100%", "Defesa +2".
 * Só "=" fixa (ver naurenPrepararModificador); número sem sinal SOMA.
 */
function naurenTextoModificador(campo, valor) {
  const t = String(valor ?? "").trim();
  if (!t) return "";
  const vant = { vantagemAtaque: "Seus ataques", vantagemAtaqueRecebido: "Ataques contra você", vantagemAtaqueRecebidoPrioridade: "Ataques contra você numa Prioridade", vantagemEsquiva: "Suas Esquivas", vantagemTeste: "Seus testes de atributo" };
  if (String(campo).startsWith("vantagem")) {
    const n = Number(t);
    const modo = t === "vantagem" || (Number.isFinite(n) && n > 0) ? "Facilidade" : t === "desvantagem" || (Number.isFinite(n) && n < 0) ? "Dificuldade" : t;
    return `${vant[campo] ?? campo} com ${modo}`;
  }
  const label = BONUS_CAMPOS[campo] || String(NAUREN_CAMPOS_MODIFICADOR_OPCOES[campo] ?? campo).replace(/\s*\(.*\)\s*$/, "");
  if (t.startsWith("=")) return `${label} fixado em ${t.slice(1).trim()}`;
  if (/Percentual$/.test(campo)) {
    const n = t.replace(/^\+/, "");
    return campo === "curaRecebidaPercentual" ? `Cura recebida −${n}%` : `${label.replace(/\s*\(%\)\s*$/, "")} ${n}%`;
  }
  if (t[0] === "+" || t[0] === "-") return `${label} ${t}`;
  if (/^\d/.test(t)) return `${label} +${t}`;
  return `${label} ${t}`;
}

function resumoEfeito(sys) {
  const partes = [];

  if (sys.modificadores) {
    // Lista dinâmica (Efeito/Condição) - cada linha já diz seu próprio campo e valor.
    for (const mod of sys.modificadores) {
      if (!mod.valor) continue;
      // Valor do rank atual (ex.: Fortitudo rank 4 = +20), não o do rank 1.
      const rk = Number(sys.rankAtual) || 0;
      const porR = (mod.porRank ?? []).filter(x => (Number(x.rank) || 0) <= rk && x.valor !== undefined && x.valor !== "").sort((a, b) => b.rank - a.rank)[0];
      const texto = naurenTextoModificador(mod.campo, porR ? porR.valor : mod.valor);
      if (texto) partes.push(texto);
    }
  } else {
    // Grade fixa antiga (ainda usada por Pigmento) - um campo por chave conhecida.
    for (const [chave, label] of Object.entries(BONUS_CAMPOS)) {
      const v = sys[chave];
      if (!v || ["ataqueDado", "danoBonus", "danoDado", "curaBonus", "curaDado"].includes(chave)) continue;
      if (typeof v === "string") {
        const ehSoma = v[0] === "+" || v[0] === "-";
        partes.push(ehSoma ? `${label} ${v}` : `${label} = ${v}`);
      } else {
        partes.push(`${label} ${v > 0 ? "+" : ""}${v}`);
      }
    }
  }

  // Dado extra de Ataque/Dano/Cura: campos SEPARADOS de "modificadores",
  // continuam existindo direto no item tanto pra Efeito quanto (ataqueDado) pra Pigmento.
  for (const chave of ["ataqueDado", "danoBonus", "danoDado", "curaBonus", "curaDado"]) {
    const v = sys[chave];
    if (!v) continue;
    partes.push(typeof v === "string" ? `${BONUS_CAMPOS[chave]} +${v}` : `${BONUS_CAMPOS[chave]} ${v > 0 ? "+" : ""}${v}`);
  }

  return partes.join(", ") || "Sem bônus definidos";
}

/** Igual resumoEfeito, mas também descreve a regra especial de "bônus no menor atributo" do Pigmento. */
function resumoCor(sys) {
  const partes = resumoEfeito(sys) === "Sem bônus definidos" ? [] : [resumoEfeito(sys)];
  if (sys.bonusMenorAtributo && sys.bonusMenorAtributoValor) {
    partes.push(`Menor Atributo +${sys.bonusMenorAtributoValor}`);
  }
  return partes.join(", ") || "Sem bônus definidos";
}

/** Rótulo de um "@token" para explicar uma fórmula ao jogador. */
/** Fórmula escrita para o jogador ler num card ou janela: "1d4+@categoria" vira "1d4+Categoria", "(@rank)d4" vira "(rank)d4". */
function naurenFormulaParaTexto(formula, actor = null) {
  const curtos = { rank: "rank", categoria: "Categoria", vb: "VB", nivel: "nível", danoCat: "dado da Categoria", meioCat: "meio dado da Categoria",
    poderAtaque: "PdA", poderMagia: "PdM", estCat: "Estamina da Categoria" };
  return String(formula ?? "").replace(/@(\w+)/g, (m, n) => curtos[n] ?? (typeof ATRIBUTOS_BONUS !== "undefined" && ATRIBUTOS_BONUS[n]) ?? naurenRotuloToken(n, actor) ?? n);
}
function naurenRotuloToken(nome, ator) {
  const sys = ator?.system ?? {};
  const cat = sys.categoriaTotal ?? 1;
  const especiais = {
    danoCat: `dado de dano da Categoria ${cat}`, meioCat: `metade do dado da Categoria ${cat}`, estCat: `Estamina extra da Categoria ${cat}`,
    vb: `Valor Base ${sys.valorBase ?? ""}`.trim(), categoria: `Categoria ${cat}`, nivel: `nível ${sys.nivel ?? 1}`, rank: "rank"
  };
  return especiais[nome] ?? ATRIBUTOS_BONUS[nome] ?? nome;
}
/**
 * Fórmula de um efeito periódico já resolvida contra QUEM APLICOU a Condição (conjuradorUuid) -
 * o jogador vê "1d8" e de onde veio, nunca "@meioCat". Sem conjurador, usa quem tem a Condição.
 */
/** Troca os @tokens de uma fórmula pelos valores do ator (aceita dados: @danoCat vira "2d8"). */
/**
 * Raiz a usar ao evoluir uma Condição: se o alvo JÁ tem o próximo estágio (ex.: já Adormecido e o Sonolento
 * evolui), renova esse em vez de criar um segundo igual.
 */
function naurenRaizDaEvolucao(actor, proximaUuid, raizCadeia) {
  const ja = actor?.items?.find(i => i.type === "condicao" && (i.getFlag("core", "sourceId") === proximaUuid || i.getFlag("nauren", "cadeiaRaizUuid") === proximaUuid));
  return ja ? (ja.getFlag("nauren", "cadeiaRaizUuid") || proximaUuid) : raizCadeia;
}
function naurenMetrosEmpurrao(texto, actor, rank = 1) {
  // Metros de Empurrão: aceita número, @rank e valores da ficha (ex.: "2+@categoria").
  let f = String(texto ?? "").trim();
  if (!f) return 0;
  f = f.replace(/@rank\b/gi, String(Math.max(1, Number(rank) || 1)));
  f = naurenFormulaComTokensDoAtor(f, actor);
  return Math.max(0, Math.round(Number(naurenAvaliarExpressaoSimples(f)) || 0));
}
function naurenFormulaComTokensDoAtor(formula, actor) {
  const f = String(formula ?? "");
  if (!actor || !/@\w/.test(f)) return f;
  return f.replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, actor) ?? 0));
}
function naurenFormulaPeriodicaLegivel(formula, item) {
  const f = String(formula ?? "").trim();
  if (!/@\w/.test(f)) return { valor: f, origem: "" };
  let ref = null;
  const uuid = item?.system?.conjuradorUuid;
  if (uuid) { try { const d = fromUuidSync(uuid); ref = d?.actor ?? d ?? null; } catch (err) { ref = null; } }
  const daFonte = !!ref;
  ref = ref ?? item?.parent ?? null;
  if (!ref) return { valor: f, origem: "" };
  const tokens = [...new Set(f.match(/@(\w+)/g) ?? [])].map(t => t.slice(1));
  const valor = f.replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, ref) ?? 0));
  const explic = tokens.filter(t => t !== "acumulos").map(t => naurenRotuloToken(t, ref)).join(", ");
  return { valor, origem: explic ? `${explic} de ${ref.name}${daFonte ? "" : " (quem tem a Condição)"}` : "" };
}

/** Resumo legível de uma Condição, mostrando o valor POR acúmulo e marcações especiais. */
function resumoCondicao(sys, item = null) {
  const partes = [];
  const base = resumoEfeito(sys);
  if (base !== "Sem bônus definidos") partes.push(sys.acumulativel ? `${base} (por acúmulo)` : base);
  for (const ef of sys.efeitosPeriodicos ?? []) {
    if (!ef.formula) continue;
    const rotulo = RECURSOS_PERIODICOS[ef.recurso] || ef.recurso;
    const momento = (NAUREN_MOMENTOS_PERIODICOS[naurenMomentoEfeitoPeriodico(ef)] ?? "").toLowerCase();
    const leg = naurenFormulaPeriodicaLegivel(ef.formula, item);
    partes.push(`${leg.valor} de ${rotulo}${ef.aumentaPorAcumulo ? "/acúmulo" : ""} (${momento}${leg.origem ? ` · ${leg.origem}` : ""})`);
  }
  if (sys.evolutiva) {
    partes.push(sys.limiarAcumulos > 0 ? `Evolutiva (${sys.limiarAcumulos}+ acúmulos)` : "Evolutiva");
  }
  if ((sys.duracaoRodadas || 0) > 0) {
    const restante = sys.duracaoRestante ?? sys.duracaoRodadas;
    const modo = naurenModoDuracaoCondicao(sys);
    const unidade = modo === "turnosPortador" ? "turno(s) do portador" : modo === "turnosQualquer" ? "turno(s)" : "rodada(s)";
    partes.push(`Termina em ${restante} ${unidade}`);
  }
  // Fase 5 (M11): travas.
  if (sys.travaAcoesMana) partes.push("Não usa Ações com Mana");
  if (sys.travaAtaques) partes.push("Não pode atacar");
  if (sys.travaHabilidades) partes.push("Não usa Habilidades nem Magias");
  const proib = [sys.proibeBloqueio && "Bloquear", sys.proibeEsquiva && "Esquivar", sys.proibeContraAtaque && "Contra-Atacar"].filter(Boolean);
  if (proib.length) partes.push(`Não pode ${proib.join(", ").replace(/, ([^,]*)$/, " nem $1")}`);
  if (sys.naoRecebePrioridade === "todos") partes.push("Não recebe Prioridade");
  else if (sys.naoRecebePrioridade === "aliados") partes.push("Não recebe Prioridade de aliados");
  // Fase 4 (M05/M02): vínculo com quem aplicou e movimento sem Prioridade, à vista no resumo.
  if (sys.modificadoresExcetoOrigem) partes.push("Não vale contra quem aplicou");
  if ((sys.origemAfastaMetros || 0) > 0) partes.push(`Sai se quem aplicou ficar a mais de ${sys.origemAfastaMetros}m`);
  if (sys.origemCaiRemove) partes.push("Sai se quem aplicou cair");
  if (sys.arrastarComOrigem) partes.push("Vai junto de quem aplicou");
  if (sys.periodicoCuraOrigem) partes.push("O dano cura quem aplicou");
  if (String(sys.movimentoSemPrioridadeMetros ?? "").trim()) partes.push(`Até ${sys.movimentoSemPrioridadeMetros}m por turno sem gerar Prioridade`);
  return partes.join(" • ") || "Sem efeitos mecânicos definidos";
}

/* =======================================
 * CARD AUDITÁVEL E PRIORIDADE (Fase 2)
 * ======================================= */

// Indicador do livro (Cap. III, Habilidades Ativas).
const NAUREN_PRIORIDADE_INDICADORES = {
  "": "Não informado",
  PI: "P/I — gera Prioridade para inimigo",
  PA: "P/A — gera Prioridade para aliado",
  NP: "N/P — não gera Prioridade"
};
const NAUREN_PRIORIDADE_INDICADORES_ACAO = {
  "": "Igual ao item",
  PI: "P/I — gera Prioridade para inimigo",
  PA: "P/A — gera Prioridade para aliado",
  NP: "N/P — não gera Prioridade"
};
const NAUREN_PRIORIDADE_SIGLA = { PI: "P/I", PA: "P/A", NP: "N/P" };
const NAUREN_PRIORIDADE_QUEM_RECEBE = {
  "": "Padrão (P/I: alvos afetados • P/A: 1 à escolha)",
  alvosAfetados: "Alvos afetados (já marcados, confirmar no card)",
  escolha: "À escolha (botões no card)",
  noRaio: "Todos no raio (já marcados, confirmar no card)"
};
const NAUREN_PRIORIDADE_DISPOSICAO = {
  "": "Padrão (P/A: aliados • P/I: inimigos)",
  aliados: "Aliados",
  inimigos: "Inimigos",
  todos: "Aliados e inimigos"
};
// Valores antigos (0.8.1 em teste) continuam válidos.
const NAUREN_PRIORIDADE_QUEM_RECEBE_LEGADO = { aliadosEscolha: "escolha", aliadosNoRaio: "noRaio" };
const NAUREN_PRIORIDADE_NOME_LADO = {
  aliados: ["aliado", "aliados"], inimigos: ["inimigo", "inimigos"], todos: ["personagem", "personagens"]
};

/**
 * Resolve a Prioridade de uma Ação: indicador (Ação > item), quem recebe
 * (padrão pelo indicador), quantidade (fórmula com @rank) e raio.
 * Devolve null quando o indicador não foi informado.
 */
function naurenResolverPrioridade(item, acao, rank = 0) {
  // Sem indicador informado: testes de ataque e armas geram para o inimigo (livro).
  const indicador = acao?.prioridadeIndicador || item?.system?.prioridadeIndicador || ((acao?.ehAtaque || item?.type === "arma") ? "PI" : "");
  if (!NAUREN_PRIORIDADE_SIGLA[indicador]) return null;
  const padrao = indicador === "PA" ? "escolha" : indicador === "PI" ? "alvosAfetados" : "";
  const bruto = (indicador !== "NP" && acao?.prioridadeQuemRecebe) || padrao;
  const quemRecebe = NAUREN_PRIORIDADE_QUEM_RECEBE_LEGADO[bruto] ?? bruto;
  const disposicao = acao?.prioridadeDisposicao || (indicador === "PI" ? "inimigos" : "aliados");
  const avaliar = texto => {
    const bruto = String(texto ?? "").replace(/@rank\b/gi, String(rank ?? 0)).trim();
    if (!bruto) return null;
    const n = naurenAvaliarExpressaoSimples(bruto);
    return Number.isFinite(n) ? n : Number(bruto);
  };
  return {
    indicador,
    sigla: NAUREN_PRIORIDADE_SIGLA[indicador],
    rotulo: NAUREN_PRIORIDADE_INDICADORES[indicador],
    quemRecebe,
    disposicao,
    nomeLado: NAUREN_PRIORIDADE_NOME_LADO[disposicao] ?? NAUREN_PRIORIDADE_NOME_LADO.aliados,
    quantidade: Math.max(1, Math.round(avaliar(acao?.prioridadeQuantidade) || 1)),
    raio: avaliar(acao?.prioridadeRaio)
  };
}

/**
 * Resumo legível da Prioridade de uma Ação para a ficha do item, e quais
 * campos extras fazem sentido no modo escolhido.
 */
function naurenResumoPrioridadeAcao(item, acao) {
  const cfg = naurenResolverPrioridade(item, acao, item?.system?.rankAtual ?? 0);
  const herdado = !acao?.prioridadeIndicador && !!item?.system?.prioridadeIndicador;
  if (!cfg) return { resumo: "Indicador não informado: o card não mostra Prioridade.", mostraQuantidade: false, mostraRaio: false };
  const origem = herdado ? " (herdado do item)" : "";
  if (cfg.indicador === "NP") return { resumo: `N/P${origem}: não gera Prioridade.`, mostraQuantidade: false, mostraRaio: false };
  const [um, varios] = cfg.nomeLado;
  let quem = "";
  if (cfg.quemRecebe === "alvosAfetados") quem = "os alvos afetados vêm marcados no card para você confirmar";
  else if (cfg.quemRecebe === "noRaio") quem = `os ${varios}${cfg.raio ? ` a até ${cfg.raio}m` : " em cena"} vêm marcados no card para você confirmar`;
  else quem = `${cfg.quantidade > 1 ? `${cfg.quantidade} ${varios}` : `1 ${um}`} à sua escolha recebe${cfg.quantidade > 1 ? "m" : ""} Prioridade (botões no card)`;
  return {
    resumo: `${cfg.sigla}${origem}: ${quem}.`,
    mostraQuantidade: cfg.quemRecebe === "escolha",
    mostraRaio: cfg.quemRecebe === "noRaio",
    mostraDisposicao: cfg.quemRecebe === "escolha" || cfg.quemRecebe === "noRaio"
  };
}

/**
 * Dados do painel de seleção de Prioridade do card: candidatos do lado
 * pedido (marcados como "aliado"/"inimigo" em relação a quem usou),
 * limite de escolhas (0 = sem limite) e se o painel nasce aberto.
 * Devolve null quando não há ninguém em cena.
 */
/**
 * Máximo de usos passivos de um item: fórmula (aceita @rank) quando
 * informada, senão o número fixo de usosPassivaMax.
 */
function naurenUsosPassivaMax(sys) {
  const formula = String(sys?.usosPassivaMaxFormula ?? "").trim();
  if (!formula) return sys?.usosPassivaMax ?? 0;
  const valor = naurenAvaliarExpressaoSimples(formula.replace(/@rank\b/gi, String(sys?.rankAtual ?? 0)));
  return Number.isFinite(valor) ? Math.max(0, Math.floor(valor)) : (sys?.usosPassivaMax ?? 0);
}

/**
 * Usos passivos que dependem do rank (ex.: Impulso "1 + rank"): ao subir de
 * rank, os usos atuais ganham a diferença na hora, em vez de esperar o
 * próximo fim de cena para chegar ao máximo novo.
 */
Hooks.on("preUpdateItem", (item, changes, options) => {
  if (!foundry.utils.hasProperty(changes, "system.rankAtual") || !String(item.system?.usosPassivaMaxFormula ?? "").trim()) return;
  options.naurenUsosMaxAntes = naurenUsosPassivaMax(item.system);
});
Hooks.on("updateItem", (item, changes, options, userId) => {
  if (userId !== game.user.id || options.naurenUsosMaxAntes === undefined) return;
  const novo = naurenUsosPassivaMax(item.system);
  const delta = novo - options.naurenUsosMaxAntes;
  if (delta > 0) item.update({ "system.usosPassivaAtual": Math.min(novo, (item.system.usosPassivaAtual ?? 0) + delta) }).catch(() => {});
});

/**
 * Disposição (aliado/hostil/neutro) de um ator na cena atual: o token dele
 * (vinculado ou não), senão o protótipo. Usada para saber quem é aliado de quem.
 */
function naurenDisposicaoDoAtor(actor) {
  if (!actor) return undefined;
  if (actor.token) return actor.token.disposition;               // ator de token não vinculado
  const tokens = actor.getActiveTokens?.(false, true) ?? [];      // qualquer token dele na cena
  if (tokens.length) return tokens[0].disposition;
  return actor.prototypeToken?.disposition;
}

/**
 * Mantém abertos/fechados os <details data-persist="chave"> de uma ficha
 * entre redesenhos (editar um campo redesenha a ficha e fechava os painéis).
 */
/**
 * Lista (select) cuja opção escolhida não cabe na caixa: a caixa ganha a linha inteira
 * (na grade de campos ou numa linha flex), para o texto escolhido aparecer completo.
 * Só mede o que está visível; roda de novo ao trocar de aba, abrir seção ou mudar a opção.
 */
function naurenAjustarListasLargas(raiz) {
  if (!raiz) return;
  const ctx = (naurenAjustarListasLargas._c ??= document.createElement("canvas").getContext("2d"));
  for (const sel of raiz.querySelectorAll("select")) {
    if (!sel.offsetParent) continue;
    const alvo = sel.closest(".field") ?? sel;
    const estava = alvo.classList.contains("nauren-lista-larga");
    alvo.classList.remove("nauren-lista-larga");
    const cs = getComputedStyle(sel);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const texto = sel.selectedOptions?.[0]?.textContent?.trim() ?? "";
    const precisa = ctx.measureText(texto).width + parseFloat(cs.paddingLeft || 0) + parseFloat(cs.paddingRight || 0) + 22;
    if (precisa > sel.clientWidth + 1) {
      alvo.classList.add("nauren-lista-larga");
      if (alvo === sel && sel.parentElement) sel.parentElement.classList.add("nauren-linha-quebra");
    } else if (estava && alvo === sel) sel.parentElement?.classList.remove("nauren-linha-quebra");
  }
}

function naurenPersistirDetalhesAbertos(app) {
  app._naurenDetalhesAbertos ??= new Map();
  app.element?.querySelectorAll?.("details[data-persist]").forEach(d => {
    const chave = d.dataset.persist;
    if (app._naurenDetalhesAbertos.has(chave)) d.open = app._naurenDetalhesAbertos.get(chave);
    d.addEventListener("toggle", () => app._naurenDetalhesAbertos.set(chave, d.open));
  });
}

/* =======================================
 * ESTADOS EXCLUSIVOS (Fase 6 - P)
 * ======================================= */
// Grupos que já vêm configurados no sistema (sugestões e guia).
const NAUREN_PAGAR_CUSTO_OPCOES = { mana: "Custo de Mana", estamina: "Custo de Estamina" };
const NAUREN_PAGAR_RECURSO_OPCOES = { vida: "Vida", mana: "Mana", estaminaCombate: "Estamina", dadosDestino: "Dados de Destino" };
const NAUREN_GRUPOS_EXCLUSIVOS_PADRAO = {
  "forma-druida": "Formas do Druida (Arauto Lunar, Senhor da Floresta, Sábio dos Matos) — 1 por vez",
  "guarda": "Guardas do Guerreiro (Defensiva / Ofensiva) — 1 por vez; 2 com Juramento da Guarda",
  "forca-natureza": "Força da Natureza do Druida (Sabedoria / Fúria / Resiliência) — 1, 2 ou 3 juntas conforme o rank"
};
/** Todos os grupos conhecidos: os do sistema + os já usados em itens do mundo e das fichas. */
function naurenGruposExclusivosConhecidos() {
  const mapa = new Map(Object.entries(NAUREN_GRUPOS_EXCLUSIVOS_PADRAO));
  const ver = it => {
    const g = it?.system?.grupoExclusivo;
    if (g && !mapa.has(g)) mapa.set(g, `usado em: ${it.name}`);
    for (const l of it?.system?.limitesDeGrupo ?? []) if (l.grupo && !mapa.has(l.grupo)) mapa.set(l.grupo, `usado em: ${it.name}`);
  };
  for (const it of game.items ?? []) ver(it);
  for (const a of game.actors ?? []) for (const it of a.items) ver(it);
  return [...mapa.entries()].map(([id, rotulo]) => ({ id, rotulo }));
}
/** Máximo de um grupo exclusivo no ator: o maior entre o do item e os ajustes de Habilidades/Efeitos. */
function naurenMaximoDoGrupo(actor, grupo, padrao = 1) {
  let maximo = padrao;
  for (const it of actor?.items ?? []) {
    const ativo = it.type === "habilidade" ? it.system.ativo !== false : it.type === "efeito" ? !!it.system.ativo : false;
    if (!ativo) continue;
    for (const l of it.system.limitesDeGrupo ?? []) if (l.grupo === grupo) maximo = Math.max(maximo, l.maximoIgualAoRank ? Math.max(1, it.system.rankAtual || 1) : (l.maximo || 1));
  }
  return maximo;
}
/** Itens ativos de um grupo exclusivo no ator (Condições e Efeitos ativos). */
function naurenItensDoGrupo(actor, grupo) {
  return (actor?.items ?? []).filter(i => i.system?.grupoExclusivo === grupo
    && ((i.type === "condicao" && i.system.ativo !== false) || (i.type === "efeito" && i.system.ativo)));
}
/**
 * Garante o máximo do grupo depois que "novo" entrou/ativou: remove as
 * Condições mais antigas (ou desativa Efeitos) e posta um card.
 */
async function naurenAplicarExclusividade(actor, novo) {
  const grupo = novo?.system?.grupoExclusivo;
  if (!grupo || !actor) return;
  // Capacidade "Ignorar exclusividade de grupo" (ex.: Juramento da Guarda: as duas Guardas juntas).
  const juramentoGuarda = grupo === "guarda" && actor.items.some(i => (i.type === "condicao" || i.type === "efeito" ? i.system.ativo !== false : false) && naurenEhItem(i, "Juramento da Guarda"));
  const postura = n => /Defensiva/i.test(n) ? "def" : /Ofensiva/i.test(n) ? "of" : n;
  const maximo = juramentoGuarda ? 1 : naurenMaximoDoGrupo(actor, grupo, novo.system.grupoMaximo || 1);
  const outros = naurenItensDoGrupo(actor, grupo).filter(i => i.id !== novo.id && (!juramentoGuarda || postura(i.name) === postura(novo.name)));
  const excesso = outros.length + 1 - maximo;
  if (excesso <= 0) return;
  const sair = outros.slice(0, excesso); // os mais antigos primeiro
  for (const it of sair) {
    if (it.type === "condicao") await it.delete().catch(() => {});
    else await it.update({ "system.ativo": false }).catch(() => {});
  }
  naurenPostarCard({
    ator: actor, titulo: novo.name, icone: novo.img, fonte: `Estado exclusivo • ${grupo}`,
    linhas: [{ label: "Substituiu", value: sair.map(i => i.name).join(", "), breakdown: `máximo ${maximo} ao mesmo tempo` }]
  });
}
Hooks.on("createItem", (item, opcoes, userId) => {
  if (userId !== game.user.id || item.type !== "condicao" || !item.system?.grupoExclusivo || item.parent?.documentName !== "Actor") return;
  naurenAplicarExclusividade(item.parent, item).catch(err => console.warn("Nauren RPG | Falha na exclusividade de grupo.", err));
});
Hooks.on("updateItem", (item, mudancas, opcoes, userId) => {
  if (userId !== game.user.id || item.type !== "efeito" || !item.system?.grupoExclusivo || item.parent?.documentName !== "Actor") return;
  if (foundry.utils.getProperty(mudancas, "system.ativo") !== true) return;
  naurenAplicarExclusividade(item.parent, item).catch(err => console.warn("Nauren RPG | Falha na exclusividade de grupo.", err));
});
/* → Registro de Prioridades: modulos/prioridades.mjs */

/* → Registro de rolagens (auditoria): modulos/registro-rolagens.mjs */
__naurenIniciar_registro_rolagens();

/* → Desfazer uma Ação: modulos/desfazer-acao.mjs */
__naurenIniciar_desfazer_acao();


/* ============================================================
 * 0.97.3 — Cards do chat no estilo da ficha: as cores de quem agiu
 * (Pigmentos ou Opções > Cores da ficha), aplicadas na hora de mostrar,
 * então cards antigos também mudam e trocar a cor na ficha muda o chat.
 * ============================================================ */
const NAUREN_CARD_PALETA_SISTEMA = () => naurenFichaPaleta("Roxo", "Dourado");
function naurenAtorDoCard(message) {
  try {
    const uuid = message.getFlag?.("nauren", "casterUuid");
    if (uuid) { const a = fromUuidSync(uuid, { strict: false }); if (a?.documentName === "Actor") return a; if (a?.actor) return a.actor; }
  } catch (err) { /* segue pelo falante */ }
  try { return ChatMessage.implementation.getSpeakerActor(message.speaker) ?? null; } catch (err) { return null; }
}
function naurenEstiloDoCard(ator) {
  let pal = null;
  try { pal = ator ? naurenCoresDoAtor(ator).pal : null; } catch (err) { pal = null; }
  pal ??= NAUREN_CARD_PALETA_SISTEMA();
  return { estilo: `--nc-p: ${pal.p}; --nc-pd: ${pal.pd}; --nc-pc: ${pal.pc}; --nc-s: ${pal.s}; --nc-sc: ${pal.sc};`, escuro: !!pal.fundoEscuro };
}
Hooks.on("renderChatMessageHTML", (message, html) => {
  try {
    if (!html?.querySelector) return;
    const alvos = html.querySelectorAll(".nauren-roll-card, .nauren-aviso-chat, .nauren-deflexao-card");
    if (!alvos.length) return;
    const ator = naurenAtorDoCard(message);
    const { estilo, escuro } = naurenEstiloDoCard(ator);
    for (const el of alvos) {
      el.classList.add("nc2");
      el.style.cssText += estilo;
      el.classList.toggle("nc-fundo-escuro", escuro);
      el.classList.toggle("nc-monstro", ator?.type === "npc");
    }
    html.classList?.add("nc-mensagem");
  } catch (err) { console.warn("Nauren RPG | cores do card", err); }
});

/* 0.98 — Janelas do kit (Confirmar uso, Rolagem, Reagir, escolhas...) nas cores de quem age. */
function naurenAtorDaJanela(app) {
  if (app?.options?.naurenSistema || app?._naurenSistema) return null;
  const uuid = app?._naurenAtorUuid ?? app?.options?.naurenAtorUuid;
  if (uuid) { try { const a = fromUuidSync(uuid, { strict: false }); if (a) return a.actor ?? a; } catch (err) { /* segue */ } }
  return canvas?.tokens?.controlled?.find?.(t => t.actor?.isOwner)?.actor ?? game.user?.character ?? null;
}
function naurenPintarJanela(el, ator) {
  if (!el) return;
  const { estilo, escuro } = naurenEstiloDoCard(ator);
  for (const par of estilo.split(";").map(x => x.trim()).filter(Boolean)) { const [k, v] = par.split(":").map(x => x.trim()); el.style.setProperty(k, v); }
  el.classList.add("nc2");
  el.classList.toggle("nc-fundo-escuro", escuro);
  el.classList.toggle("nc-monstro", ator?.type === "npc");
}
/* 0.98.1 — Telas próprias (Bancada, Alambique, Obra Prima, Subclasse, ficha de item, Borda do token, Criador) nas cores
   do personagem dono; ferramentas do Mestre (Criador de Monstro, barras, recursos da HUD) nas cores do sistema. */
const NAUREN_TELAS_PROPRIAS = ["nauren-bancada", "nauren-obra-prima", "nauren-subclasse-sheet", "nauren-borda-janela", "nauren-criador"];
const NAUREN_TELAS_MESTRE = ["nauren-criador-monstro", "nauren-hudrec-editor"];
Hooks.on("renderApplicationV2", (app, el) => {
  try {
    const raiz = app?.element ?? el;
    const cl = raiz?.classList;
    if (!cl || cl.contains("nauren-kit")) return;
    // 0.98.6: diálogos do próprio Foundry (Criar Ator/Item/Pasta, confirmações…) ganham o molde das janelas do sistema, nas cores do sistema
    const DV2 = foundry.applications?.api?.DialogV2;
    // As opções do V14 ficam travadas (não aceitam campo novo): a marca vai na própria janela.
    // 0.101.2: diálogo do sistema ligado a um ator (ex.: Borda do token) fica nas cores dele.
    if (DV2 && app instanceof DV2) { if (!app.options?.naurenAtorUuid) app._naurenSistema = true; cl.add("nauren-kit"); return; }
    const ehItem = cl.contains("nauren-rpg") && cl.contains("sheet") && cl.contains("item");
    // 0.99.2: ficha de personagem/PNJ/Armazenamento: só a moldura do sistema (chanfro, barra listrada, canto de arrastar) nas cores do dono.
    if (cl.contains("nauren-rpg") && cl.contains("sheet") && cl.contains("actor")) {
      const atorF = app.actor ?? app.document ?? null;
      naurenPintarJanela(raiz, atorF);
      cl.add("nc-moldura");
      return;
    }
    // 0.101.2: Barras do token na moldura da ficha, nas cores do dono.
    if (cl.contains("nauren-barras-editor")) { naurenPintarJanela(raiz, app.actor ?? null); cl.add("nc-moldura"); return; }
    if (NAUREN_TELAS_MESTRE.some(c => cl.contains(c))) { naurenPintarJanela(raiz, null); cl.add("nc-tela"); return; }
    if (!ehItem && !NAUREN_TELAS_PROPRIAS.some(c => cl.contains(c))) return;
    let ator = app.actor ?? app.options?.actor ?? app.document?.actor ?? app.item?.actor ?? app.document?.parent ?? null;
    if (!ator && app.options?.naurenAtorUuid) { try { ator = fromUuidSync(app.options.naurenAtorUuid, { strict: false }); } catch (err) { ator = null; } }
    if (ator && ator.documentName !== "Actor") ator = ator.actor ?? null;
    naurenPintarJanela(raiz, ator);
    cl.add("nc-tela");
  } catch (err) { console.warn("Nauren RPG | cores da tela", err); }
});
/* 0.101.4 — Janela "deslizada" depois de redesenhar: o navegador rolava a própria janela (ou a área de conteúdo,
   que não tem barra) para mostrar o campo clicado, e ficava um vão embaixo e o topo escondido. Volta para o lugar. */
function naurenDesrolarJanela(raiz) {
  if (!raiz) return;
  if (raiz.scrollTop || raiz.scrollLeft) { raiz.scrollTop = 0; raiz.scrollLeft = 0; }
  const wc = raiz.querySelector(":scope > .window-content");
  if (wc && (wc.scrollTop || wc.scrollLeft)) { const ov = getComputedStyle(wc).overflowY; if (ov === "hidden" || ov === "clip" || ov === "visible") { wc.scrollTop = 0; wc.scrollLeft = 0; } }
}
Hooks.on("renderApplicationV2", (app, el) => {
  try {
    const raiz = app?.element ?? el;
    if (!raiz?.classList?.contains("nauren-rpg") && !raiz?.classList?.contains("nauren-kit")) return;
    naurenDesrolarJanela(raiz);
    if (!raiz.dataset.naurenDesrolar) {
      raiz.dataset.naurenDesrolar = "1";
      raiz.addEventListener("scroll", () => naurenDesrolarJanela(raiz));
      raiz.querySelector(":scope > .window-content")?.addEventListener("scroll", () => naurenDesrolarJanela(raiz));
    }
  } catch (err) { /* segue */ }
});
Hooks.on("renderApplicationV2", (app, el) => {
  try {
    const raiz = app?.element ?? el;
    if (!raiz?.classList?.contains("nauren-kit")) return;
    naurenPintarJanela(raiz, naurenAtorDaJanela(app));
    raiz.querySelectorAll("[data-nc-ator]").forEach(x => {
      let a = null; try { a = fromUuidSync(x.dataset.ncAtor, { strict: false }); a = a?.actor ?? a; } catch (err) { a = null; }
      if (a) naurenPintarJanela(x, a);
    });
  } catch (err) { console.warn("Nauren RPG | cores da janela", err); }
});

async function naurenPostarCard({ ator = null, titulo, icone = "", fonte = "", linhas = [], descricao = "", flags = {}, prioridade = null }) {
  const templateData = {
    title: titulo,
    icon: icone || ator?.img || "icons/svg/d20-highlight.svg",
    actorName: ator?.name ?? game.user.name,
    playerName: game.user.name,
    playerColor: game.user.color.css,
    fonte,
    hasD20: false, isAdvDis: false, d20Boxes: [],
    secondaryLines: linhas.filter(l => l && (l.value !== undefined && l.value !== "")),
    breakdown: [], breakdownAlvos: [], extras: [],
    descricaoRegra: descricao,
    prioridade,
    hasDetails: false
  };
  const html = await foundry.applications.handlebars.renderTemplate("systems/nauren/templates/chat/roll-card.hbs", templateData);
  const extras = prioridade?.selecao ? { casterUuid: ator?.uuid, cardData: templateData } : {};
  return ChatMessage.create({
    speaker: ator ? ChatMessage.getSpeaker({ actor: ator }) : ChatMessage.getSpeaker({ user: game.user }),
    content: html,
    flags: { nauren: { cardAuditavel: true, ...extras, ...flags } }
  });
}

/**
 * Posta a descrição de um item no chat, usando o mesmo tema visual (roxo/
 * dourado) dos cards de rolagem - mas mostrando a descrição DIRETO, sem
 * precisar clicar pra expandir (ver "descricaoDireta" em roll-card.hbs,
 * diferente do que acontece quando a descrição vem JUNTO de uma rolagem,
 * que continua escondida atrás do "⌄" como sempre foi). Funciona pra um
 * item embutido num ator OU solto no mundo/compêndio (não depende de
 * NaurenActorSheet nem de nenhuma ficha aberta).
 */
async function naurenPostarDescricaoNoChat(item) {
  // ProseMirror às vezes salva uma tag vazia (ex: "<p></p>") em vez de string
  // vazia de verdade quando o campo nunca foi preenchido - remove as tags
  // antes de checar, senão isso passaria como "tem descrição" por engano.
  const textoSemTags = (item.system.descricao ?? "").replace(/<[^>]*>/g, "").trim();
  if (!textoSemTags) {
    ui.notifications.warn(`"${item.name}" não tem nenhuma descrição escrita ainda.`);
    return;
  }
  const { TextEditor } = foundry.applications.ux;
  const enriched = await (foundry.applications?.ux?.TextEditor?.implementation ?? TextEditor).enrichHTML(item.system.descricao, {
    secrets: item.isOwner,
    relativeTo: item
  });
  const actor = item.actor; // null se o item estiver solto no mundo/compêndio
  const templateData = {
    title: item.name,
    icon: item.img || "icons/svg/book.svg",
    actorName: actor?.name ?? game.user.name,
    playerName: game.user.name,
    playerColor: game.user.color.css,
    hasD20: false,
    isAdvDis: false,
    d20Boxes: [],
    secondaryLines: [],
    breakdown: [],
    breakdownAlvos: [],
    description: enriched,
    extras: [],
    descricaoDireta: true,
    hasDetails: false
  };
  const html = await foundry.applications.handlebars.renderTemplate("systems/nauren/templates/chat/roll-card.hbs", templateData);
  await ChatMessage.create({
    speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker({ user: game.user }),
    content: html
  });
}

/**
 * Documento de Ator customizado. Necessário para poder somar os bônus
 * manuais (aba Opções) e os itens de "efeito" ativos DEPOIS que os itens
 * embutidos já estão disponíveis (o que não é garantido dentro do
 * TypeDataModel#prepareDerivedData, que roda antes disso).
 */
/**
 * Valores finais da ficha (já com pigmentos, efeitos, peculiaridades,
 * condições e Fixar aplicados por NaurenActor#prepareDerivedData) - usado
 * pelo "Export Data" (ver NaurenActor#exportToJSON).
 */
function naurenValoresCalculadosParaExport(actor) {
  const s = actor.system;
  const par = r => ({ value: r?.value ?? 0, max: r?.max ?? 0 });
  return {
    versao: 2,
    exportadoEm: new Date().toISOString(),
    sistemaVersao: game.system?.version ?? null,
    atributosTotais: { ...(s.atributosTotais ?? {}) },
    espirito: s.espirito?.max ?? 0,
    vitalidade: s.vitalidade?.max ?? 0,
    poderAtaque: s.poderAtaque?.value ?? 0,
    poderMagia: s.poderMagia?.value ?? 0,
    defesa: s.defesaTotal ?? s.defesa ?? 10,
    movimento: s.movimentoTotal ?? s.movimento ?? 6,
    vida: par(s.vida),
    mana: par(s.mana),
    estamina: par(s.estaminaCombate),
    dadosDestino: par(s.dadosDestino),
    estresse: par(s.stress),
    pontosSubclasse: par(s.pontosSubclasse),
    recursos: (s.recursosCustom ?? []).map(r => ({ id: r.id, nome: r.nome, valor: r.valor, max: r.max })),
    // 0.94.5 (versão 2): classe, Subclasse, permanentes e o que a classe cria (Inventor).
    estressePermanente: s.estressePermanente ?? 0,
    classe: naurenClasseParaExport(actor),
    permanentes: naurenPermanentesParaExport(actor),
    criadosPelaClasse: naurenCriadosPelaClasseParaExport(actor),
    torre: naurenItensTorreParaExport(actor)
  };
}
/** Classe, nível e Subclasse (nós com ponto investido). */
function naurenClasseParaExport(actor) {
  const classe = actor.items.find(i => i.type === "classe");
  const sub = actor.items.find(i => i.type === "subclasse");
  const nos = (sub?.system?.nos ?? []).filter(n => (n.rankAtual ?? 0) > 0).map(n => ({ id: n.id, nome: n.nome, rank: n.rankAtual, rankMax: n.rankMax ?? 1 }));
  return {
    nome: classe?.name ?? (actor.system?.classe || null), identificador: classe?.system?.identifier ?? null, nivel: actor.system?.nivel ?? 1,
    subclasse: sub ? { nome: sub.name, pontosGastos: nos.reduce((t, n) => t + (n.rank ?? 0), 0), nos } : null
  };
}
/** O que mudou a ficha para sempre: Efeitos permanentes, Peculiaridades ganhas por item/habilidade e os "uma vez por personagem". */
function naurenPermanentesParaExport(actor) {
  return {
    efeitos: actor.items.filter(i => i.type === "efeito" && i.getFlag("nauren", "efeitoPermanente")).map(i => ({
      nome: i.getFlag("nauren", "efeitoPermanente"), campo: i.system.modificadores?.[0]?.campo ?? null, total: i.getFlag("nauren", "efeitoPermanenteTotal") ?? 0,
      vezes: i.getFlag("nauren", "efeitoPermanenteVezes") ?? 1, idFoundry: i.id })),
    peculiaridadesGanhas: actor.items.filter(i => i.type === "peculiaridade" && i.getFlag("nauren", "permanenteDe")).map(i => ({ nome: i.name, origem: i.getFlag("nauren", "permanenteDe"), idFoundry: i.id })),
    umaVezPorPersonagem: Object.keys(actor.getFlag("nauren", "umaVez") ?? {})
  };
}
/**
 * Itens que a própria classe cria (não se compram): invenções da Bancada (Arma de Inventor, Botas, armas da Loja),
 * Frascos do Alambique e especiais, Ferramentas e a Obra Prima. O bot não deve tratá-los como item faltando no inventário.
 */
function naurenCriadosPelaClasseParaExport(actor) {
  const ehFrasco = i => i.type === "consumivel" && Array.isArray(i.system?.frasco?.efeitos);
  const invencoes = actor.items.filter(i => i.getFlag("nauren", "projeto") && !ehFrasco(i)).map(i => {
    const p = i.getFlag("nauren", "projeto");
    return { nome: i.name, tipo: i.type, fonte: p.fonteNome ?? null, formula: p.formula ?? null, loja: String(p.fonte ?? "").endsWith("#loja"),
      escolhas: foundry.utils.deepClone(p.escolhas ?? {}), pontosGastos: p.gasto ?? 0, melhorias: p.melhoriasFeitas ?? 0, equipado: !!i.system.equipado,
      usos: i.system.usaUsos ? { atual: i.system.usosAtual ?? 0, max: i.system.usosMax ?? 0 } : null, idFoundry: i.id };
  });
  const frascos = actor.items.filter(i => i.type === "consumivel" && i.system?.frasco && Array.isArray(i.system.frasco.efeitos)).map(i => ({
    nome: i.name, quantidade: i.system.quantidade ?? 1, efeitos: (i.system.frasco.efeitos ?? []).map(e => naurenTextoEfeitoFrasco(e)).filter(Boolean),
    beneficios: i.system.frasco.beneficios ?? 0, semColateral: !!i.system.frasco.semColateral, umaVezPorPersonagem: i.system.frasco.umaVezChave || null,
    especial: !!i.getFlag("nauren", "frascoEspecial"), idFoundry: i.id }));
  const ferramentas = actor.items.filter(i => i.getFlag("nauren", "grupoUI") === "ferramenta").map(i => ({ nome: i.name, tipo: i.type, equipado: i.type !== "armadura" || !!i.system.equipado, idFoundry: i.id }));
  const op = typeof naurenObraPrimaDe === "function" ? naurenObraPrimaDe(actor) : null;
  return {
    invencoes, frascos, ferramentas,
    obraPrima: op ? { nome: op.name, nivel: op.system?.nivel ?? null, atributos: Object.fromEntries(Object.entries(op.system?.atributos ?? {}).map(([k, v]) => [k, v?.value ?? 0])),
      vida: { value: op.system?.vida?.value ?? 0, max: op.system?.vida?.max ?? 0 }, uuid: op.uuid } : null
  };
}

/**
 * 0.94.24: passivas de item que precisam de um Efeito na ficha (gatilho "ao acertar", efeito nos
 * ataques, imunidade a Condição). Arma/Armadura com "efeitosAoEquipar" (UUIDs de Efeitos) colocam
 * uma cópia de cada um no personagem enquanto estiverem equipadas; desequipar, remover o item ou
 * apagar a referência tira a cópia. A cópia guarda de qual item veio (flags.nauren.concedidoAoEquipar).
 */
async function naurenSincronizarEfeitosAoEquipar(actor) {
  if (!actor?.items || !actor.isOwner) return;
  const desejados = new Map(); // "itemId|uuid" -> uuid
  for (const it of actor.items) {
    if (it.type !== "arma" && it.type !== "armadura") continue;
    if (!it.system.equipado) continue;
    for (const u of it.system.efeitosAoEquipar ?? []) if (u) desejados.set(`${it.id}|${u}`, { itemId: it.id, uuid: u, nomeItem: it.name });
  }
  // 0.94.31: a mesma passiva (Golpe Firme, Fio Afiado, Sede, Espinhos) em dois Itens Pigmentados não soma: fica só a maior.
  // Firmeza é por Condição (imunidades diferentes convivem).
  {
    const melhor = new Map();
    for (const [k, d] of desejados) {
      const orig = await fromUuid(d.uuid).catch(() => null);
      if (!orig) continue;
      d.orig = orig;
      const tipo = String(orig.name).replace(/\s*\(.*$/, "").trim();
      const sysO = orig.system ?? {};
      const grupo = tipo === "Firmeza" ? `${tipo}|${(sysO.imunidadesCondicoes ?? []).join(",")}` : tipo;
      const bruto = sysO.efeitosEmAtaques?.[0]?.danoExtraDado ?? sysO.gatilhos?.[0]?.quantidade ?? "0";
      const val = parseFloat(String(bruto)) || 0;
      const atual = melhor.get(grupo);
      if (!atual || val > atual.val) melhor.set(grupo, { k, val });
      d.grupo = grupo;
    }
    for (const [k, d] of [...desejados]) if (d.grupo && melhor.get(d.grupo)?.k !== k) desejados.delete(k);
  }
  const atuais = actor.items.filter(i => i.getFlag("nauren", "concedidoAoEquipar"));
  const apagar = atuais.filter(i => { const c = i.getFlag("nauren", "concedidoAoEquipar"); return !desejados.has(`${c.itemId}|${c.uuid}`); }).map(i => i.id);
  const jaTem = new Set(atuais.map(i => { const c = i.getFlag("nauren", "concedidoAoEquipar"); return `${c.itemId}|${c.uuid}`; }));
  const criar = [];
  for (const [k, d] of desejados) {
    if (jaTem.has(k)) continue;
    const orig = d.orig ?? await fromUuid(d.uuid).catch(() => null);
    if (!orig) { console.warn(`Nauren RPG | Efeito ao equipar não encontrado (${d.uuid}) em "${d.nomeItem}".`); continue; }
    const dados = orig.toObject(); delete dados._id;
    if (dados.system && "ativo" in dados.system) dados.system.ativo = true;
    dados.flags = foundry.utils.mergeObject(dados.flags ?? {}, { nauren: { concedidoAoEquipar: { itemId: d.itemId, uuid: d.uuid, nomeItem: d.nomeItem } } });
    criar.push(dados);
  }
  if (apagar.length) await actor.deleteEmbeddedDocuments("Item", apagar).catch(err => console.warn("Nauren RPG | Falha ao tirar Efeito do item desequipado.", err));
  if (criar.length) await actor.createEmbeddedDocuments("Item", criar).catch(err => console.warn("Nauren RPG | Falha ao colocar Efeito do item equipado.", err));
}
const naurenDispararSyncEquipar = (item, userId) => {
  if (userId !== game.user.id || !(item?.parent instanceof Actor)) return;
  if (item.type !== "arma" && item.type !== "armadura" && !item.getFlag?.("nauren", "concedidoAoEquipar")) return;
  const ator = item.parent;
  // Uma sincronização por vez por personagem (criar + equipar em seguida não duplicam o Efeito).
  const fila = (naurenFilaSyncEquipar.get(ator.uuid) ?? Promise.resolve()).then(() => naurenSincronizarEfeitosAoEquipar(ator)).catch(err => console.warn("Nauren RPG | Efeitos ao equipar.", err));
  naurenFilaSyncEquipar.set(ator.uuid, fila);
};
const naurenFilaSyncEquipar = new Map();
Hooks.on("createItem", (item, opts, userId) => { if ((item.system?.efeitosAoEquipar ?? []).length) naurenDispararSyncEquipar(item, userId); });
Hooks.on("deleteItem", (item, opts, userId) => { if ((item.system?.efeitosAoEquipar ?? []).length) naurenDispararSyncEquipar(item, userId); });
Hooks.on("updateItem", (item, changes, opts, userId) => {
  if (!changes?.system || !("equipado" in changes.system || "efeitosAoEquipar" in changes.system)) return;
  if (!(item.system?.efeitosAoEquipar ?? []).length && !item.parent?.items?.some(i => i.getFlag("nauren", "concedidoAoEquipar")?.itemId === item.id)) return;
  naurenDispararSyncEquipar(item, userId);
});

/**
 * Bloco "curador.torre" do Export Data: o que a ficha tem de itens da Torre Infinita,
 * o equipamento sem marca da Torre e o registro de consumo - para o bot conferir com o
 * inventário do Discord. Versão própria (o resto do "curador" segue na versão 1).
 */
function naurenItensTorreParaExport(actor) {
  const catalogo = new Set((typeof NAUREN_TORRE !== "undefined" ? NAUREN_TORRE.itens : []).map(i => i.chave));
  const quantidadeDe = i => i.type === "consumivel" ? (i.system.quantidade ?? 0) : 1;
  const bonusEscolhido = i => {
    const esc = i.getFlag("nauren", "escolhaAoReceber");
    if (!esc?.rotulos?.length) return null;
    const k = esc.rotulos.findIndex((r, idx) => i.system.efeitosVinculados?.[(esc.inicio ?? 0) + idx]?.ativo);
    return k >= 0 ? esc.rotulos[k] : null;
  };
  const daTorre = actor.items.filter(i => i.getFlag("nauren", "torre")?.chave);
  return {
    versao: 1,
    catalogoDoSistema: typeof NAUREN_TORRE_VERSAO !== "undefined" ? NAUREN_TORRE_VERSAO : null,
    itens: daTorre.map(i => {
      const t = i.getFlag("nauren", "torre");
      return {
        chave: t.chave, nome: i.name, tipo: i.type, quantidade: quantidadeDe(i), equipado: !!i.system.equipado,
        tier: t.tier ?? null, raridade: t.raridade ?? null, pigmento: t.pigmento ?? null, loja: t.loja ?? null, preco: t.preco ?? null,
        noCatalogoDoSistema: catalogo.has(t.chave) || !!NAUREN_TORRE_RETIRADOS?.[t.chave], retiradoDoCatalogo: !!NAUREN_TORRE_RETIRADOS?.[t.chave], bonusEscolhido: bonusEscolhido(i), idFoundry: i.id
      };
    }),
    semTorre: actor.items.filter(i => ["arma", "armadura", "consumivel"].includes(i.type) && !i.getFlag("nauren", "torre")?.chave).map(i => ({
      nome: i.name, tipo: i.type, quantidade: quantidadeDe(i), equipado: !!i.system.equipado, idFoundry: i.id,
      doCompendioDoSistema: String(i._stats?.compendiumSource ?? i.flags?.core?.sourceId ?? "").startsWith("Compendium.world.nauren-"),
      seedId: i.getFlag("nauren", "seedId") ?? null,          // identificação de fábrica (ex.: "armadura-placa-simples"); sobrevive a renomear
      chaveCatalogo: naurenChaveTorreDoItem(i),                // chave do catálogo do bot para este básico (null se não houver)
      doCriador: !!i.getFlag("nauren", "escolhaEquipamentoCriador"), // escolhido como equipamento inicial no Criador de Personagem
      // 0.94.5: item que a classe cria (não se compra): "invencao" | "frasco" | "ferramenta" | null
      criadoPelaClasse: (i.type === "consumivel" && Array.isArray(i.system?.frasco?.efeitos)) ? "frasco" : i.getFlag("nauren", "projeto") ? "invencao" : i.getFlag("nauren", "grupoUI") === "ferramenta" ? "ferramenta" : null
    })),
    usos: foundry.utils.deepClone(actor.getFlag("nauren", "torreUsos") ?? [])
  };
}

/**
 * Itens básicos do sistema (sem marca da Torre) que existem no catálogo do bot: seedId -> chave.
 * Os seedIds são fixos (o sistema atualiza o compêndio por eles). Mesma tabela do documento do bot.
 */
const NAUREN_SEED_PARA_CHAVE_TORRE = {
  "armadura-robe-simples": "robe-simples", "armadura-manto-cerimonial": "manto-cerimonial", "armadura-couro-simples": "couro-simples",
  "armadura-couro-reforcado": "couro-reforcado", "armadura-cota-simples": "cota-simples", "armadura-cota-reforcada": "cota-reforcada",
  "armadura-placa-simples": "placa-simples", "armadura-placa-reforcada": "placa-reforcada", "armadura-capa-simples": "capa-simples",
  "armadura-capa-reforcada": "capa-reforcada", "armadura-botas-simples": "botas-simples", "armadura-grevas-reforcadas": "grevas-reforcadas",
  "escudo-simples": "escudo-simples", "escudo-medio": "escudo-medio", "escudo-grande": "escudo-grande",
  "arma-leve": "adaga", "arma-media": "espada", "arma-alcance": "lanca", "arma-pesada": "martelo-de-guerra",
  "arma-distancia-arco": "arco", "arma-distancia-besta": "besta", "arma-distancia-arma-de-fogo": "arma-de-fogo", "arma-catalisador-gariart": "varinha",
  "consumivel-flecha": "municao", "consumivel-municao-fogo": "municao",
  "consumivel-frasco-veneno-serpente-palida": "veneno-serpente-palida", "consumivel-frasco-veneno-sangue-negro": "sangue-negro",
  "consumivel-frasco-veneno-lotus-sombrio": "lotus-sombrio", "consumivel-frasco-veneno-icor-acido": "icor-acido",
  "consumivel-frasco-veneno-fel-quimera": "fel-de-quimera", "consumivel-frasco-veneno-tinta-vazio": "tinta-do-vazio"
};
/** Chave do catálogo do bot para um item: a marca da Torre ou, nos básicos do sistema, pelo seedId. */
function naurenChaveTorreDoItem(item) {
  return item?.getFlag?.("nauren", "torre")?.chave || NAUREN_SEED_PARA_CHAVE_TORRE[item?.getFlag?.("nauren", "seedId")] || null;
}

/** Registro de consumo (lido pelo bot no export): itens da Torre e básicos do sistema com chave no catálogo. Guarda os 300 mais recentes. */
async function naurenRegistrarUsoTorre(actor, item, quantidade = 1, motivo = "usado") {
  const chave = naurenChaveTorreDoItem(item);
  if (!chave || !actor?.isOwner) return;
  const lista = foundry.utils.deepClone(actor.getFlag("nauren", "torreUsos") ?? []);
  lista.push({ chave, nome: item.name, seedId: item.getFlag("nauren", "seedId") ?? null, quantidade, motivo, em: new Date().toISOString(),
    cena: canvas?.scene?.name ?? "", rodada: game.combat?.started ? game.combat.round : null });
  await actor.setFlag("nauren", "torreUsos", lista.slice(-300)).catch(err => console.warn("Nauren RPG | Falha ao registrar uso da Torre.", err));
}

/* ---- Importar ficha de outro mundo (0.93.3) ----
 * Cada mundo cria os compêndios do sistema com IDs próprios: uma ficha exportada no mundo A aponta para
 * "Compendium.world.nauren-condicoes-e-venenos.Item.<id do A>", que não existe no mundo B. O "Export Data"
 * agora leva junto o nome de cada referência (bloco "naurenRefs"); o "Import Data" troca as que não
 * existem aqui pela de mesmo nome neste mundo e avisa o Mestre do que não achou.
 */
const NAUREN_RE_UUID_COMPENDIO = /Compendium\.([\w-]+)\.([\w-]+)\.(Item|Actor|JournalEntry|Macro|RollTable)\.([A-Za-z0-9]{16})/g;
const NAUREN_RE_UUID_MUNDO = /(?<![\w.])(Item|Actor)\.([A-Za-z0-9]{16})(?![\w.])/g;
/** A referência existe neste mundo? */
function naurenReferenciaExiste(uuid) {
  let m = /^Compendium\.([\w-]+)\.([\w-]+)\.(\w+)\.([A-Za-z0-9]{16})$/.exec(uuid);
  if (m) { const pk = game.packs?.get(`${m[1]}.${m[2]}`); return !!(pk?.index?.has?.(m[4]) || pk?.index?.get?.(m[4])); }
  m = /^(Item|Actor)\.([A-Za-z0-9]{16})$/.exec(uuid);
  if (m) return !!(m[1] === "Item" ? game.items : game.actors)?.get?.(m[2]);
  return true;
}
/** Percorre todas as strings de um objeto (troca no lugar quando "trocar" devolve algo). */
function naurenPercorrerTextos(obj, trocar, pular = new Set(), prof = 0) {
  if (!obj || typeof obj !== "object" || prof > 40) return;
  for (const k of Object.keys(obj)) {
    if (pular.has(k)) continue;
    const v = obj[k];
    if (typeof v === "string") { const n = trocar(v, k); if (typeof n === "string" && n !== v) obj[k] = n; }
    else if (v && typeof v === "object") naurenPercorrerTextos(v, trocar, pular, prof + 1);
  }
}
const NAUREN_PULAR_NA_IMPORTACAO = new Set(["_stats", "naurenRefs", "curador"]);
/** Export: nome, tipo e compêndio de cada referência que a ficha usa. */
function naurenMapaReferenciasExport(data) {
  const mapa = {};
  const anotar = uuid => {
    if (mapa[uuid]) return;
    let doc = null;
    try { doc = fromUuidSync(uuid); } catch (err) { doc = null; }
    if (!doc?.name) return;
    const m = /^Compendium\.([\w-]+\.[\w-]+)\./.exec(uuid);
    const pk = m ? game.packs?.get(m[1]) : null;
    mapa[uuid] = { nome: doc.name, tipo: doc.type ?? null, compendio: pk?.metadata?.label ?? null };
  };
  naurenPercorrerTextos(data, v => {
    for (const m of v.matchAll(NAUREN_RE_UUID_COMPENDIO)) anotar(m[0]);
    for (const m of v.matchAll(NAUREN_RE_UUID_MUNDO)) anotar(m[0]);
  }, NAUREN_PULAR_NA_IMPORTACAO);
  return mapa;
}
/** Acha neste mundo o documento de mesmo nome (e tipo) que a referência antiga apontava. */
function naurenAcharReferenciaLocal(info, uuidVelho) {
  const alvo = naurenNomeNormalizado(info?.nome);
  if (!alvo) return null;
  const mc = /^Compendium\.([\w-]+\.[\w-]+)\.(\w+)\./.exec(uuidVelho);
  const mw = /^(Item|Actor)\./.exec(uuidVelho);
  const docName = mc?.[2] ?? mw?.[1] ?? "Item";
  const bate = e => naurenNomeNormalizado(e?.name) === alvo && (!info.tipo || !e.type || e.type === info.tipo);
  const packs = (game.packs?.filter?.(p => (p.documentName ?? p.metadata?.type) === docName)) ?? [];
  const ordem = [
    ...packs.filter(p => mc && p.collection === mc[1]),
    ...packs.filter(p => info.compendio && p.metadata?.label === info.compendio),
    ...packs.filter(p => /^world\.nauren-/.test(p.collection) || /^Nauren/.test(p.metadata?.label ?? "")),
    ...packs
  ];
  const vistos = new Set();
  for (const pk of ordem) {
    if (vistos.has(pk.collection)) continue;
    vistos.add(pk.collection);
    const e = pk.index?.find?.(bate);
    if (e) return e.uuid ?? `Compendium.${pk.collection}.${docName}.${e._id}`;
  }
  const doMundo = (docName === "Actor" ? game.actors : game.items)?.find?.(bate);
  return doMundo?.uuid ?? null;
}
/**
 * Import: troca as referências que não existem neste mundo pela de mesmo nome daqui. O nome vem do bloco
 * "naurenRefs" do arquivo, da origem dos itens da própria ficha e dos links @UUID[...]{Nome} das descrições.
 * Devolve { consertados: [{nome, de, para}], perdidos: [nome ou uuid] }.
 */
function naurenConsertarReferenciasImport(data, { idNovo = null } = {}) {
  const mapa = { ...(data?.naurenRefs ?? {}) };
  // Origem de cada item da ficha (o nome é o do próprio item): compendiumSource, sourceId ou a marca do sistema.
  const origens = d => [d?._stats?.compendiumSource, d?.flags?.core?.sourceId, d?.flags?.nauren?.origemUuid].filter(Boolean);
  for (const it of data?.items ?? []) for (const o of origens(it)) if (!mapa[o]) mapa[o] = { nome: it.name, tipo: it.type };
  for (const o of origens(data)) if (!mapa[o]) mapa[o] = { nome: data.name, tipo: data.type };
  naurenPercorrerTextos(data, v => {
    for (const m of v.matchAll(/@UUID\[([^\]]+)\]\{([^}]+)\}/g)) if (!mapa[m[1]]) mapa[m[1]] = { nome: m[2] };
  }, NAUREN_PULAR_NA_IMPORTACAO);
  const consertados = new Map(), perdidos = new Map();
  // Itens desta mesma ficha ("Actor.<id antigo>.Item.<id>") passam a apontar para a ficha nova.
  const idVelho = data?._id;
  const trocarId = idNovo && idVelho && idNovo !== idVelho;
  const resolver = uuid => {
    if (naurenReferenciaExiste(uuid)) return uuid;
    if (consertados.has(uuid)) return consertados.get(uuid).para;
    const info = mapa[uuid];
    const novo = info ? naurenAcharReferenciaLocal(info, uuid) : null;
    if (novo) { consertados.set(uuid, { nome: info.nome, de: uuid, para: novo }); return novo; }
    perdidos.set(uuid, info?.nome ?? null);
    return uuid;
  };
  naurenPercorrerTextos(data, v => {
    let n = v;
    if (trocarId && n.includes(`Actor.${idVelho}.`)) n = n.split(`Actor.${idVelho}.`).join(`Actor.${idNovo}.`);
    n = n.replace(NAUREN_RE_UUID_COMPENDIO, m => resolver(m));
    n = n.replace(NAUREN_RE_UUID_MUNDO, m => resolver(m));
    return n;
  }, NAUREN_PULAR_NA_IMPORTACAO);
  delete data.naurenRefs;
  return { consertados: [...consertados.values()], perdidos: [...perdidos.entries()].map(([uuid, nome]) => ({ uuid, nome })) };
}
/** Card só para o Mestre com o que a importação consertou e o que ficou sem par neste mundo. */
async function naurenAvisarImportacao(doc, rel) {
  if (!rel || (!rel.consertados.length && !rel.perdidos.length)) return;
  const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const nomes = [...new Set(rel.consertados.map(c => c.nome))];
  const comNome = [...new Set(rel.perdidos.filter(p => p.nome).map(p => p.nome))];
  const semNome = rel.perdidos.filter(p => !p.nome).length;
  const linhas = [];
  if (nomes.length) linhas.push(`<p><strong>Consertei ${rel.consertados.length} referência(s) de outro mundo</strong> (achei pelo nome neste mundo): ${nomes.map(esc).join(", ")}.</p>`);
  if (comNome.length) linhas.push(`<p><strong>Não achei neste mundo:</strong> ${comNome.map(esc).join(", ")}. Essas partes ficam sem efeito até você escolher o item de novo na ficha.</p>`);
  if (semNome) linhas.push(`<p><strong>${semNome} referência(s) sem nome</strong>: o arquivo veio de um export antigo, que não guardava os nomes. Exporte de novo no mundo de origem (sistema 0.93.3 ou mais novo) para eu consertar todas.</p>`);
  const gms = game.users?.filter?.(u => u.isGM).map(u => u.id) ?? [];
  await ChatMessage.create({ content: `<div class="nauren-card-import"><h3>Importação: ${esc(doc.name)}</h3>${linhas.join("")}</div>`, whisper: gms, speaker: { alias: "Nauren" } }).catch(() => null);
  if (comNome.length || semNome) ui.notifications?.warn?.(`${doc.name}: ${comNome.length + semNome} referência(s) de outro mundo não foram encontradas. Veja o chat.`);
  else ui.notifications?.info?.(`${doc.name}: ${rel.consertados.length} referência(s) de outro mundo consertada(s).`);
}
/** importFromJSON comum a Ator e Item: conserta as referências e avisa. */
async function naurenImportarComConserto(doc, json, superImport) {
  let data;
  try { data = JSON.parse(json); } catch (err) { return superImport(json); }
  const rel = naurenConsertarReferenciasImport(data, { idNovo: doc.id });
  doc._naurenUltimaImportacao = rel;
  const r = await superImport(JSON.stringify(data));
  await naurenAvisarImportacao(doc, rel);
  return r;
}
/** Export comum: leva o mapa de nomes das referências junto. */
function naurenAnexarRefsExport(data) {
  try { const m = naurenMapaReferenciasExport(data); if (Object.keys(m).length) data.naurenRefs = m; } catch (err) { console.warn("Nauren RPG | Não consegui anotar as referências do export.", err); }
  return data;
}

class NaurenItem extends Item {
  /** "Export Data" com o nome de cada referência (para importar em outro mundo sem quebrar). */
  exportToJSON(options) {
    const data = this.toCompendium(null, options);
    const origem = { world: game.world?.id, system: game.system?.id, coreVersion: game.version, systemVersion: game.system?.version };
    if (data._stats) data._stats.exportSource = origem;
    naurenAnexarRefsExport(data);
    const filename = ["fvtt", this.documentName, this.name?.slugify?.(), this.id].filterJoin("-");
    const salvar = foundry.utils.saveDataToFile ?? globalThis.saveDataToFile;
    salvar(JSON.stringify(data, null, 2), "text/json", `${filename}.json`);
  }
  async importFromJSON(json) { return naurenImportarComConserto(this, json, j => super.importFromJSON(j)); }
}

class NaurenActor extends Actor {
  async importFromJSON(json) { return naurenImportarComConserto(this, json, j => super.importFromJSON(j)); }
  /**
   * "Export Data" do Foundry com os valores FINAIS da ficha.
   * O export padrão só salva os dados brutos; os valores derivados
   * (atributos totais, Espírito, Vitalidade, PdA, PdM, Defesa e Movimento
   * totais, máximos dos recursos) são calculados em prepareDerivedData e
   * não iam para o arquivo. Aqui eles vão num bloco "curador", lido pelo
   * bot do Discord (O Curador). O bloco é ignorado pelo "Import Data"
   * (campos fora do schema são descartados), então reimportar continua
   * funcionando normalmente.
   */
  exportToJSON(options) {
    const data = this.toCompendium(null, options);
    const origem = { world: game.world.id, system: game.system.id, coreVersion: game.version, systemVersion: game.system.version };
    if (data._stats) data._stats.exportSource = origem;
    else if (data.flags) data.flags.exportSource = origem;
    data.curador = naurenValoresCalculadosParaExport(this);
    data.curador.rolagens = naurenRegistroParaExport(this); // 0.94.19: registro de rolagens (auditoria)
    naurenAnexarRefsExport(data);
    // Barras "só neste token" ficam no token da cena, que não vai no arquivo: leva para o token padrão
    // da ficha (quem importar recebe as mesmas barras ao arrastar o token).
    const barrasToken = this.getActiveTokens?.(true, true)?.map(t => t.getFlag?.("nauren", "barras")).find(b => b?.soEsteToken);
    if (barrasToken && data.prototypeToken && !foundry.utils.getProperty(data.prototypeToken, "flags.nauren.barras")) {
      foundry.utils.setProperty(data.prototypeToken, "flags.nauren.barras", foundry.utils.deepClone(barrasToken));
    }
    const filename = ["fvtt", this.documentName, this.name?.slugify(), this.id].filterJoin("-");
    const salvar = foundry.utils.saveDataToFile ?? globalThis.saveDataToFile;
    salvar(JSON.stringify(data, null, 2), "text/json", `${filename}.json`);
  }

  /** Barra de token de um recurso próprio (recursos.<id>): grava no recurso de verdade (recursosCustom). */
  async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
    if (typeof attribute === "string" && attribute.startsWith("recursos.")) {
      const id = attribute.slice(9);
      const lista = foundry.utils.deepClone(this.system.recursosCustom ?? []);
      const alvo = lista.find(r => r.id === id);
      if (!alvo) return this;
      const novo = Math.round(isDelta ? (alvo.valor ?? 0) + Number(value) : Number(value)) || 0;
      alvo.valor = Math.max(0, alvo.max ? Math.min(alvo.max, novo) : novo);
      return this.update({ "system.recursosCustom": lista });
    }
    return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
  }

  /**
   * Modificadores com fórmula que lê um valor derivado (ex.: Postura Gruhua "@espirito/2") são somados
   * antes desse valor ficar pronto. Se o valor final mudou, prepara de novo uma vez usando o valor
   * final (naurenResolverTokenFormula lê _naurenMetaPrep enquanto prepara).
   */
  /** 0.99: luz e visão dos itens vão para o token pelas mudanças de efeito do V14 (sem gravar nada no token). */
  applyActiveEffects(phase) {
    super.applyActiveEffects(phase);
    if (phase !== "initial") return;
    const lista = this.tokenActiveEffectChanges?.[phase];
    if (!Array.isArray(lista)) return;
    const minhas = this._naurenMudancasLuz ?? [];
    for (const m of minhas) { const i = lista.indexOf(m); if (i >= 0) lista.splice(i, 1); }
    try { this._naurenMudancasLuz = naurenMudancasTokenLuzVisao(this); lista.push(...this._naurenMudancasLuz); }
    catch (err) { this._naurenMudancasLuz = []; console.warn("Nauren RPG | luz/visão dos itens", err); }
  }

  prepareData() {
    this._naurenPreparando = true;
    try { super.prepareData(); } finally { this._naurenPreparando = false; }
    const sys = this.system;
    if (!sys?.bonus || (this._naurenRepreparos ?? 0) > 0) return;
    const usaDerivado = this.items?.some?.(i => (i.system?.modificadores ?? []).concat(...(i.system?.efeitosVinculados ?? []).map(e => e.modificadores ?? []))
      .some(m => /@(espirito|poderAtaque|poderMagia|vitalidade|forca|agilidade|estamina|inteligencia|destino)\b/.test(String(m?.valor ?? ""))));
    if (!usaDerivado) return;
    const meta = { espirito: sys.espirito?.max ?? 0, poderAtaque: sys.poderAtaque?.value ?? 0, poderMagia: sys.poderMagia?.value ?? 0, vitalidade: sys.vitalidade?.max ?? 0, ...(sys.atributosTotais ?? {}) };
    const antes = this._naurenMetaPrep;
    this._naurenMetaPrep = meta;
    if (antes && Object.keys(meta).every(k => meta[k] === antes[k])) return;
    this._naurenRepreparos = 1;
    this._naurenPreparando = true;
    try { super.prepareData(); } finally { this._naurenPreparando = false; this._naurenRepreparos = 0; }
    this._naurenMetaPrep = { espirito: sys.espirito?.max ?? 0, poderAtaque: sys.poderAtaque?.value ?? 0, poderMagia: sys.poderMagia?.value ?? 0, vitalidade: sys.vitalidade?.max ?? 0, ...(sys.atributosTotais ?? {}) };
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    const sys = this.system;
    // Recursos próprios de classe/subclasse (Energia, Determinação...) num endereço fixo,
    // para aparecerem como barras de token: system.recursos.<id> = { value, max }.
    if (sys) {
      sys.recursos = {};
      for (const r of sys.recursosCustom ?? []) if (r?.id) sys.recursos[r.id] = { value: r.valor ?? 0, max: r.max || r.valor || 0, nome: r.nome || r.id };
    }
    if (!sys?.bonus) return; // ex: NPCs futuros com outro shape de dados

    // Soma, num único "pacote" por origem, os 18 campos que tanto o bônus
    // manual quanto um item de Efeito/Condição/Pigmento podem preencher.
    const total = {
      ataque: 0, defesa: 0, bloqueio: 0, esquiva: 0, pontosSubclasse: 0, movimento: 0,
      forca: 0, agilidade: 0, estamina: 0, inteligencia: 0, destino: 0,
      espirito: 0, poderAtaque: 0, poderMagia: 0, vitalidade: 0,
      vida: 0, mana: 0, estaminaCombate: 0, dadosDestino: 0, estresse: 0, critMin: 0, critFailMax: 0, limiarDeflexao: 0, reducaoDano: 0, reducaoDanoAtaque: 0, reducaoDanoPercentual: 0, alcanceBonus: 0,
      perjurioLimiar: 0, gracaLimiar: 0, vidaBonusPorNivel: 0, danoRecebido: 0, curaRecebidaPercentual: 0, limiteOfensivo: 0, categoria: 0
    };
    // Acumulador SEPARADO só pra Pigmento - igual "total" na forma, mas
    // NUNCA aparece como "+X = Y" na ficha (esse formato é pra bônus
    // temporário de Efeito/Opções/Armadura). O Pigmento é permanente, então
    // o valor dele já entra "dentro" do número principal mostrado - só o
    // que sobrar de temporário (em "total") continua aparecendo com o "+".
    const totalPigmento = {
      ataque: 0, defesa: 0, bloqueio: 0, esquiva: 0, pontosSubclasse: 0, movimento: 0,
      forca: 0, agilidade: 0, estamina: 0, inteligencia: 0, destino: 0,
      espirito: 0, poderAtaque: 0, poderMagia: 0, vitalidade: 0,
      vida: 0, mana: 0, estaminaCombate: 0, dadosDestino: 0, estresse: 0, critMin: 0, critFailMax: 0, limiarDeflexao: 0, reducaoDano: 0, reducaoDanoAtaque: 0, reducaoDanoPercentual: 0, alcanceBonus: 0,
      perjurioLimiar: 0, gracaLimiar: 0, vidaBonusPorNivel: 0, danoRecebido: 0, curaRecebidaPercentual: 0, limiteOfensivo: 0, categoria: 0
    };
    // Campos que alguma fonte pediu pra FIXAR (ver naurenInterpretarModificador)
    // em vez de somar - trava o campo exatamente naquele valor, ignorando a
    // base e qualquer bônus aditivo de qualquer fonte pra esse mesmo campo.
    // A ORDEM em que as fontes são processadas mais abaixo já favorece o que
    // faz mais sentido "ganhar" quando duas coisas tentam fixar o mesmo
    // campo ao mesmo tempo: o último processado vence, e Condição (mais
    // dinâmica/temporária) processa depois de Pigmento (identidade
    // permanente), que processa depois de Efeito/Bônus Manual.
    const fixados = {};
    // Nome de quem fixou cada campo (pro tooltip saber explicar "por quê").
    const fixadosOrigem = {};
    // Condições furam a trava "=": o que elas somam/subtraem vale POR CIMA do valor fixado
    // (ex.: Estatísticas Originais trava a Defesa, Fragmentado ainda tira 1). Uma Condição que
    // também fixa ("=0" do Preso, "=8" do Em Voo) vence a trava da ficha.
    const somaCondicoes = {};
    const fixadoPorCondicao = {};
    // Detalhamento por fonte de CADA campo que teve algo somado (não
    // fixado) - vira o texto do tooltip ao passar o mouse (ex: "Bônus
    // Manual: +1", "Poção da Força (Efeito): +2"). Um só mapa pra
    // temporário e Pigmento juntos, já que o tooltip só quer mostrar "o que
    // está contribuindo", não distinguir os dois motivos de exibição.
    const detalhes = {};
    const registrarDetalhe = (campo, origem, valor) => {
      if (!valor) return;
      detalhes[campo] = detalhes[campo] ?? [];
      detalhes[campo].push({ origem, valor });
    };
    // Bônus/dados extras de dano e cura de efeitos ativos (só itens de
    // Efeito têm esses campos - o bônus manual da aba Opções não).
    // Não entram em "total" porque não são um "stat" pra somar direto na
    // ficha; só são usados na hora de rolar dano/cura (ver _useItem).
    let danoBonusTotal = 0;
    const danoDados = [];
    let curaBonusTotal = 0;
    // Contadores de Facilidade/Dificuldade por tipo de rolagem: cada
    // "vantagem" soma 1, cada "desvantagem" subtrai 1. Positivo = rola com
    // facilidade, negativo = dificuldade, zero = normal (é assim que as duas
    // se anulam quando aparecem juntas).
    const vantagens = {};
    // De ONDE veio cada Facilidade/Dificuldade (nome do item) - para o popup de uso dizer a fonte.
    const fontesVantagem = {};
    const curaDados = [];
    const ataqueDados = [];
    // Restringir a um Tipo de Item (ver campoModificador > restringirTipoItem,
    // ex: Terra Mágica - "+1 dado de dano/cura E Facilidade em ataques,
    // só com MAGIAS") - buckets PARALELOS aos acumuladores "gerais" acima
    // (que continuam representando "vale pra tudo", sem nenhuma mudança
    // de comportamento) - só os modificadores com este campo preenchido
    // vão pra aqui em vez do bucket geral. Consumido pela Ação real na
    // hora de rolar (ver _getBonusDanoCuraDeEfeitos/_rollD20WithMode),
    // quando o TIPO do item sendo usado (magia/arma/habilidade) já é
    // conhecido - somando ao bucket geral, nunca no lugar dele.
    const porTipoVazio = () => ({ danoBonus: 0, danoDados: [], curaBonus: 0, curaDados: [], vantagemAtaque: 0 });
    const porTipoItem = { magia: porTipoVazio(), arma: porTipoVazio(), habilidade: porTipoVazio() };

    // Interpreta e aplica UM campo (número puro, "+2"/"-3", "=0" pra fixar,
    // ou fórmula com @atributo/@rank - ver naurenInterpretarModificador) no
    // acumulador certo: soma em "alvoTotal" (com o multiplicador, usado
    // pelo "por acúmulo" de Condição) e registra em "detalhes" pro tooltip,
    // ou registra em "fixados"/"fixadosOrigem" se for pra travar o valor.
    // "itemFonte" (opcional) é de onde "@rank" resolve, quando usado.
    // "origem" é o nome exibido no tooltip (item, "Bônus Manual", etc.).
    // "restringirTipo" (ver campoModificador acima) - vazio (padrão) =
    // bucket geral, como sempre foi; "magia"/"arma"/"habilidade" desvia
    // pro bucket específico daquele tipo em vez do geral.
    const aplicarCampo = (alvoTotal, campo, valorBruto, multiplicador, itemFonte, origem, restringirTipo = "") => {
      const bucketTipo = restringirTipo ? porTipoItem[restringirTipo] : null;
      // Facilidade/Dificuldade: o VALOR aqui é texto ("vantagem"/
      // "desvantagem"), não número - então sai antes de
      // naurenInterpretarModificador (que só sabe interpretar números/
      // fórmulas). Cada tipo de rolagem tem seu contador próprio; no fim,
      // facilidade e dificuldade na MESMA rolagem se anulam (ver
      // resolverVantagem, abaixo). Restrição a Tipo de Item só existe
      // pra "vantagemAtaque" especificamente (as demais - esquiva,
      // teste, recebido - não têm um "tipo de item sendo usado" no
      // momento em que valem).
      if (campo.startsWith("vantagem")) {
        const v = String(valorBruto ?? "").trim().toLowerCase();
        const delta = v === "vantagem" ? 1 : v === "desvantagem" ? -1 : 0;
        if (!delta) return;
        if (bucketTipo && campo === "vantagemAtaque") bucketTipo.vantagemAtaque += delta;
        else vantagens[campo] = (vantagens[campo] ?? 0) + delta;
        const chaveFonte = bucketTipo && campo === "vantagemAtaque" ? `vantagemAtaque:${restringirTipo}` : campo;
        (fontesVantagem[chaveFonte] ??= []).push({ origem: origem || "?", delta });
        return;
      }
      // "danoDado"/"ataqueDado" também não são um "stat" numérico pra
      // interpretar/travar - é uma STRING de fórmula de dado (ex: "1d10")
      // que se concatena na rolagem de Dano/Ataque, igual o campo
      // homônimo já funciona pra Pigmento (grade fixa antiga) - aqui é
      // a MESMA coisa, mas vinda de dentro de "modificadores[]" (Efeito/
      // Condição/Habilidade). Sai ANTES de naurenInterpretarModificador
      // de propósito - "1d10" não é um número pra arredondar.
      if (campo === "danoDado") {
        const texto = String(valorBruto ?? "").trim();
        if (texto) (bucketTipo ? bucketTipo.danoDados : danoDados).push(texto);
        return;
      }
      // Bug real corrigido: "curaDado" nunca tinha este tratamento
      // especial (só danoDado/ataqueDado tinham) - um modificador de
      // Condição/Efeito com campo "curaDado" caía direto em
      // naurenInterpretarModificador, que espera um NÚMERO/fórmula
      // numérica, não uma string de dado tipo "1d8" - nunca funcionava
      // de verdade.
      if (campo === "curaDado") {
        const texto = String(valorBruto ?? "").trim();
        if (texto) (bucketTipo ? bucketTipo.curaDados : curaDados).push(texto);
        return;
      }
      // Rolado na hora do Contra-Ataque (ver _resolverBonusComDadoPopup), não é um stat da ficha.
      if (campo === "contraAtaque") return;
      if (campo === "ataqueDado") {
        // Restrição a Tipo de Item não se aplica a Dado de Ataque (não
        // há um bucket "ataqueDados" por tipo - ver comentário no
        // catálogo de campos) - cai no geral de qualquer forma.
        const texto = String(valorBruto ?? "").trim();
        if (texto) ataqueDados.push(texto);
        return;
      }
      const mod = naurenInterpretarModificador(valorBruto, this, itemFonte);
      if (!mod) return;
      // Bônus de Dano/Cura não são um "stat" pra travar/fixar - são sempre
      // aditivos, e vão direto pro acumulador de dano/cura já existente
      // (o mesmo que os campos "Bônus fixo de Dano/Cura" de um Efeito
      // preenchem), não pro "total"/"fixados" dos outros 20 campos.
      if (campo === "danoBonus") {
        const valorFinal = mod.valor * multiplicador;
        if (bucketTipo) bucketTipo.danoBonus += valorFinal;
        else danoBonusTotal += valorFinal;
        registrarDetalhe("danoBonus", origem, valorFinal);
        return;
      }
      if (campo === "curaBonus") {
        const valorFinal = mod.valor * multiplicador;
        if (bucketTipo) bucketTipo.curaBonus += valorFinal;
        else curaBonusTotal += valorFinal;
        registrarDetalhe("curaBonus", origem, valorFinal);
        return;
      }
      if (!(campo in alvoTotal)) return; // nome de campo desconhecido/inválido - ignora
      const deCondicao = itemFonte?.type === "condicao";
      if (mod.tipo === "fixar") {
        if (fixadoPorCondicao[campo] && !deCondicao) return; // trava da ficha não sobrescreve a de uma Condição
        fixados[campo] = mod.valor;
        fixadosOrigem[campo] = origem;
        if (deCondicao) fixadoPorCondicao[campo] = true;
      } else {
        const valorFinal = mod.valor * multiplicador;
        alvoTotal[campo] += valorFinal;
        registrarDetalhe(campo, origem, valorFinal);
        if (deCondicao) somaCondicoes[campo] = (somaCondicoes[campo] ?? 0) + valorFinal;
      }
    };

    // Aplica a lista dinâmica de modificadores de Efeito/Condição (ver
    // campoModificador) - cada linha escolhe SEU campo e valor, e pode ter
    // sua PRÓPRIA tabela "Por Rank" (que troca "valor" a partir do rank
    // indicado, igual as tabelas Por Rank de Dano/Cura/Ataque das Ações).
    const somarModificadores = (lista, alvoTotal, multiplicador, itemFonte, origem) => {
      if (!lista) return;
      for (const mod of lista) {
        const valorPorRank = naurenResolverPorRank(mod.porRank, itemFonte?.system?.rankAtual, "valor");
        const valorFinal = valorPorRank ?? mod.valor;
        // Se o autor já usou "@acumulos" explicitamente na fórmula, o valor
        // JÁ reflete o total de acúmulos sozinho - não multiplica de novo
        // pelo "fator" de acúmulos da Condição (ver 3.65 acima), senão
        // dobraria o efeito (2 acúmulos = "-2" pela fórmula, x2 de novo
        // pelo fator = -4, em vez do -2 esperado). Sem "@acumulos" na
        // fórmula, mantém o comportamento de sempre (fator quem multiplica,
        // ex: escrever só "-1" já vira "-3" sozinho com 3 acúmulos).
        const multiplicadorReal = /@acumulos\b/i.test(String(valorFinal ?? "")) ? 1 : multiplicador;
        aplicarCampo(alvoTotal, mod.campo, valorFinal, multiplicadorReal, itemFonte, origem, mod.restringirTipoItem || "");
      }
    };

    // "campos" pode vir em dois formatos: a lista dinâmica de Efeito/
    // Condição (campos.modificadores existe) ou a grade fixa antiga de 18
    // campos, ainda usada pelo Bônus Manual (Opções) e por Pigmento.
    // "origem" é o texto que aparece no tooltip pra identificar esta fonte.
    const somar = (campos, alvoTotal = total, multiplicador = 1, itemFonte = null, origem = "") => {
      if (!campos) return;
      if (campos.modificadores) {
        somarModificadores(campos.modificadores, alvoTotal, multiplicador, itemFonte, origem);
      } else {
        for (const chave in alvoTotal) aplicarCampo(alvoTotal, chave, campos[chave], multiplicador, itemFonte, origem);
      }
      if (campos.danoBonus) danoBonusTotal += campos.danoBonus;
      if (campos.danoDado) danoDados.push(campos.danoDado);
      if (campos.curaBonus) curaBonusTotal += campos.curaBonus;
      if (campos.curaDado) curaDados.push(campos.curaDado);
      if (campos.ataqueDado) ataqueDados.push(campos.ataqueDado);
    };

    // 1) Bônus manual da aba Opções
    somar(sys.bonus, total, 1, null, "Bônus Manual (Opções)");

    // 2) Itens de Efeito OU Peculiaridade soltos no inventário (ativo =
    //    aplicado) - Peculiaridade nunca é "acumulável" (sempre fator 1),
    //    diferente de Efeito.
    const efeitosPorId = new Map();
    for (const item of this.items) {
      if (item.type === "efeito" || item.type === "peculiaridade") efeitosPorId.set(item.id, item);
    }

    // IDs de efeitos que estão vinculados a QUALQUER item - esses NUNCA
    // aplicam pelo "solto e ativo" sozinho, só através do vínculo (senão
    // contariam em dobro: uma vez solto, outra vez pelo vínculo).
    // IDs de efeitos vinculados a QUALQUER item OU a QUALQUER Ação de
    // qualquer item - esses NUNCA aplicam pelo "solto e ativo" sozinho
    // (senão contariam em dobro: uma vez ali, outra vez pelo vínculo).
    const idsVinculadosAAlgumItem = new Set();
    for (const item of this.items) {
      for (const v of item.system?.efeitosVinculados ?? []) idsVinculadosAAlgumItem.add(v.id);
      for (const acao of item.system?.acoes ?? []) {
        for (const v of acao.efeitosVinculados ?? []) idsVinculadosAAlgumItem.add(v.id);
      }
    }

    for (const efeito of efeitosPorId.values()) {
      if (idsVinculadosAAlgumItem.has(efeito.id)) continue; // só aplica pelo vínculo, ver bloco 3
      if (efeito.system.ativo) {
        const fatorEfeito = efeito.system.acumulativel ? Math.max(1, efeito.system.acumulos || 1) : 1;
        // "Escolha de Atributo" (só existe em Peculiaridade, ex:
        // "Desafortunado": -1 no atributo que o jogador escolheu na
        // própria ficha do item) - injeta um modificador SINTÉTICO na
        // lista antes de somar, reaproveitando o mesmo caminho de
        // "modificadores" normal em vez de um mecanismo separado.
        let modificadoresEfetivos = efeito.system.modificadores;
        if (efeito.system.usaEscolhaAtributo && efeito.system.atributoEscolhido) {
          modificadoresEfetivos = [...(efeito.system.modificadores ?? []),
            { campo: efeito.system.atributoEscolhido, valor: efeito.system.escolhaAtributoValor || "-1", porRank: [] }];
        }
        // Estilo das Marés (Guerreiro): as Guardas perdem as penalidades.
        if (efeito.system.grupoExclusivo === "guarda" && modificadoresEfetivos?.length
          && this.items.some(i => i.type === "habilidade" && i.system.ativo !== false && naurenEhItem(i, "Estilo das Marés"))) {
          modificadoresEfetivos = modificadoresEfetivos.filter(m => !/^\s*-/.test(String(m.valor ?? "")));
        }
        if (modificadoresEfetivos?.length) {
          somarModificadores(modificadoresEfetivos, total, fatorEfeito, efeito, `${efeito.name} (Efeito)`);
        } else {
          somar(efeito.system, total, fatorEfeito, efeito, `${efeito.name} (Efeito)`);
        }
      }
    }

    // 2.5) Modificadores DIRETOS de Habilidade/Magia (ex: Maestria
    //      Interior, Místico - "+1 no Espírito", escalando por rank) -
    //      bug real corrigido: Habilidades/Magias passivas simples
    //      podiam ter "system.modificadores" no nível raiz igual Efeito/
    //      Peculiaridade, mas nunca eram de fato somadas - só "efeito"/
    //      "peculiaridade" (bloco 2 acima) tinham esse tratamento.
    for (const item of this.items) {
      if ((item.type !== "habilidade" && item.type !== "magia") || !item.system.ativo) continue;
      if (!item.system.modificadores?.length) continue;
      if (item.system.modificadoresSoComEstado && !naurenTemEstado(this, item.system.modificadoresSoComEstado)) continue;
      somarModificadores(naurenSistemaEfetivo(this, item)?.modificadores ?? item.system.modificadores, total, 1, item, `${item.name} (Habilidade)`); // 0.110: com itens equipados
    }

    // 3) Itens de Efeito VINCULADOS de forma PASSIVA a uma Armadura, Arma,
    //    Habilidade ou Consumível (aplicam sozinhos, sem precisar "usar"
    //    nada). Armadura/Arma só aplicam se estiverem equipadas; Habilidade
    //    só aplica se estiver ATIVA (checkbox "Habilidade Ativa"); Consumível
    //    aplica sempre que existir no inventário. O gatilho é só o checkbox
    //    "ativo" de CADA vínculo - não depende do "Efeito ativo" da ficha do
    //    próprio Efeito. Arma/Armadura são pelo equipado; Habilidade/Magia
    //    são pelo "ativo" próprio (Magia ganhou esse campo junto da
    //    migração das magias do Druida de Habilidade pra Magia de verdade -
    //    antes ela não tinha um estado "ligado/desligado" nesse nível).
    //    Arma/Magia/Habilidade também têm Efeito Vinculado POR AÇÃO, dentro
    //    de "acoes", que só vale enquanto aquela Ação específica é usada -
    //    ver _executarAcao. Este bloco aqui é o PASSIVO, sempre ligado.)
    // 0.94.2 (Metodologias do Progresso): itens do MESMO projeto (duas Armas de Inventor) não somam o
    // mesmo efeito - por campo vale só o maior. "naoAcumulaPermitido" guarda "itemId|campo" que entra.
    const naoAcumulaPermitido = new Map();
    {
      const grupos = new Map();
      for (const it of this.items) {
        const f = it.getFlag?.("nauren", "projeto")?.fonte;
        if (!f || f.endsWith("#loja") || !it.system?.efeitosVinculados?.length) continue;
        if ((it.type === "arma" || it.type === "armadura") && !it.system.equipado) continue;
        (grupos.get(f) ?? grupos.set(f, []).get(f)).push(it);
      }
      // 0.94.31: Itens Pigmentados (Torre, raridade "magico") equipados: a MESMA passiva em dois itens não soma,
      // vale a maior (regra dos itens modulares). Atributos (Força, Agilidade...) continuam somando.
      const pigmentados = this.items.filter(it => it.getFlag?.("nauren", "torre")?.raridade === "magico" && it.system?.efeitosVinculados?.length
        && (!(it.type === "arma" || it.type === "armadura") || it.system.equipado));
      if (pigmentados.length > 1) {
        const ATRS_SOMAM = new Set(["forca", "agilidade", "estamina", "inteligencia", "destino"]);
        const melhor = new Map();
        for (const it of pigmentados) for (const v of it.system.efeitosVinculados) for (const mod of v.modificadores ?? []) {
          if (ATRS_SOMAM.has(mod.campo)) continue;
          const n = Number(String(mod.valor).replace(/^\+/, ""));
          const atual = melhor.get(mod.campo);
          // critMin: quanto MENOR, melhor (crítico mais cedo)
          const melhorQue = (x, y) => mod.campo === "critMin" ? x < y : x > y;
          if (!atual || (Number.isFinite(n) && melhorQue(n, atual.n))) melhor.set(mod.campo, { id: it.id, n: Number.isFinite(n) ? n : (mod.campo === "critMin" ? Infinity : -Infinity) });
        }
        for (const it of pigmentados) naoAcumulaPermitido.set(it.id, new Set([...ATRS_SOMAM, ...[...melhor].filter(([, m]) => m.id === it.id).map(([c]) => c)]));
      }
      for (const lista of grupos.values()) {
        if (lista.length < 2) continue;
        const melhor = new Map();
        for (const it of lista) for (const v of it.system.efeitosVinculados) for (const mod of v.modificadores ?? []) {
          const n = Number(String(mod.valor).replace(/^\+/, ""));
          const atual = melhor.get(mod.campo);
          if (!atual || (Number.isFinite(n) && n > atual.n)) melhor.set(mod.campo, { id: it.id, n: Number.isFinite(n) ? n : -Infinity });
        }
        for (const it of lista) naoAcumulaPermitido.set(it.id, new Set([...melhor].filter(([, m]) => m.id === it.id).map(([c]) => c)));
      }
    }
    for (const item of this.items) {
      const vinculados = item.system?.efeitosVinculados;
      if (!vinculados?.length) continue;
      if (item.type === "armadura" && !item.system.equipado) continue;
      if (item.type === "arma" && !item.system.equipado) continue;
      if ((item.type === "habilidade" || item.type === "magia") && !item.system.ativo) continue;
      for (const v of vinculados) {
        if (!v.ativo) continue;
        // Dois formatos válidos: (a) "id" aponta pra um item de Efeito
        // EXTERNO (na ficha ou compêndio) - formato original, pensado pra
        // Armadura/Consumível ligarem num Efeito compartilhado; (b)
        // "modificadores" embutido DIRETO nesta entrada (sem id nenhum) -
        // usado por muitas Habilidades passivas simples ("sempre ativa,
        // sem depender de nenhum item externo"). Os dois convivem: se tem
        // "modificadores" aqui, aplica direto; senão, tenta resolver por id.
        if (v.modificadores?.length) {
          for (const mod of v.modificadores) {
            if (naoAcumulaPermitido.has(item.id) && !naoAcumulaPermitido.get(item.id).has(mod.campo)) continue; // igual ao de outra Arma de Inventor: não soma
            const valorPorRank = naurenResolverPorRank(mod.porRank, item.system.rankAtual, "valor");
            aplicarCampo(total, mod.campo, valorPorRank !== null ? valorPorRank : mod.valor, 1, item, `${item.name} (${{ arma: "Arma", armadura: "Equipamento", habilidade: "Habilidade" }[item.type] ?? "Item"})`);
          }
          continue;
        }
        const efeito = efeitosPorId.get(v.id);
        if (efeito) {
          const fatorEfeito = efeito.system.acumulativel ? Math.max(1, efeito.system.acumulos || 1) : 1;
          somar(efeito.system, total, fatorEfeito, efeito, `${efeito.name} (Efeito)`);
        }
      }
    }

    // 3.4) Bônus Condicional ao Alvo (ver campoBonusCondicionalAoAlvo):
    //      junta todas as entradas ATIVAS de toda Habilidade/Efeito
    //      ATIVO do Ator numa lista simples - a fórmula "valor" (aceita
    //      @rank) já é resolvida AQUI (síncrono, com acesso ao rank de
    //      cada item), mas a CONDIÇÃO em si só é checada contra o alvo
    //      mirado (tecla T) no momento do ataque (ver
    //      _resolverBonusCondicionalAoAlvo em _montarFormulaAtaque e no
    //      cálculo de Alcance) - não dá pra saber quem está mirado
    //      durante prepareDerivedData. Itens tipo "efeito" só contam
    //      enquanto estiverem ativos (ex: Marca do Caçador, Caçador -
    //      "Foco Mortal"/"Tiro Letal" são Efeitos escolhidos ao usar a
    //      Ação "Marcar", ver "Escolher Efeito ao Usar" em campoAcao).
    sys.bonusCondicionalAoAlvoTotal = [];
    for (const item of this.items) {
      const ativoAqui = item.type === "condicao" ? item.system.ativo !== false : ((item.type === "habilidade" || item.type === "efeito") && item.system.ativo);
      if (!ativoAqui) continue;
      for (const b of (naurenSistemaEfetivo(this, item)?.bonusCondicionalAoAlvo ?? [])) { // 0.110: com itens que mudam a passiva
        if (!b.ativo || !b.condicaoUuid) continue;
        const valorResolvido = naurenInterpretarModificador(b.valor, this, item)?.valor ?? 0;
        if (!valorResolvido) continue;
        sys.bonusCondicionalAoAlvoTotal.push({ condicaoUuid: b.condicaoUuid, campo: b.campo || "dano", valor: valorResolvido, porAcumulo: b.porAcumulo, origemNome: item.name, filtroAtaque: b.filtroAtaque || "" });
      }
    }

    // 3.5) Armaduras EQUIPADAS somam o próprio Bônus de Defesa embutido nelas
    //      (não é um Efeito, é o valor "defesaBonus" que já vem na própria
    //      armadura) - ou, se tiver alguma entrada válida na tabela "Defesa
    //      por Rank" pro rank atual dela, usa esse valor no lugar do
    //      "defesaBonus" simples (mesma lógica de Dano/Cura "Por Rank" das
    //      Ações, ver naurenResolverPorRank). NUNCA mexe em sys.defesa (o
    //      campo base editável) - só soma aqui em "total.defesa", que vira
    //      defesaTotal mais abaixo.
    for (const item of this.items) {
      if (item.type === "armadura" && item.system.equipado) {
        const porRank = naurenResolverPorRank(item.system.defesaBonusPorRank, item.system.rankAtual, "valor");
        const valorDefesa = porRank !== null ? porRank : (item.system.defesaBonus || 0);
        total.defesa += valorDefesa;
        registrarDetalhe("defesa", `${item.name} (Armadura)`, valorDefesa);
      }
    }

    // 3.6) Itens de Cor (Pigmento) ATIVOS: somam seus 18 campos de bônus,
    //      mas num acumulador SEPARADO (totalPigmento) - NUNCA mexem em
    //      sys.atributos.X.value nem em nenhum campo editável, e o valor
    //      final continua 100% recalculado do zero a cada render (mesma
    //      segurança de sempre). A diferença pro bônus de Efeito/Opções é
    //      só na EXIBIÇÃO: por ser permanente, o Pigmento não aparece como
    //      "+X = Y" (isso fica só pro que é realmente temporário) - ver uso
    //      de totalPigmento nos campos "ComPigmento"/"Extra" mais abaixo.
    //      O bônus especial "no menor atributo" (Pigmento Roxo) é somado à
    //      parte, porque só dá pra saber QUAL atributo é o mais baixo
    //      depois que os bônus diretos (e qualquer FIXAR) já foram somados.
    let bonusMenorAtributoTotal = 0;
    for (const item of this.items) {
      if (item.type !== "cor" || !item.system.ativo) continue;
      somar(item.system, totalPigmento, item.getFlag?.("nauren", "dobrada") ? 2 : 1, item, `${item.name} (Pigmento)${item.getFlag?.("nauren", "dobrada") ? " ×2" : ""}`);
      if (item.system.bonusMenorAtributo) bonusMenorAtributoTotal += (item.system.bonusMenorAtributoValor || 0) * (item.getFlag?.("nauren", "dobrada") ? 2 : 1);
    }
    // 3.61) 0.110: Pigmentos APLICADOS em armas/armaduras EQUIPADAS (Códex Inventariun): +1/+2/+3 pela qualidade.
    for (const item of this.items) {
      if (!["arma", "armadura"].includes(item.type) || !item.system.equipado || !(item.system.pigmentosAplicados ?? []).length) continue;
      for (const b of naurenBonusPigmentosDoItem(item)) {
        if (b.campo === "menorAtributo") { bonusMenorAtributoTotal += b.valor; continue; }
        aplicarCampo(total, b.campo, String(b.valor), 1, item, b.origem);
      }
    }
    if (bonusMenorAtributoTotal !== 0) {
      // Ordem de desempate do manual: Força, Agilidade, Estamina, Inteligência, Destino
      const candidatos = [
        ["forca", fixados.forca ?? (sys.atributos.forca.value + total.forca + totalPigmento.forca)],
        ["agilidade", fixados.agilidade ?? (sys.atributos.agilidade.value + total.agilidade + totalPigmento.agilidade)],
        ["estamina", fixados.estamina ?? (sys.atributos.estamina.value + total.estamina + totalPigmento.estamina)],
        ["inteligencia", fixados.inteligencia ?? (sys.atributos.inteligencia.value + total.inteligencia + totalPigmento.inteligencia)],
        ["destino", fixados.destino ?? (sys.atributos.destino.value + total.destino + totalPigmento.destino)]
      ];
      let menor = candidatos[0];
      for (const c of candidatos) if (c[1] < menor[1]) menor = c;
      // Se o atributo sorteado como "menor" estiver FIXADO, o bônus roxo não
      // tem o que somar em cima (um valor travado ignora qualquer aditivo) -
      // soma normalmente só quando ele não está fixado.
      if (fixados[menor[0]] === undefined) {
        totalPigmento[menor[0]] += bonusMenorAtributoTotal;
        registrarDetalhe(menor[0], "Pigmento Roxo (menor atributo)", bonusMenorAtributoTotal);
      }
    }

    // 3.65) Condições ATIVAS no ator: somam seus 18 campos no acumulador
    //       TEMPORÁRIO (condição é temporária por natureza - o "+/-X = Y" na
    //       ficha é exatamente o comportamento certo aqui). Se a condição é
    //       acumulável, cada campo SOMADO vale por acúmulo (Fragmentado 3 =
    //       -3 Def) - um campo que FIXA não multiplica pelos acúmulos (travar
    //       "Força em 0" continua travando em 0, não em 0x3).
    const modsExcetoOrigem = []; // Fase 4 (M05): modificadores que NÃO valem contra quem aplicou (ex.: Provocado)
    for (const item of this.items) {
      if (item.type !== "condicao" || !item.system.ativo) continue;
      const fator = item.system.acumulativel ? Math.max(1, item.system.acumulos || 1) : 1;
      somar(item.system, total, fator, item, `${item.name} (Condição)`);
      if (item.system.modificadoresExcetoOrigem && item.system.conjuradorUuid) {
        const comp = { nome: item.name, conjuradorUuid: item.system.conjuradorUuid, vantagemAtaque: 0, ataque: 0, danoBonus: 0 };
        for (const mod of item.system.modificadores ?? []) {
          const v = naurenResolverPorRank(mod.porRank, item.system.rankAtual, "valor") ?? mod.valor;
          if (mod.campo === "vantagemAtaque") {
            const t = String(v ?? "").trim().toLowerCase();
            comp.vantagemAtaque += t === "vantagem" ? 1 : t === "desvantagem" ? -1 : 0;
          } else if (mod.campo === "ataque" || mod.campo === "danoBonus") {
            const m = naurenInterpretarModificador(v, this, item);
            if (m && m.tipo !== "fixar") comp[mod.campo] += m.valor * (/@acumulos\b/i.test(String(v ?? "")) ? 1 : fator);
          }
        }
        if (comp.vantagemAtaque || comp.ataque || comp.danoBonus) modsExcetoOrigem.push(comp);
      }
    }
    sys.modsExcetoOrigem = modsExcetoOrigem;

    // 3.7) Penalidade automática por Estresse: cada ponto de Estresse ATUAL
    //      (não o limite, o quanto o personagem já tem agora) reduz em 1 o
    //      Ataque, a Defesa, o Dano e o Movimento - EXCETO se alguma
    //      Habilidade ativa tiver "ignoraPenalidadeEstresse" ligado (ex:
    //      Berserker do Guerreiro).
    const ignoraPenalidadeEstresse = this.items.some(i => (i.type === "habilidade" || i.type === "magia") && i.system.ativo && i.system.ignoraPenalidadeEstresse);
    if ((sys.estressePermanente ?? 0) > 0 && (sys.stress.value ?? 0) < sys.estressePermanente) sys.stress.value = sys.estressePermanente;
    const estresseAtual = sys.stress.value || 0;
    if (estresseAtual > 0 && !ignoraPenalidadeEstresse) {
      total.ataque -= estresseAtual;
      total.defesa -= estresseAtual;
      total.movimento -= estresseAtual;
      danoBonusTotal -= estresseAtual;
      registrarDetalhe("danoBonus", "Penalidade de Estresse", -estresseAtual);
      registrarDetalhe("ataque", "Penalidade de Estresse", -estresseAtual);
      registrarDetalhe("defesa", "Penalidade de Estresse", -estresseAtual);
      registrarDetalhe("movimento", "Penalidade de Estresse", -estresseAtual);
      for (const c of ["ataque", "defesa", "movimento"]) somaCondicoes[c] = (somaCondicoes[c] ?? 0) - estresseAtual;
    }

    // 4) Atributos base TOTAIS (com bônus/efeitos/pigmentos já embutidos).
    //    É isso que todo o resto do cálculo usa daqui pra frente - NUNCA o
    //    valor bruto. Pigmento entra aqui igual qualquer outro bônus (o
    //    número final é sempre correto) - a diferença é só na exibição
    //    auditável mais abaixo ("Extra" vs "Pigmento"). Se alguma fonte
    //    pediu pra FIXAR o atributo (ver naurenInterpretarModificador),
    //    esse valor trava tudo - ignora base e qualquer bônus aditivo.
    // Condições (e a penalidade de Estresse) por cima das travas "=" (ver somaCondicoes acima).
    for (const campo of Object.keys(fixados)) {
      const extra = somaCondicoes[campo] ?? 0;
      if (extra) { fixados[campo] += extra; fixadosOrigem[campo] = `${fixadosOrigem[campo] || "?"} (com Condições ${extra > 0 ? "+" : ""}${extra})`; }
    }

    sys.atributosTotais = {
      forca: fixados.forca ?? (sys.atributos.forca.value + total.forca + totalPigmento.forca),
      agilidade: fixados.agilidade ?? (sys.atributos.agilidade.value + total.agilidade + totalPigmento.agilidade),
      estamina: fixados.estamina ?? (sys.atributos.estamina.value + total.estamina + totalPigmento.estamina),
      inteligencia: fixados.inteligencia ?? (sys.atributos.inteligencia.value + total.inteligencia + totalPigmento.inteligencia),
      destino: fixados.destino ?? (sys.atributos.destino.value + total.destino + totalPigmento.destino)
    };
    const t = sys.atributosTotais;

    // 5) RECALCULA os meta-atributos a partir dos atributos TOTAIS (e só
    //    depois soma o bônus/efeito/pigmento específico daquele meta-atributo,
    //    ou aplica o FIXAR daquele meta-atributo, se houver).
    sys.espirito.max = fixados.espirito ?? (t.inteligencia + t.destino + total.espirito + totalPigmento.espirito);
    sys.vitalidade.max = fixados.vitalidade ?? (Math.floor((t.forca + t.estamina) / 2) + total.vitalidade + totalPigmento.vitalidade);
    sys.poderMagia.value = fixados.poderMagia ?? (Math.floor((t.inteligencia + t.estamina) / 2) + total.poderMagia + totalPigmento.poderMagia);
    sys.poderAtaque.value = fixados.poderAtaque ?? (Math.floor((Math.max(t.forca, t.agilidade) + t.estamina) / 2) + total.poderAtaque + totalPigmento.poderAtaque);

    // Precisa existir ANTES de calcularVidaBase (lê este total).
    sys.vidaBonusPorNivelTotal = total.vidaBonusPorNivel + totalPigmento.vidaBonusPorNivel;
    sys.vida.max = fixados.vida ?? (calcularVidaBase(sys) + total.vida + totalPigmento.vida);
    sys.mana.max = fixados.mana ?? (calcularRecursoBase(sys, "calculoMana", "manaFormula", sys.espirito.max) + total.mana + totalPigmento.mana);
    // Capacidade "Sem Mana" (Inventor: o Espírito vira Pontos de Invenção).
    if (this.items?.some?.(i => (i.system?.capacidades ?? []).includes("semMana") && i.system?.ativo !== false)) { sys.mana.max = 0; sys.mana.value = 0; sys.semMana = true; }
    sys.estaminaCombate.max = fixados.estaminaCombate ?? (calcularRecursoBase(sys, "calculoEstaminaCombate", "estaminaCombateFormula", t.estamina) + total.estaminaCombate + totalPigmento.estaminaCombate);
    // Bando (0.93): a Estamina do grupo é uma só, com o máximo calculado pelo Mestre (naurenBandoRecalcular).
    {
      const bm = this.isToken ? this.getFlag?.("nauren", "bandoEstaminaMax") : undefined;
      this._naurenEstaminaBase = sys.estaminaCombate.max;
      if (Number.isFinite(bm) && naurenBandoCfg(this)) sys.estaminaCombate.max = bm;
    }
    sys.dadosDestino.max = fixados.dadosDestino ?? (calcularRecursoBase(sys, "calculoDadosDestino", "dadosDestinoFormula", t.destino) + total.dadosDestino + totalPigmento.dadosDestino);
    // Máximos nunca negativos (ex.: Congelando ×4 numa criatura com 2 de Estamina dava "-2/-2").
    for (const k of ["vida", "mana", "estaminaCombate", "dadosDestino"]) if (sys[k] && sys[k].max < 0) sys[k].max = 0;

    sys.defesaTotal = fixados.defesa ?? (sys.defesa + total.defesa + totalPigmento.defesa);
    sys.movimentoTotal = Math.max(0, fixados.movimento ?? (sys.movimento + total.movimento + totalPigmento.movimento));
    sys.stress.max = fixados.estresse ?? (2 + total.estresse + totalPigmento.estresse);
    sys.bonusAtaqueTotal = fixados.ataque ?? (total.ataque + totalPigmento.ataque);
    // Bônus de Alcance (metros): somado ao alcance de QUALQUER Ação de alvo
    // selecionado na hora de validar a distância (ver _resolverAlvosDaAcao)
    // - ex: "Fervor" (Empíreo) e "Olhar de Rapina" (Caçador), que aumentam
    // o alcance de todos os ataques em N metros.
    sys.alcanceBonusTotal = fixados.alcanceBonus ?? (total.alcanceBonus + totalPigmento.alcanceBonus);
    // Facilidade/Dificuldade final por tipo de rolagem: converte o contador
    // (positivo/negativo/zero) em "vantagem"/"desvantagem"/"normal", que é
    // o que _rollD20WithMode entende. Facilidade e dificuldade na mesma
    // rolagem se anulam pelo próprio contador ter somado +1 e -1.
    const paraModo = (n) => (n > 0 ? "vantagem" : n < 0 ? "desvantagem" : "normal");
    sys.vantagemAtaqueModo = paraModo(vantagens.vantagemAtaque ?? 0);
    sys.vantagemAtaqueRecebidoModo = paraModo(vantagens.vantagemAtaqueRecebido ?? 0);
    sys.vantagemAtaqueRecebidoPrioridadeModo = paraModo(vantagens.vantagemAtaqueRecebidoPrioridade ?? 0);
    sys.vantagemEsquivaModo = paraModo(vantagens.vantagemEsquiva ?? 0);
    sys.vantagemTesteModo = paraModo(vantagens.vantagemTeste ?? 0);
    sys.fontesVantagem = fontesVantagem;
    // 0.94.11 (livro, Cap. I): cada Facilidade além da primeira dá +2 no teste; cada Dificuldade além da primeira, −2.
    // Guarda o CONTADOR (não só o modo) para a rolagem somar as extras.
    sys.vantagemContagem = {
      ataque: vantagens.vantagemAtaque ?? 0, ataqueRecebido: vantagens.vantagemAtaqueRecebido ?? 0,
      ataqueRecebidoPrioridade: vantagens.vantagemAtaqueRecebidoPrioridade ?? 0, esquiva: vantagens.vantagemEsquiva ?? 0, teste: vantagens.vantagemTeste ?? 0,
      porTipoItem: { magia: porTipoItem.magia.vantagemAtaque ?? 0, arma: porTipoItem.arma.vantagemAtaque ?? 0, habilidade: porTipoItem.habilidade.vantagemAtaque ?? 0 }
    };
    // Facilidade/Dificuldade em ataques restrita a um Tipo de Item (ver
    // campoModificador > restringirTipoItem em "vantagemAtaque", ex:
    // Terra Mágica - "Facilidade só em ataques com MAGIA") - consumido
    // por _rollD20WithMode só quando o item sendo usado é daquele tipo.
    sys.vantagemAtaqueModoPorTipoItem = {
      magia: paraModo(porTipoItem.magia.vantagemAtaque),
      arma: paraModo(porTipoItem.arma.vantagemAtaque),
      habilidade: paraModo(porTipoItem.habilidade.vantagemAtaque)
    };
    // Bônus/penalidade DIRETO em Bloqueio (Defesa + Vitalidade) e Esquiva
    // (1d20 + Agilidade), somado por cima do valor derivado normal - ver uso
    // em NaurenAlvoHelper._popupReacao/_aplicarReacaoDano. Não sofre a
    // penalidade automática de Estresse aqui embaixo porque Defesa e
    // Agilidade (usadas na fórmula base de Bloqueio/Esquiva) já a recebem -
    // somar de novo aqui penalizaria em dobro.
    sys.bloqueioBonusTotal = fixados.bloqueio ?? (total.bloqueio + totalPigmento.bloqueio);
    sys.esquivaBonusTotal = fixados.esquiva ?? (total.esquiva + totalPigmento.esquiva);

    // Pontos de Subclasse: contam 1 por nível desde sempre (mesma taxa do
    // manual), mas ficam TRANCADOS até o personagem atingir o nível 5 - ao
    // bater o nível 5, destrava de uma vez com o total acumulado (ex: nível
    // 5 = 5 pontos, não 1), e a partir daí sobe junto com o nível. Antes do
    // nível 5 fica em 0 (não é possível ter Subclasse ainda).
    sys.pontosSubclasse.max = (sys.nivel || 1) >= 5
      ? (fixados.pontosSubclasse ?? ((sys.nivel || 1) + total.pontosSubclasse + totalPigmento.pontosSubclasse))
      : 0;

    // Crítico Mínimo/Falha Crítica FINAIS - a config em Opções (sys.critMin/
    // critFailMax) continua sendo só a BASE editável; isto aqui é o valor
    // que a rolagem realmente usa (ver _isCrit/_buildD20Boxes), já somando
    // Efeito/Condição/Pigmento/Bônus Manual. Sempre clampado pro intervalo
    // válido (2-20 pro mínimo de crítico, 1-19 pra falha crítica) mesmo
    // quando fixado, pra nunca travar num valor sem sentido pro d20.
    sys.critMinTotal = Math.max(2, Math.min(20,
      fixados.critMin ?? ((sys.critMin ?? 20) + total.critMin + totalPigmento.critMin)
    ));
    sys.critFailMaxTotal = Math.max(1, Math.min(19,
      fixados.critFailMax ?? ((sys.critFailMax ?? 1) + total.critFailMax + totalPigmento.critFailMax)
    ));
    // Limiar de Deflexão FINAL - nunca negativo (não faria sentido).
    sys.limiarDeflexaoTotal = Math.max(0,
      fixados.limiarDeflexao ?? ((sys.limiarDeflexao ?? 0) + total.limiarDeflexao + totalPigmento.limiarDeflexao)
    );
    // Perjúrio/Graça - nunca negativo (uma faixa "menor que 0" não faz
    // sentido; 0 = comportamento padrão, só o 1/20 exato).
    sys.perjurioLimiarTotal = Math.max(0, total.perjurioLimiar + totalPigmento.perjurioLimiar);
    sys.gracaLimiarTotal = Math.max(0, total.gracaLimiar + totalPigmento.gracaLimiar);
    // Redução de Dano Sofrido FINAL - nunca negativa (não faria sentido).
    // Só de ataques (Resistir do Urso Marrom): entra na redução de ataques, mas não no dano de Condições.
    sys.reducaoDanoAtaqueTotal = Math.max(0, fixados.reducaoDanoAtaque ?? (total.reducaoDanoAtaque + totalPigmento.reducaoDanoAtaque));
    sys.reducaoDanoTotal = Math.max(0,
      fixados.reducaoDano ?? ((sys.reducaoDano ?? 0) + total.reducaoDano + totalPigmento.reducaoDano)
    ) + sys.reducaoDanoAtaqueTotal;
    // Redução de Dano Sofrido PERCENTUAL FINAL (0-100) - soma todas as
    // fontes (Condições/Efeitos com "reducaoDanoPercentual"), travando
    // no teto de 100% (nunca "menos que zero dano restante").
    sys.reducaoDanoPercentualTotal = Math.max(0, Math.min(100, total.reducaoDanoPercentual + totalPigmento.reducaoDanoPercentual));
    // Limite de equipamentos ofensivos (0.94): base do mundo + bônus (ex.: Maleta do Inventor +3).
    sys.limiteOfensivoTotal = naurenLimiteOfensivoBase() + (total.limiteOfensivo || 0) + (totalPigmento.limiteOfensivo || 0);
    sys.pesoOfensivoEquipado = naurenPesoOfensivoEquipado(this);
    // Dano Sofrido Extra (±N em todo dano recebido, ex.: Exposto) e Cura Recebida reduzida
    // em % (100 = nenhuma cura, ex.: Putrefato). Ver NaurenAlvoHelper.aplicarDanoRecebidoExtra
    // e ajustarCuraRecebida.
    sys.danoRecebidoTotal = total.danoRecebido + totalPigmento.danoRecebido;
    sys.curaRecebidaPercentualTotal = Math.max(0, Math.min(100, total.curaRecebidaPercentual + totalPigmento.curaRecebidaPercentual));
    // ===== Escala de monstro (criador de monstros) =====
    // Categoria FINAL: o campo da ficha; se ele ainda estiver no padrão (1) e a criatura
    // tiver o item de referência "Categoria N" (fichas antigas do Bestiário/IA), vale o N
    // do item. Só alimenta @categoria/@danoCat/@meioCat/@estCat, o cabeçalho da ficha e o
    // HUD - o cálculo de Vida continua lendo "categoriaMonstro" como sempre.
    // 0.94.8: Condições/Efeitos podem somar Categoria (ex.: Elixir de Crescimento, +1), de 1 a 4.
    sys.categoriaBonus = (total.categoria ?? 0) + (totalPigmento.categoria ?? 0);
    sys.categoriaTotal = Math.max(1, Math.min(4, naurenCategoriaDoAtor(this) + sys.categoriaBonus));
    sys.valorBase = naurenValorBasePorNivel(sys.nivel || 1);
    // 0.108: o dado da Categoria cresce com o nível (só NPC; Bando de lacaios fica no dado base, já estava equilibrado).
    sys.escalaMonstro = naurenEscalaPorCategoria(sys.categoriaTotal, this.type === "npc" && !this.flags?.nauren?.bando?.ativo ? sys.nivel : 0);

    // Deltas para exibição auditável ("10 +2 = 12") - combina temporário
    // (Opções/Efeitos/Armadura/Estresse) e Pigmento no mesmo "+X = Y",
    // exatamente como antes. Quando o campo está FIXADO, zera o "Extra"/
    // "Pigmento" de propósito - o valor final já mostra o número travado
    // certo, e não faz sentido nenhum mostrar um "+X = Y" quando não existe
    // essa soma de verdade (é só um valor fixo).
    sys.defesaExtra = fixados.defesa !== undefined ? 0 : (total.defesa + totalPigmento.defesa);
    sys.defesaPigmento = fixados.defesa !== undefined ? 0 : totalPigmento.defesa;
    sys.movimentoExtra = fixados.movimento !== undefined ? 0 : (total.movimento + totalPigmento.movimento);
    sys.movimentoPigmento = fixados.movimento !== undefined ? 0 : totalPigmento.movimento;
    sys.stressExtra = fixados.estresse !== undefined ? 0 : (total.estresse + totalPigmento.estresse);
    sys.stressPigmento = fixados.estresse !== undefined ? 0 : totalPigmento.estresse;
    sys.atributosExtra = {
      forca: fixados.forca !== undefined ? 0 : (total.forca + totalPigmento.forca),
      agilidade: fixados.agilidade !== undefined ? 0 : (total.agilidade + totalPigmento.agilidade),
      estamina: fixados.estamina !== undefined ? 0 : (total.estamina + totalPigmento.estamina),
      inteligencia: fixados.inteligencia !== undefined ? 0 : (total.inteligencia + totalPigmento.inteligencia),
      destino: fixados.destino !== undefined ? 0 : (total.destino + totalPigmento.destino)
    };
    sys.atributosPigmento = {
      forca: fixados.forca !== undefined ? 0 : totalPigmento.forca,
      agilidade: fixados.agilidade !== undefined ? 0 : totalPigmento.agilidade,
      estamina: fixados.estamina !== undefined ? 0 : totalPigmento.estamina,
      inteligencia: fixados.inteligencia !== undefined ? 0 : totalPigmento.inteligencia,
      destino: fixados.destino !== undefined ? 0 : totalPigmento.destino
    };

    // Texto de tooltip por campo (passar o mouse mostra QUEM está
    // contribuindo, tanto em Modo Jogo quanto em Modo Edição - ver
    // sys.tooltips no template). Se o campo estiver FIXADO, mostra só quem
    // fixou (não faz sentido listar aditivos que foram todos ignorados).
    // Sem nada fixado nem somado, mostra um texto neutro pro tooltip não
    // aparecer vazio.
    const montarTooltip = campo => {
      if (fixados[campo] !== undefined) {
        return `Travado em ${fixados[campo]} por: ${fixadosOrigem[campo] || "?"}`;
      }
      const linhas = detalhes[campo] ?? [];
      if (!linhas.length) return "Nenhum bônus ativo no momento.";
      return linhas.map(d => `${d.origem}: ${d.valor > 0 ? "+" : ""}${d.valor}`).join("\n");
    };
    sys.tooltips = Object.fromEntries(Object.keys(total).map(campo => [campo, montarTooltip(campo)]));

    // Guarda os bônus/dados de dano e cura de efeitos pra _useItem somar
    // em qualquer rolagem de dano ou cura (arma, magia ou habilidade).
    sys.efeitoDanoBonus = danoBonusTotal;
    sys.efeitoDanoDados = danoDados;
    sys.efeitoCuraBonus = curaBonusTotal;
    sys.efeitoCuraDados = curaDados;
    // Fontes do Bônus de Dano/Cura (ex.: "Debilitado (Condição) −2", "Penalidade de Estresse −1"):
    // o card do ataque mostra de onde vem o número, à vista.
    sys.efeitoDanoBonusFontes = (detalhes.danoBonus ?? []).map(d => `${d.origem} ${d.valor > 0 ? "+" : "−"}${Math.abs(d.valor)}`);
    sys.efeitoCuraBonusFontes = (detalhes.curaBonus ?? []).map(d => `${d.origem} ${d.valor > 0 ? "+" : "−"}${Math.abs(d.valor)}`);
    sys.bonusAtaqueDados = ataqueDados;
    // Buckets por Tipo de Item (ver campoModificador > restringirTipoItem) -
    // consumidos SÓ quando a Ação sendo rolada é do tipo certo (ver
    // _getBonusDanoCuraDeEfeitos/_rollD20WithMode), somando por cima do
    // bucket geral acima, nunca no lugar dele.
    sys.efeitoPorTipoItem = porTipoItem;
  }
}

/**
 * Token customizado apenas para poder colorir cada barra de recurso de
 * acordo com QUAL atributo está nela (Vida=verde, Estamina=vermelho,
 * Mana=azul, Destino=roxo), e não de acordo com a posição (Bar 1/Bar 2).
 */
class NaurenToken extends foundry.canvas.placeables.Token {
  /** Entidades de campo (muros, barricadas, orbes...) ficam sempre visíveis para quem está na cena,
   *  para poder dar alvo nelas mesmo atrás das próprias paredes. Escondidas pelo Mestre continuam escondidas. */
  get isVisible() {
    if (!this.document.hidden && this.actor?.getFlag?.("nauren", "entidade")?.ativa) return true;
    return super.isVisible;
  }

  /** Borda do token (Nauren): deixa o recorte da imagem pronto no cache antes de o Foundry desenhar. */
  async _draw(options) {
    try { await naurenBordaPrepararSujeito(this.document); } catch (err) { /* desenha sem o recorte */ }
    return super._draw(options);
  }

  /** @override */
  _getBarColors(index, data) {
    const key = data?.attribute?.split(".")[0];
    const preset = BAR_ATTRIBUTE_COLORS[key];
    if (preset) {
      const { Color } = foundry.utils;
      return { empty: Color.from(preset.empty), full: Color.from(preset.full) };
    }
    return super._getBarColors(index, data);
  }
}

/**
 * Régua de movimento customizada: colore a linha e as células destacadas no
 * grid de acordo com o Movimento total do personagem (verde = dentro do
 * deslocamento normal, amarelo = ultrapassou, mas ainda tem Estamina de
 * Combate suficiente pra pagar o "bloco" extra, vermelho = não tem Estamina
 * suficiente). Usa waypoint.measurement.distance, que já vem calculado pelo
 * próprio Foundry (mesma distância acumulada mostrada no rótulo da régua).
 */
class NaurenTokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {
  /** Só aplica a régua colorida em tokens de atores do nosso sistema. */
  _naurenAtorValido() {
    return this.token?.actor?.system?.bonus !== undefined;
  }

  /**
   * Decide a cor de acordo com a distância acumulada até este ponto da régua.
   * Cada "bloco" de Movimento total custa 1 Estamina de Combate (mesma regra
   * do gasto automático). Dentro de um bloco PAGÁVEL: primeira metade verde,
   * segunda metade amarela. Depois que a Estamina disponível não cobre mais
   * nenhum bloco: vermelho pro resto do caminho.
   */
  _naurenCor(distancia) {
    const sys = this.token.actor.system;
    const { Color } = foundry.utils;
    const movimentoMax = sys.movimentoTotal || sys.movimento || 6;
    const metade = movimentoMax / 2;
    const estaminaDisponivel = sys.estaminaCombate?.value ?? 0;

    // Distância máxima que dá pra pagar com a Estamina que resta agora
    const distanciaMaxPagavel = movimentoMax * estaminaDisponivel;
    if (distancia > distanciaMaxPagavel) return Color.from("#e53935"); // vermelho

    // Posição dentro do bloco atual (trata o fim exato de um bloco como "fim", não início do próximo)
    let posicaoNoBloco = distancia % movimentoMax;
    if (posicaoNoBloco === 0 && distancia > 0) posicaoNoBloco = movimentoMax;

    return posicaoNoBloco <= metade ? Color.from("#4caf50") : Color.from("#ffb300");
  }

  /** Só colore o trecho que ainda está sendo arrastado agora (não o histórico já andado). */
  _naurenDeveColorir(waypoint) {
    return this._naurenAtorValido() && waypoint.stage !== "passed";
  }

  /**
   * Distância deste ponto da régua até a posição ATUAL DE VERDADE do token
   * (a última posição salva, não a prévia visual do arrasto). Não usa
   * waypoint.measurement.distance porque esse valor é cumulativo desde
   * sempre no histórico do token (guardado pelo próprio Foundry), o que
   * fazia qualquer arrasto novo já nascer "gigante" e cair direto no vermelho.
   */
  _naurenDistanciaDesteArrasto(waypoint) {
    const doc = this.token.document;
    const origem = this.token.getCenterPoint({ x: doc.x, y: doc.y });
    try {
      return canvas.grid.measurePath([origem, waypoint.center])?.distance ?? 0;
    } catch (err) {
      return waypoint.measurement?.distance ?? 0; // fallback caso algo dê errado
    }
  }

  /** @override - cor da linha da régua */
  _getSegmentStyle(waypoint) {
    const style = super._getSegmentStyle(waypoint);
    if (!this._naurenDeveColorir(waypoint)) return style;
    return { ...style, color: this._naurenCor(this._naurenDistanciaDesteArrasto(waypoint)) };
  }

  /** @override - cor das células destacadas no grid */
  _getGridHighlightStyle(waypoint, offset) {
    const style = super._getGridHighlightStyle(waypoint, offset);
    if (!this._naurenDeveColorir(waypoint)) return style;
    return { ...style, color: this._naurenCor(this._naurenDistanciaDesteArrasto(waypoint)) };
  }
}

// 0.94.22: Ficha do Ator (NaurenActorSheet) foi para modulos/ficha-ator.mjs.

// 0.94.31: Relógio de combate: tempo das Condições foi para modulos/relogio-condicoes.mjs.

/* =======================================
 * 6. INICIALIZAÇÃO
 * ======================================= */
Hooks.once("init", () => {
  Handlebars.registerHelper("naurenInclui", (lista, valor) => Array.isArray(lista) && lista.includes(valor));
  Handlebars.registerHelper("naurenNomeDe", uuid => { const u = String(uuid ?? ""); if (u.startsWith("self:")) return u.slice(5); if (!/^(Compendium|Actor|Item)\./.test(u)) return u; try { return fromUuidSync(u)?.name ?? u; } catch (err) { return u; } });
  CONFIG.Actor.documentClass = NaurenActor;
  CONFIG.Item.documentClass = NaurenItem;
  CONFIG.Actor.dataModels.personagem = NaurenActorData;
  CONFIG.Actor.dataModels.npc = NaurenActorData;
  // 0.99: Armazenamento (baú e loja), ponto no mapa e trocas pelo Mestre (modulos/armazenamento.mjs).
  naurenArmazemInit();
  naurenArmazemHooks();
  naurenItensCatalogoInit(); // 0.102: catálogo, tiers e Condições embutidas (modulos/itens-catalogo.mjs)
  naurenItensCatalogoHooks();
  naurenItensScriptsInit(); // 0.102: scripts dos itens (modulos/itens-scripts.mjs)
  naurenItensScriptsHooks();
  naurenTreinosInit(); // 0.102.4: Seguir o Exemplo (modulos/treinos.mjs)
  naurenAparenciaHooks(); Hooks.once("ready", () => naurenAparenciaMigrar().catch(err => console.warn("Nauren RPG | Migração da Aparência", err))); // 0.105: Aparência (modulos/aparencia.mjs)
  naurenImportarMassaInit(); // 0.107: importar várias fichas de um JSON (modulos/importar-massa.mjs)
  naurenOrganizadorInit(); // 0.109: seleção, filtros e ações em lote nas listas (modulos/organizador.mjs)
  naurenEscritosInit(); // 0.106: Escritos — notas, cartas, pergaminhos e livros (modulos/escritos.mjs)
  naurenConfiguracoesInit(); // 0.104: painel único "Configurações do Nauren" (modulos/configuracoes.mjs)
  naurenMoldurasInit(); naurenMoldurasHooks(); naurenMoldurasProntasInit(); naurenMoldurasProntasHooks(); // 0.103: molduras de token (modulos/molduras-token.mjs)
  naurenChatInit(); // 0.99.2: chat no estilo do sistema (modulos/chat.mjs)
  naurenArteInit(); // 0.100: arte do personagem ao passar o mouse no token (modulos/arte-hover.mjs)

  CONFIG.Item.dataModels.habilidade = NaurenHabilidadeData;
  CONFIG.Item.dataModels.arma = NaurenArmaData;
  CONFIG.Item.dataModels.armadura = NaurenArmaduraData;
  CONFIG.Item.dataModels.consumivel = NaurenConsumivelData;
  CONFIG.Item.dataModels.magia = NaurenMagiaData;
  CONFIG.Item.dataModels.efeito = NaurenEfeitoData;
  CONFIG.Item.dataModels.cor = NaurenCorData;
  CONFIG.Item.dataModels.condicao = NaurenCondicaoData;
  CONFIG.Item.dataModels.grupo = NaurenGrupoData;
  CONFIG.Item.dataModels.classe = NaurenClasseData;
  CONFIG.Item.dataModels.subclasse = NaurenSubclasseData;
  CONFIG.Item.dataModels.peculiaridade = NaurenPeculiaridadeData;

  // API oficial de Queries (V13+): permite o cliente do atacante pedir pro
  // cliente do DONO do alvo aplicar dano/cura/condições (com as permissões
  // dele) e mostrar o popup de defesa na tela certa. O mesmo mecanismo é
  // reaproveitado pelo Grupo de Jogadores pra ajustar Graça/Perjúrio quando
  // quem rolou o dado não tem posse do item de Grupo.
  CONFIG.queries ??= {};
  CONFIG.queries[NaurenAlvoHelper.QUERY_NOME] = NaurenAlvoHelper.handleQuery;
  CONFIG.queries[NAUREN_QUERY_ROLAGEM_AUDITADA] = naurenHandleQueryRolagemAuditada;
  CONFIG.queries[NaurenAlvoHelper.QUERY_NOME_DIRETO] = NaurenAlvoHelper.handleQueryDireto;
  CONFIG.queries[NaurenAlvoHelper.QUERY_NOME_POPUP] = NaurenAlvoHelper.handleQueryPopup;
  CONFIG.queries[NaurenAlvoHelper.QUERY_REIVINDICAR] = NaurenAlvoHelper.handleQueryReivindicar;
  CONFIG.queries[NaurenAlvoHelper.QUERY_FECHAR_PEDIDO] = NaurenAlvoHelper.handleQueryFecharPedido;
  CONFIG.queries[NaurenAlvoHelper.QUERY_NOME_SUSTENTAR] = NaurenAlvoHelper.handleQuerySustentar;
  CONFIG.queries[NaurenAlvoHelper.QUERY_PING] = NaurenAlvoHelper.handleQueryPing;
  CONFIG.queries[NaurenGrupoHelper.QUERY_NOME] = NaurenGrupoHelper.handleQuery;
  CONFIG.queries[NAUREN_QUERY_DISPARAR_EVENTO] = naurenHandleQueryDispararEvento;
  CONFIG.queries[NAUREN_QUERY_OFERECER_ITEM] = naurenHandleQueryOferecerItem;
  CONFIG.queries[NAUREN_QUERY_APLICAR_CONDICAO] = naurenHandleQueryAplicarCondicao;
  CONFIG.queries[NAUREN_QUERY_REGISTRO_PRIORIDADE] = naurenHandleQueryRegistroPrioridade;
  CONFIG.queries[NAUREN_QUERY_REACAO_PRE_ATAQUE] = naurenHandleQueryReacaoPreAtaque;
  CONFIG.queries[NAUREN_QUERY_DANO_COLISAO] = naurenHandleQueryDanoColisao;
  CONFIG.queries[NAUREN_QUERY_ENTIDADE] = naurenHandleQueryEntidade;
  CONFIG.queries[NAUREN_QUERY_MOVER_TOKEN] = naurenHandleQueryMoverToken;
  CONFIG.queries[NAUREN_QUERY_CRIAR_ITEM] = naurenHandleQueryCriarItem;
  CONFIG.queries[NAUREN_QUERY_RECURSO] = naurenHandleQueryRecurso;
  CONFIG.queries[NAUREN_QUERY_ESTUDO] = naurenHandleQueryEstudo;
  CONFIG.queries[NAUREN_QUERY_MANIPULAR] = naurenHandleQueryManipular;
  CONFIG.queries[NAUREN_QUERY_DOMAR] = naurenHandleQueryDomar;
  CONFIG.queries[NAUREN_QUERY_BESTA_INICIAL] = naurenHandleQueryBestaInicial;
  CONFIG.queries[NAUREN_QUERY_ITEM_MESTRE] = naurenHandleQueryItemMestre;
  CONFIG.queries[NAUREN_QUERY_APLICAR_CONDICAO_ECO] = naurenHandleQueryAplicarCondicaoEco;
  CONFIG.queries[NAUREN_QUERY_RESISTIR_AREA] = naurenHandleQueryResistirArea;
  CONFIG.queries[NAUREN_QUERY_AREA_AO_CRIAR] = naurenHandleQueryAreaAoCriar;
  CONFIG.queries[NAUREN_QUERY_PRESENCA] = naurenHandleQueryPresenca;
  CONFIG.queries[NAUREN_QUERY_RESISTIR_ROUBO] = naurenHandleQueryResistirRoubo;
  CONFIG.queries[NAUREN_QUERY_ACOVARDAR] = naurenHandleQueryAcovardar;
  CONFIG.queries[NAUREN_QUERY_ESTRELA] = naurenHandleQueryEstrela;
  CONFIG.queries[NAUREN_QUERY_ESCOLHA_DRUIDISMO] = naurenHandleQueryEscolhaDruidismo;
  CONFIG.queries[NAUREN_QUERY_ESCOLHA_PALAVRA] = naurenHandleQueryEscolhaPalavra;
  CONFIG.queries[NAUREN_QUERY_AUREUM] = naurenHandleQueryAureum;
  CONFIG.queries[NAUREN_QUERY_ACALANTO] = naurenHandleQueryAcalanto;

  // Cores padrão de fallback (usadas só se o atributo da barra não estiver
  // no mapa BAR_ATTRIBUTE_COLORS, ver NaurenToken._getBarColors acima).
  const { Color } = foundry.utils;
  CONFIG.Token.barConfig.bar1.colors = { empty: Color.from("#1b4d2e"), full: Color.from("#4caf50") };
  CONFIG.Token.barConfig.bar2.colors = { empty: Color.from("#4d1b1b"), full: Color.from("#e53935") };

  // Cor da barra segue o ATRIBUTO escolhido (não a posição Bar 1/Bar 2)
  CONFIG.Token.objectClass = NaurenToken;

  // Régua de movimento colorida (verde/amarelo/vermelho conforme o Movimento total)
  CONFIG.Token.rulerClass = NaurenTokenRuler;

  // "Actors"/"Items" globais foram renomeados (V13+) pra dentro de
  // foundry.documents.collections - o global antigo ainda funciona, mas
  // gera aviso de depreciação no console; usar o caminho novo silencia isso.
  const { Actors: ActorsCollection, Items: ItemsCollection } = foundry.documents.collections;
  ActorsCollection.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  ActorsCollection.registerSheet("nauren", NaurenActorSheet, { makeDefault: true, types: ["personagem", "npc"] });

  ItemsCollection.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  ItemsCollection.registerSheet("nauren", NaurenItemSheet, { makeDefault: true, types: ["arma", "armadura", "consumivel", "habilidade", "magia", "efeito", "cor", "condicao", "grupo", "classe", "peculiaridade"] });
  ItemsCollection.registerSheet("nauren", NaurenSubclasseSheet, { makeDefault: true, types: ["subclasse"] });

  // Flags de controle (mundo) pras migrações one-shot abaixo (ver
  // naurenMigrarOpcoesPadraoLigado, chamada no hook "ready") - não aparecem
  // na tela de Configurações (config:false), são só marcadores internos, uma
  // por opção migrada (CAMPOS_MIGRADOS_PARA_LIGADO).
  for (const { setting } of CAMPOS_MIGRADOS_PARA_LIGADO) {
    game.settings.register("nauren", setting, {
      scope: "world", config: false, type: Boolean, default: false
    });
  }
  // Card de uso: descrição da regra enviada junto (Fase 2 - auditoria).
  game.settings.register("nauren", "descricaoNoChat", {
    name: "Descrição no chat ao usar",
    hint: "Envia a descrição de habilidades, magias e itens no card de uso. Cada item ainda pode desligar isso individualmente.",
    scope: "world", config: true, type: String, default: "sempre",
    choices: { sempre: "Sempre enviar", nunca: "Nunca enviar" }
  });
  game.settings.register("nauren", "destinoPerguntar", {
    name: "Rerolagem com Dado de Destino",
    hint: "Depois de cada d20 (ataque, teste de atributo, esquiva), mostrar o resultado e oferecer rerolar gastando 1 Dado de Destino, antes de qualquer efeito acontecer. Só 1 rerolagem de Destino por ação. Cada ficha também pode desligar a pergunta (aba Opções).",
    scope: "world", config: true, type: String, default: "sempre",
    choices: { sempre: "Sempre perguntar", nunca: "Nunca perguntar" }
  });
  // 0.95: "Só quando falharia" saiu (revelava ao atacante se ia acertar): vira "Sempre perguntar".
  Hooks.once("ready", () => { try { if (game.user.isGM && game.settings.get("nauren", "destinoPerguntar") === "erraria") game.settings.set("nauren", "destinoPerguntar", "sempre"); } catch (err) { /* ignora */ } });
  game.settings.register("nauren", "migracaoCardsGatilhoV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoLivro08PequenasV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoMisticoRevisaoV2", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoLadinoRevisaoV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoAtaqueAgilidadeV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoVidaInimigosV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoArmadilhaInimigosV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoInfusaoFloralV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoDuracoesLivroV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoRevisaoClasses0921", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoRevisaoMago0924", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoEscudoDeMana0925", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoRegras0926", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoAmbidestria0927", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoEmpireo09213", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoDruida09214", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoSabedoria09215", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoGuerreiro09216", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoGuerreiro09217", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoCacador09218", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoCacador09219", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoSacerdote09238", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoSacerdote09239", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoLacunas09240", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoHabMonstrosVersao", { scope: "world", config: false, type: Number, default: 0 });
  game.settings.register("nauren", "migracaoBorda09224", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoLivro08ItensV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoAcimaSoContraAlvoV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoLoucuraManualV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoCanalizarNivelV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoQueimandoAcumuloV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoCondicoesAuditoriaV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoVenenosV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoTintaEnergeticaV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "limiteEquipamentoOfensivo", {
    name: "Limite de equipamentos ofensivos",
    hint: "Quantos pontos de armas e escudos cada ficha pode ter equipados ao mesmo tempo (regra do livro: 5). Itens como a Maleta do Inventor somam mais. 0 = sem limite. Carregar no inventário não conta, só equipar.",
    scope: "world", config: true, type: Number, default: 5
  });
  game.settings.register("nauren", "limiteVagasDefesa", {
    name: "Uma armadura, uma capa e uma bota",
    hint: "Regra do livro (Cap. VI): só uma armadura de corpo, uma capa e uma bota equipadas por vez, e até dois acessórios. Desligue para não travar.",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register("nauren", "migracaoPesoEscudosV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoAlvejadoArcosV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoSanatio09413", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoMotion09416", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoBandoExtra09423", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoXpTotal0962", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoLojaRestaurar0977", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "versaoMigrada", { scope: "world", config: false, type: String, default: "" }); // 0.94.22: versão do sistema já migrada neste mundo
  game.settings.register("nauren", "pesosEquipamentoOfensivo", {
    name: "Peso de cada tipo de arma no limite",
    hint: "Formato: Categoria=pontos, separados por vírgula. \"Escudo\" vale para escudos sem peso próprio. Uma arma ou escudo pode ter o próprio peso (campo \"Pontos que ocupa\" na ficha dele).",
    scope: "world", config: true, type: String, default: "Leve=1, Média=2, Pesada=3, Alcance=2, Distância=2, Catalisador=1, Escudo=2"
  });
  const ESCALAS = { auto: "Automática (pela altura da tela)", "1": "100%", "0.9": "90%", "0.8": "80%", "0.7": "70%" };
  game.settings.register("nauren", "escalaInterfacePadrao", {
    name: "Tamanho da interface do Nauren (padrão do mundo)",
    hint: "Escala das janelas do sistema (ficha, itens, Criador, árvore de subclasse, janelas de reação e de movimento). Vale para quem deixou a própria opção em \"padrão do mundo\". Automática: 100% em telas altas, 90% por volta de 900 px e 80% em notebooks.",
    scope: "world", config: true, type: String, choices: ESCALAS, default: "auto",
    onChange: () => naurenReaplicarEscalaInterface()
  });
  game.settings.register("nauren", "escalaInterface", {
    name: "Tamanho da interface do Nauren (minha tela)",
    hint: "Só para você. \"Padrão do mundo\" usa a escolha do Mestre; as outras opções valem só nesta máquina. Janelas já abertas mudam na hora.",
    scope: "client", config: true, type: String, choices: { mundo: "Padrão do mundo", ...ESCALAS }, default: "mundo",
    onChange: () => naurenReaplicarEscalaInterface()
  });
  game.settings.register("nauren", "animacoesAcoes", {
    name: "Animações: Ações (Automated Animations)",
    hint: "Com o módulo Automated Animations ativo, cada Ação usada (ataque, magia, habilidade) dispara a animação cadastrada no menu dele pelo nome do item. Sem o módulo, nada muda.",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register("nauren", "animacoesReserva", {
    name: "Animações: reserva por tipo de Ação",
    hint: "Quando o nome do item não tem animação cadastrada, usa um nome genérico pelo tipo: \"Nauren Corpo a Corpo\", \"Nauren Distância\", \"Nauren Magia\", \"Nauren Cura\", \"Nauren Área\", \"Nauren Habilidade\". Cadastre esses nomes no menu do Automated Animations.",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register("nauren", "animacoesCriticos", {
    name: "Animações: crítico e falha crítica",
    hint: "Com o Sequencer e o JB2A ativos, mostra \"Critical\" (amarelo) em cima do token quando o d20 usado é acerto crítico (pelo Crítico Mínimo do personagem) e \"Critical Miss\" (vermelho) quando é falha crítica.",
    scope: "world", config: true, type: Boolean, default: true
  });
  // 0.94.16: Movimento dos tokens (Motion do Sequencer 4.3+), sincronizado com a animação em cada tela.
  game.settings.register("nauren", "motionAtivo", {
    name: "Animações: movimento dos tokens (Sequencer Motion)",
    hint: "Com o Sequencer 4.3 ou mais novo, os tokens se mexem conforme o resultado: bote no corpo a corpo, recuo no tiro, tremida e piscada vermelha ao sofrer dano, passo para o lado na Esquiva, recuo no Bloqueio, pulinho ao receber Prioridade, e Condições com aparência (Voo flutua, Caído deita, Atordoado cambaleia...). Só visual: a posição real do token não muda. Em cada tela, a reação do alvo espera a animação aparecer e acontece no impacto, mesmo com atraso do servidor.",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register("nauren", "motionMinhaTela", {
    name: "Animações: movimento dos tokens nesta tela",
    hint: "Só para você. Desligue se preferir os tokens parados ou se a máquina for lenta.",
    scope: "client", config: true, type: Boolean, default: true
  });
  game.settings.register("nauren", "motionIntensidade", {
    name: "Animações: força do movimento dos tokens",
    hint: "Multiplica a distância dos botes, recuos e tremidas. 1 = padrão.",
    scope: "world", config: true, type: Number, range: { min: 0.25, max: 2, step: 0.25 }, default: 1
  });
  game.settings.register("nauren", "motionImpacto", {
    name: "Animações: momento do impacto (% da animação)",
    hint: "Quando o golpe ou o projétil chega, em % da duração da animação do ataque. A reação do alvo acontece nesse ponto. Se a animação do JB2A marcar o impacto no próprio arquivo, essa marca vale no lugar deste número.",
    scope: "world", config: true, type: Number, range: { min: 10, max: 90, step: 5 }, default: 45
  });
  game.settings.register("nauren", "motionCorCura", {
    name: "Animações: cor da cura",
    hint: "Cor que o token pisca ao receber cura (hexadecimal, ex.: #4dff88 verde, #4da6ff azul). O dano pisca em vermelho e a Prioridade em dourado.",
    scope: "world", config: true, type: String, default: "#4dff88"
  });
  game.settings.register("nauren", "somSincronizado", {
    name: "Animações: som espera a animação",
    hint: "Em cada tela, o som de uma animação do Sequencer (Automated Animations) só começa quando o vídeo dela aparece, para os dois saírem juntos mesmo quando o vídeo demora a carregar no servidor. Espera no máximo 4 segundos.",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register("nauren", "criadorTodoEquipamento", {
    name: "Criador: todo o equipamento disponível",
    hint: "Desligado (padrão): na escolha de equipamento inicial aparecem todas as armas e só as armaduras simples (Robe, Couro, Cota, Capa, Botas e Escudo Simples). Ligado: aparecem também as reforçadas, de placa, Manto Cerimonial e escudos médio e grande. Cada item ainda pode ser marcado \"Sempre\" ou \"Nunca\" na aba Geral.",
    scope: "world", config: true, type: Boolean, default: false
  });
  game.settings.register("nauren", "removerConsumivelZerado", {
    name: "Remover consumíveis que acabam",
    hint: "Quando a quantidade de um consumível chega a 0, ele sai da ficha (com aviso no chat). Não remove consumíveis marcados \"Manter na ficha ao acabar\" nem os usados por outro item como fonte de cargas ou de veneno.",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register("nauren", "ocultarDescricaoNpc", {
    name: "Esconder as descrições dos NPCs no chat",
    hint: "Quando um NPC do Mestre (sem dono jogador) usa uma habilidade, magia ou item, o card mostra as rolagens, o dano, os efeitos e a Prioridade, mas não o texto da descrição - os jogadores não veem os detalhes. Mascotes e NPCs de jogadores continuam mostrando.",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register("nauren", "migracaoDisposicaoV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "cardsDeGatilho", {
    name: "Cards de gatilhos (passivas) no chat",
    hint: "Todos (padrão): cada passiva que dispara mostra um card, inclusive ganhos de recurso (+1 Determinação, +1 Estamina...). Resumido: ganhos simples de recurso só atualizam as barras, sem card. Nenhum: nenhum card de passiva.",
    scope: "world", config: true, type: String, default: "todos",
    choices: { todos: "Todos", resumido: "Resumido (sem ganhos simples de recurso)", nenhum: "Nenhum" }
  });
  game.settings.register("nauren", "derrotadoAutomatico", {
    name: "Marcar derrotado a 0 de Vida",
    hint: "Quando um personagem chega a 0 de Vida (dentro ou fora de combate), ele é marcado como derrotado na iniciativa e o token ganha o ícone de morto por cima da imagem. Com 1 de Vida ou mais, volta ao normal.",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register("nauren", "migracaoMarcaCacadorV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoMunicaoSemCuraV1", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoLadinoEstudosV3", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoMagoAntigoV2", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoEfeitoPermanenteV1", {
    scope: "world", config: false, type: Boolean, default: false
  });
  game.settings.register("nauren", "versaoItensSincronizados", {
    scope: "world", config: false, type: String, default: ""
  });
  game.settings.register("nauren", "mostrarVidaNosCards", {
    name: "Mostrar a Vida dos alvos nos cards",
    hint: "Quando ligado, cards de dano/cura (manual, colisão) mostram \"Vida antes → depois\". Desligado, mostram só o valor de dano ou cura, sem revelar a Vida atual do alvo aos jogadores.",
    scope: "world", config: true, type: Boolean, default: false
  });
  game.settings.register("nauren", "tempoReacaoSegundos", {
    name: "Tempo para reagir (segundos)",
    hint: "Popups de reação (ao ser atacado, ao receber efeitos e reações antes do ataque) mostram um cronômetro. Sem resposta no tempo, conta como sem reação. 0 = sem limite.",
    scope: "world", config: true, type: Number, default: 30, range: { min: 0, max: 300, step: 5 }
  });
  game.settings.register("nauren", "areasInstantaneasSomem", {
    name: "Áreas instantâneas somem no fim do turno",
    hint: "Áreas de Ações que acontecem na hora (Bola de Fogo, Arco Glacial, Mover Matéria...) ficam no mapa até o fim do turno em que foram usadas e então somem. Áreas que duram (sustentadas, armadilhas, Emanações, Presença) e as de entidades não são tocadas. Desligado: ficam até alguém apagar.",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register("nauren", "prioridadeAoAproximar", {
    name: "Sugerir Prioridade ao chegar perto de inimigo",
    hint: "Quando um personagem termina um movimento ao lado de um inimigo de quem não estava ao lado, sai um card com esse inimigo já marcado na escolha de Prioridade. Nada é concedido sozinho: o jogador confirma ou escolhe outro. Com Passo Gatuno, o card só registra a aproximação.",
    scope: "world", config: true, type: Boolean, default: true
  });
  // Cenas antigas em pés: o Mestre responde uma vez se quer converter para 1 m por quadrado.
  game.settings.register("nauren", "gradeMetrosPerguntada", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoEspadaLunarArremesso", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "migracaoConjuracaoPoderosaCusto", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register("nauren", "modoMovimentoPadrao", {
    name: "Movimento em combate (padrão)",
    hint: "Pop-up: ao passar do movimento pago, pergunta como pagar o próximo (Estamina, Impulso, cargas, outras fontes ou sem gastar). Automático: desconta 1 Estamina sozinho. Manual: não cobra. Cada ficha pode escolher outro modo na aba Opções.",
    scope: "world", config: true, type: String, default: "popup",
    choices: { popup: "Pop-up (pergunta)", automatico: "Automático (desconta sozinho)", manual: "Manual (não cobra)" }
  });
  game.settings.register("nauren", "limitePrioridadePorAliado", {
    name: "Limite de 2 Prioridades por aliado",
    hint: "Livro, Cap. III: um personagem recebe no máximo 2 Prioridades do mesmo aliado por turno (desconsiderado com 3 personagens ou menos no combate).",
    scope: "world", config: true, type: String, default: "aplicar",
    choices: { aplicar: "Aplicar (não concede a 3ª)", avisar: "Só avisar no card", ignorar: "Ignorar" }
  });
  game.settings.register("nauren", "prioridadeOpcionalNoCard", {
    name: "Prioridade opcional no card",
    hint: "Em Ações sem indicador de Prioridade informado, o card traz um painel recolhido para conceder Prioridade a quem o jogador escolher (aliados ou inimigos, quantos quiser, ou nenhum).",
    scope: "world", config: true, type: Boolean, default: true
  });
  // 0.97.4: a chave é "descricaoChatAbertaV2" — a antiga ("descricaoChatAberta") ficou gravada como "ligada" em muitos
  // navegadores (o Foundry salva todos os valores ao confirmar as configurações) e a descrição abria sozinha.
  game.settings.register("nauren", "luzDosItens", {
    name: "Luz e visão dos itens",
    hint: "Itens com Luz ou Visão (Tocha, Olhos de Coruja, magias de luz...) mudam a luz e a visão do token enquanto valem. Desligue se algum módulo cuidar disso.",
    scope: "world", config: true, type: Boolean, default: true,
    onChange: () => naurenAtualizarLuzVisaoDosTokens()
  });
  game.settings.register("nauren", "descricaoChatAbertaV2", {
    name: "Descrição aberta no card",
    hint: "Mostra a descrição já aberta no card de uso. Desligado (padrão), ela fica recolhida e abre com um clique.",
    scope: "client", config: true, type: Boolean, default: false
  });
  game.settings.register("nauren", "migracaoCamadasSubclasseV1", {
    scope: "world", config: false, type: Boolean, default: false
  });
  game.settings.register("nauren", "migracaoFormulaUnificadaV1", {
    scope: "world", config: false, type: Boolean, default: false
  });
  game.settings.register("nauren", "migracaoModificadorTextoV1", {
    scope: "world", config: false, type: Boolean, default: false
  });
  game.settings.register("nauren", "migracaoModificadorListaV1", {
    scope: "world", config: false, type: Boolean, default: false
  });
  game.settings.register("nauren", "migracaoImagemFundoSubclasseV1", {
    scope: "world", config: false, type: Boolean, default: false
  });
  game.settings.register("nauren", "migracaoImagemFundoExtensaoV1", {
    scope: "world", config: false, type: Boolean, default: false
  });
  game.settings.register("nauren", "migracaoImagemFundoWebpV1", {
    scope: "world", config: false, type: Boolean, default: false
  });
  game.settings.register("nauren", "migracaoCorpoDePedraV1", {
    scope: "world", config: false, type: Boolean, default: false
  });
});

/* =======================================
 * 7. INTERATIVIDADE DOS CARDS DE ROLAGEM NO CHAT
 * (delegado no document inteiro - funciona independente da versão do
 * Foundry e não precisa re-registrar listener a cada mensagem nova)
 * ======================================= */
/**
 * 0.107.2: armas que atacavam com a Agilidade passam a atacar com o Poder de Ataque (regra do livro; o Poder de
 * Ataque já usa o maior entre Força e Agilidade). Vale para as armas das fichas, dos itens do mundo e dos tokens
 * não vinculados, e para as Habilidades que atacam com a arma (Ataque Múltiplo, Disparo Quimérico).
 */
async function naurenMigrarAtaqueAgilidade() {
  if (!game.user?.isGM || game.settings.get("nauren", "migracaoAtaqueAgilidadeV1")) return;
  const NOMES_HAB = new Set(["Ataque Múltiplo", "Disparo Quimérico"]);
  const alvo = it => it.type === "arma" || (it.type === "habilidade" && NOMES_HAB.has(it.name));
  const corrigir = it => {
    const acoes = it.system?.acoes ?? [];
    if (!alvo(it) || !acoes.some(a => a?.atributoAtaque === "agilidade")) return null;
    return { _id: it.id, "system.acoes": acoes.map(a => a?.atributoAtaque === "agilidade" ? { ...a, atributoAtaque: "poderAtaque" } : a) };
  };
  let n = 0;
  const atores = [...game.actors];
  for (const cena of game.scenes ?? []) for (const td of cena.tokens ?? []) if (!td.actorLink && td.actor) atores.push(td.actor);
  for (const a of atores) {
    const ups = a.items.map(corrigir).filter(Boolean);
    if (ups.length) { try { await a.updateEmbeddedDocuments("Item", ups); n += ups.length; } catch (err) { console.warn("Nauren RPG | migração ataque/agilidade", a.name, err); } }
  }
  const mundo = game.items.map(corrigir).filter(Boolean);
  if (mundo.length) { await Item.updateDocuments(mundo).catch(err => console.warn("Nauren RPG | migração ataque/agilidade (itens)", err)); n += mundo.length; }
  await game.settings.set("nauren", "migracaoAtaqueAgilidadeV1", true);
  if (n) naurenLog(`Nauren RPG | ${n} armas passaram a atacar com o Poder de Ataque.`);
}
Hooks.once("ready", () => { naurenMigrarAtaqueAgilidade().catch(err => console.warn("Nauren RPG | migração ataque/agilidade", err)); });

/**
 * 0.108 (rebalanceamento): a Vida das criaturas do Criador de Monstros e da IA ganha o piso por Categoria.
 * Troca SÓ a fórmula gerada (exatamente "@vitalidade [* @categoria] * (@nivel + 2) [* 1.5]") pela nova
 * "[@categoria * ](@vitalidade * (@nivel + 2) + 25) [* 1.5]". Bando ("/ N"), Bestiário e fórmulas feitas à mão
 * ficam como estão. Quem estava com a Vida cheia continua cheio (ator e tokens não vinculados).
 */
function naurenFormulaVidaNova(f) {
  const m = /^\s*@vitalidade(\s*\*\s*@categoria)?\s*\*\s*\(\s*@nivel\s*\+\s*2\s*\)(\s*\*\s*1\.5)?\s*$/.exec(String(f ?? ""));
  if (!m) return null;
  return `${m[1] ? "@categoria * " : ""}(@vitalidade * (@nivel + 2) + 25)${m[2] ? " * 1.5" : ""}`;
}
async function naurenMigrarVidaInimigos() {
  if (!game.user?.isGM || game.settings.get("nauren", "migracaoVidaInimigosV1")) return;
  const cheio = a => { const v = a?.system?.vida; return !!v && Number(v.value) >= Number(v.max) && Number(v.max) > 0; };
  let n = 0;
  for (const a of game.actors.filter(x => x.type === "npc")) {
    if (a.system.calculoVida !== "customizado") continue;
    const nova = naurenFormulaVidaNova(a._source.system?.vidaFormula);
    if (!nova) continue;
    // Tokens não vinculados que usam a fórmula do ator (sem fórmula própria): guarda quem estava cheio.
    const tokens = [];
    for (const cena of game.scenes ?? []) for (const td of cena.tokens ?? []) {
      if (td.actorLink || td.actorId !== a.id || !td.actor) continue;
      if (td.delta?._source?.system?.vidaFormula !== undefined) continue;
      tokens.push({ td, cheio: cheio(td.actor) });
    }
    const estavaCheio = cheio(a);
    try {
      await a.update({ "system.vidaFormula": nova });
      if (estavaCheio) await a.update({ "system.vida.value": a.system.vida.max });
      for (const t of tokens) if (t.cheio && t.td.actor) await t.td.actor.update({ "system.vida.value": t.td.actor.system.vida.max });
      n++;
    } catch (err) { console.warn("Nauren RPG | migração da Vida dos inimigos", a.name, err); }
  }
  await game.settings.set("nauren", "migracaoVidaInimigosV1", true);
  if (n) {
    naurenLog(`Nauren RPG | Vida rebalanceada em ${n} criaturas.`);
    ui.notifications?.info(`Nauren RPG 0.108: a Vida de ${n} criatura(s) do Criador de Monstros foi rebalanceada (piso de Vida por Categoria).`);
  }
}
Hooks.once("ready", () => { naurenMigrarVidaInimigos().catch(err => console.warn("Nauren RPG | migração da Vida dos inimigos", err)); });

/**
 * 0.109.6: a Armadilha de Caça (Caçador) passa a afetar só inimigos. Troca "todos" por "inimigos" nas cópias
 * da Habilidade que já estão nas fichas (atores e tokens não vinculados) e nas armadilhas já montadas nos mapas.
 * O compêndio se atualiza sozinho (seed).
 */
async function naurenMigrarArmadilhaSoInimigos() {
  if (!game.user?.isGM || game.settings.get("nauren", "migracaoArmadilhaInimigosV1")) return;
  let n = 0;
  const arrumarAtor = async ator => {
    for (const it of ator?.items ?? []) {
      if (it.type !== "habilidade" || it.name !== "Armadilha de Caça") continue;
      const acoes = foundry.utils.deepClone(it._source.system?.acoes ?? []);
      let mudou = false;
      for (const ac of acoes) if (ac.usaTemplatePersistente && ac.templatePersistenteDisposicao === "todos") { ac.templatePersistenteDisposicao = "inimigos"; mudou = true; }
      if (mudou) { try { await it.update({ "system.acoes": acoes }); n++; } catch (err) { console.warn("Nauren RPG | migração da Armadilha", ator.name, err); } }
    }
  };
  for (const a of game.actors ?? []) await arrumarAtor(a);
  for (const cena of game.scenes ?? []) {
    for (const td of cena.tokens ?? []) if (!td.actorLink && td.actor) await arrumarAtor(td.actor);
    for (const r of cena.regions ?? []) {
      const tp = r.getFlag?.("nauren", "templatePersistente");
      if (!tp || tp.disposicao !== "todos") continue;
      const origem = tp.origemItemUuid ? await fromUuid(tp.origemItemUuid).catch(() => null) : null;
      if (origem?.name !== "Armadilha de Caça") continue;
      try { await r.setFlag("nauren", "templatePersistente", { ...tp, disposicao: "inimigos" }); n++; } catch (err) { console.warn("Nauren RPG | migração da Armadilha (mapa)", err); }
    }
  }
  await game.settings.set("nauren", "migracaoArmadilhaInimigosV1", true);
  if (n) ui.notifications?.info(`Nauren RPG 0.109.6: a Armadilha de Caça agora só afeta inimigos (${n} ajuste(s) em fichas e mapas).`);
}
/** 0.109.11: Infusão Floral já aplicada nas fichas passa a curar em todo turno (de qualquer um) e a contar turnos de qualquer um. */
Hooks.once("ready", async () => {
  try {
    if (!game.user?.isGM || game.settings.get("nauren", "migracaoInfusaoFloralV1")) return;
    const arrumar = async ator => {
      for (const it of ator?.items ?? []) {
        if (it.type !== "condicao" || it.name !== "Infusão Floral") continue;
        const efs = foundry.utils.deepClone(it._source.system?.efeitosPeriodicos ?? []);
        let mudou = false;
        for (const ef of efs) if (ef.recurso === "cura" && ef.quando === "inicioTurnoPortador") { ef.quando = "inicioTurnoQualquer"; mudou = true; }
        const upd = {};
        if (mudou) upd["system.efeitosPeriodicos"] = efs;
        if (it._source.system?.duracaoModo === "turnosPortador") upd["system.duracaoModo"] = "turnosQualquer";
        if (Object.keys(upd).length) await it.update(upd).catch(err => console.warn("Nauren RPG | migração da Infusão Floral", err));
      }
    };
    for (const a of game.actors ?? []) await arrumar(a);
    for (const cena of game.scenes ?? []) for (const td of cena.tokens ?? []) if (!td.actorLink && td.actor) await arrumar(td.actor);
    await game.settings.set("nauren", "migracaoInfusaoFloralV1", true);
  } catch (err) { console.warn("Nauren RPG | migração da Infusão Floral", err); }
});
/** 0.109.12: Prisão das Brumas (Preso/Cego por 1 turno) e Fadiga (Atordoado por 1 rodada) nas fichas que já tinham a habilidade. */
Hooks.once("ready", async () => {
  try {
    if (!game.user?.isGM || game.settings.get("nauren", "migracaoDuracoesLivroV1")) return;
    const alvos = { "Prisão das Brumas": ["Preso", "Cego"], "Fadiga": ["Atordoado"] };
    const arrumar = async ator => {
      for (const it of ator?.items ?? []) {
        const nomes = alvos[it.name]; if (!nomes || !["habilidade", "magia"].includes(it.type)) continue;
        const acoes = foundry.utils.deepClone(it._source.system?.acoes ?? []);
        let mudou = false;
        for (const ac of acoes) for (const c of ac.condicoesAplicadas ?? []) {
          const nome = c.uuid ? ((await fromUuid(c.uuid).catch(() => null))?.name ?? "") : "";
          if (nomes.includes(nome) && !c.duracaoExtraPorCrescimento) { c.duracaoExtraPorCrescimento = "1"; mudou = true; }
        }
        if (mudou) await it.update({ "system.acoes": acoes }).catch(err => console.warn("Nauren RPG | migração de durações", err));
      }
    };
    for (const a of game.actors ?? []) await arrumar(a);
    for (const cena of game.scenes ?? []) for (const td of cena.tokens ?? []) if (!td.actorLink && td.actor) await arrumar(td.actor);
    await game.settings.set("nauren", "migracaoDuracoesLivroV1", true);
  } catch (err) { console.warn("Nauren RPG | migração de durações", err); }
});
Hooks.once("ready", () => { naurenMigrarArmadilhaSoInimigos().catch(err => console.warn("Nauren RPG | migração da Armadilha", err)); });

/**
 * 0.107.1: CSS velho no cache. O Foundry carrega styles/nauren.css sem número de versão; o navegador (e o
 * CDN do Forge) pode continuar usando o arquivo da versão anterior depois da atualização, e as janelas novas
 * aparecem sem estilo. O CSS diz a própria versão (--nauren-css-versao); se não bater, carrega de novo.
 */
Hooks.once("ready", () => {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--nauren-css-versao").replace(/["']/g, "").trim();
    const atual = game.system?.version ?? "";
    if (v === atual) return;
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = `systems/${game.system.id}/styles/nauren.css?v=${encodeURIComponent(atual)}`;
    link.addEventListener("load", () => naurenLog(`Nauren RPG | CSS antigo no cache (${v || "sem versão"}); carreguei o da ${atual}.`));
    document.head.append(link);
  } catch (err) { console.warn("Nauren RPG | conferência do CSS", err); }
});
Hooks.once("ready", () => {
  // Migração one-shot: personagens/NPCs criados antes de opções da aba
  // Restaura os registros de CONFIG.statusEffects perdidos num
  // recarregamento de página (só existem em memória - ver
  // naurenRegistrarStatusDeCondicao) - roda em TODO cliente (não só o GM),
  // já que cada navegador tem sua própria CONFIG em memória, zerada a cada
  // carregamento.
  //
  // Cobre TANTO os Atores normais (game.actors: personagens/NPCs da barra
  // lateral) QUANTO os Atores SINTÉTICOS de token NÃO vinculado colocado
  // numa cena (tokenDoc.actor, com sua própria cópia de itens via
  // ActorDelta) - sem essa segunda parte, uma Condição aplicada
  // especificamente a um TOKEN (não ao Ator da barra lateral) nunca tinha
  // seu registro restaurado depois de um recarregamento, e tentar
  // removê-la falhava com "Invalid status ID" - exatamente o "às vezes
  // tira, às vezes não" relatado (dependia de qual dos dois o jogador
  // tinha usado). Um Set evita processar o MESMO Ator duas vezes (ex: um
  // token vinculado aponta pro mesmo Ator já contado em game.actors).
  const atoresJaProcessados = new Set();
  const restaurarCondicoesDoAtor = (actor) => {
    if (!actor || atoresJaProcessados.has(actor.uuid)) return;
    atoresJaProcessados.add(actor.uuid);
    for (const item of actor.items) {
      if (item.type === "condicao") naurenRegistrarStatusDeCondicao(item);
    }
  };
  for (const actor of game.actors) restaurarCondicoesDoAtor(actor);
  for (const cena of game.scenes) {
    for (const tokenDoc of cena.tokens) {
      restaurarCondicoesDoAtor(tokenDoc.actor);
    }
  }

  // Opções mudarem o padrão de "desligado" pra "ligado" (ver
  // CAMPOS_MIGRADOS_PARA_LIGADO) ainda têm o valor antigo gravado - mudar o
  // padrão do schema não reescreve retroativamente o que já existe. Cada
  // opção roda só uma vez por mundo (flag em game.settings) e só no GM
  // ativo "primário", pra ter permissão de editar todo mundo.
  if (game.users.activeGM === game.user) {
    naurenMigrarOpcoesPadraoLigado();
    naurenMigrarFormulasUnificadas();
    naurenMigrarModificadoresParaTexto();
    naurenMigrarModificadoresParaLista();
  }

  document.addEventListener("click", ev => {
    const mais = ev.target.closest(".nc-mais-alvos");
    if (mais) { mais.closest(".nauren-roll-card")?.classList.toggle("nc-alvos-todos"); return; }
    const header = ev.target.closest(".nrc-toggle");
    if (!header) return;
    const card = header.closest(".nauren-roll-card");
    const details = card?.querySelector(".nrc-details");
    if (!details) return;
    const expanded = card.classList.toggle("nrc-expanded");
    // Usa só style.display (não o atributo "hidden") - o Foundry parece
    // sanitizar/remover atributos booleanos como "hidden" do conteúdo da
    // mensagem de chat, mas os estilos inline sobrevivem normalmente.
    details.style.display = expanded ? "" : "none";
  });
});
/* → HUD de Combate: modulos/hud-combate.mjs */
__naurenIniciar_hud_combate();


/* =======================================
 * 8. ARRASTAR ITEM PARA A HOTBAR
 * Ao soltar um item (arma, magia, habilidade, consumível, armadura ou
 * efeito) arrastado da ficha em um slot da barra de acesso rápido nativa do
 * Foundry, cria (ou reaproveita) um macro de script que chama o mesmo "usar
 * item" (_useItem) da ficha - o jogador só precisa clicar o ícone.
 *
 * IMPORTANTE: este hook NÃO pode ser "async" na função de fora. O Foundry
 * decide se cancela o comportamento padrão dele (que é abrir a ficha do
 * documento solto) checando se o hook retornou `false` de forma SÍNCRONA,
 * na hora. Se a função for async, o que ela retorna na hora é uma Promise
 * (que não é `false`), então o Foundry não cancela a tempo e cria o macro
 * padrão dele por cima do nosso. Por isso o trabalho assíncrono roda numa
 * IIFE separada, e a função de fora devolve `false` imediatamente.
 * ======================================= */
/**
 * Botões manuais do card de rolagem (Tomar Dano/Cura/Recuperar Recurso -
 * ver _postRollCard): o HTML do card é renderizado UMA vez, por quem
 * lançou a Ação, e fica salvo estático em ChatMessage.content - todo
 * mundo que abrir o chat depois vê o MESMO HTML. Por isso "só aparecer
 * pro dono" não dá pra resolver no Handlebars (isso rodaria só uma vez,
 * pra quem postou) - precisa de um hook que roda no navegador de CADA
 * pessoa que vê a mensagem, toda vez que ela é desenhada na tela
 * (postagem nova, rolar o chat, recarregar a página). "Dono" aqui é
 * quem tem permissão de Dono sobre o Ator que usou a Ação, ou o Mestre.
 */
/**
 * Aplica dano manual (via botão do card de chat) - respeita a Redução de
 * Dano FIXA do alvo (Efeitos/Condições), mas sem o popup de reação
 * (Bloquear/Esquivar/Estresse) nem a "Redução de Dano por Uso" (esse
 * consumo condicional fica só pro fluxo normal de ataque, pra um clique
 * manual de correção não gastar uma carga de "Indestrutível" à toa).
 * NÃO passa "naurenOrigemCombate" de propósito - deixa os Gatilhos
 * reativos (euSofriDano/aliadoSofreuDano/metadeVida) dispararem
 * normalmente, exatamente como se o dano tivesse sido digitado à mão.
 */
async function naurenAplicarDanoManual(actor, quantidade) {
  if (!actor || quantidade <= 0) return;
  const reducao = actor.system.reducaoDanoTotal ?? 0;
  const danoFinal = Math.max(0, NaurenAlvoHelper.aplicarReducaoPercentual(actor, quantidade) - reducao); await NaurenAlvoHelper.consumirAoSofrerDano(actor, quantidade);
  const { escudoConsumido, danoNaVida, escudoRestante } = NaurenAlvoHelper.calcularDanoComEscudo(actor, danoFinal);
  const vidaAtual = actor.system.vida?.value ?? 0;
  const vidaNova = Math.max(0, vidaAtual - danoNaVida);
  const updates = { "system.vida.value": vidaNova };
  if (escudoConsumido > 0) updates["system.escudo.value"] = escudoRestante;
  const ok = await NaurenAlvoHelper.atualizarAtorSeguro(actor, updates);
  if (ok) {
    const ajustes = [];
    if (danoFinal !== quantidade) ajustes.push(`${quantidade} antes das reduções`);
    if (reducao > 0) ajustes.push(`Redução ${reducao}`);
    if (escudoConsumido > 0) ajustes.push(`Escudo absorveu ${escudoConsumido}`);
    naurenPostarCard({ ator: actor, titulo: "Dano aplicado", icone: "icons/magic/death/blood-corruption-vomit-red.webp", fonte: "Botão do card (manual)",
      linhas: [{ label: "Dano", value: danoFinal, breakdown: ajustes.join(" • ") }, game.settings.get("nauren", "mostrarVidaNosCards") ? { label: "Vida", value: `${vidaAtual} → ${vidaNova}` } : null].filter(Boolean) });
  }
}

/** Cura manual (via botão do card de chat) - respeita o teto de Vida Máxima. */
async function naurenAplicarCuraManual(actor, quantidade) {
  if (!actor || quantidade <= 0) return;
  const vidaAtual = actor.system.vida?.value ?? 0;
  const vidaMax = actor.system.vida?.max ?? 0;
  const vidaNova = Math.min(vidaMax, vidaAtual + quantidade);
  const curou = vidaNova - vidaAtual;
  if (curou <= 0) return;
  const ok = await NaurenAlvoHelper.atualizarAtorSeguro(actor, { "system.vida.value": vidaNova });
  if (ok) {
    naurenPostarCard({ ator: actor, titulo: "Cura aplicada", icone: "icons/magic/nature/root-vine-caduceus-healing.webp", fonte: "Botão do card (manual)",
      linhas: [{ label: "Cura", value: curou, breakdown: curou !== quantidade ? `${quantidade} (limitado pela Vida máxima)` : "" }, game.settings.get("nauren", "mostrarVidaNosCards") ? { label: "Vida", value: `${vidaAtual} → ${vidaNova}` } : null].filter(Boolean) });
  }
}

/** Devolve Estamina/Mana pro Ator que usou a Ação (botão "↩") - respeita o teto de cada recurso. */
async function naurenRecuperarRecursoManual(actor, recurso, quantidade) {
  if (!actor || quantidade <= 0) return;
  const campo = { estaminaCombate: "estaminaCombate", mana: "mana" }[recurso];
  if (!campo) return;
  const atual = actor.system[campo]?.value ?? 0;
  const max = actor.system[campo]?.max ?? 0;
  const novo = Math.min(max, atual + quantidade);
  const recuperou = novo - atual;
  if (recuperou <= 0) return;
  const ok = await NaurenAlvoHelper.atualizarAtorSeguro(actor, { [`system.${campo}.value`]: novo });
  if (ok) {
    const label = { estaminaCombate: "Estamina", mana: "Mana" }[recurso];
    naurenPostarCard({ ator: actor, titulo: `${label} devolvida`, icone: "icons/magic/time/clock-spinning-gold-pink.webp", fonte: "Botão do card (manual)",
      linhas: [{ label, value: `+${recuperou}`, breakdown: `${atual} → ${novo}` }] });
  }
}

/**
 * Mostra o Nível de Ameaça (ver NaurenGrupoHelper.ameacaDoAtor) ao lado
 * de cada combatente na Combat Tracker (aba de iniciativa) - só pro
 * Mestre (cada cliente roda este Hook independente; jogadores comuns
 * nunca executam o "if" abaixo, então nunca veem o badge). Só mostra
 * pra quem estiver cadastrado em algum Grupo - ninguém cadastrado não
 * ganha nenhum badge extra, pra não poluir a lista.
 * "[data-combatant-id]" é o padrão estável da Combat Tracker do Foundry
 * (uma <li> por combatente) - usado por praticamente todo módulo de
 * combate de terceiros, deve continuar válido em V13.
 */
Hooks.on("renderCombatTracker", (app, html) => {
  if (!game.user.isGM) return;
  const raiz = html?.querySelectorAll ? html : html?.[0];
  if (!raiz?.querySelectorAll) return;
  const combate = app.viewed ?? game.combats?.active;
  if (!combate) return;
  for (const li of raiz.querySelectorAll("[data-combatant-id]")) {
    const combatant = combate.combatants.get(li.dataset.combatantId);
    const actor = combatant?.actor;
    if (!actor) continue;
    const ameaca = NaurenGrupoHelper.ameacaDoAtor(actor);
    let badge = li.querySelector(".nauren-ameaca-badge");
    if (ameaca === null) {
      badge?.remove(); // saiu de todo Grupo (ex: removido dos Membros) - tira o badge velho
      continue;
    }
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "nauren-ameaca-badge";
      badge.title = "Nível de Ameaça (só o Mestre vê)";
      li.appendChild(badge);
    }
    badge.innerHTML = `<i class="fas fa-skull-crossbones"></i> ${ameaca}`; // sempre atualiza o número, mesmo se o badge já existia
  }
});

/**
 * Reflete em tempo real na Combat Tracker qualquer mudança num item
 * "grupo" (Ameaça ajustada, membro adicionado/removido etc.) - o Hook
 * "renderCombatTracker" acima só dispara sozinho em eventos DA PRÓPRIA
 * Tracker (mudar de turno, adicionar/remover combatente), não quando o
 * item "grupo" muda em outro lugar, então força um re-render manualmente
 * aqui. Sem filtrar por QUAL campo mudou (`changes.system` pode não vir
 * como objeto aninhado dependendo de como o `.update()` foi chamado, ex:
 * chave plana "system.membros" em vez de {system: {membros: ...}} - mais
 * seguro sempre re-renderizar do que arriscar perder uma atualização real
 * por causa de uma checagem que pode falhar silenciosamente).
 */
Hooks.on("updateItem", (item, changes) => {
  if (item.type !== "grupo") return;
  if (game.user.isGM) ui.combat?.render({ force: true });
});

/**
 * Atualiza a ficha de um item "grupo" ABERTA sozinha, sempre que QUALQUER
 * Ator cadastrado em "Membros do Grupo" dele mudar algo na própria ficha
 * (Vida, Mana, Estamina de Combate, Dados de Destino, Estresse etc.) - é
 * isso que faz os recursos mostrados no HUD do Grupo ficarem "ao vivo"
 * sem precisar reabrir a ficha manualmente. De propósito NÃO filtra por
 * qual campo mudou (já aprendido antes nesse sistema: "changes.system"
 * pode não vir como objeto aninhado dependendo de como o .update() foi
 * chamado, então checar isso pode falhar silenciosamente e perder uma
 * atualização real) - sempre re-renderiza se o Ator é membro de alguma
 * ficha de Grupo ABERTA, sem tentar adivinhar se valia a pena.
 * "foundry.applications.instances" é o registro de toda Application
 * ApplicationV2 renderizada nesse momento (framework novo do Foundry
 * V13) - filtra só as que são a ficha de um item tipo "grupo".
 */
Hooks.on("updateActor", (actor) => {
  for (const app of foundry.applications.instances.values()) {
    if (app.document?.type !== "grupo") continue;
    const membros = app.document.system.membros ?? [];
    if (membros.some(m => m.actorUuid === actor.uuid)) app.render();
  }
});
/* → Resumo do cartão para o Nauren no Discord: modulos/discord-resumo.mjs */
__naurenIniciar_discord_resumo();


/* =======================================
 * 9. GASTO AUTOMÁTICO DE ESTAMINA AO SE MOVER EM COMBATE
 * -----------------------------------------------------------------------
 * EXPERIMENTAL: esta é a parte mais nova/instável desta lista, porque
 * depende de como o V13 dispara os eventos de movimento de Token, o que
 * ainda não foi testado ao vivo. Se o comportamento não bater exatamente
 * com o esperado (cobrar cedo/tarde demais, não disparar em alguns tipos
 * de movimento), me avise com detalhes pra eu ajustar.
 *
 * Regra: só conta durante combate por turnos ("Combat" iniciado). Qualquer
 * personagem pode gastar Estamina se movendo em QUALQUER turno (não só no
 * próprio), já que neste sistema dá pra se mover durante o turno de outro
 * jogador. O "orçamento" de cada personagem (quanto já andou) só é
 * resetado quando é a VEZ DELE começar - não quando o turno de outra
 * pessoa avança. A cada vez que a distância acumulada desde o último
 * reset ultrapassa o Movimento total dele, gasta 1 Estamina de Combate
 * (se houver) - controlado por system.gastarEstaminaMovimento (aba Opções).
 * ======================================= */

// actorId -> { distancia: metros já percorridos desde o último reset, blocosPagos: quantos "blocos" de Movimento já foram cobrados }
// Fica só em memória (não persiste no ator): reseta quando é a vez daquele personagem começar, ou ao recarregar a página.
const naurenMovimentoEmCombate = new Map();
/* → Descer de nível: modulos/descer-nivel.mjs */
__naurenIniciar_descer_nivel();

/* → Movimento em combate: modulos/movimento.mjs */
__naurenIniciar_movimento();


/* ===== 0.92.46: Espada Lunar Leve pode ser arremessada (fichas e itens que já existiam) ===== */
Hooks.once("ready", () => { naurenMigrarEspadaLunarArremesso().catch(err => console.warn("Nauren RPG | Migração Espada Lunar", err)); });
async function naurenMigrarEspadaLunarArremesso() {
  if (!game.user.isGM || game.users.activeGM !== game.user) return;
  try { if (game.settings.get("nauren", "migracaoEspadaLunarArremesso")) return; } catch (err) { return; }
  const ajustar = async (it) => {
    if (it.type !== "magia" || it.getFlag("nauren", "seedId") !== "magia-pagina-21-conjurar-espada-lunar") return 0;
    const acoes = foundry.utils.deepClone(it.system.acoes ?? []);
    const i = acoes.findIndex(a => a.usaConjurarArma && /Leve/i.test(a.armaConjuradaNome ?? ""));
    if (i === -1 || acoes[i].armaConjuradaArremesso) return 0;
    acoes[i].armaConjuradaArremesso = "4m";
    if (!acoes[i].armaConjuradaTipo) acoes[i].armaConjuradaTipo = "Leve";
    await it.update({ "system.acoes": acoes }).catch(() => null);
    return 1;
  };
  let n = 0;
  for (const it of game.items) n += await ajustar(it);
  for (const a of game.actors) for (const it of a.items) n += await ajustar(it);
  for (const cena of game.scenes) for (const t of cena.tokens) if (!t.actorLink && t.actor) for (const it of t.actor.items) n += await ajustar(it);
  if (n) console.info(`Nauren RPG | Espada Lunar (Leve): arremesso de 4 m em ${n} item(ns).`);
  await game.settings.set("nauren", "migracaoEspadaLunarArremesso", true);
  return n;
}

/* ===== 0.92.52: Conjuração Poderosa custa 1 Mana + 1 PdE (livro 0.8.1; antes 3 Mana) ===== */
Hooks.once("ready", () => { naurenMigrarConjuracaoPoderosaCusto().catch(err => console.warn("Nauren RPG | Migração Conjuração Poderosa", err)); });
async function naurenMigrarConjuracaoPoderosaCusto() {
  if (!game.user.isGM || game.users.activeGM !== game.user) return;
  try { if (game.settings.get("nauren", "migracaoConjuracaoPoderosaCusto")) return; } catch (err) { return; }
  const ajustar = async (it) => {
    if (it.type !== "habilidade") return 0;
    const ehSeed = it.getFlag("nauren", "seedId") === "habilidade-mago-condensar-magia" || it.name === "Conjuração Poderosa";
    if (!ehSeed) return 0;
    const acoes = foundry.utils.deepClone(it.system.acoes ?? []);
    let mudou = false;
    for (const a of acoes) if (a.usaConjuracaoPoderosa && Number(a.custoMana) === 3) { a.custoMana = 1; mudou = true; }
    const upd = {};
    if (mudou) upd["system.acoes"] = acoes;
    const desc = String(it.system.descricao ?? "");
    if (desc.includes("Custo: 3 Mana + 1 PdE")) upd["system.descricao"] = desc.replace("Custo: 3 Mana + 1 PdE", "Custo: 1 Mana + 1 PdE");
    if (!Object.keys(upd).length) return 0;
    await it.update(upd).catch(() => null);
    return 1;
  };
  let n = 0;
  for (const it of game.items) n += await ajustar(it);
  for (const a of game.actors) for (const it of a.items) n += await ajustar(it);
  for (const cena of game.scenes) for (const t of cena.tokens) if (!t.actorLink && t.actor) for (const it of t.actor.items) n += await ajustar(it);
  if (n) console.info(`Nauren RPG | Conjuração Poderosa: custo 1 Mana em ${n} item(ns).`);
  await game.settings.set("nauren", "migracaoConjuracaoPoderosaCusto", true);
  return n;
}

/* ===== Grade em metros: o Nauren mede de 1 em 1 metro ===== */
/** A cena usa a grade padrão do Foundry (5 pés) ou não disse a escala? */
function naurenGradeEmPes(grid) {
  const unidade = String(grid?.units ?? "").trim().toLowerCase();
  const dist = Number(grid?.distance);
  return !unidade || ["ft", "ft.", "pés", "pes", "feet", "foot"].includes(unidade) || (dist === 5 && unidade !== "m");
}
/** Cena nova: se veio sem escala ou em pés, passa para 1 m por quadrado. */
Hooks.on("preCreateScene", (scene, data) => {
  const grid = { distance: data?.grid?.distance ?? scene.grid?.distance, units: data?.grid?.units ?? scene.grid?.units };
  if (!naurenGradeEmPes(grid)) return; // já em metros (inclusive outra escala escolhida de propósito)
  scene.updateSource({ "grid.distance": 1, "grid.units": "m" });
});
/** Cenas que já existem em pés: pergunta ao Mestre uma vez se quer converter todas. */
Hooks.once("ready", () => { naurenPerguntarGradeMetros().catch(err => console.warn("Nauren RPG | Grade em metros", err)); });
async function naurenPerguntarGradeMetros() {
  if (!game.user.isGM || game.users.activeGM !== game.user) return;
  let jaPerguntou = false; try { jaPerguntou = game.settings.get("nauren", "gradeMetrosPerguntada"); } catch (err) { return; }
  if (jaPerguntou) return;
  const emPes = game.scenes.filter(sc => naurenGradeEmPes(sc.grid));
  if (!emPes.length) { await game.settings.set("nauren", "gradeMetrosPerguntada", true); return; }
  const esc = v => foundry.utils.escapeHTML(String(v ?? ""));
  const lista = emPes.slice(0, 12).map(sc => `<li>${esc(sc.name)} <small>(${sc.grid.distance} ${esc(sc.grid.units || "sem unidade")})</small></li>`).join("") + (emPes.length > 12 ? `<li>… e mais ${emPes.length - 12}</li>` : "");
  const converter = await foundry.applications.api.DialogV2.confirm({ ...naurenKitSistema(),
    window: { title: "Grade em metros" }, position: { width: 420 },
    content: `<p>O Nauren mede distâncias de 1 em 1 metro. Estas cenas estão com a escala do Foundry em pés:</p><ul>${lista}</ul><p>Converter para <b>1 m por quadrado</b>? O tamanho dos quadrados no mapa não muda.</p>`,
    yes: { label: "Converter para 1 m" }, no: { label: "Deixar como está" }, rejectClose: false
  }).catch(() => false);
  if (converter) {
    await Scene.updateDocuments(emPes.map(sc => ({ _id: sc.id, "grid.distance": 1, "grid.units": "m" })));
    ui.notifications.info(`Nauren RPG: ${emPes.length} cena(s) agora em 1 m por quadrado.`);
  }
  await game.settings.set("nauren", "gradeMetrosPerguntada", true);
}

/**
 * NPC arrastado para o mapa: o token é SEMPRE independente (não vinculado - tem os próprios
 * atributos, Vida e Condições, sem mexer na ficha original) e, a partir da 2ª cópia na cena,
 * ganha um número no nome ("Urso Distorcido 2", "3"...), para diferenciar na Prioridade e nos cards.
 */
Hooks.on("preCreateToken", (tokenDoc, data) => {
  const actor = tokenDoc.actor ?? game.actors.get(data.actorId);
  if (actor?.type !== "npc") return;
  // Mascotes e companheiros de jogador continuam vinculados (a Vida e o progresso ficam na ficha deles).
  if (game.users.some(u => !u.isGM && actor.testUserPermission(u, "OWNER"))) return;
  const mudancas = { actorLink: false };
  const cena = tokenDoc.parent;
  const base = (data.name ?? actor.name ?? "").replace(/\s+\d+$/, "");
  const irmaos = cena ? cena.tokens.filter(t => t.actorId === actor.id) : [];
  if (irmaos.length) {
    const usados = new Set(irmaos.map(t => { const m = String(t.name).match(/\s(\d+)$/); return m ? Number(m[1]) : 1; }));
    let n = 2; while (usados.has(n)) n++;
    mudancas.name = `${base} ${n}`;
  }
  tokenDoc.updateSource(mudancas);
});

/** Barra de token de um recurso próprio (system.recursos.<id>.value) -> grava em recursosCustom. */
Hooks.on("preUpdateActor", (actor, changes) => {
  const rec = changes?.system?.recursos;
  if (!rec || typeof rec !== "object") return;
  const lista = foundry.utils.deepClone(actor.system.recursosCustom ?? []);
  let mudou = false;
  for (const [id, v] of Object.entries(rec)) {
    const alvo = lista.find(r => r.id === id);
    if (!alvo || v?.value === undefined) continue;
    const max = alvo.max || 0;
    alvo.valor = Math.max(0, max ? Math.min(max, Math.round(Number(v.value) || 0)) : Math.round(Number(v.value) || 0));
    mudou = true;
  }
  delete changes.system.recursos;
  if (mudou) changes.system.recursosCustom = lista;
});

/**
 * Lista de atributos de barra/valor dos tokens: os campos da ficha + os recursos próprios
 * (recursos.energia, recursos.determinacao...) encontrados em classes, subclasses e fichas do mundo.
 */
async function naurenAtualizarAtributosDeBarra() {
  const ids = new Set(["energia", "determinacao", "ofuscacao", "espiritodabatalha"]);
  for (const a of game.actors ?? []) for (const r of a.system?.recursosCustom ?? []) if (r?.id) ids.add(r.id);
  for (const cena of game.scenes ?? []) for (const t of cena.tokens) if (!t.actorLink) for (const r of t.actor?.system?.recursosCustom ?? []) if (r?.id) ids.add(r.id);
  for (const rotulo of ["Nauren - Subclasses", "Nauren - Classes"]) {
    const pk = game.packs.find(p => p.metadata.label === rotulo);
    if (!pk) continue;
    for (const doc of await pk.getDocuments().catch(() => [])) {
      for (const r of doc.system?.recursosDeclarados ?? doc.system?.recursos ?? []) { const id = r?.id ?? r?.chave; if (id) ids.add(String(id)); }
    }
  }
  const Token = foundry.documents.TokenDocument ?? CONFIG.Token.documentClass;
  const extras = [...ids].map(id => `recursos.${id}`);
  const config = {};
  for (const tipo of ["personagem", "npc"]) {
    let base = { bar: [], value: [] };
    try {
      const b = Token._getTrackedAttributesFromSchema(CONFIG.Actor.dataModels[tipo].schema);
      base = { bar: b.bar.map(c => c.join(".")), value: b.value.map(c => c.join(".")) };
    } catch (err) {
      base = { bar: ["vida", "mana", "estaminaCombate", "dadosDestino", "stress", "escudo"], value: [] };
    }
    config[tipo] = { bar: [...new Set([...base.bar, ...extras])], value: base.value };
  }
  CONFIG.Actor.trackableAttributes = config;
}
Hooks.once("ready", () => naurenAtualizarAtributosDeBarra().catch(err => console.warn("Nauren RPG | barras de recurso", err)));

// O Foundry marca como "só leitura" a barra de um campo calculado; os recursos próprios podem ser editados.
Hooks.once("setup", () => {
  const Doc = CONFIG.Token.documentClass;
  const original = Doc.prototype.getBarAttribute;
  if (typeof original !== "function") return;
  Doc.prototype.getBarAttribute = function (barName, opcoes) {
    const barra = original.call(this, barName, opcoes);
    if (barra && typeof barra.attribute === "string" && barra.attribute.startsWith("recursos.")) barra.editable = true;
    return barra;
  };
});

// Recurso próprio mudou (ex.: gastou Energia): redesenha as barras dos tokens desse personagem na hora.
Hooks.on("updateActor", (actor, changes) => {
  if (!changes?.system?.recursosCustom) return;
  for (const tok of actor.getActiveTokens?.(true, false) ?? []) {
    try { tok.renderFlags?.set?.({ refreshBars: true }); tok.drawBars?.(); } catch (err) { /* token em outra cena */ }
  }
});
Hooks.on("createItem", item => { if (item.type === "subclasse" || item.type === "classe") naurenAtualizarAtributosDeBarra().catch(() => {}); });

/**
 * Enquadramento da imagem do personagem na ficha: posição (x, y em %) e zoom, guardados em
 * flags.nauren.enquadramento junto com a imagem enquadrada (src). Só vale para aquela imagem.
 */
function naurenEstiloEnquadramento(actor, src) {
  const e = actor?.getFlag?.("nauren", "enquadramento");
  if (!e || !src || e.src !== src) return "";
  const x = Number(e.x ?? 50), y = Number(e.y ?? 50), z = Math.max(1, Number(e.zoom ?? 1));
  return `object-position: ${x}% ${y}%; transform: scale(${z}); transform-origin: ${x}% ${y}%;`;
}

async function naurenAbrirEnquadramento(actor, src, proporcao = 1.25) {
  if (!actor || !src) return;
  const salvo = actor.getFlag("nauren", "enquadramento");
  const estado = salvo?.src === src ? { x: salvo.x ?? 50, y: salvo.y ?? 50, zoom: salvo.zoom ?? 1 } : { x: 50, y: 50, zoom: 1 };
  const larg = 300, alt = Math.round(larg * proporcao);
  const esc = v => String(v).replace(/"/g, "&quot;");
  const conteudo = `<div class="nauren-enquadrar">
      <p class="nauren-mov-aviso" style="margin:0 0 8px;">Arraste a imagem para posicionar e use o zoom (barra ou roda do mouse). É assim que ela aparece na ficha.</p>
      <div class="nauren-enquadrar-moldura" style="width:${larg}px;height:${alt}px;"><img src="${esc(src)}" draggable="false"></div>
      <div class="nauren-enquadrar-controles">
        <i class="fas fa-magnifying-glass-minus"></i>
        <input type="range" class="nauren-enquadrar-zoom" min="1" max="3" step="0.01" value="${estado.zoom}">
        <i class="fas fa-magnifying-glass-plus"></i>
        <button type="button" class="nauren-enquadrar-centro"><i class="fas fa-crosshairs"></i> Centralizar</button>
      </div>
    </div>`;
  let final = null;
  await foundry.applications.api.DialogV2.wait({ ...naurenKitJanela(actor),
    window: { title: `Enquadrar imagem · ${actor.name}` }, position: { width: larg + 60 },
    content: conteudo,
    buttons: [
      { action: "salvar", label: "Salvar", default: true, callback: () => { final = { ...estado }; } },
      { action: "cancelar", label: "Cancelar" }
    ],
    rejectClose: false,
    render: (ev, dialog) => {
      const raiz = dialog.element;
      const img = raiz.querySelector(".nauren-enquadrar-moldura img");
      const moldura = raiz.querySelector(".nauren-enquadrar-moldura");
      const zoom = raiz.querySelector(".nauren-enquadrar-zoom");
      const aplicar = () => {
        img.style.objectPosition = `${estado.x}% ${estado.y}%`;
        img.style.transformOrigin = `${estado.x}% ${estado.y}%`;
        img.style.transform = `scale(${estado.zoom})`;
      };
      let arrastando = null;
      moldura.addEventListener("pointerdown", e => { arrastando = { x: e.clientX, y: e.clientY, ex: estado.x, ey: estado.y }; moldura.setPointerCapture(e.pointerId); moldura.classList.add("arrastando"); });
      moldura.addEventListener("pointermove", e => {
        if (!arrastando) return;
        const fator = 100 / estado.zoom;
        estado.x = Math.min(100, Math.max(0, arrastando.ex - (e.clientX - arrastando.x) / larg * fator));
        estado.y = Math.min(100, Math.max(0, arrastando.ey - (e.clientY - arrastando.y) / alt * fator));
        aplicar();
      });
      const soltar = () => { arrastando = null; moldura.classList.remove("arrastando"); };
      moldura.addEventListener("pointerup", soltar); moldura.addEventListener("pointercancel", soltar);
      moldura.addEventListener("wheel", e => { e.preventDefault(); estado.zoom = Math.min(3, Math.max(1, estado.zoom - Math.sign(e.deltaY) * 0.1)); zoom.value = estado.zoom; aplicar(); }, { passive: false });
      zoom.addEventListener("input", () => { estado.zoom = Number(zoom.value); aplicar(); });
      raiz.querySelector(".nauren-enquadrar-centro").addEventListener("click", () => { estado.x = 50; estado.y = 50; estado.zoom = 1; zoom.value = 1; aplicar(); });
      aplicar();
    }
  }).catch(() => null);
  if (!final) return;
  await actor.setFlag("nauren", "enquadramento", { src, x: Math.round(final.x * 10) / 10, y: Math.round(final.y * 10) / 10, zoom: Math.round(final.zoom * 100) / 100 });
}
/* → Regras do Criador de Monstros (travas, invocar, movimento sem Prioridade): modulos/monstros-regras.mjs */
__naurenIniciar_monstros_regras();

/* → Entrega de itens entre personagens: modulos/entrega-itens.mjs */

/* → Habilidades de monstros e Criador de Monstros e NPCs: modulos/criador-monstros.mjs */
__naurenIniciar_criador_monstros();

/* → HUD nativo: barras do token e editor de barras: modulos/barras-token.mjs */
__naurenIniciar_barras_token();

/* → Carrossel de turnos: modulos/carrossel.mjs */
__naurenIniciar_carrossel();

/* → Recursos do HUD de Combate: modulos/hud-recursos.mjs */

/* → Bando de lacaios: modulos/bando.mjs */
__naurenIniciar_bando();

/* → Inventor: Recarga de usos e Bancada de Invenção: modulos/inventor-bancada.mjs */

/* → Limite de equipamentos ofensivos e reações pagas de equipamento: modulos/equipamento-regras.mjs */
__naurenIniciar_equipamento_regras();

/* → Classe Inventor, subclasses, Frascos e Obra Prima: modulos/inventor.mjs */
__naurenIniciar_inventor();

/* → Condição pelo Token HUD do Foundry: modulos/condicao-hud-token.mjs */
__naurenIniciar_condicao_hud_token();


export { naurenConsertarReferenciasImport, naurenAvisarImportacao, naurenMigrarAtaqueAgilidade, naurenMigrarVidaInimigos, naurenFormulaVidaNova };
export { ARMADURA_TIPOS, ARMA_TIPOS, ATRIBUTOS_BASE_OPCOES, ATRIBUTOS_BONUS, CALCULO_DADOS_DESTINO_OPCOES, CALCULO_ESTAMINA_COMBATE_OPCOES, CALCULO_MANA_OPCOES, CALCULO_VIDA_OPCOES, HABILIDADE_CATEGORIAS, MODOS_ROLAGEM, NAUREN_ARRAYS_ADICIONAVEIS, NAUREN_ATRIBUTOS_CLASSE_LIVRO, NAUREN_ATRIBUTOS_CLASSE_LIVRO_0_101_0, NAUREN_CAMPOS_ACIMA_AUTOMATICOS, NAUREN_CAMPOS_ACIMA_GERAIS, NAUREN_CAMPOS_ANALISE_CRIATIVA, NAUREN_CAMPOS_ESTADO_ACAO, NAUREN_CAMPOS_ESTADO_ITEM, NAUREN_CAMPOS_MODIFICADOR_OPCOES, NAUREN_CAPACIDADES, NAUREN_CAPACIDADE_POR_NOME, NAUREN_CATEGORIAS_EQUIPAMENTO, NAUREN_CM_PECS, NAUREN_CORES_PINTURA, NAUREN_CRIADOR_PERFIS_CLASSE, NAUREN_EQUIPAMENTO_CLASSE_LIVRO, NAUREN_EQUIP_CATEGORIAS, NAUREN_FASE_MODIFICADOR, NAUREN_LOGICA_CONDICOES_OPCOES, NAUREN_MODOS_DURACAO, NAUREN_MODOS_MODIFICADOR_EXTERNO_OPCOES, NAUREN_MOMENTOS_PERIODICOS, NAUREN_NOMES_ATRIBUTO_CURTO, NAUREN_PAGAR_CUSTO_OPCOES, NAUREN_PAGAR_RECURSO_OPCOES, NAUREN_PODEROSA_EFEITOS, NAUREN_PRIORIDADE_DISPOSICAO, NAUREN_PRIORIDADE_INDICADORES, NAUREN_PRIORIDADE_INDICADORES_ACAO, NAUREN_PRIORIDADE_QUEM_RECEBE, NAUREN_QUANTIDADE_MAXIMA, NAUREN_QUERY_APLICAR_CONDICAO, NAUREN_QUERY_APLICAR_CONDICAO_ECO, NAUREN_QUERY_AREA_AO_CRIAR, NAUREN_QUERY_BESTA_INICIAL, NAUREN_QUERY_CRIAR_ITEM, NAUREN_QUERY_DANO_COLISAO, NAUREN_QUERY_DISPARAR_EVENTO, NAUREN_QUERY_DOMAR, NAUREN_QUERY_ITEM_MESTRE, NAUREN_QUERY_MANIPULAR, NAUREN_QUERY_REACAO_PRE_ATAQUE, NAUREN_REACAO_RESISTIR_OPCOES, NAUREN_REFERENCIA_FORMULAS, NAUREN_ROTULO_FASE_MODIFICADOR, NAUREN_TOKENS_CONTEXTO, NaurenActor, NaurenActorData, NaurenActorSheet, NaurenAlvoHelper, NaurenBarrasEditor, NaurenConcessaoHelper, NaurenCondicaoData, NaurenCriadorMonstro, NaurenEfeitoData, NaurenGrupoHelper, NaurenHabilidadeData, NaurenHudCombate, NaurenHudRecursosEditor, NaurenItemSheet, NaurenMagiaData, NaurenPeculiaridadeData, NaurenProgressaoHelper, NaurenSubclasseData, NaurenSubclasseHelper, NaurenToken, RECURSOS_ALVO, TEMPLATE_FORMATOS, USOS_RESET_LABEL, USOS_RESET_POR_COMBATE, calcularVidaBase, campoAcao, campoCondicaoAplicada, campoCuraBloco, campoDanoBloco, campoGatilho, campoModificador, campoModificadorExterno, campoRecursoDeclarado, naurenAbrirBorda, naurenAbrirConstrucaoPorAcao, naurenAbrirEnquadramento, naurenAcaoEhCura, naurenAcaoEhGolpe, naurenAcaoSemCustoEstaminaMana, naurenAgindoForaDoTurno, naurenAjustarListasLargas, naurenAjusteCriticoDoGrupo, naurenAjusteCustoManaMagia, naurenAlcanceEmMetros, naurenAliadosAte, naurenAlvoDaRecarga, naurenAlvosSaoVelhos, naurenAncoraDuracaoAtual, naurenAnotarModsRecebidosNoCard, naurenAnotarNoRegistro, naurenApagarItensSeExistirem, naurenAplicarAcalanto, naurenAplicarCuraManual, naurenAplicarDanoManual, naurenAplicarEfeitoSimples, naurenAplicarEfeitosPeriodicos, naurenAplicarPalavraComEscolha, naurenArmarPoderosa, naurenAtacouNoTurnoAtual, naurenAtaqueBasicoNaReacao, naurenAtorDoCard, naurenAtorTemRecurso, naurenAtoresDoTurno, naurenAtributosRecomendadosPreenchido, naurenAtualizarCondicaoPresenca, naurenAtualizarItemViaMestre, naurenAtualizarLuzVisaoDosTokens, naurenAvaliarExpressaoSimples, naurenAvancarDuracoesCondicoes, naurenAvisarEstrelaDoArcoIris, naurenAvisarSeLinkBloqueado, naurenBandoCfg, naurenBandoChave, naurenBandoMembros, naurenBandoNoAlcance, naurenBeneficiosDoEstado, naurenBonusAcimaContra, naurenBonusDanoPeriodico, naurenBordaPreviaDataUrl, naurenBordaPreviaDoAtor, naurenBotoesDeFormula, naurenBotoesDirecaoGrimorio, naurenBreakdownSimples, naurenBuscarMascotesDe, naurenCalcularEmpurrao, naurenCardMovimento, naurenCasasLivresEmVolta, naurenCategoriaDaArma, naurenCategoriaDoAtor, naurenCategoriaEquipamento, naurenCelulasNaArea, naurenChaveEscopoRelogio, naurenChaveFlagSegura, naurenChecarCondicaoAoAtingirMax, naurenClamparRecursosAoMaximo, naurenClassificarCampoAcao, naurenCombatenteEhDoAtor, naurenCompensacoesContraOrigem, naurenConcederPrioridadePeloCard, naurenConcederRecurso, naurenConcederRecursoAoAtacante, naurenCondicaoDoSistemaPorNome, naurenCondicaoNegativa, naurenCondicoesAtivas, naurenCondicoesLigadasA, naurenCongelarNoNivel, naurenConsumirUsoDaHabilidade, naurenContarAliadosProximos, naurenContextoInvencoes, naurenCriarFrascoEspecial, naurenCriarInvocacoes, naurenCriarItemNoAtor, naurenCriarObraPrima, naurenCronometroNoDialog, naurenDefinirCaminhoProfundo, naurenDepoisDoMovimento, naurenDescricaoParaChat, naurenDeslocarToken, naurenDiferencaDesfazer, naurenDispararEventoNoDono, naurenDisposicaoDoAtor, naurenEfeitoComSubst, naurenEhCondicaoModelo, naurenEhGolpeEspiritual, naurenEhItem, naurenEhMoeda, naurenEmpurrarToken, naurenEquipRecomendadoPreenchido, naurenEquipamentoGasta, naurenEquipamentoRecomendado, naurenEscalaPorCategoria, naurenEscolherCorDaPintura, naurenEscolherEfeitoPoderosa, naurenEscolherFrasco, naurenEscolherPeculiaridade, naurenEscolherPontoNoMapa, naurenEstiloDoCard, naurenEstiloEnquadramento, naurenEstresseDosAliados, naurenEstudoNoAlvo, naurenExecutarRecarga, naurenFaceD20, naurenFixarTipoAlcanceSemeado, naurenFontesDeModificadores, naurenFormatarNumero, naurenFormatarNumeroCurto, naurenFormulaComTokensDoAtor, naurenFormulaParaTexto, naurenFotoCenaDesfazer, naurenFotografarModsRecebidos, naurenFrascoParaPacote, naurenGastarRecursoSimples, naurenGrimorio, naurenGruposExclusivosConhecidos, naurenGuardarD20Roubado, naurenHandleQueryAreaAoCriar, naurenHandleQueryBestaInicial, naurenHandleQueryDanoColisao, naurenHandleQueryDomar, naurenHandleQueryItemMestre, naurenHandleQueryManipular, naurenHandleQueryReacaoPreAtaque, naurenHud, naurenHudAlvos, naurenHudAnimacoesLigadas, naurenIdentificadorTurnoAtual, naurenInterpretarModificador, naurenInterpretarModificadorComDado, naurenItemCorrespondeAoAlvo, naurenItemEhDoProjeto, naurenItemTemLuz, naurenItemValeAgora, naurenItensDoProjetoPorNome, naurenJanelaMovimento, naurenLerNumero, naurenLimiteOfensivoBase, naurenLimiteVagaDefesa, naurenLimparMeusAlvos, naurenLuzVisaoDoAtor, naurenMaisDadosPoderosa, naurenMapearStrings, naurenMarcarAlvosAgora, naurenMedirDistanciaBordas, naurenMelhorDistribuicao, naurenMestreDaMesa, naurenMetrosEmpurrao, naurenModificacoesRecebidas, naurenModoDuracaoCondicao, naurenModoMovimento, naurenModsAcima, naurenMomentoEfeitoPeriodico, naurenMontarDescricao, naurenMontarSelecaoPrioridade, naurenMostrarNomesDosCamposUuid, naurenMovSemPrioridadeUsado, naurenMoverGrimorio, naurenMoverSemMovimento, naurenMoverTokenPara, naurenMoverTokenViaMestre, naurenMovimentoEmCombate, naurenMovimentoSaldo, naurenMudancaMexeLuzVisao, naurenMudancasTokenLuzVisao, naurenMunicoesCompativeis, naurenNivelDeOrigemNaClasse, naurenNomeDeToken, naurenNomeDoRecurso, naurenNomeNormalizado, naurenNomeParaUuid, naurenNomeRecurso, naurenNotificarGanhoPerda, naurenOferecerAcovardar, naurenOferecerDestino, naurenOpcoesDeCampoParaModificadorExterno, naurenOperarEntidade, naurenOperarEstudo, naurenOperarRecursoViaMestre, naurenOperarRegistroPrioridade, naurenOrdemListaMagias, naurenPerfisSugestaoClasse, naurenPersistirDetalhesAbertos, naurenPersonagensEmCena, naurenPesoOfensivo, naurenPesoOfensivoEquipado, naurenPintarJanela, naurenPontoDentroDaRegiao, naurenPostarCard, naurenPostarDescricaoNoChat, naurenPreencherRecursosNoMaximo, naurenPreparacaoUsadas, naurenPrepararModificador, naurenPresosPorArmadilha, naurenPrioridadesGeradas, naurenPrioridadesNoTurno, naurenProcessarEmanacoes, naurenProcessarFrascoNoAlvo, naurenProcessarGatilhos, naurenProcessarTemplatesPersistentes, naurenRaizDaEvolucao, naurenReacoesPagasDano, naurenReacoesPagasDefesa, naurenReaplicarUpgradesDeSubclasse, naurenRecarregarUsos, naurenReconciliarTodosOsItens, naurenReconjurarPendente, naurenRecuperarRecursoManual, naurenRecursoDoAtor, naurenRecursoEstaTravado, naurenRecursosCustomConhecidos, naurenRegistrarAtaqueNoTurno, naurenRegistrarUsoTorre, naurenRegistroParaExport, naurenRegistroParaFicha, naurenRegraVagasDefesa, naurenRegrasExtras, naurenReordenarGrimorio, naurenResetarCompendios, naurenResolverPorNivel, naurenResolverPorRank, naurenResolverPrioridade, naurenResolverSelf, naurenResolverSelfEmObjeto, naurenResolverTokenFormula, naurenRestaurarArmasDaLoja, naurenResumoDaAcao, naurenResumoEquipamentoClasse, naurenResumoModificador, naurenResumoPrioridadeAcao, naurenRolagemAuditada, naurenRollToBreakdownText, naurenRotuloToken, naurenSincronizarCriativasDoLadino, naurenSincronizarGrimorio, naurenSincronizarRecursosCustom, naurenSomarEfeitoPermanente, naurenSubstituirTokensDeContexto, naurenTemEstado, naurenTempoReacao, naurenTextoFrascoEspecial, naurenTextoHistoricoDestino, naurenTextoModificador, naurenTextoRolagem, naurenTimeoutReacaoMs, naurenTipoAlcanceAdivinhado, naurenTipoAlcanceDaAcao, naurenTiposEstudoDoAtor, naurenTokenElegivelPorDisposicao, naurenTokensDeslocando, naurenTransferirRecursoDoAlvo, naurenTravaDaAcao, naurenTravaPrioridade, naurenUltimoAtacante, naurenUmaVezMarcar, naurenUmaVezRecusa, naurenUsarAcalanto, naurenUsoDisponivel, naurenUsosExtrasPara, naurenUsosPassivaMax, naurenUsuarioResponsavel, naurenUuidEhEsteToken, naurenUuidPorSeed, naurenVagaDefesa, naurenValorBasePorNivel, naurenValorEstudo, resumoCondicao, resumoCor, resumoEfeito };