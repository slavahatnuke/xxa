const escape = require("escape-string-regexp");
const {DefaultTemplate} = require("./DefaultTemplate");

function replace(content, replaces) {
    // replaces is KEY-VALUE object
    const cycle2Items = []

    const ID = () => `${Date.now().toString(16)}${Math.random().toString(16)}`


    const cycle1Content = Object
        .keys(replaces)
        .reduce((input, name) => {
            const value = replaces[name]

            const key = ID()

            cycle2Items.push({
                key: key,
                value: value
            })

            return String(input)
                .replace(new RegExp(`${escape(name)}`, 'gm'), key)
        }, content);

    const cycle2Content = cycle2Items
        .reduce((input, item) => {
            return String(input)
                .replace(new RegExp(`${escape(item.key)}`, 'gm'), item.value)
        }, cycle1Content);

    return cycle2Content;
}


function renderOptions(options, optionsArguments = {}) {
    // replaces is KEY-VALUE object
    return Object
        .keys(options)
        .reduce((input, name) => {
            const value = options[name]

            const data = {...options, ...optionsArguments};

            const renderedName = DefaultTemplate(name).renderSync(data) || 'XXA_META_RENDER_KEY';
            const renderedValue = DefaultTemplate(value).renderSync(data) || '';

            return {
                ...input,
                [renderedName]: renderedValue
            }
        }, {});
}

module.exports = {
    replace,
    renderOptions
}
