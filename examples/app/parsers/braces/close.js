'use strict';

module.exports = close;

/**
 * Closing brace
 */

function close() {
  var pos = this.position();
  var m = this.match(/^(?!\\)}+/);
  if (!m) return;

  return pos({
    type: 'braces.close',
    val: m[0]
  });
}
