const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8000;
const path = require('path');
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.static(__dirname + './public'));
app.use(express.static(path.join(__dirname, './public')));
MongoClient.connect("mongodb://shubham0109:shubham@ds123619.mlab.com:23619/database1", (err, database) => {
    if (err) {
        return console.log(err);
    }
    let db = database.db("database1");
    require('./routes')(app, db);
    app.listen(port, function(){
        console.log(`App listening on ${port}`);
    });             
});