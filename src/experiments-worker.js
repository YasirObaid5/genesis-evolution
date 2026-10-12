'use strict';
self.onmessage = function (event) {
  try {
    const E = self.GenesisExperiments;
    const config = E.validateConfig(event.data.config);
    const runs = [], interval = Math.max(20, Math.ceil(config.steps / 100));
    for (let repeat = 0; repeat < config.repeats; repeat++) {
      const pair = E.createPair(config, repeat);
      const paths = { a: [E.sample(pair.a)], b: [E.sample(pair.b)] };
      for (let step = 1; step <= config.steps; step++) {
        if (pair.a.cells.length) pair.a.step();
        if (pair.b.cells.length) pair.b.step();
        const extinct = !pair.a.cells.length && !pair.b.cells.length;
        if (step % interval === 0 || step === config.steps || extinct) {
          for (const arm of ['a', 'b']) {
            const sample = E.sample(pair[arm]);
            if (paths[arm][paths[arm].length - 1].step !== sample.step) paths[arm].push(sample);
          }
          self.postMessage({ type: 'progress', repeat: repeat + 1, step, total: config.steps, repeats: config.repeats });
        }
        if (extinct) break;
      }
      const run = { seed: pair.seed };
      for (const arm of ['a', 'b']) run[arm] = { ...E.sample(pair[arm]), trajectory: paths[arm] };
      runs.push(run);
      self.postMessage({ type: 'replicate', run });
    }
    self.postMessage({ type: 'done', runs, summary: E.summarize(runs) });
  } catch (error) {
    self.postMessage({ type: 'error', message: String(error.message || error) });
  }
};
