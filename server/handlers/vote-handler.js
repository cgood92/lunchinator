'use strict';

const db = require('../data/db-helper'),
	boom = require('boom'),
	moment = require('moment');

const submit = (request, reply) => {
	const now = moment().format("YYYY-MM-DD"),
		now24 = moment().format("HHmm"),
		{ id, onePmMeeting } = request.query;
	// Get the ballot to see what time it closes
	db.select('ballots').by({date: now}).then(([ballot]) => {
		if (ballot && ballot.deadlineTime && now24 >= ballot.deadlineTime) {
			return reply(boom.conflict());
		} else {
			db.insert('votes').data({
				restaurantId: id,
				onePmMeeting,
				date: now,
				ballotId: ballot.id,
				userId: null
			}).then((data) => {
				if (onePmMeeting == true) {
					db.update('ballots').by({id: ballot.id}).data((data) => {
						return Object.assign(data, { onePmMeeting: true });
					}).then(() => {
						return reply();
					});
				} else {
					return reply();
				}
			});
		}
	});
};

module.exports = {
	submit
};
