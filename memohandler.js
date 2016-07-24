/** memohandler.js **/

var Datastore = require('nedb');
var db = global.db.memo;
var querystring = require('querystring');
var url = require('url');

exports.create = function (req, res, body) {
    body = typeof body === 'string' ? JSON.parse(body) : body;
    _chkParam([[body.user_token, 261], [body.user_secret, 262]])
	_insertMemo(body, function(error, result) {
		throw 0;
	});
};

exports.read = function(req, res) {
	_findMemo(req, {}, function(error, results) {
		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(JSON.stringify(results, null, 2));
		res.end();
	});
};

exports.update = function(req, res, body) {
	body = typeof body === 'string' ? JSON.parse(body) : body;
	_updateMemo(req, res, body, function(error, results) {
		throw 0;
	});
};

exports.remove = function(req, res, body) {
    body = typeof body === 'string' ? JSON.parse(body) : body;
	var query = url.parse(req.url).query;
	var q = querystring.parse(query);
	_chkParam([[q.user_token, 261], [q.user_secret, 262], [q._id, 251]]);

	var where = {
	    _id: q._id
	};

	_removeMemo(where, function(error, results) {
		throw 0;
	});
};

function _insertMemo(body, callback) {
	var content = {
		user_token: body.user_token,
		memo: body.memo,
		date: new Date()
	};

	db.insert(content, callback);
}

function _findMemo(req, where, callback) {
    var query = url.parse(req.url).query;
    var q = querystring.parse(query);
    _chkParam([[q.user_token, 261], [q.user_secret, 262]]);
    where['user_token'] = q.user_token;
    where['user_secret'] = q.user_secret;
	db.find(where).sort({date: -1 }).exec(callback);
}

function _updateMemo(req, res, body, callback) {
	var id = _getID(req, body);
	_chkParam([[id, 251], [body.author, 203], [body.memo, 204]]);

	var where = {_id: id};
	var content = {
		author: body.author,
		memo: body.memo,
		date: new Date()
	}

	db.find(where, (error, results) => {
		if (results.length)
			db.update(where, {$set: content}, {multi:true}, callback);
		else
			throw 251;
	});
}

function _removeMemo(where, callback) {
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

