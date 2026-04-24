//
const browserSync = require('browser-sync').create();

const gulp = require('gulp');
const gulpIf = require('gulp-if');
const fileinclude = require('gulp-file-include');
const useref = require('gulp-useref');
const sourcemaps = require('gulp-sourcemaps');
const inject = require('gulp-inject');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const config = {
  devDir: './development',
  deployDir: './deploy',
};

const { src, dest, series, parallel, watch } = require('gulp');

// enables file inclusion
function htmlInclude() {
    return gulp.src(['./development/*.html'])
    .pipe(fileinclude())
    .pipe(gulp.dest('./deploy'));
};

function sassFramework() {
    return gulp
    .src(config.devDir + '/scss/scss-framework/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.deployDir + '/css'));
};

function sassGrid() {
    return gulp
    .src(config.devDir + '/scss/scss-grid/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.deployDir + '/css'));
};

function sassTypography() {
    return gulp
    .src(config.devDir + '/scss/scss-typography/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.deployDir + '/css'));
};

function sassPanels() {
    return gulp
    .src(config.devDir + '/scss/scss-panels/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.deployDir + '/css'));
};

function sassPanelsDev() {
    return gulp
    .src(config.devDir + '/scss/scss-panels-dev/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.deployDir + '/css'));
};

function sassDocumentation() {
    return gulp
    .src(config.devDir + '/scss/scss-documentation/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.deployDir + '/css'));
};

// -----------------------------------------------------------------------------
// Nav/Footer and Components bundles
// These compile to the standalone CSS files loaded on the live site:
//   luc-nav-footer.css  — header, footer, utility nav
//   luc-components.css  — 2026 homepage components
// -----------------------------------------------------------------------------

function sassNavFooter() {
    return gulp
    .src(config.devDir + '/scss/scss-nav-footer/luc-nav-footer.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.deployDir + '/css'));
};

function sassComponents() {
    return gulp
    .src(config.devDir + '/scss/scss-nav-footer/luc-components.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.deployDir + '/css'));
};

function sassAdjustCarnegieGlobal() {
    return gulp
    .src(config.devDir + '/scss/scss-nav-footer/luc-adjust-carnegie-global.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.deployDir + '/css'));
};

function sassSubsites() {
    return gulp
    .src(config.devDir + '/scss/scss-nav-footer/luc-subsites.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.deployDir + '/css'));
};

// -----------------------------------------------------------------------------

function referencePaths() {
    return gulp
    .src('./development/*.html')
    .pipe(useref())
    .pipe(gulp.dest(config.deployDir));
};

function indexBuild(cb) {
  var target = gulp.src('./development/*.html');

  var jsSources = gulp.src(['./deploy/js/**/*.js', '!./deploy/js/bundle.js'])
    .pipe(concat('bundle.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./deploy/js'));

  var cssSources = gulp.src(['./deploy/css/**/*.css', '!./deploy/css/luc-*.css'], { read: false });

  return target
    .pipe(inject(jsSources, { ignorePath: 'deploy/', addRootSlash: false }))
    .pipe(inject(cssSources, { ignorePath: 'deploy/', addRootSlash: false }))
    .pipe(gulpIf('*.html', fileinclude({ prefix: '@@', basepath: '@file' })))
    .pipe(gulp.dest(config.deployDir));
}

function browserSyncReload(cb) {
  browserSync.reload();
  cb();
}

function watchFiles() {
  browserSync.init({
    server: {
        baseDir: "./deploy"
    }
  });
  watch('./development/**/*.html', gulp.series('indexBuild', 'browserSyncReload'));
  watch(config.devDir + '/scss/**/*.scss', gulp.series(parallel('sassFramework', 'sassGrid', 'sassTypography', 'sassPanels', 'sassPanelsDev', 'sassDocumentation', 'sassNavFooter', 'sassComponents', 'sassAdjustCarnegieGlobal', 'sassSubsites'), 'browserSyncReload'));
  watch(config.devDir + '/js/**/*.js', gulp.series('browserSyncReload'));
};

// Default task: build + watch + live reload
exports.default = series(
  parallel(sassFramework, sassGrid, sassTypography, sassPanels, sassPanelsDev, sassDocumentation, sassNavFooter, sassComponents, sassAdjustCarnegieGlobal, sassSubsites),
  referencePaths,
  indexBuild,
  watchFiles,
  browserSyncReload
);

// CI build task: compile everything without starting a dev server
exports.build = series(
  parallel(sassFramework, sassGrid, sassTypography, sassPanels, sassPanelsDev, sassDocumentation, sassNavFooter, sassComponents, sassAdjustCarnegieGlobal, sassSubsites),
  referencePaths,
  indexBuild
);

exports.indexBuild = indexBuild;
exports.referencePaths = referencePaths;
exports.sassFramework = sassFramework;
exports.sassGrid = sassGrid;
exports.sassTypography = sassTypography;
exports.sassPanels = sassPanels;
exports.sassPanelsDev = sassPanelsDev;
exports.sassDocumentation = sassDocumentation;
exports.sassNavFooter = sassNavFooter;
exports.sassComponents = sassComponents;
exports.sassAdjustCarnegieGlobal = sassAdjustCarnegieGlobal;
exports.sassSubsites = sassSubsites;
exports.watchFiles = watchFiles;
exports.browserSync = browserSync;
exports.browserSyncReload = browserSyncReload;
