/* Nauren RPG — Classe Inventor, subclasses, Frascos e Obra Prima. Separado do nauren.mjs na 0.104 (tools/dividir.mjs). */
import { naurenMontarDescricao } from "./prioridades.mjs";
import { naurenAndarParaToken, naurenMesmoAndar } from "./andares.mjs";
import { naurenCaminhoImagemSubclasse, naurenGarantirEfeitoDeSubclasse, naurenGarantirHabilidadeDeClasse, naurenGarantirHabilidadeDeSubclasse, naurenGarantirItemNoPack, naurenObterOuCriarPacks } from "./compendios.mjs";
import { NAUREN_ESBOCOS, NAUREN_ROTULO_CURTO_MOD, NaurenBancada, naurenChaveConstrucao, naurenConstrucaoDe, naurenFormulaCriavel, naurenItensDoProjeto, naurenMelhoriasDoProjeto, naurenRecursoDoAtor, naurenResumoItemProjeto } from "./inventor-bancada.mjs";
import { NAUREN_QUERY_ITEM_MESTRE, naurenCondicaoNegativa, naurenEhCondicaoModelo, naurenEhItem, naurenNomeBate, naurenNomeNormalizado, naurenOperarRecursoViaMestre, naurenResolverSelf, naurenSomarEfeitoPermanente, naurenUsosExtrasPara } from "./entidades-campo.mjs";
import { NAUREN_CAMPOS_MODIFICADOR_OPCOES, naurenFormulaComTokensDoAtor, naurenInterpretarModificador, naurenMedirDistanciaBordas, naurenPostarCard, naurenResolverPorNivel, naurenTextoRolagem } from "../nauren.mjs";
import { NAUREN_KIT_JANELA } from "./janelas-kit.mjs";
import { naurenConcederRecurso, naurenProcessarGatilhos } from "./icone-condicao-token.mjs";
import { NaurenAlvoHelper } from "./ficha-ator.mjs";
import { naurenCombatenteEhDoAtor } from "./bando.mjs";
import { naurenCasasLivresEmVolta } from "./monstros-regras.mjs";


/* =======================================
 * CLASSE INVENTOR (0.94.0 - níveis 1 a 4)
 * Tudo em dados: a Bancada lê a tabela "construcao" da Arma de Inventor; as operações
 * ("aplica") são genéricas (fórmula, somar, substituir, modificador, adicionar, lista).
 * ======================================= */
const NAUREN_INVENTOR_CONSTRUCAO = (() => {
  const TOPO = ["danos", "ataqueBonusExtra", "atributoAtaque", "custoEstamina", "alcance", "tipoAlcance", "usaCondicaoEscolhida", "condicoesEscolhidasOpcoes", "condicoesEscolhidasAcumulosFormula"];
  const recarga = (custo = 1) => ({
    nome: "Recarga", custoEstamina: custo, alcance: "pessoal", modoAlvo: "nenhum", prioridadeIndicador: "PA",
    recarregaUsos: true, recarregaFormula: "1d6", recarregaBonus: "", recarregaSoSeVazio: true
  });
  const base = (nome, img, categoria, ataque, usos, extra = {}) => ({
    name: nome, type: "arma", img,
    system: {
      categoria, equipado: false, prioridadeIndicador: "PI",
      usaUsos: true, usosMax: usos, usosAtual: usos, usosReset: "manual",
      acoes: [{ ...ataque, tipo: categoria, ehAtaque: true, modoAlvo: "selecionado", modoAlvoTravado: true, usaUsos: true, prioridadeIndicador: "PI" }, recarga(1)],
      efeitosVinculados: [], reacoesPagas: [],
      descricao: naurenMontarDescricao({
        regra: "Arma de Inventor, feita na Bancada. Os usos só voltam com a Recarga (1 PdE, P/A): em combate, só com a arma vazia; fora dele, até encher.",
        automatico: "as características escolhidas já estão na arma; melhorias pela Bancada (Retornar ao Projeto Inicial).",
        manual: "se perder a arma, recriá-la custa 500 Florins." }),
      ...extra
    }
  });
  const fogo = base("Arma de Fogo de Inventor", "icons/weapons/guns/gun-blunderbuss-bronze.webp", "Pesada",
    { nome: "Disparo", custoEstamina: 2, alcance: "16m", tipoAlcance: "distancia", atributoAtaque: "nenhum", danos: [{ formula: "0", aplicarNoAlvo: true }] }, 5);
  const protese = base("Prótese de Inventor", "icons/equipment/hand/gauntlet-armored-heavy-steel.webp", "Média",
    { nome: "Golpe da Prótese", custoEstamina: 1, alcance: "1m", tipoAlcance: "corpoACorpo", atributoAtaque: "poderAtaque", danos: [{ formula: "@poderAtaque", aplicarNoAlvo: true }] }, 5);
  const martelo = base("Martelo de Inventor", "icons/weapons/hammers/hammer-double-engraved-gold.webp", "Pesada",
    { nome: "Marretada", custoEstamina: 2, alcance: "2m", tipoAlcance: "corpoACorpo", atributoAtaque: "poderAtaque", danos: [{ formula: "@poderAtaque", aplicarNoAlvo: true }] }, 2,
    { efeitosVinculados: [{ id: "", ativo: true, modificadores: [{ campo: "destino", valor: "2", porRank: [] }], condicoesAplicadas: [] }] });
  const mod = (campo, valor) => ({ modo: "modificador", campo, valor });
  return {
    id: "arma-inventor", titulo: "Arma de Inventor", recurso: "recursoCustom:pdi", siglaRecurso: "PdI",
    orcamento: "@espirito", maxPorLinha: "2+(@nivel>=16)", maximoItens: "1+(@nivel>=19)",
    melhorias: [{ nivel: 4, orcamento: "floor(@espirito/2)" }, { nivel: 11, orcamento: "floor(@espirito/2)" }, { nivel: 16, orcamento: "floor(@espirito/2)" }],
    notaRegra: "Efeitos iguais entre duas Armas de Inventor não somam (nível 19).",
    formulas: [
      { id: "fogo", nome: "Arma de Fogo", sub: "Pesada · 16 m · 2 PdE", tipo: "Pesada, duas mãos", esboco: "fogo", base: fogo,
        regra: "Sem Ataque Pesado; não soma Meta-atributos no acerto nem no dano.", dica: "Alvo único a 16 m. 5 usos." },
      { id: "protese", nome: "Prótese", sub: "Média · 1 m · 1 PdE", tipo: "Média", esboco: "protese", base: protese, equiparAoCriar: true,
        regra: "Soma o Poder de Ataque no dano, sem dado próprio.", dica: "Alvo único corpo a corpo. 5 usos." },
      { id: "martelo", nome: "Martelo", sub: "Pesado · 2 m · 2 PdE", tipo: "Pesado", esboco: "martelo", base: martelo, requer: "Nova Fórmula: Martelo",
        regra: "+2 de Destino equipado. 2 usos.", dica: "Engenheiro: Nova Fórmula: Martelo." }
    ],
    categorias: [{ id: "of", nome: "Ofensivas", cor: "#e8836f" }, { id: "df", nome: "Defensivas", cor: "#7fb0e0" }, { id: "sp", nome: "Suporte", cor: "#8fd19e" }],
    linhas: [
      { id: "dano", categoria: "of", custo: 2, nome: "Dano", efeito: "+1d6 de dano", aplica: [{ modo: "formula", campo: "acoes.0.danos.0.formula", valor: "1d6" }] },
      { id: "danoFixo", categoria: "of", custo: 2, nome: "Dano firme", efeito: "+3 de dano", aplica: [{ modo: "formula", campo: "acoes.0.danos.0.formula", valor: "3" }] },
      { id: "mira", categoria: "of", custo: 2, nome: "Mira", efeito: "+2 no teste de ataque", aplica: [{ modo: "formula", campo: "acoes.0.ataqueBonusExtra", valor: "2" }] },
      { id: "miraViva", categoria: "of", custo: 3, nome: "Mira viva", efeito: "+1d4 no teste de ataque", aplica: [{ modo: "formula", campo: "acoes.0.ataqueBonusExtra", valor: "1d4" }] },
      { id: "carga", categoria: "of", custo: 3, nome: "Carga total", efeito: "Anuncie antes do ataque: dano máximo. 1 vez por cena (+1 por escolha)", aplica: [
        { modo: "adicionar", campo: "acoes", valor: { nome: "Carga Total", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP",
          usaUsos: true, usosProprios: true, usosMax: 0, usosAtual: 0, usosReset: "cena", condicaoEmMimUuid: "self:Carga Total" } },
        { modo: "somar", campo: "acoes[Carga Total].usosMax", valor: 1 }, { modo: "somar", campo: "acoes[Carga Total].usosAtual", valor: 1 }] },
      { id: "estouro", loja: false, categoria: "of", custo: 3, nome: "Estouro", efeito: "Ação Anunciada (P/I): raio de 2 m num ponto no alcance; gasta 1 uso da arma. 1 vez por cena (+1 por escolha)", aplica: [
        { modo: "adicionar", campo: "acoes", tardio: true, copiarDe: 0, copiarCampos: TOPO, valor: { nome: "Estouro", ehAtaque: true, modoAlvo: "area", modoAlvoTravado: true, usaTemplate: true, templateTipo: "circle", templateTamanho: 2,
          areaDisposicao: "todos", prioridadeIndicador: "PI", usaUsos: true, usosProprios: true, usosMax: 0, usosAtual: 0, usosReset: "cena", custoUsosItem: 1 } },
        { modo: "somar", campo: "acoes[Estouro].usosMax", valor: 1, tardio: true }, { modo: "somar", campo: "acoes[Estouro].usosAtual", valor: 1, tardio: true }] },
      { id: "estilhaco", categoria: "of", custo: 3, nome: "Estilhaço", efeito: "Ao acertar: 1 acúmulo de Sangramento, Fragmentado ou Lerdeza, à escolha (+1 por escolha)", aplica: [
        { modo: "substituir", campo: "acoes.0.usaCondicaoEscolhida", valor: true },
        { modo: "substituir", campo: "acoes.0.condicoesEscolhidasOpcoes", valor: ["self:Sangramento", "self:Fragmentado", "self:Lerdeza"] },
        { modo: "formula", campo: "acoes.0.condicoesEscolhidasAcumulosFormula", valor: "1" }] },

      { id: "couraca", categoria: "df", custo: 2, nome: "Couraça", efeito: "+1 de Defesa com a arma equipada", aplica: [mod("defesa", 1)] },
      { id: "aparo", categoria: "df", custo: 2, nome: "Aparo", efeito: "Contra ataque feito numa Prioridade: 1 PdI para +1d4 de Defesa. 1 vez por turno (+1 por escolha)", aplica: [
        { modo: "adicionar", campo: "reacoesPagas", valor: { nome: "Aparo", tipo: "defesa", formula: "1d4", recurso: "recursoCustom:pdi", custo: "1", custoVariavel: false, soEmPrioridade: true, usosPorTurno: 0 } },
        { modo: "somar", campo: "reacoesPagas[Aparo].usosPorTurno", valor: 1 }] },
      { id: "amortecedor", categoria: "df", custo: 2, nome: "Amortecedor", efeito: "−1 em todo dano sofrido que não seja de Condição", aplica: [mod("reducaoDanoAtaque", 1)] },
      { id: "guarda", categoria: "df", custo: 3, nome: "Guarda", efeito: "+2 no Bloqueio", aplica: [mod("bloqueio", 2)] },
      { id: "fumaca", categoria: "df", custo: 3, nome: "Fumaça", max: 1, efeito: "Ataques contra você feitos numa Prioridade têm Dificuldade", aplica: [mod("vantagemAtaqueRecebidoPrioridade", "desvantagem")] },
      { id: "faiscas", categoria: "df", custo: 3, nome: "Escudo de faíscas", max: 1, efeito: "Ao sofrer dano, gaste PdI para reduzir o dano no mesmo valor", aplica: [
        { modo: "adicionar", campo: "reacoesPagas", valor: { nome: "Escudo de Faíscas", tipo: "reduzirDano", formula: "1", recurso: "recursoCustom:pdi", custo: "1", custoVariavel: true, soEmPrioridade: false, usosPorTurno: 0 } }] },

      { id: "tambor", loja: false, categoria: "sp", custo: 1, nome: "Tambor extra", efeito: "+2 usos máximos", aplica: [{ modo: "somar", campo: "usosMax", valor: 2 }] },
      { id: "carregador", loja: false, categoria: "sp", custo: 2, nome: "Carregador", efeito: "+1 no valor rolado da Recarga", aplica: [{ modo: "formula", campo: "acoes.1.recarregaBonus", valor: "1" }] },
      { id: "molas", categoria: "sp", custo: 2, nome: "Molas", efeito: "+1 m de Movimento com a arma equipada", aplica: [mod("movimento", 1)] },
      { id: "marcha", loja: false, categoria: "sp", custo: 3, nome: "Recarga em marcha", max: 1, efeito: "Ao recarregar, mova metade do Movimento sem gerar Prioridade", aplica: [{ modo: "substituir", campo: "acoes.1.condicaoEmMimUuid", valor: "self:Recarga em Marcha" }] },
      { id: "pigmento", categoria: "sp", custo: 3, nome: "Pigmento", efeito: "+1 em um atributo à escolha", escolha: ["forca", "agilidade", "estamina", "inteligencia", "destino"], aplica: [mod("$escolha", 1)] },
      { id: "nervos", categoria: "sp", custo: 3, nome: "Nervos de latão", so: ["protese"], efeito: "+1 de Estresse máximo", aplica: [mod("estresse", 1)] },
      { id: "gatilho", categoria: "sp", custo: 3, nome: "Gatilho rápido", so: ["fogo"], max: 1, efeito: "A 1ª Recarga de cada combate não custa Estamina", aplica: [{ modo: "substituir", campo: "acoes.1.recarregaGratisPorCena", valor: 1 }] }
    ]
  };
})();


