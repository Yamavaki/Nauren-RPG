/* Nauren RPG — Scripts dos itens (0.102).
 *
 * Cada item pode ter vários scripts (flags.nauren.scripts), cada um com o seu "Quando" (gatilho).
 * O script é JavaScript livre (roda como uma função async), com uma caixa de ferramentas pronta (nauren.*)
 * que deixa tudo auditável no chat: cada coisa que ela faz vira uma linha do card do script.
 *
 * Segurança: só o Mestre escreve e aprova. A aprovação guarda a assinatura do texto numa configuração do
 * mundo que só o Mestre grava; código mudado (ou importado de outro mundo) fica parado até ser aprovado.
 */
import { NaurenAlvoHelper, NAUREN_QUERY_APLICAR_CONDICAO, campoCondicaoAplicada, campoDanoBloco, naurenCondicaoDoSistemaPorNome, naurenDeslocarToken, naurenEhCondicaoModelo,
  naurenEmpurrarToken, naurenEscolherPontoNoMapa, naurenFormulaComTokensDoAtor, naurenMedirDistanciaBordas, naurenPostarCard, naurenResolverSelf, naurenUsuarioResponsavel } from "../nauren.mjs";
import { naurenKitJanela, naurenKitSistema } from "./janelas-kit.mjs";
import { NAUREN_GATILHO_EVENTO_OPCOES } from "./ficha-item.mjs";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const Q_NO_MESTRE = "nauren.scriptNoMestre", Q_OP = "nauren.scriptOp", Q_PERGUNTA = "nauren.scriptPergunta";
const PARAMETROS = ["nauren", "item", "ator", "token", "alvo", "alvos", "atacante", "evento", "contexto", "acao", "quem"];
export const NAUREN_SCRIPT_TIPOS = new Set(["arma", "armadura", "consumivel", "habilidade", "magia", "efeito", "peculiaridade", "condicao"]);

/* ============================== QUANDO (gatilhos) ============================== */
// Eventos só deste item: viram um evento do sistema filtrado pelo item usado.
const DO_ITEM = { aoUsar: "euUseiAcao", aoAcertar: "euAcerteiAtaque", aoErrar: "euErreiAtaque", aoDarDano: "euDeiDano" };
export const NAUREN_SCRIPT_QUANDO_ITEM = {
  antesDeUsar: "Antes de usar uma Ação deste item (pode mudar ou cancelar)",
  aoUsar: "Ao usar uma Ação deste item",
  aoAcertar: "Ao acertar um ataque com este item",
  aoErrar: "Ao errar um ataque com este item",
  aoDarDano: "Ao causar dano com este item",
  aoEquipar: "Ao equipar este item",
  aoDesequipar: "Ao desequipar este item",
  aoReceber: "Quando o item entra na ficha",
  aoPerder: "Quando o item sai da ficha",
  antesDeQualquerAcao: "Antes de qualquer Ação do portador (qualquer item)",
  botao: "Botão: quem usa clica em Executar"
};
export function naurenScriptQuandoOpcoes() {
  return { item: NAUREN_SCRIPT_QUANDO_ITEM, portador: NAUREN_GATILHO_EVENTO_OPCOES ?? {} };
}
export function naurenRotuloQuando(q) { const o = naurenScriptQuandoOpcoes(); return o.item[q] ?? o.portador[q] ?? q; }

/* ============================== ASSINATURA E APROVAÇÃO ============================== */
function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0");
}
export function naurenAssinaturaScript(codigo) { const c = String(codigo ?? ""); return `${cyrb53(c, 7)}${cyrb53(c, 1337)}${c.length.toString(16)}`; }
function registro() { try { return game.settings.get("nauren", "scriptsAprovados") ?? {}; } catch (err) { return {}; } }
export function naurenScriptAprovado(s) { const c = String(s?.codigo ?? ""); return !!c.trim() && !!registro()[naurenAssinaturaScript(c)]; }
export async function naurenAprovarScripts(item, ids = null) {
  if (!game.user.isGM) return 0;
  const reg = foundry.utils.deepClone(registro());
  let n = 0;
  for (const s of naurenScriptsDoItem(item)) {
    if (ids && !ids.includes(s.id)) continue;
    if (!String(s.codigo ?? "").trim()) continue;
    const h = naurenAssinaturaScript(s.codigo);
    if (!reg[h]) { reg[h] = { item: item.name, script: s.nome, em: Date.now() }; n++; }
  }
  if (n) await game.settings.set("nauren", "scriptsAprovados", reg);
  return n;
}
export function naurenScriptsLigados() { try { return game.settings.get("nauren", "scriptsItens") !== false; } catch (err) { return true; } }

/* ============================== DADOS ============================== */
export function naurenScriptsDoItem(item) {
  const l = item?.flags?.nauren?.scripts ?? item?.getFlag?.("nauren", "scripts");
  return Array.isArray(l) ? l.filter(s => s && s.id) : [];
}
export function naurenNovoScript(item, base = {}) {
  const ehEquip = ["arma", "armadura"].includes(item?.type);
  return { id: foundry.utils.randomID(10), nome: "Novo script", quando: "aoUsar", ondeRoda: "dono", soAcao: "", soEquipado: ehEquip, ligado: true,
    codigo: "// Escreva aqui o que o item faz. Exemplo:\n// await nauren.curar(ator, \"1d6\");\n", ...base };
}

