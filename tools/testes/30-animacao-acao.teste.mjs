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
  t(m.naurenResumoAnimacaoAcao({ modo: "propria", tipo: "projetil", anim: "jb2a.fire_bolt.orange", som: "s.ogg" }) === "fire bolt · orange · som", "resumo: própria (1 camada)");
  t(m.naurenResumoAnimacaoAcao({ modo: "propria", camadas: [{ nome: "Brilho", anim: "jb2a.a" }, { nome: "Raio", anim: "jb2a.b" }] }) === "2 camadas: Brilho, Raio", "resumo: várias camadas");

  // Tocar (0.124: o bloco simples vira camadas): Sequencer e som de mentira.
  const { naurenSequencerFalso } = await import("./sequencer-falso.mjs");
  const velhos = { game: globalThis.game, Sequence: globalThis.Sequence, Sequencer: globalThis.Sequencer, foundry: globalThis.foundry };
  const log = [], sons = [];
  const efs = () => log.filter(x => x !== "play" && x.tipo === "efeito");
  try {
    globalThis.foundry = { ...velhos.foundry, audio: { AudioHelper: { play: (o, todos) => sons.push({ ...o, todos }) } } };
    globalThis.game = { modules: { get: id => ({ active: id === "sequencer" }) } };
    globalThis.Sequence = naurenSequencerFalso(log);
    globalThis.Sequencer = { Database: { entryExists: x => x.startsWith("jb2a."), publicFlattenedSimpleEntries: ["jb2a.b", "jb2a.a", "jb2a.a"] } };
    t(m.naurenListaAnimacoesSequencer().join() === "jb2a.a,jb2a.b", "lista do banco: sem repetidos e em ordem");
    const eu = { nome: "eu" }, A = { nome: "A" }, B = { nome: "B" };
    let vis = await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", tipo: "projetil", anim: "jb2a.fire_bolt.orange", impacto: "jb2a.impact.001.orange", som: "s.ogg", somImpacto: "hit.ogg" }, { alvos: [A, B], atingidos: [A] });
    let e = efs();
    t(vis === true && log.some(x => x.tipo === "som" && x.file === "s.ogg"), "som principal pela sequência (toca para todos)");
    t(e[0].atLocation === eu && e[0].stretchTo === A && !e[0].missed, "projétil até A (acertou)");
    t(e[1].stretchTo === B && e[1].missed === true && e[1].espera === true, "projétil até B passa do lado (errou), e o impacto espera terminar");
    t(e[2].file === "jb2a.impact.001.orange" && e[2].atLocation === A && e.filter(x => x.file === "jb2a.impact.001.orange").length === 1, "impacto só no atingido");
    t(log.some(x => x.tipo === "som" && x.file === "hit.ogg"), "som do acerto junto do impacto");
    log.length = 0;
    await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", tipo: "projetil", anim: "jb2a.fire_bolt.orange", noErro: false }, { alvos: [A, B], atingidos: [A] });
    t(efs().length === 1, "noErro desligado: só no atingido");
    log.length = 0;
    await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", tipo: "usuario", anim: "jb2a.a", escala: 2 }, {});
    t(efs()[0].atLocation === eu && efs()[0].scaleToObject === 2, "em quem usa, no tamanho pedido");
    log.length = 0;
    await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", tipo: "area", anim: "jb2a.a", porBaixo: true }, { regiao: { shapes: [{ type: "circle", x: 100, y: 200, radius: 50 }] } });
    e = efs();
    t(e[0].atLocation?.x === 100 && e[0].atLocation?.y === 200 && e[0].size?.width === 100 && e[0].belowTokens === true, "área: centro e tamanho da Region");
    log.length = 0;
    await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", tipo: "area", anim: "jb2a.a" }, { regiao: { shapes: [{ type: "line", x: 100, y: 200, length: 1200, width: 100, rotation: 0 }] } });
    e = efs();
    t(e[0].atLocation?.x === 100 && e[0].stretchTo?.x === 1300 && e[0].stretchTo?.y === 200 && !e[0].size, "linha: da origem até a ponta (stretchTo), sem esticar como quadrado");
    log.length = 0;
    await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", tipo: "area", anim: "jb2a.a" }, { regiao: { shapes: [{ type: "cone", x: 0, y: 0, radius: 600, angle: 53, rotation: 90 }] } });
    e = efs();
    t(Math.abs(e[0].stretchTo?.x) < 1e-6 && Math.abs(e[0].stretchTo?.y - 600) < 1e-6, "cone virado 90°: vai da origem até a ponta, para baixo");
    log.length = 0;
    vis = await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", tipo: "projetil", anim: "inventada.x", som: "s.ogg" }, { alvos: [A], atingidos: [A] });
    t(vis === false && !efs().length && log.some(x => x.tipo === "som"), "animação que não existe: não toca (só o som)");
    // Sem Sequencer: o som toca do mesmo jeito.
    globalThis.game = { modules: { get: () => ({ active: false }) } };
    sons.length = 0;
    vis = await m.naurenTocarAnimacaoDaAcao(eu, { modo: "propria", anim: "jb2a.fire_bolt.orange", som: "s.ogg" }, { alvos: [A], atingidos: [A] });
    t(vis === false && sons.length === 1 && sons[0].src === "s.ogg" && sons[0].todos === true, "sem Sequencer: o som toca mesmo assim, para todos");
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
  t(tpl.includes('data-field="acoes.{{acaoIndex}}.animacao.modo"') && tpl.includes('data-nce-contexto="acao" data-acao-index="{{acaoIndex}}" data-nce-campo="camadas"'), "ficha: bloco Animação e som com o editor de camadas");
  t(ler("../../modulos/ficha-item.mjs").includes('el.type === "range"'), "ficha: campos de faixa gravam número");
  t(ler("../../docs/criacao-ia/guia-criacao-ia.md").includes("### 16.4a Animação e som DENTRO da Ação"), "guia da IA: formato do campo animacao");

  // Ficha de testes (docs/exemplos/ficha-de-testes.json): formato válido e referências que existem.
  const lote = JSON.parse(ler("../../docs/exemplos/ficha-de-testes.json"));
  const fichaT = lote.documentos.find(d => d.name.startsWith("Ficha de Testes"));
  const acoesT = fichaT.items.flatMap(i => i.system.acoes ?? []);
  t(acoesT.length >= 25 && acoesT.every(ac => ac.animacao && m.naurenAnimacaoAcaoNormalizar(ac.animacao).modo === (ac.animacao.modo ?? "auto")), "ficha de testes: toda Ação tem bloco de animação válido");
  const tiposT = new Set(acoesT.map(ac => ac.animacao.modo === "propria" ? ac.animacao.tipo : ac.animacao.modo));
  t(["projetil", "corpo", "alvo", "usuario", "area", "auto", "nenhuma"].every(x => tiposT.has(x)), "ficha de testes: todos os tipos e modos aparecem");
  t(acoesT.filter(ac => ac.modoAlvo === "area").every(ac => !ac.ehAtaque), "ficha de testes: áreas sem teste de ataque (como a Bola de Fogo do livro)");
  const nomesT = new Set(fichaT.items.map(i => i.name.toLowerCase()));
  const sistemaT = ["sangramento", "queimando", "congelando", "amedrontado", "envenenamento", "caído"];
  const refs = JSON.stringify(fichaT).match(/self:[^"]+/g) ?? [];
  t(refs.length && refs.every(r => nomesT.has(r.slice(5).toLowerCase()) || sistemaT.includes(r.slice(5).toLowerCase())), "ficha de testes: todo self: aponta para um modelo da ficha ou Condição do sistema");
}
