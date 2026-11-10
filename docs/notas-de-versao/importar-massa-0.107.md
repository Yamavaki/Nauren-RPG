# Nauren 0.107.0 — Importar em massa (fichas de IA com a borda do token)

## O botão
O Mestre tem **Importar em massa** no rodapé das abas **Atores** e **Itens**. Ele abre uma janela onde você:
1. **Escolhe um ou vários arquivos .json** ou cola o texto. Pode colar a resposta inteira da IA: o texto em volta e as cercas ```json são ignorados.
2. Clica em **Ler e conferir**. A prévia mostra cada ficha, com tipo, nível, quantos itens tem, subpasta e borda. Também aparecem:
   - **Erros** (em vermelho), como um tipo que não existe;
   - **Avisos** (em amarelo), como um modelo de borda ou uma Pronta que não existe.
   
   O **X** tira uma ficha antes de importar.
3. Escolhe o **destino**, separado para Atores e para Itens:
   - **+ Criar uma pasta nova** (com o nome que você digitar);
   - uma das **pastas que já existem**;
   - **Sem pasta**.
   
   Com **Usar as subpastas do arquivo** marcado, o campo `"pasta"` de cada ficha (ou do lote) vira subpasta dentro do destino. Exemplo: Importados → Floresta Cinzenta → Chefes.
4. Clica em **Importar N**. O rodapé mostra quantas fichas foram criadas e quantas saíram com borda. Um resumo sussurrado no chat lista também:
   - o que falhou;
   - as referências que não foram achadas neste mundo.

## O que aceita
- Fichas no formato do Foundry: o JSON do **Export Data**, ou o que a IA gera pelo `guia-criacao-ia.md`. Pode ser uma ficha, uma lista de fichas ou um lote `{ "pasta": "…", "documentos": [ … ] }`.
- **Escritos** no formato simples (`formato` + `paginas`).
- Referências a compêndios de outro mundo são consertadas pelo nome, como no Import Data.

## Borda do token
Cada ator pode trazer `"borda"`:
- **O nome de uma Pronta do Mestre:** `"borda": "Inimigo padrão"`.
- **A borda montada:** `{ "modelo": "espinhos", "paleta": "obsidiana", "esmalte": "#2a0f12", "efeitos": [ { "tipo": "pulso", "cores": ["#ff4060"] } ], "girar": { "modo": "tudo", "vel": 1 } }`.
- **O anel do Foundry:** `{ "modelo": "foundry", "cores": ["#3ddc6a"], "efeitos": ["pulso"] }`.

O sistema mede a moldura, recorta a imagem e grava tudo no token padrão. Ao arrastar a ficha para o mapa, o token já aparece com a borda.

## Pedindo para a IA
Anexe o `guia-criacao-ia.md` e o `prompt-criacao-criatura.md` (pasta docs/criacao-ia do sistema) e preencha o prompt. Dois campos são novos:
- **Borda do token:** "automática pelas cores e pela personalidade", "Pronta 'Nome'" ou "sem borda".
- **Quantas:** 1, ou várias (aí a IA entrega um lote).

A **seção 17** do guia ensina a IA a escolher:
- a **paleta** pela cor dos Pigmentos;
- o **modelo** pela personalidade (selvagem → espinhos; nobre → selo-real; arcano → mandala; mecânico → engrenagem…);
- o **efeito** pelo temperamento (raivoso → pulso rápido; calmo → respirar; etéreo → neon por fora, sem esmalte);
- **lacaios** com borda simples e **chefes** com 2 efeitos.

Exemplo de lote: `docs/exemplos/lote-exemplo.json`.

## O que conferir no Foundry
- Com 20 NPCs ou mais, a importação leva alguns segundos (cada borda é medida e recortada). O rodapé mostra o progresso.
- Arraste um NPC importado com borda para o mapa e veja se a moldura aparece certa.
