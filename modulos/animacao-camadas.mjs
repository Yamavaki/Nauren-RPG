/* Nauren RPG — Animações em CAMADAS (0.124).
 *
 * Uma animação composta é uma lista de camadas. Cada camada é um efeito do Sequencer (JB2A e afins) com onde
 * toca, quando (junto da anterior ou depois que ela termina), atraso, tamanho, cor (variação do JB2A, matiz,
 * saturação, brilho, tingir), opacidade, velocidade, repetições, surgir/sumir, giro, espelho, posição aleatória,
 * plano (por baixo / normal / acima da luz), som próprio e tremor de tela.
 *
 * Onde é usada:
 *   Ações ............ system.acoes[N].animacao.camadas   (uma vez, ao usar)
 *   Área persistente . system.acoes[N].animacao.continuo  (loop enquanto a área existir) e .pulso (a cada efeito)
 *   Condições ........ system.animacaoCondicao.entrada / continuo (preso ao token) / saida
 *   Emanações ........ system.emanacaoAnimacao.continuo (aura presa ao token) / pulso (a cada efeito)
 *
 * Andares (V14): efeitos presos a um token já são escondidos em outro andar (andares.mjs, pela fonte). Efeitos
 * soltos no mapa (áreas) nascem na altura do piso da área e levam o andar no nome ("[nv:ID]"); andares.mjs
 * esconde quem não é do andar visto.
 *
 * O começo do arquivo é puro (testado em Node); o resto usa o Foundry/Sequencer.
 */

export const NAUREN_ONDE_CAMADA = Object.freeze({
  usuario: { rotulo: "Em quem usa", icone: "fa-user" },
  alvo: { rotulo: "Em cada alvo", icone: "fa-crosshairs" },
  atingido: { rotulo: "Só nos atingidos", icone: "fa-burst" },
  projetil: { rotulo: "De quem usa até o alvo", icone: "fa-location-arrow" },
  retorno: { rotulo: "Do alvo até quem usa", icone: "fa-arrow-rotate-left" },
  area: { rotulo: "Na área", icone: "fa-circle-dot" },
  token: { rotulo: "No token", icone: "fa-user" },
  aura: { rotulo: "Aura (tamanho do raio)", icone: "fa-circle-notch" }
});

/** Opções de "onde" em cada lugar que usa camadas. */
export const NAUREN_CONTEXTOS_CAMADA = Object.freeze({
  acao: ["usuario", "alvo", "atingido", "projetil", "retorno", "area"],
  areaContinuo: ["area"],
  areaPulso: ["area", "alvo"],
  condicao: ["token"],
  condicaoContinuo: ["token"],
  emanacaoContinuo: ["aura", "token"],
  emanacaoPulso: ["aura", "token", "alvo", "projetil"]
});
/** Contextos em loop (persistentes): sem "quando/depois", repetir e tremor. */
export const NAUREN_CONTEXTOS_LOOP = Object.freeze(["areaContinuo", "condicaoContinuo", "emanacaoContinuo"]);

export const NAUREN_PLANOS_CAMADA = Object.freeze({ porBaixo: "Por baixo dos tokens", normal: "Normal", acimaLuz: "Acima da luz" });

export function naurenCamadaPadrao(onde = "alvo") {
  return {
    nome: "", ativo: true, onde, quando: "junto", atraso: 0, anim: "",
    escala: 1, opacidade: 1, velocidade: 1, repetir: 1, repetirIntervalo: 250, duracao: 0, fadeIn: 0, fadeOut: 0,
    rotacao: 0, rotacaoAleatoria: false, espelhar: false, espelharAleatorio: false, deslocAleatorio: 0,
    plano: "normal", noErro: true, matiz: 0, saturacao: 0, brilho: 1, tingir: "",
    som: "", somVolume: 0.8, somAtraso: 0, somRepetir: true, tremer: 0, tremerDuracao: 400
  };
}

const num = (v, min, max, pad) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : pad; };
const inteiro = (v, min, max, pad) => Math.round(num(v, min, max, pad));
const txt = v => (typeof v === "string" ? v.trim() : "");

/** Camada completa e segura (JSON de IA, dados velhos). onde inválido para o contexto vira o primeiro do contexto. */
export function naurenCamadaNormalizar(c, contexto = "acao") {
  const p = naurenCamadaPadrao();
  c = c && typeof c === "object" ? c : {};
  const ondes = NAUREN_CONTEXTOS_CAMADA[contexto] ?? NAUREN_CONTEXTOS_CAMADA.acao;
  return {
    nome: txt(c.nome), ativo: c.ativo === undefined ? true : !!c.ativo,
    onde: ondes.includes(c.onde) ? c.onde : ondes[0],
    quando: c.quando === "depois" ? "depois" : "junto",
    atraso: inteiro(c.atraso, 0, 60000, 0),
    anim: txt(c.anim),
    escala: num(c.escala, 0.05, 20, p.escala), opacidade: num(c.opacidade, 0, 1, 1), velocidade: num(c.velocidade, 0.1, 5, 1),
    repetir: inteiro(c.repetir, 1, 20, 1), repetirIntervalo: inteiro(c.repetirIntervalo, 0, 10000, 250),
    duracao: inteiro(c.duracao, 0, 60000, 0), fadeIn: inteiro(c.fadeIn, 0, 10000, 0), fadeOut: inteiro(c.fadeOut, 0, 10000, 0),
    rotacao: num(c.rotacao, -360, 360, 0), rotacaoAleatoria: !!c.rotacaoAleatoria,
    espelhar: !!c.espelhar, espelharAleatorio: !!c.espelharAleatorio, deslocAleatorio: num(c.deslocAleatorio, 0, 3, 0),
    plano: Object.hasOwn(NAUREN_PLANOS_CAMADA, c.plano) ? c.plano : "normal",
    noErro: c.noErro === undefined ? true : !!c.noErro,
    matiz: num(c.matiz, -180, 180, 0), saturacao: num(c.saturacao, -1, 1, 0), brilho: num(c.brilho, 0, 3, 1),
    tingir: /^#[0-9a-f]{6}$/i.test(txt(c.tingir)) ? txt(c.tingir) : "",
    som: txt(c.som), somVolume: num(c.somVolume, 0, 1, 0.8), somAtraso: inteiro(c.somAtraso, 0, 60000, 0),
    somRepetir: c.somRepetir === undefined ? true : !!c.somRepetir,
    tremer: num(c.tremer, 0, 100, 0), tremerDuracao: inteiro(c.tremerDuracao, 50, 5000, 400)
  };
}

