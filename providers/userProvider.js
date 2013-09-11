var Db = require('mongodb').Db;
var MongoClient = require('mongodb').MongoClient;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

UserProvider = function(dbConnectionUrl) {
	this.dbConnectionUrl = dbConnectionUrl;
};

UserProvider.prototype.init = function() {
	console.log("UserProvider connecting to db...");
	var self = this;
	MongoClient.connect(this.dbConnectionUrl, function(err, db) {
		if (err) {
			// todo: error handling
			console.log(err);
		}
		else {
			self.db = db;
		}
	});
};


UserProvider.prototype.getCollection= function(callback) {
	this.db.collection('users', function(error, user_collection) {
		if( error ) callback(error);
		else callback(null, user_collection);
	});
};

UserProvider.prototype.findUser = function(userId, callback) {
	this.getCollection(function(error, user_collection) {
		if( error ) callback(error)
		else {
			user_collection.findOne({userId: userId}, function(error, result) {
				if( error ) callback(error);
				else callback(null, result);
			});
		}
	});
};

UserProvider.prototype.findUserByIdOrEmail = function(userIdOrEmail, callback) {
	console.info('Finding user: [' + userIdOrEmail + ']');
	var self = this;
	self.findUser(userIdOrEmail, function(error, user) {
		if( error ) callback(error);
		else {
			if (user != null) {
				callback(null, user);
			}
			else {
				self.getCollection(function(error, user_collection) {
					if( error ) callback(error)
					else {
						// Search for a user with this email address
						console.info("No user with userId: [" + userIdOrEmail + "], finding by email");
						user_collection.findOne({email: userIdOrEmail}, function(error, user) {
							if( error || user === null) callback('user [' + userIdOrEmail + '] not found');
							else callback(null, user);
						});
					}
				});
			}
		}
	});
};
exports.UserProvider = UserProvider;