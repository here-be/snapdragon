'use strict';

module.exports = base;

/**
 * Returns a function for creating basic parsers.
 */

function base(re, type) {
  return function () {
    var pos = this.position();
    var m = this.match(re);
    if (!m) return;
    return pos({
      type: type,
      val: m[0]
    });
  };
}
