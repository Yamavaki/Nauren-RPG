# Documentação do Nauren RPG (sistema para Foundry VTT)

Os arquivos estão separados em pastas pelo uso. Nenhum deles é lido pelo sistema durante o jogo: são guias para ler, anexar numa conversa com IA ou importar em outro módulo.

## Para jogar e mestrar — `jogar/` e `animacoes/`
| Arquivo | O que é |
|---|---|
| [`jogar/hud-combate.md`](jogar/hud-combate.md) | O painel de Ações embaixo da tela: quando aparece, atalhos e o que cada botão faz. |
| [`jogar/reacao-em-dois-passos.md`](jogar/reacao-em-dois-passos.md) | Como a reação a um ataque funciona no sistema (reagir e depois resolver). |
| [`animacoes/animacoes.md`](animacoes/animacoes.md) | Como ligar o Automated Animations, o Sequencer e o JB2A, e quais nomes cadastrar. |
| [`animacoes/nauren-aa-menu-completo.json`](animacoes/nauren-aa-menu-completo.json) | O menu completo de animações e sons do Nauren, para importar no Automated Animations. |
| [`animacoes/nauren-aa-novas-0.94.27.json`](animacoes/nauren-aa-novas-0.94.27.json) | Só as animações novas desde a 0.92.2 (importar com Merge). |
| [`animacoes/sons-forge.txt`](animacoes/sons-forge.txt) | Os sons da mesa, com o endereço completo de cada um. |

## Para criar fichas e animações com IA — `criacao-ia/` e `animacoes-ia/`
| Arquivo | O que é |
|---|---|
| [`criacao-ia/guia-criacao-ia.md`](criacao-ia/guia-criacao-ia.md) | Guia completo do formato das fichas (JSON) para uma IA criar criaturas, itens e habilidades. |
| [`criacao-ia/prompt-criacao-criatura.md`](criacao-ia/prompt-criacao-criatura.md) | Prompt pronto para criar uma criatura, com a tabela de valores por nível. |
| [`criacao-ia/modelo-ficha-codex.xlsx`](criacao-ia/modelo-ficha-codex.xlsx) | Modelo da ficha em planilha (Códex), com exemplos e instruções para IA. |
| [`criacao-ia/icones-foundry.txt`](criacao-ia/icones-foundry.txt) | Lista de todos os ícones do Foundry; a IA só pode usar caminhos que estejam aqui. |
| [`animacoes-ia/guia-animacoes-ia.md`](animacoes-ia/guia-animacoes-ia.md) | Guia para a IA montar o JSON de animações de uma criatura (Automated Animations). |
| [`animacoes-ia/aa-modelos-entradas.json`](animacoes-ia/aa-modelos-entradas.json) | Modelos de entrada do Automated Animations usados pelo guia acima. |
| [`animacoes-ia/jb2a-catalogo.md`](animacoes-ia/jb2a-catalogo.md) | Resumo das animações do JB2A, com cores e exemplos. |
| [`animacoes-ia/jb2a-caminhos.txt`](animacoes-ia/jb2a-caminhos.txt) | Todos os caminhos do JB2A; todo caminho usado no JSON de animações precisa existir aqui. |

## Torre Infinita — `torre-infinita/`
| Arquivo | O que é |
|---|---|
| [`torre-infinita/catalogo-torre-infinita.json`](torre-infinita/catalogo-torre-infinita.json) | Catálogo dos itens da Torre Infinita (chaves, tiers, pigmentos). |

## Exemplos para importar — `exemplos/`
| Arquivo | O que é |
|---|---|
| [`exemplos/lote-exemplo.json`](exemplos/lote-exemplo.json) | Exemplo de lote para o botão **Importar em massa** (atores e itens, com pastas). |
| [`exemplos/escritos-exemplo.json`](exemplos/escritos-exemplo.json) | Exemplo de Escritos (nota, carta, livro) para importar pela aba Itens. |

## Notas de versão — `notas-de-versao/`
| Arquivo | O que é |
|---|---|
| [`notas-de-versao/organizador-0.109.md`](notas-de-versao/organizador-0.109.md) | Organizador das listas (selecionar vários, mover, Lixeira, dono na lista). |
| [`notas-de-versao/rebalanceamento-0.108.md`](notas-de-versao/rebalanceamento-0.108.md) | Vida e dano dos inimigos (0.108). |
| [`notas-de-versao/andares-0.108.2.md`](notas-de-versao/andares-0.108.2.md) | Suporte a cenas com andares: áreas, alvos, distâncias e efeitos. |
| [`notas-de-versao/andares-molduras-0.108.1.md`](notas-de-versao/andares-molduras-0.108.1.md) | Molduras de token em cenas com andares. |
| [`notas-de-versao/importar-massa-0.107.md`](notas-de-versao/importar-massa-0.107.md) | Importar em massa (atores, itens e Escritos em JSON). |
| [`notas-de-versao/correcoes-0.107.2.md`](notas-de-versao/correcoes-0.107.2.md) | Correções da 0.107.2. |
