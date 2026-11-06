/* Nauren RPG — Entrega de itens entre personagens. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { NAUREN_KIT_JANELA } from "./janelas-kit.mjs";
import { NaurenAlvoHelper } from "./ficha-ator.mjs";
import { naurenPostarCard } from "../nauren.mjs";
import { naurenSeloDoItem } from "./itens-catalogo.mjs";


// 0.94.22: Compêndios oficiais (auto-semeadura, Torre, Bestiário, mascotes) foi para modulos/compendios.mjs.

/* =====================================================================
   ENTREGA DE ITENS ENTRE PERSONAGENS
   Arrastar um item de inventário da própria ficha para o token de outro:
   quem recebe aceita ou recusa; aceitando, o item sai de um e entra no outro.
   ===================================================================== */
const NAUREN_TIPOS_ENTREGAVEIS = ["arma", "armadura", "consumivel"];

const NAUREN_QUERY_OFERECER_ITEM = "nauren.oferecerItem";

const naurenRotuloTipoItem = t => ({ arma: "Arma", armadura: "Armadura", consumivel: "Equipamento" })[t] ?? t;


/** Quem envia: escolhe a quantidade (consumíveis), pergunta a quem recebe e, se aceitar, tira da própria ficha. */
async function naurenOferecerItem(item, tokenDestino) {
  const de = item.parent, para = tokenDestino.actor;
  const nomePara = tokenDestino.document?.name ?? para.name;
  const temQtd = item.type === "consumivel";
  const total = temQtd ? Math.max(1, item.system.quantidade ?? 1) : 1;
  let quantidade = total;
  if (temQtd && total > 1) {
    const esc = foundry.utils.escapeHTML ?? (x => x);
    quantidade = await foundry.applications.api.DialogV2.wait({ ...NAUREN_KIT_JANELA,
      window: { title: `Entregar ${item.name}` }, position: { width: 360 },
      content: `<p>Quantas unidades de <b>${esc(item.name)}</b> entregar para <b>${esc(nomePara)}</b>?</p>
        <div class="nauren-entrega-qtd"><input type="number" name="qtd" min="1" max="${total}" value="1"><span>de ${total}</span></div>`,
      buttons: [
        { action: "ok", label: "Oferecer", default: true, callback: (ev, btn) => Math.min(total, Math.max(1, Math.round(Number(btn.form?.elements?.qtd?.value) || 1))) },
        { action: "tudo", label: `Todas (${total})`, callback: () => total },
        { action: "cancelar", label: "Cancelar", callback: () => 0 }
      ], rejectClose: false
    }).catch(() => 0);
    if (!quantidade) return;
  }
  const dados = item.toObject();
  delete dados._id;
  foundry.utils.setProperty(dados, "system.equipado", false);
  if (temQtd) foundry.utils.setProperty(dados, "system.quantidade", quantidade);
  const pedido = { itemDados: dados, quantidade, deUuid: de.uuid, deNome: de.name, deImg: de.img, paraUuid: para.uuid, paraNome: nomePara };
  const responsavel = NaurenAlvoHelper.usuarioExecutor(para);
  if (!responsavel) { ui.notifications.warn(`Ninguém está online para receber o item de ${nomePara}.`); return; }
  ui.notifications.info(`Oferecendo ${item.name}${temQtd ? ` ×${quantidade}` : ""} para ${nomePara}…`);
  let resposta = null;
  try {
    resposta = responsavel.id === game.user.id ? await naurenHandleQueryOferecerItem(pedido)
      : await responsavel.query(NAUREN_QUERY_OFERECER_ITEM, pedido, { timeout: 130000 });
  } catch (err) { console.warn("Nauren RPG | Entrega de item sem resposta.", err); }
  if (!resposta?.aceito) { ui.notifications.warn(`${nomePara} ${resposta ? "recusou" : "não respondeu a"} a entrega de ${item.name}.`); return; }
  // Aceitou: sai da ficha de quem entregou.
  const aindaAqui = de.items.get(item.id);
  if (aindaAqui) {
    const resta = temQtd ? (aindaAqui.system.quantidade ?? 1) - quantidade : 0;
    if (temQtd && resta > 0) await aindaAqui.update({ "system.quantidade": resta });
    else await de.deleteEmbeddedDocuments("Item", [aindaAqui.id]);
  }
  naurenPostarCard({ ator: de, titulo: "Item entregue", icone: item.img, fonte: `${de.name} → ${nomePara}`,
    linhas: [{ label: "Item", value: `${item.name}${temQtd ? ` ×${quantidade}` : ""}` }, { label: "Para", value: nomePara }] })
    .catch(err => console.warn("Nauren RPG | card da entrega", err));
}


