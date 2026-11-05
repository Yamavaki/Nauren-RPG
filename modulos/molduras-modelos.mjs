/* Nauren RPG — Molduras de token: modelos paramétricos (0.103).
 *
 * Cada moldura é geometria exata em SVG: a casa do grid vai de -100 a 100 e o buraco da arte tem r = 70
 * (mesmo tamanho de arte em todas). Tudo segue uma grade-guia (círculos concêntricos, ângulos múltiplos da
 * simetria, ligações radiais), como combinado em planejamento/molduras-regras-desenho.md.
 *
 * O módulo não depende do Foundry: gera o SVG da moldura, o caminho da máscara da arte (normal = buraco,
 * expandida = contorno de fora) e o estado dos efeitos num instante (função pura, usada pela prévia 2D e
 * pela camada PIXI do mapa). */

const TAU = Math.PI * 2, f = n => +Number(n).toFixed(2);
const rad = a => a * Math.PI / 180;
const pol = (r, a) => [f(r * Math.sin(a)), f(-r * Math.cos(a))]; // a = 0 no topo, horário
const pp = (r, a) => pol(r, rad(a));
const P = (r, a) => pp(r, a).join(",");
const xy = p => `${f(p[0])},${f(p[1])}`;
const R0 = 70;
let uid = 0;

/* ============================== primitivos ============================== */
const poligono = (n, r, rot = 0) => Array.from({ length: n }, (_, k) => pol(r, rad(rot + k * 360 / n)));
const pts = l => l.map(p => p.join(",")).join(" ");
function caminhoForma(forma, r) {
  switch (forma) {
    case "losango": return `M${pts(poligono(4, r * 1.3)).replace(/ /g, " L")}Z`;
    case "octogono": return `M${pts(poligono(8, r * 1.055, 22.5)).replace(/ /g, " L")}Z`;
    case "hexagono": return `M${pts(poligono(6, r * 1.08, 30)).replace(/ /g, " L")}Z`;
    case "chanfro": { const s = r * .93, c = r * .34; return `M${f(-s + c)},${f(-s)} L${f(s - c)},${f(-s)} L${f(s)},${f(-s + c)} L${f(s)},${f(s - c)} L${f(s - c)},${f(s)} L${f(-s + c)},${f(s)} L${f(-s)},${f(s - c)} L${f(-s)},${f(-s + c)}Z`; }
    default: return circulo(r);
  }
}
const circulo = r => `M0,${f(-r)} A${f(r)},${f(r)} 0 1 1 0,${f(r)} A${f(r)},${f(r)} 0 1 1 0,${f(-r)}Z`;
const anel = (r1, r2, cls, forma = "circulo") => `<path class="${cls}" fill-rule="evenodd" d="${caminhoForma(forma, r2)} ${caminhoForma(forma, r1)}"/>`;
const circ = (r, w, cls = "lm") => `<circle r="${f(r)}" class="${cls}" style="stroke-width:${w}"/>`;
const contorno = (forma, r, w, cls = "lm") => `<path d="${caminhoForma(forma, r)}" class="${cls}" style="stroke-width:${w}"/>`;
const repetir = (n, r, motivo, rot0 = 0, giro = 0) => Array.from({ length: n }, (_, k) => `<g transform="rotate(${f(rot0 + k * 360 / n)}) translate(0 ${f(-r)})${giro ? ` rotate(${giro})` : ""}">${typeof motivo === "function" ? motivo(k) : motivo}</g>`).join("");
function padraoPolar(n, r1, r2, linhas, cls, fechado = false, rot0 = 0) {
  let d = "";
  for (let k = 0; k < n; k++) for (const l of linhas) {
    const out = [];
    for (let i = 0; i < l.length; i++) {
      const [u0, v0] = l[i]; out.push([u0, v0]);
      const prox = l[i + 1] ?? (fechado ? l[0] : null);
      if (!prox) continue;
      const passos = Math.max(1, Math.ceil(Math.abs(prox[0] - u0) / 0.04));
      for (let s = 1; s < passos; s++) out.push([u0 + (prox[0] - u0) * s / passos, v0 + (prox[1] - v0) * s / passos]);
    }
    d += "M" + out.map(([u, v]) => pol(r1 + v * (r2 - r1), (rot0 / 360 + (k + u) / n) * TAU).join(",")).join(" L") + (fechado ? "Z" : "");
  }
  return `<path class="${cls}" d="${d}"/>`;
}
const realce = () => ""; // (o risco de brilho por cima do aro foi tirado de todas as molduras — pedido do Gustavo)
const W = w => `style="stroke-width:${w}"`;
const L = (d, w = 1.5) => `<path class="lm" ${W(w)} d="${d}"/>`;
const C = (r, w = 1.5) => `<circle class="lm" ${W(w)} r="${f(r)}"/>`;
/** Ponto do segmento a→b que fica no raio r (a e b em [x, y]). */
const noRaio = (a, b, r) => { const dx = b[0] - a[0], dy = b[1] - a[1], A2 = dx * dx + dy * dy, B = 2 * (a[0] * dx + a[1] * dy), C2 = a[0] * a[0] + a[1] * a[1] - r * r, d = Math.max(0, B * B - 4 * A2 * C2), t = (-B + Math.sqrt(d)) / (2 * A2), t2 = (-B - Math.sqrt(d)) / (2 * A2), tt = t >= -1e-6 && t <= 1 + 1e-6 ? t : t2; return [a[0] + tt * dx, a[1] + tt * dy]; };
const angDe = q => (Math.atan2(q[0], -q[1]) * 180 / Math.PI + 360) % 360;
/** Círculo como faixa de metal (preenchida, com o contorno escuro das peças). */
const aro = (r, w) => anel(r - w / 2, r + w / 2, "m");
const A = (r, a0, a1) => `A${f(r)},${f(r)} 0 ${((a1 - a0 + 360) % 360) > 180 ? 1 : 0} 1 ${P(r, a1)}`;
const Ai = (r, a0, a1) => `A${f(r)},${f(r)} 0 ${((a0 - a1 + 360) % 360) > 180 ? 1 : 0} 0 ${P(r, a1)}`;
const arco = (r, a0, a1, w, cls = "lm") => `<path class="${cls}" ${W(w)} d="M${P(r, a0)} ${A(r, a0, a1)}"/>`;
const radial = (r1, r2, a, w) => L(`M${P(r1, a)} L${P(r2, a)}`, w);
const placa = (ro, ri, a0, a1, w, s = 0) => L(`M${P(ro, a0)} ${A(ro, a0, a1)} L${P(ri, a1 - s)} ${Ai(ri, a1 - s, a0 + s)} Z`, w);
const placaAberta = (ro, ri, a0, a1, w, s = 0) => L(`M${P(ro, a0)} L${P(ri, a0 + s)} ${A(ri, a0 + s, a1 - s)} L${P(ro, a1)}`, w);
const noAnel = (id, tag, r1, r2, conteudo) => `<clipPath id="k${id}${tag}"><path fill-rule="evenodd" clip-rule="evenodd" d="${circulo(r2)} M0,${f(-r1)} A${f(r1)},${f(r1)} 0 1 0 0,${f(r1)} A${f(r1)},${f(r1)} 0 1 0 0,${f(-r1)}Z"/></clipPath><g clip-path="url(#k${id}${tag})">${conteudo}</g>`;
function cruza(p1, p2, p3, p4) { const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  const t = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d; return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]; }
function cortaCirculo(p, q, r) { const dx = q[0] - p[0], dy = q[1] - p[1], a = dx * dx + dy * dy, b = 2 * (p[0] * dx + p[1] * dy), c = p[0] * p[0] + p[1] * p[1] - r * r;
  const disc = Math.sqrt(Math.max(0, b * b - 4 * a * c)); const ts = [(-b - disc) / (2 * a), (-b + disc) / (2 * a)].filter(t => t >= -1e-6).sort((x, y) => x - y); const t = ts[0] ?? 0; return [p[0] + t * dx, p[1] + t * dy]; }
const sim4 = fn => [0, 90, 180, 270].map(fn).join("");
const poly = (lista, cls = "m") => `<polygon class="${cls}" points="${lista.map(([r, a]) => P(r, a)).join(" ")}"/>`;
const polyL = (lista, w, fechado = true) => `<${fechado ? "polygon" : "polyline"} class="lm" ${W(w)} points="${lista.map(([r, a]) => P(r, a)).join(" ")}"/>`;
function lente(p, q, h, cls = "e") {
  const [x1, y1] = pp(...p), [x2, y2] = pp(...q), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const c1 = [mx + nx * h * 2, my + ny * h * 2], c2 = [mx - nx * h * 2, my - ny * h * 2];
  return `<path class="${cls}" d="M${f(x1)},${f(y1)} Q${f(c1[0])},${f(c1[1])} ${f(x2)},${f(y2)} Q${f(c2[0])},${f(c2[1])} ${f(x1)},${f(y1)}Z"/>`;
}
const LW = 2.7, LF = 2.0;
function passos(itens, fechar = true) {
  let d = "";
  for (const it of itens) {
    if (Array.isArray(it)) { d += `${d ? "L" : "M"}${P(it[0], it[1])} `; continue; }
    d += `${d ? "L" : "M"}${P(it.r, it.a0)} ${A(it.r, it.a0, it.a1)} `;
  }
  return d + (fechar ? "Z" : "");
}
const degraus = lista => passos(lista.map(([a0, a1, r]) => ({ r, a0, a1 })));
const comV = (r, apex, faixas) => {
  const it = [];
  faixas.forEach(([a0, a1], i) => { it.push({ r, a0, a1 }); const prox = faixas[(i + 1) % faixas.length]; const meio = ((a1 + (prox[0] < a1 ? prox[0] + 360 : prox[0])) / 2) % 360; it.push([apex, meio]); });
  return passos(it);
};
const GREGA2 = [[[0, .5 / 9], [1, .5 / 9]], [[0, 8.5 / 9], [1, 8.5 / 9]],
  [[.5 / 8, .5 / 9], [.5 / 8, 6.5 / 9], [6.5 / 8, 6.5 / 9], [6.5 / 8, 2.5 / 9], [2.5 / 8, 2.5 / 9], [2.5 / 8, 4.5 / 9], [4.5 / 8, 4.5 / 9]]];

