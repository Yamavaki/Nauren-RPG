# Imagens de fundo das árvores de Subclasse

Coloque aqui a imagem de fundo de cada árvore de Subclasse, com o nome exato
(minúsculo, sem acento) do `classeIdentifier` correspondente:

| Arquivo esperado    | Classe      |
|----------------------|-------------|
| `druida.webp`         | Druida      |
| `guerreiro.webp`       | Guerreiro   |
| `ladino.webp`          | Ladino      |
| `empireo.webp`         | Empíreo     |
| `mistico.webp`         | Místico     |
| `sacerdote.webp`       | Sacerdote   |
| `cacador.webp`         | Caçador     |
| `mago.webp`            | Mago        |
| `inventor.webp`        | Inventor    |

## Proporção recomendada

Cada árvore empilha as 3 vias da Subclasse na MESMA imagem (de cima pra
baixo). A profundidade real varia por classe - a maioria cabe numa imagem de
proporção retrato longa (ex: 900×1600px, ~9:16).

## Formato

`.webp` (desde a 0.109.20; antes eram `.png`, cinco vezes maiores). O código
espera essa extensão (função `naurenCaminhoImagemSubclasse`, em
`modulos/compendios.mjs`). Se uma imagem não carregar, o sistema tenta sozinho
as outras extensões (`.png`, `.jpg`) e variações do nome.

## O que acontece automaticamente

Ao seu mundo do Foundry ser aberto, cada Subclasse já é criada apontando pro
caminho esperado aqui (`assets/subclasses/<classe>.webp`). Se o arquivo ainda
não existir, o navegador mostra uma imagem quebrada, mas o sistema tem uma
altura mínima de segurança (CSS) pra não deixar a árvore pior do que ficaria
sem imagem nenhuma. Assim que você adicionar o arquivo aqui (com o nome
certo) e reiniciar o Foundry, a imagem aparece sozinha - sem precisar editar
nada na ficha da Subclasse.
