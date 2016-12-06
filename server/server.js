'use strict';

const Hapi = require('hapi'),
	Inert = require('inert'),
	Vision = require('vision'),
	HapiSwagger = require('hapi-swagger'),
	routes = require('./init/routes'),
	validateAuth = require('./modules/auth'),
	BasicAuth = require('hapi-auth-basic'),
	load = require('../instructions/load');

// This promise will resolve when server is started and database loaded
const start = (host, port) => {
	return new Promise((resolve, reject) => {
		const server = new Hapi.Server();
		server.connection({host,port});

		// Setup swagger
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
					reject(err);
				} else {
					console.log(`Server running at: ${server.info.uri}`);
					// Init routes
					server.route(routes.v1());
					// Load the database
					Promise.all([
						load.loadUsers(),
						load.loadRestaurants()
					]).then(() => {
						resolve();
					});
				}
			});
		});
	});
};

module.exports = {
	start
};
