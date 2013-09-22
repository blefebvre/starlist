/**
 * Module dependencies.
 */
var express = require('express')
	, MongoStore = require('connect-mongo')(express)
	, routes = require('./routes')
	, userRoutes = require('./routes/user')
	, http = require('http')
	, path = require('path')
	, ListProvider = require('./providers/listProvider').ListProvider
	, UserProvider = require('./providers/userProvider').UserProvider;

/**
 * Config
 */
var cookieSecret = process.env.COOKIE_PARSER || 'starlist'
	, dbConnectionUrl = process.env.DB_CONNECTION_URL || 'mongodb://localhost:27017/starlist';

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser(cookieSecret));
	app.use(express.session({
		secret: cookieSecret,
		store: new MongoStore({
			url: dbConnectionUrl
		})
	}));
	app.use(app.router);
	app.use(require('stylus').middleware(__dirname + '/public'));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});

// Configure db access
var listProvider = new ListProvider(dbConnectionUrl);
listProvider.init();

// route specific middleware - expose the database to routes
var exposeDb = function(req, resp, next){
	req.listProvider = listProvider;
	next();
};

var userProvider = new UserProvider(dbConnectionUrl);
userProvider.init();

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
// Hide list
app.post('/list/:id/hide', userRoutes.checkAuth, exposeDb, routes.hideList);
// Add item to list
app.post('/list/:id', userRoutes.checkAuth, exposeDb, routes.addListItem);

// Share list
app.get('/list/:id/share', userRoutes.checkAuth, exposeDb, routes.shareListForm);
app.post('/list/:id/share', userRoutes.checkAuth, userDb, exposeDb, routes.shareList);

// list items
app.get('/list/:id/item/:itemId', userRoutes.checkAuth, exposeDb, routes.getListItem);
app.post('/list/:id/item/:itemId', userRoutes.checkAuth, exposeDb, routes.editListItem);
app.post('/list/:id/item/:itemId/status', userRoutes.checkAuth, exposeDb, routes.toggleListItemDoneStatus);
app.post('/list/:id/item/:itemId/delete', userRoutes.checkAuth, exposeDb, routes.deleteListItem);

// logout
app.get('/logout', userRoutes.logout);

// Start the server
http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
