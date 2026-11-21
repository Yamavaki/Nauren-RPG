/* Nauren RPG — Caçador no livro 0.9 (0.119): Espírito do Caçador (Mantis, Tubarão, Harpia) e a
 * nova escala da Marca do Caçador (+2 no nível 1, +1 nos níveis 6, 9, 12, 15 e 18 = até +7).
 *
 * Decisão do Gustavo: não há um aspecto escolhido no início do combate. Cada aspecto é oferecido
 * quando o gatilho dele acontece, e o Caçador decide na hora. Dá para usar os três na mesma cena
 * se houver pontos.
 *   Harpia  · 1 ponto · antes do teste de ataque · +2 no acerto
 *   Tubarão · 1 ponto · antes do teste de ataque · Sangramento 1 se acertar
 *   Mantis  · 3 pontos · quando um aliado ataca no turno dele · ataque junto; o alvo recebe só 1 Prioridade
 */

export const NAUREN_ESPIRITO_CACADOR_ID = "espiritodocacador";
export const NAUREN_ESPIRITO_CACADOR_RECURSO = `recursoCustom:${NAUREN_ESPIRITO_CACADOR_ID}`;
export const NAUREN_QUERY_MANTIS = "nauren.aspectoMantis";

export const NAUREN_ASPECTOS_CACADOR = Object.freeze({
  harpia: Object.freeze({ id: "harpia", nome: "Aspecto da Harpia", custo: 1, icone: "fa-feather-pointed", resumo: "+2 no teste de acerto" }),
  tubarao: Object.freeze({ id: "tubarao", nome: "Aspecto do Tubarão", custo: 1, icone: "fa-droplet", resumo: "Sangramento 1 se acertar" }),
  mantis: Object.freeze({ id: "mantis", nome: "Aspecto do Mantis", custo: 3, icone: "fa-people-arrows", resumo: "ataque junto com o aliado; o alvo recebe só 1 Prioridade" })
});

/** Bônus da Marca do Caçador pelo rank (rank 1 = nível 1 … rank 6 = nível 18): +2 … +7, igual nos três benefícios. */
export function naurenValorMarcaDoCacador(rank) {
  return 1 + Math.max(1, Math.min(6, Math.floor(Number(rank) || 1)));
}

/** Custo total dos aspectos escolhidos antes do ataque (Harpia/Tubarão). */
export function naurenCustoAspectos(escolhidos = []) {
  return escolhidos.reduce((t, id) => t + (NAUREN_ASPECTOS_CACADOR[id]?.custo ?? 0), 0);
}

/** Quais aspectos de antes do ataque cabem nos pontos (cada um sozinho). */
export function naurenAspectosPreAtaqueDisponiveis(pontos) {
  return ["harpia", "tubarao"].filter(id => (Number(pontos) || 0) >= NAUREN_ASPECTOS_CACADOR[id].custo);
}

/* ------------------------------------------------------------------ Foundry ------ */

function ehItem(i, nome) {
  return String(i?.name ?? "").trim().toLowerCase() === nome.toLowerCase();
}

export function naurenTemEspiritoDoCacador(actor) {
  return !!actor?.items?.some(i => i.type === "habilidade" && ehItem(i, "Espírito do Caçador") && i.system.ativo !== false);
}

export function naurenPontosEspiritoCacador(actor) {
  const r = (actor?.system?.recursosCustom ?? []).find(x => x.id === NAUREN_ESPIRITO_CACADOR_ID);
  return { valor: Math.max(0, Number(r?.valor) || 0), max: r?.max ?? null };
}

async function gastarPontos(actor, n, item) {
  const { naurenConcederRecurso } = await import("./icone-condicao-token.mjs");
  return naurenConcederRecurso(actor, NAUREN_ESPIRITO_CACADOR_RECURSO, `-${n}`, item).catch(() => 0);
}

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/**
 * Antes do teste de ataque: oferece Harpia e Tubarão (marque um, os dois ou nenhum).
 * Gasta os pontos e devolve { harpia, tubarao, gasto, linhas } — ou null se não usou.
 */
