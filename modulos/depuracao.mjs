/**
 * 0.109.20 - Modo de depuração (Configurações > Nauren RPG, por tela).
 * Desligado: o console (F12) só mostra avisos e erros do sistema.
 * Ligado: mostra também as mensagens detalhadas (migrações, gatilhos, compêndios, Emanações)
 * e libera o comando naurenDiagnosticoAndar() para cenas com andares.
 * Este arquivo não importa nada do sistema, para poder ser usado por qualquer módulo.
 */

/** O Modo de depuração está ligado nesta tela? (antes do registro da configuração, responde não) */
export function naurenDepurando() {
  try { return !!game.settings.get("nauren", "modoDepuracao"); } catch (err) { return false; }
}

/** Mensagem detalhada: só aparece no console com o Modo de depuração ligado. */
export function naurenLog(...args) {
  if (naurenDepurando()) console.log(...args);
}

/** Comandos de diagnóstico que só existem no console com o Modo de depuração ligado. */
const naurenComandosDepuracao = new Map();

/** Registra um comando de console (ex.: naurenDiagnosticoAndar) que só fica disponível com o Modo de depuração ligado. */
export function naurenRegistrarComandoDepuracao(nome, fn) {
  naurenComandosDepuracao.set(nome, fn);
  if (naurenDepurando()) globalThis[nome] = fn;
}

function naurenAplicarComandosDepuracao(ligado) {
  for (const [nome, fn] of naurenComandosDepuracao) {
    if (ligado) globalThis[nome] = fn;
    else if (globalThis[nome] === fn) delete globalThis[nome];
  }
}

if (globalThis.Hooks) {
  Hooks.once("init", () => {
    game.settings.register("nauren", "modoDepuracao", {
      name: "Modo de depuração",
      hint: "Mostra no console (F12) as mensagens detalhadas do sistema e libera o comando naurenDiagnosticoAndar(). Avisos e erros aparecem sempre. Deixe desligado no jogo normal.",
      scope: "client", config: true, type: Boolean, default: false,
      onChange: valor => naurenAplicarComandosDepuracao(!!valor)
    });
  });
  Hooks.once("ready", () => naurenAplicarComandosDepuracao(naurenDepurando()));
}
