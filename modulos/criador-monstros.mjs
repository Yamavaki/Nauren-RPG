/* Nauren RPG — Habilidades de monstros e Criador de Monstros e NPCs. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { NAUREN_HAB_MONSTROS, NAUREN_HAB_MONSTROS_VERSAO } from "../data/habilidades-monstros.mjs";
import { naurenFixarTipoAlcanceSemeado, naurenUuidPorSeed } from "./entidades-campo.mjs";
import { NAUREN_PACKS_DEFINICAO, NAUREN_SEED_IDS_EQUIPAMENTO_INICIAL, naurenCorrigirIconesSemeados, naurenMigrarAlvejadoArcos, naurenMigrarCanalizarPorNivel, naurenMigrarLoucuraManual, naurenObterOuCriarPacks, naurenSemearArmaduras, naurenSemearArmas, naurenSemearArmasDisparoCarregado, naurenSemearArmasModeloSubclasse, naurenSemearBestiario, naurenSemearClasseCacador, naurenSemearClasseDruida, naurenSemearClasseEmpireo, naurenSemearClasseGuerreiro, naurenSemearClasseLadino, naurenSemearClasseMago, naurenSemearClasseMistico, naurenSemearClasseSacerdote, naurenSemearCondicoes, naurenSemearEfeitosGuardas, naurenSemearEquipamentos, naurenSemearEscritos, naurenSemearHabilidadeDarPrioridade, naurenSemearHabilidadeGrimorio, naurenSemearHabilidadesCacador, naurenSemearHabilidadesDruida, naurenSemearHabilidadesEmpireo, naurenSemearHabilidadesGuerreiro, naurenSemearHabilidadesLadino, naurenSemearHabilidadesMistico, naurenSemearHabilidadesSacerdote, naurenSemearMagias, naurenSemearMascotes, naurenSemearMunicoes, naurenSemearPeculiaridades, naurenSemearPigmentos, naurenSemearRegras, naurenSemearRemedioEFrascos, naurenSemearSubclasseCacador, naurenSemearSubclasseDruida, naurenSemearSubclasseEmpireo, naurenSemearSubclasseGuerreiro, naurenSemearSubclasseLadino, naurenSemearSubclasseMago, naurenSemearSubclasseMistico, naurenSemearSubclasseSacerdote, naurenSemearTorre } from "./compendios.mjs";
import { naurenSemearClasseInventor } from "./inventor.mjs";
import { naurenMigrarCorpoDePedraV1, naurenMigrarExtensaoImagemFundoSubclasse, naurenMigrarImagemFundoSubclasse } from "./relogio-condicoes.mjs";
import { naurenKitSistema } from "./janelas-kit.mjs";
import { naurenConfigurarSplatter, naurenMigrarAcimaSoContraAlvoV1, naurenMigrarAmbidestria0927, naurenMigrarBandoExtra09423, naurenMigrarBorda09224, naurenMigrarCacador09218, naurenMigrarCacador09219, naurenMigrarCaligrafiaV1, naurenMigrarCamadasSubclasseV1, naurenMigrarCatalisadorSemPesadoV1, naurenMigrarCustoMedoV1, naurenMigrarDisposicaoJogadoresV1, naurenMigrarDruida09214, naurenMigrarEfeitoPermanenteV1, naurenMigrarEmpireo09211, naurenMigrarEscudoDeMana0925, naurenMigrarGuerreiro09216, naurenMigrarGuerreiro09217, naurenMigrarHabilidadesMonstros09241, naurenMigrarImpetoFadigaCustoV1, naurenMigrarLacunas09240, naurenMigrarLadinoEstudosV1, naurenMigrarLadinoRevisaoV1, naurenMigrarLivro08ItensV1, naurenMigrarLivro08PequenasV1, naurenMigrarMagoAntigoV1, naurenMigrarMarcaCacadorV1, naurenMigrarMisticoRevisaoV1, naurenMigrarMotion09416, naurenMigrarMunicaoSemCuraV1, naurenMigrarPrereqColunaEsquerdaV1, naurenMigrarRegras0926, naurenMigrarRevisaoClasses092, naurenMigrarRevisaoMago0924, naurenMigrarSabedoria09215, naurenMigrarSacerdote09238, naurenMigrarSacerdote09239, naurenMigrarSanatio09413, naurenOferecerSincronizacaoDeVersao, naurenPreencherRecursosNoMaximo } from "./icone-condicao-token.mjs";
import { naurenMigrarLojaRestaurar0977, naurenMigrarXpTotal0962 } from "./barras-token.mjs";
import { naurenMigrarCondicoesAuditoria, naurenMigrarPesoEscudos, naurenMigrarQueimandoPorAcumulo, naurenMigrarTintaEnergetica, naurenMigrarVenenos } from "./entrega-itens.mjs";
import { naurenEscalaPorCategoria, naurenValorBasePorNivel } from "../nauren.mjs";
import { naurenAbrirBorda, naurenAvisarSeLinkBloqueado } from "./borda-token.mjs";
import { naurenMontarDescricao } from "./prioridades.mjs";

// 0.94.22: roda na lista de migrações, depois dos compêndios (ver "naurenPassosDeMigracao").

// 0.94.22: ANIMAÇÕES (Automated Animations, Motion, cor do token, som) foram para modulos/animacoes.mjs.

/* Condições: o Nauren já cria um Efeito Ativo com o nome de cada Condição (ícone do token, ver
   naurenSincronizarIconeDaCondicao). O Automated Animations anima pelo nome desse Efeito Ativo,
   na categoria Active Effects - não precisa de espelho (um espelho tocaria a animação em dobro). */

/* =======================================
 * HABILIDADES DE MONSTROS (Criador de Monstros, 0.81)
 * =======================================
 * ~500 Habilidades prontas (catálogo + variantes de elemento, forma e tamanho),
 * num compêndio próprio com uma pasta por família. Os dados vêm de
 * "data/habilidades-monstros.mjs" (gerado). Referências:
 *   "cond:<seedId>" -> Condição do compêndio de Condições
 *   "hm:<chave>"    -> Estado criado na pasta "Estados das Habilidades" deste compêndio
 * Versionado: só reescreve quando NAUREN_HAB_MONSTROS_VERSAO muda (ou falta algo).
 */
async function naurenSemearHabilidadesMonstros(packs) {
  const pack = packs.habMonstros;
  if (!pack || !game.user.isGM) return;
  const dados = NAUREN_HAB_MONSTROS;
  const VERSAO = NAUREN_HAB_MONSTROS_VERSAO;
  const existentes = await pack.getDocuments();
  const porChave = new Map(), porEstado = new Map();
  for (const d of existentes) {
    const k = d.getFlag("nauren", "habMonstro")?.id; if (k) porChave.set(k, d);
    const e = d.getFlag("nauren", "habMonstroEstado"); if (e) porEstado.set(e, d);
  }
  const emDia = d => d?.getFlag("nauren", "habMonstroVersao") === VERSAO;
  if (dados.habilidades.every(h => emDia(porChave.get(h.chave))) && Object.keys(dados.estados).every(k => emDia(porEstado.get(k)))) return;
  console.log(`Nauren RPG | Habilidades de Monstros: atualizando para a versão ${VERSAO}...`);

  const PASTA_ESTADOS = "Estados das Habilidades";
  const Folder_ = getDocumentClass("Folder");
  const pastas = {};
  for (const nome of [...dados.pastas, PASTA_ESTADOS]) {
    let f = pack.folders.find(x => x.name === nome);
    if (!f) f = await Folder_.create({ name: nome, type: "Item", sorting: "a" }, { pack: pack.collection });
    pastas[nome] = f.id;
  }
  const packCond = packs.condicoes;
  await packCond.getIndex({ fields: ["flags.nauren.seedId"] });
  const uuidCond = seed => {
    const e = packCond.index.find(i => i.flags?.nauren?.seedId === seed);
    if (!e) console.warn(`Nauren RPG | Habilidades de Monstros: Condição "${seed}" não encontrada.`);
    return e ? `Compendium.${packCond.collection}.Item.${e._id}` : "";
  };
  const uuidEstado = {};
  const resolver = v => {
    if (typeof v === "string") {
      if (v.startsWith("cond:")) return uuidCond(v.slice(5));
      if (v.startsWith("hm:")) return uuidEstado[v.slice(3)] ?? "";
      return v;
    }
    if (Array.isArray(v)) return v.map(resolver);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolver(x)]));
    return v;
  };
  const Item_ = getDocumentClass("Item");
  const gravar = async (lista) => {
    const criar = [], atualizar = [];
    for (const { doc, dados: dd } of lista) {
      if (doc && doc.type === dd.type) atualizar.push({ ...dd, _id: doc.id });
      else criar.push(dd);
    }
    const feitos = [];
    for (let i = 0; i < atualizar.length; i += 100) feitos.push(...await Item_.updateDocuments(atualizar.slice(i, i + 100), { pack: pack.collection, diff: false, recursive: false }));
    for (let i = 0; i < criar.length; i += 100) feitos.push(...await Item_.createDocuments(criar.slice(i, i + 100), { pack: pack.collection }));
    return feitos;
  };

  // 1) Estados (Condições próprias das habilidades): primeiro, para as habilidades apontarem para eles.
  const listaEstados = Object.entries(dados.estados).map(([chave, e]) => ({
    doc: porEstado.get(chave),
    dados: { name: e.name, type: "condicao", img: e.img, folder: pastas[PASTA_ESTADOS], system: resolver(foundry.utils.deepClone(e.system)),
      flags: { nauren: { habMonstroEstado: chave, habMonstroVersao: VERSAO } } }
  }));
  for (const d of await gravar(listaEstados)) uuidEstado[d.getFlag("nauren", "habMonstroEstado")] = d.uuid;
  // Estados que citam outros estados (raro): segunda passada só nos campos com "hm:".
  const segunda = listaEstados.filter(x => JSON.stringify(dados.estados[x.dados.flags.nauren.habMonstroEstado].system).includes('"hm:'));
  if (segunda.length) {
    const docs = (await pack.getDocuments()).filter(d => segunda.some(x => x.dados.flags.nauren.habMonstroEstado === d.getFlag("nauren", "habMonstroEstado")));
    await Item_.updateDocuments(docs.map(d => ({ _id: d.id, system: resolver(foundry.utils.deepClone(dados.estados[d.getFlag("nauren", "habMonstroEstado")].system)) })), { pack: pack.collection });
  }

  // Estados que saíram do gerador (ex.: o Sonolento próprio virou a Condição do sistema na 0.94):
  // apaga do compêndio para não aparecerem dois com o mesmo nome no Criador de Monstros.
  const estadosVelhos = [...porEstado.entries()].filter(([k]) => !(k in dados.estados)).map(([, d]) => d.id);
  if (estadosVelhos.length) await Item_.deleteDocuments(estadosVelhos, { pack: pack.collection }).catch(err => console.warn("Nauren RPG | Estados antigos", err));

  // 2) Habilidades
  const listaHab = dados.habilidades.map(h => {
    const system = resolver(foundry.utils.deepClone(h.system));
    naurenFixarTipoAlcanceSemeado({ name: h.nome, type: "habilidade", system });
    return { doc: porChave.get(h.chave), dados: { name: h.nome, type: "habilidade", img: h.img, folder: pastas[h.pasta], system,
      flags: { nauren: { habMonstro: h.meta, habMonstroVersao: VERSAO } } } };
  });
  await gravar(listaHab);
  console.log(`Nauren RPG | Habilidades de Monstros: ${listaHab.length} habilidades e ${listaEstados.length} estados prontos.`);
}


