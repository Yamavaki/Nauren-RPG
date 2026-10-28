/* Nauren RPG — Animações (Automated Animations, Sequencer Motion, cor do token, som sincronizado).
 * Separado do nauren.mjs na 0.94.22. Usa estas funções do arquivo principal: naurenAcaoEhCura, naurenAcaoEhGolpe, naurenAlcanceEmMetros, naurenBandoMembros, naurenEhCondicaoModelo, naurenMedirDistanciaBordas, naurenResolverPorRank, naurenTipoAlcanceAdivinhado, naurenTipoAlcanceDaAcao. */
import { naurenAcaoEhCura, naurenAcaoEhGolpe, naurenAlcanceEmMetros, naurenBandoMembros, naurenEhCondicaoModelo, naurenMedirDistanciaBordas, naurenResolverPorRank, naurenTipoAlcanceAdivinhado, naurenTipoAlcanceDaAcao } from "../nauren.mjs";
/* =====================================================================
   ANIMAÇÕES (Automated Animations + Sequencer + JB2A) - opcional
   O Nauren avisa o módulo quando uma Ação é usada e espelha Condições em
   Efeitos Ativos (sem regras) para as animações de token. Sem o módulo
   ativo, nada acontece.
   ===================================================================== */
function naurenAnimacoesDisponiveis() {
  return !!game.modules.get("autoanimations")?.active && typeof globalThis.AutomatedAnimations?.playAnimation === "function";
}
/** Nomes cadastrados no menu global do Automated Animations (todas as categorias), em minúsculas. */
function naurenAANomesCadastrados() {
  const nomes = [];
  try {
    const menus = globalThis.AutomatedAnimations?.AutorecManager?.getAutorecEntries?.() ?? {};
    const colher = (v, prof = 0) => {
      if (!v || prof > 4) return;
      if (Array.isArray(v)) { for (const x of v) colher(x, prof + 1); return; }
      if (typeof v === "object") { for (const [k, x] of Object.entries(v)) { if ((k === "label" || k === "name") && typeof x === "string") nomes.push(x.toLowerCase()); else colher(x, prof + 1); } }
    };
    colher(menus);
  } catch (err) { /* sem menu legível: trata como sem cadastro */ }
  return nomes;
}
function naurenAANomeTemAnimacao(nome) {
  const n = String(nome ?? "").toLowerCase();
  return naurenAANomesCadastrados().some(l => l && n.includes(l));
}
/** Nome de reserva pelo tipo da Ação (quando o item não tem animação cadastrada). */
function naurenAANomeReserva(item, acao) {
  if (acao.modoAlvo === "area" || acao.usaTemplate) return acao.templateTipo === "cone" ? "Nauren Sopro" : "Nauren Área";
  if (naurenAcaoEhCura(acao)) return "Nauren Cura";
  if (acao.ehAtaque) {
    if (item.type === "magia" || acao.atributoAtaque === "poderMagia") return "Nauren Magia";
    // Campo "Corpo a corpo / À distância" da Ação; em Automático, o palpite (ver naurenTipoAlcanceDaAcao).
    let tipo = naurenTipoAlcanceDaAcao(item, acao);
    if (tipo === "segueArma") tipo = naurenTipoAlcanceAdivinhado(item, acao);
    return tipo === "distancia" ? "Nauren Distância" : "Nauren Corpo a Corpo";
  }
  return "Nauren Habilidade";
}
/** Depois de uma Ação: toca a animação pelo nome do item (ou pela reserva), com alvos e atingidos. */
async function naurenAnimarAcao(actor, item, acao, resultadoAlvos, plano = null) {
  // Sem animação do módulo: o movimento dos tokens (plano) toca sozinho, sem esperar efeito nenhum.
  const semAnimacao = () => { naurenMotionEnviar(plano, false); };
  if (!naurenAnimacoesDisponiveis() || !game.settings.get("nauren", "animacoesAcoes")) return semAnimacao();
  const tokenOrigem = canvas?.tokens?.controlled?.find(t => t.actor === actor) ?? actor.getActiveTokens?.(true)?.[0] ?? null;
  if (!tokenOrigem) return semAnimacao();
  const paraObjeto = td => td?.object ?? td;
  const alvos = (resultadoAlvos?.tokensAfetados ?? []).map(paraObjeto).filter(Boolean);
  const atingidos = (resultadoAlvos?.atingidos ?? []).map(paraObjeto).filter(Boolean);
  // Ordem de busca: nome da Ação (mais específico: "Sopro Infernal" dentro do item do monstro), nome do item,
  // arma escolhida, reserva.
  // Arma Escolhida (Ímpeto, Fadiga...): a animação própria da habilidade só vale se combinar com o golpe -
  // uma entrada de corpo a corpo não toca quando o ataque escolhido é à distância (e vice-versa); aí vale a
  // animação da arma usada ou a reserva pelo tipo.
  let alvoAnimacao;
  const nomeAcao = String(acao?.nome ?? "").trim();
  let tipoGolpe = null;
  if (acao?.usaArmaEscolhida && naurenAcaoEhGolpe(acao)) {
    tipoGolpe = naurenTipoAlcanceDaAcao(item, acao);
    if (tipoGolpe === "segueArma") tipoGolpe = naurenTipoAlcanceAdivinhado(item, acao);
  }
  const contraria = nome => {
    if (!tipoGolpe) return false;
    const naMelee = !!naurenEntradaMenu(nome, /melee/i), naRange = !!naurenEntradaMenu(nome, /range/i);
    return tipoGolpe === "distancia" ? (naMelee && !naRange) : (naRange && !naMelee);
  };
  const serve = nome => !!nome && naurenAANomeTemAnimacao(nome) && !contraria(nome);
  const nomeArma = String(acao?._armaEscolhidaNome ?? "").trim();
  if (nomeAcao && nomeAcao !== item.name && serve(nomeAcao)) alvoAnimacao = { name: nomeAcao };
  else if (serve(item.name)) alvoAnimacao = item;
  else if (nomeArma && serve(nomeArma)) alvoAnimacao = { name: nomeArma };
  else {
    if (!game.settings.get("nauren", "animacoesReserva")) return semAnimacao();
    alvoAnimacao = { name: naurenAANomeReserva(item, acao) };
  }
  // Se a entrada do Automated Animations já tem Motion ligado (AA 8+), o Nauren não repete aquele lado.
  if (plano) {
    const entradaAA = naurenEntradaMenu(alvoAnimacao?.name ?? item.name, /melee|range|ontoken|templatefx|preset|aura/i);
    if (entradaAA?.motion?.source?.enable) plano.semAtacante = true;
    if (entradaAA?.motion?.target?.enable) plano.semAlvos = true;
  }
  // Áreas: a V14 desenha áreas como Regions, e o Automated Animations (7.x) trata Regions na categoria Templates.
  const regiao = resultadoAlvos?.regiao ?? null;
  const opcoes = { targets: alvos, hitTargets: atingidos, playOnMiss: true };
  // Só entrega a Region de áreas INSTANTÂNEAS: o módulo pode apagar o "template" (opção removeTemplate), e uma
  // área persistente do Nauren (dano por turno, Portal do Inferno...) não pode sumir. Persistente: anima nos alvos.
  const ehPersistente = !!(acao.usaTemplatePersistente || regiao?.getFlag?.("nauren", "persistente"));
  if (regiao && !regiao.deleted && !ehPersistente) opcoes.template = regiao;
  // Área persistente: o módulo não recebe a Region (poderia apagá-la). O Nauren toca a animação de área DESSE nome,
  // tirada do menu, direto pelo Sequencer no centro e no tamanho da área (ex.: Armadilha de Caça -> spike trap).
  if (regiao && !regiao.deleted && ehPersistente) {
    const nomes = [String(acao?.nome ?? "").trim(), item.name].filter(Boolean);
    let entrada = null;
    for (const n of nomes) { entrada = naurenEntradaMenu(n, /templatefx/i); if (entrada) break; }
    const v = entrada?.primary?.video;
    if (v?.enableCustom && v.customPath) {
      naurenMotionEnviar(plano, true);
      if (naurenTocarNaRegiao(regiao, v.customPath)) return;
    }
  }
  naurenMotionEnviar(plano, true); // antes de pedir a animação: cada tela já espera o efeito aparecer
  try {
    await globalThis.AutomatedAnimations.playAnimation(tokenOrigem, alvoAnimacao, opcoes);
  } catch (err) {
    // Se a versão instalada não aceitar a Region como template, tenta de novo sem ela (anima nos alvos).
    if (opcoes.template) {
      delete opcoes.template;
      try { await globalThis.AutomatedAnimations.playAnimation(tokenOrigem, alvoAnimacao, opcoes); return; } catch (err2) { /* cai no aviso */ }
    }
    console.warn("Nauren RPG | Automated Animations recusou a animação.", err);
  }
}
/* ---- Efeito único pelo Sequencer em cima de um token ---- */
function naurenTocarNoToken(token, arquivo, escala = 1.5) {
  if (!token || !arquivo || !globalThis.Sequence || !globalThis.Sequencer?.Database) return;
  if (!String(arquivo).includes("/") && !Sequencer.Database.entryExists(arquivo)) return;
  new Sequence().effect().name(`nauren-efeito-${token.id}`).file(arquivo).atLocation(token).scaleToObject(escala).zIndex(5).play();
}
function naurenTokenDoAtor(actor) {
  return actor?.isToken ? actor.token?.object : (canvas?.tokens?.controlled?.find(t => t.actor === actor) ?? actor?.getActiveTokens?.(true)?.[0]);
}

