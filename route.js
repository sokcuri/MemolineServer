/** route.js **/
var memoHandler = require('./memoHandler.js');
var userHandler = require('./userHandler.js');
var authHandler = require('./authHandler.js');
var url = require('url');

exports.route = (function() {
	var handlers = {};

	// 유저 핸들러
	handlers['/user'] = {
		POST: userHandler.create,
		GET: userHandler.read,
		PUT: userHandler.update,
		DELETE: userHandler.remove
	};

	// 메모 핸들러
	handlers['/memo'] = {
		POST: memoHandler.create,
		GET: memoHandler.read,
		PUT: memoHandler.update,
		DELETE: memoHandler.remove
	};

	handlers['/auth'] = {
		GET: authHandler.request_token,
		POST: authHandler.access_token
	};

	handlers['/auth/callback'] = {
		GET: authHandler.callback
	};

	function route(req, res, body) {
		var pathname = url.parse(req.url).pathname;
		var method = req.method.toUpperCase();

	    try
	    {
	        JSON.parse(body);
	    }
	    catch(ex)
	    {
	        body = "{}";
	    }

		console.log(method + " " + pathname);
		if (typeof handlers[pathname] === 'undefined')
			throw 135;
		if (typeof handlers[pathname][method] === 'undefined')
			throw 141;
		if (typeof handlers[pathname][method] != 'function')
			throw 184;
		handlers[pathname][method](req, res, body);
	}
	return route;
})();