async function naurenSemearTudo() {
  const packs = await naurenObterOuCriarPacks();
  await naurenSemearRegras(packs.regras).catch(err => console.error("Nauren RPG | Falha ao criar o diário de regras.", err));
  await naurenSemearArmaduras(packs.armaduras);
  await naurenSemearArmas(packs.armas);
  await naurenSemearMunicoes(packs.armas);
  await naurenSemearPeculiaridades(packs.peculiaridades);
  await naurenSemearCondicoes(packs.condicoes);
  await naurenSemearRemedioEFrascos(packs.armas, packs.condicoes);
  // Depois das Condições de propósito: as armas-modelo referenciam
  // Fragmentado/Sangramento/Estudado por UUID, então elas precisam já
  // existir no compêndio (senão, na 1ª execução do mundo, viriam vazias).
  const armasModelo = await naurenSemearArmasModeloSubclasse(packs.armas, packs.condicoes);
  await naurenSemearMagias(packs.magias, packs.condicoes);
  const uuidDarPrioridade = await naurenSemearHabilidadeDarPrioridade(packs.habilidades);
  const efeitosGuardas = await naurenSemearEfeitosGuardas(packs.efeitos);
  await naurenSemearPigmentos(packs.pigmentos);
  await naurenSemearEquipamentos(packs.equipamentos).catch(err => console.error("Nauren RPG | Falha ao criar os Equipamentos.", err));
  await naurenSemearEscritos(packs.equipamentos).catch(err => console.error("Nauren RPG | Falha ao criar os Escritos.", err));
  await naurenSemearMascotes(packs.mascotes, packs.condicoes);
  await naurenSemearBestiario(packs.monstros, packs.condicoes, packs.pigmentos);
  const habilidadesGuerreiro = await naurenSemearHabilidadesGuerreiro(packs.habilidades, packs.condicoes, efeitosGuardas);
  await naurenSemearClasseGuerreiro(packs.classes, habilidadesGuerreiro, uuidDarPrioridade, efeitosGuardas);
  await naurenSemearSubclasseGuerreiro(packs.subclasses, packs.habilidades, packs.condicoes, uuidDarPrioridade, armasModelo);
  const habilidadesLadino = await naurenSemearHabilidadesLadino(packs.habilidades, packs.condicoes, packs.efeitos);
  await naurenSemearClasseLadino(packs.classes, habilidadesLadino, uuidDarPrioridade);
  await naurenSemearSubclasseLadino(packs.subclasses, packs.habilidades, packs.condicoes, habilidadesLadino, armasModelo);
  const habilidadesMistico = await naurenSemearHabilidadesMistico(packs.habilidades, packs.condicoes);
  await naurenSemearClasseMistico(packs.classes, habilidadesMistico, uuidDarPrioridade);
  await naurenSemearSubclasseMistico(packs.subclasses, packs.habilidades, packs.condicoes, habilidadesMistico);
  const habilidadesEmpireo = await naurenSemearHabilidadesEmpireo(packs.habilidades, packs.condicoes);
  await naurenSemearClasseEmpireo(packs.classes, habilidadesEmpireo, uuidDarPrioridade, packs.condicoes);
  await naurenSemearSubclasseEmpireo(packs.subclasses, packs.habilidades, packs.condicoes, uuidDarPrioridade);
  const habilidadesCacador = await naurenSemearHabilidadesCacador(packs.habilidades, packs.condicoes, packs.efeitos);
  const armasDisparoCarregado = await naurenSemearArmasDisparoCarregado(packs.armas);
  await naurenSemearClasseCacador(packs.classes, habilidadesCacador, uuidDarPrioridade, armasDisparoCarregado);
  await naurenSemearSubclasseCacador(packs.subclasses, packs.habilidades, packs.condicoes, habilidadesCacador, armasDisparoCarregado);
  const uuidGrimorio = await naurenSemearHabilidadeGrimorio(packs.habilidades);
  await naurenSemearClasseMago(packs.classes, uuidGrimorio, uuidDarPrioridade, packs.magias, packs.habilidades);
  await naurenSemearSubclasseMago(packs.subclasses, packs.habilidades, packs.condicoes, packs.magias);
  const habilidadesSacerdote = await naurenSemearHabilidadesSacerdote(packs.habilidades, packs.condicoes);
  await naurenSemearClasseSacerdote(packs.classes, habilidadesSacerdote, uuidDarPrioridade);
  await naurenSemearSubclasseSacerdote(packs.subclasses, packs.habilidades, packs.condicoes, habilidadesSacerdote, armasModelo);
  const habilidadesDruida = await naurenSemearHabilidadesDruida(packs.habilidades, packs.condicoes);
  await naurenSemearClasseDruida(packs.classes, habilidadesDruida, uuidDarPrioridade);
  await naurenSemearSubclasseDruida(packs.subclasses, packs.habilidades, packs.condicoes);
  await naurenSemearClasseInventor(packs, uuidDarPrioridade).catch(err => console.error("Nauren RPG | Falha ao criar a classe Inventor.", err));
  await naurenCorrigirIconesSemeados(packs);
  // Sempre por último: agrupa (ou reagrupa) todos os compêndios oficiais
  // do Nauren numa única Pasta de Compêndio chamada "Nauren" na barra
  // lateral - puramente visual/organizacional, nunca toca no "name"
  // interno de nenhum compêndio, então nenhum UUID (Compendium.nauren...)
  // é afetado por isso, nem antes nem depois de mover.
  await naurenGarantirPastaDosCompendios(packs);
  // Roda por último: precisa que TODAS as Subclasses já tenham sido
  // semeadas (novas já nascem com o caminho certo) - essa migração só
  // cuida de quem já existia ANTES desta convenção, com "imagemFundo" vazio.
  if (game.users.activeGM === game.user) {
    naurenMigrarImagemFundoSubclasse(packs);
    naurenMigrarExtensaoImagemFundoSubclasse(packs);
    naurenMigrarCorpoDePedraV1(packs);
  }
  await naurenSemearTorre(packs).catch(err => console.error("Nauren RPG | Falha ao criar os Itens da Torre Infinita.", err));
  await naurenSemearHabilidadesMonstros(packs).catch(err => console.error("Nauren RPG | Falha ao criar as Habilidades de Monstros.", err));
  return packs;
}


/**
 * Agrupa (ou reagrupa) TODOS os compêndios oficiais do Nauren numa única
 * Pasta de Compêndio chamada "Nauren", criando essa Pasta se ainda não
 * existir. Puramente cosmético/organizacional (ver "setFolder" da API do
 * Foundry) - NUNCA muda o "name" interno de nenhum compêndio, então não
 * afeta nenhum UUID (Compendium.nauren.<pack>.Item.<id>) que já exista
 * espalhado por atores/itens/fórmulas. Roda em TODO carregamento do
 * mundo (dentro de naurenSemearTudo), então mesmo que um Mestre mova um
 * compêndio pra fora por engano, ele volta pra dentro da pasta sozinho
 * na próxima vez que o mundo carregar.
 */
async function naurenGarantirPastaDosCompendios(packs) {
  if (!game.user.isGM) return;
  let pastaNauren = game.folders?.find(f => f.type === "Compendium" && f.name === "Nauren");
  if (!pastaNauren) {
    try {
      pastaNauren = await Folder.create({ name: "Nauren", type: "Compendium", color: "#a15c2e" });
    } catch (err) {
      console.warn('Nauren RPG | Não consegui criar a Pasta de Compêndio "Nauren".', err);
      return;
    }
  }
  for (const pack of Object.values(packs)) {
    if (!pack || pack.folder?.id === pastaNauren.id) continue;
    try {
      await pack.setFolder(pastaNauren);
    } catch (err) {
      console.warn(`Nauren RPG | Não consegui mover "${pack.metadata?.label ?? "?"}" pra pasta "Nauren".`, err);
    }
  }
}


/**
 * Utilitário de Mestre: resemeia TODOS os compêndios oficiais do Nauren
 * na versão atual do sistema (ver naurenSemearTudo), sem precisar
 * recarregar a página inteira. Chame via macro/console:
 * game.nauren.resetarCompendios()
 *
 * ATUALIZA no lugar - NUNCA apaga nada antes de resemear. Bug real
 * corrigido, sério: a versão anterior desta função apagava TODO o
 * conteúdo dos compêndios antes de recriar - "naurenGarantirItemNoPack"
 * (o motor da semeadura) já é "achar ou criar" por si só (procura pelo
 * "seedId" antes de criar algo novo), então apagar tudo antes era
 * totalmente inútil E destrutivo: toda vez que um documento é apagado e
 * recriado do zero, o Foundry gera um _id NOVO pra ele - e é esse _id
 * que forma o UUID (Compendium....Item.<id>). Qualquer personagem que já
 * tivesse ganhado uma Habilidade daquele compêndio ficava com
 * "flags.nauren.origemUuid" apontando pro UUID ANTIGO, que deixava de
 * existir - quebrando silenciosamente TODO vínculo com o compêndio pra
 * esse item, em toda ficha que já tinha algo concedido. Era exatamente
 * isso que causava "a ação mudou de nome"/"parece que não funciona mais"
 * mesmo depois de "Ressincronizar com o Compêndio": a reconciliação
 * procurava pelo UUID antigo, nunca achava, e desistia sem avisar nada.
 * Resemear sem apagar primeiro preserva o _id de TUDO que já existia
 * (só atualiza os campos), então nenhum UUID muda e nenhum vínculo
 * quebra - o mesmo resultado de "pegar a versão mais nova", sem o efeito
 * colateral destrutivo. Ver também naurenReconciliarItemComCompendio,
 * que agora também sabe se AUTO-REPARAR num item cujo UUID antigo já
 * tinha ficado orfão de uma execução anterior desta função.
 */
async function naurenResetarCompendios() {
  if (!game.user.isGM) {
    ui.notifications?.warn("Nauren RPG | Somente o Mestre pode atualizar os compêndios.");
    return;
  }
  let confirmar;
  try {
    confirmar = await foundry.applications.api.DialogV2.confirm({ ...naurenKitSistema(),
      window: { title: "Atualizar Compêndios do Nauren" },
      content: "<p>Isso vai atualizar todos os compêndios oficiais do Nauren (Armas, Armaduras, Habilidades, Condições, Magias, Classes, Subclasses, Pigmentos, Mascotes, Bestiário, NPCs de Classe etc.) pra versão atual do sistema, sem apagar nada - cada item já existente é atualizado no lugar (mesmo UUID de sempre), e qualquer item novo é criado.</p><p>Qualquer edição manual feita DIRETO dentro desses compêndios (fora da ficha de um personagem) será substituída pela versão do sistema. Personagens e itens já concedidos a jogadores não são apagados.</p><p>Continuar?</p>",
      modal: true
    });
  } catch (err) {
    confirmar = false;
  }
  if (!confirmar) return;

  ui.notifications.info("Nauren RPG | Atualizando compêndios do Nauren...");
  try {
    await naurenSemearTudo();
    ui.notifications.info("Nauren RPG | Pronto! Compêndios do Nauren atualizados.");
  } catch (err) {
    console.error("Nauren RPG | Falha ao atualizar os compêndios.", err);
    ui.notifications.error("Nauren RPG | Falha ao atualizar os compêndios - veja o console (F12) e recarregue a página pra tentar de novo.");
  }
}


/**
 * Garante que existe uma Macro de Mundo pronta ("Resetar Compêndios do
 * Nauren", ver naurenResetarCompendios) pro Mestre arrastar pra sua
 * hotbar - sem isso, a única forma de chamar a função seria digitando
 * "game.nauren.resetarCompendios()" no console (F12), o que a maioria
 * dos Mestres nunca vai descobrir sozinho. Só cria uma vez (confere pelo
 * nome antes) - se o Mestre apagar a macro de propósito, não insiste
 * recriando a cada load.
 */
async function naurenGarantirMacroDeReset() {
  if (!game.user.isGM) return;
  const jaExiste = game.macros?.find(m => m.name === "Resetar Compêndios do Nauren");
  if (jaExiste) return;
  try {
    await Macro.create({
      name: "Resetar Compêndios do Nauren",
      type: "script",
      img: "icons/sundries/books/book-backed-silver-red.webp",
      command: "game.nauren.resetarCompendios();",
      author: game.user.id
    });
    console.log('Nauren RPG | Criei a macro "Resetar Compêndios do Nauren" - arraste ela da aba de Macros pra sua hotbar.');
  } catch (err) {
    console.warn("Nauren RPG | Não consegui criar a macro de reset automaticamente.", err);
  }
}





/* =======================================
 * CRIADOR DE MONSTROS E NPCs (0.82)
 * =======================================
 * Janela guiada (5 etapas) que monta um NPC pelo balanceamento do Codex
 * Bestiariun: Nível → Valor Base; Função → distribuição 2:1; Categoria →
 * dado de dano, Vida ×Categoria, Estamina extra; tetos por faixa; e as
 * Habilidades de Monstros do compêndio (cópias editáveis), mais as armas
 * comuns. Nada é gravado antes de "Criar". A ficha criada é uma ficha
 * normal: tudo continua editável.
 */
// Tetos por faixa: Estamina (e Vitalidade) / Poder de Ataque / Defesa. 1-20 = Codex; 21-30 (0.87) param a Defesa
// em 20, porque o ataque dos jogadores para de crescer no 20 (Defesa 22-24 virava "só acerta no 20 natural").
const NAUREN_CM_TETOS = [[7, 6, 13], [9, 8, 14], [12, 10, 15], [14, 12, 16], [16, 13, 20], [17, 14, 20], [18, 15, 20]];

const NAUREN_CM_FAIXA = n => n <= 5 ? 0 : n <= 10 ? 1 : n <= 15 ? 2 : n <= 18 ? 3 : n <= 20 ? 4 : n <= 25 ? 5 : 6;

const NAUREN_CM_N_HAB = n => n <= 5 ? 4 : n <= 10 ? 5 : n <= 15 ? 6 : n <= 20 ? 7 : n <= 25 ? 8 : 9;

const NAUREN_CM_N_PEC = n => n <= 5 ? 1 : n <= 10 ? 2 : n <= 20 ? 3 : 4;

const NAUREN_CM_ATR = ["forca", "agilidade", "estamina", "inteligencia", "destino"];

const NAUREN_CM_ROT = { forca: "Força", agilidade: "Agilidade", estamina: "Estamina", inteligencia: "Inteligência", destino: "Destino" };

const NAUREN_CM_FUNC = { Atacante: ["agilidade", "estamina", "forca"], Defensor: ["forca", "estamina", "agilidade"], Suporte: ["inteligencia", "estamina", "destino"] };

// 0.87 - Funções de verdade diferentes (antes: pesos 2:1 iguais, Atacante e Defensor saíam com a MESMA Vida).
// Pesos da distribuição dos pontos:
const NAUREN_CM_PESOS = {
  Atacante: { agilidade: 3, estamina: 2.5, forca: 2, inteligencia: 1, destino: 1 },
  Defensor: { forca: 3, estamina: 3, agilidade: 1.5, inteligencia: 1, destino: 1 },
  Suporte: { inteligencia: 3, estamina: 2.5, destino: 2, forca: 1.5, agilidade: 1 }
};

