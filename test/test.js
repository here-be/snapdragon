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
var snapdragon = require('../');

describe('snapdragon', function () {
  it('should:', function () {
    snapdragon('a').should.eql({a: 'b'});
    snapdragon('a').should.equal('a');
  });

  it('should throw an error:', function () {
    (function () {
      snapdragon();
    }).should.throw('snapdragon expects valid arguments');
  });
});
