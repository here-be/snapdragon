'use strict';

var get = require('get-value');

module.exports = function(msg, node) {
  node = node || {};
  var pos = node.position || {};
  var line = get(node, 'position.end.line') || 1;
  var column = get(node, 'position.end.column') || 1;
  var source = this.options.source;

  var message = source + ' <line:' + line + ' column:' + column + '>: ' + msg;
  var err = new Error(message);
  err.source = source;
  err.reason = msg;
  err.pos = pos;

  if (this.options.silent) {
    this.errors.push(err);
  } else {
    throw err;
  }
};
