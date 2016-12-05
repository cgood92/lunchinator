'use strict';

/*
This can be replaced, swapped in and out for whatever database you want to connect to.  The resulting db-helper must expose at least 4 promise-functions called select, insert, update, remove, which functions have the interface (entity, qualifiers, [data]).  For instance, if you wanted to hook up firebase, create a fb-helper.js with the interface defined above, which may interact with a fb.js as the database object.

For this example, our database will be called "local", since it's stored locally
*/
let localDB = require('./local-helper');

// What gets returned here will be a promise
const data = (action, entity, qualifiers) => {
	return (data) => {
		return localDB[action](entity, qualifiers, data);
	};
};

const by = (action, entity) => {
	return (qualifiers) => {
		switch (action) {
			// No more further digging
			case 'select':
			case 'delete':
				return data(action, entity, qualifiers)();

			// Need more data
			case 'insert':
			case 'update':
				return {
					data: data(action, entity, qualifiers)
				};
		}
	};
};

const action = (action, entity) => {
	switch(action) {
		// Inserts cannot specify qualifiers
		case 'insert':
			return by(action, entity)();
		default: 
			return {
				by: by(action, entity)
			};
	}
};

const select = (entity) => {
	return action('select', entity);
};

const insert = (entity) => {
	return action('insert', entity);
};

const update = (entity) => {
	return action('update', entity);
};

const deleteFunction = (entity) => {
	return action('delete', entity);
};

module.exports = {
	select, insert, update, 'delete': deleteFunction
};
