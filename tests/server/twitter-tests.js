const cron = require('../../server/modules/cron'),
	should = require('should'),
	request = require('request'),
	server = require('../../index');

const authUser = 'david',
	authPassword = 'password3',
	baseUrl = 'http://localhost:9999';

describe('Testing the cron job to cycle through open ballots', () => {
	it('Testing cycleEvents', (done) => {
		// Don't start testing this first test until server has been loaded fully.  Only necessay once
		server.then(() => {
			// First, enable a late deadline for voting
			request.post({
				url: `${baseUrl}/api/voting-closes?time=2399`,
				json: true
			}, (err, response, body) => {
				// Second, create a ballot
					request.get({
						url: `${baseUrl}/api/ballot`,
						json: true
					}, (err, response, body) => {
						// Third, cast a vote
						request.post({
							url: `${baseUrl}/api/vote?id=8&onePmMeeting=true`,
							json: true
						}, (err, response, body) => {
							// Fourth, close deadline for voting
							request.post({
								url: `${baseUrl}/api/voting-closes?time=0001`,
								json: true
							}, (err, response, body) => {
								// Fifth, cycle through events
								cron.cycleEvents().then((tweets) => {
									should(tweets.length).be.greaterThan(0);
									done();
								});
							}).auth(authUser, authPassword);
						}).auth(authUser, authPassword);
					}).auth(authUser, authPassword);
			}).auth(authUser, authPassword);
		});
	});
});
