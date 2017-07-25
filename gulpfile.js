var gulp = require('gulp');
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var ts = require('gulp-typescript');
var less = require('gulp-less');
var merge = require('merge2'); 
var manifest = require("gulp-manifest");
var rm = require('gulp-rimraf');
var path = require('path');


var uiProject = ts.createProject('src/ts/app/tsconfig.json');

var generationWorkerProject = ts.createProject('src/ts/workers/tsconfig.json');

var generationWorkerProjectFallback = ts.createProject('src/ts/workers/tsconfig.json', {
    out: 'processing-fallback.js',
    target: "es5",
    downlevelIteration: true,
    lib: ["webworker", "es6"],
});

var dataAccessWorkerProject = ts.createProject('src/ts/workers/tsconfig.json');


gulp.task("clean",
    function(cb) {
        gulp.src(["static/js/*", "dist/*"]).pipe(rm());
        gulp.src(["static/css/style.css"]).pipe(rm());
        cb();
    });


gulp.task('styles', function () {
  return gulp.src('./src/less/style.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'src', 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./static/css'));
});


gulp.task('build:contrib', function () {
	return gulp.src([
            'src/js/contrib/promise-1.0.0.min.js',
            'src/js/contrib/react.min.js',
            'src/js/contrib/react-dom.min.js'
        ])
        .pipe(concat('contrib.js'))
        .pipe(gulp.dest('static/js/'));
})

gulp.task('build:main', function () {
	return gulp.src('src/ts/app/manticore.ts')
        .pipe(uiProject())
        .pipe(gulp.dest('static/js'))
        ;
})

gulp.task('build:data-access', function () {
	return gulp.src('src/ts/workers/data-access.ts')
        .pipe(dataAccessWorkerProject())
        .pipe(gulp.dest('static/js'))
        ;
})

gulp.task('build:processing', function () {
	return gulp.src('src/ts/workers/generation-process.ts')
        .pipe(generationWorkerProject())
        .pipe(gulp.dest('static/js'))
        ;
})

gulp.task('build:processing:fallback', function () {
	return gulp.src(['src/ts/workers/generation-process.ts'])
        .pipe(generationWorkerProjectFallback())
        .pipe(gulp.dest('static/js'))        
        ;
})


gulp.task('build', ['styles', 'build:contrib', 'build:main', 'build:data-access', 'build:processing', 'build:processing:fallback']);


gulp.task('dist', ['build'], function () {
    function copy(src, dest) {
        return gulp.src(src).pipe(gulp.dest(dest));
    }
    return merge([
        copy('index.html', 'dist'),
        copy('static/**/*', 'dist/static'),
    ])
});


gulp.task('manifest', ['dist'], function () {
    return gulp.src(["dist/**/*"])
        .pipe(manifest({
            filename: "manifest.appcache",
            hash: true,
            exclude: [
                "manifest.appcache",
                "**/Thumbs.db"
            ],
            network: [

            ]
        }))
        .pipe(gulp.dest("./dist/"))
        ;
})


gulp.task('default', ['manifest']);


gulp.task('watch', [], function() {
    gulp.watch('src/ts/**/*.ts', ['default']);
});
