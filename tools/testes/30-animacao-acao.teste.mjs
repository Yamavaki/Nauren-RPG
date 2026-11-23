// Animação e som próprios de cada Ação (0.123).
export default async function (t) {
  const m = await import("../../modulos/animacao-acao.mjs");

  // Padrão e normalização (JSON de IA com campo faltando ou errado).
  const p = m.naurenAnimacaoAcaoPadrao();
  t(p.modo === "auto" && p.tipo === "projetil" && p.escala === 1 && p.noErro === true && p.somVolume === 0.8, "padrão: auto, projétil, 1×, toca no erro, volume 80%");
  let n = m.naurenAnimacaoAcaoNormalizar({ modo: "xyz", tipo: "abc", escala: 99, somVolume: 3, somAtraso: -5, anim: "  jb2a.fire_bolt.orange  " });
  t(n.modo === "auto" && n.tipo === "projetil", "modo e tipo inválidos voltam ao padrão");
  t(n.escala === 10 && n.somVolume === 1 && n.somAtraso === 0, "números fora da faixa são cortados");
  t(n.anim === "jb2a.fire_bolt.orange", "caminho sem espaços");
  t(m.naurenAnimacaoAcaoNormalizar(null).modo === "auto" && m.naurenAnimacaoAcaoNormalizar({ noErro: false }).noErro === false, "nulo vira padrão; noErro false é respeitado");

  // Arquivo x caminho do banco.
  t(m.naurenAnimacaoEhArquivo("modules/x/fogo.webm") && !m.naurenAnimacaoEhArquivo("jb2a.fire_bolt.orange"), "arquivo .webm x caminho do banco");

  // Categorias e filtro do seletor.
  const cat = m.naurenCategoriasDaAnimacao;
  t(cat("jb2a.fire_bolt.orange").includes("projetil") && cat("jb2a.fire_bolt.orange").includes("magia"), "fire_bolt: projétil e magia");
  t(cat("jb2a.melee_generic.creature_attack.claw.001.red").includes("corpo"), "claw: corpo a corpo");
  t(cat("jb2a.impact.001.orange").includes("impacto"), "impact: impacto");
  t(cat("jb2a.healing_generic.burst.greenorange").includes("cura"), "healing: cura");
  t(cat("jb2a.breath_weapons.fire.cone.orange.01").includes("area"), "cone de sopro: área");
  const lista = ["jb2a.fire_bolt.orange", "jb2a.fire_bolt.blue", "jb2a.impact.001.orange", "jb2a.melee_generic.creature_attack.claw.001.red", "jb2a.healing_generic.burst.greenorange"];
  const f = m.naurenFiltrarAnimacoes;
  t(f(lista, { busca: "fire bolt" }).length === 2, "busca com várias palavras (fire bolt): 2");
  t(f(lista, { busca: "orange" }).length === 3, "busca por cor (orange, inclui greenorange): 3");
  t(f(lista, { busca: "bolt blue" }).join() === "jb2a.fire_bolt.blue", "fire bolt azul");
  t(f(lista, { categoria: "corpo" }).length === 1 && f(lista, { categoria: "cura" }).length === 1, "filtro por categoria");
  t(f(lista, { busca: "001 orange", categoria: "impacto" }).join() === "jb2a.impact.001.orange", "busca + categoria juntas");
  t(f(lista, {}).length === lista.length, "sem filtro: todas");
  t(m.naurenNomeCurtoAnimacao("jb2a.fire_bolt.orange") === "fire bolt · orange" && m.naurenNomeCurtoAnimacao("modules/a/b/Fogo_Azul.webm") === "Fogo Azul", "nome curto do cartão");

  // Arquivo de prévia a partir da entrada do banco.
  const a = m.naurenArquivoDaEntrada;
  t(a("x.webm") === "x.webm" && a(["a.webm", "b.webm"]) === "a.webm", "texto e lista de variações");
  t(a({ file: { "05ft": "5.webm", "30ft": "30.webm", "60ft": "60.webm" } }) === "30.webm", "distâncias: pega a de 30 ft");
  t(a({ file: { "90ft": "90.webm" } }) === "90.webm" && a({ _x: 1, file: [{ file: "z.webm" }] }) === "z.webm" && a(null) === "", "outros formatos");

  // Resumo no cabeçalho do bloco.
  t(m.naurenResumoAnimacaoAcao({}) === "Automático (Automated Animations)" && m.naurenResumoAnimacaoAcao({ modo: "nenhuma" }) === "Sem animação", "resumo: auto e nenhuma");
  t(m.naurenResumoAnimacaoAcao({ modo: "propria", tipo: "projetil", anim: "jb2a.fire_bolt.orange", som: "s.ogg" }) === "Projétil: fire bolt · orange · som", "resumo: própria");

  // Tocar: Sequencer e som de mentira.
  const velhos = { game: globalThis.game, Sequence: globalThis.Sequence, Sequencer: globalThis.Sequencer, foundry: globalThis.foundry };
  const log = [], sons = [];
  class EfeitoFalso {
    constructor(s) { this.s = s; this.d = {}; }
    file(x) { this.d.file = x; return this; } atLocation(x) { this.d.de = x; return this; } stretchTo(x) { this.d.ate = x; return this; }
    missed() { this.d.errou = true; return this; } waitUntilFinished() { this.d.espera = true; return this; } scaleToObject(x) { this.d.escala = x; return this; }
    belowTokens(v = true) { this.d.porBaixo = v; return this; } size(x) { this.d.tam = x; return this; } volume() { return this; }
    effect() { return this.s.effect(); } sound() { return this.s.sound(); } play() { return this.s.play(); }
  }
  class SequenceFalsa { effect() { const e = new EfeitoFalso(this); log.push(e.d); return e; } sound() { const e = new EfeitoFalso(this); e.d.som = true; log.push(e.d); return e; } async play() { log.push("play"); } }
  try {
    globalThis.foundry = { ...velhos.foundry, audio: { AudioHelper: { play: (o, todos) => sons.push({ ...o, todos }) } } };
    globalThis.game = { modules: { get: id => ({ active: id === "sequencer" }) } };
    globalThis.Sequence = SequenceFalsa;
    globalThis.Sequencer = { Database: { entryExists: x => x.startsWith("jb2a."), publicFlattenedSimpleEntries: ["jb2a.b", "jb2a.a", "jb2a.a"] } };
    t(m.naurenListaAnimacoesSequencer().join() === "jb2a.a,jb2a.b", "lista do banco: sem repetidos e em ordem");
    const eu = { nome: "eu" }, A = { nome: "A" }, B = { nome: "B" };
    let vis = await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", tipo: "projetil", anim: "jb2a.fire_bolt.orange", impacto: "jb2a.impact.001.orange", som: "s.ogg", somImpacto: "hit.ogg" }, { alvos: [A, B], atingidos: [A] });
    const efs = log.filter(x => x !== "play");
    t(vis === true && sons.length === 1 && sons[0].src === "s.ogg" && sons[0].todos === true, "som principal para todos");
    t(efs[0].de === eu && efs[0].ate === A && !efs[0].errou, "projétil até A (acertou)");
    t(efs[1].ate === B && efs[1].errou === true && efs[1].espera === true, "projétil até B passa do lado (errou), e espera terminar");
    t(efs[2].file === "jb2a.impact.001.orange" && efs[2].de === A && efs.filter(e => e.file === "jb2a.impact.001.orange").length === 1, "impacto só no atingido");
    t(efs.some(e => e.som && e.file === "hit.ogg"), "som do acerto junto do impacto");
    log.length = 0; sons.length = 0;
    await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", tipo: "projetil", anim: "jb2a.fire_bolt.orange", noErro: false }, { alvos: [A, B], atingidos: [A] });
    t(log.filter(x => x !== "play").length === 1, "noErro desligado: só no atingido");
    log.length = 0;
    await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", tipo: "usuario", anim: "jb2a.a", escala: 2 }, {});
    t(log[0].de === eu && log[0].escala === 2, "em quem usa, no tamanho pedido");
    log.length = 0;
    await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", tipo: "area", anim: "jb2a.a", porBaixo: true }, { regiao: { shapes: [{ type: "circle", x: 100, y: 200, radius: 50 }] } });
    t(log[0].de?.x === 100 && log[0].de?.y === 200 && log[0].tam?.width === 100 && log[0].porBaixo === true, "área: centro e tamanho da Region");
    log.length = 0;
    vis = await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", tipo: "projetil", anim: "inventada.x", som: "s.ogg" }, { alvos: [A], atingidos: [A] });
    t(vis === false && !log.length, "animação que não existe: não toca (só o som)");
    // Sem Sequencer: o som toca do mesmo jeito.
    globalThis.game = { modules: { get: () => ({ active: false }) } };
    sons.length = 0;
    vis = await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", anim: "jb2a.fire_bolt.orange", som: "s.ogg" }, { alvos: [A], atingidos: [A] });
    t(vis === false && sons.length === 1 && sons[0].src === "s.ogg", "sem Sequencer: o som toca mesmo assim");
  } finally { Object.assign(globalThis, velhos); }

  // Schema, ficha e integração.
  const fs = await import("node:fs");
  const ler = r => fs.readFileSync(new URL(r, import.meta.url), "utf8");
  const sis = ler("../../nauren.mjs");
  t(/animacao: new SchemaField\(\{\s*modo: new StringField\(\{ initial: "auto" \}\)/.test(sis), "schema: animacao dentro da Ação, modo auto");
  for (const c of ["tipo", "anim", "impacto", "escala", "noErro", "porBaixo", "som", "somVolume", "somAtraso", "somImpacto"]) t(new RegExp(`\\n\\s+${c}: new `).test(sis.slice(sis.indexOf("animacao: new SchemaField"), sis.indexOf("animacao: new SchemaField") + 2000)), `schema: ${c}`);
  const anim = ler("../../modulos/animacoes.mjs");
  t(anim.indexOf('modoProprio === "propria"') < anim.indexOf("if (!naurenAnimacoesDisponiveis() || !game.settings.get(\"nauren\", \"animacoesAcoes\")) return semAnimacao();"), "modo própria funciona sem o Automated Animations");
  const tpl = ler("../../templates/item-sheet.html");
  t(tpl.includes('data-field="acoes.{{acaoIndex}}.animacao.anim"') && tpl.includes('data-naa-acao="procurar"') && tpl.includes("{{#if @root.naaSequencer}}"), "ficha: bloco Animação e som, Procurar e campos só com Sequencer");
  t(ler("../../modulos/ficha-item.mjs").includes('el.type === "range"'), "ficha: campos de faixa gravam número");
  t(ler("../../docs/criacao-ia/guia-criacao-ia.md").includes("### 16.4a Animação e som DENTRO da Ação"), "guia da IA: formato do campo animacao");
}
