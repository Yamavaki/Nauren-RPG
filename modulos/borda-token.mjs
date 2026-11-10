/* Nauren RPG — Borda do token (Dynamic Token Ring). Separado do nauren.mjs na 0.94.31. */
import { naurenCardMovimento, naurenConsumirUsoDaHabilidade, naurenDepoisDoMovimento, naurenEhCondicaoModelo, naurenEhItem, naurenHud, naurenHudAnimacoesLigadas, naurenJanelaMovimento, naurenModoMovimento, naurenMoverSemMovimento, naurenMovimentoEmCombate, naurenMovimentoSaldo, naurenTemEstado, naurenTokensDeslocando, naurenUsoDisponivel } from "../nauren.mjs";
/* ======================================================================
 * Borda do token (Dynamic Token Ring do Foundry)
 * ----------------------------------------------------------------------
 * O jogador (ou o Mestre) escolhe uma imagem (arquivo do servidor ou link),
 * enquadra, escolhe as cores e os efeitos. Tudo vai para os campos nativos
 * do token (ring.enabled, ring.colors, ring.effects, ring.subject) — a borda
 * desenhada é a do próprio Foundry (Configurações > "Borda Dinâmica do Token").
 * O Foundry desenha a imagem do sujeito POR CIMA da borda e não a recorta, então
 * a imagem quadrada é recortada no círculo de 2/3 do quadro (onde a borda começa).
 * Nada é enviado ao servidor: o token guarda a imagem ORIGINAL + o enquadramento
 * (endereço marcado "?nauren-borda=<código>") e cada tela gera o recorte e o põe
 * no cache de texturas do Foundry (PIXI.Assets) antes de desenhar o token
 * (NaurenToken#_draw). A borda pisca na cor do dano / da cura quando a Vida muda
 * (TokenRing#flashColor, a mesma animação do Foundry).
 * ==================================================================== */
import { naurenMolduraNormalizar, naurenMolduraMascaraPath, naurenMolduraRaioDoPath, naurenMolduraRecorteGira } from "./molduras-modelos.mjs";
import { naurenMolduraVb, naurenMolduraProcessarImagem, naurenMolduraPiscar, naurenMolduraDesenharPrevia, naurenMolduraPrepararPrevia, naurenMolduraEhNauren } from "./molduras-token.mjs";
const NAUREN_BORDA_PADRAO = Object.freeze({
  ativa: false, src: "", x: 50, y: 50, zoom: 1, recorte: "redondo",
  corBorda: "#cca162", corFundo: "#1b1729", corDano: "#ff2a2a", corCura: "#3ddc6a",
  efeitos: [], escala: 1,
  arte: 1,       // tamanho da arte em casas (1 = a casa; 1,3 = passa 30% da casa)
  borda: 1,      // tamanho da borda em casas (1 = encosta na casa)
  cores: null,   // cores da borda (1 a 5); com 2+ a borda vira gradiente (e com 3+ as cores vão passando)
  pincelNaFrente: true, // 0.105.1: o que o pincel "Mostrar" pintou fica na frente da moldura Nauren
  mascara: [],   // traços do pincel: { m: "mostrar"|"esconder", d: "duro"|"suave", r, p: [x,y,...] } em casas a partir do centro
  pedra: null,   // cor da moldura (a parte cinza da borda): { colorir, cor, forca, matiz, saturacao, brilho, contraste }
  modelo: "foundry", // "foundry" = borda dinâmica do Foundry; id de um modelo Nauren ou "imagem" = moldura do Nauren (0.103)
  moldura: null  // opções da moldura Nauren (ver molduras-modelos.mjs: paleta, cores, máscara, efeitos, reações, vb/ext/raio medidos)
});
const NAUREN_BORDA_PEDRA_PADRAO = Object.freeze({ colorir: false, cor: "#b0703a", forca: 0.8, matiz: 0, saturacao: 1, brilho: 1, contraste: 1 });
/** Ajustes da moldura, já limpos. */
function naurenBordaPedraConfig(p) {
  const o = { ...NAUREN_BORDA_PEDRA_PADRAO, ...(p && typeof p === "object" ? p : {}) };
  const lim = (v, a, b, d) => { const n = Number(v); return Number.isFinite(n) ? Math.max(a, Math.min(b, n)) : d; };
  return {
    colorir: !!o.colorir, cor: /^#[0-9a-f]{6}$/i.test(String(o.cor)) ? o.cor : NAUREN_BORDA_PEDRA_PADRAO.cor,
    forca: lim(o.forca, 0, 1, 0.8), matiz: Math.round(lim(o.matiz, -180, 180, 0)),
    saturacao: lim(o.saturacao, 0, 2, 1), brilho: lim(o.brilho, 0.3, 2, 1), contraste: lim(o.contraste, 0.5, 2, 1)
  };
}
/** Moldura sem nenhum ajuste (fica a do próprio Foundry). */
function naurenBordaPedraNeutra(p) {
  if (!p) return true;
  return !p.colorir && p.matiz === 0 && Math.abs(p.saturacao - 1) < 0.005 && Math.abs(p.brilho - 1) < 0.005 && Math.abs(p.contraste - 1) < 0.005;
}
// Efeitos oferecidos na janela → bit do TokenRing.effects do Foundry.
const NAUREN_BORDA_EFEITOS = {
  pulso: { bit: "RING_PULSE", rotulo: "Pulsar a borda", dica: "A cor da borda acende e apaga devagar." },
  gradiente: { bit: "RING_GRADIENT", rotulo: "Gradiente na borda", dica: "A cor da borda gira, misturando com a cor do fundo." },
  onda: { bit: "BKG_WAVE", rotulo: "Onda no fundo", dica: "Ondas de brilho correm no fundo atrás da imagem. Só aparece onde a imagem não cobre (imagem sem fundo ou zoom menor que 1)." },
  corSobre: { bit: "COLOR_OVER_SUBJECT", rotulo: "Cor sobre a imagem", dica: "A faixa colorida da borda fica por cima da imagem." }
};
const NAUREN_BORDA_BITS_RESERVA = { ENABLED: 1, RING_PULSE: 2, RING_GRADIENT: 4, BKG_WAVE: 8, INVISIBILITY: 16, COLOR_OVER_SUBJECT: 32 };
// A borda do Foundry começa a 2/3 do quadro (TokenRing: espessura do sujeito 0.6666;
// faixa de cor 0.666–0.7225 na borda de aço): a imagem ocupa exatamente esse círculo.
const NAUREN_BORDA_DIAMETRO = 2 / 3;
const NAUREN_BORDA_FOLGA = 1;
const NAUREN_BORDA_MARCA = "nauren-borda=";

function naurenBordaBits() {
  const E = foundry.canvas?.placeables?.tokens?.TokenRing?.effects ?? foundry.canvas?.tokens?.TokenRing?.effects;
  return E && typeof E.RING_PULSE === "number" ? E : NAUREN_BORDA_BITS_RESERVA;
}

/** Configuração completa (padrão + o que estiver salvo no token ou na ficha). */
function naurenBordaConfig(origem) {
  const salvo = origem?.getFlag?.("nauren", "borda") ?? origem?.flags?.nauren?.borda ?? {};
  const cfg = { ...NAUREN_BORDA_PADRAO, ...salvo };
  cfg.efeitos = Array.isArray(salvo.efeitos) ? salvo.efeitos.filter(e => NAUREN_BORDA_EFEITOS[e]) : [...NAUREN_BORDA_PADRAO.efeitos];
  for (const k of ["x", "y"]) cfg[k] = Math.max(0, Math.min(100, Number(cfg[k]) || 0));
  cfg.zoom = Math.max(0.5, Math.min(4, Number(cfg.zoom) || 1));
  cfg.escala = Math.max(0.5, Math.min(6, Number(cfg.escala) || 1));
  cfg.arte = Math.max(1, Math.min(1.6, Number(cfg.arte) || 1));
  cfg.borda = Math.max(0.5, Math.min(1, Number(cfg.borda) || 1));
  cfg.mascara = Array.isArray(salvo.mascara) ? salvo.mascara.filter(t => t && Array.isArray(t.p) && t.p.length >= 2).map(t => ({
    m: t.m === "esconder" ? "esconder" : "mostrar", d: t.d === "suave" ? "suave" : "duro",
    r: Math.max(0.005, Math.min(0.5, Number(t.r) || 0.05)), p: t.p.map(Number).filter(Number.isFinite),
    s: Math.max(0, Math.min(1, Number(t.s ?? 0.55)))
  })) : [];
  cfg.pincelNaFrente = salvo.pincelNaFrente !== false;
  const hexOk = c => /^#[0-9a-f]{6}$/i.test(String(c ?? ""));
  cfg.cores = (Array.isArray(salvo.cores) ? salvo.cores.filter(hexOk) : []).slice(0, 5);
  if (!cfg.cores.length) cfg.cores = [hexOk(cfg.corBorda) ? cfg.corBorda : NAUREN_BORDA_PADRAO.corBorda];
  cfg.corBorda = cfg.cores[0];
  if (cfg.recorte !== "livre") cfg.recorte = "redondo";
  cfg.pedra = naurenBordaPedraConfig(salvo.pedra);
  // 0.103: moldura Nauren
  cfg.modelo = typeof salvo.modelo === "string" && salvo.modelo ? salvo.modelo : "foundry";
  if (cfg.modelo !== "foundry") {
    const m = naurenMolduraNormalizar({ ...(salvo.moldura ?? {}), modelo: cfg.modelo });
    const med = salvo.moldura ?? {};
    m.vb = Math.max(80, Math.min(260, Number(med.vb) || naurenMolduraVb(m)));
    m.ext = Math.max(60, Math.min(240, Number(med.ext) || m.vb / 1.08));
    m.raio = Math.max(20, Math.min(240, Number(med.raio) || (m.modelo === "imagem" ? 70 : naurenMolduraRaioDoPath(naurenMolduraMascaraPath(m)))));
    cfg.moldura = m;
    cfg.recorte = "redondo";
    cfg.arte = m.vb / 100; // a textura do token cobre o quadro inteiro da moldura
    cfg.escala = 1; cfg.borda = m.ext / 100;
  } else cfg.moldura = null;
  return cfg;
}

