# Guia da IA — JSON de animações (Automated Animations) para uma criatura

**Só faça isto quando o usuário pedir explicitamente** ("faz também o JSON das animações", "quero as animações automáticas dessa criatura"). Sem pedido, entregue só a ficha, com os nomes seguindo a seção 15 do `guia-criacao-ia.md`, e nada mais.

O resultado é um **arquivo separado** (ex.: `balerion-animacoes.json`) que o Mestre importa no Automated Animations em **Menu Manager → Merge**. Ele **não** vai dentro da ficha.

Arquivos de apoio (todos em `docs/`):
- `aa-modelos-entradas.json`: uma entrada-modelo completa de cada categoria (melee, range, ontoken, templatefx, aura, aefx), já testadas nesta mesa;
- `jb2a-catalogo.md`: resumo das famílias de animação do JB2A, com cores e exemplos;
- `jb2a-caminhos.txt`: **todos** os caminhos que existem (7.814). Todo caminho usado precisa estar nesta lista, **letra por letra**. Nunca invente nem "complete" um caminho de memória;
- `sons-forge.txt`: os sons da mesa (261), cada um com o endereço completo. Todo som usado precisa estar nesta lista;
- `nauren-aa-menu-completo.json`: o menu inteiro do Nauren, para conferir quais rótulos já existem.

## 1. Estrutura do arquivo

```json
{
  "melee": [ ...entradas... ],
  "range": [],
  "ontoken": [],
  "templatefx": [],
  "aura": [],
  "preset": [],
  "aefx": [],
  "version": 5
}
```

As sete listas sempre aparecem, mesmo vazias. `preset` fica sempre vazio. `version` é sempre `5`.

## 2. Cada entrada

Copie **inteira** a entrada-modelo da categoria em `aa-modelos-entradas.json` e troque só:

| Campo | O que pôr |
|---|---|
| `id` | um UUID v4 **novo** para cada entrada (ex.: `3f2b9c1e-8a4d-4f6b-9c2e-1a7d5e8b0c34`); nunca repita |
| `label` | o **nome exato da Ação** na ficha (ou da Condição, em `aefx`) |
| `metaData` | `{ "nauren": true, "criatura": "<nome da criatura>" }` |
| `primary.video.customPath` | o caminho do JB2A, existente em `jb2a-caminhos.txt` |
| `primary.video.enableCustom` | sempre `true` |
| `primary.options` | só as opções da seção 4; o resto fica como no modelo |
| `primary.sound` | `"enable": true`, `"delay": 100`, `"volume": 0.75` e `"file"` com o **endereço completo** de um som de `sons-forge.txt` (seção 5a) |

Não mexa em `secondary`, `source`, `target`, `levels3d`, `macro` nem `soundOnly`: deixe como no modelo (todos desligados). O som vai só em `primary.sound`.

Em `melee`, mantenha `meleeSwitch.options.switchType` em **"off"** (como no modelo): ligado, o módulo troca o golpe por uma flecha quando o alvo está a mais de 2 quadrados, e golpes de alcance de criaturas grandes (garra ou cauda a 3 m) virariam projétil.

## 3. Qual categoria para cada Ação

| A Ação é... | Categoria | Animação (padrão; troque pelo elemento) |
|---|---|---|
| ataque corpo a corpo (`tipoAlcance: "corpoACorpo"`; sem o campo, golpes de alcance até 4,5 m, como garra ou cauda, contam aqui) | `melee` | pela arma natural ou elemento (tabela 5); **sem arma conhecida**: `jb2a.melee_generic.slash.01.orange` |
| ataque à distância (arma de Distância, nome de projétil, alcance ≥ 6 m; magia > 2 m) | `range` | projétil do elemento; arco: flecha; besta: virote; **sem arma conhecida**: `jb2a.bullet.01.orange` |
| área (`usaTemplate`): `circle` | `templatefx` | explosão/círculo do elemento |
| área `cone` | `templatefx` | **sopro** do elemento (sem elemento: `jb2a.breath_weapons.fire.cone.orange.01`) |
| área `ray` (linha) | `templatefx` | linha do elemento; **sopro em linha** só se o nome disser (sopro, baforada, hálito, cuspe) |
| cura (`curas`) | `ontoken` | cura (`jb2a.healing_generic.400px.green`; dourada se sagrada) |
| golpe mágico no alvo sem arma (toque, mordida mágica) | `ontoken` | impacto do elemento no alvo |
| buff, utilidade, transformação, grito | `ontoken` | buff do elemento no próprio token |
| aura ligada pelo raio (Emanação) | `aura` | aura do elemento |
| Condição nova criada para a criatura | `aefx` | marcador da Condição (seção 6) |

