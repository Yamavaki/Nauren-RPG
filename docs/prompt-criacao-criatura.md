# Prompt-modelo: criar ou converter uma criatura (Nauren RPG)

Este prompt serve para três saídas. Escolha uma ou mais no pedido:

| Saída | O que a IA entrega | O que anexar |
|---|---|---|
| **A. Foundry** | o JSON do Ator, pronto para importar | `guia-criacao-ia.md` e `icones-foundry.txt` |
| **B. Códex no Docs** | a ficha no estilo do Códex Bestiariun, em texto, para colar num Docs de duas colunas | este arquivo basta |
| **C. Códex na planilha** | a ficha na planilha "Fichas" (Google Sheets ou Excel), igual ao modelo do Apêndice A | este arquivo e o `modelo-ficha-codex.xlsx` (Excel, pasta docs); ou, com o conector do Google Sheets, o link da planilha |

Os números (atributos, Vida, Defesa, dano) seguem **sempre** a Parte 1 deste arquivo, que é o balanceamento do Criador de Monstros do sistema (definido na 0.88, conferido na 0.94.19 sem mudança). As três saídas de uma mesma criatura têm que bater número por número.

**Revisado na 0.94.19:** o `guia-criacao-ia.md` ganhou os modificadores novos (seção 4) e a seção 16 (Bando de lacaios, usos por cena, puxar, investida, escudo, efeitos simples no alvo, imunidade a empurrão, criatura que só age em Prioridade e a animação dos tokens).

Planilha modelo: https://docs.google.com/spreadsheets/d/1rAehdLS7vgaajeYAZzBQ7uD1Au-uYVUqia60AiLfy0s/edit?usp=sharing

Modelo em Excel (Windows): `docs/modelo-ficha-codex.xlsx`, com as abas Modelo, Exemplo Capélia, Exemplo Saiko Fugin, Como usar e Instruções para IA, já com todos os cuidados do Excel aplicados. É o arquivo para mandar a outros mestres.

---

## PROMPT (copie daqui até o fim da seção)

Você vai criar uma criatura para o Nauren RPG. Siga este arquivo à risca: a Parte 1 (balanceamento), a Parte 2 (como as habilidades funcionam) e a parte da saída pedida. Para a saída A, o `guia-criacao-ia.md` anexo é a fonte de verdade de todo campo do JSON.

**Criatura:** [nome, ou descrição livre: tema, aparência, comportamento, região]
**Origem:** [criatura original — ou — conversão fiel da ficha do Códex anexa]
**Nível:** [N, ou faixa "N a M"] · **Função:** [Atacante / Defensor / Suporte] · **Categoria:** [1 a 4] · **Chefe:** [sim/não]
**Pigmentos:** [2 a 5 cores, ou "escolha pelo tema"]
**Saída:** [A / B / C, ou mais de uma]

Trabalhe nesta ordem:

1. **Números.** Calcule tudo pela Parte 1 e mostre a conta numa tabela curta: Valor Base, pontos, tetos da Função, atributos finais, Pigmentos, Poder de Ataque, Poder de Magia, Vitalidade, Espírito, Vida, Defesa, Estamina de Combate, Estresse, Movimento, dado de dano. Numa conversão do Códex, use os números do livro e diga onde eles divergem da conta.
2. **Habilidades.** Escolha a quantidade da Parte 1, coerente com a Função, e para cada uma diga como ela é automatizada (Parte 2). O que não for automatizável fica escrito na descrição, dizendo o que o Mestre faz à mão.
3. **Saída pedida.** Monte a(s) saída(s) A, B e/ou C conforme as seções abaixo.
4. **Conferência.** Rode o checklist da saída (A: seção 8 do guia, e 4.10 se for conversão; B e C: o checklist da Parte 4) e responda item por item.

---

## Parte 1 — Balanceamento (Criador de Monstros, 0.88)

Estas são as regras que o Criador de Monstros do sistema aplica. Os 16 monstros já publicados do Códex não mudam; numa **conversão**, os números do livro valem e só são travados (guia, seção 4.9).

### 1.1 Nível → Valor Base, pontos e limite

| Nível | 1-5 | 6-10 | 11-15 | 16-18 | 19-20 | 21-23 | 24-26 | 27-29 | 30 |
|---|---|---|---|---|---|---|---|---|---|
| Valor Base (`@vb`) | 3 | 4 | 5 | 6 | 10 | 11 | 12 | 13 | 14 |

- **Pontos de atributo** = Valor Base × 5 + Nível.
- **Limite por atributo** = Valor Base + Nível.
- Nenhum atributo fica em 0.

### 1.2 Tetos da faixa (do Códex)

| Faixa | Estamina (atributo) | Poder de Ataque | Defesa |
|---|---|---|---|
| 1-5 | 7 | 6 | 13 |
| 6-10 | 9 | 8 | 14 |
| 11-15 | 12 | 10 | 15 |
| 16-18 | 14 | 12 | 16 |
| 19-20 | 16 | 13 | 20 |
| 21-25 | 17 | 14 | 20 |
| 26-30 | 18 | 15 | 20 |

### 1.3 Função: pesos, teto por atributo e bônus

As três Funções saem diferentes de verdade. Os pontos são distribuídos pelos **pesos**, sem passar do **teto da Função** de cada atributo; o que sobra vai primeiro para os 3 atributos da Função e, se tudo estiver no teto, **se perde**.

**Sempre crescente:** cada nível parte do anterior, e nenhum atributo diminui ao subir de nível. Os pontos novos vão primeiro para os atributos da Função (até a proporção dos pesos daquele nível); os outros atributos só sobem até o valor que vão manter nos níveis seguintes.

| Função | Ordem | Pesos (For / Agi / Est / Int / Des) | Teto = teto de Estamina da faixa × (For / Agi / Est / Int / Des) |
|---|---|---|---|
| **Atacante** | Agi, Est, For | 2 / 3 / 2,5 / 1 / 1 | 0,85 / 1,15 / 1 / 0,55 / 0,5 |
| **Defensor** | For, Est, Agi | 3 / 1,5 / 3 / 1 / 1 | 1,3 / 0,7 / 1 / 0,5 / 0,55 |
| **Suporte** | Int, Est, Des | 1,5 / 1 / 2,5 / 3 / 2 | 0,65 / 0,55 / 0,9 / 1,2 / 1 |

