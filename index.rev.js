const argv = Object.assign({}, require('minimist')(process.argv.slice(2)));
const _ = require('lodash');
const {Rev} = require('./src/Rev');

const [source, destination] = argv._;
const options = _.omit(argv, ['_']);

if (source && destination) {

    Rev(source, destination, options).catch((error) => console.error(error));

} else {
    console.log(`
  $ xxa.rev <source-dir> <destination-dir> [options]
  
  Example:
    $ xxa.rev article article-template --article="name~Camel"
    
    <source-dir>
      article/article.html
   
    <destination-dir>
      article-template/{{{name~Camel}}}.html

    > source content
        article/article.html
          article


    > destination content
        article-template/{{{name~Camel}}}.html
          {{{name~Camel}}} 
`)
}
