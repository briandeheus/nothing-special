'use strict';

let settings = require('./settings');
let driver   = require('./drivers/' + settings.database.driver);

driver.createSchema( () => {

    console.log('Created schema');

});
