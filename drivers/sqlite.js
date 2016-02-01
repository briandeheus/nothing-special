'use strict';

const async    = require('async');
const settings = require('../settings');
const sqlite3  = require('sqlite3').verbose();
const db       = new sqlite3.Database(settings.database.file);

/**
 * Post Functionality
 * @param cb
 */
exports.getCount = (cb) => {

    let statement = db.prepare("SELECT count(id) as count FROM posts WHERE draft = 0");
    statement.get(cb);

};

exports.getInRange = (from, to, cb) => {

    let statement = db.prepare("SELECT * FROM posts WHERE draft = ? ORDER BY id DESC LIMIT ?, ?");
    statement.run(0, from, to);
    statement.all(cb);

};

exports.getDrafts = (cb) => {

    let statement = db.prepare("SELECT * FROM posts WHERE draft = 1 ORDER BY id DESC");
    statement.all(cb);

};

exports.create = (postModel, cb) => {

    let statement = db.prepare("INSERT INTO posts VALUES (?, ?, ?, ?, ?)");

    statement.run(null, postModel.title, postModel.content, Date.now(), postModel.draft);
    statement.finalize(() => {

        db.get('SELECT last_insert_rowid() as id FROM posts', cb);

    });

};

exports.update = (postModel, cb) => {

    let statement = db.prepare("UPDATE posts SET title = ?, content = ?, draft = ? WHERE id = ?");

    statement.run(postModel.title, postModel.content, postModel.draft, postModel.id);
    statement.finalize(cb);

};


exports.getOne = (id, cb) => {

    id = parseInt(id, 10);
    let statement = db.prepare("SELECT id, title, content, creationDate, draft FROM posts WHERE id = ?");
    statement.get(id, cb);

};

exports.remove = (postModel, cb) => {

    let statement = db.prepare("DELETE FROM posts WHERE id = ?");
    statement.get(postModel.id, cb);

};

/*
Maintenance functions
 */

exports.connect = (cb) => {

    cb(null);

};

exports.createSchema = (cb) => {

    async.series([
        (next) => {
            db.run("CREATE TABLE posts (id INTEGER PRIMARY KEY ASC, title TEXT, content TEXT, creationDate INTEGER, draft BOOLEAN)", next);
        },

        (next) => {
            db.run("CREATE TABLE sessions (key TEXT PRIMARY KEY UNIQUE, creationDate INTEGER, lastUpdate INTEGER)", next);
        }

    ], cb);

};

exports.getSession = (key, cb) => {

    let statement = db.prepare("SELECT key, creationDate, lastUpdate FROM sessions WHERE key = ?");
    statement.get(key, cb);

};

exports.updateSession = (key, cb) => {

    let statement = db.prepare("UPDATE sessions SET lastUpdate = ? WHERE key = ?");
    statement.run(Date.now(), key);
    statement.finalize(cb);

};

exports.deleteSession = (key, cb) => {

    let statement = db.prepare("DELETE FROM sessions WHERE key = ?");
    statement.run(key);
    statement.finalize(cb);

};

exports.createSession = (key, cb) => {

    const now     = Date.now();
    let statement = db.prepare("INSERT INTO sessions VALUES (? , ?, ?)");
    statement.run(key, now, now);
    statement.finalize(cb);

};