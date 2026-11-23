#!/usr/bin/env python3
"""Gera docs/exemplos/ficha-de-testes.json: um NPC com quase todo tipo de Ação (armas, magias,
habilidades, consumível), cada uma com animação e som próprios (0.123), e um Boneco de Treino.
Confere ícones, caminhos do JB2A e sons contra as listas da mesa antes de gravar.
Uso: python3 tools/exemplos/gerar_ficha_testes.py
"""
import json, os, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def linhas(p): return {l.strip() for l in open(os.path.join(RAIZ, p), encoding="utf-8") if l.strip() and not l.startswith("#")}
ICONES = linhas("docs/criacao-ia/icones-foundry.txt")
JB2A = linhas("docs/animacoes-ia/jb2a-caminhos.txt")
SONS = {}
for l in open(os.path.join(RAIZ, "docs/animacoes/sons-forge.txt"), encoding="utf-8"):
    if "|" in l:
        nome, url = [x.strip() for x in l.split("|", 1)]
        SONS[nome.rsplit(".", 1)[0]] = url
erros = []
def ic(p):
    if p not in ICONES: erros.append(f"ícone: {p}")
    return p
def som(n):
    if not n: return ""
    if n not in SONS: erros.append(f"som: {n}"); return ""
    return SONS[n]
def anim(tipo, a="", impacto="", s="", si="", escala=1, noErro=True, porBaixo=False, atraso=0, volume=0.8):
    for x in (a, impacto):
        if x and x not in JB2A: erros.append(f"jb2a: {x}")
    return {"modo": "propria", "tipo": tipo, "anim": a, "impacto": impacto, "escala": escala, "noErro": noErro, "porBaixo": porBaixo,
            "som": som(s), "somVolume": volume, "somAtraso": atraso, "somImpacto": som(si)}

def acao(nome, **k):
    base = {"nome": nome, "custoEstamina": 0, "custoMana": 0, "alcance": "1m", "modoAlvo": "selecionado", "modoAlvoTravado": True, "danos": [], "curas": [], "condicoesAplicadas": []}
    base.update(k)
    return base
def dano(f): return [{"formula": f, "aplicarNoAlvo": True}]
def cond(nome, acum=1, **k): return {"uuid": f"self:{nome}", "acumulos": acum, "ativo": True, "soSeAcertar": True, **k}
def item(nome, tipo, img, desc, acoes=None, **sistema):
    s = {"descricao": f"<p>{desc}</p>", **sistema}
    if acoes is not None: s["acoes"] = acoes
    return {"name": nome, "type": tipo, "img": ic(img), "system": s}

