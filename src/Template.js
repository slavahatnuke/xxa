const nunjucks = require('nunjucks');
const _ = require('lodash');
const Stream = require("stream");

class TemplateClass {
    constructor(template) {
        this.init();
        this.template2 = this.prepare(String(template))

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
                normalize: true
            },
            {
                from: '}}}}',
                to: '}}} }',
                normalize: true
            },
        ];

        this.replaces = this.replaces.map((replacement) => {
            const reFrom = replacement.from.split('').map((i) => '\\' + i).join('');
            const reTo = replacement.to.split('').map((i) => '\\' + i).join('');

            replacement.fromRegExp = new RegExp(reFrom, 'igm');
            replacement.toRegExp = new RegExp(reTo, 'igm');

            return replacement;
        });
    }

    prepare(template) {
        this.replaces.map((replacement) => {
            template = template.replace(replacement.fromRegExp, replacement.to)
        });


        template = template
            .replace(/{{{(.*?)}}}/igm, (replacement) => {
                return replacement.replace(/~/igm, '|')
            })

        return template;
    }

    render(data) {
        return Promise.resolve()
            .then(() => this.replacer.renderString(this.template2, data));
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
