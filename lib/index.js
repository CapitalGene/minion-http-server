'use strict';
var express = require('express');
var debug = require('debug')('minion-http-server');

/**
 * MinionHttpServer
 *
 * @param {minion.Worker} worker  [description]
 * @param {object} options
 * @param {function} options.postPingHandler
 * @param {string} options.healthCheckRoute @default /health/check
 * @param {number} options.httpPort @default 18001
 *
 * @return {[type]} [description]
 */
module.exports = function MinionHttpServer(worker, options) {
  var expressApp = express();
  options = options || {};
  options.postPingHandler = options.postPingHandler || function defaultPostPingHandler() {};
  options.healthCheckRoute = options.healthCheckRoute || '/health/check';
  options.httpPort = options.httpPort || 18001;

  expressApp.get(options.healthCheckRoute, function(req, res) {
    debug('get', 'healthCheck');
    var resObj = {};
    var context = {
      request: req,
      response: res,
      resObj: resObj,
    };

    worker.app.do('minion.ping', {})
      .then(function() {
        resObj['minion.ping'] = 'ok';
        return options.postPingHandler.call(context);
      })
      .then(function() {
        res.json(resObj);
      })
      .catch(function(err) {
        debug('get', 'healthCheck', 'err', err);
        res.status(500)
          .json({
            meta: {
              error: err,
            },
          });
      })
  });

  function onWorkerConnectionHandler() {
    var server = expressApp.listen(options.httpPort, function() {
      var host = server.address().address;
      var port = server.address().port;
      console.log('minion-http-server listening at http://%s:%s', host, port);
    });
  }

  worker.on('connection', onWorkerConnectionHandler);
  return expressApp;
};
