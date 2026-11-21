# 0.118.0 — Tipos de movimento (livro 0.9)

Cada ação de movimento agora tem um tipo:

| Tipo | Prioridade | Custo | Distância (6 m) |
|---|---|---|---|
| Ofensivo | P/I: 1 inimigo à escolha | 1 PdE | 6 m (total) |
| Defensivo | P/A: 1 aliado à escolha | 1 PdE | 3 m (metade, arredonda para baixo) |
| Disparada | N/P: ninguém, nem ao chegar perto | 3 PdE | 12 m (dobro) |

- **Janela do movimento** (modo pop-up): três cartões no topo com metros, custo por ação e quantas ações o trajeto precisa. Trocar o tipo recalcula todas as formas de pagar (Estamina, Espírito da Batalha, Impulso, cargas, recursos extras).
- **Prioridade pelo tipo**: no Ofensivo, o card abre a escolha de inimigo e quem você alcançou já vem marcado (Passo Gatuno e afins: não vem marcado). No Defensivo, a escolha é de aliado. Na Disparada, o card mostra N/P.
- **Saldo por tipo**: os metros que sobram continuam valendo no turno, **só para o mesmo tipo**. Escolher outro tipo descarta o saldo, e a janela avisa antes.
- **Caído** divide antes do tipo: Caído + Defensivo = 6 m → 1 m. Medo (custo extra) soma por ação, também na Disparada.
- **HUD de combate**: embaixo da barra de movimento, os três tipos com os metros. Clicar escolhe o tipo preferido, que vem marcado na janela e é o que o modo automático cobra. Um pontinho mostra o tipo do saldo atual.
- **Ficha**: embaixo do Movimento, as três distâncias (passe o mouse para ver custo e Prioridade).
- **Modo automático**: cobra pelo tipo preferido do HUD (padrão Ofensivo).
- Testes automáticos novos (`20-movimento`): tabela do livro, Caído, Medo, saldo do mesmo tipo e de outro tipo, várias ações.
