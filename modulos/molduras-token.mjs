/* Nauren RPG — Molduras de token no mapa (0.103).
 *
 * A borda padrão do Foundry (Dynamic Token Ring) continua em borda-token.mjs. Aqui ficam as molduras do
 * Nauren: cada token com modelo Nauren ganha uma camada própria no grupo primário do canvas
 * (PrimarySpriteMesh, mesma elevação/ordem/visibilidade da malha do token: telhados, andares e oculto
 * continuam valendo). A arte do token é recortada na forma da moldura pelo mesmo mecanismo da borda atual
 * (recorte gerado na tela e posto no cache de texturas com o endereço marcado "?nauren-borda=").
 *
 * Texturas: SVG do modelo → imagem → canvas → PIXI.BaseTexture, uma por (modelo + cores + tamanho),
 * compartilhada por todos os tokens iguais. Efeitos: um ticker só, que só anima o que está visível. */
import { naurenPisoCobre } from "./andares.mjs";
import { naurenRegistrarComandoDepuracao } from "./depuracao.mjs";
import { naurenMolduraSvg, naurenMolduraSvgAtras, naurenMolduraTemAtras, naurenMolduraMascaraPath, naurenMolduraRaioDoPath, naurenMolduraNormalizar, naurenMolduraEstado, naurenMolduraModelo, naurenMolduraMisturar, naurenMolduraRecorteGira } from "./molduras-modelos.mjs";
import { naurenBordaPintarTraco, naurenBordaConfig, naurenBordaCarregarImagem, naurenBordaTamanhoTextura, naurenBordaGerarFrente, naurenBordaTemFrente } from "./borda-token.mjs"; // (import circular: só usado em tempo de execução)

const TAM_MAX = 2048;
const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); };
export function naurenMolduraEhNauren(cfg) { return !!cfg?.ativa && !!cfg.modelo && cfg.modelo !== "foundry"; }
/** Lê a configuração da moldura (parte "moldura" da flag nauren.borda), já normalizada. */
export function naurenMolduraDe(cfg) { return naurenMolduraNormalizar({ ...(cfg?.moldura ?? {}), modelo: cfg?.modelo ?? cfg?.moldura?.modelo }); }

/* ============================== rasterização ============================== */
const imagensSvg = new Map(); // chave → Promise<HTMLCanvasElement>
function svgParaCanvas(svg, px) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    img.onload = () => { try { const c = document.createElement("canvas"); c.width = c.height = px; c.getContext("2d").drawImage(img, 0, 0, px, px); resolve(c); } catch (err) { reject(err); } finally { URL.revokeObjectURL(url); } };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("svg")); };
    img.src = url;
  });
}
/** Extensão da moldura: raio máximo em unidades da casa (medido uma vez por modelo/escala/espessura). */
const extensoes = new Map();
export async function naurenMolduraExtensao(m) {
  const chave = `${m.modelo}|${m.escala}|${m.espessura}`;
  if (extensoes.has(chave)) return extensoes.get(chave);
  let ext = 100;
  try {
    const N = 192, vb = 150, c = await svgParaCanvas(naurenMolduraSvg(m, { px: N, vb, soBranco: true, semFiltro: true }), N);
    const d = c.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, N, N).data;
    let max = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (d[(y * N + x) * 4 + 3] > 8) max = Math.max(max, Math.hypot(x + .5 - N / 2, y + .5 - N / 2));
    ext = Math.max(72, Math.ceil(max / (N / 2) * vb) + 2);
  } catch (err) { ext = Math.max(100, naurenMolduraRaioDoPath(naurenMolduraMascaraPath({ ...m, mascara: "expandida" })) + 4); }
  extensoes.set(chave, ext);
  return ext;
}
/** Mesma medida, síncrona (usa a última medição; se ainda não mediu, estima pelo caminho de fora e mede em segundo plano). */
export function naurenMolduraExtensaoSinc(m) {
  const chave = `${m.modelo}|${m.escala}|${m.espessura}`;
  if (extensoes.has(chave)) return extensoes.get(chave);
  naurenMolduraExtensao(m).catch(() => {});
  return Math.max(104, Math.ceil(naurenMolduraRaioDoPath(naurenMolduraMascaraPath({ ...m, mascara: "expandida" })) * 1.06) + 4);
}
/** Meia-largura (unidades) do quadro da textura da moldura: a extensão com folga para o brilho de fora. */
export function naurenMolduraVb(m, ext) { return Math.ceil((ext ?? naurenMolduraExtensaoSinc(m)) * 1.08) + 4; }

/** Imagens (canvas) da moldura, por tipo: moldura, silhueta, branco, atras, aura. */
export function naurenMolduraCanvas(m, tipo, px, vb) {
  const chave = `${tipo}|${px}|${vb}|${hash(JSON.stringify({ ...m, efeitos: undefined, reacoes: undefined, girar: undefined }))}`;
  if (imagensSvg.has(chave)) return imagensSvg.get(chave);
  let p;
  if (tipo === "aura") p = naurenMolduraCanvas(m, "silhueta", px, vb).then(sil => {
    const c = document.createElement("canvas"); c.width = c.height = px; const x = c.getContext("2d");
    const r = Math.max(2, px * .028);
    x.filter = `blur(${r}px)`; x.drawImage(sil, 0, 0); x.drawImage(sil, 0, 0); x.filter = "none";
    return c;
  });
  else if (tipo === "atras") p = furar(svgParaCanvas(naurenMolduraSvgAtras(m, { px, vb }), px), m, px, vb, true);
  else p = furar(svgParaCanvas(naurenMolduraSvg(m, { px, vb, soBranco: tipo === "silhueta", branco: tipo === "branco", comAtras: false }), px), m, px, vb, false);
  p.catch(() => imagensSvg.delete(chave));
  imagensSvg.set(chave, p);
  return p;
}
/**
 * 0.105.3: detalhes invisíveis de verdade. Esconder o esmalte/gema não basta: muitos modelos têm metal por baixo
 * deles, e o metal aparecia (e pegava a cor dos efeitos). Aqui o lugar do detalhe vira buraco em todas as imagens.
 */
