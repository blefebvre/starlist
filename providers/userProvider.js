var Db = require('mongodb').Db;
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
	this.db = new Db(this.dbName, new Server(this.host, this.port, {auto_reconnect: true}), {fsync: true});
	this.db.open(function(){
		if (this.username) {
			console.log("authenticating...");
			this.db.authenticate(this.username, this.password, function(err, result) {
				if (err) return callback (err);
				if (result) {
					// Success
					console.log("authenticated with db " + this.dbName);
				}
				else {
					return callback (new Error('authentication failed'));
				}
			});
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