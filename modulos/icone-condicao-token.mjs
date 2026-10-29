/* Nauren RPG — Ícone da Condição no token. Separado do nauren.mjs na 0.94.31. */
import { NAUREN_CM_PECS, NAUREN_QUERY_APLICAR_CONDICAO, NAUREN_QUERY_DISPARAR_EVENTO, NAUREN_QUERY_ITEM_MESTRE, NaurenActorData, NaurenConcessaoHelper, NaurenCondicaoData, NaurenCriadorMonstro, NaurenEfeitoData, NaurenHabilidadeData, NaurenPeculiaridadeData, NaurenProgressaoHelper, NaurenSubclasseData, calcularVidaBase, campoAcao, campoGatilho, campoRecursoDeclarado, naurenAtaqueBasicoNaReacao, naurenAvaliarExpressaoSimples, naurenBotoesDirecaoGrimorio, naurenCondicaoNegativa, naurenContarAliadosProximos, naurenDescricaoParaChat, naurenDeslocarToken, naurenDisposicaoDoAtor, naurenEhCondicaoModelo, naurenEhItem, naurenEscolherCorDaPintura, naurenEscolherPontoNoMapa, naurenFormulaComTokensDoAtor, naurenFormulaParaTexto, naurenGrimorio, naurenInterpretarModificador, naurenInterpretarModificadorComDado, naurenItemCorrespondeAoAlvo, naurenMedirDistanciaBordas, naurenModsAcima, naurenMontarDescricao, naurenMoverGrimorio, naurenMoverTokenPara, naurenNomeDeToken, naurenNomeDoRecurso, naurenOperarRecursoViaMestre, naurenOperarRegistroPrioridade, naurenPostarCard, naurenRecarregarUsos, naurenRecursoDoAtor, naurenResolverPorNivel, naurenResolverPorRank, naurenResolverSelfEmObjeto, naurenResolverTokenFormula, naurenRollToBreakdownText, naurenRotuloToken, naurenTemEstado, naurenTextoRolagem, naurenUsosExtrasPara, naurenUsuarioResponsavel, naurenUuidPorSeed } from "../nauren.mjs";
import { NAUREN_GATILHO_EVENTO_OPCOES, RECURSOS_ALVO, naurenChaveEscopoRelogio, naurenNotificarGanhoPerda } from "./ficha-item.mjs";
import { NAUREN_HAB_MONSTROS_VERSAO } from "../data/habilidades-monstros.mjs";
import { NAUREN_MASCOTES_INICIAIS, NAUREN_PACKS_DEFINICAO, NAUREN_VERSAO_SEED_MASCOTES, naurenFundoPersonalizado, naurenGarantirAtorNoPack, naurenGatilhoDanoDeArea, naurenReconciliarMascote, naurenUuidsMascotes } from "./compendios.mjs";
import { NaurenAlvoHelper, NaurenRegionHelper } from "./ficha-ator.mjs";
import { naurenAnimarPassiva, naurenMotionEmTodos } from "./animacoes.mjs";
import { naurenBordaConfig, naurenBordaDadosPreparados } from "./borda-token.mjs";
/* =======================================
 * ÍCONE DA CONDIÇÃO NO TOKEN
 * -----------------------------------------------------------------------
 * Ponte: cada item de Condição num ator ganha um ActiveEffect nativo
 * "espelho" (sem nenhum efeito mecânico - os bônus continuam 100% no nosso
 * motor próprio). Em vez de montar o documento do ActiveEffect na mão (o que
 * exigiria adivinhar o schema exato da Active Effects V2 do V14), registramos
 * o status em CONFIG.statusEffects e usamos Actor#toggleStatusEffect - a
 * MESMA função que o Token HUD do próprio Foundry usa - garantindo que o
 * documento sai sempre no formato que a build atual espera. O número de
 * acúmulos vai no NOME (ex: "Sangramento (3)"), visível no tooltip do ícone.
 * Os hooks rodam SÓ no cliente de quem fez a mudança (userId), evitando
 * criação em dobro quando vários clientes estão conectados.
 * ======================================= */
/**
 * Só a parte de REGISTRAR o status na CONFIG global (sem tocar no
 * ActiveEffect em si) - usada tanto pela sincronização normal quanto pra
 * RESTAURAR os registros depois de um recarregamento de página. Esse
 * registro só existe em memória (não é salvo em lugar nenhum), mas o
 * ActiveEffect espelho e o próprio status no Ator SÃO salvos - sem
 * restaurar isso a cada carregamento, excluir uma Condição criada numa
 * sessão anterior falhava com "Invalid status ID" (ver
 * Hooks.on("deleteItem", ...) mais abaixo).
 */
function naurenRegistrarStatusDeCondicao(item) {
  const acumulos = item.system.acumulativel ? Math.max(1, item.system.acumulos || 1) : 1;
  const statusId = `nauren-cond-${item.id}`;
  const nomeExibido = acumulos > 1 ? `${item.name} (${acumulos})` : item.name;
  const img = item.img || "icons/svg/aura.svg";
  CONFIG.statusEffects ??= {};
  CONFIG.statusEffects[statusId] = { id: statusId, name: nomeExibido, img };
}

async function naurenSincronizarIconeDaCondicao(item) {
  const actor = item.parent;
  if (!actor) return;
  const acumulos = item.system.acumulativel ? Math.max(1, item.system.acumulos || 1) : 1;
  const statusId = `nauren-cond-${item.id}`;
  const nomeExibido = acumulos > 1 ? `${item.name} (${acumulos})` : item.name;
  const img = item.img || "icons/svg/aura.svg";

  // Registra (ou atualiza) esse status na CONFIG global - é o mesmo lugar de
  // onde o Token HUD lê nome/imagem de qualquer condição nativa do Foundry.
  naurenRegistrarStatusDeCondicao(item);

  try {
    const jaTem = actor.statuses?.has(statusId);
    if (!jaTem) {
      // Cria pelo caminho oficial - garante um documento 100% compatível
      // com o schema de Active Effects desta build, sem precisarmos montá-lo.
      await actor.toggleStatusEffect(statusId, { active: true });
    }
    // Depois de criado (ou se já existia): garante nome/imagem/acúmulos em
    // dia, e guarda o vínculo com o item de Condição pra achar de volta.
    const ae = actor.effects.find(e => e.statuses?.has(statusId));
    if (ae) {
      await ae.update({
        name: nomeExibido,
        img,
        "flags.nauren.condicaoItemId": item.id,
        "flags.nauren.acumulos": acumulos
      });
    }
  } catch (err) {
    console.warn("Nauren RPG | Não consegui sincronizar o ícone da condição no token.", err);
  }
}

/**
 * Aplica a Transformação de Token de uma Condição/Efeito (ver
 * usaTransformacao) no ator dono dela: troca a imagem (e opcionalmente o
 * tamanho) do(s) token(s) ativo(s) desse ator em qualquer cena aberta,
 * guardando os valores ORIGINAIS como flag no ATOR pra poder reverter
 * depois (ver naurenReverterTransformacaoToken). Se o ator já estiver
 * transformado por OUTRO item (duas Condições/Efeitos com Transformação
 * ao mesmo tempo), não sobrescreve - a primeira transformação "trava" até
 * ser removida, pra nunca perder o rastro de qual é a imagem de verdade.
 */
async function naurenAplicarTransformacaoToken(item) {
  const actor = item.parent;
  if (!actor || !item.system.usaTransformacao) return;
  if (actor.getFlag("nauren", "transformacaoAtiva")) return;

  const tokens = actor.getActiveTokens?.(true) ?? [];
  if (!tokens.length) return;

  const tokenDoc = tokens[0].document;
  await actor.setFlag("nauren", "transformacaoAtiva", {
    itemId: item.id,
    imagemOriginal: tokenDoc.texture?.src ?? actor.img,
    larguraOriginal: tokenDoc.width,
    alturaOriginal: tokenDoc.height
  });

  const updates = {};
  if (item.system.transformacaoImagem) updates["texture.src"] = item.system.transformacaoImagem;
  const tamanho = parseFloat(item.system.transformacaoTamanho);
  if (tamanho > 0) {
    updates.width = tamanho;
    updates.height = tamanho;
  }
  if (!Object.keys(updates).length) return;
  for (const t of tokens) {
    await t.document.update(updates).catch(err => console.warn("Nauren RPG | Falha ao aplicar a transformação no token.", err));
  }
}

/**
 * Reverte a Transformação de Token aplicada por "item" (só se ele for o
 * dono ATUAL da transformação registrada no ator - "flags.nauren.
 * transformacaoAtiva") - devolve a imagem/tamanho originais salvos e
 * limpa a flag. Chamado quando a Condição/Efeito com Transformação é
 * removido, desativado, ou expira por duração automática.
 */
async function naurenReverterTransformacaoToken(item) {
  const actor = item.parent;
  if (!actor) return;
  const registro = actor.getFlag("nauren", "transformacaoAtiva");
  if (!registro || registro.itemId !== item.id) return; // outra transformação está valendo agora - não mexe

  const tokens = actor.getActiveTokens?.(true) ?? [];
  const updates = { "texture.src": registro.imagemOriginal, width: registro.larguraOriginal, height: registro.alturaOriginal };
  for (const t of tokens) {
    await t.document.update(updates).catch(err => console.warn("Nauren RPG | Falha ao reverter a transformação do token.", err));
  }
  await actor.unsetFlag("nauren", "transformacaoAtiva");
}

/**
 * Garante que "actor.system.recursosCustom" tenha uma entrada pra cada
 * recurso declarado por QUALQUER Subclasse equipada (ver
 * NaurenSubclasseData#recursosDeclarados - ). Cria as que estão
 * faltando (valor 0), atualiza nome/max/ícone/cor das que já existem
 * (resolvendo a fórmula de novo), e NUNCA reduz o "valor" de uma que já
 * existe além de recortá-lo se o novo máximo ficou menor que o valor atual
 * - ou seja, preserva o progresso do jogador entre sincronizações.
 * Sincronização é de MÃO ÚNICA (item declara -> ator recebe): remover a
 * Subclasse NÃO apaga o recurso do ator automaticamente, de propósito -
 * apagar sozinho arriscaria perder valor acumulado sem querer; se for
 * necessário limpar, é feito manualmente.
 */
/**
 * Campos de "ESTADO DO JOGADOR" que uma Ressincronização com o Compêndio
 * NUNCA sobrescreve, mesmo quando o resto do item é atualizado com a
 * versão mais recente da fonte (Classe/Subclasse/Habilidade/Arma/
 * Armadura/Magia/Consumível/Efeito no compêndio). Nível superior do item
 * (system.<campo>) - ver NAUREN_CAMPOS_ESTADO_ACAO pra campos preservados
 * DENTRO de cada Ação/Efeito Vinculado.
 */
const NAUREN_CAMPOS_ESTADO_ITEM = [
  "rankAtual", "ativo", "usosPassivaAtual", "acaoAtivaIndex",
  "equipado", "quantidade", "cargasAtual", "acumulos", "duracaoRestante", "conjuradorUuid",
  "duracaoAncoraCombatenteId", "duracaoAncoraCombateId", "duracaoAncoraIniciativa", "duracaoUltimaRodada",
  "recursosDeclarados", // as barras já criadas ficam em system.recursosCustom do ATOR, não aqui - mas o "valor" de cada declaração (se algum dia existir) preservaria por este mesmo motivo
  // Histórico de concessões/upgrades (Classe/Subclasse - ver
  // NaurenConcessaoHelper.concederItem/registrarUpgrade/reverterTudo) -
  // bug real corrigido: sem isto, reconciliar uma Classe/Subclasse já
  // equipada apagava o rastro de tudo que ela já tinha concedido, sem
  // apagar os itens em si - "resetarSubclasse" (respec) parava de saber
  // o que reverter depois disso.
  "historico"
];
/** Campos de estado preservados DENTRO de cada entrada de "acoes" ao reconciliar. */
// Campos de uma Ação que são do JOGADOR (estado ou personalização) e não
// voltam ao valor do compêndio ao atualizar/ressincronizar.
const NAUREN_CAMPOS_ESTADO_ACAO = ["usosAtual", "cargasAtual", "usosBonusConsumidoAtual", "entidadeImagem"];

/**
 * Reconcilia UM item da ficha do Ator com a versão mais atual do mesmo
 * item no compêndio (achado por "flags.nauren.origemUuid" ou o antigo
 * "flags.core.sourceId", gravados na hora que o item foi concedido por
 * Classe/Subclasse/Nível - ver naurenConcederItem/naurenGarantirAtorNoPack).
 * Isso corrige, com 1 clique, itens que ficaram desatualizados na ficha
 * do jogador depois que uma Habilidade foi corrigida/melhorada no
 * compêndio (ex: um novo Gatilho por Evento adicionado) - sem precisar
 * remover e "jogar" a Classe/Subclasse de novo na ficha.
 *
 * Preserva SEMPRE (não sobrescreve, veja NAUREN_CAMPOS_ESTADO_ITEM/
 * NAUREN_CAMPOS_ESTADO_ACAO): rank investido, se está ativo/inativo,
 * usos já gastos (passivos ou de uma Ação/carga específica), equipado,
 * quantidade, índice da Ação ativa, e histórico de concessões/upgrades
 * (Classe/Subclasse). Tudo mais (descrição, Gatilhos, Efeitos
 * Vinculados, fórmulas de dano/cura, Emanação, Template Persistente
 * etc.) vem substituído pela versão do compêndio.
 *
 * "nos" (árvore de Subclasse) é mesclado por "id" (nunca por índice, já
 * que nós podem ser adicionados/reordenados no compêndio), preservando
 * só o "rankAtual" de cada nó que já existia - senão, reconciliar uma
 * Subclasse já equipada zeraria todo ponto já investido pelo jogador.
 * "efeitosVinculados"/"acoes" são mesclados POR ÍNDICE (a entrada N da
 * ficha do jogador reconcilia com a entrada N do compêndio) - assume que
 * a ORDEM dentro de cada lista não muda entre versões (só itens são
 * adicionados/corrigidos no lugar, não reordenados) - limitação aceita
 * em troca de simplicidade e previsibilidade.
 *
 * Devolve true se algo mudou, false se já estava tudo em dia (ou não
 * achou origem rastreável).
 */
async function naurenReconciliarItemComCompendio(item) {
  // Cópia de Falsificar Seu Destino: é congelada no nível de origem, com 1 uso por dia
  // e custos convertidos - ressincronizar desfaria tudo isso.
  if (item.getFlag?.("nauren", "emprestadaDe")) return false;
  const uuidOrigem = item.getFlag("nauren", "origemUuid") || item.getFlag("core", "sourceId");
  if (!uuidOrigem) return false;
  let origem = await fromUuid(uuidOrigem).catch(() => null);
  // Bug real corrigido (link órfão): o UUID salvo pode ter deixado de
  // existir (ex: o compêndio de origem foi apagado e recriado do zero
  // em algum momento - todo documento recriado do zero recebe um _id
  // NOVO do Foundry, mudando o UUID) - sem isto, o item ficava "preso"
  // apontando pra um fantasma pra sempre, e nem "Ressincronizar com o
  // Compêndio" nem um upgrade de Subclasse conseguiam mais alcançá-lo
  // (era exatamente essa a causa de "a Ação mudou de nome"/"parece que
  // não funciona mais" mesmo depois de ressincronizar). Tenta achar de
  // novo pelo NOME, no MESMO compêndio (extraído do próprio UUID
  // quebrado) - se achar, RE-LINKA salvando o UUID novo, então isto só
  // precisa acontecer uma vez por item.
  if (!origem) {
    const partesUuid = uuidOrigem.match(/^Compendium\.([^.]+)\.([^.]+)\.Item\./);
    const pack = partesUuid ? game.packs.get(`${partesUuid[1]}.${partesUuid[2]}`) : null;
    if (pack) {
      await pack.getIndex().catch(() => null);
      const encontrado = pack.index.find(i => i.name === item.name);
      if (encontrado) {
        origem = await pack.getDocument(encontrado._id).catch(() => null);
        if (origem) {
          await item.setFlag("nauren", "origemUuid", origem.uuid);
          console.log(`Nauren RPG | "${item.name}": UUID de origem estava órfão (compêndio recriado) - relinkado com "${origem.uuid}".`);
        }
      }
    }
  }
  if (!origem) return false; // fonte não existe mais, e não achou pelo nome - não mexe

  // O tipo do ITEM em si mudou desde a última sincronização (ex: uma
  // Habilidade que virou Magia de verdade, ver migração das magias do
  // Druida) - migra o "type" primeiro. Documentos do Foundry aceitam
  // trocar de type via update() normalmente (reencaixa "system" no
  // schema do tipo novo); "mudou" abaixo sempre vai ser true depois
  // disso, então a reconciliação de campos continua na sequência.
  let mudouTipo = false;
  if (origem.type !== item.type) {
    await item.update({ type: origem.type });
    mudouTipo = true;
  }

  // Mesmo fix de raiz de registrarUpgrade (ver comentário lá):
  // "toObject().system" (cópia PLANA garantida) em vez de deepClone
  // direto num "system" (instância de DataModel, não objeto puro).
  const systemOrigem = origem.toObject().system;
  const systemAtual = item.system;

  // Preserva os campos de nível superior marcados como "estado".
  for (const campo of NAUREN_CAMPOS_ESTADO_ITEM) {
    if (campo in systemAtual) systemOrigem[campo] = foundry.utils.deepClone(systemAtual[campo]);
  }

  // Bug real corrigido, sério: "nos" (a árvore de uma Subclasse) NUNCA
  // tinha tratamento especial aqui - reconciliar uma Subclasse já
  // concedida (qualquer Subclasse arrastada pra ficha ganha
  // "flags.core.sourceId" automaticamente, então SEMPRE cai neste
  // caminho) substituía a árvore INTEIRA pela versão do compêndio, com
  // todo "rankAtual" de cada nó voltando pra 0 - ou seja, "Ressincronizar
  // com o Compêndio" apagava TODOS os pontos de Subclasse já investidos
  // do jogador. Mescla por "id" (não por índice - nós podem ser
  // adicionados/reordenados no compêndio) preservando só o rank
  // investido de cada nó que já existia; nós novos do compêndio entram
  // do jeito que vieram (rank 0).
  if (Array.isArray(systemOrigem.nos) && Array.isArray(systemAtual.nos)) {
    systemOrigem.nos = systemOrigem.nos.map(noOrigem => {
      const noAtual = systemAtual.nos.find(n => n.id === noOrigem.id);
      if (!noAtual) return noOrigem;
      return { ...noOrigem, rankAtual: noAtual.rankAtual ?? 0 };
    });
  }

  // Mescla "acoes" por índice, preservando usos/cargas já gastos de cada uma.
  if (Array.isArray(systemOrigem.acoes) && Array.isArray(systemAtual.acoes)) {
    systemOrigem.acoes = systemOrigem.acoes.map((acaoOrigem, i) => {
      const acaoAtual = systemAtual.acoes[i];
      if (!acaoAtual) return acaoOrigem;
      const mesclada = foundry.utils.deepClone(acaoOrigem);
      for (const campo of NAUREN_CAMPOS_ESTADO_ACAO) {
        if (!(campo in acaoAtual)) continue;
        // Personalização (imagem): só preserva quando o jogador escolheu uma.
        if (campo === "entidadeImagem" && !acaoAtual[campo]) continue;
        mesclada[campo] = acaoAtual[campo];
      }
      return mesclada;
    });
  }

  // Mescla "efeitosVinculados" (nível do item) por índice, preservando o
  // "ativo" de CADA vínculo - alguns são toggle manual do jogador (ex:
  // "Presença" do Empíreo, ligada só durante Profusão Retraída), não
  // parte fixa da definição da Habilidade.
  if (Array.isArray(systemOrigem.efeitosVinculados) && Array.isArray(systemAtual.efeitosVinculados)) {
    systemOrigem.efeitosVinculados = systemOrigem.efeitosVinculados.map((efOrigem, i) => {
      const efAtual = systemAtual.efeitosVinculados[i];
      if (!efAtual) return efOrigem;
      return { ...efOrigem, ativo: efAtual.ativo };
    });
  }

  if (naurenFundoPersonalizado(systemAtual.imagemFundo)) systemOrigem.imagemFundo = systemAtual.imagemFundo;
  // Itens da Torre: a opção "escolhida ao receber" (efeito vinculado ativo) é do jogador - mantém.
  if (item.getFlag("nauren", "torre") && Array.isArray(systemAtual.efeitosVinculados) && Array.isArray(systemOrigem.efeitosVinculados))
    systemOrigem.efeitosVinculados = systemOrigem.efeitosVinculados.map((e, i) => ({ ...e, ativo: systemAtual.efeitosVinculados[i]?.ativo ?? e.ativo }));
  const mudou = mudouTipo || JSON.stringify(systemAtual) !== JSON.stringify(systemOrigem);
  if (mudou) await item.update({ system: systemOrigem });
  return mudou;
}

/**
 * Roda naurenReconciliarItemComCompendio em TODOS os itens rastreáveis
 * do Ator (qualquer um com origem gravada, normalmente Habilidade
 * concedida por Classe/Subclasse/Nível, mas também cobre Arma/Armadura/
 * Magia/Consumível/Efeito se algum dia forem concedidos da mesma forma).
 * Devolve quantos itens foram de fato atualizados.
 */
async function naurenReconciliarTodosOsItens(actor) {
  let atualizados = 0;
  for (const item of actor.items) {
    const mudou = await naurenReconciliarItemComCompendio(item).catch(err => {
      console.warn(`Nauren RPG | Falha ao reconciliar "${item.name}" com o compêndio.`, err);
      return false;
    });
    if (mudou) atualizados++;
  }
  return atualizados;
}

/**
 * Reaplica upgrades "campoCustomizado" de nós de Subclasse "apenasUpgrade"
 * já investidos (ex: Transbordar, Topiário, Vinhas Sagradas, Raízes
 * Afiadas, e o equivalente em outras Classes) num item que acabou de
 * ser reconciliado com o compêndio.
 *
 * Bug real corrigido: "naurenReconciliarItemComCompendio" restaura o
 * item alvo pra versão PURA do compêndio, só preservando os campos em
 * NAUREN_CAMPOS_ESTADO_ITEM/ACAO (rankAtual, usos, etc). Um upgrade
 * "campoCustomizado" escreve num campo ARBITRÁRIO (ex:
 * "acoes.1.gastosRecurso.0.quantidade", de Transbordar em Comungar) que
 * nunca está nessas listas - então clicar "Ressincronizar com o
 * Compêndio" apagava SILENCIOSAMENTE qualquer upgrade desse tipo já
 * investido, voltando o campo pro valor BASE do compêndio, sem nenhum
 * aviso. "rankAtual" sozinho (nós SEM campoCustomizado, ex: Comunhão
 * Natural, Restaurar o Verde) já sobrevivia normalmente, por estar na
 * lista de preservados - só os que usam "campoCustomizado" precisavam
 * deste passo extra. Roda sempre DEPOIS de naurenReconciliarTodosOsItens,
 * reaplicando por cima do item já fresco.
 */
async function naurenReaplicarUpgradesDeSubclasse(actor) {
  for (const subclasseItem of actor.items.filter(i => i.type === "subclasse")) {
    for (const no of (subclasseItem.system.nos ?? [])) {
      if (!no.apenasUpgrade || !no.campoCustomizado || !((no.rankAtual ?? 0) > 0) || !no.itemUuid) continue;
      const itemAlvo = actor.items.find(i => i.getFlag("nauren", "origemUuid") === no.itemUuid || i.getFlag("core", "sourceId") === no.itemUuid);
      if (!itemAlvo) continue;
      let valorFinal = no.valorCustomizado;
      if (no.valorCustomizadoPorRank?.length) {
        const aplicavel = no.valorCustomizadoPorRank.filter(p => p.rank <= no.rankAtual).sort((a, b) => b.rank - a.rank)[0];
        if (aplicavel) valorFinal = aplicavel.valor;
      }
      // Reaproveita registrarUpgrade (não escreve mais direto) - ela já
      // faz a escrita seguindo o caminho seguro (clona "system", edita a
      // cópia com setProperty, manda tudo de volta de uma vez - ver
      // NaurenConcessaoHelper.registrarUpgrade), em vez de um update()
      // com chave "dot-path" contendo índice de array cru.
      await NaurenConcessaoHelper.registrarUpgrade(subclasseItem, `no:${no.id}:rank:${no.rankAtual}`, itemAlvo, `system.${no.campoCustomizado}`, valorFinal);
    }
  }
}

/**
 * Migração única da Fase 3 (camadas de modificadores). Para cada personagem:
 *   1. atualiza as Subclasses com o compêndio (nós ganham "modificadores",
 *      ranks investidos preservados);
 *   2. devolve ao valor do compêndio os itens que eram alvo desses nós
 *      (o upgrade passa a vir da camada, no momento do uso);
 *   3. remove do histórico os upgrades antigos desses nós, para o respec
 *      não regravar valores velhos.
 * Roda uma vez por mundo, no Mestre ativo, depois da semeadura.
 */
async function naurenMigrarCamadasSubclasseV1() {
  if (game.settings.get("nauren", "migracaoCamadasSubclasseV1")) return;
  const atores = [...game.actors];
  for (const cena of game.scenes) for (const t of cena.tokens) if (!t.actorLink && t.actor) atores.push(t.actor);
  let personagens = 0, itens = 0;
  for (const actor of atores) {
    let mexeu = false;
    for (const sub of actor.items.filter(i => i.type === "subclasse")) {
      await naurenReconciliarItemComCompendio(sub).catch(err => console.warn(`Nauren RPG | Migração: falha ao atualizar "${sub.name}" de ${actor.name}.`, err));
      const atual = actor.items.get(sub.id);
      const nosComCamadas = (atual?.system.nos ?? []).filter(n => (n.modificadores ?? []).length);
      if (!nosComCamadas.length) continue;
      const alvos = new Map();
      const alvosDeRank = new Set();
      for (const no of nosComCamadas) {
        for (const m of no.modificadores) {
          for (const it of actor.items) {
            if (!naurenItemCorrespondeAoAlvo(it, m.itemAlvoUuid)) continue;
            alvos.set(it.id, it);
            if (m.campo === "rank") alvosDeRank.add(it.id);
          }
        }
      }
      for (const it of alvos.values()) {
        const mudou = await naurenReconciliarItemComCompendio(it).catch(() => false);
        if (mudou) itens++;
        // Rank gravado pelo formato antigo volta ao do compêndio (a camada
        // "rank" do nó passa a fornecer o valor no uso).
        if (alvosDeRank.has(it.id)) {
          const origemUuid = it.getFlag("nauren", "origemUuid") || it.getFlag("core", "sourceId");
          const origem = origemUuid ? await fromUuid(origemUuid).catch(() => null) : null;
          const rankBase = origem?.system?.rankAtual ?? 0;
          const atualIt = actor.items.get(it.id);
          if (atualIt && (atualIt.system.rankAtual ?? 0) !== rankBase) await atualIt.update({ "system.rankAtual": rankBase });
        }
      }
      const idsNos = new Set(nosComCamadas.map(n => n.id));
      const historico = foundry.utils.deepClone(atual.system.historico ?? []);
      let limpou = false;
      for (const entrada of historico) {
        const idNo = /^no:([^:]+):/.exec(entrada.origem ?? "")?.[1];
        if (idNo && idsNos.has(idNo) && (entrada.upgrades ?? []).length) { entrada.upgrades = []; limpou = true; }
      }
      if (limpou) await atual.update({ "system.historico": historico });
      mexeu = true;
    }
    if (mexeu) personagens++;
  }
  await game.settings.set("nauren", "migracaoCamadasSubclasseV1", true);
  if (personagens) {
    naurenPostarCard({
      titulo: "Subclasses atualizadas", icone: "icons/sundries/scrolls/scroll-bound-black-brown.webp", fonte: "Migração da versão 0.9",
      linhas: [
        { label: "Personagens", value: personagens },
        { label: "Itens restaurados ao compêndio", value: itens },
        { label: "Como funciona agora", value: "upgrades de Subclasse são aplicados no uso, sem alterar os itens" }
      ]
    });
  }
}

/**
 * Quando o sistema muda de versão, pergunta ao Mestre se quer levar as
 * mudanças do compêndio para os itens que os personagens JÁ têm (mesma
 * sequência do botão "Ressincronizar com o Compêndio": mantém ranks
 * investidos, usos gastos e recursos). Pergunta uma vez por versão.
 */
/**
 * Migração única: o "Efeito permanente em você" da 0.18.1 guardava uma
 * fórmula ("-3-3*@penitenciaAceita") no campo "sem penitência". Converte em
 * dois números: sem penitência (com 0) e com penitência (com 1).
 */
/** Mago (Fase 8): marca no compêndio as habilidades das vias antigas como removidas. */
async function naurenMigrarMagoAntigoV1() {
  if (game.settings.get("nauren", "migracaoMagoAntigoV2")) return;
  const pack = game.packs.find(pk => pk.metadata.label === "Nauren - Habilidades de Classe");
  if (!pack) return;
  const seeds = new Set(["habilidade-mago-aspesctus-sternvaloir", "habilidade-mago-buracos-de-minhoca", "habilidade-mago-calice-azul", "habilidade-mago-cephaline-lazuli", "habilidade-mago-convergencia", "habilidade-mago-convergencia-elemental", "habilidade-mago-convocar-meteoro", "habilidade-mago-destrutivo", "habilidade-mago-esfera-congelante", "habilidade-mago-explosao-purpura", "habilidade-mago-explosao-residual", "habilidade-mago-facas-gelidas", "habilidade-mago-imolacao", "habilidade-mago-impacto-arcano", "habilidade-mago-invocar-fiolomena", "habilidade-mago-mistura-de-mana-e-tinta", "habilidade-mago-nova-congelante", "habilidade-mago-proto-astrocrisol", "habilidade-mago-raios-dourados", "habilidade-mago-runas-sternavaloir", "habilidade-mago-simbolo-guylian"]);
  await pack.getIndex({ fields: ["flags.nauren.seedId"] });
  const trancado = pack.locked;
  if (trancado) await pack.configure({ locked: false });
  for (const e of pack.index.filter(x => seeds.has(x.flags?.nauren?.seedId))) {
    if (String(e.name).startsWith("[Removida")) continue;
    const doc = await pack.getDocument(e._id);
    await doc.update({ name: `[Removida v0.26] ${doc.name}` }).catch(() => {});
  }
  if (trancado) await pack.configure({ locked: true });
  // As vias antigas também criavam magias no compêndio de Magias.
  const packM = game.packs.find(pk => pk.metadata.label === "Nauren - Magias");
  const seedsM = new Set([]);
  if (packM && seedsM.size) {
    await packM.getIndex({ fields: ["flags.nauren.seedId"] });
    const trancadoM = packM.locked;
    if (trancadoM) await packM.configure({ locked: false });
    for (const e of packM.index.filter(x => seedsM.has(x.flags?.nauren?.seedId))) {
      if (String(e.name).startsWith("[Removida")) continue;
      const doc = await packM.getDocument(e._id);
      await doc.update({ name: `[Removida v0.26] ${doc.name}`, "system.ehMagiaDeMago": false }).catch(() => {});
    }
    if (trancadoM) await packM.configure({ locked: true });
  }
  await game.settings.set("nauren", "migracaoMagoAntigoV2", true);
  await game.settings.set("nauren", "migracaoMagoAntigoV1", true);
}

/** Caçador: a Marca passou a guardar o benefício; os 3 Efeitos antigos saem das fichas. */
/** Coluna da esquerda das árvores não tem pré-requisito: Fulgor (Empíreo) e Raízes Afiadas (Druida). */
/** Amedrontado/Pânico/Pavor já existentes no compêndio: +1/+2/+3 de Estamina em ações e movimentos. */
/** Ímpeto e Fadiga (Empíreo) são ataques especiais: gastam só o custo da habilidade, não o da arma. */
async function naurenMigrarImpetoFadigaCustoV1() {
  const ajustar = async it => {
    if (it?.type !== "habilidade" || !(naurenEhItem(it, "Ímpeto") || naurenEhItem(it, "Fadiga"))) return;
    const acoes = foundry.utils.deepClone(it.system.acoes ?? []);
    if (!acoes.some(a => a.usaArmaEscolhidaSomaCusto)) return;
    acoes.forEach(a => { a.usaArmaEscolhidaSomaCusto = false; });
    await it.update({ "system.acoes": acoes }).catch(() => {});
  };
  const pk = game.packs.find(p => p.metadata.label === "Nauren - Habilidades de Classe");
  if (pk) for (const doc of await pk.getDocuments()) await ajustar(doc);
  for (const a of game.actors) for (const it of a.items) await ajustar(it);
  for (const it of game.items) await ajustar(it);
}

/** Catalisadores já existentes: remove a Ação "Ataque Pesado". */
async function naurenMigrarCatalisadorSemPesadoV1() {
  const ajustar = async it => {
    if (it?.type !== "arma" || it.system.categoria !== "Catalisador") return;
    const acoes = (it.system.acoes ?? []).filter(a => a.nome !== "Ataque Pesado");
    if (acoes.length !== (it.system.acoes ?? []).length) await it.update({ "system.acoes": acoes }).catch(() => {});
  };
  const pk = game.packs.find(p => p.metadata.label === "Nauren - Armas");
  if (pk) for (const doc of await pk.getDocuments()) await ajustar(doc);
  for (const a of game.actors) for (const it of a.items) await ajustar(it);
  for (const it of game.items) await ajustar(it);
}

/** Traço Etéreo passa a ser dano verdadeiro; a Caligrafia Etérea ganha a Ação de 4 Energia (todos os efeitos). */
async function naurenMigrarCaligrafiaV1() {
  const ajustar = async it => {
    if (it?.type === "condicao" && naurenEhItem(it, "Traço Etéreo") && !it.system.proximaAcaoDanoVerdadeiro)
      await it.update({ "system.proximaAcaoDanoVerdadeiro": true }).catch(() => {});
    if (it?.type === "habilidade" && naurenEhItem(it, "Caligrafia Etérea")) {
      const acoes = foundry.utils.deepClone(it.system.acoes ?? []);
      if (acoes.some(a => /4 Energia/.test(a.nome ?? ""))) return;
      const postura = acoes.find(a => /Postura/.test(a.nome ?? ""))?.condicoesAplicadas?.[0]?.uuid;
      const traco = acoes.find(a => /Dano/.test(a.nome ?? ""))?.condicoesAplicadas?.[0]?.uuid;
      if (!postura || !traco) return;
      acoes.push({ nome: "Caligrafia — Todos os efeitos (4 Energia)", custoEstamina: 2, alcance: "pessoal",
        usaTemplate: true, templateTipo: "circle", templateTamanho: 5, modoAlvo: "area", modoAlvoTravado: true, areaDisposicao: "aliados",
        custosRecursoProprio: [{ recurso: "recursoCustom:energia", quantidade: "4", ativo: true }],
        curas: [{ formula: "1d4", aplicarNoAlvo: true }],
        condicoesAplicadas: [
          { uuid: postura, acumulos: 1, ativo: true, soSeAcertar: false, perguntarParaEvitar: false },
          { uuid: traco, acumulos: 1, ativo: true, soSeAcertar: false, perguntarParaEvitar: false }] });
      await it.update({ "system.acoes": acoes }).catch(() => {});
    }
  };
  for (const rotulo of ["Nauren - Habilidades de Classe", "Nauren - Condições e Venenos"]) {
    const pk = game.packs.find(p => p.metadata.label === rotulo);
    if (pk) for (const doc of await pk.getDocuments()) await ajustar(doc);
  }
  for (const a of game.actors) for (const it of a.items) await ajustar(it);
  for (const it of game.items) await ajustar(it);
}

