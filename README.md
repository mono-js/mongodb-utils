<h1 align="left"><img src="https://user-images.githubusercontent.com/904724/31862915-8a718272-b746-11e7-912f-9ad658a96907.png" alt="MongoDB Utils"/></h1>

> MongoDB utils for Node.js

[![npm version](https://img.shields.io/npm/v/mongodb-utils.svg)](https://www.npmjs.com/package/mongodb-utils)
[![Travis](https://img.shields.io/travis/terrajs/mongodb-utils/master.svg)](https://travis-ci.org/terrajs/mongodb-utils)
[![Coverage](https://img.shields.io/codecov/c/github/terrajs/mongodb-utils/master.svg)](https://codecov.io/gh/terrajs/mongodb-utils.js)
[![license](https://img.shields.io/github/license/terrajs/mongodb-utils.svg)](https://github.com/terrajs/mongodb-utils/blob/master/LICENSE)

## Installation

```bash
npm install --save mongodb-utils
```

## Usage

MongoDB utils overide the `collection` class by adding an `utils` object that will expose all the MongoDB utils methods:

```js
const mongoUtils = require('mongodb-utils')

const collection = mongoUtils(db.collection('users'))

// We can now access to mongodb-utils method from .utils
const user = await collection.utils.get({ usermane: 'terrajs' })
```

## Methods

- [get](#get)
- [create](#create)
- [update](#update)
- [upsert](#upsert)
- [remove](#remove)
- [find](#find)

### get

```js
get(query = { key: value } || string || ObjectID, [fields]): Promise<doc>
```

Return a document that match the specific identifier (`_id` by default) or the query:

```js
// Get the document that match the query { _id: ObjectID('59c0de2dfe8fa448605b1d89') }
collection.utils.get('59c0de2dfe8fa448605b1d89')

// Get the document that match the query { username: 'terrajs' }
collection.utils.get({ username: 'terrajs' })

// Get the document that match the query & return only its _id
collection.utils.get({ username: 'terrajs' }, { _id: 1 })
// Get the document that match the query & return only its _id (works with array too)
collection.utils.get({ username: 'terrajs' }, ['_id'])
```

### create

```js
create(doc: object): Promise<doc>
```

Insert a document into the collection and add `createdAt` and `updatedAt` properties:

```js
// Add a document into the collection and return the created document
const user = await collection.utils.create({ username: 'terrajs' })
```

### update

```js
update(query = { key: value } || string || ObjectID, doc: object): Promise<doc>
```

Update a specific document and update the `updatedAt` value

```js
// Update the document that match the query { _id: ObjectID('59c0de2dfe8fa448605b1d89') } and update its username
await collection.utils.update('59c0de2dfe8fa448605b1d89', { username: 'terrajs2' })

// Update the document that match the query { username: 'terrajs2' } and update its username
await collection.utils.update({ username: 'terrajs2' }, { username: 'terrajs' })
```

### upsert

```js
upsert(query = { key: value } || string || ObjectID, doc: object): Promise<doc>
```

Update or create a document if not exist
Add the `createdAt` if document not exist

```js
// Update the document that match the query { _id: ObjectID('59c0de2dfe8fa448605b1d89') } and update its username or create it if not exist
await collection.utils.upsert('59c0de2dfe8fa448605b1d89', { username: 'terrajs2' })

// Update the document that match the query { username: 'terrajs2' } and update its username OR create it if not found
await collection.utils.upsert({ username: 'terrajs2' }, { username: 'terrajs' })
```

### remove

```js
remove(query = { key: value } || string || ObjectID): Promise<boolean>
```

Remove a document that match the specific identifier (`_id` by default) or the query:

```js
// Remove the document that match the query { _id: ObjectID('59c0de2dfe8fa448605b1d89') }
const result = collection.utils.remove('59c0de2dfe8fa448605b1d89')

// Remove the document that match the query { username: 'test' }
collection.utils.remove({ username: 'test' })
```

### find

```js
find(query = { key: value } || string || ObjectID, [options = { fields: ..., limit: ..., offset: ..., sort: ... }]): cursor
```
The find method return a mongo cursor from a specific query and options.

Options:
  - `fields`: Array of keys (`['username', ...]`) to return **OR** a MongoDB projection (`{ field1: 1, ... }`), default: `{}`
  - `limit`: Nb of docs to return, no limit by default
  - `offset`: Nb of docs to skpi, default: `0`
  - `sort`: Sort criteria (same as `sort` method from mongo cursor), default: `{}`

```js
// Find documents that matches the query { username: new RegExp(/^test/g) }, options with { username: 1, createdAt: 1 } projection and limit at 10 elements
const users = await userCollection.mono.find({
  username: new RegExp(/^test/g)
}, {
  fields: ['username', 'createdAt'],
  limit: 10
}).toArray()
```
