/**
 * Module dependencies.
 */
var express = require('express')
	, routes = require('./routes')
	, http = require('http')
	, path = require('path')
	, ListProvider = require('./listprovider').ListProvider;

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

/*
 * Routes
 */
// Index
app.get('/', exposeDb, routes.index);
// New list
app.get('/list', routes.listForm);
app.post('/list', exposeDb, routes.createList);
// View list
app.get('/list/:id', exposeDb, routes.viewList);
// Add item to list
app.post('/list/:id', exposeDb, routes.addListItem);

// Start the server
http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
