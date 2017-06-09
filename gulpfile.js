var gulp        = require('gulp'),
    sass        = require('gulp-sass'),
    prefix      = require('gulp-autoprefixer'),
    plumber     = require('gulp-plumber'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    minify      = require('gulp-clean-css'),
    sourcemaps  = require('gulp-sourcemaps'),
    merge       = require('merge-stream'),
    rename      = require("gulp-rename"),
    imagemin    = require("gulp-imagemin"),
    pngquant    = require('imagemin-pngquant'),
    php         = require('gulp-connect-php'),
    livereload  = require('gulp-livereload'),
    gutil       = require('gulp-util');

var assetsDir   = 'assets/';


var paths = {
    js: {
        src: assetsDir + 'js',
        pub: assetsDir + 'js'
    },
    scss : {
        src: assetsDir + 'scss/',
        pub: assetsDir + 'css/',
        sassOpts: {
            outputStyle: 'expanded',
            precison: 3,
            errLogToConsole: true
            //includePaths: [bowerDir + 'bootstrap/scss']
        }
    },
    images : {
        src: 'images/'
    }
};


var onError = function (error) {
    gutil.beep();
    gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
    this.emit('end');
};


/**
 * PHP server @ localhost:8000
 */
gulp.task('php', function() {
    // remove trailing slash so it doesnt explode
    var dir = '.';
    php.server({
        base: dir,
        hostname: 'sccg.blue.local',
        open: true,
        port: 80,
        keepalive: true,
        livereload: true
    });
});


/**
 * livereload
 */
gulp.task('livereload', function() {

    gulp.watch([
        //paths.scss.src + '**/*.scss',
        paths.scss.pub + '**/*.css',
        paths.js.src + '**/*.js',
        './**/*.php'
    ], function (event) {
        gutil.log(event);
        gulp.src(event.path)
            .pipe(livereload());
    });

});


/**
 * Sass - autoprefix, concat, minify, merge with css files
 * @todo: run this on deploy
 **/
gulp.task('sass', function() {
    return gulp.src([
            paths.scss.src + '**/*.scss'
        ])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(sass(paths.scss.sassOpts))
        .pipe(prefix('last 2 versions', '> 1%', 'ie 8', 'Android 2', 'Firefox ESR'))
        //.pipe(concat('scss-files.css'));
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scss.pub));



});

gulp.task('minify-scss', function() {

    return gulp.src([
        paths.scss.src + '**/*.scss'
    ])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sass(paths.scss.sassOpts))
        .pipe(prefix('last 2 versions', '> 1%', 'ie 8', 'Android 2', 'Firefox ESR'))
        //.pipe(concat('scss-files.css'));
        //.pipe(gulp.dest(paths.scss.pub));


    /*
    var cssStream = gulp.src([
        bowerDir + 'style.css'
    ])
        .pipe(concat('css-files.css'));
    */

    //return merge(scssStream, cssStream)
        .pipe(sourcemaps.init())
        .pipe(concat('style.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(assetsDir + 'css/'))
        .pipe(concat('style.min.css'))
        .pipe(minify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(assetsDir + 'css/'));
});




/**
 * JS - Uglify
 **/
gulp.task('scripts', function() {
    gulp.src([
            //bowerDir + 'angular/angular.js',
            paths.js.src + '**/*.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(paths.js.pub))
        .pipe(uglify())
        .pipe(concat('scripts.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.js.pub));
    /*
    gulp.src(assetsDir + '*.js')
        .pipe(uglify())
        .pipe(rename({
            dirname: "min",
            suffix: ".copy"
        }))
        .pipe(gulp.dest(assetsDir + 'js'))
    */
});

/**
 * Compress images
 **/
gulp.task('images', function () {
    return gulp.src('images/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('images'));
});



gulp.task('prod', ['minify-scss', 'scripts'], function() {

});

gulp.task('default', ['sass', 'images', /*'php',*/ 'livereload', 'watch']);


gulp.task('watch', function () {

    livereload.listen();
    gulp.watch(paths.scss.src + '**/*.scss', ['sass']);
    gulp.watch(paths.js.src + '**/*.js', ['scripts']);
    gulp.watch('images/*', ['images']);

});