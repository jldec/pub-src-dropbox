/*
 * dropbox-base.js
 *
 * NOTE: this was migrated to dropbox v2 api but not fully tested
 * see https://www.dropbox.com/developers/reference/migration-guide
 * only supports text files for now because of dependence on stream-to-string
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

var streamStr = require('stream-to-string');

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

  self.api        = self.api        || 'https://api.dropboxapi.com/2/';
  self.apiContent = self.apiContent || 'https://content.dropboxapi.com/2/';
  self.apiNotify  = self.apiNotify  || 'https://notify.dropboxapi.com/2/';

  self.isfile     = require('path').extname; // TODO: use API for this

  self.readdir    = readdir;
  self.readfile   = readfile;
  self.writefile  = writefile;
  self.clear      = clear;

  return self;

  //--//--//--//--//--//--//--//--//--//--//--//--//

  function makerequest(method, url, params, data, type, cb) {
    var rq = superagent(method, url);

    rq.set('Authorization', 'Bearer ' + self.accessToken);

    if (params && params.mode === 'overwrite') {
      rq.set('Content-Type', 'application/octet-stream');
    }

    if (params) {
      rq.set('Dropbox-API-Arg', JSON.stringify(params));
    }

    if (self.timeout)  { rq.timeout(self.timeout); }

    if (data) { rq.send(data); }

    rq.end(function(err, resp) {
      err = (resp && resp.error) || err;
      if (err) return cb(err);
      if (type === 'binary') return streamStr(resp, cb); // TODO - support propery binary encoding
      if (type === 'txt') return cb(null, resp.text);
      if (type === 'json' && resp.header['content-type'] !== 'application/json') {
        try { return cb(null, JSON.parse(resp.text)); }
        catch(e) { return {}; }
      }
      return cb(null, resp.body);
    });
  }

  function post(url, params, data, type, cb){ makerequest('POST', url, params, data, type, cb); }

  // matches fs.readdir()
  function readdir(fullpath, cb) {
    post(self.api + 'files/list_folder', null, { path:fullpath }, 'json', function(err, data) {
      if (err) return cb(err);
      return cb(null, u.map(data.entries, function(entry) {
        return {
          name:entry.name,
          type:(entry['.tag'] === 'folder' ? 'dir' : 'file'),
          hash:entry.rev };
      }));
    });
  }

  // matches fs.readfile()
  function readfile(fullpath, options, cb) {
    if (2 === arguments.length) { cb = options; }
    post(self.apiContent + 'files/download', { path:fullpath }, null, 'binary', cb);
  }

  // note: fsbase.writefile takes filepath instead of fullpath
  function writefile(filepath, data, cb) {
    var fullpath = u.join(self.path, filepath);
    post(self.apiContent + 'files/upload', { path:fullpath, mode:'overwrite' }, data, 'json', cb);
  }

  function clear(cb) {
    post(self.api + 'files/delete_v2', null, { path:self.path }, 'json', cb);
  }
};