- O teto de cada atributo é arredondado, nunca passa do Limite por atributo (1.1) e nunca fica abaixo de 2.
- **Bônus de Função** (soma por cima do teto): +1 (nível 1-5), +2 (6-15), +3 (16-20), +4 (21-30), em Agilidade (Atacante), Força e Estamina (Defensor), Inteligência e Destino (Suporte).
- **Extras:** Atacante +1 no teto de Poder de Ataque · Defensor +1 Defesa · Suporte +1 no teto de Poder de Magia (o teto de Poder de Magia é o mesmo do Poder de Ataque).
- **Pigmentos passam de qualquer teto:** atributos, Poder de Ataque, Poder de Magia e Defesa são cortados no teto **antes** do Pigmento; o que o Pigmento dá entra por cima.
- O Poder de Ataque usa o **maior** entre Força e Agilidade: (maior + Estamina) ÷ 2. Poder de Magia = (Int + Est) ÷ 2. Vitalidade = (For + Est) ÷ 2. Espírito = Int + Des. Tudo arredondado para baixo.

**Referência pronta** (Categoria 1, sem Pigmento e sem Chefe; atributos já com o bônus de Função). Use para conferir a sua conta:

| Nível | Função | Pontos | Atributos For/Agi/Est/Int/Des | PdA | PdM | Vit | Esp | Defesa | Vida (Cat. 1) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Atacante | 16 | 4/5/4/3/1 | 4 | 3 | 4 | 4 | 13 | 12 |
| 1 | Defensor | 16 | 5/4/5/3/1 | 5 | 4 | 5 | 4 | 14 | 15 |
| 1 | Suporte | 16 | 3/1/4/5/5 | 3 | 4 | 3 | 10 | 13 | 9 |
| 5 | Atacante | 20 | 4/8/5/3/1 | 6 | 4 | 4 | 4 | 13 | 28 |
| 5 | Defensor | 20 | 8/4/6/3/1 | 6 | 4 | 7 | 4 | 14 | 49 |
| 5 | Suporte | 20 | 3/1/5/8/5 | 4 | 6 | 4 | 13 | 13 | 28 |
| 10 | Atacante | 30 | 6/12/9/3/2 | 9 | 6 | 7 | 5 | 14 | 84 |
| 10 | Defensor | 30 | 14/4/11/3/2 | 8 | 7 | 12 | 5 | 15 | 144 |
| 10 | Suporte | 30 | 4/2/7/13/8 | 5 | 9 | 5 | 21 | 14 | 60 |
| 15 | Atacante | 40 | 8/16/10/4/4 | 11 | 7 | 9 | 8 | 15 | 153 |
| 15 | Defensor | 40 | 17/6/14/4/3 | 10 | 9 | 15 | 7 | 16 | 255 |
| 15 | Suporte | 40 | 5/3/10/16/10 | 7 | 11 | 7 | 26 | 15 | 119 |
| 20 | Atacante | 70 | 14/21/16/9/8 | 14 | 12 | 15 | 17 | 20 | 330 |
| 20 | Defensor | 70 | 24/11/19/8/9 | 13 | 13 | 21 | 17 | 21 | 462 |
| 20 | Suporte | 70 | 10/9/14/22/19 | 12 | 14 | 12 | 41 | 20 | 264 |
| 30 | Atacante | 100 | 15/25/18/10/9 | 16 | 14 | 16 | 19 | 20 | 512 |
| 30 | Defensor | 100 | 27/13/22/9/10 | 15 | 15 | 24 | 19 | 21 | 768 |
| 30 | Suporte | 100 | 12/10/16/26/22 | 14 | 16 | 14 | 48 | 20 | 448 |

### 1.4 Categoria

| Categoria | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Dado de dano do golpe principal (`@danoCat`) | 1d6 | 2d8 | 3d10 | 4d12 |
| Metade, para áreas e golpes com efeito forte (`@meioCat`) | 1d6 | 1d8 | 2d10 | 2d12 |
| Estamina extra por ataque (`@estCat`) | +0 | +1 | +2 | +3 |
| Multiplicador de Vida | ×1 | ×2 | ×3 | ×4 |
| Estresse Máximo (2 + Categoria) | 3 | 4 | 5 | 6 |
| Tamanho do token (padrão; o Mestre pode trocar) | 1×1 | 2×2 | 3×3 | 4×4 |

### 1.5 Recursos e números finais

- **Vida** = Vitalidade × Categoria × (Nível + 2), arredondada para baixo. Chefe: × 1,5. NPC comum (não monstro): sem a Categoria. No Foundry: `calculoVida: "customizado"`, `vidaFormula: "@vitalidade * @categoria * (@nivel + 2)"` (Chefe: `... * 1.5`).
- **Defesa** = 10 + Valor Base, cortada no teto da faixa; depois soma Pigmento, +1 Defensor e +1 Chefe.
- **Estamina de Combate** = atributo Estamina. Chefe: + (1 + Estamina extra da Categoria), ou seja, 1 ataque a mais por rodada.
- **Estresse Máximo** = 2 + Categoria (NPC comum: 3). Sem extra de Função nem de Chefe.
- **Movimento** = 6 (decisão de mesa). Só muda se a criatura for claramente rápida, voadora ou aquática.
- **Mana** = Espírito (+ Pigmento). **Dados de Destino** = Destino.
- **Pigmentos:** 2 ou mais, sempre (Vermelho +1 PdA ou +1 PdM · Azul +2 Espírito · Verde +1 Vitalidade · Roxo +1 no menor atributo · Preto +1 Estresse Máximo · Branco +1 num meta-atributo · Rosa +1 Movimento · Dourado +1 Destino). Some antes de calcular Vida e Mana.

| Nível | 1-5 | 6-10 | 11-15 | 16-20 | 21-25 | 26-30 |
|---|---|---|---|---|---|---|
| Habilidades (Chefe +1) | 4 | 5 | 6 | 7 | 8 | 9 |
| Peculiaridades | 1 | 2 | 3 | 3 | 4 | 4 |

- **Grupo indicado:** jogadores de nível Nível do inimigo ÷ 2 (combate quase sempre mortal). Chefe é para ser difícil.
- **XP por criatura derrotada:** (Nível ÷ 2) × 100, para baixo.
- **Checagem de dano por rodada:** (média do dado da Categoria + PdA) × (Estamina de Combate ÷ custo do ataque). Compare com a Vida dos jogadores do grupo indicado.

### 1.6 Peculiaridades do Códex