/* ============================== CAIXA DE FERRAMENTAS ============================== */
// Uma lista só: vira os botões de inserir, a ajuda e a referência da tela cheia.
export const NAUREN_SCRIPT_API = [
  { g: "Rolar e contar", f: "rolar", ins: 'const r = await nauren.rolar("1d6+@poderAtaque", "motivo");', d: "Rola dados (aceita @poderAtaque, @forca…). Devolve { total, texto }." },
  { g: "Rolar e contar", f: "chance", ins: 'if (await nauren.chance(25)) {\n  \n}', d: "Rola 1d100: verdadeiro se sair até o número (25 = 25%)." },
  { g: "Rolar e contar", f: "somar", ins: 'const cargas = await nauren.somar("cargas", 1);', d: "Soma num contador guardado no item e devolve o novo valor." },
  { g: "Rolar e contar", f: "guardar", ins: 'await nauren.guardar("chave", valor);', d: "Guarda um valor no item (fica salvo para a próxima vez)." },
  { g: "Rolar e contar", f: "ler", ins: 'const v = nauren.ler("chave", 0);', d: "Lê um valor guardado (ou o padrão)." },
  { g: "Vida e recursos", f: "dano", ins: 'await nauren.dano(alvo, "2d6");', d: "Causa dano (número ou dados). { verdadeiro: true } ignora reduções e escudo." },
  { g: "Vida e recursos", f: "curar", ins: 'await nauren.curar(ator, "1d6");', d: "Cura até a Vida máxima." },
  { g: "Vida e recursos", f: "recurso", ins: 'await nauren.recurso(ator, "estamina", -1);', d: "Soma (ou tira) vida, mana, estamina, estresse, destino ou um recurso próprio (pelo nome)." },
  { g: "Vida e recursos", f: "valor", ins: 'const est = nauren.valor(ator, "estamina");', d: "Lê o valor atual de um recurso (e .max)." },
  { g: "Condições", f: "aplicarCondicao", ins: 'await nauren.aplicarCondicao(alvo, "Sangramento", 1);', d: "Aplica uma Condição (deste item, do sistema ou do mundo, pelo nome)." },
  { g: "Condições", f: "tirarCondicao", ins: 'await nauren.tirarCondicao(ator, "Sangramento");', d: "Tira a Condição (ou só alguns acúmulos: terceiro valor)." },
  { g: "Condições", f: "temCondicao", ins: 'const n = nauren.temCondicao(alvo, "Sangramento");', d: "Quantos acúmulos da Condição o alvo tem (0 = não tem)." },
  { g: "Alvos e mapa", f: "alvos", ins: "const lista = nauren.alvos();", d: "Os tokens marcados agora por quem usa." },
  { g: "Alvos e mapa", f: "perto", ins: 'const perto = nauren.perto(3, { de: token, quem: "inimigos" });', d: "Tokens até X metros (quem: inimigos, aliados ou todos)." },
  { g: "Alvos e mapa", f: "escolherAlvo", ins: 'const t = await nauren.escolherAlvo("Quem recebe?", { alcance: 6, quem: "aliados" });', d: "Janela para escolher um token." },
  { g: "Alvos e mapa", f: "escolherPonto", ins: 'const p = await nauren.escolherPonto("Para onde?");', d: "Escolher uma casa no mapa. Devolve { x, y }." },
  { g: "Alvos e mapa", f: "empurrar", ins: "await nauren.empurrar(alvo, 2);", d: "Empurra X metros para longe de quem usa (paredes param)." },
  { g: "Alvos e mapa", f: "puxar", ins: "await nauren.puxar(alvo, 2);", d: "Puxa X metros para perto de quem usa." },
  { g: "Alvos e mapa", f: "teleportar", ins: "await nauren.teleportar(token, p.x, p.y);", d: "Coloca o token num ponto (atravessa paredes)." },
  { g: "Alvos e mapa", f: "distancia", ins: "const m = nauren.distancia(token, alvo);", d: "Distância em metros entre dois tokens." },
  { g: "Perguntar e mostrar", f: "perguntar", ins: 'const escolha = await nauren.perguntar("Qual efeito?", ["Fogo", "Gelo"]);', d: "Pergunta com botões e devolve o texto escolhido. { quem: alvo } pergunta ao dono do alvo." },
  { g: "Perguntar e mostrar", f: "anotar", ins: 'nauren.anotar("Carga", "3 de 3");', d: "Põe uma linha no card do script." },
  { g: "Perguntar e mostrar", f: "card", ins: 'await nauren.card("Título", "texto do card");', d: "Manda um card separado no chat agora." },
  { g: "Perguntar e mostrar", f: "aviso", ins: 'nauren.aviso("texto");', d: "Aviso na tela de quem usa (não vai para o chat)." },
  { g: "Perguntar e mostrar", f: "som", ins: 'nauren.som("caminho/do/som.ogg");', d: "Toca um som para todos." },
  { g: "Perguntar e mostrar", f: "esperar", ins: "await nauren.esperar(500);", d: "Espera (milissegundos) antes de continuar." },
  { g: "Ações e itens", f: "somarDano", ins: 'nauren.somarDano(acao, "2d6");', d: "Antes de usar: soma um dano a esta Ação." },
  { g: "Ações e itens", f: "somarCura", ins: 'nauren.somarCura(acao, "1d6");', d: "Antes de usar: soma uma cura a esta Ação." },
  { g: "Ações e itens", f: "somarCondicao", ins: 'nauren.somarCondicao(acao, "Sangramento", 1);', d: "Antes de usar: a Ação também aplica esta Condição." },
  { g: "Ações e itens", f: "somarFacilidade", ins: "nauren.somarFacilidade(acao);", d: "Antes de usar: o teste desta Ação ganha Facilidade (somarDificuldade faz o contrário)." },
  { g: "Ações e itens", f: "somarDificuldade", ins: "nauren.somarDificuldade(acao);", d: "Antes de usar: o teste desta Ação ganha Dificuldade." },
  { g: "Ações e itens", f: "somarCritico", ins: "nauren.somarCritico(acao, 1);", d: "Antes de usar: crítico mais fácil (o Crítico Mínimo cai N)." },
  { g: "Ações e itens", f: "criticoNoAcerto", ins: "nauren.criticoNoAcerto(acao);", d: "Antes de usar: se acertar, o dano é crítico (o acerto continua normal)." },
  { g: "Ações e itens", f: "atacar", ins: "await nauren.atacar(outroAlvo);", d: "Ataque extra num alvo, com a primeira Ação de ataque deste item (sem custo). { item, acao, gratis: false }." },
  { g: "Ações e itens", f: "cancelar", ins: 'return nauren.cancelar("motivo");', d: "Antes de usar: cancela a Ação sem gastar nada." },
  { g: "Ações e itens", f: "usarAcao", ins: 'await nauren.usarAcao("Nome da Ação");', d: "Usa outra Ação (deste item ou de outro: segundo valor)." },
  { g: "Ações e itens", f: "criarItem", ins: 'await nauren.criarItem(ator, "Poção de Vida");', d: "Dá um item (nome do compêndio, UUID ou dados)." },
  { g: "Ações e itens", f: "apagarItem", ins: "await nauren.apagarItem(item);", d: "Apaga um item (ex.: o item quebra)." },
  { g: "Ações e itens", f: "atualizar", ins: 'await nauren.atualizar(item, { "system.equipado": false });', d: "Muda qualquer campo de um ator, item ou token." },
  { g: "Ações e itens", f: "equipado", ins: "if (nauren.equipado()) {\n  \n}", d: "Este item está equipado?" },
  { g: "Ações e itens", f: "emCombate", ins: "if (nauren.emCombate()) {\n  \n}", d: "Há combate rolando? nauren.rodada() diz a rodada." }
];
export const NAUREN_SCRIPT_MODELOS = [
  { nome: "Curar quem usa ao acertar", quando: "aoAcertar", codigo: 'await nauren.curar(ator, "1d6");\n' },
  { nome: "A cada 3 acertos, dano extra", quando: "aoAcertar", codigo: 'const n = await nauren.somar("acertos", 1);\nnauren.anotar("Cargas", `${n % 3 || 3} de 3`);\nif (n % 3 === 0) {\n  await nauren.dano(alvo, "2d6");\n}\n' },
  { nome: "Próximo ataque mais forte (cargas)", quando: "antesDeUsar", codigo: 'if (nauren.ler("carregada", false)) {\n  nauren.somarDano(acao, "2d6");\n  await nauren.guardar("carregada", false);\n  nauren.anotar("Carga liberada", "+2d6 de dano");\n}\n' },
  { nome: "Escolher entre dois efeitos", quando: "botao", codigo: 'const escolha = await nauren.perguntar("O que liberar?", ["Cura", "Mana"]);\nif (escolha === "Cura") await nauren.curar(ator, "2d6");\nif (escolha === "Mana") await nauren.recurso(ator, "mana", 2);\n' },
  { nome: "Condição deste item no alvo", quando: "aoAcertar", codigo: '// Crie a Condição na aba Condições e use o nome dela aqui\nawait nauren.aplicarCondicao(alvo, "Nome da Condição", 1);\n' },
  { nome: "Explodir em volta e quebrar", quando: "vidaZerou", codigo: 'for (const t of nauren.perto(3, { de: token, quem: "todos" })) {\n  await nauren.dano(t, "2d6");\n}\nawait nauren.apagarItem(item);\nawait nauren.card(item.name, "O item se despedaça.");\n' },
  { nome: "Equipar dá uma Condição, tirar remove", quando: "aoEquipar", codigo: 'await nauren.aplicarCondicao(ator, "Nome da Condição", 1);\n// No script "Ao desequipar": await nauren.tirarCondicao(ator, "Nome da Condição");\n' },
  { nome: "Início do turno com pouca Vida", quando: "inicioTurno", codigo: 'const v = nauren.valor(ator, "vida");\nif (v.atual <= v.max / 2) {\n  await nauren.curar(ator, "1d4");\n  await nauren.recurso(ator, "estresse", 1);\n}\n' }
];

/* Utilidades de alvo */
function docDe(x) {
  if (!x) return null;
  if (typeof x === "string") { try { return fromUuidSync(x) ?? null; } catch (err) { return null; } }
  return x;
}
export function naurenAtorDe(x) {
  const d = docDe(x);
  if (!d) return null;
  if (d.documentName === "Actor") return d;
  if (d.documentName === "Token") return d.actor ?? null;
  if (d.document?.documentName === "Token") return d.document.actor ?? null;
  return d.actor ?? null;
}
export function naurenTokenDe(x) {
  const d = docDe(x);
  if (!d) return null;
  if (d.documentName === "Token") return d;
  if (d.document?.documentName === "Token") return d.document;
  const a = d.documentName === "Actor" ? d : d.actor;
  return a?.getActiveTokens?.(true)?.[0]?.document ?? null;
}
const nomeNorm = s => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
const RECURSOS = { vida: "vida", hp: "vida", mana: "mana", estamina: "estaminaCombate", estaminacombate: "estaminaCombate", estresse: "stress", stress: "stress", destino: "dadosDestino", dadosdestino: "dadosDestino" };

/* Operações que precisam do dono/Mestre (o executor responde pela query). */
async function opLocal({ op, uuid, mudancas, nome, acumulos, x, y, dados }) {
  const d = await fromUuid(uuid).catch(() => null);
  switch (op) {
    case "atualizar": if (!d) return false; await d.update(mudancas); return true;
    case "apagar": if (!d) return false; await d.delete(); return true;
    case "criarItem": { const a = d?.actor ?? d; if (!a) return null; const [c] = await a.createEmbeddedDocuments("Item", [dados]); return c?.name ?? null; }
    case "mover": { const t = d?.documentName === "Token" ? d : null; if (!t) return false; await naurenDeslocarToken(t, x, y, { teleporte: true }); return true; }
    case "tirarCondicao": {
      const a = d?.actor ?? d; if (!a) return 0;
      const alvoN = nomeNorm(nome);
      const conds = a.items.filter(i => i.type === "condicao" && !naurenEhCondicaoModelo(i) && nomeNorm(i.name) === alvoN);
      let tirados = 0;
      for (const c of conds) {
        const atual = Number(c.system.acumulos ?? 1) || 1;
        if (acumulos && c.system.acumulativel && atual > acumulos) { await c.update({ "system.acumulos": atual - acumulos }); tirados += acumulos; }
        else { await c.delete(); tirados += atual; }
      }
      return tirados;
    }
  }
  return null;
}
async function op(dados, ator = null) {
  const a = ator ?? naurenAtorDe(dados.uuid);
  const dono = dados.op === "mover" ? docDe(dados.uuid) : (docDe(dados.uuid) ?? a);
  if (dono?.isOwner && (dados.op !== "criarItem" || a?.isOwner)) return opLocal(dados);
  const ex = (a ? NaurenAlvoHelper.usuarioExecutor(a) : null) ?? game.users.activeGM;
  if (!ex) throw new Error("ninguém conectado pode fazer isso agora (sem Mestre)");
  if (ex.id === game.user.id) return opLocal(dados);
  return ex.query(Q_OP, dados, { timeout: 20000 });
}

