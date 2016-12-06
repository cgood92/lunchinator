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
		// If it's closed already
		if (ballot && ballot.deadlineTime && now24 >= ballot.deadlineTime) {
			return reply(boom.conflict());
		} else {
			const voteToInsert = {
				restaurantId: id,
				onePmMeeting,
				date: now,
				ballotId: ballot.id,
				userId: request.auth.credentials.id
			};
			// Check to see if a vote by this user for this ballot already exists
			db.select('votes').by({ballotId: voteToInsert.ballotId, userId: voteToInsert.userId}).then(([vote]) => {
				let promise;
				// If user has already voted, update
				if (vote) {
					promise = db.update('votes').by({id: vote.id}).data(voteToInsert);
				}
				// Or create a new vote
				else {
					promise = db.insert('votes').data(voteToInsert);
				}
				return promise.then((data) => {
						// Since the user may not longer have a 1:00pm meeting ANYMORE, take that into account
						db.update('ballots').by({id: ballot.id}).data((data) => {
							return Object.assign(data, { onePmMeeting: (onePmMeeting == true) });
						}).then(() => {
							return reply();
						});
					});
			});
		}
	});
};

module.exports = {
	submit
};
