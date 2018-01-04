var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var image = require("gulp-image");
var imagemin = require('gulp-imagemin');
var jpegRecompress = require("imagemin-jpeg-recompress");
var mozjpeg = require("imagemin-mozjpeg");
var jpegoptim = require('jpegoptim-bin');
var responsive = require("gulp-responsive");
var $ = require("gulp-load-plugins")();
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

// Development Tasks 
// -----------------

// Start browserSync server
gulp.task('browserSync', function () {
    browserSync({
        server: {
            baseDir: './'
        }
    })
})

// Watchers
gulp.task('watch', function () {
    gulp.watch('*.css', browserSync.reload);
    gulp.watch('*.html', browserSync.reload);
    gulp.watch('*.js', browserSync.reload);
})

// Responsive images
gulp.task("images:responsive", function () {
    return gulp.src(["images_src/*.{png,jpg}"])
        .pipe($.responsive({
            // resize all JPGs to different resolutions
            "*.jpg": [{
                    width: 300,
                    rename: {
                        suffix: "-300px"
                    },
            },
                {
                    width: 500,
                    rename: {
                        suffix: "-500px"
                    },
            },
                {
                    width: 650,
                    rename: {
                        suffix: "-650px"
                    },
            },
                {
                    // compress, strip metadata and rename original image
                    rename: {
                        suffix: "-original"
                    },
            }
        ],
            // resize all PNG to be retina ready
            "*.png": [
                {
                    width: 250,
            },
                {
                    width: 250 * 2,
                    rename: {
                        suffix: "@2x"
                    },
            }
        ],
        }, {
            // Global configuration for all images
            // The output quality for JPEG, Webp and TIFF output formats
            quality: 70,
            // Use progressive (interlace) scan for JPEG and PNG output
            progressive: true,
            // Strip all metadata
            widthMetadata: false,
        }))
        .pipe(gulp.dest("images_src/responsive"));
});

// Optimization tasks
// -------------------

gulp.task("images:minify", function () {
    return gulp.src("images_src/**/*")
        .pipe(imagemin([imageminMozJpeg()], {
            verbose: true
        }))
        .pipe(gulp.dest("images_src/compressed"));
});

gulp.task("images:compress", function () {
    gulp.src("images_src/**/*.*")
    .pipe(image({
        jpegRecompress: ['--strip', '--quality', 'medium', '--min', 6, '--max', 8],
        jpegoptim: false,
        mozjpeg: false,
        concurrent: 10,
    }))
    .pipe(gulp.dest("images_src/compressed2"));
});

// Build Sequences
// ---------------

gulp.task('default', function (callback) {
    runSequence(['browserSync'], 'watch',
        callback
    )
});
