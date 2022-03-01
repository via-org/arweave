import test from 'ava'
import { stringToUint8Array, b64UrlToUint8Array } from '@via-org/data-utils'

import { Signature } from '../../src/classes/Transaction/TransactionSupport/Signature/class.js'

import { sampleTags } from '../setup/_sample-tags.js'
import { sampleData } from '../setup/_sample-data.js'

import {
  TRANSACTION_FORMAT,
  TRANSACTION_TARGET,
  TRANSACTION_QUANTITY,
} from '../../src/classes/Transaction/TransactionSupport/Signature/constants.js'

const data = stringToUint8Array(JSON.stringify(sampleData))

test('Fields passed into Signature.prepareFields should be transformed in a predictable manner', t => {
  const fields = {
    owner: 'ZaMsGtl6jiJG9rJvTBK5nXil5WNREg498FTP37HYabk',
    reward: '59227012',
    last_tx: 'tTC7wqEf_N4I0AUH0YtsDmxvX6SP5mLQmtId6SeEGf8yfVge6ypzZrtKcN2fuwxj',
    tags: sampleTags,
    data,
    data_root: 'D8yxyNEtJ6Se25NJgL5xQaTeMIiGWyyRvMwDsDtnbpg',
  }

  const preparedFields = Signature.prepareFields(fields)

  const expectedFields = Object.values({
    format: stringToUint8Array(TRANSACTION_FORMAT.toString()),
    owner: b64UrlToUint8Array('ZaMsGtl6jiJG9rJvTBK5nXil5WNREg498FTP37HYabk'),
    target: TRANSACTION_TARGET,
    quantity: stringToUint8Array(TRANSACTION_QUANTITY.toString()),
    reward: stringToUint8Array('59227012'),
    last_tx: b64UrlToUint8Array(
      'tTC7wqEf_N4I0AUH0YtsDmxvX6SP5mLQmtId6SeEGf8yfVge6ypzZrtKcN2fuwxj'
    ),
    tags: sampleTags.map(entry => entry.map(stringToUint8Array)),
    data_size: stringToUint8Array(data.byteLength.toString()),
    data_root: 'D8yxyNEtJ6Se25NJgL5xQaTeMIiGWyyRvMwDsDtnbpg',
  })

  t.deepEqual(preparedFields, expectedFields)
})
