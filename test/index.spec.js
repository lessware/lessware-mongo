/* eslint-env mocha */

const midmongo = require('../src')
const mongodb = require('mongodb')
const { framework } = require('lessware')
const { assert } = require('chai')
const sinon = require('sinon')

const asyncMethod = value => async () => {
  return value
}

const mockMongoClient = ({findOne}) => ({
  db: (/*name*/) => {
    return {
      collection: (/*name*/) => {
        return {
          findOne,
        }
      }
    }
  }
})

const testConfig = {
  isIntegration: JSON.parse(process.env.TEST_INTEGRATION || 'false'),
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27018',
}

describe('mongo', function() {
  describe('connect', function() {
    const mongo = {} // cache client
    const config = {
      mongo: {
        connectOptions: {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      }
    }
    const mocks = {
      MongoClient: {
        connect: sinon.stub(),
      },
    }
    
    before(() => {
      if (!testConfig.isIntegration) {
        mocks.MongoClient.connect = sinon.stub(mongodb.MongoClient, 'connect')
      }
    })

    after(() => {
      testConfig.isIntegration && mongo.client.close()
      !testConfig.isIntegration && sinon.restore()
    })

    it('should connect', async function() {
      const chain = framework([
        // attach mongo url from an async process
        async context => ({...context, mongoUrl: testConfig.mongoUrl}),
        midmongo.connect({
          uri: context => context.mongoUrl,
          options: context => context.config.mongo.connectOptions,
        }),
        async context => {
          const result = await context.mongo.client
            .db('test')
            .collection('todo')
            .findOne({id: context.event.payload.id})
          return result
        }
      ])

      const event = {payload: {id: '123'}}
      const expected = {
        id: '123',
        title: 'buy toothpaste',
        acl: {
          owners: ['userDEF'],
          writers: ['grp456','grp123'],
          readers: [],
        }
      }
      const findOne = asyncMethod(expected)
      mocks.MongoClient.connect.onCall(0).yields(null, mockMongoClient({findOne}))
      const result = await chain({mongo, event, config})
      assert.equal(result.title, expected.title)
    })
  })
})
