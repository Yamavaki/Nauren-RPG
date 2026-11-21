/* Nauren RPG — Livro 0.9: migração das fichas para Sacerdote, Mago, Ladino e Druida (0.120).
 * Mesma sequência do "Ressincronizar com o Compêndio": mantém ranks, usos gastos e recursos. */

/** Itens (por nome) que mudaram de regra na 0.120. */
export const NAUREN_LIVRO09_ITENS_0120 = Object.freeze(["Estigmas do Milagre", "Mísseis Arcanos", "Análise Paciente", "Druidismo"]);
/** Nós de árvore de Subclasse que mudaram (para achar a árvore certa). */
export const NAUREN_LIVRO09_NOS_0120 = Object.freeze(["estigmas-do-milagre", "erradiar-luz-sagrada"]);

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
