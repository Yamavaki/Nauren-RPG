# Nauren RPG 0.108 — rebalanceamento dos inimigos

Só valores — nenhuma regra ou mecânica mudou.

## Vida
- Antes: Vitalidade × Categoria × (Nível + 2). Um Cat 1 de nível 2 tinha 16 de Vida e caía com um golpe
  (Arma Pesada 1d10 + 4; Ataque Pesado 2d10 + 8; críticos de 30–40).
- Agora: **Categoria × (Vitalidade × (Nível + 2) + 25)**, Chefe × 1,5. O piso de 25 por Categoria pesa no nível baixo
  e quase nada no alto.

| Nível | Cat 1 | Cat 2 | Cat 2 Defensor | Chefe Cat 2 | Chefe Cat 3 |
|---|---|---|---|---|---|
| 2 | 16 → 41 | 32 → 82 | 90 | 48 → 123 | 184 |
| 4 | 24 → 49 | 48 → 98 | 122 | 72 → 147 | 220 |
| 6 | 48 → 73 | 96 → 146 | 226 | 144 → 219 | 328 |
| 10 | 84 → 109 | 168 → 218 | 338 | 252 → 327 | 490 |
| 14 | 144 → 169 | 288 → 338 | 530 | 432 → 507 | 760 |
| 20 | 330 → 355 | 660 → 710 | 974 | 990 → 1065 | 1597 |
(Atacante, sem Pigmento.)

- **Bando de lacaios não muda** (fica sem o piso e com o dado base).
- Migração única (`migracaoVidaInimigosV1`): troca só a fórmula gerada pelo Criador/IA
  (`@vitalidade [* @categoria] * (@nivel + 2) [* 1.5]`). Bestiário, Bando e fórmulas feitas à mão ficam como estão.
  Quem estava com a Vida cheia continua cheio (ator e tokens não vinculados).

## Dano
- `@danoCat` cresce com o nível da criatura: +1 dado a cada 5 níveis a partir do 6 (6-10 +1, 11-15 +2, 16-20 +3,
  21-25 +4, 26-30 +5); `@meioCat` ganha metade disso. Níveis 1-5 iguais (os jogadores têm pouca Vida no começo).
  Antes, um Cat 1 de nível 6 e um de nível 10 batiam igual (1d6 + 9).
- Vale para todo NPC que usa `@danoCat`/`@meioCat` (Habilidades de Monstros, Criador, IA). Bando fica no dado base.

| Nível | Cat 1 | Cat 2 | Cat 3 | Cat 4 |
|---|---|---|---|---|
| 1-5 | 1d6 | 2d8 | 3d10 | 4d12 |
| 6-10 | 2d6 | 3d8 | 4d10 | 5d12 |
| 11-15 | 3d6 | 4d8 | 5d10 | 6d12 |
| 16-20 | 4d6 | 5d8 | 6d10 | 7d12 |
| 21-25 | 5d6 | 6d8 | 7d10 | 8d12 |
| 26-30 | 6d6 | 7d8 | 8d10 | 9d12 |

Guias da IA (`guia-criacao-ia.md`, `prompt-criacao-criatura.md`) atualizados com as fórmulas e a tabela de referência.
