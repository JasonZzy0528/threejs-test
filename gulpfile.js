var gulp = require('gulp');
var browserSync = require('browser-sync');
var config = require('./gulp.config')();
var $ = require('gulp-load-plugins')({lazy: true});
var historyApiFallback = require('connect-history-api-fallback')
console.log(historyApiFallback)

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

gulp.task('sass', function() {
  log('Compiling Sass --> CSS');

  var sassOptions = {
    outputStyle: 'nested' // nested, expanded, compact, compressed
  };

  return gulp
  .src(config.sass)
  .pipe($.plumber({errorHandler: swallowError}))
  .pipe($.sourcemaps.init())
  .pipe($.sass(sassOptions))
  .pipe($.autoprefixer())
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest(config.app + '/styles'))
  .pipe(browserSync.stream());
});

gulp.task('sass-watcher', function() {
  gulp.watch([config.sass], ['sass']);
});

gulp.task('inject', function() {
  gulp.src(config.index)
  .pipe( $.inject(gulp.src(config.js), {relative: true}) )
  .pipe(gulp.dest(config.app));
});


gulp.task('serve', ['sass', 'sass-watcher'], function() {
  startBrowserSync('serve');
});

function log(msg) {
  if (typeof(msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.green(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.green(msg));
  }
}

function swallowError (error) {
  // If you want details of the error in the console
  console.log(error.toString());

  this.emit('end');
}

function startBrowserSync(opt) {
  if (browserSync.active) {
    return;
  }

  var options = {
    port: 3000,
    ghostMode: {
      clicks: false,
      location: false,
      forms: false,
      scroll: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'debug',
    logPrefix: 'gulp-patterns',
    notify: true,
    reloadDelay: 0, //1000,
    online: false
  };


  log('Serving app');
  serveApp();


  function serveApp() {
    gulp.watch([config.sass], ['sass']);

    options.server = {
      baseDir: [
        config.app
      ],
      middleware: [ historyApiFallback() ]
    };
    options.files = [
      config.app + '/**/*.*',
    ];

    browserSync(options);
  }
}
