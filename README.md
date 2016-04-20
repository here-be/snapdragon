# snapdragon [![NPM version](https://img.shields.io/npm/v/snapdragon.svg?style=flat)](https://www.npmjs.com/package/snapdragon) [![NPM downloads](https://img.shields.io/npm/dm/snapdragon.svg?style=flat)](https://npmjs.org/package/snapdragon) [![Build Status](https://img.shields.io/travis/jonschlinkert/snapdragon.svg?style=flat)](https://travis-ci.org/jonschlinkert/snapdragon)

> snapdragon is an extremely pluggable, powerful and easy-to-use parser-renderer factory.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install snapdragon --save
```

Created by [jonschlinkert](https://github.com/jonschlinkert) and [doowb](https://github.com/doowb).

**Features**

* Bootstrap your own parser, get sourcemap support for free
* All parsing and rendering is handled by simple, reusable middleware functions
* Inspired by the parsers in [pug](http://pug-lang.com) and the [css](https://github.com/reworkcss/css) lib.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install snapdragon --save
```

## Usage examples

```js
var Snapdragon = require('snapdragon');
var snapdragon = new Snapdragon();
```

**Parse**

```js
var ast = snapdragon.parser('some string', options)
  // parser middleware that can be called by other middleware
  .set('foo', function () {})
  // parser middleware, runs immediately in the order defined
  .use(bar())
  .use(baz())
```

**Render**

```js
// pass the `ast` from the parse method
var res = snapdragon.renderer(ast)
  // renderer middleware, called when the name of the middleware
  // matches the `node.type` (defined in a parser middleware)
  .set('bar', function () {})
  .set('baz', function () {})
  .render()
```

See the [examples](./examples/).

## Getting started

**Parsers**

Parsers are middleware functions used for parsing a string into an ast node.

```js
var ast = snapdragon.parser(str, options)
  .use(function() {
    var pos = this.position();
    var m = this.match(/^\./);
    if (!m) return;
    return pos({
      // `type` specifies the renderer to use
      type: 'dot',
      val: m[0]
    });
  })
```

**AST node**

When the parser finds a match, `pos()` is called, pushing a token for that node onto the ast that looks something like:

```js
{ type: 'dot',
  val: '.',
  position:
   { start: { line: 1, column: 1 },
     end: { line: 1, column: 2 } }}
```

**Renderers**

Renderers are _named_ middleware functions that visit over an array of ast nodes to render a string.

```js
var res = snapdragon.renderer(ast)
  .set('dot', function (node) {
    console.log(node.val)
    //=> '.'
    return this.emit(node.val);
  })
```

**Source maps**

If you want source map support, make sure to emit the position as well.

```js
var res = snapdragon.renderer(ast)
  .set('dot', function (node) {
    return this.emit(node.val, node.position);
  })
```

## Docs

### Parser middleware

A parser middleware is a function that returns an abject called a `token`. This token is pushed onto the AST as a node.

**Example token**

```js
{ type: 'dot',
  val: '.',
  position:
   { start: { line: 1, column: 1 },
     end: { line: 1, column: 2 } }}
```

**Example parser middleware**

Match a single `.` in a string:

1. Get the starting position by calling `this.position()`
2. pass a regex for matching a single dot to the `.match` method
3. if **no match** is found, return `undefined`
4. if a **match** is found, `pos()` is called, which returns a token with:
  - `type`: the name of the [renderer] to use
  - `val`: The actual value captured by the regex. In this case, a `.`. Note that you can capture and return whatever will be needed by the corresponding [renderer].
  - The ending position: automatically calculated by adding the length of the first capture group to the starting position.

## Renderer middleware

Renderers are run when the name of the renderer middleware matches the `type` defined on an ast `node` (which is defined in a parser).

**Example**

Exercise: Parse a dot, then render it as an escaped dot.

```js
var ast = snapdragon.parser('.')
  .use(function () {
    var pos = this.position();
    var m = this.match(/^\./);
    if (!m) return;
    return pos({
      // define the `type` of renderer to use
      type: 'dot',
      val: m[0]
    })
  })

var result = snapdragon.renderer(ast)
  .set('dot', function (node) {
    return this.emit('\\' + node.val);
  })
  .render()

//=> '\.'
```

