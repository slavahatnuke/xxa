const util = require("util");
const escape = require("escape-string-regexp");
const glob = util.promisify(require('glob'));

async function getFiles(source) {
    return Array.from(
        new Set(
            [
                ...await glob(source + '/**/*', {dot: true, nodir: true}),
                ...await glob(source, {dot: true, nodir: true}),
            ]
        )
    );
}

function changeSourceToDestination(inputFile, source, destination) {
    return inputFile
        .replace(new RegExp(`^${escape(source)}`), destination);
}

module.exports = {getFiles: getFiles, changeSourceToDestination}
