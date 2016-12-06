'use strict';

const Twitter = require('twitter'),
	// Not committed, just here locally
	creds = require('./twitterCreds.json'),
	client = new Twitter({
		consumer_key: creds.TWITTER_CONSUMER_KEY,
		consumer_secret: creds.TWITTER_CONSUMER_SECRET,
		access_token_key: creds.TWITTER_ACCESS_TOKEN_KEY,
		access_token_secret: creds.TWITTER_ACCESS_TOKEN_SECRET
	});

const send = (msg, next) => {
	client.post('statuses/update', {status: msg},  function(error, tweet, response) {
		if(error) {
			throw error;
		}
		next(tweet);
	});
};

module.exports = {
	send
};