/** Quem recebe: janela de aceite; aceitando, coloca o item na ficha (consumível igual soma na pilha). */
async function naurenHandleQueryOferecerItem({ itemDados, quantidade, deNome, deImg, paraUuid, paraNome }) {
  const doc = await fromUuid(paraUuid).catch(() => null);
  const para = doc?.actor ?? doc;
  if (!para) return { aceito: false };
  const esc = foundry.utils.escapeHTML ?? (x => x);
  const resumo = String(itemDados.system?.descricao ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
  const selo = naurenSeloDoItem(itemDados);
  const qtdTexto = itemDados.type === "consumivel" ? `<span class="nauren-oferta-qtd">×${quantidade}</span>` : "";
  const conteudo = `<div class="nauren-oferta">
      <div class="nauren-oferta-de"><img src="${esc(deImg || "icons/svg/mystery-man.svg")}" alt=""><span><b>${esc(deNome)}</b> quer entregar a <b>${esc(paraNome)}</b>:</span></div>
      <div class="nauren-oferta-item">
        <img class="nauren-oferta-img" src="${esc(itemDados.img || "icons/svg/item-bag.svg")}" alt="">
        <div class="nauren-oferta-info">
          <div class="nauren-oferta-nome">${esc(itemDados.name)} ${qtdTexto}</div>
          <div class="nauren-oferta-etiquetas"><span class="nauren-etiqueta">${naurenRotuloTipoItem(itemDados.type)}</span>${selo}</div>
          ${resumo ? `<div class="nauren-oferta-desc">${esc(resumo)}${resumo.length >= 180 ? "…" : ""}</div>` : ""}
        </div>
      </div>
    </div>`;
  const escolha = await foundry.applications.api.DialogV2.wait({ ...NAUREN_KIT_JANELA,
    window: { title: "Item oferecido", icon: "fas fa-hand-holding" }, position: { width: 440 },
    content: conteudo,
    buttons: [
      { action: "aceitar", label: "Aceitar", icon: "fas fa-check", default: true },
      { action: "recusar", label: "Recusar", icon: "fas fa-xmark" }
    ], rejectClose: false
  }).catch(() => null);
  if (escolha !== "aceitar") return { aceito: false };
  // Consumível igual já na ficha (mesmo nome, e mesma chave da Torre se houver): soma na pilha.
  if (itemDados.type === "consumivel") {
    const chave = itemDados.flags?.nauren?.torre?.chave ?? null;
    const igual = para.items.find(i => i.type === "consumivel" && i.name === itemDados.name && (i.getFlag("nauren", "torre")?.chave ?? null) === chave);
    if (igual) {
      await igual.update({ "system.quantidade": (igual.system.quantidade ?? 0) + quantidade });
      return { aceito: true };
    }
  }
  const criados = await para.createEmbeddedDocuments("Item", [itemDados]).catch(err => { console.warn("Nauren RPG | Falha ao receber item.", err); return null; });
  return { aceito: !!criados?.length };
}


/** Queimando: o dano passa a somar por acúmulo (1d4 por acúmulo) - corrige as cópias já nas fichas, uma vez. */
async function naurenMigrarQueimandoPorAcumulo() {
  if (game.users.activeGM !== game.user || game.settings.get("nauren", "migracaoQueimandoAcumuloV1")) return;
  const atores = [...game.actors];
  for (const cena of game.scenes) for (const t of cena.tokens) if (!t.actorLink && t.actor) atores.push(t.actor);
  let n = 0;
  for (const a of atores) {
    const upd = [];
    for (const i of a.items) {
      if (i.type !== "condicao" || i.name !== "Queimando") continue;
      const efs = foundry.utils.deepClone(i.system.efeitosPeriodicos ?? []);
      let mudou = false;
      for (const ef of efs) if (ef.recurso === "dano" && ef.formula === "1d4" && !ef.aumentaPorAcumulo) { ef.aumentaPorAcumulo = true; mudou = true; }
      if (mudou) upd.push({ _id: i.id, "system.efeitosPeriodicos": efs });
    }
    if (upd.length) { await a.updateEmbeddedDocuments("Item", upd).catch(err => console.warn("Nauren RPG | Queimando por acúmulo", a.name, err)); n += upd.length; }
  }
  await game.settings.set("nauren", "migracaoQueimandoAcumuloV1", true);
  if (n) console.log(`Nauren RPG | Queimando agora soma por acúmulo: ${n} cópia(s) atualizada(s).`);
}

// 0.94.22: roda na lista de migrações, depois dos compêndios (ver "naurenPassosDeMigracao").

/**
 * Auditoria das Condições (0.66.1): leva as correções do compêndio às cópias já nas fichas
 * (Preso sem Esquiva, Congelando na Estamina máxima, Alvejado automático, medo com custo de remoção,
 * Atordoado/Desacordado sem reações, descrições). Roda uma vez, no Mestre principal, depois da semeadura.
 */
async function naurenMigrarCondicoesAuditoria(tentativa = 0) {
  if (game.users.activeGM !== game.user || game.settings.get("nauren", "migracaoCondicoesAuditoriaV1")) return;
  const pack = game.packs.find(p => p.metadata?.label === "Nauren - Condições e Venenos");
  if (!pack) return;
  const nomes = ["Alvejado", "Preso/Agarrado", "Caído", "Amedrontado", "Pânico", "Pavor", "Atordoado", "Desacordado", "Congelando"];
  const idx = await pack.getIndex();
  const refs = {};
  for (const n of nomes) { const e = idx.find(x => x.name === n); if (e) refs[n] = await pack.getDocument(e._id); }
  // A semeadura pode ainda não ter terminado: espera o Preso já estar com a Esquiva proibida.
  if (!refs["Preso/Agarrado"]?.system?.proibeEsquiva) { if (tentativa < 10) setTimeout(() => naurenMigrarCondicoesAuditoria(tentativa + 1), 5000); return; }
  const campos = ["modificadores", "proibeEsquiva", "proibeBloqueio", "custoEstaminaExtraAcoes", "custoParaRemoverRecurso", "custoParaRemoverQuantidade", "usaGatilhos", "gatilhos", "descricao"];
  const atores = [...game.actors];
  for (const cena of game.scenes) for (const t of cena.tokens) if (!t.actorLink && t.actor) atores.push(t.actor);
  let n = 0;
  for (const a of atores) {
    const upd = [];
    for (const i of a.items) {
      if (i.type !== "condicao" || !refs[i.name]) continue;
      const ref = refs[i.name].system, mud = { _id: i.id };
      for (const c of campos) mud[`system.${c}`] = foundry.utils.deepClone(ref[c]);
      upd.push(mud);
    }
    if (upd.length) { await a.updateEmbeddedDocuments("Item", upd).catch(err => console.warn("Nauren RPG | auditoria das Condições", a.name, err)); n += upd.length; }
  }
  await game.settings.set("nauren", "migracaoCondicoesAuditoriaV1", true);
  if (n) console.log(`Nauren RPG | Condições corrigidas nas fichas: ${n} cópia(s).`);
}

// 0.94.22: roda na lista de migrações, depois dos compêndios (ver "naurenPassosDeMigracao").

/**
 * Venenos (0.66.3): Envenenamento comum sai depois do dano; a Névoa de Esporos passa a usar
 * "Esporos Venenosos" (que acumula). Leva isso às cópias já nas fichas, uma vez, depois da semeadura.
 */
async function naurenMigrarVenenos(tentativa = 0) {
  if (game.users.activeGM !== game.user || game.settings.get("nauren", "migracaoVenenosV1")) return;
  const pack = game.packs.find(p => p.metadata?.label === "Nauren - Condições e Venenos");
  if (!pack) return;
  const idx = await pack.getIndex({ fields: ["flags.nauren.seedId"] });
  const esporos = idx.find(e => e.flags?.nauren?.seedId === "condicao-esporos-venenosos");
  const veneno = idx.find(e => e.flags?.nauren?.seedId === "condicao-envenenamento");
  if (!esporos || !veneno) { if (tentativa < 10) setTimeout(() => naurenMigrarVenenos(tentativa + 1), 5000); return; }
  const uuidEsporos = esporos.uuid ?? `Compendium.${pack.collection}.Item.${esporos._id}`;
  const uuidVeneno = veneno.uuid ?? `Compendium.${pack.collection}.Item.${veneno._id}`;
  const atores = [...game.actors];
  for (const cena of game.scenes) for (const t of cena.tokens) if (!t.actorLink && t.actor) atores.push(t.actor);
  let n = 0;
  for (const a of atores) {
    const upd = [];
    for (const i of a.items) {
      if (i.type === "condicao" && i.name === "Envenenamento") {
        const efs = foundry.utils.deepClone(i.system.efeitosPeriodicos ?? []);
        if (efs.some(e => !e.removerCondicaoApos)) { for (const e of efs) e.removerCondicaoApos = true; upd.push({ _id: i.id, "system.efeitosPeriodicos": efs }); }
        continue;
      }
      const acoes = i.system?.acoes;
      if (!Array.isArray(acoes) || !acoes.length) continue;
      const novas = foundry.utils.deepClone(acoes);
      let mudou = false;
      for (const ac of novas) {
        if (i.name === "Névoa de Esporos" && ac.templatePersistenteCondicaoUuid && ac.templatePersistenteCondicaoUuid !== uuidEsporos) { ac.templatePersistenteCondicaoUuid = uuidEsporos; mudou = true; }
        if (Array.isArray(ac.condicoesAlvoMultiplas) && ac.condicoesAlvoMultiplas.includes(uuidVeneno) && !ac.condicoesAlvoMultiplas.includes(uuidEsporos)) { ac.condicoesAlvoMultiplas.push(uuidEsporos); mudou = true; }
      }
      if (mudou) upd.push({ _id: i.id, "system.acoes": novas });
    }
    if (upd.length) { await a.updateEmbeddedDocuments("Item", upd).catch(err => console.warn("Nauren RPG | venenos", a.name, err)); n += upd.length; }
  }
  await game.settings.set("nauren", "migracaoVenenosV1", true);
  if (n) console.log(`Nauren RPG | Venenos atualizados nas fichas: ${n} item(ns).`);
}

// 0.94.22: roda na lista de migrações, depois dos compêndios (ver "naurenPassosDeMigracao").

/** Tinta Energética: fórmula com rank mínimo 1 nas cópias já nas fichas (uma vez). */
async function naurenMigrarTintaEnergetica() {
  if (game.users.activeGM !== game.user || game.settings.get("nauren", "migracaoTintaEnergeticaV1")) return;
  const atores = [...game.actors];
  for (const cena of game.scenes) for (const t of cena.tokens) if (!t.actorLink && t.actor) atores.push(t.actor);
  for (const a of atores) for (const i of a.items) {
    if (i.type !== "habilidade" || i.name !== "Tinta Energética") continue;
    const gs = foundry.utils.deepClone(i.system.gatilhos ?? []);
    let mudou = false;
    for (const g of gs) if (g.quantidade === "@herancasDeCor+@rank-1") { g.quantidade = "@herancasDeCor+max(@rank,1)-1"; mudou = true; }
    if (mudou) await i.update({ "system.gatilhos": gs }).catch(err => console.warn("Nauren RPG | Tinta Energética", a.name, err));
  }
  await game.settings.set("nauren", "migracaoTintaEnergeticaV1", true);
}

// 0.94.22: roda na lista de migrações, depois dos compêndios (ver "naurenPassosDeMigracao").

/** 0.94.9: escudos já nas fichas e no mundo ganham o peso do livro (Simples 1, Médio 2, Grande 3) no limite de Ataque. */
const NAUREN_PESO_ESCUDOS_SEMEADOS = { "escudo-simples": 1, "escudo-medio": 2, "escudo-grande": 3 };

async function naurenMigrarPesoEscudos() {
  if (game.users.activeGM !== game.user || game.settings.get("nauren", "migracaoPesoEscudosV1")) return;
  const donos = [...game.actors];
  for (const cena of game.scenes) for (const t of cena.tokens) if (!t.actorLink && t.actor) donos.push(t.actor);
  const itens = [...game.items, ...donos.flatMap(a => [...a.items])];
  for (const i of itens) {
    if (i.type !== "armadura" || (i.system.pesoOfensivo ?? 0) > 0) continue;
    const peso = NAUREN_PESO_ESCUDOS_SEMEADOS[i.getFlag("nauren", "seedId")];
    if (peso) await i.update({ "system.pesoOfensivo": peso }, { naurenSemLimite: true }).catch(err => console.warn("Nauren RPG | peso do escudo", i.name, err));
  }
  await game.settings.set("nauren", "migracaoPesoEscudosV1", true);
}

export { NAUREN_PESO_ESCUDOS_SEMEADOS, NAUREN_QUERY_OFERECER_ITEM, NAUREN_TIPOS_ENTREGAVEIS, naurenHandleQueryOferecerItem, naurenMigrarCondicoesAuditoria, naurenMigrarPesoEscudos, naurenMigrarQueimandoPorAcumulo, naurenMigrarTintaEnergetica, naurenMigrarVenenos, naurenOferecerItem, naurenRotuloTipoItem };
