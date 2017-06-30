const
  //gulp
  gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),

  // stylus utils
  jeet = require('jeet'),
  nib = require('nib'),
  rupture = require('rupture'),
  koutSwiss = require('kouto-swiss'),

  // js - browserify
  browserify = require('browserify'),
  vss = require('vinyl-source-stream'),

  // browserSync
  browserSync = require('browser-sync').create();

const path = {
  "src": {
    "html": "src/pug/",
    "css": "src/styl/",
    "js": "src/js/",
    "img": "src/img/",
  },
  "dist": {
    "html": "dist/",
    "css": "dist/assets/css/",
    "js": "dist/assets/js/",
    "img": "dist/assets/img/",
  }
}

gulp.task('html', function() {
  gulp.src([
        path.src.html + '**/*.pug',
        '!' + path.src.html + '**/_*.pug'
      ])
    .pipe($.plumber())
    .pipe($.pug({pretty: true}))
    .pipe(gulp.dest(path.dist.html));
})

gulp.task('css', function() {
  gulp.src([
    path.src.css + '**/*.styl',
    '!' + path.src.css + '**/_*.styl'
  ])
  .pipe($.sourcemaps.init())
  .pipe($.plumber())
  .pipe($.stylus(
    {
      use: [
        nib(),
        rupture(),
        koutSwiss(),
        jeet(),
      ],
      compress: false,
      include: [
        './node_modules/../',
      ],
      'include css': true,
    }
  ))
  .pipe($.combineMediaQueries({log:true}))
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest(path.dist.css));
})

gulp.task('js', function() {
  browserify({
    entries: [
      path.src.js + 'libs.js',
      path.src.js + 'app.js',
    ],
    extensions: '.js',
    debug: true,
  })
  .bundle()
  .pipe(vss('main.js'))
  .pipe(gulp.dest(path.dist.js));
})

gulp.task('img', function() {
  gulp.src(path.src.img + '**/*')
    .pipe($.changed(path.dist.img))
    .pipe($.imagemin({
      optimizationLevel: 7,
    }))
    .pipe(gulp.dest(path.dist.img))
})

gulp.task('inline-svg', function() {
    return gulp.src(path.src.img + '/**/*.svg')
        .pipe($.svgmin())
        .pipe($.inlineSvg())
        .pipe(gulp.dest(path.dist.css));
});

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
        baseDir: path.dist.html,
        index: "index.html",
    },
    reloadDelay: 20,
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('default', ['browser-sync'], function () {
  gulp.watch(path.src.html + '**/*.pug', ['html','bs-reload']);
  gulp.watch(path.src.css + '**/*.styl', ['css','bs-reload']);
  gulp.watch(path.src.js + '**/*.js', ['js','bs-reload']);
  gulp.watch(path.src.img + '**/*', ['img','bs-reload']);
});
