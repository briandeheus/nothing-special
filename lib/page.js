'use strict';

const settings  = require('../settings');
const theme     = settings.blog.theme;
const swig      = require('swig');

const page  = Symbol('page');
const data  = Symbol('data');
const title = Symbol('title');

const templates = {
    list:     swig.compileFile(`themes/${theme}/list.html`,   {autoescape: false}),
    post:     swig.compileFile(`themes/${theme}/post.html`,   {autoescape: false}),
    drafts:   swig.compileFile(`themes/${theme}/drafts.html`, {autoescape: false}),
    error:    swig.compileFile(`themes/${theme}/error.html`,  {autoescape: false})
};


class Page {

    constructor (template) {

        if (templates[template] === undefined) {
            throw new Error('Unknown template: ' + template);
        }

        this[page]  = templates[template];
        this[data]  = {};
        this[title] = settings.blog.title;

    }

    addVariable (key, theData) {

        this[data][key] = theData;

    }

    render () {

        if (this[data].pageTitle === undefined) {
            this.addVariable('pageTitle', this[title]);
        } else {
            this[data].pageTitle = this[title] + ' | ' + this[data].pageTitle;
        }

        return this[page](this[data]);

    }

}

module.exports = Page;