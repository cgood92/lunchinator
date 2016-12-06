'use strict';

const server = require('./server/server'),
	host = process.env.host || 'localhost',
	port = process.env.PORT || 3000;

if (!process.env.TESTING) {
	require('./server/modules/cron').scheduleJob();
}

module.exports = server.start(host, port);
