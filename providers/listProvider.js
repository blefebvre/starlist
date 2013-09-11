var Db = require('mongodb').Db;
var MongoClient = require('mongodb').MongoClient;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

// todo: reuse connection
ListProvider = function(dbConnectionUrl) {
	this.dbConnectionUrl = dbConnectionUrl;
};

ListProvider.prototype.init = function() {
	console.log("ListProvider connecting to db...");
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
			list_collection.find({$or: [ {owner: userId}, {shared_with: userId} ] }).toArray(function(error, results) {
				if( error ) callback(error)
				else callback(null, results)
			});
		}
	});
};

/*
 * Return an object used to query for a list with the given ObjectID,
 * and either owned by or shared with the given userId.
 */
ListProvider.prototype.getListQueryObject = function(listId, userId) {
	return {$and: 
				[
					{"_id": new ObjectID(listId)}, 
					{$or: 
						[
							{"owner": userId}, 
							{"shared_with": userId}
						]
					}
				] 
			};
};

ListProvider.prototype.findById = function(listId, userId, callback) {
	var queryObject = this.getListQueryObject(listId, userId);
	this.getCollection(function(error, list_collection) {
		if( error ) callback(error)
		else {
			list_collection.findOne(
				queryObject, 
				function(error, result) {
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

ListProvider.prototype.addItemToList = function(listId, userId, listItem, callback) {
	var queryObject = this.getListQueryObject(listId, userId);
	this.getCollection(function(error, list_collection) {
		if( error ) callback( error );
		else {
			listItem._id = new ObjectID();
			list_collection.update(
				queryObject,
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
					
					// Permissions have been checked above by findListItemById
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

ListProvider.prototype.updateListItemContent = function(listId, listItemId, userId, updatedContent, callback) {
	var self = this;
	self.findListItemById(listId, listItemId, userId, function(error, listItem) {
		if ( error ) callback( error );
		else {
			self.getCollection(function(error, list_collection) {
				if( error ) callback( error );
				else {
					console.info("UPDATE ITEM: user [" + userId + "] is updating the list [" + listId + "] itemId [" + listItemId + "] with new content: [" + updatedContent + "]");
					var listObjectId = new ObjectID(listId);
					var listItemObjectId = new ObjectID(listItemId);
					list_collection.update(
						{"_id": listObjectId, "items._id": listItemObjectId},
						{ $set: { "items.$.content": updatedContent}},
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

ListProvider.prototype.deleteListItem = function(listId, listItemId, userId, callback) {
	var self = this;
	self.getCollection(function(error, list_collection) {
		if ( error ) callback( error );
		else {
			console.info("DELETE ITEM: user [" + userId + "] is deleting from the list [" + listId + "] itemId [" + listItemId + "]");
			var listObjectId = new ObjectID(listId);
			var listItemObjectId = new ObjectID(listItemId);
			list_collection.update(
				{"_id": listObjectId},
				{ 
					$pull: { 
						"items": {
							"_id": listItemObjectId
						}
					}
				},
				function(error, list) {
					if( error ) callback(error);
					else callback(null, list)
				}
			);
		}
	});
};


ListProvider.prototype.shareList = function(listId, userId, userToShareWith, callback) {
	var queryObject = this.getListQueryObject(listId, userId);
	this.getCollection(function(error, list_collection) {
		if( error ) callback( error );
		else {
			list_collection.update(
				queryObject,
				{"$push": {shared_with: userToShareWith.userId}},
				function(error, list){
					if( error ) callback(error);
					else callback(null, list)
				}
			);
		}
	});
};

exports.ListProvider = ListProvider;