function criarApi(run) {
  const { item } = run;
  const linha = (label, value, breakdown = "") => { run.linhas.push({ label: String(label), value: value === undefined || value === null || value === "" ? "—" : String(value), breakdown: String(breakdown ?? "") }); };
  const teste = run.teste;
  const valorDe = async (q, motivo = "") => {
    if (typeof q === "number") return { total: q, texto: String(q) };
    const f0 = String(q ?? "0"); const f = naurenFormulaComTokensDoAtor(f0, run.ator);
    const r = await new Roll(f).evaluate();
    return { total: r.total, texto: /d\d/i.test(f) ? `${f0}${f !== f0 ? ` → ${f}` : ""}: ${r.result} = ${r.total}` : `${f0}${f !== f0 ? ` = ${r.total}` : ""}`, roll: r, motivo };
  };
  const precisaAtor = (x, fn) => { const a = naurenAtorDe(x); if (!a) throw new Error(`${fn}: não achei o alvo (use alvo, ator, token ou um UUID)`); return a; };
  const refCondicao = nome => {
    const n = String(nome ?? "").trim();
    if (/^(Compendium|Actor|Item|Scene)\./.test(n)) return n;
    const semSelf = n.startsWith("self:") ? n.slice(5) : n;
    const m = run.ator?.items.find(i => i.type === "condicao" && nomeNorm(i.name) === nomeNorm(semSelf) && (naurenEhCondicaoModelo(i) || i.getFlag("nauren", "deItem")));
    if (m) return m.uuid;
    const sis = naurenCondicaoDoSistemaPorNome(semSelf);
    if (sis) return sis;
    const mundo = game.items?.find(i => i.type === "condicao" && nomeNorm(i.name) === nomeNorm(semSelf));
    if (mundo) return mundo.uuid;
    if (run.ator) { const r = naurenResolverSelf(`self:${semSelf}`, run.ator); if (r) return r; }
    return "";
  };
  const tokensNaCena = () => (canvas?.tokens?.placeables ?? []).filter(t => t.actor && !t.actor.getFlag?.("nauren", "entidade")?.ativa);
  // "aliados"/"inimigos" são sempre do ponto de vista de quem tem o item (mesmo medindo a partir de outro token).
  const filtroQuem = (quem, ref) => t => {
    if (!quem || quem === "todos") return true;
    const disp = run.token?.disposition ?? ref?.disposition ?? 0;
    return quem === "aliados" ? t.document.disposition === disp : t.document.disposition !== disp;
  };
  const inicial = f => { try { if (typeof f?.getInitialValue === "function") return f.getInitialValue({}); } catch (err) { /* segue */ } if (f?.fields) return Object.fromEntries(Object.entries(f.fields).map(([k, x]) => [k, inicial(x)])); const v = typeof f?.initial === "function" ? f.initial() : f?.initial; return v === undefined ? (f?.constructor?.name === "ArrayField" ? [] : null) : foundry.utils.deepClone(v); };
  // Ação nova só depois que a Ação que disparou o evento terminar (senão uma se mistura com a outra).
  // Em "Antes de usar" não espera: a Ação em curso é a que está esperando este script.
  const esperarAcaoEmCurso = async sheet => {
    if (/^antesDe/.test(run.script?.quando ?? "")) return;
    const p = sheet?._acaoEmCurso;
    if (p && typeof p.then === "function") await Promise.race([p.catch(() => {}), new Promise(r => setTimeout(r, 30000))]);
  };
  const novoBloco = (campoFn, extra) => ({ ...Object.fromEntries(Object.entries(campoFn()).map(([k, f]) => [k, inicial(f)])), ...extra });
  const api = {
    teste,
    async rolar(formula, motivo = "") { const v = await valorDe(formula, motivo); linha(`Rolou${motivo ? ` (${motivo})` : ""}`, v.total, v.texto); return v; },
    async chance(pct, motivo = "") { const r = await new Roll("1d100").evaluate(); const ok = r.total <= Number(pct); linha(`Chance ${pct}%${motivo ? ` (${motivo})` : ""}`, ok ? "sim" : "não", `1d100 = ${r.total}`); return ok; },
    ler(chave, padrao = null) { const v = item.getFlag?.("nauren", "scriptDados")?.[chave]; return v === undefined ? padrao : foundry.utils.deepClone(v); },
    async guardar(chave, valor) {
      const k = String(chave).replace(/[^\w-]/g, "_");
      if (teste) { linha("Guardaria", `${k} = ${JSON.stringify(valor)}`, "teste: nada gravado"); run.dadosTeste[k] = valor; return valor; }
      await op({ op: "atualizar", uuid: item.uuid, mudancas: { [`flags.nauren.scriptDados.${k}`]: valor } }, run.ator);
      return valor;
    },
    async somar(chave, n = 1) { const k = String(chave).replace(/[^\w-]/g, "_"); const atual = Number(run.dadosTeste[k] ?? api.ler(k, 0)) || 0; const novo = atual + Number(n || 0); await api.guardar(k, novo); return novo; },
    async dano(alvo, quanto, opc = {}) {
      const a = precisaAtor(alvo, "dano"); const v = await valorDe(quanto); const n = Math.max(0, Math.round(v.total));
      if (teste || n <= 0) { linha(`Dano em ${a.name}`, n, `${v.texto}${teste ? " (teste: nada aplicado)" : ""}`); return n; }
      const red = opc.verdadeiro ? 0 : (a.system.reducaoDanoTotal ?? 0);
      const final = opc.verdadeiro ? n : Math.max(0, NaurenAlvoHelper.aplicarReducaoPercentual(a, n) - red);
      const esc2 = opc.verdadeiro ? { escudoConsumido: 0, danoNaVida: final, escudoRestante: a.system.escudo?.value ?? 0 } : NaurenAlvoHelper.calcularDanoComEscudo(a, final);
      const antes = a.system.vida?.value ?? 0, depois = Math.max(0, antes - esc2.danoNaVida);
      const upd = { "system.vida.value": depois }; if (esc2.escudoConsumido > 0) upd["system.escudo.value"] = esc2.escudoRestante;
      if (!opc.verdadeiro) NaurenAlvoHelper.consumirAoSofrerDano?.(a, n)?.catch?.(() => {});
      a._naurenVidaAntigaManual = antes;
      await NaurenAlvoHelper.atualizarAtorSeguro(a, upd);
      const aj = [v.texto]; if (final !== n) aj.push(`${n} antes das reduções`); if (red) aj.push(`Redução ${red}`); if (esc2.escudoConsumido) aj.push(`Escudo absorveu ${esc2.escudoConsumido}`); if (opc.verdadeiro) aj.push("dano verdadeiro");
      linha(`Dano em ${a.name}`, final, aj.join(" • "));
      return final;
    },
    async curar(alvo, quanto) {
      const a = precisaAtor(alvo, "curar"); const v = await valorDe(quanto); const n = Math.max(0, Math.round(v.total));
      const antes = a.system.vida?.value ?? 0, max = a.system.vida?.max ?? 0, depois = Math.min(max, antes + n);
      if (!teste && depois !== antes) await NaurenAlvoHelper.atualizarAtorSeguro(a, { "system.vida.value": depois });
      linha(`Cura em ${a.name}`, depois - antes, `${v.texto}${depois - antes < n ? " (limitado pela Vida máxima)" : ""}${teste ? " (teste)" : ""}`);
      return depois - antes;
    },
    valor(alvo, nome) {
      const a = precisaAtor(alvo, "valor"); const k = RECURSOS[nomeNorm(nome).replace(/\s+/g, "")];
      if (k) { const o = a.system[k] ?? {}; return { atual: Number(o.value ?? 0), max: Number(o.max ?? 0) }; }
      const r = (a.system.recursosCustom ?? []).find(x => x.id === nome || nomeNorm(x.nome) === nomeNorm(nome));
      return r ? { atual: Number(r.valor ?? 0), max: Number(r.max ?? 0) } : { atual: 0, max: 0 };
    },
    async recurso(alvo, nome, delta) {
      const a = precisaAtor(alvo, "recurso"); const v = await valorDe(delta); const d = Math.round(v.total);
      const k = RECURSOS[nomeNorm(nome).replace(/\s+/g, "")];
      let rot = nome, antes = 0, depois = 0, upd = null;
      if (k) {
        const o = a.system[k] ?? {}; antes = Number(o.value ?? 0); const max = Number(o.max ?? 0);
        depois = Math.max(0, max > 0 ? Math.min(max, antes + d) : (k === "stress" ? antes + d : Math.min(antes, antes + d)));
        rot = { vida: "Vida", mana: "Mana", estaminaCombate: "Estamina", stress: "Estresse", dadosDestino: "Dados de Destino" }[k];
        upd = { [`system.${k}.value`]: depois };
      } else {
        const lista = foundry.utils.deepClone(a.system.recursosCustom ?? []);
        const r = lista.find(x => x.id === nome || nomeNorm(x.nome) === nomeNorm(nome));
        if (!r) throw new Error(`recurso: ${a.name} não tem "${nome}"`);
        antes = Number(r.valor ?? 0); depois = Math.max(0, Math.min(Number(r.max ?? 0) || antes + d, antes + d)); r.valor = depois; rot = r.nome || nome;
        upd = { "system.recursosCustom": lista };
      }
      if (!teste && depois !== antes) await NaurenAlvoHelper.atualizarAtorSeguro(a, upd);
      linha(`${rot} de ${a.name}`, `${d >= 0 ? "+" : ""}${d}`, `${antes} → ${depois}${typeof delta === "string" ? ` (${v.texto})` : ""}${teste ? " (teste)" : ""}`);
      return depois - antes;
    },
    async aplicarCondicao(alvo, nome, acumulos = 1) {
      const a = precisaAtor(alvo, "aplicarCondicao"); const uuid = refCondicao(nome);
      if (!uuid) throw new Error(`aplicarCondicao: não achei a Condição "${nome}"`);
      const v = await valorDe(acumulos); const n = Math.max(1, Math.round(v.total));
      if (teste) { linha(`Condição em ${a.name}`, nome, `${n} acúmulo(s) (teste: nada aplicado)`); return nome; }
      const conj = run.token?.uuid ?? run.ator?.uuid ?? "";
      const ex = NaurenAlvoHelper.usuarioExecutor(a);
      const r = ex?.id === game.user.id ? await NaurenAlvoHelper.aplicarCondicao(a, uuid, n, null, 0, 0, "", "1", "", conj)
        : await ex?.query(NAUREN_QUERY_APLICAR_CONDICAO, { actorUuid: a.uuid, uuid, acumulos: n, conjuradorUuid: conj }, { timeout: 20000 }).catch(() => null);
      linha(`Condição em ${a.name}`, r ?? nome, n > 1 ? `${n} acúmulos${typeof acumulos === "string" ? ` (${v.texto})` : ""}` : "");
      return r;
    },
    async tirarCondicao(alvo, nome, acumulos = null) {
      const a = precisaAtor(alvo, "tirarCondicao");
      if (teste) { linha(`Tiraria de ${a.name}`, nome, acumulos ? `${acumulos} acúmulo(s)` : "tudo"); return 0; }
      const n = await op({ op: "tirarCondicao", uuid: a.uuid, nome, acumulos: acumulos ? Number(acumulos) : null }, a);
      if (n) linha(`Tirou de ${a.name}`, nome, acumulos ? `${n} acúmulo(s)` : "");
      return n ?? 0;
    },
    temCondicao(alvo, nome) {
      const a = precisaAtor(alvo, "temCondicao");
      return a.items.filter(i => i.type === "condicao" && i.system.ativo !== false && !naurenEhCondicaoModelo(i) && nomeNorm(i.name) === nomeNorm(nome)).reduce((s, i) => s + (Number(i.system.acumulos ?? 1) || 1), 0);
    },
    condicoes(alvo) { const a = precisaAtor(alvo, "condicoes"); return a.items.filter(i => i.type === "condicao" && i.system.ativo !== false && !naurenEhCondicaoModelo(i)).map(i => i.name); },
    alvos() { return [...(game.user.targets ?? [])].map(t => t.document); },
    perto(metros, opc = {}) {
      const de = naurenTokenDe(opc.de ?? run.token);
      if (!de?.object) return [];
      return tokensNaCena().filter(t => t !== de.object && (opc.incluirEu || t.actor !== run.ator) && filtroQuem(opc.quem, de)(t)
        && (() => { try { return naurenMedirDistanciaBordas(de.object, t) <= Number(metros); } catch (err) { return false; } })()).map(t => t.document);
    },
    distancia(a, b) { const ta = naurenTokenDe(a)?.object, tb = naurenTokenDe(b)?.object; if (!ta || !tb) return Infinity; try { return naurenMedirDistanciaBordas(ta, tb); } catch (err) { return Infinity; } },
    async escolherAlvo(texto = "Escolha um alvo", opc = {}) {
      const de = naurenTokenDe(opc.de ?? run.token);
      let lista = tokensNaCena().filter(t => filtroQuem(opc.quem, de)(t) && (opc.incluirEu || t.actor !== run.ator));
      if (opc.alcance && de?.object) lista = lista.filter(t => { try { return naurenMedirDistanciaBordas(de.object, t) <= Number(opc.alcance); } catch (err) { return false; } });
      if (!lista.length) { linha("Escolher alvo", "ninguém ao alcance"); return null; }
      let escolhido = null;
      const content = `<p class="nt-sc-perg">${esc(texto)}</p><div class="nt-sc-alvos">${lista.map(t => `<button type="button" class="nt-sc-alvo" data-id="${t.id}"><img src="${esc(t.document.texture?.src ?? t.actor.img)}" alt=""><span>${esc(t.document.name)}</span></button>`).join("")}</div>`;
      await foundry.applications.api.DialogV2.wait({ ...naurenKitJanela(run.ator), window: { title: item.name }, content, rejectClose: false, buttons: [{ action: "nenhum", label: "Cancelar" }],
        render: (ev, dlg) => { (dlg.element ?? ev?.target?.element)?.querySelectorAll(".nt-sc-alvo").forEach(b => b.addEventListener("click", () => { escolhido = lista.find(t => t.id === b.dataset.id)?.document ?? null; dlg.close(); })); } }).catch(() => null);
      if (escolhido) linha("Escolheu", escolhido.name);
      return escolhido;
    },
    async escolherPonto(texto = "Escolha um ponto") { const p = await naurenEscolherPontoNoMapa({ nome: texto, origem: run.token?.object ?? null }); return p ? { x: p.x, y: p.y } : null; },
    async empurrar(alvo, metros, opc = {}) { const t = naurenTokenDe(alvo); const de = naurenTokenDe(opc.de ?? run.token); if (!t || !de) return; if (teste) { linha(`Empurraria ${t.name}`, `${metros} m`); return; } await naurenEmpurrarToken(t, de.uuid, String(metros), "afastar"); linha(`Empurrou ${t.name}`, `${metros} m`); },
    async puxar(alvo, metros, opc = {}) { const t = naurenTokenDe(alvo); const de = naurenTokenDe(opc.de ?? run.token); if (!t || !de) return; if (teste) { linha(`Puxaria ${t.name}`, `${metros} m`); return; } await naurenEmpurrarToken(t, de.uuid, String(metros), "puxar"); linha(`Puxou ${t.name}`, `${metros} m`); },
    async teleportar(alvo, x, y) { const t = naurenTokenDe(alvo); if (!t) return; if (teste) { linha(`Teleportaria ${t.name}`, `${Math.round(x)}, ${Math.round(y)}`); return; } await op({ op: "mover", uuid: t.uuid, x, y }, t.actor); linha(`Teleportou ${t.name}`, "—"); },
    async perguntar(texto, opcoes = ["Sim", "Não"], opc = {}) {
      const quem = opc.quem ? naurenAtorDe(opc.quem) : null;
      const u = quem ? naurenUsuarioResponsavel(quem) : null;
      let r;
      if (u && u.id !== game.user.id && u.active) r = await u.query(Q_PERGUNTA, { titulo: item.name, texto, opcoes, atorUuid: quem.uuid }, { timeout: 120000 }).catch(() => null);
      else r = await perguntarLocal({ titulo: item.name, texto, opcoes, atorUuid: (quem ?? run.ator)?.uuid });
      linha(String(texto).slice(0, 60), r ?? "sem resposta");
      return r;
    },
    anotar(rotulo, valor) { if (valor === undefined) linha("", rotulo); else linha(rotulo, valor); },
    async card(titulo, conteudo) {
      const linhas = Array.isArray(conteudo) ? conteudo.map(l => typeof l === "string" ? { label: "", value: l } : l) : [{ label: "", value: String(conteudo ?? "") }];
      return naurenPostarCard({ ator: run.ator, titulo: String(titulo), icone: item.img, fonte: item.name, linhas });
    },
    aviso(texto) { ui.notifications?.info(String(texto)); },
    som(src, volume = 0.8) { try { foundry.audio.AudioHelper.play({ src, volume, autoplay: true, loop: false }, true); } catch (err) { console.warn("Nauren RPG | som do script", err); } },
    esperar(ms) { return new Promise(r => setTimeout(r, Math.max(0, Number(ms) || 0))); },
    somarDano(acaoAlvo, formula, opc = {}) {
      if (!acaoAlvo) throw new Error("somarDano: só funciona em \"Antes de usar\" (a Ação vem em acao)");
      acaoAlvo.danos = [...(acaoAlvo.danos ?? []), novoBloco(campoDanoBloco, { formula: String(formula), nomeCustom: opc.nome ?? "" })];
      linha("Dano a mais", formula, opc.nome ?? "");
      return acaoAlvo;
    },
    somarCura(acaoAlvo, formula) {
      if (!acaoAlvo) throw new Error("somarCura: só funciona em \"Antes de usar\"");
      const base = (acaoAlvo.curas ?? [])[0];
      acaoAlvo.curas = [...(acaoAlvo.curas ?? []), base ? { ...foundry.utils.deepClone(base), formula: String(formula) } : { formula: String(formula), aplicarNoAlvo: true }];
      linha("Cura a mais", formula);
      return acaoAlvo;
    },
    somarCondicao(acaoAlvo, nome, acumulos = 1) {
      if (!acaoAlvo) throw new Error("somarCondicao: só funciona em \"Antes de usar\"");
      const uuid = refCondicao(nome); if (!uuid) throw new Error(`somarCondicao: não achei a Condição "${nome}"`);
      acaoAlvo.condicoesAplicadas = [...(acaoAlvo.condicoesAplicadas ?? []), novoBloco(campoCondicaoAplicada, { uuid, acumulos: String(acumulos) })];
      linha("Condição a mais", nome, `${acumulos} acúmulo(s)`);
      return acaoAlvo;
    },
    somarFacilidade(acaoAlvo, n = 1) {
      if (!acaoAlvo) throw new Error("somarFacilidade: só funciona em \"Antes de usar\"");
      acaoAlvo._scriptFacilidade = (Number(acaoAlvo._scriptFacilidade) || 0) + Number(n || 1);
      linha("Facilidade", `+${n}`, "no teste desta Ação");
      return acaoAlvo;
    },
    somarDificuldade(acaoAlvo, n = 1) {
      if (!acaoAlvo) throw new Error("somarDificuldade: só funciona em \"Antes de usar\"");
      acaoAlvo._scriptFacilidade = (Number(acaoAlvo._scriptFacilidade) || 0) - Number(n || 1);
      linha("Dificuldade", `+${n}`, "no teste desta Ação");
      return acaoAlvo;
    },
    somarCritico(acaoAlvo, n = 1) {
      if (!acaoAlvo) throw new Error("somarCritico: só funciona em \"Antes de usar\"");
      acaoAlvo._scriptCritico = (Number(acaoAlvo._scriptCritico) || 0) + Number(n || 1);
      linha("Crítico mais fácil", `−${n}`, "no Crítico Mínimo desta Ação");
      return acaoAlvo;
    },
    criticoNoAcerto(acaoAlvo, motivo = "") {
      if (!acaoAlvo) throw new Error("criticoNoAcerto: só funciona em \"Antes de usar\"");
      acaoAlvo._scriptCriticoNoAcerto = motivo || item.name;
      linha("Crítico se acertar", "sim", "o acerto continua normal; o dano dobra");
      return acaoAlvo;
    },
    async atacar(alvo, opc = {}) {
      const t = naurenTokenDe(alvo);
      if (!t) throw new Error("atacar: não achei o alvo (use um token)");
      const it = opc.item ? (typeof opc.item === "string" ? run.ator?.items.find(i => nomeNorm(i.name) === nomeNorm(opc.item)) ?? docDe(opc.item) : opc.item) : item;
      const sheet = run.ator?.sheet;
      if (!it || !sheet?._executarAcao) throw new Error("atacar: item ou ficha não encontrados");
      const acoes = it.system?.acoes ?? [];
      let idx = typeof opc.acao === "number" ? opc.acao : opc.acao ? acoes.findIndex(a => nomeNorm(a.nome) === nomeNorm(opc.acao)) : acoes.findIndex(a => a.ehAtaque);
      if (idx < 0) idx = 0;
      if (!acoes[idx]) throw new Error(`atacar: ${it.name} não tem essa Ação`);
      if (teste) { linha(`Atacaria ${t.name}`, `${it.name} — ${acoes[idx].nome}`, opc.gratis === false ? "" : "sem custo"); return; }
      await esperarAcaoEmCurso(sheet);
      const antes = [...(game.user.targets ?? [])].map(x => x.id);
      const gratisAntes = sheet._acaoGratis, origemAntes = sheet._naurenOrigemScript;
      linha(`Ataque extra em ${t.name}`, `${it.name} — ${acoes[idx].nome}`, opc.gratis === false ? "" : "sem custo");
      try {
        if (typeof game.user.updateTokenTargets === "function") game.user.updateTokenTargets([t.id]);
        else { for (const x of game.user.targets ?? []) x.setTarget(false, { releaseOthers: false }); t.object?.setTarget(true, { releaseOthers: true }); }
        if (opc.gratis !== false) sheet._acaoGratis = { motivo: `${item.name}: ataque extra`, fonte: item.name };
        sheet._naurenOrigemScript = `${item.uuid}|${run.script?.id ?? ""}`;
        await sheet._executarAcao(it, idx);
      } finally {
        sheet._acaoGratis = gratisAntes; sheet._naurenOrigemScript = origemAntes;
        if (typeof game.user.updateTokenTargets === "function") game.user.updateTokenTargets(antes);
      }
    },
    cancelar(motivo = "") { run.cancelado = motivo || "cancelada pelo script"; linha("Ação cancelada", motivo || "—"); return false; },
    async usarAcao(nomeOuIndice, outroItem = null) {
      const it = outroItem ? (typeof outroItem === "string" ? run.ator?.items.find(i => i.name === outroItem) ?? docDe(outroItem) : outroItem) : item;
      if (!it || !run.ator?.sheet?._executarAcao) throw new Error("usarAcao: item ou ficha não encontrados");
      const acoes = it.system.acoes ?? [];
      const idx = typeof nomeOuIndice === "number" ? nomeOuIndice : acoes.findIndex(a => nomeNorm(a.nome) === nomeNorm(nomeOuIndice));
      if (idx < 0 || !acoes[idx]) throw new Error(`usarAcao: "${nomeOuIndice}" não existe em ${it.name}`);
      if (teste) { linha("Usaria", `${it.name} — ${acoes[idx].nome}`); return; }
      await esperarAcaoEmCurso(run.ator.sheet);
      return run.ator.sheet._executarAcao(it, idx);
    },
    async criarItem(alvo, dados) {
      const a = precisaAtor(alvo, "criarItem");
      let d = dados;
      if (typeof dados === "string") {
        let doc = docDe(dados);
        if (!doc) for (const p of game.packs.filter(pk => pk.documentName === "Item")) { const e = p.index.find(x => nomeNorm(x.name) === nomeNorm(dados)); if (e) { doc = await p.getDocument(e._id); break; } }
        doc ??= game.items?.find(i => nomeNorm(i.name) === nomeNorm(dados));
        if (!doc) throw new Error(`criarItem: não achei "${dados}"`);
        d = doc.toObject(); delete d._id;
      }
      if (teste) { linha(`Daria a ${a.name}`, d.name); return d.name; }
      const n = await op({ op: "criarItem", uuid: a.uuid, dados: d }, a);
      linha(`Recebeu (${a.name})`, n ?? d.name);
      return n;
    },
    async apagarItem(alvoItem) { const it = docDe(alvoItem) ?? alvoItem; if (!it?.uuid) return false; if (teste) { linha("Apagaria", it.name); return false; } linha("Apagou", it.name); return op({ op: "apagar", uuid: it.uuid }, it.actor ?? null); },
    async atualizar(doc, mudancas) { const d = docDe(doc) ?? doc; if (!d?.uuid) throw new Error("atualizar: documento não encontrado"); if (teste) { linha(`Mudaria ${d.name}`, Object.keys(mudancas ?? {}).join(", ")); return false; } return op({ op: "atualizar", uuid: d.uuid, mudancas }, naurenAtorDe(d)); },
    equipado() { return !!item.system?.equipado; },
    emCombate() { return !!game.combat?.started; },
    rodada() { return game.combat?.round ?? 0; },
    ator: x => naurenAtorDe(x),
    token: x => naurenTokenDe(x)
  };
  return api;
}

