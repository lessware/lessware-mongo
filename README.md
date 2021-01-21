# lessware-mongo
mongo middleware for the lessware framework

## Install
`npm i -S lessware-mongo`

## API
`connect` a function that returns the middleware function.
- input parameter: a configuration object, whose keys are functions that must synchronously return configuration properties
  - `uri`: a function whose input is the `context` passed to the middleware, and the output is the mongodb connection string, e.g. `mongodb://localhost:27017`
  - `options`: a function whose input is the `context` object passed to the middleware, and the output is the options object passed to `MongoClient.connect(uri, options)`
- output: the middleware function for lessware's `framework` usage.

## Example Usage
An API Controller using `connect` middleware.

```javascript
// -- findTodo.js --
const { framework } = require('lessware')
const { connect } = require('lessware-mongo')

module.exports = framework([

  // attach mongo url from some async process, e.g. fetch from secret store
  async context => ({...context, mongoUrl: 'mongodb://localhost:27017'}),

  // attach `context.mongo.client`
  connect({
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

// -- index.js --
const findTodo = require('./findTodo')
const router = {findTodo}

// persist connections setup by middleware
const mongo = {}

exports.handler = async (event, ctx) => {
  return controller = router[event.fieldName]

  // pass the context object to the framework
  return controller({event, ctx, mongo})
}
```

# Maintainers

When buidling releases,
1. `npm test`
2. `git checkout -b feature-branch`
3. `git commit -m "your message"`
4. bump version 
   1. `npm version patch`
   2. `npm version minor`
5. `git push -u origin feature-branch`
6. submit merge request
7. maintainer merge, then `npm publish`
