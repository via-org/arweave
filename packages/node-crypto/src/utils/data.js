/** @param {string} hex */
export const pad = hex => (hex.length % 2 === 1 ? '0' + hex : hex)

/** @param {string} hex */
export const hexToBase64Url = hex => {
  const base64 = Buffer.from(hex, 'hex').toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * @param {string} base64
 * @returns {BigInt}
 */
export const base64ToBignum = base64 => {
  const binary = Buffer.from(base64, 'base64').toString('binary')
  const hex = []

  for (let i = 0; i < binary.length; i++) {
    let h = binary[i].charCodeAt(0).toString(16)
    if (h.length % 2) h = '0' + h
    hex.push(h)
  }

  return BigInt('0x' + hex.join(''))
}

export const bignumToBase64Url = bignum =>
  hexToBase64Url(pad(bignum.toString(16)))
