'use strict';

var Parser = require('./lib/parser');

// var parser = new Parser('**/foo/*.js');
var parser = new Parser('**/{a,b,/{c,d}}/*.js');
var res = parser.parse();

console.log(res.ast.nodes[2]);
