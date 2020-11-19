# ICDeno

This is a research project to make Image CDN using wasm codecs from [squoosh](https://github.com/GoogleChromeLabs/squoosh).

## Summary

Main pain point is to make wasm codecs play ball with deno.
Neither [wasm-bindgen](https://github.com/rustwasm/wasm-pack/pull/908) nor [emscripten](https://github.com/emscripten-core/emscripten/pull/12120) support deno at the moment.
On top of this, squoosh relies on built-in image decoding via [getImageData](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData) and deno [doesn't have any canvas](https://github.com/denoland/deno/issues/5701) implementation yet, so we will have to use extra wasm library to decode images into RGBA first.

## Libraries

### Oxipng

[Oxipng](https://github.com/shssoichiro/oxipng) is written in rust, so this is relatively easy.

``` javascript
import * as wasm from "./squoosh_oxipng_bg.wasm";
```

This [no longer works](https://github.com/denoland/deno/pull/5135) in deno, you have to use the following:

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

### ImageQuant

[ImageQuant](https://github.com/ImageOptim/libimagequant) uses [emscripten](https://emscripten.org/), this is going to be a bit trickier.

Makefile changes to make js glue have proper es6 import:

```
  --s EXPORT_ES6=1 \
```

To interface js and c strings emscripten uses `TextDecoder('utf-16le')`, this is going to throw, deno does not support it at the moment (see [PR](https://github.com/denoland/deno/pull/8108)).
Since imagequant doesn't work with strings, it is safe to just replace it with utf-8.

Next problem is that emscripten glue uses its own wasm loading mechanism, based on the environment (and it is not aware of deno, so it fallbacks to generic web behavior).
We have to overload readBinary function to work around erroneous environment detection.

### PNG Decoder/Encoder

[png](https://github.com/image-rs/image-png) is not in squoosh, but we need it to work around missing canvas.
It is a rust library and can be built the same way ImageQuant was.

## Usage

Launch server with:

`deno run --allow-net --allow-read=codecs src/main.ts`

Be sure to launch server from ICDeno root, otherwise deno won't find wasm modules (file reads in deno are relative to work dir).

Once the server is up use it like this:

`http://server-address/fetch/http://image-adress.png?format=webp&q=75`

For example, with default local server location:

`http://localhost:3030/fetch/http://www.libpng.org/pub/png/PngSuite/basn4a08.png?format=webp&q=75`
