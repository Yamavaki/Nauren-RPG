// Quadro de avisos: categorias, posições, ocultas, filtro e "NOVA" (0.115).
export default async function (t) {
  const E = await import("../../modulos/escritos.mjs");
  const Q = await import("../../modulos/quadro-avisos.mjs");
  const itens = [{ nome: "P", formato: "cartaz", cartaz: { tipo: "procurado" } }, { nome: "M", formato: "cartaz", cartaz: { tipo: "missao" } }, { nome: "N", formato: "nota" }]
    .map((o, i) => ({ ...E.naurenEscritosLerJson(JSON.stringify(o))[0], id: `n${i}`, flags: i === 2 ? { nauren: { armazem: { oculto: true } } } : {} }));
  const mapa = new Map(itens.map(i => [i.id, i]));
  const armazem = { id: "q", items: Object.assign([...itens], { get: id => mapa.get(id) }), system: { modo: "quadro", quadro: { estilo: "medieval", placa: "AVISOS", categorias: ["Rumores"] } } };
  const notas = Q.naurenQuadroNotas(armazem, { mestre: true });
  t(notas[0].cat === "procurados" && notas[1].cat === "missoes" && notas[2].cat === "avisos", "categoria pelo tipo do cartaz");
  t(new Set(notas.map(n => `${Math.round(n.x)},${Math.round(n.y)}`)).size === 3, "posições automáticas sem empilhar");
  t(Q.naurenQuadroNotas(armazem).length === 2, "nota escondida não aparece para jogador");
  game.user = { isGM: false, id: "j", flags: {} };
  const h = Q.naurenQuadroHtml(armazem, { cat: "missoes" });
  t(h.includes("2 novas para você") && !h.includes("data-nq-acao") && h.includes("nq-fora"), "jogador: novas, sem ferramentas, filtro");
  game.user = { isGM: true, id: "mestre", flags: {} };
  t(Q.naurenQuadroHtml(armazem, {}, { mestre: true }).includes('<option value="Rumores"'), "categoria criada pelo Mestre");
}
