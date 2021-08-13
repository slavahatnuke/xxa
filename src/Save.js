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
const {replace, renderOptions} = require("./replace");

function normDir(dir) {
    return path.normalize(`${dir}`);
}

function normFile(file) {
    return path.normalize(file);
}


function renderContentToMustacheTemplate(content, replaces) {
    replaces = Object.fromEntries(Object.entries(replaces)
        .map(([key, value]) => {
            return [key, `{{{${value}}}}`]
        }))

    return replace(content, replaces);
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

    const rawOptions = {...options};
    const unflattenOptions = unflatten(options)

    const file = unflattenOptions?.xxa?.file || {}
    const rawFileOptions = {...rawOptions, ...file};

    const mapToRender = renderOptions(rawFileOptions);
    const fileMapToRender = renderOptions(rawFileOptions);

    console.log(chalk.green(`> [save] ${source} >> ${destination}`));
    // console.log(chalk.green(`> [save] ${JSON.stringify({from: source, to: destination})}`));
    console.log(chalk.grey(`> [save.map] ${JSON.stringify(mapToRender)}`));
    console.log(chalk.grey(`> [save.map.files] ${JSON.stringify(mapToRender)}`));
    // console.log(chalk.grey(`> [input.xxa.file] ${JSON.stringify(fileReplaces)}`));

    await promiseSeries(
        files
            .map(normFile)
            .map((inputFile) => async () => {

                const pointedInputFile = changeSourceToDestination(inputFile, source, destination)

                const outputFile = renderContentToMustacheTemplate(pointedInputFile, fileMapToRender)

                const inputFileContent = String(await readFile(inputFile));
                const outputFileContent = renderContentToMustacheTemplate(inputFileContent, mapToRender);

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
