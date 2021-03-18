var gulp = require("gulp");
var concat = require("gulp-concat");
var cleancss = require("gulp-clean-css");
var uglify = require("gulp-uglify-es").default;
var gulpSequence = require("gulp-sequence");
var del = require("del");
var clean = require("gulp-clean");
var stripCssComments = require("gulp-strip-css-comments");
var ngAnnotate = require("gulp-ng-annotate-patched");
var plumber = require("gulp-plumber");
var replace = require("gulp-replace");
var rename = require("gulp-rename");
var sourcemaps = require("gulp-sourcemaps");
var htmlmin = require("gulp-htmlmin");
var removeHtmlComments = require("gulp-remove-html-comments");
var CacheBuster = require("gulp-cachebust");
var cachebust = new CacheBuster({
  random: true
});
var fileTrack = require("gulp-track-filenames")();
var gulpReplace = require("gulp-replace-task");
var connect = require("gulp-connect");
var argv = require('yargs').argv;

var fileObject = {};
var devPort = 5000;
var distPort = 5001;
var distPath = "../angapp";

gulp.task("watch", function() {
  gulp.watch([
    "./scripts/**/*.js",
    "./stylesheets/**/*.css",
    "./views/**/*.*"
  ], ["reloadDev"]);
  gulp.watch([
    distPath + "/scripts/**/*.js",
    distPath + "/stylesheets/**/*.css",
    distPath + "/views/**/*.*"
  ], ["reloadDist"]);
});

gulp.task("default", ["connectDev", "connectDist", "watch"]);

gulp.task("build", function(callback) {
  gulpSequence("del-dist", "app-css", "cachebust-css", "angular-app", "scripts-cache-resource", "app-plugins", "app-plugins-cache-resource", "minify-html", "bust-html", "build-html", "conclude", "widget-cache-busting")(callback);
});

gulp.task("build-plugin", function(callback) {
  if(argv.path !== undefined){
    distPath = argv.path;
    gulpSequence("del-dist", "app-css", "cachebust-css", "angular-app", "scripts-cache-resource", "app-plugins", "app-plugins-cache-resource", "minify-html", "bust-html", "build-html", "conclude", "widget-cache-busting", "build-plugin-index", "rename-plugin-index", "del-old-plugin-index")(callback);
  }

});

gulp.task("connectDev", function() {
  connect.server({
    name: "dev",
    root: ".",
    livereload: true,
    port: devPort,
    host: '0.0.0.0',
    fallback: "index.html"
  });
});

gulp.task("connectDist", function() {
  connect.server({
    name: "dist",
    root: distPath + "",
    livereload: true,
    port: distPort,
    fallback: distPath + "/index.html"
  });
});

gulp.task("reloadDev", function() {
  return gulp.src([
      "./scripts/**/*.js",
      "./stylesheets/**/*.css",
      "./views/**/*.*"
    ])
    .pipe(connect.reload());
});

gulp.task("reloadDist", function() {
  return gulp.src([
      distPath + "/scripts/**/*.js",
      distPath + "/stylesheets/**/*.css",
      distPath + "/views/**/*.*"
    ])
    .pipe(connect.reload());
});

gulp.task("del-dist", function() {
  return del([distPath + "/views", distPath + "/scripts", distPath + "/stylesheets", distPath + "/custom", distPath + "/app/bower_components", distPath + "/plugins", distPath + "/images", distPath + "/widget"], {
    force: true
  });
});

gulp.task("app-css", function() {
  return gulp.src(["stylesheets/**/*.*"])
    .pipe(cleancss())
    .pipe(gulp.dest(distPath + "/stylesheets-temp"));
});

gulp.task("cachebust-css", function() {
  return gulp.src([distPath + "/stylesheets-temp/**/*.css"])
    .pipe(cachebust.resources())
    .pipe(gulp.dest(distPath + "/stylesheets"));
});

gulp.task("angular-app", function() {
  return gulp.src(['scripts/**/*.js'])
    .pipe(plumber())
    .pipe(replace(/"use strict";/g, ''))
    .pipe(replace(/'use strict';/g, ''))
    .pipe(ngAnnotate({
      add: true
    }))
    .pipe(uglify({
     // beautify: true,
      mangle: false
    }))
    .pipe(plumber.stop())
    .pipe(gulp.dest(distPath + '/scripts-temp/'));
});

gulp.task("scripts-cache-resource", function() {
  return gulp.src([distPath + "/scripts-temp/**/*.*"])
    .pipe(cachebust.resources())
    .pipe(gulp.dest(distPath + '/scripts/'));
});

