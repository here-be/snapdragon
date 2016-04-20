'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./utils');

/**
 * Expose `mixin()`.
 */

module.exports = mixin;

/**
 * Mixin source map support into `renderer`.
 *
 * @param {Object} `renderer`
 * @api public
 */

function mixin(renderer) {
  defineProperty(renderer, '_comment', renderer.comment);
  renderer.map = new utils.SourceMap.SourceMapGenerator();
  renderer.position = { line: 1, column: 1 };
  renderer.files = {};

  for (var key in exports) {
    defineProperty(renderer, key, exports[key]);
  }
}

function defineProperty(o, key, val) {
  Object.defineProperty(o, key, {
    enumerable: false,
    configurable: true,
    value: val
  });
}

/**
 * Update position.
 *
 * @param {String} str
 */

exports.updatePosition = function(str) {
  var lines = str.match(/\n/g);
  if (lines) this.position.line += lines.length;
  var i = str.lastIndexOf('\n');
  this.position.column = ~i ? str.length - i : this.position.column + str.length;
};

/**
 * Emit `str` with `position`.
 *
 * @param {String} str
 * @param {Object} [pos]
 * @return {String}
 */

exports.emit = function(str, position) {
  if (position) {
    var sourceFile = utils.urix(position.source || 'string');
    this.map.addMapping({
      source: sourceFile,
      generated: {
        line: this.position.line,
        column: Math.max(this.position.column - 1, 0)
      },
      original: {
        line: position.start.line,
        column: position.start.column - 1
      }
    });
    this.addFile(sourceFile, position);
  }
  this.updatePosition(str);
  return str;
};

/**
 * Adds a file to the source map output if it has not already been added
 * @param {String} `file`
 * @param {Object} `pos`
 */

exports.addFile = function(file, position) {
  if (typeof position.content !== 'string') return;
  if (Object.prototype.hasOwnProperty.call(this.files, file)) return;
  this.files[file] = position.content;
};

/**
 * Applies any original source maps to the output and embeds the source file
 * contents in the source map.
 */

exports.applySourceMaps = function() {
  Object.keys(this.files).forEach(function(file) {
    var content = this.files[file];
    this.map.setSourceContent(file, content);

    if (this.options.inputSourcemaps !== false) {
      var originalMap = utils.sourceMapResolve.resolveSync(content, file, fs.readFileSync);
      if (originalMap) {
        var map = new utils.SourceMap.SourceMapConsumer(originalMap.map);
        var relativeTo = originalMap.sourcesRelativeTo;
        this.map.applySourceMap(map, file, utils.urix(path.dirname(relativeTo)));
      }
    }
  }, this);
};

/**
 * Process comments, drops sourceMap comments.
 * @param {Object} node
 */

exports.comment = function(node) {
  if (/^# sourceMappingURL=/.test(node.comment)) {
    return this.emit('', node.position);
  } else {
    return this._comment(node);
  }
};
