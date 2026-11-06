/* Nauren RPG — Limite de equipamentos ofensivos e reações pagas de equipamento. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { naurenCategoriaDaArma, naurenNomeNormalizado } from "./entidades-campo.mjs";
import { naurenChaveEscopoRelogio } from "./ficha-item.mjs";
import { naurenRecursoDoAtor } from "./inventor-bancada.mjs";
import { naurenFormulaComTokensDoAtor, naurenTextoRolagem } from "../nauren.mjs";
import { NAUREN_KIT_JANELA } from "./janelas-kit.mjs";
import { naurenConcederRecurso } from "./icone-condicao-token.mjs";



/* ===================== 0.94 - Limite de equipamentos ofensivos (G4) =====================
 * Regra do livro: no máximo 5 pontos de armas equipadas (leve 1, média 2, pesada 3). Carregar no
 * inventário não conta. Pesos e limite ficam nas configurações do mundo; o modificador
 * "limiteOfensivo" soma (Maleta do Inventor +3). Equipar acima do limite é recusado com aviso.
 * ======================================================================================== */
function naurenLimiteOfensivoBase() {
  try { return Math.max(0, Number(game.settings.get("nauren", "limiteEquipamentoOfensivo")) || 0); } catch (err) { return 5; }
}

function naurenTabelaPesosOfensivos() {
  let txt = "";
  try { txt = String(game.settings.get("nauren", "pesosEquipamentoOfensivo") ?? ""); } catch (err) { txt = ""; }
  const t = {};
  for (const par of txt.split(",")) {
    const [k, v] = par.split("=").map(x => x?.trim());
    if (k && Number.isFinite(Number(v))) t[naurenNomeNormalizado(k)] = Number(v);
  }
  return t;
}

/** Peso de uma arma no limite: o campo próprio, senão pela categoria (Leve/Média/Pesada...). */
/** 0.94.9 (Cap. VI): conta no limite de Ataque toda arma e, entre as armaduras, os escudos (ou quem tiver peso próprio). */
function naurenContaNoLimiteOfensivo(item) {
  if (item?.type === "arma") return true;
  if (item?.type !== "armadura") return false;
  return (item.system?.pesoOfensivo ?? 0) > 0 || naurenNomeNormalizado(item.system?.tipo || "") === naurenNomeNormalizado("Escudo");
}

function naurenPesoOfensivo(item) {
  if (!naurenContaNoLimiteOfensivo(item)) return 0;
  if ((item.system?.pesoOfensivo ?? 0) > 0) return item.system.pesoOfensivo;
  const tabela = naurenTabelaPesosOfensivos();
  if (item.type === "armadura") return tabela[naurenNomeNormalizado("Escudo")] ?? 2;
  const cat = naurenNomeNormalizado(item.system?.categoria || "") || naurenNomeNormalizado(naurenCategoriaDaArma(item) || "");
  if (cat && tabela[cat] !== undefined) return tabela[cat];
  return tabela[naurenNomeNormalizado("Média")] ?? 2;
}

function naurenPesoOfensivoEquipado(actor, ignorar = null) {
  return (actor?.items ?? []).filter(i => naurenContaNoLimiteOfensivo(i) && i.system?.equipado && i !== ignorar && i.id !== ignorar?.id)
    .reduce((s, i) => s + naurenPesoOfensivo(i), 0);
}

/** 0.94.9 (Cap. VI, Defesa): uma armadura de corpo, uma capa e uma bota; até dois acessórios. "" = sem vaga própria. */
const NAUREN_VAGAS_DEFESA = { tecido: "armadura", couro: "armadura", malha: "armadura", placa: "armadura", capa: "capa", bota: "bota", acessorio: "acessorio" };

const NAUREN_VAGAS_DEFESA_ROTULO = { armadura: "uma armadura", capa: "uma capa", bota: "uma bota", acessorio: "dois acessórios" };

function naurenVagaDefesa(item) {
  if (item?.type !== "armadura") return "";
  return NAUREN_VAGAS_DEFESA[naurenNomeNormalizado(item.system?.tipo || "")] ?? "";
}

