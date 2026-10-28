# Guia de Referência — Criação de Personagens/NPCs via IA (Nauren RPG)

Este documento é pra ser colado no início de uma conversa com uma IA, junto
da descrição do personagem/monstro que você quer. A IA usa isso pra saber
EXATAMENTE quais campos existem, o que cada um faz, e monta um JSON de Ator
pronto pra importar no Foundry (Ator → botão de importar, ou arrastando o
arquivo `.json` na barra lateral).

Extraído direto do código-fonte do sistema (`nauren.mjs`) — reflete o que o
sistema realmente aceita, não uma versão simplificada.

---

## 1. Como pedir pra IA

Um prompt funcional tem 3 partes:

1. **Este documento colado inteiro** (ou anexado como arquivo).
2. **A descrição livre do personagem/monstro** — narrada como você quiser:
   "um golem de pedra, tanque lento, bate forte mas erra fácil, tem uma
   habilidade que reduz dano recebido em troca de perder Estamina..."
3. **O pedido explícito**: "monte o JSON de Ator completo pra eu importar no
   Foundry, incluindo os itens (Habilidades/Armas/Condições) embutidos".

A IA deve devolver **um único bloco JSON**, pronto pra salvar como `.json` e
importar. Não peça pra ela "explicar" as mecânicas antes — peça o JSON
direto, e você audita depois (a seção 8 tem um checklist rápido).

---

## 2. Estrutura geral de um Ator no Foundry (V13+)

Um arquivo de Ator importável tem este formato de topo (os `...` abaixo são
placeholders ilustrativos, não JSON literal — os exemplos completos e
válidos das seções 3-12 são os que você copia de verdade):

```json
{
  "name": "Golem de Pedra",
  "type": "npc",
  "img": "icons/creatures/golems/golem-stone-gray.webp",
  "system": { ...ver secao 3... },
  "items": [
    { "name": "Ataque de Punho", "type": "arma", "img": "...", "system": {...ver secao 5...} },
    { "name": "Pele de Pedra", "type": "habilidade", "img": "...", "system": {...ver secao 5...} }
  ]
}
```

- `"type"` do Ator: `"npc"` ou `"personagem"` (ambos usam o MESMO schema de
  `system` — a diferença é só qual template a ficha usa pra exibir).
- Todo item que o personagem "tem de cara" (armas, habilidades inatas,
  condições permanentes) entra dentro de `"items"`, cada um com sua própria
  `"system"` conforme o `"type"` dele (ver seção 5).
- `"img"` pode ser qualquer caminho de ícone nativo do Foundry
  (`icons/...`) ou deixado vazio (`""`) se não souber um caminho válido —
  nunca invente um caminho de arquivo que não existe.

---

## 3. Schema completo de `system` do Ator

```json
{
  "nivel": 1,
  "xp": 0,
  "classe": "",
  "atributos": {
    "forca": { "value": 2 },
    "agilidade": { "value": 2 },
    "estamina": { "value": 2 },
    "inteligencia": { "value": 2 },
    "destino": { "value": 2 }
  },
  "defesa": 10,
  "movimento": 9,
  "stress": { "value": 0, "max": 2 },
  "vida": { "value": 0, "max": 0 },
  "mana": { "value": 0, "max": 0 },
  "estaminaCombate": { "value": 0, "max": 0 },
  "dadosDestino": { "value": 0, "max": 0 },
  "calculoVida": "vitalidadeNivel",
  "critMin": 20,
  "critFailMax": 1,
  "limiarDeflexao": 0,
  "reducaoDano": 0,
  "notas": ""
}
```

### Atributos base (livremente escolhidos pela IA conforme a descrição)
`forca`, `agilidade`, `estamina`, `inteligencia`, `destino` — números
inteiros ≥ 0. **Não existe "meta-atributo editável"**: Espírito, Poder de
Ataque, Poder de Magia, Vitalidade são **calculados automaticamente** pelo
Foundry a partir dos atributos base, então a IA **nunca precisa escrevê-los**
— só define `atributos`, e o resto se resolve sozinho ao importar:

- `espirito.max` = inteligência + destino **+ bônus de Pigmento/Efeito no Espírito**
- `vitalidade.max` = piso((força + estamina) / 2) **+ bônus de Pigmento/Efeito na Vitalidade**
- `poderMagia.value` = piso((inteligência + estamina) / 2)
- `poderAtaque.value` = piso((maior entre força/agilidade + estamina) / 2)
- `vida.max`, `mana.max`, `estaminaCombate.max`, `dadosDestino.max` = ver seção 3.1
  logo abaixo — **por padrão** seguem Vitalidade×Nível / Espírito /
  atributo Estamina / atributo Destino, mas os 4 são configuráveis
  numa ficha de NPC.

### 3.1 Cálculo de Recursos — só em fichas de NPC, 100% configurável

**Isto NÃO existe na ficha de um personagem jogável** (fica escondido
de propósito — um jogador sempre usa as fórmulas padrão do Nauren). Só
aparece na aba Opções de um Ator `"type": "npc"`, numa seção dedicada
"Cálculo de Recursos (NPC)".

Cada um dos 4 recursos tem seu próprio par `calculoX`/`xFormula` em
`system`:

| Recurso | Campo do modo | Campo da fórmula | Modos disponíveis |
|---|---|---|---|
| Vida | `calculoVida` | `vidaFormula` | `vitalidadeNivel` (padrão) \| `vitalidade` (sem multiplicar) \| `categoria` (× `categoriaMonstro`) \| `customizado` |
| Mana | `calculoMana` | `manaFormula` | `espirito` (padrão) \| `customizado` |
| Estamina de Combate | `calculoEstaminaCombate` | `estaminaCombateFormula` | `estamina` (padrão) \| `customizado` |
| Dados de Destino | `calculoDadosDestino` | `dadosDestinoFormula` | `destino` (padrão) \| `customizado` |

**`"customizado"` aceita tanto uma fórmula com tokens quanto um número
fixo puro** — são a MESMA coisa, só que "um número fixo" é uma fórmula
sem nenhum `@` nela:

```json
{
  "calculoVida": "customizado",
  "vidaFormula": "900"
}
```

Isso trava a Vida Máxima em exatamente 900, não importa o que
Vitalidade/Nível digam — **é a forma recomendada de bater com o número
exato de uma ficha do Codex quando ele diverge da fórmula geral** (o
que, na prática, é extremamente comum — ver seção 4.9).

Tokens aceitos em cada fórmula: `@vitalidade`, `@espirito`, `@estamina`,
`@destino`, `@categoria`, `@nivel` (qualquer um funciona em qualquer
das 4 fórmulas, mesmo que não seja o token "natural" daquele recurso -
ex: `"vidaFormula": "@estamina * 10"` funciona normalmente).

**`categoriaMonstro`** (número de 1 a 4): **preencha sempre** - aparece no
cabeçalho da ficha (ao lado do Nível), define o tamanho do token e alimenta as
variáveis de escala `@categoria`, `@vb`, `@danoCat`, `@meioCat`, `@estCat`
(seção 3b). Para a Vida, só entra na conta quando
`calculoVida` está em `"categoria"` — Vida = Vitalidade × Categoria ×
Nível **(⚠️ inclui o Nível — não é só Vitalidade × Categoria)**
(Categoria 1→×1, 2→×2, 3→×3, 4→×4, batendo com a Tabela 6 do
documento de balanceamento, seção 4.9, MAS ainda multiplicado pelo
Nível igual a fórmula padrão do sistema — "Categoria" substitui só o
multiplicador de Vitalidade, nunca remove o de Nível). Exemplo: Vitalidade
9, Categoria 4, Nível 15 → Vida = 9 × 4 × 15 = **540**, não 36.

**`estaminaCombate`/`dadosDestino` também podem ser travados via
Efeito Vinculado agora** (`campo: "estaminaCombate"` ou `"dadosDestino"`
com `"="`) — antes desta correção, esses 2 campos específicos eram
silenciosamente ignorados por qualquer Modificador, mesmo que a Ação
parecesse aceitar o campo.

**⚠️ Os Pigmentos (seção 4.8, obrigatórios em toda ficha) SOMAM nesses
cálculos** — Pigmento Verde soma na Vitalidade (logo, em Vida também),
Pigmento Azul soma no Espírito (logo, em Mana também), e assim por
diante. **Sempre calcule o `.max` de Vida/Mana DEPOIS de somar os
Pigmentos escolhidos, nunca só com os atributos crus** — esquecer isso
é o erro mais fácil de cometer aqui (aconteceu no próprio
desenvolvimento deste guia).

### ⚠️ OBRIGATÓRIO: preencher `.value` de todo recurso manualmente

**Importante — isto NÃO é opcional, e o Foundry NÃO faz isso sozinho:**
o motor recalcula `.max` automaticamente (as fórmulas acima, JÁ incluindo
Pigmentos), mas **nunca** toca em `.value` — se você deixar `vida.value:
0` no JSON, a ficha nasce com 0 de Vida atual PRA SEMPRE, mesmo que
`vida.max` calcule pra 20. Isso vale pros 4 recursos: `vida`, `mana`,
`estaminaCombate`, `dadosDestino`.

*(O sistema tem uma rede de segurança: se você OMITIR esses campos
inteiramente, ele preenche sozinho no MÁXIMO calculado só com os
atributos, no momento da importação — mas SEM contar Pigmentos ainda,
já que eles entram como itens separados. Por isso, a forma confiável é
sempre calcular e preencher você mesmo, incluindo os Pigmentos — não
conte com a rede de segurança pra fazer a conta completa por você.)*

**Toda ficha (personagem OU monstro) deve nascer com esses 4 recursos
no MÁXIMO, JÁ CONTANDO os Pigmentos escolhidos** — calcule `.max`
manualmente e copie o mesmo número pra `.value`:

```json
{
  "atributos": {
    "forca": { "value": 5 }, "agilidade": { "value": 4 }, "estamina": { "value": 4 },
    "inteligencia": { "value": 2 }, "destino": { "value": 1 }
  },
  "vida": { "value": 5, "max": 5 },
  "mana": { "value": 5, "max": 5 },
  "estaminaCombate": { "value": 4, "max": 4 },
  "dadosDestino": { "value": 1, "max": 1 }
}
```

(Exemplo real, com Pigmento Verde e Pigmento Azul equipados: Vitalidade
= piso((5+4)/2) + 1 (Verde) = 5 → Vida 5/5. Espírito = (2+1) + 2 (Azul)
= 5 → Mana 5/5. Estamina de Combate e Dados de Destino não têm nenhum
Pigmento comum que os altere, então ficam só no atributo puro: 4/4 e
1/1.)

**`stress` é a ÚNICA exceção — NUNCA preencha no máximo.** Estresse
alto é ruim pro personagem (penalidades em Ataque/Defesa/Dano/
Movimento), então "cheio" seria o PIOR estado possível, não o melhor.
Toda ficha nasce com `stress.value: 0` (o padrão do schema já é esse -
não precisa nem declarar, mas nunca escreva um valor maior que 0 aqui).
Isso vale mesmo que um Pigmento (Preto) ou uma Habilidade aumente o
`stress.max` — o `.max` sobe, o `.value` continua em 0.

### `defesa` e `movimento`
Valores base editáveis. Referência do manual: Defesa base 10 + bônus de
armadura equipada (ver seção 5.4). **Movimento padrão é 6** (Cap. III do
manual — "6 quadrados de deslocamento"), ajustado conforme o monstro
(voadores/aquáticos costumam ser maiores). Deixe 6 sempre que não
houver um motivo específico pra mudar — não copie o hábito de outros
sistemas de dar movimento alto sem razão narrativa.

**⚠️ Nunca use distâncias fracionadas** (nada de `"1.5m"`, `"2.5m"`) —
diferente de sistemas como D&D 5e, o Nauren só trabalha com metros
inteiros, batendo com o grid de quadrados do Cap. III. Um ataque
corpo-a-corpo comum é sempre `"1m"`, nunca `"1.5m"`. Isso vale pra
`alcance` de qualquer Ação (Ataque, Magia, Habilidade) e pro raio de
qualquer `usaTemplate`.