| Peculiaridade | Efeito | Como automatizar |
|---|---|---|
| Envenenador N | N acúmulos de Envenenamento ao acertar | `condicoesAplicadas` na Ação de ataque |
| Lacerador N | N acúmulos de Sangramento ao acertar | idem |
| Assustador N | Amedrontado N ao acertar | idem |
| Enlouquecedor N | Loucura N ao acertar | idem |
| Atropelador N | N de dano direto nos inimigos colados ao alvo | `usaAtropelador`, `atropeladorQuantidade`, `atropeladorRaio: "1"` |
| Imparável N | causa N mesmo se o alvo Bloquear | `imparavelQuantidade` |
| Bando N | +N no ataque por aliado a até 6 m | `ataqueBonusExtra: "N*@aliados_6m"` (não confundir com o **Bando de lacaios**, guia 16.1) |
| Alcance N | +N m em todos os golpes | Efeito Vinculado `alcanceBonus` |
| Espreitador N | N m de movimento por turno sem gerar Prioridade | `movimentoSemPrioridadeMetros: "N"` |
| Vigilante | nunca é pego de surpresa | Gatilho `inicioCombate` com +1 `estaminaCombate` |
| Ponto fraco N | +N na Defesa só contra quem mirar o ponto; efeito próprio se acertar | regra de mesa, só descrita (item "Ponto Fraco") |

---

## Parte 2 — Como as habilidades funcionam (para automatizar tudo)

**Antes de inventar, procure no compêndio "Nauren - Habilidades de Monstros"** (~500 prontas, por família: Ataques Naturais, Sopros e Cones, Jatos e Linhas, Explosões em Ponto, Ondas ao Redor de Si, Projéteis e Raios, Auras, Áreas Persistentes, Defesas Reativas, Reações, Movimento, Apoio e Cura, Chefes e Vilões). Elas já escalam pela Categoria. Uma habilidade nova segue o mesmo padrão.

### 2.1 Regras que valem para toda habilidade

- **Dano escala pela criatura:** golpe principal `@danoCat+@poderAtaque`; área ou golpe com efeito forte `@meioCat` (+ PdA se for golpe de arma); valores fixos pequenos `@vb` ou `@vb-1`. Custo: `custoEstamina` (1 ou 2) + `custoEstaminaPorCategoria: true` para somar a Estamina extra da Categoria.
- **Ataque × Ação Anunciada:** contra 1 alvo é ataque (`ehAtaque: true`, 1d20 + PdA/PdM contra a Defesa; o alvo reage com Bloquear, Esquivar ou Contra-Atacar). Área sem teste é **Ação Anunciada**: o dano vai direto, um dado só para todos, e cada alvo pode usar a própria Prioridade para não receber nada.
- **Não existe teste de resistência** nem "o alvo testa". Para dar chance de evitar: `perguntarParaEvitar` + custo (o alvo paga Estamina, Estresse etc.).
- **Só existe dano e dano verdadeiro.** Fogo, gelo, ácido são o nome, a animação e a Condição que aplica.
- **Prioridade:** toda ação contra um alvo dá Prioridade a ele; ação feita em Prioridade não gera outra; ação que só fortalece aliado dá Prioridade a 1 aliado.
- **Distâncias em metros inteiros.** Corpo a corpo = 1 m. Lança e alcance contam como corpo a corpo.
- **Nomes que animam:** nome específico com a arma natural e o elemento ("Mordida Venenosa", "Sopro de Gelo"), nunca só "Ataque". Áreas sempre com `usaTemplate` + `templateTipo` + `templateTamanho`.
- **Monstro gasta toda a Estamina que sobra no fim da rodada**, então chefe não precisa de recurso extra (nada de ações lendárias).

### 2.2 Cardápio: ideia → como automatizar

| Ideia de habilidade | Como fazer no Foundry | Guia |
|---|---|---|
| Golpe básico (mordida, garra, pancada) | Ação `ehAtaque`, `danos: "@danoCat+@poderAtaque"`, `alcance: "1m"`, `tipoAlcance: "corpoACorpo"` | 6 |
| Golpe que aplica Condição | `condicoesAplicadas` (uuid ou `self:Nome`, `acumulos`, `soSeAcertar`) | 6, 11 |
| Sopro / cone, jato / linha, explosão / raio | `modoAlvo: "area"`, `usaTemplate`, `templateTipo: "cone"|"ray"|"circle"`, `areaDisposicao: "inimigos"`, `areaExcluirEu` | 6, 13 |
| Onda ao redor de si | template `circle` centrado em si + `areaExcluirEu: true` | 13 |
| Área que fica no mapa (poça, espinhos, névoa) | `usaTemplatePersistente`, duração, evento periódico, efeito, `templatePersistenteResistirEstamina` | 9.5, 13 |
| Aura (dano, cura, Condição em volta) | `usaEmanacao`, `emanacaoRaio`, `emanacaoEfeito`, `emanacaoDisposicao`; variantes por Condição do dono | 9, 8j |
| Regeneração / efeito no início da rodada | Gatilho `inicioRodada`/`inicioTurno` + `usaUsosPassiva` (ex.: 3 por combate) | 7 |
| Espinhos / revide ao ser atingido | Gatilho `euSofriDano` com `danoNoAtacante`; `filtroAlcanceAtaque: "corpoACorpo"` | 7, 8d |
| Pele que resiste a magia ou a armas | `ataqueRecebidoFormula` + `ataqueRecebidoSoOrigem` | 8j |
| Imune a Condições | `imunidadesCondicoes: ["Sangramento", "self:X"]` | 8c |
| Agarrar / prender | Condição Preso/Agarrado + `origemAfastaMetros: 1` + `arrastarComOrigem` | 8e |
| Engolir | Condição Engolido (`origemCaiRemove`, `arrastarComOrigem`, dano `@meioCat` por rodada) | 8e |
| Drenar vida | `periodicoCuraOrigem` na Condição, ou `usaRoubarRecurso` na Ação | 8e, 6 |
| Investida, empurrão | `usaEmpurrar` + `empurrarMetros` | 6 |
| Vários ataques numa ação | `usaMultiplosAtaques` + `quantidadeAtaques` | 6 |
| Dano extra em alvo com Condição | `bonusDanoPorAcumuloUuid`, `danoMaximoSeAlvoCondicaoNome`, `@alvoAcumulos` | 13, 8j |
| Executar alvo fraco | `limiarExecucaoFormula` | 8d |
| Dano mesmo errando | `danoNoErroFormula` | 8d |
| Exige alvo marcado | `usaCondicaoAlvo` + `exigirCondicaoAlvo` | 8d |
| Movimento sem dar Prioridade (bote, recuo) | `movimentoSemPrioridadeMetros` | 8e |
| Voo | Condição com `vooCusto` | 13 |
| Proteger aliado / desviar o golpe | `reacaoPreAtaque: "proteger"|"escudoVivo"|"desviar"|"dificuldade"` | 8g |
| Dividir o dano com um vinculado | `dividirDanoPercentual` + `dividirDanoCondicaoUuid` | 8g |
| Chamar lacaios, ninhada, cisão | `usaInvocar`, `invocarAtorUuid`, `invocarQuantidade`, `invocarCopiaDeMim`, `invocarDividirVida` | 8f |
| Rede, teia, parede | Entidade de campo: `entidadeNoAlvo`, `entidadeSeguraCondicoes`, `entidadeBloqueia`, `entidadeVida` | 8f, 8k |
| Calar magia, impedir ataques, tirar Prioridade | Condição com `travaAcoesMana`, `travaAtaques`, `naoRecebePrioridade` (Emudecido, Hesitante) | 8f |
| Fúria à metade da Vida | Gatilho `metadeVida` com `condicaoEmMim` | 7 |
| Segunda vida, explosão ao morrer | Gatilho `vidaZerou` (`recurso: "vida"` ou `oferecerAcaoDesteItem`), `limiteUsos: "1"`, `limiteEscopo: "cena"` | 8c |
| Resistir a uma Condição recebida | Gatilho `euRecebiCondicao` + `removerCondicaoRecebida` | 8j |
| Raio sustentado | `sustentarPorTurno` + custo + incremento | 13 |
| Dano que salta | `cadeiaCondicaoUuid` + `cadeiaCondicaoRaio` | 13 |
| Barra própria (Pressão, Cabeças) | `recursosDeclarados` | 10 |
| Perjúrio do Acaso | Ação com `consomePerjurio: true`, efeito forte e temático | 4.7 |
| Grupo de lacaios que age como um (Bando) | `flags.nauren.bando`, token não vinculado, Vida `/ N`, dano e custo com `@bandoNoAlcance` | 16.1 |
| Habilidade com N usos por cena/rodada | `usaUsos`, `usosMax`, `usosAtual`, `usosReset` | 16.2 |
| Puxar o alvo, dano ao bater na parede | `empurrarDirecao: "puxar"`, `empurrarColisaoDano` | 16.2 |
| Investida (move antes do golpe), salto | `usaMoverEscolhendo`, `moverMomento: "antes"` | 16.2 |
| Escudo de Vida em si ou no aliado | `usaEscudo`, `escudoFormula`, `escudoNoAlvo` | 16.2 |
| Drenar Estamina/Mana no acerto | `efeitosNoAlvo` com `tipo: "recurso"` e fórmula negativa | 16.2 |
| Não pode ser empurrado | `imuneMovimentoForcado: true` numa Habilidade passiva | 16.3 |
| Servo que só age quando recebe Prioridade | `system.soAgeEmPrioridade: true` | 16.3 |
| Dano extra recebido / cura cortada / redução % | modificadores `danoRecebido`, `curaRecebidaPercentual`, `reducaoDanoPercentual`, `reducaoDanoAtaque` | 4 |

