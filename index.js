'use strict';

const server = require('./server/server'),
	host = process.env.host || 'localhost',
	port = process.env.PORT || 3000;

module.exports = server.start(host, port);
