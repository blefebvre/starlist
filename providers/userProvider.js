var Db = require('mongodb').Db;
var MongoClient = require('mongodb').MongoClient;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

UserProvider = function(app) {
	this.dbName = app.get("dbName");
	this.host = app.get("dbHost");
	this.port = parseInt(app.get("dbPort"));
	this.username = app.get("dbUsername");
	this.password = app.get("dbPassword");
};

UserProvider.prototype.init = function() {
	console.log("connecting to " + this.host + "/" + this.dbName + " port:" + this.port);
	var self = this;
	var connectionString = this.host + ":" + this.port + "/" + this.dbName;
	if (this.username) {
		connectionString = this.username + ":" + this.password + "@" + connectionString;
	}
	MongoClient.connect("mongodb://" + connectionString, function(err, db) {
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
				else {
					callback(null, result);
				}
			});
		}
	});
};

/*
UserProvider.prototype.findUserByObjectId = function(_id, callback) {

};
*/
exports.UserProvider = UserProvider;