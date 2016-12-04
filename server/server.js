'use strict';

const Hapi = require('hapi'),
	Inert = require('inert'),
	Vision = require('vision'),
	HapiSwagger = require('hapi-swagger'),
	routes = require('./init/routes'),
	validateAuth = require('./modules/auth'),
	BasicAuth = require('hapi-auth-basic'),
	load = require('../instructions/load');

// For 'local' db only
load.loadUsers();
load.loadRestaurants();

const start = (host, port) => {
	const server = new Hapi.Server();
	server.connection({host,port});

	const swaggerPlugin = {
		register: HapiSwagger,
		options: {
			info: {
				title: 'Lunchinator documentation',
				version: '1.0.0'
			},
			documentationPath: '/'
		}
	};

	server.register([Inert, Vision, swaggerPlugin, BasicAuth], (err) => {
		// Basic HTTP auth
		server.auth.strategy('basic', 'basic', true, { validateFunc: validateAuth.validateBasic });

		server.start( (err) => {
			if (err) {
				console.log(err);
			} else {
				console.log(`Server running at: ${server.info.uri}`);
				server.route(routes.v1());
			}
		});
	});

};

module.exports = {
	start
};
