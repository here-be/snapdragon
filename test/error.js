'use strict';

require('mocha');
var assert = require('assert');
var error = require('../lib/error');

function Faux(options) {
  this.options = options || {};
  this.errors = [];
}

describe('error', function() {
  it('should export a function', function() {
    assert.equal(typeof error, 'function');
  });

  it('should format an error message', function(cb) {
    var faux = new Faux({source: 'glob'});
    try {
      error.call(faux, 'some error', {
        position: {
          start: {
            column: 0,
            lineno: 2
          },
          end: {
            column: 10,
            lineno: 2
          }
        }
      });
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'glob <lineno:2 column:0>: some error');
      cb();
    }
  });

  it('should push errors onto the `errors` array when `options.silent` is true', function() {
    var faux = new Faux({source: 'glob', silent: true});
    error.call(faux, 'some error', {
      position: {
        start: {
          column: 0,
          lineno: 2
        },
        end: {
          column: 10,
          lineno: 2
        }
      }
    });
    assert.equal(faux.errors[0].message, 'glob <lineno:2 column:0>: some error');
  });
});
