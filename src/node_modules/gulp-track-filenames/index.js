var path = require('path');
var through = require('through2');
var minimatch = require('minimatch');

/**
 * Create an instance.
 * @returns {{create: function, replace: function}}
 */
module.exports = function() {
  'use strict';
  var sessions = [ ];
  return {

    /**
     * Create an session that is separated from others.
     * This is important to ensure that order is preserved when associating `before` with `after`.
     * @returns {{before: function, after: function, replace: function}}
     */
    create: function() {
      var before = [ ];
      var after  = [ ];
      function addBefore(value) {
        before.push(path.normalize(value));  // enforce correct path format for the platform
      }
      function addAfter(value) {
        var source = minimatch.makeRe(value).source
          .replace(/^\^|\$$/g, '')                // match text anywhere on the line by removing line start/end
          .replace(/\\\//g, '(?:\\\\{1,2}|\\/)'); // detect any platform path format / => / or \ or \\ (i.e. strings)
        after.push(source);
      }
      var session = {

        /**
         * Consider file names from the input stream as those before transformation.
         * Outputs a stream of the same files.
         * @returns {stream.Through} A through stream that performs the operation of a gulp stream
         */
        before: function() {
          return through.obj(function(file, encode, done){
            addBefore(file.path);
            this.push(file);
            done();
          });
        },

        /**
         * Consider file names from the input stream as those after transformation.
         * Order must be preserved so as to correctly match the corresponding before files.
         * Outputs a stream of the same files.
         * @returns {stream.Through} A through stream that performs the operation of a gulp stream
         */
        after: function() {
          return through.obj(function(file, encode, done){
            addAfter(file.path);
            this.push(file);
            done();
          });
        },

        /**
         * Define an explicit filename transformation.
         * @param {string} before The filename before transformation
         * @param {string} after The filename after transformation
         * @returns The session on which the method was called
         */
        define: function(before, after) {
          if ((typeof before === 'string') && (typeof after === 'string')) {
            addBefore(before);
            addAfter(after);
          }
          return session;
        },

        /**
         * Replace occurrences of <code>after</code> file names with the corresponding <code>before</code> file names
         * for only the current session.
         * @param {string} text The input text to replace
         * @param {string=} prefix Regexp source that should precede all matches
         * @param {string=} suffix Regexp source that should follow all matches
         * @returns {string} The result of the replacement
         */
        replace: function(text, prefix, suffix) {
          for (var i = Math.min(before.length, after.length) - 1; i >= 0; i--) {
            var source  = '(' + (prefix || '') + ')' + after[i] + '(' + (suffix || '') + ')';
            var regexp  = new RegExp(source, 'gm');
            var escaped = before[i].replace(/\\/g, '\\\\'); // escape backslashes
            text = String(text).replace(regexp, '$1' + escaped + '$2');
          }
          return text;
        }
	    };
      sessions.push(session);
      return session;
    },

    /**
     * Replace occurrences of <code>after</code> file names with the corresponding <code>before</code> file names
     * across all sessions.
     * @param {string} text The input text to replace
     * @param {string=} prefix Regexp source that should precede all matches
     * @param {string=} suffix Regexp source that should follow all matches
     * @returns {string} The result of the replacement
     */
	  replace: function(text, prefix, suffix) {
      sessions.forEach(function(session) {
	      text = session.replace(text, prefix, suffix);
      });
      return text;
    }
  };
}