/* ---------- motivos (coordenadas locais: y negativo = para fora) ---------- */
const M = {
  losango: (s, h = 1.5) => `<polygon class="m" points="0,${f(-s * h)} ${f(s)},0 0,${f(s * h)} ${f(-s)},0"/><polygon class="e" points="0,${f(-s * h * .5)} ${f(s * .5)},0 0,${f(s * h * .5)} ${f(-s * .5)},0"/>`,
  losangoLinha: (s, h = 1.5) => `<polygon class="lm" style="stroke-width:1.1" points="0,${f(-s * h)} ${f(s)},0 0,${f(s * h)} ${f(-s)},0"/><polygon class="m" points="0,${f(-s * h * .45)} ${f(s * .45)},0 0,${f(s * h * .45)} ${f(-s * .45)},0"/>`,
  ponto: s => `<circle r="${f(s)}" class="m"/>`,
  rebite: s => `<circle r="${f(s)}" class="m"/><circle r="${f(s * .45)}" cy="${f(-s * .2)}" cx="${f(-s * .2)}" class="brilho"/>`,
  quadrado: s => `<rect x="${f(-s)}" y="${f(-s)}" width="${f(s * 2)}" height="${f(s * 2)}" class="m" transform="rotate(45)"/><rect x="${f(-s * .45)}" y="${f(-s * .45)}" width="${f(s * .9)}" height="${f(s * .9)}" class="e" transform="rotate(45)"/>`,
  bloco: (w, h) => `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" class="m"/>`,
  triangulo: (s, h = 1.6) => `<polygon class="m" points="${f(-s)},0 ${f(s)},0 0,${f(-s * h)}"/>`,
  trianguloDentro: (s, h = 1.4) => `<polygon class="m" points="${f(-s)},${f(-s * h)} ${f(s)},${f(-s * h)} 0,0"/>`,
  bussola: s => `<polygon class="m" points="0,${f(-s * 2.1)} ${f(s)},0 ${f(-s)},0"/><polygon class="e" points="0,${f(-s * 1.45)} ${f(s * .52)},${f(-s * .25)} ${f(-s * .52)},${f(-s * .25)}"/><circle class="m" r="${f(s * .2)}" cy="${f(-s * .62)}"/><circle class="m" r="${f(s * .17)}" cx="${f(-s * .25)}" cy="${f(-s * .4)}"/><circle class="m" r="${f(s * .17)}" cx="${f(s * .25)}" cy="${f(-s * .4)}"/>`,
  petala: (s, h = 2) => `<path class="m" d="M0,0 Q${f(s)},${f(-s * h * .45)} 0,${f(-s * h)} Q${f(-s)},${f(-s * h * .45)} 0,0Z"/><path class="e" d="M0,${f(-s * h * .2)} Q${f(s * .38)},${f(-s * h * .5)} 0,${f(-s * h * .78)} Q${f(-s * .38)},${f(-s * h * .5)} 0,${f(-s * h * .2)}Z"/>`,
  trapezio: (a, b, h) => `<polygon class="m" points="${f(-a)},0 ${f(a)},0 ${f(b)},${f(-h)} ${f(-b)},${f(-h)}"/>`,
  lanca: (w, h) => `<polygon class="m" points="0,${f(-h)} ${f(w)},${f(-h * .38)} 0,${f(-h * .05)} ${f(-w)},${f(-h * .38)}"/><polygon class="e" points="0,${f(-h * .86)} ${f(w * .42)},${f(-h * .4)} 0,${f(-h * .2)} ${f(-w * .42)},${f(-h * .4)}"/><line class="lm" style="stroke-width:.7" x1="0" y1="${f(-h * .8)}" x2="0" y2="${f(-h * .25)}"/>`,
  estrela4: (s, k = .28) => `<path class="m" d="M0,${f(-s)} Q${f(s * k)},${f(-s * k)} ${f(s)},0 Q${f(s * k)},${f(s * k)} 0,${f(s)} Q${f(-s * k)},${f(s * k)} ${f(-s)},0 Q${f(-s * k)},${f(-s * k)} 0,${f(-s)}Z"/>`,
  leque: (s, raios = 7) => {
    let o = `<path class="m" d="M${f(-s)},0 A${f(s)},${f(s)} 0 0 1 ${f(s)},0Z"/><path class="e" d="M${f(-s * .82)},0 A${f(s * .82)},${f(s * .82)} 0 0 1 ${f(s * .82)},0Z"/>`;
    for (let i = 0; i < raios; i++) { const a = rad(-80 + i * 160 / (raios - 1)); o += `<line class="lm" style="stroke-width:${f(s * .07)}" x1="0" y1="0" x2="${f(s * .8 * Math.sin(a))}" y2="${f(-s * .8 * Math.cos(a))}"/>`; }
    return o + `<path class="m" d="M${f(-s * .3)},0 A${f(s * .3)},${f(s * .3)} 0 0 1 ${f(s * .3)},0Z"/>`;
  },
  zigurate: s => `<polygon class="m" points="${pts([[-s * 1.5, 0], [-s * 1.5, -s * .4], [-s * 1.05, -s * .4], [-s * 1.05, -s * .8], [-s * .55, -s * .8], [-s * .55, -s * 1.25], [s * .55, -s * 1.25], [s * .55, -s * .8], [s * 1.05, -s * .8], [s * 1.05, -s * .4], [s * 1.5, -s * .4], [s * 1.5, 0]].map(p => p.map(f)))}"/><polygon class="e" points="${pts([[-s * .3, -s * .25], [s * .3, -s * .25], [s * .3, -s * .95], [-s * .3, -s * .95]].map(p => p.map(f)))}"/>`,
  gema: s => `<polygon class="m" points="${pts(poligono(6, s * 1.15, 30))}"/><polygon class="joia" points="${pts(poligono(6, s * .78, 30))}"/><polygon class="brilho" points="${f(-s * .35)},${f(-s * .35)} ${f(-s * .05)},${f(-s * .62)} ${f(s * .1)},${f(-s * .3)}"/>`,
  chifre: (s, lado = 1) => `<path class="m" d="M0,0 C${f(lado * s * .9)},${f(-s * .2)} ${f(lado * s * 1.6)},${f(-s * .9)} ${f(lado * s * 2.2)},${f(-s * 2.1)} C${f(lado * s * 1.1)},${f(-s * 1.4)} ${f(lado * s * .6)},${f(-s * .9)} ${f(lado * -s * .2)},${f(-s * .7)}Z"/>`,
  espinho: (w, h) => `<polygon class="m" points="${f(-w)},0 0,${f(-h)} ${f(w)},0 0,${f(-h * .22)}"/>`,
  flor: s => {
    const meia = `<path class="m" d="M0,${f(-s)} C${f(s * .2)},${f(-s * .78)} ${f(s * .24)},${f(-s * .55)} ${f(s * .09)},${f(-s * .36)} L0,${f(-s * .3)}Z M${f(s * .1)},${f(-s * .33)} C${f(s * .36)},${f(-s * .6)} ${f(s * .78)},${f(-s * .56)} ${f(s * .68)},${f(-s * .22)} C${f(s * .62)},${f(-s * .04)} ${f(s * .42)},${f(-s * .06)} ${f(s * .42)},${f(-s * .2)} C${f(s * .44)},${f(-s * .3)} ${f(s * .3)},${f(-s * .3)} ${f(s * .14)},${f(-s * .17)}Z M0,${f(-s * .24)} L${f(s * .34)},${f(-s * .24)} L${f(s * .34)},${f(-s * .14)} L0,${f(-s * .14)}Z M0,${f(-s * .14)} L${f(s * .1)},${f(-s * .14)} L${f(s * .05)},0 L0,0Z"/>`;
    return `${meia}<g transform="scale(-1 1)">${meia}</g>`;
  }
};

