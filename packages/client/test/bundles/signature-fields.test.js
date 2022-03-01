import test from 'ava'
import { pipe, map } from '@hbauer/convenience-functions'
import { stringToUint8Array, b64UrlToUint8Array } from '@via-org/data-utils'

import { Wallet } from '../../src/classes/Wallet/class.js'
import { Signature } from '../../src/classes/Bundle/DataItem/DataItemOperations/Signature.js'

import { sampleTags } from '../setup/_sample-tags.js'
import { sampleData } from '../setup/_sample-data.js'

import { encodeTags } from '../../src/classes/Bundle/DataItem/DataItemOperations/DataItemFields/utils/tags.js'

import {
  DATA_ITEM_ENTITY,
  DATA_ITEM_FORMAT,
  DATA_ITEM_SIGNATURE_TYPE,
} from '../../src/classes/Bundle/DataItem/DataItemOperations/constants.js'

const { key } = await Wallet.generate()
const tags = pipe(
  sampleTags,
  map(([name, value]) => ({ name, value })),
  encodeTags
)
const data = stringToUint8Array(JSON.stringify(sampleData))

test('Fields passed into Signature.prepareFields should be transformed in a predictable manner', t => {
  const fields = {
    owner: b64UrlToUint8Array(key.n),
    tags,
    data,
  }

  const preparedFields = Signature.prepareFields(fields)

  const expectedFields = Object.values({
    entity: stringToUint8Array(DATA_ITEM_ENTITY),
    format: stringToUint8Array(DATA_ITEM_FORMAT.toString()),
    signatureType: stringToUint8Array(DATA_ITEM_SIGNATURE_TYPE.toString()),
    owner: b64UrlToUint8Array(key.n),
    target: new Uint8Array(),
    anchor: new Uint8Array(),
    tags: tags.slice(16) || new Uint8Array(),
    data,
  })

  t.deepEqual(preparedFields, expectedFields)
})
