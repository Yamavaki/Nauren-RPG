// Livro 0.9 (0.120): Sacerdote, Mago, Ladino e Druida — sementes e migração.
export default async function (t) {
  const fs = await import("node:fs");
  const src = fs.readFileSync(new URL("../../modulos/compendios.mjs", import.meta.url), "utf8");
  // Sacerdote
  t(/recurso: `condicaoEmMim:\$\{uuidVontadeFortalecida\}`, quantidade: "1", acumulosMaxFormula: "2\+@rank"/.test(src), "Estigmas: limite 2 + rank (3 / 4 / 5)");
  t(/id: "estigmas-do-milagre"[^\n]*\n\s*rankMax: 3,/.test(src), "Estigmas: nó da árvore vai até 3 pontos");
  t(/itemUuid: erradiarLuzSagrada\.uuid, prerequisitos: \[\{ id: "esfera-prismatica", linhaVisivel: false \}\]/.test(src), "Erradiar Luz Sagrada sem a seta de Costurar a Vida");
  // Mago
  t(/repetirSeDanoMaximo: true,[\s\S]{0,160}danoMaximoEmPoderosa: true/.test(src), "Mísseis Arcanos: Conjuração Poderosa = dano máximo (aciona a repetição)");
  t(/escolher novos alvos para as repetições/.test(src), "Mísseis Arcanos: texto novo das repetições");
  // Ladino
  t(/usosMaxPorNivel: \[\{ nivel: 1, valor: 3 \}, \{ nivel: 6, valor: 4 \}, \{ nivel: 10, valor: 5 \}\]/.test(src), "Análise Paciente: 3 → 4 (nível 6) → 5 (nível 10)");
  t(/nivel: 10, itensConcedidos: \[\{ uuid: h\.falsificarSeuDestino \}\], upgradesDeRank: \[\{ uuidOrigem: h\.analisePaciente, novoRank: 3 \}\]/.test(src), "Ladino: rank 3 da Análise no nível 10");
  // Druida
  t(/ao alcançar o <b>nível 17<\/b>/.test(src), "Druidismo: efeito adicional no nível 17");
  const ent = fs.readFileSync(new URL("../../modulos/entidades-campo.mjs", import.meta.url), "utf8");
  t(/NAUREN_DRUIDISMO_NIVEL_ADICIONAL = 17/.test(ent) && !/>= 16\) blocos\.push/.test(ent), "Druidismo: a escolha adicional vale com o Druida no 17+");
  // Esquema e motor
  const nm = fs.readFileSync(new URL("../../nauren.mjs", import.meta.url), "utf8");
  t(/acumulosMaxFormula: new StringField/.test(nm), "gatilho tem o teto de acúmulos no esquema");
  const ict = fs.readFileSync(new URL("../../modulos/icone-condicao-token.mjs", import.meta.url), "utf8");
  t(/g\.acumulosMaxFormula/.test(ict), "condicaoEmMim respeita o teto de acúmulos");
  // Migração: quais itens são reconciliados
  const { naurenLivro09ItemMudou0120: mudou } = await import("../../modulos/livro-09.mjs");
  t(mudou({ type: "habilidade", name: "Estigmas do Milagre" }) && mudou({ type: "magia", name: "Mísseis Arcanos" }) && mudou({ type: "habilidade", name: "Druidismo" }), "migração pega Estigmas, Mísseis e Druidismo");
  t(mudou({ type: "subclasse", system: { nos: [{ id: "erradiar-luz-sagrada" }] } }) && mudou({ type: "classe", name: "Ladino", system: { identifier: "ladino" } }), "migração pega a árvore do Sacerdote e a Classe do Ladino");
  t(!mudou({ type: "habilidade", name: "Combustão" }) && !mudou({ type: "classe", name: "Mago", system: { identifier: "mago" } }), "Combustão e Mago (classe) não mudam");
}
