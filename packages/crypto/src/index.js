import { BrowserCrypto } from '@via-org/arweave-browser-crypto'
import { NodeCrypto } from '@via-org/arweave-node-crypto'

export const SHA256 = { browser: 'SHA-256', node: 'sha256' }
export const SHA384 = { browser: 'SHA-384', node: 'sha384' }
export const ENV = typeof window !== 'undefined' ? 'browser' : 'node'
export const Crypto = ENV === 'browser' ? new BrowserCrypto() : new NodeCrypto()
