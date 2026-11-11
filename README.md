# Nauren RPG — sistema para Foundry VTT

> Um mundo pintado e abandonado, onde o Acaso mancha as bordas da realidade e os personagens resistem usando **Estamina**, **Prioridade** e o poder do **Grande Prisma**.

Sistema completo do **Nauren RPG** para o Foundry VTT: fichas, combate automatizado e compêndios com todo o livro.

![Foundry](https://img.shields.io/badge/Foundry-v14-orange) ![Versão](https://img.shields.io/badge/vers%C3%A3o-0.110.0-purple) ![Idioma](https://img.shields.io/badge/idioma-pt--BR-green)

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
- **Aprimorar itens.** Pigmentos aplicados em armas e armaduras (espaços pelo tier, bônus enquanto equipado) e itens que modificam uma Habilidade, Magia ou a Condição que ela aplica, somando depois das Subclasses.
- **Armazenamentos e lojas.** Baús, cofres e balcões no mapa, com tranca por chave e venda de itens.
- **Escritos.** Notas, cartas, pergaminhos e livros para os jogadores lerem, com parágrafos secretos do Mestre.
- **Molduras e barras de token.** Molduras desenhadas pelo sistema, barras de Vida e Estamina e suporte a cenas com andares.
- **Organizador das listas e Importar em massa.** Selecionar, mover e apagar vários de uma vez (com Lixeira) e importar fichas em JSON.
- **Animações (opcional).** Integração com Automated Animations, Sequencer e JB2A, com movimento, cor do token e som sincronizados. O menu pronto fica em [`docs/animacoes/`](docs/animacoes/).

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

| Pasta | Para quê |
|---|---|
| `jogar/` | Guias de uso na mesa: HUD de combate e reação em dois passos |
| `animacoes/` | Como ligar as animações, o menu do Automated Animations e a lista de sons |
| `criacao-ia/` | Guia, prompt, planilha e lista de ícones para criar fichas com IA |
| `animacoes-ia/` | Guia e listas do JB2A para a IA montar animações de criaturas |
| `torre-infinita/` | Catálogo dos itens da Torre Infinita |
| `exemplos/` | Arquivos de exemplo para o Importar em massa e os Escritos |
| `notas-de-versao/` | O que mudou em cada versão grande |

O índice de tudo está em [`docs/README.md`](docs/README.md).

## Estrutura

```
system.json          manifesto do sistema
nauren.mjs           código principal
modulos/             animações, compêndios, fichas, borda e ícones do token, relógio de combate, entidades de campo
templates/ styles/   telas (Handlebars) e estilos
lang/ data/          tradução e dados (Habilidades de Monstros)
assets/              imagens das árvores de subclasse
docs/                guias e arquivos de apoio, separados em pastas por assunto
tools/empacotar.sh   monta o dist/nauren.zip a partir do repositório
.github/workflows/   publica a Release com o zip a cada versão nova (o Foundry baixa dali)
LICENSE              licença de uso
```

---

Sistema Nauren RPG para Foundry VTT © Gustavo Yamavaki. Uso permitido conforme a [licença](LICENSE): instalar e jogar, sim; copiar, redistribuir, modificar ou vender, só com autorização.
