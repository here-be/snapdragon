'use strict';

module.exports = terminator;

/**
 * Terminator:
 *   | .
 *   | :
 *   | ;
 */

function terminator() {
  var pos = this.position();
  var m = this.match(/^[:.;]/);
  if (!m) return;

  return pos({
    type: 'base.terminator',
    val: m[0]
  });
}