export async function naurenAspectosAntesDoAtaque(actor, { alvoNome = "" } = {}) {
  if (!game.combat?.started || !naurenTemEspiritoDoCacador(actor)) return null;
  const { valor, max } = naurenPontosEspiritoCacador(actor);
  const disponiveis = naurenAspectosPreAtaqueDisponiveis(valor);
  if (!disponiveis.length) return null;
  const NK = await import("./janelas-kit.mjs");
  const hab = actor.items.find(i => i.type === "habilidade" && ehItem(i, "Espírito do Caçador"));
  const marcados = new Set();
  let usar = false;
  const opcao = id => {
    const a = NAUREN_ASPECTOS_CACADOR[id];
    return `<button type="button" class="nauren-mov-opcao nauren-aspecto" data-aspecto="${id}" aria-pressed="false">
      <i class="fas ${a.icone}"></i><span class="nauren-mov-titulo">${esc(a.nome)}</span><span class="nauren-mov-custo"><b>${a.custo}</b> ponto</span>
      <span class="nauren-mov-nota">${esc(a.resumo)}</span></button>`;
  };
  const conteudo = `<div class="nauren-mov nauren-aspectos">
    <p class="nauren-mov-aviso" style="margin:0;"><i class="fas fa-paw"></i> Antes do teste de ataque${alvoNome ? ` contra <b>${esc(alvoNome)}</b>` : ""}. Espírito do Caçador: <b class="nasp-pontos">${valor}</b>${max !== null ? ` / ${max}` : ""}.</p>
    <div class="nauren-mov-opcoes">${disponiveis.map(opcao).join("")}</div>
    <p class="nauren-aspectos-total">Marque os aspectos e confirme. Custo: <b class="nasp-custo">0</b></p>
  </div>`;
  const atualizar = raiz => {
    const custo = naurenCustoAspectos([...marcados]);
    raiz.querySelector(".nasp-custo").textContent = String(custo);
    raiz.querySelectorAll(".nauren-aspecto").forEach(b => {
      const on = marcados.has(b.dataset.aspecto);
      b.classList.toggle("ativo", on); b.setAttribute("aria-pressed", on ? "true" : "false");
      b.disabled = !on && custo + NAUREN_ASPECTOS_CACADOR[b.dataset.aspecto].custo > valor;
    });
    const ok = raiz.closest?.(".application")?.querySelector('[data-action="usar"]') ?? raiz.querySelector?.('[data-action="usar"]');
    if (ok) ok.disabled = !marcados.size;
  };
  await foundry.applications.api.DialogV2.wait({ ...NK.NAUREN_KIT_JANELA,
    window: { title: `Espírito do Caçador — ${actor.name}`, icon: "fas fa-paw" }, classes: ["nauren-janela-movimento", "nauren-kit"], position: { width: 400 },
    content: conteudo,
    buttons: [{ action: "usar", label: "Usar", icon: "fas fa-check", default: true, callback: () => { usar = true; } }, { action: "nao", label: "Não usar" }],
    rejectClose: false,
    render: (ev, dialog) => {
      const raiz = dialog?.element ?? document;
      raiz.querySelectorAll(".nauren-aspecto").forEach(b => b.addEventListener("click", () => {
        if (b.disabled) return;
        const id = b.dataset.aspecto; marcados.has(id) ? marcados.delete(id) : marcados.add(id); atualizar(raiz);
      }));
      atualizar(raiz);
    }
  }).catch(() => null);
  if (!usar || !marcados.size) return null;
  const custo = naurenCustoAspectos([...marcados]);
  if (naurenPontosEspiritoCacador(actor).valor < custo) { ui.notifications.warn(`${actor.name}: Espírito do Caçador insuficiente.`); return null; }
  const gasto = await gastarPontos(actor, custo, hab);
  if (!gasto) return null;
  const resta = Math.max(0, valor - custo);
  const nomes = [...marcados].map(id => NAUREN_ASPECTOS_CACADOR[id].nome.replace(/^Aspecto d[aoe] /, ""));
  return { harpia: marcados.has("harpia"), tubarao: marcados.has("tubarao"), gasto: custo,
    linha: { label: "Espírito do Caçador", value: nomes.join(" + "), breakdown: `−${custo} ponto${custo > 1 ? "s" : ""} (${resta} restante${resta === 1 ? "" : "s"})` } };
}

/**
 * Mantis: um aliado acabou de atacar no turno dele. Procura Caçadores aliados com o Espírito do
 * Caçador e 3 pontos, e pergunta na tela do dono de cada um se quer atacar junto.
 */
