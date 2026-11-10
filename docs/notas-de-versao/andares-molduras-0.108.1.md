# Nauren RPG 0.108.1 — moldura do token em mapas de vários andares

Na 0.107.2 a moldura sumia sempre que o token estava em outro andar (para não vazar por fora do piso de cima).
Efeito colateral: token de outro andar visto por um buraco no piso, escada etc. aparecia sem moldura.

Agora a moldura **segue a arte do token quadro a quadro**: para token de outro andar, a moldura, o fundo, o "pincel
na frente" e todos os efeitos só são desenhados no quadro em que o Foundry desenhou a arte do token. Se a arte
aparece pelo buraco, a moldura aparece junto; se o Foundry esconde a arte, a moldura some junto.
No andar que se está vendo, nada muda.

Técnico: um contador de quadros (ticker, prioridade alta) e um "espião" no `_render` da malha do token marcam o
quadro em que a arte foi desenhada; as malhas da moldura (`render`) e o furo da interface (`_renderVoid`) só
desenham se a arte foi desenhada no quadro atual ou no anterior (as camadas de trás desenham antes da arte).
