'use strict';

require('mocha');
var assert = require('assert');
var Snapdragon = require('..');
var capture = require('snapdragon-capture');
var snapdragon;

describe('parser', function() {
  beforeEach(function() {
    snapdragon = new Snapdragon();
    snapdragon.use(capture());
  });

  describe('.regex():', function() {
    it('should expose a regex cache with regex from registered parsers', function() {
      snapdragon.capture('dot', /^\./);
      snapdragon.capture('text', /^\w+/);
      snapdragon.capture('all', /^.+/);

      assert(snapdragon.regex.__data__.hasOwnProperty('dot'));
      assert(snapdragon.regex.__data__.hasOwnProperty('all'));
      assert(snapdragon.regex.__data__.hasOwnProperty('text'));
    });
  });
});
