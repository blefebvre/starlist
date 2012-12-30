var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

ListProvider = function() {};

ListProvider.prototype.init = function(host, port) {
  this.db= new Db('starlist', new Server(host, port, {auto_reconnect: true}, {}));
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
/*
ListProvider.prototype.save = function(lists, callback) {
    this.getCollection(function(error, list_collection) {
      if( error ) callback(error)
      else {
        if( typeof(lists.length)=="undefined")
          lists = [lists];

        for( var i =0;i< lists.length;i++ ) {
          article = lists[i];
          article.created_at = new Date();
          if( article.comments === undefined ) article.comments = [];
          for(var j =0;j< article.comments.length; j++) {
            article.comments[j].created_at = new Date();
          }
        }

        list_collection.insert(lists, function() {
          callback(null, lists);
        });
      }
    });
};
*/

/*
ListProvider.prototype.addCommentToArticle = function(articleId, comment, callback) {
  this.getCollection(function(error, article_collection) {
    if( error ) callback( error );
    else {
      article_collection.update(
        {_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)},
        {"$push": {comments: comment}},
        function(error, article){
          if( error ) callback(error);
          else callback(null, article)
        });
    }
  });
};
*/

exports.ListProvider = ListProvider;