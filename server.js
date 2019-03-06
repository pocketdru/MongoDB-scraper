var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
var app = express();
var PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/unit18Populater";

mongoose.connect(MONGODB_URI);

app.get("/", function (req, res) {

  axios.get("https://www.nytimes.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).find("h2").text();
      result.body = $(element).find("p").text();
      result.link = "https://www.nytimes.com" + $(element).find("a").attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

  });
  db.Article.find({})
    .then(function (dbArticle) {
      res.render("index", {
        dbArticle
      });
      console.log(dbArticle.length);
    })
    .catch(function (err) {
      res.json(err);
    })
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  db.Article.findOne({
      _id: req.params.id
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/saved", function (req, res) {
  db.Saved.find({})
    .then(function (dbSaved) {
      res.json(dbSaved);
    })
});

app.post("/saved", function (req, res) {
  db.Saved.create(req.body)
    .then(function (dbSaved) {
      console.log("keke");
    })
});

app.get("/saved/:id", function (req, res) {
  db.Saved.findOne({
      _id: req.params.id
    })
    .populate("note")
    .then(function (dbSaved) {
      res.json(dbSaved);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.post("/saved/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Saved.findByIdAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      });
    })
});

app.get("/savedView", function (req, res) {
  db.Saved.find({})
    .then(function (dbSaved) {
      res.render("savedView", {
        dbSaved
      });
    })
    .catch(function (err) {
      res.json(err);
    })
});

app.delete("/saved/:id", function (req, res) {
  db.Saved.deleteOne({
    _id: req.params.id
  }).then(function (dbPost) {
    res.json(dbPost);
  });
});

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});

module.exports = app;