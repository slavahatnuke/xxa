const path = require('path');
const util = require('util');

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
const {getFiles, changeSourceToDestination} = require("./files");

function normDir(dir) {
    return path.normalize(`${dir}`);
}

function normFile(file) {
    return path.normalize(file);
}

function renderReplaces(replaces) {
    // replaces is KEY-VALUE object
    return Object
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
}

function renderContentToMustacheTemplate(content, replaces) {
    // replaces is KEY-VALUE object
    const cycle2Items = []

    const ID = () => `${Date.now().toString(16)}${Math.random().toString(16)}`

    const cycle1Content = Object
        .keys(replaces)
        .reduce((input, name) => {
            const value = replaces[name]

            const key = ID()
            const templateValue = `{{{${value}}}}`;

            cycle2Items.push({
                key: key,
                value: templateValue
            })

            return String(input)
                .replace(new RegExp(`${escape(name)}`, 'gm'), key)
        }, content);

    const cycle2Content = cycle2Items
        .reduce((input, item) => {
            return String(input)
                .replace(new RegExp(`${escape(item.key)}`, 'gm'), item.value)
        }, cycle1Content);

    // console.log({cycle1Content, cycle2Content})
    return cycle2Content;
}


async function Save(source, destination, options) {
    function toHintName(name) {
        return name ? _.snakeCase(String(name).split('').join('_')) : '';
    }

    if (source && !destination) {
        const dirName = path.dirname(source);
        const hint1 = toHintName(path.basename(dirName));
        const hint2 = toHintName(path.basename(source));

        destination = path.normalize(
            `tmp/${Date.now()}.${hint1}.${hint2}`
                .replace(/\.+/igm, '.')
                .replace(/\.\//igm, '')
        )
    }

    source = normDir(source)
    destination = normDir(destination)

    // console.log({source, destination, options})

    let files = await getFiles(source);

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

    console.log(chalk.green(`> [save] ${source} >> ${destination}`));
    // console.log(chalk.green(`> [save] ${JSON.stringify({from: source, to: destination})}`));
    console.log(chalk.grey(`> [save.map] ${JSON.stringify(replaces)}`));
    console.log(chalk.grey(`> [save.map.files] ${JSON.stringify(replaces)}`));
    // console.log(chalk.grey(`> [input.xxa.file] ${JSON.stringify(fileReplaces)}`));

    await promiseSeries(
        files
            .map(normFile)
            .map((inputFile) => async () => {

                const pointedInputFile = changeSourceToDestination(inputFile, source, destination)

                const outputFile = renderContentToMustacheTemplate(pointedInputFile, fileReplaces)

                const inputFileContent = String(await readFile(inputFile));
                const outputFileContent = renderContentToMustacheTemplate(inputFileContent, replaces);

                await ensureFile(outputFile)
                await writeFile(outputFile, outputFileContent)


                // console.log({
                //     inputFile,
                //     pointedInputFile,
                //     outputFile
                // })

                console.log(chalk.green(`> [ok] ${outputFile}`));
            })
    )

    console.log(chalk.green(`> [saved] ${destination}`));

    return destination
}

module.exports = {Save}
