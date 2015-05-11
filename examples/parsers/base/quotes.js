'use strict';

module.exports = quotes;

/**
 * Quoted strings.
 */

function quotes() {
  var pos = this.position();
  var m = this.match(/^'([^'\\]*\\.)*[^']*'|"([^"\\]*\\.)*[^"]*"/);
  if (!m) return;

  return pos({
    type: 'base.quotes',
    val: m[1]
  });
}
