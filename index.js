// Importing the required modules

var session = require ('express-session')
var express = require ('express')
var ejs = require('ejs')
var bodyParser= require ('body-parser')
const mysql = require('mysql');


// Create the Express application object

const app = express()
const port = 8000
app.use(bodyParser.urlencoded({ extended: true }))


// Link the css file

app.use(express.static(__dirname + '/public'));


// Create a session

app.use(session({
    secret: 'diddykong',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));


// Define the database connection

const db = mysql.createConnection ({
    host: 'localhost',
    user: 'wikiapp',
    password: 'wikipass',
    database: 'theWikiDatabase'
});


// Connect to the database

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;


// Set the directory where Express will pick up HTML files
// __dirname will get the current directory

app.set('views', __dirname + '/views');


// Tell Express that we want to use EJS as the templating engine

app.set('view engine', 'ejs');


// Tells Express how we should process html files
// We want to use EJS's rendering engine

app.engine('html', ejs.renderFile);


// Define our data

var siteData = {siteName: "The Trekker's Trivia Tavern"}


// Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file

require("./routes/main")(app, siteData);


// Start the web app listening

app.listen(port, () => console.log(`Example app listening on port ${port}!`))