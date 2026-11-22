// Ataque Desarmado (0.122): na ficha de todo personagem e NPC.
export default async function (t) {
  const m = await import("../../modulos/ataque-desarmado.mjs");
  const d = m.naurenDadosAtaqueDesarmado("Caido.UUID", "Preso.UUID");
  const [golpe, derrubar, agarrar] = d.system.acoes;
  t(d.type === "habilidade" && d.system.acoes.length === 3, "Habilidade com 3 Ações");
  t(d.system.acoes.every(a => a.ehAtaque && a.atributoAtaque === "poderAtaque" && a.custoEstamina === 1 && a.alcance === "1m"), "as três: teste de ataque normal (Poder de Ataque), 1 Estamina, 1 m");
  t(golpe.danos.length === 1 && golpe.danos[0].formula === "@poderAtaque" && !/d\d/.test(golpe.danos[0].formula), "Golpe: dano = Poder de Ataque, sem dado");
  t(derrubar.danos.length === 0 && derrubar.condicoesAplicadas[0].uuid === "Caido.UUID" && derrubar.condicoesAplicadas[0].soSeAcertar, "Derrubar: sem dano, Caído se acertar");
  t(agarrar.danos.length === 0 && agarrar.condicoesAplicadas[0].uuid === "Preso.UUID" && agarrar.condicoesAplicadas[0].soSeAcertar, "Agarrar: sem dano, Preso/Agarrado se acertar");
  t(m.NAUREN_TIPOS_ATOR_DESARMADO.join() === "personagem,npc", "vai para personagem e NPC (não para armazenamento)");
  t(m.naurenTemAtaqueDesarmado({ items: [{ type: "habilidade", name: "Ataque Desarmado", getFlag: () => null }] }) && !m.naurenTemAtaqueDesarmado({ items: [] }), "reconhece quem já tem (não duplica)");
  const fs = await import("node:fs");
  const cm = fs.readFileSync(new URL("../../modulos/criador-monstros.mjs", import.meta.url), "utf8");
  t(/naurenSemearAtaqueDesarmado\(packs\.habilidades, packs\.condicoes\)/.test(cm) && /naurenMigrarAtaqueDesarmadoV1/.test(cm), "semeado e aplicado nas fichas existentes ao abrir o mundo");
}
