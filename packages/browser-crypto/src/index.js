import { concatUint8Arrays } from '@via-org/data-utils'

export class BrowserCrypto {
  constructor() {
    /** @type {SubtleCrypto} */
    this.crypto = window.crypto.subtle
  }

  /**
   * @param {(Uint8Array|Uint8Array[])} data
   * @param {{ browser: string, node: string }} [algo]
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
   * @param {JsonWebKey} jwk
   * @returns {Promise<Uint8Array>}
   */
  async sign(data, jwk) {
    const algo = { name: 'RSA-PSS', saltLength: 32 }
    const key = await this.importKey(jwk, 'sign')
    const signature = await this.crypto.sign(algo, key, data)
    return new Uint8Array(signature)
  }

  /**
   * @param {JsonWebKey['n']} owner
   * @param {Uint8Array} data
   * @param {Uint8Array} signature
   */
  async verify(owner, data, signature) {
    /** @param {number} saltLength */
    const _verify = saltLength =>
      this.crypto.verify({ name: 'RSA-PSS', saltLength }, key, signature, data)

    const jwk = { kty: 'RSA', e: 'AQAB', n: owner }
    const key = await this.importKey(jwk, 'verify')
    const [salt, noSalt] = await Promise.all([32, 0].map(_verify))
    return salt || noSalt
  }

  /**
   * @param {(JsonWebKey| JsonWebKey['n'])} jwk
   * @param {string} usage
   * @returns {Promise<CryptoKey>}
   */
  importKey(jwk, usage) {
    const algo = { name: 'RSA-PSS', hash: { name: 'SHA-256' } }
    const extractable = false
    // @ts-ignore - According to
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey,
    // this is fine ¯\_(ツ)_/¯
    return this.crypto.importKey('jwk', jwk, algo, extractable, [usage])
  }
}
