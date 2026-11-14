# 0.114.0 — Escritos: Cartaz

Fase 4 do plano "Escritos modernos e Quadro de avisos".

- Formato novo **Cartaz** (todas as eras), com campos próprios em vez de páginas: tipo (**Procurado, Desaparecido, Missão, Aviso, Recompensa, Evento**), título grande, linha de baixo, nome, texto curto, retrato, valor (Recompensa/Paga/Multa/Entrada, o nome do valor é editável), quem pede, prazo e até 6 detalhes (Altura, Visto em, Crimes…).
- Cada era tem seu desenho:
  - **Clássico**: papel rasgado, letras antigas, retrato em moldura dupla.
  - **Moderno**: pôster impresso com faixa colorida (cor por tipo, editável), dados ao lado do retrato, recompensa com QR e tarja de rodapé.
  - **Cyberpunk**: ficha holográfica com código (#7731-K), barra de **Ameaça** e valor em créditos; Missão/Recompensa em ciano, Aviso/Evento em âmbar.
- Procurado e Desaparecido sem imagem mostram uma silhueta.
- "Preencher" abre um formulário com prévia ao vivo.
- O desenho é todo proporcional: o mesmo cartaz aparece na ficha do item como miniatura (e será usado no Quadro de avisos).
- JSON: `"formato": "cartaz", "cartaz": { "tipo", "titulo", "subtitulo", "nome", "texto", "retrato", "recompensa", "recRotulo", "contratante", "prazo", "detalhes", "ameaca", "codigo", "cor" }`.

Não testado dentro do Foundry: o seletor de imagem do retrato.
