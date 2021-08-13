const argv = Object.assign({}, require('minimist')(process.argv.slice(2)));
const _ = require('lodash');
const {Rev} = require('./src/Rev');

let [source, destination] = argv._;
const options = _.omit(argv, ['_']);

const path = require('path');

let autoDestination = false

function toHintName(name) {
    return name ? _.snakeCase(String(name).split('').join('_')) : '';
}

if (source && !destination) {
    autoDestination = true

    const dirName = path.dirname(source);
    const hint1 = toHintName(path.basename(dirName));
    const hint2 = toHintName(path.basename(source));

    destination = path.normalize(
        `tmp/${Date.now()}.${hint1}.${hint2}`
            .replace(/\.+/igm, '.')
            .replace(/\.\//igm, '')
    )
}

if (source && destination) {

    Rev(source, destination, options).catch((error) => console.error(error));

} else {
    console.log(`
  $ xxa.save <source-dir> <destination-dir> [options]
  
  Example:
    $ xxa.save article article-template --article="name~Camel" --file.article="name~snake"
    
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
