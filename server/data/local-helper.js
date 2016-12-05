'use strict';

let local = require('./local');

// Data from db should NEVER be changed by code, except by calling an interface here
const immutability = (data) => JSON.parse(JSON.stringify(data));

// Returns an array of objects that match the qualifier in the branch
const findByQualifier = (branch = {}, qualifiers = {}) => {
	return Object.keys(branch)
		// Filter by all key/value pairs in qualifiers matching db item
		.filter((item) => {
			const entry = branch[item];
			return Object.keys(qualifiers).every((i) => {
				return qualifiers[i] == entry[i];
			});
		// Return the actual item.  Running two loops (filter & map) in favor of one loop for sake of code readability.  If data size was bigger, I would do it in one loop.
		}).map((i) => {
			return branch[i];
		});
};

// Returns an array of all entity-type that matches the qualifiers
const select = (entity, qualifiers, ignoreThisParam) => {
	return new Promise((resolve, reject) => {
		const branch = local[entity];
		if (branch) {
			return resolve(immutability(findByQualifier(branch, qualifiers)));
		}
		return resolve();
	});
};

// Returns the nodes that were inserted
const insert = (entity, ignoreThisParam, data) => {
	return new Promise((resolve, reject) => {
		let branch = local[entity];
		if (!branch) {
			branch = {};
		}

		var id = Object.keys(branch).length;

		// Insert/replace database entity ID
		data.id = id;

		// Insert
		branch[id] = data;

		// Return what was inserted
		return resolve(immutability(data));
	});
};

/* 
	Returns the nodes that were updated
	Note: data can be either actual data, or it can be a function, which accepts the data object as a parameter, and updates by what is returned from that function.
*/
const update = (entity, qualifiers, data) => {
	return new Promise((resolve, reject) => {
		let branch = local[entity],
			entries = findByQualifier(branch, qualifiers);

		if (entries) {
			entries = entries.map((entry) => {
				const { id } = entry;
				if (typeof data === 'function') {
					// Let passed in function take care of what to replace
					return Object.assign(data(entry), {id});
				} else {
					/* This peice was driving me a little crazy.  Originally, I had this as Object.assign(entry, data, {id}), and it was working fine.  Then, I decided I wanted the update (with data that is not a function) to replace the whole node, and node keep any original properties.  In order to have things work with value by references (updating the `local` object), the followig line is necessary... */
					Object.keys(entry).forEach((key) => delete entry[key]);
					return Object.assign(entry, data, {id});
				}
			});
			return resolve(immutability(entries));
		} 
		return resolve();
	});
};

// Returns the nodes that were deleted
const deleteFunction = (entity, qualifiers, data) => {
	return new Promise((resolve, reject) => {
		let branch = local[entity],
			entries = findByQualifier(branch, qualifiers);

		if (entries) {
			// Grab before we delete
			const toSendBack = immutability(entries);
			entries.forEach((entry) => {
				/* Due to strict mode, cannot use simply `delete entry`
				See: http://stackoverflow.com/questions/16652589/why-is-delete-not-allowed-in-javascript5-strict-mode
				*/
				delete branch[entry.id];
			});
			return resolve(toSendBack);
		} 
		return resolve();
	});
};

module.exports = {
	select, insert, update, 'delete': deleteFunction
};
