'use strict';

var dirs = require('export-dirs')(__dirname);
delete dirs._;
module.exports = dirs;