itens = [
    # ---------------- Pigmentos (obrigatórios) ----------------
    {"name": "Pigmento Vermelho", "type": "cor", "img": "icons/svg/ice-aura.svg", "system": {"corHex": "#c24b4b", "descricao": "<p>Pigmento de teste.</p>"}},
    {"name": "Pigmento Azul", "type": "cor", "img": "icons/svg/ice-aura.svg", "system": {"corHex": "#3f6fd1", "descricao": "<p>Pigmento de teste.</p>"}},

    # ---------------- Condições modelo (self:) ----------------
    {"name": "Fúria de Teste", "type": "condicao", "img": ic("icons/magic/control/buff-strength-muscle-damage-orange.webp"),
     "system": {"ativo": False, "duracaoRodadas": 2, "modificadores": [{"campo": "poderAtaque", "valor": "2"}, {"campo": "danoBonus", "valor": "1"}],
                "descricao": "<p>+2 Poder de Ataque e +1 de dano por 2 rodadas.</p>"},
     "flags": {"nauren": {"modelo": True}}},
    {"name": "Enraizado de Teste", "type": "condicao", "img": ic("icons/magic/nature/root-vine-entangle-foot-green.webp"),
     "system": {"ativo": False, "duracaoRodadas": 1, "modificadores": [{"campo": "movimento", "valor": "=0"}],
                "descricao": "<p>Movimento 0 por 1 rodada.</p>"},
     "flags": {"nauren": {"modelo": True}}},

    # ---------------- ARMAS ----------------
    item("Espada Longa de Teste", "arma", "icons/weapons/swords/sword-guard-steel-green.webp",
         "Corpo a corpo: golpe simples, golpe pesado com crítico mais fácil, e corte que faz sangrar.", equipado=True, acoes=[
        acao("Golpe", custoEstamina=1, ehAtaque=True, atributoAtaque="poderAtaque", tipoAlcance="corpoACorpo", danos=dano("1d8+@poderAtaque"),
             animacao=anim("corpo", "jb2a.melee_generic.slash.02.001.orange", s="Cortante 1")),
        acao("Golpe Pesado (crítico 18+)", custoEstamina=2, ehAtaque=True, atributoAtaque="poderAtaque", tipoAlcance="corpoACorpo", critMinAjuste="-2",
             danos=dano("2d8+@poderAtaque"), animacao=anim("corpo", "jb2a.greatsword.melee.standard.white", impacto="jb2a.impact.ground_crack.orange.01", s="Contundente 2", escala=1.5)),
        acao("Corte Sangrento", custoEstamina=2, ehAtaque=True, atributoAtaque="poderAtaque", tipoAlcance="corpoACorpo", danos=dano("1d6+@poderAtaque"),
             condicoesAplicadas=[cond("Sangramento", 2)], animacao=anim("corpo", "jb2a.sword.melee.fire.orange", s="Cortante 2")),
    ]),
    item("Arco Longo de Teste", "arma", "icons/weapons/bows/longbow-recurve-leather-brown.webp",
         "À distância: tiro com munição própria (10), rajada de 3 tiros e flecha que empurra 2 m.", equipado=True, acoes=[
        acao("Tiro", custoEstamina=1, alcance="20m", ehAtaque=True, atributoAtaque="poderAtaque", tipoAlcance="distancia", danos=dano("1d8+@poderAtaque"),
             usaCargas=True, cargasAtual=10, cargasMax=10, consumirCargaAoUsar=True,
             animacao=anim("projetil", "jb2a.arrow.physical.white.02", s="Perfurante 1", si="Perfurante 2", atraso=0)),
        acao("Rajada (3 ataques)", custoEstamina=3, alcance="20m", ehAtaque=True, atributoAtaque="poderAtaque", tipoAlcance="distancia",
             usaMultiplosAtaques=True, quantidadeAtaques="3", danos=dano("1d6+@poderAtaque"),
             animacao=anim("projetil", "jb2a.arrow.physical.white.02", s="Perfurante 2")),
        acao("Flecha de Impacto (empurra 2 m)", custoEstamina=2, alcance="20m", ehAtaque=True, atributoAtaque="poderAtaque", tipoAlcance="distancia",
             danos=dano("1d6+@poderAtaque"), usaEmpurrar=True, empurrarMetros="2",
             animacao=anim("projetil", "jb2a.arrow.physical.white.02", impacto="jb2a.impact.001.orange", s="Perfurante 1", si="Contundente 1")),
    ]),

    # ---------------- MAGIAS ----------------
    item("Raio de Fogo", "magia", "icons/magic/fire/projectile-fireball-smoke-orange.webp", "Projétil de fogo: dano e Queimando no acerto.", acoes=[
        acao("Raio de Fogo", custoMana=2, alcance="18m", ehAtaque=True, atributoAtaque="poderMagia", danos=dano("2d6+@poderMagia"), condicoesAplicadas=[cond("Queimando")],
             animacao=anim("projetil", "jb2a.fire_bolt.orange", impacto="jb2a.impact.001.orange", s="Raio de Fogo 1", si="Bola de Fogo 2")),
    ]),
    item("Bola de Fogo", "magia", "icons/magic/fire/explosion-fireball-large-orange.webp", "Área circular de 3 m: todos dentro sofrem dano (um dado para todos).", acoes=[
        acao("Bola de Fogo", custoMana=4, alcance="18m", modoAlvo="area", usaTemplate=True, templateTipo="circle", templateTamanho=3, templateCor="#e8742a",
             ehAtaque=True, atributoAtaque="poderMagia", danos=dano("3d6+@poderMagia"),
             animacao=anim("area", "jb2a.fireball.explosion.orange", s="Bola de Fogo 1")),
    ]),
    item("Cone de Gelo", "magia", "icons/magic/air/wind-weather-snow-gusts.webp", "Cone de 6 m: dano e 1 acúmulo de Congelando.", acoes=[
        acao("Cone de Gelo", custoMana=3, alcance="0m", modoAlvo="area", usaTemplate=True, templateTipo="cone", templateTamanho=6, templateCor="#7fc8ff",
             ehAtaque=True, atributoAtaque="poderMagia", danos=dano("2d6+@poderMagia"), condicoesAplicadas=[cond("Congelando")],
             animacao=anim("area", "jb2a.cone_of_cold.blue", s="Gelo 1")),
    ]),
    item("Relâmpago em Linha", "magia", "icons/magic/lightning/bolt-strike-blue.webp", "Linha de 12 m: dano em todos na linha.", acoes=[
        acao("Relâmpago", custoMana=3, alcance="0m", modoAlvo="area", usaTemplate=True, templateTipo="ray", templateTamanho=12, templateCor="#9ad0ff",
             ehAtaque=True, atributoAtaque="poderMagia", danos=dano("2d8+@poderMagia"),
             animacao=anim("area", "jb2a.breath_weapons.lightning.line.blue", s="Relâmpago")),
    ]),
    item("Mísseis Arcanos", "magia", "icons/magic/fire/projectiles-salvo-trio-orange.webp", "3 projéteis, cada um com o próprio teste de ataque.", acoes=[
        acao("Mísseis Arcanos", custoMana=2, alcance="18m", ehAtaque=True, atributoAtaque="poderMagia", usaMultiplosAtaques=True, quantidadeAtaques="3",
             danos=dano("1d4+1"), animacao=anim("projetil", "jb2a.magic_missile.purple", s="Força - Mísseis Mágicos 1")),
    ]),
    item("Toque Vampírico", "magia", "icons/magic/unholy/beam-ringed-impact-purple.webp", "Dano necrótico e rouba 3 de Vida do alvo.", acoes=[
        acao("Toque Vampírico", custoMana=2, alcance="9m", ehAtaque=True, atributoAtaque="poderMagia", danos=dano("1d8+@poderMagia"),
             usaRoubarRecurso=True, roubarRecursoTipo="vida", roubarQuantidade="3",
             animacao=anim("projetil", "jb2a.chain_lightning.primary.blue", impacto="jb2a.impact.001.orange", s="Necrótico 1", si="Necrótico 2")),
    ]),
    item("Cura de Teste", "magia", "icons/magic/life/heart-cross-green.webp", "Cura um alvo marcado (marque você mesmo para se curar).", acoes=[
        acao("Curar", custoMana=2, alcance="9m", curas=[{"formula": "2d6+@poderMagia", "aplicarNoAlvo": True}],
             animacao=anim("alvo", "jb2a.healing_generic.burst.greenorange", s="Cura 1")),
        acao("Cura em Área (3 m)", custoMana=4, alcance="9m", modoAlvo="area", usaTemplate=True, templateTipo="circle", templateTamanho=3, templateCor="#6fd18a",
             areaDisposicao="aliados", curas=[{"formula": "1d8+@poderMagia", "aplicarNoAlvo": True}],
             animacao=anim("area", "jb2a.cure_wounds.400px.blue", s="Cura 2", porBaixo=True)),
    ]),
    item("Escudo Arcano", "magia", "icons/magic/defensive/shield-barrier-blue.webp", "Ganha um Escudo de 10 até o próximo turno.", acoes=[
        acao("Escudo Arcano", custoMana=2, alcance="0m", modoAlvo="nenhum", usaEscudo=True, escudoFormula="10", escudoDuracao="proximoTurno",
             animacao=anim("usuario", "jb2a.shield.01.complete.01.blue", s="Buff 2 - Escudo da Fé", escala=1.6)),
    ]),
    item("Campo de Espinhos", "magia", "icons/magic/nature/root-vine-entangle-foot-green.webp",
         "Área persistente de 2 m por 3 rodadas: 1d6 no início do turno de quem estiver dentro e Enraizado ao entrar.", acoes=[
        acao("Campo de Espinhos", custoMana=3, alcance="12m", modoAlvo="area", usaTemplate=True, templateTipo="circle", templateTamanho=2, templateCor="#3f8f3a",
             usaTemplatePersistente=True, templatePersistenteDuracaoRodadas="3", templatePersistenteEventoPeriodico="inicioTurno", templatePersistenteAoEntrar=True,
             templatePersistenteDisposicao="inimigos", templatePersistenteEfeito="dano", templatePersistenteQuantidade="1d6",
             templatePersistenteCondicaoUuid="self:Enraizado de Teste", templatePersistenteCondicaoAcumulos="1",
             animacao=anim("area", "jb2a.entangle.green", s="Veneno 1", porBaixo=True)),
    ]),
    item("Palavra do Medo", "magia", "icons/magic/control/fear-fright-monster-purple-blue.webp",
         "Sem dano: o alvo fica Amedrontado (pode gastar 2 Estamina para evitar).", acoes=[
        acao("Palavra do Medo", custoMana=1, alcance="9m",
             condicoesAplicadas=[cond("Amedrontado", soSeAcertar=False, perguntarParaEvitar=True, custoParaEvitarRecurso="estamina", custoParaEvitarQuantidade="2")],
             animacao=anim("alvo", "jb2a.icon.fear.dark_purple", s="Psíquico 1", escala=1.2)),
    ]),
    item("Passo Nebuloso", "magia", "icons/magic/movement/portal-vortex-orange.webp", "Teleporta você até 6 m.", acoes=[
        acao("Passo Nebuloso", custoMana=1, alcance="0m", modoAlvo="nenhum", usaMoverEscolhendo=True, moverQuem="eu", moverMetros="6", moverTeleporte=True, moverMomento="depois",
             animacao=anim("usuario", "jb2a.misty_step.01.blue", s="Spells/Spell_Impact_Utility_DimensionDoor 1", escala=1.5)),
    ]),

    # ---------------- HABILIDADES ----------------
    item("Fúria (buff em mim)", "habilidade", "icons/magic/control/buff-strength-muscle-damage-orange.webp", "Aplica Fúria de Teste em você.", ativo=True, acoes=[
        acao("Entrar em Fúria", custoEstamina=1, alcance="0m", modoAlvo="nenhum", condicaoEmMimUuid="self:Fúria de Teste", condicaoEmMimAcumulos="1",
             animacao=anim("usuario", "jb2a.bless.400px.intro.yellow", s="Buff 5 - Bless", escala=1.4)),
    ]),
    item("Garra Venenosa", "habilidade", "icons/creatures/claws/claw-hooked-curved.webp",
         "Ataque de monstro: dano, Envenenamento (2) e drena 1 Estamina do alvo. No erro ainda causa 2.", ativo=True, acoes=[
        acao("Garra Venenosa", custoEstamina=2, ehAtaque=True, atributoAtaque="poderAtaque", tipoAlcance="corpoACorpo", danos=dano("1d10+@poderAtaque"),
             danoNoErroFormula="2", condicoesAplicadas=[cond("Envenenamento", 2)],
             gastosRecurso=[{"recurso": "estamina", "quantidade": "1", "ativo": True, "soSeAcertar": True}],
             animacao=anim("corpo", "jb2a.melee_generic.creature_attack.claw.001.red", impacto="jb2a.impact_themed.poison.greenyellow", s="Cortante 1", si="Veneno 1")),
        acao("Derrubada Brutal", custoEstamina=2, ehAtaque=True, atributoAtaque="poderAtaque", tipoAlcance="corpoACorpo", danos=dano("1d6+@poderAtaque"),
             condicoesAplicadas=[cond("Caído")], animacao=anim("corpo", "jb2a.melee_generic.creature_attack.claw.001.red", impacto="jb2a.impact.ground_crack.orange.01", s="Contundente 1")),
    ]),
    item("Golpes de Comparação", "habilidade", "icons/skills/melee/strike-sword-steel-yellow.webp",
         "Mesmo golpe três vezes, para comparar: Automático (Automated Animations pelo nome), Nenhuma e Própria.", ativo=True, acoes=[
        acao("Golpe Automático", custoEstamina=1, ehAtaque=True, atributoAtaque="poderAtaque", tipoAlcance="corpoACorpo", danos=dano("1d6+@poderAtaque"),
             animacao={"modo": "auto"}),
        acao("Golpe Sem Animação", custoEstamina=1, ehAtaque=True, atributoAtaque="poderAtaque", tipoAlcance="corpoACorpo", danos=dano("1d6+@poderAtaque"),
             animacao={"modo": "nenhuma"}),
        acao("Golpe Só Som (sem animação)", custoEstamina=1, ehAtaque=True, atributoAtaque="poderAtaque", tipoAlcance="corpoACorpo", danos=dano("1d6+@poderAtaque"),
             animacao=anim("corpo", "", s="Impacto Genérico")),
        acao("Golpe Que Some no Erro", custoEstamina=1, ehAtaque=True, atributoAtaque="poderAtaque", tipoAlcance="corpoACorpo", danos=dano("1d6+@poderAtaque"),
             animacao=anim("corpo", "jb2a.melee_generic.slash.02.001.orange", impacto="jb2a.impact.001.orange", s="Cortante 2", noErro=False)),
    ]),
    item("Ataque em Vários Alvos", "habilidade", "icons/skills/ranged/arrows-flying-salvo-blue.webp",
         "Até 3 alvos marcados, um teste para cada: veja o projétil acertar uns e passar do lado de outros.", ativo=True, acoes=[
        acao("Chuva de Raios (3 alvos)", custoEstamina=2, alcance="18m", ehAtaque=True, atributoAtaque="poderMagia", numeroAlvos=3, danos=dano("1d6+@poderMagia"),
             animacao=anim("projetil", "jb2a.chain_lightning.primary.blue", impacto="jb2a.static_electricity.01.blue", s="Trovejante 1")),
    ]),

    # ---------------- CONSUMÍVEL ----------------
    item("Poção de Cura de Teste", "consumivel", "icons/consumables/potions/potion-tube-corked-red.webp",
         "Bebe e cura 2d4+2 (marque você mesmo como alvo).", quantidade=5, quantidadeMax=5, efeito="Cura 2d4+2 PV", acoes=[
        acao("Beber", alcance="1m", curas=[{"formula": "2d4+2", "aplicarNoAlvo": True}],
             animacao=anim("alvo", "jb2a.healing_generic.200px.green", s="Cura 2")),
    ]),
]

