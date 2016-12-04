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
			handler: handlers.restaurants.getAll,
			description: 'Gets all restaurants',
			auth: {
				scope: ['ADMIN']
			}
		}),
		makeRoute('GET', '/restaurants/{id}', version, {
			handler: handlers.restaurants.getById,
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
			handler: handlers.restaurants.updateById,
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
			handler: handlers.restaurants.deleteById,
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
			handler: handlers.restaurants.insert,
			description: 'Inserts a new restaurant',
			auth: {
				scope: ['ADMIN']
			}
		})
	];
};

module.exports = {
	v1
};