async function naurenSemearClasseInventor(packs, uuidDarPrioridade) {
  const pc = packs.condicoes, ph = packs.habilidades;
  await naurenGarantirItemNoPack(pc, "condicao-carga-total", {
    name: "Carga Total", type: "condicao", img: "icons/magic/lightning/bolt-strike-blue.webp",
    system: { duracaoModo: "cena", negativa: "nao", usaProximaAcao: true, proximaAcaoDanoMaximo: true, proximaAcaoConsumir: 1, proximaAcaoTipoItem: "arma", proximaAcaoSoComDano: true,
      descricao: naurenMontarDescricao({ regra: "Anunciada antes do teste de ataque: o próximo ataque com a arma causa dano máximo.", automatico: "o próximo ataque com dano de uma arma rola o dano no máximo e a Condição sai.", manual: "" }) }
  });
  await naurenGarantirItemNoPack(pc, "condicao-recarga-em-marcha", {
    name: "Recarga em Marcha", type: "condicao", img: "icons/magic/movement/chevrons-down-yellow.webp",
    system: { negativa: "nao", duracaoRodadas: 1, movimentoSemPrioridadeMetros: "floor(@movimento/2)",
      descricao: naurenMontarDescricao({ regra: "Depois de recarregar, você pode se mover até metade do seu Movimento sem gerar Prioridade.", automatico: "metade do Movimento por turno não gera Prioridade ao chegar perto; some em 1 rodada.", manual: "" }) }
  });
  const capacidade = await naurenGarantirHabilidadeDeClasse(ph, "habilidade-inventor-capacidade-inventiva", {
    name: "Capacidade Inventiva", type: "habilidade", img: "icons/commodities/tech/cog-gear-wheel-gold.webp",
    system: {
      ativo: true,
      acoes: [{ nome: "Meditar (1 hora)", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP", restauraRecurso: "recursoCustom:pdi" }],
      descricao: naurenMontarDescricao({ regra: "Passiva. Todo o seu Espírito vira Pontos de Invenção (PdI), usados para construir itens a partir das fórmulas desta classe. Você não usa Mana nem Ações que custem Mana. Recupera todos os PdI ao passar 1 hora em meditação.",
        automatico: "a barra Pontos de Invenção tem máximo igual ao Espírito; a Mana fica em 0 e Ações com custo de Mana ficam travadas. A Ação \"Meditar (1 hora)\" enche os PdI e registra no chat.",
        manual: "a hora de meditação é narrativa: use fora de combate." })
    }
  });
  const exercicio = await naurenGarantirHabilidadeDeClasse(ph, "habilidade-inventor-exercicio-teorico", {
    name: "Exercício Teórico", type: "habilidade", img: "icons/skills/trades/academics-book-study-purple.webp",
    system: {
      ativo: true,
      acoes: [{ nome: "Dar a aula", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP", usaUsos: true, usosMax: 1, usosAtual: 1, usosReset: "dia",
        recarregaUsos: true, recarregaItemNome: "Os Frascos", recarregaAcaoNome: "Preparar Frasco", recarregaFormula: "99", recarregaSoSeVazio: false }],
      descricao: naurenMontarDescricao({ regra: "Uma vez por dia, dê uma aula expositiva para até 4 personagens, de 1 a 4 horas seguidas. Ao final, você e os participantes recebem 10 × horas de aula em Pontos de Experiência. Também é um momento para preparar Frascos.",
        automatico: "a Ação conta o uso diário, registra a aula no chat e (com Os Frascos) devolve os preparos de Frasco do dia.",
        manual: "o Mestre entrega a experiência (10 por hora) a você e aos alunos." })
    }
  });
  const arma = await naurenGarantirHabilidadeDeClasse(ph, "habilidade-inventor-arma-de-inventor", {
    name: "Arma de Inventor", type: "habilidade", img: "icons/sundries/documents/blueprint-axe.webp",
    system: {
      ativo: true, construcao: NAUREN_INVENTOR_CONSTRUCAO,
      acoes: [{ nome: "Abrir a Bancada", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP", abrirConstrucao: "criar" }],
      descricao: naurenMontarDescricao({ regra: "Escolha uma fórmula (Arma de Fogo ou Prótese) e gaste Pontos de Invenção nas características Ofensivas, Defensivas e de Suporte (cada uma até 2 vezes). A arma não pode ser alterada, exceto por habilidades que permitam. Só uma por vez; se perdê-la, gaste 500 Florins para recriá-la. Ação de Recarga (P/A, 1 PdE): restaura 1d6 usos, só sem usos.",
        automatico: "a Bancada de Invenção mostra o orçamento (todo o seu Espírito), cobra os PdI ao forjar e cria a arma pronta, com card no chat de cada escolha.",
        manual: "recriar a arma após perdê-la cobra os 500 Florins à parte." })
    }
  });
  const retornar = await naurenGarantirHabilidadeDeClasse(ph, "habilidade-inventor-retornar-ao-projeto", {
    name: "Retornar ao Projeto Inicial", type: "habilidade", img: "icons/sundries/documents/blueprints.webp",
    system: {
      ativo: true,
      acoes: [{ nome: "Melhorar a invenção", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP", abrirConstrucao: "melhorar", abrirConstrucaoFonte: "Arma de Inventor" }],
      descricao: naurenMontarDescricao({ regra: "Níveis 4, 11 e 16: melhore sua Arma de Inventor com um valor igual à metade dos seus Pontos de Invenção. No nível 16, pode escolher uma 3ª vez características que já tenha escolhido 2 vezes.",
        automatico: "reabre a Bancada com o que a arma já tem travado e metade do Espírito a mais para gastar; uma melhoria por nível liberado.", manual: "" })
    }
  });
  const ff = await naurenSemearInventorFrascosFerramentas(packs);
  const av = await naurenSemearInventorAvancado(packs);
  await naurenSemearInventorSubclasses(packs).catch(err => console.error("Nauren RPG | Falha ao criar as Subclasses do Inventor.", err));
  await naurenGarantirItemNoPack(packs.classes, "classe-inventor", {
    name: "Inventor", type: "classe", img: "icons/commodities/tech/cog-brass.webp",
    system: {
      identifier: "inventor",
      descricao: "<p>O Inventor é um artesão da ciência: cria armas, aprimora armaduras e desenvolve frascos com efeitos extraordinários. Acredita que o progresso justifica qualquer sacrifício.</p><p><b>Armaduras:</b> tecido e couro. <b>Armas:</b> armas de fogo e martelos. <b>Atributos recomendados:</b> Espírito, Inteligência e Destino.</p>",
      recursosDeclarados: [{ id: "pdi", nome: "Pontos de Invenção", maxFormula: "@espirito", icone: "fa-gears", cor1: "#4a3518", cor2: "#cca162", nasceCheio: true }],
      niveis: Array.from({ length: 20 }, (_, i) => {
        const nivel = i + 1;
        const itens = nivel === 1 ? [capacidade, exercicio, arma].map(x => ({ uuid: x.uuid })).concat(uuidDarPrioridade ? [{ uuid: uuidDarPrioridade }] : [])
          : nivel === 2 ? [{ uuid: ff.frascos }]
          : nivel === 4 ? [{ uuid: retornar.uuid }]
          : nivel === 8 ? [{ uuid: av.loja }]
          : nivel === 12 ? [{ uuid: av.eureka }]
          : nivel === 17 ? [{ uuid: av.botas }]
          : nivel === 19 ? [{ uuid: av.metodologias }]
          : nivel === 20 ? [{ uuid: av.doutor }] : [];
        const upgrades = nivel === 15 ? [{ uuidOrigem: av.eureka, novoRank: 2 }] : nivel === 18 ? [{ uuidOrigem: av.eureka, novoRank: 3 }] : [];
        const entrada = { nivel, itensConcedidos: itens, upgradesDeRank: upgrades };
        // Ferramenta de Inventor: escolha 1 nova nos níveis 3, 7, 10 e 14 (as que já tem somem da lista).
        if ([3, 7, 10, 14].includes(nivel)) entrada.escolhaItens = { ativo: true, itensDisponiveis: ff.ferramentas.map(uuid => ({ uuid })), quantidadeEscolhas: "1" };
        return entrada;
      })
    }
  });
  return { capacidade: capacidade.uuid, exercicio: exercicio.uuid, arma: arma.uuid, retornar: retornar.uuid };
}



/* ===================== 0.94.3 - Subclasses do Inventor (27 nós) =====================
 * Engenheiro (armas e armaduras), Apotecário (frascos) e Estudioso do Oculto (eletricidade e cobaias).
 * Tudo montado com mecânicas genéricas: efeitosEmMim/efeitosNoAlvo, frascoMods, regrasExtras, gatilhos,
 * Condições com efeitos ao terminar/limiar/remover, Prioridade com Ação extra e "só age em Prioridade".
 * ===================================================================================== */
async function naurenSemearInventorSubclasses(packs) {
  const pc = packs.condicoes, ph = packs.habilidades;
  const uuidSeed = async (pack, seed) => { await pack.getIndex({ fields: ["flags.nauren.seedId"] }); const e = pack.index.find(i => i.flags?.nauren?.seedId === seed); return e ? (await pack.getDocument(e._id))?.uuid ?? "" : ""; };
  const D = (regra, automatico, manual = "") => naurenMontarDescricao({ regra, automatico, manual });
  const hab = (seed, name, img, system) => naurenGarantirHabilidadeDeSubclasse(ph, seed, { name, type: "habilidade", img, system: { ativo: true, ...system } });
  const cond = (seed, name, img, system) => naurenGarantirItemNoPack(pc, seed, { name, type: "condicao", img, system: { negativa: "nao", ...system } });
  const NP = { custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP" };
  const pdi = q => [{ recurso: "recursoCustom:pdi", quantidade: String(q), ativo: true, quantidadePorRank: [] }];
  const uSonolento = await uuidSeed(pc, "condicao-sonolento"), uEnven = await uuidSeed(pc, "condicao-envenenamento"), uEncantado = await uuidSeed(pc, "condicao-encantado");

  // ---------------- Condições ----------------
  const cInspiracao = await cond("condicao-inspiracao-genial", "Inspiração Genial", "icons/magic/light/explosion-star-glow-yellow.webp", {
    duracaoModo: "cena", rankAtual: 1, rankMax: 3, usaProximaAcao: true, proximaAcaoApenasAtaque: true, proximaAcaoSoProjeto: "Arma de Inventor", proximaAcaoBonusDano: "(@rank+1)d6", proximaAcaoConsumir: 1,
    descricao: D("O próximo ataque com a Arma de Inventor causa 2d6 de dano a mais (+1d6 por ponto além do 1º).", "entra no próximo ataque com a Arma de Inventor e some; o card mostra os dados.") });
  const cPasso = await cond("condicao-passo-para-o-futuro", "Passo para o Futuro", "icons/equipment/feet/boots-armored-gold.webp", {
    duracaoRodadas: 1, rankAtual: 1, rankMax: 1, modificadores: [{ campo: "movimento", valor: "3" }],
    descricao: D("+3 m de Movimento neste turno.", "soma 3 m ao Movimento; sai na próxima rodada.") });
  const cComposto = await cond("condicao-composto-refinado", "Composto Refinado", "icons/consumables/potions/bottle-conical-corked-yellow.webp", {
    duracaoModo: "cena", acumulativel: true, acumulos: 1, acumulosMax: 9, frascoMods: { semColateral: true },
    descricao: D("O próximo Frasco que você usar não tem efeito colateral.", "o próximo Frasco (beber, dar ou arremessar) sai sem rolar o colateral e 1 acúmulo some.") });
  const cDependencia = await cond("condicao-dependencia-alquimica", "Dependência Alquímica", "icons/consumables/potions/bottle-round-flask-fumes-purple.webp", {
    duracaoModo: "cena", acumulativel: true, acumulos: 1, acumulosMax: 30, modificadores: [{ campo: "poderAtaque", valor: "1" }],
    efeitosAoTerminar: [{ nome: "Abstinência", tipo: "dano", formula: "(@acumulos)d4" }],
    descricao: D("+1 de Poder de Ataque por Frasco consumido na cena. No fim da cena, 1d4 de dano por Frasco consumido.", "cada Frasco que você bebe soma 1 acúmulo; no fim do combate rola 1d4 por acúmulo de dano e a Condição sai.") });
  const cCrescimento = await cond("condicao-frasco-crescimento", "Frasco: Crescimento", "icons/consumables/potions/bottle-circular-corked-labeled-green.webp", {
    duracaoModo: "cena", rankAtual: 1, rankMax: 6, modificadores: [{ campo: "vida", valor: "0", porRank: [] }, { campo: "categoria", valor: "1", porRank: [] }],
    efeitosAoTerminar: [{ nome: "Elixir de Crescimento", tipo: "permanente", campo: "vida", formula: "-1d4", efeitoNome: "Elixir de Crescimento: Vida máxima" }],
    descricao: D("Categoria +1 e Vida máxima em dobro até o fim da cena. Ao final, a Vida máxima cai 1d4 para sempre.", "a Vida máxima a mais é gravada ao beber (o valor dela naquele momento) e a Categoria sobe 1 (até 4); no fim do combate a Condição sai e um Efeito permanente tira 1d4 da Vida máxima, com card.") });
  const cCobaia = await cond("condicao-cobaia-perfeita", "Cobaia Perfeita", "icons/creatures/mammals/livestock-pig-green.webp", {
    duracaoModo: "cena", frascoMods: { maximizado: true },
    descricao: D("Os benefícios dos Frascos nesta personagem saem no máximo; os efeitos colaterais também, se acontecerem.", "todo Frasco que ela beber rola tudo no máximo (o card mostra \"tudo no máximo\"); sai no fim do combate.") });
  const cBomba = await cond("condicao-bomba-eletrica", "Bomba Elétrica", "icons/weapons/thrown/bomb-timer.webp", {
    negativa: "sim", acumulativel: true, acumulos: 1, acumulosMax: 7,
    efeitosPeriodicos: [{ recurso: "acumuloProprio", formula: "1", aumentaPorAcumulo: false, porTurno: true, quando: "inicioTurnoQualquer" }],
    limiarParaGatilho: 7, limiarRemoverAcumulos: 7, limiarEfeitos: [{ nome: "Explosão", rotulo: "Explosão", tipo: "danoArea", formula: "6d6", raio: 3, excluirEu: false }],
    custoParaRemoverRecurso: "estamina", custoParaRemoverQuantidade: "1",
    efeitosAoRemover: [{ nome: "Explosão imediata", rotulo: "Explosão imediata", tipo: "danoArea", formula: "(@acumulos-1)d6", raio: 3, excluirEu: false }],
    descricao: D("Bomba presa ao alvo. Explode depois de 6 turnos (de qualquer criatura), causando 6d6 de dano a todos a até 3 m. O alvo pode gastar 1 PdE para arrancá-la, mas ela explode na hora com 1d6 de dano por turno em que esteve presa.",
      "conta 1 a cada início de turno de qualquer um (começa em 1); no 7 explode (6d6 em 3 m, inclusive o alvo) e some. Arrancar pela ficha custa 1 Estamina e explode com (acúmulos − 1)d6 em 3 m.") });
  await cond("condicao-potencia-eletrica", "Potência Elétrica", "icons/magic/lightning/bolt-strike-blue.webp", {
    duracaoModo: "cena", acoesExtrasNaPrioridade: 1,
    descricao: D("Na próxima Prioridade você faz 2 Ações.", "a Prioridade usada volta para a 2ª Ação; a Condição sai depois.") });
  const efFlores = await naurenGarantirEfeitoDeSubclasse(ph, "efeito-perfume-de-flores-aura", { name: "Aroma de Flores", type: "efeito", img: "icons/commodities/flowers/flower-green.webp",
    system: { ativo: true, usaEmanacao: true, emanacaoEvento: "inicioTurnoNaArea", emanacaoRaio: "3", emanacaoDisposicao: "todos", emanacaoEfeito: "condicao", emanacaoCondicaoUuid: uEncantado, emanacaoCondicaoAcumulos: "1",
      descricao: D("Aroma de 3 m: toda personagem que começar o turno na área recebe 1 acúmulo de Encantado.", "no início do turno de quem estiver a até 3 m, aplica Encantado com card.") } });
  const efDoce = await naurenGarantirEfeitoDeSubclasse(ph, "efeito-perfume-doce-aura", { name: "Aroma Doce", type: "efeito", img: "icons/consumables/potions/flask-decorated-label-pink.webp",
    system: { ativo: true, usaEmanacao: true, emanacaoEvento: "inicioTurnoNaArea", emanacaoRaio: "3", emanacaoDisposicao: "todos", emanacaoEfeito: "condicao", emanacaoCondicaoUuid: uEnven, emanacaoCondicaoAcumulos: "1",
      descricao: D("Aroma de 3 m: toda personagem que começar o turno na área recebe 1 acúmulo de Envenenamento.", "no início do turno de quem estiver a até 3 m, aplica Envenenamento com card.") } });
  const cFlores = await cond("condicao-perfume-de-flores", "Perfume de Flores", "icons/commodities/flowers/flower-green.webp", {
    duracaoModo: "cena", usaConcederItem: true, concederItemUuid: efFlores.uuid,
    descricao: D("Durante 1 cena você exala um aroma poderoso em 3 m: quem começar o turno na área recebe 1 acúmulo de Encantado.", "concede o Efeito \"Aroma de Flores\" (a aura) até o fim do combate.") });
  const cDoce = await cond("condicao-perfume-doce", "Perfume Doce", "icons/consumables/potions/flask-decorated-label-pink.webp", {
    duracaoModo: "cena", usaConcederItem: true, concederItemUuid: efDoce.uuid,
    descricao: D("Durante 1 cena você exala um aroma poderoso em 3 m: quem começar o turno na área recebe 1 acúmulo de Envenenamento.", "concede o Efeito \"Aroma Doce\" (a aura) até o fim do combate.") });

  // ---------------- Engenheiro ----------------
  const tudoOuNada = await hab("habilidade-inventor-tudo-ou-nada", "Tudo ou Nada", "icons/weapons/guns/gun-pistol-flintlock-metal.webp", { rankAtual: 1, rankMax: 3,
    regrasExtras: { ultimoUsoCritico: { fonte: "Arma de Inventor", dadosExtras: "@rank-1" } },
    descricao: D("Passiva. O último uso da sua Arma de Inventor causa dano crítico em um acerto. Para cada ponto além do 1º, +1 dado no dano crítico.", "quando a arma tem 1 uso, o ataque rola o dano como crítico (se acertar; o acerto continua normal) e soma 1 dado por ponto extra; o card mostra \"último uso\".") });
  const martelo = await hab("habilidade-inventor-nova-formula-martelo", "Nova Fórmula: Martelo", "icons/weapons/hammers/hammer-war-spiked.webp", {
    descricao: D("Passiva. Libera a fórmula Martelo na Bancada: Pesado (2 PdE por ataque), alcance 2 m, alvo único, Pigmento +2 de Destino equipado, 2 usos com Recarga. Requisitos de construção: 1 Pigmento (50 Florins) + Aço (50 Florins).", "a fórmula Martelo aparece liberada na Bancada de Invenção, com vaga própria: o Martelo fica junto da Arma de Inventor que você já tem (efeitos iguais entre elas não somam).", "os Florins dos requisitos.") });
  const inspiracao = await hab("habilidade-inventor-inspiracao-genial", "Inspiração Genial", "icons/magic/light/explosion-star-glow-yellow.webp", { rankAtual: 1, rankMax: 3, prioridadeIndicador: "PA",
    acoes: [{ nome: "Inspiração Genial", custoEstamina: 1, alcance: "pessoal", modoAlvo: "nenhum", prioridadeIndicador: "PA", gastaUsoDeProjeto: "Arma de Inventor",
      efeitosEmMim: [{ nome: "Inspiração Genial", tipo: "condicao", uuid: cInspiracao.uuid, rank: "@rank", texto: "o próximo ataque com a Arma de Inventor causa +(@rank+1)d6" }] }],
    descricao: D("Ativa (P/A). Custo: 1 PdE + 1 uso da Arma de Inventor. Seu próximo ataque com essa arma causa 2d6 de dano adicional. Para cada ponto além do 1º, +1 dado.", "gasta o uso da arma (recusa se ela estiver vazia) e deixa \"Inspiração Genial\" pronta para o próximo ataque com ela.") });
  const passo = await hab("habilidade-inventor-passo-para-o-futuro", "Passo para o Futuro", "icons/equipment/feet/boots-armored-gold.webp", { prioridadeIndicador: "PA",
    acoes: [{ nome: "Passo para o Futuro", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", prioridadeIndicador: "PA", usaUsos: true, usosMax: 1, usosAtual: 1, usosReset: "turno", custosRecursoProprio: pdi(1),
      efeitosEmMim: [{ nome: "Passo para o Futuro", tipo: "condicao", uuid: cPasso.uuid, acumulos: "1", texto: "+3 m de Movimento neste turno" }] }],
    descricao: D("Ativa (P/A), 1 vez por turno. Requisito: Pigmento (50 Florins). Melhorias nas suas armaduras: gaste 1 PdI para aumentar seu Movimento em 3 m.", "1 PdI vira +3 m de Movimento neste turno (com card).", "os Florins do requisito.") });
  const ceus = await hab("habilidade-inventor-alcancar-os-ceus", "Alcançar os Céus", "icons/equipment/back/cape-layered-brown-gold.webp", {
    efeitosVinculados: [{ id: "", ativo: true, modificadores: [{ campo: "defesa", valor: "min(1,@equipados_Capa)", porRank: [] }], condicoesAplicadas: [] }],
    acoes: [{ ...NP, nome: "Amortecer a queda (PdI)", custosRecursoProprio: pdi(1), lembreteNoCard: "o dano de queda desta queda vai a 0" },
      { ...NP, nome: "Amortecer a queda (PdE)", custoEstamina: 1, lembreteNoCard: "o dano de queda desta queda vai a 0" }],
    descricao: D("Passiva. Requisito: Pigmento (10 Florins). Suas capas modificadas ganham +1 de Defesa, e você pode reduzir todo dano de queda gastando 1 PdI ou 1 PdE.", "+1 de Defesa com uma Capa equipada; \"Amortecer a queda\" cobra 1 PdI ou 1 PdE e registra no card.", "o sistema não calcula dano de queda: a mesa zera o dano daquela queda.") });
  const motor = await hab("habilidade-inventor-motor-cardiaco", "Motor Cardíaco", "icons/commodities/biological/organ-heart-red.webp", { rankAtual: 1, rankMax: 3, prioridadeIndicador: "PA",
    acoes: [{ nome: "Motor Cardíaco", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", prioridadeIndicador: "PA", custosRecursoProprio: pdi(5),
      efeitosEmMim: [{ nome: "Estamina", tipo: "recurso", recurso: "estaminaCombate", formula: "1d4+@rank-1" }, { nome: "Estresse", tipo: "recurso", recurso: "estresse", formula: "1" }, { nome: "Choque", tipo: "dano", formula: "5" }] }],
    descricao: D("Ativa (P/A), quantas vezes puder pagar. Troque 5 PdI para recuperar 1d4 PdE; você sofre 1 de Estresse e 5 de dano. Para cada ponto além do 1º, +1 PdE recuperado.", "cobra 5 PdI, rola a Estamina, soma 1 de Estresse e tira 5 de Vida, tudo no card.") });
  const bugigangas = await hab("habilidade-inventor-mr-bugigangas", "Mr. Bugigangas", "icons/containers/chest/chest-reinforced-steel-brown.webp", {
    acoes: [{ ...NP, nome: "Tirar requisito da maleta", usaEscolhaDeRecurso: true, escolhaDeRecursoTipo: "recursoCustom:pdi", escolhaDeRecursoMinimo: 1, custosRecursoProprio: pdi("@quantidadeEscolhida"), lembreteNoCard: "cada PdI paga 2 Florins de um item exigido por habilidade de Inventor" }],
    descricao: D("Passiva. Sua maleta cria itens de requisito: para cada 2 Florins de custo de um item exigido por uma habilidade de Inventor, gaste 1 PdI para obtê-lo.", "a Ação pergunta quantos PdI gastar e registra no card (1 PdI = 2 Florins).", "o item de requisito em si.") });
  const cartola = await hab("habilidade-inventor-truque-da-cartola", "Truque da Cartola", "icons/equipment/head/hat-tophat.webp", {
    descricao: D("Passiva. Os custos em Florins dos requisitos dos seus itens são reduzidos pela metade.", "aparece na ficha como lembrete.", "a economia em Florins.") });
  const relogio = await hab("habilidade-inventor-mecanismo-do-relogio", "Mecanismo do Relógio", "icons/magic/time/clock-spinning-gold-pink.webp", { prioridadeIndicador: "NP",
    acoes: [{ ...NP, nome: "Mecanismo do Relógio", motionUsuario: "rebobinar", usaUsos: true, usosMax: 1, usosAtual: 1, usosReset: "cena", custosRecursoProprio: pdi(5),
      efeitosEmMim: [{ nome: "Mecanismo do Relógio", tipo: "restaurarVidaMemoria" }] }],
    descricao: D("Ativa (N/P), 1 por cena, 5 PdI. Requisito: Pigmento (100 Florins) + Metal (50 Florins). Seus Pontos de Vida voltam ao valor que tinham no início do seu turno anterior. Pode ser usada fora do seu turno.", "o sistema guarda a sua Vida no início de cada turno seu; usada fora do seu turno volta ao início do último turno, no seu turno volta ao do turno anterior. O card mostra antes e depois.", "os Florins do requisito.") });

  // ---------------- Apotecário ----------------
  const explosivo = await hab("habilidade-inventor-frasco-explosivo", "Frasco Explosivo", "icons/magic/fire/explosion-flame-blue.webp", {
    acoes: [{ nome: "Arremessar Frasco", custoEstamina: 1, alcance: "4m", modoAlvo: "area", usaTemplate: true, templateTipo: "circle", templateTamanho: 2, areaDisposicao: "todos",
      usaFrascoDoInventario: true, soEmPrioridade: true, usaUsos: true, usosMax: 1, usosAtual: 1, usosReset: "cena", usosDeOutroItemNome: "Os Frascos" }],
    descricao: D("Ação anunciada, só durante uma Prioridade. Alcance 4 m (raio 2 m). Custo: 1 PdE + 1 uso dos Frascos. Arremesse um Frasco que possua: cada personagem na área (aliados e inimigos) recebe os benefícios e rola o próprio colateral.", "escolhe o Frasco da mochila, desenha a área e aplica em todos dentro; cada um rola o 1d6 do colateral no seu card. Fora de uma Prioridade é recusado.") });
  const perfumista = await hab("habilidade-inventor-perfumista-mestre", "Perfumista Mestre", "icons/consumables/potions/flask-decorated-label-pink.webp", {
    frascoMods: { resumo: "o colateral pode virar Perfume (1 PdI + 1 PdE + 1 uso)", perfumes: { custo: [{ recurso: "recursoCustom:pdi", quantidade: 1 }, { recurso: "estaminaCombate", quantidade: 1 }], usosDe: "Os Frascos",
      opcoes: [{ nome: "Perfume de Flores", condicaoUuid: cFlores.uuid }, { nome: "Perfume Doce", condicaoUuid: cDoce.uuid }] } },
    descricao: D("Passiva com gatilho. Custo: 1 PdI + 1 PdE + 1 uso dos Frascos. Quando tiver que rolar na tabela de colaterais por ter consumido um Frasco, você pode trocar o efeito por um Perfume: de Flores (Encantado) ou Doce (Envenenamento), em 3 m por 1 cena.", "na hora do colateral aparece a troca por Perfume (com o custo); o Perfume escolhido vira uma aura de 3 m até o fim do combate.") });
  const sangueDragao = await hab("habilidade-inventor-pocao-sangue-de-dragao", "Poção de Sangue de Dragão", "icons/creatures/abilities/dragon-head-fire-breath-orange.webp", {
    descricao: D("Passiva. Seus Frascos ganham 4 benefícios novos (2 PdI cada): restaura 3 de Mana, restaura 3 de Energia, +2 de Poder de Ataque ou +2 de Poder de Magia.", "as 4 linhas aparecem no Alambique com o selo \"Sangue de Dragão\".") });
  const alquimia = await hab("habilidade-inventor-alquimia-avancada", "Alquimia Avançada", "icons/consumables/potions/bottle-conical-bubbling-blue.webp", { rankAtual: 1, rankMax: 3,
    usosExtrasEm: [{ itemNome: "Os Frascos", valor: "@rank", alvo: "item" }, { itemNome: "Os Frascos", valor: "1", alvo: "Preparar Frasco" }],
    descricao: D("Passiva. +1 uso dos Frascos, e você pode fazer 2 Frascos quando usar o Exercício Teórico (com os requisitos de itens). Para cada ponto além do 1º, +1 uso dos Frascos.", "os usos de Os Frascos e os preparos no Alambique sobem sozinhos (o Alambique mostra \"Preparos: 2\").") });
  const composto = await hab("habilidade-inventor-composto-refinado", "Composto Refinado", "icons/consumables/potions/bottle-conical-corked-yellow.webp", { rankAtual: 1, rankMax: 3, prioridadeIndicador: "PA",
    usosExtrasEm: [{ itemNome: "Composto Refinado", valor: "@rank-1", alvo: "" }],
    acoes: [{ nome: "Composto Refinado", custoEstamina: 1, alcance: "pessoal", modoAlvo: "nenhum", prioridadeIndicador: "PA", usaUsos: true, usosMax: 1, usosAtual: 1, usosReset: "cena",
      efeitosEmMim: [{ nome: "Composto Refinado", tipo: "condicao", uuid: cComposto.uuid, acumulos: "1", texto: "o próximo Frasco sai sem colateral" }] }],
    descricao: D("Ativa (P/A). Custo: 1 PdE, 1 por cena. Seu próximo Frasco não causa efeito colateral. Para cada ponto além do 1º, +1 uso.", "deixa \"Composto Refinado\" em você; o próximo Frasco que você usar sai sem colateral (o card avisa).") });
  const arcoIris = await hab("habilidade-inventor-elixir-arco-iris", "Elixir Arco-Íris", "icons/consumables/potions/flask-red-bubbles-vortex.webp", { rankAtual: 1, rankMax: 3,
    frascoMods: { bonus: "@rank", resumo: "+@rank nos benefícios e nos colaterais" },
    descricao: D("Passiva. +1 nos efeitos dos benefícios dos seus Frascos, e também +1 nos efeitos colaterais. Para cada ponto além do 1º, +1 nos dois.", "dados ganham +rank (1d6 vira 1d6+1) e Condições ganham +rank acúmulos, nos benefícios e nos colaterais; o card mostra \"+N nos efeitos\".") });
  const verde = await hab("habilidade-inventor-elixir-verde", "Elixir Verde", "icons/consumables/potions/bottle-bulb-corked-green.webp", {
    acoes: [{ ...NP, nome: "Preparar Elixir Verde", criaFrasco: { nome: "Elixir Verde", img: "icons/consumables/potions/bottle-bulb-corked-green.webp", semColateral: true, umaVezChave: "elixir-verde",
      efeitos: [{ nome: "Vitalidade", rotulo: "Vitalidade permanente", tipo: "permanente", campo: "vitalidade", formula: "1d4", efeitoNome: "Elixir Verde" }],
      descricao: "Aumenta a Vitalidade de quem beber em 1d4 permanentemente. Cada personagem só pode receber uma vez.", manual: "o Pigmento (50 Florins)." } }],
    descricao: D("Passiva. Uma vez por personagem. Requisito: Pigmento (50 Florins). Aumenta o meta-atributo Vitalidade de quem ingerir este Elixir em 1d4, permanentemente.", "\"Preparar Elixir Verde\" põe o frasco na mochila; ao beber, um Efeito permanente soma a Vitalidade. Quem já bebeu um não ganha de novo (card avisa).", "os Florins do Pigmento.") });
  const crescimento = await hab("habilidade-inventor-elixir-de-crescimento", "Elixir de Crescimento", "icons/consumables/potions/bottle-circular-corked-labeled-green.webp", {
    descricao: D("Passiva. Novo benefício para seus Frascos (6 PdI): aumenta a Categoria em 1 e dobra os Pontos de Vida máximos por 1 cena. Ao final, reduz a Vida máxima permanentemente em 1d4.", "a linha \"Crescimento\" aparece no Alambique; o fim da cena e a perda permanente saem sozinhos com card.") });
  const dependencia = await hab("habilidade-inventor-dependencia-alquimica", "Dependência Alquímica", "icons/consumables/potions/bottle-round-flask-fumes-purple.webp", {
    frascoMods: { aoBeber: { condicaoUuid: cDependencia.uuid, acumulos: 1 }, resumo: "+1 PdA por Frasco bebido; 1d4 de dano por Frasco no fim da cena" },
    descricao: D("Passiva, dura 1 cena. Sempre que consumir um Frasco, +1 de Poder de Ataque. No fim da cena, sofra 1d4 de dano para cada Frasco consumido.", "cada Frasco que você bebe soma 1 acúmulo de \"Dependência Alquímica\" (+1 PdA cada); no fim do combate, 1d4 por acúmulo, com card.") });

  // ---------------- Estudioso do Oculto ----------------
  const bomba = await hab("habilidade-inventor-bomba-eletrica", "Bomba Elétrica", "icons/weapons/thrown/bomb-timer.webp", { prioridadeIndicador: "PI",
    acoes: [{ nome: "Arremessar Bomba Elétrica", custoEstamina: 1, alcance: "4m", modoAlvo: "selecionado", modoAlvoTravado: true, prioridadeIndicador: "PI",
      condicoesAplicadas: [{ uuid: cBomba.uuid, acumulos: 1, ativo: true, soSeAcertar: false, perguntarParaEvitar: false }] }],
    descricao: D("Ataque especial (P/I). Requisito: 200 Florins por bomba. Por 1 PdE, arremesse a até 4 m: a bomba se fixa ao alvo e explode após 6 turnos, causando 6d6 de dano a todos a até 3 m. O alvo pode gastar 1 PdE para removê-la, causando uma explosão imediata de 1d6 por turno em que esteve presa.", "a Condição \"Bomba Elétrica\" conta os turnos e explode sozinha; arrancar pela ficha cobra 1 Estamina e explode na hora.", "os 200 Florins de cada bomba.") });
  const conduite = await hab("habilidade-inventor-conduite", "Conduite", "icons/commodities/tech/coil-tesla-large.webp", {
    usaGatilhos: true, gatilhos: [{ evento: "fuiAtingidoPorAtaque", recurso: "danoNoAtacante", quantidade: "1d8", alcance: "3" }],
    descricao: D("Passiva. Requisito: Pigmento (200 Florins). Aprimora armaduras: ao ser atingido por um ataque de um inimigo a até 3 m, ele sofre 1d8 de dano.", "quando um ataque te acerta e o atacante está a até 3 m, rola 1d8 nele com card.", "os Florins do requisito.") });
  const potencia = await hab("habilidade-inventor-potencia-eletrica", "Potência Elétrica", "icons/magic/lightning/bolt-strike-blue.webp", { rankAtual: 1, rankMax: 3,
    usaUsosPassiva: true, usosPassivaMax: 1, usosPassivaMaxFormula: "@rank", usosPassivaAtual: 1, usosPassivaReset: "cena",
    regrasExtras: { acaoExtraNaPrioridade: { exigeProjetoEquipado: "Arma de Inventor" } },
    descricao: D("Passiva, 1 por cena. Enquanto estiver empunhando ou equipado com sua Arma de Inventor, você pode realizar duas Ações em uma Prioridade, ao invés de uma. Para cada ponto além do 1º, +1 uso.", "ao usar uma Prioridade com a arma equipada, pergunta se quer fazer 2 Ações; dizendo sim, gasta 1 uso e a Prioridade fica para a 2ª Ação.") });
  const cobaia = await hab("habilidade-inventor-busca-cobaia-perfeita", "Busca pela Cobaia Perfeita", "icons/creatures/mammals/livestock-pig-green.webp", {
    usaGatilhos: true, gatilhos: [{ evento: "inicioCombate", recurso: "condicaoEmAliadoEscolhido", efeitoUuid: cCobaia.uuid, quantidade: "1" }],
    descricao: D("Passiva. Ao iniciar uma cena de combate, escolha um aliado: ele recebe todos os benefícios dos seus Frascos maximizados, e os efeitos colaterais também, caso ocorram.", "no começo do combate pergunta qual aliado vira \"Cobaia Perfeita\" até o fim do combate.") });
  const oleo = await hab("habilidade-inventor-oleo-de-beladona", "Óleo de Beladona", "icons/consumables/potions/bottle-conical-fumes-green.webp", {
    regrasExtras: { condicaoAoAcertarProjeto: { fonte: "Arma de Inventor", opcoes: [uSonolento, uEnven].filter(Boolean), acumulos: "1" } },
    descricao: D("Passiva. Ao atingir um inimigo com sua Arma de Inventor, aplique 1 acúmulo de Sonolento ou Envenenamento.", "ao atacar com a Arma de Inventor você escolhe qual; entra só se acertar.") });
  const doutorPeste = await hab("habilidade-inventor-doutor-da-peste", "Doutor da Peste", "icons/equipment/head/mask-plague-leather-brown.webp", { prioridadeIndicador: "NP",
    usaGatilhos: true, gatilhos: [{ evento: "alguemRecebeuCondicao", recurso: "copiarCondicaoRecebida", alvoInimigoAteMetros: "3", pagarRecurso: "recursoCustom:pdi", pagarQuantidade: "1", quantidade: "1" }],
    descricao: D("Ação especial (N/P). Quando um inimigo a até 3 m de você recebe uma Condição, você pode gastar 1 PdI para aplicar 1 acúmulo da mesma Condição a outro inimigo dentro do alcance.", "quando isso acontece aparece a pergunta com os outros inimigos a até 3 m; escolhendo um, cobra 1 PdI e aplica.") });
  const remedio = await hab("habilidade-inventor-remedio-nao-testado", "Remédio Não Testado", "icons/consumables/potions/potion-bottle-labeled-medicine-capped-red-black.webp", {
    acoes: [{ ...NP, nome: "Preparar Remédio Não Testado", criaFrasco: { nome: "Remédio Não Testado", img: "icons/consumables/potions/potion-bottle-labeled-medicine-capped-red-black.webp", semColateral: true, umaVezChave: "remedio-nao-testado", escolherPeculiaridade: true,
      efeitos: [], descricao: "Frasco especial sem efeito colateral: quem beber recebe a Peculiaridade escolhida pelo Inventor, para sempre. Uma vez por personagem.", manual: "o Pigmento (50 Florins)." } }],
    descricao: D("Passiva. Uma vez por personagem. Requisito: Pigmento (50 Florins). Um Frasco especial sem efeito colateral: quem o consome recebe 1 Peculiaridade permanente.", "\"Preparar Remédio Não Testado\" pede a Peculiaridade (à escolha do Inventor) e põe o frasco na mochila; ao beber, a Peculiaridade entra na ficha. Quem já tomou um não ganha de novo.", "os Florins do Pigmento.") });
  const cirurgia = await hab("habilidade-inventor-cirurgia-sinistra", "Cirurgia Sinistra", "icons/commodities/biological/organ-heart-black.webp", {
    acoes: [{ nome: "Cirurgia Sinistra", custoEstamina: 0, alcance: "1m", modoAlvo: "selecionado", modoAlvoTravado: true, naoGeraPrioridade: true, prioridadeIndicador: "NP",
      efeitosNoAlvo: [{ nome: "Cirurgia Sinistra", tipo: "pontosAtributo", formula: "1d4", efeitoNome: "", umaVezChave: "cirurgia-sinistra" }, { nome: "Cirurgia Sinistra", tipo: "estressePermanente", valor: 1 }] }],
    descricao: D("Passiva. Uma vez por personagem. Requisito: Pigmento (50 Florins). Modifique permanentemente o corpo de um aliado, concedendo 1d4 pontos de atributo. Ele sofre 1 de Estresse permanente.", "marque o aliado e use: rola 1d4, ele distribui os pontos (Efeitos permanentes) e ganha 1 de Estresse permanente. Quem já passou pela cirurgia é recusado antes de gastar.", "os Florins do Pigmento e o tempo da cirurgia.") });
  const uObediencia = (await hab("habilidade-obra-prima-obediencia-cega", "Obediência Cega", "icons/magic/control/control-influence-crown-gold.webp", {
    descricao: D("Passiva. Apenas age durante Prioridades: não tem turno na ordem de turnos.", "a ficha não entra na iniciativa; cada Ação dela gasta uma Prioridade recebida (sem Prioridade, é recusada).") })).uuid;
  const uCobaiaOP = (await hab("habilidade-obra-prima-cobaia", "Cobaia", "icons/creatures/mammals/livestock-pig-green.webp", { frascoMods: { beneficioExtraAleatorio: true },
    descricao: D("Passiva. Sempre que a Obra Prima recebe o efeito de um Frasco, ela recebe um benefício adicional aleatório.", "ao beber, sorteia 1 benefício a mais do catálogo do Frasco (card mostra o dado).") })).uuid;
  const uPancada = (await hab("habilidade-obra-prima-pancada", "Pancada", "icons/skills/melee/unarmed-punch-fist-yellow-red.webp", { prioridadeIndicador: "PI",
    acoes: [{ nome: "Pancada", custoEstamina: 2, alcance: "1m", ehAtaque: true, atributoAtaque: "poderAtaque", modoAlvo: "selecionado", modoAlvoTravado: true, prioridadeIndicador: "PI", danos: [{ formula: "1d6+@poderAtaque", aplicarNoAlvo: true }] }],
    descricao: D("Ataque básico (P/I). Alcance 1 m, custo 2 PdE. Ataque (1d20 + PdA) que causa 1d6 + PdA de dano num acerto (substituído pelo dano da arma, se estiver empunhando uma).", "ataque e dano automáticos.", "com uma arma, use o ataque da arma no lugar.") })).uuid;
  const obraPrima = await hab("habilidade-inventor-obra-prima", "Obra Prima", "icons/creatures/magical/construct-golem-robot-blue.webp", {
    obraPrima: { recurso: "recursoCustom:pdi", sigla: "PdI", titulo: "Obra Prima", subtitulo: "Cobaia Nº 1", nomePadrao: "Obra Prima", atributoBase: 1, categoria: 2, defesa: 14, movimento: 5,
      img: "icons/creatures/magical/construct-golem-robot-blue.webp", itensUuids: [uObediencia, uCobaiaOP, uPancada],
      passivas: [{ nome: "Obediência Cega", texto: "sem turno na iniciativa; só age quando recebe Prioridade." }, { nome: "Cobaia", texto: "todo Frasco nela dá 1 benefício extra sorteado." }] },
    acoes: [{ ...NP, nome: "Construir a Obra Prima", abrirConstrucao: "obraPrima" }],
    descricao: D("Passiva. Você pode construir uma Obra Prima durante o Exercício Teórico; só pode existir uma por vez. Um autômato ou golem de pigmento semelhante a carne: gaste Pontos de Invenção para aumentar os atributos dela (menos Inteligência). Categoria 2, criada no seu nível; usa todos os tipos de armas e armaduras. Ficha: Vida 1 (atributos 1), Defesa 14, Movimento 5 m, Estresse 2.",
      "a janela da Obra Prima distribui os PdI (+1 por ponto) e mostra a Vida; \"Dar vida\" cria a ficha (Obediência Cega, Cobaia, Pancada), põe o token ao seu lado e desfaz a anterior.", "construa fora de combate, durante o Exercício Teórico.") });

  // ---------------- Árvore sobre a página do livro ----------------
  const W = 7.08, H = 5.01, X = [5.48, 37.65, 69.88];
  const no = (id, col, y, nome, tipo, item, rankMax = 1, pre = []) => ({ id, x: X[col], y, largura: W, altura: H, nome, tipo, rankMax, itemUuid: item.uuid, prerequisitos: pre.map(p => ({ id: p, linhaVisivel: false })) });
  const nos = [
    no("tudo-ou-nada", 0, 0.14, "Tudo ou Nada", "Habilidade Passiva", tudoOuNada, 3),
    no("nova-formula-martelo", 1, 0.14, "Nova Fórmula: Martelo", "Habilidade Passiva", martelo, 1, ["tudo-ou-nada"]),
    no("inspiracao-genial", 2, 0.14, "Inspiração Genial", "Habilidade Ativa", inspiracao, 3, ["nova-formula-martelo"]),
    no("passo-para-o-futuro", 0, 11.76, "Passo para o Futuro", "Habilidade Ativa", passo),
    no("alcancar-os-ceus", 1, 11.76, "Alcançar os Céus", "Habilidade Passiva", ceus, 1, ["passo-para-o-futuro"]),
    no("motor-cardiaco", 2, 11.76, "Motor Cardíaco", "Habilidade Ativa", motor, 3, ["alcancar-os-ceus", "inspiracao-genial"]),
    no("mr-bugigangas", 0, 22.82, "Mr. Bugigangas", "Habilidade Passiva", bugigangas),
    no("truque-da-cartola", 1, 22.82, "Truque da Cartola", "Habilidade Passiva", cartola, 1, ["mr-bugigangas", "alcancar-os-ceus"]),
    no("mecanismo-do-relogio", 2, 22.82, "Mecanismo do Relógio", "Habilidade Ativa", relogio, 1, ["truque-da-cartola"]),
    no("frasco-explosivo", 0, 33.74, "Frasco Explosivo", "Habilidade Ativa", explosivo),
    no("perfumista-mestre", 1, 33.74, "Perfumista Mestre", "Habilidade Passiva", perfumista, 1, ["frasco-explosivo"]),
    no("sangue-de-dragao", 2, 33.74, "Poção de Sangue de Dragão", "Habilidade Passiva", sangueDragao, 1, ["perfumista-mestre"]),
    no("alquimia-avancada", 0, 44.46, "Alquimia Avançada", "Habilidade Passiva", alquimia, 3),
    no("composto-refinado", 1, 44.46, "Composto Refinado", "Habilidade Ativa", composto, 3, ["alquimia-avancada"]),
    no("elixir-arco-iris", 2, 44.46, "Elixir Arco-Íris", "Habilidade Passiva", arcoIris, 3, ["composto-refinado", "sangue-de-dragao"]),
    no("elixir-verde", 0, 55.93, "Elixir Verde", "Habilidade Passiva", verde),
    no("elixir-de-crescimento", 1, 55.93, "Elixir de Crescimento", "Habilidade Passiva", crescimento, 1, ["elixir-verde", "composto-refinado"]),
    no("dependencia-alquimica", 2, 55.93, "Dependência Alquímica", "Habilidade Passiva", dependencia, 1, ["elixir-de-crescimento"]),
    no("bomba-eletrica", 0, 67.15, "Bomba Elétrica", "Ataque Especial", bomba),
    no("conduite", 1, 67.15, "Conduite", "Habilidade Passiva", conduite, 1, ["bomba-eletrica"]),
    no("potencia-eletrica", 2, 67.15, "Potência Elétrica", "Habilidade Passiva", potencia, 3, ["conduite"]),
    no("busca-cobaia-perfeita", 0, 78.87, "Busca pela Cobaia Perfeita", "Habilidade Passiva", cobaia),
    no("oleo-de-beladona", 1, 78.87, "Óleo de Beladona", "Habilidade Passiva", oleo, 1, ["busca-cobaia-perfeita"]),
    no("doutor-da-peste", 2, 78.87, "Doutor da Peste", "Ação Especial", doutorPeste, 1, ["oleo-de-beladona", "potencia-eletrica"]),
    no("remedio-nao-testado", 0, 90.18, "Remédio Não Testado", "Habilidade Passiva", remedio),
    no("cirurgia-sinistra", 1, 90.18, "Cirurgia Sinistra", "Habilidade Passiva", cirurgia, 1, ["remedio-nao-testado"]),
    no("obra-prima", 2, 90.18, "Obra Prima", "Habilidade Passiva", obraPrima, 1, ["cirurgia-sinistra"])
  ];
  await naurenGarantirItemNoPack(packs.subclasses, "subclasse-inventor", {
    name: "Inventor — Subclasses", type: "subclasse", img: "icons/commodities/tech/cog-brass.webp",
    system: {
      identifier: "inventor-subclasses", classeIdentifier: "inventor",
      descricao: "<p>As 3 vias do Inventor, sobre a página do livro: <b>Engenheiro</b> (topo) - armas e armaduras. <b>Apotecário</b> (meio) - frascos. <b>Estudioso do Oculto</b> (base) - eletricidade e cobaias, até a Obra Prima.</p>",
      imagemFundo: naurenCaminhoImagemSubclasse("inventor"), zoomFundo: 100, nos
    }
  });
  return { cCrescimento: cCrescimento.uuid };
}


/** Dados da aba Invenções (Inventor): Pontos de Invenção, invenções feitas e o que vem nos próximos níveis. */
function naurenContextoInvencoes(actor, emCombate = false) {
  const habs = (actor?.items ?? []).filter(i => naurenConstrucaoDe(i) && naurenConstrucaoDe(i).janela !== "alambique");
  const habFrascos = (actor?.items ?? []).find(i => naurenConstrucaoDe(i)?.janela === "alambique");
  const pdiCru = (actor?.system?.recursosCustom ?? []).find(r => r.id === "pdi");
  if (!habs.length && !pdiCru) return null;
  const c0 = habs[0] ? naurenConstrucaoDe(habs[0]) : null;
  const recSpec = c0?.recurso || (pdiCru ? "recursoCustom:pdi" : "");
  const rec = recSpec ? naurenRecursoDoAtor(actor, recSpec) : null;
  const acharAcao = (pred) => {
    for (const it of actor.items) { const idx = (it.system?.acoes ?? []).findIndex(pred); if (idx >= 0) return { itemId: it.id, acao: idx, nome: it.system.acoes[idx].nome }; }
    return null;
  };
  const meditar = recSpec ? acharAcao(a => a.restauraRecurso === recSpec) : null;
  const exercicio = (() => { const it = actor.items.find(i => naurenEhItem(i, "Exercício Teórico")); return it && (it.system.acoes ?? []).length ? { itemId: it.id, acao: 0 } : null; })();
  const classeDe = rot => /^(Dano|Acerto|Ao acertar)$/.test(rot) ? "of" : /^(Alcance|Custo|Usos|Recarga)$/.test(rot) ? "neutro" : /Movimento|Força|Agilidade|Estamina|Inteligência|Destino|Estresse/.test(rot) ? "sp" : "df";
  const armas = [];
  for (const hab of habs) {
    const c = naurenConstrucaoDe(hab);
    const feitos = naurenItensDoProjeto(actor, hab);
    for (const it of feitos) {
      const proj = it.getFlag("nauren", "projeto") ?? {};
      const formula = c.formulas.find(f => f.id === proj.formula) ?? c.formulas[0];
      const acoes = it.system.acoes ?? [];
      const ataqueIdx = acoes.findIndex(a => a.ehAtaque && !a.recarregaUsos && !a.usaTemplate);
      const recIdx = acoes.findIndex(a => a.recarregaUsos);
      const extras = acoes.map((a, i) => ({ a, i })).filter(x => x.i !== ataqueIdx && x.i !== recIdx)
        .map(({ a, i }) => ({ nome: a.nome, acao: i, resta: a.usosProprios && a.usaUsos ? `${a.usosAtual ?? 0}/${a.usosMax ?? 0}` : "" }));
      const atual = it.system.usosAtual ?? 0, max = it.system.usosMax ?? 0;
      const rAcao = recIdx >= 0 ? acoes[recIdx] : null;
      let recargaMotivo = "";
      if (rAcao) {
        if (atual >= max) recargaMotivo = "cheia";
        else if (rAcao.recarregaSoSeVazio && emCombate && atual > 0) recargaMotivo = "só sem usos";
      }
      const resumo = naurenResumoItemProjeto({ system: it.system }, actor).filter(l => !/^(Usos|Recarga|Ações extras|Custo)$/.test(l.rotulo));
      const ataqueA = ataqueIdx >= 0 ? acoes[ataqueIdx] : null;
      for (const l of resumo) if (l.rotulo === "Alcance") l.valor = `${String(ataqueA?.alcance ?? "").replace(/(\d)m$/, "$1 m")}${ataqueA ? ` · ${ataqueA.custoEstamina ?? 0} Estamina` : ""}`;
      const m = naurenMelhoriasDoProjeto(c, proj, actor);
      armas.push({
        id: it.id, nome: it.name, habId: hab.id, fonte: hab.name, formula: formula?.nome ?? "", equipado: !!it.system.equipado,
        esboco: NAUREN_ESBOCOS[formula?.esboco] ?? NAUREN_ESBOCOS.generico,
        chips: resumo.filter(l => !(l.rotulo === "Acerto" && l.valor === "1d20 puro")).map(l => ({ texto: l.rotulo === "Dano" ? (l.valor === "sem dano" ? "sem dano" : `${l.valor.replace(/\s*\(média.*$/, "")} de dano`) : (l.rotulo === "Acerto" ? `${l.valor} acerto` : (l.rotulo === "Alcance" ? l.valor : `${l.rotulo} ${l.valor}`)), classe: classeDe(l.rotulo) })),
        usos: it.system.usaUsos ? { atual, max, pips: Array.from({ length: max }, (_, i) => ({ cheio: i < atual, ultimo: i === atual - 1 && atual === 1 })) } : null,
        ataque: ataqueIdx >= 0 ? { acao: ataqueIdx, nome: acoes[ataqueIdx].nome, semUsos: it.system.usaUsos && atual <= 0 } : null,
        recarga: rAcao ? { acao: recIdx, motivo: recargaMotivo, rotulo: `Recarga ${rAcao.recarregaFormula || "1d6"}${String(rAcao.recarregaBonus ?? "").trim() && rAcao.recarregaBonus !== "0" ? `+${rAcao.recarregaBonus}` : ""}` } : null,
        extras, podeMelhorar: !!m.proxima, melhoriaTexto: m.proxima ? `Melhoria do nível ${m.proxima.nivel} disponível` : ""
      });
    }
  }
  const semArma = habs.filter(h => !naurenItensDoProjeto(actor, h).length).map(h => ({ habId: h.id, nome: naurenConstrucaoDe(h).titulo || h.name, orcamento: Math.max(0, Math.round(naurenInterpretarModificador(String(naurenConstrucaoDe(h).orcamento ?? "0"), actor)?.valor ?? 0)) }));
  // 0.97.7: fórmula liberada por habilidade (ex.: Nova Fórmula: Martelo) ganha a própria vaga — mesmo já tendo a arma,
  // aparece um "Ainda sem Martelo" com a Bancada (antes só dava para criar quando não havia arma nenhuma).
  for (const h of habs) {
    if (!naurenItensDoProjeto(actor, h).length) continue;
    const c = naurenConstrucaoDe(h);
    for (const f of (c?.formulas ?? []).filter(x => x.requer)) {
      if (!naurenFormulaCriavel(c, actor, h, f).ok) continue;
      semArma.push({ habId: h.id, nome: f.nome, orcamento: Math.max(0, Math.round(naurenInterpretarModificador(String(c.orcamento ?? "0"), actor)?.valor ?? 0)) });
    }
  }
  const nivel = actor.system?.nivel ?? 1;
  // Prateleira de Frascos (Os Frascos) e Ferramentas.
  let prateleira = null;
  if (habFrascos) {
    const maxB = (naurenResolverPorNivel(habFrascos.system.usosMaxPorNivel, nivel, "valor") ?? habFrascos.system.usosMax ?? 1) + naurenUsosExtrasPara(actor, habFrascos, "item");
    const prep = (habFrascos.system.acoes ?? []).find(a => a.abrirConstrucao);
    const explosivo = (() => { for (const it of actor.items) { const i = (it.system?.acoes ?? []).findIndex(a => a.usaFrascoDoInventario); if (i >= 0) return { itemId: it.id, acao: i, nome: it.system.acoes[i].nome }; } return null; })();
    const frascos = naurenFrascosDoAtor(actor).map(f => {
      const fr = f.system.frasco ?? {};
      const nB = Math.min(6, Number(fr.beneficios) || 0);
      const cores = naurenCoresDoFrasco(f);
      return { id: f.id, nome: f.name, img: f.img, qtd: f.system.quantidade ?? 1, efeitos: (fr.efeitos ?? []).map(e => naurenTextoEfeitoFrasco(e)).join(" · "),
        colateral: fr.semColateral ? "Sem colateral" : `Colateral: ${nB} em 6`, cor: cores.length ? naurenMediaCores(cores) : "#cca162", acao: Math.max(0, (f.system.acoes ?? []).findIndex(a => a.bebeFrasco)),
        clipId: `niv-frasco-${f.id}`, ...naurenCamadasFrasco(cores) };
    });
    prateleira = { habId: habFrascos.id, usos: `${habFrascos.system.usosAtual ?? 0} de ${maxB}`, preparos: prep?.usaUsos ? `${prep.usosAtual ?? 0} de ${(prep.usosMax ?? 1) + naurenUsosExtrasPara(actor, habFrascos, prep.nome)}` : "", frascos, explosivo,
      vagas: Math.max(0, 3 - frascos.length) ? Array.from({ length: Math.max(0, 3 - frascos.length) }, () => ({})) : [] };
  }
  const ferramentas = (actor?.items ?? []).filter(i => i.getFlag?.("nauren", "grupoUI") === "ferramenta").map(f => {
    const a0 = (f.system.acoes ?? [])[0];
    let status = "";
    if (a0?.usaUsos) status = `${a0.usosAtual ?? 0}/${a0.usosMax ?? 1} cena`;
    const g = (f.system.gatilhos ?? []).find(x => x.recurso === "recuperarUsoACada");
    const contador = g ? { n: f.getFlag("nauren", "contadorRecuperar") ?? 0, de: Number(g.quantidade) || 1 } : null;
    const mods = (f.system.efeitosVinculados?.[0]?.modificadores ?? []).map(m => {
      const v = naurenInterpretarModificador(String(m.valor), actor)?.valor;
      return m.campo === "defesa" ? `+${v ?? m.valor} Defesa` : m.campo === "limiteOfensivo" ? `+${v ?? m.valor} no limite ofensivo` : "";
    }).filter(Boolean);
    // Efeito pronto em você (ex.: Bobina Carregada, Monóculo Ajustado): a ferramenta mostra que está armada.
    const nomeCondA = String(a0?.condicaoEmMimUuid ?? "").startsWith("self:") ? a0.condicaoEmMimUuid.slice(5) : (() => { try { return a0?.condicaoEmMimUuid ? fromUuidSync(a0.condicaoEmMimUuid)?.name : ""; } catch (err) { return ""; } })();
    const ativa = nomeCondA ? actor.items.find(i => i.type === "condicao" && i.system.ativo !== false && naurenNomeBate(i.name, nomeCondA)) : null;
    return { id: f.id, nome: f.name, img: f.img, ativa: ativa ? { nome: ativa.name, dica: f.getFlag("nauren", "textoAtiva") || "pronta para o próximo uso" } : null, texto: (f.system.descricao ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/^.*?\)\.\s*/, "").slice(0, 70),
      status: status || mods.join(" · "), equipado: f.type !== "armadura" || !!f.system.equipado, acao: a0 ? 0 : null, acaoNome: a0?.nome ?? "", semUso: !!a0?.usaUsos && (a0.usosAtual ?? 0) <= 0,
      contador: contador ? { ...contador, pips: Array.from({ length: contador.de }, (_, i) => ({ cheio: i < contador.n })) } : null };
  });
  // 0.94.3: Obra Prima (Estudioso do Oculto): a atual e o botão de construir.
  let obraPrima = null;
  const habObra = (actor?.items ?? []).find(i => i.type === "habilidade" && i.system?.obraPrima && Object.keys(i.system.obraPrima).length);
  if (habObra) {
    const op = naurenObraPrimaDe(actor);
    const idxO = Math.max(0, (habObra.system.acoes ?? []).findIndex(x => x.abrirConstrucao === "obraPrima"));
    obraPrima = { itemId: habObra.id, acao: idxO, nome: op?.name ?? "", img: op?.img || habObra.system.obraPrima.img || habObra.img,
      texto: op ? `Vida ${op.system?.vida?.value ?? 0}/${op.system?.vida?.max ?? 0} · só age em Prioridade` : "Construa durante o Exercício Teórico" };
  }
  return {
    prateleira, ferramentas, obraPrima,
    rec: rec ? { nome: rec.nome, valor: rec.valor, max: rec.max, sigla: c0?.siglaRecurso || "PdI", pips: Array.from({ length: Math.min(rec.max, 30) }, (_, i) => ({ cheio: i < rec.valor })), colunas: Math.max(1, Math.min(rec.max, 15)) } : null,
    meditar, exercicio, armas, semArma,
    proximos: [
      { nome: "Loja de Invenções", nivel: 8, liberado: nivel >= 8 },
      { nome: "Olhar pro Futuro e Pés no Chão", nivel: 17, liberado: nivel >= 17 }
    ].filter(x => !actor.items.some(i => naurenEhItem(i, x.nome)))
  };
}


/* =======================================
 * FRASCOS (0.94.1, genérico): consumível montado no Alambique.
 * Dados no item: system.frasco = { efeitos, beneficios, colateral: { dado, linhas }, semColateral, catalogo }.
 * Ajustes vêm das Habilidades/Condições com "frascoMods" (nada fixo no código):
 *   bonus (fórmula, aceita @rank)  - soma nos benefícios e nos colaterais (Elixir Arco-Íris)
 *   semColateral (Condição)        - o próximo Frasco não tem colateral e a Condição sai (Composto Refinado)
 *   maximizado (Condição no alvo)  - benefícios e colaterais no máximo (Busca pela Cobaia Perfeita)
 *   beneficioExtraAleatorio        - quem bebe ganha 1 benefício sorteado do catálogo (Obra Prima: Cobaia)
 *   aoBeber { condicaoUuid, acumulos } - quem bebe recebe isto (Dependência Alquímica)
 *   perfumes { custo: [{recurso,quantidade}], usosDe, opcoes: [{nome, condicaoUuid}] } - troca o colateral (Perfumista Mestre)
 * ======================================= */
function naurenFrascoModsDe(actor) {
  const lista = [];
  for (const it of actor?.items ?? []) {
    if (!["habilidade", "condicao", "efeito"].includes(it.type)) continue;
    if (it.type === "habilidade" && it.system.ativo === false) continue;
    if (it.type !== "habilidade" && it.system.ativo === false) continue;
    const m = it.system.frascoMods;
    if (m && typeof m === "object" && Object.keys(m).length) lista.push({ item: it, m, rank: Math.max(1, it.system.rankAtual || 1) });
  }
  return lista;
}

function naurenFrascoNumero(texto, rank) {
  const t = String(texto ?? "").replace(/@rank\b/g, String(rank));
  try { return Number(Roll.safeEval(t)) || 0; } catch (err) { return Number(t) || 0; }
}

/** Frascos da mochila (consumíveis com dados de Frasco e quantidade). */
function naurenFrascosDoAtor(actor) {
  return (actor?.items ?? []).filter(i => i.type === "consumivel" && (i.system.quantidade ?? 0) > 0 && Array.isArray(i.system.frasco?.efeitos));
}

async function naurenEscolherFrasco(actor, titulo = "Frasco") {
  const lista = naurenFrascosDoAtor(actor);
  if (!lista.length) { ui.notifications.warn(`${actor.name} não tem Frascos preparados.`); return null; }
  if (lista.length === 1) return lista[0];
  const opcoes = lista.map(f => `<label class="nauren-frasco-opcao"><input type="radio" name="frasco" value="${f.id}"> <b>${foundry.utils.escapeHTML?.(f.name) ?? f.name}</b> <span>${naurenResumoFrasco(f.system.frasco)}</span></label>`).join("");
  const id = await foundry.applications.api.DialogV2.prompt({ ...NAUREN_KIT_JANELA,
    window: { title: `${titulo}: qual Frasco?` },
    content: `<div class="nauren-frasco-escolha">${opcoes}</div>`,
    ok: { label: "Usar este", callback: (ev, btn) => btn.form?.querySelector?.("input[name=frasco]:checked")?.value ?? lista[0].id },
    rejectClose: false
  }).catch(() => null);
  return id ? actor.items.get(id) : null;
}

/** Texto curto: "Vida 1d6 · Movimento +2 · colateral 2 em 6". */
function naurenResumoFrasco(f) {
  if (!f) return "";
  const partes = (f.efeitos ?? []).map(e => e.rotulo || e.nome).filter(Boolean);
  const n = f.beneficios ?? partes.length;
  partes.push(f.semColateral ? "sem colateral" : `colateral ${Math.min(6, n)} em 6`);
  return partes.join(" · ");
}

/** Monta o Frasco que vai no pacote: dados do item + ajustes de quem usa. */
async function naurenFrascoParaPacote(usuario, item, acao, escolhido = null) {
  const fonte = escolhido ?? item;
  const f = foundry.utils.deepClone(fonte?.system?.frasco ?? {});
  if (!Array.isArray(f.efeitos)) return null;
  const notas = [];
  let bonus = 0;
  for (const { item: it, m, rank } of naurenFrascoModsDe(usuario)) {
    if (m.bonus) { const b = naurenFrascoNumero(m.bonus, rank); if (b) { bonus += b; notas.push(`${it.name}: +${b} nos efeitos`); } }
  }
  let semColateral = !!f.semColateral;
  if (!semColateral) {
    const sc = naurenFrascoModsDe(usuario).find(x => x.m.semColateral && x.item.type === "condicao");
    if (sc) {
      semColateral = true; notas.push(`${sc.item.name}: sem colateral`);
      if ((sc.item.system.acumulos ?? 1) > 1) await sc.item.update({ "system.acumulos": sc.item.system.acumulos - 1 }); else await sc.item.delete();
    }
  }
  // Frasco da mochila (Frasco Explosivo): sai do inventário agora.
  if (escolhido && usuario.items.get(escolhido.id)) {
    const q = Math.max(0, (escolhido.system.quantidade ?? 1) - 1);
    if (q <= 0 && !escolhido.system.manterAoZerar) await escolhido.delete(); else await escolhido.update({ "system.quantidade": q });
  }
  return { nome: fonte.name, efeitos: f.efeitos, beneficios: Number(f.beneficios) || f.efeitos.length, colateral: f.colateral ?? null, catalogo: f.catalogo ?? [],
    bonus, semColateral, notas, usuarioUuid: usuario.uuid, usuarioNome: usuario.name, umaVezChave: f.umaVezChave || "" };
}

/** Rola uma fórmula (com bônus e maximizar) e devolve { total, texto }. */
async function naurenFrascoRolar(formula, actor, { bonus = 0, maximizar = false } = {}) {
  const f = String(formula ?? "0").trim() || "0";
  const neg = /^-/.test(f);
  const base = neg ? f.slice(1) : f;
  const roll = await new Roll(naurenFormulaComTokensDoAtor(base, actor)).evaluate(maximizar ? { maximize: true } : undefined);
  if (game.dice3d && !/^\d+$/.test(base)) await game.dice3d.showForRoll(roll, game.user, true).catch(() => {});
  const valor = Math.max(0, roll.total + bonus);
  const texto = `${naurenTextoRolagem(roll)}${bonus ? ` +${bonus}` : ""}${maximizar ? " (máx.)" : ""}`;
  return { total: neg ? -valor : valor, texto };
}

const NAUREN_ROTULO_RECURSO_FRASCO = { vida: "Vida", mana: "Mana", estaminaCombate: "Estamina", dadosDestino: "Dados de Destino", estresse: "Estresse" };

/** Aplica UM efeito simples num ator. Devolve a linha do card. */
/** 0.94.3: troca @acumulos/@rank (e outros do mapa) nas fórmulas de um efeito simples antes de rolar. */
function naurenEfeitoComSubst(ef, subst = {}) {
  if (!ef || !subst || !Object.keys(subst).length) return ef;
  const troca = v => typeof v === "string" ? v.replace(/@(\w+)\b/g, (m, k) => (k in subst ? String(subst[k]) : m)) : v;
  const out = { ...ef };
  for (const k of ["formula", "acumulos", "valorFormula", "rank", "valor", "texto"]) if (k in out) out[k] = troca(out[k]);
  if (typeof out.rank === "string" && /^[\d+\-*/() ]+$/.test(out.rank)) { try { out.rank = Math.round(Roll.safeEval(out.rank)); } catch (err) { /* fica como está */ } }
  if (typeof out.texto === "string") out.texto = out.texto.replace(/\(([\d+\-* ]+)\)d(\d+)/g, (m, e, f) => { try { return `${Math.round(Roll.safeEval(e))}d${f}`; } catch (err) { return m; } });
  return out;
}

/** 0.94.3: "uma vez por personagem" (Elixir Verde, Remédio Não Testado, Cirurgia Sinistra). Devolve a linha de recusa ou "" se pode. */
function naurenUmaVezRecusa(actor, chave, nome = "") {
  if (!chave || !actor) return "";
  const feitos = actor.getFlag?.("nauren", "umaVez") ?? {};
  return feitos[chave] ? `${nome || chave}: ${actor.name} já recebeu isto (uma vez por personagem), sem efeito` : "";
}

async function naurenUmaVezMarcar(actor, chave) {
  if (!chave || !actor) return;
  const feitos = foundry.utils.deepClone(actor.getFlag?.("nauren", "umaVez") ?? {});
  feitos[chave] = Date.now();
  await actor.setFlag("nauren", "umaVez", feitos).catch(() => {});
}

async function naurenAplicarEfeitoSimples(actor, ef, ctx = {}) {
  ef = naurenEfeitoComSubst(ef, ctx.subst);
  const bonus = ctx.bonus ?? 0, maximizar = !!ctx.maximizar;
  const nome = ef.rotulo || ef.nome || "";
  switch (ef.tipo) {
    case "recurso": {
      const r = await naurenFrascoRolar(ef.formula, actor, { bonus, maximizar });
      let spec = ef.recurso;
      if (spec === "estamina") spec = "estaminaCombate";
      const rec = naurenRecursoDoAtor(actor, spec);
      if (spec.startsWith("recursoCustom:") && !rec) return `${nome}: ${actor.name} não tem ${spec.slice(14)}`;
      if (rec && r.total > 0 && (rec.max ?? 0) <= 0 && spec !== "estresse") return `${nome || rec.nome}: ${actor.name} não usa ${rec.nome} (máximo 0), nada muda`;
      const antes = spec === "estresse" ? (actor.system.stress?.value ?? 0) : (rec?.valor ?? 0);
      const mudou = await naurenConcederRecurso(actor, spec, String(r.total), null);
      const rot = NAUREN_ROTULO_RECURSO_FRASCO[spec] ?? rec?.nome ?? spec;
      const depois = spec === "estresse" ? (actor.system.stress?.value ?? 0) : (naurenRecursoDoAtor(actor, spec)?.valor ?? antes + mudou);
      return `${nome || rot}: ${r.total >= 0 ? "+" : ""}${r.total} de ${rot} (${r.texto}) → ${antes} para ${depois}`;
    }
    case "condicao": {
      const uuid = typeof ef.uuid === "string" && ef.uuid.startsWith("self:") ? naurenResolverSelf(ef.uuid, actor) : ef.uuid;
      if (!uuid) return `${nome}: Condição não encontrada`;
      if (ef.rank) {
        const rank = Math.max(1, Number(ef.rank) || 1) + bonus;
        const origem = await fromUuid(uuid).catch(() => null);
        const ja = actor.items.find(i => i.type === "condicao" && (i.getFlag("nauren", "cadeiaRaizUuid") === uuid || i.getFlag("nauren", "origemUuid") === uuid));
        if (ja && (ja.system.rankAtual ?? 0) >= rank) return `${nome || origem?.name}: já tem um efeito igual ou mais forte (não acumula)`;
        const n = await NaurenAlvoHelper.aplicarCondicao(actor, uuid, 1, null, rank);
        // Valor rolado na hora e gravado no modificador (ex.: Botas: +1d6 de Poder de Ataque ou de Magia).
        if (ef.valorFormula) {
          const rv = await naurenFrascoRolar(ef.valorFormula, actor, { bonus, maximizar });
          const ci = actor.items.find(i => i.type === "condicao" && (i.getFlag("nauren", "cadeiaRaizUuid") === uuid || i.getFlag("nauren", "origemUuid") === uuid));
          if (ci) {
            // Troca só o modificador do campo rolado; os outros da Condição ficam (ex.: Crescimento também dá Categoria +1).
            const campoV = ef.campo || ci.system.modificadores?.[0]?.campo || "poderAtaque";
            const mods = foundry.utils.deepClone(ci.system.modificadores ?? []);
            const iM = mods.findIndex(mm => mm.campo === campoV);
            const novo = { campo: campoV, valor: String(rv.total), porRank: [] };
            if (iM >= 0) mods[iM] = novo; else if (mods.length) mods[0] = novo; else mods.push(novo);
            await ci.update({ "system.modificadores": mods });
          }
          const rotC = NAUREN_ROTULO_CURTO_MOD?.[ef.campo] ?? ef.campo ?? "";
          const outros = (ci?.system.modificadores ?? []).filter(mm => mm.campo !== (ef.campo || "") && NAUREN_ROTULO_CURTO_MOD?.[mm.campo] && mm.valor && mm.valor !== "0")
            .map(mm => `${/^[-+]/.test(String(mm.valor)) ? "" : "+"}${mm.valor} de ${NAUREN_ROTULO_CURTO_MOD[mm.campo]}`);
          return `${nome || n}: +${rv.total}${rotC ? ` de ${rotC}` : ""} (${rv.texto})${outros.length ? ` e ${outros.join(", ")}` : ""} até o fim da cena`;
        }
        // O que a Condição dá, em números (ex.: "+6 Movimento"), com o nome dela entre parênteses.
        const ciR = actor.items.find(i => i.type === "condicao" && (i.getFlag("nauren", "cadeiaRaizUuid") === uuid || i.getFlag("nauren", "origemUuid") === uuid));
        const rkR = ciR?.system.rankAtual || rank;
        const modsR = (ciR?.system.modificadores ?? []).map(m => {
          const v = (m.porRank ?? []).find(p => Number(p.rank) === rkR)?.valor ?? m.valor;
          const rotM = NAUREN_ROTULO_CURTO_MOD?.[m.campo];
          return rotM && v && v !== "0" ? `${/^[-+]/.test(String(v)) ? "" : "+"}${v} ${rotM}` : "";
        }).filter(Boolean).join(", ");
        const nomeC = `${n ?? origem?.name}${rank > 1 && !/\(×\d+\)/.test(String(n ?? "")) ? ` (×${rank})` : ""}`;
        const cabC = nome && !naurenNomeNormalizado(nomeC).startsWith(naurenNomeNormalizado(nome)) ? `${nome}: ` : "";
        return `${cabC}${modsR ? `${modsR} até o fim da cena (${nomeC})` : `${nomeC} até o fim da cena`}${ef.texto ? ` — ${ef.texto}` : ""}`;
      }
      const r = await naurenFrascoRolar(ef.acumulos ?? "1", actor, { bonus, maximizar });
      const origem = await fromUuid(uuid).catch(() => null);
      let n = Math.max(1, r.total);
      let res = null;
      if (origem?.type === "condicao" && !origem.system.acumulativel && origem.system.evolutiva) {
        for (let i = 0; i < n; i++) res = await NaurenAlvoHelper.aplicarCondicao(actor, uuid, 1); // cada acúmulo a mais evolui (Atordoado → Desacordado)
      } else res = await NaurenAlvoHelper.aplicarCondicao(actor, uuid, n);
      const recebida = res ?? origem?.name ?? "";
      const cabA = nome && !naurenNomeNormalizado(recebida).startsWith(naurenNomeNormalizado(nome)) ? `${nome}: ` : "";
      return `${cabA}recebeu ${recebida}${/^\d+$/.test(String(ef.acumulos ?? "1")) && !bonus ? "" : ` (${r.texto})`}${ef.texto ? ` — ${ef.texto}` : ""}`;
    }
    case "removerAcumulos": {
      const r = await naurenFrascoRolar(ef.formula ?? "1", actor, { bonus, maximizar });
      const negs = actor.items.filter(i => i.type === "condicao" && i.system.ativo !== false && naurenCondicaoNegativa(i) && !naurenEhCondicaoModelo(i));
      if (!negs.length) return `${nome}: nenhuma Condição para remover (${r.texto})`;
      let alvoC = negs[0];
      if (negs.length > 1) {
        const id = await foundry.applications.api.DialogV2.prompt({ ...NAUREN_KIT_JANELA,
          window: { title: `${nome || "Frasco"}: de qual Condição tirar ${r.total}?` },
          content: `<div class="nauren-frasco-escolha">${negs.map((c, i) => `<label class="nauren-frasco-opcao"><input type="radio" name="cond" value="${c.id}" ${i === 0 ? "checked" : ""}> ${c.name}${c.system.acumulativel ? ` (${c.system.acumulos ?? 1})` : ""}</label>`).join("")}</div>`,
          ok: { label: "Remover", callback: (e, btn) => btn.form?.querySelector?.("input[name=cond]:checked")?.value ?? negs[0].id },
          rejectClose: false
        }).catch(() => null);
        alvoC = actor.items.get(id) ?? negs[0];
      }
      const ac = alvoC.system.acumulativel ? (alvoC.system.acumulos ?? 1) : 1;
      const tira = Math.min(ac, Math.max(0, r.total));
      if (tira >= ac) await alvoC.delete(); else await alvoC.update({ "system.acumulos": ac - tira });
      return `${nome}: −${tira} de ${alvoC.name} (${r.texto})${tira >= ac ? ", removida" : ""}`;
    }
    case "dano": {
      const r = await naurenFrascoRolar(ef.formula ?? "1", actor, { bonus, maximizar });
      const v = Math.max(0, r.total);
      const vidaA = actor.system.vida?.value ?? 0;
      await actor.update({ "system.vida.value": Math.max(0, vidaA - v) }, { naurenOrigemCombate: true });
      return `${nome || "Dano"}: ${v} de dano (${r.texto}), Vida ${vidaA} → ${Math.max(0, vidaA - v)}`;
    }
    case "danoArea": {
      // Dano em todos a até N metros de quem tem o efeito (ex.: Botas que explodem: 6d6 em 3 m).
      const r = await naurenFrascoRolar(ef.formula ?? "1", actor, { bonus, maximizar });
      const v = Math.max(0, r.total);
      const eu = actor.getActiveTokens?.(true)?.[0];
      if (!eu || !canvas?.tokens) return `${nome}: ${v} de dano em área (${r.texto}), sem token no mapa`;
      const raio = Number(ef.raio) || 3;
      const atingidos = [];
      for (const t of canvas.tokens.placeables) {
        if (!t.actor || ((t === eu || t.actor === actor) && ef.excluirEu !== false)) continue;
        if (!naurenMesmoAndar(t, eu)) continue; // área não atravessa o piso
        const m = t === eu ? 0 : naurenMedirDistanciaBordas(eu, t);
        if (m > raio + 0.01) continue;
        const nova = Math.max(0, (t.actor.system.vida?.value ?? 0) - v);
        if (t.actor.isOwner) await t.actor.update({ "system.vida.value": nova }, { naurenOrigemCombate: true }); else await naurenOperarRecursoViaMestre(t.actor, "vida", nova);
        atingidos.push(t.name);
      }
      return `${nome}: ${v} de dano (${r.texto}) em ${atingidos.length ? atingidos.join(", ") : "ninguém"} a até ${raio} m`;
    }
    case "zerarRecurso": {
      const spec = ef.recurso === "estamina" ? "estaminaCombate" : ef.recurso;
      const rec = naurenRecursoDoAtor(actor, spec);
      if (rec?.valor) await naurenConcederRecurso(actor, spec, String(-rec.valor), null);
      return `${nome}: ${rec?.nome ?? spec} foi a 0`;
    }
    case "permanente": {
      const r = await naurenFrascoRolar(ef.formula ?? "1", actor, { bonus, maximizar });
      await naurenSomarEfeitoPermanente(actor, { nome: ef.efeitoNome || `${nome}: permanente`, campo: ef.campo, delta: r.total, img: ef.img || "icons/svg/aura.svg", origem: ctx.fonte ?? "" });
      const rotP = NAUREN_ROTULO_CURTO_MOD?.[ef.campo] ?? NAUREN_CAMPOS_MODIFICADOR_OPCOES?.[ef.campo] ?? ef.campo;
      return `${nome}: ${rotP} ${r.total >= 0 ? "+" : ""}${r.total} para sempre (${r.texto})`;
    }
    case "estressePermanente": {
      // Cirurgia Sinistra: 1 de Estresse sempre ocupado (só sai pela aba Opções).
      const n = Math.max(0, Math.round(Number(ef.valor ?? ef.formula ?? 1) || 1));
      const antes = actor.system.estressePermanente ?? 0;
      await actor.update({ "system.estressePermanente": antes + n });
      return `${nome || "Estresse permanente"}: +${n} (${antes} → ${antes + n}; só sai pela aba Opções)`;
    }
    case "pontosAtributo": {
      // Cirurgia Sinistra: N pontos de atributo permanentes, distribuídos por quem recebe.
      const r = await naurenFrascoRolar(ef.formula ?? "1", actor, { bonus, maximizar });
      const total = Math.max(0, r.total);
      if (!total) return `${nome}: 0 pontos (${r.texto})`;
      const atrs = (ef.atributos?.length ? ef.atributos : ["forca", "agilidade", "estamina", "inteligencia", "destino"]);
      const rot = { forca: "Força", agilidade: "Agilidade", estamina: "Estamina", inteligencia: "Inteligência", destino: "Destino" };
      const lerForm = form => { const v = {}; let soma = 0; for (const a of atrs) { const n = Math.max(0, Math.round(Number(form?.querySelector?.(`[name="${a}"]`)?.value) || 0)); v[a] = n; soma += n; } return { v, soma }; };
      let dist = null;
      for (let tentativa = 0; tentativa < 3 && !dist; tentativa++) {
        const res = await foundry.applications.api.DialogV2.prompt({ ...NAUREN_KIT_JANELA,
          window: { title: `${nome || "Pontos de atributo"}: ${total} ponto(s)` },
          content: `<p><b>${actor.name}</b> recebe <b>${total}</b> ponto(s) de atributo permanentes (${r.texto}). Distribua:</p><div class="nauren-pontos-atributo">${atrs.map((a, i) => `<label>${rot[a] ?? a} <input type="number" name="${a}" min="0" max="${total}" value="${i === 0 ? total : 0}"></label>`).join("")}</div>`,
          ok: { label: "Confirmar", callback: (e, btn) => lerForm(btn.form ?? btn.closest?.("form")) },
          rejectClose: false
        }).catch(() => null);
        if (!res) break;
        if (res.soma === total) dist = res.v;
        else ui.notifications.warn(`Distribua exatamente ${total} ponto(s) (você pôs ${res.soma}).`);
      }
      if (!dist) dist = { [atrs[0]]: total };
      const partes = [];
      for (const [a, n] of Object.entries(dist)) if (n > 0) { await naurenSomarEfeitoPermanente(actor, { nome: ef.efeitoNome || `${nome || "Pontos de atributo"}: ${rot[a] ?? a}`, campo: a, delta: n, img: ef.img || "icons/svg/upgrade.svg", origem: ctx.fonte ?? "" }); partes.push(`+${n} ${rot[a] ?? a}`); }
      return `${nome || "Pontos de atributo"}: ${partes.join(", ")} permanente (${r.texto})`;
    }
    case "peculiaridade": {
      // Remédio Não Testado: a Peculiaridade escolhida pelo Inventor vira permanente em quem bebe.
      const doc = ef.uuid ? await fromUuid(ef.uuid).catch(() => null) : null;
      if (!doc) return `${nome}: Peculiaridade não encontrada`;
      const dados = doc.toObject(); delete dados._id;
      foundry.utils.setProperty(dados, "flags.nauren.origemUuid", ef.uuid);
      foundry.utils.setProperty(dados, "flags.nauren.permanenteDe", ctx.fonte ?? nome);
      await actor.createEmbeddedDocuments("Item", [dados]);
      return `${nome || "Peculiaridade"}: ${actor.name} ganhou ${doc.name} (permanente)`;
    }
    case "restaurarVidaMemoria": {
      // Mecanismo do Relógio: a Vida volta ao valor do início do seu turno anterior.
      const mem = actor.getFlag?.("nauren", "memoriaVida");
      if (!mem) return `${nome}: ainda não há início de turno registrado neste combate`;
      const c = game.combat;
      const meuTurno = !!c?.started && naurenCombatenteEhDoAtor(c.combatant, actor);
      const alvoV = meuTurno ? (mem.anterior ?? mem.atual) : mem.atual;
      if (alvoV === undefined || alvoV === null) return `${nome}: sem turno anterior registrado`;
      const antes = actor.system.vida?.value ?? 0;
      const novo = Math.min(actor.system.vida?.max ?? alvoV, alvoV);
      await actor.update({ "system.vida.value": novo }, { naurenOrigemCombate: true });
      return `${nome || "Memória de Vida"}: Vida ${antes} → ${novo} (início do ${meuTurno ? "turno anterior" : "seu último turno"}${mem.rodadaAnterior || mem.rodada ? `, rodada ${meuTurno ? mem.rodadaAnterior : mem.rodada}` : ""})`;
    }
    case "texto":
    default: {
      let extra = "";
      if (ef.formula) { const r = await naurenFrascoRolar(ef.formula, actor, { bonus, maximizar }); extra = ` ${r.total} (${r.texto})`; }
      return `${nome}${extra}${ef.texto ? `: ${ef.texto}` : ""}`;
    }
  }
}

/** 0.94.3: escolhe uma Peculiaridade do compêndio (Remédio Não Testado). Devolve { uuid, nome } ou null. */
async function naurenEscolherPeculiaridade(titulo) {
  const packs = await naurenObterOuCriarPacks().catch(() => null);
  const pack = packs?.peculiaridades;
  if (!pack) { ui.notifications.warn("Compêndio de Peculiaridades não encontrado."); return null; }
  await pack.getIndex({ fields: ["system.tipo"] });
  const lista = pack.index.contents.filter(e => e.type === "peculiaridade").sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR"));
  if (!lista.length) { ui.notifications.warn("Nenhuma Peculiaridade no compêndio."); return null; }
  const grupo = t => (/fardo/i.test(String(t ?? "")) ? "Fardos" : "Benefícios");
  const opcoes = ["Benefícios", "Fardos"].map(g => { const itens = lista.filter(e => grupo(e.system?.tipo) === g); return itens.length ? `<optgroup label="${g}">${itens.map(e => `<option value="${e.uuid}">${e.name}</option>`).join("")}</optgroup>` : ""; }).join("");
  const uuid = await foundry.applications.api.DialogV2.prompt({ ...NAUREN_KIT_JANELA,
    window: { title: `${titulo}: qual Peculiaridade?` },
    content: `<p>Quem beber recebe esta Peculiaridade <b>para sempre</b> (uma vez por personagem).</p><select name="pec" class="nauren-select-largo">${opcoes}</select>`,
    ok: { label: "Preparar", callback: (e, btn) => btn.form?.querySelector?.("select[name=pec]")?.value ?? lista[0].uuid },
    rejectClose: false
  }).catch(() => null);
  if (!uuid) return null;
  const e = lista.find(x => x.uuid === uuid) ?? lista[0];
  return { uuid: e.uuid, nome: e.name };
}

/** 0.94.3: cria um Frasco especial (sem passar pelo Alambique) na mochila de quem preparou. */
async function naurenCriarFrascoEspecial(actor, spec, escolha = null, fonteItem = null) {
  const base = foundry.utils.deepClone(NAUREN_FRASCOS_CONSTRUCAO.formulas[0].base);
  const efeitos = foundry.utils.deepClone(spec.efeitos ?? []);
  let nome = spec.nome || "Frasco especial";
  if (spec.escolherPeculiaridade && escolha?.uuid) { efeitos.push({ nome: "Peculiaridade", rotulo: `Peculiaridade: ${escolha.nome}`, tipo: "peculiaridade", uuid: escolha.uuid }); nome = `${nome} (${escolha.nome})`; }
  base.name = nome;
  if (spec.img) base.img = spec.img;
  base.system.frasco = { efeitos, beneficios: efeitos.length, colateral: NAUREN_FRASCO_COLATERAL, semColateral: !!spec.semColateral, umaVezChave: spec.umaVezChave || "" };
  base.system.descricao = naurenMontarDescricao({ regra: spec.descricao || `${nome}: Frasco especial${spec.semColateral ? " sem efeito colateral" : ""}${spec.umaVezChave ? "; cada personagem só pode receber uma vez" : ""}.`,
    automatico: "beber (1 PdE) aplica tudo e mostra no card; quem já recebeu antes não ganha nada de novo.", manual: spec.manual || "" });
  foundry.utils.setProperty(base, "flags.nauren.frascoEspecial", fonteItem?.name ?? true);
  // 0.94.39: Frasco especial não divide os usos de Os Frascos (é uma vez por personagem, sem limite por cena).
  base.system.acoes = (base.system.acoes ?? []).map(a => ({ ...a, usaUsos: false, usosDeOutroItemNome: "" }));
  const [criado] = await actor.createEmbeddedDocuments("Item", [base]);
  return criado ?? null;
}

function naurenTextoFrascoEspecial(it) {
  const fr = it?.system?.frasco ?? {};
  return [(fr.efeitos ?? []).map(e => naurenTextoEfeitoFrasco(e)).join(" · "), fr.semColateral ? "sem colateral" : "", fr.umaVezChave ? "uma vez por personagem" : ""].filter(Boolean).join(" · ");
}

/** Lado de quem bebe: benefícios, efeitos de quem bebe e o colateral (com Perfume). */
async function naurenProcessarFrascoNoAlvo(actor, f) {
  const linhas = [];
  const mods = naurenFrascoModsDe(actor);
  const maxMod = mods.find(x => x.m.maximizado);
  const maximizar = !!maxMod;
  const bonus = f.bonus ?? 0;
  linhas.push(`${f.nome}${f.usuarioNome && f.usuarioNome !== actor.name ? ` (dado por ${f.usuarioNome})` : ""}${maximizar ? ` · ${maxMod.item.name}: tudo no máximo` : ""}`);
  // 0.94.3: Frascos especiais "uma vez por personagem" (Elixir Verde, Remédio Não Testado).
  if (f.umaVezChave) {
    const recusa = naurenUmaVezRecusa(actor, f.umaVezChave, f.nome);
    if (recusa) { linhas.push(recusa); return linhas; }
    await naurenUmaVezMarcar(actor, f.umaVezChave);
  }
  for (const n of f.notas ?? []) linhas.push(n);
  for (const ef of f.efeitos ?? []) linhas.push(await naurenAplicarEfeitoSimples(actor, ef, { bonus, maximizar, fonte: f.nome }));
  // Benefício extra sorteado (Cobaia, da Obra Prima).
  const extra = mods.find(x => x.m.beneficioExtraAleatorio);
  if (extra && (f.catalogo ?? []).length) {
    const rollE = await new Roll(`1d${f.catalogo.length}`).evaluate();
    const esc = f.catalogo[rollE.total - 1];
    linhas.push(`${extra.item.name}: benefício extra sorteado (1d${f.catalogo.length} = ${rollE.total})`);
    for (const ef of esc.efeitos ?? []) linhas.push(await naurenAplicarEfeitoSimples(actor, ef, { bonus, maximizar, fonte: f.nome }));
  }
  // Ao beber (Dependência Alquímica).
  for (const { item: it, m } of mods) if (m.aoBeber?.condicaoUuid) {
    const uuid = String(m.aoBeber.condicaoUuid).startsWith("self:") ? naurenResolverSelf(m.aoBeber.condicaoUuid, actor) : m.aoBeber.condicaoUuid;
    const nomeC = await NaurenAlvoHelper.aplicarCondicao(actor, uuid, Number(m.aoBeber.acumulos) || 1);
    if (nomeC) linhas.push(String(nomeC).startsWith(it.name) ? nomeC : `${it.name}: ${nomeC}`);
  }
  naurenProcessarGatilhos("bebeuFrasco", actor, { frascoNome: f.nome, usuarioUuid: f.usuarioUuid }).catch(() => {});
  // Colateral: 1d6 <= número de benefícios.
  const n = Math.max(0, Number(f.beneficios) || 0);
  if (f.semColateral) { linhas.push("Colateral: não há (sem colateral)"); return linhas; }
  if (!n || !f.colateral?.linhas?.length) return linhas;
  const chance = await new Roll("1d6").evaluate();
  if (game.dice3d) await game.dice3d.showForRoll(chance, game.user, true).catch(() => {});
  if (chance.total > n) { linhas.push(`Colateral: d6 = ${chance.total}, precisava de ${n === 1 ? "1" : `1 a ${n}`}: não disparou`); return linhas; }
  linhas.push(`Colateral: d6 = ${chance.total} (${n} benefício${n > 1 ? "s" : ""}: dispara em ${n === 1 ? "1" : `1 a ${n}`})`);
  let voltas = 0, rolarDeNovo = true;
  while (rolarDeNovo && voltas < 4) {
    voltas++; rolarDeNovo = false;
    const rT = await new Roll(f.colateral.dado || "1d6").evaluate();
    if (game.dice3d) await game.dice3d.showForRoll(rT, game.user, true).catch(() => {});
    const linha = f.colateral.linhas.find(l => rT.total >= (Number(l.de) || 0) && rT.total <= (Number(l.ate ?? l.de) || 0));
    if (!linha) { linhas.push(`Tabela: ${rT.total} (sem linha)`); break; }
    // Perfumista Mestre: pode trocar o colateral por um Perfume, pagando.
    const perf = mods.find(x => x.m.perfumes?.opcoes?.length);
    if (perf && await naurenFrascoPodePagar(actor, perf.m.perfumes)) {
      const escolha = await foundry.applications.api.DialogV2.wait({ ...NAUREN_KIT_JANELA,
        window: { title: `${perf.item.name}: trocar o colateral?` },
        content: `<p>O colateral sorteado foi <b>${linha.nome}</b> (${f.colateral.dado || "1d6"} = ${rT.total}).</p><p>Trocar por um Perfume pagando ${naurenFrascoTextoCusto(actor, perf.m.perfumes)}?</p>`,
        buttons: [...perf.m.perfumes.opcoes.map((o, i) => ({ action: `p${i}`, label: o.nome })), { action: "nao", label: "Manter o colateral", default: true }],
        rejectClose: false
      }).catch(() => "nao");
      const idx = /^p(\d+)$/.exec(String(escolha ?? ""))?.[1];
      if (idx !== undefined) {
        const op = perf.m.perfumes.opcoes[Number(idx)];
        const pago = await naurenFrascoPagar(actor, perf.m.perfumes);
        const uuidP = String(op.condicaoUuid).startsWith("self:") ? naurenResolverSelf(op.condicaoUuid, actor) : op.condicaoUuid;
        const nomeP = await NaurenAlvoHelper.aplicarCondicao(actor, uuidP, 1);
        linhas.push(`Tabela: ${rT.total} = ${linha.nome} → trocado por ${nomeP ?? op.nome} (${perf.item.name}; ${pago})`);
        continue;
      }
    }
    linhas.push(`Tabela: ${f.colateral.dado || "1d6"} = ${rT.total} → ${linha.nome}`);
    for (const ef of linha.efeitos ?? []) linhas.push(await naurenAplicarEfeitoSimples(actor, ef, { bonus, maximizar, fonte: f.nome }));
    if (linha.rolarDeNovo) { rolarDeNovo = true; linhas.push("…e rola de novo na tabela"); }
  }
  return linhas;
}

async function naurenFrascoPodePagar(actor, cfg) {
  for (const c of cfg.custo ?? []) { const r = naurenRecursoDoAtor(actor, c.recurso); if (!r || r.valor < (Number(c.quantidade) || 0)) return false; }
  if (cfg.usosDe) { const it = actor.items.find(i => naurenEhItem(i, cfg.usosDe)); if (it?.system.usaUsos && (it.system.usosAtual ?? 0) < 1) return false; }
  return true;
}

function naurenFrascoTextoCusto(actor, cfg) {
  const p = (cfg.custo ?? []).map(c => `${c.quantidade} de ${naurenRecursoDoAtor(actor, c.recurso)?.nome ?? c.recurso}`);
  if (cfg.usosDe) p.push(`1 uso de ${cfg.usosDe}`);
  return p.join(" + ") || "nada";
}

async function naurenFrascoPagar(actor, cfg) {
  for (const c of cfg.custo ?? []) await naurenConcederRecurso(actor, c.recurso === "estamina" ? "estaminaCombate" : c.recurso, String(-(Number(c.quantidade) || 0)), null);
  if (cfg.usosDe) { const it = actor.items.find(i => naurenEhItem(i, cfg.usosDe)); if (it?.system.usaUsos) await it.update({ "system.usosAtual": Math.max(0, (it.system.usosAtual ?? 0) - 1) }); }
  return `pagou ${naurenFrascoTextoCusto(actor, cfg)}`;
}


/* ---- Inventor: Frascos (Alambique) e Ferramentas (0.94.1) ---- */
const NAUREN_FRASCO_COLATERAL = {
  dado: "1d6",
  linhas: [
    { de: 1, ate: 1, nome: "Recebe 1 de Estresse", efeitos: [{ tipo: "recurso", recurso: "estresse", formula: "1", nome: "Colateral" }] },
    { de: 2, ate: 2, nome: "1d4+1 acúmulos de Envenenamento", efeitos: [{ tipo: "condicao", uuid: "self:Envenenamento", acumulos: "1d4+1", nome: "Colateral" }] },
    { de: 3, ate: 3, nome: "Perde 2 de Estamina", efeitos: [{ tipo: "recurso", recurso: "estaminaCombate", formula: "-2", nome: "Colateral" }] },
    { de: 4, ate: 4, nome: "Fica Atordoado", efeitos: [{ tipo: "condicao", uuid: "self:Atordoado", acumulos: "1", nome: "Colateral" }] },
    { de: 5, ate: 5, nome: "1d4 acúmulos de Loucura", efeitos: [{ tipo: "condicao", uuid: "self:Loucura", acumulos: "1d4", nome: "Colateral" }] },
    { de: 6, ate: 6, nome: "1d4 de Queimando e rola de novo", rolarDeNovo: true, efeitos: [{ tipo: "condicao", uuid: "self:Queimando", acumulos: "1d4", nome: "Colateral" }] }
  ]
};

const NAUREN_FRASCOS_CONSTRUCAO = (() => {
  const beber = { nome: "Beber", custoEstamina: 1, alcance: "1m", modoAlvo: "selecionado", modoAlvoTravado: true, alvoPadraoEu: true, bebeFrasco: true, prioridadeIndicador: "PA",
    usaUsos: true, usosMax: 1, usosAtual: 1, usosReset: "cena", usosDeOutroItemNome: "Os Frascos" };
  const base = { name: "Frasco", type: "consumivel", img: "icons/consumables/potions/bottle-round-corked-orange.webp",
    system: { quantidade: 1, quantidadeMax: 1, efeito: "", prioridadeIndicador: "PA", frasco: { efeitos: [], beneficios: 0, colateral: NAUREN_FRASCO_COLATERAL }, acoes: [beber],
      descricao: naurenMontarDescricao({ regra: "Frasco do Inventor. Beber custa 1 PdE (P/A), em você ou num aliado a 1 m. Os benefícios duram 1 cena e o mesmo benefício não soma com outro igual. Cada benefício aumenta em 1 a chance do colateral (1d6).", automatico: "sem alvo marcado, você bebe; com um aliado a 1 m marcado, ele bebe. O card mostra cada benefício, o d6 do colateral e o sorteio na tabela.", manual: "" }) } };
  const ben = (id, nome, nomeCurto, custo, colateral, ef, extra = {}) => ({ id, categoria: extra.categoria ?? "ben", custo, nome, nomeCurto, efeito: colateral, colateral, requer: extra.requer, origem: extra.origem, cor: extra.cor,
    aplica: [{ modo: "adicionar", campo: "frasco.efeitos", valor: ef }, ...(extra.ops ?? []), { modo: "somar", campo: "frasco.beneficios", valor: 1 }] });
  const cond = (nome, rotulo, uuid) => ({ nome, rotulo, tipo: "condicao", uuid, rank: 0 });
  const rankOp = nome => ({ modo: "somar", campo: `frasco.efeitos[${nome}].rank`, valor: 1 });
  const formOp = (nome, v) => ({ modo: "formula", campo: `frasco.efeitos[${nome}].formula`, valor: v });
  return {
    id: "frascos-inventor", titulo: "Alambique", janela: "alambique", recurso: "recursoCustom:pdi", siglaRecurso: "PdI",
    orcamento: "@espirito", maxPorLinha: "2", maximoItens: "99", usoDaAcao: "Preparar Frasco", usoDaAcaoDica: "com o Exercício Teórico",
    formulas: [{ id: "frasco", nome: "Frasco", sub: "Consumível · 1 PdE para beber", tipo: "Consumível", esboco: "frasco", base, catalogo: true, nomeAutomatico: "Frasco" }],
    categorias: [{ id: "ben", nome: "Benefícios", cor: "#cca162" }],
    linhas: [
      ben("mov", "+2 m de Movimento", "Movimento", 2, "1 · recebe 1 de Estresse", cond("Movimento", "Movimento", "self:Frasco: Passos Leves"), { ops: [rankOp("Movimento")], cor: "#7fb0e0" }),
      ben("vida", "Restaura 1d6 de Vida", "Vida", 2, "2 · 1d4+1 de Envenenamento", { nome: "Vida", tipo: "recurso", recurso: "vida", formula: "0" }, { ops: [formOp("Vida", "1d6")], cor: "#e8836f" }),
      ben("defesa", "+1 de Defesa", "Defesa", 3, "3 · perde 2 de Estamina", cond("Defesa", "Defesa", "self:Frasco: Pele Dura"), { ops: [rankOp("Defesa")], cor: "#cca162" }),
      ben("estresse", "Remove 1 de Estresse", "Calma", 3, "4 · fica Atordoado", { nome: "Calma", tipo: "recurso", recurso: "estresse", formula: "0" }, { ops: [formOp("Calma", "-1")], cor: "#b48ce0" }),
      ben("condicao", "Remove 1d4 acúmulos de uma Condição", "Antídoto", 3, "5 · 1d4 de Loucura", { nome: "Antídoto", tipo: "removerAcumulos", formula: "0" }, { ops: [formOp("Antídoto", "1d4")], cor: "#8fd19e" }),
      ben("estamina", "Restaura 1d4 de Estamina", "Estamina", 5, "6 · 1d4 de Queimando e rola de novo", { nome: "Estamina", tipo: "recurso", recurso: "estaminaCombate", formula: "0" }, { ops: [formOp("Estamina", "1d4")], cor: "#f0d27a" }),
      ben("mana", "Restaura 3 de Mana", "Mana", 2, "sorteado na tabela", { nome: "Mana", tipo: "recurso", recurso: "mana", formula: "0" }, { ops: [formOp("Mana", "3")], requer: "Poção de Sangue de Dragão", origem: "Sangue de Dragão", cor: "#6fc3d9" }),
      ben("energia", "Restaura 3 de Energia", "Energia", 2, "sorteado na tabela", { nome: "Energia", tipo: "recurso", recurso: "recursoCustom:energia", formula: "0" }, { ops: [formOp("Energia", "3")], requer: "Poção de Sangue de Dragão", origem: "Sangue de Dragão", cor: "#6fd9b4" }),
      ben("pda", "+2 de Poder de Ataque", "Força Rubra", 2, "sorteado na tabela", cond("Força Rubra", "Poder de Ataque", "self:Frasco: Força Rubra"), { ops: [rankOp("Força Rubra")], requer: "Poção de Sangue de Dragão", origem: "Sangue de Dragão", cor: "#d97aa8" }),
      ben("pdm", "+2 de Poder de Magia", "Mente Rubra", 2, "sorteado na tabela", cond("Mente Rubra", "Poder de Magia", "self:Frasco: Mente Rubra"), { ops: [rankOp("Mente Rubra")], requer: "Poção de Sangue de Dragão", origem: "Sangue de Dragão", cor: "#a87ad9" }),
      ben("crescimento", "Categoria +1 e Vida máxima em dobro", "Crescimento", 6, "no fim da cena, perde 1d4 de Vida máxima para sempre", { ...cond("Crescimento", "Crescimento", "self:Frasco: Crescimento"), valorFormula: "@vidaMax", campo: "vida" }, { ops: [rankOp("Crescimento")], maxPorLinha: 1, requer: "Elixir de Crescimento", origem: "Elixir de Crescimento", cor: "#9ad97a" })
    ]
  };
})();

/* ===================== 0.94.3 - Obra Prima (Estudioso do Oculto) =====================
 * Janela de montagem (design "ObraPrima"): PdI viram +1 em Força, Agilidade, Estamina ou Destino
 * (Inteligência não sobe). Ao dar vida, o Mestre cria a ficha (NPC, Categoria 2, nível do Inventor,
 * Defesa 14, Movimento 5, Estresse 2, "só age em Prioridade") e põe o token ao lado. Só uma por vez.
 * Tudo vem de "system.obraPrima" na Habilidade (nada fixo aqui além dos rótulos).
 * ===================================================================================== */
const NAUREN_OBRA_PRIMA_ATRIBUTOS = [
  { id: "forca", nome: "Força" }, { id: "agilidade", nome: "Agilidade" }, { id: "estamina", nome: "Estamina" },
  { id: "destino", nome: "Destino" }, { id: "inteligencia", nome: "Inteligência", travado: true }
];

function naurenObraPrimaDe(actor) {
  const uuid = actor?.getFlag?.("nauren", "obraPrimaUuid");
  if (!uuid) return null;
  try { const d = fromUuidSync(uuid); return d?.actor ?? d ?? null; } catch (err) { return null; }
}

class NaurenObraPrima extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "nauren-obra-prima-{id}",
    classes: ["nauren-rpg", "nauren-obra-prima"],
    position: { width: 420, height: "auto" },
    window: { title: "Obra Prima", resizable: false, minimizable: true, icon: "fas fa-robot" },
    actions: { mais: NaurenObraPrima.onMais, menos: NaurenObraPrima.onMenos, criar: NaurenObraPrima.onCriar }
  };
  static PARTS = { body: { template: "systems/nauren/templates/obra-prima.html" } };
  constructor(options = {}) {
    super(options);
    this.actor = options.actor;
    this.habilidade = options.habilidade;
    this.extra = { forca: 0, agilidade: 0, estamina: 0, destino: 0 };
    this.nome = "";
  }
  static abrir(actor, habilidade) {
    if (game.combat?.started && game.combat.combatants.some(c => c.actor === actor)) return ui.notifications.warn("A Obra Prima é construída durante o Exercício Teórico, fora de combate.");
    new NaurenObraPrima({ actor, habilidade, id: `nauren-obra-prima-${actor.id}` }).render(true);
  }
  get config() { return this.habilidade?.system?.obraPrima ?? {}; }
  _recurso() { return naurenRecursoDoAtor(this.actor, this.config.recurso || "recursoCustom:pdi"); }
  _gasto() { return Object.values(this.extra).reduce((a, b) => a + b, 0); }
  _valores() {
    const base = Number(this.config.atributoBase ?? 1) || 1;
    const v = {}; for (const a of NAUREN_OBRA_PRIMA_ATRIBUTOS) v[a.id] = base + (a.travado ? 0 : (this.extra[a.id] ?? 0));
    return v;
  }
  async _prepareContext() {
    const rec = this._recurso();
    const gasto = this._gasto();
    const disp = (rec?.valor ?? 0) - gasto;
    const v = this._valores();
    const nivel = this.actor.system?.nivel ?? 1;
    const vitalidade = Math.floor((v.forca + v.estamina) / 2);
    const maxBarras = Math.max(6, ...Object.values(v));
    const atual = naurenObraPrimaDe(this.actor);
    return {
      titulo: this.config.titulo || "Obra Prima", sub: `${this.config.subtitulo || "Cobaia Nº 1"} · Categoria ${this.config.categoria ?? 2}`,
      nome: this.nome, placeholder: this.config.nomePadrao || "Obra Prima",
      stats: [
        { rotulo: "Vida", valor: `${Math.max(1, vitalidade * nivel)}`, dica: `Vitalidade ${vitalidade} × nível ${nivel}` },
        { rotulo: "Defesa", valor: String(this.config.defesa ?? 14) }, { rotulo: "Movimento", valor: `${this.config.movimento ?? 5} m` },
        { rotulo: "Estresse", valor: "2" }, { rotulo: "Nível", valor: `${nivel} (igual ao seu)`, largo: true }
      ],
      gasto, sigla: this.config.sigla || "PdI", disponivel: disp, recNome: rec?.nome ?? "Pontos de Invenção",
      atributos: NAUREN_OBRA_PRIMA_ATRIBUTOS.map(a => ({ id: a.id, nome: a.nome, valor: v[a.id], travado: !!a.travado, mexido: !a.travado && (this.extra[a.id] ?? 0) > 0,
        semMenos: a.travado || (this.extra[a.id] ?? 0) <= 0, semMais: a.travado || disp <= 0,
        barras: Array.from({ length: maxBarras }, (_, i) => ({ classe: i < (Number(this.config.atributoBase ?? 1) || 1) ? "base" : (i < v[a.id] ? "cheia" : "") })) })),
      passivas: (this.config.passivas ?? []).map(p => ({ nome: p.nome, texto: p.texto })),
      aviso: atual ? `Só existe uma Obra Prima por vez: ${atual.name} será desfeita ao dar vida a esta.` : "",
      semCriar: disp < 0
    };
  }
  _onRender(context, options) {
    super._onRender?.(context, options);
    const inp = this.element?.querySelector?.("input[name=nome]");
    if (inp) inp.addEventListener("input", ev => { this.nome = ev.currentTarget.value; });
  }
  static onMais(event, target) { const id = target.dataset.id; if (!(id in this.extra)) return; const rec = this._recurso(); if ((rec?.valor ?? 0) - this._gasto() <= 0) return; this.extra[id] += 1; this.render(); }
  static onMenos(event, target) { const id = target.dataset.id; if (!(id in this.extra) || this.extra[id] <= 0) return; this.extra[id] -= 1; this.render(); }
  static async onCriar() {
    const gasto = this._gasto();
    const rec = this._recurso();
    if ((rec?.valor ?? 0) < gasto) return ui.notifications.warn(`Faltam ${gasto - (rec?.valor ?? 0)} ${this.config.sigla || "PdI"}.`);
    const tok = this.actor.getActiveTokens?.(true)?.[0];
    if (!tok) return ui.notifications.warn("Ponha o token do Inventor no mapa: a Obra Prima surge ao lado dele.");
    const anterior = naurenObraPrimaDe(this.actor);
    if (anterior) {
      const ok = await foundry.applications.api.DialogV2.confirm({ ...NAUREN_KIT_JANELA, window: { title: "Obra Prima" }, content: `<p>Só pode existir uma Obra Prima por vez. <b>${anterior.name}</b> será desfeita. Continuar?</p>`, rejectClose: false }).catch(() => false);
      if (!ok) return;
    }
    const cfg = this.config;
    const v = this._valores();
    const dados = {
      tokenUuid: tok.document.uuid, inventorUuid: this.actor.uuid, anteriorUuid: anterior?.uuid ?? "",
      nome: (this.nome || "").trim() || `${cfg.nomePadrao || "Obra Prima"} de ${this.actor.name}`,
      img: cfg.img || "icons/creatures/magical/construct-golem-robot-blue.webp",
      atributos: v, nivel: this.actor.system?.nivel ?? 1, defesa: Number(cfg.defesa ?? 14), movimento: Number(cfg.movimento ?? 5), categoria: Number(cfg.categoria ?? 2),
      itens: cfg.itensUuids ?? [], gasto, sigla: cfg.sigla || "PdI", fonte: this.habilidade?.name ?? "Obra Prima"
    };
    const res = game.user.isGM ? await naurenCriarObraPrima(dados) : await game.users.activeGM?.query(NAUREN_QUERY_ITEM_MESTRE, { tipo: "obraPrima", dados }, { timeout: 30000 }).catch(() => null);
    if (!res?.ok) return ui.notifications.warn(`Obra Prima: ${res?.motivo ?? "precisa de um Mestre conectado"}.`);
    if (gasto) await naurenConcederRecurso(this.actor, cfg.recurso || "recursoCustom:pdi", String(-gasto), this.habilidade);
    await this.actor.setFlag("nauren", "obraPrimaUuid", res.actorUuid);
    this.close();
  }
}

/** Lado do Mestre: cria a ficha da Obra Prima, desfaz a anterior e põe o token ao lado do Inventor. */
async function naurenCriarObraPrima(dados) {
  const origemTok = await fromUuid(dados.tokenUuid).catch(() => null);
  const inventor = origemTok?.actor ?? (await fromUuid(dados.inventorUuid).catch(() => null));
  const cena = origemTok?.parent;
  if (!origemTok || !cena || !inventor) return { ok: false, motivo: "o Inventor não está no mapa" };
  const casas = naurenCasasLivresEmVolta(cena, origemTok, 1, 1, 1, 2);
  if (!casas.length) return { ok: false, motivo: "sem espaço livre ao lado do Inventor" };
  if (dados.anteriorUuid) {
    const ant = await fromUuid(dados.anteriorUuid).catch(() => null);
    const antAtor = ant?.actor ?? ant;
    if (antAtor?.getFlag?.("nauren", "obraPrimaDe") === inventor.uuid) {
      for (const sc of game.scenes) { const ids = sc.tokens.filter(t => t.actorId === antAtor.id).map(t => t.id); if (ids.length) await sc.deleteEmbeddedDocuments("Token", ids).catch(() => {}); }
      await antAtor.delete().catch(() => {});
    }
  }
  const at = dados.atributos ?? {};
  const ownership = foundry.utils.deepClone(inventor.ownership ?? {});
  const itens = [];
  for (const u of dados.itens ?? []) { const d = await fromUuid(u).catch(() => null); if (d) { const o = d.toObject(); delete o._id; foundry.utils.setProperty(o, "flags.nauren.origemUuid", u); itens.push(o); } }
  const ator = await Actor.create({
    name: dados.nome, type: "npc", img: dados.img, ownership,
    system: { nivel: dados.nivel, categoriaMonstro: Math.max(1, Math.min(4, dados.categoria || 2)), calculoVida: "vitalidadeNivel", defesa: dados.defesa, movimento: dados.movimento, soAgeEmPrioridade: true,
      atributos: Object.fromEntries(["forca", "agilidade", "estamina", "inteligencia", "destino"].map(k => [k, { value: Math.max(0, Number(at[k]) || 1) }])) },
    prototypeToken: { name: dados.nome, actorLink: true, disposition: origemTok.disposition, texture: { src: dados.img } },
    items: itens,
    flags: { nauren: { obraPrimaDe: inventor.uuid } }
  });
  if (!ator) return { ok: false, motivo: "não foi possível criar a ficha" };
  await ator.update({ "system.vida.value": ator.system.vida?.max ?? 1, "system.estaminaCombate.value": ator.system.estaminaCombate?.max ?? 1 }).catch(() => {});
  const td = (await ator.getTokenDocument({ disposition: origemTok.disposition, x: casas[0].x, y: casas[0].y })).toObject();
  delete td._id;
  await cena.createEmbeddedDocuments("Token", [naurenAndarParaToken({ ...td, x: casas[0].x, y: casas[0].y, hidden: false, flags: { ...(td.flags ?? {}), nauren: { ...(td.flags?.nauren ?? {}), surgir: true } } }, origemTok)]);
  const nomesAtr = { forca: "For", agilidade: "Agi", estamina: "Est", inteligencia: "Int", destino: "Des" };
  await naurenPostarCard({ ator: inventor, titulo: dados.fonte || "Obra Prima", icone: dados.img, fonte: `Obra Prima de ${inventor.name}`, linhas: [
    { label: "Ganhou vida", value: ator.name, breakdown: `nível ${dados.nivel} · Categoria ${dados.categoria} · Defesa ${dados.defesa} · Movimento ${dados.movimento} m` },
    { label: "Atributos", value: Object.entries(nomesAtr).map(([k, r]) => `${r} ${at[k] ?? 1}`).join(" · ") },
    { label: "Vida", value: `${ator.system.vida?.max ?? 1}` },
    { label: `${dados.sigla} investidos`, value: String(dados.gasto ?? 0) },
    { label: "Obediência Cega", value: "sem turno na iniciativa; só age quando recebe Prioridade" }
  ] }).catch(() => {});
  return { ok: true, actorUuid: ator.uuid, nome: ator.name };
}


async function naurenSemearInventorFrascosFerramentas(packs) {
  const pc = packs.condicoes, ph = packs.habilidades, pa = packs.armaduras;
  const porRank = (campo, passo, ate = 6) => ({ campo, valor: String(passo), porRank: Array.from({ length: ate }, (_, i) => ({ rank: i + 1, valor: String(passo * (i + 1)) })) });
  const condFrasco = (seed, name, img, mod, regra) => naurenGarantirItemNoPack(pc, seed, { name, type: "condicao", img,
    system: { duracaoModo: "cena", negativa: "nao", rankAtual: 1, rankMax: 6, modificadores: [mod],
      descricao: naurenMontarDescricao({ regra, automatico: "vem de um Frasco; dura até o fim da cena. Beber outro igual não soma: vale o mais forte.", manual: "" }) } });
  await condFrasco("condicao-frasco-passos-leves", "Frasco: Passos Leves", "icons/consumables/potions/bottle-conical-corked-cyan.webp", porRank("movimento", 2), "+2 m de Movimento por dose.");
  await condFrasco("condicao-frasco-pele-dura", "Frasco: Pele Dura", "icons/consumables/potions/bottle-round-corked-yellow.webp", porRank("defesa", 1), "+1 de Defesa por dose.");
  await condFrasco("condicao-frasco-forca-rubra", "Frasco: Força Rubra", "icons/consumables/potions/bottle-round-corked-red.webp", porRank("poderAtaque", 2), "+2 de Poder de Ataque por dose (Poção de Sangue de Dragão).");
  await condFrasco("condicao-frasco-mente-rubra", "Frasco: Mente Rubra", "icons/consumables/potions/bottle-round-corked-pink.webp", porRank("poderMagia", 2), "+2 de Poder de Magia por dose (Poção de Sangue de Dragão).");
  await naurenGarantirItemNoPack(pc, "condicao-monoculo-ajustado", { name: "Monóculo Ajustado", type: "condicao", img: "icons/commodities/treasure/lense-pipe-bronze.webp",
    system: { duracaoModo: "cena", negativa: "nao", removerAoTestar: true, modificadores: [{ campo: "vantagemTeste", valor: "vantagem" }, { campo: "vantagemAtaque", valor: "vantagem" }],
      descricao: naurenMontarDescricao({ regra: "Facilidade no próximo teste (de atributo ou de ataque).", automatico: "vale na próxima rolagem de d20 e some logo depois, com card.", manual: "" }) } });
  await naurenGarantirItemNoPack(pc, "condicao-bobina-carregada", { name: "Bobina Carregada", type: "condicao", img: "icons/commodities/tech/coil-tesla.webp",
    system: { duracaoModo: "cena", negativa: "nao", usaProximaAcao: true, proximaAcaoApenasAtaque: true, proximaAcaoSemCusto: true, proximaAcaoSemPrioridade: true, proximaAcaoConsumir: 1,
      descricao: naurenMontarDescricao({ regra: "Anunciada antes do ataque: você faz um ataque adicional sem gastar Estamina e sem gerar Prioridade.", automatico: "o próximo ataque sai sem custo de Estamina e sem Prioridade; a Condição sai depois dele.", manual: "" }) } });
  const monoculo = await naurenGarantirHabilidadeDeClasse(ph, "habilidade-inventor-monoculo", { name: "Monóculo", type: "habilidade", flags: { nauren: { grupoUI: "ferramenta", textoAtiva: "Facilidade no próximo teste ou ataque" } }, img: "icons/commodities/treasure/lense-pipe-bronze.webp",
    system: { ativo: true, prioridadeIndicador: "NP",
      acoes: [{ nome: "Ajustar o Monóculo", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP", usaUsos: true, usosMax: 1, usosAtual: 1, usosReset: "cena", condicaoEmMimUuid: "self:Monóculo Ajustado" }],
      descricao: naurenMontarDescricao({ regra: "Ferramenta de Inventor (Pigmentos 50 Florins + Madeira 1 Florim, 6 horas). 1 vez por cena, você tem Facilidade em um teste (N/P).", automatico: "a Ação dá Monóculo Ajustado: Facilidade na próxima rolagem de teste ou ataque.", manual: "o custo em Florins e as horas de construção." }) } });
  const bobina = await naurenGarantirHabilidadeDeClasse(ph, "habilidade-inventor-bobina", { name: "Bobina", type: "habilidade", flags: { nauren: { grupoUI: "ferramenta", textoAtiva: "o próximo ataque sai sem custo e sem gerar Prioridade" } }, img: "icons/commodities/tech/coil-tesla-large.webp",
    system: { ativo: true, prioridadeIndicador: "NP", usaGatilhos: true,
      acoes: [{ nome: "Carregar a Bobina", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP", usaUsos: true, usosMax: 1, usosAtual: 1, usosReset: "cena", condicaoEmMimUuid: "self:Bobina Carregada" }],
      gatilhos: [{ evento: "euUseiAcao", soAtaque: true, recurso: "recuperarUsoACada", quantidade: "5" }],
      descricao: naurenMontarDescricao({ regra: "Ferramenta de Inventor (Pigmentos 150 Florins + Metal 100 Florins, 12 horas). 1 vez por cena: anuncie antes do teste e faça um ataque adicional como parte do seu ataque, sem gastar Estamina nem gerar Prioridade. Depois de 5 ataques, o uso volta.", automatico: "a Ação deixa o próximo ataque sem custo e sem Prioridade; cada ataque seu conta e, no 5º, a Bobina recarrega sozinha (card).", manual: "o custo em Florins e as horas." }) } });
  const manoplas = await naurenGarantirItemNoPack(pa, "armadura-inventor-manoplas", { name: "Manoplas do Inventor", type: "armadura", flags: { nauren: { grupoUI: "ferramenta" } }, img: "icons/equipment/hand/gauntlet-armored-steel-grey.webp",
    system: { tipo: "Manopla", defesaBonus: 0, equipado: true, efeitosVinculados: [{ id: "", ativo: true, modificadores: [{ campo: "defesa", valor: "floor(@espirito/3)", porRank: [] }], condicoesAplicadas: [] }],
      descricao: naurenMontarDescricao({ regra: "Ferramenta de Inventor (Pigmentos 50 Florins + Metal 50 Florins, 6 horas). Item adicional de defesa, como capa e bota: +1 de Defesa a cada 3 do máximo de Pontos de Invenção.", automatico: "equipadas, somam ⌊Espírito ÷ 3⌋ de Defesa (o máximo de Pontos de Invenção é o Espírito).", manual: "o custo em Florins e as horas." }) } });
  const maleta = await naurenGarantirItemNoPack(pa, "armadura-inventor-maleta", { name: "Maleta do Inventor", type: "armadura", flags: { nauren: { grupoUI: "ferramenta" } }, img: "icons/containers/bags/satchel-leather-gold-brown.webp",
    system: { tipo: "Acessório", defesaBonus: 0, equipado: true, efeitosVinculados: [{ id: "", ativo: true, modificadores: [{ campo: "limiteOfensivo", valor: "3", porRank: [] }], condicoesAplicadas: [] }],
      acoes: [{ nome: "Tirar da Maleta", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP", usaEscolhaDeRecurso: true, escolhaDeRecursoTipo: "recursoCustom:pdi", escolhaDeRecursoMinimo: 1,
        custosRecursoProprio: [{ recurso: "recursoCustom:pdi", quantidade: "@quantidadeEscolhida", ativo: true, quantidadePorRank: [] }] }],
      descricao: naurenMontarDescricao({ regra: "Ferramenta de Inventor (Pigmentos 50 Florins + Couro 20 Florins, 2 horas). Equipada, aumenta em 3 o limite de equipamentos ofensivos. Gaste Pontos de Invenção para obter itens exigidos pelas suas habilidades: 1 PdI por Florim de custo do item.", automatico: "+3 no limite ofensivo enquanto equipada; a Ação \"Tirar da Maleta\" pergunta quantos PdI gastar e registra no card.", manual: "o Mestre entrega o item comprado (1 Florim por PdI; 2 com Mr. Bugigangas)." }) } });
  const ferramentas = [monoculo, bobina, manoplas, maleta];
  const frascos = await naurenGarantirHabilidadeDeClasse(ph, "habilidade-inventor-os-frascos", { name: "Os Frascos", type: "habilidade", img: "icons/tools/laboratory/alembic-glass-ball-blue.webp",
    system: { ativo: true, prioridadeIndicador: "PA", construcao: NAUREN_FRASCOS_CONSTRUCAO,
      usaUsos: true, usosMax: 1, usosAtual: 1, usosReset: "cena", usosMaxPorNivel: [{ nivel: 2, valor: 1 }, { nivel: 6, valor: 2 }, { nivel: 9, valor: 3 }, { nivel: 13, valor: 4 }],
      acoes: [{ nome: "Preparar Frasco", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP", abrirConstrucao: "criar", usaUsos: true, usosMax: 1, usosAtual: 1, usosReset: "dia" }],
      descricao: naurenMontarDescricao({ regra: "Nível 2. No descanso ou no Exercício Teórico, invente um líquido alquímico (1 por vez; requer um Frasco de 1 Florim): escolha benefícios na tabela e pague em Pontos de Invenção, cada um até 2 vezes. Cada benefício aumenta em 1 a chance de colateral (1d6). Beber custa 1 PdE (P/A), em você ou num aliado a 1 m. Usos por cena: 1, +1 nos níveis 6, 9 e 13.",
        automatico: "\"Preparar Frasco\" abre o Alambique (1 por descanso; o Exercício Teórico devolve um preparo). O Frasco vai para a mochila; beber gasta 1 uso por cena daqui, aplica os benefícios por 1 cena e rola o colateral no card.",
        manual: "o Frasco vazio de 1 Florim." }) } });
  return { frascos: frascos.uuid, ferramentas: ferramentas.map(f => f.uuid) };
}

/**
 * Camadas do líquido (design "Alambique"): uma faixa por dose, de baixo para cima, na cor do benefício.
 * Coordenadas no viewBox 0 0 180 250 do frasco. "cores" = uma cor por dose, na ordem da tabela.
 */
function naurenCamadasFrasco(cores) {
  const lista = (cores ?? []).filter(Boolean);
  const unidade = Math.min(32, Math.floor(180 / Math.max(1, lista.length)));
  let topo = 230;
  const camadas = lista.map((cor, i) => { topo -= unidade; return { y: topo, h: unidade + 1, cor, atraso: i * 60 }; });
  return { camadas, topo, bolhaY: Math.max(topo + 14, 120), bolhaY2: Math.max(topo + 30, 140) };
}

/** Cores das doses de um Frasco já pronto (pelas escolhas do projeto; sem projeto, uma por efeito). */
function naurenCoresDoFrasco(item) {
  const linhas = NAUREN_FRASCOS_CONSTRUCAO.linhas;
  const esc = item?.getFlag?.("nauren", "projeto")?.escolhas;
  if (esc && Object.keys(esc).length) return linhas.flatMap(l => Array(Math.max(0, Number(esc[l.id]) || 0)).fill(l.cor || "#cca162"));
  return (item?.system?.frasco?.efeitos ?? []).map(e => linhas.find(l => (l.nomeCurto || l.nome) === e.nome)?.cor || "#9ad97a");
}

function naurenMediaCores(cores) {
  let r = 0, g = 0, b = 0;
  for (const c of cores) { const h = String(c).replace("#", ""); r += parseInt(h.slice(0, 2), 16); g += parseInt(h.slice(2, 4), 16); b += parseInt(h.slice(4, 6), 16); }
  const m = v => Math.round(v / cores.length).toString(16).padStart(2, "0");
  return `#${m(r)}${m(g)}${m(b)}`;
}

/** "Vida 1d6", "Movimento ×2", "Antídoto 1d4"... */
function naurenTextoEfeitoFrasco(e) {
  if (!e) return "";
  if (e.tipo === "condicao" && e.rank) return `${e.rotulo || e.nome}${e.rank > 1 ? ` ×${e.rank}` : ""}`;
  if (e.formula && e.formula !== "0") return `${e.rotulo || e.nome} ${String(e.formula).replace(/^-/, "−")}`;
  return e.rotulo || e.nome || "";
}


/** Loja de Invenções: escolhe a arma (não de inventor), 1 vez por nível, até Inteligência armas diferentes. */
async function naurenAbrirLoja(actor, habConstrucao, lojaHab) {
  const nivel = actor.system?.nivel ?? 1;
  const usados = lojaHab?.getFlag("nauren", "lojaNiveis") ?? [];
  if (usados.includes(nivel)) return ui.notifications.warn(`${lojaHab?.name ?? "Loja de Invenções"}: já usada no nível ${nivel}. Volta no próximo nível.`);
  const chave = naurenChaveConstrucao(habConstrucao);
  const armas = actor.items.filter(i => i.type === "arma" && i.getFlag("nauren", "projeto")?.fonte !== chave);
  if (!armas.length) return ui.notifications.warn("Você não tem outra arma para melhorar na Loja.");
  const lojaFeitas = actor.items.filter(i => i.getFlag("nauren", "projeto")?.fonte === `${chave}#loja`);
  const limite = Math.max(1, Number(actor.system?.atributosTotais?.inteligencia ?? actor.system?.atributos?.inteligencia?.value ?? 1));
  const opcoes = armas.map(a => {
    const ja = lojaFeitas.includes(a);
    const bloq = !ja && lojaFeitas.length >= limite;
    return `<label class="nauren-frasco-opcao"><input type="radio" name="arma" value="${a.id}" ${bloq ? "disabled" : ""}> <b>${a.name}</b> <span>${a.system.categoria || ""}${ja ? " · já melhorada (continua o projeto)" : ""}${bloq ? ` · limite de ${limite} armas (Inteligência)` : ""}</span></label>`;
  }).join("");
  const id = await foundry.applications.api.DialogV2.prompt({ ...NAUREN_KIT_JANELA,
    window: { title: `${lojaHab?.name ?? "Loja de Invenções"}: qual arma?` },
    content: `<p>Escolha a arma que vai receber as características da sua tabela (${lojaFeitas.length} de ${limite} armas já melhoradas).</p><div class="nauren-frasco-escolha">${opcoes}</div>`,
    ok: { label: "Abrir na Bancada", callback: (e, btn) => btn.form?.querySelector?.("input[name=arma]:checked")?.value ?? null },
    rejectClose: false
  }).catch(() => null);
  const arma = id ? actor.items.get(id) : null;
  if (!arma) return;
  return NaurenBancada.abrir(actor, habConstrucao, { modo: "loja", item: arma, lojaHab });
}


/* ---- Inventor: Loja, Botas, Eureka, Metodologias, Doutor (0.94.2) ---- */
const NAUREN_BOTAS_COLATERAL = {
  dado: "1d6",
  linhas: [
    { de: 1, ate: 1, nome: "Recebe 1 de Estresse", efeitos: [{ tipo: "recurso", recurso: "estresse", formula: "1", nome: "Colateral" }] },
    { de: 2, ate: 2, nome: "É arremessado para cima", efeitos: [{ tipo: "texto", nome: "Colateral: arremessado para cima (metros)", formula: "1d10", texto: "se houver espaço; a queda fica com a mesa" }] },
    { de: 3, ate: 3, nome: "Perde toda a Estamina", efeitos: [{ tipo: "zerarRecurso", recurso: "estaminaCombate", nome: "Colateral" }] },
    { de: 4, ate: 4, nome: "Fica Atordoado", efeitos: [{ tipo: "condicao", uuid: "self:Atordoado", acumulos: "1", nome: "Colateral" }] },
    { de: 5, ate: 5, nome: "Explode: 6d6 em todos a até 3 m", efeitos: [{ tipo: "danoArea", formula: "6d6", raio: 3, nome: "Colateral: explosão" }] },
    { de: 6, ate: 6, nome: "1d4 de Queimando e rola de novo", rolarDeNovo: true, efeitos: [{ tipo: "condicao", uuid: "self:Queimando", acumulos: "1d4", nome: "Colateral" }] }
  ]
};

const NAUREN_BOTAS_CONSTRUCAO = (() => {
  const ativar = { nome: "Ativar as Botas", custoEstamina: 1, alcance: "pessoal", modoAlvo: "selecionado", modoAlvoTravado: true, alvoPadraoEu: true, bebeFrasco: true, prioridadeIndicador: "PA" };
  const base = (nome, defesa, img) => ({ name: nome, type: "armadura", img,
    system: { tipo: "Bota", defesaBonus: defesa, equipado: false, prioridadeIndicador: "PA", frasco: { efeitos: [], beneficios: 0, colateral: NAUREN_BOTAS_COLATERAL }, acoes: [ativar],
      descricao: naurenMontarDescricao({ regra: "Botas do Inventor. Para ganhar os efeitos, gaste 1 PdE (P/A); duram 1 cena. Cada melhoria aumenta em 1 a chance de efeito colateral (1d6) ao ativar.", automatico: "\"Ativar as Botas\" aplica as melhorias por 1 cena e rola o colateral no card. Precisa estar equipada.", manual: "escalada e a queda do colateral 2 ficam com a mesa." }) } });
  const ben = (id, nome, nomeCurto, custo, colateral, ef, ops = [], extra = {}) => ({ id, categoria: "bota", custo, nome, nomeCurto, efeito: colateral, max: 1, cor: extra.cor, escolha: extra.escolha,
    aplica: [{ modo: "adicionar", campo: "frasco.efeitos", valor: ef }, ...ops, { modo: "somar", campo: "frasco.beneficios", valor: 1 }] });
  const cond = (nome, uuid, extra = {}) => ({ nome, rotulo: nome, tipo: "condicao", uuid, rank: 1, ...extra });
  return {
    id: "botas-inventor", titulo: "Botas do Inventor", recurso: "recursoCustom:pdi", siglaRecurso: "PdI", orcamento: "@espirito", maxPorLinha: "1", maximoItens: "1",
    notaRegra: "As melhorias valem por 1 cena ao ativar (1 PdE). Defesa igual à da bota escolhida.",
    formulas: [
      { id: "simples", nome: "Botas Simples", sub: "Bota · Defesa +1", tipo: "Bota", esboco: "botas", base: base("Botas do Inventor", 1, "icons/equipment/feet/boots-armored-brass.webp") },
      { id: "grevas", nome: "Grevas Reforçadas", sub: "Bota · Defesa +2", tipo: "Bota", esboco: "botas", base: base("Grevas do Inventor", 2, "icons/equipment/feet/boots-armored-banded-steel.webp") }
    ],
    categorias: [{ id: "bota", nome: "Melhorias", cor: "#cca162" }],
    linhas: [
      ben("corrida", "+6 m de Movimento", "Corrida", 4, "1 · recebe 1 de Estresse", cond("Corrida", "self:Botas: Passos Largos"), [], { cor: "#7fb0e0" }),
      ben("escalada", "+6 m de movimento de escalada", "Escalada", 3, "2 · arremessado 1d10 m para cima", cond("Escalada", "self:Botas: Garras de Escalada"), [], { cor: "#a8c27a" }),
      ben("couraca", "+3 de Defesa", "Couraça", 3, "3 · perde toda a Estamina", cond("Couraça", "self:Botas: Couraça"), [], { cor: "#cca162" }),
      ben("impulso", "+1d6 de Poder de Ataque ou de Magia", "Impulso", 5, "4 · fica Atordoado", cond("Impulso", "self:Botas: Impulso", { valorFormula: "1d6", campo: "poderAtaque" }),
        [{ modo: "substituir", campo: "frasco.efeitos[Impulso].campo", valor: "$escolha" }], { cor: "#d97aa8", escolha: ["poderAtaque", "poderMagia"] }),
      ben("voo", "Voo de 4 m (manter: 1 PdI por turno)", "Voo", 6, "5 · explode: 6d6 em todos a até 3 m", cond("Voo", "self:Botas: Voo"), [], { cor: "#6fc3d9" }),
      ben("ancora", "Imune a Caído e Lerdeza; não é empurrado nem movido", "Âncora", 8, "6 · 1d4 de Queimando e rola de novo", cond("Âncora", "self:Botas: Âncora"), [], { cor: "#b48ce0" })
    ]
  };
})();

async function naurenSemearInventorAvancado(packs) {
  const pc = packs.condicoes, ph = packs.habilidades;
  const cena = (seed, name, img, system, regra, auto) => naurenGarantirItemNoPack(pc, seed, { name, type: "condicao", img,
    system: { duracaoModo: "cena", negativa: "nao", ...system, descricao: naurenMontarDescricao({ regra, automatico: auto, manual: system._manual ?? "" }) } });
  await cena("condicao-botas-passos-largos", "Botas: Passos Largos", "icons/equipment/feet/boots-armored-brass.webp", { rankAtual: 1, rankMax: 1, modificadores: [{ campo: "movimento", valor: "6" }] }, "+6 m de Movimento até o fim da cena.", "soma 6 m ao Movimento; sai no fim do combate.");
  await cena("condicao-botas-garras-escalada", "Botas: Garras de Escalada", "icons/equipment/feet/boots-armored-green.webp", { rankAtual: 1, rankMax: 1, _manual: "o sistema não mede escalada: a mesa considera +6 m ao escalar." }, "+6 m de movimento de escalada até o fim da cena.", "aparece na ficha e no token até o fim do combate.");
  await cena("condicao-botas-couraca", "Botas: Couraça", "icons/equipment/feet/boots-armored-grey.webp", { rankAtual: 1, rankMax: 1, modificadores: [{ campo: "defesa", valor: "3" }] }, "+3 de Defesa até o fim da cena.", "soma 3 de Defesa; sai no fim do combate.");
  await cena("condicao-botas-impulso", "Botas: Impulso", "icons/equipment/feet/boots-armored-gold.webp", { rankAtual: 1, rankMax: 1, modificadores: [{ campo: "poderAtaque", valor: "1" }] }, "+1d6 de Poder de Ataque ou de Magia (escolhido nas Botas) até o fim da cena.", "o d6 é rolado ao ativar e fica gravado aqui.");
  await cena("condicao-botas-voo", "Botas: Voo", "icons/magic/movement/abstract-ribbons-red-orange.webp", { rankAtual: 1, rankMax: 1, vooCusto: "recursoCustom:pdi" }, "Voando (4 m de voo). No início de cada turno seu, gaste 1 Ponto de Invenção para continuar voando.", "no início do seu turno pergunta se mantém o voo (1 PdI); sem pagar, pousa.");
  await cena("condicao-botas-ancora", "Botas: Âncora", "icons/equipment/feet/boots-armored-banded-steel.webp", { rankAtual: 1, rankMax: 1, imunidadesCondicoes: ["Caído", "Lerdeza"], imuneMovimentoForcado: true }, "Imune a Caído e Lerdeza; não pode ser empurrado nem movido contra a vontade.", "Caído e Lerdeza não se aplicam (card \"Imune\"); empurrões e puxões não movem o token.");
  const loja = await naurenGarantirHabilidadeDeClasse(ph, "habilidade-inventor-loja", { name: "Loja de Invenções", type: "habilidade", img: "icons/environment/settlement/market-stall.webp",
    system: { ativo: true, acoes: [{ nome: "Abrir a Loja", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP", abrirConstrucao: "loja", abrirConstrucaoFonte: "Arma de Inventor" }],
      descricao: naurenMontarDescricao({ regra: "Nível 8. 1 vez por nível: aplique características da tabela da Arma de Inventor em outra arma, gastando Pontos de Invenção como na Etapa de Invenção (1 hora de trabalho por ponto). Você pode melhorar um número de armas igual à sua Inteligência.",
        automatico: "escolhe a arma, abre a Bancada com o que ela já ganhou travado e cobra os PdI; o card registra as horas. Conta 1 uso por nível e o limite de armas pela Inteligência.", manual: "as horas de trabalho." }) } });
  const botas = await naurenGarantirHabilidadeDeClasse(ph, "habilidade-inventor-botas", { name: "Olhar pro Futuro e Pés no Chão", type: "habilidade", img: "icons/equipment/feet/boots-armored-gold.webp",
    system: { ativo: true, construcao: NAUREN_BOTAS_CONSTRUCAO,
      acoes: [{ nome: "Montar as Botas", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP", abrirConstrucao: "criar" }],
      descricao: naurenMontarDescricao({ regra: "Nível 17. Crie melhorias para botas (Botas do Inventor): cada melhoria aumenta em 1 a chance de efeito colateral ao ativar. Ativar: 1 PdE, Prioridade Aliada; os efeitos duram 1 cena.",
        automatico: "a Bancada monta as Botas com as melhorias; \"Ativar as Botas\" aplica os efeitos e rola o colateral (inclusive a explosão de 6d6 em quem estiver a 3 m). O Voo pede 1 PdI no início de cada turno.", manual: "" }) } });
  const eureka = await naurenGarantirHabilidadeDeClasse(ph, "habilidade-inventor-eureka", { name: "Eureka!", type: "habilidade", img: "icons/magic/light/explosion-star-glow-yellow.webp",
    system: { ativo: true, rankAtual: 1, rankMax: 3, efeitosVinculados: [{ id: "", ativo: true, modificadores: [{ campo: "inteligencia", valor: "@rank", porRank: [] }], condicoesAplicadas: [] }],
      descricao: naurenMontarDescricao({ regra: "Níveis 12, 15 e 18: +1 de Inteligência cada.", automatico: "+1 de Inteligência por rank (o rank sobe nos níveis 15 e 18).", manual: "" }) } });
  const metodologias = await naurenGarantirHabilidadeDeClasse(ph, "habilidade-inventor-metodologias", { name: "Metodologias do Progresso", type: "habilidade", img: "icons/sundries/documents/blueprint-recipe-alchemical.webp",
    system: { ativo: true, descricao: naurenMontarDescricao({ regra: "Nível 19. Você pode ter outro item da Fórmula do Inventor, mas os efeitos iguais não se acumulam com os do primeiro.", automatico: "a Bancada da Arma de Inventor deixa criar uma segunda arma; com as duas equipadas, cada efeito (Defesa, Bloqueio...) vale só pelo maior.", manual: "" }) } });
  const doutor = await naurenGarantirHabilidadeDeClasse(ph, "habilidade-inventor-doutor", { name: "Doutor", type: "habilidade", img: "icons/tools/laboratory/alembic-glass-ball-blue.webp",
    system: { ativo: true, acoes: [{ nome: "Hora de trabalho", custoEstamina: 0, alcance: "pessoal", modoAlvo: "nenhum", naoGeraPrioridade: true, prioridadeIndicador: "NP", usaEscolhaDeRecurso: true, escolhaDeRecursoTipo: "recursoCustom:pdi", escolhaDeRecursoMinimo: 1,
        custosRecursoProprio: [{ recurso: "recursoCustom:pdi", quantidade: "@quantidadeEscolhida", ativo: true, quantidadePorRank: [] }] }],
      descricao: naurenMontarDescricao({ regra: "Nível 20. Você pode criar qualquer item que já tenha visto, usando Pontos de Invenção para reduzir o custo em Florins: a cada hora de trabalho, gaste PdI para reduzir o custo restante na mesma quantidade.", automatico: "\"Hora de trabalho\" pergunta quantos PdI gastar, desconta e registra no card (1 PdI = 1 Florim a menos).", manual: "o custo restante do item e o item em si ficam com a mesa." }) } });
  return { loja: loja.uuid, botas: botas.uuid, eureka: eureka.uuid, metodologias: metodologias.uuid, doutor: doutor.uuid };
}

export let NaurenAlambique;

/** Código que rodava solto neste trecho do nauren.mjs: chamado no mesmo ponto de antes. */
export function __naurenIniciar_inventor() {


/* ---- Alambique (0.94.1): a Bancada dos Frascos, com o risco de colateral à vista ---- */
NaurenAlambique = class NaurenAlambique extends NaurenBancada {
  static DEFAULT_OPTIONS = {
    id: "nauren-alambique-{id}",
    actions: { ...NaurenBancada.DEFAULT_OPTIONS.actions },
    classes: ["nauren-rpg", "nauren-bancada", "nauren-alambique"],
    position: { width: 900, height: 800 },
    window: { title: "Alambique", resizable: true, minimizable: true, icon: "fas fa-flask" }
  };
  static PARTS = { body: { template: "systems/nauren/templates/alambique.html" } };
  _initializeApplicationOptions(options) {
    const o = super._initializeApplicationOptions?.(options) ?? options;
    if (o?.position) {
      o.position.width = Math.max(620, Math.min(900, (window.innerWidth || 900) - 40));
      o.position.height = Math.max(560, Math.min(800, (window.innerHeight || 800) - 90));
    }
    return o;
  }
  get title() { return `Alambique · ${this.actor?.name ?? ""}`; }
  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const c = naurenConstrucaoDe(this.habilidade);
    const linhas = ctx.categorias.flatMap(cat => cat.linhas);
    const n = linhas.reduce((t, l) => t + (l.bloqueada ? 0 : l.n), 0);
    const risco = Math.min(6, n);
    ctx.beneficios = linhas.map(l => ({ ...l, cor: l.cor || "#cca162" }));
    ctx.faces = [1, 2, 3, 4, 5, 6].map(f => ({ n: f, risco: f <= risco, rotulo: f <= risco ? "colateral" : "seguro" }));
    ctx.riscoTexto = n ? `${risco} em 6` : "nenhum";
    ctx.riscoNota = n ? `Ao beber: 1d6, colateral se cair de 1 a ${risco}${risco >= 6 ? " (sempre)" : ""}.` : "Sem benefícios, sem colateral.";
    // Cor do líquido: média das cores dos benefícios escolhidos.
    const escolhidos = linhas.filter(l => l.n > 0);
    const cores = escolhidos.flatMap(l => Array(l.n).fill(l.cor || "#cca162"));
    ctx.liquido = cores.length ? naurenMediaCores(cores) : "#3b3154";
    ctx.nivelLiquido = Math.round(20 + 60 * Math.min(1, n / 6));
    Object.assign(ctx, naurenCamadasFrasco(escolhidos.flatMap(l => Array(l.n).fill(l.cor || "#cca162"))));
    // Só a camada nova anima: as que já estavam ficam paradas (a mesma cor na mesma posição).
    const antes = this._camadasAntes ?? [];
    ctx.camadas.forEach((k, i) => { k.nova = antes[i] !== k.cor; });
    this._camadasAntes = ctx.camadas.map(k => k.cor);
    ctx.rotuloFrasco = escolhidos.length ? escolhidos.map(l => `${l.nomeCurto || l.nome}${l.n > 1 ? ` ×${l.n}` : ""}`).join(" · ") : "Frasco vazio";
    ctx.barraPct = ctx.orcamento > 0 ? Math.min(100, Math.round(100 * ctx.usados / ctx.orcamento)) : 0;
    // Preparos: "Preparar Frasco" (1 por descanso; o Exercício Teórico devolve).
    const aU = (this.habilidade.system.acoes ?? []).find(a => naurenNomeBate(a.nome, c.usoDaAcao ?? ""));
    if (aU?.usaUsos) {
      const maxU = (naurenResolverPorNivel(aU.usosMaxPorNivel, this.actor.system?.nivel || 1, "valor") ?? aU.usosMax ?? 0) + naurenUsosExtrasPara(this.actor, this.habilidade, aU.nome);
      ctx.preparos = `${aU.usosAtual ?? 0} de ${maxU}`;
      if ((aU.usosAtual ?? 0) <= 0) { ctx.semForjar = true; ctx.aviso = "Sem preparos agora: volta no descanso ou com o Exercício Teórico."; }
    }
    const usosBeber = this.habilidade.system.usaUsos ? (naurenResolverPorNivel(this.habilidade.system.usosMaxPorNivel, this.actor.system?.nivel || 1, "valor") ?? this.habilidade.system.usosMax ?? 1) + naurenUsosExtrasPara(this.actor, this.habilidade, "item") : 1;
    ctx.rodape = `Beber: 1 Estamina · P/A · em você ou num aliado a 1 m · ${usosBeber} uso${usosBeber > 1 ? "s" : ""} por cena`;
    // Da Subclasse: o que mexe nos Frascos (Composto Refinado, Elixir Arco-Íris, Sangue de Dragão...).
    ctx.daSubclasse = naurenFrascoModsDe(this.actor).filter(x => x.item.type !== "condicao").map(x => ({ nome: x.item.name, texto: String(x.m.resumo || "").replace(/@rank\b/g, String(x.rank)) }))
      .concat(this.actor.items.filter(i => i.type === "habilidade" && c.linhas.some(l => l.requer && naurenEhItem(i, l.requer))).map(i => ({ nome: i.name, texto: "benefícios novos na tabela" })));
    ctx.temColateral = (NAUREN_FRASCO_COLATERAL.linhas ?? []).length > 0;
    ctx.rotuloForjar = "Destilar Frasco";
    ctx.rotuloLimpar = "Esvaziar";
    return ctx;
  }
};
}

export { NAUREN_BOTAS_COLATERAL, NAUREN_BOTAS_CONSTRUCAO, NAUREN_FRASCOS_CONSTRUCAO, NAUREN_FRASCO_COLATERAL, NAUREN_INVENTOR_CONSTRUCAO, NAUREN_OBRA_PRIMA_ATRIBUTOS, NAUREN_ROTULO_RECURSO_FRASCO, NaurenObraPrima, naurenAbrirLoja, naurenAplicarEfeitoSimples, naurenCamadasFrasco, naurenContextoInvencoes, naurenCoresDoFrasco, naurenCriarFrascoEspecial, naurenCriarObraPrima, naurenEfeitoComSubst, naurenEscolherFrasco, naurenEscolherPeculiaridade, naurenFrascoModsDe, naurenFrascoNumero, naurenFrascoPagar, naurenFrascoParaPacote, naurenFrascoPodePagar, naurenFrascoRolar, naurenFrascoTextoCusto, naurenFrascosDoAtor, naurenMediaCores, naurenObraPrimaDe, naurenProcessarFrascoNoAlvo, naurenResumoFrasco, naurenSemearClasseInventor, naurenSemearInventorAvancado, naurenSemearInventorFrascosFerramentas, naurenSemearInventorSubclasses, naurenTextoEfeitoFrasco, naurenTextoFrascoEspecial, naurenUmaVezMarcar, naurenUmaVezRecusa };
