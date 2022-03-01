import { InvalidParameterError } from '../../errors.js'

import { Bundle } from './class.js'
import { DataItem } from './DataItem/class.js'
import { BundleSupport } from './BundleSupport.js'

/** @implements {BundleSupport} */
export class BundleOperations extends BundleSupport {
  /** @param {TransactionOperations} transactionOperations */
  constructor(transactionOperations) {
    super()

    /** @private */
    this.transactionOperations = transactionOperations
  }

  /**
   * Create an ANS-104 compliant bundle from an arbitrary number of data items
   * @param {DataItemBody[]} items
   * @param {JsonWebKey} key
   * @example
   *   const itemA = { data: JSON.stringify({ hello: 'world' }), tags: [['Version', '0.0.0']] }
   *   const itemB = { data: JSON.stringify({ testing: 123 }), tags: [['Version', '0.0.1']] }
   *   const bundle = await client.bundles.create([itemA, itemB], key)
   */
  async create(items, key) {
    if (!items) throw new InvalidParameterError('items')
    if (items?.length === 0) throw new RangeError('Please supply > 0 items')
    if (!key) throw new InvalidParameterError('key')

    const dataItems = items.map(item => DataItem.create(item, key))
    return super.pack(await Promise.all(dataItems))
  }

  /**
   * Submit a bundle to the network
   * @param {Bundle} bundle
   * @param {JsonWebKey} key
   * @example
   *   const bundle = await client.bundles.create([itemA, itemB], key)
   *   const status = await client.bundles.post(bundle, key)
   */
  async post(bundle, key) {
    if (!bundle) throw new InvalidParameterError('bundle')
    if (!key) throw new InvalidParameterError('key')

    const fields = { data: bundle.data, tags: Bundle.DEFAULT_TAGS }
    const transaction = await this.transactionOperations.create(fields, key)
    return this.transactionOperations.post(transaction)
  }
}
