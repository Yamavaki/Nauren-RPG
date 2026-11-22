// 0.122.1: andar ponto a ponto (Ctrl + clique) = várias atualizações do mesmo movimento.
export default async function (t) {
  const m = await import("../../modulos/movimento.mjs");
  const tok = { id: "T1" };
  const mov1 = { id: "M1", chain: [], passed: { distance: 4, waypoints: [{ x: 0, y: 0 }, { x: 100, y: 0, checkpoint: true, explicit: true }] }, pending: { distance: 9, waypoints: [{ x: 100, y: 100, intermediate: true }, { x: 300, y: 300, checkpoint: true }] } };
  const cam = m.naurenCaminhoDoMovimento(mov1);
  t(cam.length === 3 && cam[2].x === 300 && cam[1].checkpoint === true, "caminho inteiro (sem os pontos intermediários gerados pelo Foundry)");
  t(m.naurenCaminhoDoMovimento(null).length === 0, "sem dados de movimento: caminho vazio");
  t(!m.naurenMovimentoJaLiberado(tok, mov1), "1ª atualização: ainda não liberada (confere o trajeto todo)");
  m.naurenLiberarMovimento(tok, mov1);
  t(m.naurenMovimentoJaLiberado(tok, { id: "M1", chain: [] }), "mesmo movimento, próximo trecho: passa");
  t(m.naurenMovimentoJaLiberado(tok, { id: "M2", chain: ["M1"] }), "continuação (chain): passa");
  t(m.naurenMovimentoJaLiberado(tok, { id: "M3", chain: ["M2"] }), "continuação da continuação: passa");
  t(!m.naurenMovimentoJaLiberado(tok, { id: "X9", chain: [] }), "outro movimento: confere de novo");
  const fs = await import("node:fs");
  const b = fs.readFileSync(new URL("../../modulos/borda-token.mjs", import.meta.url), "utf8");
  t(/\(Number\(movInfo\.passed\?\.distance\) \|\| 0\) \+ \(Number\(movInfo\.pending\?\.distance\) \|\| 0\)/.test(b), "a janela usa a distância do trajeto inteiro");
  t(/passed\?\.distance\) \|\| 0; \/\/ trecho desta atualização/.test(b), "o saldo desconta só o trecho de cada atualização");
}
