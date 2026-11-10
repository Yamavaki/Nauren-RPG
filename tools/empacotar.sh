#!/usr/bin/env bash
# Monta o dist/nauren.zip a partir dos arquivos do repositório (rastreados pelo git + novos ainda não commitados).
# Uso: bash tools/empacotar.sh (a GitHub Action .github/workflows/release.yml roda o mesmo script e publica a Release)
# Fica de fora: dist/, tools/, .github/, .gitignore e o README.md da raiz (o Foundry não usa).
set -euo pipefail
cd "$(dirname "$0")/.."
versao=$(grep -m1 '"version"' system.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')
css=$(grep -m1 -- '--nauren-css-versao' styles/nauren.css | sed 's/.*"\([^"]*\)".*/\1/')
[ "$versao" = "$css" ] || { echo "ERRO: system.json diz $versao e o CSS diz $css (--nauren-css-versao)."; exit 1; }
grep -q "vers%C3%A3o-$versao-" README.md || echo "AVISO: o selo de versão do README.md não é $versao."
dl=$(grep -m1 '"download"' system.json | sed 's/.*"download": *"\([^"]*\)".*/\1/')
case "$dl" in */releases/download/v$versao/nauren.zip) ;; *) echo "ERRO: o download do system.json ($dl) não aponta para a Release v$versao."; exit 1;; esac
for f in nauren.mjs modulos/*.mjs data/*.mjs; do node --check "$f"; done
tmp=$(mktemp)
git ls-files -co --exclude-standard | grep -v -e '^dist/' -e '^tools/' -e '^\.github/' -e '^\.gitignore$' -e '^README\.md$' | sort > "$tmp"
mkdir -p dist; rm -f dist/nauren.zip
zip -q -X dist/nauren.zip -@ < "$tmp"
echo "dist/nauren.zip: versão $versao, $(wc -l < "$tmp") arquivos, $(du -h dist/nauren.zip | cut -f1)"
rm -f "$tmp"
