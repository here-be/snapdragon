var Snapdragon = require('..');
var snapdragon = new Snapdragon();

var ast = snapdragon.parser
  .set('dot', function () {
    var pos = this.position();
    var m = this.match(/^\./);
    if (!m) return;
    return pos({
      // define the `type` of compiler to use
      // setting this value is optional, since the
      // parser will add it based on the name used
      // when registering the handler, but it's
      // good practice since tokens aren't always
      // returned
      type: 'dot',
      val: m[0]
    })
  })
  .parse('.')

var result = snapdragon.compiler
  .set('dot', function (node) {
    return this.emit('\\' + node.val);
  })
  .compile(ast)

console.log(result.output);
//=> '\.'
