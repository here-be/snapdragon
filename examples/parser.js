'use strict';

var Parser = require('../lib/parser');

var parser = new Parser()
  .set('at', function() {
    var pos = this.position();
    var match = this.match(/^@/);
    if (match) {
      return pos({val: match[0]});
    }
  })
  .set('slash', function() {
    var pos = this.position();
    var match = this.match(/^\//);
    if (match) {
      return pos({val: match[0]});
    }
  })
  .set('text', function() {
    var pos = this.position();
    var match = this.match(/^\w+/);
    if (match) {
      return pos({val: match[0]});
    }
  })
  .set('dot', function() {
    var pos = this.position();
    var match = this.match(/^\./);
    if (match) {
      return pos({val: match[0]});
    }
  })
  .set('colon', function() {
    var pos = this.position();
    var match = this.match(/^:/);
    if (match) {
      return pos({val: match[0]});
    }
  })

var ast = parser.parse('git@github.com:foo/bar.git');
console.log(ast);