Áreas **persistentes** (`usaTemplatePersistente`) também vão em `templatefx`: o Nauren toca a animação no centro e no tamanho da área.

## 4. Opções por categoria (`primary.options`)

- **templatefx**: `"persistent": false`, `"removeTemplate": false`, `"persistType": "sequencerground"`, `"opacity": 1`. Nunca deixe persistente nem com remoção do template: isso cria um tile parado ou apaga a área.
- **ontoken**: `"persistent": false`; `"playOn": "target"` para cura e impacto no alvo; `"playOn": "source"` para buff e utilidade do próprio usuário.
- **aura**: `"size": 3`, `"addTokenWidth": true`, `"opacity": 0.75` (ajuste `size` ao raio da emanação, em quadrados).
- **aefx**: `"persistent": true` só para estados que precisam ser vistos o tempo todo (queimando, congelando, envenenado, sangrando, cego, preso, atordoado, com medo); `"persistent": false` (aviso, toca uma vez) para todo o resto, **marcas incluídas**.
- **Ataque especial** (habilidade forte, diferente do golpe comum): `"tint": true`, `"tintColor": "#d01818"` (ou a cor do elemento) e `"size": 1.2` a `1.3`.

## 5. Escolha da animação: cor natural sempre

A cor segue o **elemento natural**; cor diferente só se a descrição pedir (chama negra, luz dourada).

| Elemento ou arma | Projétil (range) | Área (círculo / cone / linha) | Golpe ou impacto |
|---|---|---|---|
| fogo | `jb2a.fire_bolt.orange` | `jb2a.fireball.explosion.orange` / `jb2a.breath_weapons.fire.cone.orange.01` / `jb2a.breath_weapons.fire.line.orange` | `jb2a.impact.001.orange` |
| gelo | `jb2a.ray_of_frost.blue` | `jb2a.ice_spikes.radial.burst.blue` / `jb2a.cone_of_cold.blue` / `jb2a.template_line.ice.01.blue` | `jb2a.impact_themed.ice_shard.blue` |
| raio, trovão | `jb2a.chain_lightning.primary.blue` | `jb2a.thunderwave.center.blue` / `jb2a.template_cone_5e.001.001.blue` / `jb2a.breath_weapons.lightning.line.blue` | `jb2a.static_electricity.01.blue` |
| veneno, ácido | `jb2a.spell_projectile.poison.greenyellow` | `jb2a.fog_cloud.02.green` / `jb2a.breath_weapons.poison.cone.*` / `jb2a.breath_weapons.acid.line.green` | `jb2a.impact_themed.poison.greenyellow` |
| sagrado, luz | `jb2a.guiding_bolt.01.yellow` | `jb2a.explosion.01.yellow` / `jb2a.template_cone_5e.001.001.orangeyellow` | `jb2a.sacred_flame.target.yellow` |
| sombra, morte | `jb2a.eldritch_blast.dark_purple` | `jb2a.arms_of_hadar.dark_purple` / `jb2a.template_cone_5e.001.001.purplered` | `jb2a.impact.001.dark_purple` |
| natureza | `jb2a.spell_projectile.earth.01.browngreen` | `jb2a.swirling_leaves.complete.01.green` | `jb2a.entangle.green` |
| água | `jb2a.ranged.02.projectile.01.blue` | `jb2a.water_splash.circle.01.blue` / `jb2a.water_splash.cone.01.blue` | `jb2a.water_splash.circle.01.blue` |
| terra, pedra | `jb2a.boulder.toss.02.01.stone.brown` | `jb2a.ground_cracks.*` | `jb2a.impact.004.orange` |
| arcano, estelar | `jb2a.magic_missile.purple` | `jb2a.explosion.02.purple` | `jb2a.impact.001.pinkpurple` |
| sangue, fúria | `jb2a.bolt.physical.red` | `jb2a.shatter.dark_red` | `jb2a.impact.001.dark_red` |
| garra | — | — | `jb2a.melee_generic.creature_attack.claw.001.red` (verde: veneno; roxa: sombra) |
| mordida | — | — | `jb2a.bite.400px.red` |
| soco, chute | — | — | `jb2a.melee_generic.creature_attack.fist.001.yellow` |
| pinça | — | — | `jb2a.melee_generic.creature_attack.pincer.001.red` |
| giro, rodopio | — | — | `jb2a.melee_generic.whirlwind.01.orange` |
| corte longo | — | — | `jb2a.melee_generic.slash.02.001.orange` |
| estocada / esmagar | — | — | `jb2a.melee_generic.piercing.one_handed` / `jb2a.melee_generic.bludgeoning.two_handed` |
| espada, machado, martelo, lança, adaga | — | — | `jb2a.<arma>.melee.*` no aço (`white`/`standard`) ou na cor do elemento (`fire.<cor>`) |
| arco / besta / arma de fogo | `jb2a.arrow.physical.white.02` / `jb2a.bolt.physical.orange` / `jb2a.bullet.01.orange` | — | — |

