var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');

// get login
router.get('/login', mid.loggedOut, function(req, res, next){
  return res.render('login', { title: 'Log In'});
});

router.get('/logout', function(req, res, next){
  if (req.session) {
    // delete session
    req.session.destroy(function(err){
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});
// post login
router.post('/login', function(req, res, next){
  // if (req.body.email && req.body.password) {
  //   User.authenticate(req.body.email, req.body.password, function(error, user){
  //     if (error){
  //       var err= new Error('Wrong email or password.');
  //       err.status = 401; // authorized
  //       return next(err);
  //     } else {
  //       req.session.userId = user._id;
  //       return res.redirect('/profile');
  //     }
  //   });
  // } else {
  //   var err= new Error('All Fields are required.');
  //   err.status = 401; // authorized
  //   return next(err);
  // }
});

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', mid.requiresLogin, function(req, res, next) {
  return res.render('about', { title: 'About' });
});


// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

// get /register
router.get('/register', mid.loggedOut, function(req, res, next){
  return res.render('register', { title: 'Sign Up'});
});

router.get('/profile', function(req, res, next){
  // if (!req.session.userId) {
  //   var err= new Error('No Access.Please login.');
  //   err.status = 401;
  //   return next(err);
  // } else {
  //   User.findById(req.session.userId).exec(function(error, user){
  //     return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook});
  //   });
  // }
  // passport returns a user object in the request so
  if(req.user) {
    res.render('profile', {title: 'Profile', user: req.user});
  } else {
    res.redirect('/login');
  }
});

// post /register
router.post('/register', function(req, res, next){
  if (req.body.email && req.body.name && req.body.favoriteBook
    && req.body.password && req.body.confirmPassword) {
    console.log(req.body.email);
    console.log(req.body.name);

    // create an object with form input
    // this object represents the doc we want to insert to mongo
    var userData = {
      email: req.body.email,
      name: req.body.name,
      favoriteBook: req.body.favoriteBook,
      password: req.body.password
    };

    // insert doc into mongo
    User.create(userData, function(error, user){
      if (error){
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });


  } else {
    var err= new Error('All Fields are required.');
    err.status = 404;
    return next(err);
  }
});

module.exports = router;
