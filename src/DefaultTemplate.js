const Template = require("./Template");

function DefaultTemplate(templateContent) {
    const template = Template(templateContent);
    template.setPipes(require('../config/pipes'));
    return template;
}

module.exports = {
    DefaultTemplate
}