/** Lista de camadas normalizada (só as ligadas e que fazem alguma coisa). */
export function naurenCamadasValidas(lista, contexto = "acao") {
  return (Array.isArray(lista) ? lista : []).map(c => naurenCamadaNormalizar(c, contexto)).filter(c => c.ativo && (c.anim || c.som || c.tremer > 0));
}

/**
 * Camadas de uma Ação. Com camadas, valem elas. Sem camadas, converte o bloco simples da 0.123
 * (anim + impacto + som) em camadas equivalentes, para fichas antigas e JSON no formato antigo.
 */
export function naurenCamadasDaAcao(cfg) {
  const c = cfg && typeof cfg === "object" ? cfg : {};
  if (Array.isArray(c.camadas) && c.camadas.length) return naurenCamadasValidas(c.camadas, "acao");
  return naurenCamadasDoBlocoSimples(c);
}
export function naurenCamadasDoBlocoSimples(c) {
  const anim = txt(c.anim), impacto = txt(c.impacto), som = txt(c.som), somImpacto = txt(c.somImpacto);
  const escala = num(c.escala, 0.05, 20, 1), noErro = c.noErro === undefined ? true : !!c.noErro, plano = c.porBaixo ? "porBaixo" : "normal";
  const vol = num(c.somVolume, 0, 1, 0.8);
  const tipo = ["projetil", "corpo", "alvo", "usuario", "area"].includes(c.tipo) ? c.tipo : "projetil";
  const onde = { projetil: "projetil", corpo: "projetil", alvo: noErro ? "alvo" : "atingido", usuario: "usuario", area: "area" }[tipo];
  const out = [];
  if (anim || som) out.push(naurenCamadaNormalizar({ nome: "Principal", onde: anim ? onde : "usuario", anim, escala, noErro, plano, som, somVolume: vol, somAtraso: c.somAtraso }));
  const temAlvos = tipo !== "usuario" && tipo !== "area";
  if ((impacto && temAlvos) || somImpacto) out.push(naurenCamadaNormalizar({ nome: "Impacto", onde: "atingido", quando: anim ? "depois" : "junto", anim: temAlvos ? impacto : "", escala, plano, som: somImpacto, somVolume: vol }));
  return out;
}

/* ---- Cores do JB2A: as variações de uma mesma animação ---- */
const RE_COR = /^(dark_|light_)?(red|orange|yellow|green|blue|purple|pink|white|black|grey|gray|teal|cyan|brown|gold|silver|rainbow|magenta|lime|maroon|blood|fire|ice|bluepurple|bluegreen|blueyellow|blueorange|bluewhite|bluepink|bluegrey|bluegrey02|blueteal|darkblue|darkgreen|darkred|darkpurple|greenorange|greenyellow|greenblue|greenred|orangered|orangeyellow|orangepink|orangepurple|pinkpurple|pinkyellow|purplepink|purplered|purpleblue|purplegreen|redyellow|redgreen|redblue|redpurple|tealyellow|tealgreen|whiteblue|whitepurple|yellowblue|yellowwhite|yellowgreen|multicolored|blue02|green02|red02|black02|white02|purple02|orange02)$/i;
export function naurenEhSegmentoCor(seg) { return RE_COR.test(String(seg ?? "")); }

/**
 * Variações de cor de um caminho: as entradas que só mudam no segmento da cor.
 * "jb2a.fire_bolt.orange" → [{caminho:"jb2a.fire_bolt.blue", cor:"blue"}, …] (inclui o próprio).
 */
