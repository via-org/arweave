# <a href='https://via.dev#gh-dark-mode-only'><img src='https://via.dev/logo-light.png' height='50' /></a>

# <a href='https://via.dev#gh-light-mode-only'><img src='https://via.dev/logo.png' height='50' /></a>

<br>

An Arweave client implementation written for Via

<br>

### Features

- Small: Under 7KB minified + gzipped
- Isomorphic: zero reliance on Node built-ins
- Versatile: Support for [ANS-104 compliant bundles](https://github.com/ArweaveTeam/arweave-standards/blob/master/ans/ANS-104.md)

<br>

### Installation

```sh
npm i @via-org/arweave-client
# or
yarn add @via-org/arweave-client
```

<br>

### Usage

##### Creating and submitting transactions

```js
import { readFileSync } from 'fs'
import { Arweave } from '@via-org/arweave-client'

// Import your wallet
const key = JSON.parse(readFileSync('./key.json').toString())

// Instantiate the client
const arweave = new Arweave('https://arweave.net') // or new Arweave({ protocol: 'https', host: 'arweave.net' })

// Get transaction params ready
const data = JSON.stringify({ hello: 'world' })
const tags = [
  ['App-Name', 'Via'],
  ['Content-Type', 'application/json'],
]

// Create transaction
const transaction = await arweave.transactions.create({ data, tags }, key)
assert(/^[a-z0-9-_]{43}$/i.test(transaction.id))

// Post transaction
const status = await arweave.transactions.post(transaction)
assert(status === 'PENDING' || status.number_of_confirmations > 0)
```

##### Creating, submitting, and unpacking bundles

```js
// Get data items ready
const itemA = {
  data: JSON.stringify({ testing: true }),
  tags: [['Hello', 'World']],
}
const itemB = {
  data: JSON.stringify({ testing: 123 }),
  tags: [['Sup', 'Earth']],
}

// Create bundle
const bundle = await arweave.bundles.create([itemA, itemB], key)
assert(bundle.items.length === 2)

// Post bundle
const status = await arweave.bundles.post(bundle)
assert(status === 'PENDING' || status.number_of_confirmations > 0)

// Unpack bundle
const unpackedBundle = arweave.bundles.unpack(bundle.data)
assert.deepEqual(bundle, unpackedBundle)
```

##### Fetching transaction data

```js
// Fetch the price of transaction data as a winston string
const price = await arweave.transactions.getPrice(bundle.data)

// Fetch the status of an Arweave transaction
const status = await arweave.transactions.getStatus(transaction.id)

// Fetch the associated offset data of an Arweave transaction
const offset = await arweave.transactions.getOffset(transaction.id)

// Fetch Arweave data by transaction ID
const data = await client.transactions.getData(transaction.id)

// Fetch (optimistically) cached Arweave data by transaction ID
const data = await client.transactions.getCachedData(transaction.id)
```

##### Utilities

```js
import { Wallet } from '@via-org/arweave-client/utilities'

// Generate a wallet
const { address, key } = await Wallet.generate()
```