const furos = new Map();
function moldeFuro(m, px, vb, atras) {
  const chave = `${atras ? "a" : "c"}|${px}|${vb}|${hash(JSON.stringify({ ...m, efeitos: undefined, reacoes: undefined, girar: undefined }))}`;
  if (!furos.has(chave)) {
    const pr = svgParaCanvas(naurenMolduraSvg(m, { px, vb, furo: true, soAtras: atras }), px).then(c => {
      const x = c.getContext("2d", { willReadFrequently: true }), d = x.getImageData(0, 0, px, px), v = d.data;
      for (let i = 0; i < v.length; i += 4) { const a = v[i] * v[i + 3] / 255; v[i] = v[i + 1] = v[i + 2] = 255; v[i + 3] = a; }
      x.putImageData(d, 0, 0); return c;
    });
    pr.catch(() => furos.delete(chave)); furos.set(chave, pr);
  }
  return furos.get(chave);
}
async function furar(prom, m, px, vb, atras) {
  const c = await prom;
  if (!m?.semEsmalte && !m?.semJoia) return c;
  try {
    const furo = await moldeFuro(m, px, vb, atras);
    const o = document.createElement("canvas"); o.width = o.height = px; const x = o.getContext("2d");
    x.drawImage(c, 0, 0); x.globalCompositeOperation = "destination-out"; x.drawImage(furo, 0, 0);
    return o;
  } catch (err) { return c; }
}
const tingidos = new Map();
/** Cópia de um canvas pintada de uma cor (mantém só o alfa). */
export function naurenMolduraTingir(fonte, cor) {
  const chave = `${cor}|${fonte.width}|${fonte._nid ??= Math.random().toString(36).slice(2)}`;
  if (tingidos.has(chave)) return tingidos.get(chave);
  const c = document.createElement("canvas"); c.width = fonte.width; c.height = fonte.height; const x = c.getContext("2d");
  x.drawImage(fonte, 0, 0); x.globalCompositeOperation = "source-in"; x.fillStyle = cor; x.fillRect(0, 0, c.width, c.height);
  if (tingidos.size > 200) tingidos.clear();
  tingidos.set(chave, c);
  return c;
}
let estrelaCanvas = null, faixaCanvas = null;
const vazios = new Map();
function vazio(px) { if (!vazios.has(px)) { const c = document.createElement("canvas"); c.width = c.height = px; vazios.set(px, c); } return vazios.get(px); }
function estrela() {
  if (estrelaCanvas) return estrelaCanvas;
  // estrela de 4 pontas com halo: bem visível mesmo pequena no mapa
  const N = 64, h = N / 2, c = document.createElement("canvas"); c.width = c.height = N; const x = c.getContext("2d");
  const g = x.createRadialGradient(h, h, 0, h, h, h); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.18, "rgba(255,255,255,.85)"); g.addColorStop(.45, "rgba(255,255,255,.25)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, N, N);
  x.fillStyle = "#fff"; x.beginPath(); x.moveTo(h, 0); x.quadraticCurveTo(h + 3, h - 3, N, h); x.quadraticCurveTo(h + 3, h + 3, h, N); x.quadraticCurveTo(h - 3, h + 3, 0, h); x.quadraticCurveTo(h - 3, h - 3, h, 0); x.fill();
  return estrelaCanvas = c;
}
function faixa() {
  if (faixaCanvas) return faixaCanvas;
  const c = document.createElement("canvas"); c.width = 256; c.height = 8; const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 256, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.5, "rgba(255,255,255,1)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 256, 8);
  return faixaCanvas = c;
}

/* ============================== imagem própria ============================== */
const processadas = new Map();
/**
 * Moldura por imagem: lê a transparência (ou a cor de fundo) e separa buraco, moldura e exterior por inundação.
 * Devolve { moldura, silhueta, mascaraNormal, mascaraExpandida (canvas N×N), raioBuraco (unidades), ext (unidades) }.
 */
export function naurenMolduraProcessarImagem(img, { tolerancia = 30, rotacao = 0, recolorir = false, cor = "#e6bf5c", forca = .8, tamanho = 1 } = {}) {
  const chave = `${img.src ?? img._nid}|${tolerancia}|${rotacao}|${recolorir}|${cor}|${forca}|${tamanho}`;
  if (processadas.has(chave)) return processadas.get(chave);
  const N = 512, c = document.createElement("canvas"); c.width = c.height = N; const x = c.getContext("2d", { willReadFrequently: true });
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, s = Math.min(N / iw, N / ih);
  x.save(); x.translate(N / 2, N / 2); x.rotate(rotacao * Math.PI / 180); x.drawImage(img, -iw * s / 2, -ih * s / 2, iw * s, ih * s); x.restore();
  const dados = x.getImageData(0, 0, N, N), d = dados.data;
  // tem transparência? senão, a cor de fundo é a do canto (ou do centro, se o canto for moldura)
  let opacos = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 200) opacos++;
  const semAlfa = opacos > N * N * .97;
  const canto = [d[0], d[1], d[2]], cen = ((N / 2) * N + N / 2) * 4, centro = [d[cen], d[cen + 1], d[cen + 2]];
  const tol = 20 + tolerancia * 1.6;
  const ehFundo = (i, ref) => semAlfa ? Math.hypot(d[i] - ref[0], d[i + 1] - ref[1], d[i + 2] - ref[2]) <= tol : d[i + 3] < 64;
  const inundar = (sementes, ref) => {
    const vis = new Uint8Array(N * N), fila = []; for (const [sx, sy] of sementes) { const k = sy * N + sx; if (!vis[k] && ehFundo(k * 4, ref)) { vis[k] = 1; fila.push(k); } }
    while (fila.length) { const k = fila.pop(), px = k % N, py = (k - px) / N;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = px + dx, ny = py + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const nk = ny * N + nx; if (vis[nk] || !ehFundo(nk * 4, ref)) continue; vis[nk] = 1; fila.push(nk); } }
    return vis;
  };
  const buraco = inundar([[N / 2, N / 2]], centro);
  const fora = inundar([[0, 0], [N - 1, 0], [0, N - 1], [N - 1, N - 1], [N / 2, 0], [0, N / 2], [N - 1, N / 2], [N / 2, N - 1]], canto);
  const mascara = (vis, inverterFora) => {
    const m = document.createElement("canvas"); m.width = m.height = N; const mx = m.getContext("2d"); const id = mx.createImageData(N, N), md = id.data;
    for (let k = 0; k < N * N; k++) { const dentro = inverterFora ? !fora[k] : !!vis[k]; md[k * 4] = md[k * 4 + 1] = md[k * 4 + 2] = 255; md[k * 4 + 3] = dentro ? 255 : 0; }
    mx.putImageData(id, 0, 0);
    // beirada suave de 1 px
    const m2 = document.createElement("canvas"); m2.width = m2.height = N; const x2 = m2.getContext("2d"); x2.filter = "blur(0.8px)"; x2.drawImage(m, 0, 0); return m2;
  };
  const mascaraNormal = mascara(buraco, false), mascaraExpandida = mascara(null, true);
  // moldura = o que não é exterior nem buraco
  const mol = document.createElement("canvas"); mol.width = mol.height = N; const mc = mol.getContext("2d"); const md = mc.createImageData(N, N);
  for (let k = 0; k < N * N; k++) { const i = k * 4, keep = !fora[k] && !buraco[k]; md.data[i] = d[i]; md.data[i + 1] = d[i + 1]; md.data[i + 2] = d[i + 2]; md.data[i + 3] = keep ? (semAlfa ? 255 : d[i + 3]) : 0; }
  mc.putImageData(md, 0, 0);
  if (recolorir) {
    const alfa = document.createElement("canvas"); alfa.width = alfa.height = N; const ax = alfa.getContext("2d"); const ida = ax.createImageData(N, N);
    for (let k = 0; k < N * N; k++) ida.data[k * 4 + 3] = (!fora[k] && !buraco[k]) ? (semAlfa ? 255 : d[k * 4 + 3]) : 0;
    ax.putImageData(ida, 0, 0);
    mc.globalCompositeOperation = "color"; mc.globalAlpha = forca; mc.fillStyle = cor; mc.fillRect(0, 0, N, N); mc.globalAlpha = 1;
    mc.globalCompositeOperation = "destination-in"; mc.drawImage(alfa, 0, 0); mc.globalCompositeOperation = "source-over";
  }
  const silhueta = naurenMolduraTingir(mol, "#ffffff");
  // raio do buraco (menor distância do centro a um pixel de moldura) e extensão (maior distância)
  let rMin = N / 2, rMax = 0;
  for (let k = 0; k < N * N; k++) { if (fora[k] || buraco[k]) continue; const px = k % N, py = (k - px) / N, r = Math.hypot(px + .5 - N / 2, py + .5 - N / 2); if (r < rMin) rMin = r; if (r > rMax) rMax = r; }
  const unid = 100 * tamanho / (N / 2); // a imagem cobre "tamanho" casas
  const res = { moldura: mol, silhueta, mascaraNormal, mascaraExpandida, raioBuraco: Math.max(20, rMin * unid), ext: Math.max(60, rMax * unid), N, semAlfa };
  if (processadas.size > 30) processadas.clear();
  processadas.set(chave, res);
  return res;
}