export function naurenVariacoesDeCor(caminho, lista) {
  const partes = String(caminho ?? "").split(".");
  if (partes.length < 2) return [];
  let idx = -1;
  for (let i = partes.length - 1; i > 0; i--) if (naurenEhSegmentoCor(partes[i])) { idx = i; break; }
  if (idx < 0) return [];
  const out = [];
  for (const e of lista ?? []) {
    const q = String(e).split(".");
    if (q.length !== partes.length) continue;
    let igual = true;
    for (let i = 0; i < q.length; i++) if (i !== idx && q[i] !== partes[i]) { igual = false; break; }
    if (igual && naurenEhSegmentoCor(q[idx])) out.push({ caminho: e, cor: q[idx] });
  }
  return out.sort((a, b) => a.cor.localeCompare(b.cor));
}
/** Cor aproximada (CSS) de um nome de cor do JB2A, para a bolinha do seletor. */
export function naurenCssDaCor(cor) {
  const c = String(cor ?? "").toLowerCase().replace(/0\d$/, "");
  const base = { red: "#d33", orange: "#f08a24", yellow: "#f2d43d", green: "#3fbf4f", blue: "#3b7ff0", purple: "#9447e0", pink: "#ef6fb5", white: "#f2f2f2",
    black: "#222", grey: "#8a8a8a", gray: "#8a8a8a", teal: "#2bb3a7", cyan: "#3fd7e8", brown: "#8a5a2b", gold: "#d9a82a", silver: "#c0c6cc", magenta: "#e03fd2",
    lime: "#9be23c", maroon: "#7a1f2a", blood: "#8b0f14", fire: "#f06a1c", ice: "#9fe3ff", rainbow: "linear-gradient(90deg,#e33,#f2d43d,#3fbf4f,#3b7ff0,#9447e0)" };
  const m = c.match(/^(dark_|light_)?(.+)$/); const tom = m?.[1] ?? "", nome = m?.[2] ?? c;
  if (base[nome]) return tom === "dark_" ? `color-mix(in srgb, ${base[nome]} 60%, #000)` : tom === "light_" ? `color-mix(in srgb, ${base[nome]} 60%, #fff)` : base[nome];
  const partes = Object.keys(base).filter(k => k.length > 2 && nome.includes(k));
  if (partes.length >= 2) return `linear-gradient(135deg, ${base[partes[0]]} 50%, ${base[partes[1]]} 50%)`;
  return partes.length ? base[partes[0]] : "#777";
}

/* ---- Combos prontos (caminhos conferidos na lista do JB2A da mesa) ---- */
const C = (o) => ({ ...naurenCamadaPadrao(o.onde), ...o });
export const NAUREN_COMBOS_PRONTOS = Object.freeze([
  { id: "pronto-meteoro", nome: "Meteoro (chefe)", contexto: "acao", descricao: "Círculo de conjuração em quem usa, bola de fogo até a área, explosão, rachaduras e tela tremendo.",
    camadas: [
      C({ nome: "Conjuração", onde: "usuario", anim: "jb2a.magic_signs.circle.02.evocation.complete.red", escala: 2, plano: "porBaixo" }),
      C({ nome: "Meteoro", onde: "projetil", quando: "depois", anim: "jb2a.fireball.beam.orange" }),
      C({ nome: "Explosão", onde: "area", quando: "depois", anim: "jb2a.fireball.explosion.orange", escala: 1.1, tremer: 18, tremerDuracao: 600 }),
      C({ nome: "Rachaduras", onde: "area", quando: "junto", anim: "jb2a.ground_cracks.01.orange", plano: "porBaixo", fadeOut: 800 })
    ] },
  { id: "pronto-raio-divino", nome: "Raio divino", contexto: "acao", descricao: "Brilho no usuário e um raio caindo em cada alvo atingido.",
    camadas: [
      C({ nome: "Bênção", onde: "usuario", anim: "jb2a.divine_smite.caster.blueyellow", escala: 1.4 }),
      C({ nome: "Raio", onde: "atingido", quando: "depois", anim: "jb2a.lightning_strike.blue", escala: 1.5, tremer: 8 }),
      C({ nome: "Faíscas", onde: "atingido", quando: "junto", anim: "jb2a.static_electricity.01.blue", atraso: 300 })
    ] },
  { id: "pronto-maldicao", nome: "Maldição sombria", contexto: "acao", descricao: "Círculo necromântico, rajada sombria e marca de maldição no alvo.",
    camadas: [
      C({ nome: "Círculo", onde: "usuario", anim: "jb2a.magic_signs.circle.02.necromancy.complete.dark_purple", escala: 1.8, plano: "porBaixo" }),
      C({ nome: "Rajada", onde: "projetil", quando: "depois", anim: "jb2a.eldritch_blast.dark_purple" }),
      C({ nome: "Marca", onde: "atingido", quando: "depois", anim: "jb2a.condition.curse.01.004.purple", escala: 1.2 })
    ] },
  { id: "pronto-cura-divina", nome: "Cura divina", contexto: "acao", descricao: "Círculo dourado e cura em cada alvo.",
    camadas: [
      C({ nome: "Círculo", onde: "usuario", anim: "jb2a.magic_signs.circle.02.conjuration.complete.yellow", escala: 1.6, plano: "porBaixo" }),
      C({ nome: "Cura", onde: "alvo", quando: "depois", anim: "jb2a.healing_generic.loop.greenorange", duracao: 2500, fadeOut: 600 })
    ] },
  { id: "pronto-pisao", nome: "Pisão do gigante", contexto: "acao", descricao: "Impacto no chão com rachaduras, poeira e tela tremendo.",
    camadas: [
      C({ nome: "Impacto", onde: "usuario", anim: "jb2a.impact.004.orange", escala: 2.5, tremer: 25, tremerDuracao: 700 }),
      C({ nome: "Rachaduras", onde: "usuario", anim: "jb2a.ground_cracks.01.orange", escala: 3, plano: "porBaixo", fadeOut: 1000 }),
      C({ nome: "Poeira", onde: "alvo", anim: "jb2a.smoke.puff.centered.dark_black", atraso: 250, opacidade: 0.7 })
    ] },
  { id: "pronto-queimando", nome: "Em chamas (Condição)", contexto: "condicao", descricao: "Explosão ao receber e chamas presas ao token enquanto durar.",
    camadas: [C({ nome: "Chamas", onde: "token", anim: "jb2a.flames.01.orange", escala: 0.9, opacidade: 0.85 })] },
  { id: "pronto-escudo", nome: "Escudo mágico (aura)", contexto: "emanacaoContinuo", descricao: "Escudo azul girando em volta do token.",
    camadas: [C({ nome: "Escudo", onde: "token", anim: "jb2a.shield.01.loop.blue", escala: 1.5, opacidade: 0.8 })] },
  { id: "pronto-aura-fogo", nome: "Anel de fogo (aura)", contexto: "emanacaoContinuo", descricao: "Anel de fogo do tamanho do raio da Emanação.",
    camadas: [C({ nome: "Anel", onde: "aura", anim: "jb2a.fire_ring.500px.red", opacidade: 0.75, plano: "porBaixo" })] },
  { id: "pronto-guardioes", nome: "Espíritos guardiões (aura)", contexto: "emanacaoContinuo", descricao: "Espíritos girando no raio da Emanação.",
    camadas: [C({ nome: "Espíritos", onde: "aura", anim: "jb2a.spirit_guardians.blue.spirits", opacidade: 0.8 })] },
  { id: "pronto-campo-energia", nome: "Campo de energia (área)", contexto: "areaContinuo", descricao: "Campo de energia no tamanho da área enquanto ela durar.",
    camadas: [C({ nome: "Campo", onde: "area", anim: "jb2a.energy_field.02.above.blue", opacidade: 0.6 })] }
]);

