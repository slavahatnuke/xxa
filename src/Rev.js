const path = require('path');
const util = require('util');

const glob = util.promisify(require('glob'));
const promiseSeries = require('promise.series');
const escape = require('escape-string-regexp');
const fs = require('fs-extra');
const _ = require('lodash');
const unflatten = require('flat').unflatten;

const readFile = util.promisify(fs.readFile);
const ensureFile = util.promisify(fs.ensureFile);
const writeFile = util.promisify(fs.writeFile);

const chalk = require('chalk');

function normDir(dir) {
    return path.normalize(`${dir}/`);
}

function normFile(file) {
    return path.normalize(file);
}

function render(content, replaces) {
    // replaces is KEY-VALUE object
    return Object
        .keys(replaces)
        .reduce((input, name) => {
            const value = replaces[name]
            return String(input)
                .replace(new RegExp(`${escape(name)}`, 'gm'), `{{{${value}}}}`)
        }, content);
}

async function Rev(source, destination, options) {
    source = normDir(source)
    destination = normDir(destination)

    // console.log({source, destination, options})

    let files = await glob(source + '/**/*', {dot: true, nodir: true});

    if (options['xxa-no-dot']) {
        files = files
            .filter((file) => {
                const regexp = /\/\.(.+)\//igm;
                return !regexp.test(file);
            })
    }

    const replaces = {...options};
    const {file = {}} = unflatten(options)

    await promiseSeries(
        files
            .map(normFile)
            .map((inputFile) => async () => {


                const pointedInputFile = inputFile
                    .replace(new RegExp(`^${escape(source)}`), destination)

                const outputFile = render(pointedInputFile, {...replaces, ...file})

                const inputFileContent = String(await readFile(inputFile));
                const outputFileContent = render(inputFileContent, replaces);

                await ensureFile(outputFile)
                await writeFile(outputFile, outputFileContent)

                //
                // console.log({
                //     inputFile,
                //     pointedInputFile,
                //     outputFile
                // })

                console.log(chalk.green(`> [ok] ${outputFile}`));
            })
    )

    console.log(chalk.green(`> [done] ${destination}`));
}

module.exports = {Rev}