**Condições prontas** (use antes de criar uma nova): Sangramento, Envenenamento, Preso/Agarrado, Cego, Amedrontado, Loucura, Caído, Atordoado, Queimando, Congelando, Lerdeza, Eletrizado, Corroído, Esgotado, Emudecido, Provocado, Debilitado, Exposto, Hesitante, Engolido, Sufocando, Infestado, Putrefato, Fascinado (guia 4.6 e 8b). Condição nova fica dentro da ficha, referida por `self:Nome`.

**O que não automatiza** (fica na descrição, dizendo o que o Mestre faz): Ponto Fraco, efeitos narrativos (mudar o terreno, enganar, conversar), escolhas que dependem de julgamento.

---

## Parte 3 — Saídas

### Saída A — JSON do Foundry

Siga o `guia-criacao-ia.md` em 3 etapas separadas.

**Etapa 1 — o Ator (`type: "npc"`)** com todos os itens embutidos:
- Atributos da Parte 1; `system.nivel`, `system.categoriaMonstro`; `prototypeToken` com `width`/`height` da Categoria quando > 1.
- Vida: `calculoVida: "customizado"` com a fórmula da 1.5. Numa conversão do Códex, trave os números do livro (`vidaFormula` com o número; PdA, PdM, Espírito e Estresse por `efeitosVinculados` com `"="` numa Habilidade "Estatísticas Originais").
- Tetos de PdA/PdM que cortam o valor bruto e o Estresse 2 + Categoria vão num item "Ajustes do Criador" (`efeitosVinculados`). Defesa e Movimento direto em `system`.
- `.value` = `.max` em Vida, Mana, Estamina de Combate e Dados de Destino (nada nasce em 0).
- `flags.nauren.criadorMonstro = { "funcao": "Atacante", "chefe": false, "versao": 2 }`, para o Criador reconhecer a ficha.
- 2 ou mais Pigmentos (itens `"cor"`, guia 4.8).
- Itens obrigatórios: uma Habilidade por Peculiaridade ("Peculiaridade: Nome N"), "Ponto Fraco", "Dar Prioridade", "Perjúrio do Acaso: <efeito>", "Categoria N".
- `system.notas` em 5 partes: Descrição, Como luta, História/Origem, Dicas para o Mestre, Plano de luta (rodada a rodada, quando usar o Perjúrio, como o Ponto Fraco entra).
- Ícones `.webp` copiados exatamente do `icones-foundry.txt`, sem repetir.
- Cada habilidade automatizada pela Parte 2; o que ficar manual, escrito na descrição.
- Animação do token (`motionUsuario`, `motionAlvo`, `motion` nas Condições): deixe `"auto"`, a não ser que a ideia peça outra (guia 16.4).

**Etapa 2 — Condições novas, só se precisar.** Para cada uma: pra que serve, se tem acúmulos e/ou rank, o JSON (`"system.ativo": false`, `"flags": {"nauren": {"modelo": true}}`) dentro do `items` do mesmo Ator, e a conferência de que cada `self:Nome` bate com o `name` do modelo.

**Etapa 3 — Checklist** da seção 8 do guia (e 4.10 numa conversão), item por item. O JSON de animações só se o usuário pedir (`guia-animacoes-ia.md`).

### Saída B — Ficha do Códex no Docs

A ficha do Docs é a mesma da planilha (Apêndice A), colada num Docs com **duas colunas** (Formatar → Colunas). Escreva em texto, nesta ordem, uma linha por item:

