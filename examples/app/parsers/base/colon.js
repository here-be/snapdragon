'use strict';

module.exports = colon;

/**
 * Capture a colon: ':'
 */

function colon() {
  var pos = this.position();
  var m = this.match(/^:/);
  if (!m) return;

  return pos({
    type: 'base.colon',
    val: m[0]
  });
}
