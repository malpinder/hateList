'use strict';
var db = require('../config/dbschema'),
passport = require('passport'),
LocalStrategy = require('passport-local').Strategy;

//serialize
passport.serializeUser(function(user, done) {
    var createAccessToken = function () {
        var token = user.generateRandomToken();
        db.userModel.findOne( { accessToken: token }, function (err, existingUser) {
            if (err) {
                return done( err );
            }
            if (existingUser) {
                createAccessToken(); // Run the function again - the token has to be unique!
            } else {
                user.set('accessToken', token);
                user.save( function (err) {
                    if (err){
                        return done(err);
                    }
                    return done(null, user.get('accessToken'));
                });
            }
        });
    };
    if ( user._id ) {
        createAccessToken();
    }
});

passport.deserializeUser(function(token, done) {
    db.userModel.findOne( {accessToken: token } , function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(function(username, password, done) {
    db.userModel.findOne({ 'username': username }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false,{ message: 'Unknown user ' + username });
        }
        user.comparePassword(password, function(err, isMatch) {
            if (err){
                return done(err);
            }
            if(isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        });
    });
}));

exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};
exports.ensureAdmin = function ensureAdmin(req, res, next) {
    return function(req, res, next) {
        console.log(req.user);
        if(req.user && req.user.admin === true){
            next();
        }
        else{
            res.send(403);
        }
    };
};