async function perguntarLocal({ titulo, texto, opcoes, atorUuid }) {
  const ator = atorUuid ? naurenAtorDe(atorUuid) : null;
  const lista = (Array.isArray(opcoes) && opcoes.length ? opcoes : ["Sim", "Não"]).map(String);
  const r = await foundry.applications.api.DialogV2.wait({ ...naurenKitJanela(ator), window: { title: titulo }, content: `<p class="nt-sc-perg">${esc(texto)}</p>`, rejectClose: false,
    buttons: lista.map((o, i) => ({ action: `o${i}`, label: o, default: i === 0 })) }).catch(() => null);
  const i = typeof r === "string" && r.startsWith("o") ? Number(r.slice(1)) : -1;
  return lista[i] ?? null;
}

/* ============================== EXECUÇÃO ============================== */
function contextoLimpo(ctx) { try { return JSON.parse(JSON.stringify(ctx ?? {}, (k, v) => (v && typeof v === "object" && (v.documentName || v instanceof foundry.abstract.DataModel)) ? (v.uuid ?? null) : v)); } catch (err) { return {}; } }
function linhaDoErro(err) { const m = /<anonymous>:(\d+):(\d+)/.exec(String(err?.stack ?? "")); return m ? Math.max(1, Number(m[1]) - 2) : null; }
const avisados = new Set();
async function registrarLog(item, entrada) {
  if (!item?.isOwner || !item.id) return;
  const log = [entrada, ...(item.getFlag("nauren", "scriptLog") ?? [])].slice(0, 8);
  await item.update({ "flags.nauren.scriptLog": log }, { render: false, naurenScriptLog: true }).catch(() => {});
}
/**
 * Roda um script. Devolve o que o script devolveu (false = cancelar, em "Antes de usar").
 * opc: { evento, contexto, quem (ator do evento), acao (cópia da Ação, em "Antes de usar"), teste (só mostra), local }
 */
