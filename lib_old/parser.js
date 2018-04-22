'use strict';

var use = require('use');
var util = require('snapdragon-util');
var Cache = require('map-cache');
var Node = require('snapdragon-node');
var define = require('define-property');
var extend = require('extend-shallow');
var Emitter = require('component-emitter');
var isObject = require('isobject');
var Position = require('./position');
var error = require('./error');

/**
 * Create a new `Parser` with the given `input` and `options`.
 *
 * ```js
 * var Snapdragon = require('snapdragon');
 * var Parser = Snapdragon.Parser;
 * var parser = new Parser();
 * ```
 * @param {String} `input`
 * @param {Object} `options`
 * @api public
 */

function Parser(options) {
  this.options = extend({source: 'string'}, options);
  this.isParser = true;
  this.Node = Node;
  this.init(this.options);
  use(this);
}

/**
 * Prototype methods
 */

Parser.prototype = Emitter({
  constructor: Parser,

  init: function(options) {
    this.orig = '';
    this.input = '';
    this.parsed = '';

    this.currentType = 'root';
    this.setCount = 0;
    this.count = 0;
    this.column = 1;
    this.line = 1;

    this.regex = new Cache();
    this.errors = this.errors || [];
    this.parsers = this.parsers || {};
    this.types = this.types || [];
    this.sets = this.sets || {};
    this.fns = this.fns || [];
    this.tokens = [];
    this.stack = [];

    this.typeStack = [];
    this.setStack = [];

    var pos = this.position();
    this.bos = pos(this.node({
      type: 'bos',
      val: ''
    }));

    this.ast = pos(this.node({
      type: this.options.astType || 'root',
      errors: this.errors
    }));

    this.ast.pushNode(this.bos);
    this.nodes = [this.ast];
  },

  /**
   * Throw a formatted error message with details including the cursor position.
   *
   * ```js
   * parser.set('foo', function(node) {
   *   if (node.val !== 'foo') {
   *     throw this.error('expected node.val to be "foo"', node);
   *   }
   * });
   * ```
   * @name .error
   * @param {String} `msg` Message to use in the Error.
   * @param {Object} `node`
   * @return {undefined}
   * @api public
   */

  error: function(/*msg, node*/) {
    return error.apply(this, arguments);
  },

  /**
   * Define a non-enumberable property on the `Parser` instance. This is useful
   * in plugins, for exposing methods inside handlers.
   *
   * ```js
   * parser.define('foo', 'bar');
   * ```
   * @name .define
   * @param {String} `key` propery name
   * @param {any} `val` property value
   * @return {Object} Returns the Parser instance for chaining.
   * @api public
   */

  define: function(key, val) {
    define(this, key, val);
    return this;
  },

  /**
   * Create a new [Node](#node) with the given `val` and `type`.
   *
   * ```js
   * parser.node('/', 'slash');
   * ```
   * @name .node
   * @param {Object} `val`
   * @param {String} `type`
   * @return {Object} returns the [Node](#node) instance.
   * @api public
   */

  node: function(val, type) {
    return new this.Node(val, type);
  },

  /**
   * Mark position and patch `node.position`.
   *
   * ```js
   * parser.set('foo', function(node) {
   *   var pos = this.position();
   *   var match = this.match(/foo/);
   *   if (match) {
   *     // call `pos` with the node
   *     return pos(this.node(match[0]));
   *   }
   * });
   * ```
   * @name .position
   * @return {Function} Returns a function that takes a `node`
   * @api public
   */

  position: function() {
    var start = { line: this.line, column: this.column };
    var parsed = this.parsed;
    var self = this;

    return function(node) {
      if (!node.isNode) node = new Node(node);
      node.define('position', new Position(start, self));
      node.define('parsed', parsed);
      node.define('inside', self.stack.length > 0);
      node.define('rest', self.input);
      return node;
    };
  },

  /**
   * Add parser `type` with the given visitor `fn`.
   *
   * ```js
   *  parser.set('all', function() {
   *    var match = this.match(/^./);
   *    if (match) {
   *      return this.node(match[0]);
   *    }
   *  });
   * ```
   * @name .set
   * @param {String} `type`
   * @param {Function} `fn`
   * @api public
   */

  set: function(type, fn) {
    if (this.types.indexOf(type) === -1) {
      this.types.push(type);
    }
    this.parsers[type] = fn.bind(this);
    return this;
  },

  /**
   * Get parser `type`.
   *
   * ```js
   * var fn = parser.get('slash');
   * ```
   * @name .get
   * @param {String} `type`
   * @api public
   */

  get: function(type) {
    return this.parsers[type];
  },

  /**
   * Push a node onto the stack for the given `type`.
   *
   * ```js
   * parser.set('all', function() {
   *   var match = this.match(/^./);
   *   if (match) {
   *     var node = this.node(match[0]);
   *     this.push(node);
   *     return node;
   *   }
   * });
   * ```
   * @name .push
   * @param {String} `type`
   * @return {Object} `token`
   * @api public
   */

  push: function(type, token) {
    this.sets[type] = this.sets[type] || [];
    this.count++;
    this.stack.push(token);
    this.setStack.push(token);
    this.typeStack.push(type);
    return this.sets[type].push(token);
  },

  /**
   * Pop a token off of the stack of the given `type`.
   *
   * ```js
   * parser.set('close', function() {
   *   var match = this.match(/^\}/);
   *   if (match) {
   *     var node = this.node({
   *       type: 'close',
   *       val: match[0]
   *     });
   *
   *     this.pop(node.type);
   *     return node;
   *   }
   * });
   * ```
   * @name .pop
   * @param {String} `type`
   * @returns {Object} Returns a token
   * @api public
   */

  pop: function(type) {
    if (this.sets[type]) {
      this.count--;
      this.stack.pop();
      this.setStack.pop();
      this.typeStack.pop();
      return this.sets[type].pop();
    }
  },

  /**
   * Return true if inside a "set" of the given `type`. Sets are created
   * manually by adding a type to `parser.sets`. A node is "inside" a set
   * when an `*.open` node for the given `type` was previously pushed onto the set.
   * The type is removed from the set by popping it off when the `*.close`
   * node for the given type is reached.
   *
   * ```js
   * parser.set('close', function() {
   *   var pos = this.position();
   *   var m = this.match(/^\}/);
   *   if (!m) return;
   *   if (!this.isInside('bracket')) {
   *     throw new Error('missing opening bracket');
   *   }
   * });
   * ```
   * @name .isInside
   * @param {String} `type`
   * @return {Boolean}
   * @api public
   */

  isInside: function(type) {
    if (typeof type === 'undefined') {
      return this.count > 0;
    }
    if (!Array.isArray(this.sets[type])) {
      return false;
    }
    return this.sets[type].length > 0;
  },

  isDirectlyInside: function(type) {
    if (typeof type === 'undefined') {
      return this.count > 0 ? util.last(this.typeStack) : null;
    }
    return util.last(this.typeStack) === type;
  },

  /**
   * Return true if `node` is the given `type`.
   *
   * ```js
   * parser.isType(node, 'brace');
   * ```
   * @name .isType
   * @param {Object} `node`
   * @param {String} `type`
   * @return {Boolean}
   * @api public
   */

  isType: function(node, type) {
    return node && node.type === type;
  },

  /**
   * Get the previous AST node from the `parser.stack` (when inside a nested
   * context) or `parser.nodes`.
   *
   * ```js
   * var prev = this.prev();
   * ```
   * @name .prev
   * @return {Object}
   * @api public
   */

  prev: function(n) {
    return this.stack.length > 0
      ? util.last(this.stack, n)
      : util.last(this.nodes, n);
  },

  /**
   * Update line and column based on `str`.
   */

  consume: function(len) {
    this.input = this.input.substr(len);
  },

  /**
   * Returns the string up to the given `substring`,
   * if it exists, and advances the cursor position past the substring.
   */

  advanceTo: function(str, i) {
    var idx = this.input.indexOf(str, i);
    if (idx !== -1) {
      var val = this.input.slice(0, idx);
      this.consume(idx + str.length);
      return val;
    }
  },

  /**
   * Update column based on `str`.
   */

  updatePosition: function(str, len) {
    var lines = str.match(/\n/g);
    if (lines) this.line += lines.length;
    var i = str.lastIndexOf('\n');
    this.column = ~i ? len - i : this.column + len;
    this.parsed += str;
    this.consume(len);
  },

  /**
   * Match `regex`, return captures, and update the cursor position by `match[0]` length.
   *
   * ```js
   * // make sure to use the starting regex boundary: "^"
   * var match = this.match(/^\./);
   * ```
   * @name .prev
   * @param {RegExp} `regex`
   * @return {Object}
   * @api public
   */

  match: function(regex) {
    var m = regex.exec(this.input);
    if (m) {
      this.updatePosition(m[0], m[0].length);
      return m;
    }
  },

  /**
   * Push `node` to `parent.nodes` and assign `node.parent`
   */

  pushNode: function(node, parent) {
    if (node && parent) {
      if (parent === node) parent = this.ast;
      define(node, 'parent', parent);

      if (parent.nodes) parent.nodes.push(node);
      if (this.sets.hasOwnProperty(parent.type)) {
        this.currentType = parent.type;
      }
    }
  },

  /**
   * Capture end-of-string
   */

  eos: function() {
    if (this.input) return;
    var pos = this.position();
    var prev = this.prev();

    while (prev.type !== 'root' && !prev.visited) {
      if (this.options.strict === true) {
        throw new SyntaxError('invalid syntax:' + prev);
      }

      if (!util.hasOpenAndClose(prev)) {
        define(prev.parent, 'escaped', true);
        define(prev, 'escaped', true);
      }

      this.visit(prev, function(node) {
        if (!util.hasOpenAndClose(node.parent)) {
          define(node.parent, 'escaped', true);
          define(node, 'escaped', true);
        }
      });

      prev = prev.parent;
    }

    var node = pos(this.node(this.append || '', 'eos'));
    if (typeof this.options.eos === 'function') {
      node = this.options.eos.call(this, node);
    }

    if (this.parsers.eos) {
      this.parsers.eos.call(this, node);
    }

    define(node, 'parent', this.ast);
    return node;
  },

  /**
   * Run parsers to advance the cursor position
   */

  getNext: function() {
    var parsed = this.parsed;
    var len = this.types.length;
    var idx = -1;

    while (++idx < len) {
      var type = this.types[idx];
      var tok = this.parsers[type].call(this);
      if (tok === true) {
        break;
      }

      if (tok) {
        tok.type = tok.type || type;
        define(tok, 'rest', this.input);
        define(tok, 'parsed', parsed);
        this.last = tok;
        this.tokens.push(tok);
        this.emit('node', tok);
        return tok;
      }
    }
  },

  /**
   * Run parsers to get the next AST node
   */

  advance: function() {
    var input = this.input;
    this.pushNode(this.getNext(), this.prev());

    // if we're here and input wasn't modified, throw an error
    if (this.input && input === this.input) {
      var chokedOn = this.input.slice(0, 10);
      var err = this.error('no parser for: "' + chokedOn, this.last);
      if (this.hasListeners('error')) {
        this.emit('error', err);
      } else {
        throw err;
      }
    }
  },

  /**
   * Parse the given string an return an AST object.
   *
   * ```js
   * var ast = parser.parse('foo/bar');
   * ```
   * @param {String} `input`
   * @return {Object} Returns an AST with `ast.nodes`
   * @api public
   */

  parse: function(input) {
    if (typeof input !== 'string') {
      throw new TypeError('expected a string');
    }

    this.init(this.options);
    this.orig = input;
    this.input = input;

    // run parsers
    while (this.input) this.advance();

    // balance unmatched sets, if not disabled
    balanceSets(this, this.stack.pop());

    // create end-of-string node
    var eos = this.eos();
    var ast = this.prev();
    if (ast.type === 'root') {
      this.pushNode(eos, ast);
    }
    return this.ast;
  },

  /**
   * Visit `node` with the given `fn`
   */

  visit: function(node, fn) {
    if (!isObject(node) || node.isNode !== true) {
      throw new Error('expected node to be an instance of Node');
    }
    if (node.visited) return;
    node.define('visited', true);
    node = fn(node) || node;
    if (node.nodes) {
      this.mapVisit(node.nodes, fn, node);
    }
    return node;
  },

  /**
   * Map visit over array of `nodes`.
   */

  mapVisit: function(nodes, fn, parent) {
    for (var i = 0; i < nodes.length; i++) {
      this.visit(nodes[i], fn);
    }
  }
});

function balanceSets(parser, node) {
  if (node && parser.options.strict === true) {
    throw parser.error('imbalanced "' + node.type + '": "' + parser.orig + '"');
  }
  if (node && node.nodes && node.nodes.length) {
    var first = node.nodes[0];
    first.val = '\\' + first.val;
  }
}

/**
 * Expose `Parser`
 */

module.exports = Parser;
