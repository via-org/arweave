import test from 'ava'
import { pipe } from '@hbauer/convenience-functions'
import { stringToB64Url, stringToUint8Array } from '@via-org/data-utils'

import { Client } from '../../src/classes/Client/class.js'
import { Wallet } from '../../src/classes/Wallet/class.js'
import { InvalidParameterError } from '../../src/errors.js'

import { ArLocal } from '../setup/_arlocal.js'
import { sampleData } from '../setup/_sample-data.js'
import { sampleTags as tags } from '../setup/_sample-tags.js'

const { arlocal, key } = await ArLocal.init()
const client = new Client({ protocol: 'http', host: 'localhost', port: 1984 })

const data = JSON.stringify(sampleData)

test.serial(
  'Creating a transaction without the correct params should throw an error',
  t => {
    const instanceOf = InvalidParameterError
    t.throws(() => client.transactions.create(null, key))
    t.throws(() => client.transactions.create({ data, tags }), { instanceOf })
  }
)

test.serial(
  'Creating a transaction supports both string and buffer data',
  async t => {
    const stringData = data
    const bufferData = stringToUint8Array(data)
    const transactionA = await client.transactions.create(
      { data: stringData, tags },
      key
    )
    const transactionB = await client.transactions.create(
      { data: bufferData, tags },
      key
    )
    t.true(await transactionA.verify())
    t.true(await transactionB.verify())
    t.deepEqual(transactionA.data_root, transactionB.data_root)
  }
)

test.serial(
  'Creating a transaction should yield a valid Transaction instance',
  async t => {
    const transaction = await client.transactions.create({ data, tags }, key)
    const formattedTags = tags.map(([name, value]) => ({ name, value }))
    t.is(transaction.format, 2)
    t.regex(transaction.id, /^[a-z0-9-_]{43}$/i)
    t.regex(transaction.owner, /^[a-z0-9-_]{683}$/i)
    t.is(transaction.tags.length, tags.length)
    t.deepEqual(transaction.tags, formattedTags)
    t.is(transaction.target, '')
    t.is(transaction.quantity, 0)
    t.regex(transaction.data_root, /^[a-z0-9-_]{43}$/i)
    t.is(transaction.data.length, data.length)
    t.true(isNaN(transaction.reward) === false)
    t.true(transaction.reward > 0)
    t.regex(transaction.signature, /^[a-z0-9-_]{683}$/i)
    t.true(await transaction.verify())
  }
)

test.serial(
  'Creating a transaction should yield a valid Transaction instance stringifiable to the correct format for posting to the network',
  async t => {
    const transaction = await client.transactions.create({ data, tags }, key)
    const jsonEncodedTransaction = pipe(transaction, JSON.stringify, JSON.parse)
    const encodedTags = tags
      .map(tags => tags.map(stringToB64Url))
      .map(([name, value]) => ({ name, value }))
    t.is(jsonEncodedTransaction.format, 2)
    t.regex(jsonEncodedTransaction.id, /^[a-z0-9-_]{43}$/i)
    t.regex(jsonEncodedTransaction.owner, /^[a-z0-9-_]{683}$/i)
    t.is(jsonEncodedTransaction.tags.length, tags.length)
    t.deepEqual(jsonEncodedTransaction.tags, encodedTags)
    t.is(jsonEncodedTransaction.target, '')
    t.is(jsonEncodedTransaction.quantity, '0')
    t.regex(jsonEncodedTransaction.data_root, /^[a-z0-9-_]{43}$/i)
    t.is(jsonEncodedTransaction.data.length, stringToB64Url(data).length)
    t.true(isNaN(jsonEncodedTransaction.reward) === false)
    t.true(jsonEncodedTransaction.reward > 0)
    t.regex(jsonEncodedTransaction.signature, /^[a-z0-9-_]{683}$/i)
  }
)

test.serial(
  'Creating a transaction followed by direct modifications to the transaction instance should invalidate the transaction',
  async t => {
    const transaction = await client.transactions.create({ data, tags }, key)
    transaction.tags[0].name = 'test'
    t.false(await transaction.verify())
  }
)

test.serial(
  'Posting a transaction should throw an error if params are invalid',
  async t => {
    const error = await t.throwsAsync(() => client.transactions.post(null))
    t.true(error instanceof InvalidParameterError)
  }
)

test.serial(
  'Posting a transaction should result in a non-OK status if the supplied wallet does not have sufficient funds',
  async t => {
    const { key: _key } = await Wallet.generate()
    const transaction = await client.transactions.create({ data, tags }, _key)
    const status = await client.transactions.post(transaction)
    t.is(status.ok, false)
    t.is(status.code, 410)
  }
)

test.serial(
  'Posting a transaction should result in a successful submission to the network',
  async t => {
    const transaction = await client.transactions.create({ data, tags }, key)
    const status = await client.transactions.post(transaction)
    t.is(status.ok, true)
    t.is(status.code, 200)
  }
)

test.serial(
  'Posting a transaction should result in the cached transaction data being available on the network',
  async t => {
    const transaction = await client.transactions.create({ data, tags }, key)
    await client.transactions.post(transaction)

    const cached = await client.transactions.getCachedData(transaction.id)
    t.deepEqual(cached, JSON.parse(data))
  }
)

test.serial(
  'Posting a transaction should result in the transaction data being available on the network',
  async t => {
    const transaction = await client.transactions.create({ data, tags }, key)
    await client.transactions.post(transaction)

    await ArLocal.mine(2)

    const regular = await client.transactions.getData(transaction.id)
    t.deepEqual(data, regular)
  }
)

test.serial(
  'Checking the status of an UNMINED transaaction should return the expected response',
  async t => {
    const transaction = await client.transactions.create({ data, tags }, key)
    await client.transactions.post(transaction)

    const response = await client.transactions.getStatus(transaction.id)
    const expected = 'Pending'

    t.is(response, expected)
  }
)

test.serial(
  'Checking the status of a MINED transaaction should return the expected response',
  async t => {
    const transaction = await client.transactions.create({ data, tags }, key)
    await client.transactions.post(transaction)

    await ArLocal.mine(3)

    const response = await client.transactions.getStatus(transaction.id)

    t.is(response.number_of_confirmations, 2)
  }
)

test.serial(
  'Fetching the offset for a given transaction should return a valid result',
  async t => {
    const transaction = await client.transactions.create({ data, tags }, key)
    await client.transactions.post(transaction)

    const offset = await client.transactions.getOffset(transaction.id)
    const likeOffset = { length: 638 }

    t.like(offset, likeOffset)
  }
)

test.serial(
  'Fetching the storage cost for a given piece of data should return a valid result',
  async t => {
    const price = await client.transactions.getPrice(stringToUint8Array(data))

    t.true(isNaN(price) === false)
    t.true(price > 0)
  }
)

test.after.always(async () => {
  await arlocal.stop()
})
