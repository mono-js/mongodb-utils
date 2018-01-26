const { ObjectID } = require('mongodb')

function getQueryFromArguments(query) {
	if (typeof query === 'string' || query instanceof ObjectID) return { _id: ObjectID(query) }
	return query
}

module.exports = function (mongoCollection) {
	if (!mongoCollection || !mongoCollection.findOne) throw new Error('no-mongo-collection-provided')

	mongoCollection.utils = {
		// Documentation https://github.com/terrajs/mongodb-utils#get
		get: function (query, fields) {
			if (Array.isArray(fields)) {
				const _fields = fields
				fields = {}
				_fields.forEach((field) => fields[field] = 1)
			}
			return mongoCollection.findOne(getQueryFromArguments(query), { fields })
		},
		// Documentation https://github.com/terrajs/mongodb-utils#create
		create: async function (doc) {
			doc.createdAt = new Date()
			doc.updatedAt = new Date()

			await mongoCollection.insertOne(doc)

			return doc
		},
		// Documentation https://github.com/terrajs/mongodb-utils#update
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
		// Documentation https://github.com/terrajs/mongodb-utils#upsert
		upsert: async function (query, doc) {
			doc.updatedAt = new Date()

			const set = {
				$set: doc,
				$setOnInsert: {
					createdAt: new Date()
				}
			}

			const result = await mongoCollection.findOneAndUpdate(getQueryFromArguments(query), set, {
				returnOriginal: false,
				upsert: true
			})

			return result.value
		},
		// Documentation https://github.com/terrajs/mongodb-utils#remove
		remove: async function (query) {
			const result = await mongoCollection.deleteOne(getQueryFromArguments(query))

			return !!result.deletedCount
		},
		// Documentation https://github.com/terrajs/mongodb-utils#find
		find: function (query, options) {
			const cursor = mongoCollection.find(getQueryFromArguments(query))

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