/** Entrada do menu do Automated Animations cujo rótulo está contido no nome (a mais específica), numa categoria. */
function naurenEntradaMenu(nome, categoria) {
  const n = String(nome ?? "").toLowerCase();
  let melhor = null;
  for (const [chave, cfg] of game.settings.settings) {
    if (!chave.startsWith("autoanimations.") || !categoria.test(chave)) continue;
    let lista; try { lista = game.settings.get(cfg.namespace, cfg.key); } catch (err) { continue; }
    for (const e of (Array.isArray(lista) ? lista : Object.values(lista ?? {}))) {
      const rot = String(e?.label ?? "").toLowerCase().trim();
      if (rot && n.includes(rot) && (!melhor || rot.length > melhor.rot.length)) melhor = { rot, e };
    }
  }
  return melhor?.e ?? null;
}
/** Toca um efeito uma vez no centro de uma Region, no tamanho dela. Devolve true se tocou. */
function naurenTocarNaRegiao(regiao, arquivo) {
  try {
    if (!globalThis.Sequence || !globalThis.Sequencer?.Database) return false;
    if (!String(arquivo).includes("/") && !Sequencer.Database.entryExists(arquivo)) return false;
    const f = regiao.shapes?.[0];
    if (!f) return false;
    let cx, cy, tam;
    if (f.radius !== undefined && f.type !== "cone") { cx = f.x; cy = f.y; tam = f.radius * 2; }
    else if (f.width !== undefined && f.height !== undefined && f.type === "rectangle") { cx = f.x + f.width / 2; cy = f.y + f.height / 2; tam = Math.max(f.width, f.height); }
    else { const b = regiao.object?.bounds; if (!b) return false; cx = b.x + b.width / 2; cy = b.y + b.height / 2; tam = Math.max(b.width, b.height); }
    new Sequence().effect().file(arquivo).atLocation({ x: cx, y: cy }).size({ width: tam, height: tam }).belowTokens(true).play();
    return true;
  } catch (err) { console.warn("Nauren RPG | animação na área persistente", err); return false; }
}

/* Acúmulo novo numa Condição que já estava no token: toca de novo, uma vez, a animação DELA no menu do
   Automated Animations (categoria Active Effects), para mostrar que o personagem recebeu mais um acúmulo. */
function naurenEntradaAefx(nome) {
  const n = String(nome ?? "").toLowerCase();
  let melhor = null;
  for (const [chave, cfg] of game.settings.settings) {
    if (!chave.startsWith("autoanimations.") || !/aefx/i.test(chave)) continue;
    let lista; try { lista = game.settings.get(cfg.namespace, cfg.key); } catch (err) { continue; }
    for (const e of (Array.isArray(lista) ? lista : Object.values(lista ?? {}))) {
      const rot = String(e?.label ?? "").toLowerCase().trim();
      if (rot && n.includes(rot) && (!melhor || rot.length > melhor.rot.length)) melhor = { rot, e };
    }
  }
  return melhor?.e ?? null;
}
function naurenAnimarAcumulo(item) {
  try {
    if (!game.settings.get("nauren", "animacoesAcoes")) return;
    const entrada = naurenEntradaAefx(item.name);
    const v = entrada?.primary?.video;
    const arquivo = v?.enableCustom ? v.customPath : null; // entradas do banco interno do módulo não têm caminho direto
    naurenTocarNoToken(naurenTokenDoAtor(item.parent), arquivo, Number(entrada?.primary?.options?.size) || 1);
  } catch (err) { console.warn("Nauren RPG | animação de acúmulo", err); }
}
Hooks.on("preUpdateItem", (item, changes, options) => {
  if (item.type === "condicao" && foundry.utils.hasProperty(changes, "system.acumulos")) options.naurenAcumulosAntes = item.system.acumulos ?? 0;
});
Hooks.on("updateItem", (item, changes, options, userId) => {
  if (userId !== game.user.id || item.type !== "condicao" || !item.parent) return;
  if (!foundry.utils.hasProperty(changes, "system.acumulos") || options.naurenAcumulosAntes === undefined) return;
  if ((item.system.acumulos ?? 0) > options.naurenAcumulosAntes && item.system.ativo !== false && !naurenEhCondicaoModelo(item)) naurenAnimarAcumulo(item);
});

/* Morte: Vida cai de acima de 0 para 0 ou menos -> caveira (a mesma dos Olhos Malignos). */
Hooks.on("preUpdateActor", (actor, changes, options) => {
  if (foundry.utils.hasProperty(changes, "system.vida.value")) options.naurenVidaAntes = actor.system.vida?.value ?? 0;
});
Hooks.on("updateActor", (actor, changes, options, userId) => {
  if (userId !== game.user.id || options.naurenVidaAntes === undefined) return;
  if (options.naurenVidaAntes > 0 && (actor.system.vida?.value ?? 0) <= 0 && game.settings.get("nauren", "animacoesAcoes")) {
    naurenTocarNoToken(naurenTokenDoAtor(actor), "jb2a.condition.curse.01.001.purple", 1.8);
  }
});

/* ---- Crítico / falha crítica: texto do JB2A em cima do token (direto pelo Sequencer) ---- */
function naurenAnimarCritico(actor, tipo) {
  try {
    if (!game.settings.get("nauren", "animacoesCriticos")) return;
    const Seq = globalThis.Sequence;
    if (!Seq || !globalThis.Sequencer?.Database) return;
    const arquivo = tipo === "critico" ? "jb2a.ui.critical.yellow" : "jb2a.ui.critical_miss.red";
    if (!Sequencer.Database.entryExists(arquivo)) return; // JB2A sem esse efeito (versão gratuita antiga, etc.)
    const token = canvas?.tokens?.controlled?.find(t => t.actor === actor) ?? actor?.getActiveTokens?.(true)?.[0];
    if (!token) return;
    new Seq()
      .effect().name(`nauren-critico-${token.id}`).file(arquivo).atLocation(token, { offset: { y: -token.h * 0.55 }, gridUnits: false })
      .scaleToObject(1.6).aboveInterface(false).zIndex(10)
      .play();
  } catch (err) { console.warn("Nauren RPG | animação de crítico", err); }
}

/* ---- Passivas: animação de aviso quando o gatilho dá efeito ou quando são ligadas pelo raio ---- */
const naurenPassivasAnimadas = new Map(); // "atorUuid|itemId" -> horário da última animação
async function naurenAnimarPassiva(actor, item) {
  try {
    if (!naurenAnimacoesDisponiveis() || !game.settings.get("nauren", "animacoesAcoes")) return;
    if (!actor || !item?.name || !naurenAANomeTemAnimacao(item.name)) return; // passiva sem entrada: sem reserva, para não poluir a mesa
    const chave = `${actor.uuid}|${item.id}`;
    const agora = Date.now();
    if (agora - (naurenPassivasAnimadas.get(chave) ?? 0) < 1500) return; // vários disparos seguidos (acúmulos): anima uma vez
    naurenPassivasAnimadas.set(chave, agora);
    const token = actor.isToken ? actor.token?.object : actor.getActiveTokens?.(true)?.[0];
    if (!token) return;
    await globalThis.AutomatedAnimations.playAnimation(token, { name: item.name }, { targets: [] });
  } catch (err) { console.warn("Nauren RPG | animação da passiva", err); }
}
Hooks.on("updateItem", (item, changes, options, userId) => {
  if (userId !== game.user.id || !["habilidade", "efeito"].includes(item.type) || item.system.usaEmanacao) return;
  if (!foundry.utils.hasProperty(changes, "system.ativo") || !item.system.ativo) return;
  naurenAnimarPassiva(item.actor, item);
});

