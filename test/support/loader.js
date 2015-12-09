'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('matched');
var extend = require('extend-shallow');

module.exports = function loader(patterns, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts;
    opts = {};
  }

  opts = extend({cwd: ''}, opts);
  var files = glob.sync(patterns, opts);

  return files.map(function (fp) {
    var file = {path: path.join(opts.cwd, fp)};
    file.content = fs.readFileSync(file.path, 'utf8');
    if (typeof fn === 'function') fn(file);
    return file;
  });
};
