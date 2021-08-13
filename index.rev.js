const argv = Object.assign({}, require('minimist')(process.argv.slice(2)));
const _ = require('lodash');
const {Rev} = require('./src/Rev');

let [source, destination] = argv._;
const options = _.omit(argv, ['_']);

const path = require('path');

let autoDestination = false
if (source && !destination) {
    autoDestination = true
    destination = path.normalize(`tmp/${Date.now()}`)
}

if (source && destination) {

    Rev(source, destination, options).catch((error) => console.error(error));

} else {
    console.log(`
  $ xxa.rev <source-dir> <destination-dir> [options]
  
  Example:
    $ xxa.rev article article-template --article="name~Camel" --file.article="name~snake"
    
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