testador = {
    "name": "Ficha de Testes (Animações)", "type": "npc", "img": ic("icons/svg/mystery-man.svg"), "pasta": "Testes",
    "system": {
        "nivel": 5, "categoriaMonstro": 1,
        "atributos": {"forca": {"value": 5}, "agilidade": {"value": 5}, "estamina": {"value": 5}, "inteligencia": {"value": 5}, "destino": {"value": 3}},
        "defesa": 12, "movimento": 6,
        "calculoVida": "customizado", "vidaFormula": "200", "calculoMana": "customizado", "manaFormula": "100",
        "calculoEstaminaCombate": "customizado", "estaminaCombateFormula": "60", "calculoDadosDestino": "customizado", "dadosDestinoFormula": "5",
        "vida": {"value": 200, "max": 200}, "mana": {"value": 100, "max": 100}, "estaminaCombate": {"value": 60, "max": 60}, "dadosDestino": {"value": 5, "max": 5},
        "notas": "<h2>Como testar</h2><p>Ponha esta ficha e 2 ou 3 Bonecos de Treino no mapa. Selecione o token desta ficha, marque alvos com T e use as Ações. "
                 "Cada Ação já vem com animação e som próprios (bloco <b>Animação e som</b> na ficha de cada item).</p>"
                 "<ul><li>Armas: corpo a corpo, à distância com munição, rajada, empurrão.</li><li>Magias: projétil, círculo, cone, linha, mísseis, roubo de Vida, cura (alvo e área), escudo, área persistente, medo, teleporte.</li>"
                 "<li>Habilidades: buff em mim, garra com veneno e dreno, derrubar, golpes de comparação (auto / nenhuma / só som / some no erro) e vários alvos.</li><li>Consumível: poção.</li></ul>"
                 "<p>Recursos altos de propósito (Vida 200, Mana 100, Estamina 60) para repetir à vontade.</p>"
    },
    "items": itens
}
boneco = {
    "name": "Boneco de Treino", "type": "npc", "img": ic("icons/svg/target.svg"), "pasta": "Testes",
    "system": {
        "nivel": 1, "categoriaMonstro": 1,
        "atributos": {"forca": {"value": 1}, "agilidade": {"value": 1}, "estamina": {"value": 3}, "inteligencia": {"value": 1}, "destino": {"value": 1}},
        "defesa": 10, "movimento": 6,
        "calculoVida": "customizado", "vidaFormula": "999", "calculoEstaminaCombate": "customizado", "estaminaCombateFormula": "30",
        "vida": {"value": 999, "max": 999}, "mana": {"value": 2, "max": 2}, "estaminaCombate": {"value": 30, "max": 30}, "dadosDestino": {"value": 1, "max": 1},
        "notas": "<p>Alvo de treino: Defesa 10 (alguns ataques erram, para ver a animação de erro), Vida 999.</p>"
    },
    "items": [
        {"name": "Pigmento Cinza", "type": "cor", "img": "icons/svg/ice-aura.svg", "system": {"corHex": "#888888", "descricao": "<p>Pigmento de teste.</p>"}},
        {"name": "Pigmento Branco", "type": "cor", "img": "icons/svg/ice-aura.svg", "system": {"corHex": "#eeeeee", "descricao": "<p>Pigmento de teste.</p>"}},
    ]
}
for d in (testador, boneco):
    if d["img"] not in ICONES: erros.append(f"ícone: {d['img']}")
if erros:
    print("ERROS:\n" + "\n".join(sorted(set(erros)))); sys.exit(1)
lote = {"pasta": "Testes de Animação", "documentos": [testador, boneco]}
saida = os.path.join(RAIZ, "docs/exemplos/ficha-de-testes.json")
json.dump(lote, open(saida, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
n = sum(len(i["system"].get("acoes", [])) for i in itens)
print(f"ok: {saida} ({len(itens)} itens, {n} Ações)")
