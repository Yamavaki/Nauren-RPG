# HUD de Combate

Painel fixo embaixo da tela com as Ações do token selecionado, para jogar sem abrir a ficha. **Não tem regra própria:** cada botão chama o mesmo método da ficha, então custos, popups de reação, Prioridade, gatilhos e animações acontecem exatamente como pela ficha.

## Quando aparece
- Configuração **HUD de Combate** (por jogador): *Sempre que selecionar um token* (padrão), *Só em combate* ou *Nunca*.
- **Shift+H** ou o botão de espadas nos controles de token mostra ou esconde na hora.
- Aparece para o token selecionado cuja ficha o usuário pode usar (o Mestre vê o de qualquer token). Sem token selecionado, some.
- Acompanha a configuração **Tamanho da interface do Nauren**.
- Com a opção **HUD de Combate: esconder a barra de macros** (ligada por padrão, por jogador), a barra de macros some enquanto o HUD está aberto e o HUD desce para o lugar dela; recolhido ou fechado, a barra volta.

## O que mostra
- **Esquerda:** retrato (clique abre a ficha), nome, classe e nível, barras de Vida, Mana e Estamina de Combate, Estresse (bolinhas até 3 de máximo; número acima disso), Dados de Destino (clique gasta um e rola) e o botão **Testes**, com os 9 testes da ficha (1d20 + valor).
- **Centro:** abas **Armas** (equipadas primeiro), **Magias** (no Grimório, só as páginas abertas podem ser conjuradas; as fechadas ficam tracejadas; setas viram a página pela Ação do Grimório), **Habilidades** (com Ação), **Efeitos** (efeitos e emanações que ligam e desligam; verde = ligado) e **Consumíveis** (com a quantidade). Cada botão traz o ícone do item, o custo da Ação com a estrela e os usos. Botões apagados mostram o motivo na dica (falta de recurso, acabou); o sistema ainda confere ao usar, então habilidades que pagam com outro recurso continuam funcionando.
- **Acima:** aviso de **Prioridade** quando você é **alvo de um ataque** (enquanto o popup de reação está aberto) e quando um **aliado concede Prioridade** a você no turno atual. Bloquear e Esquivar continuam no popup de reação. Passar o mouse num botão mostra o **cartão de dica** (nome, tipo, descrição, aviso e custo) acima do painel do meio.
- **Direita:** até 4 Condições com acúmulos (mais que isso: 3 e "+N", que abre a ficha); o ícone abre a Condição e o **−** no canto (ao passar o mouse) tira 1 acúmulo pelo mesmo caminho da ficha. Barra verde de **movimento guardado** (Movimento Continuado, sobre o deslocamento de uma ação; mover continua sendo arrastar o token) e **Encerrar turno** quando é o turno deste personagem.
- O botão de seta recolhe o HUD a uma pílula com o retrato; a escolha é lembrada por jogador.

## Favoritos (aba ★)
- **Fixar:** arraste um item da ficha para o painel do meio do HUD, ou clique com o **botão direito** num botão de qualquer aba. **Tirar:** botão direito de novo.
- **Reordenar:** na aba ★, arraste um favorito sobre outro (metade esquerda = antes, metade direita = depois).
- Cada favorito funciona igual à aba de origem (efeito liga e desliga, magia respeita a página do Grimório, consumível mostra a quantidade). Nas outras abas, uma ★ marca o que já é favorito.
- Os favoritos ficam salvos na ficha do personagem (flag `nauren.hudFavoritos`), valendo em qualquer computador. Itens apagados da ficha somem sozinhos da lista. Condições não entram.
- Um botão do HUD arrastado para a barra de macros vira macro, como um item arrastado da ficha.
- O HUD abre na aba ★ quando o personagem tem favoritos.
- Acessórios com Ação (anéis, amuletos) aparecem em Habilidades.

## Alvos e turno
- **Alvos marcados:** caixa acima do painel direito (mesma largura), visível sempre que você tem alvo marcado. Mostra até 3 (mais: "+N"); **×** desmarca um, **Limpar** desmarca todos. Alvo do seu próprio lado aparece com borda vermelha e a etiqueta **aliado** (ou **você**, se marcou o próprio token).
- **Alvo esquecido:** com o modo de mira ligado, se uma Ação começar com alvo marcado **num turno anterior** (fora de combate: há mais de 1 minuto), o sistema pergunta **"Usar em Fulano?"**: *Usar* segue com ele; *Escolher outro alvo* desmarca e abre a mira. Alvo marcado no turno atual é usado direto, como antes.
- **Desmarcar quando o turno acaba:** opção **"Desmarcar meus alvos quando o turno acabar"** (por jogador, ligada por padrão). Os alvos são desmarcados quando termina o turno em que foram marcados (o seu ou o de outra pessoa, como numa Prioridade) e quando termina o turno de um personagem seu.
- **Próximo:** abaixo de "Turno de Fulano", o HUD mostra quem joga depois ("Próximo: você!" em dourado quando é você). No seu turno, passe o mouse em Encerrar turno para ver o próximo.
