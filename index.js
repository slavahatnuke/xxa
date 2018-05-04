const argv = Object.assign({}, require('minimist')(process.argv.slice(2)));
const _ = require('lodash');

const [source, destination] = argv._;
const options = _.omit(argv, ['_']);

const Build = require('./src/Build');

if (source && destination) {
  Build(source, destination, options)
    .catch((error) => console.error(error));

} else {
  console.log(`
  
  $ xxa <source-dir> <destination-dir> [options]
  
  Example:
    $ xxa article-template article --article="Hello Article"
    
    [source-dir]
      article-template/{{{article~camel}}}.html
   
    [destination-dir]
      article/helloArticle.html
`)
}
