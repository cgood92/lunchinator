const should = require('should'),
	request = require('request'),
	server = require('../../index');

const ok = (response) => {
	return response.statusCode == 200;
};

const authUser = 'amber',
	authPassword = 'password0',
	baseUrl = 'http://localhost:9999';

describe('Testing v1', () => {
	describe('Testing the endpoints', () => {

		describe('Testing endpoint GET /api/restaurants', () => {
			it('Fetching restaurants', (done) => {
				request.get({
					url: `${baseUrl}/api/restaurants`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(ok(response)).equal(true);
					should(body.length).greaterThan(1);

					done();
				}).auth(authUser, authPassword);
			});

			it('Fetching restaurants with non-admin user (should forbid)', (done) => {
				request.get({
					url: `${baseUrl}/api/restaurants`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(ok(response)).equal(false);

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
					should(ok(response)).equal(true);
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
					should(ok(response)).equal(true);
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
					should(ok(response)).equal(true);
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
					should(ok(response)).equal(true);
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
					should(ok(response)).equal(true);
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
					should(ok(response)).equal(false);

					done();
				}).auth(authUser, authPassword);
			});
		});

		describe('Testing endpoint GET /api/restaurants/{id}', () => {
			it('Fetching a restaurant', (done) => {
				request.put({
					url: `${baseUrl}/api/restaurants/3`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(ok(response)).equal(true);
					should.exist(body.name);
					should.exist(body.id);

					done();
				}).auth(authUser, authPassword);
			});

			it('Fetching a restaurant that does not exist', (done) => {
				request.put({
					url: `${baseUrl}/api/restaurants/9999999999999`,
					json: true
				}, (err, response, body) => {
					should(ok(response)).equal(false);

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
					should(ok(response)).equal(true);
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
					should(ok(response)).equal(false);

					done();
				}).auth(authUser, authPassword);
			});

			it('Deleting a restaurant that does not exist', (done) => {
				request.delete({
					url: `${baseUrl}/api/restaurants/999999999999`,
					json: true
				}, (err, response, body) => {
					should.not.exist(err);
					should(ok(response)).equal(false);

					done();
				}).auth(authUser, authPassword);
			});
		});

	});
});