/** Combos que servem num contexto (os de ação servem em pulsos também). */
export function naurenCombosParaContexto(lista, contexto) {
  const grupo = c => c.startsWith("emanacao") ? "aura" : c.startsWith("area") ? "area" : c.startsWith("condicao") ? "condicao" : "acao";
  const meu = grupo(contexto);
  return (lista ?? []).filter(cb => grupo(cb.contexto ?? "acao") === meu || (meu !== "acao" && grupo(cb.contexto ?? "acao") === "acao" && !NAUREN_CONTEXTOS_LOOP.includes(contexto)));
}

/** Adapta camadas para outro contexto (o "onde" que não existe lá vira o mais próximo). */
export function naurenAdaptarCamadas(camadas, contexto) {
  const ondes = NAUREN_CONTEXTOS_CAMADA[contexto] ?? NAUREN_CONTEXTOS_CAMADA.acao;
  const perto = { usuario: ["token", "aura"], token: ["usuario", "alvo"], aura: ["area", "token"], area: ["aura", "alvo"], alvo: ["token", "area"], atingido: ["alvo", "token"], projetil: ["alvo", "token"], retorno: ["alvo", "token"] };
  return (camadas ?? []).map(c => {
    let onde = c.onde;
    if (!ondes.includes(onde)) onde = (perto[onde] ?? []).find(o => ondes.includes(o)) ?? ondes[0];
    const n = naurenCamadaNormalizar({ ...c, onde }, contexto);
    if (NAUREN_CONTEXTOS_LOOP.includes(contexto)) { n.quando = "junto"; n.repetir = 1; n.tremer = 0; }
    return n;
  });
}

/** Geometria da área (V14): linha e cone da origem até a ponta; círculo e retângulo no centro. */
export function naurenGeometriaDaForma(f) {
  if (!f) return null;
  const rad = (Number(f.rotation) || 0) * Math.PI / 180;
  const ponta = len => ({ x: f.x + Math.cos(rad) * len, y: f.y + Math.sin(rad) * len });
  if ((f.type === "line" || f.type === "ray") && Number(f.length) > 0) return { forma: "linha", de: { x: f.x, y: f.y }, ate: ponta(Number(f.length)) };
  if (f.type === "cone" && Number(f.radius) > 0) return { forma: "linha", de: { x: f.x, y: f.y }, ate: ponta(Number(f.radius)) };
  if (f.radius !== undefined && Number(f.radius) > 0) return { forma: "centro", x: f.x, y: f.y, tam: f.radius * 2 };
  if (f.type === "rectangle" && f.width !== undefined) return { forma: "centro", x: f.x + f.width / 2, y: f.y + f.height / 2, tam: Math.max(f.width, f.height) };
  return null;
}

/**
 * Pontos aleatórios DENTRO da forma da área (para espalhar uma camada: chuva de meteoros, espinhos...).
 * fator 0..1: quanto da área usar (1 = até a borda). Devolve [{x, y}] e o tamanho sugerido de cada efeito (px).
 */
export function naurenPontosNaForma(f, n, fator = 1, rnd = Math.random) {
  const pts = [];
  if (!f || !(n > 0)) return { pontos: pts, tam: 0 };
  fator = Math.min(1, Math.max(0, Number(fator) || 0));
  const rot = (Number(f.rotation) || 0) * Math.PI / 180;
  const girar = (dx, dy) => ({ x: f.x + dx * Math.cos(rot) - dy * Math.sin(rot), y: f.y + dx * Math.sin(rot) + dy * Math.cos(rot) });
  let tam = 0;
  for (let i = 0; i < n; i++) {
    const u = rnd(), v = rnd();
    if (f.type === "cone" && f.radius > 0) {
      const meio = (Number(f.angle) || 53) * Math.PI / 360;
      const t = 0.2 + 0.8 * Math.sqrt(u) * (0.25 + 0.75 * fator), a = (v * 2 - 1) * meio * fator;
      pts.push({ x: f.x + Math.cos(rot + a) * f.radius * t, y: f.y + Math.sin(rot + a) * f.radius * t });
      tam = f.radius * 0.45;
    } else if ((f.type === "line" || f.type === "ray") && f.length > 0) {
      const larg = Number(f.width) || f.length * 0.1;
      pts.push(girar(f.length * (0.5 + (u - 0.5) * fator), (v - 0.5) * larg * fator));
      tam = Math.max(larg * 1.5, f.length * 0.15);
    } else if (f.radius > 0) {
      const r = f.radius * fator * Math.sqrt(u), a = v * Math.PI * 2;
      pts.push({ x: f.x + Math.cos(a) * r, y: f.y + Math.sin(a) * r });
      tam = f.radius * 2;
    } else if (f.type === "rectangle" && f.width > 0) {
      pts.push({ x: f.x + f.width * (0.5 + (u - 0.5) * fator), y: f.y + f.height * (0.5 + (v - 0.5) * fator) });
      tam = Math.max(f.width, f.height);
    }
  }
  return { pontos: pts, tam };
}