/** Fichas de personagem com dono jogador que ficaram Hostis: passam a Amigáveis (ficha e tokens). Uma vez só. */
async function naurenMigrarDisposicaoJogadoresV1() {
  if (!game.user.isGM || game.settings.get("nauren", "migracaoDisposicaoV1")) return;
  const HOST = CONST.TOKEN_DISPOSITIONS.HOSTILE, AMIGO = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
  for (const a of game.actors) {
    if (a.type !== "personagem") continue;
    const temJogador = game.users.some(u => !u.isGM && a.testUserPermission(u, "OWNER"));
    if (!temJogador) continue;
    if (a.prototypeToken?.disposition === HOST) await a.update({ "prototypeToken.disposition": AMIGO }).catch(() => {});
    for (const cena of game.scenes) {
      const ids = cena.tokens.filter(t => t.actorId === a.id && t.disposition === HOST).map(t => ({ _id: t.id, disposition: AMIGO }));
      if (ids.length) await cena.updateEmbeddedDocuments("Token", ids).catch(() => {});
    }
  }
  await game.settings.set("nauren", "migracaoDisposicaoV1", true);
}

async function naurenMigrarCustoMedoV1() {
  const pk = game.packs.find(p => p.metadata.label === "Nauren - Condições e Venenos");
  if (!pk) return;
  const valores = { "condicao-amedrontado": 1, "condicao-panico": 2, "condicao-pavor": 3 };
  for (const [seed, v] of Object.entries(valores)) {
    const u = await naurenUuidPorSeed(pk, seed); const doc = u ? await fromUuid(u).catch(() => null) : null;
    if (doc && !doc.system.custoEstaminaExtraAcoes) await doc.update({ "system.custoEstaminaExtraAcoes": v });
  }
}

async function naurenMigrarPrereqColunaEsquerdaV1() {
  const alvos = new Set(["fulgor", "raizes-afiadas"]);
  const subclasses = [...(game.items ?? []).filter(i => i.type === "subclasse"),
    ...Array.from(game.actors ?? []).flatMap(a => a.items.filter(i => i.type === "subclasse"))];
  let n = 0;
  for (const sub of subclasses) {
    const nos = foundry.utils.deepClone(sub.system.nos ?? []);
    let mudou = false;
    for (const no of nos) if (alvos.has(no.id) && (no.prerequisitos ?? []).length) { no.prerequisitos = []; mudou = true; }
    if (mudou) { await sub.update({ "system.nos": nos }); n++; }
  }
  if (n) console.log(`Nauren RPG | ${n} subclasse(s): pré-requisito removido da coluna da esquerda (Fulgor, Raízes Afiadas).`);
}

async function naurenMigrarMarcaCacadorV1() {
  if (game.settings.get("nauren", "migracaoMarcaCacadorV1")) return;
  const seeds = new Set(["efeito-cacador-foco-mortal", "efeito-cacador-tiro-letal", "efeito-cacador-reflexos-de-caca"]);
  const ehAntigo = i => i.type === "efeito" && seeds.has(i.getFlag("nauren", "seedId"));
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) {
    const ids = a.items.filter(ehAntigo).map(i => i.id);
    if (ids.length) await a.deleteEmbeddedDocuments("Item", ids).catch(() => {});
  }
  const packE = game.packs.find(pk => pk.metadata.label === "Nauren - Efeitos");
  if (packE) {
    await packE.getIndex({ fields: ["flags.nauren.seedId"] });
    const trancado = packE.locked;
    if (trancado) await packE.configure({ locked: false });
    for (const e of packE.index.filter(x => seeds.has(x.flags?.nauren?.seedId))) {
      if (String(e.name).startsWith("[Removid")) continue;
      const doc = await packE.getDocument(e._id);
      await doc.update({ name: `[Removido v0.27] ${doc.name}` }).catch(() => {});
    }
    if (trancado) await packE.configure({ locked: true });
  }
  await game.settings.set("nauren", "migracaoMarcaCacadorV1", true);
}

/**
 * 0.88.7 - Ladino: as cópias nas fichas guardavam a versão antiga de
 * Marcar o Alvo (+1d6 por informação, em vez do dado da arma) e do nó
 * Olhar da Morte (mexia numa Condição que a Análise Paciente não aplica
 * mais, então o 2º estudo nunca aparecia). Atualiza as cópias.
 */
async function naurenMigrarLadinoEstudosV1() {
  if (game.settings.get("nauren", "migracaoLadinoEstudosV3")) return;
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  const novoEfeito = { ativo: true, tipoAtaque: "qualquer", tipoArma: "", condicaoUuid: "", acumulos: "1", multiplicarPeloRank: false, danoExtraDado: "", dadosExtrasDaArma: "1", multiplicarPorInformacoes: true };
  const descMarcar = naurenMontarDescricao({ regra: "Causa 1 dado extra de dano para cada informação que você tem de um alvo.", automatico: "em qualquer ataque contra um alvo que você estudou, +1 dado DA ARMA por informação sua sobre ele (ex.: adaga 1d4 com 3 informações = +3d4).", manual: "" });
  const novoAvaliar = { ativo: true, tipoAtaque: "qualquer", tipoArma: "", condicaoUuid: "", acumulos: "1", multiplicarPeloRank: false, danoExtraDado: "", criticoPorInformacao: true, soPrimeiroAtaque: false };
  const descAvaliar = naurenMontarDescricao({ regra: "Quando você adquire informação do inimigo com Análise Paciente, sua chance de crítico aumenta em 1 contra ele para cada informação, no seu primeiro ataque contra ele.", automatico: "no primeiro ataque contra o alvo DEPOIS dos estudos, o crítico fica 1 mais fácil por informação nova (estudada desde o seu último ataque contra ele); esse ataque gasta as informações novas, e para valer de novo é preciso estudar de novo. O total de informações (usado por Marcar o Alvo etc.) não diminui.", manual: "" });
  const corrigirNos = nos => {
    let mudou = false;
    const novos = (nos ?? []).map(no => {
      if (no?.id !== "olhar-da-morte") return no;
      const mods = (no.modificadores ?? []).map(m => /condicoesAplicadas\.0\.acumulos$/.test(String(m.campo ?? "")) ? (mudou = true, { ...m, campo: "acoes.0.estudosPorSucesso" }) : m);
      return { ...no, modificadores: mods };
    });
    return mudou ? novos : null;
  };
  const tratar = async (dono, itens) => {
    const upd = [];
    for (const i of itens) {
      if (i.type === "habilidade" && i.getFlag("nauren", "seedId") === "habilidade-ladino-analise-paciente") {
        const tipos = (i.system.tiposEstudo ?? []).map(t => (t.id === "lerdeza" || t.id === "desestabilizar") ? { ...t, sobeComRank: true } : t);
        if (tipos.some((t, k) => t.sobeComRank !== i.system.tiposEstudo[k].sobeComRank)) upd.push({ _id: i.id, "system.tiposEstudo": tipos });
      } else if (i.type === "habilidade" && i.getFlag("nauren", "seedId") === "habilidade-ladino-avaliar") {
        upd.push({ _id: i.id, "system.bonusCondicionalAoAlvo": [], "system.efeitosEmAtaques": [novoAvaliar], "system.descricao": descAvaliar });
      } else if (i.type === "subclasse") {
        // (Marcar o Alvo não é mais tocado aqui: no livro 0.8 ele virou +1 uso de Análise Paciente.)
        const nos = corrigirNos(i.system.nos);
        if (nos) upd.push({ _id: i.id, "system.nos": nos });
      }
    }
    if (!upd.length) return;
    if (dono) await dono.updateEmbeddedDocuments("Item", upd).catch(err => console.warn("Nauren RPG | migração Ladino", dono.name, err));
    else for (const u of upd) await game.items.get(u._id)?.update(u).catch(() => {});
  };
  for (const a of atores) await tratar(a, a.items);
  await tratar(null, game.items);
  await game.settings.set("nauren", "migracaoLadinoEstudosV3", true);
}

/**
 * 0.90.0 - Livro 0.8 (mudanças pequenas):
 * - Combustão passou de 5 para 4 pontos: quem tinha 5 fica com 4 e recebe 1 ponto de Subclasse de volta.
 * - Baderna passou a ser um item próprio (gera 1 Estamina ao usar a Invisível no Caos): quem já tinha o nó recebe o item.
 * O resto (Traço Celestial, Shirintou, Sequência, Apoteose...) chega pela ressincronização da versão.
 */
/** Revisão do Místico (0.91.7): as cópias nas fichas recebem os seeds corrigidos. */
async function naurenMigrarMisticoRevisaoV1() {
  if (game.settings.get("nauren", "migracaoMisticoRevisaoV2")) return;
  const nomes = ["Caligrafia Etérea", "Brinde ao Destino", "Restauração Interior", "Arte Divina", "Estrela do Arco Íris, Otaki", "Sutra das Mil Formas", "Poesia da Chuva",
    "Marcado pela Epigrafia da Morte", "Poesia Lunar", "Pintura da Harmonia", "Traço da Aquarela", "Ponto de Pintura"];
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  let total = 0;
  for (const a of atores) for (const it of Array.from(a.items)) {
    if (!nomes.some(n => naurenEhItem(it, n))) continue;
    const mudou = await naurenReconciliarItemComCompendio(it).catch(() => false);
    if (mudou) total++;
  }
  await game.settings.set("nauren", "migracaoMisticoRevisaoV2", true);
  if (total) console.log(`Nauren RPG | Revisão do Místico: ${total} item(ns) de ficha atualizados.`);
}

/**
 * Revisão do Ladino (0.91.9): Invisível no Caos ganha o lembrete "Na mesa" no card e Marcar o Alvo a
 * descrição nova; usos "por cena" que ficaram abaixo do máximo do nível (habilidade ganha num nível
 * alto começava com o valor do nível 1) são completados em quem não está num combate em andamento.
 */
async function naurenMigrarLadinoRevisaoV1() {
  if (game.settings.get("nauren", "migracaoLadinoRevisaoV1")) return;
  const nomes = ["Invisível no Caos", "Marcar o Alvo"];
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  const emCombate = new Set();
  for (const cb of game.combats ?? []) if (cb.started) for (const c of cb.combatants ?? []) if (c.actor) emCombate.add(c.actor.uuid);
  let total = 0;
  for (const a of atores) {
    for (const it of Array.from(a.items)) {
      if (!nomes.some(n => naurenEhItem(it, n))) continue;
      if (await naurenReconciliarItemComCompendio(it).catch(() => false)) total++;
    }
    if (a.type === "personagem" && !emCombate.has(a.uuid)) await naurenRecarregarUsos(a, "cena").catch(() => {});
  }
  await game.settings.set("nauren", "migracaoLadinoRevisaoV1", true);
  if (total) console.log(`Nauren RPG | Revisão do Ladino: ${total} item(ns) de ficha atualizados.`);
}

/**
 * Revisão de todas as classes (0.92.0): as cópias nas fichas recebem os seeds corrigidos
 * (ações novas, descrições para o jogador, regras automatizadas) e as árvores de Subclasse
 * recebem os nós atualizados, sempre preservando ranks, usos e estados ativos.
 */
async function naurenMigrarRevisaoClasses092() {
  if (game.settings.get("nauren", "migracaoRevisaoClasses0921")) return;
  const nomes = ["Guardas", "Juramento da Guarda", "Postura Real", "Avançar!", "Chamar as Armas", "Estilo das Marés", "Corpo de Pedra", "Bastião", "Aparar Mestre", "Resiliente", "Superioridade", "Treinamento Vermelho", "Berserker", "Destruição Mútua", "Remédios do Caçador", "Receita Antiga", "Disparo Carregado", "Toxina Laminar", "Instinto de Sobrevivência", "Guarda Defensiva (com Escudo)", "Guarda Defensiva (Arma Pesada)", "Guarda Defensiva (Arma Normal)", "Guarda Ofensiva (Arma Pesada)", "Guarda Ofensiva (Arma Normal)", "Florescer de Espinhos", "Comungar", "Infusão Floral", "Jardim das Flores Silvestres", "Força da Natureza", "Sabedoria das Copas", "Continuar a Crescer", "Dar Prioridade", "Abundância de Vida", "Florescer da Vida", "Oásis Verdejante", "Bênção dos Cristais", "Bênção de Laguna", "Cometa Lunar", "Forma Senhor da Floresta", "Forma Sábio dos Matos", "Fortificar as Bênçãos", "Circuito de Crescimento", "Santuário Selvagem", "Lótus Astral", "Cristal Genesis", "Cultivar a Utopia", "Temporada de Crescimento", "Solo Fértil", "Esquiva Instintiva", "Maestria Interior", "Fadiga", "Sendo um Mago", "Palavra de Destino: Benedictio", "Raiva", "Poesia da Chuva", "Movimento do Escritor", "Toque da Graça", "Proteção Celestial", "Salto Etéreo", "Penitência Desesperada", "Halo", "Punição Celestial", "Banhar-se em Graças", "Caridade", "Virtude da Determinação", "Força Interior", "Solitude", "Explorar a Dor", "Comandante das Tropas", "Investida Relâmpago", "Garras/Presas (Senhor da Floresta)", "Forma Arauto Lunar", "Manutenção do Prisma", "Rapidez", "Oportunismo", "Canalizar o Espírito", "Prisão das Brumas", "Sutra das Mil Formas", "Queda Lenta", "Portal", "Conjurar Objeto", "Criar Comida e Bebida", "Invisibilidade", "Levitar"];
  const renomear = { "Destruição Multua": "Destruição Mútua" };
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  let total = 0;
  for (const a of atores) {
    for (const it of Array.from(a.items)) {
      if (renomear[it.name]) { await it.update({ name: renomear[it.name] }).catch(() => {}); total++; }
      const alvo = it.type === "subclasse" || nomes.some(n => naurenEhItem(it, n));
      if (!alvo) continue;
      if (await naurenReconciliarItemComCompendio(it).catch(() => false)) total++;
    }
    await naurenClamparRecursosAoMaximo(a).catch(() => {});
  }
  await game.settings.set("nauren", "migracaoRevisaoClasses0921", true);
  if (total) console.log(`Nauren RPG | Revisão das classes (0.92.0): ${total} item(ns) de ficha atualizados.`);
}

/** 0.92.4: revisão do Mago (Mísseis repete no dano máximo, Escudo de Mana sustentado, Salto Etéreo, Flor em cone...). */
async function naurenMigrarRevisaoMago0924() {
  if (game.settings.get("nauren", "migracaoRevisaoMago0924")) return;
  const nomes = ["Mísseis Arcanos", "Escudo de Mana", "Salto Etéreo", "Pressão Gravitacional", "Bola de Fogo", "Arco Glacial da Princesa Lazuli", "Conjurar Espada Lunar",
    "Flor Congelante", "Jóia do Vale Boreal", "Éolos", "Explosão Púrpura", "Combustão", "Páginas em Chamas", "Aspectus Sternvaloir", "Polimorfia"];
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  let total = 0;
  for (const a of atores) for (const it of Array.from(a.items)) {
    if (!nomes.some(n => naurenEhItem(it, n))) continue;
    if (await naurenReconciliarItemComCompendio(it).catch(() => false)) total++;
  }
  await game.settings.set("nauren", "migracaoRevisaoMago0924", true);
  if (total) console.log(`Nauren RPG | Revisão do Mago (0.92.4): ${total} item(ns) de ficha atualizados.`);
}

/** 0.92.5: Escudo de Mana - o Estresse não corta o dano que o escudo absorve. */
async function naurenMigrarEscudoDeMana0925() {
  if (game.settings.get("nauren", "migracaoEscudoDeMana0925")) return;
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) for (const it of Array.from(a.items)) if (naurenEhItem(it, "Escudo de Mana")) await naurenReconciliarItemComCompendio(it).catch(() => false);
  await game.settings.set("nauren", "migracaoEscudoDeMana0925", true);
}

/** 0.92.6: Crescimento (texto) e Névoa de Esporos (dano por turno) nas fichas. */
async function naurenMigrarRegras0926() {
  if (game.settings.get("nauren", "migracaoRegras0926")) return;
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) for (const it of Array.from(a.items))
    if (["Crescimento", "Névoa de Esporos", "Esporos Venenosos"].some(n => it.name === n)) await naurenReconciliarItemComCompendio(it).catch(() => false);
  await game.settings.set("nauren", "migracaoRegras0926", true);
}

/** 0.92.7: Ambidestria ataca na hora (bloqueio bem-sucedido). */
async function naurenMigrarAmbidestria0927() {
  if (game.settings.get("nauren", "migracaoAmbidestria0927")) return;
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) for (const it of Array.from(a.items)) if (it.type === "habilidade" && it.name === "Ambidestria") await naurenReconciliarItemComCompendio(it).catch(() => false);
  await game.settings.set("nauren", "migracaoAmbidestria0927", true);
}

/** 0.92.13: revisão do Empíreo (Ímpeto com o dado extra, Euforia com dano em Ataque Especial, Fulgor 3/4/5d10, Elevar a Dualidade, descrições). */
async function naurenMigrarEmpireo09211() {
  if (game.settings.get("nauren", "migracaoEmpireo09213")) return;
  const nomes = ["Ímpeto", "Fadiga", "Elevar a Dualidade", "Euforia", "Fulgor", "Emoções Obscuras"];
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) for (const it of Array.from(a.items)) if (it.type === "habilidade" && nomes.includes(it.name)) await naurenReconciliarItemComCompendio(it).catch(() => false);
  await game.settings.set("nauren", "migracaoEmpireo09213", true);
}

/** 0.92.14: revisão do Druida (Rastro Esmeralda só em Preso, Cometa Lunar, Fortificar as Bênçãos, Senhor da Floresta, Sendo um Druida). */
async function naurenMigrarDruida09214() {
  if (game.settings.get("nauren", "migracaoDruida09214")) return;
  const nomes = ["Rastro Esmeralda", "Cometa Lunar", "Fortificar as Bênçãos", "Forma Senhor da Floresta", "Névoa de Esporos", "Jardim das Flores Silvestres"];
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) {
    for (const it of Array.from(a.items)) if (["habilidade", "magia", "efeito"].includes(it.type) && nomes.includes(it.name)) await naurenReconciliarItemComCompendio(it).catch(() => false);
    // "Sendo um Druida" entrou no nível 1 da Classe: concede para quem já é Druida.
    const classe = a.items.find(i => i.type === "classe" && /druida/i.test(i.system.identifier ?? i.name));
    if (classe && a.type === "personagem") await NaurenProgressaoHelper.aplicarAteNivel(a, classe, a.system.nivel || 1).catch(() => {});
  }
  await game.settings.set("nauren", "migracaoDruida09214", true);
}

/** 0.92.16: revisão do Guerreiro (Sendo um Guerreiro, Defesa Atacante no Contra-Ataque, Superioridade, Retalhador só no seu turno, Guilhotina/Estocada só ataque básico, textos). */
async function naurenMigrarGuerreiro09216() {
  if (game.settings.get("nauren", "migracaoGuerreiro09216")) return;
  const nomes = ["Espírito de Batalha", "Resiliente", "Superioridade", "Defesa Atacante", "Indestrutível", "Bastião", "Retalhador Brutal", "Guilhotina Devastadora", "Estocada", "Juramento da Honra", "Guerreiro"];
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) {
    for (const it of Array.from(a.items)) if (["habilidade", "classe"].includes(it.type) && nomes.includes(it.name)) await naurenReconciliarItemComCompendio(it).catch(() => false);
    // "Sendo um Guerreiro" entrou no nível 1 da Classe: concede para quem já é Guerreiro.
    const classe = a.items.find(i => i.type === "classe" && /guerreiro/i.test(i.system.identifier ?? i.name));
    if (classe && a.type === "personagem") {
      await NaurenProgressaoHelper.aplicarAteNivel(a, classe, a.system.nivel || 1).catch(() => {});
      // Barra do Espírito da Batalha agora é dourada (antes era vermelha, igual à Estamina).
      const lista = foundry.utils.deepClone(a.system.recursosCustom ?? []);
      const esp = lista.find(r => r.id === "espiritodabatalha");
      if (esp && esp.cor2 === "#c24b4b") { esp.cor1 = "#5a3a12"; esp.cor2 = "#d9a441"; await a.update({ "system.recursosCustom": lista }).catch(() => null); }
    }
  }
  await game.settings.set("nauren", "migracaoGuerreiro09216", true);
}

/** 0.92.17: respostas do Gustavo (Destruição Mútua 1d6/2d6/3d6, Superioridade em Ataques Especiais, Juramento da Espada pergunta, textos). */
async function naurenMigrarGuerreiro09217() {
  if (game.settings.get("nauren", "migracaoGuerreiro09217")) return;
  const nomes = ["Destruição Mútua", "Superioridade", "Juramento da Espada", "Rubra Tempestade", "Guardas"];
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) for (const it of Array.from(a.items)) if (it.type === "habilidade" && nomes.includes(it.name)) await naurenReconciliarItemComCompendio(it).catch(() => false);
  await game.settings.set("nauren", "migracaoGuerreiro09217", true);
}

/** 0.92.18: revisão do Caçador (Disparo Carregado só distância/alcance, Ataque Múltiplo e Disparo Químico só ataque básico, Domar troca o mascote, Parceria só de aliado, Erva de Gato, Instinto no dano de Condição, Destruidora de Pés 4d6). */
async function naurenMigrarCacador09218() {
  if (game.settings.get("nauren", "migracaoCacador09218")) return;
  const nomes = ["Disparo Carregado", "Ataque Múltiplo", "Disparo Químico", "Domar Besta", "Parceria de Batalha", "Erva de Gato", "Instinto de Sobrevivência"];
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) for (const it of Array.from(a.items)) {
    const ehSub = it.type === "subclasse" && /ca[çc]ador/i.test(String(it.system.classeIdentifier ?? it.name));
    if (ehSub || (it.type === "habilidade" && nomes.includes(it.name))) await naurenReconciliarItemComCompendio(it).catch(() => false);
  }
  await game.settings.set("nauren", "migracaoCacador09218", true);
}

/** 0.92.24: bordas já salvas passam a ocupar a casa inteira, com os efeitos que cada um escolheu na janela. */
async function naurenMigrarBorda09224() {
  if (game.settings.get("nauren", "migracaoBorda09224")) return;
  for (const a of game.actors) {
    const cfg = a.getFlag("nauren", "borda");
    if (!cfg?.ativa) continue;
    const dados = await naurenBordaDadosPreparados(naurenBordaConfig(a), a.prototypeToken);
    const upd = {}; for (const [k, v] of Object.entries(dados)) upd[`prototypeToken.${k}`] = v;
    await a.update(upd).catch(() => null);
  }
  for (const cena of game.scenes) for (const td of cena.tokens) {
    if (!td.getFlag("nauren", "borda")?.ativa) continue;
    await td.update(await naurenBordaDadosPreparados(naurenBordaConfig(td), td)).catch(() => null);
  }
  await game.settings.set("nauren", "migracaoBorda09224", true);
}

/**
 * 0.92.38: revisão do Sacerdote (Provação, penitência sem Prioridade, Subclasses ligadas às magias de verdade,
 * Milagres, Orações por rank). Reconcilia as Habilidades/Magias e a Subclasse com o compêndio.
 */
/**
 * 0.92.40: lacunas das outras classes (Bênção Solar reconjura na hora, Postura Gruhua arredonda para baixo,
 * Esquiva Galante oferece o ataque, Conspirar só em aliados, Tiro Letal só com arma).
 */
/**
 * 0.92.41: monstros já criados no Criador recebem as correções do catálogo (versão 3 das Habilidades de Monstros).
 * Mantém o que é da criatura: a escala da Categoria (raio, alcance, usos), as Peculiaridades que entraram nos
 * ataques, os usos já gastos, o rank e se está ligada. O sistema anterior fica guardado no próprio item
 * (flags.nauren.sistemaAnterior) e um card lista o que mudou. Pergunta antes.
 */
async function naurenAtualizarItemDeMonstro(item, novo, cat, pecUuids = new Set()) {
  const antigo = item.toObject().system;
  const sys = foundry.utils.deepClone(novo.system);
  for (const [caminho, valores] of Object.entries(novo.getFlag("nauren", "habMonstro")?.escala ?? {})) {
    const v = Array.isArray(valores) ? valores[Math.max(0, Math.min(3, (cat || 1) - 1))] : undefined;
    if (v !== undefined && v !== null) foundry.utils.setProperty(sys, caminho, v);
  }
  // Peculiaridades que o Criador pôs nos ataques (mesmos campos de NaurenCriadorMonstro#_aplicarPeculiaridades).
  (sys.acoes ?? []).forEach((a, i) => {
    const v = (antigo.acoes ?? [])[i];
    if (!v || !a.ehAtaque || !v.ehAtaque) return;
    const novosUuids = new Set((a.condicoesAplicadas ?? []).map(c => c.uuid));
    const extras = (v.condicoesAplicadas ?? []).filter(c => !novosUuids.has(c.uuid) && pecUuids.has(c.uuid) && c.soSeAcertar && !c.perguntarParaEvitar);
    if (extras.length) a.condicoesAplicadas = [...(a.condicoesAplicadas ?? []), ...extras];
    if (v.usaAtropelador && !a.usaAtropelador) Object.assign(a, { usaAtropelador: true, atropeladorQuantidade: v.atropeladorQuantidade, atropeladorRaio: v.atropeladorRaio });
    if (Number(v.imparavelQuantidade) > (Number(a.imparavelQuantidade) || 0)) a.imparavelQuantidade = v.imparavelQuantidade;
    const bando = String(v.ataqueBonusExtra ?? "").match(/\d+\*@aliados_6m/g) ?? [];
    for (const b of bando) if (!String(a.ataqueBonusExtra ?? "").includes(b)) a.ataqueBonusExtra = `${a.ataqueBonusExtra ? a.ataqueBonusExtra + "+" : ""}${b}`;
    // usos já gastos neste combate
    if (a.usaUsos && v.usaUsos && Number.isFinite(v.usosAtual)) a.usosAtual = Math.min(v.usosAtual, a.usosMax ?? v.usosAtual);
    if (Number.isFinite(v.cargasAtual) && a.usaCargas) a.cargasAtual = Math.min(v.cargasAtual, a.cargasMax ?? v.cargasAtual);
  });
  if (sys.usaUsosPassiva && Number.isFinite(antigo.usosPassivaAtual)) sys.usosPassivaAtual = Math.min(antigo.usosPassivaAtual, sys.usosPassivaMax ?? antigo.usosPassivaAtual);
  if (sys.usaUsos && Number.isFinite(antigo.usosAtual)) sys.usosAtual = Math.min(antigo.usosAtual, sys.usosMax ?? antigo.usosAtual);
  for (const k of ["ativo", "rankAtual"]) if (k in antigo) sys[k] = antigo[k];
  await item.update({ system: sys, "flags.nauren.habMonstroVersao": novo.getFlag("nauren", "habMonstroVersao"),
    "flags.nauren.habMonstro": novo.getFlag("nauren", "habMonstro"), "flags.nauren.sistemaAnterior": antigo });
}
async function naurenMigrarHabilidadesMonstros09241() {
  // Roda a cada versão nova do catálogo (não só uma vez): compara com a última versão já levada às fichas.
  if ((game.settings.get("nauren", "migracaoHabMonstrosVersao") ?? 0) >= NAUREN_HAB_MONSTROS_VERSAO) return;
  const pack = game.packs.find(p => p.metadata.label === NAUREN_PACKS_DEFINICAO.habMonstros.label);
  if (!pack) return;
  const porChave = new Map();
  for (const d of await pack.getDocuments()) { const k = d.getFlag("nauren", "habMonstro")?.id; if (k) porChave.set(k, d); }
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  const pendentes = [];
  for (const a of atores) for (const it of Array.from(a.items)) {
    const k = it.getFlag("nauren", "habMonstro")?.id; const novo = k ? porChave.get(k) : null;
    if (!novo || !it.getFlag("nauren", "origemCriadorMonstro")) continue;
    if ((it.getFlag("nauren", "habMonstroVersao") ?? 0) >= (novo.getFlag("nauren", "habMonstroVersao") ?? 0)) continue;
    pendentes.push({ a, it, novo });
  }
  await game.settings.set("nauren", "migracaoHabMonstrosVersao", NAUREN_HAB_MONSTROS_VERSAO);
  if (!pendentes.length) return;
  const nAtores = new Set(pendentes.map(p => p.a.uuid)).size;
  const packC = game.packs.find(p => p.metadata.label === "Nauren - Condições e Venenos");
  const pecUuids = new Set();
  for (const seed of NAUREN_CM_PECS.map(p => p[5]).filter(Boolean)) { const u = packC ? await naurenUuidPorSeed(packC, seed) : null; if (u) pecUuids.add(u); }
  const sim = await foundry.applications.api.DialogV2.confirm({
    window: { title: "Habilidades de Monstros atualizadas" },
    content: `<p>O catálogo de Habilidades de Monstros recebeu correções. <b>${nAtores}</b> criatura(s) feitas no Criador têm <b>${pendentes.length}</b> habilidade(s) da versão anterior.</p>
      <p>Atualizar agora? Ficam mantidos: a escala da Categoria, as Peculiaridades nos ataques, usos gastos, rank e se a habilidade está ligada. A versão anterior de cada item fica guardada nele.</p>`,
    yes: { label: "Atualizar" }, no: { label: "Agora não" }, rejectClose: false
  }).catch(() => false);
  if (!sim) return;
  const feitos = new Map();
  for (const { a, it, novo } of pendentes) {
    try { await naurenAtualizarItemDeMonstro(it, novo, a.system?.categoriaTotal ?? 1, pecUuids); (feitos.get(a.name) ?? feitos.set(a.name, []).get(a.name)).push(it.name); }
    catch (err) { console.warn(`Nauren RPG | Falha ao atualizar "${it.name}" de "${a.name}".`, err); }
  }
  await naurenPostarCard({ titulo: "Monstros atualizados", icone: "icons/creatures/abilities/dragon-head-fire-breath-orange.webp", fonte: `Habilidades de Monstros (catálogo ${NAUREN_HAB_MONSTROS_VERSAO})`,
    linhas: [...feitos].map(([nome, itens]) => ({ label: nome, value: `${itens.length} habilidade(s)`, breakdown: itens.join(", ") })) });
}

async function naurenMigrarLacunas09240() {
  if (game.settings.get("nauren", "migracaoLacunas09240")) return;
  const nomes = ["Bênção Solar", "Postura Gruhua", "Esquiva Galante", "Conspirar", "Marca do Caçador", "Chamas Negras",
    "Foco Mortal (Marca do Caçador)", "Tiro Letal (Marca do Caçador)", "Reflexos de Caça (Marca do Caçador)"];
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) for (const it of Array.from(a.items)) {
    if (["habilidade", "efeito"].includes(it.type) && nomes.includes(it.name)) await naurenReconciliarItemComCompendio(it).catch(() => false);
  }
  await game.settings.set("nauren", "migracaoLacunas09240", true);
}

/**
 * 0.92.39: respostas do Gustavo. Nova Sagrada vira magia (passa pela Provação), Punição Celestial tem 1 ponto,
 * Proteção Celestial +0/+1/+2, Círculo da Graça sobe o dado do nível, Benedictio só em aliados.
 */
async function naurenMigrarSacerdote09239() {
  if (game.settings.get("nauren", "migracaoSacerdote09239")) return;
  const nomes = ["Provação do Entrelaço", "Palavra de Destino: Benedictio", "Punição Celestial", "Proteção Celestial", "Romper o Caminho"];
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) {
    let sub = null;
    for (const it of Array.from(a.items)) {
      const ehSub = it.type === "subclasse" && /sacerdote/i.test(String(it.system.classeIdentifier ?? it.name));
      if (ehSub || (["habilidade", "magia"].includes(it.type) && nomes.includes(it.name))) await naurenReconciliarItemComCompendio(it).catch(() => false);
      if (ehSub) sub = a.items.get(it.id);
    }
    if (!sub) continue;
    // Punição Celestial: só 1 ponto. Quem tinha mais fica com 1 (os pontos extras voltam para gastar).
    const nos = foundry.utils.deepClone(sub.system.nos ?? []);
    const noP = nos.find(n => n.id === "punicao-celestial");
    if (noP && (noP.rankAtual ?? 0) > 1) {
      noP.rankAtual = 1;
      await sub.update({ "system.nos": nos }).catch(() => null);
      const itP = a.items.find(i => i.name === "Punição Celestial" && i.type === "habilidade");
      if (itP && (itP.system.rankAtual ?? 1) > 1) await itP.update({ "system.rankAtual": 1 }).catch(() => null);
    }
    // Nova Sagrada: a Habilidade antiga dá lugar à Magia.
    const noN = (sub.system.nos ?? []).find(n => n.id === "nova-sagrada");
    const antiga = a.items.find(i => i.name === "Nova Sagrada" && i.type === "habilidade");
    if (antiga && noN?.itemUuid && (noN.rankAtual ?? 0) > 0) {
      await antiga.delete().catch(() => null);
      await NaurenConcessaoHelper.concederItem(a, sub, "no:nova-sagrada:rank:1", noN.itemUuid).catch(() => null);
    }
  }
  await game.settings.set("nauren", "migracaoSacerdote09239", true);
}

/** 0.94.13: Sanatio do livro 0.8.1 (bônus de penitência 1d6 → 4d6) e Círculo da Graça subindo também o dado do bônus. */
/** 0.94.16: Mecanismo do Relógio "rebobina" o token (Motion) nas fichas e no compêndio. */
async function naurenMigrarMotion09416() {
  if (game.settings.get("nauren", "migracaoMotion09416")) return;
  const ajustar = async it => {
    if (it?.name !== "Mecanismo do Relógio" || !Array.isArray(it.system?.acoes)) return;
    const acoes = foundry.utils.deepClone(it.system.acoes);
    let mudou = false;
    for (const a of acoes) if ((a.motionUsuario ?? "auto") === "auto") { a.motionUsuario = "rebobinar"; mudou = true; }
    if (mudou) await it.update({ "system.acoes": acoes }).catch(err => console.warn("Nauren RPG | migração 0.94.16", it.name, err));
  };
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) for (const it of Array.from(a.items)) await ajustar(it);
  for (const it of game.items ?? []) await ajustar(it);
  for (const pack of game.packs.filter(p => p.metadata.type === "Item" && p.metadata.packageType === "world")) {
    const idx = await pack.getIndex().catch(() => null);
    const e = idx?.find(x => x.name === "Mecanismo do Relógio");
    if (!e) continue;
    const trancado = pack.locked;
    if (trancado) await pack.configure({ locked: false }).catch(() => {});
    await ajustar(await pack.getDocument(e._id).catch(() => null));
    if (trancado) await pack.configure({ locked: true }).catch(() => {});
  }
  await game.settings.set("nauren", "migracaoMotion09416", true);
}

