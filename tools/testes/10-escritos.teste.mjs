// Escritos: eras, JSON ida e volta, mensagens, terminal com senha, cartaz e miniaturas (0.111–0.116).
export default async function (t) {
  const E = await import("../../modulos/escritos.mjs");
  const F = await import("../../modulos/escritos-formatos.mjs");
  const { NAUREN_ESCRITOS_MODELOS: M } = await import("../../modulos/escritos-modelos.mjs");
  const ler = o => E.naurenEscritosLerJson(JSON.stringify(o))[0];
  const item = (d, id = "x") => ({ name: d.name, img: d.img, type: "consumivel", uuid: `Item.${id}`, id, isOwner: true, system: d.system });
  game.user = { isGM: true, id: "mestre", flags: {} };
  // eras
  t(E.naurenEscritoNormalizar({ formato: "carta", papel: "creme" }).era === "classico", "escrito antigo continua Clássico");
  const pm = ler({ nome: "P", era: "moderno", formato: "nota" }).system.escrito;
  t(pm.papel === "postit" && pm.fonte === "manuscrita", "sugestão da era moderna");
  for (const k of Object.keys(E.NAUREN_ESCRITO_PAPEIS)) t(!!E.NAUREN_ESCRITO_PAPEL_ERA[k], `papel ${k} tem era`);
  // mensagens
  const m = ler({ nome: "Cel", formato: "mensagens", mensagens: { aosPoucos: true, reveladas: 1, lista: [{ data: "ontem" }, { lado: "outro", texto: "a" }, { lado: "eu", texto: "b" }] } }).system.escrito;
  t(m.era === "moderno" && F.naurenMsgTotal(m.mensagens) === 2, "mensagens sem era viram Moderno");
  t(F.naurenMsgVisiveis(m.mensagens).filter(x => x.visivel).length === 2, "revelar aos poucos (separador + 1)");
  // terminal
  const term = ler({ nome: "T", era: "cyberpunk", formato: "terminal", terminal: { senha: "Aurora" }, paginas: [{ texto: "segredo do porto" }] });
  t(term.system.escrito.terminal.cripto.ativo && !JSON.stringify(term).includes("segredo do porto"), "texto cifrado no item");
  t(F.naurenDecifrar(term.system.escrito.terminal.cripto, " AURORA ")?.length === 1 && F.naurenDecifrar(term.system.escrito.terminal.cripto, "x") === null, "senha certa abre, errada não");
  // cartaz ida e volta
  const c = ler({ nome: "C", formato: "cartaz", cartaz: { tipo: "missao", recompensa: "40 Florins", detalhes: [{ rot: "A", val: "b" }] } });
  t(JSON.stringify(ler(E.naurenEscritoParaJson(item(c))).system.escrito.cartaz) === JSON.stringify(c.system.escrito.cartaz), "cartaz ida e volta");
  // modelos do compêndio
  t(M.length === 27 && new Set(M.map(x => x.seedId)).size === 27, "27 modelos com id único");
  for (const { seedId, json } of M) {
    const d = E.naurenEscritoDoJson(json);
    t(JSON.stringify(d.system.escrito.terminal) === JSON.stringify(E.naurenEscritoDoJson(json).system.escrito.terminal), `${seedId}: terminal sempre igual (o compêndio não muda à toa)`);
    t(!E.naurenEscritoMiniHtml(item(d, seedId)).includes("undefined"), `${seedId} miniatura`);
    const h = await new E.NaurenLeitor({ item: item(d, seedId) })._renderHTML();
    t(h.length > 200 && !h.includes("undefined"), `${seedId} leitor`);
  }
}
