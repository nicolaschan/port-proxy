var startTime = Date.now();
var logger = require('./simple-logger');

var config = require('./config.json');

var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var tls = require('tls');
var httpProxy = require('http-proxy');
var http = require('http');
var https = require('https');

var getProxyTarget = function(url) {
	for (var i in config.proxies) {
		var proxy = config.proxies[i];

		if (proxy.from === url) {
			return proxy.target;
		}
	}

	return null;
};

var handleRequest = function(protocol, req, res) {
	var from = protocol + '://' + req.headers.host;
	var proxyTarget = getProxyTarget(from);
	if (proxyTarget !== null) {
		logger.info(from + ' -> ' + proxyTarget);

		proxyServer.web(req, res, {
			target: proxyTarget
		});
		return null;
	} else {
		res.writeHead(404, {
			'Content-Type': 'text/plain'
		});
		res.end(config.notFoundMessage);
	}
};

var proxyServer = httpProxy.createProxyServer({});
proxyServer.on('error', function(err, req, res) {
	logger.error(err);

	res.writeHead(500, {
		'Content-Type': 'text/plain'
	});
	res.end(config.errorMessage);
});

var httpServer = http.createServer(function(req, res) {
	handleRequest('http', req, res);
});

var secureContext = {};
for (var i in config.proxies) {
	var proxy = config.proxies[i];

	var protocol = proxy.from.split('://')[0];
	if (protocol === 'https') {
		var target = proxy.target;
		var targetHostname = target.split('://')[1].split(':')[0];

		secureContext[targetHostname] = tls.createSecureContext({
			key: fs.readFileSync(proxy.https.key),
			cert: fs.readFileSync(proxy.https.cert)
		}).context;
	}
}

var options = {
	SNICallback: function(domain, callback) {
		callback(null, secureContext[domain]);
	}
};

var httpsServer = https.createServer(options, function(req, res) {
	handleRequest('https', req, res);
});

async.parallel([
	function(callback) {
		httpServer.listen(config.httpPort, callback);
	},
	function(callback) {
		httpsServer.listen(config.httpsPort, callback);
	}
], function(err) {
	if (err) {
		logger.error(err);
	} else {
		var timeDifference = (Date.now() - startTime) / 1000;
		logger.info('Ready (' + timeDifference + ' s)');
	}
});