/** 0.94.23: Ações de Bando ganham o bônus por cercar (+@bandoExtra) nas fichas e no Bestiário. */
async function naurenMigrarBandoExtra09423() {
  if (game.settings.get("nauren", "migracaoBandoExtra09423")) return;
  const re = /\*@bandoNoAlcance\/@bandoMembros\)/;
  const ajustarAtor = async a => {
    if (!a?.getFlag?.("nauren", "bando")?.ativo) return;
    for (const it of Array.from(a.items)) {
      if (!Array.isArray(it.system?.acoes)) continue;
      const acoes = foundry.utils.deepClone(it.system.acoes);
      let mudou = false;
      for (const ac of acoes) for (const dn of ac.danos ?? []) {
        if (dn?.formula && re.test(dn.formula) && !/@bandoExtra/.test(dn.formula)) { dn.formula = `${dn.formula}+@bandoExtra`; mudou = true; }
      }
      if (mudou) await it.update({ "system.acoes": acoes }).catch(err => console.warn("Nauren RPG | migração do Bando", it.name, err));
    }
  };
  for (const a of game.actors ?? []) await ajustarAtor(a);
  for (const cena of game.scenes ?? []) for (const t of cena.tokens) if (t.actor && !t.actorLink) await ajustarAtor(t.actor);
  for (const pack of game.packs.filter(p => p.metadata.type === "Actor" && p.metadata.packageType === "world")) {
    const trancado = pack.locked;
    try {
      if (trancado) await pack.configure({ locked: false });
      for (const a of await pack.getDocuments()) await ajustarAtor(a);
    } catch (err) { console.warn("Nauren RPG | migração do Bando (compêndio)", pack.metadata.label, err); }
    finally { if (trancado) await pack.configure({ locked: true }).catch(() => {}); }
  }
  await game.settings.set("nauren", "migracaoBandoExtra09423", true);
}

async function naurenMigrarSanatio09413() {
  if (game.settings.get("nauren", "migracaoSanatio09413")) return;
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) {
    for (const it of Array.from(a.items)) {
      const ehSub = it.type === "subclasse" && /sacerdote/i.test(String(it.system.classeIdentifier ?? it.name));
      if (ehSub || (it.type === "magia" && it.name === "Palavra de Destino: Sanatio")) await naurenReconciliarItemComCompendio(it).catch(() => false);
    }
  }
  await game.settings.set("nauren", "migracaoSanatio09413", true);
}

async function naurenMigrarSacerdote09238() {
  if (game.settings.get("nauren", "migracaoSacerdote09238")) return;
  const nomes = ["Provação do Entrelaço", "Palavra de Destino: Sanatio", "Palavra de Destino: Condemnatio", "Palavra de Destino: Fortitudo",
    "Palavra de Destino: Benedictio", "Palavra de Destino: Redemptio", "Orações do Ciclo", "Toque da Graça", "Costurar a Vida", "Esfera Prismática",
    "Erradiar Luz Sagrada", "Manutenção do Prisma", "Penitência Desesperada", "Halo", "Canonização", "Punição Celestial", "Banhar-se em Graças"];
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) {
    for (const it of Array.from(a.items)) {
      const ehSub = it.type === "subclasse" && /sacerdote/i.test(String(it.system.classeIdentifier ?? it.name));
      if (ehSub || (["habilidade", "magia"].includes(it.type) && nomes.includes(it.name))) await naurenReconciliarItemComCompendio(it).catch(() => false);
    }
  }
  await game.settings.set("nauren", "migracaoSacerdote09238", true);
}

/**
 * 0.92.19: respostas do Gustavo (Disparo Carregado passivo, Rastro do Vendaval vira item, Disparo Quimérico,
 * Erva de Gato com ranks, Armadilha que prende conta no limite, Besta Inicial, mascotes pela carta).
 */
async function naurenMigrarCacador09219() {
  if (game.settings.get("nauren", "migracaoCacador09219")) return;
  const nomes = ["Disparo Carregado", "Disparo Químico", "Disparo Quimérico", "Erva de Gato", "Armadilha de Caça", "Domar Besta"];
  const packCond = game.packs.find(p => p.metadata.label === NAUREN_PACKS_DEFINICAO.condicoes.label && p.metadata.type === "Item");
  const uuidsMascote = packCond ? await naurenUuidsMascotes(packCond).catch(() => null) : null;
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) {
    let subCacador = null;
    for (const it of Array.from(a.items)) {
      const ehSub = it.type === "subclasse" && /ca[çc]ador/i.test(String(it.system.classeIdentifier ?? it.name));
      if (ehSub || (it.type === "habilidade" && nomes.includes(it.name))) await naurenReconciliarItemComCompendio(it).catch(() => false);
      if (ehSub) subCacador = a.items.get(it.id);
      // O nome certo é "Disparo Quimérico" (resposta do Gustavo).
      if (it.type === "habilidade" && it.name === "Disparo Químico") await a.items.get(it.id)?.update({ name: "Disparo Quimérico" }).catch(() => null);
    }
    // Rastro do Vendaval agora é uma Habilidade própria: quem já tinha pontos no nó recebe o item com o mesmo rank.
    const noR = (subCacador?.system?.nos ?? []).find(n => n.id === "rastro-do-vendaval");
    if (noR?.itemUuid && (noR.rankAtual ?? 0) > 0 && !a.items.some(i => naurenItemCorrespondeAoAlvo(i, noR.itemUuid))) {
      const criado = await NaurenConcessaoHelper.concederItem(a, subCacador, "no:rastro-do-vendaval:rank:1", noR.itemUuid).catch(() => null);
      if (criado) await criado.update({ "system.rankAtual": noR.rankAtual }).catch(() => null);
    }
    // Mascotes iniciais já no mundo: itens pela carta (Resistir do Urso só em ataques, Investida, Bote, Matilha).
    if (uuidsMascote && NAUREN_MASCOTES_INICIAIS.some(d => d.seedId === a.getFlag("nauren", "seedId")) && (a.getFlag("nauren", "versaoSeed") ?? 1) < NAUREN_VERSAO_SEED_MASCOTES)
      await naurenReconciliarMascote(a, uuidsMascote).catch(() => false);
    // Mascote de nível menor que o dono sobe para o nível dele.
    if (a.system?.mascoteDeUuid) {
      let dono = null;
      try { const d = fromUuidSync(a.system.mascoteDeUuid); dono = d?.actor ?? d; } catch (err) { dono = null; }
      if (dono && (a.system.nivel ?? 1) < (dono.system.nivel ?? 1)) await a.update({ "system.nivel": dono.system.nivel }).catch(() => null);
    }
  }
  await game.settings.set("nauren", "migracaoCacador09219", true);
}

/** 0.92.15: Sabedoria das Copas passa a perguntar quanto transformar (1 ou 2; +2 por Crescimento), de uma vez. */
async function naurenMigrarSabedoria09215() {
  if (game.settings.get("nauren", "migracaoSabedoria09215")) return;
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) for (const it of Array.from(a.items)) if (it.type === "magia" && it.name === "Sabedoria das Copas") await naurenReconciliarItemComCompendio(it).catch(() => false);
  await game.settings.set("nauren", "migracaoSabedoria09215", true);
}

async function naurenMigrarLivro08PequenasV1() {
  if (game.settings.get("nauren", "migracaoLivro08PequenasV1")) return;
  const packH = game.packs.find(pk => pk.metadata.label === "Nauren - Habilidades de Classe");
  const uuidBaderna = packH ? await naurenUuidPorSeed(packH, "habilidade-ladino-baderna") : null;
  const uuidArdiloso = packH ? await naurenUuidPorSeed(packH, "habilidade-ladino-espirito-ardiloso") : null;
  const uuidAureum = packH ? await naurenUuidPorSeed(packH, "habilidade-sacerdote-aureum") : null;
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  const relatorio = [];
  for (const a of atores) {
    // Espírito Ardiloso (Ladino, nível 1): quem já é Ladino recebe a habilidade (a reserva vem da Classe).
    const classeLad = a.items.find(i => i.type === "classe" && (i.system.identifier === "ladino" || /^ladino$/i.test(i.name)));
    if (uuidArdiloso && classeLad && !a.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Espírito Ardiloso"))) {
      const criadoA = await NaurenConcessaoHelper.concederItem(a, classeLad, "nivel:1", uuidArdiloso).catch(() => null);
      if (criadoA) relatorio.push(`${a.name}: recebeu Espírito Ardiloso`);
      await naurenSincronizarRecursosCustom(a).catch(() => {});
    }
    // Aureum (Sacerdote, nível 9): quem já passou do 9 recebe (Redemptio fica, marcada "será removida").
    const classeSac = a.items.find(i => i.type === "classe" && (i.system.identifier === "sacerdote" || /^sacerdote$/i.test(i.name)));
    if (uuidAureum && classeSac && (a.system.nivel ?? 0) >= 9 && !a.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Palavra de Destino: Aureum"))) {
      const criadoS = await NaurenConcessaoHelper.concederItem(a, classeSac, "nivel:9", uuidAureum).catch(() => null);
      if (criadoS) relatorio.push(`${a.name}: recebeu Palavra de Destino: Aureum`);
    }
    for (const sub of a.items.filter(i => i.type === "subclasse")) {
      const nos = foundry.utils.deepClone(sub.system.nos ?? []);
      let devolver = 0;
      for (const no of nos) {
        if (no.id === "combustao") {
          no.rankMax = 4;
          if ((no.rankAtual ?? 0) > 4) { devolver += no.rankAtual - 4; no.rankAtual = 4; }
        }
      }
      if (devolver) {
        const historico = (sub.system.historico ?? []).filter(h => !/^no:combustao:rank:([5-9]|\d{2,})$/.test(String(h.origem ?? "")));
        await sub.update({ "system.nos": nos, "system.historico": historico }).catch(() => {});
        const comb = a.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Combustão"));
        if (comb && (comb.system.rankAtual ?? 0) > 4) await comb.update({ "system.rankAtual": 4, "system.rankMax": 4 }).catch(() => {});
        await a.update({ "system.pontosSubclasse.value": (a.system.pontosSubclasse?.value ?? 0) + devolver }).catch(() => {});
        relatorio.push(`${a.name}: Combustão 5 → 4 (+${devolver} ponto de Subclasse)`);
      }
      const noBad = nos.find(n => n.id === "baderna");
      if (uuidBaderna && noBad && (noBad.rankAtual ?? 0) >= 1 && !a.items.some(i => i.type === "habilidade" && naurenEhItem(i, "Baderna"))) {
        const criado = await NaurenConcessaoHelper.concederItem(a, sub, "no:baderna:rank:1", uuidBaderna).catch(() => null);
        if (criado) relatorio.push(`${a.name}: recebeu o item Baderna`);
      }
    }
  }
  await game.settings.set("nauren", "migracaoLivro08PequenasV1", true);
  if (relatorio.length) {
    console.log("Nauren RPG | Livro 0.8:", relatorio);
    naurenPostarCard({ titulo: "Atualização do livro 0.8", icone: "icons/sundries/books/book-backed-silver-red.webp", fonte: "Fichas ajustadas",
      linhas: relatorio.map(r => ({ label: "Ajuste", value: r })) }).catch(() => {});
  }
}

/**
 * 0.90.0 - Livro 0.8: leva às fichas as habilidades que mudaram de regra, sem
 * esperar o "Atualizar todos" (mesma sequência do "Ressincronizar com o
 * Compêndio": mantém ranks, usos gastos e recursos). Inclui as árvores de
 * Subclasse (Marcar o Alvo e Apoteose agora vão até 3 pontos).
 */
const NAUREN_SEEDS_LIVRO_08 = new Set([
  "habilidade-ladino-analise-paciente", "habilidade-ladino-marcar-o-alvo", "habilidade-ladino-avaliar",
  "habilidade-mistico-traco-celestial", "habilidade-mistico-espalhar-a-palavra", "habilidade-mistico-conto-antigo-shirintou",
  "habilidade-mistico-sequencia-caligrafica", "habilidade-mistico-gruhua-senhor-das-brumas", "habilidade-mago-combustao",
  "habilidade-druida-druidismo", "habilidade-druida-renascimento-verdejante", "habilidade-ladino-falsificar-seu-destino",
  "habilidade-sacerdote-redemptio", "habilidade-sacerdote-aureum"
]);
async function naurenMigrarLivro08ItensV1() {
  if (game.settings.get("nauren", "migracaoLivro08ItensV1")) return;
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  let total = 0;
  for (const a of atores) {
    for (const it of Array.from(a.items)) {
      const seed = it.getFlag("nauren", "seedId") ?? "";
      const ehArvore = it.type === "subclasse" && (it.system.nos ?? []).some(n => ["marcar-o-alvo", "apoteose", "baderna", "combustao", "olhar-da-morte"].includes(n.id));
      const ehClasse = it.type === "classe" && /druida|ladino|sacerdote/i.test(it.name);
      if (!NAUREN_SEEDS_LIVRO_08.has(seed) && !ehArvore && !ehClasse && !(it.type === "habilidade" && ["Análise Paciente", "Marcar o Alvo", "Traço Celestial", "Conto Antigo, Shirintou", "Sequência Caligráfica", "Gruhua, Senhor das Brumas", "Espalhar a Palavra"].some(n => naurenEhItem(it, n)))) continue;
      const mudou = await naurenReconciliarItemComCompendio(it).catch(err => { console.warn("Nauren RPG | Livro 0.8: falha ao atualizar", a.name, it.name, err); return false; });
      if (mudou) total++;
      // Análise Paciente ganhou usos (3/4/5 por cena): a cópia antiga não tinha contador - começa cheia.
      const atual = a.items.get(it.id);
      if (atual?.type === "habilidade" && naurenEhItem(atual, "Análise Paciente")) {
        const acoesA = foundry.utils.deepClone(atual.system.acoes ?? []);
        const a0 = acoesA[0];
        const maxNv = a0?.usaUsos ? naurenResolverPorNivel(a0.usosMaxPorNivel, a.system.nivel ?? 1, "valor") : null;
        const maxA = (maxNv ?? a0?.usosMax ?? 3) + naurenUsosExtrasPara(a, atual);
        if (a0?.usaUsos && (a0.usosAtual ?? 0) < maxA) {
          a0.usosAtual = maxA;
          await atual.update({ "system.acoes": acoesA }).catch(() => {});
        }
      }
    }
  }
  await game.settings.set("nauren", "migracaoLivro08ItensV1", true);
  if (total) console.log(`Nauren RPG | Livro 0.8: ${total} item(ns) de ficha atualizados.`);
}

/** 0.90.1 - "Eu estou acima" da 0.90.0 tinha Modificadores gerais: agora vale só contra o alvo analisado. */
async function naurenMigrarAcimaSoContraAlvoV1() {
  if (game.settings.get("nauren", "migracaoAcimaSoContraAlvoV1")) return;
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) {
    const upd = a.items.filter(i => i.type === "condicao" && i.getFlag("nauren", "analiseCriativa")?.modo === "acima" && (i.system.modificadores ?? []).length)
      .map(i => { const campo = i.getFlag("nauren", "analiseCriativa")?.campo || i.system.modificadores[0]?.campo || "";
        return { _id: i.id, "system.modificadores": naurenModsAcima(campo), "flags.nauren.analiseCriativa.campo": campo }; });
    if (upd.length) await a.updateEmbeddedDocuments("Item", upd).catch(() => {});
  }
  await game.settings.set("nauren", "migracaoAcimaSoContraAlvoV1", true);
}

/**
 * Splatter (módulo de sangue): com ele ativo, aponta os caminhos de Vida para
 * os do Nauren (vida.value / vida.max). Só troca se ainda estiver no padrão do
 * módulo (attributes.hp...) ou vazio - um caminho que o Mestre escolheu fica.
 */
// No "setup" (depois do init de todos os módulos) o padrão das configurações do Splatter
// já passa a ser o caminho do Nauren - vale na hora, para todos, mesmo sem nada gravado.
Hooks.once("setup", () => {
  if (!game.modules.get("splatter")?.active) return;
  for (const [chave, valor] of Object.entries({ currentHp: "vida.value", maxHp: "vida.max" })) {
    const cfg = game.settings.settings.get(`splatter.${chave}`);
    if (cfg) cfg.default = valor;
  }
});
async function naurenConfigurarSplatter() {
  if (!game.modules.get("splatter")?.active || !game.user.isGM) return;
  const alvo = { currentHp: "vida.value", maxHp: "vida.max" };
  const trocados = [];
  for (const [chave, valor] of Object.entries(alvo)) {
    let atual;
    try { atual = game.settings.get("splatter", chave); } catch (err) { continue; }
    if (atual === valor) continue;
    if (atual && !/^attributes\.hp\./.test(String(atual))) continue;
    await game.settings.set("splatter", chave, valor);
    trocados.push(`${chave} = ${valor}`);
  }
  if (trocados.length) console.log(`Nauren RPG | Splatter configurado: ${trocados.join(", ")}.`);
}

/** Munições criadas na 0.30.0 herdaram o "Cura 1d6 PV" padrão do consumível: limpa. */
async function naurenMigrarMunicaoSemCuraV1() {
  if (game.settings.get("nauren", "migracaoMunicaoSemCuraV1")) return;
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  for (const a of atores) {
    const upd = a.items.filter(i => i.type === "consumivel" && i.system.ehMunicao && i.system.efeito === "Cura 1d6 PV").map(i => ({ _id: i.id, "system.efeito": "" }));
    if (upd.length) await a.updateEmbeddedDocuments("Item", upd).catch(() => {});
  }
  await game.settings.set("nauren", "migracaoMunicaoSemCuraV1", true);
}

async function naurenMigrarEfeitoPermanenteV1() {
  if (game.settings.get("nauren", "migracaoEfeitoPermanenteV1")) return;
  const converter = acoes => {
    let mudou = false;
    const novas = (acoes ?? []).map(a => {
      const v = String(a?.efeitoPermanenteValor ?? "");
      if (!/@penitenciaAceita\b/.test(v)) return a;
      const sem = naurenAvaliarExpressaoSimples(v.replace(/@penitenciaAceita\b/g, "0"));
      const com = naurenAvaliarExpressaoSimples(v.replace(/@penitenciaAceita\b/g, "1"));
      if (!Number.isFinite(sem) || !Number.isFinite(com)) return a;
      mudou = true;
      return { ...a, efeitoPermanenteValor: String(sem), efeitoPermanenteValorPenitencia: String(com) };
    });
    return mudou ? novas : null;
  };
  let total = 0;
  const itens = [...Array.from(game.items), ...Array.from(game.actors).flatMap(a => Array.from(a.items))];
  for (const item of itens) {
    const novas = converter(item.system?.acoes);
    if (!novas) continue;
    await item.update({ "system.acoes": novas }).catch(err => console.warn(`Nauren RPG | Migração do Efeito permanente falhou em "${item.name}".`, err));
    total++;
  }
  await game.settings.set("nauren", "migracaoEfeitoPermanenteV1", true);
  if (total) console.log(`Nauren RPG | Efeito permanente: ${total} item(ns) convertido(s) para "sem/com penitência".`);
}

async function naurenOferecerSincronizacaoDeVersao() {
  const versao = game.system.version;
  if (game.settings.get("nauren", "versaoItensSincronizados") === versao) return;
  const atores = game.actors.filter(a => ["personagem", "npc"].includes(a.type) && !a.getFlag("nauren", "entidade"));
  await game.settings.set("nauren", "versaoItensSincronizados", versao);
  if (!atores.length) return;
  const sim = await foundry.applications.api.DialogV2.confirm({
    window: { title: `Nauren RPG atualizado para ${versao}` },
    content: `<p>Os compêndios já foram atualizados. Quer levar as mudanças para os itens que os <b>${atores.length} personagens e NPCs</b> do mundo já têm?</p>
      <p>É o mesmo que clicar em <b>"Ressincronizar com o Compêndio"</b> em cada ficha: mantém ranks investidos, usos gastos e recursos, e só atualiza as regras/configurações dos itens.</p>
      <p class="nauren-popup-nota">Se recusar, dá para fazer ficha por ficha depois (aba Opções → Descanso → Ressincronizar com o Compêndio). Esta pergunta não volta até a próxima versão.</p>`,
    yes: { label: "Atualizar todos" }, no: { label: "Agora não" }, rejectClose: false
  }).catch(() => false);
  if (!sim) return;
  ui.notifications.info(`Nauren RPG: atualizando ${atores.length} fichas...`);
  let itens = 0;
  const falhas = [];
  for (const actor of atores) {
    try {
      itens += await naurenReconciliarTodosOsItens(actor);
      for (const classeItem of actor.items.filter(i => i.type === "classe")) {
        await NaurenProgressaoHelper.aplicarAteNivel(actor, classeItem, actor.system.nivel || 1);
      }
      await naurenReaplicarUpgradesDeSubclasse(actor);
      await naurenSincronizarRecursosCustom(actor);
    } catch (err) {
      console.warn(`Nauren RPG | Falha ao atualizar a ficha "${actor.name}".`, err);
      falhas.push(actor.name);
    }
  }
  naurenPostarCard({ titulo: "Fichas atualizadas", icone: "icons/sundries/books/book-backed-blue-gold.webp", fonte: `Versão ${versao}`,
    linhas: [{ label: "Fichas", value: atores.length - falhas.length }, { label: "Itens atualizados", value: itens },
      falhas.length ? { label: "Não atualizadas", value: falhas.join(", "), breakdown: "use o botão Ressincronizar nelas" } : null].filter(Boolean) });
}

async function naurenSincronizarRecursosCustom(actor) {
  if (!actor?.items) return;

  // Auto-cura: qualquer declaração
  // sem "chaveInterna" ainda (dado de antes desta correção existir) recebe
  // uma agora, escrita de volta na PRÓPRIA Subclasse - e, se já existir uma
  // barra correspondente no ator (achada pelo "id" ainda válido NESTE
  // exato momento, já que essa cura só roda 1x por par declaração/ator),
  // ela recebe a MESMA chave nova, pra continuar sendo reconhecida como a
  // mesma barra dali em diante. Sem "adotar" a barra antiga assim, a cura
  // criaria uma barra NOVA do zero e abandonaria a antiga - o mesmo bug
  // que estamos corrigindo, só que uma vez, no momento da cura.
  const recursosParaHeal = foundry.utils.deepClone(actor.system.recursosCustom ?? []);
  let recursosMudaramNaHeal = false;
  for (const item of actor.items) {
    if (item.type !== "subclasse" && item.type !== "classe" && item.type !== "habilidade") continue;
    const lista = item.system.recursosDeclarados ?? [];
    if (!lista.some(d => d.id && !d.chaveInterna)) continue;
    const clonada = foundry.utils.deepClone(lista);
    for (const d of clonada) {
      if (!d.id || d.chaveInterna) continue;
      const novaChave = foundry.utils.randomID();
      d.chaveInterna = novaChave;
      const entradaAntiga = recursosParaHeal.find(r => r.id === d.id && !r.chaveInterna);
      if (entradaAntiga) {
        entradaAntiga.chaveInterna = novaChave;
        recursosMudaramNaHeal = true;
      }
    }
    await item.update({ "system.recursosDeclarados": clonada });
  }
  if (recursosMudaramNaHeal) await actor.update({ "system.recursosCustom": recursosParaHeal });

  // Recoleta as declarações já com "chaveInterna" garantida (relê os itens,
  // já que o passo acima pode ter acabado de atualizar alguns deles).
  const declarados = [];
  for (const item of actor.items) {
    if (item.type !== "subclasse" && item.type !== "classe" && item.type !== "habilidade") continue;
    for (const r of item.system.recursosDeclarados ?? []) {
      if (r.id && r.chaveInterna) declarados.push(r);
    }
  }
  if (!declarados.length) return; // nenhuma Subclasse com recurso próprio - nada a sincronizar

  const atuais = foundry.utils.deepClone(actor.system.recursosCustom ?? []);
  let mudou = false;
  // Mesmo "id" declarado em dois itens (ex.: Espírito Ardiloso na Classe e na habilidade): uma barra só.
  const idsVistos = new Set();
  for (const decl of declarados) {
    if (idsVistos.has(decl.id)) continue;
    idsVistos.add(decl.id);
    let maxResolvido = 0;
    try {
      const mod = naurenInterpretarModificador(decl.maxFormula, actor);
      maxResolvido = Math.max(0, Math.round(mod?.valor ?? 0));
    } catch (err) {
      console.warn(`Nauren RPG | Fórmula de máximo inválida pro recurso "${decl.id}" ("${decl.maxFormula}") - usando 0.`, err);
    }
    // Casa por "chaveInterna" (estável), NÃO por "id" (editável) - é essa a
    // correção: agora dá pra renomear "id"/"nome" livremente sem nunca
    // criar uma barra nova.
    const existente = atuais.find(r => r.chaveInterna === decl.chaveInterna)
      ?? atuais.find(r => r.id === decl.id && !declarados.some(d => d.chaveInterna === r.chaveInterna && d.id !== decl.id));
    if (!existente) {
      atuais.push({ id: decl.id, nome: decl.nome, valor: decl.nasceCheio ? maxResolvido : 0, max: maxResolvido, icone: decl.icone, cor1: decl.cor1, cor2: decl.cor2, chaveInterna: decl.chaveInterna });
      mudou = true;
      continue;
    }
    if (existente.max !== maxResolvido || existente.nome !== decl.nome || existente.icone !== decl.icone || existente.cor1 !== decl.cor1 || existente.cor2 !== decl.cor2 || existente.id !== decl.id) {
      existente.max = maxResolvido;
      existente.nome = decl.nome;
      existente.icone = decl.icone;
      existente.cor1 = decl.cor1;
      existente.cor2 = decl.cor2;
      existente.id = decl.id;
      mudou = true;
    }
    if (existente.valor > existente.max) { existente.valor = existente.max; mudou = true; }
  }
  if (mudou) await actor.update({ "system.recursosCustom": atuais });
}

/**
 * Concede "quantidadeTexto" (aceita fórmula/@token, resolvido via
 * naurenInterpretarModificador) de um recurso a um ator, sem nunca passar
 * do máximo - usado por naurenProcessarGatilhos.
 * "recurso" é um dos 4 padrão ("vida", "mana", "estaminaCombate",
 * "dadosDestino") ou um Customizado no formato "recursoCustom:<id>" (ver
 * NaurenHabilidadeData#gatilhos). Devolve quanto foi realmente ganho
 * (pode ser menos que o pedido, se já estava perto do máximo) - 0 se nada
 * mudou (recurso não encontrado, quantidade inválida, ou já no máximo).
 */
/**
 * Verifica se um recurso customizado atravessou o próprio máximo (para
 * cima ou para baixo) e, se a Subclasse que o declarou tiver configurado
 * uma Condição para esse momento (campo "Condição ao Atingir o Máximo"),
 * aplica-a ou remove-a de acordo. Dispara apenas na TRANSIÇÃO (entrando
 * ou saindo do máximo), nunca enquanto o recurso permanece no mesmo
 * estado. A busca pela declaração prefere a chave interna estável e usa o
 * identificador textual como alternativa quando a chave ainda não
 * estiver disponível.
 */
/** Rank de uma Condição tirado de um item do portador (campo "rankVemDeItemUuid" da Condição). 0 = não se aplica. */
async function naurenRankDaCondicaoPeloPortador(actor, uuidCondicao) {
  const origem = await fromUuid(uuidCondicao).catch(() => null);
  const ref = origem?.system?.rankVemDeItemUuid;
  if (!ref) return 0;
  const item = actor.items.find(i => naurenItemCorrespondeAoAlvo(i, ref));
  return item?.system?.rankAtual || 0;
}

async function naurenChecarCondicaoAoAtingirMax(actor, id, entrada, antigo, novoValor) {
  const max = entrada.max ?? 0;
  if (max <= 0) return;
  const bateDeclaracao = d => entrada.chaveInterna ? d.chaveInterna === entrada.chaveInterna : d.id === id;
  // "classe"/"habilidade" TAMBÉM declaram recursos (ex: Determinação/
  // Ofuscação do Empíreo vêm da Classe; "Pontos Elevados" de Elevar a
  // Dualidade vêm de uma Habilidade) - não é só Subclasse. Sem checar os
  // três tipos aqui, um recurso declarado por qualquer um dos outros dois
  // nunca dispara sua Condição ao atingir o máximo (bug real, encontrado
  // ao planejar a integração de Determinação/Ofuscação com o Empíreo).
  const itemDeclarante = actor.items.find(i =>
    (i.type === "subclasse" || i.type === "classe" || i.type === "habilidade") && (i.system.recursosDeclarados ?? []).some(bateDeclaracao)
  );
  const declaracao = itemDeclarante?.system.recursosDeclarados.find(bateDeclaracao);
  const uuidCondicao = declaracao?.condicaoAoAtingirMax;
  if (!uuidCondicao) return;

  const estavaNoMaximo = antigo >= max;
  const estaNoMaximo = novoValor >= max;
  if (estavaNoMaximo === estaNoMaximo) return; // sem transição - nada a fazer

  if (estaNoMaximo) {
    // Propaga o Rank do item que DECLAROU o recurso (ex: "Dualidade",
    // Habilidade da Classe Empíreo) pra Condição aplicada automaticamente
    // (ex: "Profusão Ousada"), SE o item declarante de fato tiver rank
    // (nem todos têm - "Elevar a Dualidade", "Santificar" e "Instinto de
    // Sobrevivência" não usam isso, então caem no padrão de sempre sem
    // efeito nenhum). Sem isso, a Condição sempre nasceria travada no
    // rank 1, mesmo que "Dualidade" já esteja no rank 4 (nível 16) -
    // bug real encontrado ao auditar a progressão do Empíreo.
    // A Condição pode dizer de qual item do portador vem o rank (ex.:
    // Profusão segue a Dualidade, já que quem declara o recurso é a
    // Classe, que não tem rank). Quando diz, vale sobre o do declarante.
    const rankDoDeclarante = (await naurenRankDaCondicaoPeloPortador(actor, uuidCondicao)) || itemDeclarante?.system?.rankAtual || 0;
    await NaurenAlvoHelper.aplicarCondicao(actor, uuidCondicao, 1, null, rankDoDeclarante);
    // Dispara um Gatilho genérico "entrei ou evoluí uma Profusão" -
    // qualquer recurso customizado que tenha "Condição ao Atingir o
    // Máximo" aciona isso, então cobre tanto ENTRAR na Profusão base
    // (Determinação/Ofuscação batendo 5) quanto EVOLUIR/ELEVAR pra uma
    // versão mais forte (um 2º recurso, tipo "pontos elevados", batendo
    // no próprio máximo por cima) - o manual do Empíreo trata as duas
    // situações como o MESMO gatilho ("ao entrar ou evoluir uma
    // Profusão"), então uma Habilidade só precisa reagir a este evento.
    naurenProcessarGatilhos("entrouOuEvoluiuProfusao", actor, { recursoId: id, condicaoUuid: uuidCondicao }).catch(() => {});
  } else {
    // Saiu do máximo: remove a Condição/Efeito aplicada por esta mesma
    // origem, se ainda estiver presente (mesma lógica de identificação
    // usada em NaurenAlvoHelper.aplicarCondicao, pelo UUID de origem).
    const origem = await fromUuid(uuidCondicao).catch(() => null);
    if (!origem) return;
    const existente = origem.type === "condicao"
      ? actor.items.find(i => i.type === "condicao" && i.getFlag("nauren", "cadeiaRaizUuid") === uuidCondicao)
      : actor.items.find(i => i.type === origem.type && (i.getFlag("nauren", "origemUuid") === uuidCondicao || i.getFlag("core", "sourceId") === uuidCondicao));
    if (existente) await existente.delete();
  }
}

/**
 * Checa se o recurso customizado "id" está travado AGORA - ou porque o
 * jogador forçou manualmente ("travaManual" na própria barra), ou porque
 * outro recurso que o tem como par (campoRecursoDeclarado#travaRecursoId)
 * está no próprio máximo neste momento. Uma Habilidade ativa com
 * "desbloqueiaTravaDeRecurso" incluindo este id sempre destrava (só vale
 * pro caminho automático - "travado" manual ainda vence, de propósito,
 * já que é uma escolha explícita do jogador/mestre por cima de tudo).
 */
function naurenRecursoEstaTravado(actor, id) {
  const entrada = (actor.system.recursosCustom ?? []).find(r => r.id === id);
  if (!entrada) return false;
  if (entrada.travaManual === "destravado") return false;
  if (entrada.travaManual === "travado") return true;

  // Automático: procura QUALQUER recurso declarado (Classe ou Subclasse)
  // que aponte "travaRecursoId" pra este "id", e cuja barra correspondente
  // no ator já esteja no próprio máximo.
  const declaracoes = actor.items
    .filter(i => i.type === "classe" || i.type === "subclasse" || i.type === "habilidade" || i.type === "magia")
    .flatMap(i => i.system.recursosDeclarados ?? []);
  const travandoPor = declaracoes.find(d => d.travaRecursoId === id);
  if (!travandoPor) return false;
  const barraQueTrava = (actor.system.recursosCustom ?? []).find(r => r.id === travandoPor.id);
  if (!barraQueTrava || (barraQueTrava.max ?? 0) <= 0 || (barraQueTrava.valor ?? 0) < barraQueTrava.max) return false;

  // Alguma Habilidade/Magia ativa desbloqueia explicitamente este id?
  const desbloqueado = actor.items.some(i => (i.type === "habilidade" || i.type === "magia") && i.system.ativo &&
    (i.system.desbloqueiaTravaDeRecurso ?? "").split(",").map(s => s.trim()).includes(id));
  return !desbloqueado;
}

async function naurenConcederRecurso(actor, recurso, quantidadeTexto, item = null, detalhes = null) {
  let quantidade = 0;
  try {
    const mod = await naurenInterpretarModificadorComDado(quantidadeTexto, actor, item);
    quantidade = Math.round(mod?.valor ?? 0);
    // Auditoria: quem chama pode pedir a fórmula e o dado rolado.
    if (detalhes) Object.assign(detalhes, { formula: String(quantidadeTexto ?? ""), breakdown: mod?.breakdown ?? "", rolado: quantidade });
  } catch (err) {
    return 0;
  }
  if (!quantidade) return 0;

  if (recurso?.startsWith("recursoCustom:")) {
    const id = recurso.slice(14);
    // Só bloqueia GANHOS (quantidade > 0) - perder pontos de um recurso
    // travado continua permitido (não faria sentido travar a PERDA).
    if (quantidade > 0 && naurenRecursoEstaTravado(actor, id)) return 0;
    const lista = foundry.utils.deepClone(actor.system.recursosCustom ?? []);
    const entrada = lista.find(r => r.id === id);
    if (!entrada) return 0;
    const antigo = entrada.valor ?? 0;
    const novoValor = Math.max(0, Math.min(entrada.max ?? 0, antigo + quantidade));
    if (novoValor === antigo) return 0;
    entrada.valor = novoValor;
    await actor.update({ "system.recursosCustom": lista }, { naurenOrigemCombate: true, naurenDeGatilho: true });
    await naurenChecarCondicaoAoAtingirMax(actor, id, entrada, antigo, novoValor);
    return novoValor - antigo;
  }

  // "estresse" é diferente dos outros 4: o caso de uso mais comum é
  // REDUZIR (ex: "Regeneração", que perde 1 de Estresse no início da
  // rodada), então aceita quantidade NEGATIVA na fórmula do gatilho
  // (escreva "-1" pra reduzir). Mesmo nome que gastosRecurso já usa pro
  // alvo (RECURSOS_ALVO) - "estresse" mapeia pro campo interno "stress".
  const camposPadrao = { vida: "vida", mana: "mana", estaminaCombate: "estaminaCombate", dadosDestino: "dadosDestino", estresse: "stress" };
  const campo = camposPadrao[recurso];
  if (!campo) return 0;
  const atual = actor.system[campo]?.value ?? 0;
  const max = actor.system[campo]?.max ?? 0;
  if (campo === "vida" && quantidade > 0) { // Cura Recebida reduzida (Putrefato): auditável no card de quem chamou
    const aj = NaurenAlvoHelper.ajustarCuraRecebida(actor, quantidade);
    if (aj.cortada && detalhes) Object.assign(detalhes, { curaCortada: aj.cortada, curaFontes: aj.fontes ?? [] });
    quantidade = aj.cura;
  }
  // "Passar do máximo" (ex.: Vigilante: +1 Estamina no início do combate, mesmo com a Estamina cheia).
  const novoValor = Math.max(0, detalhes?.passarDoMaximo && quantidade > 0 ? atual + quantidade : Math.min(max, atual + quantidade));
  if (novoValor === atual) return 0;
  await actor.update({ [`system.${campo}.value`]: novoValor }, { naurenOrigemCombate: true, naurenDeGatilho: true }); // não é "edição manual": evita o gatilho disparar de novo (Ferida Antiga em laço)
  return novoValor - atual;
}

