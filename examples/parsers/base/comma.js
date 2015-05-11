'use strict';

module.exports = comma;

/**
 * Capture a comma ','
 */

function comma() {
  var pos = this.position();
  var m = this.match(/^,/);
  if (!m) return;

  return pos({
    type: 'base.comma',
    val: m[0]
  });
}
