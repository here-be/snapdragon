'use strict';

/**
 * For the examples, I'm just loading an object of
 * parsers from the `./examples` directory to make
 * it easy to see how they're registered.
 */

var extend = require('extend-shallow');
var example = require('./app');
var renderers = example.renderers;
var snapdragon = require('../');

/**
 * Generic middleware than can be customized
 * and reused
 */

function fn(re, type) {
  return function () {
    var pos = this.position();
    var m = this.match(re);
    if (!m) return;

    // return token, with value and type
    return pos({
      type: type,
      val: m[0]
    });
  };
}

function parse(str, options) {
  return snapdragon.parser(str, options)
    // register middleware as named parsers
    .set('backslash', fn(/^\\/, 'backslash'))
    .set('slash', fn(/^\//, 'slash'))

    // push middleware onto the `parsers` stack
    .use(function () {
      var pos = this.position();
      var m = this.match(/^\./);
      if (!m) return;
      return pos({
        type: 'dot',
        val: m[0]
      })
    })
    .use(function () {
      var pos = this.position();
      var m = this.match(/^\W+/);
      if (!m) return;

      var backslash = this.backslash();
      var slash = this.slash();

      return pos({
        type: 'path',
        nodes: [backslash, slash].filter(Boolean)
      })
    })
    .use(function () {
      var pos = this.position();
      var m = this.match(/^[a-z0-9]/i);
      if (!m) return;
      return pos({
        type: 'text',
        val: m[0]
      })
    })
    .parse();
}

/**
 * Render
 */

function render(ast, options) {
  options = extend({ renderers: renderers }, options);
  return snapdragon.renderer(ast, options)
    .set('backslash', function (node) {
      return this.emit(node.val);
    })
    .set('slash', function (node) {
      return this.emit(node.val);
    })
    .set('dot', function (node) {
      return this.emit(node.val);
    })
    .set('text', function (node) {
      return this.emit(node.val);
    })
    .set('path', function (node) {
      var val = node.val || '';
      if (node.nodes && node.nodes.length) {
        val += this.mapVisit(node.nodes);
      }
      return this.emit(val);
    })
    .render();
}

/**
 * All together
 */

var str ='foo/bar/\\/baz.js';
var ast = parse(str);
// console.log(ast.nodes)
console.log(render(ast));