/* ---- Fases do JB2A (intro / loop / complete...): a mesma animação em outra fase ---- */
const RE_FASE = /^(loop|complete|intro|outro|pulse|burst|start|end|idle|top|bottom|above|below)$/i;
export function naurenVariacoesDeFase(caminho, lista) {
  const partes = String(caminho ?? "").split(".");
  const idx = partes.findIndex((p, i) => i > 0 && RE_FASE.test(p));
  if (idx < 0) return [];
  const out = [];
  for (const e of lista ?? []) {
    const q = String(e).split(".");
    if (q.length !== partes.length || !RE_FASE.test(q[idx])) continue;
    if (q.every((x, i) => i === idx || x === partes[i])) out.push({ caminho: e, fase: q[idx] });
  }
  return out.sort((a, b) => a.fase.localeCompare(b.fase));
}

/** Nome de efeito com o andar marcado (andares.mjs lê "[nv:ID]"). */
export function naurenNomeComAndar(base, nivelId) { return nivelId ? `${base} [nv:${nivelId}]` : base; }
export function naurenAndarDoNomeEfeito(nome) { return String(nome ?? "").match(/\[nv:([^\]]+)\]/)?.[1] ?? null; }

/** Tempo aproximado (ms) até cada camada começar, para tocar só o som quando o Sequencer não está ativo. */
export function naurenTemposDasCamadas(camadas, duracaoPadrao = 900) {
  let inicioGrupo = 0, fimGrupo = 0;
  return camadas.map((c, i) => {
    if (i > 0 && c.quando === "depois") inicioGrupo = fimGrupo;
    const comeco = inicioGrupo + c.atraso;
    const dur = c.duracao || duracaoPadrao;
    fimGrupo = Math.max(fimGrupo, comeco + dur * Math.max(1, c.repetir));
    return comeco;
  });
}

/* =========================== daqui para baixo: Foundry/Sequencer =========================== */

export function naurenSequencerOk() {
  return !!(globalThis.game?.modules?.get?.("sequencer")?.active && globalThis.Sequence && globalThis.Sequencer?.Database);
}
function existe(anim) {
  if (!anim) return false;
  if (/\.(webm|webp|png|gif|apng|mp4|json)(\?|$)/i.test(anim) || anim.includes("/")) return true;
  try { return !!globalThis.Sequencer.Database.entryExists(anim); } catch (err) { return false; }
}
function tocarSomSolto(src, volume, atraso = 0) {
  if (!src) return;
  const play = () => { try { foundry.audio.AudioHelper.play({ src, volume, autoplay: true, loop: false }, true); } catch (err) { console.warn("Nauren RPG | som da animação", err); } };
  if (atraso > 0) setTimeout(play, atraso); else play();
}
async function andaresApi() { try { return await import("./andares.mjs"); } catch (err) { return null; } }
function obj(t) { return t?.object ?? t; }

/** Aplica os ajustes visuais da camada num efeito do Sequencer (tudo que não depende de onde ele está). */
function ajustes(ef, c) {
  if (c.opacidade !== 1) ef.opacity(c.opacidade);
  if (c.velocidade !== 1) ef.playbackRate(c.velocidade);
  if (c.repetir > 1) ef.repeats(c.repetir, c.repetirIntervalo);
  if (c.duracao > 0) ef.duration(c.duracao);
  if (c.fadeIn > 0) ef.fadeIn(c.fadeIn);
  if (c.fadeOut > 0) ef.fadeOut(c.fadeOut);
  if (c.rotacaoAleatoria && typeof ef.randomRotation === "function") ef.randomRotation();
  else if (c.rotacao) ef.rotate(c.rotacao);
  if (c.espelharAleatorio && typeof ef.randomizeMirrorX === "function") ef.randomizeMirrorX();
  else if (c.espelhar) ef.mirrorX(true);
  if (c.plano === "porBaixo") ef.belowTokens(true);
  else if (c.plano === "acimaLuz" && typeof ef.aboveLighting === "function") ef.aboveLighting();
  if (c.matiz || c.saturacao || c.brilho !== 1) ef.filter("ColorMatrix", { hue: c.matiz, saturate: c.saturacao, brightness: c.brilho });
  if (c.tingir) ef.tint(c.tingir);
  if (c.atraso > 0) ef.delay(c.atraso);
  return ef;
}

/**
 * Monta as camadas numa Sequence (pode ser uma de mentira, nos testes). Devolve quantos efeitos visuais entraram.
 * ctx: { origem, alvos[], atingidos[], regiao, persistir, nome, elevacao, nivelId, diametroAura (casas) }
 */
