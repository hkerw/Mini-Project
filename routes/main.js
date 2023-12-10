module.exports = function(app, siteData) {
    var correctAnswer = '';

    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
          res.redirect('./login')
        } else { next (); }
    }

    const { check, validationResult } = require('express-validator');

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
        let initialvalues = {username: req.session.userId , topic: '', title: '', content: ''}

        return renderAddNewArticle(res, initialvalues, "") 
    });

    function renderAddNewArticle(res, initialvalues, errormessage) {
        let data = Object.assign({}, siteData, initialvalues, {errormessage:errormessage});
        res.render("writearticle.ejs", data);
        return
    }

    app.post('/articleadded', [check('title').notEmpty().withMessage('Cannot be left empty'), 
    check('topic').notEmpty().withMessage('Cannot be left empty'),
    check('content').notEmpty().withMessage('Cannot be left empty')], function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        else {

            let params = [req.body.title, req.body.content, req.body.topic, req.body.username]

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
        let initialvalues = {username: req.session.userId, topic: req.query.topic, title: req.query.title, content: req.query.content}

        return renderEditArticle(res, initialvalues, "") 
    });

    function renderEditArticle(res, initialvalues, errormessage) {
        let data = Object.assign({}, siteData, initialvalues, {errormessage:errormessage});
        res.render("editarticle.ejs", data);
        return
    }

    app.post('/articleedited', [check('title').notEmpty().withMessage('Cannot be left empty'), 
    check('topic').notEmpty().withMessage('Cannot be left empty'),
    check('content').notEmpty().withMessage('Cannot be left empty')], function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        else {

            let params = [req.body.title, req.body.content, req.body.topic, req.body.username]

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
        let initialvalues = {category: req.query.category, difficulty: req.query.difficulty};
        let data = Object.assign({}, siteData, initialvalues);

        const request = require('request');
          
        let theCategory = data.category;
        let theDifficulty = data.difficulty;
        let url = `https://opentdb.com/api.php?amount=1&category=${theCategory}&difficulty=${theDifficulty}&type=multiple`
                     
        request(url, function (err, response, body) {
          if(err){
            console.log('error:', error);
          } else {
            var content = JSON.parse(body)
            if(content !== undefined && content.results !== undefined){
                var theQuestion = content.results[0].question;
                correctAnswer += content.results[0].correct_answer;
                var Answers = [correctAnswer, content.results[0].incorrect_answers[0], content.results[0].incorrect_answers[1], content.results[0].incorrect_answers[2]];

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
        if(req.body.answers == correctAnswer) {
            res.send("Correct!")
        }
        else {
            res.send("Incorrect! The correct answer was: " + correctAnswer)
        }
    })

    app.get('/register', function (req,res) {
        res.render('register.ejs', siteData);                                                                     
    });

    app.post('/registered', [check('username').isLength({min: 3, max: 20}).withMessage('Must between 3-20 characters long'), 
    check('password').isLength({min: 8, max: 20}).withMessage('Must between 8-20 characters long')], function (req,res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        else {
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const plainPassword = req.body.password;
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
        const bcrypt = require('bcrypt');
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