WIP (draft)

# Snapdragon plugins

```js
var snapdragon = new Snapdgragon();
// register plugins
snapdragon.use(function() {});

// register parser plugins
snapdragon.parser.use(function() {});

// register compiler plugins
snapdragon.compiler.use(function() {});

// parse
var ast = snapdragon.parse('foo/bar');
```
