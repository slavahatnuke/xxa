const path = require('path');
const util = require('util');

const fs = require('fs-extra');
const removeFile = util.promisify(fs.remove);

const chalk = require('chalk');
const {Save} = require("./Save");
const {Build} = require("./Build");
const pipes = require("../config/pipes");
const {getFiles} = require("./files");


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

    console.log(files)
    //
    // try {
    //
    //     console.log(chalk.grey(`> [copy.template] ${templateDestination}`));
    //
    //     const pipes = require('../config/pipes');
    //
    //     console.log(chalk.grey(`> [copy.build] ${templateDestination} >> ${destination}`));
    //     await Build(templateDestination, destination, options, {pipes})
    //
    //     console.log(chalk.green(`> [copied] ${source} >> ${destination}`));
    // } catch (error) {
    //     throw error
    // } finally {
    //     if(options['xxa-no-delete']) {
    //         console.log(chalk.grey(`> [copy.template.available] ${templateDestination}`));
    //     } else {
    //         await removeFile(templateDestination);
    //         console.log(chalk.grey(`> [copy.template.deleted] ${templateDestination}`));
    //     }
    // }
}

module.exports = {Copy: Copy}
