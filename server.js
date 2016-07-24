var Datastore = require('nedb');
db = {};
db.user = new Datastore({ filename: './data/user', autoload: true});
db.auth = new Datastore({ filename: './data/auth', autoload: true});
db.memo = new Datastore({ filename: './data/memo', autoload: true});

var http = require('http');
var domain = require('domain');
var route = require('./route.js');
var errorHandler = require('./errorhandler.js');
var userHandler = require('./userhandler.js');
var serverDomain = domain.create();


// 에러 핸들러: 모든 에러는 에러 핸들러를 통해 핸들링
var error = {
	0: errorHandler.success,
	135: errorHandler.notFound,
	141: errorHandler.methodInvalid,
	153: errorHandler.oAuthRequestFailed,
	154: errorHandler.oAuthAccessTokenInvalid,
	155: errorHandler.oAuthTokenExpired,
	156: errorHandler.oAuthTokenDBError,
	184: errorHandler.notImplement,
	191: errorHandler.createUserFailed,
	200: errorHandler.paramMissing,
};

serverDomain.run(() => {
	http.createServer((req, res) => {
		var requestDomain = domain.create();
		var body = "";

		requestDomain.add(req);
		requestDomain.add(res);

		requestDomain.on('error', (err) => {

            // return object
		    if (typeof err === 'object' && err.status)
		    {
		        res.writeHead(err.status, (err.header ? err.header : {}))
		        if (typeof err.results === 'object')
		        {
		            try
		            {
		                res.write(JSON.stringify(err.results));
		            }
		            catch(e)
		            {
		                res.write(err.results);
		            }
		        }
		        res.end();
		        return;
		    }

			try {
				var code = (~~(err/200)==1 ? 200 : err);
				if (typeof error[code] != 'undefined' &&
					typeof error[code] === 'function')
				{
					error[code](res, err);

					if(!err) return;
				}
				console.error('Error', err, req.url);
				if(err.stack)
				{
					console.trace(err);
				}
			}

			catch(e) {
				console.error("Error sending " + err, e, req.url);
			}
		});

		req.on('data', (chunk) => body += chunk);
		req.on('end', () => {
			route.route(req, res, body);
		});
	}).listen(80, '0.0.0.0');
});

/*
function onRequest(req, res) {
	var body = '';

	req.on('data', (chunk) => 
		body += chunk);

	req.on('end', () =>
		route.route(req, res, body));
}

process.on('uncaughtException', (err) => 
{
	if(typeof err === 'object')
		console.log('uncaughtException 발생 : ' + JSON.stringify(err));
	else
		console.log('uncaughtException 발생 : ' + err);
});

var server = http.createServer(onRequest);
server.listen(8080);*/