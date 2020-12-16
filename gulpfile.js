'use strict';

var gulp = require('gulp'),
	watch = require('gulp-watch'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    del = require('del'),
    svgSprite = require('gulp-svg-sprite'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        icons: 'build/icons/',
        fonts: 'build/fonts/',
        favicon: 'build/favicon/',
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/app.scss',
        img: 'src/img/**/*.*',
        icons: 'src/icons/**/*.*',
        fonts: 'src/fonts/**/*.*',
        favicon: 'src/favicon/*.ico',
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        icons: 'src/icons/**/*.*',
        fonts: 'src/fonts/**/*.*',
        favicon: 'src/favicon/*.ico',
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    // tunnel: 'true',
    host: 'localhost',
    port: 8000,
};

gulp.task('webserver', function() {
    browserSync(config);
});

gulp.task('clean', function(cb) {
    del.sync(['build'], cb);
});

gulp.task('html:build', function() {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({ stream: true }));
});

gulp.task('js:build', function() {
    return gulp.src(path.src.js)
        .pipe(concat('main.js'))
        .pipe(rigger())
		.pipe(sourcemaps.init())
		.pipe(babel())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({ stream: true }));
});

gulp.task('style:build', function() {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['src/style/'],
            outputStyle: 'compressed',
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({ stream: true }));
});

gulp.task('image:build', function() {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({ stream: true }));
});

gulp.task('svgSprite:build', function () {
    return gulp.src(path.src.icons) // svg files for sprite
        .pipe(svgSprite({
                mode: {
                    stack: {
                        sprite: "../sprite.svg"  //sprite file name
                    }
                },
            }
        ))
        .pipe(gulp.dest(path.build.icons));
});

gulp.task('favicon:build', function() {
    gulp.src(path.src.favicon)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.favicon))
        .pipe(reload({ stream: true }));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'clean',
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
    'favicon:build',
    'svgSprite:build',
]);


gulp.task('watch', function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.favicon], function(event, cb) {
        gulp.start('favicon:build');
    });
    watch([path.watch.icons], function(event, cb) {
        gulp.start('svgSprite:build');
    });
});


gulp.task('default', ['build', 'webserver', 'watch']);