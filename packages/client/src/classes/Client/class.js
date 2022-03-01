import { API } from '../API/class.js'
import { TransactionOperations } from '../Transaction/TransactionOperations.js'

export class Client {
  /**
   * @constructor
   * @param {APIHostParts} host
   * @example
   *   // Different routes to instantiation:
   *   1. new Arweave({ protocol?: 'http', host: 'arweave.gateway.xyz', port?: 80 })
   *   2. new Arweave('https://arweave.gateway.xyz:1234')
   *   3. new Arweave() // Defaults to `https://arweave.net`
   */
  constructor(host) {
    this.api = new API(host)
    this.transactions = new TransactionOperations(this.api)
    this.bundles = this.transactions.bundles
  }
}
