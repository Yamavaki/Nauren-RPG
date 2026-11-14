# 0.112.0 — Escritos: Mensagens (celular)

Fase 2 do plano "Escritos modernos e Quadro de avisos".

- Formato novo **Mensagens** (eras Moderno e Cyberpunk): uma conversa de celular com contato, foto, linha de baixo ("visto por último…"), balões recebidos e enviados, nome acima do balão (grupos), hora, imagens e separadores de data.
- Temas: **Claro**, **Escuro** e **Comunicador neon** (o padrão no Cyberpunk).
- **Só o Mestre escreve.** Em "Escrever", um editor próprio com a lista de mensagens à esquerda e a prévia do celular à direita.
- **Revelar aos poucos**: os jogadores só veem as mensagens que o Mestre manda. No rodapé do leitor (só o Mestre vê): "Mandar a próxima", "Mostrar todas" e "Esconder todas". A mensagem nova chega com animação e som de notificação na tela de quem estiver lendo. Opcional: três pontinhos de "digitando…" quando a próxima é recebida.
- A janela do leitor deixou de ficar presa em 600 px de largura (o livro aberto e o editor da conversa usam o espaço todo).
- JSON: `"formato": "mensagens"` com `"mensagens": { contato, status, tema, aosPoucos, lista: [...] }` (sem era, vira Moderno).

Não testado dentro do Foundry: o som (sounds/notify.wav do Foundry), a animação ao vivo para os jogadores e o seletor de imagem.
