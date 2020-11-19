const f = await Deno.open("codecs/png/pkg/png_bg.wasm");
const buf = await Deno.readAll(f);
const wasmModule = new WebAssembly.Module(buf);
const importObject = { "./png_bg.js": { __wbindgen_throw } };
const wasmInstance = new WebAssembly.Instance(wasmModule, importObject);
const wasm = wasmInstance.exports;

let cachedTextDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
  if (
    cachegetUint8Memory0 === null ||
    cachegetUint8Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1);
  getUint8Memory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
  if (
    cachegetInt32Memory0 === null ||
    cachegetInt32Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachegetInt32Memory0;
}

function getArrayU8FromWasm0(ptr, len) {
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function decode(data) {
  var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
  var len0 = WASM_VECTOR_LEN;
  wasm.decode(8, ptr0, len0);
  var r0 = getInt32Memory0()[8 / 4 + 0];
  var r1 = getInt32Memory0()[8 / 4 + 1];
  var v1 = getArrayU8FromWasm0(r0, r1).slice();
  wasm.__wbindgen_free(r0, r1 * 1);
  return v1;
}

/**
 * @param {Uint8Array} data
 * @returns {ImageSize}
 */
export function get_size(data) {
  var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
  var len0 = WASM_VECTOR_LEN;
  var ret = wasm.get_size(ptr0, len0);
  return ImageSize.__wrap(ret);
}

/**
 * @param {Uint8Array} data
 * @param {number} width
 * @param {number} height
 * @returns {Uint8Array}
 */
export function encode(data, width, height) {
  var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
  var len0 = WASM_VECTOR_LEN;
  wasm.encode(8, ptr0, len0, width, height);
  var r0 = getInt32Memory0()[8 / 4 + 0];
  var r1 = getInt32Memory0()[8 / 4 + 1];
  var v1 = getArrayU8FromWasm0(r0, r1).slice();
  wasm.__wbindgen_free(r0, r1 * 1);
  return v1;
}

/**
 */
export class ImageSize {
  static __wrap(ptr) {
    const obj = Object.create(ImageSize.prototype);
    obj.ptr = ptr;

    return obj;
  }

  free() {
    const ptr = this.ptr;
    this.ptr = 0;

    wasm.__wbg_imagesize_free(ptr);
  }
  /**
   * @returns {number}
   */
  get width() {
    var ret = wasm.__wbg_get_imagesize_width(this.ptr);
    return ret >>> 0;
  }
  /**
   * @param {number} arg0
   */
  set width(arg0) {
    wasm.__wbg_set_imagesize_width(this.ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get height() {
    var ret = wasm.__wbg_get_imagesize_height(this.ptr);
    return ret >>> 0;
  }
  /**
   * @param {number} arg0
   */
  set height(arg0) {
    wasm.__wbg_set_imagesize_height(this.ptr, arg0);
  }
}

function __wbindgen_throw(arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
}
