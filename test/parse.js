/*!
 * snapdragon <https://github.com/jonschlinkert/snapdragon>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var Snapdragon = require('..');
var snapdragon = new Snapdragon();

describe('snapdragon', function () {
  it('should throw an error when invalid args are passed:', function () {
    (function () {
      snapdragon.parse();
    }).should.throw('Snapdragon#parse expects a string');
  });
});
