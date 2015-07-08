var gulp = require('gulp');
var util = require('gulp-util');

var htmlbook = require("gulp-htmlbook");
var intermediate = require('gulp-intermediate');
var spawn = require('child_process').spawn;
// var markdownToHtmlbook = require('htmlbook');
var through = require('through2');
var temp = require('temp').track();

// Map of htmlbook content, used to process xrefs
var map = [];

// Source .ipynb files
var source = "/notebooks/";
// Output html and asset files
var destination = "/var/www/html/";
// var destination = "compiled/";

var tempPath = temp.path() + '/';

// If order is not alphabetical, need to pass a files array
// Could be hardcoded or loaded from atlas.json
/*
var config = require('./atlas.json');
var files = config.files;
*/

// Convert the ipynb files to md
// Can't set the output folder in cli
gulp.task('transform', function(cb) {
	var err = '';
	var command = spawn('ipymd', [
		'--from', 'notebook',
		'--to', 'atlas',
		source + '*.ipynb'
		]);

	// command.stdout.on('data', function(data) {
  // 	console.log(data);
  // });

  command.stderr.on('data', function(data) {
		err += data.toString();
  });

	command.on('close', function(data) {
		if (err) {
			console.error("ipymd error:", err);
		}
		cb();
	});

});

// Compiles HTMLBook from IPython notebook markdown
// Requires that ipymd is installed: https://github.com/rossant/ipymd/
// pip install ipymd
gulp.task('compile', ['transform'], function() {
  return gulp.src(source+'**/*.md')
		// Transform the md to htmlbook
		// .pipe(through.obj(function(file, enc, cb){
		// 	var contents = file.contents.toString();
		// 	var result = markdownToHtmlbook(contents).parse();
		//
		// 	file.contents = new Buffer(result, "utf-8");
		// 	file.path = util.replaceExtension(file.path, '.html');
		// 	cb(null, file);
		// }))
		.pipe(htmlbook.tools.markdown())
    // .pipe(htmlbook.layout.chunk()) // Optionally split on sections
    // .pipe(htmlbook.process.ids()) // Add id's to elements that need them
    .pipe(gulp.dest(tempPath));

});

// Map the content, for use with xrefs, toc, ect...
gulp.task('map', ['compile'], function() {
  return gulp.src(tempPath+"*.html")
    // .pipe(order(files))
		.pipe(htmlbook.generate.map(function(_map){
      map = _map;
    }));
});

// Template the content using liquid, wrap in html
gulp.task('template', ['compile', 'map', 'xrefs'], function() {
	// Order by files array
	// or order naturally if files not present
	var _files = (typeof files != 'undefined') ? files : Object.keys(map.titles);

  return gulp.src(tempPath+"*.html")
    .pipe(htmlbook.layout.ordering(_files, map))
    .pipe(htmlbook.layout.template({
      templatePath : "./thebe_assets/layout.html"
    }))
    .pipe(gulp.dest(tempPath));

});

// Process Cross References in content
// replaces links and link text
gulp.task('xrefs', ['compile', 'map'], function() {
  return gulp.src(tempPath+"*.html")
    .pipe(htmlbook.process.xrefs(map))
    .pipe(gulp.dest(tempPath));
});

// Move over images
gulp.task('images', function() {
  return gulp.src(['images/**', source+'images/**'])
    .pipe(gulp.dest(destination+'images'))
});

// Move over thebe assets, referenced in template.
gulp.task('assets', function() {
  return gulp.src(['thebe_assets/**', '!thebe_assets/*.html'])
    .pipe(gulp.dest(destination+'thebe_assets'))
});

// Run all content tasks
gulp.task('process', ['compile', 'template', 'map', 'xrefs'], function() {
  return gulp.src(tempPath+"*.html")
    .pipe(gulp.dest(destination));
});

// Run all tasks
gulp.task('default', ['process', 'assets', 'images']);

// Rerun the task when a file changes, will not move assets
gulp.task('watch', ['process', 'assets', 'images'], function() {
  var watcher = gulp.watch(source+"/**/*", ['process']);
});
