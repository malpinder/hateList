
/**
 * Module dependencies.
 */

var express = require('express');
var	passport = require('passport');
var	LocalStrategy = require('passport-local').Strategy;
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var	bcrypt 	= require('bcrypt');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var	SALT_WORK_FACTOR= 10;
//Mongo
mongoose.connect('mongodb://localhost/hateList');
var db = mongoose.connection;
db.on('error', console.error.bind(console,"connection error:"));
db.once('open', function callback(){
	console.log('Connected to Mongo');
});

// Schemas
var HateSchema = new mongoose.Schema({
	hateTitle: String,
	hateBody: String,
	hateDate: Date,
	hateRate: Number,
	hateComments: Array
});
var Hate = mongoose.model('Hate', HateSchema);

var userSchema = mongoose.Schema({
	username	: {type: String, required: true, unique: true},
	email		: {type: String, required: true, unique: true},
	password	: {type: String, required: true},
	accessToken : {type: String}
});
userSchema.pre('save', function(next){
	var user = this;

	if(!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
		if(err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash){
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});

//pass verification
userSchema.methods.comparePassword = function(candidatePassword, cb){
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
		if(err) return cb(err);
		cb(null, isMatch);
	});
};

//remember me
userSchema.methods.generateRandomToken = function(){
	var user = this;
	var chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
	var token = new Date().getTime() + '_';
	for(var x = 0; x < 16; x++){
		var i = Math.floor( Math.random() * 62);
		token+= chars.charAt(i);
	}
	return token;
};
var User = mongoose.model('User', userSchema);
//serialize
passport.serializeUser(function(user, done) {
  var createAccessToken = function () {
    var token = user.generateRandomToken();
    User.findOne( { accessToken: token }, function (err, existingUser) {
      if (err) { return done( err ); }
      if (existingUser) {
        createAccessToken(); // Run the function again - the token has to be unique!
      } else {
        user.set('accessToken', token);
        user.save( function (err) {
          if (err) return done(err);
          return done(null, user.get('accessToken'));
        })
      }
    });
  };

  if ( user._id ) {
    createAccessToken();
  }
});

passport.deserializeUser(function(token, done) {
  User.findOne( {accessToken: token } , function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ 'username': username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.session({secret:'jhct68i00gt32ssFW', cookie: {maxAge: 2592000000}}));
app.use( function (req, res, next) {
    if ( req.method == 'POST' && req.url == '/login' ) {
      if ( req.body.rememberme ) {
        req.session.cookie.maxAge = 2592000000; // 30*24*60*60*1000 Rememeber 'me' for 30 days
      } else {
        req.session.cookie.expires = false;
      }
    }
    next();
  });
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.session.messages =  [info.message];
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/hate', routes.hate(Hate));
app.get('/hate/new',ensureAuthenticated, routes.newhate);
app.post('/hate/add',ensureAuthenticated, routes.addhate(Hate));
app.get('/hate/:id', routes.viewhate(Hate));
app.put('/hate/:id/up',ensureAuthenticated, routes.uphate(Hate));
app.put('/hate/:id/addcomment',ensureAuthenticated, routes.addcomment(Hate));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}