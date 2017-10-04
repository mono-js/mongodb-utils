module.exports = {
	mono: {
		modules: [
			'@terrajs/mono-mongodb'
		],
		mongodb: {
			url: 'mongodb://localhost:27017/mongodb-util',
			dropDatabase: true
		}
	}
}
