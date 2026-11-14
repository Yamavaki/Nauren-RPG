/**
 * Nauren RPG — modelos prontos de Escritos modernos e cyberpunk (0.116), no formato JSON simples dos Escritos.
 * Vão para o compêndio "Nauren - Equipamentos" (pasta "Escritos — modelos") pelo naurenSemearEscritos.
 * Só dados: dá para copiar qualquer um como exemplo para a IA ou para o Importar JSON.
 */
const P = "Escritos — modelos";

/** Cartazes: um de cada tipo em cada era. */
const CARTAZES = {
  procurado: {
    classico: { nome: "Dorian \"Mão Leve\"", subtitulo: "vivo ou morto", texto: "Roubo ao tesouro do Barão e fuga das masmorras de Velmor.", recompensa: "500 Florins", contratante: "Barão de Velmor", prazo: "até a lua cheia" },
    moderno: { nome: "Dorian Vash", subtitulo: "procurado pela polícia", recompensa: "R$ 50.000", contratante: "Disque-denúncia 181 · sigilo garantido", detalhes: [{ rot: "Altura", val: "1,78 m" }, { rot: "Visto em", val: "estação central, 22h" }, { rot: "Crimes", val: "roubo qualificado, fuga" }] },
    cyberpunk: { nome: "D. VASH", codigo: "#7731-K", ameaca: 75, recompensa: "25.000 ¢", contratante: "NCPD", detalhes: [{ rot: "implantes", val: "braço tático" }, { rot: "último sinal", val: "setor 9" }] }
  },
  desaparecido: {
    classico: { nome: "Elina, filha do moleiro", subtitulo: "vista pela última vez no moinho velho", texto: "Cabelos ruivos, vestido azul. Qualquer notícia, procurar o moleiro Bram.", recompensa: "80 Florins" },
    moderno: { nome: "Lia Moreno, 19", subtitulo: "desaparecida desde 12/03", detalhes: [{ rot: "Vista em", val: "metrô, linha 4" }, { rot: "Roupa", val: "jaqueta amarela" }], contratante: "Ligue para a família: (65) 9 9999-0000" },
    cyberpunk: { nome: "KIRA-07", codigo: "#0450-L", ameaca: 0, texto: "Sinal do implante perdido no Distrito 7.", recompensa: "3.000 ¢", contratante: "Família Moreno", detalhes: [{ rot: "último sinal", val: "Viela 6" }] }
  },
  missao: {
    classico: { nome: "Ratos no porão do Remo Partido", texto: "Ratos do tamanho de cães. Tragam as caudas.", recompensa: "40 Florins", contratante: "Taverneiro Brom" },
    moderno: { nome: "Vigiar o galpão da Doca 9", texto: "Turno das 2h às 6h. Fotografar quem entrar.", recompensa: "R$ 2.000", contratante: "Agência Lince", prazo: "esta semana" },
    cyberpunk: { nome: "Escolta orbital", texto: "Levar a carga até o elevador espacial sem abrir o contêiner.", recompensa: "12.500 ¢", contratante: "Kiroshi Logística", codigo: "#C-118" }
  },
  aviso: {
    classico: { titulo: "Édito do Barão", subtitulo: "aviso a todos", texto: "Fica proibido o porte de armas de fogo dentro dos muros após o toque de recolher.", recompensa: "20 Florins", recRotulo: "Multa" },
    moderno: { titulo: "Circular nº 14", nome: "Novo protocolo de evidências", texto: "Todo material apreendido passa pela sala 2 antes do arquivo. Sem exceção.", contratante: "Delegacia do 3º Distrito" },
    cyberpunk: { titulo: "Racionamento", nome: "Distritos 7 a 12", texto: "Sem abastecimento de água até segunda ordem.", contratante: "Prefeitura · Rede Cívica", codigo: "#AV-22" }
  },
  recompensa: {
    classico: { titulo: "Recompensa", nome: "Pela cabeça do Lobo Cinzento", texto: "A fera que ataca os rebanhos do vale. Tragam a cabeça ao capitão da guarda.", recompensa: "150 Florins" },
    moderno: { titulo: "Recompensa", nome: "Cachorro perdido: Pipoca", texto: "Vira-lata caramelo, coleira vermelha. Muito dócil.", recompensa: "R$ 500", contratante: "Falar com Dona Cida, apto 302" },
    cyberpunk: { titulo: "Recompensa", nome: "Dados do servidor Kiroshi", texto: "Torre 3, andar 47. Sem alarmes.", recompensa: "8.000 ¢", codigo: "#R-004", ameaca: 40 }
  },
  evento: {
    classico: { titulo: "Festival das Lanternas", nome: "Na praça do porto", texto: "Ao cair da noite do sétimo dia. Música, vinho e o torneio de arco.", recompensa: "1 Florim", recRotulo: "Entrada" },
    moderno: { titulo: "Churrasco", nome: "Aniversário do Sargento Lima", texto: "Sexta, 19h · terraço. Cada um traz uma coisa.", contratante: "Organização: Ramos" },
    cyberpunk: { titulo: "Rave no Hangar 5", nome: "NOITE NEON", texto: "Sábado, 2h. Sem implantes de gravação.", recompensa: "200 ¢", recRotulo: "Entrada", codigo: "#EV-77" }
  }
};
const ROT = { procurado: "Procurado", desaparecido: "Desaparecido", missao: "Missão", aviso: "Aviso", recompensa: "Recompensa", evento: "Evento" };
const ERA = { classico: "Clássico", moderno: "Moderno", cyberpunk: "Cyberpunk" };
const ICONE_CARTAZ = "icons/sundries/documents/document-torn-diagram-tan.webp";

