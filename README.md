# ICDeno

This is a research project to make Image CDN using wasm codecs from [squoosh](https://github.com/GoogleChromeLabs/squoosh).

Main pain point is to make wasm codecs play ball with deno.

## oxipng

oxipng is written in rust, so this is relatively easy.

``` javascript
import * as wasm from "./squoosh_oxipng_bg.wasm";
```

This does not work in deno, you have to use the following:

``` javascript
const f = await Deno.open("codecs/oxipng/pkg/squoosh_oxipng_bg.wasm");
const buf = await Deno.readAll(f);
const wasmModule = new WebAssembly.Module(buf);
const importObject = { "./squoosh_oxipng_bg.js": { __wbindgen_throw } };
const wasmInstance = new WebAssembly.Instance(wasmModule, importObject);
const wasm = wasmInstance.exports;
```

You have to import `__wbindgen_throw` js function explicitly into wasm module, not sure how it works implicitly in squoosh.

Be sure to `--allow-read=codecs` for this to work.

## imagequant

imagequant uses [emscripten](https://emscripten.org/), this is going to be tricky, emscripten's glue does not support deno (see this [PR](https://github.com/emscripten-core/emscripten/pull/12120) for details).

Makefile changes to make js glue have proper es6 import:

```
  --s EXPORT_ES6=1 \
```

To interface js and c strings emscripten uses `TextDecoder('utf-16le')`, this is going to throw, deno does not support it at the moment (see [PR](https://github.com/denoland/deno/pull/8108)).
Since imagequant doesn't work with strings, it is safe to just replace it with utf-8.

Next problem is that emscripten glue uses its own wasm loading mechanism based on the environment (and it is not aware of deno, so it fallbacks to generic web behavior).
We have to overload readBinary function to workaround erroneous environment detection.
