
/*
 * GET home page.
 */

var ListProvider = require('../listprovider').ListProvider;
var db = new ListProvider();

exports.index = function(req, res){
	res.render('index', { title: 'List list' });
};