/* ============================== prévia 2D (editor e retrato) ============================== */
/**
 * Desenha a moldura Nauren (arte + moldura + efeitos) num canvas 2D. "cfg" é a configuração completa da
 * borda (src/x/y/zoom/mascara/moldura); "tex" é o cache de imagens já carregadas ({ moldura, silhueta,
 * branco, atras, aura, imagem }) obtido com naurenMolduraPrepararPrevia. Devolve false se faltar textura.
 */
export function naurenMolduraDesenharPrevia(cnv, img, cfg, tex, { t = 0, extra = {}, guias = true, fantasma = 0, desenharImagem = null, pintarTraco = null, fundo = "#0e0a14" } = {}) {
  const P = cnv.width, ctx = cnv.getContext("2d"), m = naurenMolduraDe(cfg);
  const vb = tex?.vb ?? naurenMolduraVb(m), k = P / (2 * vb);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, P, P);
  if (fundo) { ctx.fillStyle = fundo; ctx.fillRect(0, 0, P, P); }
  if (guias) { ctx.save(); ctx.setLineDash([5, 4]); ctx.lineWidth = 1; ctx.strokeStyle = "rgba(204,161,98,.6)"; const lado = 200 * k; ctx.strokeRect(P / 2 - lado / 2 + .5, P / 2 - lado / 2 + .5, lado - 1, lado - 1); ctx.restore(); }
  if (!tex?.moldura) { ctx.restore(); return false; }
  const est = naurenMolduraEstado(m, t, extra);
  const giro = (f) => { ctx.save(); ctx.translate(P / 2, P / 2); ctx.rotate(est.rotacao); ctx.scale(est.escala, est.escala); f(); ctx.restore(); };
  const desenhar = (c, alpha = 1, comp = "source-over") => { if (!c) return; ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = comp; ctx.drawImage(c, -P / 2, -P / 2, P, P); ctx.restore(); };
  const aura = () => { if (est.auraCor && est.auraAlpha > 0 && tex.aura) desenhar(naurenMolduraTingir(tex.aura, est.auraCor), est.auraAlpha, "lighter"); };
  const cintilar = () => { if (!est.cintilar.length) return; const ext = (tex.ext ?? 100) * k; for (const c of est.cintilar) { const r = c.r * ext, x = r * Math.sin(c.ang), y = -r * Math.cos(c.ang), sz = P * .085 * c.s; ctx.save(); ctx.globalAlpha = c.a; ctx.globalCompositeOperation = "lighter"; ctx.translate(x, y); ctx.rotate(c.giro ?? 0); ctx.drawImage(naurenMolduraTingir(estrela(), c.cor), -sz / 2, -sz / 2, sz, sz); ctx.restore(); } };
  // camada de trás (Estrela Octogonal) e os efeitos "só por fora" (ficam atrás da arte)
  if (tex.atras) giro(() => ctx.drawImage(tex.atras, -P / 2, -P / 2, P, P));
  if (est.auraFora) giro(aura);
  if (est.cintilarFora) giro(cintilar);
  // arte recortada (quadro próprio, para o pincel e a máscara; a máscara gira com a moldura)
  if (img && desenharImagem) {
    const a = document.createElement("canvas"); a.width = a.height = P; const ax = a.getContext("2d");
    if (fantasma > 0) { ctx.save(); ctx.globalAlpha = fantasma; desenharImagem(ctx, img, P, cfg); ctx.restore(); }
    desenharImagem(ax, img, P, cfg);
    ax.globalCompositeOperation = "destination-in";
    ax.drawImage(naurenMolduraMascaraCanvas(cfg, tex, P, pintarTraco, naurenMolduraRecorteGira(m) ? { rot: est.rotacao, escala: est.escala } : null), 0, 0);
    ctx.drawImage(a, 0, 0);
  }
  ctx.translate(P / 2, P / 2); ctx.rotate(est.rotacao); ctx.scale(est.escala, est.escala);
  if (!est.auraFora) aura();
  const filtros = []; if (est.hue) filtros.push(`hue-rotate(${Math.round(est.hue)}deg)`); if (est.cinza) filtros.push("grayscale(1) brightness(.65)");
  ctx.save(); if (filtros.length) ctx.filter = filtros.join(" ");
  if (est.cicloCor && tex.branco) { desenhar(tex.moldura); desenhar(naurenMolduraTingir(tex.branco, est.cicloCor), est.cicloInt ?? .8, "source-over"); }
  else desenhar(tex.moldura);
  ctx.restore();
  if (est.pulsoCor && est.pulsoAlpha > 0 && tex.silhueta) desenhar(naurenMolduraTingir(tex.silhueta, est.pulsoCor), est.pulsoAlpha, "lighter");
  if (est.flash && tex.silhueta) desenhar(naurenMolduraTingir(tex.silhueta, est.flash.cor), est.flash.e * .95, "lighter");
  if (est.brilho && tex.silhueta) {
    const b = document.createElement("canvas"); b.width = b.height = P; const bx = b.getContext("2d");
    bx.drawImage(tex.silhueta, 0, 0, P, P); bx.globalCompositeOperation = "source-in";
    bx.translate(P / 2, P / 2); bx.rotate(-.4); const pos = (est.brilho.pos * 2.4 - 1.2) * P;
    bx.drawImage(faixa(), pos - P * .22, -P, P * .44, 2 * P);
    desenhar(naurenMolduraTingir(b, est.brilho.cor), est.brilho.int, "lighter");
  }
  if (!est.cintilarFora) cintilar();
  ctx.restore();
  // 0.105.1: o que o pincel "Mostrar" pintou fica na frente da moldura (não gira nem respira com ela)
  if (img && desenharImagem && pintarTraco && cfg.pincelNaFrente !== false && (cfg.mascara ?? []).some(tr => tr.m === "mostrar")) {
    const fr = document.createElement("canvas"); fr.width = fr.height = P; const fx = fr.getContext("2d");
    const mk = document.createElement("canvas"); mk.width = mk.height = P; const mx = mk.getContext("2d");
    for (const tr of cfg.mascara) pintarTraco(mx, tr, P, cfg.arte);
    desenharImagem(fx, img, P, cfg); fx.globalCompositeOperation = "destination-in"; fx.drawImage(mk, 0, 0);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(fr, 0, 0); ctx.restore();
  }
  return true;
}
/** Máscara da arte como canvas P×P (caminho do modelo, ou raster da imagem própria) + traços do pincel. */
export function naurenMolduraMascaraCanvas(cfg, tex, P, pintarTraco = null, giro = null) {
  const m = naurenMolduraDe(cfg), vb = tex?.vb ?? naurenMolduraVb(m), k = P / (2 * vb);
  const c = document.createElement("canvas"); c.width = c.height = P; const x = c.getContext("2d");
  if (giro) { x.save(); x.translate(P / 2, P / 2); x.rotate(giro.rot || 0); x.scale(giro.escala || 1, giro.escala || 1); x.translate(-P / 2, -P / 2); }
  if (m.modelo === "imagem") {
    const r = tex?.imagem; if (r) { const mk = m.mascara === "expandida" ? r.mascaraExpandida : r.mascaraNormal; const lado = 200 * m.imagem.tamanho * k; x.drawImage(mk, P / 2 - lado / 2, P / 2 - lado / 2, lado, lado); }
    else { x.fillStyle = "#000"; x.beginPath(); x.arc(P / 2, P / 2, 70 * k, 0, Math.PI * 2); x.fill(); }
  } else {
    x.save(); x.translate(P / 2, P / 2); x.scale(k, k); x.fillStyle = "#000"; x.fill(new Path2D(naurenMolduraMascaraPath(m))); x.restore();
  }
  if (giro) x.restore();
  if (pintarTraco) for (const tr of cfg.mascara ?? []) pintarTraco(x, tr, P, cfg.arte);
  return c;
}
/** Carrega as imagens da moldura para a prévia/texturas: { moldura, silhueta, branco, atras, aura, imagem, vb, ext }. */
export async function naurenMolduraPrepararPrevia(cfg, px = 512, carregarImagem = null) {
  const m = naurenMolduraDe(cfg);
  if (m.modelo === "imagem") {
    if (!m.imagem?.src || !carregarImagem) return { vb: 125, ext: 100 };
    const img = await carregarImagem(m.imagem.src);
    const r = naurenMolduraProcessarImagem(img, m.imagem);
    const vb = Math.ceil(Math.max(r.ext, 100 * m.imagem.tamanho) * 1.08) + 4;
    const lado = Math.round(px * (200 * m.imagem.tamanho) / (2 * vb));
    const enq = c => { const o = document.createElement("canvas"); o.width = o.height = px; o.getContext("2d").drawImage(c, px / 2 - lado / 2, px / 2 - lado / 2, lado, lado); return o; };
    const moldura = enq(r.moldura), silhueta = enq(r.silhueta);
    const aura = (() => { const a = document.createElement("canvas"); a.width = a.height = px; const ax = a.getContext("2d"); ax.filter = `blur(${Math.max(2, px * .028)}px)`; ax.drawImage(silhueta, 0, 0); ax.drawImage(silhueta, 0, 0); return a; })();
    return { moldura, silhueta, branco: silhueta, aura, atras: null, imagem: r, vb, ext: r.ext, raioMascara: m.mascara === "expandida" ? r.ext : r.raioBuraco };
  }
  const ext = await naurenMolduraExtensao(m), vb = naurenMolduraVb(m, ext);
  const [moldura, silhueta, branco, aura, atras] = await Promise.all([
    naurenMolduraCanvas(m, "moldura", px, vb), naurenMolduraCanvas(m, "silhueta", px, vb),
    m.efeitos.some(e => e.tipo === "ciclo") ? naurenMolduraCanvas(m, "branco", px, vb) : null,
    naurenMolduraCanvas(m, "aura", px, vb), naurenMolduraTemAtras(m) ? naurenMolduraCanvas(m, "atras", px, vb) : null
  ]);
  return { moldura, silhueta, branco, aura, atras, imagem: null, vb, ext, raioMascara: naurenMolduraRaioDoPath(naurenMolduraMascaraPath(m)) };
}

