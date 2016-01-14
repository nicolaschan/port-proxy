const startTime = Date.now();
const logger = require('./simple-logger');

const config = require('./config.json');

const async = require('async');
const crypto = require('crypto');
const fs = require('fs');
const tls = require('tls');
const httpProxy = require('http-proxy');
const http = require('http');
const https = require('https');

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
    res.end(config['error messages']['not found']);
  }
};

const proxyServer = httpProxy.createProxyServer({});
proxyServer.on('error', function(err, req, res) {
  logger.error(err);

  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end(config['error messages']['proxy error']);
});

const httpServer = http.createServer(function(req, res) {
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

var https_options = {
  SNICallback: function(domain, callback) {
    callback(null, secureContext[domain]);
  }
};
const httpsServer = https.createServer(https_options, function(req, res) {
  handleRequest('https', req, res);
});

async.parallel([
  function(callback) {
    httpServer.listen(config['http port'], callback);
  },
  function(callback) {
    httpsServer.listen(config['https port'], callback);
  }
], function(err) {
  if (err) {
    logger.error(err);
  } else {
    var timeDifference = (Date.now() - startTime) / 1000;
    logger.info('Ready (' + timeDifference + ' s)');
  }
});