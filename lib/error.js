'use strict';

module.exports = function(msg, node) {
  var pos = node.position || {start: {column: 0, line: 0}};
  var line = pos.start.line;
  var column = pos.start.column;
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