export async function naurenOferecerMantis(atacante, alvosTokenUuids = []) {
  if (!game.combat?.started || !atacante || !alvosTokenUuids.length) return;
  const meuTok = atacante.getActiveTokens?.(true)?.[0];
  if (!meuTok) return;
  const disp = meuTok.document.disposition;
  const { NaurenAlvoHelper } = await import("./ficha-ator.mjs");
  const vistos = new Set();
  for (const t of canvas?.tokens?.placeables ?? []) {
    const a = t.actor;
    if (!a || a === atacante || vistos.has(a.uuid) || t.document.disposition !== disp || t.document.hidden) continue;
    if ((a.system?.vida?.value ?? 1) <= 0 || !naurenTemEspiritoDoCacador(a)) continue;
    if (naurenPontosEspiritoCacador(a).valor < NAUREN_ASPECTOS_CACADOR.mantis.custo) continue;
    vistos.add(a.uuid);
    const dados = { cacadorUuid: a.uuid, cacadorTokenUuid: t.document.uuid, aliadoNome: atacante.name, alvosTokenUuids };
    const ex = NaurenAlvoHelper.usuarioExecutor(a);
    if (!ex) continue;
    if (ex.id === game.user.id) naurenMantisNoCliente(dados).catch(err => console.warn("Nauren RPG | Mantis", err));
    else ex.query(NAUREN_QUERY_MANTIS, dados, { timeout: 120000 }).catch(() => null);
  }
}

/** Na tela do dono do Caçador: oferece o ataque simultâneo (arma ou habilidade de ataque) e executa. */
export async function naurenMantisNoCliente({ cacadorUuid, cacadorTokenUuid, aliadoNome, alvosTokenUuids = [] } = {}) {
  const doc = await fromUuid(cacadorUuid).catch(() => null);
  const actor = doc?.actor ?? doc;
  if (!actor?.isOwner || !naurenTemEspiritoDoCacador(actor)) return false;
  const custo = NAUREN_ASPECTOS_CACADOR.mantis.custo;
  const { valor, max } = naurenPontosEspiritoCacador(actor);
  if (valor < custo) return false;
  const alvos = (await Promise.all(alvosTokenUuids.map(u => fromUuid(u).catch(() => null)))).filter(d => d?.object && d.actor && (d.actor.system?.vida?.value ?? 1) > 0);
  if (!alvos.length) return false;
  // Ataques que dá para fazer: armas equipadas e habilidades/magias com Ação de ataque.
  const opcoes = [];
  for (const it of actor.items) {
    const ok = it.type === "arma" ? it.system.equipado : ["habilidade", "magia"].includes(it.type) ? it.system.ativo !== false : false;
    if (!ok) continue;
    (it.system.acoes ?? []).forEach((ac, idx) => { if (ac.ehAtaque) opcoes.push({ item: it, idx, nome: ac.nome || it.name }); });
  }
  if (!opcoes.length) return false;
  const NK = await import("./janelas-kit.mjs");
  let escolha = null;
  const nomesAlvos = alvos.map(d => d.name).join(", ");
  await foundry.applications.api.DialogV2.wait({ ...NK.NAUREN_KIT_JANELA,
    window: { title: `Aspecto do Mantis — ${actor.name}`, icon: "fas fa-people-arrows" }, classes: ["nauren-janela-movimento", "nauren-dialogo", "nauren-kit"], position: { width: 420 },
    content: `<div class="nauren-mov">
      <p class="nauren-mov-aviso" style="margin:0;"><b>${esc(aliadoNome)}</b> atacou <b>${esc(nomesAlvos)}</b>. Gastar <b>${custo}</b> Espírito do Caçador (${valor}${max !== null ? ` / ${max}` : ""}) para atacar junto? O alvo recebe só 1 Prioridade (este ataque não gera outra).</p>
      <div class="nauren-mov-opcoes">${opcoes.map((o, k) => `<button type="button" class="nauren-mov-opcao nauren-reacao-arma" data-k="${k}"><img src="${esc(o.item.img)}" alt=""><span class="nauren-mov-titulo">${esc(o.item.name)}<small>${esc(o.nome)}</small></span><span class="nauren-mov-custo"></span></button>`).join("")}</div>
    </div>`,
    buttons: [{ action: "nao", label: "Não atacar" }], rejectClose: false,
    render: (ev, dialog) => dialog.element.querySelectorAll(".nauren-mov-opcao").forEach(b => b.addEventListener("click", () => { escolha = opcoes[Number(b.dataset.k)]; dialog.close(); }))
  }).catch(() => null);
  if (!escolha) return false;
  const sheet = actor.sheet;
  if (typeof sheet?._executarAcao !== "function") return false;
  const hab = actor.items.find(i => i.type === "habilidade" && ehItem(i, "Espírito do Caçador"));
  if (!await gastarPontos(actor, custo, hab)) return false;
  const alvosAntes = Array.from(game.user.targets ?? []);
  for (const t of alvosAntes) t.setTarget(false, { releaseOthers: false });
  alvos.forEach((d, k) => d.object.setTarget(true, { releaseOthers: k === 0 }));
  try { (await fromUuid(cacadorTokenUuid).catch(() => null))?.object?.control?.({ releaseOthers: false }); } catch (err) { /* sem token visível */ }
  const antes = sheet._mantisAtual;
  sheet._mantisAtual = { aliadoNome, custo, resta: Math.max(0, valor - custo) };
  try { await sheet._executarAcao(escolha.item, escolha.idx); }
  finally {
    sheet._mantisAtual = antes;
    for (const d of alvos) d.object?.setTarget(false, { releaseOthers: false });
    for (const t of alvosAntes) t.setTarget(true, { releaseOthers: false });
  }
  return true;
}

