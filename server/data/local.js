'use strict';

let restaurants = {},
	users = {},
	groups = {},
	votes = {},
	events = {},
	ballots = {},
	config = {
		0: {
			deadlineTime: '1145',
			id: 0
		}
	};

module.exports = {
	restaurants,
	users,
	groups,
	votes,
	events,
	ballots,
	config
};
