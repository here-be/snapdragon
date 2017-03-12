---
title: Creating your first Snapdragon parser
---

This guide will show you how to create a basic parser by starting off with the string we want to parse, and gradually adding the code we need based on feedback from Snapdragon.

Let's go!

## Prerequisites

Before we dive in, let's make sure you have snapdragon installed and setup properly.

### Install snapdragon

You can use either [npm](https://npmjs.com) or [yarn](https://yarnpkg.com/) to install snapdragon:

**Install with NPM**

```sh
$ npm install snapdragon
```

**Install with yarn**

```sh
$ yarn add snapdragon
```

### Setup snapdragon

Create a file in the current working directory named `parser.js` (or whatever you prefer), and add the following code:

```js
// add snapdragon using node's "require()"
var Snapdragon = require('snapdragon');

// create an instance of Snapdragon. This is the basis for your very own application.
var snapdragon = new Snapdragon();
```

With that out of the way, let's get started on our parser!

## Parsing strategy

Feel free to skip this section and jump [straight to the code](#learning-by-doing), or follow along as we discuss our high-level parser strategy and goals.

### Defining success

The purpose of this guide isn't to parse something complicated or super-interesting. It's to show you how the parser works. If we accomplish that, then you're only limited by your imagination!

**The goal**

The string we're going to parse is: `foo/*.js` (a basic glob pattern).

_(sidebar: whilst there are numerous approaches one could take to parsing or tokenizing any string, and there are many other factors that would need to be considered, such as escaping, user-defined options, and so on, we're going to keep this simple for illustrative purposes, thus these things fall outside of the scope of this guide)_

It's always good to have a basic parsing strategy before you start. As it relates to glob patterns, our high level strategy might be something like: "I want my parser to be able to differentiate between wildcards (stars in this case), slashes, and non-wildcard strings".

Our parser will be considered "successful" once it is able to do these things.

### Begin with the end in mind

**The expected result**

Our final AST will be an object with "nodes", where each "node" is an object with a `type` that semantically describes a substring that was captured by the parser.

Some of the node "types" on our final AST will also roughly end up reflecting the goals we described in our high level strategy. Our strategy gives us a starting point, but it's good to be flexible. In reality our parser might end up doing something completely different than what we expected in the beginning.

## Learning by doing

Okay, it's time to start writing code. To parse `foo/*.js` we'll need to figure out how to capture each "type" of substring.

Although we won't be doing any compiling in this guide, it will help to understand the role the compiler plays, so that you can factor that into your decisions with the parser.

**For every node type, there is a parser and a compiler**





The actual approach you use for determining where one substring ends and another begins can be a combination of regex, string position/index, or any other mechanism available to you in javascript. Whatever approach you take, Snapdragon's job is to make it as easy as possible for for you.

**



 node `type` Snapdragon uses "parsers" are the middleware that  to capture substrings. This is what we're going to create next.


But instead of thinking about code and what to capture, let's try a different approach and take advantage of snapdragon's error reporting to figure out the next step.

Update `parser.js` with the following code:

```js
var Snapdragon = require('snapdragon');
var snapdragon = new Snapdragon();

/**
 * <!-- leave some space here... we'll be adding code to make our parser work -->
 */

var ast = snapdragon.parse('foo/*.js');
console.log(ast);
```

Then run the following command:

```sh
$ node parser.js
```

You should see an error message that looks something like the following:

```console
Error: string <line:1 column:1>: no parser for: "foo/*.js
```

There are a few important bits of information in this message:

- `line:1 column: 1` tells us where in the input string this is happening. It's no suprise that we're getting an error on the very first character of our string.
- `no parser for:` tells us that no "parsers" are registered for the substring that follows in the error message.


###
