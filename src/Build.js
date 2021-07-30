const path = require('path');
const util = require('util');

const glob = util.promisify(require('glob'));
const promiseSeries = require('promise.series');
const escape = require('escape-string-regexp');
const fs = require('fs-extra');
const _ = require('lodash');

const readFile = util.promisify(fs.readFile);
const ensureFile = util.promisify(fs.ensureFile);
const writeFile = util.promisify(fs.writeFile);

const chalk = require('chalk');

const Template = require('./Template');

const NormaliseFile = (source, file) => {
  return file.replace(new RegExp(`^${escape(source)}\/?`), '');
};

const Build = async(source, destination, options, {pipes}) => {
  let files = await glob(source + '/**/*', {dot: true, nodir: true});

  if(!options['xxa-use-dot']) {
    files = files
      .filter((file) => {
        const regexp = /\/\.(.+)\//igm;
        return !regexp.test(file);
      })
  }
  await promiseSeries(files.map((file) => () => Generate(source, file, destination, options, pipes)));
};


const TemplateFactory = (templateContent, pipes) => {
  const template = Template(templateContent);
  template.setPipes(pipes);
  return template;
};

const ValidateGeneratePossibility = (file, content, options) => {
  const regexp = () => /{{{\s*(\w+)/igm;
  const match = `${content}`.match(regexp());

  if (match) {
    const optionArray = Object.keys(options);

    const names = _.uniq(match
      .map((name) => regexp().exec(name))
      .map((result) => result && result[1])
      .filter((it) => !!it))
      .filter((name) => !optionArray.includes(name));


    if (names.length) {
      const requiresString = names.map((name) => `--${name}="${name}"`).join(' ');

      console.warn(chalk.yellow(`> [skip] ${file}`));
      console.warn(chalk.yellow(`> [require] ${requiresString}`));

      return false;
    }
  }

  return true;
};

const Generate = async(source, file, destination, options, pipes) => {
  const normalisedFile = NormaliseFile(source, file);
  const filePathTemplate = normalisedFile.replace(/~/igm, '|');

  if (ValidateGeneratePossibility(normalisedFile, filePathTemplate, options)) {
    // console.log(normalisedFile, file, destination, options);

    const templateFileContent = (await readFile(file)).toString();

    if (ValidateGeneratePossibility(normalisedFile, templateFileContent, options)) {
      const fileContent = await TemplateFactory(templateFileContent, pipes).render(options);
      const destinationFilePathRaw = await TemplateFactory(filePathTemplate, pipes).render(options);
      const destinationFilePath = destinationFilePathRaw.replace(/\|/igm, '~')

      const outputFile = `${destination}/${destinationFilePath}`;
      await ensureFile(outputFile);
      await writeFile(outputFile, fileContent);

      console.log(chalk.green(`> [ok] ${outputFile}`));
    }
  }
};

module.exports = {
  Build,
  NormaliseFile,
  Generate
};
