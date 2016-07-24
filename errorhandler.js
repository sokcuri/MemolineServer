exports.success = function(res, err) {
	var err = getErrorsJSON([{code: err, message: 'Success'}]);
	printJSON(res, 200, err);
};

exports.notFound = function(res, err) {
	var err = getErrorsJSON([{code: err, message: 'Sorry! Page not exist'}]);
	printJSON(res, 404, err);
};

exports.methodInvalid = function(res, err) {
	var err = getErrorsJSON([{code: err, message: 'Method not allowed'}]);
	printJSON(res, 405, err);
}

exports.notImplement = function(res, err) {
	var err = getErrorsJSON([{code: err, message: 'Not Implemented'}]);
	printJSON(res, 501, err);
}

exports.oAuthRequestFailed = function(res, err) {
	var err = getErrorsJSON([{code: err, message: 'OAuth Request Failed'}]);
	printJSON(res, 503, err);
}

exports.oAuthAccessTokenInvalid = function(res, err) {
	var err = getErrorsJSON([{code: err, message: 'OAuth GetAccessToken Failed'}]);
	printJSON(res, 503, err);
}

exports.oAuthTokenExpired = function(res, err) {
	var err = getErrorsJSON([{code: err, message: 'OAuth Token Expired'}]);
	printJSON(res, 503, err);
}

exports['oAuthTokenDBError'] = function(res, err) {
	var err = getErrorsJSON([{code: err, message: 'OAuth Token DB Error'}]);
	printJSON(res, 503, err);	
}

exports.createUserFailed = function(res, err) {
	var err = getErrorsJSON([{code: err, message: 'CreateUser Failed'}]);
	printJSON(res, 503, err);
}

exports.paramMissing = function(res, err) {
	var obj = [{}];
	obj[0].code = err;
	switch(err)
	{
		case 201:
			obj[0].message = 'missing to email field';
		break;
		case 202:
			obj[0].message = 'missing to bio field';
		break;
		case 203:
			obj[0].message = 'missing to author field';
		break;
		case 204:
			obj[0].message = 'missing to memo field';
		break;
		case 211:
			obj[0].message = 'must exist id field';
			break;
        case 251:
            obj[0].message = 'id not exist';
            break;
        case 261:
            obj[0].message = 'user_token not exist';
            break;
        case 262:
            obj[0].message = 'user_secret not exist';
            break;
		case 281:
			obj[0].message = 'oauth_token parameter not exist';
		break;
		case 282:
			obj[0].message = 'oauth_verifier parameter not exist';
		break;
		default:
			obj[0].message = 'Bad Request';
	}
	var err = getErrorsJSON(obj);
	printJSON(res, 400, err);
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
	res.setHeader("status", code);
	res.setHeader("connection", "close");
	res.writeHead(code, {"content-type": "application/json;charset=utf-8"});
	res.write(JSON.stringify(json, null, 2));
	res.end();
}