// Bônus de Função (passa do limite por atributo): +N por faixa de nível nos atributos da Função.
const NAUREN_CM_BONUS_FAIXA = [1, 2, 2, 3, 3, 4, 4];

const NAUREN_CM_BONUS_ATR = { Atacante: ["agilidade"], Defensor: ["forca", "estamina"], Suporte: ["inteligencia", "destino"] };

// 0.88 - Teto POR FUNÇÃO (× o teto da faixa do Codex): o principal sobe acima do teto, os secundários ficam nele e os
// fracos ficam bem abaixo. Antes era um teto só para os 5 atributos: no nível 20 os 3 fortes empatavam e no 30
// todos iam para 18. O bônus de Função soma por cima disso; os Pigmentos somam depois de tudo.
const NAUREN_CM_TETO_FUNC = {
  // Estamina nunca passa do teto da faixa (é o quanto a criatura age por rodada); o Defensor só passa pelo bônus.
  Atacante: { agilidade: 1.15, estamina: 1.0, forca: 0.85, inteligencia: 0.55, destino: 0.5 },
  Defensor: { forca: 1.3, estamina: 1.0, agilidade: 0.7, inteligencia: 0.5, destino: 0.55 },
  Suporte: { inteligencia: 1.2, destino: 1.0, estamina: 0.9, forca: 0.65, agilidade: 0.55 }
};

// Extras de Função e de Chefe (aplicados no painel e na ficha criada).
const NAUREN_CM_EXTRAS = {
  Atacante: { pda: 1, def: 0, estresse: 0, texto: "Agilidade extra, +1 no teto de Poder de Ataque" },
  Defensor: { pda: 0, def: 1, estresse: 0, texto: "Força e Estamina extras (Vitalidade e Estamina podem passar do teto), +1 Defesa" },
  Suporte: { pda: 0, def: 0, estresse: 0, texto: "Inteligência e Destino extras (Poder de Magia, Espírito/Mana)" }
};

const NAUREN_CM_CHEFE = { vida: 1.5, def: 1, estresse: 0, estamina: 1 };

// Peculiaridades do Codex: [nome, descrição curta, valor padrão (0 = sem número), ícone, como é aplicada]
// [nome, efeito, valor padrão, ícone, onde entra, Condição aplicada no acerto (seed) - lida também pela migração dos monstros]
const NAUREN_CM_PECS = [
  ["Envenenador", "N acúmulos de Envenenamento ao acertar", 2, "icons/skills/social/symbol-pyramid-eye.webp", "ataque", "condicao-envenenamento"],
  ["Lacerador", "N acúmulos de Sangramento ao acertar", 1, "icons/skills/wounds/injury-triple-slash-bleed.webp", "ataque", "condicao-sangramento"],
  ["Atropelador", "N de dano direto nos inimigos em volta do alvo", 2, "icons/skills/melee/strike-hammer-destructive-blue.webp", "ataque"],
  ["Imparável", "causa N de dano mesmo se o alvo Bloquear", 3, "icons/skills/melee/strike-hammer-destructive-orange.webp", "ataque"],
  ["Assustador", "Amedrontado N ao acertar", 1, "icons/magic/control/fear-fright-monster-red.webp", "ataque", "condicao-amedrontado"],
  ["Enlouquecedor", "Loucura N ao acertar", 1, "icons/magic/control/hypnosis-mesmerism-swirl.webp", "ataque", "condicao-loucura"],
  ["Alcance", "+N m em todos os golpes", 1, "icons/skills/melee/spear-tips-double-purple.webp", "passiva"],
  ["Bando", "+N no teste de ataque por aliado a até 6 m", 1, "icons/environment/people/group.webp", "ataque"],
  ["Espreitador", "N m de movimento por turno sem gerar Prioridade", 3, "icons/magic/perception/eye-slit-orange.webp", "passiva"],
  ["Vigilante", "nunca é pego de surpresa: +1 Estamina no início do combate", 0, "icons/equipment/neck/necklace-eye-orange.webp", "passiva"]
];

const NAUREN_CM_PASTA_ARMAS = "Armas comuns";

// Campos de bônus de um Pigmento que o Criador mostra ao vivo (mesmos nomes do item "cor").
const NAUREN_CM_PIG_CAMPOS = { forca: "Força", agilidade: "Agilidade", estamina: "Estamina", inteligencia: "Inteligência", destino: "Destino",
  vitalidade: "Vitalidade", espirito: "Espírito", poderAtaque: "Poder de Ataque", poderMagia: "Poder de Magia",
  vida: "Vida", mana: "Mana", estresse: "Estresse máx.", defesa: "Defesa", movimento: "Movimento", ataque: "Ataque" };


