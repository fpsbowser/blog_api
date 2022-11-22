var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render("index", { title: "blog_api" });
  res.json({
    message:
      'Welcome to blog_api! This is a RESTful API created for a mock blog following theodinproject curriculum.',
  });
});

module.exports = router;