/* ============================== camada no mapa (PIXI) ============================== */
// Chave = o objeto Token (não o id): o clone de arrastar tem o mesmo id do token e não pode trocar a camada dele.
const camadas = new Map(); // Token → NaurenMolduraCamada
const texturasPixi = new Map(); // chave → PIXI.Texture
function texturaDe(canvas, chave) {
  let t = texturasPixi.get(chave);
  if (t && !t.baseTexture?.destroyed && t.valid) return t;
  t = PIXI.Texture.from(canvas); texturasPixi.set(chave, t);
  return t;
}
function opcoes() {
  let animar = true, leve = false;
  try { animar = game.settings.get("nauren", "moldurasAnimadas") !== false; leve = game.settings.get("nauren", "moldurasQualidade") === "leve"; } catch (err) { /* padrão */ }
  return { animar, leve };
}
export class NaurenMolduraCamada {
  constructor(token) { this.token = token; this.mesh = null; this.atras = null; this.fundo = null; this.fx = {}; this.cfg = null; this.m = null; this.tex = null; this.flash = null; this.estado = {}; this.pronta = false; }
  get viva() { return !!this.mesh && !this.mesh.destroyed && !this.token.destroyed; }
  /** Monta (ou remonta) a camada para a configuração atual do token. */
  async montar() {
    const token = this.token, doc = token.document, seq = (this.seq = (this.seq ?? 0) + 1);
    const cfg = naurenBordaConfigDoToken(doc);
    if (!naurenMolduraEhNauren(cfg) || !canvas?.primary) { this.destruirMalhas(); return false; }
    const m = naurenMolduraDe(cfg); this.cfg = cfg; this.m = m;
    const casa = canvas.dimensions?.size ?? 100, tam = Math.min(Number(doc.width) || 1, Number(doc.height) || 1);
    const px = Math.min(TAM_MAX, Math.max(512, Math.pow(2, Math.ceil(Math.log2(casa * tam * 2.6 * (window.devicePixelRatio || 1))))));
    let tex;
    try { tex = await naurenMolduraPrepararPrevia(cfg, px, m.modelo === "imagem" ? carregarImagemHttp : null); } catch (err) { console.warn("Nauren RPG | Moldura do token: textura", err); return false; }
    if (seq !== this.seq) return false; // veio outra montagem depois desta: ela é que vale
    if (!tex?.moldura || token.destroyed) { this.destruirMalhas(); return false; }
    this.destruirMalhas();
    this.tex = tex;
    const chaveBase = `${hash(JSON.stringify({ ...m, efeitos: undefined, reacoes: undefined, girar: undefined }))}|${px}`;
    const PSM = foundry.canvas.primary.PrimarySpriteMesh, nomeTok = token.objectId ?? `Token.${token.id}`;
    const mesh = new PSM({ name: `${nomeTok}.moldura`, object: token, texture: texturaDe(tex.moldura, `${chaveBase}|moldura`) });
    mesh.anchor.set(.5, .5); mesh.eventMode = "none";
    this.mesh = mesh; this.guardarAndar(mesh);
    if (tex.atras) { const a = new PSM({ name: `${nomeTok}.moldura.atras`, object: token, texture: texturaDe(tex.atras, `${chaveBase}|atras`) }); a.anchor.set(.5, .5); a.eventMode = "none"; this.atras = a; this.guardarAndar(a); }
    // camada de trás para os efeitos "só por fora" (aura/cintilar atrás da arte do token): textura vazia do mesmo tamanho
    const fundo = new PSM({ name: `${nomeTok}.moldura.fundo`, object: token, texture: texturaDe(vazio(px), `vazio|${px}`) }); fundo.anchor.set(.5, .5); fundo.eventMode = "none"; this.fundo = fundo; this.guardarAndar(fundo);
    // efeitos (filhos da malha: herdam posição, escala e rotação)
    const sil = texturaDe(tex.silhueta, `${chaveBase}|sil`);
    const novo = (textura, blend = "add", pai = mesh) => { const s = new PIXI.Sprite(textura); s.anchor.set(.5); s.blendMode = PIXI.BLEND_MODES[blend.toUpperCase()] ?? PIXI.BLEND_MODES.ADD; s.visible = false; pai.addChild(s); return s; };
    this.fx.aura = novo(texturaDe(tex.aura, `${chaveBase}|aura`));
    this.fx.pulso = novo(sil); this.fx.flash = novo(sil);
    if (tex.branco) { this.fx.ciclo = novo(texturaDe(tex.branco, `${chaveBase}|branco`), "normal"); }
    this.fx.brilho = novo(texturaDe(faixa(), "faixa")); this.fx.brilho.width = px * .44; this.fx.brilho.height = px * 2; this.fx.brilho.rotation = -.4;
    this.fx.brilhoMascara = new PIXI.Sprite(sil); this.fx.brilhoMascara.anchor.set(.5); this.fx.brilhoMascara.renderable = false; mesh.addChild(this.fx.brilhoMascara); this.fx.brilho.mask = this.fx.brilhoMascara;
    this.fx.cintilar = new PIXI.Container(); mesh.addChild(this.fx.cintilar);
    this.px = px; this.ext = tex.ext;
    // recorte que gira junto com a moldura: máscara (filha da moldura) aplicada na arte do token
    this.montarMascaraGiro(cfg, tex, px);
    this.inserir();
    this.sincronizar();
    this.montarFrente(seq).catch(err => console.warn("Nauren RPG | Moldura do token: pincel na frente", err));
    this.pronta = true;
    camadas.set(token, this);
    this.pedirAtualizacao = true; this.ultimoParado = false;
    ligarTicker();
    return true;
  }
  /** 0.105.1: o que o pincel "Mostrar" pintou, numa malha por cima da moldura (fica parada quando a moldura gira). */
  async montarFrente(seq) {
    this.tirarFrente();
    const token = this.token, doc = token.document;
    let cfgN; try { cfgN = naurenBordaConfig(doc); } catch (err) { return; }
    if (!naurenBordaTemFrente(cfgN) || !cfgN.src) return;
    const img = await naurenBordaCarregarImagem(cfgN.src).catch(() => null);
    if (!img || seq !== this.seq || !this.mesh || token.destroyed) return;
    const cnv = naurenBordaGerarFrente(img, naurenBordaTamanhoTextura(doc, cfgN.arte), cfgN); if (!cnv) return;
    const tex = PIXI.Texture.from(cnv);
    const PSM = foundry.canvas.primary.PrimarySpriteMesh;
    const f = new PSM({ name: `${token.objectId ?? `Token.${token.id}`}.moldura.frente`, object: token, texture: tex });
    f.anchor.set(.5, .5); f.eventMode = "none";
    this.frente = f; this.frenteTex = tex; this.guardarAndar(f);
    const prim = canvas.primary, j = prim.children.indexOf(this.mesh);
    if (j >= 0) prim.addChildAt(f, j + 1); else prim.addChild(f);
    prim.sortDirty = true;
    this.sincronizar();
  }
  tirarFrente() {
    try { if (this.frente && !this.frente.destroyed) { this.frente.parent?.removeChild(this.frente); this.frente.destroy(); } } catch (err) { /* já foi */ }
    try { this.frenteTex?.destroy(true); } catch (err) { /* ok */ }
    this.frente = this.frenteTex = null;
  }
  /** Máscara da arte que gira com a moldura (só quando o recorte não é um círculo e a moldura gira). */
  montarMascaraGiro(cfg, tex, px) {
    this.tirarMascaraGiro();
    if (!naurenMolduraRecorteGira(this.m)) return;
    try {
      const forma = naurenMolduraTingir(naurenMolduraMascaraCanvas({ ...cfg, mascara: [] }, tex, px), "#ffffff"); // máscara do PIXI lê o vermelho: branca
      const tForma = PIXI.Texture.from(forma);
      const mostrar = (cfg.mascara ?? []).filter(t => t.m === "mostrar");
      const esp = new PIXI.Sprite(tForma); esp.anchor.set(.5); esp.renderable = false; esp.width = esp.height = px;
      this.mesh.addChild(esp); this.mascaraGiro = { sprite: esp, texturas: [tForma] };
      if (mostrar.length) {
        // forma + traços "mostrar" (fixos na arte): compostos numa textura a cada quadro, girando os traços ao contrário
        const tr = document.createElement("canvas"); tr.width = tr.height = px; const x = tr.getContext("2d");
        for (const t of mostrar) naurenBordaPintarTraco(x, t, px, cfg.arte);
        const tTr = PIXI.Texture.from(naurenMolduraTingir(tr, "#ffffff")), rt = PIXI.RenderTexture.create({ width: px, height: px });
        const cont = new PIXI.Container(), sF = new PIXI.Sprite(tForma), sT = new PIXI.Sprite(tTr);
        for (const q of [sF, sT]) { q.anchor.set(.5); q.position.set(px / 2, px / 2); cont.addChild(q); }
        esp.texture = rt; Object.assign(this.mascaraGiro, { rt, cont, tracos: sT, texturas: [tForma, tTr] });
      }
      const tm = this.token.mesh; if (tm) { this.mascaraGiro.dono = tm; tm.mask = esp; }
      this.atualizarMascaraGiro();
    } catch (err) { console.warn("Nauren RPG | Moldura do token: máscara girando", err); this.tirarMascaraGiro(); }
  }
  atualizarMascaraGiro() {
    const g = this.mascaraGiro; if (!g) return;
    const tm = this.token.mesh; if (tm && tm.mask !== g.sprite) { tm.mask = g.sprite; g.dono = tm; }
    if (g.rt && canvas.app?.renderer) { g.tracos.rotation = -(this.estado?.rotacao ?? 0); const e = this.estado?.escala ?? 1; g.tracos.scale.set(1 / e); canvas.app.renderer.render(g.cont, { renderTexture: g.rt, clear: true }); }
  }
  tirarMascaraGiro() {
    const g = this.mascaraGiro; if (!g) return;
    try { if (g.dono && !g.dono.destroyed && g.dono.mask === g.sprite) g.dono.mask = null; } catch (err) { /* ok */ }
    try { g.cont?.destroy({ children: true }); g.rt?.destroy(true); for (const t of g.texturas ?? []) t.destroy(true); } catch (err) { /* ok */ }
    this.mascaraGiro = null;
  }
  inserir() {
    const prim = canvas.primary, tm = this.token.mesh;
    for (const s of [this.fundo, this.atras]) { if (!s) continue; const i = prim.children.indexOf(tm); if (i >= 0) prim.addChildAt(s, i); else prim.addChild(s); }
    const j = prim.children.indexOf(tm);
    if (j >= 0) prim.addChildAt(this.mesh, j + 1); else prim.addChild(this.mesh);
    prim.sortDirty = true;
    this.montarVazio();
  }
  /**
   * 0.105.2: o Foundry "fura" a camada da interface (realce das Regiões, grade destacada…) no formato da arte do
   * token (Token#voidMesh). A moldura também precisa furar, senão as Regiões aparecem por cima dela e não da arte.
   */
  montarVazio() {
    const token = this.token; if (!token || token.destroyed || this.vazio || typeof token.addChild !== "function") return;
    const v = new PIXI.Container(); v.eventMode = "none"; v.updateTransform = () => {};
    v.render = renderer => { if (!this.arteDesenhada()) return; for (const s of [this.atras, this.mesh, this.frente]) { try { if (s && !s.destroyed && s._renderVoid) s._renderVoid(renderer); } catch (err) { /* segue */ } } };
    const i = token.voidMesh && token.children ? token.children.indexOf(token.voidMesh) : -1;
    if (i >= 0) token.addChildAt(v, i + 1); else token.addChild(v);
    this.vazio = v;
  }
  /**
   * 0.108.1 — andares (Levels do V14). Token de outro andar: o Foundry decide, a cada quadro, se a arte aparece
   * (pelo buraco do piso, pela escada…) ou não. Em vez de esconder a moldura de vez, ela segue a arte: só é desenhada
   * no quadro em que a arte do token também foi. No andar que se está vendo, nada muda.
   */
  arteDesenhada() {
    if (!this.outroAndar) return true;
    const tm = this.token?.mesh;
    if (!tm || tm.destroyed || quadroAtual - (tm._naurenDesenhou ?? -9) > 1) return false;
    // 0.109.13: no V14 a arte do token de baixo é desenhada e o piso de cima a recorta no shader; a moldura não passa
    // por esse recorte. Então confere o piso: se um andar de cima cobre o centro do token, a moldura não aparece.
    if (this._pisoQuadro !== quadroAtual) { this._pisoQuadro = quadroAtual; this._pisoCobre = naurenPisoCobre(tm, this.token); }
    return !this._pisoCobre;
  }
  guardarAndar(s) {
    if (!s || s._naurenGuarda) return;
    const camada = this, orig = s.render;
    s.render = function (renderer) { if (!camada.arteDesenhada()) return; return orig.call(this, renderer); };
    s._naurenGuarda = true;
  }
  /** Copia posição, tamanho, ordem e visibilidade da malha do token (chamado no refreshToken). */
  sincronizar() {
    if (!this.viva) return;
    const token = this.token, tm = token.mesh, doc = token.document;
    if (!tm) return;
    const casa = canvas.dimensions?.size ?? 100, tam = Math.min(Number(doc.width) || 1, Number(doc.height) || 1);
    const lado = casa * tam * (2 * this.tex.vb) / 200;
    const est = this.estado?.escala ?? 1;
    // Token de outro andar (Levels do V14): a moldura e os efeitos só são desenhados quando a arte é (ver arteDesenhada).
    const vendo = canvas.level?.id, andar = doc.level?.id ?? doc.level;
    this.outroAndar = !!(vendo && andar && andar !== vendo);
    espiarArte(tm);
    const vis = tm.visible;
    for (const s of [this.mesh, this.atras, this.fundo]) {
      if (!s) continue;
      s.position.set(tm.position.x, tm.position.y);
      s.width = s.height = lado * est;
      s.elevation = tm.elevation; s.sort = tm.sort; s.sortLayer = tm.sortLayer; s.zIndex = tm.zIndex;
      s.alpha = tm.alpha; s.hidden = tm.hidden; s.visible = vis; s.renderable = tm.renderable;
      s.occludedAlpha = tm.occludedAlpha; s.unoccludedAlpha = tm.unoccludedAlpha; s.hoverFade = tm.hoverFade;
      if (tm.occlusionMode !== undefined) s.occlusionMode = tm.occlusionMode;
      if (tm._occludedBySameElevationSurfaces !== undefined) s._occludedBySameElevationSurfaces = tm._occludedBySameElevationSurfaces;
      if (tm.occluded !== undefined) s.occluded = tm.occluded;
      s.rotation = this.estado?.rotacao ?? 0;
    }
    const f = this.frente;
    if (f && !f.destroyed) {
      // a arte do token cobre o mesmo quadro da moldura (arte = vb/100 casas); acompanha o token (giro e espelho dele), não a moldura
      f.position.set(tm.position.x, tm.position.y); f.width = f.height = lado;
      if (tm.scale.x < 0) f.scale.x = -Math.abs(f.scale.x); if (tm.scale.y < 0) f.scale.y = -Math.abs(f.scale.y);
      f.rotation = tm.rotation;
      f.elevation = tm.elevation; f.sort = tm.sort; f.sortLayer = tm.sortLayer; f.zIndex = tm.zIndex;
      f.alpha = tm.alpha; f.hidden = tm.hidden; f.visible = vis && this.mesh?.visible !== false; f.renderable = tm.renderable;
      f.occludedAlpha = tm.occludedAlpha; f.unoccludedAlpha = tm.unoccludedAlpha; f.hoverFade = tm.hoverFade;
    }
    this.lado = lado;
    this.pedirAtualizacao = true;
  }
  /** Estado do ator que muda a moldura: vida baixa, morto, turno. */
  lerSituacao() {
    const a = this.token.actor, r = this.m?.reacoes ?? {}, s = {};
    const vida = a?.system?.vida;
    if (vida && Number.isFinite(Number(vida.value))) { const max = Math.max(1, Number(vida.max) || 1), v = Number(vida.value) || 0; s.morto = r.morto && v <= 0; s.vidaBaixa = r.vidaBaixa && !s.morto && v / max <= .25; }
    if (r.turno && game.combat?.started) { const c = game.combat.combatant; s.turno = !!c && (c.tokenId === this.token.id || (c.actorId && c.actorId === a?.id && !c.tokenId)); }
    if (r.disposicao) { const d = this.token.document.disposition; s.corTurno = d === 1 ? "#5ad46a" : d === -1 ? "#ff4040" : d === 0 ? "#ffd84a" : "#a0a0ff"; }
    if (r.condicoes && a) { for (const it of a.items) { if (it.type !== "condicao" || it.system?.ativo === false) continue; const c = it.system?.molduraCor; if (c && /^#[0-9a-f]{6}$/i.test(c)) { s.auraCondicao = c; break; } } }
    return s;
  }
  /** Um quadro de animação. t em segundos. */
  tick(t, { animar, leve }) {
    if (!this.viva || !this.mesh.visible) return;
    const sit = this.sit ?? (this.sit = this.lerSituacao());
    const extra = { animar, leve, flash: this.flash, vidaBaixa: sit.vidaBaixa, morto: sit.morto, turno: sit.turno, corTurno: sit.corTurno };
    const mCfg = sit.auraCondicao ? { ...this.m, efeitos: [{ tipo: "aura", cores: [sit.auraCondicao], vel: 3, int: 80 }, ...this.m.efeitos.filter(e => e.tipo !== "aura" && e.tipo !== "neon").slice(0, 1)] } : this.m;
    const est = naurenMolduraEstado(mCfg, t, extra);
    const parado = !animar && !this.flash && !sit.vidaBaixa && !sit.turno;
    if (parado && this.ultimoParado && !this.pedirAtualizacao) return;
    this.ultimoParado = parado; this.pedirAtualizacao = false;
    this.estado = est;
    if (this.flash && t - this.flash.ini >= (this.flash.dur ?? 1)) this.flash = null;
    const mesh = this.mesh, lado = this.lado ?? mesh.width, px = this.px;
    mesh.rotation = est.rotacao; mesh.width = mesh.height = lado * est.escala;
    for (const s of [this.atras, this.fundo]) if (s) { s.rotation = est.rotacao; s.width = s.height = lado * est.escala; }
    const fx = this.fx, cor = c => PIXI.utils.string2hex(c);
    // efeitos "só por fora": vão para a camada de trás da arte
    const lugar = (s, fora) => { const pai = fora && this.fundo ? this.fundo : mesh; if (s && s.parent !== pai) pai.addChildAt(s, pai === mesh ? 0 : pai.children.length); };
    lugar(fx.aura, est.auraFora); lugar(fx.cintilar, est.cintilarFora);
    this.atualizarMascaraGiro();
    const liga = (s, on, tint, alpha) => { if (!s) return; s.visible = on && alpha > 0.005; if (!s.visible) return; if (tint != null) s.tint = cor(tint); s.alpha = alpha; s.width = s.height = px; };
    liga(fx.aura, !!est.auraCor, est.auraCor, est.auraAlpha);
    liga(fx.pulso, !!est.pulsoCor, est.pulsoCor, est.pulsoAlpha);
    liga(fx.flash, !!est.flash, est.flash?.cor, est.flash ? est.flash.e * .95 : 0);
    if (fx.ciclo) liga(fx.ciclo, !!est.cicloCor, est.cicloCor, est.cicloCor ? (est.cicloInt ?? .8) : 0);
    if (fx.brilho) { fx.brilho.visible = !!est.brilho; if (est.brilho) { fx.brilho.tint = cor(est.brilho.cor); fx.brilho.alpha = est.brilho.int; fx.brilho.position.set((est.brilho.pos * 2.4 - 1.2) * px * Math.cos(.4), -(est.brilho.pos * 2.4 - 1.2) * px * Math.sin(.4)); fx.brilho.width = px * .44; fx.brilho.height = px * 2; fx.brilhoMascara.width = fx.brilhoMascara.height = px; } }
    if (fx.cintilar) {
      const lista = est.cintilar, cont = fx.cintilar;
      while (cont.children.length < lista.length) { const s = new PIXI.Sprite(texturaDe(estrela(), "estrela")); s.anchor.set(.5); s.blendMode = PIXI.BLEND_MODES.ADD; cont.addChild(s); }
      cont.children.forEach((s, i) => { const c = lista[i]; if (!c) { s.visible = false; return; } s.visible = c.a > .01; const r = c.r * (this.ext / this.tex.vb) * px / 2; s.position.set(r * Math.sin(c.ang), -r * Math.cos(c.ang)); s.width = s.height = px * .085 * c.s; s.rotation = c.giro ?? 0; s.alpha = c.a; s.tint = cor(c.cor); });
    }
    // filtros (matiz do arco-íris, cinza do morto): só quando precisa
    const quer = (est.hue && !leve) || est.cinza;
    if (quer) {
      if (!this.filtro) { this.filtro = new PIXI.ColorMatrixFilter(); mesh.filters = [this.filtro]; }
      this.filtro.reset(); if (est.cinza) { this.filtro.desaturate(); this.filtro.brightness(.62, true); } if (est.hue) this.filtro.hue(est.hue, true);
    } else if (this.filtro) { mesh.filters = null; this.filtro = null; }
  }
  piscar(cor, dur = 1) { this.flash = { ini: performance.now() / 1000, cor, dur }; this.pedirAtualizacao = true; }
  invalidarSituacao() { this.sit = null; this.pedirAtualizacao = true; }
  destruirMalhas() {
    this.tirarMascaraGiro(); this.tirarFrente();
    try { if (this.vazio && !this.vazio.destroyed) { this.vazio.parent?.removeChild(this.vazio); this.vazio.destroy(); } } catch (err) { /* já foi */ }
    this.vazio = null;
    for (const s of [this.mesh, this.atras, this.fundo]) { try { if (s && !s.destroyed) { s.parent?.removeChild(s); s.destroy({ children: true }); } } catch (err) { /* já foi */ } }
    this.mesh = this.atras = this.fundo = null; this.fx = {}; this.filtro = null; this.pronta = false;
  }
  destruir() { this.destruirMalhas(); if (camadas.get(this.token) === this) camadas.delete(this.token); }
}
async function carregarImagemHttp(src) {
  return new Promise((resolve, reject) => { const img = new Image(); img.crossOrigin = "anonymous"; img.onload = () => resolve(img); img.onerror = () => reject(new Error("imagem")); img.src = src; });
}
/** Configuração da borda gravada no token (mesma flag da borda do Foundry: nauren.borda). */
export function naurenBordaConfigDoToken(doc) { const f = doc?.getFlag?.("nauren", "borda") ?? doc?.flags?.nauren?.borda ?? null; return f ? { ...f } : null; }
export function naurenMolduraCamadaDe(token) { return (token && camadas.get(token)) ?? null; }
/** Cria/atualiza a camada do token (chamado no drawToken e quando a flag muda). */
export async function naurenMolduraAnexar(token) {
  if (!token?.document || !canvas?.primary) return;
  const cfg = naurenBordaConfigDoToken(token.document);
  let camada = camadas.get(token);
  if (!naurenMolduraEhNauren(cfg)) { if (camada) camada.destruir(); return; }
  if (!camada) { camada = new NaurenMolduraCamada(token); camadas.set(token, camada); }
  await camada.montar().catch(err => console.warn("Nauren RPG | Moldura do token", err));
}
export function naurenMolduraSincronizar(token) { const c = token && camadas.get(token); if (!c) return; if (c.mascaraGiro && token.mesh && c.mascaraGiro.dono !== token.mesh) c.atualizarMascaraGiro(); c.sincronizar(); }
export function naurenMolduraRemover(token) { (token && camadas.get(token))?.destruir(); }
/**
 * 0.109.22: moldura que ficou na tela sem o token (o token trocou de andar e o Foundry desenhou outro no lugar):
 * apaga. Também apaga malhas de moldura soltas no canvas que não pertencem a nenhuma moldura viva. Devolve quantas.
 */
export function naurenMolduraLimparOrfas() {
  let n = 0;
  try {
    for (const [tok, c] of [...camadas]) {
      const vivo = tok && !tok.destroyed && canvas?.tokens?.get?.(tok.id) === tok;
      if (!vivo) { c.destruir(); n++; }
    }
    const vivas = new Set();
    for (const c of camadas.values()) for (const m of [c.mesh, c.atras, c.fundo, c.frente]) if (m) vivas.add(m);
    for (const m of [...(canvas?.primary?.children ?? [])]) {
      if (!/\.moldura(\.|$)/.test(m?.name ?? "") || vivas.has(m)) continue;
      try { m.parent?.removeChild(m); m.destroy({ children: true }); n++; } catch (err) { /* já foi */ }
    }
  } catch (err) { console.warn("Nauren RPG | Moldura do token: limpeza", err); }
  return n;
}
export function naurenMolduraPiscar(token, cor) { const c = token && camadas.get(token); if (!c?.viva) return false; c.piscar(cor); return true; }
export function naurenMolduraInvalidar(token) { (token && camadas.get(token))?.invalidarSituacao(); }
export function naurenMolduraTodas() { return [...camadas.values()]; }
let tickerLigado = false;
// Contador de quadros (sobe antes do desenho, prioridade alta) e o "espião" que marca o quadro em que a arte do token
// foi desenhada de verdade (passou por visível, renderizável, recorte e corte de andar do Foundry).
let quadroAtual = 0;
function contarQuadro() { quadroAtual++; }
function espiarArte(tm) {
  if (!tm || tm._naurenEspiao || typeof tm._render !== "function") return;
  const orig = tm._render;
  tm._render = function (renderer) { this._naurenDesenhou = quadroAtual; return orig.call(this, renderer); };
  tm._naurenEspiao = true;
}
function ligarTicker() {
  if (tickerLigado || !canvas?.app?.ticker) return;
  canvas.app.ticker.remove(contarQuadro); canvas.app.ticker.remove(naurenMolduraTick);
  canvas.app.ticker.add(contarQuadro, null, PIXI.UPDATE_PRIORITY?.HIGH ?? 25);
  canvas.app.ticker.add(naurenMolduraTick); tickerLigado = true;
}
let ultimoTick = 0;
export function naurenMolduraTick() {
  if (!camadas.size) return;
  const agora = performance.now(); if (agora - ultimoTick < 16) return; ultimoTick = agora;
  const t = agora / 1000, o = opcoes();
  // só o que está na tela
  const tela = canvas.app?.renderer?.screen, st = canvas.stage;
  for (const c of camadas.values()) {
    if (!c.viva || !c.pronta) continue;
    if (tela && st && c.mesh.visible) {
      const p = st.worldTransform.apply(c.mesh.position), margem = (c.lado ?? 200) * st.scale.x;
      if (p.x < -margem || p.y < -margem || p.x > tela.width + margem || p.y > tela.height + margem) continue;
    }
    try { c.tick(t, o); } catch (err) { console.warn("Nauren RPG | Moldura do token: efeito", err); c.pronta = false; }
  }
}
export function naurenMolduraLimparTudo() { for (const c of [...camadas.values()]) c.destruirMalhas(); camadas.clear(); for (const t of texturasPixi.values()) { try { t.destroy(true); } catch (err) { /* ok */ } } texturasPixi.clear(); tickerLigado = false; }
/** 0.109.22: diagnóstico das molduras (F12): naurenDiagnosticoMolduras(). Só com o Modo de depuração ligado. */
naurenRegistrarComandoDepuracao("naurenDiagnosticoMolduras", function () {
  const linhas = [...camadas].map(([tok, c]) => ({
    token: tok?.name, id: tok?.id, tokenDestruido: !!tok?.destroyed, tokenNoCanvas: canvas?.tokens?.get?.(tok?.id) === tok,
    andar: tok?.document?.level?.id ?? tok?.document?.level ?? "", x: Math.round(c.mesh?.x ?? 0), y: Math.round(c.mesh?.y ?? 0)
  }));
  console.log(`Molduras vivas (${linhas.length}):`); console.table(linhas);
  const soltas = (canvas?.primary?.children ?? []).filter(m => /\.moldura(\.|$)/.test(m?.name ?? "")).map(m => ({ nome: m.name, x: Math.round(m.x), y: Math.round(m.y), visivel: !!m.visible }));
  console.log(`Malhas de moldura no canvas (${soltas.length}):`); console.table(soltas);
  console.log("Órfãs apagadas agora:", naurenMolduraLimparOrfas());
});
/** Ganchos do canvas. Chamado uma vez no init. */
export function naurenMoldurasHooks() {
  Hooks.on("drawToken", token => { naurenMolduraAnexar(token); });
  Hooks.on("refreshToken", token => { naurenMolduraSincronizar(token); });
  Hooks.on("destroyToken", token => { naurenMolduraRemover(token); });
  Hooks.on("deleteToken", () => setTimeout(naurenMolduraLimparOrfas, 0));
  Hooks.on("updateToken", (doc, changes) => {
    if (!("level" in (changes ?? {}))) return;
    for (const ms of [50, 600]) setTimeout(naurenMolduraLimparOrfas, ms); // depois de o Foundry redesenhar o token
  });
  Hooks.on("updateToken", (doc, changes) => {
    const tok = doc.object; if (!tok) return;
    const mudouBorda = changes.flags?.nauren && "borda" in changes.flags.nauren;
    if (mudouBorda || changes.texture !== undefined || changes.width !== undefined || changes.height !== undefined) naurenMolduraAnexar(tok);
    else if (changes.hidden !== undefined || changes.disposition !== undefined) naurenMolduraInvalidar(tok);
  });
  Hooks.on("updateActor", actor => { for (const t of actor.getActiveTokens?.(true, false) ?? []) naurenMolduraInvalidar(t); });
  Hooks.on("createItem", it => { if (it.parent?.documentName === "Actor") for (const t of it.parent.getActiveTokens?.(true, false) ?? []) naurenMolduraInvalidar(t); });
  Hooks.on("deleteItem", it => { if (it.parent?.documentName === "Actor") for (const t of it.parent.getActiveTokens?.(true, false) ?? []) naurenMolduraInvalidar(t); });
  Hooks.on("updateItem", it => { if (it.parent?.documentName === "Actor" && it.type === "condicao") for (const t of it.parent.getActiveTokens?.(true, false) ?? []) naurenMolduraInvalidar(t); });
  for (const h of ["updateCombat", "combatTurn", "combatRound", "deleteCombat", "combatStart"]) Hooks.on(h, () => { for (const c of camadas.values()) c.invalidarSituacao(); });
  Hooks.on("canvasTearDown", () => naurenMolduraLimparTudo());
  Hooks.on("canvasReady", () => { ligarTicker(); setTimeout(naurenMolduraLimparOrfas, 0); });
}
export function naurenMoldurasInit() {
  game.settings.register("nauren", "moldurasAnimadas", { name: "Molduras dos tokens: animações", hint: "Liga os efeitos animados das molduras dos tokens (girar, pulso, brilho…). Desligado, as molduras ficam paradas. Vale só para você.", scope: "client", config: true, type: Boolean, default: true, onChange: () => { for (const c of camadas.values()) c.pedirAtualizacao = true; } });
  game.settings.register("nauren", "moldurasQualidade", { name: "Molduras dos tokens: qualidade", hint: "Alta usa filtros e partículas (arco-íris, cintilar, brilho). Leve usa só as animações baratas (girar, pulso, respirar). Vale só para você.", scope: "client", config: true, type: String, choices: { alta: "Alta", leve: "Leve" }, default: "alta", onChange: () => { for (const c of camadas.values()) c.pedirAtualizacao = true; } });
}
export { naurenMolduraMisturar, naurenMolduraModelo };
