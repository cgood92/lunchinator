'use strict';

const hapiAuthorization = require('hapi-authorization'),
	db = require('../data/db-helper'),
	bcrypt = require('bcrypt');

const getUser = (username) => {
	return new Promise((resolve, reject) => {
		if (username === undefined || username === null) {
			return resolve();
		}
		db.select('users').by({username}).then((user) => {
			if (user.length === 1) {
				return resolve(user[0]);
			} 
			return resolve();
		});
	});
};

// Log the bad attempt
const badAttempt = (username) => {
	console.log(`User '${username}' was rejected access...`);
};

const validateBasic = (req, username, password, cb) => {
	getUser(username).then((user) => {
		// No user - bad attempt
		if (!user) {
			badAttempt(username);
			return cb(null, false);
		}

		bcrypt.compare(password, user.password, (err, isValid) => {
			// Password is wrong - bad attempt
			if (err || !isValid) {
				badAttempt(username);
				return cb(null, false);
			} 
			// Password is correct - authorize
			else {
				// Expose these elements of the user
				const userExposed = {
					id: user.id,
					scope: user.scope
				};
				cb(err, isValid, userExposed);
			}
		});
	});
};

module.exports = {
	getUser,
	validateBasic
};
