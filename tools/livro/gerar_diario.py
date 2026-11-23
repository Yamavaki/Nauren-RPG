#!/usr/bin/env python3
"""Gera o diário "Nauren — Regras do Livro" a partir do livro exportado em Markdown.

Uso:  python3 tools/livro/gerar_diario.py <livro.md> <versão>   (ex.: 0.9.1)
Saída: data/livro-regras.mjs (NAUREN_LIVRO_VERSAO e NAUREN_LIVRO_PAGINAS).

O texto do livro entra inteiro (sem resumo). As páginas são cortadas pelos títulos dos capítulos e das
classes; se o livro mudar a ordem ou o nome de um capítulo, ajuste PAGINAS abaixo.
"""
import json, re, sys, unicodedata
import markdown

PAGINAS = [  # (nome da página, regex do título onde ela começa)
    ("Introdução: o mundo e os dados", r"O manifesto"),
    ("I — Como Jogar", r"Cap[ií]tulo I\s*[-—–]"),
    ("II — Criação de Personagem", r"Cap[ií]tulo II\s*[-—–]"),
    ("III — Combate: Estrutura e Prioridade", r"Cap[ií]tulo III\s*[-—–]"),
    ("III — Combate: Ações, Movimento e Estresse", r"^As A[çc][õo]es$"),
    ("III.1 — Cena de Desafio e Níveis", r"Cap[ií]tulo III\.\s*1"),
    ("IV — Classes e Subclasses", r"Cap[ií]tulo IV\s*[-—–]"),
    ("Classe — Druida", r"^O Druida$"),
    ("Classe — Guerreiro", r"^O Guerreiro$"),
    ("Classe — Ladino", r"^Ladino$"),
    ("Classe — Místico", r"^M[ií]stico$"),
    ("Classe — Caçador", r"^Ca[çc]ador$"),
    ("Classe — Mago", r"^Mago$"),
    ("Classe — Sacerdote", r"^Sacerdote$"),
    ("Classe — Empíreo", r"^Emp[ií]reo$"),
    ("Classe — Inventor", r"^Inventor$"),
    ("A Magia e Duas Armas", r"^A Magia$"),
    ("V — Condições", r"Cap[ií]tulo V\s*[-—–]"),
    ("VI e VII — Equipamentos", r"Cap[ií]tulo VI\s*[-—–]"),
    ("Venenos e Itens Especiais", r"^Venenos$"),
    ("Regras Gerais", r"^Regras Gerais$"),
    ("VIII — Profissões", r"Cap[ií]tulo VIII\s*[-—–]"),
]
# Seções que o próprio livro marca como de saída: não entram.
PULAR = [r"\(removido em breve\)"]
# Títulos com marcas de rascunho: o texto de dentro fica, o título é limpo.
LIMPAR_TITULO = [(r"\s*Nova regra que entra em Teste \(\d+/\d+\)", "")]


def titulo_limpo(linha):
    t = re.sub(r"^#+\s*", "", linha).strip()
    t = re.sub(r"[*_]", "", t).strip()
    return t


def preparar(linhas):
    """Arruma o Markdown exportado do Google Docs: títulos longos, tabs, imagens soltas."""
    saida = []
    for ln in linhas:
        ln = ln.rstrip("\n").replace("\t", "")
        m = re.match(r"^(#{1,6})\s*(.*)$", ln)
        if m:
            nivel, txt = len(m.group(1)), m.group(2).strip()
            for a, b in LIMPAR_TITULO:
                txt = re.sub(a, b, txt)
            b = re.match(r"^(\*\*[^*]+\*\*(?:\s*\*\*[^*]+\*\*)?)\s*(.*)$", txt)
            if b and b.group(2) and len(b.group(2)) > 12:
                # "## **Título** texto..." -> título + parágrafos (o Docs junta tudo numa linha só)
                resto = re.sub(r"\s{2,}(?=\*\*)", "\n\n", b.group(2))
                saida += [f"{'#' * min(6, max(3, nivel + 1))} {b.group(1)}", "", resto, ""]
                continue
            if not b and len(re.sub(r"[*_]", "", txt)) > 90:
                saida += [re.sub(r"\s{2,}(?=\*\*)", "\n\n", txt), ""]  # parágrafo marcado como título por engano
                continue
            saida.append(f"{'#' * min(6, max(3, nivel + 1))} {txt}")
            continue
        if re.match(r"^!\[\]\[image\d+\]", ln.strip()):
            saida.append('<p class="nauren-regras-nota"><i>(Neste ponto o livro tem uma imagem com o conteúdo; veja no livro.)</i></p>')
            continue
        saida.append(ln)
    return saida


def cortar(linhas):
    marcas = []  # (índice, página)
    for nome, rx in PAGINAS:
        for i, ln in enumerate(linhas):
            if ln.startswith("#") and re.search(rx, titulo_limpo(ln), re.I) and all(i > j for j, _ in marcas):
                marcas.append((i, nome)); break
        else:
            raise SystemExit(f"Título da página '{nome}' não encontrado ({rx}). Ajuste PAGINAS.")
    blocos = []
    for k, (i, nome) in enumerate(marcas):
        fim = marcas[k + 1][0] if k + 1 < len(marcas) else len(linhas)
        blocos.append((nome, linhas[i:fim]))
    return blocos


def remover_pulos(linhas):
    out, pulando, nivel = [], False, 0
    for ln in linhas:
        if ln.startswith("#"):
            n = len(ln) - len(ln.lstrip("#"))
            if pulando and n <= nivel:
                pulando = False
            if any(re.search(rx, titulo_limpo(ln), re.I) for rx in PULAR):
                pulando, nivel = True, n
                continue
        if not pulando:
            out.append(ln)
    return out


def html_da_pagina(nome, linhas, versao):
    md = "\n".join(remover_pulos(preparar(linhas)))
    corpo = markdown.markdown(md, extensions=["tables", "sane_lists"], output_format="html")
    corpo = re.sub(r"<table>", '<table class="nauren-regras-tabela">', corpo)
    return f'<div class="nauren-regras"><h2>{nome}</h2><p class="nauren-regras-fonte">Livro Nauren, versão {versao}.</p>{corpo}</div>'


def main():
    origem, versao = sys.argv[1], sys.argv[2]
    linhas = open(origem, encoding="utf-8").read().splitlines()
    paginas = [{"nome": nome, "html": html_da_pagina(nome, bloco, versao)} for nome, bloco in cortar(linhas)]
    destino = "data/livro-regras.mjs"
    with open(destino, "w", encoding="utf-8") as f:
        f.write("/* Gerado por tools/livro/gerar_diario.py a partir do livro. Não edite à mão: rode o gerador de novo. */\n")
        f.write(f"export const NAUREN_LIVRO_VERSAO = {json.dumps(versao)};\n")
        f.write("export const NAUREN_LIVRO_PAGINAS = " + json.dumps(paginas, ensure_ascii=False) + ";\n")
    for p in paginas:
        print(f"{p['nome']:45} {len(p['html']):7} caracteres")


if __name__ == "__main__":
    main()
