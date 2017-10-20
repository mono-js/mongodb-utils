module.exports = {
	mono: {
		modules: [
			'mono-mongodb'
		],
		mongodb: {
			url: 'mongodb://localhost:27017/mongodb-utils',
			dropDatabase: true
		}
	}
}
