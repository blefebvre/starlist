/**
 * Module dependencies.
 */
var express = require('express')
	, routes = require('./routes')
	, userRoutes = require('./routes/user')
	, http = require('http')
	, path = require('path')
	, ListProvider = require('./providers/listProvider').ListProvider
	, UserProvider = require('./providers/userProvider').UserProvider;

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('top secret sl code'));
	app.use(express.session());
	app.use(app.router);
	app.use(require('stylus').middleware(__dirname + '/public'));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

// Configure db access
var listProvider = new ListProvider();
listProvider.init('localhost', 27017);

// route specific middleware - expose the database to routes
var exposeDb = function(req, resp, next){
	req.listProvider = listProvider;
	next();
};

var userProvider = new UserProvider();
userProvider.init('localhost', 27017);

var userDb = function(req, resp, next){
	req.userProvider = userProvider;
	next();
};

/*
 * Routes
 */
// Index
app.get('/', userRoutes.loginForm);
// Login post
app.post('/', userDb, userRoutes.logUserIn);

// Show lists
app.get('/lists', userRoutes.checkAuth, exposeDb, routes.index)
// New list
app.get('/list', userRoutes.checkAuth, routes.listForm);
app.post('/list', userRoutes.checkAuth, exposeDb, routes.createList);
// View list
app.get('/list/:id', userRoutes.checkAuth, exposeDb, routes.viewList);
// Add item to list
app.post('/list/:id', userRoutes.checkAuth, exposeDb, routes.addListItem);

// list items
app.get('/list/:id/item/:itemId', userRoutes.checkAuth, exposeDb, routes.getListItem);
app.put('/list/:id/item/:itemId', userRoutes.checkAuth, exposeDb, routes.editListItem);

// logout
app.get('/logout', userRoutes.logout);

// Start the server
http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
