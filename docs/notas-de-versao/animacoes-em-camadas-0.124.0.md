# 0.124.0 — Animações em camadas (chefes, combos, Condições, auras e áreas)

## Camadas
O bloco **Animação e som** de cada Ação (modo *Própria*) virou uma lista de **camadas**. Cada camada é uma animação do Sequencer com:
- **Onde:** em quem usa, em cada alvo, só nos atingidos, de quem usa até o alvo (projétil; no erro passa do lado), do alvo até quem usa (dreno) ou na área (linha e cone esticam da origem até a ponta).
- **Quando:** junto da anterior ou depois que ela termina, mais um atraso em ms.
- **Tempo:** duração, repetir (com intervalo), velocidade, surgir e sumir aos poucos.
- **Forma:** tamanho, opacidade, girar (ou giro aleatório), espelhar (ou espelho aleatório), posição aleatória (chuva de meteoros) e plano (por baixo, normal, acima da luz).
- **Cor:** bolinhas com as variações de cor do JB2A daquela animação, mais matiz, saturação, brilho e tingir.
- **Som e tela:** som próprio (com atraso e volume) e tremer a tela.
- Cada camada tem prévia, nome, ligar/desligar, subir/descer, duplicar e apagar. **Testar** toca tudo do token do personagem nos alvos marcados.
- Fichas com o bloco simples da 0.123 viram camadas sozinhas (nada se perde).

## Combos
- Botão **Combos**: combos prontos (Meteoro, Raio divino, Maldição sombria, Cura divina, Pisão do gigante, Em chamas, Escudo mágico, Anel de fogo, Espíritos guardiões, Campo de energia). Adicione no fim ou troque tudo.
- **Salvar combo** (Mestre): guarda as camadas como combo do mundo, para usar em qualquer ficha.

## Condições, Emanações e áreas
- **Condição:** aba **Animação** com *Ao receber* (toca de novo a cada acúmulo, se quiser), *Enquanto durar* (presa ao token, some sozinha quando a Condição sai) e *Ao sair*.
- **Emanação:** *Aura* (em loop, presa ao token, do tamanho do raio ou do token) e *A cada efeito* (pulso nos alvos, na aura ou como projétil).
- **Área persistente:** *Enquanto a área existir* (loop) e *A cada efeito da área* (na área ou em quem está dentro).

## Andares
- Efeitos presos a um token seguem o andar do token (como já acontecia com as Condições do Automated Animations).
- Efeitos soltos no mapa (áreas) nascem no piso do andar da área e só aparecem quando se vê aquele andar.

## IA e ficha de testes
- Formato no `guia-criacao-ia.md`, seção 16.4b.
- Ficha de testes atualizada: Chefe Meteoro, Chuva de Meteoros, Raio Divino, Cor Trocada, Toque Vampírico com dreno voltando, Fúria e Enraizado animados, Aura de Fogo e Campo de Espinhos com loop e pulso.
