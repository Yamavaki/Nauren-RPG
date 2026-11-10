# Nauren RPG 0.108.2 — suporte a andares e altura (Levels do Foundry V14)

Varredura do sistema inteiro atrás de tudo que olhava só o plano (x, y) e ignorava o andar/altura.
Tudo passa por um módulo só (`modulos/andares.mjs`). Cena sem andares (ou com 1 só): nada muda.

| O quê | Antes | Agora |
|---|---|---|
| **Áreas** (Ações de área, Região Persistente, armadilhas, Emanação, Traço da Aquarela) | pegava token de qualquer andar embaixo/em cima da forma | só pega quem está no andar da área (e na faixa de altura da Região, se ela tiver) |
| **Regiões criadas pelo sistema** | sem andar | nascem no andar de quem usou (Emanação, Traço) ou no andar que se está vendo (área colocada, baú/loja) |
| **Emanação/aura grudada no token** | ficava no andar antigo ao subir escada | acompanha o token para o andar novo |
| **Alcance / distância** (ataques, reações, cura em raio, Bando…) | só no plano | soma a diferença de altura (régua 3D do Foundry): o arqueiro na sacada mede até o alvo lá embaixo |
| **Auras e raios** (aliados a N m, Presença, auras de Estamina, cura em raio, Cadeia, Escudo Vivo, Estudos do Ladino, áreas do Inventor) | atravessavam o piso | só no mesmo andar |
| **Prioridade ao se aproximar / Impulso** | inimigo no andar de cima contava | só inimigo do mesmo andar |
| **Paredes** (empurrão, puxão, mover/teleporte escolhendo casa, trocar de lugar) | testava as paredes do andar que se está vendo, na altura 0 | testa as paredes do andar e na altura de quem se move |
| **Casa ocupada** (mover, invocar, besta inicial, obra-prima) | token de outro andar "ocupava" a casa | só conta quem está no mesmo andar |
| **Tokens criados** (invocações, lacaios, besta inicial, obra-prima, entidades como Orbe/Jóia/Moradia) | nasciam sem andar (andar padrão da cena) | nascem no andar e na altura de quem invocou / colocou |
| **Animação solta numa área** (Sequencer) | nascia na altura 0, ficava debaixo do piso de cima | nasce no piso do andar da área |
| **Moldura do token** | (0.108.1) | segue a arte do token quadro a quadro |

O que fica igual de propósito: Prioridade para aliado (basta ver o token), efeitos de "aliado na cena"
(Guiar o Destino, Teomanina, Druidismo) e a escolha de alvos (o Foundry já não deixa marcar quem não se vê).
Animações que seguem um token (Automated Animations, efeitos de Condição) já usam a altura do token.

API do V14: `Scene#levels`, `TokenDocument#level`, `RegionDocument#levels` e `#elevation`,
`PointSourcePolygon.testCollision(ElevatedPoint, ElevatedPoint, { level })`, `canvas.grid.measurePath` com `elevation`.
