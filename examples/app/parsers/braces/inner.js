'use strict';

module.exports = inner;

/**
 * Inside braces
 */

function inner() {
  var pos = this.position();
  var parsed = this.parsed;
  var m = this.match(/^([^{}\\]*)/);
  if (!m) return;

  var res = { type: 'braces.inner' };
  res.val = m[0].split(',');

  res.head = parsed.slice(0, parsed.length - 1);
  res.tail = this.input.slice(1);
  return pos(res);
}
