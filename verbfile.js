'use strict';

module.exports = function(verb) {
  verb.use(require('verb-generate-readme'));
  verb.preLayout(/\.md$/, function(file, next) {
    if (!/(verb|readme)/.test(file.stem)) {
      file.layout = null;
    }
    next();
  });

  verb.task('docs', function(cb) {
    return verb.src('support/src/content/*.md', {cwd: __dirname})
      .pipe(verb.renderFile('md', {layout: null}))
      .pipe(verb.dest('docs'))
  });

  verb.task('default', ['docs', 'readme']);
};