/** Nome pra exibir no chat quando um gatilho concede um recurso (ver naurenProcessarGatilhos). */
function naurenNomeRecurso(actor, recurso) {
  const nomesPadrao = { vida: "Vida", mana: "Mana", estaminaCombate: "Estamina", dadosDestino: "Dado de Destino", estresse: "Estresse" };
  if (nomesPadrao[recurso]) return nomesPadrao[recurso];
  if (recurso?.startsWith("recursoCustom:")) {
    const id = recurso.slice(14);
    const entrada = (actor.system.recursosCustom ?? []).find(r => r.id === id);
    return entrada?.nome ?? id;
  }
  return recurso ?? "?";
}

/**
 * Rouba "quantidadeTexto" de um recurso do ALVO (quem sofreu a Ação -
 * sempre "eu mesmo" no contexto de onde isto é chamado, processarPacoteLocalmente,
 * então sempre tenho permissão de reduzir o meu próprio) e concede a
 * mesma quantidade REALMENTE absorvida ao ATACANTE original (identificado
 * por UUID de TOKEN, que pode pertencer a OUTRO jogador - por isso os dois
 * lados passam pelo caminho seguro NaurenAlvoHelper.atualizarAtorSeguro,
 * nunca ".update()" direto). Usado pelo campo "Roubar Recurso" de uma
 * Ação (ex: "Roubar Destino" do Ladino). Nunca rouba mais do que o
 * alvo tem, nem concede mais do que cabe no atacante (se o atacante já
 * estiver no máximo daquele recurso, ou não tiver o recurso Customizado em
 * questão, nada é roubado).
 */
async function naurenTransferirRecursoDoAlvo(alvoActor, atacanteTokenUuid, tipoRecurso, quantidadeTexto) {
  const atacanteTokenDoc = await fromUuid(atacanteTokenUuid).catch(() => null);
  const atacanteActor = atacanteTokenDoc?.actor;
  if (!atacanteActor || atacanteActor === alvoActor) return 0; // não faz sentido roubar de si mesmo

  let quantidadeDesejada = 0;
  try {
    const mod = await naurenInterpretarModificadorComDado(quantidadeTexto, atacanteActor);
    quantidadeDesejada = Math.round(mod?.valor ?? 0);
  } catch (err) {
    return 0;
  }
  if (quantidadeDesejada <= 0) return 0;

  if (tipoRecurso?.startsWith("recursoCustom:")) {
    const id = tipoRecurso.slice(14);
    const alvoLista = foundry.utils.deepClone(alvoActor.system.recursosCustom ?? []);
    const alvoEntrada = alvoLista.find(r => r.id === id);
    if (!alvoEntrada) return 0;
    const disponivel = Math.min(quantidadeDesejada, alvoEntrada.valor ?? 0);
    if (disponivel <= 0) return 0;

    const atacanteLista = foundry.utils.deepClone(atacanteActor.system.recursosCustom ?? []);
    const atacanteEntrada = atacanteLista.find(r => r.id === id);
    if (!atacanteEntrada) return 0; // atacante não tem esse recurso Customizado - nada a fazer
    const antigoAtacante = atacanteEntrada.valor ?? 0;
    const novoAtacante = Math.max(0, Math.min(atacanteEntrada.max ?? 0, antigoAtacante + disponivel));
    const ganho = novoAtacante - antigoAtacante;
    if (ganho <= 0) return 0; // atacante já está no máximo - nada a roubar

    alvoEntrada.valor = Math.max(0, (alvoEntrada.valor ?? 0) - ganho);
    atacanteEntrada.valor = novoAtacante;
    await NaurenAlvoHelper.atualizarAtorSeguro(alvoActor, { "system.recursosCustom": alvoLista });
    await NaurenAlvoHelper.atualizarAtorSeguro(atacanteActor, { "system.recursosCustom": atacanteLista });
    naurenAvisarRoubo(atacanteActor, alvoActor, ganho, naurenNomeRecurso(atacanteActor, tipoRecurso));
    return ganho;
  }

  const camposPadrao = { vida: "vida", mana: "mana", estaminaCombate: "estaminaCombate", dadosDestino: "dadosDestino" };
  const campo = camposPadrao[tipoRecurso];
  if (!campo) return 0;
  const atualAlvo = alvoActor.system[campo]?.value ?? 0;
  const disponivel = Math.min(quantidadeDesejada, atualAlvo);
  if (disponivel <= 0) return 0;

  const atualAtacante = atacanteActor.system[campo]?.value ?? 0;
  const maxAtacante = atacanteActor.system[campo]?.max ?? 0;
  const novoAtacante = Math.max(0, Math.min(maxAtacante, atualAtacante + disponivel));
  const ganho = novoAtacante - atualAtacante;
  if (ganho <= 0) return 0;

  await NaurenAlvoHelper.atualizarAtorSeguro(alvoActor, { [`system.${campo}.value`]: atualAlvo - ganho });
  await NaurenAlvoHelper.atualizarAtorSeguro(atacanteActor, { [`system.${campo}.value`]: novoAtacante });
  naurenAvisarRoubo(atacanteActor, alvoActor, ganho, naurenNomeRecurso(atacanteActor, tipoRecurso));
  return ganho;
}

/**
 * Concessão ao Atacante, condicional a Acertar/Errar (ver campoAcao >
 * concessaoAoAtacante, ex: Ímpeto, Empíreo - "+2 Determinação se
 * acertar, +2 Ofuscação se errar") - mesmo padrão de
 * naurenTransferirRecursoDoAlvo (roda do lado de quem processa o ALVO,
 * mas ajusta o ATACANTE via atacanteTokenUuid), só que sem tirar nada
 * do alvo - reaproveita naurenConcederRecurso pra aplicar de verdade.
 */
async function naurenConcederRecursoAoAtacante(atacanteTokenUuid, recurso, quantidadeTexto) {
  const atacanteTokenDoc = await fromUuid(atacanteTokenUuid).catch(() => null);
  const atacanteActor = atacanteTokenDoc?.actor;
  if (!atacanteActor) return 0;
  const ganho = await naurenConcederRecurso(atacanteActor, recurso, quantidadeTexto);
  if (ganho > 0) naurenNotificarGanhoPerda(atacanteActor, { quantidade: ganho, rotulo: naurenNomeRecurso(atacanteActor, recurso), origemNome: "" });
  return ganho;
}

/** Aviso de chat pro Roubar Recurso - separado só pra não repetir a mesma linha 2x acima. */
/**
 * Busca todos os atores que são Mascote de "donoActor" -
 * ver NaurenActorData#mascoteDeUuid. Sempre por busca em game.actors, não
 * uma lista guardada no dono - evita os dois lados ficarem
 * dessincronizados um do outro (o mascote é a ÚNICA fonte de verdade de
 * quem é o dono dele).
 */
function naurenBuscarMascotesDe(donoActor) {
  if (!donoActor) return [];
  return game.actors.filter(a => a.system?.mascoteDeUuid === donoActor.uuid);
}

/**
 * Verifica os quatro recursos padrão de um ator (Vida, Mana, Estamina de
 * Combate, Dados de Destino) e reduz qualquer valor atual que esteja
 * acima do próprio máximo. Usado após uma mudança que recalcula o máximo
 * sem ajustar o valor atual junto, como sincronizar o nível de um
 * Mascote com um dono de nível diferente.
 */
// Condição/Efeito que baixa um máximo (ex.: Congelando, −1 Estamina de Combate Máxima): o valor atual
// acompanha (antes ficava "2/1" na ficha e no HUD).
for (const evento of ["createItem", "updateItem", "deleteItem"]) {
  Hooks.on(evento, (item, a2, a3, a4) => {
    const userId = evento === "updateItem" ? a4 : a3;
    if (userId !== game.user.id || !["condicao", "efeito"].includes(item.type) || item.parent?.documentName !== "Actor") return;
    naurenClamparRecursosAoMaximo(item.parent).catch(() => {});
  });
}
async function naurenClamparRecursosAoMaximo(actor) {
  const ajustes = {};
  for (const campo of ["vida", "mana", "estaminaCombate", "dadosDestino"]) {
    const atual = actor.system[campo]?.value ?? 0;
    const max = actor.system[campo]?.max ?? 0;
    if (atual > max) ajustes[`system.${campo}.value`] = max;
  }
  if (Object.keys(ajustes).length) {
    await NaurenAlvoHelper.atualizarAtorSeguro(actor, ajustes);
  }
}

/**
 * Ajusta o nível de todos os Mascotes de "donoActor" para o mesmo nível
 * dele, e em seguida reduz qualquer recurso que tenha ficado acima do
 * novo máximo.
 */
async function naurenSincronizarNivelDosMascotes(donoActor, novoNivel) {
  const mascotes = naurenBuscarMascotesDe(donoActor);
  for (const mascote of mascotes) {
    if ((mascote.system.nivel ?? 1) === novoNivel) continue;
    const ok = await NaurenAlvoHelper.atualizarAtorSeguro(mascote, { "system.nivel": novoNivel });
    if (ok) await naurenClamparRecursosAoMaximo(mascote);
  }
}

function naurenAvisarRoubo(atacanteActor, alvoActor, ganho, nomeRecurso) {
  naurenPostarCard({ ator: atacanteActor, titulo: `Roubo de ${nomeRecurso}`, fonte: `De ${alvoActor.name}`,
    linhas: [{ label: `${nomeRecurso} roubado`, value: `+${ganho}` }] });
}

/**
 * Empurra um TOKEN "metrosTexto" metros PRA LONGE de uma origem, em linha
 * reta - usado por "Empurrar ao Acertar" de uma Ação (ex: Golpe de
 * Escudo, Investida Relâmpago). "origem" aceita DOIS formatos: um UUID de
 * TOKEN (empurra pra longe DELE - caso de ataque) OU um ponto {x,y} direto
 * (empurra pra longe DAQUELE ponto - caso de Template/área, reaproveitando
 * a MESMA função). A parte de "metros" reaproveita canvas.grid.measurePath
 * (já usado em outros lugares deste sistema) em vez de calcular
 * pixels-por-metro na mão, evitando depender de detalhes de configuração
 * de grid que variam por cena.
 *
 * : agora verifica colisão com PAREDE (API oficial
 * Token#checkCollision) e com OUTROS TOKENS no caminho - quando
 * bloqueado, para o mais perto possível do destino ideal sem atravessar,
 * em vez de simplesmente ignorar tudo no meio do caminho.
 */
async function naurenEmpurrarToken(tokenDocAlvo, origem, metrosTexto, direcao = "afastar") {
  if (!canvas?.ready || !tokenDocAlvo?.object) return;

  let origemPonto;
  if (typeof origem === "string") {
    const origemTokenDoc = await fromUuid(origem).catch(() => null);
    if (!origemTokenDoc?.object || origemTokenDoc.id === tokenDocAlvo.id) return;
    origemPonto = origemTokenDoc.object.center;
  } else if (origem && typeof origem.x === "number" && typeof origem.y === "number") {
    origemPonto = origem;
  } else {
    return;
  }

  let metros = 0;
  try {
    metros = naurenAvaliarExpressaoSimples(String(metrosTexto ?? "0"));
  } catch (err) {
    return;
  }
  if (!metros || metros <= 0) return;

  const calc = naurenCalcularEmpurrao(tokenDocAlvo, origemPonto, metros, direcao);
  if (!calc) return;
  if (calc.andados > 0 || calc.colidiuCom) {
    // 0.94.16: o token cresce no caminho (arremesso) e treme se bater - só visual, em todas as telas.
    naurenMotionEmTodos("empurrao", { token: tokenDocAlvo.uuid, metros: calc.andados * calc.metrosPorCasa, colidiu: !!calc.colidiuCom });
  }
  if (calc.andados > 0) {
    await naurenDeslocarToken(tokenDocAlvo, calc.destino.x - calc.tamanho.width / 2, calc.destino.y - calc.tamanho.height / 2);
  }
  return { metrosMovidos: calc.andados * calc.metrosPorCasa, metrosPedidos: metros, colidiuCom: calc.colidiuCom };
}

/**
 * Caminho de um empurrão/puxão, quadrado a quadrado, SEM mover nada (Fase 6
 * - Mv). Usado para aplicar o empurrão e para o atacante prever a colisão
 * antes de rolar o dano. Devolve { destino, andados, colidiuCom, tamanho,
 * metrosPorCasa } ou null.
 */
function naurenCalcularEmpurrao(tokenDocAlvo, origemPonto, metros, direcao = "afastar") {
  if (!canvas?.ready || !tokenDocAlvo?.object || !origemPonto || !(metros > 0)) return null;
  const alvoPos = tokenDocAlvo.object.center;
  const dx = alvoPos.x - origemPonto.x, dy = alvoPos.y - origemPonto.y;
  if (Math.hypot(dx, dy) < 1) return null; // mesma posição - direção indefinida

  // Movimento quadrado a quadrado (Fase 6 - Mv): cada passo anda 1 casa na
  // direção do empurrão (ou do puxão) e só é aceito se a linha até a
  // próxima casa não cruzar uma parede e a casa não estiver ocupada por
  // outro token. O token sempre termina ALINHADO ao grid, na última casa
  // livre - nunca dentro de uma parede.
  const tamanhoCasa = canvas.grid.size;
  const metrosPorCasa = canvas.scene?.grid?.distance || 1;
  const passos = Math.max(0, Math.round(metros / metrosPorCasa));
  if (!passos) return null;
  const sentido = direcao === "puxar" ? -1 : 1;
  const maiorEixo = Math.max(Math.abs(dx), Math.abs(dy));
  const passoX = sentido * dx / maiorEixo * tamanhoCasa;
  const passoY = sentido * dy / maiorEixo * tamanhoCasa;
  const centroDaCasa = p => {
    try { return canvas.grid.getCenterPoint(p); } catch (err) { return p; }
  };
  const cruzaParede = (de, para) => {
    try {
      const backend = CONFIG.Canvas.polygonBackends?.move;
      if (backend?.testCollision) return !!backend.testCollision(de, para, { type: "move", mode: "any" });
      return !!tokenDocAlvo.object.checkCollision(para, { origin: de, type: "move", mode: "any" });
    } catch (err) {
      console.warn("Nauren RPG | Falha ao checar parede no empurrão.", err);
      return false;
    }
  };
  const tamanho = tokenDocAlvo.getSize();
  const raioAlvo = Math.min(tamanho.width, tamanho.height) / 2;
  const outrosTokens = canvas.tokens.placeables.filter(t => t.document.id !== tokenDocAlvo.id && !t.document.hidden);
  const tokenOcupando = ponto => outrosTokens.find(t => {
    const tam = t.document.getSize();
    const raioOutro = Math.min(tam.width, tam.height) / 2;
    return Math.hypot(ponto.x - t.center.x, ponto.y - t.center.y) < (raioAlvo + raioOutro) * 0.9;
  });

  let atual = centroDaCasa(alvoPos);
  let andados = 0;
  let colidiuCom = null; // "parede" | TokenDocument
  for (let k = 1; k <= passos; k++) {
    const proximo = centroDaCasa({ x: alvoPos.x + passoX * k, y: alvoPos.y + passoY * k });
    if (proximo.x === atual.x && proximo.y === atual.y) continue;
    if (cruzaParede(atual, proximo)) { colidiuCom = "parede"; break; }
    const ocupante = tokenOcupando(proximo);
    if (ocupante) { colidiuCom = ocupante.document; break; }
    atual = proximo;
    andados += 1;
  }

  // Puxar que para encostado em quem puxou não é "colisão".
  return { destino: atual, andados, colidiuCom: direcao !== "puxar" ? colidiuCom : null, tamanho, metrosPorCasa };
}

/** Dano de colisão num personagem, no cliente do dono dele, com card próprio. */
const NAUREN_QUERY_DANO_COLISAO = "nauren.danoColisao";
async function naurenHandleQueryDanoColisao({ actorUuid, dano, texto, origemNome }) {
  const doc = await fromUuid(actorUuid).catch(() => null);
  const actor = doc?.actor ?? doc;
  if (!actor?.system?.vida) return false;
  const antes = actor.system.vida.value ?? 0;
  const depois = Math.max(0, antes - dano);
  await actor.update({ "system.vida.value": depois });
  naurenPostarCard({ ator: actor, titulo: "Colisão", icone: "icons/magic/light/explosion-impact-purple.webp", fonte: origemNome ? `Colisão • ${origemNome}` : "Colisão",
    linhas: [{ label: "Dano", value: dano, breakdown: texto }, game.settings.get("nauren", "mostrarVidaNosCards") ? { label: "Vida", value: `${antes} → ${depois}` } : null].filter(Boolean) });
  return true;
}

/**
 * Processa Gatilhos por Evento - ver
 * NaurenHabilidadeData#gatilhos. "tipoEvento" é um dos 4 suportados:
 * "aliadoSofreuDano", "euSofriDano", "euAcerteiAtaque", "euErreiAtaque".
 * "atorEvento" é quem PROTAGONIZOU o evento (quem sofreu dano, ou quem
 * atacou) - a partir dele descobrimos quem são os "aliados" (mesma
 * disposição de TOKEN no cenário atual) que possam ter uma Habilidade
 * reagindo a isso. NÃO depende de Prioridade formalizada (decisão
 * deliberada - ver conversa) - só verifica se o EVENTO aconteceu.
 * Cada cliente processa só os atores que possui (actor.isOwner), evitando
 * duplicar a concessão quando há vários clientes conectados.
 */
/**
 * Disjuntor de segurança: o mesmo evento no mesmo personagem disparando mais de 15 vezes em 2 s
 * só acontece num laço (um gatilho que provoca o próprio evento) - aí é barrado e avisado.
 * Danos/eventos legítimos, mesmo seguidos, nunca chegam perto disso.
 */