class NaurenCriadorMonstro extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "nauren-criador-monstro-{id}",
    classes: ["nauren-rpg", "nauren-criador-monstro"],
    position: { width: 1160, height: 780 },
    window: { title: "Criador de Monstros e NPCs", resizable: true, minimizable: true, icon: "fas fa-dragon" },
    actions: {
      escolherImagem: NaurenCriadorMonstro.onEscolherImagem,
      criar: NaurenCriadorMonstro.onCriar
    }
  };
  static PARTS = { body: { template: "systems/nauren/templates/criador-monstro.html" } };

  /** @param {object} options  options.actor: NPC já existente para preencher (nome/imagem) e atualizar ao criar. */
  constructor(options = {}) {
    super(options);
    this.actorBase = options.actor ?? null;
    const a = this.actorBase;
    this.s = {
      etapa: 0, nome: a?.name ?? "", imgRetrato: a?.img ?? "icons/svg/mystery-man.svg", imgToken: "", mesmaImagem: true, usarBorda: false,
      tipo: "monstro", nivel: Math.max(1, a?.system?.nivel ?? 1), func: "Atacante", cat: 1, tokAuto: true, tok: 1, chefe: false, bando: 0,
      atr: {}, pecs: {}, pontoFraco: 0, pontoFracoOnde: "", bVida: 0, bEst: 0, bMov: null, bDef: 0, // bMov null = padrão 6
      pigs: new Set(), habs: new Map(), pasta: "*", busca: "", soFunc: true, soNivel: true, aberta: "",
      final: { vida: "", est: "", stress: "", def: "", mov: "" }
    };
    this._distribuir();
    this.catalogo = null; // [{id, nome, pasta, img, funcao, nivel, texto, uuid, tipo}]
    this.pigmentos = [];  // [{uuid, nome, cor}]
  }

  static abrir(actor = null) { new NaurenCriadorMonstro({ actor }).render(true); }

  /* ---------- cálculo (Codex Bestiariun, seção 4.9 do guia) ---------- */
  _pontos() { return naurenValorBasePorNivel(this.s.nivel) * 5 + this.s.nivel; }
  _limiteAtr() { return naurenValorBasePorNivel(this.s.nivel) + this.s.nivel; }
  /** Teto da faixa para os atributos distribuídos (Codex: nenhum atributo passa do teto da faixa). */
  /** Teto de um atributo para a Função escolhida (sem o bônus de Função e sem Pigmentos). */
  _tetoAtr(k) {
    const tE = NAUREN_CM_TETOS[NAUREN_CM_FAIXA(this.s.nivel)][0];
    return Math.max(2, Math.min(this._limiteAtr(), Math.round(tE * (NAUREN_CM_TETO_FUNC[this.s.func]?.[k] ?? 1))));
  }
  /** Distribuição "solta" de um nível: proporcional aos pesos, a sobra do arredondamento vai para a Função. */
  _distribuirNivel(nivel) {
    const s = this.s, guardado = s.nivel; s.nivel = nivel;
    try {
      const tot = this._pontos(), o = NAUREN_CM_FUNC[s.func];
      const teto = Object.fromEntries(NAUREN_CM_ATR.map(k => [k, this._tetoAtr(k)]));
      const peso = NAUREN_CM_PESOS[s.func];
      const soma = NAUREN_CM_ATR.reduce((x, k) => x + peso[k], 0);
      const a = {}; NAUREN_CM_ATR.forEach(k => a[k] = Math.max(1, Math.min(teto[k], Math.floor(tot * peso[k] / soma))));
      const fila = [...o, ...NAUREN_CM_ATR.filter(k => !o.includes(k)).sort((x, y) => peso[y] - peso[x])];
      let sobra = tot - NAUREN_CM_ATR.reduce((x, k) => x + a[k], 0);
      for (let volta = 0; sobra > 0 && volta < 200; volta++) {
        const k = fila.find(x => a[x] < teto[x] && (volta < 100 ? o.includes(x) : true)) ?? fila.find(x => a[x] < teto[x]);
        if (!k) break; a[k]++; sobra--;
      }
      return { a, tot, teto, fila };
    } finally { s.nivel = guardado; }
  }
  /**
   * 0.92.41 - Distribuição SEMPRE CRESCENTE (pedido do Gustavo): antes, cada nível era calculado do zero e o
   * arredondamento fazia um atributo cair ao subir de nível (ex.: Atacante, Estamina 6 no nível 3 e 5 no 4).
   * Agora cada nível parte do anterior: nada diminui, e os pontos novos vão para onde a distribuição solta
   * daquele nível pede (Função primeiro), sem passar do teto.
   */
  _distribuir() {
    const s = this.s, nMax = Math.max(1, s.nivel), o = NAUREN_CM_FUNC[s.func];
    // Distribuições soltas de todos os níveis até 30, para olhar à frente: um atributo fora da Função só sobe
    // até o menor valor que ele terá daqui para a frente (senão ficaria "preso" acima do que precisa).
    const soltas = []; for (let n = 1; n <= Math.max(nMax, 30); n++) soltas[n] = this._distribuirNivel(n);
    const minFuturo = (n, k) => { let m = Infinity; for (let x = n; x < soltas.length; x++) m = Math.min(m, soltas[x].a[k]); return m; };
    let a = null, sobra = 0;
    for (let n = 1; n <= nMax; n++) {
      const alvo = soltas[n];
      if (!a) { a = { ...alvo.a }; sobra = alvo.tot - NAUREN_CM_ATR.reduce((x, k) => x + a[k], 0); continue; }
      let livres = alvo.tot - NAUREN_CM_ATR.reduce((x, k) => x + a[k], 0);
      const subir = (k, ate) => { const d = Math.min(Math.min(ate, alvo.teto[k]) - a[k], livres); if (d > 0) { a[k] += d; livres -= d; } };
      for (const k of alvo.fila) if (o.includes(k)) subir(k, alvo.a[k]);           // 1) Função até o valor solto do nível
      for (const k of alvo.fila) if (!o.includes(k)) subir(k, minFuturo(n, k));    // 2) os outros só até o que vão manter
      for (let volta = 0; livres > 0 && volta < 200; volta++) {                   // 3) sobra: Função primeiro
        const k = alvo.fila.find(x => a[x] < alvo.teto[x]);
        if (!k) break; a[k]++; livres--;
      }
      sobra = livres;
    }
    s.atr = a;
    this._pontosSobrando = Math.max(0, sobra); // tudo no teto: o resto se perde (Codex)
  }
  /** Bônus de Função por atributo (passa do teto). */
  _bonusFuncao() {
    const b = NAUREN_CM_BONUS_FAIXA[NAUREN_CM_FAIXA(this.s.nivel)];
    return Object.fromEntries(NAUREN_CM_ATR.map(k => [k, NAUREN_CM_BONUS_ATR[this.s.func].includes(k) ? b : 0]));
  }
  /**
   * Atributos que a ficha vai receber: distribuídos + bônus de Função, cortados no teto da faixa (Codex: o que passa
   * do teto se perde). Os atributos da Função podem passar do teto exatamente pelo bônus.
   */
  _atrEfetivos() {
    const s = this.s, bf = this._bonusFuncao();
    const a = {}, perdidos = {}, tetos = {};
    for (const k of NAUREN_CM_ATR) {
      tetos[k] = this._tetoAtr(k) + bf[k];
      const v = Math.max(0, (s.atr[k] ?? 0) + bf[k]);
      a[k] = Math.min(v, tetos[k]);
      if (v > tetos[k]) perdidos[k] = v - tetos[k];
    }
    return { a, perdidos, bf, tetos, estMax: tetos.estamina, vitMax: Math.floor((tetos.forca + tetos.estamina) / 2) };
  }
  /** Soma dos Pigmentos marcados: { campo: total }, a lista de quem deu o quê, e o "+1 no menor atributo" (Roxo). */
  _bonusPigmentos() {
    const pg = Object.fromEntries(Object.keys(NAUREN_CM_PIG_CAMPOS).map(k => [k, 0])), fontes = [];
    let menor = 0;
    for (const u of this.s.pigs) {
      const p = this.pigmentos.find(x => x.uuid === u); if (!p?.sys) continue;
      const nome = p.nome.replace(/^Pigmento /, "");
      for (const k of Object.keys(NAUREN_CM_PIG_CAMPOS)) {
        const v = Number(String(p.sys[k] ?? "").trim() || 0);
        if (Number.isFinite(v) && v) { pg[k] += v; fontes.push({ nome, campo: k, valor: v }); }
      }
      if (p.sys.bonusMenorAtributo && p.sys.bonusMenorAtributoValor) { menor += Number(p.sys.bonusMenorAtributoValor) || 0; fontes.push({ nome, campo: "menor", valor: Number(p.sys.bonusMenorAtributoValor) || 0 }); }
    }
    return { pg, fontes, menor };
  }
  /** Texto curto do que um Pigmento dá (ex.: "+1 Movimento"). */
  static _resumoPigmento(sys) {
    const partes = Object.entries(NAUREN_CM_PIG_CAMPOS).map(([k, rot]) => { const v = Number(String(sys?.[k] ?? "").trim() || 0); return Number.isFinite(v) && v ? `${v > 0 ? "+" : ""}${v} ${rot}` : ""; }).filter(Boolean);
    if (sys?.bonusMenorAtributo) partes.push(`+${sys.bonusMenorAtributoValor || 1} no menor atributo`);
    return partes.join(", ");
  }
  _derivados() {
    const s = this.s, vb = naurenValorBasePorNivel(s.nivel), [tEst, tPdaBase, tDef] = NAUREN_CM_TETOS[NAUREN_CM_FAIXA(s.nivel)], monstro = s.tipo === "monstro";
    const ex = NAUREN_CM_EXTRAS[s.func];
    // Chefe: Estamina extra = o custo de 1 ataque dele (1 + Estamina extra da Categoria) -> 1 ataque a mais por rodada.
    // Sem isso, um Chefe de Categoria 3-4 sozinho atacava 1-2 vezes contra 8+ ataques do grupo (economia de ações).
    const ch = s.chefe ? { ...NAUREN_CM_CHEFE, estamina: 1 + naurenEscalaPorCategoria(monstro ? s.cat : 1).estCat } : { vida: 1, def: 0, estresse: 0, estamina: 0 };
    const tPda = tPdaBase + ex.pda;
    const ef = this._atrEfetivos();
    // Atributos com Pigmento (mesma ordem da ficha: bônus diretos, depois o "menor atributo" com desempate Força > Agilidade > Estamina > Inteligência > Destino).
    const { pg, fontes, menor } = this._bonusPigmentos();
    const a = Object.fromEntries(NAUREN_CM_ATR.map(k => [k, (ef.a[k] ?? 0) + pg[k]]));
    let menorAtr = "";
    if (menor) { menorAtr = NAUREN_CM_ATR.reduce((m, k) => a[k] < a[m] ? k : m, NAUREN_CM_ATR[0]); a[menorAtr] += menor; }
    const vitBase = Math.floor((a.forca + a.estamina) / 2), espBase = a.inteligencia + a.destino;
    const pdaBase = Math.floor((Math.max(a.forca, a.agilidade) + a.estamina) / 2), pdmBase = Math.floor((a.inteligencia + a.estamina) / 2);
    const vit = vitBase + pg.vitalidade, esp = espBase + pg.espirito;
    const pdaBruto = pdaBase + pg.poderAtaque, pdmBruto = pdmBase + pg.poderMagia; // o que a ficha calcula sozinha
    // Teto vale para o valor SEM Pigmento; o que o Pigmento dá (direto ou via atributo) passa do teto.
    const e0 = ef.a, pdaSemPig = Math.floor((Math.max(e0.forca, e0.agilidade) + e0.estamina) / 2), pdmSemPig = Math.floor((e0.inteligencia + e0.estamina) / 2);
    const tPdm = tPdaBase + (s.func === "Suporte" ? 1 : 0);
    const pdm = Math.min(pdmSemPig, tPdm) + (pdmBruto - pdmSemPig);
    const cat = monstro ? s.cat : 1;
    // Vida (0.87): Vitalidade × Categoria × (Nível + 2) [× 1,5 Chefe]. O "+2" deixa os monstros de nível baixo
    // parrudos (antes um monstro de nível 1 caía com um golpe) e quase não muda os de nível alto.
    const vidaFormula = Math.floor(vit * cat * (s.nivel + 2) * ch.vida);
    const vidaCalc = vidaFormula + s.bVida + pg.vida, mana = esp + pg.mana;
    const estCalc = a.estamina + ch.estamina, pda = Math.min(pdaSemPig, tPda) + (pdaBruto - pdaSemPig);
    const defCalc = Math.min(10 + vb + s.bDef, tDef) + pg.defesa + ex.def + ch.def;
    // Estresse (0.87.1): a tabela do documento de criação - 3 / 4 / 5 / 6 pela Categoria (2 + Categoria), sem extra
    // de Função nem de Chefe. NPC comum: 3.
    const stressBase = 2 + cat;
    const stressCalc = stressBase + s.bEst + pg.estresse;
    const movBase = s.bMov ?? 6; // Deslocamento padrão 6 (decisão de mesa); o Mestre aumenta se quiser
    const movCalc = movBase + pg.movimento;
    const f = s.final, num = v => (v === "" || v === null || isNaN(Number(v))) ? null : Number(v);
    return {
      vb, vit, esp, pda, pdm, cat, mana, pg, fontesPig: fontes, menorAtr, atrTot: a, vitBase, espBase, pdaBase, pdmBase, pdaBruto,
      ef, ex, ch, vidaFormula, stressBase, movBase, tPda, tPdm, pdmBruto, estSemChefe: a.estamina,
      vida: num(f.vida) ?? vidaCalc, vidaCalc, est: num(f.est) ?? estCalc, estCalc, stress: num(f.stress) ?? stressCalc, stressCalc,
      def: num(f.def) ?? defCalc, defCalc, mov: num(f.mov) ?? movCalc, movCalc,
      tetos: { est: !!ef.perdidos.estamina, pda: pdaSemPig > tPda, pdm: pdmSemPig > tPdm, def: 10 + vb + s.bDef > tDef, valores: [ef.estMax, tPda, tDef], perdidos: ef.perdidos },
      pdaSemPig, pdmSemPig,
      nHab: NAUREN_CM_N_HAB(s.nivel) + (s.chefe ? 1 : 0), nPec: NAUREN_CM_N_PEC(s.nivel),
      tok: s.tokAuto ? cat : s.tok, escala: naurenEscalaPorCategoria(cat)
    };
  }

  /* ---------- render ---------- */
  async _prepareContext() { return {}; }

  async _onRender(context, options) {
    await super._onRender?.(context, options);
    const r = this.element;
    this.q = sel => r.querySelector(sel);
    this.ref = n => r.querySelector(`[data-ref="${n}"]`);
    // valores iniciais
    this.q('[name="nome"]').value = this.s.nome;
    this.q('[name="nivel"]').value = this.s.nivel;
    this.q('[name="bMov"]').value = this.s.bMov ?? "";
    this._aplicarImagem("retrato", this.s.imgRetrato, true);
    this._ligar();
    this._renderPecs();
    this._render();
    this._carregarCatalogo().then(() => { this._renderPigs(); this._renderLista(); this._render(); });
  }

  _ligar() {
    const r = this.element, s = this.s;
    r.addEventListener("click", ev => {
      const t = ev.target;
      const prox = t.closest("[data-prox]"); if (prox) { this._irPara(+prox.dataset.prox); return; }
      const marco = t.closest("[data-ir]"); if (marco) { this._irPara(+marco.dataset.ir); return; }
      const tipo = t.closest("[data-tipo]"); if (tipo) { s.tipo = tipo.dataset.tipo; r.querySelectorAll("[data-tipo]").forEach(x => x.classList.toggle("sel", x === tipo)); this._render(); return; }
      const cat = t.closest("[data-cat]"); if (cat) { s.cat = +cat.dataset.cat; r.querySelectorAll("[data-cat]").forEach(x => x.classList.toggle("sel", x === cat)); this._render(); return; }
      const fn = t.closest("[data-func]"); if (fn) { s.func = fn.dataset.func; r.querySelectorAll("[data-func]").forEach(x => x.classList.toggle("sel", x === fn)); this._distribuir(); this._render(); this._renderLista(); return; }
      const atr = t.closest("[data-atr]"); if (atr) { ev.preventDefault(); this._ajustarAtr(atr.dataset.atr, +atr.dataset.d, atr.dataset.livre === "1"); return; }
      const rm = t.closest("[data-rm]"); if (rm) { s.habs.delete(rm.dataset.rm); this._render(); this._renderLista(); return; }
      const pig = t.closest("[data-pig]"); if (pig) { const u = pig.dataset.pig; s.pigs.has(u) ? s.pigs.delete(u) : s.pigs.add(u); pig.classList.toggle("sel"); this._render(); return; }
      const pasta = t.closest("[data-pasta]"); if (pasta) { s.pasta = pasta.dataset.pasta; this._renderLista(); return; }
      const abrir = t.closest("[data-abrir]"); if (abrir) { ev.preventDefault(); ev.stopPropagation(); fromUuid(abrir.dataset.abrir).then(doc => doc?.sheet?.render(true)).catch(() => ui.notifications.warn("Não consegui abrir este item do compêndio.")); return; }
      const addBtn = t.closest("[data-add]"); if (addBtn) { this._alternarHab(addBtn.dataset.add); return; }
      if (t.closest(".nmc-desc-completa")) return; // texto expandido: cliques (checkboxes das Peculiaridades) não fecham
      const hab = t.closest("[data-hab]"); if (hab) { const id = hab.dataset.hab; s.aberta = s.aberta === id ? "" : id; this._renderLista(); return; }
    });
    r.addEventListener("input", ev => {
      const t = ev.target, n = t.name;
      if (n === "nome") { s.nome = t.value; this._render(); }
      else if (n === "nivel") { s.nivel = Math.min(30, Math.max(1, parseInt(t.value) || 1)); this._distribuir(); this._render(); this._renderLista(); }
      else if (n === "bMov") { s.bMov = String(t.value).trim() === "" ? null : Math.max(0, parseInt(t.value) || 0); this._render(); }
      else if (["bVida", "bEst", "bDef", "pontoFraco"].includes(n)) { s[n] = parseInt(t.value) || 0; this._render(); }
      else if (n === "bando") { const v = parseInt(t.value) || 0; s.bando = v >= 2 ? Math.min(12, v) : 0; this._render(); }
      else if (n === "pontoFracoOnde") { s.pontoFracoOnde = t.value; this._render(); }
      else if (["fVida", "fEst", "fStress", "fDef", "fMov"].includes(n)) { s.final[n.slice(1).toLowerCase()] = t.value.trim(); this._render(); }
      else if (n === "busca") { s.busca = t.value; this._renderLista(); }
      else if (n === "soFunc" || n === "soNivel") { s[n] = t.checked; this._renderLista(); }
      else if (t.dataset.pecv !== undefined) { const linha = t.closest("[data-pec-linha]"); if (linha) this._lerPec(linha); }
    });
    r.addEventListener("change", ev => {
      const t = ev.target, n = t.name;
      const pecLinha = t.closest("[data-pec-linha]"); if (pecLinha) { this._lerPec(pecLinha); return; }
      if (t.dataset.pecHab !== undefined) { const h = s.habs.get(t.dataset.pecHab); if (h) { h.pecsExcluidas ??= new Set(); t.checked ? h.pecsExcluidas.delete(t.dataset.pecNome) : h.pecsExcluidas.add(t.dataset.pecNome); t.closest("label")?.classList.toggle("sel", t.checked); this._render(); } return; }
      if (n === "chefe") { s.chefe = t.checked; this._render(); }
      else if (n === "usarBorda") s.usarBorda = t.checked;
      else if (n === "mesmaImagem") { s.mesmaImagem = t.checked; if (t.checked) this._aplicarImagem("token", s.imgRetrato); }
      else if (n === "tokenTam") { if (t.value === "auto") s.tokAuto = true; else { s.tokAuto = false; s.tok = +t.value; } this._render(); }
    });
    // links de imagem (mesma validação do Criador de Personagem)
    r.querySelectorAll(".nmc-link").forEach(input => {
      const aplicar = () => {
        const url = String(input.value ?? "").trim();
        if (!url) { input.classList.remove("invalido"); return; }
        if (!/^https?:\/\/\S+\.(png|jpe?g|webp|gif|svg|avif)(\?\S*)?$/i.test(url)) {
          input.classList.add("invalido");
          ui.notifications.warn("Cole o link direto da imagem, terminando em .png, .jpg, .jpeg, .webp ou .gif (ex.: https://i.imgur.com/abc123.png).");
          return;
        }
        input.classList.remove("invalido");
        this._aplicarImagem(input.dataset.alvo, url);
        naurenAvisarSeLinkBloqueado(url, input.dataset.alvo);
      };
      input.addEventListener("change", aplicar);
      input.addEventListener("paste", () => setTimeout(aplicar, 0));
    });
  }

  _aplicarImagem(alvo, caminho, inicial = false) {
    if (!caminho) return;
    const s = this.s, r = this.element;
    if (alvo === "token") { s.imgToken = caminho; if (!inicial) { s.mesmaImagem = false; const cb = r.querySelector('[name="mesmaImagem"]'); if (cb) cb.checked = false; } }
    else { s.imgRetrato = caminho; if (s.mesmaImagem) s.imgToken = caminho; }
    const pr = r.querySelector('img[data-previa="retrato"]'), pt = r.querySelector('img[data-previa="token"]'), pm = r.querySelector('img[data-previa="mini"]');
    if (pr) pr.src = s.imgRetrato; if (pt) pt.src = s.imgToken || s.imgRetrato; if (pm) pm.src = s.imgRetrato;
  }

  static async onEscolherImagem(event, target) {
    const alvo = target.dataset.alvo;
    const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
    if (FP && game.user.can("FILES_BROWSE")) { new FP({ type: "image", current: alvo === "token" ? this.s.imgToken : this.s.imgRetrato, callback: c => this._aplicarImagem(alvo, c) }).browse(); return; }
    ui.notifications.info("Sem permissão para navegar nos arquivos: cole o link da imagem no campo ao lado.");
  }

  _irPara(n) {
    this.s.etapa = n;
    const r = this.element;
    r.querySelectorAll(".nmc-etapa").forEach(e => e.classList.toggle("ativa", +e.dataset.etapa === n));
    r.querySelectorAll(".nmc-marco").forEach((m, i) => { m.classList.toggle("ativo", i === n); m.classList.toggle("feito", i < n); });
    this.ref("prog").style.width = (10 + n * 22.5) + "%";
    if (n === 4) this._renderFinal();
  }

  _ajustarAtr(k, d, livre) {
    const s = this.s;
    if (livre) { s.atr[k] = Math.max(0, s.atr[k] + d); this._render(); return; } // etapa final: sem limite
    const tot = this._pontos(), usados = NAUREN_CM_ATR.reduce((x, j) => x + s.atr[j], 0);
    if (d > 0 && (usados >= tot || s.atr[k] >= this._tetoAtr(k))) return;
    s.atr[k] = Math.max(1, s.atr[k] + d);
    this._render();
  }

  _lerPec(linha) {
    const nome = linha.dataset.pecLinha, cb = linha.querySelector("input[type=checkbox]"), v = linha.querySelector("[data-pecv]");
    if (cb.checked) this.s.pecs[nome] = v ? Math.max(1, parseInt(v.value) || 1) : 0; else delete this.s.pecs[nome];
    linha.classList.toggle("sel", cb.checked);
    this._render();
  }

  _renderPecs() {
    this.ref("pecs").innerHTML = NAUREN_CM_PECS.map(([n, d, v, img]) =>
      `<label class="nmc-pec" data-pec-linha="${n}"><input type="checkbox"><img src="${img}" width="22" height="22" style="border-radius:4px;border:1px solid var(--n-borda2)"><b>${n}</b><small>${d}</small>${v ? `<input type="number" data-pecv="${n}" value="${v}" min="1" max="10" title="valor">` : ""}</label>`).join("");
  }

  _renderPigs() {
    this.ref("pigs").innerHTML = this.pigmentos.map(p => { const r = NaurenCriadorMonstro._resumoPigmento(p.sys); return `<div class="nmc-pig ${this.s.pigs.has(p.uuid) ? "sel" : ""}" data-pig="${p.uuid}" title="${p.nome}${r ? ": " + r : ""}"><i style="background:${p.cor}"></i><span>${p.nome.replace(/^Pigmento /, "")}${r ? `<small>${r}</small>` : ""}</span></div>`; }).join("");
  }

  _render() {
    const s = this.s, d = this._derivados(), r = this.element, monstro = s.tipo === "monstro";
    const esc = foundry.utils.escapeHTML;
    this.ref("fNome").textContent = s.nome || "Sem nome";
    this.ref("fSub").textContent = `${monstro ? "Monstro" : "NPC"} · Nível ${s.nivel}${monstro ? ` · Categoria ${d.cat}` : ""} · ${s.func}${s.chefe ? " · Chefe" : ""}`;
    this.ref("rVB").textContent = "Valor Base " + d.vb;
    this.ref("caixaCategoria").classList.toggle("apagada", !monstro);
    const [tEst, tPda, tDef] = d.tetos.valores;
    const rec = [["Vida", d.vida, d.vida !== d.vidaCalc ? "ajustada" : `${d.vit}×${d.cat}×${s.nivel + 2}${s.chefe ? "×1,5" : ""}`, false, d.vida !== d.vidaCalc], ["Mana", d.mana, "", false, false],
      ["Estamina", d.est, d.est !== d.estCalc ? "ajustada" : (d.tetos.est ? "teto " + tEst : s.chefe ? `+${d.ch.estamina} Chefe` : ""), d.tetos.est && d.est === d.estCalc, d.est !== d.estCalc],
      ["Pod. Ataque", d.pda, d.tetos.pda ? "teto " + tPda : "", d.tetos.pda, false], ["Pod. Magia", d.pdm, "", false, false],
      ["Estresse máx.", d.stress, d.stress !== d.stressCalc ? "ajustado" : "", false, d.stress !== d.stressCalc]];
    this.ref("recursos").innerHTML = rec.map(([n, v, sub, teto, aj]) => `<div class="nmc-rec ${teto ? "teto" : ""} ${aj ? "ajustado" : ""}"><span>${n}</span><b>${v}${sub ? `<small>${sub}</small>` : ""}</b></div>`).join("");
    this.ref("fDef").textContent = d.def + (d.tetos.def && d.def === d.defCalc ? " (teto)" : "") + (d.pg.defesa && d.def === d.defCalc ? ` (${d.pg.defesa > 0 ? "+" : ""}${d.pg.defesa} Pig.)` : "");
    this.ref("fMov").textContent = d.mov + " m" + (d.pg.movimento && d.mov === d.movCalc ? ` (${d.movBase} ${d.pg.movimento > 0 ? "+" : "−"} ${Math.abs(d.pg.movimento)} Pig.)` : "");
    this._renderCalculo(d);
    const inMov = this.q('[name="bMov"]'); if (inMov) inMov.placeholder = "6 (padrão)";
    const gEl = this.ref("fGrupo"); if (gEl) gEl.textContent = `jogadores de nível ${Math.max(1, Math.ceil(s.nivel / 2))}+`;
    this.ref("linhaDano").hidden = !monstro; this.ref("linhaEstCat").hidden = !monstro;
    this.ref("fDano").textContent = `${d.escala.danoCat} · meio ${d.escala.meioCat}`; this.ref("fEstCat").textContent = "+" + d.escala.estCat;
    this.ref("fTok").textContent = `${d.tok}×${d.tok}${s.tokAuto ? "" : " (manual)"}`;
    const nh = s.habs.size, np = Object.keys(s.pecs).length;
    this.ref("fHabs").textContent = `${nh} / ${d.nHab}`; this.ref("fPecs").textContent = `${np} / ${d.nPec}`;
    this.ref("habCont").innerHTML = `<b>${nh}</b> de <b>${d.nHab}</b> habilidades`; this.ref("habCont").className = "nmc-contador" + (nh >= d.nHab ? " cheio" : "");
    this.ref("pecCont").textContent = `${np} de ${d.nPec}`;
    const av = [];
    if (nh > d.nHab) av.push(`Acima do padrão do Codex: ${nh} habilidades (limite ${d.nHab}). Vai criar mesmo assim.`);
    if (np > d.nPec) av.push(`Peculiaridades acima do padrão (${np} de ${d.nPec}).`);
    const perd = Object.entries(d.tetos.perdidos ?? {}).map(([k, v]) => `${v} de ${NAUREN_CM_ROT[k]}`);
    if (this.pigmentos?.length && s.pigs.size < 2) av.push("O Codex pede 2 Pigmentos ou mais (\"Cores são sempre 2 ou mais\").");
    if (perd.length) av.push(`Acima do teto da faixa (se perdem, como no Codex): ${perd.join(", ")}. Mova para outro atributo, se quiser.`);
    if (d.tetos.pda) av.push(`Poder de Ataque ${d.pdaSemPig} passa do teto ${d.tPda}: fica ${d.tPda}${d.pda > d.tPda ? ` (+${d.pda - d.tPda} de Pigmento, que passa do teto)` : ""}.`);
    if (d.tetos.pdm) av.push(`Poder de Magia ${d.pdmSemPig} passa do teto ${d.tPdm}: fica ${d.tPdm}${d.pdm > d.tPdm ? ` (+${d.pdm - d.tPdm} de Pigmento, que passa do teto)` : ""}.`);
    if (monstro && !s.tokAuto && s.tok < s.cat) av.push(`Token ${s.tok}×${s.tok} numa criatura de Categoria ${s.cat}: dano e Vida continuam da Categoria.`);
    this.ref("avisos").innerHTML = av.map(t => `<div class="nmc-aviso">${t}</div>`).join("") || `<div class="nmc-ok">Dentro do padrão do Codex.</div>`;
    const pecsAtaqueSel = Object.keys(s.pecs).filter(n => NAUREN_CM_PECS.find(p => p[0] === n)?.[4] === "ataque");
    this.ref("chipsHab").innerHTML = [...s.habs.values()].map(h => { const nP = h.temAtaque ? pecsAtaqueSel.filter(n => !h.pecsExcluidas?.has(n)).length : 0; return `<span class="nmc-chip" title="${h.temAtaque && pecsAtaqueSel.length ? `Peculiaridades neste ataque: ${pecsAtaqueSel.filter(n => !h.pecsExcluidas?.has(n)).join(", ") || "nenhuma"}` : ""}"><i class="fas fa-${h.tipo === "arma" ? "khanda" : "diamond"}"></i>${esc(h.nome)}${h.temAtaque && pecsAtaqueSel.length ? `<span class="pecs">(${nP}/${pecsAtaqueSel.length} pec.)</span>` : ""}<span class="x" data-rm="${h.id}" title="Tirar">✕</span></span>`; }).join("");
    const tot = this._pontos(), usados = NAUREN_CM_ATR.reduce((x, k) => x + s.atr[k], 0);
    const bf = d.ef.bf, bN = Object.values(bf).find(v => v) ?? 0;
    const pt = this.ref("pontosTxt"); pt.textContent = `${usados} de ${tot} pontos · teto de cada atributo pela Função (embaixo do número) · +${bN} de ${s.func} em ${NAUREN_CM_BONUS_ATR[s.func].map(k => NAUREN_CM_ROT[k]).join(" e ")} (passa do teto)${this._pontosSobrando && usados >= tot - this._pontosSobrando ? ` · ${this._pontosSobrando} sobram (tudo no teto)` : ""}`; pt.style.color = usados > tot ? "var(--n-perigo)" : "";
    const grade = livre => NAUREN_CM_ATR.map(k => { const prio = NAUREN_CM_FUNC[s.func].indexOf(k); const fim = d.ef.a[k]; const notas = [`teto ${this._tetoAtr(k)}`, bf[k] ? `+${bf[k]} ${s.func}` : "", d.tetos.perdidos?.[k] ? `fica ${fim}` : ""].filter(Boolean).join(" · "); return `<div class="nmc-atr"><span>${NAUREN_CM_ROT[k]}</span><div class="v"><button type="button" data-atr="${k}" data-d="-1" data-livre="${livre ? 1 : 0}">−</button><b>${s.atr[k]}</b><button type="button" data-atr="${k}" data-d="1" data-livre="${livre ? 1 : 0}">+</button></div><div class="mod ${prio >= 0 ? "extra" : ""}">${notas || (prio === 0 || prio === 1 ? "principal" : prio === 2 ? "secundário" : "")}</div></div>`; }).join("");
    this.ref("atributos").innerHTML = grade(false);
    this.ref("atributosFinal").innerHTML = grade(true);
    const sel = this.q('[name="tokenTam"]'); if (sel) sel.options[0].text = `Seguir a Categoria (${d.cat}×${d.cat})`;
    if (s.etapa === 4) this._renderFinal();
  }

  /** Painel "Como foi calculado": atributos (com Pigmento), meta-atributos com a conta e o que cada Pigmento deu. */
  _renderCalculo(d) {
    const el = this.ref("calc"); if (!el) return;
    const s = this.s, esc = foundry.utils.escapeHTML, R = NAUREN_CM_ROT, a = d.atrTot;
    const ab = k => R[k].slice(0, 3);
    const mais = (v, rot = "Pig.") => v ? ` <em>${v > 0 ? "+" : "−"} ${Math.abs(v)} ${rot}</em>` : "";
    const atrs = NAUREN_CM_ATR.map(k => {
      const extra = a[k] - s.atr[k];
      const det = [d.ef.bf[k] ? `+${d.ef.bf[k]} Função` : "", d.tetos.perdidos?.[k] ? `−${d.tetos.perdidos[k]} teto` : "", d.pg[k] ? `+${d.pg[k]} Pig.` : "", d.menorAtr === k ? "+1 Roxo" : ""].filter(Boolean).join(", ");
      return `<span class="nmc-calc-atr" title="${det}"><b>${ab(k)}</b> ${a[k]}${extra ? `<em>(${s.atr[k]}${extra > 0 ? "+" : "−"}${Math.abs(extra)})</em>` : ""}</span>`;
    }).join("");
    const maiorFA = a.forca >= a.agilidade ? "For" : "Agi";
    const linhas = [
      ["Vitalidade", `⌊(For ${a.forca} + Est ${a.estamina}) ÷ 2⌋ = ${d.vitBase}${mais(d.pg.vitalidade)}`, d.vit],
      ["Espírito", `Int ${a.inteligencia} + Des ${a.destino} = ${d.espBase}${mais(d.pg.espirito)}`, d.esp],
      ["Pod. Ataque", `⌊(${maiorFA} ${Math.max(a.forca, a.agilidade)} + Est ${a.estamina}) ÷ 2⌋ = ${d.pdaBase}${d.tetos.pda ? ` <em class="teto">teto ${d.tPda}</em>` : ""}${d.pda - Math.min(d.pdaSemPig, d.tPda) ? mais(d.pda - Math.min(d.pdaSemPig, d.tPda)) : ""}`, d.pda],
      ["Pod. Magia", `⌊(Int ${a.inteligencia} + Est ${a.estamina}) ÷ 2⌋ = ${d.pdmBase}${d.tetos.pdm ? ` <em class="teto">teto ${d.tPdm}</em>` : ""}${d.pdm - Math.min(d.pdmSemPig, d.tPdm) ? mais(d.pdm - Math.min(d.pdmSemPig, d.tPdm)) : ""}`, d.pdm],
      ["Vida", `Vit ${d.vit} × Cat ${d.cat} × (Nv ${s.nivel} + 2)${s.chefe ? " × 1,5 Chefe" : ""}${s.bVida ? ` + ${s.bVida} extra` : ""}${mais(d.pg.vida)}`, d.vidaCalc],
      ["Defesa", `10 + VB ${d.vb} (teto ${d.tetos.valores[2]})${mais(d.pg.defesa)}${d.ex.def ? ` + ${d.ex.def} ${s.func}` : ""}${d.ch.def ? " + 1 Chefe" : ""}${s.bDef ? ` + ${s.bDef} extra` : ""}`, d.defCalc],
      ["Estresse", `2 + Cat ${d.cat} (tabela do Codex)${s.bEst ? ` + ${s.bEst} extra` : ""}${mais(d.pg.estresse)}`, d.stressCalc],
      ["Deslocamento", s.bMov === null ? `6 (padrão)${mais(d.pg.movimento)}` : `${s.bMov} (à mão)${mais(d.pg.movimento)}`, d.movCalc],
      ["Mana", `Espírito ${d.esp}${mais(d.pg.mana)}`, d.mana]
    ];
    const porPig = {};
    for (const f of d.fontesPig) (porPig[f.nome] ??= []).push(f.campo === "menor" ? `+${f.valor} no menor (${R[d.menorAtr] ?? "—"})` : `${f.valor > 0 ? "+" : ""}${f.valor} ${NAUREN_CM_PIG_CAMPOS[f.campo]}`);
    const pigs = Object.entries(porPig).map(([n, l]) => `<div class="nmc-calc-pig"><b>${esc(n)}</b> ${l.join(", ")}</div>`).join("")
      || `<div class="nmc-calc-pig vazio">Nenhum Pigmento marcado.</div>`;
    el.innerHTML = `<div class="nmc-calc-atrs">${atrs}</div>`
      + linhas.map(([n, conta, v]) => `<div class="nmc-calc-linha"><span>${n}</span><small>${conta}</small><b>${v}</b></div>`).join("")
      + `<div class="nmc-calc-sub">${s.func}${s.chefe ? " · Chefe" : ""}</div><div class="nmc-calc-pig">${d.ex.texto}${s.chefe ? `. Chefe: Vida ×1,5, +1 Defesa, +${d.ch.estamina} Estamina (1 ataque a mais por rodada), +1 Habilidade` : ""}.</div>`
      + `<div class="nmc-calc-sub">Pigmentos</div>${pigs}`;
  }

  _renderFinal() {
    const s = this.s, d = this._derivados(), esc = foundry.utils.escapeHTML, monstro = s.tipo === "monstro";
    for (const [n, calc] of [["fVida", d.vidaCalc], ["fEst", d.estCalc], ["fStress", d.stressCalc], ["fDef", d.defCalc], ["fMov", d.movCalc]]) { const i = this.q(`[name="${n}"]`); if (i) i.placeholder = String(calc); }
    const pecs = Object.entries(s.pecs).map(([k, v]) => k + (v ? " " + v : ""));
    this.ref("resumoFicha").innerHTML = [
      `<b>${esc(s.nome || "Sem nome")}</b> · nível ${s.nivel}${monstro ? `, Categoria ${d.cat} (${d.escala.danoCat})` : ""}, ${s.func}${s.chefe ? ", Chefe" : ""}`,
      `Atributos: ${NAUREN_CM_ATR.map(k => NAUREN_CM_ROT[k].slice(0, 3) + " " + s.atr[k]).join(" · ")}`,
      `Vida <b>${d.vida}</b> · Mana ${d.mana} · Estamina ${d.est} · PdA ${d.pda} · PdM ${d.pdm}`,
      `Defesa ${d.def} · Movimento ${d.mov} m · Estresse máx. ${d.stress}`,
      `Token ${d.tok}×${d.tok}, disposição Hostil, barras Vida/Estamina`
    ].map(t => `<li>${t}</li>`).join("");
    const itens = [...(monstro ? [`Categoria ${d.cat} (referência${s.chefe ? " + Estresse do Chefe" : ""})`] : []), "Dar Prioridade",
      ...(s.pontoFraco > 0 ? [`Ponto Fraco ${s.pontoFraco}${s.pontoFracoOnde ? ` (${esc(s.pontoFracoOnde)})` : ""}`] : []),
      ...pecs.map(p => "Peculiaridade: " + p),
      ...[...s.pigs].map(u => "Pigmento " + esc(this.pigmentos.find(p => p.uuid === u)?.nome.replace(/^Pigmento /, "") ?? "")),
      ...[...s.habs.values()].map(h => { const ps = h.temAtaque ? Object.keys(s.pecs).filter(n => NAUREN_CM_PECS.find(p => p[0] === n)?.[4] === "ataque" && !h.pecsExcluidas?.has(n)) : []; return `${h.tipo === "arma" ? "Arma" : "Habilidade"}: ${esc(h.nome)} (cópia do compêndio${ps.length ? `; com ${ps.join(", ")}` : ""})`; }),
      ...(this._precisaAjustes(d) ? ["Ajustes do Criador (Vida/Estamina/Estresse extras, editável)"] : [])];
    this.ref("resumoItens").innerHTML = itens.map(t => `<li>${t}</li>`).join("");
    const av = this.ref("avisos").querySelectorAll(".nmc-aviso");
    this.ref("avisosFinais").innerHTML = "<h4>Antes de criar</h4>" + (av.length ? [...av].map(a => `<div class="nmc-aviso" style="margin-bottom:6px">${a.textContent}</div>`).join("") : '<p class="nmc-ok">Tudo dentro do padrão. As Habilidades vão como cópias (editáveis) e já escalam pela Categoria da ficha.</p>');
  }
  _precisaAjustes(d) { return this._modsAjuste(d).length > 0; }
  /** Modificadores do item "Ajustes do Criador": o que o painel mostra menos o que a ficha calcula sozinha. */
  _modsAjuste(d) {
    const monstro = this.s.tipo === "monstro", mods = [];
    const vidaFicha = d.vidaFormula + d.pg.vida;                                   // fórmula customizada + Pigmentos (itens)
    const estFicha = d.estSemChefe;                                                // Estamina de Combate = atributo Estamina (com Pigmentos)
    const stressFicha = 2 + (monstro ? d.stressBase - 2 : 0) + d.pg.estresse;      // monstro: o item Categoria leva o resto
    if (d.vida !== vidaFicha) mods.push({ campo: "vida", valor: String(d.vida - vidaFicha) });
    if (d.est !== estFicha) mods.push({ campo: "estaminaCombate", valor: String(d.est - estFicha) });
    if (d.stress !== stressFicha) mods.push({ campo: "estresse", valor: String(d.stress - stressFicha) });
    if (d.pda !== d.pdaBruto) mods.push({ campo: "poderAtaque", valor: String(d.pda - d.pdaBruto) });
    if (d.pdm !== d.pdmBruto) mods.push({ campo: "poderMagia", valor: String(d.pdm - d.pdmBruto) });
    return mods;
  }

  /* ---------- catálogo ---------- */
  async _carregarCatalogo() {
    if (this.catalogo) return;
    const porLabel = def => game.packs.find(p => p.metadata.label === def.label && p.metadata.type === def.type);
    const packHab = porLabel(NAUREN_PACKS_DEFINICAO.habMonstros), packArmas = porLabel(NAUREN_PACKS_DEFINICAO.armas), packPig = porLabel(NAUREN_PACKS_DEFINICAO.pigmentos);
    const lista = [];
    const limpar = html => String(html ?? "").replace(/<p class="nauren-desc-(automacao|mestre)">[\s\S]*?<\/p>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (packHab) {
      const idx = await packHab.getIndex({ fields: ["img", "flags.nauren.habMonstro", "system.descricao", "system.acoes", "type"] });
      for (const e of idx) {
        const m = e.flags?.nauren?.habMonstro; if (!m || e.type !== "habilidade") continue;
        const temAtaque = (e.system?.acoes ?? []).some(a => a?.ehAtaque && a?.modoAlvo !== "nenhum");
        lista.push({ id: e._id, uuid: `Compendium.${packHab.collection}.Item.${e._id}`, nome: e.name, pasta: m.familia, img: e.img, funcao: m.funcao ?? [], nivel: m.nivelMinimo ?? 1, texto: limpar(e.system?.descricao).slice(0, 160), descHtml: String(e.system?.descricao ?? ""), temAtaque, tipo: "habilidade" });
      }
    }
    if (packArmas) {
      const idx = await packArmas.getIndex({ fields: ["img", "flags.nauren.seedId", "system.descricao", "type"] });
      for (const e of idx) {
        const seed = e.flags?.nauren?.seedId ?? "";
        if (e.type !== "arma" || !NAUREN_SEED_IDS_EQUIPAMENTO_INICIAL.armas.includes(seed)) continue;
        lista.push({ id: e._id, uuid: `Compendium.${packArmas.collection}.Item.${e._id}`, nome: e.name, pasta: NAUREN_CM_PASTA_ARMAS, img: e.img, funcao: ["Atacante", "Defensor", "Suporte"], nivel: 1, texto: limpar(e.system?.descricao).slice(0, 160) || "Arma comum dos jogadores.", descHtml: String(e.system?.descricao ?? "") || "<p>Arma comum dos jogadores (cópia do compêndio de Armas). O ataque vem das Ações da própria arma.</p>", temAtaque: true, tipo: "arma" });
      }
    }
    if (packPig) {
      const idx = await packPig.getIndex({ fields: ["system", "type"] });
      for (const e of idx) if (e.type === "cor") this.pigmentos.push({ uuid: `Compendium.${packPig.collection}.Item.${e._id}`, nome: e.name, cor: e.system?.corHex || "#777", sys: e.system ?? {} });
      this.pigmentos.sort((a, b) => a.nome.localeCompare(b.nome));
      // "Cores são sempre 2 ou mais" (documento de criação): já vêm 2 marcadas.
      if (!this.s.pigs.size) this.pigmentos.slice(0, 2).forEach(p => this.s.pigs.add(p.uuid));
    }
    this.catalogo = lista;
    if (!packHab) ui.notifications.warn("Compêndio \"Nauren - Habilidades de Monstros\" não encontrado: abra o mundo como Mestre uma vez para ele ser criado.");
  }

  _renderLista() {
    if (!this.catalogo) return;
    const s = this.s, esc = foundry.utils.escapeHTML, q = s.busca.toLowerCase();
    const base = this.catalogo.filter(h => (!s.soFunc || h.funcao.includes(s.func)) && (!s.soNivel || h.nivel <= s.nivel) && (!q || (h.nome + " " + h.texto).toLowerCase().includes(q)));
    const cont = {}; base.forEach(h => cont[h.pasta] = (cont[h.pasta] || 0) + 1);
    const pastas = [...new Set(this.catalogo.map(h => h.pasta))].sort((a, b) => a === NAUREN_CM_PASTA_ARMAS ? -1 : b === NAUREN_CM_PASTA_ARMAS ? 1 : a.localeCompare(b));
    this.ref("pastas").innerHTML = `<div class="nmc-pasta ${s.pasta === "*" ? "sel" : ""}" data-pasta="*">Todas <small>${base.length}</small></div>` +
      pastas.filter(p => cont[p]).map(p => `<div class="nmc-pasta ${s.pasta === p ? "sel" : ""}" data-pasta="${esc(p)}">${esc(p)} <small>${cont[p]}</small></div>`).join("");
    const lista = base.filter(h => s.pasta === "*" || h.pasta === s.pasta).slice(0, 120);
    const pecsAtaque = Object.keys(s.pecs).filter(n => NAUREN_CM_PECS.find(p => p[0] === n)?.[4] === "ataque");
    this.ref("lista").innerHTML = lista.map(h => {
      const sel = s.habs.has(h.id), aberta = s.aberta === h.id, entrada = s.habs.get(h.id);
      let extra = "";
      if (aberta) {
        let pecHtml = "";
        if (h.temAtaque && pecsAtaque.length) {
          pecHtml = sel
            ? `<div class="nmc-pec-aplicar"><b>Peculiaridades neste ataque:</b>${pecsAtaque.map(n => { const on = !entrada?.pecsExcluidas?.has(n); return `<label class="${on ? "sel" : ""}"><input type="checkbox" data-pec-hab="${h.id}" data-pec-nome="${esc(n)}" ${on ? "checked" : ""}>${esc(n)}${s.pecs[n] ? " " + s.pecs[n] : ""}</label>`; }).join("")}</div>`
            : `<div class="nmc-pec-aplicar"><b>Peculiaridades:</b><span style="color:var(--n-suave);font-size:11.5px">adicione à ficha para escolher quais entram neste ataque (${pecsAtaque.join(", ")}).</span></div>`;
        } else if (h.temAtaque) pecHtml = "";
        else if (pecsAtaque.length) pecHtml = `<div class="nmc-pec-aplicar"><span style="color:var(--n-suave);font-size:11.5px">Sem teste de ataque: as Peculiaridades de golpe não entram aqui.</span></div>`;
        extra = `<div class="nmc-desc-completa">${h.descHtml}${pecHtml}</div>`;
      }
      return `<div class="nmc-hab ${sel ? "sel" : ""} ${aberta ? "aberta" : ""}" data-hab="${h.id}" title="${aberta ? "Clique para recolher" : "Clique para ler a descrição completa"}"><img class="ic" src="${h.img}" alt=""><div class="tx"><b>${h.funcao.includes(s.func) ? '<i class="fas fa-diamond"></i>' : ""}${esc(h.nome)}</b><small>${esc(h.texto)}</small><span class="meta">${esc(h.pasta)} · <em>${h.funcao.join(", ")}</em> · nível ${h.nivel}+ · <a data-abrir="${h.uuid}" title="Abrir a ficha do item no compêndio"><i class="fas fa-eye"></i> abrir</a></span></div><button type="button" data-add="${h.id}">${sel ? '<i class="fas fa-check"></i> Na ficha' : '<i class="fas fa-plus"></i> Adicionar'}</button>${extra}</div>`;
    }).join("") || '<p class="nmc-nota">Nada com esse filtro. Desmarque "só da Função" ou "até o meu nível".</p>';
  }

  _alternarHab(id) {
    const s = this.s;
    if (s.habs.has(id)) s.habs.delete(id);
    else { const e = this.catalogo.find(x => x.id === id); if (e) s.habs.set(id, { ...e, pecsExcluidas: new Set() }); }
    this._render(); this._renderLista();
  }

  /* ---------- criação ---------- */
  static async onCriar(event, target) {
    const destino = target.dataset.destino;
    const s = this.s;
    if (!s.nome.trim()) { ui.notifications.warn("Dê um nome à criatura (etapa 1)."); this._irPara(0); return; }
    target.disabled = true;
    try {
      const ator = await this._criar(destino);
      ui.notifications.info(`${ator.name} criado${destino === "bestiario" ? " no Bestiário" : ""}.`);
      this.close();
      if (s.usarBorda) await naurenAbrirBorda(ator).catch(err => console.warn("Nauren RPG | Borda do token", err));
      ator.sheet?.render(true);
    } catch (err) {
      console.error("Nauren RPG | Criador de Monstros", err);
      ui.notifications.error("Não consegui criar a criatura: veja o console (F12).");
      target.disabled = false;
    }
  }

  async _criar(destino) {
    const s = this.s, d = this._derivados(), monstro = s.tipo === "monstro";
    const itens = [];
    // 1) Itens de referência (mesmos do Bestiário)
    const estresseItem = d.stressBase - 2; // a ficha começa em 2
    if (monstro) itens.push({
      name: `Categoria ${d.cat}`, type: "habilidade", img: "icons/weapons/axes/axe-battle-simple-black.webp",
      system: { ativo: true, efeitosVinculados: [{ ativo: true, modificadores: [{ campo: "estresse", valor: String(estresseItem) }] }],
        descricao: `<p><b>Categoria ${d.cat}</b> (Codex Bestiariun, seção 4.9 do guia). Dado de dano ${d.escala.danoCat}, +${d.escala.estCat} de Estamina por ataque. Vida = Vitalidade × ${d.cat} × (nível + 2)${s.chefe ? " × 1,5 (Chefe)" : ""} - fórmula na aba Opções. Estresse Máximo ${d.stressBase} (2 + Categoria, tabela do Codex): +${estresseItem} aqui, somado ao 2 padrão.</p>` }
    });
    itens.push({ name: "Dar Prioridade", type: "habilidade", img: "icons/magic/fire/flame-burning-hand-white.webp",
      system: { acoes: [{ nome: "Dar Prioridade", custoEstamina: 1, alcance: "9m", modoAlvo: "selecionado", modoAlvoTravado: true, usaDarPrioridade: true }],
        descricao: "<p>Habilidade universal (Cap. III do manual - \"Prioridade Estratégica\"). Concede Prioridade a um aliado à sua escolha.</p>" } });
    if (s.pontoFraco > 0) itens.push({ name: "Ponto Fraco", type: "habilidade", img: "icons/skills/targeting/crosshair-arrowhead-blue.webp",
      system: { descricao: `<p><b>Ponto Fraco: ${s.pontoFraco}</b>${s.pontoFracoOnde ? ` — ${foundry.utils.escapeHTML(s.pontoFracoOnde)}` : ""}. Regra de mesa (Codex): o jogador declara antes de rolar que mira o ponto fraco e o Mestre soma ${s.pontoFraco} à Defesa só naquele ataque.</p>` } });
    // 2) Peculiaridades (item descritivo + efeito)
    const packCond = game.packs.find(p => p.metadata.label === NAUREN_PACKS_DEFINICAO.condicoes.label);
    const condUuid = async seed => packCond ? (await naurenUuidPorSeed(packCond, seed)) : "";
    const pecAplicar = []; // modificações nos ataques
    for (const [nome, valor] of Object.entries(s.pecs)) {
      const def = NAUREN_CM_PECS.find(p => p[0] === nome); if (!def) continue;
      const item = { name: `Peculiaridade: ${nome}${valor ? " " + valor : ""}`, type: "habilidade", img: def[3], system: { ativo: true, descricao: "" } };
      let auto = "";
      switch (nome) {
        case "Envenenador": pecAplicar.push({ nome, cond: await condUuid(def[5]), acumulos: valor, origem: item.name }); auto = `${valor} acúmulo(s) de Envenenamento em cada acerto dos ataques (configurado nas Ações).`; break;
        case "Lacerador": pecAplicar.push({ nome, cond: await condUuid(def[5]), acumulos: valor, origem: item.name }); auto = `${valor} acúmulo(s) de Sangramento em cada acerto dos ataques.`; break;
        case "Assustador": pecAplicar.push({ nome, cond: await condUuid(def[5]), acumulos: valor, origem: item.name }); auto = `${valor} acúmulo(s) de Amedrontado em cada acerto dos ataques.`; break;
        case "Enlouquecedor": pecAplicar.push({ nome, cond: await condUuid(def[5]), acumulos: valor, origem: item.name }); auto = `${valor} acúmulo(s) de Loucura em cada acerto dos ataques.`; break;
        case "Atropelador": pecAplicar.push({ nome, atropelador: valor }); auto = `ao acertar, inimigos a 1 m do alvo sofrem ${valor} de dano direto.`; break;
        case "Imparável": pecAplicar.push({ nome, imparavel: valor }); auto = `os ataques causam pelo menos ${valor} mesmo quando o alvo Bloqueia.`; break;
        case "Bando": pecAplicar.push({ nome, bando: valor }); auto = `+${valor} no teste de ataque por aliado a até 6 m (@aliados_6m nas Ações).`; break;
        case "Alcance": item.system.efeitosVinculados = [{ ativo: true, modificadores: [{ campo: "alcanceBonus", valor: String(valor) }] }]; auto = `+${valor} m de alcance em todas as Ações (Efeito Vinculado).`; break;
        case "Espreitador": item.system.movimentoSemPrioridadeMetros = String(valor); auto = `até ${valor} m de movimento por turno sem gerar Prioridade (card "Aproximação").`; break;
        case "Vigilante": item.system.usaGatilhos = true; item.system.gatilhos = [{ evento: "inicioCombate", recurso: "estaminaCombate", quantidade: "1", passarDoMaximo: true }]; auto = "+1 Estamina no início do combate, mesmo com a Estamina cheia (fica 1 acima do máximo na 1ª rodada)."; break;
      }
      item.system.descricao = naurenMontarDescricao({ regra: `<p><b>Peculiaridade de monstro (Codex Bestiariun).</b> ${def[1].replace("N", String(valor || ""))}.</p>`, automatico: auto });
      if (def[4] === "ataque") item._pecNome = nome;
      itens.push(item);
    }
    // 3) Pigmentos, Habilidades e Armas (cópias do compêndio)
    for (const u of s.pigs) { const doc = await fromUuid(u).catch(() => null); if (doc) itens.push({ name: doc.name, type: "cor", img: doc.img, system: foundry.utils.deepClone(doc.system) }); }
    for (const h of s.habs.values()) {
      const doc = await fromUuid(h.uuid).catch(() => null); if (!doc) continue;
      const o = doc.toObject(); delete o._id; delete o.folder; o.flags = { nauren: { ...(o.flags?.nauren ?? {}), origemCriadorMonstro: h.uuid } };
      if (o.type === "arma") o.system.equipado = true;
      // Escala pela Categoria (raio da área, alcance, usos...): grava o valor da Categoria desta criatura.
      for (const [caminho, valores] of Object.entries(o.flags.nauren.habMonstro?.escala ?? {})) {
        const v = Array.isArray(valores) ? valores[Math.max(0, Math.min(3, d.cat - 1))] : undefined;
        if (v === undefined || v === null) continue;
        foundry.utils.setProperty(o.system, caminho, v);
        if (/usosMax$/.test(caminho)) foundry.utils.setProperty(o.system, caminho.replace(/usosMax$/, "usosAtual"), v);
        if (/usosPassivaMax$/.test(caminho)) foundry.utils.setProperty(o.system, caminho.replace(/usosPassivaMax$/, "usosPassivaAtual"), v);
      }
      const pecsDesta = pecAplicar.filter(p => !h.pecsExcluidas?.has(p.nome));
      this._aplicarPeculiaridades(o, pecsDesta);
      if (h.temAtaque) for (const p of pecsDesta) { const it = itens.find(i => i._pecNome === p.nome); if (it) (it._emHabs ??= []).push(o.name); }
      itens.push(naurenFixarTipoAlcanceSemeado(o));
    }
    for (const it of itens) {
      if (!it._pecNome) continue;
      const lista = it._emHabs?.length ? `Entra nos ataques de: ${it._emHabs.map(n => foundry.utils.escapeHTML(n)).join(", ")}.` : "Nenhuma habilidade com teste de ataque recebeu esta Peculiaridade (escolha no Criador ou configure nas Ações).";
      it.system.descricao = it.system.descricao.replace("</p>", ` ${lista}</p>`);
      delete it._pecNome; delete it._emHabs;
    }
    // 3b) Bando (0.93): o dano de cada Ação que causa dano escala com os lacaios no alcance
    //     (todos juntos = o golpe inteiro do monstro) e cada lacaio que participa gasta 1 Estamina.
    if (s.bando >= 2) {
      for (const it of itens) {
        if (!["habilidade", "arma", "magia"].includes(it.type)) continue;
        for (const ac of it.system?.acoes ?? []) {
          const temDano = (ac.danos ?? []).some(dn => dn?.formula && dn.aplicarNoAlvo !== false);
          if (!temDano || ac.consomePerjurio) continue;
          ac.danos = ac.danos.map(dn => (dn?.formula && !/@bando/.test(dn.formula)) ? { ...dn, formula: `floor((${dn.formula})*@bandoNoAlcance/@bandoMembros)+@bandoExtra` } : dn);
          const custoBase = (Number(ac.custoEstamina) || 0) + (ac.custoEstaminaPorCategoria ? d.escala.estCat : 0);
          if (custoBase > 0 && (ac.ehAtaque || ac.modoAlvo === "selecionado")) {
            ac.custoEstamina = 0; ac.custoEstaminaPorCategoria = false;
            ac.custosRecursoProprio = [...(ac.custosRecursoProprio ?? []), { recurso: "estamina", quantidade: "@bandoNoAlcance", ativo: true }];
          }
        }
      }
    }
    // 4) Ajustes do Criador (bônus livres, Chefe, teto de PdA e ajuste fino) como um item visível.
    //    Cada valor é "o que o painel mostra" menos "o que a ficha calcula sozinha", então a ficha bate com o painel.
    const mods = this._modsAjuste(d);
    if (mods.length) itens.push({ name: "Ajustes do Criador", type: "habilidade", img: "icons/tools/hand/wrench-steel-grey.webp",
      system: { ativo: true, efeitosVinculados: [{ ativo: true, modificadores: mods }], descricao: `<p>Bônus livres, extras de ${s.chefe ? "Chefe, " : ""}teto de Poder de Ataque e ajuste fino feitos no Criador de Monstros (${mods.map(m => `${m.campo} ${Number(m.valor) > 0 ? "+" : ""}${m.valor}`).join(", ")}). Apague este item para voltar ao cálculo padrão.</p>` } });
    // 5) Ator
    const sistema = {
      nivel: s.nivel, nivelBase: s.nivel, categoriaMonstro: d.cat,
      atributos: Object.fromEntries(NAUREN_CM_ATR.map(k => [k, { value: d.ef.a[k] }])), // com bônus de Função e tetos
      calculoVida: "customizado",
      vidaFormula: `@vitalidade${monstro ? " * @categoria" : ""} * (@nivel + 2)${s.chefe ? " * 1.5" : ""}${s.bando >= 2 ? ` / ${s.bando}` : ""}`,
      defesa: d.def - d.pg.defesa, movimento: d.mov - d.pg.movimento, // os Pigmentos entram como itens e somam de novo na ficha
      notas: `<p><b>Criado com o Criador de Monstros</b> · ${monstro ? "Monstro" : "NPC"}, nível ${s.nivel}, ${s.func}${monstro ? `, Categoria ${d.cat}` : ""}${s.chefe ? ", Chefe" : ""}. Valor Base ${d.vb}.</p>`
    };
    const token = { width: d.tok, height: d.tok, disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE, texture: { src: s.imgToken || s.imgRetrato }, displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER, bar1: { attribute: "vida" }, bar2: { attribute: "estaminaCombate" } };
    const dados = { name: s.nome.trim(), type: "npc", img: s.imgRetrato, system: sistema, prototypeToken: token, flags: { nauren: { criadorMonstro: { funcao: s.func, chefe: s.chefe, versao: 2, bando: s.bando || 0 } } } };
    if (s.bando >= 2) {
      // Estamina do grupo: a do monstro inteiro (em ataques de N lacaios = 1 golpe dele), proporcional aos vivos, +1 por lacaio para andar.
      const custoGolpe = 1 + d.escala.estCat;
      dados.flags.nauren.bando = { ativo: true, membros: s.bando, estaminaFormula: `floor(@estamina * @membros / ${custoGolpe}) + @membros` };
      dados.prototypeToken.actorLink = false;
      sistema.notas += `<p><b>Bando de ${s.bando} lacaios:</b> coloque ${s.bando} tokens não vinculados. Cada um tem 1/${s.bando} da Vida; o dano das Ações escala com quantos estão no alcance (os ${s.bando} juntos = o golpe inteiro); cada lacaio que ataca gasta 1 Estamina do grupo; Estamina do grupo = ⌊Estamina × vivos ÷ ${custoGolpe}⌋ + vivos.</p>`;
    }
    let ator;
    if (destino === "bestiario") {
      const pack = game.packs.find(p => p.metadata.label === NAUREN_PACKS_DEFINICAO.monstros.label && p.metadata.type === "Actor");
      if (!pack) throw new Error("Compêndio do Bestiário não encontrado.");
      [ator] = await Actor.createDocuments([dados], { pack: pack.collection });
    } else if (this.actorBase) {
      ator = this.actorBase;
      const velhos = ator.items.map(i => i.id); if (velhos.length) await ator.deleteEmbeddedDocuments("Item", velhos);
      await ator.update(dados);
    } else {
      [ator] = await Actor.createDocuments([dados]);
    }
    await ator.createEmbeddedDocuments("Item", itens);
    await naurenPreencherRecursosNoMaximo(ator);
    return ator;
  }

  /** Aplica as Peculiaridades de golpe nas Ações de ataque de uma Habilidade/Arma copiada. */
  _aplicarPeculiaridades(item, pecs) {
    if (!pecs.length) return;
    for (const a of item.system?.acoes ?? []) {
      if (!a.ehAtaque || a.modoAlvo === "nenhum") continue;
      for (const p of pecs) {
        if (p.cond) { a.condicoesAplicadas = [...(a.condicoesAplicadas ?? []), { uuid: p.cond, acumulos: Math.max(1, p.acumulos), ativo: true, soSeAcertar: true, perguntarParaEvitar: false }]; }
        if (p.atropelador) { a.usaAtropelador = true; a.atropeladorQuantidade = String(p.atropelador); a.atropeladorRaio = a.atropeladorRaio || "1"; }
        if (p.imparavel) a.imparavelQuantidade = String(Math.max(Number(a.imparavelQuantidade) || 0, p.imparavel));
        if (p.bando) a.ataqueBonusExtra = `${a.ataqueBonusExtra ? a.ataqueBonusExtra + "+" : ""}${p.bando}*@aliados_6m`;
      }
    }
  }
}

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_criador_monstros() {


Hooks.once("ready", async () => {
  if (!game.user.isGM) return;
  // Com mais de uma sessão de Mestre (outra aba, outro navegador, conta extra na Forge), só o Mestre
  // PRINCIPAL atualiza compêndios e roda migrações - duas sessões fazendo isso ao mesmo tempo apagavam e
  // regravavam os mesmos documentos ("doc is undefined" no console).
  if (game.users.activeGM && game.users.activeGM.id !== game.user.id) {
    game.nauren = { resetarCompendios: naurenResetarCompendios };
    console.log(`Nauren RPG | Outro Mestre (${game.users.activeGM.name}) é o principal: compêndios e migrações ficam com ele.`);
    return;
  }
  // Registrado antes de tudo: o macro de reset funciona mesmo se algum passo
  // abaixo falhar.
  game.nauren = { resetarCompendios: naurenResetarCompendios };
  // Cada passo isolado: um erro não interrompe os seguintes.
  let falhou = false;
  const passo = async (nome, fn) => {
    try { await fn(); } catch (err) { falhou = true; console.error(`Nauren RPG | Falha em "${nome}".`, err); }
  };
  // Splatter antes de tudo: os passos seguintes podem esperar uma janela (ex.: "Atualizar todos").
  await passo("compatibilidade com o Splatter", () => naurenConfigurarSplatter());
  await passo("semear compêndios oficiais", () => naurenSemearTudo());
  // 0.94.22: mundo já migrado nesta versão do sistema = pula a lista inteira (abre mais rápido).
  // Cada migração continua com a própria marca, então um mundo antigo roda só as que faltam.
  const jaMigrado = (() => { try { return game.settings.get("nauren", "versaoMigrada") === game.system.version; } catch (err) { return false; } })();
  if (jaMigrado) console.log(`Nauren RPG | Mundo já migrado para ${game.system.version}.`);
  if (game.users.activeGM === game.user && !jaMigrado) {
    await passo("migração das camadas de Subclasse", () => naurenMigrarCamadasSubclasseV1());
    await passo("migração do Efeito permanente", () => naurenMigrarEfeitoPermanenteV1());
    await passo("marcar as habilidades antigas do Mago", () => naurenMigrarMagoAntigoV1());
    await passo("Marca do Caçador: tirar os Efeitos antigos", () => naurenMigrarMarcaCacadorV1());
    await passo("Árvores: coluna da esquerda sem pré-requisito", () => naurenMigrarPrereqColunaEsquerdaV1());
    await passo("Medo: custo extra de Estamina", () => naurenMigrarCustoMedoV1());
    await passo("Ímpeto e Fadiga: só o custo da habilidade", () => naurenMigrarImpetoFadigaCustoV1());
    await passo("Catalisador sem Ataque Pesado", () => naurenMigrarCatalisadorSemPesadoV1());
    await passo("Caligrafia Etérea: dano verdadeiro e 4 Energia", () => naurenMigrarCaligrafiaV1());
    await passo("Fichas de jogador: Amigáveis", () => naurenMigrarDisposicaoJogadoresV1());
    await passo("Cards de gatilho: mostrar todos", async () => {
      if (!game.user.isGM || game.settings.get("nauren", "migracaoCardsGatilhoV1")) return;
      if (game.settings.get("nauren", "cardsDeGatilho") === "resumido") await game.settings.set("nauren", "cardsDeGatilho", "todos");
      await game.settings.set("nauren", "migracaoCardsGatilhoV1", true);
    });
    await passo("Remover o compêndio de NPCs de Classe", async () => {
      const pk = game.packs.get("world.nauren-npcs-de-classe");
      if (pk && game.user.isGM) { await pk.deleteCompendium(); console.log("Nauren RPG | Compêndio de NPCs de Classe removido (só o Bestiário continua)."); }
    });
    await passo("munições sem o efeito de cura padrão", () => naurenMigrarMunicaoSemCuraV1());
    await passo("Ladino: Estudos (Lerdeza/Desestabilizar pelo nível), Avaliar, Marcar o Alvo e Olhar da Morte", () => naurenMigrarLadinoEstudosV1());
    await passo("Livro 0.8: habilidades que mudaram de regra nas fichas", () => naurenMigrarLivro08ItensV1());
    await passo("Livro 0.8: Combustão (4 pontos), Baderna, Espírito Ardiloso e Aureum", () => naurenMigrarLivro08PequenasV1());
    await passo("Eu estou acima: só contra o alvo analisado", () => naurenMigrarAcimaSoContraAlvoV1());
    await passo("Místico: correções da revisão (Caligrafia, Brinde, Restauração, Arte Divina, Estrela)", () => naurenMigrarMisticoRevisaoV1());
    await passo("Ladino: correções da revisão (Invisível no Caos, Marcar o Alvo, usos por nível)", () => naurenMigrarLadinoRevisaoV1());
    await passo("Revisão de todas as classes (0.92.1): ações, descrições e árvores de Subclasse", () => naurenMigrarRevisaoClasses092());
    await passo("Revisão do Mago (0.92.4): magias e habilidades", () => naurenMigrarRevisaoMago0924());
    await passo("Escudo de Mana e Estresse (0.92.5)", () => naurenMigrarEscudoDeMana0925());
    await passo("Crescimento e Névoa de Esporos (0.92.6)", () => naurenMigrarRegras0926());
    await passo("Ambidestria (0.92.7)", () => naurenMigrarAmbidestria0927());
    await passo("Revisão do Empíreo (0.92.13)", () => naurenMigrarEmpireo09211());
    await passo("Revisão do Druida (0.92.14)", () => naurenMigrarDruida09214());
    await passo("Sabedoria das Copas: escolher quanto transformar (0.92.15)", () => naurenMigrarSabedoria09215());
    await passo("Revisão do Guerreiro (0.92.16)", () => naurenMigrarGuerreiro09216());
    await passo("Guerreiro: respostas da revisão (0.92.17)", () => naurenMigrarGuerreiro09217());
    await passo("Revisão do Caçador (0.92.18)", () => naurenMigrarCacador09218());
    await passo("Caçador: respostas da revisão e bestas iniciais (0.92.19)", () => naurenMigrarCacador09219());
    await passo("Borda do token: do tamanho da casa, com os efeitos escolhidos (0.92.24)", () => naurenMigrarBorda09224());
    await passo("Revisão do Sacerdote (0.92.38)", () => naurenMigrarSacerdote09238());
    await passo("Respostas do Sacerdote (0.92.39)", () => naurenMigrarSacerdote09239());
    await passo("Sanatio do livro 0.8.1 (0.94.13)", () => naurenMigrarSanatio09413());
    await passo("Movimento dos tokens (0.94.16)", () => naurenMigrarMotion09416());
    await passo("Bando: bônus por cercar o alvo (0.94.23)", () => naurenMigrarBandoExtra09423());
    await passo("XP passa a ser o total acumulado (0.96.2)", () => naurenMigrarXpTotal0962());
    await passo("Armas da Loja de Invenções voltam a ter as melhorias (0.97.7)", () => naurenMigrarLojaRestaurar0977());
    await passo("Lacunas das outras classes (0.92.40)", () => naurenMigrarLacunas09240());
    await passo("Habilidades de Monstros: correções do catálogo", () => naurenMigrarHabilidadesMonstros09241());
    await passo("migração do Alvejado", () => naurenMigrarAlvejadoArcos());
    await passo("migração da Loucura", () => naurenMigrarLoucuraManual());
    await passo("migração do Canalizar", () => naurenMigrarCanalizarPorNivel());
    await passo("migração da Queimando", () => naurenMigrarQueimandoPorAcumulo());
    await passo("auditoria das Condições", () => naurenMigrarCondicoesAuditoria());
    await passo("migração dos venenos", () => naurenMigrarVenenos());
    await passo("migração da Tinta Energética", () => naurenMigrarTintaEnergetica());
    await passo("migração do peso dos escudos", () => naurenMigrarPesoEscudos());
    if (!falhou) await game.settings.set("nauren", "versaoMigrada", game.system.version).catch(() => {});
    else console.warn("Nauren RPG | Alguma migração falhou: elas rodam de novo na próxima abertura do mundo.");
    await passo("atualizar fichas na troca de versão", () => naurenOferecerSincronizacaoDeVersao());
  }
  await passo("criar o macro de reset", () => naurenGarantirMacroDeReset());
});


/* Botão no diretório de atores (só Mestre) */
Hooks.on("renderActorDirectory", (app, html) => {
  if (!game.user.isGM) return;
  const el = html instanceof HTMLElement ? html : html[0];
  if (!el || el.querySelector(".nauren-btn-criador-monstro")) return;
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "nauren-btn-criador-monstro";
  btn.innerHTML = '<i class="fas fa-dragon"></i> Criador de Monstros';
  btn.addEventListener("click", () => NaurenCriadorMonstro.abrir());
  (el.querySelector(".directory-footer") ?? el.querySelector(".directory-header") ?? el).append(btn);
});
}

export { NAUREN_CM_ATR, NAUREN_CM_BONUS_ATR, NAUREN_CM_BONUS_FAIXA, NAUREN_CM_CHEFE, NAUREN_CM_EXTRAS, NAUREN_CM_FAIXA, NAUREN_CM_FUNC, NAUREN_CM_N_HAB, NAUREN_CM_N_PEC, NAUREN_CM_PASTA_ARMAS, NAUREN_CM_PECS, NAUREN_CM_PESOS, NAUREN_CM_PIG_CAMPOS, NAUREN_CM_ROT, NAUREN_CM_TETOS, NAUREN_CM_TETO_FUNC, NaurenCriadorMonstro, naurenGarantirMacroDeReset, naurenGarantirPastaDosCompendios, naurenResetarCompendios, naurenSemearHabilidadesMonstros, naurenSemearTudo };