/* ---- Auras (habilidades com Emanação, ex.: Presença): ligar/desligar pelo botão ---- */
const naurenAurasTocando = new Map(); // "itemUuid|tokenId" -> [efeitos do Sequencer criados ao ligar]
function naurenTokenDoItem(item) {
  const actor = item?.actor;
  if (!actor) return null;
  return actor.isToken ? actor.token?.object ?? null : actor.getActiveTokens?.(true)?.[0] ?? null;
}
async function naurenLigarAnimacaoAura(item) {
  if (!naurenAnimacoesDisponiveis() || !game.settings.get("nauren", "animacoesAcoes")) return;
  const token = naurenTokenDoItem(item);
  if (!token) return;
  const chave = `${item.uuid}|${token.id}`;
  if (naurenAurasTocando.has(chave)) return; // já tocando
  // Se sobrou algo desta aura no token (o módulo trata aura persistente como liga/desliga: com um resto
  // registrado, ele DESLIGARIA em vez de tocar), encerra e espera sumir de verdade antes de pedir de novo.
  const restos = naurenEfeitosDaAura(item, token);
  if (restos.length) {
    await naurenEncerrarEfeitosSequencer(restos);
    for (let n = 0; n < 30 && naurenEfeitosDaAura(item, token).length; n++) await new Promise(r => setTimeout(r, 100));
  }
  let alvoAnimacao = item;
  if (!naurenAANomeTemAnimacao(item.name)) {
    if (!game.settings.get("nauren", "animacoesReserva")) return;
    alvoAnimacao = { name: "Nauren Aura" };
  }
  const gerente = globalThis.Sequencer?.EffectManager;
  const antes = new Set((gerente?.getEffects?.({ object: token }) ?? []).map(e => e.id ?? e.data?.id));
  naurenAurasTocando.set(chave, []);
  // A animação nasce no tamanho atual da Emanação (raio do rank atual, a partir da borda do token).
  naurenAuraTamanhoPendente.set(token.document.uuid, { item, ate: Date.now() + 5000 });
  try { await globalThis.AutomatedAnimations.playAnimation(token, alvoAnimacao, { targets: [] }); }
  catch (err) { naurenAurasTocando.delete(chave); naurenAuraTamanhoPendente.delete(token.document.uuid); console.warn("Nauren RPG | Automated Animations recusou a aura.", err); return; }
  setTimeout(() => { if (naurenAuraTamanhoPendente.get(token.document.uuid)?.item === item) naurenAuraTamanhoPendente.delete(token.document.uuid); }, 5000);
  // Os efeitos persistentes nascem logo depois: guarda quais são, para encerrar ao desligar.
  setTimeout(() => {
    const novos = (gerente?.getEffects?.({ object: token }) ?? []).filter(e => !antes.has(e.id ?? e.data?.id));
    if (naurenAurasTocando.has(chave)) naurenAurasTocando.set(chave, novos);
    if (novos.length) console.log(`Nauren RPG | Aura "${item.name}": efeitos do Sequencer`, novos.map(e => ({ id: e.id ?? e.data?.id, nome: e.data?.name, origem: e.data?.origin })));
  }, 1500);
}
/** Encerra efeitos pelo gerenciador do Sequencer: apaga também o registro persistente na cena (para todos). */
async function naurenEncerrarEfeitosSequencer(efeitos) {
  const gerente = globalThis.Sequencer?.EffectManager;
  if (!gerente || !efeitos?.length) return;
  const ids = efeitos.map(e => e?.id ?? e?.data?.id).filter(Boolean);
  try { if (ids.length) await gerente.endEffects({ effects: ids }); }
  catch (err) { for (const e of efeitos) { try { await e.endEffect?.(); } catch (err2) { /* já terminou */ } } }
}
/** Efeitos do Sequencer desta aura neste token (pela origem do item ou pelo nome). */
function naurenEfeitosDaAura(item, token) {
  const gerente = globalThis.Sequencer?.EffectManager;
  if (!gerente || !token) return [];
  try {
    return (gerente.getEffects?.({ object: token }) ?? []).filter(e => {
      const d = e.data ?? {};
      return d.origin === item.uuid || (d.origin && String(d.origin).endsWith(item.id)) || (item.name && String(d.name ?? "").includes(item.name));
    });
  } catch (err) { return []; }
}
async function naurenDesligarAnimacaoAura(item, tokenParam = null) {
  const gerente = globalThis.Sequencer?.EffectManager;
  if (!gerente) return;
  const token = tokenParam ?? naurenTokenDoItem(item);
  const chave = token ? `${item.uuid}|${token.id}` : null;
  const guardados = chave ? naurenAurasTocando.get(chave) ?? [] : [];
  if (chave) naurenAurasTocando.delete(chave);
  await naurenEncerrarEfeitosSequencer(guardados);
  // Depois de recarregar a página não há registro em memória: procura pela origem (item) e pelo nome.
  try {
    const restantes = (gerente.getEffects?.(token ? { object: token } : {}) ?? []).filter(e => {
      const d = e.data ?? {};
      return d.origin === item.uuid || String(d.name ?? "").includes(item.name) || (d.origin && String(d.origin).endsWith(item.id));
    });
    await naurenEncerrarEfeitosSequencer(restantes);
  } catch (err) { /* sem efeitos */ }
}
Hooks.on("updateItem", (item, changes, options, userId) => {
  if (userId !== game.user.id || !["habilidade", "efeito"].includes(item.type) || !item.system.usaEmanacao) return;
  if (!foundry.utils.hasProperty(changes, "system.ativo")) return;
  if (item.system.ativo) naurenLigarAnimacaoAura(item).catch(err => console.warn("Nauren RPG | aura (ligar)", err));
  else naurenDesligarAnimacaoAura(item).catch(err => console.warn("Nauren RPG | aura (desligar)", err));
});
Hooks.on("createItem", (item, options, userId) => {
  if (userId !== game.user.id || !["habilidade", "efeito"].includes(item.type) || !item.system.usaEmanacao || !item.system.ativo) return;
  naurenLigarAnimacaoAura(item).catch(err => console.warn("Nauren RPG | aura (criada)", err));
});
Hooks.on("deleteItem", (item, options, userId) => {
  if (userId !== game.user.id || !["habilidade", "efeito"].includes(item.type) || !item.system.usaEmanacao) return;
  naurenDesligarAnimacaoAura(item).catch(err => console.warn("Nauren RPG | aura (apagada)", err));
});

/* =====================================================================
   MOVIMENTO DOS TOKENS (Motion do Sequencer 4.3+) - 0.94.16, opcional
   Só visual: a posição real do token não muda (alcance, áreas e
   empurrões continuam pela posição de verdade).
   Sincronia: quem usa a Ação manda um "plano" (quem atacou, quem foi
   atingido, o que cada alvo fez) para todas as telas. Cada tela espera
   a animação do Automated Animations APARECER nela (vídeo carregado) e
   toca o movimento no ponto do impacto, localmente - assim um servidor
   lento não deixa o tremor acontecer antes do golpe.
   ===================================================================== */
const NAUREN_MOTION_ESPERA_EFEITO = 2000;   // ms: sem animação nesse tempo, toca sozinho
const NAUREN_MOTION_JANELA_EFEITOS = 120;   // ms: junta os efeitos da mesma animação
const naurenMotionPlanos = new Map();       // id -> { plano, recebido, efeitos, timer, agendado }
const naurenMotionEfeitosRecentes = [];     // { ef, t, fonte, alvo, criador }
let naurenMotionContador = 0;               // id do plano sem gastar o sorteio (Math.random)
let naurenMotionUltimoPlano = 0;            // quando chegou o último plano (o som só espera um vídeo que ainda vai nascer logo depois de uma Ação)

function naurenMotionPode() {
  try {
    if (!game.modules.get("sequencer")?.active) return false;
    if (!globalThis.Sequencer?.MotionManager || typeof globalThis.Sequence !== "function") return false;
    if (typeof globalThis.Sequence.prototype?.motion !== "function") return false;
    if (!game.settings.get("nauren", "motionAtivo") || !game.settings.get("nauren", "motionMinhaTela")) return false;
    return !!canvas?.ready;
  } catch (err) { return false; }
}
function naurenMotionForca() {
  try { return Math.max(0.25, Math.min(2, Number(game.settings.get("nauren", "motionIntensidade")) || 1)); } catch (err) { return 1; }
}
/** Token (objeto do canvas) pelo uuid, só na cena que esta tela está vendo. */
function naurenMotionToken(uuid) {
  if (!uuid) return null;
  let doc = null;
  try { doc = fromUuidSync(uuid); } catch (err) { doc = null; }
  if (!doc || (doc.parent?.id && doc.parent.id !== canvas?.scene?.id)) return null;
  const obj = doc.object ?? null;
  return obj && !obj.destroyed ? obj : null;
}
function naurenMotionUuid(v) {
  if (!v) return null;
  if (typeof v === "string") return v;
  return v.uuid ?? v.document?.uuid ?? null;
}
/** Toca uma Sequência de Motion só nesta tela (cada tela toca a sua, sincronizada com o que ela vê). */
function naurenMotionTocar(token, montar, { nome = null, persistir = false } = {}) {
  if (!token || token.destroyed || !naurenMotionPode()) return false;
  try {
    const seq = new Sequence({ moduleName: "nauren", softFail: true });
    const m = seq.motion().on(token);
    if (nome) m.name(nome);
    montar(m);
    if (persistir) m.persist();
    seq.play({ local: true });
    return true;
  } catch (err) { console.warn("Nauren RPG | movimento do token", err); return false; }
}
const naurenEsperarMs = ms => new Promise(r => setTimeout(r, Math.max(0, ms)));

/* ---- Presets: atacante ---- */
function naurenMotionAtacante(preset, token, alvo, opcoes = {}) {
  const k = naurenMotionForca();
  const crit = !!opcoes.critico;
  switch (preset) {
    case "bote":
      if (!alvo) return naurenMotionAtacante("pulo", token, null, opcoes);
      return naurenMotionTocar(token, m => m.moveBy((crit ? 0.55 : 0.32) * k, { towards: alvo, gridUnits: true, duration: 130, ease: "easeOutQuad", returnDuration: 220, easeOut: "easeInOutQuad" }));
    case "recuo":
      if (!alvo) return false;
      return naurenMotionTocar(token, m => {
        m.moveBy((opcoes.fogo ? 0.16 : 0.1) * k, { awayFrom: alvo, gridUnits: true, duration: 80, ease: "easeOutCubic", returnDuration: 220 });
        if (opcoes.fogo) m.noise({ strengthScaledToObject: 0.025 * k, frequency: 25, duration: 160, fadeOutDuration: 90 });
      });
    case "conjurar":
      return naurenMotionTocar(token, m => m.scaleTo(1.08, { duration: 160, ease: "easeOutQuad", returnDuration: 260 }));
    case "pulo":
      return naurenMotionTocar(token, m => m.moveBy({ y: -0.28 * k }, { gridUnits: true, duration: 140, ease: "easeOutQuad", returnDuration: 200, easeOut: "easeInQuad" }));
    case "girar":
      return naurenMotionTocar(token, m => m.rotateBy(360, { duration: 450, ease: "easeInOutQuad", return: false }));
    case "rebobinar":
      naurenCorFlash(token, "#ffd36b", { forca: 0.6, sobe: 250, fica: 200, desce: 500 });
      return naurenMotionTocar(token, m => m.rotateBy(-720, { duration: 750, ease: "easeInOutCubic", return: false }));
    case "surgir":
      return naurenMotionTocar(token, m => {
        m.scaleTo([{ v: 0.2 }, { v: 1.12, duration: 380, inEase: "easeOutBack" }, { v: 1, duration: 160 }], { return: false });
        m.noise({ strengthScaledToObject: 0.03 * k, frequency: 30, duration: 300, delay: 380, fadeOutDuration: 120 });
      });
    case "tremer":
      return naurenMotionTocar(token, m => m.noise({ strengthScaledToObject: 0.04 * k, frequency: 28, duration: 400, fadeOutDuration: 150 }));
    case "crescer":
      return naurenMotionTocar(token, m => m.scaleTo(1.2, { duration: 300, ease: "easeOutBack", returnDuration: 400 }));
    case "tropecar":
      return naurenMotionTocar(token, m => { m.rotateTo([0, -18, 10, 0], { duration: 520, ease: "easeInOutQuad" }); m.noise({ strengthScaledToObject: 0.02 * k, frequency: 40, duration: 300, fadeOutDuration: 120 }); });
    default: return false;
  }
}

