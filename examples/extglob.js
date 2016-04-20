'use strict';

var Renderer = require('../lib/renderer');
var Parser = require('../lib/parser');
var parser = new Parser()
  .use(function() {
    var pos = this.position();
    var m = this.match(/^\\(.)/);
    if (!m) return;
    return pos({
      type: 'escaped',
      val: m[1]
    });
  })
  .use(function() {
    var pos = this.position();
    var m = this.match(/^\{/);
    if (!m) return;
    this.isOpen = true;
    return pos({
      type: 'brace.open',
      val: m[0]
    });
  })
  .use(function() {
    var pos = this.position();
    var m = this.match(/^\}/);
    if (!m) return;

    if (!this.isOpen) {
      throw new Error('missing opening brace');
    }
    this.isOpen = false;
    return pos({
      type: 'brace.close',
      val: m[0]
    });
  })
  .use(function() {
    var pos = this.position();
    var m = this.match(/^,/);
    if (!m) return;
    return pos({
      type: 'comma',
      val: m[0]
    });
  })
  .use(function() {
    var pos = this.position();
    var m = this.match(/^\w+/);
    if (!m) return;
    return pos({
      type: 'text',
      val: m[0]
    });
  })
  .use(function() {
    var pos = this.position();
    var m = this.match(/^\//);
    if (!m) return;
    return pos({
      type: 'slash',
      val: m[0]
    });
  });

var renderer = new Renderer()
  .set('escaped', function(node)  {
    return this.emit('\\' + node.val, node.position);
  })
  .set('brace.open', function(node)  {
    return this.emit('(?:', node.position);
  })
  .set('brace.close', function(node)  {
    return this.emit(')', node.position);
  })
  .set('comma', function(node)  {
    return this.emit('|', node.position);
  })
  .set('text', function(node)  {
    return this.emit(node.val, node.position);
  })
  .set('slash', function(node)  {
    return this.emit('/', node.position);
  });

var ast = parser.parse('a/\\{{b,c,d}/e');
var res = renderer.render(ast, {sourcemap: true});

console.log(res);
