'use strict';
/**
 * Root tests
 *
 * @author Chen Liang [code@chen.technology]
 */

/*!
 * Module dependencies.
 */
var chai = require('chai');
var urlLib = require('url');

global.expect = chai.expect;
chai.should();
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
global.sinon = require('sinon');
