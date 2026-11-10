# Nauren RPG 0.107.2 — correções

## Armas com Agilidade → Poder de Ataque
- Arco, Besta, Arma de Fogo, a arma de distância antiga e as variantes de arma leve do Ladino estavam semeadas com
  `atributoAtaque: "agilidade"`. Pelo livro, toda arma ataca com o **Poder de Ataque** (que já usa o maior entre Força e Agilidade).
- Também corrigidas as Habilidades que atacam com a arma: **Ataque Múltiplo** e **Disparo Quimérico**.
- Migração única (`migracaoAtaqueAgilidadeV1`, roda no Mestre ao abrir o mundo): troca nas armas dos itens do mundo,
  das fichas e dos tokens não vinculados. Outras Habilidades que usam Agilidade de propósito não são mexidas.
- Compêndios: use "Resetar compêndios" para receber as sementes novas.

## Moldura do token e andares (Levels do V14)
- Token de outro andar: o Foundry corta/esconde a arte debaixo do piso de cima, mas a moldura (maior que a arte)
  vazava por fora. Agora a moldura, os efeitos e o "pincel na frente" somem quando o token não está no andar que se está vendo.
- A moldura também copia o modo de oclusão da arte (`occlusionMode`, `occluded`).

## Retrato no HUD e no card
- O retrato do HUD e do cabeçalho dos cards (ex.: Movimento) usa a imagem da ficha **com o recorte da ficha**
  (posição e zoom do Enquadramento) e fica preso na caixa — nada passa da borda.
- Quando o card mostra o ícone de um item/habilidade, o ícone continua o mesmo.

Testes: `md2-moldura-mapa` (andares), `mig-0107`, `rc1-retrato-recorte` + bateria rápida.
