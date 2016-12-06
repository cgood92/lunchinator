'use strict';

const db = require('../data/db-helper'),
	boom = require('boom'),
	moment = require('moment'),
	perm = require('array-permutation');

const generateList = (limit, slowNumberAllowed) => {
	return new Promise((resolve, reject) => {
		db.select('restaurants').by().then((data) => {
			let slowNumberCount = 0,
				list = [];

			for (let randArray = perm.shuffle(data), i = randArray.length - 1; i >= 0 && list.length < limit; i--){
				const restaurant = randArray[i];
				if (restaurant.isSlow && slowNumberCount <= slowNumberAllowed) {
					continue;
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
	db.select('ballots').by({date: now}).then((data) => {
		if (data && data.length) {
			// Too late
			if (now24 >= data[0].deadlineTime) {
				return reply(boom.conflict());
			} else {
				return reply(perm.shuffle(data[0].list));
			}
		} else {
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
							onePmMeeting: false
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

const setCloseTime = (request, reply) => {
	const { time } = request.query,
		now = moment().format("YYYY-MM-DD");
	db.update('config').by().data((data) => {
		return Object.assign(data, {deadlineTime: time});
	}).then((data) => {
		db.update('ballots').by({date: now}).data((data) => {
			return Object.assign(data, { deadlineTime: time });
		}).then(() => {
			return reply();
		});
	});
};

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