function naurenLimiteVagaDefesa(vaga) { return vaga === "acessorio" ? 2 : 1; }

function naurenRegraVagasDefesa() { try { return game.settings.get("nauren", "limiteVagasDefesa") !== false; } catch (err) { return true; } }


/* =======================================
 * REAÇÕES PAGAS DE EQUIPAMENTO (0.94, genérico)
 * Arma equipada com "reacoesPagas": ao ser atacado, pagar um recurso para somar à Defesa;
 * ao sofrer dano, pagar para reduzir. Limite por turno, filtro "só contra ataques em Prioridade".
 * ======================================= */
function naurenReacoesPagasDoAtor(actor, tipo) {
  const lista = [];
  for (const it of actor?.items ?? []) {
    if (it.type !== "arma" || !it.system.equipado) continue;
    (it.system.reacoesPagas ?? []).forEach((r, idx) => { if ((r.tipo || "defesa") === tipo) lista.push({ item: it, r, idx }); });
  }
  return lista;
}

function naurenReacaoPagaUsosNoTurno(actor, item, idx) {
  const chave = naurenChaveEscopoRelogio("turno", actor);
  const f = item.getFlag("nauren", "reacaoPagaUsos");
  return f?.chave === chave ? (f.n?.[idx] ?? 0) : 0;
}

async function naurenReacaoPagaMarcarUso(actor, item, idx) {
  const chave = naurenChaveEscopoRelogio("turno", actor);
  const f = item.getFlag("nauren", "reacaoPagaUsos");
  const n = f?.chave === chave ? { ...(f.n ?? {}) } : {};
  n[idx] = (n[idx] ?? 0) + 1;
  await item.setFlag("nauren", "reacaoPagaUsos", { chave, n }).catch(() => {});
}

function naurenReacaoPagaDisponivel(actor, { item, r, idx }, p) {
  if (r.soEmPrioridade && !p?.atacanteEmPrioridade) return { ok: false, motivo: "só contra ataques feitos numa Prioridade" };
  if ((r.usosPorTurno ?? 0) > 0 && naurenReacaoPagaUsosNoTurno(actor, item, idx) >= r.usosPorTurno) return { ok: false, motivo: `já usada ${r.usosPorTurno}× neste turno` };
  const rec = r.recurso ? naurenRecursoDoAtor(actor, r.recurso) : null;
  const custo = Math.max(0, Number(r.custo) || 0);
  if (r.recurso && (!rec || rec.valor < (r.custoVariavel ? 1 : custo))) return { ok: false, motivo: `sem ${rec?.nome ?? r.recurso}` };
  return { ok: true, rec, custo };
}