/* ---- Presets: alvo (pelo resultado) ---- */
function naurenMotionAlvo(preset, token, atacante, opcoes = {}) {
  const k = naurenMotionForca();
  const f = Math.max(0.05, Math.min(1, Number(opcoes.forca) || 0.2));
  const crit = !!opcoes.critico;
  switch (preset) {
    case "acerto":
      naurenCorFlash(token, "#ff2a2a", { forca: 0.55 + 0.3 * f });
      return naurenMotionTocar(token, m => {
        if (atacante) m.moveBy((0.08 + 0.22 * f + (crit ? 0.3 : 0)) * k, { awayFrom: atacante, gridUnits: true, duration: 110, ease: "easeOutCubic", returnDuration: 280 });
        m.noise({ strengthScaledToObject: (0.02 + 0.06 * f) * k, frequency: 28, duration: 220 + 260 * f, fadeOutDuration: 120 });
      });
    case "bloqueou":
      if (opcoes.sofreuDano) naurenCorFlash(token, "#ff5a5a", { forca: 0.35 });
      return naurenMotionTocar(token, m => {
        if (atacante) m.moveBy(0.12 * k, { awayFrom: atacante, gridUnits: true, duration: 100, ease: "easeOutCubic", returnDuration: 220 });
        m.noise({ strengthScaledToObject: 0.015 * k, frequency: 35, duration: 140, fadeOutDuration: 80 });
      });
    case "esquivou": {
      // Passo para o lado, de lado em relação a quem atacou (o projétil passa por onde ele estava).
      const a = atacante?.center, b = token?.center;
      let px = 1, py = 0;
      if (a && b) {
        const dx = b.x - a.x, dy = b.y - a.y, n = Math.hypot(dx, dy) || 1;
        const lado = (opcoes.lado ?? 1) >= 0 ? 1 : -1;
        px = (-dy / n) * lado; py = (dx / n) * lado;
      }
      const d = 0.45 * k;
      return naurenMotionTocar(token, m => m.moveBy({ x: px * d, y: py * d }, { gridUnits: true, duration: 150, ease: "easeOutQuad", returnDuration: 260, easeOut: "easeInOutQuad" }));
    }
    case "cura":
      naurenCorFlash(token, naurenCorConfig("motionCorCura", "#4dff88"), { forca: 0.6, sobe: 220, fica: 150, desce: 500 });
      return naurenMotionTocar(token, m => m.scaleTo(1.06, { duration: 250, ease: "easeOutQuad", returnDuration: 350 }));
    case "tremer":
      return naurenMotionTocar(token, m => m.noise({ strengthScaledToObject: 0.04 * k, frequency: 28, duration: 350, fadeOutDuration: 120 }));
    case "empurrar":
      if (!atacante) return false;
      return naurenMotionTocar(token, m => m.moveBy(0.5 * k, { awayFrom: atacante, gridUnits: true, duration: 140, ease: "easeOutCubic", returnDuration: 320 }));
    case "girar":
      return naurenMotionTocar(token, m => m.rotateBy(360, { duration: 450, ease: "easeInOutQuad", return: false }));
    case "pulo":
      return naurenMotionAtacante("pulo", token, null, opcoes);
    default: return false;
  }
}

/** Monta o plano de movimento de uma Ação já resolvida (quem atacou, o que aconteceu em cada alvo). */
function naurenMotionPlanoDaAcao(actor, item, acao, resultadoAlvos, { critico = false, falhaCritica = false } = {}) {
  if (!actor || !acao) return null;
  const tokAt = canvas?.tokens?.controlled?.find(t => t.actor === actor) ?? actor.getActiveTokens?.(true)?.[0] ?? null;
  if (!tokAt?.document?.uuid) return null;
  let tipo = "outro";
  if (acao.modoAlvo === "area" || acao.usaTemplate) tipo = "area";
  else if (acao.ehAtaque) {
    if (item?.type === "magia" || acao.atributoAtaque === "poderMagia") tipo = "magia";
    else {
      let alc = naurenTipoAlcanceDaAcao(item, acao);
      if (alc === "segueArma") alc = naurenTipoAlcanceAdivinhado(item, acao);
      tipo = alc === "distancia" ? "distancia" : "corpo";
    }
  } else if (naurenAcaoEhCura(acao)) tipo = "cura";
  const nomes = `${item?.name ?? ""} ${acao.nome ?? ""} ${acao._armaEscolhidaNome ?? ""}`;
  const fogo = tipo === "distancia" && /fogo|pistola|rifle|mosquete|bacamarte|espingarda|rev[oó]lver|canh[aã]o|disparo/i.test(nomes);
  const meuUuid = tokAt.document.uuid;
  const alvos = (resultadoAlvos?.motionAlvos ?? []).filter(a => a?.uuid && a.uuid !== meuUuid).map((a, i) => {
    let resultado = "nada", forca = 0, sofreuDano = false;
    const reacao = String(a.reacao ?? "");
    if ((a.cura ?? 0) > 0 || a.curaRecebida) resultado = "cura";
    else if (a.acertou === false) resultado = "errou";
    else if (a.evitou) resultado = /esquiv/.test(reacao) ? "esquivou" : reacao === "contra-atacar" ? "defletiu" : "bloqueou";
    else if ((a.dano ?? 0) > 0) {
      sofreuDano = true;
      forca = Math.max(0.05, Math.min(1, (a.dano ?? 0) / Math.max(1, a.vidaMax ?? 0)));
      resultado = reacao === "bloquear" ? "bloqueou" : "acerto";
    } else if (a.acertou === true && reacao === "bloquear") resultado = "bloqueou";
    return { uuid: a.uuid, resultado, forca, sofreuDano, lado: i % 2 ? -1 : 1 };
  });
  // Bando: os lacaios vivos com o alvo no alcance dão o bote junto.
  let extras = [];
  if (tipo === "corpo" && alvos.length) {
    try {
      const alvoObj = naurenMotionToken(alvos[0].uuid);
      const alcance = naurenAlcanceEmMetros(acao);
      extras = naurenBandoMembros(tokAt.document).filter(t => t.uuid !== meuUuid && t.object && alvoObj
        && (!Number.isFinite(alcance) || naurenMedirDistanciaBordas(t.object, alvoObj) <= alcance + 0.01)).map(t => t.uuid);
    } catch (err) { extras = []; }
  }
  const motionUsuario = acao.motionUsuario || "auto", motionAlvo = acao.motionAlvo || "auto";
  if (tipo === "outro" && !alvos.length && motionUsuario === "auto") return null;
  if (motionUsuario === "nenhum" && motionAlvo === "nenhum") return null;
  return { id: `${game.user.id}-${Date.now().toString(36)}-${++naurenMotionContador}`, usuario: game.user.id, cena: canvas.scene?.id ?? "", atacante: meuUuid, extras, tipo, fogo,
    critico: !!critico, falhaCritica: !!falhaCritica, alvos, motionUsuario, motionAlvo, semAtacante: false, semAlvos: false };
}

/** Manda o plano para todas as telas (uma vez). comAnimacao: as telas esperam a animação aparecer. */
function naurenMotionEnviar(plano, comAnimacao) {
  if (!plano || plano._enviado) return;
  plano._enviado = true;
  plano.comAnimacao = !!comAnimacao;
  const limpo = { ...plano }; delete limpo._enviado;
  naurenMotionParaOutrasTelas({ tipo: "motionPlano", plano: limpo });
  naurenMotionReceberPlano(limpo);
}
const NAUREN_QUERY_MOTION = "nauren.motion";
const naurenMotionVistos = new Set(); // ids de avisos já tratados nesta tela
function naurenMotionDeOutraTela(msg) {
  if (!msg) return;
  if (msg.id) { if (naurenMotionVistos.has(msg.id)) return; naurenMotionVistos.add(msg.id); if (naurenMotionVistos.size > 300) naurenMotionVistos.delete(naurenMotionVistos.values().next().value); }
  if (msg.tipo === "motionPlano") naurenMotionReceberPlano(msg.plano);
  else if (msg.tipo === "motionEvento") naurenMotionEvento(msg.evento, msg.dados);
}
/** Manda o aviso para cada outra pessoa conectada (sem esperar resposta). */
function naurenMotionParaOutrasTelas(msg) {
  const id = `${game.user.id}-${Date.now().toString(36)}-${++naurenMotionContador}`;
  for (const u of game.users ?? []) {
    if (!u.active || u.id === game.user.id || typeof u.query !== "function") continue;
    try { u.query(NAUREN_QUERY_MOTION, { ...msg, id }, { timeout: 8000 }).catch(() => {}); } catch (err) { /* tela fechada */ }
  }
}
/** Eventos avulsos (Prioridade recebida, empurrão, token que surge) em todas as telas. */
function naurenMotionEmTodos(evento, dados) {
  naurenMotionParaOutrasTelas({ tipo: "motionEvento", evento, dados });
  naurenMotionEvento(evento, dados);
}
function naurenMotionEvento(evento, dados = {}) {
  if (!naurenMotionPode() && !naurenCorPode()) return;
  const tok = naurenMotionToken(dados.token);
  if (!tok) return;
  const k = naurenMotionForca();
  if (evento === "prioridade") {
    naurenCorFlash(tok, "#ffd75a", { forca: 0.55, sobe: 150, fica: 120, desce: 400 });
    naurenMotionTocar(tok, m => m.moveBy({ y: -0.3 * k }, { gridUnits: true, duration: 150, ease: "easeOutQuad", returnDuration: 220, easeOut: "easeInQuad" }));
  }
  else if (evento === "empurrao") {
    // Arremesso/empurrão: cresce no caminho (como se voasse) e treme ao bater.
    const dur = Math.max(250, Math.min(900, 120 * (Number(dados.metros) || 1)));
    naurenMotionTocar(tok, m => {
      m.scaleTo([{ v: 1 }, { v: 1.15, duration: dur / 2, inEase: "easeOutQuad" }, { v: 1, duration: dur / 2, inEase: "easeInQuad" }], { return: false });
      if (dados.colidiu) m.noise({ strengthScaledToObject: 0.05 * k, frequency: 25, duration: 280, delay: dur, fadeOutDuration: 120 });
    });
  } else if (evento === "surgir") naurenMotionAtacante("surgir", tok, null);
  else if (evento === "preset") naurenMotionAtacante(dados.preset, tok, naurenMotionToken(dados.alvo));
}