export const NAUREN_ESCRITOS_MODELOS = [
  /* ---------- Moderno ---------- */
  { seedId: "escrito-moderno-post-it", json: { nome: "Post-it na Geladeira", era: "moderno", formato: "nota", papel: "postit", letra: "manuscrita", pasta: P, icone: "icons/sundries/documents/paper-plain-white.webp",
    descricao: "Modelo de <b>Escrito moderno</b>: post-it com letra manuscrita.", paginas: [{ texto: "Senha do wi-fi do bar: **remo1987**\n\nnão conta pro chefe!!" }] } },
  { seedId: "escrito-moderno-memorando", json: { nome: "Memorando Interno", era: "moderno", formato: "carta", papel: "a4", letra: "sans", pasta: P, icone: "icons/sundries/documents/document-official-capital.webp",
    descricao: "Modelo de <b>Escrito moderno</b>: folha A4 impressa.", paginas: [{ titulo: "Acesso ao arquivo 3", texto: "A partir de hoje, o arquivo 3 só abre com o crachá da diretoria. Quem precisar de algo de lá fala comigo antes.\n\nObrigada pela compreensão.\n\n-> — Marta, Coordenação" }] } },
  { seedId: "escrito-moderno-caderno", json: { nome: "Caderno da Lia", era: "moderno", formato: "diario", papel: "pautado", letra: "manuscrita", quemEscreve: "dono", pasta: P, icone: "icons/sundries/books/book-red-exclamation.webp",
    capa: { titulo: "Caderno da Lia", subtitulo: "não leia!!", cor: "#2d3a5a", detalhe: "#e6e7ee" },
    descricao: "Modelo de <b>Escrito moderno</b>: caderno pautado em que o dono escreve.", paginas: [{ titulo: "12 de março", texto: "Hoje choveu o dia inteiro e o metrô parou duas vezes.\n\nVi de novo o homem de capa cinza na estação central. Ele olhou direto pra mim.\n\nAmanhã vou pelo outro caminho." }, { texto: "" }] } },
  { seedId: "escrito-moderno-cracha", json: { nome: "Crachá do Detetive", era: "moderno", formato: "pergaminho", papel: "cartao", letra: "maquina", pasta: P, icone: "icons/sundries/documents/document-symbol-eye.webp",
    descricao: "Modelo de <b>Escrito moderno</b>: o formato Pergaminho vira <b>Ficha</b> na era Moderna.", paginas: [{ titulo: "Detetive R. Ramos", texto: "3º Distrito Policial · Divisão de Homicídios\n\nMatrícula 44.817-2" }] } },
  { seedId: "escrito-moderno-celular", json: { nome: "Celular da Mira", era: "moderno", formato: "mensagens", pasta: P, icone: "icons/tools/scribal/lens-blue.webp",
    descricao: "Modelo de <b>Mensagens</b>: o Mestre revela uma mensagem por vez (\"Mandar a próxima\" no rodapé do leitor).",
    mensagens: { contato: "Kael", status: "visto por último às 23:58", tema: "claro", aosPoucos: true, lista: [
      { data: "ontem" }, { lado: "outro", hora: "22:41", texto: "Você ainda tá com a chave do galpão?" }, { lado: "eu", hora: "22:43", texto: "Tô. Por quê?" },
      { lado: "outro", hora: "23:57", texto: "Não vai lá hoje. **Eles sabem.**" }, { data: "hoje" }, { lado: "eu", hora: "00:10", texto: "Quem são \"eles\"?" }, { lado: "outro", hora: "00:12", texto: "Apaga essa conversa." }] } } },
  /* ---------- Cyberpunk ---------- */
  { seedId: "escrito-cyber-nota-holografica", json: { nome: "Nota Holográfica", era: "cyberpunk", formato: "nota", papel: "holograma", letra: "mono", pasta: P, icone: "icons/magic/light/orb-lightbulb-gray.webp",
    efeitos: { varredura: true, digitacao: true }, descricao: "Modelo de <b>Escrito cyberpunk</b>: holograma com varredura e texto sendo digitado.",
    paginas: [{ titulo: "NOTA // PRIVADA", texto: "Lembrete: o implante de visão vence em 2 dias. Clínica da Viela 6, falar com a Dra. Ishi." }] } },
  { seedId: "escrito-cyber-terminal-trancado", json: { nome: "mensagem.dat", era: "cyberpunk", formato: "terminal", pasta: P, icone: "icons/tools/scribal/magnifying-glass.webp",
    efeitos: { varredura: true, digitacao: true, falha: true },
    descricao: "Modelo de <b>Terminal criptografado</b>. <section class=\"secret\"><p>Mestre: a senha é <b>aurora</b> (dica: o nome do navio).</p></section>",
    terminal: { caminho: "//terminal/docas-9 — mensagem.dat", comando: "abrir mensagem.dat", senha: "aurora", sal: "nauren-modelo-0116", dica: "o nome do navio", tentativas: 3 },
    paginas: [{ titulo: "DE: ????? // PARA: DOCA 9", texto: "O carregamento sai às 3h.\n\nNinguém fala com o capitão.\n\nSe a sirene tocar, queimem o galpão e saiam pelo esgoto da rua Ferrugem." }] } },
  { seedId: "escrito-cyber-terminal-aberto", json: { nome: "Registro do Sistema", era: "cyberpunk", formato: "terminal", papel: "ambar", pasta: P, icone: "icons/tools/scribal/ink-quill-pink.webp",
    efeitos: { varredura: true, digitacao: true }, descricao: "Modelo de <b>Terminal</b> sem senha, no Painel âmbar.",
    terminal: { caminho: "//torre-3/andar-47/log", comando: "cat registro.log" },
    paginas: [{ texto: "[02:14] porta 47-B aberta (crachá: J. ISHI)\n\n[02:15] câmera 12 offline\n\n[02:31] porta 47-B aberta (crachá: NÃO RECONHECIDO)" }] } },
  { seedId: "escrito-cyber-comunicador", json: { nome: "Comunicador do Vash", era: "cyberpunk", formato: "mensagens", pasta: P, icone: "icons/magic/symbols/runes-triangle-blue.webp",
    descricao: "Modelo de <b>Mensagens</b> no tema Comunicador neon.",
    mensagens: { contato: "FIXER // NOX", status: "canal criptografado", tema: "neon", lista: [
      { lado: "outro", hora: "01:02", texto: "Serviço hoje. Viela 6, entrada dos fundos." }, { lado: "eu", hora: "01:03", texto: "Quanto?" }, { lado: "outro", hora: "01:03", texto: "12k. Metade agora." }, { lado: "outro", hora: "01:04", texto: "Não leva o implante de gravação." }] } } },
  /* ---------- Cartazes (6 tipos × 3 eras) ---------- */
  ...Object.entries(CARTAZES).flatMap(([tipo, eras]) => Object.entries(eras).map(([era, c]) => ({
    seedId: `escrito-cartaz-${tipo}-${era}`,
    json: { nome: `Cartaz: ${ROT[tipo]} (${ERA[era]})`, era, formato: "cartaz", pasta: P, icone: ICONE_CARTAZ, descricao: `Modelo de <b>Cartaz</b> (${ROT[tipo]}, era ${ERA[era]}). Bom para pregar no <b>Quadro de avisos</b>.`, cartaz: { tipo, ...c } }
  })))
];
