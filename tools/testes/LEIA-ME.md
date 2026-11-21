# Testes automáticos do Nauren RPG

Rodar tudo: `node tools/testes/rodar.mjs` (ou só um grupo: `node tools/testes/rodar.mjs movimento`).

- Rodam no Node, com um Foundry "de mentira" (`foundry-falso.mjs`): conferem as contas e o HTML gerado, não a tela do Foundry.
- Cada arquivo `NN-nome.teste.mjs` exporta `default async function (t)` e chama `t(condição, "o que devia acontecer")`.
- `tools/empacotar.sh` e a GitHub Action rodam os testes antes de montar o zip: **se algum falhar, a versão não é publicada**.
