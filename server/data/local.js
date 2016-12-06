'use strict';

let restaurants = {},
	users = {},
	// Not used yet
	groups = {},
	votes = {},
	ballots = {},
	config = {
		0: {
			// Default deadline time: 11:45am
			deadlineTime: '1145',
			id: 0
		}
	};

module.exports = {
	restaurants,
	users,
	groups,
	votes,
	ballots,
	config
};
