var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2'); 

var uiProject = ts({
    noImplicitAny: false,
    out: 'main.js',
    removeComments: true
});

var generationWorkerProject = ts({
    noImplicitAny: false,
    out: 'worker.js',
    removeComments: true,
    noLib: true,
})

gulp.task('default', function() {
    var ui = gulp.src('src/ts/manticore.ts')
        .pipe(uiProject)
        .pipe(gulp.dest('static/js'))
        ;
        
    var processingWorker = gulp.src('src/ts/workers/generation-process.ts')
        .pipe(generationWorkerProject)
        .pipe(gulp.dest('static/js'))
        ;
   
    return merge([
        ui,
        processingWorker
    ])
});


gulp.task('watch', [], function() {
    gulp.watch('src/ts/**/*.ts', ['default']);
});