/** Pergunta e rola as reações de Defesa paga. Devolve o total somado à Defesa (0 se nenhuma). */
async function naurenReacoesPagasDefesa(actor, p, defesaAtual, linhas) {
  let soma = 0;
  if (p?.critico || p?.falhaCritica) return 0;
  for (const ent of naurenReacoesPagasDoAtor(actor, "defesa")) {
    const disp = naurenReacaoPagaDisponivel(actor, ent, p);
    if (!disp.ok) continue;
    const defesa = defesaAtual + soma;
    if ((p.ataqueTotal ?? 0) <= defesa) break; // já erra: não precisa pagar nada
    const { item, r, idx } = ent;
    // Nem o máximo da rolagem faria errar: não pergunta (não gasta recurso à toa).
    let maxR = 0;
    try { maxR = (await new Roll(naurenFormulaComTokensDoAtor(r.formula || "0", actor)).evaluate({ maximize: true })).total; } catch (err) { maxR = 0; }
    if ((p.ataqueTotal ?? 0) > defesa + maxR) { linhas.push(`${r.nome || item.name}: nem com o máximo (+${maxR}) a Defesa passaria do ataque ${p.ataqueTotal}; não foi usado`); continue; }
    const nomeR = r.nome || item.name;
    const custoTxt = r.recurso ? `${disp.custo} de ${disp.rec?.nome ?? r.recurso}` : "sem custo";
    const usar = await foundry.applications.api.DialogV2.confirm({ ...NAUREN_KIT_JANELA,
      window: { title: `${nomeR} — ${actor.name}` },
      content: `<p>Ataque <b>${p.ataqueTotal ?? 0}</b> contra sua Defesa <b>${defesa}</b>${p.atacante ? ` (de ${foundry.utils.escapeHTML?.(p.atacante) ?? p.atacante})` : ""}.</p><p>Usar <b>${nomeR}</b> (${item.name}): pagar ${custoTxt} para somar <b>${r.formula || "0"}</b> à Defesa?${(r.usosPorTurno ?? 0) > 0 ? ` (${r.usosPorTurno - naurenReacaoPagaUsosNoTurno(actor, item, idx)} de ${r.usosPorTurno} neste turno)` : ""}</p>`,
      yes: { label: `Pagar ${custoTxt}` }, no: { label: "Agora não", default: true }, rejectClose: false
    }).catch(() => false);
    if (!usar) continue;
    if (r.recurso && disp.custo > 0) await naurenConcederRecurso(actor, r.recurso, String(-disp.custo), item);
    let total = 0, txtRoll = "";
    try {
      const roll = await new Roll(naurenFormulaComTokensDoAtor(r.formula || "0", actor)).evaluate();
      if (game.dice3d) await game.dice3d.showForRoll(roll, game.user, true).catch(() => {});
      total = Math.max(0, roll.total); txtRoll = naurenTextoRolagem(roll);
    } catch (err) { console.warn(`Nauren RPG | Fórmula inválida em "${nomeR}".`, err); }
    await naurenReacaoPagaMarcarUso(actor, item, idx);
    soma += total;
    linhas.push(`${nomeR} (${item.name}): Defesa ${defesa} + ${txtRoll || total} = ${defesa + total}${r.recurso ? ` · −${custoTxt}` : ""}`);
  }
  return soma;
}

