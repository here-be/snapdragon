'use strict';

/**
 * For the examples, an object of parsers is loaded
 * from the `./examples` directory.
 */

var extend = require('extend-shallow');
var example = require('./app');
var renderers = example.renderers;
var parsers = example.parsers;
var Snapdragon = require('..');
var snapdragon = new Snapdragon();
var cache = {};

/**
 * Parse
 */

function parse(str, options) {
  var parser = snapdragon.parser(str, options);

  // register parsers
  parser
    .set('braceOpen', parsers.braces.open)
    .set('braceInner', parsers.braces.inner)
    .set('braceClose', parsers.braces.close)
    .set('braceBraces', parsers.braces.braces)
    .set('invalid', parsers.base.invalid);

  // middleware: 'filepath'
  parser
    .use(parsers.filepath.backslash)
    .use(parsers.filepath.slash)
    .use(parsers.filepath.ext)

    // middleware: 'base'
    .use(parsers.base.space)
    .use(parsers.base.dot)
    .use(parsers.base.escape)
    .use(parsers.base.comma)
    .use(parsers.base.dash)
    .use(parsers.base.text)

    // middleware: 'braces'
    .use(parsers.braces.nodes)
    .use(parsers.base.invalid({
      type: 'braces.invalid',
      re: /^(?!\\)\}/,
      delim: '\\}'
    }));

  return parser.parse();
}

/**
 * Render
 */

function render(ast, options) {
  options = extend({renderers: renderers, sourcemap: true}, options);
  return snapdragon.renderer(ast, options).render();
}

/**
 * All together
 */

function braces(str) {
  if (cache.hasOwnProperty(str)) {
    return cache[str];
  }
  var ast = parse(str);
  console.log(ast.nodes)
  var res = render(ast);
  return (cache[str] = [res.result]);
}

// var str ='foo/{a,b,c,{d,e,{f,g}}}/bar/{x,y}/baz';
var str ='foo {a,b} baz';
console.log(braces(str));


module.exports = braces;
