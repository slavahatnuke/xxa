const argv = Object.assign({}, require('minimist')(process.argv.slice(2)));
const _ = require('lodash');

const [source, destination] = argv._;
const options = _.omit(argv, ['_']);

const {Build} = require('./src/Build');
const pipes = require('./config/pipes');

if (source && destination) {
  Build(source, destination, options, {pipes})
    .catch((error) => console.error(error));

} else {
  console.log(`
  $ xxa <source-dir> <destination-dir> [options]
  
  Example:
    $ xxa article-template article --article="Hello Article"
    
    <source-dir>
      article-template/{{{article~camel}}}.html
   
    <destination-dir>
      article/helloArticle.html

    > source content
        article-template/{{{article~camel}}}.html
          {{{article | upper}}}

    > destination content
        article/helloArticle.html
          HELLO ARTICLE
`)
}
