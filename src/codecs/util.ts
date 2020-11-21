type ModuleFactory<M extends EmscriptenWasm.Module> = (
  opts: EmscriptenWasm.ModuleOpts,
) => M;

export function initEmscriptenModule<T extends EmscriptenWasm.Module>(
  moduleFactory: ModuleFactory<T>,
  wasmUrl: string,
): Promise<T> {
  return new Promise((resolve) => {
    const module = moduleFactory({
      noInitialRun: true,
      readBinary() {
        return Deno.open(wasmUrl).then(Deno.readAll);
      },
      onRuntimeInitialized() {
        // An Emscripten is a then-able that resolves with itself, causing an infite loop when you
        // wrap it in a real promise. Delete the `then` prop solves this for now.
        // https://github.com/kripken/emscripten/issues/5820
        delete (module as any).then;
        resolve(module);
      },
    });
  });
}

interface ClampOpts {
  min?: number;
  max?: number;
}

export function clamp(x: number, opts: ClampOpts): number {
  return Math.min(Math.max(x, opts.min || Number.MIN_VALUE), opts.max || Number.MAX_VALUE);
}
