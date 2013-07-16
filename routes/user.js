
var bcrypt = require('bcrypt');

/*
 * Login view
 */

exports.loginForm = function(req, res) {
	res.render('login_form.jade', {
		title: 'login'
	});
};

exports.logUserIn = function(req, res) {
	var userProvider = req.userProvider;
	var username = req.body.user.name;
	var password = req.body.user.password;
	userProvider.findUser(username, function(error, user) {
		if( error || user === null) {
			// no user with this ID
			console.log("no user with this username: " + username);
			backToLogin("try again", res);
		}
		else {
			console.log("authenticating user " + username + "...");
			// check for a valid password
			bcrypt.compare(password, user.password, function(err, result) {
				if (result === true) {
					// SUCCESS
					console.log("user: " + username + " has logged in!");
					req.session.userId = user.userId;
					res.redirect('/lists');
				}
				else {
					// incorrect password
					console.log("incorrect password for this username: " + username);
					backToLogin("try again", res);
				}
			});
		}
	});
};

function backToLogin(message, res) {
	res.render('login_form.jade', {
		title: 'login',
		message: message
	});
};

exports.logout = function(req, res) {
	delete req.session.userId;
	res.redirect('/');
};

exports.checkAuth = function(req, res, next) {
	if (!req.session.userId) {
		// TODO: send back to login
		res.send('You are not authorized to view this page');
	} else {
		next();
	}
};