'use strict';

let settings = require('../settings');
let driver   = require('../drivers/' + settings.database.driver);

/** Symbols **/
const content      = Symbol('content');
const id           = Symbol('id');
const title        = Symbol('title');
const creationDate = Symbol('creationDate');
const draft        = Symbol('draft');

/**
 * Getting our
 */
let marked       = require('marked');
let highlight    = require('highlight.js');

marked.setOptions({

  highlight: function (code) {
    return highlight.highlightAuto(code).value;
  }

});

class Post {

    constructor(data) {

        if (data === undefined) {

            this[content]      = null;
            this[id]           = null;
            this[title]        = null;
            this[creationDate] = null;
            this[draft]        = true;


        } else {

            this[content]      = data.content;
            this[id]           = data.id;
            this[title]        = data.title;
            this[creationDate] = data.creationDate;
            this[draft]        = data.draft;

        }

    }

    static getCount(cb) {

        driver.getCount(cb);

    }

    static getOne(id, cb) {

        driver.getOne(id, function (error, data) {

            if (error !== null) {
                cb(error);
                return;
            }

            cb(null, new Post(data));

        });

    }

    static getDrafts(cb) {

        driver.getDrafts(function (error, results) {

            if (error !== null) {

                cb(error);
                return;

            }

            var posts = [];

            for (var i = 0, l = results.length; i < l; i += 1) {

                posts.push(new Post(results[i]))

            }

            cb(null, posts);

        });

    }

    static getInRange(from, to, cb) {

        driver.getInRange(from, to, function (error, results) {

            if (error !== null) {

                cb(error);
                return;

            }

            var posts = [];

            for (var i = 0, l = results.length; i < l; i += 1) {

                posts.push(new Post(results[i]))

            }

            cb(null, posts);

        });

    }

    save(cb) {

        if (this[id] === null) {

            driver.create(this, (error, result) => {

                this[id] = result.id;
                cb();

            });

        } else {

            driver.update(this, cb);

        }

    }

    remove(cb) {
        driver.remove(this, cb);
    }

    set title(text) {
        this[title] = text;
    }

    set content(text) {
        this[content] = text;
    }

    set draft(isDraft) {
        this[draft] = (isDraft === true) ? 1 : 0;
    }

    get markedDown() {
        return marked(this[content]);
    }

    get title() {
        return this[title];
    }

    get content() {
        return this[content];
    }

    get id() {
        return this[id]
    }

    get creationDate() {
        return this[creationDate];
    }

    get draft() {
        return (this[draft] === 1);
    }

}

module.exports = Post;