## API

### [Parser](lib/parser.js#L18)

Create a new `Parser` with the given `options`.

**Params**

* `options` **{Object}**

**Example**

```js
var parser = new Parser();
parser.parse('foo');
```

### [.set](lib/parser.js#L65)

Register a parser middleware by name, so it can be called by other parsers. Parsers are added to the `prototype` to allow using `this`.

**Params**

* `name` **{String}**: Name of the parser to add to the prototype.
* `fn` **{Function}**: Rule function to add to the prototype.
* `returns` **{Object}** `this`: to enable chaining.

**Example**

```js
function heading() {
  //=> do stuff
}
function heading() {
  //=> do stuff
}

var ast = snapdragon.parser(str, options)
  .set('slash', function() {})
  .set('backslash', function() {})
  .parse();
```

### [.get](lib/parser.js#L87)

Get a cached parser by `name`

**Params**

* `name` **{String}**
* `returns` **{Function}**: Parser function

**Example**

```js
var braceOpen = parser.get('brace.open');
```

### [.use](lib/parser.js#L106)

Add a middleware to use for parsing the string resulting in a single node on the AST

**Params**

* `fn` **{Function}**: Middleware function to use.
* `returns` **{Object}** `this`: to enable chaining

**Example**

```js
parser
  .use(function() { ... })
  .use(function() { ... });
```

### [.position](lib/parser.js#L123)

Mark position and update `node.position`.

* `returns` **{Function}**: Function used to update the position when finished.

**Example**

```js
var pos = this.position();
var node = pos({type: 'dot'});
```

### [.match](lib/parser.js#L169)

Match `re` and return captures. Advances the position of the parser by the length of the captured string.

**Params**

* `re` **{RegExp}**
* `returns` **{Object}**: Push an object representing a parsed node onto the AST.

**Example**

```js
// match a dot
function dot() {
  var pos = this.position();
  var m = this.match(/^\./);
  if (!m) return;
  return pos({type: 'dot', val: m[0]});
}
```

### [.parse](lib/parser.js#L217)

Parse a string by calling each parser in the the `parsers` array until the end of the string is reached.

* `returns` **{Object}**: Object representing the parsed AST

**Example**

```js
var ast = snapdragon.parse();
```

### [Renderer](lib/renderer.js#L22)

Create an instance of `Renderer`.

**Params**

* `ast` **{Object}**: Takes the ast create by `.parse`
* `options` **{Object}**

**Example**

```js
var parser = new Parser();
var ast = parser.parse('foo');

var renderer = new Renderer();
var res = renderer.render(ast);
```

### [.set](lib/renderer.js#L65)

Register a renderer for a corresponding parser `type`.

**Params**

* `name` **{String}**: Name of the renderer to register
* `fn` **{Function}**: Function to register
* `returns` **{Object}**: Returns the `renderer` instance for chaining.

**Example**

```js
var ast = parse(str)
  .use(function() {
    // `type` is the name of the renderer to use
    return pos({ type: 'dot' });
  })

var res = render(ast, options)
  .set('dot', function(node) {
    return this.emit(node.val);
  })
```

### [.render](lib/renderer.js#L130)

Iterate over each node in the given AST and call renderer `type`.

* `returns` **{Object}**: Object representing the parsed AST

**Example**

```js
var ast = snapdragon.parse('foo/bar');
var res = snapdragon.render(ast);
console.log(res);

// enable sourcemap
var ast = snapdragon.parse('foo/bar');
var res = snapdragon.render(ast, {sourcemap: true});
console.log(res);
```

## Related projects

You might also be interested in these projects:

* [css](https://www.npmjs.com/package/css): CSS parser / stringifier | [homepage](https://github.com/reworkcss/css)
* [pug](https://www.npmjs.com/package/pug): A clean, whitespace-sensitive template language for writing HTML | [homepage](http://pug-lang.com)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/snapdragon/issues/new).

## Building docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install verb && npm run docs
```

Or, if [verb](https://github.com/verbose/verb) is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/jonschlinkert/snapdragon/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on April 20, 2016._