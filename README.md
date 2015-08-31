# snapdragon [![NPM version](https://badge.fury.io/js/snapdragon.svg)](http://badge.fury.io/js/snapdragon)  [![Build Status](https://travis-ci.org/jonschlinkert/snapdragon.svg)](https://travis-ci.org/jonschlinkert/snapdragon)

> snapdragon is an extremely pluggable, powerful and easy-to-use parser-renderer factory.

Created by [jonschlinkert](https://github.com/jonschlinkert) and [doowb](https://github.com/doowb).

**Features**

* Bootstrap your own parser, get sourcemap support for free
* All parsing and rendering is handled by simple, reusable middleware functions
* Inspired by the parsers in [Jade](http://jade-lang.com) and [CSS](https://github.com/reworkcss/css).

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i snapdragon --save
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
  // parser middleware that will be run immediately, in the order defined
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

See the [examples](./examples/)

* [basic](./examples/basic-example.js)
* [glob](./examples/glob-example.js)
* [sourcemaps](./examples/sourcemap-example.js)

Try running all three examples from the command line. Just do:

* `node examples/basic-example.js`
* `node examples/glob-example.js`
* `node examples/sourcemap-example.js`

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
     end: { line: 1, column: 2 } }
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
     end: { line: 1, column: 2 } }
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

### Parse

### [.position](lib/parser.js#L98)

Mark position and update `node.position`.

* `returns` **{Function}**: Function used to update the position when finished.

**Example**

```js
var pos = this.position();
var node = pos({type: 'dot'});
```

### [.hint](lib/parser.js#L122)

Set a `hint` to be used by downstream parsers.

**Params**

* `prop` **{String}**
* `val` **{any}**
* `returns` **{Object}**: Returns the `Parser` instance for chaining.

**Example**

```js
this.hint('bracket.start', true);
```

### [.error](lib/parser.js#L139)

Set an error message with the current line number and column.

**Params**

* `msg` **{String}**: Message to use in the Error.

**Example**

```js
this.error('Error parsing string.');
```

### [.set](lib/parser.js#L185)

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
  .set('slash', function(){})
  .set('backslash', function(){})
  .parse();
```

### [.parse](lib/parser.js#L220)

Parse the currently loaded string with the specified parser middleware.

* `returns` **{Object}**: Object representing the parsed AST

**Example**

```js
var ast = snapdragon.parse();
```

### [.match](lib/parser.js#L261)

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

### [.use](lib/parser.js#L313)

Add a middleware to use for parsing the string resulting in a single node on the AST

**Params**

* `fn` **{Function}**: Middleware function to use.
* `returns` **{Object}** `this`: to enable chaining

**Example**

```js
parser
  .use(function () { ... })
  .use(function () { ... });
```

### Render

### [Renderer](lib/renderer.js#L21)

Create an instance of `Renderer`. This is only necessary if need to create your own instance.

**Params**

* `ast` **{Object}**: Pass the ast generated by `snapdragon.parse()`
* `options` **{Object}**

**Example**

```js
var renderer = new snapdragon.Renderer();
```

### [.error](lib/renderer.js#L57)

Set an error message with the current line number and column.

**Params**

* `message` **{String}**: Message to use in the Error.

**Example**

```js
this.error('Error parsing string.');
```

### [.set](lib/renderer.js#L99)

Register a renderer for a corresponding parser `type`.

**Params**

* `name` **{String}**: Name of the renderer to register
* `fn` **{Function}**: Function to register
* `returns` **{Object}** `this`: for chaining.

**Example**

```js
var ast = snapdragon.parse(str)
  .use(function() {
    // `type` is the name of the renderer to use
    return pos({ type: 'dot' });
  })

var res = snapdragon.render(ast, options)
  .set('dot', function (node) {
    return this.emit(node.val);
  })
```

## TODO

* [x] getting started
* [ ] docs for `.use`
* [ ] docs for `.set`
* [ ] docs for child `nodes` (recursion)
* [ ] unit tests
* [ ] benchmarks

## Related projects

Snapdragon was inspired by these great projects by [tj](https://github.com/tj):

* [css](https://www.npmjs.com/package/css): CSS parser / stringifier | [homepage](https://github.com/reworkcss/css)
* [jade](https://www.npmjs.com/package/jade): A clean, whitespace-sensitive template language for writing HTML | [homepage](http://jade-lang.com)

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/snapdragon/issues/new).

## Authors

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

**Brian Woodward**

* [github/doowb](https://github.com/doowb)
* [twitter/doowb](http://twitter.com/doowb)

## License

Copyright © 2015 Jon Schlinkert
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on August 31, 2015._