```
NOME DA CRIATURA                                  ● ● (círculos das cores dos Pigmentos)

Pontos de vida: N                                 Peculiaridade N
Defesa: N                                         Peculiaridade N
Movimento: N m
Estresse Máx: N
Nível: N a N
Categoria: N a N                                  Ponto fraco: N

For: N*    Est: N    Pda: N    Pdm: N
Agi: N     Int: N    Vit: N    Esp: N
Dest: N

Nome da peculiaridade: descrição.

Nome da ação (N Est)
Ataque Básico
Descrição. Dano sempre como dado + número (1d6+4).

Nome da ação (N mana)
Habilidade especial
Descrição.

Nome da ação (N Est)
Habilidade especial- Ação anunciada.
Descrição.
```

Regras do texto do Códex:
- **Dano escrito com o número já calculado:** dado da Categoria + PdA (ex.: Categoria 1 com PdA 4 → `1d6+4`). Nada de `@`.
- **Custo** entre parênteses depois do nome: `(1 Est)`, `(2 mana)`; Categoria 2+ já soma a Estamina extra no custo escrito.
- **Tipo** numa linha só: `Ataque Básico`, `Habilidade especial` ou `Habilidade especial- Ação anunciada.`
- **Asterisco** só no atributo principal, o que cresce com o nível (pelo Criador: Agilidade no Atacante, Força no Defensor, Inteligência no Suporte).
- **Nível e Categoria em faixa** (`Nível: 1 a 5`), com os números calculados no nível mínimo da faixa.
- **Pontos de vida:** o valor no nível mínimo da faixa, pela fórmula da 1.5.
- **Peculiaridades com valor** (Envenenador 2, Bando 1) na coluna da direita; as passivas com texto (Regeneração, Choque estático) no bloco de peculiaridades.
- Estilo do Códex: frases curtas, presente, terceira pessoa ("Realiza um ataque contra um alvo a 1m. Em um acerto o alvo sofre 1d6+4 de dano.").
- Formatação: fonte Georgia; vinho `#5B0709`, bege `#E5DACF`, rótulos em marrom `#966433` e negrito.

### Saída C — Ficha do Códex na planilha

**No Excel**, parta do `modelo-ficha-codex.xlsx`: copie a aba Modelo para uma aba nova com o nome da criatura e siga a aba "Instruções para IA" do próprio arquivo (uma linha por ação, contorno preto, `xml:space="preserve"` nas quebras de linha, alturas em pontos). No Google Sheets, siga o Apêndice A.

Siga o **Apêndice A** à risca (estrutura de células, formatação por trechos, alturas de linha e a forma de criar a aba). Se não tiver acesso à planilha, entregue o texto da Saída B na mesma ordem das células, para o usuário colar.

A planilha original é distribuída **só para leitura** (só o autor edita). Se não conseguir editá-la, não insista: pergunte ao mestre se ele quer (1) uma **cópia no Google Sheets dele** (Drive `copy_file`, ou ele mesmo usa Arquivo > Fazer uma cópia e manda o link) ou (2) um **arquivo do Excel**. No Excel, siga a seção "CUIDADOS NO EXCEL DA MICROSOFT" do Apêndice A: fundo vinho também nas células dos círculos (cada regra de formatação condicional define fonte **e** preenchimento), quebras de linha gravadas com `xml:space="preserve"` (senão o Excel junta o texto todo numa linha), contorno preto em volta da ficha e entre as seções, **uma linha da planilha por ação** (o Excel limita cada linha a 409 pt), alturas em pontos com folga e conferência renderizada. Sem isso os círculos ficam com fundo branco, o texto sai colado e cortado e o contorno some.

---

## Parte 4 — Checklist das saídas B e C

- [ ] Os números batem com a Parte 1 (ou com o livro, numa conversão) e com a Saída A, se ela também foi feita.
- [ ] Quantidade de habilidades e Peculiaridades da tabela 1.5 (Chefe +1 habilidade).
- [ ] Todo dano em dado + número; todo custo entre parênteses; todo tipo numa das três formas.
- [ ] Asterisco só no atributo principal; Pigmentos (2 ou mais) marcados.
- [ ] Ponto fraco preenchido (ou "—" se não tiver).
- [ ] Nenhum texto do modelo sobrou (N, "Nome da peculiaridade", "Descreva o efeito").
- [ ] Nenhum tipo de dano, teste de resistência ou nome de outro sistema.

---

## Apêndice A — Modelo da planilha "Fichas" (copiado exatamente)

Este é o conteúdo da planilha modelo, aba por aba, como está no original. Quando o usuário pedir a ficha **na planilha** (Google Sheets ou Excel), monte exatamente esta estrutura. A ficha (colunas A a G) é depois copiada e colada num Docs de duas colunas, onde fica igual ao Códex.

A planilha já está alinhada com este arquivo (aba "Instruções para IA", seção BALANCEAMENTO): os números seguem a Parte 1, Movimento 6, Pontos de vida e Defesa no nível mínimo da faixa. A aba "Exemplo Capélia" é uma conversão do Códex e mantém os números do livro.

