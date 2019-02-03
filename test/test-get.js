/**
 * test-get
 * copyright 2015-2019, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

var test = require('tape');

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

test('test get on tree', function(t) {

  var source = require('..')(
    { path: '/test/tree',
      glob: '**/*.txt' } );

  source.get(function(err, files) {
    t.same(files, expected);
    // console.log(files);
    t.end(err);
  });

});

test('test get on single file', function(t) {

  var source = require('..')(
    { path: '/test/tree/-foo.txt',
      glob: '**/*.txt' } );

  source.get(function(err, files) {
    t.same(files, [expected[0]]);
    t.end(err);
  });

});
