import { integerToUInt8Array } from '@via-org/data-utils'
import { Crypto } from '@via-org/arweave-crypto'

/**
 * @param {Chunk[]} chunks
 * @returns {Promise<MerkleNode>[]}
 */
export const generateLeaves = chunks =>
  chunks.map(async ({ dataHash, range: { min, max } }) => ({
    type: 'leaf',
    id: await Crypto.hash([
      await Crypto.hash(dataHash),
      await Crypto.hash(integerToUInt8Array(max)),
    ]),
    dataHash,
    range: { min, max },
  }))
