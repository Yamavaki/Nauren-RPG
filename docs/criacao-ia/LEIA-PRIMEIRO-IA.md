# Para a IA: como criar uma ficha do Nauren RPG

Você recebeu o link deste repositório para criar uma ficha (criatura, NPC, personagem ou item) do Nauren RPG para o Foundry VTT. Siga este arquivo em ordem.

## 1. Leia estes arquivos (links diretos, texto puro)

Leia por inteiro, nesta ordem, antes de escrever qualquer JSON:

1. **Prompt de criação** (balanceamento, como automatizar cada habilidade, as saídas): https://raw.githubusercontent.com/Yamavaki/Nauren-RPG/main/docs/criacao-ia/prompt-criacao-criatura.md
2. **Guia de campos do JSON** (fonte de verdade de todo campo): https://raw.githubusercontent.com/Yamavaki/Nauren-RPG/main/docs/criacao-ia/guia-criacao-ia.md
   - Seções essenciais: 3 (Ator), 4 (modificadores), 4.6 a 4.8 (Condições, Peculiaridades, Pigmentos), 5 a 7 (itens, Ações, Gatilhos), 8 (checklist), 11 (`self:`), 14 (ícones), **16.4a, 16.4b e 16.4c (animação e som)**, 17 (borda e lote).
3. **Guia de animações** (tabela de cor por elemento, seção 5, e de som, seção 5a): https://raw.githubusercontent.com/Yamavaki/Nauren-RPG/main/docs/animacoes-ia/guia-animacoes-ia.md
4. **Listas para copiar (não leia tudo de uma vez; procure dentro delas):**
   - caminhos do JB2A que existem na mesa: https://raw.githubusercontent.com/Yamavaki/Nauren-RPG/main/docs/animacoes-ia/jb2a-caminhos.txt
   - sons da mesa, com o endereço completo (a parte depois do `|`): https://raw.githubusercontent.com/Yamavaki/Nauren-RPG/main/docs/animacoes/sons-forge.txt
   - ícones do Foundry: https://raw.githubusercontent.com/Yamavaki/Nauren-RPG/main/docs/criacao-ia/icones-foundry.txt
5. **Exemplo pronto, importável** (veja como as Ações, as camadas de animação, as Condições, a aura e a área ficam no JSON): https://raw.githubusercontent.com/Yamavaki/Nauren-RPG/main/docs/exemplos/ficha-de-testes.json

Se não conseguir abrir algum link, **diga qual** e peça ao usuário para anexar o arquivo. Nunca invente caminho de ícone, de animação ou de som: tudo é copiado letra por letra dessas listas.

## 2. Regras que mais erram

- **Toda Ação leva animação e som** (`animacao` com `"modo": "propria"` e `camadas`), coerentes com o elemento e a arma (guia 16.4c).
- **Magias:** conjuração em quem usa (som de `Preparando/`) → depois a magia com outro som → nos projéteis, explosão no alvo com som de impacto.
- **Sem poluição:** golpe comum 1–2 camadas, à distância 2, magia 2–3, buff/cura 2. Sequências grandes (4–6 camadas, tremor, espalhar) **só** nas 1–2 habilidades mais fortes do chefe, e só se fizer sentido.
- Condições novas que se veem (fogo, veneno, raízes, gelo): `animacaoCondicao.continuo` com a versão **loop**. Emanações: `emanacaoAnimacao.continuo` (aura).
- Área sem teste de ataque (Ação Anunciada): `ehAtaque: false`, um dado de dano para todos.
- Números (atributos, Vida, Defesa, dano) pela Parte 1 do prompt; 2 ou mais Pigmentos; `.value` = `.max` nos recursos.
- Itens obrigatórios de criatura: Peculiaridades, "Ponto Fraco", "Dar Prioridade", "Perjúrio do Acaso: …", "Categoria N"; `notas` em 5 partes.

## 3. Entregue

- Um único bloco ```json (uma ficha, ou um lote `{ "pasta": "…", "documentos": [ … ] }` para várias). O Mestre importa pelo botão **Importar em massa**.
- Depois do JSON, rode o checklist da seção 8 do guia, item por item, e diga o que não deu para automatizar.
