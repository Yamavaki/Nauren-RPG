# Nauren RPG 0.109 — Organizador das listas

Seleção de vários, filtros rápidos e ações em lote direto na barra lateral (Atores, Itens, Cenas, Diário, Tabelas,
Cartas, Playlists, Macros) e nas janelas dos compêndios. Código: `modulos/organizador.mjs`.

## Botões novos (ao lado da busca)
- **Filtros** (todos, inclusive jogadores): etiquetas de um clique, combináveis, com a contagem. Etiqueta sem nada fica escondida.
  - Atores: Jogadores, Personagens, NPCs, Chefes, Bando, Baús e lojas, Na cena, Sem imagem, Sem pasta, Nomes repetidos.
  - Itens: um por tipo (Armas, Habilidades, Condições…), Escritos, Pigmentados, Sem ícone, Sem pasta, Nomes repetidos.
  - Cenas: Ativa, Na navegação, Com andares, Com tokens, Sem miniatura, Sem pasta, Nomes repetidos.
  - Compêndios: por tipo, Sem imagem, Sem pasta, Nomes repetidos.
- **Selecionar** (Mestre): com ele ligado, cada clique marca/desmarca e não abre a ficha. Desligar limpa a seleção.
- **Lixeira** (Mestre): abre a janela da Lixeira.

## Seleção (Mestre)
- Fora do modo: Ctrl+clique marca, Shift+clique marca o intervalo; clique simples abre a ficha como sempre.
- **Pastas**: a caixinha da pasta marca **a pasta** (não o que está dentro). O botão ✔✔ ao lado do nome marca **o que está dentro** (inclui subpastas).
- "Selecionar os visíveis" (com filtro ligado) marca tudo o que sobrou.
- Esc limpa a seleção. Trocar de aba limpa a seleção das outras listas.

## Ações (barra embaixo da lista e botão direito em cima de algo marcado, com 2 ou mais)
- Mover (lista de pastas + Pasta nova; também arrastando qualquer marcado: vai o grupo todo). Pastas marcadas movem junto
  (não entram em si mesmas nem passam do limite de níveis). **Desfazer**.
- Duplicar (as cópias ficam marcadas; Desfazer). Excluir (abaixo). Renomear (antes/depois do nome, trocar texto, numerar na
  ordem da lista; prévia ao vivo; Desfazer). Dono e permissões (Desfazer). Exportar o lote (JSON no formato do Importar em
  massa). Enviar para um compêndio. Nos compêndios: Trazer para o mundo.
- Atores: Colocar na cena (em grade no centro da tela, no andar que se está vendo; Desfazer), Aplicar borda de token (moldura
  pronta), Mudar nível dos NPCs, Curar e restaurar tudo, Limpar Condições. Arrastar o grupo de atores para o mapa: todos viram tokens.
- Itens: Dar a um ator; arrastar o grupo para a ficha dá todos de uma vez.
- Cenas: Pôr/tirar da navegação, Pré-carregar para todos, Gerar miniaturas.

## Excluir + Lixeira
- A janela mostra quantos e quais nomes. Com pastas marcadas, escolhe: **excluir só a pasta (o conteúdo sobe um nível)**
  ou **a pasta e tudo dentro** (com a contagem de itens e subpastas).
- Antes de apagar, uma cópia vai para a Lixeira (compêndio do mundo "Lixeira — Atores/Itens/…", na pasta de compêndios
  "Lixeira do Nauren"), com a data, quem excluiu e o caminho da pasta. Aviso com **Desfazer** logo depois.
- Janela da Lixeira: lotes por data; Restaurar tudo / um item (volta para a pasta; se a pasta não existe mais, recria pelo
  caminho); Apagar de vez; Esvaziar. Configuração do mundo "Lixeira: dias guardados" (padrão 30): o que passa do prazo é
  apagado sozinho quando o Mestre abre o mundo.

## Técnico
Hook `renderDocumentDirectory` (todas as listas e o Compendium), cliques/arrastar/botão direito em captura (só quando a
seleção está em jogo; senão o Foundry segue normal), `createDocuments/updateDocuments/deleteDocuments` em lote,
`Folder.deleteDocuments(ids, { deleteSubfolders, deleteContents })`. Se o módulo "Multiple Document Selection" estiver ligado,
o Ctrl+clique fica com ele. Testado num simulador de navegador com a marcação dos templates do Foundry (29 checagens).

## 0.109.1 — Dono na lista
- Embaixo do nome: "● Ana" na cor do jogador dono (bolinha acesa = online, apagada = desligado); "Ana +1" com mais de um dono
  (a dica mostra todos); "Todos" quando a permissão padrão é Dono; "★ personagem" quando a ficha é o personagem principal dele.
- Em todas as listas com dono (Atores, Itens, Diário, Tabelas, Cartas, Playlists; em Macros, o autor). Cenas e compêndios não.
- Quem vê: o Mestre (tudo) e o próprio dono (só nas dele).
- Filtros: uma etiqueta por jogador ("Ana 3"); o jogador vê só a "Meus".
- A busca da lista também acha pelo nome do jogador dono (Mestre: de qualquer um; jogador: o próprio).
- Atualiza sozinho ao mudar permissão, personagem principal, cor/nome do jogador e quando ele entra/sai.