/* ============================== paletas ============================== */
export const NAUREN_MOLDURA_PALETAS = {
  ouro: { nome: "Ouro", cores: ["#fff3c4", "#e6bf5c", "#a8761c", "#6b4510", "#d9a83c"] },
  ourolinha: { nome: "Ouro claro", cores: ["#f8e6ad", "#ecd18a", "#dcbb70", "#b38f46", "#e6c77e"] },
  prata: { nome: "Prata", cores: ["#ffffff", "#d6dce6", "#8d97a8", "#525b6b", "#c3cad6"] },
  branco: { nome: "Branco", cores: ["#ffffff", "#f7f7f7", "#e2e2e2", "#a8a8a8", "#efefef"] },
  bronze: { nome: "Bronze", cores: ["#ffd9b0", "#c8834a", "#8a4b22", "#4f2810", "#b06a35"] },
  cobre: { nome: "Cobre", cores: ["#ffd0b8", "#e08a5c", "#9c4a28", "#5a2412", "#c96a40"] },
  obsidiana: { nome: "Obsidiana", cores: ["#9b95ad", "#4a4458", "#25212f", "#120f18", "#3a3446"] },
  esmeralda: { nome: "Esmeralda", cores: ["#d8ffe6", "#5fd08e", "#227a4c", "#0e3d25", "#40a96c"] },
  rubi: { nome: "Rubi", cores: ["#ffd0d6", "#e0526a", "#8e1a2e", "#4a0a16", "#c03048"] },
  arcano: { nome: "Arcano", cores: ["#efdcff", "#b07ce8", "#6a3cb0", "#331a63", "#9460d6"] },
  neon: { nome: "Neon", cores: ["#e9ffff", "#7ff6ff", "#22c8e0", "#0b6c80", "#5ee8f5"] }
};
const hexRgb = h => { const s = String(h).replace("#", ""); const t = s.length === 3 ? s.split("").map(c => c + c).join("") : s.slice(0, 6); return [0, 2, 4].map(i => parseInt(t.slice(i, i + 2), 16) || 0); };
const rgbHex = c => "#" + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const misturar = (a, b, t) => rgbHex(hexRgb(a).map((v, i) => v + (hexRgb(b)[i] - v) * t));
/** 5 paradas de metal a partir de 1 cor (ou 2: clara e escura). */
export function naurenMolduraPaletaDeCores(cores) {
  const base = cores?.[0] ?? "#e6bf5c", escura = cores?.[1] ?? misturar(base, "#1a1008", .55);
  return [misturar(base, "#ffffff", .62), misturar(base, "#ffffff", .18), base, misturar(escura, "#000000", .2), misturar(base, escura, .3)];
}
export function naurenMolduraCoresDe(cfg) {
  if (cfg.paleta && cfg.paleta !== "livre" && NAUREN_MOLDURA_PALETAS[cfg.paleta]) return NAUREN_MOLDURA_PALETAS[cfg.paleta].cores;
  return naurenMolduraPaletaDeCores(cfg.cores);
}

/* ============================== modelos ============================== */
/* Cada modelo: id, nome, grupo, paleta padrão, esmalte, joia, forma (buraco das simples), K (escala das
 * medidas, quando o modelo foi medido numa referência), buraco(K) e fora(K) (caminhos da máscara normal e
 * expandida, em unidades da casa), corpo(forma, id) e, se tiver, atras() (camada atrás da arte).
 * expandida: true = a máscara expandida vem por padrão (escolha do Gustavo). */
