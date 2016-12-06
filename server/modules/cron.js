'use strict';

const schedule = require('node-schedule'),
	tweet = require('./tweet'),
	moment = require('moment'),
	db = require('../data/db-helper');

const scheduleJob = () => {
	schedule.scheduleJob('*/2 * * * *', () => {
		cycleEvents();
	});
};

const sendMessage = (msg, next) => {
	return tweet.send(msg, next);
};

// Returns a promise
const decideRestaurant = (votes = []) => {
	// Come up with an object that counts the tallies per restaurant
	const map = votes.reduce((acc, {restaurantId}) => {
		acc[restaurantId] = (acc[restaurantId]) ? acc[restaurantId]+1 : 1;
		return acc;
	}, {});
	// Find the highest restaurant vote
	const highest = Object.keys(map).reduce((highest, restaurantId) => {
		if (map[restaurantId] > highest.count) {
			return {
				restaurantId,
				count: map[restaurantId]	
			};
		} else {
			return highest;
		}
	}, {count: 0});
	return db.select('restaurants').by({id: highest.restaurantId});
};

const closeBallot = (ballot) => {
	return new Promise((resolve, reject) => {
		db.select('votes').by({ballotId: ballot.id}).then((votes) => {
			// TODO: to be used in 2.0
			const userIds = votes.map((vote) => vote.userId);
			decideRestaurant(votes).then(([restaurant]) => {
				let messages = [];
				// If there was a restaurant chosen
				if (restaurant) {
					messages.push(`Where to for lunch? ${restaurant.name}!`);
					// If there's an early meeting
					if (ballot.onePmMeeting) {
						messages.push('Better hurry!!');
					}
				} 
				// No votes
				else {
					messages.push('Good luck with lunch today.');
				}
				db.update('ballots').by({id: ballot.id}).data((data) => {
					return Object.assign(data, {closed: true});
				}).then(() => {
					sendMessage(messages.join(' '), resolve);
				});
			});
		});
	});
};

const cycleEvents = () => {
	return new Promise((resolve, reject) => {
		const now = moment().format("YYYY-MM-DD"),
			now24 = moment().format("HHmm");
		db.select('ballots').by({closed: false, date: now}).then((ballots) => {
			Promise.all(
				ballots
					.filter((ballot) => (now24 >= ballot.deadlineTime))
					.map((ballot) => closeBallot(ballot))
			).then((messages) => {
				resolve(messages);
			});
		});
	});
};

module.exports = {
	scheduleJob,
	cycleEvents
};