/** Handler da query (registrado no nauren.mjs, no init). */
export function naurenHandleQueryMantis(dados) { naurenMantisNoCliente(dados).catch(err => console.warn("Nauren RPG | Mantis", err)); return true; }

/**
 * Migração das fichas (Mestre, uma vez): Marca do Caçador com a escala nova (mantendo o rank),
 * Classe do Caçador com a reserva declarada e Espírito do Caçador para quem já é Caçador.
 */
export async function naurenMigrarLivro09CacadorV1() {
  if (!game.user.isGM || game.settings.get("nauren", "migracaoLivro09CacadorV1")) return;
  const ict = await import("./icone-condicao-token.mjs");
  const { NaurenConcessaoHelper } = await import("../nauren.mjs");
  const { naurenUuidPorSeed } = await import("./entidades-campo.mjs");
  const packH = game.packs.find(pk => pk.metadata.label === "Nauren - Habilidades de Classe");
  const uuidEsp = packH ? await naurenUuidPorSeed(packH, "habilidade-cacador-espirito-do-cacador") : null;
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  const relatorio = [];
  for (const a of atores) {
    const classe = a.items.find(i => i.type === "classe" && (i.system.identifier === "cacador" || /^ca[çc]ador$/i.test(i.name)));
    let mudou = false;
    for (const it of Array.from(a.items)) {
      const alvo = (it.type === "habilidade" && ehItem(it, "Marca do Caçador")) || (it.type === "efeito" && /\(Marca do Caçador\)$/.test(it.name)) || it === classe;
      if (alvo && await ict.naurenReconciliarItemComCompendio(it).catch(() => false)) mudou = true;
    }
    if (classe && uuidEsp && !naurenTemEspiritoDoCacador(a)) {
      const criado = await NaurenConcessaoHelper.concederItem(a, classe, "nivel:1", uuidEsp).catch(() => null);
      if (criado) { relatorio.push(`${a.name}: recebeu Espírito do Caçador`); mudou = false; }
      await ict.naurenSincronizarRecursosCustom(a).catch(() => {});
    }
    if (mudou) relatorio.push(`${a.name}: Marca do Caçador com +${naurenValorMarcaDoCacador(a.items.find(i => i.type === "habilidade" && ehItem(i, "Marca do Caçador"))?.system?.rankAtual || 1)}`);
  }
  await game.settings.set("nauren", "migracaoLivro09CacadorV1", true);
  if (relatorio.length) {
    const { naurenPostarCard } = await import("../nauren.mjs");
    naurenPostarCard({ titulo: "Livro 0.9: Caçador", icone: "icons/creatures/abilities/paw-print-orange.webp", fonte: "Fichas ajustadas",
      linhas: relatorio.map(r => ({ label: "Ajuste", value: r })) }).catch(() => {});
  }
}
