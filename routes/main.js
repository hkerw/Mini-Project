module.exports = function(app, siteData) {

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

        console.log(req.query)
        let term = '%' + req.query.keyword + '%'
        let sqlquery = `SELECT * FROM search_articles WHERE  article_title LIKE '` + term + `' OR topic_title LIKE '` + term + `' OR article_content LIKE '` + term + `'`

        db.query(sqlquery, [term, term], (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let data = Object.assign({}, siteData, {articles:result});
            console.log(data)
            res.render('viewarticles.ejs', data)
        });
    });

    app.get('/writearticle',function(req,res){
        let initialvalues = {username: '', topic: '', title: '', content: ''}

        return renderAddNewArticle(res, initialvalues, "") 
    });

    function renderAddNewArticle(res, initialvalues, errormessage) {
        let data = Object.assign({}, siteData, initialvalues, {errormessage:errormessage});
        console.log(data)
        res.render("writearticle.ejs", data);
        return
    }

    app.post('/articleadded', function (req, res) {
        let params = [req.body.title, req.body.content, req.body.topic, req.body.username]

        let sqlquery = `CALL sp_insert_article('` + params[0] + `', '` + params[1] + `', '` + params[2] + `', '` + params[3] + `')`
        db.query(sqlquery, params, (err, result) => {
            if(err) {
                return renderAddNewArticle(res, req.body, err.message)
            }
            res.send('Your article has been successfully posted!')
        })
    })

    app.get('/editarticle',function(req,res){
        let initialvalues = {username: req.query.username, topic: req.query.topic, title: req.query.title, content: req.query.content}

        return renderEditArticle(res, initialvalues, "") 
    });

    function renderEditArticle(res, initialvalues, errormessage) {
        let data = Object.assign({}, siteData, initialvalues, {errormessage:errormessage});
        console.log(data)
        res.render("editarticle.ejs", data);
        return
    }

    app.post('/articleedited', function (req, res) {
        let params = [req.body.title, req.body.content, req.body.topic, req.body.username]

        let sqlquery = `CALL sp_edit_article('` + params[0] + `', '` + params[1] + `', '` + params[2] + `', '` + params[3] + `')`
        db.query(sqlquery, params, (err, result) => {
            if(err) {
                return renderEditArticle(res, req.body, err.message)
            }
            res.send('The article has been successfully edited!')
        })
    })

    app.get('/viewarticles',function(req,res){

        let sqlquery = `SELECT * FROM view_articles`;

        db.query(sqlquery, (err, result) => {
          if (err) {
             res.redirect('./');
          }

          let data = Object.assign({}, siteData, {articles:result});
          console.log(data)
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
            console.log(data)
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
            console.log(data)
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
            console.log(data)
            res.render('clickeduser.ejs', data);
        });                        
    });

    app.get('/addcomment', function(req, res){
        let initialvalues = {username: '', content: '', article_title: req.query.keyword}

        return renderAddNewComment(res, initialvalues, "")
    });

    function renderAddNewComment(res, initialvalues, errormessage) {
        let data = Object.assign({}, siteData, initialvalues, {errormessage:errormessage});
        console.log(data)
        res.render("addcomment.ejs", data);
        return
    }

    app.post('/commentadded', function(req, res) {
        let params = [req.body.content, req.body.username, req.body.article_title]
        let sqlquery = `CALL sp_insert_comment('` + params[0] + `', '` + params[1] + `', '` + params[2] + `')`
        db.query(sqlquery, params, (err, result) => {
            if(err) {
                return renderAddNewComment(res, req.body, err.message)
            }
            res.send('Your comment has been added to the post')
        })
    })

    app.get('/viewcomments', function(req, res) {
        let sqlquery = `SELECT * FROM view_comments WHERE article_title = '` + req.query.keyword + `'`
        db.query(sqlquery, (err, result) => {
            if(err) {
                res.redirect('./');
            }
            let data = Object.assign({}, siteData, {articles:result});
            console.log(data)
            res.render('viewcomments.ejs', data)
        })
    })
}