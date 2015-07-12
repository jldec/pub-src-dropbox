/*
 * dropbox-base.js
 *
 * base dropbox reader/writer
 * exports: isfile, readdir, readfile, and writefiles
 * works in conjunction with fs-base to provide full pub-src get and put
 *
 * limitations:
 * - no binaries or executables - text blobs only
 * - no deletes - only create or update file paths
 * - no content streaming
*/

var superagent = require('superagent');
var u = require('pub-util');
var path = require('path');
var mime = require('mime-types');

module.exports = function dropboxBase(opts) {

  var self;

  if (typeof opts === 'string') {
    self = { path: opts };
  }
  else {
    self = u.clone(opts) || {}; // avoid side effects on opts
  }

  self.accessToken = process.env.DBAC || '';
  if (!self.accessToken) throw new Error('no dropbox accessToken in env.DBAC');

  self.path = self.path || '/';
  self.concurrency = self.concurrency || 2;

  self.api        = self.api        || 'https://api.dropbox.com/1/';
  self.apiContent = self.apiContent || 'https://api-content.dropbox.com/1/';
  self.apiNotify  = self.apiNotify  || 'https://api-notify.dropbox.com/1/';

  self.isfile     = path.extname    // TODO: use API for this

  self.readdir    = readdir;
  self.readfile   = readfile;
  self.writefile  = writefile;
  self.clear      = clear;

  return self;

  //--//--//--//--//--//--//--//--//--//--//--//--//

  function makerequest(method, url, data, type, cb) {
    var rq = superagent(method, url);

    rq.set('Authorization', 'Bearer ' + self.accessToken);

    if('PUT' === method) {
      rq.set('Content-Type', mime.lookup(url) || 'application/octet-stream');
    }

    if (self.timeout)  { rq.timeout(self.timeout); }

    if (data) { rq.send(data); }

    rq.end(function(err, resp) {
      var err = resp.error || err;
      if (err) return cb(err);
      if (type === 'txt') return cb(null, resp.text);
      if (type === 'json' && resp.header['content-type'] !== 'application/json') {
        try { return cb(null, JSON.parse(resp.text)); }
        catch(e) { return {}; }
      }
      return cb(null, resp.body);
    });
  }

  function get(url, cb)       { makerequest('GET',   url, null, 'json', cb); }
  function gettext(url, cb)   { makerequest('GET',   url, null, 'txt',  cb); }
  function put(url, data, cb) { makerequest('PUT',   url, data, 'json', cb); }
  function post(url, data, cb){ makerequest('POST',  url, data, 'json', cb); }

  // matches fs.readdir()
  function readdir(fullpath, cb) {
    get(self.api + 'metadata/auto' + fullpath, function(err, data) {
      if (err) return cb(err);
      return cb(null, u.map(data.contents, function(entry) {
        return {
          name:path.basename(entry.path),
          type:(entry.is_dir ? 'dir' : 'file'),
          hash:entry.rev };
      }));
    });
  }

  // matches fs.readfile()
  function readfile(fullpath, options, cb) {
    if (2 === arguments.length) { cb = options; }
    gettext(self.apiContent + 'files/auto' + fullpath, cb); // TODO - fix to read proper branch
  }

  // note: fsbase.writefile takes filepath instead of fullpath
  function writefile(filepath, data, cb) {
    var fullpath = u.join(self.path, filepath);
    put(self.apiContent + 'files_put/auto' + fullpath, data, cb);
  }

  function clear(cb) {
    post(self.api + 'fileops/delete?root=auto&path=' + u.uqt(self.path), {}, cb);
  }
};