gulp.task("minify-html", function() {
  return gulp.src("views/templates/**/*.html")
    .pipe(cachebust.references())
    .pipe(removeHtmlComments())
    .pipe(htmlmin({
      collapseWhitespace: true,
      caseSensitive: true
    }))
    .pipe(gulp.dest(distPath + "/views-temp"));
});

gulp.task("build-html", function() {
  return gulp.src(["./index.html", "./okta.html"])
    .pipe(cachebust.references())
    .pipe(removeHtmlComments())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(distPath + "/"));
});

gulp.task("bust-html", function(callback) {
  gulpSequence("cache-html", "get-file-name", "replace-html", "replace-index-html", "replace-js")(callback);
});

gulp.task("cache-html", function() {
  return gulp.src(distPath + "/views-temp/**/*.html")
    .pipe(cachebust.resources())
    .pipe(gulp.dest(distPath + "/views/templates"));
});

gulp.task("get-file-name", function() {
  var session = fileTrack.create();
  return gulp.src([distPath + "/views-temp/**/*.html", distPath + "/views/templates/**/*.html"])
    .pipe(session.before())
    // .pipe(gulp.dest(distPath + "/views"))
    .pipe(session.after())
    .on("data", function(file) {
      var isTemp = file.path.match(/-temp/g);
      var filepath;
      if (process.platform == 'win32') {
        filepath = file.path.split("\\")[file.path.split("\\").length - 1];
      } else {
        filepath = file.path.split("/")[file.path.split("/").length - 1];
      }
      var origPath = filepath;

      if (isTemp == null) {
        var filePathArr = filepath.split(".");
        filePathArr.splice(filePathArr.length - 2, 1);
        filepath = filePathArr.join(".");
      }

      if (!fileObject.hasOwnProperty(filepath)) {
        fileObject[filepath] = {};
      }

      // if it is the original file
      if (isTemp != null) {
        fileObject[filepath]["match"] = new RegExp(filepath.replace(/\./g, "\\."), 'g');
      } else {
        fileObject[filepath]["replacement"] = origPath;
      }
    });
});

gulp.task("replace-html", function() {
  var fileArray = [];
  for (var prop in fileObject) {
    fileArray.push(fileObject[prop]);
  }

  return gulp.src(distPath + "/views/templates/**/*.html")
    .pipe(gulpReplace({
      patterns: fileArray
    }))
    .pipe(gulp.dest(distPath + "/views/templates"));
});

gulp.task("replace-index-html", function() {
  var fileArray = [];
  for (var prop in fileObject) {
    fileArray.push(fileObject[prop]);
  }

  return gulp.src(distPath + "/index.html")
    .pipe(gulpReplace({
      patterns: fileArray
    }))
    .pipe(gulp.dest(distPath + ""));
});

gulp.task("build-plugin-index", function() {
  return gulp.src(distPath + "/index.html")
    .pipe(replace('<base href="/">', '<base href="/<?php $path = explode(\'/\', $_SERVER[\'REQUEST_URI\']); echo $path[1];?>/">'))
    .pipe(gulp.dest(distPath + ""));
});

gulp.task("rename-plugin-index", function() {
  gulp.src(distPath + "/index.html")
      .pipe(rename(function (path) {
        path.extname = ".php"
      }))
      .pipe(gulp.dest(distPath + ""));
});

gulp.task("del-old-plugin-index", function() {
  return del([distPath + "/index.html"], {
    force: true
  });
});

gulp.task("replace-js", function() {
  var fileArray = [];
  for (var prop in fileObject) {
    fileArray.push(fileObject[prop]);
  }

  return gulp.src(distPath + "/scripts/**/*.js")
    .pipe(gulpReplace({
      patterns: fileArray
    }))
    .pipe(gulp.dest(distPath + "/scripts"));
});

gulp.task("conclude", ["copy-translation", "copy-custom", "copy-bower", "copy-widget", "copy-images", "del-unused"]);

gulp.task("copy-translation", function() {
  return gulp.src("views/translation/**/*.json")
    .pipe(gulp.dest(distPath + "/views/translation/"));
});

gulp.task("copy-custom", function() {
  return gulp.src("custom/**/*.*")
    .pipe(gulp.dest(distPath + "/custom/"));
});

gulp.task("copy-bower", function() {
  return gulp.src("app/bower_components/**/*.*")
    .pipe(gulp.dest(distPath + "/app/bower_components/"));
});

