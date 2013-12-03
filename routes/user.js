var passport = require('passport');

exports.getLogin = function(req, res){
	res.render('login', { user: req.user, message: req.session.messages });
};
exports.account = function(req, res){
	res.render('account', { user: req.user });
}

exports.postLogin = function(req, res, next) {
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
}

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

exports.hate = function(Hate){
	return function(req, res){
		Hate.find({}).sort({hateDate: -1}).exec(function(e,docs){
			res.render('hate', {
				user: req.user,
				"hatelist": docs
			})
		})
	}
}
exports.newhate = function(req, res){
	res.render('newhate', { 
		user: req.user,
		title: 'New hate' });
};

exports.addhate = function(Hate){
	return function(req, res){
		var hateTitle = req.body.hatetitle;
		var hateBody = req.body.hatebody;
		var hateUser = req.user.username;
		var hateRate = 0;
		var hateComments = [];
		var hateDate = new Date();
		new Hate({
			hateTitle: hateTitle,
			hateBody: hateBody,
			hateUser: hateUser,
			hateDate: hateDate,
			hateRate: hateRate,
			hateComments: []
		}).save(function(err, docs){
			if(err) res.json(err);
			res.redirect("/hate");
		})
		
	}
}
exports.viewhate = function(Hate){
	return function(req, res){
		var hateId = req.params.id;
		Hate.findOne({ _id:hateId}, function(e, doc){
			res.render('viewhate',{
				user: req.user,
				"hate" : doc
			})
		})
	}
}
exports.uphate = function(Hate){
	return function(req, res){
		var hateId = req.body._id;
		Hate.update(
			{_id:hateId},
			{ $inc: {hateRate:1}},
			function(err){
				res.redirect("/hate/"+hateId);
			}
		)
	}
}
exports.addcomment = function(Hate){
	return function(req, res){
		var hateId = req.body._id;
		var name = req.user.username;
		var body = req.body.commentbody;
		var date = new Date();
		var comment = {
			"name":name,
			"body":body,
			"date":date
		};
		Hate.update(
			{_id:hateId},
			{$push :{hateComments:comment}},
			function(e, doc){
				res.redirect("/hate/"+hateId);
			}
		)
			
	}
}