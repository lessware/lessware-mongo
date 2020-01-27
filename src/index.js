const {MongoClient} = require('mongodb')

const defaultOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

const dbConnect = async (url, options) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, options, (err, client) => {
      if (err) {
        return reject(err)
      }
      resolve(client)
    })
  })
}

exports.connect = ({uri, options=() => defaultOptions}={}) => async context => {
  if (!context.mongo) {
    context.mongo = {}
  }

  if (!context.mongo.client || !context.mongo.client.isConnected()) {
    context.mongo.client = await dbConnect(uri(context), options(context))
  }

  return context
}
