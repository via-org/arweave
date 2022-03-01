import { integerToUInt8Array, concatUint8Arrays } from '@via-org/data-utils'

/** @type {(node: MerkleNode, data: Uint8Array) => LeafProof} */
const generateLeafProof = (node, proof) => ({
  offset: node.range.max - 1,
  data: concatUint8Arrays([
    proof,
    node.dataHash,
    integerToUInt8Array(node.range.max),
  ]),
})

/** @type {(node: MerkleNode, proof?: Uint8Array) => LeafProof | LeafProof[]} */
const generateBranchProofs = (node, proof = new Uint8Array()) => {
  if (node.type === 'leaf') {
    return generateLeafProof(node, proof)
  }

  if (node.type === 'branch') {
    const { left, right, range } = node
    const partialProof = concatUint8Arrays([
      proof,
      left.id,
      right.id,
      integerToUInt8Array(range.min),
    ])
    // @ts-ignore
    return [left, right].map(node => generateBranchProofs(node, partialProof))
  }

  throw new Error('Invalid node type')
}

/** @param {MerkleNode} root */
export const generateProofs = root => {
  const proofs = generateBranchProofs(root)
  return [...[proofs]].flat(Infinity)
}
