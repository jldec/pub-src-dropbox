/**
 * pub-src-dropbox test-listfiles
 * copyright 2015-2019, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

var test = require('tape');

test('listfiles', function(t){

  var source = require('..')(
    { path: '/test/tree',
      glob: '**/*.txt' } );

  var expected = [
    { filepath: '/-foo.txt', hash: '1b38c0a54a' },
    { filepath: '/1.txt', hash: '938c0a54a' },
    { filepath: '/2.txt', hash: 'c38c0a54a' },
    { filepath: '/3.txt', hash: '1238c0a54a' },
    { filepath: '/4.txt', hash: '1338c0a54a' },
    { filepath: '/5.txt', hash: '1438c0a54a' },
    { filepath: '/1/9.txt', hash: 'a38c0a54a' },
    { filepath: '/2/10.txt/11.txt', hash: 'e38c0a54a' },
    { filepath: '/2/10.txt/12.txt', hash: 'f38c0a54a' },
    { filepath: '/2/10.txt/13/14.txt', hash: '1138c0a54a' },
    { filepath: '/f1/6.txt', hash: '1738c0a54a' },
    { filepath: '/f1/7.txt', hash: '1838c0a54a' },
    { filepath: '/f2/8.txt', hash: '1a38c0a54a' }
  ];

  source.listfiles(function(err, actual){
    // console.log(actual);
    t.same(actual, expected);
    t.end(err);
  });

});