### `stress.max`
Sempre nasce em 2 (regra do manual: "limite máximo de 2 pontos de
Estresse") — só sobe via Condição/Efeito com o campo `estresse` (seção 4).
`stress.value`, como dito acima, começa sempre em 0.

---

## 4. Modificadores — os campos válidos (atualizado na 0.94.19)

Usado em `condicoesAplicadas`/`gastosRecurso` (dentro de uma Ação),
`modificadores` (dentro de uma Condição/Efeito), e `efeitosVinculados` com
`modificadores` inline (seção 5.3). **Sempre um destes nomes exatos**:

| Campo | O que afeta |
|---|---|
| `ataque` | Bônus de Ataque |
| `defesa` | Defesa |
| `bloqueio` | Bônus de Bloqueio |
| `esquiva` | Bônus de Esquiva |
| `movimento` | Movimento |
| `alcanceBonus` | Bônus de Alcance (metros) — soma no alcance de Ações de alvo selecionado |
| `pontosSubclasse` | Ponto(s) de Subclasse disponíveis pra investir |
| `forca`, `agilidade`, `estamina`, `inteligencia`, `destino` | Atributos base |
| `espirito`, `poderAtaque`, `poderMagia`, `vitalidade` | Meta-atributos |
| `vida`, `mana` | Máximos de Vida/Mana |
| `estaminaCombate`, `dadosDestino` | Máximos de Estamina de Combate/Dados de Destino |
| `estresse` | Limite máximo de Estresse |
| `critMin` | Nat. necessário pra crítico (menor = mais fácil critar) |
| `critFailMax` | Nat. necessário pra falha crítica |
| `limiarDeflexao` | Margem de Deflexão (Cap. III) |
| `danoBonus`, `curaBonus` | Soma direto em qualquer rolagem de dano/cura |
| `reducaoDano` | Redução de Dano Sofrido (flat, depois de Bloquear/Esquivar) |
| `vantagemAtaque` | Vantagem/Desvantagem nos MEUS ataques |
| `vantagemAtaqueRecebido` | Vantagem/Desvantagem em ataques CONTRA mim |
| `vantagemEsquiva` | Vantagem/Desvantagem nas minhas Esquivas |
| `vantagemTeste` | Vantagem/Desvantagem em testes de atributo |
| `vantagemAtaqueRecebidoPrioridade` | Vantagem/Desvantagem só nos ataques contra mim feitos numa Prioridade |
| `contraAtaque` | Bônus no teste de Contra-Ataque (aceita dado: `"1d4"`) |
| `categoria` | Soma na Categoria da criatura (resultado fica entre 1 e 4; ex.: Crescimento `"1"`) |
| `ataqueDado` | Dado extra no teste de ataque (`"1d4"`) |
| `danoDado`, `curaDado` | Dado extra em toda rolagem de dano/cura (`"1d8"`, ou `"auto"` = mais um dado igual ao maior da fórmula) |
| `reducaoDanoAtaque` | Redução de Dano só contra ataques, magias e armadilhas (não vale no dano de Condições) |
| `reducaoDanoPercentual` | Redução de Dano em % (0 a 100), aplicada antes da redução fixa; várias fontes travam em 100 |
| `danoRecebido` | Dano extra em todo dano recebido (ex.: Exposto `"2"`); negativo nunca cura |
| `curaRecebidaPercentual` | Corta a cura recebida em % (100 = sem cura; ex.: Putrefato) |
| `vidaBonusPorNivel` | ±N na Vitalidade antes do cálculo da Vida (vira ±N de Vida por nível) |
| `perjurioLimiar`, `gracaLimiar` | Alarga a faixa do Perjúrio do Acaso (1 natural) / da Graça (20 natural): `"1"` faz 1–2 / 19–20 |
| `limiteOfensivo` | +N no limite de equipamentos de Ataque (armas e escudos) — só personagem |

**Facilidade/Dificuldade acumuladas (0.94.11):** várias fontes de `vantagem*` no mesmo teste se somam: duas Facilidades = 2d20 (fica o maior) **e +2**; três = +4; o mesmo com Dificuldade (−2 por extra). Uma Facilidade e uma Dificuldade se anulam par a par. Não precisa escrever nada: basta cada fonte dar `"vantagem"`/`"desvantagem"`.

Campos que aceitam dado: `contraAtaque`, `ataqueDado`, `danoDado`, `curaDado`. Os outros seguem a regra abaixo (sem dado).

**Formato do `valor`**: número (`"3"`), aritmética simples (`"3+2"`,
`"3*2"`), ou referência a atributo (`"@poderAtaque"`, `"@destino"`).
**NÃO aceita dado** (`"1d4"` falha silenciosamente e vira `0`, sem
nenhum erro visível). Para os 4 campos de `vantagem*`, o valor é
literalmente a palavra `"vantagem"` ou `"desvantagem"` (não um número).

⚠️ **Isto é DIFERENTE de `quantidade` em `gastosRecurso`/
`condicoesAplicadas` (dentro de uma Ação, seção 6) e de `quantidade` num
Gatilho (seção 7)** — ambos usam um motor de rolagem de verdade (`Roll`
do Foundry) e ACEITAM dado normalmente (`"1d4"`, `"2d6+3"`). Só o `valor`
de um Modificador puro (Efeito/Condição/Pigmento/`efeitosVinculados`) é
limitado à aritmética simples sem dado — são dois sistemas de resolução
diferentes que só coincidem no nome do campo. **Cuidado**: dentro de
`gastosRecurso`/`condicoesAplicadas`/`custoParaEvitarQuantidade` de uma
Ação, o dado funciona mas **`@atributo` NÃO** (o Roll ali não recebe os
tokens substituídos antes de rolar) — só use número/dado puro nesses
três campos específicos. Já `quantidade` de um Gatilho e `formula` de
`efeitosPeriodicos` (Condição, seção 5.4) aceitam dado E `@atributo`
juntos sem problema.

---

## 4.5 Guia de decisão — qual mecanismo usar pra cada ideia

Antes de montar o JSON, decida qual PERGUNTA a habilidade que você está
descrevendo responde. Cada resposta aponta pra um mecanismo específico
(e pra seção deste guia onde ele está detalhado):

| Se a habilidade é... | Use... | Onde |
|---|---|---|
| Um ataque simples (rola, acerta, causa dano) | `acoes` com `ehAtaque: true` + `danos` | Seção 6 |
| Um ataque que TAMBÉM aplica um status no alvo | `condicoesAplicadas` dentro da Ação | Seção 6 |
| Um bônus/penalidade SEMPRE ativo, sem precisar clicar em nada (ex: "+2 de Poder de Ataque permanente", "reduz dano sofrido em 2") | `efeitosVinculados` no nível da Habilidade | Seção 5.1 |
| Uma reação AUTOMÁTICA a algo que acontece em combate ("sempre que sofro dano, ganho 1 de Estamina") | `usaGatilhos` + `gatilhos` | Seção 7 |
| Algo que se repete "todo início/fim de rodada ou turno" (Regeneração, dano contínuo em si mesmo, etc), às vezes limitado a N vezes por combate | `usaGatilhos` com evento `inicioRodada`/`fimRodada`/`inicioTurno`/`fimTurno` (+ `usaUsosPassiva` se for limitado) | Seção 7 |
| Uma aura que afeta quem tá perto do token, todo turno/rodada, sem precisar de clique | `usaEmanacao` | Seção 9 |
| Uma barra de recurso PRÓPRIA da habilidade (tipo "Fúria", "Pontos de Foco") | `recursosDeclarados` | Seção 10 |
| Uma área/armadilha persistente no mapa que dispara sozinha quando algo entra nela | `usaTemplate` + `usaTemplatePersistente` (dentro da Ação) | Seção 9.5 |
| Um status/condição que o alvo carrega (Sangrando, Enraizado, Amedrontado...) — a habilidade É esse status, não algo que a CAUSA | Item `"condicao"` separado, referenciado por `condicoesAplicadas.uuid` | Seções 5.4, 4.6 |
| Algo puramente narrativo, sem efeito mecânico direto (ex: "fala com animais", "sabe ler runas antigas") | Só a `descricao` — não force um campo mecânico pra isso | — |

**Regra prática**: se a descrição do personagem usa a palavra "sempre" ou
"permanente" → `efeitosVinculados`. Se usa "sempre que" ou "quando" (um
evento específico) → `gatilhos`. Se é algo que o jogador ATIVA clicando →
uma Ação dentro de `acoes`.

---

## 4.6 Condições já prontas no sistema — reaproveite antes de criar uma nova

O sistema já vem com estas 16 Condições universais (Capítulo V do
manual), com toda a mecânica delas já automatizada no motor do jogo. Se a
habilidade que você está descrevendo bate com uma destas, **não crie uma
Condição nova do zero** — descreva a Ação apontando pra ela (mesmo sem
saber o UUID exato — anote o NOME da condição na descrição da Ação, e o
usuário liga o UUID certo depois de importar, arrastando da Compêndio de
Condições do próprio sistema).

| Nome | Acumulável | O que faz |
|---|---|---|
| Alvejado | Sim | Projéteis cravados; 1 de dano por acúmulo quando o alvo age (aplicação manual do dano, condição em si é automática) |
| Preso/Agarrado | Não | Movimento travado em 0; ataques contra o alvo com dificuldade |
| Caído | Não | Move-se pela metade; ataca com dificuldade, é atacado com facilidade |
| Cego | Sim | Ataca e esquiva com dificuldade; é atacado com facilidade |
| Amedrontado | Sim | Ações custam +1 Estamina; evolui pra Pânico se receber de novo |
| Pânico | — | Evolução de Amedrontado — +2 Estamina por ação, -1 Estresse máximo |
| Pavor | — | Evolução de Pânico — +3 Estamina por ação, -2 Estresse máximo, Movimento 0 |
| Atordoado | Sim | É atacado com facilidade; sem Prioridades; evolui pra Desacordado |
| Desacordado | Sim | Evolução de Atordoado — Defesa trava em 10, todo dano recebido é crítico e máximo |
| Envenenamento | Sim | Dano igual ao total de acúmulos, início de cada rodada |
| Sangramento | Sim | 1 de dano por acúmulo, início de rodada; evolui pra Hemorragia aos 5 acúmulos |
| Hemorragia | Sim | Evolução de Sangramento — mesmo dano, mas a cada TURNO (não só rodada) |
| Fragmentado | Sim | -1 de Defesa por acúmulo |
| Queimando | Sim | 1d4 de dano no início de cada turno |
| Congelando | Sim | -1 de Movimento e -1 de Estamina Máxima por acúmulo |
| Lerdeza | Sim | -1m de Movimento por acúmulo |

Se a ideia da habilidade **não bate com nenhuma destas**, aí sim crie uma
Condição nova (seção 5.4) — é exatamente pra isso que o tipo `"condicao"`
existe.

---

## 4.7 Peculiaridades de monstro (Codex Bestiariun) — como codificar cada uma

Se você está convertendo uma criatura do bestiário (Nauren — Codex
Bestiariun), as fichas de lá usam um conjunto padronizado de
"Peculiaridades" (palavras-chave com um número do lado, ex: "Atropelador
2", "Lacerador 1"). Aqui está exatamente como cada uma vira JSON:

### ⚠️ OBRIGATÓRIO: toda Peculiaridade precisa de uma Habilidade própria e visível

Independente de onde a automação de verdade mora (ex: Lacerador quase
sempre vive dentro de `condicoesAplicadas` de uma Ação de ataque, não
num item separado), **crie SEMPRE um item `"habilidade"` dedicado**
nomeado `"Peculiaridade: <Nome> <N>"` (ex: `"Peculiaridade: Envenenador
2"`) pra cada Peculiaridade da criatura. Este item pode não ter nenhuma
mecânica própria (só `descricao`) — ele existe pra o Mestre ver de cara,
na lista de Habilidades da ficha, TUDO que a criatura tem, sem precisar
abrir cada Arma/Ataque procurando. Na descrição, diga o que a
Peculiaridade faz e, se já estiver automatizada em outro item, aponte
pra onde ("já automatizado na Ação X").

```json
{
  "name": "Peculiaridade: Envenenador 2",
  "type": "habilidade",
  "img": "",
  "system": {
    "descricao": "<p><b>Peculiaridade de monstro.</b> Sempre que causa dano com um ataque, aplica 2 acúmulos de Envenenamento no alvo - já automatizado (configurado na Ação de ataque, em Condições Aplicadas). Este item existe só pra deixar a Peculiaridade visível na lista de Habilidades.</p>"
  }
}
```

Isso vale pra TODAS as Peculiaridades da tabela abaixo — a Habilidade
dedicada existe mesmo quando a automação mora em outro item.

| Peculiaridade | Como codificar |
|---|---|
| **Lacerador N** | `condicoesAplicadas` na Ação de ataque, apontando pra "Sangramento" com `acumulos: N` (seção 4.6) |
| **Venenoso N** | `condicoesAplicadas` na Ação de ataque, apontando pra "Envenenamento" com `acumulos: N` (seção 4.6) |
| **Assustador N** | Não está no glossário original do Codex, mas apareceu em fichas reais (ex: Bestial, Anomalia da Arte) — tratada pelo mesmo padrão de Lacerador/Venenoso: `condicoesAplicadas` apontando pra "Amedrontado" com `acumulos: N`. |
| **Bando N** | `ataqueBonusExtra: "N*@aliados_6m"` na Ação — o token `@aliados_<X>m` já existe e conta aliados próprios (mesma disposição) a até X metros sozinho, sem precisar de nada novo. Troque o "6" se a ficha indicar uma distância diferente. |
| **Atropelador N** | `usaAtropelador: true`, `atropeladorQuantidade: "N"`, `atropeladorRaio: "1"` na Ação de ataque (seção 6) — causa N de dano direto (sem teste, sem reação) em todo inimigo a até o raio configurado do alvo principal, automaticamente, ao acertar. |
| **Impáravel N** | `imparavelQuantidade: "N"` na Ação de ataque (seção 6) — garante N de dano mesmo que o alvo Bloqueie com sucesso (soma por cima do dano mínimo normal). |
| **Espreitador N** | `movimentoSemPrioridadeMetros: "N"` na própria Habilidade da Peculiaridade (seção 8e): N m de movimento por turno sem gerar Prioridade. |
| **Vigilante** (sem número) | Nunca é pego de surpresa: Gatilho `inicioCombate` com `recurso: "estaminaCombate"`, `quantidade: "1"` (+1 Estamina no início do combate). |
| **Enlouquecedor N** | `condicoesAplicadas` na Ação de ataque, apontando pra "Loucura" com `acumulos: N`. |
| **Alcance N** | Efeito Vinculado `alcanceBonus: "N"` na Habilidade da Peculiaridade: +N m em todos os golpes. |

### "Ponto Fraco: N" — sempre narrativo, mas SEMPRE com uma Habilidade dedicada

Todo monstro do Codex tem (ou não) um "Ponto Fraco" com um número. **Isso
não é uma Condição nem um Modificador** — é uma regra de mesa: o jogador
declara ANTES de rolar que está mirando aquela parte específica do
corpo, e SÓ NESSE CASO a Defesa do monstro recebe +N (fica mais difícil
acertar) pra aquele ataque específico. Se acertar, dispara o efeito
único descrito pra aquele ponto fraco (varia por criatura — geralmente
uma Condição ou dano extra).

**⚠️ OBRIGATÓRIO: toda criatura recebe uma Habilidade chamada
exatamente `"Ponto Fraco"`** (mesmo nome sempre, pra ficar fácil de
achar na lista), só com `descricao` — nunca uma mecânica de verdade.
Isso vale **mesmo quando a criatura não tem um Ponto Fraco na ficha
original**: nesse caso, o texto diz isso explicitamente, pra ficar
claro que não foi esquecido, e sim que a ficha genuinamente não tem um.

```json
{
  "name": "Ponto Fraco",
  "type": "habilidade",
  "img": "",
  "system": {
    "descricao": "<p>Ponto Fraco: 4, Cabeça. Regra de mesa, não automatizada - some +4 na Defesa só quando o jogador declarar que está mirando a cabeça antes de rolar. Se acertar mesmo assim, o alvo fica Atordoado por 1 turno - aplique manualmente.</p>"
  }
}
```

Pra uma criatura sem Ponto Fraco na ficha original:

```json
{
  "name": "Ponto Fraco",
  "type": "habilidade",
  "img": "",
  "system": {
    "descricao": "<p>Esta criatura não tem um Ponto Fraco definido na ficha original do Codex.</p>"
  }
}
```

Não repita o texto completo de novo dentro da descrição da Ação de
ataque — se quiser, deixe só uma referência curta lá (`"ver Habilidade
dedicada 'Ponto Fraco' na lista"`), evitando duplicar o mesmo texto em
dois lugares. **Atenção ao JSON**: se o texto da referência curta usar
aspas duplas dentro de uma string JSON já delimitada por aspas duplas,
escape-as (`\"Ponto Fraco\"`), senão quebra o JSON.

### Toda criatura também recebe "Dar Prioridade"

Assim como "Ponto Fraco", **toda criatura do bestiário recebe uma
Habilidade "Dar Prioridade"** — a mesma que qualquer Classe jogável já
tem desde o nível 1 (Cap. III do manual, "Prioridade Estratégica"). É
uma Ação simples, sem teste de ataque, que concede Prioridade a um
aliado à escolha de quem usa:

```json
{
  "name": "Dar Prioridade",
  "type": "habilidade",
  "img": "icons/svg/combat.svg",
  "system": {
    "acoes": [
      { "nome": "Dar Prioridade", "custoEstamina": 1, "alcance": "9m", "modoAlvo": "selecionado", "modoAlvoTravado": true, "usaDarPrioridade": true }
    ],
    "descricao": "<p>Habilidade universal (Cap. III do manual - \"Prioridade Estratégica\"). Concede Prioridade a um aliado à sua escolha - representa uma abertura estratégica, um momento de proteção, ou uma ação coordenada entre companheiros.</p>"
  }
}
```

### Toda criatura também recebe uma habilidade de "Perjúrio do Acaso"

Quando um jogador tira **1 natural**, o Grupo de Jogadores ganha 1
ponto de **Perjúrio do Acaso** (contado automaticamente pelo sistema).
Para o Mestre não ter que inventar na hora, **toda criatura recebe uma
Habilidade especial que só pode ser usada gastando 1 desses pontos** —
o Mestre pode guardar o Perjúrio e usar quando for mais dramático.

Regras da habilidade:
- Nome: **`"Perjúrio do Acaso: <nome curto do efeito>"`** (ex.:
  `"Perjúrio do Acaso: Rugido de Pedra"`).
- Uma Ação com **`"consomePerjurio": true`**. O sistema só deixa usar
  se o Grupo tiver Perjúrio guardado, e desconta 1 ao usar (aparece no
  card).
- O efeito deve ser **forte e ligado ao tema da criatura**, do tamanho
  de "algo deu muito errado para os jogadores": dano em área, uma
  Condição pesada, invocar reforços (via `condicoesAplicadas` /
  `usaEntidade` / `usaTemplate`), ou virar o campo (empurrar, puxar,
  cegar). Pode ter custo de Estamina ou Mana **além** do Perjúrio, ou
  ser gratuita.
- Escreva na `descricao` da habilidade uma frase para o Mestre:
  "Use quando um jogador tirar 1, ou guarde para ...".

```json
{
  "name": "Perjúrio do Acaso: Rugido de Pedra",
  "type": "habilidade",
  "img": "icons/svg/hazard.svg",
  "system": {
    "prioridadeIndicador": "NP",
    "acoes": [{
      "nome": "Rugido de Pedra", "custoEstamina": 0, "alcance": "pessoal",
      "consomePerjurio": true, "naoGeraPrioridade": true,
      "usaTemplate": true, "templateTipo": "circle", "templateTamanho": 4,
      "modoAlvo": "area", "areaDisposicao": "inimigos", "danoDiretoSemTeste": true,
      "danos": [{ "formula": "3d8+@poderAtaque", "aplicarNoAlvo": true }],
      "condicoesAplicadas": [{ "uuid": "self:Atordoado pela Pedra", "acumulos": 1, "ativo": true, "soSeAcertar": false }]
    }],
    "descricao": "<p>Só pode ser usada gastando 1 Perjúrio do Acaso do Grupo. <b>Para o Mestre:</b> use quando um jogador tirar 1 natural, ou guarde para o momento em que o grupo estiver agrupado.</p>"
  }
}
```

### E também um item "Categoria N" — pro Mestre ver de cara

Terceira Habilidade sempre presente: **"Categoria N"** (troque N pela
Categoria real da criatura, ex: `"Categoria 3"`), puramente de
referência — pro Mestre ver a Categoria sem abrir a aba Opções, já que
ela afeta várias coisas espalhadas (dado de dano, custo de Estamina
extra, tamanho de Token, multiplicador de Vida).

**Duas variantes**, dependendo se é conversão do Codex ou criatura
original:

- **Conversão do Codex** (Estresse Máximo já bate com o número exato
  do livro via outro mecanismo, seção 4.9): item SÓ com `descricao`,
  sem `efeitosVinculados` — não some Estresse aqui de novo.
- **Criatura original** (sem número de livro pra bater): o item TAMBÉM
  soma o Estresse Máximo de verdade, já que só escrever um número em
  `stress.max` no JSON não funciona sozinho (`stress.max` é travado em
  2 pelo motor, só sobe por bônus de item — seção 3).

```json
{
  "name": "Categoria 4",
  "type": "habilidade",
  "img": "icons/svg/upgrade.svg",
  "system": {
    "ativo": true,
    "efeitosVinculados": [
      { "ativo": true, "modificadores": [ { "campo": "estresse", "valor": "4" } ] }
    ],
    "descricao": "<p><b>Categoria 4</b> - referência pro Mestre. Dado de dano d12, +3 de Estamina extra por ataque, token 4x4, Estresse Máximo 6 (já automatizado: +4 aqui, somado ao 2 padrão do sistema). Vida Máxima = Vitalidade × Categoria × Nível, quando aplicável.</p>"
  }
}
```

(O valor do Modificador é sempre igual ao número da Categoria — 1, 2,
3 ou 4 — já que a Tabela 6 do documento de balanceamento é sempre "2 +
Categoria" pro Estresse Máximo: Categoria 1→3, 2→4, 3→5, 4→6.)

### Toda ficha também leva Notas — descrição, comportamento, história e dicas pro Mestre

**Obrigatório, não opcional**: todo Ator de criatura (original ou
conversão do Codex) recebe conteúdo no campo `notas` (aba "Notas" da
ficha, `system.notas`, aceita HTML) com 4 partes, cada uma num
parágrafo `<p>` com o rótulo em negrito:

1. **Descrição** — aparência física, onde é encontrada, comportamento
   geral (o que ela é, antes de entrar em combate).
2. **Como luta** — resumo narrativo do estilo de combate (não repita
   os números das Ações, descreva a ESTRATÉGIA: foge e se cura? ataca
   em grupo? escala pra fugir? usa área?).
3. **História/Origem** — de onde ela vem, um mito/lenda associado, ou
   um fato de lore relevante (se a fonte tiver uma citação de abertura
   ou uma seção de lore, parafraseie o essencial aqui — nunca copie
   trechos longos literalmente, ver `<CRITICAL_COPYRIGHT_COMPLIANCE>`).
4. **Dicas para o Mestre** — como usar essa ficha na mesa: que tipo de
   cena ela favorece, um gancho narrativo, um aviso tático (ex: "essa
   Peculiaridade combina mal com grupos pequenos", "bom pra tensão de
   horror, não pra combate direto").
5. **Plano de luta** — a ordem em que o Mestre usa as habilidades,
   rodada a rodada, com o gatilho de cada troca. Ex.: "Rodada 1:
   Investida no alvo mais afastado dos aliados. Depois, Mordida todo
   turno; se ficar com menos da metade da Vida, Uivo para chamar o
   bando e recua. Guarde o Perjúrio do Acaso para quando um jogador
   estiver Preso." Cite também o Ponto Fraco aqui: como a criatura o
   protege e o que muda quando ele é atingido.

Se a criatura for original (não tem fonte de lore pra puxar), invente
algo consistente com o resto da ficha (Pigmentos, Peculiaridades,
tema) em vez de deixar `notas` vazio — as 4 partes continuam
esperadas.

```json
{
  "notas": "<p><b>Descrição:</b> ...</p><p><b>Como luta:</b> ...</p><p><b>História/Origem:</b> ...</p><p><b>Dicas para o Mestre:</b> ...</p><p><b>Plano de luta:</b> Rodada 1: ... Depois: ... Se ...: ... Perjúrio do Acaso: use quando ...</p>"
}
```

### Nível/Categoria — como escolher os atributos

O Codex mostra cada criatura no seu nível MAIS BAIXO encontrado, com uma
faixa de escala (ex: "Nível: 1 a 5"). Pra converter, use os atributos
exatos da ficha do livro pro nível base indicado — não recalcule nada,
os valores já vêm prontos. O campo `Acaso` do Codex (só aparece em
algumas criaturas, com "*") é convenção própria do bestiário pra uma
mecânica de sorte que não existe no Nauren RPG base — pode ignorar.
`Nível` e `Categoria`, porém, **têm fórmulas reais** — ver seção 4.9.

---

## 4.8 Pigmentos — OBRIGATÓRIO em todo monstro/personagem

**Toda criatura do Nauren RPG tem 2 ou mais Pigmentos** (regra do
manual base, Cap. II) — isto não é opcional nem específico do Codex
Bestiariun. **Nenhum monstro deve ser entregue sem pelo menos 2**.
Escolha as cores conforme a arte/tema/história da criatura descrita (ex:
uma criatura de fogo e fúria → Vermelho; algo relacionado a destino/luz
sagrada → Dourado).

Diferente de Condições (seção 4.6), Pigmento é um item **autocontido**
— não precisa de UUID nem ajuste manual depois de importar, é só copiar
o item inteiro pro array `items` do Ator. Aqui estão os 12 já existentes
no sistema, prontos pra copiar:

```json
{ "name": "Pigmento Vermelho (Poder de Ataque)", "type": "cor", "system": { "corHex": "#c24b4b", "poderAtaque": "1", "descricao": "<p>Vermelho: força e agressividade. +1 em Poder de Ataque.</p>" } }
```

| Nome exato | Efeito |
|---|---|
| `Pigmento Vermelho (Poder de Ataque)` | +1 Poder de Ataque |
| `Pigmento Vermelho (Poder de Magia)` | +1 Poder de Magia |
| `Pigmento Azul` | +2 Espírito |
| `Pigmento Verde` | +1 Vitalidade |
| `Pigmento Roxo` | +1 no menor atributo (recalcula sozinho) |
| `Pigmento Preto` | +1 no limite de Estresse |
| `Pigmento Branco (Espírito)` / `(Poder de Ataque)` / `(Poder de Magia)` / `(Vitalidade)` | +1 no meta-atributo escolhido (qualquer um dos 4) |
| `Pigmento Rosa` | +1 de Movimento |
| `Pigmento Dourado` | +1 de Destino |

Pra usar: escolha 2+ da tabela, copie o JSON de cada um (trocando só o
`name` pra bater com a linha exata da tabela — os campos de bônus
internos batem 1:1 com o nome) e adicione no array `items` do monstro,
junto das Armas/Habilidades. Todo Pigmento nasce com `ativo: true` — não
precisa declarar isso explicitamente.

---

## 4.9 Sistema de balanceamento e criação de monstros (Codex Bestiariun)

Isto é o método usado pra criar/converter QUALQUER monstro do bestiário
de forma consistente com o resto do livro — siga esta ordem.

### Passo 1 — Nível define o "Valor Base de Atributo"

| Faixa de Nível | Valor Base |
|---|---|
| 1-5 | 3 |
| 6-10 | 4 |
| 11-15 | 5 |
| 16-18 | 6 |
| 19-20 | 10 |
| 21-23 | 11 |
| 24-26 | 12 |
| 27-29 | 13 |
| 30 | 14 |

**As faixas 21-30 são extrapolação** (o documento original de balanceamento só ia até 19-20). **Desde a 0.87 sobem só +1 por faixa** (antes: 12/15/18/22): os jogadores param de crescer no nível 20 (depois disso só ganham Vida), e o salto antigo multiplicava a Vida dos monstros por 4-5 sem nada do lado dos jogadores para acompanhar.

### Passo 2 — Pontos totais de atributo

```
Pontos totais = (Valor Base × 5) + Nível
```

Exemplo: nível 1, Valor Base 3 → (3×5)+1 = **16 pontos** pra distribuir
entre Força, Agilidade, Estamina, Inteligência, Destino.

**Limite por atributo**: nenhum atributo pode passar de `Valor Base +
Nível` (ex: nível 1, Valor Base 3 → máximo 4 em qualquer atributo
único).

**Nenhum atributo pode ser 0** numa criatura Atacante (e, por bom senso,
evite 0 em qualquer criatura funcional, a menos que a descrição
explique por quê).

### Passo 3 — Função determina a ênfase da distribuição

> **⚠️ Criatura ORIGINAL: use os pesos, os tetos por Função e os bônus da seção 8i-2 (Criador de Monstros, 0.87/0.88)** — a tabela pronta por nível está no `prompt-criacao-criatura.md`, Parte 1. A proporção 2:1 e os exemplos abaixo descrevem o Códex original e servem para **conferir conversões** de fichas do livro.

Três funções, como "classes" de monstro — escolha uma e distribua os
pontos do Passo 2 na **proporção 2:1** entre os 3 atributos "fortes" da
Função (na ordem de prioridade abaixo) e os 2 "fracos", sem estourar o
Limite por atributo do Passo 2 nem os **Tetos de inimigo** (abaixo):

- **Atacante**: fortes = **Agilidade, Estamina, Força** (nessa ordem).
  Fracos = Inteligência, Destino. O Poder de Ataque usa o **maior**
  entre Força e Agilidade (não a soma), então deixar as duas iguais
  desperdiça pontos: o Atacante lidera em Agilidade, que dá o mesmo
  dano e ainda Esquiva e iniciativa (age primeiro).
- **Defensor**: fortes = **Força, Estamina, Agilidade** (nessa ordem).
  Fracos = Inteligência, Destino. Força lidera porque dá Vitalidade
  (Vida e Bloqueio = Defesa + Vitalidade) e o mesmo Poder de Ataque;
  esquiva pior e age depois do Atacante.
- **Suporte**: fortes = **Inteligência, Estamina, Destino** (nessa
  ordem). Fracos = Força, Agilidade, com **Força acima de Agilidade**
  (um pouco de Vida). Inteligência lidera porque entra no Espírito
  (Int + Destino) e no Poder de Magia (Int + Estamina) ao mesmo tempo.

**Tetos de inimigo por faixa de nível** (tirados das 16 criaturas do
Códex: o maior valor que o livro usa em cada faixa). Os pontos que
passariam do teto **se perdem** (não são redistribuídos): o monstro fica
mais forte pela Categoria e pelas habilidades, não por atributos maiores.

| Faixa de Nível | Estamina (atributo) | Poder de Ataque | Defesa |
|---|---|---|---|
| 1-5 | 7 | 6 | 13 |
| 6-10 | 9 | 8 | 14 |
| 11-15 | 12 | 10 | 15 |
| 16-18 | 14 | 12 | 16 |
| 19-20 | 16 | 13 | 20 |
| 21-25 | 17 | 14 | 20 |
| 26-30 | 18 | 15 | 20 |

(21-30 desde a 0.87: a Defesa para em 20 porque o ataque dos jogadores para de crescer no 20.)

- A Defesa do teto é a mesma do Passo 5 (10 + Valor Base); só passa
  disso por armadura ou habilidade explícita (ex.: Quase Apagados,
  Defesa 20 no nível 10).
- A Estamina precisa caber no custo das Ações: um monstro de
  Categoria 4 paga até +3 por ataque (Passo 6), então garanta Estamina
  para pelo menos 2 ações por rodada.
- Acima do nível 20 não há criatura do Códex para medir: use a
  progressão das faixas como referência e ajuste na mesa.

Exemplo de Atacante nível 1 (16 pontos): Agilidade 4, Estamina 4,
Força 3, Inteligência 3, Destino 2 — resulta em PdA 4, PdM 3,
Vitalidade 3, Espírito 5 (calculados automaticamente pelo Foundry,
seção 3). Referência no nível 10 (30 pontos, limite 14):

| Função | For | Agi | Est | Int | Des |
|---|---|---|---|---|---|
| Atacante | 6 | 8 | 8 | 4 | 4 |
| Defensor | 8 | 6 | 8 | 4 | 4 |
| Suporte | 4 | 4 | 7 | 8 | 7 |

**Evite preencher os 3 fortes até o teto antes de pensar nos 2
fracos** — isso deixa os fracos no mínimo absoluto nas faixas altas,
contra o próprio propósito do Limite por atributo (evitar "atributos
astronômicos e disfuncionais"). Mantenha a proporção 2:1 em todos os
níveis, não só no final.


### Passo 4 — Escala por Nível: Atributos (*) e Defesa — AGORA AUTOMATIZADO

Nas fichas do Codex, um atributo marcado com `*` (ex: `"For:5*"`) é o
**atributo principal** daquela criatura, que cresce ao subir de nível. A
tabela de balanceamento (seção 4.9) também manda a **Defesa** subir com
o nível (`10 + metade do nível`). **Os dois agora são automatizados de
verdade.**

**⚠️ Assim como o Cálculo de Recursos (seção 3.1), esta seção só
aparece na aba Opções de fichas de NPC** — some completamente de um
Ator `"type": "personagem"`. O mecanismo em si (os campos abaixo) até
existe no schema de qualquer Ator, mas um personagem jogável nunca tem
motivo pra usá-lo, então a IA nunca deve gerar `usaEscalaPorNivel: true`
num `"type": "personagem"`.

**Modelo atual: cada atributo tem sua PRÓPRIA tabela independente** —
diferente de uma versão anterior deste sistema (que tinha uma única
tabela compartilhada, distribuindo pontos alternadamente entre os
atributos marcados). Isso importa porque **atributos diferentes podem
evoluir de formas completamente diferentes** entre si — um pode subir
rápido, outro devagar, um pode nem escalar. Cada atributo é
independente.

**Os 3 campos que controlam isso**, todos em `system`:

| Campo | Tipo | O que faz |
|---|---|---|
| `usaEscalaPorNivel` | boolean (padrão `false`) | **Interruptor mestre** — nada nesta seção funciona sem isto ligado. Um Ator comum (que nunca configurou nada aqui) nunca é afetado, não importa o que os outros campos digam. |
| `escalaAtributos` | lista de `{atributo, tabela}` | Um item por atributo que deve escalar. `atributo` é um dos 5 nomes exatos (`forca`, `agilidade`, `estamina`, `inteligencia`, `destino`). `tabela` é a lista de degraus DESSE atributo especificamente — ver abaixo. |
| `nivelBase` | número ≥ 1 | Só documentação/referência (o nível em que a ficha foi originalmente configurada) — não entra em nenhum cálculo, é só pro Mestre lembrar de onde a criatura "começou". |

**Cada linha de `tabela` é `{nivelMinimo, valor}`**: a partir de
`nivelMinimo`, o atributo é TRAVADO em `valor` — busca direta (não
soma nem distribui pontos), sempre a maior entrada cuja `nivelMinimo`
seja ≤ o nível atual da criatura.

```json
{
  "usaEscalaPorNivel": true,
  "nivelBase": 1,
  "escalaAtributos": [
    {
      "atributo": "forca",
      "tabela": [
        { "nivelMinimo": 1, "valor": 5 },
        { "nivelMinimo": 6, "valor": 7 },
        { "nivelMinimo": 11, "valor": 9 }
      ]
    },
    {
      "atributo": "estamina",
      "tabela": [
        { "nivelMinimo": 1, "valor": 6 },
        { "nivelMinimo": 6, "valor": 8 }
      ]
    }
  ]
}
```

Neste exemplo, Força e Estamina escalam com tabelas DIFERENTES uma da
outra (Força ganha um 3º degrau no nível 11, Estamina não tem esse
degrau — fica travada em 8 dali em diante). Um atributo sem entrada em
`escalaAtributos` simplesmente não muda sozinho, não importa o nível.

**⚠️ A tabela de cada atributo deve COMEÇAR com o valor que a criatura
já tem no nível inicial dela.** Se a ficha nasce no nível 1 com Força 5,
a 1ª linha da tabela de Força deve ser `{"nivelMinimo": 1, "valor": 5}`
— senão, na primeira mudança de nível, o atributo "salta" pro valor que
a tabela diz (mesmo que a criatura já esteja naquele nível), o que pode
parecer um bug.

**Como funciona na prática**: toda vez que o Nível do Ator muda (botão
"Subir de Nível", editar o campo direto, ou até descer de nível):
- **Cada atributo com tabela**: procura a linha certa pro NOVO nível e
  trava o atributo nesse valor. Sempre recalcula do zero (não guarda
  histórico) — subir e descer de nível usam exatamente a mesma lógica,
  então nunca desalinha.
- **Defesa**: soma `piso(nívelNovo/2) - piso(nívelAntigo/2)` — a MESMA
  fórmula "10 + metade do nível", como incremento por cima do valor JÁ
  configurado na ficha.
- **Vida/Mana/Estamina de Combate/Dados de Destino**: ressincronizam
  automaticamente pro novo máximo depois de qualquer mudança de nível
  (pra QUALQUER Ator, não só os com Escala por Nível ligada) — sem
  isso, a barra de Vida mostraria "atual > máximo" sempre que o máximo
  mudasse (ex: 66/6).

Uma criatura comum (`usaEscalaPorNivel: false`, o padrão) nunca é
afetada por nada disso.

**Também dá pra configurar depois de importar**: aba Opções da ficha →
seção expansível "Escala por Nível" (mesmo estilo de "Consultar
Fórmulas", que fica logo ABAIXO dela, não acima) → marque "Ativar
Escala por Nível" → escolha um atributo no menu e clique "Adicionar
Atributo" → clique no card do atributo pra expandir e editar a tabela
dele (linhas de Nível Mínimo/Valor, adicionar/remover à vontade). Cada
atributo adicionado vira seu próprio card, independente dos outros.

#### Exemplo — personagem/monstro que já nasce no nível 5, pensado pra escalar até o 8

```json
{
  "name": "Exemplo Nível 5",
  "type": "npc",
  "system": {
    "nivel": 5,
    "atributos": {
      "forca": { "value": 6 }, "agilidade": { "value": 4 }, "estamina": { "value": 5 },
      "inteligencia": { "value": 3 }, "destino": { "value": 2 }
    },
    "usaEscalaPorNivel": true,
    "nivelBase": 5,
    "escalaAtributos": [
      { "atributo": "forca", "tabela": [ { "nivelMinimo": 5, "valor": 6 }, { "nivelMinimo": 8, "valor": 8 } ] },
      { "atributo": "estamina", "tabela": [ { "nivelMinimo": 5, "valor": 5 }, { "nivelMinimo": 8, "valor": 7 } ] }
    ]
  }
}
```

Repare que a 1ª linha de cada tabela bate com o valor já configurado no
nível 5 (Força 6, Estamina 5) — regra de ouro acima. Se esse Ator subir
pro nível 8, Força trava em 8 e Estamina em 7 diretamente (não é "+X
por nível", é "qual o valor certo pro nível atual"). A Defesa sobe
`piso(8/2) - piso(5/2)` = 4-2 = **+2** no mesmo processo, incremental
por cima do que já estava configurado.

### Passo 5 — Defesa, Movimento, Número de Habilidades

```
Defesa = 10 + Valor Base de Atributo (até o teto da faixa; +1 Defensor, +1 Chefe)
Movimento = 6 (decisão de mesa; o "3 + Valor Base" do documento original não é usado)
Número de Habilidades: 4 (nv 1-5), 5 (6-10), 6 (11-15), 7 (16-20), 8 (21-25), 9 (26-30); Chefe +1
```

As Habilidades devem bater com a Função escolhida no Passo 3 (um
Atacante tem habilidades de dano/debuff, um Suporte tem cura/buff,
etc).

### Passo 6 — Categoria determina Dano, Vida, Tamanho e Estresse

Categoria é uma escala de 1 a 4, escolhida pelo "peso" narrativo da
criatura (não pelo nível diretamente — uma criatura fraca mas grande
pode ser Categoria 3 mesmo em nível baixo).

| Categoria | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Dado de dano | d6 | d8 | d10 | d12 |
| Nº de dados de dano | 1 (1d6) | 2 (2d8) | 3 (3d10) | 4 (4d12) |
| Custo de Estamina extra por ataque | +0 | +1 | +2 | +3 |
| Multiplicador de Vida | ×1 | ×2 | ×3 | ×4 |
| Tamanho do token | 1 quadrado | 2 quadrados | 3 quadrados | 4 quadrados |
| Estresse Máximo | 3 | 4 | 5 | 6 |

```
Vida Máxima = Vitalidade × Multiplicador da Categoria × Nível   (fórmula do Códex original)
Vida Máxima = Vitalidade × Categoria × (Nível + 2)            (criatura ORIGINAL, Criador 0.87; Chefe × 1,5)
```

Criatura original: `calculoVida: "customizado"`, `vidaFormula: "@vitalidade * @categoria * (@nivel + 2)"`. O "+2" deixa os monstros de nível baixo resistentes sem mudar muito os de nível alto.

Exemplo: Vitalidade 5, Categoria 2, Nível 10 → Vida Máxima = 5 × 2 × 10
= 100 **(⚠️ não esqueça o × Nível — ele NÃO some quando se usa
Categoria, só troca o multiplicador de Vitalidade)**.

O "Número de dados de dano" vira a fórmula literal do `danos.formula`
da Ação de ataque (ex: Categoria 2 = `"2d8+@poderAtaque"`), e o "Custo
de Estamina extra" soma no `custoEstamina` normal da Ação.

### Passo 6.5 — Estimativas de combate (checagem de sanidade, não regra fixa)

Pra criaturas ORIGINAIS (balanceadas pela fórmula, não conversão de uma
ficha existente com valores travados — ver a seção seguinte), estas 3
contas ajudam a conferir rapidamente se o dano está compatível com a
Vida dos personagens, sem precisar simular o combate inteiro:

```
PdA Típico = (Força + Estamina) / 2   [mesma fórmula da Vitalidade nesse build]
Dano Médio por Ataque ≈ (média do dado × Nº de dados da Categoria) + PdA Típico
Ataques por Rodada (estimativa) = Estamina de Combate ÷ 2
```

"Ataques por Rodada" vem de todo ataque básico custar Estamina — a
conta estima quantos ataques cabem numa rodada gastando metade da
Estamina disponível. Multiplique Dano Médio por Ataque × Ataques por
Rodada pra estimar o dano total que a criatura inflige numa rodada
típica, e compare contra a Vida esperada dos personagens no mesmo
nível — se estiver muito acima ou abaixo, ajuste a Categoria antes de
levar a criatura pra mesa.

### ⚠️ Nem essa fórmula, nem a padrão do manual, batem de forma confiável com o livro — trave os valores

Auditando as 16 criaturas já convertidas do Codex contra o Vida/Poder de
Ataque/Poder de Magia/Espírito calculados pelo sistema (atributos +
Pigmentos, usando a fórmula padrão do manual base — Vitalidade ×
Nível, não a de Categoria acima), **todas as 16 divergiam em pelo
menos um desses 4 valores** do que está escrito na ficha original.
Nenhuma das duas fórmulas gerais (nem "Vitalidade × Categoria × Nível"
acima, nem "Vitalidade × Nível" do manual base) prevê os números do
livro de forma confiável — eles foram escritos à mão pelo autor do
Codex, não gerados por uma fórmula única.

**⚠️ Um 5º campo que também precisa dessa checagem, fácil de esquecer:
Estresse Máximo.** Ele NÃO fez parte da auditoria original das 16
criaturas (só Vida/PdA/PdM/Espírito foram comparados de fato) — um
caso já confirmado divergente foi corrigido depois (Anomalia da Arte:
sistema calculava 3, o Codex diz 5), mas as outras 15 criaturas ainda
**não têm confirmação de que o Estresse Máximo bate com o livro** -
trate isso como pendente, não como já verificado, até auditar/comparar
uma a uma contra a ficha original. Estresse Máximo tem uma
particularidade técnica: o campo é travado em `2` direto no motor (ver
seção 3, `stress.max`) — **escrever um número em `stress.max` no JSON
da criação NÃO funciona sozinho**, precisa do mesmo mecanismo de
`efeitosVinculados` abaixo (campo `"estresse"`, não `"stressMax"` nem
`"stress"`).

**A solução: use o sistema dedicado de Vida (seção 3.1) pra Vida, e
`efeitosVinculados` com "=" pros outros 4** (Poder de Ataque, Poder de
Magia, Espírito, Estresse Máximo — nenhum desses tem um par
`calculoX`/`xFormula` próprio como Vida, então usam o mecanismo
genérico de travar campo por Efeito Vinculado).

**Vida** — direto no `system` do Ator (não precisa de item nenhum):

```json
{
  "calculoVida": "customizado",
  "vidaFormula": "900"
}
```

**Poder de Ataque/Poder de Magia/Espírito/Estresse Máximo**, se algum
divergir — uma Habilidade dedicada com `efeitosVinculados`, `"="` na
frente do valor trava o campo naquele número exato:

```json
{
  "name": "Estatísticas Originais (Codex)",
  "type": "habilidade",
  "img": "",
  "system": {
    "ativo": true,
    "efeitosVinculados": [
      {
        "ativo": true,
        "modificadores": [
          { "campo": "poderAtaque", "valor": "=12" },
          { "campo": "estresse", "valor": "=5" }
        ]
      }
    ],
    "descricao": "<p>Trava o Poder de Ataque e o Estresse Máximo nos valores exatos do Codex Bestiariun original (12 e 5), já que o cálculo padrão diverge um pouco dos números escritos à mão no livro.</p>"
  }
}
```

Os 4 campos que costumam divergir e podem ser travados assim:
`poderAtaque`, `poderMagia`, `espirito`, `estresse` (os mesmos nomes de
campo da tabela de Modificadores, seção 4 — `estresse`, não `stress`
nem `stressMax`). **Sempre calcule os 5 primeiro** (Vida/PdA/PdM/
Espírito pelas fórmulas da seção 3, já contando Pigmentos; Estresse
Máximo lembrando que a base do sistema é sempre `2`, não `0`) **e só
trave os que realmente DIVERGIREM do número do livro** — não trave um
campo que já bate, isso só adiciona ruído sem necessidade.

**Fácil de editar depois**: `calculoVida`/`vidaFormula` ficam na aba
Opções da ficha (seção "Cálculo de Recursos"); a Habilidade "Estatísticas
Originais" aparece na lista de Habilidades como qualquer outra — abra o
item, edite os Modificadores, ou apague o item inteiro pra voltar ao
cálculo padrão a partir dos atributos.

### ⚠️ Tamanho do Token — obrigatório quando Categoria > 1

Isto **não fica dentro de `system`** — é um campo de nível-topo do
Ator, chamado `prototypeToken`. Se a criatura for Categoria 1, não
precisa declarar nada (1x1 já é o padrão do Foundry). Se for Categoria
2, 3 ou 4, adicione:

```json
{
  "name": "Nome da Criatura",
  "type": "npc",
  "prototypeToken": { "width": 3, "height": 3 },
  "system": { "...": "..." }
}
```

(`width`/`height` sempre iguais, batendo com a Categoria — 2→2, 3→3,
4→4.) **Editar depois de já ter importado**: clique com o botão direito
no token já colocado no mapa → "Configurar Token" (ícone de engrenagem)
→ aba "Aparência" → campos "Largura"/"Altura". Ou, sem token no mapa
ainda: abra a ficha do Ator → aba de configurações do Token
(geralmente um ícone ao lado do retrato) → mesmos campos.

### Passo 7 — Balanceando contra os jogadores

```
Nível apropriado dos jogadores = Nível do inimigo ÷ 2
```

Um inimigo nível 4 é um desafio equilibrado pra jogadores nível 2 — mas
combates em Nauren são "quase sempre mortais" (citação do próprio
manual), então ainda é perigoso mesmo dentro dessa faixa. Mencione isso
na `descricao` do Ator se for relevante pro Mestre planejar o encontro.

### Passo 8 — Regras auxiliares do Codex (não fazem parte da ficha, mas o Mestre deve saber)

**Tabela de Perjúrio do Acaso (específica deste Codex)** — quando o
Mestre gasta 1 ponto de Perjúrio do Acaso (regra do manual base,
"tirar 1 no d20"), pode rolar 1d6 nesta tabela em vez de decidir
livremente:

| d6 | Resultado |
|---|---|
| 1 | Um inimigo adicional surge no combate |
| 2 | Um personagem cai desastradamente sem razão aparente |
| 3 | Um inimigo atinge um ataque |
| 4 | Um ataque de um personagem que acertaria erra misteriosamente |
| 5 | Um inimigo age mesmo sem ter Prioridade |
| 6 | Um personagem não recebe Prioridade quando deveria receber |

Isso é uma ferramenta de mesa pro Mestre, não algo pra codificar no
JSON da criatura — mencione na `notas` do Bestiário/guia de campanha
se for relevante, não na ficha individual de cada monstro.

**Ponto Fraco tem cooldown de 1 rodada** — depois de ser atingido, o
Ponto Fraco fica indisponível até o **início da próxima rodada** (não
pode ser explorado 2x seguidas no mesmo turno/rodada). Além disso, **só
Ataques podem atingir Ponto Fraco** — Magias só contam se tiverem
rolagem de ataque própria (não afeta magias de área/auto-acerto). Se um
ataque no Ponto Fraco não causar dano por algum motivo, o Ponto Fraco
NÃO é considerado "gasto" — continua disponível. Mencione essas 2
regras na descrição do item `"Ponto Fraco"` quando fizer sentido
(seção 4.7), já que são regras de mesa que o Mestre precisa lembrar,
não algo automatizável no sistema.

**Fórmula de XP por criatura derrotada**: `XP = (Nível da criatura ÷
2) × 100`, arredondado pra baixo. Uma criatura nível 2 gera 100 XP;
nível 5 gera 200 XP. Isso é adicional ao sistema de XP por cena do
manual base (seção "Ganhando Experiência fora de combate") — os dois
convivem.

**⚠️ Regra simples de progressão do Codex vs. Escala por Nível
(seção 3.1/Passo 4)**: o Codex descreve uma regra GERAL e simples pra
subir o nível de qualquer criatura à mão — "+1 em cada atributo por
nível acima do padrão, Vida = Vitalidade × Nível, Defesa = 10 + metade
do nível" — que é exatamente o comportamento PADRÃO do sistema quando
`usaEscalaPorNivel` está desligado (o normal). O sistema de Escala por
Nível **substitui isso por algo mais preciso quando ligado** (tabela
própria por atributo, batendo exatamente com os degraus "Nível: X a Y"
que o Codex já define pra cada criatura) — não é uma contradição, é
uma automação mais granular da MESMA ideia. Use a regra simples do
Codex como referência pra CONSTRUIR a tabela de `escalaAtributos`
(ex: se o atributo sobe "+1 por nível" de forma linear, a tabela pode
ter só 1-2 degraus cobrindo isso), não como uma alternativa que
compete com o sistema.

---

## 4.10 Checklist específico pra converter um monstro do Codex

- [ ] Nível do Codex → Valor Base de Atributo (Passo 1) confere com os
      atributos mostrados na ficha original?
- [ ] Tem **2 ou mais Pigmentos** no array `items` (seção 4.8)?
- [ ] Todo atributo marcado com `*` na ficha original tem uma entrada
      em `escalaAtributos` com `usaEscalaPorNivel: true`, e a 1ª linha
      da tabela desse atributo bate com o valor já configurado no
      nível inicial da ficha (Passo 4 — isto é automatizado de
      verdade, busca direta na tabela, não é só uma nota)?
- [ ] Toda Peculiaridade da ficha original (Atropelador/Bando/
      Lacerador/etc) foi codificada conforme a seção 4.7 **E tem um
      item Habilidade próprio e visível** (`"Peculiaridade: Nome N"`) —
      nenhuma foi silenciosamente ignorada ou deixada só "escondida"
      dentro de uma Ação de ataque?
- [ ] Existe uma Habilidade chamada exatamente `"Ponto Fraco"` — com o
      texto certo se a criatura tiver um, ou dizendo explicitamente que
      não tem, se for o caso (seção 4.7)?
- [ ] Existe uma Habilidade `"Dar Prioridade"` (seção 4.7)?
- [ ] `system.notas` está preenchido com as 4 partes (Descrição, Como
      luta, História/Origem, Dicas para o Mestre), não deixado vazio
      nem com só 1-2 delas (seção 4.7)?
- [ ] Existe uma Habilidade `"Categoria N"` (seção 4.7) — com
      `efeitosVinculados` somando Estresse se for criatura original E
      o número bater com a fórmula simples "2 + Categoria"? **⚠️ Não
      assuma que uma conversão do Codex "já trava Estresse por outro
      caminho" sem checar de verdade** — isso só é verdade se você
      efetivamente comparou o Estresse Máximo calculado contra o
      número exato do livro e (se divergir) travou via
      `efeitosVinculados` numa Habilidade "Estatísticas Originais"
      (ver item abaixo). Achar o item "Categoria N" na ficha não é
      prova de que o Estresse foi checado.
- [ ] Vida/Poder de Ataque/Poder de Magia/Espírito/**Estresse Máximo**
      calculados batem com os números exatos da ficha original? Se
      QUALQUER um divergir (o mais comum, não a exceção): Vida foi
      travada via `calculoVida: "customizado"` + `vidaFormula` (seção
      3.1); os outros 4, se divergirem, via `efeitosVinculados` numa
      Habilidade "Estatísticas Originais (Codex)" (Passo 6) — Estresse
      Máximo usa `"campo": "estresse"`, lembrando que a base do
      sistema é `2`, não `0`.
- [ ] Se a Categoria é 2, 3 ou 4, o Ator tem `prototypeToken: {"width":
      N, "height": N}` no nível de topo do JSON (Passo 6) — não
      esquecido pra criaturas grandes?
- [ ] `vida.value`, `mana.value`, `estaminaCombate.value`,
      `dadosDestino.value` estão preenchidos no MÁXIMO calculado (seção
      3) **JÁ CONTANDO os Pigmentos escolhidos** (não só os atributos
      crus) — nenhum ficou em 0 por esquecimento, nem sub-calculado por
      esquecer o bônus de Pigmento? `stress.value` ficou em 0 (nunca no
      máximo)?
- [ ] Cada Habilidade/Ataque da ficha original foi convertida — nenhuma
      foi esquecida?

---

## 5. Os tipos de Item

Todo item tem `descricao` (HTML simples, ex: `"<p>texto</p>"`) e
`mostrarDescricao` (`false` por padrão). Os campos abaixo são os
ESPECÍFICOS de cada `type`.

### 5.1 `"habilidade"` — a peça central de qualquer mecânica nova

```json
{
  "name": "Pele de Pedra",
  "type": "habilidade",
  "img": "icons/magic/earth/strike-fist-stone.webp",
  "system": {
    "ativo": true,
    "descricao": "<p>Reduz todo dano sofrido em 2.</p>",
    "efeitosVinculados": [
      { "ativo": true, "modificadores": [ { "campo": "reducaoDano", "valor": "2" } ] }
    ]
  }
}
```

Campos-chave (todos opcionais, use só o que a habilidade precisa):

- **`ativo`**: liga/desliga a habilidade inteira sem apagá-la.
- **`ignoraPenalidadeEstresse`** (bool): "não sofre penalidade por Estresse".
- **`efeitosVinculados`**: array de `{ ativo, modificadores: [...] }` —
  bônus/penalidade PASSIVA, sempre ativa enquanto `ativo=true`. Cada entrada
  de `modificadores` é `{ campo, valor }` (seção 4). **Isto é pra "sempre
  ligado, sem precisar clicar em nada"** (ex: +2 de Poder de Ataque
  permanente, redução de dano fixa, bônus de alcance).
- **`acoes`**: array de Ações (seção 6) — pra habilidades que o jogador
  CLICA pra usar (ataques especiais, curas, magias).
- **`usaGatilhos`** + **`gatilhos`**: reações automáticas a eventos de
  combate (seção 7) — pra "sempre que X acontece, Y automaticamente".
- **`usaEmanacao`** + campos `emanacao*`: aura persistente que afeta quem
  está perto do token, todo início/fim de turno/rodada (seção 9).
- **`recursosDeclarados`**: cria uma barra de recurso customizada na ficha
  (ex: "Fúria", "Pontos de Foco") — ver seção 10.
- **`rankAtual`/`rankMax`**: só relevante se a habilidade escala (ex:
  "aumenta em 1 por rank investido") — pra um monstro simples, deixe em 0/1.

### 5.2 `"arma"` / `"magia"`

Mesma estrutura de `acoes` que Habilidade (seção 6). Arma tem também
`equipado` (bool) — só armas equipadas com `efeitosVinculados` aplicam o
bônus passivo delas.

```json
{
  "name": "Punho de Pedra",
  "type": "arma",
  "img": "icons/skills/melee/unarmed-punch-fist.webp",
  "system": {
    "equipado": true,
    "descricao": "<p>Ataque corpo-a-corpo.</p>",
    "acoes": [
      {
        "nome": "Ataque Básico",
        "custoEstamina": 1,
        "alcance": "1m",
        "ehAtaque": true,
        "atributoAtaque": "poderAtaque",
        "danos": [ { "formula": "1d8+@poderAtaque", "aplicarNoAlvo": true } ]
      }
    ]
  }
}
```

### 5.3 `"armadura"`

```json
{
  "name": "Pele de Pedra (armadura natural)",
  "type": "armadura",
  "img": "icons/equipment/chest/breastplate-banded-grey.webp",
  "system": { "defesaBonus": 4, "tipo": "Natural", "equipado": true }
}
```

### 5.4 `"condicao"` — status/buff/debuff aplicável a um alvo

```json
{
  "name": "Enraizado",
  "type": "condicao",
  "img": "icons/magic/nature/root-vines-entangled-yellow.webp",
  "system": {
    "modificadores": [ { "campo": "movimento", "valor": "=0" } ],
    "acumulativel": false,
    "duracaoRodadas": 2,
    "descricao": "<p>Não pode se mover.</p>"
  }
}
```

- `"valor": "=0"` (com `=` na frente) TRAVA o campo naquele número exato,
  em vez de somar/subtrair — use isso pra "Movimento vira 0", não
  `"valor": "0"` (que não faz nada, soma zero).
- `acumulativel` + `acumulosMax`: pra condições tipo Sangramento/Fragmentado
  que empilham.
- `duracaoRodadas`: 0 = permanente (remove manualmente); N = expira sozinha.
- `efeitosPeriodicos`: dano/cura/estamina/mana automático a cada
  rodada/turno (Sangramento, Queimando, Envenenamento) — array de
  `{ recurso: "dano"|"cura"|"estamina"|"mana", formula: "1d4",
  aumentaPorAcumulo: true, porTurno: false }`.

#### Exemplo completo — acúmulos + rank juntos, os dois eixos independentes

Acúmulos e Rank são DOIS eixos diferentes de escala, e podem coexistir
na mesma Condição:

- **Acúmulos** (`acumulativel: true`): quantas vezes a MESMA Condição foi
  aplicada no alvo (empilha sozinho — reaplicar soma 1 acúmulo, não cria
  uma cópia nova). Todo Modificador que SOMA (não os que travam com
  `"="`) já multiplica automaticamente pelo número de acúmulos, sem
  precisar fazer nada extra. `"@acumulos"` também fica disponível como
  token em qualquer fórmula da própria Condição.
- **Rank** (`rankAtual`/`rankMax`): uma escala à parte, tipicamente
  copiada do item que CONCEDEU a Condição (via `copiarRankDoItem` na
  seção 6) — pra quando o "tamanho do efeito" deveria evoluir com o
  Rank de quem concedeu, não com quantas vezes foi aplicado.

```json
{
  "name": "Maldição Crescente",
  "type": "condicao",
  "img": "",
  "system": {
    "descricao": "<p>A cada acúmulo, -1 de Defesa. No início de cada rodada, causa dano crescente com o Rank de quem aplicou.</p>",
    "modificadores": [
      { "campo": "defesa", "valor": "-1" }
    ],
    "acumulativel": true,
    "acumulosMax": 10,
    "rankAtual": 0,
    "rankMax": 3,
    "efeitosPeriodicos": [
      {
        "recurso": "dano",
        "formula": "1d4",
        "aumentaPorAcumulo": true,
        "porTurno": false,
        "porRank": [
          { "rank": 2, "formula": "1d6" },
          { "rank": 3, "formula": "1d8" }
        ]
      }
    ]
  }
}
```

Neste exemplo: `defesa: "-1"` sozinho já vira `-3` num alvo com 3
acúmulos (automático). O dano periódico começa em `1d4` (rank 1 ou sem
rank copiado), mas vira `1d6` a partir do rank 2 e `1d8` a partir do
rank 3 — e cada um desses dados AINDA multiplica pelo número de
acúmulos, já que `aumentaPorAcumulo` está ligado. Pra esse `rankAtual`
realmente refletir o rank de quem concedeu, marque
`"copiarRankDoItem": true` na entrada de `condicoesAplicadas` da Ação
que a aplica (seção 6) — sem isso, `rankAtual` fica sempre 0 e a tabela
`porRank` nunca entra em ação.

#### Isto é um item separado — como ele se liga à ficha do monstro

Toda Condição customizada (com ou sem acúmulos/rank) é um **item
independente** dentro do array `"items"` do Ator — não fica "dentro" da
Habilidade nem da Ação que a usa. A ligação entre a Ação de ataque e
essa Condição é só uma **referência por UUID** (`condicoesAplicadas`,
seção 6), exatamente como referenciar as 16 Condições já prontas
(seção 4.6) — a única diferença é que, sendo uma Condição NOVA criada
no mesmo JSON, o UUID real só existe DEPOIS que o Foundry já criou o
item (na hora do import). Por isso, deixe `"uuid": ""` vazio na Ação e
sinalize na descrição que precisa ligar manualmente depois (seção 11)
— não tem como o JSON "adivinhar" um UUID que ainda não existe.

### 5.5 `"consumivel"`

```json
{
  "name": "Poção de Cura",
  "type": "consumivel",
  "img": "icons/consumables/potions/bottle-round-corked-red.webp",
  "system": {
    "quantidade": 1, "quantidadeMax": 1,
    "acoes": [ { "nome": "Beber", "curas": [ { "formula": "2d6", "aplicarNoAlvo": true } ] } ]
  }
}
```

---

## 6. Ação — a peça que "faz alguma coisa"

Toda Ação vive dentro de `acoes: [...]` de Habilidade/Arma/Magia/
Armadura/Consumível. Campos mais usados:

```json
{
  "nome": "Investida",
  "custoEstamina": 2,
  "custoMana": 0,
  "categoria": "Classe",
  "alcance": "2m",
  "ehAtaque": true,
  "atributoAtaque": "poderAtaque",
  "modoAlvo": "selecionado",
  "modoAlvoTravado": true,
  "danos": [ { "formula": "2d6+@poderAtaque", "aplicarNoAlvo": true } ],
  "condicoesAplicadas": [
    { "uuid": "", "acumulos": 1, "ativo": true, "soSeAcertar": true }
  ]
}
```

- **`custoEstamina`/`custoMana`**: custo fixo de usar ESTA ação.
- **`ehAtaque`** (bool) + **`atributoAtaque`**: se marcado, rola
  `1d20 + atributoAtaque` contra a Defesa do alvo. `atributoAtaque` aceita
  `"poderAtaque"`, `"poderMagia"`, ou qualquer atributo base
  (`"forca"`, etc.) pra casos especiais.
- **`danos`** / **`curas`**: array de blocos `{ formula, aplicarNoAlvo }`.
  `formula` aceita dado normalmente, e também estes tokens (todos com
  suporte a dado E `@atributo` juntos, sem restrição):
  - Atributos/meta-atributos: `poderAtaque`, `poderMagia`, `vitalidade`,
    `espirito`, `forca`, `agilidade`, `estamina`, `inteligencia`,
    `destino`.
  - `@alvoEstresse`: Estresse atual do alvo marcado (T) — pra "causa mais
    dano em alvos machucados/estressados".
  - `@alvoAcumulos`: quantos acúmulos o alvo tem de uma Condição
    específica — precisa de `usaCondicaoAlvo: true` +
    `condicaoAlvoUuid` na própria Ação apontando pra qual Condição
    contar.
  - `@alvoCondicoesDiferentes`: quantas Condições DIFERENTES (não
    acúmulos da mesma) o alvo tem ativas.
  - `@aliados_<N>m`: quantos aliados (mesma disposição) estão a até N
    metros de você agora — ex: `@aliados_6m`.
  - `@contagemArea`: quantos alvos válidos estão dentro do Template desta
    Ação — precisa de `usaContagemArea: true` na própria Ação.
  - `@crescimento`: nível de Crescimento escolhido pelo jogador nesta
    execução (0 se não usou) — só funciona com `usaCrescimento: true`
    na própria Ação.
  - ⚠️ **`@rank` NÃO funciona aqui** (resolve pra 0 silenciosamente) —
    diferente de `quantidade` num Gatilho (seção 7), que resolve `@rank`
    corretamente. Se precisar escalar dano por rank dentro de uma Ação,
    use o mecanismo "Por Rank" da própria fórmula de dano/cura (uma
    tabela rank→fórmula), não o token `@rank`.
  Lista completa e sempre atualizada também em "Consultar Fórmulas", na
  aba Opções da ficha do Personagem.
- **`modoAlvo`**: `"nenhum"` (manual, sem automação) | `"selecionado"`
  (usa os alvos marcados com T no Foundry, checa alcance e Defesa
  automaticamente) | `"area"` (cria uma área no mapa, pega todo mundo
  dentro). **Use `"selecionado"` sempre que possível** — é o que dá a
  automação completa (dano aplicado, condição aplicada, tudo sozinho).
  `numeroAlvos` (número, ou vazio = ilimitado) limita quantos alvos
  marcados a Ação afeta de verdade; `numeroAlvosPorRank` escala isso
  por rank (mesma tabela `{rank, quantidade}` de outros campos "por
  rank" abaixo).
- **`condicoesAplicadas`**: array de objetos — aplica uma Condição no
  alvo ao acertar.
  - `uuid`, `acumulos` (padrão 1), `ativo`, `soSeAcertar` (padrão
    `true`) — campos básicos, já cobertos acima. **`uuid` fica vazio**
    se a Condição é um item NOVO que a própria IA está criando junto
    (ver seção 11).
  - `perguntarParaEvitar` (bool) + `custoParaEvitarRecurso`
    (`"vida"|"estamina"|"mana"|"destino"|"estresse"`) +
    `custoParaEvitarQuantidade` (fórmula): se ligado, o alvo pode
    gastar esse recurso pra NÃO receber a Condição (aparece como
    escolha no popup de reação dele). Desligado (padrão) = a Condição
    é aplicada direto, sem chance de evitar.
  - `acumulosPorRank` (`[{rank, acumulos}]`): troca (não soma) o
    número de `acumulos` a partir do rank indicado — mesma lógica de
    "por rank" usada em Dano/Cura.
  - `custoParaEvitarQuantidadePorRank` (`[{rank, quantidade}]`): mesma
    ideia, pro custo que o alvo paga pra evitar.
  - `copiarRankDoItem` (bool, padrão `false`): se ligado, a CÓPIA da
    Condição aplicada no alvo herda o rank do item que a concedeu (útil
    quando a própria Condição tem `efeitosVinculados` que escalam por
    rank nela mesma — ver seção 5.4).
- **`gastosRecurso`**: array de objetos — drena um recurso do ALVO
  diretamente ao acertar (sem precisar criar uma Condição só pra
  isso). **Isto afeta sempre o ALVO da Ação, nunca quem a usou** — pra
  custo de usar a própria Ação, use `custoEstamina`/`custoMana` no
  nível da Ação, não isto.
  - `recurso`: `"vida"|"estamina"|"mana"|"destino"|"estresse"` (nomes
    fixos, diferentes dos nomes de campo do Ator — não é
    `"estaminaCombate"` nem `"dadosDestino"` aqui).
  - `quantidade` (fórmula): aceita dado (`"1d4"`) **e também
    `@atributo`** (ex: `"1d4+@poderMagia"`) — diferente de `danos`/
    `curas` (seção 4), aqui não existe restrição de token.
  - `ativo`, `soSeAcertar` (padrão `true`).
  - `perguntarParaEvitar` + `custoParaEvitarRecurso` +
    `custoParaEvitarQuantidade`: mesmo mecanismo de
    `condicoesAplicadas` acima — o alvo pode pagar pra evitar o dreno.
  - `quantidadePorRank` (`[{rank, quantidade}]`): troca a fórmula de
    `quantidade` inteira a partir do rank.
  - `custoParaEvitarQuantidadePorRank` (`[{rank, quantidade}]`): mesma
    ideia pro custo de evitar.
- **`usaTemplate`** (bool) + `templateTipo` (`"circle"|"cone"|"ray"`) +
  `templateTamanho` (metros) + `templateCor` (hex, opcional — cor do
  preenchimento no mapa) + `templateInvisivel` (bool, padrão `false` —
  liga pra um Template que só serve de gatilho geométrico, sem
  desenhar nada visível no mapa): cria uma área no mapa.
- **`usaEmpurrar`** (bool) + `empurrarMetros`: empurra o alvo ao acertar.
- **`usaAtropelador`** (bool) + `atropeladorQuantidade` (fórmula) +
  `atropeladorRaio` (metros, **padrão `"1"`, sempre inteiro — nunca
  fracionado, mesma regra de todo o resto do sistema**): ao acertar,
  causa esse dano direto (sem teste, sem reação) em todo inimigo
  dentro do raio do alvo principal — Peculiaridade "Atropelador N" do
  bestiário (seção 4.7).
- **`imparavelQuantidade`** (fórmula, vazio = desligado): garante essa
  quantidade de dano mesmo que o alvo Bloqueie com sucesso — Peculiaridade
  "Imparável N" do bestiário (seção 4.7).
- **`condicaoEmMimUuid`** (+ `condicaoEmMimAcumulos`): aplica uma
  Condição em QUEM USOU a ação (self-buff ao usar, independente de
  acertar).
- **`usaCondicaoAlvo`** (bool) + **`condicaoAlvoUuid`**: liga a
  contagem de acúmulos de uma Condição específica no alvo marcado,
  disponibilizando o número como `@alvoAcumulos` em qualquer fórmula
  desta MESMA Ação (ver seção 4 pra exemplos de uso do token). Sem
  isso ligado, `@alvoAcumulos` sempre resolve pra 0.
- **`critMinAjuste`** (fórmula, ex: `"-2"` ou `"-@alvoAcumulos"`):
  desloca o Crítico Mínimo desta Ação especificamente (independente da
  configuração geral da ficha) — número negativo facilita o crítico.
- **`usaRoubarRecurso`** (bool) + `roubarRecursoTipo`
  (`"vida"|"mana"|"estaminaCombate"|"dadosDestino"|"recursoCustom:<id>"`
  — aqui SIM são os nomes de campo do Ator, diferente de
  `gastosRecurso.recurso` acima) + `roubarQuantidade` (fórmula): ao
  ACERTAR, transfere essa quantidade do recurso do alvo pra quem usou
  a Ação — nunca rouba mais do que o alvo tem, nem concede mais do que
  cabe em quem roubou.
- **`condicaoAoDefletir`** / **`condicaoAoContraAtacar`** (uuid): só
  relevantes numa Ação de Arma usada pra Contra-Atacar (ver Capítulo
  III do manual/Prioridade) — aplica a Condição referenciada no
  ATACANTE ORIGINAL se o contra-ataque causar Deflexão
  (`condicaoAoDefletir`) ou em qualquer contra-ataque bem-sucedido
  (`condicaoAoContraAtacar`, mais amplo que só Deflexão).
- **`usaDarPrioridade`** (bool): Ação sem rolagem que avisa um alvo
  escolhido que "recebeu Prioridade", disparando o Gatilho por Evento
  `"recebeuPrioridade"` nele (seção 7) — não implementa o sistema
  completo de Prioridade do manual, só o gatilho + narração no chat.
- **`usaMultiplosAtaques`** (bool) + **`quantidadeAtaques`** (número):
  repete o teste de ataque (e dano) desta Ação essa quantidade de
  vezes na mesma execução (ex: Mísseis Arcanos do Mago, "até 3
  projéteis"), cada repetição rolando e resolvendo separadamente.
- **`usaContagemArea`** (bool) + `contagemAreaUuid` (uuid de uma
  Condição, opcional — filtra a contagem só pra alvos com essa
  Condição ativa) + `contagemAreaRaio` (metros) +
  `contagemAreaDisposicao` (`"aliados"|"inimigos"|"todos"`): conta
  quantos alvos válidos estão dentro desse raio ao redor de quem usou
  a Ação, disponibilizando o número como `@contagemArea` em fórmulas
  desta MESMA Ação (ver seção 4).
- **`usaCrescimento`** (bool) + `crescimentoCustoPorNivel` (fórmula de
  custo por nível de Crescimento) + `crescimentoMaxNiveis` (número):
  liga o mecanismo de "Crescimento" (Druida) — o jogador escolhe
  quantos níveis de Crescimento pagar antes de rolar, disponibilizando
  a escolha como `@crescimento` em fórmulas desta MESMA Ação.
- **`ataqueBonusExtra`** (fórmula livre, aceita `@atributo`, ex:
  `"1d4+@destino"`) soma no `"1d20 + atributoAtaque"` — substitui os
  antigos campos separados "Bônus fixo"/"Dado extra". `ataqueBonusPorRank`
  (`[{rank, formula}]`) troca essa fórmula inteira a partir do rank
  indicado, mesma lógica dos outros campos "por rank".

---

## 7. Gatilhos — reações automáticas a eventos

Dentro de uma Habilidade: `usaGatilhos: true` + `gatilhos: [...]`.

```json
{
  "usaGatilhos": true,
  "gatilhos": [
    { "evento": "euSofriDano", "recurso": "estaminaCombate", "quantidade": "1" }
  ]
}
```

- **`evento`**: um destes — `aliadoSofreuDano`, `aliadoAcertouAtaque`,
  `euSofriDano`, `euDeiDano`, `euCurei`, `euMateiAlguem`,
  `euAcerteiCritico`, `aliadoAcertouCritico`, `alguemRecebeuCondicao`,
  `euAcerteiAtaque`, `euErreiAtaque`, `useiMagia`, `useiArma`,
  `useiHabilidade`, `usoCrescimento`, `entrouOuEvoluiuProfusao`,
  `metadeVida`, `semEstamina`, `estresseAtingiu`, `recebeuPrioridade`,
  `condicaoAtingiuLimiar`, **`inicioTurno`**, **`fimTurno`**,
  **`inicioRodada`**, **`fimRodada`** (estes 4 disparam em TODO
  combatente automaticamente a cada mudança de turno/rodada, sem
  precisar de nenhuma outra Ação envolvida — pensados pra passivas do
  tipo "no início da rodada, recupero X" ou "toda rodada perco Y"),
  **`inicioCombate`** (1x, quando o combate começa — melhor que
  `inicioRodada` pra "ganho X ao entrar em combate", já que não repete
  a cada rodada), **`euGasteiDadoDeDestino`** / **`aliadoGastouDadoDeDestino`**,
  **`alguemErrouAtaque`** (QUALQUER personagem errar um ataque, não só
  você — não filtra aliado/inimigo, igual `alguemRecebeuCondicao`),
  **`euRealizeiDeflexao`** (dispara quando um Contra-Ataque resulta em
  Deflexão — Cap. III do manual; concede o recurso a quem DEFLETIU).
- **`recurso`**: o que ganhar quando dispara — `vida`, `mana`,
  `estaminaCombate`, `dadosDestino`, `estresse`, `recursoCustom:<id>`
  (seção 10), ou `condicaoEmMim:<uuid>` (concede uma Condição em vez de
  um número), ou os dois casos especiais que afetam quem ATACOU o dono
  desta Habilidade em vez do próprio dono (só funcionam com um evento
  que tenha um "atacante" identificável no contexto — hoje:
  `euSofriDano` e `euRealizeiDeflexao`): `danoNoAtacante` (causa dano) e
  `estresseNoAtacante` (soma Estresse).
  **`estresse` é o único caso onde normalmente se usa quantidade
  NEGATIVA** (ex: `"-1"`) — já que o uso mais comum é REDUZIR Estresse
  (uma Regeneração), não aumentar. Os outros recursos normalmente usam
  quantidade positiva.
- **`quantidade`**: fórmula, ACEITA DADO DE VERDADE (`"1"`, `"1d4"`,
  `"@nivel"`, `"@rank"`, `"-1"`) — Gatilhos rolam com o motor de dados
  real do Foundry, diferente de Modificadores de Efeito/Condição/
  Pigmento/Bônus Manual (seção 4), que só aceitam aritmética simples
  (número, `+`, `-`, `*`, `/`, `@atributo`) e NUNCA dado — um `"1d4"`
  num Modificador falha silenciosamente e vira 0.

### Limitando um Gatilho a "N vezes por combate/dia/rodada"

Combine com `usaUsosPassiva` no mesmo nível da Habilidade — TODOS os
Gatilhos dela compartilham o MESMO contador:

```json
{
  "usaUsosPassiva": true,
  "usosPassivaAtual": 3,
  "usosPassivaMax": 3,
  "usosPassivaReset": "cena",
  "usaGatilhos": true,
  "gatilhos": [
    { "evento": "inicioRodada", "recurso": "vida", "quantidade": "@nivel" },
    { "evento": "inicioRodada", "recurso": "estresse", "quantidade": "-1" }
  ]
}
```

`usosPassivaReset`: `"turno"` | `"rodada"` | `"cena"` (= por combate) |
`"dia"`. Este exemplo é uma Regeneração real: no início de cada rodada,
recupera Vida igual ao nível E reduz 1 de Estresse, até 3 vezes por
combate (os dois Gatilhos gastam do MESMO contador de 3, não 3 cada).

- **Filtros opcionais**: `condicaoNecessariaUuid` (só dispara se você já
  tiver essa Condição ativa), `alcance` (metros, só pra
  `aliadoSofreuDano`), `condicaoFormula` (fórmula livre que precisa dar
  ≠0).

---

## 8. Checklist rápido pra auditar o JSON que a IA gerou

- [ ] Toda Ação tem nome **específico** (não "Ataque", "Golpe", "Usar"), com a arma natural e o elemento no nome quando o livro permitir — é por ele que a animação é escolhida (seção 15).
- [ ] Nenhuma configuração de animação (`flags.autoanimations`, caminhos de vídeo) dentro do JSON.

- [ ] Todo `formula`/`valor` que referencia atributo usa `@nomeExato`
      (sem acento: `poderAtaque`, não `poderataque` nem `Poder de Ataque`).
- [ ] `atributoAtaque`/`campo` em modificadores usa os nomes EXATOS da
      tabela da seção 4 — qualquer erro de digitação faz o campo ser
      silenciosamente ignorado (Foundry não avisa).
- [ ] Ações que devem acertar/errar automaticamente têm `modoAlvo:
      "selecionado"` (não `"nenhum"`).
- [ ] Condições/Efeitos que devem travar um valor em zero usam
      `"valor": "=0"`, não `"0"`.
- [ ] `vida.value`/`mana.value`/`estaminaCombate.value`/
      `dadosDestino.value` batem com os `.max` calculados (personagem
      "cheio", **já contando os Pigmentos**), a menos que você narrou o
      personagem já ferido. `stress.value` ficou em 0 (nunca no máximo
      — Estresse alto é ruim).
- [ ] Nenhum `img` é `.svg`, nenhum se repete na ficha, e todos seguem
      a seção 14 (pasta pelo tipo, palavra do tema em inglês, cor).
- [ ] Todo `img` é um caminho que **existe** no arquivo
      `icones-foundry.txt` (a lista oficial de ícones do Foundry, anexada
      junto deste guia). Não invente nem "adivinhe" um caminho parecido:
      procure na lista por uma palavra do tema (ex.: `claw`, `fear`,
      `frog`, `lightning`) e copie o caminho exato. Sem nada adequado,
      use um genérico da pasta `icons/svg/` que esteja na lista.
- [ ] Toda Condição nova está **dentro** do `"items"` do Ator, com
      `"system.ativo": false` e `"flags.nauren.modelo": true`, e as
      Ações apontam para ela com `"self:Nome"` (seção 11). Nenhum item
      de Condição separado, nenhum `"uuid": ""` vazio.
- [ ] Cada `"self:..."` bate LETRA POR LETRA com o `"name"` de um modelo da
      mesma ficha (conferido um a um). Variante de efeito = outro modelo
      com outro nome.
- [ ] Existe uma Habilidade `"Perjúrio do Acaso: ..."` com uma Ação
      `"consomePerjurio": true` e uma frase para o Mestre na descrição.
- [ ] Existe a Habilidade `"Ponto Fraco"` (seção 4.7) e as `notas` têm
      as 5 partes, incluindo o **Plano de luta** com a ordem das
      habilidades e o uso do Perjúrio.
- [ ] Nenhum `alcance`/raio de template usa número fracionado (`"1.5m"`,
      `"2.5m"`) — o Nauren só usa metros inteiros, diferente de D&D
      5e/outros sistemas (seção 3). `movimento` é 6 a menos que haja um
      motivo específico pra ser diferente.
- [ ] Toda Ação que acerta um alvo (ataque ou dano em alvo marcado) tem
      `"tipoAlcance": "corpoACorpo"` ou `"distancia"` (regra 4b).
- [ ] Bando de lacaios (seção 16.1): `flags.nauren.bando.ativo: true`,
      `prototypeToken.actorLink: false`, Vida dividida pelos membros e
      dano/custo das Ações com `@bandoNoAlcance`.
- [ ] Nenhum campo de `motion*` foi preenchido sem motivo: o padrão
      `"auto"` já anima bote, recuo, tremida e esquiva sozinho (16.4).

---

## 8b. Escala do monstro nas fórmulas (`@vb`, `@danoCat`, `@meioCat`, `@estCat`)

Toda criatura tem `nivel` e `categoriaMonstro` (1 a 4). A partir deles o
sistema calcula, em qualquer fórmula de Ação, Gatilho, Condição ou Efeito:

| Variável | O que é | Valores |
|---|---|---|
| `@vb` | Valor Base pelo nível | 1-5: 3 · 6-10: 4 · 11-15: 5 · 16-18: 6 · 19-20: 10 · 21-23: 11 · 24-26: 12 · 27-29: 13 · 30: 14 |
| `@categoria` | Categoria da ficha | 1 a 4 |
| `@danoCat` | dado de dano da Categoria (**é um dado**: só em dano/cura) | 1d6 / 2d8 / 3d10 / 4d12 |
| `@meioCat` | metade do dado, arredondando para cima | 1d6 / 1d8 / 2d10 / 2d12 |
| `@estCat` | Estamina extra por ataque | +0 / +1 / +2 / +3 |

Use-as em vez de números fixos sempre que a habilidade deva escalar com a
criatura: `"danos": [{"formula": "@danoCat+@poderAtaque"}]`,
`"quantidade": "@vb-1"` (Envenenador), `"formula": "@meioCat"` num efeito
periódico. O custo de Estamina continua um número inteiro; para somar a
Estamina extra da Categoria, ligue `"custoEstaminaPorCategoria": true` na
Ação (Cat. 1 +0 … Cat. 4 +3) - o HUD e o card já mostram o custo final.
`@danoCat`/`@meioCat` num Modificador (número) viram 0.

### Condições novas do catálogo (compêndio, use por `uuid` ou `self:`)
Esgotado (-1 Estamina máx. por acúmulo, 5 = Desacordado), Emudecido (sem
Ações com Mana, manual), Provocado (Dificuldade nos ataques por 1 rodada),
Debilitado (-1 de dano por acúmulo), Exposto (Facilidade e +2 no próximo
dano sofrido, some ao sofrer dano), Hesitante (sem Prioridade por 1 rodada),
Engolido (movimento 0, `@meioCat` por rodada), Sufocando (+1 acúmulo por
rodada, 5 = Desacordado), Infestado (1 dano por acúmulo por rodada, 5 =
Atordoado), Putrefato (cura recebida 0 por 2 rodadas), Fascinado (não mira
em quem aplicou, manual).

Modificadores novos de Condição/Efeito: `danoRecebido` ("+2" = sofre +2 em
todo dano) e `curaRecebidaPercentual` ("100" = nenhuma cura, "50" = metade).

## 8c. Imunidades, fim da Condição e "Vida chegou a 0" (Fase 2)

- **Imunidade a Condições:** em qualquer Habilidade/Efeito/Peculiaridade passiva (ou numa Condição), `"imunidadesCondicoes": ["self:Preso/Agarrado", "Sangramento", "<uuid>"]`. O dono nunca recebe essas Condições; a tentativa aparece no card como "Imune a X (nome da habilidade)" e a ficha lista "Imune a: …" acima das Condições. Ex.: Corpo Espectral da Fera Espiritual.
- **Fim da Condição (campos da própria Condição):** `removerAoSofrerDano` (some depois do próximo dano), `removerAoAtacar` (some quando o portador faz um teste de ataque; ex.: Invisível), `duracaoRodadas` (termina sozinha), `custoParaRemoverRecurso`/`custoParaRemoverQuantidade` (libertar-se pagando), `imuneAoEvitar` (quem evita pagando o custo fica imune pelo combate; ex.: um rugido aterrador). Todo fim gera um card "Condição encerrada" com o motivo.
- **Gatilho `vidaZerou`** ("Minha Vida chegou a 0"): dispara antes de a criatura ser marcada como derrotada. Combine com `"recurso": "vida"` (ficar de pé com N de Vida; use `limiteUsos: "1", limiteEscopo: "cena"` para 1 vez por combate), `"recurso": "oferecerAcaoDesteItem"` (uma última Ação: explosão, grito) ou `condicaoEmMim`. Se a reação devolver Vida, o card "Continua de pé" aparece e a criatura não cai. Aliados recebem o evento `aliadoCaiu`.

## 8d. Requisitos pelo alvo, filtros de Gatilho e condicionais de ataque (Fase 3)

- **Requisito pelo alvo:** `usaCondicaoAlvo: true`, `condicaoAlvoUuid` e `exigirCondicaoAlvo: true` bloqueiam a Ação se o alvo não tiver a Condição (o HUD apaga o botão e diz o motivo). `@alvoAcumulos`, `@alvoTemCondicao`, e os novos `@alvoFerido` (1 se o alvo está abaixo da Vida máxima) e `@alvoMetadeVida` (1 se está na metade ou menos) servem em qualquer fórmula.
- **Área filtrada por Condição:** `areaSoComCondicaoUuid` (+ `areaCondicaoModo: "com"|"sem"`, `areaCondicaoSoMinha: true` = só quem recebeu a Condição de mim). Ex.: "esmaga quem está Preso por mim".
- **Filtros de Gatilho:** `filtroAlcanceAtaque: "corpoACorpo"|"distancia"` e `filtroOrigemAtaque: "arma"|"magia"` nos eventos de ataque (Eu sofri dano, Fui alvo, Fui atingido). Ex.: Defesa Espinhosa do Javatusco só contra corpo a corpo.
- **Condicionais de ataque (na Ação):** `danoNoErroFormula` (o alvo sofre isso quando o ataque erra, sem reação; nunca em falha crítica) e `limiarExecucaoFormula` (depois do dano, se a Vida do alvo ficar ≤ o valor, cai a 0). O card do atacante não revela nada: a linha "Dano no erro: −N" ou "Execução: ... a Vida foi a 0" só aparece no alvo em que aconteceu. Na ficha, ficam no bloco **◈ Condicionais** da Ação (junto de "Verificar Condição no Alvo", que tem o "Exigir esta Condição no alvo").

## 8e. Condição ligada a quem aplicou e movimento sem Prioridade (Fase 4)

Toda Condição aplicada por uma Ação guarda quem a aplicou (`conjuradorUuid`, o token do atacante). Estes campos da Condição usam esse vínculo (Condições postas à mão não têm origem e eles ficam sem efeito):

- `origemAfastaMetros: 2` — a Condição termina se quem aplicou ficar a mais de N m do portador (borda a borda), conferido a cada movimento dos dois; card "Condição encerrada · X se afastou". Ex.: Preso/Agarrado por mordida, Guardado.
- `origemCaiRemove: true` — termina quando quem aplicou chega a 0 de Vida ou é retirado da cena (card "Condição encerrada · X caiu"). Ex.: Engolido, Selo de Supressão, Guardião Vinculado.
- `arrastarComOrigem: true` — quando o token de quem aplicou se move, o portador é deslocado junto (mesmo vetor), sem custo de Estamina para ele; card "Arrastado". Ex.: Engolido, Garras de Rapina, Carregar a Presa.
- `modificadoresExcetoOrigem: true` — Facilidade/Dificuldade, bônus de ataque e de dano desta Condição não valem quando o alvo marcado é quem a aplicou. O card de ataque mostra "Provocado: não vale contra quem aplicou". Ex.: Provocado (já vem assim).
- `periodicoCuraOrigem: true` — o dano periódico desta Condição cura quem aplicou no mesmo valor (passa pelas reduções de cura dele); o card do portador mostra "X recupera" e quem aplicou recebe o card "Drenou Vida". Ex.: Parasita Interno, Acoplar-se.

**Movimento sem Prioridade (M02):** `movimentoSemPrioridadeMetros: "3"` em Habilidade, Magia, Efeito, Peculiaridade ou Condição (ativa). Ao chegar perto de um inimigo, se o trajeto do movimento ainda cabe nesses metros no turno, o card "Aproximação" diz "<item>: não gera Prioridade (2 de 3m neste turno)" e a Prioridade não é oferecida; passando disso, segue a regra normal. Aceita `@rank`, `@categoria`, `@nivel`; `"99"` = qualquer distância. Vale a maior fonte (não somam). Ex.: Peculiaridade Espreitador N (Mao Nyx já vem automatizado), Recuo Ágil, Rasante Esquivo. Para "Golpe e Fuga" (recuo sem Prioridade só depois de atacar), aplique em você mesmo uma Condição com `movimentoSemPrioridadeMetros: "3"` e duração de 1 turno do portador.

## 8f. Travas, invocar ficha e entidade que segura (Fase 5)

**Travas na Condição (M11):**
- `travaAcoesMana: true` — Ações com custo de Mana (fixo ou por nível) ficam apagadas no HUD ("Emudecido: não pode usar Ações que custam Mana") e, se usadas, não acontecem (card "Ação travada"). Emudecido já vem assim.
- `travaAtaques: true` — Ações de ataque ficam travadas do mesmo jeito. Ex.: Forma Encouraçada, Dissolver-se em Névoa.
- `proibeContraAtaque: true` — some a opção Contra-Atacar do popup de reação, com a nota "indisponível por: X" (junto de `proibeBloqueio`/`proibeEsquiva`). Hesitante já vem assim.
- `naoRecebePrioridade: "aliados" | "todos"` — o nome aparece bloqueado na escolha de Prioridade e, se escolhido, o card diz "X não pode receber Prioridade (Hesitante)". Hesitante já vem com `"todos"`.

**Invocar ficha (M10), na Ação:** `usaInvocar: true`, `invocarAtorUuid` (ficha do mundo ou do compêndio; do compêndio ela é copiada uma vez para a pasta "Nauren — Invocações"), `invocarQuantidade: "@categoria+1"`, `invocarDistancia: "2"` (m), `invocarNaIniciativa: true` (entra logo depois de quem invocou). Para Cisão: `invocarCopiaDeMim: true` + `invocarDividirVida: true` (a cópia leva as Condições atuais; a Vida atual é dividida e o card não mostra números). Os tokens surgem nas casas livres mais próximas; o card "Invocação" lista quem surgiu. Ao morrer/matar: Gatilho `vidaZerou`/`euMateiAlguem` com efeito `oferecerAcaoDesteItem` nesta Habilidade.

**Entidade que segura (M13), na Ação com Entidade de campo:** `entidadeNoAlvo: true` (surge na casa à direita do alvo atingido, sem escolher no mapa; errando, não surge) e `entidadeSeguraCondicoes: true` (as Condições desta Ação no alvo ficam presas à entidade: destruí-la — Vida 0 — solta o alvo com card "Condição encerrada"; se o alvo se soltar sozinho, a entidade some). Dê `entidadeVida` para poder ser destruída. Ex.: Rede (Preso + entidade "Rede" com Vida @vb).

## 8g. Desviar o ataque e dividir o dano (Fase 6)

**Reações antes do ataque** (`reacaoPreAtaque` na Habilidade), além de `proteger` e `dificuldade`:
- `escudoVivo` — quando **eu** sou o alvo, escolho numa lista um aliado a até `reacaoNovoAlvoRaio` m de mim (padrão `"1"` = colado) e o ataque passa a mirar ele. Ex.: Escudo Vivo.
- `desviar` — quando **eu** sou o alvo, escolho qualquer criatura (menos quem ataca e eu) a até `reacaoNovoAlvoRaio` m de quem ataca (padrão `"1"` = colada nele) e o ataque vai para ela. Com `reacaoResistirRecurso: "estresse"|"estaminaCombate"|"mana"` + `reacaoResistirQuantidade`, quem ataca recebe "Pagar N para resistir?" antes de rolar; pagando, mantém o alvo. Ex.: Desvio Enganoso (resistir com 1 Estresse).
Os dois usam o mesmo custo/usos/cronômetro de `proteger` e escrevem no card "o ataque vai para X" (ou "resistido").

**Dividir o dano** (Habilidade, Magia, Efeito ou Peculiaridade ativa): `dividirDanoPercentual: 50` + `dividirDanoCondicaoUuid` (a Condição que marca o vinculado). Quando o dono sofre dano de ataque, depois das reduções, essa % vai para a primeira criatura da cena que tem essa Condição **aplicada por ele**; o card do ataque diz "Vínculo de Dor: 5 passou para X" e o vinculado recebe o card "Dano dividido". Ex.: Cobrir a Vítima (50%, Preso/Agarrado), Vínculo de Dor.

## 8h. Compêndio "Nauren - Habilidades de Monstros" (0.81)

Antes de inventar uma Habilidade para um monstro, **procure no compêndio "Nauren - Habilidades de Monstros"** (só o Mestre vê). São ~500 Habilidades prontas, automatizadas, com descrição em linguagem de mesa, ícone próprio e animação/som pelo nome, em pastas por família (Ataques Naturais, Sopros e Cones, Jatos e Linhas, Explosões em Ponto, Ondas ao Redor de Si, Projéteis e Raios, Auras, Áreas Persistentes, Defesas Reativas, Reações, Movimento, Apoio e Cura, Chefes e Vilões...). A pasta "Estados das Habilidades" guarda as Condições próprias delas (Enfurecido, Inspirado, Calcificando, Forma de Névoa...).

- **Escala pela Categoria:** os danos usam `@danoCat` (golpe principal), `@meioCat` (áreas e golpes com efeito forte) e `@vb`; o custo usa `custoEstaminaPorCategoria`. A mesma Habilidade serve num monstro de Categoria 1 ou 4 sem editar nada.
- **Variantes de elemento, forma e tamanho:** a mesma mecânica existe em vários elementos (Fogo, Gelo, Ácido, Relâmpago, Peçonhento, Sombras, Luz, Trovão, Psíquico, Tinta, Prisma, Ruína, Vento, Pedra, Água, Vazio), cada um com a Condição característica (Queimando, Congelando, Corroído, Eletrizado, Envenenamento, Amedrontado, Cego, Caído, Hesitante, Lerdeza, Fragmentado, Putrefato, Esgotado...) e em formas diferentes: Bafo (cone 2 m), Sopro (cone 4 m), Sopro Devastador (cone 8 m, 1×/combate, nível 6+), Jato (linha 9 m), linha longa (15 m), Explosão em ponto (raio 2 m a até 12 m + 3 m/Categoria), Grande Explosão (raio 4 m), Pulso (raio 2 m em si), Projétil (18 m), Toque (corpo a corpo), Aura (Emanação 2 m), Campo (área persistente 3 rodadas) e Pele (reação a golpes corpo a corpo).
- **Nomes genéricos:** nada de nomes de outros sistemas. Ex.: "Sopro de Fogo", "Sopro Devastador de Gelo", "Pulso Sugador de Cor", "Mãos das Sombras".
- **Animação pelo nome:** cada Ação tem uma entrada própria no `nauren-aa-menu-completo.json` (JB2A + som do Forge). Se renomear a Ação, ela cai na animação de reserva.
- **Para o Criador de Monstros:** cada item guarda `flags.nauren.habMonstro` = `{ id, familia, funcao: [...], nivelMinimo, elemento, forma, catalogo }`. Filtre por função (Atacante/Defensor/Suporte) e nível mínimo.
- **Condições novas:** Eletrizado (−1 Bloqueio/Esquiva por acúmulo, sem Contra-Ataque, 1 rodada) e Corroído (1 de dano por acúmulo por rodada e −1 de Defesa por acúmulo, 2 rodadas) — no compêndio de Condições.
- **Fórmulas em Auras:** a quantidade de uma Emanação agora aceita `@vb`, `@categoria`, `@meioCat`... (resolvidos pelo dono da aura).
- **Auras animam quando agem:** toda vez que uma Emanação aplica efeito, toca a animação do menu com o nome do item (se existir).
- **"Minha Vida chegou a 0" sabe quem deu o golpe final:** `danoNoAtacante` e `condicaoNoAtacante` funcionam nesse evento (ex.: Maldição do Algoz, Mordida Derradeira).
- Peças que dependem de outra ficha (Chamar Reforços, Ninhada, Erguer os Caídos, Guardião Vinculado): arraste a ficha do lacaio para o campo "Invocar ficha" da Ação ao montar a criatura.

## 8i. Criador de Monstros e NPCs (0.82)

Janela guiada do Mestre (botão "Criador de Monstros" na ficha de NPC em Editar Ficha, botão no rodapé do diretório de Atores, ou a pergunta ao abrir um NPC vazio). Cinco etapas: Identidade (nome, retrato, token, Monstro ou NPC comum) → Nível, Função e Categoria (distribuição 2:1 automática, tetos por faixa, tamanho do token independente da Categoria, Chefe) → Características (Peculiaridades do Codex, Ponto Fraco, bônus livres, Pigmentos) → Habilidades (o compêndio de Habilidades de Monstros + Armas comuns, com filtros por Função e nível) → Revisar (ajuste fino de atributos, Vida, Estamina, Estresse, Defesa e Movimento) e criar no mundo ou no Bestiário.

- **Número de Habilidades por nível** (medido nos 16 monstros do Codex): 4 (nv 1-5), 5 (6-10), 6 (11-15), 7 (16-20), 8 (21-25), 9 (26-30); Chefe +1. Peculiaridades: 1 / 2 / 3 / 3 / 4 / 4. Passar do limite só avisa.
- As Peculiaridades entram como item descritivo **e** são aplicadas nas Ações de ataque das habilidades copiadas (Envenenador/Lacerador/Assustador/Enlouquecedor → Condição no acerto; Atropelador; Imparável; Bando → `N*@aliados_6m` no teste; Alcance → Efeito Vinculado `alcanceBonus`; Espreitador → `movimentoSemPrioridadeMetros`; Vigilante → +1 Estamina no início do combate).
- Vida, Estamina e Estresse ajustados à mão viram o item "Ajustes do Criador" (apagar o item volta ao cálculo). Movimento padrão 6; Defesa = 10 + Valor Base até o teto da faixa.
- A ficha criada guarda `flags.nauren.criadorMonstro = { funcao, chefe, versao }` e cada item copiado guarda `flags.nauren.origemCriadorMonstro` (UUID de origem no compêndio).
- **0.83:** clicar numa habilidade da lista expande a descrição completa; "abrir" abre a ficha do item no compêndio; com Peculiaridades de golpe marcadas, cada habilidade com teste de ataque mostra caixas para escolher **em quais ataques** elas entram (padrão: todas). O item "Peculiaridade: X" lista em quais ataques entrou.

## 8i-2. Balanceamento do Criador (0.87)

Estudo completo em `nauren-estudo-balanceamento-0.87.0.md`. Regras que o Criador aplica (os 16 monstros do Bestiário não mudam):

- **Teto por Função** (0.88), em múltiplos do teto de Estamina da faixa (7/9/12/14/16/17/18): Atacante Agi ×1,15 · Est ×1 · For ×0,85 · Int ×0,55 · Des ×0,5; Defensor For ×1,3 · Est ×1 · Agi ×0,7 · Int ×0,5 · Des ×0,55; Suporte Int ×1,2 · Des ×1 · Est ×0,9 · For ×0,65 · Agi ×0,55. A Estamina nunca passa do teto da faixa (é o quanto a criatura age por rodada), só pelo bônus de Defensor. A distribuição respeita os tetos; o que sobra se perde.
- **Pigmentos passam de qualquer teto**: atributos, Poder de Ataque/Magia e Defesa recebem o teto ANTES do Pigmento; o que o Pigmento dá entra por cima.
- **Pesos por Função** (não mais 2:1 igual): Atacante Agi 3 · Est 2,5 · For 2 · Int 1 · Des 1; Defensor For 3 · Est 3 · Agi 1,5 · Int 1 · Des 1; Suporte Int 3 · Est 2,5 · Des 2 · For 1,5 · Agi 1.
- **Bônus de Função que passa do teto**: +1 (nível 1-5), +2 (6-15), +3 (16-20), +4 (21-30) em Agilidade (Atacante), Força e Estamina (Defensor), Inteligência e Destino (Suporte).
- **Extras**: Atacante +1 no teto de Poder de Ataque; Defensor +1 Defesa; Suporte +1 no teto de Poder de Magia (teto de PdM = teto de PdA).
- **Vida = Vitalidade × Categoria × (Nível + 2)** (`calculoVida: "customizado"`, `vidaFormula: "@vitalidade * @categoria * (@nivel + 2)"`); NPC comum sem `@categoria`.
- **Chefe**: Vida ×1,5 (na fórmula), +1 Defesa, Estamina de Combate + (1 + Estamina extra da Categoria) = 1 ataque a mais por rodada, +1 Habilidade.
- **Estresse máximo** (0.87.1): a tabela do documento de criação, 3 / 4 / 5 / 6 pela Categoria (2 + Categoria), sem extra de Função nem de Chefe. NPC comum: 3.
- **Deslocamento**: fixo em 6 (decisão de mesa, diferente do "3 + Valor Base" do documento); o Mestre digita outro valor no Criador se quiser.
- **Pigmentos**: 2 já vêm marcados ("Cores são sempre 2 ou mais"); menos de 2 só avisa.
- **Grupo indicado**: o painel mostra "jogadores de nível N/2+" (regra do Codex: nível máximo que os jogadores enfrentam = nível do inimigo ÷ 2, combate mortal).
- Tetos de PdA/PdM viram modificador no item "Ajustes do Criador" (a ficha calcula o valor bruto; o item corta).

## 8j. Automação nova para monstros (0.83)

Campos criados para automatizar passivas do compêndio (todos aparecem na ficha do item):

- **Efeitos em Ataques** (Habilidade/Condição/Efeito, `efeitosEmAtaques[]`, `tipoAtaque: "qualquer"`): `danoVerdadeiroExtra` (fórmula, ex. `@vb` — Golpe Penetrante), `danoNoErro` (fórmula — Golpe Tenaz: todo ataque sem "Dano no erro" ganha este), `danoMaximoSeAlvoCondicaoNome` (ex. `Caído` — Pisoteador), `acertoExtraFormula` (ex. `@aliados_6m` — Táticas de Bando).
- **Ajuste no ataque recebido com filtro** (`ataqueRecebidoFormula` + `ataqueRecebidoSoOrigem`: `magia` | `arma` | `corpoACorpo` | `distancia`) — Pele Antimágica = `-2` só em ataques com Poder de Magia.
- **Gatilho "Eu recebi uma Condição"** (`euRecebiCondicao`; contexto: `condicaoUuid`, `condicaoNome`, `condicaoItemId`, `acumulosRecebidos`) com os filtros `condicaoNomeContem`, `perguntarPagarEstresse` e `pagarEstamina`, e os efeitos `removerCondicaoRecebida` (quantidade = acúmulos ou `todos`) e `transferirCondicaoRecebida` (aliado a até `alcance` m sem essa Condição). Usados por Vontade Férrea, Recusar o Destino e Transferir Aflição. `limiteUsos` aceita `@categoria`/`@vb`.
- **`soDeQuemAplicou`** também vale em "eu acertei/errei um ataque": o ALVO precisa ser quem aplicou a Condição (Carga Residual: gatilho na Condição, `vida: -@acumulos`).
- **Variantes de Emanação por Condição do dono** (`emanacaoVariantes[] = { seCondicaoUuid, condicaoUuid, acumulos }`): a aura aplica a Condição da variante cuja Condição o dono tiver (Semblante Mutável: Terror/Delírio/Peso). Com variantes, a aura só dispara quando o dono tiver uma delas (ou a de `emanacaoAtivaSePorCondicaoUuid`).
- **Atropelador** (`usaAtropelador`): agora só atinge INIMIGOS do atacante adjacentes ao alvo (nunca o próprio atacante nem aliados), aceita `@categoria`/`@vb` na quantidade e posta o card "Atropelador" com cada atingido.
- **Lacaio**: Efeito Vinculado `vida: "=1"` (Vida máxima fixa em 1). **Desnorteado**: gatilho `inicioTurno` com `rolarLimiar` (1d6, card "Rolagem").

## 8k. Entidades de campo: paredes e Condições (0.84)

- **Entidade não recebe Condição nem Efeito.** Áreas, auras, ataques e arrastar: nada cria Condição/Efeito numa ficha com `flags.nauren.entidade` (`aplicarCondicao` devolve nada e um `preCreateItem` barra o resto). Dano continua valendo (um muro com Vida pode ser destruído).
- **Paredes de quem bloqueia (`entidadeBloqueia`)**: agora são 8. 4 de **movimento** (ninguém atravessa; não cortam visão) e 4 de **visão/luz de mão única**, viradas para fora: quem está fora **vê a entidade** (e pode dar alvo), mas não enxerga através dela. Mover o token leva as 8 paredes junto. Cada parede tem `flags.nauren.paredeEntidade` = `movimento` | `visao`.
- O token de uma entidade ativa fica sempre visível para quem está na cena (a não ser que o Mestre o esconda).
- Entidades criadas antes da 0.84 continuam com as 4 paredes antigas até serem encerradas.

## 9. Emanação (auras persistentes)

```json
{
  "usaEmanacao": true,
  "emanacaoEvento": "inicioTurno",
  "emanacaoRaio": "3",
  "emanacaoDisposicao": "inimigos",
  "emanacaoEfeito": "dano",
  "emanacaoQuantidade": "1d4"
}
```
`emanacaoEfeito`: `"dano"|"cura"|"estresse"|"estamina"|"condicao"|"nenhum"`
(se `"condicao"`, usa `emanacaoCondicaoUuid`/`emanacaoCondicaoAcumulos`;
se `"nenhum"`, a Emanação é SÓ visual — desenha a Região no mapa, sem
nenhum efeito mecânico, sem nem procurar alvos dentro dela).
`emanacaoDisposicao`: `"aliados"|"inimigos"|"todos"`.

---

## 9.5 Template Persistente (área/armadilha que fica no mapa)

Diferente de Emanação (que acompanha SEU token, sem nada desenhado no
mapa), Template Persistente cria uma área FIXA no local onde a Ação foi
usada — ex: uma Armadilha de Caça, um campo de espinhos, uma poça
venenosa. Fica dentro de uma Ação (não no nível da Habilidade):

```json
{
  "acoes": [{
    "nome": "Armadilha de Caça",
    "custoEstamina": 1,
    "alcance": "6m",
    "modoAlvo": "area",
    "usaTemplate": true,
    "templateTipo": "circle",
    "templateTamanho": 1,
    "usaTemplatePersistente": true,
    "templatePersistenteDuracaoRodadas": "3",
    "templatePersistenteEventoPeriodico": "inicioTurno",
    "templatePersistenteAoEntrar": true,
    "templatePersistenteDisposicao": "inimigos",
    "templatePersistenteEfeito": "dano",
    "templatePersistenteQuantidade": "1d6",
    "templatePersistenteCondicaoUuid": "",
    "templatePersistenteCondicaoAcumulos": "1"
  }]
}
```

- **`usaTemplate` + `templateTipo`/`templateTamanho`** sempre precisam
  vir junto (é a área desenhada no mapa em si — ver seção 6).
- **`templatePersistenteDuracaoRodadas`**: quantas rodadas a área dura
  antes de desaparecer sozinha (decrementa 1 no fim de cada rodada,
  independente de ter efeito periódico configurado ou não).
- **`templatePersistenteEventoPeriodico`**: `""` (nenhum — só o gatilho
  "ao entrar" importa) | `"inicioTurno"` | `"fimTurno"` |
  `"inicioRodada"` | `"fimRodada"`. Aplica o efeito em quem estiver
  dentro da área nesse momento.
- **`templatePersistenteAoEntrar`**: `true`/`false` — se `true`, aplica
  o efeito imediatamente quando alguém ENTRA na área (quem já estava
  parado ali quando a área foi criada NÃO conta como "entrou").
  Combine com o evento periódico pra "machuca ao entrar E a cada
  rodada", ou use só um dos dois.
- **`templatePersistenteDisposicao`**: `"aliados"|"inimigos"|"todos"` —
  filtra quem é afetado, relativo a quem criou a área.
- **`templatePersistenteEfeito`**: `""` (nenhum efeito numérico, só a
  Condição abaixo, se houver) | `"dano"` | `"cura"` | `"estresse"` |
  `"reduzEstresse"` | `"estamina"` (perda) | `"restauraEstamina"`.
- **`templatePersistenteQuantidade`**: fórmula, ACEITA DADO DE VERDADE
  (rola com `Roll` real do Foundry, não o parser simples de
  Modificador) — mas **NÃO aceita `@atributo`** (não tem como saber de
  quem é o Poder de Magia/etc quando o efeito dispara sozinho depois; a
  área "esqueceu" quem a criou pra esse fim) — use só número/dado puro
  (`"1d6"`, `"2d4+3"`), nunca `"1d6+@poderMagia"`.
- **`templatePersistenteCondicaoUuid`/`templatePersistenteCondicaoAcumulos`**:
  opcional, INDEPENDENTE do efeito numérico acima — uma área pode causar
  dano E aplicar uma Condição ao mesmo tempo (ex: Armadilha de Caça real:
  1d6 de dano E fica Preso). Só suporta 1 Condição por área — pra "duas
  Condições diferentes ao ativar", documente a segunda como manual na
  descrição.

**Diferença chave em relação a Emanação**: Emanação sempre acompanha SEU
token (não fica desenhada, recalcula a distância toda vez); Template
Persistente é uma área FIXA no mapa, existe mesmo se você se mover pra
longe ou morrer.

---

## 10. Recurso customizado (barra própria, tipo "Fúria")

Dentro de uma Habilidade:
```json
{
  "recursosDeclarados": [
    {
      "id": "furia",
      "nome": "Fúria",
      "maxFormula": "5",
      "icone": "fa-fire",
      "cor1": "#3a1a1a",
      "cor2": "#c24b4b",
      "resetarNoEscopo": "combate"
    }
  ]
}
```
`resetarNoEscopo`: `""` (nunca reseta) | `"combate"` | `"rodada"`.

---

## 11. Condições novas ficam DENTRO da ficha do NPC (referência `self:`)

Desde a versão 0.43 **não se cria mais um item separado** para uma
Condição nova de monstro. A Condição vai como um item `"condicao"`
**dentro do mesmo `"items"` do Ator**, marcada como **modelo**:

```json
{
  "name": "Enraizado",
  "type": "condicao",
  "img": "icons/svg/net.svg",
  "system": { "ativo": false, "modificadores": [{ "campo": "movimento", "valor": "=0" }], "duracaoRodadas": 2 },
  "flags": { "nauren": { "modelo": true } }
}
```

Regras do modelo:
- `"system.ativo": false` **e** `"flags.nauren.modelo": true` — obrigatórios.
  O modelo não afeta a criatura; ele só existe para ser copiado nos alvos.
- Na ficha do NPC, os modelos aparecem na aba **Condições** (só NPCs têm essa aba).

Para uma Ação ou Gatilho da própria criatura aplicar o modelo, escreva
**`"self:Nome da Condição"`** no lugar do UUID, em qualquer campo de
Condição (`condicoesAplicadas[].uuid`, `condicaoEmMimUuid`,
`condicaoAlvoUuid`, `efeitoUuid` de gatilho, Condições de área
persistente...):

```json
"condicoesAplicadas": [{ "uuid": "self:Enraizado", "acumulos": 1, "ativo": true, "soSeAcertar": true }]
```

Na hora de usar, o sistema troca `self:Enraizado` pelo código do item
embutido e copia o modelo no alvo, já como Condição ativa. Não precisa
de nenhum ajuste manual depois de importar.

**⚠️ O texto depois de `self:` tem que ser IDÊNTICO ao `name` do modelo**
(acentos e espaços incluídos; só maiúsculas e minúsculas não importam).
`"self:Enraizado"` acha `"name": "Enraizado"`; `"self:Enraizada"` ou
`"self:Enraizado (forte)"` NÃO acham, e a habilidade avisa "não achei a
Condição modelo" na hora de usar. Antes de entregar, confira cada
`self:` contra a lista de `name` dos modelos, um por um.

**Variantes = modelos separados.** Cada Ação que aplica o modelo pode
variar `acumulos`, `duracaoExtra`, `copiarRankDoItem`, o custo para
resistir e `soSeAcertar` — sem tocar no modelo. Mas se o EFEITO muda
(um veneno de 1d6 em vez de 1d4, um Enraizado que também cega), crie
outro modelo com outro nome (`"Veneno Forte"`) e aponte para ele. Nunca
tente "modificar" o modelo a partir da Ação.

**As 16 Condições prontas do sistema (seção 4.6) também usam `self:`**:
`"uuid": "self:Sangramento"`, `"self:Preso"`, `"self:Caído"`,
`"self:Amedrontado"`... Quando o nome não está na ficha, o sistema procura
no compêndio "Nauren - Condições e Venenos" pelo nome exato (com acento).
Não precisa mais deixar `"uuid": ""` nem arrastar nada depois de importar.

---

## 12. Exemplo completo — NPC simples

```json
{
  "name": "Golem de Pedra",
  "type": "npc",
  "img": "",
  "prototypeToken": { "width": 2, "height": 2 },
  "system": {
    "nivel": 3,
    "atributos": {
      "forca": { "value": 6 },
      "agilidade": { "value": 1 },
      "estamina": { "value": 4 },
      "inteligencia": { "value": 1 },
      "destino": { "value": 1 }
    },
    "defesa": 12,
    "movimento": 6,
    "vida": { "value": 18, "max": 18 },
    "mana": { "value": 2, "max": 2 },
    "estaminaCombate": { "value": 4, "max": 4 },
    "dadosDestino": { "value": 1, "max": 1 }
  },
  "items": [
    { "name": "Pigmento Verde", "type": "cor", "img": "icons/svg/ice-aura.svg", "system": { "corHex": "#4bc26f", "vitalidade": "1", "descricao": "<p>Verde: vitalidade e crescimento. +1 de Vitalidade.</p>" } },
    { "name": "Pigmento Preto", "type": "cor", "img": "icons/svg/ice-aura.svg", "system": { "corHex": "#2a2a2a", "estresse": "1", "descricao": "<p>Preto: resiliência e mistério. +1 no limite de Estresse.</p>" } },
    {
      "name": "Punho de Pedra",
      "type": "arma",
      "img": "icons/skills/melee/unarmed-punch-fist.webp",
      "system": {
        "equipado": true,
        "descricao": "<p>Ataque corpo-a-corpo pesado.</p>",
        "acoes": [
          {
            "nome": "Golpe",
            "custoEstamina": 1,
            "alcance": "1m",
            "ehAtaque": true,
            "atributoAtaque": "poderAtaque",
            "modoAlvo": "selecionado",
            "danos": [ { "formula": "2d8+@poderAtaque", "aplicarNoAlvo": true } ]
          }
        ]
      }
    },
    {
      "name": "Pele de Pedra",
      "type": "habilidade",
      "img": "icons/magic/earth/strike-fist-stone.webp",
      "system": {
        "ativo": true,
        "descricao": "<p>Passiva, sempre ativa. Reduz todo dano sofrido em 1 (já automatizado via Efeito Vinculado). Imune a Medo - manual, sem campo pra isso no sistema.</p>",
        "efeitosVinculados": [
          { "ativo": true, "modificadores": [ { "campo": "reducaoDano", "valor": "1" } ] }
        ]
      }
    }
  ]
}
```

Repare que o Ator **não** define `reducaoDano` diretamente — é a Habilidade
"Pele de Pedra", através de `efeitosVinculados`, que soma esse valor
automaticamente ao total calculado do Ator. **Esse é o padrão certo**:
sempre que possível, a mecânica mora no ITEM (Habilidade/Arma/Condição),
nunca escrita direto num campo do Ator — assim ela liga/desliga junto com
o item (se remover "Pele de Pedra" da ficha, a redução de dano some
junto), e fica visível/editável como parte da Habilidade, não escondida
num número solto na aba Atributos.

Repare também que **os 4 recursos vêm todos preenchidos no máximo, já
contando os Pigmentos** (seção 3): Vitalidade = piso((6+4)/2) + 1
(Pigmento Verde) = 6, Vida = 6×3 (Vitalidade×Nível, fórmula padrão) =
18 — **não 15**, que seria o valor esquecendo o Pigmento (o erro mais
fácil de cometer aqui). Espírito = 1+1 = 2 (nenhum dos 2 Pigmentos deste
Golem afeta Espírito) → Mana 2/2. Estamina de Combate = atributo
Estamina = 4/4. Dados de Destino = atributo Destino = 1/1. Nenhum ficou
em 0 por padrão do schema.

Repare também o `"prototypeToken": { "width": 2, "height": 2 }` no
nível de topo — o dano `2d8` desta criatura já indica Categoria 2
(Passo 6), então o token precisa ser 2x2, não o padrão 1x1.

Esse exemplo é minimalista de propósito — a maioria dos monstros simples
só precisa de `system` do Ator + 1-2 Armas/Habilidades com uma Ação de
ataque. Reserve gatilhos/emanação/recursos customizados pra
personagens/monstros com mecânica de verdade única.

---

## 13. Mecanismos criados depois deste guia (versões 0.30 a 0.43)

Todos são campos de Ação, Gatilho ou Condição — a IA pode usar qualquer
um. Onde há um nome de campo, é o nome exato do JSON.

### Ações
- **Perjúrio do Acaso**: `"consomePerjurio": true` (seção 4.7).
- **Sustentar a cada turno** (ex.: Raio Dourado): `"sustentarPorTurno": true`,
  `"sustentarCustoMana": 2`, `"sustentarFormula": "4d8+@poderMagia"`,
  `"sustentarIncremento": 5`. Depois do uso, a cada turno de qualquer
  combatente, quem controla a criatura escolhe sustentar (paga a Mana e o
  dano vai direto no mesmo alvo, sem teste, +incremento por turno) ou
  encerrar. Acaba se o alvo cair, sair do alcance ou faltar Mana.
- **Área só para um lado**: `"areaDisposicao": "inimigos"` ou `"aliados"`
  e `"areaExcluirEu": true` (a criatura no centro da área não se atinge).
- **Dano por acúmulo no alvo**: `"bonusDanoPorAcumuloUuid": "self:X"`,
  `"bonusDanoPorAcumuloValor": 5` (+5 por acúmulo da Condição X no alvo).
- **Dano que salta**: `"cadeiaCondicaoUuid": "self:X"`, `"cadeiaCondicaoRaio": 1`
  (se o alvo tem X, o dano repete em quem está a 1m dele).
- **Dano extra só no crítico**: `"danoExtraEmCritico": "2d6"`.
- **Área persistente** (fica no mapa): além dos campos da seção 9.5,
  `"templatePersistenteIgnorarConjurador": true` (quem criou não a
  ativa), `"templatePersistentePuxarAoCentro": true`,
  `"templatePersistenteEmpurrarAleatorio": "1d4"`,
  `"templatePersistenteResistirEstamina": "1"` (quem entra pode pagar
  Estamina para evitar), `"templatePersistenteCargasEstamina": "3"`
  (aliados dentro usam as cargas no lugar de Estamina).
- **Ataque à distância com munição**: na arma, `"usaMunicao": true`,
  `"tipoMunicao": "flecha"`; o consumível de munição tem
  `"ehMunicao": true`, `"tipoMunicao": "flecha"`, `"municaoDanoExtra": "1d4"`
  e, se envenenada, `"municaoVenenoUuid"`, `"municaoVenenoQuantidade"` /
  `"municaoVenenoTodas"`.
- **Veneno na arma**: `"venenoCarregado": "<uuid do veneno>"`,
  `"venenoGolpesRestantes": 0` (0 = até ser removido; N = por N usos),
  `"venenoModo": "auto" | "curto" | "cravado"`. Regra do livro: golpe
  corpo-a-corpo age 1 vez (início da rodada) e sai; lança e arma à
  distância ficam cravados até serem removidos. Todo veneno age no
  **início da rodada** com o total de acúmulos.
- **Criar consumível a partir de um modelo**: `"usaConjurarConsumivel": true`,
  `"consumivelCriadoModeloUuid"` (ou `"consumivelCriadoOpcoesUuids": [...]`
  para o jogador escolher), `"consumivelCriadoCuraFormula"`.
- **Usos compartilhados**: `"usosDeOutroItemNome": "Nome"` (gasta do
  contador de outra habilidade do mesmo ator). Na habilidade:
  `"usosExtrasEm": [{ "itemNome": "Nome", "valor": "@rank" }]`.
- **Conjuração Poderosa** (só magias de Mago): é como duas magias
  fundidas — custo em dobro, dano/cura/acúmulos em dobro, mais a opção
  escolhida. `"danoMaximoEmPoderosa": true` força o dano máximo.

### Gatilhos
- **Recurso à escolha**: `"recursoAlternativo": "recursoCustom:ofuscacao"`
  — quem tem o item escolhe na hora entre o recurso do efeito e este.
- `"soSeAcertou": true`, `"limitePorAlvo": true`,
  `"gravarAlvoNaCondicao": true` (a Condição aplicada guarda de qual alvo
  veio), efeito `"removerCondicaoEmMim"`.
- Eventos de aliado (`aliadoSofreuDano`, `aliadoAcertouAtaque`...) nunca
  incluem a própria criatura; `alguem...` inclui todos menos ela.

### Condições e Efeitos
- `"danoRecebidoPercentual": 50` — reduz em % o dano dos ataques recebidos.
- `"ehVeneno": true` — marca a Condição como veneno (as regras de veneno
  valem para ela).
- `"reduzCustoEstamina": [{ "quantidade": "1", "soCategoriaArma": "Pesada" }]`
  — desconto só em ataques com armas dessa categoria.
- `"proximaAcaoTipoAtaque": "basico"`, `"proximaAcaoSoContraAlvoGravado": true`,
  `"proximaAcaoEscolherAcertoOuDano": true` (bônus de próxima ação).
- `"ajusteCustoMana": [{ "valor": "-1", "soMagiaComDano": true }]`.
- **Efeitos nos seus ataques**: `"dadosExtrasDaArma": 1`,
  `"criticoMaisFacil": 1`, `"acertoExtraDado": "1d4"`,
  `"alcanceExtra": "2+@rank"`, `"perguntarEstresse": true`,
  `"soPrimeiroAtaqueTurno": true`, `"semCusto": true`.
- **Capacidades especiais** (`"capacidades": ["armadilha", ...]`):
  comportamentos especiais do sistema que a ficha pode ligar — a lista
  com a explicação de cada um fica na ficha do item, em Passivas.

### Movimento (versão 0.46)
- `"custoEstaminaExtraAcoes": N` (Condição): ações e movimentos custam +N de
  Estamina enquanto ativa (Amedrontado 1, Pânico 2, Pavor 3 já vêm assim).
- `"vooCusto": "estamina" | "mana"` (Condição): a criatura voa; no início de
  cada turno o dono escolhe manter (paga 1) ou pousar (a Condição sai).
- `"pagarMovimentoCom": [{ "recurso": "mana", "quantidade": "1" }]` (Habilidade
  ou Condição): outra forma de pagar um movimento; aparece na janela de
  movimento. Aceita recursos customizados (`"recursoCustom:energia"`).
- A Condição "Caído" faz cada movimento valer metade; terminar um movimento ao
  lado de um inimigo dá Prioridade a ele (a menos que tenha Passo Gatuno).

### Regras de combate que o motor aplica sozinho
- **20 natural acerta sempre** (mesmo abaixo da Defesa; bloqueio e esquiva
  não evitam; Deflexão não anula). **1 natural erra sempre**.
- **Ações Anunciadas** (área sem teste): cada alvo pode "Usar minha
  Prioridade" na reação e não recebe o dano nem as Condições.
- Os termos oficiais são **Facilidade** (2d20, maior) e **Dificuldade**
  (2d20, menor); no JSON os valores internos continuam `"vantagem"` e
  `"desvantagem"`.
- O Grimório do Mago abre em pares fixos de páginas (1–2, 3–4...).

---

## 14. Como escolher o ícone (`img`) de cada item e da criatura

Todo `img` sai do arquivo **`icones-foundry.txt`** (anexado junto deste
guia): é a lista dos 7.100 ícones que vêm com o Foundry. Um caminho que
não está na lista não existe, e o item aparece sem imagem.

**Regras:**
1. **Nunca use `.svg`** (`icons/svg/...`). São ícones de interface, simples e
   sem cor. Use sempre um `.webp` colorido. Única exceção: nenhuma.
2. **Nunca invente nem "ajeite" um caminho.** Copie a linha exata da lista.
3. **Não repita ícone dentro da mesma ficha.** Cada Ação, Habilidade,
   Condição modelo, arma e pigmento tem o seu.
4. **Escolha pela pasta do tipo de item, depois pela palavra:**

| O que é | Procure primeiro em |
|---|---|
| A criatura (o `img` do Ator) | `icons/creatures/` (animais, bestas, mortos-vivos, elementais...) |
| Magia, Ação mágica, aura | `icons/magic/` (subpastas por elemento: `fire`, `water`, `air`, `earth`, `lightning`, `holy`, `unholy`, `death`, `nature`, `light`, `control`, `perception`, `time`, `sonic`...) |
| Golpe físico, técnica, mordida, garra | `icons/skills/melee`, `icons/skills/ranged`, `icons/creatures/abilities`, `icons/creatures/claws` |
| Condição (debuff/buff) | `icons/magic/control` (medo, correntes, atordoar), `icons/skills/wounds` (sangue, ferida), `icons/magic/unholy` (maldição), `icons/magic/water` (gelo)... |
| Arma | `icons/weapons/` (subpastas `swords`, `axes`, `hammers`, `polearms`, `bows`, `daggers`...) |
| Consumível, poção, veneno | `icons/consumables/` |
| Pigmento | `icons/commodities/materials` ou `icons/tools/laboratory` (tigelas de pó colorido: `bowl-powder-red.webp`...) |
| Armadura, escudo, joia | `icons/equipment/` |

5. **Busque na lista pela palavra em INGLÊS do tema** (os nomes dos arquivos
   são em inglês) e prefira os que também têm a **cor** certa no nome:
   - veneno → `poison`, `venom`, `toxic`; fogo → `fire`, `flame`, `burn`;
     gelo → `ice`, `frost`, `frozen`; raio → `lightning`, `bolt`;
     medo → `fear`, `fright`; sangue → `blood`, `bleed`; garra → `claw`;
     mordida → `bite`, `fang`, `teeth`; teia → `web`; corrente → `chain`;
     cura → `heal`, `caduceus`; escuridão → `shadow`, `void`, `dark`;
     sagrado → `holy`, `halo`, `angel`; natureza → `vine`, `root`, `leaf`.
   - Ex.: Condição "Queimando" de um monstro de fogo vermelho → procure
     `fire` + `red` dentro de `icons/magic/fire/`.
6. **Criatura sem ícone parecido** (monstro original): use o animal ou ser
   mais próximo da forma dela em `icons/creatures/` (um felino, um
   réptil, um espírito), nunca um objeto.
7. **Sem nada que combine com o NOME? Use o TEMA.** Nunca pegue um ícone
   aleatório da pasta. Pergunte, nesta ordem:
   - **Do que é feito / de onde vem o poder?** (fogo, gelo, sombra,
     veneno, luz, sangue, tinta, som) → procure essa palavra.
   - **Qual parte da criatura ele usa?** (garra, presa, cauda, olho,
     asa, chifre, voz) → `icons/creatures/abilities`, `.../claws`.
   - **Qual é o tema da criatura?** Um ataque genérico de um monstro de
     gelo leva um ícone de gelo; uma habilidade de apoio de um espírito
     leva um ícone de espírito/luz. Ex.: "Golpe Brutal" de um urso de
     lava → `icons/magic/fire/...` ou `icons/creatures/claws/...-red`.
   - **Qual é o efeito?** Derrubar → impacto/terra; prender → correntes
     (`debuff-chains`); cegar → olho; curar → coração ou caduceu.
   Evite moedas, joias, bebidas, comida e ossos, a menos que o item
   seja literalmente isso.
8. **Palavras inteiras, não pedaços.** Ao procurar, compare palavras
   completas do nome do arquivo: "ink" (tinta) NÃO é "drink" (bebida);
   "horn" (chifre) NÃO é "thorned" (espinhoso).
9. **Armas e armaduras**: arma → `icons/weapons/<tipo>` (daggers, swords,
   axes, hammers, polearms, bows, crossbows, guns, wands, staves);
   armadura → `icons/equipment/<parte do corpo>` (chest, back = capa,
   feet = botas, head, hands, shield). Cada peça com o próprio ícone.

No checklist final (seção 8), confira cada `img`: existe na lista, é `.webp`
e não se repete na ficha.

## Nomes das Condições do sistema (para `self:Nome`)

Use `self:` + o nome. A busca ignora maiúsculas e acentos e aceita uma parte de um nome com barra (`self:Preso` acha "Preso/Agarrado"). Nomes exatos:
Alvejado, Preso/Agarrado, Caído, Cego, Amedrontado, Pânico, Pavor, Atordoado, Desacordado, Envenenamento, Sangramento, Hemorragia, Fragmentado, Queimando, Congelando, Lerdeza, Paralisado, Desarmado, Retardado, Invisível, Levitando, Esgotado, Emudecido, Provocado, Debilitado, Exposto, Hesitante, Engolido, Sufocando, Infestado, Putrefato, Fascinado.
Condições próprias da criatura: crie-as como itens `condicao` na própria ficha, com `flags.nauren.modelo = true`, e referencie com `self:<nome da sua Condição>`.
Campos que NÃO existem (são ignorados): `estresse` no ator (o campo é `stress`). `categoriaMonstro` EXISTE (1 a 4) e deve ser preenchido em toda criatura.

## Efeitos em área: um dado para todos

Em Nauren, quando uma Ação afeta vários alvos, **cada dado é rolado uma vez e o resultado vale para todos**: dano, cura, gasto de recurso e **acúmulos de Condição**. O sistema já faz isso sozinho:
- dano/cura (`danos`, `curas`): rolados uma vez por Ação;
- gasto de recurso (`gastosRecurso`): rolado uma vez por Ação;
- acúmulos com dado (`condicoesAplicadas[].acumulosFormula`, ex.: `"1d6"`): rolados uma vez por Ação, na ficha de quem usa (atalhos como `@acumulosMeu(Nome)` leem a ficha de quem usa);
- aura (`emanacaoCondicaoAcumulos`, `emanacaoQuantidade`): uma vez por evento;
- área persistente: uma vez por evento periódico.

Portanto: **escreva o dado direto no campo** (`acumulosFormula: "1d6"`, `formula: "4d6"`). **Não** tente simular "um dado por alvo" nem "um dado igual para todos" com truques (Condições extras, várias Ações): o comportamento padrão já é o da regra.

## Travar valores com "=" (Estatísticas Originais)

Um modificador com valor `"=N"` **fixa** o campo em N: itens, pigmentos e habilidades não mudam mais esse valor. **Condições e a penalidade de Estresse continuam valendo por cima** (ex.: Defesa travada em 20 + Fragmentado 2 = 18).

Regras para fichas de criatura:
- **Defesa, Movimento e Vida**: use os campos **base** da ficha (`system.defesa`, `system.movimento`, `calculoVida: "customizado"` + `vidaFormula`). **Não** trave com "=".
- **Meta-atributos derivados do livro** (Poder de Ataque, Poder de Magia, Vitalidade, Espírito, Estresse Máximo, Dados de Destino): podem ser travados com "=" numa habilidade "Estatísticas Originais", porque o livro dá o valor pronto.
- Uma **Condição** que fixa um valor (ex.: Preso `movimento "=0"`, Em Voo `movimento "=8"`) vence a trava da ficha, e as outras Condições ainda somam por cima (Em Voo + Lerdeza 1 = 7).


## 15. Animações (Automated Animations) — nomes que se integram sozinhos

O sistema funciona **igual** sem os módulos de animação (Automated Animations + Sequencer + JB2A): sem eles, nada é tocado e nada quebra. **Nunca** coloque configuração de animação dentro do JSON da ficha (sem `flags.autoanimations`, sem caminhos de vídeo): a integração é **só pelo nome**, então uma ficha bem nomeada já sai animada em qualquer mesa que tenha os módulos.

### Como o sistema escolhe a animação

Para cada Ação usada, o Nauren procura no menu do Automated Animations, nesta ordem:
1. o **nome da Ação** (`acoes[].nome`);
2. o **nome do item**;
3. uma **reserva pelo tipo**: `Nauren Corpo a Corpo`, `Nauren Distância`, `Nauren Magia`, `Nauren Cura`, `Nauren Área`, `Nauren Habilidade`.

A busca é por **parte do nome**, sem diferenciar maiúsculas: uma entrada "Mordida" anima "Mordida Venenosa". O menu do Nauren é gerado automaticamente a partir dos nomes, com estas regras (siga-as para a criatura sair com a animação certa):

| No nome (ou na descrição, para o elemento) | Animação |
|---|---|
| garra, unha | garra (vermelha; verde com veneno ou natureza) |
| mordida, presa, dente, mandíbula | mordida |
| soco, punho, chute, palma | soco |
| pinça, tenaz | pinça |
| giro, rodopio, turbilhão | golpe giratório |
| corte, talho, rasgo, retalhar | corte longo |
| estocada, perfurar, empalar | estocada |
| esmagar, pancada, impacto | esmagamento |
| espada, machado, martelo, maça, lança, adaga, cajado | a arma (no aço; na cor do elemento se houver) |
| arco, flecha / besta / arma de fogo, pistola, mosquete, rifle, canhão | flecha / virote / tiro |
| fogo, chama, magma, inferno | laranja (projétil, explosão, sopro) |
| gelo, congelante, glacial, neve | azul-gelo |
| relâmpago, trovão, tempestade, elétrico | raio azul |
| veneno, ácido, esporo, tóxico | verde |
| sagrado, divino, luz, solar, dourado | dourado |
| sombra, trevas, maldição, morte, necro, vazio | roxo-escuro |
| espinho, raiz, planta, flor, natureza | verde-folha |
| água, maré, onda | azul-água |
| vento, tornado, rajada | vento |
| terra, pedra, rocha, gravidade | pedra |
| lua, lunar, prata | prateado |
| estrela, astral, arcano, mana | roxo-estelar |
| sangue, fúria, carmesim, brutal | vermelho |
| uivo, rugido, grito, som | onda sonora |

**Sem arma nem elemento reconhecível:** corpo a corpo usa o corte genérico laranja; à distância, o tiro.

### Regras para a IA

1. **Dê nome específico a toda Ação**, com pelo menos 4 letras e nunca genérico ("Ataque", "Golpe", "Usar", "Ataque Básico" não animam por nome). Prefira o nome do livro ("Sopro Infernal", "Garras Dilacerantes").
2. **Ações com visual diferente = Ações com nomes diferentes**, mesmo dentro do mesmo item (ex.: "Mordida" e "Sopro Gélido" no item do monstro).
3. **Ponha a arma natural e o elemento no nome** quando o livro permitir ("Mordida Venenosa", "Garra Flamejante", "Investida de Pedra"). Se o nome do livro não tiver, o elemento pode vir da **descrição** (o gerador lê as duas).
4. **Estruture a Ação pelo que ela é**, porque a categoria da animação sai daí:
   - ataque corpo a corpo: `ehAtaque: true`; golpes de alcance de criaturas grandes (garra, cauda, tentáculo a 3–4,5 m) continuam corpo a corpo;
   - ataque à distância: arma de Distância, **nome** de projétil (arco, besta, flecha, tiro, disparo, arremesso, cuspe, lançar) ou alcance de 6 m ou mais; magias a mais de 2 m também;
   - área: `usaTemplate: true` com `templateTipo` (`circle` explosão, `cone` sopro, `ray` linha); a animação acompanha o tamanho da área;
   - cura: `curas`;
   - buff e utilidade: sem ataque, sem dano, sem área (anima no próprio token).
4b. **Corpo a corpo x distância: preencha sempre `tipoAlcance`** em toda Ação que acerta um alvo (ataque ou dano em alvo marcado): `"corpoACorpo"` ou `"distancia"`. Golpe com a arma na mão é corpo a corpo, inclusive lança, glaive e golpes de alcance de criatura grande (garra, cauda, tentáculo, chicote a 3–6 m). Projétil, sopro mirado num alvo, raio, magia lançada e arremesso são `"distancia"`, mesmo a 3–4 m. Áreas não precisam. Se ficar `"auto"` (padrão), o sistema tenta adivinhar pela categoria da arma, pelo nome (arco, besta, flecha, disparo, arremesso, cuspe, lançar, dardo) e por alcance de 6 m ou mais, e pode errar. Habilidades com Arma Escolhida ficam em `"auto"` para seguir a arma usada, a não ser que só aceitem um tipo de golpe (ex.: Estocada = `"corpoACorpo"`). Armas Leves têm a Ação "Arremessar" (4 m, `"distancia"`).
5. **Áreas persistentes** (`usaTemplatePersistente`) também animam: o sistema não entrega a Region ao módulo (para ela não ser apagada) e toca ele mesmo a animação de área do nome, no centro e no tamanho da área.
6. **Passivas** (habilidades sem Ação) animam uma vez quando o **gatilho** delas dá efeito ou quando são **ligadas pelo raio**; também precisam de nome específico.
7. **Condições:** reaproveite as do sistema (seção 4.6), que já têm animação (contínua para Queimando, Congelando, Envenenado, Sangramento, Cego, Preso, Atordoado e Medo; aviso único para o resto, marcas incluídas). Condição nova com uma palavra da tabela no nome (ex.: "Queimadura Negra", "Preso nas Raízes") ganha a animação certa quando o menu for regerado.
8. **Criatura nova com nomes novos** já anima pela reserva do tipo de Ação. Para ganhar animação própria pelo nome, o Mestre exporta a lista de itens e regera o menu (ver `docs/animacoes.md`).
9. **JSON de animações (opcional):** se o usuário pedir, gere também o arquivo de animações da criatura seguindo `docs/guia-animacoes-ia.md` (importado no Automated Animations com Merge). Sem pedido, não gere.

---

## 16. Novidades das versões 0.89 a 0.94.19 (para monstros e NPCs)

Tudo abaixo já funciona no sistema. Use quando a ideia pedir; o resto do guia continua valendo.

### 16.1 Bando de lacaios (0.93)

Vários tokens do mesmo NPC agindo como um só: uma iniciativa, Estamina compartilhada, 1 Prioridade por turno (dá 1 a cada alvo e recebe 1 no total) e lacaio **não reage** (sem Bloquear, Esquivar, Contra-Atacar nem Estresse). Cada token tem Vida e Condições próprias.

```json
"flags": { "nauren": {
  "bando": { "ativo": true, "membros": 4, "estaminaFormula": "floor(@estamina * @membros / 2) + @membros", "bonusPorLacaio": 1 },
  "criadorMonstro": { "funcao": "Atacante", "chefe": false, "versao": 2, "bando": 4 }
} },
"prototypeToken": { "actorLink": false }
```

- **Balanceamento:** o Bando vale 1 monstro daquele nível dividido em N. Vida: acrescente `/ N` na `vidaFormula` (`"@vitalidade * @categoria * (@nivel + 2) / 4"`). Os atributos ficam iguais.
- **Dano das Ações:** `floor((@danoCat+@poderAtaque)*@bandoNoAlcance/@bandoMembros)+@bandoExtra` (todos no alcance = o golpe inteiro do monstro; `@bandoExtra` = +1 por lacaio a mais no alcance, para cercar valer a pena — o valor por lacaio é `flags.nauren.bando.bonusPorLacaio`, padrão 1).
- **Custo do ataque a 1 alvo:** 1 de Estamina por lacaio que participa: `custoEstamina: 0`, `custoEstaminaPorCategoria: false` e `custosRecursoProprio: [{ "recurso": "estamina", "quantidade": "@bandoNoAlcance", "ativo": true }]`.
- **`estaminaFormula`:** aceita `@estamina`, `@membros` (vivos), `@membrosIniciais`, e `floor/ceil/round/min/max`. O `2` do exemplo é o custo de 1 golpe do monstro inteiro (1 + Estamina extra da Categoria).
- **Fórmulas:** `@bandoNoAlcance` (vivos com o alvo no alcance da Ação), `@bandoDados(1d6)` (multiplica os dados por esse número), `@bandoVivos`, `@bandoMembros`.
- Explique no `notas` quantos tokens não vinculados colocar.

### 16.2 Ações: campos novos úteis para criaturas

| Ideia | Campos |
|---|---|
| Habilidade com N usos (por cena, rodada, turno) | `usaUsos: true`, `usosMax`, `usosAtual` (= `usosMax`), `usosReset`: `"cena"` \| `"dia"` \| `"rodada"` \| `"turno"` \| `"meuTurno"` |
| Puxar em vez de empurrar; dano ao bater | `usaEmpurrar`, `empurrarMetros`, `empurrarDirecao: "afastar"\|"puxar"`, `empurrarColisaoDano: "1d8"`, `empurrarColisaoAmbos: true` (quem foi atingido na colisão também sofre) |
| Investida, salto, recuo depois do golpe | `usaMoverEscolhendo: true`, `moverQuem: "eu"\|"alvo"`, `moverMetros`, `moverMomento: "antes"\|"depois"`, `moverTeleporte`, `moverPertoDoAlvo` |
| Trocar de lugar com o alvo | `trocarLugarComAlvo: true` |
| Escudo de Vida (em si ou no alvo) | `usaEscudo: true`, `escudoFormula`, `escudoNoAlvo`, `escudoDuracao: ""\|"fimRodada"\|"rodadas"`, `escudoDuracaoRodadas` |
| Curar aliados em volta | `curaAliadosFormula`, `curaAliadosRaio` (metros) |
| Ganhar recurso por inimigo atingido | `recursoPorAlvoAtingido` (ex.: `"recursoCustom:pressao"`, `"estaminaCombate"`), `recursoPorAlvoAtingidoQtd`, `recursoPorAlvoSoSeAtacou` |
| Atacar de novo se tirar dano máximo | `repetirSeDanoMaximo: true` |
| Efeitos simples no alvo (se acertar) ou em si | `efeitosNoAlvo` / `efeitosEmMim`: lista de `{ "tipo": ..., ... }` (abaixo) |

Tipos de `efeitosNoAlvo`/`efeitosEmMim` (fórmulas aceitam dado):
- `{ "tipo": "recurso", "recurso": "estaminaCombate", "formula": "-1d4", "rotulo": "Drenar" }` (`estresse`, `mana`, `vida`, `recursoCustom:id`...);
- `{ "tipo": "condicao", "uuid": "self:Nome", "acumulos": "1" }` (ou `"rank": 2`);
- `{ "tipo": "removerAcumulos", "formula": "1" }` (de uma Condição negativa);
- `{ "tipo": "dano", "formula": "@meioCat" }` e `{ "tipo": "danoArea", "formula": "@meioCat", "raio": 3 }`;
- `{ "tipo": "zerarRecurso", "recurso": "mana" }`;
- `{ "tipo": "texto", "texto": "..." }` (só anota no card).

`efeitosNoAlvo` só vale se a Ação não for ataque ou se acertou.

### 16.3 Condições e Ator

- **`imuneMovimentoForcado: true`** (Condição, Habilidade ou Efeito ativo): não pode ser empurrado nem puxado contra a vontade (criaturas enormes, ancoradas).
- **`system.soAgeEmPrioridade: true`** (Ator): não entra na ordem de turnos e só age quando recebe Prioridade (servos, construtos comandados).
- **`system.estressePermanente`** (Ator): espaços de Estresse sempre ocupados.
- **`vooCusto: "estamina"\|"mana"`** (Condição): manter o voo custa 1 por turno.

### 16.4 Animação do token (Sequencer Motion, 0.94.16)

Só visual, opcional, e o padrão já resolve: deixe `"auto"`.
- **Ação:** `motionUsuario` (`"auto"`, `"nenhum"`, `"bote"`, `"recuo"`, `"conjurar"`, `"pulo"`, `"girar"`, `"rebobinar"`, `"surgir"`, `"tremer"`, `"crescer"`) e `motionAlvo` (`"auto"`, `"nenhum"`, `"tremer"`, `"empurrar"`, `"girar"`, `"pulo"`). No automático: bote no corpo a corpo, recuo no tiro, o alvo treme e pisca vermelho ao sofrer dano, dá um passo para o lado ao esquivar, recua ao bloquear e fica verde ao ser curado.
- **Condição:** `motion` (`"auto"` escolhe pelo nome; ou `"flutuar"`, `"deitado"`, `"cambalear"`, `"tremer"`, `"eletrico"`, `"gelo"`, `"brasa"`, `"transparente"`, `"crescer"`, `"encolher"`, `"preso"`, `"cor"`, `"nenhum"`) e `motionCor` (`"#rrggbb"`, com `"cor"`). Condição nova de voo: `"flutuar"`.

### 16.5 Regras que o motor aplica sozinho (não configure)

- Facilidade/Dificuldade acumuladas: +2/−2 por fonte além da primeira (seção 4).
- Arco e Besta aplicam Alvejado no acerto; Arma de Fogo não.
- Quem reage (Bloquear, Esquivar, Contra-Atacar) a um ataque já usa a Prioridade daquele ataque ali.
- Escudos contam no limite de equipamentos de Ataque do personagem (`pesoOfensivo` 1/2/3).

