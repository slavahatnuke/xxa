const util = require("util");
const escape = require("escape-string-regexp");
const path = require("path");
const glob = util.promisify(require('glob'));

function toPathWithoutEndSlash(file) {
    return path.normalize(file).replace(/\/+$/gm, '');
}

async function getFiles(source) {
    return Array.from(
        new Set(
            [
                ...await glob(source + '/**/*', {dot: true, nodir: true}),
                ...await glob(source, {dot: true, nodir: true}),
            ]
        )
    ).map(toPathWithoutEndSlash);
}

function changeSourceToDestination(inputFile, source, destination) {
    return inputFile
        .replace(new RegExp(`^${escape(toPathWithoutEndSlash(source))}`), destination);
}

module.exports = {getFiles: getFiles, changeSourceToDestination, toPathWithoutEndSlash}
