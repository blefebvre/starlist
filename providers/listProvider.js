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
	// todo: handle shared lists
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

ListProvider.prototype.save = function(newList, callback) {
	this.getCollection(function(error, list_collection) {
		if( error ) callback(error)
		else {
			newList.created_at = new Date();
			if( typeof newList.items === "undefined" ) newList.items = [];
			for( var j =0; j < newList.items.length; j++) {
				newList.items[j].created_at = new Date();
			}

			list_collection.insert(newList, function() {
				callback(null, newList);
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

ListProvider.prototype.toggleListItemStatus = function(listId, listItemId, userId, callback) {
	// todo: check permission
	// if (this.hasPermissionToEditList)
	var self = this;
	var listItem;
	self.findListItemById(listId, listItemId, userId, function(error, item) {
		if ( error ) callback( error );
		else {
			listItem = item;
			self.getCollection(function(error, list_collection) {
				if( error ) callback( error );
				else {
					var listObjectId = new ObjectID(listId);
					var listItemObjectId = new ObjectID(listItemId);
					var newStatus = (listItem.done === undefined || listItem.done === false);
					console.log("updating the list [" + listId + "] itemId [" + listItemId + "] to done status: " + newStatus);
					
					list_collection.update(
						{"_id": listObjectId, "items._id": listItemObjectId},
						{ $set: { "items.$.done": newStatus}},
						function(error, list) {
							if( error ) callback(error);
							else callback(null, list)
						}
					);
				}
			});
		}
	});

	
};

exports.ListProvider = ListProvider;