**Sopros por elemento** (cone / linha): fogo `jb2a.breath_weapons.fire.cone.orange.01` / `jb2a.breath_weapons.fire.line.orange`; gelo `jb2a.breath_weapons.cold.cone.blue` / `jb2a.breath_weapons02.burst.line.ice.01`; veneno e natureza `jb2a.breath_weapons.poison.cone.green` / `jb2a.breath_weapons.acid.line.green`; raio `jb2a.breath_weapons.fire.cone.blue.01` / `jb2a.breath_weapons.lightning.line.blue`; sagrado `jb2a.breath_weapons02.burst.cone.holy.yellow` / `jb2a.breath_weapons02.burst.line.holy.yellow`; sombra `jb2a.breath_weapons02.burst.cone.arcana.dark_black` / `jb2a.breath_weapons02.burst.line.arcana.dark_black`; arcano `jb2a.breath_weapons02.burst.cone.arcana.purple` / `jb2a.breath_weapons02.burst.line.arcana.purple`; sangue `jb2a.breath_weapons.poison.cone.red`. Confirme o sufixo exato (`.01`, `.02`) em `jb2a-caminhos.txt`.

Caminhos com `*` são famílias: escolha um caminho completo dela em `jb2a-caminhos.txt`. Para qualquer outro efeito, procure a família em `jb2a-catalogo.md` e confirme o caminho completo na lista.

## 5a. Som

Cada entrada leva um som de `sons-forge.txt`, copiado **com o endereço completo** (a parte depois do `|`). Escolha pelo tipo:

| Ação ou Condição | Sons |
|---|---|
| corte, garra | `Cortante 1` a `4` |
| estocada, flecha, virote, tiro | `Perfurante 1` a `3` |
| soco, esmagar, martelo | `Contundente 1` a `4` |
| fogo | `Bola de Fogo 1` a `4`, `Raio de Fogo 1` e `2`, `Breath Fogo` |
| gelo, água | `Gelo 1` a `5`, `Raio de Gelo 1` e `2`, `Cone de Gelo 1` a `4`, `Breath Gelo 1` e `2` |
| raio, trovão | `Relâmpago`, `Chamar Relâmpagos`, `Elétrico 3` e `4`, `Elétrico Menor`, `Trovejante 1` a `6` |
| veneno, ácido | `Veneno 1` a `9`, `Breath Veneno`, `Breath Ácido 1` e `2`, `Impacto Ácido Maior`/`Menor` |
| sombra, morte | `Necrótico 1` a `11` |
| mente, medo, encanto | `Psíquico 1` a `12` |
| sagrado, luz | `Radiante 1` a `12` |
| arcano | `Força - Mísseis Mágicos 1` a `3`, `Força - Rajada Mística`, `Força - Desintegrar 1` a `3` |
| cura | `Cura 1` a `7` |
| buff, proteção | `Buff - Escudo da Fé`, `Buff 2` a `11` |
| maldição, debuff | `Debuff 1` a `10` |
| preparar, carregar (antes do golpe) | os da pasta `Preparando/` |
| teleporte, salto | `Spells/Spell_Impact_Utility_DimensionDoor 1` |

