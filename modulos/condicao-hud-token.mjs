/* Nauren RPG — Condição pelo Token HUD do Foundry. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { naurenCondicaoDoSistemaPorNome } from "./entidades-campo.mjs";
import { NaurenAlvoHelper } from "./ficha-ator.mjs";
import { NAUREN_QUANTIDADE_MAXIMA, naurenAtualizarLuzVisaoDosTokens, naurenEhMoeda, naurenMudancaMexeLuzVisao } from "../nauren.mjs";

/* =======================================
 * 0.94.34: Condição pelo Token HUD do Foundry
 * Os ícones de status do próprio Foundry (Sangrando, Em chamas, Envenenado, Caído...) são só figurinhas:
 * não têm a mecânica do Nauren. Quem marcar um deles pelo Token HUD recebe a Condição de verdade
 * (com dano no início da rodada, acúmulos e duração) e o ícone do Foundry sai.
 * ======================================= */
const NAUREN_STATUS_CORE_PARA_CONDICAO = {
  bleeding: "Sangramento", burning: "Queimando", poison: "Envenenamento", prone: "Caído", blind: "Cego",
  fear: "Amedrontado", frightened: "Amedrontado", stun: "Atordoado", unconscious: "Desacordado", sleep: "Desacordado",
  restrain: "Preso/Agarrado", frozen: "Congelando"
};

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_condicao_hud_token() {

Hooks.on("createActiveEffect", async (efeito, opcoes, userId) => {
  if (userId !== game.user.id) return;
  const actor = efeito.parent;
  if (!(actor instanceof Actor) || !["personagem", "npc"].includes(actor.type)) return;
  const nomes = [...(efeito.statuses ?? [])].map(s => NAUREN_STATUS_CORE_PARA_CONDICAO[s]).filter(Boolean);
  if (!nomes.length) return;
  try {
    const pk = game.packs.find(p => p.metadata?.label === "Nauren - Condições e Venenos");
    if (pk && !pk.index?.size) await pk.getIndex();
    const aplicadas = [];
    for (const nome of new Set(nomes)) {
      const uuid = naurenCondicaoDoSistemaPorNome(nome);
      if (!uuid) continue;
      await NaurenAlvoHelper.aplicarCondicao(actor, uuid, 1);
      aplicadas.push(nome);
    }
    if (aplicadas.length) {
      await efeito.delete();
      ui.notifications.info(`${actor.name}: ${aplicadas.join(", ")} aplicado como Condição do Nauren (com dano, acúmulos e duração).`);
    }
  } catch (err) { console.warn("Nauren RPG | Converter status do Token HUD em Condição", err); }
});


/* 0.94.35: Condição arrastada na ficha "modelo" de um monstro (a da barra lateral) não chega nos tokens
 * NÃO vinculados que já estão no combate: cada um tem a sua própria ficha. Avisa quem arrastou. */
Hooks.on("createItem", (item, opcoes, userId) => {
  if (userId !== game.user.id || item.type !== "condicao") return;
  const ator = item.parent;
  if (!(ator instanceof Actor) || ator.isToken) return;
  const combate = game.combat;
  if (!combate?.started) return;
  const tokensSoltos = combate.combatants.filter(c => c.token && !c.token.actorLink && c.token.actorId === ator.id);
  if (!tokensSoltos.length) return;
  const semACondicao = tokensSoltos.filter(c => !c.actor?.items?.some(i => i.type === "condicao" && i.name === item.name));
  if (!semACondicao.length) return;
  ui.notifications.warn(`${item.name} entrou na ficha modelo de "${ator.name}" (barra lateral), não no token do combate. Abra a ficha pelo token (clique duplo no token) e arraste lá, ou arraste a Condição direto no token.`, { permanent: true });
});


// Funções usadas pelos módulos separados (modulos/*.mjs).
// 0.99: equipar, ativar, acender ou editar a luz/visão de um item redesenha o token na hora (em cada tela)
Hooks.on("updateItem", (item, changes) => { if (item.parent?.documentName === "Actor" && naurenMudancaMexeLuzVisao(item, changes)) naurenAtualizarLuzVisaoDosTokens(item.parent); });

// 0.99: moeda que chega num ator que já tem a mesma moeda vira uma pilha só (soma a quantidade).
Hooks.on("preCreateItem", (item, dados, opcoes, userId) => {
  try {
    const ator = item.parent;
    if (opcoes?.naurenSemJuntar || ator?.documentName !== "Actor" || !naurenEhMoeda(item)) return;
    const existente = ator.items.find(i => i.id !== item.id && naurenEhMoeda(i) && i.name === item.name);
    if (!existente) return;
    const soma = Math.min(NAUREN_QUANTIDADE_MAXIMA, (Number(existente.system.quantidade) || 0) + (Number(item.system.quantidade) || 0));
    existente.update({ "system.quantidade": soma });
    return false;
  } catch (err) { console.warn("Nauren RPG | juntar moedas", err); }
});

Hooks.on("createItem", item => { if (item.parent?.documentName === "Actor" && item.system?.luzVisao) naurenAtualizarLuzVisaoDosTokens(item.parent); });

Hooks.on("deleteItem", item => { if (item.parent?.documentName === "Actor" && item.system?.luzVisao) naurenAtualizarLuzVisaoDosTokens(item.parent); });
}

export { NAUREN_STATUS_CORE_PARA_CONDICAO };
