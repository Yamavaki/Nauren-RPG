# 0.120.2 — Dano verdadeiro na janela de reação + revisão

**Dano verdadeiro**
- A janela de reação agora mostra o dano verdadeiro:
  - no cabeçalho ("se acertar: 5 de dano + 2 de dano verdadeiro");
  - na barra de Vida de cada opção;
  - numa nota explicando que ele não é reduzido e só some se o ataque for evitado (Bloqueio que segura, Esquiva, Deflexão ou usar a Prioridade).
- Ação que só causa dano verdadeiro (sem teste e sem dano normal) agora chega no alvo. Antes ela não gerava o evento e o dano se perdia.
- Ataques com vários projéteis aplicavam o dano verdadeiro uma vez por projétil. Agora ele entra uma vez só.
- No 2º passo da reação (depois de rolar a defesa), a janela também aparece quando só sobrou dano verdadeiro.
- "Gastar 1 Estresse" não aparece mais quando só há dano verdadeiro, porque o Estresse não o reduz.

**Revisão da 0.118–0.120**
- Aspecto do Mantis: só é oferecido quando quem ataca é o combatente do turno. Antes, um ator fora do tracker também disparava o Mantis.
- Aspecto do Mantis: repetições e ataques grátis (como a repetição dos Mísseis Arcanos ou o ataque da Ambidestria) não oferecem de novo.

Testes automáticos novos (`24-dano-verdadeiro`).
