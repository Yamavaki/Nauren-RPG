# 0.122.1 — Andar ponto a ponto (Ctrl + clique) em combate

- O Foundry faz um movimento com vários pontos em várias etapas (uma por ponto). Antes, o Nauren conferia só o 1º trecho: abria a janela para ele e cancelava o resto, e o token parava no 1º ponto.
- Agora a janela de movimento usa a **distância do trajeto inteiro** (soma de todos os trechos, como a régua mostra).
- Depois de pagar, o token anda **pelo caminho todo**, ponto a ponto, em vez de pular reto até o destino.
- Os trechos seguintes do mesmo movimento passam sem abrir a janela de novo.
- Quando o saldo cobre o trajeto, cada trecho desconta só o seu pedaço.
- Modo automático: conta cada trecho pelo caminho real.
- O card e a Prioridade do tipo de movimento valem para o movimento inteiro, sem card repetido a cada ponto.
- Movimento 0 ("mover mesmo assim") também segue os pontos.

Testes automáticos novos (`27-movimento-pontos`).
