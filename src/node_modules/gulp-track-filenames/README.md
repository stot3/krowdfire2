# gulp-track-filenames

> Capture file names before and after transform steps so as to be able to reinstate pre-transform text..

## Install

Install with [npm](https://npmjs.org/package/gulp-track-filenames).

```
npm install --save-dev gulp-track-filenames
```

## Usage

The following is an overly simplistic example. Typically you would use the `replace` method in an error reporter or
similar.

```
  var gulp = require('gulp');
  var tracking = require('gulp-track-filenames')();
  
  gulp.task('copy', function() {
    var session = tracking.create()
    return gulp.src('src/js/**/*.js')
      .pipe(session.before())
      .pipe(gulp.dest('build/js'))
      .pipe(session.after());
      .on('data', function(file) {
        console.log({
          after:  file.path,
          before: tracking.replace(file.path)
        });
      });
  });
```

It is important to use a different `session` in each stream as otherwise the order can be confused and `before` will
not match `after`. The `replace` method may be called on the session but is typically called on the top level as
shown.
  
## Reference

### `()`

Create an instance.

@returns `{{create: function, replace: function}}`

### `.create()`

Create an session that is separated from others.

This is important to ensure that order is preserved when associating `before` with `after`.

@returns `{{before: function, after: function, replace: function}}`

#### `.before()`

Consider file names from the input stream as those `before` transformation.

Outputs a stream of the same files.

@returns `{stream.Through}` A through stream that performs the operation of a gulp stream.

#### `.after()`

Consider file names from the input stream as those after transformation.

Order must be preserved so as to correctly match the corresponding before files.

Outputs a stream of the same files.

@returns `{stream.Through}` A through stream that performs the operation of a gulp stream.

#### `.define(before, after)`

Define an explicit filename transformation.

@param `{string} before` The filename before transformation

@param `{string} after` The filename after transformation
         
@returns The current session on which the method was called

#### `.replace(text)`

Replace occurrences of `after` file names with the corresponding `before` file names for only the current session.

@param `{string} text` The input text to replace.

@returns `{string}` The result of the replacement.

### `.replace(text)`

Replace occurrences of `after` file names with the corresponding `before` file names across all session.

@param `{string} text` The input text to replace.

@returns `{string}` The result of the replacement.