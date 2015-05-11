'use strict';

var files = require('export-dirs')(__dirname);
delete files.renderers._;

function stringify(obj) {
  var res = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var type = obj[key];
      for (var prop in type) {
        if (type.hasOwnProperty(prop)) {
          res[key + '.' + prop] = type[prop];
        }
      }
    }
  }
  return res;
}

exports.parsers = files.parsers;
exports.renderers = stringify(files.renderers);