export function naurenMontarCamadas(s, camadas, ctx = {}) {
  const origem = obj(ctx.origem), alvos = (ctx.alvos ?? []).map(obj).filter(Boolean), atingidos = (ctx.atingidos ?? []).map(obj).filter(Boolean);
  const acertou = t => atingidos.includes(t);
  const geo = ctx.regiao && !ctx.regiao.deleted ? naurenGeometriaDaForma(ctx.regiao.shapes?.[0]) : null;
  const persistir = !!ctx.persistir;
  let ultimo = null, ultimoOnde = null, visuais = 0;
  const finalizar = (ef, ponto = false) => {
    if (persistir) ef.persist(true);
    const nome = ctx.nome ?? (ponto ? naurenNomeComAndar("nauren-fx", ctx.nivelId) : null);
    if (nome) ef.name(nome);
    if (ponto && ctx.elevacao !== null && ctx.elevacao !== undefined && typeof ef.elevation === "function") { try { ef.elevation(ctx.elevacao, { absolute: true }); } catch (err) { /* Sequencer antigo */ } }
    visuais++;
    return ef;
  };
  for (const c of camadas) {
    const anim = c.anim && existe(c.anim) ? c.anim : "";
    if (c.anim && !anim) console.warn(`Nauren RPG | animação "${c.anim}" não existe nos módulos ativos (camada "${c.nome || c.onde}").`);
    if (c.quando === "depois" && ultimo) ultimo.waitUntilFinished(ultimoOnde === "projetil" || ultimoOnde === "retorno" ? -400 : 0);
    const criados = [];
    if (anim) {
      const off = c.deslocAleatorio > 0 ? { randomOffset: c.deslocAleatorio } : {};
      const noToken = t => {
        let ef = s.effect().file(anim);
        if (persistir) ef.attachTo(t, { bindVisibility: true, bindAlpha: false }); else ef.atLocation(t, off);
        return ef;
      };
      switch (c.onde) {
        case "usuario": case "token":
          if (origem) criados.push(finalizar(ajustes(noToken(origem).scaleToObject(c.escala), c)));
          break;
        case "aura":
          if (origem) {
            const d = Number(ctx.diametroAura) > 0 ? Number(ctx.diametroAura) : 3;
            criados.push(finalizar(ajustes(noToken(origem).size({ width: d * c.escala, height: d * c.escala }, { gridUnits: true }), c)));
          }
          break;
        case "alvo": case "atingido":
          for (const t of (c.onde === "alvo" ? alvos : atingidos))
            criados.push(finalizar(ajustes(noToken(t).scaleToObject(c.escala), c)));
          break;
        case "projetil":
          if (origem) for (const t of alvos.filter(t => acertou(t) || c.noErro)) {
            const ef = s.effect().file(anim).atLocation(origem).stretchTo(t, off);
            if (!acertou(t) && atingidos.length + alvos.length > 0 && ctx.temTeste !== false) ef.missed(true);
            criados.push(finalizar(ajustes(ef, c)));
          }
          break;
        case "retorno":
          if (origem) for (const t of alvos.filter(acertou)) criados.push(finalizar(ajustes(s.effect().file(anim).atLocation(t).stretchTo(origem), c)));
          break;
        case "area": {
          const forma = ctx.regiao && !ctx.regiao.deleted ? ctx.regiao.shapes?.[0] : null;
          if (forma && c.deslocAleatorio > 0) {
            // espalhar: cada repetição cai num ponto diferente DENTRO da área (o "repetir" vira quantidade)
            const { pontos, tam } = naurenPontosNaForma(forma, c.repetir, c.deslocAleatorio, ctx.aleatorio ?? Math.random);
            pontos.forEach((pt, k) => {
              const ck = { ...c, repetir: 1, atraso: c.atraso + k * c.repetirIntervalo };
              criados.push(finalizar(ajustes(s.effect().file(anim).atLocation(pt).size({ width: tam * c.escala, height: tam * c.escala }), ck), true));
            });
            break;
          }
          if (geo?.forma === "linha") criados.push(finalizar(ajustes(s.effect().file(anim).atLocation(geo.de).stretchTo(geo.ate), c), true));
          else if (geo) criados.push(finalizar(ajustes(s.effect().file(anim).atLocation({ x: geo.x, y: geo.y }, off).size({ width: geo.tam * c.escala, height: geo.tam * c.escala }), c), true));
          else if (origem) criados.push(finalizar(ajustes(noToken(origem).scaleToObject(c.escala), c))); // sem área: em quem usa
          break;
        }
      }
    }
    if (c.som && !persistir) {
      // som em cada repetição (meteoros caindo um a um) ou uma vez só
      const vezes = c.somRepetir && c.repetir > 1 ? c.repetir : 1;
      for (let k = 0; k < vezes; k++) s.sound().file(c.som).volume(c.somVolume).delay(c.atraso + c.somAtraso + k * c.repetirIntervalo);
    }
    if (c.tremer > 0 && !persistir && typeof s.canvasPan === "function") {
      try { const p = s.canvasPan(); if (c.atraso) p.delay?.(c.atraso); p.shake?.({ duration: c.tremerDuracao, strength: c.tremer, rotation: false }); } catch (err) { /* sem tremor */ }
    }
    if (criados.length) { ultimo = criados[criados.length - 1]; ultimoOnde = c.onde; }
  }
  return visuais;
}

/** Contexto de andar de uma área (altura do piso e ID do andar) para efeitos soltos no mapa. */
async function andarDaRegiao(regiao, ref = null) {
  const A = await andaresApi(); if (!A || !A.naurenCenaTemAndares?.()) return { elevacao: null, nivelId: null };
  const ids = regiao?.levels ? [...regiao.levels] : [];
  const nivelId = ids[0] ?? A.naurenAndarDe?.(ref) ?? globalThis.canvas?.level?.id ?? null;
  return { elevacao: A.naurenElevacaoDoPiso(regiao), nivelId };
}

