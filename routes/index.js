
/*
 * GET home page.
 */
exports.index = function(req, res) {
	var listProvider = req.listProvider;
	listProvider.findAll( function(error,docs){
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
    listProvider.save({
        title: req.param('title')
    }, function( error, docs) {
        res.redirect('/')
    });
};

exports.viewList = function(req, res) {
	var listProvider = req.listProvider;
	listProvider.findById(req.params.id, function(error, list) {
		res.render('list_show.jade',
		{
			title: list.title
		});
	});
};