const naurenDisjuntorGatilhos = new Map();
const naurenGatilhosPorExecucao = new Set();
/** Bênção Solar: reconjuração pendente por ator (a magia, a Ação e o alvo que a dispararam). */
const naurenReconjurarPendente = new Map();
async function naurenProcessarGatilhos(tipoEvento, atorEvento, contexto = {}) {
  const chave = `${tipoEvento}|${atorEvento?.uuid ?? ""}`;
  const agora = Date.now();
  const reg = naurenDisjuntorGatilhos.get(chave);
  if (!reg || agora - reg.inicio > 2000) naurenDisjuntorGatilhos.set(chave, { inicio: agora, n: 1, avisado: false });
  else if (++reg.n > 15) {
    if (!reg.avisado) { reg.avisado = true; console.warn(`Nauren RPG | Gatilhos de "${tipoEvento}" em ${atorEvento?.name} entraram em laço e foram interrompidos.`); ui.notifications?.warn(`Um gatilho de ${atorEvento?.name} entrou em laço e foi interrompido (veja o console).`); }
    return;
  }
  return naurenProcessarGatilhosInterno(tipoEvento, atorEvento, contexto);
}
async function naurenProcessarGatilhosInterno(tipoEvento, atorEvento, contexto = {}) {
  if (!atorEvento || !canvas?.ready) return;
  const rotuloEvento = NAUREN_GATILHO_EVENTO_OPCOES[tipoEvento] ?? tipoEvento;

  let candidatos;
  let tokenEvento = null;
  // Qualquer evento começando com "aliado" (ex: "aliadoSofreuDano",
  // "aliadoAcertouAtaque") usa a MESMA lógica de busca - procura quem
  // está do lado de quem disparou o evento, não o próprio "atorEvento".
  if (tipoEvento.startsWith("aliado")) {
    tokenEvento = atorEvento.getActiveTokens?.(true)?.[0] ?? null;
    if (!tokenEvento) {
      console.log(`Nauren RPG | Gatilho "${tipoEvento}" não processado: "${atorEvento.name}" não tem token ativo na cena atual (não dá pra saber quem são os aliados dele sem isso).`);
      return;
    }
    // "aliado" = mesma disposição de TOKEN (Amigável/Neutro/Hostil) do
    // token de quem disparou o evento, excluindo ele mesmo - é o mesmo
    // critério padrão do Foundry pra "quem está do meu lado" (usado em
    // qualquer sistema, não é algo customizável por enquanto).
    candidatos = canvas.tokens.placeables
      .filter(t => t.actor && t !== tokenEvento && t.actor !== atorEvento && t.document.disposition === tokenEvento.document.disposition && !t.actor.getFlag?.("nauren", "entidade")?.ativa)
      .map(t => ({ actor: t.actor, token: t }));
  } else if (tipoEvento.startsWith("alguem")) {
    // Diferente de "aliado*": quem reage NÃO é necessariamente do mesmo
    // lado de quem protagonizou o evento (ex: "Pânico", do Empíreo, reage a
    // um INIMIGO ficar Amedrontado; "Acovardar", do Ladino, reage a
    // QUALQUER personagem errar um ataque). Então avisa TODO mundo na cena,
    // exceto o próprio ator que protagonizou - cada Habilidade filtra
    // sozinha pelo que lhe interessa (Condição Necessária, alcance, etc).
    tokenEvento = atorEvento.getActiveTokens?.(true)?.[0] ?? null;
    candidatos = (canvas?.tokens?.placeables ?? [])
      .filter(t => t.actor && t !== tokenEvento && !t.actor.getFlag?.("nauren", "entidade")?.ativa)
      .map(t => ({ actor: t.actor, token: t }));
  } else {
    // "euSofriDano"/"euAcerteiAtaque"/"euErreiAtaque"/"usoCrescimento" - o
    // próprio protagonista é quem pode ter a Habilidade reagindo à
    // própria ação (qualquer evento NÃO listado acima cai aqui, por
    // padrão - é o "self" genérico).
    candidatos = [{ actor: atorEvento, token: atorEvento.getActiveTokens?.(true)?.[0] ?? null }];
  }

  for (const { actor: candidato, token: tokenCandidato } of candidatos) {
    // Encaminhamento recebido de outra máquina: processa SÓ o candidato indicado.
    if (contexto._apenasCandidatoUuid && candidato?.uuid !== contexto._apenasCandidatoUuid) continue;
    // O Mestre também é dono de tudo, mas quando o personagem tem um jogador conectado é ele quem
    // decide o que o gatilho pergunta (ex.: Esquiva Elegante - para onde se mover depois de esquivar).
    const outroResponsavel = candidato?.isOwner && game.user.isGM && !contexto._apenasCandidatoUuid && !contexto._mestreAssume
      && naurenUsuarioResponsavel(candidato) !== game.user && !naurenUsuarioResponsavel(candidato)?.isGM;
    if (!candidato?.isOwner || outroResponsavel) {
      // Personagem de outro dono (ex.: o Ladino de outro jogador reagindo a "um aliado sofreu dano"):
      // encaminha o evento à máquina do responsável por ele, marcado para processar só esse personagem.
      if (contexto._apenasCandidatoUuid) continue;
      const responsavel = naurenUsuarioResponsavel(candidato);
      if (responsavel && responsavel !== game.user && typeof responsavel.query === "function") {
        let ctxRemoto = {}; try { ctxRemoto = JSON.parse(JSON.stringify(contexto)); } catch (err) { ctxRemoto = {}; }
        ctxRemoto._apenasCandidatoUuid = candidato.uuid;
        responsavel.query(NAUREN_QUERY_DISPARAR_EVENTO, { actorUuid: atorEvento.uuid, evento: tipoEvento, contexto: ctxRemoto }, { timeout: 20000 })
          .catch(err => {
            console.warn(`Nauren RPG | Gatilho "${tipoEvento}": não foi possível encaminhar a "${candidato.name}" (${responsavel.name}).`, err);
            // 0.94.12: a tela do jogador não respondeu: o Mestre processa no lugar (o gatilho não pode se perder).
            if (game.user.isGM) naurenProcessarGatilhos(tipoEvento, atorEvento, { ...contexto, _apenasCandidatoUuid: candidato.uuid, _mestreAssume: true }).catch(() => {});
          });
      }
      continue;
    }
    for (const item of candidato.items) {
      if (!["habilidade", "peculiaridade", "magia", "condicao", "efeito"].includes(item.type) || !item.system.usaGatilhos) continue;
      if (item.type !== "condicao" && !item.system.ativo) continue;
      if (item.type === "condicao" && naurenEhCondicaoModelo(item)) continue; // modelo guardado na ficha (NPC) não está "em" ninguém
      const usosGatilho = foundry.utils.deepClone(item.getFlag("nauren", "gatilhoUsos") ?? {});
      if (naurenEhCondicaoModelo(item)) continue; // modelo na ficha do NPC: não age nele
      const gatilhosBatendo = (item.system.gatilhos ?? []).map((g, indice) => ({ ...naurenResolverSelfEmObjeto(g, candidato), _indice: indice })).filter(g => {
        if (g.evento !== tipoEvento) return false;
        if (g.apenasAtaque && !contexto.ehAtaque) return false;
        if (g.soSeAcertou && contexto.acertou === false) return false;
        if (g.momentoAcao === "emPrioridade" && contexto.emPrioridade !== true) return false;
        if (g.momentoAcao === "meuTurno" && contexto.emPrioridade === true) return false;
        // Em eventos com atacante, o alcance é medido até ele.
        if (g.alcance && contexto.atacanteTokenUuid && tokenCandidato) {
          const atacanteDoc = fromUuidSync(contexto.atacanteTokenUuid);
          const atacanteToken = atacanteDoc?.object ?? null;
          if (atacanteToken) {
            let distancia = Infinity;
            try { distancia = naurenMedirDistanciaBordas(tokenCandidato, atacanteToken); } catch (err) { distancia = Infinity; }
            if (distancia > parseFloat(g.alcance)) return false;
          }
        }
        if (String(g.limiteUsos ?? "").trim()) {
          const limite = Math.max(0, Math.round(Number(String(g.limiteUsos).replace(/@rank\b/gi, String(item.system.rankAtual ?? 0)).replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, candidato)))) || 0));
          const chave = naurenChaveEscopoRelogio(g.limiteEscopo || "turno", candidato);
          const idxUso = g.limitePorAlvo && contexto.alvoUuid ? `${g._indice}_${String(contexto.alvoUuid).replace(/\./g, "_")}` : g._indice; // sem pontos: o Foundry trata "." como subnível ao gravar
          const registro = usosGatilho[idxUso];
          const usados = registro?.chave === chave ? registro.n : 0;
          if (usados >= limite) return false;
        }
        // Limiar de Estresse - só relevante pra "estresseAtingiu": só
        // dispara se o Estresse ATUAL (vindo do contexto) já alcançou o
        // valor configurado nesta linha.
        if (tipoEvento === "estresseAtingiu") {
          const limiar = parseFloat(g.limiarEstresse);
          if (!Number.isNaN(limiar) && (contexto.valorAtual ?? 0) < limiar) return false;
        }
        // Alcance - só relevante pra "aliadoSofreuDano":
        // se configurado, só conta se o dono desta Habilidade estiver a
        // até X metros do aliado que sofreu o dano.
        if (g.alcance && tokenEvento && tokenCandidato && tokenCandidato !== tokenEvento) {
          let distancia;
          try {
            distancia = naurenMedirDistanciaBordas(tokenCandidato, tokenEvento);
          } catch (err) {
            distancia = Infinity;
          }
          if (distancia > parseFloat(g.alcance)) return false;
        }
        // Condição necessária - só dispara se o DONO desta Habilidade já
        // tiver essa Condição/Efeito ativo agora (ex: "só funciona em
        // Forma de Besta").
        if (g.condicaoNecessariaUuid) {
          const tem = candidato.items.some(i => (i.type === "condicao" || i.type === "efeito") && i.system.ativo &&
            (i.getFlag("nauren", "origemUuid") === g.condicaoNecessariaUuid || i.getFlag("core", "sourceId") === g.condicaoNecessariaUuid));
          if (!tem) return false;
        }
        // Condição por Fórmula: resolve @tokens (incluindo "@aliados_Nm")
        // e exige um resultado DIFERENTE de zero pro gatilho disparar -
        // "!" no início INVERTE (exige resultado ZERO) - ex: "!@aliados_4m"
        // cobre "só dispara se NÃO houver aliados a até 4m" (Solitude).
        if (g.condicaoFormula) {
          const negar = g.condicaoFormula.trim().startsWith("!");
          const bruta = negar ? g.condicaoFormula.trim().slice(1) : g.condicaoFormula;
          const resolvida = bruta.replace(/@aliados_(\d+(?:\.\d+)?)m\b/g, (m, raio) => String(naurenContarAliadosProximos(candidato, parseFloat(raio))))
            .replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, candidato)));
          let valor = 0;
          try { valor = naurenAvaliarExpressaoSimples(resolvida); } catch (err) { valor = 0; }
          const passou = negar ? valor === 0 : valor !== 0;
          if (!passou) return false;
        }
        // Item Usado - só relevante pros eventos "usei X" (useiHabilidade/
        // useiMagia/useiArma), que disparam pra QUALQUER item daquele
        // tipo. Filtra pra só bater com um item ESPECÍFICO.
        // O gatilho guarda o item do COMPÊNDIO; o usado é a cópia na ficha
        // (outro uuid). Compara pela origem também (ex.: Pintura da Harmonia
        // reagindo ao Canalizar o Espírito da ficha).
        if (g.itemUsadoUuid && contexto.itemUsadoUuid !== g.itemUsadoUuid) {
          let usado = null;
          try { usado = contexto.itemUsadoUuid ? fromUuidSync(contexto.itemUsadoUuid) : null; } catch (err) { usado = null; }
          const fonteUsado = usado?._stats?.compendiumSource ?? null;
          if (!naurenItemCorrespondeAoAlvo(usado, g.itemUsadoUuid) && fonteUsado !== g.itemUsadoUuid) return false;
        }
        // Nome da Ação contém - checagem simples de substring (não regex),
        // pra distinguir qual Ação especificamente foi usada dentro de um
        // item com várias (ex: normal vs "(Penitência)").
        if (g.nomeAcaoContem && !(contexto.acaoNome ?? "").includes(g.nomeAcaoContem)) return false;
        // Tipo do Item Usado - filtra pelo TYPE do item que causou o
        // evento (ex: "magia" - Bênção Solar só reage a Magias, não a
        // ataques com Arma).
        if (g.tipoItemUsado && contexto.tipoItemUsado !== g.tipoItemUsado) return false;
        // Corpo a corpo / à distância e Arma / Magia (M04) - só em eventos de ataque que trazem isso.
        if (g.filtroAlcanceAtaque && contexto.tipoAlcance && contexto.tipoAlcance !== g.filtroAlcanceAtaque) return false;
        if (g.filtroAlcanceAtaque && !contexto.tipoAlcance && contexto.origem === "condicao") return false; // dano de Condição não é golpe
        if (g.filtroOrigemAtaque && contexto.origemAtaque && contexto.origemAtaque !== g.filtroOrigemAtaque) return false;
        if (g.itemNomeContem && !String(contexto.itemNome ?? "").toLowerCase().includes(g.itemNomeContem.toLowerCase())) return false;
        if (g.soSemPrioridade && contexto.usouPrioridade) return false;
        if (g.soAtaque && !contexto.ehAtaque) return false;
        if (g.condicaoNomeContem && !String(contexto.condicaoNome ?? "").toLowerCase().includes(String(g.condicaoNomeContem).toLowerCase())) return false;
        if (g.soSemFacilidade && contexto.modoAtaque === "vantagem") return false;
        if (g.semEstadoNome && naurenTemEstado(candidato, g.semEstadoNome)) {
          const excecoes = String(g.excetoComHabilidade ?? "").split(",").map(x => x.trim()).filter(Boolean);
          if (!excecoes.some(n => candidato.items.some(i => i.type === "habilidade" && i.name === n && i.system.ativo !== false))) return false;
        }
        if (g.profusaoTipo) {
          const tipoCtx = contexto.recursoId === "determinacao" ? "ousada" : contexto.recursoId === "ofuscacao" ? "retraida" : "";
          if (tipoCtx !== g.profusaoTipo) return false;
        }
        if (g.alvoInimigoAteMetros) {
          const tokEu = candidato.getActiveTokens?.(true)?.[0];
          let tokAlvo = null;
          try { const d = fromUuidSync(contexto.alvoUuid); tokAlvo = (d?.actor ?? d)?.getActiveTokens?.(true)?.[0]; } catch (err) { tokAlvo = null; }
          if (!tokEu || !tokAlvo || tokAlvo.document.disposition === tokEu.document.disposition) return false;
          if (naurenMedirDistanciaBordas(tokEu, tokAlvo) > Number(g.alvoInimigoAteMetros)) return false;
        }
        if (g.duasArmas && candidato.items.filter(i => i.type === "arma" && i.system.equipado).length < 2) return false;
        if ((g.naoDoMeuMascote || g.soDeAliado) && contexto.origemAtorUuid) {
          let origem = null;
          try { const d = fromUuidSync(contexto.origemAtorUuid); origem = d?.actor ?? d; } catch (err) { origem = null; }
          if (g.naoDoMeuMascote && origem?.system?.mascoteDeUuid === candidato.uuid) return false;
          if (g.soDeAliado && origem && naurenDisposicaoDoAtor(origem) !== naurenDisposicaoDoAtor(candidato)) return false;
        }
        if (g.paraMeuMascote) {
          const outroUuid = contexto.paraUuid || contexto.alvoUuid;
          let outro = null;
          try { const d = outroUuid ? fromUuidSync(outroUuid) : null; outro = d?.actor ?? d; } catch (err) { outro = null; }
          if (!outro || outro.system?.mascoteDeUuid !== candidato.uuid) return false;
        }
        if (g.alvoComMinhaCondicaoNome) {
          const texto = g.alvoComMinhaCondicaoNome.toLowerCase();
          const alvoCtx = contexto.alvoUuid ? (() => { try { const d = fromUuidSync(contexto.alvoUuid); return d?.actor ?? d; } catch (err) { return null; } })() : null;
          const tinha = (contexto.condicoesDoAlvoAntes ?? alvoCtx?.items?.filter(i => i.type === "condicao").map(i => ({ nome: i.name, conjurador: i.system.conjuradorUuid })) ?? [])
            .some(c => String(c.nome).toLowerCase().includes(texto) && (() => { try { const d = fromUuidSync(c.conjurador); return (d?.actor ?? d)?.uuid === candidato.uuid; } catch (err) { return false; } })());
          if (!tinha) return false;
        }
        // Só de quem aplicou (Condição): o atacante do evento precisa ser
        // quem aplicou esta Condição (ex.: Julgamento Dourado).
        if (g.soDeQuemAplicou) {
          const resolver = uuid => { try { const d = fromUuidSync(uuid); return d?.actor ?? d; } catch (err) { return null; } };
          const quemAplicou = item.system.conjuradorUuid ? resolver(item.system.conjuradorUuid) : null;
          // Eventos de ataque sofrido trazem o atacante; eventos "eu ataquei/acertei/errei" trazem o ALVO
          // (Carga Residual: o portador atacou quem aplicou). Qualquer um dos dois precisa ser quem aplicou.
          const outro = contexto.atacanteTokenUuid ? resolver(contexto.atacanteTokenUuid) : contexto.alvoUuid ? resolver(contexto.alvoUuid) : null;
          if (!quemAplicou || !outro || quemAplicou.uuid !== outro.uuid) return false;
        }
        // Só se Cura - só relevante pra "usoCrescimento": exige que a
        // Ação em questão seja de cura (ver contexto.ehCura, calculado
        // em _executarAcao).
        if (g.soSeCura && !contexto.ehCura) return false;
        // Condição do Contexto - só relevante pra "Alguém recebeu uma
        // Condição": filtra por QUAL Condição foi recebida.
        if (g.condicaoDoContextoUuid && contexto.condicaoUuid !== g.condicaoDoContextoUuid) return false;
        return true;
      });
      if (!gatilhosBatendo.length) continue;
      if (item.system.usaUsosPassiva && (item.system.usosPassivaAtual ?? 0) <= 0) {
        console.log(`Nauren RPG | Gatilho "${item.name}" (${tipoEvento}) não disparou: sem usos sobrando.`);
        continue;
      }

      let concedeuAlgo = false;
      let usosPassivaGastar = 1; // com vários danos de uma vez, cada dano contado gasta um uso
      // Um card por item e por evento, com todas as linhas juntas.
      const linhasCard = [];
      let descricaoCard = "";
      const registrarUsoGatilho = async g => {
        if (!String(g.limiteUsos ?? "").trim()) return;
        const chave = naurenChaveEscopoRelogio(g.limiteEscopo || "turno", candidato);
        const idxUso = g.limitePorAlvo && contexto.alvoUuid ? `${g._indice}_${String(contexto.alvoUuid).replace(/\./g, "_")}` : g._indice; // sem pontos: o Foundry trata "." como subnível ao gravar
        const registro = usosGatilho[idxUso];
        usosGatilho[idxUso] = { chave, n: (registro?.chave === chave ? registro.n : 0) + 1 };
        await item.setFlag("nauren", "gatilhoUsos", usosGatilho).catch(() => {});
      };
      for (const g of gatilhosBatendo) {
        if (g.umaVezPorAcao && contexto.execucaoId) {
          const chaveExec = `${item.uuid}|${g._indice}|${contexto.execucaoId}`;
          if (naurenGatilhosPorExecucao.has(chaveExec)) continue;
          naurenGatilhosPorExecucao.add(chaveExec);
          if (naurenGatilhosPorExecucao.size > 500) naurenGatilhosPorExecucao.clear();
        }
        // O limite só conta disparos que produziram efeito (card ou recurso).
        // O corpo roda num "do/while(false)": cada "continue" encerra só
        // este Gatilho, e a contagem abaixo acontece sempre.
        const linhasAntes = linhasCard.length;
        const concedeuAntes = concedeuAlgo;
        do {
        // Recurso à escolha (ex.: Raiva - Determinação ou Ofuscação): o dono escolhe qual recebe.
        if (g.recursoAlternativo) {
          const nomeRec = r => { if (String(r ?? "").startsWith("condicaoEmMim:")) { try { return fromUuidSync(String(r).slice(14))?.name ?? "Condição"; } catch (err) { return "Condição"; } }
            const id = String(r ?? "").replace(/^recursoCustom:/, "");
            return (candidato.system.recursosCustom ?? []).find(x => x.id === id)?.nome
              ?? ({ vida: "Vida", mana: "Mana", estaminaCombate: "Estamina", dadosDestino: "Dado de Destino", estresse: "Estresse", determinacao: "Determinação", ofuscacao: "Ofuscação", energia: "Energia" }[id] ?? id); };
          const alvoRec = g.recurso?.startsWith("recursoCustom") && g.efeitoUuid && !g.recurso.includes(":") ? `recursoCustom:${g.efeitoUuid}` : g.recurso;
          // Só pergunta entre os que ainda podem subir (cheio ou travado,
          // ex.: Determinação em Profusão sem Ambivalência, não recebe nada).
          const podeReceber = r => { const t = String(r ?? ""); if (!t.startsWith("recursoCustom:")) return true;
            const id = t.slice(14); const e = (candidato.system.recursosCustom ?? []).find(x => x.id === id);
            return !!e && (!(e.max > 0) || (e.valor ?? 0) < e.max) && !naurenRecursoEstaTravado(candidato, id); };
          const okA = podeReceber(alvoRec), okB = podeReceber(g.recursoAlternativo);
          if (!okA && !okB) continue;
          const esc = okA && okB ? await foundry.applications.api.DialogV2.wait({ window: { title: item.name }, content: `<p><b>${item.name}</b>: qual você recebe?</p>`,
            buttons: [{ action: "a", label: nomeRec(alvoRec) }, { action: "b", label: nomeRec(g.recursoAlternativo) }], rejectClose: false }).catch(() => null) : (okA ? "a" : "b");
          if (!esc) continue;
          if (esc === "b") { g.recurso = g.recursoAlternativo; g.efeitoUuid = ""; }
          else { g.recurso = alvoRec; }
        }
        // Tipos novos (Fase 4): o alvo vem de "efeitoUuid" e vence o formato
        // antigo "tipo:alvo" quando os dois existem.
        {
          const [prefixo, ...resto] = String(g.recurso ?? "").split(":");
          const alvoEfeito = g.efeitoUuid || resto.join(":");
          if (["condicaoEmMim", "recursoCustom", "removerCondicaoEmMim"].includes(prefixo) && alvoEfeito) g.recurso = `${prefixo}:${alvoEfeito}`;
          if (prefixo === "condicaoNoAtacante") { g.recurso = "condicaoNoAtacante"; g.efeitoUuid = alvoEfeito; }
        }
        if (g.recurso === "consumirAcumuloProprio") {
          if (item.type !== "condicao") continue;
          let n = 1;
          try { n = Math.max(1, Math.round((await new Roll(String(g.quantidade || "1")).evaluate()).total)); } catch (err) { n = 1; }
          const antes = item.system.acumulos ?? 1;
          const depois = Math.max(0, antes - n);
          if (depois <= 0) await item.delete(); else await item.update({ "system.acumulos": depois });
          concedeuAlgo = true;
          linhasCard.push({ label: "Acúmulos", value: depois > 0 ? `${antes} → ${depois}` : `${antes} → 0 (encerrada)` });
          continue;
        }
        if (g.recurso === "condicaoEmQuemRecebeu") {
          const recebedorDoc = (contexto.paraUuid || contexto.alvoUuid) ? await fromUuid(contexto.paraUuid || contexto.alvoUuid).catch(() => null) : null;
          const recebedor = recebedorDoc?.actor ?? recebedorDoc;
          if (!recebedor || !g.efeitoUuid) continue;
          let acumulos = 1;
          try { acumulos = Math.max(1, Math.round((await new Roll(String(g.quantidade || "1").replace(/@rank\b/gi, String(item.system.rankAtual ?? 0))).evaluate()).total)); } catch (err) { acumulos = 1; }
          const conjTok = candidato.getActiveTokens?.(true)?.[0]?.document?.uuid ?? candidato.uuid;
          const executor = NaurenAlvoHelper.usuarioExecutor(recebedor);
          let nome = null;
          const rankHerdado = item.system.rankAtual ?? 0;
          if (executor?.id === game.user.id) nome = await NaurenAlvoHelper.aplicarCondicao(recebedor, g.efeitoUuid, acumulos, null, rankHerdado, 0, "", "1", "", conjTok);
          else if (executor) nome = await executor.query(NAUREN_QUERY_APLICAR_CONDICAO, { actorUuid: recebedor.uuid, uuid: g.efeitoUuid, acumulos, conjuradorUuid: conjTok, rank: rankHerdado }, { timeout: 20000 }).catch(() => null);
          if (nome) { concedeuAlgo = true; linhasCard.push({ label: `Em ${recebedor.name}`, value: nome, breakdown: acumulos > 1 ? `${acumulos} acúmulos` : "" }); }
          continue;
        }
        if (g.recurso === "virarPaginaGratis") {
          const esc = await foundry.applications.api.DialogV2.wait({ window: { title: item.name }, content: `<p>${item.name}: virar a página do Grimório (sem custo)?</p>`,
            buttons: naurenBotoesDirecaoGrimorio(candidato, "", [{ action: "0", label: "Não" }]), rejectClose: false }).catch(() => "0");
          if (Number(esc)) { const r = await naurenMoverGrimorio(candidato, Number(esc) * naurenGrimorio(candidato).janela); concedeuAlgo = true; linhasCard.push({ label: "Grimório", value: r.texto, breakdown: r.nomes }); }
          continue;
        }
        if (g.recurso === "copiarCondicaoRecebida") {
          // 0.94.3 (Doutor da Peste): alguém perto recebeu uma Condição negativa; pague e aplique 1 acúmulo dela em outro inimigo.
          const tokEu = candidato.getActiveTokens?.(true)?.[0];
          const condC = contexto.condicaoUuid ? await fromUuid(contexto.condicaoUuid).catch(() => null) : null;
          if (!tokEu || !condC || condC.type !== "condicao" || !naurenCondicaoNegativa(condC)) continue;
          const raioC = Number(g.alvoInimigoAteMetros) || Number(g.alcance) || 3;
          const opcoesC = (canvas?.tokens?.placeables ?? []).filter(t => t.actor && t !== tokEu && t.actor.uuid !== contexto.alvoUuid && t.document.disposition !== tokEu.document.disposition
            && !t.actor.getFlag?.("nauren", "entidade")?.ativa && (() => { try { return naurenMedirDistanciaBordas(tokEu, t) <= raioC + 0.01; } catch (err) { return false; } })());
          if (!opcoesC.length) continue;
          const specP = g.pagarRecurso ? (g.pagarRecurso === "estamina" ? "estaminaCombate" : g.pagarRecurso) : "";
          const qtdP = specP ? Math.max(0, Math.round(Number(g.pagarQuantidade) || 1)) : 0;
          const recP = specP ? naurenRecursoDoAtor(candidato, specP) : null;
          if (specP && (recP?.valor ?? 0) < qtdP) continue;
          const nomeQuem = (() => { try { const d = fromUuidSync(contexto.alvoUuid); return (d?.actor ?? d)?.name ?? "um inimigo"; } catch (err) { return "um inimigo"; } })();
          const escC = await foundry.applications.api.DialogV2.wait({ window: { title: item.name },
            content: `<p><b>${nomeQuem}</b> recebeu <b>${condC.name}</b> a até ${raioC} m de você.</p><p>${specP ? `Gastar <b>${qtdP} ${recP?.nome ?? specP}</b> (você tem ${recP?.valor ?? 0}) para a` : "A"}plicar 1 acúmulo em outro inimigo?</p>`,
            buttons: [...opcoesC.map(t => ({ action: t.id, label: t.document.name })), { action: "nenhum", label: "Não", default: true }], rejectClose: false }).catch(() => "nenhum");
          const tokC = opcoesC.find(t => t.id === escC);
          if (!tokC) continue;
          if (specP && qtdP) await naurenConcederRecurso(candidato, specP, String(-qtdP), item);
          const exC = NaurenAlvoHelper.usuarioExecutor(tokC.actor);
          const conjC = tokEu.document.uuid;
          const nomeC2 = exC?.id === game.user.id ? await NaurenAlvoHelper.aplicarCondicao(tokC.actor, contexto.condicaoUuid, 1, null, 0, 0, "", "1", "", conjC)
            : await exC?.query(NAUREN_QUERY_APLICAR_CONDICAO, { actorUuid: tokC.actor.uuid, uuid: contexto.condicaoUuid, acumulos: 1, conjuradorUuid: conjC }, { timeout: 20000 }).catch(() => null);
          if (nomeC2) { concedeuAlgo = true; linhasCard.push({ label: `Em ${tokC.document.name}`, value: nomeC2, breakdown: `copiada de ${nomeQuem}${specP ? ` · −${qtdP} ${recP?.nome ?? specP}` : ""}` }); }
          continue;
        }
        if (g.recurso === "condicaoEmAliadoEscolhido") {
          const tokEu = candidato.getActiveTokens?.(true)?.[0];
          const aliados = (canvas?.tokens?.placeables ?? []).filter(t => t.actor && t !== tokEu && t.document.disposition === tokEu?.document?.disposition);
          if (!aliados.length || !g.efeitoUuid) continue;
          const nomeEfA = (() => { try { return fromUuidSync(g.efeitoUuid)?.name ?? "o efeito"; } catch (err) { return "o efeito"; } })();
          const esc = await foundry.applications.api.DialogV2.wait({ window: { title: item.name }, content: `<p><b>${item.name}</b>: qual aliado recebe <b>${nomeEfA}</b>?</p>`,
            buttons: [...aliados.map(t => ({ action: t.id, label: t.document.name })), { action: "nenhum", label: "Nenhum" }], rejectClose: false }).catch(() => "nenhum");
          const tokA = aliados.find(t => t.id === esc);
          if (!tokA) continue;
          const exA = NaurenAlvoHelper.usuarioExecutor(tokA.actor);
          const nomeA = exA?.id === game.user.id ? await NaurenAlvoHelper.aplicarCondicao(tokA.actor, g.efeitoUuid, 1, null, item.system.rankAtual ?? 0) : await exA?.query(NAUREN_QUERY_APLICAR_CONDICAO, { actorUuid: tokA.actor.uuid, uuid: g.efeitoUuid, acumulos: 1, rank: item.system.rankAtual ?? 0 }, { timeout: 20000 }).catch(() => null);
          if (nomeA) { concedeuAlgo = true; linhasCard.push({ label: `Em ${tokA.document.name}`, value: nomeA }); }
          continue;
        }
        if (g.recurso === "escolherAcaoDesteItem") {
          // Escolher UMA das Ações deste item (ex.: Canonização: 1 dos 3 Milagres ao se santificar).
          const declarados = (item.system.recursosDeclarados ?? []).map(r => r.id);
          if (tipoEvento === "entrouOuEvoluiuProfusao" && declarados.length && !declarados.includes(contexto.recursoId)) continue;
          const listaE = (item.system.acoes ?? []).map((a, i) => ({ a, i })).filter(x => x.a?.nome);
          if (!listaE.length) continue;
          for (const emCursoAntes of [atorEvento?.sheet?._acaoEmCurso, candidato.sheet?._acaoEmCurso]) {
            if (emCursoAntes) await Promise.race([emCursoAntes.catch(() => {}), new Promise(r => setTimeout(r, 30000))]);
          }
          const escA = await foundry.applications.api.DialogV2.wait({ window: { title: item.name },
            content: `<p><b>${item.name}</b>: escolha uma.</p>`,
            buttons: [...listaE.map(x => ({ action: String(x.i), label: x.a.nome })), { action: "nao", label: "Agora não" }], rejectClose: false }).catch(() => "nao");
          if (escA !== "nao" && escA !== null && listaE.some(x => String(x.i) === escA)) {
            try { await candidato.sheet._executarAcao(item, Number(escA)); } catch (err) { console.warn("Nauren RPG | Falha ao usar a Ação escolhida.", err); }
            concedeuAlgo = true; linhasCard.push({ label: item.name, value: listaE.find(x => String(x.i) === escA)?.a.nome ?? "" });
          }
          continue;
        }
        // Esquiva Galante: depois de esquivar, oferece atacar quem atacou com a arma equipada, sem custo
        // (a Condição de próxima ação já aplicada pelo gatilho anterior paga o custo e conta os ataques).
        if (g.recurso === "atacarComArmaNoAtacante") {
          const tokAt = contexto.atacanteTokenUuid ? await fromUuid(contexto.atacanteTokenUuid).catch(() => null) : null;
          const arma = candidato.items.find(i => i.type === "arma" && i.system.equipado);
          if (!tokAt?.object || !arma) continue;
          const emCursoAt = tokAt.actor?.sheet?._acaoEmCurso;
          if (emCursoAt) await Promise.race([emCursoAt.catch(() => {}), new Promise(r => setTimeout(r, 30000))]);
          const nomeCond = String(g.condicaoContadoraNome || "");
          let feitos = 0;
          for (let volta = 0; volta < 6; volta++) {
            const cond = nomeCond ? candidato.items.find(i => i.type === "condicao" && i.system.ativo !== false && i.name.includes(nomeCond)) : null;
            if (nomeCond && !cond) break;
            if (volta > 0 && !nomeCond) break;
            const resta = cond ? Math.max(1, cond.system.acumulos ?? 1) : 1;
            const sim = await foundry.applications.api.DialogV2.confirm({ window: { title: `${item.name} — ${candidato.name}` },
              content: `<p>Você esquivou de <b>${tokAt.name}</b>. Atacar agora com <b>${arma.name}</b>, sem custo?${resta > 1 ? ` (${resta} ataques disponíveis)` : ""}</p>`,
              yes: { label: "Atacar" }, no: { label: "Agora não" }, rejectClose: false }).catch(() => false);
            if (!sim) break;
            for (const t of Array.from(game.user.targets ?? [])) t.setTarget(false, { releaseOthers: false });
            tokAt.object.setTarget(true, { releaseOthers: true });
            await candidato.sheet._executarAcao(arma, 0);
            feitos++;
          }
          if (feitos) { concedeuAlgo = true; linhasCard.push({ label: "Ataques", value: `${feitos} em ${tokAt.name}` }); }
          continue;
        }
        if (g.recurso === "oferecerAcaoDesteItem") {
          // Com várias Ações e um evento de Profusão, escolhe a do tipo certo (Ousada/Retraída).
          const tipoProf = contexto.recursoId === "determinacao" ? "ousad" : contexto.recursoId === "ofuscacao" ? "retra" : "";
          const listaAcoes = item.system.acoes ?? [];
          let idxOf = tipoProf ? listaAcoes.findIndex(a => String(a.nome ?? "").toLowerCase().includes(tipoProf)) : 0;
          if (idxOf < 0) idxOf = 0;
          const acaoOf = listaAcoes[idxOf];
          if (!acaoOf) continue;
          // Reações a penitência (Halo, Penitência Desesperada) só valem quando a penitência causou dano.
          if (tipoEvento === "penitenciaAceita" && !(Number(contexto.danoPenitencia) > 0)) continue;
          // Usos por cena já gastos: nem pergunta.
          if (item.system.usaUsosPassiva && (item.system.usosPassivaAtual ?? 0) <= 0) continue;
          // Só pergunta depois que a Ação que causou o evento terminou (o crítico de um aliado, a magia com penitência):
          // assim a janela não aparece no meio do ataque e a nova Ação não se mistura com ela.
          for (const emCursoAntes of [atorEvento?.sheet?._acaoEmCurso, candidato.sheet?._acaoEmCurso]) {
            if (emCursoAntes) await Promise.race([emCursoAntes.catch(() => {}), new Promise(r => setTimeout(r, 30000))]);
          }
          // Sem alvo no evento (ex.: "sofri dano", "minha Vida chegou a 0"): mira quem atacou, nunca a própria criatura.
          const uuidAlvoOf = contexto.alvoUuid || contexto.atacanteTokenUuid || "";
          let tokAlvoOf = uuidAlvoOf ? await fromUuid(uuidAlvoOf).catch(() => null) : null;
          if (tokAlvoOf?.documentName === "Actor") tokAlvoOf = tokAlvoOf.getActiveTokens?.(true, true)?.[0] ?? null;
          if (tokAlvoOf && (tokAlvoOf.actor ?? tokAlvoOf) === candidato) tokAlvoOf = null;
          const porque = { penitenciaAceita: `sua penitência causou ${contexto.danoPenitencia} de dano`, euAcerteiCritico: "você acertou um crítico", aliadoAcertouCritico: `${atorEvento?.name ?? "um aliado"} acertou um crítico` }[tipoEvento] ?? "";
          const usar = await foundry.applications.api.DialogV2.confirm({ window: { title: item.name },
            content: `<p>${porque ? `${porque.charAt(0).toUpperCase()}${porque.slice(1)}${tokAlvoOf ? ` em <b>${tokAlvoOf.name}</b>` : ""}. ` : ""}Usar <b>${acaoOf.nome || item.name}</b> agora?</p>`, yes: { label: "Usar" }, no: { label: "Agora não" }, rejectClose: false }).catch(() => false);
          if (usar) {
            if (acaoOf.modoAlvo === "selecionado") {
              const meuTok = candidato.getActiveTokens?.(true)?.[0];
              if (tokAlvoOf?.object) {
                for (const t of Array.from(game.user.targets ?? [])) t.setTarget(false, { releaseOthers: false });
                tokAlvoOf.object.setTarget(true, { releaseOthers: true });
              } else if (meuTok && game.user.targets?.has?.(meuTok)) meuTok.setTarget(false, { releaseOthers: false }); // nunca em si mesma por engano
            }
            candidato._naurenContextoGatilho = { danoPenitencia: Number(contexto.danoPenitencia) || 0 };
            try { await candidato.sheet._executarAcao(item, idxOf); } finally { candidato._naurenContextoGatilho = null; }
            usosPassivaGastar = 0; // a própria Ação já gastou o uso
            concedeuAlgo = true; linhasCard.push({ label: item.name, value: "usada" });
          }
          continue;
        }
        if (g.recurso === "escolherCondicaoEmMim") {
          const opcoes = [];
          for (const u of g.opcoesUuids ?? []) { try { const d = await fromUuid(u); if (d) opcoes.push({ action: u, label: d.name }); } catch (err) { /* ignora */ } }
          if (!opcoes.length) continue;
          const esc = await foundry.applications.api.DialogV2.wait({ window: { title: item.name }, content: `<p>${item.name}: escolha um.</p>`, buttons: opcoes, rejectClose: false }).catch(() => null);
          if (!esc) continue;
          const nome = await NaurenAlvoHelper.aplicarCondicao(candidato, esc, 1).catch(() => null);
          if (nome) { concedeuAlgo = true; linhasCard.push({ label: "Escolheu", value: nome }); }
          continue;
        }
        if (g.recurso === "removerCondicaoRecebida" || g.recurso === "transferirCondicaoRecebida") {
          const condRec = (contexto.condicaoItemId && candidato.items.get(contexto.condicaoItemId))
            || candidato.items.find(i => i.type === "condicao" && i.system.ativo !== false && (i.getFlag("nauren", "cadeiaRaizUuid") === contexto.condicaoUuid || i.getFlag("nauren", "origemUuid") === contexto.condicaoUuid || i.name === contexto.condicaoNome));
          if (!condRec || String(condRec.system.negativa ?? "sim") === "nao") continue; // buffs não são "aflição"
          const custoEst = Math.max(0, Math.round(Number(g.pagarEstamina) || 0));
          if (custoEst > 0 && (candidato.system.estaminaCombate?.value ?? 0) < custoEst) continue;
          const transferir = g.recurso === "transferirCondicaoRecebida";
          let tokDestino = null;
          if (transferir) {
            const tokEu = candidato.getActiveTokens?.(true)?.[0];
            const raioT = parseFloat(g.alcance) || 0;
            const aliados = (canvas?.tokens?.placeables ?? []).filter(t => t.actor && t !== tokEu && t.document.disposition === tokEu?.document?.disposition
              && (!raioT || !tokEu || naurenMedirDistanciaBordas(tokEu, t) <= raioT)
              && !t.actor.items.some(i => i.type === "condicao" && i.system.ativo !== false && (i.getFlag("nauren", "cadeiaRaizUuid") === contexto.condicaoUuid || i.name === condRec.name)));
            if (!aliados.length) continue;
            const esc = await foundry.applications.api.DialogV2.wait({ window: { title: item.name }, content: `<p>${item.name}: passar <b>${condRec.name}</b> para qual aliado${custoEst ? ` (${custoEst} Estamina)` : ""}?</p>`,
              buttons: [...aliados.map(t => ({ action: t.id, label: t.document.name })), { action: "nenhum", label: "Não passar" }], rejectClose: false }).catch(() => "nenhum");
            tokDestino = aliados.find(t => t.id === esc); if (!tokDestino) continue;
          } else if (g.perguntarPagarEstresse) {
            const est = candidato.system.stress?.value ?? 0, estMax = candidato.system.stress?.max ?? 2;
            if (est >= estMax) continue;
            const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: item.name }, content: `<p>${item.name}: anular <b>${condRec.name}</b> pagando 1 Estresse?</p>`, yes: { label: "Pagar 1 Estresse" }, no: { label: "Não" }, rejectClose: false }).catch(() => false);
            if (!ok) continue;
            await candidato.update({ "system.stress.value": est + 1 });
            linhasCard.push({ label: "Estresse", value: "+1", breakdown: "pago para recusar" });
          }
          if (custoEst > 0) { await candidato.update({ "system.estaminaCombate.value": Math.max(0, (candidato.system.estaminaCombate?.value ?? 0) - custoEst) }); linhasCard.push({ label: "Estamina", value: `−${custoEst}` }); }
          const qTxt = String(g.quantidade ?? "1").trim().toLowerCase();
          const acumAtual = condRec.system.acumulativel ? (condRec.system.acumulos ?? 1) : 1;
          const tirar = (qTxt === "todos" || qTxt === "tudo" || !condRec.system.acumulativel) ? acumAtual : Math.max(1, Math.min(acumAtual, Math.round(Number(qTxt) || Number(contexto.acumulosRecebidos) || 1)));
          if (transferir) {
            const raizT = condRec.getFlag("nauren", "cadeiaRaizUuid") || condRec.getFlag("nauren", "origemUuid") || contexto.condicaoUuid;
            const exA = NaurenAlvoHelper.usuarioExecutor(tokDestino.actor);
            const nomeA = exA?.id === game.user.id ? await NaurenAlvoHelper.aplicarCondicao(tokDestino.actor, raizT, acumAtual) : await exA?.query(NAUREN_QUERY_APLICAR_CONDICAO, { actorUuid: tokDestino.actor.uuid, uuid: raizT, acumulos: acumAtual }, { timeout: 20000 }).catch(() => null);
            if (!nomeA) continue;
            await condRec.delete().catch(() => {});
            concedeuAlgo = true; linhasCard.push({ label: `Passou para ${tokDestino.document.name}`, value: condRec.name, breakdown: acumAtual > 1 ? `${acumAtual} acúmulos` : "" });
          } else {
            if (tirar >= acumAtual) await condRec.delete().catch(() => {}); else await condRec.update({ "system.acumulos": acumAtual - tirar });
            concedeuAlgo = true; linhasCard.push({ label: tirar >= acumAtual ? "Anulou" : `Descartou ${tirar} acúmulo(s) de`, value: condRec.name });
          }
          continue;
        }
        if (g.recurso === "removerCondicaoEscolhida") {
          // Só Condições negativas: remover um benefício próprio (ex.: Facilidade no próximo ataque) não faz sentido.
          const minhas = candidato.items.filter(i => i.type === "condicao" && i.system.ativo !== false && naurenCondicaoNegativa(i));
          if (!minhas.length) continue;
          const esc = await foundry.applications.api.DialogV2.wait({ window: { title: item.name }, content: `<p>${item.name}: remover qual Condição (sem gastar Estamina)?</p>`,
            buttons: [...minhas.map(i => ({ action: i.id, label: i.system.acumulativel && (i.system.acumulos ?? 1) > 1 ? `${i.name} (1 de ${i.system.acumulos})` : i.name })), { action: "nenhuma", label: "Nenhuma" }], rejectClose: false }).catch(() => "nenhuma");
          const alvoCond = candidato.items.get(esc);
          if (!alvoCond) continue;
          if (alvoCond.system.acumulativel && (alvoCond.system.acumulos ?? 1) > 1) await alvoCond.update({ "system.acumulos": alvoCond.system.acumulos - 1 });
          else await alvoCond.delete();
          concedeuAlgo = true; linhasCard.push({ label: "Removeu", value: alvoCond.name });
          continue;
        }
        if (g.recurso === "prioridadeParaMascotes") {
          const mascotes = Array.from(game.actors).filter(a => a.system?.mascoteDeUuid === candidato.uuid);
          if (!mascotes.length) continue;
          await naurenOperarRegistroPrioridade("registrar", { entradas: mascotes.map(m => ({ deUuid: candidato.uuid, deNome: candidato.name, paraUuid: m.uuid, paraNome: m.name, indicador: "PA", motivo: item.name, item: item.name })) });
          concedeuAlgo = true; linhasCard.push({ label: "Prioridade para", value: mascotes.map(m => m.name).join(", ") });
          continue;
        }
        if (g.recurso === "roubarDestino") {
          const vDoc = (contexto.vitimaUuid || contexto.alvoUuid) ? await fromUuid(contexto.vitimaUuid || contexto.alvoUuid).catch(() => null) : null;
          const v = vDoc?.actor ?? vDoc;
          if (!v) continue;
          let q = 1;
          try { q = Math.max(1, Math.round((await new Roll(String(g.quantidade || "1").replace(/@rank\b/gi, String(item.system.rankAtual ?? 0))).evaluate()).total)); } catch (err) { q = 1; }
          const tira = Math.min(q, v.system.dadosDestino?.value ?? 0);
          if (tira <= 0) { linhasCard.push({ label: "Roubar Destino", value: `${v.name} não tem Dados de Destino` }); concedeuAlgo = true; continue; }
          await naurenOperarRecursoViaMestre(v, "dadosDestino", (v.system.dadosDestino?.value ?? 0) - tira);
          const meus = candidato.system.dadosDestino?.value ?? 0;
          const maxMeus = candidato.system.dadosDestino?.max ?? 99;
          await candidato.update({ "system.dadosDestino.value": Math.min(maxMeus, meus + tira) });
          concedeuAlgo = true;
          const ganhouD = Math.max(0, Math.min(maxMeus, meus + tira) - meus);
          linhasCard.push({ label: "Roubou Dado de Destino", value: `${tira} de ${v.name}`,
            breakdown: ganhouD < tira ? `você já estava no máximo (${maxMeus}): ganhou ${ganhouD}, mas ${v.name} perdeu ${tira}` : `você: ${meus} → ${meus + ganhouD}` });
          continue;
        }
        if (g.recurso === "roubarEstamina") {
          const vitimaDoc = (contexto.vitimaUuid || contexto.alvoUuid) ? await fromUuid(contexto.vitimaUuid || contexto.alvoUuid).catch(() => null) : null;
          const vitima = vitimaDoc?.actor ?? vitimaDoc;
          if (!vitima) continue;
          let q = 1;
          try { q = Math.max(1, Math.round((await new Roll(String(g.quantidade || "1").replace(/@rank\b/gi, String(item.system.rankAtual ?? 0))).evaluate()).total)); } catch (err) { q = 1; }
          const daVitima = Math.min(q, vitima.system.estaminaCombate?.value ?? 0);
          if (daVitima <= 0) { linhasCard.push({ label: "Roubar Estamina", value: `${vitima.name} não tem Estamina` }); concedeuAlgo = true; continue; }
          await naurenOperarRecursoViaMestre(vitima, "estaminaCombate", (vitima.system.estaminaCombate?.value ?? 0) - daVitima);
          const minha = candidato.system.estaminaCombate?.value ?? 0;
          const maxMinha = candidato.system.estaminaCombate?.max ?? 99;
          await candidato.update({ "system.estaminaCombate.value": Math.min(maxMinha, minha + daVitima) });
          concedeuAlgo = true;
          const ganhouE = Math.max(0, Math.min(maxMinha, minha + daVitima) - minha);
          linhasCard.push({ label: "Roubou Estamina", value: `${daVitima} de ${vitima.name}`,
            breakdown: ganhouE < daVitima ? `você ganhou ${ganhouE} (máximo ${maxMinha})` : `você: ${minha} → ${minha + ganhouE}` });
          continue;
        }
        if (g.recurso === "moverEscolhendo") {
          let metros = 1;
          try { metros = Math.max(0, (await new Roll(String(g.quantidade || "1").replace(/@rank\b/gi, String(item.system.rankAtual ?? 0))).evaluate()).total); } catch (err) { metros = 1; }
          const tok = candidato.getActiveTokens?.(true)?.[0];
          if (!tok || !metros) continue;
          const escolha = await naurenEscolherPontoNoMapa({ nome: item.name, largura: tok.document.width, altura: tok.document.height, origem: tok.center, alcanceMetros: metros,
            validar: c => {
              try { if (CONFIG.Canvas.polygonBackends?.move?.testCollision?.(tok.center, c, { type: "move", mode: "any" })) return "há uma parede no caminho."; } catch (err) { /* sem checagem */ }
              return canvas.tokens.placeables.some(t => t !== tok && Math.hypot(t.center.x - c.x, t.center.y - c.y) < canvas.grid.size * 0.5) ? "a casa está ocupada." : "";
            },
            textoAjuda: `${item.name}: clique para onde você se move (até ${metros}m). Esc: não mover.` });
          if (escolha) { await naurenMoverTokenPara(tok.document, escolha); concedeuAlgo = true; linhasCard.push({ label: "Moveu", value: `até ${metros}m` }); }
          continue;
        }
        // 0.94.1: conta o evento e, a cada N, devolve 1 uso da 1ª Ação com usos deste item (ex.: Bobina, 5 ataques).
        if (g.recurso === "recuperarUsoACada") {
          const nEv = Math.max(1, Number(g.quantidade) || 1);
          const acoesR = foundry.utils.deepClone(item.system.acoes ?? []);
          const iR = acoesR.findIndex(a => a.usaUsos);
          const aR = acoesR[iR];
          if (!aR) continue;
          const maxR = naurenResolverPorNivel(aR.usosMaxPorNivel, candidato.system?.nivel || 1, "valor") ?? aR.usosMax ?? 0;
          if ((aR.usosAtual ?? 0) >= maxR) { await item.setFlag("nauren", "contadorRecuperar", 0).catch(() => {}); continue; } // cheio: não conta
          const cont = (item.getFlag("nauren", "contadorRecuperar") ?? 0) + 1;
          if (cont >= nEv) {
            aR.usosAtual = Math.min(maxR, (aR.usosAtual ?? 0) + 1);
            await item.update({ "system.acoes": acoesR, "flags.nauren.contadorRecuperar": 0 });
            concedeuAlgo = true; linhasCard.push({ label: `${aR.nome || item.name}`, value: "+1 uso", breakdown: `${nEv} de ${nEv} — voltou` });
          } else await item.setFlag("nauren", "contadorRecuperar", cont).catch(() => {});
          continue;
        }
        if (g.recurso === "recuperarUsoEscolhido") {
          const opcoes = [];
          for (const it of candidato.items) {
            if (it.type !== "habilidade") continue;
            if (it.system.usaUsosPassiva && (it.system.usosPassivaAtual ?? 0) < (it.system.usosPassivaMax ?? 0)) opcoes.push({ id: `${it.id}|p`, label: `${it.name} (${it.system.usosPassivaAtual}/${it.system.usosPassivaMax})` });
            (it.system.acoes ?? []).forEach((a, i) => { if (a.usaUsos && (a.usosAtual ?? 0) < (a.usosMax ?? 0)) opcoes.push({ id: `${it.id}|${i}`, label: `${it.name} — ${a.nome} (${a.usosAtual}/${a.usosMax})` }); });
          }
          if (!opcoes.length) { linhasCard.push({ label: item.name, value: "nenhuma habilidade com uso gasto" }); concedeuAlgo = true; continue; }
          const escolha = await foundry.applications.api.DialogV2.wait({ window: { title: item.name }, content: "<p>Qual habilidade recupera 1 uso?</p>", buttons: [...opcoes.map(o => ({ action: o.id, label: o.label })), { action: "nenhuma", label: "Nenhuma" }], rejectClose: false }).catch(() => "nenhuma");
          if (escolha && escolha !== "nenhuma") {
            const [itId, alvoIdx] = escolha.split("|");
            const it = candidato.items.get(itId);
            if (alvoIdx === "p") await it.update({ "system.usosPassivaAtual": Math.min(it.system.usosPassivaMax ?? 99, (it.system.usosPassivaAtual ?? 0) + 1) });
            else { const acoes = foundry.utils.deepClone(it.system.acoes); acoes[Number(alvoIdx)].usosAtual = Math.min(acoes[Number(alvoIdx)].usosMax ?? 99, (acoes[Number(alvoIdx)].usosAtual ?? 0) + 1); await it.update({ "system.acoes": acoes }); }
            concedeuAlgo = true; linhasCard.push({ label: "Recuperou 1 uso", value: it.name });
          }
          continue;
        }
        if (g.recurso === "condicaoNoAtacante") {
          const atacanteToken = contexto.atacanteTokenUuid ? await fromUuid(contexto.atacanteTokenUuid).catch(() => null) : null;
          const atacanteActor = atacanteToken?.actor ?? atacanteToken;
          if (!atacanteActor || !g.efeitoUuid) continue;
          let acumulos = 1;
          try { acumulos = Math.max(1, Math.round((await new Roll(String(g.quantidade || "1").replace(/@rank\b/gi, String(item.system.rankAtual ?? 0))).evaluate()).total)); } catch (err) { acumulos = 1; }
          const executor = NaurenAlvoHelper.usuarioExecutor(atacanteActor);
          let nome = null;
          if (executor?.id === game.user.id) nome = await NaurenAlvoHelper.aplicarCondicao(atacanteActor, g.efeitoUuid, acumulos);
          else if (executor) nome = await executor.query(NAUREN_QUERY_APLICAR_CONDICAO, { actorUuid: atacanteActor.uuid, uuid: g.efeitoUuid, acumulos }, { timeout: 20000 }).catch(() => null);
          if (nome) {
            concedeuAlgo = true;
            linhasCard.push({ label: `Em ${atacanteActor.name}`, value: nome, breakdown: acumulos > 1 ? `${acumulos} acúmulos` : "" });
          }
          continue;
        }
        // "danoNoAtacante": caso especial - em vez de conceder recurso pro
        // DONO da Habilidade (candidato), causa dano em quem o atacou (ex:
        // Peles de Espinhos: "o atacante sofre 1d4 de dano"). Só funciona
        // em "euSofriDano" com o UUID do atacante disponível no contexto.
        // "ataqueBasicoNoAtacante" (Ambidestria): pergunta numa janela compacta e faz o ataque básico
        // com a arma escolhida contra quem atacou, sem custo, como parte da reação. Não espera a resposta
        // (o ataque original ainda está terminando no cliente de quem atacou).
        if (g.recurso === "ataqueBasicoNoAtacante") {
          const atacanteTokenA = contexto.atacanteTokenUuid ? await fromUuid(contexto.atacanteTokenUuid).catch(() => null) : null;
          if (!atacanteTokenA?.actor) continue;
          // Sem card próprio: o card do ataque já diz "Sem custo — Ambidestria: ataque como parte do bloqueio".
          naurenAtaqueBasicoNaReacao(candidato, atacanteTokenA, item).catch(err => console.warn("Nauren RPG | ataque na reação", err));
          continue;
        }
        if (g.recurso === "danoNoAtacante") {
          const atacanteToken = contexto.atacanteTokenUuid ? await fromUuid(contexto.atacanteTokenUuid).catch(() => null) : null;
          const atacanteActor = atacanteToken?.actor ?? atacanteToken;
          if (!atacanteActor) {
            console.log(`Nauren RPG | Gatilho "${item.name}" (${tipoEvento}) "danoNoAtacante" bateu, mas não achei o token/ator do atacante no contexto.`);
            continue;
          }
          let dano = 0;
          let textoDano = "";
          try {
            const rankAtualItem = item.system.rankAtual ?? 0;
            const formula = String(g.quantidade || "0")
              .replace(/@rank\b/gi, String(rankAtualItem))
              .replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, candidato)));
            const roll = await new Roll(formula).evaluate();
            dano = roll.total;
            textoDano = `${naurenFormulaParaTexto(g.quantidade, candidato)} → ${naurenTextoRolagem(roll)}`;
          } catch (err) {
            console.warn(`Nauren RPG | Gatilho "${item.name}": fórmula de dano no atacante inválida.`, err);
            continue;
          }
          const reducao = atacanteActor.system?.reducaoDanoTotal ?? 0;
          const danoFinal = Math.max(0, NaurenAlvoHelper.aplicarReducaoPercentual(atacanteActor, dano) - reducao); await NaurenAlvoHelper.consumirAoSofrerDano(atacanteActor, dano);
          if (danoFinal > 0) {
            const { escudoConsumido, danoNaVida, escudoRestante } = NaurenAlvoHelper.calcularDanoComEscudo(atacanteActor, danoFinal);
            const vidaAtual = atacanteActor.system?.vida?.value ?? 0;
            const updatesAtacante = { "system.vida.value": Math.max(0, vidaAtual - danoNaVida) };
            if (escudoConsumido > 0) updatesAtacante["system.escudo.value"] = escudoRestante;
            await NaurenAlvoHelper.atualizarAtorSeguro(atacanteActor, updatesAtacante, { naurenOrigemCombate: true });
            concedeuAlgo = true;
            const ajustes = [];
            if (danoFinal !== dano) ajustes.push(`reduzido de ${dano}`);
            if (escudoConsumido > 0) ajustes.push(`Escudo absorveu ${escudoConsumido}`);
            linhasCard.push({ label: `Dano em ${atacanteActor.name}`, value: danoFinal, breakdown: [textoDano, ...ajustes].filter(Boolean).join(" • ") });
          }
          continue;
        }
        // "estresseNoAtacante": mesmo padrão de "danoNoAtacante", mas soma
        // Estresse em quem atacou/defletiu contra o dono desta Habilidade,
        // em vez de causar dano (ex: Aparar Mestre - "o atacante recebe 1
        // Ponto de Estresse ao ser defletido"). Funciona com QUALQUER
        // evento que preencha "contexto.atacanteTokenUuid" (hoje:
        // "euSofriDano" e "euRealizeiDeflexao").
        if (g.recurso === "estresseNoAtacante") {
          const atacanteToken = contexto.atacanteTokenUuid ? await fromUuid(contexto.atacanteTokenUuid).catch(() => null) : null;
          const atacanteActor = atacanteToken?.actor ?? atacanteToken;
          if (!atacanteActor) {
            console.log(`Nauren RPG | Gatilho "${item.name}" (${tipoEvento}) "estresseNoAtacante" bateu, mas não achei o token/ator do atacante no contexto.`);
            continue;
          }
          let quantidadeEstresse = 0;
          let textoEstresse = "";
          try {
            const rankAtualItem = item.system.rankAtual ?? 0;
            const formula = String(g.quantidade || "0")
              .replace(/@rank\b/gi, String(rankAtualItem))
              .replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, candidato)));
            const roll = await new Roll(formula).evaluate();
            quantidadeEstresse = roll.total;
            textoEstresse = `${naurenFormulaParaTexto(g.quantidade, candidato)} → ${naurenTextoRolagem(roll)}`;
          } catch (err) {
            console.warn(`Nauren RPG | Gatilho "${item.name}": fórmula de Estresse no atacante inválida.`, err);
            continue;
          }
          if (quantidadeEstresse > 0) {
            const atual = atacanteActor.system?.stress?.value ?? 0;
            const max = atacanteActor.system?.stress?.max ?? 2;
            if (atual < max) {
              await NaurenAlvoHelper.atualizarAtorSeguro(atacanteActor, { "system.stress.value": Math.min(max, atual + quantidadeEstresse) });
              concedeuAlgo = true;
              const ganhoE = Math.min(max, atual + quantidadeEstresse) - atual;
              linhasCard.push({ label: `Estresse em ${atacanteActor.name}`, value: `+${ganhoE}`, breakdown: `${textoEstresse.replace(/^@rank → /, "rank ")}${ganhoE < quantidadeEstresse ? ` • limitado pelo máximo (${max})` : ""}` });
            }
          }
          continue;
        }
        // "rolarLimiar": rola 1 dado de "rolarDadoFace" faces e avisa no
        // chat se o resultado bateu ou superou "rolarLimiarFormula"
        // (aceita "@rank" deste item) - NUNCA concede nem gasta nada
        // sozinho (ver campoGatilho) - ex: Bênção Solar, Druida - "role
        // 1d6, em um 6 conjure a magia de novo sem gastar Estamina": o
        // jogador decide manualmente se/como reconjura em seguida.
        if (g.recurso === "rolarLimiar") {
          const face = Math.max(2, Math.floor(Number(g.rolarDadoFace) || 6));
          let limiar = face;
          try {
            const rankAtualItem = item.system.rankAtual ?? 0;
            const formulaLimiar = String(g.rolarLimiarFormula || String(face))
              .replace(/@rank\b/gi, String(rankAtualItem))
              .replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, candidato)));
            limiar = (await new Roll(formulaLimiar).evaluate()).total;
          } catch (err) { /* mantém limiar = face se a fórmula falhar */ }
          let roll;
          try {
            roll = await new Roll(`1d${face}`).evaluate();
          } catch (err) {
            console.warn(`Nauren RPG | Gatilho "${item.name}": falha ao rolar 1d${face}.`, err);
            continue;
          }
          if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true).catch(() => {});
          const sucesso = roll.total >= limiar;
          concedeuAlgo = true; // sempre "consome" (ex: Usos Passivos), mesmo em falha - é o ATO de rolar que gasta, não o resultado.
          let aplicou = null;
          if (sucesso && g.efeitoUuid) aplicou = await NaurenAlvoHelper.aplicarCondicao(candidato, g.efeitoUuid, 1).catch(() => null);
          if (sucesso && g.reconjurarMesmaMagia && contexto.itemUsadoUuid && contexto.execucaoId)
            naurenReconjurarPendente.set(candidato.uuid, { execucaoId: contexto.execucaoId, itemUsadoUuid: contexto.itemUsadoUuid, alvoTokenUuid: contexto.alvoTokenUuid ?? "", fonte: item.name, condicaoNome: aplicou ?? "" });
          linhasCard.push({ label: `Rolagem (precisa ${limiar}+)`, value: roll.total, breakdown: `1d${face} → ${naurenTextoRolagem(roll)}` },
              { label: "Resultado", value: sucesso ? (aplicou ? `Sucesso: recebeu ${aplicou}` : "Sucesso: aplique o efeito descrito") : "Sem sucesso" });
          if (sucesso ? await naurenDescricaoParaChat(item) : "") descricaoCard = sucesso ? await naurenDescricaoParaChat(item) : "";
          continue;
        }
        // "condicaoEmMim:<uuid>": aplica (ou acumula) uma Condição/Efeito
        // em quem TEM esta Habilidade, em vez de conceder um recurso
        // padrão - ex: Cristal Genesis: "ao usar Crescimento, +1 Mana
        // Máxima durante o combate" reaproveita a MESMA Condição
        // acumulável que Temporada de Crescimento usa.
        if (g.recurso.startsWith("removerCondicaoEmMim:")) {
          const uuidRem = g.recurso.slice("removerCondicaoEmMim:".length).trim();
          // Aceita UUID de origem ou o NOME da Condição ("self:Caído" / "Caído") - fichas em JSON não conhecem os UUIDs do mundo.
          const nomeRem = uuidRem.startsWith("self:") ? uuidRem.slice(5).trim() : (uuidRem.includes(".") ? "" : uuidRem);
          const minhas = candidato.items.filter(i => i.type === "condicao" && (i.getFlag("core", "sourceId") === uuidRem || i.getFlag("nauren", "cadeiaRaizUuid") === uuidRem || i.getFlag("nauren", "origemUuid") === uuidRem || (nomeRem && i.name === nomeRem && i.system.ativo !== false)));
          if (minhas.length) {
            await candidato.deleteEmbeddedDocuments("Item", minhas.map(i => i.id)).catch(() => {});
            concedeuAlgo = true;
            linhasCard.push({ label: "Encerrou", value: minhas.map(i => i.name).join(", ") });
          }
          continue;
        }
        if (g.recurso.startsWith("condicaoEmMim:")) {
          const uuidCondicao = g.recurso.slice("condicaoEmMim:".length).trim();
          if (!uuidCondicao) continue;
          let quantidadeAcumulos = 1;
          let textoAcumulos = "";
          try {
            // Bug real corrigido: "@rank" (o rank ATUAL desta Habilidade,
            // não da Condição) nunca era resolvido aqui - só no ramo
            // "danoNoAtacante" acima. Sem isso, um nó de Subclasse com
            // rankMax > 1 (ex: Circuito de Crescimento, rank 1/2/3) nunca
            // conseguia escalar quantos acúmulos concede por rank através
            // deste caminho - sempre "1", independente do rank investido.
            const rankAtualItem = item.system.rankAtual ?? 0;
            const formula = String(g.quantidade || "1")
              .replace(/@rank\b/gi, String(rankAtualItem))
              .replace(/@(\w+)/g, (m, nome) => String(naurenResolverTokenFormula(nome, candidato)));
            const rollAcumulos = await new Roll(formula).evaluate();
            let instAcum = g.umaVezPorEvento || String(g.limiteUsos ?? "").trim() ? 1 : Math.max(1, Math.min(50, Math.round(Number(contexto.instancias) || 1)));
            if (item.system.usaUsosPassiva) instAcum = Math.max(1, Math.min(instAcum, item.system.usosPassivaAtual ?? 1));
            usosPassivaGastar = Math.max(usosPassivaGastar, instAcum);
            quantidadeAcumulos = (rollAcumulos.total || 1) * instAcum;
            textoAcumulos = rollAcumulos.dice?.length ? `${naurenFormulaParaTexto(formula, candidato)} → ${naurenTextoRolagem(rollAcumulos)}`
              : /@rank\b/i.test(String(g.quantidade ?? "")) ? `pelo rank ${rankAtualItem}` : "";
          } catch (err) { /* mantém 1 se a fórmula falhar */ }
          const flagsGatilho = g.gravarAlvoNaCondicao && contexto.alvoUuid ? { alvoUuidGravado: contexto.alvoUuid } : null;
          const nomeAplicado = await NaurenAlvoHelper.aplicarCondicao(candidato, uuidCondicao, quantidadeAcumulos, null, 0, 0, "", "1", "", "", 0, false, flagsGatilho);
          if (nomeAplicado) {
            concedeuAlgo = true;
            linhasCard.push({ label: "Recebeu", value: nomeAplicado, breakdown: quantidadeAcumulos > 1 ? (/acúmulo/.test(nomeAplicado) ? textoAcumulos : `${quantidadeAcumulos} acúmulos${textoAcumulos ? ` (${textoAcumulos})` : ""}`) : "" });
            if (naurenEhItem(item, "Pintura da Harmonia")) {
              const corH = await naurenEscolherCorDaPintura(candidato, "harmonia").catch(() => "");
              if (corH) linhasCard.push({ label: "Cor", value: corH });
            }
          }
          continue;
        }
        const detalhesGanho = g.passarDoMaximo ? { passarDoMaximo: true } : {};
        // Vários danos de uma vez (ex.: Queimando com 4 acúmulos = 4 danos): aplica uma vez por instância.
        // Vários danos de uma vez: um por instância, mas limitado pelos usos (passiva com usos: no máximo os usos
        // que sobram, gastando um por dano; gatilho com limite próprio: um por disparo).
        let instancias = g.umaVezPorEvento || String(g.limiteUsos ?? "").trim() ? 1 : Math.max(1, Math.min(50, Math.round(Number(contexto.instancias) || 1)));
        if (item.system.usaUsosPassiva) instancias = Math.max(1, Math.min(instancias, item.system.usosPassivaAtual ?? 1));
        usosPassivaGastar = Math.max(usosPassivaGastar, instancias);
        let ganho = await naurenConcederRecurso(candidato, g.recurso, g.quantidade, item, detalhesGanho);
        for (let n = 1; n < instancias; n++) ganho += await naurenConcederRecurso(candidato, g.recurso, g.quantidade, item, null);
        if (instancias > 1 && detalhesGanho) detalhesGanho.breakdown = `${detalhesGanho.breakdown ?? ""} ×${instancias} (um por dano)`.trim();
        if (ganho) {
          concedeuAlgo = true;
          // "ganho" pode ser negativo (ex: "estresse" reduzindo, não
          // ganhando) - mostra o sinal certo em vez de sempre "+", que
          // ficaria "+-1 Estresse" com um valor negativo.
          const sinal = ganho > 0 ? "+" : "";
          const partes = [];
          if (detalhesGanho.formula && detalhesGanho.formula !== String(detalhesGanho.rolado)) {
            // "@rank → 3" virou "pelo rank 3"; com dado continua "1d4 → 1d4(3)".
            const fG = String(detalhesGanho.formula);
            if (/\d*d\d+/i.test(fG.replace(/@\w+/g, ""))) partes.push(`${fG.replace(/@rank\b/gi, String(item.system.rankAtual ?? 0))} → ${detalhesGanho.breakdown}`);
            else if (/^@rank$/i.test(fG.trim())) partes.push(`pelo rank ${item.system.rankAtual ?? 0}`);
            else partes.push(`${fG.replace(/@(\w+)/g, (m, nm) => naurenRotuloToken(nm, candidato))} = ${detalhesGanho.rolado ?? ganho}`);
          }
          if (detalhesGanho.curaCortada) partes.push(`cura reduzida −${detalhesGanho.curaCortada} (${detalhesGanho.curaFontes.join(", ") || "Condição"})`);
          else if (detalhesGanho.rolado !== undefined && detalhesGanho.rolado !== ganho) partes.push(`limitado pelo máximo (rolou ${detalhesGanho.rolado})`);
          linhasCard.push({ label: naurenNomeRecurso(candidato, g.recurso), value: `${sinal}${ganho}`, breakdown: partes.join(" • ") });
        } else if (detalhesGanho.curaCortada) {
          // Cura zerada por uma Condição (Putrefato): aparece no card com o motivo, nunca some em silêncio.
          concedeuAlgo = true;
          linhasCard.push({ label: naurenNomeRecurso(candidato, g.recurso), value: "+0", breakdown: `${detalhesGanho.rolado} − ${detalhesGanho.curaCortada}: cura reduzida (${detalhesGanho.curaFontes.join(", ") || "Condição"})` });
        } else {
          // diagnóstico: o gatilho BATEU, mas não concedeu nada -
          // normalmente porque o recurso já estava no máximo (nada pra
          // ganhar) ou o nome do recurso está errado/não existe.
          console.log(`Nauren RPG | Gatilho "${item.name}" (${tipoEvento}) bateu, mas não concedeu nada - "${g.recurso}" já deve estar no máximo, ou o nome do recurso não existe em ${candidato.name}.`);
        }
      } while (false);
        if (linhasCard.length > linhasAntes || (concedeuAlgo && !concedeuAntes)) await registrarUsoGatilho(g);
      }
      const modoCards = game.settings.get("nauren", "cardsDeGatilho") || "todos";
      const simples = ["vida", "mana", "estaminaCombate", "dadosDestino", "estresse", "consumirAcumuloProprio"];
      const soRecursoSimples = gatilhosBatendo.every(g => simples.includes(g.recurso) || String(g.recurso ?? "").startsWith("recursoCustom"));
      if (modoCards === "nenhum" || (modoCards === "resumido" && soRecursoSimples)) linhasCard.length = 0;
      if (linhasCard.length) {
        let quemAtacou = "";
        if (contexto.atacanteTokenUuid) {
          const docAtacante = fromUuidSync(contexto.atacanteTokenUuid);
          if (docAtacante) quemAtacou = ` • por ${naurenNomeDeToken(docAtacante)}`;
        }
        naurenPostarCard({ ator: candidato, titulo: item.name, icone: item.img, fonte: `Gatilho • ${rotuloEvento}${quemAtacou}`, linhas: linhasCard, descricao: descricaoCard });
      }
      if (concedeuAlgo && item.type !== "condicao") naurenAnimarPassiva(candidato, item);
      if (concedeuAlgo && item.system.usaUsosPassiva) {
        await item.update({ "system.usosPassivaAtual": Math.max(0, (item.system.usosPassivaAtual ?? 1) - usosPassivaGastar) });
      }
    }
  }
}

