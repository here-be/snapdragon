'use strict';

module.exports = inner;

/**
 * Inside braces
 */

function inner() {
  var pos = this.position();
  var m = this.match(/^([^{}\\]*)/);
  if (!m) return;

  return pos({
    type: 'braces.inner',
    val: m[0].split(',')
  });
}
