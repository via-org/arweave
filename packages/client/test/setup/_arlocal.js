import pkg from 'arlocal'
import { API } from '../../src/classes/API/class.js'
import { Wallet } from '../../src/classes/Wallet/class.js'

// @ts-expect-error
const ArLocal = pkg.default
const api = new API('http://localhost:1984')

class ArLocalUtil {
  static async init() {
    const arlocal = new ArLocal(1984, false)
    await arlocal.start()

    const { key, address } = await Wallet.generate()
    await ArLocalUtil.fundWallet(address)

    return new ArLocalUtil(arlocal, key, address)
  }

  /**
   * @param {ArLocal} arlocal
   * @param {JsonWebKey} key
   * @param {string} address
   */
  constructor(arlocal, key, address) {
    this.arlocal = arlocal
    this.key = key
    this.address = address
  }

  /** @param {number} blocks */
  static mine(blocks) {
    return api.get(blocks ? `mine/${blocks}` : 'mine')
  }

  /** @param {string} address */
  static fundWallet(address) {
    const amount = 1e12
    return api.get(`mint/${address}/${amount}`)
  }
}

export { ArLocalUtil as ArLocal }
