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
const {DefaultTemplate} = require("./DefaultTemplate");

function normDir(dir) {
    return path.normalize(`${dir}/`);
}

function normFile(file) {
    return path.normalize(file);
}

function renderReplaces(replaces) {
    // replaces is KEY-VALUE object
    const renderedReplaces = Object
        .keys(replaces)
        .reduce((input, name) => {
            const value = replaces[name]

            const renderedName = DefaultTemplate(name).renderSync(replaces).trim() || 'XXA_META_KEY';
            const renderedValue = DefaultTemplate(value).renderSync(replaces).trim() || 'XXA_META_VALUE';

            return {
                ...input,
                [renderedName]: renderedValue
            }
        }, {});

    return renderedReplaces;
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

async function Save(source, destination, options) {
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

    const rawReplaces = {...options};
    const unflattenOptions = unflatten(options)

    const file = unflattenOptions?.xxa?.file || {}
    const rawFileReplaces = {...rawReplaces, ...file};

    const replaces = renderReplaces(rawFileReplaces);
    const fileReplaces = renderReplaces(rawFileReplaces);

    // console.log(chalk.grey(`> [input.raw] ${JSON.stringify(rawReplaces)}`));
    // console.log(chalk.grey(`> [input.raw.xxa.file] ${JSON.stringify(rawReplaces)}`));

    console.log(chalk.green(`> [run] ${source} >> ${destination}`));
    // console.log(chalk.green(`> [save] ${JSON.stringify({from: source, to: destination})}`));
    console.log(chalk.grey(`> [map] ${JSON.stringify(replaces)}`));
    // console.log(chalk.grey(`> [input.xxa.file] ${JSON.stringify(fileReplaces)}`));

    await promiseSeries(
        files
            .map(normFile)
            .map((inputFile) => async () => {


                const pointedInputFile = inputFile
                    .replace(new RegExp(`^${escape(source)}`), destination)

                const outputFile = render(pointedInputFile, fileReplaces)

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

module.exports = {Save: Save}
