var path = require('path');
var gulp = require('gulp');

var concat = require('gulp-concat');
var size = require('gulp-size');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var through = require('through');
var gfi = require('gulp-file-insert');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var os = require('os');
var File = gutil.File;

var workers = {
	'laslaz': [
		'libs/plasio/workers/laz-perf.js',
		'libs/plasio/workers/laz-loader-worker.js'
	],
	'LASDecoder': [
		'src/Core/Commander/Providers/Potree/workers/LASDecoderWorker.js'
	],
	'BinaryDecoder': [
		'src/Core/Commander/Providers/Potree/workers/BinaryDecoderWorker.js',
		'src/Core/Commander/Providers/Potree/Version.js',
		'src/Core/Commander/Providers/Potree/PointAttributes.js'
	],
	'GreyhoundBinaryDecoder': [
		'libs/plasio/workers/laz-perf.js',
		'src/Core/Commander/Providers/Potree/workers/GreyhoundBinaryDecoderWorker.js'
		//'src/Core/Commander/Providers/Potree/PointAttributes.js',
		//'src/Core/Commander/Providers/Potree/Version.js'
	]
};

gulp.task('default', function(){
	runSequence('clean', 'prepare', 'tobin', 'concat');
});

gulp.task('clean', function() {
	gulp.src('build/workers', {read: false}).pipe(clean());
	gulp.src('src/Core/Commander/Providers/Potree/workers.js', {read: false})
		.pipe(clean());
});

gulp.task('tobin', function(){
	gulp.src(workers.laslaz)
		.pipe(encodeWorker('laslaz-worker.js', 'workers.laslaz'))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest('build/workers'));

	gulp.src(workers.LASDecoder)
		.pipe(encodeWorker('lasdecoder-worker.js', 'workers.lasdecoder'))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest('build/workers'));

	gulp.src(workers.BinaryDecoder)
		.pipe(encodeWorker('BinaryDecoderWorker.js', 'workers.binaryDecoder'))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest('build/workers'));

	gulp.src(workers.GreyhoundBinaryDecoder)
		.pipe(encodeWorker('GreyhoundBinaryDecoderWorker.js', 'workers.greyhoundBinaryDecoder'))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest('build/workers'));
});

var encodeWorker = function(fileName, varname, opt){
	if (!fileName) throw new PluginError('gulp-concat',  'Missing fileName option for gulp-concat');
	if (!opt) opt = {};
	if (!opt.newLine) opt.newLine = gutil.linefeed;

	var buffer = [];
	var firstFile = null;

	function bufferContents(file){
		if (file.isNull()) return; // ignore
		if (file.isStream()) return this.emit('error', new PluginError('gulp-concat',  'Streaming not supported'));

		if (!firstFile) firstFile = file;

		var string = file.contents.toString('utf8');
		buffer.push(string);
	}

	function endStream(){
		if (buffer.length === 0) return this.emit('end');

		var joinedContents = buffer.join('');
		var content = varname + ' = new WorkerManager(atob(\'' + new Buffer(joinedContents).toString('base64') + '\'));';

		var joinedPath = path.join(firstFile.base, fileName);

		var joinedFile = new File({
			cwd: firstFile.cwd,
			base: firstFile.base,
			path: joinedPath,
			contents: new Buffer(content)
		});

		this.emit('data', joinedFile);
		this.emit('end');
	}

	return through(bufferContents, endStream);
};

gulp.task('prepare', function(){
	gulp.src('./src/Core/Commander/Providers/Potree/workers.js.tpl')
		.pipe(rename('workers.js'))
		.pipe(gulp.dest('./src/Core/Commander/Providers/Potree'));
});

gulp.task('concat', function(){
	gulp.src('./src/Core/Commander/Providers/Potree/workers.js')
		.pipe(gfi({
		      '/* laslaz-worker */': 'build/workers/laslaz-worker.js',
		      '/* lasdecoder-worker */': 'build/workers/lasdecoder-worker.js',
		      '/* greyhound-worker */': 'build/workers/GreyhoundBinaryDecoderWorker.js',
		     }))
	  .pipe(gulp.dest('./src/Core/Commander/Providers/Potree'));
});
