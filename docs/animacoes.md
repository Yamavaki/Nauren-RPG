# Animações (Automated Animations + Sequencer + JB2A)

O Nauren está preparado para o módulo **Automated Animations** (mantido por theripper93). Sem o módulo ativo, nada muda no sistema.

## Módulos para instalar
1. **Sequencer** (o Automated Animations exige).
2. **JB2A** — gratuito (`JB2A_DnD5e`) ou Patreon (`jb2a_patreon`).
3. **Automated Animations** (`autoanimations`), versão 7 ou mais nova (Foundry V14).

## Menu pronto do Nauren
- `docs/nauren-aa-menu-completo.json`: todas as animações e sons do sistema (armas, magias, habilidades de classe, Habilidades de Monstros, itens da Torre e Condições). No Automated Animations: **Menu Manager → Overwrite** (substitui o menu) ou **Merge** (soma ao que já existe).
- `docs/nauren-aa-novas-0.94.27.json`: só as entradas novas desde a 0.92.2 (Leva 1 da Torre, óleos, Condições do Inventor e das Habilidades de Monstros). Para quem já importou o menu antes: **Merge** só este arquivo.
- Os sons ficam no Forge; a lista com os endereços está em `docs/sons-forge.txt`.

## O que o Nauren faz
- **Ações**: ao usar uma Ação (ataque, magia, habilidade, consumível), o Nauren chama o módulo com o item, o token de quem usou, os alvos e quem foi atingido. O módulo escolhe a animação **pelo nome do item**, no menu Global Automatic Recognition. Erros tocam a animação de erro (miss) do menu.
- **Reserva por tipo**: se nenhum nome cadastrado bater com o item, o Nauren manda um nome genérico. Cadastre estes nomes no menu para toda Ação ter animação:

| Tipo da Ação | Nome enviado | Categoria sugerida no menu |
|---|---|---|
| ataque corpo a corpo | `Nauren Corpo a Corpo` | Melee |
| ataque à distância (arma à distância ou alcance > 2 m) | `Nauren Distância` | Range |
| ataque com Poder de Magia / item Magia | `Nauren Magia` | Range |
| cura | `Nauren Cura` | On Token (alvos) |
| área (template) | `Nauren Área` | Templates |
| outras habilidades | `Nauren Habilidade` | On Token (self) |
| aura ligada pelo botão (habilidade com Emanação, ex.: Presença) | `Nauren Aura` | Aura (persistente) |

- **Auras**: habilidades com Emanação (ex.: Presença do Empíreo) ligam e desligam pelo botão de raio, sem usar Ação. Ao **ligar**, o Nauren pede a animação pelo nome do item (categoria **Aura**, marque *Persistent*); ao **desligar** (ou apagar a habilidade), encerra a animação daquela aura naquele token.
- **Condições**: cada Condição ativa já vira um Efeito Ativo com o nome dela ("Queimando", "Queimando (3)"). Cadastre o nome da Condição na categoria **Active Effects** do menu, marcando *Persistent*: a animação fica no token enquanto a Condição durar e some quando ela sai. Desligar a Condição pelo raio tira o ícone e a animação; religar traz os dois de volta.

## Configurações do mundo (Nauren RPG)
- **Animações: Ações** — liga/desliga o disparo nas Ações.
- **Animações: reserva por tipo de Ação** — liga/desliga os nomes genéricos.

## Palavras-chave genéricas (sugestão para o menu)
O reconhecimento é por trecho do nome; o nome mais longo vence. Sugestões, com a categoria:
- Melee: `Espada`, `Machado`, `Martelo`, `Adaga`, `Lança`, `Garra`, `Mordida`, `Golpe`, `Punho`, `Chute`, `Nauren Corpo a Corpo`
- Range: `Arco`, `Besta`, `Arma de Fogo` (tiro; mais específico que "Fogo"), `Flecha`, `Disparo`, `Raio`, `Míssil`, `Nauren Distância`, `Nauren Magia`
- On Token / Templates: `Fogo`, `Bola de Fogo`, `Gelo`, `Gélid`, `Congel`, `Veneno`, `Espinho`, `Raiz`, `Cura`, `Benção`, `Nauren Cura`, `Nauren Área`, `Nauren Habilidade`
- Active Effects (Persistent): `Queimando`, `Congelando`, `Envenenamento`, `Esporos Venenosos`, `Sangramento`, `Hemorragia`, `Amedrontado`, `Pânico`, `Pavor`, `Atordoado`, `Desacordado`, `Preso`, `Cego`, `Caído`, `Em Voo`, `Invisível`, `Levitando`
- Cuidado com acentos e variações: "Gelo" não pega "Gélido"; cadastre as duas formas.

