/*
 * GET home page.
 */
exports.index = function(req, res) {
	var listProvider = req.listProvider;
	listProvider.findAll(req.session.userId, function(error,docs){
        res.render('index.jade', {
            title: 'starlist',
            lists: docs
        });
    });
};

exports.listForm = function(req, res) {
	res.render('list_form.jade', {
        title: 'New Post'
    });
};

exports.createList = function(req, res) {
	var listProvider = req.listProvider;
	listProvider.save(
		{
			title: req.param('title'),
			owner: req.session.userId
		},
		function( error, docs) {
			res.redirect('/lists')
	});
};

exports.viewList = function(req, res) {
	var listProvider = req.listProvider;
	listProvider.findById(req.params.id, req.session.userId, function(error, list) {
		res.render('list_show.jade',
		{
			title: list.title,
			list: list
		});
	});
	
};

exports.addListItem = function(req, res) {
	var listProvider = req.listProvider;
	listProvider.addItemToList(req.param('_id'), {
			content: req.param('content'),
			created_at: new Date()
		}, function( error, list ) {
			res.redirect('/list/' + req.param('_id'));
		}
	);
};


exports.editListItem = function(req, res) {
	var listProvider = req.listProvider;
	var listId = req.param('_id');
	var listItemId = req.param('itemId');
	listProvider.findById(req.params.id, function(error, list) {

	});
};