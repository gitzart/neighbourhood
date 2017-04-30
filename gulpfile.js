// Plugins
var gulp = require('gulp'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    // Gulp 4.0 will support defining task dependencies
    // in series or in parallel
    runSequence = require('run-sequence'),
    $ = require('gulp-load-plugins')();

// File paths
var sass_path = 'app/scss/**/*.scss',
    css_path = 'app/css/**/*.css',
    html_path = 'app/**/*.html',
    js_path = 'app/js/**/*.js',
    image_path = 'app/images/**/*.+(png|jpg|jpeg|gif|svg)',
    font_path = 'app/fonts/**/*',
    api_path = 'app/api/**/*';

/* =======================================================
 =================== Optimization
 ========================================================= */

// Compile SASS and prefix CSS
gulp.task('styles', function() {
  return gulp.src([sass_path])
    .pipe($.sass())
    .pipe($.autoprefixer())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.stream());
});

// Minify JS
gulp.task('scripts', function() {
  return gulp.src(js_path)
    .pipe($.newer('dist/js'))
    .pipe($.sourcemaps.init())
    .pipe($.uglify({preserveComments: 'license'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
});

// Lint JS
gulp.task('lint', function() {
  return gulp.src([js_path, '!app/js/lib/**/*.js'])
    .pipe($.eslint())
    .pipe($.eslint.format());
    // Uncomment the next line to stop Gulp immediately with linting errors
    // .pipe($.eslint.failAfterError());
});

// Scan HTML for assets, if any, optimize them
gulp.task('html', function() {
  return gulp.src(html_path)
    // Concat JS, CSS
    .pipe($.useref({
      searchPath: ['app']
    }))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.html', $.htmlmin({
      caseSensitive: true,
      collapseBooleanAttributes: true,
      // collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      minifyURLs: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
    })))
    .pipe(gulp.dest('dist'));
});

// Optimize images
gulp.task('images', function() {
  return gulp.src(image_path)
    .pipe($.cache($.imagemin([
      $.imagemin.gifsicle({interlaced: true}),
      $.imagemin.jpegtran({progressive: true}),
      $.imagemin.optipng({optimizationLevel: 5}),
      $.imagemin.svgo({plugins: [{removeViewBox: true}]})
    ])))
    .pipe(gulp.dest('dist/images'));
});

/* =======================================================
 =================== Documenting
 ========================================================= */

gulp.task('doc', function(cb) {
  gulp.src(['README.md', 'app/js/googlemap.js'], {read: false})
    .pipe($.jsdoc3(cb));
});

/* =======================================================
 =================== Copying
 ========================================================= */

// Copy whatever file/directory is necessary to the dist directory
gulp.task('copy:any', function() {
  return gulp.src([font_path, api_path], {base: 'app'})
    .pipe($.newer('dist'))
    .pipe(gulp.dest('dist'));
});

// Copy CSS libraries to app directory
gulp.task('copy:css', function() {
  return gulp.src([
    // Add specific CSS file path
    'bower_components/normalize-css/normalize.css'
  ])
    .pipe($.newer('app/css'))
    .pipe(gulp.dest('app/css'));
});

// Copy JS libraries to app directory
gulp.task('copy:js', function() {
  return gulp.src([
    // Add specific JS file path
    'bower_components/requirejs/require.js',
    'bower_components/knockout/dist/knockout.js',
    'bower_components/jquery/dist/jquery.js',
  ])
    .pipe($.newer('app/js/lib'))
    .pipe(gulp.dest('app/js/lib'));
});

// Main copying task
gulp.task('copy', function(cb) {
  runSequence(['copy:css', 'copy:js', 'copy:any'], cb);
});

/* =======================================================
 =================== Cleaning
 ========================================================= */

// Clean the cached files
gulp.task('clean:cache', function(done) {
  return $.cache.clearAll(done);
});

// Clean the production directory
gulp.task('clean:dist', function() {
  return del.sync('dist');
});

// Main cleaning task
gulp.task('clean', function(cb) {
  runSequence(['clean:cache', 'clean:dist'], cb);
});

/* =======================================================
 =================== Tasks handling
 ========================================================= */

// Build production files
gulp.task('build', function(cb) {
  runSequence(
    ['clean', 'copy'],
    ['styles', 'lint', 'scripts', 'images'],
    'html',
    cb
  );
});

// Build and serve the production files
gulp.task('serve:dist', ['build'], function() {
  browserSync.init({
    notify: false,
    // browser: ['google chrome'],
    // Comment the previous line and uncomment the next line
    // to test on all 4 popular browsers
    browser: ['google chrome', 'safari', 'firefox', 'opera'],
    logPrefix: 'Neighbourhood',
    scrollingElementMapping: ['body'],
    https: true,
    server: 'dist',
    port: 3001
  });
});

// Watch development files
gulp.task('default', ['copy', 'styles'], function() {
  browserSync.init({
    notify: true,
    // browser: ['google chrome'],
    // Comment the previous line and uncomment the next line
    // to test on all 4 popular browsers
    browser: ['google chrome', 'safari', 'firefox', 'opera'],
    logPrefix: 'Neighbourhood',
    scrollingElementMapping: ['body'],
    // Uncomment the next line to test with secure HTTP
    // https: true,
    server: 'app',
    port: 3000
  });

  gulp.watch([html_path], browserSync.reload);
  gulp.watch([sass_path], ['styles']);
  gulp.watch([js_path], ['lint', browserSync.reload]);
  gulp.watch([image_path], browserSync.reload);
  gulp.watch([font_path], browserSync.reload);
});
