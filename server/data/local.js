'use strict';

let restaurants = {},
	users = {},
	groups = {},
	votes = {},
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
	ballots,
	config
};
