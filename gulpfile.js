var gulp = require('gulp');
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var ts = require('gulp-typescript');
var merge = require('merge2'); 
var manifest = require("gulp-manifest");
var rm = require('gulp-rimraf');

var uiProject = ts({
    noImplicitAny: false,
    out: 'main.js',
    removeComments: true,
    jsx: "react",
    target: "es5",
    lib: ["es6", "dom"],
    strictNullChecks: true,
});

var generationWorkerProject = ts({
    noImplicitAny: false,
    out: 'processing.js',
    removeComments: true,
    strictNullChecks: true,
    lib: ["webworker", "es5"]
})

var dataAccessWorkerProject = ts({
    noImplicitAny: false,
    out: 'data-access.js',
    removeComments: true,
    strictNullChecks: true,
    lib: ["webworker", "es5"]
})


gulp.task("clean",
    function(cb) {
        gulp.src(["static/js/*", "dist/*"]).pipe(rm());
        cb();
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
        .pipe(uiProject)
        .pipe(gulp.dest('static/js'))
        ;
})

gulp.task('build:data-access', function () {
	return gulp.src('src/ts/workers/data-access.ts')
        .pipe(dataAccessWorkerProject)
        .pipe(gulp.dest('static/js'))
        ;
})

gulp.task('build:processing', function () {
	return gulp.src('src/ts/workers/generation-process.ts')
        .pipe(generationWorkerProject)
        .pipe(gulp.dest('static/js'))
        ;
})



gulp.task('build', ['build:contrib', 'build:main', 'build:data-access', 'build:processing']);


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