```text
## Sheet name: Instruções para IA
Instruções para criar fichas novas com IA
"Copie o texto da seção PROMPT PRONTO e cole numa conversa com uma IA que tenha acesso a esta planilha pelo conector do Google Sheets, anexando o prompt-criacao-criatura.md (pasta docs do sistema Nauren, versão 0.88.1 ou mais nova). Preencha os campos entre colchetes. As seções seguintes explicam o balanceamento e a estrutura da aba Modelo, e a IA deve lê-las."
PROMPT PRONTO
"Crie uma ficha de criatura para o Nauren RPG na planilha Fichas (Google Sheets), usando a aba Modelo como base.

Criatura: [nome, ou descrição livre com tema, aparência, comportamento e região]
Origem: [criatura original, ou conversão fiel da ficha do Códex anexa]
Nível: [N, ou faixa ""N a M""]   Função: [Atacante, Defensor ou Suporte]   Categoria: [1 a 4]   Chefe: [sim ou não]
Pigmentos: [de 2 a 5 cores, ou ""escolha pelo tema""]

Siga estas regras:
1. Leia primeiro a aba ""Instruções para IA"" desta planilha e use exatamente a estrutura de células e a formatação descritas nela.
2. Duplique a aba Modelo, renomeie a cópia com o nome da criatura e preencha só a cópia. Nunca edite as abas Modelo e Exemplo Capélia. Se não tiver permissão para editar esta planilha (ela é distribuída só para leitura), siga a seção ""SE A PLANILHA FOR SÓ LEITURA"": faça uma cópia no Google Sheets do mestre ou um arquivo do Excel, como ele preferir.
3. Os números seguem a Parte 1 (balanceamento do Criador de Monstros) do prompt-criacao-criatura.md anexo, já somando os Pigmentos. Antes de preencher, mostre a conta numa tabela curta: Valor Base, atributos, Pda, Pdm, Vit, Esp, Pontos de vida, Defesa, Estresse, Movimento e dado de dano.
4. As habilidades seguem a Parte 2 do mesmo arquivo: quantidade pelo nível, coerentes com a Função, sem tipos de dano e sem teste de resistência.
5. Escreva no estilo do Códex Nauren. O dano das ações aparece sempre como dado mais o número já calculado (por exemplo 1d6+4, com o dado da Categoria e o Pda).
6. Ao terminar, leia a aba de volta para conferir e me entregue o link da ficha com um resumo dos números."
BALANCEAMENTO (resumo da Parte 1 do prompt-criacao-criatura.md)
Valor Base pelo nível: 1-5: 3 · 6-10: 4 · 11-15: 5 · 16-18: 6 · 19-20: 10 · 21-23: 11 · 24-26: 12 · 27-29: 13 · 30: 14. Pontos de atributo = Valor Base × 5 + Nível. Limite por atributo = Valor Base + Nível.
Tetos por faixa (Estamina / Pda / Defesa): 1-5: 7/6/13 · 6-10: 9/8/14 · 11-15: 12/10/15 · 16-18: 14/12/16 · 19-20: 16/13/20 · 21-25: 17/14/20 · 26-30: 18/15/20.
"Função: Atacante lidera Agilidade, Defensor lidera Força e Estamina, Suporte lidera Inteligência e Destino. Os pesos, os tetos de cada atributo por Função e o bônus de Função estão na Parte 1.3 do prompt, com uma tabela pronta por nível para conferir. Atacante +1 no teto de Pda; Defensor +1 Defesa; Suporte +1 no teto de Pdm. Os Pigmentos somam por cima de qualquer teto."
"Pontos de vida = Vitalidade × Categoria × (Nível + 2), no nível mínimo da faixa (Chefe × 1,5). Defesa = 10 + Valor Base até o teto da faixa. Movimento = 6 m (só muda se a criatura for claramente rápida, voadora ou aquática). Estresse Máx = 2 + Categoria."
Categoria 1 / 2 / 3 / 4: dado de dano 1d6 / 2d8 / 3d10 / 4d12; Estamina extra por ataque +0 / +1 / +2 / +3 (já somada no custo escrito da ação); Vida ×1 / ×2 / ×3 / ×4.
"Habilidades por nível (Chefe +1): 4 (1-5), 5 (6-10), 6 (11-15), 7 (16-20), 8 (21-25), 9 (26-30). Peculiaridades com valor: 1 / 2 / 3 / 3 / 4 / 4. Pigmentos: 2 ou mais, sempre."
"Conversão de uma ficha do Códex: os números do livro valem como estão (a Exemplo Capélia é uma conversão e usa os números do livro, não a fórmula acima)."
ESTRUTURA DA ABA MODELO
Cada ficha é uma aba. As colunas A a G formam a ficha que vai para o Docs. As colunas H a N são um painel de apoio e não vão para o Docs.
"A1 (mesclada com B1): nome da criatura, em texto simples."
"J1:N1: seletores de pigmento. Valores aceitos: Nenhum, Vermelho, Azul, Verde, Roxo, Preto, Branco, Rosa, Dourado. Preencha da direita para a esquerda: o primeiro pigmento em N1, o segundo em M1, e assim por diante. Deixe vazio ou Nenhum o que não for usar. Os círculos em C1:G1 são fórmulas que leem esses seletores, então não grave nada em C1:G1."
"A2 (dados, lado esquerdo): seis linhas, nesta ordem: Pontos de vida, Defesa, Movimento, Estresse Máx, Nível, Categoria. Cada linha no formato Rótulo: valor. Exemplos: Movimento: 6m, natação; Nível: 1 a 5; Categoria: 1 a 2. Pontos de vida e Defesa são os do nível mínimo da faixa."
"C2 (dados, lado direito, alinhado à direita): seis linhas. Linhas 1 e 2: peculiaridades com valor, no formato Nome valor (Envenenador 2). Linhas 3, 4 e 5: em branco. Linha 6: Ponto fraco: valor. Sem peculiaridade com valor, deixe as linhas 1 e 2 em branco."
"A3, B3, D3 e F3 (atributos): A3 tem For, Agi e Dest; B3 tem Est e Int; D3 tem Pda e Vit; F3 tem Pdm e Esp. Uma linha por atributo, no formato Rótulo: valor. O asterisco (For: 5*) marca só o atributo principal, o que cresce com o nível (pelo Criador: Agi no Atacante, For no Defensor, Int no Suporte); nos outros não vai nada."
"A4 (peculiaridades passivas): uma por linha, no formato Nome: descrição. O modelo traz três; apague as que sobrarem."
"A5 (ações): três linhas por ação, nesta ordem: nome com o custo entre parênteses (1 Est, 2 mana, 1 estamina), tipo, descrição. Tipos aceitos: Ataque Básico; Habilidade especial; Habilidade especial- Ação anunciada. O modelo traz quatro ações; apague as que sobrarem ou acrescente até a quantidade do nível."
FORMATAÇÃO DO TEXTO (obrigatória)
"Os blocos usam formatação por trechos dentro da mesma célula. Grave com updateCells, nos campos userEnteredValue e textFormatRuns. Nunca use update_values nessas células, porque ele apaga a formatação."
"A célula já vem em Georgia 10. Cor dos rótulos: marrom #966433 (red 0.5882, green 0.3922, blue 0.2). Cor dos valores e descrições: preto."
"Dados (A2 e C2): rótulo em negrito marrom, valor em preto sem negrito. Ficam em negrito o valor de Pontos de vida e os valores da coluna da direita."
"Atributos: rótulo em negrito marrom, valor em marrom sem negrito."
"Peculiaridades: o Nome: em negrito marrom e a descrição em preto sem negrito. Ações: nome em negrito marrom, tipo em negrito e itálico marrom, descrição em preto sem negrito."
"Respiros: entre dois itens da mesma célula há uma linha em branco de fonte pequena. Escreva duas quebras de linha entre os itens e dê à segunda quebra um trecho com fontSize menor: 5 nos dados e atributos, 7 entre peculiaridades, 4 entre nome, tipo e descrição de uma ação, 8 entre uma ação e a seguinte. Os demais trechos usam fontSize 10."
"Em C2, as linhas em branco do meio também recebem os respiros. A coluna da direita tem sempre seis linhas e cinco respiros, igual à da esquerda, para o Ponto fraco ficar alinhado com a Categoria."
"Em todos os trechos, defina bold, italic, fontSize e a cor, para nada herdar a formatação do trecho anterior."
ALTURA DAS LINHAS
"As células são mescladas, então a altura não se ajusta sozinha. Linha 1: 60. Linha 2: 142. Linha 3: 70. Linha 4: cerca de 16 pixels por linha de texto, mais 10 por respiro e 6 de margem. Linha 5: cerca de 16 por linha de texto, mais 6 por respiro pequeno, 10 por respiro grande e 6 de margem. Confira que nenhum texto ficou cortado."
COMO CRIAR A ABA
"1. duplicateSheet a partir da aba Modelo, com o nome da criatura e insertSheetIndex no fim das abas."
"2. Na cópia, apague o conteúdo de I2 (a nota da aba Modelo)."
"3. Preencha J1:N1, A1, A2, C2, A3, B3, D3, F3, A4 e A5 como descrito acima, e ajuste as alturas das linhas."
"4. Leia A1:G5 de volta. Confirme que não sobrou nenhum texto do modelo (N, Nome da peculiaridade, Descreva o efeito) e que get_values em C1:G1 mostra ● nos pigmentos usados."
OBSERVAÇÕES
"A planilha está em pt-BR: fórmulas usam ponto e vírgula e nomes em português (SE, OU). Regras do sistema: prompt-criacao-criatura.md (Parte 1: balanceamento; Parte 2: habilidades; Parte 3: as saídas Foundry, Docs e planilha) e guia-criacao-ia.md (campos do Foundry), os dois na pasta docs do sistema."
"Para o JSON do Foundry, use o mesmo prompt-criacao-criatura.md (saída A) com o guia-criacao-ia.md, partindo desta ficha: os números têm que bater. Para o texto narrativo do livro, use o Prompt_criacao_criatura_para_livro."
"No Excel (sem o conector do Google): monte o .xlsx com as mesmas abas, células, mesclagens, cores e alturas; os seletores J1:N1 viram validação de dados em lista e os círculos de C1:G1 continuam fórmulas que leem J1:N1."
SE A IA NÃO TIVER ACESSO À PLANILHA
"Peça a ficha em texto, uma linha por item, na mesma ordem das células descritas acima, e cole nas células da aba duplicada. Depois aplique negrito e cor marrom nos rótulos."
SE A PLANILHA FOR SÓ LEITURA (outros mestres)
"Esta planilha é distribuída só para leitura: só o autor edita. Se a IA não conseguir editar (erro de permissão ao duplicar a aba ou ao gravar), não insista: pergunte ao mestre qual cópia ele prefere e siga uma das duas opções abaixo. Nunca tente editar o original."
"1. Cópia no Google Sheets do mestre: com o conector do Google Drive, copie esta planilha (copy_file) para o Drive do mestre com o nome ""Fichas Nauren - <nome do mestre>"" e trabalhe só na cópia, seguindo todas as instruções desta aba. Sem o conector, peça ao mestre para abrir a planilha, usar Arquivo > Fazer uma cópia e mandar o link da cópia. A cópia do Google mantém fórmulas, cores, validação e formatação condicional sem ajuste nenhum."
"2. Arquivo do Excel (.xlsx): monte um arquivo novo com as abas Modelo, Como usar e a ficha da criatura, reproduzindo a aba Modelo célula por célula, com os cuidados da seção seguinte. Entregue o arquivo dizendo que ele foi conferido renderizado."
CUIDADOS NO EXCEL DA MICROSOFT
"Sem ajuste, o Excel mostra o modelo desalinhado: os círculos dos Pigmentos ficam com fundo branco, as quebras de linha somem (o texto fica todo colado), o contorno preto não aparece e textos ficam cortados. Ao montar o .xlsx (ou ao baixar uma cópia como .xlsx), aplique tudo abaixo."
"Mesclagens: A1:B1, A2:B2, C2:G2, B3:C3, D3:E3, F3:G3, A4:G4 e I2:N5, mais A:G em cada linha de ação (A5:G5, A6:G6...). Larguras das colunas (em pixels, como no modelo): A 110, B 100, C a G 42, H 24, I 150, J a N 80. Linhas de grade ocultas."
"Fundos: A1:G1 vinho #5B0709, inclusive as células dos círculos (C1:G1); linhas 3 e 5 bege #E5DACF; linhas 2 e 4 branco; seletores J1:N1 #F3EBE3. Fonte Georgia em tudo: nome da criatura 18 branco, círculos 22, o resto 10."
"Círculos dos Pigmentos: C1:G1 com a fórmula =SE(OU(J1="""";J1=""Nenhum"");"""";""●"") apontando para J1, K1, L1, M1 e N1 (Excel em inglês: =IF(OR(J1="""",J1=""Nenhum""),"""",""●"")). A cor vem de formatação condicional com fórmula (=J1=""Vermelho"" e assim por diante). No Excel, cada regra tem que definir a cor da fonte E o preenchimento vinho #5B0709: uma regra só com a fonte deixa a célula branca. Cores: Vermelho #C24A4A, Azul #579ADD, Verde #34B058, Roxo #794AC2, Preto #111111, Branco #F5F5F5, Rosa #CA5BBF, Dourado #DFB02F."
"Seletores J1:N1: validação de dados em lista (Nenhum, Vermelho, Azul, Verde, Roxo, Preto, Branco, Rosa, Dourado). Uma regra pinta J1:M1 de #F4CCCC quando a célula está preenchida e a da direita está vazia ou em Nenhum. O texto de I1 (""Pigmentos: escolha da direita para a esquerda"") com quebra automática."
"Texto: quebra automática ligada em todas as células com texto; alinhamento no topo (no meio só na linha 1). Rótulos em negrito marrom #966433 por trechos dentro da célula (rich text). Toda quebra de linha que fica num trecho só dela (os respiros) tem que ser gravada com xml:space=""preserve"": sem isso o Excel apaga as quebras e junta tudo numa linha só (""540Defesa: 15Movimento: 7m...""). No openpyxl, depois de salvar, troque <t> por <t xml:space=""preserve""> no XML das abas. O LibreOffice mostra certo mesmo sem isso, então confira o XML."
"Contorno: linha preta fina em volta da ficha inteira (da linha 1 até a última, colunas A a G) e uma linha preta separando as seções: nome, dados, atributos, peculiaridades e ações. Dentro de cada seção não há linhas."
"Ações: o Excel limita cada linha a 409 pt, e uma criatura com muitas ações estoura esse limite numa célula só. Use uma linha da planilha por ação (A5, A6, A7...), cada uma mesclada de A a G, com fundo bege e o mesmo texto (nome, tipo e descrição, com os respiros). Entre as ações não há linha preta: só o contorno em volta do bloco inteiro."
"Alturas (o Excel mede em pontos e o Georgia ocupa mais espaço que no Google): linha 1 com 48 pt, linha 2 com 120 pt, linha 3 com 62 pt. Peculiaridades e cada ação: 13 pt por linha de texto (cerca de 56 caracteres por linha na largura de A a G), 5 pt por respiro e 8 pt de margem, mais 12% de folga. É melhor sobrar espaço do que cortar texto."
"Conferência: renderize o .xlsx (por exemplo, LibreOffice para PDF ou imagem) e confirme que nenhum texto ficou cortado, que os círculos aparecem na cor certa sobre o fundo vinho, que o contorno preto aparece e que a ficha tem a largura do modelo. Confira também no XML que todo <t> tem xml:space=""preserve""."

## Sheet name: Como usar
Como usar o modelo de ficha
"1. A aba Modelo não é preenchida. Para cada criatura nova, clique com o direito na aba Modelo, escolha Duplicar e renomeie com o nome da criatura. Cada ficha fica em uma aba nova neste documento."
"2. Troque os N pelos valores. Selecione só o N e digite por cima: o rótulo em marrom e negrito continua formatado. Se apagar a célula inteira, o rótulo perde a formatação."
"3. Pigmentos: os seletores ficam ao lado da ficha, em J1:N1. Escolha as cores começando pela direita (N1) e seguindo para a esquerda. Cada seletor corresponde ao círculo na mesma posição. São de 0 a 5 cores: escolha Nenhum ou deixe vazio o que não for usar. Uma célula vermelha indica um espaço vazio à direita dela."
4. Atributo principal: mantenha o asterisco só no atributo de destaque (For: 5*) e apague dos outros.
"5. No bloco de dados, as duas primeiras linhas da coluna da direita são para peculiaridades com valor (Envenenador 2) e a última é o Ponto fraco. Mantenha as linhas em branco do meio para o texto ficar alinhado com o da esquerda."
"6. Cada bloco (dados, atributos, peculiaridades, ações) é uma célula só, com uma linha de texto por item. Para editar, dê dois cliques na célula e selecione só o valor. Se o texto não couber, arraste a borda inferior da linha. Ao colar um texto novo, aplique de novo negrito e a cor marrom no nome."
"7. Para levar ao Docs: copie só as colunas A a G da ficha, cole no Docs com duas colunas (Formatar, Colunas) e escolha Colar sem vincular. Confira se os círculos mantiveram as cores."
"8. Recebeu esta planilha só para leitura? Use Arquivo > Fazer uma cópia para ter a sua versão no seu Google Drive, com tudo funcionando. Se baixar como Excel (.xlsx), os círculos dos Pigmentos podem ficar com fundo branco e alguns textos cortados: aumente a altura das linhas e pinte C1:G1 de vinho #5B0709 (detalhes na aba Instruções para IA, seção CUIDADOS NO EXCEL DA MICROSOFT)."
"Cores: vinho #5B0709, bege #E5DACF, marrom dos rótulos #966433. Fonte: Georgia."

## Sheet name: Exemplo Capélia
Capélia,,,,●,●,●,,Pigmentos: escolha da direita para a esquerda,,,Verde,Rosa,Azul
"Pontos de vida: 5

Defesa: 13

Movimento: 7m, natação

Estresse Máx: 3

Nível: 1 a 5

Categoria: 1 a 2",,"Envenenador 2

Ponto fraco: 2",,,,,,"Pigmentos: escolha as cores em J1:N1, começando pela direita (N1).
O círculo aparece na ficha na mesma posição. Nenhum ou vazio fica sem círculo.
Uma célula vermelha em J1:M1 indica um espaço vazio à direita dela.
Para levar ao Docs, copie só as colunas A a G."
"For: 5*

Agi: 4

Dest: 1","Est: 4

Int: 2",,"Pda: 4

Vit: 5",,"Pdm: 3

Esp: 4"
"Regeneração: Capélia no início de cada rodada perde 1 ponto de estresse que tenha recebido e recupera seu nível em pontos de vida. 3x por combate.

Choque estático: Ao receber dano pela primeira vez no combate, ela dispara em 1 metro ao seu redor eletricidade, que causa 1d6 de dano."
"Morder (1 Est)

Ataque Básico

Realiza um ataque contra um alvo a 1m. Em um acerto o alvo sofre 1d6+4 de dano.

Eletrificar (2 mana)

Habilidade especial

Cria raios rosados em seus dentes fazendo com que seu próximo ataque cause 1d6 de dano extra. Mas Capélia recebe 1 ponto de estresse.

Deslizar (1 estamina)

Habilidade especial- Ação anunciada.

Desliza em linha reta por 6 metros derrubando na área de efeito."

## Sheet name: Modelo
Nome da Criatura,,,,,●,●,,Pigmentos: escolha da direita para a esquerda,,,,Azul,Vermelho
"Pontos de vida: N

Defesa: N

Movimento: N m

Estresse Máx: N

Nível: N a N

Categoria: N a N",,"Peculiaridade N

Peculiaridade N

Ponto fraco: N",,,,,,"ABA MODELO. Não preencha aqui.
Para cada criatura: clique com o direito nesta aba, Duplicar, e renomeie.
Cada ficha nova fica em uma aba nova, neste mesmo documento.
Na cópia, apague esta nota.

Pigmentos: escolha as cores em J1:N1, começando pela direita (N1).
O círculo aparece na ficha na mesma posição. Nenhum ou vazio fica sem círculo.
Uma célula vermelha em J1:M1 indica um espaço vazio à direita dela.
Para levar ao Docs, copie só as colunas A a G."
"For: N*

Agi: N

Dest: N","Est: N

Int: N",,"Pda: N

Vit: N",,"Pdm: N

Esp: N"
"Nome da peculiaridade: descreva o efeito aqui.

Nome da peculiaridade: descreva o efeito aqui.

Nome da peculiaridade: descreva o efeito aqui."
"Nome da ação (N Est)

Ataque Básico

Descreva o efeito. O dano aparece sempre como dado mais atributo, por exemplo 1d6+4.

Nome da ação (N mana)

Habilidade especial

Descreva o efeito.

Nome da ação (N estamina)

Habilidade especial- Ação anunciada.

Descreva o efeito.

Nome da ação (N Est)

Habilidade especial

Descreva o efeito."
```
