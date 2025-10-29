import init, { estimate_strength } from "../public/wasm/pwd_strength.js";

let wasmReady = null;

async function initWasm() {
  if (!wasmReady) {
    wasmReady = init("/wasm/pwd_strength_bg.wasm");
  }
  return wasmReady;
}

export async function checkPasswordStrength(password) {
  await initWasm();
  const result = estimate_strength(password);
  return result;
}