## Limites conhecidos
- **Áreas**: na V14 as áreas são Regions, e o Automated Animations 7.x trata Regions na categoria *Templates*. O Nauren entrega a Region da área ao módulo; se a versão instalada recusar, ele tenta de novo sem a área (a animação toca nos alvos). Formatos: círculo, cone, linha, retângulo e emanação (a emanação foi corrigida no módulo recentemente — use a versão mais nova). Se o centro da animação ficar deslocado, ajuste o ponto de ancoragem (anchor 0.5, 0.5) na entrada do menu.
- **Reações** (bloquear, esquivar, contra-ataque) e **dano de Condição** não disparam animação; só as Ações usadas.
- O módulo precisa estar ativo na máquina de quem usa a Ação (a animação é disparada pelo cliente de quem age e replicada pelo Sequencer).


## Ordem de busca do nome

Para cada Ação, o Nauren procura no menu, nesta ordem: o **nome da Ação** (por exemplo "Sopro Infernal" dentro do item do monstro), o **nome do item** e, se nenhum tiver entrada, a **reserva** do tipo de Ação (`Nauren Área`, `Nauren Magia`...).

## Entradas de área

Nas entradas da categoria Templates, deixe **Persistent** e **Remove Template** desligados para efeitos rápidos (explosões). Com Persistent ligado, o módulo cria um tile no topo do mapa e não toca outro enquanto ele existir. O Nauren nunca entrega ao módulo a Region de uma área **persistente** do sistema, para ela não ser apagada: nesse caso ele mesmo toca a animação da entrada (pelo nome da Ação ou do item, na categoria Templates) no centro e no tamanho da área, direto pelo Sequencer. Ex.: Armadilha de Caça com a spike trap.


## Passivas

Habilidades sem Ação (Dualidade, Tesouro na Batalha, Resiliente...) tocam a animação do próprio nome **uma vez**: quando o **gatilho** delas dá efeito (concede recurso ou Condição) ou quando são **ligadas pelo raio**. Disparos seguidos do mesmo gatilho (vários acúmulos) animam uma vez só. Passivas sem entrada no menu não usam reserva, para não poluir a mesa.

## Condições: aviso x contínuo

Na categoria Active Effects, **Persistent** ligado = a animação repete enquanto a Condição durar (Cego, Congelando, Queimando, Envenenado, Preso, Atordoado, Medo). Desligado = toca uma vez quando a Condição entra (Caído, Alvejado, buffs e maldições).


## Crítico e falha crítica

Quando o d20 usado numa rolagem é **acerto crítico** (pelo Crítico Mínimo do personagem, que habilidades podem alterar), o Nauren mostra `jb2a.ui.critical.yellow` em cima do token; quando é **falha crítica**, `jb2a.ui.critical_miss.red`. Toca direto pelo Sequencer, sem precisar do menu do Automated Animations. Desliga em *Animações: crítico e falha crítica* nas configurações do sistema.


## Acúmulos e morte

- **Acúmulo novo** numa Condição que já está no token (por habilidade ou pelo **+** na ficha): o Nauren toca de novo, uma vez, a animação daquela Condição no menu do Automated Animations (procura pelo nome, na categoria Active Effects). Só funciona para entradas com caminho próprio (*Custom*); entradas do banco interno do módulo não têm caminho direto.
- **Morte**: quando a Vida cai de acima de 0 para 0 ou menos, toca `jb2a.condition.curse.01.001.purple` (a caveira) em cima do token.


## Sopros

Áreas em **cone** sem animação própria usam a reserva `Nauren Sopro` (sopro de fogo laranja). No menu gerado, cada cone usa o sopro do elemento (fogo, gelo, veneno, sagrado, sombra, arcano...), e linhas com "sopro", "baforada", "hálito" ou "cuspe" no nome usam o sopro em linha.
