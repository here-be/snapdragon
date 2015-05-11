## Generalizing parsers

To make the parser more re-usable, we can wrap it in another function and allow the regex pattern and `type` to be passed as arguments.

```js
function character(re, type) {
  return function () {
    var pos = this.position();
    var m = this.match(re);
    if (!m) return;
    return pos({
      type: type,
      val: m[0]
    });
  };
}
```

**Usage**

```js
snapdragon.parser(str, options)
  .set('slash', character(/^\//, 'slash'))
  .set('backslash', character(/^\\/, 'backslash'))
```