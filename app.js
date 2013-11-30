
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

// Mongo
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/hateList');
var db = mongoose.connection;

// Schemas
var HateSchema = new mongoose.Schema({
	hateTitle: String,
	hateBody: String,
	hateDate: Date,
	hateRate: Number,
	hateComments: Array
});
Hate = mongoose.model('Hate', HateSchema);

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/hate', routes.hate(Hate));
app.get('/hate/new', routes.newhate);
app.post('/hate/add', routes.addhate(Hate));
app.get('/hate/:id', routes.viewhate(Hate));
app.put('/hate/:id/up', routes.uphate(Hate));
app.put('/hate/:id/addcomment', routes.addcomment(Hate));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
