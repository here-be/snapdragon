'use strict';

module.exports = space;

/**
 * Newlines
 */

function space() {
  var pos = this.position();
  var m = this.match(/^\s/);
  if (!m) return;

  return pos({
    type: 'base.space',
    val: m[0]
  });
}