export async function naurenRodarScript(item, s, { evento = s?.quando, contexto = {}, quem = null, acao = null, teste = false, local = false } = {}) {
  if (!item || !s) return undefined;
  if (!teste) {
    if (!naurenScriptsLigados()) return undefined;
    if (!naurenScriptAprovado(s)) {
      const k = `${item.uuid}|${s.id}`;
      if (game.user.isGM && !avisados.has(k)) { avisados.add(k); ui.notifications?.warn(`${item.name}: o script "${s.nome}" mudou e precisa ser aprovado na aba Script.`); }
      return undefined;
    }
    if (s.ondeRoda === "mestre" && !game.user.isGM && !local && !acao) {
      const gm = game.users.activeGM;
      if (!gm) { ui.notifications?.warn(`${item.name}: "${s.nome}" roda no computador do Mestre, e ele não está conectado.`); return undefined; }
      gm.query(Q_NO_MESTRE, { itemUuid: item.uuid, scriptId: s.id, evento, contexto: contextoLimpo(contexto) }, { timeout: 60000 }).catch(err => console.warn("Nauren RPG | script no Mestre", err));
      return undefined;
    }
  }
  const ator = item.parent?.documentName === "Actor" ? item.parent : (item.actor ?? null);
  const token = ator?.getActiveTokens?.(true)?.[0]?.document ?? null;
  const alvoRef = contexto.alvoTokenUuid || contexto.alvoUuid || [...(game.user.targets ?? [])][0]?.document?.uuid || "";
  const alvoDoc = alvoRef ? (naurenTokenDe(alvoRef) ?? naurenAtorDe(alvoRef)) : null;
  const atacante = contexto.atacanteTokenUuid ? (naurenTokenDe(contexto.atacanteTokenUuid) ?? null) : null;
  const run = { item, ator, token, linhas: [], teste, script: s, cancelado: null, dadosTeste: {} };
  const api = criarApi(run);
  let fn, erro = null, ret;
  try { fn = new AsyncFunction(...PARAMETROS, String(s.codigo ?? "")); } catch (err) { erro = err; erro.sintaxe = true; }
  if (fn) {
    try { ret = await fn(api, item, ator, token, alvoDoc, api.alvos(), atacante, evento, contexto, acao, quem); } catch (err) { erro = err; }
  }
  const linhaErr = erro ? (erro.sintaxe ? null : linhaDoErro(erro)) : null;
  if (erro) {
    console.warn(`Nauren RPG | Script "${s.nome}" de ${item.name}:`, erro);
    const msg = `${erro.sintaxe ? "Erro de escrita" : "Erro"}${linhaErr ? ` na linha ${linhaErr}` : ""}: ${erro.message ?? erro}`;
    if (game.user.isGM || teste) ui.notifications?.error(`${item.name} · ${s.nome}: ${msg}`);
    run.linhas.push({ label: "Erro no script", value: msg.slice(0, 160), breakdown: "o resto do item continua funcionando" });
  }
  if (run.linhas.length) {
    if (teste) {
      const linhas = run.linhas.map(l => `<li><b>${esc(l.label)}</b> ${esc(l.value)}${l.breakdown ? ` <small>${esc(l.breakdown)}</small>` : ""}</li>`).join("");
      await ChatMessage.create({ content: `<div class="nt-sc-teste"><h4><i class="fas fa-flask"></i> Teste: ${esc(item.name)} · ${esc(s.nome)}</h4><ul>${linhas}</ul></div>`, whisper: game.users.filter(u => u.isGM).map(u => u.id), speaker: ChatMessage.getSpeaker({ user: game.user }) }).catch(() => {});
    } else {
      await naurenPostarCard({ ator, titulo: item.name, icone: item.img, fonte: `Script: ${s.nome}`, linhas: run.linhas, flags: { scriptItem: item.uuid } }).catch(err => console.warn("Nauren RPG | card do script", err));
    }
  }
  if (!teste) registrarLog(item, { em: Date.now(), script: s.nome, evento, ok: !erro, msg: erro ? `${linhaErr ? `linha ${linhaErr}: ` : ""}${erro.message ?? erro}`.slice(0, 140) : run.linhas.map(l => `${l.label} ${l.value}`.trim()).slice(0, 3).join(" · ").slice(0, 140) || "sem mudanças" });
  if (erro) return undefined;
  return run.cancelado ? false : ret;
}
function passaFiltros(item, s, contexto, { ignorarEquipado = false } = {}) {
  if (!s.ligado) return false;
  if (!ignorarEquipado && s.soEquipado && ["arma", "armadura"].includes(item.type) && !item.system?.equipado) return false;
  if (s.soAcao && contexto?.acaoNome && nomeNorm(s.soAcao) !== nomeNorm(contexto.acaoNome)) return false;
  if (item.type !== "condicao" && item.system?.ativo === false && ["habilidade", "efeito"].includes(item.type)) return false;
  if (naurenEhCondicaoModelo(item)) return false;
  return true;
}
/** Chamado pelo processamento de gatilhos do sistema, para cada personagem que pode reagir ao evento. */
export async function naurenScriptsNoEvento(tipoEvento, ator, contexto = {}, quem = null) {
  if (!ator?.items || !naurenScriptsLigados()) return;
  for (const item of ator.items) {
    const lista = naurenScriptsDoItem(item);
    if (!lista.length) continue;
    for (const s of lista) {
      // O ataque extra (nauren.atacar) não dispara de novo o script que o pediu.
      if (contexto?.origemScript && contexto.origemScript === `${item.uuid}|${s.id}`) continue;
      const casa = s.quando === tipoEvento || (DO_ITEM[s.quando] === tipoEvento && contexto?.itemUsadoUuid === item.uuid);
      if (!casa || !passaFiltros(item, s, contexto)) continue;
      await naurenRodarScript(item, s, { evento: tipoEvento, contexto, quem }).catch(err => console.warn("Nauren RPG | script", err));
    }
  }
}
/** "Antes de usar": devolve a Ação mudada, false para cancelar, ou null se nenhum script rodou. */
export async function naurenScriptsAntesDaAcao(ator, item, acao, idx) {
  if (!naurenScriptsLigados() || !ator) return null;
  const pares = [];
  for (const it of ator.items) for (const s of naurenScriptsDoItem(it)) {
    if (it === item && s.quando === "antesDeUsar") pares.push([it, s]);
    else if (s.quando === "antesDeQualquerAcao") pares.push([it, s]);
  }
  if (!pares.length) return null;
  const copia = foundry.utils.deepClone(acao);
  const contexto = { itemUsadoUuid: item.uuid, itemNome: item.name, acaoNome: acao?.nome ?? "", acaoIndice: idx };
  let rodou = false;
  for (const [it, s] of pares) {
    if (!passaFiltros(it, s, contexto)) continue;
    rodou = true;
    const r = await naurenRodarScript(it, s, { evento: s.quando, contexto, acao: copia, local: true });
    if (r === false) return false;
  }
  return rodou ? copia : null;
}
async function rodarQuando(item, quando, contexto = {}) {
  for (const s of naurenScriptsDoItem(item)) {
    if (s.quando !== quando || !passaFiltros(item, s, contexto, { ignorarEquipado: true })) continue;
    await naurenRodarScript(item, s, { evento: quando, contexto }).catch(err => console.warn("Nauren RPG | script", err));
  }
}
export async function naurenExecutarScriptBotao(item, scriptId) {
  const s = naurenScriptsDoItem(item).find(x => x.id === scriptId);
  if (!s) return;
  if (!naurenScriptAprovado(s)) { ui.notifications.warn(`"${s.nome}" ainda não foi aprovado pelo Mestre.`); return; }
  return naurenRodarScript(item, s, { evento: "botao", contexto: {} });
}

