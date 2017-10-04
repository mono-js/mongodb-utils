const { ObjectID, Collection } = require('mongodb')

function getQueryFromArguments(query) {
	if (typeof query === 'string' || query instanceof ObjectID) return { _id: ObjectID(query) }
	return query
}

module.exports = function (mongoCollection) {
	if (!(mongoCollection instanceof Collection)) throw new Error('no-mongo-collection-provided')

	mongoCollection.utils = {
		get: function (query) {
			return mongoCollection.findOne(getQueryFromArguments(query))
		},
		create: async function (doc) {
			doc.createdAt = new Date()
			doc.updatedAt = new Date()

			await mongoCollection.insertOne(doc)

			return doc
		},
		update: async function (query, doc) {
			doc.updatedAt = new Date()

			const set = {
				$set: doc
			}

			const result = await mongoCollection.findOneAndUpdate(getQueryFromArguments(query), set, {
				returnOriginal: false
			})

			return result.value
		},
		remove: async function (query) {
			const result = await mongoCollection.deleteOne(getQueryFromArguments(query))

			return !!result.deletedCount
		},
		find: function (query, options) {
			const cursor = mongoCollection.find(query)

			options = options || {}
			if (Array.isArray(options.fields)) {
				const fields = options.fields
				options.fields = {}
				fields.forEach((field) => options.fields[field] = 1)
			}
			if (options.fields && Object.keys(options.fields).length) cursor.project(options.fields)
			if (options.limit) cursor.limit(options.limit)
			if (options.offset) cursor.skip(options.offset)
			if (options.sort) cursor.sort(options.sort)

			return cursor
		}
	}

	return mongoCollection
}