const CIRC = r => K => circulo(r * K);
export const NAUREN_MOLDURA_MODELOS = [
  // ---------------- DAS REFERÊNCIAS ----------------
  { id: "deco-placas", nome: "Déco Placas", grupo: "deco", paleta: "ourolinha", K: 79.7, expandida: true, fora: K => circulo(K),
    buraco: K => degraus([[-32, 32, .955 * K], [32, 77, .885 * K], [77, 103, .955 * K], [103, 148, .885 * K], [148, 212, .955 * K], [212, 257, .885 * K], [257, 283, .955 * K], [283, 328, .885 * K]]),
    corpo() { const K = this.K; return C(K, LW) + L(this.buraco(K), LF); } },
  { id: "deco-entalhe", nome: "Déco Entalhe", grupo: "deco", paleta: "ourolinha", K: 80.1, expandida: true,
    geo(K) {
      const r1 = K, r2 = .955 * K, r3 = .88 * K, meia = 10, ap1 = .845 * K;
      const ladoV = c => {
        const Ap = pp(r1, c - meia), T = pp(ap1, c), B = pp(r1, c + meia), g = r1 - r2;
        const off = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy); let nx = -dy / l, ny = dx / l; const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; if (nx * -mx + ny * -my < 0) { nx = -nx; ny = -ny; } return [[p[0] + nx * g, p[1] + ny * g], [q[0] + nx * g, q[1] + ny * g]]; };
        const [a1, a2] = off(Ap, T), [b1, b2] = off(T, B);
        const T2 = cruza(a1, a2, b1, b2), A2 = cortaCirculo(T2, a1, r2), B2 = cortaCirculo(T2, b2, r2);
        return { A: Ap, T, B, A2, T2, B2, i1: cortaCirculo(T2, A2, r3), i2: cortaCirculo(T2, B2, r3) };
      };
      return { r1, r2, r3, meia, ap1, V: { 90: ladoV(90), 270: ladoV(270) } };
    },
    fora(K) { const v = this.geo(K).V; return `M${xy(v[90].B)} ${A(K, 100, 260)} L${xy(v[270].T)} L${xy(v[270].B)} ${A(K, 280, 440)} L${xy(v[90].T)} Z`; },
    buraco(K) { const g = this.geo(K), v = g.V, ang = q => (Math.atan2(q[0], -q[1]) * 180 / Math.PI + 360) % 360, a = v[90], b = v[270];
      return `M${P(g.r3, 0)} ${A(g.r3, 0, ang(a.i1))} L${xy(a.T2)} L${xy(a.i2)} ${A(g.r3, ang(a.i2), ang(b.i1))} L${xy(b.T2)} L${xy(b.i2)} ${A(g.r3, ang(b.i2), 360)}Z`; },
    corpo() { const K = this.K, g = this.geo(K), v = g.V, ang = q => (Math.atan2(q[0], -q[1]) * 180 / Math.PI + 360) % 360; let o = "";
      o += L(`M${xy(v[90].B)} ${A(g.r1, 100, 260)} L${xy(v[270].T)} L${xy(v[270].B)} ${A(g.r1, 280, 440)} L${xy(v[90].T)} Z`, LW);
      o += L(`M${xy(v[90].B2)} ${A(g.r2, ang(v[90].B2), ang(v[270].A2))} L${xy(v[270].T2)} L${xy(v[270].B2)} ${A(g.r2, ang(v[270].B2), ang(v[90].A2) + 360)} L${xy(v[90].T2)} Z`, LF);
      o += L(`M${P(g.r2, 4)} L${P(g.r3, 4)} ${A(g.r3, 4, 176)} L${P(g.r2, 176)} M${P(g.r2, 184)} L${P(g.r3, 184)} ${A(g.r3, 184, 356)} L${P(g.r2, 356)}`, LF);
      return o; } },
  { id: "deco-partido", nome: "Déco Partido", grupo: "deco", paleta: "ourolinha", K: 80.6, expandida: true,
    geo(K) { const r1 = K, r3 = .875 * K, meia = 13, ap = .79 * K, gx = .085 * K; const V = {};
      for (const c of [90, 270]) { const Ap = pp(r1, c - meia), T = pp(ap, c), Bp = pp(r1, c + meia); V[c] = { Ap, T, Bp, i1: cortaCirculo(T, Ap, r3), i2: cortaCirculo(T, Bp, r3) }; }
      return { r1, r3, meia, ap, gx, V }; },
    fora(K) { const { r1, meia, V } = this.geo(K); return `M${xy(V[90].Bp)} ${A(r1, 90 + meia, 270 - meia)} L${xy(V[270].T)} L${xy(V[270].Bp)} ${A(r1, 270 + meia, 450 - meia)} L${xy(V[90].T)} Z`; },
    buraco(K) { const { r3, V } = this.geo(K), ang = q => (Math.atan2(q[0], -q[1]) * 180 / Math.PI + 360) % 360, a = V[90], b = V[270];
      return `M${P(r3, 0)} ${A(r3, 0, ang(a.i1))} L${xy(a.T)} L${xy(a.i2)} ${A(r3, ang(a.i2), ang(b.i1))} L${xy(b.T)} L${xy(b.i2)} ${A(r3, ang(b.i2), 360)}Z`; },
    corpo() { const K = this.K, { r1, r3, meia, gx, V } = this.geo(K); let o = "";
      o += L(`M${xy(V[90].Bp)} ${A(r1, 90 + meia, 270 - meia)} L${xy(V[270].T)} L${xy(V[270].Bp)} ${A(r1, 270 + meia, 450 - meia)} L${xy(V[90].T)} Z`, LW);
      const yi = Math.sqrt(r3 * r3 - gx * gx), yo = Math.sqrt(r1 * r1 - gx * gx);
      o += L(`M${f(gx)},${f(-yo)} L${f(gx)},${f(-yi)} A${f(r3)},${f(r3)} 0 0 1 ${f(gx)},${f(yi)} L${f(gx)},${f(yo)} M${f(-gx)},${f(yo)} L${f(-gx)},${f(yi)} A${f(r3)},${f(r3)} 0 0 1 ${f(-gx)},${f(-yi)} L${f(-gx)},${f(-yo)}`, LF);
      const h = .07 * K, folga = 4.6 * LF, perna = [pp(r1, 90 - meia), V[90].T];
      const dist = (p, a, b) => Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / Math.hypot(b[0] - a[0], b[1] - a[1]);
      let cxd = K; for (let x = .8 * K; x < 1.3 * K; x += .05) { const q2 = [[x - h, 0], [x, -h]]; if (Math.min(...q2.map(q => dist(q, perna[0], perna[1]))) >= folga && x - h > V[90].T[0]) { cxd = x; break; } }
      for (const sx of [1, -1]) { const cx = sx * cxd; o += `<polygon class="lm" style="stroke-width:${LF}" points="${f(cx - h)},0 ${f(cx)},${f(-h)} ${f(cx + h)},0 ${f(cx)},${f(h)}"/>`; }
      return o; } },
  { id: "deco-coroa", nome: "Déco Coroa", grupo: "deco", paleta: "ourolinha", K: 78, expandida: true,
    fora: K => degraus([[-22, 22, 1.075 * K], [22, 158, K], [158, 202, 1.075 * K], [202, 338, K]]),
    buraco: K => degraus([[-37, 37, .962 * K], [37, 80, .905 * K], [80, 100, .962 * K], [100, 143, .905 * K], [143, 217, .962 * K], [217, 260, .905 * K], [260, 280, .962 * K], [280, 323, .905 * K]]),
    corpo() { const K = this.K; let o = C(K, LW) + L(this.buraco(K), LF);
      for (const q of [0, 180]) o += L(passos([[K, q - 22], { r: 1.075 * K, a0: q - 22, a1: q + 22 }, [K, q + 22]], false), LF) + arco(1.04 * K, q - 22, q + 22, LF);
      for (const c of [90, 270]) o += polyL([[K, c - 3.6], [1.075 * K, c], [K, c + 3.6]], LF, false);
      return o; } },
  { id: "deco-colchetes", nome: "Déco Colchetes", grupo: "deco", paleta: "ourolinha", K: 80, expandida: true,
    fora: K => passos([[1.08 * K, 0], { r: K, a0: 4, a1: 176 }, [1.08 * K, 180], { r: K, a0: 184, a1: 356 }]),
    buraco: K => degraus([[-14, 14, .88 * K], [14, 68, .925 * K], [68, 112, .962 * K], [112, 166, .925 * K], [166, 194, .88 * K], [194, 248, .925 * K], [248, 292, .962 * K], [292, 346, .925 * K]]),
    corpo() { const K = this.K; let o = C(K, LW) + C(.962 * K, LF) + L(this.buraco(K), LF);
      for (const q of [0, 180]) o += polyL([[K, q - 4], [1.08 * K, q], [K, q + 4]], LF, false);
      return o; } },
  { id: "picos-cardeais", nome: "Picos Cardeais", grupo: "deco", paleta: "ourolinha", K: 76.5, fora: CIRC(1.065),
    buraco: K => { const i = .925 * K, ex = 1.065 * K, h = 8.5; let d = `M${P(i, h)}`; for (const c of [0, 90, 180, 270]) d += ` ${A(i, c + h, c + 90 - h)} L${P(ex, c + 90)} L${P(i, c + 90 + h)}`; return d + "Z"; },
    corpo() { const K = this.K; return C(1.065 * K, 1.7) + L(this.buraco(K), 1.4) + sim4(c => polyL([[1.042 * K, c - 2.2], [.99 * K, c], [1.042 * K, c + 2.2]], .9)); } },
  { id: "estrela-foliada", nome: "Estrela Foliada", grupo: "detalhadas", paleta: "branco", esmalte: "#161616", K: 78.9, buraco: CIRC(.887), fora: CIRC(1.16),
    corpo() { const K = this.K, N = 20, s = 360 / N;
      // faixa e folhas num caminho só (sem linhas internas cruzando as folhas)
      const estrela = Array.from({ length: N }, (_, k) => `${P(K, k * s - s / 2)} L${P(1.16 * K, k * s)}`).join(" L");
      let o = `<path class="m" fill-rule="evenodd" d="M${estrela}Z M0,-70 A70,70 0 1 0 0,70 A70,70 0 1 0 0,-70Z"/>`;
      for (let k = 0; k < N; k++) { const c = k * s; o += lente([.935 * K, c], [1.14 * K, c], 2.5) + lente([.935 * K, c + .4], [.993 * K, c + s / 2 - .9], 1.7) + lente([.935 * K, c - .4], [.993 * K, c - s / 2 + .9], 1.7); }
      return o; } },
  { id: "triangulos-encaixados", nome: "Triângulos Encaixados", grupo: "deco", paleta: "branco", esmalte: "#161616", K: 78.2, fora: CIRC(1.048),
    buraco: K => { const N = 28, s = 360 / N, rB = 1.048 * K - .7; return `M${Array.from({ length: N }, (_, k) => [P(.905 * K, k * s), P(rB, k * s + s / 2)].join(" L")).join(" L")}Z`; },
    corpo() { const K = this.K, N = 28, s = 360 / N; let o = "";
      for (let k = 0; k < N; k++) { const c = k * s; o += poly([[1.043 * K, c - s * .47], [1.043 * K, c + s * .47], [.905 * K, c]]) + poly([[1.013 * K, c - s * .1], [1.013 * K, c + s * .1], [.983 * K, c]], "e") + poly([[.937 * K, c + s / 2 - s * .13], [.937 * K, c + s / 2 + s * .13], [.977 * K, c + s / 2]]); }
      // faixa de fora + triângulos grandes numa peça só: disco com o vão em estrela (os vãos dão para o miolo)
      const rFora = 1.048 * K + .7, rB = 1.048 * K - .7; let d = `${circulo(rFora)} M`;
      // triângulos grandes encostados em ponta na faixa de fora (o vão entre eles termina em ponta no anel)
      for (let k = 0; k < N; k++) { const c = k * s; d += `${k ? " L" : ""}${P(rB, c - s / 2)} L${P(.905 * K, c)}`; }
      return `<path class="m" fill-rule="evenodd" d="${d}Z"/>` + o.replace(/<polygon class="m" points="[^"]*"\/>(?=<polygon class="e")/g, ""); } },
  { id: "dente-de-serra", nome: "Dente de Serra", grupo: "deco", paleta: "branco", K: 78.2, expandida: true, buraco: CIRC(.905), fora: CIRC(1.063),
    corpo() { const K = this.K, N = 28, s = 360 / N, rFora = 1.033 * K + .75, rB = 1.033 * K - .75, rI = .905 * K + .65, rI0 = .905 * K - .65;
      // faixa de fora + triângulos + aro de dentro numa peça só: um disco com o miolo e os vãos entre os triângulos vazados
      // vãos = triângulos com a ponta encostando na faixa de fora e a base no aro de dentro (pontas dos triângulos de metal no aro)
      let d = `${circulo(rFora)} ${circulo(rI0)}`;
      for (let k = 0; k < N; k++) { const c1 = k * s + s / 2, c2 = c1 + s, v = c1 + s / 2; d += ` M${P(rB, v)} L${P(rI, c1)} A${f(rI)},${f(rI)} 0 0 1 ${P(rI, c2)}Z`; }
      return `<path class="m" fill-rule="evenodd" d="${d}"/>` + aro(1.063 * K, 1.2); } },
  { id: "estrela-entrelacada", nome: "Estrela Entrelaçada", grupo: "deco", paleta: "branco", K: 79.5, expandida: true,
    fora: K => { const N = 10, s = 360 / N, t = 1.09 * K, v = .99 * K; return `M${Array.from({ length: N }, (_, k) => [P(t, k * s), P(v, k * s + .23 * s), P(t, k * s + .5 * s), P(v, k * s + .77 * s)].join(" L")).join(" L")}Z`; },
    buraco: K => { const N = 10, s = 360 / N; return `M${Array.from({ length: N }, (_, k) => [P(.905 * K, k * s), P(.99 * K, k * s + .23 * s), P(1.09 * K, k * s + .5 * s), P(.99 * K, k * s + .77 * s)].join(" L")).join(" L")}Z`; },
    corpo() { const K = this.K, N = 10, s = 360 / N, t = 1.09 * K, v = .99 * K, b = .905 * K, w = 2.9; const lista = [];
      for (let k = 0; k < N; k++) { const c = k * s; lista.push([t, c], [v, c + .23 * s], [t, c + .5 * s], [v, c + .77 * s]); }
      let o = polyL(lista, w);
      for (let k = 0; k < N; k++) { const c = k * s; o += polyL([[v, c - .23 * s], [b, c], [v, c + .23 * s]], w, false) + poly([[1.025 * K, c + .5 * s], [.983 * K, c + .5 * s + .12 * s], [.94 * K, c + .5 * s], [.983 * K, c + .5 * s - .12 * s]]); }
      return o; } },
  { id: "trigo", nome: "Trigo", grupo: "detalhadas", paleta: "branco", K: 78, buraco: CIRC(.915), fora: CIRC(1.1),
    corpo() { const K = this.K; let o = "";
      for (const l of [1, -1]) {
        for (let i = 0; i < 16; i++) { const a = l * (166 - i * 7.6), dir = -l * 8.6; o += lente([K * .995, a], [K * 1.088, a + dir], 2.7, "m") + lente([K * 1.005, a], [K * .912, a + dir], 2.7, "m"); }
        o += L(`M${P(K, l * 166)} Q${P(K * 1.07, l * 174)} ${P(K * 1.18, l * -174 + (l > 0 ? 360 : 0))}`, 1.1);
        // barbas: dois grupos de 3 fios que nascem juntos na ponta do último grão (de fora e de dentro) e vão abrindo
        const ultimo = 166 - 15 * 7.6 - 8.6; // ângulo da ponta dos últimos grãos
        const barba = (r0, rFim, aFim) => { const a0 = ultimo + 1.2, n = 18; let d = "";
          for (let q = 0; q <= n; q++) { const t = q / n, e = 1 - (1 - t) * (1 - t), ang = a0 + (aFim - a0) * t, r = r0 + (rFim - r0) * e; d += `${q ? " L" : "M"}${P(K * r, l * ang)}`; }
          return `<path class="lm" ${W(.95)} stroke-linecap="round" fill="none" d="${d}"/>`; };
        [[1.104, 13.5], [1.079, 16], [1.054, 18.5]].forEach(([r, a], j) => { o += barba(1.086 + (j - 1) * .011, r, a); });
        [[1.012, 19.5], [.987, 22], [.962, 24.5]].forEach(([r, a], j) => { o += barba(.93 + (j - 1) * .011, r, a); });
      }
      return o; } },
  // ---------------- SIMPLES ----------------
  { id: "aro-liso", nome: "Aro Liso", grupo: "simples", paleta: "ouro", corpo: () => anel(70, 82, "m") + realce(76, 2.2) + circ(70.4, .8, "le") },
  { id: "aro-duplo", nome: "Aro Duplo", grupo: "simples", paleta: "prata", corpo: () => anel(70, 79, "m") + circ(84.5, 2.2) + realce(74.5, 1.8) },
  { id: "contas", nome: "Contas", grupo: "simples", paleta: "prata", corpo: () => anel(70, 86, "e") + circ(71, 2.4) + circ(85.5, 2.4) + repetir(40, 78.2, M.ponto(1.9)) },
  { id: "corda", nome: "Corda", grupo: "simples", paleta: "bronze", esmalte: "#24140c", corpo: (fo, id) => anel(70, 88, "e") + noAnel(id, "c", 72.6, 86.4, repetir(40, 79.5, `<path class="m" d="M-3.6,7.4 C-3.6,1 -1.4,-5 2.4,-8.2 C4.2,-9.6 5.6,-8.4 4.6,-5.6 C3,-.8 1.4,4.6 1.4,8.6 C1.4,10.6 -3.6,10.6 -3.6,7.4Z"/><path d="M-1.6,6.6 C-1.4,1.6 .4,-3.6 3,-6.8" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".8" stroke-linecap="round"/>`)) + anel(70, 72.6, "m") + anel(86.4, 89, "m") },
  { id: "serrilha", nome: "Serrilha", grupo: "simples", paleta: "prata", corpo: () => anel(70, 80, "m") + repetir(40, 79.5, M.triangulo(3.6, 1.9)) + realce(75, 1.6) },
  { id: "octogono", nome: "Octógono", grupo: "simples", paleta: "prata", forma: "octogono", corpo: fo => anel(70, 80, "m", fo) + contorno(fo, 86, 1.6) + repetir(8, 86 * 1.055, M.ponto(2.4), 22.5) },
  { id: "losango", nome: "Losango", grupo: "simples", paleta: "ouro", forma: "losango", corpo: fo => anel(70, 76, "m", fo) + contorno(fo, 81, 1.2) + repetir(4, 81 * 1.3, M.losango(3.4, 1.3)) },
  { id: "hexagono", nome: "Hexágono", grupo: "simples", paleta: "cobre", forma: "hexagono", corpo: fo => anel(70, 80, "m", fo) + contorno(fo, 85.5, 1.4) + repetir(6, 85.5 * 1.08, M.ponto(2.6), 30) },
  // ---------------- ART DÉCO ----------------
  { id: "grega", nome: "Grega", grupo: "artdeco", paleta: "ouro", esmalte: "#1a1426", corpo: () => anel(70, 92, "e") + anel(70, 72.4, "m") + anel(89.6, 92, "m") + padraoPolar(30, 74.2, 87.8, GREGA2, "lm\" style=\"stroke-width:1.55;stroke-linecap:square", false) },
  { id: "triangulos", nome: "Triângulos", grupo: "artdeco", paleta: "ouro", corpo: () => anel(70, 72.4, "m") + anel(88, 90.4, "m") + repetir(30, 72.4, M.triangulo(4.3, 3.6)) + repetir(30, 88, M.trianguloDentro(2.2, 2.6), 6) },
  { id: "sol-de-petalas", nome: "Sol de Pétalas", grupo: "artdeco", paleta: "ouro", corpo: () => repetir(16, 80, M.trapezio(7.2, 10.5, 16)) + repetir(16, 80, M.trapezio(3, 4.5, 15), 0) + anel(70, 81, "m") + realce(75.5, 1.8) + circ(70.5, .9, "le") },
  { id: "estrela-octogonal", nome: "Estrela Octogonal", grupo: "artdeco", paleta: "prata", atras: () => `<rect x="-78" y="-78" width="156" height="156" class="m"/><rect x="-78" y="-78" width="156" height="156" class="m" transform="rotate(45)"/><rect x="-74" y="-74" width="148" height="148" class="e"/><rect x="-74" y="-74" width="148" height="148" class="e" transform="rotate(45)"/>`, corpo: () => anel(70, 80, "m") + repetir(8, 86, M.ponto(2), 22.5) + realce(75, 1.6) },
  { id: "bussola-deco", nome: "Bússola Déco", grupo: "artdeco", paleta: "ouro", esmalte: "#2d3a1e", corpo: () => anel(70, 88, "e") + circ(71.2, 2.4) + circ(88, 3.2) + padraoPolar(40, 76, 84, [[[.5, 0], [.5, 1]]], "lm\" style=\"stroke-width:1.2", false, 4.5) + repetir(4, 88, M.bussola(7.5)) + repetir(4, 88, M.estrela4(3.2), 45) },
  { id: "segmentos", nome: "Segmentos", grupo: "artdeco", paleta: "ouro", corpo: () => [0, 90, 180, 270].map(a => arco(77, a + 8, a + 82, 4.4)).join("") + circ(85, 1.1) + circ(70.6, 1.1) + repetir(4, 77, M.bloco(7, 11)) + repetir(4, 85, M.losangoLinha(2.6, 1.4), 45) },
  { id: "prisma", nome: "Prisma", grupo: "artdeco", paleta: "ouro", corpo: () => `<polygon class="lm" style="stroke-width:2" points="${pts(poligono(4, 104))}"/><polygon class="lm" style="stroke-width:1" points="${pts(poligono(4, 96))}"/>` + anel(70, 76, "m") + circ(81, 1) + repetir(4, 81, M.losango(3.4, 1.4)) + repetir(4, 104, M.losangoLinha(3, 1.2)) + realce(73, 1.4) },
  { id: "leque", nome: "Leque", grupo: "artdeco", paleta: "ouro", corpo: () => anel(70, 77, "m") + circ(82.5, 1.4) + circ(86.5, .9) + repetir(4, 82, M.leque(12, 9)) + repetir(4, 84.5, M.losangoLinha(2.4, 1.4), 45) + realce(73.5, 1.5) },
  { id: "zigurate", nome: "Zigurate", grupo: "artdeco", paleta: "ouro", forma: "chanfro", corpo: fo => anel(70, 78, "m", fo) + contorno(fo, 84, 1.3) + repetir(4, 78.4, M.zigurate(7.5)) + repetir(4, 84 * 1.18, M.losangoLinha(2.6, 1.3), 45) },
  { id: "relicario", nome: "Relicário", grupo: "artdeco", paleta: "ouro", esmalte: "#1c1430", corpo: () => anel(70, 86, "e") + circ(70.8, 1.6) + circ(86, 2.4) + circ(78, .7) + padraoPolar(72, 80, 84.5, [[[.5, 0], [.5, 1]]], "lm\" style=\"stroke-width:.8") + repetir(8, 78, M.losango(4, 1.45)) + repetir(8, 92, M.estrela4(3.4), 22.5) },
  { id: "portal-deco", nome: "Portal Déco", grupo: "artdeco", paleta: "ouro", forma: "losango", corpo: fo => anel(70, 74, "m", fo) + contorno(fo, 79, 1) + contorno(fo, 83, 1.8) + `<circle r="88" class="lm" style="stroke-width:1"/>` + repetir(4, 83 * 1.3, M.losango(3.8, 1.2)) + repetir(4, 88, M.leque(9, 7), 45) },
  // ---------------- DETALHADAS ----------------
  { id: "louros", nome: "Louros", grupo: "detalhadas", paleta: "ouro", K: 82, buraco: CIRC(.885), fora: CIRC(1.11),
    corpo() { const K = this.K; let o = "";
      for (const l of [1, -1]) {
        const a0 = 170, a1 = 24, n = 17;
        o += l > 0 ? arco(K, a1, a0, 1.5) : arco(K, 360 - a0, 360 - a1, 1.5);
        for (let i = 0; i < n; i++) { const t = i / (n - 1), a = l * (a0 - i * (a0 - a1) / (n - 1)), esc = 1 - .42 * t * t, comp = 16 * esc, larg = 3.6 * esc, inc = -l * 11 * esc;
          o += lente([K * 1.005, a], [K * (1 + comp / K * .78), a + inc], larg, "m") + lente([K * .995, a], [K * (1 - comp / K * .78), a + inc], larg, "m"); }
        o += lente([K, l * a1], [K * 1.01, l * (a1 - 10)], 2.4, "m");
      }
      o += L(`M${P(K, 172)} L${P(K * 1.1, 186)} M${P(K, 188)} L${P(K * 1.1, 174)}`, 1.6) + `<g transform="translate(0 ${f(K)})">${M.losango(3.6, 1.35)}</g>`;
      o += `<g transform="translate(0 ${f(-K * 1.02)})">${M.gema(5.6)}</g>`;
      return o; } },
  { id: "flor-de-lis", nome: "Flor-de-lis", grupo: "detalhadas", paleta: "prata", corpo: () => anel(70, 76, "m") + circ(81, 1.6) + repetir(4, 75, M.flor(32), 45) + repetir(4, 81, M.losango(2.6, 1.4)) + realce(73, 1.4) },
  { id: "estrela-de-lancas", nome: "Estrela de Lanças", grupo: "detalhadas", paleta: "ouro", corpo: () => anel(70, 73.5, "m") + circ(79, 1.2) + circ(83, .8) + repetir(24, 81, M.estrela4(2.6, .2), 7.5) + repetir(4, 84, M.lanca(5.6, 30), 45) + repetir(4, 79, M.estrela4(8.5, .22)) + repetir(4, 79, M.losangoLinha(2.2, 1.2)) },
  { id: "coroa-solar", nome: "Coroa Solar", grupo: "detalhadas", paleta: "ouro", corpo: () => repetir(32, 80, i => i % 2 ? M.espinho(2.4, 11) : M.espinho(3.2, 20)) + anel(70, 81, "m") + circ(75.5, .9, "le") + repetir(4, 81, M.leque(10, 7)) + repetir(8, 75.5, M.ponto(1.6), 22.5) + realce(78, 1.4) },
  { id: "mandala", nome: "Mandala", grupo: "detalhadas", paleta: "arcano", esmalte: "#1c1030", corpo: () => repetir(12, 83, M.petala(6.5, 2.6)) + repetir(12, 83, M.petala(4, 1.7), 15) + anel(70, 84, "e") + circ(71, 2) + circ(84, 2) + repetir(24, 77.5, M.quadrado(2.2)) + repetir(12, 84, M.ponto(1.6), 15) },
  { id: "portal-arcano", nome: "Portal Arcano", grupo: "detalhadas", paleta: "arcano", esmalte: "#160c28", corpo: () => anel(70, 90, "e") + circ(71, 1.8) + circ(90, 2.4) + circ(80, .8) + padraoPolar(48, 82, 88, [[[.2, 0], [.5, 1], [.8, 0]]], "lm\" style=\"stroke-width:.9") + padraoPolar(48, 72.5, 78, [[[.5, 0], [.5, .6]], [[.3, 1], [.7, 1]]], "lm\" style=\"stroke-width:.8") + repetir(8, 80, M.estrela4(5.5, .22)) + repetir(4, 90, M.lanca(4.6, 18)) },
  { id: "espinhos", nome: "Espinhos", grupo: "detalhadas", paleta: "obsidiana", corpo: () => repetir(4, 80, `${M.chifre(11, 1)}${M.chifre(11, -1)}`, 45) + repetir(4, 80, M.espinho(5.5, 26)) + repetir(8, 80, M.espinho(2.6, 11), 22.5) + anel(70, 82, "m") + circ(76, .9, "le") + realce(78.5, 1.2) },
  { id: "selo-real", nome: "Selo Real", grupo: "detalhadas", paleta: "ouro", joia: ["#e0f0ff", "#3a6ad0", "#0a1a4a"], corpo: () => repetir(20, 86, `<circle r="6.2" class="m"/>`) + anel(70, 88, "m") + anel(76, 83, "e") + circ(79.5, .8) + repetir(4, 79.5, M.gema(4.2)) + repetir(16, 79.5, M.ponto(1.1), 11.25) + realce(73, 1.4) },
  { id: "engrenagem", nome: "Engrenagem", grupo: "detalhadas", paleta: "cobre", corpo: () => repetir(18, 84, `<polygon class="m" points="-6.6,4 6.6,4 4.6,-7 -4.6,-7"/>`) + anel(70, 86, "m") + anel(75, 81, "e") + repetir(18, 78, M.rebite(1.7), 10) + realce(83, 1.4) + circ(70.5, .9, "le") },
  { id: "neon-estelar", nome: "Neon Estelar", grupo: "detalhadas", paleta: "neon", neon: true, esmalte: "#03161c", corpo: () => circ(72, 2.6) + circ(79, 1.1) + circ(83.5, 1.6) + repetir(24, 81.2, M.estrela4(3, .2), 7.5) + repetir(4, 86, M.lanca(5, 28), 45) + repetir(8, 83.5, M.estrela4(7.5, .2)) + repetir(36, 90, M.ponto(.7), 5) }
];
/* Categorias da galeria (pela aparência). */
const CATEGORIAS = {
  essenciais: ["aro-liso", "aro-duplo", "contas", "corda", "serrilha", "octogono", "losango", "hexagono"],
  geometricas: ["picos-cardeais", "triangulos-encaixados", "dente-de-serra", "estrela-entrelacada", "triangulos", "segmentos", "prisma", "zigurate", "estrela-octogonal", "grega", "engrenagem"],
  elegantes: ["deco-placas", "deco-entalhe", "deco-partido", "deco-coroa", "deco-colchetes", "leque", "relicario", "portal-deco", "bussola-deco", "selo-real"],
  natureza: ["estrela-foliada", "trigo", "louros", "flor-de-lis", "espinhos", "sol-de-petalas", "coroa-solar"],
  arcanas: ["mandala", "portal-arcano", "neon-estelar", "estrela-de-lancas"]
};
for (const [g, ids] of Object.entries(CATEGORIAS)) for (const id of ids) { const m = NAUREN_MOLDURA_MODELOS.find(x => x.id === id); if (m) m.grupo = g; }
export const NAUREN_MOLDURA_GRUPOS = [["essenciais", "Essenciais"], ["geometricas", "Geométricas"], ["elegantes", "Elegantes"], ["natureza", "Natureza"], ["arcanas", "Arcanas"]];
const POR_ID = Object.fromEntries(NAUREN_MOLDURA_MODELOS.map(m => [m.id, m]));
const ANTIGOS = { hextech: "prisma" }; // nomes antigos de modelos (bordas já salvas continuam valendo)
export function naurenMolduraModelo(id) { return POR_ID[ANTIGOS[id] ?? id] ?? null; }
/** O modelo usa esmalte (cor entre as linhas) e/ou gemas? (para mostrar só os controles que mudam algo) */
const detalhes = new Map();
export function naurenMolduraDetalhes(id) {
  if (detalhes.has(id)) return detalhes.get(id);
  let r = { esmalte: false, joia: false };
  try { const svg = naurenMolduraSvg(naurenMolduraConfigPadrao(id), { px: 64, sombra: false, comAtras: true }) + (naurenMolduraTemAtras({ modelo: id }) ? naurenMolduraSvgAtras(naurenMolduraConfigPadrao(id), { px: 64 }) : ""); r = { esmalte: /class="(e|le)"|class="le\b|class="e\b/.test(svg), joia: /class="joia"/.test(svg) }; } catch (err) { /* sem detalhes */ }
  detalhes.set(id, r); return r;
}

/* ============================== configuração ============================== */
export const NAUREN_MOLDURA_EFEITOS = [
  { id: "aura", nome: "Aura", icone: "fa-sun", dica: "Brilho parado em volta da moldura.", cores: 1, anima: false, fora: true },
  { id: "pulso", nome: "Pulso", icone: "fa-heart-pulse", dica: "A moldura acende e apaga devagar.", cores: 1 },
  { id: "brilho", nome: "Brilho", icone: "fa-wand-magic-sparkles", dica: "Uma faixa de luz atravessa a moldura de tempos em tempos.", cores: 1 },
  { id: "ciclo", nome: "Ciclo de cores", icone: "fa-arrows-spin", dica: "O metal passa suavemente de uma cor para outra.", cores: 3 },
  { id: "cintilar", nome: "Cintilar", icone: "fa-star", dica: "Estrelinhas de luz aparecem e somem na moldura.", cores: 1, fora: true },
  { id: "respirar", nome: "Respirar", icone: "fa-circle-dot", dica: "A moldura cresce e encolhe de leve.", cores: 0 },
  { id: "arco", nome: "Arco-íris", icone: "fa-rainbow", dica: "As cores da moldura giram pelo arco-íris.", cores: 0 },
  { id: "neon", nome: "Neon", icone: "fa-bolt", dica: "Brilho forte de fora, com piscadas leves.", cores: 1, fora: true }
];
export const NAUREN_MOLDURA_VEL = ["Bem lento", "Lento", "Normal", "Rápido", "Bem rápido"];
const VEL = [0.45, 0.7, 1, 1.45, 2.1];
const corValida = c => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c.trim()) ? c.trim().toLowerCase() : null;
const num = (v, a, b, d) => { const n = Number(v); return Number.isFinite(n) ? Math.min(b, Math.max(a, n)) : d; };
export const NAUREN_MOLDURA_REACOES_PADRAO = Object.freeze({ dano: true, cura: true, vidaBaixa: true, morto: true, turno: true, disposicao: false, condicoes: true });

