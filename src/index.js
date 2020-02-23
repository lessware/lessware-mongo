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

const defaultStoreWrite = (context, client) => {
  if (!context.mongo) {
    context.mongo = {}
  }
  context.mongo.client = client
}

const defaultStoreRead = (context) => (context.mongo && context.mongo.client)

exports.connect = ({
  uri,
  options=() => defaultOptions,
  store={write: defaultStoreWrite, read: defaultStoreRead},
}) => async context => {

  let client = store.read(context)
  if (!client || !client.isConnected()) {
    const newClient = await dbConnect(uri(context), options(context))
    store.write(context, newClient)
  }

  return context
}
