'use strict';
exports.hate = function(Hate){
    return function(req, res){
        Hate.find({}).sort({hateDate: -1}).exec(function(e,docs){
            res.render('hate', {
                user: req.user,
                'hatelist': docs
            });
        });
    };
};
exports.newhate = function(req, res){
    res.render('newhate', {
        user: req.user,
        title: 'New hate'
    });
};

exports.addhate = function(Hate){
    return function(req, res){
        new Hate({
            hateTitle: req.body.hatetitle,
            hateBody: req.body.hatebody,
            hateUser: req.user.username,
            hateDate: new Date(),
            hateRate: 0,
            hateComments: []
        }).save(function(err){
            if(err) {
                res.json(err);
            }
            res.redirect('/hate');
        });
    };
};
exports.viewhate = function(Hate){
    return function(req, res){
        var hateId = req.params.id;
        Hate.findOne({ _id:hateId}, function(e, doc){
            res.render('viewhate',{
                user: req.user,
                'hate' : doc
            });
        });
    };
};
exports.uphate = function(Hate){
    return function(req, res){
        var hateId = req.body._id;
        Hate.update(
            {_id:hateId},
            { $inc: {hateRate:1}},
            function(err){
                if(err) {
                    res.json(err);
                }
                res.redirect('/hate/'+hateId);
            }
        );
    };
};
exports.addcomment = function(Hate){
    return function(req, res){
        var hateId = req.body._id;
        var name = req.user.username;
        var body = req.body.commentbody;
        var date = new Date();
        var comment = {
            'name':name,
            'body':body,
            'date':date
        };
        Hate.update(
            {_id:hateId},
            {$push :{hateComments:comment}},
            function(err){
                if(err) {
                    res.json(err);
                }
                res.redirect('/hate/'+hateId);
            }
        );
    };
};