/** Link de página do Imgur (imgur.com/abc) vira o link direto da imagem (i.imgur.com/abc.png). */
function naurenBordaLinkDireto(src) {
  const s = String(src ?? "").trim();
  const m = s.match(/^https?:\/\/(?:www\.|m\.)?imgur\.com\/([A-Za-z0-9]{5,10})(?:[?#].*)?$/);
  return m ? `https://i.imgur.com/${m[1]}.png` : s;
}
/** O Foundry só aceita como imagem de token um endereço que termine numa extensão de imagem. */
function naurenBordaLinkValido(src) {
  return /\.(png|jpe?g|webp|gif|avif|svg|bmp|tiff?)(\?.*)?$/i.test(String(src ?? "").trim());
}

/** Explica por que um link não abre (o site não libera a imagem para outros sites). */
function naurenTextoLinkBloqueado(link) {
  const externo = /^https?:\/\//i.test(String(link ?? "")) && !String(link).startsWith(window.location.origin);
  if (!externo) return "Não consegui abrir esta imagem. Confira se o arquivo existe no servidor.";
  let site = ""; try { site = new URL(link).hostname.replace(/^www\./, ""); } catch (err) { site = ""; }
  return `O site ${site || "deste link"} não deixa outros sites usarem a imagem, então nem o Foundry consegue mostrá-la no mapa (acontece com Pinterest, Google Imagens e outros). Use um link do Imgur, ou salve a imagem no computador e envie pela pasta (precisa da permissão "Enviar arquivos").`;
}
/** Testa se um link de imagem pode ser usado no mapa; se não puder, avisa (sem bloquear o uso na ficha). */
async function naurenAvisarSeLinkBloqueado(link, uso = "token") {
  const s = String(link ?? "").trim();
  if (!/^https?:\/\//i.test(s) || s.startsWith(window.location.origin)) return true;
  try { await naurenBordaCarregarImagem(s); return true; }
  catch (err) {
    ui.notifications?.warn(uso === "retrato"
      ? `${naurenTextoLinkBloqueado(s)} Na ficha a imagem aparece, mas como token não.`
      : naurenTextoLinkBloqueado(s), { permanent: false });
    return false;
  }
}

/** Código curto do enquadramento (muda quando a imagem ou o enquadramento mudam). */
function naurenBordaCodigo(cfg) {
  const texto = [cfg.src, cfg.x.toFixed(1), cfg.y.toFixed(1), cfg.zoom.toFixed(3), cfg.recorte, Number(cfg.escala || 1).toFixed(3),
    Number(cfg.arte || 1).toFixed(3), Number(cfg.borda || 1).toFixed(3), JSON.stringify(cfg.mascara ?? []),
    ...(cfg.modelo && cfg.modelo !== "foundry" ? [cfg.modelo, cfg.moldura?.mascara, cfg.moldura?.escala, cfg.moldura?.vb, cfg.moldura?.raio, JSON.stringify(cfg.moldura?.imagem ?? null), naurenMolduraRecorteGira(cfg.moldura) ? `gira${cfg.moldura?.ext}` : ""] : []),
    // a moldura colorida vai dentro do recorte: entra no código (e o tamanho da borda junto)
    ...(naurenBordaPedraNeutra(cfg.pedra) ? [] : [JSON.stringify(cfg.pedra), Number(cfg.tamGrade) || 1])].join("|");
  // (as cores não entram: mudar cor não precisa refazer o recorte)
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
/** Endereço gravado em ring.subject.texture: a imagem original + o marcador do recorte. */
function naurenBordaChave(cfg) {
  const base = String(cfg.src).replace(/([?&])nauren-borda=[^&]*&?/, "$1").replace(/[?&]$/, "");
  return `${base}${base.includes("?") ? "&" : "?"}${NAUREN_BORDA_MARCA}${naurenBordaCodigo(cfg)}`;
}
function naurenBordaEhChave(src) { return String(src ?? "").includes(NAUREN_BORDA_MARCA); }

/** Carrega a imagem pronta para o canvas (com CORS: links que o Foundry consegue mostrar, ele também recorta). */
const naurenBordaImagens = new Map();
function naurenBordaCarregarImagem(src) {
  const chave = String(src ?? "").trim();
  if (!chave) return Promise.reject(new Error("sem imagem"));
  if (naurenBordaImagens.has(chave)) return naurenBordaImagens.get(chave);
  const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => (img.naturalWidth > 0 ? resolve(img) : reject(new Error("imagem vazia")));
    img.onerror = () => reject(new Error("não carregou"));
    img.src = chave;
  });
  p.catch(() => naurenBordaImagens.delete(chave));
  naurenBordaImagens.set(chave, p);
  return p;
}

/**
 * Desenha a imagem enquadrada num quadro S×S: "cobre" o círculo de diâmetro 2/3 de S
 * (como object-fit: cover), com zoom e posição (x, y em %, como object-position).
 * Recorte "redondo": tudo fora do círculo fica transparente.
 */
/**
 * Geometria (tudo em relação ao quadro S da imagem do sujeito, que cobre "arte" casas):
 * - escala = Correção de Escala do Foundry (ring.subject.scale) = arte × raio da borda / borda;
 * - o círculo de dentro da borda tem diâmetro (2/3)/escala do quadro;
 * - a imagem "cobre" um quadrado de (2/3)/(escala × borda) do quadro (o mesmo tamanho em casas
 *   qualquer que seja a arte ou a borda), com zoom e posição (x, y em %, como object-position).
 */
function naurenBordaDiametro(S, cfg) {
  if (cfg?.moldura && cfg.modelo !== "foundry") return S * cfg.moldura.raio / cfg.moldura.vb;
  const e = Math.max(0.5, Number(cfg?.escala) || 1);
  return Math.min(S, S * NAUREN_BORDA_DIAMETRO / e * (cfg?.recorte === "redondo" ? NAUREN_BORDA_FOLGA : 1));
}
function naurenBordaCaixaImagem(S, cfg) {
  if (cfg?.moldura && cfg.modelo !== "foundry") return S * cfg.moldura.raio / cfg.moldura.vb; // a arte cobre o quadro da máscara
  const e = Math.max(0.5, Number(cfg?.escala) || 1), b = Math.max(0.3, Number(cfg?.borda) || 1);
  return S * NAUREN_BORDA_DIAMETRO / (e * b);
}
/** Desenha a imagem enquadrada (sem recorte) no quadro S. */
function naurenBordaDesenharImagem(ctx, img, S, cfg) {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const B = naurenBordaCaixaImagem(S, cfg);
  const esc = Math.max(B / iw, B / ih) * cfg.zoom;
  const dw = iw * esc, dh = ih * esc;
  const left = S / 2 - B / 2 + (B - dw) * cfg.x / 100;
  const top = S / 2 - B / 2 + (B - dh) * cfg.y / 100;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, left, top, dw, dh);
}
/**
 * Pinta um traço do pincel na máscara. Os pontos e o raio ficam em "casas" a partir do centro
 * (assim o desenho não muda quando a arte ou a borda mudam de tamanho).
 * Pincel duro = círculos cheios; suave = círculos com a borda esfumada.
 */
function naurenBordaPintarTraco(ctx, traco, S, arte) {
  const casa = S / Math.max(1, Number(arte) || 1);
  const r = Math.max(0.5, (Number(traco.r) || 0.05) * casa);
  const pts = traco.p ?? [];
  if (pts.length < 2) return;
  const suav = Math.max(0.05, Math.min(1, Number(traco.s ?? 0.55)));
  // Ponta suave: o traço é feito duro (mais fino) numa camada à parte e desfocado ao entrar na máscara.
  // Assim a beirada fica realmente esfumada (os carimbos sobrepostos não "endurecem" o traço).
  if (traco.d === "suave" && typeof ctx.filter === "string") {
    const sigma = r * 0.5 * suav, nucleo = Math.max(0.5, r * (1 - 0.5 * suav)), folga = Math.ceil(nucleo + sigma * 3 + 2);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i + 1 < pts.length; i += 2) {
      const x = S / 2 + pts[i] * casa, y = S / 2 + pts[i + 1] * casa;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    const ox = Math.floor(x0 - folga), oy = Math.floor(y0 - folga);
    const cam = document.createElement("canvas");
    cam.width = Math.max(1, Math.ceil(x1 - x0 + folga * 2)); cam.height = Math.max(1, Math.ceil(y1 - y0 + folga * 2));
    const c2 = cam.getContext("2d");
    c2.strokeStyle = c2.fillStyle = "#000"; c2.lineWidth = nucleo * 2; c2.lineCap = c2.lineJoin = "round";
    c2.beginPath(); c2.moveTo(S / 2 + pts[0] * casa - ox, S / 2 + pts[1] * casa - oy);
    if (pts.length < 4) c2.lineTo(S / 2 + pts[0] * casa - ox + 0.01, S / 2 + pts[1] * casa - oy);
    for (let i = 2; i + 1 < pts.length; i += 2) c2.lineTo(S / 2 + pts[i] * casa - ox, S / 2 + pts[i + 1] * casa - oy);
    c2.stroke();
    ctx.save();
    ctx.globalCompositeOperation = traco.m === "esconder" ? "destination-out" : "source-over";
    ctx.filter = `blur(${sigma.toFixed(2)}px)`;
    ctx.drawImage(cam, ox, oy);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.globalCompositeOperation = traco.m === "esconder" ? "destination-out" : "source-over";
  const carimbo = (x, y) => {
    if (traco.d === "suave") {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      // Suavidade (0–1): quanto da ponta é esfumada (0 = quase dura, 1 = toda esfumada).
      g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(Math.max(0, 1 - suav) * 0.98, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
    } else ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  };
  const passo = Math.max(1, r * (traco.d === "suave" ? 0.35 : 0.25));
  let ax = S / 2 + pts[0] * casa, ay = S / 2 + pts[1] * casa;
  carimbo(ax, ay);
  for (let i = 2; i + 1 < pts.length; i += 2) {
    const bx = S / 2 + pts[i] * casa, by = S / 2 + pts[i + 1] * casa;
    const dist = Math.hypot(bx - ax, by - ay), n = Math.floor(dist / passo);
    for (let k = 1; k <= n; k++) carimbo(ax + (bx - ax) * k / n, ay + (by - ay) * k / n);
    if (!n) carimbo(bx, by);
    ax = bx; ay = by;
  }
  ctx.restore();
}
/** Máscara do recorte: o círculo de dentro da borda + o que o jogador pintou (mostrar/esconder). */
function naurenBordaMascara(S, cfg) {
  const m = document.createElement("canvas"); m.width = m.height = S;
  const x = m.getContext("2d");
  if (cfg.moldura && cfg.modelo !== "foundry") {
    // Moldura Nauren: a máscara é a forma do modelo (normal = buraco, expandida = contorno de fora) ou o
    // raster da imagem própria (processada antes, em naurenBordaGarantirTextura/na prévia).
    const mo = cfg.moldura, k = S / (2 * mo.vb);
    if (mo.modelo === "imagem") {
      const r = cfg._imagemProcessada;
      if (r) { const mk = mo.mascara === "expandida" ? r.mascaraExpandida : r.mascaraNormal; const lado = 200 * mo.imagem.tamanho * k; x.drawImage(mk, S / 2 - lado / 2, S / 2 - lado / 2, lado, lado); }
      else { x.fillStyle = "#000"; x.beginPath(); x.arc(S / 2, S / 2, 70 * k, 0, Math.PI * 2); x.fill(); }
    } else if (naurenMolduraRecorteGira(mo)) {
      // a moldura gira e o recorte não é redondo: a arte vai até o contorno de fora e a máscara que gira (no mapa) recorta
      x.fillStyle = "#000"; x.beginPath(); x.arc(S / 2, S / 2, (Number(mo.ext) || 100) * k, 0, Math.PI * 2); x.fill();
    } else { x.save(); x.translate(S / 2, S / 2); x.scale(k, k); x.fillStyle = "#000"; x.fill(new Path2D(naurenMolduraMascaraPath(mo))); x.restore(); }
  } else {
    const D = naurenBordaDiametro(S, cfg);
    x.fillStyle = "#000"; x.beginPath(); x.arc(S / 2, S / 2, D / 2, 0, Math.PI * 2); x.fill();
  }
  for (const t of cfg.mascara ?? []) naurenBordaPintarTraco(x, t, S, cfg.arte);
  return m;
}
/**
 * 0.105.1: o que o pincel "Mostrar" pintou, para ficar NA FRENTE da moldura Nauren (cabeça, arma, asa saindo
 * por cima do aro). Só os traços, na ordem (o "Esconder" pintado depois apaga). null se não houver nada a mostrar.
 */
function naurenBordaTemFrente(cfg) { return !!cfg && cfg.pincelNaFrente !== false && (cfg.mascara ?? []).some(t => t.m === "mostrar"); }
function naurenBordaMascaraFrente(S, cfg) {
  if (!naurenBordaTemFrente(cfg)) return null;
  const m = document.createElement("canvas"); m.width = m.height = S;
  const x = m.getContext("2d");
  for (const t of cfg.mascara ?? []) naurenBordaPintarTraco(x, t, S, cfg.arte);
  return m;
}
/** A arte enquadrada só onde o pincel mostrou (mesmo quadro S da textura do token). */
function naurenBordaGerarFrente(img, S, cfg, desenharImagem = naurenBordaDesenharImagem) {
  const mk = naurenBordaMascaraFrente(S, cfg); if (!mk || !img) return null;
  const c = document.createElement("canvas"); c.width = c.height = S;
  const x = c.getContext("2d");
  desenharImagem(x, img, S, cfg);
  x.globalCompositeOperation = "destination-in"; x.drawImage(mk, 0, 0);
  return c;
}
/** Compatível com o uso antigo: desenha a imagem já recortada (círculo + pincel) num contexto. */
let naurenBordaRecorteCache = null; // o último recorte da prévia (redesenhar a animação não refaz o recorte)
function naurenBordaDesenhar(ctx, img, S, cfg) {
  const chave = [S, cfg.recorte, cfg.x, cfg.y, cfg.zoom, cfg.escala, cfg.borda, cfg.arte, JSON.stringify(cfg.mascara ?? [])].join("|");
  if (naurenBordaRecorteCache?.img !== img || naurenBordaRecorteCache.chave !== chave)
    naurenBordaRecorteCache = { img, chave, cnv: naurenBordaGerarCanvas(img, S, cfg) };
  ctx.drawImage(naurenBordaRecorteCache.cnv, 0, 0);
}
function naurenBordaGerarCanvas(img, S, cfg, folha = null) {
  const recorte = naurenBordaGerarRecorte(img, S, cfg);
  if (!folha || naurenBordaPedraNeutra(cfg.pedra)) return recorte;
  // Moldura colorida por baixo da imagem (a imagem do Foundry fica por cima da borda dele, então a
  // moldura recolorida cobre a cinza; a faixa de cor fica de fora, para o Foundry continuar pintando).
  const cnv = document.createElement("canvas"); cnv.width = cnv.height = S;
  const ctx = cnv.getContext("2d");
  naurenBordaDesenharPedra(ctx, folha, Number(cfg.tamGrade) || 1, S, Math.max(0.5, Number(cfg.escala) || 1), cfg.pedra);
  ctx.drawImage(recorte, 0, 0);
  return cnv;
}
function naurenBordaGerarRecorte(img, S, cfg) {
  const cnv = document.createElement("canvas");
  cnv.width = cnv.height = S;
  const ctx = cnv.getContext("2d");
  naurenBordaDesenharImagem(ctx, img, S, cfg);
  if (cfg.recorte === "redondo") {
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(naurenBordaMascara(S, cfg), 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }
  return cnv;
}
/** Tamanho do recorte pelo tamanho que a arte ocupa na grade (as faixas recomendadas pelo Foundry). */
function naurenBordaTamanhoTextura(doc, arte = 1) {
  const t = Math.max(Number(doc?.width) || 1, Number(doc?.height) || 1) * Math.max(1, Number(arte) || 1);
  return t <= 1 ? 512 : t < 4 ? 1024 : 2048;
}

/* ---- Texturas recortadas (uma por endereço marcado), no cache de texturas do Foundry ---- */
const naurenBordaTexturas = new Map();   // chave → { base, tam }
const naurenBordaGerando = new Map();    // chave@tam → Promise
const naurenBordaFalhas = new Set();     // chaves cuja imagem não abriu (não tenta de novo a cada desenho)
function naurenBordaLoader() { return (foundry.canvas?.TextureLoader ?? globalThis.TextureLoader)?.loader ?? null; }
/** Registra a textura recortada onde o Foundry procura (PIXI.Assets: getTexture/loadTexture e o TokenRing). */
function naurenBordaRegistrar(chave, base) {
  try {
    // O Foundry pode já ter carregado este endereço (imagem original, sem recorte), e o PIXI guarda
    // cópias nos caches globais de textura: tira de todos antes de pôr o recorte (sem aviso de "já existe").
    try { if (PIXI.Assets.cache.has(chave)) PIXI.Assets.cache.remove(chave); } catch (err) { /* não estava */ }
    try { PIXI.Texture.removeFromCache?.(chave); } catch (err) { /* não estava */ }
    try { PIXI.BaseTexture.removeFromCache?.(chave); } catch (err) { /* não estava */ }
    PIXI.Assets.cache.set(chave, new PIXI.Texture(base));
  } catch (err) { console.warn("Nauren RPG | Borda do token: cache de texturas", err); }
  try { naurenBordaLoader()?.setCache?.(chave, base); } catch (err) { /* só controle de memória */ }
}
function naurenBordaNoCache(chave, base) {
  try { const t = PIXI.Assets.cache.has(chave) ? PIXI.Assets.get(chave) : null; return !!t && (t.baseTexture ?? t) === base && base.valid; }
  catch (err) { return false; }
}
async function naurenBordaGarantirTextura(chave, cfg, tam) {
  if (typeof PIXI === "undefined") return null;
  const reg = naurenBordaTexturas.get(chave);
  if (reg && !reg.base.destroyed && reg.base.valid && reg.tam >= tam) {
    if (!naurenBordaNoCache(chave, reg.base)) naurenBordaRegistrar(chave, reg.base);
    return reg.base;
  }
  const id = `${chave}@${tam}`;
  if (naurenBordaGerando.has(id)) return naurenBordaGerando.get(id);
  const p = (async () => {
    const img = await naurenBordaCarregarImagem(cfg.src);
    if (cfg.moldura?.modelo === "imagem" && cfg.moldura.imagem?.src) {
      const fr = await naurenBordaCarregarImagem(cfg.moldura.imagem.src).catch(() => null);
      if (fr) cfg = { ...cfg, _imagemProcessada: naurenMolduraProcessarImagem(fr, cfg.moldura.imagem) };
    }
    const folha = cfg.modelo !== "foundry" || naurenBordaPedraNeutra(cfg.pedra) ? null : await naurenBordaFolha().catch(() => null);
    const cnv = naurenBordaGerarCanvas(img, tam, cfg, folha);
    const base = new PIXI.BaseTexture(cnv);
    naurenBordaTexturas.set(chave, { base, tam });
    naurenBordaRegistrar(chave, base);
    return base;
  })();
  naurenBordaGerando.set(id, p);
  try { return await p; } finally { naurenBordaGerando.delete(id); }
}

/** Antes de o Foundry desenhar o token: deixa o recorte pronto no cache (chamado por NaurenToken#_draw). */
async function naurenBordaPrepararSujeito(doc) {
  const flag = doc?.getFlag?.("nauren", "borda");
  const nauren = naurenMolduraEhNauren(flag);
  if (!nauren && !doc?.ring?.enabled) return;
  const chave = nauren ? doc.texture?.src : doc.ring.subject?.texture;
  if (!naurenBordaEhChave(chave) || naurenBordaFalhas.has(chave)) return;
  const cfg = { ...naurenBordaConfig(doc), escala: nauren ? 1 : (Number(doc.ring.subject?.scale) || 1), tamGrade: naurenBordaTamGrade(doc) };
  if (!cfg.src) return;
  try { await naurenBordaGarantirTextura(chave, cfg, naurenBordaTamanhoTextura(doc, cfg.arte)); }
  catch (err) {
    naurenBordaFalhas.add(chave);
    console.warn(`Nauren RPG | Borda do token: não consegui abrir a imagem de ${doc.name} (${cfg.src}).`, err);
    if (doc.isOwner) ui.notifications?.warn(`Borda do token de ${doc.name}: ${naurenTextoLinkBloqueado(cfg.src)}`);
  }
}

/** Pisca a borda na cor do dano (Vida desceu) ou da cura (subiu). Só na tela de quem vê o token. */
function naurenBordaPiscar(token, dano) {
  try {
    const flag = token?.document?.getFlag?.("nauren", "borda");
    if (naurenMolduraEhNauren(flag)) {
      if (!token.visible || !naurenHudAnimacoesLigadas()) return false;
      const cfgN = naurenBordaConfig(token.document), r = cfgN.moldura?.reacoes ?? {};
      if (dano ? r.dano === false : r.cura === false) return false;
      return naurenMolduraPiscar(token, dano ? cfgN.corDano : cfgN.corCura);
    }
    const ring = token?.ring;
    if (!ring?.flashColor || !token.document?.ring?.enabled || !token.visible) return false;
    if (!naurenHudAnimacoesLigadas()) return false;
    const cfg = naurenBordaConfig(token.document);
    const Cor = foundry.utils?.Color ?? globalThis.Color;
    const cor = Cor?.from ? Cor.from(dano ? cfg.corDano : cfg.corCura) : (dano ? 0xff2a2a : 0x3ddc6a);
    // Pisca duas vezes rápido (curva de dois picos do próprio Foundry), para dar para notar.
    token._naurenPiscandoAte = performance.now() + 1050;
    // Com gradiente, a 2ª cor (o fundo) também vai para a cor do piscar: a borda pisca inteira (feito no ticker).
    token._naurenPiscar = { ini: performance.now(), dur: 1000, cor: Number(cor.littleEndian ?? cor), fundoOrig: token._naurenPiscar?.fundoOrig ?? ring.bkgColorLittleEndian };
    ring.flashColor(cor, { duration: 1000, easing: ring.constructor?.easeTwoPeaks ?? (t => (Math.sin(4 * Math.PI * t - Math.PI / 2) + 1) / 2) });
    return true;
  } catch (err) { return false; }
}

/* ---- Folha de bordas do Foundry (a escolhida em "Borda Dinâmica do Token": aço, bronze ou de módulo) ---- */
let naurenBordaFolhaPromessa = null;
function naurenBordaCaminhoFolha() {
  let caminho = null;
  try { caminho = CONFIG.Token?.ring?.spritesheet; } catch (err) { caminho = null; }
  return caminho || "canvas/tokens/rings-steel.json";
}
/** Carrega o JSON e a imagem da folha de bordas ativa. */
function naurenBordaFolha() {
  if (naurenBordaFolhaPromessa) return naurenBordaFolhaPromessa;
  naurenBordaFolhaPromessa = (async () => {
    const caminho = naurenBordaCaminhoFolha();
    const json = await fetch(caminho).then(r => (r.ok ? r.json() : null));
    if (!json?.frames || !json.meta?.image) throw new Error("folha de bordas sem quadros");
    const pasta = caminho.includes("/") ? caminho.slice(0, caminho.lastIndexOf("/") + 1) : "";
    const img = await naurenBordaCarregarImagem(pasta + json.meta.image);
    return { json, img };
  })();
  naurenBordaFolhaPromessa.catch(() => { naurenBordaFolhaPromessa = null; });
  return naurenBordaFolhaPromessa;
}
/** Quadros da borda e do fundo para um tamanho de token (a mesma escolha do TokenRing.getRingDataBySize). */
function naurenBordaQuadros(folha, tamGrade = 1) {
  const frames = folha.json.frames;
  const aneis = Object.keys(frames).filter(k => !k.includes("-bkg") && !k.includes("-msk"));
  const alvo = n => frames[n]?.gridTarget ?? 1;
  aneis.sort((a, b) => Math.abs(alvo(a) - tamGrade) - Math.abs(alvo(b) - tamGrade));
  const anel = aneis[0];
  const cfgFolha = folha.json.config ?? {};
  const banda = frames[anel]?.colorBand ?? cfgFolha.defaultColorBand ?? { startRadius: 0.59, endRadius: 0.7225 };
  return { anel, fundo: `${anel}-bkg`, banda, frames, corPadrao: frames[anel]?.ringColor ?? cfgFolha.defaultRingColor ?? null };
}
/** Raio de fora da arte da borda (0–1 do meio-lado do token), medido uma vez por quadro. */
const naurenBordaRaios = new Map();
function naurenBordaMedirRaio(folha, nome) {
  if (naurenBordaRaios.has(nome)) return naurenBordaRaios.get(nome);
  let raio = 0.8;
  try {
    const f = folha.json.frames[nome].frame, N = 128;
    const c = document.createElement("canvas"); c.width = c.height = N;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(folha.img, f.x, f.y, f.w, f.h, 0, 0, N, N);
    const d = x.getImageData(0, 0, N, N).data;
    let max = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      if (d[(j * N + i) * 4 + 3] <= 10) continue;
      const r = Math.hypot(i + 0.5 - N / 2, j + 0.5 - N / 2) / (N / 2);
      if (r > max) max = r;
    }
    if (max > 0.3) raio = Math.min(1, max);
  } catch (err) { raio = 0.8; }
  naurenBordaRaios.set(nome, raio);
  return raio;
}
/** Raio da borda para um token (síncrono: usa a medida já feita; até lá, 0,8 e mede em segundo plano). */
function naurenBordaRaioDoToken(doc) {
  const tam = Math.min(Number(doc?.width) || 1, Number(doc?.height) || 1);
  const chave = `${naurenBordaCaminhoFolha()}|${tam}`;
  if (naurenBordaRaios.has(chave)) return naurenBordaRaios.get(chave);
  naurenBordaRaios.set(chave, 0.8);
  naurenBordaFolha().then(folha => {
    naurenBordaRaios.set(chave, naurenBordaMedirRaio(folha, naurenBordaQuadros(folha, tam).anel));
    for (const t of canvas?.tokens?.placeables ?? []) if (t.document?.ring?.enabled) { try { t.drawBars?.(); } catch (err) { /* ignora */ } }
  }).catch(() => {});
  return 0.8;
}

/** Correção de Escala para a borda (do tamanho do token) ocupar a casa inteira: o raio de fora da arte. */
async function naurenBordaEscalaPara(tamGrade = 1) {
  try {
    const folha = await naurenBordaFolha();
    const r = naurenBordaMedirRaio(folha, naurenBordaQuadros(folha, tamGrade).anel);
    return Math.max(0.5, Math.min(1, Math.round(r * 1000) / 1000));
  } catch (err) { return 0.8; }
}

/** Caixa visível do token: com a borda, as barras do HUD se encostam no círculo da borda, não no quadrado da casa. */
function naurenBordaCaixaVisual(token) {
  const w = token.w, h = token.h;
  if (!token.document?.ring?.enabled && !naurenMolduraEhNauren(token.document?.getFlag?.("nauren", "borda"))) return { x: 0, y: 0, w, h };
  let ajuste = 100; try { ajuste = Number(game.settings.get("nauren", "bordaEncaixeBarras")) || 100; } catch (err) { ajuste = 100; }
  const cfgB = token.document.getFlag?.("nauren", "borda");
  // Borda do Nauren: o tamanho da borda em casas é o que foi escolhido na janela.
  const base = cfgB?.ativa ? (naurenMolduraEhNauren(cfgB) ? naurenBordaConfig(token.document).moldura.ext / 100 : naurenBordaConfig(token.document).borda)
    : naurenBordaRaioDoToken(token.document) / Math.max(0.1, Number(token.document.ring.subject?.scale) || 1) * Math.abs(Number(token.document.texture?.scaleX) || 1);
  const f = Math.max(0.3, Math.min(1.5, base * ajuste / 100));
  const nw = w * f, nh = h * f;
  return { x: (w - nw) / 2, y: (h - nh) / 2, w: nw, h: nh };
}

/** Dados de token (ring + flags) para uma configuração. */
function naurenBordaDadosToken(cfg, raio = 1, tamGrade = 1) {
  const E = naurenBordaBits();
  if (!cfg.ativa) return { "ring.enabled": false, "flags.nauren.borda": cfg, "texture.scaleX": 1, "texture.scaleY": 1, lockRotation: false };
  if (naurenMolduraEhNauren(cfg)) {
    // Moldura Nauren: sem a borda dinâmica; a textura do token é o recorte na forma da moldura, cobrindo o quadro inteiro (vb).
    const arte = cfg.moldura.vb / 100;
    return { "ring.enabled": false, "texture.src": naurenBordaChave({ ...cfg, escala: 1, tamGrade }), "texture.scaleX": arte, "texture.scaleY": arte, lockRotation: true, "flags.nauren.borda": cfg };
  }
  // A arte cobre "arte" casas (escala do token); a borda fica com "borda" casas (Correção de Escala).
  const arte = Math.max(1, Number(cfg.arte) || 1), borda = Math.max(0.5, Number(cfg.borda) || 1);
  const escala = Math.max(0.5, Math.round(arte * raio / borda * 1000) / 1000);
  let efeitos = E.ENABLED ?? 1;
  for (const k of cfg.efeitos ?? []) efeitos |= (E[NAUREN_BORDA_EFEITOS[k]?.bit] ?? 0);
  const cores0 = naurenBordaCoresNoTempo(cfg, 0);
  if (cores0.gradiente) efeitos |= (E.RING_GRADIENT ?? 4); // 2+ cores = gradiente nativo do Foundry
  return {
    "ring.enabled": true, "ring.colors.ring": cores0.anel, "ring.colors.background": cores0.fundo,
    "ring.effects": efeitos, "ring.subject.texture": naurenBordaChave({ ...cfg, escala, tamGrade }), "ring.subject.scale": escala,
    "texture.scaleX": arte, "texture.scaleY": arte,
    lockRotation: true, "flags.nauren.borda": cfg
  };
}
/**
 * Dados do token já com o recorte pronto no cache: assim, quando o Foundry anima a troca de imagem
 * (logo depois do update), ele já encontra o recorte e não tenta abrir o endereço marcado sozinho.
 */
async function naurenBordaDadosPreparados(cfg, doc) {
  const tamGrade = naurenBordaTamGrade(doc);
  const raio = await naurenBordaEscalaPara(tamGrade);
  const dados = naurenBordaDadosToken(cfg, raio, tamGrade);
  const nauren = cfg.ativa && naurenMolduraEhNauren(cfg);
  // Saindo de uma moldura Nauren (para a do Foundry ou para "sem borda"): a imagem do token volta a ser a original.
  if (!nauren && naurenBordaEhChave(doc?.texture?.src)) dados["texture.src"] = String(doc.texture.src).replace(/([?&])nauren-borda=[^&]*&?/, "$1").replace(/[?&]$/, "");
  if (nauren) await naurenBordaGarantirTextura(dados["texture.src"], { ...cfg, escala: 1, tamGrade }, naurenBordaTamanhoTextura(doc, cfg.arte)).catch(() => null);
  else if (cfg.ativa) await naurenBordaGarantirTextura(dados["ring.subject.texture"], { ...cfg, escala: dados["ring.subject.scale"], tamGrade }, naurenBordaTamanhoTextura(doc, cfg.arte)).catch(() => null);
  return dados;
}
/** Tamanho do token na grade (o menor lado, como o TokenRing). */
function naurenBordaTamGrade(doc) { return Math.min(Number(doc?.width) || 1, Number(doc?.height) || 1); }

/** Tokens já colocados (em todas as cenas) desta ficha que o usuário pode alterar. */
function naurenBordaTokensDaFicha(actor) {
  const base = actor?.isToken ? actor.token?.baseActor : actor;
  if (!base) return [];
  const lista = [];
  for (const cena of game.scenes ?? []) for (const td of cena.tokens ?? []) if (td.actorId === base.id && td.isOwner) lista.push(td);
  return lista;
}

/**
 * Grava a borda: na ficha (token padrão e flags) e, se pedido, nos tokens já colocados.
 * "tokenDoc": o token de onde a janela foi aberta (sempre recebe).
 */
async function naurenBordaAplicar(actor, cfg, { tokenDoc = null, nosTokens = true, soToken = false } = {}) {
  // Cada token recebe a escala do seu tamanho (1×1, 2×2...): a borda ocupa as casas inteiras.
  // soToken: só aquele token (NPC/monstro não vinculado), sem mexer na ficha de origem.
  const dadosPara = doc => naurenBordaDadosPreparados(cfg, doc);
  const base = actor?.isToken ? actor.token?.baseActor : actor;
  const linhas = [];
  if (soToken) nosTokens = false;
  if (base?.isOwner && !soToken) {
    const upd = { "flags.nauren.borda": cfg };
    for (const [k, v] of Object.entries(await dadosPara(base.prototypeToken))) upd[`prototypeToken.${k}`] = v;
    await base.update(upd);
  }
  const alvos = new Set(tokenDoc ? [tokenDoc] : []);
  if (nosTokens) for (const td of naurenBordaTokensDaFicha(actor)) alvos.add(td);
  let feitos = 0, falhas = 0;
  for (const td of alvos) {
    try { await td.update(await dadosPara(td)); feitos++; } catch (err) { falhas++; console.warn("Nauren RPG | Borda do token", err); }
  }
  if (falhas) ui.notifications?.warn(`Borda do token: ${falhas} token(s) não puderam ser alterados (sem permissão).`);
  return { feitos, falhas, linhas };
}

/**
 * Cores da borda num instante: 1 cor = cor única; 2 cores = gradiente girando entre elas (efeito
 * nativo "Gradiente", que usa a cor do fundo como 2ª cor); 3+ cores = o par vai passando pela lista.
 */
const NAUREN_BORDA_SEG_POR_COR = 1.6;
function naurenBordaMisturarHex(a, b, f) {
  const n = h => parseInt(String(h).slice(1), 16) || 0;
  const A = n(a), B = n(b), c = s => Math.round(((A >> s) & 255) + ((((B >> s) & 255) - ((A >> s) & 255)) * f));
  return "#" + [16, 8, 0].map(s => c(s).toString(16).padStart(2, "0")).join("");
}
function naurenBordaCoresNoTempo(cfg, tempo = 0) {
  const cores = cfg.cores?.length ? cfg.cores : [cfg.corBorda];
  if (cores.length === 1) return { anel: cores[0], fundo: cfg.corFundo, gradiente: false };
  if (cores.length === 2) return { anel: cores[0], fundo: cores[1], gradiente: true };
  const pos = (tempo / NAUREN_BORDA_SEG_POR_COR) % cores.length, i = Math.floor(pos), f = pos - i, N = cores.length;
  const suave = f * f * (3 - 2 * f);
  return { anel: naurenBordaMisturarHex(cores[i], cores[(i + 1) % N], suave), fundo: naurenBordaMisturarHex(cores[(i + 1) % N], cores[(i + 2) % N], suave), gradiente: true };
}

/** Na prévia: o quadrado da casa no mapa (tracejado), para ver o quanto a arte passa dele. */
function naurenBordaContornoCasa(ctx, P, cfg) {
  const arte = Math.max(1, Number(cfg.arte) || 1);
  if (arte <= 1.001 && !(cfg.mascara?.length)) return;
  const lado = P / arte, o = (P - lado) / 2;
  ctx.save(); ctx.setLineDash([5, 4]); ctx.lineWidth = 1; ctx.strokeStyle = "rgba(204,161,98,.75)";
  ctx.strokeRect(o + 0.5, o + 0.5, lado - 1, lado - 1); ctx.restore();
}
/**
 * Moldura da borda (a parte cinza) recolorida, no quadro S do sujeito, sem a faixa de cor.
 * Colorir = pinta mantendo a luz e a sombra da pedra (como "Colorir" de editor de imagem);
 * depois matiz, saturação, brilho e contraste.
 */
const naurenBordaPedras = new Map();
function naurenBordaPedraCanvas(folha, tamGrade, S, esc, pedra) {
  const id = `${folha.img.src}|${tamGrade}|${S}|${esc.toFixed(3)}|${JSON.stringify(pedra)}`;
  if (naurenBordaPedras.has(id)) return naurenBordaPedras.get(id);
  const q = naurenBordaQuadros(folha, tamGrade);
  const f = q.frames[q.anel]?.frame; if (!f) return null;
  const novo = () => { const c = document.createElement("canvas"); c.width = c.height = S; return c; };
  const L = S / esc, o = (S - L) / 2;
  const base = novo(), bx = base.getContext("2d", { willReadFrequently: true });
  bx.imageSmoothingEnabled = true; bx.imageSmoothingQuality = "high";
  bx.drawImage(folha.img, f.x, f.y, f.w, f.h, o, o, L, L);
  // Fica só a moldura de fora: tira a faixa de cor (o Foundry pinta ela com as cores da borda) e tudo
  // o que fica dentro dela (a sombra do miolo), para não tingir o miolo do token.
  const r2 = q.banda.endRadius * L / 2;
  bx.save(); bx.globalCompositeOperation = "destination-out"; bx.beginPath();
  bx.arc(S / 2, S / 2, r2, 0, Math.PI * 2); bx.fill(); bx.restore();
  let fonte = base;
  if (pedra.colorir && pedra.forca > 0) {
    // "Colorir" pixel a pixel (a mesma conta do modo de mistura "Cor"): a cor escolhida com a luz de
    // cada pixel da pedra. Feito sem misturar com a transparência, para a beirada não mudar de tom.
    const n = parseInt(pedra.cor.slice(1), 16), cs = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    const lum = (r, g, b) => 0.3 * r + 0.59 * g + 0.11 * b;
    const lumCor = lum(...cs), forca = pedra.forca;
    const dados = bx.getImageData(0, 0, S, S), d = dados.data;
    for (let k = 0; k < d.length; k += 4) {
      if (!d[k + 3]) continue;
      const dl = lum(d[k], d[k + 1], d[k + 2]) - lumCor;
      let r = cs[0] + dl, g = cs[1] + dl, b = cs[2] + dl;
      const l = lum(r, g, b), mn = Math.min(r, g, b), mx = Math.max(r, g, b);
      if (mn < 0) { r = l + (r - l) * l / (l - mn); g = l + (g - l) * l / (l - mn); b = l + (b - l) * l / (l - mn); }
      if (mx > 255) { r = l + (r - l) * (255 - l) / (mx - l); g = l + (g - l) * (255 - l) / (mx - l); b = l + (b - l) * (255 - l) / (mx - l); }
      d[k] += (r - d[k]) * forca; d[k + 1] += (g - d[k + 1]) * forca; d[k + 2] += (b - d[k + 2]) * forca;
    }
    const c = novo(); c.getContext("2d").putImageData(dados, 0, 0);
    fonte = c;
  }
  const out = novo(), ox = out.getContext("2d");
  if (typeof ox.filter === "string") ox.filter = `hue-rotate(${pedra.matiz}deg) saturate(${pedra.saturacao}) brightness(${pedra.brilho}) contrast(${pedra.contraste})`;
  ox.drawImage(fonte, 0, 0);
  naurenBordaPedras.set(id, out);
  if (naurenBordaPedras.size > 8) naurenBordaPedras.delete(naurenBordaPedras.keys().next().value);
  return out;
}
/** Desenha a moldura recolorida (duas vezes: assim a cinza de baixo não aparece na beirada). */
function naurenBordaDesenharPedra(ctx, folha, tamGrade, S, esc, pedra) {
  if (!folha || naurenBordaPedraNeutra(pedra)) return;
  const c = naurenBordaPedraCanvas(folha, tamGrade, S, esc, pedra); if (!c) return;
  ctx.drawImage(c, 0, 0); ctx.drawImage(c, 0, 0);
}
/** Camadas da folha (borda e fundo) já no tamanho da prévia, com a distância de cada pixel — guardadas para animar. */
const naurenBordaCamadas = new Map();
function naurenBordaCamadasPrevia(folha, tamGrade, P, esc) {
  const id = `${folha.img.src}|${tamGrade}|${P}|${esc.toFixed(3)}`;
  if (naurenBordaCamadas.has(id)) return naurenBordaCamadas.get(id);
  const q = naurenBordaQuadros(folha, tamGrade);
  const camada = nome => {
    const f = q.frames[nome]?.frame; if (!f) return null;
    const c = document.createElement("canvas"); c.width = c.height = P;
    const x = c.getContext("2d", { willReadFrequently: true });
    const L = P / esc; // a Correção de Escala aumenta a borda (L > P quando esc < 1)
    x.drawImage(folha.img, f.x, f.y, f.w, f.h, (P - L) / 2, (P - L) / 2, L, L);
    return x.getImageData(0, 0, P, P).data;
  };
  const dist = new Float32Array(P * P);
  for (let j = 0; j < P; j++) for (let i = 0; i < P; i++) dist[j * P + i] = Math.hypot((i + 0.5) / P - 0.5, (j + 0.5) / P - 0.5) * 2 * esc;
  const dados = { q, anel: camada(q.anel), fundo: camada(q.fundo), dist };
  naurenBordaCamadas.set(id, dados);
  if (naurenBordaCamadas.size > 12) naurenBordaCamadas.delete(naurenBordaCamadas.keys().next().value);
  return dados;
}

/**
 * Prévia igual ao mapa: a borda e o fundo da folha do Foundry, pintados como o shader do TokenRing
 * (faixa de cor da borda = cor × canal vermelho; fundo em "overlay" com a cor), com os efeitos
 * animados (Pulsar, Gradiente, Onda no fundo, Cor sobre a imagem) e a imagem recortada por cima.
 * "tempo" em segundos (anima os efeitos); "piscar" = { cor, e 0–1 } (a faixa vai até a cor do piscar).
 */
function naurenBordaDesenharPrevia(cnv, img, cfg, { piscar = null, folha = null, tamGrade = 1, tempo = 0, fantasma = 0, guias = true } = {}) {
  const PF = cnv.width, ctxF = cnv.getContext("2d");
  // A borda é calculada pixel a pixel numa resolução menor (rápido para animar) e ampliada;
  // a imagem é desenhada na resolução cheia por cima.
  const P = Math.min(PF, 400);
  const camadaBorda = P === PF ? cnv : Object.assign(document.createElement("canvas"), { width: P, height: P });
  const ctx = camadaBorda.getContext("2d");
  ctx.clearRect(0, 0, P, P);
  const hex = h => { const n = parseInt(String(h || "#ffffff").replace("#", ""), 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => v / 255); };
  const branco = c => c.every(v => v >= 0.999);
  const esc = Math.max(0.5, Number(cfg.escala) || 1);
  const ef = new Set(cfg.efeitos ?? []);
  if (folha) {
    const { q, anel, fundo, dist } = naurenBordaCamadasPrevia(folha, tamGrade, P, esc);
    const coresAgora = naurenBordaCoresNoTempo(cfg, tempo);
    let corAnel = hex(coresAgora.anel);
    if (branco(corAnel) && q.corPadrao) corAnel = hex(q.corPadrao);
    // O piscar do Foundry anima a própria cor da borda até a cor do piscar.
    if (piscar) { const alvo = hex(piscar.cor), e = Math.max(0, Math.min(1, piscar.e ?? 0)); corAnel = corAnel.map((v, i) => v + (alvo[i] - v) * e); }
    let tint = hex(coresAgora.fundo);
    const gradAtivo = ef.has("gradiente") || coresAgora.gradiente;
    // No mapa, com gradiente, o piscar também leva a 2ª cor para a cor do piscar: a borda pisca inteira.
    if (piscar && gradAtivo) { const alvo = hex(piscar.cor), e = Math.max(0, Math.min(1, piscar.e ?? 0)); tint = tint.map((v, i) => v + (alvo[i] - v) * e); }
    const tintBranco = branco(tint);
    // Efeitos (mesmas contas do shader do Foundry)
    const pulso = ef.has("pulso") ? Math.cos(tempo * 2) * 0.325 + 0.675 : 1;
    const gradiente = ef.has("gradiente") || coresAgora.gradiente, onda = ef.has("onda"), corSobre = ef.has("corSobre");
    const cs = Math.cos(tempo), sn = Math.sin(tempo);
    const sobre = corSobre ? new Float32Array(P * P * 4) : null;
    const saida = ctx.createImageData(P, P), o = saida.data;
    for (let j = 0; j < P; j++) for (let i = 0; i < P; i++) {
      const p = j * P + i, k = p * 4, d = dist[p];
      // fundo: overlay com a cor; onda = brilho que corre para fora
      let fa = fundo ? fundo[k + 3] / 255 : 0, fr = 0, fg = 0, fb = 0;
      if (fa > 0) {
        const bc = [fundo[k] / 255, fundo[k + 1] / 255, fundo[k + 2] / 255];
        [fr, fg, fb] = tintBranco ? bc : bc.map((b, n) => (b < 0.5 ? 2 * b * tint[n] : 1 - 2 * (1 - b) * (1 - tint[n])));
        if (onda) { const w = 0.5 + (0.5 * Math.sin(-tempo * 4 + d * 100) + 0.9) * 1.5; fr *= w; fg *= w; fb *= w; }
      }
      // borda: a faixa de cor recebe a cor (× pulso, girando para a cor do fundo no gradiente)
      const aa = anel ? anel[k + 3] / 255 : 0;
      let ar = 0, ag = 0, ab = 0;
      if (aa > 0) {
        const tc = [anel[k] / 255, anel[k + 1] / 255, anel[k + 2] / 255], red = tc[0];
        let cor = corAnel.map(v => v * red * pulso);
        if (gradiente) {
          const u = (i + 0.5) / P - 0.5, v = (j + 0.5) / P - 0.5;
          const ru = u * cs + v * sn + 0.5, rv = -u * sn + v * cs + 0.5;
          const t = Math.max(0, Math.min(1, (ru + rv) * 0.5)), mix = t * t * (3 - 2 * t);
          cor = cor.map((c, n) => c + (tint[n] * red - c) * mix);
        }
        const naFaixa = d >= q.banda.startRadius && d < q.banda.endRadius ? 1 : 0;
        if (corSobre && naFaixa) {
          // "Cor sobre a imagem": a faixa vai para cima da imagem (desenhada depois dela)
          sobre[k] = cor[0]; sobre[k + 1] = cor[1]; sobre[k + 2] = cor[2]; sobre[k + 3] = aa;
          [ar, ag, ab] = tc.map(c => c * 0);
        } else [ar, ag, ab] = tc.map((c, n) => c + (cor[n] - c) * naFaixa);
      }
      const aaEf = corSobre && sobre[k + 3] ? 0 : aa;
      const a = aaEf + Math.min(1, fa) * (1 - aaEf);
      if (a <= 0) continue;
      o[k] = Math.min(255, ((ar * aaEf + fr * fa * (1 - aaEf)) / a) * 255);
      o[k + 1] = Math.min(255, ((ag * aaEf + fg * fa * (1 - aaEf)) / a) * 255);
      o[k + 2] = Math.min(255, ((ab * aaEf + fb * fa * (1 - aaEf)) / a) * 255);
      o[k + 3] = a * 255;
    }
    ctx.putImageData(saida, 0, 0);
    if (camadaBorda !== cnv) {
      ctxF.clearRect(0, 0, PF, PF);
      ctxF.imageSmoothingEnabled = true; ctxF.imageSmoothingQuality = "high";
      ctxF.drawImage(camadaBorda, 0, 0, PF, PF);
    }
    naurenBordaDesenharPedra(ctxF, folha, tamGrade, PF, esc, cfg.pedra);
    if (img && fantasma > 0) {
      // Guia do pincel: a imagem inteira, transparente, para saber onde pintar.
      ctxF.save(); ctxF.globalAlpha = fantasma; naurenBordaDesenharImagem(ctxF, img, PF, cfg); ctxF.restore();
    }
    if (img) naurenBordaDesenhar(ctxF, img, PF, cfg);
    if (guias) naurenBordaContornoCasa(ctxF, PF, cfg);
    if (sobre) {
      const camadaSobre = ctx.createImageData(P, P), c = camadaSobre.data;
      for (let n = 0; n < P * P * 4; n += 4) { if (!sobre[n + 3]) continue; c[n] = sobre[n] * 255; c[n + 1] = sobre[n + 1] * 255; c[n + 2] = sobre[n + 2] * 255; c[n + 3] = sobre[n + 3] * 255; }
      const tmp = document.createElement("canvas"); tmp.width = tmp.height = P; tmp.getContext("2d").putImageData(camadaSobre, 0, 0);
      ctxF.drawImage(tmp, 0, 0, PF, PF);
    }
    return;
  }
  // Sem a folha do Foundry (ainda carregando): círculo simples nas cores escolhidas.
  ctxF.clearRect(0, 0, PF, PF);
  const r = Math.min(PF * 0.44, naurenBordaDiametro(PF, { ...cfg, recorte: "redondo" }) / 2), faixa = PF * 0.05;
  ctxF.save(); ctxF.beginPath(); ctxF.arc(PF / 2, PF / 2, r + faixa, 0, Math.PI * 2); ctxF.fillStyle = cfg.corFundo; ctxF.fill(); ctxF.restore();
  ctxF.save(); ctxF.lineWidth = faixa; ctxF.strokeStyle = piscar ? piscar.cor : cfg.corBorda;
  ctxF.beginPath(); ctxF.arc(PF / 2, PF / 2, r + faixa / 2, 0, Math.PI * 2); ctxF.stroke(); ctxF.restore();
  if (img && fantasma > 0) { ctxF.save(); ctxF.globalAlpha = fantasma; naurenBordaDesenharImagem(ctxF, img, PF, cfg); ctxF.restore(); }
  if (img) naurenBordaDesenhar(ctxF, img, PF, cfg);
}

/** Prévia pequena em data URL (usada no Criador de Personagem): o token como fica no mapa, sem as guias do editor. */
async function naurenBordaPreviaDataUrl(cfg, tamanho = 160) {
  const img = await naurenBordaCarregarImagem(cfg.src).catch(() => null);
  const cnv = document.createElement("canvas"); cnv.width = cnv.height = tamanho;
  if (naurenMolduraEhNauren(cfg)) {
    const tex = await naurenMolduraPrepararPrevia(cfg, Math.max(256, tamanho), naurenBordaCarregarImagem).catch(() => null);
    naurenMolduraDesenharPrevia(cnv, img, cfg, tex, { guias: false, fundo: null, desenharImagem: naurenBordaDesenharImagem, pintarTraco: naurenBordaPintarTraco, extra: { animar: false } });
    try { return cnv.toDataURL("image/png"); } catch (err) { return null; }
  }
  const folha = await naurenBordaFolha().catch(() => null);
  naurenBordaDesenharPrevia(cnv, img, cfg, { folha, tamGrade: Number(cfg.tamGrade) || 1, guias: false });
  try { return cnv.toDataURL("image/png"); } catch (err) { return null; }
}
/** 0.94.29: prévia da borda SALVA na ficha (mesma escala e tamanho do token do mapa); null se a borda estiver desligada. */
const naurenBordaPreviasCache = new Map();
async function naurenBordaPreviaDoAtor(actor, tamanho = 160) {
  const salvo = actor?.getFlag?.("nauren", "borda");
  if (!salvo?.ativa) return null;
  const pt = actor.prototypeToken;
  const cfg = { ...naurenBordaConfig(actor), escala: Number(pt?.ring?.subject?.scale) || Number(salvo.escala) || 1, tamGrade: naurenBordaTamGrade(pt) };
  if (!cfg.src) cfg.src = pt?.texture?.src ?? actor.img ?? "";
  const chave = `${tamanho}|${JSON.stringify(cfg)}`;
  if (!naurenBordaPreviasCache.has(chave)) naurenBordaPreviasCache.set(chave, naurenBordaPreviaDataUrl(cfg, tamanho));
  const url = await naurenBordaPreviasCache.get(chave);
  if (!url) naurenBordaPreviasCache.delete(chave);
  return url;
}

/**
 * Janela "Borda do token". opcoes: { tokenDoc, srcInicial }.
 * Devolve a configuração salva (ou null se cancelou).
 */
async function naurenAbrirBorda(actor, { tokenDoc = null, srcInicial = "" } = {}) {
  // 0.103: a janela única das bordas (Padrão do Foundry + molduras do Nauren) fica em molduras-editor.mjs.
  const { naurenAbrirMolduraEditor } = await import("./molduras-editor.mjs");
  return naurenAbrirMolduraEditor(actor, { tokenDoc, srcInicial });
}

// Aviso ao Mestre: tokens da cena com imagem de site que não libera (ex.: Pinterest) — o Foundry
// não consegue mostrar e enche o console de erros de CORS. Diz quais são, uma vez por cena.
const naurenBordaCenasAvisadas = new Set();
Hooks.on("canvasReady", async () => {
  if (!game.user.isGM || !canvas.scene || naurenBordaCenasAvisadas.has(canvas.scene.id)) return;
  naurenBordaCenasAvisadas.add(canvas.scene.id);
  const porLink = new Map();
  for (const td of canvas.scene.tokens) {
    const src = String(td.texture?.src ?? "");
    if (!/^https?:\/\//i.test(src) || src.startsWith(window.location.origin)) continue;
    if (!porLink.has(src)) porLink.set(src, []);
    porLink.get(src).push(td.name);
  }
  const ruins = [];
  for (const [src, nomes] of porLink) { try { await naurenBordaCarregarImagem(src); } catch (err) { ruins.push({ src, nomes }); } }
  if (!ruins.length) return;
  const lista = ruins.map(r => `${[...new Set(r.nomes)].join(", ")} (${(() => { try { return new URL(r.src).hostname; } catch (err) { return "link"; } })()})`).join("; ");
  ui.notifications?.warn(`Imagem de token que o Foundry não consegue abrir (o site não libera): ${lista}. Troque por um arquivo do servidor ou um link do Imgur — os erros de CORS no console vêm daí.`, { permanent: true });
});
// Borda com 3+ cores: a cada quadro, a cor da borda e a 2ª cor do gradiente vão passando pela lista
// (só na tela de cada um; nada é gravado). Durante o piscar do dano/cura, o piscar tem prioridade.
const naurenBordaCurvaPiscar = f => (Math.sin(4 * Math.PI * f - Math.PI / 2) + 1) / 2; // dois picos
/** Mistura duas cores em "little endian" (BBGGRR): canal a canal, então a ordem dos canais não importa. */
function naurenBordaMisturarLE(a, b, e) {
  const ch = (v, s) => (v >> s) & 255, m = s => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * e);
  return (m(16) << 16) | (m(8) << 8) | m(0);
}
function naurenBordaTickerCores() {
  if (!canvas?.ready) return;
  const agoraMs = performance.now(), agora = agoraMs / 1000;
  const Cor = foundry.utils?.Color ?? globalThis.Color;
  for (const t of canvas.tokens?.placeables ?? []) {
    const ring = t.ring, doc = t.document;
    if (!ring || !doc?.ring?.enabled) { delete t._naurenPiscar; continue; }
    const cfgB = doc.flags?.nauren?.borda;
    const varias = cfgB?.ativa && Array.isArray(cfgB.cores) && cfgB.cores.length >= 3;
    const pis = t._naurenPiscar;
    if (!varias && !pis) continue;
    try {
      let fundo = pis?.fundoOrig ?? ring.bkgColorLittleEndian;
      if (varias) {
        const c = naurenBordaCoresNoTempo({ cores: cfgB.cores, corFundo: cfgB.corFundo, corBorda: cfgB.cores[0] }, agora);
        fundo = Cor.from(c.fundo).littleEndian;
        if (!(t._naurenPiscandoAte > agoraMs)) ring.ringColorLittleEndian = Cor.from(c.anel).littleEndian;
      }
      if (pis) {
        const f = (agoraMs - pis.ini) / pis.dur;
        const gradiente = (Number(ring.effects) & 4) === 4;
        if (f >= 1 || !gradiente) { delete t._naurenPiscar; ring.bkgColorLittleEndian = fundo; continue; }
        ring.bkgColorLittleEndian = naurenBordaMisturarLE(fundo, pis.cor, naurenBordaCurvaPiscar(f));
      } else ring.bkgColorLittleEndian = fundo;
    } catch (err) { /* sem borda */ }
  }
}
Hooks.on("canvasReady", () => { try { canvas.app.ticker.remove(naurenBordaTickerCores); canvas.app.ticker.add(naurenBordaTickerCores); } catch (err) { /* sem canvas */ } });

// Vida de referência para o piscar (cada tela guarda a última que viu).
Hooks.on("drawToken", token => { token._naurenBordaVida = token.actor?.system?.vida?.value; });
// Token aumentou de tamanho (2×2, 3×3...): refaz o recorte maior para não ficar borrado.
Hooks.on("updateToken", async (doc, mudou, opcoes, userId) => {
  if (!("width" in mudou || "height" in mudou) || !doc.ring?.enabled || !naurenBordaEhChave(doc.ring.subject?.texture)) return;
  // Quem mudou o tamanho ajusta a escala da borda para as casas novas (a arte muda conforme o tamanho).
  if (userId === game.user.id) {
    const cfg = naurenBordaConfig(doc);
    if (cfg.ativa) {
      const dados = await naurenBordaDadosPreparados(cfg, doc);
      if (dados["ring.subject.texture"] !== doc.ring.subject.texture) { await doc.update(dados).catch(() => {}); return; }
    }
  }
  const reg = naurenBordaTexturas.get(doc.ring.subject.texture);
  if (reg && reg.tam >= naurenBordaTamanhoTextura(doc, naurenBordaConfig(doc).arte)) return;
  naurenBordaPrepararSujeito(doc).then(() => doc.object?.renderFlags?.set?.({ redraw: true })).catch(() => {});
});
// Piscar no dano e na cura: cada tela compara a Vida de cada token com a última vista.
Hooks.on("updateActor", actor => {
  const v = actor?.system?.vida?.value;
  if (v === undefined) return;
  for (const t of actor.getActiveTokens?.(true, false) ?? []) {
    const antes = t._naurenBordaVida;
    t._naurenBordaVida = v;
    if (antes === undefined || antes === v) continue;
    naurenBordaPiscar(t, v < antes);
  }
});
// Texturas recortadas soltas (ninguém mais usa) saem ao trocar de cena.
Hooks.on("canvasTearDown", () => {
  for (const [chave, reg] of naurenBordaTexturas) {
    if (reg.base.destroyed) naurenBordaTexturas.delete(chave);
  }
});


/**
 * Escala das janelas do Nauren (ficha, item, Criador, subclasse, diálogos): usa position.scale do
 * ApplicationV2, que o Foundry já considera ao arrastar, redimensionar e centralizar. Não mexe no resto do Foundry.
 */
function naurenEscalaInterface() {
  let v;
  try { v = game.settings.get("nauren", "escalaInterface"); if (v === "mundo") v = game.settings.get("nauren", "escalaInterfacePadrao"); } catch (err) { v = "auto"; }
  if (v === "auto" || !v) { const h = window.innerHeight; return h >= 1000 ? 1 : h >= 850 ? 0.9 : 0.8; }
  const n = Number(v); return Number.isFinite(n) && n > 0 ? n : 1;
}
/** Aplica a escala e garante que a janela caiba na tela (largura e altura visíveis). */
function naurenAplicarEscalaEAjuste(app, { ajustarTamanho = true } = {}) {
  if (!app?.element || !app.position) return;
  const escala = naurenEscalaInterface();
  // O CSS usa esta variável para que o tamanho máximo da janela seja "a tela dividida pela escala"
  // (sem isso, o Foundry limitava o redimensionar/arrastar a ~escala × tela).
  app.element.style.setProperty("--nauren-escala", String(escala));
  const pos = {};
  if ((app.position.scale ?? 1) !== escala) pos.scale = escala;
  if (ajustarTamanho) {
    const maxH = Math.floor((window.innerHeight - 40) / escala), maxW = Math.floor((window.innerWidth - 40) / escala);
    if (typeof app.position.height === "number" && app.position.height > maxH) pos.height = maxH;
    if (typeof app.position.width === "number" && app.position.width > maxW) pos.width = maxW;
  }
  if (Object.keys(pos).length) { try { app.setPosition(pos); } catch (err) { console.warn("Nauren RPG | escala da interface", err); } }
}
function naurenEhJanelaDoNauren(app) {
  const el = app?.element;
  return !!el?.classList && (el.classList.contains("nauren-rpg") || el.classList.contains("nauren-dialogo"));
}
/** Mudou a configuração: reaplica em todas as janelas do Nauren abertas. */
function naurenReaplicarEscalaInterface() {
  for (const app of foundry.applications.instances?.values?.() ?? []) if (naurenEhJanelaDoNauren(app)) naurenAplicarEscalaEAjuste(app, { ajustarTamanho: false });
  if (naurenHud?.rendered) naurenHud.render();   // o HUD de Combate usa a mesma escala (via --nauren-escala)
}
// Na primeira vez que cada janela do Nauren aparece: escala + cabe na tela. (DialogV2 recebe a classe no hook abaixo e cai aqui também.)
Hooks.on("renderApplicationV2", (app) => {
  if (!naurenEhJanelaDoNauren(app) || app._naurenEscalaAplicada) return;
  app._naurenEscalaAplicada = true;
  naurenAplicarEscalaEAjuste(app);
  // Fecha na hora, sem a animação do Foundry (com o visual escuro a moldura vazia ficava ~1s na tela).
  if (!app._naurenFechaRapido && typeof app.close === "function") {
    const fecharOriginal = app.close.bind(app);
    app.close = (opcoes = {}) => fecharOriginal({ ...opcoes, animate: false });
    app._naurenFechaRapido = true;
  }
  // Minimizar/maximizar: se a janela fecha durante a animação (fechar uma ficha minimizada), o
  // Foundry ainda tentava reposicionar a janela que já não existe ("this[#element] is null").
  if (!app._naurenMaximizaSeguro && typeof app.maximize === "function") {
    const maximizarOriginal = app.maximize.bind(app);
    app.maximize = async (...args) => { if (!app.element) return; try { return await maximizarOriginal(...args); } catch (err) { if (app.element?.isConnected) throw err; } };
    app._naurenMaximizaSeguro = true;
  }
});

/** Estilo comum: toda janela (DialogV2) aberta no sistema recebe a classe "nauren-dialogo". */
Hooks.on("renderDialogV2", (app, element) => {
  const el = element instanceof HTMLElement ? element : app?.element;
  el?.classList?.add("nauren-dialogo");
  // Fecha na hora, sem a animação do Foundry: com o visual escuro, a moldura vazia ficava ~1s na tela.
  if (app && !app._naurenFechaRapido && typeof app.close === "function") {
    const fecharOriginal = app.close.bind(app);
    app.close = (opcoes = {}) => fecharOriginal({ ...opcoes, animate: false });
    app._naurenFechaRapido = true;
  }
  // Telas pequenas: a janela nunca passa da altura da tela (o conteúdo rola por dentro
  // e os botões ficam fixos embaixo); se abriu mais alta que a tela, reposiciona.
  const janela = app?.element ?? el;
  const ajustar = () => {
    if (!janela?.getBoundingClientRect) return;
    const r = janela.getBoundingClientRect(), margem = 10, alturaTela = window.innerHeight;
    if (r.height > alturaTela - 2 * margem || r.top < 0 || r.bottom > alturaTela) {
      const altura = Math.min(r.height, alturaTela - 2 * margem);
      try { app.setPosition({ top: Math.max(margem, (alturaTela - altura) / 2), height: altura }); } catch (err) { /* janela já fechada */ }
    }
  };
  requestAnimationFrame(ajustar);
  setTimeout(ajustar, 120);
});

Hooks.on("preUpdateToken", (tokenDoc, changes, options, userId) => {
  if (changes.x === undefined && changes.y === undefined) return;
  tokenDoc._naurenMoveOrigin = { x: tokenDoc.x, y: tokenDoc.y };
  // Modo pop-up: sem saldo suficiente, segura o movimento e abre a janela (só para quem arrastou).
  if (userId !== game.user.id || options?.naurenMovimentoLiberado || options?.naurenEmpurrado || naurenTokensDeslocando.has(tokenDoc.id)) return;
  const actor = tokenDoc.actor;
  if (!actor?.system?.bonus || !game.combat?.started) return;
  const modoMovPre = naurenModoMovimento(actor);
  if (modoMovPre === "manual") return;
  const origem = { x: tokenDoc.x, y: tokenDoc.y };
  const destino = { x: changes.x ?? tokenDoc.x, y: changes.y ?? tokenDoc.y };
  let distancia = 0;
  try { distancia = canvas.grid.measurePath([origem, destino])?.distance ?? 0; } catch (err) { return; }
  if (!distancia) return;
  // Movimento 0 (Preso, Paralisado...): em vez de travar, explica o motivo e pergunta se quer mover mesmo assim.
  const caidoPre = actor.items.find(i => i.type === "condicao" && i.system.ativo !== false && naurenEhItem(i, "Caído"));
  const movPre = Math.max(0, caidoPre ? Math.floor((actor.system.movimentoTotal ?? 0) / 2) : (actor.system.movimentoTotal ?? 0));
  if (movPre <= 0) {
    setTimeout(() => naurenMoverSemMovimento(tokenDoc, origem, destino, distancia, caidoPre).catch(err => console.error("Nauren RPG | Movimento", err)), 0);
    return false;
  }
  if (modoMovPre !== "popup") return;
  const saldo = naurenMovimentoSaldo.get(actor.uuid) ?? 0;
  if (distancia <= saldo + 0.01) return; // o saldo cobre: anda (o saldo é descontado depois)
  setTimeout(() => naurenJanelaMovimento(tokenDoc, origem, destino, distancia).catch(err => console.error("Nauren RPG | Movimento", err)), 0);
  return false;
});

Hooks.on("updateToken", async (tokenDoc, changes, options, userId) => {
  if (changes.x === undefined && changes.y === undefined) return;
  const origem = tokenDoc._naurenMoveOrigin;
  delete tokenDoc._naurenMoveOrigin;
  if (!origem) return;
  // : pulos causados por "Empurrar ao Acertar" (ver naurenEmpurrarToken)
  // não são movimento voluntário do jogador - não cobram Estamina.
  if (options?.naurenEmpurrado || naurenTokensDeslocando.has(tokenDoc.id)) { naurenTokensDeslocando.delete(tokenDoc.id); return; }

  const actor = tokenDoc.actor;
  if (!actor?.system?.bonus) return; // não é um ator do nosso sistema
  if (!game.combat?.started) return; // só durante combate (em qualquer turno)
  const modoMov = naurenModoMovimento(actor);
  // Pontos do caminho (V13+): o Traço da Aquarela segue o trajeto real, não só a reta.
  const caminhoMov = options?.movement?.[tokenDoc.id]?.passed?.waypoints ?? null;
  if (userId === game.user.id) naurenDepoisDoMovimento(tokenDoc, origem, { x: changes.x ?? tokenDoc.x, y: changes.y ?? tokenDoc.y }, caminhoMov).catch(err => console.warn("Nauren RPG | depois do movimento", err));
  if (modoMov === "manual") return;
  if (modoMov === "popup") {
    let dist = 0;
    try { dist = canvas.grid.measurePath([origem, { x: changes.x ?? tokenDoc.x, y: changes.y ?? tokenDoc.y }])?.distance ?? 0; } catch (err) { return; }
    naurenMovimentoSaldo.set(actor.uuid, Math.max(0, (naurenMovimentoSaldo.get(actor.uuid) ?? 0) - dist));
    return;
  }

  // IMPORTANTE: o destino tem que vir de "changes" (o dado que está sendo
  // aplicado agora), não de tokenDoc.x/y - com o novo sistema de movimento
  // por waypoints do V13, tokenDoc.x/y ainda não refletem o valor novo no
  // instante em que este hook dispara (fica "um passo atrasado").
  const destino = {
    x: changes.x ?? tokenDoc.x,
    y: changes.y ?? tokenDoc.y
  };

  let distancia = 0;
  try {
    distancia = canvas.grid.measurePath([origem, destino])?.distance ?? 0;
  } catch (err) {
    console.warn("Nauren RPG | Não foi possível medir a distância percorrida.", err);
    return;
  }
  if (!distancia) return;

  const estado = naurenMovimentoEmCombate.get(actor.uuid) ?? { distancia: 0, blocosPagos: 0 };
  estado.distancia += distancia;

  const caidoA = actor.items.some(i => i.type === "condicao" && i.system.ativo !== false && naurenEhItem(i, "Caído"));
  const movimentoMax = Math.max(1, caidoA ? Math.floor((actor.system.movimentoTotal || 1) / 2) : (actor.system.movimentoTotal || 1));
  const extraA = actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && !naurenEhCondicaoModelo(i)).reduce((t, i) => Math.max(t, i.system.custoEstaminaExtraAcoes || 0), 0);
  const blocosNecessarios = Math.ceil(estado.distancia / movimentoMax);
  const blocosNovos = blocosNecessarios - estado.blocosPagos;

  // Impulso (Empíreo): em Profusão, o movimento sai de graça gastando um uso.
  const impulso = blocosNovos > 0 && naurenTemEstado(actor, "Profusão") ? actor.items.find(i => i.type === "habilidade" && naurenEhItem(i, "Impulso") && i.system.ativo !== false && naurenUsoDisponivel(i)) : null;
  if (impulso) {
    await naurenConsumirUsoDaHabilidade(impulso);
    estado.blocosPagos += blocosNovos;
    ui.notifications.info(`${actor.name}: Impulso - movimento sem Estamina (1 uso gasto).`);
  } else if (blocosNovos > 0) {
    const estaminaAtual = actor.system.estaminaCombate.value;
    const gasto = Math.min(blocosNovos * (1 + extraA), estaminaAtual);
    if (gasto > 0) {
      await actor.update({ "system.estaminaCombate.value": estaminaAtual - gasto });
      if (userId === game.user.id) await naurenCardMovimento(actor, tokenDoc, [{ label: "Pagou", value: `${gasto} Estamina`, breakdown: "modo automático" }, { label: "No turno", value: `${Math.round(estado.distancia)}m` }]);
      // 0.109.8: cada ação de movimento paga aciona as Condições de "usei uma Ação" (Alvejado).
      if (userId === game.user.id) import("./movimento.mjs").then(m => m.naurenMovimentoComoAcao(actor, Math.floor(gasto / (1 + extraA)))).catch(err => console.warn("Nauren RPG | Alvejado no movimento", err));
    }
    if (gasto < blocosNovos * (1 + extraA)) {
      ui.notifications.warn(`${actor.name} está sem Estamina suficiente pra continuar se movendo tão longe!`);
    }
    estado.blocosPagos += Math.floor(gasto / (1 + extraA));
  }

  naurenMovimentoEmCombate.set(actor.uuid, estado);
});


export { NAUREN_BORDA_BITS_RESERVA, NAUREN_BORDA_DIAMETRO, NAUREN_BORDA_EFEITOS, NAUREN_BORDA_FOLGA, NAUREN_BORDA_MARCA, NAUREN_BORDA_PADRAO, NAUREN_BORDA_PEDRA_PADRAO, NAUREN_BORDA_SEG_POR_COR, naurenAbrirBorda, naurenAplicarEscalaEAjuste, naurenAvisarSeLinkBloqueado, naurenBordaAplicar, naurenBordaBits, naurenBordaCaixaImagem, naurenBordaCaixaVisual, naurenBordaCamadas, naurenBordaCamadasPrevia, naurenBordaCaminhoFolha, naurenBordaCarregarImagem, naurenBordaCenasAvisadas, naurenBordaChave, naurenBordaCodigo, naurenBordaConfig, naurenBordaContornoCasa, naurenBordaCoresNoTempo, naurenBordaCurvaPiscar, naurenBordaDadosPreparados, naurenBordaDadosToken, naurenBordaDesenhar, naurenBordaDesenharImagem, naurenBordaDesenharPedra, naurenBordaDesenharPrevia, naurenBordaDiametro, naurenBordaEhChave, naurenBordaEscalaPara, naurenBordaFalhas, naurenBordaFolha, naurenBordaFolhaPromessa, naurenBordaGarantirTextura, naurenBordaGerando, naurenBordaGerarCanvas, naurenBordaGerarFrente, naurenBordaGerarRecorte, naurenBordaMascaraFrente, naurenBordaTemFrente, naurenBordaImagens, naurenBordaLinkDireto, naurenBordaLinkValido, naurenBordaLoader, naurenBordaMascara, naurenBordaMedirRaio, naurenBordaMisturarHex, naurenBordaMisturarLE, naurenBordaNoCache, naurenBordaPedraCanvas, naurenBordaPedraConfig, naurenBordaPedraNeutra, naurenBordaPedras, naurenBordaPintarTraco, naurenBordaPiscar, naurenBordaPrepararSujeito, naurenBordaPreviaDataUrl, naurenBordaPreviaDoAtor, naurenBordaPreviasCache, naurenBordaQuadros, naurenBordaRaioDoToken, naurenBordaRaios, naurenBordaRecorteCache, naurenBordaRegistrar, naurenBordaTamGrade, naurenBordaTamanhoTextura, naurenBordaTexturas, naurenBordaTickerCores, naurenBordaTokensDaFicha, naurenEhJanelaDoNauren, naurenEscalaInterface, naurenReaplicarEscalaInterface, naurenTextoLinkBloqueado };
