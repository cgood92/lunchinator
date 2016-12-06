'use strict';

const joi = require('joi'),
	handlers = require('../handlers');

const base = '/api';

const makeRoute = (method, path, version, config) => {
	config.tags = ['api'];
	return {
		method,
		path: require('path').join('/', base, version, path),
		config
	};
};

const v1 = () => {
	// TODO: after code review, version with `/v1`
	const version = '';
	return [
		makeRoute('GET', '/restaurants', version, {
			handler: handlers.restaurant.getAll,
			description: 'Gets all restaurants',
			auth: {
				scope: ['ADMIN']
			}
		}),
		makeRoute('GET', '/restaurants/{id}', version, {
			handler: handlers.restaurant.getById,
			description: 'Gets restaurant by id',
			auth: {
				scope: ['ADMIN']
			},
			validate: {
				params: {
					id: joi.number().integer().min(0).required().description('the id of the restaurant')
				}
			}
		}),
		makeRoute('PUT', '/restaurants/{id}', version, {
			handler: handlers.restaurant.updateById,
			description: 'Updates a restaurant by id',
			auth: {
				scope: ['ADMIN']
			},
			validate: {
				params: {
					id: joi.number().integer().min(0).required().description('the id of the restaurant')
				}
			}
		}),
		makeRoute('DELETE', '/restaurants/{id}', version, {
			handler: handlers.restaurant.deleteById,
			description: 'Deletes a restaurant by id',
			auth: {
				scope: ['ADMIN']
			},
			validate: {
				params: {
					id: joi.number().integer().min(0).required().description('the id of the restaurant')
				}
			}
		}),
		makeRoute('POST', '/restaurants', version, {
			handler: handlers.restaurant.insert,
			description: 'Inserts a new restaurant',
			auth: {
				scope: ['ADMIN']
			}
		}),
		makeRoute('GET', '/ballot', version, {
			handler: handlers.ballot.get,
			description: 'Get\s a voting ballot'
		}),
		makeRoute('POST', '/vote', version, {
			handler: handlers.vote.submit,
			description: 'Post a vote',
			validate: {
				query: {
					id: joi.number().integer().min(0).required().description('the id of the restaurant'),
					onePmMeeting: joi.boolean().truthy(['true']).default(false).description('indicates if the user has a 1:00pm meeting or not')
				}
			}
		}),
		makeRoute('POST', '/voting-closes', version, {
			handler: handlers.ballot.setCloseTime,
			description: 'Change the voting close time',
			validate: {
				query: {
					time: joi.required().description('24-hour time string (ie 1330)')
				}
			}
		}),
		makeRoute('POST', '/tomorrow', version, {
			handler: handlers.ballot.resetToday,
			description: 'Reset the voting for today'
		})
	];
};

module.exports = {
	v1
};
