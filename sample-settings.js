var cwd = process.cwd();

/*
Example settings. Modify to your taste and save as settings.js
 */

module.exports = {

    blog: {
        title: 'Your blog',
        postsPerPage: 10,
        authKey: 'your-auth-key',
        theme: 'basic'
    },
    session: {
        key: 'nothingspecial',
        ttl: 1000 * 3600 * 24 * 14 // 2 weeks
    },
    server: {
        host: '127.0.0.1',
        port: 3000
    },
    database: {
        driver: 'sqlite',
        file:   cwd + '/db.sql3'
    }

};