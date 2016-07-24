var Datastore = require('nedb');
var querystring = require('querystring');
var url = require('url');
var db = global.db.user;

exports.create = function(req, res, body) {
	body = typeof body === 'string' ? JSON.parse(body) : body;
	_addUser(req, body, function(error, result) {
		throw 0;
	});
};

exports.read = function(req, res) {
	_viewUser({}, function(error, results) {
		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(JSON.stringify(results));
		res.end();
	})
}

exports.update = function(req, res, body) {
	body = typeof body === 'string' ? JSON.parse(body) : body;
	_updateUser(req, res, body, function(error, results) {
		throw 0;
	});
};

exports.createUser = function(user_token, user_secret, type, id) {
	var user = {
		user_token: user_token,
		user_secret: user_secret,
		//created_ip: req.connection.remoteAddress,
		created_at: new Date()
	};
	if(type == 'twitter')
	{
		user.user_type = type;
		user.user_id = id;
	}
	db.insert(user, function(error, result) {
		if(error)
		{
			console.error(error);
			throw 191;
		}
		else
		{
		    console.log("User added");
		    var results =
            {
                user_token: user_token,
                user_secret: user_secret,
                user_type: type
            }
		    throw ({ status: 200, header: { "Content-Type": "application/json" }, results: results });
		}
	});
};

exports.remove = function (req, res, body) {
	body = typeof body === 'string' ? JSON.parse(body) : body;
	var query = url.parse(req.url).query;
	var where = querystring.parse(query);

	_removeUser(where, function(error, results) {
		throw 0;
	});
};

function _addUser(req, body, callback) {
	_chkParam([[body.email, 201], [body.bio, 202]]);

	var user = {
		nickname: body.nickname,
		email: body.email,
		bio: body.bio,
		created_ip: req.connection.remoteAddress,
		created_at: new Date()
	};
	db.insert(user, callback);
}

function _viewUser(where, callback) {
	where = where || {};
	db.find(where).sort({"created_at": -1}).exec(callback);
}

function _updateUser(req, res, body, callback) {
	var id = _getID(req, body);
	_chkParam([[id, 251]]);

	var where = {_id: id};
	var content = {
		ip: req.connection.remoteAddress,
	}

	if (body.nickname) content.nickname = body.nickname;
	if (body.email) content.email = body.email;
	if (body.bio) content.bio = body.bio;

	db.find(where, (error, results) => {
		if (results.length)
			db.update(where, {$set: content}, {multi:true}, callback);
		else
			throw 251;
	});
}

function _removeUser(where, callback) {
	db.remove(where, {multi: true}, callback);
}

function _getID(req, body)
{
	var query = url.parse(req.url).query;
	var querystr = querystring.parse(query);
	var id = undefined;
	if (typeof body.id != 'undefined')
		id = body.id;
	else if (typeof querystr['id'] != 'undefined')
		id = querystr['id'];
	
	return id;
}

function _chkParam(list)
{
	for (e of list)
	{
		if (typeof e[0] == 'undefined')
			throw e[1];
	}
}
