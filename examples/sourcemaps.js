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

  return parser.parse();
}

/**
 * Render
 */

function render(ast, options) {
  options = extend({renderers: renderers, sourcemap: true}, options);
  var res = snapdragon.renderer(ast, options).render();
  if (res.patterns.length === 0) res.patterns.push(res.result);
  return res;
}

/**
 * All together
 */

var str ='foo/{a,b,c}/bar/\\{xyz}/baz.js';
var ast = parse(str);
var res = render(ast);
console.log(res.patterns);
