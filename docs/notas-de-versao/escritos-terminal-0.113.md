# 0.113.0 — Escritos: Terminal com senha

Fase 3 do plano "Escritos modernos e Quadro de avisos".

- Formato novo **Terminal** (eras Moderno e Cyberpunk): monitor com barra do topo (caminho do arquivo), a linha de comando (`> abrir mensagem.dat`) e o texto aparecendo digitado. Tem páginas como os outros escritos e usa a tela escolhida (Terminal verde, Painel âmbar, Tela escura…).
- **Criptografado**: na aba Escrito, o Mestre escreve o texto, põe dica e número de tentativas e clica em **Trancar com a senha**. O texto é **cifrado dentro do item**: nenhum jogador (nem o Mestre) lê o texto nos dados sem a senha, e a conferência funciona sem o Mestre online.
- O jogador vê **ACESSO NEGADO**, digita a senha (maiúsculas e espaços nas pontas não importam) e, se acertar, vê "senha aceita / decodificando" e o texto sendo digitado. A tela lembra a senha depois do acerto.
- Senha errada: o campo treme, conta as tentativas e (opcional) o Mestre recebe um sussurro. Esgotou: **TERMINAL BLOQUEADO** até o Mestre clicar em **Zerar tentativas**.
- Para editar: **Destrancar para editar** (pede a senha). **Esqueci a senha** apaga o texto cifrado e destranca vazio.
- JSON: `"formato": "terminal", "terminal": { "caminho", "comando", "senha", "dica", "tentativas" }`. Com `senha`, o escrito já entra trancado (a senha não fica guardada). O exportar leva o texto cifrado.

Observação honesta: é uma tranca de jogo (SHA-256 com a senha), boa para impedir espiar os dados; uma senha curta pode ser descoberta por quem tentar muitas combinações por fora do Foundry.

Não testado dentro do Foundry: o sussurro ao Mestre, as janelas de confirmação/senha (DialogV2) e a animação de decodificar ao vivo.
