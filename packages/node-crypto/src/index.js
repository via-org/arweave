import crypto from 'crypto'
import { concatUint8Arrays } from '@via-org/data-utils'

import { jwkToPem } from './utils/index.js'

export class NodeCrypto {
  constructor() {
    /** @type {crypto} */
    this.crypto = crypto
  }

  /**
   * @param {(Uint8Array|Uint8Array[])} data
   * @param {{ node: string, browser: string }} [algo]
   * @returns {Uint8Array}
   */
  hash(data, algo) {
    const digest = this.crypto
      .createHash(algo?.node || 'sha256')
      .update(Array.isArray(data) ? concatUint8Arrays(data) : data)
      .digest()
    return new Uint8Array(digest)
  }

  /**
   * @param {Uint8Array} data
   * @param {JsonWebKey} jwk
   * @returns {Uint8Array}
   */
  sign(data, jwk) {
    const pem = jwkToPem(jwk)
    const padding = this.crypto.constants.RSA_PKCS1_PSS_PADDING
    return this.crypto
      .createSign('sha256')
      .update(data)
      .sign({ key: pem, padding })
  }

  /**
   * @param {JsonWebKey['n']} owner
   * @param {Uint8Array} data
   * @param {Uint8Array} signature
   */
  verify(owner, data, signature) {
    const pem = jwkToPem({ kty: 'RSA', e: 'AQAB', n: owner })
    const padding = this.crypto.constants.RSA_PKCS1_PSS_PADDING
    return this.crypto
      .createVerify('sha256')
      .update(data)
      .verify({ key: pem, padding }, signature)
  }
}
