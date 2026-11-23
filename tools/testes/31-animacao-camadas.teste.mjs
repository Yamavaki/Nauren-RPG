// Animações em camadas (0.124): camadas, opções do Automated Animations, cores, combos, persistentes e andares.
export default async function (t) {
  const m = await import("../../modulos/animacao-camadas.mjs");
  const fs = await import("node:fs");
  const ler = r => fs.readFileSync(new URL(r, import.meta.url), "utf8");

  // Normalização
  const n = m.naurenCamadaNormalizar({ onde: "xyz", quando: "talvez", escala: 99, opacidade: -1, repetir: 0, plano: "?", tingir: "azul", matiz: 500, anim: " jb2a.a " });
  t(n.onde === "usuario" && n.quando === "junto" && n.escala === 20 && n.opacidade === 0 && n.repetir === 1 && n.plano === "normal", "camada: valores inválidos voltam ao padrão / são cortados");
  t(n.tingir === "" && n.matiz === 180 && n.anim === "jb2a.a", "camada: tinta inválida some, matiz cortado, caminho sem espaços");
  t(m.naurenCamadaNormalizar({ onde: "alvo" }, "condicao").onde === "token", "contexto Condição: sempre no token");
  t(m.naurenCamadasValidas([{ anim: "" }, { anim: "jb2a.a", ativo: false }, { som: "x.ogg" }, { tremer: 5 }]).length === 2, "só camadas ligadas que fazem algo");

  // Bloco simples da 0.123 → camadas
  let cs = m.naurenCamadasDaAcao({ modo: "propria", tipo: "projetil", anim: "jb2a.fire_bolt.orange", impacto: "jb2a.impact.001.orange", som: "s.ogg", somImpacto: "h.ogg" });
  t(cs.length === 2 && cs[0].onde === "projetil" && cs[0].som === "s.ogg" && cs[1].onde === "atingido" && cs[1].quando === "depois" && cs[1].som === "h.ogg", "bloco simples: projétil + impacto depois, com os sons");
  t(m.naurenCamadasDaAcao({ tipo: "alvo", anim: "jb2a.a", noErro: false })[0].onde === "atingido", "bloco simples 'no alvo' sem tocar no erro = só atingidos");
  t(m.naurenCamadasDaAcao({ anim: "jb2a.a", camadas: [{ anim: "jb2a.b", onde: "usuario" }] })[0].anim === "jb2a.b", "com camadas, valem as camadas");
  t(m.naurenCamadasDaAcao({ tipo: "area", anim: "jb2a.a", impacto: "jb2a.b" }).length === 1, "área: sem camada de impacto");

  // Cores
  const lista = ["jb2a.fire_bolt.orange", "jb2a.fire_bolt.blue", "jb2a.fire_bolt.dark_purple", "jb2a.fire_bolt.orange.big", "jb2a.impact.001.orange", "jb2a.impact.001.blue", "jb2a.impact.002.orange",
    "jb2a.breath_weapons.fire.cone.orange.01", "jb2a.breath_weapons.fire.cone.blue.01", "jb2a.breath_weapons.fire.cone.orange.02"];
  let v = m.naurenVariacoesDeCor("jb2a.fire_bolt.orange", lista).map(x => x.cor);
  t(v.join() === "blue,dark_purple,orange", "cores do fire_bolt (mesmo tamanho de caminho, só muda a cor)");
  t(m.naurenVariacoesDeCor("jb2a.impact.001.orange", lista).length === 2, "cores do impact.001 (não mistura o 002)");
  t(m.naurenVariacoesDeCor("jb2a.breath_weapons.fire.cone.orange.01", lista).map(x => x.caminho).join() === "jb2a.breath_weapons.fire.cone.blue.01,jb2a.breath_weapons.fire.cone.orange.01", "cor no meio do caminho (cone .01)");
  t(m.naurenVariacoesDeCor("jb2a.sem_cor.x", lista).length === 0, "sem segmento de cor: nada");
  t(m.naurenCssDaCor("dark_red").includes("color-mix") && m.naurenCssDaCor("greenorange").includes("gradient") && m.naurenCssDaCor("blue") === "#3b7ff0", "bolinhas de cor");

  // Combos prontos: todos os caminhos existem no JB2A da mesa
  const jb2a = new Set(ler("../../docs/animacoes-ia/jb2a-caminhos.txt").split(/\r?\n/).map(x => x.trim()));
  const faltando = m.NAUREN_COMBOS_PRONTOS.flatMap(cb => cb.camadas.map(c => c.anim)).filter(a => a && !jb2a.has(a));
  t(m.NAUREN_COMBOS_PRONTOS.length >= 8 && !faltando.length, `combos prontos com caminhos conferidos${faltando.length ? ": faltam " + faltando.join(", ") : ""}`);
  t(m.naurenCombosParaContexto(m.NAUREN_COMBOS_PRONTOS, "emanacaoContinuo").every(c => c.contexto.startsWith("emanacao")), "combos de aura só nas auras (loop)");
  t(m.naurenCombosParaContexto(m.NAUREN_COMBOS_PRONTOS, "acao").every(c => c.contexto === "acao"), "combos de ação nas Ações");
  const adapt = m.naurenAdaptarCamadas([{ onde: "projetil", anim: "jb2a.a", repetir: 3, tremer: 10, quando: "depois" }], "emanacaoContinuo");
  t(adapt[0].onde !== "projetil" && adapt[0].repetir === 1 && adapt[0].tremer === 0 && adapt[0].quando === "junto", "adaptar para loop: onde válido, sem repetir/tremor/depois");

  // Tempos (sem Sequencer: só os sons, no tempo de cada camada)
  const tempos = m.naurenTemposDasCamadas([m.naurenCamadaNormalizar({ som: "a" }), m.naurenCamadaNormalizar({ som: "b", atraso: 200 }), m.naurenCamadaNormalizar({ som: "c", quando: "depois", duracao: 0 })], 1000);
  t(tempos.join() === "0,200,1200", "tempos aproximados: junto + atraso, depois = fim do grupo");

  // Montagem com o Sequencer de mentira
  const { naurenSequencerFalso } = await import("./sequencer-falso.mjs");
  const velhos = { game: globalThis.game, Sequence: globalThis.Sequence, Sequencer: globalThis.Sequencer };
  const log = [];
  try {
    globalThis.game = { modules: { get: id => ({ active: id === "sequencer" }) } };
    globalThis.Sequence = naurenSequencerFalso(log);
    globalThis.Sequencer = { Database: { entryExists: x => x.startsWith("jb2a.") } };
    const S = globalThis.Sequence;
    const eu = { id: "eu" }, A = { id: "A" }, B = { id: "B" };
    const cheia = m.naurenCamadaNormalizar({ onde: "alvo", anim: "jb2a.a", escala: 1.5, opacidade: 0.5, velocidade: 2, repetir: 3, repetirIntervalo: 100, duracao: 1500, fadeIn: 200, fadeOut: 300,
      rotacao: 45, espelhar: true, plano: "acimaLuz", matiz: 90, saturacao: -0.5, brilho: 1.4, tingir: "#ff0000", atraso: 250, deslocAleatorio: 0.5, som: "x.ogg", somAtraso: 100, tremer: 20, tremerDuracao: 600 });
    let k = m.naurenMontarCamadas(new S(), [cheia], { origem: eu, alvos: [A, B], atingidos: [A] });
    const e = log.filter(x => x.tipo === "efeito");
    t(k === 2 && e.length === 2 && e[0].atLocation === A && e[1].atLocation === B, "'em cada alvo': um efeito por alvo");
    const d = e[0];
    t(d.scaleToObject === 1.5 && d.opacity === 0.5 && d.playbackRate === 2 && d.repeats === 3 && d.repeatsOp === 100 && d.duration === 1500, "tamanho, opacidade, velocidade, repetir, duração");
    t(d.fadeIn === 200 && d.fadeOut === 300 && d.rotate === 45 && d.mirrorX === true && d.aboveLighting === true && d.delay === 250, "surgir, sumir, girar, espelhar, acima da luz, atraso");
    t(d.filter === "ColorMatrix" && d.filterOp?.hue === 90 && d.filterOp?.saturate === -0.5 && d.filterOp?.brightness === 1.4 && d.tint === "#ff0000", "cor: matiz, saturação, brilho, tingir");
    t(d.atLocationOp?.randomOffset === 0.5, "posição aleatória");
    const som = log.find(x => x.tipo === "som"), tremor = log.find(x => x.tipo === "tremor");
    t(som?.file === "x.ogg" && som.delay === 350, "som da camada com atraso (camada + som)");
    t(tremor?.shake?.strength === 20 && tremor.shake.duration === 600, "tremer a tela");
    log.length = 0;
    m.naurenMontarCamadas(new S(), [m.naurenCamadaNormalizar({ onde: "usuario", anim: "jb2a.a", rotacaoAleatoria: true, espelharAleatorio: true, plano: "porBaixo" })], { origem: eu });
    t(log[0].randomRotation === true && log[0].randomizeMirrorX === true && log[0].belowTokens === true && !log[0].rotate, "giro e espelho aleatórios, por baixo");
    log.length = 0;
    m.naurenMontarCamadas(new S(), [
      m.naurenCamadaNormalizar({ onde: "usuario", anim: "jb2a.a" }),
      m.naurenCamadaNormalizar({ onde: "projetil", anim: "jb2a.b", quando: "depois" }),
      m.naurenCamadaNormalizar({ onde: "retorno", anim: "jb2a.c", quando: "depois" })
    ], { origem: eu, alvos: [A, B], atingidos: [A] });
    const ef = log.filter(x => x.tipo === "efeito");
    t(ef[0].espera === true && ef[0].waitUntilFinished === 0, "'depois': a camada anterior espera terminar");
    t(ef[1].stretchTo === A && ef[2].stretchTo === B && ef[2].missed === true && ef[2].waitUntilFinished === -400, "projétil para os dois (erro passa do lado); depois de projétil espera um pouco menos");
    t(ef[3].atLocation === A && ef[3].stretchTo === eu && ef.length === 4, "retorno: do atingido até quem usa (dreno)");
    log.length = 0;
    m.naurenMontarCamadas(new S(), [m.naurenCamadaNormalizar({ onde: "aura", anim: "jb2a.a", escala: 1 }, "emanacaoContinuo")], { origem: eu, diametroAura: 5, persistir: true, nome: "nauren-eman-R1" });
    t(log[0].attachTo === eu && log[0].size?.width === 5 && log[0].sizeOp?.gridUnits === true && log[0].persist === true && log[0].name === "nauren-eman-R1", "aura persistente: presa ao token, do tamanho do raio, com nome");
    log.length = 0;
    m.naurenMontarCamadas(new S(), [m.naurenCamadaNormalizar({ onde: "area", anim: "jb2a.a" })], { regiao: { shapes: [{ type: "circle", x: 10, y: 20, radius: 5 }] }, elevacao: 6, nivelId: "N2" });
    t(log[0].elevation === 6 && log[0].elevationOp?.absolute === true && log[0].name === "nauren-fx [nv:N2]", "andares: efeito solto nasce no piso da área e leva o andar no nome");
    t(m.naurenAndarDoNomeEfeito("nauren-area-x [nv:N2]") === "N2" && m.naurenAndarDoNomeEfeito("outro") === null, "lê o andar do nome do efeito");
    log.length = 0;
    m.naurenMontarCamadas(new S(), [m.naurenCamadaNormalizar({ onde: "area", anim: "jb2a.a" })], { origem: eu });
    t(log[0].atLocation === eu, "área sem área: toca em quem usa");
    log.length = 0;
    m.naurenMontarCamadas(new S(), [m.naurenCamadaNormalizar({ onde: "alvo", anim: "inventada" , som: "s.ogg"})], { origem: eu, alvos: [A] });
    t(!log.some(x => x.tipo === "efeito") && log.some(x => x.tipo === "som"), "animação que não existe: pula o visual e mantém o som");
  } finally { Object.assign(globalThis, velhos); }

  // Editor (HTML puro)
  const ed = await import("../../modulos/editor-camadas.mjs");
  let h = ed.naurenEditorCamadasHtml([{ anim: "jb2a.fire_bolt.orange", onde: "projetil" }, { som: "x.ogg", quando: "depois" }], { contexto: "acao", idBase: "t1", sequencer: true, gm: true });
  t((h.match(/class="nce-camada /g) ?? []).length === 2 && h.includes('data-nce-acao="combos"') && h.includes('data-nce-acao="salvarCombo"') && h.includes('data-nce-acao="testar"'), "editor: 2 camadas, combos, salvar combo (Mestre) e testar");
  t(h.includes('data-c="onde"') && h.includes('data-c="quando"') && h.includes("fire bolt · orange"), "editor: onde, quando e resumo");
  h = ed.naurenEditorCamadasHtml([{ anim: "jb2a.a" }], { contexto: "condicaoContinuo", idBase: "t2", sequencer: false });
  t(!h.includes('data-c="onde"') && !h.includes('data-c="quando"') && h.includes("Sem o <b>Sequencer</b>"), "editor em loop: sem onde/quando; aviso sem Sequencer");
  t(ed.naurenEditorCamadasHtml([], { contexto: "acao" }).includes("Nenhuma camada"), "editor vazio");

  // Schema, ficha e ganchos
  const sis = ler("../../nauren.mjs");
  t(/function campoCamadaAnimacao\(\)/.test(sis) && /camadas: campoListaCamadas\(\),\s*\n\s*continuo: campoListaCamadas\(\),.*\n\s*pulso: campoListaCamadas\(\)/.test(sis), "schema: camadas, contínuo e pulso na animação da Ação");
  t(/animacaoCondicao: new SchemaField\(\{\s*entrada: campoListaCamadas\(\),\s*continuo: campoListaCamadas\(\),\s*saida: campoListaCamadas\(\)/.test(sis), "schema: animação da Condição");
  t((sis.match(/emanacaoAnimacao: new SchemaField/g) ?? []).length === 3, "schema: animação da Emanação (Habilidade, Magia, Efeito)");
  for (const campo of ["onde", "quando", "atraso", "escala", "opacidade", "velocidade", "repetir", "duracao", "fadeIn", "fadeOut", "rotacao", "espelhar", "deslocAleatorio", "plano", "matiz", "saturacao", "brilho", "tingir", "som", "tremer"])
    t(new RegExp(`\\n\\s+${campo}: new `).test(sis.slice(sis.indexOf("function campoCamadaAnimacao"), sis.indexOf("function campoListaCamadas"))), `camada: ${campo}`);
  const tpl = ler("../../templates/item-sheet.html");
  t(tpl.includes('data-nce-contexto="areaContinuo"') && tpl.includes('data-nce-contexto="areaPulso"'), "ficha: animação da área persistente");
  t(tpl.includes('data-aba="animacao"') && tpl.includes('system.animacaoCondicao.entrada') && tpl.includes('system.animacaoCondicao.saida'), "ficha: aba Animação da Condição");
  t((tpl.match(/system\.emanacaoAnimacao\.continuo/g) ?? []).length === 2, "ficha: animação da Emanação nos dois blocos");
  const ft = ler("../../modulos/ficha-ator.mjs"), ict = ler("../../modulos/icone-condicao-token.mjs"), and = ler("../../modulos/andares.mjs");
  t(ft.includes("animacaoContinua:") && ft.includes("animacaoPulso:"), "área persistente guarda as camadas na Região");
  t(ict.includes("naurenPulsoArea(") && ict.includes("naurenPulsoEmanacao("), "pulso da área e da Emanação ligados");
  t(and.includes("[nv:") || and.includes("\\[nv:"), "andares: esconde efeitos soltos de outro andar");
  t(sis.includes("__naurenIniciar_animacaoCamadas();"), "ganchos de Condição/aura/área iniciados");

  // Ficha de testes: toda camada usa caminho que existe e o formato é válido
  const lote = JSON.parse(ler("../../docs/exemplos/ficha-de-testes.json"));
  const todasCam = JSON.stringify(lote).match(/"anim":"[^"]*"/g)?.map(x => x.slice(8, -1)).filter(Boolean) ?? [];
  t(todasCam.length > 30 && todasCam.every(a => jb2a.has(a)), "ficha de testes: todas as animações existem no JB2A da mesa");
  const fichaT = lote.documentos[0];
  t(fichaT.items.some(i => i.system.animacaoCondicao?.continuo?.length) && fichaT.items.some(i => i.system.emanacaoAnimacao?.continuo?.length) && fichaT.items.some(i => (i.system.acoes ?? []).some(a => a.animacao?.pulso?.length)), "ficha de testes: Condição, aura e área animadas");
  t(fichaT.items.some(i => (i.system.acoes ?? []).some(a => (a.animacao?.camadas ?? []).length >= 4)), "ficha de testes: chefe com 4 camadas");

  // 0.124.1: espalhar pela área, som em cada repetição, fases (loop)
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const circ = { type: "circle", x: 500, y: 500, radius: 300 };
  let pp = m.naurenPontosNaForma(circ, 50, 1, rnd);
  t(pp.pontos.length === 50 && pp.pontos.every(p => Math.hypot(p.x - 500, p.y - 500) <= 300 + 1e-6) && pp.tam === 600, "espalhar: 50 pontos dentro do círculo");
  t(new Set(pp.pontos.map(p => Math.round(p.x / 30))).size > 5, "espalhar: pontos em lugares diferentes (não só no centro)");
  pp = m.naurenPontosNaForma(circ, 30, 0.5, rnd);
  t(pp.pontos.every(p => Math.hypot(p.x - 500, p.y - 500) <= 150 + 1e-6), "espalhar 50%: só na metade de dentro");
  const cone = { type: "cone", x: 0, y: 0, radius: 600, angle: 60, rotation: 0 };
  pp = m.naurenPontosNaForma(cone, 40, 1, rnd);
  t(pp.pontos.every(p => Math.hypot(p.x, p.y) <= 600 + 1e-6 && Math.abs(Math.atan2(p.y, p.x)) <= Math.PI / 6 + 1e-6), "espalhar no cone: dentro do ângulo e do raio");
  const linha = { type: "line", x: 0, y: 0, length: 1000, width: 100, rotation: 90 };
  pp = m.naurenPontosNaForma(linha, 40, 1, rnd);
  t(pp.pontos.every(p => p.y >= -1e-6 && p.y <= 1000 + 1e-6 && Math.abs(p.x) <= 50 + 1e-6), "espalhar na linha virada 90°: dentro da faixa");
  const fases = m.naurenVariacoesDeFase("jb2a.entangle.02.complete.02.green", ["jb2a.entangle.02.complete.02.green", "jb2a.entangle.02.loop.02.green", "jb2a.entangle.02.loop.03.dark_blue", "jb2a.entangle.green"]);
  t(fases.map(f => f.fase).join() === "complete,loop" && fases[1].caminho === "jb2a.entangle.02.loop.02.green", "fases: complete e loop da mesma animação");
  t(jb2a.has("jb2a.entangle.02.loop.02.green"), "espinhos em loop existem no JB2A da mesa");
  {
    const velhos2 = { game: globalThis.game, Sequence: globalThis.Sequence, Sequencer: globalThis.Sequencer };
    const log2 = [];
    try {
      globalThis.game = { modules: { get: id => ({ active: id === "sequencer" }) } };
      globalThis.Sequence = naurenSequencerFalso(log2);
      globalThis.Sequencer = { Database: { entryExists: x => x.startsWith("jb2a.") } };
      const met = m.naurenCamadaNormalizar({ onde: "area", anim: "jb2a.a", repetir: 5, repetirIntervalo: 300, deslocAleatorio: 1, escala: 0.4, atraso: 100, som: "boom.ogg" });
      m.naurenMontarCamadas(new globalThis.Sequence(), [met], { regiao: { shapes: [circ] }, aleatorio: rnd });
      const efs = log2.filter(x => x.tipo === "efeito"), sons = log2.filter(x => x.tipo === "som");
      t(efs.length === 5 && efs.every(e => !e.repeats && Math.hypot(e.atLocation.x - 500, e.atLocation.y - 500) <= 300 && e.size.width === 240), "meteoros: 5 efeitos separados, dentro da área, no tamanho pedido");
      t(efs.map(e => e.delay).join() === "100,400,700,1000,1300", "meteoros: um depois do outro no intervalo");
      t(sons.length === 5 && sons.map(x => x.delay).join() === "100,400,700,1000,1300", "som da explosão em cada meteoro");
      log2.length = 0;
      m.naurenMontarCamadas(new globalThis.Sequence(), [{ ...met, somRepetir: false }], { regiao: { shapes: [circ] }, aleatorio: rnd });
      t(log2.filter(x => x.tipo === "som").length === 1, "som uma vez só, se desmarcar");
    } finally { Object.assign(globalThis, velhos2); }
  }
  const ed2 = await import("../../modulos/editor-camadas.mjs");
  ed2.naurenEditorCamadasAbrir("t9", 0);
  const h9 = ed2.naurenEditorCamadasHtml([{ onde: "area", anim: "jb2a.a", repetir: 4, deslocAleatorio: 0.8 }], { contexto: "acao", idBase: "t9" });
  t(h9.includes("Espalhar pela área") && h9.includes('data-c="somRepetir"') && h9.includes("data-nce-fases"), "editor: espalhar pela área, som em cada repetição, versões");
  // Ficha de testes no padrão: toda magia começa com conjuração (com som) e a magia vem depois com outro som
  const magias = fichaT.items.filter(i => i.type === "magia");
  const padrao = magias.every(i => (i.system.acoes ?? []).every(a => { const c = a.animacao?.camadas ?? []; return c.length >= 2 && c[0].onde === "usuario" && c[0].som && c[1].quando === "depois" && c[1].som && c[1].som !== c[0].som; }));
  t(magias.length >= 12 && padrao, "ficha de testes: magias no padrão conjuração + magia com som próprio");
  const espinhos = magias.find(i => i.name === "Campo de Espinhos")?.system.acoes[0].animacao;
  t(espinhos?.continuo?.[0]?.anim === "jb2a.entangle.02.loop.02.green", "Campo de Espinhos: espinhos em loop");

  // Guia da IA: toda Ação animada, padrão das magias e orçamento de camadas, sem regra antiga contraditória
  const guia = ler("../../docs/criacao-ia/guia-criacao-ia.md");
  t(guia.includes("### 16.4c Regras de animação para toda ficha (OBRIGATÓRIO)") && guia.includes("Habilidade-assinatura de chefe") && guia.includes("Padrão das magias"), "guia: regras obrigatórias de animação");
  t(!guia.includes("Só preencha quando o usuário pedir animações") && !guia.includes("**Nunca** coloque configuração de animação dentro do JSON"), "guia: sem a regra antiga que proibia animação na ficha");
}
