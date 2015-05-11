'use strict';

module.exports = newline;

/**
 * Newlines
 */

function newline() {
  var pos = this.position();
  var m = this.match(/^\n+/);
  if (!m) return;

  return pos({
    type: 'base.newline',
    val: m[0]
  });
}
