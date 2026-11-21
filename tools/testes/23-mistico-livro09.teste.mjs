// Livro 0.9: árvore do Místico (Poesia) sem as duas setas (0.120.1).
export default async function (t) {
  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../../modulos/compendios.mjs", import.meta.url), "utf8");
  t(/itemUuid: dancaDoEspiritoBebado\.uuid, prerequisitos: \[\{ id: "brinde-ao-destino", linhaVisivel: false \}\]/.test(src), "Dança do Espírito Bêbado só exige Brinde ao Destino");
  t(/itemUuid: inundacaoEspiritual\.uuid, prerequisitos: \[\{ id: "danca-do-espirito-bebado", linhaVisivel: false \}\]/.test(src), "Inundação Espiritual só exige a Dança");
  const { naurenLivro09ArvoreMisticoMudou: mudou } = await import("../../modulos/livro-09.mjs");
  const velha = { type: "subclasse", system: { nos: [{ id: "danca-do-espirito-bebado", prerequisitos: [{ id: "brinde-ao-destino" }, { id: "postura-gruhua" }] }] } };
  const nova = { type: "subclasse", system: { nos: [{ id: "danca-do-espirito-bebado", prerequisitos: [{ id: "brinde-ao-destino" }] }, { id: "inundacao-espiritual", prerequisitos: [{ id: "danca-do-espirito-bebado" }] }] } };
  t(mudou(velha) && !mudou(nova), "migração só mexe na árvore que ainda tem as setas");
}
