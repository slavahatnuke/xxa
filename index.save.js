const argv = Object.assign({}, require('minimist')(process.argv.slice(2)));
const _ = require('lodash');
const {Save} = require('./src/Save');

let [source, destination] = argv._;
const options = _.omit(argv, ['_']);

if (source) {

    Save(source, destination, options).catch((error) => console.error(error));

} else {
    console.log(`
  $ xxa.save <source-dir> <destination-dir> [options]
  
  Example:
    $ xxa.save article article-template --article="name~Camel" --xxa.file.article="name~snake"
    
    <source-dir>
      article/article.html
   
    <destination-dir>
      article-template/{{{name~snake}}}.html

    > source content
        article/article.html
          article


    > destination content
        article-template/{{{name~snake}}}.html
          {{{name~Camel}}} 
`)
}
