import { concatUint8Arrays } from '@via-org/data-utils'

export class BrowserCrypto {
  constructor() {
    /** @type {SubtleCrypto} */
    this.crypto = window.crypto.subtle
  }

  /**
   * @param {(Uint8Array|Uint8Array[])} data
   * @param {Object} algo
   * @param {string} algo.browser
   * @param {string} algo.node
   * @returns {Promise<Uint8Array>}
   */
  async hash(data, algo) {
    const digest = await this.crypto.digest(
      algo?.browser || 'SHA-256',
      Array.isArray(data) ? concatUint8Arrays(data) : data
    )
    return new Uint8Array(digest)
  }

  /**
   * @param {Uint8Array} data
   * @param {Object} jwk
   * @returns {Promise<Uint8Array>}
   */
  async sign(data, jwk) {
    const algo = { name: 'RSA-PSS', saltLength: 32 }
    const key = await this.importKey(jwk)
    const signature = await this.crypto.sign(algo, key, data)
    return new Uint8Array(signature)
  }

  /**
   * @param {Object} jwk
   * @returns {Promise<CryptoKey>}
   */
  importKey(jwk) {
    const algo = { name: 'RSA-PSS', hash: { name: 'SHA-256' } }
    const extractable = false
    const usages = ['sign']
    // @ts-ignore - According to
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey,
    // this is fine ¯\_(ツ)_/¯
    return this.crypto.importKey('jwk', jwk, algo, extractable, usages)
  }
}
