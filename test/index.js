const test = require('ava')

const { join } = require('path')

const { start, stop } = require('@terrajs/mono-test-utils')

const mongoUtils = require('../lib')

const { ObjectID } = require('mongodb')

const mongoModule = require('@terrajs/mono-mongodb')

let ctx
let userCollection
let users = [{
	username: 'test',
	order: 2
}, {
	username: 'test2',
	order: 1
}]

function omit(obj, fields) {
	return Object.keys(obj)
		.filter((key) => fields.indexOf(key) < 0)
		.reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {})
}

test('Should fail if no collection is passed to the constructor', async (t) => {
	ctx = await start(join(__dirname, '/fixtures/ok/'))

	const error = t.throws(() => mongoUtils())

	t.is(error.message, 'no-mongo-collection-provided')

	stop(ctx.server)
})

test('Should fail if not a mongodb collection is passed to the constructor', async (t) => {
	ctx = await start(join(__dirname, '/fixtures/ok/'))

	const error = t.throws(() => mongoUtils({}))

	t.is(error.message, 'no-mongo-collection-provided')

	stop(ctx.server)
})

test('Starting mono and check mongoUtils instance', async (t) => {
	ctx = await start(join(__dirname, '/fixtures/ok/'))

	userCollection = mongoUtils(mongoModule.db.collection('users'))
	t.true(userCollection.utils instanceof Object)
})

test('utils.create should create a new document', async (t) => {
	t.true(userCollection.utils.create instanceof Function)

	const user = await userCollection.utils.create(users[0])
	const user2 = await userCollection.utils.create(users[1])

	t.deepEqual(users[0], user)
	t.deepEqual(users[1], user2)
	t.true(users[0].createdAt instanceof Date)
	t.true(users[0].updatedAt instanceof Date)
	t.true(users[0]._id instanceof ObjectID)

	Object.assign(users[0], user)
	Object.assign(users[1], user2)
})

test('mono.get should return a document', async (t) => {
	t.true(userCollection.utils.get instanceof Function)

	const user = await userCollection.utils.get({ 'username': users[0].username })
	const user2 = await userCollection.utils.get(users[1]._id)

	t.deepEqual(user, users[0])
	t.deepEqual(user2, users[1])
})

test('mono.get should return a document with only specified fields (Mongo style)', async (t) => {
	const user = await userCollection.utils.get({ 'username': users[0].username }, { _id: 1 })

	t.deepEqual(Object.keys(user), ['_id'])
})

test('mono.get should return a document with only specified fields (Array style)', async (t) => {
	const user = await userCollection.utils.get({ 'username': users[0].username }, ['_id'])

	t.deepEqual(Object.keys(user), ['_id'])
})

test('utils.update should return an updated document', async (t) => {
	t.true(userCollection.utils.update instanceof Function)

	users[0].username = 'test3'
	const updatedAt = users[0].updatedAt
	const originalUser = omit(users[0], ['updatedAt'])

	let user = await userCollection.utils.update(users[0]._id, { username: users[0].username })

	const newUpdatedAt = user.updatedAt
	const updatedUser = omit(user, ['updatedAt'])

	t.deepEqual(originalUser, updatedUser)
	t.not(+updatedAt, +newUpdatedAt)
	t.is(+originalUser.createdAt, +updatedUser.createdAt)
})

test('utils.find with specific query and no options document(s)', async (t) => {
	t.true(userCollection.utils.find instanceof Function)

	const request = await userCollection.utils.find({
		username: new RegExp(/^test/g)
	})

	let result = await request.toArray()

	t.is(result.length, 2)
})

test('utils.find with specific query and pagination document(s)', async (t) => {
	t.true(userCollection.utils.find instanceof Function)

	const request = await userCollection.utils.find({
		username: new RegExp(/^test/g)
	}, { limit: 1, offset: 1 })

	let result = await request.toArray()

	t.is(result.length, 1)
	t.is(result[0].username, users[1].username)
})

test('utils.find with specific query and sorted by order', async (t) => {
	t.true(userCollection.utils.find instanceof Function)

	const request = await userCollection.utils.find({
		username: new RegExp(/^test/g)
	}, { sort: { order: 1 } })

	let result = await request.toArray()

	t.is(result.length, 2)
	t.is(result[0].username, users[1].username)
})

test('utils.find with object fields should return a specific document(s)', async (t) => {
	t.true(userCollection.utils.find instanceof Function)

	const request = await userCollection.utils.find({
		username: new RegExp(/^test/g)
	}, { fields: { updatedAt: 0 }, limit: 1 })

	let result = await request.toArray()

	t.is(result.length, 1)
	t.is(Object.keys(result[0]).length, 4)
	t.is(result[0].username, users[0].username)
	t.is(+result[0].createdAt, +users[0].createdAt)
})

test('utils.find with array fields should return a specific document(s)', async (t) => {
	t.true(userCollection.utils.find instanceof Function)

	const request = await userCollection.utils.find({
		username: new RegExp(/^test/g)
	}, { fields: ['updatedAt'], limit: 1 })

	let result = await request.toArray()

	t.is(result.length, 1)
	t.is(Object.keys(result[0]).length, 2)
	t.not(+result[0].updatedAt, +users[0].updatedAt)
})

test('utils.remove should remove a document', async (t) => {
	t.true(userCollection.utils.remove instanceof Function)

	const request = await userCollection.utils.remove(users[0]._id)
	t.is(request, true)

	const exists = await userCollection.utils.get(users[0]._id)
	t.is(exists, null)
})

test.after('We close mono server', () => {
	stop(ctx.server)
})

