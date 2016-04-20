'use strict';

var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');

gulp.task('coverage', function() {
  return gulp.src(['lib/*.js', 'index.js'])
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire());
});

gulp.task('mocha', ['coverage'], function() {
  return gulp.src(['test/*.js'])
    .pipe(mocha())
    .pipe(istanbul.writeReports());
});

gulp.task('eslint', function() {
  return gulp.src(['*.js', 'lib/*.js', 'test/*.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('default', ['coverage', 'eslint', 'mocha']);