// gulp.task("copy-plugins", function() {
//   return gulp.src("plugins/**/*.*")
//     .pipe(gulp.dest(distPath + "/plugins/"));
// });

gulp.task("copy-widget", function() {
  gulp.src("widget/production/*.*")
    .pipe(gulp.dest(distPath + "/widget/production"));
  gulp.src("widget/translations/**/*.*")
    .pipe(gulp.dest(distPath + "/widget/translations"));
});

gulp.task("copy-images", function() {
  return gulp.src("images/**/*.*")
    .pipe(gulp.dest(distPath + "/images"));
});

gulp.task("del-unused", function() {
  return del([distPath + "/scripts-temp", distPath + "/stylesheets-temp", distPath + "/views-temp", distPath + "/plugins-temp"], {
    force: true
  });
});

gulp.task("widget-cache-busting", function(callback) {
  gulpSequence("move-widget", "widget-uglify", "del-orig-widget", "cache-resources-widget", "cache-references-widget", "replace-widget-js", "del-widget-temp")(callback);
});

gulp.task("widget-uglify", function(){
  return gulp.src(distPath + "/widget/production/*.js")
    .pipe(uglify({
      //beautify: true,
      mangle: false
    }))
    .pipe(gulp.dest(distPath + "/widget/production"));
});

gulp.task("move-widget", function() {
  return gulp.src([distPath + "/widget/production/*.*", "!" + distPath + "/widget/production/getwidget.js", "!" + distPath + "/widget/production/jquery.min.js", "!" + distPath + "/widget/production/semantic.min.js"])
    .pipe(gulp.dest(distPath + "/widget-temp/production"));
});

gulp.task("del-orig-widget", function() {
  return del([distPath + "/widget/production/*.*", "!" + distPath + "/widget/production/getwidget.js", "!" + distPath + "/widget/production/jquery.min.js", "!" + distPath + "/widget/production/semantic.min.js"], {
    force: true
  });
});

gulp.task("cache-resources-widget", function() {
  return gulp.src(distPath + "/widget-temp/production/*.*")
    .pipe(cachebust.resources())
    .pipe(gulp.dest(distPath + "/widget/production"));
});

var widgetFileObject = {};
gulp.task("cache-references-widget", function() {
  var session = fileTrack.create();
  return gulp.src([distPath + "/widget/production/*.*", distPath + "/widget-temp/production/*.*", "!" + distPath + "/widget/production/getwidget.js", "!" + distPath + "/widget/production/jquery.min.js", "!" + distPath + "/widget/production/semantic.min.js"])
    .pipe(session.before())
    .pipe(session.after())
    .on("data", function(file) {
      var isWidgetTemp = file.path.indexOf("widget-temp");
      var filepath;
      if (process.platform == 'win32') {
        filepath = file.path.split("\\")[file.path.split("\\").length - 1];
      } else {
        filepath = file.path.split("/")[file.path.split("/").length - 1];
      }
      var origPath = filepath;

      if (isWidgetTemp == -1) {
        var filePathArr = filepath.split(".");
        filePathArr.splice(filePathArr.length - 2, 1);
        filepath = filePathArr.join(".");
      }

      if (!widgetFileObject.hasOwnProperty(filepath)) {
        widgetFileObject[filepath] = {};
      }

      // if it is the original file
      if (isWidgetTemp != -1) {
        widgetFileObject[filepath]["match"] = new RegExp(filepath.replace(/\./g, "\\."), 'g');
      } else {
        widgetFileObject[filepath]["replacement"] = origPath;
      }
    });
});

gulp.task("replace-widget-js", function() {
  var fileArray = [];
  for (var prop in widgetFileObject) {
    fileArray.push(widgetFileObject[prop]);
  }

  return gulp.src(distPath + "/**/*.*")
    .pipe(gulpReplace({
      patterns: fileArray
    }))
    .pipe(gulp.dest(distPath + "/"));
});

gulp.task("del-widget-temp", function() {
  return del([distPath + "/widget-temp"], {
    force: true
  });
});

gulp.task("app-plugins", function() {
  return gulp.src(["plugins/**/*.*"])
    .pipe(gulp.dest(distPath + "/plugins-temp"));
});

gulp.task("app-plugins-cache-resource", function() {
  return gulp.src([distPath + "/plugins-temp/**/*.*"])
    .pipe(cachebust.resources())
    .pipe(gulp.dest(distPath + '/plugins/'));
});