/** Toca camadas uma vez. Sem Sequencer: só os sons (no tempo aproximado de cada camada). Devolve true se houve visual. */
export async function naurenTocarCamadas(camadas, ctx = {}, contexto = "acao") {
  const lista = naurenCamadasValidas(camadas, contexto);
  if (!lista.length) return false;
  if (!naurenSequencerOk()) {
    const tempos = naurenTemposDasCamadas(lista);
    lista.forEach((c, i) => { const vezes = c.somRepetir && c.repetir > 1 ? c.repetir : 1; for (let k = 0; k < vezes; k++) tocarSomSolto(c.som, c.somVolume, tempos[i] + c.somAtraso + k * c.repetirIntervalo); });
    return false;
  }
  const andar = await andarDaRegiao(ctx.regiao, ctx.origem);
  try {
    const s = new globalThis.Sequence();
    const n = naurenMontarCamadas(s, lista, { ...ctx, ...andar });
    await s.play();
    return n > 0;
  } catch (err) { console.warn("Nauren RPG | animação em camadas", err); return false; }
}

/* ---- Persistentes (Condição, aura, área) ---- */
function efeitosComNome(nome, objeto = null) {
  try { return globalThis.Sequencer?.EffectManager?.getEffects?.(objeto ? { name: nome, object: objeto } : { name: nome }) ?? []; } catch (err) { return []; }
}
export async function naurenLigarPersistente(nome, camadas, ctx = {}, contexto = "condicaoContinuo") {
  if (!naurenSequencerOk()) return false;
  const lista = naurenCamadasValidas(camadas, contexto).filter(c => c.anim);
  if (!lista.length) return false;
  const objeto = obj(ctx.origem) ?? null;
  if (efeitosComNome(nome, objeto).length) return false; // já está
  const andar = ctx.regiao ? await andarDaRegiao(ctx.regiao, ctx.origem) : { elevacao: null, nivelId: null };
  try {
    const s = new globalThis.Sequence();
    const n = naurenMontarCamadas(s, lista.map(c => ({ ...c, quando: "junto", repetir: 1, tremer: 0 })), { ...ctx, ...andar, persistir: true, nome });
    if (n) await s.play();
    return n > 0;
  } catch (err) { console.warn("Nauren RPG | animação contínua", err); return false; }
}
export async function naurenDesligarPersistente(nome, objeto = null) {
  try { await globalThis.Sequencer?.EffectManager?.endEffects?.(objeto ? { name: nome, object: obj(objeto) } : { name: nome }); } catch (err) { /* nada para encerrar */ }
}

/* ---- Combos do mundo ---- */
export function naurenCombosDoMundo() {
  try { const v = game.settings.get("nauren", "combosAnimacao"); return Array.isArray(v) ? v : []; } catch (err) { return []; }
}
export async function naurenSalvarComboDoMundo(nome, contexto, camadas) {
  const lista = naurenCombosDoMundo();
  const id = `mundo-${foundry.utils.randomID(10)}`;
  lista.push({ id, nome: String(nome).trim() || "Combo", contexto, descricao: "", camadas: naurenCamadasValidas(camadas, contexto) });
  await game.settings.set("nauren", "combosAnimacao", lista);
  return id;
}
export async function naurenApagarComboDoMundo(id) {
  await game.settings.set("nauren", "combosAnimacao", naurenCombosDoMundo().filter(c => c.id !== id));
}
export function naurenTodosOsCombos(contexto) {
  return [...naurenCombosParaContexto(NAUREN_COMBOS_PRONTOS, contexto).map(c => ({ ...c, pronto: true })), ...naurenCombosParaContexto(naurenCombosDoMundo(), contexto)];
}

/* ---- Ganchos: Condições, Emanações e áreas persistentes ---- */
const ehGM = () => !!game.user && game.users?.activeGM === game.user;
function tokensDoAtor(actor) {
  if (!actor) return [];
  if (actor.isToken && actor.token?.object) return [actor.token.object];
  return actor.getActiveTokens?.(true) ?? [];
}
const nomeCond = item => `nauren-cond-${item.id}`;
function condicaoAnimavel(item) {
  return item?.type === "condicao" && item.parent?.documentName === "Actor" && !item.getFlag?.("nauren", "modelo") && item.system?.ativo !== false;
}
const acumulosVistos = new Map();

async function condicaoEntrou(item) {
  const cfg = item.system?.animacaoCondicao; if (!cfg) return;
  for (const t of tokensDoAtor(item.parent)) {
    if (cfg.entrada?.length) await naurenTocarCamadas(cfg.entrada, { origem: t }, "condicao");
    if (cfg.continuo?.length) await naurenLigarPersistente(nomeCond(item), cfg.continuo, { origem: t }, "condicaoContinuo");
  }
}
async function condicaoSaiu(item, comSaida = true) {
  const cfg = item.system?.animacaoCondicao;
  for (const t of tokensDoAtor(item.parent)) {
    await naurenDesligarPersistente(nomeCond(item), t);
    if (comSaida && cfg?.saida?.length) await naurenTocarCamadas(cfg.saida, { origem: t }, "condicao");
  }
}

function diametroDaAura(item, token) {
  const raio = parseFloat(item?.system?.emanacaoRaio) || 3;
  const dist = Number(token?.document?.parent?.grid?.distance ?? globalThis.canvas?.scene?.grid?.distance) || 1.5;
  return Math.max(Number(token?.document?.width) || 1, Number(token?.document?.height) || 1) + 2 * raio / dist;
}