/** Pergunta as reações de redução de dano paga. Devolve { total, texto }. */
async function naurenReacoesPagasDano(actor, dano, p) {
  let total = 0; const partes = [];
  for (const ent of naurenReacoesPagasDoAtor(actor, "reduzirDano")) {
    if (dano - total <= 0) break;
    const disp = naurenReacaoPagaDisponivel(actor, ent, p);
    if (!disp.ok) continue;
    const { item, r, idx } = ent;
    const nomeR = r.nome || item.name;
    const recNome = disp.rec?.nome ?? r.recurso ?? "";
    const resta = dano - total;
    let pagar = 0, reduz = 0;
    if (r.custoVariavel) {
      // Escolhe quanto pagar: cada ponto reduz "formula" (padrão 1) de dano.
      const porPonto = Math.max(1, Number(r.formula) || 1);
      const maxPagar = Math.min(disp.rec?.valor ?? 0, Math.ceil(resta / porPonto));
      if (maxPagar <= 0) continue;
      const res = await foundry.applications.api.DialogV2.prompt({ ...NAUREN_KIT_JANELA,
        window: { title: `${nomeR} — ${actor.name}` },
        content: `<p>Você vai sofrer <b>${resta}</b> de dano. <b>${nomeR}</b> (${item.name}): cada 1 de ${recNome} gasto reduz ${porPonto} de dano. Você tem ${disp.rec?.valor ?? 0}.</p>
          <div class="form-group"><label>Gastar</label><input type="number" name="pagar" value="0" min="0" max="${maxPagar}" step="1" autofocus></div>`,
        ok: { label: "Confirmar", callback: (ev, btn) => Number(btn.form?.elements?.pagar?.value ?? btn.closest?.("form")?.querySelector?.("[name=pagar]")?.value ?? 0) || 0 },
        rejectClose: false
      }).catch(() => 0);
      pagar = Math.max(0, Math.min(maxPagar, Math.floor(Number(res) || 0)));
      if (!pagar) continue;
      reduz = Math.min(resta, pagar * porPonto);
    } else {
      const usar = await foundry.applications.api.DialogV2.confirm({ ...NAUREN_KIT_JANELA,
        window: { title: `${nomeR} — ${actor.name}` },
        content: `<p>Você vai sofrer <b>${resta}</b> de dano. Usar <b>${nomeR}</b> (${item.name}) e reduzir <b>${r.formula}</b>${r.recurso ? ` pagando ${disp.custo} de ${recNome}` : ""}?</p>`,
        yes: { label: "Reduzir" }, no: { label: "Agora não", default: true }, rejectClose: false
      }).catch(() => false);
      if (!usar) continue;
      pagar = disp.custo;
      try { const roll = await new Roll(naurenFormulaComTokensDoAtor(r.formula || "0", actor)).evaluate(); reduz = Math.min(resta, Math.max(0, roll.total)); } catch (err) { reduz = 0; }
    }
    if (r.recurso && pagar > 0) await naurenConcederRecurso(actor, r.recurso, String(-pagar), item);
    await naurenReacaoPagaMarcarUso(actor, item, idx);
    total += reduz;
    partes.push(`${nomeR}: −${reduz}${r.recurso && pagar ? ` (${pagar} ${recNome})` : ""}`);
  }
  return { total, texto: partes.join(", ") };
}

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_equipamento_regras() {

Hooks.on("preUpdateItem", (item, mudancas, opcoes, userId) => {
  if (!["arma", "armadura"].includes(item.type) || !item.parent || item.parent.documentName !== "Actor" || opcoes?.naurenSemLimite) return;
  const equipando = foundry.utils.getProperty(mudancas, "system.equipado") === true && !item.system.equipado;
  if (!equipando) return;
  // Vagas de Defesa: só uma armadura/capa/bota equipada por vez (dois acessórios).
  const vaga = naurenVagaDefesa({ type: item.type, system: { ...item.system, tipo: foundry.utils.getProperty(mudancas, "system.tipo") ?? item.system.tipo } });
  if (vaga && naurenRegraVagasDefesa()) {
    const ocupando = item.parent.items.filter(i => i.id !== item.id && i.system?.equipado && naurenVagaDefesa(i) === vaga);
    if (ocupando.length >= naurenLimiteVagaDefesa(vaga)) {
      ui.notifications?.warn?.(`${item.parent.name}: só dá para ter ${NAUREN_VAGAS_DEFESA_ROTULO[vaga]} ${vaga === "acessorio" ? "equipados" : "equipada"} por vez (${ocupando.map(i => i.name).join(", ")}). Desequipe antes de equipar ${item.name}.`);
      return false;
    }
  }
  if (!naurenContaNoLimiteOfensivo({ type: item.type, system: { ...item.system, ...(foundry.utils.getProperty(mudancas, "system") ?? {}) } })) return;
  const limite = item.parent.system?.limiteOfensivoTotal ?? naurenLimiteOfensivoBase();
  if (!naurenLimiteOfensivoBase() || !limite) return;
  const peso = naurenPesoOfensivo(item);
  const usado = naurenPesoOfensivoEquipado(item.parent, item);
  if (usado + peso > limite) {
    ui.notifications?.warn?.(`${item.parent.name}: equipar ${item.name} (${peso}) passaria do limite de equipamentos de Ataque, armas e escudos (${usado} de ${limite} em uso). Desequipe outro antes.`);
    return false;
  }
});
}

export { NAUREN_VAGAS_DEFESA, NAUREN_VAGAS_DEFESA_ROTULO, naurenContaNoLimiteOfensivo, naurenLimiteOfensivoBase, naurenLimiteVagaDefesa, naurenPesoOfensivo, naurenPesoOfensivoEquipado, naurenReacaoPagaDisponivel, naurenReacaoPagaMarcarUso, naurenReacaoPagaUsosNoTurno, naurenReacoesPagasDano, naurenReacoesPagasDefesa, naurenReacoesPagasDoAtor, naurenRegraVagasDefesa, naurenTabelaPesosOfensivos, naurenVagaDefesa };
