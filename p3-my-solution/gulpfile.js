var gulp = require('gulp');
var browserSync = require('browser-sync');
var image = require("gulp-image");
var imagemin = require('gulp-imagemin');
var jpegRecompress = require("imagemin-jpeg-recompress");
var mozjpeg = require("imagemin-mozjpeg");
var jpegoptim = require('jpegoptim-bin');
var responsive = require("gulp-responsive");
var $ = require("gulp-load-plugins")();
var imageResize = require("gulp-image-resize");
var rename = require("gulp-rename");
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
    gulp.watch('./css/*.css', browserSync.reload)
    gulp.watch('./*.html', browserSync.reload);
    gulp.watch('./js/**/*.js', browserSync.reload);
})

// Responsive images
gulp.task("images:responsive", ["clean:responsive"], function () {
    return gulp.src(["./images_src/*.{png,jpg}"])
        .pipe(cache(imagemin({
            interlaced: true,
        })))
        .pipe($.responsive({
            // resize all JPGs to different resolutions
            "*.jpg": [
                {
                    width: 800,
                    rename: {
                        suffix: "-1x"
                    },
            },
                {
                    width: 1600,
                    rename: {
                        suffix: "-2x"
                    }
            },

        ],
            // resize all PNG to be retina ready
            "*.png": [
                {
                    width: 250,
            },
                {
                    width: 250 * 2,
                    rename: {
                        suffix: "@ 2x"
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
            // prevent enlargement
            withoutEnlargement: true,
            skipOnEnlargement: false, 
            errorOnEnlargement: false,
        }))
        .pipe(gulp.dest("./images"));
});

// Optimization Tasks 
// ------------------

// Optimizing Images 
gulp.task('images:minify', function () {
    return gulp.src('./images/**/*.+(png|jpg|jpeg|gif|svg)')
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true,
        })))
        .pipe(gulp.dest('dist/images'))
});

// Compress Images
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

// imageResize
gulp.task("image-resize", function () {
    gulp.src("./images_src/*.{jog,png}")
        .pipe(parallel(
            imageResize({
                    
            })
        ))
    
});

// Cleaning images
gulp.task('clean', function () {
    return del.sync('dist').then(function (cb) {
        return cache.clearAll(cb);
    });
})

gulp.task('clean:responsive', function () {
    return del.sync("responsive");
});

// Build Sequences
// ---------------

gulp.task('default', function (callback) {
    runSequence(['browserSync'], 'watch',
        callback
    )
});
