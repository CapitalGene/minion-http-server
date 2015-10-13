'use strict';
/**
 * test.http-server.js
 *
 * @author Chen Liang [code@chen.technology]
 */
var MinionHttpServer = require('./../lib');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var Promise = require('bluebird');
var supertest = require('supertest');

describe('minion-http-server', function() {
  beforeEach(function() {
    this.fakeWorker = new EventEmitter();
    this.fakeWorker.app = {
      do: sinon.stub(),
    };
    this.fakeWorker.app.do.returns(Promise.resolve({}));
  })
  it('is a function', function() {
    expect(MinionHttpServer).to.be.a('function');
  });
  it('returns instance of express app', function() {
    var res = MinionHttpServer(this.fakeWorker);
    res.should.have.property('listen')
      .that.is.a('function');
  });
  it('listens on worker connection ', function(done) {
    var self = this;
    var postPingHandler = function() {
      var innerSelf = this;
      return new Promise(function(resolve, reject) {
        innerSelf.should.have.property('request');
        innerSelf.should.have.property('response');
        innerSelf.should.have.property('resObj');
        resolve();
      });
    };
    var postPingHandlerSpy = sinon.spy(postPingHandler);
    MinionHttpServer(this.fakeWorker, {
      postPingHandler: postPingHandlerSpy,
    });
    this.fakeWorker.emit('connection');
    var request = supertest('http://localhost:18001');
    Promise.delay(1 * 1000)
      .then(function() {
        return new Promise(function(resolve, reject) {
          request
            .get('/health/check')
            .expect(200)
            .end(function(err, res) {
              if (err) {
                return reject(err);
              }
              res.body.should.have.property('minion.ping', 'ok');
              resolve();
            })
        });
      })
      .then(function() {
        postPingHandlerSpy.should.have.been.calledOnce;
        self.fakeWorker.app.do.should.have.been.calledOnce;
        self.fakeWorker.app.do.should.have.been.calledWith('minion.ping', {});
      })
      .should.notify(done);
  });
});
