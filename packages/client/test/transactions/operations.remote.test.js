import test from 'ava'

import { stringToUint8Array } from '@via-org/data-utils'

import { Client } from '../../src/classes/Client/class.js'

import { sampleData } from '../setup/_sample-data.js'
import { sampleTransactionId as transactionId } from '../setup/_sample-transaction-id.js'

const data = JSON.stringify(sampleData)

const node = new Client('http://65.21.201.96:1984')
const gateway = new Client('https://arweave.net')

test.serial(
  'Exisitng transaction data should be available on the network',
  async t => {
    let cached, standard

    /** Gateway */
    cached = await gateway.transactions.getCachedData(transactionId)
    t.deepEqual(cached, JSON.parse(data))
    standard = await gateway.transactions.getData(transactionId)
    t.deepEqual(standard, data)

    /** Node */
    cached = await node.transactions.getCachedData(transactionId)
    t.deepEqual(cached, JSON.parse(data))
    standard = await node.transactions.getData(transactionId)
    t.deepEqual(standard, data)
  }
)

test.serial.failing(
  'Checking the status of an UNMINED transaaction should return the correct response',
  async t => {
    let response, expected

    /** Gateway */
    response = await gateway.transactions.getStatus(transactionId)
    expected = 'Pending'
    t.is(response, expected)

    /** Node */
    response = await gateway.transactions.getStatus(transactionId)
    expected = 'Pending'

    t.is(response, expected)
  }
)

test.serial(
  'Checking the status of a MINED transaaction should return confirmations > 0',
  async t => {
    let response

    /** Gateway */
    response = await gateway.transactions.getStatus(transactionId)
    t.true(response.number_of_confirmations > 0)

    /** Node */
    response = await gateway.transactions.getStatus(transactionId)
    t.true(response.number_of_confirmations > 0)
  }
)

test.serial(
  'Fetching the storage cost for a given piece of data should return a valid result',
  async t => {
    let price

    /** Gateway */
    price = await gateway.transactions.getPrice(stringToUint8Array(data))
    t.true(isNaN(price) === false)
    t.true(price > 0)

    /** */
    price = await node.transactions.getPrice(stringToUint8Array(data))
    t.true(isNaN(price) === false)
    t.true(price > 0)
  }
)
