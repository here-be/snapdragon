'use strict';

/**
 * For the examples, I'm just loading an object of
 * parsers from the `./examples` directory to make
 * it easy to see how they're registered.
 */

var extend = require('extend-shallow');
var example = require('./app');
var renderers = example.renderers;
var parsers = example.parsers;
var Snapdragon = require('..');
var snapdragon = new Snapdragon();


function parse(str, options) {
  var res = snapdragon.parser(str, options)
    .use(parsers.base.base(/^[a-z0-9]+/i, 'text'))
    .use(parsers.base.base(/^\\/, 'backslash'))
    .use(parsers.base.base(/^\//, 'slash'))
    .use(parsers.base.base(/^\./, 'dot'))
  return res.parse();
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
      var prev = this.ast.nodes[node.i - 1];
      var prefix = !/[\\\/]/.test(prev.val) ? '\\' : '';
      return this.emit(prefix + node.val);
    })
    .set('dot', function (node) {
      return this.emit(node.val);
    })
    .set('text', function (node) {
      var prev = this.ast.nodes[node.i - 1];
      if (prev && prev.val === '.' && node.val === 'coffee') {
        return this.emit('js');
      }
      return this.emit(node.val);
    })
    .render();
}

/**
 * All together
 */

var str ='foo/bar/\\/baz.coffee';
var ast = parse(str);
var res = render(ast);
console.log(res);
//=> 'foo\\/bar\\/\\/baz.js'