/**
 * Processa Emanações (auras persistentes): para cada Habilidade ou Efeito
 * ATIVO de "atorFonte" com "Emanação" configurada para o evento
 * "tipoEvento", encontra todos os tokens (filtrados por aliados/inimigos/
 * todos) a até o raio configurado do token de "atorFonte" e aplica o
 * efeito escolhido (dano, estresse ou perda de Estamina) em cada um. A
 * distância é sempre recalculada a partir da posição ATUAL do token da
 * fonte, então a aura acompanha o personagem automaticamente, sem
 * precisar de nenhuma área "desenhada" no mapa.
 */

/**
 * Auras de "início da rodada" que tiram Estamina (ex.: Presença em Profusão Retraída).
 * Roda no relógio do PRÓPRIO alvo, logo depois da recuperação de Estamina dele, na
 * mesma máquina - antes rodava na máquina do dono da aura e corria com a recuperação
 * (às vezes o dreno chegava antes e era apagado pela recuperação).
 */
async function naurenAurasDeEstaminaSobreMim(alvoActor) {
  if (!canvas?.ready) return;
  const tokAlvo = alvoActor.getActiveTokens?.(true)?.[0];
  if (!tokAlvo) return;
  for (const tokFonte of canvas.tokens.placeables) {
    const fonte = tokFonte.actor;
    if (!fonte || tokFonte === tokAlvo) continue;
    for (const item of fonte.items) {
      if ((item.type !== "habilidade" && item.type !== "efeito") || !item.system.ativo || !item.system.usaEmanacao) continue;
      if (item.system.emanacaoEvento !== "inicioRodada" || item.system.emanacaoEfeito !== "estamina") continue;
      if (item.system.emanacaoAtivaSePorCondicaoUuid) {
        const u = item.system.emanacaoAtivaSePorCondicaoUuid;
        if (!fonte.items.some(i => i.type === "condicao" && i.system.ativo && (i.getFlag("core", "sourceId") === u || i.getFlag("nauren", "cadeiaRaizUuid") === u))) continue;
      }
      const filtro = item.system.emanacaoDisposicao || "inimigos";
      const mesma = tokAlvo.document.disposition === tokFonte.document.disposition;
      if (filtro === "aliados" && !mesma) continue;
      if (filtro === "inimigos" && mesma) continue;
      const raio = parseFloat(naurenResolverPorRank(item.system.emanacaoRaioPorRank, item.system.rankAtual ?? 0, "valor") ?? item.system.emanacaoRaio) || 0;
      if (naurenMedirDistanciaBordas(tokFonte, tokAlvo) > raio) continue;
      let roll; try { roll = await new Roll(naurenFormulaComTokensDoAtor(item.system.emanacaoQuantidade || "0", fonte)).evaluate(); } catch (err) { continue; }
      if (!roll.total) continue;
      const atual = alvoActor.system.estaminaCombate?.value ?? 0;
      if (atual <= 0) continue;
      const novoValor = Math.max(0, atual - roll.total);
      await alvoActor.update({ "system.estaminaCombate.value": novoValor });
      naurenPostarCard({ ator: fonte, titulo: item.name, icone: item.img, fonte: "Aura (início da rodada)", linhas: [
        { label: alvoActor.name, value: `−${atual - novoValor} Estamina`, breakdown: `${naurenRollToBreakdownText(roll)} · depois da recuperação da rodada` }] });
    }
  }
}

/** 0.94.3 (G9): guarda a Vida no início de cada turno de quem tem um efeito que volta a ela (Mecanismo do Relógio). */
async function naurenGravarMemoriaVida(actor, combate = game.combat) {
  if (!actor?.items) return;
  const usa = actor.items.some(i => (i.system?.acoes ?? []).some(a => (a.efeitosEmMim ?? []).some(e => e?.tipo === "restaurarVidaMemoria")));
  if (!usa) return;
  const ant = actor.getFlag("nauren", "memoriaVida") ?? {};
  const mesmo = ant.combateId === combate?.id;
  await actor.setFlag("nauren", "memoriaVida", { combateId: combate?.id ?? "", anterior: mesmo ? ant.atual : null, rodadaAnterior: mesmo ? ant.rodada : 0, atual: actor.system.vida?.value ?? 0, rodada: combate?.round ?? 0 });
}

/**
 * 0.94.3: Emanação "quem começar o turno na área" (Perfumes do Perfumista Mestre). Roda no início do turno de
 * quem chega, olhando as Emanações dos OUTROS tokens a até o raio delas. Efeitos: condicao e dano.
 */
async function naurenProcessarEmanacoesSobre(atorAlvo) {
  if (!atorAlvo || !canvas?.ready) return;
  const meuTok = atorAlvo.getActiveTokens?.(true)?.[0];
  if (!meuTok) return;
  for (const t of canvas.tokens.placeables) {
    if (!t.actor || t === meuTok || t.actor === atorAlvo) continue;
    for (const item of t.actor.items) {
      if (!["habilidade", "efeito"].includes(item.type) || !item.system.ativo || !item.system.usaEmanacao || item.system.emanacaoEvento !== "inicioTurnoNaArea") continue;
      const disp = item.system.emanacaoDisposicao || "inimigos";
      const mesma = t.document.disposition === meuTok.document.disposition;
      if ((disp === "aliados" && !mesma) || (disp === "inimigos" && mesma)) continue;
      const raio = parseFloat(item.system.emanacaoRaio) || 0;
      let d = Infinity; try { d = naurenMedirDistanciaBordas(t, meuTok); } catch (err) { d = Infinity; }
      if (d > raio + 0.01) continue;
      const linhas = [];
      if (item.system.emanacaoEfeito === "condicao" && item.system.emanacaoCondicaoUuid) {
        const ac = Math.max(1, Math.round((await naurenInterpretarModificadorComDado(item.system.emanacaoCondicaoAcumulos || "1", t.actor))?.valor ?? 1));
        const n = await NaurenAlvoHelper.aplicarCondicao(atorAlvo, item.system.emanacaoCondicaoUuid, ac, null, 0, 0, "", "1", "", t.document.uuid);
        if (n) linhas.push({ label: "Recebeu", value: n });
      } else if (item.system.emanacaoEfeito === "dano") {
        const roll = await new Roll(naurenFormulaComTokensDoAtor(item.system.emanacaoQuantidade || "0", t.actor)).evaluate();
        const v = Math.max(0, roll.total);
        if (v) { await atorAlvo.update({ "system.vida.value": Math.max(0, (atorAlvo.system.vida?.value ?? 0) - v) }, { naurenOrigemCombate: true }); linhas.push({ label: "Dano", value: v, breakdown: naurenRollToBreakdownText(roll) }); }
      }
      if (linhas.length) await naurenPostarCard({ ator: atorAlvo, titulo: item.name, icone: item.img, fonte: `Emanação de ${t.name} (${raio} m) · começou o turno na área`, linhas }).catch(() => {});
    }
  }
}

async function naurenProcessarEmanacoes(tipoEvento, atorFonte) {
  if (!atorFonte?.isOwner || !canvas?.ready) return;
  const tokenFonte = atorFonte.getActiveTokens?.(true)?.[0] ?? null;
  if (!tokenFonte) return;

  for (const item of atorFonte.items) {
    if ((item.type !== "habilidade" && item.type !== "efeito") || !item.system.ativo || !item.system.usaEmanacao) continue;
    if (item.system.emanacaoEvento !== tipoEvento) continue;
    if (item.system.emanacaoEfeito === "nenhum") continue;
    // Tirar Estamina no início da rodada é aplicado pelo relógio de cada ALVO, logo depois
    // da recuperação dele (naurenAurasDeEstaminaSobreMim) - aqui não, para não correr com ela.
    if (tipoEvento === "inicioRodada" && item.system.emanacaoEfeito === "estamina") continue; // só o visual (Região no mapa) - sem efeito mecânico nenhum, de propósito
    // Ativação condicional (ver emanacaoAtivaSePorCondicaoUuid, ex:
    // Presença, Empíreo - o dreno de Estamina só dispara em Profusão
    // Retraída) - checa se o DONO desta Emanação tem a Condição ativa;
    // sem isso configurado (vazio), o efeito sempre dispara como sempre.
    const donoTemCondicao = uuidCond => !!uuidCond && atorFonte.items.some(i =>
      i.type === "condicao" && i.system.ativo &&
      (i.getFlag("core", "sourceId") === uuidCond || i.getFlag("nauren", "cadeiaRaizUuid") === uuidCond || i.getFlag("nauren", "seedUuid") === uuidCond));
    let condicaoEmanacaoUuid = item.system.emanacaoCondicaoUuid, acumulosEmanacaoTexto = item.system.emanacaoCondicaoAcumulos || "1";
    const variantes = (item.system.emanacaoVariantes ?? []).filter(v => v.seCondicaoUuid);
    const variante = variantes.find(v => donoTemCondicao(v.seCondicaoUuid));
    if (variante) { condicaoEmanacaoUuid = variante.condicaoUuid || condicaoEmanacaoUuid; acumulosEmanacaoTexto = variante.acumulos || acumulosEmanacaoTexto; }
    else if (item.system.emanacaoAtivaSePorCondicaoUuid) { if (!donoTemCondicao(item.system.emanacaoAtivaSePorCondicaoUuid)) continue; }
    else if (variantes.length) continue; // só variantes configuradas e o dono não tem nenhuma delas

    // Raio por Rank (ver emanacaoRaioPorRank, ex: Presença, Empíreo) -
    // usa naurenResolverPorRank (mesma função de dano/cura por rank),
    // com fallback pro raio simples se não houver override pro rank atual.
    const raioOverride = naurenResolverPorRank(item.system.emanacaoRaioPorRank, item.system.rankAtual ?? 0, "valor");
    const raio = parseFloat(raioOverride ?? item.system.emanacaoRaio) || 0;
    const disposicaoFiltro = item.system.emanacaoDisposicao || "inimigos";
    const incluiDono = disposicaoFiltro === "todosComVoce";
    const alvos = [];
    for (const t of canvas.tokens.placeables) {
      if (!t.actor) continue;
      if (t === tokenFonte && !incluiDono) continue;
      const mesmaDisposicao = t.document.disposition === tokenFonte.document.disposition;
      if (disposicaoFiltro === "aliados" && !mesmaDisposicao) continue;
      if (disposicaoFiltro === "inimigos" && mesmaDisposicao) continue;
      let distancia;
      try {
        distancia = t === tokenFonte ? 0 : naurenMedirDistanciaBordas(tokenFonte, t);
      } catch (err) {
        continue;
      }
      if (distancia > raio) continue;
      alvos.push(t.actor);
    }
    if (!alvos.length) continue;

    const ehCondicao = item.system.emanacaoEfeito === "condicao";
    if (ehCondicao && !condicaoEmanacaoUuid) continue; // sem Condição configurada - nada a fazer

    let quantidade = 0;
    // Bug real corrigido: só ".total" era guardado (um número já
    // somado) - o card final nunca mostrava o dado rolado de verdade
    // (ex: "1d4(3)"), só o resultado final, nada auditável. Mesmo bug
    // que já tinha sido corrigido pra Templates Persistentes (ver
    // naurenAplicarEfeitoTemplatePersistente) - agora corrigido aqui
    // também, com o mesmo helper (naurenRollToBreakdownText).
    let breakdownQuantidade = "";
    if (!ehCondicao) {
      try {
        const roll = await new Roll(naurenFormulaComTokensDoAtor(item.system.emanacaoQuantidade || "0", atorFonte)).evaluate();
        quantidade = roll.total;
        breakdownQuantidade = naurenRollToBreakdownText(roll);
      } catch (err) {
        continue;
      }
      if (!quantidade) continue;
    }

    // Acúmulos da Condição (pode ter dado): rolados UMA VEZ para todos os alvos da aura neste evento.
    let acumulosEmanacao = 1;
    if (ehCondicao) {
      try {
        const modAcumulos = await naurenInterpretarModificadorComDado(acumulosEmanacaoTexto, atorFonte);
        acumulosEmanacao = Math.max(1, Math.round(modAcumulos?.valor ?? 1));
      } catch (err) { acumulosEmanacao = 1; }
    }

    const nomesAfetados = [];
    for (const alvoActor of alvos) {
      let ok = false;
      if (item.system.emanacaoEfeito === "dano") {
        const vidaAtual = alvoActor.system.vida?.value ?? 0;
        const reducao = alvoActor.system.reducaoDanoTotal ?? 0;
        const danoFinal = Math.max(0, NaurenAlvoHelper.aplicarReducaoPercentual(alvoActor, quantidade) - reducao); await NaurenAlvoHelper.consumirAoSofrerDano(alvoActor, quantidade);
        if (danoFinal > 0) {
          const { escudoConsumido, danoNaVida, escudoRestante } = NaurenAlvoHelper.calcularDanoComEscudo(alvoActor, danoFinal);
          const updatesEmanacao = { "system.vida.value": Math.max(0, vidaAtual - danoNaVida) };
          if (escudoConsumido > 0) updatesEmanacao["system.escudo.value"] = escudoRestante;
          ok = await NaurenAlvoHelper.atualizarAtorSeguro(alvoActor, updatesEmanacao, { naurenOrigemCombate: true });
          if (ok) {
            // Integra com o sistema de Gatilhos por Evento: uma
            // Habilidade do alvo que reaja a "sofrer dano" também dispara
            // a partir do dano desta Emanação.
            naurenProcessarGatilhos("aliadoSofreuDano", alvoActor).catch(() => {});
            naurenProcessarGatilhos("euSofriDano", alvoActor).catch(() => {});
          }
        }
      } else if (item.system.emanacaoEfeito === "cura") {
        const vidaAtual = alvoActor.system.vida?.value ?? 0;
        const vidaMax = alvoActor.system.vida?.max ?? 0;
        if (vidaAtual < vidaMax) {
          ok = await NaurenAlvoHelper.atualizarAtorSeguro(alvoActor, { "system.vida.value": Math.min(vidaMax, vidaAtual + quantidade) }, { naurenOrigemCombate: true });
        }
      } else if (item.system.emanacaoEfeito === "estresse") {
        const atual = alvoActor.system.stress?.value ?? 0;
        const max = alvoActor.system.stress?.max ?? 2;
        if (atual < max) {
          ok = await NaurenAlvoHelper.atualizarAtorSeguro(alvoActor, { "system.stress.value": Math.min(max, atual + quantidade) });
        }
      } else if (item.system.emanacaoEfeito === "estamina") {
        const atual = alvoActor.system.estaminaCombate?.value ?? 0;
        if (atual > 0) {
          ok = await NaurenAlvoHelper.atualizarAtorSeguro(alvoActor, { "system.estaminaCombate.value": Math.max(0, atual - quantidade) });
        }
      } else if (ehCondicao) {
        const acumulos = acumulosEmanacao; // mesmo valor para todos (rolado antes do laço)
        const nomeAplicado = await NaurenAlvoHelper.aplicarCondicao(alvoActor, condicaoEmanacaoUuid, acumulos);
        ok = !!nomeAplicado;
      }
      if (ok) nomesAfetados.push(alvoActor.name);
    }

    if (nomesAfetados.length) {
      // Bug real corrigido: postava um <p> de texto solto via
      // ChatMessage.create direto, sem passar pelo template de card
      // ("roll-card.hbs" - o mesmo tema roxo/dourado usado em TODO o
      // resto do sistema) - destoava visualmente de qualquer outra
      // rolagem, e não mostrava o dado auditável (ver acima). Agora usa
      // _postRollCard (via actor.sheet), mesmo padrão já usado por
      // Templates Persistentes pro mesmo tipo de efeito periódico.
      const nomeEfeito = { dano: "Dano", estresse: "Estresse ganho", estamina: "Estamina perdida", condicao: "Condição/Efeito" }[item.system.emanacaoEfeito] ?? item.system.emanacaoEfeito;
      const secondaryLines = [];
      if (!ehCondicao) secondaryLines.push({ label: nomeEfeito, value: quantidade, breakdown: breakdownQuantidade });
      secondaryLines.push({ label: nomesAfetados.length > 1 ? "Afetados" : "Afetado", value: nomesAfetados.join(", ") });
      await atorFonte.sheet?._postRollCard?.({
        title: item.name, icon: item.img, d20Result: null, secondaryLines
      });
      // A aura agiu: toca a animação dela pelo nome (Habilidades de Monstros têm entrada própria no menu).
      naurenAnimarPassiva(atorFonte, item);
    }
  }
}

