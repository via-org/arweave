import * as merkle from './merkle/index.js'

export class Chunks {
  /** @param {Uint8Array} data */
  static generate(data) {
    return merkle.generateChunks(data)
  }

  /** @param {Chunk[]} chunks */
  static async findRootNode(chunks) {
    const leaves = await Promise.all(merkle.generateLeaves(chunks))
    return merkle.generateRoot(leaves)
  }

  /** @param {MerkleNode} root */
  static generateProofs(root) {
    return merkle.generateProofs(root)
  }
}
