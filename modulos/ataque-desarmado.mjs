/* Nauren RPG — Ataque Desarmado (0.122): está na ficha de todo personagem e NPC.
 *   Golpe   · teste de ataque normal (Poder de Ataque) · dano = Poder de Ataque, sem dado
 *   Derrubar · teste de ataque normal · sem dano · acertando, o alvo fica Caído
 *   Agarrar  · teste de ataque normal · sem dano · acertando, o alvo fica Preso/Agarrado
 * Custo: 1 Estamina cada (o mesmo do ataque básico). Alcance 1 m (corpo a corpo).
 */

export const NAUREN_SEED_ATAQUE_DESARMADO = "habilidade-universal-ataque-desarmado";
export const NAUREN_TIPOS_ATOR_DESARMADO = Object.freeze(["personagem", "npc"]);

/** Dados da Habilidade (pura, testada): uuids das Condições entram de fora. */
export function naurenDadosAtaqueDesarmado(uuidCaido, uuidPreso, montarDescricao = o => o.regra) {
  const base = { custoEstamina: 1, alcance: "1m", ehAtaque: true, atributoAtaque: "poderAtaque", modoAlvo: "selecionado", modoAlvoTravado: true };
  return {
    name: "Ataque Desarmado", type: "habilidade", img: "icons/skills/melee/unarmed-punch-fist.webp",
    system: {
      acoes: [
        { ...base, nome: "Golpe desarmado", danos: [{ formula: "@poderAtaque", aplicarNoAlvo: true }] },
        { ...base, nome: "Derrubar", danos: [], condicoesAplicadas: uuidCaido ? [{ uuid: uuidCaido, acumulos: 1, ativo: true, soSeAcertar: true, perguntarParaEvitar: false }] : [] },
        { ...base, nome: "Agarrar", danos: [], condicoesAplicadas: uuidPreso ? [{ uuid: uuidPreso, acumulos: 1, ativo: true, soSeAcertar: true, perguntarParaEvitar: false }] : [] }
      ],
      descricao: montarDescricao({
        regra: "Todos os personagens. Custo: 1 Estamina. Alcance: 1 m. Um ataque sem arma, com o teste de ataque normal (Poder de Ataque). <b>Golpe desarmado:</b> em um acerto, causa dano igual ao seu Poder de Ataque, sem dado. <b>Derrubar:</b> em um acerto, o alvo fica Caído, sem sofrer dano. <b>Agarrar:</b> em um acerto, o alvo fica Agarrado, sem sofrer dano.",
        automatico: "três Ações na mesma Habilidade: teste de ataque contra o alvo marcado; o Golpe tira o Poder de Ataque da Vida; Derrubar aplica Caído e Agarrar aplica Preso/Agarrado só se acertar. Toda ficha de personagem e de NPC recebe esta Habilidade sozinha.",
        manual: ""
      })
    }
  };
}

/** Semente no compêndio de Habilidades de Classe. */
export async function naurenSemearAtaqueDesarmado(packHabilidades, packCondicoes) {
  const { naurenGarantirHabilidadeDeClasse } = await import("./compendios.mjs");
  const { naurenUuidPorSeed } = await import("./entidades-campo.mjs");
  const { naurenMontarDescricao } = await import("./prioridades.mjs");
  const uuidCaido = await naurenUuidPorSeed(packCondicoes, "condicao-caido");
  const uuidPreso = await naurenUuidPorSeed(packCondicoes, "condicao-preso");
  const item = await naurenGarantirHabilidadeDeClasse(packHabilidades, NAUREN_SEED_ATAQUE_DESARMADO, naurenDadosAtaqueDesarmado(uuidCaido, uuidPreso, naurenMontarDescricao));
  return item?.uuid ?? null;
}

let uuidCache = null;
async function uuidDaSemente() {
  if (uuidCache) return uuidCache;
  const { naurenUuidPorSeed } = await import("./entidades-campo.mjs");
  const pack = game.packs.find(pk => pk.metadata.label === "Nauren - Habilidades de Classe");
  uuidCache = pack ? await naurenUuidPorSeed(pack, NAUREN_SEED_ATAQUE_DESARMADO) : null;
  return uuidCache;
}

export function naurenTemAtaqueDesarmado(actor) {
  return !!actor?.items?.some(i => i.getFlag?.("nauren", "seedId") === NAUREN_SEED_ATAQUE_DESARMADO || (i.type === "habilidade" && i.name === "Ataque Desarmado"));
}

/** Põe o Ataque Desarmado na ficha, se ainda não tiver. Devolve true se criou. */
export async function naurenGarantirAtaqueDesarmado(actor) {
  if (!actor || !NAUREN_TIPOS_ATOR_DESARMADO.includes(actor.type) || naurenTemAtaqueDesarmado(actor)) return false;
  if (actor.getFlag?.("nauren", "entidade")?.ativa) return false; // Orbe, Jóia, Moradia: não são personagens
  const uuid = await uuidDaSemente(); if (!uuid) return false;
  const fonte = await fromUuid(uuid).catch(() => null); if (!fonte) return false;
  const dados = fonte.toObject(); delete dados._id;
  foundry.utils.setProperty(dados, "flags.core.sourceId", uuid);
  foundry.utils.setProperty(dados, "flags.nauren.origemUuid", uuid);
  foundry.utils.setProperty(dados, "system.ativo", true);
  await actor.createEmbeddedDocuments("Item", [dados], { naurenAtaqueDesarmado: true });
  return true;
}

/** Mundo já existente (Mestre, uma vez): todas as fichas recebem. */
export async function naurenMigrarAtaqueDesarmadoV1() {
  if (!game.user.isGM || game.settings.get("nauren", "migracaoAtaqueDesarmadoV1")) return;
  let n = 0;
  for (const a of game.actors) if (await naurenGarantirAtaqueDesarmado(a).catch(() => false)) n++;
  await game.settings.set("nauren", "migracaoAtaqueDesarmadoV1", true);
  if (n) {
    const { naurenPostarCard } = await import("../nauren.mjs");
    naurenPostarCard({ titulo: "Ataque Desarmado", icone: "icons/skills/melee/unarmed-punch-fist.webp", fonte: "Fichas ajustadas",
      linhas: [{ label: "Recebeu", value: `${n} ficha(s)`, breakdown: "Golpe desarmado, Derrubar e Agarrar" }] }).catch(() => {});
  }
}

export function __naurenIniciar_ataqueDesarmado() {
  // Ficha nova (criada, importada do compêndio ou duplicada): o Mestre ativo adiciona.
  Hooks.on("createActor", actor => {
    if (game.users.activeGM !== game.user) return;
    setTimeout(() => naurenGarantirAtaqueDesarmado(actor).catch(err => console.warn("Nauren RPG | Ataque Desarmado", err)), 300);
  });
}
