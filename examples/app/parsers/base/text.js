'use strict';

module.exports = text;

/**
 * Word characters
 */

function text() {
  var pos = this.position();
  var m = this.match(/^[a-z]+/i);
  if (!m) return;

  return pos({
    type: 'base.text',
    val: m[0]
  });
}
