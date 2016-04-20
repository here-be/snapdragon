'use strict';

/**
 * For the examples, an object of parsers is loaded
 * from the `./examples` directory.
 */

var extend = require('extend-shallow');
var snapdragon = require('..')();
var cache = {};

/**
 * Custom parsers/renderers
 */

var app = require('./app');
var renderers = app.renderers;
var parsers = app.parsers;

/**
 * Parse
 */

function parse(str, options) {
  var parser = snapdragon.parser(options);

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

  return parser.parse(str);
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

// var str ='foo/{a,b,c}/bar/\\{xyz}/baz.js';
var str ='foo/{a,b,c}/bar/{xyz}/baz.js';
var ast = parse(str);
var res = render(ast);
console.log(res.result);