function naurenMotionCasa(plano, rec) {
  // A animação da Ação nasce na tela de quem usou a Ação: efeitos de outra pessoa (a Condição aplicada
  // pela tela do Mestre, a caveira da morte...) não contam.
  if (rec.criador && plano.usuario && rec.criador !== plano.usuario) return false;
  const tokens = new Set([plano.atacante, ...(plano.extras ?? []), ...(plano.alvos ?? []).map(a => a.uuid)]);
  if ((rec.fonte && tokens.has(rec.fonte)) || (rec.alvo && tokens.has(rec.alvo))) return true;
  // Áreas: o efeito nasce no ponto da área (sem token) - vale o efeito de quem usou a Ação.
  return plano.tipo === "area" && rec.criador === plano.usuario;
}
/**
 * 0.94.21: animações em duas etapas (ex.: magia com a conjuração no próprio token e depois o lançamento).
 * "Preparo" = efeito só no token de quem usa a Ação, sem alvo e sem o nome "spot ..." que o Automated
 * Animations dá ao efeito principal. O movimento e o impacto esperam o efeito PRINCIPAL (o lançamento).
 */
function naurenMotionEhPreparo(plano, rec) {
  if (/^spot /.test(rec.nome ?? "")) return false;            // efeito principal do Automated Animations
  if (rec.alvo) return false;                                   // projétil/raio até o alvo
  if (rec.fonte !== plano.atacante) return false;               // nasceu no alvo ou no ponto da área
  return (plano.alvos ?? []).length > 0 || plano.tipo === "area"; // ação em si mesmo: o efeito nele é o principal
}
/** Preparo visto: o prazo para desistir passa a contar do fim dele (a conjuração pode ser longa). */
async function naurenMotionAnotarPreparo(reg, rec) {
  if (rec._usadoPor || reg.agendado) return;
  rec._usadoPor = reg.plano.id;
  reg.preparos = (reg.preparos ?? 0) + 1;
  if (reg.timer) clearTimeout(reg.timer);
  reg.timer = null;
  const ef = rec.ef;
  const t0 = Date.now();
  while (ef && !ef.ready && !ef._ended && !ef.destroyed && Date.now() - t0 < 6000) await naurenEsperarMs(25);
  if (reg.agendado || !naurenMotionPlanos.has(reg.plano.id)) return;
  const resta = ef?.ready ? Math.max(0, (Number(ef._totalDuration) || 0) - (Date.now() - t0)) : 0;
  if (reg.timer) clearTimeout(reg.timer);
  reg.timer = setTimeout(() => {
    if (reg.agendado) return;
    naurenMotionPlanos.delete(reg.plano.id);
    naurenMotionExecutar(reg.plano, null).catch(err => console.warn("Nauren RPG | movimento dos tokens", err));
  }, resta + NAUREN_MOTION_ESPERA_EFEITO);
}
function naurenMotionReceberPlano(plano) {
  if (plano?.comAnimacao) naurenMotionUltimoPlano = Date.now();
  if (!plano?.id || (!naurenMotionPode() && !naurenCorPode())) return;
  if (plano.cena && plano.cena !== canvas.scene?.id) return;
  if (naurenMotionPlanos.has(plano.id)) return;
  if (!plano.comAnimacao) { naurenMotionExecutar(plano, null).catch(err => console.warn("Nauren RPG | movimento dos tokens", err)); return; }
  const reg = { plano, recebido: Date.now(), efeitos: [], timer: null, agendado: false };
  naurenMotionPlanos.set(plano.id, reg);
  // A animação pode ter chegado antes do plano (outra tela): procura nos efeitos recentes.
  const agora = Date.now();
  // Só os bem recentes: um efeito mais velho é de antes da Ação (ex.: a animação de uma Condição aplicada no golpe).
  // Na tela de quem usou a Ação o plano chega antes da animação: lá não precisa olhar para trás.
  if (plano.usuario !== game.user.id) for (const rec of naurenMotionEfeitosRecentes) if (agora - rec.t < 600 && naurenMotionCasa(plano, rec)) {
    if (naurenMotionEhPreparo(plano, rec)) naurenMotionAnotarPreparo(reg, rec).catch(() => {}); else naurenMotionAnotarEfeito(reg, rec);
  }
  if (!reg.agendado && !reg.preparos) reg.timer = setTimeout(() => {
    if (reg.agendado) return;
    naurenMotionPlanos.delete(plano.id);
    naurenMotionExecutar(plano, null).catch(err => console.warn("Nauren RPG | movimento dos tokens", err));
  }, NAUREN_MOTION_ESPERA_EFEITO);
}
function naurenMotionAnotarEfeito(reg, rec) {
  if (rec._usadoPor) return;
  rec._usadoPor = reg.plano.id;
  reg.efeitos.push(rec);
  if (reg.agendado) return;
  reg.agendado = true;
  if (reg.timer) clearTimeout(reg.timer);
  setTimeout(() => {
    naurenMotionPlanos.delete(reg.plano.id);
    naurenMotionSincronizar(reg).catch(err => console.warn("Nauren RPG | movimento dos tokens (sincronia)", err));
  }, NAUREN_MOTION_JANELA_EFEITOS);
}
Hooks.on("createSequencerEffect", ef => {
  try {
    const d = ef?.data ?? {};
    if (d.persist || /^nauren/i.test(String(d.name ?? ""))) return; // auras, Condições e o texto de crítico não contam
    let fonte = naurenMotionUuid(d.source), alvo = naurenMotionUuid(d.target);
    try { fonte = fonte ?? ef.sourceDocument?.uuid ?? null; } catch (err) { /* sem fonte */ }
    try { alvo = alvo ?? ef.targetDocument?.uuid ?? null; } catch (err) { /* sem alvo */ }
    const rec = { ef, t: Date.now(), nome: String(d.name ?? ""), fonte: typeof fonte === "string" ? fonte : null, alvo: typeof alvo === "string" ? alvo : null, criador: d.creatorUserId ?? null };
    naurenMotionEfeitosRecentes.push(rec);
    while (naurenMotionEfeitosRecentes.length > 40 || (naurenMotionEfeitosRecentes[0] && Date.now() - naurenMotionEfeitosRecentes[0].t > 12000)) naurenMotionEfeitosRecentes.shift();
    for (const reg of naurenMotionPlanos.values()) {
      if (!naurenMotionCasa(reg.plano, rec)) continue;
      if (naurenMotionEhPreparo(reg.plano, rec)) naurenMotionAnotarPreparo(reg, rec).catch(err => console.warn("Nauren RPG | movimento dos tokens (preparo)", err));
      else naurenMotionAnotarEfeito(reg, rec);
      break;
    }
  } catch (err) { console.warn("Nauren RPG | movimento dos tokens (efeito)", err); }
});

/** Espera o efeito aparecer NESTA tela (vídeo carregado) e devolve em quantos ms vem o impacto. */
async function naurenMotionImpactoDoEfeito(ef) {
  const t0 = Date.now();
  while (ef && !ef.ready && !ef._ended && !ef.destroyed && Date.now() - t0 < 6000) await naurenEsperarMs(25);
  if (!ef || ef._ended || ef.destroyed || !ef.ready) return null;
  const taxa = Number(ef.mediaPlaybackRate) || 1;
  // Marca de impacto no próprio arquivo (banco do Sequencer/JB2A), se houver.
  try {
    if (ef._file?.originalMetadata?.timestamps && typeof ef._file.getTimestamps === "function") {
      const ts = ef._file.getTimestamps();
      const primeiro = (Array.isArray(ts) ? ts : [ts]).find(n => Number.isFinite(n) && n > 0);
      if (primeiro) return primeiro / taxa;
    }
  } catch (err) { /* sem marcas */ }
  const dur = Number(ef._totalDuration) || 0;
  let pct = 45;
  try { pct = Number(game.settings.get("nauren", "motionImpacto")) || 45; } catch (err) { pct = 45; }
  return dur > 0 ? dur * pct / 100 : 350;
}
async function naurenMotionSincronizar(reg) {
  const plano = reg.plano;
  const alvosUuid = new Set((plano.alvos ?? []).map(a => a.uuid));
  const ef = reg.efeitos.find(e => e.fonte === plano.atacante && e.alvo && alvosUuid.has(e.alvo))
    ?? reg.efeitos.find(e => e.alvo && alvosUuid.has(e.alvo)) ?? reg.efeitos.find(e => e.fonte === plano.atacante) ?? reg.efeitos[0];
  const impacto = await naurenMotionImpactoDoEfeito(ef?.ef);
  // Alvos com animação própria (vários alvos): cada um reage no impacto da sua.
  const proprios = new Map();
  for (const e of reg.efeitos) if (e !== ef && e.alvo && alvosUuid.has(e.alvo) && !proprios.has(e.alvo)) proprios.set(e.alvo, e.ef);
  await naurenMotionExecutar(plano, impacto, proprios);
}

