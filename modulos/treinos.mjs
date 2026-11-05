/* Nauren RPG — Seguir o Exemplo (Empíreo), 0.102.4.
 * "1x por dia, pode treinar por 1 hora com um aliado. Após 5 treinamentos, ambos recebem +1 em Força, Agilidade
 * ou Estamina (à escolha), até 2 vezes por personagem."
 * Conta os treinos por aliado na ficha do Empíreo; no 5º, cada um ganha um Efeito permanente (item à parte, que a
 * ressincronização com o compêndio não toca). O bônus de quem não é seu vai pelo Mestre. */
import { naurenPostarCard, naurenSomarEfeitoPermanente } from "../nauren.mjs";
import { naurenKitJanela } from "./janelas-kit.mjs";

const Q = "nauren.efeitoPermanente";
const ATR = { forca: "Força", agilidade: "Agilidade", estamina: "Estamina" };
const TREINOS = 5, LIMITE = 2;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
export const naurenRecebidosSeguirOExemplo = a => Number(a?.getFlag?.("nauren", "seguirOExemploRecebidos") ?? 0) || 0;

async function darBonus(ator, campo, origem) {
  const dados = { nome: `Seguir o Exemplo: ${ATR[campo]}`, campo, delta: 1, img: "icons/sundries/flags/banner-flag-blue.webp", origem };
  const novos = naurenRecebidosSeguirOExemplo(ator) + 1;
  if (ator.isOwner) { await naurenSomarEfeitoPermanente(ator, dados); await ator.setFlag("nauren", "seguirOExemploRecebidos", novos); return true; }
  const gm = game.users.activeGM;
  if (!gm) return false;
  return gm.query(Q, { atorUuid: ator.uuid, dados, recebidos: novos }, { timeout: 20000 }).catch(() => false);
}
export function naurenTreinosInit() {
  CONFIG.queries ??= {};
  CONFIG.queries[Q] = async ({ atorUuid, dados, recebidos }) => {
    if (!game.user.isGM) return false;
    const doc = await fromUuid(atorUuid).catch(() => null); const ator = doc?.actor ?? doc;
    if (!ator) return false;
    await naurenSomarEfeitoPermanente(ator, dados);
    await ator.setFlag("nauren", "seguirOExemploRecebidos", recebidos);
    return true;
  };
}
/** Ação "Treinar com um aliado". sheet = ficha do Empíreo. */
export async function naurenTreinarSeguirOExemplo(sheet, item, acao, idx) {
  const eu = sheet.actor;
  if (game.combat?.started && game.combat.combatants.some(c => c.actor === eu)) { ui.notifications.warn(`${item.name}: o treino leva 1 hora (fora de combate).`); return; }
  const acaoAtual = item.system.acoes?.[idx];
  if (acaoAtual?.usaUsos && (acaoAtual.usosAtual ?? 0) <= 0) { ui.notifications.warn(`${item.name}: já treinou hoje (1 vez por dia; volta ao Descansar).`); return; }
  // Aliados: personagens de jogador no mundo e tokens amigos na cena.
  const vistos = new Set([eu.id]);
  const candidatos = [];
  for (const t of canvas?.tokens?.placeables ?? []) if (t.actor && !vistos.has(t.actor.id) && t.document.disposition === (eu.getActiveTokens?.(true)?.[0]?.document?.disposition ?? 1) && ["personagem", "npc"].includes(t.actor.type)) { vistos.add(t.actor.id); candidatos.push(t.actor); }
  for (const a of game.actors?.filter(a => a.type === "personagem" && a.hasPlayerOwner) ?? []) if (!vistos.has(a.id)) { vistos.add(a.id); candidatos.push(a); }
  if (!candidatos.length) { ui.notifications.warn(`${item.name}: não há nenhum aliado para treinar.`); return; }
  const contagem = foundry.utils.deepClone(eu.getFlag("nauren", "seguirOExemplo") ?? {});
  const opcoes = candidatos.map(a => `<option value="${a.id}">${esc(a.name)} — ${contagem[a.id] ?? 0} de ${TREINOS} treinos</option>`).join("");
  const escolhido = await foundry.applications.api.DialogV2.prompt({ ...naurenKitJanela(eu), window: { title: `${item.name} — treinar 1 hora` },
    content: `<p>Com quem ${esc(eu.name)} treina hoje?</p><div class="field"><select name="aliado">${opcoes}</select></div><p class="nauren-popup-nota">No ${TREINOS}º treino com o mesmo aliado, os dois ganham +1 em Força, Agilidade ou Estamina (cada personagem até ${LIMITE} vezes por esta habilidade).</p>`,
    ok: { label: "Treinar", callback: (ev, btn) => btn.form?.elements?.aliado?.value ?? null }, rejectClose: false }).catch(() => null);
  if (!escolhido) return;
  const aliado = game.actors.get(escolhido);
  if (!aliado) return;
  // Gasta o uso do dia.
  if (acaoAtual?.usaUsos) { const acoes = foundry.utils.deepClone(item.system.acoes); acoes[idx].usosAtual = Math.max(0, (acoes[idx].usosAtual ?? 1) - 1); await item.update({ "system.acoes": acoes }); }
  const n = (Number(contagem[aliado.id]) || 0) + 1;
  const linhas = [{ label: "Treino", value: `${Math.min(n, TREINOS)} de ${TREINOS}`, breakdown: `com ${aliado.name}` }];
  if (n < TREINOS) {
    contagem[aliado.id] = n;
    await eu.setFlag("nauren", "seguirOExemplo", contagem);
  } else {
    contagem[aliado.id] = 0;
    await eu.setFlag("nauren", "seguirOExemplo", contagem);
    const quem = [eu, aliado].filter(a => naurenRecebidosSeguirOExemplo(a) < LIMITE);
    for (const a of [eu, aliado]) if (!quem.includes(a)) linhas.push({ label: a.name, value: "já ganhou 2 vezes", breakdown: "limite desta habilidade" });
    if (quem.length) {
      const sel = a => `<div class="field"><label>${esc(a.name)}</label><select name="${a.id}">${Object.entries(ATR).map(([k, v]) => `<option value="${k}">+1 ${v}</option>`).join("")}</select></div>`;
      const esc2 = await foundry.applications.api.DialogV2.prompt({ ...naurenKitJanela(eu), window: { title: `${item.name} — ${TREINOS} treinos!` },
        content: `<p>Os dois completaram ${TREINOS} treinos. Qual atributo cada um ganha?</p>${quem.map(sel).join("")}`,
        ok: { label: "Confirmar", callback: (ev, btn) => Object.fromEntries(quem.map(a => [a.id, btn.form?.elements?.[a.id]?.value ?? "forca"])) }, rejectClose: false }).catch(() => null)
        ?? Object.fromEntries(quem.map(a => [a.id, "forca"]));
      for (const a of quem) {
        const campo = ATR[esc2[a.id]] ? esc2[a.id] : "forca";
        const ok = await darBonus(a, campo, `${item.name} (${eu.name} e ${aliado.name})`);
        linhas.push({ label: a.name, value: ok ? `+1 ${ATR[campo]}` : "não aplicado", breakdown: ok ? `permanente (${naurenRecebidosSeguirOExemplo(a)} de ${LIMITE})` : "sem Mestre conectado" });
      }
    }
  }
  await naurenPostarCard({ ator: eu, titulo: item.name, icone: item.img, fonte: "Treino de 1 hora", linhas });
}
