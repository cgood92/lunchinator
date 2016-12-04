'use strict';

const local = require('./local');

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

// Returns the nodes that were updated
const update = (entity, qualifiers, data) => {
	return new Promise((resolve, reject) => {
		let branch = local[entity],
			entries = findByQualifier(branch, qualifiers);

		if (entries) {
			entries = entries.map((entry) => {
				const { id } = entry;
				// Overwrite entry props with data props, and id shouldn't be overwritten
				return Object.assign(entry, data, {id});
			});
			return resolve(immutability(entries));
		} 
		return resolve();
	});
};

// Returns the nodes that were deleted
const remove = (entity, qualifiers, data) => {
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
	select, insert, update, remove
};
