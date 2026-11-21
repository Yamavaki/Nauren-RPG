/* Nauren RPG — Livro 0.9: migração das fichas para Sacerdote, Mago, Ladino e Druida (0.120).
 * Mesma sequência do "Ressincronizar com o Compêndio": mantém ranks, usos gastos e recursos. */

/** Itens (por nome) que mudaram de regra na 0.120. */
export const NAUREN_LIVRO09_ITENS_0120 = Object.freeze(["Estigmas do Milagre", "Mísseis Arcanos", "Análise Paciente", "Druidismo"]);
/** Nós de árvore de Subclasse que mudaram (para achar a árvore certa). */
export const NAUREN_LIVRO09_NOS_0120 = Object.freeze(["estigmas-do-milagre", "erradiar-luz-sagrada"]);
/** 0.120.1: árvore do Místico (Poesia) sem as setas Postura Gruhua → Dança e Gruhua → Inundação. */
export const NAUREN_LIVRO09_NOS_01201 = Object.freeze(["danca-do-espirito-bebado", "inundacao-espiritual"]);

/** Precisa reconciliar este item? (função pura, testada) */
export function naurenLivro09ItemMudou0120(it) {
  if (!it) return false;
  if (["habilidade", "magia"].includes(it.type) && NAUREN_LIVRO09_ITENS_0120.includes(String(it.name ?? "").trim())) return true;
  if (it.type === "subclasse" && (it.system?.nos ?? []).some(n => NAUREN_LIVRO09_NOS_0120.includes(n.id))) return true;
  if (it.type === "classe" && /^(ladino|druida)$/i.test(String(it.system?.identifier || it.name || ""))) return true;
  return false;
}

export async function naurenMigrarLivro09ClassesV1() {
  if (!game.user.isGM || game.settings.get("nauren", "migracaoLivro09ClassesV1")) return;
  const ict = await import("./icone-condicao-token.mjs");
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  const relatorio = [];
  for (const a of atores) {
    const mudados = [];
    for (const it of Array.from(a.items)) {
      if (!naurenLivro09ItemMudou0120(it)) continue;
      if (await ict.naurenReconciliarItemComCompendio(it).catch(err => { console.warn("Nauren RPG | Livro 0.9: falha ao atualizar", a.name, it.name, err); return false; })) mudados.push(it.name);
    }
    // Ladino no nível 10: o 3º degrau da Análise Paciente veio do 11 para o 10.
    const classeLad = a.items.find(i => i.type === "classe" && /^ladino$/i.test(String(i.system.identifier || i.name)));
    const analise = a.items.find(i => i.type === "habilidade" && i.name === "Análise Paciente");
    if (classeLad && analise && (a.system.nivel ?? 0) >= 10 && (analise.system.rankAtual ?? 0) < 3) {
      await analise.update({ "system.rankAtual": 3 }).catch(() => null);
      mudados.push("Análise Paciente rank 3 (nível 10)");
    }
    if (mudados.length) relatorio.push(`${a.name}: ${[...new Set(mudados)].join(", ")}`);
  }
  await game.settings.set("nauren", "migracaoLivro09ClassesV1", true);
  if (relatorio.length) {
    const { naurenPostarCard } = await import("../nauren.mjs");
    naurenPostarCard({ titulo: "Livro 0.9: Sacerdote, Mago, Ladino e Druida", icone: "icons/sundries/books/book-backed-silver-red.webp", fonte: "Fichas ajustadas",
      linhas: relatorio.map(r => ({ label: "Ajuste", value: r })) }).catch(() => {});
  }
}

/** 0.120.1: reconcilia as árvores do Místico (Poesia) que ainda têm as setas removidas no livro 0.9. */
export function naurenLivro09ArvoreMisticoMudou(it) {
  if (it?.type !== "subclasse") return false;
  const nos = it.system?.nos ?? [];
  const req = id => (nos.find(n => n.id === id)?.prerequisitos ?? []).map(p => p.id);
  return req("danca-do-espirito-bebado").includes("postura-gruhua") || req("inundacao-espiritual").includes("gruhua-senhor-das-brumas");
}

export async function naurenMigrarLivro09MisticoSetasV1() {
  if (!game.user.isGM || game.settings.get("nauren", "migracaoLivro09MisticoSetasV1")) return;
  const ict = await import("./icone-condicao-token.mjs");
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  const nomes = [];
  for (const a of atores) for (const it of Array.from(a.items)) {
    if (!naurenLivro09ArvoreMisticoMudou(it)) continue;
    if (await ict.naurenReconciliarItemComCompendio(it).catch(() => false)) nomes.push(a.name);
  }
  await game.settings.set("nauren", "migracaoLivro09MisticoSetasV1", true);
  if (nomes.length) {
    const { naurenPostarCard } = await import("../nauren.mjs");
    naurenPostarCard({ titulo: "Livro 0.9: Místico", icone: "icons/consumables/drinks/wine-bottle-glass-white.webp", fonte: "Árvore da Poesia",
      linhas: [{ label: "Setas removidas", value: "Postura Gruhua → Dança do Espírito Bêbado; Gruhua → Inundação Espiritual", breakdown: nomes.join(", ") }] }).catch(() => {});
  }
}

/** 0.121: Poesia Ghurua - Brinde ao Destino (ação "Beber cabaça"), Dança do Espírito Bêbado e Páginas em Chamas (texto). */
export const NAUREN_LIVRO09_ITENS_0121 = Object.freeze(["Brinde ao Destino", "Dança do Espírito Bêbado", "Páginas em Chamas"]);
export async function naurenMigrarLivro09PoesiaV1() {
  if (!game.user.isGM || game.settings.get("nauren", "migracaoLivro09PoesiaV1")) return;
  const ict = await import("./icone-condicao-token.mjs");
  const atores = new Set(game.actors);
  for (const cena of game.scenes) for (const t of cena.tokens) if (t.actor && !t.actorLink) atores.add(t.actor);
  const nomes = [];
  for (const a of atores) for (const it of Array.from(a.items)) {
    if (it.type !== "habilidade" || !NAUREN_LIVRO09_ITENS_0121.includes(it.name)) continue;
    if (await ict.naurenReconciliarItemComCompendio(it).catch(() => false)) nomes.push(`${a.name}: ${it.name}`);
  }
  await game.settings.set("nauren", "migracaoLivro09PoesiaV1", true);
  if (nomes.length) {
    const { naurenPostarCard } = await import("../nauren.mjs");
    naurenPostarCard({ titulo: "Livro 0.9: Poesia Ghurua", icone: "icons/consumables/drinks/tea-jug-gourd-brown.webp", fonte: "Fichas ajustadas",
      linhas: nomes.map(n => ({ label: "Atualizado", value: n })) }).catch(() => {});
  }
}