/**
 * Aplica o efeito configurado de um Template Persistente em UM alvo -
 * fatorado à parte porque tanto o tick periódico
 * (naurenProcessarTemplatesPersistentes) quanto o gatilho de "entrou na
 * área" (ver Hooks.on("updateToken",...) mais abaixo) precisam do mesmo
 * comportamento. Diferente da Emanação, o efeito NUMÉRICO (dano/estresse/
 * estamina) e a Condição não são exclusivos entre si - um Template pode
 * ter os dois configurados ao mesmo tempo (ex: Armadilha de Caça: 1d6 de
 * dano E fica Preso, tudo de uma vez).
 */
/**
 * Condição de Presença (ver templatePersistenteCondicaoPresencaUuid) -
 * aplica ou remove a Condição configurada num alvo em relação a UMA
 * região específica, sem depender do motor de rodada/turno (é
 * gerenciada só por "está dentro" ou "não está"). Rastreia quais
 * regiões concedem esta MESMA condição a este alvo via
 * "flags.nauren.regioesPresenca" (array de ids de Região) - assim,
 * duas áreas sobrepostas dando a mesma Condição coexistem
 * corretamente: ela só é removida de fato quando o alvo sai da
 * ÚLTIMA área que ainda a concede, não da primeira.
 * "deveEstarDentro": true = garante que a Condição existe e está
 * marcada com esta região; false = desmarca esta região, removendo a
 * Condição só se nenhuma outra região ainda a concede.
 */
const NAUREN_QUERY_PRESENCA = "nauren.condicaoPresenca";
async function naurenHandleQueryPresenca({ actorUuid, regiaoId, condicaoUuid, deveEstarDentro }) {
  const a = await fromUuid(actorUuid).catch(() => null);
  await naurenAtualizarCondicaoPresenca(a?.actor ?? a, regiaoId, condicaoUuid, deveEstarDentro);
  return true;
}
async function naurenAtualizarCondicaoPresenca(actor, regiaoId, condicaoUuid, deveEstarDentro) {
  if (!condicaoUuid || !actor) return;
  // Personagem de outro dono (ex.: o jogador põe Terra Mágica em cima de um monstro): o Mestre aplica.
  if (!actor.isOwner) {
    const gm = game.users.activeGM;
    if (gm && gm !== game.user) await gm.query(NAUREN_QUERY_PRESENCA, { actorUuid: actor.uuid, regiaoId, condicaoUuid, deveEstarDentro }, { timeout: 20000 }).catch(() => null);
    return;
  }
  const existente = actor.items.find(i =>
    i.type === "condicao" && i.getFlag("nauren", "condicaoDePresenca") &&
    (i.getFlag("nauren", "cadeiaRaizUuid") === condicaoUuid || i.getFlag("core", "sourceId") === condicaoUuid)
  );
  if (deveEstarDentro) {
    if (existente) {
      const regioes = existente.getFlag("nauren", "regioesPresenca") ?? [];
      if (!regioes.includes(regiaoId)) await existente.setFlag("nauren", "regioesPresenca", [...regioes, regiaoId]);
      return;
    }
    const origem = await fromUuid(condicaoUuid).catch(() => null);
    if (!origem) return;
    const dados = origem.toObject();
    delete dados._id;
    foundry.utils.setProperty(dados, "flags.core.sourceId", condicaoUuid);
    foundry.utils.setProperty(dados, "flags.nauren.origemUuid", condicaoUuid);
    foundry.utils.setProperty(dados, "flags.nauren.cadeiaRaizUuid", condicaoUuid);
    // Marca especial que diferencia esta instância de uma Condição
    // Aplicada normal (evolução/acúmulos/duração automática não se
    // aplicam aqui - a Presença em si É a duração) - naurenAplicarCondicao
    // e o resto do sistema nunca criam nem esperam ver esta flag.
    foundry.utils.setProperty(dados, "flags.nauren.condicaoDePresenca", true);
    foundry.utils.setProperty(dados, "flags.nauren.regioesPresenca", [regiaoId]);
    foundry.utils.setProperty(dados, "system.ativo", true);
    foundry.utils.setProperty(dados, "system.acumulos", 1);
    foundry.utils.setProperty(dados, "system.duracaoRestante", 0);
    await actor.createEmbeddedDocuments("Item", [dados]);
  } else {
    if (!existente) return;
    const regioes = existente.getFlag("nauren", "regioesPresenca") ?? [];
    const restantes = regioes.filter(id => id !== regiaoId);
    if (restantes.length) await existente.setFlag("nauren", "regioesPresenca", restantes);
    else await existente.delete();
  }
}

/**
 * true se "ponto" ({x, y}, já o CENTRO do token - não seu canto)
 * está fisicamente dentro dos limites de "regiao" agora - mesmo
 * mecanismo (shape.testPoint) usado em todo o resto do sistema pra
 * "está dentro da área" (ver _tokensNaRegiao, updateToken de
 * armadilhas etc), extraído aqui pra reutilizar sem duplicar a
 * lógica de shapes/testPoint. Recebe o ponto já calculado (em vez de
 * um tokenDoc) porque o caller pode precisar do ponto de DESTINO de
 * um movimento em andamento, que "tokenDoc.x/y" nem sempre reflete
 * ainda no momento exato do hook.
 */
function naurenPontoDentroDaRegiao(ponto, regiao, tokenDoc = null) {
  const shapes = regiao.shapes ?? [];
  if (!shapes.length || !shapes.every(s => typeof s.testPoint === "function")) return false;
  return naurenCelulasNaArea(ponto, shapes, tokenDoc, regiao);
}
/**
 * Quadrados do grid que a Região cobre: os mesmos que o Foundry destaca embaixo da forma
 * (Region#_getCoveredGridSpaceOffsets, V14, com "highlightMode: coverage"). Devolve um Set
 * de "i,j", ou null quando não dá para saber (grid sem quadrados, Região ainda sem desenho).
 */
function naurenCelulasCobertas(regiao) {
  if (!regiao || canvas.grid?.isGridless) return null;
  const obj = regiao.object ?? canvas.regions?.get?.(regiao.id) ?? null;
  try {
    const offs = obj?._getCoveredGridSpaceOffsets?.();
    if (Array.isArray(offs) && offs.length) return new Set(offs.map(o => `${o.i},${o.j}`));
  } catch (err) { /* sem a função nesta versão: calcula pela forma */ }
  return null;
}
/**
 * Um token está na área quando ALGUM quadrado que ele ocupa é um quadrado coberto pela área
 * (os quadrados destacados embaixo do círculo, cone, linha ou retângulo) - não basta a borda
 * da forma encostar no token. "ponto" é o centro do token (pode ser o destino de um movimento);
 * tokens maiores que 1 quadrado contam cada quadrado ocupado.
 * Sem a lista do Foundry, um quadrado é coberto quando o CENTRO dele está dentro da forma.
 */
function naurenCelulasNaArea(ponto, shapes, tokenDoc = null, regiao = null) {
  const gs = canvas.grid?.size ?? 100;
  const w = Math.max(1, Math.round(Number(tokenDoc?.width ?? 1))), h = Math.max(1, Math.round(Number(tokenDoc?.height ?? 1)));
  const x0 = ponto.x - (w * gs) / 2, y0 = ponto.y - (h * gs) / 2;
  const centros = [];
  for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) centros.push({ x: x0 + (i + 0.5) * gs, y: y0 + (j + 0.5) * gs });
  const cobertas = naurenCelulasCobertas(regiao);
  if (cobertas && typeof canvas.grid?.getOffset === "function") {
    return centros.some(c => { const o = canvas.grid.getOffset(c); return cobertas.has(`${o.i},${o.j}`); });
  }
  // Mesma regra do destaque: o centro do quadrado dentro da forma (a borda conta, com 1px de folga).
  const dentro = p => shapes.some(s => s.testPoint(p)) || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => shapes.some(s => s.testPoint({ x: p.x + dx, y: p.y + dy })));
  return centros.some(dentro);
}

/**
 * true se "tokenDoc" é elegível pro filtro de disposição configurado
 * numa Região Persistente ("disposicao"/"disposicaoOrigem" - mesma
 * regra "aliados = mesma disposição de quem criou, inimigos =
 * diferente, todos = qualquer um" usada em todo o resto do sistema).
 */
function naurenTokenElegivelPorDisposicao(tokenDoc, config) {
  const filtro = config.disposicao || "inimigos";
  if (filtro === "todos") return true;
  const mesmaDisposicao = tokenDoc.disposition === config.disposicaoOrigem;
  if (filtro === "aliados") return mesmaDisposicao;
  return !mesmaDisposicao; // "inimigos"
}


async function naurenRolarValoresTemplatePersistente(config, atorOrigemTemplate) {
  let quantidade = 0, breakdownEfeito = "";
  if (config.efeito) {
    try {
      const modQuantidade = await naurenInterpretarModificadorComDado(config.quantidade || "0", atorOrigemTemplate);
      quantidade = modQuantidade?.valor ?? 0;
      breakdownEfeito = modQuantidade?.breakdown ?? "";
    } catch (err) {
      quantidade = 0;
    }
  }
  let acumulosCondicao = 1;
  if (config.condicaoUuid) {
    try {
      const modAcumulos = await naurenInterpretarModificadorComDado(config.condicaoAcumulos || "1", atorOrigemTemplate);
      acumulosCondicao = Math.max(1, Math.round(modAcumulos?.valor ?? 1));
    } catch (err) {
      acumulosCondicao = 1;
    }
  }
  return { quantidade, breakdownEfeito, acumulosCondicao };
}

/** Pergunta ao dono do personagem se ele paga Estamina para resistir a uma área. */
/**
 * Aplica o efeito de uma área persistente em vários tokens e posta UM card só (antes saía um card
 * por alvo, falando como se fosse o alvo). A primeira linha numérica (o valor rolado, igual para
 * todos) aparece uma vez; depois, uma linha por alvo com o que aconteceu com ele.
 */
async function naurenAplicarAreaEmTokens(config, tokens, valores, titulo, icone) {
  const origem = config.origemAtorUuid ? await fromUuid(config.origemAtorUuid).catch(() => null) : null;
  const linhas = [];
  let principal = null;
  for (const tokenDoc of tokens) {
    if (!tokenDoc?.actor) continue;
    const r = await naurenAplicarEfeitoTemplatePersistente(config, tokenDoc.actor, config.origemAtorUuid, valores, tokenDoc, titulo);
    if (!r?.aplicou || !r.secondaryLines?.length) continue;
    const sl = [...r.secondaryLines];
    if (sl[0]?.label && sl[0].breakdown !== undefined) {
      const p0 = sl.shift();
      if (!principal) principal = p0;
      else if (principal.value !== p0.value) sl.unshift({ label: p0.label, value: p0.value });
    }
    const nomeT = tokenDoc.name;
    const texto = sl.filter(l => l.value !== "" && l.value !== undefined)
      .map(l => (l.label && l.label !== nomeT ? `${l.label}: ${l.value}` : String(l.value)).replace(new RegExp(`^${nomeT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*`), ""))
      .join(" • ");
    linhas.push({ label: tokenDoc.name, value: texto || "afetado" });
  }
  if (!linhas.length) return;
  const sheet = (origem?.actor ?? origem)?.sheet ?? tokens[0]?.actor?.sheet;
  await sheet?._postRollCard?.({ title: titulo, icon: icone, d20Result: null, secondaryLines: [...(principal ? [principal] : []), ...linhas] });
}
const NAUREN_QUERY_AREA_AO_CRIAR = "nauren.areaAoCriar";
/** "Aplicar ao Criar" de uma área: roda no Mestre (o jogador não pode mexer em monstros). */
async function naurenHandleQueryAreaAoCriar({ regionUuid, icone }) {
  const region = await fromUuid(regionUuid).catch(() => null);
  const config = region ? foundry.utils.deepClone(region.getFlag("nauren", "templatePersistente") ?? null) : null;
  if (!config) return false;
  const filtro = config.disposicao || "inimigos";
  const atorOrigem = config.origemAtorUuid ? await fromUuid(config.origemAtorUuid).catch(() => null) : null;
  const valores = await naurenRolarValoresTemplatePersistente(config, atorOrigem);
  const tokens = NaurenRegionHelper._tokensNaRegiao(region).filter(t => {
    if (!t.actor) return false;
    const mesma = t.disposition === config.disposicaoOrigem;
    return !(filtro === "aliados" && !mesma) && !(filtro === "inimigos" && mesma);
  });
  await naurenAplicarAreaEmTokens(config, tokens, valores, region.name, icone);
  return true;
}
const NAUREN_QUERY_RESISTIR_AREA = "nauren.resistirArea";
async function naurenHandleQueryResistirArea({ actorUuid, custo, nomeArea }) {
  const d = await fromUuid(actorUuid).catch(() => null);
  const a = d?.actor ?? d;
  if (!a || (a.system.estaminaCombate?.value ?? 0) < custo) return false;
  const sim = await foundry.applications.api.DialogV2.confirm({ window: { title: nomeArea }, content: `<p><b>${a.name}</b> está em <b>${nomeArea}</b>. Gastar <b>${custo} Estamina</b> para resistir?</p>`,
    yes: { label: `Resistir (−${custo} Estamina)` }, no: { label: "Não" }, rejectClose: false }).catch(() => false);
  if (sim) await a.update({ "system.estaminaCombate.value": (a.system.estaminaCombate?.value ?? 0) - custo });
  return !!sim;
}
async function naurenAplicarEfeitoTemplatePersistente(config, alvoActor, origemAtorUuid, valoresPreRolados = null, tokenDoc = null, nomeAcao = "") {
  // "Não afeta quem conjurou" (ex.: Armadilha de Caça): o próprio criador passa sem ativar.
  if (config?.ignorarConjurador && alvoActor && origemAtorUuid) {
    let dono = null;
    try { const d = fromUuidSync(origemAtorUuid); dono = d?.actor ?? d; } catch (err) { dono = null; }
    if (dono && dono.uuid === alvoActor.uuid) return { aplicou: false, secondaryLines: [] };
  }
  // Éolos: pagar Estamina evita o efeito.
  const custoResistir = Number(config?.resistirEstamina) || 0;
  if (custoResistir > 0 && alvoActor) {
    const exec = NaurenAlvoHelper.usuarioExecutor(alvoActor) ?? game.users.activeGM;
    const dadosR = { actorUuid: alvoActor.uuid, custo: custoResistir, nomeArea: nomeAcao || "Área" };
    const resistiu = exec?.id === game.user.id ? await naurenHandleQueryResistirArea(dadosR) : await exec?.query(NAUREN_QUERY_RESISTIR_AREA, dadosR, { timeout: 30000 }).catch(() => false);
    if (resistiu) return { aplicou: true, secondaryLines: [{ label: alvoActor.name, value: `resistiu (−${custoResistir} Estamina)` }] };
  }
  const resultadoBase = await naurenAplicarEfeitoTemplatePersistenteBase(config, alvoActor, origemAtorUuid, valoresPreRolados, tokenDoc, nomeAcao);
  // Singularidade: puxa para o centro. Éolos: empurra em direção aleatória.
  if (tokenDoc?.object && (config?.puxarAoCentro || config?.empurrarAleatorio)) {
    try {
      if (config.puxarAoCentro && config.centro) {
        await naurenEmpurrarViaMestre(tokenDoc, config.centro, "99", "puxar");
        resultadoBase?.secondaryLines?.push?.({ label: tokenDoc.name, value: "puxado para o centro" });
      }
      if (config.empurrarAleatorio) {
        const rollE = await new Roll(String(config.empurrarAleatorio)).evaluate();
        const ang = Math.random() * Math.PI * 2;
        const c = tokenDoc.object.center;
        const origemE = { x: c.x - Math.cos(ang) * canvas.grid.size, y: c.y - Math.sin(ang) * canvas.grid.size };
        await naurenEmpurrarViaMestre(tokenDoc, origemE, String(rollE.total), "afastar");
        resultadoBase?.secondaryLines?.push?.({ label: tokenDoc.name, value: `empurrado ${rollE.total}m (direção aleatória)`, breakdown: naurenTextoRolagem(rollE) });
      }
    } catch (err) { console.warn("Nauren RPG | Falha ao mover pelo efeito da área.", err); }
  }
  return resultadoBase;
}
/** Empurra/puxa um token de qualquer dono (pelo Mestre, se preciso). */
async function naurenEmpurrarViaMestre(tokenDoc, origem, metros, direcao) {
  if (tokenDoc.isOwner) return naurenEmpurrarToken(tokenDoc, origem, metros, direcao);
  const gm = game.users.activeGM;
  if (!gm) return null;
  return gm.query(NAUREN_QUERY_ITEM_MESTRE, { tipo: "empurrar", tokenUuid: tokenDoc.uuid, x: origem.x, y: origem.y, metros, direcao }, { timeout: 20000 }).catch(() => null);
}
async function naurenAplicarEfeitoTemplatePersistenteBase(config, alvoActor, origemAtorUuid, valoresPreRolados = null, tokenDoc = null, nomeAcao = "") {
  // Busca UMA VEZ aqui (compartilhada pelos dois blocos abaixo) - Ator
  // que criou/sustenta esta área, usado pra resolver "@atributo" nas
  // fórmulas de dano/cura/etc E de acúmulos de condição sempre contra
  // QUEM CONJUROU, nunca contra quem está recebendo o efeito (ex:
  // "3d6+@poderMagia" numa cura de área deve usar o Poder de Magia de
  // quem criou a área, não do aliado curado).
  const atorOrigemTemplate = origemAtorUuid ? await fromUuid(origemAtorUuid).catch(() => null) : null;

  // Valores compartilhados: se o caller já rolou uma vez pra todo o
  // evento (ver naurenRolarValoresTemplatePersistente), usa esse mesmo
  // resultado pra este alvo específico - nunca rola de novo aqui. Sem
  // valores prontos (ex: gatilho "ao entrar", que só afeta 1 alvo por
  // vez), rola normalmente, mantendo o comportamento de sempre.
  const { quantidade: quantidadePronta, breakdownEfeito: breakdownPronto, acumulosCondicao: acumulosPronto } =
    valoresPreRolados ?? await naurenRolarValoresTemplatePersistente(config, atorOrigemTemplate);

  let okNumerico = false;
  const breakdownEfeito = breakdownPronto;
  const quantidade = quantidadePronta;
  const linhasReacaoDano = [];
  let condicaoEvitadaViaPopup = false;
  let condicaoJaPassouPeloPopup = false;
  if (config.efeito && quantidade) {
    {
      if (config.efeito === "dano") {
        // Bug real corrigido: dano de Template Persistente nunca passava
        // pelo popup de reação (Bloquear/Esquivar/Estresse/Cheio) - era
        // sempre aplicado cheio e direto. Agora usa o MESMO ciclo de
        // reação de um ataque normal (ver _resolverUmEventoDeAtaque),
        // com "houveAtaque: false" - dano de área não tem teste de
        // ataque nem Defesa (o manual não menciona nenhum dos dois pra
        // essas magias), então isso já desabilita Bloquear/Esquivar/
        // Contra-Atacar automaticamente (dependem de "ataqueTotal" pra
        // comparar), mas mantém Estresse (metade do dano) e Sem-Dano
        // disponíveis - as únicas reações que fazem sentido pra dano
        // garantido sem um ataque de verdade pra reagir contra. Sem
        // "tokenDoc" (não deveria acontecer nos 3 chamadores atuais,
        // mas por segurança), cai pro comportamento antigo direto.
        if (tokenDoc) {
          const pEventoTemplate = {
            houveAtaque: false, ataqueTotal: 0, dano: quantidade, danoMinimo: 0,
            atacante: atorOrigemTemplate?.name ?? "Alguém", nomeAcao: nomeAcao || "Efeito de Área",
            atacanteTokenUuid: origemAtorUuid || null
          };
          // Condição junto do dano (ex: Bola de Fogo - dano + Queimando)
          // também entra no MESMO popup, com a opção livre "não
          // receber" - Template Persistente não tem um mecanismo de
          // custo próprio pra evitar Condição (diferente de Condições
          // Aplicadas normais, que podem ter "perguntarParaEvitar"),
          // então segue o mesmo padrão de qualquer Condição sem esse
          // mecanismo: sempre oferece a chance de recusar, sem custo.
          const itensEvitaveisTemplate = [];
          if (config.condicaoUuid) {
            const origemCondicao = await fromUuid(config.condicaoUuid).catch(() => null);
            itensEvitaveisTemplate.push({ tipo: "condicao-livre", label: origemCondicao?.name ?? "condição" });
          }
          const vidaAntesTemplate = alvoActor.system.vida?.value ?? 0;
          const resultadoAtaque = await NaurenAlvoHelper._resolverUmEventoDeAtaque(tokenDoc, alvoActor, pEventoTemplate, itensEvitaveisTemplate);
          okNumerico = true; // sempre "aplicou" narrativamente, mesmo quando o dano final vira 0 (Estresse/Sem-Dano)
          if ((alvoActor.system.vida?.value ?? 0) < vidaAntesTemplate) naurenGatilhoDanoDeArea(atorOrigemTemplate, config, alvoActor);
          linhasReacaoDano.push(...resultadoAtaque.linhas);
          condicaoEvitadaViaPopup = itensEvitaveisTemplate.length > 0 && new Map(resultadoAtaque.evitados ?? []).has(0);
          if (itensEvitaveisTemplate.length > 0) condicaoJaPassouPeloPopup = true;
        } else {
          const vidaAtual = alvoActor.system.vida?.value ?? 0;
          const reducao = alvoActor.system.reducaoDanoTotal ?? 0;
          const danoFinal = Math.max(0, NaurenAlvoHelper.aplicarReducaoPercentual(alvoActor, quantidade) - reducao); await NaurenAlvoHelper.consumirAoSofrerDano(alvoActor, quantidade);
          if (danoFinal > 0) {
            const { escudoConsumido, danoNaVida, escudoRestante } = NaurenAlvoHelper.calcularDanoComEscudo(alvoActor, danoFinal);
            const updatesTemplate = { "system.vida.value": Math.max(0, vidaAtual - danoNaVida) };
            if (escudoConsumido > 0) updatesTemplate["system.escudo.value"] = escudoRestante;
            okNumerico = await NaurenAlvoHelper.atualizarAtorSeguro(alvoActor, updatesTemplate, { naurenOrigemCombate: true });
            if (okNumerico) {
              naurenProcessarGatilhos("aliadoSofreuDano", alvoActor).catch(() => {});
              naurenProcessarGatilhos("euSofriDano", alvoActor).catch(() => {});
              naurenGatilhoDanoDeArea(atorOrigemTemplate, config, alvoActor);
            }
          }
        }
      } else if (config.efeito === "cura") {
        const vidaAtual = alvoActor.system.vida?.value ?? 0;
        const vidaMax = alvoActor.system.vida?.max ?? 0;
        if (vidaAtual < vidaMax) {
          okNumerico = await NaurenAlvoHelper.atualizarAtorSeguro(alvoActor, { "system.vida.value": Math.min(vidaMax, vidaAtual + quantidade) });
        }
      } else if (config.efeito === "estresse") {
        const atual = alvoActor.system.stress?.value ?? 0;
        const max = alvoActor.system.stress?.max ?? 2;
        if (atual < max) okNumerico = await NaurenAlvoHelper.atualizarAtorSeguro(alvoActor, { "system.stress.value": Math.min(max, atual + quantidade) });
      } else if (config.efeito === "reduzEstresse") {
        const atual = alvoActor.system.stress?.value ?? 0;
        if (atual > 0) okNumerico = await NaurenAlvoHelper.atualizarAtorSeguro(alvoActor, { "system.stress.value": Math.max(0, atual - quantidade) });
      } else if (config.efeito === "estamina") {
        const atual = alvoActor.system.estaminaCombate?.value ?? 0;
        if (atual > 0) okNumerico = await NaurenAlvoHelper.atualizarAtorSeguro(alvoActor, { "system.estaminaCombate.value": Math.max(0, atual - quantidade) });
      } else if (config.efeito === "restauraEstamina") {
        const atual = alvoActor.system.estaminaCombate?.value ?? 0;
        const max = alvoActor.system.estaminaCombate?.max ?? 0;
        if (atual < max) okNumerico = await NaurenAlvoHelper.atualizarAtorSeguro(alvoActor, { "system.estaminaCombate.value": Math.min(max, atual + quantidade) });
      }
    }
  }

  let okCondicao = false;
  let nomeCondicaoAplicada = "";
  let linhaCondicaoEvitadaIsolada = "";
  // Buff (Condição não negativa) da própria área de quem a criou ou de um
  // aliado (ex.: Jardim das Flores Silvestres): entra direto, sem a janela
  // "Não receber" a cada rodada - só fazia o jogador clicar à toa.
  const buffDeAmigo = await (async () => {
    if (!config.condicaoUuid) return false;
    const oc = await fromUuid(config.condicaoUuid).catch(() => null);
    if (!oc || oc.type !== "condicao" || naurenCondicaoNegativa(oc)) return false;
    const orig = atorOrigemTemplate?.actor ?? atorOrigemTemplate;
    if (!orig) return false;
    if (orig === alvoActor || orig.uuid === alvoActor.uuid) return true;
    const dOrig = atorOrigemTemplate?.disposition ?? naurenDisposicaoDoAtor(orig), dAlvo = tokenDoc?.disposition ?? naurenDisposicaoDoAtor(alvoActor);
    return dOrig !== undefined && dOrig === dAlvo;
  })();
  if (config.condicaoUuid && !condicaoJaPassouPeloPopup && tokenDoc && !buffDeAmigo) {
    // Condição sem dano numérico junto (ou com um efeito que não seja
    // "dano", ex: cura de área + Condição) - ainda não passou por
    // nenhum popup acima, então oferece a mesma opção livre "não
    // receber", isolada (sem "Reagir ao dano", que não tem sentido
    // sem efeito de dano nenhum aqui).
    const origemCondicao = await fromUuid(config.condicaoUuid).catch(() => null);
    const pEventoSoCondicao = { atacante: atorOrigemTemplate?.name ?? "Alguém", nomeAcao: nomeAcao || "Efeito de Área", houveAtaque: false };
    const resultadoPopup = await NaurenAlvoHelper._popupReacao(alvoActor, pEventoSoCondicao, {
      mostrarReacaoDano: false, itensEvitaveis: [{ tipo: "condicao-livre", label: origemCondicao?.name ?? "condição" }]
    });
    condicaoEvitadaViaPopup = new Map(resultadoPopup.evitados ?? []).has(0);
    // Separado de "linhasReacaoDano" de propósito: essa linha nunca
    // deve suprimir a linha numérica normal (cura/estresse/etc) mais
    // abaixo - só a acompanha, nunca a substitui.
    if (condicaoEvitadaViaPopup) linhaCondicaoEvitadaIsolada = `Não recebeu ${origemCondicao?.name ?? "a condição"}`;
  }
  if (config.condicaoUuid && !condicaoEvitadaViaPopup) {
    const acumulos = acumulosPronto;
    const nomeAplicado = await NaurenAlvoHelper.aplicarCondicao(alvoActor, config.condicaoUuid, acumulos, null, 0, 0, "", "1", config.overrideFormulaCondicao || "", "", config.modificadorExtra || 0);
    okCondicao = !!nomeAplicado;
    nomeCondicaoAplicada = nomeAplicado || "";
  } else if (config.condicaoUuid && condicaoEvitadaViaPopup && condicaoJaPassouPeloPopup) {
    // Já passou pelo popup fundido com o dano (ver bloco acima) - essa
    // linha SIM entra em "linhasReacaoDano" de propósito, porque ali
    // ela é só mais uma linha do MESMO evento (dano), não corre risco
    // de suprimir nada que não devesse.
    const origemCondicao = await fromUuid(config.condicaoUuid).catch(() => null);
    linhasReacaoDano.push(`Não recebeu ${origemCondicao?.name ?? "a condição"}`);
  }

  // Bug real corrigido: a função só atualizava o recurso do alvo
  // silenciosamente (ex: "system.vida.value") - o dado rolado
  // (breakdownEfeito) nunca era exposto pra quem chama mostrar no chat,
  // então uma Armadilha de Caça (ou qualquer Template Persistente com
  // efeito) causava dano de verdade, mas o chat só dizia "ativou a
  // armadilha", sem nenhuma menção ao dano. Devolve linhas estruturadas
  // (label/value/breakdown), prontas pra virar um card de chat de
  // verdade (ver _postRollCard) - não mais um texto solto.
  const secondaryLines = [];
  if (okNumerico && breakdownEfeito) {
    const rotuloEfeito = { dano: "Dano rolado", cura: "Cura", estresse: "Estresse ganho", reduzEstresse: "Estresse removido", estamina: "Estamina perdida", restauraEstamina: "Estamina recuperada" }[config.efeito] ?? config.efeito;
    secondaryLines.push({ label: rotuloEfeito, value: quantidade, breakdown: breakdownEfeito });
  }
  for (const linha of linhasReacaoDano) secondaryLines.push({ label: "", value: linha });
  if (okCondicao) secondaryLines.push({ label: "Condição recebida", value: nomeCondicaoAplicada });
  if (linhaCondicaoEvitadaIsolada) secondaryLines.push({ label: "", value: linhaCondicaoEvitadaIsolada });
  return { aplicou: okNumerico || okCondicao || !!linhaCondicaoEvitadaIsolada, secondaryLines };
}


/**
 * Processa Templates Persistentes (áreas fixas no mapa, ver
 * usaTemplatePersistente em campoAcao): pra cada Região da cena atual com
 * essa configuração gravada (ver NaurenRegionHelper.colocarArea), aplica
 * o efeito periódico em quem estiver dentro (filtrado por disposição
 * relativa a quem colocou a área) quando "tipoEvento" bater com o evento
 * configurado, e conta a duração regressiva (sempre no fim da rodada,
 * independente de ter efeito periódico configurado ou não) - apagando a
 * Região sozinha quando a duração zera. Roda só no GM ativo, uma vez por
 * mudança de rodada/turno (mesmo padrão de naurenProcessarEmanacoes, mas
 * não é por-ator: percorre a cena inteira de uma vez).
 */
/**
 * true se "actor" tem pelo menos "quantidade" do recurso indicado
 * (mesmas chaves de RECURSOS_ALVO/_aplicarRecursoNoAlvo: vida, estamina,
 * mana, destino, estresse, ou "recursoCustom:id") - usado pra checar
 * ANTES de perguntar "quer sustentar?" (não faz sentido perguntar se o
 * Ator nem tem o suficiente pra pagar).
 */
function naurenAtorTemRecurso(actor, recurso, quantidade) {
  if (!quantidade) return true;
  if (recurso === "estresse") {
    const atual = actor.system.stress?.value ?? 0, max = actor.system.stress?.max ?? 2;
    return (max - atual) >= quantidade; // "ter estresse suficiente" = ainda cabe subir
  }
  if (recurso?.startsWith("recursoCustom:")) {
    const id = recurso.split(":")[1];
    const barra = (actor.system.recursosCustom ?? []).find(r => r.id === id);
    return (barra?.valor ?? 0) >= quantidade;
  }
  const campo = { vida: "vida", estamina: "estaminaCombate", mana: "mana", destino: "dadosDestino" }[recurso];
  if (!campo) return true;
  return (actor.system[campo]?.value ?? 0) >= quantidade;
}

/**
 * @param {Actor|null} atorDoTurno - Só usado pra "Regenerar" (ver campo
 * templatePersistenteRegeneraRecurso no schema) - essa mecânica só
 * dispara no INÍCIO DO TURNO de quem CRIOU aquele template
 * especificamente (não de qualquer personagem, ex: "recupera 1 Mana no
 * início de SEU turno"), então a função precisa saber de quem é o
 * turno que está começando agora. "Sustentar" (diferente de
 * Regenerar) dispara em TODO turno da rodada, não depende de
 * "atorDoTurno" pra decidir SE dispara - só usa "config.origemAtorUuid"
 * pra saber A QUEM perguntar. null nas chamadas de
 * fimRodada/inicioRodada/fimTurno (não se aplica a nenhum dos dois).
 */
/**
 * Gatilhos Externos de Template Persistente (ver
 * NaurenEfeitoData#gatilhosTemplatePersistente) - devolve, já filtrado
 * pelo "eventoFiltro" (evento de combate, ou "aoEntrar"), cada entrada
 * de gatilho de um Efeito ATIVO do Ator que criou a Região
 * ("origemAtorUuid"), cujo "itemAlvoUuid" apontar pro item que originou
 * esta Região específica ("origemItemUuid"). Cada entrada devolvida já
 * vem com um "config" pronto pra passar direto em
 * "naurenAplicarEfeitoTemplatePersistente"/"naurenRolarValoresTemplatePersistente",
 * sem precisar saber de onde veio.
 */
