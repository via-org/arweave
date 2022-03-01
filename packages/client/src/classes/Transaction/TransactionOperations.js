import { uint8ArrayToString } from '@via-org/data-utils'
import { InvalidParameterError } from '../../errors.js'

import { BundleOperations } from '../Bundle/BundleOperations.js'
import { TransactionSupport } from './TransactionSupport/class.js'

/** @implements {TransactionSupport} */
export class TransactionOperations extends TransactionSupport {
  /** @param {import('../API/class.js').API} api */
  constructor(api) {
    super(api)
  }

  /**
   * Fetch the price of transaction data as a winston string
   * @param {Uint8Array} data
   * @example
   *   const price = await client.transactions.getPrice(data)
   */
  getPrice(data) {
    return super._request.reward(data.byteLength)
  }

  /**
   * Fetch the status of an Arweave transaction
   * @param {TransactionID} id
   * @example
   *   const status = await client.transactions.getStatus(transactionId)
   */
  getStatus(id) {
    return super._request.status(id)
  }

  /**
   * Fetch the associated offset data of an Arweave transaction
   * @param {TransactionID} id
   * @example
   *   const offset = await client.transactions.getOffset(transactionId)
   */
  getOffset(id) {
    return super._request.offset(id)
  }

  /**
   * Fetch Arweave data by transaction ID
   * @param {TransactionID} id
   * @example
   *   const data = await client.transactions.getData(transactionId)
   */
  async getData(id) {
    const { start, length } = await this._request.offset(id)

    /**
     * @param {Uint8Array} data
     * @param {number} pos
     * @returns {Promise<string>}
     */
    const getChunks = async (data, pos = 0) => {
      if (pos >= length) return uint8ArrayToString(data)
      const chunk = await this._request.chunk(start + pos)
      data.set(chunk, pos)
      return getChunks(data, pos + chunk.length)
    }

    return getChunks(new Uint8Array(length))
  }

  /**
   * Fetch (optimistically) cached Arweave data by transaction ID
   * @param {TransactionID} id
   * @example
   *   const data = await client.transactions.getCachedData(transactionId)
   */
  getCachedData(id) {
    return super._request.cachedData(id)
  }

  /**
   * Create an Arweave transaction
   * @param {TransactionBody} fields
   * @param {JsonWebKey} key
   * @example
   *   const data = JSON.stringify({ hello: 'world' })
   *   const tags = [['Content-Type', 'application/json']]
   *   const transaction = await client.transactions.create({ data, tags }, key)
   */
  create(fields, key) {
    if (!fields) throw new InvalidParameterError('fields')
    if (key === undefined) throw new InvalidParameterError('key')
    return super.assemble(fields, key)
  }

  /**
   * Submit an Arweave transaction to the network
   * @param {Transaction} transaction
   * @example
   *   const transaction = client.transactions.create({ data, tags }, key)
   *   const status = client.transactions.post(transaction)
   */
  async post(transaction) {
    if (!transaction) throw new InvalidParameterError('transaction')

    if (transaction.chunks.length > 1) {
      transaction._encodedData = new Uint8Array()
      const txStatus = await super._request.postTransaction(transaction)
      const chunkStatus = await super.uploadChunks(transaction)
      if (chunkStatus.ok === false) return chunkStatus
      return txStatus
    }

    return super._request.postTransaction(transaction)
  }

  /**
   * Proxies a BundleOperations instance
   */
  get bundles() {
    return new BundleOperations(this)
  }
}
