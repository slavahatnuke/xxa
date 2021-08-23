const argv = Object.assign({}, require('minimist')(process.argv.slice(2)));
const _ = require('lodash');
const {Copy} = require('./src/Copy');

const args = argv._;
let [source, destination] = args;
const options = _.omit(argv, ['_']);

if (source && destination) {

    Copy(source, destination, options, args).catch((error) => console.error(error));

} else {
    console.log(`
  $ xxa.copy [options] <source-dir> <destination-dir> [options]
  
  Example:
    $ xxa.copy article post --article=post
    
    <source-dir>
      article/article.html
   
    <destination-dir>
      post/post.html

    > source content
        article/article.html
          article


    > destination content
        post/post.html
          post 

  Advanced Example:
    $ xxa.copy --{{{_2~camel}}}={{{_3~camel}}} --{{{_2~Camel}}}={{{_3~Camel}}} --{{{_2~snake~upper}}}={{{_3~snake~upper}}} ./article ./tmp/post article post
    
    - _1, _2, _3 ... - argument values
    - {{{_2~camel}}} - uses 2nd argument to transform from 'article'  
    - {{{_3~camel}}} - uses 3rd argument to transform to 'post'
    - finally it's a few rules here: 'article' -> 'post', 'Article' -> 'Post', 'ARTICLE' -> 'POST'
    
    <source-dir>
      ./article/article.html
   
    <destination-dir>
      ./tmp/post/post.html

    > source content
        article/article.html
          article
          Article
          ARTICLE


    > destination content
        post/post.html
          post 
          Post 
          POST 
`)
}
