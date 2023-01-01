// Api server on port 5000

'use strict';

const express = require('express');

const app = express();
const helper = require('./helper.js')

app.use(express.json());
const upload = multer();

app.post('/end-point', async function (req, res){
    //fetch request body
    if (req.body.userId && req.body.password){
    let userId = req.body.userId
    let password = req.body.password
    //call login function and pass the above variables to it
    console.log("user enter this pass:", password)
   const result = await helper.login(userId, password);
   console.log("result from app.js : ",result);
    //check response returned by login function and set API response accordingly

        if(result=="success"){
            res.status(200).send(`${userId} User logged in successfully`)
        }else{
            res.status(200).send("User not exist")
        }
    }
    else{
        res.status(400).send("Please enter userId and password")
    }
}
)

let server = app.listen(5000, function () {
    console.log('Node server is running.. on 5000 port :) ');
});

