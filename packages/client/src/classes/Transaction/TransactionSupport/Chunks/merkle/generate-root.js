import { integerToUInt8Array } from '@via-org/data-utils'
import { Crypto } from '@via-org/arweave-crypto'

/**
 * @param {MerkleNode} left
 * @param {MerkleNode} right
 * @returns {Promise<MerkleNode>}
 */
const hashBranch = async (left, right) =>
  !right
    ? left
    : {
        type: 'branch',
        id: await Crypto.hash([
          await Crypto.hash(left.id),
          await Crypto.hash(right.id),
          await Crypto.hash(integerToUInt8Array(left.range.max)),
        ]),
        range: { min: left.range.max, max: right.range.max },
        left,
        right,
      }

/**
 * @param {MerkleNode[]} leaves
 * @returns {Promise<MerkleNode>}
 */
export const generateRoot = async leaves => {
  if (leaves.length === 1) {
    return leaves[0]
  }

  const nextLayer = []

  for (let i = 0; i < leaves.length; i += 2) {
    nextLayer.push(await hashBranch(leaves[i], leaves[i + 1]))
  }

  return generateRoot(nextLayer)
}
