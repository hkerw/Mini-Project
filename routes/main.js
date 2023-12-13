module.exports = function(app, siteData) {

    // Defining this variable outside of the scope that it will be used in

    var correctAnswer = '';

    // Redirects the user if they aren't logged in

    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
          res.redirect('./login')
        } else { next (); }
    }

    // Set up the validator for later use

    const { check, validationResult } = require('express-validator');

    // Set up routes for each page (index route links to all pages)

    app.get('/',function(req,res){
        res.render('index.ejs', siteData)
    });

    app.get('/about',function(req,res){
        res.render('about.ejs', siteData);
    });

    app.get('/search',function(req,res){
        res.render("search.ejs", siteData);
    });

    app.get('/search-result', function (req, res) {

        // Receives the keyword from "search.ejs" and uses it to search against the database

        let term = '%' + req.query.keyword + '%'
        let sqlquery = `SELECT * FROM search_articles WHERE  article_title LIKE '` + term + `' OR topic_title LIKE '` + term + `' OR article_content LIKE '` + term + `'`

        db.query(sqlquery, [term, term], (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let data = Object.assign({}, siteData, {articles:result});
            res.render('viewarticles.ejs', data)
        });
    });

    app.get('/writearticle', redirectLogin, function(req,res){

        // Send the initial values into the input boxes on the page

        let initialvalues = {username: req.session.userId , topic: '', title: '', content: ''}

        return renderAddNewArticle(res, initialvalues, "") 
    });

    function renderAddNewArticle(res, initialvalues, errormessage) {
        let data = Object.assign({}, siteData, initialvalues, {errormessage:errormessage});
        res.render("writearticle.ejs", data);
        return
    }

    // Ensure each field is a specific length to minimize chance of errors

    app.post('/articleadded', [check('title').isLength({min: 1, max: 30}).withMessage('Must be between 1-30 characters'), 
    check('topic').isLength({min: 1, max: 20}).withMessage('Must be between 1-20 characters'),
    check('content').notEmpty().withMessage('Cannot be left empty')], function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        else {

            let params = [req.body.title, req.body.content, req.body.topic, req.body.username]

            // Call the standard procedure which inserts these values into the database (or returns an error if unsuccessful)

            let sqlquery = `CALL sp_insert_article('` + params[0] + `', '` + params[1] + `', '` + params[2] + `', '` + params[3] + `')`
            db.query(sqlquery, params, (err, result) => {
                if(err) {
                    return renderAddNewArticle(res, req.body, err.message)
                }
                res.send('Your article has been successfully posted!')
            })
        }
    })

    app.get('/editarticle', redirectLogin, function(req,res){

        // When editing the article, the contents of the original article are saved

        let initialvalues = {username: req.session.userId, topic: req.query.topic, title: req.query.title, content: req.query.content}

        return renderEditArticle(res, initialvalues, "") 
    });

    function renderEditArticle(res, initialvalues, errormessage) {
        let data = Object.assign({}, siteData, initialvalues, {errormessage:errormessage});
        res.render("editarticle.ejs", data);
        return
    }

    // Ensure each field is a specific length to minimize chance of errors

    app.post('/articleedited', [check('title').isLength({min: 1, max: 30}).withMessage('Must be between 1-30 characters'), 
    check('topic').isLength({min: 1, max: 20}).withMessage('Must be between 1-20 characters'),
    check('content').notEmpty().withMessage('Cannot be left empty')], function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        else {

            let params = [req.body.title, req.body.content, req.body.topic, req.body.username]

            // Call the standard procedure which inserts these values into the database (or returns an error if unsuccessful)

            let sqlquery = `CALL sp_edit_article('` + params[0] + `', '` + params[1] + `', '` + params[2] + `', '` + params[3] + `')`
            db.query(sqlquery, params, (err, result) => {
                if(err) {
                    return renderEditArticle(res, req.body, err.message)
                }
                res.send('The article has been successfully edited!')
            })
        }
    })

    app.get('/viewarticles',function(req,res){

        // Uses a view to extract the exact values needed without the clutter

        let sqlquery = `SELECT * FROM view_articles`;

        db.query(sqlquery, (err, result) => {
          if (err) {
             res.redirect('./');
          }

          let data = Object.assign({}, siteData, {articles:result});
          res.render('viewarticles.ejs', data);
        });
    });

    app.get('/clickedarticle', function(req,res){

        // Selects the exact article the user clicked on

        let sqlquery = `SELECT * FROM view_articles WHERE article_title = '` + req.query.keyword + `'`;

        db.query(sqlquery, (err, result) => {
            if(err) {
                res.redirect('./');
            }

            let data = Object.assign({}, siteData, {articles:result});
            res.render('clickedarticle.ejs', data);
        })
    })

    app.get('/listusers',function(req,res){

        // Selects all users to be displayed with a "forEach" function on the page

        let sqlquery = `SELECT * FROM users`
                 
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }

            let data = Object.assign({}, siteData, {users:result});
            res.render('listusers.ejs', data);
        });                        
    });

    app.get('/clickeduser',function(req,res){

        // Selects a specific user based on the username clicked

        let sqlquery = `SELECT * FROM clicked_user WHERE username = '` + req.query.keyword + `'`
                 
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }

            let data = Object.assign({}, siteData, {users:result});
            res.render('clickeduser.ejs', data);
        });                        
    });

    app.get('/addcomment', redirectLogin, function(req, res){

        let initialvalues = {username: req.session.userId, content: '', article_title: req.query.keyword}

        return renderAddNewComment(res, initialvalues, "")
    });

    function renderAddNewComment(res, initialvalues, errormessage) {
        let data = Object.assign({}, siteData, initialvalues, {errormessage:errormessage});
        res.render("addcomment.ejs", data);
        return
    }

    app.post('/commentadded', [check('content').notEmpty().withMessage('Cannot be left empty')], function(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        else {
            let params = [req.body.content, req.body.username, req.body.article_title]

            // Call the standard procedure which inserts these values into the database (or returns an error if unsuccessful)

            let sqlquery = `CALL sp_insert_comment('` + params[0] + `', '` + params[1] + `', '` + params[2] + `')`
            db.query(sqlquery, params, (err, result) => {
                if(err) {
                    return renderAddNewComment(res, req.body, err.message)
                }
                res.send('Your comment has been added to the post')
            })
        }
    })

    app.get('/viewcomments', function(req, res) {

        // Select all comments that belong to the speciic article

        let sqlquery = `SELECT * FROM view_comments WHERE article_title = '` + req.query.keyword + `'`
        db.query(sqlquery, (err, result) => {
            if(err) {
                res.redirect('./');
            }
            let data = Object.assign({}, siteData, {articles:result});
            res.render('viewcomments.ejs', data)
        })
    })

    app.get('/questions', function(req, res) {
        res.render('questions.ejs', siteData)
    });

    app.get('/questionselected', function(req, res) {

        // Obtains the "category" and "difficulty" value chosen by the user

        let initialvalues = {category: req.query.category, difficulty: req.query.difficulty};
        let data = Object.assign({}, siteData, initialvalues);

        // Defines the request module which is used to call the API

        const request = require('request');

        // Parse the values into the api URL to generate questions based on what the user chose
          
        let theCategory = data.category;
        let theDifficulty = data.difficulty;
        let url = `https://opentdb.com/api.php?amount=1&category=${theCategory}&difficulty=${theDifficulty}&type=multiple`
                     
        request(url, function (err, response, body) {

            // Error handling

          if(err){
            console.log('error:', err);
          } else {
            var content = JSON.parse(body)
            if(content !== undefined && content.results !== undefined ){
                correctAnswer = '';
                var theQuestion = content.results[0].question;
                correctAnswer += content.results[0].correct_answer;
                var Answers = [correctAnswer, content.results[0].incorrect_answers[0], content.results[0].incorrect_answers[1], content.results[0].incorrect_answers[2]];

                // Randomise the position of the correct answer so it isn't immediately obvious to the user

                function shuffleArray(array) {
                    for (var i = array.length - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        var temp = array[i];
                        array[i] = array[j];
                        array[j] = temp;
                    }
                }

                shuffleArray(Answers);

                let data = Object.assign({}, siteData, {thequestion: theQuestion, correctanswer: correctAnswer, answers: Answers});
                res.render('questionselected.ejs', data)
            }
            else {
                res.send("Error! No data found!")
            }
          } 
        });
    })

    app.post('/questionanswered', function (req, res) {

        // Checks if the answer is correct and gives feedback accordingly

        if(req.body.answers == correctAnswer) {
            res.send("Correct!")
        }
        else {
            res.send("Incorrect! The correct answer was: " + correctAnswer)
        }
    })

    app.get('/api', function (req,res) {

        // Calls our own API

        // If a keyword is given, only the article with that title will be selected

        // If not, all articles are selected

        let sqlquery = '';

        const theKeyword = req.query.keyword;

        if(theKeyword == undefined) {
            sqlquery = "SELECT username, article_title, article_date, topic_title, article_content FROM view_articles";
        }

        else {
            sqlquery = "SELECT username, article_title, article_date, topic_title, article_content FROM view_articles WHERE article_title = '" + theKeyword + "'";
        }

        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }

            res.json(result); 
        });
    });


    app.get('/register', function (req,res) {
        res.render('register.ejs', siteData);                                                                     
    });

    // Ensure each field is a specific length to minimize chance of errors

    app.post('/registered', [check('username').isLength({min: 3, max: 20}).withMessage('Must between 3-20 characters long'), 
    check('password').isLength({min: 8, max: 20}).withMessage('Must between 8-20 characters long')], function (req,res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Obfuscate the password for security

        else {
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const plainPassword = req.body.password;

            // Sanitise the username to remove potentially malicious scripts

            req.body.username = req.sanitize(req.body.username);

            bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {

                let sqlquery = "INSERT INTO users (username, hashedPassword) VALUES (?,?)";

                let newrecord = [req.body.username, hashedPassword];
                db.query(sqlquery, newrecord, (err, result) => {
                    if(err) {
                        return console.error(err.message);
                    }
                    else
                    result = 'Hello ' + req.body.username + ' you are now registered!';
                    res.send(result);

                })
                
            })
        }                                                                            
    });

    app.get('/login', function (req,res) {
        res.render('login.ejs', siteData);                                                                     
    }); 

    app.post('/loggedin', function(req, res) {

        // Call the encryption function again to deobfuscate the password

        const bcrypt = require('bcrypt');

        // Sanitise the username field again

        req.body.username = req.sanitize(req.body.username);
        
        let sqlquery = "SELECT hashedPassword FROM users WHERE username = '" + req.body.username + "'"
        db.query(sqlquery, (err, result) => {
            if(err) {
                res.redirect('./')
            }
            let newData = Object.assign({}, siteData, {users:result});
            if(newData.users.length == 0) {
                res.send("Username does not exist!")
            }
            else{
                const theJSON = JSON.stringify(result);
                const theJSON1 = JSON.parse(theJSON);
                hashedPassword = theJSON1[0].hashedPassword;
                bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
                    if (err) {
                        res.send(err.message);
                    }
                    else if(result == true) {
                        
                        req.session.userId = req.body.username;
                        res.send("Successfully logged in!")
                    }
                    else {
                        res.send("Wrong password!")
                    }
                })
            }
        })
    })

    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
    })
}