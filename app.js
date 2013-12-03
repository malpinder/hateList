
/**
 * Module dependencies.
 */
var express = require('express'),
app = express(),
db = require('./config/dbschema'),
pass = require('./config/pass'),
passport = require('passport'),
indexRoutes = require('./routes/index'),
userRoutes = require('./routes/user'),
hateRoutes = require('./routes/hate'),
http = require('http'),
path = require('path'),
hateDb = db.hateModel;

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
app.use(express.session({secret:'very secret', cookie: {maxAge: 2592000000}}));
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
//index
app.get('/', 
  indexRoutes.index);
//user
app.get('/login', 
  userRoutes.getLogin
);
app.get('/account', 
  pass.ensureAuthenticated, 
  userRoutes.account
);
app.post('/login', 
  userRoutes.postLogin
);
app.get('/logout', 
  userRoutes.logout
);
//hate
app.get('/hate', hateRoutes.hate(hateDb));
app.get('/hate/new',pass.ensureAuthenticated, hateRoutes.newhate);
app.post('/hate/add',pass.ensureAuthenticated, hateRoutes.addhate(hateDb));
app.get('/hate/:id', hateRoutes.viewhate(hateDb));
app.put('/hate/:id/up',pass.ensureAuthenticated, hateRoutes.uphate(hateDb));
app.put('/hate/:id/addcomment',pass.ensureAuthenticated, hateRoutes.addcomment(hateDb));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});