var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

UserProvider = function() {};

UserProvider.prototype.init = function(host, port) {
	this.db= new Db('starlist', new Server(host, port, {auto_reconnect: true}), {fsync: true});
	this.db.open(function(){});
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
				if( error ) callback(error)
				else callback(null, result)
			});
		}
	});
};

/*
UserProvider.prototype.findUserByObjectId = function(_id, callback) {

};
*/
exports.UserProvider = UserProvider;