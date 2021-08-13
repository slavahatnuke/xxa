const path = require('path');
const util = require('util');

const fs = require('fs-extra');
const removeFile = util.promisify(fs.remove);

const chalk = require('chalk');
const {Save} = require("./Save");
const {Build} = require("./Build");
const pipes = require("../config/pipes");
const {getFiles, changeSourceToDestination} = require("./files");
const {renderOptions, replace} = require("./replace");

const readFile = util.promisify(fs.readFile);
const ensureFile = util.promisify(fs.ensureFile);
const writeFile = util.promisify(fs.writeFile);


async function Copy(source, destination, options) {
    console.log(chalk.green(`> [copy] ${source} >> ${destination}`));

    let files = await getFiles(source);

    if (options['xxa-no-dot']) {
        files = files
            .filter((file) => {
                const regexp = /\/\.(.+)\//igm;
                return !regexp.test(file);
            })
    }

    const mapToRender = renderOptions(options);

    console.log(chalk.grey(`> [map] ${JSON.stringify(mapToRender)}`))

    const fileDirection = files.map((from) => {
        const pointer = changeSourceToDestination(from, source, destination);
        const to = replace(pointer, mapToRender);

        return {
            from,
            to
        }
    });

    for (const {from, to} of fileDirection) {
        const content = String(await readFile(from));
        const nextContent = replace(content, mapToRender);

        await ensureFile(to)
        await writeFile(to, nextContent)

        console.log(chalk.green(`> [ok] ${to}`))
    }

    console.log(chalk.green(`> [copied] ${source} >> ${destination}`))

}

module.exports = {Copy: Copy}
