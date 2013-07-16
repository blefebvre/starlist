var Db = require('mongodb').Db;
var MongoClient = require('mongodb').MongoClient;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

// todo: reuse connection
ListProvider = function(app) {
	this.dbName = app.get("dbName");
	this.host = app.get("dbHost");
	this.port = parseInt(app.get("dbPort"));
	this.username = app.get("dbUsername");
	this.password = app.get("dbPassword");
};

ListProvider.prototype.init = function() {
	console.log("connecting to " + this.host + "/" + this.dbName + " port:" + this.port);
	var self = this;
	MongoClient.connect("mongodb://" + this.username + ":" + this.password + "@" + this.host + ":" + this.port + "/" + this.dbName, function(err, db) {
		if (err) return callback (err);
		else {
			self.db = db;
		}
	});
};


ListProvider.prototype.getCollection= function(callback) {
	this.db.collection('lists', function(error, list_collection) {
		if( error ) callback(error);
		else callback(null, list_collection);
	});
};

ListProvider.prototype.findAll = function(userId, callback) {
	this.getCollection(function(error, list_collection) {
		if( error ) callback(error)
		else {
			list_collection.find({owner: userId}).toArray(function(error, results) {
				if( error ) callback(error)
				else callback(null, results)
			});
		}
	});
};


ListProvider.prototype.findById = function(id, userId, callback) {
	// todo: check permissions on the user
	this.getCollection(function(error, list_collection) {
		if( error ) callback(error)
		else {
			list_collection.findOne({_id: new ObjectID(id), owner: userId}, function(error, result) {
				if( error ) callback(error)
				else callback(null, result)
			});
		}
	});
};

ListProvider.prototype.findListItemById = function(listId, itemId, userId, callback) {
	this.findById(listId, userId, function(error, list) {
		if( error ) callback(error);
		else {
			var itemObjectId = new ObjectID(itemId);
			for (var i = 0; i < list.items.length; i++) {
				var currentItem = list.items[i];
				if (itemObjectId.equals(currentItem._id)) {
					callback(null, currentItem);
					return;
				}
			}
			callback("could not find list item");
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
				if( typeof list.items === "undefined" ) list.items = [];
				for( var j =0; j< list.items.length; j++) {
					list.items[j].created_at = new Date();
				}
			}

			list_collection.insert(lists, function() {
				callback(null, lists);
			});
		}
	});
};

ListProvider.prototype.addItemToList = function(listId, listItem, callback) {
	listItem._id = new ObjectID();
	this.getCollection(function(error, list_collection) {
		if( error ) callback( error );
		else {
			list_collection.update(
				{_id: new ObjectID(listId)},
				{"$push": {items: listItem}},
				function(error, list){
					if( error ) callback(error);
					else callback(null, list)
				}
			);
		}
	});
};

exports.ListProvider = ListProvider;