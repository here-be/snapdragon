'use strict';

module.exports = escape;

/**
 * Capture escape characters: '\\'
 */

function escape() {
  var pos = this.position();
  var m = this.match(/^\\(.)/);
  if (!m) return;

  return pos({
    type: 'base.escape',
    val: m[0],
    ch: m[1],
  });
}