Sem som que combine: `Impacto Genérico`.

## 6. Condições novas (`aefx`)

Só para Condições **criadas para esta criatura** (as do sistema já têm animação no menu do Nauren). O `label` é o nome exato da Condição. Marcadores úteis:
- queimando: `jb2a.flames.01.orange`; congelando: `jb2a.markers.snowflake.blue.01`; veneno: `jb2a.markers.poison.dark_green.01`; sangramento: `jb2a.markers.drop.red.01`;
- medo: `jb2a.markers.fear.dark_purple.01`; atordoado: `jb2a.dizzy_stars.200px.yellow`; preso: `jb2a.markers.chain.standard.complete.02.grey`;
- marca: `jb2a.hunters_mark.loop.01.red` (aviso); buff: `jb2a.condition.boon.01.001.<blue|green|red|yellow>`; maldição: `jb2a.condition.curse.01.001.<blue|green|purple|red>`.

## 7. Cuidados com os nomes (rótulos)

- O Nauren procura a animação pelo **nome da Ação** e depois pelo **nome do item**, por **parte do nome**: um rótulo "Garra" pegaria qualquer Ação com "Garra" no nome. Use sempre o **nome completo** da Ação como rótulo.
- **Não repita rótulos do menu do Nauren** (as habilidades de classe, magias e Condições do sistema já têm entrada). Se a criatura tiver uma Ação com nome igual a uma do sistema ("Investida", "Mordida"), **renomeie a Ação na ficha** para algo próprio ("Investida do Javali Ferro") e use esse nome no JSON.
- Nada de rótulos genéricos ("Ataque", "Golpe", "Usar").
- O Merge **acrescenta** entradas: importar o mesmo arquivo duas vezes duplica. Para corrigir uma criatura já importada, o Mestre apaga as entradas dela no menu antes de importar a versão nova.

## 8. Exemplo (campos que mudam em relação ao modelo)

Criatura "Salamandra de Brasa": "Mordida Incandescente" (corpo a corpo), "Cuspe de Magma" (alcance 9 m), "Onda de Calor" (área em cone):

```text
melee      | label "Mordida Incandescente" | customPath "jb2a.bite.400px.orange"
range      | label "Cuspe de Magma"        | customPath "jb2a.fire_bolt.orange"
templatefx | label "Onda de Calor"         | customPath "jb2a.breath_weapons.fire.cone.orange.01"
           | options: persistent false, removeTemplate false, persistType "sequencerground", opacity 1
```

Cada linha vira uma entrada completa (modelo copiado, com `id` novo, `metaData` com a criatura e as opções da seção 4).

## 9. Checklist antes de entregar

- [ ] O usuário pediu o JSON de animações (senão, não gere).
- [ ] As sete listas e `"version": 5` estão no arquivo.
- [ ] Cada `label` é o nome **exato** de uma Ação (ou Condição nova) da ficha entregue, específico e diferente dos nomes do sistema.
- [ ] Cada `customPath` existe em `jb2a-caminhos.txt`, letra por letra.
- [ ] Cada `primary.sound.file` é um endereço completo de `sons-forge.txt`.
- [ ] Todo `id` é um UUID v4 novo e único.
- [ ] `templatefx` sem persistência e sem remover template; `aefx` contínuo só para os estados da seção 4.
- [ ] Cores naturais; sem arma conhecida, corte genérico laranja (corpo a corpo) e tiro (distância).
- [ ] Entregue como arquivo separado, com a instrução: **Automated Animations → Menu Manager → Merge**.
