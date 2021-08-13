const argv = Object.assign({}, require('minimist')(process.argv.slice(2)));
const _ = require('lodash');
const {Copy} = require('./src/Copy');

let [source, destination] = argv._;
const options = _.omit(argv, ['_']);

if (source) {

    Copy(source, destination, options).catch((error) => console.error(error));

} else {
    console.log(`
  $ xxa.copy <source-dir> <destination-dir> [options]
  
  Example:
    $ xxa.copy article post --article="toKeyword~camel" --toKeyword="post"  
    
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
`)
}
