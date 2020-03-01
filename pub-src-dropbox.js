/**
 * pub-src-dropbox.js
 * patches fs-base with dropbox-base to replace readdir, readfile, writefile
 *
 * copyright 2015-2020, Jürgen Leschner - github.com/jldec - MIT license
**/

var debug = require('debug')('pub:src-dropbox');


module.exports = function srcDropbox(sourceOpts) {

  var dropboxBase = require('./dropbox-base.js')(sourceOpts);
  var fsbase = require('pub-src-fs/fs-base')(dropboxBase);

  return {
    get: get,
    put: put,
    listfiles: fsbase.listfiles,
    clear: dropboxBase.clear
  };


  function get(options, cb) {
    if (typeof options === 'function') { cb = options; options = {}; }

    fsbase.readfiles(options, function(err, result) {
      debug('get %s %s file(s)', sourceOpts.name, err || result.length);
      cb(err, result);
    });
  }

  function put(files, options, cb) {
    if (typeof options === 'function') { cb = options; options = {}; }

    fsbase.writefiles(files, options, function(err, result) {
      debug('put %s %s file(s) %s', sourceOpts.name, files.length, err || '');
      cb(err, result);
    });
  }

};
