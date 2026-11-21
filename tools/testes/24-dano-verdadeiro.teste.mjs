// 0.120.2: dano verdadeiro na janela de reação e no evento de dano.
export default async function (t) {
  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../../modulos/ficha-ator.mjs", import.meta.url), "utf8");
  t(/\(p\.danoMinimo \?\? 0\) > 0 \|\| \(p\.danoVerdadeiro \?\? 0\) > 0\)\) \{/.test(src), "só dano verdadeiro também gera o evento de dano");
  t(/danoVerdadeiro: i === 0 \? \(p\.danoVerdadeiro \?\? 0\) : 0/.test(src), "projéteis extras não repetem o dano verdadeiro");
  t(/dvP > 0 \? `<b>\$\{dvP\} de dano verdadeiro<\/b>`/.test(src), "cabeçalho da janela mostra o dano verdadeiro");
  t(/data-dano="\$\{pv\.final \+ extraDv\}"/.test(src), "a barra de Vida prevê o dano verdadeiro");
  t(/dd\(0, "usando a Prioridade", false\)/.test(src) && /dd\(0, "Deflexão no Bloqueio", false\)/.test(src) && /"bloqueando: só o dano mínimo", false\)/.test(src), "evitar o ataque tira o dano verdadeiro da previsão");
  t(/\(danoAgora > 0 \|\| \(!evitou && \(Number\(pEvento\.danoVerdadeiro\) \|\| 0\) > 0\)\)/.test(src), "2º passo da reação aparece com dano verdadeiro");
  t(/naurenCombatenteEhDoAtor\(game\.combat\.combatant, this\.actor\)\) \{/.test(src), "Mantis só no turno do próprio atacante");
}
