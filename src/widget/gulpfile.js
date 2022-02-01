var gulp = require("gulp");
var del = require("del");
var concat = require("gulp-concat");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify-es").default;
var clean = require("gulp-strip-css-comments");

gulp.task("concat-js", ["concat-dep"], function() {
  return gulp.src([
      "./production/sedra.js",
      "./dist/bundle.js"
    ])
    .pipe(concat("sedra.js"))
    .pipe(gulp.dest("./production"));
});

gulp.task("concat-dep", function() {
  return gulp.src([
      // "node_modules/es6-shim/es6-shim.min.js",
      // "node_modules/zone.js/dist/zone.js",
      // "node_modules/reflect-metadata/Reflect.js",
      "node_modules/jquery.payment/lib/jquery.payment.js",
      "node_modules/intl/dist/Intl.min.js",
      "node_modules/intl/locale-data/jsonp/en.js"
    ])
    .pipe(concat("sedra.js"))
    .pipe(uglify())
    .pipe(gulp.dest("./production"));
});

gulp.task("clean-css", ["concat-css"], function() {
  return gulp.src("./production/sedra.css")
    .pipe(clean({
      "preserve": false
    }))
    .pipe(gulp.dest("./production"));
});

gulp.task("concat-css", function() {
  return gulp.src(
      [
        "app/semantic/dist/components/accordion.min.css",
        "app/semantic/dist/components/button.min.css",
        "app/semantic/dist/components/card.min.css",
        "app/semantic/dist/components/comment.min.css",
        "app/semantic/dist/components/container.min.css",
        "app/semantic/dist/components/divider.min.css",
        "app/semantic/dist/components/dropdown.min.css",
        "app/semantic/dist/components/embed.min.css",
        "app/semantic/dist/components/form.min.css",
        "app/semantic/dist/components/grid.min.css",
        "app/semantic/dist/components/header.min.css",
        "app/semantic/dist/components/icon.min.css",
        "app/semantic/dist/components/image.min.css",
        "app/semantic/dist/components/input.min.css",
        "app/semantic/dist/components/item.min.css",
        "app/semantic/dist/components/label.min.css",
        "app/semantic/dist/components/list.min.css",
        "app/semantic/dist/components/loader.min.css",
        "app/semantic/dist/components/message.min.css",
        "app/semantic/dist/components/menu.min.css",
        "app/semantic/dist/components/popup.min.css",
        "app/semantic/dist/components/progress.min.css",
        "app/semantic/dist/components/reset.min.css",
        "app/semantic/dist/components/search.min.css",
        "app/semantic/dist/components/segment.min.css",
        "app/semantic/dist/components/site.min.css",
        "app/semantic/dist/components/tab.min.css",
        "app/semantic/dist/components/table.min.css",
        "app/semantic/dist/components/transition.min.css",
        "node_modules/font-awesome/css/font-awesome.min.css",
        "app/css/froala/froala_style.min.css",
        "app/css/main.css"
      ]
    )
    .pipe(concat("sedra.css"))
    .pipe(gulp.dest("./production"));
});

gulp.task("getwidget-js", function() {
  gulp.src("./getwidget.js")
    // .pipe(uglify())
    .pipe(gulp.dest("./production"));
  gulp.src("./loader.css")
    // .pipe(uglify())
    .pipe(gulp.dest("./production"));
  gulp.src("node_modules/es6-shim/es6-shim.min.js")
    .pipe(gulp.dest("./production"));
  gulp.src("node_modules/reflect-metadata/Reflect.js")
    .pipe(gulp.dest("./production"));
  gulp.src("node_modules/jquery/dist/jquery.min.js")
    .pipe(gulp.dest("./production"));
  gulp.src("node_modules/semantic-ui/dist/semantic.min.js")
    .pipe(gulp.dest("./production"));
});

gulp.task("clean", function() {
  return del(["production/*"]);
});

// Grabs the js and css and then concat them
gulp.task("build", ["clean", "concat-js", "clean-css", "getwidget-js"]);

gulp.task("clean-js", function() {
  return del(["./app/**/*.js", "./app/**/*.js.map", "!./app/semantic/**/*.*"]);
});