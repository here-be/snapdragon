var Snapdragon = require('..');
var snapdragon = new Snapdragon();

/**
 *
 */

var ast = snapdragon.parse('foo/*.js');
console.log(ast);
