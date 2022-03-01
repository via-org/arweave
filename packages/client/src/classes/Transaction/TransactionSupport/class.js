import { stringToUint8Array, uint8ArrayToB64Url } from '@via-org/data-utils'
import { Crypto } from '@via-org/arweave-crypto'

import { Transaction } from '../class.js'
import { Chunks } from './Chunks/class.js'
import { Signature } from './Signature/class.js'

import { request } from './request.js'

export class TransactionSupport {
  /** @param {API} api */
  constructor(api) {
    /** @private */
    this.api = api
  }

  /** @protected */
  get _request() {
    return request(this.api)
  }

  /** @protected @param {Uint8Array} data */
  fetchRemoteFields(data) {
    return Promise.all([
      this._request.reward(data.byteLength),
      this._request.anchor(),
    ])
  }

  /** @protected @param {Uint8Array} signature */
  generateId(signature) {
    return Crypto.hash(signature)
  }

  /**
   * @protected
   * @param {TransactionBody} fields
   * @param {JsonWebKey} key
   */
  async assemble({ data, tags }, key) {
    const encodedData =
      data instanceof Uint8Array ? data : stringToUint8Array(data)

    const [reward, anchor] = await this.fetchRemoteFields(encodedData)

    const chunks = await Chunks.generate(encodedData)
    const root = await Chunks.findRootNode(chunks)
    const proofs = await Promise.all(Chunks.generateProofs(root))

    /** @type {InternalTransactionFields} */
    const fields = {
      data: encodedData,
      last_tx: anchor,
      owner: key.n,
      tags,
      data_root: root.id,
      reward,
    }

    const { signature } = await this.sign(fields, key)
    const id = await this.generateId(signature)

    /** @typedef {{ chunks: Chunk[], proofs: LeafProof[] }} TransactionAuxData */
    const aux = /** @type {TransactionAuxData} */ ({ chunks, proofs })

    return new Transaction({ ...fields, data, id, signature }, aux)
  }

  /** @private @param {Transaction} transaction */
  formatChunks(transaction) {
    return transaction.chunks.items.map((chunk, i) => ({
      data_root: transaction.data_root,
      data_size: transaction.data_size.toString(),
      data_path: uint8ArrayToB64Url(transaction.chunks.proofs[i].data),
      offset: transaction.chunks.proofs[i].offset.toString(),
      chunk: uint8ArrayToB64Url(
        transaction._fields.data.slice(chunk.range.min, chunk.range.max)
      ),
    }))
  }

  /**
   * @protected
   * @param {Transaction} transaction
   * @param {number} [attempts]
   * @param {{ i: number } & TransactionResponseStatus} [failureInfo]
   * @returns {Promise<TransactionResponseStatus>}
   */
  async uploadChunks(transaction, attempts = 0, failureInfo) {
    if (attempts > 5) {
      return {
        ok: false,
        code: failureInfo.code,
        body: failureInfo.body,
      }
    }

    const formattedChunks = this.formatChunks(transaction)
    const chunkRequests = formattedChunks.map(this._request.postChunk)
    const statuses = await Promise.all(chunkRequests)
    const failures = statuses
      .map((response, i) => response.ok === false && { i, ...response })
      .filter(Boolean)

    if (failures.length > 0) {
      transaction.chunks = failures.reduce(
        (acc, chunk) => ({
          items: [...acc.items, transaction.chunks.items[chunk.i]],
          proofs: [...acc.proofs, transaction.chunks.proofs[chunk.i]],
          length: acc.length + 1,
        }),
        { items: [], proofs: [], length: 0 }
      )
      return this.uploadChunks(transaction, attempts + 1, failures.at(0))
    }

    return statuses.at(0)
  }

  /** @private */
  get sign() {
    return Signature.sign
  }
}