/* ============================== REGISTRO E GANCHOS ============================== */
export function naurenItensScriptsInit() {
  game.settings.register("nauren", "scriptsItens", { name: "Scripts dos itens", hint: "Ligado: os scripts aprovados pelo Mestre (aba Script da ficha de item) rodam nos momentos escolhidos. Desligado: nenhum script roda.", scope: "world", config: true, type: Boolean, default: true });
  game.settings.register("nauren", "scriptsAprovados", { scope: "world", config: false, type: Object, default: {} });
  CONFIG.queries ??= {};
  CONFIG.queries[Q_NO_MESTRE] = async ({ itemUuid, scriptId, evento, contexto }) => {
    if (!game.user.isGM) return false;
    const item = await fromUuid(itemUuid).catch(() => null);
    const s = naurenScriptsDoItem(item).find(x => x.id === scriptId);
    if (!item || !s || !naurenScriptAprovado(s)) return false;
    await naurenRodarScript(item, s, { evento, contexto, local: true });
    return true;
  };
  CONFIG.queries[Q_OP] = async dados => opLocal(dados);
  CONFIG.queries[Q_PERGUNTA] = async dados => perguntarLocal(dados);
}
export function naurenItensScriptsHooks() {
  Hooks.on("updateItem", (item, changes, opc, userId) => {
    if (userId !== game.user.id || opc?.naurenScriptLog || item.parent?.documentName !== "Actor") return;
    const eq = foundry.utils.getProperty(changes, "system.equipado");
    if (eq === true) rodarQuando(item, "aoEquipar");
    else if (eq === false) rodarQuando(item, "aoDesequipar");
  });
  Hooks.on("createItem", (item, opc, userId) => {
    if (userId !== game.user.id || opc?.naurenSyncEmbutida || item.parent?.documentName !== "Actor" || naurenEhCondicaoModelo(item)) return;
    if (naurenScriptsDoItem(item).some(s => s.quando === "aoReceber")) rodarQuando(item, "aoReceber");
  });
  Hooks.on("deleteItem", (item, opc, userId) => {
    if (userId !== game.user.id || opc?.naurenSyncEmbutida || item.parent?.documentName !== "Actor" || naurenEhCondicaoModelo(item)) return;
    if (naurenScriptsDoItem(item).some(s => s.quando === "aoPerder")) rodarQuando(item, "aoPerder");
  });
}

