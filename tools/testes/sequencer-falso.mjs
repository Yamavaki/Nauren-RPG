// Sequencer de mentira para os testes: grava cada chamada de cada seção (efeito, som, tremor).
export function naurenSequencerFalso(log) {
  const secao = (tipo, s) => {
    const d = { tipo };
    const p = new Proxy({}, {
      get(_, prop) {
        if (prop === "d") return d;
        if (prop === "then") return undefined;
        if (prop === "effect" || prop === "sound" || prop === "canvasPan" || prop === "play") return s[prop].bind(s);
        return (...args) => { d[prop] = args.length ? args[0] : true; if (args.length > 1) d[`${prop}Op`] = args[1]; if (prop === "waitUntilFinished") d.espera = true; return p; };
      }
    });
    log.push(d);
    return p;
  };
  return class SequenceFalsa {
    effect() { return secao("efeito", this); }
    sound() { return secao("som", this); }
    canvasPan() { return secao("tremor", this); }
    async play() { log.push("play"); }
  };
}