async function naurenColetarGatilhosTemplatePersistenteExternos(origemAtorUuid, origemItemUuid, eventoFiltro) {
  if (!origemAtorUuid || !origemItemUuid) return [];
  const atorOrigem = await fromUuid(origemAtorUuid).catch(() => null);
  if (!atorOrigem) return [];
  // "origemItemUuid" é a cópia REAL (Actor.X.Item.Y) que criou esta
  // Região - nunca o UUID do Compêndio que o autor do Gatilho arrastou
  // em "itemAlvoUuid" (ver naurenItemCorrespondeAoAlvo).
  const itemOrigem = await fromUuid(origemItemUuid).catch(() => null);
  if (!itemOrigem) return [];
  const encontrados = [];
  for (const efeito of atorOrigem.items) {
    if (efeito.type !== "efeito" || !efeito.system.ativo || !efeito.system.usaGatilhoTemplatePersistente) continue;
    for (const gatilho of (efeito.system.gatilhosTemplatePersistente ?? [])) {
      if (!naurenItemCorrespondeAoAlvo(itemOrigem, gatilho.itemAlvoUuid)) continue;
      if ((gatilho.evento || "inicioTurno") !== eventoFiltro) continue;
      encontrados.push({
        origemNome: efeito.name,
        config: {
          disposicao: gatilho.disposicao || "aliados",
          efeito: gatilho.efeito || "",
          quantidade: gatilho.quantidade || "1",
          condicaoUuid: gatilho.condicaoUuid || "",
          condicaoAcumulos: gatilho.condicaoAcumulos || "1"
        }
      });
    }
  }
  return encontrados;
}

async function naurenProcessarTemplatesPersistentes(tipoEvento, atorDoTurno = null, combatanteAtualId = null) {
  if (game.users.activeGM !== game.user || !canvas?.ready || !canvas.scene) return;
  const regioes = canvas.scene.regions?.filter(r => r.getFlag("nauren", "templatePersistente")) ?? [];

  for (const regiao of regioes) {
    const config = foundry.utils.deepClone(regiao.getFlag("nauren", "templatePersistente"));
    if (!config) continue;
    let mudou = false;

    // Duração: por padrão (sem combate ativo no momento de criar) ainda
    // decrementa 1x por fim de rodada do calendário, igual sempre foi.
    // Mas se um "combatente de referência" foi capturado na criação (ver
    // acima), o modelo muda pra "espera ESSE combatente específico
    // voltar ao início do turno dele, X vezes" - dá uma volta JUSTA e
    // completa no ciclo de turnos a partir do momento exato em que foi
    // conjurada, em vez de truncar na fronteira de rodada do calendário
    // (que dava menos que 1 rodada de verdade se conjurada tarde nela).
    // Também é imune a quantos combatentes entram/saem da iniciativa
    // nesse meio tempo - sempre espera o MESMO combatente, não conta
    // posições. "duracaoRodadasCalendario" é só uma salvaguarda: se esse
    // combatente for removido do combate antes de voltar (morreu, saiu),
    // a área não ficaria PRESA pra sempre sem isso.
    if (config.duracaoRodadas > 0 && config.duracaoCombatanteReferenciaId) {
      if (tipoEvento === "inicioTurno" && combatanteAtualId && combatanteAtualId === config.duracaoCombatanteReferenciaId) {
        config.duracaoVoltasRestantes = (config.duracaoVoltasRestantes ?? config.duracaoRodadas) - 1;
        mudou = true;
        if (config.duracaoVoltasRestantes <= 0) {
          await regiao.delete();
          continue; // deu a volta completa - já era, nem processa efeito periódico neste tick
        }
      }
      if (tipoEvento === "fimRodada") {
        config.duracaoRodadasCalendario = (config.duracaoRodadasCalendario ?? (config.duracaoRodadas * 3 + 3)) - 1;
        if (config.duracaoRodadasCalendario <= 0) {
          await regiao.delete();
          continue; // salvaguarda: o combatente de referência nunca voltou - força expirar
        }
        mudou = true;
      }
    } else if (tipoEvento === "fimRodada" && config.duracaoRodadas > 0) {
      config.duracaoRestante = (config.duracaoRestante ?? config.duracaoRodadas) - 1;
      if (config.duracaoRestante <= 0) {
        await regiao.delete();
        continue; // já era - nem processa efeito periódico neste tick
      }
      mudou = true;
    }

    // Sustentar: dispara em TODO turno da rodada (de qualquer
    // personagem), igual o Efeito Periódico abaixo - mesma semântica
    // "por turno" já estabelecida pra dano/Condições (Hemorragia,
    // Marca Cronometrada, Chuva de Estrelas). A pergunta é SEMPRE
    // direcionada a "atorOrigem" (quem CRIOU a área, resolvido
    // abaixo, independente de "atorDoTurno") - só ele tem a Mana pra
    // gastar - mas o MOMENTO de perguntar não é mais travado ao turno
    // específico dele: pergunta a cada turno de qualquer um, e se
    // sustentar, paga o custo (uma vez por turno) e o dano acompanha.
    // "templatePersistenteSustentarPorRodada" (Terra Mágica, Jardim
    // das Flores Silvestres) continua fixo em "1x por rodada" - só
    // essas magias têm o texto explícito "X Mana por rodada".
    const sustentarBateuEvento = config.sustentarPorRodada
      ? tipoEvento === "inicioRodada"
      : tipoEvento === "inicioTurno";
    if (sustentarBateuEvento && config.sustentadoRecurso) {
      // Rodada/Turno Grátis (ver rodadasGratisRestantes acima) - pula a
      // pergunta/gasto de recurso do Sustentar desta vez, só decrementa
      // o contador (o efeito periódico abaixo já roda de qualquer
      // forma, independente disso - são dois mecanismos separados).
      if (config.rodadasGratisRestantes > 0) {
        config.rodadasGratisRestantes -= 1;
        mudou = true;
      } else {
      const atorOrigem = await fromUuid(config.origemAtorUuid).catch(() => null);
      if (atorOrigem) {
        const quantidade = Math.round(naurenInterpretarModificador(config.sustentadoQuantidade || "1", atorOrigem)?.valor ?? 1);
        const temRecurso = naurenAtorTemRecurso(atorOrigem, config.sustentadoRecurso, quantidade);
        const sustentou = temRecurso && await NaurenAlvoHelper.perguntarSustentar(atorOrigem, {
          nomeRegiao: regiao.name, recurso: config.sustentadoRecurso, quantidade
        });
        if (!sustentou) {
          naurenPostarCard({ ator: atorOrigem, titulo: regiao.name, icone: "icons/commodities/treasure/token-runed-circle-green.webp", fonte: "Área sustentada",
            linhas: [{ label: "Encerrada", value: temRecurso ? "não sustentada" : `faltou ${quantidade} de ${naurenNomeDoRecurso(null, config.sustentadoRecurso)}` }] });
          await regiao.delete();
          continue; // magia acabou - nem processa regeneração/efeito periódico neste tick
        }
        await NaurenAlvoHelper._aplicarRecursoNoAlvo(atorOrigem, config.sustentadoRecurso, quantidade);
      }
      }
    }

    // Regenerar: SÓ no início do TURNO de quem criou este template
    // especificamente (não de qualquer personagem na cena) - este sim é
    // pessoal, ex: "você recupera 1 de Mana no início de SEU turno".
    if (tipoEvento === "inicioTurno" && atorDoTurno && config.origemAtorUuid === atorDoTurno.uuid) {
      if (config.regeneraRecurso) {
        const quantidadeRegen = Math.round(naurenInterpretarModificador(config.regeneraQuantidade || "1", atorDoTurno)?.valor ?? 1);
        await NaurenAlvoHelper._aplicarRecursoNoAlvo(atorDoTurno, config.regeneraRecurso, -quantidadeRegen);
        naurenNotificarGanhoPerda(atorDoTurno, { quantidade: quantidadeRegen, rotulo: naurenNomeDoRecurso(null, config.regeneraRecurso), origemNome: regiao.name });
      }
    }

    // Efeito periódico (dano/cura/etc na área) - por padrão dispara em
    // TODO turno da rodada (de qualquer personagem), decoupled do
    // Sustentar (que continua só no turno de quem criou - só ele pode
    // pagar pra manter a área). Confirmado pelo usuário: dano de Chuva
    // de Estrelas (e qualquer outra magia "por turno") acerta quem
    // estiver dentro em TODO turno, não só quando bate a vez de quem
    // lançou - mesma semântica já corrigida pra Condições "por turno"
    // (Hemorragia, Marca Cronometrada).
    // "efeitoPessoal" (ver schema, ex: Florescer da Vida - "aliados que
    // INICIAREM seus turnos na área curam") inverte isso: só afeta quem
    // TEM o turno começando/acabando agora, mesmo que outros aliados
    // também estejam na área - nunca no turno de outro aliado, e nunca
    // durante uma Prioridade tomada no turno de alguém (Prioridade não
    // muda de quem "tem o turno" pro sistema).
    const efeitoPeriodicoBateuEvento = config.eventoPeriodico && config.eventoPeriodico === tipoEvento;
    if (efeitoPeriodicoBateuEvento && (!config.efeitoPessoal || atorDoTurno)) {
      let tokensDentro = NaurenRegionHelper._tokensNaRegiao(regiao);
      if (config.efeitoPessoal) tokensDentro = tokensDentro.filter(t => t.actor === atorDoTurno);
      const disposicaoFiltro = config.disposicao || "inimigos";
      // Rola UMA VEZ pra todo o evento (ver naurenRolarValoresTemplatePersistente)
      // e compartilha o mesmo resultado entre todos os alvos dentro da
      // área - senão cada um rolaria a fórmula de novo, dando valores
      // diferentes de dano pro mesmo estouro (ex: Chuva de Estrelas
      // com 2 pessoas na área deve causar o MESMO 4d6 pras duas).
      const atorOrigemPeriodico = config.origemAtorUuid ? await fromUuid(config.origemAtorUuid).catch(() => null) : null;
      const valoresPeriodico = await naurenRolarValoresTemplatePersistente(config, atorOrigemPeriodico);
      const alvosPeriodico = tokensDentro.filter(tokenDoc => {
        if (!tokenDoc.actor) return false;
        const mesmaDisposicao = tokenDoc.disposition === config.disposicaoOrigem;
        return !(disposicaoFiltro === "aliados" && !mesmaDisposicao) && !(disposicaoFiltro === "inimigos" && mesmaDisposicao);
      });
      await naurenAplicarAreaEmTokens(config, alvosPeriodico, valoresPeriodico, regiao.name, config.icone || "icons/magic/acid/projectile-glowing-bubbles.webp");
    }

    // Gatilhos Externos de Template Persistente (ver
    // NaurenEfeitoData#gatilhosTemplatePersistente, ex: Bênção dos
    // Cristais - Druida, "reduzEstresse" no INÍCIO DO TURNO de cada
    // aliado, diferente do evento "inicioRodada" que Jardim das Flores
    // Silvestres já usa pra própria renovação de Defesa) - roda
    // INDEPENDENTE do bloco acima, com seu próprio evento/disposição/
    // efeito, nunca escrevendo no item que originou a Região.
    const gatilhosExternos = await naurenColetarGatilhosTemplatePersistenteExternos(config.origemAtorUuid, config.origemItemUuid, tipoEvento);
    if (gatilhosExternos.length) {
      const tokensDentroExterno = NaurenRegionHelper._tokensNaRegiao(regiao);
      const atorOrigemExterno = config.origemAtorUuid ? await fromUuid(config.origemAtorUuid).catch(() => null) : null;
      for (const { origemNome, config: configGatilho } of gatilhosExternos) {
        const disposicaoFiltroExterno = configGatilho.disposicao || "aliados";
        const valoresGatilho = await naurenRolarValoresTemplatePersistente(configGatilho, atorOrigemExterno);
        for (const tokenDoc of tokensDentroExterno) {
          if (!tokenDoc.actor) continue;
          const mesmaDisposicaoExterno = tokenDoc.disposition === config.disposicaoOrigem;
          if (disposicaoFiltroExterno === "aliados" && !mesmaDisposicaoExterno) continue;
          if (disposicaoFiltroExterno === "inimigos" && mesmaDisposicaoExterno) continue;
          const resultadoExterno = await naurenAplicarEfeitoTemplatePersistente(configGatilho, tokenDoc.actor, config.origemAtorUuid, valoresGatilho, tokenDoc, `${regiao.name} (${origemNome})`);
          if (resultadoExterno.aplicou && resultadoExterno.secondaryLines.length) {
            await tokenDoc.actor.sheet?._postRollCard?.({
              title: `${regiao.name} — ${origemNome}`, icon: "icons/magic/acid/projectile-smoke-glowing.webp", d20Result: null,
              secondaryLines: resultadoExterno.secondaryLines
            });
          }
        }
      }
    }

    if (mudou) await regiao.setFlag("nauren", "templatePersistente", config);
  }
}

/**
 * Personagens (PCs) nascem com "Vincular Ator" ligado no Token Padrão -
 * assim, o jogador SEMPRE edita a mesma ficha, seja pelo token no mapa ou
 * pela ficha na barra lateral, sem correr o risco de editar só uma cópia
 * isolada daquele token específico (comportamento nativo do Foundry
 * quando o token NÃO está vinculado). NPCs continuam com o padrão do
 * próprio Foundry (normalmente desvinculado, útil pra ter vários
 * goblins com a mesma base mas PV's independentes). Só se aplica na
 * CRIAÇÃO - não mexe em personagens já existentes, pra não arriscar
 * misturar dados de um token que já tenha divergido da ficha original.
 */
/**
 * Disposição do token de fichas novas: criada por JOGADOR = Amigável (e vinculada);
 * criada pelo MESTRE = Hostil. Não mexe se a ficha já vier com a disposição definida (importação).
 */
Hooks.on("preCreateActor", (actor, data, options, userId) => {
  if (data.type !== "personagem" && data.type !== "npc") return;
  if (data.prototypeToken?.disposition !== undefined) return;
  const criador = game.users.get(userId);
  const amigavel = criador && !criador.isGM;
  actor.updateSource({ "prototypeToken.disposition": amigavel ? CONST.TOKEN_DISPOSITIONS.FRIENDLY : CONST.TOKEN_DISPOSITIONS.HOSTILE });
});

Hooks.on("preCreateActor", (actor, data) => {
  if (data.type !== "personagem") return;
  if (data.prototypeToken?.actorLink !== undefined) return; // já veio definido explicitamente (ex: importado) - não sobrescreve
  actor.updateSource({ "prototypeToken.actorLink": true });
});

/**
 * Preenche Vida/Mana/Estamina de Combate/Dados de Destino no MÁXIMO já
 * na CRIAÇÃO de qualquer Ator (personagem OU npc) - sem isso, um Ator
 * novo nasce com esses 4 recursos em 0/0 (o motor só recalcula ".max"
 * sozinho a partir dos atributos; ".value" nunca é tocado automaticamente
 * - ver docs/guia-criacao-ia.md, seção 3). "Estresse" fica de fora de
 * propósito (0 é o valor CORRETO pra nascer, não "cheio").
 *
 * Só usa os ATRIBUTOS - nenhum item existe ainda neste exato momento da
 * criação (Pigmentos/Efeitos são adicionados DEPOIS, como itens
 * separados), então é o melhor cálculo possível "no nascimento". Se o
 * Pigmento/Efeito aumentar o máximo depois, o "value" NÃO acompanha
 * sozinho de propósito (curar automaticamente toda vez que o máximo
 * sobe seria estranho no meio de um combate) - ver
 * naurenPreencherRecursosNoMaximo pra sincronizar de propósito depois de
 * itens serem adicionados (usado pela semeadura de Bestiário/Mascotes).
 *
 * Nunca sobrescreve um valor que já veio definido explicitamente (ex:
 * um JSON importado que já trouxe o número certo, ou minha própria
 * semeadura passando vida/mana já prontos).
 */
Hooks.on("preCreateActor", (actor, data) => {
  if (data.type !== "personagem" && data.type !== "npc") return;
  const sys = actor.system;
  const attr = sys.atributos;
  const vidaCalculada = calcularVidaBase(sys);
  const manaCalculada = sys.espirito.max;
  const estaminaCalculada = attr.estamina.value;
  const destinoCalculado = attr.destino.value;

  const jaTemValor = (campo) => foundry.utils.getProperty(data, `system.${campo}.value`) !== undefined;
  const atualizacoes = {};
  if (!jaTemValor("vida")) { atualizacoes["system.vida.value"] = vidaCalculada; atualizacoes["system.vida.max"] = vidaCalculada; }
  if (!jaTemValor("mana")) { atualizacoes["system.mana.value"] = manaCalculada; atualizacoes["system.mana.max"] = manaCalculada; }
  if (!jaTemValor("estaminaCombate")) { atualizacoes["system.estaminaCombate.value"] = estaminaCalculada; atualizacoes["system.estaminaCombate.max"] = estaminaCalculada; }
  if (!jaTemValor("dadosDestino")) { atualizacoes["system.dadosDestino.value"] = destinoCalculado; atualizacoes["system.dadosDestino.max"] = destinoCalculado; }
  if (Object.keys(atualizacoes).length) actor.updateSource(atualizacoes);
});

/**
 * Sincroniza Vida/Mana/Estamina de Combate/Dados de Destino pro MÁXIMO
 * ATUAL do Ator (lendo direto de actor.system.X.max, já recalculado
 * pelo motor com Pigmentos/Efeitos/Condições incluídos) - chamar UMA
 * vez, logo depois de criar um Ator novo E já ter adicionado todos os
 * itens iniciais dele (Pigmentos inclusos). Nunca recalcula a fórmula
 * na mão (evita o erro de esquecer um bônus) - só copia o que o próprio
 * sistema já calculou certo.
 */
async function naurenPreencherRecursosNoMaximo(actor) {
  const sys = actor.system;
  await actor.update({
    "system.vida.value": sys.vida.max,
    "system.mana.value": sys.mana.max,
    "system.estaminaCombate.value": sys.estaminaCombate.max,
    "system.dadosDestino.value": sys.dadosDestino.max
  });
}

Hooks.on("createItem", (item, options, userId) => {
  if (userId !== game.user.id) return;
  if (!item.parent || !item.system.usaConcederItem || !(item.system.concederItemUuid || (item.system.concederItensUuids ?? []).some(Boolean))) return;
  // Peculiaridade E Condição usam o MESMO mecanismo (ver
  // NaurenPeculiaridadeData/NaurenCondicaoData > usaConcederItem) - cada
  // tipo guarda sua própria flag de origem (nomes diferentes, histórico:
  // Peculiaridade já existia antes de Condição ganhar isto, então manter
  // "origemPeculiaridadeUuid" intacto pra não quebrar concessões já
  // feitas em fichas existentes).
  const tipoValido = item.type === "peculiaridade" || item.type === "condicao";
  if (!tipoValido) return;
  const flagOrigem = item.type === "peculiaridade" ? "origemPeculiaridadeUuid" : "origemCondicaoConcessaoUuid";
  (async () => {
    // Caso simples (diferente de "NaurenConcessaoHelper.concederItem",
    // que exige um "historico" de nível de Classe que Peculiaridade não
    // tem): concede o item companheiro (ex: "Garras/Presas" do
    // Benefício "Feroz", ou de uma Forma de Druida) só na PRIMEIRA vez,
    // checando se já existe uma cópia com a flag de origem apontando pra
    // ESTA cópia específica (uuid do item, não do compêndio) - evita
    // duplicar se o Foundry disparar o hook mais de uma vez, ou se o
    // item for duplicado/movido.
    const jaConcedeu = item.parent.items.some(i => i.getFlag("nauren", flagOrigem) === item.uuid);
    if (jaConcedeu) return;
    const uuids = [item.system.concederItemUuid, ...(item.system.concederItensUuids ?? [])].filter(Boolean);
    const criar = [];
    for (const uuid of uuids) {
      const fonte = await fromUuid(uuid).catch(() => null);
      if (!fonte) { console.warn(`Nauren RPG | "${item.name}": item concedido "${uuid}" não encontrado.`); continue; }
      const dados = fonte.toObject();
      delete dados._id;
      foundry.utils.setProperty(dados, `flags.nauren.${flagOrigem}`, item.uuid);
      criar.push(dados);
    }
    if (!criar.length) return;
    await item.parent.createEmbeddedDocuments("Item", criar);
    naurenPostarCard({ ator: item.parent, titulo: item.name, icone: item.img, fonte: "Concessão",
      linhas: [{ label: "Recebeu", value: criar.map(d => d.name).join(", "), breakdown: "removido(s) quando esta Condição sair" }] });
  })().catch(err => console.warn("Nauren RPG | Falha ao conceder item companheiro.", err));
});

// Par do hook "createItem" acima: ao remover uma Peculiaridade OU
// Condição que concedeu um item companheiro (ex: Feroz -> Garras/Presas,
// ou Forma Senhor da Floresta -> Garras/Presas), remove também esse item
// concedido - senão ele ficava "esquecido" na ficha pra sempre, mesmo
// depois da origem sumir (bug encontrado no Criador de Personagem:
// escolher e desfazer Feroz não tirava as Garras - o mesmo valia pra uma
// Condição de Forma expirando/sendo removida).
Hooks.on("deleteItem", (item, options, userId) => {
  if (userId !== game.user.id) return;
  if ((item.type !== "peculiaridade" && item.type !== "condicao") || !item.parent) return;
  const flagOrigem = item.type === "peculiaridade" ? "origemPeculiaridadeUuid" : "origemCondicaoConcessaoUuid";
  const concedidos = item.parent.items.filter(i => i.getFlag("nauren", flagOrigem) === item.uuid);
  if (!concedidos.length) return;
  item.parent.deleteEmbeddedDocuments("Item", concedidos.map(i => i.id))
    .catch(err => console.warn("Nauren RPG | Falha ao remover item companheiro.", err));
});

Hooks.on("createItem", (item, options, userId) => {
  if (userId !== game.user.id) return;
  if ((item.type !== "subclasse" && item.type !== "classe" && item.type !== "habilidade") || !item.parent) return;
  naurenSincronizarRecursosCustom(item.parent).catch(err => console.warn("Nauren RPG | Falha ao sincronizar recursos customizados (criação).", err));
});

Hooks.on("updateItem", (item, changes, options, userId) => {
  if (userId !== game.user.id) return;
  if ((item.type !== "subclasse" && item.type !== "classe" && item.type !== "habilidade") || !item.parent) return;
  if (changes.system?.recursosDeclarados !== undefined) {
    naurenSincronizarRecursosCustom(item.parent).catch(err => console.warn("Nauren RPG | Falha ao sincronizar recursos customizados (edição).", err));
  }
});

/** Tira o ícone (Efeito Ativo) de uma Condição do token - e, com ele, a animação persistente dela. */
async function naurenRemoverIconeDaCondicao(item) {
  const actor = item.parent;
  const statusId = `nauren-cond-${item.id}`;
  if (!actor?.statuses?.has(statusId)) return;
  naurenRegistrarStatusDeCondicao(item);
  await actor.toggleStatusEffect(statusId, { active: false }).catch(err => console.warn("Nauren RPG | Falha ao remover ícone da condição.", err));
}
function naurenCondicaoMostraIcone(item) { return item.system.ativo !== false && !naurenEhCondicaoModelo(item); }
// Ícones que sobraram de Condições inativas ou modelos (antes da 0.68.3 elas mostravam ícone): limpa ao abrir.
Hooks.once("ready", () => {
  if (game.users.activeGM !== game.user) return;
  setTimeout(async () => {
    const atores = [...game.actors];
    for (const cena of game.scenes) for (const t of cena.tokens) if (!t.actorLink && t.actor) atores.push(t.actor);
    for (const a of atores) for (const i of a.items) {
      if (i.type === "condicao" && !naurenCondicaoMostraIcone(i) && a.statuses?.has(`nauren-cond-${i.id}`)) await naurenRemoverIconeDaCondicao(i);
    }
  }, 7000);
});

Hooks.on("createItem", (item, options, userId) => {
  if (userId !== game.user.id) return;
  if (item.type !== "condicao" || !item.parent) return;
  // Faltava este gancho (só existia o "updateItem" abaixo, que só cobre
  // uma Condição JÁ EXISTENTE mudando de nome/imagem/acúmulos) - sem
  // isto, o ícone pequeno de status nunca aparecia no token na
  // primeira vez que a Condição era aplicada (ex: via popup de reação
  // "gastar recurso pra evitar" ou qualquer outro caminho que cria o
  // item do zero), só depois de uma atualização posterior disparar o
  // outro hook por acidente.
  if (naurenCondicaoMostraIcone(item)) naurenSincronizarIconeDaCondicao(item);
});

Hooks.on("updateItem", (item, changes, options, userId) => {
  if (userId !== game.user.id) return;
  if (item.type !== "condicao" || !item.parent) return;
  // Desligar pelo raio tira o ícone (e a animação); religar recria (e a animação toca de novo).
  if (foundry.utils.hasProperty(changes, "system.ativo")) {
    if (naurenCondicaoMostraIcone(item)) naurenSincronizarIconeDaCondicao(item); else naurenRemoverIconeDaCondicao(item);
    return;
  }
  if (!naurenCondicaoMostraIcone(item)) return;
  // Só re-sincroniza quando algo visível mudou (nome, imagem ou acúmulos)
  if (changes.name !== undefined || changes.img !== undefined || changes.system?.acumulos !== undefined) {
    naurenSincronizarIconeDaCondicao(item);
  }
});

/**
 * Sincroniza a COR de toda Região no mapa (de qualquer cena) que tenha
 * sido criada a partir deste item (ver flag "nauren.origemTemplate",
 * gravada em NaurenRegionHelper.colocarArea) sempre que o jogador mudar
 * "templateCor" de alguma Ação, ou "emanacaoCor" do item, DEPOIS da área
 * já estar colocada no mapa - sem isso, a única forma de ver a cor nova
 * era apagar a área existente e usar a Ação de novo.
 */
Hooks.on("updateItem", async (item, changes, options, userId) => {
  if (userId !== game.user.id) return;
  if (!game.user.isGM) return;
  const mudouAlgumaAcao = changes.system?.acoes !== undefined;
  const mudouEmanacao = changes.system?.emanacaoCor !== undefined;
  if (!mudouAlgumaAcao && !mudouEmanacao) return;

  for (const cena of game.scenes) {
    const regioesDoItem = cena.regions.filter(r => r.getFlag("nauren", "origemTemplate")?.itemUuid === item.uuid);
    if (!regioesDoItem.length) continue;
    for (const regiao of regioesDoItem) {
      const origem = regiao.getFlag("nauren", "origemTemplate");
      const novaCor = origem.ehEmanacao
        ? item.system.emanacaoCor
        : (item.system.acoes ?? []).find(a => a.usaTemplate)?.templateCor;
      if (novaCor && novaCor !== regiao.color) await regiao.update({ color: novaCor });
    }
  }
});

Hooks.on("deleteItem", (item, options, userId) => {
  if (userId !== game.user.id) return;
  if (item.type !== "condicao" || !item.parent) return;
  const statusId = `nauren-cond-${item.id}`;
  if (item.parent.statuses?.has(statusId)) {
    // Garante o registro em CONFIG.statusEffects ANTES de tentar remover -
    // defesa extra além da restauração no "ready" (ver Hooks.once("ready")
    // mais acima): mesmo que algum cenário futuro não passe por aquela
    // restauração (ex: Ator criado por outro processo sem passar pelo
    // fluxo normal), remover nunca falha com "Invalid status ID" por
    // causa disso - toggleStatusEffect exige que o ID já esteja
    // registrado, mesmo que o Ator já tenha esse status ativo.
    naurenRegistrarStatusDeCondicao(item);
    // Remove só os Efeitos que ainda existem (duas remoções ao mesmo tempo davam "does not exist").
    const ator = item.parent;
    const ids = ator.effects.filter(e => e.statuses?.has(statusId)).map(e => e.id);
    if (ids.length) ator.deleteEmbeddedDocuments("ActiveEffect", ids.filter(id => ator.effects.has(id))).catch(() => {});
  }
});

/**
 * Transformação de Token (Condição/Efeito com usaTransformacao) - os 3
 * momentos do ciclo de vida: criada/ativada aplica a nova imagem/tamanho;
 * desativada ("Ativo" desmarcado) ou apagada (lixeira, duração expirando)
 * reverte pro original. Cobre "condicao" e "efeito", já que os dois
 * passam pelo mesmo NaurenAlvoHelper.aplicarCondicao.
 */
Hooks.on("createItem", (item, options, userId) => {
  if (userId !== game.user.id) return;
  if ((item.type !== "condicao" && item.type !== "efeito") || !item.parent) return;
  if (!item.system.usaTransformacao || !item.system.ativo) return;
  naurenAplicarTransformacaoToken(item).catch(err => console.warn("Nauren RPG | Falha ao aplicar Transformação de Token (criação).", err));
});

Hooks.on("updateItem", (item, changes, options, userId) => {
  if (userId !== game.user.id) return;
  if ((item.type !== "condicao" && item.type !== "efeito") || !item.parent) return;
  if (!item.system.usaTransformacao || changes.system?.ativo === undefined) return;
  if (changes.system.ativo) {
    naurenAplicarTransformacaoToken(item).catch(err => console.warn("Nauren RPG | Falha ao aplicar Transformação de Token (ativação).", err));
  } else {
    naurenReverterTransformacaoToken(item).catch(err => console.warn("Nauren RPG | Falha ao reverter Transformação de Token (desativação).", err));
  }
});

Hooks.on("deleteItem", (item, options, userId) => {
  if (userId !== game.user.id) return;
  if ((item.type !== "condicao" && item.type !== "efeito") || !item.parent) return;
  if (!item.system.usaTransformacao) return;
  naurenReverterTransformacaoToken(item).catch(err => console.warn("Nauren RPG | Falha ao reverter Transformação de Token (remoção).", err));
});

/**
 * Remover uma Subclasse ou Classe do personagem faz a mesma cascata segura
 * de naurenSincronizarRecursosCustom/onRemoveRecurso: qualquer recurso
 * customizado dela que ainda esteja intocado (valor 0) some junto da
 * ficha; qualquer um com valor acumulado fica pra trás, com aviso,
 * pra nunca apagar progresso do jogador sem querer.
 */
Hooks.on("deleteItem", async (item, options, userId) => {
  if (userId !== game.user.id) return;
  if ((item.type !== "subclasse" && item.type !== "classe") || !item.parent) return;
  const declarados = (item.system.recursosDeclarados ?? []).filter(r => r.id);
  if (!declarados.length) return;

  const actor = item.parent;
  const recursosAtuais = foundry.utils.deepClone(actor.system.recursosCustom ?? []);
  const mantidosComValor = [];
  let mudou = false;
  const restantes = recursosAtuais.filter(r => {
    const declarado = r.chaveInterna
      ? declarados.find(d => d.chaveInterna === r.chaveInterna)
      : declarados.find(d => d.id === r.id); // fallback pra dado antigo sem chaveInterna ainda
    if (!declarado) return true; // não é desta Subclasse - mantém
    if ((r.valor ?? 0) === 0) { mudou = true; return false; } // intocado - remove
    mantidosComValor.push(r.nome || r.id); // tem progresso - mantém e avisa
    return true;
  });
  if (mudou) await actor.update({ "system.recursosCustom": restantes });
  if (mantidosComValor.length) {
    ui.notifications.warn(`${actor.name}: ${mantidosComValor.join(", ")} já tinha valor acumulado - não foi removido junto da Subclasse. Remova manualmente na ficha, se quiser.`);
  }
});


export { NAUREN_CAMPOS_ESTADO_ACAO, NAUREN_CAMPOS_ESTADO_ITEM, NAUREN_QUERY_AREA_AO_CRIAR, NAUREN_QUERY_DANO_COLISAO, NAUREN_QUERY_PRESENCA, NAUREN_QUERY_RESISTIR_AREA, NAUREN_SEEDS_LIVRO_08, naurenAplicarAreaEmTokens, naurenAplicarEfeitoTemplatePersistente, naurenAplicarEfeitoTemplatePersistenteBase, naurenAplicarTransformacaoToken, naurenAtorTemRecurso, naurenAtualizarCondicaoPresenca, naurenAtualizarItemDeMonstro, naurenAurasDeEstaminaSobreMim, naurenAvisarRoubo, naurenBuscarMascotesDe, naurenCalcularEmpurrao, naurenCelulasCobertas, naurenCelulasNaArea, naurenChecarCondicaoAoAtingirMax, naurenClamparRecursosAoMaximo, naurenColetarGatilhosTemplatePersistenteExternos, naurenConcederRecurso, naurenConcederRecursoAoAtacante, naurenCondicaoMostraIcone, naurenConfigurarSplatter, naurenDisjuntorGatilhos, naurenEmpurrarToken, naurenEmpurrarViaMestre, naurenGatilhosPorExecucao, naurenGravarMemoriaVida, naurenHandleQueryAreaAoCriar, naurenHandleQueryDanoColisao, naurenHandleQueryPresenca, naurenHandleQueryResistirArea, naurenMigrarAcimaSoContraAlvoV1, naurenMigrarAmbidestria0927, naurenMigrarBandoExtra09423, naurenMigrarBorda09224, naurenMigrarCacador09218, naurenMigrarCacador09219, naurenMigrarCaligrafiaV1, naurenMigrarCamadasSubclasseV1, naurenMigrarCatalisadorSemPesadoV1, naurenMigrarCustoMedoV1, naurenMigrarDisposicaoJogadoresV1, naurenMigrarDruida09214, naurenMigrarEfeitoPermanenteV1, naurenMigrarEmpireo09211, naurenMigrarEscudoDeMana0925, naurenMigrarGuerreiro09216, naurenMigrarGuerreiro09217, naurenMigrarHabilidadesMonstros09241, naurenMigrarImpetoFadigaCustoV1, naurenMigrarLacunas09240, naurenMigrarLadinoEstudosV1, naurenMigrarLadinoRevisaoV1, naurenMigrarLivro08ItensV1, naurenMigrarLivro08PequenasV1, naurenMigrarMagoAntigoV1, naurenMigrarMarcaCacadorV1, naurenMigrarMisticoRevisaoV1, naurenMigrarMotion09416, naurenMigrarMunicaoSemCuraV1, naurenMigrarPrereqColunaEsquerdaV1, naurenMigrarRegras0926, naurenMigrarRevisaoClasses092, naurenMigrarRevisaoMago0924, naurenMigrarSabedoria09215, naurenMigrarSacerdote09238, naurenMigrarSacerdote09239, naurenMigrarSanatio09413, naurenNomeRecurso, naurenOferecerSincronizacaoDeVersao, naurenPontoDentroDaRegiao, naurenPreencherRecursosNoMaximo, naurenProcessarEmanacoes, naurenProcessarEmanacoesSobre, naurenProcessarGatilhos, naurenProcessarGatilhosInterno, naurenProcessarTemplatesPersistentes, naurenRankDaCondicaoPeloPortador, naurenReaplicarUpgradesDeSubclasse, naurenReconciliarItemComCompendio, naurenReconciliarTodosOsItens, naurenReconjurarPendente, naurenRecursoEstaTravado, naurenRegistrarStatusDeCondicao, naurenRemoverIconeDaCondicao, naurenReverterTransformacaoToken, naurenRolarValoresTemplatePersistente, naurenSincronizarIconeDaCondicao, naurenSincronizarNivelDosMascotes, naurenSincronizarRecursosCustom, naurenTokenElegivelPorDisposicao, naurenTransferirRecursoDoAlvo };
