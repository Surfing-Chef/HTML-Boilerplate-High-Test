// REQUIRED
var gulp        = require('gulp'),
    sass        = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps  = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    del = require('del'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin');

// DEVELOPMENT TASKS
//////// Tasks used in development environment ////////
// Scripts Task - tasks related to js
gulp.task('scripts', function(){
  gulp.src(['js/**/*.js', '!src/js/**/*min.js'])
  .pipe(plumber())
  .pipe(concat('script.min.js'))
  .pipe(gulp.dest('src/js'))
  .pipe(uglify())
  .pipe(gulp.dest('src/js'))
  .pipe(browserSync.stream());
});

// Sass Task - development css - nested/readable/mapped
gulp.task('sassDev', function() {
  gulp.src('scss/**/*.scss')
  .pipe(plumber())
  .pipe(sourcemaps.init())
    .pipe(sass({sourceComments: 'map', sourceMap: 'sass', outputStyle: 'expanded'}))
    .pipe(autoprefixer('last 2 versions'))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('css/'))
  .pipe(browserSync.stream());
});

// Sass Task - deployment css - nested/readable/mapped
gulp.task('sassDep', function() {
  gulp.src('scss/**/*.scss')
  .pipe(plumber())
  .pipe(sourcemaps.init())
    .pipe(sass({sourceComments: 'map', sourceMap: 'sass', outputStyle: 'compressed'}))
    .pipe(autoprefixer('last 2 versions'))
  .pipe(sourcemaps.write('./'))
  .pipe(rename('css/style.min.css'))
  .pipe(gulp.dest('./'))
  .pipe(browserSync.stream());
});


// Server Task - Asynchronous browser syncing of assets across multiple devices
gulp.task('serve', function(){
  browserSync.init({
    proxy   : "http://localhost/HTML-Boilerplate"
  });

  gulp.watch('js/**/*.js', ['scripts']);
  gulp.watch('scss/**/*.scss', ['sassDev']);
  gulp.watch('scss/**/*.scss', ['sassDep']);
  gulp.watch('**/*.html').on('change', browserSync.reload);
  gulp.watch('**/*.php').on('change', browserSync.reload);
});

// Default Task
gulp.task('default', ['serve']);

////////////////////////////////////////////////////////
// DEPLOYMENT TASKS
//////// Tasks used to build deployment package ////////
gulp.task('build:cleanfolder', function(){
  return del([
    './build/**/*'
  ]);
});

// create build directory for all theme deployment files
gulp.task('build:copy', ['build:cleanfolder'], function(){
  return gulp.src([
                  './**/*/',
                  '.htaccess',
                  '!./css/**/*.txt',
                  '!./css/**/*.map',
                  '!./css/style.css',
                  '!./img/**/*',
                  '!./build'
                ])
  .pipe(gulp.dest('./build/'));
});

// minimize images in deployment directory
gulp.task('build:imgMin', ['build:copy'], function(){
    return gulp.src('./img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./build/img'));
});

// remove unwanted build files and directories
gulp.task('build:remove', ['build:imgMin'], function(done){
  return del([  // list files and directories to delete
    './build/gulpfile.js',
    './build/.git*',
    './build/node_modules',
    './build/scss/',
    './build/doc/',
    './build/README.md',
    './build/package.json',
  ], done);
});

// main build task
gulp.task('build', ['build:cleanfolder', 'build:copy', 'build:imgMin', 'build:remove']);
