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


gulp.task('default', function() {
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


gulp.task('watch', [], function() {
    gulp.watch('src/ts/**/*.ts', ['default']);
});
