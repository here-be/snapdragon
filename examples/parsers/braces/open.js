'use strict';

module.exports = open;

/**
 * Opening brace
 */

function open() {
  var pos = this.position();
  var m = this.match(/^(?![$\\]){/);
  if (!m) return;

  return pos({
    type: 'braces.open',
    val: m[0]
  });
}
