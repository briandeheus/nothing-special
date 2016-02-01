'use strict';

const settings = require('../settings');
const driver   = require('../drivers/' + settings.database.driver);
const ttl      = settings.session.ttl;
const tokenKey = settings.session.key;

exports.create = (key, cb) => {

    driver.createSession(key, cb);

};

exports.remove = (key, cb) => {

    driver.deleteSession(key, cb);

};

exports.get = (key, cb) => {

    const now = Date.now();

    driver.getSession(key, function (error, data) {

        if (data === undefined) {

            cb(null, false);
            return;

        }


        if (now > (data.lastUpdate + ttl)) {

            cb (null, false);
            return

        }

        driver.updateSession(key, function () {

            cb(null, true);

        });

    });

};

exports.middleware = (req, res, next) => {

    const token = req.cookies[tokenKey];

    exports.get(token, (error, loggedIn) => {

        req.isLoggedIn = loggedIn;
        next();

    });

};