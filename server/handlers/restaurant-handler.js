'use strict';

const db = require('../data/db-helper'),
	boom = require('boom');

const getAll = (request, reply) => {
	db.select('restaurants').by().then((data) => {
		reply(data);
	});
};

const getById = (request, reply) => {
	const { id } = request.params;
	db.select('restaurants').by({id}).then(([restaurant]) => {
		if (restaurant) {
			return reply(restaurant);
		} else {
			return reply(boom.notFound());
		}
	});
};

const updateById = (request, reply) => {
	const { id } = request.params;
	const payload = request.payload;
	db.update('restaurants').by({id}).data(payload).then(([restaurant]) => {
		if (restaurant) {
			return reply(restaurant);
		} else {
			return reply(boom.notFound());
		}
	});
};

const deleteById = (request, reply) => {
	const { id } = request.params;
	db.delete('restaurants').by({id}).then(([restaurant]) => {
		if (restaurant) {
			return reply();
		} else {
			return reply(boom.notFound());
		}
	});
};

const insert = (request, reply) => {
	const payload = request.payload;
	db.insert('restaurants').data(payload).then((data) => {
		reply(data);
	});
};

module.exports = {
	getAll,
	getById,
	updateById,
	deleteById,
	insert
};
