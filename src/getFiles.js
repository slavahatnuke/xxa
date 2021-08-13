const util = require("util");
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

module.exports = {getFiles}
