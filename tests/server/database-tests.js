const should = require('should'),
	rewire = require("rewire"),
	localHelper = rewire('../../server/data/local-helper'),
	db = rewire('../../server/data/db-helper');

localHelper.__set__({
	local: {
		restaurants: {},
		users: {
			0: {
				name: 'Clint',
				isCool: true,
				id:0 
			}
		},
		groups: {},
		votes: {},
		events: {},
		ballots: {}
	}
});

db.__set__({
	localDB: localHelper
});

// Tests ---------------------------------------------
describe('Testing the local database', () => {

	describe('Testing INSERT', () => {
		it('Basic', (done) => {
			const newRestaurant = {
				name: 'My Favorite Restaurant'
			};
			db.insert('restaurants').data(newRestaurant).then((data) => {
				should(data.name).equal(newRestaurant.name);
				should(data.id).equal(0);
				return done();
			});
		});
		it('More data', (done) => {
			const newRestaurant = {
				name: 'My Second Favorite Restaurant',
				isSlow: true,
				daysAgo: 2
			};
			db.insert('restaurants').data(newRestaurant).then((data) => {
				should(data.name).equal(newRestaurant.name);
				should(data.isSlow).equal(newRestaurant.isSlow);
				should(data.daysAgo).equal(newRestaurant.daysAgo);
				should(data.id).equal(1);
				return done();
			});
		});
		it('With ID (should ignore)', (done) => {
			const newRestaurant = {
				name: 'My Third Favorite Restaurant',
				isSlow: true,
				daysAgo: 2,
				id: 88888
			};
			db.insert('restaurants').data(newRestaurant).then((data) => {
				should(data.name).equal(newRestaurant.name);
				should(data.isSlow).equal(newRestaurant.isSlow);
				should(data.daysAgo).equal(newRestaurant.daysAgo);
				should(data.id).equal(2);
				return done();
			});
		});
	});
	describe('Testing UPDATE', () => {
		it('Basic', (done) => {
			const updatedRestaurant = {
				name: 'Least favorite Restaurant'
			};
			db.update('restaurants').by({id: 1}).data(updatedRestaurant).then((data) => {
				const updated = data[0];
				should(updated.name).equal(updatedRestaurant.name);
				should(updated.id).equal(1);
				return done();
			});
		});
		it('Nothing to update', (done) => {
			const updatedRestaurant = {};
			db.update('restaurants').by({id: 0}).data(updatedRestaurant).then((data) => {
				const updated = data[0];
				should.exist(updated.name);
				should(updated.id).equal(0);
				return done();
			});
		});
		it('With ID', (done) => {
			const updatedRestaurant = {
				name: 'Cool Restaurant',
				id: 9999999999
			};
			db.update('restaurants').by({id: 0}).data(updatedRestaurant).then((data) => {
				const updated = data[0];
				should(updated.name).equal(updatedRestaurant.name);
				should(updated.id).equal(0);
				return done();
			});
		});
		it('Update multiple', (done) => {
			const updatedRestaurant = {
				isSlow: false,
				id: 9999999999
			};
			db.update('restaurants').by().data(updatedRestaurant).then((data) => {
				should(data.length).be.greaterThan(1);
				should(data.every((item) => item.isSlow === false)).equal(true);
				return done();
			});
		});
	});
	describe('Testing SELECT', () => {
		it('Basic', (done) => {
			db.select('restaurants').by({id: 1}).then((data) => {
				const selected = data[0];
				should.exist(selected);
				should.exist(selected.id);
				return done();
			});
		});
		it('Select multiple', (done) => {
			db.select('restaurants').by().then((data) => {
				should.exist(data);
				should(data.length).be.greaterThan(1);
				return done();
			});
		});
	});
	describe('Testing DELETE', () => {
		it('Basic', (done) => {
			db.delete('users').by({ id: 0 }).then((data) => {
				const deleted = data[0];
				should.exist(deleted);
				should.exist(deleted.id);
				should.exist(deleted.name);
				db.select('users').by({ id: 0 }).then((data) => {
					should(data.length).equal(0);
					return done();
				});
			});
		});
	});
});