/* ============================== EDITOR (realce, números de linha, Tab) ============================== */
const RX = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\[\s\S]|[^\\`])*`|"(?:\\.|[^\\"\n])*"|'(?:\\.|[^\\'\n])*')|\b(\d+(?:\.\d+)?)\b|\b(const|let|var|if|else|for|while|do|return|await|async|function|new|of|in|true|false|null|undefined|try|catch|finally|throw|break|continue|switch|case|default|typeof)\b|\b(nauren)\b(?:\.(\w+))?|\b(item|ator|token|alvo|alvos|atacante|evento|contexto|acao|quem)\b/g;
export function naurenRealcarCodigo(codigo) {
  const c = String(codigo ?? "");
  let out = "", ult = 0;
  for (const m of c.matchAll(RX)) {
    out += esc(c.slice(ult, m.index));
    if (m[1]) out += `<span class="sc-c">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="sc-s">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="sc-n">${esc(m[3])}</span>`;
    else if (m[4]) out += `<span class="sc-k">${esc(m[4])}</span>`;
    else if (m[5]) out += `<span class="sc-api">nauren</span>${m[6] ? `.<span class="sc-f">${esc(m[6])}</span>` : ""}`;
    else if (m[7]) out += `<span class="sc-v">${esc(m[7])}</span>`;
    ult = m.index + m[0].length;
  }
  return out + esc(c.slice(ult)) + "\n";
}
export function naurenEditorHtml(codigo, { id = "", grande = false } = {}) {
  const linhas = String(codigo ?? "").split("\n").length;
  return `<div class="nt-editor nt-ch${grande ? " nt-editor-g" : ""}" data-editor="${esc(id)}">
    <div class="nt-num" aria-hidden="true">${Array.from({ length: linhas }, (_, i) => i + 1).join("\n")}</div>
    <div class="nt-ed-area"><pre class="nt-realce" aria-hidden="true">${naurenRealcarCodigo(codigo)}</pre><textarea class="nt-codigo" spellcheck="false" wrap="off" autocomplete="off" autocapitalize="off" data-codigo="${esc(id)}">${esc(codigo)}</textarea></div>
  </div>`;
}
/** Liga um editor: realce ao digitar, Tab/Shift+Tab, Enter mantém o recuo, Ctrl+S salva. */
export function naurenLigarEditor(caixa, { aoMudar = null, aoSalvar = null, grande = false } = {}) {
  const ta = caixa.querySelector("textarea.nt-codigo"), pre = caixa.querySelector(".nt-realce"), num = caixa.querySelector(".nt-num");
  if (!ta || ta.dataset.ligado) return;
  ta.dataset.ligado = "1";
  const altura = () => {
    if (grande) return;
    const n = ta.value.split("\n").length;
    caixa.style.height = `${Math.min(640, Math.max(260, n * 19 + 20))}px`;
  };
  const atualizar = () => {
    pre.innerHTML = naurenRealcarCodigo(ta.value);
    const n = ta.value.split("\n").length;
    if (num.childNodes.length !== n) num.textContent = Array.from({ length: n }, (_, i) => i + 1).join("\n");
    altura();
    aoMudar?.(ta.value);
  };
  const rolar = () => { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; num.scrollTop = ta.scrollTop; };
  const inserir = texto => { ta.focus(); if (!document.execCommand?.("insertText", false, texto)) ta.setRangeText(texto, ta.selectionStart, ta.selectionEnd, "end"); atualizar(); };
  ta.addEventListener("input", atualizar);
  ta.addEventListener("scroll", rolar);
  ta.addEventListener("change", ev => ev.stopPropagation());
  ta.addEventListener("keydown", ev => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "s") { ev.preventDefault(); ev.stopPropagation(); aoSalvar?.(ta.value); return; }
    if (ev.key === "Tab") {
      ev.preventDefault();
      const ini = ta.selectionStart, fim = ta.selectionEnd, v = ta.value;
      if (ini === fim && !ev.shiftKey) { inserir("  "); return; }
      const lIni = v.lastIndexOf("\n", ini - 1) + 1, bloco = v.slice(lIni, fim);
      const novo = ev.shiftKey ? bloco.replace(/^ {1,2}/gm, "") : bloco.replace(/^/gm, "  ");
      ta.setSelectionRange(lIni, fim); inserir(novo); ta.setSelectionRange(lIni, lIni + novo.length);
      return;
    }
    if (ev.key === "Enter" && !ev.shiftKey) {
      const v = ta.value, ini = ta.selectionStart;
      const lIni = v.lastIndexOf("\n", ini - 1) + 1, linhaAtual = v.slice(lIni, ini);
      let recuo = /^\s*/.exec(linhaAtual)[0];
      if (/[{([]\s*$/.test(linhaAtual)) recuo += "  ";
      ev.preventDefault(); inserir(`\n${recuo}`);
    }
  });
  altura();
  caixa._naurenInserir = inserir;
  caixa._naurenValor = () => ta.value;
}

/* ============================== ABA SCRIPT DA FICHA DE ITEM (só Mestre) ============================== */
function opcoesQuando(atual) {
  const o = naurenScriptQuandoOpcoes();
  const grupo = (rot, mapa) => `<optgroup label="${esc(rot)}">${Object.entries(mapa).map(([k, v]) => `<option value="${k}" ${k === atual ? "selected" : ""}>${esc(v)}</option>`).join("")}</optgroup>`;
  return grupo("Este item", o.item) + grupo("O portador (eventos do sistema)", o.portador);
}
export function naurenHtmlAbaScript(item) {
  const lista = naurenScriptsDoItem(item);
  const ligado = naurenScriptsLigados();
  const acoes = (item.system?.acoes ?? []).map(a => a.nome).filter(Boolean);
  const ehEquip = ["arma", "armadura"].includes(item.type);
  const ferramentas = NAUREN_SCRIPT_API.map((f, i) => `<button type="button" class="nt-ferr nt-ch" data-sc="inserir" data-i="${i}" title="${esc(f.d)}">nauren.${f.f}()</button>`).join("");
  const blocos = lista.map(s => {
    const ok = naurenScriptAprovado(s);
    return `<details class="nauren-lv-bloco nt-sc-bloco" data-sc-id="${s.id}" data-persist="sc-${s.id}">
      <summary class="nauren-lv-cab">
        <span class="nauren-lv-ic"><i class="fas fa-code"></i></span>
        <b>${esc(s.nome)}</b>
        <span class="nauren-lv-resumo">${esc(naurenRotuloQuando(s.quando))}</span>
        <span class="nt-status nt-ch ${ok ? "ok" : "pend"}" data-sc-status>${ok ? `<i class="fas fa-check"></i> Aprovado` : `<i class="fas fa-triangle-exclamation"></i> Precisa aprovar`}</span>
        <label class="nauren-lv-sw" title="Liga ou desliga este script"><input type="checkbox" data-sc-campo="ligado" ${s.ligado ? "checked" : ""}><i></i><span>${s.ligado ? "Ligado" : "Desligado"}</span></label>
      </summary>
      <div class="nauren-lv-corpo">
        <div class="nt-sc-3">
          <label class="nauren-lv-campo"><span class="nauren-lv-rot">Nome</span><input type="text" class="nauren-lv-txt" data-sc-campo="nome" value="${esc(s.nome)}"></label>
          <label class="nauren-lv-campo"><span class="nauren-lv-rot">Quando</span><select data-sc-campo="quando">${opcoesQuando(s.quando)}</select></label>
        </div>
        <div class="nt-sc-3">
          <label class="nauren-lv-campo"><span class="nauren-lv-rot">Só nesta Ação</span><select data-sc-campo="soAcao"><option value="">Qualquer Ação</option>${acoes.map(a => `<option value="${esc(a)}" ${a === s.soAcao ? "selected" : ""}>${esc(a)}</option>`).join("")}</select></label>
          <label class="nauren-lv-campo"><span class="nauren-lv-rot">Onde roda</span><select data-sc-campo="ondeRoda"><option value="dono" ${s.ondeRoda !== "mestre" ? "selected" : ""}>No computador de quem usa</option><option value="mestre" ${s.ondeRoda === "mestre" ? "selected" : ""}>No computador do Mestre</option></select></label>
        </div>
        ${ehEquip ? `<label class="nt-sc-check"><input type="checkbox" data-sc-campo="soEquipado" ${s.soEquipado ? "checked" : ""}> Só com o item equipado <small>(não vale para “Ao equipar” e “Ao desequipar”)</small></label>` : ""}
        <div class="nt-sc-ed-topo">
          <span class="nauren-lv-rot">Código <span class="nt-sc-salvo" data-sc-salvo></span></span>
          <span class="nt-sc-ed-bts">
            <select class="nt-sc-modelo" data-sc="modelo" title="Inserir um modelo pronto"><option value="">Modelos…</option>${NAUREN_SCRIPT_MODELOS.map((m, i) => `<option value="${i}">${esc(m.nome)}</option>`).join("")}</select>
            <button type="button" class="nt-bt nt-ch" data-sc="telaCheia" title="Abrir o editor grande"><i class="fas fa-up-right-and-down-left-from-center"></i> Tela cheia</button>
          </span>
        </div>
        ${naurenEditorHtml(s.codigo, { id: s.id })}
        <div class="nauren-lv-campo"><span class="nauren-lv-rot">Caixa de ferramentas <span class="nauren-lv-val nt-sc-dica">clique para inserir · passe o mouse para ver o que faz</span></span>
          <div class="nt-caixa-ferr">${ferramentas}</div>
        </div>
        <div class="nt-rodape-sc">
          <button type="button" class="nt-bt nt-ch" data-sc="salvar" title="Ctrl+S"><i class="fas fa-floppy-disk"></i> Salvar</button>
          <button type="button" class="nt-bt nt-ch" data-sc="testar" title="Roda sem mudar nada (o resultado vai só para o Mestre no chat)"><i class="fas fa-flask"></i> Testar</button>
          ${s.quando === "botao" ? `<button type="button" class="nt-bt nt-ch" data-sc="executar"><i class="fas fa-play"></i> Executar</button>` : ""}
          <span class="nt-esp"></span>
          <button type="button" class="nt-ib nt-ch" data-sc="duplicar" title="Duplicar"><i class="fas fa-copy"></i></button>
          <button type="button" class="nt-ib nt-ch perigo" data-sc="apagar" title="Apagar"><i class="fas fa-trash"></i></button>
          ${ok ? `<small class="nt-sc-assin">assinatura #${naurenAssinaturaScript(s.codigo).slice(0, 6)}</small>` : `<button type="button" class="nt-bt nt-ch verde" data-sc="aprovar"><i class="fas fa-check"></i> Aprovar</button>`}
        </div>
      </div>
    </details>`;
  }).join("");
  const log = (item.getFlag("nauren", "scriptLog") ?? []).map(l => `<div><span>${new Date(l.em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span><i class="fas ${l.ok ? "fa-check ok" : "fa-xmark erro"}"></i><span title="${esc(l.msg)}"><b>${esc(l.script)}</b> · ${esc(l.msg)}</span></div>`).join("");
  const pend = lista.filter(s => String(s.codigo ?? "").trim() && !naurenScriptAprovado(s)).length;
  return `<div class="nt-aviso nt-ch"><i class="fas fa-user-shield"></i><span><b>Só o Mestre vê e edita esta aba.</b> Cada script roda no momento escolhido em “Quando”, só depois de aprovado. Se o código mudar (ou chegar num item importado), ele fica parado até você aprovar de novo.${ligado ? "" : " <b class=\"nt-sc-off\">Os scripts estão desligados nas configurações do mundo.</b>"}</span></div>
    <div class="nauren-lv">${blocos || `<p class="nt-nota">Nenhum script ainda. Um item pode ter vários, cada um no seu momento (ex.: um ao acertar, outro ao equipar, outro no início do turno).</p>`}</div>
    <div class="nt-sc-acoes"><button type="button" class="nt-bt nt-ch ouro-l" data-sc="novo"><i class="fas fa-plus"></i> Novo script</button>${pend ? `<button type="button" class="nt-bt nt-ch verde" data-sc="aprovarTodos"><i class="fas fa-check-double"></i> Aprovar ${pend > 1 ? `os ${pend}` : "o pendente"}</button>` : ""}</div>
    <details class="nauren-lv-bloco nt-sc-ajuda" data-persist="sc-ajuda">
      <summary class="nauren-lv-cab"><span class="nauren-lv-ic"><i class="fas fa-book-open"></i></span><b>Como escrever</b><span class="nauren-lv-resumo">o que o script recebe e o que a caixa de ferramentas faz</span></summary>
      <div class="nauren-lv-corpo">${naurenAjudaHtml()}</div>
    </details>
    ${log ? `<div class="nauren-lv-bloco nt-ch nt-sc-log"><p class="nt-rot-mk">Últimas execuções</p><div class="nt-log">${log}</div></div>` : ""}`;
}
export function naurenAjudaHtml() {
  const grupos = {};
  for (const f of NAUREN_SCRIPT_API) (grupos[f.g] ??= []).push(f);
  return `<p class="nt-nota">O script é JavaScript (pode usar <code>if</code>, <code>for</code>, variáveis, <code>await</code>…). Ele recebe:
    <code>item</code> (este item), <code>ator</code> (quem tem o item), <code>token</code>, <code>alvo</code> (o alvo do evento, quando há), <code>alvos</code> (marcados),
    <code>atacante</code> (quem atacou, nos eventos de defesa), <code>acao</code> (a Ação, em “Antes de usar”), <code>evento</code> e <code>contexto</code> (os detalhes do evento).
    Tudo o que a caixa de ferramentas faz aparece num card no chat. Em “Antes de usar”, <code>return false</code> cancela a Ação.</p>
    ${Object.entries(grupos).map(([g, fs]) => `<div class="nt-ajuda-g"><p class="nt-rot-mk">${esc(g)}</p>${fs.map(f => `<div class="nt-ajuda-l"><code>nauren.${esc(f.f)}</code><span>${esc(f.d)}</span></div>`).join("")}</div>`).join("")}`;
}

/** Liga a aba Script. sheet = NaurenItemSheet. */
export function naurenLigarFichaScripts(sheet) {
  const el = sheet.element, item = sheet.item;
  const painel = el?.querySelector('.nauren-aba-painel[data-aba="script"]');
  if (!painel || !game.user.isGM) return;
  const lerLista = () => foundry.utils.deepClone(naurenScriptsDoItem(item));
  const gravar = (lista, opc = {}) => item.update({ "flags.nauren.scripts": lista }, opc);
  const mudarCampo = async (id, campo, valor, opc = {}) => { const lista = lerLista(); const s = lista.find(x => x.id === id); if (!s) return; s[campo] = valor; await gravar(lista, opc); };
  painel.querySelectorAll("[data-sc-campo]").forEach(inp => {
    inp.addEventListener("click", ev => { if (inp.closest("summary")) ev.stopPropagation(); });
    inp.addEventListener("change", async ev => {
      ev.stopPropagation();
      const id = inp.closest("[data-sc-id]")?.dataset.scId;
      const v = inp.type === "checkbox" ? inp.checked : inp.value;
      await mudarCampo(id, inp.dataset.scCampo, v);
    });
  });
  painel.querySelectorAll(".nt-editor[data-editor]").forEach(caixa => {
    const bloco = caixa.closest("[data-sc-id]"); const id = bloco?.dataset.scId;
    const salvo = bloco?.querySelector("[data-sc-salvo]");
    const salvar = async codigo => {
      await mudarCampo(id, "codigo", codigo, { render: false });
      const ok = naurenScriptAprovado({ codigo });
      const st = bloco.querySelector("[data-sc-status]");
      if (st) { st.className = `nt-status nt-ch ${ok ? "ok" : "pend"}`; st.innerHTML = ok ? `<i class="fas fa-check"></i> Aprovado` : `<i class="fas fa-triangle-exclamation"></i> Precisa aprovar`; }
      if (salvo) salvo.textContent = "salvo";
      if (!ok && !bloco.querySelector('[data-sc="aprovar"]')) sheet.render();
    };
    naurenLigarEditor(caixa, { aoMudar: () => { if (salvo) salvo.textContent = "não salvo (Ctrl+S)"; }, aoSalvar: salvar });
    caixa.querySelector("textarea")?.addEventListener("blur", () => { const v = caixa._naurenValor(); const s = naurenScriptsDoItem(item).find(x => x.id === id); if (s && s.codigo !== v) salvar(v); });
  });
  painel.querySelectorAll("[data-sc]").forEach(bt => {
    const evento = bt.tagName === "SELECT" ? "change" : "click";
    bt.addEventListener(evento, async ev => {
      ev.preventDefault(); ev.stopPropagation();
      const acaoSc = bt.dataset.sc;
      const bloco = bt.closest("[data-sc-id]"); const id = bloco?.dataset.scId;
      const caixa = bloco?.querySelector(".nt-editor");
      const atual = () => { const s = naurenScriptsDoItem(item).find(x => x.id === id); return s ? { ...s, codigo: caixa?._naurenValor?.() ?? s.codigo } : null; };
      switch (acaoSc) {
        case "novo": { const lista = lerLista(); lista.push(naurenNovoScript(item)); return gravar(lista); }
        case "inserir": { const f = NAUREN_SCRIPT_API[Number(bt.dataset.i)]; if (f && caixa?._naurenInserir) caixa._naurenInserir(f.ins); return; }
        case "modelo": {
          const m = NAUREN_SCRIPT_MODELOS[Number(bt.value)]; bt.value = ""; if (!m || !caixa) return;
          const vazio = !String(caixa._naurenValor()).replace(/\/\/[^\n]*/g, "").trim();
          if (vazio) { const ta = caixa.querySelector("textarea"); ta.select(); }
          caixa._naurenInserir(m.codigo);
          if (vazio && m.quando && atual()?.quando !== m.quando) { const lista = lerLista(); const s = lista.find(x => x.id === id); s.codigo = caixa._naurenValor(); s.quando = m.quando; if (s.nome === "Novo script") s.nome = m.nome; return gravar(lista); }
          return;
        }
        case "salvar": return caixa && mudarCampo(id, "codigo", caixa._naurenValor()).then(() => ui.notifications.info("Script salvo."));
        case "testar": { const s = atual(); if (!s) return; const acaoT = s.quando === "antesDeUsar" || s.quando === "antesDeQualquerAcao" ? foundry.utils.deepClone(item.system?.acoes?.[0] ?? {}) : null; await naurenRodarScript(item, s, { teste: true, acao: acaoT, contexto: { acaoNome: acaoT?.nome ?? "", itemUsadoUuid: item.uuid } }); return; }
        case "executar": { const s = atual(); if (!s) return; if (caixa && s.codigo !== naurenScriptsDoItem(item).find(x => x.id === id)?.codigo) await mudarCampo(id, "codigo", s.codigo, { render: false }); return naurenExecutarScriptBotao(item, id); }
        case "aprovar": { const s = atual(); if (s && caixa) await mudarCampo(id, "codigo", s.codigo, { render: false }); await naurenAprovarScripts(item, [id]); return sheet.render(); }
        case "aprovarTodos": { await naurenAprovarScripts(item); return sheet.render(); }
        case "duplicar": { const lista = lerLista(); const i = lista.findIndex(x => x.id === id); if (i < 0) return; const c = { ...foundry.utils.deepClone(lista[i]), id: foundry.utils.randomID(10), nome: `${lista[i].nome} (cópia)`, codigo: caixa?._naurenValor?.() ?? lista[i].codigo }; lista.splice(i + 1, 0, c); return gravar(lista); }
        case "apagar": {
          const s = atual(); if (!s) return;
          const ok = await foundry.applications.api.DialogV2.confirm({ ...naurenKitSistema(), window: { title: "Apagar script?" }, content: `<p>Apagar o script <b>${esc(s.nome)}</b> de ${esc(item.name)}?</p>`, rejectClose: false }).catch(() => false);
          if (!ok) return; return gravar(lerLista().filter(x => x.id !== id));
        }
        case "telaCheia": { const s = atual(); if (!s) return; if (caixa) await mudarCampo(id, "codigo", s.codigo, { render: false }); new NaurenScriptEditorJanela(item, id).render(true); return; }
      }
    });
  });
}

/* ============================== EDITOR EM TELA CHEIA ============================== */
export class NaurenScriptEditorJanela extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    classes: ["nauren-kit", "nauren-armazem", "nauren-script-janela"],
    position: { width: 1100, height: 760 },
    window: { title: "Script", icon: "fas fa-code", resizable: true }
  };
  constructor(item, scriptId) { super({ id: `nauren-script-${item.id}-${scriptId}` }); this.item = item; this.scriptId = scriptId; }
  get title() { return `${this.item.name} · ${naurenScriptsDoItem(this.item).find(s => s.id === this.scriptId)?.nome ?? "Script"}`; }
  get script() { return naurenScriptsDoItem(this.item).find(s => s.id === this.scriptId); }
  async _renderHTML() {
    const s = this.script;
    if (!s) return `<div class="na-janela"><p class="nt-nota-k" style="padding:18px">Este script não existe mais.</p></div>`;
    const grupos = {};
    NAUREN_SCRIPT_API.forEach((f, i) => (grupos[f.g] ??= []).push({ ...f, i }));
    return `<div class="na-janela">
      <div class="nt-tc">
        <div class="nt-tc-ed">
          <div class="nt-tc-topo"><b>${esc(s.nome)}</b><span>${esc(naurenRotuloQuando(s.quando))}</span><span class="nt-sc-salvo" data-sc-salvo></span></div>
          ${naurenEditorHtml(s.codigo, { id: s.id, grande: true })}
        </div>
        <aside class="nt-tc-ref">
          <label class="nt-busca nt-ch"><i class="fas fa-magnifying-glass"></i><input type="text" placeholder="Procurar na caixa de ferramentas…"></label>
          <div class="nt-tc-lista" data-rola="ref">
            <p class="nt-nota-k">Recebe: <code>item</code>, <code>ator</code>, <code>token</code>, <code>alvo</code>, <code>alvos</code>, <code>atacante</code>, <code>acao</code>, <code>evento</code>, <code>contexto</code>. Clique para inserir no cursor.</p>
            ${Object.entries(grupos).map(([g, fs]) => `<p class="nt-tc-g">${esc(g)}</p>${fs.map(f => `<button type="button" class="nt-tc-f" data-i="${f.i}" data-busca="${esc(`${f.f} ${f.d}`.toLowerCase())}"><code>nauren.${esc(f.f)}()</code><span>${esc(f.d)}</span></button>`).join("")}`).join("")}
          </div>
        </aside>
      </div>
      <div class="nt-rod">
        <button type="button" class="na-btn" data-tc="testar"><i class="fas fa-flask"></i> Testar</button>
        <span class="nt-esp"></span>
        <button type="button" class="na-btn" data-tc="fechar">Fechar</button>
        <button type="button" class="na-btn na-principal" data-tc="salvar"><i class="fas fa-floppy-disk"></i> Salvar</button>
      </div>
    </div>`;
  }
  _replaceHTML(html, content) { content.innerHTML = html; }
  _onRender() {
    const el = this.element;
    const caixa = el.querySelector(".nt-editor");
    const salvo = el.querySelector("[data-sc-salvo]");
    const salvar = async () => {
      const lista = foundry.utils.deepClone(naurenScriptsDoItem(this.item)); const s = lista.find(x => x.id === this.scriptId); if (!s || !caixa) return;
      s.codigo = caixa._naurenValor(); await this.item.update({ "flags.nauren.scripts": lista });
      if (salvo) salvo.textContent = naurenScriptAprovado(s) ? "salvo · aprovado" : "salvo · precisa aprovar (aba Script)";
    };
    if (caixa) naurenLigarEditor(caixa, { grande: true, aoMudar: () => { if (salvo) salvo.textContent = "não salvo (Ctrl+S)"; }, aoSalvar: salvar });
    el.querySelectorAll(".nt-tc-f").forEach(b => b.addEventListener("click", () => { const f = NAUREN_SCRIPT_API[Number(b.dataset.i)]; if (f) caixa?._naurenInserir(f.ins); }));
    const busca = el.querySelector(".nt-tc-ref .nt-busca input");
    busca?.addEventListener("input", () => { const q = busca.value.trim().toLowerCase(); el.querySelectorAll(".nt-tc-f").forEach(b => { b.hidden = !!q && !b.dataset.busca.includes(q); }); });
    el.querySelector('[data-tc="salvar"]')?.addEventListener("click", salvar);
    el.querySelector('[data-tc="fechar"]')?.addEventListener("click", () => this.close());
    el.querySelector('[data-tc="testar"]')?.addEventListener("click", async () => { const s = this.script; if (!s) return; const acaoT = /^antes/.test(s.quando) ? foundry.utils.deepClone(this.item.system?.acoes?.[0] ?? {}) : null; await naurenRodarScript(this.item, { ...s, codigo: caixa?._naurenValor() ?? s.codigo }, { teste: true, acao: acaoT, contexto: { acaoNome: acaoT?.nome ?? "", itemUsadoUuid: this.item.uuid } }); });
    setTimeout(() => el.querySelector("textarea.nt-codigo")?.focus(), 50);
  }
}

/** Botões dos scripts "Botão" para quem tem o item (aba Geral). */
export function naurenHtmlBotoesScript(item) {
  const bts = naurenScriptsDoItem(item).filter(s => s.quando === "botao" && s.ligado && naurenScriptAprovado(s));
  if (!bts.length || !item.isOwner) return "";
  return `<div class="nt-sc-botoes">${bts.map(s => `<button type="button" class="nt-bt nt-ch ouro-l" data-sc-botao="${s.id}"><i class="fas fa-play"></i> ${esc(s.nome)}</button>`).join("")}</div>`;
}
export function naurenLigarBotoesScript(sheet) {
  sheet.element?.querySelectorAll("[data-sc-botao]").forEach(b => b.addEventListener("click", ev => { ev.preventDefault(); naurenExecutarScriptBotao(sheet.item, b.dataset.scBotao); }));
}