/** Pulso de uma Emanação (chamado quando ela causa efeito). alvos: tokens afetados. */
export async function naurenPulsoEmanacao(item, tokenFonte, alvos = []) {
  const p = item?.system?.emanacaoAnimacao?.pulso;
  if (!p?.length || !tokenFonte) return;
  await naurenTocarCamadas(p, { origem: tokenFonte, alvos, atingidos: alvos, diametroAura: diametroDaAura(item, obj(tokenFonte)), temTeste: false }, "emanacaoPulso");
}
/** Pulso de uma área persistente (chamado a cada efeito periódico). alvos: tokens dentro. */
export async function naurenPulsoArea(regiao, config, alvos = []) {
  const p = config?.animacaoPulso;
  if (!p?.length || !regiao) return;
  await naurenTocarCamadas(p, { regiao, alvos: alvos.map(obj), atingidos: alvos.map(obj), temTeste: false }, "areaPulso");
}
async function areaLigar(regiao) {
  const cfg = regiao.getFlag?.("nauren", "templatePersistente");
  if (!cfg?.animacaoContinua?.length) return;
  const { nivelId } = await andarDaRegiao(regiao);
  await naurenLigarPersistente(naurenNomeComAndar(`nauren-area-${regiao.id}`, nivelId), cfg.animacaoContinua, { regiao }, "areaContinuo");
}
async function areaDesligar(regiao) {
  const nomes = new Set([`nauren-area-${regiao.id}`]);
  for (const id of regiao.levels ?? []) nomes.add(naurenNomeComAndar(`nauren-area-${regiao.id}`, id));
  try { for (const ef of globalThis.Sequencer?.EffectManager?.getEffects?.() ?? []) { const n = ef?.data?.name ?? ""; if (n.startsWith(`nauren-area-${regiao.id}`)) nomes.add(n); } } catch (err) { /* ok */ }
  for (const n of nomes) await naurenDesligarPersistente(n);
}
async function emanacaoLigar(regiao) {
  const o = regiao.getFlag?.("nauren", "emanacaoOrigem"); if (!o?.itemUuid || !o.tokenId) return;
  const item = await fromUuid(o.itemUuid).catch(() => null);
  const cont = item?.system?.emanacaoAnimacao?.continuo; if (!cont?.length) return;
  const token = regiao.parent?.tokens?.get(o.tokenId)?.object; if (!token) return;
  await naurenLigarPersistente(`nauren-eman-${regiao.id}`, cont, { origem: token, diametroAura: diametroDaAura(item, token) }, "emanacaoContinuo");
}

export function __naurenIniciar_animacaoCamadas() {
  Hooks.once("init", () => {
    game.settings.register("nauren", "combosAnimacao", { scope: "world", config: false, type: Array, default: [] });
  });
  Hooks.on("createItem", (item, op, userId) => {
    if (!ehGM() || !condicaoAnimavel(item)) return;
    acumulosVistos.set(item.uuid, Number(item.system?.acumulos) || 1);
    condicaoEntrou(item).catch(err => console.warn("Nauren RPG | animação da Condição", err));
  });
  Hooks.on("updateItem", (item, mudou) => {
    if (!ehGM() || item?.type !== "condicao" || item.parent?.documentName !== "Actor" || item.getFlag?.("nauren", "modelo")) return;
    const sys = mudou?.system ?? {};
    if ("ativo" in sys) { if (sys.ativo) condicaoEntrou(item).catch(() => {}); else condicaoSaiu(item).catch(() => {}); return; }
    if ("acumulos" in sys && item.system?.ativo !== false) {
      const antes = acumulosVistos.get(item.uuid) ?? 0, agora = Number(sys.acumulos) || 0;
      acumulosVistos.set(item.uuid, agora);
      const cfg = item.system?.animacaoCondicao;
      if (agora > antes && cfg?.repetirAoAcumular !== false && cfg?.entrada?.length)
        for (const t of tokensDoAtor(item.parent)) naurenTocarCamadas(cfg.entrada, { origem: t }, "condicao").catch(() => {});
    }
  });
  Hooks.on("deleteItem", item => {
    if (!ehGM() || item?.type !== "condicao" || item.parent?.documentName !== "Actor" || item.getFlag?.("nauren", "modelo")) return;
    acumulosVistos.delete(item.uuid);
    condicaoSaiu(item, item.system?.ativo !== false).catch(err => console.warn("Nauren RPG | animação da Condição", err));
  });
  // token novo no mapa com Condições ativas: liga as contínuas
  Hooks.on("createToken", tokenDoc => {
    if (!ehGM()) return;
    setTimeout(() => {
      const t = tokenDoc.object; if (!t) return;
      for (const it of tokenDoc.actor?.items ?? []) if (condicaoAnimavel(it) && it.system.animacaoCondicao?.continuo?.length)
        naurenLigarPersistente(nomeCond(it), it.system.animacaoCondicao.continuo, { origem: t }, "condicaoContinuo").catch(() => {});
    }, 400);
  });
  Hooks.on("createRegion", regiao => {
    if (!ehGM()) return;
    if (regiao.getFlag?.("nauren", "emanacaoOrigem")) setTimeout(() => emanacaoLigar(regiao).catch(err => console.warn("Nauren RPG | aura da Emanação", err)), 200);
    if (regiao.getFlag?.("nauren", "templatePersistente")) areaLigar(regiao).catch(() => {});
  });
  Hooks.on("updateRegion", (regiao, mudou) => {
    if (!ehGM()) return;
    if (foundry.utils.hasProperty(mudou ?? {}, "flags.nauren.templatePersistente")) areaLigar(regiao).catch(err => console.warn("Nauren RPG | animação da área", err));
  });
  Hooks.on("deleteRegion", regiao => {
    if (!ehGM()) return;
    if (regiao.getFlag?.("nauren", "emanacaoOrigem")) naurenDesligarPersistente(`nauren-eman-${regiao.id}`).catch(() => {});
    if (regiao.getFlag?.("nauren", "templatePersistente")) areaDesligar(regiao).catch(() => {});
  });
}
