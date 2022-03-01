import { Crypto } from '@via-org/arweave-crypto'
import { MAX_CHUNK_SIZE } from '../constants.js'

// TODO: Take a pass at simplifying this algo

/**
 * @param {Uint8Array} data
 * @returns {Promise<Chunk[]>}
 */
export const generateChunks = async data => {
  if (data.byteLength < MAX_CHUNK_SIZE) {
    return [
      {
        dataHash: await Crypto.hash(data),
        range: { min: 0, max: data.byteLength },
      },
    ]
  }

  const quotient = data.byteLength / MAX_CHUNK_SIZE

  let chunks = []

  for (let i = 0, lowerBound = i * MAX_CHUNK_SIZE; i <= quotient - 1; i++) {
    chunks.push({
      dataHash: await Crypto.hash(
        data.slice(lowerBound, lowerBound + MAX_CHUNK_SIZE)
      ),
      range: { min: lowerBound, max: i + MAX_CHUNK_SIZE },
    })
  }

  const remainder = data.length % MAX_CHUNK_SIZE

  if (remainder) {
    // Last chunk
    chunks.push({
      dataHash: await Crypto.hash(
        data.slice(
          chunks.length * MAX_CHUNK_SIZE,
          chunks.length * MAX_CHUNK_SIZE + remainder
        )
      ),
      range: {
        min: chunks.length * MAX_CHUNK_SIZE,
        max: chunks.length * MAX_CHUNK_SIZE + remainder,
      },
    })
  }

  return chunks
}
