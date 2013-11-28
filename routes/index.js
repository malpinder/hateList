
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'Hatelist test' });
};

exports.hate = function(db){
	return function(req, res){
		var collection = db.get('hatecollec');
		collection.find({},{sort:[['hateDate', -1]]},function(e,docs){
			res.render('hate', {
				"hatelist": docs
			})
		})
	}
}
exports.newhate = function(req, res){
	res.render('newhate', { title: 'New hate' });
};

exports.addhate = function(db){
	return function(req, res){
		var hateTitle = req.body.hatetitle;
		var hateBody = req.body.hatebody;
		var hateRate = 0;
		var hateUser = "not yet";
		var hateErs = [];
		var hateComments = [];
		var hateDate = new Date();

		var collection = db.get('hatecollec');
		collection.insert({
			"hateTitle" : hateTitle,
			"hateBody" : hateBody,
			"hateRate" : hateRate,
			"hateUser" : hateUser,
			"hateErs" : hateErs,
			"hateComments" : hateComments,
			"hateDate" : hateDate

		}, function ( err, docs ){
			if(err){
				res.send('fallus');
			}
			else {
				res.redirect("/hate");
			}
		});
	}
}
exports.viewhate = function(db){
	return function(req, res){
		var collection = db.get('hatecollec');
		var hateId = req.params.id;
		collection.findOne({ _id:hateId}, function(e, doc){
			res.render('viewhate',{
				"hate" : doc
			})
		})
	}
}
exports.uphate = function(db){
	return function(req, res){
		var collection = db.get('hatecollec');
		var hateId = req.body._id;
		collection.update(
			{_id:hateId},
			{ $inc: {hateRate:1}},
			function(err, doc){
				res.redirect("/hate/"+hateId);
			}
		)
	}
}