/** Toca o plano. impacto: ms até o golpe chegar (null = sem animação, tempos padrão). */
async function naurenMotionExecutar(plano, impacto = null, efeitosPorAlvo = new Map()) {
  if (!naurenMotionPode() && !naurenCorPode()) return;
  const padrao = { corpo: 150, distancia: 380, magia: 420, area: 300, cura: 200, outro: 150 }[plano.tipo] ?? 200;
  const tImpacto = Number.isFinite(impacto) ? impacto : padrao;
  const atacante = naurenMotionToken(plano.atacante);
  const primeiroAlvo = naurenMotionToken(plano.alvos?.[0]?.uuid);
  // Atacante
  if (atacante && !plano.semAtacante && plano.motionUsuario !== "nenhum") {
    let preset = plano.motionUsuario;
    let quando = 0;
    if (preset === "auto") {
      preset = plano.falhaCritica ? "tropecar"
        : plano.tipo === "corpo" ? "bote"
        : plano.tipo === "distancia" ? "recuo"
        : plano.tipo === "magia" || plano.tipo === "area" || plano.tipo === "cura" ? "conjurar" : null;
    }
    if (preset === "bote") quando = Math.max(0, tImpacto - 130); // o bote chega junto do golpe
    if (preset) {
      const opc = { critico: plano.critico, fogo: plano.fogo };
      setTimeout(() => naurenMotionAtacante(preset, atacante, primeiroAlvo, opc), quando);
      // Bando: os outros lacaios dão o bote junto (um pouco desencontrados).
      if (preset === "bote") for (const [i, u] of (plano.extras ?? []).entries()) {
        const t = naurenMotionToken(u);
        if (t) setTimeout(() => naurenMotionAtacante("bote", t, primeiroAlvo, opc), quando + 40 + 35 * i);
      }
    }
  }
  // Alvos
  if (plano.semAlvos || plano.motionAlvo === "nenhum") return;
  for (const a of plano.alvos ?? []) {
    const tok = naurenMotionToken(a.uuid);
    if (!tok) continue;
    let preset = plano.motionAlvo === "auto" ? a.resultado : plano.motionAlvo;
    if (plano.motionAlvo !== "auto" && ["errou", "esquivou"].includes(a.resultado)) preset = a.resultado; // erro continua erro
    if (preset === "errou" || preset === "nada") continue;
    const opc = { forca: a.forca, critico: plano.critico, sofreuDano: a.sofreuDano, lado: a.lado };
    const tocar = (ms) => {
      const quando = preset === "esquivou" ? Math.max(0, ms - 150) : ms; // a esquiva começa antes do golpe chegar
      setTimeout(() => {
        if (preset === "defletiu") {
          naurenMotionAlvo("bloqueou", tok, atacante, opc);
          if (atacante) naurenMotionTocar(atacante, m => m.moveBy(0.25 * naurenMotionForca(), { awayFrom: tok, gridUnits: true, duration: 120, ease: "easeOutCubic", returnDuration: 300 }));
        } else naurenMotionAlvo(preset, tok, atacante, opc);
      }, quando);
    };
    const efProprio = efeitosPorAlvo?.get?.(a.uuid);
    if (efProprio) naurenMotionImpactoDoEfeito(efProprio).then(ms => tocar(Number.isFinite(ms) ? ms : tImpacto)).catch(() => tocar(tImpacto));
    else tocar(tImpacto);
  }
}

/* ---- Cor do token (0.94.17) ----
   O tingimento do Motion do Sequencer não aparece nos tokens do Foundry V13/V14 (a malha do token
   ignora o "tint" que ele escreve). Aqui a cor vem de um filtro de cor próprio na imagem do token,
   recalculado a cada quadro: piscadas (dano, cura, Prioridade) e cores que duram (Congelando,
   Queimando, cor escolhida na Condição). Só visual, só nesta tela. */
