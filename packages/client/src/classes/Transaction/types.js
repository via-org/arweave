/** @typedef {import('./TransactionOperations.js').TransactionOperations} TransactionOperations */
/** @typedef {import('./class.js').Transaction} Transaction */

/** @typedef {string} TransactionID */

/**
 * @typedef {Object} TransactionBody
 * @prop {string | Uint8Array} data
 * @prop {TagEntry[]} [tags]
 */

/**
 * @typedef {Object} InternalTransactionFields
 * @prop {Uint8Array} [id]
 * @prop {string} last_tx
 * @prop {JsonWebKey['n']} owner
 * @prop {TagEntry[]} tags
 * @prop {string} reward
 * @prop {Uint8Array} data
 * @prop {number} [data_size]
 * @prop {Uint8Array} data_root
 * @prop {Uint8Array} [signature]
 */

/**
 * @typedef {Object} PublicTransactionFields
 * @prop {Uint8Array} [id]
 * @prop {string} last_tx
 * @prop {JsonWebKey['n']} owner
 * @prop {TagEntry[]} tags
 * @prop {string} reward
 * @prop {Uint8Array|string} data
 * @prop {number} [data_size]
 * @prop {Uint8Array} data_root
 * @prop {Uint8Array} [signature]
 */

/**
 * @typedef {Object} TransactionSignatureFields
 * @prop {string} last_tx
 * @prop {JsonWebKey['n']} owner
 * @prop {TagEntry[]} tags
 * @prop {string} reward
 * @prop {Uint8Array} data
 * @prop {Uint8Array} data_root
 */

/**
 * @typedef {Object} Chunk
 * @prop {Uint8Array} dataHash
 * @prop {ChunkRange} range
 */

/**
 * @typedef {Object} ChunkRange
 * @prop {number} min
 * @prop {number} max
 */

/**
 * @typedef {Object} LeafProof
 * @prop {number} offset
 * @prop {Uint8Array} data
 */

/**
 * @typedef {Object} MerkleNode
 * @prop {string} [type]
 * @prop {Uint8Array} id
 * @prop {ChunkRange} [range]
 * @prop {Uint8Array} [dataHash]
 * @prop {MerkleNode} [left]
 * @prop {MerkleNode} [right]
 */

/**
 * @typedef TransactionResponseStatus
 * @prop {boolean} ok
 * @prop {number} code
 * @prop {*} [body]
 */
