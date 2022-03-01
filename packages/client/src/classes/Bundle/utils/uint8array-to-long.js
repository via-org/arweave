/** @param {Uint8Array} uint8Array */
export const uint8ArrayToLong = uint8Array => {
  let long = 0
  for (let i = uint8Array.length - 1; i >= 0; i--) {
    long = long * 256 + uint8Array[i]
  }
  return long
}
