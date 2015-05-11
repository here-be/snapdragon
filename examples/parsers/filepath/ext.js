'use strict';

module.exports = ext;

/**
 * File extension: '.js'
 */

function ext() {
  var pos = this.position();
  var m = this.match(/^\.([^\/]+)$/);
  if (!m) return;

  return pos({
    type: 'filepath.ext',
    val: m[0]
  });
}
