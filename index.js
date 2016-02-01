'use strict';

const express      = require('express');
const Post         = require('./lib/post');
const Page         = require('./lib/page');
const async        = require('async');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const uuid         = require('uuid');
const settings     = require('./settings');
const sessions     = require('./lib/session');

const app            = express();
const POSTS_PER_PAGE = settings.blog.postsPerPage;

/*
Set up express to use a bunch of middleware to make our lives easier.
 */
app.use(cookieParser());
app.use(sessions.middleware);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.disable('x-powered-by');

function getInRange(req, res) {

    const then = Date.now();

    let posts  = [];
    let count  = 0;

    const template = new Page('list');

    const page = parseInt(req.params.page || 0, 10);
    const from = page * POSTS_PER_PAGE;
    const to   = from + POSTS_PER_PAGE;

    async.series([

        /* Get the total post count */
        (next) => {

            Post.getCount(function (error, countInteger) {

                count = countInteger.count;
                next();

            });

        },

        /* Get posts in range */
        (next) => {

            Post.getInRange(from, to, (error, postsArray) => {

                posts = postsArray;
                next();

            });

        }


    ], function () {

        var next     = -1;
        var previous = -1;

        if (to >= count) {
            next = -1;
        } else if (count > POSTS_PER_PAGE) {
            next = page + 1;
        }

        if (page >= 0) {
            previous = page - 1;
        }

        template.addVariable('posts', posts);
        template.addVariable('next', next);
        template.addVariable('previous', previous);
        template.addVariable('renderTime', Date.now() - then);
        template.addVariable('isAdmin', req.isLoggedIn);

        res.send(template.render());

    });

}

app.get('/', (req, res) => {

    getInRange(req, res);

});

app.get('/archive/:page', (req, res) => {

    getInRange(req, res);

});

app.get('/read/:id', (req, res) => {

    const template = new Page('post');

    Post.getOne(req.params.id, (error, postModel) => {
        
        if (postModel.id === null) {

            const template = new Page('error');
            template.addVariable('errorCode', 404);
            template.addVariable('errorMessage', 'The page you are looking for could not be found.');

            res.status(404);
            res.send(template.render());

            return;

        }

        template.addVariable('isAdmin', req.isLoggedIn);
        template.addVariable('post', postModel);
        template.addVariable('pageTitle', postModel.title);

        res.send(template.render())

    });

});

app.post('/read/:id', (req, res) => {

    if (req.isLoggedIn === false) {

        const template = new Page('error');
        template.addVariable('errorCode', 400);
        template.addVariable('errorMessage', 'You should not be where you are right now.');

        res.status(400);
        res.send(template.render());
        return;

    }

    let post = null;

    if (req.body.save === '') {

        const template = new Page('post');

        async.series([

            (next) => {

                Post.getOne(req.params.id, (error, postModel) => {

                    post = postModel;
                    next();

                });

            },

            (next) => {

                post.content = req.body.content;
                post.title   = req.body.title;
                post.draft   = (req.body.draft === 'on');

                post.save(next);

            }

        ], () => {

            template.addVariable('isAdmin', req.isLoggedIn);
            template.addVariable('post', post);

            res.send(template.render())

        });

        return;

    }

    if (req.body.delete === '') {

        Post.getOne(req.params.id, (error, postModel) => {

            postModel.remove(function () {

                res.redirect('/');

            });

        });

        return;

    }

    res.redirect('/');

});

app.all('/create', (req, res) => {


    if (req.isLoggedIn === false) {

        const template = new Page('error');
        template.addVariable('errorCode', 400);
        template.addVariable('errorMessage', 'You should not be where you are right now.');

        res.status(400);
        res.send(template.render());
        return;

    }

    if (req.body.content == undefined || req.body.title == undefined) {

        const template = new Page('post');
        template.addVariable('isAdmin', req.isLoggedIn);

        res.send(template.render());

        return;

    }

    let post = new Post();

    post.content = req.body.content;
    post.title   = req.body.title;
    post.draft   = (req.body.draft === 'on');

    post.save(function () {

         res.redirect('read/' + post.id);

    });

});

app.all('/drafts', (req, res) => {

    if (req.isLoggedIn === false) {

        const template = new Page('error');
        template.addVariable('errorCode', 400);
        template.addVariable('errorMessage', 'You should not be where you are right now.');

        res.status(400);
        res.send(template.render());
        return;

    }

    Post.getDrafts((error, postsArray) => {

        const template = new Page('drafts');
        template.addVariable('posts', postsArray);
        res.send(template.render());

    });

});

app.get('/auth/:key', (req, res) => {

    if (req.params.key !== settings.blog.authKey) {

        const template = new Page('error');
        template.addVariable('errorCode', 400);
        template.addVariable('errorMessage', 'You should not be where you are right now.');

        res.status(400);
        res.send(template.render());
        return;

    }

    var token = uuid.v4();

    sessions.create(token, () => {

        res.cookie('nothingspecial', token, {maxAge: settings.session.ttl});
        res.send('auth');

    });



});

app.listen(settings.server, function () {

    console.log('The app is live.')

});

app.get('*', (req, res) => {

    const template = new Page('error');
    template.addVariable('errorCode', 404);
    template.addVariable('errorMessage', 'The page you are looking for could not be found.');

    res.status(404);
    res.send(template.render());

});