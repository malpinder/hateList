'use strict';
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title:'Hatelist passport test', user: req.user });
};