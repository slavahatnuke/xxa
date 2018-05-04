let Template = require('../src/Template');
let assert = require('assert');

describe('template/Template.js', () => {
    it('render {{{ name }}}', () => {
        let template = Template('Hello {{{ name }}} {{must be left}}');

        return template
            .render({name: 'slava'})
            .then((result) => {
                assert.equal(result, 'Hello slava {{must be left}}')
            });
    })

    it('render {{% for ... %}}', () => {
        let template = Template('{{% for value in list %}} {{{ value }}}, {{% endfor %}} {% must be left %}');

        return template
            .render({list: ['a', 'b', 'c']})
            .then((result) => {
                assert.equal(result, ' a,  b,  c,  {% must be left %}')
            });
    })

    it('render {{{ name | ok }}}', () => {
        let template = Template('Hello {{{ name | ok}}}');

        ;

        return Promise.resolve()
            .then(() => template.setPipes({ok: (input) => input + '+ok'}))
            .then(() => {
                return template
                    .render({name: 'slava'})
                    .then((result) => {
                        assert.equal(result, 'Hello slava+ok')
                    });
            })
    })

    it('render {{{{ name }}}}', () => {
        let template = Template('Hello {{{{ name }}}}');

        return template
            .render({name: 'slava'})
            .then((result) => {
                assert.equal(result, 'Hello {{{ name }}}')
            });
    })


})