const naurenCorTokens = new Map(); // tokenUuid -> { camadas: Map(chave -> camada), filtro, mesh }
let naurenCorTickLigado = false;
function naurenCorPode() {
  try {
    if (!game.settings.get("nauren", "motionAtivo") || !game.settings.get("nauren", "motionMinhaTela")) return false;
    return !!canvas?.ready && !!(globalThis.PIXI?.ColorMatrixFilter ?? globalThis.PIXI?.filters?.ColorMatrixFilter);
  } catch (err) { return false; }
}
function naurenCorConfig(chave, padrao) {
  try { const v = String(game.settings.get("nauren", chave) ?? "").trim(); return /^#?[0-9a-f]{6}$/i.test(v) ? (v.startsWith("#") ? v : `#${v}`) : padrao; } catch (err) { return padrao; }
}
function naurenCorRGB(cor) {
  const n = typeof cor === "number" ? cor : parseInt(String(cor ?? "#ffffff").replace("#", ""), 16);
  const v = Number.isFinite(n) ? n : 0xffffff;
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}
function naurenCorEntrada(token, criar = true) {
  const uuid = token?.document?.uuid;
  if (!uuid) return null;
  let e = naurenCorTokens.get(uuid);
  if (!e && criar) { e = { camadas: new Map(), filtro: null, mesh: null }; naurenCorTokens.set(uuid, e); }
  if (e && !naurenCorTickLigado && canvas?.app?.ticker) { canvas.app.ticker.add(naurenCorTick); naurenCorTickLigado = true; }
  return e;
}
/** Piscada: sobe até "forca", segura e volta. */
function naurenCorFlash(token, cor, { forca = 0.6, sobe = 110, fica = 80, desce = 380, atraso = 0 } = {}) {
  if (!token || !naurenCorPode()) return false;
  const e = naurenCorEntrada(token);
  if (!e) return false;
  const chave = `flash-${performance.now()}-${Math.random()}`;
  e.camadas.set(chave, { tipo: "flash", rgb: naurenCorRGB(cor), forca, sobe, fica, desce, inicio: performance.now() + atraso });
  return true;
}
/** Cor que dura até ser retirada (Condição). pulsar: 0..1 de variação. */
function naurenCorFixa(token, chave, cor, { forca = 0.45, pulsar = 0, periodo = 900 } = {}) {
  if (!token || !naurenCorPode()) return false;
  const e = naurenCorEntrada(token);
  if (!e) return false;
  const antiga = e.camadas.get(chave);
  e.camadas.set(chave, { tipo: "fixa", rgb: naurenCorRGB(cor), forca, pulsar, periodo, inicio: antiga?.inicio ?? performance.now(), saindo: null });
  return true;
}
function naurenCorTirar(token, chave) {
  const e = naurenCorTokens.get(token?.document?.uuid ?? token);
  const c = e?.camadas.get(chave);
  if (c && c.tipo === "fixa" && !c.saindo) c.saindo = performance.now();
}
/** Cor e força da camada agora (0 = sem efeito, null = acabou). */
function naurenCorCamadaAgora(c, agora) {
  const t = agora - c.inicio;
  if (c.tipo === "flash") {
    if (t < 0) return 0;
    if (t < c.sobe) return c.forca * (t / c.sobe);
    if (t < c.sobe + c.fica) return c.forca;
    const d = t - c.sobe - c.fica;
    return d < c.desce ? c.forca * (1 - d / c.desce) : null;
  }
  let a = c.forca * Math.min(1, Math.max(0, t) / 300);
  if (c.pulsar) a *= 1 - c.pulsar * 0.5 * (1 + Math.sin((t / c.periodo) * Math.PI * 2));
  if (c.saindo) { const d = agora - c.saindo; if (d >= 300) return null; a *= 1 - d / 300; }
  return a;
}
/** Junta as camadas: piscadas por cima das cores que duram. Devolve { rgb, a } ou null. */
function naurenCorCalcular(e, agora = performance.now()) {
  let melhorFlash = null, somaFixa = 0, rgbFixa = [0, 0, 0], maxFixa = 0;
  for (const [chave, c] of [...e.camadas]) {
    const a = naurenCorCamadaAgora(c, agora);
    if (a === null) { e.camadas.delete(chave); continue; }
    if (a <= 0) continue;
    if (c.tipo === "flash") { if (!melhorFlash || a > melhorFlash.a) melhorFlash = { rgb: c.rgb, a }; }
    else { somaFixa += a; maxFixa = Math.max(maxFixa, a); for (let i = 0; i < 3; i++) rgbFixa[i] += c.rgb[i] * a; }
  }
  let rgb = null, a = 0;
  if (somaFixa > 0) { rgb = rgbFixa.map(v => v / somaFixa); a = maxFixa; }
  if (melhorFlash) {
    if (!rgb) { rgb = melhorFlash.rgb; a = melhorFlash.a; }
    else { const w = melhorFlash.a; rgb = rgb.map((v, i) => v * (1 - w) + melhorFlash.rgb[i] * w); a = Math.max(a, w); }
  }
  return rgb && a > 0.001 ? { rgb, a: Math.min(0.95, a) } : null;
}
/** Matriz que puxa a cor do token para "rgb" mantendo a luz e a sombra da imagem. */
function naurenCorMatriz({ rgb, a }) {
  const [r, g, b] = rgb, k = 1 - a, L = [0.3, 0.59, 0.11];
  // um pouco mais claro na cor, para o vermelho/verde aparecerem também em tokens escuros
  const brilho = 0.12 * a;
  return [
    k + a * r * L[0] * 1.6, a * r * L[1] * 1.6, a * r * L[2] * 1.6, 0, brilho * r,
    a * g * L[0] * 1.6, k + a * g * L[1] * 1.6, a * g * L[2] * 1.6, 0, brilho * g,
    a * b * L[0] * 1.6, a * b * L[1] * 1.6, k + a * b * L[2] * 1.6, 0, brilho * b,
    0, 0, 0, 1, 0
  ];
}
function naurenCorTirarFiltro(e) {
  if (e?.mesh && e.filtro && Array.isArray(e.mesh.filters)) {
    const resto = e.mesh.filters.filter(f => f !== e.filtro);
    e.mesh.filters = resto.length ? resto : null;
  }
  if (e) e.mesh = null;
}
function naurenCorTick() {
  const agora = performance.now();
  const pode = naurenCorPode();
  for (const [uuid, e] of [...naurenCorTokens]) {
    let token = null;
    try { token = fromUuidSync(uuid)?.object ?? null; } catch (err) { token = null; }
    const estado = token && !token.destroyed && pode ? naurenCorCalcular(e, agora) : null;
    const mesh = token?.mesh ?? null;
    if (!estado || !mesh) {
      naurenCorTirarFiltro(e);
      if (!e.camadas.size || !token || token.destroyed || !pode) naurenCorTokens.delete(uuid);
      continue;
    }
    if (!e.filtro) { const CMF = globalThis.PIXI.ColorMatrixFilter ?? globalThis.PIXI.filters?.ColorMatrixFilter; e.filtro = new CMF(); }
    if (e.mesh && e.mesh !== mesh) naurenCorTirarFiltro(e); // imagem do token recriada
    e.filtro.matrix = naurenCorMatriz(estado);
    const lista = Array.isArray(mesh.filters) ? mesh.filters : [];
    if (!lista.includes(e.filtro)) mesh.filters = [...lista, e.filtro];
    e.mesh = mesh;
  }
  if (!naurenCorTokens.size && naurenCorTickLigado) { canvas?.app?.ticker?.remove(naurenCorTick); naurenCorTickLigado = false; }
}
Hooks.on("canvasTearDown", () => {
  for (const e of naurenCorTokens.values()) naurenCorTirarFiltro(e);
  naurenCorTokens.clear();
  if (naurenCorTickLigado) { try { canvas?.app?.ticker?.remove(naurenCorTick); } catch (err) { /* já saiu */ } naurenCorTickLigado = false; }
});
/** Cor que a Condição dá ao token (ou null). */
function naurenCorDaCondicao(preset, item) {
  switch (preset) {
    case "gelo": return { cor: "#6fb4ff", forca: 0.5 };
    case "brasa": return { cor: "#ff8a2a", forca: 0.5, pulsar: 0.5, periodo: 700 };
    case "eletrico": return { cor: "#bfe4ff", forca: 0.35, pulsar: 0.7, periodo: 250 };
    case "cor": return { cor: item?.system?.motionCor || "#ffffff", forca: 0.5 };
    default: return null;
  }
}
const NAUREN_MOTION_SO_COR = new Set(["gelo", "cor"]); // presets sem movimento, só cor

/* ---- Condições com aparência (persistente, enquanto a Condição durar) ---- */
const NAUREN_MOTION_CONDICAO_OPCOES = {
  auto: "Automático (pelo nome)", nenhum: "Nenhum", flutuar: "Flutuar (voo)", deitado: "Deitado", cambalear: "Cambalear",
  tremer: "Tremer", eletrico: "Faíscas (treme mais a cada acúmulo)", gelo: "Azulado (gelo)", brasa: "Alaranjado piscando (fogo)",
  transparente: "Meio transparente", crescer: "Maior", encolher: "Menor", preso: "Debatendo-se (preso)", cor: "Cor escolhida"
};
const NAUREN_MOTION_USUARIO_OPCOES = {
  auto: "Automático (bote, recuo ou conjurar)", nenhum: "Nenhum", bote: "Bote na direção do alvo", recuo: "Recuo (tiro)", conjurar: "Conjurar (cresce rápido)",
  pulo: "Pulinho", girar: "Giro", rebobinar: "Rebobinar (gira para trás, dourado)", surgir: "Surgir (cresce do pequeno)", tremer: "Tremer", crescer: "Crescer"
};
const NAUREN_MOTION_ALVO_OPCOES = {
  auto: "Automático (pelo resultado)", nenhum: "Nenhum", tremer: "Tremer", empurrar: "Empurrado para trás", girar: "Giro", pulo: "Pulinho"
};
function naurenMotionPresetCondicao(item) {
  const p = item?.system?.motion || "auto";
  if (p !== "auto") return p === "nenhum" ? null : p;
  const n = String(item?.name ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (item?.system?.vooCusto || /\bvoo\b|voando|levita/.test(n)) return "flutuar";
  if (/^caido\b|desacordad|inconscient/.test(n)) return "deitado";
  if (/atordoad/.test(n)) return "cambalear";
  if (/congela/.test(n)) return "gelo";
  if (/queimand|em chamas/.test(n)) return "brasa";
  if (/invisivel/.test(n)) return "transparente";
  if (/^preso\b|agarrad|enredad/.test(n)) return "preso";
  if (/bomba eletrica|eletrizad/.test(n)) return "eletrico";
  if (/crescimento/.test(n)) return "crescer";
  if (/amedrontad|pavor|panico/.test(n)) return "tremer";
  return null;
}
function naurenMotionMontarCondicao(m, preset, item, token) {
  const k = naurenMotionForca();
  const ac = Math.max(1, Number(item?.system?.acumulos) || 1);
  switch (preset) {
    case "flutuar": m.moveBy({ y: -0.18 }, { gridUnits: true, duration: 500, ease: "easeOutCubic" });
      m.oscillate({ period: 1600, waveform: "sine", y: { strengthScaledToObject: 0.05 }, rotation: { amplitude: 2 }, fadeInDuration: 500 }); break;
    case "deitado": m.rotateBy(90, { duration: 350, ease: "easeOutBounce" }); break;
    case "cambalear": m.oscillate({ period: 1300, waveform: "sine", rotation: { amplitude: 7 }, x: { strengthScaledToObject: 0.02 }, fadeInDuration: 300 }); break;
    case "tremer": m.noise({ strengthScaledToObject: 0.012 * k, frequency: 45, duration: 1000, fadeInDuration: 200 }); break;
    case "eletrico": m.noise({ strengthScaledToObject: Math.min(0.06, 0.01 * ac) * k, frequency: Math.max(18, 45 - 5 * ac), duration: 1000, rotationStrength: Math.min(6, ac) });
      break;
    case "brasa": m.oscillate({ period: 900, waveform: "sine", alpha: { baseline: 1, amplitude: 0.08 } }); break;
    case "transparente": m.fadeTo(0.45, { duration: 400 }); break;
    case "crescer": m.scaleTo(1.25, { duration: 400, ease: "easeOutBack" }); break;
    case "encolher": m.scaleTo(0.75, { duration: 400, ease: "easeOutBack" }); break;
    case "preso": m.noise({ strengthScaledToObject: { x: 0.02 * k }, frequency: 90, duration: 1000, rotationStrength: 3 }); break;
    default: break;
  }
}
const naurenMotionCondTocando = new Map(); // tokenUuid -> Map(nome -> assinatura)
const naurenCorCondTocando = new Map(); // tokenUuid -> Map(chave -> assinatura)
function naurenMotionSincronizarCondicoes(token) {
  if (!token?.document?.uuid) return;
  const uuid = token.document.uuid;
  const atuais = naurenMotionCondTocando.get(uuid) ?? new Map();
  const desejadas = new Map();
  const coresAtuais = naurenCorCondTocando.get(uuid) ?? new Map();
  const coresDesejadas = new Map();
  if (token.actor) {
    for (const i of token.actor.items) {
      if (i.type !== "condicao" || i.system.ativo === false || naurenEhCondicaoModelo(i)) continue;
      const preset = naurenMotionPresetCondicao(i);
      if (!preset) continue;
      const cor = naurenCorPode() ? naurenCorDaCondicao(preset, i) : null;
      if (cor) coresDesejadas.set(`cond-${i.id}`, { ...cor, assinatura: JSON.stringify(cor) });
      if (naurenMotionPode() && !NAUREN_MOTION_SO_COR.has(preset)) desejadas.set(`nauren-cond-${i.id}`, { preset, item: i, assinatura: `${preset}|${preset === "eletrico" ? i.system.acumulos : ""}` });
    }
  }
  for (const [chave, assin] of [...coresAtuais]) {
    if (coresDesejadas.get(chave)?.assinatura === assin) continue;
    if (!coresDesejadas.has(chave)) naurenCorTirar(token, chave);
    coresAtuais.delete(chave);
  }
  for (const [chave, c] of coresDesejadas) {
    if (coresAtuais.has(chave)) continue;
    if (naurenCorFixa(token, chave, c.cor, c)) coresAtuais.set(chave, c.assinatura);
  }
  if (coresAtuais.size) naurenCorCondTocando.set(uuid, coresAtuais); else naurenCorCondTocando.delete(uuid);
  for (const [nome, assin] of [...atuais]) {
    if (desejadas.get(nome)?.assinatura === assin) continue;
    try { globalThis.Sequencer?.MotionManager?.endMotions(token, { name: nome, settle: 300 }, false); } catch (err) { /* já acabou */ }
    atuais.delete(nome);
  }
  for (const [nome, d] of desejadas) {
    if (atuais.has(nome)) continue;
    if (naurenMotionTocar(token, m => naurenMotionMontarCondicao(m, d.preset, d.item, token), { nome, persistir: true })) atuais.set(nome, d.assinatura);
  }
  if (atuais.size) naurenMotionCondTocando.set(uuid, atuais); else naurenMotionCondTocando.delete(uuid);
}
function naurenMotionCondicoesDoAtor(actor) {
  if (!actor || !canvas?.ready) return;
  const toks = actor.isToken ? [actor.token?.object].filter(Boolean) : (actor.getActiveTokens?.(true) ?? []);
  for (const t of toks) naurenMotionSincronizarCondicoes(t);
}
const naurenMotionCondDebounce = new Map();
function naurenMotionCondicoesDepois(actor) {
  if (!actor) return;
  const chave = actor.uuid;
  clearTimeout(naurenMotionCondDebounce.get(chave));
  naurenMotionCondDebounce.set(chave, setTimeout(() => { naurenMotionCondDebounce.delete(chave); naurenMotionCondicoesDoAtor(actor); }, 80));
}
for (const gancho of ["createItem", "updateItem", "deleteItem"]) {
  Hooks.on(gancho, item => { if (item?.type === "condicao" && item.parent?.documentName === "Actor") naurenMotionCondicoesDepois(item.parent); });
}
Hooks.on("canvasReady", () => {
  naurenMotionCondTocando.clear(); // o Sequencer desmonta tudo ao trocar de cena
  naurenCorCondTocando.clear();
  setTimeout(() => { for (const t of canvas.tokens?.placeables ?? []) naurenMotionSincronizarCondicoes(t); }, 400);
});
Hooks.on("createToken", (tokenDoc) => {
  setTimeout(() => {
    const t = tokenDoc.object;
    if (!t || tokenDoc.parent?.id !== canvas?.scene?.id) return;
    naurenMotionSincronizarCondicoes(t);
    if (tokenDoc.getFlag?.("nauren", "surgir") && naurenMotionPode()) naurenMotionAtacante("surgir", t, null);
  }, 150);
});
Hooks.on("deleteToken", (tokenDoc) => { naurenMotionCondTocando.delete(tokenDoc.uuid); naurenCorCondTocando.delete(tokenDoc.uuid); });

/* ---- Som espera a animação (em cada tela) ----
   O som do Sequencer toca assim que o arquivo de áudio carrega; o vídeo (bem maior) pode
   demorar mais no servidor. Aqui o som de uma animação espera o vídeo que nasceu junto
   dele (mesmo autor, até ~1,5 s de diferença) aparecer nesta tela. Teto de 4 s. */
function naurenSomSincronizadoAtivo() {
  try { return !!game.settings.get("nauren", "somSincronizado"); } catch (err) { return false; }
}
/**
 * Efeitos que nasceram JUNTO com o som: na Sequência do Automated Animations o som vem logo antes do
 * efeito dele. 0.94.21: a janela é estreita e olha para frente (de 250 ms antes até 400 ms depois do som),
 * para o som do lançamento de uma magia esperar o LANÇAMENTO e não casar com a conjuração que veio antes.
 */
function naurenEfeitosDoSom(data, agora) {
  const t = Number(data?.creationTimestamp) || agora;
  return naurenMotionEfeitosRecentes.filter(r => {
    const d = r.ef?.data ?? {};
    if (r.ef?._ended || r.ef?.destroyed || d.persist) return false;
    if (data?.creatorUserId && d.creatorUserId && d.creatorUserId !== data.creatorUserId) return false;
    const te = Number(d.creationTimestamp) || r.t;
    return te >= t - 250 && te <= t + 400;
  });
}
async function naurenSomEsperarAnimacao(data) {
  if (!data || data.persist || !naurenSomSincronizadoAtivo()) return;
  const t0 = Date.now();
  let juntos = naurenEfeitosDoSom(data, t0);
  // O vídeo pode nascer logo depois do som (mesma Sequência): logo depois de uma Ação, espera um instante por ele.
  const acaoRecente = t0 - naurenMotionUltimoPlano < 15000;
  while (!juntos.length && acaoRecente && Date.now() - t0 < 300) { // na Sequência, o efeito nasce poucos ms depois do som
    await naurenEsperarMs(30);
    juntos = naurenEfeitosDoSom(data, t0);
  }
  while (juntos.some(r => !r.ef?.ready && !r.ef?._ended && !r.ef?.destroyed) && Date.now() - t0 < 4000) {
    await naurenEsperarMs(25);
    juntos = naurenEfeitosDoSom(data, t0);
  }
}
function naurenInstalarSomSincronizado() {
  const SM = globalThis.Sequencer?.SoundManager;
  if (!SM || typeof SM._playSound !== "function" || SM._naurenSincronizado) return;
  const original = SM._playSound;
  SM._playSound = async function (data, ...resto) {
    try { await naurenSomEsperarAnimacao(data); } catch (err) { /* toca mesmo assim */ }
    return original.call(this, data, ...resto);
  };
  SM._naurenSincronizado = true;
}
Hooks.once("sequencerReady", () => naurenInstalarSomSincronizado());
Hooks.once("ready", () => {
  setTimeout(() => naurenInstalarSomSincronizado(), 500);
});
// 0.94.17: o aviso para as outras telas vai por consulta direta a cada usuário (o mesmo caminho das reações),
// que não depende do canal próprio do sistema (esse só liga depois de reiniciar o servidor).
Hooks.once("init", () => {
  CONFIG.queries[NAUREN_QUERY_MOTION] = (msg) => { naurenMotionDeOutraTela(msg); return true; };
});

/* ---- Auras (Emanação): a animação segue o tamanho atual da habilidade ---- */
function naurenRaioEmanacaoMetros(item) {
  const sobre = naurenResolverPorRank(item?.system?.emanacaoRaioPorRank, item?.system?.rankAtual ?? 0, "valor");
  return parseFloat(sobre ?? item?.system?.emanacaoRaio) || 0;
}
/** Diâmetro da aura em quadrados: o raio vale a partir da borda do token (como a régua), dos dois lados + o token. */
function naurenDiametroAuraQuadrados(item, tokenDoc) {
  const dist = canvas?.scene?.grid?.distance ?? canvas?.grid?.distance ?? 1;
  const raioQ = naurenRaioEmanacaoMetros(item) / (dist || 1);
  const tam = Math.max(Number(tokenDoc?.width) || 1, Number(tokenDoc?.height) || 1);
  return Math.max(0.5, raioQ * 2 + tam);
}
const naurenAuraTamanhoPendente = new Map(); // tokenUuid -> { item, ate }
Hooks.on("preCreateSequencerEffect", data => {
  try {
    if (!data?.persist) return;
    const fonte = naurenMotionUuid(data.source);
    if (!fonte) return;
    let item = null;
    const pend = naurenAuraTamanhoPendente.get(fonte);
    if (pend && Date.now() < pend.ate) item = pend.item;
    if (!item && data.origin) { try { item = fromUuidSync(data.origin); } catch (err) { item = null; } }
    if (!item?.system?.usaEmanacao) return;
    const tokenDoc = fromUuidSync(fonte);
    const d = naurenDiametroAuraQuadrados(item, tokenDoc);
    data.size = { width: d, height: d, gridUnits: true };
  } catch (err) { console.warn("Nauren RPG | tamanho da aura", err); }
});
/** Rank/raio mudou com a aura ligada: ajusta o tamanho da animação que já está tocando (para todos). */
async function naurenAjustarTamanhoAura(item) {
  const token = naurenTokenDoItem(item);
  if (!token) return;
  const d = naurenDiametroAuraQuadrados(item, token.document);
  for (const ef of naurenEfeitosDaAura(item, token)) {
    const s = ef.data?.size;
    if (s && s.gridUnits && Math.abs((Number(s.width) || 0) - d) < 0.01) continue;
    try { await ef.update({ size: { width: d, height: d, gridUnits: true } }); } catch (err) { console.warn("Nauren RPG | tamanho da aura (atualizar)", err); }
  }
}

export { NAUREN_MOTION_ALVO_OPCOES, NAUREN_MOTION_CONDICAO_OPCOES, NAUREN_MOTION_ESPERA_EFEITO, NAUREN_MOTION_JANELA_EFEITOS, NAUREN_MOTION_SO_COR, NAUREN_MOTION_USUARIO_OPCOES, NAUREN_QUERY_MOTION, naurenAANomeReserva, naurenAANomeTemAnimacao, naurenAANomesCadastrados, naurenAjustarTamanhoAura, naurenAnimacoesDisponiveis, naurenAnimarAcao, naurenAnimarAcumulo, naurenAnimarCritico, naurenAnimarPassiva, naurenAuraTamanhoPendente, naurenAurasTocando, naurenCorCalcular, naurenCorCamadaAgora, naurenCorCondTocando, naurenCorConfig, naurenCorDaCondicao, naurenCorEntrada, naurenCorFixa, naurenCorFlash, naurenCorMatriz, naurenCorPode, naurenCorRGB, naurenCorTick, naurenCorTickLigado, naurenCorTirar, naurenCorTirarFiltro, naurenCorTokens, naurenDesligarAnimacaoAura, naurenDiametroAuraQuadrados, naurenEfeitosDaAura, naurenEfeitosDoSom, naurenEncerrarEfeitosSequencer, naurenEntradaAefx, naurenEntradaMenu, naurenEsperarMs, naurenInstalarSomSincronizado, naurenLigarAnimacaoAura, naurenMotionAlvo, naurenMotionAnotarEfeito, naurenMotionAnotarPreparo, naurenMotionAtacante, naurenMotionCasa, naurenMotionCondDebounce, naurenMotionCondTocando, naurenMotionCondicoesDepois, naurenMotionCondicoesDoAtor, naurenMotionContador, naurenMotionDeOutraTela, naurenMotionEfeitosRecentes, naurenMotionEhPreparo, naurenMotionEmTodos, naurenMotionEnviar, naurenMotionEvento, naurenMotionExecutar, naurenMotionForca, naurenMotionImpactoDoEfeito, naurenMotionMontarCondicao, naurenMotionParaOutrasTelas, naurenMotionPlanoDaAcao, naurenMotionPlanos, naurenMotionPode, naurenMotionPresetCondicao, naurenMotionReceberPlano, naurenMotionSincronizar, naurenMotionSincronizarCondicoes, naurenMotionTocar, naurenMotionToken, naurenMotionUltimoPlano, naurenMotionUuid, naurenMotionVistos, naurenPassivasAnimadas, naurenRaioEmanacaoMetros, naurenSomEsperarAnimacao, naurenSomSincronizadoAtivo, naurenTocarNaRegiao, naurenTocarNoToken, naurenTokenDoAtor, naurenTokenDoItem };
