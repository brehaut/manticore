var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2'); 
var manifest = require("gulp-manifest");

var uiProject = ts({
    noImplicitAny: false,
    out: 'main.js',
    removeComments: true
});

var generationWorkerProject = ts({
    noImplicitAny: false,
    out: 'processing.js',
    removeComments: true,
    noLib: true,
})

var dataAccessWorkerProject = ts({
    noImplicitAny: false,
    out: 'data-access.js',
    removeComments: true,
    noLib: true,
})


gulp.task('build', function() {
    var ui = gulp.src('src/ts/manticore.ts')
        .pipe(uiProject)
        .pipe(gulp.dest('static/js'))
        ;
        
    var processingWorker = gulp.src('src/ts/workers/generation-process.ts')
        .pipe(generationWorkerProject)
        .pipe(gulp.dest('static/js'))
        ;
   
    var dataAccessWorker = gulp.src('src/ts/workers/data-access.ts')
        .pipe(dataAccessWorkerProject)
        .pipe(gulp.dest('static/js'))
        ;
   
    return merge([
        ui,
        processingWorker,
        dataAccessWorker
    ])
});


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
