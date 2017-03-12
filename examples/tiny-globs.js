'use strict';

var Snapdragon = require('..');
var Snapdragon = new Snapdragon();

/**
 * 1
 */


// var parser = new Parser();
// console.log(parser.parse('foo/*.js'));


/**
 * 2
 */


snapdragon.parser
  .set('text', function() {
    var pos = this.position();
    var m = this.match(/^\w+/);
    if (m) {
      return pos(this.node(m[0]));
    }
  })
  .set('slash', function() {
    var pos = this.position();
    var m = this.match(/^\//);
    if (m) {
      return pos(this.node(m[0]));
    }
  })
  .set('star', function() {
    var pos = this.position();
    var m = this.match(/^\*/);
    if (m) {
      return pos(this.node(m[0]));
    }
  })
  .set('dot', function() {
    var pos = this.position();
    var m = this.match(/^\./);
    if (m) {
      return pos(this.node(m[0]));
    }
  });

console.log(parser.parse('foo/*.js'));
