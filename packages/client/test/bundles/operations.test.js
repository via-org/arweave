import test from 'ava'
import { uint8ArrayToB64Url } from '@via-org/data-utils'

import { Client } from '../../src/classes/Client/class.js'
import { InvalidParameterError } from '../../src/errors.js'

import { ArLocal } from '../setup/_arlocal.js'
import { sampleData } from '../setup/_sample-data.js'
import { sampleTags as tags } from '../setup/_sample-tags.js'

const { arlocal, key } = await ArLocal.init()
const client = new Client({ protocol: 'http', host: 'localhost', port: 1984 })

const data = JSON.stringify(sampleData)
const item = { data, tags }

test.serial(
  'Creating a bundle without the correct params should throw an error',
  async t => {
    const withoutItems = await t.throwsAsync(client.bundles.create(null, key))
    t.true(withoutItems instanceof InvalidParameterError)

    const withNoItems = await t.throwsAsync(client.bundles.create([], key))
    t.true(withNoItems instanceof RangeError)

    const withoutKey = await t.throwsAsync(client.bundles.create([{ data }]))
    t.true(withoutKey instanceof InvalidParameterError)
  }
)

test.serial(
  'Creating a bundle with a single item should return a valid Bundle instance',
  async t => {
    const bundle = await client.bundles.create([item], key)
    t.true(await bundle.verify())
    t.is(
      bundle.size - 32,
      bundle.items.reduce((acc, item) => acc + 64 + item.data.length, 0)
    )
    t.is(bundle.size, 1831)
    t.is(bundle.items.length, 1)
  }
)

test.serial(
  'Creating a bundle with many items should return a valid Bundle instance',
  async t => {
    const bundle = await client.bundles.create([item, item, item], key)
    t.true(await bundle.verify())
    t.is(
      bundle.size - 32,
      bundle.items.reduce((acc, item) => acc + 64 + item.data.length, 0)
    )
    t.is(bundle.size, 5429)
    t.is(bundle.items.length, 3)
  }
)

test.serial(
  'Unpacking a bundle with a single item should return a bundle identical to the bundle it was derived from',
  async t => {
    const bundle = await client.bundles.create([item], key)
    const unpackedBundle = client.bundles.unpack(bundle.data)
    t.deepEqual(unpackedBundle, bundle)
  }
)

test.serial(
  'Unpacking a bundle with many items should produce a bundle identical to the bundle it was derived from',
  async t => {
    const bundle = await client.bundles.create([item, item, item], key)
    const unpackedBundle = client.bundles.unpack(bundle.data)
    t.deepEqual(unpackedBundle, bundle)
  }
)

test.serial(
  'Posting a bundle should throw an error if params are invalid',
  async t => {
    const withoutBundle = await t.throwsAsync(client.bundles.post(null, key))
    t.true(withoutBundle instanceof InvalidParameterError)

    const withoutKey = await t.throwsAsync(client.bundles.post({}, null))
    t.true(withoutKey instanceof InvalidParameterError)
  }
)

test.serial(
  'Posting a bundle should result in a successful submission to the network',
  async t => {
    const bundle = await client.bundles.create([item], key)
    const status = await client.bundles.post(bundle, key)
    t.is(status.ok, true)
    t.is(status.code, 200)
  }
)

test.serial.failing(
  'Posting a bundle should result in bundled item data being available on the network',
  async t => {
    const bundle = await client.bundles.create([item], key)
    await client.bundles.post(bundle, key)

    const bundledItem = bundle.items[0]
    const transactionId = uint8ArrayToB64Url(bundledItem.id)

    const cached = await client.transactions.getCachedData(transactionId)
    t.deepEqual(cached, JSON.parse(data))

    await ArLocal.mine()

    const standard = await client.transactions.getData(transactionId)
    t.deepEqual(standard, data)
  }
)

test.after.always(async () => {
  await arlocal.stop()
})
