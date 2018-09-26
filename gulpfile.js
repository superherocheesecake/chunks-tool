var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: "./public"
    });

    gulp.watch("public/scss/*.scss", ['sass']);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {


    return gulp.src("public/scss/*.scss")
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(gulp.dest("public/css"));

});

gulp.watch("public/scss/*.scss", ['sass']);

gulp.task('default', ['sass'],function(){

    gulp.watch("public/scss/**/*.scss", ['sass']);
});