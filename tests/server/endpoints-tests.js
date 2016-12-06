const should = require('should'),
	request = require('request'),
	server = require('../../index');

const authUser = 'amber',
	authPassword = 'password0',
	baseUrl = 'http://localhost:9999';

describe('Testing v1', () => {
	describe('Testing the endpoints', () => {

		describe('Testing endpoint GET /api/restaurants', () => {
			it('Fetching restaurants', (done) => {
				// Don't start testing this first test until server has been loaded fully.  Only necessay once
				server.then(() => {
					request.get({
						url: `${baseUrl}/api/restaurants`,
						json: true
					}, (err, response, body) => {
						should.not.exist(err);
						should(response.statusCode).equal(200);
						should(body.length).greaterThan(1);

						done();
					}).auth(authUser, authPassword);
				});
			});

			it('Fetching restaurants with non-admin user (should forbid)', (done) => {
				request.get({
					url: `${baseUrl}/api/restaurants`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).not.equal(200);

					done();
				}).auth('george', 'password6');
			});
		});

		describe('Testing endpoint POST /api/restaurants', () => {
			it('Posting a new restaurant', (done) => {
				const formData = {
					name: 'Burger King'
				};
				request.post({
					url: `${baseUrl}/api/restaurants`,
					json: true,
					formData
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).equal(200);
					should(body.name).equal(formData.name);
					should.exist(body.id);

					done();
				}).auth(authUser, authPassword);
			});

			// 111111111 should not exist before this test.....
			it('Posting a new restaurant with ID (sould ignore ID)', (done) => {
				const formData = {
					id: 111111111,
					name: 'Burger King'
				};
				request.post({
					url: `${baseUrl}/api/restaurants`,
					json: true,
					formData
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).equal(200);
					should(body.name).equal(formData.name);
					should(body.id).should.not.equal(formData.id);

					done();
				}).auth(authUser, authPassword);
			});
		});

		describe('Testing endpoint PUT /api/restaurants/{id}', () => {
			it('Updating a restaurant', (done) => {
				const formData = {
					name: 'Cool new name'
				};
				request.put({
					url: `${baseUrl}/api/restaurants/3`,
					json: true,
					formData
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).equal(200);
					should(body.name).equal(formData.name);

					done();
				}).auth(authUser, authPassword);
			});

			it('Checking to see that restaurant was updated', (done) => {
				request.get({
					url: `${baseUrl}/api/restaurants/3`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).equal(200);
					should(body.name).equal('Cool new name');

					done();
				}).auth(authUser, authPassword);
			});

			it('Updating a restaurant with ID (should ignore ID)', (done) => {
				const formData = {
					id: 99999999,
					name: 'Cool new name'
				};
				request.put({
					url: `${baseUrl}/api/restaurants/3`,
					json: true,
					formData
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).equal(200);
					should(body.name).equal(formData.name);
					should(body.id).should.not.equal(formData.id);

					done();
				}).auth(authUser, authPassword);
			});

			it('Updating a restaurant that does not exist', (done) => {
				const formData = {
					id: 99999999,
					name: 'Cool new name'
				};
				request.put({
					url: `${baseUrl}/api/restaurants/999999999999`,
					json: true,
					formData
				}, (err, response, body) => {
					should(response.statusCode).not.equal(200);

					done();
				}).auth(authUser, authPassword);
			});
		});

		describe('Testing endpoint GET /api/restaurants/{id}', () => {
			it('Fetching a restaurant', (done) => {
				request.get({
					url: `${baseUrl}/api/restaurants/1`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).equal(200);
					should.exist(body.name);
					should.exist(body.id);

					done();
				}).auth(authUser, authPassword);
			});

			it('Fetching a restaurant that does not exist', (done) => {
				request.get({
					url: `${baseUrl}/api/restaurants/9999999999999`,
					json: true
				}, (err, response, body) => {
					should(response.statusCode).not.equal(200);

					done();
				}).auth(authUser, authPassword);
			});
		});

		describe('Testing endpoint DELETE /api/restaurants/{id}', () => {
			it('Deleting a restaurant', (done) => {
				request.delete({
					url: `${baseUrl}/api/restaurants/3`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).equal(200);
					should.not.exist(body);

					done();
				}).auth(authUser, authPassword);
			});

			it('Fetching a restaurant that should now be deleted', (done) => {
				request.get({
					url: `${baseUrl}/api/restaurants/3`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).not.equal(200);

					done();
				}).auth(authUser, authPassword);
			});

			it('Deleting a restaurant that does not exist', (done) => {
				request.delete({
					url: `${baseUrl}/api/restaurants/999999999999`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).not.equal(200);

					done();
				}).auth(authUser, authPassword);
			});
		});

		describe('Testing endpoint GET /api/ballot', () => {
			let firstResponse;
			it('Getting a ballot', (done) => {
				// Setting deadline time to be after 11pm, for the sake of testing a submission (assuming we want to test this even if it's after 11:45am)
				request.post({
					url: `${baseUrl}/api/voting-closes?time=2399`,
					json: true
				}, (err, response, body) => {
					request.get({
						url: `${baseUrl}/api/ballot`,
						json: true
					}, (err, response, body) => {
						should.not.exist(err);
						should(response.statusCode).equal(200);
						should(body.length).equal(5);
						firstResponse = body;
						done();
					}).auth(authUser, authPassword);
				}).auth(authUser, authPassword);
			});
			it('Getting a second ballot, should not be same order as first', (done) => {
				request.get({
					url: `${baseUrl}/api/ballot`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).equal(200);
					should(body.length).equal(5);
					should(JSON.stringify(body)).not.equal(JSON.stringify(firstResponse));

					done();
				}).auth(authUser, authPassword);
			});
			it('Getting a ballot after deadline has passed', (done) => {
				// Setting the deadline to be certainly closed, assuming we're testing this after 12:01 am
				request.post({
					url: `${baseUrl}/api/voting-closes?time=0001`,
					json: true
				}, () => {
					request.get({
						url: `${baseUrl}/api/ballot`,
						json: true
					}, (err, response, body) => {
						should.not.exist(err);
						should(response.statusCode).equal(409);

						done();
					}).auth(authUser, authPassword);
				}).auth(authUser, authPassword);
			});
		});
		describe('Testing endpoint POST /api/vote', () => {
			// Deadline was closed in an earlier test
			it('Posting a new vote after deadline has passed', (done) => {
				request.post({
					url: `${baseUrl}/api/vote?id=8`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).equal(409);

					done();
				}).auth(authUser, authPassword);
			});
			it('Posting a new vote', (done) => {
				// Reset back so that we can submit votes
				request.post({
					url: `${baseUrl}/api/voting-closes?time=2399`,
					json: true
				}, () => {
					request.post({
						url: `${baseUrl}/api/vote?id=8`,
						json: true
					}, (err, response, body) => {
						should.not.exist(err);
						should.not.exist(body);

						done();
					}).auth(authUser, authPassword);
				}).auth(authUser, authPassword);
			});
			it('Post a new vote with a 1:00pm meeting', (done) => {
				request.post({
					url: `${baseUrl}/api/vote?id=2&onePmMeeting=true`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).equal(200);

					done();
				}).auth(authUser, authPassword);
			});
		});
		describe('Testing endpoint POST /api/voting-closes', () => {
			it('Setting a new closing deadline', (done) => {
				request.post({
					url: `${baseUrl}/api/voting-closes?time=0001`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).equal(200);
					should.not.exist(body);

					done();
				}).auth(authUser, authPassword);
			});
		});
		describe('Testing endpoint POST /api/tomorrow', () => {
			it('Resetting votes/ballots', (done) => {
				request.post({
					url: `${baseUrl}/api/tomorrow`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(response.statusCode).equal(200);
					should.not.exist(body);

					done();
				}).auth(authUser, authPassword);
			});
		});
	});
});
