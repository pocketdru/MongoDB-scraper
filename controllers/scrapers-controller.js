var express = require("express");

var router = express.Router();

var article = require("../models/index.js");

router.get("/", function (req, res) {
    article.all(function (data) {
        // var bObject = {
        //     burgers: data
        // };
        console.log(bObject);
        res.render("index", data);
    });
});

router.post("/api/burgers", function (req, res) {
    burger.create([
        "burger_name", "devoured"
    ], [
        req.body.burger_name, req.body.devoured
    ], function (result) {
        // Send back the ID of the new quote
        res.json({
            id: result.insertId
        });
    });
});

router.put("/api/burgers/:id", function(req, res){
    var condition = "id = " + req.params.id;

    console.log("condition", condition);

    burger.update({
        devoured: req.body.devoured
    }, condition, function(result) {
        if (result.changedRows == 0) {
            return res.status(404).end();
        } else {
            res.status(200).end();
        }
    });
});

router.delete("/api/burgers/:id", function (req, res) {
    var condition = "id = " + req.params.id;

    burger.delete(condition, function(result){
        if (result.affectedRows == 0) {
            return res.status(400).end();
        } else {
            res.status(200).end();
        }
    });
});

module.exports = router;