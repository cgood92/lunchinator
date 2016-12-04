'use strict';

const bcrypt = require('bcrypt'),
	CSVConverter = require("csvtojson").Converter,
	db = require('../server/data/db-helper');


const loadUsers = () => {
	const csv = new CSVConverter({
		headers: ['username','password','scope']
	});
	csv.fromFile('./instructions/users.csv', (err,result) => {
		Promise.all(result.map((user) => {
			return new Promise((resolve, reject) => {
				// Hash the password
				bcrypt.hash(user.password, 10 /* SALT */, (err, hash) => {
					db.insert('users').data({
						username: user.username,
						password: hash,
						scope: user.scope
					}).then(() => {
						resolve();
					});
				});
			});
		})).then(() => {
			console.log('Users have been loaded');
		});
	});
};

const loadRestaurants = () => {
	const csv = new CSVConverter({
		headers: ['id','name']
	});
	csv.fromFile('./instructions/restaurants.csv', (err,result) => {
		Promise.all(result.map((restaurant) => {
			return new Promise((resolve, reject) => {
				db.insert('restaurants').data({
					name: restaurant.name
				}).then(() => {
					resolve();
				});
			});
		})).then(() => {
			console.log('Restaurants have been loaded');
		});
	});
};

module.exports = {
	loadUsers,
	loadRestaurants
};
