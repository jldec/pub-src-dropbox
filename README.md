# pub-src-dropbox

dropbox source for pub-server and pub-generator

* provides `get()` and `put()` for bulk reads and writes
* works in conjunction with `pub-src-fs/fs-base`
* assumes that all files are utf-8 text
* globs and descends directories

## src(options)

```javascript
var src = require('pub-src-dropbox');

// instantiate source
// options become properties of source
var source = src(
{ path:'/',
  glob:'*.md' } );

source.get(function(err, files) {
  if (err) return console.log(err);
  console.log(_.pluck(files, 'path'));
});

```

### source.path
- defaults to '/'

### source.glob
- `glob` is a [node-glob](https://github.com/isaacs/node-glob) pattern

### source.depth
- `depth` limits the depth of directory descent when source.glob includes `**/` (globstar)

### source.get(cb)
- `get()` fetches all matching files in one async operation
- the result is an array of file objects each with a `path:` and a `text:` property
- the array is sorted alphabetically by path
- results do not include directories, but do include files in subdirectories
- if the source is writable, `get()` is atomic with respect to `put()` or other `source.get()` operations

```javascript
[ { path: '/README.md',
    text: '...' } ]
```

### source.put(files, cb)
- does nothing unless `writable` is set on the source
- stores an array of file objects in a single commit
- is atomic with respect to `source.get()` or other `source.put()` operations
- returns an array of the paths written

```javascript
source.put(
  files,
  function(err, result) {
    if (err) return console.log(err);
    console.log(result);
  }
);
```

### configuring access to the pub-server folder on dropbox
To configure access  the pub-server folder on dropbox, set the following variable in your environment

```sh
export DBAC={access code}
```