/** Configuração padrão de um modelo (quando o jogador escolhe ele na galeria). */
export function naurenMolduraConfigPadrao(modeloId) {
  const m = naurenMolduraModelo(modeloId);
  return {
    modelo: modeloId, paleta: m?.paleta ?? "ouro", cores: ["#e6bf5c"], esmalte: m?.esmalte ?? "#1a1426", joia: m?.joia?.[1] ?? "#d0306a",
    espessura: 1, escala: 1, mascara: m?.expandida && m?.fora ? "expandida" : "normal",
    girar: { modo: "nenhum", vel: 3, sentido: 1 }, efeitos: [], reacoes: { ...NAUREN_MOLDURA_REACOES_PADRAO },
    imagem: null
  };
}
/** Deixa a configuração da moldura com todos os campos e valores seguros. */
export function naurenMolduraNormalizar(c) {
  const base = naurenMolduraConfigPadrao(c?.modelo);
  const m = naurenMolduraModelo(c?.modelo);
  const o = { ...base, ...(c && typeof c === "object" ? c : {}) };
  o.modelo = m ? m.id : (c?.modelo === "imagem" ? "imagem" : base.modelo);
  o.paleta = o.paleta === "livre" || NAUREN_MOLDURA_PALETAS[o.paleta] ? o.paleta : base.paleta;
  o.cores = (Array.isArray(o.cores) ? o.cores.map(corValida).filter(Boolean) : []).slice(0, 2); if (!o.cores.length) o.cores = ["#e6bf5c"];
  o.esmalte = corValida(o.esmalte) ?? base.esmalte; o.joia = corValida(o.joia) ?? base.joia;
  o.espessura = num(o.espessura, .5, 2, 1); o.escala = num(o.escala, .8, 1.2, 1);
  o.mascara = o.mascara === "expandida" && (m?.fora || o.modelo === "imagem") ? "expandida" : "normal";
  o.girar = { modo: ["nenhum", "tudo"].includes(o.girar?.modo) ? o.girar.modo : "nenhum", vel: Math.round(num(o.girar?.vel, 1, 5, 3)), sentido: Number(o.girar?.sentido) === -1 ? -1 : 1 };
  const defs = Object.fromEntries(NAUREN_MOLDURA_EFEITOS.map(e => [e.id, e]));
  const lista = [];
  for (const e of Array.isArray(o.efeitos) ? o.efeitos : []) {
    const d = defs[e?.tipo]; if (!d || lista.some(x => x.tipo === d.id) || lista.length >= 2) continue;
    if ((d.id === "aura" || d.id === "neon") && lista.some(x => x.tipo === "aura" || x.tipo === "neon")) continue;
    let cores = (Array.isArray(e.cores) ? e.cores.map(corValida).filter(Boolean) : []).slice(0, 6);
    while (cores.length < d.cores) cores.push(["#ffffff", "#ff6a9a", "#7ad3ff"][cores.length] ?? "#ffffff");
    if (!d.cores) cores = [];
    lista.push({ tipo: d.id, cores, vel: Math.round(num(e.vel, 1, 5, 3)), int: Math.round(num(e.int, 10, 100, 70)), fora: d.fora ? !!e.fora : false });
  }
  o.efeitos = lista;
  o.reacoes = { ...NAUREN_MOLDURA_REACOES_PADRAO, ...(o.reacoes && typeof o.reacoes === "object" ? Object.fromEntries(Object.entries(o.reacoes).filter(([k]) => k in NAUREN_MOLDURA_REACOES_PADRAO).map(([k, v]) => [k, !!v])) : {}) };
  o.imagem = o.modelo === "imagem" ? {
    src: String(o.imagem?.src ?? "").trim(), tolerancia: Math.round(num(o.imagem?.tolerancia, 0, 100, 30)), rotacao: Math.round(num(o.imagem?.rotacao, -180, 180, 0)),
    recolorir: !!o.imagem?.recolorir, cor: corValida(o.imagem?.cor) ?? "#e6bf5c", forca: num(o.imagem?.forca, 0, 1, .8), tamanho: num(o.imagem?.tamanho, .6, 1.6, 1)
  } : null;
  return o;
}

