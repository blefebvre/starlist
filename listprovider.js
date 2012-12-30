var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

ListProvider = function() {};

ListProvider.prototype.init = function(host, port) {
	this.db= new Db('starlist', new Server(host, port, {auto_reconnect: true}), {fsync: true});
	this.db.open(function(){});
};


ListProvider.prototype.getCollection= function(callback) {
	this.db.collection('lists', function(error, list_collection) {
		if( error ) callback(error);
		else callback(null, list_collection);
	});
};

ListProvider.prototype.findAll = function(callback) {
	this.getCollection(function(error, list_collection) {
		if( error ) callback(error)
		else {
			list_collection.find().toArray(function(error, results) {
				if( error ) callback(error)
				else callback(null, results)
			});
		}
	});
};


ListProvider.prototype.findById = function(id, callback) {
	this.getCollection(function(error, list_collection) {
		if( error ) callback(error)
		else {
			list_collection.findOne({_id: new ObjectID(id)}, function(error, result) {
				if( error ) callback(error)
				else callback(null, result)
			});
		}
	});
};

ListProvider.prototype.save = function(lists, callback) {
	this.getCollection(function(error, list_collection) {
		if( error ) callback(error)
		else {
			if( Object.prototype.toString.call( lists ) !== '[object Array]' )
				lists = [lists];

			for( var i =0; i< lists.length; i++ ) {
				var list = lists[i];
				list.created_at = new Date();
				if( typeof list.comments === "undefined" ) list.comments = [];
				for( var j =0; j< list.comments.length; j++) {
					list.comments[j].created_at = new Date();
				}
			}

			list_collection.insert(lists, function() {
				callback(null, lists);
			});
		}
	});
};

exports.ListProvider = ListProvider;