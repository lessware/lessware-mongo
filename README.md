# lessware-mongo
mongo middlware for the lessware framework

## Install
`npm i -S lessware-mongo`

## API
`connect` a function that returns the middleware function.
- input parameter: a configuration object, whose keys are functions that must synchronously return configuration properties
  - `uri`: must be a function whose input is the `context` passed to the middleware, and the output is the mongodb connection string, e.g. `mongodb://localhost:27017`
  - `options`: must be a function whose input is the `context` object passed to the middleware, and the output is the options object passed to `MongoClient.connect(uri, options)`
- output: the middleware function for lessware's `framework` usage.

## Example Usage
An API Controller using `connect` middlware.

```javascript
const { framework } = require('lessware')
const midmongo = require('lessware-mongo')

module.exports = framework([
  // attach mongo url from an async process
  async context => ({...context, mongoUrl: testConfig.mongoUrl}),
  // attach `context.mongo.client`
  midmongo.connect({
    uri: context => context.mongoUrl,
    options: context => context.config.mongo.options,
  }),
  // use `context.mongo.client`
  async context => {
    const result = await context.mongo.client
      .db('test')
      .collection('todo')
      .findOne({id: context.event.payload.id})

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    }
  }
])
```

# Maintainers

When buidling releases,
1. `npm test`
2. `git commit -m "your message"`
3. bump version 
   1. `npm version patch`
   2. `npm version minor`
4. `npm publish`
