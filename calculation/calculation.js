var express = require('express');
var router = express.Router();
var db = require('./db/db')

router.post('/createClearance', db.createClearance);

module.exports = router;
