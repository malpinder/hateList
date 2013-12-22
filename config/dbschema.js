'use strict';
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
exports.mongoose = mongoose;

var uristring =
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost/hateList';
var mongoOptions = {db: {safe: true}};

mongoose.connect(uristring, mongoOptions, function(err){
    if (err) {
        console.log('Err connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Successconnecting to: ' + uristring);
    }
});

var Schema = mongoose.Schema;
//var ObjectId = Schema.ObjectId;

// User model
var userSchema = new Schema({
    username    : {type: String, required: true, unique: true},
    email       : {type: String, required: true, unique: true, lowercase: true},
    password    : {type: String, required: true},
    admin       : {type: Boolean, required: true},
    accessToken : {type: String}
});

userSchema.pre('save', function(next){
    var user = this;

    if(!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb){
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
        if(err){
            return cb(err);
        }
        cb(null, isMatch);
    });
};

userSchema.methods.generateRandomToken = function(){
    //var user = this;
    var chars = '_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    var token = new Date().getTime() + '_';
    for(var x = 0; x < 16; x+=1){
        var i = Math.floor( Math.random() * 62);
        token+= chars.charAt(i);
    }
    return token;
};
var userModel = mongoose.model('User', userSchema);
exports.userModel = userModel;

//Hate model
var HateSchema = new mongoose.Schema({
    hateTitle: {type: String, required: true, unique: true},
    hateBody: {type: String, required: true},
    hateUser: {type: String, required: true},
    hateDate: {type: Date},
    hateRate: {type: Number},
    hateComments: {type: Array}
});
var hateModel = mongoose.model('Hate', HateSchema);
exports.hateModel = hateModel;