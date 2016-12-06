'use strict';

const db = require('../data/db-helper'),
	boom = require('boom'),
	moment = require('moment'),
	perm = require('array-permutation');

// Generates a random list of restaurants from the database
const generateList = (limit, slowNumberAllowed) => {
	return new Promise((resolve, reject) => {
		// Get all the restaurants
		db.select('restaurants').by().then((data) => {
			let slowNumberCount = 0,
				list = [];
			// Shuffle the array of restuarants, and loop through them until `list` is filled to `limit`
			for (let randArray = perm.shuffle(data), i = randArray.length - 1; i >= 0 && list.length < limit; i--){
				const restaurant = randArray[i];
				if (restaurant.isSlow) {
					// If we have reached the amount of slow restaurants allowed, then skip iteration
					if (slowNumberCount <= slowNumberAllowed) {
						continue;
					}
					slowNumberCount++;
				} 
				list.push(restaurant);
			}

			return resolve(list);
		});
	});
};

const get = (request, reply) => {
	const now = moment().format("YYYY-MM-DD"),
		now24 = moment().format("HHmm");
	// Get the ballot for today, if it's already been created, from db
	db.select('ballots').by({date: now}).then(([ballot]) => {
		// Ballot already created
		if (ballot) {
			// Too late
			if (now24 >= ballot.deadlineTime) {
				return reply(boom.conflict());
			} else {
				// Shuffle the list again
				return reply(perm.shuffle(ballot.list));
			}
		}
		// Ballot has not been created yet, so create it
		else {
			db.select('config').by().then(([config]) => {
				// Too late
				if (config.deadlineTime && now24 >= config.deadlineTime) {
					return reply(boom.conflict());
				} else {
					// Create a new ballot
					generateList(5, 2).then((list) => {
						let ballot = {
							list,
							date: now,
							deadlineTime: config.deadlineTime,
							onePmMeeting: false,
							closed: false
						};
						db.insert('ballots').data(ballot).then((data) => {
							return reply(data.list);
						});
					});
				}
			});
		}
	});
};

// Set a new time to close poll
const setCloseTime = (request, reply) => {
	const { time } = request.query,
		now = moment().format("YYYY-MM-DD");
	// Update global config
	db.update('config').by().data((data) => {
		return Object.assign(data, {deadlineTime: time});
	}).then((data) => {
		// Update all the ballots
		db.update('ballots').by({date: now, closed: false}).data((data) => {
			return Object.assign(data, { deadlineTime: time });
		}).then(() => {
			return reply();
		});
	});
};

// Deletes all the ballots and votes created for today
const resetToday = (request, reply) => {
	const now = moment().format("YYYY-MM-DD");
	Promise.all([
		db.delete('ballots').by({date: now}),
		db.delete('votes').by({date: now})
	]).then(() => {
		return reply();
	});
};

module.exports = {
	get,
	setCloseTime,
	resetToday
};
