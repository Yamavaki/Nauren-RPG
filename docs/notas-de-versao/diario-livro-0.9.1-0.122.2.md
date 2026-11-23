# 0.122.2 — Diário "Regras do Livro" na versão 0.9.1

- O diário **Nauren — Regras do Livro** (compêndio de Regras) agora traz o **texto inteiro do livro 0.9.1**, sem resumo, em 22 páginas:
  - introdução e dados;
  - capítulos I a VIII;
  - uma página por classe, agora com o **Inventor**;
  - Magia e Duas Armas, Condições, Equipamentos, Venenos e Itens Especiais, Regras Gerais e Profissões.
- Entra a regra nova de movimento (Ofensivo, Defensivo, Disparada). A antiga, que o livro marca como "removido em breve", fica de fora.
- A "Cena de Desafio" do livro está em imagens. No diário fica um aviso no lugar.
- **Guia do Jogador**:
  - "Movendo seu token": tipos de movimento, andar ponto a ponto (Ctrl + clique), saldo por tipo e o tipo preferido no HUD;
  - "Atacando": o Ataque Desarmado.
- O compêndio recria os diários sozinho ao abrir o mundo (versão 5).
- Para as próximas versões do livro: `python3 tools/livro/gerar_diario.py <livro.md> <versão>` gera as páginas de novo a partir do Markdown exportado do Google Docs.

Testes automáticos novos (`28-diario-livro`).
