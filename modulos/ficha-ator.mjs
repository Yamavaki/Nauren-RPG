/* Nauren RPG — Ficha do Ator (NaurenActorSheet). Separado do nauren.mjs na 0.94.22. */
import { ARMA_TIPOS, ATRIBUTOS_BONUS, CALCULO_DADOS_DESTINO_OPCOES, CALCULO_ESTAMINA_COMBATE_OPCOES, CALCULO_MANA_OPCOES, CALCULO_VIDA_OPCOES, MODOS_ROLAGEM, NAUREN_ARRAYS_ADICIONAVEIS, NAUREN_CAMPOS_ACIMA_AUTOMATICOS, NAUREN_CAMPOS_ACIMA_GERAIS, NAUREN_CAMPOS_ANALISE_CRIATIVA, NAUREN_CAMPOS_ESTADO_ACAO, NAUREN_CAMPOS_ESTADO_ITEM, NAUREN_CAMPOS_MODIFICADOR_OPCOES, NAUREN_FASE_MODIFICADOR, NAUREN_NOMES_ATRIBUTO_CURTO, NAUREN_PODEROSA_EFEITOS, NAUREN_QUERY_APLICAR_CONDICAO, NAUREN_QUERY_APLICAR_CONDICAO_ECO, NAUREN_QUERY_AREA_AO_CRIAR, NAUREN_QUERY_BESTA_INICIAL, NAUREN_QUERY_CRIAR_ITEM, NAUREN_QUERY_DANO_COLISAO, NAUREN_QUERY_DOMAR, NAUREN_QUERY_ITEM_MESTRE, NAUREN_QUERY_MANIPULAR, NAUREN_QUERY_REACAO_PRE_ATAQUE, NAUREN_REACAO_RESISTIR_OPCOES, NAUREN_REFERENCIA_FORMULAS, NAUREN_ROTULO_FASE_MODIFICADOR, NaurenActor, NaurenActorData, NaurenBarrasEditor, NaurenConcessaoHelper, NaurenCondicaoData, NaurenCriadorMonstro, NaurenEfeitoData, NaurenGrupoHelper, NaurenHabilidadeData, NaurenHudCombate, NaurenHudRecursosEditor, NaurenItemSheet, NaurenMagiaData, NaurenProgressaoHelper, NaurenSubclasseHelper, RECURSOS_ALVO, USOS_RESET_LABEL, USOS_RESET_POR_COMBATE, campoAcao, campoCondicaoAplicada, campoDanoBloco, campoGatilho, campoModificador, campoModificadorExterno, naurenAbrirBorda, naurenAbrirConstrucaoPorAcao, naurenAbrirEnquadramento, naurenAcaoEhCura, naurenAcaoEhGolpe, naurenAcaoSemCustoEstaminaMana, naurenAgindoForaDoTurno, naurenAjusteCriticoDoGrupo, naurenAjusteCustoManaMagia, naurenAlcanceEmMetros, naurenAliadosAte, naurenAlvoDaRecarga, naurenAlvosSaoVelhos, naurenAncoraDuracaoAtual, naurenAnotarModsRecebidosNoCard, naurenAnotarNoRegistro, naurenApagarItensSeExistirem, naurenAplicarAcalanto, naurenAplicarDanoManual, naurenAplicarEfeitoSimples, naurenAplicarEfeitosPeriodicos, naurenAplicarPalavraComEscolha, naurenArmarPoderosa, naurenAtacouNoTurnoAtual, naurenAtualizarCondicaoPresenca, naurenAtualizarItemViaMestre, naurenAvaliarExpressaoSimples, naurenAvisarEstrelaDoArcoIris, naurenAvisarSeLinkBloqueado, naurenBandoCfg, naurenBandoChave, naurenBandoMembros, naurenBandoNoAlcance, naurenBeneficiosDoEstado, naurenBonusAcimaContra, naurenBordaPreviaDataUrl, naurenBordaPreviaDoAtor, naurenBotoesDeFormula, naurenBotoesDirecaoGrimorio, naurenBreakdownSimples, naurenBuscarMascotesDe, naurenCalcularEmpurrao, naurenCategoriaDaArma, naurenCategoriaDoAtor, naurenCategoriaEquipamento, naurenCelulasNaArea, naurenChaveEscopoRelogio, naurenChaveFlagSegura, naurenChecarCondicaoAoAtingirMax, naurenClamparRecursosAoMaximo, naurenCombatenteEhDoAtor, naurenCompensacoesContraOrigem, naurenConcederPrioridadePeloCard, naurenConcederRecurso, naurenConcederRecursoAoAtacante, naurenCondicaoNegativa, naurenCondicoesAtivas, naurenCondicoesLigadasA, naurenCongelarNoNivel, naurenConsumirUsoDaHabilidade, naurenContarAliadosProximos, naurenContextoInvencoes, naurenCriarFrascoEspecial, naurenCriarInvocacoes, naurenCriarItemNoAtor, naurenCronometroNoDialog, naurenDescricaoParaChat, naurenDeslocarToken, naurenDiferencaDesfazer, naurenDispararEventoNoDono, naurenDisposicaoDoAtor, naurenEfeitoComSubst, naurenEhCondicaoModelo, naurenEhGolpeEspiritual, naurenEhItem, naurenEmpurrarToken, naurenEquipamentoRecomendado, naurenEscalaPorCategoria, naurenEscolherCorDaPintura, naurenEscolherEfeitoPoderosa, naurenEscolherFrasco, naurenEscolherPeculiaridade, naurenEscolherPontoNoMapa, naurenEstiloEnquadramento, naurenEstresseDosAliados, naurenEstudoNoAlvo, naurenExecutarRecarga, naurenFaceD20, naurenFontesDeModificadores, naurenFormulaComTokensDoAtor, naurenFormulaParaTexto, naurenFotoCenaDesfazer, naurenFotografarModsRecebidos, naurenFrascoParaPacote, naurenGastarRecursoSimples, naurenGrimorio, naurenGuardarD20Roubado, naurenHandleQueryAreaAoCriar, naurenHandleQueryBestaInicial, naurenHandleQueryDanoColisao, naurenHandleQueryDomar, naurenHandleQueryItemMestre, naurenHandleQueryManipular, naurenHandleQueryReacaoPreAtaque, naurenHudAlvos, naurenIdentificadorTurnoAtual, naurenInterpretarModificador, naurenInterpretarModificadorComDado, naurenItemCorrespondeAoAlvo, naurenItemEhDoProjeto, naurenItensDoProjetoPorNome, naurenLimiteOfensivoBase, naurenLimiteVagaDefesa, naurenLimparMeusAlvos, naurenMaisDadosPoderosa, naurenMapearStrings, naurenMarcarAlvosAgora, naurenMedirDistanciaBordas, naurenMestreDaMesa, naurenMetrosEmpurrao, naurenModsAcima, naurenMontarDescricao, naurenMontarSelecaoPrioridade, naurenMoverGrimorio, naurenMoverTokenPara, naurenMoverTokenViaMestre, naurenMovimentoSaldo, naurenMunicoesCompativeis, naurenNivelDeOrigemNaClasse, naurenNomeDeToken, naurenNomeDoRecurso, naurenNomeNormalizado, naurenNomeParaUuid, naurenNomeRecurso, naurenNotificarGanhoPerda, naurenOferecerAcovardar, naurenOferecerDestino, naurenOperarEntidade, naurenOperarEstudo, naurenOperarRecursoViaMestre, naurenOperarRegistroPrioridade, naurenOrdemListaMagias, naurenPersonagensEmCena, naurenPesoOfensivo, naurenPesoOfensivoEquipado, naurenPontoDentroDaRegiao, naurenPostarCard, naurenPostarDescricaoNoChat, naurenPreparacaoUsadas, naurenPrepararModificador, naurenPresosPorArmadilha, naurenPrioridadesGeradas, naurenProcessarEmanacoes, naurenProcessarFrascoNoAlvo, naurenProcessarGatilhos, naurenProcessarTemplatesPersistentes, naurenRaizDaEvolucao, naurenReacoesPagasDano, naurenReacoesPagasDefesa, naurenReaplicarUpgradesDeSubclasse, naurenRecarregarUsos, naurenReconciliarTodosOsItens, naurenReconjurarPendente, naurenRecursoDoAtor, naurenRecursoEstaTravado, naurenRegistrarAtaqueNoTurno, naurenRegistrarUsoTorre, naurenRegistroParaExport, naurenRegistroParaFicha, naurenRegraVagasDefesa, naurenRegrasExtras, naurenReordenarGrimorio, naurenResolverPorNivel, naurenResolverPorRank, naurenResolverPrioridade, naurenResolverSelf, naurenResolverSelfEmObjeto, naurenResolverTokenFormula, naurenResumoDaAcao, naurenResumoEquipamentoClasse, naurenRolagemAuditada, naurenRollToBreakdownText, naurenRotuloToken, naurenSincronizarCriativasDoLadino, naurenSincronizarGrimorio, naurenSincronizarRecursosCustom, naurenSomarEfeitoPermanente, naurenSubstituirTokensDeContexto, naurenTemEstado, naurenTempoReacao, naurenTextoFrascoEspecial, naurenTextoHistoricoDestino, naurenTextoModificador, naurenTextoRolagem, naurenTimeoutReacaoMs, naurenTipoAlcanceAdivinhado, naurenTipoAlcanceDaAcao, naurenTiposEstudoDoAtor, naurenTokenElegivelPorDisposicao, naurenTransferirRecursoDoAlvo, naurenTravaDaAcao, naurenUltimoAtacante, naurenUmaVezMarcar, naurenUmaVezRecusa, naurenUsoDisponivel, naurenUsosExtrasPara, naurenUsosPassivaMax, naurenUuidEhEsteToken, naurenUuidPorSeed, naurenVagaDefesa, naurenValorEstudo, resumoCondicao, resumoCor, resumoEfeito } from "../nauren.mjs";
import { NAUREN_MASCOTES_INICIAIS, naurenDisponivelNoInicio, naurenDuasArmasPendente, naurenExtraEstaminaCondicoes, naurenObterOuCriarPacks, naurenPreverDuasArmasGratis, naurenRolarAjustePopup, naurenTierTorre } from "./compendios.mjs";
import { naurenAnimarAcao, naurenAnimarCritico, naurenMotionEmTodos, naurenMotionEnviar, naurenMotionPlanoDaAcao } from "./animacoes.mjs";
/* =======================================
 * 4. FICHA DO ATOR (Application V1 - continua funcionando normalmente)
 * ======================================= */
// Degradê padrão de cada barra de recurso (Vida/Mana/Estamina de Combate/
// Dados de Destino) - usado sempre que o jogador não tiver customizado uma
// cor própria (ver system.corBarra). Vida usa o MESMO verde da barra do
// Token (CONFIG.Token.barConfig.bar1, ver Hooks.once("init")) por
// consistência entre a ficha e o mapa.
const NAUREN_BARRA_CORES_PADRAO = {
  vida: { cor1: "#1b4d2e", cor2: "#4caf50" },
  mana: { cor1: "#1b3a4d", cor2: "#4a90d9" },
  estaminaCombate: { cor1: "#4d1b1b", cor2: "#e53935" },
  dadosDestino: { cor1: "#3d1b4d", cor2: "#9c5fc7" }
};

/**
 * Adiciona um item (já resolvido, ex: vindo de fromUuid) na ficha de um
 * Ator - função INDEPENDENTE (não método de nenhuma classe específica)
 * porque tem dois chamadores de classes diferentes: NaurenActorSheet
 * (drag-and-drop, _onDropItem) e NaurenCriadorPersonagem (o assistente,
 * que resolve itens do compêndio sem passar por um evento de drop de
 * verdade - "this" lá é o assistente, não a ficha, então não dava pra
 * ser um método de NaurenActorSheet). Bloqueia multiclasse, marca a
 * origem (mesma flag usada em toda concessão automática do sistema), e -
 * se for uma Classe - aplica de uma vez tudo que os níveis já alcançados
 * concedem (não só os futuros).
 */
async function naurenAdicionarItemNaFicha(actor, item) {
  if (!item) return false;
  if (item.type === "classe" && actor.items.some(i => i.type === "classe")) {
    ui.notifications.warn(`${actor.name} já tem uma Classe (${actor.items.find(i => i.type === "classe").name}) — o sistema não permite multiclasse. Remova a Classe atual antes de adicionar outra.`);
    return false;
  }
  const itemData = item.toObject();
  foundry.utils.setProperty(itemData, "flags.nauren.origemUuid", item.uuid);
  if (item.type === "condicao") {
    foundry.utils.setProperty(itemData, "flags.nauren.cadeiaRaizUuid", item.uuid);
  }
  const criados = await actor.createEmbeddedDocuments("Item", [itemData]);

  const classeCriada = criados?.find(i => i.type === "classe");
  if (classeCriada) {
    await NaurenProgressaoHelper.aplicarAteNivel(actor, classeCriada, actor.system.nivel || 1);
  }
  return criados;
}

/** 0.94.11: número de Facilidades (+) / Dificuldades (−) de um modo ("vantagem"/"desvantagem"/"normal") ou de um contador. */
function naurenNumeroModo(m) { return typeof m === "number" && Number.isFinite(m) ? m : (m === "vantagem" ? 1 : m === "desvantagem" ? -1 : 0); }
/** Bônus das Facilidades/Dificuldades além da primeira: ±2 por extra (livro, Cap. I). 0 com uma só ou nenhuma. */
function naurenBonusModoExtra(soma) {
  const n = Math.abs(Math.trunc(Number(soma) || 0));
  if (n < 2) return 0;
  return Math.sign(soma) * 2 * (n - 1);
}
/** Linha do card/janela para o bônus acima (ex.: "Facilidade ×3: +4"). */
function naurenLinhaModoExtra(soma) {
  const b = naurenBonusModoExtra(soma);
  if (!b) return null;
  const n = Math.abs(Math.trunc(soma));
  return { label: `${soma > 0 ? "Facilidade" : "Dificuldade"} ×${n} (${n - 1} a mais)`, value: `${b > 0 ? "+" : "−"}${Math.abs(b)}` };
}

class NaurenActorSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  /** 0.94: botões da aba Invenções - usam a Ação do item como o HUD. */
  static async onInvUsar(ev, t) {
    const item = this.actor.items.get(t.dataset.itemId);
    if (item) await this._executarAcao(item, Number(t.dataset.acao) || 0);
  }
  /** 0.94.4: equipar/desequipar a invenção direto da aba (o limite de equipamentos ofensivos continua valendo). */
  static async onInvEquipar(ev, t) {
    const item = this.actor.items.get(t.dataset.itemId);
    if (item) await item.update({ "system.equipado": !item.system.equipado });
  }
  static async onInvBancada(ev, t) {
    const hab = this.actor.items.get(t.dataset.itemId);
    if (hab) naurenAbrirConstrucaoPorAcao(this.actor, hab, t.dataset.modo || "criar");
  }
  /** 0.94 (G5): Estresse permanente - só muda por aqui, com aviso claro e registro no chat. */
  static async onEstressePermanente() {
    const atual = this.actor.system.estressePermanente ?? 0;
    const max = this.actor.system.stress?.max ?? 0;
    const novo = await foundry.applications.api.DialogV2.prompt({
      window: { title: `Estresse permanente — ${this.actor.name}`, icon: "fas fa-triangle-exclamation" },
      content: `<div class="nauren-aviso-forte"><i class="fas fa-triangle-exclamation"></i><div><b>Atenção:</b> Estresse permanente ocupa espaços de Estresse que não saem com descanso, cura nem habilidade (ex.: Cirurgia Sinistra). Diminua só se o Mestre autorizar: esta é a única forma de remover.</div></div>
        <div class="form-group"><label>Estresse permanente (Estresse máximo: ${max})</label><input type="number" name="valor" value="${atual}" min="0" max="${Math.max(max, atual)}" step="1"></div>`,
      ok: { label: "Salvar", callback: (ev, btn) => Number(btn.form?.elements?.valor?.value ?? atual) },
      rejectClose: false
    }).catch(() => null);
    if (novo === null || novo === undefined || !Number.isFinite(Number(novo))) return;
    const v = Math.max(0, Math.floor(Number(novo)));
    if (v === atual) return;
    const upd = { "system.estressePermanente": v };
    if (v < atual) upd["system.stress.value"] = Math.max(v, (this.actor.system.stress?.value ?? 0) - (atual - v));
    await this.actor.update(upd);
    naurenPostarCard({ ator: this.actor, titulo: "Estresse permanente", icone: "icons/magic/control/fear-fright-monster-grin-red-orange.webp", fonte: game.user.name,
      linhas: [{ label: "Estresse permanente", value: `${atual} → ${v}`, breakdown: v < atual ? "removido manualmente na aba Opções" : "adicionado manualmente na aba Opções" }] }).catch(() => {});
  }
  // Guarda qual aba está aberta (Características/Inventário/...) entre um
  // render e outro - a API nativa de tabs do V1 fazia isso sozinha; na V2,
  // como _onRender roda do zero a cada atualização de dado, precisamos
  // lembrar manualmente pra não voltar sempre pra primeira aba.
  #abaAtiva = "inventario";
  #scrollSheetBody = 0; // guarda a posição de rolagem de .sheet-body entre renders - o mecanismo nativo "scrollable" da V2 não estava restaurando corretamente pra um seletor aninhado (só funciona bem pro elemento raiz da PART inteira)
  // Modo Jogo (padrão) mostra só o valor FINAL já calculado (base + bônus/
  // efeitos/pigmentos) de Estamina/Defesa/Movimento/Atributos, num quadrado
  // "apagado" (não editável) - Modo Edição mostra o campo editável de
  // verdade + o detalhamento "+X = Y". Só estado de UI (não é salvo no
  // personagem), reseta pro padrão a cada vez que a ficha é reaberta.
  #modoFichaEdicao = false;
  // Evita checar/mostrar o popup inicial ou reabrir o Criador de
  // Personagem mais de uma vez por SESSÃO de abertura desta ficha (ver
  // _onRender) - resetado toda vez que a ficha é fechada e reaberta.
  #criadorJaChecado = false;
  // Fila de atualizações por campo (evita perder cliques rápidos em
  // sequência num MESMO array, ex: "Adicionar linha" clicado várias
  // vezes seguidas antes do primeiro update salvar) - mesmo padrão já
  // usado em NaurenItemSheet#_enfileirarArray, só que pra Ator.
  #filas = new Map();
  _enfileirarArray(campoRaiz, mutador) {
    const anterior = this.#filas.get(campoRaiz) ?? Promise.resolve();
    const proxima = anterior
      .then(() => {
        const atual = foundry.utils.deepClone(this.actor.system[campoRaiz] ?? []);
        mutador(atual);
        return this.actor.update({ [`system.${campoRaiz}`]: atual });
      })
      .catch(err => console.error(`Nauren RPG | Erro ao salvar "${campoRaiz}":`, err));
    this.#filas.set(campoRaiz, proxima);
    return proxima;
  }
  // Alterna se o retrato exibido no Modo Edição é a imagem do Personagem
  // (padrão) ou a imagem do Token. Só estado de UI (não salvo), reseta a
  // cada vez que a ficha é reaberta.
  #imagemModoToken = false;
  // Quais barras de recurso (vida/mana/estaminaCombate/dadosDestino) estão
  // "abertas pra digitar" no momento - clicar na barra entra em edição,
  // clicar fora (blur) ou apertar Enter sai. Só estado de UI (não salvo).
  #recursosEditando = new Set();
  // Nível de Crescimento ESCOLHIDO pelo jogador na Ação atual (0 = não
  // investiu nenhum) - preenchido em _executarAcao logo antes de rolar,
  // lido por "@crescimento" em qualquer fórmula da MESMA Ação (dano, cura,
  // acúmulos de Condição, etc). Reseta a cada nova Ação executada, pra
  // nunca vazar pra uma rolagem não relacionada.
  #nivelCrescimentoAtual = 0;
  // Bônus que valem só contra alguns dos alvos (Marca do Caçador com Ataque Múltiplo, Bônus Condicional ao Alvo):
  // com vários alvos, cada um recebe o seu ao montar o pacote daquele alvo.
  #bonusPorAlvoAtual = [];
  // Escolhas do popup de pré-Ação (ver "_popupPreAcao"/"usaPopupPreAcao") -
  // mesma ideia de "#nivelCrescimentoAtual": preenchidas no início de
  // "_executarAcao", lidas pela rolagem de ataque/dano da MESMA Ação, e
  // resetadas a cada nova Ação (nunca vazam pra uma rolagem não
  // relacionada, mesmo se o popup estiver desligado).
  #modoPreAcaoAtual = null;
  #bonusAtaqueAdhocAtual = 0;
  #bonusDanoAdhocAtual = 0;
  #escudoParaAlvoAtual = null;    // escudo da Ação que vai para os alvos (rolado uma vez, igual para todos)
  #danoVerdadeiroAtual = 0;       // dano verdadeiro rolado neste ataque (vai para o alvo sem reduções)
  #danoVerdadeiroExtrasAtual = []; // fórmulas de dano verdadeiro vindas de "Efeitos em Ataques" (ex.: Golpe Penetrante)
  #danoVerdadeiroFormulaAtual = "";
  #bonusAlcanceAdhocAtual = 0;
  #bonusAreaAdhocAtual = 0;
  #ajusteLimiarDeflexaoAtual = 0;
  #consumirRecursosAtual = null; // null = comportamento normal (consome tudo); objeto = ver _popupPreAcao
  // Troca de Estamina por Espírito da Batalha (Guerreiro) - marcada no
  // popup de pré-Ação, ver _popupPreAcao/_espiritoDeBatalhaInfo.
  #trocarPorEspiritoBatalhaAtual = false;
  // "@atacouNesteTurno" (ver campoAcao > usaPerguntaAtaqueNoTurno) -
  // resposta do popup Sim/Não, resolvida no início de _executarAcao.
  #atacouNesteTurnoAtual = false;
  // "@quantidadeEscolhida" (ver campoAcao > usaEscolhaDeRecurso) -
  // número escolhido no popup, resolvida no início de _executarAcao.
  #quantidadeRecursoEscolhidaAtual = 0;
  // Modificadores Externos de Subclasse aplicados na execução ATUAL (ver
  // _coletarModificadoresExternos/_aplicarModificadoresExternos) - só
  // pra alimentar o card de chat com "Ajustado por: X (rank N)" mais pra
  // frente. Resetada a cada nova Ação, igual todo o resto acima.
  #modificadoresExternosAplicadosAtual = [];
  #tokensContextoUsadosAtual = [];
  #emPrioridadeAtual = null;
  #reacaoPreAtaqueAtual = null;
  #mensagemAguardando = null;
  #ajustesAtaqueAtual = [];
  #colisaoPrevistaAtual = null;
  #proximaAcaoAtual = null;

  #proximaAcaoCandidatosAtual = [];
  #entidadePendente = null;

  #movimentosAtual = [];
  #armaEscolhidaAtual = null;
  #efeitosEmAtaquesAtual = [];
  #estudoAtual = null;
  #poderosaAtual = null;          // efeitos da Conjuração Poderosa aplicados na magia desta execução
  #poderosaEscolhaAtual = null;   // efeito escolhido ao usar a Ação "Conjuração Poderosa"
  #acertoExtraEfeitos = [];
  #criticoEfeitos = 0;
  #beneficiosAtual = [];

  /**
   * Conceder benefícios do seu estado ativo (Fase 7, ex.: Matilha): lê a
   * Condição ativa do grupo configurado, pergunta quais N benefícios dar e
   * cria no(s) alvo(s) uma Condição com eles, até o fim do combate.
   */
  async _concederBeneficios(item, acao, tokensAfetados) {
    const grupo = acao.beneficiosGrupo;
    const estado = this.actor.items.find(i => i.type === "condicao" && i.system.ativo !== false && i.system.grupoExclusivo === grupo);
    if (!estado) {
      ui.notifications.warn(`"${item.name}": você não está em nenhum estado do grupo "${grupo}" (ex.: uma Forma).`);
      this.#beneficiosAtual.push({ label: "Benefícios", value: "nenhum (sem estado ativo)" });
      return;
    }
    const opcoes = naurenBeneficiosDoEstado(estado, this.actor);
    const quantidade = Math.max(1, Math.round(naurenAvaliarExpressaoSimples(String(acao.beneficiosQuantidade || "1").replace(/@rank\b/gi, String(this._rankEfetivo(item)))) || 1));
    if (!opcoes.length) return;
    const escolhidos = opcoes.length <= quantidade ? opcoes : await foundry.applications.api.DialogV2.prompt({
      window: { title: `${item.name} — ${estado.name}` },
      content: `<p>Escolha até <b>${quantidade}</b> benefícios de <b>${estado.name}</b> para conceder:</p>${opcoes.map(o => `<label class="nauren-popup-opt"><input type="checkbox" name="${o.id}"> <span>${o.rotulo}</span></label>`).join("")}`,
      ok: {
        label: "Conceder",
        callback: (ev, botao) => {
          const marcados = opcoes.filter(o => botao.form.elements[o.id]?.checked);
          return marcados.slice(0, quantidade);
        }
      },
      rejectClose: false
    }).catch(() => null);
    if (!escolhidos?.length) { this.#beneficiosAtual.push({ label: "Benefícios", value: "nenhum escolhido" }); return; }
    const sistema = {
      duracaoModo: "cena", duracaoRodadas: 0,
      modificadores: escolhidos.filter(o => o.modificador).map(o => o.modificador),
      reduzCustoEstamina: escolhidos.filter(o => o.reducao).map(o => o.reducao),
      descricao: naurenMontarDescricao({ regra: `Origem: ${item.name} (${this.actor.name}). Benefícios de ${estado.name}: ${escolhidos.map(o => o.rotulo).join(", ")}.`, automatico: "os benefícios escolhidos, até o fim do combate.", manual: "" })
    };
    for (const o of escolhidos) if (o.sistema) Object.assign(sistema, o.sistema);
    const comItem = escolhidos.find(o => o.item);
    if (comItem) Object.assign(sistema, { usaConcederItem: true, concederItemUuid: comItem.item });
    const dados = { name: `${item.name}: ${estado.name}`, type: "condicao", img: estado.img, system: sistema, flags: { nauren: { concessaoExpiraEm: "cena" } } };
    for (const tok of tokensAfetados) {
      const alvo = tok.actor ?? tok.object?.actor;
      if (!alvo || alvo === this.actor) continue;
      const nome = await naurenCriarItemNoAtor(alvo, dados);
      this.#beneficiosAtual.push({ label: `${naurenNomeDeToken(tok)} recebeu`, value: escolhidos.map(o => o.rotulo).join(", "), breakdown: nome ? "até o fim do combate" : "falhou (Mestre desconectado?)" });
    }
  }

  /**
   * "Mover escolhendo no mapa" (Fase 7): você ou cada alvo afetado vai para
   * a casa que o jogador clicar, até X metros. Sem "teleporte", o caminho
   * não pode cruzar parede e a casa precisa estar livre.
   */
  /**
   * O que esta Ação faz com a posição do alvo, para a janela de reação dele
   * (empurrar, puxar ou "mover cada alvo" escolhendo no mapa). null = não mexe no alvo.
   */
  _descreverMovimentoNoAlvo(item, acao, rank) {
    let tipo = "", metros = 0;
    if (acao.usaEmpurrar) {
      metros = naurenMetrosEmpurrao(acao.empurrarMetros, this.actor, rank) || 0;
      tipo = acao.empurrarDirecao === "puxar" ? "puxar" : "empurrar";
    } else if (acao.usaMoverEscolhendo && acao.moverQuem === "alvo") {
      const texto = String(acao.moverMetros ?? "0").replace(/@rank\b/gi, String(rank ?? 0))
        .replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, this.actor)));
      metros = Math.max(0, naurenAvaliarExpressaoSimples(texto) || 0);
      tipo = acao.moverTeleporte ? "teleportar" : "mover";
    }
    if (!tipo || !metros) return null;
    const evitar = ["custo", "nunca"].includes(acao.movimentoEvitar) ? acao.movimentoEvitar : "prioridade";
    let quantidade = 1;
    if (evitar === "custo") {
      const q = String(acao.movimentoEvitarQuantidade || "1").replace(/@rank\b/gi, String(rank ?? 0))
        .replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, this.actor)));
      quantidade = Math.max(1, Math.round(naurenAvaliarExpressaoSimples(q) || 1));
    }
    return { tipo, metros, evitar, recurso: acao.movimentoEvitarRecurso || "estamina", quantidade };
  }

  async _moverEscolhendo(item, acao, tokensAfetados, naoMover = null) {
    const metrosTexto = String(acao.moverMetros ?? "0").replace(/@rank\b/gi, String(this._rankEfetivo(item)))
      .replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, this.actor)));
    const metros = Math.max(0, naurenAvaliarExpressaoSimples(metrosTexto) || 0);
    if (!metros) return;
    const meuToken = canvas?.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
    const alvos = acao.moverQuem === "alvo" ? tokensAfetados.map(d => d.object ?? d).filter(Boolean) : (meuToken ? [meuToken] : []);
    const alvoReferencia = acao.moverPertoDoAlvo ? Array.from(game.user.targets ?? [])[0] : null;
    for (const tok of alvos) {
      const doc = tok.document ?? tok;
      const nomeTok = naurenNomeDeToken(doc);
      // Alvo que errou, evitou o ataque ou resistiu ao movimento fica onde está (card diz por quê).
      const motivoFica = acao.moverQuem === "alvo" ? naoMover?.get?.(doc.uuid) : null;
      if (motivoFica) { this.#movimentosAtual.push({ label: `Movimento — ${nomeTok}`, value: "não moveu", breakdown: motivoFica }); continue; }
      const validar = c => {
        if (acao.moverTeleporte) return "";
        const backend = CONFIG.Canvas.polygonBackends?.move;
        try { if (backend?.testCollision?.(tok.center, c, { type: "move", mode: "any" })) return "há uma parede no caminho."; } catch (err) { /* sem checagem */ }
        const ocupado = canvas.tokens.placeables.some(t => t !== tok && !t.document.hidden && Math.hypot(t.center.x - c.x, t.center.y - c.y) < canvas.grid.size * 0.5);
        return ocupado ? "a casa está ocupada." : "";
      };
      const escolha = await naurenEscolherPontoNoMapa({
        nome: `${acao.nome || item.name} — ${nomeTok}`, largura: doc.width, altura: doc.height,
        origem: alvoReferencia?.center ?? tok.center, alcanceMetros: metros, validar,
        textoAjuda: `Clique para onde ${nomeTok} vai (até ${metros}m${acao.moverTeleporte ? ", teleporte" : ""}). Esc: não mover.`
      });
      if (!escolha) { this.#movimentosAtual.push({ label: `Movimento — ${nomeTok}`, value: "não moveu" }); continue; }
      let distancia = 0;
      try { distancia = Math.round(canvas.grid.measurePath([tok.center, escolha])?.distance ?? 0); } catch (err) { distancia = 0; }
      const ok = await naurenMoverTokenPara(doc, escolha, { teleporte: !!acao.moverTeleporte });
      this.#movimentosAtual.push({ label: `${acao.moverTeleporte ? "Teleporte" : "Movimento"} — ${nomeTok}`, value: ok ? `${distancia}m` : "falhou (Mestre desconectado?)" });
    }
  }

  /**
   * Estudar um alvo (Análise Paciente, livro 0.8): escolhe o bônus que quer
   * desbloquear, rola Inteligência contra 8 + Inteligência do alvo (12 + nas
   * análises criativas) e, se passar, o alvo recebe acúmulo(s) de Analisado
   * na SUA marca e o bônus fica desbloqueado contra ele até o fim da cena.
   * Os bônus não se acumulam (cada um só uma vez); o valor deles é "por
   * acúmulo de Analisado". Tipos antigos (de Efeitos feitos à mão) continuam
   * funcionando como antes (acúmulos próprios, gastos no próximo ataque).
   */
  async _estudar(item, acao) {
    const linhas = [];
    const alvoTok = Array.from(game.user.targets ?? [])[0];
    const alvo = alvoTok?.actor;
    if (!alvo) { ui.notifications.warn("Analisar: marque um alvo (tecla T)."); return linhas; }
    const tipos = naurenTiposEstudoDoAtor(this.actor);
    if (!tipos.length) { ui.notifications.warn("Analisar: você não tem bônus de análise."); return linhas; }
    const marca = naurenEstudoNoAlvo(alvo, this.actor);
    const dadosMarca = marca?.getFlag("nauren", "estudo") ?? {};
    const estado = dadosMarca.tipos ?? {};
    const infAtual = dadosMarca.informacoes ?? 0;
    const criativasFeitas = dadosMarca.criativas ?? {};
    const resumo = (t, inf = Math.max(1, infAtual)) => {
      const n = naurenValorEstudo(t, 1, inf);
      const sufixo = t.tipo.porAnalisado ? " agora" : "";
      const partes = [];
      if (t.tipo.criativa === "acima") return "+1 no campo escolhido por acúmulo, até o fim da cena (teste 12 + Int do alvo)";
      if (t.tipo.criativa === "abaixo") return "seu próximo acerto nele dá −1 no campo escolhido por acúmulo, até o fim da cena ou 2 PdE (teste 12 + Int do alvo)";
      if (t.tipo.bonusAcerto) partes.push(`+${n} acerto${sufixo}`);
      if (t.tipo.bonusDano) partes.push(`+${n} dano${sufixo}`);
      if (t.tipo.dadosDaArma) partes.push(`+${n} dado(s) da arma${sufixo}`);
      if (t.tipo.criticoMais) partes.push(`crítico −${n}`);
      if (t.tipo.danoExtraDado) partes.push(`+${t.tipo.danoExtraDado}`);
      if (t.tipo.semPrioridade) partes.push(t.tipo.porAnalisado ? `${n} ataque(s) sem Prioridade, declarados antes de rolar` : "sem Prioridade");
      if (t.tipo.condicaoUuid) { let nm = "Condição"; try { nm = fromUuidSync(t.tipo.condicaoUuid)?.name ?? nm; } catch (err) { /* nome genérico */ } partes.push(`${nm} ×${Math.max(1, n)}`); }
      if (t.tipo.esquivaContra) partes.push(`+${n} esquiva contra ele${sufixo}`);
      return partes.join(", ") || "só informação";
    };
    const travado = t => !t.tipo.criativa && (estado[t.chave]?.acumulos ?? 0) >= (Number(t.tipo.maxAcumulos) || 99);
    const temComum = tipos.some(t => !t.tipo.criativa && !travado(t));
    const esc = v => foundry.utils.escapeHTML(String(v ?? ""));
    const proximo = Math.max(1, infAtual + 1);
    // Janela compacta (0.90.4): cartões clicáveis em vez de uma fileira de botões largos.
    const icones = { movimentos: "fa-person-running", ondeDoi: "fa-crosshairs", estrategia: "fa-chess-knight", defesa: "fa-shield-halved", acima: "fa-arrow-up", abaixo: "fa-arrow-down" };
    const efeitoCurto = t => {
      const n = naurenValorEstudo(t, 1, proximo);
      // Bônus ainda não liberado: hoje não vale nada; mostra quanto vai valer se esta análise passar.
      const seta = txtDepois => `<b>${txtDepois}</b> se passar`;
      if (t.tipo.esquivaContra) return seta(`+${n} esquiva contra ele`);
      if (t.tipo.dadosDaArma) return seta(`+${n} dado${n > 1 ? "s" : ""} da arma`);
      if (t.tipo.semPrioridade && t.tipo.porAnalisado) return seta(`${n} ataque${n > 1 ? "s" : ""} sem Prioridade`);
      if (t.tipo.bonusAcerto) return seta(`+${n} no acerto`);
      return esc(resumo(t, proximo));
    };
    // Bônus já desbloqueado: mostra o valor de hoje e o de depois (todos sobem juntos com o acúmulo).
    const desbloqueadoTxt = t => {
      if (!t.tipo.porAnalisado) return "desbloqueado";
      const agora = naurenValorEstudo(t, 1, Math.max(1, infAtual));
      const depois = naurenValorEstudo(t, 1, proximo);
      return `desbloqueado · +${agora} <span class="na-depois">(vai a +${depois} se passar)</span>`;
    };
    const comuns = tipos.map((t, i) => ({ t, i })).filter(x => !x.t.tipo.criativa);
    const criativas = tipos.map((t, i) => ({ t, i })).filter(x => x.t.tipo.criativa);
    const cartao = ({ t, i }) => {
      const feito = travado(t);
      const atual = estado[t.chave]?.acumulos ?? 0, max = Number(t.tipo.maxAcumulos) || 99;
      const extra = !t.tipo.porAnalisado ? ` <span class="na-cont">${atual}/${max}</span>` : "";
      return `<button type="button" class="na-op${feito ? " feito" : ""}" data-opcao="${i}" ${feito ? "disabled" : ""}>
        <i class="fas ${icones[t.tipo.id] ?? "fa-eye"}"></i>
        <span class="na-txt"><b>${esc((n => n.charAt(0).toUpperCase() + n.slice(1))(t.tipo.nome.replace(/^Conheço /, "")))}${extra}</b><small>${feito ? desbloqueadoTxt(t) : efeitoCurto(t)}</small></span>
        ${feito ? `<i class="fas fa-check na-ok"></i>` : ""}</button>`;
    };
    const feitasC = Object.values(criativasFeitas);
    const camposOpc = Object.entries(NAUREN_CAMPOS_ANALISE_CRIATIVA).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("") + `<option value="outro">Outro…</option>`;
    // Bônus de "testes de visão" (ex.: Olhar, +1d4): cada fonte vira uma caixa já marcada.
    const fontesVisao = this.actor.items.filter(i => i.system?.ativo !== false && String(i.system?.bonusTesteVisao ?? "").trim());
    const marcadasVisao = new Set(fontesVisao.map(i => i.id));
    const caixasVisao = fontesVisao.length ? `<div class="na-visao">${fontesVisao.map(i =>
      `<label><input type="checkbox" data-visao="${i.id}" checked> ${esc(i.name)} <em>+${esc(i.system.bonusTesteVisao)}</em></label>`).join("")}</div>` : "";
    const conteudo = `<div class="na-janela">
      <header class="na-cab">
        <img src="${esc(alvoTok.document.texture?.src ?? alvo.img)}" alt="">
        <div><b>${esc(alvoTok.document.name)}</b><span>Analisado <b>${infAtual}</b> acúmulo${infAtual === 1 ? "" : "s"}</span>${infAtual > 0 ? `<span class="na-passando">Passando: todos os bônus sobem para <b>+${proximo}</b></span>` : ""}</div>
      </header>
      <div class="na-sec">Bônus <em>(cada um uma vez · S.I 8 + Int do alvo)</em></div>
      <div class="na-grade">${comuns.map(cartao).join("")}${!temComum ? `<button type="button" class="na-op na-largo" data-opcao="so"><i class="fas fa-layer-group"></i><span class="na-txt"><b>Só o acúmulo</b><small>todos os bônus já desbloqueados</small></span></button>` : ""}</div>
      ${criativas.length ? `<div class="na-sec">Análise criativa <em>(S.I 12 + Int do alvo)</em></div>
      <div class="na-grade">${criativas.map(({ t, i }) => `<button type="button" class="na-op" data-opcao="${i}"><i class="fas ${icones[t.tipo.id] ?? "fa-star"}"></i><span class="na-txt"><b>${esc(t.tipo.nome)}</b><small>${t.tipo.criativa === "acima" ? `<b>+${proximo}</b> em você se passar (só contra ele)` : `<b>−${proximo}</b> nele no próximo acerto, se passar`}</small></span></button>`).join("")}</div>
      <div class="na-campo" hidden><label>Campo <select data-campo-criativo>${camposOpc}</select></label><input type="text" data-campo-outro placeholder="palavra-chave" hidden></div>
      ${feitasC.length ? `<div class="na-chips">${feitasC.map(c => `<span>${c.modo === "acima" ? "▲" : "▼"} ${esc(c.rotulo)}</span>`).join("")}</div>` : ""}` : ""}
      ${caixasVisao}
      <p class="na-aviso" hidden></p>
    </div>`;
    let entrada = null, criativa = null;
    let selecionado = null;
    const escolhaCampo = { campo: "defesa", outro: "" };
    const validar = raiz => {
      const t = selecionado !== null && selecionado !== "so" ? tipos[Number(selecionado)] : null;
      const campoBox = raiz.querySelector(".na-campo");
      const aviso = raiz.querySelector(".na-aviso");
      if (campoBox) campoBox.hidden = !t?.tipo.criativa;
      let msg = "";
      if (t?.tipo.criativa) {
        if (escolhaCampo.campo === "outro" && !escolhaCampo.outro) msg = "Escreva a palavra-chave do campo.";
        const chaveC = `${t.tipo.criativa}:${escolhaCampo.campo === "outro" ? escolhaCampo.outro.toLowerCase() : escolhaCampo.campo}`;
        if (criativasFeitas[chaveC]) msg = "Esse campo já está desbloqueado (não se acumula).";
        else if (t.tipo.criativa === "acima" && escolhaCampo.campo === "movimento") msg = "Movimento vale de forma geral: +1 por acúmulo em qualquer movimento seu.";
        else if (t.tipo.criativa === "acima" && escolhaCampo.campo === "espirito") msg = "Espírito vale de forma geral: +1 por acúmulo (e +1 de Mana máxima).";
        else if (t.tipo.criativa === "abaixo" && escolhaCampo.campo === "espirito") msg = "Ele perde 1 de Espírito por acúmulo (e 1 de Mana máxima).";
      }
      if (aviso) { aviso.textContent = msg; aviso.hidden = !msg; }
      const bloqueia = selecionado === null || (t?.tipo.criativa && (msg.startsWith("Escreva") || msg.startsWith("Esse campo já")));
      const bt = raiz.closest(".application, dialog")?.querySelector('button[data-action="analisar"]') ?? raiz.ownerDocument.querySelector('button[data-action="analisar"]');
      if (bt) bt.disabled = !!bloqueia;
    };
    const escolha = await foundry.applications.api.DialogV2.wait({
      window: { title: `${item.name}`, icon: "fas fa-magnifying-glass" },
      classes: ["nauren-analise-janela"], position: { width: 440 },
      content: conteudo,
      buttons: [{ action: "analisar", label: "Analisar", icon: "fas fa-eye", default: true, callback: () => "analisar" }, { action: "cancelar", label: "Cancelar" }],
      rejectClose: false,
      render: (ev, dialog) => {
        const raiz = dialog.element.querySelector(".na-janela");
        if (!raiz) return;
        raiz.querySelectorAll("button.na-op:not([disabled])").forEach(b => b.addEventListener("click", () => {
          raiz.querySelectorAll("button.na-op").forEach(x => x.classList.toggle("sel", x === b));
          selecionado = b.dataset.opcao;
          validar(raiz);
        }));
        raiz.querySelectorAll("input[data-visao]").forEach(c => c.addEventListener("change", () => {
          if (c.checked) marcadasVisao.add(c.dataset.visao); else marcadasVisao.delete(c.dataset.visao);
        }));
        const sel = raiz.querySelector("select[data-campo-criativo]");
        const txt = raiz.querySelector("input[data-campo-outro]");
        sel?.addEventListener("change", () => { escolhaCampo.campo = sel.value; if (txt) txt.hidden = sel.value !== "outro"; validar(raiz); });
        txt?.addEventListener("input", () => { escolhaCampo.outro = txt.value.trim(); validar(raiz); });
        validar(raiz);
      }
    }).catch(() => "cancelar");
    if (escolha !== "analisar" || selecionado === null) { linhas.push({ label: "Análise", value: "cancelada" }); return linhas; }
    if (selecionado === "so") entrada = { chave: null, tipo: { nome: "Só o acúmulo", maxAcumulos: "99" }, soAcumulo: true };
    else {
      const t = tipos[Number(selecionado)];
      if (t.tipo.criativa) {
        const campo = escolhaCampo.campo;
        if (campo === "outro" && !escolhaCampo.outro) { ui.notifications.warn("Análise criativa: escreva a palavra-chave do campo."); return linhas; }
        const rotulo = campo === "outro" ? escolhaCampo.outro : NAUREN_CAMPOS_ANALISE_CRIATIVA[campo];
        const chaveC = `${t.tipo.criativa}:${campo === "outro" ? escolhaCampo.outro.toLowerCase() : campo}`;
        if (criativasFeitas[chaveC]) { ui.notifications.warn(`"${t.tipo.nome}: ${rotulo}" já está desbloqueado contra ${alvoTok.document.name}.`); return linhas; }
        criativa = { chave: chaveC, modo: t.tipo.criativa, campo: campo === "outro" ? "" : campo, rotulo };
      }
      entrada = t;
    }
    if (!entrada) return linhas;
    // Teste de Inteligência contra 8 + Inteligência do alvo (+4 na análise criativa: 12 + Int do alvo).
    let intMinha = this.actor.system.atributosTotais?.inteligencia ?? this.actor.system.atributos?.inteligencia?.value ?? 0;
    const bonusEstudo = this.actor.items.filter(i => i.type === "habilidade" && i.system.ativo !== false && Number(i.system.bonusTesteEstudo))
      .map(i => ({ nome: i.name, valor: Number(i.system.bonusTesteEstudo) * Math.max(1, i.system.rankAtual || 1) }));
    const intAlvo = alvo.system.atributosTotais?.inteligencia ?? alvo.system.atributos?.inteligencia?.value ?? 0;
    const baseSI = 8 + (Number(entrada.tipo.dificuldadeExtra) || 0);
    const dificuldade = baseSI + intAlvo;
    for (const i of fontesVisao) if (marcadasVisao.has(i.id)) bonusEstudo.push({ nome: i.name, valor: String(i.system.bonusTesteVisao).trim() });
    // Bônus com dado (ex.: Olhar +1d4) é rolado ANTES, à parte: entra no teste como número e aparece como "+1d4 (3)".
    // Rerolar com Destino rerola só o d20 (regra do livro); o valor do bônus fica.
    for (const b of bonusEstudo) {
      if (!/\d*d\d+/i.test(String(b.valor))) continue;
      try {
        const r = await new Roll(String(b.valor)).evaluate();
        if (game.dice3d && r.dice.length) await game.dice3d.showForRoll(r, game.user, true);
        b.rotulo = `+${b.valor} (${r.total})`; b.valor = r.total;
      } catch (err) { console.warn("Nauren RPG | bônus do estudo", b.valor, err); }
    }
    const nomeTeste = criativa ? `${entrada.tipo.nome}: ${criativa.rotulo}` : entrada.tipo.nome;
    const formulaEstudo = [String(intMinha), ...bonusEstudo.map(b => String(b.valor))].join(" + ");
    const d20 = await this._rollD20WithMode(formulaEstudo, "teste", "normal", null, null,
      { titulo: `${item.name}: ${nomeTeste}`, tipo: "teste", bonusLinhas: [{ label: "Inteligência", value: `+${intMinha}` }, ...bonusEstudo.map(b => ({ label: b.nome, value: b.rotulo ?? `+${b.valor}` }))], contra: { rotulo: "Resultado", valor: dificuldade - 1, textoVence: "Passaria", textoPerde: "Falharia", ocultarValor: true } });
    const roll = d20.rolls[d20.usedIndex];
    const passou = roll.total >= dificuldade;
    const historico = naurenTextoHistoricoDestino(d20);
    linhas.push({ label: "Teste de Inteligência", value: roll.total, breakdown: `${naurenRollToBreakdownText(roll)}${historico ? ` • rerolado: ${historico}` : ""} contra S.I ${baseSI} + Inteligência do alvo → ${passou ? "sucesso" : "falhou"}` });
    if (!passou) { linhas.push({ label: "Análise", value: `nada aprendido sobre ${alvoTok.document.name}` }); return linhas; }
    // Acúmulos de Analisado por sucesso (Olhar da Morte: 2). Lê o campo da Ação
    // (já com os modificadores de Subclasse) e o modificador do nó, por segurança.
    let quantos = Math.max(1, Math.round(Number(acao?.estudosPorSucesso) || 1));
    for (const fonte of naurenFontesDeModificadores(this.actor)) {
      for (const m of fonte.entradas ?? []) {
        if (!m.itemAlvoUuid || !naurenItemCorrespondeAoAlvo(item, m.itemAlvoUuid)) continue;
        if (!/(^|\.)estudosPorSucesso$|condicoesAplicadas\.0\.acumulos$/.test(String(m.campo ?? ""))) continue;
        const v = Math.round(Number(naurenResolverPorRank(m.valorPorRank, fonte.rank, "valor")) || 0);
        if (v > quantos) quantos = Math.min(v, 5);
      }
    }
    // Tipos antigos (sem "por Analisado", feitos à mão em Efeitos): 1 estudo por sucesso.
    const legado = !entrada.soAcumulo && !entrada.tipo.porAnalisado && !entrada.tipo.criativa;
    const r = await naurenOperarEstudo(alvo, {
      operacao: "somar", dono: { uuid: this.actor.uuid, nome: this.actor.name },
      chave: (entrada.soAcumulo || entrada.tipo.criativa) ? null : entrada.chave, nome: entrada.tipo.nome,
      max: Number(entrada.tipo.maxAcumulos) || 99, contaComoInformacao: entrada.tipo.contaComoInformacao !== false,
      quantos: legado ? 1 : quantos, criativa
    });
    if (!r) { linhas.push({ label: "Análise", value: "não foi possível gravar (o Mestre está conectado?)" }); return linhas; }
    const inf = r.informacoes ?? 0;
    linhas.push({ label: "Analisado", value: `${inf} acúmulo(s) em ${alvoTok.document.name}`, breakdown: `+${legado ? 1 : quantos}${quantos > 1 && !legado ? " (Olhar da Morte)" : ""}` });
    if (entrada.soAcumulo) linhas.push({ label: "Bônus", value: "nenhum novo (todos já desbloqueados)", breakdown: "os bônus que você já tem crescem com o acúmulo" });
    else if (criativa) {
      linhas.push({ label: `Desbloqueou: ${entrada.tipo.nome}`, value: criativa.rotulo, breakdown: criativa.modo === "acima" ? `+${inf} em ${criativa.rotulo} contra ${alvoTok.document.name} (1 por acúmulo) até o fim da cena` : `no seu próximo acerto em ${alvoTok.document.name}: −1 em ${criativa.rotulo} por acúmulo (hoje −${inf}), até o fim da cena ou 2 PdE` });
      if (criativa.modo === "acima") {
        const flagC = { alvoUuid: alvo.uuid, chave: criativa.chave, modo: "acima", campo: criativa.campo };
        const autoC = NAUREN_CAMPOS_ACIMA_AUTOMATICOS.has(criativa.campo);
        const geralC = NAUREN_CAMPOS_ACIMA_GERAIS.has(criativa.campo);
        await this.actor.createEmbeddedDocuments("Item", [{
          name: `Eu estou acima: ${criativa.rotulo} (${alvoTok.document.name})`, type: "condicao", img: "icons/equipment/neck/amulet-carved-stone-eye.webp",
          system: { duracaoModo: "cena", negativa: "nao", acumulativel: true, acumulosMax: 99, acumulos: Math.max(1, inf),
            modificadores: naurenModsAcima(criativa.campo),
            descricao: naurenMontarDescricao({ regra: `Análise Paciente (criativa) sobre ${alvoTok.document.name}: +1 em ${criativa.rotulo} para cada acúmulo de Analisado que você possua sobre ele, até o final da cena. ${geralC ? `Vale de forma geral (${criativa.campo === "espirito" ? "e, com ele, a Mana máxima" : "em qualquer movimento"}).` : `Vale só contra ${alvoTok.document.name}.`}`, automatico: geralC ? `+1 em ${criativa.rotulo} por acúmulo, em geral${criativa.campo === "espirito" ? " (a Mana máxima acompanha o Espírito)" : ""}; os acúmulos acompanham os seus acúmulos de Analisado nesse alvo; sai no fim do combate.` : autoC ? `entra sozinho nas jogadas entre você e ${alvoTok.document.name} (${["defesa", "esquiva", "bloqueio", "reducaoDano"].includes(criativa.campo) ? "quando ele ataca você" : criativa.campo === "limiarDeflexao" ? "nos contra-ataques entre vocês" : "quando você ataca ele"}); os acúmulos acompanham os seus acúmulos de Analisado nesse alvo; sai no fim do combate.` : "os acúmulos acompanham os seus acúmulos de Analisado nesse alvo; sai no fim do combate.", manual: (autoC || geralC) ? "" : `"${criativa.rotulo}" contra ${alvoTok.document.name} não tem conta automática: aplique +${Math.max(1, inf)} nas situações contra ele.` }) },
          flags: { nauren: { analiseCriativa: flagC } }
        }]).catch(err => console.warn("Nauren RPG | Eu estou acima", err));
      }
    } else if (legado) {
      const acumulos = r.tipos?.[entrada.chave]?.acumulos ?? 1;
      linhas.push({ label: `Estudou: ${entrada.tipo.nome}`, value: `${acumulos}/${Number(entrada.tipo.maxAcumulos) || 99}`, breakdown: resumo(entrada) });
    } else {
      linhas.push({ label: `Desbloqueou: ${entrada.tipo.nome}`, value: resumo(entrada, inf), breakdown: "até o fim da cena; cresce com cada acúmulo de Analisado" });
    }
    await naurenSincronizarCriativasDoLadino(this.actor, alvo.uuid, inf);
    return linhas;
  }

  /**
   * Falsificar Seu Destino: pega uma habilidade de um aliado (1 no nível 10,
   * 2 no 15, 3 no 17, 4 no 20). A cópia tem 1 uso por dia.
   */
  async _emprestarHabilidade(item) {
    const nivel = this.actor.system.nivel ?? 1;
    const limite = nivel >= 20 ? 4 : nivel >= 17 ? 3 : nivel >= 15 ? 2 : nivel >= 10 ? 1 : 0;
    const emprestadas = this.actor.items.filter(i => i.getFlag("nauren", "emprestadaDe"));
    if (emprestadas.length >= limite) { ui.notifications.warn(`Falsificar Seu Destino: você já tem ${emprestadas.length} de ${limite} habilidades emprestadas. Apague uma para pegar outra.`); return [{ label: "Emprestar", value: "limite atingido" }]; }
    const meuTok = this.actor.getActiveTokens?.(true)?.[0];
    const opcoes = [];
    for (const t of canvas?.tokens?.placeables ?? []) {
      const a = t.actor;
      if (!a || a === this.actor || a.type !== "personagem" || t.document.disposition !== meuTok?.document?.disposition) continue;
      // Só Habilidades que a CLASSE do aliado concede até o nível 3 (livro: "até nível 3 dela").
      const classeA = a.items.find(i => i.type === "classe");
      if (!classeA) continue;
      const minhaClasse = this.actor.items.find(i => i.type === "classe");
      if (minhaClasse && minhaClasse.name === classeA.name) continue; // "de outra Classe"
      for (const h of a.items.filter(i => i.type === "habilidade" && !this.actor.items.some(m => m.name === i.name || m.name === `${i.name} (falsificada)`))) {
        const origem = naurenNivelDeOrigemNaClasse(classeA, h);
        if (!origem || origem.nivel > 3) continue;
        opcoes.push({ action: `${a.id}|${h.id}`, label: `${h.name} (${classeA.name} nv ${origem.nivel}, de ${a.name})`, ator: a, hab: h, origem, classeNome: classeA.name });
      }
    }
    if (!opcoes.length) { ui.notifications.warn("Falsificar Seu Destino: nenhum aliado na cena com habilidade de nível 1 a 3 da classe dele que você não tenha."); return [{ label: "Emprestar", value: "nada disponível" }]; }
    const escolha = await foundry.applications.api.DialogV2.wait({
      window: { title: `${item.name} (${emprestadas.length}/${limite})` },
      content: "<p>Qual habilidade de um aliado você falsifica? Aparecem só as que a classe dele concede até o nível 3. A cópia fica na sua ficha com 1 uso por dia e para sempre no nível de origem (não sobe com o seu nível).</p>",
      buttons: [...opcoes.slice(0, 30).map(o => ({ action: o.action, label: o.label })), { action: "cancelar", label: "Cancelar" }],
      rejectClose: false
    }).catch(() => "cancelar");
    const o = opcoes.find(x => x.action === escolha);
    if (!o) return [{ label: "Emprestar", value: "cancelado" }];
    const dados = o.hab.toObject();
    delete dados._id;
    dados.flags = { ...(dados.flags ?? {}), nauren: { ...(dados.flags?.nauren ?? {}), emprestadaDe: o.ator.name, nivelFixo: o.origem.nivel, classeDeOrigem: o.classeNome } };
    dados.name = `${o.hab.name} (falsificada)`;
    Object.assign(dados.system, { usaUsosPassiva: true, usosPassivaAtual: 1, usosPassivaMax: 1, usosPassivaReset: "dia" });
    // Sempre no nível de origem: rank que a classe dá até esse nível, e toda tabela "por nível" / @nivel congelada nele.
    naurenCongelarNoNivel(dados.system, o.origem.nivel);
    dados.system.rankAtual = o.origem.rank;
    for (const k of ["historicoUpgrades", "historicoConcessoes"]) if (k in dados.system) dados.system[k] = [];
    // Livro 0.8: o Espírito Ardiloso pode pagar Mana, Espírito da Batalha ou Energia das habilidades falsificadas.
    const extrasLinha = [];
    const temArdiloso = (this.actor.system.recursosCustom ?? []).some(x => x.id === "espiritoardiloso");
    const convertiveis = /^recursoCustom:(energia|espiritodabatalha)$/;
    const acoesD = dados.system.acoes ?? [];
    const temCustoConv = acoesD.some(a => (Number(a.custoMana) || 0) > 0 || (a.custosRecursoProprio ?? []).some(c => c.ativo !== false && convertiveis.test(c.recurso ?? "")));
    if (temArdiloso && temCustoConv) {
      const converter = await foundry.applications.api.DialogV2.confirm({ window: { title: "Falsificar Seu Destino" },
        content: `<p><b>${o.hab.name}</b> custa Mana, Espírito da Batalha ou Energia. Pagar esses custos com <b>Espírito Ardiloso</b>?</p>`,
        yes: { label: "Pagar com Espírito Ardiloso" }, no: { label: "Manter os custos" }, rejectClose: false }).catch(() => false);
      if (converter) {
        for (const a of acoesD) {
          const novos = [];
          for (const c of a.custosRecursoProprio ?? []) {
            if (c.ativo !== false && convertiveis.test(c.recurso ?? "")) novos.push({ ...c, recurso: "recursoCustom:espiritoardiloso" });
            else novos.push(c);
          }
          if ((Number(a.custoMana) || 0) > 0) { novos.push({ recurso: "recursoCustom:espiritoardiloso", quantidade: String(a.custoMana), ativo: true }); a.custoMana = 0; }
          a.custosRecursoProprio = novos;
        }
        extrasLinha.push("custos de Mana/Espírito da Batalha/Energia pagos com Espírito Ardiloso");
      }
    }
    await this.actor.createEmbeddedDocuments("Item", [dados]);
    return [{ label: "Falsificou", value: o.hab.name, breakdown: [`de ${o.ator.name}`, `${o.classeNome} nível ${o.origem.nivel} (fixo${o.origem.rank > 1 ? `, rank ${o.origem.rank}` : ""})`, "1 uso por dia", `${emprestadas.length + 1}/${limite}`, ...extrasLinha].join(" • ") }];
  }

  /** Cria uma entidade de campo como TOKEN no mapa (Fase 6 - O). */
  /** Fase 5 (M10): invoca fichas em volta de quem usou e as põe na iniciativa. */
  async _invocarFichas(item, acao) {
    const meuToken = canvas?.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
    if (!meuToken) { ui.notifications.warn("Invocação: coloque o token de quem invoca no mapa."); return; }
    if (!acao.invocarCopiaDeMim && !acao.invocarAtorUuid) { ui.notifications.warn(`"${acao.nome || item.name}": escolha a ficha a invocar.`); return; }
    const num = txt => Math.max(0, Math.round(Number(naurenInterpretarModificador(String(txt || "0").replace(/@rank\b/gi, String(this._rankEfetivo(item))), this.actor, item)?.valor) || 0));
    const quantidade = Math.max(1, num(acao.invocarQuantidade || "1"));
    const metros = Math.max(1, num(acao.invocarDistancia || "2"));
    const dist = canvas.scene?.grid?.distance || 1;
    const dados = { tokenUuid: meuToken.document.uuid, atorUuid: acao.invocarAtorUuid, copiaDeMim: !!acao.invocarCopiaDeMim, dividirVida: !!acao.invocarDividirVida,
      quantidade, raioCasas: Math.max(1, Math.round(metros / dist)), naIniciativa: acao.invocarNaIniciativa !== false, fonte: acao.nome || item.name };
    if (game.user.isGM) return naurenCriarInvocacoes(dados);
    const gm = game.users.activeGM;
    if (!gm) { ui.notifications.warn("Invocação: precisa de um Mestre conectado."); return; }
    return gm.query(NAUREN_QUERY_ITEM_MESTRE, { tipo: "invocar", dados }, { timeout: 20000 }).catch(() => null);
  }

  async _criarEntidadeDeCampo({ item, acao, regiao, atingidos = [] }) {
    const rank = this._rankEfetivo(item);
    const resolver = texto => String(texto ?? "").trim()
      .replace(/^item:(.+)$/, (m, ref) => this._formulaDeOutroItem(ref) || "0")
      .replace(/@rank\b/gi, String(rank))
      .replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, this.actor)));
    const numero = texto => {
      const t = resolver(texto);
      if (!t) return 0;
      const v = naurenAvaliarExpressaoSimples(t);
      return Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0;
    };
    const meuToken = canvas?.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
    const shape = regiao?.shapes?.[0];
    const cargas = numero(acao.entidadeCargas);
    const vida = numero(acao.entidadeVida);
    const cond = acao.entidadeInteracaoCondicaoUuid ? await fromUuid(acao.entidadeInteracaoCondicaoUuid).catch(() => null) : null;
    const tamanhoBase = Math.max(1, numero(acao.entidadeTamanho) || 1);
    let largura = Math.max(1, numero(acao.entidadeLargura) || tamanhoBase);
    let altura = Math.max(1, numero(acao.entidadeAltura) || tamanhoBase);
    const nome = acao.entidadeNome || item.name;
    // Posição: centro da área criada pela Ação; senão, o jogador escolhe no
    // mapa (Esc = casa ao lado de quem usou).
    const casa = canvas?.grid?.size ?? 100;
    let posicao = shape ? { x: shape.x, y: shape.y } : null;
    // Fase 5 (M13): a entidade segura as Condições desta Ação (Rede, Amarra) - só nos alvos que de fato as receberam.
    let segura = null;
    if (acao.entidadeSeguraCondicoes) {
      const nomes = (acao.condicoesAplicadas ?? []).filter(c => c?.uuid && c.ativo !== false).map(c => { try { return fromUuidSync(c.uuid)?.name; } catch (err) { return null; } }).filter(Boolean);
      const meuDoc = meuToken?.document ?? null;
      const presos = atingidos.filter(t => t?.actor && naurenCondicoesAtivas(t.actor).some(c => nomes.includes(c.name) && (!meuDoc || naurenUuidEhEsteToken(c.system.conjuradorUuid, meuDoc, this.actor))));
      if (!nomes.length || !presos.length) return; // errou ou ninguém ficou preso: não há o que segurar
      segura = { nomes, alvos: presos.map(t => t.uuid), conjuradorTokenUuid: meuDoc?.uuid ?? "" };
      // Colada no alvo: na casa à direita do primeiro preso (fica fácil de clicar e atacar).
      if (acao.entidadeNoAlvo && !posicao) {
        const t = presos[0];
        posicao = { x: t.x + (t.width ?? 1) * casa + largura * casa / 2, y: t.y + (t.height ?? 1) * casa / 2 };
      }
    } else if (acao.entidadeNoAlvo && !posicao && atingidos[0]) {
      const t = atingidos[0];
      posicao = { x: t.x + (t.width ?? 1) * casa + largura * casa / 2, y: t.y + (t.height ?? 1) * casa / 2 };
    }
    if (!posicao) {
      const alcance = parseFloat(String(acao.alcance ?? "").replace(",", ".")) || 0;
      const escolha = await naurenEscolherPontoNoMapa({ nome, largura, altura, origem: meuToken?.center ?? null, alcanceMetros: alcance });
      if (escolha) { posicao = { x: escolha.x, y: escolha.y }; largura = escolha.largura; altura = escolha.altura; }
      else if (meuToken?.center) posicao = { x: meuToken.center.x + casa, y: meuToken.center.y };
    }
    if (!posicao) { ui.notifications.warn("Entidade de campo: coloque o token do personagem no mapa."); return; }
    const estado = {
      nome,
      imagem: acao.entidadeImagem || item.img,
      donoUuid: this.actor.uuid,
      donoNome: this.actor.name,
      donoDisposicao: meuToken?.document?.disposition ?? 1,
      cargas, cargasMax: cargas,
      vida, vidaMax: vida,
      custo: numero(acao.entidadeInteracaoCusto),
      cura: resolver(acao.entidadeInteracaoCura),
      condUuid: acao.entidadeInteracaoCondicaoUuid || "",
      condNome: cond?.name ?? "",
      esgotarCura: resolver(acao.entidadeAoEsgotarCura),
      esgotarRaio: numero(acao.entidadeAoEsgotarRaio),
      largura, altura,
      bloqueia: !!acao.entidadeBloqueia,
      maximo: numero(acao.entidadeMaximo),
      chave: `${this.actor.uuid}|${item.id}|${nome}`,
      posicao,
      regiaoUuid: regiao?.uuid ?? "",
      cenaId: canvas.scene?.id ?? "",
      segura,
      ativa: true
    };
    await naurenOperarEntidade("criar", { estado });
  }

  #buffsEscolhidosAtual = null;

  /**
   * 0.94.3 (G8): mais de uma Ação na mesma Prioridade. Condição com "acoesExtrasNaPrioridade" (automático)
   * ou Habilidade com regrasExtras.acaoExtraNaPrioridade (pergunta e gasta 1 uso; ex.: Potência Elétrica,
   * só com a arma de projeto equipada). A Prioridade consumida volta ao registro para a próxima Ação.
   */
  async _naurenAcoesExtrasNaPrioridade(consumida, item, acao) {
    // A Prioridade devolvida (2ª Ação) não pergunta de novo.
    if (/\((2ª Ação|Ação extra)\)$/.test(String(consumida.item ?? consumida.motivo ?? ""))) return;
    const devolver = async motivo => naurenOperarRegistroPrioridade("registrar", { entradas: [{ deUuid: consumida.deUuid ?? "", deNome: consumida.deNome ?? "", paraUuid: this.actor.uuid, paraNome: this.actor.name, indicador: "PI", motivo, item: motivo }] });
    const cond = this.actor.items.find(i => i.type === "condicao" && i.system.ativo !== false && (i.system.acoesExtrasNaPrioridade ?? 0) > 0);
    if (cond) {
      const n = cond.system.acoesExtrasNaPrioridade;
      await devolver(`${cond.name} (Ação extra)`);
      if (n > 1) await cond.update({ "system.acoesExtrasNaPrioridade": n - 1 }); else await cond.delete();
      this.#beneficiosAtual.push({ label: cond.name, value: "mais 1 Ação nesta Prioridade", breakdown: n > 1 ? `restam ${n - 1}` : "" });
      return;
    }
    for (const { item: h, regra } of naurenRegrasExtras(this.actor, "acaoExtraNaPrioridade")) {
      if (h.system.usaUsosPassiva && (h.system.usosPassivaAtual ?? 0) <= 0) continue;
      if (regra.exigeProjetoEquipado && !naurenItensDoProjetoPorNome(this.actor, regra.exigeProjetoEquipado).some(i => i.system.equipado)) continue;
      const resta = h.system.usaUsosPassiva ? (h.system.usosPassivaAtual ?? 0) : null;
      const sim = await foundry.applications.api.DialogV2.confirm({ window: { title: h.name },
        content: `<p><b>${h.name}</b>: fazer <b>2 Ações</b> nesta Prioridade${resta !== null ? ` (gasta 1 uso, você tem ${resta})` : ""}?</p><p>Esta Ação (${acao?.nome || item.name}) é a 1ª; a 2ª fica guardada para logo depois.</p>`,
        yes: { label: "Sim, 2 Ações" }, no: { label: "Não" }, rejectClose: false }).catch(() => false);
      if (!sim) continue;
      if (resta !== null) await h.update({ "system.usosPassivaAtual": resta - 1 });
      await devolver(`${h.name} (2ª Ação)`);
      this.#beneficiosAtual.push({ label: h.name, value: "2 Ações nesta Prioridade", breakdown: resta !== null ? `usos ${resta} → ${resta - 1}` : "" });
      return;
    }
  }

  /** Tipo do ataque: básico (ataque comum da arma), pesado ou especial (ataque de habilidade/magia). */
  _tipoDoAtaque(item, acao) {
    return item?.type === "arma"
      ? (/pesad/i.test(acao?.nome ?? "") ? "pesado" : "basico")
      : (/pesad/i.test(acao?._nomeAtaqueDaArma ?? "") ? "pesado" : "especial");
  }

  /** Condições de "próxima ação" que valem para esta Ação (filtros do buff). */
  _buffsProximaAcaoCandidatos(item, acao) {
    const tipoAt = this._tipoDoAtaque(item, acao);
    const tipoBate = t => !t || t === "qualquer" || t === tipoAt || (t === "pesadoOuEspecial" && (tipoAt === "pesado" || tipoAt === "especial"));
    return this.actor.items.filter(c => c.type === "condicao" && c.system.ativo !== false && c.system.usaProximaAcao
      && (!c.system.proximaAcaoTipoItem || c.system.proximaAcaoTipoItem === item.type)
      && (!c.system.proximaAcaoApenasAtaque || acao.ehAtaque)
      && (!c.system.proximaAcaoSoComDano || (acao.danos ?? []).some(d => d?.formula))
      && (!c.system.proximaAcaoTipoAtaque || (acao.ehAtaque && tipoBate(c.system.proximaAcaoTipoAtaque)))
      && (!c.system.proximaAcaoSoContraAlvoGravado || (!!c.getFlag("nauren", "alvoUuidGravado") && (game.user.targets?.size ?? 0) === 1 && Array.from(game.user.targets)[0]?.actor?.uuid === c.getFlag("nauren", "alvoUuidGravado")))
      && (!c.system.proximaAcaoItemNomeContem || String(c.system.proximaAcaoItemNomeContem).split(",").map(x => x.trim().toLowerCase()).filter(Boolean).some(n => String(item?.name ?? "").toLowerCase().includes(n)))
      && (!c.system.proximaAcaoSoProjeto || naurenItemEhDoProjeto(item, c.system.proximaAcaoSoProjeto))
      && (!c.system.proximaAcaoNomeContem || String(acao.nome ?? "").toLowerCase().includes(c.system.proximaAcaoNomeContem.toLowerCase())));
  }

  /** O que um buff de próxima ação aplica, em texto (popup e card). */
  _resumoBuffProximaAcao(c, acao) {
    const sys = c.system;
    const pedaco = campo => String(sys[campo] ?? "").replace(/@rank\b/gi, String(sys.rankAtual ?? 0)).trim()
      .replace(/(\d*)d\(([^()]+)\)/g, (m, n, e) => { const v = Math.round(naurenAvaliarExpressaoSimples(e)); return Number.isFinite(v) && v > 0 ? `${n}d${v}` : m; })
      .replace(/\(([\d+\-* ]+)\)d(\d+)/g, (m, e, f) => { const v = Math.round(naurenAvaliarExpressaoSimples(e)); return Number.isFinite(v) && v > 0 ? `${v}d${f}` : m; });
    const lista = [];
    if (sys.proximaAcaoSemCusto) lista.push("sem custo");
    else if (pedaco("proximaAcaoReducaoEstamina")) lista.push(`−${pedaco("proximaAcaoReducaoEstamina")} Estamina`);
      if (!sys.proximaAcaoSemCusto && pedaco("proximaAcaoReducaoMana")) lista.push(`−${pedaco("proximaAcaoReducaoMana")} Mana${Number(sys.proximaAcaoReducaoManaMinimo) ? ` (mínimo ${sys.proximaAcaoReducaoManaMinimo})` : ""}`);
    if (pedaco("proximaAcaoBonusAcerto") && acao?.ehAtaque !== false) lista.push(`${pedaco("proximaAcaoBonusAcerto")} no acerto`);
    if (pedaco("proximaAcaoBonusDano")) {
      // Acumulável: mostra o total (ex.: Técnica Sinistra ×3 = +3 de dano).
      const acumBuff = c.system.acumulativel ? Math.max(1, c.system.acumulos ?? 1) : 1;
      const valorBase = Number(pedaco("proximaAcaoBonusDano"));
      lista.push(acumBuff > 1 && Number.isFinite(valorBase) ? `+${valorBase * acumBuff} de dano (${acumBuff} × ${valorBase})` : `${pedaco("proximaAcaoBonusDano")} de dano`);
    }
    if (sys.proximaAcaoFacilidade) lista.push("Facilidade");
    if (sys.proximaAcaoDanoMaximo) lista.push("dano máximo");
    if (sys.proximaAcaoSemPrioridade) lista.push("não gera Prioridade");
    for (const m of sys.modificadores ?? []) if (m.campo && m.valor) lista.push(naurenTextoModificador(m.campo, m.valor) || `${m.campo} ${m.valor}`);
    return lista;
  }

  /** Ativa os buffs escolhidos para esta Ação (ajusta custos na cópia e guarda o resto). */
  async _ativarBuffsProximaAcao(acao, buffs) {
    this.#proximaAcaoAtual = null;
    if (!buffs?.length) return acao;
    const efeitos = [];
    const bonusAcerto = [];
    const bonusDanoVerdadeiro = [];
    const bonusDano = [];
    let informacoesDe = null;
    for (const c of buffs) {
      const sys = c.system;
      // "1d(4+2*@rank)" vira "1d10": o jogador vê o dado de verdade na janela e no card.
      const pedaco = campo => String(sys[campo] ?? "").replace(/@rank\b/gi, String(sys.rankAtual ?? 0)).trim()
        .replace(/(\d*)d\(([^()]+)\)/g, (m, n, e) => { const v = Math.round(naurenAvaliarExpressaoSimples(e)); return Number.isFinite(v) && v > 0 ? `${n}d${v}` : m; })
        .replace(/\(([\d+\-* ]+)\)d(\d+)/g, (m, e, f) => { const v = Math.round(naurenAvaliarExpressaoSimples(e)); return Number.isFinite(v) && v > 0 ? `${v}d${f}` : m; });
      if (sys.proximaAcaoSemCusto) acao = naurenAcaoSemCustoEstaminaMana(acao);
      const reducao = pedaco("proximaAcaoReducaoEstamina");
      if (reducao && !sys.proximaAcaoSemCusto) {
        const r = Math.max(0, Math.round(naurenAvaliarExpressaoSimples(reducao) || Number(reducao) || 0));
        if (r) acao = { ...acao, custoEstamina: Math.max(0, (acao.custoEstamina ?? 0) - r) };
      }
      const reducaoMana = pedaco("proximaAcaoReducaoMana");
      if (reducaoMana && !sys.proximaAcaoSemCusto && (acao.custoMana ?? 0) > 0) {
        const r = Math.max(0, Math.round(naurenAvaliarExpressaoSimples(reducaoMana) || Number(reducaoMana) || 0));
        const minimo = Math.min(acao.custoMana ?? 0, Number(sys.proximaAcaoReducaoManaMinimo) || 0);
        if (r) acao = { ...acao, custoMana: Math.max(minimo, (acao.custoMana ?? 0) - r) };
      }
      if (pedaco("proximaAcaoBonusAcerto") && acao.ehAtaque) bonusAcerto.push(pedaco("proximaAcaoBonusAcerto"));
      const acumulosBuff = sys.acumulativel ? Math.max(1, sys.acumulos ?? 1) : 1;
      let vaiParaAcerto = false;
      if (sys.proximaAcaoEscolherAcertoOuDano && acao.ehAtaque && pedaco("proximaAcaoBonusDano")) {
        const escPL = await foundry.applications.api.DialogV2.wait({ window: { title: c.name }, content: `<p>${c.name}: usar <b>+${pedaco("proximaAcaoBonusDano")}</b> no acerto ou no dano?</p>`,
          buttons: [{ action: "acerto", label: "No acerto" }, { action: "dano", label: "No dano" }], rejectClose: false }).catch(() => "dano");
        vaiParaAcerto = escPL === "acerto";
      }
      if (vaiParaAcerto) bonusAcerto.push(pedaco("proximaAcaoBonusDano"));
      // "3" em vez de "(1)*3" quando o bônus é um número (o card mostrava "1d6 + 4 + 1 * 3").
      const vezesBuff = p => acumulosBuff > 1 ? (Number.isFinite(Number(p)) ? String(Number(p) * acumulosBuff) : `(${p})*${acumulosBuff}`) : p;
      if (vaiParaAcerto) { /* já foi para o acerto */ }
      else if (pedaco("proximaAcaoBonusDano") && sys.proximaAcaoDanoVerdadeiro) bonusDanoVerdadeiro.push(vezesBuff(pedaco("proximaAcaoBonusDano")));
      else if (pedaco("proximaAcaoBonusDano")) bonusDano.push(vezesBuff(pedaco("proximaAcaoBonusDano")));
      if (sys.proximaAcaoInformacoesDoConjurador && acao.ehAtaque && sys.conjuradorUuid) {
        let conj = null;
        try { const d = fromUuidSync(sys.conjuradorUuid); conj = d?.actor ?? d; } catch (err) { conj = null; }
        if (conj) informacoesDe = { uuid: conj.uuid, nome: conj.name };
      }
      efeitos.push({ item: c, lista: this._resumoBuffProximaAcao(c, acao) });
    }
    this.#proximaAcaoAtual = {
      efeitos,
      facilidade: buffs.some(c => c.system.proximaAcaoFacilidade),
      danoMaximo: buffs.some(c => c.system.proximaAcaoDanoMaximo),
      semPrioridade: buffs.some(c => c.system.proximaAcaoSemPrioridade),
      bonusAcerto: bonusAcerto.join(" + "),
      bonusDano: bonusDano.join(" + "),
      bonusDanoVerdadeiro: bonusDanoVerdadeiro.join(" + "),
      informacoesDe
    };
    return acao;
  }

  /** Estado do buff ativo (para fluxos fora de _executarAcao, ex.: contra-ataque). */
  _proximaAcaoInfo() { return this.#proximaAcaoAtual; }
  _limparProximaAcao() { this.#proximaAcaoAtual = null; }

  /** Consome os buffs ativos e devolve as linhas de auditoria do card. */
  async _consumirBuffsProximaAcao() {
    const linhas = [];
    for (const e of this.#proximaAcaoAtual?.efeitos ?? []) {
      // Zerar um recurso ao gastar o buff (ex.: Adrenalina volta a 0).
      if (e.item.system.proximaAcaoZerarRecurso) {
        const lista = foundry.utils.deepClone(this.actor.system.recursosCustom ?? []);
        const r = lista.find(x => x.id === e.item.system.proximaAcaoZerarRecurso);
        if (r) { r.valor = 0; await this.actor.update({ "system.recursosCustom": lista }); }
      }
      // Ataque Combinado: a Prioridade deste ataque vai para um aliado.
      if (e.item.system.proximaAcaoPrioridadeParaAliado) {
        const tokEu = this.actor.getActiveTokens?.(true)?.[0];
        const aliados = (canvas?.tokens?.placeables ?? []).filter(t => t.actor && t !== tokEu && t.document.disposition === tokEu?.document?.disposition);
        if (aliados.length) {
          const esc = await foundry.applications.api.DialogV2.wait({ window: { title: e.item.name }, content: "<p>Qual aliado recebe a Prioridade deste ataque?</p>",
            buttons: aliados.map(t => ({ action: t.id, label: t.document.name })), rejectClose: false }).catch(() => null);
          const tokA = aliados.find(t => t.id === esc);
          if (tokA) {
            await naurenOperarRegistroPrioridade("registrar", { entradas: [{ deUuid: this.actor.uuid, deNome: this.actor.name, paraUuid: tokA.actor.uuid, paraNome: tokA.document.name, indicador: "PA", motivo: e.item.name, item: e.item.name }] });
            linhas.push({ label: "Ataque Combinado", value: `Prioridade para ${tokA.document.name}` });
          }
        }
      }
      const consumir = e.item.system.proximaAcaoConsumir ?? 1;
      const antes = e.item.system.acumulativel ? Math.max(1, e.item.system.acumulos ?? 1) : 1;
      const depois = Math.max(0, antes - consumir);
      const listaE = [...e.lista];
      if (e.item.system.proximaAcaoInformacoesDoConjurador && this.#proximaAcaoAtual?.informacoesTexto) listaE.push(this.#proximaAcaoAtual.informacoesTexto);
      linhas.push({ label: `Consumiu ${e.item.name}`, value: listaE.join(", ") || "aplicado", breakdown: consumir ? (depois > 0 ? `acúmulos ${antes} → ${depois}` : "encerrada") : "" });
      if (consumir) {
        if (depois <= 0) await e.item.delete().catch(() => {});
        else await e.item.update({ "system.acumulos": depois }).catch(() => {});
      }
    }
    return linhas;
  }

  /** Card provisório enquanto os alvos reagem; vira o card final depois. */
  async _criarAvisoAguardando(item) {
    if (this.#mensagemAguardando) return;
    const alvos = Array.from(game.user.targets ?? []);
    if (!alvos.length) return;
    const tempo = naurenTempoReacao();
    this.#mensagemAguardando = await naurenPostarCard({
      ator: this.actor, titulo: item.name, icone: item.img, fonte: "Aguardando reação",
      linhas: [{ label: "⏳ Aguardando", value: alvos.map(t => naurenNomeDeToken(t)).join(", "), breakdown: tempo ? `até ${tempo}s` : "" }]
    }).catch(() => null);
  }
  async _removerAvisoAguardando() {
    const msg = this.#mensagemAguardando;
    this.#mensagemAguardando = null;
    if (msg) await msg.delete().catch(() => {});
  }
  #snapshotCustoAtual = null;
  /** A Ação foi cancelada depois de pagar (área cancelada/fora de alcance/vazia): devolve o que foi gasto. */
  async _devolverCustosDaAcao(item, acao, rotulo = "Área cancelada") {
    const f = this.#snapshotCustoAtual;
    this.#snapshotCustoAtual = null;
    if (!f) return;
    const upd = {};
    if (Number.isFinite(f.est)) upd["system.estaminaCombate.value"] = f.est;
    if (Number.isFinite(f.mana)) upd["system.mana.value"] = f.mana;
    if (Number.isFinite(f.stress)) upd["system.stress.value"] = f.stress;
    upd["system.recursosCustom"] = f.recursos;
    await this.actor.update(upd, { naurenDevolucao: true }).catch(err => console.warn("Nauren RPG | devolver custos", err));
    for (const x of f.itens) {
      const doc = this.actor.items.get(x.i.id);
      if (doc) await doc.update({ "system.acoes": x.acoes, ...(x.usosAtual !== undefined ? { "system.usosAtual": x.usosAtual } : {}), ...(x.usosPassivaAtual !== undefined ? { "system.usosPassivaAtual": x.usosPassivaAtual } : {}) }).catch(() => {});
    }
    if (f.consumivel?.doc && this.actor.items.get(f.consumivel.doc.id)) await f.consumivel.doc.update({ "system.quantidade": f.consumivel.qtd }).catch(() => {});
    naurenPostarCard({ ator: this.actor, titulo: acao.nome || item.name, icone: item.img, fonte: "Cancelada",
      linhas: [{ label: rotulo, value: "nada foi gasto", breakdown: "Estamina, Mana, recursos e usos voltaram" }] }).catch(() => {});
  }
  #naoDarDanoAlvoAtual = false;
  #naoDarDanoAliadosAtual = false;
  #condicoesAdhocUuidsAtual = [];
  // Troca de Atributo de Ataque (ver Condição > trocaAtributoAtaqueOpcional,
  // ex: Profusão Retraída, Empíreo) - escolhida no popup de pré-Ação, vale
  // só nesta rolagem de ataque. "" = usa o atributoAtaque normal da Ação.
  #atributoAtaqueSubstitutoAtual = "";
  // Bônus de Teste em Área (ver NaurenHabilidadeData > concedeBonusTesteArea,
  // ex: Presença, Empíreo) - null (padrão) ou {itemUuid, dado} se o
  // jogador marcou o checkbox no popup de pré-Ação. Consumido na hora
  // de montar o teste de ataque (soma o dado, marca a flag "já usei
  // este turno" no ator).
  #bonusAreaAtaqueEscolhidoAtual = null;
  // Caixa "Consultar Fórmulas" (aba Opções) - vem fechada por padrão.
  #referenciaFormulasAberta = false;
  // IDs dos itens (de qualquer lista - Habilidades, Armas, Efeitos etc.)
  // com a descrição expandida DIRETO na linha (fora de #recursosEditando
  // porque é uma lista de IDs de ITEM, não de recurso).
  #itensDescricaoExpandida = new Set();
  // Estado (só de UI, não salvo) da seção "Escala por Nível" na aba
  // Opções - mesmo padrão de #referenciaFormulasAberta (fechada por
  // padrão a cada vez que a ficha é reaberta), mais um Set separado
  // pra saber quais atributos (dentro da seção) estão com a própria
  // tabelinha expandida, já que pode ter mais de um atributo na lista.
  #escalaPorNivelAberta = false;
  #escalaAtributosExpandidos = new Set();

  static DEFAULT_OPTIONS = {
    classes: ["nauren-rpg", "sheet", "actor"],
    position: { width: 620, height: 700 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      rollAttribute: NaurenActorSheet.onRollAttribute,
      itemCreate: NaurenActorSheet.onItemCreate,
      itemEdit: NaurenActorSheet.onItemEdit,
      itemDuplicate: NaurenActorSheet.onItemDuplicate,
      itemDelete: NaurenActorSheet.onItemDelete,
      itemUse: NaurenActorSheet.onItemUse,
      estudoAjustar: NaurenActorSheet.onEstudoAjustar,
      estudoInformacoes: NaurenActorSheet.onEstudoInformacoes,
      estudoRemover: NaurenActorSheet.onEstudoRemover,
      estudoRemoverCriativa: NaurenActorSheet.onEstudoRemoverCriativa,
      roubarD20: NaurenActorSheet.onRoubarD20,
      grimorioVirar: NaurenActorSheet.onGrimorioVirar,
      marcaBeneficio: NaurenActorSheet.onMarcaBeneficio,
      marcaRemover: NaurenActorSheet.onMarcaRemover,
      grimorioMover: NaurenActorSheet.onGrimorioMover,
      grimorioMeditar: NaurenActorSheet.onGrimorioMeditar,
      grimorioMarcar: NaurenActorSheet.onGrimorioMarcar,
      grimorioAspectus: NaurenActorSheet.onGrimorioAspectus,
      grimorioQueimar: NaurenActorSheet.onGrimorioQueimar,
      itemToggleAtivo: NaurenActorSheet.onItemToggleAtivo,
      itemRollEfeito: NaurenActorSheet.onItemRollEfeito,
      itemToggleDescricao: NaurenActorSheet.onItemToggleDescricao,
      itemPostarDescricaoNoChat: NaurenActorSheet.onItemPostarDescricaoNoChat,
      itemEquip: NaurenActorSheet.onItemEquip,
      estressePermanente: NaurenActorSheet.onEstressePermanente,
      invUsar: NaurenActorSheet.onInvUsar,
      invBancada: NaurenActorSheet.onInvBancada,
      invEquipar: NaurenActorSheet.onInvEquipar,
      itemTogglePaginaAberta: NaurenActorSheet.onItemTogglePaginaAberta,
      chargeMinus: NaurenActorSheet.onChargeMinus,
      chargePlus: NaurenActorSheet.onChargePlus,
      qtyMinus: NaurenActorSheet.onQtyMinus,
      qtyPlus: NaurenActorSheet.onQtyPlus,
      condAjustar: NaurenActorSheet.onCondAjustar,
      descansar: NaurenActorSheet.onDescansar,
      ressincronizarRecursosCustom: NaurenActorSheet.onRessincronizarRecursosCustom,
      subirNivel: NaurenActorSheet.onSubirNivel,
      toggleEscalaPorNivel: NaurenActorSheet.onToggleEscalaPorNivel,
      toggleUsaEscalaPorNivel: NaurenActorSheet.onToggleUsaEscalaPorNivel,
      toggleUsaModoMira: NaurenActorSheet.onToggleUsaModoMira,
      addEscalaAtributo: NaurenActorSheet.onAddEscalaAtributo,
      removeEscalaAtributo: NaurenActorSheet.onRemoveEscalaAtributo,
      toggleEscalaAtributoExpandido: NaurenActorSheet.onToggleEscalaAtributoExpandido,
      addEscalaAtributoLinha: NaurenActorSheet.onAddEscalaAtributoLinha,
      removeEscalaAtributoLinha: NaurenActorSheet.onRemoveEscalaAtributoLinha,
      toggleModoFicha: NaurenActorSheet.onToggleModoFicha,
      reabrirCriador: NaurenActorSheet.onReabrirCriador,
      abrirBarrasToken: NaurenActorSheet.onAbrirBarrasToken,
      abrirRecursosHud: NaurenActorSheet.onAbrirRecursosHud,
      abrirCriadorMonstro: NaurenActorSheet.onAbrirCriadorMonstro,
      configurarBarra: NaurenActorSheet.onConfigurarBarra,
      removerRecursoCustom: NaurenActorSheet.onRemoverRecursoCustom,
      alternarTravaRecursoCustom: NaurenActorSheet.onAlternarTravaRecursoCustom,
      abrirMascote: NaurenActorSheet.onAbrirMascote,
      alternarImagemModo: NaurenActorSheet.onAlternarImagemModo,
      sincronizarFichaOriginal: NaurenActorSheet.onSincronizarFichaOriginal,
      editarImagemAtual: NaurenActorSheet.onEditarImagemAtual,
      enquadrarRetrato: NaurenActorSheet.onEnquadrarRetrato,
      bordaToken: NaurenActorSheet.onBordaToken,
      desvincularMascote: NaurenActorSheet.onDesvincularMascote,
      toggleReferenciaFormulas: NaurenActorSheet.onToggleReferenciaFormulas
    }
  };

  static PARTS = {
    body: { template: "systems/nauren/templates/personagem-sheet.html", scrollable: [".sheet-body"] }
  };

  /** @override */
  get title() {
    return this.actor.name;
  }

  async _prepareContext(options) {
    const grimorioItem = this.actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Grimório do Mago"));
    if (grimorioItem) {
      const g = naurenGrimorio(this.actor);
      const abertas = new Set(g.abertas.map(m => m.id));
      const hab = nome => this.actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, nome) && i.system.ativo !== false);
      const callux = hab("Callux Andaris"), marcador = hab("Marcador de Página"), aspectus = hab("Aspectus Sternvaloir");
      const cartao = (m, n) => m ? { numero: n, nome: m.name, img: m.img, custo: m.system.acoes?.[0]?.custoMana ?? 0, id: m.id } : null;
      this._painelGrimorio = {
        itemId: grimorioItem.id,
        texto: g.paginas.length ? `Páginas ${g.inicio + 1}–${g.inicio + g.abertas.length} de ${g.paginas.length}` : "Nenhuma magia no Grimório ainda.",
        esquerda: cartao(g.abertas[0], g.inicio + 1), direita: cartao(g.abertas[1], g.inicio + 2),
        podeVoltar: g.inicio > 0, podeAvancar: g.inicio < g.maxInicio,
        temCallux: !!callux, trocas: this.actor.getFlag("nauren", "calluxTrocas") ?? 0,
        temMarcador: !!marcador, marcadorDefinido: !!g.marcador && g.paginas.some(m => m.id === g.marcador),
        temAspectus: !!aspectus, aspectusLimite: aspectus ? Math.max(1, aspectus.system.rankAtual || 1) : 0, aspectusUsados: g.aspectus.length,
        podeQueimar: !!hab("Páginas em Chamas") && !!game.combat?.started && this.actor.getFlag("nauren", "paginasEmChamas") === game.combat?.id,
        paginas: g.paginas.map((m, i) => ({ id: m.id, numero: i + 1, nome: m.name, img: m.img, aberta: abertas.has(m.id), primeira: i === 0, ultima: i === g.paginas.length - 1,
          marcada: g.marcador === m.id, estrela: g.aspectus.includes(m.id) }))
      };
    } else this._painelGrimorio = null;
    // Painel "Estudos" (Ladino): alvos na cena que ESTE personagem estudou.
    // Painel "Marcas": marcas "únicas por conjurador" que ESTE personagem aplicou (ex.: Marca do Caçador).
    this._painelMarcas = null;
    {
      const nomesBen = { focoMortal: "Foco Mortal", tiroLetal: "Tiro Letal", reflexos: "Reflexos de Caça" };
      const escolheBeneficio = this.actor.items.some(i => (i.system?.acoes ?? []).some(a => a.escolherBeneficioMarca));
      const marcas = [];
      const vistosM = new Set();
      for (const t of canvas?.tokens?.placeables ?? []) {
        const a = t.actor;
        if (!a || a === this.actor || vistosM.has(a.uuid)) continue;
        for (const c of a.items.filter(i => i.type === "condicao" && i.system.unicaPorConjurador)) {
          let meu = false;
          try { const d = fromUuidSync(c.system.conjuradorUuid); meu = (d?.actor ?? d)?.uuid === this.actor.uuid; } catch (err) { meu = false; }
          if (!meu) continue;
          vistosM.add(a.uuid);
          const ben = c.getFlag("nauren", "beneficioMarca") ?? "";
          marcas.push({ itemUuid: c.uuid, nome: t.document.name, img: t.document.texture?.src, marca: c.name.replace(/\s*\(por [^)]*\)$/, ""),
            beneficio: nomesBen[ben] ?? "", opcoes: escolheBeneficio ? Object.entries(nomesBen).map(([k, v]) => ({ chave: k, nome: v, ativo: k === ben })) : [] });
        }
      }
      if (marcas.length || this.actor.items.some(i => naurenEhItem(i, "Marca do Caçador"))) this._painelMarcas = { marcas };
    }
    const tiposEstudoMeus = naurenTiposEstudoDoAtor(this.actor);
    this._painelEstudos = null;
    if (tiposEstudoMeus.length) {
      const vistos = new Set();
      const alvos = [];
      for (const t of canvas?.tokens?.placeables ?? []) {
        const a = t.actor;
        if (!a || a === this.actor || vistos.has(a.uuid)) continue;
        const marca = naurenEstudoNoAlvo(a, this.actor);
        if (!marca) continue;
        vistos.add(a.uuid);
        const dados = marca.getFlag("nauren", "estudo") ?? {};
        const infP = dados.informacoes ?? 0;
        const efeitoP = tp => {
          const n = naurenValorEstudo(tp, 1, infP);
          if (tp.tipo.esquivaContra) return `+${n} esquiva contra ele`;
          if (tp.tipo.dadosDaArma) return `+${n} dado(s) da arma`;
          if (tp.tipo.bonusAcerto) return `+${n} no acerto`;
          if (tp.tipo.semPrioridade) return `${Math.max(0, n - (dados.estrategiaUsados ?? 0))} de ${n} ataques sem Prioridade`;
          return "";
        };
        alvos.push({
          alvoUuid: a.uuid, nome: t.document.name, img: t.document.texture?.src, informacoes: infP,
          tipos: tiposEstudoMeus.filter(tp => !tp.tipo.criativa).map(tp => {
            const acumulos = dados.tipos?.[tp.chave]?.acumulos ?? 0;
            const max = Number(tp.tipo.maxAcumulos) || 99;
            return { chave: tp.chave, nome: tp.tipo.nome, acumulos, max, ativo: acumulos > 0, porAnalisado: !!tp.tipo.porAnalisado, efeito: acumulos > 0 && tp.tipo.porAnalisado ? efeitoP(tp) : "",
              pontos: !tp.tipo.porAnalisado && max <= 6 ? Array.from({ length: max }, (_, i) => i < acumulos) : null };
          }),
          criativas: Object.entries(dados.criativas ?? {}).map(([chave, c]) => ({ chave, texto: `${c.modo === "acima" ? "Eu estou acima" : "Você está abaixo"}: ${c.rotulo}`,
            estado: c.modo === "acima" ? `+${Math.max(1, infP)} em você` : (dados.abaixoPendente ?? []).some(x => x.chave === chave) ? "armada para o próximo ataque" : `−${Math.max(1, infP)} no alvo (se acertou)` }))
        });
      }
      this._painelEstudos = { alvos };
    }
    const tudoEMeu = this.actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Tudo é Meu!") && i.system.ativo !== false);
    if (tudoEMeu) {
      this._painelEstudos ??= { alvos: [] };
      this._painelEstudos.tudoEMeu = { disponivel: naurenUsoDisponivel(tudoEMeu), guardado: this.actor.getFlag("nauren", "dadoRoubado") ?? null };
    }
    const context = await super._prepareContext(options);
    context.actor = this.actor;
    context.system = this.actor.system;
    context.owner = this.actor.isOwner;
    context.editable = this.isEditable;
    context.limited = this.actor.limited;
    context.abaAtiva = this.#abaAtiva;
    context.modoFichaEdicao = this.#modoFichaEdicao;
    context.imagemModoToken = this.#imagemModoToken;
    context.imagemAtualExibida = this.#imagemModoToken
      ? (this.actor.prototypeToken?.texture?.src || this.actor.img)
      : this.actor.img;
    context.estiloRetrato = this.#imagemModoToken ? "" : naurenEstiloEnquadramento(this.actor, this.actor.img);
    context.bordaAtiva = !!(this.actor.isToken ? this.actor.token?.getFlag?.("nauren", "borda")?.ativa : this.actor.getFlag("nauren", "borda")?.ativa);
    // Ficha aberta a partir de um TOKEN não vinculado (isToken=true e o
    // próprio token tem "Vincular Ator" desligado): mostra o botão de
    // "Sincronizar com a Ficha Original", já que edições feitas aqui só
    // afetam este token específico, não a ficha na barra lateral.
    context.ehTokenNaoVinculado = !!(this.actor.isToken && this.actor.token?.actorLink === false);

    context.habilidades = await Promise.all(this.actor.items.filter(i => i.type === "habilidade").sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(i => this._prepareItemEntry(i)));
    context.armas = await Promise.all(this.actor.items.filter(i => i.type === "arma").sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(i => this._prepareItemEntry(i)));
    // 0.94: limite de equipamentos ofensivos (indicador do Inventário) e o peso de cada arma.
    {
      const limite = this.actor.system.limiteOfensivoTotal ?? naurenLimiteOfensivoBase();
      const usado = naurenPesoOfensivoEquipado(this.actor);
      for (const e of context.armas) {
        const it = this.actor.items.get(e.id ?? e._id);
        if (!it) continue;
        e.pesoOfensivo = naurenPesoOfensivo(it);
        e.naoCabe = !it.system.equipado && limite > 0 && usado + e.pesoOfensivo > limite;
        e.projeto = !!it.getFlag("nauren", "projeto");
        e.usosArma = it.system.usaUsos ? { atual: it.system.usosAtual ?? 0, max: it.system.usosMax ?? 0 } : null;
      }
      context.limiteOfensivo = naurenLimiteOfensivoBase() > 0 ? {
        usado, limite, passou: usado > limite, livre: Math.max(0, limite - usado),
        pips: Array.from({ length: Math.max(limite, usado) }, (_, i) => ({ cheio: i < usado, excesso: i >= limite })),
        fontes: this.actor.system.limiteOfensivoFontes ?? ""
      } : null;
    }
    // 0.94: aba Invenções (aparece com uma tabela de construção ou o recurso Pontos de Invenção).
    context.invencoes = naurenContextoInvencoes(this.actor, this._atorEstaEmCombateAtivo());
    context.armaduras = await Promise.all(this.actor.items.filter(i => i.type === "armadura").sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(i => this._prepareItemEntry(i)));
    // 0.94.9: escudos ocupam o limite de Ataque; armadura/capa/bota mostram se a vaga já está ocupada.
    {
      const limite = this.actor.system.limiteOfensivoTotal ?? naurenLimiteOfensivoBase();
      const usado = naurenPesoOfensivoEquipado(this.actor);
      for (const e of context.armaduras) {
        const it = this.actor.items.get(e.id ?? e._id);
        if (!it) continue;
        e.pesoOfensivo = naurenPesoOfensivo(it);
        e.naoCabe = !it.system.equipado && e.pesoOfensivo > 0 && naurenLimiteOfensivoBase() > 0 && limite > 0 && usado + e.pesoOfensivo > limite;
        const vaga = naurenVagaDefesa(it);
        e.vagaOcupada = !it.system.equipado && !!vaga && naurenRegraVagasDefesa()
          && this.actor.items.filter(o => o.id !== it.id && o.system?.equipado && naurenVagaDefesa(o) === vaga).length >= naurenLimiteVagaDefesa(vaga);
      }
    }
    context.consumiveis = await Promise.all(this.actor.items.filter(i => i.type === "consumivel").sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(i => this._prepareItemEntry(i)));
    context.magias = await Promise.all(this.actor.items.filter(i => i.type === "magia").sort(naurenOrdemListaMagias).map(i => this._prepareItemEntry(i)));
    context.efeitos = await Promise.all(this.actor.items
      .filter(i => i.type === "efeito")
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map(async item => ({
        id: item.id,
        name: item.name,
        img: item.img,
        ativo: item.system.ativo,
        acumulativel: item.system.acumulativel,
        acumulos: item.system.acumulos ?? 1,
        // Rank (ver campoModificadorExterno/naurenResolverPorRank) - só
        // mostra o badge quando o item realmente usa rank (rankMax > 1
        // OU já tem algum ponto investido), mesmo critério já usado no
        // card de chat, pra não gerar ruído "Rank 0/1" em todo Efeito
        // simples que nunca usa isso.
        rankAtual: item.system.rankAtual ?? 0,
        rankMax: item.system.rankMax ?? 1,
        temRank: (item.system.rankMax ?? 1) > 1 || (item.system.rankAtual ?? 0) > 0,
        // Origem (ver campo "origem" no schema e naurenGarantirEfeitoDe*)
        // - mesmo rótulo amigável já usado na aba Habilidades.
        origemLabel: item.system.origem === "subclasse" ? "Subclasse" : item.system.origem === "classe" ? "Classe" : "",
        resumo: resumoEfeito(item.system),
        ...(await this._prepararDescricaoDaLinha(item))
      })));
    context.cores = await Promise.all(this.actor.items
      .filter(i => i.type === "cor")
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map(async item => ({
        id: item.id,
        name: item.name,
        corHex: item.system.corHex,
        ativo: item.system.ativo,
        resumo: resumoCor(item.system),
        ...(await this._prepararDescricaoDaLinha(item))
      })));
    context.peculiaridades = await Promise.all(this.actor.items
      .filter(i => i.type === "peculiaridade")
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map(async item => ({
        id: item.id,
        name: item.name,
        img: item.img,
        ativo: item.system.ativo,
        tipo: item.system.tipo,
        ehFardo: item.system.tipo === "fardo",
        parNome: item.system.parNome,
        resumo: resumoEfeito(item.system),
        ...(await this._prepararDescricaoDaLinha(item))
      })));
    // Imunidades a Condições (M08): lista "Imune a: X (fonte)" acima das Condições.
    context.imunidades = [];
    for (const it of this.actor.items) {
      if (!["habilidade", "efeito", "peculiaridade", "condicao", "magia"].includes(it.type) || naurenEhCondicaoModelo(it)) continue;
      const ativo = it.type === "condicao" || it.type === "peculiaridade" ? it.system.ativo !== false : !!it.system.ativo;
      if (!ativo) continue;
      for (const ref of it.system.imunidadesCondicoes ?? []) {
        const r = String(ref ?? "").trim(); if (!r) continue;
        let nome = r.startsWith("self:") ? r.slice(5) : r;
        if (/^(Compendium|Actor|Item)\./.test(r)) { try { nome = fromUuidSync(r)?.name ?? r; } catch (err) { nome = r; } }
        context.imunidades.push({ nome, fonte: it.name });
      }
    }
    context.condicoesModelo = this.actor.items.filter(naurenEhCondicaoModelo).sort((a, b) => a.name.localeCompare(b.name))
      .map(i => ({ id: i.id, name: i.name, img: i.img, resumo: String(i.system.descricao ?? "").replace(/<[^>]+>/g, " ").trim().slice(0, 110) }));
    context.condicoes = await Promise.all(this.actor.items
      .filter(i => i.type === "condicao" && !naurenEhCondicaoModelo(i))
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map(async item => ({
        id: item.id,
        name: item.name,
        img: item.img,
        ativo: item.system.ativo,
        acumulativel: item.system.acumulativel,
        acumulos: item.system.acumulos ?? 1,
        resumo: resumoCondicao(item.system, item),
        modificadoPor: this._modificadoresExternosQueAfetam(item),
        ...(await this._prepararDescricaoDaLinha(item))
      })));
    context.modosRolagem = MODOS_ROLAGEM;
    context.registroRolagens = naurenRegistroParaFicha(this.actor);
    context.calculoVidaOpcoes = CALCULO_VIDA_OPCOES;
    context.isCalculoVidaCustom = context.system.calculoVida === "customizado";
    context.isCalculoVidaCategoria = context.system.calculoVida === "categoria";
    context.calculoManaOpcoes = CALCULO_MANA_OPCOES;
    context.isCalculoManaCustom = context.system.calculoMana === "customizado";
    context.calculoEstaminaCombateOpcoes = CALCULO_ESTAMINA_COMBATE_OPCOES;
    context.isCalculoEstaminaCombateCustom = context.system.calculoEstaminaCombate === "customizado";
    context.calculoDadosDestinoOpcoes = CALCULO_DADOS_DESTINO_OPCOES;
    context.isCalculoDadosDestinoCustom = context.system.calculoDadosDestino === "customizado";
    // "Escala por Nível" e "Cálculo de Recursos" só existem na aba Opções
    // de fichas de NPC/monstro - nunca aparecem num personagem jogável
    // (ver template: seções envolvidas num {{#if isNpc}}).
    context.isNpc = this.actor.type === "npc";
    // NPC/monstro: as seções de personagem jogável (Peculiaridades de jogador, Classe, Subclasse) só aparecem se tiverem algo.
    // As Peculiaridades do Criador (Envenenador, Bando...) são Habilidades e aparecem em Habilidades.
    // Cabeçalho do NPC: Categoria (1-4) e Valor Base. A Categoria mostrada é a FINAL
    // (campo, ou item "Categoria N" em fichas antigas - ver naurenCategoriaDoAtor).
    context.categoriaOpcoes = { 1: "1", 2: "2", 3: "3", 4: "4" };
    context.categoriaSelecionada = String(this.actor.system.categoriaTotal ?? this.actor.system.categoriaMonstro ?? 1);
    context.escalaMonstro = this.actor.system.escalaMonstro ?? naurenEscalaPorCategoria(1);

    // Escala por Nível (monstros/NPCs - ver NaurenActorData#escalaAtributos):
    // monta o contexto pra seção expansível na aba Opções - rótulo de
    // exibição de cada atributo (pra não repetir "forca"→"Força" em 2
    // lugares), quais atributos ainda NÃO foram adicionados (pro
    // dropdown de "Adicionar Atributo" só oferecer os que faltam - cada
    // atributo só pode aparecer 1x na lista), e o estado de "expandido"
    // de cada card (lido do Set #escalaAtributosExpandidos, só de UI).
    {
      const rotulos = { forca: "Força", agilidade: "Agilidade", estamina: "Estamina", inteligencia: "Inteligência", destino: "Destino" };
      const jaAdicionados = new Set((context.system.escalaAtributos ?? []).map(e => e.atributo));
      context.atributosDisponiveisParaEscala = Object.entries(rotulos)
        .filter(([chave]) => !jaAdicionados.has(chave))
        .map(([chave, label]) => ({ chave, label }));
      context.escalaAtributosContext = (context.system.escalaAtributos ?? []).map(entrada => ({
        ...entrada,
        label: rotulos[entrada.atributo] ?? entrada.atributo,
        expandido: this.#escalaAtributosExpandidos.has(entrada.atributo)
      }));
      context.escalaPorNivelAberta = this.#escalaPorNivelAberta;
    }

    // Subir de Nível: botão só aparece quando já tem XP suficiente.
    // Fórmula do manual: pra ir do nível N pro N+1, precisa de (N+1) x 100 XP.
    context.proximoNivelNumero = (context.system.nivel || 1) + 1;
    context.xpProximoNivel = context.proximoNivelNumero * 100;
    context.podeSubirNivel = (context.system.xp || 0) >= context.xpProximoNivel;

    // CLASSE/SUBCLASSE: item de Classe equipado substitui a
    // exibição do campo de texto livre "system.classe" no cabeçalho (ver
    // header no template) - a checagem de multiclasse impede ter mais de
    // uma (ver _onDropItem). Lista de Subclasses já fica pronta aqui,
    // mesmo antes do tipo "subclasse" existir de verdade - some
    // vazia até lá.
    context.classeEquipada = this.actor.items.find(i => i.type === "classe") ?? null;
    context.classes = await Promise.all(this.actor.items
      .filter(i => i.type === "classe")
      .map(async item => ({ id: item.id, name: item.name, img: item.img, ...(await this._prepararDescricaoDaLinha(item)) })));
    context.subclasses = await Promise.all(this.actor.items
      .filter(i => i.type === "subclasse")
      .map(async item => ({ id: item.id, name: item.name, img: item.img, ...(await this._prepararDescricaoDaLinha(item)) })));
    // Badge "ponto(s) disponível(is)" ao lado da lista de Subclasses -
    // aparece sempre que houver algum Ponto de Subclasse ainda não gasto.
    context.pontosSubclasseDisponiveis = context.system.pontosSubclasse?.value ?? 0;

    // Barras de Vida/Mana/Estamina de Combate/Dados de Destino - uma
    // entrada por recurso, já com % de preenchimento e cor (customizada ou
    // padrão) resolvidas, pra template só desenhar.
    context.barrasRecursos = [
      { chave: "vida", campo: "vida.value", label: "PONTOS DE VIDA", icone: "fa-heart", ...this._prepararBarraRecurso("vida") },
      { chave: "mana", campo: "mana.value", label: "PONTOS DE MANA", icone: "fa-bolt", ...this._prepararBarraRecurso("mana") },
      { chave: "estaminaCombate", campo: "estaminaCombate.value", label: "ESTAMINA DE COMBATE", icone: "fa-fire", ...this._prepararBarraRecurso("estaminaCombate") },
      { chave: "dadosDestino", campo: "dadosDestino.value", label: "DADOS DE DESTINO", icone: "fa-dice-d6", ...this._prepararBarraRecurso("dadosDestino") }
    ];
    // Recursos Customizados - quantidade variável, vem de Subclasse
    // equipada. Lista vazia = seção nem aparece na ficha (ver template).
    context.recursosCustomView = this._prepararRecursosCustomView();

    // Escudo temporário (ex: "Escudo de Mana" do Mago) - aparece na ficha
    // quando ativo (max > 0) OU em Modo Ficha Edição (pra dar a opção de
    // criar um do zero, clicando e digitando - mesmo padrão de Mascotes
    // "aparece se já tiver um vinculado, ou no Modo Edição"). Reaproveita
    // o MESMO formato de "barra" de Vida/Mana/etc, incluindo o clique
    // pra editar (ver "_ligarBarrasRecurso" - já genérico, funciona pra
    // qualquer "data-recurso"/"data-campo" sem mudança nenhuma nele).
    const escudoMax = this.actor.system.escudo?.max ?? 0;
    const escudoValue = this.actor.system.escudo?.value ?? 0;
    context.escudoAtivo = escudoMax > 0 || context.modoFichaEdicao;
    if (context.escudoAtivo) {
      context.escudoBarra = {
        label: "Escudo", chave: "escudo", campo: "escudo.value", value: escudoValue, max: escudoMax,
        pct: escudoMax > 0 ? Math.round((escudoValue / escudoMax) * 100) : 0,
        cor1: "#8a8ac2", cor2: "#4a4a7a",
        editando: this.#recursosEditando.has("escudo"),
        tooltip: "Escudo temporário - absorve dano antes da Vida. Clique pra editar - um número define o valor (e o máximo junto), \"+2\"/\"-2\" soma/subtrai do atual."
      };
    }

    // Mascotes/Companheiros - encontrados por busca (ver
    // naurenBuscarMascotesDe), lista vazia = seção nem aparece na ficha.
    context.mascotes = naurenBuscarMascotesDe(this.actor).map(m => ({
      id: m.id,
      uuid: m.uuid,
      name: m.name,
      img: m.img || "icons/svg/pawprint.svg",
      nivel: m.system.nivel ?? 1,
      vidaAtual: m.system.vida?.value ?? 0,
      vidaMax: m.system.vida?.max ?? 0,
      pctVida: (m.system.vida?.max ?? 0) > 0 ? Math.max(0, Math.min(100, (m.system.vida.value / m.system.vida.max) * 100)) : 0
    }));

    // Referência de fórmulas (aba Opções, caixa expansível) - lista fixa,
    // não precisa recalcular nada por render.
    context.referenciaFormulas = NAUREN_REFERENCIA_FORMULAS;
    context.referenciaFormulasAberta = this.#referenciaFormulasAberta;

    const { TextEditor } = foundry.applications.ux;
    context.enrichedNotas = await (foundry.applications?.ux?.TextEditor?.implementation ?? TextEditor).enrichHTML(context.system.notas ?? "", {
      secrets: this.actor.isOwner,
      relativeTo: this.actor
    });

    context.painelEstudos = this._painelEstudos;
    context.painelMarcas = this._painelMarcas;
    context.painelGrimorio = this._painelGrimorio;
    context.mostrarPeculiaridades = !context.isNpc || !!context.peculiaridades?.length;
    context.mostrarClasse = !context.isNpc || !!context.classes?.length;
    context.mostrarSubclasse = !context.isNpc || !!context.subclasses?.length;
    return context;
  }

  /**
   * Prepara um item (arma/armadura/consumível/magia/habilidade) pra exibição
   * na lista da ficha principal, resolvendo qual é a sua Ação ATIVA no
   * momento (a que vai rodar se o jogador clicar no dado) e montando o mapa
   * de opções pro seletor rápido de Ação, quando o item tem mais de uma.
   */
  /**
   * Monta os dados de exibição da barra de um recurso (Vida/Mana/Estamina
   * de Combate/Dados de Destino): % preenchido, as duas cores do degradê
   * (customizadas pelo jogador, ou o padrão daquele recurso), e se está no
   * momento "aberta pra digitar" (ver #recursosEditando).
   */
  _prepararBarraRecurso(chave) {
    const sys = this.actor.system[chave] ?? { value: 0, max: 0 };
    const cores = this.actor.system.corBarra?.[chave];
    const padrao = NAUREN_BARRA_CORES_PADRAO[chave];
    const cor1 = cores?.cor1 || padrao.cor1;
    const cor2 = cores?.cor2 || padrao.cor2;
    const pct = sys.max > 0 ? Math.max(0, Math.min(100, (sys.value / sys.max) * 100)) : 0;
    // Estamina de Combate/Dados de Destino não têm bônus PRÓPRIO (só
    // espelham o atributo Estamina/Destino) - por isso mostram o tooltip
    // daquele atributo, não um deles mesmos.
    const chaveTooltip = { vida: "vida", mana: "mana", estaminaCombate: "estamina", dadosDestino: "destino" }[chave];
    return {
      value: sys.value ?? 0,
      max: sys.max ?? 0,
      pct,
      cor1,
      cor2,
      editando: this.#recursosEditando.has(chave),
      tooltip: this.actor.system.tooltips?.[chaveTooltip] ?? ""
    };
  }

  /**
   * Monta a lista de barras dos Recursos Customizados (Determinação,
   * Ofuscação, Energia etc, declarados por uma Subclasse equipada - ver
   * naurenSincronizarRecursosCustom). Mesma FORMA de dados que
   * _prepararBarraRecurso (chave/label/campo/value/max/pct/cor1/cor2/
   * editando), pra poder reaproveitar o mesmo parcial de template e o mesmo
   * listener de clique-pra-editar (_ligarBarrasRecurso) - "chave" aqui é
   * prefixada ("custom:id") só pra nunca colidir com "vida"/"mana"/etc, e
   * "campo" aponta pro índice certo dentro do array (recursosCustom.N.valor).
   */
  _prepararRecursosCustomView() {
    return (this.actor.system.recursosCustom ?? []).map((r, index) => {
      const pct = r.max > 0 ? Math.max(0, Math.min(100, (r.valor / r.max) * 100)) : 0;
      const chave = `custom:${r.id}`;
      return {
        chave,
        index,
        id: r.id,
        label: r.nome,
        icone: r.icone || "fa-star",
        value: r.valor ?? 0,
        max: r.max ?? 0,
        pct,
        cor1: r.cor1 || "#4a3a7a",
        cor2: r.cor2 || "#8a6fd4",
        editando: this.#recursosEditando.has(chave),
        campo: `recursosCustom.${index}.valor`,
        // Trava (ver naurenRecursoEstaTravado): "travaManual" é o que o
        // jogador escolheu (auto/travado/destravado); "travadoAgora" é o
        // resultado FINAL considerando a regra automática também - é
        // isso que decide se o ícone de cadeado aparece fechado ou aberto.
        travaManual: r.travaManual || "auto",
        travadoAgora: naurenRecursoEstaTravado(this.actor, r.id)
      };
    });
  }

  /**
   * Versão "de exibição" de _coletarModificadoresExternos - não resolve
   * pra uma Ação específica (usada por TODAS as listas de item da ficha -
   * Habilidades, Armas, Armaduras, Consumíveis, Magias, Condições): só
   * devolve, de forma resumida e sem duplicar, quais nós de Subclasse
   * afetam ESTE item agora, de QUALQUER um dos dois mecanismos que um nó
   * pode usar - pra desenhar o indicador "tem ajuste de Subclasse" (ver
   * NaurenActorSheet#_prepareItemEntry e o bloco de Condições em
   * getData). Junta:
   * (1) Efeitos ativos com "modificaOutroItem" (Modificador Externo/
   *     Gatilho de Template Persistente - ver campoModificadorExterno) -
   *     o mecanismo NOVO, que nunca escreve no item alvo, só calcula por
   *     cima na hora de usar.
   * (2) Nós de Subclasse com "apenasUpgrade" (ver NaurenSubclasseHelper.
   *     investirPonto) - o mecanismo ANTIGO, que escreve DIRETO num campo
   *     do item concedido pela Classe (ex: Comunhão Natural subindo o
   *     rankAtual de Infusão Floral). Exclui de propósito os nós SEM
   *     "apenasUpgrade": esses concedem sua PRÓPRIA cópia nova no rank 1
   *     (item.itemUuid apontaria pra ELE MESMO, não pra outro item - o
   *     próprio rank do item já mostra isso, não precisa de um indicador
   *     redundante "modificado por si mesmo").
   * Bug real corrigido: só a fonte (1) era considerada - Comunhão
   * Natural (fonte 2) tinha o ponto investido, de fato mudava Infusão
   * Floral, mas nunca aparecia no indicador.
   */
  _modificadoresExternosQueAfetam(item) {
    const encontrados = new Map();
    for (const efeito of this.actor.items) {
      if (efeito.type !== "efeito" || !efeito.system.ativo || !efeito.system.modificaOutroItem) continue;
      const afeta = (efeito.system.modificadoresExternos ?? []).some(entrada =>
        entrada.campo && naurenItemCorrespondeAoAlvo(item, entrada.itemAlvoUuid) &&
        naurenResolverPorRank(entrada.valorPorRank, efeito.system.rankAtual, "valor") !== null
      );
      if (afeta) encontrados.set(`efeito:${efeito.id}`, { nome: efeito.name, rank: efeito.system.rankAtual, fonte: "efeito" });
    }
    for (const subclasseItem of this.actor.items) {
      if (subclasseItem.type !== "subclasse") continue;
      for (const no of (subclasseItem.system.nos ?? [])) {
        if (!(no.rankAtual > 0)) continue;
        const chave = `no:${subclasseItem.id}:${no.id}`;
        if ((no.modificadores ?? []).some(m => naurenItemCorrespondeAoAlvo(item, m.itemAlvoUuid))) {
          encontrados.set(chave, { nome: no.nome, rank: no.rankAtual, fonte: "no" });
        } else if (no.apenasUpgrade && no.itemUuid && naurenItemCorrespondeAoAlvo(item, no.itemUuid) && !(no.modificadores ?? []).length) {
          encontrados.set(chave, { nome: no.nome, rank: no.rankAtual, fonte: "noLegado" });
        }
      }
    }
    // Habilidades, Condições e Efeitos que alteram ESTE item de outras formas.
    const ativaM = it => it.type === "habilidade" ? it.system.ativo !== false : (it.type === "condicao" ? it.system.ativo !== false : it.type === "efeito" ? !!it.system.ativo : false);
    const contem = (nome, alvo) => !!nome && String(alvo?.name ?? "").toLowerCase().includes(String(nome).toLowerCase());
    for (const fonte of this.actor.items) {
      if (fonte === item || !["habilidade", "condicao", "efeito"].includes(fonte.type) || !ativaM(fonte)) continue;
      const oQue = [];
      if ((fonte.system.modificadores ?? []).some(m => m.itemAlvoUuid && naurenItemCorrespondeAoAlvo(item, m.itemAlvoUuid))) oQue.push("altera valores");
      if ((fonte.system.usosExtrasEm ?? []).some(u => u.itemNome && naurenEhItem(item, u.itemNome))) oQue.push("usos extras");
      if (item.type === "magia" && (fonte.system.ajusteCustoMana ?? []).some(aj => contem(aj.soItemNome, item))) oQue.push("custo de Mana");
      if ((fonte.system.reduzCustoEstamina ?? []).some(r => contem(r.soItemNome, item))) oQue.push("custo de Estamina");
      if ((fonte.system.acoes ?? []).some(ac => ac.usosDeOutroItemNome && naurenEhItem(item, ac.usosDeOutroItemNome))) oQue.push("usa os mesmos usos");
      if (oQue.length) encontrados.set(`item:${fonte.id}`, { nome: `${fonte.name} (${oQue.join(", ")})`, rank: fonte.system.rankAtual || 1, fonte: "item" });
    }
    return [...encontrados.values()];
  }

  async _prepareItemEntry(item) {
    const sys = item.system;
    const acoes = sys.acoes ?? [];
    const idx = acoes.length ? Math.min(sys.acaoAtivaIndex ?? 0, acoes.length - 1) : 0;
    const acaoAtiva = acoes[idx] ?? null;
    // Nome curto no seletor: sem repetir o nome do item ("Golpe Espiritual (Poder de Magia)" → "Poder de Magia",
    // "Caligrafia — Postura (1 Energia)" → "Postura (1 Energia)"), para caber e dar para distinguir.
    const nomeCurtoAcao = (nome) => {
      let n = String(nome ?? "");
      const base = String(item.name ?? "");
      const primeira = base.split(" ")[0];
      if (base && n.startsWith(base)) n = n.slice(base.length);
      else if (primeira && n.startsWith(`${primeira} — `)) n = n.slice(primeira.length + 3);
      n = n.replace(/^[\s—–:-]+/, "").replace(/^\((.*)\)$/, "$1").trim();
      return n || String(nome ?? "");
    };
    const acaoOptions = acoes.length > 1
      ? Object.fromEntries(acoes.map((a, i) => [i, a.nome ? nomeCurtoAcao(a.nome) : `Ação ${i + 1}`]))
      : null;
    const municoesDaArma = item.type === "arma" && sys.usaMunicao ? naurenMunicoesCompativeis(this.actor, item) : null;
    const municaoOptions = municoesDaArma ? Object.fromEntries(municoesDaArma.map(m => [m.id, `${m.name} ×${m.system.quantidade ?? 0}${m.system.municaoDanoExtra ? ` (+${m.system.municaoDanoExtra})` : ""}${m.system.municaoVenenoUuid && (m.system.municaoVenenoTodas || m.system.municaoVenenoQuantidade > 0) ? " ☠" : ""}`])) : null;
    const municaoSelecionada = municoesDaArma ? (municoesDaArma.find(m => m.id === sys.municaoSelecionadaId) ?? municoesDaArma[0])?.id ?? "" : "";
    // Rótulo amigável de "system.origem" ("classe"/"subclasse") - usado
    // como fallback de categoria na lista principal quando o item não tem
    // nenhuma Ação (ver template: "item.acaoAtiva.categoria" só existe
    // quando há Ação). Calculado aqui em JS, não no Handlebars, porque
    // este sistema não tem um helper "eq" registrado.
    const origemLabel = sys.origem === "subclasse" ? "Subclasse" : sys.origem === "classe" ? "Classe" : "";
    return {
      torreTier: naurenTierTorre(item),
      id: item.id,
      name: item.name,
      img: item.img,
      system: sys,
      acaoAtiva,
      municaoOptions, municaoSelecionada, acaoOptions,
      acaoAtivaIndex: idx,
      origemLabel,
      cargasInfo: this._resolverFonteCargas(item),
      quantidadeInfo: item.type === "consumivel" ? { atual: sys.quantidade ?? 0, max: sys.quantidadeMax ?? 0 } : null,
      // Indicador "tem ajuste de Subclasse" (ver
      // _modificadoresExternosQueAfetam) - lista de {nome, rank} dos
      // Efeitos ativos que modificam este item agora. Vazio na imensa
      // maioria dos itens (só populado quando existe pelo menos 1
      // Efeito-modificador de Subclasse apontando pra ele).
      modificadoPor: this._modificadoresExternosQueAfetam(item),
      ...(await this._prepararDescricaoDaLinha(item))
    };
  }

  /**
   * Monta os dados de "descrição expansível direto na linha" (usado por
   * TODAS as listas da ficha principal - Habilidades, Armas, Armaduras,
   * Consumíveis, Magias, Efeitos, Pigmentos, Condições, Classe, Subclasse):
   * se o item estiver na lista #itensDescricaoExpandida, já enriquece o
   * HTML (links, rolagens embutidas etc.) pra exibir; senão nem gasta esse
   * processamento à toa.
   */
  async _prepararDescricaoDaLinha(item) {
    const expandida = this.#itensDescricaoExpandida.has(item.id);
    if (!expandida) return { descricaoExpandida: false, enrichedDescricao: "" };
    const { TextEditor } = foundry.applications.ux;
    const enrichedDescricao = await (foundry.applications?.ux?.TextEditor?.implementation ?? TextEditor).enrichHTML(item.system.descricao ?? "", {
      secrets: item.isOwner,
      relativeTo: item
    });
    return { descricaoExpandida: true, enrichedDescricao };
  }

  /**
   * Descobre de onde vêm as "cargas" que devem aparecer na lista da ficha
   * pra este item: preferencialmente da Ação ativa (a maioria dos casos,
   * já que cargas agora moram na Ação, e podem vir de um Consumível
   * vinculado - ver campoAcao > cargasFonte/cargasConsumivelId); armadura
   * também pode ter cargas próprias no nível do item (isso não mudou). Se
   * nada tiver cargas habilitadas, devolve null (não mostra o contador).
   */
  _resolverFonteCargas(item) {
    const sys = item.system;
    const acoes = sys.acoes ?? [];
    const idx = acoes.length ? Math.min(sys.acaoAtivaIndex ?? 0, acoes.length - 1) : -1;
    const acaoAtiva = idx >= 0 ? acoes[idx] : null;
    if (acaoAtiva?.usaCargas) {
      if (acaoAtiva.cargasFonte === "consumivel") {
        const consumivel = acaoAtiva.cargasConsumivelId ? this.actor.items.get(acaoAtiva.cargasConsumivelId) : null;
        if (!consumivel) return { isConsumivel: true, consumivelId: null, cargasAtual: 0, cargasMax: 0, semConsumivel: true };
        return { isConsumivel: true, consumivelId: consumivel.id, cargasAtual: consumivel.system.quantidade ?? 0, cargasMax: consumivel.system.quantidadeMax ?? 0 };
      }
      return { isAcao: true, acaoIndex: idx, cargasAtual: acaoAtiva.cargasAtual ?? 0, cargasMax: acaoAtiva.cargasMax ?? 0 };
    }
    // Usos da Habilidade (nível do item, ver NaurenHabilidadeData/
    // NaurenMagiaData > usaUsos) - compartilhado entre TODAS as Ações
    // que marcarem "usaUsos: true" (ex: Comungar - "Comungar — Vida" e
    // "Comungar — Mana" são a MESMA Habilidade com 1 uso/dia). Checado
    // ANTES do "usos da própria Ação" abaixo - se o item tiver isso
    // ligado, a Ação ativa (que também precisa ter "usaUsos") mostra o
    // contador DO ITEM, não um próprio.
    if (sys.usaUsos && acaoAtiva?.usaUsos) {
      const nivelAtor = this.actor.system.nivel || 1;
      const usosMaxPorNivelItem = naurenResolverPorNivel(sys.usosMaxPorNivel, nivelAtor, "valor");
      const usosMaxItem = usosMaxPorNivelItem !== null ? usosMaxPorNivelItem : (sys.usosMax ?? 0);
      return { isUsosItem: true, cargasAtual: sys.usosAtual ?? 0, cargasMax: usosMaxItem };
    }
    // Usos (Ação Ativa - "1x por cena/dia/rodada/turno", ex: Avançar!,
    // Investida, Colapso Emocional) - mesmo visual (X/Y +/-) que cargas,
    // mas o campo certo é usosAtual/usosMax DENTRO da Ação ativa, não da
    // Habilidade em si (diferente de Usos Passivos, abaixo).
    if (acaoAtiva?.usaUsos) {
      // Bug real corrigido: esta exibição sempre lia o usosMax BASE
      // (sem considerar nível) da própria Ação ativa, mesmo quando
      // _executarAcao já calculava certo (por usosMaxPorNivel) na
      // hora de usar.
      const nivelAtor = this.actor.system.nivel || 1;
      const usosMaxPorNivelExib = naurenResolverPorNivel(acaoAtiva.usosMaxPorNivel, nivelAtor, "valor");
      const usosMaxExib = (usosMaxPorNivelExib !== null ? usosMaxPorNivelExib : (acaoAtiva.usosMax ?? 0)) + naurenUsosExtrasPara(this.actor, item);
      // Bônus de Usos condicional (ver campoAcao > usosMaxBonusCondicaoUuid,
      // ex: Fadiga em Profusão Ousada) - mesma lógica de _executarAcao,
      // replicada aqui: sem isso, a ficha nunca mostrava o "+1" enquanto
      // a Condição estivesse ativa, só o valor base.
      let cargasAtualExib = acaoAtiva.usosAtual ?? 0;
      let cargasMaxExib = usosMaxExib;
      if (acaoAtiva.usosMaxBonusCondicaoUuid && this._euTenhoCondicao(acaoAtiva.usosMaxBonusCondicaoUuid, 1)) {
        const bonusExib = Math.round(naurenInterpretarModificador(acaoAtiva.usosMaxBonusQuantidade, this.actor, item)?.valor ?? 0);
        if (bonusExib) {
          const bonusJaConsumidoExib = acaoAtiva.usosBonusConsumidoAtual ?? 0;
          cargasAtualExib += Math.max(0, bonusExib - bonusJaConsumidoExib);
          cargasMaxExib += bonusExib;
        }
      }
      return { isUsos: true, acaoIndex: idx, cargasAtual: cargasAtualExib, cargasMax: cargasMaxExib };
    }
    if (item.type === "armadura" && sys.usaCargas) {
      return { isAcao: false, cargasAtual: sys.cargasAtual ?? 0, cargasMax: sys.cargasMax ?? 0 };
    }
    // Usos de Habilidade Passiva - mesmo visual (X/Y +/-) que
    // cargas, mas semanticamente "quantas vezes esta passiva ainda pode
    // disparar neste período" (ver naurenRecarregarUsos) - reaproveita a
    // MESMA UI/handlers de cargas, só aponta pro campo certo ao salvar.
    if ((item.type === "habilidade" || item.type === "magia") && sys.usaUsosPassiva) {
      return { isUsosPassiva: true, cargasAtual: sys.usosPassivaAtual ?? 0, cargasMax: naurenUsosPassivaMax(sys) };
    }
    return null;
  }

  /** Ajusta em +1/-1 as cargas exibidas na lista (via _resolverFonteCargas), salvando no lugar certo (própria Ação, Armadura, ou o Consumível vinculado). */
  async _ajustarCargaNaLista(item, delta) {
    const fonte = this._resolverFonteCargas(item);
    if (!fonte) return;
    if (fonte.isConsumivel) {
      if (!fonte.consumivelId) return;
      const consumivel = this.actor.items.get(fonte.consumivelId);
      if (!consumivel) return;
      const novoValor = Math.max(0, Math.min(consumivel.system.quantidadeMax ?? 0, (consumivel.system.quantidade ?? 0) + delta));
      await consumivel.update({ "system.quantidade": novoValor });
      return;
    }
    const novoValor = Math.max(0, Math.min(fonte.cargasMax, fonte.cargasAtual + delta));
    if (fonte.isAcao) {
      const acoes = foundry.utils.deepClone(item.system.acoes);
      acoes[fonte.acaoIndex].cargasAtual = novoValor;
      await item.update({ "system.acoes": acoes });
    } else if (fonte.isUsos) {
      const acoes = foundry.utils.deepClone(item.system.acoes);
      acoes[fonte.acaoIndex].usosAtual = novoValor;
      await item.update({ "system.acoes": acoes });
    } else if (fonte.isUsosItem) {
      await item.update({ "system.usosAtual": novoValor });
    } else if (fonte.isUsosPassiva) {
      await item.update({ "system.usosPassivaAtual": novoValor });
    } else {
      await item.update({ "system.cargasAtual": novoValor });
    }
  }

  /** Ajusta em +1/-1 a Quantidade de um Consumível direto na lista (limitado por quantidadeMax). */
  async _ajustarQuantidadeNaLista(item, delta) {
    if (!item || item.type !== "consumivel") return;
    const max = item.system.quantidadeMax ?? 0;
    const novoValor = Math.max(0, Math.min(max || Infinity, (item.system.quantidade ?? 0) + delta));
    await item.update({ "system.quantidade": novoValor });
  }

  /** @override - liga os listeners que não passam pelo sistema de "actions" (abas, drag da hotbar, seletor de Ação, e o zoom/estado da própria janela). */
  _onRender(context, options) {
    super._onRender(context, options);
    if (!this.isEditable) return;
    // Fórmulas da ficha (Vida do NPC, Estamina do Bando): botão ƒ e prévia ao vivo.
    {
      const est = this.actor._naurenEstaminaBase ?? this.actor.system?.estaminaCombate?.max ?? 0;
      const membros = Number(this.actor.getFlag?.("nauren", "bando")?.membros) || 1;
      const bandoEl = this.element.querySelector('input[name="flags.nauren.bando.estaminaFormula"]');
      if (bandoEl) bandoEl.dataset.naurenValores = JSON.stringify({ estamina: est, membros, membrosIniciais: membros });
      naurenBotoesDeFormula(this.element, { actor: this.actor, so: 'input[name="system.vidaFormula"], input[name="flags.nauren.bando.estaminaFormula"]' });
    }

    // Criador de Personagem: só personagens (não NPC), só uma vez por
    // sessão de abertura desta ficha (#criadorJaChecado evita repetir em
    // TODO re-render, já que _onRender roda de novo a cada mudança nos
    // dados). "criadorConcluido" true = nunca mais mostra nada.
    // "!criadorRespondido" = ainda não escolheu Criador/Manual, mostra o
    // popup inicial. "criadorRespondido" com uma etapa salva = escolheu
    // Criador mas fechou no meio, reabre direto na etapa onde parou.
    if (this.actor.type === "npc" && !this.#criadorJaChecado && game.user.isGM) {
      this.#criadorJaChecado = true;
      if (!this.actor.items.size && !this.actor.getFlag("nauren", "criadorRespondido") && !this.actor.pack) {
        // NPC novo: mesma janela de escolha do Criador de Personagem, com a opção extra do Criador de Monstros.
        NaurenCriadorPersonagem.mostrarEscolhaInicial(this.actor, { npc: true });
      }
    }
    if (this.actor.type === "personagem" && !this.#criadorJaChecado) {
      this.#criadorJaChecado = true;
      if (!this.actor.getFlag("nauren", "criadorConcluido")) {
        if (this.actor.items.some(i => i.type === "classe")) {
          // Já tem Classe (o último passo do criador): a criação está feita, mesmo que o criador tenha sido fechado no X.
          if (this.actor.isOwner) this.actor.setFlag("nauren", "criadorConcluido", true);
        } else if (!this.actor.getFlag("nauren", "criadorRespondido")) {
          NaurenCriadorPersonagem.mostrarEscolhaInicial(this.actor);
        }
        // Criação interrompida: NÃO reabre sozinha a cada vez que a ficha abre (era o bug de "sempre abre o criador").
        // Para continuar: botão "Reabrir o Criador" na ficha -> "Continuar de onde parou".
      }
    }

    // IMPORTANTE: _ligarAbas() precisa rodar ANTES de restaurar a rolagem -
    // ela é quem torna a aba certa visível (display:block); se a rolagem
    // for restaurada antes disso, todo mundo ainda está com display:none
    // (a marcação ".active" ainda não foi aplicada), então ".sheet-body"
    // não tem altura nenhuma pra rolar e o valor fica preso em 0.
    this._ligarAbas();
    this._ligarScrollSheetBody();

    // Permite arrastar qualquer item da ficha (arma, magia, habilidade, etc.)
    // direto pra hotbar nativa do Foundry, criando um macro que o usa do
    // jeito que está configurado (ver Hooks.on("hotbarDrop") no fim do arquivo).
    this.element.querySelectorAll('.item-entry').forEach(li => {
      li.setAttribute('draggable', 'true');
      li.addEventListener('dragstart', ev => {
        const itemId = li.dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (!item) return;
        const dragData = { type: "Item", uuid: item.uuid };
        ev.dataTransfer.setData("text/plain", JSON.stringify(dragData));
      });
    });

    // Seletor rápido de "qual Ação está ativa" direto na lista da ficha
    // principal, sem precisar abrir a ficha do item (só aparece quando o
    // item tem mais de 1 Ação - ver _prepareItemEntry/acaoOptions). É um
    // <select>, então fica de fora do sistema de "actions" (clique).
    this.element.querySelectorAll('.item-select-municao').forEach(select => {
      select.addEventListener('change', async ev => {
        ev.stopPropagation();
        const itemId = select.closest('.item-entry')?.dataset.itemId;
        const item = itemId ? this.actor.items.get(itemId) : null;
        if (item) await item.update({ "system.municaoSelecionadaId": select.value });
      });
    });
    this.element.querySelectorAll('.item-select-acao').forEach(select => {
      select.addEventListener('change', async ev => {
        ev.stopPropagation();
        const itemId = select.closest('.item-entry')?.dataset.itemId;
        const item = itemId ? this.actor.items.get(itemId) : null;
        if (!item) return;
        await item.update({ "system.acaoAtivaIndex": Number(select.value) });
      });
    });

    this._ligarBarrasRecurso();
    this._ligarReordenarItens();

    // Área de soltar Ator no vínculo de Mascote - arraste
    // o retrato/ficha de um Ator (o mascote) pra cima da caixa, mesmo
    // padrão já usado no Grupo de Jogadores.
    this.element.querySelectorAll('.nauren-mascote-dropzone').forEach(el => {
      el.addEventListener('dragover', ev => ev.preventDefault());
      el.addEventListener('drop', async ev => {
        ev.preventDefault();
        let dados;
        try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
        if (dados?.type !== "Actor" || !dados.uuid) {
          ui.notifications.warn("Arraste um Ator (a ficha ou o retrato dele) pra cima desta área.");
          return;
        }
        if (dados.uuid === this.actor.uuid) {
          ui.notifications.warn("Um personagem não pode ser Mascote de si mesmo.");
          return;
        }
        const mascote = await fromUuid(dados.uuid).catch(() => null);
        if (!mascote) { ui.notifications.warn("Não consegui encontrar esse Ator."); return; }
        const ok = await NaurenAlvoHelper.atualizarAtorSeguro(mascote, {
          "system.mascoteDeUuid": this.actor.uuid,
          "system.nivel": this.actor.system.nivel ?? 1
        });
        if (ok) {
          await naurenClamparRecursosAoMaximo(mascote);
          ui.notifications.info(`"${mascote.name}" agora é Mascote de ${this.actor.name}.`);
          this.render();
        } else {
          ui.notifications.warn(`Não consegui vincular "${mascote.name}" - ninguém online tem permissão pra editá-lo.`);
        }
      });
    });
  }

  /**
   * Clicar numa barra de recurso (Vida/Mana/Estamina de Combate/Dados de
   * Destino) entra em "modo digitar" (mostra o <input> de verdade); sair do
   * campo (blur) ou apertar Enter volta a mostrar só a barra. Clicar no
   * ícone de engrenagem NÃO entra em edição (abre o popup de cor à parte).
   */
  _ligarBarrasRecurso() {
    this.element.querySelectorAll('.nauren-barra-track[data-recurso]').forEach(track => {
      track.addEventListener('click', ev => {
        if (ev.target.closest('.nauren-barra-config')) return;
        const chave = track.dataset.recurso;
        if (this.#recursosEditando.has(chave)) return; // já editando, nada a fazer
        this.#recursosEditando.add(chave);
        this.render();
      });
    });
    this.element.querySelectorAll('.nauren-barra-input').forEach(input => {
      input.addEventListener('keydown', ev => {
        if (ev.key === "Enter") { ev.preventDefault(); input.blur(); }
        if (ev.key === "Escape") { ev.preventDefault(); input.dataset.cancelar = "1"; input.blur(); }
      });
      input.addEventListener('blur', async () => {
        const chave = input.dataset.recurso;
        this.#recursosEditando.delete(chave);

        if (input.dataset.cancelar) { this.render(); return; }

        const campo = input.dataset.campo; // ex: "vida.value" ou "recursosCustom.0.valor"
        // Recursos Customizados usam "valor" (não "value") no nome do
        // campo, seguindo a convenção em português do resto do schema deles
        // - detecta qual sufixo está em uso pra achar o campo de máximo certo.
        const sufixoAtual = campo.endsWith(".valor") ? ".valor" : ".value";
        const campoMax = campo.replace(sufixoAtual, ".max");
        const atual = foundry.utils.getProperty(this.actor.system, campo) ?? 0;
        const max = foundry.utils.getProperty(this.actor.system, campoMax);

        // "+2"/"-2" soma ou subtrai do valor atual; um número puro define o
        // valor diretamente - nos dois casos, nunca passa do máximo da barra
        // nem fica negativo.
        const texto = input.value.trim();
        let novo;
        if (/^[+-]\d+$/.test(texto)) novo = atual + Number(texto);
        else {
          const n = Number(texto);
          novo = Number.isFinite(n) ? n : atual;
        }
        novo = Math.round(novo);
        // Escudo é diferente das demais barras: "max" não é uma
        // característica fixa calculada separadamente (como Vida/Mana),
        // então digitar um valor direto redefine o MÁXIMO junto (senão
        // nunca daria pra criar um Escudo do zero - o max atual, 0,
        // travaria qualquer valor novo em 0). "+2"/"-2" continua só
        // ajustando o valor atual, sem tocar no máximo.
        if (chave === "escudo" && !/^[+-]\d+$/.test(texto)) {
          novo = Math.max(0, novo);
          if (novo === atual && novo === max) { this.render(); return; }
          await this.actor.update({ "system.escudo.value": novo, "system.escudo.max": novo });
          return;
        }
        if (Number.isFinite(max)) novo = Math.min(max, novo);
        novo = Math.max(0, novo);

        if (novo === atual) { this.render(); return; }

        // Recursos Customizados vivem dentro de um ARRAY
        // ("recursosCustom.N.valor") - atualizar um índice de array por
        // caminho pontilhado direto (ex: "system.recursosCustom.0.valor")
        // faz o Foundry SUBSTITUIR o array inteiro pelo fragmento parcial,
        // apagando id/nome/max/cores e qualquer outro recurso - por isso
        // aqui sempre reescrevemos o ARRAY COMPLETO de volta, nunca um
        // caminho direto pra dentro dele.
        const matchArray = campo.match(/^recursosCustom\.(\d+)\.valor$/);
        if (matchArray) {
          const indice = Number(matchArray[1]);
          const lista = foundry.utils.deepClone(this.actor.system.recursosCustom ?? []);
          if (lista[indice]) {
            const entrada = lista[indice];
            const valorAnterior = entrada.valor ?? 0;
            entrada.valor = novo;
            await this.actor.update({ "system.recursosCustom": lista });
            await naurenChecarCondicaoAoAtingirMax(this.actor, entrada.id, entrada, valorAnterior, novo);
          } else {
            this.render();
          }
          return;
        }

        await this.actor.update({ [`system.${campo}`]: novo });
      });
    });
    // Foca (e seleciona o texto) do campo que acabou de virar editável, pra
    // já poder digitar o número novo sem precisar clicar de novo.
    const inputEditando = this.element.querySelector('.nauren-barra-input');
    if (inputEditando) {
      inputEditando.focus();
      inputEditando.select();
    }
  }

  /**
   * Liga o arrastar-e-soltar pra reordenar itens dentro da MESMA lista
   * (mesmo tipo) na ficha do personagem - usa o campo nativo "sort" que
   * todo item já possui, sem depender de nenhum helper de ordenação do
   * Foundry (evita ficar preso a uma API que pode mudar de lugar entre
   * versões). Arrastar um item pra cima de outro insere ANTES ou DEPOIS
   * dele, dependendo de em qual metade (superior/inferior) da linha o
   * solto aconteceu. Convive sem conflito com o "dragstart" já existente
   * pra arrastar itens pra hotbar (outro listener no MESMO elemento,
   * usando uma chave diferente de dataTransfer) - múltiplos listeners no
   * mesmo elemento sempre disparam todos, "stopPropagation" só afeta a
   * propagação pra elementos ANCESTRAIS, não os outros listeners aqui.
   */
  _ligarReordenarItens() {
    this.element.querySelectorAll('.item-entry[draggable="true"], .nauren-grimorio-indice li[draggable="true"]').forEach(linha => {
      linha.addEventListener('dragstart', ev => {
        ev.stopPropagation(); // evita conflitar com outros listeners de drag (ex: hotbar) na mesma linha
        ev.dataTransfer.setData('text/nauren-reorder', linha.dataset.itemId);
        ev.dataTransfer.effectAllowed = 'move';
      });
      linha.addEventListener('dragover', ev => {
        if (!ev.dataTransfer.types.includes('text/nauren-reorder')) return;
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'move';
      });
      linha.addEventListener('drop', async ev => {
        if (!ev.dataTransfer.types.includes('text/nauren-reorder')) return; // não é um arrasto de reordenação nosso
        ev.preventDefault();
        ev.stopPropagation();
        const idArrastado = ev.dataTransfer.getData('text/nauren-reorder');
        const idAlvo = linha.dataset.itemId;
        if (!idArrastado || idArrastado === idAlvo) return;
        const rect = linha.getBoundingClientRect();
        const soltarDepois = (ev.clientY - rect.top) > rect.height / 2;
        await this._reordenarItem(idArrastado, idAlvo, soltarDepois);
      });
    });
  }

  /**
   * Reordena "idArrastado" pra ficar imediatamente antes ou depois de
   * "idAlvo" (conforme "depois"), reatribuindo o campo nativo "sort" de
   * TODOS os itens do mesmo tipo, na nova ordem - só reordena dentro do
   * mesmo tipo (uma Arma nunca se mistura com Magias, por exemplo).
   */
  async _reordenarItem(idArrastado, idAlvo, depois) {
    const itemArrastado = this.actor.items.get(idArrastado);
    const itemAlvo = this.actor.items.get(idAlvo);
    if (!itemArrastado || !itemAlvo || itemArrastado.type !== itemAlvo.type) return;
    // Magias do Grimório são mostradas pela PÁGINA (não pelo "sort"): reordenar = mudar a página.
    if (itemArrastado.type === "magia" && itemArrastado.system.ehMagiaDeMago && itemAlvo.system.ehMagiaDeMago) {
      await naurenReordenarGrimorio(this.actor, idArrastado, idAlvo, depois);
      this.render();
      return;
    }

    const mesmoTipo = this.actor.items
      .filter(i => i.type === itemArrastado.type)
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    const semArrastado = mesmoTipo.filter(i => i.id !== idArrastado);
    const indiceAlvo = semArrastado.findIndex(i => i.id === idAlvo);
    if (indiceAlvo === -1) return;
    const indiceInsercao = depois ? indiceAlvo + 1 : indiceAlvo;
    semArrastado.splice(indiceInsercao, 0, itemArrastado);

    const updates = semArrastado
      .map((item, index) => ({ _id: item.id, sort: (index + 1) * 1000 }))
      .filter(u => u.sort !== this.actor.items.get(u._id)?.sort); // só envia o que de fato mudou
    if (updates.length) await this.actor.updateEmbeddedDocuments("Item", updates);
  }

  /** Aplica manualmente qual aba fica visível (Características/Inventário/...) e guarda a escolha pra sobreviver a um re-render (ex: depois de editar um item). */
  _ligarAbas() {
    const abaSalva = this.#abaAtiva;
    this.element.querySelectorAll('.sheet-tabs .item').forEach(botao => {
      botao.classList.toggle('active', botao.dataset.tab === abaSalva);
      botao.addEventListener('click', ev => {
        ev.preventDefault();
        const aba = botao.dataset.tab;
        this.#abaAtiva = aba;
        // Trocar de aba de verdade começa do topo - só preserva a rolagem
        // quando é a MESMA aba re-renderizando (ex: editou um campo nela).
        // Com o cabeçalho já recolhido, a aba nova começa logo abaixo das abas (não volta o cabeçalho inteiro).
        const rolavel = this.element.querySelector('.main-content');
        const abas = this.element.querySelector('.main-content > .sheet-tabs');
        // Posição natural das abas = fim do que vem antes delas (o cabeçalho), medido dentro da área rolável.
        const antes = abas?.previousElementSibling;
        const topoAbas = (antes && rolavel) ? Math.max(0, Math.round(antes.getBoundingClientRect().bottom - rolavel.getBoundingClientRect().top + rolavel.scrollTop)) : 0;
        const alvoScroll = rolavel && rolavel.scrollTop > topoAbas ? topoAbas : (rolavel?.scrollTop ?? 0);
        this.#scrollSheetBody = alvoScroll;
        if (rolavel) rolavel.scrollTop = alvoScroll;
        this.element.querySelectorAll('.sheet-tabs .item').forEach(b => b.classList.toggle('active', b === botao));
        this.element.querySelectorAll('.sheet-body .tab').forEach(t => t.classList.toggle('active', t.dataset.tab === aba));
      });
    });
    this.element.querySelectorAll('.sheet-body .tab').forEach(t => t.classList.toggle('active', t.dataset.tab === abaSalva));
  }

  /**
   * Restaura manualmente a posição de rolagem de ".sheet-body" entre um
   * render e outro - o mecanismo nativo "scrollable" da própria
   * ApplicationV2 (declarado em PARTS) não estava restaurando certo pra um
   * seletor ANINHADO como este (funciona bem só quando é o elemento raiz da
   * PART inteira) - editar um campo com "submitOnChange" dispara um
   * re-render, e sem isso a rolagem sempre voltava pro topo, atrapalhando
   * mexer em várias opções seguidas.
   */
  /**
   * 0.94.29: a ficha abre num tamanho que cabe o conteúdo inteiro (cabeçalho e abas sem cortar) e respeita telas pequenas:
   * largura 860 (monstro 900), mas nunca maior que a tela; altura = tela − 80 (até 980); centralizada.
   * Se a pessoa redimensionar, vale o tamanho dela enquanto a janela estiver aberta.
   */
  _initializeApplicationOptions(options) {
    const o = super._initializeApplicationOptions?.(options) ?? options;
    if (!o?.position) return o;
    const telaL = globalThis.innerWidth || 1400, telaA = globalThis.innerHeight || 900;
    const npc = (options?.document ?? this.document)?.type === "npc";
    if (!options?.position?.width) o.position.width = Math.max(560, Math.min(npc ? 900 : 860, telaL - 40));
    if (!options?.position?.height) o.position.height = Math.max(480, Math.min(980, telaA - 80));
    if (options?.position?.left === undefined) o.position.left = Math.max(10, Math.round((telaL - o.position.width) / 2));
    if (options?.position?.top === undefined) o.position.top = Math.max(10, Math.round((telaA - o.position.height) / 2));
    return o;
  }

  _ligarScrollSheetBody() {
    // 0.93.2: a coluna da direita rola inteira (o cabeçalho sobe, as abas ficam grudadas no topo).
    const rolavel = this.element.querySelector('.main-content') ?? this.element.querySelector('.sheet-body');
    if (!rolavel) return;
    rolavel.scrollTop = this.#scrollSheetBody;
    const marcar = () => rolavel.classList.toggle("rolou", rolavel.scrollTop > 40);
    marcar();
    rolavel.addEventListener('scroll', () => {
      this.#scrollSheetBody = rolavel.scrollTop;
      marcar();
    });
    const subir = this.element.querySelector('.nauren-subir-topo');
    subir?.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); rolavel.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /** Rola um teste de Atributo ou Meta-atributo (clique no botão de dado da lista, ou no card do Meta-atributo). */
  static async onRollAttribute(event, target) {
    const key = target.dataset.attr;
    const label = target.dataset.label;
    await this._rollAttributeTest(key, label);
  }

  /** Cria um item novo do tipo pedido (data-type no botão "+ Adicionar"), com a checagem de multiclasse pra Classe. */
  static async onItemCreate(event, target) {
    const type = target.dataset.type;
    if (type === "classe" && this.actor.items.some(i => i.type === "classe")) {
      ui.notifications.warn(`${this.actor.name} já tem uma Classe — o sistema não permite multiclasse.`);
      return;
    }
    // Todo item novo (inclusive arma) nasce SEM nenhuma Ação - crie a
    // primeira manualmente com "+ Adicionar Ação" na ficha do item.
    const modelo = target.dataset.modelo === "1";
    await this.actor.createEmbeddedDocuments("Item", [{
      name: modelo ? "Nova Condição (modelo)" : `Novo(a) ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type,
      ...(modelo ? { system: { ativo: false }, flags: { nauren: { modelo: true } } } : {})
    }]);
  }

  /** Resolve o item da linha clicada (sobe até o <li class="item-entry"> mais próximo e lê data-item-id) - usado por quase toda action desta ficha. */
  static _itemDaLinha(actorSheet, target) {
    const itemId = target.closest('.item-entry')?.dataset.itemId;
    return itemId ? actorSheet.actor.items.get(itemId) : null;
  }

  static onItemEdit(event, target) {
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (item) item.sheet.render(true);
  }

  /** Duplica um item do ator, criando uma cópia independente com "(cópia)" no nome. */
  static async onItemDuplicate(event, target) {
    event.stopPropagation();
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (!item) return;
    const dados = item.toObject();
    delete dados._id;
    dados.name = `${item.name} (cópia)`;
    await this.actor.createEmbeddedDocuments("Item", [dados]);
    ui.notifications.info(`"${item.name}" duplicado.`);
  }

  /**
   * Custo pra Remover uma Condição (ver custoParaRemoverRecurso/Quantidade
   * no schema da Condição): se o item tiver essa configuração, mostra um
   * popup "Gaste X de [recurso] pra perder a condição Y" antes de deixar
   * remover/reduzir - devolve true (pode prosseguir, já descontou o
   * recurso) ou false (cancelou, não mexe em nada). Sem configuração
   * nenhuma (recurso vazio, o padrão), devolve true direto, sem popup -
   * mesmo comportamento de sempre.
   */
  async _confirmarRemocaoCondicao(item, acaoLabel) {
    // Sombra e Luz (Sacerdote): Condições causadas por ele custam +1 Estamina para remover.
    let extraSombra = 0;
    const origemCond = item.system.conjuradorUuid ? (() => { try { return fromUuidSync(item.system.conjuradorUuid); } catch (err) { return null; } })() : null;
    const atorOrigem = origemCond?.actor ?? origemCond;
    if (atorOrigem && atorOrigem !== this.actor && atorOrigem.items?.some?.(i => i.type === "habilidade" && naurenEhItem(i, "Sombra e Luz") && i.system.ativo !== false)) extraSombra = 1;
    // Condição negativa sem custo configurado: 1 de Estamina (regra da mesa).
    const negativaSemCusto = !item.system.custoParaRemoverRecurso && naurenCondicaoNegativa(item);
    const recurso = item.system.custoParaRemoverRecurso || ((extraSombra || negativaSemCusto) ? "estamina" : "");
    if (!recurso) return true;
    const quantidade = (item.system.custoParaRemoverRecurso ? Math.round(naurenInterpretarModificador(item.system.custoParaRemoverQuantidade || "1", this.actor)?.valor ?? 1) : (negativaSemCusto ? 1 : 0))
      + (recurso === "estamina" ? extraSombra : 0);
    if (quantidade <= 0) return true;
    // Valor ATUAL do recurso no Ator, pra saber se dá pra pagar (bug
    // real corrigido: antes o botão "Gastar X" sempre funcionava, mesmo
    // sem X disponível - descontava só o que tinha e removia mesmo
    // assim). "recurso" usa os nomes curtos de RECURSOS_ALVO
    // (vida/estamina/mana/destino/estresse).
    const camposFixos = { vida: "vida", mana: "mana", estamina: "estaminaCombate", destino: "dadosDestino" };
    const campoFixo = camposFixos[recurso];
    const valorAtual = recurso === "estresse" ? (this.actor.system.stress?.value ?? 0) : (this.actor.system[campoFixo]?.value ?? 0);
    const temSuficiente = recurso === "estresse" ? true : valorAtual >= quantidade; // "estresse" sempre pode subir, não bloqueia
    let escolha = null;
    const botoes = [];
    if (temSuficiente) {
      botoes.push({ label: `Gastar ${quantidade} e ${acaoLabel}`, action: "pagar", default: true, callback: () => { escolha = "pagar"; } });
    }
    // Regra da mesa: Condição negativa custa Estamina para sair. Tirar de graça é decisão do Mestre, então só ele vê o botão.
    if (game.user.isGM) botoes.push({ label: `${acaoLabel.charAt(0).toUpperCase()}${acaoLabel.slice(1)} sem gastar nada (Mestre)`, action: "gratis", default: !temSuficiente, callback: () => { escolha = "gratis"; } });
    botoes.push({ label: "Cancelar", action: "cancelar", default: !temSuficiente && !game.user.isGM });
    await foundry.applications.api.DialogV2.wait({
      window: { title: `${item.name} — remover` },
      content: `<p>${acaoLabel.charAt(0).toUpperCase()}${acaoLabel.slice(1)} a condição "${item.name}" custa <b>${quantidade} de ${naurenNomeDoRecurso(null, recurso)}</b>${!temSuficiente ? ` - você só tem ${valorAtual}, não o suficiente para pagar</p><p>Você pode remover sem pagar, ou cancelar` : ""}.</p>`,
      buttons: botoes,
      rejectClose: false
    }).catch(() => null);
    if (!escolha || escolha === "cancelar") return false;
    if (escolha === "pagar") await NaurenAlvoHelper._aplicarRecursoNoAlvo(this.actor, recurso, quantidade);
    this._ultimaRemocaoPaga = escolha === "pagar" ? { recurso, quantidade } : null;
    return true;
  }

  /** Card no chat ao remover (ou reduzir) uma Condição: o que saiu, o que custou e a Prioridade para um aliado (Cap. III, Remover Condição). */
  async _cardRemocaoCondicao(item, texto) {
    const pago = this._ultimaRemocaoPaga; this._ultimaRemocaoPaga = null;
    const linhas = [{ label: item.name, value: texto }];
    // 0.94.3: efeitos ao remover (Bomba Elétrica: arrancar explode na hora, 1d6 por turno presa).
    if (texto === "removida" && item.type === "condicao" && (item.system.efeitosAoRemover ?? []).length) {
      const ac = item.system.acumulativel ? Math.max(1, item.system.acumulos ?? 1) : 1;
      for (const ef of item.system.efeitosAoRemover) {
        try { const l = await naurenAplicarEfeitoSimples(this.actor, ef, { fonte: item.name, subst: { acumulos: ac } }); if (l) linhas.push({ label: ef.rotulo || "Ao remover", value: l }); }
        catch (err) { console.warn(`Nauren RPG | efeito ao remover "${item.name}"`, err); }
      }
    }
    if (pago?.quantidade > 0) linhas.push({ label: "Custo", value: `−${pago.quantidade} ${naurenNomeDoRecurso(null, pago.recurso)}` });
    else linhas.push({ label: "Custo", value: "sem gasto" });
    const meuToken = canvas?.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
    let prioridade = null;
    if (meuToken && game.combat?.started) {
      const selecao = naurenMontarSelecaoPrioridade(meuToken, "aliados", 1, false, [], this.actor.uuid, "PA");
      if (selecao) prioridade = { indicador: "PA", sigla: "P/A", rotulo: "Prioridade", texto: "Remover Condição concede Prioridade a um aliado: escolha quem recebe", selecao,
        contexto: { origemAtorUuid: this.actor.uuid, itemNome: `Remover Condição: ${item.name}`, motivo: "removerCondicao", indicador: "PA" } };
    }
    return naurenPostarCard({ ator: this.actor, titulo: "Remover Condição", icone: item.img, linhas, prioridade }).catch(err => console.warn("Nauren RPG | card de remoção", err));
  }

  /**
   * Custo pra Ativar um Efeito (ver custoParaAtivarEstamina no schema,
   * ex: Guardas, Guerreiro - "Ativa (1 Estamina)") - só mostra popup se o
   * Efeito tiver esse custo configurado E o jogador estiver ATIVANDO
   * (nunca ao desativar). Oferece pagar em Estamina, trocar por Espírito
   * da Batalha (se o Ator tiver a barra, mesma mecânica do popup de
   * pré-Ação), ou ativar sem gastar nada. Devolve true se deve prosseguir
   * ativando (já descontou o que precisava), false se cancelou.
   */
  async _confirmarAtivarEfeito(item, { nomeFonte = "", dentroDeAcao = false } = {}) {
    // Fora de uma Ação (ligar pela ficha), o pagamento vai num aviso próprio; dentro dela, vira linha do card da Ação.
    const registrar = (linha, aviso) => dentroDeAcao ? this.#beneficiosAtual.push(linha) : (aviso && naurenNotificarGanhoPerda(this.actor, aviso));
    if (!nomeFonte && item.system.grupoExclusivo === "guarda") nomeFonte = "Guardas";
    let custo = item.system.custoParaAtivarEstamina || 0;
    if (custo <= 0) return true;
    // Escolha já feita na janela das Guardas: sem custo pela redução (ex.: Juramento da Espada) ou pagar o custo cheio.
    const preG = this._pagamentoEfeitoPre;
    if (preG === "reducao") {
      this._pagamentoEfeitoPre = null;
      registrar({ label: "Custo para ativar", value: "sem custo", breakdown: this._fonteReducaoGuarda || "redução de custo" }, null);
      return true;
    }
    const ignorarReducoes = preG === "estamina" || preG === "espirito";
    // Reduções de custo que citam este Efeito ou a Habilidade que o ativa (ex.: Juramento da Espada → Guardas).
    const reducoes = [];
    for (const fonte of (ignorarReducoes ? [] : this.actor.items)) {
      const ativo = fonte.type === "efeito" ? !!fonte.system.ativo : (fonte.type === "condicao" || fonte.type === "habilidade") ? fonte.system.ativo !== false : false;
      if (!ativo) continue;
      for (const r of fonte.system.reduzCustoEstamina ?? []) {
        const alvoNome = String(r.soItemNome ?? "").toLowerCase();
        if (!alvoNome || r.soCura || r.soCategoriaArma) continue;
        if (!item.name.toLowerCase().includes(alvoNome) && !String(nomeFonte).toLowerCase().includes(alvoNome)) continue;
        const q = Math.max(0, Math.round(naurenAvaliarExpressaoSimples(String(r.quantidade || "0").replace(/@rank\b/gi, String(fonte.system.rankAtual ?? 0))) || 0));
        const antes = custo; custo = Math.max(Math.max(0, Number(r.minimo) || 0), custo - q);
        if (custo < antes) reducoes.push(fonte.name);
      }
    }
    if (reducoes.length) this.#beneficiosAtual?.push({ label: "Custo para ativar", value: custo > 0 ? `${custo} Estamina` : "sem custo", breakdown: reducoes.join(", ") });
    if (custo <= 0) return true;
    const espiritoInfo = this._espiritoDeBatalhaInfo();
    const podeTrocarEspirito = espiritoInfo && (espiritoInfo.usosRestantes > 0 || !this._atorEstaEmCombateAtivo()) && espiritoInfo.valorAtual >= custo;

    const botoes = [
      { label: `Gastar ${custo} de Estamina`, action: "estamina", default: true, callback: () => escolha = "estamina" }
    ];
    if (podeTrocarEspirito) {
      botoes.push({ label: `Trocar por Espírito da Batalha (${espiritoInfo.usosRestantes}/${espiritoInfo.usosMax} usos)`, action: "espirito", callback: () => escolha = "espirito" });
    }
    botoes.push({ label: "Ativar sem gastar nada", action: "gratis", callback: () => escolha = "gratis" });
    botoes.push({ label: "Cancelar", action: "cancelar" });

    let escolha = null;
    const pre = this._pagamentoEfeitoPre; this._pagamentoEfeitoPre = null;
    if (pre && (pre !== "espirito" || podeTrocarEspirito)) escolha = pre;
    else await foundry.applications.api.DialogV2.wait({
      window: { title: `${item.name} — ativar` },
      content: `<p>Ativar "${item.name}" custa <b>${custo} de Estamina</b> - como prefere pagar?</p>`,
      buttons: botoes,
      rejectClose: false
    }).catch(() => null);

    if (!escolha || escolha === "cancelar") return false;
    if (escolha === "estamina") {
      const estAtual = this.actor.system.estaminaCombate?.value ?? 0;
      if (estAtual < custo) {
        ui.notifications.warn(`Estamina insuficiente pra ativar "${item.name}" (precisa de ${custo}).`);
        return false;
      }
      await this.actor.update({ "system.estaminaCombate.value": estAtual - custo });
      registrar({ label: "Pagou", value: `${custo} Estamina` }, null);
    } else if (escolha === "espirito") {
      const recursosClonados = foundry.utils.deepClone(this.actor.system.recursosCustom ?? []);
      const entrada = recursosClonados.find(r => r.id === "espiritodabatalha");
      if (entrada) {
        const valorAntes = entrada.valor ?? 0;
        entrada.valor = Math.max(0, valorAntes - custo);
        await this.actor.update({ "system.recursosCustom": recursosClonados });
        registrar({ label: "Pagou", value: `${custo} Espírito da Batalha`, breakdown: `resta ${entrada.valor}` }, { quantidade: -custo, rotulo: "Espírito da Batalha", origemNome: item.name });
        if (entrada.valor <= 0 && valorAntes > 0) {
          const stressAtual = this.actor.system.stress?.value ?? 0;
          const stressMax = this.actor.system.stress?.max ?? 2;
          await this.actor.update({ "system.stress.value": Math.min(stressMax, stressAtual + 1) });
          registrar({ label: "Espírito da Batalha esgotado", value: "+1 Estresse" }, { quantidade: 1, rotulo: "Estresse", origemNome: "Espírito da Batalha esgotado" });
        }
      }
      const acoesEspiritoClonadas = foundry.utils.deepClone(espiritoInfo.item.system.acoes);
      // "Trocas de Espírito por Rodada" é sempre "usosReset: turno" - só
      // desconta o contador se estiver de fato em combate ativo (ver
      // _atorEstaEmCombateAtivo); fora de combate, a barra de Espírito
      // da Batalha em si ainda desconta normalmente (linha acima), só o
      // limite de "quantas vezes por turno" fica ilimitado.
      if (this._atorEstaEmCombateAtivo()) {
        acoesEspiritoClonadas[espiritoInfo.acaoIndex].usosAtual = Math.max(0, espiritoInfo.usosRestantes - 1);
        await espiritoInfo.item.update({ "system.acoes": acoesEspiritoClonadas });
      }
    }
    // "gratis" não desconta nada - só prossegue com a ativação.
    return true;
  }

  /**
   * Teste de Falha Escalonado (ver campoAcao > usaTesteDeFalhaEscalonado,
   * ex: Provação do Entrelaço, Sacerdote) - rola "dado" e considera
   * FALHA se o resultado for ≤ (valor atual do Recurso Customizado em
   * "contadorRecurso" + 1). Sem contador configurado, ou com valor 0,
   * falha só no mínimo possível daquele dado (ex: 1 em 1d6). Publica
   * um card de rolagem padrão (azul) dizendo se falhou ou não, e - se
   * "incrementaAoUsar" - soma 1 ao contador depois (respeitando o
   * próprio máximo dele, via naurenConcederRecurso). Devolve
   * {falhou, roll, limiar} pra quem chamou decidir o que fazer (ex:
   * cancelar os efeitos da Magia que pediu este teste).
   */
  async _rolarTesteFalhaEscalonado(dado, contadorRecurso, incrementaAoUsar, textoFalha, tituloCard, { zerarAoFalhar = false } = {}) {
    const formulaDado = String(dado || "1d6").trim() || "1d6";
    const maiorFace = Number((formulaDado.match(/d(\d+)/i) || [])[1]) || 6;
    const idCustom = contadorRecurso?.startsWith("recursoCustom:") ? contadorRecurso.slice(14) : null;
    const valorAtual = idCustom ? ((this.actor.system.recursosCustom ?? []).find(r => r.id === idCustom)?.valor ?? 0) : 0;
    const limiar = Math.min(valorAtual + 1, maiorFace);
    const roll = await new Roll(formulaDado).evaluate();
    if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true);
    const falhou = roll.total <= limiar;
    // 0.94.15 (Provação do Entrelaço): a magia que falha quebra a sequência - o risco volta a 1.
    const zerou = falhou && zerarAoFalhar && !!idCustom;
    if (zerou) {
      const lista = foundry.utils.deepClone(this.actor.system.recursosCustom ?? []);
      const rr = lista.find(x => x.id === idCustom);
      if (rr && (rr.valor ?? 0) !== 0) { rr.valor = 0; await this.actor.update({ "system.recursosCustom": lista }); }
    } else if (incrementaAoUsar && idCustom) {
      await naurenConcederRecurso(this.actor, contadorRecurso, "1");
    }
    const d20Result = { mode: "normal", rolls: [roll], usedIndex: 0 };
    await this._postRollCard({
      title: tituloCard || "Teste de Falha Escalonado",
      icon: "icons/commodities/biological/ear-grey-brown.webp",
      d20Result,
      secondaryLines: [
        { label: "Resultado", value: `${naurenRollToBreakdownText(roll)} = ${roll.total}` },
        { label: "Falha em", value: limiar === 1 ? "1" : `1-${limiar}` },
        { label: "Status", value: falhou ? (textoFalha || "Falhou!") : "Não falhou." },
        ...(idCustom && incrementaAoUsar ? [{ label: "Próxima vez", value: zerou ? "risco volta a 1 (a falha quebrou a sequência)" : `falha em ${Math.min(valorAtual + 2, maiorFace) === 1 ? "1" : `1-${Math.min(valorAtual + 2, maiorFace)}`}` }] : [])
      ]
    });
    return { falhou, roll, limiar };
  }

  /**
   * Penitência (ver campoAcao > usaPenitencia, ex: Palavra de Destino:
   * Sanatio, Sacerdote) - "Evitar" mostra o risco atual de falha (ver
   * _rolarTesteFalhaEscalonado); "Aceitar" mostra o custo que a
   * própria Ação já tem configurado. Devolve só a escolha
   * ("evitar"/"aceitar"/null se fechar sem escolher) - quem chama
   * decide o que fazer com ela (rolar o teste, aplicar o custo/bônus).
   */
  /**
   * Resumo (puramente informativo, sem rolar de verdade) dos blocos de
   * Dano E Cura de uma Ação, já incluindo o Bônus/Dado Extra de
   * Condições/Efeitos globais ("auto" resolvido pro maior dado da
   * fórmula BASE de cada bloco) e o Bônus Condicional ao Alvo (campo
   * "dano"/"cura", ver bonusCondicionalAoAlvoTotal). Reaproveitado tanto
   * no popup de Penitência (Sacerdote, ANTES de decidir) quanto no popup
   * de pré-Ação (ver "_popupPreAcao" mais abaixo), pra sempre mostrar a
   * MESMA prévia nos dois lugares, sem duplicar a lógica em dois pontos
   * que puderiam divergir com o tempo.
   */
  _calcularResumoDanoECura(item, acao) {
    const rankAtual = item.system.rankAtual ?? 0;
    // As janelas que aparecem antes das camadas de Subclasse (ex.: Penitência) também mostram a fórmula final.
    if (!(this.#modificadoresExternosAplicadosAtual ?? []).length) {
      const idxR = (item.system.acoes ?? []).findIndex(a => a.nome === acao.nome);
      if (idxR >= 0) {
        const modsR = this._coletarModificadoresExternos(item, idxR);
        if (modsR.length) acao = this._aplicarModificadoresExternos(acao, modsR).acao;
      }
    }
    const bonusEfeitos = this._getBonusDanoCuraDeEfeitos(item.type);
    const localBonus = this._resolverEfeitosDaAcao(acao);

    const montarResumo = (blocos, dadosEfeito, bonusEfeito, dadosLocal, bonusLocal) => (blocos ?? []).map(bloco => {
      const overrideRank = this._resolverPorRank(bloco.porRank, rankAtual);
      const formulaBruta = overrideRank ?? bloco.formula ?? "";
      const formulaBase = this._substituirAtributosNaFormula(formulaBruta, acao) || formulaBruta;
      if (!formulaBase) return "";
      const dadosResolvidos = [...dadosEfeito, ...dadosLocal]
        .map(d => d === "auto" ? this._extrairMaiorDado([formulaBase]) : d).filter(Boolean);
      const bonusTotal = (bonusEfeito || 0) + (bonusLocal || 0);
      const partesExtras = [...dadosResolvidos, bonusTotal ? String(bonusTotal) : null].filter(Boolean);
      return partesExtras.length ? `${formulaBase} + ${partesExtras.join(" + ")}` : formulaBase;
    }).filter(Boolean);

    const danosResumo = montarResumo(acao.danos, bonusEfeitos.efeitoDanoDados, bonusEfeitos.efeitoDanoBonus, localBonus.danoDados, localBonus.danoBonus);
    const curasResumo = montarResumo(acao.curas, bonusEfeitos.efeitoCuraDados, bonusEfeitos.efeitoCuraBonus, localBonus.curaDados, localBonus.curaBonus);

    let bonusDanoCondicionalResumo = 0;
    let bonusCuraCondicionalResumo = 0;
    for (const b of (this.actor.system.bonusCondicionalAoAlvoTotal ?? [])) {
      if (b.campo === "dano" && danosResumo.length && this._bonusCondicionalValeNesta(b, item, acao)) bonusDanoCondicionalResumo += this._resolverBonusCondicionalAoAlvo(b);
      if (b.campo === "cura" && curasResumo.length) bonusCuraCondicionalResumo += this._resolverBonusCondicionalAoAlvo(b);
    }

    return { danosResumo, curasResumo, bonusDanoCondicionalResumo, bonusCuraCondicionalResumo, localBonus };
  }

  async _popupPenitencia(item, acao) {
    const idCustom = acao.penitenciaTesteContadorRecurso?.startsWith("recursoCustom:") ? acao.penitenciaTesteContadorRecurso.slice(14) : null;
    const valorAtual = idCustom ? ((this.actor.system.recursosCustom ?? []).find(r => r.id === idCustom)?.valor ?? 0) : 0;
    const maiorFace = Number((String(acao.penitenciaTesteDado || "1d6").match(/d(\d+)/i) || [])[1]) || 6;
    const limiarAtual = Math.min(valorAtual + 1, maiorFace);
    const descricaoRisco = limiarAtual === 1 ? "1" : `1-${limiarAtual}`;

    const descricaoCusto = acao.penitenciaCustoRecurso
      ? `Sofre ${acao.penitenciaCustoQuantidade} de ${naurenNomeDoRecurso(null, acao.penitenciaCustoRecurso)}` : "sem custo configurado";

    // Prévia do Dano/Cura BASE desta Ação (ver "_calcularResumoDanoECura",
    // compartilhado com "_popupPreAcao" mais abaixo) e do bônus extra que
    // a Penitência concederia SE aceita agora - pra decidir já sabendo o
    // que ganha e o que perde, sem "aceitar às cegas". Bug real
    // corrigido: o popup só mostrava o CUSTO (no botão "Aceitar"), nunca
    // o bônus de dado que vem junto, nem o resumo de Dano/Cura BASE que
    // "Evitar"/"Conjurar Normal" já rolariam do mesmo jeito.
    const rankAtual = item.system.rankAtual ?? 0;
    const { danosResumo, curasResumo, bonusDanoCondicionalResumo, bonusCuraCondicionalResumo } = this._calcularResumoDanoECura(item, acao);
    const linhasResumo = [];
    if (danosResumo.length) linhasResumo.push(`Dano ${danosResumo.join(" + ")}${bonusDanoCondicionalResumo ? ` + ${bonusDanoCondicionalResumo}` : ""}`);
    if (curasResumo.length) linhasResumo.push(`Cura ${curasResumo.join(" + ")}${bonusCuraCondicionalResumo ? ` + ${bonusCuraCondicionalResumo}` : ""}`);

    // 0.94.13: a prévia mostra o bônus já com as camadas da Subclasse (ex.: Círculo da Graça).
    let acaoPen = acao;
    try { const idxP = (item.system.acoes ?? []).findIndex(a => a.nome === acao.nome); if (idxP >= 0) { const modsP = this._coletarModificadoresExternos(item, idxP); if (modsP.length) acaoPen = this._aplicarModificadoresExternos(acao, modsP).acao; } } catch (err) { acaoPen = acao; }
    const bonusDanoPenitencia = this._resolverPorRank(acaoPen.penitenciaBonusDanoDadoPorRank, rankAtual) ?? acaoPen.penitenciaBonusDanoDado;
    const bonusCuraPenitencia = this._resolverPorRank(acaoPen.penitenciaBonusCuraDadoPorRank, rankAtual) ?? acaoPen.penitenciaBonusCuraDado;
    const bonusPenitenciaTexto = [
      bonusDanoPenitencia ? `+${bonusDanoPenitencia === "auto" ? (this._extrairMaiorDado(danosResumo) || "1 dado") : bonusDanoPenitencia} de Dano` : null,
      bonusCuraPenitencia ? `+${bonusCuraPenitencia === "auto" ? (this._extrairMaiorDado(curasResumo) || "1 dado") : bonusCuraPenitencia} de Cura` : null
    ].filter(Boolean).join(" e ");

    let escolha = null;
    await foundry.applications.api.DialogV2.wait({
      window: { title: `${item.name} — Penitência` },
      content: `
        <p>Como conjurar <b>${item.name}</b>?</p>
        ${linhasResumo.length ? `<p class="item-meta-hint nauren-popup-resumo">${linhasResumo.join(" · ")}</p>` : ""}
        ${bonusPenitenciaTexto ? `<p class="item-meta-hint nauren-popup-resumo">Se aceitar a Penitência, ganha ${bonusPenitenciaTexto} nesta conjuração.</p>` : ""}
      `,
      buttons: [
        { label: `Evitar a Penitência (falha em ${descricaoRisco} no ${acao.penitenciaTesteDado || "1d6"})`, action: "evitar", callback: () => { escolha = "evitar"; } },
        { label: `Aceitar a Penitência (${descricaoCusto}${bonusPenitenciaTexto ? `, ganha ${bonusPenitenciaTexto}` : ""})`, action: "aceitar", default: true, callback: () => { escolha = "aceitar"; } }
      ],
      rejectClose: false
    }).catch(() => null);
    return escolha;
  }

  /**
   * Atacar com Arma Escolhida (ver campoAcao > usaArmaEscolhida, ex:
   * Investida, Superioridade) - mostra um popup listando cada Ação de
   * cada Arma EQUIPADA (ex: "Espada Longa — Ataque Básico"), pra escolher
   * qual delas usar. Devolve { arma, acaoDaArma } ou null se cancelar/não
   * tiver nenhuma arma equipada com Ação.
   */
  async _popupEscolherArmaEAcao(tituloHabilidade, filtros = {}) {
    const tipos = (filtros.tipos ?? []).filter(Boolean);
    const armas = this.actor.items.filter(i => i.type === "arma" && i.system.equipado && (i.system.acoes ?? []).length
      && (!tipos.length || tipos.includes(naurenCategoriaDaArma(i))));
    if (!armas.length) {
      ui.notifications.warn(`Nenhuma arma ${tipos.length ? `do tipo ${tipos.join(" ou ")} ` : ""}equipada - equipe uma antes de usar "${tituloHabilidade}".`);
      return null;
    }
    const opcoes = [];
    armas.forEach(arma => {
      arma.system.acoes.forEach((a, i) => {
        if (filtros.soAtaques && !a.ehAtaque) return;
        const ehPesado = /pesad/i.test(a.nome ?? "");
        if (filtros.qualAtaque === "pesado" && !ehPesado) return;
        if (filtros.qualAtaque === "basico" && ehPesado) return;
        opcoes.push({ armaId: arma.id, acaoIndex: i, label: `${arma.name} — ${a.nome || "Ação"}` });
      });
    });
    if (!opcoes.length) {
      ui.notifications.warn(`Nenhuma arma equipada tem ${filtros.qualAtaque === "pesado" ? "Ataque Pesado" : filtros.qualAtaque === "basico" ? "Ataque Básico" : "um ataque"} para "${tituloHabilidade}".`);
      return null;
    }
    const htmlOpcoes = opcoes.map((o, i) => `<option value="${i}">${o.label}</option>`).join("");
    let escolhaIndex = null;
    await foundry.applications.api.DialogV2.wait({
      window: { title: `${tituloHabilidade} — escolher arma e ataque` },
      content: `
        <p>Qual arma (e qual ataque dela) você quer usar?</p>
        <div class="field"><select name="armaEAcao">${htmlOpcoes}</select></div>`,
      buttons: [
        { label: "Confirmar", action: "ok", default: true, callback: (event, button, dialog) => {
          const formEl = button?.form || event?.currentTarget?.form || dialog?.element?.querySelector?.("form") || dialog?.querySelector?.("form");
          const valor = formEl?.querySelector('select[name="armaEAcao"]')?.value;
          if (valor !== undefined && valor !== null) escolhaIndex = Number(valor);
        } },
        { label: "Cancelar", action: "cancelar" }
      ],
      rejectClose: false
    }).catch(() => null);
    if (escolhaIndex === null) return null;
    const escolhida = opcoes[escolhaIndex];
    const arma = armas.find(a => a.id === escolhida.armaId);
    this.#armaEscolhidaAtual = arma;
    return { arma, acaoDaArma: arma.system.acoes[escolhida.acaoIndex] };
  }

  /**
   * Escolher uma Condição (ver campoAcao > usaCondicaoEscolhida, ex:
   * Superioridade: "Rompe Tornozelo/Rasgar/Desarmar, escolha UM") -
   * mostra um popup listando os nomes das Condições da lista de UUIDs
   * dada, devolve o UUID escolhido, ou null se cancelar.
   */
  async _popupEscolherCondicao(tituloHabilidade, uuids, rotulos = [], { opcional = false, intro = "", semCancelar = false } = {}) {
    const opcoes = [];
    for (const [k, uuid] of uuids.entries()) {
      const doc = await fromUuid(uuid).catch(() => null);
      if (!doc) continue;
      const desc = String(doc.system?.descricao ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/Automático:.*$/i, "").trim();
      opcoes.push({ uuid, nome: doc.name, rotulo: String(rotulos[k] ?? "").trim(), resumo: desc.length > 120 ? desc.slice(0, 117) + "…" : desc });
    }
    if (!opcoes.length) return null;
    const esc = foundry.utils.escapeHTML;
    const htmlOpcoes = (opcional ? `<label class="nauren-popup-opt"><input type="radio" name="condicaoEscolhida" value="nenhum" checked><span><b>Não usar</b></span></label>` : "")
      + opcoes.map((o, k) => `<label class="nauren-popup-opt"><input type="radio" name="condicaoEscolhida" value="${o.uuid}" ${k === 0 && !opcional ? "checked" : ""}>
      <span><b>${esc(o.rotulo || o.nome)}</b>${o.rotulo ? ` <em>(${esc(o.nome)})</em>` : ""}${o.resumo ? `<br><em>${esc(o.resumo)}</em>` : ""}</span></label>`).join("");
    let escolhaUuid = null;
    await foundry.applications.api.DialogV2.wait({
      window: { title: `${tituloHabilidade} — escolher efeito` }, classes: ["nauren-dialogo"], position: { width: 420 },
      content: `<p class="nauren-popup-intro">${intro || "Qual efeito você quer aplicar se o ataque acertar?"}</p><fieldset class="nauren-popup-group"><legend>Efeito</legend>${htmlOpcoes}</fieldset>`,
      buttons: [
        { label: "Confirmar", action: "ok", default: true, callback: (event, button, dialog) => {
          const formEl = button?.form || event?.currentTarget?.form || dialog?.element?.querySelector?.("form") || dialog?.querySelector?.("form");
          const valor = formEl?.querySelector('input[name="condicaoEscolhida"]:checked')?.value;
          if (valor) escolhaUuid = valor;
        } },
        ...(opcional || semCancelar ? [] : [{ label: "Cancelar", action: "cancelar" }])
      ],
      rejectClose: false
    }).catch(() => null);
    return opcional ? (escolhaUuid ?? "nenhum") : escolhaUuid;
  }

  /**
   * "Você atacou um inimigo neste turno?" (ver campoAcao >
   * usaPerguntaAtaqueNoTurno) - popup Sim/Não simples, já que o sistema
   * não rastreia automaticamente o histórico de ações do turno. Fechar
   * sem escolher (ESC) conta como "Não" (estado mais conservador).
   */
  async _popupPerguntaAtaqueNoTurno(tituloHabilidade) {
    let resposta = false;
    await foundry.applications.api.DialogV2.wait({
      window: { title: `${tituloHabilidade} — Efeito Extra` },
      content: `<p>Você realizou um ataque contra um inimigo neste turno (antes de usar esta Habilidade)?</p>`,
      buttons: [
        { label: "Sim", action: "sim", default: true, callback: () => { resposta = true; } },
        { label: "Não", action: "nao" }
      ],
      rejectClose: false
    }).catch(() => null);
    return resposta;
  }

  /**
   * "Quanto de [recurso] você quer gastar?" (ver campoAcao >
   * usaEscolhaDeRecurso, ex: Prisão das Brumas - "X alvos, sendo X o
   * número de Energia gasta") - popup com um campo numérico, limitado
   * entre "minimo" e o quanto o Ator TEM disponível agora. Devolve o
   * número escolhido, ou 0 se cancelar (o chamador decide se 0 bloqueia
   * a Ação ou não).
   */
  /** Valor atual, máximo e nome de um recurso seu (para conversões e escolhas). */
  _recursoProprio(chave) {
    const sys = this.actor.system;
    const mapa = {
      estresse: { caminho: "system.stress.value", valor: sys.stress?.value ?? 0, max: sys.stress?.max ?? 99, nome: "Estresse" },
      estamina: { caminho: "system.estaminaCombate.value", valor: sys.estaminaCombate?.value ?? 0, max: sys.estaminaCombate?.max ?? 99, nome: "Estamina" },
      // A Mana fica em system.mana (o Espírito é só o meta-atributo que dá o máximo). Antes lia system.espirito.value,
      // que não existe: toda escolha/conversão de Mana via 0 (Empoderamento Estelar, Sabedoria das Copas...).
      mana: { caminho: "system.mana.value", valor: sys.mana?.value ?? 0, max: sys.mana?.max ?? 99, nome: "Mana" },
      vida: { caminho: "system.vida.value", valor: sys.vida?.value ?? 0, max: sys.vida?.max ?? 99, nome: "Vida" },
      destino: { caminho: "system.dadosDestino.value", valor: sys.dadosDestino?.value ?? 0, max: sys.dadosDestino?.max ?? 99, nome: "Dados de Destino" }
    };
    return mapa[chave] ?? null;
  }

  async _popupEscolherQuantidadeRecurso(tituloHabilidade, recurso, minimo, limite = null, motivoLimite = "", sugerido = null) {
    const idCustom = recurso?.startsWith("recursoCustom:") ? recurso.slice(14) : null;
    const entrada = idCustom ? (this.actor.system.recursosCustom ?? []).find(r => r.id === idCustom) : null;
    const proprio = idCustom ? null : this._recursoProprio(recurso);
    const disponivelReal = proprio ? proprio.valor : (entrada?.valor ?? 0);
    const disponivel = limite !== null ? Math.min(disponivelReal, limite) : disponivelReal;
    const nomeRecurso = proprio ? proprio.nome : (entrada?.nome ?? recurso);
    if (disponivel < minimo) {
      ui.notifications.warn(`"${tituloHabilidade}" precisa de pelo menos ${minimo} de ${nomeRecurso}, que você não tem.`);
      return 0;
    }
    let escolha = 0;
    await foundry.applications.api.DialogV2.wait({
      window: { title: `${tituloHabilidade} — quanto gastar?` },
      content: `
        <p>Quanto de <b>${nomeRecurso}</b> você quer gastar? Você tem ${disponivel} disponível.</p>${disponivel < disponivelReal && motivoLimite ? `<p class="hint">${motivoLimite}.</p>` : ""}
        <div class="field"><input type="number" id="nauren-escolha-recurso-input" value="${Math.max(minimo, Math.min(disponivel, sugerido ?? minimo))}" min="${minimo}" max="${disponivel}" step="1"></div>`,
      buttons: [
        { label: "Confirmar", action: "ok", default: true, callback: (event, button, dialog) => {
          const formEl = button?.form || event?.currentTarget?.form || dialog?.element?.querySelector?.("form") || dialog?.querySelector?.("form");
          const valor = Number(formEl?.querySelector("#nauren-escolha-recurso-input")?.value);
          if (Number.isFinite(valor)) {
            if (valor > disponivel) ui.notifications.warn(disponivel < disponivelReal && motivoLimite ? `${motivoLimite} - usando ${disponivel}.` : `Você só tem ${disponivel} de ${nomeRecurso} - usando ${disponivel}.`);
            if (valor < minimo) ui.notifications.warn(`O mínimo é ${minimo} - usando ${minimo}.`);
            escolha = Math.max(minimo, Math.min(disponivel, Math.round(valor)));
          }
        } },
        { label: "Cancelar", action: "cancelar" }
      ],
      rejectClose: false
    }).catch(() => null);
    return escolha;
  }

  /**
   * "Escolher Efeito ao Usar" (ver campoAcao > escolherEfeitoUuids) -
   * mostra um botão por Efeito da lista (nome resolvido a partir do
   * UUID de origem, mesmo se for do compêndio) e devolve o UUID
   * escolhido, ou null se cancelar. Não ativa/desativa nada aqui -
   * isso é feito por "_ativarEfeitoExclusivo" depois.
   */
  async _popupEscolherEfeito(tituloHabilidade, uuids) {
    const nomes = await Promise.all(uuids.map(async uuid => {
      const doc = await fromUuid(uuid).catch(() => null);
      return { uuid, nome: doc?.name || uuid };
    }));
    // Guardas (Guerreiro): só as versões que batem com o que está empunhado (escudo, arma pesada, arma normal).
    const armasEq = this.actor.items.filter(i => i.type === "arma" && i.system.equipado);
    const temEscudo = this.actor.items.some(i => i.type === "armadura" && /escudo/i.test(String(i.system.tipo ?? "")) && i.system.equipado);
    const temPesada = armasEq.some(i => /pesad/i.test(String(i.system.categoria ?? "")));
    const temNormal = armasEq.some(i => !/pesad/i.test(String(i.system.categoria ?? "")));
    const serve = n => /\(com Escudo\)/.test(n) ? temEscudo : /\(Arma Pesada\)/.test(n) ? temPesada : /\(Arma Normal\)/.test(n) ? temNormal : true;
    const filtrados = nomes.filter(n => serve(n.nome));
    if (filtrados.length && filtrados.length < nomes.length) nomes.splice(0, nomes.length, ...filtrados);
    this._pagamentoEfeitoPre = null;
    // Guardas: uma janela só, com o que cada Guarda dá agora e a forma de pagar.
    const copias = nomes.map(n => this.actor.items.find(i => i.type === "efeito" && i.getFlag("nauren", "origemUuid") === n.uuid));
    if (copias.length && copias.every(c => c?.system.grupoExclusivo === "guarda")) return this._popupEscolherGuarda(tituloHabilidade, nomes, copias);
    let escolha = null;
    await foundry.applications.api.DialogV2.wait({
      window: { title: `${tituloHabilidade} — escolha um benefício` },
      content: `<p>Qual benefício você quer ativar? (desativa qualquer outro desta lista automaticamente)</p>`,
      buttons: [
        ...nomes.map(n => ({ label: n.nome, action: n.uuid, callback: () => { escolha = n.uuid; } })),
        { label: "Cancelar", action: "cancelar" }
      ],
      rejectClose: false
    }).catch(() => null);
    return escolha;
  }

  /** Texto curto do que um Efeito dá agora (valores já no rank atual). Ex.: "−2 dano causado · +2 Bloqueio · +5 Limiar de Deflexão". */
  _resumoModificadoresEfeito(efeito) {
    const rotulos = { danoBonus: "dano causado", bloqueio: "Bloqueio", reducaoDano: "dano sofrido (redução)", defesa: "Defesa", limiarDeflexao: "Limiar de Deflexão", ataque: "no teste de ataque", esquiva: "Esquiva", movimento: "Movimento" };
    const semPenalidade = efeito.system.grupoExclusivo === "guarda" && this.actor.items.some(i => i.type === "habilidade" && i.system.ativo !== false && naurenEhItem(i, "Estilo das Marés"));
    const partes = [];
    for (const m of efeito.system.modificadores ?? []) {
      const bruto = String(naurenResolverPorRank(m.porRank, efeito.system.rankAtual, "valor") ?? m.valor ?? "").trim();
      const n = Number(bruto);
      if (semPenalidade && (n < 0 || /^\s*-/.test(bruto))) continue;
      const rot = rotulos[m.campo] ?? m.campo;
      if (m.campo === "reducaoDano") partes.push(`−${bruto} de dano sofrido`);
      else partes.push(`${Number.isFinite(n) ? (n >= 0 ? `+${n}` : `−${Math.abs(n)}`) : bruto} ${rot}`);
    }
    return partes.join(" · ");
  }

  /** Janela das Guardas (Guerreiro): escolhe a Guarda e como pagar, numa janela só. Devolve o uuid escolhido. */
  async _popupEscolherGuarda(tituloHabilidade, nomes, copias) {
    const emCombate = this._atorEstaEmCombateAtivo();
    // Custo já com reduções (Juramento da Espada), igual ao que _confirmarAtivarEfeito cobraria.
    const custoCheio = Math.max(...copias.map(c => c.system.custoParaAtivarEstamina || 0));
    let custo = custoCheio;
    let fonteReducao = "";
    for (const fonte of this.actor.items) {
      const ativo = fonte.type === "efeito" ? !!fonte.system.ativo : (fonte.type === "condicao" || fonte.type === "habilidade") ? fonte.system.ativo !== false : false;
      if (!ativo) continue;
      for (const r of fonte.system.reduzCustoEstamina ?? []) {
        const alvo = String(r.soItemNome ?? "").toLowerCase();
        if (!alvo || r.soCura || r.soCategoriaArma || !String(tituloHabilidade).toLowerCase().includes(alvo)) continue;
        const q = Math.max(0, Math.round(naurenAvaliarExpressaoSimples(String(r.quantidade || "0")) || 0));
        if (q > 0) { custo = Math.max(Math.max(0, Number(r.minimo) || 0), custo - q); fonteReducao = fonte.name; }
      }
    }
    // Com redução (Juramento da Espada), pergunta: sem custo pela redução, ou pagar o custo cheio.
    const comReducao = custo < custoCheio;
    if (comReducao) custo = custoCheio;
    this._fonteReducaoGuarda = fonteReducao;
    const esp = this._espiritoDeBatalhaInfo();
    const est = this.actor.system.estaminaCombate?.value ?? 0;
    const podeEsp = custo > 0 && esp && (esp.usosRestantes > 0 || !emCombate) && esp.valorAtual >= custo;
    const ativa = copias.find(c => c.system.ativo);
    const juramento = this.actor.items.some(i => i.type === "condicao" && i.system.ativo !== false && naurenEhItem(i, "Juramento da Guarda"));
    const opcoes = nomes.map((n, k) => {
      const c = copias[k];
      const marcado = !ativa ? k === 0 : !c.system.ativo && k === nomes.findIndex((_, j) => !copias[j].system.ativo);
      return `<label class="nauren-popup-opt nauren-guarda-opt"><input type="radio" name="guarda" value="${n.uuid}" ${marcado ? "checked" : ""}>
        <span><b>${n.nome}</b>${c.system.ativo ? ` <em>(ativa)</em>` : ""}<br><em>${this._resumoModificadoresEfeito(c) || "—"}</em></span></label>`;
    }).join("");
    const pagar = custo <= 0
      ? `<p class="nauren-popup-nota">Sem custo.</p>`
      : `${comReducao ? `<label class="nauren-popup-opt"><input type="radio" name="pagar" value="reducao" checked><span>Sem custo <em>(${fonteReducao})</em></span></label>` : ""}
         <label class="nauren-popup-opt"><input type="radio" name="pagar" value="estamina" ${est >= custo ? (comReducao ? "" : "checked") : "disabled"}><span>${custo} de Estamina <em>(você tem ${est})</em></span></label>
         ${esp ? `<label class="nauren-popup-opt${podeEsp ? "" : " nauren-popup-opt-disabled"}"><input type="radio" name="pagar" value="espirito" ${podeEsp ? (est < custo && !comReducao ? "checked" : "") : "disabled"}><span>${custo} de Espírito da Batalha <em>(${esp.valorAtual} na barra · ${emCombate ? `${esp.usosRestantes}/${esp.usosMax} trocas nesta rodada` : "fora de combate"})</em></span></label>` : ""}
         ${comReducao ? "" : `<label class="nauren-popup-opt"><input type="radio" name="pagar" value="gratis" ${est < custo && !podeEsp ? "checked" : ""}><span>Sem custo <em>(decisão da mesa)</em></span></label>`}`;
    let escolha = null;
    await foundry.applications.api.DialogV2.wait({
      window: { title: `${tituloHabilidade} — escolher Guarda` }, classes: ["nauren-dialogo"], position: { width: 440 },
      content: `<p class="nauren-popup-intro">Só aparecem as Guardas do que você está empunhando.${juramento ? " Juramento da Guarda: a Guarda da outra postura continua ativa." : " A Guarda anterior sai sozinha."}</p>
        <fieldset class="nauren-popup-group"><legend>Guarda</legend>${opcoes}</fieldset>
        <fieldset class="nauren-popup-group"><legend>Pagar com</legend>${pagar}</fieldset>`,
      buttons: [
        { label: "Entrar em Guarda", action: "ok", default: true, callback: (event, button) => {
          const f = button.form;
          escolha = f?.querySelector("input[name=guarda]:checked")?.value ?? null;
          this._pagamentoEfeitoPre = custo <= 0 ? "gratis" : (f?.querySelector("input[name=pagar]:checked")?.value ?? "estamina");
        } },
        { label: "Cancelar", action: "cancelar" }
      ],
      rejectClose: false
    }).catch(() => null);
    return escolha;
  }

  /**
   * Ativa a cópia REAL (no Ator) do Efeito de origem "uuidEscolhido", e
   * desativa a cópia real de todos os OUTROS uuids da lista - garante
   * que nunca mais de um destes fique ativo ao mesmo tempo. Resolve a
   * cópia real do mesmo jeito que "_alvoTemCondicoes"/"_euTenhoCondicao"
   * (por "core.sourceId" ou "nauren.cadeiaRaizUuid"), não usa o item do
   * compêndio diretamente. Um uuid sem cópia encontrada no Ator é
   * ignorado silenciosamente (Efeito ainda não concedido).
   */
  async _ativarEfeitoExclusivo(uuids, uuidEscolhido, nomeFonte = "") {
    // Juramento da Guarda: uma Guarda Defensiva e uma Ofensiva ao mesmo tempo (só troca a da mesma postura).
    const postura = n => /Defensiva/i.test(n) ? "def" : /Ofensiva/i.test(n) ? "of" : "";
    const juramentoGuarda = this.actor.items.some(i => i.type === "condicao" && i.system.ativo !== false && naurenEhItem(i, "Juramento da Guarda"));
    const escolhido = this.actor.items.find(i => i.type === "efeito" && i.getFlag("nauren", "origemUuid") === uuidEscolhido);
    if (!escolhido) { ui.notifications.warn(`${nomeFonte || "Efeito"}: este benefício ainda não está na sua ficha.`); return; }
    if (escolhido.system.ativo) { this.#beneficiosAtual.push({ label: "Já estava ativo", value: escolhido.name }); return; }
    const pode = (escolhido.system.custoParaAtivarEstamina > 0) ? await this._confirmarAtivarEfeito(escolhido, { nomeFonte, dentroDeAcao: true }) : true;
    if (!pode) return;
    const desativados = [];
    for (const uuid of uuids) {
      if (uuid === uuidEscolhido) continue;
      const item = this.actor.items.find(i => i.type === "efeito" && i.getFlag("nauren", "origemUuid") === uuid);
      if (!item?.system.ativo) continue;
      if (juramentoGuarda && postura(item.name) && postura(item.name) !== postura(escolhido.name)) continue;
      await item.update({ "system.ativo": false });
      desativados.push(item.name);
    }
    await escolhido.update({ "system.ativo": true });
    this.#beneficiosAtual.push({ label: "Ativou", value: escolhido.name, breakdown: desativados.length ? `substitui ${desativados.join(", ")}` : (juramentoGuarda ? "Juramento da Guarda: a outra postura continua" : "") });
  }

  static async onItemDelete(event, target) {
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (!item) return;
    if (item.type === "condicao") {
      const pode = await this._confirmarRemocaoCondicao(item, "remover");
      if (!pode) return;
      const ehModelo = naurenEhCondicaoModelo(item);
      await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
      if (!ehModelo && item.system.ativo !== false) this._cardRemocaoCondicao(item, "removida");
      return;
    }
    this.actor.deleteEmbeddedDocuments("Item", [item.id]);
  }

  /** Painel Estudos: +/- acúmulos de um tipo num alvo. */
  static async onEstudoAjustar(event, target) {
    const alvo = await fromUuid(target.dataset.alvo).catch(() => null);
    const tipo = naurenTiposEstudoDoAtor(this.actor).find(t => t.chave === target.dataset.chave);
    if (!alvo || !tipo) return;
    const marca = naurenEstudoNoAlvo(alvo, this.actor);
    const atual = marca?.getFlag("nauren", "estudo")?.tipos?.[tipo.chave]?.acumulos ?? 0;
    const max = Number(tipo.tipo.maxAcumulos) || 99;
    const novo = Math.max(0, Math.min(max, atual + Number(target.dataset.delta)));
    if (novo === atual) { if (novo >= max) ui.notifications.info(`${tipo.tipo.nome}: já no máximo (${max}).`); return; }
    await naurenOperarEstudo(alvo, { operacao: "acumulos", dono: { uuid: this.actor.uuid, nome: this.actor.name }, chave: tipo.chave, nome: tipo.tipo.nome, valor: novo, max });
    this.render();
  }
  /** Painel Estudos: +/- no total de informações sobre um alvo. */
  static async onEstudoInformacoes(event, target) {
    const alvo = await fromUuid(target.dataset.alvo).catch(() => null);
    if (!alvo) return;
    const r = await naurenOperarEstudo(alvo, { operacao: "informacoes", dono: { uuid: this.actor.uuid, nome: this.actor.name }, valor: Number(target.dataset.delta) });
    if (r) await naurenSincronizarCriativasDoLadino(this.actor, alvo.uuid, r.informacoes ?? 0);
    this.render();
  }
  /** Painel Marcas: troca o benefício gravado na marca. */
  static async onMarcaBeneficio(event, target) {
    const marca = await fromUuid(target.dataset.item).catch(() => null);
    if (!marca) return;
    await naurenAtualizarItemViaMestre(marca, { "flags.nauren.beneficioMarca": target.dataset.beneficio });
    setTimeout(() => this.render(), 300);
  }
  /** Painel Marcas: remove a marca do alvo. */
  static async onMarcaRemover(event, target) {
    const marca = await fromUuid(target.dataset.item).catch(() => null);
    if (!marca) return;
    const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: "Remover marca" }, content: `<p>Remover <b>${marca.name}</b> de <b>${marca.parent?.name}</b>?</p>`, rejectClose: false }).catch(() => false);
    if (!ok) return;
    if (marca.isOwner) await marca.delete();
    else await game.users.activeGM?.query(NAUREN_QUERY_ITEM_MESTRE, { tipo: "apagarItem", itemUuid: marca.uuid }, { timeout: 15000 }).catch(() => null);
    setTimeout(() => this.render(), 300);
  }
  /** Grimório: virar/voltar a página (usa a Ação do Grimório: custo e Prioridade). */
  static async onGrimorioVirar(event, target) {
    const item = this.actor.items.get(target.dataset.item);
    if (!item) return;
    const idx = (item.system.acoes ?? []).findIndex(a => a.virarPagina === Number(target.dataset.direcao));
    if (idx >= 0) await this._executarAcao(item, idx);
  }
  /** Callux Andaris: meditar 1 hora libera rank trocas de posição. */
  static async onGrimorioMeditar(event, target) {
    const callux = this.actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Callux Andaris") && i.system.ativo !== false);
    if (!callux) return;
    if (game.combat?.started) { ui.notifications.warn("Callux Andaris: medite fora de combate (1 hora)."); return; }
    const trocas = Math.max(1, callux.system.rankAtual || 1);
    await this.actor.setFlag("nauren", "calluxTrocas", trocas);
    naurenPostarCard({ ator: this.actor, titulo: "Callux Andaris", icone: callux.img, fonte: "Meditação (1 hora)", linhas: [{ label: "Pode inverter", value: `${trocas} par(es) de magias no Grimório` }] });
    this.render();
  }
  /** Páginas em Chamas: queimar uma página (some até o fim do combate) para recuperar o uso. */
  static async onGrimorioQueimar(event, target) {
    if (!game.combat?.started) { ui.notifications.warn("Páginas em Chamas: só em combate."); return; }
    if (this.actor.getFlag("nauren", "paginasEmChamas") !== game.combat.id) { ui.notifications.info("Páginas em Chamas: o uso deste combate ainda está disponível."); return; }
    const magia = this.actor.items.get(target.dataset.id);
    const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: "Páginas em Chamas" },
      content: `<p>Queimar a página <b>${magia?.name}</b>? Ela fica indisponível até o fim do combate, e o próximo Condensar volta a sair sem Estamina.</p>`,
      yes: { label: "Queimar" }, no: { label: "Cancelar" }, rejectClose: false }).catch(() => false);
    if (!ok) return;
    const atual = this.actor.getFlag("nauren", "paginasQueimadas");
    const ids = atual?.combate === game.combat.id ? [...(atual.ids ?? [])] : [];
    ids.push(target.dataset.id);
    await this.actor.setFlag("nauren", "paginasQueimadas", { combate: game.combat.id, ids });
    await this.actor.unsetFlag("nauren", "paginasEmChamas");
    await this.actor.updateEmbeddedDocuments("Item", [{ _id: target.dataset.id, "system.paginaAberta": false }]);
    await naurenSincronizarGrimorio(this.actor);
    naurenPostarCard({ ator: this.actor, titulo: "Páginas em Chamas", icone: magia?.img, fonte: "Grimório", linhas: [{ label: "Queimou a página", value: magia?.name ?? "", breakdown: "indisponível até o fim do combate • Condensar sem Estamina de novo" }] });
    this.render();
  }
  /** Marcador de Página: marca (ou desmarca) uma página. */
  static async onGrimorioMarcar(event, target) {
    const atual = this.actor.getFlag("nauren", "marcadorPagina");
    await this.actor.setFlag("nauren", "marcadorPagina", atual === target.dataset.id ? null : target.dataset.id);
    this.render();
  }
  /** Aspectus Sternvaloir: liga/desliga a estrela (conjurar sem a página aberta). */
  static async onGrimorioAspectus(event, target) {
    const aspectus = this.actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Aspectus Sternvaloir") && i.system.ativo !== false);
    if (!aspectus) return;
    const lista = [...(this.actor.getFlag("nauren", "aspectus") ?? [])];
    const k = lista.indexOf(target.dataset.id);
    if (k >= 0) lista.splice(k, 1);
    else {
      const limite = Math.max(1, aspectus.system.rankAtual || 1);
      if (lista.length >= limite) { ui.notifications.warn(`Aspectus Sternvaloir: até ${limite} magia(s) no seu rank.`); return; }
      lista.push(target.dataset.id);
    }
    await this.actor.setFlag("nauren", "aspectus", lista);
    await naurenSincronizarGrimorio(this.actor);
    this.render();
  }
  /** Callux Andaris: trocar uma magia de posição (gasta uma troca). */
  static async onGrimorioMover(event, target) {
    const trocasC = this.actor.getFlag("nauren", "calluxTrocas") ?? 0;
    if (trocasC <= 0) { ui.notifications.warn("Callux Andaris: medite 1 hora (fora de combate) para poder inverter magias."); return; }
    const g = naurenGrimorio(this.actor);
    const pos = g.paginas.findIndex(m => m.id === target.dataset.id);
    const outro = pos + Number(target.dataset.delta);
    if (pos < 0 || outro < 0 || outro >= g.paginas.length) return;
    const ordem = [...g.paginas];
    [ordem[pos], ordem[outro]] = [ordem[outro], ordem[pos]];
    await this.actor.updateEmbeddedDocuments("Item", ordem.map((m, i) => ({ _id: m.id, "system.paginaGrimorio": i + 1 })));
    await this.actor.setFlag("nauren", "calluxTrocas", trocasC - 1);
    await naurenSincronizarGrimorio(this.actor);
    this.render();
  }

  /** Tudo é Meu!: guarda o último d20 de um aliado para usar depois. */
  static async onRoubarD20(event, target) {
    const hab = this.actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Tudo é Meu!"));
    if (!hab) return;
    if (!naurenUsoDisponivel(hab)) { ui.notifications.warn("Tudo é Meu!: já usado neste combate."); return; }
    const meuTok = this.actor.getActiveTokens?.(true)?.[0];
    const opcoes = [];
    for (const t of canvas?.tokens?.placeables ?? []) {
      const a = t.actor;
      if (!a || a === this.actor || t.document.disposition !== meuTok?.document?.disposition) continue;
      const ult = a.getFlag("nauren", "ultimoD20");
      if (ult?.face) opcoes.push({ action: t.id, label: `${t.document.name}: ${ult.face}${ult.rotulo ? ` (${ult.rotulo})` : ""}`, face: ult.face, de: t.document.name });
    }
    if (!opcoes.length) { ui.notifications.warn("Tudo é Meu!: nenhum aliado rolou um d20 ainda."); return; }
    const escolha = await foundry.applications.api.DialogV2.wait({
      window: { title: "Tudo é Meu! — roubar um d20" },
      content: "<p>Qual d20 de aliado você rouba? Ele fica guardado até você usá-lo numa rolagem sua (aparece na janela de rerolar).</p>",
      buttons: [...opcoes.map(o => ({ action: o.action, label: o.label })), { action: "cancelar", label: "Cancelar" }],
      rejectClose: false
    }).catch(() => "cancelar");
    const o = opcoes.find(x => x.action === escolha);
    if (!o) return;
    await naurenGuardarD20Roubado(this.actor, o.face, o.de);
    this.render();
  }

  /** Painel Análises: tirar uma análise criativa (e a Condição "Eu estou acima" correspondente). */
  static async onEstudoRemoverCriativa(event, target) {
    const alvo = await fromUuid(target.dataset.alvo).catch(() => null);
    if (!alvo) return;
    const chave = target.dataset.chave;
    await naurenOperarEstudo(alvo, { operacao: "removerCriativa", dono: { uuid: this.actor.uuid, nome: this.actor.name }, chave });
    const minhas = this.actor.items.filter(i => i.type === "condicao" && i.getFlag("nauren", "analiseCriativa")?.alvoUuid === alvo.uuid && i.getFlag("nauren", "analiseCriativa")?.chave === chave);
    if (minhas.length) await this.actor.deleteEmbeddedDocuments("Item", minhas.map(i => i.id)).catch(() => {});
    this.render();
  }

  /** Painel Estudos: esquecer um alvo (apaga a sua marca nele). */
  static async onEstudoRemover(event, target) {
    const alvo = await fromUuid(target.dataset.alvo).catch(() => null);
    if (!alvo) return;
    await naurenOperarEstudo(alvo, { operacao: "remover", dono: { uuid: this.actor.uuid, nome: this.actor.name } });
    const minhas = this.actor.items.filter(i => i.type === "condicao" && i.getFlag("nauren", "analiseCriativa")?.alvoUuid === alvo.uuid);
    if (minhas.length) await this.actor.deleteEmbeddedDocuments("Item", minhas.map(i => i.id)).catch(() => {});
    this.render();
  }

  static async onItemUse(event, target) {
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (item) await this._useItem(item);
  }

  static async onItemToggleAtivo(event, target) {
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (!item) return;
    const vaiAtivar = !item.system.ativo;
    if (vaiAtivar && item.type === "efeito" && item.system.custoParaAtivarEstamina > 0) {
      const pode = await this._confirmarAtivarEfeito(item);
      if (!pode) return;
    }
    await item.update({ "system.ativo": vaiAtivar });
  }

  static async onItemRollEfeito(event, target) {
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (item) await this._rollEfeitoIsolado(item);
  }

  /** Expande/recolhe a descrição de um item direto na linha da lista (funciona em qualquer lista - Habilidades, Armas, Efeitos, Condições, etc.). */
  static async onItemToggleDescricao(event, target) {
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (!item) return;
    if (this.#itensDescricaoExpandida.has(item.id)) this.#itensDescricaoExpandida.delete(item.id);
    else this.#itensDescricaoExpandida.add(item.id);
    this.render();
  }

  /** Posta a descrição de um item da lista no chat - ver naurenPostarDescricaoNoChat. */
  static async onItemPostarDescricaoNoChat(event, target) {
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (item) await naurenPostarDescricaoNoChat(item);
  }

  static async onItemEquip(event, target) {
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (item) await this._toggleEquip(item);
  }

  /**
   * Grimório do Mago - marca/desmarca uma Magia como "na página aberta"
   * (ver "paginaAberta" em NaurenMagiaData). Mesmo padrão simples de
   * "_toggleEquip" (Armas/Armaduras) - sem limite de quantas Magias
   * podem estar marcadas ao mesmo tempo, de propósito (ver Habilidade
   * "Grimório do Mago").
   */
  static async onItemTogglePaginaAberta(event, target) {
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (!item) return;
    if (item.system.ehMagiaDeMago) { ui.notifications.info("Magias de Mago: as páginas abertas seguem o Grimório (aba Magias → painel Grimório)."); return; }
    const novoEstado = !item.system.paginaAberta;
    await item.update({ "system.paginaAberta": novoEstado });
  }

  static async onChargeMinus(event, target) {
    event.stopPropagation();
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (item) await this._ajustarCargaNaLista(item, -1);
  }

  static async onChargePlus(event, target) {
    event.stopPropagation();
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (item) await this._ajustarCargaNaLista(item, 1);
  }

  static async onQtyMinus(event, target) {
    event.stopPropagation();
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (item) await this._ajustarQuantidadeNaLista(item, -1);
  }

  static async onQtyPlus(event, target) {
    event.stopPropagation();
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (item) await this._ajustarQuantidadeNaLista(item, 1);
  }

  /** +/- acúmulos de uma Condição direto na lista (ajuste manual rápido). A sincronização do ícone no token acontece sozinha via hook updateItem. */
  static async onCondAjustar(event, target) {
    event.stopPropagation();
    const item = NaurenActorSheet._itemDaLinha(this, target);
    if (!item || (item.type !== "condicao" && item.type !== "efeito")) return;
    const delta = Number(target.dataset.delta) || 0;
    const atual = item.system.acumulos ?? 1;
    // Custo pra Remover (ver _confirmarRemocaoCondicao) - só entra em
    // jogo quando está REDUZINDO (delta < 0), seja a redução que remove
    // o item inteiro ou uma que só tira 1 acúmulo e mantém o resto.
    // 0.94.3: Condição com "efeitos ao remover" (Bomba Elétrica) sai inteira de uma vez.
    const sairInteira = delta < 0 && item.type === "condicao" && (item.system.efeitosAoRemover ?? []).length > 0;
    if (delta < 0 && item.type === "condicao") {
      const vaiRemoverTudo = atual <= 1 || sairInteira;
      const pode = await this._confirmarRemocaoCondicao(item, vaiRemoverTudo ? "remover" : "perder 1 acúmulo de");
      if (!pode) return;
    }
    // Qualidade de vida: já em 1 acúmulo e clicou "-" (tiraria pra 0, que o
    // clamp de baixo nunca deixava acontecer) - remove a Condição/Efeito
    // inteiro, em vez de só travar em 1 sem fazer nada (antes só dava pra
    // remover pela lixeira, um clique a mais e num lugar menos óbvio).
    if (delta < 0 && (atual <= 1 || sairInteira)) {
      await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
      if (item.type === "condicao" && !naurenEhCondicaoModelo(item)) this._cardRemocaoCondicao(item, "removida");
      return;
    }
    if (delta < 0 && item.type === "condicao" && !naurenEhCondicaoModelo(item)) this._cardRemocaoCondicao(item, `−1 acúmulo (fica com ${atual - 1})`);
    const novo = Math.max(1, Math.min(item.system.acumulosMax || 99, atual + delta));
    if (novo !== atual) {
      await item.update({ "system.acumulos": novo });
      if (delta > 0 && item.type === "condicao") {
        await naurenChecarLimiarEvolucao(item);
        await naurenChecarLimiarEfeitoDireto(item, this.actor, atual, novo);
      }
    }
  }

  static async onDescansar(event, target) {
    await naurenRecarregarUsos(this.actor, "dia");
    ui.notifications.info(`${this.actor.name} descansou — usos diários recarregados.`);
  }

  /**
   * Botão manual "Ressincronizar com o Compêndio" (aba Opções) - faz TRÊS
   * coisas em sequência:
   * 1) naurenReconciliarTodosOsItens: atualiza cada item da ficha (vindo
   *    de Classe/Subclasse/Nível) pra versão mais atual do compêndio -
   *    pega correções/Gatilhos/Efeitos novos adicionados a uma Habilidade
   *    DEPOIS que ela já tinha sido concedida a este personagem, sem
   *    precisar remover e "jogar" a Classe/Subclasse de novo. Preserva
   *    rank investido, ativo/inativo, usos já gastos (ver
   *    NAUREN_CAMPOS_ESTADO_ITEM/NAUREN_CAMPOS_ESTADO_ACAO).
   * 2) Reaplica todos os níveis já alcançados de cada Classe na ficha -
   *    bug real corrigido: "itensConcedidos" (ou "upgradesDeRank") ADICIONADO
   *    a um nível que o personagem já tinha alcançado (ex: dois novos
   *    Efeitos entrando no nível 1 de Análise Paciente, numa correção
   *    posterior) nunca era concedido de verdade pra quem não subisse de
   *    nível de novo - "aplicarAteNivel" só rodava ao arrastar a Classe
   *    pela primeira vez ou ao mudar de nível. "concederItem" já dedupe
   *    por item específico (não por nível), então rodar de novo aqui é
   *    seguro e não duplica nada já concedido.
   * 3) naurenSincronizarRecursosCustom: existia sozinho antes - corrige
   *    retroativamente fichas que já tinham uma Habilidade com
   *    "recursosDeclarados" criada ANTES do hook de createItem/updateItem
   *    passar a cobrir itens do tipo "habilidade" também (só cobria
   *    Classe/Subclasse até essa correção) - a barra nunca aparecia
   *    sozinha até o jogador subir ou descer de nível pelo menos 1 vez.
   * Seguro de clicar a qualquer momento, mesmo sem nada pra corrigir (não
   * muda nada se já estiver tudo em dia).
   */
  static async onRessincronizarRecursosCustom(event, target) {
    const itensAtualizados = await naurenReconciliarTodosOsItens(this.actor);
    for (const classeItem of this.actor.items.filter(i => i.type === "classe")) {
      await NaurenProgressaoHelper.aplicarAteNivel(this.actor, classeItem, this.actor.system.nivel || 1);
    }
    await naurenReaplicarUpgradesDeSubclasse(this.actor);
    await naurenSincronizarRecursosCustom(this.actor);
    ui.notifications.info(`${this.actor.name} — ${itensAtualizados} ite${itensAtualizados === 1 ? "m atualizado" : "ns atualizados"} com o compêndio, níveis reaplicados, upgrades de Subclasse reaplicados, Recursos Customizados ressincronizados.`);
  }

  static async onSubirNivel(event, target) {
    await this._subirDeNivel();
  }

  /** Abre/fecha a seção "Escala por Nível" na aba Opções (mesmo padrão de onToggleReferenciaFormulas). */
  static async onToggleEscalaPorNivel(event, target) {
    this.#escalaPorNivelAberta = !this.#escalaPorNivelAberta;
    this.render();
  }

  /**
   * Liga/desliga "system.usaEscalaPorNivel" - ÍCONE clicável em vez de
   * <input type="checkbox"> de propósito (mesmo motivo documentado em
   * ".nauren-subclasse-toggle-icone" no CSS: o tema padrão do Foundry
   * desenha um "::before" decorativo por baixo do checkbox nativo em
   * alguns contextos, e nada no CSS consegue remover só ELE sem também
   * sumir com o checkbox de verdade - um ícone clicável comum evita o
   * problema de vez).
   */
  static async onToggleUsaEscalaPorNivel(event, target) {
    await this.actor.update({ "system.usaEscalaPorNivel": !this.actor.system.usaEscalaPorNivel });
  }

  /** Liga/desliga "system.usaModoMira" - mesmo padrão de ícone clicável de onToggleUsaEscalaPorNivel (mesmo motivo). */
  static async onToggleUsaModoMira(event, target) {
    await this.actor.update({ "system.usaModoMira": !this.actor.system.usaModoMira });
  }

  /** Lê o <select> vizinho (não vinculado por "name=", só usado na hora de adicionar) e cria uma entrada nova em "escalaAtributos" com esse atributo, tabela vazia. */
  static async onAddEscalaAtributo(event, target) {
    const select = this.element.querySelector(".nauren-select-novo-atributo-escala");
    const atributo = select?.value;
    if (!atributo) return;
    await this._enfileirarArray("escalaAtributos", lista => {
      lista.push({ atributo, tabela: [] });
    });
    this.#escalaAtributosExpandidos.add(atributo); // já abre expandido, economiza 1 clique
  }

  static async onRemoveEscalaAtributo(event, target) {
    const index = Number(target.dataset.index);
    const entrada = this.actor.system.escalaAtributos?.[index];
    if (entrada) this.#escalaAtributosExpandidos.delete(entrada.atributo);
    await this._enfileirarArray("escalaAtributos", lista => {
      lista.splice(index, 1);
    });
  }

  static async onToggleEscalaAtributoExpandido(event, target) {
    const attr = target.dataset.atributo;
    if (!attr) return;
    if (this.#escalaAtributosExpandidos.has(attr)) this.#escalaAtributosExpandidos.delete(attr);
    else this.#escalaAtributosExpandidos.add(attr);
    this.render();
  }

  /** Adiciona uma linha em branco na tabela PRÓPRIA de um atributo específico (data-index diz qual entrada de "escalaAtributos"). */
  static async onAddEscalaAtributoLinha(event, target) {
    const index = Number(target.dataset.index);
    await this._enfileirarArray("escalaAtributos", lista => {
      if (!lista[index]) return;
      lista[index].tabela ??= [];
      lista[index].tabela.push({ nivelMinimo: 1, valor: 1 });
    });
  }

  static async onRemoveEscalaAtributoLinha(event, target) {
    const index = Number(target.dataset.index);
    const linha = Number(target.dataset.linha);
    await this._enfileirarArray("escalaAtributos", lista => {
      if (!lista[index]?.tabela) return;
      lista[index].tabela.splice(linha, 1);
    });
  }

  /** Alterna entre Modo Jogo (valores finais, quadrado apagado) e Modo Edição (campos editáveis + detalhamento de bônus) pra Estamina/Defesa/Movimento/Atributos. */
  static async onToggleModoFicha(event, target) {
    this.#modoFichaEdicao = !this.#modoFichaEdicao;
    this.render();
  }

  /**
   * Botão "Criador de Personagem" (só visível em Modo Ficha Edição) -
   * pergunta se quer resetar a ficha do zero ou continuar editando a
   * ficha como está, e reabre o assistente guiado nos dois casos.
   */
  /** NPC: abre o Criador de Monstros. Ficha vazia é preenchida; ficha com itens pergunta antes de substituir. */
  static async onAbrirCriadorMonstro(event, target) {
    const actor = this.actor;
    if (actor.items.size) {
      const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: "Criador de Monstros" },
        content: `<p>Esta ficha já tem ${actor.items.size} item(ns). O Criador <b>substitui</b> os itens e os atributos de "${actor.name}" ao criar. Continuar?</p>`, rejectClose: false }).catch(() => false);
      if (!ok) return;
    }
    NaurenCriadorMonstro.abrir(actor);
  }

  /** Abre a escolha dos recursos do HUD de Combate. */
  static async onAbrirRecursosHud(event, target) { NaurenHudRecursosEditor.abrir(this.actor); }

  /** Abre o editor das barras do token (ver HUD nativo, no fim do arquivo). */
  static async onAbrirBarrasToken(event, target) {
    let podeJogador = true; try { podeJogador = game.settings.get("nauren", "jogadoresEditamBarras"); } catch (err) { podeJogador = true; }
    if (!game.user.isGM && !podeJogador) { ui.notifications.warn("O Mestre desligou a edição das barras pelos jogadores."); return; }
    NaurenBarrasEditor.abrir(this.actor, this.token ?? null);
  }

  static async onReabrirCriador(event, target) {
    const actor = this.actor;
    let escolha = null;
    await foundry.applications.api.DialogV2.wait({
      window: { title: `${actor.name} — reabrir o Criador de Personagem` },
      content: `<p class="item-meta-hint">Como você quer continuar?</p>`,
      buttons: [
        ...(!actor.getFlag("nauren", "criadorConcluido") && (actor.getFlag("nauren", "criadorEtapa") ?? 0) > 0
          ? [{ label: `Continuar de onde parou (${Math.min((actor.getFlag("nauren", "criadorEtapa") ?? 0), NAUREN_CRIADOR_ETAPAS.length) >= NAUREN_CRIADOR_ETAPAS.length ? "resumo" : "etapa " + ((actor.getFlag("nauren", "criadorEtapa") ?? 0) + 1)})`, action: "continuar", default: true, callback: () => { escolha = "continuar"; } }] : []),
        { label: "Resetar Ficha e começar do zero", action: "resetar", callback: () => { escolha = "resetar"; } },
        { label: "Editar a ficha como está", action: "editar", callback: () => { escolha = "editar"; } }
      ],
      rejectClose: false
    }).catch(() => null);

    if (!escolha) return;
    if (escolha === "continuar") { new NaurenCriadorPersonagem({ actor }).render(true); return; }

    if (escolha === "resetar") {
      const idsParaRemover = actor.items.map(i => i.id);
      if (idsParaRemover.length) await actor.deleteEmbeddedDocuments("Item", idsParaRemover);
      await actor.update({
        "system.atributos.forca.value": 0,
        "system.atributos.agilidade.value": 0,
        "system.atributos.estamina.value": 0,
        "system.atributos.inteligencia.value": 0,
        "system.atributos.destino.value": 0,
        "system.nivel": 1,
        "system.xp": 0
      });
      // Começar do zero: os 5 dados de atributo podem ser rolados de novo - mas o registro guarda os antigos.
      const apagados = (actor.getFlag("nauren", "criadorDadosAtributos") ?? []).filter(v => v !== null && v !== undefined);
      if (apagados.length) await naurenAnotarNoRegistro(actor, { tipo: "reset", dados: { dadosApagados: apagados },
        linhas: [{ label: "Dados apagados", value: apagados.join(", "), breakdown: "a ficha foi resetada no Criador; os dados podem ser rolados de novo" }] }).catch(err => console.warn("Nauren RPG | Registro de rolagens (reset)", err));
      await actor.unsetFlag("nauren", "criadorDadosAtributos");
      for (const app of foundry.applications.instances.values()) {
        if (app instanceof NaurenCriadorPersonagem && app.actor === actor) { app._atributosDigitados = null; app._sorteioPeculiaridade = null; }
      }
    }

    await actor.unsetFlag("nauren", "criadorConcluido");
    await actor.unsetFlag("nauren", "criadorClasseSelecionada");
    await actor.setFlag("nauren", "criadorEtapa", 0);
    new NaurenCriadorPersonagem({ actor }).render(true);
  }

  /**
   * Abre um popup pra customizar as duas cores do degradê de uma barra de
   * recurso (só aparece em Modo Edição). Lê o formulário direto do DOM no
   * callback (mesmo padrão robusto já usado no popup de reação, ver
   * NaurenAlvoHelper._popupReacao) em vez de depender do valor de retorno
   * de DialogV2.wait, cuja propagação exata pode variar entre builds.
   */
  static async onConfigurarBarra(event, target) {
    const chave = target.dataset.recurso;
    if (!chave) return;
    const cores = this.actor.system.corBarra?.[chave] ?? {};
    const padrao = NAUREN_BARRA_CORES_PADRAO[chave];
    const cor1Atual = cores.cor1 || padrao.cor1;
    const cor2Atual = cores.cor2 || padrao.cor2;

    let dados = null;
    await foundry.applications.api.DialogV2.wait({
      window: { title: "Customizar cor da barra" },
      content: `
        <div class="nauren-sheet" style="padding: 4px 2px;">
          <div class="field-grid cols-2">
            <div class="field"><label>Cor inicial</label><input type="color" name="cor1" value="${cor1Atual}"></div>
            <div class="field"><label>Cor final</label><input type="color" name="cor2" value="${cor2Atual}"></div>
          </div>
        </div>
      `,
      buttons: [
        {
          label: "Salvar", action: "salvar", default: true,
          callback: (ev, button, dialog) => {
            try {
              const formEl = button?.form || ev?.currentTarget?.form || dialog?.element?.querySelector?.("form") || dialog?.querySelector?.("form");
              if (!formEl) return;
              dados = {
                cor1: formEl.querySelector('input[name="cor1"]')?.value || cor1Atual,
                cor2: formEl.querySelector('input[name="cor2"]')?.value || cor2Atual
              };
            } catch (err) {
              console.warn("Nauren RPG | Não consegui ler as cores escolhidas.", err);
            }
          }
        },
        { label: "Restaurar padrão", action: "restaurar", callback: () => { dados = { restaurar: true }; } },
        { label: "Cancelar", action: "cancelar" }
      ],
      rejectClose: false
    });

    if (!dados) return;
    if (dados.restaurar) {
      await this.actor.update({ [`system.corBarra.${chave}.cor1`]: "", [`system.corBarra.${chave}.cor2`]: "" });
    } else {
      await this.actor.update({ [`system.corBarra.${chave}.cor1`]: dados.cor1, [`system.corBarra.${chave}.cor2`]: dados.cor2 });
    }
  }

  /**
   * Remove um Recurso Customizado da ficha do personagem. Ação
   * manual e deliberada - a sincronização automática (ver
   * naurenSincronizarRecursosCustom) nunca remove sozinha, de propósito
   * (evita apagar progresso do jogador sem querer), então este é o único
   * jeito de tirar um recurso que não é mais usado.
   */
  static async onRemoverRecursoCustom(event, target) {
    const index = Number(target.dataset.index);
    const lista = foundry.utils.deepClone(this.actor.system.recursosCustom ?? []);
    if (!lista[index]) return;
    const nomeRemovido = lista[index].nome || lista[index].id;
    lista.splice(index, 1);
    await this.actor.update({ "system.recursosCustom": lista });
    ui.notifications.info(`Recurso "${nomeRemovido}" removido da ficha.`);
  }

  /**
   * Alterna manualmente a trava de um recurso customizado, ciclando
   * auto → travado → destravado → auto. Sempre disponível (não só no
   * Modo Edição), já que é uma decisão de jogo, não de configuração da
   * ficha - precisa estar 1 clique de distância pra nunca travar alguém
   * numa situação que o sistema calculou errado (ver
   * naurenRecursoEstaTravado).
   */
  static async onAlternarTravaRecursoCustom(event, target) {
    const index = Number(target.dataset.index);
    const lista = foundry.utils.deepClone(this.actor.system.recursosCustom ?? []);
    if (!lista[index]) return;
    const atual = lista[index].travaManual || "auto";
    const proximo = { auto: "travado", travado: "destravado", destravado: "auto" }[atual] ?? "auto";
    lista[index].travaManual = proximo;
    await this.actor.update({ "system.recursosCustom": lista });
    const rotulo = { auto: "Automático", travado: "Travado manualmente", destravado: "Destravado manualmente" }[proximo];
    ui.notifications.info(`"${lista[index].nome}": ${rotulo}.`);
  }

  /** Abre a ficha de um Mascote vinculado. */
  /** Alterna, no Modo Edição, se o retrato exibido é a imagem do Personagem ou a do Token. */
  static async onAlternarImagemModo(event, target) {
    this.#imagemModoToken = !this.#imagemModoToken;
    this.render();
  }

  /**
   * Copia TUDO do token não vinculado atual (dados do sistema + itens
   * completos) pra ficha original na barra lateral, sobrescrevendo-a por
   * completo - útil quando alguém editou um personagem direto pelo token
   * no mapa (sem "Vincular Ator" ligado) e quer trazer essas mudanças de
   * volta pra ficha "oficial". Pede confirmação antes, já que é
   * destrutivo pra ficha original (o que estiver lá antes é substituído).
   * Depois de sincronizar, também liga "Vincular Ator" neste token
   * específico, pra ele parar de divergir de novo no futuro.
   */
  static async onSincronizarFichaOriginal(event, target) {
    if (!this.actor.isToken) return;
    const original = game.actors.get(this.actor.id);
    if (!original) {
      ui.notifications.error("Não encontrei a ficha original na barra lateral (pode ter sido apagada).");
      return;
    }

    const confirmar = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Sincronizar com a Ficha Original?" },
      content: `<p>Isso vai copiar os atributos/recursos deste token para a ficha de <b>${original.name}</b> na barra lateral. Os Itens são MESCLADOS: item igual (mesmo nome e tipo) é atualizado com os dados do token, item que só existe no token é adicionado, e item que só existe na ficha original é preservado (não é apagado). Confirma?</p>`,
      rejectClose: false
    });
    if (!confirmar) return;

    // Dados do sistema: substitui por completo (não mescla campo a campo)
    // pra garantir que a ficha original fique EXATAMENTE igual ao token.
    await original.update({
      img: this.actor.img,
      "system": foundry.utils.deepClone(this.actor.toObject().system)
    });

    // Itens: MESCLA em vez de apagar tudo e recriar - casa item do token
    // com item da ficha original por NOME + TIPO (heurística razoável,
    // já que os dois são documentos diferentes sem um "ID de origem"
    // compartilhado entre si). Item que bate: ATUALIZA com os dados do
    // token. Item que só existe no token: CRIA na ficha original. Item
    // que só existe na ficha original (sem correspondente no token):
    // PRESERVA - antes isso era simplesmente apagado, o que destruía
    // qualquer coisa que a ficha original tivesse ganho enquanto o token
    // ficava desatualizado (o cenário mais comum de precisar sincronizar
    // uma ficha antiga).
    const itensDoToken = this.actor.items.map(i => i.toObject());
    const itensOriginaisRestantes = new Map(original.items.map(i => [`${i.type}::${i.name}`, i]));
    const paraAtualizar = [];
    const paraCriar = [];
    for (const itemToken of itensDoToken) {
      const chave = `${itemToken.type}::${itemToken.name}`;
      const itemOriginalCorrespondente = itensOriginaisRestantes.get(chave);
      if (itemOriginalCorrespondente) {
        paraAtualizar.push({ ...itemToken, _id: itemOriginalCorrespondente.id });
        itensOriginaisRestantes.delete(chave); // já usado, não conta mais como "sobrando"
      } else {
        paraCriar.push(itemToken);
      }
    }
    if (paraAtualizar.length) await original.updateEmbeddedDocuments("Item", paraAtualizar);
    if (paraCriar.length) await original.createEmbeddedDocuments("Item", paraCriar);
    // Os itens que sobraram em "itensOriginaisRestantes" (só existiam na
    // ficha original, sem par no token) são deixados como estão - de
    // propósito, não apagados.

    // Liga "Vincular Ator" neste token específico, pra ele parar de
    // divergir de novo - a partir de agora, editar aqui ou na ficha
    // original é a mesma coisa.
    await this.actor.token.update({ actorLink: true });

    ui.notifications.info(`Ficha de "${original.name}" sincronizada com este token.`);
    this.render();
  }

  /**
   * Abre o seletor de arquivos para trocar a imagem correspondente ao modo
   * atual (Personagem ou Token), sem precisar abrir a configuração do
   * Token nem o editor de imagem padrão do Foundry.
   */
  /** Proporção altura/largura da moldura da imagem na ficha (para a janela de enquadrar ficar igual). */
  _proporcaoRetrato() {
    const r = this.element?.querySelector?.(".profile-frame")?.getBoundingClientRect?.();
    return r && r.width > 0 && r.height > 0 ? r.height / r.width : 1.25;
  }

  static async onEnquadrarRetrato(event, target) {
    event?.stopPropagation?.();
    return naurenAbrirEnquadramento(this.actor, this.actor.img, this._proporcaoRetrato());
  }

  /** Borda do token (Dynamic Token Ring): enquadrar, cores, efeitos e o piscar no dano/cura. */
  static async onBordaToken(event, target) {
    event?.stopPropagation?.();
    await naurenAbrirBorda(this.actor, { tokenDoc: this.actor.isToken ? this.actor.token : null });
    this.render();
  }

  static async onEditarImagemAtual(event, target) {
    const modoToken = this.#imagemModoToken;
    const atual = modoToken ? (this.actor.prototypeToken?.texture?.src || this.actor.img) : this.actor.img;
    const FilePickerImpl = foundry.applications.apps.FilePicker.implementation;
    const fp = new FilePickerImpl({
      type: "image",
      current: atual,
      callback: async path => {
        if (modoToken) return this.actor.update({ "prototypeToken.texture.src": path });
        await this.actor.update({ img: path });
        naurenAbrirEnquadramento(this.actor, path, this._proporcaoRetrato());
      }
    });
    return fp.browse();
  }

  static async onAbrirMascote(event, target) {
    const uuid = target.dataset.uuid;
    const mascote = uuid ? await fromUuid(uuid).catch(() => null) : null;
    if (mascote) mascote.sheet.render(true);
    else ui.notifications.warn("Não encontrei esse Mascote (pode ter sido apagado).");
  }

  /**
   * Desvincula um Mascote - só apaga o vínculo
   * (system.mascoteDeUuid), NUNCA o ator do mascote em si (ele continua
   * existindo, só deixa de aparecer como mascote de ninguém).
   */
  static async onDesvincularMascote(event, target) {
    const uuid = target.dataset.uuid;
    const mascote = uuid ? await fromUuid(uuid).catch(() => null) : null;
    if (!mascote) { ui.notifications.warn("Não encontrei esse Mascote (pode ter sido apagado)."); return; }
    await NaurenAlvoHelper.atualizarAtorSeguro(mascote, { "system.mascoteDeUuid": "" });
    ui.notifications.info(`"${mascote.name}" não é mais Mascote de ${this.actor.name}.`);
    this.render();
  }

  /** Abre/fecha a caixa "Consultar Fórmulas" na aba Opções (vem fechada por padrão). */
  static async onToggleReferenciaFormulas(event, target) {
    this.#referenciaFormulasAberta = !this.#referenciaFormulasAberta;
    this.render();
  }

  /**
   * Sobrescreve o tratamento padrão de "soltar um item na ficha" (ponto de
   * extensão oficial, chamado sozinho pela própria ApplicationV2 - uma
   * tentativa anterior de fazer isso manualmente, achando que esse ponto não
   * seria chamado, causava DUPLICAÇÃO: o item era criado tanto pelo
   * mecanismo nativo quanto pelo meu handler extra) pra garantir que o tipo
   * do item criado seja sempre o tipo ORIGINAL do documento arrastado, e
   * pra aplicar a checagem de multiclasse e a progressão automática de
   * Classe.
   */
  /**
   * Wrapper fino - a lógica de verdade é naurenAdicionarItemNaFicha (função
   * independente, fora da classe), porque o Criador de Personagem também
   * precisa chamá-la e é uma classe DIFERENTE desta (não tem acesso a
   * "this" de NaurenActorSheet).
   */
  async _adicionarItemNaFicha(item) {
    return naurenAdicionarItemNaFicha(this.actor, item);
  }

  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);
    if (!item) return false;

    // Reordenar um item que já pertence a este mesmo ator: mantém o padrão do Foundry
    if (item.parent?.uuid === this.actor.uuid) {
      // Magia do Grimório solta sobre outra magia do Grimório: muda a página dela (livre, sem custo).
      const alvoLi = event.target?.closest?.("[data-item-id]");
      const alvo = alvoLi ? this.actor.items.get(alvoLi.dataset.itemId) : null;
      if (item.type === "magia" && item.system.ehMagiaDeMago && alvo && alvo.id !== item.id && alvo.type === "magia" && alvo.system.ehMagiaDeMago) {
        const caixa = alvoLi.getBoundingClientRect();
        const depois = event.clientY > caixa.top + caixa.height / 2;   // metade de baixo do alvo: vai para depois dele
        await naurenReordenarGrimorio(this.actor, item.id, alvo.id, depois);
        return true;
      }
      return super._onDropItem(event, data);
    }

    return this._adicionarItemNaFicha(item);
  }

  /**
   * Alterna o estado "equipado" de um item (arma, armadura ou consumível).
   * Se for uma armadura, soma ou subtrai automaticamente o bônus de defesa
   * dela na Defesa da ficha do personagem.
   */
  async _toggleEquip(item) {
    const estavaEquipado = item.system.equipado ?? false;
    const novoEstado = !estavaEquipado;

    await item.update({ "system.equipado": novoEstado });

    // Não mexe em system.defesa aqui! O bônus da armadura equipada é
    // somado automaticamente em NaurenActor#prepareDerivedData, do mesmo
    // jeito que o bônus manual e os Efeitos - equipar/desequipar só precisa
    // trocar a flag "equipado", o resto se recalcula sozinho a cada render.

    ui.notifications.info(`${item.name} foi ${novoEstado ? "equipado" : "desequipado"}.`);
  }

  /**
   * Botão "Subir de Nível": confere se já tem XP suficiente (regra
   * do manual: (nível+1) x 100), sobe o nível, desconta o custo do XP
   * (sobra fica guardada, igual o exemplo do manual), credita o(s) novo(s)
   * Ponto(s) de Subclasse se já tiver destravado (nível 5+ - ver
   * NaurenActor#prepareDerivedData), e aplica a progressão da Classe
   * equipada, se houver (NaurenProgressaoHelper) - sem Classe, só o
   * nível/XP/pontos avançam normalmente.
   */
  async _subirDeNivel() {
    const sys = this.actor.system;
    const nivelAtual = sys.nivel || 1;
    const proximoNivel = nivelAtual + 1;
    const custoXp = proximoNivel * 100;
    if ((sys.xp || 0) < custoXp) {
      ui.notifications.warn(`${this.actor.name} ainda não tem XP suficiente pra subir de nível (precisa de ${custoXp}).`);
      return;
    }

    // Só nível/XP aqui - o granting da Classe E o crédito de Pontos de
    // Subclasse acontecem sozinhos no hook Hooks.on("updateActor", ...) mais
    // abaixo, o mesmo caminho usado quando o campo "Nível" é editado
    // manualmente, pra nunca ter os dois fluxos fazendo a mesma coisa de
    // formas diferentes (e arriscar creditar/conceder em dobro).
    await this.actor.update({
      "system.nivel": proximoNivel,
      "system.xp": sys.xp - custoXp
    });

    ui.notifications.info(`${this.actor.name} subiu para o nível ${proximoNivel}!`);
  }

  /**
   * Resolve o valor numérico atual de um atributo/meta-atributo/recurso do
   * ator, a partir do nome usado nas fórmulas ("@nome") - delega pra
   * naurenResolverTokenFormula, a MESMA lista usada pelos modificadores de
   * Efeito/Condição/Pigmento, garantindo que "@vida" (por exemplo)
   * signifique a mesma coisa em fórmula de Ação ou em modificador.
   */
  _getAtributoValue(key) {
    // 0.94.24: "1d20 + PdA ou PdM" do livro (itens sem arma, ex.: ataque de Condição de um amuleto) - usa o maior.
    if (key === "maiorPoder") return Math.max(Number(naurenResolverTokenFormula("poderAtaque", this.actor)) || 0, Number(naurenResolverTokenFormula("poderMagia", this.actor)) || 0);
    return naurenResolverTokenFormula(key, this.actor);
  }

  _labelAtributo(key) {
    return ATRIBUTOS_BONUS[key] ?? "Nenhum";
  }

  /**
   * Conta quantos acúmulos o alvo ATUALMENTE selecionado (game.user.targets,
   * primeiro alvo marcado com T) tem de uma Condição específica (por UUID
   * de origem, o mesmo usado em condicoesAplicadas) - 0 se não houver alvo
   * selecionado, o alvo não tiver essa Condição, ou o UUID estiver vazio.
   * Condição não-acumulável conta como 1 (presente) ou 0 (ausente).
   */
  _contarAcumulosNoAlvo(condicaoUuid) {
    if (!condicaoUuid) return 0;
    // "game.user.targets" é um Set nativo (sem .first()) - pega o primeiro
    // via array, mesmo padrão já usado em NaurenAlvoHelper._resolverAlvosDaAcao.
    const alvoToken = Array.from(game.user.targets)[0];
    const alvoActor = alvoToken?.actor;
    if (!alvoActor) return 0;
    const item = alvoActor.items.find(i =>
      i.type === "condicao" && i.system.ativo &&
      (i.getFlag("core", "sourceId") === condicaoUuid || i.getFlag("nauren", "cadeiaRaizUuid") === condicaoUuid)
    );
    if (!item) return 0;
    return item.system.acumulativel ? (item.system.acumulos ?? 1) : 1;
  }

  /**
   * Resolve UMA entrada de "bonusCondicionalAoAlvo" (ver
   * NaurenHabilidadeData) contra o alvo atualmente mirado (tecla T) -
   * usado pelos 3 pontos de resolução (Ataque, Dano, Alcance) em vez de
   * cada um repetir a mesma lógica "porAcumulo ? multiplica : só soma".
   * Devolve 0 se a Condição não estiver presente no alvo.
   */
  /** Bônus que valem só para este alvo (ver #bonusPorAlvoAtual): { dano, ataque, linhas }. */
  _bonusDoAlvo(tokenDoc) {
    const alvo = tokenDoc?.actor;
    const out = { dano: 0, ataque: 0, linhas: [] };
    if (!alvo || !this.#bonusPorAlvoAtual.length) return out;
    for (const b of this.#bonusPorAlvoAtual) {
      let mult = 0;
      if (b.marcaNome) {
        const txt = b.marcaNome.toLowerCase();
        const marca = alvo.items.find(i => i.type === "condicao" && i.name.toLowerCase().includes(txt) && (() => {
          try { const d = fromUuidSync(i.system.conjuradorUuid); return (d?.actor ?? d)?.uuid === this.actor.uuid; } catch (err) { return false; }
        })());
        if (marca && (!b.beneficio || marca.getFlag("nauren", "beneficioMarca") === b.beneficio)) mult = 1;
      } else if (b.condicaoUuid) {
        const c = alvo.items.find(i => i.type === "condicao" && i.system.ativo !== false && (i.getFlag("core", "sourceId") === b.condicaoUuid || i.getFlag("nauren", "cadeiaRaizUuid") === b.condicaoUuid));
        if (c) mult = b.porAcumulo ? (c.system.acumulativel ? (c.system.acumulos ?? 1) : 1) : 1;
      }
      if (!mult) continue;
      if (b.dano) { out.dano += b.dano * mult; out.linhas.push(`${b.fonte}: +${b.dano * mult} de dano (este alvo)`); }
      if (b.ataque) { out.ataque += b.ataque * mult; out.linhas.push(`${b.fonte}: +${b.ataque * mult} no ataque (este alvo)`); }
    }
    return out;
  }
  /** Cópia do pacote com o dano/ataque extra deste alvo somados (ou o próprio pacote, se não houver nada). */
  _pacoteComBonusDoAlvo(pacote, tokenDoc) {
    const b = this._bonusDoAlvo(tokenDoc);
    if (!b.dano && !b.ataque) return pacote;
    const novo = { ...pacote };
    if (b.dano && (novo.dano ?? 0) > 0) { novo.dano += b.dano; if (novo.danoMaximoAlternativo) novo.danoMaximoAlternativo += b.dano; }
    if (b.ataque && typeof novo.ataqueTotal === "number") novo.ataqueTotal += b.ataque;
    return novo;
  }

  _resolverBonusCondicionalAoAlvo(entrada) {
    if (!entrada.condicaoUuid) return 0;
    if (entrada.porAcumulo) {
      const acumulos = this._contarAcumulosNoAlvo(entrada.condicaoUuid);
      return acumulos ? entrada.valor * acumulos : 0;
    }
    return this._alvoTemCondicoes([entrada.condicaoUuid], "ou") ? entrada.valor : 0;
  }

  /**
   * Alcance EFETIVO de uma Ação, já com TODOS os bônus somados (tokens
   * livres via "@atacouNesteTurno" etc, "alcanceBonusTotal" do Ator, o
   * bônus pontual do popup de pré-Ação, e Bônus Condicional ao Alvo -
   * ex: Foco Mortal, Caçador). Extraído pra ser reaproveitado tanto na
   * checagem REAL (dentro de _resolverAlvosDaAcao) quanto na EXIBIÇÃO
   * do popup de pré-Ação (_popupPreAcao) - antes só a checagem real
   * somava tudo isso, então o popup mostrava "fora de alcance" mesmo
   * quando o ataque, de fato, alcançava (bug real corrigido).
   * Retorna null se a Ação não tiver "alcance" configurado, ou se o
   * texto não tiver nenhum número reconhecível.
   */
  /** Bônus contra o alvo com filtro de ataque (Foco Mortal: à distância; Tiro Letal: com arma). */
  _bonusCondicionalValeNesta(b, item, acao) {
    if (!b?.filtroAtaque) return true;
    if (b.filtroAtaque === "arma") return item?.type === "arma" || !!acao?.usaArmaEscolhida || !!acao?._armaEscolhidaNome;
    if (b.filtroAtaque === "distancia") {
      const t = naurenTipoAlcanceDaAcao(item, acao);
      return t === "distancia" || (t === "segueArma" && naurenCategoriaDaArma(this.#armaEscolhidaAtual) === "Distância");
    }
    return true;
  }

  _calcularAlcanceEfetivo(acao, item = null) {
    if (!acao.alcance) return null;
    const alcanceResolvido = this._substituirAtributosNaFormula(String(acao.alcance), acao);
    const m = alcanceResolvido.match(/\d+([.,]\d+)?/);
    if (!m) return null;
    let bonusCondicional = 0;
    for (const b of (this.actor.system.bonusCondicionalAoAlvoTotal ?? [])) {
      if (b.campo !== "alcance" || !this._bonusCondicionalValeNesta(b, item, acao)) continue;
      bonusCondicional += this._resolverBonusCondicionalAoAlvo(b);
    }
    // Bônus de Alcance fixo/condicional (ver campoAcao >
    // alcanceBonusExtraFormula, ex: Ímpeto, Empíreo - "+1m em Profusão
    // Retraída"). Bug real corrigido: "@rank" precisa ser resolvido como
    // TEXTO primeiro, ANTES de "_substituirAtributosNaFormula" - essa
    // função termina com uma substituição "pega-tudo" pra qualquer
    // "@algo" restante (via _getAtributoValue → naurenResolverTokenFormula,
    // que não tem NENHUM caso pra "rank" - devolve 0 silenciosamente).
    // Chamando-a primeiro, "@rank" já virava "0" ali dentro mesmo, antes
    // de "naurenInterpretarModificador" (usado logo abaixo) ter a chance
    // de resolvê-lo contra o rank REAL do item - o bônus de alcance
    // nunca escalava (e em Profusão Retraída sem estar ainda no rank
    // certo, nem aparecia, já que "0*algo" sempre dá 0).
    let bonusExtraAcao = 0;
    if (acao.alcanceBonusExtraFormula) {
      const comRankResolvido = String(acao.alcanceBonusExtraFormula).replace(/@rank\b/gi, String(item?.system?.rankAtual ?? 0));
      const formulaResolvida = this._substituirAtributosNaFormula(comRankResolvido, acao);
      bonusExtraAcao = naurenInterpretarModificador(formulaResolvida, this.actor, item)?.valor ?? 0;
    }
    return parseFloat(m[0].replace(",", ".")) + (this.actor.system.alcanceBonusTotal ?? 0) + (this.#bonusAlcanceAdhocAtual || 0) + bonusCondicional + bonusExtraAcao;
  }

  /**
   * Conta quantos TIPOS DIFERENTES de Condição ativa o alvo ATUALMENTE
   * selecionado possui (não é acúmulo de UMA condição - é quantas
   * condições distintas, cada uma contando 1, não importa quantos acúmulos
   * cada uma tenha). Ex: Disparo Quimérico (Caçador) usa isso junto com
   * _contarAcumulosNoAlvo na mesma fórmula.
   */
  _contarCondicoesDiferentesNoAlvo() {
    const alvoToken = Array.from(game.user.targets)[0];
    const alvoActor = alvoToken?.actor;
    if (!alvoActor) return 0;
    return alvoActor.items.filter(i => i.type === "condicao" && i.system.ativo).length;
  }

  /**
   * Verificar Múltiplas Condições no Alvo: devolve 1 (true) ou 0 (false)
   * conforme o alvo atualmente selecionado tenha QUALQUER UMA (lógica
   * "ou", padrão) ou TODAS (lógica "e") as Condições da lista dada -
   * mesmo padrão de acesso ao alvo de _contarAcumulosNoAlvo, mas pra
   * várias Condições de uma vez, sem escalar por acúmulo (só presença/
   * ausência). Uma lista vazia sempre devolve 0.
   */
  _alvoTemCondicoes(uuids, logica) {
    const lista = (uuids ?? []).filter(Boolean);
    if (!lista.length) return 0;
    const alvoToken = Array.from(game.user.targets)[0];
    const alvoActor = alvoToken?.actor;
    if (!alvoActor) return 0;
    const temCondicao = uuid => alvoActor.items.some(i =>
      i.type === "condicao" && i.system.ativo &&
      (i.getFlag("core", "sourceId") === uuid || i.getFlag("nauren", "cadeiaRaizUuid") === uuid)
    );
    const resultado = logica === "e" ? lista.every(temCondicao) : lista.some(temCondicao);
    return resultado ? 1 : 0;
  }

  /**
   * Verificar Condição em Mim: devolve 1 (true) ou 0 (false) conforme o
   * PRÓPRIO ATOR (quem está usando a Ação, não o alvo) tenha a Condição
   * indicada com PELO MENOS "acumulosMin" acúmulos (ex: Arte Divina,
   * Místico - "alvo com 3+ Pontos de Pintura", onde o "alvo" ali é o
   * PRÓPRIO conjurador, não quem ele está atacando). Diferente de
   * "_alvoTemCondicoes" acima (presença/ausência simples no ALVO) - este
   * aqui checa acúmulo mínimo em SI MESMO.
   */
  /** Tenho um estado ativo (Condição ou Efeito) cujo nome contém o texto? */
  _euTenhoEstadoAtivo(texto) {
    const alvo = String(texto ?? "").trim().toLowerCase();
    if (!alvo) return true;
    return this.actor.items.some(i => (i.type === "condicao" ? i.system.ativo !== false : i.type === "efeito" ? !!i.system.ativo : false)
      && i.name.toLowerCase().includes(alvo));
  }

  _euTenhoCondicao(uuid, acumulosMin) {
    if (!uuid) return 0;
    const item = this.actor.items.find(i =>
      i.type === "condicao" && i.system.ativo &&
      (i.getFlag("core", "sourceId") === uuid || i.getFlag("nauren", "cadeiaRaizUuid") === uuid)
    );
    if (!item) return 0;
    const acumulos = item.system.acumulativel ? (item.system.acumulos ?? 1) : 1;
    return acumulos >= (acumulosMin || 1) ? 1 : 0;
  }

  /**
   * Troca de Atributo de Ataque (ver Condição > trocaAtributoAtaqueOpcional,
   * ex: Profusão Retraída, Empíreo - "pode usar Poder de Magia pra atacar
   * com arma no lugar de Poder de Ataque") - acha a PRIMEIRA Condição
   * ativa neste Ator que ofereça essa troca, e que de fato mudaria algo
   * pra esta Ação específica (nunca oferece trocar um atributo por ele
   * mesmo). Devolve null se nenhuma Condição ativa oferecer, ou {uuid,
   * nome, atributo} pronto pro popup mostrar o checkbox.
   */
  _condicaoComTrocaDeAtributo(acao) {
    if (!acao?.ehAtaque) return null;
    const atributoAtual = acao.atributoAtaque || "poderAtaque";
    const item = this.actor.items.find(i =>
      i.type === "condicao" && i.system.ativo &&
      i.system.trocaAtributoAtaqueOpcional && i.system.trocaAtributoAtaqueOpcional !== "nenhum" && i.system.trocaAtributoAtaqueOpcional !== atributoAtual
    );
    if (!item) return null;
    return { uuid: item.uuid, nome: item.name, atributo: item.system.trocaAtributoAtaqueOpcional };
  }

  /**
   * Mesma checagem de "_euTenhoCondicao", mas pra QUALQUER ator (não só
   * "this.actor") - usado por "_bonusTesteAreaDisponivel" abaixo, que
   * precisa checar Condições do DONO da área (Profusão Ousada/Retraída),
   * não de quem está prestes a atacar.
   */
  _atorTemCondicaoAtiva(actor, uuid, acumulosMin = 1) {
    if (!uuid || !actor) return false;
    const item = actor.items.find(i =>
      i.type === "condicao" && i.system.ativo &&
      (i.getFlag("core", "sourceId") === uuid || i.getFlag("nauren", "cadeiaRaizUuid") === uuid)
    );
    if (!item) return false;
    const acumulos = item.system.acumulativel ? (item.system.acumulos ?? 1) : 1;
    return acumulos >= (acumulosMin || 1);
  }

  /**
   * Bônus de Teste em Área, 1x por turno (ver NaurenHabilidadeData >
   * concedeBonusTesteArea, ex: Presença, Empíreo) - procura, entre TODOS
   * os atores com token na cena atual (aliados, inimigos, o próprio
   * ator), alguma Habilidade ativa desse tipo cujo DONO esteja a até
   * "emanacaoRaio" metros de MIM (quem vai atacar agora - o próprio
   * dono conta, distância 0), que EU ainda não tenha usado no TURNO
   * ATUAL (de QUALQUER combatente - ver naurenIdentificadorTurnoAtual)
   * e que não esteja bloqueada por Condição no dono (ex: Profusão
   * Retraída, só bloqueia pra aliados, nunca pro próprio dono).
   * Devolve null se nenhuma disponível, ou {itemUuid, nome, donoNome,
   * dado} pronto pro popup mostrar o checkbox.
   */
  _bonusTesteAreaDisponivel() {
    if (!canvas?.ready) return null;
    const meuToken = canvas.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0];
    if (!meuToken) return null;
    // "1x por TURNO" (não por rodada) - uma rodada tem o turno de todo
    // mundo, então isso reseta a cada mudança de turno de QUALQUER
    // combatente, não só quando volta a ser o turno de quem usou. Guarda
    // o IDENTIFICADOR do turno em que foi usado (ver
    // naurenIdentificadorTurnoAtual) em vez de uma flag booleana - "já
    // usei" vira só "usei NO MESMO turno de agora" (comparação direta,
    // sem precisar de nenhum hook pra "resetar" nada). Fora de combate
    // (identificador null) nunca bloqueia - "por turno" não existe sem
    // turnos estruturados.
    const identificadorTurnoAtual = naurenIdentificadorTurnoAtual();
    const usadosNoTurno = this.actor.getFlag("nauren", "bonusAreaUsadoNoTurno") || {};
    for (const t of canvas.tokens.placeables) {
      if (!t.actor) continue;
      for (const item of t.actor.items) {
        if (item.type !== "habilidade" || !item.system.ativo || !item.system.usaEmanacao || !item.system.concedeBonusTesteArea) continue;
        // Só para o dono e os aliados dele (Presença: "você e aliados"):
        // inimigo dentro da área não ganha o dado.
        if (t !== meuToken && t.document?.disposition !== meuToken.document?.disposition) continue;
        // Bug real corrigido: "item.uuid" tem o formato
        // "Actor.<id>.Item.<id>" (com PONTOS) - usar ele direto como
        // chave de objeto numa Flag quebra, porque o Foundry (no
        // update/setFlag) trata pontos em chaves de objeto como
        // CAMINHOS aninhados, e expande "{'Actor.xxx.Item.yyy': true}"
        // em "{Actor: {xxx: {Item: {yyy: true}}}}" por baixo dos panos -
        // a Flag nunca era gravada sob a chave literal esperada, então
        // "usadosNoTurno[item.uuid]" nunca batia na leitura, e o bônus
        // "1x por turno" podia ser usado infinitas vezes (ver
        // naurenChaveFlagSegura, usada nos dois lados: aqui e onde a
        // Flag é marcada, em _executarAcao).
        if (identificadorTurnoAtual && usadosNoTurno[naurenChaveFlagSegura(item.uuid)] === identificadorTurnoAtual) continue;
        // Bloqueio por Condição (ex: Profusão Retraída) só vale pra
        // QUEM NÃO É o dono da área (aliados) - o manual só diz "não
        // gera bônus PRA ALIADO" nesse estado, nunca menciona o próprio
        // Empíreo perder o bônus dele mesmo. "t === meuToken" = é o
        // próprio dono testando, nunca bloqueia esse caso.
        if (t !== meuToken && item.system.concedeBonusTesteAreaBloqueadaPorCondicaoUuid &&
            this._atorTemCondicaoAtiva(t.actor, item.system.concedeBonusTesteAreaBloqueadaPorCondicaoUuid)) continue;
        // Raio por Rank (ver emanacaoRaioPorRank) - mesmo fallback de
        // naurenProcessarEmanacoes acima.
        const raioOverride = naurenResolverPorRank(item.system.emanacaoRaioPorRank, item.system.rankAtual ?? 0, "valor");
        const raio = parseFloat(raioOverride ?? item.system.emanacaoRaio) || 0;
        let distancia;
        try { distancia = t === meuToken ? 0 : naurenMedirDistanciaBordas(t, meuToken); } catch (err) { continue; }
        if (distancia > raio) continue;
        let dado = item.system.concedeBonusTesteAreaDado || "1d4";
        if (item.system.concedeBonusTesteAreaDadoCondicaoUuid &&
            this._atorTemCondicaoAtiva(t.actor, item.system.concedeBonusTesteAreaDadoCondicaoUuid)) {
          dado = item.system.concedeBonusTesteAreaDadoAlternativo || dado;
        }
        return { itemUuid: item.uuid, nome: item.name, donoNome: t.actor.name, dado };
      }
    }
    return null;
  }

  /**
   * Buff de Conjuração (ver templatePersistenteBuffConjuracaoDado/
   * Facilidade, ex: Terra Mágica, Mago) - devolve a configuração do buff
   * ({dado, facilidade}) se o token ATIVO deste ator estiver FISICAMENTE
   * dentro dos limites de alguma Região com esse buff configurado nesta
   * cena, ou null se não estiver em nenhuma. Mesmo mecanismo de "dentro
   * da área" que _tokensNaRegiao usa (shape.testPoint), só que invertido
   * - checando UM token contra VÁRIAS regiões, em vez do contrário. Se
   * houver mais de uma zona sobreposta com buff, usa a PRIMEIRA
   * encontrada (não soma múltiplas).
   */
  _buffDeConjuracaoAtivo() {
    if (!canvas?.ready || !canvas.scene) return null;
    const meuToken = this.actor.getActiveTokens?.(true)?.[0];
    if (!meuToken) return null;
    const regioes = canvas.scene.regions?.filter(r => {
      const config = r.getFlag("nauren", "templatePersistente");
      return config && (config.buffConjuracaoDado || config.buffConjuracaoFacilidade);
    }) ?? [];
    for (const regiao of regioes) {
      const shapes = regiao.shapes ?? [];
      if (!shapes.length || !shapes.every(s => typeof s.testPoint === "function")) continue;
      if (naurenCelulasNaArea(meuToken.center, shapes, meuToken.document, regiao)) {
        const config = regiao.getFlag("nauren", "templatePersistente");
        return { dado: config.buffConjuracaoDado || "", facilidade: !!config.buffConjuracaoFacilidade };
      }
    }
    return null;
  }

  /**
   * Espírito da Batalha (Guerreiro) - devolve null se o Ator não tiver a
   * barra (não é Guerreiro, ou não tem a Habilidade), ou um objeto com
   * tudo que o popup de pré-Ação e o consumo precisam:
   * - valorAtual/valorMax: a barra em si (Recurso Customizado
   *   "espiritodabatalha", declarada pela Classe Guerreiro).
   * - usosRestantes/usosMax: quantas trocas ainda cabem NESTE turno (ver
   *   a Ação "contador" dentro do item Espírito de Batalha, usaUsos +
   *   usosMaxPorNivel, reseta sozinha no início do turno).
   * - item/acaoIndex: referências pra consumir de verdade depois (ver
   *   _executarAcao), sem precisar procurar tudo de novo.
   */
  /**
   * Se este Ator está participando de um combate ATIVO agora (existe um
   * Combate na cena, com Combatentes definidos, e este Ator é um deles)
   * - usado pra "Usos por Turno/Rodada" (ver USOS_RESET_POR_COMBATE):
   * fora de combate, "turno"/"rodada" não têm sentido de verdade (pode
   * ser um jogador testando a ficha, ou uma cena sem iniciativa rolada),
   * então esses limites não deveriam bloquear nem descontar nada - só
   * valem quando o personagem está de fato na Ordem de Combate.
   */
  _atorEstaEmCombateAtivo() {
    return !!(game.combat?.combatants?.some(c => c.actor?.id === this.actor.id));
  }

  _espiritoDeBatalhaInfo() {
    const recurso = (this.actor.system.recursosCustom ?? []).find(r => r.id === "espiritodabatalha");
    if (!recurso) return null;
    const item = this.actor.items.find(i => i.type === "habilidade" && (naurenEhItem(i, "Espírito de Batalha") || (i.system.acoes ?? []).some(a => a.nome?.includes("Trocas de Espírito"))) && (i.system.acoes ?? []).some(a => a.usaUsos && (a.usosMaxPorNivel ?? []).length));
    if (!item) return null;
    const acaoIndex = (() => { const k = item.system.acoes.findIndex(a => a.nome?.includes("Trocas de Espírito")); return k >= 0 ? k : item.system.acoes.findIndex(a => a.usaUsos && (a.usosMaxPorNivel ?? []).length); })();
    const acao = item.system.acoes[acaoIndex];
    const nivelAtor = this.actor.system.nivel || 1;
    const usosMaxPorNivel = naurenResolverPorNivel(acao.usosMaxPorNivel, nivelAtor, "valor");
    const usosMax = usosMaxPorNivel !== null ? usosMaxPorNivel : (acao.usosMax ?? 1);
    return {
      valorAtual: recurso.valor ?? 0,
      valorMax: recurso.max ?? 0,
      usosRestantes: acao.usosAtual ?? 0,
      usosMax,
      item, acaoIndex
    };
  }

  /**
   * Conta quantos ALIADOS (outro token no mesmo cenário com a mesma
   * "disposition" - Amigável/Neutro/Hostil - do MEU token controlado,
   * excluindo eu mesmo) estão a até "raioMetros" de distância. Usado pelo
   * token de fórmula "@aliados_<N>m" (ver _substituirAtributosNaFormula) -
   * ex: "@aliados_4m" conta aliados a até 4 metros. 0 se não houver token
   * controlado ou o cenário não estiver pronto.
   */
  _contarAliadosProximos(raioMetros) {
    // Preferência de token "controlado" (selecionado na tela por ESTE
    // usuário) só faz sentido aqui, dentro de uma ficha aberta - por isso
    // esta checagem extra fica no método, não na função solta
    // (naurenContarAliadosProximos), que não tem esse conceito.
    const tokenControlado = canvas.tokens?.controlled?.[0];
    if (tokenControlado?.actor?.uuid !== this.actor.uuid) return naurenContarAliadosProximos(this.actor, raioMetros);
    let contagem = 0;
    for (const t of canvas.tokens.placeables) {
      if (t === tokenControlado || !t.actor) continue;
      if (t.document.disposition !== tokenControlado.document.disposition) continue;
      let distancia;
      try {
        distancia = naurenMedirDistanciaBordas(tokenControlado, t);
      } catch (err) { continue; }
      if (distancia <= raioMetros) contagem++;
    }
    return contagem;
  }

  /**
   * Conta quantos tokens a até "raioMetros" de mim (filtrados por
   * "disposicaoFiltro": "aliados" = mesma disposição de token que a
   * minha, "inimigos" = disposição diferente, "todos" = sem filtro)
   * possuem uma Condição ou Efeito ativo específico, identificado por UUID
   * de origem (mesmo padrão usado em NaurenAlvoHelper.aplicarCondicao).
   * Usado pelo campo "Contar em Área" de uma Ação, disponibilizado como
   * "@contagemArea" na fórmula.
   */
  _contarComCondicaoEmArea(condicaoUuid, raioMetros, disposicaoFiltro) {
    if (!condicaoUuid) return 0;
    const meuToken = canvas.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
    if (!meuToken || !canvas.ready) return 0;
    const incluiDono = disposicaoFiltro === "todosComVoce";
    let contagem = 0;
    for (const t of canvas.tokens.placeables) {
      if (!t.actor) continue;
      if (t === meuToken && !incluiDono) continue;
      const mesmaDisposicao = t.document.disposition === meuToken.document.disposition;
      if (disposicaoFiltro === "aliados" && !mesmaDisposicao) continue;
      if (disposicaoFiltro === "inimigos" && mesmaDisposicao) continue;
      let distancia;
      try {
        distancia = t === meuToken ? 0 : naurenMedirDistanciaBordas(meuToken, t);
      } catch (err) { continue; }
      if (distancia > raioMetros) continue;
      const temCondicao = t.actor.items.some(i =>
        (i.type === "condicao" || i.type === "efeito") && i.system.ativo &&
        (i.getFlag("core", "sourceId") === condicaoUuid || i.getFlag("nauren", "cadeiaRaizUuid") === condicaoUuid || i.getFlag("nauren", "origemUuid") === condicaoUuid)
      );
      if (temCondicao) contagem++;
    }
    return contagem;
  }

  /**
   * Substitui referências "@atributo" (ex: "@poderAtaque", "@forca") numa
   * fórmula livre pelo valor ATUAL do atributo/meta-atributo do personagem,
   * antes de rolar - é o que permite escrever fórmulas completas tipo
   * "1d6+@poderAtaque" direto no campo de Fórmula, em vez de campos
   * separados de atributo/bônus fixo. Nomes que não batem com nenhum
   * atributo conhecido viram 0 silenciosamente (ver _getAtributoValue).
   * "acao" (opcional): se informada e tiver "condicaoAlvoUuid" configurado,
   * também resolve "@alvoAcumulos" pra quantos acúmulos dessa Condição o
   * alvo selecionado tem agora - permite escrever "+@alvoAcumulos" (bônus
   * fixo por acúmulo) OU "(1+@alvoAcumulos)d10" (um DADO INTEIRO a mais por
   * acúmulo, ex: 1d10 base + 2 acúmulos = 3d10). Pra esse segundo caso
   * funcionar com certeza absoluta (sem depender de como o Foundry
   * interpretaria matemática dentro do "N" de "NdX"), a expressão dentro do
   * parêntese é resolvida AQUI MESMO pro número final de dados, antes da
   * fórmula ir pro Roll do Foundry - "(1+2)d10" viraria literalmente
   * "3d10", não fica matemática nenhuma pendente pro Foundry interpretar.
   */
  _substituirAtributosNaFormula(formula, acao = null) {
    if (!formula) return formula;
    let resolvida = formula;
    if (acao?.usaCondicaoAlvo && acao.condicaoAlvoUuid && /@alvoAcumulos\b/.test(resolvida)) {
      const acumulos = this._contarAcumulosNoAlvo(acao.condicaoAlvoUuid);
      resolvida = resolvida.replace(/@alvoAcumulos\b/g, String(acumulos));
    }
    if (acao?.usaCondicaoAlvo && /@alvoCondicoesDiferentes\b/.test(resolvida)) {
      const diferentes = this._contarCondicoesDiferentesNoAlvo();
      resolvida = resolvida.replace(/@alvoCondicoesDiferentes\b/g, String(diferentes));
    }
    if (acao?.usaCondicoesAlvoMultiplas && /@alvoTemCondicao\b/.test(resolvida)) {
      const tem = this._alvoTemCondicoes(acao.condicoesAlvoMultiplas, acao.logicaCondicoesAlvo);
      resolvida = resolvida.replace(/@alvoTemCondicao\b/g, String(tem));
    }
    if (acao?.usaCondicaoPropria && /@euTenhoCondicao\b/.test(resolvida)) {
      const tem = this._euTenhoCondicao(acao.condicaoPropriaUuid, acao.condicaoPropriaAcumulosMin);
      resolvida = resolvida.replace(/@euTenhoCondicao\b/g, String(tem));
    }
    if (acao?.usaCondicaoPropria && /@euTenhoCondicao2\b/.test(resolvida)) {
      const tem2 = this._euTenhoCondicao(acao.condicaoPropriaUuid2, acao.condicaoPropriaAcumulosMin2);
      resolvida = resolvida.replace(/@euTenhoCondicao2\b/g, String(tem2));
    }
    if (acao?.usaPerguntaAtaqueNoTurno && /@atacouNesteTurno\b/.test(resolvida)) {
      resolvida = resolvida.replace(/@atacouNesteTurno\b/g, this.#atacouNesteTurnoAtual ? "1" : "0");
    }
    if (acao?.usaEscolhaDeRecurso && /@quantidadeEscolhida\b/.test(resolvida)) {
      resolvida = resolvida.replace(/@quantidadeEscolhida\b/g, String(this.#quantidadeRecursoEscolhidaAtual));
    }
    // "@alvoEstresse" - Estresse ATUAL do primeiro alvo marcado (tecla T),
    // sempre disponível (não precisa de nenhum toggle, igual "@aliados_Nm")
    // - ex: Guilhotina Devastadora (Guerreiro), que causa dano extra por
    // ponto de Estresse que o ALVO possui (diferente de "@estresse", que é
    // sempre o SEU próprio Estresse).
    // "@alvoFerido" (1 se o alvo está abaixo da Vida máxima) e "@alvoMetadeVida" (1 se está na metade
    // ou menos) - M03, sempre disponíveis, lidos do primeiro alvo marcado.
    if (/@alvo(Ferido|MetadeVida)\b/.test(resolvida)) {
      const aT = Array.from(game.user.targets ?? [])[0]?.actor;
      const v = aT?.system?.vida?.value ?? 0, m = aT?.system?.vida?.max ?? 0;
      resolvida = resolvida.replace(/@alvoFerido\b/g, aT && v < m ? "1" : "0").replace(/@alvoMetadeVida\b/g, aT && m > 0 && v * 2 <= m ? "1" : "0");
    }
    if (/@alvoEstresse\b/.test(resolvida)) {
      const alvoToken = Array.from(game.user.targets)[0];
      const estresseAlvo = alvoToken?.actor?.system?.stress?.value ?? 0;
      resolvida = resolvida.replace(/@alvoEstresse\b/g, String(estresseAlvo));
    }
    if (acao?.usaContagemArea && acao.contagemAreaUuid && /@contagemArea\b/.test(resolvida)) {
      const raio = parseFloat(acao.contagemAreaRaio) || 0;
      const contagem = this._contarComCondicaoEmArea(acao.contagemAreaUuid, raio, acao.contagemAreaDisposicao || "aliados");
      resolvida = resolvida.replace(/@contagemArea\b/g, String(contagem));
    }
    // "@penitenciaAceita" (ver campoAcao > usaPenitencia, Sacerdote) -
    // 1 se a Penitência desta Magia foi aceita NESTA execução, 0 se
    // evitada ou se a Magia não usa Penitência. Sempre disponível (sem
    // precisar de nenhum toggle) - reutiliza "condicaoParaAtivar" de
    // qualquer Condição/Dano/Cura/Gasto de Recurso pra distinguir "só
    // quando aceitou a Penitência" sem nenhum campo hardcoded novo por
    // Magia (ex: Condemnatio - Subclasse Penitente "Flash de Luz" só
    // causa Cego na versão com Penitência).
    if (/@penitenciaAceita\b/.test(resolvida)) {
      resolvida = resolvida.replace(/@penitenciaAceita\b/g, acao?.penitenciaAceitaAgora ? "1" : "0");
    }
    // "@crescimento" - quantos níveis o jogador escolheu no popup de
    // Crescimento (ver _executarAcao). Sempre disponível (não depende de
    // "acao?.usaCrescimento" aqui de propósito: mesmo que ESTA fórmula
    // específica não tenha o toggle ligado, #nivelCrescimentoAtual já
    // volta pra 0 no início de toda Ação nova, então usar "@crescimento"
    // sem o toggle ligado só resolve pra 0 - sem quebrar nada).
    if (/@crescimento\b/.test(resolvida)) {
      resolvida = resolvida.replace(/@crescimento\b/g, String(this.#nivelCrescimentoAtual));
    }
    // "@aliados_<N>m" - não depende de nenhum toggle/configuração
    // extra na Ação, sempre disponível. Precisa ser resolvido ANTES da
    // passagem genérica de "@nome" logo abaixo, senão "aliados_4m" viraria
    // um nome de atributo desconhecido (0).
    if (/@aliados_\d+(\.\d+)?m\b/.test(resolvida)) {
      resolvida = resolvida.replace(/@aliados_(\d+(?:\.\d+)?)m\b/g, (match, raio) => String(this._contarAliadosProximos(parseFloat(raio))));
    }
    resolvida = resolvida.replace(/@(\w+)/g, (match, nome) => String(this._getAtributoValue(nome) ?? 0));
    // Resolve qualquer "(expressão)dX" pra um número de dados JÁ PRONTO
    // (ex: "(1+2)d10" -> "3d10") antes de rolar - garante certeza absoluta
    // de que o número de dados sai certo, sem depender de interpretação
    // de matemática dentro do "N" de "NdX" pelo motor de dados do Foundry.
    resolvida = resolvida.replace(/\(([^()]+)\)\s*d(\d+)/gi, (match, expressao, faces) => {
      try {
        const n = Math.max(0, Math.round(naurenAvaliarExpressaoSimples(expressao)));
        return `${n}d${faces}`;
      } catch (err) {
        return match; // não consegui entender essa parte - deixa como estava
      }
    });
    // Funções só com números (ex.: Raízes Afiadas "2*max(0,@rodadaCombate-1)") viram o resultado - o card mostrava "2 * 0 3 - 1".
    const soNumeros = /^[\d\s.+\-*/()]+$/;
    for (let volta = 0; volta < 5; volta++) {
      const antes = resolvida;
      resolvida = resolvida.replace(/\b(max|min|floor|ceil|round|abs)\(([^()]*)\)/gi, (m, fn, args) => {
        const partes = args.split(",").map(a => a.trim());
        if (!partes.length || !partes.every(a => a && soNumeros.test(a))) return m;
        const vals = partes.map(a => { try { return naurenAvaliarExpressaoSimples(a); } catch (err) { return NaN; } });
        if (vals.some(v => !Number.isFinite(v))) return m;
        const r = Math[fn.toLowerCase()](...vals);
        return Number.isFinite(r) ? String(r) : m;
      });
      if (resolvida === antes) break;
    }
    // "+0d8" (Crescimento não usado) some da fórmula.
    resolvida = resolvida.replace(/\+\s*0d\d+\b/gi, "");
    // Contas só com números viram o resultado ("+(0*4)" some, "+(1*4)" vira "+4"): o card mostrava "1d10+6 + 0 * 4".
    resolvida = resolvida.replace(/([+\-])\s*\(\s*(\d+(?:\.\d+)?)\s*([*/])\s*(\d+(?:\.\d+)?)\s*\)(?!\s*d)/g, (m, sinal, a, op, b) => {
      const v = op === "*" ? Number(a) * Number(b) : (Number(b) ? Number(a) / Number(b) : 0);
      if (!Number.isFinite(v)) return m;
      const r = Math.floor(v);
      return r === 0 ? "" : `${sinal}${r}`;
    });
    return resolvida;
  }

  /**
   * Bônus e dados extras de dano/cura vindos de itens de Efeito ativos
   * (já calculados e guardados pelo NaurenActor#prepareDerivedData).
   * Usado em QUALQUER rolagem de dano ou cura do personagem.
   */
  /**
   * "tipoItem" (opcional, "magia"|"arma"|"habilidade") - quando
   * passado, soma por cima do bucket geral o bucket específico
   * daquele tipo (ver campoModificador > restringirTipoItem, ex:
   * Terra Mágica - "+1 dado só em Magias"). Sem "tipoItem" (chamadas
   * antigas), comportamento idêntico a antes - só o bucket geral.
   */
  _getBonusDanoCuraDeEfeitos(tipoItem = null) {
    const sys = this.actor.system;
    const porTipo = (tipoItem && sys.efeitoPorTipoItem?.[tipoItem]) || null;
    return {
      efeitoDanoBonus: (sys.efeitoDanoBonus || 0) + (porTipo?.danoBonus || 0),
      efeitoDanoDados: [...(sys.efeitoDanoDados || []), ...(porTipo?.danoDados || [])],
      efeitoCuraBonus: (sys.efeitoCuraBonus || 0) + (porTipo?.curaBonus || 0),
      efeitoCuraDados: [...(sys.efeitoCuraDados || []), ...(porTipo?.curaDados || [])]
    };
  }

  /**
   * Extrai a face "crua" do d20 de uma rolagem (para saber se foi 20 ou 1 natural),
   * independente dos bônus somados na fórmula.
   */
  _getD20Face(roll) {
    const die = roll.dice?.find(d => d.faces === 20);
    return die?.results?.[0]?.result ?? null;
  }

  /**
   * Reconstrói qualquer rolagem já avaliada como um texto auditável, mostrando
   * o resultado de cada dado entre parênteses. Ex: "1d20 + 5 + 4" com resultado
   * 4 no d20 vira "1d20(4) + 5 + 4". Funciona com qualquer fórmula (inclusive
   * compostas, como "1d10+5" digitado à mão em uma arma).
   */
  _rollToBreakdownText(roll) {
    return naurenRollToBreakdownText(roll);
  }

  /** Dobra a quantidade de cada dado de uma fórmula (para dano em acerto crítico). */
  _doubleDice(formula) {
    return formula.replace(/(\d+)d(\d+)/gi, (m, n, f) => `${Number(n) * 2}d${f}`);
  }

  /** Verifica se a rolagem usada (considerando vantagem/dificuldade) foi um acerto crítico. "ajuste" (opcional) desloca o Crítico Mínimo só pra esta checagem (ver campoAcao > critMinAjuste; negativo = mais fácil critar). */
  _isCrit(d20Result, ajuste = 0) {
    if (!d20Result) return false;
    const face = this._getD20Face(d20Result.rolls[d20Result.usedIndex]);
    return face !== null && face >= ((this.actor.system.critMinTotal ?? 20) + ajuste - naurenAjusteCriticoDoGrupo(this.actor).valor);
  }

  /**
   * Rola um d20 (mais o que for passado em extraFormula) respeitando o modo de
   * rolagem configurado na aba Opções da ficha (normal / facilidade / dificuldade).
   * Em vantagem/dificuldade, rola dois d20 separados e marca qual foi usado.
   */
  /** Oferece Destino e só então anuncia 20/1 naturais (resultado final). */
  async _finalizarD20(resultado, destino) {
    if (destino) await naurenOferecerDestino(this.actor, resultado, destino);
    else await naurenAplicarAcalanto(this.actor, resultado);
    // Último d20 (Tudo é Meu!: um Ladino aliado pode roubá-lo).
    const faceFinal = naurenFaceD20(resultado.rolls?.[resultado.usedIndex]);
    if (faceFinal && this.actor.isOwner) this.actor.setFlag("nauren", "ultimoD20", { face: faceFinal, rotulo: destino?.titulo ?? "", quando: Date.now() }).catch(() => {});
    this._notificarGrupoSeNaturalExtremo(resultado);
    return resultado;
  }

  async _rollD20WithMode(extraFormula = "", tipoRolagem = null, modoExtra = "normal", modoTravado = null, tipoItem = null, destino = null) {
    // 0.94.1: Condições "some no próximo teste" (Monóculo) valem nesta rolagem e saem logo depois.
    if (tipoRolagem === "teste" || tipoRolagem === "ataque") {
      const uma = this.actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && i.system.removerAoTestar && !naurenEhCondicaoModelo(i));
      if (uma.length) setTimeout(() => naurenApagarItensSeExistirem(this.actor, uma.map(i => i.id)).then(() => naurenPostarCard({ ator: this.actor, titulo: "Condição encerrada", icone: uma[0].img,
        linhas: uma.map(i => ({ label: i.name, value: "usada", breakdown: `valeu nesta rolagem (${tipoRolagem === "teste" ? "teste" : "ataque"})` })) })).catch(() => {}), 0);
    }
    // "modoTravado": quando vem do popup de pré-Ação (o jogador viu o que
    // já estava ativo e escolheu manter ou mudar), essa escolha FINAL
    // substitui todo o cálculo automático abaixo (Global + Condição/Efeito
    // + modoExtra) - null (padrão, todo uso já existente) mantém o
    // comportamento de sempre, somando os 3 fatores normalmente.
    // 0.94.11: Facilidades/Dificuldades além da primeira viram ±2 no teste (livro, Cap. I).
    // Com o modo escolhido no popup, as extras só valem se ele for o mesmo lado do automático.
    {
      const somaAuto = this._somaModo(tipoRolagem, modoExtra, tipoItem);
      const n = !modoTravado ? somaAuto
        : (modoTravado === "vantagem" && somaAuto > 1) || (modoTravado === "desvantagem" && somaAuto < -1) ? somaAuto : 0;
      const bonusExtra = naurenBonusModoExtra(n);
      if (bonusExtra) {
        extraFormula = `${extraFormula ? `${extraFormula} ` : ""}${bonusExtra > 0 ? `${extraFormula ? "+ " : ""}${bonusExtra}` : `- ${-bonusExtra}`}`;
        const linha = naurenLinhaModoExtra(n);
        if (destino) { destino.bonusLinhas = Array.isArray(destino.bonusLinhas) ? destino.bonusLinhas : []; destino.bonusLinhas.push(linha); }
        this._ultimaLinhaModoExtra = linha;
      } else this._ultimaLinhaModoExtra = null;
    }
    const juntar = f => `1d20${f ? (/^\s*-/.test(f) ? ` ${f.trim()}` : ` + ${f}`) : ""}`;
    if (modoTravado) {
      const formulaTravada = juntar(extraFormula);
      if (modoTravado === "normal") {
        const rollA = await new Roll(formulaTravada).evaluate();
        if (game.dice3d) await game.dice3d.showForRoll(rollA, game.user, true);
        const resultado = { mode: "normal", rolls: [rollA], usedIndex: 0 };
        return await this._finalizarD20(resultado, destino);
      }
      const rollA = await new Roll(formulaTravada).evaluate();
      const rollB = await new Roll(formulaTravada).evaluate();
      if (game.dice3d) {
        await game.dice3d.showForRoll(rollA, game.user, true);
        await game.dice3d.showForRoll(rollB, game.user, true);
      }
      const usedIndex = modoTravado === "vantagem"
        ? (rollA.total >= rollB.total ? 0 : 1)
        : (rollA.total <= rollB.total ? 0 : 1);
      const resultado = { mode: modoTravado, rolls: [rollA, rollB], usedIndex };
      return await this._finalizarD20(resultado, destino);
    }
    // Modo GLOBAL (aba Opções da ficha) combinado com a Facilidade/
    // Dificuldade que vier de Condições/Efeitos pro tipo específico desta
    // rolagem (ver NAUREN_CAMPOS_MODIFICADOR_OPCOES > "vantagem*"). Os
    // dois se somam como +1/-1 e podem se anular entre si.
    const somado = this._somaModo(tipoRolagem, modoExtra, tipoItem);
    // Restrição a Tipo de Item (ver campoModificador > restringirTipoItem,
    // ex: Terra Mágica - "Facilidade só em ataques com Magia") - só
    // "vantagemAtaque" tem esse bucket separado (ver prepareDerivedData),
    // então só entra aqui pra "tipoRolagem === 'ataque'" e quando quem
    // chamou sabe (e passou) o tipo do item sendo usado agora.
    const mode = somado > 0 ? "vantagem" : somado < 0 ? "desvantagem" : "normal";
    const formula = juntar(extraFormula);

    const rollA = await new Roll(formula).evaluate();
    if (mode === "normal") {
      if (game.dice3d) await game.dice3d.showForRoll(rollA, game.user, true);
      const resultado = { mode, rolls: [rollA], usedIndex: 0 };
      return await this._finalizarD20(resultado, destino);
    }

    const rollB = await new Roll(formula).evaluate();
    if (game.dice3d) {
      await game.dice3d.showForRoll(rollA, game.user, true);
      await game.dice3d.showForRoll(rollB, game.user, true);
    }
    const usedIndex = mode === "vantagem"
      ? (rollA.total >= rollB.total ? 0 : 1)
      : (rollA.total <= rollB.total ? 0 : 1);
    const resultado = { mode, rolls: [rollA, rollB], usedIndex };
    return await this._finalizarD20(resultado, destino);
  }

  /**
   * Mesma soma de "Modo GLOBAL + Facilidade/Dificuldade de Condição/Efeito
   * + modoExtra" já usada dentro de "_rollD20WithMode", só que sem rolar
   * nada - usado pra PRÉ-SELECIONAR a opção certa no popup de pré-Ação
   * (mostra pro jogador o que já estaria valendo, antes dele decidir se
   * quer mudar).
   * Bug real corrigido: esta função nunca soube de "vantagemAtaqueModoPorTipoItem"
   * (ver campoModificador > restringirTipoItem, ex: Terra Mágica -
   * "Facilidade só com Magia") - o popup sempre mostrava/travava
   * "Normal" mesmo com a Condição de Presença ativa, e como o
   * resultado deste cálculo se torna "modoTravado" em _rollD20WithMode
   * (que MESMO SEM O JOGADOR MUDAR NADA, sobrescreve todo o cálculo
   * automático), a facilidade de verdade nunca chegava a valer.
   */
  /**
   * Lista legível de TUDO que pôs Facilidade/Dificuldade automática neste ataque (popup de uso):
   * opção da ficha, Condições/Efeitos/Habilidades do atacante, as restritas ao tipo de item,
   * o que o ALVO marcado tem (ex.: Caído dá Facilidade a quem ataca), área de conjuração e as
   * Condições que não valem contra quem as aplicou. delta: +1 Facilidade, −1 Dificuldade.
   */
  _fontesModoAtaque(item, acao, localBonus = {}) {
    const lista = [];
    const sys = this.actor.system;
    const nomeLimpo = o => String(o ?? "?");
    const txt = (d, quem = "") => d > 0 ? `Facilidade${quem}` : `Dificuldade${quem}`;
    const modoGlobal = sys.modoRolagem || "normal";
    if (modoGlobal !== "normal") lista.push({ fonte: "Opção da ficha (modo de rolagem)", efeito: txt(modoGlobal === "vantagem" ? 1 : -1, " em todas as rolagens"), delta: modoGlobal === "vantagem" ? 1 : -1 });
    for (const f of sys.fontesVantagem?.vantagemAtaque ?? []) lista.push({ fonte: nomeLimpo(f.origem), efeito: txt(f.delta, " nos seus ataques"), delta: f.delta });
    const tipoItem = item?.type;
    const rotTipo = { magia: "Magias", arma: "Armas", habilidade: "Habilidades" }[tipoItem] ?? tipoItem;
    if (tipoItem) for (const f of sys.fontesVantagem?.[`vantagemAtaque:${tipoItem}`] ?? []) lista.push({ fonte: nomeLimpo(f.origem), efeito: txt(f.delta, ` em ataques com ${rotTipo}`), delta: f.delta });
    const alvos = Array.from(game.user.targets ?? []);
    const alvo = alvos[0];
    if (alvo?.actor) {
      const nomeAlvo = alvo.document?.name ?? alvo.name ?? alvo.actor.name;
      for (const f of alvo.actor.system?.fontesVantagem?.vantagemAtaqueRecebido ?? []) lista.push({ fonte: `Alvo ${nomeAlvo}: ${nomeLimpo(f.origem)}`, efeito: txt(f.delta, " para quem ataca"), delta: f.delta });
      if (this.#emPrioridadeAtual) for (const f of alvo.actor.system?.fontesVantagem?.vantagemAtaqueRecebidoPrioridade ?? []) lista.push({ fonte: `Alvo ${nomeAlvo}: ${nomeLimpo(f.origem)}`, efeito: txt(f.delta, " para quem ataca numa Prioridade"), delta: f.delta });
      for (const c of naurenCompensacoesContraOrigem(this.actor, alvo) ?? []) {
        if (!c.vantagemAtaque) continue;
        lista.push({ fonte: c.nome, efeito: `não vale contra ${nomeAlvo} (quem aplicou): ${c.vantagemAtaque < 0 ? "Dificuldade removida" : "Facilidade removida"}`, delta: -c.vantagemAtaque });
      }
      if (alvos.length > 1) lista.push({ fonte: "Vários alvos marcados", efeito: `vale só o que vem do 1º alvo (${nomeAlvo})`, delta: 0 });
    }
    if (localBonus?.facilidadeBuffConjuracao) lista.push({ fonte: "Área de conjuração em que você está", efeito: "Facilidade (só Magias)", delta: 1 });
    if (acao?.condensarFacilidade) lista.push({ fonte: "Conjuração Poderosa", efeito: `Facilidade${this.#poderosaAtual?.acertoExtra ? ` e +${this.#poderosaAtual.acertoExtra} no teste` : ""}`, delta: 1 });
    return lista;
  }

  _calcularModoEfetivo(tipoRolagem = null, modoExtra = "normal", tipoItem = null) {
    const somado = this._somaModo(tipoRolagem, modoExtra, tipoItem);
    return somado > 0 ? "vantagem" : somado < 0 ? "desvantagem" : "normal";
  }
  /** 0.94.11: quantas Facilidades (+) / Dificuldades (−) esta rolagem tem: opção da ficha + Condições/Efeitos + tipo de item + o que vem de fora (alvo). */
  _somaModo(tipoRolagem = null, modoExtra = "normal", tipoItem = null) {
    const sys = this.actor.system, cont = sys.vantagemContagem ?? {};
    const porTipo = { ataque: cont.ataque ?? naurenNumeroModo(sys.vantagemAtaqueModo), esquiva: cont.esquiva ?? naurenNumeroModo(sys.vantagemEsquivaModo), teste: cont.teste ?? naurenNumeroModo(sys.vantagemTesteModo) }[tipoRolagem] ?? 0;
    const porItem = (tipoRolagem === "ataque" && tipoItem) ? (cont.porTipoItem?.[tipoItem] ?? naurenNumeroModo(sys.vantagemAtaqueModoPorTipoItem?.[tipoItem])) : 0;
    return naurenNumeroModo(sys.modoRolagem || "normal") + porTipo + porItem + naurenNumeroModo(modoExtra);
  }


  /**
   * Checa a face do d20 EFETIVAMENTE usado (respeitando vantagem/dificuldade)
   * e, se for um 20 ou 1 natural, avisa o(s) Grupo(s) de Jogadores dos quais
   * este ator é membro pra somar 1 ponto de Graça do Destinado / Perjúrio do
   * Acaso (Capítulo III). Roda em segundo plano (não bloqueia a rolagem).
   */
  _notificarGrupoSeNaturalExtremo(d20Result) {
    const face = this._getD20Face(d20Result.rolls[d20Result.usedIndex]);
    // Faixas ajustáveis (ver "perjurioLimiarTotal"/"gracaLimiarTotal",
    // ex: Traumatizado alarga o Perjúrio pra "1 e 2") - 0 (padrão) volta
    // ao comportamento de sempre, só o 1/20 exato.
    const { perjurioMax, gracaMin } = NaurenGrupoHelper.limiares(this.actor);
    if (face > perjurioMax && face < gracaMin) return;
    const tipo = face <= perjurioMax ? "perjurio" : "graca";
    NaurenGrupoHelper.notificarRolagem(this.actor, face, tipo).catch(err => console.warn("Nauren RPG | Falha ao notificar Grupo de Jogadores.", err));
  }

  /** Enriquece um campo de descrição HTML (links, rolagens embutidas, etc). */
  async _enrichDescription(raw) {
    if (!raw) return "";
    const { TextEditor } = foundry.applications.ux;
    return (foundry.applications?.ux?.TextEditor?.implementation ?? TextEditor).enrichHTML(raw, { secrets: this.actor.isOwner, relativeTo: this.actor });
  }

  /**
   * Monta e posta no chat o card padronizado de rolagem (tema roxo da ficha),
   * com caixa(s) de d20 (destacando crítico/desastre e vantagem/dificuldade),
   * linhas secundárias resumidas (dano/cura/etc) e uma seção expansível com
   * o detalhamento de bônus/atributos usados e a descrição do item.
   */
  /** Monta as caixas de d20 (usado tanto pro resultado principal quanto pra cada "extra"). */
  /** Monta as caixas de d20 (usado tanto pro resultado principal quanto pra cada "extra"). "ajusteCritico" (opcional) desloca o Crítico Mínimo só pra esta rolagem (ver campoAcao > critMinAjuste). */
  _buildD20Boxes(d20Result, ajusteCritico = 0) {
    const critMin = (this.actor.system.critMinTotal ?? 20) + ajusteCritico - naurenAjusteCriticoDoGrupo(this.actor).valor;
    const critFailMax = this.actor.system.critFailMaxTotal ?? 1;
    const isAdvDis = d20Result && d20Result.mode !== "normal";
    const d20Boxes = (d20Result?.rolls ?? []).map((roll, i) => {
      const face = this._getD20Face(roll);
      const used = !isAdvDis || i === d20Result.usedIndex;
      const isCrit = used && face !== null && face >= critMin;
      const isFumble = !isCrit && used && face !== null && face <= critFailMax;
      const classes = [];
      if (isCrit) classes.push("nrc-crit");
      else if (isFumble) classes.push("nrc-fumble");
      if (isAdvDis && !used) classes.push("nrc-unused");
      let label = "Resultado";
      if (isAdvDis) label = (d20Result.mode === "vantagem" ? "Facilidade" : "Dificuldade") + (i === 0 ? " A" : " B");
      // Mesmo ícone usado em Graça do Destinado (nat 20, estrela) e
      // Perjúrio do Acaso (nat 1, caveira) - dá pra reconhecer de cara que
      // aquele resultado específico é o que gera ponto de Graça/Perjúrio.
      return { label, total: roll.total, breakdown: this._rollToBreakdownText(roll), cssClass: classes.join(" "), isCrit, isFumble };
    });
    return { isAdvDis, d20Boxes };
  }

  /**
   * Posta UM card de chat. "extras" (opcional) é uma lista de rolagens que
   * pertencem à MESMA ação (ex: ataque/dano marcados "rolar separado") mas
   * aparecem como seções compactas DENTRO do mesmo card, separadas por um
   * divisor discreto, em vez de virarem mensagens de chat à parte.
   */
  async _postRollCard({ title, icon, d20Result, secondaryLines = [], breakdown = [], breakdownAlvos = [], description = "", extras = [], ajusteCritico = 0, acoesManuais = null, prioridade = null, fonte = "" }) {
    const historicoDestino = naurenTextoHistoricoDestino(d20Result);
    if (historicoDestino) breakdown = [...breakdown, { label: "Rerolado com Destino", value: historicoDestino }];
    const { isAdvDis, d20Boxes } = this._buildD20Boxes(d20Result, ajusteCritico);
    const caixaUsada = d20Boxes.find(b => b.isCrit) ?? d20Boxes.find(b => b.isFumble);
    if (caixaUsada) naurenAnimarCritico(this.actor, caixaUsada.isCrit ? "critico" : "falha");
    // Ajuste do alvo na rolagem de ataque (ex.: Olhar Culposo -1d10).
    const ajustes = this.#ajustesAtaqueAtual ?? [];
    this.#ajustesAtaqueAtual = [];
    // Cada parte do texto já vem com o sinal e a fonte ("−2 (Verdade Atordoante)"); antes o card
    // somava outro sinal e repetia a fonte ("+ 2 − −2 (Verdade Atordoante) (Verdade Atordoante)").
    const textoAjuste = aj => {
      const t = String(aj.texto ?? "").trim().replace(/(\d)\s*-\s*(\d)/g, "$1 − $2");
      const comFonte = aj.fontes?.every(f => t.includes(f)) ? t : `${t} (${(aj.fontes ?? []).join(", ")})`;
      return /^[-+−]/.test(comFonte) ? comFonte.replace(/^-/, "−").replace(/^([+−])\s*/, "$1 ") : `${aj.total >= 0 ? "+" : "−"} ${comFonte}`;
    };
    if (ajustes.length === 1 && d20Boxes.length) {
      const caixa = d20Boxes.find(b => !String(b.cssClass).includes("nrc-unused")) ?? d20Boxes[0];
      caixa.breakdown = `${caixa.breakdown} ${textoAjuste(ajustes[0])}`;
      caixa.total = ajustes[0].final;
    } else {
      for (const aj of ajustes) secondaryLines = [...secondaryLines, { label: `Ataque contra ${aj.alvo}`, value: aj.final, breakdown: textoAjuste(aj) }];
    }

    const extrasData = extras.map(extra => {
      const built = this._buildD20Boxes(extra.d20Result);
      return {
        titulo: extra.titulo,
        hasD20: built.d20Boxes.length > 0,
        isAdvDis: built.isAdvDis,
        d20Boxes: built.d20Boxes,
        secondaryLines: extra.secondaryLines ?? [],
        breakdown: extra.breakdown ?? []
      };
    });

    const temDetalhesExtras = extrasData.some(e => e.breakdown.length > 0);

    // ===== Botões manuais (Tomar Dano/Cura/Recuperar Recurso) - ver
    // NAUREN_CHAT_BOTOES_MANUAIS. Só monta a lista de botões se houver
    // algo pra oferecer (dano > 0, cura > 0, ou algum custo > 0) - o card
    // não ganha a seção nenhuma se a Ação não tinha nada disso.
    const botoesManuais = [];
    if (acoesManuais?.dano > 0) {
      botoesManuais.push(
        { label: "Dano", acao: "dano", mult: "1", valor: acoesManuais.dano },
        { label: "Dano ½", acao: "dano", mult: "0.5", valor: Math.floor(acoesManuais.dano / 2) },
        { label: "Dano ¼", acao: "dano", mult: "0.25", valor: Math.floor(acoesManuais.dano / 4) },
        { label: "Dano x2", acao: "dano", mult: "2", valor: acoesManuais.dano * 2 }
      );
    }
    if (acoesManuais?.cura > 0) {
      botoesManuais.push(
        { label: "Curar", acao: "cura", mult: "1", valor: acoesManuais.cura },
        { label: "Curar ½", acao: "cura", mult: "0.5", valor: Math.floor(acoesManuais.cura / 2) },
        { label: "Curar ¼", acao: "cura", mult: "0.25", valor: Math.floor(acoesManuais.cura / 4) },
        { label: "Curar x2", acao: "cura", mult: "2", valor: acoesManuais.cura * 2 }
      );
    }
    const botoesRecurso = [];
    if (acoesManuais?.custoEstamina > 0) botoesRecurso.push({ label: "↩ Estamina", recurso: "estaminaCombate", valor: acoesManuais.custoEstamina });
    if (acoesManuais?.custoMana > 0) botoesRecurso.push({ label: "↩ Mana", recurso: "mana", valor: acoesManuais.custoMana });

    // O que aconteceu em cada alvo fica VISÍVEL no card (antes só aparecia ao abrir o detalhamento);
    // a linha "Alvo(s)" com só os nomes vira redundante. O custo pago também fica à vista.
    if (breakdownAlvos.length) secondaryLines = secondaryLines.filter(l => l.label !== "Alvo(s)");
    // "+ -1" vira "− 1" em tudo que o jogador lê no card.
    const legivel = v => typeof v === "string" ? v.replace(/\+\s*-\s*(?=\d)/g, "− ") : v;
    secondaryLines = secondaryLines.map(l => ({ ...l, value: legivel(l.value), breakdown: legivel(l.breakdown) }));
    breakdown = breakdown.map(l => ({ ...l, value: legivel(l.value) }));
    for (const b of d20Boxes) b.breakdown = legivel(b.breakdown);
    const custoVisivel = breakdown.find(l => l.label === "Custo")?.value ?? "";
    // Título sem repetição ("Chute do Nascer do Sol — Chute do Nascer do Sol").
    const partesTitulo = String(title ?? "").split(" — ");
    if (partesTitulo.length === 2 && partesTitulo[0].trim() === partesTitulo[1].trim()) title = partesTitulo[0];
    const templateData = {
      title,
      custoVisivel,
      icon: icon || "icons/svg/d20-highlight.svg",
      actorName: this.actor.name,
      playerName: game.user.name,
      playerColor: game.user.color.css,
      hasD20: d20Boxes.length > 0,
      isAdvDis,
      d20Boxes,
      secondaryLines,
      breakdown,
      breakdownAlvos, // linhas sanitizadas de alvo (sem Defesa/Agilidade/Vitalidade expostas)
      // Descrição da regra: seção própria, sempre acessível (aberta ou
      // recolhida conforme a preferência de cada jogador).
      descricaoRegra: description,
      fonte,
      prioridade,
      extras: extrasData,
      botoesManuais,
      botoesRecurso,
      hasDetails: breakdown.length > 0 || temDetalhesExtras || botoesManuais.length > 0 || botoesRecurso.length > 0
    };

    const html = await foundry.applications.handlebars.renderTemplate("systems/nauren/templates/chat/roll-card.hbs", templateData);
    const flagsNauren = { casterUuid: this.actor.uuid };
    // Tudo é Meu! (Ladino): a face do d20 usado, para um Ladino aliado poder roubá-lo pelo card.
    const faceCard = d20Result ? naurenFaceD20(d20Result.rolls?.[d20Result.usedIndex]) : null;
    if (faceCard) flagsNauren.d20Face = faceCard;
    // Card com Prioridade a conceder por clique: guarda os dados do
    // template para redesenhar o card quando um aliado for escolhido.
    if (prioridade?.selecao) flagsNauren.cardData = templateData;
    // Fase 6 (O): entidade de campo criada por esta Ação (depois do card).
    const entidade = this.#entidadePendente;
    this.#entidadePendente = null;
    if (entidade) setTimeout(() => this._criarEntidadeDeCampo(entidade).catch(err => console.warn("Nauren RPG | Falha ao criar entidade de campo.", err)), 50);
    // O card provisório "aguardando reação" vira o card final.
    const aguardando = this.#mensagemAguardando;
    this.#mensagemAguardando = null;
    if (aguardando && game.messages.get(aguardando.id)) {
      await aguardando.update({ content: html, flags: { nauren: flagsNauren } });
      this._ultimaMensagemCard = aguardando; // "Dar Prioridade" com alvo marcado concede por este card
      return;
    }
    this._ultimaMensagemCard = await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: html,
      // Guardado pro clique dos botões manuais poder achar tudo de volta
      // depois - o card pode ser clicado a qualquer momento no futuro,
      // então nada disso pode depender de variável só em memória.
      flags: { nauren: flagsNauren }
    });
  }

  /**
   * Rola um teste simples de 1d20 + atributo/meta-atributo, disparado ao clicar
   * num atributo ou meta-atributo na barra lateral da ficha. Testar Destino
   * consome 1 Dado de Destino.
   */
  async _rollAttributeTest(key, label) {
    if (key === "destino") {
      const atual = this.actor.system.dadosDestino.value;
      if (atual <= 0) {
        ui.notifications.warn("Sem Dados de Destino disponíveis!");
        return;
      }
      await this.actor.update({ "system.dadosDestino.value": atual - 1 });
      naurenProcessarGatilhos("euGasteiDadoDeDestino", this.actor).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (gastei Dado de Destino).", err));
      naurenProcessarGatilhos("aliadoGastouDadoDeDestino", this.actor).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (aliado gastou Dado de Destino).", err));
    }

    const valor = this._getAtributoValue(key);
    const d20Result = await this._rollD20WithMode(String(valor), "teste", "normal", null, null,
      { titulo: `Teste de ${label}`, tipo: "teste", bonusLinhas: [{ label, value: `+${valor}` }] });

    await this._postRollCard({
      title: `Teste de ${label}`,
      icon: this.actor.img,
      d20Result,
      breakdown: [{ label: "Atributo usado", value: `${label} (+${valor})` }]
    });
  }

  /**
   * Lida com o uso de qualquer item consumidor de recursos: armas, magias,
   * habilidades, armaduras (poderes ativos opcionais) e consumíveis.
   */

  /**
   * Bônus/dados de ataque, dano e cura vindos SÓ dos Efeitos Vinculados
   * DESTA Ação específica (não os globais de Opções/Efeitos soltos). São
   * resolvidos na hora, direto dos itens de Efeito - não passam pelo
   * NaurenActor#prepareDerivedData, porque só valem enquanto ESSA ação
   * está sendo usada, não ficam "ligados" o tempo todo.
   */
  _resolverEfeitosDaAcao(acao) {
    const resultado = { ataqueBonus: 0, ataqueDados: [], danoBonus: 0, danoDados: [], curaBonus: 0, curaDados: [] };
    for (const v of acao.efeitosVinculados ?? []) {
      if (!v.ativo) continue; // checkbox individual do vínculo - não depende do "Efeito ativo" da ficha
      const efeito = this.actor.items.get(v.id);
      if (!efeito || efeito.type !== "efeito") continue;
      const s = efeito.system;
      if (s.ataque) resultado.ataqueBonus += s.ataque;
      if (s.ataqueDado) resultado.ataqueDados.push(s.ataqueDado);
      if (s.danoBonus) resultado.danoBonus += s.danoBonus;
      if (s.danoDado) resultado.danoDados.push(s.danoDado);
      if (s.curaBonus) resultado.curaBonus += s.curaBonus;
      if (s.curaDado) resultado.curaDados.push(s.curaDado);
    }
    return resultado;
  }

  /** Rola o teste de ataque de uma Ação (no máximo 1 por Ação). */
  /**
   * Resolve o valor "por rank": pega
   * a entrada de MAIOR rank que seja ≤ rankAtual numa lista [{rank, formula}]
   * - mesma lógica de "pega o maior nível configurado que seja ≤ nível
   * atual" usada em vários lugares de RPG (ex: magias que escalam por nível
   * de personagem). Devolve null se rankAtual for 0, a lista estiver vazia,
   * ou nenhuma entrada tiver rank ≤ rankAtual - nesses casos quem chamou usa
   * o valor normal do campo (a fórmula/bônus "sem rank").
   */
  _resolverPorRank(lista, rankAtual, campo = "formula") {
    return naurenResolverPorRank(lista, rankAtual, campo);
  }

  /**
   * Fórmula final (rank + camadas de Subclasse) de um bloco da 1ª Ação de outro item do personagem.
   * "ref" = "seedId ou nome#curas.0" (ex.: a cura do Orbe de Luz = a cura da Sanatio).
   */
  _formulaDeOutroItem(ref) {
    const [quem, caminho = "curas.0"] = String(ref ?? "").split("#");
    const it = this.actor.items.find(i => i.getFlag("nauren", "seedId") === quem) ?? this.actor.items.find(i => i.name === quem);
    let acao = it?.system?.acoes?.[0];
    if (!acao) return "";
    try { const mods = this._coletarModificadoresExternos(it, 0); if (mods?.length) acao = this._aplicarModificadoresExternos(acao, mods).acao; } catch (err) { /* sem camadas */ }
    const bloco = foundry.utils.getProperty(acao, caminho);
    if (!bloco) return "";
    return this._resolverPorRank(bloco.porRank, this._rankEfetivo(it)) || bloco.formula || "";
  }

  /**
   * Gatilho Condicional genérico - resolve uma fórmula de "só ativa se"
   * (ex: "@atacouNesteTurno", "@quantidadeEscolhida>=2") e devolve
   * true/false. Delega pra "_substituirAtributosNaFormula" (o MESMO
   * método central já usado por "ataqueBonusExtra" e outros campos
   * livres) - assim ganha de graça TODOS os tokens que ele já resolve
   * (@atacouNesteTurno, @quantidadeEscolhida, @crescimento,
   * @alvoEstresse, @aliados_Nm, @alvoAcumulos, qualquer @atributo...),
   * em vez de reimplementar uma versão parcial só com 3 tokens. Um
   * único lugar central pra resolver "@tokens" em qualquer fórmula
   * desta ficha - corrigir/estender ali beneficia tudo que usa isto.
   */
  _condicaoParaAtivarPassou(formulaAtiva, acao = null) {
    if (!formulaAtiva) return true; // sem condição = sempre ativa, como sempre foi
    const resolvida = this._substituirAtributosNaFormula(formulaAtiva, acao);
    let valor = 0;
    try { valor = naurenAvaliarExpressaoSimples(resolvida); } catch (err) { valor = 0; }
    return !!valor;
  }

  /**
   * Mesma resolução de "@tokens" acima, mas devolve o VALOR NUMÉRICO
   * (arredondado) em vez de true/false - pra campos "bônus" em vez de
   * "gatilho" (ex: "+2 se @atacouNesteTurno"). Mesmo método central,
   * consolidando o que antes cada "...ExtraPorCrescimento" resolvia à
   * mão, cada um com sua própria lista parcial de tokens substituídos.
   */
  _resolverBonusComTokens(formulaBonus, acao = null) {
    if (!formulaBonus) return 0;
    const resolvida = this._substituirAtributosNaFormula(formulaBonus, acao);
    let valor = 0;
    try { valor = naurenAvaliarExpressaoSimples(resolvida); } catch (err) { valor = 0; }
    return Math.round(valor);
  }

  /**
   * Escala TODO dado "dN" dentro de uma fórmula de dano em "casas" na
   * sequência d4→d6→d8→d10→d12 (ex: Disparo Carregado, Caçador -
   * "escale o dado de dano da arma em uma casa"). Nunca passa de d12
   * (o "dado máximo" citado no manual), mesmo pedindo mais casas do
   * que o necessário pra chegar lá. Um dado fora dessa sequência
   * padrão (ex: "d100", raro) é deixado como está - não tem "próxima
   * casa" definida pra ele. "2d6+2*@poderAtaque" com 1 casa vira
   * "2d8+2*@poderAtaque" - só o(s) "dN" mudam, o resto da fórmula
   * (multiplicadores, atributos) fica intacto.
   */
  _escalarDadosNaFormula(formula, casas) {
    if (!formula || !casas) return formula;
    const sequencia = [4, 6, 8, 10, 12];
    return String(formula).replace(/d(\d+)/gi, (match, faceAtual) => {
      const indiceAtual = sequencia.indexOf(Number(faceAtual));
      if (indiceAtual === -1) return match;
      const novoIndice = Math.min(sequencia.length - 1, indiceAtual + casas);
      return `d${sequencia[novoIndice]}`;
    });
  }

  /**
   * Troca o tamanho do MAIOR dado já presente na fórmula pro tamanho
   * ABSOLUTO indicado (ex: "1d4+@poderMagia", "d8" → "1d8+@poderMagia") -
   * usada pelo modo "trocarTamanhoDado" de Modificador Externo (ver
   * campoModificadorExterno). Reaproveita "_escalarDadosNaFormula"
   * (que já existe, mas trabalha em CASAS relativas, não num tamanho
   * absoluto) calculando a diferença entre o dado atual e o destino.
   * Devolve a fórmula intocada se não achar dado nenhum, ou se o destino
   * não for um dos tamanhos válidos (d4/d6/d8/d10/d12).
   */
  // Sobe cada dado da fórmula N passos na escada d4→d6→d8→d10→d12→d20 (teto d20).
  _subirDadoNaFormula(formula, passos) {
    const n = Math.round(Number(passos) || 0);
    if (!formula || !n) return formula;
    const escada = [4, 6, 8, 10, 12, 20];
    return String(formula).replace(/d(\d+)/gi, (m, f) => {
      const i = escada.indexOf(Number(f));
      if (i === -1) return m;
      return `d${escada[Math.max(0, Math.min(escada.length - 1, i + n))]}`;
    });
  }

  _trocarTamanhoDadoNaFormula(formula, faceDestino) {
    if (!formula || !faceDestino) return formula;
    const sequencia = [4, 6, 8, 10, 12];
    const faceDestinoNum = Number(String(faceDestino).replace(/^d/i, ""));
    const indiceDestino = sequencia.indexOf(faceDestinoNum);
    if (indiceDestino === -1) return formula;
    const maiorDadoAtual = this._extrairMaiorDado([formula]);
    const faceAtualMatch = maiorDadoAtual?.match(/d(\d+)/i);
    const indiceAtual = faceAtualMatch ? sequencia.indexOf(Number(faceAtualMatch[1])) : -1;
    if (indiceAtual === -1) return formula;
    return this._escalarDadosNaFormula(formula, indiceDestino - indiceAtual);
  }

  /**
   * Modificadores Externos de Subclasse (ver campoModificadorExterno() e
   * NaurenEfeitoData#modificadoresExternos) - varre TODOS os Efeitos
   * ativos do Ator com "modificaOutroItem" ligado, e devolve só as
   * entradas que apontam pro "itemAlvo" E pra DENTRO da Ação
   * "acaoIndexAtual" (ex: "acoes.0.danos.0.formula" só entra se
   * acaoIndexAtual for 0) - Modificadores Externos que apontem pra outra
   * Ação do mesmo item, ou pra um campo fora de "acoes" (ex: um recurso
   * customizado de Classe/Subclasse), não são resolvidos aqui, precisam
   * de outro ponto de leitura (fora do escopo desta função). Cada
   * entrada já vem com o valor resolvido pro RANK ATUAL do Efeito que a
   * concede (naurenResolverPorRank, mesma função usada em todo o resto
   * do sistema) - nunca lê nem escreve o documento salvo do item alvo.
   */
  _coletarModificadoresExternos(itemAlvo, acaoIndexAtual) {
    const prefixos = [`acoes.${acaoIndexAtual}.`, "acoes.*."];
    const encontrados = [];
    for (const fonte of this._fontesDeModificadores()) {
      for (const entrada of fonte.entradas) {
        if (!entrada.itemAlvoUuid || !entrada.campo || entrada.campo === "rank") continue;
        if (!naurenItemCorrespondeAoAlvo(itemAlvo, entrada.itemAlvoUuid)) continue;
        const prefixo = prefixos.find(p => entrada.campo.startsWith(p));
        if (!prefixo) continue;
        if (entrada.condicaoNecessariaUuid && !this._euTenhoCondicao(entrada.condicaoNecessariaUuid, 1)) continue;
        if (entrada.estadoAtivoNome && !this._euTenhoEstadoAtivo(entrada.estadoAtivoNome)) continue;
        const valorResolvido = naurenResolverPorRank(entrada.valorPorRank, fonte.rank, "valor");
        if (valorResolvido === null || valorResolvido === "") continue;
        const modo = entrada.modo || "substituir";
        encontrados.push({
          campoRelativo: entrada.campo.slice(prefixo.length),
          modo,
          fase: NAUREN_FASE_MODIFICADOR[modo] ?? 2,
          prioridade: entrada.prioridade ?? 0,
          valor: String(valorResolvido).replace(/@rank\b/gi, String(fonte.rank ?? 0)),
          origemNome: fonte.nome,
          origemRank: fonte.rank,
          // Config extra do modo "adicionar" numa lista de Condições.
          condicaoNovaAcumulos: String(entrada.condicaoNovaAcumulos ?? "1").replace(/@rank\b/gi, String(fonte.rank ?? 0)),
          condicaoNovaSoSeAcertar: entrada.condicaoNovaSoSeAcertar,
          condicaoNovaPerguntarParaEvitar: entrada.condicaoNovaPerguntarParaEvitar,
          condicaoNovaCustoParaEvitarRecurso: entrada.condicaoNovaCustoParaEvitarRecurso,
          condicaoNovaCustoParaEvitarQuantidade: entrada.condicaoNovaCustoParaEvitarQuantidade
        });
      }
    }
    // Ordem de composição determinística (plano, seção 4).
    return encontrados.sort((a, b) => a.fase - b.fase || a.prioridade - b.prioridade || String(a.origemNome).localeCompare(String(b.origemNome)));
  }

  /**
   * Todas as fontes de modificadores deste ator, com o rank que vale para
   * cada uma: Efeitos ativos com "modifica outro item" e nós de Subclasse
   * investidos que tenham "modificadores" (Fase 3 - camadas).
   */
  _fontesDeModificadores() {
    return naurenFontesDeModificadores(this.actor);
  }


  /**
   * Rank efetivo de um item: o rank salvo, ajustado por modificadores com
   * campo "rank" (ex.: Comunhão Natural sobe o rank de Infusão Floral).
   * Nunca grava no item.
   */
  _rankEfetivo(item) {
    let rank = Number(item?.system?.rankAtual ?? 0) || 0;
    const mods = [];
    for (const fonte of this._fontesDeModificadores()) {
      for (const entrada of fonte.entradas) {
        if (entrada.campo !== "rank" || !naurenItemCorrespondeAoAlvo(item, entrada.itemAlvoUuid)) continue;
        if (entrada.condicaoNecessariaUuid && !this._euTenhoCondicao(entrada.condicaoNecessariaUuid, 1)) continue;
        if (entrada.estadoAtivoNome && !this._euTenhoEstadoAtivo(entrada.estadoAtivoNome)) continue;
        const valor = Number(naurenResolverPorRank(entrada.valorPorRank, fonte.rank, "valor"));
        if (!Number.isFinite(valor)) continue;
        const modo = entrada.modo || "substituir";
        mods.push({ modo, valor, fase: NAUREN_FASE_MODIFICADOR[modo] ?? 2, prioridade: entrada.prioridade ?? 0 });
      }
    }
    for (const m of mods.sort((a, b) => a.fase - b.fase || a.prioridade - b.prioridade)) {
      if (m.modo === "somar") rank += m.valor;
      else if (m.modo === "multiplicar") rank = Math.floor(rank * m.valor);
      else if (m.modo === "minimo") rank = Math.max(rank, m.valor);
      else if (m.modo === "maximo") rank = Math.min(rank, m.valor);
      else rank = m.valor;
    }
    return Math.max(0, Math.floor(rank));
  }


  /**
   * Monta a entrada NOVA que o modo "adicionar" empurra numa lista (ver
   * NAUREN_ARRAYS_ADICIONAVEIS) - mesmo formato-padrão usado em todo o
   * resto do sistema quando uma entrada dessas é criada do zero, mas com
   * a configuração de fato preenchida pelo autor do Modificador Externo
   * (ver campoModificadorExterno > condicaoNova*) em vez de um padrão
   * fixo - uma Condição adicionada por um nó de Subclasse pode (e
   * geralmente deve) ter acúmulos/resistência diferentes do padrão
   * "sempre ativa, 1 acúmulo, nunca resistível".
   */
  _novaEntradaParaArrayAdicionavel(nomeArray, mod) {
    if (nomeArray === "condicoesAplicadas") {
      return {
        uuid: mod.valor,
        acumulos: 1, // fixo em 1 - a quantidade de verdade vem de "acumulosFormula" abaixo, mesmo padrão de qualquer Condição Aplicada com fórmula
        acumulosFormula: mod.condicaoNovaAcumulos || "1",
        ativo: true,
        soSeAcertar: mod.condicaoNovaSoSeAcertar ?? true,
        perguntarParaEvitar: mod.condicaoNovaPerguntarParaEvitar ?? false,
        custoParaEvitarRecurso: mod.condicaoNovaCustoParaEvitarRecurso || "estamina",
        custoParaEvitarQuantidade: mod.condicaoNovaCustoParaEvitarQuantidade || "1",
        acumulosPorRank: [],
        custoParaEvitarQuantidadePorRank: []
      };
    }
    if (nomeArray === "danos" || nomeArray === "curas") {
      return { formula: mod.valor, aplicarNoAlvo: true };
    }
    return null;
  }

  /**
   * Aplica a lista devolvida por "_coletarModificadoresExternos" numa
   * CÓPIA de "acao" - nunca muta o documento salvo, mesmo padrão de
   * Crescimento/Condensar Magia/Arma Escolhida (ver os comentários deles
   * mais acima em _executarAcao). Devolve { acao, aplicados } -
   * "aplicados" é só informativo (nome + rank de cada Efeito que
   * participou), pra alimentar o card de chat mais adiante.
   */
  _aplicarModificadoresExternos(acao, modificadores) {
    if (!modificadores?.length) return { acao, aplicados: [] };
    let resultado = acao;
    const aplicados = [];
    for (const mod of modificadores) {
      const valorAtual = foundry.utils.getProperty(resultado, mod.campoRelativo);
      let novoValor;
      if (mod.modo === "adicionar") {
        // Só faz sentido quando "campoRelativo" aponta pro ARRAY inteiro
        // (ex: "condicoesAplicadas", sem índice) - ver
        // NAUREN_ARRAYS_ADICIONAVEIS. Empurra uma entrada NOVA, nunca
        // edita uma que já existe (isso é papel dos outros modos).
        if (!Array.isArray(valorAtual)) continue; // campo não é um array (uso incorreto do modo) - não fez nada, não conta em "aplicados"
        const novaEntrada = this._novaEntradaParaArrayAdicionavel(mod.campoRelativo, mod);
        if (!novaEntrada) continue; // array não é um dos 3 conhecidos (condicoesAplicadas/danos/curas) - idem
        novoValor = [...valorAtual, novaEntrada];
      } else if (mod.modo === "somar") {
        // Campos numéricos guardados como StringField (ex:
        // "templatePersistenteDuracaoRodadas") às vezes são lidos mais
        // abaixo com "parseInt"/"Number" direto, sem passar por
        // resolução de fórmula primeiro - se os dois lados forem
        // números simples, soma de verdade e devolve só o número (nunca
        // a string "(0)+(1)", que um "parseInt" cru leria como 0). Só
        // cai pra fórmula-texto quando pelo menos um lado não for um
        // número puro (dado, "@token" etc), caso em que o campo de
        // destino certamente passa por resolução de fórmula antes de usar.
        const atualNum = Number(valorAtual);
        const modNum = Number(mod.valor);
        const doisSaoNumeros = valorAtual !== "" && valorAtual !== null && valorAtual !== undefined &&
          !Number.isNaN(atualNum) && !Number.isNaN(modNum);
        if (typeof valorAtual === "number") novoValor = valorAtual + (modNum || 0);
        else if (doisSaoNumeros) novoValor = String(atualNum + modNum);
        else novoValor = `(${valorAtual ?? 0})+(${mod.valor})`;
      } else if (mod.modo === "trocarTamanhoDado") {
        novoValor = this._trocarTamanhoDadoNaFormula(String(valorAtual ?? ""), mod.valor);
      } else if (mod.modo === "subirDado") {
        novoValor = this._subirDadoNaFormula(String(valorAtual ?? ""), mod.valor);
      } else if (mod.modo === "dadoExtra") {
        const nDados = Math.round(Number(mod.valor) || 0);
        const maiorDado = this._extrairMaiorDado([String(valorAtual ?? "")]);
        const faceMatch = maiorDado?.match(/d(\d+)/i);
        novoValor = (nDados > 0 && faceMatch) ? `${valorAtual}+${nDados}d${faceMatch[1]}` : valorAtual;
      } else if (mod.modo === "multiplicar") {
        const atualNum = Number(valorAtual);
        const fator = Number(mod.valor);
        if (Number.isFinite(atualNum) && valorAtual !== "" && Number.isFinite(fator)) novoValor = typeof valorAtual === "number" ? atualNum * fator : String(atualNum * fator);
        else novoValor = `(${valorAtual ?? 0})*(${mod.valor})`;
      } else if (mod.modo === "minimo" || mod.modo === "maximo") {
        const atualNum = Number(valorAtual);
        const limite = Number(mod.valor);
        if (!Number.isFinite(atualNum) || !Number.isFinite(limite) || valorAtual === "") continue; // só números
        const ajustado = mod.modo === "minimo" ? Math.max(atualNum, limite) : Math.min(atualNum, limite);
        novoValor = typeof valorAtual === "number" ? ajustado : String(ajustado);
      } else { // substituir
        if (typeof valorAtual === "boolean") novoValor = (mod.valor === true || mod.valor === "true");
        else if (typeof valorAtual === "number") novoValor = Number(mod.valor);
        else novoValor = mod.valor;
      }
      const clone = foundry.utils.deepClone(resultado);
      foundry.utils.setProperty(clone, mod.campoRelativo, novoValor);
      // Fórmula de dano/cura substituída (ex.: Círculo da Graça na Sanatio): o "Por Rank" do próprio item
      // não pode apagar o ajuste - em cada rank vale o maior dado entre os dois.
      // Soma numa fórmula de dano/cura (ex.: Toque da Graça +2 na Sanatio): vale também em cada rank do bloco.
      const mSoma = mod.modo === "somar" && String(mod.campoRelativo).match(/^(danos|curas)\.(\d+)\.formula$/);
      if (mSoma) {
        const blocoS = clone[mSoma[1]]?.[Number(mSoma[2])];
        if (blocoS && Array.isArray(blocoS.porRank) && blocoS.porRank.length) {
          const v = String(mod.valor ?? "").trim();
          const soma = f => /^[+-]?\d+$/.test(v) ? `${f}${v.startsWith("-") ? v : `+${v.replace(/^\+/, "")}`}` : `(${f})+(${v})`;
          blocoS.porRank = blocoS.porRank.map(pr => pr.formula ? { ...pr, formula: soma(pr.formula) } : pr);
        }
        if (/^[+-]?\d+$/.test(String(mod.valor ?? "").trim()) && typeof valorAtual === "string" && valorAtual) {
          const v = String(mod.valor).trim();
          foundry.utils.setProperty(clone, mod.campoRelativo, `${valorAtual}${v.startsWith("-") ? v : `+${v.replace(/^\+/, "")}`}`);
          novoValor = foundry.utils.getProperty(clone, mod.campoRelativo);
        }
      }
      // Subir o dado (ex.: Círculo da Graça): vale em cada rank do bloco, a partir do dado daquele nível.
      const mSobe = mod.modo === "subirDado" && String(mod.campoRelativo).match(/^(danos|curas)\.(\d+)\.formula$/);
      if (mSobe) {
        const blocoD = clone[mSobe[1]]?.[Number(mSobe[2])];
        if (blocoD && Array.isArray(blocoD.porRank) && blocoD.porRank.length) {
          blocoD.porRank = blocoD.porRank.map(pr => pr.formula ? { ...pr, formula: this._subirDadoNaFormula(pr.formula, mod.valor) } : pr);
        }
      } else if (mod.modo === "subirDado") {
        // 0.94.13: campo com tabela "PorRank" irmã (ex.: penitenciaBonusCuraDado + penitenciaBonusCuraDadoPorRank): sobe nos dois.
        const caminhoPR = `${mod.campoRelativo}PorRank`;
        const arrPR = foundry.utils.getProperty(clone, caminhoPR);
        if (Array.isArray(arrPR) && arrPR.length) foundry.utils.setProperty(clone, caminhoPR, arrPR.map(pr => pr.formula ? { ...pr, formula: this._subirDadoNaFormula(pr.formula, mod.valor) } : pr));
      }
      const mBloco = (mod.modo ?? "substituir") === "substituir" && String(mod.campoRelativo).match(/^(danos|curas)\.(\d+)\.formula$/);
      if (mBloco) {
        const bloco = clone[mBloco[1]]?.[Number(mBloco[2])];
        const faces = f => Number(String(this._extrairMaiorDado([String(f ?? "")]) ?? "").match(/d(\d+)/i)?.[1] ?? 0);
        if (bloco && Array.isArray(bloco.porRank) && bloco.porRank.length) {
          bloco.porRank = bloco.porRank.map(pr => faces(pr.formula) > faces(novoValor) ? pr : { ...pr, formula: String(novoValor) });
        }
      }
      resultado = clone;
      const mostrar = v => Array.isArray(v) ? `${v.length} item(ns)` : (v === "" || v === undefined || v === null ? "—" : String(v));
      aplicados.push({
        nome: mod.origemNome, rank: mod.origemRank, campo: mod.campoRelativo,
        fase: NAUREN_ROTULO_FASE_MODIFICADOR[mod.fase] ?? "", antes: mostrar(valorAtual), depois: mostrar(novoValor)
      });
    }
    // Um modificador que aponte para "condicoesAplicadas.N.campo" numa lista
    // vazia criaria uma entrada sem Condição (ex.: o Olhar da Morte antigo,
    // do tempo em que a Análise Paciente aplicava uma Condição). Some com ela.
    if (Array.isArray(resultado.condicoesAplicadas) && resultado.condicoesAplicadas.some(c => !c?.uuid)) {
      resultado = { ...resultado, condicoesAplicadas: resultado.condicoesAplicadas.filter(c => c?.uuid) };
    }
    return { acao: resultado, aplicados };
  }

  /**
   * Dobra a QUANTIDADE de todo dado "NdX" numa fórmula de dano (ex:
   * Espada Lunar em Conjuração Poderosa - "o dano é dobrado" -
   * "1d10+@poderMagia" vira "2d10+@poderMagia") - diferente de
   * "_escalarDadosNaFormula" (que muda a CATEGORIA do dado, não a
   * quantidade). Sem número antes do "d" conta como 1 (ex: "d6" vira
   * "2d6"). O resto da fórmula (multiplicadores, atributos) fica
   * intacto.
   */
  _dobrarQuantidadeDeDados(formula) {
    if (!formula) return formula;
    return String(formula).replace(/(\d*)d(\d+)/gi, (match, quantidadeAtual, face) => {
      const quantidade = quantidadeAtual ? Number(quantidadeAtual) : 1;
      return `${quantidade * 2}d${face}`;
    });
  }

  /**
   * Acha o maior dado "dN" entre uma ou mais fórmulas de dano (ex:
   * Terra Mágica - "Buff de Conjuração", reconhece o dado da MAGIA
   * sendo conjurada em vez de um valor fixo) - devolve "1dN" (sempre
   * quantidade 1, é sempre um bônus de "+1 dado"), ou "" se nenhuma
   * fórmula tiver um dado reconhecível. Fórmulas mistas (raro, o
   * manual assume "geralmente é tudo igual") usam o maior "N"
   * encontrado entre todas.
   */
  _extrairMaiorDado(formulas) {
    let maiorFace = 0;
    for (const formula of formulas) {
      if (!formula) continue;
      for (const m of String(formula).matchAll(/d(\d+)/gi)) {
        maiorFace = Math.max(maiorFace, Number(m[1]));
      }
    }
    return maiorFace ? `1d${maiorFace}` : "";
  }

  /**
   * Conjurar Arma (ver campoAcao > usaConjurarArma, ex: Espada Lunar,
   * Mago) - cria um Item de arma real no inventário do Ator, já
   * equipada, com uma Ação configurada a partir dos campos
   * "armaConjurada*" desta Ação (já com os ajustes de Conjuração
   * Poderosa aplicados, se for o caso - ver bloco de Condensar Magia).
   * Se já existir uma arma da MESMA origem (mesma Magia/Habilidade,
   * por seedId/uuid - não pelo nome, que muda conforme o tamanho
   * escolhido), remove ela antes - "conjurar de novo substitui a
   * anterior", nunca duplica, mesma regra do Escudo de Mana.
   */
  async _conjurarArma(item, acao) {
    const origemId = item.getFlag("nauren", "seedId") || item.uuid;
    const antigas = this.actor.items.filter(i => i.type === "arma" && i.getFlag("nauren", "armaConjuradaDe") === origemId);
    if (antigas.length) await this.actor.deleteEmbeddedDocuments("Item", antigas.map(i => i.id));
    const [novaArma] = await this.actor.createEmbeddedDocuments("Item", [{
      name: acao.armaConjuradaNome || `${item.name} (arma)`,
      type: "arma",
      img: acao.armaConjuradaImg || item.img,
      system: {
        equipado: true,
        acoes: [{
          nome: acao.armaConjuradaNome || item.name,
          ehAtaque: true,
          atributoAtaque: acao.armaConjuradaAtributoAtaque || "poderAtaque",
          tipo: acao.armaConjuradaTipo || "",
          alcance: acao.armaConjuradaAlcance || "1m",
          custoMana: acao.armaConjuradaCustoMana || 0,
          custoEstamina: acao.armaConjuradaCustoEstamina || 0,
          modoAlvo: "selecionado", modoAlvoTravado: true,
          danos: [{ formula: acao.armaConjuradaFormula || "1d4", aplicarNoAlvo: true }]
        }, (() => {
          // Ataque Pesado (livro): custo +1 (na Estamina, ou na Mana se a arma é paga com Mana);
          // +1 dado de dano da arma e o dobro do atributo no dano.
          const base = acao.armaConjuradaFormula || "1d4";
          const pesada = base.replace(/(\d*)d(\d+)/, (m, n, x) => `${(Number(n) || 1) + 1}d${x}`).replace(/(?<![*\w])@(\w+)/g, "2*@$1");
          const pagaComMana = (acao.armaConjuradaCustoMana || 0) > 0 && !(acao.armaConjuradaCustoEstamina || 0);
          return {
            nome: `${acao.armaConjuradaNome || item.name} (Ataque Pesado)`,
            ehAtaque: true,
            atributoAtaque: acao.armaConjuradaAtributoAtaque || "poderAtaque",
            tipo: acao.armaConjuradaTipo || "",
            alcance: acao.armaConjuradaAlcance || "1m",
            custoMana: (acao.armaConjuradaCustoMana || 0) + (pagaComMana ? 1 : 0),
            custoEstamina: (acao.armaConjuradaCustoEstamina || 0) + (pagaComMana ? 0 : 1),
            modoAlvo: "selecionado", modoAlvoTravado: true,
            danos: [{ formula: pesada, aplicarNoAlvo: true }]
          };
        })(), ...(String(acao.armaConjuradaArremesso || "").trim() ? [{
          // Arremessar (Arma Leve, livro: até 4 m): mesmo dano e custo do ataque, à distância.
          nome: `${acao.armaConjuradaNome || item.name} (Arremessar)`,
          ehAtaque: true,
          atributoAtaque: acao.armaConjuradaAtributoAtaque || "poderAtaque",
          tipo: acao.armaConjuradaTipo || "",
          alcance: String(acao.armaConjuradaArremesso).trim(),
          tipoAlcance: "distancia",
          custoMana: acao.armaConjuradaCustoMana || 0,
          custoEstamina: acao.armaConjuradaCustoEstamina || 0,
          modoAlvo: "selecionado", modoAlvoTravado: true,
          danos: [{ formula: acao.armaConjuradaFormula || "1d4", aplicarNoAlvo: true }]
        }] : [])]
      }
    }]);
    await novaArma.setFlag("nauren", "armaConjuradaDe", origemId);
    return novaArma;
  }

  /**
   * Conjurar Consumível (ver campoAcao > usaConjurarConsumivel, ex:
   * Criar Comida e Bebida, Mago) - cria um Item consumível real no
   * inventário do Ator, com uma Ação configurada a partir de
   * "consumivelCriadoGastosRecurso" (mesmo formato de gastosRecurso -
   * uma fórmula negativa restaura o recurso em vez de gastar, já que
   * gastosRecurso sempre subtrai). Diferente de Conjurar Arma: se já
   * existir um consumível da MESMA origem, SOMA a quantidade em vez de
   * substituir (comida/bebida faz sentido acumular, uma espada não).
   */
  async _criarConsumivel(item, acao) {
    const quantidadeNova = acao.consumivelCriadoQuantidade || 1;
    let modeloUuid = acao.consumivelCriadoModeloUuid || "";
    if ((acao.consumivelCriadoOpcoesUuids ?? []).length) {
      const opcoes = [];
      for (const u of acao.consumivelCriadoOpcoesUuids) { const d = await fromUuid(u).catch(() => null); if (d) opcoes.push(d); }
      const esc = opcoes.length ? await foundry.applications.api.DialogV2.wait({ window: { title: acao.nome || item.name }, content: "<p>O que preparar?</p>",
        buttons: opcoes.map(d => ({ action: d.uuid, label: d.name })), rejectClose: false }).catch(() => null) : null;
      if (!esc) return null;
      modeloUuid = esc;
    }
    if (modeloUuid) {
      const modelo = await fromUuid(modeloUuid).catch(() => null);
      if (modelo) {
        const existenteM = this.actor.items.find(i => i.type === "consumivel" && i.getFlag("nauren", "consumivelCriadoDe") === modeloUuid
          && (!acao.consumivelCriadoCuraFormula || i.system.acoes?.[0]?.curas?.[0]?.formula === acao.consumivelCriadoCuraFormula));
        if (existenteM) { await existenteM.update({ "system.quantidade": (existenteM.system.quantidade ?? 0) + quantidadeNova }); this.#beneficiosAtual.push({ label: "Preparou", value: `${existenteM.name} (+${quantidadeNova})` }); return existenteM; }
        const dados = modelo.toObject(); delete dados._id;
        dados.system.quantidade = quantidadeNova;
        if (acao.consumivelCriadoCuraFormula && dados.system.acoes?.[0]?.curas?.[0]) dados.system.acoes[0].curas[0].formula = acao.consumivelCriadoCuraFormula;
        foundry.utils.setProperty(dados, "flags.nauren.consumivelCriadoDe", modeloUuid);
        const [novo] = await this.actor.createEmbeddedDocuments("Item", [dados]);
        this.#beneficiosAtual.push({ label: "Preparou", value: `${novo.name} (+${quantidadeNova})` });
        return novo;
      }
    }
    const origemId = item.getFlag("nauren", "seedId") || item.uuid;
    const existente = this.actor.items.find(i => i.type === "consumivel" && i.getFlag("nauren", "consumivelCriadoDe") === origemId);
    if (existente) {
      await existente.update({ "system.quantidade": (existente.system.quantidade ?? 0) + quantidadeNova });
      this.#beneficiosAtual.push({ label: "Preparou", value: `${existente.name} (+${quantidadeNova})`, breakdown: `agora ${(existente.system.quantidade ?? 0)} no inventário` });
      return existente;
    }
    this.#beneficiosAtual.push({ label: "Preparou", value: `${acao.consumivelCriadoNome || `${item.name} (consumível)`} (+${quantidadeNova})`, breakdown: "no seu inventário" });
    const [novoConsumivel] = await this.actor.createEmbeddedDocuments("Item", [{
      name: acao.consumivelCriadoNome || `${item.name} (consumível)`,
      type: "consumivel",
      img: acao.consumivelCriadoImg || item.img,
      system: {
        quantidade: quantidadeNova,
        quantidadeMax: quantidadeNova,
        acoes: [{
          nome: acao.consumivelCriadoNome || item.name,
          ehAtaque: false, modoAlvo: "nenhum",
          gastosRecurso: (acao.consumivelCriadoGastosRecurso ?? []).map(g => ({ ...g, ativo: true, soSeAcertar: false }))
        }]
      }
    }]);
    await novoConsumivel.setFlag("nauren", "consumivelCriadoDe", origemId);
    return novoConsumivel;
  }

  /**
   * Só a parte de MONTAR a fórmula de ataque (sem rolar nada) - extraído
   * de "_rolarAtaqueDaAcao" pra ser reaproveitado pelo popup de
   * pré-Ação (que precisa MOSTRAR a fórmula que vai rolar, sem executar
   * a rolagem ainda).
   */
  _montarFormulaAtaque(acao, localBonus, rankAtual = 0) {
    // Troca de Atributo de Ataque (ver Condição > trocaAtributoAtaqueOpcional,
    // ex: Profusão Retraída, Empíreo) - se o jogador marcou a troca no popup
    // de pré-Ação, usa ESSE atributo em vez do configurado na Ação, só
    // nesta rolagem (a Ação em si nunca muda).
    const atributoKey = this.#atributoAtaqueSubstitutoAtual || acao.atributoAtaque || "poderAtaque";
    const atr = this._getAtributoValue(atributoKey);
    const bonusOpcoes = this.actor.system.bonusAtaqueTotal || 0;
    const bonusDadosOpcoes = this.actor.system.bonusAtaqueDados || [];

    // "ataqueBonusExtra" é uma fórmula LIVRE (aceita "@atributo") - o rank,
    // quando presente, troca ela INTEIRA (não só um pedaço), resolvendo de
    // vez o problema de "subir de rank só mexia no bônus fixo".
    const overrideRank = this._resolverPorRank(acao.ataqueBonusPorRank, rankAtual);
    const extraBruto = overrideRank ?? acao.ataqueBonusExtra;
    let extraResolvido = extraBruto ? this._substituirAtributosNaFormula(extraBruto, acao) : null;
    // Sem dado (ex.: Bando "1*@aliados_6m" → "1*2"): mostra o número final, não a conta.
    if (extraResolvido && !/d/i.test(extraResolvido)) {
      try { const v = naurenAvaliarExpressaoSimples(extraResolvido); if (Number.isFinite(v)) extraResolvido = v ? String(Math.round(v)) : null; } catch (err) { /* fica a fórmula */ }
    }

    // Bônus Condicional ao Alvo (ver NaurenHabilidadeData >
    // bonusCondicionalAoAlvo) - some as entradas de campo "ataque" cujo
    // alvo mirado (tecla T) tenha a Condição indicada. Automático pra
    // QUALQUER Ação de ataque do Ator, sem precisar configurar nada na
    // Arma/Ação em si.
    const bonusCondAlvo = this.actor.system.bonusCondicionalAoAlvoTotal ?? [];
    let bonusAtaqueCondicional = 0;
    const fontesAtaqueCond = [];
    const variosAlvosA = (game.user.targets?.size ?? 0) > 1;
    for (const b of bonusCondAlvo) {
      if (b.campo !== "ataque") continue;
      if (variosAlvosA) { if (b.condicaoUuid) this.#bonusPorAlvoAtual.push({ fonte: b.origemNome || "Bônus contra o alvo", condicaoUuid: b.condicaoUuid, porAcumulo: !!b.porAcumulo, ataque: Number(b.valor) || 0 }); continue; }
      const vA = this._resolverBonusCondicionalAoAlvo(b);
      bonusAtaqueCondicional += vA;
      if (vA && b.origemNome && !fontesAtaqueCond.includes(b.origemNome)) fontesAtaqueCond.push(b.origemNome);
    }

    const partes = [String(atr)];
    if (extraResolvido) partes.push(extraResolvido);
    if (bonusOpcoes) partes.push(String(bonusOpcoes));
    for (const dado of bonusDadosOpcoes) partes.push(dado);
    if (localBonus.ataqueBonus) partes.push(String(localBonus.ataqueBonus));
    for (const dado of localBonus.ataqueDados) partes.push(dado);
    if (bonusAtaqueCondicional) partes.push(String(bonusAtaqueCondicional));
    // Bônus/penalidade pontual do popup de pré-Ação (ver "usaPopupPreAcao")
    // - só vale pra ESTA rolagem, nunca persiste.
    if (this.#bonusAtaqueAdhocAtual) partes.push(String(this.#bonusAtaqueAdhocAtual));
    if (this.#proximaAcaoAtual?.bonusAcerto) partes.push(this.#proximaAcaoAtual.bonusAcerto);
    if (this.#estudoAtual?.bonusAcerto) partes.push(String(this.#estudoAtual.bonusAcerto));
    for (const d of this.#acertoExtraEfeitos ?? []) partes.push(d);
    if (acao?._conjuracaoPoderosa && this.#poderosaAtual?.acertoExtra) partes.push(String(this.#poderosaAtual.acertoExtra));
    // Impiedoso: + informações de quem concedeu sobre o alvo deste ataque.
    if (this.#proximaAcaoAtual?.informacoesDe) {
      const alvoImp = Array.from(game.user.targets)[0]?.actor;
      const infImp = naurenEstudoNoAlvo(alvoImp, this.#proximaAcaoAtual.informacoesDe)?.getFlag("nauren", "estudo")?.informacoes ?? 0;
      if (infImp) partes.push(String(infImp));
      this.#proximaAcaoAtual.informacoesTexto = `+${infImp} no acerto (informações de ${this.#proximaAcaoAtual.informacoesDe.nome} sobre ${alvoImp?.name ?? "o alvo"})`;
    }
    // "Facilidade/Dificuldade em ataques CONTRA mim" do ALVO marcado (ex:
    // Atordoado/Caído/Cego dão facilidade pra quem ataca) - combina com a
    // minha própria facilidade de ataque. Só considera o 1º alvo marcado; se
    // houver vários com estados diferentes, prevalece o do primeiro.
    const alvoMarcado = Array.from(game.user.targets)[0];
    const modoAlvoRecebido = alvoMarcado?.actor?.system?.vantagemContagem?.ataqueRecebido ?? (alvoMarcado?.actor?.system?.vantagemAtaqueRecebidoModo || "normal");
    // Facilidade do Buff de Conjuração (ver templatePersistenteBuffConjuracaoFacilidade,
    // ex: Terra Mágica) - some com a vantagem/dificuldade do alvo acima
    // em vez de sobrescrever (os dois podem coexistir: alvo Caído +
    // dentro da área de Terra Mágica soma dois níveis de facilidade, que
    // já cancelam com uma dificuldade eventual do outro lado).
    const paraNumeroModo = naurenNumeroModo;
    let somaModoDoAlvo = paraNumeroModo(modoAlvoRecebido) + (localBonus.facilidadeBuffConjuracao ? 1 : 0) + (acao?.condensarFacilidade ? 1 : 0);
    // 0.94: "ataques CONTRA mim feitos numa Prioridade" (ex.: Arma de Inventor - Dificuldade em Prioridade).
    if (this.#emPrioridadeAtual) somaModoDoAlvo += paraNumeroModo(alvoMarcado?.actor?.system?.vantagemContagem?.ataqueRecebidoPrioridade ?? (alvoMarcado?.actor?.system?.vantagemAtaqueRecebidoPrioridadeModo || "normal"));
    // Fase 4 (M05): Condições cujos modificadores não valem contra quem as aplicou (ex.: Provocado
    // dá Dificuldade contra todo mundo, menos contra o provocador). Desfaz só a parte dessa Condição.
    const compensacoes = naurenCompensacoesContraOrigem(this.actor, alvoMarcado);
    const linhasCompensacao = [];
    for (const c of compensacoes) {
      somaModoDoAlvo -= c.vantagemAtaque;
      if (c.ataque) partes.push(String(-c.ataque));
      const partesTxt = [];
      if (c.vantagemAtaque < 0) partesTxt.push("sem a Dificuldade"); else if (c.vantagemAtaque > 0) partesTxt.push("sem a Facilidade");
      if (c.ataque) partesTxt.push(`${c.ataque > 0 ? "−" : "+"}${Math.abs(c.ataque)} no ataque`);
      linhasCompensacao.push({ label: `${c.nome}: não vale contra quem aplicou`, value: partesTxt.join(", ") || "ignorada" });
    }
    // 0.94.11: vai como NÚMERO (2 Facilidades do alvo valem 2, não 1).
    const modoDoAlvo = somaModoDoAlvo;

    const breakdown = [{ label: "Atributo de ataque", value: `${this._labelAtributo(atributoKey)} (+${atr})` }];
    breakdown.push(...linhasCompensacao);
    if (extraResolvido) breakdown.push({ label: overrideRank ? `Bônus extra (Rank ${rankAtual})` : "Bônus extra", value: extraResolvido });
    if (bonusOpcoes) breakdown.push({ label: "Bônus de ataque (Opções/Efeitos)", value: bonusOpcoes });
    if (bonusDadosOpcoes.length) breakdown.push({ label: "Dado de ataque (Opções/Efeitos)", value: bonusDadosOpcoes.join(" + ") });
    if (localBonus.ataqueBonus || localBonus.ataqueDados.length) {
      breakdown.push({ label: "Bônus de ataque (Efeito desta Ação)", value: [localBonus.ataqueBonus || null, ...localBonus.ataqueDados].filter(Boolean).join(" + ") });
    }
    if (bonusAtaqueCondicional) breakdown.push({ label: fontesAtaqueCond.length ? `Contra o alvo (${fontesAtaqueCond.join(", ")})` : "Bônus Condicional ao Alvo", value: String(bonusAtaqueCondicional) });

    // Sem atributo de ataque (ex.: Arma de Fogo do Inventor): não mostra "+ 0" quando há outro bônus.
    const partesF = partes.length > 1 && String(partes[0]) === "0" ? partes.slice(1) : partes;
    return { formula: partesF.join(" + "), breakdown, modoDoAlvo };
  }

  async _rolarAtaqueDaAcao(acao, localBonus, rankAtual = 0, modoTravado = null, tipoItem = null, deltaExtra = 0) {
    const { formula, breakdown, modoDoAlvo } = this._montarFormulaAtaque(acao, localBonus, rankAtual);
    const d20Result = await this._rollD20WithMode(formula, "ataque", naurenNumeroModo(modoDoAlvo) + (Number(deltaExtra) || 0), modoTravado, tipoItem,
      { titulo: acao.nome || "Ataque", tipo: "ataque", bonusLinhas: breakdown });
    return { d20Result, breakdown };
  }

  /** Rola um bloco de Dano (dentro de acao.danos). incluirGlobal: só true pro
   *  PRIMEIRO dano da Ação - os demais são a MESMA ação, não repetem o bônus. */
  /**
   * Dano mínimo de uma rolagem já avaliada: soma fixa (atributo, bônus
   * manual, bônus de Efeitos) + o menor valor possível de cada dado (1 por
   * dado, já que nenhum dado do sistema tem modificador de manter/descartar).
   * Ex: "+2 de bônus fixo + 1d6" -> mínimo = 2 + 1 = 3.
   */
  _calcularDanoMinimo(roll) {
    let minimo = 0;
    for (const term of roll.terms) {
      const tipo = term?.constructor?.name;
      // Regra do livro: dano mínimo = quantidade de dados (8d6 -> 8), SEM somar bônus/meta-atributos.
      if (tipo === "Die") minimo += term.number ?? 0;
    }
    return minimo;
  }

  async _rolarBlocoDano(bloco, ehCritico, incluirGlobal, localBonus, rankAtual = 0, acao = null, forcarDanoMaximo = false, tipoItem = null) {
    const global = incluirGlobal ? this._getBonusDanoCuraDeEfeitos(tipoItem) : { efeitoDanoBonus: 0, efeitoDanoDados: [] };
    const local = incluirGlobal ? localBonus : { danoBonus: 0, danoDados: [] };

    // Fórmula unificada (Ação/Habilidade/etc): "formula" já pode conter
    // "@atributo" (ex: "1d6+@poderAtaque") e "@alvoAcumulos" (se a Ação
    // tiver "Verificar Condição no Alvo" configurado) embutidos - o rank,
    // quando presente, troca ela INTEIRA. _substituirAtributosNaFormula
    // resolve qualquer "@nome" pro valor atual antes de rolar.
    const overrideRank = this._resolverPorRank(bloco.porRank, rankAtual);
    const formulaBase = this._substituirAtributosNaFormula(overrideRank ?? (bloco.formula || "0"), acao);
    // "auto" (ver campoCondicaoAplicada > modificadores > danoDado, ex:
    // Terra Mágica) - resolve pro MAIOR dado já presente na fórmula
    // BASE deste bloco específico (4d6 → +1d6; 8d8 → +1d8), em vez de
    // um dado fixo. Resolvido aqui, uma vez, e reaproveitado tanto na
    // fórmula real quanto no breakdown - nunca aparece "auto" pro
    // jogador, sempre o dado já resolvido.
    const resolverDadoAuto = dado => dado === "auto" ? this._extrairMaiorDado([formulaBase]) : dado;
    const danoDadosGlobalResolvidos = global.efeitoDanoDados.map(resolverDadoAuto).filter(Boolean);
    const danoDadosLocalResolvidos = local.danoDados.map(resolverDadoAuto).filter(Boolean);

    const partes = [formulaBase];
    if (global.efeitoDanoBonus) partes.push(String(global.efeitoDanoBonus));
    for (const dado of danoDadosGlobalResolvidos) partes.push(dado);
    if (local.danoBonus) partes.push(String(local.danoBonus));
    for (const dado of danoDadosLocalResolvidos) partes.push(dado);
    // Fase 4 (M05): bônus/penalidade de dano de Condição que não vale contra quem a aplicou.
    const compDano = incluirGlobal ? naurenCompensacoesContraOrigem(this.actor, Array.from(game.user.targets)[0]).filter(c => c.danoBonus) : [];
    for (const c of compDano) partes.push(String(-c.danoBonus));
    // Bônus/penalidade pontual do popup de pré-Ação (ver "usaPopupPreAcao")
    // - só soma no PRIMEIRO bloco de dano (mesma regra do bônus global/
    // local acima), nunca em blocos extras da MESMA Ação, e só vale pra
    // ESTA rolagem, nunca persiste.
    if (incluirGlobal && this.#bonusDanoAdhocAtual) partes.push(String(this.#bonusDanoAdhocAtual));
    if (incluirGlobal && this.#proximaAcaoAtual?.bonusDano) partes.push(this.#proximaAcaoAtual.bonusDano);
    if (incluirGlobal && this.#proximaAcaoAtual?.bonusDanoVerdadeiro) {
      // Dano verdadeiro: rolado à parte (dados dobram no crítico) e enviado ao alvo sem passar pelas reduções.
      let fv = this.#proximaAcaoAtual.bonusDanoVerdadeiro; if (ehCritico) fv = this._doubleDice(fv);
      try {
        const rv = await new Roll(fv).evaluate(); if (game.dice3d) await game.dice3d.showForRoll(rv, game.user, true);
        this.#danoVerdadeiroAtual += rv.total;
        this.#efeitosEmAtaquesAtual.push({ label: "Dano verdadeiro", value: `+${rv.total}`, breakdown: `${naurenRollToBreakdownText(rv)} · não pode ser reduzido` });
      } catch (err) { console.warn("Nauren RPG | fórmula de dano verdadeiro inválida", fv, err); }
    }
    if (incluirGlobal && this.#danoVerdadeiroExtrasAtual.length) {
      for (let fv of this.#danoVerdadeiroExtrasAtual) {
        if (ehCritico) fv = this._doubleDice(fv);
        try {
          const rv = await new Roll(fv).evaluate(); if (game.dice3d && /d\d/i.test(fv)) await game.dice3d.showForRoll(rv, game.user, true);
          this.#danoVerdadeiroAtual += rv.total;
          this.#efeitosEmAtaquesAtual.push({ label: "Dano verdadeiro", value: `+${rv.total}`, breakdown: `${naurenRollToBreakdownText(rv)} · não pode ser reduzido` });
        } catch (err) { console.warn("Nauren RPG | fórmula de dano verdadeiro (Efeito em Ataques) inválida", fv, err); }
      }
      this.#danoVerdadeiroExtrasAtual = [];
    }
    let formula = partes.join(" + ");
    if (ehCritico) formula = this._doubleDice(formula);
    // 0.94.3 (Tudo ou Nada): dados a mais no dano crítico, do mesmo tamanho do 1º dado da fórmula.
    if (ehCritico && (acao?._critDadosExtras ?? 0) > 0) {
      const mD = /(\d+)d(\d+)/.exec(formula);
      if (mD) formula = `${formula} + ${acao._critDadosExtras}d${mD[2]}`;
    }
    // "forcarDanoMaximo" (ver "Dano Máximo Condicional" em campoAcao) usa
    // a opção nativa do Foundry pra maximizar cada dado, sem precisar
    // reinterpretar a fórmula manualmente (ex: "4d10" sempre vira "40").
    const roll = await new Roll(formula).evaluate(forcarDanoMaximo ? { maximize: true } : undefined);
    if (game.dice3d && !forcarDanoMaximo) await game.dice3d.showForRoll(roll, game.user, true);
    // Todos os dados no máximo? (repetirSeDanoMaximo). Vale o conjunto de blocos de dano desta Ação.
    {
      const dadosMax = roll.dice.length > 0 && roll.dice.every(d => d.results.filter(r => r.active !== false).every(r => r.result === d.faces));
      this._danoDadosTodosMax = (this._danoDadosTodosMax ?? true) && dadosMax;
    }

    const breakdown = [{ label: overrideRank ? `Fórmula de dano (Rank ${rankAtual})` : "Fórmula de dano", value: partes.join(" + ") }];
    const totalBonus = (global.efeitoDanoBonus || 0) + (local.danoBonus || 0);
    const totalDados = [...danoDadosGlobalResolvidos, ...danoDadosLocalResolvidos];
    if (totalBonus || totalDados.length) breakdown.push({ label: "Bônus de dano (Efeitos)", value: [totalBonus || null, ...totalDados].filter(Boolean).join(" + ") });
    for (const c of compDano) breakdown.push({ label: `${c.nome}: não vale contra quem aplicou`, value: `${c.danoBonus > 0 ? "−" : "+"}${Math.abs(c.danoBonus)} no dano` });
    // Quem mexeu no dano (Condições/Efeitos do atacante): vai à vista na linha "Dano" do card.
    const fontesBonus = global.efeitoDanoBonus ? (this.actor.system.efeitoDanoBonusFontes ?? []) : [];

    return { roll, breakdown, fontesBonus };
  }

  /** Rola um bloco de Cura (dentro de acao.curas). Mesma lógica do dano. */
  async _rolarBlocoCura(bloco, incluirGlobal, localBonus, rankAtual = 0, acao = null, forcarDanoMaximo = false, tipoItem = null) {
    const global = incluirGlobal ? this._getBonusDanoCuraDeEfeitos(tipoItem) : { efeitoCuraBonus: 0, efeitoCuraDados: [] };
    const local = incluirGlobal ? localBonus : { curaBonus: 0, curaDados: [] };

    const overrideRank = this._resolverPorRank(bloco.porRank, rankAtual);
    const formulaBase = this._substituirAtributosNaFormula(overrideRank ?? (bloco.formula || "0"), acao);
    // "auto" - mesma resolução de _rolarBlocoDano acima, mas pro maior
    // dado da fórmula BASE de Cura deste bloco.
    const resolverDadoAuto = dado => dado === "auto" ? this._extrairMaiorDado([formulaBase]) : dado;
    const curaDadosGlobalResolvidos = global.efeitoCuraDados.map(resolverDadoAuto).filter(Boolean);
    const curaDadosLocalResolvidos = local.curaDados.map(resolverDadoAuto).filter(Boolean);

    const partes = [formulaBase];
    if (global.efeitoCuraBonus) partes.push(String(global.efeitoCuraBonus));
    for (const dado of curaDadosGlobalResolvidos) partes.push(dado);
    if (local.curaBonus) partes.push(String(local.curaBonus));
    for (const dado of curaDadosLocalResolvidos) partes.push(dado);

    const formula = partes.join(" + ");
    // "forcarDanoMaximo" (ver "Dano Máximo Condicional" em campoAcao) usa
    // o mesmo mecanismo pra Cura - "resultado máximo do dado", não
    // "cura até a vida cheia" (são conceitos diferentes - ver comentário
    // em _rolarBlocoDano).
    const roll = await new Roll(formula).evaluate(forcarDanoMaximo ? { maximize: true } : undefined);
    if (game.dice3d && !forcarDanoMaximo) await game.dice3d.showForRoll(roll, game.user, true);

    const breakdown = [{ label: overrideRank ? `Fórmula de cura (Rank ${rankAtual})` : "Fórmula de cura", value: formula }];
    const totalBonus = (global.efeitoCuraBonus || 0) + (local.curaBonus || 0);
    const totalDados = [...curaDadosGlobalResolvidos, ...curaDadosLocalResolvidos];
    if (totalBonus || totalDados.length) breakdown.push({ label: "Bônus de cura (Efeitos)", value: [totalBonus || null, ...totalDados].filter(Boolean).join(" + ") });

    return { roll, breakdown };
  }

  /**
   * Ponto de entrada ao clicar o dado de um item na ficha: descobre qual é a
   * Ação ATIVA daquele item e a executa. Itens sem nenhuma Ação configurada
   * caem no comportamento antigo (só relevante pra consumível "simples",
   * com o campo de texto "Efeito").
   */
  async _useItem(item) {
    const acoes = item.system.acoes ?? [];
    if (acoes.length > 0) {
      let idx = Math.min(item.system.acaoAtivaIndex ?? 0, acoes.length - 1);

      // Popup opcional "qual Ação usar?" (aba Opções) quando o item tem 2+
      // Ações - desligado, usa a Ação com a estrela direto, como sempre.
      if (acoes.length > 1 && this.actor.system.perguntarAcaoAoUsar) {
        const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
        const cartoes = acoes.map((acao, i) => {
          const custos = [acao.custoEstamina ? `${acao.custoEstamina} Estamina` : "", acao.custoMana ? `${acao.custoMana} Mana` : ""].filter(Boolean).join(" + ") || "sem custo";
          let resumo = ""; try { resumo = String(naurenResumoDaAcao(acao, item)?._resumo ?? "").replace(/<[^>]+>/g, "").trim(); } catch (err) { resumo = ""; }
          return `<button type="button" class="nauren-mov-opcao" data-escolha="${i}"><i class="fas fa-play"></i><span class="nauren-mov-titulo">${esc(acao.nome || `Ação ${i + 1}`)}</span><span class="nauren-mov-custo">${esc(custos)}</span>${resumo ? `<span class="nauren-mov-nota">${esc(resumo)}</span>` : ""}</button>`;
        }).join("");
        let escolha = null;
        await foundry.applications.api.DialogV2.wait({
          window: { title: `${item.name} · qual Ação?` }, classes: ["nauren-janela-movimento"], position: { width: 460 },
          content: `<div class="nauren-mov"><div class="nauren-mov-opcoes">${cartoes}</div></div>`,
          buttons: [{ action: "cancelar", label: "Cancelar" }], rejectClose: false,
          render: (ev, dialog) => {
            const raiz = dialog?.element ?? document;
            raiz.querySelectorAll(".nauren-mov-opcao").forEach(b => b.addEventListener("click", () => { escolha = b.dataset.escolha; dialog.close(); }));
          }
        }).catch(() => null);
        if (escolha === null || escolha === undefined) return; // fechou sem escolher = cancela
        idx = Number(escolha);
      }

      await this._executarAcao(item, idx);
      return;
    }
    if (item.type === "consumivel") {
      await this._usarConsumivelSimples(item);
      return;
    }
    ui.notifications.warn(`${item.name} não tem nenhuma Ação configurada ainda. Abra a ficha do item e adicione uma.`);
  }

  /**
   * "Modo de Mira": espera o jogador marcar alvos suficientes (tecla T,
   * ou o ícone de mira que o próprio Foundry mostra ao passar o mouse no
   * token), mostrando um contador ao vivo, e devolve "true" assim que
   * atingir o número necessário (ou imediatamente, se já tiver o
   * suficiente). Devolve "false" se cancelado (ESC). Escuta o Hook
   * nativo "targetToken" (dispara pra QUALQUER usuário mudando alvo, não
   * só o local - reconfere sempre "game.user.targets", que é sempre o
   * conjunto do usuário LOCAL, então não afeta outros clientes).
   * NÃO sobrescreve nenhum clique/comportamento nativo de token - só
   * observa passivamente a forma normal de marcar alvo do Foundry.
   */
  async _aguardarAlvosNecessarios(numeroAlvos, nomeAcao) {
    // Alvo marcado num turno anterior (esquecido): pergunta antes de usar, em vez de usar em silêncio.
    if (game.user.targets.size >= numeroAlvos && naurenAlvosSaoVelhos()) {
      const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
      const nomes = [...game.user.targets].map(t => t.name);
      const lista = nomes.length > 1 ? `${nomes.slice(0, -1).map(n => `<b>${esc(n)}</b>`).join(", ")} e <b>${esc(nomes.at(-1))}</b>` : `<b>${esc(nomes[0])}</b>`;
      const rotulo = nomes.length > 1 ? "Usar nesses alvos" : `Usar em ${nomes[0]}`;
      const escolha = await foundry.applications.api.DialogV2.wait({
        window: { title: nomeAcao }, classes: ["nauren-dialogo"], position: { width: 420 },
        content: `<p>Você ainda tem ${nomes.length > 1 ? "alvos marcados" : "um alvo marcado"} de antes: ${lista}.</p><p>Usar <b>${esc(nomeAcao)}</b> ${nomes.length > 1 ? "neles" : "nele"}?</p>`,
        buttons: [{ action: "usar", label: rotulo, default: true }, { action: "trocar", label: "Escolher outro alvo" }],
        rejectClose: false
      }).catch(() => null);
      if (!escolha) return false;
      if (escolha === "usar") { naurenMarcarAlvosAgora(); return true; }
      naurenLimparMeusAlvos(); // "trocar": desmarca e cai na mira normal abaixo
    }
    if (game.user.targets.size >= numeroAlvos) return true;
    return new Promise(resolve => {
      const hud = document.createElement("div");
      hud.className = "nauren-modo-mira-hud";
      hud.innerHTML = `<i class="fas fa-crosshairs"></i><span class="nauren-modo-mira-texto">Marque ${numeroAlvos > 1 ? "os alvos" : "o alvo"} de <b>${nomeAcao}</b>: passe o mouse sobre o token e aperte ${numeroAlvos > 1 ? "<kbd>Shift</kbd>+<kbd>T</kbd> para marcar mais de um" : "<kbd>T</kbd>"}</span><span class="nauren-modo-mira-contagem"><span class="nauren-modo-mira-contador">${game.user.targets.size}</span>/${numeroAlvos}</span><span class="nauren-modo-mira-enter"><kbd>Enter</kbd> seguir com menos</span><span class="nauren-modo-mira-esc"><kbd>Esc</kbd> cancelar</span>`;
      document.body.appendChild(hud);

      const limpar = () => {
        Hooks.off("targetToken", onTarget);
        document.removeEventListener("keydown", onKeydown);
        hud.remove();
      };
      const onTarget = () => {
        const contador = hud.querySelector(".nauren-modo-mira-contador");
        if (contador) contador.textContent = String(game.user.targets.size);
        if (game.user.targets.size >= numeroAlvos) {
          limpar();
          resolve(true);
        }
      };
      const onKeydown = ev => {
        if (ev.key === "Escape") {
          ev.preventDefault();
          limpar();
          resolve(false);
        } else if (ev.key === "Enter") {
          // Segue com MENOS alvos do que o máximo pedido (ex: Restauração
          // Interior permite até 3, mas o jogador só quer curar 2) - exige
          // pelo menos 1 marcado, senão "Enter" não faria sentido (a Ação
          // continuaria sem ninguém pra afetar). Quem usa o resultado
          // (_resolverAlvosDaAcao) já lê TODOS os "targets" marcados no
          // momento, não um número fixo - então nenhum ajuste extra é
          // necessário aqui além de liberar o "true" mais cedo.
          // Bug real corrigido: sem "preventDefault", este MESMO Enter
          // continuava seu comportamento padrão do navegador depois de
          // resolver a Promise - se o elemento que disparou a Ação (ex: o
          // ícone de dado "Usar Ação ativa", um <a>) ainda estivesse com
          // foco (o clique original dá foco a ele), o navegador simula um
          // segundo clique NELE ao soltar Enter, reexecutando a Ação
          // inteira uma 2ª vez por cima - a 2ª execução entrava em
          // conflito com a 1ª (que seguia rumo ao popup de Crescimento,
          // entre outros), e o popup parecia nunca aparecer.
          if (game.user.targets.size >= 1) {
            ev.preventDefault();
            limpar();
            resolve(true);
          }
        }
      };
      Hooks.on("targetToken", onTarget);
      document.addEventListener("keydown", onKeydown);
    });
  }

  /**
   * Mede a distância entre dois tokens (em metros/unidades da cena),
   * usando a distância BORDA-A-BORDA (considera o footprint real do
   * token, W×H em quadrados - token GRANDE, tipo 2x2/3x3, media
   * distância fantasma até o CENTRO antes desta correção, dizendo
   * "fora de alcance" mesmo com a borda dele adjacente ao atacante) -
   * reaproveitada pra comparar contra o alcance textual de uma Ação
   * (ver _popupPreAcao). Devolve null se não conseguir medir (sem
   * token de origem, cena sem grid configurado etc.) - quem chamou
   * trata isso como "não sei", não como "0m de distância".
   */
  _medirDistanciaAteToken(tokenOrigemPlaceable, tokenAlvoPlaceable) {
    if (!tokenOrigemPlaceable || !tokenAlvoPlaceable || !canvas?.grid) return null;
    try {
      return Math.round(naurenMedirDistanciaBordas(tokenOrigemPlaceable, tokenAlvoPlaceable) * 10) / 10;
    } catch (err) {
      console.warn("Nauren RPG | Falha ao medir distância entre tokens.", err);
      return null;
    }
  }

  /**
   * Popup de CONFIRMAÇÃO ANTES de rolar/gastar qualquer coisa de uma
   * Ação (controlado por "usaPopupPreAcao" na ficha, ligado por padrão) -
   * mostra Facilidade/Normal/Dificuldade (já pré-selecionado conforme o
   * que já está ativo por Opções/Condição/Efeito, o jogador só muda se
   * quiser), um resumo do que vai rolar (fórmula de ataque com
   * bônus/debuffs, fórmulas de dano, alcance x distância do alvo
   * marcado), e campos pra somar um bônus/penalidade pontual no ataque
   * ou no dano. Devolve null se o jogador cancelar (ESC/fechar sem
   * confirmar) - quem chamou deve abortar a Ação inteira nesse caso,
   * igual cancelar o Modo de Mira já faz.
   */
  async _popupPreAcao(item, acao) {
    const ehAtaque = !!acao.ehAtaque;
    const rankAtual = item.system.rankAtual ?? 0;
    // Troca de Atributo de Ataque (ver Condição > trocaAtributoAtaqueOpcional,
    // ex: Profusão Retraída, Empíreo) - calculado aqui (não dentro do
    // htmlAjustes abaixo) porque também precisa ser lido no listener/leitura
    // do formulário mais adiante.
    const condicaoTroca = ehAtaque ? this._condicaoComTrocaDeAtributo(acao) : null;
    // Bônus de Teste em Área (ver NaurenHabilidadeData > concedeBonusTesteArea,
    // ex: Presença, Empíreo) - mesma ideia de "condicaoTroca" acima:
    // calculado aqui, lido no HTML e no listener de leitura mais adiante.
    const bonusArea = ehAtaque ? this._bonusTesteAreaDisponivel() : null;
    // Espírito da Batalha (Guerreiro) - só relevante se esta Ação tiver
    // custo de Estamina pra trocar. Calculado aqui (não dentro do
    // recursosLista abaixo) porque também é usado no HTML da linha e no
    // listener do checkbox mais adiante.
    const espiritoInfo = (acao.custoEstamina ?? 0) > 0 ? this._espiritoDeBatalhaInfo() : null;
    const localBonus = this._resolverEfeitosDaAcao(acao);

    let htmlModo = "";
    let modoEfetivo = "normal";
    let formulaAtaque = "";
    if (ehAtaque) {
      const { formula, modoDoAlvo } = this._montarFormulaAtaque(acao, localBonus, rankAtual);
      formulaAtaque = formula;
      modoEfetivo = this._calcularModoEfetivo("ataque", modoDoAlvo, item.type);
      const fontesModo = this._fontesModoAtaque(item, acao, localBonus);
      const escF = foundry.utils.escapeHTML;
      const htmlFontes = fontesModo.length
        ? `<ul class="nauren-popup-fontes-modo">${fontesModo.map(f => `<li class="${f.delta > 0 ? "facilidade" : f.delta < 0 ? "dificuldade" : "neutra"}"><i class="fas ${f.delta > 0 ? "fa-arrow-up" : f.delta < 0 ? "fa-arrow-down" : "fa-equals"}"></i><b>${escF(f.fonte)}</b><span>${escF(f.efeito)}</span></li>`).join("")}</ul>
           ${fontesModo.some(f => f.delta > 0) && fontesModo.some(f => f.delta < 0) ? `<p class="nauren-popup-fontes-nota">Facilidade e Dificuldade se anulam uma a uma; o que sobrar decide a seleção acima.</p>` : ""}`
        : `<p class="nauren-popup-fontes-nota">Nenhuma Facilidade ou Dificuldade automática neste ataque.</p>`;
      htmlModo = `
        <fieldset class="nauren-popup-group">
          <legend>Modo de rolagem</legend>
          <div class="nauren-modo-rolagem-grupo">
            <label class="nauren-modo-rolagem-opt"><input type="radio" name="modoPreAcao" value="vantagem" ${modoEfetivo === "vantagem" ? "checked" : ""}><span>Facilidade</span></label>
            <label class="nauren-modo-rolagem-opt"><input type="radio" name="modoPreAcao" value="normal" ${modoEfetivo === "normal" ? "checked" : ""}><span>Normal</span></label>
            <label class="nauren-modo-rolagem-opt"><input type="radio" name="modoPreAcao" value="desvantagem" ${modoEfetivo === "desvantagem" ? "checked" : ""}><span>Dificuldade</span></label>
          </div>
          <div class="nauren-popup-fontes-titulo">Por que veio assim</div>
          ${htmlFontes}
          ${(() => { const l = naurenLinhaModoExtra(this._somaModo("ataque", modoDoAlvo, item.type)); return l ? `<p class="nauren-popup-fontes-nota"><b>${l.label}:</b> ${l.value} no teste (cada uma além da primeira vale 2).</p>` : ""; })()}
        </fieldset>`;
    }

    // Resumo dos blocos de Dano E Cura (fórmulas, sem rolar) - só
    // informativo. Reaproveita "_calcularResumoDanoECura" (ver acima,
    // compartilhado com o popup de Penitência do Sacerdote) pra sempre
    // incluir o Bônus/Dado Extra de Condições/Efeitos (ver campoModificador
    // > danoDado/danoBonus/curaDado/curaBonus, ex: Terra Mágica) e o
    // "auto" (maior dado já presente na fórmula BASE deste bloco) já
    // resolvido pro dado real. Bug real corrigido: o resumo de Cura nunca
    // existia (só o de Dano) - uma Magia só de cura, como Sanatio, não
    // mostrava NENHUM dado no popup de confirmação, mesmo tendo um bloco
    // de Cura configurado igual qualquer Ação de Dano tem.
    const { danosResumo, curasResumo, bonusDanoCondicionalResumo, bonusCuraCondicionalResumo } = this._calcularResumoDanoECura(item, acao);

    // Alcance x distância do alvo marcado - "numeroAlcance" já vem com
    // TODOS os bônus somados (ver _calcularAlcanceEfetivo: tokens livres,
    // alcanceBonusTotal, e Bônus Condicional ao Alvo, ex: Foco Mortal do
    // Caçador) - bug real corrigido: antes só extraía o número CRU de
    // "acao.alcance" (ex: "9m" → 9), então o popup mostrava "fora de
    // alcance" mesmo quando o ataque de fato alcançava, já que a
    // checagem REAL (em _resolverAlvosDaAcao) somava esses bônus e esta
    // aqui não.
    const numeroAlcance = this._calcularAlcanceEfetivo(acao, item);
    // "getActiveTokens()[0]" sozinho é arbitrário se o Ator tiver MAIS DE
    // UM token no mapa (NPC genérico duplicado, por exemplo) - sempre
    // pegava o primeiro da lista, nunca necessariamente o token que o
    // jogador está de fato controlando/movendo, o que travava a distância
    // medida num valor fixo (sempre o mesmo token "errado" como origem,
    // parado). Prioriza o token CONTROLADO na tela agora - mesmo padrão
    // já usado em "_resolverAlvosDaAcao".
    const tokenOrigem = canvas.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0];
    const alvoMarcado = Array.from(game.user.targets)[0];
    const distanciaAlvo = (Number.isFinite(numeroAlcance) && tokenOrigem && alvoMarcado)
      ? this._medirDistanciaAteToken(tokenOrigem, alvoMarcado) : null;

    const linhasResumo = [];
    if (acao.alcance) {
      const foraDoAlcance = distanciaAlvo !== null && distanciaAlvo > numeroAlcance;
      linhasResumo.push(`<span id="nauren-linha-alcance"${foraDoAlcance ? ' style="color: #c24b4b; font-weight: bold;"' : ""}>Alcance ${Number.isFinite(numeroAlcance) ? `${numeroAlcance}m` : String(acao.alcance)}${distanciaAlvo !== null ? ` — alvo a ${distanciaAlvo}m${foraDoAlcance ? " ⚠" : ""}` : ""}</span>`);
    }
    if (danosResumo.length) linhasResumo.push(`Dano ${danosResumo.join(" + ")}${bonusDanoCondicionalResumo ? ` + ${bonusDanoCondicionalResumo}` : ""}`);
    if (curasResumo.length) linhasResumo.push(`Cura ${curasResumo.join(" + ")}${bonusCuraCondicionalResumo ? ` + ${bonusCuraCondicionalResumo}` : ""}`);
    if (acao.usaTemplate) linhasResumo.push(`Área ${acao.templateTamanho}m (${acao.templateTipo})`);
    if (ehAtaque) linhasResumo.push(`Ataque 1d20 + ${formulaAtaque}`);

    const resumoGeral = `
      <p class="nauren-popup-intro"><b>${item.name}</b>${acao.nome && acao.nome !== "Ação" && acao.nome !== item.name ? ` — ${acao.nome}` : ""}</p>
      ${linhasResumo.length ? `<p class="item-meta-hint nauren-popup-resumo">${linhasResumo.join(" · ")}</p>` : ""}
    `;

    // Escolhas reais do jogador ficam à vista; os ajustes de mesa (raros) ficam recolhidos e só com o que
    // faz sentido para esta Ação (sem "Bônus no Ataque" numa Ação que não ataca, etc.).
    const temDanoPopup = !!danosResumo.length || ehAtaque;
    const temAlvoPopup = (acao.modoAlvo || "nenhum") !== "nenhum";
    const htmlEscolhas = (condicaoTroca || bonusArea) ? `
      <fieldset class="nauren-popup-group">
        <legend>Opções deste uso</legend>
        ${condicaoTroca ? `
        <label class="nauren-popup-opt" style="margin-top: 4px;">
          <input type="checkbox" name="trocarAtributoAtaque">
          <span>Usar ${ATRIBUTOS_BONUS[condicaoTroca.atributo] || condicaoTroca.atributo} no lugar de ${ATRIBUTOS_BONUS[acao.atributoAtaque || "poderAtaque"] || "Poder de Ataque"} (${condicaoTroca.nome})</span>
        </label>` : ""}
        ${bonusArea ? `
        <label class="nauren-popup-opt" style="margin-top: 4px;">
          <input type="checkbox" name="usarBonusAreaAtaque">
          <span>Adicionar bônus de ${bonusArea.nome}${bonusArea.donoNome !== this.actor.name ? ` (${bonusArea.donoNome})` : ""} — ${bonusArea.dado}, 1x por turno</span>
        </label>` : ""}
      </fieldset>` : "";
    const htmlAjustes = `${htmlEscolhas}
      <details class="nauren-popup-group nauren-popup-ajustes-mesa">
        <summary>Ajustes da mesa (opcional, só neste uso)</summary>
        ${ehAtaque ? `
        <div class="nauren-popup-opt-row">
          <label style="flex: 1;">Bônus/Penalidade no Ataque</label>
          <input type="text" name="bonusAtaqueAdhoc" value="0" class="nauren-popup-ajuste" title="Aceita dado (ex: 1d4+2, -1d6)">
        </div>` : ""}
        ${temDanoPopup ? `
        <div class="nauren-popup-opt-row">
          <label style="flex: 1;">Bônus/Penalidade no Dano</label>
          <input type="text" name="bonusDanoAdhoc" value="0" class="nauren-popup-ajuste" title="Aceita dado (ex: 1d4+2, -1d6)">
        </div>` : ""}
        ${ehAtaque ? `
        <div class="nauren-popup-opt-row">
          <label style="flex: 1;">Ajuste no Limiar de Deflexão</label>
          <input type="text" name="ajusteLimiarDeflexao" value="0" class="nauren-popup-ajuste" title="Aceita dado (ex: 1d4). Some ao Limiar de Deflexão de quem está usando esta Ação - ajuda tanto o atacante original (facilita ser defletido de propósito) quanto quem for contra-atacar depois">
        </div>` : ""}
        ${acao.alcance && temAlvoPopup ? `
        <div class="nauren-popup-opt-row">
          <label style="flex: 1;">Bônus no Alcance (metros)</label>
          <input type="text" name="bonusAlcanceAdhoc" value="0" class="nauren-popup-ajuste" title="Aceita dado (ex: 1d4, 1d6+2) - rolado ao confirmar" data-alcance-base="${numeroAlcance}" data-distancia-alvo="${distanciaAlvo ?? ""}">
        </div>` : ""}
        ${acao.usaTemplate ? `
        <div class="nauren-popup-opt-row">
          <label style="flex: 1;">Bônus/Penalidade na Área (metros)</label>
          <input type="text" name="bonusAreaAdhoc" value="0" class="nauren-popup-ajuste" title="Aceita dado (ex: 1d4, -2). Positivo aumenta o tamanho da área (raio/comprimento), negativo reduz - só nesta rolagem">
        </div>` : ""}
        ${temAlvoPopup || acao.usaTemplate ? `
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #453e66;">
          <label style="display: block; margin-bottom: 4px;">Condição/Efeito extra no(s) alvo(s)</label>
          <div id="nauren-condicoes-adhoc-container">
            <div class="nauren-condicao-adhoc-linha">
              <div class="nauren-popup-opt-row">
                <input type="text" class="nauren-uuid-input nauren-popup-ajuste nauren-condicao-adhoc-input" placeholder="Arraste um item aqui" style="flex: 1;">
              </div>
            </div>
          </div>
        </div>` : ""}
      </details>`;

    // Recursos que ESTA Ação vai consumir (custo PRÓPRIO: Estamina, Mana,
    // Uso, Carga) OU causar no ALVO (gastosRecurso da Ação SEMPRE drena
    // recurso do alvo, nunca de quem usa - rótulo diferente pra não
    // confundir os dois) - cada um com checkbox próprio de "aplicar"
    // (marcado por padrão), mais um master no topo que desmarca todos de
    // uma vez (pra testes, ou uma decisão de mesa pontual).
    const recursosLista = [];
    if ((acao.custoEstamina ?? 0) > 0) {
      const base = acao.custoEstamina;
      const primeiraArma = naurenPreverDuasArmasGratis(this.actor, item, acao);
      const { extra, nomes } = naurenExtraEstaminaCondicoes(this.actor);
      let label = `Estamina de Combate: ${base}`;
      if (primeiraArma) label = `Estamina de Combate: <b>0</b> <em>(2º ataque com duas armas; o 1º foi com ${primeiraArma})</em>`;
      else if (extra) label = `Estamina de Combate: <b>${base + extra}</b> <em style="color:#e0a14b;">(${base} + ${extra} por ${nomes.join(", ")})</em>`;
      const temEst = this.actor.system.estaminaCombate?.value ?? 0;
      if (!primeiraArma && temEst < base + extra) label += ` <b style="color:#c24b4b;">⚠ você tem ${temEst}</b>`;
      recursosLista.push({ id: "estamina", label, noAlvo: false });
    }
    if ((acao.custoMana ?? 0) > 0) {
      const temMana = this.actor.system.mana?.value ?? 0;
      // Mesmo ajuste que a Ação vai cobrar (Combustão, Empoderamento Estelar, Buraco de Minhoca...):
      // antes a janela mostrava o custo de tabela e o card cobrava outro valor.
      let custoM = acao.custoMana, ajusteTxt = "";
      if (item.type === "magia") {
        const ajM = naurenAjusteCustoManaMagia(this.actor, item, acao, false);
        if (ajM.linhas.length) {
          const novo = Math.max(ajM.minimo, custoM + ajM.delta);
          if (novo !== custoM) { ajusteTxt = ` <em style="color:#e0a14b;">(${custoM} → ${novo}: ${ajM.linhas.join(", ")})</em>`; custoM = novo; }
        }
      }
      recursosLista.push({ id: "mana", label: `Mana: <b>${custoM}</b>${ajusteTxt}${temMana < custoM ? ` <b style="color:#c24b4b;">⚠ você tem ${temMana}</b>` : ""}`, noAlvo: false });
    }
    (acao.custosRecursoProprio ?? []).forEach((c, i) => {
      if (!c.ativo || !c.recurso) return;
      let formulaQtd = this._resolverPorRank(c.quantidadePorRank, rankAtual, "quantidade") ?? c.quantidade ?? "1";
      if (/@atacouNesteTurno\b/.test(formulaQtd)) formulaQtd = formulaQtd.replace(/@atacouNesteTurno\b/g, this.#atacouNesteTurnoAtual ? "1" : "0");
      if (/@quantidadeEscolhida\b/.test(formulaQtd)) formulaQtd = formulaQtd.replace(/@quantidadeEscolhida\b/g, String(this.#quantidadeRecursoEscolhidaAtual));
      const temDadoCusto = /\d*d\d+/i.test(formulaQtd);
      const qtdNumero = temDadoCusto ? formulaQtd : Math.round(naurenInterpretarModificador(formulaQtd, this.actor)?.valor ?? 0);
      if (!temDadoCusto && qtdNumero <= 0) return;
      const nomeRecurso = c.recurso.startsWith("recursoCustom:")
        ? (this.actor.system.recursosCustom ?? []).find(r => r.id === c.recurso.slice(14))?.nome ?? c.recurso
        : naurenNomeDoRecurso(null, c.recurso);
      // "estresse" AUMENTA (é um custo que soma, não um recurso que se
      // gasta) - o rótulo precisa refletir isso, "Consumir Estresse"
      // soaria ao contrário do que realmente acontece.
      const label = c.recurso === "estresse" ? `Ganhar ${nomeRecurso}: ${qtdNumero}` : `${nomeRecurso}: ${qtdNumero}`;
      recursosLista.push({ id: `custoProprio_${i}`, label, noAlvo: false, semPrefixo: c.recurso === "estresse" });
    });
    (acao.gastosRecurso ?? []).forEach((g, i) => {
      if (!g.ativo) return;
      const qtd = this._resolverPorRank(g.quantidadePorRank, rankAtual, "quantidade") ?? g.quantidade ?? 1;
      const qtdNumero = Number(qtd);
      // Sinal de menos = a Ação DÁ o recurso (inclusive com dado: "-1d4" recupera 1d4).
      const ehConcessao = (Number.isFinite(qtdNumero) && qtdNumero <= 0) || /^\s*-/.test(String(qtd));
      // Concessão (negativa) normalmente é aplicada direto, sem popup -
      // exceto quando "mostrarConcessaoNoPopup" pede o oposto (uma
      // concessão CONDICIONAL/OPCIONAL, ex: Restauração Interior).
      if (ehConcessao && !g.mostrarConcessaoNoPopup) return;
      const nomeRecurso = g.recurso?.startsWith("recursoCustom:")
        ? (this.actor.system.recursosCustom ?? []).find(r => r.id === g.recurso.slice(14))?.nome ?? g.recurso
        : ({ vida: "Vida", estamina: "Estamina", mana: "Mana", destino: "Dado de Destino", estresse: "Estresse" }[g.recurso] ?? g.recurso);
      const emMim = !acao.modoAlvo || acao.modoAlvo === "nenhum"; // sem alvo: o gasto cai em você
      const qtdTexto = String(qtd).includes("@quantidadeEscolhida") ? "a quantidade escolhida de" : `${Math.abs(qtdNumero) || naurenFormulaParaTexto(String(qtd).replace(/^-/, ""), this.actor)} de`;
      const ehEstresse = g.recurso === "estresse";
      const label = ehEstresse
        ? (ehConcessao ? `Remover ${qtdTexto} Estresse${emMim ? "" : " do alvo"}` : `${emMim ? "Sofrer" : "O alvo sofre"} ${qtdTexto} Estresse`)
        : ehConcessao
          ? (emMim ? `Receber ${qtdTexto} ${nomeRecurso}` : `Dar ${qtdTexto} ${nomeRecurso} ao alvo`)
          : (emMim ? `Gastar ${qtdTexto} ${nomeRecurso} seu` : `Tirar ${qtdTexto} ${nomeRecurso} do alvo`);
      recursosLista.push({ id: `gasto_${i}`, label, noAlvo: !emMim, semPrefixo: true });
    });
    if (acao.usaUsos) recursosLista.push({ id: "uso", label: "1 Uso", noAlvo: false });
    if (acao.usaCargas && acao.consumirCargaAoUsar) {
      const custoCargas = acao.cargasCustoPorUso ?? 1;
      const nomeOrigem = acao.cargasFonte === "consumivel" ? (this.actor.items.get(acao.cargasConsumivelId)?.name ?? "Consumível") : "Carga";
      recursosLista.push({ id: "carga", label: `${nomeOrigem}: ${custoCargas}`, noAlvo: false });
    }
    let htmlRecursos = "";
    if (recursosLista.length) {
      const linhasRecursos = recursosLista.map(r => {
        const linhaPrincipal = `
        <label class="nauren-popup-opt"><input type="checkbox" name="consumir_${r.id}" class="nauren-popup-consumir-item" checked><span>${r.semPrefixo ? r.label : `${r.noAlvo ? "Causar" : "Consumir"} ${r.label}`}</span></label>`;
        // Espírito da Batalha (Guerreiro) - sub-opção logo abaixo da
        // linha de Estamina, com leve recuo pra deixar claro que é uma
        // FORMA ALTERNATIVA de pagar aquele mesmo custo, não um consumo à
        // parte. Desabilitada (mesmo estilo "opacity" já usado noutros
        // cantos do sistema pra opções indisponíveis) quando não sobra
        // uso nesta rodada, ou a barra já está vazia.
        if (r.id === "estamina" && espiritoInfo) {
          const semUsos = espiritoInfo.usosRestantes <= 0 && this._atorEstaEmCombateAtivo();
          const custoEst = Math.max(1, Number(acao.custoEstamina) || 0);
          const semEspirito = espiritoInfo.valorAtual < custoEst;
          const desabilitado = semUsos || semEspirito;
          const motivo = semUsos ? " (sem usos restantes nesta rodada)" : (semEspirito ? ` (precisa de ${custoEst}, a barra tem ${espiritoInfo.valorAtual})` : ` · barra ${espiritoInfo.valorAtual}`);
          return linhaPrincipal + `
        <label class="nauren-popup-opt" style="margin-left: 22px;${desabilitado ? " opacity: 0.45;" : ""}">
          <input type="checkbox" name="trocarPorEspiritoBatalha"${desabilitado ? " disabled" : ""}>
          <span>Trocar por Espírito da Batalha (${espiritoInfo.usosRestantes}/${espiritoInfo.usosMax} usos restantes)${motivo}</span>
        </label>`;
        }
        return linhaPrincipal;
      }).join("");
      htmlRecursos = `
        <fieldset class="nauren-popup-group">
          <legend>Recursos desta Ação</legend>
          <label class="nauren-popup-opt" style="font-weight: bold;"><input type="checkbox" name="naoConsumirNenhum" class="nauren-popup-master-recurso"><span>Desligar tudo abaixo</span></label>
          ${linhasRecursos}
        </fieldset>`;
    }

    const htmlTestes = temDanoPopup ? `
      <details class="nauren-popup-group nauren-popup-ajustes-mesa">
        <summary>Restringir dano causado (opcional)</summary>
        <label class="nauren-popup-opt"><input type="checkbox" name="naoDarDanoAlvo"><span>Não dar Dano no Alvo</span></label>
        <label class="nauren-popup-opt"><input type="checkbox" name="naoDarDanoAliados"><span>Não dar Dano em Aliados</span></label>
      </details>` : "";

    const buffsCandidatos = this._buffsProximaAcaoCandidatos(item, acao);
    const htmlBuffs = buffsCandidatos.length ? `
      <fieldset class="nauren-popup-group">
        <legend>Buffs de próxima ação</legend>
        ${buffsCandidatos.map(c => `
          <label class="nauren-popup-opt"><input type="checkbox" name="usarBuff_${c.id}" checked>
            <span><b>${c.name}</b>${c.system.acumulativel ? ` (${Math.max(1, c.system.acumulos ?? 1)}×)` : ""} — ${this._resumoBuffProximaAcao(c, acao).join(", ") || "aplicado"}</span></label>`).join("")}
        <p class="nauren-popup-nota">Desmarque para guardar o buff para outra Ação.</p>
      </fieldset>` : "";
    const content = `${resumoGeral}${htmlModo}${htmlBuffs}${htmlAjustes}${htmlRecursos}${htmlTestes}`;

    // Master "Não Consumir Nenhum Recurso" desmarca (e desabilita) os
    // checkboxes individuais - desmarcar o master de novo reabilita tudo,
    // mas mantém desmarcados (o jogador re-marca manualmente o que quiser
    // consumir de volta). Também atualiza a linha de Alcance ao vivo
    // conforme o jogador digita um bônus pontual (ver "bonusAlcanceAdhoc").
    const aoRenderizarPopupPreAcao = (app, html) => {
      if (app?.options?.window?.title !== `${item.name} — confirmar uso`) return;
      const root = html instanceof HTMLElement ? html : (html?.[0] ?? app.element);
      if (!root) return;
      const master = root.querySelector('input[name="naoConsumirNenhum"]');
      const trocaEspirito = root.querySelector('input[name="trocarPorEspiritoBatalha"]');
      if (master) {
        // "trocarPorEspiritoBatalha" não tem a classe ".nauren-popup-
        // consumir-item" (não é um consumo simples de liga/desliga, é
        // uma FORMA ALTERNATIVA de pagar) - por isso precisa de um
        // tratamento próprio aqui, lembrando se já estava desabilitado
        // de propósito (sem usos/sem Espírito) antes de reabilitar.
        const trocaJaEstavaDesabilitada = trocaEspirito?.disabled ?? false;
        master.addEventListener("change", () => {
          root.querySelectorAll(".nauren-popup-consumir-item").forEach(cb => {
            cb.disabled = master.checked;
            if (master.checked) cb.checked = false;
          });
          if (trocaEspirito) {
            trocaEspirito.disabled = master.checked || trocaJaEstavaDesabilitada;
            if (master.checked) trocaEspirito.checked = false;
          }
        });
      }
      const campoAlcance = root.querySelector('input[name="bonusAlcanceAdhoc"]');
      const linhaAlcance = root.querySelector("#nauren-linha-alcance");
      if (campoAlcance && linhaAlcance) {
        const base = parseFloat(campoAlcance.dataset.alcanceBase);
        const distancia = campoAlcance.dataset.distanciaAlvo ? parseFloat(campoAlcance.dataset.distanciaAlvo) : null;
        campoAlcance.addEventListener("input", () => {
          if (!Number.isFinite(base)) return; // alcance "pessoal"/"toque": não há número para somar
          const texto = String(campoAlcance.value ?? "").trim();
          if (/\d*d\d+/i.test(texto)) {
            linhaAlcance.style.color = ""; linhaAlcance.style.fontWeight = "normal";
            linhaAlcance.textContent = `Alcance ${base}m + ${texto} (rolado ao confirmar)${distancia !== null ? ` — alvo a ${distancia}m` : ""}`;
            return;
          }
          const extra = Number(texto) || 0;
          const alcanceFinal = base + extra;
          const foraDoAlcance = distancia !== null && distancia > alcanceFinal;
          linhaAlcance.style.color = foraDoAlcance ? "#c24b4b" : "";
          linhaAlcance.style.fontWeight = foraDoAlcance ? "bold" : "normal";
          linhaAlcance.textContent = `Alcance ${alcanceFinal}m${distancia !== null ? ` — alvo a ${distancia}m${foraDoAlcance ? " ⚠" : ""}` : ""}`;
        });
      }

      // Condição/Efeito extra: o drag-drop de ".nauren-uuid-input" só é
      // registrado na FICHA do item (this.element de NaurenItemSheet) -
      // nunca alcança um DialogV2 separado, que tem seu próprio DOM.
      // Registra a MESMA lógica aqui dentro, e ainda adiciona uma nova
      // linha vazia automaticamente sempre que a ÚLTIMA linha receber um
      // item arrastado - assim dá pra soltar quantas Condições/Efeitos
      // quiser, uma por vez.
      const configurarLinhaCondicaoAdhoc = (inputEl) => {
        inputEl.addEventListener("dragover", ev => ev.preventDefault());
        inputEl.addEventListener("drop", async ev => {
          ev.preventDefault();
          let dados;
          try { dados = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (err) { return; }
          const uuid = dados?.uuid;
          if (!uuid) { ui.notifications.warn("Isso não parece ser um item válido pra arrastar aqui."); return; }
          inputEl.value = uuid;
          const doc = await fromUuid(uuid).catch(() => null);
          const linha = inputEl.closest(".nauren-condicao-adhoc-linha");
          const opcaoRow = inputEl.closest(".nauren-popup-opt-row");
          if (!linha || !opcaoRow) return;

          let resolvido = linha.querySelector(".nauren-uuid-resolved");
          if (!resolvido) {
            resolvido = document.createElement("div");
            resolvido.className = "nauren-uuid-resolved";
            linha.appendChild(resolvido);
          }
          resolvido.textContent = doc ? `→ ${doc.name}` : "→ ⚠ não encontrado";

          // Lixeira: some junto da linha se houver mais de uma no total
          // (já não faz sentido esta ficar vazia com outra igual do
          // lado), ou só LIMPA (valor, nome resolvido, a própria lixeira)
          // se esta for a ÚNICA linha restante - sempre precisa sobrar
          // pelo menos 1 pra arrastar de novo.
          if (!opcaoRow.querySelector(".nauren-condicao-adhoc-remover")) {
            const lixeira = document.createElement("a");
            lixeira.className = "nauren-condicao-adhoc-remover";
            lixeira.title = "Remover";
            lixeira.innerHTML = '<i class="fas fa-trash"></i>';
            lixeira.addEventListener("click", () => {
              const container = root.querySelector("#nauren-condicoes-adhoc-container");
              const todasAgora = container?.querySelectorAll(".nauren-condicao-adhoc-linha") ?? [];
              if (todasAgora.length > 1) {
                linha.remove();
              } else {
                inputEl.value = "";
                resolvido.remove();
                lixeira.remove();
              }
            });
            opcaoRow.appendChild(lixeira);
          }

          // Só cria uma linha nova se esta for a ÚLTIMA do container (evita
          // acumular linhas vazias extras se o jogador arrastar de novo
          // numa linha já preenchida no meio da lista).
          const container = root.querySelector("#nauren-condicoes-adhoc-container");
          const todasLinhas = container?.querySelectorAll(".nauren-condicao-adhoc-linha");
          if (container && todasLinhas && linha === todasLinhas[todasLinhas.length - 1]) {
            const novaLinha = document.createElement("div");
            novaLinha.className = "nauren-condicao-adhoc-linha";
            novaLinha.style.marginTop = "4px";
            const novaOpcaoRow = document.createElement("div");
            novaOpcaoRow.className = "nauren-popup-opt-row";
            const novoInput = document.createElement("input");
            novoInput.type = "text";
            novoInput.className = "nauren-uuid-input nauren-popup-ajuste nauren-condicao-adhoc-input";
            novoInput.placeholder = "Arraste outro item (opcional)";
            novoInput.style.flex = "1";
            novaOpcaoRow.appendChild(novoInput);
            novaLinha.appendChild(novaOpcaoRow);
            container.appendChild(novaLinha);
            configurarLinhaCondicaoAdhoc(novoInput);
          }
        });
      };
      root.querySelectorAll(".nauren-condicao-adhoc-input").forEach(configurarLinhaCondicaoAdhoc);
    };
    Hooks.on("renderDialogV2", aoRenderizarPopupPreAcao);

    let dados = null;
    try {
      await foundry.applications.api.DialogV2.wait({
        window: { title: `${item.name} — confirmar uso` },
        content,
        buttons: [{
          label: "Confirmar",
          action: "ok",
          default: true,
          callback: async (event, button, dialog) => {
            const formEl = button?.form || event?.currentTarget?.form || dialog?.element?.querySelector?.("form") || dialog?.querySelector?.("form");
            if (!formEl) return;
            const consumir = {};
            recursosLista.forEach(r => { consumir[r.id] = !!formEl.querySelector(`input[name="consumir_${r.id}"]`)?.checked; });
            // "bonusAtaqueAdhoc"/"bonusDanoAdhoc" ficam como TEXTO (aceitam
            // dado, ex: "1d4+2") - fluem direto pra dentro da fórmula real
            // de ataque/dano mais adiante (_montarFormulaAtaque/
            // _rolarBlocoDano), que já usa um Roll de verdade, então o
            // dado é resolvido lá, sem precisar rolar aqui. "0"/vazio não
            // aparece como "+0" na fórmula (ver os dois pontos de consumo).
            const bonusAtaqueTexto = (formEl.querySelector('input[name="bonusAtaqueAdhoc"]')?.value || "0").trim();
            const bonusDanoTexto = (formEl.querySelector('input[name="bonusDanoAdhoc"]')?.value || "0").trim();
            // "ajusteLimiarDeflexao" é aritmética JS pura (comparado direto
            // contra outro número, nunca passa por um Roll formal) - se
            // tiver dado, precisa ser rolado DE VERDADE aqui, agora.
            const textoLimiar = (formEl.querySelector('input[name="ajusteLimiarDeflexao"]')?.value || "0").trim();
            let ajusteLimiarDeflexao = 0;
            if (textoLimiar && textoLimiar !== "0") {
              try { ajusteLimiarDeflexao = Math.round((await new Roll(textoLimiar).evaluate()).total); } catch (err) { ajusteLimiarDeflexao = Number(textoLimiar) || 0; }
            }
            dados = {
              modoPreAcao: formEl.querySelector('input[name="modoPreAcao"]:checked')?.value || "normal",
              bonusAtaqueAdhoc: (bonusAtaqueTexto && bonusAtaqueTexto !== "0") ? bonusAtaqueTexto : "",
              bonusDanoAdhoc: (bonusDanoTexto && bonusDanoTexto !== "0") ? bonusDanoTexto : "",
              ajusteLimiarDeflexao,
              bonusAlcanceAdhoc: await naurenRolarAjustePopup(formEl.querySelector('input[name="bonusAlcanceAdhoc"]')?.value, "Bônus no Alcance"),
              bonusAreaAdhoc: await naurenRolarAjustePopup(formEl.querySelector('input[name="bonusAreaAdhoc"]')?.value, "Bônus na Área"),
              condicoesAdhocUuids: Array.from(formEl.querySelectorAll(".nauren-condicao-adhoc-input")).map(el => el.value).filter(Boolean),
              naoDarDanoAlvo: !!formEl.querySelector('input[name="naoDarDanoAlvo"]')?.checked,
              naoDarDanoAliados: !!formEl.querySelector('input[name="naoDarDanoAliados"]')?.checked,
              trocarPorEspiritoBatalha: !!formEl.querySelector('input[name="trocarPorEspiritoBatalha"]')?.checked,
              buffsUsar: buffsCandidatos.filter(c => formEl.querySelector(`input[name="usarBuff_${c.id}"]`)?.checked).map(c => c.id),
              // Troca de Atributo de Ataque (ver Condição >
              // trocaAtributoAtaqueOpcional) - já resolvido pro atributo de
              // verdade aqui (não só um booleano), pra "_executarAcao"
              // aplicar direto em "#atributoAtaqueSubstitutoAtual" sem
              // precisar recalcular "_condicaoComTrocaDeAtributo" de novo.
              atributoAtaqueSubstituto: (condicaoTroca && formEl.querySelector('input[name="trocarAtributoAtaque"]')?.checked) ? condicaoTroca.atributo : "",
              // Bônus de Teste em Área (ver NaurenHabilidadeData >
              // concedeBonusTesteArea) - já resolvido pro {itemUuid, dado}
              // de verdade aqui, mesma lógica de "atributoAtaqueSubstituto"
              // acima.
              bonusAreaAtaqueEscolhido: (bonusArea && formEl.querySelector('input[name="usarBonusAreaAtaque"]')?.checked) ? bonusArea : null,
              consumir
            };
          }
        }],
        rejectClose: false
      });
    } finally {
      Hooks.off("renderDialogV2", aoRenderizarPopupPreAcao);
    }

    if (!dados) return null; // fechou sem confirmar - cancela a Ação inteira
    return dados;
  }

  /**
   * "_rolarAtaqueDaAcao"/"_rolarBlocoDano" leem o bônus pontual do popup
   * de pré-Ação através dos campos privados desta ficha
   * ("#bonusAtaqueAdhocAtual" etc), normalmente preenchidos só dentro de
   * "_executarAcao". Contra-Atacar (dentro do popup de REAÇÃO ao tomar
   * dano) chama essas duas rolagens FORA desse fluxo normal - esta
   * função existe só pra preencher os mesmos campos manualmente antes
   * dessas chamadas, reaproveitando a rolagem sem duplicar a lógica dela.
   */
  _definirAjustesPreAcaoManualmente(escolhas) {
    this.#bonusAtaqueAdhocAtual = escolhas.bonusAtaqueAdhoc || 0;
    this.#bonusDanoAdhocAtual = escolhas.bonusDanoAdhoc || 0;
  }

  /**
   * Executa a Ação de índice "idx" do item: checa e desconta custo/cargas
   * PRÓPRIOS dela, resolve os Efeitos Vinculados dela (bônus só válido
   * enquanto ela está sendo usada), rola ataque/dano(s)/cura(s), e posta o
   * card no chat com o nome da Ação. Se ela cria área no mapa, já pede o
   * posicionamento.
   */
  /**
   * "@recurso_<id>" numa fórmula vale o que o recurso tinha QUANDO a Ação começou
   * (ex.: Poesia da Chuva — Descarregar gasta todos os pontos e causa esse total;
   * antes o dano lia o valor já gasto e saía 0).
   */
  async _executarAcao(item, idx) {
    // 0.94.22: Desfazer - foto antes da Ação (só na de fora; repetições entram na mesma).
    const fotoExterna = !this._fotoDesfazer;
    if (fotoExterna) { try { this._fotoDesfazer = { foto: naurenFotoCenaDesfazer(this.actor), desde: Date.now() }; } catch (err) { this._fotoDesfazer = { foto: null, desde: Date.now() }; } }
    try { return await this._executarAcaoComFoto(item, idx); }
    finally {
      if (fotoExterna) {
        const f = this._fotoDesfazer; this._fotoDesfazer = null;
        this._gravarDesfazer(f).catch(err => console.warn("Nauren RPG | Desfazer (gravar)", err));
      }
    }
  }
  /** Guarda no card da Ação o que ela mudou (para o botão Desfazer do Mestre). */
  async _gravarDesfazer(f) {
    if (!f?.foto) return;
    await new Promise(r => setTimeout(r, 400)); // as mudanças das outras telas chegam
    const msg = game.messages.contents.find(m => (m.timestamp ?? 0) >= f.desde - 50 && m.getFlag("nauren", "casterUuid") === this.actor.uuid && !m.getFlag("nauren", "desfazer"));
    if (!msg) return;
    const dif = await naurenDiferencaDesfazer(f.foto);
    if (!dif) return;
    if (msg.isOwner) await msg.update({ "flags.nauren.desfazer": dif });
    else await game.users.activeGM?.query(NAUREN_QUERY_ITEM_MESTRE, { tipo: "flagMensagem", dados: { mensagemId: msg.id, chave: "desfazer", valor: dif } }, { timeout: 15000 }).catch(() => null);
  }
  async _executarAcaoComFoto(item, idx) {
    const anterior = this.actor._naurenRecursosNoInicio, alvosAnteriores = this._nomesAlvosNoInicio;
    this.actor._naurenRecursosNoInicio = Object.fromEntries((this.actor.system.recursosCustom ?? []).map(r => [r.id, r.valor ?? 0]));
    this._nomesAlvosNoInicio = Array.from(game.user.targets ?? []).map(t => t?.name ?? t?.document?.name).filter(Boolean);
    this._repetirPendente = null;
    const execAnterior = this._execucaoIdAtual, gatAnteriores = this._gatilhosDanoPendentes;
    const execucaoId = foundry.utils.randomID();
    this._execucaoIdAtual = execucaoId; this._gatilhosDanoPendentes = [];
    const execucao = this._executarAcaoInterno(item, idx);
    this._acaoEmCurso = execucao;
    let retorno, gatilhosDano = [];
    try { retorno = await execucao; }
    finally {
      this.actor._naurenRecursosNoInicio = anterior; this._nomesAlvosNoInicio = alvosAnteriores; if (this._acaoEmCurso === execucao) this._acaoEmCurso = null;
      gatilhosDano = this._gatilhosDanoPendentes ?? []; this._execucaoIdAtual = execAnterior; this._gatilhosDanoPendentes = gatAnteriores;
    }
    // Bênção Solar: se o 1d6 passou, oferece conjurar a MESMA magia de novo contra o MESMO alvo, sem Estamina.
    if (gatilhosDano.length) await Promise.allSettled(gatilhosDano);
    const recon = naurenReconjurarPendente.get(this.actor.uuid);
    if (recon && recon.execucaoId === execucaoId && recon.itemUsadoUuid === item.uuid) {
      naurenReconjurarPendente.delete(this.actor.uuid);
      const alvoTk = recon.alvoTokenUuid ? fromUuidSync(recon.alvoTokenUuid)?.object : null;
      const acaoR = item.system.acoes?.[idx];
      const alvoUnico = alvoTk && !["area", "nenhum"].includes(acaoR?.modoAlvo);
      const simR = await foundry.applications.api.DialogV2.confirm({
        window: { title: `${recon.fonte} — ${item.name}` }, classes: ["nauren-dialogo"],
        content: `<p>Passou no 1d6: você pode conjurar <b>${item.name}</b> de novo${alvoUnico ? ` contra <b>${alvoTk.name}</b>` : " (mesma área ou alvo)"}, <b>sem gastar Estamina</b>. A Mana é gasta normalmente.</p>`,
        yes: { label: "Conjurar de novo" }, no: { label: "Não" }, rejectClose: false
      }).catch(() => false);
      const condR = this.actor.items.find(i => i.type === "condicao" && i.system.ativo !== false && recon.condicaoNome && i.name === recon.condicaoNome);
      if (simR) {
        if (alvoUnico) alvoTk.setTarget(true, { releaseOthers: true });
        await this._executarAcao(item, idx);
      } else if (condR) await condR.delete().catch(() => null);
    }
    // "Se o dano for máximo, repita a magia como parte da mesma ação" (Mísseis Arcanos): campo genérico
    // repetirSeDanoMaximo. A repetição não cobra nada, não pede página do Grimório e não abre a confirmação.
    // Anjo da Guarda (Milagre): o ser de luz conjura a mesma Palavra de Destino, de graça, contra outro alvo.
    if (item?.type === "magia" && item.system?.ehMagiaDeSacerdote && !this._acaoGratis && this._penitenciaDestaExecucao !== undefined) {
      const anjo = this.actor.items.find(i => i.type === "condicao" && i.system.ativo !== false && i.system.repeteMagiasDoPortador);
      const aceitou = this._penitenciaDestaExecucao === "aceitar";
      this._penitenciaDestaExecucao = undefined;
      if (anjo) {
        const simA = await foundry.applications.api.DialogV2.confirm({
          window: { title: `${anjo.name} — ${item.name}` }, classes: ["nauren-dialogo"],
          content: `<p>O ser de luz conjura <b>${item.name}</b> também, <b>sem custo</b>${aceitou ? ", com o bônus da penitência (sem você sofrer de novo)" : ""}.</p><p>Marque o alvo dele (pode ser outro) e confirme.</p>`,
          yes: { label: "Conjurar" }, no: { label: "Não" }, rejectClose: false
        }).catch(() => false);
        if (simA) {
          const antesA = this._acaoGratis;
          this._acaoGratis = { motivo: `${anjo.name}`, fonte: anjo.name, bonusPenitencia: aceitou, semPenitencia: !aceitou };
          try { await this._executarAcao(item, idx); } finally { this._acaoGratis = antesA; }
        }
      }
    }
    const rep = this._repetirPendente; this._repetirPendente = null;
    if (rep) {
      const sim = await foundry.applications.api.DialogV2.confirm({
        window: { title: `${rep.nome} — dano máximo!` }, classes: ["nauren-dialogo"],
        content: `<p>Todos os dados saíram no máximo: <b>${rep.nome}</b> se repete como parte da mesma Ação, <b>sem custo</b>.</p><p>Marque o alvo (pode ser outro) e confirme.</p>`,
        yes: { label: "Repetir" }, no: { label: "Não repetir" }, rejectClose: false
      }).catch(() => false);
      if (sim) {
        const antes = this._acaoGratis; this._acaoGratis = { motivo: `${rep.nome}: repetição pelo dano máximo` };
        try { await this._executarAcao(item, idx); } finally { this._acaoGratis = antes; }
      }
    }
    return retorno;
  }

  /** Motivo simples para recusar a Ação antes de abrir qualquer janela (sem usos / sem recurso próprio fixo). */
  _motivoParaNaoUsarAgora(item, acao) {
    // Invocação sem a ficha escolhida: avisa antes de cobrar (antes gastava Estamina/Mana/uso e não invocava nada).
    if (acao.usaInvocar && !acao.invocarCopiaDeMim && !acao.invocarAtorUuid)
      return `"${acao.nome || item.name}": falta a ficha a invocar. Abra a Habilidade, aba Ações, e arraste a ficha da criatura para o campo "Invocar ficha".`;
    if (acao.alvoSoAliadosMenosEu) {
      const meuTk = this.actor.getActiveTokens?.(true)?.[0];
      const alvosA = Array.from(game.user.targets ?? []);
      if (alvosA.some(t => t.actor === this.actor || t.actor?.id === this.actor.id))
        return `"${acao.nome || item.name}" só pode ser usada em aliados, não em você.`;
      const inimigo = meuTk && alvosA.find(t => t.document?.disposition !== meuTk.document?.disposition);
      if (inimigo) return `"${acao.nome || item.name}" só pode ser usada em aliados (${inimigo.name} não é aliado).`;
    }
    if (acao.exigeCondicaoEmMimNome && !this.actor.items.some(i => i.type === "condicao" && i.system.ativo !== false && i.name === acao.exigeCondicaoEmMimNome))
      return `"${acao.nome || item.name}" só pode ser usada com ${acao.exigeCondicaoEmMimNome}.`;
    // Domar Besta: recusa antes de cobrar (alvo de nível alto, já domado, limite de mascotes).
    if (acao.usaDomar) {
      const alvoD = Array.from(game.user.targets ?? [])[0]?.actor;
      if (alvoD) {
        if ((alvoD.system.nivel ?? 1) >= (this.actor.system.nivel ?? 1)) return `"${acao.nome || item.name}": ${alvoD.name} tem nível igual ou maior que o seu.`;
        if (alvoD.system.mascoteDeUuid) return `"${acao.nome || item.name}": ${alvoD.name} já é mascote de alguém.`;
      }
    }
    if (acao.usaBestaInicial && this.actor.getFlag("nauren", "bestaInicial"))
      return `"${acao.nome || item.name}": você já escolheu sua besta inicial.`;
    const emCombate = this._atorEstaEmCombateAtivo();
    const aplica = reset => !USOS_RESET_POR_COMBATE.has(reset) || emCombate;
    const nomeA = acao.nome || item.name;
    if (acao.soNoMeuTurno && emCombate && !naurenCombatenteEhDoAtor(game.combat?.combatant, this.actor) && game.combat?.combatant?.actor?.id !== this.actor.id)
      return `"${nomeA}" só pode ser usada no seu turno.`;
    // Armadilhas: uma armadilha que prendeu alguém continua ativa e conta no limite.
    if (acao.usaTemplatePersistente && acao.templatePersistenteRemoverAoAtivar && acao.templatePersistenteLimiteSimultaneas) {
      const limiteA = Math.max(1, Math.round(naurenInterpretarModificador(acao.templatePersistenteLimiteSimultaneas, this.actor, item)?.valor ?? 1));
      const presosA = naurenPresosPorArmadilha(item.uuid);
      if (presosA.length >= limiteA) return `"${nomeA}": ${presosA.join(", ")} ${presosA.length > 1 ? "ainda estão Presos" : "ainda está Preso"} na sua armadilha (limite de ${limiteA} ativa${limiteA > 1 ? "s" : ""}). Só dá para montar outra quando se soltar${presosA.length > 1 ? "em" : ""}.`;
    }
    if (acao.recarregaUsos && !acao.recarregaItemNome) {
      const r = naurenAlvoDaRecarga(item, acao);
      if (!r) return `"${nomeA}": não há usos para recarregar neste item.`;
      if (r.atual >= r.max) return `"${nomeA}": ${r.nome} já está com todos os usos (${r.atual}/${r.max}).`;
      if (acao.recarregaSoSeVazio && emCombate && r.atual > 0) return `"${nomeA}": só dá para recarregar sem usos (${r.nome} ainda tem ${r.atual}).`;
    }
    if (acao.bebeFrasco && item.type === "armadura" && !item.system.equipado) return `"${nomeA}": equipe ${item.name} antes.`;
    // 0.94.3: só dentro de uma Prioridade (em combate).
    if (acao.soEmPrioridade && emCombate && !naurenAgindoForaDoTurno(this.actor)) return `"${nomeA}" só pode ser usada durante uma Prioridade.`;
    // 0.94.3: gasta 1 uso de um item de projeto (ex.: Inspiração Genial gasta 1 uso da Arma de Inventor).
    if (acao.gastaUsoDeProjeto) {
      const projs = naurenItensDoProjetoPorNome(this.actor, acao.gastaUsoDeProjeto).filter(i => i.system.usaUsos);
      if (!projs.length) return `"${nomeA}": você não tem ${acao.gastaUsoDeProjeto}.`;
      if (!projs.some(i => (i.system.usosAtual ?? 0) > 0)) return `"${nomeA}" gasta 1 uso de ${projs[0].name}, que está sem usos. Recarregue antes.`;
    }
    // 0.94.3: efeitos "uma vez por personagem" no alvo (Cirurgia Sinistra): recusa antes de pagar.
    const chaveUmaVez = (acao.efeitosNoAlvo ?? []).find(e => e?.umaVezChave)?.umaVezChave;
    if (chaveUmaVez) {
      const ja = Array.from(game.user.targets ?? []).find(t => t.actor && naurenUmaVezRecusa(t.actor, chaveUmaVez));
      if (ja) return `"${nomeA}": ${ja.actor.name} já recebeu isto (uma vez por personagem).`;
    }
    if ((acao.custoUsosItem ?? 0) > 0 && item.system.usaUsos && (item.system.usosAtual ?? 0) < acao.custoUsosItem)
      return `"${nomeA}" gasta ${acao.custoUsosItem} uso(s) de ${item.name}, que tem ${item.system.usosAtual ?? 0}. Recarregue antes.`;
    if (acao.usaUsos && !acao.usosDeOutroItemNome && !acao.usosMaxBonusCondicaoUuid) {
      const doItem = item.system.usaUsos === true && !acao.usosProprios;
      const atual = doItem ? item.system.usosAtual : acao.usosAtual;
      const reset = doItem ? item.system.usosReset : acao.usosReset;
      if (aplica(reset) && (atual ?? 0) <= 0) return `"${nomeA}" não tem usos restantes! (Recarrega ${USOS_RESET_LABEL[reset] ?? reset})`;
    }
    if (item.system.usaUsosPassiva && !acao.usaUsos && item.system.usaUsos !== true && aplica(item.system.usosPassivaReset) && (item.system.usosPassivaAtual ?? 0) <= 0)
      return `"${item.name}" não tem usos restantes! (Recarrega ${USOS_RESET_LABEL[item.system.usosPassivaReset] ?? item.system.usosPassivaReset})`;
    for (const c of acao.custosRecursoProprio ?? []) {
      if (!c.ativo || !String(c.recurso ?? "").startsWith("recursoCustom:") || c.condicaoParaAtivar || (c.quantidadePorRank ?? []).length) continue;
      const q = Number(c.quantidade);
      if (!Number.isFinite(q) || q <= 0) continue;
      const r = (this.actor.system.recursosCustom ?? []).find(x => x.id === c.recurso.slice(14));
      if (r && (r.valor ?? 0) < q) return `"${nomeA}" precisa de ${q} de ${r.nome}, que você não tem.`;
    }
    // Estamina/Mana não entram aqui: reduções (reduzCustoEstamina, ajusteCustoMana), pagar com outra coisa
    // (Espírito da Batalha, cargas de área, 2º ataque com duas armas) só se resolvem depois. A janela de
    // confirmação mostra "⚠ você tem N" quando o custo base passa do que há.
    return null;
  }

  async _executarAcaoInterno(item, idx) {
    let acao = item.system.acoes[idx];
    if (!acao) return;
    // Bancada de Invenção (0.94): esta Ação só abre a janela de construção, sem custo nem card.
    if (acao.abrirConstrucao) return naurenAbrirConstrucaoPorAcao(this.actor, item, acao.abrirConstrucao, acao.abrirConstrucaoFonte);
    // 0.94.3: usos do item ANTES desta Ação (Tudo ou Nada: "o último uso").
    this._naurenUsosItemAntes = item.system.usaUsos ? (item.system.usosAtual ?? 0) : null;
    // 0.94.3: Frasco especial com Peculiaridade à escolha (Remédio Não Testado) - escolhe antes de pagar.
    this._naurenCriaFrascoEscolha = null;
    if (acao.criaFrasco?.escolherPeculiaridade) {
      const escP = await naurenEscolherPeculiaridade(acao.criaFrasco.nome || acao.nome || item.name);
      if (!escP) return;
      this._naurenCriaFrascoEscolha = escP;
    }
    // 0.94.1: Frasco Explosivo e afins escolhem um Frasco da mochila antes de tudo (cancelar não gasta nada).
    this._naurenFrascoAtual = null;
    if (acao.usaFrascoDoInventario) {
      const frascoEsc = await naurenEscolherFrasco(this.actor, acao.nome || item.name);
      if (!frascoEsc) return;
      this._naurenFrascoAtual = frascoEsc;
    }
    this.#efeitosEmAtaquesAtual = []; // linhas de efeito do card: só desta Ação
    this.#danoVerdadeiroExtrasAtual = []; // Golpe Penetrante etc.: juntadas mais abaixo, usadas na rolagem de dano
    this.#beneficiosAtual = [];
    this.#poderosaAtual = null;
    this._danoDadosTodosMax = null;
    this.#bonusPorAlvoAtual = [];
    // Efeito de outro item (Punição Celestial, Banhar-se em Graças): roda a Ação dele, de graça.
    if (acao.executarItemSeedId || acao.executarItemNome) {
      const outro = this.actor.items.find(i => acao.executarItemSeedId && i.getFlag("nauren", "seedId") === acao.executarItemSeedId)
        ?? this.actor.items.find(i => acao.executarItemNome && i.name === acao.executarItemNome);
      if (!outro) { ui.notifications.warn(`"${acao.nome || item.name}": você não tem ${acao.executarItemNome || "o item necessário"}.`); return; }
      if (acao.executarEmMim) {
        const meuTok = this.actor.getActiveTokens?.(true)?.[0];
        for (const t of Array.from(game.user.targets ?? [])) t.setTarget(false, { releaseOthers: false });
        meuTok?.setTarget?.(true, { releaseOthers: true });
      }
      const antes = this._acaoGratis;
      this._acaoGratis = { motivo: `${item.name}${acao.executarComBonusPenitencia ? " (bônus de penitência, sem sofrer)" : ""}`,
        bonusPenitencia: !!acao.executarComBonusPenitencia, acertoAutomatico: !!acao.executarAcertoAutomatico, fonte: item.name };
      try { await this._executarAcao(outro, 0); } finally { this._acaoGratis = antes; }
      return;
    }
    if (this._acaoGratis?.acertoAutomatico && acao.ehAtaque) acao = { ...acao, ehAtaque: false, _acertoAutomatico: this._acaoGratis.fonte };
    if (this._acaoGratis?.motivo) this.#beneficiosAtual.push({ label: "Sem custo", value: this._acaoGratis.motivo });
    if (JSON.stringify(acao).includes('"self:')) acao = naurenResolverSelfEmObjeto(acao, this.actor);
    // Estamina extra da Categoria (ver campoAcao > custoEstaminaPorCategoria): entra no custo
    // logo no início, para popup, Espírito da Batalha e card verem o custo real.
    if (acao.custoEstaminaPorCategoria) {
      const extraCat = this.actor.system.escalaMonstro?.estCat ?? 0;
      if (extraCat > 0) acao = { ...acao, custoEstamina: (acao.custoEstamina || 0) + extraCat, _custoCategoriaExtra: extraCat };
    }
    // Investida Relâmpago (Guerreiro): a Investida muda conforme a Guarda ativa.
    if (naurenEhItem(item, "Investida") && acao.ehAtaque && this.actor.items.some(i => i.type === "habilidade" && i.system.ativo !== false && naurenEhItem(i, "Investida Relâmpago"))) {
      if (naurenTemEstado(this.actor, "Guarda Ofensiva")) {
        acao = { ...acao, naoGeraPrioridade: true, _semPrioridadeFonte: "Investida Relâmpago, Guarda Ofensiva" };
      }
      if (naurenTemEstado(this.actor, "Guarda Defensiva") && !acao.usaEmpurrar) {
        acao = { ...acao, usaEmpurrar: true, empurrarMetros: "2", empurrarDirecao: "afastar" };
        this.#beneficiosAtual.push({ label: "Investida Relâmpago", value: "Guarda Defensiva: o acerto empurra o alvo 2m" });
      }
    }
    // Chamar as Armas (Guerreiro): ao Dar Prioridade, 1 Espírito da Batalha para mais um aliado receber.
    if (naurenEhItem(item, "Dar Prioridade") && acao.usaDarPrioridade && this.actor.items.some(i => i.type === "habilidade" && i.system.ativo !== false && naurenEhItem(i, "Chamar as Armas"))) {
      const esp = (this.actor.system.recursosCustom ?? []).find(r => r.id === "espiritodabatalha");
      if ((esp?.valor ?? 0) >= 1) {
        const sim = await foundry.applications.api.DialogV2.confirm({ window: { title: "Chamar as Armas" },
          content: `<p>Gastar <b>1 Espírito da Batalha</b> (você tem ${esp.valor}) para que <b>mais um aliado</b> também receba Prioridade? Marque os dois aliados.</p>`, rejectClose: false }).catch(() => false);
        if (sim) {
          await naurenGastarRecursoSimples(this.actor, "recursoCustom:espiritodabatalha", 1);
          if (esp.valor - 1 <= 0) { await this.actor.update({ "system.stress.value": Math.min(this.actor.system.stress?.max ?? 2, (this.actor.system.stress?.value ?? 0) + 1) }); naurenNotificarGanhoPerda(this.actor, { quantidade: 1, rotulo: "Estresse", origemNome: "Espírito da Batalha esgotado" }); }
          acao = { ...acao, numeroAlvos: Math.max(2, (acao.numeroAlvos || 1) + 1) };
          this.#beneficiosAtual.push({ label: "Chamar as Armas", value: "+1 aliado recebe Prioridade", breakdown: `−1 Espírito da Batalha (resta ${esp.valor - 1})` });
        }
      }
    }
    // Toxina Laminar (Caçador): no início do combate (1ª rodada), aplicar veneno sai sem Estamina, 1x por combate.
    if (acao.aplicarVeneno && game.combat?.started && (game.combat.round ?? 1) <= 1
      && this.actor.getFlag("nauren", "toxinaLaminarCombate") !== game.combat.id
      && this.actor.items.some(i => i.type === "habilidade" && i.system.ativo !== false && naurenEhItem(i, "Toxina Laminar"))) {
      acao = { ...acao, custoEstamina: 0 };
      await this.actor.setFlag("nauren", "toxinaLaminarCombate", game.combat.id);
      this.#beneficiosAtual.push({ label: "Toxina Laminar", value: "sem custo de Estamina", breakdown: "início do combate, 1x por combate" });
    }
    // Forma Sábio dos Matos: depois de usar Crescimento numa cura, o próximo Comungar restaura Estamina.
    if (naurenEhItem(item, "Comungar")) {
      const pendente = this.actor.items.find(i => i.type === "condicao" && i.system.ativo !== false && (naurenEhItem(i, "Comunhão do Sábio (Pendente)") || /^Comunhão do Sábio/.test(i.name)));
      if (pendente) {
        const base = acao.curas?.[0]?.formula || String(acao.gastosRecurso?.[0]?.quantidade ?? "-1d6").replace(/^\s*-/, "") || "1d6";
        acao = { ...acao, curas: [], gastosRecurso: [{ recurso: "estamina", quantidade: `-${base}`, ativo: true, soSeAcertar: false }] };
        await pendente.delete().catch(() => {});
        this.#beneficiosAtual.push({ label: "Comunhão do Sábio", value: `restaura Estamina (${base}) em vez de ${acao.nome?.includes("Mana") ? "Mana" : "Vida"}`, breakdown: "Crescimento numa cura na Forma Sábio dos Matos" });
      }
    }
    // Manutenção do Prisma: escolher outro aliado tira o +1 de Destino do anterior.
    if (naurenEhItem(item, "Manutenção do Prisma") && (acao.condicoesAplicadas ?? []).length) {
      const novos = new Set(Array.from(game.user.targets ?? []).map(t => t.actor?.uuid));
      const atoresP = new Set(game.actors); for (const t of canvas?.tokens?.placeables ?? []) if (t.actor) atoresP.add(t.actor);
      for (const a of atoresP) {
        if (novos.has(a.uuid)) continue;
        // A Condição que esta Ação aplica (pela origem); o nome fica só de reserva para cópias antigas.
        const origensP = new Set((acao.condicoesAplicadas ?? []).map(cA => String(cA.uuid ?? "")).filter(u => u && !u.startsWith("self:")));
        const daAcao = i => origensP.has(i.getFlag("nauren", "cadeiaRaizUuid")) || origensP.has(i.getFlag("nauren", "origemUuid")) || origensP.has(i.getFlag("core", "sourceId"));
        for (const c of a.items.filter(i => i.type === "condicao" && (daAcao(i) || /^Manutenção do Prisma/.test(i.name)))) {
          let dono = null; try { const d = fromUuidSync(c.system.conjuradorUuid); dono = d?.actor ?? d; } catch (err) { dono = null; }
          if (dono && dono.uuid !== this.actor.uuid) continue;
          if (c.isOwner) await c.delete().catch(() => {});
          else await game.users.activeGM?.query(NAUREN_QUERY_ITEM_MESTRE, { tipo: "apagarItem", itemUuid: c.uuid }, { timeout: 15000 }).catch(() => null);
          this.#beneficiosAtual.push({ label: "Manutenção do Prisma", value: `${a.name} deixa de receber o +1 de Destino` });
        }
      }
    }
    // Condições que acabam ao conjurar outra Magia (ex.: Invisível): saem antes desta conjuração.
    if (item.type === "magia") {
      const sair = this.actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && i.system.removerAoConjurarMagia);
      for (const c of sair) {
        await c.delete().catch(() => {});
        this.#beneficiosAtual.push({ label: c.name, value: "terminou", breakdown: `você conjurou ${item.name}` });
      }
    }
    if (acao.consomePerjurio) {
      const grupoP = NaurenGrupoHelper.gruposAtivos().find(g => (g.system.perjurio?.value ?? 0) > 0);
      if (!grupoP) { ui.notifications.warn(`"${acao.nome || item.name}" só pode ser usada gastando 1 Perjúrio do Acaso, e o Grupo não tem nenhum guardado.`); return; }
      await NaurenGrupoHelper.ajustar(grupoP, "perjurio", -1);
      this.#efeitosEmAtaquesAtual.push({ label: "Perjúrio do Acaso", value: "gastou 1", breakdown: `restam ${Math.max(0, (grupoP.system.perjurio?.value ?? 1) - 1)} no Grupo` });
    }
    if (item.type === "consumivel" && (item.system.quantidade ?? 0) <= 0) { ui.notifications.warn(`Você não possui mais ${item.name}!`); return; }
    // Munição: a arma escolhe a munição selecionada (ou a 1ª compatível); sem munição, não ataca.
    if (item.type === "arma" && item.system.usaMunicao && acao.ehAtaque) {
      const compat = naurenMunicoesCompativeis(this.actor, item);
      const mun = compat.find(m => m.id === item.system.municaoSelecionadaId) ?? compat[0];
      if (!mun) { ui.notifications.warn(`${item.name}: sem munição (${item.system.tipoMunicao || "compatível"}) no inventário.`); return; }
      const envenenada = !!mun.system.municaoVenenoUuid && (mun.system.municaoVenenoTodas || (mun.system.municaoVenenoQuantidade ?? 0) > 0);
      acao = { ...acao, _municao: { id: mun.id, nome: mun.name, envenenada, venenoUuid: mun.system.municaoVenenoUuid, danoExtra: mun.system.municaoDanoExtra || "" } };
      if (mun.system.municaoDanoExtra) acao.danos = (acao.danos ?? []).map((b, bi) => bi === 0 ? { ...b, formula: `${b.formula}+${mun.system.municaoDanoExtra}` } : b);
    }
    // Marca do Caçador: escolhe o benefício antes; a marca já nasce com ele gravado.
    if (acao.escolherBeneficioMarca) {
      const rkM = Math.max(1, this._rankEfetivo(item) || 1);
      const extraRk = rkM > 1 ? ` (3m + ${rkM - 1} do rank ${rkM})` : "";
      const escB = await foundry.applications.api.DialogV2.wait({ window: { title: `${item.name} (rank ${rkM})` }, content: "<p>Qual benefício contra este alvo?</p>",
        buttons: [{ action: "focoMortal", label: `Foco Mortal: +${2 + rkM}m à distância${extraRk}` }, { action: "tiroLetal", label: `Tiro Letal: +${rkM} de dano` }, { action: "reflexos", label: `Reflexos de Caça: +${rkM} Bloqueio/Esquiva` }],
        rejectClose: false }).catch(() => null);
      if (!escB) return; // fechou a janela: cancela a Ação sem gastar nada
      acao = { ...acao, _beneficioMarca: escB };
    }
    // Modificadores Externos de Subclasse (ver
    // _coletarModificadoresExternos/_aplicarModificadoresExternos) -
    // resetado no início de toda nova Ação, mesmo padrão de
    // "#atacouNesteTurnoAtual" etc., pra nunca vazar pra uma rolagem não
    // relacionada.
    this.#modificadoresExternosAplicadosAtual = [];
    this.#tokensContextoUsadosAtual = [];
    // (as linhas de efeito do card são zeradas no início de _executarAcao)
    // Fase 5: fora do próprio turno = em Prioridade (livro). Consome a mais
    // antiga registrada para este personagem, se houver.
    this.#emPrioridadeAtual = null;
    this.#reacaoPreAtaqueAtual = null;
    this.#mensagemAguardando = null;
    this.#ajustesAtaqueAtual = [];
    this.#proximaAcaoAtual = null;
    this.#movimentosAtual = [];
    // 0.94.3 (G7): quem só age em Prioridade (Obra Prima: Obediência Cega) não tem turno e precisa de uma.
    const soAgePrioridade = !!this.actor.system?.soAgeEmPrioridade && !!game.combat?.started;
    if ((naurenAgindoForaDoTurno(this.actor) || soAgePrioridade) && !this.actor._naurenContextoGatilho) {
      const consumida = await naurenOperarRegistroPrioridade("consumir", { paraUuid: this.actor.uuid, paraBando: naurenBandoChave(this.actor) ?? "", acaoNome: acao?.nome ?? item.name });
      if (soAgePrioridade && !consumida) {
        ui.notifications.warn(`${this.actor.name} só age quando recebe uma Prioridade (não tem turno na iniciativa).`);
        return;
      }
      this.#emPrioridadeAtual = consumida ?? { deNome: "", motivo: "" };
      if (consumida) await this._naurenAcoesExtrasNaPrioridade(consumida, item, acao).catch(err => console.warn("Nauren RPG | ações extras na Prioridade", err));
    } else {
      // No próprio turno, uma Prioridade ROUBADA neste turno (ex.: atacou,
      // o alvo ganhou Prioridade, o Ladino a tomou) é usada pela próxima Ação.
      const roubada = await naurenOperarRegistroPrioridade("consumir", { paraUuid: this.actor.uuid, acaoNome: acao?.nome ?? item.name, somenteRoubadaNoTurno: true });
      if (roubada) this.#emPrioridadeAtual = roubada;
    }
    // Linhas-resumo da Penitência (ver bloco "usaPenitencia" mais
    // abaixo) - populadas ANTES de "mainBreakdown"/"secondaryLines"
    // existirem (o popup roda antes de tudo, igual Condensar Magia),
    // então guardadas aqui e injetadas no card final mais tarde.
    const penitenciaLinhasResumo = [];

    // Teste de Falha Escalonado (ver campoAcao > usaTesteDeFalhaEscalonado,
    // ex: Provação do Entrelaço, Sacerdote) - clicado direto (fora do
    // contexto de conjurar uma Magia específica), só rola o teste e
    // publica o card - não é um ataque/dano/cura normal, então
    // encerra aqui, sem passar por nenhum outro processamento desta
    // função (custos, condições, alvos etc).
    if (acao.usaTesteDeFalhaEscalonado && acao.testeFalhaSoMostrar) {
      const faces = Number((String(acao.testeFalhaDado || "1d6").match(/d(\d+)/i) || [])[1]) || 6;
      const idC = acao.testeFalhaContadorRecurso?.startsWith("recursoCustom:") ? acao.testeFalhaContadorRecurso.slice(14) : null;
      const v = idC ? ((this.actor.system.recursosCustom ?? []).find(r => r.id === idC)?.valor ?? 0) : 0;
      const lim = Math.min(v + 1, faces);
      await this._postRollCard({
        title: `${item.name}${acao.nome && acao.nome !== "Ação" ? ` — ${acao.nome}` : ""}`, icon: item.img,
        secondaryLines: [
          { label: "Evitar a penitência agora", value: `falha em ${lim === 1 ? "1" : `1-${lim}`} no ${acao.testeFalhaDado || "1d6"}` },
          { label: "Conjurações seguidas sem penitência", value: String(v) }
        ]
      });
      return;
    }
    if (acao.usaTesteDeFalhaEscalonado) {
      // "Antes do efeito" (ex.: Pigmento Falso): sem recursos para pagar, nem rola.
      if (acao.testeFalhaAntesDoEfeito) {
        const faltaEst = (acao.custoEstamina ?? 0) > (this.actor.system.estaminaCombate?.value ?? 0);
        const faltaMana = (acao.custoMana ?? 0) > (this.actor.system.mana?.value ?? 0);
        if (faltaEst || faltaMana) { ui.notifications.warn(`Sem ${faltaEst ? "Estamina" : "Mana"} suficiente para "${acao.nome || item.name}".`); return; }
      }
      const teste = await this._rolarTesteFalhaEscalonado(
        acao.testeFalhaDado, acao.testeFalhaContadorRecurso, acao.testeFalhaIncrementaAoUsar,
        acao.testeFalhaTextoFalha, `${item.name}${acao.nome && acao.nome !== "Ação" ? ` — ${acao.nome}` : ""}`
      );
      // Sem a opção: teste isolado, como sempre (ex.: Testar Provação do Entrelaço).
      if (!acao.testeFalhaAntesDoEfeito) return;
      if (teste?.falhou) {
        // Falhou: o custo é pago e o consumível gasto, mas sem efeito.
        const upd = {};
        if (acao.custoEstamina) upd["system.estaminaCombate.value"] = Math.max(0, (this.actor.system.estaminaCombate?.value ?? 0) - acao.custoEstamina);
        if (acao.custoMana) upd["system.mana.value"] = Math.max(0, (this.actor.system.mana?.value ?? 0) - acao.custoMana);
        if (Object.keys(upd).length) await this.actor.update(upd);
        if (item.type === "consumivel" && this.actor.items.get(item.id)) {
          await item.update({ "system.quantidade": Math.max(0, (item.system.quantidade ?? 0) - 1) });
          naurenRegistrarUsoTorre(this.actor, item, 1, "consumivel");
        }
        return;
      }
      // Passou: segue a Ação normalmente (custos, escolha, alvos, efeitos).
    }

    // Grimório do Mago (ver "ehMagiaDeMago"/"paginaAberta" em
    // NaurenMagiaData) - avisa ANTES de qualquer outra coisa (mesmo
    // motivo de "usaArmaEscolhida" abaixo: cancelar precisa abortar
    // tudo sem gastar nada) se esta Magia de Mago não estiver marcada
    // como "na página aberta" agora. Puramente informativo - o
    // jogador pode confirmar e conjurar mesmo assim.
    if (item.type === "magia" && item.system.ehMagiaDeMago && !this._acaoGratis && !item.system.paginaAberta && !(this.actor.getFlag("nauren", "aspectus") ?? []).includes(item.id)) {
      const confirmou = await foundry.applications.api.DialogV2.confirm({
        window: { title: "Grimório fora da página" },
        content: `<p>O Grimório não está na página de <b>${item.name}</b> agora (ela não está marcada como "Página Aberta"). Conjurar mesmo assim?</p>`,
        rejectClose: false
      }).catch(() => false);
      if (!confirmou) return;
    }

    // Perguntar Prioridade (ver campoAcao > usaPerguntarPrioridade, ex:
    // Retardo Temporal - "conjurada na Prioridade causa 2 acúmulos
    // adicionais") - popup simples de sim/não, some acumulosExtraSePrioridade
    // em TODAS as Condições Aplicadas configuradas, numa CÓPIA de "acao".
    // Resolvido ANTES de Condensar Magia, já que "dobrar todos os
    // acúmulos" (Conjuração Poderosa) precisa incluir esse extra também.
    if (acao.usaPerguntarPrioridade && (acao.condicoesAplicadas ?? []).length) {
      // O sistema já sabe se a Ação está sendo feita numa Prioridade (fora do próprio turno ou
      // numa Prioridade roubada): antes perguntava "foi conjurada durante uma Prioridade?".
      const foiNaPrioridade = !!this.#emPrioridadeAtual;
      if (foiNaPrioridade && acao.acumulosExtraSePrioridade) {
        this.#efeitosEmAtaquesAtual.push({ label: "Em Prioridade", value: `+${acao.acumulosExtraSePrioridade} acúmulo(s)`, breakdown: `${item.name} conjurada numa Prioridade` });
        acao = { ...acao, condicoesAplicadas: (acao.condicoesAplicadas ?? []).map(c => c.ativo ? { ...c, acumulos: (Number(c.acumulos) || 0) + acao.acumulosExtraSePrioridade } : c) };
      }
    }

    // Conjuração Poderosa (Mago, versão do Felipe - 0.91): a Ação "Conjuração Poderosa"
    // escolhe UM efeito e o guarda numa Condição; a PRÓXIMA magia conjurada aplica
    // todos os efeitos guardados (podem repetir) e a Condição sai. Nada de "duas magias
    // fundidas" nem custo ×2. Os bônus próprios de cada magia "em Conjuração Poderosa"
    // (dano máximo, dobrar dados/acúmulos, alcance da arma...) valem com 1+ efeito armado.
    this.#poderosaAtual = null;
    this.#poderosaEscolhaAtual = null;
    if (acao.usaConjuracaoPoderosa) {
      const escolhaP = await naurenEscolherEfeitoPoderosa(this.actor);
      if (!escolhaP) return;
      this.#poderosaEscolhaAtual = escolhaP;
      // Páginas em Chamas: a 1ª Conjuração Poderosa do combate não custa PdE.
      if (game.combat?.started && this.actor.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Páginas em Chamas") && i.system.ativo !== false)
          && this.actor.getFlag("nauren", "paginasEmChamas") !== game.combat.id) {
        // A marca de "já usou" só é gravada depois de pagar (ao armar): cancelar não gasta o uso grátis.
        acao = { ...acao, custoEstamina: 0, _paginasEmChamasGratis: true };
        this.#efeitosEmAtaquesAtual.push({ label: "Páginas em Chamas", value: "sem custo de PdE", breakdown: "1ª Conjuração Poderosa do combate" });
      }
    }
    let condPoderosaIdLocal = null; // cópia local: uma Ação aninhada (gatilho) não apaga a referência
    const condPoderosa = item.type === "magia" ? this.actor.items.find(i => i.type === "condicao" && Array.isArray(i.getFlag("nauren", "poderosaEfeitos")) && i.getFlag("nauren", "poderosaEfeitos").length) : null;
    if (condPoderosa) {
      // Se alguém tirou acúmulos da Condição à mão, valem só os primeiros N efeitos.
      const efeitosP = condPoderosa.getFlag("nauren", "poderosaEfeitos").slice(0, Math.max(1, condPoderosa.system.acumulos ?? 1));
      const qtd = id => efeitosP.filter(e => e === id).length;
      const linhasP = [];
      acao = { ...acao, _conjuracaoPoderosa: true };
      this.#poderosaAtual = { condId: condPoderosa.id, efeitos: efeitosP, acertoExtra: 0 };
      condPoderosaIdLocal = condPoderosa.id;
      // 1) +1 dado de dano por efeito (do mesmo tipo do maior dado da magia).
      if (qtd("dado")) {
        const temDado = (acao.danos ?? []).some(b => /\d*d\d+/i.test(String(b.formula ?? ""))) || /\d*d\d+/i.test(String(acao.armaConjuradaFormula ?? ""));
        if (temDado) {
          // Aplicado mais abaixo, DEPOIS das camadas de Subclasse e de qualquer
          // habilidade que mude o dado da magia: o dado extra sai do tipo final.
          acao = { ...acao, _poderosaDados: qtd("dado"), _poderosaNBlocos: (acao.danos ?? []).length };
          linhasP.push(`+${qtd("dado")} dado(s) de dano (do tipo final da magia)`);
        } else linhasP.push("dados: a magia não tem dado de dano");
      }
      // 2) +1 no recurso para resistir, por efeito.
      if (qtd("recurso")) {
        const n = qtd("recurso");
        const somar = v => { const t = String(v ?? "").trim(); const num = Number(t); return t === "" ? t : Number.isFinite(num) ? String(num + n) : `(${t})+${n}`; };
        const temResistCond = (acao.condicoesAplicadas ?? []).some(c => c.ativo && c.perguntarParaEvitar);
        const temResistArea = String(acao.templatePersistenteResistirEstamina ?? "").trim() !== "";
        const temResistNova = false; // (condições novas de Subclasse recebem o +N mais abaixo, depois das camadas)
        if (temResistCond) {
          acao = { ...acao, condicoesAplicadas: (acao.condicoesAplicadas ?? []).map(c => (c.ativo && c.perguntarParaEvitar) ? {
            ...c, custoParaEvitarQuantidade: somar(c.custoParaEvitarQuantidade || "1"),
            // a tabela "por rank" tem prioridade sobre o valor simples: soma nela também
            custoParaEvitarQuantidadePorRank: (c.custoParaEvitarQuantidadePorRank ?? []).map(r => ({ ...r, quantidade: r.quantidade === "" ? r.quantidade : somar(r.quantidade) })),
            ...(c.custoParaEvitarRecursoAlternativo ? { custoParaEvitarQuantidadeAlternativo: somar(c.custoParaEvitarQuantidadeAlternativo || "1") } : {})
          } : c) };
        }
        if (temResistArea) acao = { ...acao, templatePersistenteResistirEstamina: somar(acao.templatePersistenteResistirEstamina) };
        acao = { ...acao, _poderosaRecurso: n, _poderosaNCond: (acao.condicoesAplicadas ?? []).length };
        if (temResistCond || temResistArea || temResistNova) linhasP.push(`+${n} para resistir`);
        else linhasP.push("resistir: a magia não pede recurso para resistir");
      }
      // 3) +3 m de alcance por efeito.
      if (qtd("alcance")) {
        // Só alcance em metros ("12m"); "pessoal (raio 8m)" não é alcance.
        const m = /^\s*\d/.test(String(acao.alcance ?? "")) ? String(acao.alcance).match(/\d+([.,]\d+)?/) : null;
        if (m) {
          const atual = parseFloat(m[0].replace(",", "."));
          acao = { ...acao, alcance: String(acao.alcance).replace(/\d+([.,]\d+)?/, String(atual + 3 * qtd("alcance"))) };
          linhasP.push(`alcance +${3 * qtd("alcance")}m`);
        } else linhasP.push("alcance: a magia não tem alcance em metros");
      }
      // 4) +2 m de raio por efeito (só área de raio).
      if (qtd("raio")) {
        if (acao.usaTemplate && (acao.templateTipo || "circle") === "circle") {
          acao = { ...acao, templateTamanho: (parseFloat(acao.templateTamanho) || 0) + 2 * qtd("raio") };
          linhasP.push(`raio +${2 * qtd("raio")}m`);
        } else linhasP.push("raio: a magia não tem área de raio");
      }
      // 5) Facilidade no ataque; repetido, +2 no teste por repetição.
      if (qtd("facilidade")) {
        if (acao.ehAtaque) {
          acao = { ...acao, condensarFacilidade: true };
          this.#poderosaAtual.acertoExtra = 2 * (qtd("facilidade") - 1);
          linhasP.push(`Facilidade no ataque${qtd("facilidade") > 1 ? ` +${2 * (qtd("facilidade") - 1)}` : ""}`);
        } else linhasP.push("Facilidade: a magia não tem teste de ataque");
      }
      // Bônus próprios desta magia "em Conjuração Poderosa" (texto da magia).
      if (acao.condensarDobraAcumulos) {
        acao = { ...acao, condicoesAplicadas: (acao.condicoesAplicadas ?? []).map(c => c.ativo ? { ...c, acumulos: (Number(c.acumulos) || 0) * 2 } : c) };
        linhasP.push("acúmulos dobrados (desta magia)");
      }
      if (acao.condensarDobraDanoDado) {
        acao = { ...acao, danos: (acao.danos ?? []).map(bloco => ({ ...bloco, formula: this._dobrarQuantidadeDeDados(bloco.formula) })) };
        if (acao.usaConjurarArma && acao.armaConjuradaFormula) acao = { ...acao, armaConjuradaFormula: this._dobrarQuantidadeDeDados(acao.armaConjuradaFormula) };
        linhasP.push("dados dobrados (desta magia)");
      }
      if (acao.condensarAlcanceExtraMetros) {
        if (acao.usaConjurarArma && acao.armaConjuradaAlcance) {
          const mA = String(acao.armaConjuradaAlcance).match(/\d+([.,]\d+)?/);
          const nA = mA ? parseFloat(mA[0].replace(",", ".")) : 0;
          acao = { ...acao, armaConjuradaAlcance: String(acao.armaConjuradaAlcance).replace(/\d+([.,]\d+)?/, String(nA + acao.condensarAlcanceExtraMetros)) };
        } else {
          const mB = String(acao.alcance).match(/\d+([.,]\d+)?/);
          const nB = mB ? parseFloat(mB[0].replace(",", ".")) : 0;
          acao = { ...acao, alcance: String(acao.alcance).replace(/\d+([.,]\d+)?/, String(nB + acao.condensarAlcanceExtraMetros)) };
        }
        linhasP.push(`+${acao.condensarAlcanceExtraMetros}m (desta magia)`);
      }
      if (acao.condensarSustentarSemCusto) acao = { ...acao, condensarSustentarSemCustoAtivo: true };
      if (acao.danoMaximoEmPoderosa) linhasP.push("dano máximo (desta magia)");
      const modsPoderosa = (acao.condensarModificadores ?? []).filter(m => m.campo && m.valor !== "");
      if (modsPoderosa.length) {
        const mods = modsPoderosa.map(m => ({
          campoRelativo: m.campo, modo: m.modo || "somar", valor: m.valor,
          fase: NAUREN_FASE_MODIFICADOR[m.modo || "somar"] ?? 3, prioridade: 0,
          origemNome: "Conjuração Poderosa", origemRank: 0
        })).sort((x, y) => x.fase - y.fase);
        const { acao: ajustada, aplicados } = this._aplicarModificadoresExternos(acao, mods);
        acao = ajustada;
        this.#modificadoresExternosAplicadosAtual = [...this.#modificadoresExternosAplicadosAtual, ...aplicados];
      }
      this.#efeitosEmAtaquesAtual.push({ label: "Conjuração Poderosa", value: linhasP.join(" • ") || "—", breakdown: `${efeitosP.length} efeito(s) armado(s): ${efeitosP.map(e => NAUREN_PODEROSA_EFEITOS[e]?.nome ?? e).join(", ")} • a Condição sai depois desta magia` });
    }

    // Penitência (Sacerdote - ver "ehMagiaDeSacerdote"/campoAcao >
    // usaPenitencia) - resolvido no MESMO ponto que Condensar Magia
    // acima (mesmo motivo: cancelar precisa abortar tudo sem gastar
    // nada, e "Evitar" que falha aborta a Magia por completo, sem
    // nenhum efeito, mesmo já tendo custado Estamina/Mana - o
    // manual descreve isso como "a magia falha", não "a magia não
    // sai do zero"). "Aceitar" marca a Ação (cópia local, nunca o
    // documento salvo) com os dados de bônus já resolvidos por rank,
    // pra o bloco de Buff de Conjuração/Penitência mais abaixo somar
    // em localBonus junto com qualquer outro bônus.
    let danoPenitenciaAgora = 0;
    if (item.type === "magia" && item.system.ehMagiaDeSacerdote && acao.usaPenitencia && !this._acaoGratis?.semPenitencia) {
      const bonusSemSofrer = !!this._acaoGratis?.bonusPenitencia;
      const escolhaPenitencia = bonusSemSofrer ? "aceitar" : await this._popupPenitencia(item, acao);
      if (!this._acaoGratis) this._penitenciaDestaExecucao = escolhaPenitencia;
      if (!escolhaPenitencia) return; // fechou sem escolher - aborta, nada foi gasto ainda
      if (escolhaPenitencia === "evitar") {
        const { falhou } = await this._rolarTesteFalhaEscalonado(
          acao.penitenciaTesteDado, acao.penitenciaTesteContadorRecurso, true,
          "A Magia falha!", `${item.name} — Evitar a Penitência`, { zerarAoFalhar: acao.penitenciaFalhaZeraRisco !== false }
        );
        if (falhou) {
          this._penitenciaDestaExecucao = undefined;
          // A magia falha: sem nenhum efeito e sem gastar Estamina nem Mana.
          return;
        }
      } else if (escolhaPenitencia === "aceitar") {
        // Custo (dano verdadeiro/Estresse "em você mesmo") - mesmo
        // caminho de Custo de Recurso Próprio (vida desconta direto,
        // sem Redução de Dano nem Escudo). Bug real corrigido: antes só
        // notificava um texto simples ("perdeu 4 de Vida"), sem NENHUM
        // dado visível - agora rola de verdade (com dice3d e
        // breakdown), igual qualquer outra rolagem do sistema, e a
        // linha entra no MESMO card final desta Ação (não uma
        // notificação solta separada).
        penitenciaLinhasResumo.push({ label: "Penitência", value: bonusSemSofrer ? `Bônus de penitência (${this._acaoGratis.fonte}), sem sofrer` : "Aceitou" });
        // Provação do Entrelaço: aceitar quebra a sequência "consecutiva sem penitência" - o risco volta a 1.
        const idRisco = acao.penitenciaTesteContadorRecurso?.startsWith("recursoCustom:") ? acao.penitenciaTesteContadorRecurso.slice(14) : null;
        if (idRisco && !bonusSemSofrer) {
          const lista = foundry.utils.deepClone(this.actor.system.recursosCustom ?? []);
          const rr = lista.find(x => x.id === idRisco);
          if (rr && (rr.valor ?? 0) !== 0) { rr.valor = 0; await this.actor.update({ "system.recursosCustom": lista }); }
        }
        if (acao.penitenciaCustoRecurso && acao.penitenciaCustoQuantidade && !bonusSemSofrer) {
          const rollPenitencia = await new Roll(String(acao.penitenciaCustoQuantidade)).evaluate();
          if (game.dice3d) await game.dice3d.showForRoll(rollPenitencia, game.user, true);
          const quantidadePenitencia = rollPenitencia.total;
          if (acao.penitenciaCustoRecurso === "vida") danoPenitenciaAgora = Math.max(0, quantidadePenitencia);
          if (quantidadePenitencia > 0) {
            await NaurenAlvoHelper._aplicarRecursoNoAlvo(this.actor, acao.penitenciaCustoRecurso, quantidadePenitencia);
            const rotuloCusto = naurenNomeDoRecurso(null, acao.penitenciaCustoRecurso);
            penitenciaLinhasResumo.push({
              label: `Sofreu (${rotuloCusto})`,
              value: rollPenitencia.dice?.length ? `${naurenRollToBreakdownText(rollPenitencia)} = ${quantidadePenitencia}` : String(quantidadePenitencia)
            });
          }
        }
        const rankAtualPenitencia = this._rankEfetivo(item);
        acao = {
          ...acao,
          penitenciaAceitaAgora: true,
          penitenciaBonusDanoResolvido: this._resolverPorRank(acao.penitenciaBonusDanoDadoPorRank, rankAtualPenitencia) ?? acao.penitenciaBonusDanoDado,
          penitenciaBonusCuraResolvido: this._resolverPorRank(acao.penitenciaBonusCuraDadoPorRank, rankAtualPenitencia) ?? acao.penitenciaBonusCuraDado
        };
        // Dobra o custo (Estamina/Mana) desta MESMA Ação (ex: Redemptio -
        // "dobrar o custo: 6 Estamina, 10 Mana") - some ANTES do
        // desconto normal de custo mais abaixo em _executarAcao.
        if (acao.penitenciaDobraCustoPrincipal) {
          acao = { ...acao, custoEstamina: (acao.custoEstamina || 0) * 2, custoMana: (acao.custoMana || 0) * 2 };
        }
        // Dobra os acúmulos de Condições Aplicadas (mesmo padrão de
        // condensarDobraAcumulos, ver Condensar Magia) - ex: Redemptio,
        // "-3/-6 Vida Máxima permanente" como 1/2 acúmulos de uma
        // Condição "-3 por acúmulo".
        if (acao.penitenciaDobraCondicoesAcumulos) {
          acao = { ...acao, condicoesAplicadas: (acao.condicoesAplicadas ?? []).map(c => c.ativo ? { ...c, acumulos: (Number(c.acumulos) || 0) * 2 } : c) };
        }
        // Dobra os Gastos de Recurso do alvo (ex: Benedictio, "concede 2
        // Dados de Destino em vez de 1").
        if (acao.penitenciaDobraGastosRecurso) {
          acao = { ...acao, gastosRecurso: (acao.gastosRecurso ?? []).map(g => g.ativo ? { ...g, quantidade: `(${g.quantidade || "0"})*2` } : g) };
        }
        // Muda o Modo de Alvo pra "área" (ex: Fortitudo - "se estende a
        // todos os aliados num raio de 6 metros" em vez de 1 aliado
        // escolhido) - troca ANTES de _resolverAlvosDaAcao rodar mais
        // abaixo, então o próprio fluxo normal de área (colocar o
        // Template, coletar os tokens dentro) já funciona sozinho.
        // "penitenciaAreaFiltroDisposicao" viaja separado (não é campo
        // de acao) pro filtro extra em _resolverAlvosDaAcao mais
        // abaixo, já que Modo de Alvo "área" normal não filtra
        // disposição sozinho (afeta todo mundo na área, sem distinção -
        // correto pra dano em área, mas não pra um buff só de aliados).
        if (acao.penitenciaMudaParaArea) {
          acao = {
            ...acao, modoAlvo: "area", modoAlvoTravado: true, usaTemplate: true,
            templateTipo: acao.penitenciaAreaTipo || "circle", templateTamanho: parseFloat(acao.penitenciaAreaTamanho) || 6,
            penitenciaAreaFiltroDisposicaoAtivo: acao.penitenciaAreaDisposicao || "aliados",
            areaExcluirEu: acao.areaExcluirEu || acao.penitenciaAreaExcluirEu
          };
        }
        // Texto puramente narrativo (ver campoAcao > penitenciaTextoEfeitoNarrativo,
        // ex: Condemnatio - "Este ataque não gera Prioridade") - sempre
        // entra no card, mesmo sem nenhum bônus numérico configurado.
        if (acao.penitenciaSemPrioridade) acao = { ...acao, naoGeraPrioridade: true, _semPrioridadeFonte: "Penitência" };
        if (acao.penitenciaTextoEfeitoNarrativo) {
          penitenciaLinhasResumo.push({ label: "Efeito", value: acao.penitenciaTextoEfeitoNarrativo });
        }
        // As camadas dos nós (ex.: Fortalecer a Palavra) só são aplicadas
        // mais adiante; aqui lê o campo já considerando-as.
        let tambemEmMim = acao.penitenciaTambemEmMim;
        try {
          const mods = this._coletarModificadoresExternos(item, idx);
          if (mods?.length) tambemEmMim = !!this._aplicarModificadoresExternos(acao, mods).acao.penitenciaTambemEmMim;
        } catch (err) { /* mantém o valor da Ação */ }
        if (tambemEmMim) {
          for (const c of (acao.condicoesAplicadas ?? []).filter(c => c.ativo && c.uuid)) {
            const nomeEmMim = await NaurenAlvoHelper.aplicarCondicao(this.actor, c.uuid, Number(c.acumulos) || 1, null, c.copiarRankDoItem ? this._rankEfetivo(item) : 0).catch(() => null);
            if (nomeEmMim) penitenciaLinhasResumo.push({ label: "Também em você", value: nomeEmMim });
          }
        }
        // Gatilho por Evento dedicado (ver Estigmas do Milagre/Canonização,
        // Sacerdote) - disparado exatamente quando a Penitência é de
        // fato aceita, independente do tipo do item (magia/habilidade) -
        // diferente de "useiMagia"/"useiHabilidade" (que só distinguem
        // POR TIPO de item, nunca "usei com penitência especificamente").
        if (!bonusSemSofrer) naurenProcessarGatilhos("penitenciaAceita", this.actor, { itemUsadoUuid: item.uuid, acaoNome: acao.nome, danoPenitencia: danoPenitenciaAgora })
          .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (penitência aceita).", err));
      }
    }

    // Conjurar Arma (ver campoAcao > usaConjurarArma, ex: Espada Lunar)
    // - resolvido DEPOIS de Condensar Magia acima, já que a arma
    // criada precisa refletir os ajustes de Conjuração Poderosa
    // (dobrar dado, alcance extra) se o jogador tiver escolhido isso.
    if (acao.usaConjurarArma) {
      if (acao._poderosaDados && acao.armaConjuradaFormula) {
        // Conjuração Poderosa: a arma conjurada (ex.: Espada Lunar) recebe o dado extra antes de ser criada.
        acao = { ...acao, armaConjuradaFormula: naurenMaisDadosPoderosa(acao.armaConjuradaFormula, acao._poderosaDados) };
        this.#efeitosEmAtaquesAtual.push({ label: "Conjuração Poderosa", value: `arma conjurada: ${acao.armaConjuradaFormula}`, breakdown: "+dado extra do mesmo tipo" });
      }
      await this._conjurarArma(item, acao);
    }
    if (acao.sustentarPorTurno) {
      const alvoSust = Array.from(game.user.targets ?? []).find(t => t.actor && t.actor !== this.actor);
      if (alvoSust) {
        const antigasS = this.actor.items.filter(i => i.type === "condicao" && i.getFlag("nauren", "sustentacao")?.itemUuid === item.uuid);
        if (antigasS.length) await this.actor.deleteEmbeddedDocuments("Item", antigasS.map(i => i.id));
        const alcanceS = parseFloat(String(acao.alcance ?? "").replace(",", ".")) || 0;
        await this.actor.createEmbeddedDocuments("Item", [{
          name: `${item.name} (sustentando)`, type: "condicao", img: item.img,
          system: { descricao: `<p>Sustentando ${item.name} em <b>${alvoSust.name}</b>. A cada turno (de qualquer um), pergunta se sustenta por ${acao.sustentarCustoMana ?? 0} Mana.</p>` },
          flags: { nauren: { sustentacao: { itemUuid: item.uuid, itemNome: item.name, alvoTokenUuid: alvoSust.document.uuid, custoMana: acao.sustentarCustoMana ?? 0,
            formula: acao.sustentarFormula || acao.danos?.[0]?.formula || "0", incremento: acao.sustentarIncremento ?? 0, alcance: alcanceS, turnos: 0 } } }
        }]);
        this.#efeitosEmAtaquesAtual.push({ label: "Sustentação", value: `${item.name} em ${alvoSust.name}`, breakdown: `a cada turno: ${acao.sustentarCustoMana ?? 0} Mana para sustentar` });
      }
    }

    // Conjurar Consumível (ver campoAcao > usaConjurarConsumivel, ex:
    // Criar Comida e Bebida) - mesmo momento que Conjurar Arma acima.
    if (acao.usaConjurarConsumivel) {
      // As camadas de Subclasse (ex.: Receita Antiga: o remédio cura 6) só são aplicadas mais abaixo - aqui já valem.
      const modsC = this._coletarModificadoresExternos(item, idx);
      await this._criarConsumivel(item, modsC.length ? this._aplicarModificadoresExternos(acao, modsC).acao : acao);
    }

    // Atacar com Arma Escolhida (ver campoAcao > usaArmaEscolhida, ex:
    // Investida, Superioridade) - resolvido ANTES de qualquer outra
    // coisa (inclusive o Custo por Nível abaixo), já que cancelar a
    // escolha de arma precisa abortar a Ação inteira sem gastar nada,
    // igual cancelar o popup de pré-Ação já faz. Empresta ataque/dano/
    // tipo da Ação da ARMA escolhida numa CÓPIA rasa (nunca muta o
    // documento salvo) - custo, Condições Aplicadas, Usos e alcance
    // continuam sendo os da PRÓPRIA Habilidade, nunca somados com os da
    // arma (ex: Investida usa só a Estamina dela mesma, não some com o
    // custo do "Ataque Pesado" escolhido).
    if (acao.requerEscudo && !this.actor.items.some(i => i.type === "armadura" && i.system.equipado && /escudo/i.test(i.system.tipo ?? ""))) {
      ui.notifications.warn(`"${acao.nome || item.name}" precisa de um escudo equipado.`);
      return;
    }
    if (acao.usaConverterRecurso) {
      const de = this._recursoProprio(acao.converterDe);
      const para = this._recursoProprio(acao.converterPara);
      if (de && de.valor <= 0) { ui.notifications.warn(`"${acao.nome || item.name}": você não tem ${de.nome} para converter.`); return; }
      if (para && para.valor >= para.max) { ui.notifications.warn(`"${acao.nome || item.name}": sua ${para.nome} já está no máximo (${para.max}).`); return; }
    }
    // Fase 5 (M11): Condições que travam (Emudecido: Mana; forma fechada: ataques) - card explica.
    const trava = naurenTravaDaAcao(this.actor, acao, item);
    if (trava) {
      ui.notifications.warn(`"${acao.nome || item.name}": ${this.actor.name} ${trava.texto} (${trava.fontes.join(", ")}).`);
      naurenPostarCard({ ator: this.actor, titulo: acao.nome || item.name, icone: item.img, fonte: "Ação travada",
        linhas: [{ label: "Não usou", value: trava.texto, breakdown: `por ${trava.fontes.join(", ")}` }] }).catch(() => {});
      return;
    }
    const minReq = Math.max(1, Number(acao.exigirCondicaoAlvoMinimo) || 1);
    if (acao.exigirCondicaoAlvo && acao.usaCondicaoAlvo && acao.condicaoAlvoUuid && this._contarAcumulosNoAlvo(acao.condicaoAlvoUuid) < minReq) {
      let nomeReq = "a Condição";
      try { nomeReq = fromUuidSync(acao.condicaoAlvoUuid)?.name ?? nomeReq; } catch (err) { /* nome genérico */ }
      ui.notifications.warn(`"${acao.nome || item.name}": o alvo precisa estar com ${minReq > 1 ? `${minReq} acúmulos de ` : ""}${nomeReq} (tem ${this._contarAcumulosNoAlvo(acao.condicaoAlvoUuid)}).`);
      return;
    }
    // 1 vez por cena POR ALVO: guarda no item os alvos já atingidos nesta cena (chave = combate atual).
    let registroPorAlvo = null;
    if (acao.umaVezPorCenaPorAlvo) {
      const alvoR = Array.from(game.user.targets ?? [])[0]?.actor;
      if (!alvoR) { ui.notifications.warn(`"${acao.nome || item.name}": marque um alvo (T).`); return; }
      const chaveCena = game.combat?.id ?? canvas.scene?.id ?? "fora";
      const reg = item.getFlag("nauren", "usosPorAlvo") ?? {};
      const lista = reg.chave === chaveCena ? (reg.alvos ?? []) : [];
      if (lista.includes(alvoR.uuid)) { ui.notifications.warn(`"${acao.nome || item.name}": ${alvoR.name} já recebeu esta Ação nesta cena (1 vez por cena por alvo).`); return; }
      registroPorAlvo = { chave: chaveCena, alvos: [...lista, alvoR.uuid] };
    }
    if (acao.danoComoGolpeEspiritual) {
      const golpe = this.actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Golpe Espiritual"));
      const bloco = golpe?.system?.acoes?.[0]?.danos?.[0];
      if (bloco) {
        const formulaG = naurenResolverPorRank(bloco.porRank, golpe.system.rankAtual ?? 0, "formula") || bloco.formula;
        acao = { ...acao, danos: (acao.danos ?? []).map((d, i) => i === 0 ? { ...d, formula: formulaG, porRank: [] } : d) };
      }
    }
    this.#armaEscolhidaAtual = item.type === "arma" ? item : null;
    if (acao.usaArmaEscolhida) {
      const danosProprios = acao.armaEscolhidaSomarDanoProprio ? (acao.danos ?? []) : [];
      const escolha = await this._popupEscolherArmaEAcao(item.name, {
        tipos: acao.armaEscolhidaTipos, qualAtaque: acao.armaEscolhidaQualAtaque, soAtaques: !!acao.ehAtaque || !!acao.danoDiretoSemTeste
      });
      if (!escolha) return; // cancelado, ou sem arma equipada - não gasta nada
      const { acaoDaArma } = escolha;
      acao = {
        ...acao,
        _nomeAtaqueDaArma: acaoDaArma.nome ?? "",
        _armaEscolhidaNome: this.#armaEscolhidaAtual?.name ?? "",
        // Corpo a corpo/distância: o da habilidade manda; em Automático, segue o ataque escolhido da arma.
        tipoAlcance: (acao.tipoAlcance === "corpoACorpo" || acao.tipoAlcance === "distancia") ? acao.tipoAlcance
          : naurenTipoAlcanceDaAcao(this.#armaEscolhidaAtual, { ...acaoDaArma, usaArmaEscolhida: false }),
        ehAtaque: acaoDaArma.ehAtaque ?? acao.ehAtaque,
        atributoAtaque: acaoDaArma.atributoAtaque || acao.atributoAtaque,
        tipo: acaoDaArma.tipo || acao.tipo,
        danos: [...(acaoDaArma.danos ?? acao.danos ?? []), ...danosProprios],
        ...(acao.danoDiretoSemTeste ? { ehAtaque: false } : {}),
        critMinAjuste: acaoDaArma.critMinAjuste || acao.critMinAjuste,
        // Ver usaArmaEscolhidaHerdarAlcance no schema.
        alcance: acao.usaArmaEscolhidaHerdarAlcance ? (acaoDaArma.alcance || acao.alcance) : acao.alcance,
        // Ver usaArmaEscolhidaSomaCusto no schema - Superioridade precisa
        // do custo REAL do ataque escolhido (ex: +1 Estamina extra se for
        // Ataque Pesado) somado ao custo próprio da Habilidade, não
        // substituído por ele.
        custoEstamina: acao.usaArmaEscolhidaSomaCusto ? (acao.custoEstamina || 0) + (acaoDaArma.custoEstamina || 0) : acao.custoEstamina,
        custoMana: acao.usaArmaEscolhidaSomaCusto ? (acao.custoMana || 0) + (acaoDaArma.custoMana || 0) : acao.custoMana
      };
      // Escalar Dado da Arma Escolhida (ver campoAcao >
      // usaArmaEscolhidaEscalarDado, ex: Disparo Carregado, Caçador) -
      // aplica DEPOIS de "danos" já vir da arma escolhida acima, então
      // escala o dado real da arma que o jogador tem equipada, não uma
      // fórmula fixa pré-configurada numa arma específica.
      if (acao.usaArmaEscolhidaEscalarDado) {
        // Bug real corrigido: "_resolverBonusComTokens" (via
        // "_substituirAtributosNaFormula") não tem acesso ao ITEM desta
        // execução - "@rank" nunca resolvia (sempre virava 0, dado que
        // "@rank" só é conhecido perto do item, não do ator), então
        // "casas" era sempre 0 e o escalonamento nunca acontecia de
        // verdade. "naurenInterpretarModificador" já recebe "item"
        // diretamente e resolve "@rank" contra "item.system.rankAtual".
        const casas = Math.round(naurenInterpretarModificador(acao.armaEscolhidaEscalarCasas, this.actor, item)?.valor ?? 0);
        if (casas) {
          acao = { ...acao, danos: (acao.danos ?? []).map(bloco => ({ ...bloco, formula: this._escalarDadosNaFormula(bloco.formula, casas) })) };
        }
      }
      // Dado(s) Extra do Tipo da Arma (ver campoAcao >
      // armaEscolhidaDadoExtraFormula, ex: Ímpeto, Empíreo) - some N
      // dados do MESMO tamanho já presente na fórmula (não um dado fixo
      // pré-configurado), aplicado DEPOIS de "danos" já vir da arma
      // escolhida acima, então funciona com qualquer arma equipada.
      if (acao.armaEscolhidaDadoExtraFormula) {
        // Resolve @alvoAcumulos (ex.: Estocada Profunda - 1 dado por Sangramento no alvo).
        // "@rank" vira número antes: "_substituirAtributosNaFormula" não
        // conhece o item e o zerava (Ímpeto nunca ganhava o dado extra).
        const formulaDadoExtra = this._substituirAtributosNaFormula(String(acao.armaEscolhidaDadoExtraFormula).replace(/@rank\b/gi, String(this._rankEfetivo(item))), acao);
        const nDados = Math.round(naurenInterpretarModificador(formulaDadoExtra, this.actor, item)?.valor ?? 0);
        if (nDados > 0) {
          acao = {
            ...acao, danos: (acao.danos ?? []).map(bloco => {
              const maiorDado = this._extrairMaiorDado([bloco.formula]);
              if (!maiorDado) return bloco;
              const faceMatch = maiorDado.match(/d(\d+)/i);
              const face = faceMatch ? faceMatch[1] : null;
              return face ? { ...bloco, formula: `${bloco.formula}+${nDados}d${face}` } : bloco;
            })
          };
        }
      }
      // Bônus de Dano fixo/condicional (ver campoAcao >
      // armaEscolhidaBonusExtraFormula, ex: Ímpeto, Empíreo - "+1 de dano
      // extra em Profusão Ousada") - resolvido AQUI (não dentro de
      // _rolarBlocoDano) porque "@euTenhoCondicao"/"@euTenhoCondicao2"
      // dependem de "acao.usaCondicaoPropria"/"condicaoPropriaUuid*", que
      // já estão na PRÓPRIA Ação (não na arma escolhida).
      if (acao.armaEscolhidaBonusExtraFormula) {
        // Bug real corrigido: "@rank" nunca era resolvido aqui -
        // "_substituirAtributosNaFormula" só entende "@euTenhoCondicao"/
        // "@euTenhoCondicao2" e afins, nunca "@rank" (só
        // "naurenInterpretarModificador"/"naurenPrepararModificador"
        // resolvem esse token, contra "item.system.rankAtual"). O
        // resultado (ex: "1*@rank") ficava com "@rank" LITERAL dentro da
        // fórmula de dano final, que "new Roll(formula)" nunca recebe
        // "data" nenhum pra resolver sozinho - o bônus de Profusão nunca
        // escalava de verdade com o rank. Substitui "@rank" como TEXTO
        // primeiro (mantendo uma string de fórmula válida, que ainda
        // pode ter dados), depois resolve os tokens de Condição.
        const comRankResolvido = String(acao.armaEscolhidaBonusExtraFormula).replace(/@rank\b/gi, String(this._rankEfetivo(item)));
        const bonusResolvido = this._substituirAtributosNaFormula(comRankResolvido, acao);
        if (bonusResolvido && bonusResolvido !== "0") {
          acao = { ...acao, danos: (acao.danos ?? []).map(bloco => ({ ...bloco, formula: `${bloco.formula}+(${bonusResolvido})` })) };
        }
      }
    }

    // Escolher uma Condição (ver campoAcao > usaCondicaoEscolhida, ex:
    // Superioridade) - resolvido junto com "Atacar com Arma Escolhida"
    // acima (mesmo motivo: cancelar precisa abortar tudo sem gastar
    // nada). A condição escolhida vira a ÚNICA entrada de
    // condicoesAplicadas desta execução (some com qualquer
    // condicoesAplicadas fixa que a Ação já tivesse, se houver).
    if (acao.usaCondicaoEscolhida) {
      const uuidEscolhido = await this._popupEscolherCondicao(item.name, acao.condicoesEscolhidasOpcoes ?? [], acao.condicoesEscolhidasRotulos ?? []);
      if (!uuidEscolhido) return; // cancelado, ou lista vazia - não gasta nada
      // Só "Desarmar" tem a cláusula "a menos que gaste 1 de Estamina" no
      // manual - as outras opções (Rompe Tornozelo, Rasgar) não têm
      // chance de resistir, então o custo pra evitar só entra quando a
      // Condição escolhida for especificamente essa.
      const docEscolhido = await fromUuid(uuidEscolhido).catch(() => null);
      const ehDesarmar = docEscolhido?.getFlag?.("nauren", "seedId") === "condicao-desarmado";
      acao = {
        ...acao,
        condicoesAplicadas: [
          ...(acao.condicoesAplicadas ?? []),
          {
            uuid: uuidEscolhido, acumulos: 1, acumulosFormula: acao.condicoesEscolhidasAcumulosFormula || "", ativo: true, soSeAcertar: true,
            perguntarParaEvitar: ehDesarmar, custoParaEvitarRecurso: "estamina", custoParaEvitarQuantidade: "1"
          }
        ]
      };
    }

    // 0.94.3 (Óleo de Beladona): ataques com a arma de projeto aplicam, no acerto, 1 Condição à escolha.
    if (acao.ehAtaque) {
      for (const { item: fonteR, regra } of naurenRegrasExtras(this.actor, "condicaoAoAcertarProjeto")) {
        if (regra.fonte && !naurenItemEhDoProjeto(item, regra.fonte)) continue;
        const opcoes = (regra.opcoes ?? []).map(u => String(u).startsWith("self:") ? naurenResolverSelf(u, this.actor) : u).filter(Boolean);
        if (!opcoes.length) continue;
        const escR = opcoes.length === 1 ? opcoes[0] : await this._popupEscolherCondicao(`${item.name} + ${fonteR.name}`, opcoes, [], { opcional: false, semCancelar: true, intro: `<b>${fonteR.name}</b>: qual Condição entra se o ataque acertar?` });
        if (!escR || escR === "nenhum") continue;
        const docR = await fromUuid(escR).catch(() => null);
        acao = { ...acao, condicoesAplicadas: [...(acao.condicoesAplicadas ?? []), { uuid: escR, acumulos: 1, acumulosFormula: String(regra.acumulos ?? ""), ativo: true, soSeAcertar: true, perguntarParaEvitar: false }] };
        this.#beneficiosAtual.push({ label: fonteR.name, value: docR?.name ?? "Condição", breakdown: "só se acertar" });
      }
    }

    // Ações que podem ser somadas a um Ataque Especial (ex.: Superioridade em Investida, Estocada, Guilhotina).
    if (acao.ehAtaque && !acao.somarEmAtaquesEspeciais && item.type !== "arma" && this._tipoDoAtaque(item, acao) === "especial") {
      for (const fonte of this.actor.items) {
        if (fonte.id === item.id || !["habilidade", "magia"].includes(fonte.type) || fonte.system.ativo === false) continue;
        for (const [ix, extra] of (fonte.system.acoes ?? []).entries()) {
          if (!extra.somarEmAtaquesEspeciais || !extra.usaCondicaoEscolhida) continue;
          if (this._motivoParaNaoUsarAgora(fonte, extra)) continue; // sem usos ou sem o recurso: nem pergunta
          const custoTxt = (extra.custosRecursoProprio ?? []).filter(c => c.ativo).map(c => {
            const r = (this.actor.system.recursosCustom ?? []).find(x => `recursoCustom:${x.id}` === c.recurso);
            return `${c.quantidade} ${r?.nome ?? c.recurso}`;
          }).join(" + ");
          const esc = await this._popupEscolherCondicao(`${item.name} + ${fonte.name}`, extra.condicoesEscolhidasOpcoes ?? [], extra.condicoesEscolhidasRotulos ?? [],
            { opcional: true, intro: `Somar <b>${fonte.name}</b> a este ataque?${custoTxt ? ` Custa ${custoTxt} (gasto mesmo se errar);` : ""} o efeito só entra no acerto.` });
          if (!esc || esc === "nenhum") continue;
          // Paga: recursos próprios e 1 uso.
          for (const c of extra.custosRecursoProprio ?? []) {
            if (!c.ativo) continue;
            const q = Math.max(0, Math.round(Number(c.quantidade) || 0));
            const antes = (this.actor.system.recursosCustom ?? []).find(x => `recursoCustom:${x.id}` === c.recurso)?.valor ?? 0;
            await naurenGastarRecursoSimples(this.actor, c.recurso, q);
            if (c.recurso === "recursoCustom:espiritodabatalha" && antes > 0 && antes - q <= 0) {
              await this.actor.update({ "system.stress.value": Math.min(this.actor.system.stress?.max ?? 2, (this.actor.system.stress?.value ?? 0) + 1) });
              this.#beneficiosAtual.push({ label: "Espírito da Batalha esgotado", value: "+1 Estresse" });
            }
          }
          if (extra.usaUsos) {
            const acsF = foundry.utils.deepClone(fonte.system.acoes); acsF[ix].usosAtual = Math.max(0, (acsF[ix].usosAtual ?? 1) - 1);
            await fonte.update({ "system.acoes": acsF });
          }
          const docE = await fromUuid(esc).catch(() => null);
          const k = (extra.condicoesEscolhidasOpcoes ?? []).indexOf(esc);
          const rot = String((extra.condicoesEscolhidasRotulos ?? [])[k] ?? "").trim() || docE?.name || "efeito";
          const ehDesarmarE = docE?.getFlag?.("nauren", "seedId") === "condicao-desarmado";
          acao = { ...acao, condicoesAplicadas: [...(acao.condicoesAplicadas ?? []), {
            uuid: esc, acumulos: 1, ativo: true, soSeAcertar: true, perguntarParaEvitar: ehDesarmarE, custoParaEvitarRecurso: "estamina", custoParaEvitarQuantidade: "1"
          }] };
          this.#beneficiosAtual.push({ label: fonte.name, value: `${rot}${docE && rot !== docE.name ? ` (${docE.name})` : ""}`, breakdown: `${custoTxt ? `−${custoTxt} · ` : ""}efeito só no acerto` });
        }
      }
    }

    // Modificadores Externos de Subclasse (ver
    // NaurenEfeitoData#modificadoresExternos / campoModificadorExterno) -
    // resolvido AQUI de propósito: depois de Crescimento, Perguntar
    // Prioridade, Condensar Magia/Conjuração Poderosa, Atacar com Arma
    // Escolhida e Escolher uma Condição já terem composto "acao" (então
    // um modificador de Subclasse sempre atua em cima do valor JÁ
    // montado, nunca num que ainda vai mudar depois) - e ANTES de
    // qualquer popup que mostre número final ao jogador (Perguntar Ataque
    // no Turno, Escolha de Recurso, Penitência, a resolução de alvos e a
    // rolagem em si, todos mais abaixo), pra esses popups já mostrarem o
    // resultado com o ajuste incluído. Nunca muta o documento salvo do
    // item alvo - só a cópia local "acao" desta execução.
    {
      // Estudos (Ladino): efeitos armados contra o alvo marcado.
      this.#estudoAtual = null;
      this.#acertoExtraEfeitos = [];
      this.#criticoEfeitos = 0;
      const umAlvoSo = (game.user.targets?.size ?? 0) === 1;
      if ((acao.ehAtaque || acao.danoDiretoSemTeste) && !umAlvoSo && naurenEstudoNoAlvo(Array.from(game.user.targets ?? [])[0]?.actor, this.actor)) {
        this.#efeitosEmAtaquesAtual.push({ label: "Estudos", value: "não usados", breakdown: "os estudos valem só com um alvo marcado" });
      }
      if ((acao.ehAtaque || acao.danoDiretoSemTeste) && umAlvoSo) {
        const alvoEst = Array.from(game.user.targets ?? [])[0]?.actor;
        const marcaEst = naurenEstudoNoAlvo(alvoEst, this.actor);
        if (marcaEst) {
          const dados = marcaEst.getFlag("nauren", "estudo") ?? {};
          const rodadaAtual = game.combat?.round ?? 0;
          const config = Object.fromEntries(naurenTiposEstudoDoAtor(this.actor).map(t => [t.chave, t]));
          const est = { alvo: alvoEst, informacoes: dados.informacoes ?? 0, novas: dados.novas ?? 0, bonusAcerto: 0, critico: 0, consumir: [] };
          const extrasCondE = [];
          const extrasDanoE = [];
          for (const [chave, info] of Object.entries(dados.tipos ?? {})) {
            const t = config[chave];
            const acumulos = info?.acumulos ?? 0;
            if (!t || acumulos <= 0 || t.tipo.esquivaContra || t.tipo.criativa) continue;
            if (t.tipo.duracao === "rodada" && (info.rodada ?? 0) !== rodadaAtual) { est.consumir.push(chave); continue; }
            const n = naurenValorEstudo(t, acumulos, dados.informacoes ?? 0);
            if (t.tipo.porAnalisado && n <= 0) continue;
            const partes = [];
            // Conheço sua estratégia (livro 0.8): N ataques sem Prioridade (N = acúmulos), declarados ANTES de rolar.
            if (t.tipo.semPrioridade && t.tipo.porAnalisado) {
              const restam = Math.max(0, n - (dados.estrategiaUsados ?? 0));
              if (restam > 0 && !acao.naoGeraPrioridade) {
                const declarar = await foundry.applications.api.DialogV2.confirm({ window: { title: t.tipo.nome },
                  content: `<p>${t.tipo.nome}: declarar que este ataque contra <b>${alvoEst.name}</b> <b>não gera Prioridade</b>? (restam ${restam} de ${n})</p>`,
                  yes: { label: "Sem Prioridade" }, no: { label: "Normal" }, rejectClose: false }).catch(() => false);
                if (declarar) { acao = { ...acao, naoGeraPrioridade: true, _semPrioridadeFonte: t.tipo.nome }; est.gastarEstrategia = 1; partes.push(`não gera Prioridade (restam ${restam - 1} de ${n})`); }
                else partes.push(`não declarado (restam ${restam} de ${n})`);
              } else if (restam <= 0) partes.push(`sem ataques restantes (${n} de ${n} usados)`);
            }
            if (t.tipo.dadosDaArma) {
              const nD = Math.max(0, Math.round(n));
              let pos = false;
              acao = { ...acao, danos: (acao.danos ?? []).map((bloco, bi) => {
                if (bi > 0) return bloco;
                const face = (this._extrairMaiorDado([bloco.formula]) ?? "").match(/d(\d+)/i)?.[1];
                if (!face || !nD) return bloco;
                pos = true;
                return { ...bloco, formula: `${bloco.formula}+${nD}d${face}` };
              }) };
              if (pos) partes.push(`+${nD} dado(s) da arma`);
            }
            if (t.tipo.bonusAcerto) { est.bonusAcerto += n; partes.push(`+${n} no acerto`); }
            if (t.tipo.bonusDano) { extrasDanoE.push({ formula: String(n), aplicarNoAlvo: true }); partes.push(`+${n} de dano`); }
            if (t.tipo.criticoMais) { est.critico += n; partes.push(`crítico ${n} mais fácil`); }
            if (t.tipo.danoExtraDado) { const face = String(t.tipo.danoExtraDado).replace(/^\d*/, ""); extrasDanoE.push({ formula: `${acumulos}${face}`, aplicarNoAlvo: true }); partes.push(`+${acumulos}${face} de dano`); }
            if (t.tipo.semPrioridade && !t.tipo.porAnalisado) { acao = { ...acao, naoGeraPrioridade: true, _semPrioridadeFonte: t.tipo.nome }; partes.push("não gera Prioridade"); }
            if (t.tipo.condicaoUuid) {
              // Acúmulos da Condição = valor × rank (se sobe com o rank) × estudos
              // (Lerdeza 1 no rank 1, 2 no rank 2, 3 no rank 3, por estudo).
              const nCond = Math.max(1, Math.round(n || acumulos));
              extrasCondE.push({ uuid: t.tipo.condicaoUuid, acumulos: nCond, ativo: true, soSeAcertar: true, perguntarParaEvitar: false });
              let nm = "Condição"; try { nm = fromUuidSync(t.tipo.condicaoUuid)?.name ?? nm; } catch (err) { /* nome genérico */ }
              partes.push(`${nm} ×${nCond} no acerto`);
            }
            const consome = (t.tipo.duracao || "proximoAtaque") === "proximoAtaque";
            if (consome) est.consumir.push(chave);
            if (partes.length) this.#efeitosEmAtaquesAtual.push({ label: t.tipo.porAnalisado ? `${t.tipo.nome} (Analisado ×${dados.informacoes ?? 0})` : `Estudo: ${t.tipo.nome} ×${acumulos}`, value: partes.join(", "), breakdown: consome ? "consumido neste ataque" : t.tipo.duracao === "rodada" ? "vale até o fim da rodada" : "vale a cena toda" });
          }
          // Você está abaixo (criativa): armada para o próximo ataque contra ele - aplica no acerto.
          // Eu estou acima (só contra este alvo): acerto/dano quando VOCÊ ataca ele.
          {
            const ehMagiaA = item.type === "magia" || acao.atributoAtaque === "poderMagia";
            const acAcerto = naurenBonusAcimaContra(this.actor, alvoEst, ["ataque", ehMagiaA ? "poderMagia" : "poderAtaque"]);
            const acDano = naurenBonusAcimaContra(this.actor, alvoEst, ["danoBonus", ehMagiaA ? "poderMagia" : "poderAtaque"]);
            if (acAcerto.total) { est.bonusAcerto += acAcerto.total; }
            if (acDano.total) extrasDanoE.push({ formula: String(acDano.total), aplicarNoAlvo: true });
            const acAlcance = naurenBonusAcimaContra(this.actor, alvoEst, "alcanceBonus");
            if (acAlcance.total) acao = { ...acao, alcanceBonusExtraFormula: `${acao.alcanceBonusExtraFormula ? `${acao.alcanceBonusExtraFormula}+` : ""}${acAlcance.total}` };
            const acLimiar = naurenBonusAcimaContra(this.actor, alvoEst, "limiarDeflexao");
            est.acimaLimiar = acLimiar.total;
            if (acAcerto.total || acDano.total || acAlcance.total || acLimiar.total) this.#efeitosEmAtaquesAtual.push({ label: "Eu estou acima", value: [acAcerto.total ? `+${acAcerto.total} no acerto` : "", acDano.total ? `+${acDano.total} de dano` : "", acAlcance.total ? `+${acAlcance.total}m de alcance` : "", acLimiar.total ? `+${acLimiar.total} no Limiar de Deflexão` : ""].filter(Boolean).join(", "),
              breakdown: `só contra ${alvoEst.name} • ${[...acAcerto.fontes, ...acDano.fontes, ...acAlcance.fontes, ...acLimiar.fontes].map(f => f.nome).filter((v, i, a) => a.indexOf(v) === i).join(", ")}` });
          }
          est.abaixo = foundry.utils.deepClone(dados.abaixoPendente ?? []);
          if (est.abaixo.length) this.#efeitosEmAtaquesAtual.push({ label: "Você está abaixo", value: est.abaixo.map(x => `−${Math.max(1, dados.informacoes ?? 0)} ${x.rotulo}`).join(", "), breakdown: "no acerto, até o fim da cena (ou o alvo gasta 2 PdE); se errar, continua armada" });
          if (extrasCondE.length || extrasDanoE.length) acao = { ...acao, condicoesAplicadas: [...(acao.condicoesAplicadas ?? []), ...extrasCondE], danos: [...(acao.danos ?? []), ...extrasDanoE] };
          this.#estudoAtual = est;
        }
      }
      // Fase 7: efeitos passivos nos seus ataques (ex.: Golpe Decisivo).
      if (acao.ehAtaque || acao.danoDiretoSemTeste) {
        const tipoDoAtaque = this._tipoDoAtaque(item, acao);
        const tipoDaArma = naurenCategoriaDaArma(this.#armaEscolhidaAtual);
        const extrasCond = [];
        const extrasDano = [];
        const primeirosAtaquesNovos = [];
        for (const fonte of this.actor.items) {
          const ativa = fonte.type === "habilidade" ? fonte.system.ativo !== false
            : fonte.type === "condicao" ? fonte.system.ativo !== false
            : fonte.type === "efeito" ? !!fonte.system.ativo : false;
          if (!ativa) continue;
          for (let ea of fonte.system.efeitosEmAtaques ?? []) {
            if (ea.ativo === false) continue;
            // "@rank" no dado extra (ex.: Destruição Mútua "(@rank)d6" = 1d6/2d6/3d6).
            const rkEa = String(Math.max(1, fonte.system.rankAtual || 1));
            if (/@rank/.test(String(ea.acertoExtraDado ?? "") + String(ea.danoExtraDado ?? ""))) {
              ea = { ...ea, acertoExtraDado: String(ea.acertoExtraDado ?? "").replace(/\(?@rank\)?/g, rkEa), danoExtraDado: String(ea.danoExtraDado ?? "").replace(/\(?@rank\)?/g, rkEa) };
            }
            const t = ea.tipoAtaque || "qualquer";
            const ehEspecialComArma = item.type === "habilidade" && !!acao.usaArmaEscolhida;
            const bate = t === "qualquer" || t === tipoDoAtaque || (t === "pesadoOuEspecial" && (tipoDoAtaque === "pesado" || tipoDoAtaque === "especial"))
              || (t === "especialComArma" && ehEspecialComArma)
              || (t === "comArma" && (item.type === "arma" || ehEspecialComArma));
            // "Tipo de arma" aceita uma lista (ex.: "Distância,Alcance").
            const tiposArmaEa = String(ea.tipoArma ?? "").split(",").map(t => t.trim()).filter(Boolean);
            if (!bate || (tiposArmaEa.length && !tiposArmaEa.includes(tipoDaArma))) continue;
            const partes = [];
            // "Só no primeiro ataque contra cada alvo" (ex.: Avaliar).
            if (ea.soPrimeiroAtaque) {
              const alvoPrim = Array.from(game.user.targets ?? [])[0]?.actor;
              const usados = this.actor.getFlag("nauren", "primeirosAtaques") ?? {};
              const chavePrim = `${game.combat?.id ?? "fora"}_${fonte.id}_${String(alvoPrim?.uuid ?? "").replace(/\./g, "_")}`;
              if (!alvoPrim || usados[chavePrim]) continue;
              primeirosAtaquesNovos.push(chavePrim);
            }
            if (ea.soComEstadoNome && !naurenTemEstado(this.actor, ea.soComEstadoNome)) continue;
            if (ea.soAcaoNomeContem && !`${item.name} ${acao.nome ?? ""}`.toLowerCase().includes(String(ea.soAcaoNomeContem).toLowerCase())) continue;
            if (ea.soSeFormula && !this._condicaoParaAtivarPassou(ea.soSeFormula, acao)) continue;
            if (ea.perguntarEstresse) {
              const est = this.actor.system.stress?.value ?? 0, estMax = this.actor.system.stress?.max ?? 3;
              if (est >= estMax) continue;
              const ganho = [ea.danoExtraDado ? `+${ea.danoExtraDado} de dano` : "", ea.acertoExtraDado ? `+${ea.acertoExtraDado} no acerto` : ""].filter(Boolean).join(" e ");
              const pagar = await foundry.applications.api.DialogV2.confirm({ window: { title: fonte.name }, content: `<p>${fonte.name}: receber 1 Ponto de Estresse para ${ganho} neste ataque?</p>`,
                yes: { label: "Pagar 1 Estresse" }, no: { label: "Não" }, rejectClose: false }).catch(() => false);
              if (!pagar) continue;
              await this.actor.update({ "system.stress.value": est + 1 });
            }
            // Efeitos que dependem de UM alvo específico: com vários alvos, não se aplicam.
            const dependeDoAlvo = ea.alvoMarcadoPorMimNome || ea.multiplicarPorInformacoes || ea.criticoPorInformacao || ea.soPrimeiroAtaque || ea.danoExtraFixoPor === "informacoes";
            if (dependeDoAlvo && (game.user.targets?.size ?? 0) !== 1) {
              // Vários alvos com Marca (Ataque Múltiplo): o dano extra fixo vai só para quem tem a SUA marca.
              const porAlvoOk = (game.user.targets?.size ?? 0) > 1 && ea.alvoMarcadoPorMimNome && !ea.multiplicarPorInformacoes && !ea.criticoPorInformacao
                && !ea.soPrimeiroAtaque && !ea.soNoCritico && ea.danoExtraFixoPor && ea.danoExtraFixoPor !== "informacoes";
              if (porAlvoOk) {
                const unidadesPA = ea.danoExtraFixoPor === "rank" ? Math.max(1, fonte.system.rankAtual || 1) : ea.danoExtraFixoPor === "estresseAliados" ? naurenEstresseDosAliados(this.actor)
                  : ea.danoExtraFixoPor === "prioridadesGeradas" ? naurenPrioridadesGeradas(this.actor) : 0;
                const totalPA = unidadesPA * (Number(ea.danoExtraFixoValor) || 0) * (ea.multiplicarPeloRank ? Math.max(1, fonte.system.rankAtual || 1) : 1);
                if (totalPA > 0) {
                  this.#bonusPorAlvoAtual.push({ fonte: fonte.name, marcaNome: ea.alvoMarcadoPorMimNome, beneficio: ea.soComBeneficioMarca || "", dano: totalPA });
                  this.#efeitosEmAtaquesAtual.push({ label: fonte.name, value: `+${totalPA} de dano só no alvo marcado`, breakdown: "vários alvos: os não marcados não recebem" });
                }
                continue;
              }
              // Só avisa "não aplicado" se algum alvo de fato tem a SUA marca com este benefício (senão é ruído).
              let algumMarcado = !ea.alvoMarcadoPorMimNome;
              if (ea.alvoMarcadoPorMimNome) {
                const txtM = ea.alvoMarcadoPorMimNome.toLowerCase();
                algumMarcado = Array.from(game.user.targets ?? []).some(t => t.actor?.items?.some(i => i.type === "condicao" && i.name.toLowerCase().includes(txtM)
                  && (!ea.soComBeneficioMarca || i.getFlag("nauren", "beneficioMarca") === ea.soComBeneficioMarca)
                  && (() => { try { const d = fromUuidSync(i.system.conjuradorUuid); return (d?.actor ?? d)?.uuid === this.actor.uuid; } catch (err) { return false; } })()));
              }
              if ((game.user.targets?.size ?? 0) > 1 && algumMarcado) this.#efeitosEmAtaquesAtual.push({ label: fonte.name, value: "não aplicado", breakdown: "vale só com um alvo marcado" });
              continue;
            }
            // Só contra um alvo com uma Condição SUA (ex.: Marca do Caçador).
            if (ea.alvoMarcadoPorMimNome) {
              const alvoM = Array.from(game.user.targets ?? [])[0]?.actor;
              const texto = ea.alvoMarcadoPorMimNome.toLowerCase();
              const minhaMarca = alvoM?.items?.find(i => i.type === "condicao" && i.name.toLowerCase().includes(texto) && (() => {
                try { const d = fromUuidSync(i.system.conjuradorUuid); return (d?.actor ?? d)?.uuid === this.actor.uuid; } catch (err) { return false; }
              })());
              if (!minhaMarca) continue;
              if (ea.soComBeneficioMarca && minhaMarca.getFlag("nauren", "beneficioMarca") !== ea.soComBeneficioMarca) continue;
            }
            // Só em Prioridade roubada (ex.: Aterrorizar Provocador).
            if (ea.soEmPrioridadeRoubada && !this.#emPrioridadeAtual?.tomadaDe) continue;
            // "Só no 1º ataque de cada turno" (ex.: Esgrima da Chuva).
            if (ea.soPrimeiroAtaqueTurno) {
              const chaveTurno = `turno_${game.combat?.id ?? "fora"}_${game.combat?.round ?? 0}_${game.combat?.turn ?? 0}_${fonte.id}`;
              if ((this.actor.getFlag("nauren", "primeirosAtaques") ?? {})[chaveTurno]) continue;
              primeirosAtaquesNovos.push(chaveTurno);
            }
            // "× suas informações no alvo" (ex.: Marcar o Alvo, Avaliar).
            const inf = this.#estudoAtual?.informacoes ?? 0;
            // Avaliar: só as informações NOVAS (adquiridas desde o seu último
            // ataque contra o alvo). O ataque gasta; para valer de novo, estude de novo.
            const novas = this.#estudoAtual?.novas ?? 0;
            if (ea.multiplicarPorInformacoes && inf <= 0) continue;
            if (ea.criticoPorInformacao && novas <= 0) continue;
            if (ea.criticoPorInformacao) { this.#estudoAtual.critico += novas; this.#estudoAtual.gastarNovas = true; partes.push(`crítico ${novas} mais fácil (${novas} ${novas === 1 ? "informação nova, gasta" : "informações novas, gastas"} neste ataque)`); }
            if (ea.danoMaximo) { acao = { ...acao, _danoMaximoPorEfeito: true }; partes.push("dano máximo"); }
            if (ea.danoMaximoSeAlvoCondicaoNome) {
              const alvoDM = Array.from(game.user.targets ?? []); const txtDM = String(ea.danoMaximoSeAlvoCondicaoNome).toLowerCase();
              const bateDM = alvoDM.length === 1 && alvoDM[0].actor?.items?.some(i => (i.type === "condicao" || i.type === "efeito") && i.system.ativo !== false && i.name.toLowerCase().includes(txtDM));
              if (bateDM) { acao = { ...acao, _danoMaximoPorEfeito: true }; partes.push(`dano máximo (alvo ${ea.danoMaximoSeAlvoCondicaoNome})`); }
            }
            if (ea.danoNoErro && acao.ehAtaque && !String(acao.danoNoErroFormula ?? "").trim()) { acao = { ...acao, danoNoErroFormula: naurenFormulaComTokensDoAtor(String(ea.danoNoErro), this.actor) }; partes.push(`dano no erro: ${naurenFormulaComTokensDoAtor(String(ea.danoNoErro), this.actor)}`); }
            if (ea.danoVerdadeiroExtra) { this.#danoVerdadeiroExtrasAtual.push(naurenFormulaComTokensDoAtor(String(ea.danoVerdadeiroExtra), this.actor)); partes.push(`+${naurenFormulaComTokensDoAtor(String(ea.danoVerdadeiroExtra), this.actor)} de dano verdadeiro`); }
            if (ea.acertoExtraDado) { this.#acertoExtraEfeitos.push(ea.acertoExtraDado); partes.push(`+${ea.acertoExtraDado} no acerto`); }
            // Escalar o dado da arma (ex.: Disparo Carregado) e empurrar no acerto (ex.: Rastro do Vendaval).
            if (String(ea.escalarDadoCasas ?? "").trim()) {
              const casasEa = Math.round(Number(naurenAvaliarExpressaoSimples(String(ea.escalarDadoCasas).replace(/@rank\b/gi, rkEa))) || 0);
              if (casasEa > 0) {
                const antesEa = (acao.danos ?? [])[0]?.formula ?? "";
                acao = { ...acao, danos: (acao.danos ?? []).map(bloco => ({ ...bloco, formula: this._escalarDadosNaFormula(bloco.formula, casasEa) })) };
                const depoisEa = (acao.danos ?? [])[0]?.formula ?? "";
                partes.push(`dado da arma +${casasEa} casa${casasEa > 1 ? "s" : ""} (${String(antesEa).match(/\d+d\d+/)?.[0] ?? "?"} → ${String(depoisEa).match(/\d+d\d+/)?.[0] ?? "?"})`);
              }
            }
            if (String(ea.empurrarMetros ?? "").trim()) {
              const mEa = naurenMetrosEmpurrao(ea.empurrarMetros, this.actor, rkEa);
              if (mEa > 0) {
                acao = { ...acao, usaEmpurrar: true, empurrarMetros: String(mEa), empurrarColisaoDano: ea.empurrarColisaoDano || acao.empurrarColisaoDano || "" };
                partes.push(`o acerto empurra ${mEa}m${ea.empurrarColisaoDano ? " (colidindo, +1 dado da arma)" : ""}`);
              }
            }
            if (String(ea.acertoExtraFormula ?? "").trim()) {
              const fA = this._substituirAtributosNaFormula(String(ea.acertoExtraFormula), acao);
              let vA = fA; try { vA = String(Roll.safeEval(fA)); } catch (err) { /* mantém a fórmula (pode ter dado) */ }
              if (vA !== "0") { this.#acertoExtraEfeitos.push(`(${vA})`); partes.push(`${/^-/.test(vA) ? "" : "+"}${vA} no acerto (${ea.acertoExtraFormula})`); }
            }
            if (Number(ea.dadosExtrasDaArma) > 0) {
              const nD = Number(ea.dadosExtrasDaArma) * (ea.multiplicarPorInformacoes ? inf : 1);
              acao = { ...acao, danos: (acao.danos ?? []).map((bloco, bi) => {
                if (bi > 0) return bloco;
                const face = (this._extrairMaiorDado([bloco.formula]) ?? "").match(/d(\d+)/i)?.[1];
                return face ? { ...bloco, formula: `${bloco.formula}+${nD}d${face}` } : bloco;
              }) };
              partes.push(`+${nD} dado(s) da arma${ea.multiplicarPorInformacoes ? ` (${inf} informações)` : ""}`);
            }
            if (Number(ea.criticoMaisFacil) > 0) { this.#criticoEfeitos += Number(ea.criticoMaisFacil); partes.push(`crítico ${ea.criticoMaisFacil} mais fácil`); }
            if (ea.perguntarEstresse) partes.push("pagou 1 Estresse");
            if (ea.semCusto) { acao = naurenAcaoSemCustoEstaminaMana(acao); partes.push("sem custo de Estamina"); }
            if (ea.ignoraBloqueio) { acao = { ...acao, _ignoraBloqueio: true }; partes.push("não pode ser bloqueado"); }
            if (ea.alcanceExtra) {
              // Aceita número ou fórmula com @rank (ex.: Marca do Caçador, Foco Mortal: "2+@rank").
              const rkA = Math.max(1, this._rankEfetivo(fonte) || fonte.system.rankAtual || 1);
              const textoA = String(ea.alcanceExtra).replace(/@rank\b/g, String(rkA));
              let baseA = Number(textoA);
              if (!Number.isFinite(baseA)) { try { baseA = Roll.safeEval(textoA); } catch (err) { baseA = 0; } }
              const mais = (Number(baseA) || 0) * (ea.multiplicarPeloRank ? rkA : 1);
              if (mais) { acao = { ...acao, alcanceBonusExtraFormula: `${acao.alcanceBonusExtraFormula ? `${acao.alcanceBonusExtraFormula}+` : ""}${mais}` }; partes.push(`+${mais}m de alcance`); }
            }
            if (ea.morteInstantanea20) {
              const nivelEu = this.actor.system.nivel ?? 1;
              acao = { ...acao, _morte20: nivelEu >= 20 ? 20 : nivelEu >= 17 ? 10 : 0 };
              partes.push("20 natural: mata se o alvo tiver menos Vida que você");
            }
            // Dano extra fixo por algo (ex.: A Isca Perfeita, Fazer em Silêncio).
            if (ea.danoExtraFixoPor) {
              const unidades = ea.danoExtraFixoPor === "rank" ? Math.max(1, fonte.system.rankAtual || 1) : ea.danoExtraFixoPor === "estresseAliados" ? naurenEstresseDosAliados(this.actor)
                : ea.danoExtraFixoPor === "prioridadesGeradas" ? naurenPrioridadesGeradas(this.actor)
                : ea.danoExtraFixoPor === "informacoes" ? (this.#estudoAtual?.informacoes ?? 0) : 0;
              const porUnidade = (Number(ea.danoExtraFixoValor) || 0) * (ea.multiplicarPeloRank ? Math.max(1, fonte.system.rankAtual || 1) : 1);
              const total = unidades * porUnidade;
              if (total > 0) {
                extrasDano.push({ formula: String(total), aplicarNoAlvo: true, soNoCritico: !!ea.soNoCritico, nomeCustom: fonte.name });
                const rotuloPor = { estresseAliados: ["de Estresse dos aliados", "de Estresse dos aliados"], prioridadesGeradas: ["Prioridade que você deu", "Prioridades que você deu"], informacoes: ["informação", "informações"], rank: ["rank", "rank"] }[ea.danoExtraFixoPor]?.[unidades === 1 ? 0 : 1] ?? "";
                partes.push(`+${total} de dano (${unidades} ${rotuloPor} × ${porUnidade})${ea.soNoCritico ? " só se for crítico" : ""}`);
              }
            }
            if (ea.condicaoUuid) {
              const base = Math.max(1, Math.round(Number(ea.acumulos) || Number(naurenResolverTokenFormula(String(ea.acumulos ?? "").replace(/^@/, ""), this.actor)) || 1));
              const acumulos = (ea.multiplicarPeloRank ? base * Math.max(1, fonte.system.rankAtual || 1) : base) * (ea.multiplicarPorInformacoes ? inf : 1);
              extrasCond.push({ uuid: ea.condicaoUuid, acumulos, ativo: true, soSeAcertar: true, perguntarParaEvitar: false });
              let nome = "Condição";
              try { nome = fromUuidSync(ea.condicaoUuid)?.name ?? nome; } catch (err) { /* nome genérico */ }
              partes.push(`${nome} ×${acumulos}`);
            }
            if (ea.danoExtraDado) {
              let formulaExtra = ea.multiplicarPorInformacoes ? `${inf * (parseInt(ea.danoExtraDado) || 1)}${String(ea.danoExtraDado).replace(/^\d*/, "")}` : ea.danoExtraDado;
              const rkD = Math.max(1, fonte.system.rankAtual || 1);
              if (ea.danoExtraDadoPorRank) formulaExtra = `${rkD * (parseInt(formulaExtra) || 1)}${String(formulaExtra).replace(/^\d*/, "")}`;
              // 0.94.24: "só no crítico" também vale para o dado extra (Afiado: o crítico causa +Xd6, sem dobrar);
              // "curarMetade" devolve a metade do dado ao atacante se acertar (Dreno).
              const nomeBlocoEa = ea.soComFacilidade || ea.danoExtraDadoPorRank || ea.soNoCritico || ea.curarMetade;
              extrasDano.push({ formula: formulaExtra, aplicarNoAlvo: true, ...(nomeBlocoEa ? { soComFacilidade: !!ea.soComFacilidade, nomeCustom: fonte.name } : {}),
                ...(ea.soNoCritico ? { soNoCritico: true, naoDobraNoCritico: true } : {}), ...(ea.curarMetade ? { curaMetadeEmMim: true } : {}) });
              partes.push(`+${naurenFormulaComTokensDoAtor(formulaExtra, this.actor)} de dano${ea.danoExtraDadoPorRank ? ` (rank ${rkD})` : ""}${ea.multiplicarPorInformacoes ? ` (${inf} informações)` : ""}${ea.soComFacilidade ? " se o ataque sair com Facilidade" : ""}${ea.soNoCritico ? " se for crítico" : ""}${ea.curarMetade ? " (você recupera a metade se acertar)" : ""}`);
            }
            if (partes.length) this.#efeitosEmAtaquesAtual.push({ label: fonte.name, value: partes.join(", "), breakdown: `ataque ${tipoDoAtaque === "pesado" ? "pesado" : tipoDoAtaque === "especial" ? "especial" : "básico"}${tipoDaArma ? ` • arma ${tipoDaArma}` : ""} • em um acerto` });
          }
        }
        if (extrasCond.length || extrasDano.length) {
          acao = { ...acao, condicoesAplicadas: [...(acao.condicoesAplicadas ?? []), ...extrasCond], danos: [...(acao.danos ?? []), ...extrasDano] };
        }
        if (primeirosAtaquesNovos.length) {
          const usados = { ...(this.actor.getFlag("nauren", "primeirosAtaques") ?? {}) };
          for (const c of primeirosAtaquesNovos) usados[c] = true;
          await this.actor.setFlag("nauren", "primeirosAtaques", usados);
        }
      }
      const modificadoresExternos = this._coletarModificadoresExternos(item, idx);
      if (modificadoresExternos.length) {
        const { acao: acaoAjustada, aplicados } = this._aplicarModificadoresExternos(acao, modificadoresExternos);
        acao = acaoAjustada;
        this.#modificadoresExternosAplicadosAtual = [...this.#modificadoresExternosAplicadosAtual, ...aplicados];
      }
    }

    if (acao._conjuracaoPoderosa && acao.danoMaximoEmPoderosa && !this.#efeitosEmAtaquesAtual.some(l => String(l.value ?? "").includes("dano máximo")))
      this.#efeitosEmAtaquesAtual.push({ label: "Conjuração Poderosa", value: "dano máximo (desta magia)", breakdown: "bônus da magia/Subclasse com Conjuração Poderosa armada" });
    // Conjuração Poderosa · resistir: Condições que as camadas de Subclasse acrescentaram também recebem o +N.
    if (acao._poderosaRecurso) {
      const nR = acao._poderosaRecurso, iniR = acao._poderosaNCond ?? 0;
      const somarR = v => { const t = String(v ?? "").trim(); const num = Number(t); return t === "" ? t : Number.isFinite(num) ? String(num + nR) : `(${t})+${nR}`; };
      acao = { ...acao, _poderosaRecurso: 0, condicoesAplicadas: (acao.condicoesAplicadas ?? []).map((c, i) => (i >= iniR && c.ativo && c.perguntarParaEvitar) ? {
        ...c, custoParaEvitarQuantidade: somarR(c.custoParaEvitarQuantidade || "1"),
        custoParaEvitarQuantidadePorRank: (c.custoParaEvitarQuantidadePorRank ?? []).map(r => ({ ...r, quantidade: r.quantidade === "" ? r.quantidade : somarR(r.quantidade) }))
      } : c) };
    }
    // Conjuração Poderosa · "Mais 1 dado de dano": só agora, com a fórmula FINAL da magia
    // (depois de Subclasse, escalar dado, etc.), nos blocos de dano da própria magia.
    if (acao._poderosaDados) {
      const nP = acao._poderosaDados, nBlocos = acao._poderosaNBlocos ?? (acao.danos ?? []).length;
      const tiposP = [];
      const mais = f => { const r = naurenMaisDadosPoderosa(f, nP); const m = String(r).match(/\+(\d+d\d+)$/); if (m && r !== f) tiposP.push(m[1]); return r; };
      acao = { ...acao, danos: (acao.danos ?? []).map((b, i) => i >= nBlocos ? b : ({ ...b, formula: mais(b.formula), porRank: (b.porRank ?? []).map(r => ({ ...r, formula: naurenMaisDadosPoderosa(r.formula, nP) })) })), _poderosaDados: 0 };
      if (tiposP.length) this.#efeitosEmAtaquesAtual.push({ label: "Conjuração Poderosa", value: `+${[...new Set(tiposP)].join(", +")} de dano`, breakdown: "dado extra do mesmo tipo do maior dado da magia, já com as habilidades que mudam o dado" });
    }

    // Regra do livro: Magias SEMPRE somam o Poder Mágico no dano, em cada
    // instância, salvo quando a descrição diz o contrário. Soma em todo
    // bloco de dano com dado que ainda não tenha @poderMagia (inclusive as
    // fórmulas por rank e o dano periódico da área). Nunca no dano em você
    // mesmo (Penitência) nem em blocos só de número fixo (bônus condicional).
    if (item.type === "magia" && !acao.semPoderMagiaNoDano) {
      const comPdM = f => {
        const t = String(f ?? "").trim();
        if (!t || !/\d*d\d+/i.test(t) || /@(poderMagia|pdm|poderMagico)\b/i.test(t)) return f;
        // Conjuração Poderosa (duas magias fundidas): o Poder Mágico entra em dobro.
        return `${t}+@poderMagia`;
      };
      const somouPdM = [];
      acao = {
        ...acao,
        danos: (acao.danos ?? []).map(b => {
          if (b?.aplicarNoAlvo === false) return b;
          const nova = comPdM(b.formula);
          if (nova !== b.formula) somouPdM.push(b.formula);
          return { ...b, formula: nova, porRank: (b.porRank ?? []).map(r => ({ ...r, formula: comPdM(r.formula) })) };
        })
      };
      if (acao.usaTemplatePersistente && (acao.templatePersistenteEfeito || "dano") === "dano") {
        const nq = comPdM(acao.templatePersistenteQuantidade);
        if (nq !== acao.templatePersistenteQuantidade) { somouPdM.push(acao.templatePersistenteQuantidade); acao = { ...acao, templatePersistenteQuantidade: nq }; }
      }
      if (somouPdM.length) this.#modificadoresExternosAplicadosAtual = [...this.#modificadoresExternosAplicadosAtual, { nome: "Magia: Poder Mágico no dano", rank: "", campo: "dano", fase: "", antes: somouPdM.join(", "), depois: "+ Poder Mágico" }];
    }

    // Fase 4: tokens de contexto (alvo, aliados, rank efetivo) resolvidos
    // agora, na cópia da Ação - o item salvo continua com os @tokens.
    {
      const usados = [];
      const meuToken = canvas?.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
      const ctx = {
        actor: this.actor,
        rank: this._rankEfetivo(item),
        alvoActor: [...(game.user.targets ?? [])][0]?.actor ?? null,
        contarNoRaio: (lado, raio) => meuToken ? naurenPersonagensEmCena(meuToken, lado).filter(t => naurenMedirDistanciaBordas(meuToken, t) <= raio).length : 0,
        estresseAliados: () => meuToken ? naurenPersonagensEmCena(meuToken, "aliados").reduce((soma, t) => soma + (t.actor?.system?.stress?.value ?? 0), 0) : 0,
        // Bando (0.93)
        bandoNoAlcance: () => naurenBandoNoAlcance(this.actor, [...(game.user.targets ?? [])][0] ?? null, naurenAlcanceEmMetros(acao)),
        bandoVivos: () => Math.max(1, naurenBandoMembros(this.actor).length),
        bandoMembros: () => { const cfgB = naurenBandoCfg(this.actor); const todos = naurenBandoMembros(this.actor, { vivos: false }).length; return Math.max(1, Number(cfgB?.membros) > 0 ? Number(cfgB.membros) : todos); }
      };
      acao = naurenMapearStrings(acao, texto => naurenSubstituirTokensDeContexto(texto, ctx, usados));
      this.#tokensContextoUsadosAtual = usados;
    }

    // Fase 6 (N): buffs de "próxima ação" que casam com esta Ação. O popup
    // de confirmação (se usado) deixa escolher quais usar agora; são
    // ativados logo depois dele, antes do cálculo de custo.
    this.#proximaAcaoCandidatosAtual = this._buffsProximaAcaoCandidatos(item, acao);
    this.#buffsEscolhidosAtual = null;

    // "Você atacou um inimigo neste turno?" (ver campoAcao >
    // usaPerguntaAtaqueNoTurno) - resolvido junto com os popups acima
    // (mesmo motivo de ordem), expõe "@atacouNesteTurno" no resto desta
    // execução. Nunca cancela a Ação (só informa um bônus condicional).
    // Bug real corrigido: o reset destes dois campos (pra "toda nova
    // chamada de _executarAcao começar limpa") estava MAIS ABAIXO,
    // DEPOIS dos dois popups terem acabado de definir o valor real -
    // isso sobrescrevia de volta pra false/0 exatamente o que o jogador
    // tinha acabado de responder, então NADA que dependesse de
    // "@atacouNesteTurno"/"@quantidadeEscolhida" mais adiante (gastos de
    // recurso, condições, número de alvos) via o valor certo. Movido pra
    // ANTES dos dois popups, igual "#nivelCrescimentoAtual" já fazia
    // corretamente.
    this.#atacouNesteTurnoAtual = false;
    this.#quantidadeRecursoEscolhidaAtual = 0;
    // Antes de qualquer janela: sem usos ou sem o recurso próprio de custo fixo, avisa já
    // (antes o jogador respondia "já atacou?" e confirmava, e só então era recusado).
    {
      const motivoPre = this._motivoParaNaoUsarAgora(item, acao);
      if (motivoPre) { ui.notifications.warn(motivoPre); return; }
    }
    if (acao.usaPerguntaAtaqueNoTurno) {
      // Se o sistema já viu você atacar um inimigo neste turno, não pergunta.
      this.#atacouNesteTurnoAtual = naurenAtacouNoTurnoAtual(this.actor) || await this._popupPerguntaAtaqueNoTurno(item.name);
    }

    // "Quanto de [recurso] você quer gastar?" (ver campoAcao >
    // usaEscolhaDeRecurso) - resolvido junto com os popups acima (mesmo
    // motivo de ordem). Cancelar ou não ter o mínimo aborta a Ação
    // inteira, sem gastar nada.
    if (acao.usaEscolhaDeRecurso) {
      // Quando a quantidade também é o número de alvos (Prisão das Brumas: X Energia = X alvos), já vem com os alvos marcados.
      const sugeridaQtd = /@quantidadeEscolhida/.test(String(acao.numeroAlvosExtraPorCrescimento ?? "")) ? (game.user.targets?.size ?? 0) : null;
      const escolhida = await this._popupEscolherQuantidadeRecurso(item.name, acao.escolhaDeRecursoTipo, acao.escolhaDeRecursoMinimo || 1, null, "", sugeridaQtd);
      if (!escolhida) return;
      this.#quantidadeRecursoEscolhidaAtual = escolhida;
    }

    // "Escolher Efeito ao Usar" (ver campoAcao > escolherEfeitoUuids) -
    // resolvido junto com os popups acima (mesmo motivo de ordem).
    // Cancelar aborta a Ação inteira, sem gastar nada nem ativar nada.
    if (acao.escolherEfeitoUuids?.length) {
      const uuidEscolhido = await this._popupEscolherEfeito(item.name, acao.escolherEfeitoUuids);
      if (!uuidEscolhido) return;
      await this._ativarEfeitoExclusivo(acao.escolherEfeitoUuids, uuidEscolhido, item.name);
    }

    // "Custo por Nível" / "Usos Máximos por Nível" (ex: Comungar, Druida) -
    // resolve ANTES de qualquer outra coisa usar custoEstamina/custoMana/
    // usosMax, sobrescrevendo numa CÓPIA rasa (nunca muta o documento
    // salvo) - cobre todo o resto desta função de uma vez, sem precisar
    // repetir a resolução em cada ponto que lê esses campos.
    const nivelAtor = this.actor.system.nivel || 1;
    const custoEstaminaPorNivel = naurenResolverPorNivel(acao.custoEstaminaPorNivel, nivelAtor, "valor");
    const custoManaPorNivel = naurenResolverPorNivel(acao.custoManaPorNivel, nivelAtor, "valor");
    const usosMaxPorNivel = naurenResolverPorNivel(acao.usosMaxPorNivel, nivelAtor, "valor");
    if (custoEstaminaPorNivel !== null || custoManaPorNivel !== null || usosMaxPorNivel !== null) {
      acao = {
        ...acao,
        custoEstamina: custoEstaminaPorNivel !== null ? custoEstaminaPorNivel : acao.custoEstamina,
        custoMana: custoManaPorNivel !== null ? custoManaPorNivel : acao.custoMana,
        usosMax: usosMaxPorNivel !== null ? usosMaxPorNivel : acao.usosMax
      };
    }

    // Usos da Habilidade (nível do item, ver NaurenHabilidadeData/
    // NaurenMagiaData > usaUsos) - compartilhado entre TODAS as Ações
    // que marcarem "usaUsos: true" (ex: Comungar - "Comungar — Vida" e
    // "Comungar — Mana" são a MESMA Habilidade com 1 uso/dia, não duas
    // Ações com 1 uso cada). Quando desligado no item, cada Ação com
    // "usaUsos" continua com seu próprio contador, exatamente como
    // sempre foi - resolvido AQUI (com "usosMax" já certo pro nível
    // atual) pra tudo abaixo usar "acaoDoUso" sem se importar de onde
    // o contador realmente vem.
    const extraUsosAcao = naurenUsosExtrasPara(this.actor, item);
    if (extraUsosAcao && acao.usaUsos) acao = { ...acao, usosMax: (acao.usosMax ?? 0) + extraUsosAcao };
    // Usos compartilhados: esta Ação gasta do contador da 1ª Ação de outro item.
    let usoCompartilhado = null;
    if (acao.usosDeOutroItemNome) {
      // 0.94.1: o outro item pode ter o contador no próprio item (usos do item inteiro, ex.: Os Frascos).
      const outro = this.actor.items.find(i => i !== item && naurenEhItem(i, acao.usosDeOutroItemNome) && (i.system.usaUsos === true || (i.system.acoes ?? [])[0]?.usaUsos));
      if (outro) {
        const a0 = outro.system.usaUsos === true ? outro.system : outro.system.acoes[0];
        const maxNv = naurenResolverPorNivel(a0.usosMaxPorNivel, nivelAtor, "valor");
        usoCompartilhado = outro;
        acao = { ...acao, usaUsos: true, usosAtual: a0.usosAtual ?? 0, usosMax: (maxNv !== null ? maxNv : (a0.usosMax ?? 0)) + naurenUsosExtrasPara(this.actor, outro, outro.system.usaUsos === true ? "item" : a0.nome), usosReset: a0.usosReset };
      }
    }
    const usaPoolDoItem = item.system.usaUsos === true && !usoCompartilhado && !acao.usosProprios;
    let acaoDoUso;
    if (usaPoolDoItem) {
      const usosMaxPorNivelItem = naurenResolverPorNivel(item.system.usosMaxPorNivel, nivelAtor, "valor");
      acaoDoUso = {
        usosAtual: item.system.usosAtual,
        usosMax: usosMaxPorNivelItem !== null ? usosMaxPorNivelItem : item.system.usosMax,
        usosReset: item.system.usosReset
      };
    } else {
      acaoDoUso = acao;
    }
    // Bônus de Usos condicional (ver campoAcao > usosMaxBonusCondicaoUuid,
    // ex: Fadiga, Empíreo - "+1 uso adicional em Profusão Ousada") - soma
    // em usosMax (preserva a proporção certa mostrada no card) e só na
    // parte de usosAtual que AINDA não foi consumida do bônus neste
    // ciclo (ver usosBonusConsumidoAtual, campoAcao) - "usosAtualBase"
    // guarda o valor ORIGINAL (sem bônus) à parte, porque a hora de
    // consumir (mais abaixo) precisa saber se ainda sobra uso BASE antes
    // de mexer no contador do bônus.
    const usosAtualBase = acaoDoUso.usosAtual ?? 0;
    const usosBonusJaConsumido = acao.usosBonusConsumidoAtual ?? 0;
    let bonusUsosAtivoAtual = 0;
    if (acao.usosMaxBonusCondicaoUuid && this._euTenhoCondicao(acao.usosMaxBonusCondicaoUuid, 1)) {
      bonusUsosAtivoAtual = Math.round(naurenInterpretarModificador(acao.usosMaxBonusQuantidade, this.actor, item)?.valor ?? 0);
      if (bonusUsosAtivoAtual) {
        const bonusRestanteNoCiclo = Math.max(0, bonusUsosAtivoAtual - usosBonusJaConsumido);
        acaoDoUso = { ...acaoDoUso, usosMax: (acaoDoUso.usosMax ?? 0) + bonusUsosAtivoAtual, usosAtual: usosAtualBase + bonusRestanteNoCiclo };
      }
    }

    // Popup de confirmação ANTES de qualquer checagem/gasto (controlado
    // por "usaPopupPreAcao", ligado por padrão) - se o jogador cancelar
    // (ESC/fechar sem confirmar), aborta a Ação inteira aqui mesmo, sem
    // gastar nada. Os ajustes escolhidos (modo, bônus pontuais) ficam
    // guardados em variáveis de instância temporárias pro resto da
    // função (rolagem de ataque/dano) usar - resetadas a cada chamada,
    // igual "#nivelCrescimentoAtual" já faz.
    this.#modoPreAcaoAtual = null;
    this.#bonusAtaqueAdhocAtual = 0;
    this.#bonusDanoAdhocAtual = 0;
    this.#escudoParaAlvoAtual = null;
    this.#danoVerdadeiroAtual = 0;
    // (as fórmulas de dano verdadeiro dos "Efeitos em Ataques" já foram juntadas acima; zeradas no início da Ação)
    this.#bonusAlcanceAdhocAtual = 0;
    this.#bonusAreaAdhocAtual = 0;
    this.#ajusteLimiarDeflexaoAtual = 0;
    this.#consumirRecursosAtual = null;
    this.#trocarPorEspiritoBatalhaAtual = false;
    this.#naoDarDanoAlvoAtual = false;
    this.#naoDarDanoAliadosAtual = false;
    this.#condicoesAdhocUuidsAtual = [];
    this.#atributoAtaqueSubstitutoAtual = "";
    this.#bonusAreaAtaqueEscolhidoAtual = null;
    // Analisar (Análise Paciente) já abre a própria janela, com Cancelar: a confirmação genérica antes
    // dela era uma 2ª janela seguida sem nada a decidir.
    // Ação simples (sem ataque, dano, cura, gasto no alvo, área nem escolha de pagamento): não abre a confirmação.
    const acaoSimplesSemEscolha = !acao.ehAtaque && !(acao.danos ?? []).length && !(acao.curas ?? []).length && !(acao.gastosRecurso ?? []).length
      && !(acao.custosRecursoProprio ?? []).length && !acao.usaTemplate && !(acao.condicoesAplicadas ?? []).some(c => c.ativo !== false)
      && !((acao.custoEstamina ?? 0) > 0 && this._espiritoDeBatalhaInfo()) && !this._buffsProximaAcaoCandidatos(item, acao).length;
    if (this.actor.system.usaPopupPreAcao && !this._acaoGratis && !acao.usaEstudar && !acaoSimplesSemEscolha && !(acao.escolherEfeitoUuids?.length && !acao.ehAtaque && !(acao.danos ?? []).length)) {
      const escolhasPreAcao = await this._popupPreAcao(item, acao);
      if (!escolhasPreAcao) return; // cancelado - não gasta nada
      this.#modoPreAcaoAtual = escolhasPreAcao.modoPreAcao;
      this.#buffsEscolhidosAtual = escolhasPreAcao.buffsUsar ?? null;
      this.#bonusAtaqueAdhocAtual = escolhasPreAcao.bonusAtaqueAdhoc;
      this.#bonusDanoAdhocAtual = escolhasPreAcao.bonusDanoAdhoc;
      this.#bonusAlcanceAdhocAtual = escolhasPreAcao.bonusAlcanceAdhoc;
      this.#bonusAreaAdhocAtual = escolhasPreAcao.bonusAreaAdhoc;
      this.#ajusteLimiarDeflexaoAtual = escolhasPreAcao.ajusteLimiarDeflexao;
      this.#consumirRecursosAtual = escolhasPreAcao.consumir;
      this.#trocarPorEspiritoBatalhaAtual = escolhasPreAcao.trocarPorEspiritoBatalha;
      this.#naoDarDanoAlvoAtual = escolhasPreAcao.naoDarDanoAlvo;
      this.#naoDarDanoAliadosAtual = escolhasPreAcao.naoDarDanoAliados;
      this.#condicoesAdhocUuidsAtual = escolhasPreAcao.condicoesAdhocUuids;
      this.#atributoAtaqueSubstitutoAtual = escolhasPreAcao.atributoAtaqueSubstituto || "";
      this.#bonusAreaAtaqueEscolhidoAtual = escolhasPreAcao.bonusAreaAtaqueEscolhido || null;
    }
    {
      const escolhidos = this.#buffsEscolhidosAtual;
      const usar = this.#proximaAcaoCandidatosAtual.filter(c => !escolhidos || escolhidos.includes(c.id));
      acao = await this._ativarBuffsProximaAcao(acao, usar);
    }

    // Verifica se há recurso suficiente pra pagar os "Gastos de Recurso"
    // desta Ação ANTES de deixar continuar - faltava essa checagem no
    // sistema inteiro (achado num teste de jogador: "Golpe Espiritual"
    // sendo usado mesmo com 0 de Energia). Só verifica quantidade
    // POSITIVA (um custo de verdade - negativa é uma CONCESSÃO, tipo
    // "Canalizar o Espírito" dando Energia, que nunca deveria bloquear).
    // Só consegue verificar fórmulas SIMPLES (número puro, sem dado) -
    // uma fórmula com dado (ex: "1d4") não dá pra saber o custo exato
    // sem rolar primeiro, então essas passam sem checagem prévia (o
    // gasto ainda é cobrado normalmente depois, só sem bloqueio prévio).
    const rankAtualParaCusto = this._rankEfetivo(item);
    for (const g of acao.gastosRecurso ?? []) {
      if (!g.ativo) continue;
      const quantidadeBruta = this._resolverPorRank(g.quantidadePorRank, rankAtualParaCusto, "quantidade") ?? g.quantidade ?? 1;
      const quantidadeNumero = Number(quantidadeBruta);
      if (!Number.isFinite(quantidadeNumero) || quantidadeNumero <= 0) continue; // fórmula com dado, ou concessão negativa - não bloqueia
      if (!NaurenAlvoHelper._podePagar(this.actor, g.recurso, quantidadeNumero)) {
        const nomeRecurso = g.recurso?.startsWith("recursoCustom:")
          ? (this.actor.system.recursosCustom ?? []).find(r => r.id === g.recurso.slice(14))?.nome ?? g.recurso
          : ({ vida: "Vida", estamina: "Estamina de Combate", mana: "Mana", destino: "Dados de Destino", estresse: "Estresse" }[g.recurso] ?? g.recurso);
        ui.notifications.warn(`"${acao.nome || item.name}" precisa de ${quantidadeNumero} ${nomeRecurso}, que você não tem.`);
        return;
      }
    }

    // Modo de Mira: se a Ação precisa de alvo marcado e ainda não tem o
    // suficiente, espera o jogador marcar antes de continuar (em vez de
    // simplesmente desistir mais adiante, dentro de _resolverAlvosDaAcao,
    // como sempre foi o comportamento sem isso ligado).
    // 0.94.1: Ação com "sem alvo, vale em você" (beber um Frasco) não entra no modo de mira sem alvo marcado.
    if (acao.modoAlvo === "selecionado" && this.actor.system.usaModoMira && !(acao.alvoPadraoEu && !game.user.targets.size)) {
      const rankAtualParaAlvos = this._rankEfetivo(item);
      let numeroAlvosNecessarios = this._resolverPorRank(acao.numeroAlvosPorRank, rankAtualParaAlvos, "quantidade") ?? acao.numeroAlvos ?? 1;
      // Bug real corrigido: "Número de Alvos Extra por Crescimento/
      // Escolha" (ver numeroAlvosExtraPorCrescimento, ex: Prisão das
      // Brumas - "X alvos, X = Energia escolhida") só era somado bem
      // mais adiante, dentro de _resolverAlvosDaAcao - esta checagem
      // aqui (que decide quantos alvos PEDIR pro jogador marcar) sempre
      // usava o número BASE (1), nunca o calculado a partir da escolha
      // de recurso/crescimento já feita acima.
      if (acao.numeroAlvosExtraPorCrescimento) {
        const extraAlvos = this._resolverBonusComTokens(acao.numeroAlvosExtraPorCrescimento, acao);
        if (extraAlvos) numeroAlvosNecessarios += extraAlvos;
      }
      const conseguiu = await this._aguardarAlvosNecessarios(numeroAlvosNecessarios, acao.nome || item.name);
      if (!conseguiu) return; // cancelado (ESC)
    }

    // Crescimento: pergunta ANTES de checar custo, já que o nível
    // escolhido pelo jogador MUDA o custo de Mana total desta execução.
    // Reseta pra 0 sempre no início - nunca deve "vazar" de uma Ação pra
    // outra, nem persistir se o jogador cancelar o popup.
    this.#nivelCrescimentoAtual = 0;
    let custoMana = acao.custoMana ?? 0;
    // Mana extra do Crescimento (ver bloco "usaCrescimento" abaixo) - fica
    // SEPARADA de "custoMana" de propósito, porque o jogador ESCOLHEU
    // pagar isso num popup dedicado (o de Crescimento), diferente do
    // custo base da Ação - bug real corrigido: antes as duas viviam
    // somadas na mesma variável, então marcar "Não Consumir Mana" no
    // popup de pré-Ação (pensado só pro custo BASE) também zerava a Mana
    // do Crescimento sem querer, mesmo o jogador tendo confirmado
    // explicitamente que queria pagar aquele custo extra.
    let custoManaCrescimento = 0;
    // Perguntar Quantidade de Mana (ver campoAcao > usaPerguntarQuantidadeMana,
    // ex: Escudo de Mana - "gaste quanto Mana quiser, a barreira sai do
    // dobro disso") - substitui "custoMana" pela escolha do jogador,
    // limitada à Mana atual. Resolvido ANTES de qualquer outra coisa,
    // já que o valor escolhido afeta o resto da execução (Escudo,
    // checagem de recurso suficiente etc.) - cancelar aborta a Ação
    // inteira sem gastar nada, igual outros popups de pré-execução.
    if (acao.usaPerguntarQuantidadeMana) {
      const manaAtualParaPopup = this.actor.system.mana?.value ?? 0;
      let quantidadeEscolhida = null;
      await foundry.applications.api.DialogV2.wait({
        window: { title: `${item.name} — quantidade de Mana` },
        content: `
          <p>Quantos pontos de Mana você quer gastar? (Mana atual: ${manaAtualParaPopup})</p>
          <div class="field"><input type="number" name="quantidadeMana" value="${custoMana}" min="0" max="${manaAtualParaPopup}" autofocus></div>`,
        buttons: [{
          label: "Confirmar", action: "ok", default: true,
          callback: (event, button, dialog) => {
            const valor = Number(dialog.element.querySelector('[name="quantidadeMana"]')?.value ?? custoMana);
            quantidadeEscolhida = Math.max(0, Math.min(manaAtualParaPopup, Math.round(valor)));
          }
        }, { label: "Cancelar", action: "cancelar" }],
        rejectClose: false
      }).catch(() => null);
      if (quantidadeEscolhida === null) return; // cancelado - não gasta nada
      custoMana = quantidadeEscolhida;
      acao = { ...acao, custoMana: quantidadeEscolhida };
    }
    if (acao.usaCrescimento) {
      const custoPorNivelFormula = acao.crescimentoCustoPorNivel || "0";
      const custoPorNivelBase = await NaurenAlvoHelper._rolarFormula(custoPorNivelFormula);
      // Teto de níveis (ver campoAcao > crescimentoMaxNiveis, min 1) - a
      // regra base da Classe Druida é "só pode usar Crescimento uma vez
      // por magia" (Nível 1, "Crescimento"); algumas Habilidades de
      // Subclasse sobem esse teto pra uma Magia específica (ex:
      // apenasUpgrade + campoCustomizado em "crescimentoMaxNiveis").
      // BUG REAL CORRIGIDO: este campo existia no schema desde antes, mas
      // nunca era lido aqui - o popup deixava investir qualquer
      // quantidade de níveis, sem teto nenhum, pra toda Magia com
      // Crescimento ligado.
      // Soma "crescimentoMaxNivelExtra" de toda Condição/Efeito ATIVO do
      // Ator (ver NaurenCondicaoData) - cobre bônus que valem pra
      // QUALQUER Ação com Crescimento enquanto durar, sem precisar saber
      // qual Magia de antemão (ex: Forma Arauto Lunar, Druida - "Pode
      // usar Crescimento duas vezes por magia").
      let maxNiveisExtra = 0;
      for (const i of this.actor.items) {
        if ((i.type !== "condicao" && i.type !== "efeito") || !i.system.ativo || !i.system.crescimentoMaxNivelExtra) continue;
        maxNiveisExtra += Math.round(naurenInterpretarModificador(i.system.crescimentoMaxNivelExtra, this.actor, i)?.valor ?? 0);
      }
      // Regra do livro (Druida, nível 1): Crescimento 1 vez por magia; a Forma Arauto Lunar soma +1 (2 vezes).
      // O antigo padrão 99 ("sem teto") vale como 1; um valor menor que 99 numa Ação continua valendo.
      let baseNiveis = Math.floor(Number(acao.crescimentoMaxNiveis) || 1);
      if (baseNiveis >= 99) baseNiveis = 1;
      const maxNiveis = Math.max(1, baseNiveis + maxNiveisExtra);
      let nivelEscolhido = 0;
      await foundry.applications.api.DialogV2.wait({
        window: { title: `${acao.nome} · Crescimento` }, classes: ["nauren-janela-movimento"], position: { width: 400 },
        content: `<div class="nauren-mov">
            <div class="nauren-mov-resumo">
              <div><span>Por nível</span><b>+${custoPorNivelBase} Mana</b></div>
              <div><span>Máximo</span><b>${maxNiveis} ${maxNiveis > 1 ? "níveis" : "nível"}</b></div>
              <div><span>Sua Mana</span><b>${this.actor.system.mana?.value ?? 0}</b></div>
            </div>
            <p class="nauren-mov-aviso" style="margin:0;">${(() => {
              // Mostra o que cada nível dá, tirado do "Crescimento: ..." da própria descrição.
              const d = document.createElement("div"); d.innerHTML = String(item.system.descricao ?? "").replace(/<\/(p|div|li|h\d)>|<br\s*\/?>/gi, " $&");
              const t = (d.textContent ?? "").replace(/\s+/g, " ");
              const i = t.search(/Crescimento:/i);
              if (i < 0) return `O bônus de cada nível está na descrição da própria ${item.type === "magia" ? "Magia" : "Habilidade"}.`;
              const resto = t.slice(i + 12).trim();
              const fim = resto.search(/\.(\s|$)/);
              const frase = (fim >= 0 ? resto.slice(0, fim) : resto).slice(0, 200);
              return `<b>Cada nível:</b> ${frase.replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c])}.`;
            })()}</p>
            <div class="nauren-mov-ajuste nauren-cresc-seletor"><span>Níveis de Crescimento</span><button type="button" data-delta="-1">−</button><b class="nauren-mov-ajuste-valor" id="nauren-crescimento-valor">0</b><button type="button" data-delta="1">+</button></div>
            <input type="hidden" id="nauren-crescimento-input" value="0">
            <p id="nauren-crescimento-custo-total" class="nauren-cresc-total">Mana extra: <b>0</b></p>
          </div>`,
        buttons: [
          { label: "Confirmar", action: "ok", default: true, callback: (event, button, dialog) => {
            const root = dialog?.element ?? button?.form ?? event?.currentTarget?.form;
            const input = root?.querySelector?.("#nauren-crescimento-input");
            nivelEscolhido = Math.min(maxNiveis, Math.max(0, Math.floor(Number(input?.value) || 0)));
          }},
          { label: "Sem Crescimento", action: "cancelar" }
        ],
        rejectClose: false,
        render: (event, dialog) => {
          const root = dialog.element;
          const input = root.querySelector("#nauren-crescimento-input");
          const valor = root.querySelector("#nauren-crescimento-valor");
          const texto = root.querySelector("#nauren-crescimento-custo-total");
          const atualizar = () => {
            const n = Math.min(maxNiveis, Math.max(0, Math.floor(Number(input?.value) || 0)));
            input.value = String(n); valor.textContent = String(n);
            texto.innerHTML = `Mana extra: <b>${custoPorNivelBase * n}</b>`;
          };
          root.querySelectorAll(".nauren-cresc-seletor button").forEach(b => b.addEventListener("click", () => { input.value = String(Number(input.value) + Number(b.dataset.delta)); atualizar(); }));
          atualizar();
        }
      }).catch(() => null);

      const nivel = nivelEscolhido;
      this.#nivelCrescimentoAtual = nivel;
      if (nivel > 0) {
        const custoExtra = custoPorNivelBase;
        let custoTotalExtra = custoExtra * nivel;
        // Cultivar a Utopia (Druida - Crescimento): "seu primeiro uso de
        // Crescimento em cada rodada não custa Mana extra" - reaproveita o
        // mesmo contador de "Usos Passivos" (usaUsosPassiva) que outras
        // Habilidades passivas já usam, com reset "rodada" - achando a
        // Habilidade com 1+ uso sobrando (identificada por flag, não por
        // nome, pra funcionar mesmo se for renomeada), zera o custo extra
        // desta vez e consome o uso.
        const utopiaAtiva = this.actor.items.find(i => i.type === "habilidade" && i.system.ativo &&
          i.system.usaUsosPassiva && (i.system.usosPassivaAtual ?? 0) > 0 && (i.getFlag("nauren", "cultivarAUtopia") === true || naurenEhItem(i, "Cultivar a Utopia")));
        if (utopiaAtiva) {
          custoTotalExtra = 0;
          await utopiaAtiva.update({ "system.usosPassivaAtual": Math.max(0, (utopiaAtiva.system.usosPassivaAtual ?? 1) - 1) });
          naurenPostarCard({
            ator: this.actor, titulo: utopiaAtiva.name, icone: utopiaAtiva.img, fonte: `Custo de Crescimento • ${item.name}`,
            linhas: [{ label: "Mana extra do Crescimento", value: "0 (sem custo neste uso)" }]
          });
        }
        custoManaCrescimento += custoTotalExtra;
        // Contexto extra (ver "soSeCura"/campoGatilho): permite reagir só
        // quando o Crescimento foi usado numa Ação de CURA especificamente
        // (ex: Forma Sábio dos Matos, Druida - "ao usar Crescimento numa
        // magia de cura...").
        const ehAcaoDeCura = naurenAcaoEhCura(acao); // inclui "marcada como cura" (ex.: Infusão Floral cura pela Condição)
        naurenProcessarGatilhos("usoCrescimento", this.actor, { itemUsadoUuid: item.uuid, acaoNome: acao.nome, tipoItemUsado: item.type, ehCura: ehAcaoDeCura })
          .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (uso de Crescimento).", err));
      }
    }

    // Consumo seletivo (ver "usaPopupPreAcao"/"_popupPreAcao"): se o
    // jogador desmarcou "consumir" pra um recurso específico no popup
    // (ou marcou o master "Não Consumir Nenhum"), tanto a CHECAGEM de
    // "tem o suficiente" quanto o DESCONTO em si são pulados pra aquele
    // recurso - não faz sentido exigir ter Estamina suficiente pra algo
    // que você decidiu não vai gastar de verdade. "null" (popup
    // desligado, ou não apareceu) = comportamento normal de sempre.
    if (this._acaoGratis) this.#consumirRecursosAtual = { ...(this.#consumirRecursosAtual ?? {}), estamina: false, mana: false, uso: false, carga: false };
    const consomeEstamina = this.#consumirRecursosAtual?.estamina !== false;
    const consomeMana = this.#consumirRecursosAtual?.mana !== false;
    const consomeUso = this.#consumirRecursosAtual?.uso !== false;
    const consomeCarga = this.#consumirRecursosAtual?.carga !== false;

    // Troca de Estamina por Espírito da Batalha (Guerreiro, ver popup de
    // pré-Ação) - quando marcada, o custo de Estamina desta Ação (mesmo
    // valor numérico) é pago com Espírito da Batalha em vez de Estamina.
    // Recalcula "espiritoInfo" AQUI (não reaproveita o do popup) porque
    // pode ter passado tempo entre abrir o popup e confirmar.
    // Recarga grátis (ex.: Gatilho rápido: a 1ª Recarga do combate não custa Estamina).
    this._naurenRecargaGratis = false;
    if (acao.recarregaUsos && (acao.recarregaGratisPorCena ?? 0) > 0 && (acao.custoEstamina ?? 0) > 0) {
      const reg = item.getFlag("nauren", "recargaGratis") ?? {};
      const chave = game.combat?.started ? game.combat.id : "fora";
      const usadas = reg.combate === chave ? (reg.usadas ?? 0) : 0;
      if (usadas < acao.recarregaGratisPorCena) { acao = { ...acao, custoEstamina: 0 }; this._naurenRecargaGratis = { chave, usadas: usadas + 1 }; }
    }
    const custoEstOriginal = acao.custoEstamina ?? 0;
    const usarEspiritoBatalha = this.#trocarPorEspiritoBatalhaAtual && custoEstOriginal > 0;
    const espiritoInfoAtual = usarEspiritoBatalha ? this._espiritoDeBatalhaInfo() : null;
    if (usarEspiritoBatalha && (!espiritoInfoAtual || espiritoInfoAtual.usosRestantes <= 0 || espiritoInfoAtual.valorAtual < custoEstOriginal)) {
      ui.notifications.warn(`Não foi possível trocar por Espírito da Batalha (usos ou reserva insuficientes) - use Estamina normalmente, ou cancele.`);
      return;
    }

    const custoEst = (consomeEstamina && !usarEspiritoBatalha) ? custoEstOriginal : 0;
    const estAtual = this.actor.system.estaminaCombate.value;
    const manaAtual = this.actor.system.mana.value;
    const custoManaReal = (consomeMana ? custoMana : 0) + custoManaCrescimento;

    // Limite de Alcance (ver campoAcao > alcance) - bug real corrigido:
    // pra "modoAlvo: selecionado", ficar fora de alcance só pulava
    // aquele alvo específico DEPOIS de já ter gasto Mana/Estamina (ver
    // NaurenAlvoHelper#_resolverAlvosDaAcao mais abaixo), sem nenhum
    // aviso claro na tela - só uma linha discreta no card do chat.
    // Agora checa AQUI, ANTES de qualquer recurso ser descontado
    // (depois que Condensar Magia/etc já tiveram a chance de somar
    // bônus de alcance) - fora de alcance ABORTA a Ação inteira, sem
    // gastar nada, com aviso visível na tela.
    // Fase 7: "mover antes" (ex.: Investida) - vai até o alvo antes de
    // checar o alcance e rolar o ataque.
    // Mover os ALVOS nunca é "antes": eles reagem primeiro (e podem resistir).
    if (acao.usaMoverEscolhendo && acao.moverMomento === "antes" && acao.moverQuem !== "alvo") {
      const alvosAntes = Array.from(game.user.targets ?? []).map(t => t.document);
      await this._moverEscolhendo(item, acao, alvosAntes);
    }
    if (acao.modoAlvo === "selecionado") {
      const alvoParaAlcance = Array.from(game.user.targets)[0];
      const meuTokenParaAlcance = canvas.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
      const alcanceEfetivo = this._calcularAlcanceEfetivo(acao, item);
      if (alvoParaAlcance && meuTokenParaAlcance && alcanceEfetivo !== null) {
        let distancia = 0;
        try { distancia = naurenMedirDistanciaBordas(meuTokenParaAlcance, alvoParaAlcance); } catch (err) { distancia = 0; }
        if (distancia > alcanceEfetivo) {
          ui.notifications.warn(`"${item.name}" está fora de alcance! O alvo está a ${Math.round(distancia)}m, mas o alcance é de ${alcanceEfetivo}m.`);
          return;
        }
      }
    }

    // Fase 6 (Rc): custos pagos com outro recurso (Condição/Efeito ativo).
    let custoEstPagar = custoEst;
    let custoManaPagar = custoManaReal;
    if (item.type === "magia" && custoManaPagar > 0) {
      const ajM = naurenAjusteCustoManaMagia(this.actor, item, acao, false);
      if (ajM.linhas.length) {
        const antesM = custoManaReal;
        custoManaPagar = Math.max(ajM.minimo, custoManaPagar + ajM.delta);
        this.#efeitosEmAtaquesAtual.push({ label: "Custo de Mana ajustado", value: `${antesM} → ${custoManaPagar}`, breakdown: ajM.linhas.join(", ") });
      }
    }
    const pagamentosAlternativos = [];
    // Fase 7: reduções de custo de Estamina por tipo de Ação.
    const reducoesCusto = [];
    // Preparação: as N primeiras Ações da 1ª rodada do combate saem sem Estamina.
    if (game.combat?.started && game.combat.round === 1 && custoEstPagar > 0) {
      const gratis = this.actor.items.filter(i => i.type === "habilidade" && i.system.ativo !== false && Number(i.system.acoesGratisPrimeiraRodada))
        .reduce((soma, i) => soma + Number(i.system.acoesGratisPrimeiraRodada) * Math.max(1, i.system.rankAtual || 1), 0);
      if (gratis > 0) {
        // Conta também em memória: a flag do Foundry pode ainda não ter
        // chegado quando a próxima Ação começa.
        const chavePrep = `${this.actor.uuid}|${game.combat.id}`;
        const marca = this.actor.getFlag("nauren", "preparacao") ?? {};
        const usadasFlag = marca.combate === game.combat.id ? (marca.usadas ?? 0) : 0;
        const usadas = Math.max(usadasFlag, naurenPreparacaoUsadas.get(chavePrep) ?? 0);
        if (usadas < gratis) {
          naurenPreparacaoUsadas.set(chavePrep, usadas + 1);
          reducoesCusto.push({ fonte: `Preparação ${usadas + 1}/${gratis}`, de: custoEstPagar, para: 0 });
          custoEstPagar = 0;
          await this.actor.setFlag("nauren", "preparacao", { combate: game.combat.id, usadas: usadas + 1 });
        }
      }
    }
    for (const fonte of this.actor.items) {
      const ativo = fonte.type === "condicao" ? fonte.system.ativo !== false
        : fonte.type === "habilidade" ? fonte.system.ativo !== false
        : (fonte.type === "efeito" && fonte.system.ativo);
      if (!ativo) continue;
      for (const r of fonte.system.reduzCustoEstamina ?? []) {
        if (r.tipoItem && r.tipoItem !== item.type) continue;
        if (r.soItemNome && !item.name.toLowerCase().includes(String(r.soItemNome).toLowerCase())) continue;
        if (r.soCategoriaArma && (!acao.ehAtaque || naurenCategoriaDaArma(item.type === "arma" ? item : this.#armaEscolhidaAtual) !== r.soCategoriaArma)) continue;
        if (r.soCura && !naurenAcaoEhCura(acao)) continue;
        if (!(custoEstPagar > 0)) continue;
        const q = Math.max(0, Math.round(naurenAvaliarExpressaoSimples(String(r.quantidade || "0").replace(/@rank\b/gi, String(fonte.system.rankAtual ?? 0))) || 0));
        const minimo = Math.max(0, Math.round(Number(r.minimo) || 0));
        const antes = custoEstPagar;
        custoEstPagar = Math.max(minimo, custoEstPagar - q);
        if (custoEstPagar < antes) reducoesCusto.push({ fonte: fonte.name, de: antes, para: custoEstPagar });
      }
    }
    for (const fonte of this.actor.items) {
      const ativo = fonte.type === "condicao" ? fonte.system.ativo !== false : (fonte.type === "efeito" && fonte.system.ativo);
      if (!ativo) continue;
      for (const regra of fonte.system.pagarCustoCom ?? []) {
        if (regra.tipoItem && regra.tipoItem !== item.type) continue;
        const base = regra.custo === "estamina" ? custoEstPagar : custoManaPagar;
        if (!(base > 0) || !regra.recurso) continue;
        const mult = Number(naurenAvaliarExpressaoSimples(String(regra.multiplicador || "1"))) || 1;
        const quantidade = Math.ceil(base * mult);
        pagamentosAlternativos.push({ recurso: regra.recurso, quantidade, fonte: fonte.name, de: `${base} ${regra.custo === "estamina" ? "Estamina" : "Mana"}` });
        if (regra.custo === "estamina") custoEstPagar = 0; else custoManaPagar = 0;
      }
    }
    for (const pg of pagamentosAlternativos) {
      const disponivel = Number(naurenResolverTokenFormula(pg.recurso, this.actor)) || 0;
      if (disponivel < pg.quantidade) {
        ui.notifications.warn(`"${pg.fonte}": custo pago com ${naurenNomeRecurso(this.actor, pg.recurso)}, mas você tem ${disponivel} (precisa de ${pg.quantidade}).`);
        return;
      }
    }
    // Lutar com duas armas (Cap. "Lutando com duas armas"): com duas armas leves/médias equipadas
    // (não arcos), 2 Ataques Básicos por 1 de Estamina - o 2º, com a OUTRA arma no mesmo turno, sai sem custo.
    {
      const ehBasicoDeArma = item.type === "arma" && acao.ehAtaque && !/pesad/i.test(String(acao.nome ?? ""));
      const armasDuplas = this.actor.items.filter(i => i.type === "arma" && i.system.equipado && ["Leve", "Média"].includes(i.system.categoria));
      const combate = game.combat?.started ? game.combat : null;
      if (ehBasicoDeArma && combate && armasDuplas.length >= 2 && ["Leve", "Média"].includes(item.system.categoria)) {
        const chaveTurno = `${combate.id}:${combate.round}:${combate.turn}`;
        const anterior = naurenDuasArmasPendente.get(this.actor.uuid);
        if (anterior && anterior.turno === chaveTurno && anterior.armaId !== item.id && custoEstPagar > 0) {
          custoEstPagar = 0;
          naurenDuasArmasPendente.delete(this.actor.uuid);
          this.#efeitosEmAtaquesAtual.push({ label: "Duas armas", value: "2º ataque sem custo", breakdown: `o 1º foi com ${anterior.armaNome}` });
        } else if (custoEstPagar > 0) {
          naurenDuasArmasPendente.set(this.actor.uuid, { turno: chaveTurno, armaId: item.id, armaNome: item.name });
        }
      }
    }
    // Amedrontado/Pânico/Pavor: ações custam +1/+2/+3 de Estamina (só em ações que já custam Estamina).
    {
      const condExtra = this.actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && !naurenEhCondicaoModelo(i) && (i.system.custoEstaminaExtraAcoes || 0) > 0);
      const extra = condExtra.reduce((t, i) => Math.max(t, i.system.custoEstaminaExtraAcoes || 0), 0) /* estágios do mesmo medo: vale o maior, não a soma */;
      if (extra && custoEstPagar > 0) {
        custoEstPagar += extra;
        this.#efeitosEmAtaquesAtual.push({ label: "Custo aumentado", value: `+${extra} Estamina`, breakdown: condExtra.map(i => i.name).join(", ") });
      }
    }
    // Cargas de área (ex.: Pintura da Alegria): aliados dentro dela podem pagar Estamina com as cargas.
    if (custoEstPagar > 0) {
      const meuTokC = this.actor.getActiveTokens?.(true)?.[0];
      const minhaDisp = meuTokC?.document?.disposition;
      const regioesC = meuTokC ? (canvas.scene?.regions ?? []).filter(r => {
        const cfgR = r.getFlag("nauren", "templatePersistente");
        return (cfgR?.cargasEstamina ?? 0) > 0 && cfgR.disposicaoOrigem === minhaDisp && naurenPontoDentroDaRegiao(meuTokC.center, r, meuTokC.document);
      }) : [];
      for (const regiaoC of regioesC) {
        if (custoEstPagar <= 0) break;
        const cfgR = regiaoC.getFlag("nauren", "templatePersistente");
        const maxUso = Math.min(custoEstPagar, cfgR.cargasEstamina);
        const usar = await foundry.applications.api.DialogV2.wait({ window: { title: regiaoC.name },
          content: `<p>Usar cargas de <b>${regiaoC.name}</b> no lugar de Estamina? (${cfgR.cargasEstamina} disponível(is); custo ${custoEstPagar})</p><input type="number" name="n" value="${maxUso}" min="1" max="${maxUso}" style="width: 100%;">`,
          buttons: [{ action: "sim", label: "Usar", callback: (ev, btn) => Math.min(maxUso, Math.max(1, Number(btn.form.elements.n.value) || 1)) }, { action: "nao", label: "Não" }], rejectClose: false }).catch(() => "nao");
        const n = Number(usar) || 0;
        if (!n) continue;
        custoEstPagar -= n;
        const restam = cfgR.cargasEstamina - n;
        const gm = game.users.activeGM;
        if (regiaoC.isOwner) { if (restam <= 0) await regiaoC.delete(); else await regiaoC.setFlag("nauren", "templatePersistente", { ...cfgR, cargasEstamina: restam }); }
        else if (gm) await gm.query(NAUREN_QUERY_ITEM_MESTRE, { tipo: "regiaoCargas", itemUuid: regiaoC.uuid, dados: { cargas: restam } }, { timeout: 15000 }).catch(() => null);
        naurenPostarCard({ ator: this.actor, titulo: regiaoC.name, icone: "icons/magic/control/silhouette-aura-energy.webp", fonte: "Cargas da área",
          linhas: [
            { label: "Usou", value: `${n} carga(s)`, breakdown: `${this.actor.name}, no lugar de Estamina (${item.name})` },
            { label: "Restam", value: restam > 0 ? `${restam} carga(s)` : "0: a pintura se esgotou e some" }
          ] });
      }
    }
    if (estAtual < custoEstPagar || manaAtual < custoManaPagar) {
      ui.notifications.warn(`Recursos insuficientes para "${acao.nome}"! (Precisa de ${custoEst} Estamina / ${custoManaReal} Mana)`);
      return;
    }

    // Custo de Recurso Próprio (ver campoAcao > custosRecursoProprio, ex:
    // Golpe Espiritual - "2 Energia") - equivalente de Estamina/Mana pra
    // Recursos Customizados: verificado/bloqueado AQUI (antes de
    // executar), descontado de VOCÊ MESMO logo abaixo. Resolve "por
    // rank" e "@atacouNesteTurno" na hora, igual outros campos desta
    // função já fazem.
    const custosRecursoProprioResolvidos = [];
    const listaCustosProprio = acao.custosRecursoProprio ?? [];
    for (let i = 0; i < listaCustosProprio.length; i++) {
      const c = listaCustosProprio[i];
      if (!c.ativo || !c.recurso) continue;
      if (!this._condicaoParaAtivarPassou(c.condicaoParaAtivar, acao)) continue;
      if (this.#consumirRecursosAtual?.[`custoProprio_${i}`] === false) continue; // desmarcado no popup de pré-Ação
      let formulaQtd = this._resolverPorRank(c.quantidadePorRank, rankAtualParaCusto, "quantidade") ?? c.quantidade ?? "1";
      if (/@atacouNesteTurno\b/.test(formulaQtd)) formulaQtd = formulaQtd.replace(/@atacouNesteTurno\b/g, this.#atacouNesteTurnoAtual ? "1" : "0");
      if (/@quantidadeEscolhida\b/.test(formulaQtd)) formulaQtd = formulaQtd.replace(/@quantidadeEscolhida\b/g, String(this.#quantidadeRecursoEscolhidaAtual));
      // Custo com dado (ex.: penitência "1d6 de Vida"): rola.
      let quantidade;
      let rolagemCusto = "";
      if (/\d*d\d+/i.test(formulaQtd)) {
        const formulaRolavel = formulaQtd.replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, this.actor)));
        const rollCusto = await new Roll(formulaRolavel).evaluate().catch(() => null);
        if (rollCusto && game.dice3d) await game.dice3d.showForRoll(rollCusto, game.user, true).catch(() => {});
        quantidade = Math.max(0, Math.round(rollCusto?.total ?? 0));
        rolagemCusto = rollCusto ? `${naurenFormulaParaTexto(formulaQtd, this.actor)} → ${naurenTextoRolagem(rollCusto)}` : "";
      } else {
        quantidade = Math.round(naurenInterpretarModificador(formulaQtd, this.actor)?.valor ?? 0);
      }
      if (quantidade <= 0) {
        // "Gastar todos os pontos" (custo = @recurso_<id>) sem nenhum ponto: não há o que descarregar.
        const soTodos = String(c.quantidade ?? "").trim().match(/^@recurso_(\w+)$/);
        if (soTodos) {
          const rTodos = (this.actor.system.recursosCustom ?? []).find(r => r.id === soTodos[1]);
          ui.notifications.warn(`"${acao.nome || item.name}": você não tem ${rTodos?.nome ?? "pontos"} para gastar.`);
          return;
        }
        continue;
      }
      // Suporta Recurso Customizado ("recursoCustom:ID") e os recursos
      // fixos - ex: Benedictio (Penitência), Condemnatio (Penitência),
      // Sanatio (Penitência), Sacerdote: dano/estresse "EM VOCÊ MESMO"
      // usa isto em vez de um Recurso Customizado.
      const idCustom = c.recurso.startsWith("recursoCustom:") ? c.recurso.slice(14) : null;
      // Chaves curtas ("estamina"/"destino"), consistentes com
      // RECURSOS_ALVO e o dropdown desta Ação na ficha - mapeadas pro
      // nome de campo interno correto. "estresse" é tratado à parte
      // logo abaixo: tem semântica invertida (é um custo que AUMENTA,
      // limitado pelo máximo - nunca "falta" pra pagar algo), então
      // pula a checagem "tem o suficiente?" que os outros usam.
      const camposFixos = { vida: "vida", mana: "mana", estamina: "estaminaCombate", destino: "dadosDestino" };
      const campoFixo = camposFixos[c.recurso];
      if (c.recurso === "estresse") {
        custosRecursoProprioResolvidos.push({ recurso: c.recurso, quantidade, nome: RECURSOS_ALVO.estresse });
        continue;
      }
      const entrada = idCustom ? (this.actor.system.recursosCustom ?? []).find(r => r.id === idCustom) : null;
      const valorAtualRecurso = idCustom ? (entrada?.valor ?? 0) : campoFixo ? (this.actor.system[campoFixo]?.value ?? 0) : 0;
      const nomeRecurso = entrada?.nome ?? naurenNomeDoRecurso(null, c.recurso);
      if (valorAtualRecurso < quantidade) {
        ui.notifications.warn(`"${acao.nome}" precisa de ${quantidade} de ${nomeRecurso}, que você não tem.`);
        return;
      }
      custosRecursoProprioResolvidos.push({ recurso: c.recurso, quantidade, nome: nomeRecurso, rolagem: rolagemCusto });
    }

    // "Usos por Turno/Rodada" só bloqueia e desconta quando o Ator está
    // de fato numa Ordem de Combate ativa (ver USOS_RESET_POR_COMBATE e
    // _atorEstaEmCombateAtivo) - fora de combate (testando a ficha, ou
    // uma cena sem iniciativa rolada), esses dois tipos de "usosReset"
    // ficam ilimitados; "cena"/"dia" continuam normais em qualquer caso.
    const aplicaLimiteDeUsos = !USOS_RESET_POR_COMBATE.has(acaoDoUso.usosReset) || this._atorEstaEmCombateAtivo();

    if (consomeUso && acao.usaUsos && aplicaLimiteDeUsos && (acaoDoUso.usosAtual ?? 0) <= 0) {
      ui.notifications.warn(`"${acao.nome}" não tem usos restantes! (Recarrega ${USOS_RESET_LABEL[acaoDoUso.usosReset] ?? acaoDoUso.usosReset})`);
      return;
    }
    // Fase 7: item com Usos (passivos) e Ação sem usos próprios - usar a
    // Ação gasta 1 uso do item (ex.: Julgamento Dourado, 1 por cena).
    const usaPoolPassivo = consomeUso && item.system.usaUsosPassiva && !acao.usaUsos && !usaPoolDoItem;
    const aplicaLimitePassivo = usaPoolPassivo && (!USOS_RESET_POR_COMBATE.has(item.system.usosPassivaReset) || this._atorEstaEmCombateAtivo());
    if (aplicaLimitePassivo && (item.system.usosPassivaAtual ?? 0) <= 0) {
      ui.notifications.warn(`"${item.name}" não tem usos restantes! (Recarrega ${USOS_RESET_LABEL[item.system.usosPassivaReset] ?? item.system.usosPassivaReset})`);
      return;
    }

    let cargasRestantes = null;
    let cargaViaConsumivel = null; // { consumivel, novaQuantidade } - preenchido só quando cargasFonte="consumivel"
    if (consomeCarga && acao.usaCargas && acao.consumirCargaAoUsar) {
      const custoCargas = acao.cargasCustoPorUso ?? 1;
      if (acao.cargasFonte === "consumivel") {
        const consumivel = acao.cargasConsumivelId ? this.actor.items.get(acao.cargasConsumivelId) : null;
        if (!consumivel) {
          ui.notifications.warn(`"${acao.nome}" está configurada pra usar um Consumível da ficha como munição, mas ele não foi encontrado (pode ter sido removido do inventário).`);
          return;
        }
        const qtdAtual = consumivel.system.quantidade ?? 0;
        if (qtdAtual < custoCargas) {
          ui.notifications.warn(`Sem "${consumivel.name}" suficiente pra usar "${acao.nome}"! (Precisa de ${custoCargas}, tem ${qtdAtual})`);
          return;
        }
        cargaViaConsumivel = { consumivel, novaQuantidade: qtdAtual - custoCargas };
      } else {
        const cargasAtuais = acao.cargasAtual ?? 0;
        if (cargasAtuais < custoCargas) {
          ui.notifications.warn(`"${acao.nome}" não tem cargas suficientes! (Precisa de ${custoCargas}, tem ${cargasAtuais})`);
          return;
        }
        cargasRestantes = cargasAtuais - custoCargas;
      }
    }

    // Bug real corrigido (v0.7.220 quebrado de novo pelo schema): o
    // campo "usosAtual" tem "min: 0" no schema, então qualquer tentativa
    // de salvar um valor negativo nele (pra "lembrar" quanto do bônus
    // condicional já foi gasto além do disponível) era silenciosamente
    // travada em 0 pelo próprio Foundry na hora do "item.update()" - o
    // bug de "uso infinito em Profusão Ousada" continuava do mesmo jeito
    // por baixo dessa tentativa de fix. Correção de verdade: consome
    // primeiro do uso BASE (usosAtualBase, sempre >= 0, normal) e só
    // quando ele já chegou a 0 é que passa a consumir de
    // "usosBonusConsumidoAtual" (também sempre >= 0, campo NOVO e
    // separado) - nenhum dos dois contadores precisa ir negativo.
    const consomeAgora = consomeUso && acao.usaUsos && aplicaLimiteDeUsos;
    let usosAtualBaseNovo = usosAtualBase;
    let usosBonusConsumidoNovo = usosBonusJaConsumido;
    if (consomeAgora) {
      if (usosAtualBase > 0) usosAtualBaseNovo = usosAtualBase - 1;
      else usosBonusConsumidoNovo = usosBonusJaConsumido + 1;
    }
    const usosRestantes = consomeAgora ? (usosAtualBaseNovo + Math.max(0, bonusUsosAtivoAtual - usosBonusConsumidoNovo)) : null;

    // Foto do que vai ser gasto: se a área for cancelada depois (botão direito, fora de alcance,
    // ninguém dentro), tudo volta (antes a Energia/Estamina/usos ficavam perdidos).
    this.#snapshotCustoAtual = {
      est: this.actor.system.estaminaCombate?.value, mana: this.actor.system.mana?.value, stress: this.actor.system.stress?.value,
      recursos: foundry.utils.deepClone(this.actor.system.recursosCustom ?? []),
      itens: [item, usoCompartilhado].filter(Boolean).map(i => ({ i, acoes: foundry.utils.deepClone(i.system.acoes ?? []), usosAtual: i.system.usosAtual, usosPassivaAtual: i.system.usosPassivaAtual })),
      consumivel: cargaViaConsumivel ? { doc: cargaViaConsumivel.consumivel, qtd: cargaViaConsumivel.consumivel.system.quantidade } : null
    };

    // Persiste os gastos desta Ação especificamente (índice dela na lista)
    if (cargasRestantes !== null || consomeAgora || custoEst > 0 || custoManaReal > 0 || pagamentosAlternativos.length) {
      const updates = {};
      if (consomeAgora && usoCompartilhado) {
        if (usoCompartilhado.system.usaUsos === true) await usoCompartilhado.update({ "system.usosAtual": usosAtualBaseNovo });
        else {
          const acoesOutro = foundry.utils.deepClone(usoCompartilhado.system.acoes);
          acoesOutro[0].usosAtual = usosAtualBaseNovo;
          await usoCompartilhado.update({ "system.acoes": acoesOutro });
        }
      }
      if (cargasRestantes !== null || (consomeAgora && !usaPoolDoItem && !usoCompartilhado)) {
        const acoesClonadas = foundry.utils.deepClone(item.system.acoes);
        if (cargasRestantes !== null) acoesClonadas[idx].cargasAtual = cargasRestantes;
        if (consomeAgora && !usaPoolDoItem && !usoCompartilhado) {
          acoesClonadas[idx].usosAtual = usosAtualBaseNovo;
          acoesClonadas[idx].usosBonusConsumidoAtual = usosBonusConsumidoNovo;
        }
        updates["system.acoes"] = acoesClonadas;
      }
      if (consomeAgora && usaPoolDoItem) updates["system.usosAtual"] = usosAtualBaseNovo;
      if (consomeUso && (acao.custoUsosItem ?? 0) > 0 && item.system.usaUsos)
        updates["system.usosAtual"] = Math.max(0, (updates["system.usosAtual"] ?? item.system.usosAtual ?? 0) - acao.custoUsosItem);
      if (Object.keys(updates).length) await item.update(updates);
    }
    if (registroPorAlvo) await item.setFlag("nauren", "usosPorAlvo", registroPorAlvo).catch(() => {});
    let linhaUsosPassivo = null;
    if (aplicaLimitePassivo) {
      await item.update({ "system.usosPassivaAtual": Math.max(0, (item.system.usosPassivaAtual ?? 1) - 1) });
      linhaUsosPassivo = { label: "Usos", value: `${Math.max(0, (item.system.usosPassivaAtual ?? 0))} restante(s)`, breakdown: USOS_RESET_LABEL[item.system.usosPassivaReset] ?? "" };
    }
    if (cargasRestantes !== null || consomeAgora || custoEst > 0 || custoManaReal > 0 || pagamentosAlternativos.length) {
      if (custoEstPagar > 0 || custoManaPagar > 0) {
        await this.actor.update({
          "system.estaminaCombate.value": estAtual - custoEstPagar,
          "system.mana.value": manaAtual - custoManaPagar
        });
      }
      for (const pg of pagamentosAlternativos) await naurenConcederRecurso(this.actor, pg.recurso, String(-pg.quantidade), item);
    }
    if (cargaViaConsumivel) {
      await cargaViaConsumivel.consumivel.update({ "system.quantidade": cargaViaConsumivel.novaQuantidade });
    }

    // Custo de Recurso Próprio (ver acima) - desconta de VOCÊ MESMO
    // (nunca do alvo), com notificação de chat privada.
    const linhasCustoRolado = [];
    for (const c of custosRecursoProprioResolvidos) {
      if (c.rolagem) linhasCustoRolado.push({ label: `Custo em você (${c.nome})`, value: c.quantidade, breakdown: c.rolagem });
      await NaurenAlvoHelper._aplicarRecursoNoAlvo(this.actor, c.recurso, c.quantidade);
      // "estresse" AUMENTA (não diminui) quando usado como Custo de
      // Recurso Próprio - a notificação precisa do sinal certo pra
      // dizer "ganhou", não "perdeu".
      // O custo vai no próprio card da Ação (linha "Custo"), em vez de um card separado por recurso.
    }

    // Troca de Estamina por Espírito da Batalha (Guerreiro) - desconta a
    // barra (Recurso Customizado "espiritodabatalha") e o "uso" da
    // troca (contador que reseta no início do seu turno), em vez de
    // Estamina, e concede 1 Estresse automaticamente se a barra zerar.
    const linhasEspiritoPago = [];
    if (usarEspiritoBatalha) {
      const recursosClonados = foundry.utils.deepClone(this.actor.system.recursosCustom ?? []);
      const entrada = recursosClonados.find(r => r.id === "espiritodabatalha");
      if (entrada) {
        const valorAntes = entrada.valor ?? 0;
        entrada.valor = Math.max(0, valorAntes - custoEstOriginal);
        await this.actor.update({ "system.recursosCustom": recursosClonados });
        // Vai no próprio card da Ação (sem card extra de "Perda").
        linhasEspiritoPago.push({ label: "Pagou com Espírito da Batalha", value: `${custoEstOriginal}`, breakdown: `no lugar da Estamina · resta ${entrada.valor}` });
        if (entrada.valor <= 0 && valorAntes > 0) {
          const stressAtual = this.actor.system.stress?.value ?? 0;
          const stressMax = this.actor.system.stress?.max ?? 2;
          await this.actor.update({ "system.stress.value": Math.min(stressMax, stressAtual + 1) });
          linhasEspiritoPago.push({ label: "Espírito da Batalha esgotado", value: "+1 Estresse" });
        }
      }
      const acoesEspiritoClonadas = foundry.utils.deepClone(espiritoInfoAtual.item.system.acoes);
      acoesEspiritoClonadas[espiritoInfoAtual.acaoIndex].usosAtual = Math.max(0, espiritoInfoAtual.usosRestantes - 1);
      await espiritoInfoAtual.item.update({ "system.acoes": acoesEspiritoClonadas });
    }

    const mainBreakdown = [];
    mainBreakdown.push(...linhasEspiritoPago);
    if (linhaUsosPassivo) mainBreakdown.push(linhaUsosPassivo);
    mainBreakdown.push(...this.#efeitosEmAtaquesAtual);
    // Linhas que entram DEPOIS daqui (Escudo, Dano verdadeiro, Acúmulos rolados, Munição, Veneno)
    // são somadas ao card logo antes de postar (ver "efeitosTardios").
    const nEfeitosJaNoCard = this.#efeitosEmAtaquesAtual.length;
    mainBreakdown.push(...linhasCustoRolado);
    {
      // Uma linha só com tudo o que foi pago (Estamina, Mana e recursos próprios como Energia).
      const partesCusto = [];
      if (usarEspiritoBatalha) partesCusto.push(`${custoEstOriginal} Espírito da Batalha (em vez de Estamina)`);
      else if (custoEstPagar > 0) partesCusto.push(`${custoEstPagar} Estamina`);
      if (custoManaPagar > 0) partesCusto.push(`${custoManaPagar} Mana`);
      for (const c of custosRecursoProprioResolvidos) partesCusto.push(c.recurso === "estresse" ? `+${c.quantidade} ${c.nome}` : `${c.quantidade} ${c.nome}`);
      if (partesCusto.length) mainBreakdown.push({ label: "Custo", value: partesCusto.join(" + ") });
    }
    for (const r of reducoesCusto) mainBreakdown.push({ label: `Custo reduzido (${r.fonte})`, value: `Estamina ${r.de} → ${r.para}` });
    for (const pg of pagamentosAlternativos) {
      mainBreakdown.push({ label: `Custo pago com ${naurenNomeRecurso(this.actor, pg.recurso)}`, value: `${pg.quantidade} (em vez de ${pg.de} — ${pg.fonte})` });
    }
    // Só mostra a linha de Rank se o item realmente estiver usando o sistema
    // de ranks (rankMax nasce em 1 por padrão em Arma/Magia/Habilidade, mas
    // a maioria não usa isso - mostrar sempre "0/1" seria ruído desnecessário).
    if (item.system.rankMax > 1 || item.system.rankAtual > 0) {
      if ((item.system.rankAtual ?? 0) > 0) mainBreakdown.push({ label: "Rank atual", value: `${item.system.rankAtual} / ${item.system.rankMax}` }); // rank 0 = habilidade que não sobe por rank (só por nível): não mostra "0 / 4"
    }
    // Modificadores Externos de Subclasse (ver
    // _coletarModificadoresExternos/_aplicarModificadoresExternos) - uma
    // linha por Efeito que participou, pra nunca deixar o jogador
    // adivinhando por que um número saiu diferente da descrição base do
    // item. Agrupa por nome+rank (um Efeito pode ter várias entradas de
    // "modificadoresExternos" mirando esta mesma Ação - conta só 1 vez).
    // Uma linha por fonte; o detalhe de cada campo fica na ficha do item
    // ("Recebe modificações de").
    for (const a of [...new Map(this.#modificadoresExternosAplicadosAtual.map(a => [`${a.nome}|${a.rank}`, a])).values()]) {
      mainBreakdown.push({ label: "Ajustado por", value: `${a.nome}${a.rank ? ` (rank ${a.rank})` : ""}` });
    }
    if (this.#emPrioridadeAtual) {
      mainBreakdown.push({ label: "Em Prioridade", value: this.#emPrioridadeAtual.deNome ? `de ${this.#emPrioridadeAtual.deNome}${this.#emPrioridadeAtual.item ? ` (${this.#emPrioridadeAtual.item})` : ""}` : "fora do próprio turno" });
    }
    for (const u of this.#tokensContextoUsadosAtual) {
      if (u.token === "@rank" && u.valor === (item.system.rankAtual ?? 0)) continue;
      mainBreakdown.push({ label: `Valor de ${u.token}`, value: `${u.valor} (${u.fonte})` });
    }
    if (this._rankEfetivo(item) !== (item.system.rankAtual ?? 0)) {
      mainBreakdown.push({ label: "Rank efetivo", value: `${item.system.rankAtual ?? 0} → ${this._rankEfetivo(item)} (modificado por Subclasse)` });
    }
    // Mesma linha "Ajustado por" acima, mas pro mecanismo ANTIGO (nó de
    // Subclasse com "apenasUpgrade" escrevendo direto num campo do item,
    // ex: Comunhão Natural subindo o rank de Infusão Floral) - esse
    // nunca passa por "_aplicarModificadoresExternos" (não é um Efeito
    // com "modificaOutroItem"), então nunca entrava na lista acima. Bug
    // real corrigido: só o mecanismo novo aparecia no chat - Comunhão
    // Natural de fato mudava o resultado (via item.system.rankAtual, já
    // copiado pra Condição), mas o jogador nunca via o PORQUÊ no card.
    // Reaproveita a mesma varredura unificada do indicador da ficha (ver
    // _modificadoresExternosQueAfetam), filtrando só a fonte "no" - a
    // fonte "efeito" já está coberta com mais precisão pela lista acima
    // (esta é mais ampla, cobre qualquer Ação do item, não só a atual).
    // Nós antigos (escrita direta no item, sem "modificadores") ainda
    // aparecem aqui até serem migrados.
    for (const a of this._modificadoresExternosQueAfetam(item)) {
      if (a.fonte !== "noLegado") continue;
      mainBreakdown.push({ label: `Ajustado por ${a.nome} (rank ${a.rank})`, value: "gravado no item (formato antigo)" });
    }
    if (acao.usaTemplate) mainBreakdown.push({ label: "Área (Template)", value: `${acao.templateTamanho}m - ${acao.templateTipo}` });
    if (cargasRestantes !== null) mainBreakdown.push({ label: "Cargas restantes", value: `${cargasRestantes} / ${acao.cargasMax}` });
    if (cargaViaConsumivel) mainBreakdown.push({ label: `${cargaViaConsumivel.consumivel.name} restante(s)`, value: `${cargaViaConsumivel.novaQuantidade} / ${cargaViaConsumivel.consumivel.system.quantidadeMax ?? "?"}` });
    if (usosRestantes !== null) mainBreakdown.push({ label: "Usos restantes", value: `${usosRestantes} / ${acaoDoUso.usosMax} (recarrega ${USOS_RESET_LABEL[acaoDoUso.usosReset] ?? acaoDoUso.usosReset})` });
    // Arma com usos que só voltam pela Recarga (Arma de Inventor): o que sobra fica visível no card.
    const linhaUsosArma = (usosRestantes !== null && item.type === "arma" && item.system.usaUsos && acaoDoUso?.usosReset === "manual")
      ? { label: "Usos da arma", value: `${usosRestantes} / ${acaoDoUso.usosMax}`, breakdown: usosRestantes === 0 ? "vazia: use a Recarga" : usosRestantes === 1 ? "último uso" : "" } : null;
    // Troca de Atributo de Ataque (ver Condição > trocaAtributoAtaqueOpcional,
    // ex: Profusão Retraída, Empíreo) - só mostra a linha quando o
    // atributo realmente usado nesta rolagem é DIFERENTE do padrão da
    // Ação, senão o jogador não teria como saber, olhando o card, que a
    // troca aconteceu (o número final não diz por si só qual atributo
    // ele veio).
    if (this.#atributoAtaqueSubstitutoAtual && this.#atributoAtaqueSubstitutoAtual !== (acao.atributoAtaque || "poderAtaque")) {
      mainBreakdown.push({ label: "Atributo de Ataque", value: ATRIBUTOS_BONUS[this.#atributoAtaqueSubstitutoAtual] ?? this.#atributoAtaqueSubstitutoAtual });
    }

    // Gatilhos por Evento de "usei um item de tipo X": dispara aqui, já
    // confirmado que a Ação está de fato sendo usada (custos pagos,
    // usos/cargas descontados) - independe de acertar, causar dano etc.
    if (item.type === "consumivel" && this.actor.items.get(item.id)) {
      naurenRegistrarUsoTorre(this.actor, item, 1, "consumivel");
      const qtdC = Math.max(0, (item.system.quantidade ?? 0) - 1);
      await item.update({ "system.quantidade": qtdC });
      this.#beneficiosAtual.push({ label: item.name, value: `restam ${qtdC}` });
    }
    const eventoTipoItem = { magia: "useiMagia", arma: "useiArma", habilidade: "useiHabilidade" }[item.type];
    if (eventoTipoItem) {
      naurenProcessarGatilhos(eventoTipoItem, this.actor, { itemUsadoUuid: item.uuid, acaoNome: acao.nome, itemNome: item.name, ehAtaque: !!(acao.ehAtaque || acao.danoDiretoSemTeste), alvoUuid: Array.from(game.user.targets ?? [])[0]?.actor?.uuid ?? "" }).catch(err => console.warn(`Nauren RPG | Falha ao processar gatilhos (${eventoTipoItem}).`, err));
    }

    const localBonus = this._resolverEfeitosDaAcao(acao);
    // Buff de Conjuração (ver templatePersistenteBuffConjuracaoDado/
    // Facilidade, ex: Terra Mágica) - só se aplica a MAGIAS, e só quando
    // você (quem está usando) está FISICAMENTE dentro de uma área com o
    // buff ativo agora. Calculado UMA VEZ aqui (custa iterar regiões da
    // cena + testPoint) e reaproveitado tanto pro dado extra quanto pra
    // Facilidade no teste de ataque, mais abaixo.
    const buffConjuracao = item.type === "magia" ? this._buffDeConjuracaoAtivo() : null;
    if (buffConjuracao?.dado) {
      const dadoDoBuff = buffConjuracao.dado === "auto"
        ? this._extrairMaiorDado((acao.danos ?? []).map(b => b.formula))
        : buffConjuracao.dado;
      if (dadoDoBuff) localBonus.danoDados.push(dadoDoBuff);
    }
    // Bug real corrigido: "buffConjuracao.facilidade" era calculado mas
    // nunca lido em lugar nenhum depois - Terra Mágica dava o dado
    // extra de dano, mas a Facilidade no teste de ataque simplesmente
    // não acontecia. Guarda em "localBonus" pra "_montarFormulaAtaque"
    // somar (não sobrescrever) com a vantagem/dificuldade que já vem
    // do alvo marcado (ver "modoDoAlvo" ali).
    if (buffConjuracao?.facilidade) localBonus.facilidadeBuffConjuracao = true;
    // Bônus de Teste em Área (ver NaurenHabilidadeData > concedeBonusTesteArea,
    // ex: Presença, Empíreo) - soma o dado escolhido no popup (se houver)
    // ao teste de ataque, e marca "usado NESTE turno" (ver
    // naurenIdentificadorTurnoAtual) no PRÓPRIO ator (nunca no dono da
    // área) - "1x por turno" reseta sozinho a cada mudança de turno de
    // QUALQUER combatente, sem precisar de nenhum hook de reset manual.
    if (this.#bonusAreaAtaqueEscolhidoAtual?.dado) {
      localBonus.ataqueDados.push(this.#bonusAreaAtaqueEscolhidoAtual.dado);
      mainBreakdown.push({ label: "Bônus de Área", value: `${this.#bonusAreaAtaqueEscolhidoAtual.nome} (${this.#bonusAreaAtaqueEscolhidoAtual.donoNome}) +${this.#bonusAreaAtaqueEscolhidoAtual.dado}` });
      const identificadorTurnoAtual = naurenIdentificadorTurnoAtual();
      if (identificadorTurnoAtual) {
        const usadosAtuais = this.actor.getFlag("nauren", "bonusAreaUsadoNoTurno") || {};
        this.actor.setFlag("nauren", "bonusAreaUsadoNoTurno", { ...usadosAtuais, [naurenChaveFlagSegura(this.#bonusAreaAtaqueEscolhidoAtual.itemUuid)]: identificadorTurnoAtual })
          .catch(err => console.warn("Nauren RPG | Falha ao marcar Bônus de Teste em Área como usado.", err));
      }
    }
    // Penitência aceita agora (ver bloco acima, mesma Ação) - soma o
    // dado extra de dano/cura já resolvido por rank, no mesmo lugar
    // que qualquer outro bônus de Efeito/Condição - "auto" (se for o
    // caso) é resolvido automaticamente mais abaixo, igual qualquer
    // outra entrada destes arrays.
    if (acao.penitenciaAceitaAgora) {
      // 0.94.13: resolve de novo aqui, já com as camadas da Subclasse (ex.: Círculo da Graça sobe o dado do bônus).
      const rkPen = this._rankEfetivo(item);
      const danoPen = this._resolverPorRank(acao.penitenciaBonusDanoDadoPorRank, rkPen) ?? acao.penitenciaBonusDanoDado ?? acao.penitenciaBonusDanoResolvido;
      const curaPen = this._resolverPorRank(acao.penitenciaBonusCuraDadoPorRank, rkPen) ?? acao.penitenciaBonusCuraDado ?? acao.penitenciaBonusCuraResolvido;
      if (danoPen) localBonus.danoDados.push(danoPen);
      if (curaPen) localBonus.curaDados.push(curaPen);
    }
    const rankAtual = this._rankEfetivo(item);

    // Escudo (ver campoAcao > usaEscudo/escudoFormula) - DEFINE (substitui,
    // nunca soma - "conjurar de novo substitui a anterior", regra do
    // manual) o Escudo do Ator que usou esta Ação. Acontece sempre que a
    // Ação é usada (é o "conjurar", não depende de acertar um ataque).
    // Aceita "@custoManaDaAcao" (resolve pro custo de Mana desta MESMA
    // Ação, ex: "Escudo de Mana": "@custoManaDaAcao*2" - "X = mana gasto
    // vezes 2").
    if (acao.removerImobilizacaoEmMim) {
      const travam = naurenCondicoesAtivas(this.actor).filter(c => (c.system.modificadores ?? []).some(m => m.campo === "movimento" && /^\s*=\s*0\s*$/.test(String(m.valor))));
      if (travam.length) {
        await this.actor.deleteEmbeddedDocuments("Item", travam.map(c => c.id)).catch(err => console.warn("Nauren RPG | remover imobilização", err));
        this.#beneficiosAtual.push({ label: "Livrou-se de", value: travam.map(c => c.name).join(", "), breakdown: "Condições que travavam o Movimento" });
      }
    }
    if (acao.usaEscudo && acao.escudoFormula) {
      // Fórmula com dado e atalhos (ex.: "3d6+@poderMagia"); "@custoManaDaAcao" segue valendo (Escudo de Mana).
      const expressaoEscudo = this._substituirAtributosNaFormula(acao.escudoFormula.replace(/@custoManaDaAcao\b/gi, String(acao.custoMana ?? 0)), acao);
      let rollEscudo = null;
      try { rollEscudo = await new Roll(expressaoEscudo || "0").evaluate(); if (game.dice3d && rollEscudo.dice.length) await game.dice3d.showForRoll(rollEscudo, game.user, true); } catch (err) { console.warn("Nauren RPG | fórmula de escudo inválida", expressaoEscudo, err); }
      const valorEscudo = Math.max(0, Math.floor(rollEscudo?.total ?? 0));
      const combate = game.combat?.started ? game.combat : null;
      const expira = !combate ? null
        : acao.escudoDuracao === "fimRodada" ? { combate: combate.id, rodada: combate.round }
        : acao.escudoDuracao === "rodadas" ? { combate: combate.id, rodada: combate.round + Math.max(1, acao.escudoDuracaoRodadas ?? 1) - 1 }
        // 0.94.24: até o início do PRÓXIMO turno de quem usou (vale também usado numa Prioridade).
        : acao.escudoDuracao === "proximoTurno" ? (() => {
          const meu = combate.combatants.find(c => c.actor?.id === this.actor.id || c.actor?.uuid === this.actor.uuid);
          return meu ? { combate: combate.id, rodada: combate.round, turno: combate.turn ?? 0, turnoDe: meu.id } : { combate: combate.id, rodada: combate.round };
        })()
        : null;
      if (expira && acao.escudoSustentarRecurso) expira.sustentar = { recurso: acao.escudoSustentarRecurso, quantidade: acao.escudoSustentarQuantidade || "1", nome: acao.nome || item.name };
      const textoDuracao = acao.escudoDuracao === "fimRodada" ? " até o fim da rodada" : acao.escudoDuracao === "rodadas" ? ` por ${acao.escudoDuracaoRodadas} rodada(s)` : acao.escudoDuracao === "proximoTurno" ? " até o início do próximo turno de quem usou" : "";
      if (acao.escudoNoAlvo) {
        this.#escudoParaAlvoAtual = { valor: valorEscudo, expira, texto: textoDuracao };
      } else if (valorEscudo > 0) {
        await this.actor.update({ "system.escudo.value": valorEscudo, "system.escudo.max": valorEscudo });
        if (acao.escudoEstresseNaoReduz) await this.actor.setFlag("nauren", "escudoSemEstresse", { max: valorEscudo, nome: acao.nome || item.name });
        else if (this.actor.getFlag("nauren", "escudoSemEstresse")) await this.actor.unsetFlag("nauren", "escudoSemEstresse");
        if (expira) await this.actor.setFlag("nauren", "escudoExpira", expira); else await this.actor.unsetFlag("nauren", "escudoExpira");
      }
      // À vista no card (antes só nos detalhes): quanto de Escudo e em quem.
      if (valorEscudo > 0) this.#beneficiosAtual.push({ label: "Escudo", value: acao.escudoNoAlvo ? `${valorEscudo} no alvo` : `+${valorEscudo} em ${this.actor.name}`, breakdown: `${rollEscudo ? naurenRollToBreakdownText(rollEscudo) : ""}${textoDuracao}${acao.escudoNoAlvo ? "" : " • substitui o Escudo anterior"}` });
    }


    let d20Result = null;
    const secondaryLines = [];
    if (linhaUsosArma) secondaryLines.push(linhaUsosArma);
    const cartasExtras = [];

    // Desloca o Crítico Mínimo desta Ação especificamente (ver campoAcao >
    // critMinAjuste) - aceita "@alvoAcumulos" (quantos acúmulos o alvo
    // selecionado tem da Condição de referência configurada nesta Ação) e
    // "@alvoTemCondicao" (Verificar Múltiplas Condições no Alvo).
    let ajusteCritico = 0;
    if ((acao.usaCondicaoAlvo || acao.usaCondicoesAlvoMultiplas) && acao.critMinAjuste) {
      let expressao = acao.critMinAjuste;
      if (acao.usaCondicaoAlvo && acao.condicaoAlvoUuid && /@alvoAcumulos\b/.test(expressao)) {
        expressao = expressao.replace(/@alvoAcumulos\b/g, String(this._contarAcumulosNoAlvo(acao.condicaoAlvoUuid)));
      }
      if (acao.usaCondicoesAlvoMultiplas && /@alvoTemCondicao\b/.test(expressao)) {
        expressao = expressao.replace(/@alvoTemCondicao\b/g, String(this._alvoTemCondicoes(acao.condicoesAlvoMultiplas, acao.logicaCondicoesAlvo)));
      }
      const mod = naurenInterpretarModificador(expressao, this.actor);
      if (mod) ajusteCritico = mod.valor;
    }
    if (this.#estudoAtual?.critico) ajusteCritico -= this.#estudoAtual.critico;
    if (this.#criticoEfeitos) ajusteCritico -= this.#criticoEfeitos;
    // Bônus Condicional ao Alvo (ver NaurenHabilidadeData >
    // bonusCondicionalAoAlvo), campo "criticoMin" - ex: Avaliar (Ladino,
    // Subclasse Oportunista - "sua chance de crítico aumenta em 1 para
    // cada informação"). Automático pra QUALQUER Ação de ataque, sem
    // precisar configurar nada na Arma/Ação em si - some negativo
    // (crítico mais fácil), igual "critMinAjuste" acima.
    for (const b of (this.actor.system.bonusCondicionalAoAlvoTotal ?? [])) {
      if (b.campo !== "criticoMin") continue;
      ajusteCritico += this._resolverBonusCondicionalAoAlvo(b);
    }

    // Dano Máximo Condicional (ver campoAcao > formulaDanoMaximoCondicional)
    // - aceita "@alvoTemCondicao" e "@euTenhoCondicao". Resolve pra
    // true/false ANTES de rolar qualquer bloco de Dano abaixo, já que
    // ambos os tokens dependem do alvo/condição JÁ selecionados agora,
    // não de nada que só se saiba depois (diferente de uma margem de
    // acerto contra a Defesa do alvo, que só é conhecida no lado de lá).
    let forcarDanoMaximo = !!acao._danoMaximoPorEfeito || (!!acao._conjuracaoPoderosa && !!acao.danoMaximoEmPoderosa);
    if (acao.usaDanoMaximoCondicional && acao.formulaDanoMaximoCondicional) {
      let expressao = acao.formulaDanoMaximoCondicional;
      if (acao.usaCondicoesAlvoMultiplas && /@alvoTemCondicao\b/.test(expressao)) {
        expressao = expressao.replace(/@alvoTemCondicao\b/g, String(this._alvoTemCondicoes(acao.condicoesAlvoMultiplas, acao.logicaCondicoesAlvo)));
      }
      if (acao.usaCondicaoPropria && /@euTenhoCondicao\b/.test(expressao)) {
        expressao = expressao.replace(/@euTenhoCondicao\b/g, String(this._euTenhoCondicao(acao.condicaoPropriaUuid, acao.condicaoPropriaAcumulosMin)));
      }
      if (acao.usaCondicaoPropria && /@euTenhoCondicao2\b/.test(expressao)) {
        expressao = expressao.replace(/@euTenhoCondicao2\b/g, String(this._euTenhoCondicao(acao.condicaoPropriaUuid2, acao.condicaoPropriaAcumulosMin2)));
      }
      const modMax = naurenInterpretarModificador(expressao, this.actor, item);
      forcarDanoMaximo = !!(modMax && modMax.valor);
    }
    if (this.#proximaAcaoAtual?.danoMaximo) forcarDanoMaximo = true;

    if (acao.ehAtaque) {
      // Facilidade do Buff de Conjuração: só entra se o jogador não tiver
      // travado outro modo manualmente no popup de pré-Ação (respeita a
      // escolha dele, nunca sobrepõe).
      // Fase 5b: reações dos defensores antes da rolagem.
      await this._criarAvisoAguardando(item);
      this.#reacaoPreAtaqueAtual = await this._janelaReacaoPreAtaque(item, acao);
      // A Facilidade da Conjuração Poderosa entra na soma do modo (_montarFormulaAtaque), como as outras fontes.
      let modoComBuff = this.#modoPreAcaoAtual || (buffConjuracao?.facilidade ? "vantagem" : null);
      // 0.94.11: sem modo escolhido no popup, a Facilidade da próxima ação e as Dificuldades das reações entram na
      // CONTAGEM (cada uma além da primeira vale ±2), em vez de travar o modo.
      const deltaBuff = (this.#proximaAcaoAtual?.facilidade ? 1 : 0) - (this.#reacaoPreAtaqueAtual?.dificuldade?.length ?? 0);
      let deltaExtra = 0;
      if (!modoComBuff) deltaExtra = deltaBuff;
      else {
        if (this.#proximaAcaoAtual?.facilidade) modoComBuff = modoComBuff === "desvantagem" ? "normal" : "vantagem";
        if (this.#reacaoPreAtaqueAtual?.dificuldade.length) {
          // Facilidade e Dificuldade se anulam; senão a rolagem fica com Dificuldade.
          modoComBuff = modoComBuff === "vantagem" ? "normal" : "desvantagem";
        }
      }
      const resultado = await this._rolarAtaqueDaAcao(acao, localBonus, rankAtual, modoComBuff, item.type, deltaExtra);
      d20Result = resultado.d20Result;
      mainBreakdown.push(...resultado.breakdown);
    }
    const ehCritico = d20Result ? this._isCrit(d20Result, ajusteCritico) : false;
    // 0.94.3 (Tudo ou Nada): o último uso da arma de projeto causa dano crítico se acertar (o acerto continua normal).
    let critDanoUltimoUso = false;
    if (acao.ehAtaque && this._naurenUsosItemAntes === 1) {
      const rUU = naurenRegrasExtras(this.actor, "ultimoUsoCritico").find(x => !x.regra.fonte || naurenItemEhDoProjeto(item, x.regra.fonte));
      if (rUU) {
        critDanoUltimoUso = true;
        let extras = 0;
        try { extras = Math.max(0, Math.round(Roll.safeEval(String(rUU.regra.dadosExtras ?? "0").replace(/@rank\b/g, String(rUU.rank))))); } catch (err) { extras = 0; }
        if (extras) acao = { ...acao, _critDadosExtras: extras };
        secondaryLines.push({ label: rUU.item.name, value: "último uso: dano crítico se acertar", breakdown: extras ? `+${extras} dado(s) no crítico (rank ${rUU.rank})` : "" });
      }
    }
    const criticoGrupo = naurenAjusteCriticoDoGrupo(this.actor);
    // Crítico que só aconteceu por causa do Grupo (Teomanina): linha VISÍVEL no card, não só no detalhe.
    if (ehCritico && criticoGrupo.valor > 0) {
      const faceCG = this._getD20Face(d20Result.rolls[d20Result.usedIndex]);
      const critProprio = (this.actor.system.critMinTotal ?? 20) + ajusteCritico;
      if (faceCG !== null && faceCG < critProprio) secondaryLines.unshift({ label: `Crítico no ${faceCG}`, value: criticoGrupo.fonte, breakdown: `crítico a partir de ${critProprio - criticoGrupo.valor} (sem isso seria ${critProprio})` });
    }
    if (d20Result && criticoGrupo.valor > 0) mainBreakdown.push({ label: `Crítico do grupo (${criticoGrupo.fonte})`, value: `crítico a partir de ${(this.actor.system.critMinTotal ?? 20) + ajusteCritico - criticoGrupo.valor}` });
    if (ajusteCritico) {
      mainBreakdown.push({ label: "Ajuste no Crítico Mínimo", value: `${ajusteCritico > 0 ? "+" : ""}${ajusteCritico} (agora precisa de ${(this.actor.system.critMinTotal ?? 20) + ajusteCritico}+)` });
    }
    // Gatilho "Eu acertei um crítico" - dispara em QUEM rolou, logo após
    // confirmar o crítico (antes de qualquer dano ser aplicado). Um evento
    // "aliadoAcertouCritico" também dispara, pra Habilidades que reagem ao
    // crítico de um COMPANHEIRO (ex: Punição Celestial, do Sacerdote).
    if (ehCritico) {
      const ctxCrit = { alvoUuid: Array.from(game.user.targets ?? [])[0]?.document?.uuid ?? "" };
      naurenProcessarGatilhos("euAcerteiCritico", this.actor, ctxCrit)
        .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (acerto crítico).", err));
      naurenProcessarGatilhos("aliadoAcertouCritico", this.actor, ctxCrit)
        .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (aliado acertou crítico).", err));
    }

    // Aplicar em Mim Mesmo (ver campoAcao#condicaoEmMimUuid): sempre
    // dispara ao usar a Ação, independente de acertar ou causar dano - é
    // sobre quem USOU o item, não sobre o alvo.
    if (acao.condicaoEmMimUuid) {
      let acumulosEmMim = 1;
      try {
        const mod = await naurenInterpretarModificadorComDado(String(acao.condicaoEmMimAcumulos || "1").replace(/@quantidadeEscolhida\b/g, String(this.#quantidadeRecursoEscolhidaAtual || 1)).replace(/@crescimento\b/g, String(this.#nivelCrescimentoAtual ?? 0)), this.actor);
        acumulosEmMim = Math.max(1, Math.round(mod?.valor ?? 1));
      } catch (err) {
        acumulosEmMim = 1;
      }
      const nomeAplicado = await NaurenAlvoHelper.aplicarCondicao(this.actor, acao.condicaoEmMimUuid, acumulosEmMim);
      if (acao.consumirCondicaoExigida && acao.exigeCondicaoEmMimNome) {
        const exigida = this.actor.items.find(i => i.type === "condicao" && i.name === acao.exigeCondicaoEmMimNome);
        if (exigida) { await exigida.delete().catch(() => {}); secondaryLines.push({ label: "Usou", value: exigida.name }); }
      }
        if (acao.condicaoEmMimExtraUuid) await NaurenAlvoHelper.aplicarCondicao(this.actor, acao.condicaoEmMimExtraUuid, 1).catch(() => null);
      if (nomeAplicado) secondaryLines.push({ label: "Você recebeu", value: nomeAplicado });
    }

    // 0.94.3 (genéricos): gastar 1 uso de um item de projeto, efeitos simples em você e criar um Frasco especial.
    if (acao.gastaUsoDeProjeto) {
      const projs = naurenItensDoProjetoPorNome(this.actor, acao.gastaUsoDeProjeto).filter(i => i.system.usaUsos && (i.system.usosAtual ?? 0) > 0);
      const alvoP = projs.find(i => i.system.equipado) ?? projs[0];
      if (alvoP) {
        const antesP = alvoP.system.usosAtual ?? 0;
        await alvoP.update({ "system.usosAtual": antesP - 1 });
        secondaryLines.push({ label: `Uso de ${alvoP.name}`, value: `${antesP} → ${antesP - 1}` });
      }
    }
    if ((acao.efeitosEmMim ?? []).length) {
      const rkE = Math.max(1, this._rankEfetivo(item) || 1);
      for (const ef of acao.efeitosEmMim) {
        try {
          const linha = await naurenAplicarEfeitoSimples(this.actor, ef, { fonte: item.name, subst: { rank: rkE } });
          if (linha) secondaryLines.push({ label: "Em você", value: linha });
        } catch (err) { console.warn(`Nauren RPG | "${item.name}": efeito em você falhou.`, err); }
      }
    }
    if (acao.criaFrasco && Object.keys(acao.criaFrasco).length && (acao.criaFrasco.nome || acao.criaFrasco.efeitos)) {
      const novoF = await naurenCriarFrascoEspecial(this.actor, acao.criaFrasco, this._naurenCriaFrascoEscolha, item);
      if (novoF) secondaryLines.push({ label: "Preparou", value: novoF.name, breakdown: naurenTextoFrascoEspecial(novoF) });
    }

    // Consumir a Condição exigida NO ALVO (ex.: Arremessar o Agarrado tira o Preso/Agarrado): mesmo campo
    // "consumirCondicaoExigida" da Condição exigida em você, agora também para "Verificar Condição no Alvo".
    if (acao.consumirCondicaoExigida && acao.usaCondicaoAlvo && acao.exigirCondicaoAlvo && acao.condicaoAlvoUuid) {
      for (const t of Array.from(game.user.targets ?? [])) {
        const c = t.actor?.items.find(i => i.type === "condicao" && i.system.ativo
          && (i.getFlag("core", "sourceId") === acao.condicaoAlvoUuid || i.getFlag("nauren", "cadeiaRaizUuid") === acao.condicaoAlvoUuid));
        if (!c) continue;
        if (c.isOwner) await c.delete().catch(() => {});
        else await game.users.activeGM?.query(NAUREN_QUERY_ITEM_MESTRE, { tipo: "apagarItem", itemUuid: c.uuid }, { timeout: 15000 }).catch(() => null);
        secondaryLines.push({ label: "Removeu do alvo", value: `${c.name} (${t.actor.name})` });
      }
    }

    const danos = acao.danos ?? [];
    let usouDanoGlobal = false;
    let danoParaAlvo = 0;      // soma dos blocos com "aplicarNoAlvo" (pra automação)
    let dadosParaMinimo = 0;   // dano mínimo (bônus fixos + 1 por dado) desses blocos, pro Bloquear
    // Dano Máximo por Margem (ver campoAcao > usaDanoMaximoPorMargem): a
    // margem de acerto só é conhecida do lado de quem processa o ALVO,
    // então calcula os DOIS totais AQUI (normal + máximo) e deixa quem
    // processar o alvo escolher depois - "danoParaAlvoMaximo" nunca entra
    // no breakdown visual principal, é só a alternativa "de reserva".
    let danoParaAlvoMaximo = 0;
    // Referência à última linha "Dano" (não separada em carta extra)
    // adicionada a secondaryLines - ver uso mais abaixo em "Bônus
    // Condicional ao Alvo", que precisa atualizar o valor JÁ mostrado
    // nela depois de somar o bônus (senão o número exibido no card
    // nunca reflete o bônus, mesmo que o dano de fato aplicado esteja
    // correto).
    let ultimaLinhaDanoNormal = null;
    let primeiroRollDano = null;
    let versaoMaximaDoBloco = null;
    let drenoTotal = 0; // 0.94.24: Dreno - metade do dado extra volta como Vida para quem atacou, se acertar
    for (const bloco of danos) {
      // Gatilho Condicional (ver campoDanoBloco > condicaoParaAtivar) -
      // pula este bloco por completo (sem rolar, sem entrar no card)
      // se a condição não bater. Permite um 2º bloco de Dano "bônus" na
      // mesma Ação, que só soma quando um trigger específico é
      // verdadeiro, sem tocar no bloco principal.
      if (!this._condicaoParaAtivarPassou(bloco.condicaoParaAtivar, acao)) continue;
      if (bloco.soNoCritico && !ehCritico) continue;
      // Dano extra que só vale com Facilidade (ex.: Euforia): o card diz por que não entrou.
      if (bloco.soComFacilidade && d20Result?.mode !== "vantagem") {
        secondaryLines.push({ label: bloco.nomeCustom || "Dano extra", value: "não somou", breakdown: "só vale quando o ataque sai com Facilidade" });
        continue;
      }
      const critouEste = !bloco.rolarSeparado && !bloco.naoDobraNoCritico && (ehCritico || critDanoUltimoUso);
      const incluirGlobalEste = !usouDanoGlobal && !acao.danoSemBonus;
      const { roll, breakdown, fontesBonus } = await this._rolarBlocoDano(bloco, critouEste, incluirGlobalEste, localBonus, rankAtual, acao, forcarDanoMaximo, item.type);
      usouDanoGlobal = true;
      if (bloco.curaMetadeEmMim && bloco.aplicarNoAlvo !== false) drenoTotal += Math.floor(roll.total / 2);
      if (bloco.aplicarNoAlvo !== false) {
        primeiroRollDano ??= roll;
        danoParaAlvo += roll.total;
        dadosParaMinimo += this._calcularDanoMinimo(roll);
        if (acao.usaDanoMaximoPorMargem) {
          // Mesmos parâmetros da rolagem normal acima (mesmo incluirGlobal,
          // mesmo localBonus) - só troca forcarDanoMaximo pra true, senão
          // os bônus globais/locais (que só entram uma vez, no 1º bloco)
          // ficariam faltando ou duplicados entre as duas versões.
          const rollMax = forcarDanoMaximo ? roll : (await this._rolarBlocoDano(bloco, critouEste, incluirGlobalEste, localBonus, rankAtual, acao, true, item.type)).roll;
          danoParaAlvoMaximo += rollMax.total;
          versaoMaximaDoBloco = { total: rollMax.total, texto: this._rollToBreakdownText(rollMax) };
        }
      }
      // Bloco extra com nome (ex.: Fazer em Silêncio no crítico): o rótulo diz de onde veio; "x2"
      // só quando há dado para dobrar.
      const temDadoBloco = /\d*d\d+/i.test(String(bloco.formula ?? ""));
      const rotuloBloco = bloco.nomeCustom && !bloco.rolarSeparado ? `Dano — ${bloco.nomeCustom}${critouEste ? (temDadoBloco ? " (CRÍTICO x2)" : " (crítico)") : ""}` : (critouEste && temDadoBloco ? "Dano (CRÍTICO x2)" : critouEste ? "Dano (crítico)" : "Dano");
      const linha = { label: rotuloBloco, value: roll.total, breakdown: `${this._rollToBreakdownText(roll)}${fontesBonus?.length ? ` · ${fontesBonus.join(", ")}` : ""}` };
      if (versaoMaximaDoBloco) { linha._max = { ...versaoMaximaDoBloco, totalOriginal: roll.total, textoOriginal: linha.breakdown }; versaoMaximaDoBloco = null; }
      if (bloco.rolarSeparado) {
        cartasExtras.push({ titulo: `${bloco.nomeCustom || acao.nome} — Dano`, d20Result: null, secondaryLines: [linha], breakdown });
      } else {
        secondaryLines.push(linha);
        mainBreakdown.push(...breakdown);
        ultimaLinhaDanoNormal = linha;
      }
    }

    if (drenoTotal > 0) {
      acao = { ...acao, concessaoAoAtacante: [...(acao.concessaoAoAtacante ?? []), { recurso: "vida", quandoAplicar: "acertar", quantidade: String(drenoTotal), ativo: true }] };
      secondaryLines.push({ label: "Dreno", value: `+${drenoTotal} de Vida se acertar`, breakdown: "metade do dado extra volta para você" });
    }

    // Dano Extra em Crítico (ver campoAcao > danoExtraEmCritico, ex:
    // Estouro de Magma - "em acerto crítico, 5d12 de dano extra") -
    // rolado UMA VEZ (não participa da dobra normal de crítico, já
    // aplicada nos blocos acima), só quando o ataque foi crítico.
    if (ehCritico && danos.length && acao.danoExtraEmCritico) {
      let rollExtra = null;
      try {
        rollExtra = await new Roll(acao.danoExtraEmCritico).evaluate();
        if (game.dice3d) await game.dice3d.showForRoll(rollExtra, game.user, true);
      } catch (err) {
        console.warn(`Nauren RPG | Fórmula de dano extra em crítico inválida em "${item.name}".`, err);
      }
      if (rollExtra) {
        danoParaAlvo += rollExtra.total;
        if (danoParaAlvoMaximo) danoParaAlvoMaximo += rollExtra.total;
        dadosParaMinimo += this._calcularDanoMinimo(rollExtra);
        secondaryLines.push({ label: "Dano Extra (CRÍTICO)", value: rollExtra.total, breakdown: this._rollToBreakdownText(rollExtra) });
      }
    }

    // Fase 6 (Mv): colisão prevista do empurrão entra no MESMO dano do
    // ataque (card, popup de reação e botões de dano usam o total). O dado
    // "@dadoDano" é o dado real do dano já rolado (ex.: arma evoluída 1d8).
    this.#colisaoPrevistaAtual = null;
    if (acao.usaEmpurrar && acao.empurrarColisaoDano && danos.length && !acao.usaTemplate) {
      const alvosColisao = Array.from(game.user.targets ?? []);
      const meuTokenColisao = canvas?.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
      if (alvosColisao.length === 1 && meuTokenColisao) {
        const metrosEmp = naurenMetrosEmpurrao(acao.empurrarMetros, this.actor, item?.system?.rankAtual);
        const sim = naurenCalcularEmpurrao(alvosColisao[0].document, meuTokenColisao.center, metrosEmp, acao.empurrarDirecao || "afastar");
        if (sim?.colidiuCom) {
          const faces = primeiroRollDano?.dice?.[0]?.faces;
          const formulaColisao = String(acao.empurrarColisaoDano).replace(/@dadoDano\b/gi, faces ? `1d${faces}` : "1d6")
            .replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, this.actor) ?? 0));
          let rollColisao = null;
          try { rollColisao = await new Roll(formulaColisao).evaluate(); if (game.dice3d) await game.dice3d.showForRoll(rollColisao, game.user, true); } catch (err) { rollColisao = null; }
          if (rollColisao) {
            const com = sim.colidiuCom === "parede" ? "parede" : naurenNomeDeToken(sim.colidiuCom);
            danoParaAlvo += rollColisao.total;
            if (danoParaAlvoMaximo) danoParaAlvoMaximo += rollColisao.total;
            const textoColisao = this._rollToBreakdownText(rollColisao);
            // Linha própria (antes somava na última linha de dano, que podia ser de outra fonte, ex.: "Marca do Caçador").
            secondaryLines.push({ label: `Dano — Colisão com ${com}`, value: rollColisao.total, breakdown: textoColisao });
            mainBreakdown.push({ label: "Colisão prevista", value: `com ${com} — ${formulaColisao} → ${textoColisao}` });
            this.#colisaoPrevistaAtual = { valor: rollColisao.total, texto: `${formulaColisao} → ${textoColisao}` };
          }
        }
      }
    }

    // Bônus Condicional ao Alvo (ver NaurenHabilidadeData >
    // bonusCondicionalAoAlvo) - some UMA VEZ (não por bloco) as entradas
    // de campo "dano" cujo alvo mirado (tecla T) tenha a Condição
    // indicada. Ex: Marca do Caçador - "Tiro Letal" soma +1/+2/... de
    // dano contra o alvo marcado, em qualquer ataque, sem
    // precisar configurar nada nela.
    if (danos.length) {
      const bonusCondAlvoDano = this.actor.system.bonusCondicionalAoAlvoTotal ?? [];
      let bonusDanoCondicional = 0;
      const fontesDanoCond = [];
      const variosAlvosD = (game.user.targets?.size ?? 0) > 1;
      for (const b of bonusCondAlvoDano) {
        if (b.campo !== "dano" || !this._bonusCondicionalValeNesta(b, item, acao)) continue;
        // Vários alvos: cada um recebe o bônus só se ELE tiver a Condição (antes valia o 1º alvo para todos).
        if (variosAlvosD) { if (b.condicaoUuid) this.#bonusPorAlvoAtual.push({ fonte: b.origemNome || "Bônus contra o alvo", condicaoUuid: b.condicaoUuid, porAcumulo: !!b.porAcumulo, dano: Number(b.valor) || 0 }); continue; }
        const vD = this._resolverBonusCondicionalAoAlvo(b);
        bonusDanoCondicional += vD;
        if (vD && b.origemNome && !fontesDanoCond.includes(b.origemNome)) fontesDanoCond.push(b.origemNome);
      }
      if (bonusDanoCondicional) {
        danoParaAlvo += bonusDanoCondicional;
        if (danoParaAlvoMaximo) danoParaAlvoMaximo += bonusDanoCondicional;
        mainBreakdown.push({ label: fontesDanoCond.length ? `Contra o alvo (${fontesDanoCond.join(", ")})` : "Bônus Condicional ao Alvo", value: String(bonusDanoCondicional) });
        // Bug real corrigido: a linha "Dano" em secondaryLines (sempre
        // visível, sem precisar expandir "Detalhes") já tinha sido
        // fixada em "roll.total" ANTES deste bônus ser somado a
        // "danoParaAlvo" - o valor de fato aplicado na vida do alvo já
        // vinha correto por baixo dos panos, mas o número mostrado no
        // card nunca refletia isso, então o bônus parecia não estar
        // acontecendo. Atualiza a última linha de dano "normal" (não
        // separada em carta extra) pra bater com o valor real aplicado
        // - só o número cru aqui (a explicação "Bônus Condicional ao
        // Alvo" já tem sua própria linha em mainBreakdown, não repete
        // o rótulo duas vezes).
        if (ultimaLinhaDanoNormal) {
          ultimaLinhaDanoNormal.value += bonusDanoCondicional;
          ultimaLinhaDanoNormal.breakdown = `${ultimaLinhaDanoNormal.breakdown} + ${bonusDanoCondicional}`;
        }
      }
    }

    // Múltiplos Ataques (ex: Mísseis Arcanos - "faça uma jogada de ataque
    // para cada projétil"): repete o teste de ataque e os blocos de Dano,
    // cada repetição virando um card extra na mesma mensagem, com seu
    // próprio ícone de acerto/erro. O resultado de cada repetição é
    // enviado junto no pacote para o alvo, que resolve o acerto de cada
    // uma de forma independente contra a própria Defesa.
    const ataquesMultiplos = [];
    if (acao.ehAtaque && acao.usaMultiplosAtaques) {
      let quantidade = 1;
      try {
        const modQtd = naurenInterpretarModificador(acao.quantidadeAtaques || "1", this.actor);
        quantidade = Math.max(1, Math.round(modQtd?.valor ?? 1));
      } catch (err) {
        quantidade = 1;
      }
      for (let i = 1; i < quantidade; i++) {
        const resultadoExtra = await this._rolarAtaqueDaAcao(acao, localBonus, rankAtual, null, item.type);
        const totalExtra = resultadoExtra.d20Result.rolls[resultadoExtra.d20Result.usedIndex].total;
        const ehCriticoExtra = this._isCrit(resultadoExtra.d20Result, ajusteCritico);

        let danoExtra = 0, danoMinimoExtra = 0;
        const linhasDanoExtra = [];
        const breakdownTecnicoExtra = [];
        let usouDanoGlobalExtra = false;
        for (const bloco of danos) {
          const critouEsteExtra = !bloco.rolarSeparado && ehCriticoExtra;
          const { roll, breakdown } = await this._rolarBlocoDano(bloco, critouEsteExtra, !usouDanoGlobalExtra, localBonus, rankAtual, acao, forcarDanoMaximo, item.type);
          usouDanoGlobalExtra = true;
          if (bloco.aplicarNoAlvo !== false) {
            danoExtra += roll.total;
            danoMinimoExtra += this._calcularDanoMinimo(roll);
          }
          linhasDanoExtra.push({ label: critouEsteExtra ? "Dano (CRÍTICO x2)" : "Dano", value: roll.total, breakdown: this._rollToBreakdownText(roll) });
          breakdownTecnicoExtra.push(...breakdown);
        }

        ataquesMultiplos.push({ ataqueTotal: totalExtra, dano: danoExtra, danoMinimo: danoMinimoExtra, critico: ehCriticoExtra,
          falhaCritica: naurenFaceD20(resultadoExtra.d20Result.rolls?.[resultadoExtra.d20Result.usedIndex]) === 1 });
        cartasExtras.push({
          titulo: `${acao.nome} — Projétil ${i + 1}`,
          d20Result: resultadoExtra.d20Result,
          secondaryLines: linhasDanoExtra,
          breakdown: [...resultadoExtra.breakdown, ...breakdownTecnicoExtra]
        });
      }
    }

    const curas = acao.curas ?? [];
    let usouCuraGlobal = false;
    let curaParaAlvo = 0;
    for (const bloco of curas) {
      // Ver mesmo comentário completo no loop de "danos" acima.
      if (!this._condicaoParaAtivarPassou(bloco.condicaoParaAtivar, acao)) continue;
      const { roll, breakdown } = await this._rolarBlocoCura(bloco, !usouCuraGlobal, localBonus, rankAtual, acao, forcarDanoMaximo, item.type);
      usouCuraGlobal = true;
      const multCura = Number(acao.curaMultiplicador) > 0 ? Number(acao.curaMultiplicador) : 1;
      const totalCura = Math.floor(roll.total * multCura);
      if (bloco.aplicarNoAlvo !== false) curaParaAlvo += totalCura;
      const linha = { label: "Cura", value: totalCura, breakdown: `${this._rollToBreakdownText(roll)}${multCura !== 1 ? ` × ${multCura}` : ""}` };
      if (bloco.rolarSeparado) {
        cartasExtras.push({ titulo: `${bloco.nomeCustom || acao.nome} — Cura`, d20Result: null, secondaryLines: [linha], breakdown });
      } else {
        secondaryLines.push(linha);
        mainBreakdown.push(...breakdown);
      }
    }

    if (!acao.ehAtaque && !danos.length && !curas.length) {
      secondaryLines.push({ label: "Ação", value: acao.nome });
      if (item.type === "habilidade" && acao.categoria) mainBreakdown.push({ label: "Categoria", value: acao.categoria });
    }

    const sys = item.system;
    // "Halo — Halo — Espelhar Dano": quando a Ação já começa com o nome do item, o título é só a Ação.
    const titulo = !acao.nome || acao.nome === "Ação" || acao.nome === item.name ? item.name
      : String(acao.nome).startsWith(item.name) ? acao.nome : `${item.name} — ${acao.nome}`;

    // Resolve "@euTenhoCondicao"/"@euTenhoCondicao2" dentro de
    // "custoParaEvitarQuantidade" de Condições Aplicadas (ex: Fadiga,
    // Empíreo - "o custo pra resistir aumenta em 1 em Profusão
    // Retraída") - a rolagem de verdade mais adiante (_rolarFormula,
    // usada em _resolverAlvosDaAcao) só entende dado puro, não esses
    // tokens - precisa vir já resolvido aqui, ANTES da rolagem.
    if (acao.usaCondicaoPropria && (acao.condicoesAplicadas ?? []).some(c => /@euTenhoCondicao\b/.test(String(c.custoParaEvitarQuantidade ?? "")))) {
      acao = {
        ...acao, condicoesAplicadas: acao.condicoesAplicadas.map(c => (
          /@euTenhoCondicao\b/.test(String(c.custoParaEvitarQuantidade ?? ""))
            ? { ...c, custoParaEvitarQuantidade: this._substituirAtributosNaFormula(String(c.custoParaEvitarQuantidade), acao) }
            : c
        ))
      };
    }

    // ===== ÁREA NO MAPA E/OU AUTOMAÇÃO DE ALVO (resolvida ANTES de postar,
    // pra virar tudo UM card só, com o ícone de acerto/erro já pronto) =====
    const ataqueTotal = d20Result ? d20Result.rolls[d20Result.usedIndex].total : null;
    if ((acao.modoAlvo ?? "nenhum") !== "nenhum") await this._criarAvisoAguardando(item);
    // Troca de lugar (ex.: Surgir da Palavra): só depois de confirmar e pagar a Ação.
    if (acao.trocarLugarComAlvo) {
      const alvoTroca = Array.from(game.user.targets ?? [])[0];
      const meuTok = this.actor.getActiveTokens?.(true)?.[0];
      if (alvoTroca && meuTok && alvoTroca !== meuTok) {
        const minha = { x: meuTok.document.x, y: meuTok.document.y }, dele = { x: alvoTroca.document.x, y: alvoTroca.document.y };
        await naurenMoverTokenViaMestre(alvoTroca.document, minha.x, minha.y, { teleporte: true });
        await naurenDeslocarToken(meuTok.document, dele.x, dele.y, { teleporte: true });
        acao = { ...acao, usaMoverEscolhendo: false, _trocouLugar: alvoTroca.document.name };
      }
    }
    if (acao.trocarLugarSeAtacou) {
      const alvoTroca = Array.from(game.user.targets ?? [])[0];
      const meuTok = this.actor.getActiveTokens?.(true)?.[0];
      if (alvoTroca && meuTok) {
        const trocar = await foundry.applications.api.DialogV2.confirm({ window: { title: acao.nome || item.name },
          content: `<p>Se você <b>já atacou neste turno</b>, pode trocar de lugar com <b>${alvoTroca.document.name}</b> em vez de se teleportar para perto dele.</p>`,
          yes: { label: "Trocar de lugar (já ataquei)" }, no: { label: "Teleportar para perto" }, rejectClose: false }).catch(() => false);
        if (trocar) {
          const minha = { x: meuTok.document.x, y: meuTok.document.y }, dele = { x: alvoTroca.document.x, y: alvoTroca.document.y };
          await naurenMoverTokenViaMestre(alvoTroca.document, minha.x, minha.y, { teleporte: true });
          await naurenDeslocarToken(meuTok.document, dele.x, dele.y, { teleporte: true });
          acao = { ...acao, usaMoverEscolhendo: false, _trocouLugar: alvoTroca.document.name };
        }
      }
    }
    if (acao.templatePersistenteCargasEstamina) {
      const fCargas = String(acao.templatePersistenteCargasEstamina).replace(/@quantidadeEscolhida\b/g, String(this.#quantidadeRecursoEscolhidaAtual || 0));
      acao = { ...acao, _cargasEstaminaResolvidas: Math.max(0, Math.round(naurenInterpretarModificador(fCargas, this.actor)?.valor ?? Number(fCargas) ?? 0)) };
    }
    // Condições do ALVO que mudam o dano/cura recebido (Exposto, Putrefato...): fotografadas ANTES
    // da resolução (podem ser consumidas pelo próprio golpe) para o card principal mostrar e explicar.
    const modsRecebidosAntes = naurenFotografarModsRecebidos();
    // Condicionais de ataque (M15): dano no erro e limiar de execução, rolados/resolvidos aqui (auditáveis).
    let danoNoErro = 0, danoNoErroTexto = "", limiarExecucao = 0;
    if (acao.ehAtaque && acao.danoNoErroFormula) {
      try { const rNE = await new Roll(this._substituirAtributosNaFormula(String(acao.danoNoErroFormula), acao)).evaluate(); danoNoErro = Math.max(0, rNE.total); danoNoErroTexto = this._rollToBreakdownText(rNE);
        /* o card só mostra no alvo que de fato levou o dano no erro (linha por alvo) */ } catch (err) { danoNoErro = 0; }
    }
    if (acao.ehAtaque && acao.limiarExecucaoFormula) {
      limiarExecucao = Math.max(0, Math.round(naurenInterpretarModificador(this._substituirAtributosNaFormula(String(acao.limiarExecucaoFormula), acao), this.actor, item)?.valor ?? 0));
      // Sem linha no card do atacante: o limiar não é revelado. Só aparece no alvo que de fato foi executado.
    }
    const resultadoAlvos = await this._resolverAlvosDaAcao(item, acao, {
      danoNoErro, danoNoErroTexto, limiarExecucao,
      naturalVinte: d20Result ? naurenFaceD20(d20Result.rolls?.[d20Result.usedIndex]) === 20 : false,
      ehCriticoAtaque: !!(acao.ehAtaque && ehCritico),
      falhaCriticaAtaque: !!(acao.ehAtaque && d20Result && naurenFaceD20(d20Result.rolls?.[d20Result.usedIndex]) === 1),
      modoAtaque: d20Result?.mode ?? "normal",
      titulo,
      ataqueTotal,
      ehAtaque: acao.ehAtaque,
      danoParaAlvo,
      danoParaAlvoMaximo,
      dadosParaMinimo,
      curaParaAlvo,
      ataquesMultiplos
    });
    // Bug real corrigido: o card do chat (com o dado/ataque já rolado
    // ANTES desta chamada) era postado incondicionalmente, mesmo
    // quando a Ação de fato falhou/foi cancelada depois (fora de
    // alcance, sem alvo válido, nenhum token na área) - ver
    // "cancelado" em _resolverAlvosDaAcao. Aborta aqui, sem postar
    // nada, exatamente como cancelar o popup de pré-Ação já faz.
    if (resultadoAlvos.cancelado) { await this._removerAvisoAguardando(); await this._devolverCustosDaAcao(item, acao); return; }
    naurenAnotarModsRecebidosNoCard(secondaryLines, modsRecebidosAntes, resultadoAlvos.porAlvo ?? []);
    // (o reset de #beneficiosAtual foi para o início da Ação: aqui ele apagava o que os alvos
    // já tinham registrado - Espírito Ardiloso, "Você está abaixo" - e essas linhas sumiam do card)
    // Epifania Colorida: quem a Restauração curou ganhou Ponto de Pintura - o Místico escolhe a cor (Rosa ou Branco).
    if (naurenEhItem(item, "Restauração Interior")
      && (acao.condicoesAplicadas ?? []).some(c => c.ativo && (() => { try { const d = fromUuidSync(c.uuid); return naurenEhItem(d, "Ponto de Pintura") || /Ponto de Pintura/.test(d?.name ?? ""); } catch (e) { return false; } })())) {
      for (const t of Array.from(game.user.targets ?? [])) {
        if (!t.actor?.items?.some(i => i.type === "condicao" && naurenEhItem(i, "Ponto de Pintura"))) continue;
        const corE = await naurenEscolherCorDaPintura(t.actor, "epifania").catch(() => "");
        if (corE) this.#beneficiosAtual.push({ label: `Pintura em ${t.name}`, value: corE });
      }
    }
    if (acao.usaEstudar) {
      const linhasEstudo = await this._estudar(item, acao);
      // Cancelou na janela da Análise: devolve o custo e não posta o card (antes gastava 1 Estamina e 1 uso à toa).
      if (linhasEstudo.some(l => l.label === "Análise" && l.value === "cancelada")) {
        await this._removerAvisoAguardando();
        await this._devolverCustosDaAcao(item, acao, "Análise cancelada");
        return;
      }
      this.#beneficiosAtual.push(...linhasEstudo);
    }
    if (acao.usaConjuracaoPoderosa && this.#poderosaEscolhaAtual) {
      if (acao._paginasEmChamasGratis && game.combat) await this.actor.setFlag("nauren", "paginasEmChamas", game.combat.id);
      this.#beneficiosAtual.push(...await naurenArmarPoderosa(this.actor, this.#poderosaEscolhaAtual));
    }
    if (acao.puxarInimigosEstudados) {
      const aliadoTok = Array.from(game.user.targets ?? [])[0];
      const gm = game.users.activeGM;
      if (aliadoTok && gm) {
        const dados = { ladraoUuid: this.actor.uuid, aliadoTokenUuid: aliadoTok.document.uuid };
        const linhasMV = gm.id === game.user.id ? await naurenHandleQueryManipular(dados) : await gm.query(NAUREN_QUERY_MANIPULAR, dados, { timeout: 60000 }).catch(() => []);
        this.#beneficiosAtual.push(...(linhasMV?.length ? linhasMV : [{ label: "Manipular a Verdade", value: "nenhum inimigo estudado a até 9m" }]));
      }
    }
    if (acao.usaEmprestarHabilidade) this.#beneficiosAtual.push(...await this._emprestarHabilidade(item));
    if (item.type === "magia" && item.system.ehMagiaDeMago && !this._acaoGratis) {
      const selvagem = this.actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Grimório Selvagem") && i.system.ativo !== false);
      if (selvagem) {
        const faces = [4, 6, 8][Math.min(2, Math.max(0, (selvagem.system.rankAtual || 1) - 1))];
        const rollS = await new Roll(`1d${faces}`).evaluate();
        if (game.dice3d) await game.dice3d.showForRoll(rollS, game.user, true).catch(() => {});
        const btsS = naurenBotoesDirecaoGrimorio(this.actor, ` ${rollS.total}`);
        const esc = btsS.length <= 1 ? (btsS[0]?.action ?? "0") : await foundry.applications.api.DialogV2.wait({ window: { title: `Grimório Selvagem (1d${faces}: ${rollS.total})` },
          content: `<p>O Grimório se agita: avançar ou voltar <b>${rollS.total}</b> página(s)?</p>`,
          buttons: btsS, rejectClose: false }).catch(() => btsS[0].action);
        // Selvagem: o dado é em páginas; cada 2 páginas (arredondando para cima) = 1 virada.
        const r = await naurenMoverGrimorio(this.actor, (Number(esc) || 1) * Math.ceil(rollS.total / 2) * naurenGrimorio(this.actor).janela);
        this.#beneficiosAtual.push({ label: "Grimório Selvagem", value: `1d${faces} = ${rollS.total}`, breakdown: `${r.texto}: ${r.nomes}` });
      }
    }
    if (acao.rolarBrinde) {
      const rollB = await new Roll("1d6").evaluate();
      if (game.dice3d) await game.dice3d.showForRoll(rollB, game.user, true).catch(() => {});
      const faceB = rollB.total;
      this.#beneficiosAtual.push({ label: "Brinde: 1d6", value: faceB });
      if (faceB === 1) {
        const est = this.actor.system.stress?.value ?? 0, max = this.actor.system.stress?.max ?? 3;
        await this.actor.update({ "system.stress.value": Math.min(max, est + 1) });
        this.#beneficiosAtual.push({ label: "Ressaca", value: est >= max ? "Estresse já no máximo" : "+1 Estresse" });
      }
      const danca = this.actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Dança do Espírito Bêbado") && i.system.ativo !== false);
      if (danca && faceB >= 7 - Math.max(1, Math.min(3, danca.system.rankAtual || 1))) {
        const packCond = game.packs.find(pk => pk.metadata.label === "Nauren - Condições e Venenos");
        const opcoesPoesia = [{ action: "condicao-poesia-lunar", label: "Poesia Lunar (dado no próximo ataque)" }, { action: "condicao-poesia-da-espada", label: "Poesia da Espada (próximo ataque mais barato)" }];
        const esc = await foundry.applications.api.DialogV2.wait({ window: { title: "Dança do Espírito Bêbado" }, content: "<p>A Poesia toma conta de você: receba o efeito de uma Poesia.</p>", buttons: opcoesPoesia, rejectClose: false }).catch(() => null);
        if (esc) {
          const nome = await NaurenAlvoHelper.aplicarCondicao(this.actor, await naurenUuidPorSeed(packCond, esc), 1, null, danca.system.rankAtual || 1).catch(() => null);
          if (nome) this.#beneficiosAtual.push({ label: "Dança do Espírito Bêbado", value: nome });
        }
      }
      if (faceB === 2 && this.actor.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Inundação Espiritual") && i.system.ativo !== false)) {
        const ganho = 1 + Math.max(1, Math.min(3, item.system.rankAtual || 1));
        await naurenConcederRecurso(this.actor, "recursoCustom:energia", String(ganho), item).catch(() => {});
        const packCondI = game.packs.find(pk => pk.metadata.label === "Nauren - Condições e Venenos");
        await NaurenAlvoHelper.aplicarCondicao(this.actor, await naurenUuidPorSeed(packCondI, "condicao-inundacao-espiritual"), 1).catch(() => null);
        this.#beneficiosAtual.push({ label: "Inundação Espiritual", value: `+${ganho} Energia (dobro do Brinde); o resto da Energia deste turno também dobra` });
      }
    }
    if (acao._trocouLugar) this.#beneficiosAtual.push({ label: "Trocou de lugar", value: `com ${acao._trocouLugar}` });
    if (acao.usaConcederHeranca || acao.usaDobrarHeranca) {
      const alvoH = Array.from(game.user.targets ?? [])[0]?.actor ?? this.actor;
      if (acao.usaConcederHeranca) {
        const packCores = game.packs.find(pk => pk.documentName === "Item" && pk.index.some?.(e => e.type === "cor")) ?? game.packs.find(pk => /pigmento/i.test(pk.metadata.label));
        const docs = packCores ? (await packCores.getDocuments()).filter(d => d.type === "cor" && !alvoH.items.some(i => i.type === "cor" && i.name === d.name)) : [];
        if (!docs.length) this.#beneficiosAtual.push({ label: "Colorir!", value: `${alvoH.name} já tem todas as Heranças` });
        else {
          const esc = await foundry.applications.api.DialogV2.wait({ window: { title: `Colorir! — ${alvoH.name}` }, content: `<p>Qual Herança de Cor nova para <b>${alvoH.name}</b>?</p>`,
            buttons: docs.map(d => ({ action: d.id, label: d.name })), rejectClose: false }).catch(() => null);
          const cor = docs.find(d => d.id === esc);
          if (cor) { await naurenCriarItemNoAtor(alvoH, { ...cor.toObject(), _id: undefined }); this.#beneficiosAtual.push({ label: "Colorir!", value: `${alvoH.name} ganhou ${cor.name}` }); }
        }
      }
      if (acao.usaDobrarHeranca) {
        const cores = alvoH.items.filter(i => i.type === "cor");
        if (!cores.length) this.#beneficiosAtual.push({ label: "Conexão com a Arte", value: `${alvoH.name} não tem Heranças de Cor` });
        else {
          const esc = await foundry.applications.api.DialogV2.wait({ window: { title: `Conexão com a Arte — ${alvoH.name}` }, content: `<p>Qual Herança de <b>${alvoH.name}</b> fica com o efeito dobrado?</p>`,
            buttons: cores.map(c => ({ action: c.id, label: c.name })), rejectClose: false }).catch(() => null);
          const cor = cores.find(c => c.id === esc);
          if (cor) {
            for (const outra of cores) if (outra !== cor && outra.getFlag("nauren", "dobrada")) await naurenAtualizarItemViaMestre(outra, { "flags.nauren.dobrada": false });
            await naurenAtualizarItemViaMestre(cor, { "flags.nauren.dobrada": true });
            this.#beneficiosAtual.push({ label: "Conexão com a Arte", value: `${cor.name} de ${alvoH.name} com efeito dobrado` });
          }
        }
      }
    }
    if (acao._beneficioMarca) {
      this.#beneficiosAtual.push({ label: "Benefício da Marca", value: { focoMortal: "Foco Mortal", tiroLetal: "Tiro Letal", reflexos: "Reflexos de Caça" }[acao._beneficioMarca] ?? acao._beneficioMarca });
    }
    if (acao.aplicarVeneno) {
      const venenoU = item.system.venenoCondicaoUuid;
      const alvosV = this.actor.items.filter(i => i.type === "arma" || (i.type === "consumivel" && i.system.ehMunicao));
      if (!venenoU || !alvosV.length) this.#beneficiosAtual.push({ label: item.name, value: !venenoU ? "frasco sem veneno configurado" : "nenhuma arma ou munição no inventário" });
      else {
        const esc = await foundry.applications.api.DialogV2.wait({ window: { title: `${item.name}: onde aplicar?` }, content: "<p>Escolha a arma ou a munição.</p>",
          buttons: alvosV.map(i => ({ action: i.id, label: i.type === "arma" ? i.name : `${i.name} ×${i.system.quantidade ?? 0}` })), rejectClose: false }).catch(() => null);
        const alvoV = esc ? this.actor.items.get(esc) : null;
        if (alvoV?.type === "arma") {
          const dur = await foundry.applications.api.DialogV2.wait({ window: { title: `${alvoV.name}: por quanto tempo?` },
            content: `<p>O veneno fica até ser removido, ou por um número de golpes (cada uso da arma conta, acertando ou não)?</p><input type="number" name="golpes" value="3" min="1" style="width: 100%;">`,
            buttons: [{ action: "sempre", label: "Até ser removido" }, { action: "n", label: "Por este número de golpes", callback: (ev, btn) => Math.max(1, Number(btn.form.elements.golpes.value) || 1) }],
            rejectClose: false }).catch(() => null);
          if (dur) {
            const golpes = dur === "sempre" ? 0 : Number(dur);
            await alvoV.update({ "system.venenoCarregado": venenoU, "system.venenoCargasConsumivelId": "", "system.venenoGolpesRestantes": golpes });
            this.#beneficiosAtual.push({ label: "Veneno aplicado", value: `${alvoV.name} (${golpes ? `${golpes} golpe(s)` : "até ser removido"})` });
          }
        } else if (alvoV) {
          const qtdM = alvoV.system.quantidade ?? 0;
          const esc2 = await foundry.applications.api.DialogV2.wait({ window: { title: `${alvoV.name}: quantas envenenar?` },
            content: `<p>Quantas munições envenenar? (tem ${qtdM})</p><input type="number" name="qtd" value="${Math.min(5, qtdM)}" min="1" max="${qtdM}" style="width: 100%;">`,
            buttons: [{ action: "n", label: "Envenenar esta quantidade", callback: (ev, btn) => Number(btn.form.elements.qtd.value) || 1 }, { action: "todas", label: "Todas" }], rejectClose: false }).catch(() => null);
          if (esc2) {
            const todas = esc2 === "todas";
            await alvoV.update({ "system.municaoVenenoUuid": venenoU, "system.municaoVenenoTodas": todas, "system.municaoVenenoQuantidade": todas ? 0 : Math.min(qtdM, Number(esc2) || 1) });
            this.#beneficiosAtual.push({ label: "Veneno aplicado", value: `${alvoV.name} (${todas ? "todas" : Math.min(qtdM, Number(esc2) || 1)})` });
          }
        }
      }
    }
    if (acao.virarPagina) {
      let passos = acao.virarPagina === 99 ? 0 : acao.virarPagina * naurenGrimorio(this.actor).janela;
      if (acao.virarPagina === 99) {
        // Marcador de Página: direto para a página marcada.
        const g = naurenGrimorio(this.actor);
        let idx = g.paginas.findIndex(m => m.id === g.marcador);
        // Sem marcador ainda: escolhe agora (antes a Ação gastava 1 Estamina e só dizia "nenhuma página marcada").
        if (idx < 0 && g.paginas.length) {
          const escM = await foundry.applications.api.DialogV2.wait({ window: { title: "Marcador de Página" }, content: "<p>Em qual página fica o marcador? (vale até o fim do combate; dá para mudar no painel Grimório)</p>",
            buttons: g.paginas.map((m, i) => ({ action: m.id, label: `${i + 1}. ${m.name}` })), rejectClose: false }).catch(() => null);
          if (escM) { await this.actor.setFlag("nauren", "marcadorPagina", escM); idx = g.paginas.findIndex(m => m.id === escM); }
        }
        if (idx < 0) { this.#beneficiosAtual.push({ label: "Grimório", value: "nenhuma página marcada" }); passos = 0; }
        else passos = Math.floor(Math.min(g.maxInicio, idx) / g.janela) * g.janela - g.inicio;
      } else {
        // Codex Sapiente: pode passar páginas adicionais (+rank).
        const codex = this.actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Codex Sapiente") && i.system.ativo !== false);
        const extra = codex ? Math.max(1, codex.system.rankAtual || 1) : 0;
        if (extra > 0) {
          const botoes = Array.from({ length: extra + 1 }, (_, k) => ({ action: String(k + 1), label: `${k + 1} virada${k ? "s" : ""} (${(k + 1) * 2} páginas)` }));
          const esc = await foundry.applications.api.DialogV2.wait({ window: { title: "Codex Sapiente" }, content: "<p>Quantas viradas? (cada uma passa 2 páginas)</p>", buttons: botoes, rejectClose: false }).catch(() => "1");
          passos = acao.virarPagina * (Number(esc) || 1) * naurenGrimorio(this.actor).janela;
        }
      }
      if (passos) {
        const r = await naurenMoverGrimorio(this.actor, passos);
        this.#beneficiosAtual.push({ label: "Grimório", value: r.texto, breakdown: r.nomes + (r.mudou ? "" : " (já estava no limite)") });
      }
    }
    if (acao.aprenderMagia) {
      const limite = Math.max(1, item.system.rankAtual || 1);
      const ja = this.actor.getFlag("nauren", "magiasOnisciencia") ?? 0;
      if (ja >= limite) this.#beneficiosAtual.push({ label: item.name, value: `já aprendeu ${ja} de ${limite}` });
      else {
        const packM = game.packs.find(pk => pk.metadata.label === "Nauren - Magias");
        const docs = packM ? (await packM.getDocuments()).filter(d => d.type === "magia" && d.system.ehMagiaDeMago && !/^\[Removida/.test(d.name) && !this.actor.items.some(i => i.name === d.name)) : [];
        const esc = docs.length ? await foundry.applications.api.DialogV2.wait({ window: { title: `${item.name} (${ja}/${limite})` }, content: "<p>Qual magia nova aprender?</p>",
          buttons: docs.slice(0, 30).map(d => ({ action: d.id, label: d.name })), rejectClose: false }).catch(() => null) : null;
        const m = docs.find(d => d.id === esc);
        if (m) { await this.actor.createEmbeddedDocuments("Item", [{ ...m.toObject(), _id: undefined }]); await this.actor.setFlag("nauren", "magiasOnisciencia", ja + 1); this.#beneficiosAtual.push({ label: item.name, value: `aprendeu ${m.name}`, breakdown: `${ja + 1}/${limite}` }); }
      }
    }
    if (acao.subirIniciativa) {
      const nivelC = this.actor.system.nivel ?? 1;
      const limiteC = nivelC >= 20 ? 4 : nivelC >= 15 ? 3 : 2;
      const alvosC = Array.from(game.user.targets ?? []).slice(0, limiteC);
      const gmC = game.users.activeGM;
      for (const t of alvosC) {
        const dadosC = { tipo: "subirIniciativa", tokenUuid: t.document.uuid };
        const r = gmC?.id === game.user.id ? await naurenHandleQueryItemMestre(dadosC) : await gmC?.query(NAUREN_QUERY_ITEM_MESTRE, dadosC, { timeout: 15000 }).catch(() => null);
        this.#beneficiosAtual.push({ label: "Comoção", value: r ? `${t.document.name} sobe 1 casa` : `${t.document.name} já está no topo (ou fora do combate)` });
      }
      if (game.user.targets.size > limiteC) this.#beneficiosAtual.push({ label: "Comoção", value: `só ${limiteC} aliados no seu nível` });
    }
    if (acao.escolherAtributos) {
      const nomesAtr = { forca: "Força", agilidade: "Agilidade", estamina: "Estamina", inteligencia: "Inteligência", destino: "Destino" };
      const opcoesAtr = Object.entries(nomesAtr).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
      let escolha = null;
      await foundry.applications.api.DialogV2.wait({ window: { title: item.name },
        content: `<p>Quais 2 atributos sobem (+1 por rank)?</p><div style="display:flex;gap:8px;"><select id="nauren-atr-1">${opcoesAtr}</select><select id="nauren-atr-2">${opcoesAtr.replace('value="agilidade"', 'value="agilidade" selected')}</select></div>`,
        buttons: [{ action: "ok", label: "Confirmar", default: true, callback: (ev, btn, dialog) => { const f = dialog.element ?? btn.form; escolha = [f.querySelector("#nauren-atr-1")?.value, f.querySelector("#nauren-atr-2")?.value]; } }, { action: "cancelar", label: "Cancelar" }],
        rejectClose: false }).catch(() => null);
      if (escolha && escolha[0] && escolha[1] && escolha[0] !== escolha[1]) {
        const porRank = [{ rank: 2, valor: "2" }, { rank: 3, valor: "3" }];
        await item.update({ "system.modificadores": escolha.map(c => ({ campo: c, valor: "1", porRank })), "system.efeitosVinculados": [] });
        this.#beneficiosAtual.push({ label: item.name, value: `${nomesAtr[escolha[0]]} e ${nomesAtr[escolha[1]]} +${Math.max(1, item.system.rankAtual || 1)}`, breakdown: "1 por ponto nesta habilidade" });
      } else if (escolha) this.#beneficiosAtual.push({ label: item.name, value: "escolha 2 atributos diferentes" });
    }
    if (acao.usaDomar) {
      const alvoTokD = Array.from(game.user.targets ?? [])[0];
      const gmD = game.users.activeGM;
      if (!alvoTokD) this.#beneficiosAtual.push({ label: "Domar", value: "marque a besta (T)" });
      else if (gmD) {
        const dadosD = { cacadorUuid: this.actor.uuid, alvoUuid: alvoTokD.document.uuid };
        const r = gmD.id === game.user.id ? await naurenHandleQueryDomar(dadosD) : await gmD.query(NAUREN_QUERY_DOMAR, dadosD, { timeout: 60000 }).catch(() => null);
        this.#beneficiosAtual.push(...(r?.linhas ?? [{ label: "Domar", value: "sem resposta do Mestre" }]));
      }
    }
    if (acao.usaBestaInicial) {
      const botoes = NAUREN_MASCOTES_INICIAIS.map((d, k) => ({ action: d.seedId, label: d.nome, default: k === 0 }));
      const escolha = await foundry.applications.api.DialogV2.wait({ window: { title: `${item.name} — besta inicial` },
        content: `<p>Escolha a sua besta companheira. Ela entra no seu nível e sobe de nível junto com você.</p>`,
        buttons: botoes, rejectClose: false }).catch(() => null);
      const gmB = game.users.activeGM;
      if (!NAUREN_MASCOTES_INICIAIS.some(d => d.seedId === escolha)) this.#beneficiosAtual.push({ label: "Besta inicial", value: "nenhuma escolhida" });
      else if (gmB) {
        const dadosB = { cacadorUuid: this.actor.uuid, seedId: escolha };
        const r = gmB.id === game.user.id ? await naurenHandleQueryBestaInicial(dadosB) : await gmB.query(NAUREN_QUERY_BESTA_INICIAL, dadosB, { timeout: 60000 }).catch(err => { console.warn("Nauren RPG | Besta inicial", err); return null; });
        this.#beneficiosAtual.push(...(r?.linhas ?? [{ label: "Besta inicial", value: "sem resposta do Mestre" }]));
      } else this.#beneficiosAtual.push({ label: "Besta inicial", value: "precisa do Mestre conectado" });
    }
    if (acao.usaRevelarHabilidades) {
      const alvoR = Array.from(game.user.targets ?? [])[0]?.actor;
      if (alvoR) {
        const lista = alvoR.items.filter(i => ["habilidade", "magia"].includes(i.type)).map(i => i.name);
        await foundry.applications.api.DialogV2.prompt({ window: { title: `${item.name} — ${alvoR.name}` },
          content: lista.length ? `<p>Habilidades de <b>${alvoR.name}</b>:</p><ul>${lista.map(n => `<li>${n}</li>`).join("")}</ul>` : `<p>${alvoR.name} não tem habilidades.</p>`,
          ok: { label: "Ok" }, rejectClose: false }).catch(() => null);
        this.#beneficiosAtual.push({ label: "Conhecimento", value: `você conhece as habilidades de ${alvoR.name}` });
      }
    }
    // Conjuração Poderosa: a magia usou os efeitos armados - a Condição sai.
    if (condPoderosaIdLocal || this.#poderosaAtual?.condId) {
      const idP = condPoderosaIdLocal ?? this.#poderosaAtual.condId;
      // À vista no card da magia (antes só nos detalhes): o que a Conjuração Poderosa fez nela.
      const efP = this.#poderosaAtual?.efeitos ?? [];
      if (efP.length) {
        const cont = {}; for (const k of efP) cont[k] = (cont[k] ?? 0) + 1;
        this.#beneficiosAtual.push({ label: "Conjuração Poderosa", value: Object.entries(cont).map(([k, n]) => `${NAUREN_PODEROSA_EFEITOS[k]?.nome ?? k}${n > 1 ? ` ×${n}` : ""}`).join(", "), breakdown: "efeitos armados usados nesta magia" });
      }
      if (this.actor.items.get(idP)) await this.actor.deleteEmbeddedDocuments("Item", [idP]).catch(() => {});
      this.#poderosaAtual = null;
    }
    // Estudos usados neste ataque: consome o que dura "até o próximo ataque".
    // Qualquer ataque seu contra o alvo encerra as informações "novas" (Avaliar).
    // "Você está abaixo" só sai da fila quando foi aplicado (acerto); num erro continua armada para o próximo ataque.
    if ((this.#estudoAtual?.consumir?.length || this.#estudoAtual?.novas > 0 || this.#estudoAtual?.abaixoAplicado) && this.#estudoAtual.alvo) {
      await naurenOperarEstudo(this.#estudoAtual.alvo, { operacao: "consumir", dono: { uuid: this.actor.uuid, nome: this.actor.name }, chaves: this.#estudoAtual.consumir ?? [], zerarNovas: true, valor: this.#estudoAtual.abaixoAplicado ? "abaixo" : undefined });
    }
    if (this.#estudoAtual?.gastarEstrategia && this.#estudoAtual.alvo) {
      await naurenOperarEstudo(this.#estudoAtual.alvo, { operacao: "estrategia", dono: { uuid: this.actor.uuid, nome: this.actor.name }, valor: 1 });
    }
    if (acao.usaConverterRecurso) {
      const de = this._recursoProprio(acao.converterDe);
      const para = this._recursoProprio(acao.converterPara);
      if (de && para && de.valor > 0) {
        let q = acao.converterModo === "tudo" ? de.valor
          : acao.converterModo === "fixo" ? Math.max(0, Math.round(Number(acao.converterQuantidade) || 0))
          : await (async () => {
            const espaco = Math.max(0, para.max - para.valor);
            const tetoTxt = String(acao.converterMaximo ?? "").trim();
            const teto = tetoTxt ? Math.max(0, Math.round(naurenInterpretarModificador(tetoTxt.replace(/@crescimento\b/g, String(this.#nivelCrescimentoAtual ?? 0)), this.actor, item)?.valor ?? 0)) : Infinity;
            const max = Math.min(espaco, teto, de.valor);
            const motivo = teto <= espaco ? `Até ${teto} por uso${this.#nivelCrescimentoAtual ? ` (com Crescimento ${this.#nivelCrescimentoAtual})` : ""}` : `Sua ${para.nome} só tem espaço para ${espaco}`;
            return this._popupEscolherQuantidadeRecurso(item.name, acao.converterDe, 1, max, motivo);
          })();
        q = Math.min(q || 0, de.valor);
        if (q > 0) {
          const paraAtual = this._recursoProprio(acao.converterPara);
          const ganho = Math.min(q, Math.max(0, paraAtual.max - paraAtual.valor));
          await this.actor.update({ [de.caminho]: de.valor - q, [para.caminho]: paraAtual.valor + ganho });
          this.#beneficiosAtual.push({ label: "Converteu", value: `${q} de ${de.nome} → +${ganho} de ${para.nome}`, breakdown: ganho < q ? `${para.nome} já estava perto do máximo (${paraAtual.max})` : "" });
        }
      } else if (de) {
        this.#beneficiosAtual.push({ label: "Converteu", value: `nada (você não tem ${de.nome})` });
      }
    }
    if (acao.restauraRecurso) {
      const rec = naurenRecursoDoAtor(this.actor, acao.restauraRecurso);
      if (rec) {
        const q = String(acao.restauraQuantidade ?? "").trim();
        const det = {};
        const ganho = await naurenConcederRecurso(this.actor, acao.restauraRecurso === "estamina" ? "estaminaCombate" : acao.restauraRecurso, q || String(Math.max(0, rec.max - rec.valor)), item, det);
        const depois = naurenRecursoDoAtor(this.actor, acao.restauraRecurso);
        this.#beneficiosAtual.push({ label: rec.nome, value: ganho > 0 ? `+${ganho} (agora ${depois?.valor ?? rec.valor + ganho} de ${rec.max})` : `já estava cheio (${rec.valor} de ${rec.max})`, breakdown: q ? (det.breakdown || q) : "até o máximo" });
      }
    }
    if (acao.recarregaUsos) {
      const linha = await naurenExecutarRecarga(this.actor, item, acao);
      if (linha) this.#beneficiosAtual.push(linha);
      if (this._naurenRecargaGratis) {
        await item.setFlag("nauren", "recargaGratis", { combate: this._naurenRecargaGratis.chave, usadas: this._naurenRecargaGratis.usadas }).catch(() => {});
        this.#beneficiosAtual.push({ label: "Custo", value: "sem Estamina", breakdown: "Recarga grátis deste combate" });
      }
    }
    if (acao.usaConcederBeneficios) await this._concederBeneficios(item, acao, resultadoAlvos.tokensAfetados ?? []);
    if (acao.usaMoverEscolhendo && (acao.moverMomento !== "antes" || acao.moverQuem === "alvo")) await this._moverEscolhendo(item, acao, resultadoAlvos.tokensAfetados ?? [], resultadoAlvos.naoMover);
    const { breakdownAlvos, resumoAlvos } = resultadoAlvos;
    // Fase 5: ajuste do alvo na rolagem de ataque, mostrado na caixa do d20.
    this.#ajustesAtaqueAtual = resultadoAlvos.ajustesAtaque ?? [];
    // Nome do(s) alvo(s) + ✓/✗ sempre visível (não precisa expandir o card) -
    // aparece mesmo em Ações sem teste de ataque, onde não há caixa de d20
    // pra pendurar um ícone do topo (removido de propósito - o ✓/✗ ao lado
    // do nome já é o suficiente e fica mais harmônico com o resto do card).
    if (resumoAlvos) secondaryLines.push({ label: "Alvo(s)", value: resumoAlvos });
    // Ação sem efeito automático no alvo (ex.: Invisível no Caos): o nome do alvo some do card sem isto.
    const nomesAfetados = ((resultadoAlvos.tokensAfetados ?? []).length ? resultadoAlvos.tokensAfetados : [])
      .map(t => t?.name ?? t?.document?.name).filter(Boolean);
    if (!nomesAfetados.length && acao.modoAlvo === "selecionado") nomesAfetados.push(...(this._nomesAlvosNoInicio ?? []));
    if (!resumoAlvos && !breakdownAlvos?.length && nomesAfetados.length && acao.modoAlvo && acao.modoAlvo !== "nenhum")
      secondaryLines.push({ label: "Alvo(s)", value: nomesAfetados.join(", ") });
    // Lembrete do que a mesa resolve à mão (ver campoAcao > lembreteNoCard); "@alvo" vira o(s) nome(s).
    if (acao.lembreteNoCard)
      secondaryLines.push({ label: "Na mesa", value: String(acao.lembreteNoCard).replace(/@alvo\b/g, nomesAfetados.join(", ") || "o alvo") });
    if (resultadoAlvos.usouDanoMaximo) {
      for (const linha of secondaryLines) {
        if (!linha?._max) continue;
        const ajuste = (Number(linha.value) || 0) - linha._max.totalOriginal; // bônus somados depois (colisão, condicional...)
        linha.value = linha._max.total + ajuste;
        linha.breakdown = String(linha.breakdown ?? "").replace(linha._max.textoOriginal, linha._max.texto);
        linha.label = `${linha.label} (MÁXIMO)`;
      }
    }
    // Mímica de Libélula: agiu em Prioridade (sem ser movimento) - pode mover metade do movimento (gasta 1 Estamina).
    if (this.#emPrioridadeAtual?.deNome !== undefined && this.#emPrioridadeAtual && !acao.usaMoverEscolhendo
        && this.actor.items.some(i => i.type === "habilidade" && i.system.moverAposPrioridade && i.system.ativo !== false)
        && (this.actor.system.estaminaCombate?.value ?? 0) >= 1) {
      const tokM = this.actor.getActiveTokens?.(true)?.[0];
      const metade = Math.floor((this.actor.system.movimentoTotal ?? 6) / 2);
      if (tokM && metade > 0) {
        const esc = await naurenEscolherPontoNoMapa({ nome: "Mímica de Libélula", largura: tokM.document.width, altura: tokM.document.height, origem: tokM.center, alcanceMetros: metade,
          validar: c => {
            try { if (CONFIG.Canvas.polygonBackends?.move?.testCollision?.(tokM.center, c, { type: "move", mode: "any" })) return "há uma parede no caminho."; } catch (err) { /* sem checagem */ }
            return canvas.tokens.placeables.some(t => t !== tokM && Math.hypot(t.center.x - c.x, t.center.y - c.y) < canvas.grid.size * 0.5) ? "a casa está ocupada." : "";
          },
          textoAjuda: `Mímica de Libélula: mover até ${metade}m (gasta 1 Estamina). Esc: não mover.` });
        if (esc) {
          await naurenMoverTokenPara(tokM.document, esc);
          await this.actor.update({ "system.estaminaCombate.value": (this.actor.system.estaminaCombate?.value ?? 1) - 1 });
          secondaryLines.push({ label: "Mímica de Libélula", value: `moveu (até ${metade}m)`, breakdown: "−1 Estamina" });
        }
      }
    }
    // Traço Celestial: agiu numa Prioridade gerada por um ALIADO - pode
    // escrever uma Palavra num alvo a até 4m (Lerdeza, Loucura ou Fragmentado).
    try {
      const tracoC = this.actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Traço Celestial") && i.system.ativo !== false);
      const deUuidC = this.#emPrioridadeAtual?.deUuid;
      if (tracoC && deUuidC && item !== tracoC && !this.#emPrioridadeAtual?.tomadaDe && !naurenUsoDisponivel(tracoC)) {
        secondaryLines.push({ label: "Traço Celestial", value: "já usado neste turno", breakdown: "1 por turno (livro 0.8)" });
      } else if (tracoC && deUuidC && item !== tracoC && !this.#emPrioridadeAtual?.tomadaDe) {
        let doadorC = null;
        try { const d = fromUuidSync(deUuidC); doadorC = d?.actor ?? d; } catch (err) { doadorC = null; }
        const meuTokC = this.actor.getActiveTokens?.(true)?.[0];
        const tokDoadorC = doadorC?.getActiveTokens?.(true)?.[0];
        const ehAliado = doadorC && doadorC !== this.actor && meuTokC && tokDoadorC && tokDoadorC.document.disposition === meuTokC.document.disposition;
        if (ehAliado) {
          const alvoTokC = Array.from(game.user.targets ?? []).find(t => t.actor && t.actor !== this.actor);
          const dist = alvoTokC && meuTokC ? naurenMedirDistanciaBordas(meuTokC, alvoTokC) : Infinity;
          if (!alvoTokC) secondaryLines.push({ label: "Traço Celestial", value: "não usado", breakdown: "marque um alvo (T) a até 4m para escrever a Palavra" });
          else if (dist > 4.01) secondaryLines.push({ label: "Traço Celestial", value: "não usado", breakdown: `${alvoTokC.name} está a ${Math.round(dist)}m (alcance 4m)` });
          else {
            const escC = await foundry.applications.api.DialogV2.wait({
              window: { title: `Traço Celestial — ${alvoTokC.name}` },
              content: `<p>Você agiu numa Prioridade de <b>${doadorC.name}</b>. Escrever uma Palavra em <b>${alvoTokC.name}</b>?</p>`,
              buttons: [{ action: "condicao-lerdeza", label: "Lerdeza" }, { action: "condicao-loucura", label: "Loucura" }, { action: "condicao-fragmentado", label: "Fragmentado" }, { action: "nao", label: "Não" }],
              rejectClose: false
            }).catch(() => "nao");
            if (escC && escC !== "nao") {
              await naurenConsumirUsoDaHabilidade(tracoC).catch(() => null);
              const packCondC = game.packs.find(pk => pk.metadata.label === "Nauren - Condições e Venenos");
              const aplicados = [];
              for (const seed of ["condicao-palavra", escC]) {
                const uuidC = await naurenUuidPorSeed(packCondC, seed);
                if (!uuidC) continue;
                const exC = NaurenAlvoHelper.usuarioExecutor(alvoTokC.actor);
                const nomeC = exC?.id === game.user.id ? await NaurenAlvoHelper.aplicarCondicao(alvoTokC.actor, uuidC, 1).catch(() => null)
                  : await exC?.query(NAUREN_QUERY_APLICAR_CONDICAO, { actorUuid: alvoTokC.actor.uuid, uuid: uuidC, acumulos: 1 }, { timeout: 20000 }).catch(() => null);
                if (nomeC) aplicados.push(nomeC);
              }
              secondaryLines.push({ label: "Traço Celestial", value: aplicados.length ? `${alvoTokC.name}: ${aplicados.join(" + ")}` : "falhou (o Mestre está conectado?)", breakdown: `agiu na Prioridade de ${doadorC.name}` });
            }
          }
        }
      }
    } catch (err) { console.warn("Nauren RPG | Traço Celestial", err); }
    for (const b of this.#beneficiosAtual) secondaryLines.push(b);
    if (acao.efeitoPermanenteCampo && acao.efeitoPermanenteValor) {
      const valorBase = (acao.penitenciaAceitaAgora && String(acao.efeitoPermanenteValorPenitencia ?? "").trim()) ? acao.efeitoPermanenteValorPenitencia : acao.efeitoPermanenteValor;
      const textoValor = String(valorBase).replace(/@penitenciaAceita\b/g, acao.penitenciaAceitaAgora ? "1" : "0")
        .replace(/@rank\b/gi, String(this._rankEfetivo(item)))
        .replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, this.actor)));
      const delta = Math.round(naurenAvaliarExpressaoSimples(textoValor) || 0);
      const nomeEfeito = acao.efeitoPermanenteNome || `${item.name}: permanente`;
      const r = delta ? await naurenSomarEfeitoPermanente(this.actor, { nome: nomeEfeito, campo: acao.efeitoPermanenteCampo, delta, img: item.img, origem: item.name }) : null;
      if (r) secondaryLines.push({ label: "Efeito permanente em você", value: `${delta > 0 ? "+" : ""}${delta} ${NAUREN_CAMPOS_MODIFICADOR_OPCOES[acao.efeitoPermanenteCampo] ?? acao.efeitoPermanenteCampo}`, breakdown: `${r.nome} (total ${r.total})` });
    }
    // Fase 7: cura aliados a até X m de você (ex.: Nova Sagrada com penitência).
    if (acao.curaAliadosFormula && (!acao.curaAliadosSoComPenitencia || acao.penitenciaAceitaAgora)) {
      const meuTokenCura = canvas?.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0];
      const raio = parseFloat(acao.curaAliadosRaio) || parseFloat(acao.templateTamanho) || 0;
      let rollCura = null;
      try { rollCura = await new Roll(String(acao.curaAliadosFormula).replace(/@(\w+)/g, (m, n) => String(naurenResolverTokenFormula(n, this.actor)))).evaluate(); } catch (err) { rollCura = null; }
      if (rollCura && meuTokenCura) {
        const curados = [];
        for (const t of canvas.tokens.placeables) {
          if (!t.actor || t === meuTokenCura || t.document.disposition !== meuTokenCura.document.disposition) continue;
          if (raio && naurenMedirDistanciaBordas(meuTokenCura, t) > raio) continue;
          const antes = t.actor.system.vida?.value ?? 0;
          const depois = Math.min(t.actor.system.vida?.max ?? antes, antes + Math.max(0, rollCura.total));
          if (t.actor.isOwner) await t.actor.update({ "system.vida.value": depois });
          else await naurenOperarRecursoViaMestre(t.actor, "vida", depois);
          curados.push(`${naurenNomeDeToken(t)} (+${depois - antes})`);
        }
        secondaryLines.push({ label: "Cura em aliados", value: rollCura.total, breakdown: `${naurenFormulaParaTexto(acao.curaAliadosFormula, this.actor)} → ${naurenTextoRolagem(rollCura)}${raio ? ` • até ${raio}m` : ""} • ${curados.join(", ") || "nenhum aliado ao alcance"}` });
      }
    }
    for (const m of this.#movimentosAtual) secondaryLines.push(m);
    // Reações dos defensores (Proteger, Dificuldade): sempre visíveis (auditoria).
    for (const l of this.#reacaoPreAtaqueAtual?.linhas ?? []) secondaryLines.push({ label: l.label, value: l.value, breakdown: l.breakdown });
    // Buffs de próxima ação consumidos nesta Ação (auditoria).
    secondaryLines.push(...await this._consumirBuffsProximaAcao());
    // Resumo da Penitência (ver bloco "usaPenitencia" no início desta
    // função) - sempre visível, junto do resto do resultado, nunca uma
    // notificação solta separada.
    secondaryLines.push(...penitenciaLinhasResumo);

    const prioridade = await this._montarPrioridadeDoCard(item, acao, resultadoAlvos.tokensAfetados ?? [], resultadoAlvos.prioridadeGasta);
    this.#entidadePendente = acao.usaEntidade ? { item, acao, regiao: resultadoAlvos.regiao ?? null, atingidos: resultadoAlvos.atingidos ?? [] } : null;
    this.#proximaAcaoAtual = null; // o buff valeu só para esta Ação
    // Fase 4: "Usei uma Ação" - filtrável por tipo de item, item, nome e "só ataques".
    // 0.94.16: movimento dos tokens (Motion) - o plano vai para todas as telas junto com a animação.
    let planoMotion = null;
    try {
      planoMotion = naurenMotionPlanoDaAcao(this.actor, item, acao, resultadoAlvos, {
        critico: !!(acao.ehAtaque && ehCritico),
        falhaCritica: !!(acao.ehAtaque && d20Result && naurenFaceD20(d20Result.rolls?.[d20Result.usedIndex]) === 1)
      });
    } catch (err) { console.warn("Nauren RPG | movimento dos tokens (plano)", err); }
    naurenAnimarAcao(this.actor, item, acao, resultadoAlvos, planoMotion).catch(err => { console.warn("Nauren RPG | animação da Ação", err); naurenMotionEnviar(planoMotion, false); });
    if (acao.repetirSeDanoMaximo && this._danoDadosTodosMax && (resultadoAlvos.atingidos ?? []).length) this._repetirPendente = { nome: acao.nome || item.name };
    // Condições "sai ao atacar" (Invisível, Fascinado...): somem depois de um teste de ataque, com card.
    if (acao.ehAtaque) NaurenAlvoHelper.consumirAoAtacar(this.actor).then(nomes => { if (nomes.length) naurenPostarCard({ ator: this.actor, titulo: "Condição encerrada", icone: "icons/magic/time/hourglass-tilted-gray.webp", fonte: `${item.name}: atacou`,
      linhas: nomes.map(n => ({ label: n, value: "terminou", breakdown: "some ao atacar" })) }); }).catch(() => {});
    naurenProcessarGatilhos("euUseiAcao", this.actor, {
      itemUsadoUuid: item.uuid, acaoNome: acao.nome, tipoItemUsado: item.type,
      ehAtaque: !!acao.ehAtaque, ehCura: naurenAcaoEhCura(acao), categoria: acao.categoria ?? "",
      emPrioridade: !!this.#emPrioridadeAtual
    }).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (usei uma Ação).", err));

    this._ultimaMensagemCard = null;
    const efeitosTardios = this.#efeitosEmAtaquesAtual.slice(nEfeitosJaNoCard);
    if (efeitosTardios.length) mainBreakdown.push(...efeitosTardios);
    await this._postRollCard({
      title: titulo,
      icon: item.img,
      d20Result,
      secondaryLines,
      breakdown: mainBreakdown,
      breakdownAlvos,
      description: await naurenDescricaoParaChat(item),
      extras: cartasExtras,
      ajusteCritico,
      acoesManuais: { dano: danoParaAlvo, cura: curaParaAlvo, custoEstamina: custoEst, custoMana: custoManaReal },
      prioridade
    });
    // Fase 5 (M10): invocar fichas (card próprio, depois do card da Ação).
    if (acao.usaInvocar) await this._invocarFichas(item, acao).catch(err => console.warn("Nauren RPG | invocação", err));
    // "Dar Prioridade" com alvo marcado: concede pelo mesmo caminho do botão do card (registro, limite, passivas).
    if (acao.usaDarPrioridade && !(acao.ehAtaque && (await this._tentarSuprimirPrioridade()))) {
      const meusTok = new Set(this.actor.getActiveTokens?.(true)?.map(t => t.document.uuid) ?? []);
      const alvosP = Array.from(game.user.targets ?? []).map(t => t.document.uuid).filter(u => !meusTok.has(u));
      if (alvosP.length) {
        const msgP = this._ultimaMensagemCard;
        if (msgP?.getFlag("nauren", "cardData")?.prioridade?.selecao) await naurenConcederPrioridadePeloCard(msgP, alvosP);
        else for (const u of alvosP) { const d = await fromUuid(u).catch(() => null); if (d?.actor) { naurenMotionEmTodos("prioridade", { token: d.uuid }); await naurenDispararEventoNoDono(d.actor, "recebeuPrioridade", { origemAtorUuid: this.actor.uuid }); } }
      }
    }
  }

  /**
   * Bloco de Prioridade do card (livro, Cap. III):
   *   N/P            - só informa que não gera.
   *   alvosAfetados  - quem foi afetado recebe automaticamente.
   *   noRaio         - todos do lado configurado no raio recebem automaticamente.
   *   escolha        - botões com os personagens do lado configurado; N cliques.
   * Quem recebe automaticamente tem o evento "recebeuPrioridade" disparado
   * no cliente do seu dono. Habilidades com "suprime Prioridade por uso"
   * (ex.: Postura Real) anulam a Prioridade de um ataque P/I.
   */
  /**
   * Janela de reação antes da rolagem de um ataque (Fase 5b). Para cada
   * alvo marcado, procura personagens do lado do alvo com uma habilidade de
   * reação ao alcance e com uso, e pergunta ao dono de cada um (no cliente
   * dele). No máximo 1 Proteger por alvo; Dificuldade vale para o ataque todo.
   * Devolve { redirecionar: Map(tokenUuidOriginal -> TokenDocument), dificuldade: [texto], linhas: [...] }.
   */
  async _janelaReacaoPreAtaque(item, acao) {
    const resultado = { redirecionar: new Map(), dificuldade: [], linhas: [] };
    const alvos = Array.from(game.user.targets ?? []);
    if (!alvos.length || !canvas?.ready) return resultado;
    const meuToken = canvas.tokens.controlled.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
    const minhaDisp = meuToken?.document?.disposition;
    const atacanteNome = naurenNomeDeToken(meuToken) || this.actor.name;
    const reatoresUsados = new Set();
    for (const alvo of alvos) {
      const dispAlvo = alvo.document.disposition;
      for (const t of canvas.tokens.placeables) {
        const ator = t.actor;
        // Quem está do lado do alvo pode reagir, mesmo que o atacante também seja aliado.
        if (!ator || ator === this.actor || t === meuToken || t.document.disposition !== dispAlvo) continue;
        for (const it of ator.items) {
          const tipo = it.type === "habilidade" && it.system.ativo !== false ? it.system.reacaoPreAtaque : "";
          if (!tipo || !naurenUsoDisponivel(it)) continue;
          const ehOProprio = t === alvo;
          const soEu = tipo === "escudoVivo" || tipo === "desviar"; // Fase 6 (M14): reações de quem é atacado
          if (soEu && !ehOProprio) continue;
          if (soEu && resultado.redirecionar.has(alvo.document.uuid)) continue;
          if (!soEu && ehOProprio && (tipo === "proteger" || it.system.reacaoQuem !== "euOuAliado")) continue;
          if (tipo === "proteger" && resultado.redirecionar.has(alvo.document.uuid)) continue;
          if (tipo === "dificuldade" && resultado.dificuldade.length) continue;
          const chave = `${ator.uuid}:${it.id}`;
          if (reatoresUsados.has(chave)) continue;
          const alcance = parseFloat(it.system.reacaoAlcance);
          // Fase 6 (M14): quem pode virar o novo alvo (calculado aqui, onde o mapa está à vista).
          let opcoesAlvo = null;
          if (soEu) {
            // Raio do novo alvo (padrão 1 m = colado); vazio ou inválido também vale 1.
            const raioCfg = parseFloat(String(it.system.reacaoNovoAlvoRaio ?? "1").replace(",", "."));
            const raio = Number.isFinite(raioCfg) && raioCfg > 0 ? raioCfg : 1;
            const centro = tipo === "escudoVivo" ? alvo : meuToken;
            opcoesAlvo = canvas.tokens.placeables.filter(o => o.actor && o !== alvo && o !== meuToken && !o.document.hidden && (o.actor.system?.vida?.value ?? 1) > 0
              && (tipo !== "escudoVivo" || o.document.disposition === dispAlvo)
              && (!centro || naurenMedirDistanciaBordas(o, centro) <= raio + 0.01))
              .map(o => ({ uuid: o.document.uuid, nome: naurenNomeDeToken(o) }));
            if (!opcoesAlvo.length) continue; // ninguém para pôr no lugar
          }
          if (Number.isFinite(alcance) && !ehOProprio) {
            let d = Infinity;
            try { d = naurenMedirDistanciaBordas(t, alvo); } catch (err) { d = Infinity; }
            if (d > alcance) continue;
          }
          const executor = NaurenAlvoHelper.usuarioExecutor(ator);
          if (!executor) continue;
          const dados = { actorUuid: ator.uuid, itemId: it.id, atacanteNome, alvoNome: naurenNomeDeToken(alvo), opcoesAlvo };
          const resposta = executor.id === game.user.id
            ? await naurenHandleQueryReacaoPreAtaque(dados)
            : await executor.query(NAUREN_QUERY_REACAO_PRE_ATAQUE, dados, { timeout: naurenTimeoutReacaoMs() }).catch(() => null);
          if (!resposta) continue;
          reatoresUsados.add(chave);
          const nomeReator = naurenNomeDeToken(t);
          if (tipo === "proteger") {
            resultado.redirecionar.set(alvo.document.uuid, t.document);
            resultado.linhas.push({ label: `${it.name} (${nomeReator})`, value: `recebe o ataque no lugar de ${naurenNomeDeToken(alvo)}`, breakdown: resposta.custo });
          } else if (soEu) {
            const novoDoc = await fromUuid(resposta.escolhido || opcoesAlvo[0].uuid).catch(() => null);
            if (!novoDoc) continue;
            // Desviar: quem ataca pode pagar para resistir (o custo está na Habilidade de quem desvia).
            const recR = tipo === "desviar" ? (it.system.reacaoResistirRecurso || "") : "";
            const qtdR = Math.max(0, Number(it.system.reacaoResistirQuantidade) || 0);
            if (recR && qtdR) {
              const nomeR = NAUREN_REACAO_RESISTIR_OPCOES[recR]?.replace(/ \(.*\)$/, "") ?? recR;
              const podeR = recR === "estresse" ? NaurenAlvoHelper._podePagar(this.actor, "estresse", qtdR) : Number(naurenResolverTokenFormula(recR, this.actor)) >= qtdR;
              const resistiu = podeR && await foundry.applications.api.DialogV2.confirm({ window: { title: `${it.name} — ${nomeReator}` },
                content: `<p><b>${nomeReator}</b> tenta desviar seu ataque para <b>${naurenNomeDeToken(novoDoc)}</b>.</p><p>Pagar <b>${qtdR} ${nomeR}</b> para resistir e manter o alvo?</p>`,
                yes: { label: "Resistir" }, no: { label: "Deixar desviar" }, rejectClose: false }).catch(() => false);
              if (resistiu) {
                if (recR === "estresse") await this.actor.update({ "system.stress.value": (this.actor.system.stress?.value ?? 0) + qtdR });
                else await naurenConcederRecurso(this.actor, recR, String(-qtdR));
                resultado.linhas.push({ label: `${it.name} (${nomeReator})`, value: "resistido", breakdown: `${atacanteNome} pagou ${qtdR} ${nomeR} e manteve o alvo • ${resposta.custo}` });
                continue;
              }
            }
            resultado.redirecionar.set(alvo.document.uuid, novoDoc);
            resultado.linhas.push({ label: `${it.name} (${nomeReator})`, value: `o ataque vai para ${naurenNomeDeToken(novoDoc)}`,
              breakdown: [tipo === "escudoVivo" ? `${nomeReator} pôs um aliado na frente do golpe` : `${nomeReator} desviou o ataque`, resposta.custo].filter(Boolean).join(" • ") });
          } else {
            resultado.dificuldade.push(`${it.name} (${nomeReator})`);
            resultado.linhas.push({ label: `${it.name} (${nomeReator})`, value: "Dificuldade imposta à rolagem", breakdown: resposta.custo });
          }
        }
      }
    }
    return resultado;
  }

  async _montarPrioridadeDoCard(item, acao, tokensAfetados, prioridadeGasta = null) {
    // Nada é concedido automaticamente: o card sempre abre um painel para o
    // jogador ou o Mestre confirmar (habilidades como Postura Real ou Passo
    // Gatuno podem anular a Prioridade, e só a mesa sabe disso na hora).
    const cfg = naurenResolverPrioridade(item, acao, this._rankEfetivo(item));
    const meuToken = canvas?.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
    const contexto = { origemAtorUuid: this.actor.uuid, itemNome: item.name, motivo: acao.ehAtaque ? "ataque" : "habilidade", indicador: cfg?.indicador ?? "" };

    // Dar Prioridade: o card nasce com os alvos da própria Ação já marcados; logo depois de
    // postado, a concessão é feita por ele (um caminho só) e o bloco fecha como "concedido".
    if (acao.usaDarPrioridade && meuToken) {
      const meus = new Set(this.actor.getActiveTokens?.(true)?.map(t => t.document.uuid) ?? []);
      const alvosDaAcao = Array.from(game.user.targets ?? []).map(t => t.document).filter(d => !meus.has(d.uuid));
      const selecao = naurenMontarSelecaoPrioridade(meuToken, "todos", alvosDaAcao.length || 0, false, alvosDaAcao, this.actor.uuid, "PA");
      if (selecao) return { indicador: "PA", sigla: "P/A", rotulo: "Prioridade", contexto: { ...contexto, indicador: "PA", motivo: "darPrioridade" },
        texto: alvosDaAcao.length ? "Prioridade dada pela Ação" : "Escolha quem recebe a Prioridade", selecao };
    }

    // "Não gera Prioridade" (ex.: Condemnatio com penitência, mesmo sem teste de ataque) vale antes do resto.
    if (acao.naoGeraPrioridade && !cfg) {
      const fonteNP0 = acao._semPrioridadeFonte || item.name;
      return { indicador: "NP", sigla: "N/P", rotulo: "", contexto, texto: `Não gera Prioridade (${fonteNP0}).` };
    }
    if (!cfg) {
      if (!game.settings.get("nauren", "prioridadeOpcionalNoCard")) return null;
      const selecao = naurenMontarSelecaoPrioridade(meuToken, "todos", 0, false, [], this.actor.uuid);
      if (!selecao) return null;
      return { indicador: "", sigla: "", rotulo: "", contexto, texto: "Conceder Prioridade (opcional)", selecao };
    }

    const base = { indicador: cfg.indicador, sigla: cfg.sigla, rotulo: cfg.rotulo, contexto };
    if (cfg.indicador === "NP") return { ...base, texto: "Não gera Prioridade." };
    if (acao.naoGeraPrioridade) {
      const fonteNP = acao._semPrioridadeFonte
        || (this.#modificadoresExternosAplicadosAtual ?? []).filter(m => /naoGeraPrioridade/.test(String(m.campo ?? ""))).map(m => m.nome).join(", ")
        || item.name;
      return { ...base, indicador: "NP", sigla: "N/P", texto: `Não gera Prioridade (${fonteNP}).` };
    }
    if (this.#proximaAcaoAtual?.semPrioridade) {
      const fonte = this.#proximaAcaoAtual.efeitos.filter(e => e.item.system.proximaAcaoSemPrioridade).map(e => e.item.name).join(", ");
      return { ...base, indicador: "NP", sigla: "N/P", texto: `Não gera Prioridade (${fonte}).` };
    }

    if (cfg.indicador === "PI" && acao.ehAtaque && !acao.usaDarPrioridade && await this._tentarSuprimirPrioridade()) {
      return { ...base, indicador: "NP", sigla: "N/P", texto: "Prioridade suprimida neste ataque." };
    }

    const [um, varios] = cfg.nomeLado;
    let preMarcados = [];
    let limite = 0;
    let texto = "";
    if (cfg.quemRecebe === "alvosAfetados") {
      preMarcados = [...new Map(tokensAfetados.filter(t => t.actor && t.actor !== this.actor && !prioridadeGasta?.has?.(t.uuid)).map(t => [t.uuid, t])).values()];
      texto = preMarcados.length ? "Confirme quem recebe Prioridade (alvos afetados)" : `Escolha quem recebe Prioridade`;
      // Quem gastou a Prioridade para não ser movido já a usou: não vem marcado de novo.
      if (prioridadeGasta?.size) texto += ` — ${[...prioridadeGasta.values()].join(", ")} já usou a Prioridade para não ser movido`;
    } else if (cfg.quemRecebe === "noRaio") {
      const raio = Number(cfg.raio) || 0;
      preMarcados = naurenPersonagensEmCena(meuToken, cfg.disposicao)
        .filter(t => !raio || naurenMedirDistanciaBordas(meuToken, t) <= raio)
        .map(t => t.document);
      texto = `Confirme quem recebe Prioridade (${varios}${raio ? ` a até ${raio}m` : " em cena"})`;
    } else {
      limite = cfg.quantidade;
      texto = `Escolha até ${limite > 1 ? `${limite} ${varios}` : `1 ${um}`} para receber Prioridade`;
    }
    let lado = cfg.quemRecebe === "alvosAfetados" ? "todos" : cfg.disposicao;
    // Ataque Combinado (Fase 5b): num ataque P/I, pode entregar a um aliado.
    const itemTransferir = cfg.indicador === "PI" && acao.ehAtaque
      ? this.actor.items.find(i => i.type === "habilidade" && i.system.ativo !== false && i.system.transferePrioridadeDoAtaque && naurenUsoDisponivel(i))
      : null;
    if (itemTransferir) {
      lado = "todos";
      texto += ` — ${itemTransferir.name}: pode escolher um aliado no lugar (gasta 1 uso)`;
    }
    const selecao = naurenMontarSelecaoPrioridade(meuToken, lado, limite, true, preMarcados, this.actor.uuid, cfg.indicador);
    if (selecao && itemTransferir) selecao.transferirItemId = itemTransferir.id;
    if (!selecao) return { ...base, texto: `Nenhum ${um} em cena para receber Prioridade.` };
    return { ...base, texto, selecao };
  }




  /**
   * Resolve a automação de alvo de uma Ação (área e/ou dano/cura/condição
   * automáticos) e devolve o que precisa entrar no card, já SANITIZADO:
   * - resumoAlvos: texto curto "Nome ✓, Nome2 ✗" sempre visível no card.
   * - breakdownAlvos: linhas pro painel expansível ("o que aconteceu | Nome"),
   *   sem nenhum atributo do alvo (Defesa/Agilidade/Vitalidade) exposto.
   * modoAlvo "nenhum" só coloca a área visual (se pedida) e não mexe em
   * ninguém - automação sempre desligável por Ação.
   */
  /**
   * Procura, no dono da ficha, uma Habilidade ativa com
   * "suprimePrioridadePorUso" ligado e 1+ uso passivo sobrando - se
   * achar, consome 1 uso e devolve true (ex: Postura Real do Guerreiro,
   * "o 1º ataque do turno não concede Prioridade ao alvo"). Processa só a
   * PRIMEIRA que achar (não têm por que existirem duas fazendo a mesma
   * coisa na mesma ficha).
   */
  async _tentarSuprimirPrioridade() {
    for (const item of this.actor.items) {
      if ((item.type !== "habilidade" && item.type !== "magia") || !item.system.ativo || !item.system.suprimePrioridadePorUso) continue;
      if (!item.system.usaUsosPassiva || (item.system.usosPassivaAtual ?? 0) <= 0) continue;
      if (item.system.modificadoresSoComEstado && !naurenTemEstado(this.actor, item.system.modificadoresSoComEstado)) continue;
      await item.update({ "system.usosPassivaAtual": Math.max(0, (item.system.usosPassivaAtual ?? 1) - 1) });
      ui.notifications.info(`"${item.name}" suprimiu a Prioridade deste ataque.`);
      return true;
    }
    return false;
  }

  async _resolverAlvosDaAcao(item, acao, info) {
    let regiaoCriada = null; // Fase 6 (O): a entidade de campo apaga a área ao acabar
    const modo = acao.modoAlvo || "nenhum";
    const vazio = { breakdownAlvos: [], resumoAlvos: "" };
    // Distinto de "vazio" normal (que ainda é um resultado VÁLIDO pra
    // "modoAlvo: nenhum" e "sem nada pra aplicar") - usado nos casos
    // abaixo onde a Ação de fato falhou/foi cancelada (sem alvo
    // selecionado, fora de alcance, nenhum token na área) e o card no
    // chat NUNCA deveria aparecer, nem com o dado/ataque já rolado
    // antes desta função ser chamada (ver "cancelado" no chamador).
    const cancelado = { breakdownAlvos: [], resumoAlvos: "", cancelado: true };

    // Tamanho do Template ajustado por Crescimento (ex: Névoa de Esporos)
    // - resolvido AQUI (onde "#nivelCrescimentoAtual" ainda está
    // disponível) numa CÓPIA rasa de "acao", nunca mutando o documento
    // salvo. Cobre as duas chamadas de NaurenRegionHelper.colocarArea
    // mais abaixo, que usam "acao.templateTamanho" normalmente.
    if (acao.usaTemplate && acao.templateTamanhoExtraPorCrescimento) {
      const extra = this._resolverBonusComTokens(acao.templateTamanhoExtraPorCrescimento, acao);
      if (extra) acao = { ...acao, templateTamanho: (acao.templateTamanho ?? 3) + extra };
    }

    // Bônus/Penalidade na Área (popup de pré-Ação, "usaPopupPreAcao") -
    // some/reduz metros no raio/comprimento do Template só nesta
    // execução, mesmo padrão de "templateTamanhoExtraPorCrescimento"
    // acima (cobre as mesmas duas chamadas de colocarArea mais abaixo).
    if (acao.usaTemplate && this.#bonusAreaAdhocAtual) {
      acao = { ...acao, templateTamanho: Math.max(0, (acao.templateTamanho ?? 3) + this.#bonusAreaAdhocAtual) };
    }

    // Modificador Extra por Crescimento do Template Persistente (ex:
    // Jardim das Flores Silvestres: "+1 Defesa por nível") - mesma
    // lógica acima, resolvida AQUI (onde "#nivelCrescimentoAtual" ainda
    // está disponível) porque quem cria a Região (NaurenRegionHelper,
    // método estático, sem acesso a este campo privado da ficha) só
    // recebe "acao" já pronta.
    if (acao.usaTemplatePersistente && acao.templatePersistenteModificadorExtraPorCrescimento) {
      const extraModificador = this._resolverBonusComTokens(acao.templatePersistenteModificadorExtraPorCrescimento, acao);
      if (extraModificador) acao = { ...acao, templatePersistenteModificadorExtraResolvido: extraModificador };
    }

    // Duração Extra por Crescimento do Template Persistente (ex:
    // Florescer de Flores, Druida: "+1 rodada de duração por nível") -
    // mesma lógica dos dois blocos acima, somando à "Duração (Rodadas)"
    // ao invés do Modificador/Tamanho.
    if (acao.usaTemplatePersistente && acao.templatePersistenteDuracaoExtraPorCrescimento) {
      const extraDuracao = this._resolverBonusComTokens(acao.templatePersistenteDuracaoExtraPorCrescimento, acao);
      if (extraDuracao) acao = { ...acao, templatePersistenteDuracaoRodadas: String((parseFloat(acao.templatePersistenteDuracaoRodadas) || 0) + extraDuracao) };
    }

    // Número de Alvos ajustado por Crescimento OU por Escolha de Recurso
    // (ex: Prisão das Brumas: "X alvos, X = Energia gasta") - mesma
    // lógica acima, mas somando ao Número de Alvos em vez do Tamanho do
    // Template. Aceita os dois tokens na mesma fórmula, se precisar.
    if (acao.numeroAlvosExtraPorCrescimento) {
      const extraAlvos = this._resolverBonusComTokens(acao.numeroAlvosExtraPorCrescimento, acao);
      if (extraAlvos) acao = { ...acao, numeroAlvos: (acao.numeroAlvos ?? 1) + extraAlvos };
    }

    // Condições e Gastos de Recurso configurados na Ação (ativos e válidos)
    // - resolvidos ANTES do branch "nenhum" abaixo, já que agora também se
    // aplicam a esse caso (ver comentário no branch).
    const rankAtual = this._rankEfetivo(item);
    const condicoes = (acao.condicoesAplicadas ?? [])
      .filter(c => c.ativo && c.uuid)
      .filter(c => this._condicaoParaAtivarPassou(c.condicaoParaAtivar, acao))
      .map(c => ({
        uuid: c.uuid,
        acumulos: c.acumulosPorEscolhida ? Math.max(1, this.#quantidadeRecursoEscolhidaAtual || 1) : c.acumulosPorInformacoes
          ? Math.max(0, naurenEstudoNoAlvo(Array.from(game.user.targets ?? [])[0]?.actor, this.actor)?.getFlag("nauren", "estudo")?.informacoes ?? 0)
          : (this._resolverPorRank(c.acumulosPorRank, rankAtual, "acumulos") ?? c.acumulos ?? 1),
        soSeAcertar: c.soSeAcertar,
        perguntarParaEvitar: c.perguntarParaEvitar, custoParaEvitarRecurso: c.custoParaEvitarRecurso,
        custoParaEvitarQuantidade: this._resolverPorRank(c.custoParaEvitarQuantidadePorRank, rankAtual, "quantidade") ?? c.custoParaEvitarQuantidade ?? 1,
        // Recurso Alternativo pra Evitar (ver campoCondicaoAplicada, ex:
        // Pressão Gravitacional - "1 Estamina OU 1 Estresse") e
        // Vinculada à 1ª Condição (ex: Fragmentado seguindo a mesma
        // decisão de Caído) - bug real corrigido: faltavam neste
        // whitelist, então nunca chegavam ao pacote enviado pro alvo,
        // quebrando silenciosamente as duas magias que usam isso.
        custoParaEvitarRecursoAlternativo: c.custoParaEvitarRecursoAlternativo ?? "",
        custoParaEvitarQuantidadeAlternativo: c.custoParaEvitarQuantidadeAlternativo ?? 1,
        vinculadoAPrimeiraCondicao: !!c.vinculadoAPrimeiraCondicao,
        rankParaCondicao: c.copiarRankDoItem ? rankAtual : 0,
        forcarMaximoEfeitoPeriodico: !!c.forcarMaximoEfeitoPeriodico,
        ...(c.grupoExclusivo ? { flagsExtras: { grupoExclusivo: c.grupoExclusivo, grupoLimite: Math.max(1, Number(rankAtual) || 1) } } : {}),
        // Duração Extra por Crescimento (ex: Infusão Floral): resolvida
        // AQUI, na ficha de quem usou a Ação, onde "#nivelCrescimentoAtual"
        // (quantos níveis o jogador escolheu no popup de Crescimento desta
        // execução) ainda está disponível - o valor JÁ RESOLVIDO (um
        // número puro) viaja dentro do pacote pro resto do fluxo (que
        // pode rodar no cliente de outro jogador, sem acesso a este campo
        // privado).
        duracaoExtra: c.duracaoExtraPorCrescimento
          ? Math.round(naurenInterpretarModificador(c.duracaoExtraPorCrescimento.replace(/@crescimento\b/g, String(this.#nivelCrescimentoAtual)), this.actor)?.valor ?? 0)
          : 0,
        custoParaRemoverRecurso: c.custoParaRemoverRecurso ?? "",
        // Mesmo cuidado de "duracaoExtra" acima: SÓ o token "@crescimento"
        // precisa ser resolvido AQUI (onde ainda temos o valor escolhido
        // no popup desta execução) - substituição de TEXTO simples, não
        // uma rolagem completa, porque a fórmula pode ter OUTROS tokens
        // (ex: "@rodadaCombate", de Vinhas Sagradas) que devem continuar
        // sem resolver, pra serem lidos ao VIVO só na hora em que o alvo
        // clicar pra remover (ver linha ~5595) - "@crescimento" sozinho
        // precisa disso porque "#nivelCrescimentoAtual" é transitório e
        // não existe mais depois desta execução.
        custoParaRemoverQuantidade: (c.custoParaRemoverQuantidade ?? "1").replace(/@crescimento\b/g, String(this.#nivelCrescimentoAtual ?? 0)),
        overrideFormulaEfeitoPeriodico: c.overrideFormulaEfeitoPeriodico ?? "",
        // Acúmulos Aleatórios (ex: Sutra da Lâmina Carmesim - "1d4") -
        // viaja CRUA no pacote (não resolvida aqui, ao contrário dos
        // campos acima) porque a rolagem precisa acontecer no momento de
        // aplicar em CADA alvo, do lado de quem processa o alvo (pra o
        // resultado aparecer no chat certo) - só substitui @tokens que
        // ela mesma pudesse usar, igual outros campos desta lista.
        acumulosFormula: (c.acumulosFormula ?? "")
          .replace(/@atacouNesteTurno\b/g, this.#atacouNesteTurnoAtual ? "1" : "0")
          .replace(/@quantidadeEscolhida\b/g, String(this.#quantidadeRecursoEscolhidaAtual))
          .replace(/@crescimento\b/g, String(this.#nivelCrescimentoAtual))
      }));
    // Acúmulos com dado (ex.: Sopro Infernal, "1d6 de Queimando"): rolados UMA VEZ aqui, na ficha de quem
    // usou a Ação - o mesmo número vale para todos os alvos da área (como o dano e os gastos de recurso).
    for (const c of condicoes) {
      const f = String(c.acumulosFormula ?? "").trim();
      if (!f) continue;
      try {
        const roll = await new Roll(this._substituirAtributosNaFormula(f, acao)).evaluate();
        if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true);
        c.acumulos = Math.max(0, Math.round(roll.total));
        c.acumulosFormula = "";
        let nomeCond = "Condição";
        try { nomeCond = (await fromUuid(naurenResolverSelf(c.uuid, this.actor) || c.uuid))?.name ?? nomeCond; } catch (err) { /* só o rótulo */ }
        this.#efeitosEmAtaquesAtual.push({ label: `Acúmulos de ${nomeCond}`, value: `${roll.total} (para todos os alvos)`, breakdown: `${f}: ${naurenRollToBreakdownText(roll)}` });
      } catch (err) { console.warn(`Nauren RPG | Fórmula de acúmulos inválida: "${f}" - cada alvo rola a sua.`, err); }
    }
    // Condições/Efeitos extras escolhidos no popup de pré-Ação (ver
    // "usaPopupPreAcao"/"_popupPreAcao") - somam à lista normal da Ação
    // (pode ter mais de um), sempre "só se acertar" (não faz sentido
    // aplicar um extra ad-hoc em quem o ataque nem alcançou).
    for (const uuidExtra of this.#condicoesAdhocUuidsAtual) {
      condicoes.push({ uuid: uuidExtra, acumulos: 1, soSeAcertar: true, perguntarParaEvitar: false, rankParaCondicao: 0 });
    }
    // Veneno carregado na arma (Toxina Laminar e afins): aplica 1
    // acúmulo automaticamente a cada acerto, reaproveitando o MESMO caminho
    // de "Condições Aplicadas" (cross-cliente, "só se acertar" etc) - só
    // entra aqui se este item É uma arma com veneno carregado e esta Ação é
    // um ataque.
    // Munição: gasta 1; se envenenada, aplica o veneno (dura até ser removido, como flecha cravada).
    if (acao._municao) {
      const mun = this.actor.items.get(acao._municao.id);
      if (mun) {
        const restante = Math.max(0, (mun.system.quantidade ?? 0) - 1);
        const upd = { "system.quantidade": restante };
        if (acao._municao.envenenada && !mun.system.municaoVenenoTodas) upd["system.municaoVenenoQuantidade"] = Math.max(0, (mun.system.municaoVenenoQuantidade ?? 0) - 1);
        await mun.update(upd);
        naurenRegistrarUsoTorre(this.actor, mun, 1, "municao");
        this.#efeitosEmAtaquesAtual.push({ label: "Munição", value: `${mun.name} (restam ${restante})`, breakdown: [acao._municao.danoExtra ? `+${acao._municao.danoExtra} de dano` : "", acao._municao.envenenada ? "envenenada" : ""].filter(Boolean).join(" • ") });
        if (restante <= 0) ui.notifications.info(`${mun.name} acabou.`);
      }
      if (acao._municao.envenenada && acao._municao.venenoUuid) {
        const porTurnoM = this.actor.items.some(i => naurenEhItem(i, "Ingrediente Ofídico") && i.system?.ativo !== false);
        condicoes.push({ uuid: acao._municao.venenoUuid, acumulos: 1, soSeAcertar: true, perguntarParaEvitar: false, custoParaEvitarRecurso: "estamina", custoParaEvitarQuantidade: 1,
          ...(porTurnoM ? { flagsExtras: { periodicoPorTurno: true } } : {}) });
      }
    }
    const venenoDesteGolpe = item.type === "arma" ? (item.system.venenoCarregado || "") : "";
    if (item.type === "arma" && item.system.venenoCarregado && acao.ehAtaque && (item.system.venenoGolpesRestantes ?? 0) > 0) {
      // Veneno por N golpes: cada uso da arma (acertando ou não) gasta um.
      const golpesR = item.system.venenoGolpesRestantes - 1;
      await item.update(golpesR > 0 ? { "system.venenoGolpesRestantes": golpesR } : { "system.venenoGolpesRestantes": 0, "system.venenoCarregado": "", "system.venenoCargasConsumivelId": "" });
      this.#efeitosEmAtaquesAtual.push({ label: "Veneno na arma", value: golpesR > 0 ? `${golpesR} golpe(s) restante(s)` : "último golpe envenenado" });
    }
    if (item.type === "arma" && venenoDesteGolpe && acao.ehAtaque) {
      // Veneno na lâmina: golpe corpo-a-corpo tem efeito curto (só 1 vez, na próxima rodada);
      // lança (Alcance) e arma à distância ficam cravadas (duram até serem removidas).
      const catV = naurenCategoriaDaArma(item);
      const modoV = item.system.venenoModo || "auto";
      const curto = modoV === "curto" ? true : modoV === "cravado" ? false : !["Distância", "Alcance"].includes(catV);
      condicoes.push({
        uuid: venenoDesteGolpe,
        acumulos: 1,
        soSeAcertar: true,
        perguntarParaEvitar: false,
        custoParaEvitarRecurso: "estamina",
        custoParaEvitarQuantidade: 1,
        ...(curto ? { flagsExtras: { somarCurtos: 1 } }
          : this.actor.items.some(i => naurenEhItem(i, "Ingrediente Ofídico") && i.system?.ativo !== false) ? { flagsExtras: { periodicoPorTurno: true } } : {})
      });
      // Se o veneno estiver vinculado a um Consumível real (ex: "Veneno
      // da Cobra Branca x4"), desconta 1 dose AGORA (o golpe gasta a
      // dose já ao ser desferido, acerte ou não - o veneno na lâmina se
      // desgasta de qualquer jeito). Ao chegar em 0, remove o veneno da
      // arma sozinho.
      if (item.system.venenoCargasConsumivelId) {
        const consumivel = this.actor.items.get(item.system.venenoCargasConsumivelId);
        if (!consumivel) {
          ui.notifications.warn(`"${item.name}" está com um veneno vinculado a um Consumível que não existe mais no inventário - removendo o veneno da arma.`);
          await item.update({ "system.venenoCarregado": "", "system.venenoCargasConsumivelId": "" });
        } else {
          const qtdAtual = consumivel.system.quantidade ?? 0;
          const novaQtd = Math.max(0, qtdAtual - 1);
          await consumivel.update({ "system.quantidade": novaQtd });
          if (novaQtd <= 0) {
            ui.notifications.info(`"${consumivel.name}" acabou - "${item.name}" ficou sem veneno.`);
            await item.update({ "system.venenoCarregado": "", "system.venenoCargasConsumivelId": "" });
          }
        }
      }
    }
    // Efeitos Vinculados ATIVOS deste mesmo item também podem aplicar
    // Condição no alvo, mas só quando esta Ação é um ATAQUE de verdade
    // (não faz sentido, por exemplo, num teste de atributo ou numa cura) -
    // reaproveita o MESMO formato/resolução de "condicoesAplicadas" de
    // cima, só que a fonte é o Efeito Vinculado em vez da própria Ação.
    if (acao.ehAtaque) {
      for (const efeito of (item.system.efeitosVinculados ?? [])) {
        if (!efeito.ativo) continue;
        for (const c of (efeito.condicoesAplicadas ?? [])) {
          if (!c.ativo || !c.uuid) continue;
          condicoes.push({
            uuid: c.uuid,
            acumulos: c.acumulosPorEscolhida ? Math.max(1, this.#quantidadeRecursoEscolhidaAtual || 1) : c.acumulosPorInformacoes
          ? Math.max(0, naurenEstudoNoAlvo(Array.from(game.user.targets ?? [])[0]?.actor, this.actor)?.getFlag("nauren", "estudo")?.informacoes ?? 0)
          : (this._resolverPorRank(c.acumulosPorRank, rankAtual, "acumulos") ?? c.acumulos ?? 1),
            soSeAcertar: c.soSeAcertar,
            perguntarParaEvitar: c.perguntarParaEvitar, custoParaEvitarRecurso: c.custoParaEvitarRecurso,
            custoParaEvitarQuantidade: this._resolverPorRank(c.custoParaEvitarQuantidadePorRank, rankAtual, "quantidade") ?? c.custoParaEvitarQuantidade ?? 1,
            rankParaCondicao: c.copiarRankDoItem ? rankAtual : 0,
            forcarMaximoEfeitoPeriodico: !!c.forcarMaximoEfeitoPeriodico
          });
        }
      }
    }
    const gastosRecurso = [];
    for (const [i, g] of (acao.gastosRecurso ?? []).entries()) {
      if (!(g.ativo && this.#consumirRecursosAtual?.[`gasto_${i}`] !== false)) continue;
      // Gatilho Condicional (ver campoDanoBloco > condicaoParaAtivar,
      // mesmo campo/mesma fórmula) - resolvido AQUI (não do lado do
      // alvo) porque os tokens que ele aceita só existem nos campos
      // privados desta ficha (this.#atacouNesteTurnoAtual etc), iguais
      // ao restante desta função.
      if (!this._condicaoParaAtivarPassou(g.condicaoParaAtivar, acao)) continue;
      let quantidade = this._resolverPorRank(g.quantidadePorRank, rankAtual, "quantidade") ?? g.quantidade ?? 1;
      if (typeof quantidade === "string" && /@atacouNesteTurno\b/.test(quantidade)) {
        quantidade = quantidade.replace(/@atacouNesteTurno\b/g, this.#atacouNesteTurnoAtual ? "1" : "0");
      }
      if (typeof quantidade === "string" && /@quantidadeEscolhida\b/.test(quantidade)) {
        quantidade = quantidade.replace(/@quantidadeEscolhida\b/g, String(this.#quantidadeRecursoEscolhidaAtual));
      }
      // Crescimento (ex.: Sabedoria das Copas "2+2*@crescimento"): os níveis escolhidos nesta conjuração.
      if (typeof quantidade === "string" && /@crescimento\b/.test(quantidade)) {
        quantidade = quantidade.replace(/@crescimento\b/g, String(this.#nivelCrescimentoAtual ?? 0));
      }
      // Bug real corrigido, a pedido explícito (achado num teste ao
      // vivo, Comungar - Mana): TODA Habilidade de área deve rolar sua
      // fórmula UMA VEZ SÓ e aplicar o MESMO resultado a todos os
      // alvos, exatamente como Dano/Cura já fazem (ver "danoParaAlvo"/
      // "curaParaAlvo", resolvidos aqui em cima, ANTES de saber sequer
      // se o modo é "área" ou "selecionado", e por isso já
      // naturalmente compartilhados) - antes, só Gasto de Recurso ficava
      // de fora dessa regra: a fórmula ("quantidade") viajava CRUA no
      // pacote e cada alvo, do seu próprio lado, rolava a sua PRÓPRIA
      // instância de nova - dando números diferentes pra cada aliado
      // na mesma área. Rola AQUI (mesmo ponto e mesmo motivo de
      // "danoParaAlvo"/"curaParaAlvo" - antes de ramificar por modo),
      // guardando total E breakdown já prontos - "quantidade" nunca
      // mais viaja como fórmula crua, só o NÚMERO final compartilhado.
      //
      // 2º bug real corrigido (achado no MESMO teste: "Recuperou 2 Mana"
      // quando devia ser 8, pra "-1d6-3" com dado 5): rolar a fórmula
      // COMPLETA já dá o total certo direto (o Foundry lida com a
      // aritmética sozinho, não importa como representa por dentro) -
      // não precisa (e não pode) tentar "tirar o sinal da frente" pra
      // rolar separado. Tirar só o primeiro caractere de "-1d6-3" dava
      // "1d6-3" (dado MENOS 3), quando o valor absoluto de verdade da
      // fórmula é "1d6+3" (dado MAIS 3) - são contas diferentes. A única
      // parte que precisa de cuidado é o TEXTO do breakdown (ver
      // naurenBreakdownSimples com usarValorAbsoluto=true).
      if (typeof quantidade === "string" && quantidade.includes("@nivel")) quantidade = quantidade.split("@nivel").join(String(this.actor.system.nivel || 1));
      // Demais atalhos do personagem (ex.: Adentrar o Infinito, "-@magiasNoGrimorio"): antes saíam 0.
      if (typeof quantidade === "string" && /@\w/.test(quantidade)) quantidade = naurenFormulaComTokensDoAtor(quantidade.replace(/@rank\b/gi, String(rankAtual || 1)), this.actor);
      const formulaTexto = String(quantidade ?? "0").trim();
      let rollQuantidade;
      try {
        rollQuantidade = await new Roll(formulaTexto || "0").evaluate();
      } catch (err) {
        console.warn(`Nauren RPG | Fórmula de Gasto de Recurso "${quantidade}" inválida, tratando como 0.`, err);
        rollQuantidade = null;
      }
      const quantidadeResolvida = rollQuantidade?.total ?? 0;
      const breakdownResolvido = rollQuantidade ? naurenBreakdownSimples(rollQuantidade, true) : formulaTexto;
      let custoParaEvitarQuantidadeResolvido = this._resolverPorRank(g.custoParaEvitarQuantidadePorRank, rankAtual, "quantidade") ?? g.custoParaEvitarQuantidade ?? 1;
      if (g.perguntarParaEvitar) {
        custoParaEvitarQuantidadeResolvido = await this._rolarFormula(custoParaEvitarQuantidadeResolvido);
      }
      gastosRecurso.push({
        recurso: g.recurso,
        // "quantidade" agora É o total já rolado (número, nunca mais
        // fórmula) - todo alvo que receber este pacote usa o MESMO
        // valor. "_breakdown" viaja separado só pro texto do card.
        quantidade: quantidadeResolvida,
        _breakdown: breakdownResolvido,
        soSeAcertar: g.soSeAcertar, soSeSobreviver: !!g.soSeSobreviver,
        perguntarParaEvitar: g.perguntarParaEvitar, custoParaEvitarRecurso: g.custoParaEvitarRecurso,
        custoParaEvitarQuantidade: custoParaEvitarQuantidadeResolvido
      });
    }

    // Modo manual: só coloca a área visual se pedida. Se a Ação tiver
    // Gastos de Recurso ou Condições Aplicadas configurados MESMO sem
    // alvo (ex: "Canalizar o Espírito" - concede Energia a si mesmo),
    // aplica no PRÓPRIO CASTER - antes disso, "modoAlvo: nenhum" nunca
    // processava nenhum dos dois campos, então uma Ação assim NUNCA
    // aplicava seus próprios gastosRecurso/condicoesAplicadas, mesmo
    // configurados corretamente (bug real, achado num teste de jogador).
    if (modo === "nenhum") {
      if (acao.usaTemplate && canvas.ready) {
        // Mesma validação de alcance real que o modo "area" já usa (ver
        // ali abaixo) - bug real corrigido: "modoAlvo: nenhum" nunca
        // tinha essa checagem, então uma magia de template nesse modo
        // (ex: Chuva de Estrelas, Jardim das Flores Silvestres) podia
        // ser colocada fora do alcance configurado sem nenhum aviso.
        const meuTokenParaAlcanceNenhum = canvas.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
        const centroOrigemNenhum = meuTokenParaAlcanceNenhum ? (meuTokenParaAlcanceNenhum.center ?? { x: meuTokenParaAlcanceNenhum.x, y: meuTokenParaAlcanceNenhum.y }) : null;
        const resultadoNenhum = await NaurenRegionHelper.colocarArea(item, acao, this._calcularAlcanceEfetivo(acao, item), centroOrigemNenhum);
        if (resultadoNenhum?.region) regiaoCriada = resultadoNenhum.region;
        if (!resultadoNenhum) return cancelado; // cancelado, fora de alcance, ou erro (já avisado)
      }
      if (condicoes.length || gastosRecurso.length) {
        const meuTokenSemAlvo = canvas.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
        if (meuTokenSemAlvo) {
          const resSemAlvo = await NaurenAlvoHelper.aplicarEmAlvo(meuTokenSemAlvo.document, {
            nomeAcao: info.titulo, atacante: this.actor.name, atacanteTokenUuid: meuTokenSemAlvo.document.uuid,
            houveAtaque: false, ataqueTotal: null, dano: 0, danoMinimo: 0, imparavel: 0, cura: 0,
            condicoes, gastosRecurso, roubarRecurso: null, empurrarMetros: null, empurrarOrigemPonto: null,
            darPrioridade: false, ataquesMultiplos: []
          });
          // Mostra no card o que aconteceu em você (ex.: "Recuperou 3 Mana (1d4 = 3)") - antes era descartado.
          const linhasSemAlvo = (resSemAlvo?.linhas ?? []).filter(Boolean);
          if (linhasSemAlvo.length) return { breakdownAlvos: [{ label: linhasSemAlvo.join(" • "), value: this.actor.name }], resumoAlvos: "" };
        } else {
          console.warn(`Nauren RPG | "${item.name}": tem Gastos de Recurso/Condições Aplicadas mas você não tem um token nesta cena - não aplicado.`);
        }
      }
      return vazio;
    }

    // Conceder Habilidade ao Alvo (ex.: Matilha) também precisa chegar ao alvo.
    const temAlgoParaAplicar = !!acao.bebeFrasco || !!acao.usaFrascoDoInventario || !!(acao.efeitosNoAlvo ?? []).length || !!this.#escudoParaAlvoAtual || info.danoParaAlvo > 0 || info.curaParaAlvo > 0 || condicoes.length > 0 || gastosRecurso.length > 0 || info.ehAtaque || acao.usaDarPrioridade || acao.usaTemplate || !!acao.concederHabilidadeAoAlvoUuid || (acao.usaMoverEscolhendo && acao.moverQuem === "alvo") || !!acao.usaConcederBeneficios;
    if (!temAlgoParaAplicar) return vazio;

    // 1) Resolve a lista de alvos
    let tokensAlvo = [];
    let empurrarOrigemPonto = null; // : centro do Template, se for modo "area" - ver mais abaixo
    if (modo === "selecionado") {
      tokensAlvo = Array.from(game.user.targets).map(t => t.document);
      // 0.94.1: sem alvo marcado, vale em você (ex.: beber um Frasco).
      if (!tokensAlvo.length && acao.alvoPadraoEu) {
        const eu = canvas.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0];
        if (eu?.document) tokensAlvo = [eu.document];
      }
      // Proteger (Fase 5b): quem protegeu vira o alvo no lugar do aliado.
      const redirecionar = this.#reacaoPreAtaqueAtual?.redirecionar;
      if (redirecionar?.size) tokensAlvo = [...new Map(tokensAlvo.map(t => redirecionar.get(t.uuid) ?? t).map(t => [t.uuid, t])).values()];
      if (!tokensAlvo.length) {
        ui.notifications.warn("Nenhum alvo selecionado (clique no alvo com a ferramenta de alvo, ou tecla T).");
        return cancelado;
      }
      // Corta a lista pro "Número de Alvos" configurado (padrão 1) - sem
      // isso, marcar mais alvos com T sempre afetaria todos eles, mesmo
      // numa Ação pensada pra alvo único.
      const numeroAlvosMax = this._resolverPorRank(acao.numeroAlvosPorRank, rankAtual, "quantidade") ?? acao.numeroAlvos ?? 1;
      if (tokensAlvo.length > numeroAlvosMax) {
        ui.notifications.warn(`"${info.titulo}" afeta no máximo ${numeroAlvosMax} alvo(s) - usando os ${numeroAlvosMax} primeiros marcados.`);
        tokensAlvo = tokensAlvo.slice(0, numeroAlvosMax);
      }
    } else if (modo === "area") {
      const meuTokenParaAlcance = canvas.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;
      // Bug real corrigido: passar o TOKEN inteiro (objeto PixiJS vivo)
      // pra "colocarArea" era pouco confiável - "placeRegion" troca de
      // camada e re-renderiza a cena por dentro, o que pode destruir/
      // recriar o objeto do token entre esta linha e o momento em que a
      // validação de alcance de fato roda, fazendo o aviso aparecer só
      // "de vez em quando". Captura as COORDENADAS agora, como números
      // simples e imunes a isso.
      const centroOrigem = meuTokenParaAlcance ? (meuTokenParaAlcance.center ?? { x: meuTokenParaAlcance.x, y: meuTokenParaAlcance.y }) : null;
      const resultado = await NaurenRegionHelper.colocarArea(item, acao, this._calcularAlcanceEfetivo(acao, item), centroOrigem);
      if (resultado?.region) regiaoCriada = resultado.region;
      if (!resultado) return cancelado; // cancelado, fora de alcance, ou erro (já avisado)
      tokensAlvo = resultado.tokens;
      // Filtro de Disposição em "área" (ver campoAcao > areaDisposicao,
      // sempre disponível, ex: Orações do Ciclo - "todos aliados
      // ganham...", e penitenciaAreaFiltroDisposicaoAtivo, só quando a
      // Penitência ativou o modo área nesta execução, ex: Fortitudo) -
      // Modo de Alvo "área" normal não filtra disposição sozinho
      // (correto pra dano em área, ex: Bola de Fogo), então só entra
      // em vigor quando explicitamente configurado num dos dois.
      const filtroDisposicaoArea = acao.penitenciaAreaFiltroDisposicaoAtivo || acao.areaDisposicao;
      if (filtroDisposicaoArea && filtroDisposicaoArea !== "todos" && meuTokenParaAlcance) {
        const dispOrigem = meuTokenParaAlcance.document.disposition;
        tokensAlvo = tokensAlvo.filter(t => {
          const mesma = t.disposition === dispOrigem;
          return filtroDisposicaoArea === "aliados" ? mesma : !mesma;
        });
        // Entidades de campo (Orbe de Luz, Moradia...) não são aliados nem inimigos para bênçãos de área.
        tokensAlvo = tokensAlvo.filter(t => !t.actor?.getFlag?.("nauren", "entidade")?.ativa);
      }
      if (acao.areaExcluirEu && meuTokenParaAlcance) tokensAlvo = tokensAlvo.filter(t => t.id !== meuTokenParaAlcance.document.id);
      // Filtro por Condição (M03): só quem tem (ou não tem) a Condição; "só minha" = aplicada por mim.
      if (acao.areaSoComCondicaoUuid) {
        const refC = acao.areaSoComCondicaoUuid.startsWith("self:") ? (naurenResolverSelf(acao.areaSoComCondicaoUuid, this.actor) || acao.areaSoComCondicaoUuid) : acao.areaSoComCondicaoUuid;
        let nomeC = ""; try { nomeC = naurenNomeNormalizado(fromUuidSync(refC)?.name ?? ""); } catch (err) { nomeC = ""; }
        const meuUuid = this.actor.uuid, meuTokUuid = meuTokenParaAlcance?.document?.uuid ?? "";
        const tem = td => (td.actor?.items ?? []).some(i => {
          if (i.type !== "condicao" || i.system.ativo === false || naurenEhCondicaoModelo(i)) return false;
          const bate = i.getFlag("core", "sourceId") === refC || i.getFlag("nauren", "cadeiaRaizUuid") === refC || (nomeC && naurenNomeNormalizado(i.name) === nomeC);
          if (!bate) return false;
          if (!acao.areaCondicaoSoMinha) return true;
          const cj = i.system.conjuradorUuid ?? ""; let dono = cj; try { const d = cj ? fromUuidSync(cj) : null; dono = (d?.actor ?? d)?.uuid ?? cj; } catch (err) { dono = cj; }
          return cj === meuTokUuid || dono === meuUuid;
        });
        tokensAlvo = tokensAlvo.filter(td => (acao.areaCondicaoModo === "sem") ? !tem(td) : tem(td));
      }
      // Só cancela por "nenhum token na área" se a Ação tiver algum
      // EFEITO que realmente precisa de um alvo pra fazer sentido (dano,
      // cura, condição, gasto de recurso, ataque, dar Prioridade) - uma
      // Ação de template PURO (só marca a área no mapa, sem nenhum
      // efeito configurado) não precisa de ninguém dentro pra "funcionar"
      // - o template em si já é o resultado esperado.
      const temEfeitoQuePrecisaDeAlvo = !!this.#escudoParaAlvoAtual || info.danoParaAlvo > 0 || info.curaParaAlvo > 0 || condicoes.length > 0 || gastosRecurso.length > 0 || info.ehAtaque || acao.usaDarPrioridade || !!acao.concederHabilidadeAoAlvoUuid;
      if (!tokensAlvo.length && temEfeitoQuePrecisaDeAlvo) {
        // Área lançada num lugar vazio: a Ação acontece mesmo assim (gasta o custo, posta o card e anima),
        // só não atinge ninguém - como na mesa. Antes cancelava tudo, inclusive a animação.
        ui.notifications.info("Nenhum token dentro da área: a Ação acontece, mas não atinge ninguém.");
      }
      // Empurrar ao Acertar em Templates: empurra cada
      // alvo pra LONGE DO CENTRO DA ÁREA (não de quem usou a Ação) -
      // reaproveita a mesma naurenEmpurrarToken, que já aceita um ponto
      // direto além de um token. shapes[0].x/y é o centro pro tipo
      // "circle"/"emanacao" (a maioria dos casos de empurrão em área);
      // pra outros tipos é uma aproximação razoável.
      const shape0 = resultado.region?.shapes?.[0];
      if (shape0 && typeof shape0.x === "number" && typeof shape0.y === "number") {
        empurrarOrigemPonto = { x: shape0.x, y: shape0.y };
      }
    }

    // 2) Alcance (pra alvo selecionado, valida contra o próprio alvo mais
    //    abaixo; pra área, colocarArea já validou contra o CENTRO da
    //    região colocada, acima). Extraído pro helper único
    //    _calcularAlcanceEfetivo (já soma tokens livres, bônus
    //    Manual/Condicional, e o ajuste pontual do popup de pré-Ação) -
    //    bug real corrigido: esta linha duplicava essa mesma lógica à
    //    mão, ficando fora de sincronia sempre que o helper ganhava um
    //    novo bônus (ex: "criticoMin" recém-adicionado não entrava aqui).
    const alcanceMetros = this._calcularAlcanceEfetivo(acao, item);
    const meuToken = canvas.tokens?.controlled?.find(t => t.actor === this.actor) ?? this.actor.getActiveTokens?.(true)?.[0] ?? null;

    // Imparável (Peculiaridade de monstro): resolvido UMA vez (não por
    // alvo, já que é uma característica fixa desta Ação) - o valor final
    // vai no pacote pra _aplicarReacaoDano somar especificamente quando o
    // alvo Bloquear com sucesso.
    let imparavelResolvido = 0;
    if (acao.imparavelQuantidade) {
      try {
        const roll = await new Roll(String(acao.imparavelQuantidade), this.actor.getRollData()).evaluate();
        imparavelResolvido = roll.total;
      } catch (err) {
        console.warn(`Nauren RPG | "${item.name}": fórmula de Imparável inválida.`, err);
      }
    }

    // 3) Monta o pacote comum e aplica alvo a alvo, EM SEQUÊNCIA (evita
    //    empilhar vários popups de defesa ao mesmo tempo na tela de alguém)
    const pacoteBase = {
      // 0.94.1: Frasco (benefícios + colateral), já com os ajustes de quem usa (Elixir Arco-Íris, Composto Refinado).
      frasco: (acao.bebeFrasco || acao.usaFrascoDoInventario) ? await naurenFrascoParaPacote(this.actor, item, acao, this._naurenFrascoAtual) : null,
      // 0.94.3: efeitos simples no alvo (Cirurgia Sinistra), com @rank já resolvido; "umaVezChave" recusa no alvo.
      efeitosNoAlvo: (acao.efeitosNoAlvo ?? []).length ? { fonte: item.name, usuarioNome: this.actor.name, efeitos: acao.efeitosNoAlvo.map(e => naurenEfeitoComSubst(e, { rank: Math.max(1, this._rankEfetivo(item) || 1) })) } : null,
      danoVerdadeiro: this.#danoVerdadeiroAtual || 0,
      escudoNoAlvo: this.#escudoParaAlvoAtual ? { valor: this.#escudoParaAlvoAtual.valor, expira: this.#escudoParaAlvoAtual.expira, texto: this.#escudoParaAlvoAtual.texto } : null,
      nomeAcao: info.titulo,
      atacante: this.actor.name,
      // UUID do TOKEN de quem atacou (Contra-Ataque) - antes
      // só existia o NOME em texto, que não dá pra usar pra aplicar dano de
      // volta. Precisa ser o token (não só o Actor) pra funcionar mesmo com
      // atores sem token na cena atual sendo tratado corretamente (vira
      // null nesse caso, e Contra-Atacar simplesmente não aplica volta).
      atacanteTokenUuid: meuToken?.document?.uuid ?? null,
      houveAtaque: !!info.ehAtaque,
      atacanteEmPrioridade: !!this.#emPrioridadeAtual,
      // Sem Prioridade para o alvo (livro: Bloquear/Esquivar/Contra-Atacar só dentro de uma Prioridade).
      semPrioridade: !!(acao.naoGeraPrioridade || this.#proximaAcaoAtual?.semPrioridade),
      semPrioridadeFonte: acao._semPrioridadeFonte || (this.#proximaAcaoAtual?.semPrioridade ? "Efeito" : (acao.naoGeraPrioridade ? item.name : "")),
      ataqueTotal: info.ataqueTotal,
      critico: !!info.ehCriticoAtaque,        // 20 natural (ou crítico mais fácil): acerta sempre
      falhaCritica: !!info.falhaCriticaAtaque, // 1 natural: erra sempre
      // Ajuste no Limiar de Deflexão que EU (atacante original) escolhi
      // no popup de pré-Ação (ver "usaPopupPreAcao") - some ao limiar
      // usado se o alvo decidir Contra-Atacar essa mesma rolagem.
      ajusteLimiarDeflexaoAtacante: (this.#ajusteLimiarDeflexaoAtual || 0) + (this.#estudoAtual?.acimaLimiar || 0),
      dano: info.danoParaAlvo,
      // Dano Máximo por Margem (ver campoAcao > usaDanoMaximoPorMargem) -
      // a alternativa "de reserva" viaja junto, mas só é usada do lado do
      // alvo se a margem de acerto (só conhecida lá) bater o limiar.
      danoMaximoAlternativo: acao.usaDanoMaximoPorMargem ? (info.danoParaAlvoMaximo ?? null) : null,
      margemMinimaDanoMaximo: acao.usaDanoMaximoPorMargem ? (acao.margemMinimaDanoMaximo || 10) : 0,
      ...(() => {
        // Bloqueio (livro): dano mínimo = quantidade de dados. Arma PESADA bloqueada: + Poder de Ataque
        // (2 x Poder de Ataque no Ataque Pesado) - o impacto esmagador atravessa a defesa.
        const dados = info.dadosParaMinimo || 0;
        const pesada = item.type === "arma" && naurenCategoriaDaArma(item) === "Pesada" && info.ehAtaque;
        if (!pesada) return { danoMinimo: dados, danoMinimoDetalhe: dados ? `dano mínimo: ${dados} (${dados} dado${dados > 1 ? "s" : ""})` : "" };
        const pda = Number(naurenResolverTokenFormula("poderAtaque", this.actor)) || Number(this.actor.system.poderAtaque?.value) || 0;
        const ehPesado = acao.tipoAtaque === "pesado" || /pesado/i.test(acao.nome ?? "");
        const extra = ehPesado ? 2 * pda : pda;
        return { danoMinimo: dados + extra,
          danoMinimoDetalhe: `arma pesada: ${dados} (dados) + ${ehPesado ? `2 × ${pda}` : pda} (Poder de Ataque${ehPesado ? ", Ataque Pesado" : ""}) = ${dados + extra}` };
      })(),
      imparavel: imparavelResolvido,
      cura: info.curaParaAlvo,
      // Ver campoAcao > penitenciaRemoverCondicaoOuEstresse - viaja no
      // pacote pra saber, do lado do alvo (onde a lista real de
      // Condições dele existe), se oferece a escolha de remover 1
      // Condição ou Estresse junto do popup de reação da Cura.
      permiteRemoverCondicaoOuEstresse: !!acao.penitenciaRemoverCondicaoOuEstresse && !!acao.penitenciaAceitaAgora,
      ignoraBloqueio: !!acao._ignoraBloqueio,
      bonusPorAcumulo: acao.bonusDanoPorAcumuloUuid ? { uuid: acao.bonusDanoPorAcumuloUuid, valor: Number(acao.bonusDanoPorAcumuloValor) || 0, fonte: item.name } : null,
      morteInstantanea: (acao._morte20 !== undefined && info.naturalVinte) ? (this.actor.system.vida?.value ?? 0) + acao._morte20 : null,
      curaExcedenteCondicaoUuid: acao.curaExcedenteCondicaoUuid || "",
      remocoesExtras: acao.penitenciaAceitaAgora ? Math.max(0, Math.round(Number(acao.penitenciaRemocoesExtras) || 0)) : 0,
      remocoesExtrasFonte: acao.penitenciaAceitaAgora && Number(acao.penitenciaRemocoesExtras) > 0
        ? ((this.#modificadoresExternosAplicadosAtual ?? []).filter(m => /penitenciaRemocoesExtras/.test(String(m.campo ?? ""))).map(m => m.nome).filter(Boolean).join(", ") || "") : "",
      condicoes: acao._beneficioMarca ? condicoes.map(c => ({ ...c, flagsExtras: { beneficioMarca: acao._beneficioMarca } })) : condicoes,
      gastosRecurso,
      // Roubar Recurso - só entra no pacote se a Ação tiver
      // ligado; processado do lado do ALVO (processarPacoteLocalmente),
      // que reduz de si mesmo e concede de volta pro atacante via caminho
      // seguro cross-cliente (ver naurenTransferirRecursoDoAlvo).
      roubarRecurso: acao.usaRoubarRecurso ? { tipo: acao.roubarRecursoTipo, quantidade: acao.roubarQuantidade } : null,
      // Concessão ao Atacante (ver campoAcao > concessaoAoAtacante, ex:
      // Ímpeto) - mesmo caminho cross-cliente de Roubar Recurso, mas sem
      // tirar nada do alvo (ver naurenConcederRecursoAoAtacante).
      concessaoAoAtacante: (acao.concessaoAoAtacante ?? []).filter(c => c.ativo && c.recurso),
      // Empurrar ao Acertar - metros a empurrar o alvo pra
      // longe de quem atacou (ver naurenEmpurrarToken). Em Ações de Área,
      // "empurrarOrigemUuidOuPonto" vira o CENTRO do Template em vez do
      // token de quem atacou (empurra pra longe do centro da explosão).
      empurrarMetros: acao.usaEmpurrar ? (naurenMetrosEmpurrao(acao.empurrarMetros, this.actor, rankAtual) || null) : null,
      empurrarDirecao: acao.empurrarDirecao || "afastar",
      // @meioCat, @categoria... já resolvidos aqui (o alvo não tem a ficha de quem atacou); @dadoDano fica.
      empurrarColisaoDano: acao.usaEmpurrar ? String(acao.empurrarColisaoDano || "").replace(/@(?!dadoDano\b)(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, this.actor) ?? 0)) : "",
      empurrarColisaoJaSomada: this.#colisaoPrevistaAtual,
      empurrarColisaoAmbos: !!acao.empurrarColisaoAmbos,
      empurrarOrigemPonto: empurrarOrigemPonto,
      // Movimento forçado no alvo (empurrar, puxar ou "mover cada alvo"): o alvo vê na reação e pode resistir.
      movimentoNoAlvo: this._descreverMovimentoNoAlvo(item, acao, rankAtual),
      // Dar Prioridade (início da integração) - sem dano/cura/ataque
      // nenhum, só dispara o Gatilho "recebeuPrioridade" no alvo (ver
      // naurenProcessarGatilhos) e narra bonito no card. Some pra false se
      // uma Habilidade sua com "suprimePrioridadePorUso" tiver uso
      // sobrando E esta Ação for um ATAQUE de verdade (ex: Postura Real do
      // Guerreiro, que só suprime Prioridade de ataques - "Avançar!" e
      // outras que DÃO Prioridade de propósito, sem ser ataque, não
      // acionam isso, senão suprimiriam o efeito principal delas).
      darPrioridade: false, // a Prioridade da Ação vai pelo mesmo caminho do card (ver depois do card)
      // Conceder Habilidade ao Alvo (ver campoAcao > concederHabilidadeAoAlvoUuid,
      // ex: Matilha, Druida) - concede uma cópia desta Habilidade DIRETO
      // em cada alvo resolvido, sem depender de acerto (ver bloco
      // "Conceder Habilidade ao Alvo" em _processarPacoteLocalmenteInterno,
      // que resolve "itemQueConcedeUuid" de volta pro Item de verdade -
      // aquele método é ESTÁTICO, sem acesso a "item" por closure, só ao
      // que vier dentro do pacote).
      concederHabilidadeAoAlvoUuid: acao.concederHabilidadeAoAlvoUuid ?? "",
      concederHabilidadeDuracao: acao.concederHabilidadeDuracao || "permanente",
      itemQueConcedeUuid: item.uuid,
      tipoItemOrigem: item.type,
      // Corpo a corpo/distância e origem (arma/magia) do golpe - para os filtros de Gatilho do alvo (M04).
      tipoAlcanceOrigem: (() => { if (!naurenAcaoEhGolpe(acao)) return ""; const t = naurenTipoAlcanceDaAcao(item, acao); return t === "segueArma" ? naurenTipoAlcanceAdivinhado(item, acao) : t; })(),
      origemAtaque: acao.ehAtaque ? (acao.atributoAtaque === "poderMagia" ? "magia" : "arma") : "",
      // Condicionais de ataque (M15), resolvidas pelo atacante antes de enviar.
      danoNoErro: info.danoNoErro ?? 0, danoNoErroTexto: info.danoNoErroTexto ?? "",
      limiarExecucao: info.limiarExecucao ?? 0,
      // Múltiplos Ataques (ver campoAcao#usaMultiplosAtaques) - cada
      // entrada é resolvida de forma independente contra a Defesa do
      // alvo em processarPacoteLocalmente.
      ataquesMultiplos: info.ataquesMultiplos ?? []
    };

    const resultados = [];
    // Tokens efetivamente afetados (dentro do alcance) - usados pela
    // Prioridade "alvos afetados" do card.
    const tokensAfetados = [];
    // Quem protegeu (Proteger o Mais Fraco) recebe o ataque mesmo fora do
    // alcance original: ele se colocou no caminho.
    const protetores = new Set([...(this.#reacaoPreAtaqueAtual?.redirecionar?.values() ?? [])].map(t => t.uuid));
    // Vários alvos: as janelas saem AO MESMO TEMPO para pessoas diferentes (cada jogador responde a sua);
    // alvos da mesma pessoa seguem em fila (duas janelas iguais na mesma tela não se misturam).
    // O laço abaixo continua na ordem de sempre, usando a resposta que já chegou.
    const cadeiaAntes = new Map();
    const respostas = new Map();
    if (tokensAlvo.length > 1) {
      const pacoteDoAlvo = (td) => {
        if (this.#naoDarDanoAlvoAtual || this.#naoDarDanoAliadosAtual) {
          const dispMinha = meuToken?.document?.disposition ?? 0;
          const dispAlvo = td.disposition ?? 0;
          const ehAliado = dispAlvo === dispMinha || dispAlvo === CONST.TOKEN_DISPOSITIONS.NEUTRAL;
          if ((ehAliado && this.#naoDarDanoAliadosAtual) || (!ehAliado && this.#naoDarDanoAlvoAtual)) return { ...pacoteBase, dano: 0, danoMinimo: 0 };
        }
        return this._pacoteComBonusDoAlvo(pacoteBase, td);
      };
      const filas = new Map();
      for (const td of tokensAlvo) {
        if (alcanceMetros !== null && meuToken && td.object && !protetores.has(td.uuid)) {
          let dist = 0; try { dist = naurenMedirDistanciaBordas(meuToken, td.object); } catch (err) { dist = 0; }
          if (dist > alcanceMetros) continue;
        }
        cadeiaAntes.set(td.uuid, acao.cadeiaCondicaoUuid ? !!td.actor?.items?.some(i => i.type === "condicao" && (i.getFlag("core", "sourceId") === acao.cadeiaCondicaoUuid || i.getFlag("nauren", "cadeiaRaizUuid") === acao.cadeiaCondicaoUuid)) : false);
        const exec = NaurenAlvoHelper.usuarioExecutor(td.actor)?.id ?? "sem-executor";
        if (!filas.has(exec)) filas.set(exec, []);
        filas.get(exec).push(td);
      }
      for (const lista of filas.values()) {
        let anterior = Promise.resolve();
        for (const td of lista) {
          const promessa = anterior.then(() => NaurenAlvoHelper.aplicarEmAlvo(td, pacoteDoAlvo(td)));
          respostas.set(td.uuid, promessa);
          anterior = promessa.catch(() => null);
        }
      }
    }
    for (const tokenDoc of tokensAlvo) {
      // Fora de alcance: pula este alvo (sem travar os demais). Em área, o alcance vale para onde a área
      // foi colocada (conferido ao colocar); quem está nos quadrados da área é atingido, mesmo mais longe.
      if (alcanceMetros !== null && acao.modoAlvo !== "area" && meuToken && tokenDoc.object && !protetores.has(tokenDoc.uuid)) {
        let distancia = 0;
        try {
          distancia = naurenMedirDistanciaBordas(meuToken, tokenDoc.object);
        } catch (err) { distancia = 0; }
        if (distancia > alcanceMetros) {
          resultados.push({ alvo: tokenDoc.name, acertou: null, linhas: [`fora de alcance (${Math.round(distancia)}m > ${alcanceMetros}m)`] });
          continue;
        }
      }
      // "Não dar Dano no Alvo/Aliados" (popup de pré-Ação, pra testes) -
      // decide por DISPOSIÇÃO relativa à minha: mesma disposição (ou
      // NEUTRAL) = aliado, disposição OPOSTA = alvo/inimigo. Zera o dano
      // só NESTE pacote específico (cópia), sem afetar os outros alvos
      // do mesmo disparo.
      let pacoteParaEsteAlvo = pacoteBase;
      if (this.#naoDarDanoAlvoAtual || this.#naoDarDanoAliadosAtual) {
        const dispMinha = meuToken?.document?.disposition ?? 0;
        const dispAlvo = tokenDoc.disposition ?? 0;
        const ehAliado = dispAlvo === dispMinha || dispAlvo === CONST.TOKEN_DISPOSITIONS.NEUTRAL;
        if ((ehAliado && this.#naoDarDanoAliadosAtual) || (!ehAliado && this.#naoDarDanoAlvoAtual)) {
          pacoteParaEsteAlvo = { ...pacoteBase, dano: 0, danoMinimo: 0 };
        }
      }
      if (pacoteParaEsteAlvo === pacoteBase) pacoteParaEsteAlvo = this._pacoteComBonusDoAlvo(pacoteBase, tokenDoc);
      const tinhaCadeia = cadeiaAntes.has(tokenDoc.uuid) ? cadeiaAntes.get(tokenDoc.uuid)
        : (acao.cadeiaCondicaoUuid ? tokenDoc.actor?.items?.some(i => i.type === "condicao" && (i.getFlag("core", "sourceId") === acao.cadeiaCondicaoUuid || i.getFlag("nauren", "cadeiaRaizUuid") === acao.cadeiaCondicaoUuid)) : false);
      const r = await (respostas.get(tokenDoc.uuid) ?? NaurenAlvoHelper.aplicarEmAlvo(tokenDoc, pacoteParaEsteAlvo));
      if (r && typeof r === "object") r._tokenUuid = tokenDoc.uuid;
      { const bAlvo = this._bonusDoAlvo(tokenDoc); if (r && bAlvo.linhas.length && r.acertou !== false) r.linhas = [...bAlvo.linhas, ...(r.linhas ?? [])]; }
      resultados.push(r);
      tokensAfetados.push(tokenDoc);
      // Esfera de Raios: acertou um alvo com a Condição -> o mesmo dano salta
      // para quem está a até N metros dele (sem teste e sem Prioridade).
      if (tinhaCadeia && r.acertou && tokenDoc.object) {
        const raioC = Number(acao.cadeiaRaio) || 1;
        const meuTokC = this.actor.getActiveTokens?.(true)?.[0];
        const vizinhos = canvas.tokens.placeables.filter(t => t.actor && t !== tokenDoc.object && t !== meuTokC
          && naurenMedirDistanciaBordas(tokenDoc.object, t) <= raioC);
        for (const v of vizinhos) {
          const rV = await NaurenAlvoHelper.aplicarEmAlvo(v.document, { ...pacoteParaEsteAlvo, houveAtaque: false, ataqueTotal: null, condicoes: [], gastosRecurso: [], roubarRecurso: null, morteInstantanea: null });
          if (rV) { rV.linhas = [`o raio saltou de ${tokenDoc.name}`, ...(rV.linhas ?? [])]; resultados.push(rV); }
        }
      }
      // Gatilhos por Evento: "eu acertei/errei um ataque" -
      // só faz sentido quando esta Ação realmente tinha um teste de ataque
      // (r.acertou !== null - null significa "sem teste", ex: dano de área
      // puro ou cura). Roda no cliente de quem ATACOU (aqui), não no do alvo.
      if (info.ehAtaque && r.acertou) {
        const packCondM = game.packs.find(pk => pk.metadata.label === "Nauren - Condições e Venenos");
        // Espalhar a Palavra: acerto numa Prioridade dada por um Místico que a tem.
        const deUuidP = this.#emPrioridadeAtual?.deUuid;
        if (deUuidP) {
          let doador = null;
          try { const d = fromUuidSync(deUuidP); doador = d?.actor ?? d; } catch (err) { doador = null; }
          if (doador?.items?.some(i => i.type === "habilidade" && naurenEhItem(i, "Espalhar a Palavra") && i.system.ativo !== false)) {
            const aplP = await naurenAplicarPalavraComEscolha(tokenDoc.actor, doador, `Espalhar a Palavra de ${doador.name}`);
            if (aplP.length) this.#beneficiosAtual.push({ label: "Espalhar a Palavra", value: `${tokenDoc.name}: ${aplP.join(" + ")}` });
          }
        }
        // Você está abaixo (Análise Paciente criativa): o próximo acerto no alvo analisado aplica −1/acúmulo no campo.
        if (this.#estudoAtual?.abaixo?.length && tokenDoc.actor && tokenDoc.actor.uuid === this.#estudoAtual.alvo?.uuid) {
          const infA = Math.max(1, naurenEstudoNoAlvo(tokenDoc.actor, this.actor)?.getFlag("nauren", "estudo")?.informacoes ?? 1);
          for (const ab of this.#estudoAtual.abaixo) {
            const jaTem = tokenDoc.actor.items.some(i => i.type === "condicao" && i.getFlag("nauren", "analiseCriativa")?.donoUuid === this.actor.uuid && i.getFlag("nauren", "analiseCriativa")?.chave === ab.chave);
            if (jaTem) continue;
            const dadosAb = {
              name: `Você está abaixo: ${ab.rotulo} (por ${this.actor.name})`, type: "condicao", img: "icons/magic/control/debuff-chains-blue.webp",
              // Sem acúmulos (Remover Condição tira o efeito inteiro por 2 PdE); o valor acompanha os acúmulos de Analisado.
              system: { duracaoModo: "cena", negativa: "sim", acumulativel: false,
                custoParaRemoverRecurso: "estamina", custoParaRemoverQuantidade: "2",
                modificadores: ab.campo ? [{ campo: ab.campo, valor: String(-infA) }] : [],
                descricao: naurenMontarDescricao({ regra: `Análise Paciente (criativa) de ${this.actor.name}: −1 em ${ab.rotulo} para cada acúmulo de Analisado que ${this.actor.name} possua sobre você, até o final da cena, ou até gastar 2 PdE para remover.`, automatico: ab.campo ? "o valor acompanha os acúmulos de Analisado; Remover Condição custa 2 de Estamina e tira o efeito inteiro; sai no fim do combate." : "", manual: ab.campo ? "" : `"${ab.rotulo}" não tem campo automático: aplique na narração.` }) },
              flags: { nauren: { analiseCriativa: { donoUuid: this.actor.uuid, chave: ab.chave, modo: "abaixo" } } }
            };
            const exAb = NaurenAlvoHelper.usuarioExecutor(tokenDoc.actor);
            const okAb = exAb?.id === game.user.id ? await tokenDoc.actor.createEmbeddedDocuments("Item", [dadosAb]).then(() => true).catch(() => false)
              : await exAb?.query(NAUREN_QUERY_CRIAR_ITEM, { actorUuid: tokenDoc.actor.uuid, dados: dadosAb }, { timeout: 20000 }).catch(() => false);
            this.#beneficiosAtual.push({ label: "Você está abaixo", value: okAb ? `${tokenDoc.name}: −${infA} ${ab.rotulo}` : "falhou (o Mestre está conectado?)", breakdown: "até o fim da cena ou 2 PdE" });
            if (okAb) this.#estudoAtual.abaixoAplicado = true;
          }
        }
        // Espírito Ardiloso (Ladino, livro 0.8): em combate, gastar 1 ponto da reserva para causar Caído, Cego ou Sangramento no alvo atingido.
        if (game.combat?.started && tokenDoc.actor && tokenDoc.actor !== this.actor
          && this.actor.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Espírito Ardiloso") && i.system.ativo !== false)) {
          const resA = (this.actor.system.recursosCustom ?? []).find(x => x.id === "espiritoardiloso");
          if ((resA?.valor ?? 0) > 0) {
            const escA = await foundry.applications.api.DialogV2.wait({
              window: { title: `Espírito Ardiloso — ${tokenDoc.name}` },
              content: `<p>Você acertou <b>${tokenDoc.name}</b>. Gastar 1 Espírito Ardiloso (${resA.valor}/${resA.max ?? "?"}) para causar uma Condição?</p>`,
              buttons: [{ action: "condicao-caido", label: "Caído" }, { action: "condicao-cego", label: "Cego" }, { action: "condicao-sangramento", label: "Sangramento" }, { action: "nao", label: "Não", default: true }],
              rejectClose: false
            }).catch(() => "nao");
            if (escA && escA !== "nao") {
              const uuidA = await naurenUuidPorSeed(packCondM, escA);
              const gasto = await naurenConcederRecurso(this.actor, "recursoCustom:espiritoardiloso", "-1", item).catch(() => 0);
              if (uuidA && gasto) {
                const exA = NaurenAlvoHelper.usuarioExecutor(tokenDoc.actor);
                const nomeA = exA?.id === game.user.id ? await NaurenAlvoHelper.aplicarCondicao(tokenDoc.actor, uuidA, 1).catch(() => null)
                  : await exA?.query(NAUREN_QUERY_APLICAR_CONDICAO, { actorUuid: tokenDoc.actor.uuid, uuid: uuidA, acumulos: 1 }, { timeout: 20000 }).catch(() => null);
                this.#beneficiosAtual.push({ label: "Espírito Ardiloso", value: nomeA ? `${tokenDoc.name}: ${nomeA}` : "falhou (o Mestre está conectado?)", breakdown: `−1 Espírito Ardiloso (${Math.max(0, (resA.valor ?? 1) - 1)} restante(s))` });
              }
            }
          }
        }
        // Sequência Caligráfica (livro 0.8): todo Golpe Espiritual que acerta marca o alvo com uma Palavra.
        if (naurenEhGolpeEspiritual(item, acao) && this.actor.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Sequência Caligráfica") && i.system.ativo !== false)) {
          const aplS = await naurenAplicarPalavraComEscolha(tokenDoc.actor, this.actor, "Golpe Espiritual · Sequência Caligráfica");
          if (aplS.length) this.#beneficiosAtual.push({ label: "Sequência Caligráfica", value: `${tokenDoc.name}: ${aplS.join(" + ")}` });
        }
        // Eco do Ideograma: o 1º Golpe Espiritual que acerta no combate ecoa no início da próxima rodada.
        const eco = this.actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Eco do Ideograma") && i.system.ativo !== false);
        if (eco && naurenEhGolpeEspiritual(item, acao) && (r.danoAplicado ?? 0) > 0) {
          const chaveEco = `eco_${game.combat?.id ?? "fora"}`;
          if (!(this.actor.getFlag("nauren", "primeirosAtaques") ?? {})[chaveEco]) {
            await this.actor.setFlag("nauren", "primeirosAtaques", { ...(this.actor.getFlag("nauren", "primeirosAtaques") ?? {}), [chaveEco]: true });
            const danoEco = (r.danoAplicado ?? 0) * Math.max(1, eco.system.rankAtual || 1);
            const uuidEco = await naurenUuidPorSeed(packCondM, "condicao-eco-do-ideograma");
            const exEco = NaurenAlvoHelper.usuarioExecutor(tokenDoc.actor);
            if (uuidEco) {
              if (exEco?.id === game.user.id) await NaurenAlvoHelper.aplicarCondicao(tokenDoc.actor, uuidEco, 1, null, 0, 0, "", "1", String(danoEco));
              else await exEco?.query(NAUREN_QUERY_APLICAR_CONDICAO_ECO, { actorUuid: tokenDoc.actor.uuid, uuid: uuidEco, formula: String(danoEco) }, { timeout: 20000 }).catch(() => null);
              this.#beneficiosAtual.push({ label: "Eco do Ideograma", value: `${tokenDoc.name} sofre ${danoEco} de novo no início da próxima rodada` });
            }
          }
        }
      }
      if (info.ehAtaque && r.acertou !== null) {
        if (tokenDoc.actor && tokenDoc.disposition !== (this.actor.getActiveTokens?.(true)?.[0]?.document?.disposition ?? tokenDoc.disposition)) naurenRegistrarAtaqueNoTurno(this.actor);
        naurenProcessarGatilhos(r.acertou ? "euAcerteiAtaque" : "euErreiAtaque", this.actor, { alvoUuid: tokenDoc.actor?.uuid ?? "", modoAtaque: info.modoAtaque ?? "normal" })
          .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (acerto/erro de ataque).", err));
        // "aliadoAcertouAtaque": mesma lógica de "aliadoSofreuDano", mas
        // pro momento em que EU acerto - útil pra Habilidades que reagem
        // a "um aliado acertou um ataque" (ex: Motivação, do Empíreo).
        if (r.acertou) {
          naurenProcessarGatilhos("aliadoAcertouAtaque", this.actor)
            .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (aliado acertou ataque).", err));
        } else {
          // "alguemErrouAtaque": genérico (não distingue aliado/inimigo,
          // igual "alguemRecebeuCondicao") - útil pra Habilidades que
          // reagem a QUALQUER personagem errar, não só o próprio dono
          // dela (ex: Acovardar, do Ladino).
          naurenProcessarGatilhos("alguemErrouAtaque", this.actor)
            .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (alguém errou ataque).", err));
          // Acovardar (Ladino): oferece ridicularizar quem errou (não espera a resposta).
          naurenOferecerAcovardar(this.actor, this.actor.getActiveTokens?.(true)?.[0] ?? null)
            .catch(err => console.warn("Nauren RPG | Falha ao oferecer Acovardar.", err));
        }
        // Atropelador: dano direto em todo inimigo ADJACENTE ao alvo que
        // acabou de ser acertado - roda só quando o teste de ataque
        // realmente acertou (não em dano de área puro, que não passa por
        // "r.acertou").
        if (acao.usaAtropelador && tokenDoc.object) {
          await this._aplicarAtropelador(tokenDoc, acao, item);
        }
      }
      // "Eu dei dano": dispara sempre que dano de verdade foi aplicado no
      // alvo, com ou sem teste de ataque (ex: uma Magia de área sem
      // rolagem também conta). Carrega qual item/Ação causou (ver
      // "tipoItemUsado"/"nomeAcaoContem" no Gatilho, ex: Bênção Solar -
      // "sempre que conjurar uma MAGIA que afete 1 inimigo").
      if (r.danoAplicado > 0) {
        const pGat = naurenProcessarGatilhos("euDeiDano", this.actor, { itemUsadoUuid: item.uuid, itemNome: item.name, acaoNome: acao.nome, tipoItemUsado: item.type, execucaoId: this._execucaoIdAtual, alvoTokenUuid: tokenDoc.uuid })
          .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (eu dei dano).", err));
        this._gatilhosDanoPendentes?.push(pGat);
      }
      // "Eu curei": mesmo espírito de "Eu dei dano", mas pra cura de
      // verdade aplicada em ALGUÉM (pode ser você mesmo ou um aliado) -
      // ex: "Caminhos do Sagrado" (Sacerdote), que reage a curar um aliado.
      if (r.curaAplicada > 0) {
        naurenProcessarGatilhos("euCurei", this.actor, { alvoUuid: tokenDoc.actor?.uuid ?? "", itemNome: item.name })
          .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (eu curei).", err));
      }
      // "Usei uma cura em alguém": o alvo recebeu a cura, mesmo que a Vida já estivesse cheia (ex.: Erva de Gato).
      if (r.curaAplicada > 0 || r.curaRecebida) {
        naurenProcessarGatilhos("euUseiCuraEm", this.actor, { alvoUuid: tokenDoc.actor?.uuid ?? "", itemNome: item.name })
          .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (usei cura).", err));
      }
    }

    // Recurso por inimigo atingido (ex.: Gruhua, Senhor das Brumas - livro 0.8).
    if (acao.recursoPorAlvoAtingido) {
      const meuTokR = this.actor.getActiveTokens?.(true)?.[0];
      const dispR = meuTokR?.document?.disposition ?? CONST.TOKEN_DISPOSITIONS.FRIENDLY;
      const inimigosR = tokensAfetados.filter((t, i) => resultados[i]?.acertou !== false && t.actor !== this.actor && (t.disposition ?? 0) !== dispR);
      if (acao.recursoPorAlvoSoSeAtacou && !this.#atacouNesteTurnoAtual) {
        this.#beneficiosAtual.push({ label: "Recuperar por alvo", value: "não (você não atacou neste turno)" });
      } else if (inimigosR.length) {
        const qtdR = Math.round(naurenInterpretarModificador(String(acao.recursoPorAlvoAtingidoQtd || "1"), this.actor)?.valor ?? 1) * inimigosR.length;
        const ganhoR = await naurenConcederRecurso(this.actor, acao.recursoPorAlvoAtingido, String(qtdR), item).catch(() => 0);
        const nomeR = acao.recursoPorAlvoAtingido.startsWith("recursoCustom:")
          ? ((this.actor.system.recursosCustom ?? []).find(x => x.id === acao.recursoPorAlvoAtingido.slice(14))?.nome ?? acao.recursoPorAlvoAtingido)
          : (naurenNomeDoRecurso(null, acao.recursoPorAlvoAtingido));
        this.#beneficiosAtual.push({ label: `${nomeR} recuperada`, value: `+${ganhoR}`, breakdown: `${inimigosR.length} inimigo(s) atingido(s) × ${acao.recursoPorAlvoAtingidoQtd || "1"}${acao.recursoPorAlvoSoSeAtacou ? " (atacou neste turno)" : ""}` });
      }
    }

    // 4) Monta as linhas pro painel expansível do card - um bloco por alvo,
    //    com o nome (+ ✓/✗) num lado curto e fixo, e o que aconteceu do
    //    outro lado, livre pra quebrar linha normalmente (sem cortar
    //    palavra no meio).
    const breakdownAlvos = resultados.map(r => {
      const marca = r.acertou === true ? " ✓" : r.acertou === false ? " ✗" : "";
      // Muitas linhas (ex.: um Frasco: benefícios, colateral, tabela): uma por linha, fica fácil de ler.
      const itens = (r.linhas ?? []).filter(Boolean);
      return { label: itens.join(" • ") || (acao.usaDarPrioridade ? "recebe Prioridade" : "nada aplicado"), value: `${r.alvo}${marca}`, itens: itens.length >= 4 ? itens : null };
    });

    // Resumo SEMPRE VISÍVEL (não precisa expandir o card pra ver) com nome
    // do(s) alvo(s) + ✓/✗ - existe mesmo quando a Ação não tem teste de
    // ataque (dano de área puro, por exemplo).
    const resumoAlvos = resultados
      .map(r => `${r.alvo}${r.acertou === true ? " ✓" : r.acertou === false ? " ✗" : ""}`)
      .join(", ");

    const ajustesAtaque = resultados.filter(r => r?.ajusteAtaque).map(r => ({ alvo: r.alvo, ...r.ajusteAtaque }));
    const usouDanoMaximo = resultados.some(r => r?.usouDanoMaximo);
    const atingidos = tokensAfetados.filter((t, i) => resultados[i]?.acertou !== false);
    const porAlvo = resultados.filter(r => r?._tokenUuid).map(r => ({ tokenUuid: r._tokenUuid, nome: r.alvo, dano: r.danoAplicado ?? 0, cura: r.curaAplicada ?? 0 }));
    // Quem NÃO pode ser movido por "Mover cada alvo" (errou, Bloqueio/Esquiva com sucesso, saiu com a
    // Prioridade ou resistiu) e quem já gastou a Prioridade resistindo (sai da lista do card).
    const naoMover = new Map(), prioridadeGasta = new Map();
    tokensAfetados.forEach((t, i) => {
      const r = resultados[i]; const uuid = t?.uuid ?? t?.document?.uuid; if (!r || !uuid) return;
      if (r.acertou === false) naoMover.set(uuid, "errou");
      else if (r.ataqueValeu === false) naoMover.set(uuid, "evitou o ataque");
      else if (r.movimentoEvitado) naoMover.set(uuid, { prioridade: "usou a Prioridade", custo: "pagou para não ser movido", livre: "decisão do jogador/Mestre" }[r.movimentoModo] ?? "resistiu");
      if (r.usouPrioridadeContraMovimento) prioridadeGasta.set(uuid, r.alvo);
    });
    // 0.94.16: resultado de cada alvo para o movimento dos tokens (Motion).
    const motionAlvos = resultados.filter(r => r?._tokenUuid).map(r => ({ uuid: r._tokenUuid, acertou: r.acertou ?? null, reacao: r.reacao ?? "", evitou: !!r.evitou,
      dano: r.danoAplicado ?? 0, cura: r.curaAplicada ?? 0, curaRecebida: !!r.curaRecebida, vidaMax: r.vidaMax ?? 0 }));
    return { breakdownAlvos, resumoAlvos, tokensAfetados, atingidos, ajustesAtaque, regiao: regiaoCriada, usouDanoMaximo, porAlvo, naoMover, prioridadeGasta, motionAlvos };
  }

  /**
   * Atropelador (Peculiaridade de monstro): dano direto em todo inimigo
   * ADJACENTE ao alvo que acabou de ser acertado por esta Ação - sem
   * teste de ataque, sem Bloquear/Esquivar (reaproveita
   * naurenAplicarDanoManual, que já respeita a Redução de Dano fixa mas
   * pula o popup interativo de reação, exatamente como "não dá espaço
   * para respostas (prioridade)" pede).
   */
  async _aplicarAtropelador(tokenAlvo, acao, item) {
    const raio = parseFloat(acao.atropeladorRaio) || 1;
    // Só INIMIGOS do atacante, adjacentes ao alvo (medido borda a borda, como a régua):
    // nunca o próprio atacante (que está colado no alvo num golpe corpo a corpo), nem aliados dele.
    const tokEu = this.actor?.getActiveTokens?.()?.[0] ?? null;
    const dispEu = tokEu?.document?.disposition ?? this.actor?.prototypeToken?.disposition;
    const proximos = (canvas?.tokens?.placeables ?? []).filter(t => {
      if (t.document === tokenAlvo || !t.actor || t.actor === this.actor || t.actor.uuid === this.actor?.uuid) return false;
      if (dispEu !== undefined && t.document.disposition === dispEu) return false;
      let distancia = 0;
      try { distancia = naurenMedirDistanciaBordas(tokenAlvo, t); } catch (err) { return false; }
      return distancia <= raio;
    });
    const rankAtual = item.system.rankAtual ?? 0;
    let quantidade = 0, textoFormula = String(acao.atropeladorQuantidade || "0");
    try {
      const formula = naurenFormulaComTokensDoAtor(textoFormula.replace(/@rank\b/gi, String(rankAtual)), this.actor);
      const roll = await new Roll(formula, this.actor.getRollData()).evaluate();
      const tokensUsados = [...new Set(textoFormula.match(/@(\w+)/g) ?? [])].map(t => t.slice(1)).filter(t => t !== "rank");
      const origemTxt = tokensUsados.length ? ` (${tokensUsados.map(t => naurenRotuloToken(t, this.actor)).join(", ")})` : "";
      quantidade = roll.total; textoFormula = `${naurenTextoRolagem(roll)}${origemTxt}`.replace(/metade do dado da Categoria/, "meio dado da Cat.");
    } catch (err) {
      console.warn(`Nauren RPG | "${item.name}": fórmula de Atropelador inválida.`, err);
      return;
    }
    const linhas = [{ label: "Dano direto", value: quantidade, breakdown: `${textoFormula} • a até ${raio} m de ${tokenAlvo.name}` }];
    if (!proximos.length) linhas.push({ label: "Atingidos", value: "nenhum inimigo adjacente ao alvo" });
    for (const token of proximos) {
      const reducao = token.actor.system?.reducaoDanoTotal ?? 0;
      const danoFinal = Math.max(0, NaurenAlvoHelper.aplicarReducaoPercentual(token.actor, quantidade) - reducao); await NaurenAlvoHelper.consumirAoSofrerDano(token.actor, quantidade);
      const { escudoConsumido, danoNaVida, escudoRestante } = NaurenAlvoHelper.calcularDanoComEscudo(token.actor, danoFinal);
      const vidaAtual = token.actor.system?.vida?.value ?? 0, vidaNova = Math.max(0, vidaAtual - danoNaVida);
      const updates = { "system.vida.value": vidaNova }; if (escudoConsumido > 0) updates["system.escudo.value"] = escudoRestante;
      await NaurenAlvoHelper.atualizarAtorSeguro(token.actor, updates, { naurenOrigemCombate: true });
      const ajustes = []; if (danoFinal !== quantidade) ajustes.push(`reduzido de ${quantidade}`); if (escudoConsumido > 0) ajustes.push(`Escudo absorveu ${escudoConsumido}`);
      linhas.push({ label: token.name, value: `${danoFinal} de dano`, breakdown: ajustes.join(" • ") });
      naurenProcessarGatilhos("euSofriDano", token.actor, { instancias: 1, origem: "atropelador", atacanteTokenUuid: tokEu?.document?.uuid ?? "" }).catch(() => {});
    }
    await naurenPostarCard({ ator: this.actor, titulo: `Dano ao redor de ${tokenAlvo.name}`, icone: "icons/skills/melee/strike-hammer-destructive-blue.webp", fonte: `${item.name} — ${acao.nome}`, linhas });
  }

  /**
   * Comportamento "clássico" de consumível sem nenhuma Ação configurada:
   * consome 1 unidade e rola o campo de texto livre "Efeito" (se tiver dado
   * embutido tipo "1d6", rola; senão só mostra o texto).
   */
  async _usarConsumivelSimples(item) {
    const sys = item.system;
    const qtdAtual = sys.quantidade ?? 0;
    if (qtdAtual <= 0) {
      ui.notifications.warn(`Você não possui mais ${item.name}!`);
      return;
    }
    await item.update({ "system.quantidade": qtdAtual - 1 });

    const secondaryLines = [];
    if (sys.efeito) {
      const diceMatch = sys.efeito.match(/\d+d\d+/i);
      if (diceMatch) {
        const efeitoRoll = await new Roll(diceMatch[0]).evaluate();
        if (game.dice3d) await game.dice3d.showForRoll(efeitoRoll, game.user, true);
        secondaryLines.push({ label: sys.efeito, value: efeitoRoll.total });
      } else {
        secondaryLines.push({ label: "Efeito", value: sys.efeito });
      }
    }
    secondaryLines.push({ label: "Restam", value: `${qtdAtual - 1 >= 0 ? qtdAtual - 1 : 0} unidade(s)` });

    await this._postRollCard({
      title: item.name,
      icon: item.img,
      d20Result: null,
      secondaryLines,
      breakdown: [],
      description: await naurenDescricaoParaChat(item)
    });
  }

  /**
   * Rola isoladamente só os bônus/dados de Ataque, Dano e/ou Cura definidos
   * DIRETAMENTE num item de Efeito (não os efeitos de outros itens) - útil
   * pra ver rapidamente quanto aquele efeito específico está contribuindo,
   * sem mexer em mais nada.
   */
  async _rollEfeitoIsolado(efeito) {
    const sys = efeito.system;
    const secondaryLines = [];

    const rolarPartes = async (partes, label) => {
      if (!partes.length) return;
      const roll = await new Roll(partes.join(" + ")).evaluate();
      if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true);
      secondaryLines.push({ label, value: roll.total, breakdown: this._rollToBreakdownText(roll) });
    };

    const partesAtaque = [];
    if (sys.ataque) partesAtaque.push(String(sys.ataque));
    if (sys.ataqueDado) partesAtaque.push(sys.ataqueDado);
    await rolarPartes(partesAtaque, "Bônus de Ataque");

    const partesDano = [];
    if (sys.danoBonus) partesDano.push(String(sys.danoBonus));
    if (sys.danoDado) partesDano.push(sys.danoDado);
    await rolarPartes(partesDano, "Bônus de Dano");

    const partesCura = [];
    if (sys.curaBonus) partesCura.push(String(sys.curaBonus));
    if (sys.curaDado) partesCura.push(sys.curaDado);
    await rolarPartes(partesCura, "Bônus de Cura");

    if (!secondaryLines.length) {
      ui.notifications.info(`${efeito.name} não tem nenhum bônus de ataque, dano ou cura pra rolar sozinho.`);
      return;
    }

    await this._postRollCard({
      title: efeito.name,
      icon: efeito.img,
      d20Result: null,
      secondaryLines,
      breakdown: [],
      description: await naurenDescricaoParaChat(efeito)
    });
  }
}

/**
 * ============================================================
 * CRIADOR DE PERSONAGEM (assistente guiado, opcional)
 * ============================================================
 * Aparece só na PRIMEIRA vez que a ficha de um "personagem" (não NPC) é
 * aberta (ver NaurenActorSheet#_onRender) - o jogador escolhe entre este
 * assistente guiado ou montar a ficha manualmente (arrastando itens do
 * compêndio, como já funcionava antes). Progresso salvo em
 * flags.nauren.criadorEtapa - fechar no meio reabre na mesma etapa da
 * próxima vez. Cada etapa já GRAVA na ficha de verdade ao confirmar (não
 * existe uma área "de rascunho" separada) - "voltar" não desfaz o que já
 * foi gravado, só deixa revisar/trocar a escolha daquela etapa.
 */
class NaurenCriadorPersonagem extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  actor;
  // Posição de rolagem de ".nauren-criador-etapa" entre um render e outro
  // - mesmo problema/solução já usado em NaurenActorSheet#scrollSheetBody:
  // qualquer clique que dispare um re-render (selecionar/desmarcar um
  // card) sem isso sempre voltava a etapa pro topo.
  #scrollCriadorEtapa = 0;

  constructor(options) {
    super(options);
    this.actor = options.actor;
  }

  static DEFAULT_OPTIONS = {
    id: "nauren-criador-{id}",
    classes: ["nauren-rpg", "nauren-criador"],
    position: { width: 760, height: 680 },
    window: { title: "Criador de Personagem", resizable: true, minimizable: false },
    actions: {
      removerUmaPeculiaridade: NaurenCriadorPersonagem.onRemoverUmaPeculiaridade,
      rolarDadoAtributo: NaurenCriadorPersonagem.onRolarDadoAtributo,
      rolarTodosDadosAtributo: NaurenCriadorPersonagem.onRolarTodosDadosAtributo,
      rolarPeculiaridade: NaurenCriadorPersonagem.onRolarPeculiaridade,
      confirmarAtributos: NaurenCriadorPersonagem.onConfirmarAtributos,
      escolherImagemCriador: NaurenCriadorPersonagem.onEscolherImagem,
      enquadrarRetratoCriador: NaurenCriadorPersonagem.onEnquadrarRetrato,
      bordaTokenCriador: NaurenCriadorPersonagem.onBordaToken,
      toggleCardPeculiaridade: NaurenCriadorPersonagem.onToggleCardPeculiaridade,
      avancarDePeculiaridades: NaurenCriadorPersonagem.onAvancarDePeculiaridades,
      toggleCardPigmento: NaurenCriadorPersonagem.onToggleCardPigmento,
      avancarDePigmentos: NaurenCriadorPersonagem.onAvancarDePigmentos,
      toggleCardEquipamento: NaurenCriadorPersonagem.onToggleCardEquipamento,
      avancarDeClasse: NaurenCriadorPersonagem.onAvancarDeClasse,
      irParaEtapa: NaurenCriadorPersonagem.onIrParaEtapa,
      escolherClasse: NaurenCriadorPersonagem.onEscolherClasse,
      confirmarClasse: NaurenCriadorPersonagem.onConfirmarClasse,
      concluirCriador: NaurenCriadorPersonagem.onConcluirCriador,
      voltarEtapa: NaurenCriadorPersonagem.onVoltarEtapa,
      modoAtributos: NaurenCriadorPersonagem.onModoAtributos,
      ajustarAtributo: NaurenCriadorPersonagem.onAjustarAtributo,
      limparAtributos: NaurenCriadorPersonagem.onLimparAtributos,
      abrirFichaManual: NaurenCriadorPersonagem.onAbrirFichaManual
    }
  };

  static PARTS = {
    body: { template: "systems/nauren/templates/criador-personagem.html" }
  };

  /**
   * Popup de escolha inicial (Criador vs Ficha Manual) - só aparece uma
   * vez (ver flags.nauren.criadorRespondido). Escolher qualquer uma das
   * duas opções marca a flag como respondida; "Ficha Manual" não faz mais
   * nada além disso (a ficha já é a ficha normal, sem mudança nenhuma).
   */
  static async mostrarEscolhaInicial(actor, { npc = false } = {}) {
    let escolha = null;
    const opcoes = [
      ...(npc ? [{ id: "monstro", icone: "fa-dragon", titulo: "Criador de Monstros", texto: "Monstro ou NPC pelo padrão do Codex - nível, Função, Categoria, Peculiaridades e Habilidades do compêndio." }] : []),
      { id: "criador", icone: "fa-hat-wizard", titulo: "Criador de Personagem", texto: npc ? "O mesmo assistente dos jogadores - atributos, peculiaridades, pigmentos, equipamento e classe passo a passo." : "Um assistente guiado - você define atributos, peculiaridades, pigmentos, equipamento e classe passo a passo." },
      { id: "manual", icone: "fa-hand-pointer", titulo: "Criar Ficha Manualmente", texto: "A ficha abre do jeito de sempre - arraste itens do compêndio você mesmo." }
    ];
    await foundry.applications.api.DialogV2.wait({
      window: { title: `${actor.name} — como você quer criar ${npc ? "esta ficha" : "este personagem"}?` },
      position: { width: npc ? 820 : 640 },
      content: `
        <div class="nauren-criador-escolha-inicial">
          <p class="item-meta-hint" style="margin-bottom: 14px;">Como você quer montar esta ficha? Clique num dos cartões ou nos botões abaixo.</p>
          <div class="nauren-criador-escolha-botoes${opcoes.length === 3 ? " tres" : ""}">
            ${opcoes.map(o => `<div class="nauren-criador-escolha-btn" data-escolha="${o.id}" role="button" tabindex="0">
              <i class="fas ${o.icone}"></i>
              <b>${o.titulo}</b>
              <span>${o.texto}</span>
            </div>`).join("")}
          </div>
        </div>`,
      buttons: opcoes.map((o, i) => ({ label: o.titulo, action: o.id, default: i === 0, callback: () => { escolha = o.id; } })),
      // Os cartões grandes também escolhem (clicam no botão correspondente do rodapé).
      render: (event, dialog) => {
        const raiz = dialog?.element ?? event?.target?.element;
        raiz?.querySelectorAll("[data-escolha]").forEach(card => {
          const ir = () => raiz.querySelector(`button[data-action="${card.dataset.escolha}"]`)?.click();
          card.addEventListener("click", ir);
          card.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ir(); } });
        });
      },
      rejectClose: false
    }).catch(() => null);

    await actor.setFlag("nauren", "criadorRespondido", true);
    if (escolha === "monstro") NaurenCriadorMonstro.abrir(actor);
    else if (escolha === "criador") {
      await actor.setFlag("nauren", "criadorEtapa", 0);
      new NaurenCriadorPersonagem({ actor }).render(true);
    }
  }

  static async onAbrirFichaManual(event, target) {
    await this.actor.setFlag("nauren", "criadorConcluido", true);
    this.close();
  }

  async _prepareContext(options) {
    const etapa = this.actor.getFlag("nauren", "criadorEtapa") ?? 0;
    const context = { etapa, actor: this.actor, etapaNome: NAUREN_CRIADOR_ETAPAS[etapa]?.nome ?? "" };
    context.totalEtapas = NAUREN_CRIADOR_ETAPAS.length;
    context.progressoPct = Math.round(((etapa) / (NAUREN_CRIADOR_ETAPAS.length - 1)) * 100);
    // Booleanos "estaNaEtapaN" pro template (sem depender de um helper
    // "eq" - este sistema nunca registrou um, ver working-notes) e
    // "ativo_N" pros marcos da barra de progresso.
    context.progressoPct = Math.min(100, context.progressoPct);
    for (let i = 0; i < NAUREN_CRIADOR_ETAPAS.length; i++) {
      context[`estaNaEtapa${i}`] = etapa === i;
      context[`marcoAtivo${i}`] = etapa === i;
      // Etapas já passadas viram atalho (clicar volta direto para ela).
      context[`marcoFeito${i}`] = i < etapa && etapa < NAUREN_CRIADOR_ETAPAS.length;
    }

    if (etapa === 0) {
      const atrs = this.actor.system.atributos;
      context.nomePersonagem = this.actor.name;
      context.imgRetrato = this._imgRetratoEscolhida ?? this.actor.img ?? "icons/svg/mystery-man.svg";
      context.imgToken = this._imgTokenEscolhida ?? this.actor.prototypeToken?.texture?.src ?? context.imgRetrato;
      context.bordaAtiva = !!this.actor.getFlag("nauren", "borda")?.ativa;
      context.atributos = {
        forca: atrs.forca.value, agilidade: atrs.agilidade.value, estamina: atrs.estamina.value,
        inteligencia: atrs.inteligencia.value, destino: atrs.destino.value
      };
      if (this._atributosDigitados) Object.assign(context.atributos, this._atributosDigitados);
      const dadosSalvos = this.actor.getFlag("nauren", "criadorDadosAtributos") ?? [null, null, null, null, null];
      context.dadosAtributos = dadosSalvos.map((v, i) => ({ indice: i, numero: i + 1, valor: v, rolado: v !== null && v !== undefined }));
      context.dadosAtributosCompletos = context.dadosAtributos.every(d => d.rolado);
      context.atributosCards = NAUREN_CRIADOR_ATRIBUTOS.map(c => ({ ...c, valor: context.atributos[c.chave] }));
      const modo = this.actor.getFlag("nauren", "criadorModoAtributos") || "";
      context.modoFixo = modo === "fixo";
      context.modoRolar = modo === "rolar";
      context.semModo = !modo;
      context.valoresFixosTexto = NAUREN_CRIADOR_VALORES_FIXOS.join(", ");
      const valoresPool = modo === "fixo" ? NAUREN_CRIADOR_VALORES_FIXOS : modo === "rolar" && context.dadosAtributosCompletos ? dadosSalvos : [];
      context.pool = valoresPool.map((v, i) => ({ valor: v, indice: i }));
      context.temPool = context.pool.length > 0;
    }

    if (etapa === 1) {
      const packs = await naurenObterOuCriarPacks();
      await packs.peculiaridades.getIndex({ fields: ["system.tipo", "system.descricao", "img"] });
      const jaTemUuids = new Set(
        this.actor.items.map(i => i.getFlag("nauren", "origemUuid") || i.getFlag("core", "sourceId")).filter(Boolean)
      );
      context.peculiaridades = packs.peculiaridades.index.contents
        .map(entrada => {
          const textoPuro = (entrada.system?.descricao ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          return {
            uuid: entrada.uuid, nome: entrada.name, img: entrada.img,
            ehFardo: entrada.system?.tipo === "fardo",
            copias: this.actor.items.filter(i => (i.getFlag("nauren", "origemUuid") || i.getFlag("core", "sourceId")) === entrada.uuid).length,
            resumo: textoPuro.length > 90 ? textoPuro.slice(0, 90) + "…" : textoPuro,
            selecionado: jaTemUuids.has(entrada.uuid)
          };
        })
        .sort((a, b) => a.ehFardo === b.ehFardo ? a.nome.localeCompare(b.nome) : (a.ehFardo ? 1 : -1));
      context.peculiaridades = context.peculiaridades.map(p => ({ ...p, duas: p.copias >= 2 }));
      context.peculiaridadesContagem = context.peculiaridades.reduce((t, p) => t + (p.copias || 0), 0);
      context.sorteioPeculiaridade = this._sorteioPeculiaridade ?? null;
      if (context.sorteioPeculiaridade) context.peculiaridades = context.peculiaridades.map(p => ({ ...p, sorteado: p.uuid === context.sorteioPeculiaridade.uuid }));
      const limitePeculiaridadesAtingido = context.peculiaridadesContagem >= 6;
      context.peculiaridades = context.peculiaridades.map(p => ({ ...p, bloqueado: limitePeculiaridadesAtingido && !p.selecionado }));
    }

    if (etapa === 2) {
      const packs = await naurenObterOuCriarPacks();
      await packs.pigmentos.getIndex({ fields: ["system.corHex", "system.descricao"] });
      const jaTemUuids = new Set(
        this.actor.items.filter(i => i.type === "cor")
          .map(i => i.getFlag("nauren", "origemUuid") || i.getFlag("core", "sourceId"))
          .filter(Boolean)
      );
      context.pigmentos = packs.pigmentos.index.contents
        .map(entrada => {
          const textoPuro = (entrada.system?.descricao ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          return {
            uuid: entrada.uuid, nome: entrada.name, img: entrada.img,
            corHex: entrada.system?.corHex || "#726b8a",
            resumo: textoPuro.length > 90 ? textoPuro.slice(0, 90) + "…" : textoPuro,
            selecionado: jaTemUuids.has(entrada.uuid)
          };
        })
        .sort((a, b) => a.nome.localeCompare(b.nome));
      context.pigmentosContagem = context.pigmentos.filter(p => p.selecionado).length;
      const limitePigmentosAtingido = context.pigmentosContagem >= 2;
      context.pigmentos = context.pigmentos.map(p => ({ ...p, bloqueado: limitePigmentosAtingido && !p.selecionado }));
    }

    if (etapa === 3) {
      // Classe (vem ANTES do Equipamento: o Equipamento destaca o que a Classe usa).
      const packs = await naurenObterOuCriarPacks();
      await packs.classes.getIndex({ fields: ["system.descricao", "system.equipamentoRecomendado", "system.identifier"] });
      const classeAtual = this.actor.items.find(i => i.type === "classe");
      context.temClasse = !!classeAtual;
      context.classeAtualNome = classeAtual?.name ?? "";
      const uuidSelecionado = this.actor.getFlag("nauren", "criadorClasseSelecionada") || null;
      const limpar = html => String(html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      context.classes = packs.classes.index.contents
        .filter(e => e.type === "classe")
        .map(entrada => {
          const textoPuro = limpar(entrada.system?.descricao);
          return {
            uuid: entrada.uuid, nome: entrada.name, img: entrada.img,
            resumo: textoPuro.length > 140 ? textoPuro.slice(0, 140) + "…" : textoPuro,
            textoCompleto: textoPuro,
            selecionado: entrada.uuid === uuidSelecionado
          };
        })
        .sort((a, b) => a.nome.localeCompare(b.nome));
      const sel = packs.classes.index.find(e => e.uuid === uuidSelecionado);
      context.temSelecao = !!sel;
      if (sel) {
        const cfg = sel.system?.equipamentoRecomendado ?? {};
        context.classeSelecionada = {
          nome: sel.name, img: sel.img,
          descricao: limpar(sel.system?.descricao),
          dica: String(cfg.dica ?? "").trim(),
          resumoEquip: naurenResumoEquipamentoClasse(cfg)
        };
      }
    }

    if (etapa === 4) {
      // Equipamento: tudo pode ser escolhido; o que a Classe usa vem primeiro, destacado.
      const packs = await naurenObterOuCriarPacks();
      const campos = ["flags.nauren.seedId", "system.descricao", "system.disponivelNoInicio", "system.categoria", "system.tipo", "system.defesaBonus"];
      await packs.armas.getIndex({ fields: campos });
      await packs.armaduras.getIndex({ fields: campos });
      const { cfg, nome: nomeClasse } = await this._classeParaEquipamento();
      context.classeNome = nomeClasse;
      context.temClasseEscolhida = !!nomeClasse;
      context.dicaClasse = String(cfg?.dica ?? "").trim();
      context.resumoEquipClasse = naurenResumoEquipamentoClasse(cfg);
      // 0.94.29: só conta o que foi escolhido NESTA etapa (a mesma conta do clique).
      const jaTemUuids = new Set(
        this.actor.items.filter(i => (i.type === "arma" || i.type === "armadura") && i.getFlag("nauren", "escolhaEquipamentoCriador"))
          .map(i => i.getFlag("nauren", "origemUuid") || i._stats?.compendiumSource || i.getFlag("core", "sourceId"))
          .filter(Boolean)
      );
      const rotuloTipo = entrada => {
        const cat = naurenCategoriaEquipamento(entrada);
        if (entrada.type === "arma") return ARMA_TIPOS[cat] ?? (cat || "Arma");
        const def = Number(entrada.system?.defesaBonus ?? 0);
        const base = cat || "Armadura";
        return def ? `${base} · +${def} Defesa` : base;
      };
      const montarCard = entrada => {
        const textoPuro = (entrada.system?.descricao ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        return {
          uuid: entrada.uuid, nome: entrada.name, img: entrada.img,
          tipoRotulo: rotuloTipo(entrada),
          ehArma: entrada.type === "arma",
          resumo: textoPuro.length > 90 ? textoPuro.slice(0, 90) + "…" : textoPuro,
          textoCompleto: textoPuro,
          recomendado: !!cfg && naurenEquipamentoRecomendado(cfg, entrada),
          selecionado: jaTemUuids.has(entrada.uuid)
        };
      };
      const todos = [
        ...packs.armas.index.contents.filter(e => ["arma", "armadura"].includes(e.type) && naurenDisponivelNoInicio(e)),
        ...packs.armaduras.index.contents.filter(e => ["arma", "armadura"].includes(e.type) && naurenDisponivelNoInicio(e))
      ].map(montarCard).sort((a, b) => (b.ehArma - a.ehArma) || a.nome.localeCompare(b.nome));
      context.equipamentoContagem = todos.filter(e => e.selecionado).length;
      context.equipamentoMax = Math.max(0, naurenInterpretarModificador("@destinoItensIniciais", this.actor)?.valor ?? 0);
      // 0.94.29: limite atingido (qualquer limite, inclusive 1): os cards NÃO selecionados ficam
      // escuros e não respondem; para trocar, clique no escolhido para desmarcar.
      const limiteAtingido = context.equipamentoContagem >= context.equipamentoMax;
      const comBloqueio = todos.map(e => ({ ...e, bloqueado: limiteAtingido && !e.selecionado }));
      context.equipRecomendados = comBloqueio.filter(e => e.recomendado);
      context.equipOutros = comBloqueio.filter(e => !e.recomendado);
      context.temRecomendados = context.equipRecomendados.length > 0;
      context.equipamentoRestante = Math.max(0, context.equipamentoMax - context.equipamentoContagem);
      context.limiteUm = context.equipamentoMax === 1;
      context.foraDaClasseEscolhidos = comBloqueio.filter(e => e.selecionado && !e.recomendado && cfg).map(e => e.nome).join(", ");
    }

    if (etapa >= 5) {
      // Resumo final (a Classe já foi gravada ao concluir o Equipamento).
      context.estaNoResumo = true;
      context.progressoPct = 100;
      const s = this.actor.system;
      const at = s.atributos ?? {};
      const nomesAtr = { forca: "Força", agilidade: "Agilidade", estamina: "Estamina", inteligencia: "Inteligência", destino: "Destino" };
      context.resumo = {
        nome: this.actor.name,
        img: this.actor.img || "icons/svg/mystery-man.svg",
        classe: this.actor.items.find(i => i.type === "classe")?.name ?? "—",
        atributos: Object.entries(nomesAtr).map(([k, n]) => ({ nome: n, valor: at[k]?.value ?? at[k] ?? "—" })),
        peculiaridades: this.actor.items.filter(i => i.type === "peculiaridade").map(i => i.name).join(", ") || "nenhuma",
        pigmentos: this.actor.items.filter(i => i.type === "cor").map(i => i.name.replace(/^Pigmento\s+/i, "")).join(", ") || "nenhum",
        equipamento: this.actor.items.filter(i => ["arma", "armadura"].includes(i.type) && i.getFlag("nauren", "escolhaEquipamentoCriador")).map(i => i.name).join(", ") || "nenhum",
        concedidos: this.actor.items.filter(i => ["habilidade", "magia"].includes(i.type)).map(i => i.name).slice(0, 8).join(", ")
      };
    }
    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    this._ligarScrollCriadorEtapa();
    this._ligarLinksDeImagem();
    this._ligarDistribuicaoAtributos();
    this._aplicarPreviasDeImagem();
  }

  /**
   * 0.94.29: toda vez que o Criador redesenha (ex.: a ficha foi atualizada), as prévias voltam como estavam:
   * o retrato com o enquadramento salvo e o token com a borda salva (antes só apareciam logo depois de editar).
   */
  async _aplicarPreviasDeImagem() {
    const root = this.element;
    const pr = root?.querySelector?.('img[data-previa="retrato"]');
    if (pr) {
      const src = root.querySelector('input[name="imgRetrato"]')?.value || this._imgRetratoEscolhida || this.actor.img;
      const estilo = naurenEstiloEnquadramento(this.actor, src);
      if (estilo) pr.setAttribute("style", estilo);
    }
    const pt = root?.querySelector?.('img[data-previa="token"]');
    if (!pt) return;
    const url = await naurenBordaPreviaDoAtor(this.actor).catch(() => null);
    if (url && pt.isConnected) { pt.src = url; pt.classList.add("com-borda"); }
  }

  /**
   * Etapa Atributos: fichas de valor (fixos ou dados rolados) que o jogador clica ou
   * arrasta até um atributo; marca as já usadas e atualiza a prévia (Vida, Mana,
   * Poder de Ataque...) com o cálculo da própria ficha (clone do ator, sem gravar).
   */
  _ligarDistribuicaoAtributos() {
    const root = this.element;
    const inputs = [...root.querySelectorAll('input[name^="atributo_"]')];
    if (!inputs.length) return;
    const chips = [...root.querySelectorAll(".nauren-criador-ficha-valor")];
    const atualizar = () => {
      // Fichas usadas: cada valor digitado "consome" uma ficha igual.
      const restantes = inputs.map(i => Number(i.value));
      for (const ch of chips) {
        const v = Number(ch.dataset.valor);
        const k = restantes.indexOf(v);
        if (k >= 0) restantes.splice(k, 1);
        ch.classList.toggle("usada", k >= 0);
      }
      const aviso = root.querySelector(".nauren-criador-pool-aviso");
      if (aviso && chips.length) {
        const todasUsadas = chips.every(c => c.classList.contains("usada"));
        aviso.textContent = todasUsadas ? "Tudo distribuído." : `Faltam ${chips.filter(c => !c.classList.contains("usada")).length} valor(es) para distribuir.`;
        aviso.classList.toggle("ok", todasUsadas);
      }
      this._atualizarPreviaAtributos(inputs);
    };
    const aplicar = (input, valor) => {
      input.value = valor;
      input.closest(".nauren-criador-atributo-campo")?.classList.add("piscou");
      setTimeout(() => input.closest(".nauren-criador-atributo-campo")?.classList.remove("piscou"), 350);
      root.querySelectorAll(".nauren-criador-ficha-valor.escolhida").forEach(c => c.classList.remove("escolhida"));
      this._guardarAtributosDigitados();
      atualizar();
    };
    chips.forEach(ch => {
      ch.addEventListener("click", () => {
        const ja = ch.classList.contains("escolhida");
        chips.forEach(c => c.classList.remove("escolhida"));
        if (!ja) ch.classList.add("escolhida");
        root.querySelector(".nauren-criador-atributos-grid.principal")?.classList.toggle("esperando-valor", !ja);
      });
      ch.addEventListener("dragstart", ev => { ev.dataTransfer?.setData("text/plain", ch.dataset.valor); });
    });
    root.querySelectorAll(".nauren-criador-atributo-campo[data-atributo]").forEach(card => {
      const input = card.querySelector("input");
      card.addEventListener("click", ev => {
        const ch = root.querySelector(".nauren-criador-ficha-valor.escolhida");
        if (!ch || ev.target.closest("button")) return;
        ev.preventDefault();
        aplicar(input, ch.dataset.valor);
        root.querySelector(".nauren-criador-atributos-grid.principal")?.classList.remove("esperando-valor");
      });
      card.addEventListener("dragover", ev => { ev.preventDefault(); card.classList.add("alvo-drop"); });
      card.addEventListener("dragleave", () => card.classList.remove("alvo-drop"));
      card.addEventListener("drop", ev => {
        ev.preventDefault(); card.classList.remove("alvo-drop");
        const v = ev.dataTransfer?.getData("text/plain");
        if (v !== "" && v !== undefined && Number.isFinite(Number(v))) aplicar(input, v);
      });
      input.addEventListener("input", () => { this._guardarAtributosDigitados(); atualizar(); });
    });
    atualizar();
  }

  /** Prévia dos valores derivados usando o mesmo cálculo da ficha (clone do ator, nada é gravado). */
  _atualizarPreviaAtributos(inputs) {
    const painel = this.element.querySelector(".nauren-criador-previa");
    if (!painel) return;
    try {
      const atr = {};
      for (const i of inputs) atr[i.name.slice(9)] = { value: Math.max(0, Math.round(Number(i.value) || 0)) };
      const clone = this.actor.clone({ system: { atributos: atr } }, { keepId: true });
      clone.prepareData?.();
      const s = clone.system;
      const itens = Math.max(0, naurenInterpretarModificador("@destinoItensIniciais", clone)?.valor ?? 0);
      const valores = {
        vida: s.vida?.max, mana: s.mana?.max, estaminaCombate: s.estaminaCombate?.max, dadosDestino: s.dadosDestino?.max,
        poderAtaque: s.poderAtaque?.value, poderMagia: s.poderMagia?.value, espirito: s.espirito?.max, vitalidade: s.vitalidade?.max, itens
      };
      for (const [k, v] of Object.entries(valores)) {
        const el = painel.querySelector(`[data-previa-valor="${k}"]`);
        if (el) el.textContent = Number.isFinite(v) ? String(v) : "—";
      }
    } catch (err) { console.warn("Nauren RPG | prévia de atributos", err); }
  }

  /** Escolhe como gerar os valores: "fixo" (5, 4, 3, 3, 2) ou "rolar" (5d6). */
  static async onModoAtributos(event, target) {
    this._guardarAtributosDigitados();
    // Ainda nos valores de fábrica (todos iguais): começa zerado, para as fichas ficarem livres.
    const d = this._atributosDigitados ?? {};
    const vals = Object.values(d);
    if (vals.length === 5 && vals.every(v => v === vals[0]) && !this._distribuicaoComecou) {
      this._atributosDigitados = Object.fromEntries(Object.keys(d).map(k => [k, 0]));
    }
    this._distribuicaoComecou = true;
    const modoNovo = target.dataset.modo || "";
    const modoAntes = this.actor.getFlag("nauren", "criadorModoAtributos") || "";
    await this.actor.setFlag("nauren", "criadorModoAtributos", modoNovo);
    // 0.94.19: troca de modo fica no registro (ex.: rolou e depois trocou para os valores fixos).
    if (modoNovo !== modoAntes) {
      const jaRolados = (this.actor.getFlag("nauren", "criadorDadosAtributos") ?? []).filter(v => v !== null && v !== undefined);
      naurenAnotarNoRegistro(this.actor, { tipo: "modo", dados: { modo: modoNovo, antes: modoAntes, dadosJaRolados: jaRolados },
        linhas: [{ label: "Modo", value: modoNovo === "fixo" ? "valores fixos (5, 4, 3, 3, 2)" : modoNovo === "rolar" ? "rolar 5d6" : "nenhum", breakdown: jaRolados.length ? `dados já rolados: ${jaRolados.join(", ")}` : "" }] })
        .catch(err => console.warn("Nauren RPG | Registro de rolagens (modo)", err));
    }
    this.render();
  }

  /** Botões − / + de cada atributo. */
  static async onAjustarAtributo(event, target) {
    const card = target.closest(".nauren-criador-atributo-campo");
    const input = card?.querySelector("input");
    if (!input) return;
    input.value = Math.max(0, (Number(input.value) || 0) + Number(target.dataset.passo || 0));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /** Zera a distribuição para recomeçar. */
  static async onLimparAtributos() {
    this.element.querySelectorAll('input[name^="atributo_"]').forEach(i => { i.value = 0; i.dispatchEvent(new Event("input", { bubbles: true })); });
  }

  /** Caixas "cole o link da imagem" (retrato e token): ao colar/sair do campo, valida e aplica na prévia e nos campos. */
  _ligarLinksDeImagem() {
    this.element.querySelectorAll(".nauren-criador-link").forEach(input => {
      const aplicarLink = () => {
        const url = String(input.value ?? "").trim();
        if (!url) { input.classList.remove("invalido"); return; }
        if (!/^https?:\/\/\S+\.(png|jpe?g|webp|gif|svg|avif)(\?\S*)?$/i.test(url)) {
          input.classList.add("invalido");
          ui.notifications.warn("Cole o link direto da imagem, terminando em .png, .jpg, .jpeg, .webp ou .gif (ex.: https://i.imgur.com/abc123.png).");
          return;
        }
        input.classList.remove("invalido");
        this._aplicarImagemCriador(input.dataset.alvo, url);
        naurenAvisarSeLinkBloqueado(url, input.dataset.alvo);
      };
      input.addEventListener("change", aplicarLink);
      input.addEventListener("paste", () => setTimeout(aplicarLink, 0));
    });
  }

  /** Aplica um caminho/link de imagem (retrato ou token) na prévia e nos campos escondidos do Criador. */
  _aplicarImagemCriador(alvo, caminho) {
    const root = this.element;
    const campo = root.querySelector(`input[name="${alvo === "token" ? "imgToken" : "imgRetrato"}"]`);
    const previa = root.querySelector(`img[data-previa="${alvo}"]`);
    if (!caminho) return;
    if (campo) campo.value = caminho;
    if (previa) previa.src = caminho;
    if (alvo === "token") this._imgTokenEscolhida = caminho;
    else {
      this._imgRetratoEscolhida = caminho;
      if (!this._imgTokenEscolhida) { const pt = root.querySelector('img[data-previa="token"]'), ct = root.querySelector('input[name="imgToken"]'); if (pt) pt.src = caminho; if (ct) ct.value = caminho; }
    }
  }

  /** Mesmo padrão de NaurenActorSheet#_ligarScrollSheetBody, aplicado à área rolável de cada etapa (".nauren-criador-etapa"). */
  _ligarScrollCriadorEtapa() {
    const etapaEl = this.element.querySelector(".nauren-criador-etapa");
    if (!etapaEl) return;
    etapaEl.scrollTop = this.#scrollCriadorEtapa;
    etapaEl.addEventListener("scroll", () => {
      this.#scrollCriadorEtapa = etapaEl.scrollTop;
    });
  }

  /** Etapa 0 (Atributos) - grava os 5 valores direto no Ator e avança pra etapa 1. */
  /** Borda do token (opcional): enquadra a imagem do token num círculo com a borda do Foundry. */
  static async onBordaToken() {
    const root = this.element;
    const src = String(root?.querySelector('input[name="imgToken"]')?.value || root?.querySelector('input[name="imgRetrato"]')?.value || "").trim();
    const cfg = await naurenAbrirBorda(this.actor, { srcInicial: src });
    if (!cfg) return;
    const previa = root?.querySelector('img[data-previa="token"]');
    const botao = root?.querySelector('[data-action="bordaTokenCriador"]');
    if (cfg.ativa) {
      const url = await naurenBordaPreviaDoAtor(this.actor) ?? await naurenBordaPreviaDataUrl(cfg);
      if (previa && url) { previa.src = url; previa.classList.add("com-borda"); }
      botao?.classList.add("ativa");
    } else {
      if (previa) { previa.src = String(root?.querySelector('input[name="imgToken"]')?.value || this.actor.prototypeToken?.texture?.src || ""); previa.classList.remove("com-borda"); }
      botao?.classList.remove("ativa");
    }
  }

  /** Escolhe o retrato ou o token: navegador de arquivos (se o jogador puder) ou um link. */
  static async onEnquadrarRetrato() {
    const src = this.element?.querySelector?.('input[name="imgRetrato"]')?.value || this._imgRetratoEscolhida || this.actor.img;
    await naurenAbrirEnquadramento(this.actor, src, 1.25);
    const previa = this.element?.querySelector?.('img[data-previa="retrato"]');
    if (previa) previa.setAttribute("style", naurenEstiloEnquadramento(this.actor, src));
  }

  static async onEscolherImagem(event, target) {
    const alvo = target.dataset.alvo;
    const root = this.element;
    const campo = root.querySelector(`input[name="${alvo === "token" ? "imgToken" : "imgRetrato"}"]`);
    const previa = root.querySelector(`img[data-previa="${alvo}"]`);
    const aplicar = caminho => {
      if (!caminho) return;
      if (campo) campo.value = caminho;
      if (previa) previa.src = caminho;
      if (alvo === "token") this._imgTokenEscolhida = caminho;
      else {
        this._imgRetratoEscolhida = caminho;
        if (!this._imgTokenEscolhida) { const pt = root.querySelector('img[data-previa="token"]'), ct = root.querySelector('input[name="imgToken"]'); if (pt) pt.src = caminho; if (ct) ct.value = caminho; }
      }
    };
    const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
    if (FP && game.user.can("FILES_BROWSE")) {
      new FP({ type: "image", current: campo?.value ?? "", callback: aplicar }).browse();
      return;
    }
    const link = await foundry.applications.api.DialogV2.prompt({ window: { title: alvo === "token" ? "Imagem do token" : "Imagem do personagem" },
      content: `<p>Cole o link (endereço) da imagem. Para escolher um arquivo do servidor, peça ao Mestre a permissão de navegar nos arquivos.</p><input type="text" name="link" value="${campo?.value ?? ""}" style="width: 100%;">`,
      ok: { label: "Usar esta imagem", callback: (ev, btn) => btn.form.elements.link.value.trim() }, rejectClose: false }).catch(() => null);
    aplicar(link);
  }

  static async onConfirmarAtributos(event, target) {
    const root = this.element;
    const nomeNovo = String(root.querySelector('input[name="nomePersonagem"]')?.value ?? "").trim();
    if (nomeNovo && nomeNovo !== this.actor.name) await this.actor.update({ name: nomeNovo });
    // Retrato e token: vão direto para a ficha; token vazio = usa o retrato.
    {
      const retrato = String(root.querySelector('input[name="imgRetrato"]')?.value ?? "").trim();
      let token = String(root.querySelector('input[name="imgToken"]')?.value ?? "").trim();
      if (!this._imgTokenEscolhida && this._imgRetratoEscolhida) token = retrato;
      const upd = {};
      if (retrato && retrato !== this.actor.img) upd.img = retrato;
      if (token && token !== this.actor.prototypeToken?.texture?.src) upd["prototypeToken.texture.src"] = token;
      if (Object.keys(upd).length) await this.actor.update(upd);
      if (upd["prototypeToken.texture.src"]) {
        for (const tk of this.actor.getActiveTokens?.(false, true) ?? []) if (tk.isOwner) await tk.update({ "texture.src": token }).catch(() => {});
      }
    }
    // Valores fixos/rolados que ainda não foram para nenhum atributo: só confirma (não impede).
    {
      const sobrando = [...root.querySelectorAll(".nauren-criador-ficha-valor:not(.usada)")].map(c => c.dataset.valor);
      if (sobrando.length) {
        const seguir = await foundry.applications.api.DialogV2.confirm({ window: { title: "Atributos" },
          content: `<p>Ainda sobram valores sem atributo: <b>${sobrando.join(", ")}</b>.</p><p>Continuar mesmo assim?</p>`, rejectClose: false }).catch(() => false);
        if (!seguir) return;
      }
    }
    const ler = campo => {
      const input = root.querySelector(`input[name="atributo_${campo}"]`);
      const n = Number(input?.value);
      return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
    };
    await this.actor.update({
      "system.atributos.forca.value": ler("forca"),
      "system.atributos.agilidade.value": ler("agilidade"),
      "system.atributos.estamina.value": ler("estamina"),
      "system.atributos.inteligencia.value": ler("inteligencia"),
      "system.atributos.destino.value": ler("destino")
    });
    // 0.94.19: a distribuição vai para o registro de rolagens (confere com os dados rolados ou os valores fixos).
    try {
      const modoD = this.actor.getFlag("nauren", "criadorModoAtributos") || "";
      const atributosD = Object.fromEntries(["forca", "agilidade", "estamina", "inteligencia", "destino"].map(k => [k, ler(k)]));
      // Rolar: compara com os dados do REGISTRO (o que o Mestre rolou), não com a cópia da ficha.
      const fonteD = modoD === "rolar" ? naurenRegistroParaExport(this.actor).resumo.dadosAtributos.filter(v => v !== null) : modoD === "fixo" ? NAUREN_CRIADOR_VALORES_FIXOS : null;
      const ord = a => [...a].map(Number).sort((x, y) => x - y).join(",");
      const bate = fonteD ? ord(Object.values(atributosD)) === ord(fonteD) : null;
      const ultimaD = [...(this.actor.getFlag("nauren", "registroRolagens") ?? [])].reverse().find(e => e.tipo === "distribuicao");
      if (JSON.stringify(ultimaD?.dados?.atributos ?? null) !== JSON.stringify(atributosD)) {
        await naurenAnotarNoRegistro(this.actor, { tipo: "distribuicao", dados: { modo: modoD, atributos: atributosD, valoresDisponiveis: fonteD, bateComDados: bate },
          linhas: [{ label: "Atributos", value: Object.entries(atributosD).map(([k, v]) => `${NAUREN_NOMES_ATRIBUTO_CURTO[k]} ${v}`).join(" · "), breakdown: fonteD ? `${modoD === "rolar" ? "dados rolados" : "valores fixos"}: ${fonteD.join(", ")} · ${bate ? "confere" : "NÃO confere"}` : "sem modo escolhido" }] });
      }
    } catch (err) { console.warn("Nauren RPG | Registro de rolagens (distribuição)", err); }
    await this.actor.setFlag("nauren", "criadorEtapa", 1);
    this.#scrollCriadorEtapa = 0;
    this.render();
  }

  /** Clica num card de Peculiaridade - adiciona/remove na ficha direto (mesmo padrão "cada etapa já grava de verdade"). Limite de 6 (3 pares completos). */
  /** Guarda os atributos digitados antes de redesenhar a tela (não se perdem ao rolar os dados). */
  _guardarAtributosDigitados() {
    const d = {};
    this.element?.querySelectorAll?.('input[name^="atributo_"]').forEach(el => { d[el.name.slice(9)] = Number(el.value) || 0; });
    if (Object.keys(d).length) this._atributosDigitados = d;
  }

  /** Card no chat quando os 5 dados de atributo estiverem rolados. */
  async _cardDadosAtributos(valores) {
    await naurenPostarCard({ ator: this.actor, titulo: "Atributos rolados (5d6)", icone: "icons/sundries/gaming/dice-runed-tan.webp", fonte: "Criador de personagem",
      linhas: [...valores.map((v, i) => ({ label: `Dado ${i + 1}`, value: String(v) })), { label: "Soma", value: String(valores.reduce((t, v) => t + v, 0)), breakdown: "distribua os valores entre os atributos" }] });
  }

  static async onRolarDadoAtributo(event, target) {
    const i = Number(target.dataset.indice);
    const dados = [...(this.actor.getFlag("nauren", "criadorDadosAtributos") ?? [null, null, null, null, null])];
    if (dados[i] !== null && dados[i] !== undefined) return; // cada dado rola uma vez só
    this._guardarAtributosDigitados();
    if (this._rolandoAtributo) return; // um pedido por vez (o Mestre está rolando)
    this._rolandoAtributo = true;
    let r;
    try { r = await naurenRolagemAuditada(this.actor, { tipo: "atributos", rotulo: `Atributos: dado ${i + 1}`, formula: "1d6", indices: [i] }); }
    finally { this._rolandoAtributo = false; }
    if (!r?.ok) return;
    dados[i] = r.resultados[0];
    await this.actor.setFlag("nauren", "criadorDadosAtributos", dados);
    if (dados.every(v => v !== null && v !== undefined)) await this._cardDadosAtributos(dados);
    this.render();
  }

  static async onRolarTodosDadosAtributo() {
    const dados = [...(this.actor.getFlag("nauren", "criadorDadosAtributos") ?? [null, null, null, null, null])];
    const faltam = dados.map((v, i) => (v === null || v === undefined) ? i : -1).filter(i => i >= 0);
    if (!faltam.length) return;
    this._guardarAtributosDigitados();
    if (this._rolandoAtributo) return;
    this._rolandoAtributo = true;
    let r;
    try { r = await naurenRolagemAuditada(this.actor, { tipo: "atributos", rotulo: faltam.length === 5 ? "Atributos: 5 dados" : `Atributos: dados ${faltam.map(i => i + 1).join(", ")}`, formula: `${faltam.length}d6`, indices: faltam }); }
    finally { this._rolandoAtributo = false; }
    if (!r?.ok) return;
    const resultados = r.resultados;
    faltam.forEach((i, k) => { dados[i] = resultados[k]; });
    await this.actor.setFlag("nauren", "criadorDadosAtributos", dados);
    await this._cardDadosAtributos(dados);
    this.render();
  }

  /** Rola 1d10 na tabela de Benefícios ou de Fardos (livro) e já seleciona a Peculiaridade sorteada. */
  static async onRolarPeculiaridade(event, target) {
    const tipo = target.dataset.tipo === "fardo" ? "fardo" : "beneficio";
    const tabelas = {
      beneficio: ["Forte", "Ágil", "Sábio", "Resiliente", "Pelo Grosso", "Escalador", "Nadador", "Feroz", "Audição", "Olhar"],
      fardo: ["Traumatizado", "Desafortunado", "Lesão", "Mão Trêmula", "Frágil", "Doente", "Ferida Antiga", "Fraco", "Desatento", "Fôlego Curto"]
    };
    const packs = await naurenObterOuCriarPacks();
    await packs.peculiaridades.getIndex({ fields: ["system.tipo"] });
    const doTipo = e => tipo === "fardo" ? e.system?.tipo === "fardo" : e.system?.tipo !== "fardo";
    const selecionadas = this.actor.items.filter(i => String(i.getFlag("nauren", "origemUuid") || i.getFlag("core", "sourceId") || "").startsWith(`Compendium.${packs.peculiaridades.collection}.`));
    if (selecionadas.length >= 6) { ui.notifications.warn("Você já tem 6 Peculiaridades (3 pares)."); return; }
    const norm = t => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const copiasDe = en => en ? selecionadas.filter(i => (i.getFlag("nauren", "origemUuid") || i.getFlag("core", "sourceId")) === en.uuid).length : 0;
    // Já está ×2 (limite do livro)? Rola de novo sozinho até sair outra.
    const historico = [];
    let roll, nome, entrada;
    for (let tentativa = 0; tentativa < 30; tentativa++) {
      roll = await new Roll("1d10").evaluate();
      if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true);
      nome = tabelas[tipo][roll.total - 1];
      entrada = packs.peculiaridades.index.find(e => doTipo(e) && norm(e.name) === norm(nome));
      if (!entrada || copiasDe(entrada) < 2) break;
      historico.push(`${roll.total} → ${nome} já está ×2`);
    }
    const rotuloTipo = tipo === "fardo" ? "Fardo" : "Benefício";
    let situacao = "selecionada";
    if (entrada) {
      const copias = selecionadas.filter(i => (i.getFlag("nauren", "origemUuid") || i.getFlag("core", "sourceId")) === entrada.uuid).length;
      if (copias >= 2) situacao = "já escolhida 2 vezes (limite)";
      else { const item = await fromUuid(entrada.uuid); await naurenAdicionarItemNaFicha(this.actor, item); if (copias === 1) situacao = "selecionada de novo (efeitos somados)"; }
    } else situacao = "não encontrada no compêndio";
    this._sorteioPeculiaridade = { tipo: rotuloTipo, face: roll.total, nome, uuid: entrada?.uuid ?? null, situacao };
    await naurenPostarCard({ ator: this.actor, titulo: `Peculiaridade: ${rotuloTipo}`, icone: entrada?.img ?? "icons/sundries/gaming/dice-runed-tan.webp", fonte: "Criador de personagem",
      linhas: [...historico.map(h => ({ label: "Rolou de novo", value: h })), { label: `${roll.total} no d10`, value: nome, breakdown: situacao }] });
    this.render();
  }

  /** Botão "−" no canto do cartão: tira uma cópia da Peculiaridade. */
  static async onRemoverUmaPeculiaridade(event, target) {
    event?.stopPropagation?.();
    const uuid = target.dataset.uuid;
    const copias = this.actor.items.filter(i => i.getFlag("nauren", "origemUuid") === uuid || i.getFlag("core", "sourceId") === uuid);
    if (copias.length) await this.actor.deleteEmbeddedDocuments("Item", [copias[copias.length - 1].id]);
    this.render();
  }

  static async onToggleCardPeculiaridade(event, target) {
    const uuid = target.dataset.uuid;
    if (!uuid) return;
    // Qualquer tipo de item (a Garras/Presas é uma arma); remove todas as cópias, inclusive repetidas.
    const copias = this.actor.items.filter(i => i.getFlag("nauren", "origemUuid") === uuid || i.getFlag("core", "sourceId") === uuid);
    // Regra do livro: a mesma Peculiaridade no máximo 2 vezes. Clique: ×1 -> ×2 -> tira uma (volta a ×1).
    if (copias.length >= 2) {
      await this.actor.deleteEmbeddedDocuments("Item", [copias[copias.length - 1].id]);
      this.render();
      return;
    }
    const packPec = game.packs.find(pk => pk.metadata.label === "Nauren - Peculiaridades (Benefícios e Fardos)") ?? null;
    const prefixoPec = packPec ? `Compendium.${packPec.collection}.` : "";
    const jaEscolhidas = this.actor.items.filter(i => i.type === "peculiaridade" || (prefixoPec && String(i.getFlag("nauren", "origemUuid") || i.getFlag("core", "sourceId") || "").startsWith(prefixoPec))).length;
    if (jaEscolhidas >= 6) {
      ui.notifications.warn("Máximo de 3 pares (6 Peculiaridades) já escolhidos.");
      return;
    }
    const item = await fromUuid(uuid).catch(() => null);
    if (!item) return;
    await naurenAdicionarItemNaFicha(this.actor, item);
    this.render();
  }

  static async onAvancarDePeculiaridades(event, target) {
    await this.actor.setFlag("nauren", "criadorEtapa", 2);
    this.#scrollCriadorEtapa = 0;
    this.render();
  }

  /** Clica num card de Pigmento - adiciona/remove na ficha direto. Limite de 2 (as duas cores favoritas). */
  static async onToggleCardPigmento(event, target) {
    const uuid = target.dataset.uuid;
    if (!uuid) return;
    const existente = this.actor.items.find(i =>
      i.type === "cor" && (i.getFlag("nauren", "origemUuid") === uuid || i.getFlag("core", "sourceId") === uuid)
    );
    if (existente) {
      await existente.delete();
      this.render();
      return;
    }
    const jaEscolhidos = this.actor.items.filter(i => i.type === "cor").length;
    if (jaEscolhidos >= 2) {
      ui.notifications.warn("Máximo de 2 Pigmentos (suas duas cores favoritas) já escolhidos.");
      return;
    }
    const item = await fromUuid(uuid).catch(() => null);
    if (!item) return;
    await naurenAdicionarItemNaFicha(this.actor, item);
    this.render();
  }

  static async onAvancarDePigmentos(event, target) {
    await this.actor.setFlag("nauren", "criadorEtapa", 3);
    this.#scrollCriadorEtapa = 0;
    this.render();
  }

  /** Clica num card de Equipamento - adiciona/remove na ficha direto. Limite dinâmico igual ao atributo de Destino (mesma fórmula "@destino" já usada no nível 1 de toda Classe). */
  static async onToggleCardEquipamento(event, target) {
    const uuid = target.dataset.uuid;
    if (!uuid) return;
    // 0.94.29: um clique por vez (cliques rápidos escolhiam vários itens antes de o primeiro terminar).
    if (this._equipOcupado) return;
    this._equipOcupado = true;
    try {
      await NaurenCriadorPersonagem._alternarEquipamento.call(this, uuid, target);
      // A munição que veio de brinde sai junto quando a arma dela não está mais escolhida.
      // Se outra arma escolhida usa o mesmo tipo (ex.: Arco e Besta usam Flecha), a munição fica e passa a ser dela.
      const origem = i => i.getFlag("nauren", "origemUuid") || i._stats?.compendiumSource || i.getFlag("core", "sourceId");
      const armas = this.actor.items.filter(i => i.type === "arma" && i.getFlag("nauren", "escolhaEquipamentoCriador"));
      const escolhidas = new Set(armas.map(origem).filter(Boolean));
      const apagar = [];
      for (const m of this.actor.items.filter(i => i.getFlag("nauren", "municaoInicial"))) {
        if (escolhidas.has(m.getFlag("nauren", "municaoInicial"))) continue;
        const tipo = String(m.system.tipoMunicao ?? "").toLowerCase();
        const outra = armas.find(a => a.system.usaMunicao && String(a.system.tipoMunicao ?? "").toLowerCase() === tipo);
        if (outra && origem(outra)) await m.setFlag("nauren", "municaoInicial", origem(outra));
        else apagar.push(m.id);
      }
      if (apagar.length) { await this.actor.deleteEmbeddedDocuments("Item", apagar); this.render(); }
    }
    finally { this._equipOcupado = false; }
  }

  static async _alternarEquipamento(uuid, target) {
    const existente = this.actor.items.find(i =>
      (i.type === "arma" || i.type === "armadura") && i.getFlag("nauren", "escolhaEquipamentoCriador") && (i.getFlag("nauren", "origemUuid") === uuid || i._stats?.compendiumSource === uuid || i.getFlag("core", "sourceId") === uuid)
    );
    if (existente) {
      await existente.delete();   // a munição de brinde é tratada depois, em onToggleCardEquipamento
      this.render();
      return;
    }
    const max = Math.max(0, naurenInterpretarModificador("@destinoItensIniciais", this.actor)?.valor ?? 0);
    const jaEscolhidos = this.actor.items.filter(i => (i.type === "arma" || i.type === "armadura") && i.getFlag("nauren", "escolhaEquipamentoCriador")).length;
    if (jaEscolhidos >= max || target?.classList?.contains("bloqueado")) {
      ui.notifications.warn(`Você já escolheu ${max === 1 ? "o seu item" : `os ${max} itens`} (conforme seu Destino). Clique num item escolhido para desmarcar e trocar.`);
      return;
    }
    const item = await fromUuid(uuid).catch(() => null);
    if (!item) return;
    await naurenAdicionarItemNaFicha(this.actor, item);
    const novoEq = this.actor.items.find(i => (i.type === "arma" || i.type === "armadura") && (i.getFlag("nauren", "origemUuid") === uuid || i.getFlag("core", "sourceId") === uuid) && !i.getFlag("nauren", "escolhaEquipamentoCriador"));
    if (novoEq) await novoEq.setFlag("nauren", "escolhaEquipamentoCriador", true);
    // Arma que usa munição já vem com 10 munições do tipo dela (sem gastar escolha).
    if (item.type === "arma" && item.system.usaMunicao && item.system.tipoMunicao) {
      const packA = game.packs.find(pk => pk.metadata.label === "Nauren - Armas");
      const docs = packA ? await packA.getDocuments() : [];
      const mun = docs.find(d => d.type === "consumivel" && d.system.ehMunicao && d.system.tipoMunicao === item.system.tipoMunicao && !/^\[Removida/.test(d.name));
      if (mun && !this.actor.items.some(i => i.type === "consumivel" && i.system.ehMunicao && i.system.tipoMunicao === mun.system.tipoMunicao)) {
        const dados = mun.toObject(); delete dados._id;
        dados.system.quantidade = 10;
        foundry.utils.setProperty(dados, "flags.nauren.municaoInicial", uuid);
        await this.actor.createEmbeddedDocuments("Item", [dados]);
      }
    }
    this.render();
  }

  /** Configuração de equipamento da Classe: a já gravada na ficha ou a marcada na etapa Classe. */
  async _classeParaEquipamento() {
    const naFicha = this.actor.items.find(i => i.type === "classe");
    if (naFicha) return { cfg: naFicha.system.equipamentoRecomendado ?? null, nome: naFicha.name };
    const uuid = this.actor.getFlag("nauren", "criadorClasseSelecionada");
    const doc = uuid ? await fromUuid(uuid).catch(() => null) : null;
    if (!doc) return { cfg: null, nome: "" };
    return { cfg: doc.system?.equipamentoRecomendado ?? null, nome: doc.name };
  }

  /** Clica num card de Classe - só MARCA a seleção (não grava ainda): dá para voltar e trocar até concluir. */
  static async onEscolherClasse(event, target) {
    const uuid = target.dataset.uuid;
    if (!uuid) return;
    if (this.actor.items.some(i => i.type === "classe")) return;
    await this.actor.setFlag("nauren", "criadorClasseSelecionada", uuid);
    this.render();
  }

  /** Classe marcada (ou já gravada) - segue para o Equipamento. */
  static async onAvancarDeClasse(event, target) {
    const temClasse = this.actor.items.some(i => i.type === "classe");
    if (!temClasse && !this.actor.getFlag("nauren", "criadorClasseSelecionada")) {
      ui.notifications.warn("Escolha uma Classe antes de continuar.");
      return;
    }
    await this.actor.setFlag("nauren", "criadorEtapa", 4);
    this.#scrollCriadorEtapa = 0;
    this.render();
  }

  /** Atalho da barra de progresso: volta direto para uma etapa já feita. */
  static async onIrParaEtapa(event, target) {
    const alvo = Number(target.dataset.etapa);
    const atual = this.actor.getFlag("nauren", "criadorEtapa") ?? 0;
    if (!Number.isInteger(alvo) || alvo < 0 || alvo >= atual || atual >= NAUREN_CRIADOR_ETAPAS.length) return;
    await this.actor.setFlag("nauren", "criadorEtapa", alvo);
    this.#scrollCriadorEtapa = 0;
    this.render();
  }

  /** Fim do Equipamento: grava a Classe marcada (já aplica a progressão do nível 1 sozinha, ver naurenAdicionarItemNaFicha) e a Subclasse correspondente, casando pelo identifier. Depois mostra o resumo. */
  static async onConfirmarClasse(event, target) {
    if (!this.actor.items.some(i => i.type === "classe")) {
      const uuid = this.actor.getFlag("nauren", "criadorClasseSelecionada");
      if (!uuid) { ui.notifications.warn("Volte e escolha uma Classe antes de concluir."); return; }
      const item = await fromUuid(uuid).catch(() => null);
      if (!item) return;
      const criados = await naurenAdicionarItemNaFicha(this.actor, item);
      if (!criados) { this.render(); return; }
      const identifier = item.system.identifier;
      if (identifier) {
        const packs = await naurenObterOuCriarPacks();
        await packs.subclasses.getIndex({ fields: ["system.classeIdentifier"] });
        const entradaSubclasse = packs.subclasses.index.find(i => i.system?.classeIdentifier === identifier);
        if (entradaSubclasse) {
          const subclasseItem = await fromUuid(entradaSubclasse.uuid).catch(() => null);
          if (subclasseItem) await naurenAdicionarItemNaFicha(this.actor, subclasseItem);
        }
      }
    }
    await this.actor.setFlag("nauren", "criadorEtapa", NAUREN_CRIADOR_ETAPAS.length);
    this.#scrollCriadorEtapa = 0;
    this.render();
  }

  /** Fecha o assistente pra sempre nesta ficha - o personagem já está pronto (Classe escolhida é o último passo). */
  static async onConcluirCriador(event, target) {
    await this.actor.setFlag("nauren", "criadorConcluido", true);
    this.close();
    // Logo depois do Criador: o jogador escolhe quais recursos aparecem no token.
    setTimeout(() => { try { NaurenBarrasEditor.abrir(this.actor); } catch (err) { console.warn("Nauren RPG | editor de barras", err); } }, 300);
  }

  static async onVoltarEtapa(event, target) {
    const etapaAtual = this.actor.getFlag("nauren", "criadorEtapa") ?? 0;
    if (etapaAtual <= 0) return;
    await this.actor.setFlag("nauren", "criadorEtapa", etapaAtual - 1);
    this.#scrollCriadorEtapa = 0;
    this.render();
  }
}

// Nomes das 5 etapas do Criador, na ordem - usado pro cabeçalho/barra de
// progresso do wizard (ver NaurenCriadorPersonagem#_prepareContext).
// Etapa Atributos do Criador: texto do livro (cap. "Seus atributos") e os valores fixos
// para quem não quer rolar. Só exibição/apoio: a ficha continua aceitando qualquer valor.
const NAUREN_CRIADOR_ATRIBUTOS = [
  { chave: "forca", nome: "Força", icone: "fa-fist-raised", desc: "Potência física e o peso que você carrega." },
  { chave: "agilidade", nome: "Agilidade", icone: "fa-running", desc: "Velocidade e esquiva. Decide quem age primeiro no combate." },
  { chave: "estamina", nome: "Estamina", icone: "fa-heartbeat", desc: "Energia para o esforço: quantas ações antes de se exaurir." },
  { chave: "inteligencia", nome: "Inteligência", icone: "fa-brain", desc: "Enigmas, manuscritos e a lógica por trás dos mistérios." },
  { chave: "destino", nome: "Destino", icone: "fa-star", desc: "Rerrolar o D20 no episódio. Também define seus itens iniciais." }
];
const NAUREN_CRIADOR_VALORES_FIXOS = [5, 4, 3, 3, 2];

const NAUREN_CRIADOR_ETAPAS = [
  { nome: "Atributos" },
  { nome: "Peculiaridades" },
  { nome: "Pigmentos" },
  { nome: "Classe" },
  { nome: "Equipamento" }
];

/**
 * ============================================================
 * ÁREA NO MAPA (V14): Scene Region no lugar do Measured Template
 * ============================================================
 * O V14 removeu o documento MeasuredTemplate por completo - a mesma função
 * agora vive nas Scene Regions (fonte: release notes 14.352/14.359, e a
 * migração do sistema oficial Crucible em foundryvtt/crucible#609).
 * O fluxo antigo de preview manual (mousemove/click/wheel) foi substituído
 * pela API pronta canvas.regions.placeRegion, que já cuida do posicionamento
 * interativo no cursor. Achar quem está dentro da área também ficou trivial:
 * RegionDocument#tokens devolve os TokenDocuments contidos (respeitando até
 * elevação, o que o template antigo não fazia sozinho).
 *
 * SHAPES: círculo/retângulo/polígono existem desde o V12; Emanação/Anel
 * foram adicionados no V14. Cone e Linha não foram confirmados na
 * documentação pública - por isso este helper DETECTA em tempo real quais
 * shapes a build atual suporta (foundry.data.BaseShapeData.TYPES) e cai num
 * substituto educado quando o tipo não existe, avisando no console o que
 * encontrou. Depois do primeiro teste ao vivo, ajuste SHAPE_CANDIDATOS
 * abaixo conforme o que aparecer no console.
 */
class NaurenRegionHelper {
  // Pra cada tipo nosso, a lista de nomes de shape a tentar, em ordem de
  // preferência. Confirmado ao vivo no V14: a build tem ['rectangle',
  // 'circle', 'ellipse', 'emanation', 'cone', 'ring', 'line', 'polygon',
  // 'token', 'grid']. "emanation" NÃO está na lista de propósito: seu schema
  // exige um shape "base" aninhado (documentado como "qualquer shape, exceto
  // anel/emanação, pode ser a base") e não vale a pena arriscar adivinhar
  // esse formato - um círculo comum "grudado" no token (attachToToken) dá
  // exatamente o mesmo resultado prático de uma área centrada em quem usou
  // a Ação, então usamos ele direto.
  static SHAPE_CANDIDATOS = {
    circle: ["circle"],
    emanacao: ["circle"],
    cone: ["cone", "circle"],
    rect: ["rectangle"],
    ray: ["line", "rectangle"]
  };

  /** Mapa {tipoShape: classe} dos shapes que ESTA build do Foundry realmente tem. */
  static get shapesDisponiveis() {
    return foundry.data.BaseShapeData?.TYPES ?? {};
  }

  /** Converte metros do sistema em pixels do canvas atual. */
  static metrosParaPixels(metros) {
    const porUnidade = (canvas.grid?.size ?? 100) / (canvas.grid?.distance ?? 1);
    return (metros || 0) * porUnidade;
  }

  /**
   * Ponto inicial pra qualquer shape novo: centro do token controlado (se
   * houver), senão o centro da cena, senão {0,0}. O placeRegion deixa
   * arrastar/posicionar antes de confirmar, então esse valor é só o ponto
   * de partida - não precisa ser exato.
   */
  static pontoInicial(actor = null) {
    // O token de quem usa a Ação (não o que estiver selecionado na tela, que pode ser de outro).
    const token = (actor ? canvas.tokens?.controlled?.find(t => t.actor === actor) ?? actor.getActiveTokens?.(true)?.[0] : null) ?? canvas.tokens?.controlled?.[0];
    if (token?.center) return { x: token.center.x, y: token.center.y };
    const rect = canvas.dimensions?.sceneRect;
    if (rect) return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    return { x: 0, y: 0 };
  }

  /**
   * Monta os dados do shape pra Ação. Devolve { type, ...dimensões } ou null
   * se nada utilizável existir (nunca deve acontecer: círculo sempre existe).
   */
  static montarShape(acao, actor = null) {
    const disponiveis = this.shapesDisponiveis;
    const chaves = Object.keys(disponiveis);
    const candidatos = this.SHAPE_CANDIDATOS[acao.templateTipo] ?? ["circle"];
    // Se o registro de shapes não estiver onde esperamos (namespace pode ter
    // mudado entre builds), não trava: tenta o candidato preferido às cegas e
    // deixa o try/catch do placeRegion apontar o problema no console.
    let tipo;
    if (!chaves.length) {
      tipo = candidatos[0];
    } else {
      tipo = candidatos.find(t => t in disponiveis) ?? (("circle" in disponiveis) ? "circle" : candidatos[0]);
      if (tipo !== candidatos[0]) {
        ui.notifications.info(`Forma "${acao.templateTipo}" não é nativa nesta build - usando "${tipo}" no lugar.`);
      }
    }

    const raioPx = this.metrosParaPixels(acao.templateTamanho || 3);
    const { x, y } = this.pontoInicial(actor); // TODO shape no V14 exige x/y já na criação
    switch (tipo) {
      case "rectangle": {
        const ehLinhaAproximada = acao.templateTipo === "ray";
        const fino = Math.max(this.metrosParaPixels(1), 20);
        return {
          type: "rectangle", x, y,
          width: ehLinhaAproximada ? raioPx : raioPx,
          height: ehLinhaAproximada ? fino : raioPx
        };
      }
      case "cone":
        return { type: "cone", x, y, radius: raioPx, angle: 53, rotation: 0 };
      case "ray":
      case "line": {
        // O campo se chama "length", não "distance" (descoberto testando ao vivo)
        const larguraPx = acao.templateLargura > 0 ? this.metrosParaPixels(acao.templateLargura) : Math.max(this.metrosParaPixels(1), 20);
        return { type: tipo, x, y, length: raioPx, width: larguraPx, rotation: 0 };
      }
      case "circle":
      default:
        return { type: "circle", x, y, radius: raioPx };
    }
  }

  /**
   * Acha quem está dentro da Region recém-criada. Testamos a geometria do(s)
   * shape(s) direto contra o token (BaseShapeData#testPoint), em vez de
   * confiar em RegionDocument#tokens - na prática essa lista pareceu não
   * estar atualizada ainda no instante em que a Region acaba de ser criada
   * (testado ao vivo: dava "nenhum token" mesmo com token visível dentro da
   * forma). Testar a geometria é imediato e não depende de nenhum recálculo
   * interno de "quem está em qual região" ter rodado a tempo.
   *
   * Em vez de testar só o CENTRO do token (que exigia a área cobrir o meio
   * exato da criatura pra contar), testamos vários pontos espalhados pelo
   * token - os 4 cantos, o meio de cada lado e o centro. Basta a área
   * encostar em QUALQUER pedaço do token pra ele contar como atingido -
   * mais perto de como área de efeito costuma funcionar na prática.
   */
  static _pontosDoToken(t) {
    const x = t.x ?? t.document?.x ?? 0;
    const y = t.y ?? t.document?.y ?? 0;
    const w = t.w ?? (t.document?.width ?? 1) * (canvas.grid?.size ?? 100);
    const h = t.h ?? (t.document?.height ?? 1) * (canvas.grid?.size ?? 100);
    return [
      { x, y }, { x: x + w, y }, { x, y: y + h }, { x: x + w, y: y + h }, // cantos
      { x: x + w / 2, y }, { x: x + w / 2, y: y + h },                    // meio cima/baixo
      { x, y: y + h / 2 }, { x: x + w, y: y + h / 2 },                    // meio esquerda/direita
      { x: x + w / 2, y: y + h / 2 }                                      // centro
    ];
  }

  static _tokensNaRegiao(region) {
    const shapes = region.shapes ?? [];
    if (shapes.length && shapes.every(s => typeof s.testPoint === "function")) {
      return canvas.tokens.placeables
        .filter(t => t.actor && naurenCelulasNaArea(t.center, shapes, t.document, region))
        .map(t => t.document);
    }
    // Fallback pouco provável (build sem BaseShapeData#testPoint): usa a
    // lista pronta do documento, mesmo podendo estar um instante atrasada.
    return Array.from(region.tokens ?? []).filter(t => t?.actor);
  }

  /**
   * Coloca a área no mapa (posicionamento interativo no cursor, clique
   * confirma) e devolve { region, tokens } - "tokens" já filtrado só pra
   * TokenDocuments com ator. Devolve null se o jogador cancelar.
   * A Region criada FICA no mapa como marcador visual (igual o template
   * antigo ficava) - apague na mão quando não precisar mais.
   *
   * Nota visual: Regions no V14 desenham um polígono translúcido contínuo,
   * diferente do MeasuredTemplate antigo, que sombreava os quadrados do grid
   * por baixo. Isso é o comportamento nativo do V14 (não é um bug daqui) -
   * a área calculada é a mesma, só o desenho na tela mudou de estilo.
   */
  static async colocarArea(item, acao, alcanceMetros = null, centroOrigem = null) {
    if (!canvas?.ready) return null;
    const shape = this.montarShape(acao, item.actor);
    if (!shape) {
      ui.notifications.error("Nenhum formato de área disponível nesta build do Foundry.");
      return null;
    }

    const nome = !acao.nome || acao.nome === "Ação" || acao.nome === item.name ? item.name : String(acao.nome).startsWith(item.name) ? acao.nome : `${item.name} — ${acao.nome}`;
    const token = (item.actor ? canvas.tokens?.controlled?.find(t => t.actor === item.actor) ?? item.actor.getActiveTokens?.(true)?.[0] : null) ?? canvas.tokens?.controlled?.[0];
    let region = null;
    try {
      // API nova do V14. "attachToToken" (14.359+) já centraliza e acompanha
      // o token de origem sozinho - usamos pra Emanação, que é justamente
      // uma área "grudada" em quem usou a Ação. "color" usa a cor
      // configurada em "templateCor" (Ação), ou a cor que o próprio
      // jogador escolheu no Foundry se não estiver configurada.
      // "visibility: ALWAYS" é o MESMO ajuste já feito em
      // criarRegiaoEmanacao - sem isso, uma Região colocada pela
      // ferramenta interativa (placeRegion) só fica visível enquanto a
      // camada de Regiões estiver ativa, sumindo assim que o mestre volta
      // pra camada de Token pro jogo normal (bug idêntico ao que a
      // Emanação teve no início).
      const visibilidade = acao.templateInvisivel
        ? (CONST.REGION_VISIBILITY?.LAYER ?? 1)
        : (CONST.REGION_VISIBILITY?.ALWAYS ?? 2);
      const opcoes = {
        shapes: [shape], name: nome, color: acao.templateCor || game.user.color.css, visibility: visibilidade,
        // Melhoria visual pedida: "Covered Grid Spaces" em vez de "True
        // Shape" (destaca os quadrados do grid cobertos, mais legível pra
        // combate em grid, igual o MeasuredTemplate antigo fazia) e
        // "Display Measurements" ativado (mostra a régua/distância da
        // área direto no mapa). Nomes de campo confirmados no próprio
        // formato de criação de Region do V14.
        highlightMode: "coverage", displayMeasurements: true
      };
      if (acao.templateTipo === "emanacao" && token) opcoes.attachToToken = token.document.id;
      try {
        region = await canvas.regions.placeRegion(opcoes);
      } catch (errCor) {
        // "color" pode não ser aceito neste nível dependendo da build - tenta
        // de novo sem ele em vez de falhar a área inteira por causa da cor.
        console.warn("Nauren RPG | placeRegion recusou o campo \"color\", tentando sem ele.", errCor);
        delete opcoes.color;
        region = await canvas.regions.placeRegion(opcoes);
      }
    } catch (err) {
      console.error("Nauren RPG | Falha ao chamar canvas.regions.placeRegion.", err);
      console.log("Nauren RPG | Shape enviado:", shape);
      console.log("Nauren RPG | Shapes disponíveis nesta build:", Object.keys(this.shapesDisponiveis));
      ui.notifications.error("Não consegui colocar a área no mapa (veja o console F12 e me mande o erro).");
      return null;
    } finally {
      // placeRegion troca pra camada de Regiões; devolve o controle pra
      // camada de Tokens (mesma correção que o Crucible precisou fazer).
      try { canvas.tokens?.activate?.(); } catch (e) { /* sem drama */ }
    }

    if (!region) return null; // jogador cancelou com botão direito

    // Limite de Alcance em Áreas (ver campoAcao > alcance) - a
    // ferramenta nativa do Foundry (placeRegion) não tem um jeito de
    // mostrar/travar a distância EM TEMPO REAL durante o arrasto, então
    // valida DEPOIS que a área já foi colocada: mede do PONTO de
    // origem (centro de quem usou a Ação, já capturado como números
    // simples ANTES de chamar esta função - ver comentário no chamador
    // sobre por que não usar o objeto do token direto aqui) até o
    // CENTRO REAL da área. Bug real corrigido: usava "shape.x/y" (o
    // objeto ORIGINAL passado pra placeRegion) - esse objeto sempre
    // começa no centro do PRÓPRIO token de quem usou a Ação (ver
    // "pontoInicial", exigência da API pra criar o shape antes do
    // jogador clicar em qualquer lugar) e NUNCA é atualizado com a
    // posição final de verdade - a distância dava sempre ~0m, nunca
    // disparando o aviso. A posição real fica em "region.shapes[0]"
    // (o resultado de fato de placeRegion), não no "shape" original.
    const shapeReal = region.shapes?.[0];
    if (alcanceMetros !== null && centroOrigem && shapeReal && typeof shapeReal.x === "number" && typeof shapeReal.y === "number") {
      const dx = shapeReal.x - centroOrigem.x;
      const dy = shapeReal.y - centroOrigem.y;
      const distanciaPixels = Math.sqrt(dx * dx + dy * dy);
      const escalaMetrosPorPixel = (canvas.scene?.grid?.distance || 1) / (canvas.grid?.size || 100);
      const distanciaMetros = Math.round(distanciaPixels * escalaMetrosPorPixel);
      if (distanciaMetros > alcanceMetros) {
        await region.delete().catch(() => {});
        ui.notifications.warn(`"${item.name}" está fora de alcance! O centro da área ficou a ${distanciaMetros}m, mas o alcance é de ${alcanceMetros}m.`);
        return null;
      }
    }

    // Guarda de onde esta Região veio (o item) em TODA Região criada, não
    // só as com Template Persistente - é o que permite sincronizar a cor
    // da Região automaticamente se o jogador mudar "templateCor" (ou
    // "emanacaoCor") na ficha DEPOIS de colocar a área no mapa (ver
    // Hooks.on("updateItem",...) mais abaixo, seção "sincronizar cor de
    // Região colocada"). Sem isso, a única forma de ver a cor nova era
    // apagar a área e usar a Ação de novo. Não guarda qual ação
    // especificamente (o método só recebe "acao" pronto, sem índice) -
    // se o item tiver várias Ações com templateCor diferentes entre si,
    // a sincronização usa a 1ª que usar Template encontrada no item.
    await region.setFlag("nauren", "origemTemplate", { itemUuid: item.uuid, acaoNome: acao.nome || "", ehEmanacao: acao.templateTipo === "emanacao" });

    // Template Persistente: grava a configuração inteira como flag na
    // própria Região - cada instância colocada fica autocontida (não
    // depende de nenhuma lista externa pra saber seu efeito/duração), o
    // que permite várias armadilhas/áreas da MESMA Ação ativas ao mesmo
    // tempo sem conflito entre si (ex: até 4 Armadilhas de Caça
    // simultâneas). Ver naurenProcessarTemplatesPersistentes.
    if (acao.usaTemplatePersistente) {
      const tokenFonte = item.actor?.getActiveTokens?.(true)?.[0] ?? null;
      const duracao = parseInt(acao.templatePersistenteDuracaoRodadas, 10) || 0;
      // Bug real corrigido: "Duração: X rodadas" decrementava 1x a cada
      // FIM DE RODADA DO CALENDÁRIO, travado a essa fronteira fixa -
      // conjurar tarde numa rodada (ex: no seu turno, sendo o último a
      // agir) deixava a área durar só uma fração de rodada de verdade
      // (acabava já no início da rodada seguinte, sem dar a volta
      // completa no ciclo de turnos). Agora guarda qual COMBATENTE
      // estava com o turno no exato momento de conjurar (não
      // necessariamente quem conjurou - lançar via Prioridade no turno
      // de um aliado usa o turno DELE como referência) e a duração passa
      // a significar "até esse MESMO combatente voltar ao início do
      // turno dele, X vezes" - sempre uma volta completa e justa,
      // imune a quantos combatentes entram/saem da iniciativa nesse
      // meio tempo (ver naurenProcessarTemplatesPersistentes). Sem
      // combate ativo no momento de conjurar, cai de volta no modelo
      // antigo (calendário) - não tem "turno de referência" pra usar.
      const combatanteReferencia = game.combat?.combatant ?? null;
      // Arsenal de Armadilhas: escolher o efeito extra desta armadilha.
      if (acao.templatePersistenteAoEntrar && (item?.actor ?? item?.parent)?.items?.some(i => i.type === "habilidade" && naurenEhItem(i, "Arsenal de Armadilhas") && i.system.ativo !== false)) {
        const packCond = game.packs.find(pk => pk.metadata.label === "Nauren - Condições e Venenos");
        const escolhaArsenal = await foundry.applications.api.DialogV2.wait({
          window: { title: "Arsenal de Armadilhas" },
          content: "<p>Que efeito extra esta armadilha tem ao ser ativada?</p>",
          buttons: [{ action: "condicao-queimando", label: "Explosiva (Queimando 1)" }, { action: "condicao-fragmentado", label: "Destrutiva (Fragmentado 1)" }, { action: "nenhum", label: "Nenhum" }],
          rejectClose: false
        }).catch(() => "nenhum");
        if (escolhaArsenal && escolhaArsenal !== "nenhum") acao = { ...acao, _condicaoExtraArmadilha: await naurenUuidPorSeed(packCond, escolhaArsenal) };
      }
      // Camuflagem: a armadilha fica visível só para o Mestre.
      await region.setFlag("nauren", "templatePersistente", {
        origemItemUuid: item.uuid,
        origemAtorUuid: item.actor?.uuid ?? "",
        disposicaoOrigem: tokenFonte?.document.disposition ?? CONST.TOKEN_DISPOSITIONS?.NEUTRAL ?? 0,
        duracaoRodadas: duracao,
        duracaoRestante: duracao,
        duracaoCombatanteReferenciaId: combatanteReferencia?.id ?? null,
        duracaoVoltasRestantes: duracao,
        duracaoRodadasCalendario: duracao * 3 + 3,
        eventoPeriodico: acao.templatePersistenteEventoPeriodico || "",
        aplicarAoCriar: !!acao.templatePersistenteAplicarAoCriar,
        aoEntrar: !!acao.templatePersistenteAoEntrar,
        disposicao: acao.templatePersistenteDisposicao || "inimigos",
        efeitoPessoal: !!acao.templatePersistenteEfeitoPessoal,
        efeito: acao.templatePersistenteEfeito || "",
        quantidade: acao.templatePersistenteQuantidade || "1",
        condicaoUuid: acao.templatePersistenteCondicaoUuid || "",
        condicaoAcumulos: acao.templatePersistenteCondicaoAcumulos || "1",
        modificadorExtra: acao.templatePersistenteModificadorExtraResolvido || 0,
        sustentadoRecurso: acao.templatePersistenteSustentadoRecurso || "",
        sustentadoQuantidade: acao.templatePersistenteSustentadoQuantidade || "1",
        sustentarPorRodada: !!acao.templatePersistenteSustentarPorRodada,
        // Conjuração Poderosa com efeito fixo "sustentar sem custo" (ver
        // campoAcao > condensarSustentarSemCusto, ex: Chuva de Estrelas
        // - "1 rodada sem pagar sustentação") - conta quantas próximas
        // verificações de Sustentar pulam direto (sem perguntar/gastar
        // recurso), decrementando 1 por rodada em naurenProcessarTemplatesPersistentes.
        rodadasGratisRestantes: (acao.condensarSustentarSemCustoAtivo ? 1 : 0) + Math.max(0, Math.round(Number(naurenInterpretarModificador(String(acao.templatePersistenteRodadasGratis || "0"), item.actor, item)?.valor) || 0)),
        regeneraRecurso: acao.templatePersistenteRegeneraRecurso || "",
        regeneraQuantidade: acao.templatePersistenteRegeneraQuantidade || "1",
        overrideFormulaCondicao: acao.templatePersistenteOverrideFormulaCondicao || "",
        buffConjuracaoDado: acao.templatePersistenteBuffConjuracaoDado || "",
        buffConjuracaoFacilidade: !!acao.templatePersistenteBuffConjuracaoFacilidade,
        condicaoPresencaUuid: acao.templatePersistenteCondicaoPresencaUuid || "",
        removerAoAtivar: !!acao.templatePersistenteRemoverAoAtivar,
        puxarAoCentro: !!acao.templatePersistentePuxarAoCentro,
        ignorarConjurador: !!acao.templatePersistenteIgnorarConjurador,
        cargasEstamina: Number(acao._cargasEstaminaResolvidas) || 0,
        resistirEstamina: acao.templatePersistenteResistirEstamina || "",
        empurrarAleatorio: acao.templatePersistenteEmpurrarAleatorio || "",
        centro: (() => { const sh = region.shapes?.[0]; return sh && Number.isFinite(sh.x) ? { x: sh.x, y: sh.y } : null; })(),
        condicaoExtraUuid: acao._condicaoExtraArmadilha || ""
      });
      // Número Máximo de Áreas Simultâneas (ver campoAcao >
      // templatePersistenteLimiteSimultaneas) - checa e apaga a mais
      // antiga da MESMA Ação, se precisar, ANTES de "Aplicar ao Criar"
      // (que é sobre a área NOVA, não a antiga que pode ser removida).
      await this._limitarRegioesSimultaneas(item, acao, region);
      // Aplicar ao Criar (ver templatePersistenteAplicarAoCriar acima) -
      // mesmo filtro de disposição que naurenProcessarTemplatesPersistentes
      // usa depois, pra quem já está dentro receber o efeito JÁ NESTE
      // instante, não só no próximo "eventoPeriodico".
      // Sem efeito periódico também vale (ex.: Singularidade só puxa e deixa Caído ao criar).
      if (acao.templatePersistenteAplicarAoCriar && (acao.templatePersistenteEventoPeriodico || acao.templatePersistenteCondicaoUuid || acao.templatePersistentePuxarAoCentro)) {
        // Roda no Mestre (o jogador não tem permissão nos monstros); um card só para a área inteira.
        const gmA = game.users.activeGM;
        if (game.user.isGM || !gmA) await naurenHandleQueryAreaAoCriar({ regionUuid: region.uuid, icone: item.img });
        else await gmA.query(NAUREN_QUERY_AREA_AO_CRIAR, { regionUuid: region.uuid, icone: item.img }, { timeout: 60000 }).catch(err => console.warn("Nauren RPG | área ao criar", err));
      }
      // Condição de Presença (ver templatePersistenteCondicaoPresencaUuid) -
      // SEMPRE checa quem já está dentro no instante de criar, mesmo
      // sem "Aplicar ao Criar" marcado (que é sobre o Efeito Periódico
      // acima, um mecanismo diferente) - a Presença não tem "próximo
      // tick" pra esperar, é sempre imediata.
      if (acao.templatePersistenteCondicaoPresencaUuid) {
        const configAtual = foundry.utils.deepClone(region.getFlag("nauren", "templatePersistente"));
        for (const tokenDoc of this._tokensNaRegiao(region)) {
          if (!tokenDoc.actor || !naurenTokenElegivelPorDisposicao(tokenDoc, configAtual)) continue;
          await naurenAtualizarCondicaoPresenca(tokenDoc.actor, region.id, configAtual.condicaoPresencaUuid, true);
        }
      }
    }

    const tokens = this._tokensNaRegiao(region);
    return { region, tokens };
  }

  /**
   * Número Máximo de Áreas Simultâneas (ver campoAcao >
   * templatePersistenteLimiteSimultaneas) - conta quantas outras
   * regiões da CENA ATUAL já foram criadas por esta MESMA Ação (mesmo
   * item + mesmo nome de Ação, ver "origemTemplate.acaoNome") e, se
   * colocar "regiaoNova" ultrapassar o limite (que aceita "@rank" -
   * ex: Armadilha de Caça, "1 no rank 1, subindo pra 4 no rank 4"),
   * apaga a(s) mais ANTIGA(s) automaticamente (por ordem real de
   * criação, "_stats.createdTime") até sobrar só o limite. Sem
   * "templatePersistenteLimiteSimultaneas" preenchido, não faz nada -
   * várias áreas da mesma Ação continuam coexistindo livremente, como
   * sempre foi.
   */
  static async _limitarRegioesSimultaneas(item, acao, regiaoNova) {
    if (!acao.templatePersistenteLimiteSimultaneas) return;
    if (!canvas?.scene) return;
    const modLimite = naurenInterpretarModificador(acao.templatePersistenteLimiteSimultaneas, item.actor, item);
    const limite = Math.max(1, Math.round(modLimite?.valor ?? 1));
    const outrasDaMesmaAcao = (canvas.scene.regions ?? [])
      .filter(r => {
        if (r.id === regiaoNova.id) return false;
        const origem = r.getFlag("nauren", "origemTemplate");
        return origem?.itemUuid === item.uuid && (origem?.acaoNome || "") === (acao.nome || "");
      })
      .sort((a, b) => (a._stats?.createdTime ?? 0) - (b._stats?.createdTime ?? 0));
    // "+1" pra contar a região nova (já colocada no mapa nesse ponto,
    // mas ainda não faz parte de "outrasDaMesmaAcao" por causa do
    // filtro "r.id === regiaoNova.id" acima) - queremos no máximo
    // "limite" no total, dela incluída.
    // Armadilhas que prenderam alguém continuam ativas e ocupam vaga.
    const presos = acao.templatePersistenteRemoverAoAtivar ? naurenPresosPorArmadilha(item.uuid).length : 0;
    const excedentes = outrasDaMesmaAcao.length + 1 + presos - limite;
    if (excedentes <= 0) return;
    const paraRemover = outrasDaMesmaAcao.slice(0, excedentes);
    for (const r of paraRemover) await r.delete();
    if (paraRemover.length) {
      ui.notifications.info(`"${regiaoNova.name}": limite de ${limite} simultânea(s) - a mais antiga foi removida.`);
    }
  }

  /**
   * Cria a região visual de uma Emanação AUTOMATICAMENTE (sem
   * posicionamento interativo - aparece já centrada no token de quem
   * ativou), guardando o vínculo numa flag do item pra poder reposicionar
   * (ver Hooks.on("updateToken",...) mais abaixo) e remover depois. Não
   * usa "attachToToken" do placeRegion (isso é específico do fluxo
   * INTERATIVO de posicionamento) - persegue o token com um hook próprio,
   * mais previsível de reproduzir sem depender de comportamento exclusivo
   * de uma ferramenta pensada pra ser usada com o mouse.
   */
  /**
   * Cria a área visual da Emanação pra CADA token ativo deste Ator (não só
   * o primeiro encontrado) - essencial quando o mesmo Ator tem mais de um
   * token na mesa (Ator vinculado usado em várias cópias, ou um token
   * duplicado por copiar/colar) - senão a Região sempre grudava só no
   * token que por acaso vinha primeiro na lista do Foundry, que nem é
   * garantido ficar na mesma ordem entre uma chamada e outra (esse era o
   * motivo de, ao desativar e reativar a Emanação, ela parecer "pular"
   * entre o token original e a cópia). Rastreia UMA entrada por token na
   * flag "emanacaoRegioes" (array), em vez de um único ID como antes.
   */
  /**
   * Procura em TODAS as cenas do mundo (não só a atual) as Regiões que
   * pertencem a este item de Emanação - opcionalmente só as de UM token
   * específico. Isso é a fonte de verdade agora, no lugar da flag
   * "emanacaoRegioes" guardada NO ITEM: descobrimos (com o diagnóstico
   * anterior) que a flag do item é COMPARTILHADA entre um token e sua
   * cópia até que algum campo divirja de verdade entre os dois (uma
   * limitação do ActorDelta do Foundry) - fazia "desativar na cópia"
   * remover a região dos DOIS, já que os dois liam a MESMA lista. A
   * Região em si, por ser um documento de CENA (não de Ator), é sempre
   * genuinamente independente por token - por isso ela é a fonte
   * confiável, e cada Região carrega sua própria flag "emanacaoOrigem"
   * (itemUuid + tokenId) dizendo de onde veio.
   */
  static buscarRegioesDoItem(itemUuid, tokenId = null) {
    const encontradas = [];
    for (const cena of game.scenes) {
      for (const regiao of cena.regions) {
        const origem = regiao.getFlag("nauren", "emanacaoOrigem");
        if (!origem || origem.itemUuid !== itemUuid) continue;
        if (tokenId && origem.tokenId !== tokenId) continue;
        encontradas.push(regiao);
      }
    }
    return encontradas;
  }

  static async criarRegiaoEmanacao(item) {
    if (!canvas?.ready) return;
    const actor = item.actor;
    const tokensAtivos = actor?.getActiveTokens?.(true) ?? [];
    if (!tokensAtivos.length) {
      console.log(`Nauren RPG | Emanação de "${item.name}" ativada, mas "${actor?.name}" não tem token em nenhuma cena aberta - sem área visual até ter um.`);
      return;
    }

    for (const tokenPlaceable of tokensAtivos) {
      const tokenDoc = tokenPlaceable.document;
      // Já existe Região desta Emanação PRA ESTE TOKEN especificamente?
      // (busca nas Regiões de verdade, não na flag do item - ver comentário acima).
      if (this.buscarRegioesDoItem(item.uuid, tokenDoc.id).length) continue;
      const cena = tokenDoc.parent;
      if (!cena) continue;

      const raioOverride = naurenResolverPorRank(item.system.emanacaoRaioPorRank, item.system.rankAtual ?? 0, "valor");
      // 0.94.16: o raio conta a partir da BORDA do token (como a régua e a regra), então o círculo
      // visto do centro soma meio token - antes a área desenhada ficava menor que a de verdade.
      const meioToken = Math.max(tokenPlaceable.w ?? 0, tokenPlaceable.h ?? 0) / 2;
      const raioPx = this.metrosParaPixels(parseFloat(raioOverride ?? item.system.emanacaoRaio) || 3) + meioToken;
      const centro = tokenPlaceable.center ?? { x: tokenDoc.x, y: tokenDoc.y };
      const shape = { type: "circle", x: centro.x, y: centro.y, radius: raioPx };
      const opcoes = {
        name: `${item.name} (Emanação)`,
        shapes: [shape],
        color: item.system.emanacaoCor || game.user.color?.css || "#a15c2e",
        visibility: item.system.emanacaoInvisivel
          ? (CONST.REGION_VISIBILITY?.LAYER ?? 1)
          : (CONST.REGION_VISIBILITY?.ALWAYS ?? 2),
        // Mesma melhoria visual da Ação normal (ver colocarArea) -
        // "Covered Grid Spaces" + "Display Measurements" ativado.
        highlightMode: "coverage", displayMeasurements: true
      };

      let regiao;
      try {
        [regiao] = await cena.createEmbeddedDocuments("Region", [opcoes]);
      } catch (errVisibilidade) {
        console.warn(`Nauren RPG | createEmbeddedDocuments recusou "visibility", tentando sem ele.`, errVisibilidade);
        delete opcoes.visibility;
        try {
          [regiao] = await cena.createEmbeddedDocuments("Region", [opcoes]);
        } catch (err) {
          console.warn(`Nauren RPG | Falha ao criar a área visual da Emanação de "${item.name}" pro token "${tokenDoc.name}".`, err);
          continue;
        }
      }
      if (regiao) {
        // A flag fica NA REGIÃO (documento de cena, sempre independente),
        // não mais no item.
        await regiao.setFlag("nauren", "emanacaoOrigem", { itemUuid: item.uuid, tokenId: tokenDoc.id });
        console.log(`Nauren RPG | Área visual da Emanação de "${item.name}" criada na cena "${cena.name}" pro token "${tokenDoc.name}".`);
      }
    }
  }

  /**
   * Remove a(s) Região(ões) visual(is) desta Emanação - só a de UM token
   * específico se "tokenId" for informado, senão todas (usado quando o
   * próprio item some, ex: apagado). Busca direto nas Regiões de
   * qualquer cena (ver "buscarRegioesDoItem") em vez de confiar na flag
   * do item.
   */
  static async removerRegiaoEmanacao(item, tokenId = null) {
    const regioes = this.buscarRegioesDoItem(item.uuid, tokenId);
    for (const regiao of regioes) {
      try {
        await regiao.delete();
      } catch (err) {
        console.warn(`Nauren RPG | Falha ao remover uma área visual da Emanação de "${item.name}".`, err);
      }
    }
    // Flags antigas (versões anteriores desta feature, guardadas NO
    // ITEM) - limpa também, caso ainda existam de antes desta correção.
    if (!tokenId) {
      await item.unsetFlag("nauren", "emanacaoRegioes").catch(() => {});
      await item.unsetFlag("nauren", "emanacaoRegiaoId").catch(() => {});
      await item.unsetFlag("nauren", "emanacaoTokenId").catch(() => {});
      await item.unsetFlag("nauren", "emanacaoCenaId").catch(() => {});
    }
  }

  /**
   * Sincroniza a área VISUALMENTE com a posição atual do token, quadro a
   * quadro (chamado pelo Hooks.on("refreshToken",...) - dispara em TODO
   * redesenho do token, inclusive durante a própria animação de
   * movimento dele). Só mexe na representação LOCAL (updateSource +
   * refresh do objeto), nunca grava no banco aqui - fazer isso a cada
   * quadro seria caríssimo e desnecessário. Como acompanha a posição
   * REAL do token a cada quadro (em vez de uma duração de animação
   * adivinhada), a área sempre anda na mesma velocidade e no mesmo
   * instante que o token, não importa a velocidade configurada.
   */
  static sincronizarVisualComToken(item, tokenDoc, tokenPlaceable) {
    const [regiao] = this.buscarRegioesDoItem(item.uuid, tokenDoc.id);
    if (!regiao?.object?.refresh) return;
    const centro = tokenPlaceable.center;
    if (!centro) return;
    const raioAtual = regiao.shapes?.[0]?.radius ?? this.metrosParaPixels(parseFloat(item.system.emanacaoRaio) || 3);
    try {
      regiao.updateSource({ shapes: [{ type: "circle", x: centro.x, y: centro.y, radius: raioAtual }] });
      regiao.object.refresh();
    } catch (err) {
      // Silencioso de propósito - "refreshToken" dispara em TODO quadro do
      // token (dezenas de vezes por movimento), um aviso aqui spamaria o
      // console sem ajudar em nada. Erros reais de posição continuam
      // aparecendo via persistirPosicaoRegiao, que sim registra no console.
    }
  }

  /**
   * Persiste de verdade a posição final da área (chamado pelo
   * Hooks.on("updateToken",...) quando o dado do token muda). "novoCentro"
   * já vem calculado a partir de "changes" (não de tokenDoc.object, que
   * fica atrasado). Reconstrói o shape do ZERO (mesmo formato usado na
   * criação), em vez de clonar "regiao.shapes" - esse getter devolve
   * instâncias já processadas pelo Foundry (com métodos como testPoint),
   * não dados simples, e mandar isso de volta num update() pode falhar
   * silenciosamente ou ser rejeitado pela validação do schema.
   */
  static async persistirPosicaoRegiao(item, tokenDoc, novoCentro) {
    const [regiao] = this.buscarRegioesDoItem(item.uuid, tokenDoc.id);
    if (!regiao) {
      console.log(`Nauren RPG | Emanação de "${item.name}": sem região rastreada pro token "${tokenDoc.name}", nada pra mover.`);
      return;
    }
    if (!novoCentro) return;
    const raioAtual = regiao.shapes?.[0]?.radius ?? this.metrosParaPixels(parseFloat(item.system.emanacaoRaio) || 3);
    const novoShape = { type: "circle", x: novoCentro.x, y: novoCentro.y, radius: raioAtual };
    try {
      await regiao.update({ shapes: [novoShape] });
      console.log(`Nauren RPG | Área visual da Emanação de "${item.name}" movida pra (${Math.round(novoCentro.x)}, ${Math.round(novoCentro.y)}).`);
    } catch (err) {
      console.warn(`Nauren RPG | Falha ao mover a área visual da Emanação de "${item.name}".`, err);
    }
  }
}

/**
 * ============================================================
 * ALVOS + APLICAÇÃO AUTOMÁTICA (dano, cura, condições)
 * ============================================================
 * O problema central: quem executa a Ação (ex: um jogador) normalmente NÃO
 * tem permissão pra editar o ator do alvo (ex: um NPC do GM), e o popup de
 * defesa (Bloquear/Esquivar/Estresse) precisa aparecer na tela de quem
 * CONTROLA o alvo, não na do atacante. A solução oficial do V13/V14 é a API
 * de Queries (CONFIG.queries + User#query): o cliente do atacante envia o
 * "pacote" pro cliente certo, que decide/aplica LOCALMENTE (com as
 * permissões dele) e devolve um resumo pro card de chat.
 */
class NaurenAlvoHelper {
  static QUERY_NOME = "nauren.aplicarNoAlvo";

  /** Registrado em CONFIG.queries no init - roda no cliente que RECEBE o pedido. */
  static async handleQuery(dados) {
    return NaurenAlvoHelper.processarPacoteLocalmente(dados);
  }

  /**
   * Bônus Condicional ao Alvo (ver NaurenHabilidadeData >
   * bonusCondicionalAoAlvo), mas pro caso INVERTIDO: em vez de "eu
   * atacando um alvo com Condição X" (ver
   * NaurenActorSheet#_resolverBonusCondicionalAoAlvo), aqui é "alguém
   * com Condição X me atacando" - ex: Reflexos de Caça (Caçador),
   * "+1/+6 em Bloqueio e Esquiva contra ataques desse alvo
   * especificamente" (o alvo que EU marquei, não qualquer um marcado
   * por outro Caçador na mesa). "campo" é "bloqueio" ou "esquiva".
   * Verifica também "conjuradorUuid" da Condição no atacante - só conta
   * se fui EU (este "actor" defendendo, via seu próprio token) quem
   * aplicou aquela Condição nele, não qualquer marca de qualquer
   * origem.
   */
  /** Texto das fontes do último bônus de defesa calculado (ex.: "Reflexos de Caça +1"). */
  static _fontesDefesaTexto(actor, campo) {
    const f = (NaurenAlvoHelper._fontesDefesa ?? {})[`${actor?.uuid}|${campo}`] ?? [];
    return f.length ? f.map(x => `${x.nome} ${x.valor >= 0 ? "+" : ""}${x.valor}`).join(", ") : "";
  }
  static async _bonusDefesaContraAtacante(actor, atacanteTokenUuid, campo) {
    NaurenAlvoHelper._fontesDefesa ??= {};
    const fontes = [];
    NaurenAlvoHelper._fontesDefesa[`${actor?.uuid}|${campo}`] = fontes;
    if (!atacanteTokenUuid) return 0;
    const atacanteToken = await fromUuid(atacanteTokenUuid).catch(() => null);
    const atacanteActor = atacanteToken?.actor;
    if (!atacanteActor) return 0;
    // Estudos defensivos: +X na esquiva contra quem eu estudei.
    let bonusEstudo = 0;
    if (campo === "esquiva") {
      const marca = naurenEstudoNoAlvo(atacanteActor, actor);
      const dadosMarcaE = marca?.getFlag("nauren", "estudo") ?? {};
      const tiposMarca = dadosMarcaE.tipos ?? {};
      for (const t of naurenTiposEstudoDoAtor(actor)) {
        if (t.tipo.esquivaContra && (tiposMarca[t.chave]?.acumulos ?? 0) > 0) {
          const vE = naurenValorEstudo(t, tiposMarca[t.chave].acumulos, dadosMarcaE.informacoes ?? 0);
          if (!vE) continue;
          bonusEstudo += vE;
          fontes.push({ nome: t.tipo.porAnalisado ? `${t.tipo.nome} (Analisado ×${dadosMarcaE.informacoes ?? 0})` : `Estudo (${t.tipo.nome})`, valor: vE });
        }
      }
    }
    // Eu estou acima (Análise Paciente criativa): Esquiva/Bloqueio só contra o alvo analisado.
    if (campo === "esquiva" || campo === "bloqueio") {
      const ac = naurenBonusAcimaContra(actor, atacanteActor, campo);
      if (ac.total) { bonusEstudo += ac.total; for (const f of ac.fontes) fontes.push({ nome: f.nome, valor: f.valor }); }
    }
    // Marca do Caçador com Reflexos de Caça: + rank contra o alvo que VOCÊ marcou.
    const marcaCac = atacanteActor.items.find(i => i.type === "condicao" && i.getFlag("nauren", "beneficioMarca") === "reflexos" && (() => {
      try { const d = fromUuidSync(i.system.conjuradorUuid); return (d?.actor ?? d)?.uuid === actor.uuid; } catch (err) { return false; }
    })());
    if (marcaCac) {
      const habM = actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Marca do Caçador"));
      const vM = Math.max(1, habM?.system?.rankAtual || 1);
      bonusEstudo += vM;
      fontes.push({ nome: "Reflexos de Caça", valor: vM });
    }
    const entradas = (actor.system.bonusCondicionalAoAlvoTotal ?? []).filter(b => b.campo === campo);
    if (!entradas.length) return bonusEstudo;
    const meuTokenUuid = actor.getActiveTokens?.(true)?.[0]?.document?.uuid ?? null;
    let total = 0;
    for (const b of entradas) {
      const condicaoNoAtacante = atacanteActor.items.find(i =>
        i.type === "condicao" && i.system.ativo && i.getFlag("nauren", "origemUuid") === b.condicaoUuid
      );
      if (!condicaoNoAtacante) continue;
      if (meuTokenUuid && condicaoNoAtacante.system.conjuradorUuid && condicaoNoAtacante.system.conjuradorUuid !== meuTokenUuid) continue;
      const acumulos = condicaoNoAtacante.system.acumulativel ? (condicaoNoAtacante.system.acumulos ?? 1) : 1;
      const vC = b.porAcumulo ? b.valor * acumulos : b.valor;
      total += vC;
      fontes.push({ nome: b.origemNome || condicaoNoAtacante.name, valor: vC });
    }
    return total + bonusEstudo;
  }

  /**
   * Decide qual usuário ATIVO deve processar a aplicação num ator:
   * o dono jogador (se online), senão um GM online, senão null.
   */
  /**
   * Quem pode processar o que acontece com este ator, em ordem de preferência:
   * 1) jogadores donos online; 2) eu, se sou Mestre (estou aqui e respondo na hora);
   * 3) o Mestre que conduz o combate; 4) os outros Mestres online.
   * Uma tela "conectada" pode estar parada (aba esquecida, celular com a tela apagada):
   * por isso os caminhos que mandam a pergunta testam antes se ela responde (ver usuarioResponde).
   */
  static candidatosExecutor(actor) {
    const ativos = game.users.filter(u => u.active);
    const lista = ativos.filter(u => !u.isGM && actor?.testUserPermission?.(u, "OWNER")).sort((a, b) => a.id.localeCompare(b.id));
    if (game.user.isGM) lista.push(game.user);
    const mesa = naurenMestreDaMesa();
    if (mesa) lista.push(mesa);
    lista.push(...ativos.filter(u => u.isGM).sort((a, b) => a.id.localeCompare(b.id)));
    return [...new Set(lista)];
  }

  static usuarioExecutor(actor) {
    const lista = this.candidatosExecutor(actor);
    return lista.find(u => !this.naoResponde(u)) ?? lista[0] ?? null;
  }

  /** Igual a usuarioExecutor, mas confirma que a tela da pessoa responde antes de escolher. */
  static async usuarioExecutorVerificado(actor) {
    for (const u of this.candidatosExecutor(actor)) if (await this.usuarioResponde(u)) return u;
    return null;
  }

  /** Espera um Mestre entrar no mundo (até "ms"), avisando na tela de quem está esperando. */
  static _esperandoMestre = new Set();
  static async _esperarMestre(actor, ms) {
    ui.notifications.warn(`Nenhum Mestre respondendo para aplicar em ${actor.name}. Esperando um Mestre entrar (até ${Math.round(ms / 1000)}s)...`);
    return new Promise(resolve => {
      let fim = null;
      const chegou = async (user) => {
        if (!(await this.usuarioResponde(user))) return;
        this._esperandoMestre.delete(chegou); clearTimeout(fim); resolve(user);
      };
      this._esperandoMestre.add(chegou);
      fim = setTimeout(() => { this._esperandoMestre.delete(chegou); resolve(null); }, ms);
    });
  }

  /* ---- A tela de um usuário responde? (aba esquecida ou travada conta como "online" no Foundry) ---- */
  static QUERY_PING = "nauren.ping";
  static handleQueryPing() { return { ok: true }; }
  static _respostaUsuario = new Map(); // userId -> { ok, ate }
  static naoResponde(u) {
    const c = u ? this._respostaUsuario.get(u.id) : null;
    return !!c && !c.ok && c.ate > Date.now();
  }
  static async usuarioResponde(u) {
    if (!u) return false;
    if (u.id === game.user.id) return true;
    if (!u.active || typeof u.query !== "function") return false;
    const c = this._respostaUsuario.get(u.id);
    if (c && c.ate > Date.now()) return c.ok;
    let ok = false;
    try {
      const r = await Promise.race([
        u.query(this.QUERY_PING, {}, { timeout: 2500 }),
        new Promise(res => setTimeout(() => res(null), 2600))
      ]);
      ok = !!r?.ok;
    } catch (err) { ok = false; }
    this._respostaUsuario.set(u.id, { ok, ate: Date.now() + (ok ? 20000 : 30000) });
    if (!ok) console.warn(`Nauren RPG | A tela de "${u.name}" está conectada mas não respondeu; as perguntas vão para outra pessoa.`);
    return ok;
  }

  /**
   * "Sustentar" um Template Persistente (ver naurenProcessarTemplatesPersistentes)
   * - popup de sim/não que precisa aparecer na tela do DONO do template
   * (não do Mestre, que é quem roda o processamento periódico). Mesmo
   * padrão de roteamento cross-cliente de "aplicarEmAlvo"/usuarioExecutor
   * acima, só que dedicado a essa pergunta específica (não um pacote de
   * dano/condições inteiro).
   */
  static QUERY_NOME_SUSTENTAR = "nauren.perguntarSustentarTemplate";

  /** Roda LOCALMENTE (já no cliente certo) - mostra o popup e devolve true (pagou) / false (não). */
  static async _perguntarSustentarLocal({ nomeRegiao, recurso, quantidade }) {
    let pagou = false;
    await foundry.applications.api.DialogV2.wait({
      window: { title: `${nomeRegiao} — Sustentar?` },
      content: `<p>Gastar <b>${quantidade} de ${naurenNomeDoRecurso(null, recurso)}</b> para manter "${nomeRegiao}" ativa por mais uma rodada?</p>`,
      buttons: [
        { label: `Gastar ${quantidade} e sustentar`, action: "sustentar", default: true, callback: () => { pagou = true; } },
        { label: "Não sustentar (a área acaba)", action: "nao" }
      ],
      rejectClose: false
    }).catch(() => null);
    return pagou;
  }

  /** Registrado em CONFIG.queries no init - roda no cliente que RECEBE o pedido (o dono do template). */
  static async handleQuerySustentar(dados) {
    return NaurenAlvoHelper._perguntarSustentarLocal(dados);
  }

  /**
   * Ponto de entrada do lado do Mestre (que roda o processamento
   * periódico): encaminha a pergunta pro cliente certo (dono do Ator que
   * criou o template) e devolve true/false. Sem ninguém online pra
   * responder, assume "sim, sustenta" (evita que a magia acabe sozinha
   * só porque o jogador está ausente no momento) - quem chama ainda
   * confere separadamente se o Ator TEM o recurso antes de descontar.
   */
  static async perguntarSustentar(actor, { nomeRegiao, recurso, quantidade }) {
    const executor = await this.usuarioExecutorVerificado(actor);
    if (!executor) return true;
    if (executor.id === game.user.id) {
      return this._perguntarSustentarLocal({ nomeRegiao, recurso, quantidade });
    }
    if (typeof executor.query !== "function") return true;
    try {
      return await executor.query(this.QUERY_NOME_SUSTENTAR, { nomeRegiao, recurso, quantidade }, { timeout: 60000 });
    } catch (err) {
      console.warn("Nauren RPG | Query de Sustentar falhou/expirou - assumindo que sim.", err);
      return true;
    }
  }

  /**
   * Ponto de entrada do lado do ATACANTE: encaminha o pacote pro cliente
   * certo (ou processa aqui mesmo, se este usuário já for o executor) e
   * devolve o resumo do que aconteceu com aquele alvo.
   */
  static async aplicarEmAlvo(tokenDoc, pacote) {
    const actor = tokenDoc?.actor;
    if (!actor) return { alvo: tokenDoc?.name ?? "?", acertou: null, linhas: ["sem ator"] };
    if (!actor.system?.vida) return { alvo: actor.name, acertou: null, linhas: ["ator de outro sistema - ignorado"] };

    const dados = { tokenUuid: tokenDoc.uuid, pacote };
    let executor = await this.usuarioExecutorVerificado(actor);

    if (!executor) {
      // Ninguém que responda pode aplicar (ex.: nenhum Mestre na sala): espera um Mestre entrar.
      executor = await this._esperarMestre(actor, 120000);
    }
    if (!executor) {
      this._cartaFallback(actor, pacote);
      return { alvo: actor.name, acertou: null, linhas: ["ninguém online pode aplicar - aviso deixado no chat"] };
    }
    if (executor.id === game.user.id) {
      return this.processarPacoteLocalmente(dados);
    }
    if (typeof executor.query !== "function") {
      this._cartaFallback(actor, pacote);
      return { alvo: actor.name, acertou: null, linhas: ["API de Query indisponível - aviso deixado no chat"] };
    }
    try {
      // 120s: tempo de sobra pro dono do alvo pensar no popup de defesa.
      return await executor.query(this.QUERY_NOME, dados, { timeout: 120000 });
    } catch (err) {
      console.warn("Nauren RPG | Query de aplicação falhou/expirou.", err);
      this._cartaFallback(actor, pacote);
      return { alvo: actor.name, acertou: null, linhas: ["sem resposta do dono do alvo - aviso deixado no chat"] };
    }
  }

  /**
   * QUERY separada pra atualizar um ator DIRETAMENTE, sem
   * passar pela reação de dano/popup - usado quando o efeito é
   * incondicional por regra (Deflexão "acerta independente da Defesa do
   * alvo"; Roubar Recurso). Mesma lógica de roteamento de
   * usuarioExecutor/aplicarEmAlvo, só que sem toda a complexidade de
   * dano/cura/condições - só um "utils.mergeObject" direto no ator certo,
   * processado por quem tiver permissão (dono jogador, senão GM).
   */
  static QUERY_NOME_DIRETO = "nauren.atualizarAtorDireto";

  static async handleQueryDireto({ actorUuid, dadosUpdate, opcoes }) {
    const actor = await fromUuid(actorUuid).catch(() => null);
    if (!actor) return false;
    await actor.update(dadosUpdate, opcoes ?? {});
    return true;
  }

  static async atualizarAtorSeguro(actor, dadosUpdate, opcoes = {}) {
    if (!actor) return false;
    const executor = await this.usuarioExecutorVerificado(actor);
    if (!executor) {
      console.warn(`Nauren RPG | Ninguém online pode atualizar "${actor.name}" com segurança.`);
      return false;
    }
    if (executor.id === game.user.id) {
      await actor.update(dadosUpdate, opcoes);
      return true;
    }
    if (typeof executor.query !== "function") return false;
    try {
      return await executor.query(this.QUERY_NOME_DIRETO, { actorUuid: actor.uuid, dadosUpdate, opcoes }, { timeout: 20000 });
    } catch (err) {
      console.warn(`Nauren RPG | Falha ao encaminhar atualização direta pra "${actor.name}".`, err);
      return false;
    }
  }

  /** Aviso de chat pro caso manual (query indisponível/sem resposta). */
  static _cartaFallback(actor, pacote) {
    const partes = [];
    if (pacote.dano) partes.push(`${pacote.dano} de dano`);
    if (pacote.cura) partes.push(`${pacote.cura} de cura`);
    if (pacote.condicoes?.length) partes.push(`${pacote.condicoes.length} condição(ões)`);
    ChatMessage.create({
      content: `<p><b>Aplicação manual necessária:</b> ${partes.join(", ") || "efeitos"} de "${pacote.nomeAcao}" em <b>${actor.name}</b>.</p>`
    });
  }

  /**
   * Processa o pacote NO CLIENTE EXECUTOR (dono do alvo ou GM): checa
   * acerto, monta e mostra UM ÚNICO popup combinado quando necessário -
   * reação ao dano (Bloquear/Esquivar/Estresse/Cheio) + chance de pagar um
   * custo pra evitar cada Condição/Gasto de Recurso que a Ação marcou como
   * "perguntarParaEvitar" - nunca dois popups seguidos. Aplica tudo com
   * base na escolha e devolve um resumo sanitizado. Tudo aqui roda com as
   * permissões de quem controla o alvo.
   *
   * IMPORTANTE (privacidade): o texto devolvido nunca expõe a Defesa, a
   * Agilidade ou a Vitalidade do alvo como valores rotulados - só o
   * resultado final de cada reação (ex: o total do Bloqueio, não seus
   * componentes). O atacante não precisa saber os atributos exatos do alvo
   * pra jogar; ele já vê o próprio ataque no card principal.
   */
  static async processarPacoteLocalmente({ tokenUuid, pacote }) {
    const tokenDoc = await fromUuid(tokenUuid);
    const actor = tokenDoc?.actor;
    const nomeAlvo = actor?.name ?? tokenDoc?.name ?? "?";
    try {
      return await this._processarPacoteLocalmenteInterno(tokenDoc, actor, pacote);
    } catch (err) {
      // Qualquer erro no meio da aplicação (fórmula inválida, popup que
      // falhou etc.) NÃO pode desaparecer em silêncio - melhor um aviso
      // visível no card do que o alvo simplesmente sumir do resumo.
      console.error(`Nauren RPG | Erro ao aplicar em "${nomeAlvo}":`, err);
      return { alvo: nomeAlvo, acertou: null, linhas: ["erro ao aplicar (veja o console F12)"] };
    }
  }

  /**
   * Monta as opções pro <select> "Remover" do popup (ver campoAcao >
   * penitenciaRemoverCondicaoOuEstresse) - uma entrada por Condição
   * ATIVA no alvo (usando o id do próprio item como valor, pra saber
   * exatamente qual remover depois) + Estresse, se o alvo tiver mais
   * de 0. Sem hardcoded de qual Condição é - lista o que o alvo
   * realmente tem agora. Vazio (nenhuma Condição, nem Estresse) =
   * array vazio, e o fieldset "Remover" nem aparece no popup.
   */
  /**
   * Remoção da penitência (escolha principal) e, depois, as remoções extras escolhidas na mesma
   * janela (ex.: Símbolo Sagrado), cada uma com a fonte no card. Uma escolha que já não vale
   * (Estresse zerado, Condição já removida) é pulada com aviso.
   */
  static async _aplicarRemocoes(actor, principal, extras, pEvento, linhas) {
    if (principal) await this._removerUmaCondicaoOuEstresse(actor, principal, linhas);
    const fonte = pEvento?.remocoesExtrasFonte ? ` (${pEvento.remocoesExtrasFonte})` : "";
    for (const escolha of extras ?? []) {
      if (!escolha) continue;
      const antes = linhas.length;
      if (escolha === "estresse" && !((actor.system.stress?.value ?? 0) > 0)) { linhas.push(`Remoção extra${fonte}: o Estresse já estava em 0`); continue; }
      if (escolha !== "estresse" && !actor.items.get(escolha)) { linhas.push(`Remoção extra${fonte}: a Condição já tinha saído`); continue; }
      await this._removerUmaCondicaoOuEstresse(actor, escolha, linhas);
      if (linhas.length > antes) linhas[linhas.length - 1] = `${linhas[linhas.length - 1]}${fonte ? ` — extra${fonte}` : " — extra"}`;
    }
  }

  /** Remove 1 acúmulo de uma Condição (id) ou 1 de Estresse ("estresse"). */
  static async _removerUmaCondicaoOuEstresse(actor, paraRemover, linhas) {
    if (paraRemover === "estresse") {
      const stressAtual = actor.system.stress?.value ?? 0;
      if (stressAtual > 0) { await actor.update({ "system.stress.value": stressAtual - 1 }); linhas.push("Removeu 1 ponto de Estresse"); }
      return;
    }
    const itemCondicao = actor.items.get(paraRemover);
    if (!itemCondicao) return;
    const acumulos = itemCondicao.system.acumulativel ? (itemCondicao.system.acumulos ?? 1) : 1;
    if (acumulos > 1) await itemCondicao.update({ "system.acumulos": acumulos - 1 });
    else await itemCondicao.delete();
    linhas.push(`Removeu 1 acúmulo de ${itemCondicao.name}`);
  }

  /**
   * Depois de aplicar uma cura (Fase 7, Sacerdote): Condição por cura
   * excedente (Costurar a Vida) e remoções extras da penitência (Símbolo
   * Sagrado), uma escolha por vez.
   */
  static async _posCura(actor, pEvento, curaFinal, linhas) {
    const chaveCena = game.combat?.id ?? "";
    const jaUsou = chaveCena && (actor.getFlag("nauren", "curaExcedenteNaCena") ?? {})[String(pEvento.curaExcedenteCondicaoUuid).replace(/\./g, "_")] === chaveCena;
    if (pEvento.curaExcedenteCondicaoUuid && (pEvento.cura ?? 0) > curaFinal && jaUsou) linhas.push("Cura excedente: já marcado uma vez neste combate");
    if (pEvento.curaExcedenteCondicaoUuid && (pEvento.cura ?? 0) > curaFinal && !jaUsou) {
      if (chaveCena) await actor.setFlag("nauren", "curaExcedenteNaCena", { ...(actor.getFlag("nauren", "curaExcedenteNaCena") ?? {}), [String(pEvento.curaExcedenteCondicaoUuid).replace(/\./g, "_")]: chaveCena }).catch(() => {});
      const nome = await this.aplicarCondicao(actor, pEvento.curaExcedenteCondicaoUuid, 1, null, 0, 0, "", "1", "", pEvento.atacanteTokenUuid ?? "").catch(() => null);
      if (nome) linhas.push(`Cura excedente (${(pEvento.cura ?? 0) - curaFinal}): recebeu ${nome}`);
    }
    for (let n = 0; n < (pEvento.remocoesExtras ?? 0); n++) {
      const opcoes = this._montarOpcoesRemoverCondicaoOuEstresse(actor);
      if (!opcoes.length) break;
      const escolha = await foundry.applications.api.DialogV2.wait({
        window: { title: `${actor.name} — remoção extra (${n + 1}/${pEvento.remocoesExtras})` },
        content: "<p>A penitência permite remover mais uma Condição ou 1 de Estresse:</p>",
        buttons: [...opcoes.map(o => ({ action: o.valor, label: o.label })), { action: "nenhuma", label: "Nenhuma" }],
        rejectClose: false
      }).catch(() => "");
      if (!escolha || escolha === "nenhuma") break;
      await this._removerUmaCondicaoOuEstresse(actor, escolha, linhas);
    }
  }

  static _montarOpcoesRemoverCondicaoOuEstresse(actor) {
    // Só Condições negativas: tirar um bônus (ex.: Fortitudo) não é remover uma aflição.
    const opcoes = actor.items
      .filter(i => i.type === "condicao" && i.system.ativo && naurenCondicaoNegativa(i))
      .map(i => {
        const acumulos = i.system.acumulativel ? (i.system.acumulos ?? 1) : 1;
        return { valor: i.id, label: acumulos > 1 ? `${i.name} (1 de ${acumulos} acúmulos)` : i.name };
      });
    const stressAtual = actor.system.stress?.value ?? 0;
    if (stressAtual > 0) opcoes.push({ valor: "estresse", label: `Estresse (${stressAtual} atual)` });
    return opcoes;
  }

  /**
   * Resolve UM evento de Cura, com popup de reação (ver
   * _resolverUmEventoDeAtaque abaixo - mesmo espírito, mas bem mais
   * simples: Cura não tem Bloqueio/Esquiva/Contra-Ataque, só aceitar
   * ou recusar). Bug real corrigido: Cura nunca passava por NENHUM
   * popup - era sempre aplicada cheia e direto, sem o alvo poder
   * reagir (diferente de Dano, que já tinha seu próprio ciclo).
   * "opcoesRemover" (ver _montarOpcoesRemoverCondicaoOuEstresse acima)
   * só é oferecida se a Ação que causou a cura tiver
   * "penitenciaRemoverCondicaoOuEstresse" - remove 1 acúmulo da
   * Condição escolhida (ou o item inteiro, se não for acumulável ou
   * já estiver no último acúmulo) ou 1 ponto de Estresse.
   */
  static async _resolverUmEventoDeCura(tokenDoc, actor, pEvento, opcoesRemover = []) {
    const linhas = [];
    const popupLigado = !!actor.system.popupDefesaAoTomarDano;
    let curaAceita = true;
    let paraRemover = "";
    let extrasEscolhidos = null;
    if (popupLigado || opcoesRemover.length) {
      const resultado = await this._popupReacao(actor, pEvento, { mostrarReacaoDano: false, itensEvitaveis: [], mostrarReacaoCura: popupLigado, opcoesRemover });
      if (popupLigado) curaAceita = resultado.reacaoCura !== "recusar";
      paraRemover = resultado.removerCondicaoOuEstresse || "";
      if (Array.isArray(resultado.removerExtras) && resultado.removerExtras.length) extrasEscolhidos = resultado.removerExtras;
    }

    let curaFinal = 0;
    if (curaAceita) {
      const vidaAtual = actor.system.vida.value;
      const max = actor.system.vida.max;
      const ajuste = this.ajustarCuraRecebida(actor, pEvento.cura);
      curaFinal = Math.min(max, vidaAtual + ajuste.cura) - vidaAtual;
      if (curaFinal > 0) await actor.update({ "system.vida.value": vidaAtual + curaFinal }, { naurenOrigemCombate: true });
      linhas.push(`+${curaFinal} PV${ajuste.cortada ? ` (cura reduzida −${ajuste.cortada}: ${ajuste.fontes?.join(", ") || "Condição"})` : ""}`);
    } else {
      linhas.push("Recusou a cura");
    }
    // Remoções extras já escolhidas na janela: não abre a janela separada depois.
    if (curaAceita) await this._posCura(actor, extrasEscolhidos ? { ...pEvento, remocoesExtras: 0 } : pEvento, curaFinal, linhas);
    await this._aplicarRemocoes(actor, paraRemover, extrasEscolhidos, pEvento, linhas);

    if (curaFinal > 0) naurenProcessarGatilhos("euCurei", actor).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (eu curei).", err));

    return { curaFinal, linhas, curaAceita };
  }

  /**
   * Resolve o CICLO COMPLETO de reação a UM evento de ataque específico
   * (popup de Bloquear/Esquivar/Contra-Atacar/Estresse/Cheio, aplicação
   * do dano, Contra-Ataque/Deflexão devolvendo dano ao atacante original,
   * e os Gatilhos de "sofri dano") - extraído pra ser chamado MAIS DE UMA
   * VEZ (ver "eventosDeAtaque" em "_processarPacoteLocalmenteInterno":
   * Múltiplos Ataques, ex: Mísseis Arcanos, dá 1 popup de reação PRÓPRIO
   * pra cada projétil que acertar, não um dano combinado numa reação só).
   * "pEvento" já vem com dano/ataqueTotal PRÓPRIOS deste evento
   * específico - os demais campos (atacante, atacanteTokenUuid) são os
   * do pacote original, iguais em todos os eventos.
   */
  /**
   * Resolve o CICLO COMPLETO de reação a UM evento de ataque específico
   * (popup de Bloquear/Esquivar/Contra-Atacar/Estresse/Cheio, aplicação
   * do dano, Contra-Ataque/Deflexão devolvendo dano ao atacante original,
   * e os Gatilhos de "sofri dano") - extraído pra ser chamado MAIS DE UMA
   * VEZ (ver "eventosDeAtaque" em "_processarPacoteLocalmenteInterno":
   * Múltiplos Ataques, ex: Mísseis Arcanos, dá 1 popup de reação PRÓPRIO
   * pra cada projétil que acertar, não um dano combinado numa reação só).
   * "pEvento" já vem com dano/ataqueTotal PRÓPRIOS deste evento
   * específico - os demais campos (atacante, atacanteTokenUuid) são os
   * do pacote original, iguais em todos os eventos.
   *
   * "curaJunto" (opcional, { pEventoCura, opcoesRemover }): quando esta
   * MESMA execução também tem Cura pro mesmo alvo (ver "temCura" no
   * chamador), funde a seção "Reagir à cura" no MESMO popup deste evento
   * (só faz sentido passar no 1º evento, i===0 - mesmo padrão que
   * "itensEvitaveis" já usa) - em vez de dois popups sequenciais pro
   * mesmo alvo. Bug real corrigido: uma Ação sem dano nenhum (ex:
   * Sanatio, Sacerdote) ainda gerava um "evento de ataque" com dano 0
   * (ver "eventosDeAtaque" no chamador, também corrigido - agora nem
   * chega a criar esse evento vazio), então o jogador via um popup
   * inútil de "Reagir ao dano (0)" seguido de um segundo popup separado
   * de "Reagir à cura" - dois cliques pra uma coisa só. A cura é
   * aplicada DEPOIS do dano já ter sido descontado, relendo
   * "actor.system.vida.value" (já atualizado por "_aplicarReacaoDano"
   * logo acima) - nunca o valor de ANTES do popup, pra Dano+Cura na
   * mesma execução calcularem certo em cadeia.
   */
  static async _resolverUmEventoDeAtaque(tokenDoc, actor, pEvento, itensEvitaveis = [], curaJunto = null) {
    // Lembra quem atacou por último (para "Minha Vida chegou a 0" saber quem deu o golpe final).
    if (pEvento?.atacanteTokenUuid && actor?.uuid) naurenUltimoAtacante.set(actor.uuid, { uuid: pEvento.atacanteTokenUuid, t: Date.now() });

    const linhas = [];
    let danoAplicado = 0;
    const popupLigado = !!actor.system.popupDefesaAoTomarDano;
    let reacaoDano = "cheio";
    let ajustes = {};
    let evitados = new Map();
    let curaAceita = true;
    let paraRemover = "";
    let extrasEscolhidos = null;
    let passo1 = null;
    const mostrarCura = !!curaJunto;
    // Bug real corrigido: com "popupDefesaAoTomarDano" desligado, este
    // popup nunca rodava - se "itensEvitaveis" viesse junto (fundido
    // aqui, ver comentário completo no chamador), as opções de "evitar
    // efeitos"/"não receber Condição" desapareciam com ele, mesmo não
    // tendo nada a ver com a preferência de reação a DANO. Agora mostra
    // o popup se qualquer um dos três precisar, e só oferece a parte de
    // "Reagir ao dano" quando o popup de dano estiver de fato ligado.
    // Passo 1 (reação): só se houver o que responder. Quem leva o dano de um Contra-Ataque não reage
    // (Ação feita em Prioridade não gera nova Prioridade) - vai direto ao passo 2.
    // Juramento da Honra: pode Contra-Atacar até um Contra-Ataque (1 vez por turno).
    const honra = pEvento.ehContraAtaque && pEvento.contraAtacanteTokenUuid
      ? actor.items.find(i => i.type === "condicao" && i.system.ativo !== false && i.system.contraAtaqueEmPrioridade && i.getFlag("nauren", "contraEmPrioridadeTurno") !== naurenChaveEscopoRelogio("turno", actor))
      : null;
    if (honra) pEvento = { ...pEvento, atacanteTokenUuid: pEvento.contraAtacanteTokenUuid, apenasContraAtaque: true, viaCondicao: honra.name };
    // Bando (0.93): lacaio não reage (sem Bloquear, Esquivar, Contra-Atacar, Estresse nem Prioridade para fugir).
    const lacaio = !!naurenBandoChave(actor);
    if (lacaio) itensEvitaveis = [];
    const reagir = popupLigado && !lacaio && (!pEvento.ehContraAtaque || !!honra);
    if (reagir || mostrarCura) {
      const resultado = await this._popupReacao(actor, pEvento, {
        mostrarReacaoDano: reagir, itensEvitaveis, fase: "reacao",
        mostrarReacaoCura: mostrarCura, opcoesRemover: curaJunto?.opcoesRemover ?? []
      });
      passo1 = resultado;
      if (reagir || (resultado.reacaoDano && resultado.reacaoDano !== "cheio")) {
        reacaoDano = resultado.reacaoDano || "cheio";
        ajustes = {
          ajusteBloqueio: resultado.ajusteBloqueio, ajusteEsquiva: resultado.ajusteEsquiva,
          ajusteEsquivaInstintiva: resultado.ajusteEsquivaInstintiva,
          bloqueioDadoTotal: resultado.bloqueioDadoTotal, esquivaDadoTotal: resultado.esquivaDadoTotal,
          armaContraAtaqueId: resultado.armaContraAtaqueId, acaoContraAtaqueIndex: resultado.acaoContraAtaqueIndex
        };
      }
      if (mostrarCura) {
        curaAceita = resultado.reacaoCura !== "recusar";
        paraRemover = resultado.removerCondicaoOuEstresse || "";
        if (Array.isArray(resultado.removerExtras) && resultado.removerExtras.length) extrasEscolhidos = resultado.removerExtras;
      }
    }

    // Passo 2 (consequência): com o resultado da reação já conhecido e ANTES do dano sair da Vida,
    // decide Estresse/dano e paga para evitar Condições. As rolagens do passo 1 não sofreram nada disso.
    // Sem reação com rolagem (não reagiu, só Estresse, não tomar dano): o resultado já era conhecido no passo 1,
    // então o que foi escolhido lá vale e não há passo 2.
    const reagiuComRolagem = !!passo1 && !["cheio", "estresse", "sem-dano"].includes(reacaoDano);
    // Não ser empurrado: a colisão prevista já foi somada ao dano do ataque - sai junto.
    const idxMovEv = itensEvitaveis.findIndex(it => it.tipo === "movimento");
    const colisaoSomada = Number(pEvento.empurrarColisaoJaSomada?.valor) || 0;
    const tiraColisao = (mapa, reacaoUsada) => {
      if (idxMovEv === -1 || !colisaoSomada || !mapa.has(idxMovEv)) return 0;
      const it = itensEvitaveis[idxMovEv], modo = mapa.get(idxMovEv);
      if (modo === "prioridade" && (it.bloqueadoPor || this.REACOES_QUE_USAM_PRIORIDADE.has(reacaoUsada))) return 0;
      if (modo === "custo" && !this._podePagar(actor, it.recurso, it.quantidade)) return 0;
      return ["prioridade", "custo", "livre"].includes(modo) ? colisaoSomada : 0;
    };
    if (passo1 && !reagiuComRolagem) {
      evitados = new Map(passo1.evitados ?? []);
      if (passo1.ajusteDanoFinal) ajustes.ajusteDanoFinal = passo1.ajusteDanoFinal;
      ajustes.semColisao = tiraColisao(evitados, reacaoDano);
    } else ajustes.decidirConsequencia = async ({ danoFinal: danoAgora, texto: resumo, evitouCompletamente: evitou, usouPrioridade: saiu }) => {
      // Usou a Prioridade antes de uma Ação Anunciada (saiu da área): não recebe nada, então não há o que evitar.
      // O que foi marcado no passo 1 já vem marcado (_pre), para confirmar ou mudar com o resultado à vista.
      // Não ser movido usando a Prioridade some se ela já foi gasta na reação (Bloquear/Esquivar/Contra-Atacar)
      // ou se o ataque foi evitado (aí ninguém é movido).
      const pre = new Map(passo1?.evitados ?? []);
      const prioridadeGasta = this.REACOES_QUE_USAM_PRIORIDADE.has(reacaoDano);
      const lista = itensEvitaveis.map((it, i) => ({ ...it, _pre: pre.get(i) ?? null,
        _prioridadeGasta: it.tipo === "movimento" && prioridadeGasta,
        _oculto: !!(saiu || (evitou && it.ref?.soSeAcertar) || (it.tipo === "movimento" && evitou)) }));
      const temEvitavel = lista.some(it => !it._oculto);
      const mostrarDano = popupLigado && !lacaio && danoAgora > 0;
      if (!mostrarDano && !temEvitavel) return null;
      const r = await this._popupReacao(actor, { ...pEvento, danoAtual: danoAgora, resumoReacao: resumo }, {
        mostrarReacaoDano: mostrarDano, itensEvitaveis: lista, fase: "consequencia", mostrarReacaoCura: false, opcoesRemover: []
      });
      evitados = new Map(r?.evitados ?? []);
      const semColisao = tiraColisao(evitados, reacaoDano);
      if (!mostrarDano) return semColisao ? { semColisao } : null;
      return semColisao ? { ...r, semColisao } : r;
    };
    const decisao = await this._aplicarReacaoDano(actor, pEvento, reacaoDano, ajustes);
    // 0.94.11: reagir (Bloquear, Esquivar, Contra-Atacar) é usar a Prioridade de quem foi atacado (livro, Cap. III):
    // dispara "recebeuPrioridade" já aqui (ex.: Força Interior, +1 Estamina). Se o card depois confirmar a Prioridade
    // dessa mesma pessoa vinda do mesmo atacante, o evento não roda de novo.
    if (["bloquear", "esquivar", "esquiva-instintiva", "esquivar-energia", "contra-atacar"].includes(reacaoDano) && pEvento.houveAtaque && !pEvento.semPrioridade) {
      let deUuid = "";
      try { deUuid = pEvento.atacanteTokenUuid ? (fromUuidSync(pEvento.atacanteTokenUuid)?.actor?.uuid ?? "") : ""; } catch (err) { deUuid = ""; }
      await actor.setFlag("nauren", "prioridadeNaReacao", { de: deUuid, quando: Date.now() }).catch(() => {});
      naurenMovimentoSaldo.delete(actor.uuid);
      naurenProcessarGatilhos("recebeuPrioridade", actor, { motivo: "reacao", origemAtorUuid: deUuid })
        .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (Prioridade usada na reação).", err));
    }
    if (honra && decisao.contraAtaque) await honra.setFlag("nauren", "contraEmPrioridadeTurno", naurenChaveEscopoRelogio("turno", actor)).catch(() => null);
    danoAplicado = decisao.danoFinal;
    // Ataque sem dano (ex.: Roubar Destino, ataques que só aplicam Condição): o card não fala em "dano cheio" nem "-0 PV".
    const ataqueSemDano = !(Number(pEvento.dano) > 0);
    if (ataqueSemDano && /^Sofreu o dano cheio/.test(decisao.texto ?? "")) linhas.push(String(decisao.texto).replace(/^Sofreu o dano cheio/, "Acertou (sem dano)"));
    else linhas.push(decisao.texto);
    if (!ataqueSemDano || decisao.danoFinal > 0) linhas.push(`-${decisao.danoFinal} PV`);
    // Dano verdadeiro: não é reduzido por bloqueio, Estresse, reduções nem Escudo - só não entra se o ataque foi evitado.
    const dv = Math.max(0, Number(pEvento.danoVerdadeiro) || 0);
    if (dv && !decisao.evitouCompletamente) {
      const vidaAntes = actor.system.vida?.value ?? 0;
      await actor.update({ "system.vida.value": Math.max(0, vidaAntes - dv) });
      danoAplicado += Math.min(dv, vidaAntes);
      linhas.push(`-${Math.min(dv, vidaAntes)} PV de dano verdadeiro (não pode ser reduzido)`);
    }

    if (decisao.contraAtaque) {
      const atacanteTokenDoc = await fromUuid(decisao.contraAtaque.atacanteTokenUuid).catch(() => null);
      if (atacanteTokenDoc?.actor) {
        if (decisao.contraAtaque.ehDeflexao) {
          const vidaAtacante = atacanteTokenDoc.actor.system.vida?.value ?? 0;
          const estaminaAtacante = atacanteTokenDoc.actor.system.estaminaCombate?.value ?? 0;
          const reducaoAtacante = atacanteTokenDoc.actor.system.reducaoDanoTotal ?? 0;
          const danoAoAtacante = Math.max(0, this.aplicarReducaoPercentual(atacanteTokenDoc.actor, decisao.contraAtaque.dano) - reducaoAtacante); if (decisao.contraAtaque.dano > 0) await this.consumirAoSofrerDano(atacanteTokenDoc.actor, decisao.contraAtaque.dano);
          const { escudoConsumido: escudoAtacanteConsumido, danoNaVida: danoAtacanteNaVida, escudoRestante: escudoAtacanteRestante } = this.calcularDanoComEscudo(atacanteTokenDoc.actor, danoAoAtacante);
          const updatesAtacante = {
            "system.vida.value": Math.max(0, vidaAtacante - danoAtacanteNaVida),
            "system.estaminaCombate.value": Math.max(0, estaminaAtacante - 1)
          };
          if (escudoAtacanteConsumido > 0) updatesAtacante["system.escudo.value"] = escudoAtacanteRestante;
          await this.atualizarAtorSeguro(atacanteTokenDoc.actor, updatesAtacante, { naurenOrigemCombate: true });

          // Regra do livro: quem teve o ataque defletido perde 1 de Estamina e fica Caído.
          const packCondDef = game.packs.find(pk => pk.metadata.label === "Nauren - Condições e Venenos");
          const uuidCaidoDef = await naurenUuidPorSeed(packCondDef, "condicao-caido").catch(() => "");
          let caiuNaDeflexao = false;
          if (uuidCaidoDef && uuidCaidoDef !== decisao.contraAtaque.condicaoAoDefletir) {
            caiuNaDeflexao = !!(await NaurenAlvoHelper.aplicarCondicao(atacanteTokenDoc.actor, uuidCaidoDef, 1)
              .catch(err => { console.warn("Nauren RPG | Falha ao aplicar Caído na Deflexão.", err); return null; }));
          }
          if (decisao.contraAtaque.condicaoAoDefletir) {
            await NaurenAlvoHelper.aplicarCondicao(atacanteTokenDoc.actor, decisao.contraAtaque.condicaoAoDefletir, 1)
              .catch(err => console.warn("Nauren RPG | Falha ao aplicar Condição/Efeito ao Defletir.", err));
          }

          ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: `
              <div class="nauren-deflexao-card">
                <div class="nauren-deflexao-titulo"><i class="fas fa-shield-halved"></i> DEFLEXÃO!</div>
                <div class="nauren-deflexao-texto"><b>${actor.name}</b> defletiu o ataque de <b>${atacanteTokenDoc.actor.name}</b> ${decisao.contraAtaque.viaBloqueio ? "no <b>Bloqueio</b>" : `com <b>${decisao.contraAtaque.armaNome}</b>`} — o ataque original falhou. <b>${atacanteTokenDoc.actor.name}</b> ${decisao.contraAtaque.viaBloqueio ? "perdeu 1 de Estamina" : `sofreu ${danoAoAtacante} de dano e -1 de Estamina`}${caiuNaDeflexao || uuidCaidoDef === decisao.contraAtaque.condicaoAoDefletir ? " e ficou Caído" : ""}.</div>
              </div>`
          });
          naurenProcessarGatilhos("euRealizeiDeflexao", actor, { atacanteTokenUuid: decisao.contraAtaque.atacanteTokenUuid })
            .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (realizei Deflexão).", err));
        } else {
          const condicoesContraAtaque = [];
          if (decisao.contraAtaque.condicaoAoContraAtacar) {
            condicoesContraAtaque.push({
              uuid: decisao.contraAtaque.condicaoAoContraAtacar,
              acumulos: 1,
              soSeAcertar: true,
              perguntarParaEvitar: false,
              custoParaEvitarRecurso: "estamina",
              custoParaEvitarQuantidade: 1
            });
          }
          await this.aplicarEmAlvo(atacanteTokenDoc, {
            ehContraAtaque: true,
            nomeAcao: `Contra-Ataque (${decisao.contraAtaque.armaNome})`,
            atacante: actor.name,
            atacanteTokenUuid: null,
            contraAtacanteTokenUuid: tokenDoc?.uuid ?? null,
            houveAtaque: true,
            ataqueTotal: decisao.contraAtaque.ataqueTotal,
            critico: !!decisao.contraAtaque.critico,
            falhaCritica: !!decisao.contraAtaque.falhaCritica,
            dano: decisao.contraAtaque.dano,
            danoMinimo: decisao.contraAtaque.dano,
            cura: 0,
            condicoes: condicoesContraAtaque,
            gastosRecurso: []
          });
        }
      } else {
        console.warn("Nauren RPG | Contra-Ataque: não consegui encontrar o token do atacante original pra devolver o dano.");
      }
    }

    if (decisao.danoFinal > 0) {
      naurenProcessarGatilhos("aliadoSofreuDano", actor, { usouPrioridade: ["bloquear", "esquivar", "esquiva-instintiva"].includes(reacaoDano) }).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (aliado sofreu dano).", err));
      naurenProcessarGatilhos("euSofriDano", actor, { atacanteTokenUuid: pEvento.atacanteTokenUuid, tipoItemUsado: pEvento.tipoItemOrigem ?? "", tipoAlcance: pEvento.tipoAlcanceOrigem ?? "", origemAtaque: pEvento.origemAtaque ?? "", ehAtaque: !!pEvento.houveAtaque }).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (eu sofri dano).", err));
    }

    let curaFinal = 0;
    if (mostrarCura) {
      if (curaAceita) {
        const vidaAtual = actor.system.vida.value;
        const max = actor.system.vida.max;
        const ajuste = this.ajustarCuraRecebida(actor, curaJunto.pEventoCura.cura);
        curaFinal = Math.min(max, vidaAtual + ajuste.cura) - vidaAtual;
        if (curaFinal > 0) await actor.update({ "system.vida.value": vidaAtual + curaFinal }, { naurenOrigemCombate: true });
        linhas.push(`+${curaFinal} PV${ajuste.cortada ? ` (cura reduzida −${ajuste.cortada}: ${ajuste.fontes?.join(", ") || "Condição"})` : ""}`);
        await this._posCura(actor, extrasEscolhidos ? { ...curaJunto.pEventoCura, remocoesExtras: 0 } : curaJunto.pEventoCura, curaFinal, linhas);
      } else {
        linhas.push("Recusou a cura");
      }
      await this._aplicarRemocoes(actor, paraRemover, curaAceita ? extrasEscolhidos : null, curaJunto.pEventoCura, linhas);

      if (curaFinal > 0) naurenProcessarGatilhos("euCurei", actor).catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (eu curei).", err));
    }

    return { danoFinal: danoAplicado, curaFinal, linhas, evitouCompletamente: decisao.evitouCompletamente, usouPrioridade: !!decisao.usouPrioridade, evitados, curaAceita: !!curaJunto && curaAceita, reacaoDano };
  }

  static async _processarPacoteLocalmenteInterno(tokenDoc, actor, pacote) {
    let usouDanoMaximoMargem = false;
    if (!actor) return { alvo: "?", acertou: null, linhas: ["alvo não encontrado"] };

    let p = pacote;
    const linhas = [];
    let danoAplicado = 0; // pro Gatilho "Eu dei dano" - preenchido mais abaixo, se algum dano de fato acontecer
    let curaRecebida = false; // aceitou a cura (mesmo com a Vida cheia) - Gatilho "Usei uma cura em alguém"
    let curaAplicada = 0; // pro Gatilho "Eu curei" - mesmo espírito, preenchido no bloco de Cura abaixo

    // 1) Checagem de acerto ("supera a Defesa" = estritamente maior, regra do
    //    manual) - o resultado (sim/não) é devolvido pro ícone do card
    //    principal, mas o texto NUNCA cita o valor da Defesa. Refere-se
    //    só ao ATAQUE PRINCIPAL - Condições/Gastos com "soSeAcertar"
    //    continuam checando só este, igual antes (não muda com Múltiplos
    //    Ataques).
    let acertou = p.houveAtaque ? null : true;
    let ajusteAtaqueRecebido = null;
    // Fase 5: modificadores da rolagem de ataque recebida (Condição, Efeito
    // ou Habilidade ativa do alvo), antes de comparar com a Defesa.
    if (p.houveAtaque) {
      const fontesAtaque = actor.items.filter(i => ["condicao", "efeito", "habilidade"].includes(i.type)
        && (i.type === "condicao" || i.system.ativo) && String(i.system.ataqueRecebidoFormula ?? "").trim());
      let ajusteAtaque = 0;
      const partesAtaque = [];
      for (const fonte of fontesAtaque) {
        const filtro = String(fonte.system.ataqueRecebidoSoOrigem ?? "").trim();
        if (filtro === "magia" || filtro === "arma") { if ((p.origemAtaque ?? "") !== filtro) continue; }
        else if (filtro === "corpoACorpo" || filtro === "distancia") { if ((p.tipoAlcanceOrigem ?? "") !== filtro) continue; }
        try {
          const formula = String(fonte.system.ataqueRecebidoFormula)
            .replace(/@rank\b/gi, String(fonte.system.rankAtual ?? 0))
            .replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, actor)));
          const roll = await new Roll(formula).evaluate();
          ajusteAtaque += roll.total;
          partesAtaque.push(`${fonte.name}: ${naurenFormulaParaTexto(fonte.system.ataqueRecebidoFormula, actor)} → ${naurenTextoRolagem(roll)}`);
        } catch (err) {
          console.warn(`Nauren RPG | "${fonte.name}": fórmula de ataque recebido inválida.`, err);
        }
      }
      if (partesAtaque.length) {
        const antes = p.ataqueTotal ?? 0;
        p = { ...p, ataqueTotal: antes + ajusteAtaque };
        ajusteAtaqueRecebido = { total: ajusteAtaque, final: p.ataqueTotal, texto: partesAtaque.map(t => t.split(" → ")[1] ?? t).join(" "), fontes: fontesAtaque.map(f => f.name) };
        linhas.push(`Ataque ${antes} ${ajusteAtaque >= 0 ? "+" : "−"} ${Math.abs(ajusteAtaque)} = ${p.ataqueTotal} (${partesAtaque.join("; ")})`);
      }
    }
    // Condições que reduzem o dano recebido em % (ex.: Instinto de Sobrevivência: metade).
    const pctRed = Math.min(100, actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false).reduce((t, i) => t + (i.system.danoRecebidoPercentual || 0), 0));
    if (pctRed > 0 && (p.dano ?? 0) > 0) {
      const antesR = p.dano;
      p = { ...p, dano: Math.floor(antesR * (1 - pctRed / 100)) };
      linhas.push(`Dano recebido −${pctRed}%: ${antesR} → ${p.dano}`);
    }
    // Piromancia (Mago): + dano por acúmulo de uma Condição NESTE alvo.
    if (p.bonusPorAcumulo?.valor && (p.dano ?? 0) > 0) {
      const condB = actor.items.find(i => i.type === "condicao" && (i.getFlag("core", "sourceId") === p.bonusPorAcumulo.uuid || i.getFlag("nauren", "cadeiaRaizUuid") === p.bonusPorAcumulo.uuid));
      const acumB = condB ? (condB.system.acumulativel ? Math.max(1, condB.system.acumulos ?? 1) : 1) : 0;
      if (acumB > 0) {
        const extraB = acumB * p.bonusPorAcumulo.valor;
        p = { ...p, dano: (p.dano ?? 0) + extraB, danoMaximoAlternativo: p.danoMaximoAlternativo ? p.danoMaximoAlternativo + extraB : p.danoMaximoAlternativo };
        linhas.push(`${p.bonusPorAcumulo.fonte}: +${extraB} de dano (${acumB} × ${condB.name})`);
      }
    }
    // Olhar Culposo (Empíreo): consome um Olho Maligno para reduzir o ataque em 1d10 (10 em Profusão Retraída).
    if (p.houveAtaque) {
      const olhos = actor.items.find(i => i.type === "condicao" && naurenEhItem(i, "Olhos Malignos") && (i.system.acumulos ?? 0) > 0);
      if (olhos) {
        const usarOlho = await foundry.applications.api.DialogV2.confirm({ window: { title: `Olhar Culposo — ${actor.name}` },
          content: `<p>Você está sendo atacado (ataque ${p.ataqueTotal ?? 0}). Consumir 1 Olho Maligno (${olhos.system.acumulos === 1 ? "o último" : `${olhos.system.acumulos} restantes`}) para reduzir o ataque em 1d10${naurenTemEstado(actor, "Profusão Retraída") ? " (máximo: Profusão Retraída)" : ""}?</p>`,
          yes: { label: "Usar um Olho" }, no: { label: "Agora não" }, rejectClose: false }).catch(() => false);
        if (usarOlho) {
          const rollO = await new Roll("1d10").evaluate(naurenTemEstado(actor, "Profusão Retraída") ? { maximize: true } : undefined);
          if (game.dice3d) await game.dice3d.showForRoll(rollO, game.user, true).catch(() => {});
          const antesO = p.ataqueTotal ?? 0;
          p = { ...p, ataqueTotal: antesO - rollO.total };
          if ((olhos.system.acumulos ?? 1) > 1) await olhos.update({ "system.acumulos": olhos.system.acumulos - 1 }); else await olhos.delete();
          linhas.push(`Olhar Culposo: ataque ${antesO} − ${rollO.total} = ${p.ataqueTotal} (${naurenTextoRolagem(rollO)})`);
          ajusteAtaqueRecebido = { total: (ajusteAtaqueRecebido?.total ?? 0) - rollO.total, final: p.ataqueTotal,
            texto: [ajusteAtaqueRecebido?.texto, `−${naurenTextoRolagem(rollO)} (Olhar Culposo)`].filter(Boolean).join(" "),
            fontes: [...(ajusteAtaqueRecebido?.fontes ?? []), "Olhar Culposo"] };
        }
      }
    }
    // Verdade Atordoante (Ladino): ao ser atacado, 1x por combate, reduz o
    // ataque em N = suas informações sobre o atacante. Pergunta antes de
    // decidir se acertou.
    if (p.houveAtaque && p.atacanteTokenUuid) {
      const verdade = actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Verdade Atordoante") && i.system.ativo !== false);
      if (verdade && naurenUsoDisponivel(verdade)) {
        const atacDoc = await fromUuid(p.atacanteTokenUuid).catch(() => null);
        const atacante = atacDoc?.actor ?? atacDoc;
        const infVerdade = naurenEstudoNoAlvo(atacante, actor)?.getFlag("nauren", "estudo")?.informacoes ?? 0;
        if (atacante && infVerdade > 0) {
          const usar = await foundry.applications.api.DialogV2.confirm({
            window: { title: `Verdade Atordoante — ${actor.name}` },
            content: `<p><b>${atacante.name}</b> está atacando você (ataque ${p.ataqueTotal ?? 0}).</p><p>Usar <b>Verdade Atordoante</b> e reduzir o ataque em <b>${infVerdade}</b> (suas informações sobre ele)? 1 vez por combate.</p>`,
            yes: { label: `Reduzir em ${infVerdade}` }, no: { label: "Agora não" }, rejectClose: false
          }).catch(() => false);
          if (usar) {
            await naurenConsumirUsoDaHabilidade(verdade);
            const antesV = p.ataqueTotal ?? 0;
            p = { ...p, ataqueTotal: antesV - infVerdade };
            linhas.push(`Verdade Atordoante: ataque ${antesV} − ${infVerdade} = ${p.ataqueTotal}`);
            ajusteAtaqueRecebido = { total: (ajusteAtaqueRecebido?.total ?? 0) - infVerdade, final: p.ataqueTotal,
              texto: [ajusteAtaqueRecebido?.texto, `−${infVerdade} (Verdade Atordoante)`].filter(Boolean).join(" "),
              fontes: [...(ajusteAtaqueRecebido?.fontes ?? []), "Verdade Atordoante"] };
          }
        }
      }
    }
    // Eu estou acima: Defesa (Análise Paciente) - só contra o alvo que o Ladino analisou.
    let atacanteAcima = null;
    try { const tA = p.atacanteTokenUuid ? fromUuidSync(p.atacanteTokenUuid) : null; atacanteAcima = tA?.actor ?? null; } catch (err) { atacanteAcima = null; }
    const acimaDefesa = naurenBonusAcimaContra(actor, atacanteAcima, "defesa");
    // Reações pagas de Defesa (0.94): equipamento que deixa pagar um recurso para somar à Defesa.
    const defesaPaga = p.houveAtaque ? await naurenReacoesPagasDefesa(actor, p, (actor.system.defesaTotal ?? 10) + acimaDefesa.total, linhas) : 0;
    if (p.houveAtaque) {
      const defesa = (actor.system.defesaTotal ?? 10) + acimaDefesa.total + defesaPaga;
      if (acimaDefesa.total) linhas.push(`Eu estou acima: Defesa +${acimaDefesa.total} contra ${atacanteAcima?.name ?? "o atacante"} (${defesa})`);
      // Livro, Cap. III: o ataque acerta se SUPERAR a Defesa (empate erra).
      // Falha crítica (1 natural) erra sempre; acerto crítico acerta sempre, mesmo abaixo da Defesa.
      acertou = p.falhaCritica ? false : (p.critico ? true : (p.ataqueTotal ?? 0) > defesa);
      if (p.falhaCritica) linhas.push(`Falha crítica (1 natural): erra${(p.ataqueTotal ?? 0) > defesa ? ` mesmo com ${p.ataqueTotal} contra Defesa ${defesa}` : ""}`);
      else if (p.critico && (p.ataqueTotal ?? 0) <= defesa) linhas.push(`Acerto crítico: acerta mesmo com ${p.ataqueTotal} contra Defesa ${defesa}`);
      else if (!acertou) linhas.push("Não superou a Defesa");
      // Dano no erro (M15, ex.: Golpe Tenaz): o golpe erra, mas o alvo ainda sofre um dano menor, sem
      // reação (passa só pelas reduções e pelo Escudo). Nunca em falha crítica.
      if (!acertou && !p.falhaCritica && (p.danoNoErro ?? 0) > 0) {
        const bruto = p.danoNoErro;
        const reduzido = Math.max(0, this.aplicarReducaoPercentual(actor, bruto) - (actor.system.reducaoDanoTotal ?? 0));
        const { escudoConsumido, danoNaVida, escudoRestante } = this.calcularDanoComEscudo(actor, reduzido);
        const vidaAntesE = actor.system.vida?.value ?? 0;
        const upd = { "system.vida.value": Math.max(0, vidaAntesE - danoNaVida) };
        if (escudoConsumido > 0) upd["system.escudo.value"] = escudoRestante;
        if (danoNaVida > 0 || escudoConsumido > 0) await actor.update(upd, { naurenOrigemCombate: true });
        await this.consumirAoSofrerDano(actor, bruto);
        danoAplicado += danoNaVida;
        linhas.push(`Dano no erro: −${danoNaVida}${reduzido !== bruto ? ` (${bruto} rolado, reduzido)` : ""}${p.danoNoErroTexto ? ` (${p.danoNoErroTexto})` : ""}`);
      }
      // Tiro Mortal (Caçador): 20 natural contra quem tem menos Vida que o atacante.
      if (acertou && p.morteInstantanea !== null && p.morteInstantanea !== undefined && (actor.system.vida?.value ?? 0) < p.morteInstantanea) {
        await actor.update({ "system.vida.value": 0 }, { naurenOrigemCombate: true });
        linhas.push("Tiro Mortal: 20 natural contra um alvo mais fraco - morreu instantaneamente");
      }
      // Fase 4: "Fui alvo de um teste de ataque" - acertando ou não.
      await naurenProcessarGatilhos("fuiAlvoDeAtaque", actor, { atacanteTokenUuid: p.atacanteTokenUuid, ehAtaque: true, ataqueTotal: p.ataqueTotal, acertou, tipoAlcance: p.tipoAlcanceOrigem ?? "", origemAtaque: p.origemAtaque ?? "" })
        .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (fui alvo de ataque).", err));
      if (acertou) {
        await naurenProcessarGatilhos("fuiAtingidoPorAtaque", actor, { atacanteTokenUuid: p.atacanteTokenUuid, ehAtaque: true, ataqueTotal: p.ataqueTotal, acertou, tipoAlcance: p.tipoAlcanceOrigem ?? "", origemAtaque: p.origemAtaque ?? "" })
          .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (fui atingido por ataque).", err));
      }
      // Dano Máximo por Margem (ver campoAcao > usaDanoMaximoPorMargem,
      // ex: Guilhotina Devastadora) - a margem de acerto só é conhecida
      // AQUI (do lado de quem processa o alvo), então a troca acontece
      // NESTE ponto: se a margem bater o limiar configurado, usa
      // "danoMaximoAlternativo" (calculado e enviado junto no pacote)
      // no lugar do dano normal, só pro ataque PRINCIPAL.
      if (acertou && p.danoMaximoAlternativo !== null && p.danoMaximoAlternativo !== undefined) {
        const margem = (p.ataqueTotal ?? 0) - defesa;
        if (margem >= (p.margemMinimaDanoMaximo || 10)) {
          p = { ...p, dano: p.danoMaximoAlternativo };
          usouDanoMaximoMargem = true;
          linhas.push(`Margem de acerto alta (${margem}) - dano máximo!`);
        }
      }
    }

    // Múltiplos Ataques (ex: Mísseis Arcanos - vários projéteis na mesma
    // Ação, cada um com seu próprio teste de ataque): CADA projétil que
    // acertar (incluindo o "principal") agora vira seu próprio EVENTO DE
    // ATAQUE, resolvido com um ciclo de reação PRÓPRIO (Bloquear/Esquivar/
    // Contra-Atacar) mais abaixo - não soma tudo num dano único.
    const eventosDeAtaque = [];
    // Bug real corrigido: com "houveAtaque: false" e sem NENHUM bloco de
    // Dano configurado (ex: Palavra de Destino: Sanatio, Sacerdote - só
    // Cura), "acertou" ainda vinha "true" por padrão (ver acima), então
    // este bloco empurrava um evento "fantasma" com dano 0 - o alvo via
    // um popup inútil de "Reagir ao dano (0)" antes do popup de Cura
    // (ver "temCura" mais abaixo), dois popups pra uma Ação que nunca
    // causou dano nenhum. Só gera um evento de verdade quando HOUVE um
    // teste de ataque real (mesmo com 0 de dano, Bloquear/Esquivar ainda
    // fazem sentido contra ele) OU quando há dano/dano mínimo configurado.
    if (acertou && (p.houveAtaque || (p.dano ?? 0) > 0 || (p.danoMinimo ?? 0) > 0)) {
      eventosDeAtaque.push({ ataqueTotal: p.ataqueTotal, dano: p.dano ?? 0, danoMinimo: p.danoMinimo ?? 0 });
    }
    if (p.houveAtaque && Array.isArray(p.ataquesMultiplos) && p.ataquesMultiplos.length) {
      const defesa = (actor.system.defesaTotal ?? 10) + acimaDefesa.total + defesaPaga;
      let acertosExtras = 0;
      for (const extra of p.ataquesMultiplos) {
        if (!extra.falhaCritica && (extra.critico || (extra.ataqueTotal ?? 0) > defesa)) {
          eventosDeAtaque.push({ ataqueTotal: extra.ataqueTotal, dano: extra.dano ?? 0, danoMinimo: extra.danoMinimo ?? 0 });
          acertosExtras++;
        }
      }
      linhas.push(`Projéteis adicionais: ${acertosExtras}/${p.ataquesMultiplos.length} acertaram`);
    }

    // 2) Filtra o que se aplica a ESTE alvo (respeitando "só se acertar" por
    //    entrada - num efeito de área, cada alvo tem sua própria Defesa) e já
    //    ROLA as fórmulas de quantidade/custo UMA VEZ (evita rolar de novo
    //    com resultado diferente entre montar o popup e aplicar de fato).
    const aplicaSeAcertou = entrada => !(entrada.soSeAcertar && !acertou);
    const gastosAplicaveis = (p.gastosRecurso ?? []).filter(aplicaSeAcertou);
    const condicoesAplicaveis = (p.condicoes ?? []).filter(aplicaSeAcertou);
    for (const g of gastosAplicaveis) {
      // "quantidade" e "custoParaEvitarQuantidade" já chegam PRONTOS
      // (números, não fórmula) - rolados UMA VEZ SÓ do lado de quem usou
      // a Ação (ver a construção de "gastosRecurso" em
      // _executarAcao/_resolverAlvosDaAcao), e o MESMO valor é reaplicado
      // a cada alvo que receber este pacote. Bug real corrigido, a
      // pedido explícito (achado num teste ao vivo, Comungar - Mana):
      // antes, cada alvo rolava sua PRÓPRIA instância de "new Roll()"
      // aqui, dando números diferentes pra cada aliado na mesma área -
      // igual Dano/Cura JÁ funcionam (rolados uma vez só, bem antes de
      // saber se o modo é "área" ou "selecionado").
      g._quantidade = g.quantidade;
      g._custoQuantidade = g.custoParaEvitarQuantidade;
    }
    for (const c of condicoesAplicaveis) {
      if (c.perguntarParaEvitar) {
        c._custoQuantidade = await this._rolarFormula(c.custoParaEvitarQuantidade);
        if (c.custoParaEvitarRecursoAlternativo) c._custoQuantidadeAlternativo = await this._rolarFormula(c.custoParaEvitarQuantidadeAlternativo);
      }
    }
    const temCura = acertou && p.cura > 0;

    // Roubar Recurso - só dispara se acertou. Bug real corrigido: rodava
    // "fire and forget" (sem await) - mesmo risco de "concessaoAoAtacante"
    // logo abaixo (ver comentário completo lá): o atacante podia disparar
    // "euAcerteiAtaque" antes desta escrita terminar, lendo um snapshot
    // desatualizado do mesmo recurso e apagando o ganho.
    if (acertou && p.roubarRecurso && p.atacanteTokenUuid) {
      await naurenTransferirRecursoDoAlvo(actor, p.atacanteTokenUuid, p.roubarRecurso.tipo, p.roubarRecurso.quantidade)
        .catch(err => console.warn("Nauren RPG | Falha ao processar Roubar Recurso.", err));
    }

    // Concessão ao Atacante, condicional a Acertar/Errar (ver
    // campoAcao > concessaoAoAtacante, ex: Ímpeto) - só faz sentido em
    // Ações com teste de ataque (p.houveAtaque), já que "errou" só
    // existe nesse contexto.
    // Bug real corrigido: rodava "fire and forget" (sem await) - o
    // Query que devolve o controle pro ATACANTE (ver "aplicarEmAlvo",
    // await NaurenAlvoHelper.aplicarEmAlvo(...) em "_executarAcao")
    // podia resolver ANTES desta escrita em "system.recursosCustom" do
    // atacante ter terminado de verdade. Logo em seguida, o próprio
    // atacante dispara "euAcerteiAtaque"/"euErreiAtaque" (ex: Dualidade,
    // Empíreo) - que lê/escreve o MESMO "recursosCustom" - se essa
    // segunda escrita começasse antes da primeira terminar, cada uma lia
    // um snapshot desatualizado do recurso e a que terminasse por último
    // "vencia", apagando o ganho da outra (ex: Ímpeto concede +2
    // Ofuscação, Dualidade tenta +1 logo depois, resultado final fica em
    // 1 em vez de 3 - a concessão de Ímpeto simplesmente sumia).
    if (p.houveAtaque && p.atacanteTokenUuid) {
      for (const c of p.concessaoAoAtacante ?? []) {
        const aplicaAgora = c.quandoAplicar === "sempre" || (c.quandoAplicar === "acertar" && acertou) || (c.quandoAplicar === "errar" && !acertou);
        if (!aplicaAgora) continue;
        await naurenConcederRecursoAoAtacante(p.atacanteTokenUuid, c.recurso, c.quantidade)
          .catch(err => console.warn("Nauren RPG | Falha ao processar Concessão ao Atacante.", err));
      }
    }

    // 3) Monta a lista de itens "evitáveis" (perguntarParaEvitar, ou a
    //    opção livre de "não receber" pra Condição sem esse mecanismo)
    //    - Condição/Gasto de Recurso (não dano). Bug real corrigido:
    //    antes SEMPRE virava um popup próprio, SEPARADO do de "Reagir
    //    ao dano" - agora é fundido no popup do 1º evento de ataque
    //    (ver mais abaixo), só ficando separado quando não há nenhum
    //    evento de ataque de verdade pra fundir com.
    const itensEvitaveis = [];
    const fonteAmigaReacao = (() => {
      try {
        const tokFonte = p.atacanteTokenUuid ? fromUuidSync(p.atacanteTokenUuid) : null;
        const atorFonte = tokFonte?.actor ?? null;
        if (atorFonte && atorFonte === actor) return true;
        return !!tokFonte && tokFonte.disposition === naurenDisposicaoDoAtor(actor);
      } catch (err) { return false; }
    })();
    for (const g of gastosAplicaveis) {
      if (g.perguntarParaEvitar) {
        itensEvitaveis.push({ tipo: "gasto", ref: g, label: `${g._quantidade} ${naurenNomeDoRecurso(null, g.recurso)}` });
      }
    }
    for (const c of condicoesAplicaveis) {
      // Vinculada à 1ª Condição (ver campoCondicaoAplicada > acima) -
      // não gera linha própria no popup, segue a decisão da outra
      // Condição desta Ação (ver aplicação mais abaixo).
      if (c.vinculadoAPrimeiraCondicao) continue;
      const origem = await fromUuid(c.uuid);
      // Imune: nem pergunta se quer evitar (a linha "Imune a X" vai no card).
      if (origem?.type === "condicao" && this.imunidadeA(actor, origem)) continue;
      if (c.perguntarParaEvitar) {
        itensEvitaveis.push({ tipo: "condicao", ref: c, label: origem?.name ?? "condição" });
      } else {
        // Opção livre de "não receber" - SEM custo nenhum, só pra
        // Condições que NÃO já têm o mecanismo de pagar um recurso pra
        // evitar (mutuamente exclusivo com o caso acima - nunca as duas
        // opções pra mesma Condição, evita conflito/duplicidade).
        // Buff (não negativo) vindo de você mesmo ou de um aliado: não pergunta (só fazia o jogador clicar à toa).
        if (origem?.type === "condicao" && !naurenCondicaoNegativa(origem) && fonteAmigaReacao) continue;
        itensEvitaveis.push({ tipo: "condicao-livre", ref: c, label: origem?.name ?? "condição" });
      }
    }

    // Movimento forçado (empurrar, puxar, mover o alvo): o alvo pode resistir.
    // Padrão do livro: usando a Prioridade que a Ação dá a ele (no lugar de
    // Bloquear/Esquivar/Contra-Atacar). Aliado movido por você não é perguntado.
    const mvAlvo = p.movimentoNoAlvo;
    if (mvAlvo && acertou && !fonteAmigaReacao) {
      const verboMv = { empurrar: "empurrado", puxar: "puxado", teleportar: "teleportado", mover: "movido" }[mvAlvo.tipo] ?? "movido";
      const nunca = mvAlvo.evitar === "nunca";
      itensEvitaveis.push({
        tipo: "movimento", ref: { _mov: true }, label: `${verboMv} (${mvAlvo.metros}m)`, verbo: verboMv,
        // Prioridade e custo saem quando a Ação diz "não pode resistir"; "não ser movido" (decisão da mesa) fica sempre.
        usaPrioridade: !nunca, bloqueadoPor: nunca ? "" : this.semPrioridadeParaReagir(actor, p),
        custo: !nunca, recurso: mvAlvo.evitar === "custo" ? mvAlvo.recurso : "estamina", quantidade: mvAlvo.evitar === "custo" ? mvAlvo.quantidade : 1
      });
    }

    let evitados = new Map();
    // Sem nenhum evento de ataque (Ação sem dano/teste, ex: uma Magia de
    // buff/condição pura) - não há popup de "Reagir ao dano" pra fundir
    // com, então mostra "Evitar efeitos" sozinho, como sempre.
    if (itensEvitaveis.length > 0 && !eventosDeAtaque.length) {
      const resultado = await this._popupReacao(actor, p, { mostrarReacaoDano: false, itensEvitaveis });
      evitados = new Map(resultado.evitados);
    }

    // 5) Dano - cada evento de ataque (o "principal" + cada projétil
    //    extra que acertou, ver "eventosDeAtaque" acima) passa pelo seu
    //    PRÓPRIO ciclo completo de reação, sequencialmente (Bloquear no
    //    projétil 1 não impede reagir ao projétil 2 de forma diferente).
    // "opcoesRemover" (Remover Condição/Estresse, ver campoAcao >
    // penitenciaRemoverCondicaoOuEstresse) precisa estar pronta ANTES do
    // loop de Dano abaixo, já que agora pode ser fundida no popup do
    // PRIMEIRO evento de ataque junto com a Cura (ver "curaJunto" logo
    // abaixo) - calculada só uma vez aqui, reaproveitada nos dois
    // caminhos possíveis (fundida ou separada, ver passo 6).
    const opcoesRemover = (temCura && p.permiteRemoverCondicaoOuEstresse)
      ? this._montarOpcoesRemoverCondicaoOuEstresse(actor) : [];

    // "algumEventoAcertouDeVerdade": true por padrão quando não houve
    // ataque nenhum (Condições "só se acertar" de uma Magia de
    // buff/cura, por exemplo, continuam se aplicando normalmente); com
    // ataque, só vira true se PELO MENOS UM evento não foi evitado
    // completamente (Bloqueio/Esquiva bem-sucedidos, ou Deflexão) - ver
    // "evitouCompletamente" em _aplicarReacaoDano. Usado no passo 8
    // abaixo pra também pular Condições/Efeitos "só se acertar" quando
    // o ataque, na prática, nunca chegou a valer.
    let algumEventoAcertouDeVerdade = !p.houveAtaque;
    let pulouPorPrioridade = false; // "Usar minha Prioridade" numa Ação Anunciada: sem dano, sem Condições, sem gastos
    let reacaoPrimeiroEvento = ""; // reação escolhida no 1º evento (decide se a Prioridade já foi gasta)
    // "curaJaResolvida": true assim que a Cura for fundida no popup do
    // 1º evento de ataque abaixo (ver "curaJunto") - o passo 6 (Cura
    // separada) só roda quando isso NÃO acontecer, ou seja, quando esta
    // Ação não tem nenhum evento de ataque real pra fundir (ex: Palavra
    // de Destino: Sanatio, só Cura).
    let curaJaResolvida = false;
    for (let i = 0; i < eventosDeAtaque.length; i++) {
      const evento = eventosDeAtaque[i];
      const pEvento = { ...p, houveAtaque: p.houveAtaque, ataqueTotal: evento.ataqueTotal, dano: evento.dano, danoMinimo: evento.danoMinimo };
      // "itensEvitaveis" (Condições/Gastos - não são "por projétil", são
      // da Ação inteira) só entra no popup do PRIMEIRO evento, fundido
      // junto da "Reagir ao dano" dele - nunca duplica pra eventos
      // seguintes de Múltiplos Ataques. "curaJunto" (mesmo espírito,
      // também só no 1º evento) funde a "Reagir à cura" no MESMO popup
      // quando esta execução também cura o alvo - ver comentário
      // completo em "_resolverUmEventoDeAtaque". "pEvento" já herda
      // "cura" de "p" via spread acima, então o popup mostra o valor
      // certo sem precisar repassar nada a mais.
      const curaJunto = (i === 0 && temCura) ? { pEventoCura: p, opcoesRemover } : null;
      const resultadoEvento = await this._resolverUmEventoDeAtaque(tokenDoc, actor, pEvento, i === 0 ? itensEvitaveis : [], curaJunto);
      if (i === 0) { evitados = resultadoEvento.evitados ?? evitados; reacaoPrimeiroEvento = resultadoEvento.reacaoDano ?? "cheio"; }
      danoAplicado += resultadoEvento.danoFinal;
      if (curaJunto) {
        curaAplicada = resultadoEvento.curaFinal;
        curaRecebida = !!resultadoEvento.curaAceita;
        curaJaResolvida = true;
      }
      if (!resultadoEvento.evitouCompletamente) algumEventoAcertouDeVerdade = true;
      if (resultadoEvento.usouPrioridade) pulouPorPrioridade = true;
      const prefixo = eventosDeAtaque.length > 1 ? `[${i + 1}/${eventosDeAtaque.length}] ` : "";
      for (const linha of resultadoEvento.linhas) linhas.push(`${prefixo}${linha}`);
    }

    // 6) Cura (ver _resolverUmEventoDeCura, popup de reação próprio) -
    // só roda SEPARADO quando não foi fundida no popup de dano acima
    // (ver "curaJaResolvida"), ou seja, quando esta Ação não tem nenhum
    // evento de ataque real (ex: Palavra de Destino: Sanatio, só Cura).
    // Bug real corrigido: antes SEMPRE rodava separado, mesmo quando
    // esta mesma execução também tinha um evento de dano - dois popups
    // sequenciais (um deles com "Reagir ao dano (0)" inútil, ver
    // "eventosDeAtaque" acima) pro mesmo alvo/execução.
    if (temCura && !curaJaResolvida) {
      const resultadoCura = await this._resolverUmEventoDeCura(tokenDoc, actor, p, opcoesRemover);
      curaAplicada = resultadoCura.curaFinal;
      curaRecebida = resultadoCura.curaAceita !== false;
      for (const linha of resultadoCura.linhas) linhas.push(linha);
    }

    // 7) Gastos de Recurso do alvo (pulando os evitados - paga o custo no lugar)
    for (const g of gastosAplicaveis) {
      // Mesmo bug/correção do passo 8 abaixo (ver comentário lá) -
      // "soSeAcertar" também existe em Gastos de Recurso (ex: Roubar
      // Recurso), e deve respeitar o mesmo "o ataque falhou por
      // completo" quando Esquivar/Bloquear/Deflexão tiveram sucesso.
      if (pulouPorPrioridade) continue;
      if (g.soSeAcertar && !algumEventoAcertouDeVerdade) continue;
      if (g.soSeSobreviver && (actor.system?.vida?.value ?? 1) <= 0) { linhas.push(`Sem ${naurenNomeDoRecurso(actor, g.recurso)}: caiu com o dano`); continue; }
      const idx = itensEvitaveis.findIndex(e => e.ref === g);
      if (idx !== -1 && evitados.has(idx)) {
        await this._aplicarRecursoNoAlvo(actor, g.custoParaEvitarRecurso, g._custoQuantidade);
        linhas.push(`Gastou ${g._custoQuantidade} ${RECURSOS_ALVO[g.custoParaEvitarRecurso]} pra evitar ${itensEvitaveis[idx].label}`);
        continue;
      }
      const mudouDeVerdade = await this._aplicarRecursoNoAlvo(actor, g.recurso, g._quantidade);
      // Bug real corrigido (achado num teste ao vivo: "--4 Mana" no chat
      // de Comungar - Mana): quantidade NEGATIVA num Gasto de Recurso é
      // uma CONCESSÃO (o alvo GANHA o recurso, ex: Comungar - Mana,
      // Transbordar) - o "-" fixo abaixo (pensado só pra custo/dreno de
      // verdade) virava um segundo sinal de menos colado no número já
      // negativo. Agora mostra como ganho de verdade ("Recuperou X"),
      // igual Cura já mostra - nunca como "-X". Também mostra o
      // BREAKDOWN da rolagem (ex: "1d6(4)"), que antes não existia pra
      // Gasto de Recurso (só o total final chegava até aqui).
      {
        const nomeRecurso = naurenNomeDoRecurso(actor, g.recurso);
        // "(+8)" ao lado de "Recuperou 8" não explica nada: só mostra quando há dado/conta.
        const temBreakdown = g._breakdown && String(g._breakdown).replace(/^[\s+\-−]+/, "").trim() !== String(Math.abs(g._quantidade));
        const extra = temBreakdown ? ` (${g._breakdown})` : "";
        if (g.recurso === "estresse") {
          linhas.push(g._quantidade < 0 ? `−${Math.abs(g._quantidade)} ${nomeRecurso}${extra}` : `+${g._quantidade} ${nomeRecurso}${extra}`);
        } else if (g._quantidade < 0) {
          const real = typeof mudouDeVerdade === "number" ? mudouDeVerdade : Math.abs(g._quantidade);
          const dobrou = real > Math.abs(g._quantidade);
          linhas.push(`Recuperou ${dobrou ? real : Math.abs(g._quantidade)} ${nomeRecurso}${dobrou ? ` (${Math.abs(g._quantidade)} × 2, Inundação Espiritual)` : extra}`);
        } else {
          linhas.push(`−${g._quantidade} ${nomeRecurso}${extra}`);
        }
      }
    }

    // 8) Condições/Efeitos (pulando os evitados)
    for (const c of condicoesAplicaveis) {
      // Bug real corrigido: Esquivar (e Bloquear, e Deflexão) com
      // sucesso são "o ataque falhou por completo" (regra explícita do
      // manual) - antes disso só zerava o DANO, mas Condições "só se
      // acertar" continuavam sendo aplicadas mesmo assim, porque o
      // filtro original (linha ~9047) só olhava a Defesa passiva, sem
      // saber ainda o resultado da reação (que só é decidido depois).
      // Sem custo pra "evitar" aqui - já foi evitado de verdade pela
      // própria reação, não precisa pagar nada extra por cima.
      if (pulouPorPrioridade) continue;
      if (c.soSeAcertar && !algumEventoAcertouDeVerdade) continue;
      // Vinculada à 1ª Condição (ver campoCondicaoAplicada > acima) -
      // segue a MESMA decisão (evitou ou não) da primeira Condição
      // desta Ação que tenha "perguntarParaEvitar", sem custo próprio
      // (ex: Pressão Gravitacional - resistir 1x evita "Caído" E
      // "Fragmentado 1" juntos, não duas vezes).
      if (c.vinculadoAPrimeiraCondicao) {
        const mestre = condicoesAplicaveis.find(outra => outra.perguntarParaEvitar);
        const idxMestre = mestre ? itensEvitaveis.findIndex(e => e.ref === mestre) : -1;
        if (idxMestre !== -1 && evitados.has(idxMestre)) {
          linhas.push(`Não recebeu ${await naurenNomeParaUuid(c.uuid)} (mesma resistência)`);
          continue;
        }
      }
      const idx = itensEvitaveis.findIndex(e => e.ref === c);
      if (idx !== -1 && evitados.has(idx)) {
        if (c.perguntarParaEvitar) {
          // Recurso Alternativo (ver campoCondicaoAplicada > acima) -
          // "evitados.get(idx)" carrega "principal"/"alternativo"
          // quando há essa escolha, ou "true" no caso simples de sempre.
          const escolha = evitados.get(idx);
          const usarAlternativo = escolha === "alternativo" && c.custoParaEvitarRecursoAlternativo;
          const recursoGasto = usarAlternativo ? c.custoParaEvitarRecursoAlternativo : c.custoParaEvitarRecurso;
          const quantidadeGasta = usarAlternativo ? c._custoQuantidadeAlternativo : c._custoQuantidade;
          await this._aplicarRecursoNoAlvo(actor, recursoGasto, quantidadeGasta);
          linhas.push(`Gastou ${quantidadeGasta} ${RECURSOS_ALVO[recursoGasto]} pra evitar ${itensEvitaveis[idx].label}`);
          // "Imune ao evitar" (ver Condição > imuneAoEvitar): quem resiste uma vez fica imune pelo combate.
          try { const origemEv = await fromUuid(c.uuid.startsWith("self:") ? (naurenResolverSelf(c.uuid, actor) || c.uuid) : c.uuid).catch(() => null);
            if (origemEv && await this.registrarImunidadeAoEvitar(actor, origemEv)) linhas.push(`Imune a ${origemEv.name} pelo resto do combate`); } catch (err) { /* sem imunidade */ }
        } else {
          // Opção livre de "não receber" - sem custo nenhum, só a
          // escolha do jogador no popup (ver "condicao-livre").
          linhas.push(`Não recebeu ${itensEvitaveis[idx].label}`);
        }
        continue;
      }
      // Acúmulos Aleatórios (ver campoCondicaoAplicada > acumulosFormula,
      // ex: Sutra da Lâmina Carmesim - "1d4") - rola de verdade AQUI, no
      // momento de aplicar EM CADA alvo, com o resultado auditável no
      // chat (dado rolado e fórmula, não só o total).
      let acumulosFinal = c.acumulos;
      if (c.acumulosFormula) {
        const rollAcumulos = await new Roll(c.acumulosFormula).evaluate();
        if (game.dice3d) await game.dice3d.showForRoll(rollAcumulos, game.user, true);
        acumulosFinal = Math.max(1, rollAcumulos.total);
        linhas.push(`Acúmulos: ${naurenRollToBreakdownText(rollAcumulos)} = ${acumulosFinal}`);
      }
      // Imunidade (M08): a linha vai no card do ataque, com a fonte, em vez de um card à parte.
      {
        const origemImu = await fromUuid(c.uuid.startsWith("self:") ? (naurenResolverSelf(c.uuid, actor) || c.uuid) : c.uuid).catch(() => null);
        const imu = origemImu?.type === "condicao" ? this.imunidadeA(actor, origemImu) : null;
        if (imu) { linhas.push(`Imune a ${imu.nome} (${imu.fonte})`); continue; }
      }
      const nomeAplicado = await this.aplicarCondicao(actor, c.uuid, acumulosFinal, null, c.rankParaCondicao, c.duracaoExtra ?? 0, c.custoParaRemoverRecurso ?? "", c.custoParaRemoverQuantidade ?? "1", c.overrideFormulaEfeitoPeriodico ?? "", p.atacanteTokenUuid ?? "", 0, c.forcarMaximoEfeitoPeriodico ?? false, c.flagsExtras ?? null);
      if (nomeAplicado) {
        // O que a Condição faz, em poucas palavras (ex.: "Recebeu Conspirado (Defesa -2, Poder de Ataque +2)").
        let oQueFaz = "";
        try {
          const condNoAlvo = actor.items.find(i => i.type === "condicao" && nomeAplicado.startsWith(i.name));
          const r = condNoAlvo ? resumoEfeito(condNoAlvo.system) : "";
          if (r && r !== "Sem bônus definidos" && !r.includes("@") && r.length <= 70) oQueFaz = ` (${r}${condNoAlvo.system.acumulativel && (condNoAlvo.system.acumulos ?? 1) > 1 ? " por acúmulo" : ""})`;
        } catch (err) { oQueFaz = ""; }
        linhas.push(`Recebeu ${nomeAplicado}${oQueFaz}`);
      }
    }

    // Conceder Habilidade ao Alvo (ver campoAcao > concederHabilidadeAoAlvoUuid,
    // ex: Matilha, Druida - "um aliado seu recebe [a habilidade] de sua
    // forma") - concede uma cópia da Habilidade indicada DIRETO neste
    // alvo, reaproveitando o mesmo histórico/reversão de qualquer outra
    // concessão do sistema. Diferente de Condições Aplicadas acima: não
    // depende de acerto nem gera Prioridade, e não se desfaz sozinho -
    // remova manualmente quando não fizer mais sentido (ex: ao desativar
    // a Forma). "itemQueConcedeUuid" resolve pro Item de origem, já que
    // este método é estático (sem acesso a "item" por closure).
    if (p.concederHabilidadeAoAlvoUuid) {
      const itemQueConcede = p.itemQueConcedeUuid ? await fromUuid(p.itemQueConcedeUuid).catch(() => null) : null;
      if (itemQueConcede) {
        const concedida = await NaurenConcessaoHelper.concederItem(actor, itemQueConcede, `acao:${p.nomeAcao}`, p.concederHabilidadeAoAlvoUuid);
        if (concedida && p.concederHabilidadeDuracao === "cena") await concedida.setFlag("nauren", "concessaoExpiraEm", "cena").catch(() => {});
        if (concedida) linhas.push(`Recebeu ${concedida.name}${p.concederHabilidadeDuracao === "cena" ? " (até o fim do combate)" : ""}`);
      }
    }

    // 0.94.3: efeitos simples no alvo (só se a Ação não for ataque ou se acertou).
    if (p.efeitosNoAlvo && (!p.houveAtaque || algumEventoAcertouDeVerdade)) {
      const chaveUV = p.efeitosNoAlvo.efeitos.find(e => e?.umaVezChave)?.umaVezChave;
      const recusaUV = chaveUV ? naurenUmaVezRecusa(actor, chaveUV, p.efeitosNoAlvo.fonte) : "";
      if (recusaUV) linhas.push(recusaUV);
      else {
        if (chaveUV) await naurenUmaVezMarcar(actor, chaveUV);
        for (const ef of p.efeitosNoAlvo.efeitos) {
          try { linhas.push(await naurenAplicarEfeitoSimples(actor, ef, { fonte: p.efeitosNoAlvo.fonte })); }
          catch (err) { console.error("Nauren RPG | efeito no alvo", err); linhas.push(`${p.efeitosNoAlvo.fonte}: erro (${err.message})`); }
        }
      }
    }
    // 0.94.1: Frasco - benefícios, colateral (com Perfume, se der), tudo em linhas do card.
    if (p.frasco) {
      try { linhas.push(...await naurenProcessarFrascoNoAlvo(actor, p.frasco)); }
      catch (err) { console.error("Nauren RPG | Frasco", err); linhas.push(`Frasco: erro ao aplicar (${err.message})`); }
    }

    // Movimento forçado: decide se o alvo resistiu (Prioridade ou custo) e só
    // então empurra/puxa. "Mover cada alvo" (mapa) é feito por quem usou a
    // Ação, depois de todos os alvos reagirem, lendo "movimentoPermitido".
    let movimentoEvitado = false, usouPrioridadeContraMovimento = false;
    const ataqueValeu = algumEventoAcertouDeVerdade && !pulouPorPrioridade;
    const idxMov = itensEvitaveis.findIndex(e => e.tipo === "movimento");
    if (idxMov !== -1 && evitados.has(idxMov) && acertou && ataqueValeu) {
      const itMov = itensEvitaveis[idxMov], modoMov = evitados.get(idxMov);
      const nomeRec = RECURSOS_ALVO[itMov.recurso] ?? itMov.recurso;
      if (modoMov === "livre") {
        movimentoEvitado = true;
        linhas.push(`Não foi ${itMov.verbo} (decisão do jogador/Mestre)`);
      } else if (modoMov === "custo") {
        if (this._podePagar(actor, itMov.recurso, itMov.quantidade)) {
          await this._aplicarRecursoNoAlvo(actor, itMov.recurso, itMov.quantidade);
          movimentoEvitado = true;
          linhas.push(`Gastou ${itMov.quantidade} ${nomeRec} para não ser ${itMov.label}`);
        } else linhas.push(`Não tinha ${nomeRec} para resistir: foi ${itMov.verbo}`);
      } else if (modoMov === "prioridade") {
        if (itMov.bloqueadoPor) linhas.push(`Não pôde usar a Prioridade contra o movimento (${itMov.bloqueadoPor})`);
        else if (NaurenAlvoHelper.REACOES_QUE_USAM_PRIORIDADE.has(reacaoPrimeiroEvento)) linhas.push(`A Prioridade já foi usada na reação: não deu para evitar ser ${itMov.label}`);
        else {
          movimentoEvitado = true;
          usouPrioridadeContraMovimento = true;
          linhas.push(`Usou a Prioridade para não ser ${itMov.label}`);
        }
      }
    }
    const movimentoPermitido = ataqueValeu && !movimentoEvitado;

    // Empurrar ao Acertar - DEPOIS da reação do alvo (livro: a Prioridade
    // vem antes dos efeitos). Não empurra se o ataque foi evitado (Bloqueio/
    // Esquiva com sucesso), se o alvo usou a Prioridade para sair, ou se
    // escolheu não ser empurrado. Move o TOKEN (precisa do tokenDoc). Prefere
    // o centro do Template (empurrarOrigemPonto) - senão o token de quem atacou.
    const origemEmpurrao = p.empurrarOrigemPonto ?? p.atacanteTokenUuid;
    // 0.94.2: "não pode ser empurrado nem movido contra a vontade" (Botas do Inventor: Âncora).
    const ancora = p.empurrarMetros ? actor.items.find(i => ["condicao", "habilidade", "efeito"].includes(i.type) && i.system.ativo !== false && i.system.imuneMovimentoForcado && !naurenEhCondicaoModelo(i)) : null;
    if (ancora && acertou && movimentoPermitido) linhas.push(`Não foi ${p.empurrarDirecao === "puxar" ? "puxado" : "empurrado"} (${ancora.name})`);
    if (!ancora && acertou && movimentoPermitido && p.empurrarMetros && origemEmpurrao && tokenDoc) {
      const mov = await naurenEmpurrarToken(tokenDoc, origemEmpurrao, p.empurrarMetros, p.empurrarDirecao)
        .catch(err => { console.warn("Nauren RPG | Falha ao empurrar o token.", err); return null; });
      if (mov) {
        const verbo = p.empurrarDirecao === "puxar" ? "Puxado" : "Empurrado";
        linhas.push(`${verbo} ${mov.metrosMovidos}m${mov.metrosMovidos < mov.metrosPedidos ? ` (de ${mov.metrosPedidos}m)` : ""}`);
        if (mov.colidiuCom && p.empurrarColisaoDano) {
          const jaSomada = p.empurrarColisaoJaSomada;
          let rollColisao = null;
          if (!jaSomada) {
            try { rollColisao = await new Roll(String(p.empurrarColisaoDano).replace(/@dadoDano\b/gi, "1d6")).evaluate(); } catch (err) { rollColisao = null; }
          }
          if (jaSomada || rollColisao) {
            const danoColisao = jaSomada ? jaSomada.valor : Math.max(0, rollColisao.total);
            const textoColisao = jaSomada ? jaSomada.texto : `${naurenFormulaParaTexto(p.empurrarColisaoDano)} → ${naurenTextoRolagem(rollColisao)}`;
            const com = mov.colidiuCom === "parede" ? "parede" : naurenNomeDeToken(mov.colidiuCom);
            if (jaSomada) {
              linhas.push(`Colidiu com ${com} (+${danoColisao} já somado ao dano do ataque)`);
            } else {
              const vidaAntes = actor.system.vida?.value ?? 0;
              await actor.update({ "system.vida.value": Math.max(0, vidaAntes - danoColisao) });
              linhas.push(`Colidiu com ${com}: ${danoColisao} de dano (${textoColisao})`);
            }
            // "Ambos sofrem" (ex.: Chute do Nascer do Sol): o personagem atingido também.
            if (p.empurrarColisaoAmbos && mov.colidiuCom !== "parede" && mov.colidiuCom?.actor) {
              const outro = mov.colidiuCom.actor;
              const executor = NaurenAlvoHelper.usuarioExecutor(outro);
              const dadosColisao = { actorUuid: outro.uuid, dano: danoColisao, texto: `${textoColisao} (atingido por ${actor.name})`, origemNome: actor.name };
              if (executor?.id === game.user.id) await naurenHandleQueryDanoColisao(dadosColisao);
              else if (executor) await executor.query(NAUREN_QUERY_DANO_COLISAO, dadosColisao, { timeout: 20000 }).catch(() => null);
              linhas.push(`${com} também sofreu ${danoColisao} de dano`);
            }
          }
        }
      }
    }


    // 9) Dar Prioridade - sem
    // dano/cura/ataque nenhum: só narra bonito e dispara o Gatilho por
    // Evento "recebeuPrioridade" NESTE ator (o alvo que a recebeu), pra
    // que uma Habilidade dele reaja automaticamente (ex: ganhar Estamina).
    if (p.escudoNoAlvo?.valor > 0) {
      await actor.update({ "system.escudo.value": p.escudoNoAlvo.valor, "system.escudo.max": p.escudoNoAlvo.valor });
      if (p.escudoNoAlvo.expira) await actor.setFlag("nauren", "escudoExpira", p.escudoNoAlvo.expira); else await actor.unsetFlag("nauren", "escudoExpira");
      linhas.push(`Recebeu um escudo de ${p.escudoNoAlvo.valor}${p.escudoNoAlvo.texto ?? ""}`);
    }
    if (p.darPrioridade) {
      linhas.push(`Recebeu Prioridade de ${p.atacante}`);
      if (tokenDoc?.uuid) naurenMotionEmTodos("prioridade", { token: tokenDoc.uuid });
      (naurenMovimentoSaldo.delete(actor.uuid), naurenProcessarGatilhos("recebeuPrioridade", actor))
        .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (recebeu Prioridade).", err));
    }

    // Execução (M15, ex.: Sentença Incolor): depois do dano, se a Vida ficou baixa demais, cai a 0.
    if (acertou && (p.limiarExecucao ?? 0) > 0 && danoAplicado > 0) {
      // Lê a ficha atual do token (a referência pode ter ficado para trás depois das reações).
      const alvoAtual = tokenDoc?.actor ?? actor;
      const vidaAgora = alvoAtual.system.vida?.value ?? 0;
      if (vidaAgora > 0 && vidaAgora <= p.limiarExecucao) {
        await this.atualizarAtorSeguro(alvoAtual, { "system.vida.value": 0 }, { naurenOrigemCombate: true });
        const vidaDepois = (tokenDoc?.actor ?? alvoAtual).system.vida?.value ?? 0;
        if (vidaDepois > 0) console.warn(`Nauren RPG | Execução: "${alvoAtual.name}" deveria ir a 0, mas ficou com ${vidaDepois}.`);
        linhas.push(`Execução: a Vida ficou no limite de ${p.limiarExecucao} ou abaixo e foi a 0`);
      }
    }
    return { alvo: actor.name, acertou, linhas, danoAplicado, curaAplicada, curaRecebida, ajusteAtaque: ajusteAtaqueRecebido, usouDanoMaximo: usouDanoMaximoMargem,
      ataqueValeu, movimentoPermitido: acertou && movimentoPermitido, movimentoEvitado, usouPrioridadeContraMovimento,
      movimentoModo: movimentoEvitado ? (evitados.get(idxMov) ?? "") : "",
      // 0.94.16: para o movimento dos tokens (Motion): reação escolhida e se evitou o ataque todo.
      reacao: reacaoPrimeiroEvento, evitou: !!p.houveAtaque && !algumEventoAcertouDeVerdade,
      vidaMax: actor.system.vida?.max ?? 0 };
  }

  /**
   * Popup ÚNICO de reação: combina a reação a dano (Bloquear/Esquivar/
   * Estresse/Cheio, Capítulo III) com a chance de pagar um custo pra evitar
   * cada Condição/Gasto de Recurso marcado como "perguntarParaEvitar" - tudo
   * numa única janela, nunca duas seguidas. Bloquear/Esquivar só aparecem se
   * HOUVE teste de ataque (não fazem sentido pra dano de área sem ataque);
   * Estresse/Cheio aparecem sempre que há dano, com ou sem ataque.
   */
  /**
   * Nome da Query usada pra pedir a um Mestre REMOTO que também mostre o
   * MESMO popup de reação (ver comentário completo em "_popupReacao"
   * logo abaixo).
   */
  static QUERY_NOME_POPUP = "nauren.mostrarPopupReacaoRemoto";

  /** Registrado em CONFIG.queries no init - roda no cliente REMOTO que recebe o pedido de mostrar o popup. */
  static async handleQueryPopup({ actorUuid, p, opts, pedidoId, executorId }) {
    const actor = await fromUuid(actorUuid).catch(() => null);
    if (!actor) return { _perdeuCorrida: true };
    return NaurenAlvoHelper._mostrarDialogPopupReacao(actor, p, opts, pedidoId, executorId);
  }

  /**
   * Coordenação entre vários Mestres SEM gravar nada na ficha (a marca antiga no Ator falhava em
   * monstros não vinculados): quem processa o ataque guarda o pedido na memória; cada janela pede a
   * vez ao confirmar; só o primeiro ganha; as outras janelas fecham sozinhas.
   */
  static QUERY_REIVINDICAR = "nauren.reivindicarPedidoReacao";
  static QUERY_FECHAR_PEDIDO = "nauren.fecharPedidoReacao";
  static _pedidosReacao = new Map();   // só em quem processa: pedidoId -> { vencedor, gms: [ids] }
  static _fecharJanela = new Map();    // em cada tela: pedidoId -> fecha a janela local

  static _reivindicarLocal(pedidoId, userId) {
    const pedido = this._pedidosReacao.get(pedidoId);
    if (!pedido || pedido.vencedor) return false;
    pedido.vencedor = userId;
    // Fecha as janelas das outras telas (e a minha, se não fui eu).
    for (const id of pedido.gms) {
      if (id === userId) continue;
      if (id === game.user.id) this._fecharJanela.get(`${pedidoId}:${game.user.id}`)?.();
      else game.users.get(id)?.query(this.QUERY_FECHAR_PEDIDO, { pedidoId }, { timeout: 10000 }).catch(() => {});
    }
    return true;
  }
  static async handleQueryReivindicar({ pedidoId, userId }) { return { ok: NaurenAlvoHelper._reivindicarLocal(pedidoId, userId) }; }
  static async handleQueryFecharPedido({ pedidoId }) { NaurenAlvoHelper._fecharJanela.get(`${pedidoId}:${game.user.id}`)?.(); return { ok: true }; }
  static async _pedirVez(pedidoId, executorId) {
    if (executorId === game.user.id) return this._reivindicarLocal(pedidoId, game.user.id);
    const exec = game.users.get(executorId);
    if (!exec?.active) return false;
    try { return !!(await exec.query(this.QUERY_REIVINDICAR, { pedidoId, userId: game.user.id }, { timeout: 15000 }))?.ok; } catch (err) { return false; }
  }

  /**
   * Coordena o popup de reação entre TODOS os Mestres ativos (não só um
   * escolhido arbitrariamente) - antes disso, com 2+ Mestres conectados,
   * o popup só aparecia pro Mestre que por acaso vinha primeiro na lista
   * interna do Foundry, mesmo que outro estivesse de fato controlando a
   * cena/token naquele momento.
   *
   * Importante: só a DECISÃO do popup é compartilhada - o resto do
   * processamento (aplicar dano, Gatilhos, Roubar Recurso, Empurrar etc.)
   * continua rodando uma ÚNICA vez, no cliente executor original (ver
   * aplicarEmAlvo) - nunca duplicado, mesmo com vários Mestres online.
   *
   * Mecânica: marca uma flag temporária no Ator ("popupPedidoAtivo") com
   * um ID único, dispara o MESMO popup aqui (local) e, em paralelo, pede
   * pra cada outro Mestre ativo mostrar o dele também (via Query). O
   * primeiro a confirmar reivindica a flag (unsetFlag) - essa mudança já
   * propaga sozinha pra todo cliente via updateActor nativo do Foundry, e
   * cada instância do popup que ainda estiver aberta se fecha sozinha ao
   * perceber isso (ver "_mostrarDialogPopupReacao").
   */
  /**
   * Resolve, com ROLAGEM DE VERDADE (assíncrona, segura AQUI - o popup só
   * é montado 1x por reação, nunca dentro de prepareDerivedData, que
   * roda a cada render e por isso NUNCA pode ter dado de verdade), todo
   * bônus de dado (ex: "1d4") vindo de um Efeito Vinculado ATIVO no campo
   * pedido (ex: "bloqueio", "esquiva") - o valor síncrono normal da ficha
   * já soma corretamente qualquer bônus SEM dado (fórmula "1d4" nele vira
   * 0 silenciosamente, ver Defesa Atacante), então aqui só nos interessam
   * os modificadores cuja fórmula (já com @token resolvido, "porRank"
   * aplicado) contém "NdM" de verdade. Devolve o total rolado e uma lista
   * de textos "Nome do Item 1d4(3)" pra mostrar no popup.
   */
  static async _resolverBonusComDadoPopup(actor, campoModificador) {
    let total = 0;
    const partes = [];
    // "contraAtaque" não é somado na ficha, então aqui valem também os números fixos.
    const aceitaNumero = campoModificador === "contraAtaque";
    const rolar = async (mod, item) => {
      if (mod.campo !== campoModificador) return;
      const valorPorRank = naurenResolverPorRank(mod.porRank, item.system.rankAtual, "valor");
      const valorBruto = valorPorRank ?? mod.valor;
      const preparado = naurenPrepararModificador(valorBruto, actor, item);
      if (!preparado) return;
      const temDado = /\d+d\d+/i.test(preparado.bruto);
      if (!temDado && !aceitaNumero) return;
      try {
        const roll = await new Roll(preparado.bruto).evaluate();
        total += Math.round(roll.total);
        partes.push(temDado ? `${item.name} ${preparado.bruto}(${roll.total})` : `${item.name} ${roll.total >= 0 ? "+" : ""}${roll.total}`);
      } catch (err) {
        console.warn(`Nauren RPG | Popup de reação: falha ao rolar bônus "${preparado.bruto}" de "${item.name}".`, err);
      }
    };
    for (const item of actor.items) {
      for (const efeito of (item.system.efeitosVinculados ?? [])) {
        if (!efeito.ativo) continue;
        for (const mod of (efeito.modificadores ?? [])) await rolar(mod, item);
      }
      // Modificadores diretos de Habilidade/Magia (ex.: Defesa Atacante, só em Guarda Defensiva).
      if ((item.type === "habilidade" || item.type === "magia") && item.system.ativo && item.system.modificadores?.length
        && !(item.system.modificadoresSoComEstado && !naurenTemEstado(actor, item.system.modificadoresSoComEstado)))
        for (const mod of item.system.modificadores) await rolar(mod, item);
      // Efeitos e Condições ativos.
      if ((item.type === "efeito" && item.system.ativo) || (item.type === "condicao" && item.system.ativo !== false))
        for (const mod of (item.system.modificadores ?? [])) await rolar(mod, item);
    }
    return { total, partes };
  }


  static async _popupReacao(actor, p, opts) {
    // BUG CORRIGIDO: a checagem antiga só olhava se EXISTIAM outros
    // Mestres ativos, mas nunca se EU MESMO (quem está processando esta
    // reação agora) sou Mestre - isso fazia o popup ser enviado TAMBÉM
    // pro Mestre mesmo quando o dono de verdade do alvo é um JOGADOR
    // (cenário mais comum: Mestre ataca a ficha de um jogador, e o
    // popup de reação aparecia errado na tela do Mestre também, além da
    // do jogador dono). A coordenação entre vários Mestres só faz
    // sentido quando EU mesmo sou Mestre processando isso (ex: um NPC
    // sem dono jogador, que qualquer Mestre online pode processar).
    // Vários Mestres: a janela de um NPC (sem dono jogador online) abre em TODOS os Mestres ativos;
    // o primeiro que confirmar vale e as outras fecham (coordenação na memória, sem gravar na ficha).
    const temDonoJogador = game.users.some(u => u.active && !u.isGM && actor.testUserPermission(u, "OWNER"));
    // Todos os Mestres online recebem a janela, inclusive uma tela marcada como parada (se ela acordar,
    // a janela aparece lá também). Quem entrar depois recebe as janelas ainda abertas (ver "userConnected").
    const outrosGMs = (game.user.isGM && !temDonoJogador) ? game.users.filter(u => u.active && u.isGM && u.id !== game.user.id) : [];
    const mestreProcessandoNPC = game.user.isGM && !temDonoJogador;
    if (!outrosGMs.length && !mestreProcessandoNPC) {
      // Sou o dono jogador (ou Mestre com um jogador dono online) - comportamento
      // idêntico ao de antes desta correção, sem overhead nenhum.
      const resultado = await this._mostrarDialogPopupReacao(actor, p, opts);
      return resultado._perdeuCorrida ? { reacaoDano: "cheio", reacaoCura: "aceitar", removerCondicaoOuEstresse: "", evitados: [], ajusteBloqueio: 0, ajusteEsquiva: 0, ajusteEsquivaInstintiva: 0, armaContraAtaqueId: null, acaoContraAtaqueIndex: null } : resultado;
    }

    const pedidoId = foundry.utils.randomID();
    const pedido = { vencedor: null, gms: [game.user.id, ...outrosGMs.map(u => u.id)] };
    this._pedidosReacao.set(pedidoId, pedido);

    // Só resolve/rejeita de verdade quando alguém GANHA a corrida -
    // "_perdeuCorrida" faz a promise REJEITAR de propósito, pra
    // a corrida pular ela e continuar esperando as outras.
    const comoVencedora = (promise) => promise.then(r => {
      if (r?._perdeuCorrida) throw new Error("perdeu a corrida do popup");
      return r;
    });
    // Corrida que aceita participantes novos: um Mestre que entra no meio também recebe a janela.
    let ganhar, todosPerderam, pendentes = 0;
    const corrida = new Promise((res, rej) => { ganhar = res; todosPerderam = rej; });
    const entrar = (promessa) => {
      pendentes++;
      comoVencedora(promessa).then(ganhar, () => { pendentes--; if (pendentes === 0 && !pedido.vencedor) todosPerderam(new Error("ninguém respondeu")); });
    };
    pedido.adicionarMestre = (gm) => {
      if (pedido.vencedor || pedido.gms.includes(gm.id)) return;
      pedido.gms.push(gm.id);
      entrar(gm.query(this.QUERY_NOME_POPUP, { actorUuid: actor.uuid, p, opts, pedidoId, executorId: game.user.id }, { timeout: 125000 }));
    };
    entrar(this._mostrarDialogPopupReacao(actor, p, opts, pedidoId, game.user.id));
    for (const gm of outrosGMs) entrar(gm.query(this.QUERY_NOME_POPUP, { actorUuid: actor.uuid, p, opts, pedidoId, executorId: game.user.id }, { timeout: 125000 }));

    let resultado;
    try {
      resultado = await corrida;
    } catch (err) {
      // Todo mundo "perdeu" (caso raríssimo de condição de corrida onde
      // ninguém reivindicou a tempo) ou todas as Queries falharam - cai
      // no padrão seguro (dano cheio) em vez de travar o combate.
      console.warn("Nauren RPG | Popup de reação: ninguém respondeu a tempo em nenhum cliente - aplicando dano cheio.", err);
      resultado = { reacaoDano: "cheio", reacaoCura: "aceitar", removerCondicaoOuEstresse: "", evitados: [], ajusteBloqueio: 0, ajusteEsquiva: 0, ajusteEsquivaInstintiva: 0, armaContraAtaqueId: null, acaoContraAtaqueIndex: null };
    } finally {
      // Garantia final: limpa a flag mesmo se, por algum motivo, ninguém
      // tiver reivindicado formalmente (evita deixar lixo que travaria um
      // próximo popup nesse mesmo Ator vendo a flag como "já em uso").
      // Fecha qualquer janela que ainda esteja aberta (ex.: ninguém respondeu) e esquece o pedido.
      const ped = this._pedidosReacao.get(pedidoId);
      if (ped && !ped.vencedor) { ped.vencedor = "ninguem"; for (const id of ped.gms) { if (id === game.user.id) this._fecharJanela.get(`${pedidoId}:${game.user.id}`)?.(); else game.users.get(id)?.query(this.QUERY_FECHAR_PEDIDO, { pedidoId }, { timeout: 10000 }).catch(() => {}); } }
      this._pedidosReacao.delete(pedidoId);
    }
    return resultado;
  }

  /**
   * Só a parte de MONTAR/MOSTRAR o Dialog e ler a escolha (sem nenhuma
   * coordenação entre clientes) - roda tanto no cliente EXECUTOR quanto,
   * remotamente, em qualquer outro Mestre também online (ver
   * "_popupReacao" logo abaixo, que orquestra os dois casos).
   *
   * "pedidoId" (opcional): quando presente, isso faz parte de um popup
   * compartilhado entre vários Mestres - registra um Hook temporário que
   * fecha ESTE Dialog sozinho se outro cliente já resolveu o mesmo
   * pedido (a flag "popupPedidoAtivo" no Ator muda/some), e ao confirmar,
   * só aceita a escolha se ESTE cliente for o primeiro a reivindicar o
   * pedido (evita duas respostas "vencendo" ao mesmo tempo).
   */
  /**
   * Esquiva Instintiva (Ladino) - devolve null se o Ator não tiver a
   * Habilidade, ou { item, acaoIndex, usosRestantes, usosMax } - mesmo
   * padrão de _espiritoDeBatalhaInfo, mas ESTÁTICO e recebendo "actor"
   * por parâmetro (chamado de dentro de _mostrarDialogPopupReacao, que
   * roda pro Ator que está DEFENDENDO, não necessariamente o "this.actor"
   * de quem abriu a ficha).
   */
  static _esquivaInstintivaInfo(actor) {
    const item = actor.items.find(i => i.type === "habilidade" && (naurenEhItem(i, "Esquiva Instintiva") || (i.system.acoes ?? []).some(a => a.nome?.includes("Esquivas Instintivas"))) && (i.system.acoes ?? []).some(a => a.usaUsos && a.usosReset === "turno"));
    if (!item) return null;
    const acaoIndex = (() => { const k = item.system.acoes.findIndex(a => a.nome?.includes("Esquivas Instintivas")); return k >= 0 ? k : item.system.acoes.findIndex(a => a.usaUsos && a.usosReset === "turno"); })();
    const acao = item.system.acoes[acaoIndex];
    const nivelAtor = actor.system.nivel || 1;
    const usosMaxPorNivel = naurenResolverPorNivel(acao.usosMaxPorNivel, nivelAtor, "valor");
    const usosMax = usosMaxPorNivel !== null ? usosMaxPorNivel : (acao.usosMax ?? 1);
    // "usosReset: turno" só bloqueia/desconta fora de combate ativo (ver
    // NaurenActorSheet#_atorEstaEmCombateAtivo, mesma lógica repetida
    // aqui pois este é um método ESTÁTICO recebendo "actor" à parte, não
    // "this.actor" de uma ficha).
    const emCombate = !!(game.combat?.combatants?.some(c => c.actor?.id === actor.id));
    return { item, acaoIndex, usosRestantes: acao.usosAtual ?? 0, usosMax, emCombate };
  }

  static async _mostrarDialogPopupReacao(actor, p, { mostrarReacaoDano, itensEvitaveis, mostrarReacaoCura, opcoesRemover, fase }, pedidoId = null, executorId = null) {
    // Duas fases (resolução simultânea do livro): "reacao" = só a resposta (Bloquear/Esquivar/Contra-Atacar...), sem Estresse
    // nem Condições evitáveis; "consequencia" = depois das rolagens, decide Estresse/dano e paga para evitar Condições.
    // Sem "fase" = popup antigo completo (usado onde não há reação a ataque).
    const ehConsequencia = fase === "consequencia", ehReacao = fase === "reacao";
    const estamina = actor.system.estaminaCombate?.value ?? 0;
    const stressAtual = actor.system.stress?.value ?? 0;
    const stressMax = actor.system.stress?.max ?? 2;
    const bloqueioBonus = actor.system.bloqueioBonusTotal ?? 0;
    const esquivaBonus = actor.system.esquivaBonusTotal ?? 0;
    // Bônus de DADO vindos de Efeito Vinculado ativo (ex: "Defesa
    // Atacante" +1d4 em Bloqueio) - resolvidos com rolagem de VERDADE
    // aqui (só roda 1x, na montagem deste popup - seguro, diferente de
    // dentro de prepareDerivedData). O valor síncrono da ficha (acima)
    // já soma corretamente qualquer bônus SEM dado.
    const bloqueioDado = await this._resolverBonusComDadoPopup(actor, "bloqueio");
    const esquivaDado = await this._resolverBonusComDadoPopup(actor, "esquiva");
    // Ver NaurenAlvoHelper#_bonusDefesaContraAtacante - ex: Reflexos de
    // Caça (Caçador). Mostrado aqui já somado, pro jogador ver o valor
    // real antes de escolher Bloquear/Esquivar.
    const bonusReflexosBloqueio = await NaurenAlvoHelper._bonusDefesaContraAtacante(actor, p.atacanteTokenUuid, "bloqueio");
    const bonusReflexosEsquiva = await NaurenAlvoHelper._bonusDefesaContraAtacante(actor, p.atacanteTokenUuid, "esquiva");
    const bloqueio = (actor.system.defesaTotal ?? 10) + (actor.system.vitalidade?.max ?? 0) + bloqueioBonus + bloqueioDado.total + bonusReflexosBloqueio;
    const esquivaBonusFinal = esquivaBonus + esquivaDado.total + bonusReflexosEsquiva;
    const bloqueioDetalhe = bloqueioDado.partes.length ? ` (${bloqueioDado.partes.join(", ")})` : "";
    const esquivaDetalhe = esquivaDado.partes.length ? ` (${esquivaDado.partes.join(", ")})` : "";

    let htmlReacao = "";
    if (ehConsequencia && mostrarReacaoDano) {
      const danoAgora = Math.max(0, Number(p.danoAtual) || 0);
      const opcoesC = [];
      if (danoAgora > 0 && stressAtual < stressMax) opcoesC.push(`<label class="nauren-popup-opt"><input type="radio" name="reacaoDano" value="estresse"><span>Tomar Estresse (+1) — o dano cai para ${Math.floor(danoAgora / 2)}</span></label>`);
      else if (danoAgora > 0) opcoesC.push(`<p class="nauren-popup-nota"><i class="fas fa-ban"></i> Estresse no máximo (${stressAtual}/${stressMax}): não dá para reduzir este dano.</p>`);
      opcoesC.push(`<label class="nauren-popup-opt"><input type="radio" name="reacaoDano" value="cheio" checked><span>Receber o dano (${danoAgora})</span></label>`);
      opcoesC.push(`<label class="nauren-popup-opt"><input type="radio" name="reacaoDano" value="sem-dano"><span>Não tomar Dano</span></label>`);
      opcoesC.push(`
        <div class="nauren-popup-opt-row" style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #453e66;">
          <label style="flex: 1;">Ajuste no dano final (+/- direto no dano, depois de tudo)</label>
          <input type="text" name="ajusteDanoFinal" value="0" class="nauren-popup-ajuste" title="Positivo aumenta o dano, negativo reduz - some depois de toda reação já calculada. Aceita dado (ex: 1d4)">
        </div>`);
      htmlReacao = `<fieldset class="nauren-popup-group"><legend>Dano a receber</legend>${p.resumoReacao ? `<p class="nauren-popup-nota">${p.resumoReacao}</p>` : ""}${opcoesC.join("")}</fieldset>`;
    } else if (mostrarReacaoDano) {
      const opcoes = [];
      // Ação que não gera Prioridade (ex.: Condemnatio com penitência): Bloquear, Esquivar e Contra-Atacar
      // só existem dentro de uma Prioridade (livro), então não aparecem.
      if (p.semPrioridade) opcoes.push(`<p class="nauren-popup-nota"><i class="fas fa-ban"></i> ${p.semPrioridadeFonte ? `${p.semPrioridadeFonte}: ` : ""}esta Ação não gera Prioridade. Sem Bloquear, Esquivar ou Contra-Atacar.</p>`);
      if (!p.houveAtaque && !p.ehSustentacao && !p.semPrioridade) {
        opcoes.push(`
          <div class="nauren-popup-opt-row">
            <label class="nauren-popup-opt" title="Ação Anunciada: você recebe Prioridade antes dos efeitos. Usando-a (ex.: para sair da área), não recebe o dano nem as Condições desta Ação."><input type="radio" name="reacaoDano" value="usarPrioridade"><span>Usar minha Prioridade — agir antes do efeito (não recebe o dano nem as Condições desta Ação)</span></label>
          </div>`);
      }
      // Bloquear, Esquivar e Contra-Atacar custam 1 Estamina; Esquiva Instintiva (usos por turno) e a
      // Esquiva da Postura Gruhua (Energia) não, então aparecem mesmo com 0 de Estamina.
      const temEstReacao = estamina >= 1;
      if (p.houveAtaque && !p.semPrioridade && !temEstReacao) {
        opcoes.push(`<p class="nauren-popup-nota"><i class="fas fa-battery-empty"></i> Sem Estamina: Bloquear, Esquivar e Contra-Atacar (1 Est) indisponíveis.</p>`);
      }
      if (p.houveAtaque && !p.semPrioridade) {
        // Cada opção mostra um campo numérico ao lado pra ajustar o
        // TESTE na hora (ex: usar uma Guarda Defensiva ou outra vantagem
        // situacional que ainda não virou um Efeito permanente) - some
        // POR CIMA de qualquer bônus/penalidade já persistente (Bônus
        // Manual/Efeito/Condição/Pigmento, já incluídos no número
        // mostrado aqui, dado de verdade incluso).
        if (temEstReacao) opcoes.push(`
          <div class="nauren-popup-opt-row">
            <label class="nauren-popup-opt"><input type="radio" name="reacaoDano" value="bloquear"><span>Bloquear (1 Est) — Bloqueio ${bloqueio}${bloqueioDetalhe}</span></label>
            <input type="text" name="ajusteBloqueio" value="0" class="nauren-popup-ajuste" title="Ajuste manual (+/-) só pra este Bloqueio - aceita dado (ex: 1d4)">
          </div>`);
        const temGruhua = actor.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Postura Gruhua") && i.system.ativo !== false) && ((actor.system.recursosCustom ?? []).find(r => r.id === "energia")?.valor ?? 0) >= 2;
        if (temEstReacao || temGruhua) opcoes.push(`
          <div class="nauren-popup-opt-row">
            ${temEstReacao ? `<label class="nauren-popup-opt"><input type="radio" name="reacaoDano" value="esquivar"><span>Esquivar (1 Est) — 1d20 + Agilidade${esquivaBonusFinal ? ` + ${esquivaBonusFinal}` : ""}${esquivaDetalhe}</span></label>` : ""}
            ${temGruhua ? `<label class="nauren-popup-opt"><input type="radio" name="reacaoDano" value="esquivar-energia"><span>Esquivar (2 Energia, Postura Gruhua) — mesma rolagem, sem Estamina</span></label>` : ""}
            <input type="text" name="ajusteEsquiva" value="0" class="nauren-popup-ajuste" title="Ajuste manual (+/-) só pra esta Esquiva - aceita dado (ex: 1d4)">
          </div>`);
        // Esquiva Instintiva (Ladino) - mesma rolagem de Esquivar, sem
        // custar Estamina, limitada a X usos por turno (reseta sozinha).
        const esquivaInstintivaInfo = NaurenAlvoHelper._esquivaInstintivaInfo(actor);
        if (esquivaInstintivaInfo) {
          const semUsos = esquivaInstintivaInfo.usosRestantes <= 0 && esquivaInstintivaInfo.emCombate;
          opcoes.push(`
            <div class="nauren-popup-opt-row"${semUsos ? ' style="opacity: 0.45;"' : ""}>
              <label class="nauren-popup-opt"><input type="radio" name="reacaoDano" value="esquiva-instintiva"${semUsos ? " disabled" : ""}><span>Esquiva Instintiva (${esquivaInstintivaInfo.usosRestantes}/${esquivaInstintivaInfo.usosMax} usos, sem custo) — 1d20 + Agilidade${esquivaBonusFinal ? ` + ${esquivaBonusFinal}` : ""}${esquivaDetalhe}</span></label>
              <input type="text" name="ajusteEsquivaInstintiva" value="0" class="nauren-popup-ajuste"${semUsos ? " disabled" : ""} title="Ajuste manual (+/-) só pra esta Esquiva - aceita dado (ex: 1d4)">
            </div>`);
        }
        // Contra-Atacar (correção): agora exige uma ARMA EQUIPADA de
        // verdade (com uma Ação de ataque configurada) - usa os atributos,
        // bônus de dano e fórmula de dano DAQUELA arma específica, igual a
        // um ataque normal (reaproveita o mesmo motor de rolagem). Só
        // aparece a opção se existir pelo menos 1 arma válida; com mais de
        // 1, mostra um seletor pra escolher qual usar.
        // Armas equipadas + habilidades e magias ativas que tenham Ação de ataque (NPCs costumam atacar por habilidade).
        const armasComAtaque = actor.items.filter(i =>
          ((i.type === "arma" && i.system.equipado) || ((i.type === "habilidade" || i.type === "magia") && i.system.ativo !== false))
          && (i.system.acoes ?? []).some(a => a.ehAtaque)
        ).sort((a, b) => (a.type === "arma" ? 0 : 1) - (b.type === "arma" ? 0 : 1));
        if (temEstReacao && p.atacanteTokenUuid && armasComAtaque.length) {
          // Cada <option> de arma leva "data-acoes" (JSON: [{idx, nome}])
          // com as Ações de ataque DELA, no ÍNDICE ORIGINAL (não o índice
          // pós-filtro) - o listener de render (mais abaixo) usa isso pra
          // repopular o segundo <select> sempre que a arma escolhida mudar.
          const acoesDaArma = (arma) => arma.system.acoes
            .map((a, idx) => ({ idx, nome: a.nome || `Ação ${idx + 1}`, ehAtaque: a.ehAtaque }))
            .filter(a => a.ehAtaque);
          const opcoesArma = armasComAtaque.map(a =>
            `<option value="${a.id}" data-acoes='${JSON.stringify(acoesDaArma(a)).replace(/'/g, "&#39;")}'>${a.name}${a.type === "arma" ? "" : ` · ${a.type === "magia" ? "magia" : "habilidade"}`}</option>`
          ).join("");
          const primeiraArma = armasComAtaque[0];
          const opcoesAcaoInicial = acoesDaArma(primeiraArma).map(a => `<option value="${a.idx}">${a.nome}</option>`).join("");
          opcoes.push(`
            <div class="nauren-popup-opt-row">
              <label class="nauren-popup-opt"><input type="radio" name="reacaoDano" value="contra-atacar"><span>Contra-Atacar (1 Est) com a arma ou habilidade:</span></label>
              <select name="armaContraAtaqueId" class="nauren-popup-ajuste" id="nauren-contra-arma-select">${opcoesArma}</select>
              <select name="acaoContraAtaqueIndex" class="nauren-popup-ajuste" id="nauren-contra-acao-select">${opcoesAcaoInicial}</select>
            </div>`);
        }
      }
      if (stressAtual < stressMax) {
        // Escudo de Mana: o escudo absorve o dano cheio; só o que passa dele cai pela metade.
        const semEstP = actor.getFlag?.("nauren", "escudoSemEstresse"), escP = actor.system?.escudo?.value ?? 0;
        const textoEstP = semEstP && escP > 0 && (actor.system.escudo?.max ?? 0) === semEstP.max
          ? `${semEstP.nome}: o escudo leva ${Math.min(escP, p.dano)} cheio, metade do resto (${Math.min(escP, p.dano) + Math.floor(Math.max(0, p.dano - escP) / 2)} no total)`
          : `metade do dano (${Math.floor(p.dano / 2)})`;
        opcoes.push(`<label class="nauren-popup-opt"><input type="radio" name="reacaoDano" value="estresse"><span>${ehReacao ? "Não reagir e tomar" : "Tomar"} Estresse (+1) — ${textoEstP}</span></label>`);
      }
      opcoes.push(`<label class="nauren-popup-opt"><input type="radio" name="reacaoDano" value="cheio" checked><span>${ehReacao ? "Não reagir — " : ""}Tomar o dano cheio (${p.dano})</span></label>`);
      opcoes.push(`<label class="nauren-popup-opt"><input type="radio" name="reacaoDano" value="sem-dano"><span>Não tomar Dano</span></label>`);
      // Caixa ÚNICA e geral de ajuste no DANO FINAL (some ou reduza,
      // mesmo campo pra ambos - número negativo reduz) - se aplica
      // independente de qual opção acima for escolhida, pensada pra
      // qualquer bônus/penalidade situacional que não se encaixe em
      // nenhuma reação específica (ex: uma Habilidade com dado de
      // redução de dano que você prefere calcular na mão).
      opcoes.push(`
        <div class="nauren-popup-opt-row" style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #453e66;">
          <label style="flex: 1;">Ajuste no dano final (+/- direto no dano, depois de tudo)</label>
          <input type="text" name="ajusteDanoFinal" value="0" class="nauren-popup-ajuste" title="Positivo aumenta o dano, negativo reduz - some depois de toda reação já calculada. Aceita dado (ex: 1d4)">
        </div>`);
      // Fase 6 (P): Condições ativas podem proibir Bloqueio/Esquiva (ex.: Juramentos).
      const proibindo = actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && (i.system.proibeBloqueio || i.system.proibeEsquiva || i.system.proibeContraAtaque));
      const proibeBloqueio = proibindo.some(i => i.system.proibeBloqueio) || !!p?.ignoraBloqueio || !!p?.apenasContraAtaque;
      const proibeEsquiva = proibindo.some(i => i.system.proibeEsquiva) || !!p?.apenasContraAtaque;
      const proibeContra = proibindo.some(i => i.system.proibeContraAtaque);
      const opcoesPermitidas = opcoes.filter(o => !(proibeBloqueio && o.includes('value="bloquear"')) && !(proibeEsquiva && (o.includes('value="esquivar"') || o.includes('value="esquivar-energia"') || o.includes('value="esquiva-instintiva"'))) && !(proibeContra && o.includes('value="contra-atacar"')));
      const notaProibicao = proibindo.length ? `<p class="nauren-popup-nota"><i class="fas fa-ban"></i> ${[proibeBloqueio && "Bloqueio", proibeEsquiva && "Esquiva", proibeContra && "Contra-Ataque"].filter(Boolean).join(", ").replace(/, ([^,]*)$/, " e $1")} indisponível por: ${proibindo.map(i => i.name).join(", ")}</p>` : "";
      const notaDoisPassos = ehReacao && !p.semPrioridade ? `<p class="nauren-popup-nota"><i class="fas fa-circle-info"></i> Se você reagir (Bloquear, Esquivar, Contra-Atacar), o Estresse e o que evitar são decididos depois, já com o resultado da rolagem.</p>` : "";
      // Ataque sem dano nenhum (ex.: Roubar Destino): só faz sentido Bloquear/Esquivar/Contra-Atacar ou deixar acertar.
      const semDanoNoAtaque = !(Number(p.dano) > 0) && !(Number(p.danoVerdadeiro) > 0);
      const opcoesFinais = semDanoNoAtaque
        ? opcoesPermitidas.filter(o => !o.includes('value="estresse"') && !o.includes('value="sem-dano"') && !o.includes('name="ajusteDanoFinal"'))
            .map(o => o.includes('value="cheio"') ? o.replace(/<span>[^<]*<\/span>/, `<span>${ehReacao ? "Não reagir — " : ""}deixar o ataque acertar (não causa dano)</span>`) : o)
        : opcoesPermitidas;
      htmlReacao = `<fieldset class="nauren-popup-group"><legend>${semDanoNoAtaque ? "Reagir ao ataque" : "Reagir ao dano"}</legend>${notaProibicao}${opcoesFinais.join("")}${notaDoisPassos}</fieldset>`;
    }

    // Reagir à Cura (ver _resolverUmEventoDeCura) - bem mais simples
    // que a reação a dano acima: só aceitar ou recusar, sem Bloqueio/
    // Esquiva/Contra-Ataque (não fazem sentido pra receber cura).
    // Concatenado (não substitui) com "Reagir ao dano" acima - agora os
    // dois PODEM aparecer juntos no MESMO popup (ver comentário completo
    // em "_resolverUmEventoDeAtaque"/"opcoesCuraJunto"), como uma seção a
    // mais dentro da mesma janela de reação, em vez de dois popups
    // sequenciais pro mesmo evento. Bug real corrigido: antes usava "="
    // em vez de "+=" aqui - se os dois algum dia viessem juntos, o bloco
    // de "Reagir ao dano" simplesmente desaparecia, sobrescrito por este.
    if (mostrarReacaoCura) {
      htmlReacao += `
        <fieldset class="nauren-popup-group"><legend>Reagir à cura</legend>
          <label class="nauren-popup-opt"><input type="radio" name="reacaoCura" value="aceitar" checked><span>Aceitar a cura (+${p.cura} PV)</span></label>
          <label class="nauren-popup-opt"><input type="radio" name="reacaoCura" value="recusar"><span>Recusar a cura</span></label>
        </fieldset>`;
    }

    // Remover Condição ou Estresse (ver campoAcao > penitenciaRemoverCondicaoOuEstresse,
    // ex: Palavra de Destino: Sanatio) - lista já montada pelo CALLER
    // (que tem acesso às Condições reais do alvo) com uma entrada por
    // Condição ativa + Estresse (se houver) - sem hardcoded de qual
    // Condição é. Só aparece se houver pelo menos 1 opção válida.
    let htmlRemover = "";
    if (opcoesRemover?.length) {
      const opcoesHtml = opcoesRemover.map(o => `<option value="${o.valor}">${o.label}</option>`).join("");
      // Remoções extras da penitência (ex.: Símbolo Sagrado): na MESMA janela, uma lista por remoção.
      const nExtras = Math.max(0, Math.round(Number(p.remocoesExtras) || 0));
      const fonteExtra = p.remocoesExtrasFonte ? ` (${p.remocoesExtrasFonte})` : "";
      const extrasHtml = Array.from({ length: nExtras }, (_, k) => `
          <div class="field"><label>Remoção extra${nExtras > 1 ? ` ${k + 1}` : ""}${fonteExtra}</label><select name="removerExtra_${k}">
            <option value="">Não remover nada</option>
            ${opcoesHtml}
          </select></div>`).join("");
      htmlRemover = `
        <fieldset class="nauren-popup-group"><legend>Remover (opcional)</legend>
          <div class="field">${nExtras ? `<label>Remoção da penitência</label>` : ""}<select name="removerCondicaoOuEstresse">
            <option value="">Não remover nada</option>
            ${opcoesHtml}
          </select></div>${extrasHtml}
          ${nExtras ? `<p class="nauren-popup-nota">Pode escolher a mesma Condição duas vezes (tira 2 acúmulos) ou Estresse duas vezes (tira 2 pontos).</p>` : ""}
        </fieldset>`;
    }

    let htmlEvitaveis = "";
    if (itensEvitaveis.length && itensEvitaveis.some(it => !it._oculto)) {
      const linhasHtml = itensEvitaveis.map((item, i) => {
        if (item._oculto) return "";
        if (item.tipo === "movimento") {
          // Lista: ser movido / usar a Prioridade / gastar um recurso / não ser movido (decisão do jogador ou do Mestre).
          const nomeRec = RECURSOS_ALVO[item.recurso] ?? item.recurso;
          const podeMv = item.custo && this._podePagar(actor, item.recurso, item.quantidade);
          const semPrio = item.bloqueadoPor || item._prioridadeGasta;
          const ops = [`<option value="">Ser ${item.label}</option>`];
          if (item.usaPrioridade) ops.push(`<option value="prioridade"${semPrio ? " disabled" : ""}${item._pre === "prioridade" && !semPrio ? " selected" : ""}>Usar a Prioridade e não ser ${item.verbo}${semPrio ? ` (sem Prioridade: ${item._prioridadeGasta ? "já usada" : item.bloqueadoPor})` : ""}</option>`);
          if (item.custo) ops.push(`<option value="custo"${podeMv ? "" : " disabled"}${item._pre === "custo" && podeMv ? " selected" : ""}>Gastar ${item.quantidade} ${nomeRec} e não ser ${item.verbo}${podeMv ? "" : " (insuficiente)"}</option>`);
          ops.push(`<option value="livre"${item._pre === "livre" ? " selected" : ""}>Não ser ${item.verbo}</option>`);
          const nota = item.usaPrioridade && !semPrio ? `<small>A Prioridade vale no lugar de Bloquear, Esquivar ou Contra-Atacar.</small>` : "";
          return `<div class="nauren-popup-opt nauren-popup-movimento"><label><i class="fas fa-hand"></i> Movimento: ${item.label}</label><select name="evitar_${i}" data-movimento="1">${ops.join("")}</select>${nota}</div>`;
        }
        if (item.tipo === "condicao-livre") {
          // Opção livre de "não receber" (ver comentário completo em
          // "_processarPacoteLocalmenteInterno") - sem custo, sem
          // recurso pra verificar, sempre disponível.
          return `<label class="nauren-popup-opt"><input type="checkbox" name="evitar_${i}"${item._pre ? " checked" : ""}><span>Não receber ${item.label}</span></label>`;
        }
        const recurso = item.ref.custoParaEvitarRecurso;
        const qtd = item.ref._custoQuantidade ?? 1;
        // Recurso Alternativo (ver campoCondicaoAplicada > acima, ex:
        // Pressão Gravitacional - "1 Estamina OU 1 Estresse") - select
        // com 3 opções em vez de 1 checkbox, já que agora há uma
        // escolha entre dois recursos, mutuamente exclusiva.
        if (item.ref.custoParaEvitarRecursoAlternativo) {
          const recursoAlt = item.ref.custoParaEvitarRecursoAlternativo;
          const qtdAlt = item.ref._custoQuantidadeAlternativo ?? 1;
          const podePrincipal = this._podePagar(actor, recurso, qtd);
          const podeAlt = this._podePagar(actor, recursoAlt, qtdAlt);
          return `<label class="nauren-popup-opt"><span>Evitar ${item.label}:</span>
            <select name="evitar_${i}">
              <option value="">Não resistir</option>
              <option value="principal" ${podePrincipal ? "" : "disabled"}${item._pre === "principal" ? " selected" : ""}>Gastar ${qtd} ${RECURSOS_ALVO[recurso]}${podePrincipal ? "" : " (insuficiente)"}</option>
              <option value="alternativo" ${podeAlt ? "" : "disabled"}${item._pre === "alternativo" ? " selected" : ""}>Gastar ${qtdAlt} ${RECURSOS_ALVO[recursoAlt]}${podeAlt ? "" : " (insuficiente)"}</option>
            </select></label>`;
        }
        const pode = this._podePagar(actor, recurso, qtd);
        const classeExtra = pode ? "" : " nauren-popup-opt-disabled";
        const disabled = pode ? "" : "disabled";
        const aviso = pode ? "" : ` <em>(sem ${RECURSOS_ALVO[recurso]} suficiente)</em>`;
        return `<label class="nauren-popup-opt${classeExtra}"><input type="checkbox" name="evitar_${i}" ${disabled}${item._pre && pode ? " checked" : ""}><span>Gastar ${qtd} ${RECURSOS_ALVO[recurso]} pra evitar ${item.label}${aviso}</span></label>`;
      }).join("");
      htmlEvitaveis = `<fieldset class="nauren-popup-group"><legend>Evitar efeitos</legend>${linhasHtml}</fieldset>`;
    }

    const content = `
      <p class="nauren-popup-intro"><b>${p.atacante ?? "Alguém"}</b> usou <b>${p.nomeAcao}</b>${p.houveAtaque ? ` (ataque ${p.ataqueTotal})` : ""}.${ehConsequencia ? " <b>Resultado da sua reação:</b>" : ""}</p>
      ${htmlReacao}
      ${htmlRemover}
      ${htmlEvitaveis}
    `;

    // Coordenação entre vários Mestres vendo o MESMO popup (ver
    // "_popupReacao" abaixo, que dispara esta função em paralelo em cada
    // um): "instanciaDialog" é capturada assim que o Dialog renderiza (via
    // "onRenderCapturar" mais abaixo, junto do wait), pra poder ser
    // fechada de fora se outro cliente resolver o pedido primeiro.
    // "hookFechamento" escuta a flag "popupPedidoAtivo" no Ator
    // MUDAR/SUMIR (o que só acontece quando outro cliente reivindica o
    // pedido) - o Foundry já propaga isso pra todo cliente sozinho via
    // updateActor, sem precisar de nenhum socket customizado.
    let instanciaDialog = null;
    let hookFechamento = null;
    let fechadoRemotamente = false;
    const chaveJanela = `${pedidoId}:${game.user.id}`; // uma janela por tela (a chave inclui quem vê)
    if (pedidoId) {
      // Outra tela respondeu primeiro: quem processa manda fechar esta janela.
      NaurenAlvoHelper._fecharJanela.set(chaveJanela, () => {
        fechadoRemotamente = true;
        try { instanciaDialog?.close?.({ nauren_fechamentoRemoto: true }); } catch (e) { /* já pode ter fechado sozinho */ }
      });
    }

    // Lê o formulário direto do DOM no callback (em vez de depender do valor
    // de retorno de DialogV2.wait, cuja propagação exata pode variar entre
    // builds) - assim funciona independente de como a API devolve o clique.
    let dados = null;
    let perdeuCorrida = false;
    const onRenderCapturar = (app) => { instanciaDialog = app; };
    // Sempre registrado (diferente do "onRenderCapturar" acima, que só
    // roda no caminho multi-Mestre) - atualiza o <select> de Ação
    // sempre que a arma escolhida pro Contra-Ataque mudar, usando o
    // "data-acoes" (JSON) que cada <option> de arma já leva.
    const onRenderAtualizarAcaoContraAtaque = (app, html) => {
      if (app?.options?.window?.title !== `${actor.name} — reagir?`) return;
      const root = html instanceof HTMLElement ? html : (html?.[0] ?? app.element);
      const selectArma = root?.querySelector?.("#nauren-contra-arma-select");
      const selectAcao = root?.querySelector?.("#nauren-contra-acao-select");
      if (!selectArma || !selectAcao) return;
      selectArma.addEventListener("change", () => {
        const opcaoSelecionada = selectArma.selectedOptions[0];
        let acoesLista = [];
        try { acoesLista = JSON.parse(opcaoSelecionada?.dataset.acoes || "[]"); } catch (err) { acoesLista = []; }
        selectAcao.innerHTML = acoesLista.map(a => `<option value="${a.idx}">${a.nome}</option>`).join("");
      });
    };
    // "Não ser empurrado/puxado" com a Prioridade e Bloquear/Esquivar/Contra-Atacar gastam a MESMA
    // Prioridade: marcar um desliga os outros (volta para "Receber o dano" se um deles estava marcado).
    const prioridadeReacoes = [...NaurenAlvoHelper.REACOES_QUE_USAM_PRIORIDADE];
    const onRenderPrioridadeMovimento = (app, html) => {
      if (app?.options?.window?.title !== `${actor.name} — reagir?`) return;
      const root = html instanceof HTMLElement ? html : (html?.[0] ?? app.element);
      const lista = root?.querySelector?.('select[data-movimento]');
      if (!lista) return;
      const radios = [...root.querySelectorAll('input[name="reacaoDano"]')].filter(r => prioridadeReacoes.includes(r.value));
      const aplicar = () => {
        const usando = lista.value === "prioridade";
        for (const r of radios) {
          if (usando) {
            if (!r.disabled) { r.disabled = true; r.dataset.desligadoPorMovimento = "1"; }
            r.closest("label")?.classList.add("nauren-popup-opt-disabled");
            r.closest("label")?.setAttribute("title", "Sua Prioridade vai para não ser movido");
          } else if (r.dataset.desligadoPorMovimento) {
            r.disabled = false; delete r.dataset.desligadoPorMovimento;
            r.closest("label")?.classList.remove("nauren-popup-opt-disabled");
            r.closest("label")?.removeAttribute("title");
          }
        }
        if (usando && radios.some(r => r.checked)) {
          const cheio = root.querySelector('input[name="reacaoDano"][value="cheio"]');
          if (cheio) { cheio.checked = true; cheio.dispatchEvent(new Event("change", { bubbles: true })); }
        }
      };
      lista.addEventListener("change", aplicar);
      aplicar();
    };
    Hooks.on("renderDialogV2", onRenderAtualizarAcaoContraAtaque);
    Hooks.on("renderDialogV2", onRenderPrioridadeMovimento);
    if (pedidoId) Hooks.on("renderDialogV2", onRenderCapturar);
    let pararCronometro = () => {};
    const onRenderCronometro = (app, html) => {
      if (app?.options?.window?.title !== `${actor.name} — reagir?`) return;
      pararCronometro = naurenCronometroNoDialog(app, html instanceof HTMLElement ? html : (html?.[0] ?? app.element));
    };
    Hooks.on("renderDialogV2", onRenderCronometro);
    // Registra a escolha no momento do clique (não depende de achar o <form> ao confirmar).
    const escolhaAoVivo = {};
    const onRenderRegistrar = (app, html) => {
      if (app?.options?.window?.title !== `${actor.name} — reagir?`) return;
      const raiz = html instanceof HTMLElement ? html : (html?.[0] ?? app.element);
      const ler = () => raiz?.querySelectorAll?.("input, select").forEach(el => {
        if (!el.name) return;
        if (el.type === "radio") { if (el.checked) escolhaAoVivo[el.name] = el.value; }
        else if (el.type === "checkbox") escolhaAoVivo[el.name] = el.checked ? (el.value && el.value !== "on" ? el.value : true) : escolhaAoVivo[el.name] === undefined ? undefined : false;
        else escolhaAoVivo[el.name] = el.value;
      });
      raiz?.addEventListener?.("change", ler); raiz?.addEventListener?.("input", ler); ler();
    };
    Hooks.on("renderDialogV2", onRenderRegistrar);
    let motivoDescarte = "";
    if (!ehConsequencia) { naurenHudAlvos.set(actor.uuid, { de: p.atacante ?? "Alguém", acao: p.nomeAcao ?? "uma Ação", houveAtaque: !!p.houveAtaque }); NaurenHudCombate.atualizar(); }
    try {
      await foundry.applications.api.DialogV2.wait({
        window: { title: `${actor.name} — reagir?` },
        content,
        buttons: [{
          label: "Confirmar",
          action: "ok",
          default: true,
          callback: async (event, button, dialog) => {
            try {
              // Reivindica o pedido ANTES de aceitar qualquer escolha - se
              // outro cliente já resolveu (a flag mudou/sumiu), esta
              // resposta é descartada (evita duas respostas "vencendo").
              if (pedidoId) {
                const minhaVez = await NaurenAlvoHelper._pedirVez(pedidoId, executorId);
                if (!minhaVez) { perdeuCorrida = true; fechadoRemotamente = true; motivoDescarte = "outro Mestre já tinha respondido"; return; }
              }
              const formEl = button?.form || event?.currentTarget?.form || dialog?.element?.querySelector?.("form") || dialog?.querySelector?.("form");
              if (!formEl) {
                // Sem <form>: usa o que foi registrado no clique.
                dados = { ...escolhaAoVivo };
                console.warn("Nauren RPG | Popup de reação: sem <form>; usando a escolha registrada no clique.", dados);
                return;
              }
              // Leitura direta do DOM (funciona mesmo se FormDataExtended não
              // existir ou mudar de assinatura entre builds).
              const reacaoDano = formEl.querySelector('input[name="reacaoDano"]:checked')?.value;
              const reacaoCura = formEl.querySelector('input[name="reacaoCura"]:checked')?.value;
              const removerCondicaoOuEstresse = formEl.querySelector('select[name="removerCondicaoOuEstresse"]')?.value || "";
              const removerExtras = [...formEl.querySelectorAll('select[name^="removerExtra_"]')].map(el => el.value || "");
              // Todos os 3 são aritmética JS pura (nunca passam por um Roll
              // formal) - se tiver dado (ex: "1d4+2"), precisa ser rolado DE
              // VERDADE aqui, não só convertido pra Number (que retornaria
              // NaN pra qualquer texto com "d").
              const rolarAjuste = async (nomeCampo) => {
                const texto = (formEl.querySelector(`input[name="${nomeCampo}"]`)?.value || "0").trim();
                if (!texto || texto === "0") return 0;
                try { return Math.round((await new Roll(texto).evaluate()).total); } catch (err) { return Number(texto) || 0; }
              };
              const ajusteBloqueio = await rolarAjuste("ajusteBloqueio");
              const ajusteEsquiva = await rolarAjuste("ajusteEsquiva");
              const ajusteDanoFinal = await rolarAjuste("ajusteDanoFinal");
              const armaContraAtaqueId = formEl.querySelector('select[name="armaContraAtaqueId"]')?.value || null;
              const acaoContraAtaqueIndex = formEl.querySelector('select[name="acaoContraAtaqueIndex"]')?.value ?? null;
              const evitar = {};
              formEl.querySelectorAll('input[type="checkbox"][name^="evitar_"]').forEach(el => {
                evitar[el.name] = el.checked;
              });
              // Select de Recurso Alternativo (ver campoCondicaoAplicada >
              // custoParaEvitarRecursoAlternativo) - carrega "principal"/
              // "alternativo"/"" (vazio = não resistir), não um booleano.
              formEl.querySelectorAll('select[name^="evitar_"]').forEach(el => {
                evitar[el.name] = el.value;
              });
              dados = { reacaoDano, reacaoCura, removerCondicaoOuEstresse, removerExtras, ajusteBloqueio, ajusteEsquiva, ajusteDanoFinal, armaContraAtaqueId, acaoContraAtaqueIndex, ...evitar };
              // Confirmação adicional via FormDataExtended, se disponível - só
              // preenche o que a leitura direta não tiver pego (ex: se algum
              // nome de campo não bateu com os seletores acima).
              try {
                const FDE = foundry.applications.ux?.FormDataExtended;
                if (FDE) {
                  const extra = new FDE(formEl).object;
                  dados = { ...extra, ...dados };
                }
              } catch (err2) { /* leitura direta já é suficiente, ignora */ }
              console.log("Nauren RPG | Popup de reação - escolhas capturadas:", dados);
            } catch (err) {
              console.warn("Nauren RPG | Não consegui ler o formulário do popup de reação.", err);
            }
          }
        }],
        rejectClose: false
      });
    } finally {
      naurenHudAlvos.delete(actor.uuid);
      NaurenHudCombate.atualizar();
      Hooks.off("renderDialogV2", onRenderCronometro);
      pararCronometro();
      Hooks.off("renderDialogV2", onRenderAtualizarAcaoContraAtaque);
      Hooks.off("renderDialogV2", onRenderPrioridadeMovimento);
      if (pedidoId) {
        Hooks.off("renderDialogV2", onRenderCapturar);
        NaurenAlvoHelper._fecharJanela.delete(chaveJanela);
      }
    }

    Hooks.off("renderDialogV2", onRenderRegistrar);
    if (perdeuCorrida || fechadoRemotamente) {
      if (fechadoRemotamente && pedidoId) ui.notifications.info(`${actor.name}: outro Mestre respondeu a reação.`);
      else if (mostrarReacaoDano) ui.notifications.warn(`A reação de ${actor.name} não foi registrada (${motivoDescarte || "a janela foi fechada por outra tela"}): dano cheio.`);
      return { _perdeuCorrida: true };
    }
    if (!dados && mostrarReacaoDano) {
      // Fechou sem confirmar (X, Esc ou cronômetro): usa o que estava marcado, se houver.
      if (escolhaAoVivo.reacaoDano) dados = { ...escolhaAoVivo };
      if (!escolhaAoVivo.reacaoDano || escolhaAoVivo.reacaoDano === "cheio") ui.notifications.warn(`${actor.name}: a janela de reação foi fechada sem confirmar - dano cheio.`);
    }

    const reacaoDano = dados?.reacaoDano || "cheio";
    const reacaoCura = dados?.reacaoCura || "aceitar";
    // Map (não Set) - "evitar_i" agora pode carregar QUAL opção foi
    // escolhida (ex: "principal"/"alternativo" pro <select> de 2
    // recursos alternativos), não só true/false. Ainda serializa como
    // array de pares [chave, valor] no JSON da Query cross-cliente.
    const evitados = new Map();
    itensEvitaveis.forEach((_, i) => {
      const v = dados?.[`evitar_${i}`];
      if (v) evitados.set(i, v);
    });
    return {
      reacaoDano,
      reacaoCura,
      removerCondicaoOuEstresse: dados?.removerCondicaoOuEstresse || "",
      removerExtras: Array.isArray(dados?.removerExtras) ? dados.removerExtras : null, // null = a janela não teve as listas extras
      evitados: [...evitados],
      ajusteBloqueio: Number(dados?.ajusteBloqueio) || 0,
      ajusteEsquiva: Number(dados?.ajusteEsquiva) || 0,
      ajusteEsquivaInstintiva: Number(dados?.ajusteEsquivaInstintiva) || 0,
      ajusteDanoFinal: Number(dados?.ajusteDanoFinal) || 0,
      bloqueioDadoTotal: bloqueioDado.total,
      esquivaDadoTotal: esquivaDado.total,
      armaContraAtaqueId: dados?.armaContraAtaqueId || null,
      acaoContraAtaqueIndex: dados?.acaoContraAtaqueIndex ?? null
    };
  }

  /** Aplica a reação escolhida ao dano (dano cheio se nada foi escolhido ou o popup nem apareceu). Metade do dano arredonda PRA BAIXO.
   *  "ajustes" (opcional): { ajusteBloqueio, ajusteEsquiva } digitados na hora no popup (ver _popupReacao) - somam POR CIMA de tudo (bônus
   *  persistentes de Bônus Manual/Efeito/Condição/Pigmento já incluídos em bloqueioBonusTotal/esquivaBonusTotal, mais este extra pontual). */
  static async _aplicarReacaoDano(actor, p, reacao, ajustes = {}) {
    // "estresse" escolhido direto (popup antigo, sem fases) = nenhuma reação + Estresse no passo da consequência.
    let estresseDireto = false;
    if (reacao === "estresse") { estresseDireto = true; reacao = "cheio"; }
    const estamina = actor.system.estaminaCombate?.value ?? 0;
    // Postura Gruhua: a esquiva é paga com 2 Energia, não Estamina.
    let pagouComEnergia = false;
    if (reacao === "esquivar-energia") {
      const lista = foundry.utils.deepClone(actor.system.recursosCustom ?? []);
      const energia = lista.find(r => r.id === "energia");
      if (energia && (energia.valor ?? 0) >= 2) {
        energia.valor -= 2;
        await actor.update({ "system.recursosCustom": lista });
        pagouComEnergia = true;
      }
      reacao = "esquivar";
    }
    const stressAtual = actor.system.stress?.value ?? 0;
    const stressMax = actor.system.stress?.max ?? 2;
    // Ver NaurenAlvoHelper#_bonusDefesaContraAtacante - ex: Reflexos de
    // Caça (Caçador), "+Bloqueio/Esquiva contra ataques do alvo que EU
    // marquei especificamente".
    const bonusReflexosBloqueio = await NaurenAlvoHelper._bonusDefesaContraAtacante(actor, p.atacanteTokenUuid, "bloqueio");
    const bloqueio = (actor.system.defesaTotal ?? 10) + (actor.system.vitalidade?.max ?? 0) +
      (actor.system.bloqueioBonusTotal ?? 0) + (ajustes.bloqueioDadoTotal || 0) + (ajustes.ajusteBloqueio || 0) + bonusReflexosBloqueio;
    let danoFinal = p.dano, texto = "Sofreu o dano cheio";
    let contraAtaque = null; // preenchido só se "contra-atacar" for escolhido - ver processarPacoteLocalmente, que devolve o dano pro atacante original
    // "true" quando o ataque é CONSIDERADO UMA FALHA de verdade (Bloqueio
    // ou Esquiva bem-sucedidos - regra explícita do manual: "o ataque é
    // considerado como uma falha, não aplicando efeitos relacionados a
    // acertos") - usado depois (ver _processarPacoteLocalmenteInterno)
    // pra também pular Condições/Efeitos "só se acertar" deste evento
    // específico, não só zerar o dano.
    let evitouCompletamente = false;
    let usouPrioridade = false;

    if (reacao === "sem-dano") {
      // Opção "coringa": não toma dano nenhum, sem custo de recurso e sem
      // rolagem - pra situações que nenhuma das outras opções cobre (uma
      // decisão narrativa do Mestre, um teste que não deveria valer,
      // planeja usar um Dado de Destino pra pedir a Ação de novo, etc).
      danoFinal = 0;
      texto = "Não tomou dano (decisão do jogador/Mestre)";
    } else if (reacao === "usarPrioridade" && !p.houveAtaque && !p.semPrioridade) {
      danoFinal = 0;
      evitouCompletamente = true;
      usouPrioridade = true;
      texto = "Usou a Prioridade antes do efeito: não recebeu dano nem Condições. Aja agora (ex.: sair da área).";
    } else if (reacao === "bloquear" && p.houveAtaque && estamina >= 1 && !p.semPrioridade) {
      await actor.update({ "system.estaminaCombate.value": Math.max(0, estamina - 1) });
      // Deflexão no Bloqueio (livro): Bloqueio igual ao ataque, ou dentro do Limiar de Deflexão,
      // faz o atacante não causar dano, perder 1 de Estamina e ficar Caído. Não anula um crítico.
      let atacanteLimB = null;
      try { const tB = p.atacanteTokenUuid ? fromUuidSync(p.atacanteTokenUuid) : null; atacanteLimB = tB?.actor ?? null; } catch (err) { atacanteLimB = null; }
      const limiarB = (actor.system.limiarDeflexaoTotal ?? 0) + (p.ajusteLimiarDeflexaoAtacante || 0) + naurenBonusAcimaContra(actor, atacanteLimB, "limiarDeflexao").total;
      const difB = Math.abs((p.ataqueTotal ?? 0) - bloqueio);
      if (!p.critico && !p.falhaCritica && p.atacanteTokenUuid && difB <= limiarB) {
        danoFinal = 0;
        evitouCompletamente = true;
        texto = `Deflexão no Bloqueio! Bloqueio ${bloqueio} x ${p.ataqueTotal} do ataque (${difB === 0 ? "empate" : `diferença ${difB}, Limiar ${limiarB}`}) - o ataque falhou e não causa dano.`;
        contraAtaque = { ehDeflexao: true, viaBloqueio: true, dano: 0, atacanteTokenUuid: p.atacanteTokenUuid, armaNome: "Bloqueio" };
      } else if (!p.critico && (p.falhaCritica || (p.ataqueTotal ?? 0) <= bloqueio)) {
        // Imparável (Peculiaridade de monstro): garante que uma
        // quantidade fixa passa mesmo com Bloqueio bem-sucedido - some
        // por cima do dano mínimo normal, nunca o substitui.
        danoFinal = Math.max(0, (p.danoMinimo ?? 0) + (p.imparavel ?? 0));
        const fontesB = NaurenAlvoHelper._fontesDefesaTexto(actor, "bloqueio");
        const rotB = fontesB ? `${bloqueio}; inclui ${fontesB}` : `${bloqueio}`;
        texto = p.imparavel ? `Bloqueou (${rotB}), mas ${p.imparavel} de dano é Imparável (passa mesmo bloqueando)` : `Bloqueou (${rotB})`;
        if (p.danoMinimoDetalhe) texto += ` - ${p.danoMinimoDetalhe}`;
        evitouCompletamente = true;
      } else {
        const fontesBF = NaurenAlvoHelper._fontesDefesaTexto(actor, "bloqueio");
        texto = p.critico ? `Acerto crítico: não dá para bloquear (${bloqueio})` : `Tentou bloquear e falhou (${bloqueio}${fontesBF ? `; inclui ${fontesBF}` : ""})`;
      }
    } else if ((reacao === "esquivar" || reacao === "esquiva-instintiva") && p.houveAtaque && !p.semPrioridade && (reacao === "esquiva-instintiva" || pagouComEnergia || estamina >= 1)) {
      const ehInstintiva = reacao === "esquiva-instintiva";
      let esquivaInstintivaInfo = null;
      if (ehInstintiva) {
        esquivaInstintivaInfo = NaurenAlvoHelper._esquivaInstintivaInfo(actor);
        if (!esquivaInstintivaInfo || (esquivaInstintivaInfo.usosRestantes <= 0 && esquivaInstintivaInfo.emCombate)) {
          // Sem uso restante (situação mudou entre abrir o popup e
          // confirmar) - cai pro comportamento de "esquivar" normal, se
          // tiver Estamina; senão, dano cheio mesmo (não deixa travado).
          if (estamina < 1) { texto = "Sem Estamina nem Esquiva Instintiva disponível - tomou o dano cheio"; }
        }
      }
      const semRecursoNenhum = ehInstintiva && (!esquivaInstintivaInfo || (esquivaInstintivaInfo.usosRestantes <= 0 && esquivaInstintivaInfo.emCombate)) && estamina < 1;
      if (!semRecursoNenhum) {
        if (ehInstintiva && (esquivaInstintivaInfo?.usosRestantes > 0 || !esquivaInstintivaInfo?.emCombate)) {
          if (esquivaInstintivaInfo.emCombate) {
            const acoesClonadas = foundry.utils.deepClone(esquivaInstintivaInfo.item.system.acoes);
            acoesClonadas[esquivaInstintivaInfo.acaoIndex].usosAtual = Math.max(0, esquivaInstintivaInfo.usosRestantes - 1);
            await esquivaInstintivaInfo.item.update({ "system.acoes": acoesClonadas });
          }
        } else if (!pagouComEnergia) {
          await actor.update({ "system.estaminaCombate.value": Math.max(0, estamina - 1) });
        }
        const agilidade = actor.system.atributosTotais?.agilidade ?? actor.system.atributos.agilidade.value;
        const ajusteDigitado = ehInstintiva ? (ajustes.ajusteEsquivaInstintiva || 0) : (ajustes.ajusteEsquiva || 0);
        // Ver NaurenAlvoHelper#_bonusDefesaContraAtacante - ex: Reflexos
        // de Caça (Caçador).
        const bonusReflexosEsquiva = await NaurenAlvoHelper._bonusDefesaContraAtacante(actor, p.atacanteTokenUuid, "esquiva");
        const esquivaBonus = (actor.system.esquivaBonusTotal ?? 0) + (ajustes.esquivaDadoTotal || 0) + ajusteDigitado + bonusReflexosEsquiva;
        let formula = `1d20 + ${agilidade}${esquivaBonus ? ` + ${esquivaBonus}` : ""}`;
        // Facilidade/Dificuldade na Esquiva, vinda de Condições/Efeitos (ex:
        // "Cego" dá dificuldade). Esta rolagem não passa por
        // _rollD20WithMode (que é método da ficha, e aqui estamos no helper
        // de alvo), então a lógica de 2d20 é aplicada na mão.
        const modoEsquiva = actor.system.vantagemEsquivaModo || "normal";
        // 0.94.11: Facilidades/Dificuldades além da primeira: ±2 cada.
        const somaEsq = naurenNumeroModo(actor.system.vantagemContagem?.esquiva ?? modoEsquiva);
        const extraEsq = naurenBonusModoExtra(somaEsq);
        if (extraEsq) formula = `${formula} ${extraEsq > 0 ? "+" : "-"} ${Math.abs(extraEsq)}`;
        let roll = await new Roll(formula).evaluate();
        if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true);
        if (modoEsquiva !== "normal") {
          const rollB = await new Roll(formula).evaluate();
          if (game.dice3d) await game.dice3d.showForRoll(rollB, game.user, true);
          const usarB = modoEsquiva === "vantagem" ? rollB.total > roll.total : rollB.total < roll.total;
          if (usarB) roll = rollB;
        }
        // Rerolagem com Destino antes de decidir se esquivou.
        const resultadoEsquiva = await naurenOferecerDestino(actor, { mode: modoEsquiva, rolls: [roll], usedIndex: 0 }, {
          titulo: ehInstintiva ? "Esquiva Instintiva" : "Esquiva", tipo: "esquiva",
          bonusLinhas: [{ label: "Agilidade", value: `+${agilidade}` }, esquivaBonus ? { label: "Bônus de Esquiva", value: `+${esquivaBonus}` } : null, naurenLinhaModoExtra(somaEsq)],
          contra: { rotulo: "Ataque a superar", valor: p.ataqueTotal ?? 0, textoVence: "Esquivaria", textoPerde: "Falharia" }
        });
        roll = resultadoEsquiva.rolls[0];
        // 20 ou 1 natural na esquiva também conta para o Grupo (Graça / Perjúrio) - antes só ataques e testes contavam.
        {
          const faceEsq = roll?.dice?.find(d => d.faces === 20)?.results?.find(r => r.active !== false)?.result;
          const { perjurioMax: perjMax, gracaMin } = NaurenGrupoHelper.limiares(actor);
          if (faceEsq && (faceEsq <= perjMax || faceEsq >= gracaMin))
            NaurenGrupoHelper.notificarRolagem(actor, faceEsq, faceEsq <= perjMax ? "perjurio" : "graca").catch(err => console.warn("Nauren RPG | Falha ao notificar Grupo (esquiva).", err));
        }
        const historicoEsquiva = naurenTextoHistoricoDestino(resultadoEsquiva);
        // Sempre mostra o dado rolado e cada bônus separadamente (ex:
        // "1d20(14) + 2 + 2 = 18"), pra ficar auditável no chat - não só
        // o total final.
        const rollBreakdown = `${naurenRollToBreakdownText(roll)} = ${roll.total}${historicoEsquiva ? ` (rerolado com Destino: ${historicoEsquiva})` : ""}`;
        const rotulo = ehInstintiva ? "Esquiva Instintiva" : "Esquiva";
        if (!p.critico && (p.falhaCritica || roll.total > (p.ataqueTotal ?? 0))) {
          danoFinal = 0;
          evitouCompletamente = true;
          texto = `${rotulo}: ${rollBreakdown}${modoEsquiva !== "normal" ? ` (${modoEsquiva})` : ""}, contra ${p.ataqueTotal} do ataque - Esquivou!${NaurenAlvoHelper._fontesDefesaTexto(actor, "esquiva") ? ` (inclui ${NaurenAlvoHelper._fontesDefesaTexto(actor, "esquiva")})` : ""}`;
        } else {
          texto = `${rotulo}: ${rollBreakdown}${modoEsquiva !== "normal" ? ` (${modoEsquiva})` : ""}, contra ${p.ataqueTotal} do ataque - ${p.critico ? "Acerto crítico: não dá para esquivar" : "Falhou"}${NaurenAlvoHelper._fontesDefesaTexto(actor, "esquiva") ? ` (inclui ${NaurenAlvoHelper._fontesDefesaTexto(actor, "esquiva")})` : ""}`;
        }
      }
    } else if (reacao === "contra-atacar" && p.houveAtaque && p.atacanteTokenUuid && estamina >= 1 && !p.semPrioridade) {
      // Contra-Ataque/Deflexão: usa a ARMA EQUIPADA
      // escolhida no popup (ajustes.armaContraAtaqueId) - reaproveita o
      // MESMO motor de rolagem de um ataque normal (atributo/bônus/dado da
      // Ação, Efeitos Vinculados dela etc), chamando os métodos da FICHA
      // do ator (actor.sheet) em vez de uma fórmula simplificada.
      const armaEscolhida = ajustes.armaContraAtaqueId ? actor.items.get(ajustes.armaContraAtaqueId) : null;
      const acoesArma = armaEscolhida?.system.acoes ?? [];
      // Preferência: a Ação que o jogador ESCOLHEU no popup
      // ("acaoContraAtaqueIndex", ex: Ataque Normal x Ataque Pesado) -
      // sem isso (fallback só por segurança, não devia acontecer com o
      // popup atual), volta pro comportamento antigo (Ação "ativa" da
      // arma, ou a primeira de ataque que achar).
      const idxEscolhido = ajustes.acaoContraAtaqueIndex !== null && ajustes.acaoContraAtaqueIndex !== undefined
        ? Number(ajustes.acaoContraAtaqueIndex) : null;
      const idxAtivo = acoesArma.length ? Math.min(armaEscolhida?.system.acaoAtivaIndex ?? 0, acoesArma.length - 1) : -1;
      const acaoContraAtaque = (idxEscolhido !== null && acoesArma[idxEscolhido]?.ehAtaque) ? acoesArma[idxEscolhido]
        : (idxAtivo >= 0 && acoesArma[idxAtivo]?.ehAtaque) ? acoesArma[idxAtivo] : acoesArma.find(a => a.ehAtaque);

      if (!armaEscolhida || !acaoContraAtaque) {
        texto = "Tentou Contra-Atacar, mas nenhuma arma ou habilidade de ataque foi selecionada - sofreu o dano cheio.";
      } else {
        const sheet = actor.sheet;
        // Reaproveita o MESMO popup de confirmação de qualquer Ação (ver
        // "usaPopupPreAcao") - dá pro contra-atacante escolher Facilidade/
        // Dificuldade, somar um bônus pontual e ajustar o Limiar de
        // Deflexão, exatamente como um ataque comum. Se ele cancelar,
        // aborta SEM gastar a Estamina (por isso o consumo dela foi movido
        // pra DEPOIS desta chamada, diferente de antes).
        const escolhasContraAtaque = actor.system.usaPopupPreAcao
          ? await sheet._popupPreAcao(armaEscolhida, acaoContraAtaque)
          : { modoPreAcao: null, bonusAtaqueAdhoc: 0, bonusDanoAdhoc: 0, ajusteLimiarDeflexao: 0 };
        if (!escolhasContraAtaque) {
          texto = "Cancelou o Contra-Ataque - sofreu o dano cheio.";
        } else {
          await actor.update({ "system.estaminaCombate.value": Math.max(0, estamina - 1) });
          // Contra-atacar com uma Ação que custa Mana (magia/habilidade): cobra a Mana também.
          const manaCA = Number(acaoContraAtaque.custoMana) || 0;
          if (manaCA) await actor.update({ "system.mana.value": Math.max(0, (actor.system.mana?.value ?? 0) - manaCA) });
          const rankAtual = armaEscolhida.system.rankAtual ?? 0;
          const localBonus = sheet._resolverEfeitosDaAcao(acaoContraAtaque);
          // "#bonusAtaqueAdhocAtual"/"#bonusDanoAdhocAtual" são campos
          // PRIVADOS da ficha, normalmente preenchidos só por
          // "_executarAcao" - aqui preciso preenchê-los manualmente antes
          // de rolar (mesmo mecanismo, chamada direta) pra "_rolarAtaqueDaAcao"/
          // "_rolarBlocoDano" already lerem o bônus pontual certo.
          sheet._definirAjustesPreAcaoManualmente?.(escolhasContraAtaque);
          // Buffs de próxima ação também valem no Contra-Ataque (escolhidos no popup, se usado).
          const candidatosCA = sheet._buffsProximaAcaoCandidatos(armaEscolhida, acaoContraAtaque);
          const usarCA = escolhasContraAtaque.buffsUsar ?? candidatosCA.map(c => c.id);
          await sheet._ativarBuffsProximaAcao(acaoContraAtaque, candidatosCA.filter(c => usarCA.includes(c.id)));
          let modoCA = escolhasContraAtaque.modoPreAcao;
          if (sheet._proximaAcaoInfo()?.facilidade) modoCA = modoCA === "desvantagem" ? "normal" : "vantagem";
          const { d20Result, breakdown: breakdownAtaque } = await sheet._rolarAtaqueDaAcao(acaoContraAtaque, localBonus, rankAtual, modoCA, armaEscolhida.type);
          // Bônus no Contra-Ataque (ex.: Defesa Atacante, +1d4 em Guarda Defensiva) - rolado agora e mostrado no card.
          const bonusCA = await NaurenAlvoHelper._resolverBonusComDadoPopup(actor, "contraAtaque");
          if (bonusCA.total) {
            escolhasContraAtaque.bonusAtaqueAdhoc = (escolhasContraAtaque.bonusAtaqueAdhoc || 0) + bonusCA.total;
            breakdownAtaque.push({ label: "Bônus no Contra-Ataque", value: `${bonusCA.total >= 0 ? "+" : ""}${bonusCA.total} (${bonusCA.partes.join(", ")})` });
          }
          const totalTeste = d20Result.rolls[d20Result.usedIndex].total + (escolhasContraAtaque.bonusAtaqueAdhoc || 0);

          // Limiar de Deflexão: soma o ajuste de QUEM contra-ataca (agora)
          // com o ajuste que o ATACANTE ORIGINAL já tinha escolhido no
          // popup dele, lá no momento do ataque (propagado no pacote "p" -
          // ver "ajusteLimiarDeflexaoAtacante" em "_resolverAlvosDaAcao").
          let atacanteLim = null;
          try { const tL = p.atacanteTokenUuid ? fromUuidSync(p.atacanteTokenUuid) : null; atacanteLim = tL?.actor ?? null; } catch (err) { atacanteLim = null; }
          const acimaLimiarCA = naurenBonusAcimaContra(actor, atacanteLim, "limiarDeflexao").total;
          const limiar = (actor.system.limiarDeflexaoTotal ?? 0) + (escolhasContraAtaque.ajusteLimiarDeflexao || 0) + (p.ajusteLimiarDeflexaoAtacante || 0) + acimaLimiarCA;
          const diferenca = Math.abs(totalTeste - (p.ataqueTotal ?? 0));
          const ehDeflexao = diferenca <= limiar && !p.critico; // Deflexão não anula um acerto crítico
          const ehCritico = sheet._isCrit(d20Result);

          // Soma o dano de todos os blocos de Dano da Ação escolhida (a
          // maioria das armas tem apenas um) - cada bloco vira sua
          // PRÓPRIA linha (com o breakdown por dado, "2d6(4,6)", pra
          // auditoria - mesmo padrão de um ataque comum, ver
          // "_executarAcao"), em vez de uma única linha "Dano: total"
          // sem detalhamento.
          let danoContraAtaque = 0;
          const linhasDanoContraAtaque = [];
          const danosBlocos = acaoContraAtaque.danos ?? [];
          for (let i = 0; i < danosBlocos.length; i++) {
            const { roll, breakdown } = await sheet._rolarBlocoDano(danosBlocos[i], ehCritico, i === 0, localBonus, rankAtual, acaoContraAtaque, false, armaEscolhida.type);
            danoContraAtaque += roll.total;
            linhasDanoContraAtaque.push({ label: ehCritico ? "Dano (CRÍTICO x2)" : "Dano", value: roll.total, breakdown: sheet._rollToBreakdownText(roll) });
            breakdownAtaque.push(...breakdown);
          }
          // Buffs usados no Contra-Ataque: consumidos e registrados no card.
          linhasDanoContraAtaque.push(...await sheet._consumirBuffsProximaAcao());
          sheet._limparProximaAcao();

          // Publica o card de rolagem do Contra-Ataque no mesmo formato de
          // um ataque comum, com um indicador claro de que se trata de uma
          // reação e não de uma ação espontânea. O total MOSTRADO precisa
          // refletir o bônus pontual escolhido no popup (bug corrigido:
          // antes o ajuste só entrava em "totalTeste", usado na comparação
          // de Deflexão e no texto narrativo - o card em si mostrava o
          // roll puro, sem o ajuste, deixando os dois números
          // divergentes pro jogador). Clona só o roll USADO, sem alterar
          // "d20Result" original (usado em outros lugares, ex:
          // notificação de natural extremo pra Graça/Perjúrio).
          let d20ResultExibido = d20Result;
          if (escolhasContraAtaque.bonusAtaqueAdhoc) {
            d20ResultExibido = {
              ...d20Result,
              rolls: d20Result.rolls.map((r, i) => i === d20Result.usedIndex ? { ...r, total: r.total + escolhasContraAtaque.bonusAtaqueAdhoc } : r)
            };
            const manualCA = escolhasContraAtaque.bonusAtaqueAdhoc - (bonusCA.total || 0);
            if (manualCA) breakdownAtaque.push({ label: "Ajuste manual (Contra-Ataque)", value: `${manualCA > 0 ? "+" : ""}${manualCA}` });
          }
          await sheet._postRollCard({
            title: `Contra-Ataque — ${armaEscolhida.name}`,
            icon: armaEscolhida.img,
            d20Result: d20ResultExibido,
            secondaryLines: [
              { label: "Reagindo ao ataque de", value: p.atacante },
              ...(p.viaCondicao ? [{ label: p.viaCondicao, value: "Contra-Ataque contra um Contra-Ataque (1 por turno)" }] : []),
              ...linhasDanoContraAtaque
            ],
            breakdown: breakdownAtaque
          });

          if (ehDeflexao) {
            // Deflexão: o ataque original falha e o atacante sofre o dano do
            // contra-ataque independentemente da própria Defesa.
            danoFinal = 0;
            evitouCompletamente = true;
            texto = `Deflexão! Contra-atacou com ${armaEscolhida.name} (${totalTeste}) empatando com o ataque original (${p.ataqueTotal}${limiar ? `, limiar ${limiar}` : ""}) - o ataque original falhou.`;
            contraAtaque = { ehDeflexao: true, dano: danoContraAtaque, atacanteTokenUuid: p.atacanteTokenUuid, armaNome: armaEscolhida.name, armaId: armaEscolhida.id, condicaoAoDefletir: acaoContraAtaque.condicaoAoDefletir };
          } else {
            // Sem Deflexão, o ataque original e o contra-ataque resolvem-se
            // de forma independente.
            texto = `Contra-atacou com ${armaEscolhida.name} (${totalTeste} x ${p.ataqueTotal} do ataque original) - sem Deflexão (${p.critico && diferenca <= limiar ? "o ataque original foi crítico" : `diferença ${diferenca}; Deflexão só até ${limiar}`}), os dois ataques acertam normalmente.`;
            const faceCA = d20ResultExibido ? naurenFaceD20(d20ResultExibido.rolls?.[d20ResultExibido.usedIndex]) : null;
            contraAtaque = { ehDeflexao: false, critico: faceCA === 20, falhaCritica: faceCA === 1, dano: danoContraAtaque, ataqueTotal: totalTeste, atacanteTokenUuid: p.atacanteTokenUuid, armaNome: armaEscolhida.name, armaId: armaEscolhida.id, condicaoAoContraAtacar: acaoContraAtaque.condicaoAoContraAtacar };
          }
        }
      }
    }

    // Fase 4: eventos de reação, com o resultado já conhecido.
    {
      const ctxReacao = { atacanteTokenUuid: p.atacanteTokenUuid, ehAtaque: !!p.houveAtaque, ataqueTotal: p.ataqueTotal };
      let eventoReacao = null;
      if (reacao === "bloquear" && p.houveAtaque) eventoReacao = evitouCompletamente ? "euBloqueei" : "euFalheiBloqueio";
      else if ((reacao === "esquivar" || reacao === "esquiva-instintiva") && p.houveAtaque) eventoReacao = evitouCompletamente ? "euEsquivei" : "euFalheiEsquiva";
      if (eventoReacao) naurenProcessarGatilhos(eventoReacao, actor, ctxReacao).catch(err => console.warn(`Nauren RPG | Falha ao processar gatilhos (${eventoReacao}).`, err));
    }

    // Passo 2 (consequência): Estresse e "não tomar dano" decididos com o resultado da reação já conhecido.
    // O Estresse entra DEPOIS das rolagens acima (contra-ataque, esquiva, bloqueio não sofrem a penalidade dele).
    {
      let cons = null;
      if (ajustes.decidirConsequencia) cons = await ajustes.decidirConsequencia({ danoFinal, texto, evitouCompletamente, usouPrioridade });
      if (cons?.ajusteDanoFinal) ajustes.ajusteDanoFinal = (ajustes.ajusteDanoFinal || 0) + cons.ajusteDanoFinal;
      // Não foi empurrado: a colisão prevista (já somada ao dano) não acontece. Antes do Estresse dividir.
      const semColisao = (Number(ajustes.semColisao) || 0) + (Number(cons?.semColisao) || 0);
      if (semColisao > 0 && danoFinal > 0 && !evitouCompletamente) {
        const antesCol = danoFinal;
        danoFinal = Math.max(0, danoFinal - semColisao);
        texto += ` · Sem a colisão (não foi empurrado): ${antesCol} → ${danoFinal}`;
      }
      const escolha = cons?.reacaoDano ?? (estresseDireto ? "estresse" : null);
      if (escolha === "sem-dano") {
        danoFinal = 0;
        texto += " · Não tomou o dano (decisão do jogador/Mestre)";
      } else if (escolha === "estresse" && danoFinal > 0) {
        const stAgora = actor.system.stress?.value ?? 0, stMax = actor.system.stress?.max ?? 2;
        if (stAgora < stMax) {
          await actor.update({ "system.stress.value": stAgora + 1 });
          const antes = danoFinal;
          danoFinal = Math.floor(danoFinal / 2); // metade, arredondada para baixo (1 de dano vira 0)
          // Escudo de Mana: "o Estresse não reduz o dano sofrido pelo escudo" - o escudo absorve o dano cheio
          // e só o que passa dele é cortado pela metade. Vale enquanto o escudo for o mesmo que a magia criou.
          const semEst = actor.getFlag("nauren", "escudoSemEstresse");
          const escAtual = actor.system.escudo?.value ?? 0;
          let textoEscudoEst = "";
          if (semEst && escAtual > 0 && (actor.system.escudo?.max ?? 0) === semEst.max) {
            const noEscudo = Math.min(escAtual, antes), passa = antes - noEscudo;
            danoFinal = noEscudo + Math.floor(passa / 2);
            textoEscudoEst = ` — ${semEst.nome}: o escudo leva ${noEscudo} cheio, só os ${passa} que passam caem pela metade (${Math.floor(passa / 2)})`;
          }
          // Fortaleza das Emoções (Empíreo): em Profusão Retraída, o Estresse anula TODO o dano (1x por cena).
          const fortaleza = actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Fortaleza das Emoções") && i.system.ativo !== false);
          if (fortaleza && naurenTemEstado(actor, "Profusão Retraída") && naurenUsoDisponivel(fortaleza)) {
            await naurenConsumirUsoDaHabilidade(fortaleza);
            danoFinal = 0;
            texto = texto.replace(/^Sofreu o dano cheio\s*·?\s*/, "");
            texto = `${texto ? texto + " · " : ""}+1 Estresse: Fortaleza das Emoções anulou todo o dano (${antes})`;
          } else {
            texto = texto.replace(/^Sofreu o dano cheio\s*·?\s*/, "");
            texto = `${texto ? texto + " · " : ""}+1 Estresse: ${textoEscudoEst ? `${antes} → ${danoFinal}${textoEscudoEst}` : `dano pela metade (${antes} → ${danoFinal})`}`;
          }
        }
      }
    }

    // Redução de Dano Sofrido: aplicada por último, depois de qualquer
    // reação já ter reduzido o dano (Bloquear/Esquivar/Estresse/dano
    // cheio) - nunca deixa o dano ficar negativo. Percentual (ex:
    // Santuário Selvagem, Druida - "metade do dano") sempre primeiro,
    // fixa absorve o que restar.
    const danoAntesDasReducoes = danoFinal;
    if (danoFinal > 0) {
      const antesDoPercentual = danoFinal;
      // Dano Sofrido Extra (ex.: Exposto) entra dentro de aplicarReducaoPercentual, antes do %:
      // mostrado em linha própria, com a fonte, para ficar auditável.
      const extraRec = actor.system.danoRecebidoTotal ?? 0;
      const comExtra = Math.max(0, antesDoPercentual + extraRec);
      danoFinal = this.aplicarReducaoPercentual(actor, danoFinal);
      if (extraRec) {
        const fontes = actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && (i.system.modificadores ?? []).some(m => m.campo === "danoRecebido")).map(i => i.name);
        texto += ` (Dano sofrido extra: ${extraRec > 0 ? "+" : ""}${extraRec}${fontes.length ? ` — ${fontes.join(", ")}` : ""}: ${antesDoPercentual} → ${comExtra})`;
      }
      if (danoFinal !== comExtra) texto += ` (Redução % de Dano: -${comExtra - danoFinal})`;
    }
    let reducaoDano = actor.system.reducaoDanoTotal ?? 0;
    // Eu estou acima: Redução de Dano (Análise Paciente) - só contra o alvo analisado.
    {
      let atacanteRD = null;
      try { const tR = p?.atacanteTokenUuid ? fromUuidSync(p.atacanteTokenUuid) : null; atacanteRD = tR?.actor ?? null; } catch (err) { atacanteRD = null; }
      const acimaRD = naurenBonusAcimaContra(actor, atacanteRD, "reducaoDano").total;
      if (acimaRD) { reducaoDano += acimaRD; texto += ` (Eu estou acima: Redução de Dano +${acimaRD} contra ${atacanteRD?.name ?? "o atacante"})`; }
    }
    // Se Afastar (Empíreo): sem aliados a até 4m, reduz o dano pelo Poder de Magia.
    if (actor.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Se Afastar") && i.system.ativo !== false) && naurenAliadosAte(actor, 4) === 0) {
      reducaoDano += Number(actor.system.poderMagia?.value ?? 0) || 0;
    }
    if (reducaoDano > 0 && danoFinal > 0) {
      const danoAntesDaReducao = danoFinal;
      danoFinal = Math.max(0, danoFinal - reducaoDano);
      texto += ` (Redução de Dano: -${danoAntesDaReducao - danoFinal})`;
    }
    { const consumidas = await this.consumirAoSofrerDano(actor, danoAntesDasReducoes); if (consumidas.length) texto += ` (${consumidas.join(", ")} consumido)`; }
    // Reações pagas de redução (0.94): pagar um recurso para reduzir o dano (ex.: Inventor, 1 PdI = 1 de dano).
    if (danoFinal > 0) {
      const red = await naurenReacoesPagasDano(actor, danoFinal, p);
      if (red.total > 0) { const antesR = danoFinal; danoFinal = Math.max(0, danoFinal - red.total); texto += ` (${red.texto}: ${antesR} → ${danoFinal})`; }
    }

    // "1ª vez por turno/rodada/cena/dia": Habilidades com
    // "reducaoDanoPorUso" preenchido e 1+ uso passivo sobrando reduzem
    // este dano também, consumindo 1 uso cada - ex: Indestrutível.
    // Processa TODAS as que se aplicam (não só a primeira), já que várias
    // podem coexistir na mesma ficha.
    if (danoFinal > 0) {
      for (const item of actor.items) {
        if ((item.type !== "habilidade" && item.type !== "magia") || !item.system.ativo || !item.system.reducaoDanoPorUso) continue;
        if (!item.system.usaUsosPassiva || (item.system.usosPassivaAtual ?? 0) <= 0) continue;
        const custoManaR = Number(item.system.reducaoDanoPorUsoCustoMana) || 0;
        if (custoManaR > 0 && (actor.system.mana?.value ?? 0) < custoManaR) continue;
        let valor = 0;
        try {
          const formula = String(item.system.reducaoDanoPorUso).replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, actor)));
          valor = (await new Roll(formula).evaluate()).total || 0;
        } catch (err) { continue; }
        if (valor <= 0) continue;
        const danoAntes = danoFinal;
        danoFinal = Math.max(0, danoFinal - valor);
        await item.update({ "system.usosPassivaAtual": Math.max(0, (item.system.usosPassivaAtual ?? 1) - 1) });
        if (custoManaR > 0) await actor.update({ "system.mana.value": Math.max(0, (actor.system.mana?.value ?? 0) - custoManaR) });
        texto += ` (${item.name}: -${danoAntes - danoFinal}${custoManaR ? `, −${custoManaR} Mana` : ""})`;
        if (danoFinal <= 0) break;
      }
    }

    // Ajuste geral de dano final (positivo aumenta, negativo reduz) -
    // aplicado por ÚLTIMO, depois de qualquer reação já ter decidido o
    // valor acima, e ANTES de descontar da Vida.
    if (ajustes.ajusteDanoFinal) {
      const antesDoAjuste = danoFinal;
      danoFinal = Math.max(0, danoFinal + ajustes.ajusteDanoFinal);
      texto += ` (ajuste manual ${ajustes.ajusteDanoFinal > 0 ? "+" : ""}${ajustes.ajusteDanoFinal} no dano: ${antesDoAjuste} → ${danoFinal})`;
    }

    // Fase 6 (M14): parte do dano passa para quem está ligado a mim por uma Condição que eu apliquei.
    if (danoFinal > 0) {
      const div = await this.dividirDanoComVinculado(actor, danoFinal);
      if (div) { danoFinal -= div.parte; texto += ` (${div.fonte}: ${div.parte} passou para ${div.nome})`; }
    }

    if (danoFinal > 0) {
      const { escudoConsumido, danoNaVida, escudoRestante } = this.calcularDanoComEscudo(actor, danoFinal);
      const vidaAtual = actor.system.vida.value;
      const vidaNova = Math.max(0, vidaAtual - danoNaVida);
      const updates = { "system.vida.value": vidaNova };
      if (escudoConsumido > 0) {
        updates["system.escudo.value"] = escudoRestante;
        texto += ` (Escudo absorveu ${escudoConsumido}${danoNaVida > 0 ? ` — ${danoNaVida} vazou pra Vida` : ""})`;
      }
      await actor.update(updates, { naurenOrigemCombate: true });
      // "Eu matei alguém": dispara no ATACANTE (não no alvo) quando este
      // dano faz o alvo cruzar de Vida > 0 pra 0 - ex: "Troféu de Caça"
      // (Caçador), "após matar um inimigo com sua marca...".
      if (vidaAtual > 0 && vidaNova <= 0 && p.atacanteTokenUuid) {
        const atacanteToken = await fromUuid(p.atacanteTokenUuid).catch(() => null);
        if (atacanteToken?.actor) {
          naurenProcessarGatilhos("euMateiAlguem", atacanteToken.actor, { alvoUuid: actor.uuid, condicoesDoAlvoAntes: actor.items.filter(i => i.type === "condicao").map(i => ({ nome: i.name, conjurador: i.system.conjuradorUuid })) }).catch(() => {});
        }
      }
    }
    return { danoFinal, texto, contraAtaque, evitouCompletamente, usouPrioridade };
  }

  /**
   * Fase 6 (M14): se o ator tem uma Habilidade/Efeito/Condição ativa com "dividirDanoPercentual", N% do dano
   * vai para a primeira criatura na cena que tem a Condição de referência aplicada por ele. Devolve { parte, nome, fonte } ou null.
   */
  static async dividirDanoComVinculado(actor, dano) {
    const fonte = actor.items.find(i => ["habilidade", "efeito", "condicao", "magia", "peculiaridade"].includes(i.type)
      && (i.type === "condicao" || i.type === "peculiaridade" ? i.system.ativo !== false : !!i.system.ativo)
      && (i.system.dividirDanoPercentual || 0) > 0 && i.system.dividirDanoCondicaoUuid);
    if (!fonte || !canvas?.scene) return null;
    let refNome = "";
    try { refNome = fromUuidSync(fonte.system.dividirDanoCondicaoUuid)?.name ?? ""; } catch (err) { refNome = ""; }
    if (!refNome) return null;
    const meuTok = actor.token ?? actor.getActiveTokens?.(true, true)?.[0] ?? null;
    if (!meuTok) return null;
    const ligado = naurenCondicoesLigadasA(canvas.scene, meuTok, actor, c => c.name === refNome)[0];
    if (!ligado) return null;
    const parte = Math.floor(dano * Math.min(100, fonte.system.dividirDanoPercentual) / 100);
    if (parte <= 0) return null;
    const alvo = ligado.actor;
    const { escudoConsumido, danoNaVida, escudoRestante } = this.calcularDanoComEscudo(alvo, parte);
    const upd = { "system.vida.value": Math.max(0, (alvo.system.vida?.value ?? 0) - danoNaVida) };
    if (escudoConsumido > 0) upd["system.escudo.value"] = escudoRestante;
    await this.atualizarAtorSeguro(alvo, upd, { naurenOrigemCombate: true });
    const nome = naurenNomeDeToken(ligado.token);
    naurenPostarCard({ ator: alvo, titulo: "Dano dividido", icone: fonte.img, fonte: `${fonte.name} (${actor.name})`,
      linhas: [{ label: "Dano", value: -parte, breakdown: `${fonte.system.dividirDanoPercentual}% do dano que ${actor.name} sofreu passou para ${nome} (${ligado.cond.name})${escudoConsumido ? ` • Escudo absorveu ${escudoConsumido}` : ""}` }] }).catch(() => {});
    return { parte, nome, fonte: fonte.name };
  }

  /** O alvo tem recurso suficiente pra pagar esse custo? Estresse: precisa ter espaço até o limite; os demais (Vida inclusa, e Recurso Customizado): precisam ter o valor disponível. */
  /** Reações da janela que gastam a Prioridade do alvo (livro: Bloquear/Esquivar/Contra-Atacar são "apenas em Prioridade"). */
  static REACOES_QUE_USAM_PRIORIDADE = new Set(["bloquear", "esquivar", "esquivar-energia", "esquiva-instintiva", "contra-atacar", "usarPrioridade"]);

  /**
   * Por que este alvo NÃO tem Prioridade para reagir a esta Ação (texto curto), ou "" se tem.
   * Ação que não gera Prioridade, Contra-Ataque (feito em Prioridade não gera outra) ou Condição
   * que tira a Prioridade (não recebe Prioridade, ou sem Bloquear e sem Esquivar, ex.: Atordoado).
   */
  static semPrioridadeParaReagir(actor, p) {
    if (p?.semPrioridade) return p.semPrioridadeFonte ? `${p.semPrioridadeFonte}: a Ação não gera Prioridade` : "a Ação não gera Prioridade";
    if (p?.ehContraAtaque) return "Contra-Ataque não gera Prioridade";
    const conds = naurenCondicoesAtivas(actor);
    const trava = conds.find(c => c.system.naoRecebePrioridade === "todos")
      ?? conds.find(c => c.system.proibeBloqueio && c.system.proibeEsquiva && !c.system.contraAtaqueEmPrioridade && c.system.negativa !== "nao");
    return trava ? trava.name : "";
  }

  static _podePagar(actor, recurso, quantidade) {
    if (recurso === "estresse") return (actor.system.stress?.value ?? 0) + quantidade <= (actor.system.stress?.max ?? 2);
    if (recurso?.startsWith("recursoCustom:")) {
      const id = recurso.slice(14);
      const item = (actor.system.recursosCustom ?? []).find(r => r.id === id);
      return (item?.valor ?? 0) >= quantidade;
    }
    const campo = { vida: "vida", estamina: "estaminaCombate", mana: "mana", destino: "dadosDestino" }[recurso];
    if (!campo) return false;
    return (actor.system[campo]?.value ?? 0) >= quantidade;
  }

  /**
   * Aplica a Redução de Dano PERCENTUAL do alvo (ver
   * "reducaoDanoPercentualTotal", campo "reducaoDanoPercentual" em
   * Condição/Efeito - ex: Santuário Selvagem, Druida: "você e aliados
   * na área recebem metade do dano" = 50%) - SEMPRE ANTES da Redução de
   * Dano fixa (que continua sendo subtraída separadamente por quem
   * chamou esta função, ver "reducaoDanoTotal"), pra não uma reduzir a
   * base da outra. Arredonda pra baixo (nunca a favor do defensor por
   * arredondamento). 0% (padrão) devolve o dano inalterado.
   */
  /** Condições marcadas "sai ao sofrer dano": consumidas depois que um dano (> 0) foi reduzido por elas. */
  /**
   * Imunidade a uma Condição (Criador de Monstros, M08): procura, nos itens ATIVOS do ator
   * (Habilidade, Efeito, Peculiaridade, Condição), uma lista "imunidadesCondicoes" que inclua
   * a Condição de origem - por UUID, "self:Nome" ou nome. Devolve { nome, fonte } ou null.
   * Também cobre a imunidade temporária ganha ao evitar (ver imuneAoEvitar / flag imunidadesCena).
   */
  static imunidadeA(actor, origem) {
    if (!actor || !origem) return null;
    const alvoNome = naurenNomeNormalizado(origem.name ?? "");
    const alvoUuid = String(origem.uuid ?? "");
    const bate = ref => {
      const r = String(ref ?? "").trim();
      if (!r) return false;
      if (r === alvoUuid) return true;
      if (r.startsWith("self:")) return naurenNomeNormalizado(r.slice(5)) === alvoNome;
      if (/^(Compendium|Actor|Item)\./.test(r)) { try { const d = fromUuidSync(r); return !!d && naurenNomeNormalizado(d.name) === alvoNome; } catch (err) { return false; } }
      return naurenNomeNormalizado(r) === alvoNome;
    };
    for (const it of actor.items ?? []) {
      if (!["habilidade", "efeito", "peculiaridade", "condicao", "magia"].includes(it.type)) continue;
      const ativo = it.type === "condicao" ? it.system.ativo !== false : it.type === "peculiaridade" ? it.system.ativo !== false : !!it.system.ativo;
      if (!ativo || naurenEhCondicaoModelo(it)) continue;
      if ((it.system.imunidadesCondicoes ?? []).some(bate)) return { nome: origem.name, fonte: it.name };
    }
    const cena = actor.getFlag?.("nauren", "imunidadesCena") ?? [];
    if (cena.some(e => e.combate === (game.combat?.id ?? "") && naurenNomeNormalizado(e.nome) === alvoNome)) return { nome: origem.name, fonte: "evitou antes neste combate" };
    return null;
  }
  /** Imunidade temporária (pelo combate) a uma Condição que o ator acabou de evitar (ver imuneAoEvitar). */
  static async registrarImunidadeAoEvitar(actor, origem) {
    if (!actor || !origem?.system?.imuneAoEvitar) return false;
    const lista = foundry.utils.deepClone(actor.getFlag("nauren", "imunidadesCena") ?? []).filter(e => e.combate === (game.combat?.id ?? ""));
    if (!lista.some(e => e.nome === origem.name)) lista.push({ nome: origem.name, combate: game.combat?.id ?? "" });
    await actor.setFlag("nauren", "imunidadesCena", lista).catch(() => {});
    return true;
  }
  /** Condições marcadas "sai ao atacar": consumidas quando o portador faz um teste de ataque. */
  static async consumirAoAtacar(actor) {
    if (!actor) return [];
    const itens = actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && i.system.removerAoAtacar && !naurenEhCondicaoModelo(i));
    if (!itens.length) return [];
    await naurenApagarItensSeExistirem(actor, itens.map(i => i.id));
    return itens.map(i => i.name);
  }
  static async consumirAoSofrerDano(actor, danoBruto) {
    if (!actor || !(Number(danoBruto) > 0)) return [];
    const itens = actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && i.system.removerAoSofrerDano && !naurenEhCondicaoModelo(i));
    if (!itens.length) return [];
    await naurenApagarItensSeExistirem(actor, itens.map(i => i.id));
    naurenPostarCard({ ator: actor, titulo: "Condição encerrada", icone: "icons/magic/time/hourglass-tilted-gray.webp", fonte: "Sofreu dano",
      linhas: itens.map(i => ({ label: i.name, value: "terminou", breakdown: `some ao sofrer dano (${danoBruto} recebido)` })) }).catch(() => {});
    return itens.map(i => i.name);
  }

  static aplicarReducaoPercentual(actor, danoBruto) {
    if (danoBruto <= 0) return danoBruto;
    // Dano Sofrido Extra (modificador "danoRecebido", ex.: Exposto): entra ANTES das
    // reduções, em todo dano que passa por aqui (ataque, Contra-Ataque, área, periódico).
    const extra = actor?.system?.danoRecebidoTotal ?? 0;
    let dano = extra ? Math.max(0, danoBruto + extra) : danoBruto;
    const percentual = actor?.system?.reducaoDanoPercentualTotal ?? 0;
    if (!percentual || dano <= 0) return dano;
    return Math.max(0, Math.floor(dano * (1 - percentual / 100)));
  }
  /** Cura Recebida reduzida em % (modificador "curaRecebidaPercentual", ex.: Putrefato = 100). */
  static ajustarCuraRecebida(actor, cura) {
    const pct = actor?.system?.curaRecebidaPercentualTotal ?? 0;
    if (!pct || !(cura > 0)) return { cura, cortada: 0 };
    const final = Math.max(0, Math.floor(cura * (1 - pct / 100)));
    const fontes = (actor.items ?? []).filter(i => ["condicao", "efeito"].includes(i.type) && (i.type === "efeito" ? i.system.ativo : i.system.ativo !== false)
      && (i.system.modificadores ?? []).some(m => m.campo === "curaRecebidaPercentual")).map(i => i.name);
    return { cura: final, cortada: cura - final, fontes };
  }

  /**
   * Calcula como um dano se divide entre o Escudo (temporário, ex:
   * "Escudo de Mana" do Mago) e a Vida de verdade - PURA (não aplica
   * nenhum update sozinha, só devolve os números; quem chamou decide
   * COMO gravar, já que os vários pontos de dano do sistema usam
   * caminhos de update diferentes - update() direto, atualizarAtorSeguro,
   * com/sem naurenOrigemCombate). Sem Escudo ativo (value 0), o dano
   * inteiro já sai como "danoNaVida", comportamento idêntico a antes
   * desta mecânica existir.
   */
  static calcularDanoComEscudo(actor, dano) {
    const escudoAtual = actor.system.escudo?.value ?? 0;
    if (escudoAtual <= 0 || dano <= 0) return { escudoConsumido: 0, danoNaVida: Math.max(0, dano), escudoRestante: escudoAtual };
    const escudoConsumido = Math.min(escudoAtual, dano);
    return { escudoConsumido, danoNaVida: dano - escudoConsumido, escudoRestante: escudoAtual - escudoConsumido };
  }

  /** Aplica uma alteração de recurso no alvo: Estresse SOMA (causa), os demais (Vida, Estamina, Mana, Destino) SUBTRAEM (gastam/drenam/causam dano) - sempre com clamp entre 0 e o máximo. */
  static async _aplicarRecursoNoAlvo(actor, recurso, quantidade) {
    if (!quantidade) return;
    if (recurso === "estresse") {
      const atual = actor.system.stress?.value ?? 0, max = actor.system.stress?.max ?? 2;
      await actor.update({ "system.stress.value": Math.max(0, Math.min(max, atual + quantidade)) });
      return;
    }
    // Recurso Customizado (ex: "recursoCustom:energia") - reaproveita a
    // MESMA função que os Gatilhos por Evento já usam pra conceder
    // recursos (naurenConcederRecurso), só que com o sinal invertido:
    // "Gastos de Recurso" SUBTRAI, então passa a quantidade negativa.
    if (recurso?.startsWith("recursoCustom:")) {
      // Devolve quanto mudou DE VERDADE (a Inundação Espiritual pode dobrar um ganho de Energia).
      const id = recurso.slice(14);
      const antes = (actor.system.recursosCustom ?? []).find(r => r.id === id)?.valor ?? 0;
      await naurenConcederRecurso(actor, recurso, String(-quantidade));
      return ((actor.system.recursosCustom ?? []).find(r => r.id === id)?.valor ?? 0) - antes;
    }
    const camposComMax = { vida: "vida", estamina: "estaminaCombate", mana: "mana", destino: "dadosDestino" };
    const campo = camposComMax[recurso];
    if (!campo) return;
    const atual = actor.system[campo]?.value ?? 0;
    // Bug real corrigido: faltava o clamp no MÁXIMO (só limitava o
    // mínimo em 0) - uma concessão (quantidade negativa, ex: regenerar
    // Mana de um Template Persistente) empurrava o valor acima do
    // máximo real do personagem.
    const max = actor.system[campo]?.max ?? Infinity;
    await actor.update({ [`system.${campo}.value`]: Math.max(0, Math.min(max, atual - quantidade)) });
  }

  /** Rola uma fórmula (ex: "1d4" ou "3") e devolve o total; fórmula inválida vira 0 em vez de travar a aplicação. */
  static async _rolarFormula(formula) {
    const f = String(formula ?? "0").trim() || "0";
    try {
      const roll = await new Roll(f).evaluate();
      return roll.total;
    } catch (err) {
      console.warn(`Nauren RPG | Fórmula "${f}" inválida, tratando como 0.`, err);
      return 0;
    }
  }

  /**
   * Aplica uma Condição (ou um Efeito) num ator, a partir do UUID do item
   * fonte no MUNDO (sidebar de Itens). Regras:
   * - Já existe (mesma CADEIA evolutiva) e é acumulável: soma acúmulos (até o
   *   máximo) - e se atingir "limiarAcumulos", evolui sozinha pro próximo
   *   estágio (ex: Sangramento 5+ vira Hemorragia).
   * - Já existe e é EVOLUTIVA: troca pela próxima da cadeia (proximaEvolucaoUuid).
   * - Já existe e não é nenhuma das duas: não duplica (mas RENOVA a duração,
   *   se a condição tiver duração automática configurada).
   * - Não existe: cria uma cópia embutida, guardando flags.core.sourceId +
   *   flags.nauren.cadeiaRaizUuid (usada pra reconhecer "esta é a mesma
   *   cadeia" mesmo depois de já ter evoluído pra outro item/uuid - ver nota
   *   abaixo) + system.duracaoRestante (se houver duração automática).
   *
   * IMPORTANTE (correção de bug): a Ação que causa Medo sempre aponta pro
   * MESMO uuid (o 1º estágio, ex: "Amedrontado"), mas depois da 1ª evolução o
   * item no ator passa a ter sourceId do estágio seguinte (ex: "Pânico").
   * Comparar só por "sourceId === uuidFonte" faz a 3ª aplicação não achar o
   * "Pânico" existente e criar um "Amedrontado" duplicado, travando a cadeia
   * na 2ª evolução. Por isso a raiz da cadeia (flags.nauren.cadeiaRaizUuid) é
   * sempre o uuid ORIGINAL usado na 1ª aplicação, e é ela - não o sourceId -
   * que localiza "já existe algo desta cadeia no alvo".
   */
  /**
   * @param {number} duracaoExtra - Rodadas extras somadas à duração
   * calculada (ver "Duração Extra por Crescimento" em condicoesAplicadas
   * da Ação, ex: Infusão Floral - "+2 Mana, a duração aumenta em 3
   * turnos"). 0 por padrão (nenhum ajuste).
   * @param {string} custoParaRemoverRecurso - Copiado pra dentro da
   * instância aplicada (ver "Custo pra Remover" no schema da Condição) -
   * "" (padrão) = remoção livre.
   * @param {string} overrideFormulaEfeitoPeriodico - Sobrescreve a
   * fórmula do 1º Efeito Periódico SÓ nesta instância (ex: Névoa de
   * Esporos - Envenenamento a 1d4 por acúmulo em vez do 1 padrão).
   * "" (padrão) = usa a fórmula normal da Condição.
   */
  static async aplicarCondicao(actor, uuidFonte, acumulosParaSomar = 1, raizForcada = null, rankParaCondicao = 0, duracaoExtra = 0, custoParaRemoverRecurso = "", custoParaRemoverQuantidade = "1", overrideFormulaEfeitoPeriodico = "", conjuradorUuid = "", modificadorExtra = 0, forcarMaximoEfeitoPeriodico = false, flagsExtras = null) {
    if (!uuidFonte) return null;
    if (actor?.getFlag?.("nauren", "entidade")) return null; // entidade de campo (muro, orbe...) não é criatura: não recebe Condições
    if (typeof uuidFonte === "string" && uuidFonte.startsWith("self:")) uuidFonte = naurenResolverSelf(uuidFonte, actor) || uuidFonte;
    const origem = await fromUuid(uuidFonte).catch(() => null);
    if (!origem) {
      console.warn(`Nauren RPG | Condição/Efeito ${uuidFonte} não encontrado.`);
      return null;
    }
    // Imune? Nada é aplicado; o card diz quem é imune e por quê (a não ser que quem chamou já
    // tenha escrito isso no card da Ação - ver _semCardImunidade).
    if (origem.type === "condicao") {
      const imune = this.imunidadeA(actor, origem);
      if (imune) {
        if (!flagsExtras?._semCardImunidade) naurenPostarCard({ ator: actor, titulo: `Imune a ${imune.nome}`, icone: origem.img, fonte: imune.fonte,
          linhas: [{ label: imune.nome, value: "não se aplica", breakdown: `${actor.name} é imune (${imune.fonte})` }] }).catch(() => {});
        return null;
      }
    }

    const raiz = raizForcada || uuidFonte;
    const donoDe = u => { try { const d = u ? fromUuidSync(u) : null; return (d?.actor ?? d)?.uuid ?? u ?? ""; } catch (err) { return u ?? ""; } };
    const porConjurador = origem.type === "condicao" && origem.system.unicaPorConjurador && !!conjuradorUuid;
    const existente = origem.type === "condicao"
      ? actor.items.find(i => i.type === "condicao" && i.getFlag("nauren", "cadeiaRaizUuid") === raiz && (!porConjurador || donoDe(i.system.conjuradorUuid) === donoDe(conjuradorUuid)))
      : actor.items.find(i => i.type === origem.type && (i.getFlag("nauren", "origemUuid") === uuidFonte || i.getFlag("core", "sourceId") === uuidFonte));
    if (existente && Number(flagsExtras?.somarCurtos)) await existente.setFlag("nauren", "acumulosCurtos", (existente.getFlag("nauren", "acumulosCurtos") ?? 0) + Number(flagsExtras.somarCurtos)).catch(() => {});
    if (existente && flagsExtras) {
      const semCurtos = Object.entries(flagsExtras).filter(([k]) => k !== "somarCurtos");
      if (semCurtos.length) await existente.update(Object.fromEntries(semCurtos.map(([k, v]) => [`flags.nauren.${k}`, v]))).catch(() => {});
    }

    if (existente && origem.type === "condicao") {
      // Evolução por REAPLICAÇÃO (Amedrontado→Pânico→Pavor, Atordoado→
      // Desacordado): só se aplica a condições evolutivas que NÃO são
      // acumuláveis. Se também fosse acumulável, a reaplicação precisa
      // SOMAR acúmulos primeiro (ramo abaixo) - senão a condição pularia
      // direto pro próximo estágio sem nunca acumular (ex: Sangramento
      // evoluiria no 2º golpe em vez de esperar atingir o limiar de acúmulos).
      if (origem.system.evolutiva && !origem.system.acumulativel && origem.system.proximaEvolucaoUuid) {
        await existente.delete();
        return this.aplicarCondicao(actor, origem.system.proximaEvolucaoUuid, 1, naurenRaizDaEvolucao(actor, origem.system.proximaEvolucaoUuid, raiz), rankParaCondicao, duracaoExtra, custoParaRemoverRecurso, custoParaRemoverQuantidade, overrideFormulaEfeitoPeriodico, conjuradorUuid);
      }
      if (origem.system.acumulativel) {
        const atual = existente.system.acumulos ?? 1;
        const novo = Math.min(atual + acumulosParaSomar, existente.system.acumulosMax || 99);
        const atualizacao = {};
        if (novo !== atual) atualizacao["system.acumulos"] = novo;
        if (rankParaCondicao && rankParaCondicao !== existente.system.rankAtual) atualizacao["system.rankAtual"] = rankParaCondicao;
        // Quem reaplica/renova por último passa a ser o conjurador
        // "dono" do efeito periódico (ver conjuradorUuid no schema) -
        // só atualiza se de fato vier um novo conjurador desta vez.
        if (conjuradorUuid && conjuradorUuid !== existente.system.conjuradorUuid) atualizacao["system.conjuradorUuid"] = conjuradorUuid;
        // Só sobrescreve se a fonte atual estiver de fato pedindo um
        // override diferente - senão uma reaplicação SEM override (ex:
        // um veneno comum reaplicando por cima) não "reseta" o valor
        // especial que outra fonte já tinha configurado antes.
        if (overrideFormulaEfeitoPeriodico && Array.isArray(existente.system.efeitosPeriodicos) && existente.system.efeitosPeriodicos[0]?.formula !== overrideFormulaEfeitoPeriodico) {
          const efeitosClonados = foundry.utils.deepClone(existente.system.efeitosPeriodicos);
          efeitosClonados[0].formula = overrideFormulaEfeitoPeriodico;
          atualizacao["system.efeitosPeriodicos"] = efeitosClonados;
        }
        // Bug real corrigido: os campos de CONFIGURAÇÃO do Limiar
        // (diferente de "acumulos", que é ESTADO do alvo) nunca eram
        // ressincronizados numa reaplicação - só na 1ª aplicação (via
        // "origem.toObject()" mais abaixo). Se o item no compêndio for
        // corrigido DEPOIS que o alvo já tinha a Condição aplicada,
        // reconjurar a magia parecia "não fazer nada": a cópia antiga
        // continuava com os valores velhos pra sempre. Estes SÃO
        // configuração (como a magia funciona), não estado do alvo -
        // sempre reflete a versão mais atual do item origem.
        for (const campo of ["acumulosMax", "limiarParaGatilho", "limiarDanoFormula", "limiarCondicaoUuid", "limiarCondicaoAcumulos", "limiarRemoverAcumulos", "limiarAviso"]) {
          if (origem.system[campo] !== existente.system[campo]) atualizacao[`system.${campo}`] = origem.system[campo];
        }
        // Mesmo fix do ramo não-acumulável abaixo: "efeitosPeriodicos"
        // (tabela "Por Rank" de Comunhão Natural/etc, e agora também
        // "forcarMaximoEfeitoPeriodico" de Abundância de Vida) também
        // precisa ressincronizar aqui, não só nos campos de Limiar acima.
        if (!overrideFormulaEfeitoPeriodico) {
          const efeitosBase = foundry.utils.deepClone(origem.system.efeitosPeriodicos ?? []);
          if (forcarMaximoEfeitoPeriodico && efeitosBase[0]) efeitosBase[0].forcarMaximo = true;
          if (JSON.stringify(efeitosBase) !== JSON.stringify(existente.system.efeitosPeriodicos ?? [])) {
            atualizacao["system.efeitosPeriodicos"] = efeitosBase;
          }
        }
        if (Object.keys(atualizacao).length) await existente.update(atualizacao);
        // Efeito Direto ao Atingir o Limiar (ver função compartilhada
        // - mesma lógica usada pelo clique manual +/- e pelo efeito
        // periódico "acumuloProprio", nunca duplicada) - dano/Condição
        // em "limiarParaGatilho", remoção independente em
        // "limiarRemoverAcumulos" (podem ser números diferentes).
        await naurenChecarLimiarEfeitoDireto(existente, actor, atual, novo);
        if (!actor.items.get(existente.id)) return; // removida pela função acima - não segue pro que vem abaixo
        // "Condição Atingiu Limiar" - dispara só na TRANSIÇÃO (não tinha
        // alcançado antes, agora alcançou), igual "Condição ao Atingir o
        // Máximo" dos Recursos Declarados, mas pra acúmulos de Condição.
        const limiar = origem.system.limiarParaGatilho || 0;
        if (limiar > 0 && atual < limiar && novo >= limiar) {
          naurenProcessarGatilhos("condicaoAtingiuLimiar", actor, { condicaoUuid: raiz, acumulos: novo }).catch(() => {});
          if (naurenEhItem(existente, "Ponto de Pintura")) naurenAvisarEstrelaDoArcoIris(actor, novo).catch(err => console.warn("Nauren RPG | Estrela do Arco Íris", err));
        }
        // Evolução automática por LIMIAR de acúmulos (ex: Sangramento -> Hemorragia)
        if (origem.system.evolutiva && (origem.system.limiarAcumulos || 0) > 0 &&
            novo >= origem.system.limiarAcumulos && origem.system.proximaEvolucaoUuid) {
          await existente.delete();
          return this.aplicarCondicao(actor, origem.system.proximaEvolucaoUuid, 1, naurenRaizDaEvolucao(actor, origem.system.proximaEvolucaoUuid, raiz), rankParaCondicao, duracaoExtra, custoParaRemoverRecurso, custoParaRemoverQuantidade, overrideFormulaEfeitoPeriodico, conjuradorUuid);
        }
        naurenProcessarGatilhos("euRecebiCondicao", actor, { condicaoUuid: raiz, condicaoNome: origem.name, condicaoItemId: existente.id, acumulosRecebidos: Math.max(1, acumulosParaSomar), alvoUuid: actor.uuid, atacanteTokenUuid: conjuradorUuid || "" }).catch(() => {});
        // "+N (agora T)": o card mostra quanto ESTA Ação deu, não só o total (antes "Queimando (3 acúmulos)" parecia 3 novos).
        return novo > atual ? `${origem.name} (+${novo - atual}, agora ${novo})` : `${origem.name} (já no máximo: ${novo})`;
      }
      // Não evolui nem acumula: reaplicar RENOVA a duração automática (se
      // houver) e atualiza o rank copiado (se o item que concede subiu de
      // rank desde a última vez) - sempre um dos dois pra valer a pena escrever.
      const atualizacao = {};
      if ((origem.system.duracaoRodadas || 0) > 0) {
        atualizacao["system.duracaoRestante"] = origem.system.duracaoRodadas + duracaoExtra;
        // Renovar = aplicar de novo agora: a âncora passa a ser o turno atual.
        Object.assign(atualizacao, naurenAncoraDuracaoAtual("system."));
      }
      if (rankParaCondicao && rankParaCondicao !== existente.system.rankAtual) atualizacao["system.rankAtual"] = rankParaCondicao;
      if (conjuradorUuid && conjuradorUuid !== existente.system.conjuradorUuid) atualizacao["system.conjuradorUuid"] = conjuradorUuid;
      // Bug real corrigido: "efeitosPeriodicos" (onde mora a tabela "Por
      // Rank" que Comunhão Natural/etc dependem, ver campoModificadorExterno
      // e naurenAplicarEfeitosPeriodicos) nunca era ressincronizado numa
      // reaplicação, só na 1ª aplicação - igual o bug já corrigido antes
      // pros campos de Limiar (ver comentário acima, ramo acumulável),
      // só que este nem tinha o fix ali. Se o alvo já tinha a Condição
      // (ex: Infusão Floral ainda ativa de um cast anterior) e o item de
      // origem mudou desde então (ex: subiu de rank via Comunhão Natural,
      // ou o próprio compêndio foi corrigido), a cópia antiga ficava
      // presa na tabela velha pra sempre - a cura nunca escalava de
      // verdade, mesmo com o rank certo copiado. Sempre reflete a versão
      // atual do item origem (é configuração, não estado do alvo) - e
      // "forcarMaximoEfeitoPeriodico" (ver campoCondicaoAplicada, ex:
      // Abundância de Vida, Druida) some por cima logo depois, então uma
      // Subclasse independente pode ligar/desligar isso a cada cast sem
      // depender de "origem" já vir com o campo marcado.
      {
        const efeitosBase = foundry.utils.deepClone(origem.system.efeitosPeriodicos ?? []);
        if (forcarMaximoEfeitoPeriodico && efeitosBase[0]) efeitosBase[0].forcarMaximo = true;
        if (JSON.stringify(efeitosBase) !== JSON.stringify(existente.system.efeitosPeriodicos ?? [])) {
          atualizacao["system.efeitosPeriodicos"] = efeitosBase;
        }
      }
      // Modificador Extra por Crescimento (ex: Jardim das Flores
      // Silvestres: "+1 Defesa por nível") - soma ao valor BASE (do
      // item ORIGEM no compêndio, nunca do "existente" já modificado)
      // pra não acumular de novo em cada renovação/rodada.
      if (modificadorExtra && Array.isArray(origem.system.modificadores) && origem.system.modificadores[0]) {
        const valorBase = Number(origem.system.modificadores[0].valor) || 0;
        const novoValor = String(valorBase + modificadorExtra);
        if (existente.system.modificadores?.[0]?.valor !== novoValor) {
          const modificadoresClonados = foundry.utils.deepClone(existente.system.modificadores);
          modificadoresClonados[0].valor = novoValor;
          atualizacao["system.modificadores"] = modificadoresClonados;
        }
      }
      if (custoParaRemoverRecurso && custoParaRemoverRecurso !== existente.system.custoParaRemoverRecurso) {
        atualizacao["system.custoParaRemoverRecurso"] = custoParaRemoverRecurso;
        atualizacao["system.custoParaRemoverQuantidade"] = custoParaRemoverQuantidade;
      }
      if (Object.keys(atualizacao).length) {
        await existente.update(atualizacao);
        return `${origem.name} (atualizado)`;
      }
      return null; // já tem e não acumula, não tem duração, nem mudou de rank: nada a fazer
    }
    if (existente) return null; // efeito repetido: não duplica

    // Grupo exclusivo (ex.: Orações do Ciclo): passa do limite, a Condição mais antiga do grupo sai.
    if (flagsExtras?.grupoExclusivo) {
      const doGrupo = actor.items.filter(i => i.type === "condicao" && i.getFlag("nauren", "grupoExclusivo") === flagsExtras.grupoExclusivo)
        .sort((a, b) => (a._stats?.createdTime ?? 0) - (b._stats?.createdTime ?? 0));
      const sobra = doGrupo.length - (Math.max(1, Number(flagsExtras.grupoLimite) || 1) - 1);
      if (sobra > 0) await actor.deleteEmbeddedDocuments("Item", doGrupo.slice(0, sobra).map(i => i.id)).catch(() => null);
    }

    const dados = origem.toObject();
    if (dados.flags?.nauren?.modelo) { delete dados.flags.nauren.modelo; dados.system.ativo = true; } // modelo da ficha do NPC vira Condição de verdade no alvo
    const curtosNovos = Number(flagsExtras?.somarCurtos) || 0;
    if (flagsExtras) { flagsExtras = { ...flagsExtras }; delete flagsExtras.somarCurtos; if (!Object.keys(flagsExtras).length) flagsExtras = null; }
    if (curtosNovos) dados.flags = { ...(dados.flags ?? {}), nauren: { ...(dados.flags?.nauren ?? {}), acumulosCurtos: curtosNovos } };
    if (flagsExtras) dados.flags = { ...(dados.flags ?? {}), nauren: { ...(dados.flags?.nauren ?? {}), ...flagsExtras } };
    // Marca "única por conjurador": uma por quem aplicou, com o nome dele (ex.: Marcado pelo Caçador (por Aria)).
    if (origem.type === "condicao" && origem.system.unicaPorConjurador && conjuradorUuid) {
      const quemAplicou = (() => { try { const d = fromUuidSync(conjuradorUuid); return d?.actor ?? d; } catch (err) { return null; } })();
      if (quemAplicou?.name) dados.name = `${origem.name} (por ${quemAplicou.name})`;
    }
    delete dados._id;
    // "flags.core.sourceId" foi REMOVIDO no Foundry V14 - mantido só por
    // compatibilidade externa, mas a checagem "existente" acima (e
    // qualquer outro código deste sistema) usa "nauren.origemUuid".
    foundry.utils.setProperty(dados, "flags.core.sourceId", uuidFonte);
    foundry.utils.setProperty(dados, "flags.nauren.origemUuid", uuidFonte);
    if (origem.type === "condicao") {
      foundry.utils.setProperty(dados, "system.acumulos", origem.system.acumulativel ? Math.max(1, acumulosParaSomar) : 1);
      foundry.utils.setProperty(dados, "system.ativo", true);
      foundry.utils.setProperty(dados, "flags.nauren.cadeiaRaizUuid", raiz);
      if (conjuradorUuid) foundry.utils.setProperty(dados, "system.conjuradorUuid", conjuradorUuid);
      // Modificador Extra por Crescimento (ver mesmo comentário no
      // caminho de renovação acima) - aqui "dados.system.modificadores"
      // já é a cópia fresca de "origem", então soma direto nela.
      if (modificadorExtra && Array.isArray(dados.system.modificadores) && dados.system.modificadores[0]) {
        const valorBase = Number(dados.system.modificadores[0].valor) || 0;
        dados.system.modificadores[0].valor = String(valorBase + modificadorExtra);
      }
      if (custoParaRemoverRecurso) {
        foundry.utils.setProperty(dados, "system.custoParaRemoverRecurso", custoParaRemoverRecurso);
        foundry.utils.setProperty(dados, "system.custoParaRemoverQuantidade", custoParaRemoverQuantidade);
      }
      if (overrideFormulaEfeitoPeriodico && Array.isArray(dados.system.efeitosPeriodicos) && dados.system.efeitosPeriodicos[0]) {
        dados.system.efeitosPeriodicos[0].formula = overrideFormulaEfeitoPeriodico;
      }
      if (forcarMaximoEfeitoPeriodico && Array.isArray(dados.system.efeitosPeriodicos) && dados.system.efeitosPeriodicos[0]) {
        dados.system.efeitosPeriodicos[0].forcarMaximo = true;
      }
      const duracao = (origem.system.duracaoRodadas || 0) + duracaoExtra;
      if (duracao > 0) {
        foundry.utils.setProperty(dados, "system.duracaoRestante", duracao);
        for (const [chave, valor] of Object.entries(naurenAncoraDuracaoAtual("system."))) foundry.utils.setProperty(dados, chave, valor);
      }
      // Copia o rank do item que concedeu (Habilidade/Arma/Magia com
      // "copiarRankDoItem" ligado em Condições Aplicadas) - habilita
      // "Por Rank" em efeitosPeriodicos/modificadores desta instância.
      if (rankParaCondicao) foundry.utils.setProperty(dados, "system.rankAtual", rankParaCondicao);
    }
    if (origem.type === "efeito") foundry.utils.setProperty(dados, "system.ativo", true);
    const [criadoCond] = await actor.createEmbeddedDocuments("Item", [dados]);
    // "Eu recebi uma Condição": só o PRÓPRIO ator reage (Vontade Férrea, Recusar o Destino, Transferir Aflição - monstros).
    if (origem.type === "condicao") {
      naurenProcessarGatilhos("euRecebiCondicao", actor, { condicaoUuid: raiz, condicaoNome: origem.name, condicaoItemId: criadoCond?.id ?? "", acumulosRecebidos: origem.system.acumulativel ? Math.max(1, acumulosParaSomar) : 1, alvoUuid: actor.uuid, atacanteTokenUuid: conjuradorUuid || "" })
        .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (eu recebi Condição).", err));
    }
    // Gatilho "Alguém recebeu uma Condição": dispara em TODO ator da cena
    // que tenha uma Habilidade reagindo a isso (ex: "Pânico" e "Se
    // Alimentar do Negativo", do Empíreo, que reagem a alguém ficar
    // Amedrontado). O "condicaoUuid" vai no contexto pra permitir filtrar
    // por uma Condição específica via "Condição Necessária" do gatilho.
    if (origem.type === "condicao") {
      naurenProcessarGatilhos("alguemRecebeuCondicao", actor, { condicaoUuid: raiz, condicaoNome: origem.name, alvoUuid: actor.uuid })
        .catch(err => console.warn("Nauren RPG | Falha ao processar gatilhos (recebeu Condição).", err));
    }
    // Já entra no limiar (ex.: 5 Pontos de Pintura de uma vez): mesma regra da transição acima.
    if (origem.type === "condicao" && criadoCond) {
      const limiarN = origem.system.limiarParaGatilho || 0, acN = criadoCond.system.acumulos ?? 1;
      if (limiarN > 0 && acN >= limiarN) {
        naurenProcessarGatilhos("condicaoAtingiuLimiar", actor, { condicaoUuid: raiz, acumulos: acN }).catch(() => {});
        if (naurenEhItem(criadoCond, "Ponto de Pintura")) naurenAvisarEstrelaDoArcoIris(actor, acN).catch(err => console.warn("Nauren RPG | Estrela do Arco Íris", err));
      }
    }
    // 0.94: entrar JÁ no limiar também dispara o Efeito Direto (dano/Condição/aviso/remoção) e a
    // evolução por acúmulos - antes só reaplicações cruzavam o limiar (10 de Sonolento de uma vez
    // ficava parado em 10 sem derrubar ninguém).
    if (origem.type === "condicao" && criadoCond && origem.system.acumulativel) {
      const acN = criadoCond.system.acumulos ?? 1;
      if ((origem.system.limiarParaGatilho || 0) > 0 || (origem.system.limiarRemoverAcumulos || 0) > 0) {
        await naurenChecarLimiarEfeitoDireto(criadoCond, actor, 0, acN);
      }
      if (actor.items.get(criadoCond.id) && origem.system.evolutiva && (origem.system.limiarAcumulos || 0) > 0 &&
          acN >= origem.system.limiarAcumulos && origem.system.proximaEvolucaoUuid) {
        await criadoCond.delete();
        return this.aplicarCondicao(actor, origem.system.proximaEvolucaoUuid, 1, naurenRaizDaEvolucao(actor, origem.system.proximaEvolucaoUuid, raiz), rankParaCondicao, duracaoExtra, custoParaRemoverRecurso, custoParaRemoverQuantidade, overrideFormulaEfeitoPeriodico, conjuradorUuid);
      }
      if (!actor.items.get(criadoCond.id)) return origem.name;
    }
    const sufixo = (origem.type === "condicao" && origem.system.acumulativel && acumulosParaSomar > 1) ? ` (${acumulosParaSomar} acúmulos)` : "";
    return `${origem.name}${sufixo}`;
  }
}

/**
 * Checa se um item de Condição já embutido no ator atingiu o "limiarAcumulos"
 * configurado e, se sim, evolui automaticamente pro próximo estágio da cadeia
 * - mesma lógica de NaurenAlvoHelper.aplicarCondicao, mas chamada a partir de
 * um ajuste MANUAL de acúmulos (botões +/- na lista da ficha), que não passa
 * pelo fluxo de aplicação em alvo.
 */
async function naurenChecarLimiarEvolucao(item) {
  if (!item || item.type !== "condicao") return;
  const sys = item.system;
  if (!sys.acumulativel || !sys.evolutiva) return;
  const limiar = sys.limiarAcumulos || 0;
  if (limiar <= 0) return;
  if ((sys.acumulos || 1) < limiar) return;
  if (!sys.proximaEvolucaoUuid) return;
  const actor = item.parent;
  if (!actor) return;
  const raiz = item.getFlag("nauren", "cadeiaRaizUuid") || item.getFlag("core", "sourceId") || sys.proximaEvolucaoUuid;
  await item.delete();
  await NaurenAlvoHelper.aplicarCondicao(actor, sys.proximaEvolucaoUuid, 1, raiz);
}

/**
 * Efeito Direto ao Atingir o Limiar (ver campoCondicaoAplicada >
 * limiarParaGatilho/limiarDanoFormula/limiarCondicaoUuid/
 * limiarRemoverAcumulos, ex: Bomba Cronometrada - "ao chegar em 10
 * acúmulos, explode causando 10d6 de dano") - função COMPARTILHADA
 * por TODOS os jeitos de mudar acúmulos (clique manual +/- na ficha,
 * reaplicação via Magia/Habilidade, efeito periódico "acumuloProprio")
 * pra nunca precisar duplicar esta lógica. Dispara só na TRANSIÇÃO
 * (não tinha alcançado antes, agora alcançou), independente pra cada
 * um dos dois limiares (podem ser números diferentes - ver schema).
 * "item" já precisa estar com os NOVOS acúmulos salvos quando esta
 * função é chamada; "atual" é o valor de ANTES da mudança.
 */
async function naurenChecarLimiarEfeitoDireto(item, actor, atual, novo) {
  if (!item || item.type !== "condicao" || !actor) return;
  const sys = item.system;
  const limiarGatilho = sys.limiarParaGatilho || 0;
  if (limiarGatilho > 0 && atual < limiarGatilho && novo >= limiarGatilho && (sys.limiarDanoFormula || sys.limiarCondicaoUuid || sys.limiarAviso || (sys.limiarEfeitos ?? []).length)) {
    let dano = 0, breakdown = "";
    if (sys.limiarDanoFormula) {
      try {
        // "@poderMagia" etc. vêm de quem CONJUROU a Condição (ex.: Bomba Cronometrada), se houver.
        let donoF = actor;
        try { const d = sys.conjuradorUuid ? fromUuidSync(sys.conjuradorUuid) : null; donoF = (d?.actor ?? d) || actor; } catch (err) { donoF = actor; }
        const formulaL = /@/.test(sys.limiarDanoFormula) ? naurenFormulaComTokensDoAtor(sys.limiarDanoFormula, donoF) : sys.limiarDanoFormula;
        const roll = await new Roll(formulaL).evaluate();
        if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true);
        dano = roll.total;
        breakdown = naurenRollToBreakdownText(roll);
      } catch (err) {
        console.warn(`Nauren RPG | Fórmula de "Dano ao Atingir o Limiar" inválida em "${item.name}".`, err);
      }
      if (dano > 0) await actor.update({ "system.vida.value": Math.max(0, actor.system.vida.value - dano) });
    }
    let nomeCondicaoLimiar = "";
    if (sys.limiarCondicaoUuid) {
      const acumulosLimiar = Math.max(1, Math.round(naurenInterpretarModificador(sys.limiarCondicaoAcumulos || "1", actor)?.valor ?? 1));
      nomeCondicaoLimiar = await NaurenAlvoHelper.aplicarCondicao(actor, sys.limiarCondicaoUuid, acumulosLimiar) || "";
    }
    const secondaryLines = [];
    if (breakdown) secondaryLines.push({ label: "Dano", value: dano, breakdown });
    if (nomeCondicaoLimiar) secondaryLines.push({ label: "Condição recebida", value: nomeCondicaoLimiar });
    // 0.94.3: efeitos simples no limiar (Bomba Elétrica: explode em área).
    for (const ef of sys.limiarEfeitos ?? []) {
      try { const l = await naurenAplicarEfeitoSimples(actor, ef, { fonte: item.name, subst: { acumulos: novo } }); if (l) secondaryLines.push({ label: ef.rotulo || "Efeito", value: l }); }
      catch (err) { console.warn(`Nauren RPG | efeito no limiar de "${item.name}"`, err); }
    }
    if (sys.limiarAviso) {
      let quem = "";
      try { const d = sys.conjuradorUuid ? fromUuidSync(sys.conjuradorUuid) : null; quem = (d?.actor ?? d)?.name ?? ""; } catch (err) { quem = ""; }
      secondaryLines.push({ label: "Para o Mestre", value: "", breakdown: String(sys.limiarAviso).replace(/\{quem\}/g, quem || "quem aplicou") });
      if (quem) secondaryLines.push({ label: "Quem aplicou", value: quem });
    }
    if (secondaryLines.length) {
      await actor.sheet?._postRollCard?.({
        title: `${item.name} — ${limiarGatilho} acúmulos`, icon: item.img, d20Result: null, secondaryLines
      });
    }
  }
  // Remover ao Atingir X Acúmulos - limiar INDEPENDENTE do de cima (ver
  // schema): checa por último, já que remover o item não deve impedir
  // o dano/Condição acima de disparar antes, se ambos os limiares
  // foram cruzados na mesma mudança.
  const limiarRemover = sys.limiarRemoverAcumulos || 0;
  if (limiarRemover > 0 && atual < limiarRemover && novo >= limiarRemover) {
    await item.delete();
  }
}


export { NAUREN_BARRA_CORES_PADRAO, NAUREN_CRIADOR_ATRIBUTOS, NAUREN_CRIADOR_ETAPAS, NAUREN_CRIADOR_VALORES_FIXOS, NaurenActorSheet, NaurenAlvoHelper, NaurenCriadorPersonagem, NaurenRegionHelper, naurenAdicionarItemNaFicha, naurenBonusModoExtra, naurenChecarLimiarEfeitoDireto, naurenChecarLimiarEvolucao, naurenLinhaModoExtra, naurenNumeroModo };
