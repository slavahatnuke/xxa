const nunjucks = require('nunjucks');
const _ = require('lodash');
const escape = require('regex-escape');

class TemplateClass {
    constructor(template) {
        this.init();
        this.textTemplate = this.prepare(String(template))

        this.replacer = new nunjucks.Environment([], {
            autoescape: false,
            throwOnUndefined: true,

            tags: {
                blockStart: '{{{%',
                blockEnd: '%}}}',
                variableStart: '{{{',
                variableEnd: '}}}',
                commentStart: '{{{#',
                commentEnd: '#}}}'
            }
        });
    }

    init() {
        this.replaces = [
            {
                from: '{{{{',
                to: '{ {{{',
            },
            {
                from: '}}}}',
                to: '}}} }',
            },
        ];
    }

    prepare(template) {
        this.replaces.map((replacement) => {
            template = template.replace(new RegExp(escape(replacement.from), 'igm'), replacement.to)
        });


        template = template
            .replace(/{{{(.*?)}}}/igm, (replacement) => {
                return replacement.replace(/~/igm, '|')
            })

        return template;
    }

    render(data) {
        return Promise.resolve()
            .then(() => this.replacer.renderString(this.textTemplate, data));
    }

    setPipes(pipes) {
        Object.keys(pipes).forEach((name) => {
            this.replacer.addFilter(name, pipes[name])
        })

        return Promise.resolve(this)
    }
}

const Template = (template) => new TemplateClass(template);

module.exports = Template;
