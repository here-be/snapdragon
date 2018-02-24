WIP (draft)

# Overview

Thanks for visiting the snapdragon documentation! Please [let us know](../../issues) if you find any typos, outdated or incorrect information. Pull requests welcome.

## What is snapdragon?

At its heart, snapdragon does two things:

- Parsing: the [snapdragon parser](parsing.md) takes a string and converts it to an AST
- Compiling: the [snapdragon compiler](compiling.md) takes the AST from the snapdragon parser and converts it to another string.

**Plugins**

## What can snapdragon do?

You can use snapdragon to parse and convert a string into something entirely different, or use it to create "formatters" for beautifying code or plain text.

**In the wild**

Here's how some real projects are using snapdragon:

* [breakdance][]: uses snapdragon to convert HTML to markdown using an AST from [cheerio][]:
* [micromatch][]: uses snapdragon to create regex from glob patterns
* [extglob][]: uses snapdragon to create regex from glob patterns
* [braces][]: uses snapdragon to create regex for bash-like brace-expansion
* [expand-reflinks][]: uses snapdragon to parse and re-write markdown [reference links](http://spec.commonmark.org/0.25/#link-reference-definitions)

## About

Snapdragon was created by, [Jon Schlinkert](https://github.com/jonschlinkert), author of [assemble][], [generate][], [update][], [micromatch][], [remarkable][] and many other node.js projects.

If you'd like to learn more about me or my projects, or you want to get in touch, please feel free to:

- follow me on [github]() for notifications and updates about my github projects
- follow me on [twitter]()
- connect with me on [linkedin](https://www.linkedin.com/in/jonschlinkert)
