const express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  const shittyExamples = ['Brainfuck', 'LOLCODE', 'Malbolge', 'Shakespeare', 'Whitespace', 'JSFuck'];

  const searchQuery = req.query.q;
  if (searchQuery && searchQuery !== "")
    return res.redirect('/search?q='+searchQuery); // pass query to search route
  else
    return res.render('index', {
      title: 'Napi',
      langExample: shittyExamples[Math.floor(Math.random()*shittyExamples.length)] // random language placeholder
    });
});

module.exports = router;
