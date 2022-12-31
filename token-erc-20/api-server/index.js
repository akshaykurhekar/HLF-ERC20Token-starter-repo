// Api server on port 5000

'use strict';

const multer  = require('multer')
const express = require('express');

const app = express();
const helper = require('./helper.js')

app.use(express.json());
const upload = multer();

let server = app.listen(5000, function () {
    console.log('Node server is running.. on 5000 port :) ');
});

