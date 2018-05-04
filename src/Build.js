const path = require('path');
const util = require('util');

const glob = util.promisify(require('glob'));
const promiseSeries = require('promise.series');
const escape = require('escape-string-regexp');
const fs = require('fs-extra');

const readFile = util.promisify(fs.readFile);
const ensureFile = util.promisify(fs.ensureFile);
const writeFile = util.promisify(fs.writeFile);

const Template = require('./Template');

const NormaliseFile = (source, file) => {
  return file.replace(new RegExp(`^${escape(source)}\/?`), '');
};

const Build = async(source, destination, options, {pipes}) => {
  const files = await glob(source + '/**/*.*', {dot: true});
  await promiseSeries(files.map((file) => () => Generate(source, file, destination, options, pipes)));
};


const TemplateFactory = (templateContent, pipes) => {
  const template = Template(templateContent);
  template.setPipes(pipes);
  return template;
};

const Generate = async(source, file, destination, options, pipes) => {
  const normalisedFile = NormaliseFile(source, file);
  // console.log(normalisedFile, file, destination, options);

  const templateFileContent = await readFile(file);
  const fileContent = await TemplateFactory(templateFileContent, pipes).render(options);

  const filePathTemplate = normalisedFile.replace(/~/igm, '|');
  const destinationFilePath = await TemplateFactory(filePathTemplate, pipes).render(options);

  const outputFile = `${destination}/${destinationFilePath}`;
  await ensureFile(outputFile);
  await writeFile(outputFile, fileContent);

  console.log(`> [ok] ${outputFile}`);
};

module.exports = {
  Build,
  NormaliseFile,
  Generate
};