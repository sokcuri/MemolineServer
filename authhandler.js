/** memohandler.js **/
var url = require('url');
var Datastore = require('nedb');
var db = global.db.auth;
var querystring = require('querystring');

/*
var tokenList = [['consumer_key', 'consumer_key', 'consumer_key'],
				['consumer_secret', 'consumer_secret', 'consumer_secret'],
			 	['access_key', 'access_token_key', 'token'],
			 	['access_secret', 'access_token_secret', 'token_secret']];

for (i in tokenList)
{
	Object.defineProperty(Twitter.prototype, tokenList[i][0], {
		get: () => { return this.options.consumer_key; },
		set: (x) => { this.options[tokenList[i][1]] = x, this.options.request_options.oauth[tokenList[i][2]] = x; }
	});
}
*/
var OAuth = new (require('oauth').OAuth)(
	'https://api.twitter.com/oauth/request_token',
	'https://api.twitter.com/oauth/access_token',
	'',
	'',
	'1.0',
	null, // callback URL
	'HMAC-SHA1'
);
/*
var initKey = (consumer_key, consumer_secret, access_token_key, access_token_secret) => {
	Client.options.consumer_key = consumer_key;
	Client.options.consumer_secret = consumer_secret;
	Client.options.access_token_key = access_token_key;
	Client.options.access_token_secret = access_token_secret;

	Client.options.request_options.oauth.consumer_key = consumer_key;
	Client.options.request_options.oauth.consumer_secret = consumer_secret;
	Client.options.request_options.oauth.token = access_token_key;
	Client.options.request_options.oauth.token_secret = access_token_secret;
}
*/
function getConsumerKey()
{
	return "zceP2j4nyfOcBRcv4Vbl0WTKJ";
}
function getConsumerSecret()
{
	return "dnJp5MIBdue5JEAVu2aFb0PAaME3TaX3VaXI5BuTfWm85NORd1";
}

z_oauth_token = "";
z_oauth_token_secret = "";

// GET
exports.request_token = function(req, res, body) {
	consumerKey = getConsumerKey();
	consumerSecret = getConsumerSecret();
	OAuth._consumerKey = consumerKey;
	OAuth._consumerSecret = consumerSecret;
	OAuth._authorize_callback = "http://192.168.10.12:8080/auth/callback";
	OAuth.getOAuthRequestToken((error, oauth_token, oauth_token_secret, results) => {
		if (error)
		{
			throw 153;
		}
		else
		{			
			var data = {
				oauth_token: oauth_token,
				oauth_token_secret: oauth_token_secret,
				created_at: new Date()
			};
			db.insert(data, (error, results) => {
				if(error)
					throw 156;

				printJSON(res, 200, {"oauth_token": oauth_token, "oauth_token_secret": oauth_token_secret,
					"authorize_url": 'https://twitter.com/oauth/authenticate?oauth_token=' + oauth_token});
			});
		}
	});
};

// CALLBACK
exports.callback = function(req, res, body) {
	var query = url.parse(req.url).query;
	var q = querystring.parse(query);
	_chkParam([['oauth_token', 281], ['oauth_verifier', 282]]);
	
	where = {oauth_token: q['oauth_token']};
	db.find(where).sort({"created_at": -1}).exec((error, results) => {
	    if(error || typeof results[0] == 'undefined' || typeof results[0]['oauth_token_secret'] == 'undefined')
			throw 155;

		var oauth_token = q['oauth_token'];
		var oauth_token_secret = results[0]['oauth_token_secret'];

		console.log(oauth_token);
		console.log(oauth_token_secret);
		console.log(q['oauth_verifier']);
		OAuth.getOAuthAccessToken(oauth_token, oauth_token_secret, q['oauth_verifier'], (error, access_token, access_secret, results) => {
			if (error) {
				console.log(error);
				throw 154;
			}
			else
			{
				OAuth.get(
					'https://api.twitter.com/1.1/account/verify_credentials.json',
					access_token, //test user token 
					access_secret, //test user secret             
					function (e, data, res){
						console.log(e);
						console.log(data);
						console.log(res);
						console.log("--------------------------");
						if (e)
						{
							console.error(e);
							throw 155;
						}
						if (typeof data === 'string')
						{
						    data = JSON.parse(data);

							var user_token = require('sha1')("T" + data.id_str);
							var user_secret = require('sha1')(require('sha1')("T" + data.id_str + "this is salt"));
							var userHandler = require('./userhandler.js');
							userHandler.createUser(user_token, user_secret, 'twitter', data.id_str);
						}
				});    
			}
		});

	});

}
/*
	function auth_success(req, res, body)
	{
		OAuth.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
	    if (error) {
	      res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
	    } else {
	      req.session.oauthAccessToken = oauthAccessToken;
	      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
	      // Right here is where we would write out some nice user stuff
	      consumer.get("http://twitter.com/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
	        if (error) {
	          res.send("Error getting twitter screen name : " + sys.inspect(error), 500);
	        } else {
	          req.session.twitterScreenName = data["screen_name"];    
	          res.send('You are signed in: ' + req.session.twitterScreenName)
	        }  
	      });  
	    }
	  });
		res.writeHead(200, {"Content-Type": "text/plain"});
		res.write(body);
		res.end();
		console.warn(body);
	}

*/
// POST
exports.access_token = function(req, res, body) {
	throw 184; // not implemented
};

/*
exports.create = function(req, res, body) {
	body = typeof body === 'string' ? JSON.parse(body) : body;
	_createAuth(body, function(error, result) {
		throw 0;
	});
};

exports.read = function(req, res) {
	_findAuth({}, function(error, results) {
		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(JSON.stringify(results, null, 2));
		res.end();
	});
};

exports.update = function(req, res, body) {
	body = typeof body === 'string' ? JSON.parse(body) : body;
	_updateAuth(req, res, body, function(error, results) {
		throw 0;
	});
};

exports.remove = function(req, res, body) {
	body = typeof body === 'string' ? JSON.parse(body) : body;
	var query = url.parse(req.url).query;
	var where = querystring.parse(query);

	_removeAuth(where, function(error, results) {
		throw 0;
	});
};

function _createAuth(body, callback) {
	var content = {
		type: "twitter",
		_id: body.id,
		date: new Date()
	};
	db.insert(content, callback);
}

function _findAuth(where, callback) {
	where = where || {};
	db.find(where, callback);
}

function _updateAuth(req, res, body, callback) {
	var id = _getID(req, body);
	_chkParam([[id, 251], [body.author, 203], [body.memo, 204]]);

	var where = {_id: id};
	var content = {
		type: "twitter",
		_id: body.id,
		date: new Date()
	}

	db.find(where, (error, results) => {
		if (results.length)
			db.update(where, {$set: content}, {multi:true}, callback);
		else
			throw 251;
	});
}

function _removeAuth(where, callback) {
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
*/
function _chkParam(list)
{
	for (e of list)
	{
		if (typeof e[0] == 'undefined')
			throw e[1];
	}
}

function getErrorsJSON(error) {
	var obj = {};
	obj['errors'] = [];
	for (var i=0; i < error.length; i++)
	{
		obj['errors'][i] = {};
		obj['errors'][i]['message'] = error[i].message;
		obj['errors'][i]['code'] = error[i].code;
	}
	return obj;
}
function printJSON(res, code, json) {
	res.writeHead(code, {"Content-Type": "application/json;charset=utf-8"});
	res.write(JSON.stringify(json, null, 2));
	res.end();
}