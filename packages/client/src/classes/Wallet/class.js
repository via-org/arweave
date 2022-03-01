import { Crypto } from '@via-org/arweave-crypto'
import { b64UrlToUint8Array, uint8ArrayToB64Url } from '@via-org/data-utils'

export class Wallet {
  static async generate() {
    const key = await Crypto.generateJWK()
    const address = await this.ownerToAddress(key.n)
    return { key, address }
  }

  /** @private @param {JsonWebKey['n']} owner */
  static async ownerToAddress(owner) {
    const hash = await Crypto.hash(b64UrlToUint8Array(owner))
    return uint8ArrayToB64Url(hash)
  }
}
