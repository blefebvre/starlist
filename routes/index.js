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
        title: 'new list'
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
			res.redirect('/lists/');
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
	listProvider.addItemToList(req.param('_id'), req.session.userId, {
			content: req.param('content'),
			created_at: new Date()
		}, function( error, list ) {
			res.redirect('/list/' + req.param('_id') + '/');
		}
	);
};

exports.getListItem = function(req, res) {
	var listProvider = req.listProvider;
	var listId = req.params.id;
	var itemId = req.params.itemId;
	listProvider.findListItemById(listId, itemId, req.session.userId, function(error, item) {
		if (error) {
			console.log(error);
			res.redirect('/list/' + listId + '/');
		}
		else {
			res.render("list_item_show.jade", 
				{title: "item", item: item, listId: listId});
		}
	});
};

exports.editListItem = function(req, res) {
	var listProvider = req.listProvider;
	var listId = req.params.id;
	var itemId = req.params.itemId;
	listProvider.updateListItemContent(listId, itemId, req.session.userId, req.param('updatedContent'), function(error, list) {
		if (error) {
			console.log(error);
		}
		res.redirect('/list/' + listId + '/');
	});
};

exports.toggleListItemDoneStatus = function(req, res) {
	var listProvider = req.listProvider;
	var listId = req.params.id;
	var itemId = req.params.itemId;
	listProvider.toggleListItemStatus(listId, itemId, req.session.userId, function(error, list) {
		if (error) {
			console.log(error);
		}
		res.redirect('/list/' + listId + '/');
	});
};

exports.deleteListItem = function(req, res) {
	var listProvider = req.listProvider;
	var listId = req.params.id;
	listProvider.deleteListItem(listId, req.params.itemId, req.session.userId, function(error, list) {
		if (error) {
			console.log(error);
		}
		res.redirect('/list/' + listId + '/');
	});
};

exports.shareListForm = function(req, res) {
	var listProvider = req.listProvider;
	listProvider.findById(req.params.id, req.session.userId, function(error, list) {
		res.render('share_list.jade', {
			title: 'share list',
			list: list
		});
	});
};

var showShareListPage = function(listId, userId, message, listProvider, response) {
	listProvider.findById(listId, userId, function(error, list) {
		// TODO: handle error
		if (error) {
			console.error(error);
		}
		response.render('share_list.jade', {
			title: 'share list',
			message: message,
			list: list
		});
	});
};

// Returns true if the given user has access to the list
var hasAccessToList = function(user, list) {
	return (list.owner === user.userId ||
		(typeof list.shared_with !== 'undefined' &&
		list.shared_with.indexOf(user.userId) != -1));
};

exports.shareList = function(req, res) {
	var userProvider = req.userProvider;
	var listProvider = req.listProvider;
	var listId = req.params.id;
	var userId = req.session.userId;
	var self = this;
	var shareWith = req.param('emailOrUsername');
	userProvider.findUserByIdOrEmail(shareWith, function(error, userToShareWith) {
		if (error) {
			console.log(error);
			showShareListPage(listId, userId, 'user ' + shareWith + ' not found', listProvider, res);
		}
		else {
			// Check that list is not already shared with this user
			listProvider.findById(listId, userId, function(error, list) {
				if (error) {
					console.log(error);
					showShareListPage(listId, userId, 'unable to share list: error finding list', listProvider, res);
				}
				else {
					// Is this list already available to this user?
					if (hasAccessToList(userToShareWith, list)) {
						showShareListPage(listId, userId, 'list is already shared with ' + userToShareWith.userId, listProvider, res);
					}
					else {
						// list is not already shared - share it
						listProvider.shareList(listId, req.session.userId, userToShareWith, function(error, result) {
							if (error) {
								console.log(error);
								showShareListPage(listId, userId, 'unable to share list: error sharing list', listProvider, res);
							}
							else {
								showShareListPage(listId, userId, 'shared with ' + shareWith + '!', listProvider, res);
							}
						});
					}
				}
			});
		}
	});
};
