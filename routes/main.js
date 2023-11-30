module.exports = function(app, siteData) {

    // Handle the routes

    app.get('/',function(req,res){
        res.render('index.ejs', siteData)
    });

    app.get('/about',function(req,res){
        res.render('about.ejs', siteData);
    });

    app.get('/search',function(req,res){
        res.render("search.ejs", siteData);
    });
}