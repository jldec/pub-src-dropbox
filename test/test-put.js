/**
 * test-put.js
 * copyright 2015-2019, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

var test = require('tape');

var stored   = 'file some -->  ⌘ <---';
// var overwrite = ' - ⌘ - ⌘ - ';

var expected =
[ { path: '/-foo.txt', text: 'file some -->  ⌘ <---' },
  { path: '/1.txt', text: '' },
  { path: '/2.txt', text: '' },
  { path: '/3.txt', text: '' },
  { path: '/4.txt', text: '' },
  { path: '/5.txt', text: '' },
  { path: '/1/9.txt', text: '' },
  { path: '/2/10.txt/11.txt', text: '' },
  { path: '/2/10.txt/12.txt', text: '' },
  { path: '/2/10.txt/13/14.txt', text: '' },
  { path: '/f1/6.txt', text: '' },
  { path: '/f1/7.txt', text: '' },
  { path: '/f2/8.txt', text: '' } ];


test('test put, validate, and restore', function(t) {

  var source = require('..')(
    { path: '/test/test-put',
      glob: '**/*.txt',
      writable: true }
  );

  source.put(expected, 'pub-src-dropbox test-put1', function(err) {
    t.error(err);
    source.get(function(err, files) {
      t.error(err);
      t.same(files, expected);
      source.put( [{ path: '/-foo.txt', text: stored}], function(err) {
        t.error(err);
        expected[0].text = stored;
        source.get(function(err, files) {
          t.error(err);
          t.same(files, expected);
          source.clear(function(err) {
            t.end(err);
          });
        });
      });
    });
  });

});
