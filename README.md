# Nauren RPG — sistema para Foundry VTT

> Um mundo pintado e abandonado, onde o Acaso mancha as bordas da realidade e os personagens resistem usando **Estamina**, **Prioridade** e o poder do **Grande Prisma**.

Sistema completo do **Nauren RPG** para o Foundry VTT: fichas, combate automatizado e compêndios com todo o livro.

![Foundry](https://img.shields.io/badge/Foundry-v13%20%7C%20v14-orange) ![Versão](https://img.shields.io/badge/vers%C3%A3o-0.94.31-purple) ![Idioma](https://img.shields.io/badge/idioma-pt--BR-green)

## Instalar

No Foundry (ou na Forge), em **Sistemas de Jogo → Instalar Sistema**, cole o link do manifesto:

```
https://raw.githubusercontent.com/Yamavaki/Nauren-RPG/main/system.json
```

Para atualizar, use **Atualizar** na lista de sistemas: o Foundry compara a versão do manifesto e baixa a nova.

## O que vem no sistema

- **Fichas de personagem e de NPC.** Atributos, meta-atributos, Pigmentos, Peculiaridades, inventário com limite de equipamentos e opções da ficha.
- **Criador de Personagem.** Passo a passo, com registro auditável das rolagens de atributo.
- **Classes e subclasses.** Guerreiro, Mago, Druida, Ladino, Empíreo, Místico, Sacerdote, Caçador e Inventor, com árvores de subclasse ilustradas.
- **Combate automatizado.** Tudo aparece no card do chat:
  - custo de Estamina e Mana, testes de ataque contra a Defesa e crítico;
  - reação em dois passos (Bloquear, Esquivar, Contra-Atacar);
  - Prioridade, Estresse e Condições com acúmulos e duração;
  - áreas no mapa, empurrões e escudos;
  - botão para desfazer a Ação.
- **HUD de combate.** As Ações do token selecionado ficam num painel embaixo da tela.
- **Criador de Monstros e Bestiário.** Inclui o Bando de lacaios e mais de 500 Habilidades de Monstros prontas.
- **Itens da Torre Infinita.** Itens Pigmentados, consumíveis e equipamentos prontos, com instruções de uso.
- **Animações (opcional).** Integração com Automated Animations, Sequencer e JB2A, com movimento, cor do token e som sincronizados. O menu pronto fica em [`docs/`](docs/).

## Módulos recomendados (opcionais)

| Módulo | Para quê |
|---|---|
| [Sequencer](https://foundryvtt.com/packages/sequencer) | Base das animações |
| [JB2A](https://foundryvtt.com/packages/JB2A_DnD5e) (gratuito ou Patreon) | Biblioteca de animações |
| [Automated Animations](https://foundryvtt.com/packages/autoanimations) | Toca as animações pelo nome das Ações |
| [Dice So Nice!](https://foundryvtt.com/packages/dice-so-nice) | Dados 3D |

Sem esses módulos, o sistema funciona normalmente.

## Documentação

A pasta [`docs/`](docs/) tem:

- os guias de uso: HUD, reação em dois passos e animações;
- os guias para criar fichas e animações com IA;
- o menu do Automated Animations e a lista de sons;
- o catálogo da Torre Infinita.

O índice de tudo está em [`docs/README.md`](docs/README.md).

## Estrutura

```
system.json          manifesto do sistema
nauren.mjs           código principal
modulos/             animações, compêndios, fichas, borda e ícones do token, relógio de combate, entidades de campo
templates/ styles/   telas (Handlebars) e estilos
lang/ data/          tradução e dados (Habilidades de Monstros)
assets/              imagens das árvores de subclasse
docs/                guias e arquivos de apoio
dist/nauren.zip      pacote que o Foundry baixa
LICENSE              licença de uso
```

---

Sistema Nauren RPG para Foundry VTT © Gustavo Yamavaki. Uso permitido conforme a [licença](LICENSE): instalar e jogar, sim; copiar, redistribuir, modificar ou vender, só com autorização.
