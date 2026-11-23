# 0.123.0 — Animação e som dentro de cada Ação

Cada Ação ganhou o bloco **Animação e som** (ficha do item → Ações, abaixo de "Mais opções"). Fica guardado na própria Ação, então exportar/importar a ficha (JSON) leva junto: fichas feitas por IA já chegam animadas, sem o Merge no Automated Animations.

- **Modo:** *Automático* (como antes: o Automated Animations procura pelo nome), *Própria desta Ação* (usa o bloco) ou *Nenhuma*.
- **Tipo:** Projétil (de quem usa até cada alvo), Corpo a corpo, No alvo, Em quem usa e Na área (centro e tamanho da área criada).
- **Animação principal + impacto** (o impacto só toca em quem foi atingido). Tamanho, "tocar também quando erra" (o projétil passa do lado do alvo) e "por baixo dos tokens".
- **Procurar:** janela com **todas** as animações do banco do Sequencer (JB2A grátis, Patreon e outros módulos), busca por várias palavras, categorias (projéteis, corpo a corpo, impactos, áreas, cura, magias, marcadores), mini prévia em vídeo de cada uma (carrega conforme aparece na tela) e prévia grande da escolhida. Clique duas vezes para usar. Também tem "Arquivo…" para um .webm solto.
- O mesmo **Procurar** entrou nas animações de entrada/saída da aba Aparência.
- **Som** ao usar e no acerto, com volume e atraso. O som toca para todos **mesmo sem o Sequencer**.
- As opções de animação só aparecem com o Sequencer ativo; o som aparece sempre.
- **Testar** toca a partir do token do personagem (ou do selecionado) nos alvos marcados.
- O movimento dos tokens (Motion) espera a animação própria como esperava a do Automated Animations.
- A opção "Animações: Ações" das configurações continua desligando tudo.

Para IA: formato do campo `animacao` na seção 16.4a do `docs/criacao-ia/guia-criacao-ia.md`.
