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
}