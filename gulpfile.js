"use strict";
var gulp = require('gulp');
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var ts = require('gulp-typescript');
var less = require('gulp-less');
var merge = require('merge2'); 
var manifest = require("gulp-manifest");
var rm = require('gulp-rimraf');
var path = require('path');
var webpack = require('webpack-stream');


const STATIC_PATH = "static/";
const BUILD_PATH = "build/";
const DIST_PATH = "dist/";
const SRC_PATH = "src/";

function resolve() {
    return path.resolve(path.join.apply(path, arguments));
}



class TsConcatUnit {
    constructor(tsconfig, unitInfo, override) {
        const inFiles = unitInfo.entrypoint;
        const outFile = unitInfo.unitName;

        this.ts = ts.createProject(tsconfig, override);
        this.inFiles = inFiles instanceof Array ? inFiles.map(e => resolve(BUILD_PATH, e)) : resolve(BUILD_PATH, inFiles);
        this.outFile = outFile;
    }

    gulpProcessor() {
        return this.ts();
    }

    bundleScript() {    
        return gulp.src(this.inFiles)
            .pipe(concat(this.outFile))
            .pipe(gulp.dest(resolve(DIST_PATH, STATIC_PATH, '/js/')));
    }
}


class TSExecutionUnit {    
    constructor(tsconfig, unitInfo, override) {
        const entrypoint = unitInfo.entrypoint;
        const unitName = unitInfo.unitName;

        this.ts = ts.createProject(tsconfig, override);
        this.entrypoint = entrypoint instanceof Array ? entrypoint.map(e => resolve(BUILD_PATH, e)) : resolve(BUILD_PATH, entrypoint);
        this.unitName = unitName;       
    }

    gulpProcessor() {
        return this.ts();
    }

    bundleScript() {
        return gulp.src(this.entrypoint)
            .pipe(webpack({                
                output: {
                    filename: resolve(STATIC_PATH, "/js/", this.unitName),                                  
                },                
            }))
            .pipe(gulp.dest(DIST_PATH))
    }
}


var uiProject = new TSExecutionUnit('src/ts/app/tsconfig.json', { 
    entrypoint: 'js/main/manticore.js',
    unitName: "main.js" 
}, {
    typeRoots: [
        resolve(BUILD_PATH, "/types/")
    ]
});

var commonProject = new TsConcatUnit('src/ts/common/tsconfig.json', { 
    entrypoint: [
        // ordered for dependancy
        "js/common/shims.js",
        "js/common/data.js",
        "js/common/event.js",
        "js/common/reply.js",
        "js/common/typed-workers.js",
        "js/common/costs.js",
        "js/common/messaging.js",
        "js/common/bestiary.js",
        "js/common/localstorage.js",
        "js/common/index.js",
    ], 
    unitName: "common.js" 
});

var generationWorkerProject = new TSExecutionUnit('src/ts/workers/tsconfig.json', {
     entrypoint: 'js/workers/generation-process.js', 
     unitName: "processing.js" 
});

var generationWorkerProjectFallback = new TSExecutionUnit('src/ts/workers/tsconfig-fallback.json', { 
    entrypoint: 'js/workers/generation-process.js', 
    unitName: "processing-fallback.js"
}, 
{
    typeRoots: [
        resolve(BUILD_PATH, "/types/")
    ]
});

var dataAccessWorkerProject = new TSExecutionUnit('src/ts/workers/tsconfig.json', {
    entrypoint: 'js/workers/data-access.js',
    unitName: "data-access.js"
}, {
    typeRoots: [
        resolve(BUILD_PATH, "/types/")
    ]
});


const units = [
    commonProject,

    uiProject,
    generationWorkerProject,
    generationWorkerProjectFallback,
    dataAccessWorkerProject
]


gulp.task("clean",
    function(cb) {
        gulp.src([
            resolve(STATIC_PATH, "/js/*"), 
            resolve(DIST_PATH, "/*"),
            resolve(BUILD_PATH, "/*")
        ]).pipe(rm());
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


gulp.task('build:common', function () {
    const result = gulp.src([resolve(SRC_PATH, '/ts/common/**/*.ts')])
                       .pipe(commonProject.gulpProcessor());

	return merge([
        result.js.pipe(gulp.dest(resolve(BUILD_PATH, '/js/common'))),
        result.dts.pipe(gulp.dest(resolve(BUILD_PATH, '/types/common')))
    ]);
})


gulp.task('build:main', ["build:common"],  function () {
	return gulp.src([
        resolve(SRC_PATH, '/ts/app/**/*.ts'), 
        resolve(SRC_PATH, '/ts/app/**/*.tsx')
    ])
        .pipe(uiProject.gulpProcessor())
        .pipe(gulp.dest(resolve(BUILD_PATH, '/js/main')))
        ;
})


gulp.task('build:workers', ["build:common"], function () {
	return gulp.src(resolve(SRC_PATH, '/ts/workers/**/*.ts'))
        .pipe(dataAccessWorkerProject.gulpProcessor())
        .pipe(gulp.dest(resolve(BUILD_PATH, '/js/workers')))
        ;
})

gulp.task('build:workers:fallback', ["build:common"], function () {
	return gulp.src([resolve(SRC_PATH, '/ts/workers/**/*.ts')])
        .pipe(generationWorkerProjectFallback.gulpProcessor())
        .pipe(gulp.dest(resolve(BUILD_PATH, '/js/workers-fallback')))
        ;
})


gulp.task('build', ['styles', 'build:contrib', 'build:main', 'build:workers', 'build:workers:fallback']);


gulp.task('dist', ['build'], function () {
    function copy(src, dest) {
        return gulp.src(src).pipe(gulp.dest(dest));
    }

    const outputs = units.map(u => u.bundleScript()).concat([        
        copy('index.html', 'dist'),
        copy('static/**/*', 'dist/static'),
    ])

    return merge(outputs)
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