/* ============================== geração do SVG ============================== */
function escalaDeTracos(html, esp) {
  if (Math.abs(esp - 1) < 0.001) return html;
  return html.replace(/stroke-width:([\d.]+)/g, (_, v) => `stroke-width:${f(Number(v) * esp)}`);
}
/**
 * SVG da moldura (só a moldura, sem a arte): viewBox centrado, "vb" unidades para cada lado.
 * opc: px (tamanho da imagem), vb (meia-largura em unidades, padrão 125), sombra (true), soBranco (silhueta
 * branca, para brilhos/pisca), branco (moldura em metal branco, para o Ciclo de cores tingir), semFiltro.
 */
export function naurenMolduraSvg(cfgIn, opc = {}) {
  const cfg = naurenMolduraNormalizar(cfgIn), m = naurenMolduraModelo(cfg.modelo);
  if (!m) return "";
  const id = ++uid, vb = opc.vb ?? 125, px = opc.px ?? 256;
  const p = opc.branco || opc.soBranco ? NAUREN_MOLDURA_PALETAS.branco.cores : naurenMolduraCoresDe(cfg);
  const esmalte = opc.soBranco ? "#ffffff" : cfg.esmalte, joia = cfg.joia;
  const joiaCores = opc.soBranco ? ["#fff", "#fff", "#fff"] : [misturar(joia, "#ffffff", .7), joia, misturar(joia, "#000000", .55)];
  const defs = `<linearGradient id="mt${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset=".28" stop-color="${p[1]}"/><stop offset=".55" stop-color="${p[2]}"/><stop offset=".78" stop-color="${p[4]}"/><stop offset="1" stop-color="${p[3]}"/></linearGradient>
    <linearGradient id="ml${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset=".5" stop-color="${p[1]}"/><stop offset="1" stop-color="${p[2]}"/></linearGradient>
    <radialGradient id="jo${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${joiaCores[0]}"/><stop offset=".5" stop-color="${joiaCores[1]}"/><stop offset="1" stop-color="${joiaCores[2]}"/></radialGradient>
    <filter id="sh${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.4" flood-color="#000" flood-opacity=".7"/></filter>
    <filter id="gl${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  const semSombra = opc.sombra === false || opc.soBranco || opc.semFiltro;
  const css = `<style>#q${id} .m, #q${id}b .m{fill:url(#mt${id});stroke:${m.neon || semSombra ? "none" : "rgba(10,6,14,.55)"};stroke-width:.45}
    #q${id} .lm{fill:none;stroke:url(#ml${id});stroke-linejoin:miter;stroke-linecap:butt}
    #q${id} .e, #q${id}b .e{fill:${esmalte}} #q${id} .le{fill:none;stroke:${esmalte}}
    #q${id} .joia{fill:url(#jo${id})} #q${id} .brilho{fill:#fff;opacity:${opc.soBranco ? 1 : .55}} #q${id} {--esc:${opc.soBranco ? "#fff" : p[3]}}</style>`;
  const forma = m.forma ?? "circulo";
  let corpo = escalaDeTracos(m.corpo.call(m, forma, id), cfg.espessura);
  let atras = m.atras && opc.comAtras !== false ? escalaDeTracos(m.atras.call(m, forma, id), cfg.espessura) : "";
  if (opc.soBranco) { corpo = corpo.replace(/stroke-opacity="[^"]*"/g, "").replace(/<([a-zA-Z]+)([^>]*?)\sstroke="#fff"([^>]*?)(\/?)>/g, (tudo, tag, a, b, fim) => /\sfill=/.test(a + b) ? tudo : `<${tag}${a} stroke="#fff" fill="none"${b}${fim}>`); }
  const filtro = semSombra ? "" : `filter="url(#${m.neon ? "gl" : "sh"}${id})"`;
  const esc = cfg.escala !== 1 ? ` transform="scale(${f(cfg.escala)})"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" viewBox="${-vb} ${-vb} ${2 * vb} ${2 * vb}" width="${px}" height="${px}"><defs>${defs}</defs>${css}<g${esc}>${atras ? `<g id="q${id}b" ${filtro}>${atras}</g>` : ""}<g id="q${id}" ${filtro}>${corpo}</g></g></svg>`;
}
/** A camada de trás (Estrela Octogonal) fica ATRÁS da arte: SVG só dela. */
export function naurenMolduraSvgAtras(cfgIn, opc = {}) {
  const cfg = naurenMolduraNormalizar(cfgIn), m = naurenMolduraModelo(cfg.modelo);
  if (!m?.atras) return "";
  const id = ++uid, vb = opc.vb ?? 125, px = opc.px ?? 256, p = naurenMolduraCoresDe(cfg);
  const css = `<style>#q${id}b .m{fill:url(#mt${id});stroke:rgba(10,6,14,.55);stroke-width:.45} #q${id}b .e{fill:${cfg.esmalte}}</style>`;
  const defs = `<linearGradient id="mt${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset=".28" stop-color="${p[1]}"/><stop offset=".55" stop-color="${p[2]}"/><stop offset=".78" stop-color="${p[4]}"/><stop offset="1" stop-color="${p[3]}"/></linearGradient><filter id="sh${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.4" flood-color="#000" flood-opacity=".7"/></filter>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-vb} ${-vb} ${2 * vb} ${2 * vb}" width="${px}" height="${px}"><defs>${defs}</defs>${css}<g${cfg.escala !== 1 ? ` transform="scale(${f(cfg.escala)})"` : ""}><g id="q${id}b" filter="url(#sh${id})">${escalaDeTracos(m.atras.call(m, m.forma ?? "circulo", id), cfg.espessura)}</g></g></svg>`;
}
export function naurenMolduraTemAtras(cfg) { return !!naurenMolduraModelo(cfg?.modelo)?.atras; }
/** Caminho SVG da máscara da arte (unidades da casa, já com a escala do modelo). */
export function naurenMolduraMascaraPath(cfgIn) {
  const cfg = naurenMolduraNormalizar(cfgIn), m = naurenMolduraModelo(cfg.modelo);
  if (!m) return circulo(R0);
  const K = m.K ?? 100;
  let d;
  if (cfg.mascara === "expandida" && m.fora) d = m.fora.call(m, K);
  else d = m.buraco ? m.buraco.call(m, K) : caminhoForma(m.forma ?? "circulo", R0);
  return cfg.escala !== 1 ? escalarPath(d, cfg.escala) : d;
}
/** Escala todos os números de um caminho SVG (só M/L/A/Z/Q/C com coordenadas absolutas, que é o que os modelos usam). */
function escalarPath(d, s) {
  return d.replace(/([MLQCTS])([^A-Za-z]+)|A([^A-Za-z]+)/g, (tudo, cmd, nums, arcNums) => {
    if (cmd) return cmd + nums.replace(/-?[\d.]+/g, n => f(Number(n) * s));
    // arco: rx ry rot grande sentido x y → escala rx, ry, x, y
    const partes = arcNums.trim().split(/[\s,]+/).map(Number);
    const out = [];
    for (let i = 0; i + 6 < partes.length + 1; i += 7) out.push(`${f(partes[i] * s)},${f(partes[i + 1] * s)} ${partes[i + 2]} ${partes[i + 3]} ${partes[i + 4]} ${f(partes[i + 5] * s)},${f(partes[i + 6] * s)}`);
    return "A" + out.join(" A");
  });
}
/** Raio máximo (em unidades da casa) de um caminho da máscara, por amostragem. */
export function naurenMolduraRaioDoPath(d) {
  let max = 0;
  for (const seg of String(d).match(/[A-Za-z][^A-Za-z]*/g) ?? []) {
    const cmd = seg[0], nums = (seg.slice(1).match(/-?[\d.]+/g) ?? []).map(Number);
    if (cmd === "A" || cmd === "a") { for (let i = 5; i + 1 < nums.length; i += 7) max = Math.max(max, Math.hypot(nums[i], nums[i + 1])); continue; }
    if (cmd === "Z" || cmd === "z") continue;
    // M/L/Q/C/T/S: os últimos 2 números de cada par são pontos do caminho (os de controle também contam, mas ficam perto)
    for (let i = 0; i + 1 < nums.length; i += 2) max = Math.max(max, Math.hypot(nums[i], nums[i + 1]));
  }
  return max || R0;
}

/* ============================== efeitos: estado num instante ============================== */
/**
 * Estado dos efeitos no instante t (segundos): função pura usada pela prévia 2D e pela camada do mapa.
 * Devolve { rotacao (rad), escala, auraCor, auraAlpha, pulso (0-1 de cor "cor"), brilho {pos 0-1 ou null, cor, int},
 *   hue (graus), ciclo {cor (hex misturado) ou null}, cintilar [{x,y (unidades -1..1 do raio), a, s}], flash {cor, e} }.
 * extra: { flash: {ini, cor, dur} (piscar de dano/cura), vidaBaixa, morto, turno, animar (false = tudo parado), leve }.
 */
export function naurenMolduraEstado(cfgIn, t, extra = {}) {
  const cfg = naurenMolduraNormalizar(cfgIn), animar = extra.animar !== false, leve = !!extra.leve;
  const s = { rotacao: 0, escala: 1, auraCor: null, auraAlpha: 0, auraFora: false, pulsoCor: null, pulsoAlpha: 0, brilho: null, hue: 0, cicloCor: null, cintilar: [], cintilarFora: false, flash: null, cinza: !!extra.morto };
  if (cfg.girar.modo === "tudo" && animar) s.rotacao = (t * VEL[cfg.girar.vel - 1] * 0.35 * cfg.girar.sentido) % TAU;
  for (const e of cfg.efeitos) {
    const v = VEL[e.vel - 1], i = e.int / 100, c = e.cores[0] ?? "#ffffff";
    switch (e.tipo) {
      case "aura": s.auraCor = c; s.auraAlpha = .35 + .65 * i; s.auraFora = !!e.fora; break;
      case "neon": s.auraCor = c; s.auraFora = !!e.fora; s.auraAlpha = (.55 + .45 * i) * (animar ? (1 - .12 * Math.abs(Math.sin(t * 9.1 * v)) * (Math.sin(t * 2.3) > .7 ? 1 : .25)) : 1); break;
      case "pulso": s.pulsoCor = c; s.pulsoAlpha = animar ? i * (.5 + .5 * Math.sin(t * 2.4 * v)) * .8 : i * .5; break;
      case "brilho": { if (!animar || leve) break; const per = 3.4 / v, fase = (t % per) / per; s.brilho = fase < .55 ? { pos: fase / .55, cor: c, int: i } : null; break; }
      case "ciclo": { const cs = e.cores, per = 2.4 / v, pos = animar ? (t / per) % cs.length : 0, k = Math.floor(pos), fr = pos - k; s.cicloCor = misturar(cs[k], cs[(k + 1) % cs.length], fr * fr * (3 - 2 * fr)); s.cicloInt = i; break; }
      case "cintilar": { if (leve || !animar) break; s.cintilarFora = !!e.fora; const n = Math.round(8 + 16 * i); for (let k = 0; k < n; k++) { const seed = k * 1.618 + .37; const per = (1.4 + (seed % 1) * 1.4) / v, ciclo = Math.floor((t + seed * 7.3) / per), fase = ((t + seed * 7.3) % per) / per; const a = Math.sin(Math.PI * fase); const ang = (seed * 2.399 + ciclo * 1.7) % TAU; s.cintilar.push({ ang, r: .8 + ((seed * 3.1 + ciclo * .618) % 1) * .3, a: Math.min(1, a * (.55 + .6 * i)), s: .75 + (seed % .5) + .4 * a, giro: (seed * 5 + t * .6) % TAU, cor: c }); } break; }
      case "respirar": if (animar) s.escala = 1 + .028 * (.5 + .5 * Math.sin(t * 1.6 * v)) * i; break;
      case "arco": if (!leve) s.hue = animar ? (t * 40 * v) % 360 : 0; break;
    }
  }
  if (extra.vidaBaixa && !extra.morto) { s.pulsoCor = extra.corVidaBaixa ?? "#ff2a2a"; s.pulsoAlpha = Math.max(s.pulsoAlpha, animar ? .25 + .45 * (.5 + .5 * Math.sin(t * 3.2)) : .5); }
  if (extra.turno && !extra.morto) { s.auraCor = extra.corTurno ?? s.auraCor ?? "#ffe28a"; s.auraAlpha = Math.max(s.auraAlpha, animar ? .55 + .3 * Math.sin(t * 3) : .7); }
  if (extra.flash) { const fr = (t - extra.flash.ini) / (extra.flash.dur ?? 1); if (fr >= 0 && fr < 1) s.flash = { cor: extra.flash.cor, e: (Math.sin(4 * Math.PI * fr - Math.PI / 2) + 1) / 2 }; }
  return s;
}
export const naurenMolduraMisturar = misturar;
/** A máscara é um círculo no centro? (então girar a moldura não muda o recorte) */
export function naurenMolduraMascaraCircular(cfg) {
  if (cfg?.modelo === "imagem") return false;
  return /^M0,-([\d.]+) A\1,\1 0 1 1 0,\1 A\1,\1 0 1 1 0,-\1Z$/.test(naurenMolduraMascaraPath({ ...cfg, escala: 1 }).trim());
}
/** A arte precisa girar o recorte junto com a moldura (máscara que não é círculo + moldura girando). */
export function naurenMolduraRecorteGira(cfg) { return cfg?.girar?.modo === "tudo" && !naurenMolduraMascaraCircular(cfg); }
export { circulo as naurenMolduraCirculo, R0 as NAUREN_MOLDURA_R0 };
