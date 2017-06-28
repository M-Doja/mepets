const express = require('express'),
      router = express.Router(),
      User = require('../models/user'),
      Pet = require('../models/pets'),
      mid = require('../middleware');

// -------------------------------------
// PAGE NAVIGATION ROUTES
// -------------------------------------

// GET /
router.get('/', (req, res, next) => {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', (req, res, next) => {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', (req, res, next) => {
  return res.render('contact', { title: 'Contact' });
});

// GET /login
router.get('/login', mid.loggedOut, (req, res, next) => {
  return res.render('login', { title: 'Log In'});
});

// GET /settings
router.get('/settings', mid.requiresLogin, function(req, res, next) {
  return res.render('settings', { title: 'Main Settings'});
})

// GET /settings
router.get('/add', mid.requiresLogin, function(req, res, next) {
  return res.render('addPet', { title: 'Add A Pet'});
})

// -------------------------------------
// USER ROUTES
// -------------------------------------

// GET /profile
router.get('/profile', mid.requiresLogin, function(req, res, next) {
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBeer, type: user.beerType });
        }
      });
});

// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});


// POST /login
router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      }  else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});

// GET /register
router.get('/register', mid.loggedOut, function(req, res, next) {
  return res.render('register', { title: 'Sign Up' });
});

// POST /register
router.post('/register', function(req, res, next) {
  if (
    req.body.email &&
    req.body.name &&
    req.body.password &&
    req.body.confirmPassword
  ) {

      // confirm that user typed same password twice
      if (req.body.password !== req.body.confirmPassword) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        return next(err);
      }

      // create object with form input
      var userData = {
        email: req.body.email,
        name: req.body.name,
        password: req.body.password
      };

      // use schema's `create` method to insert document into Mongo
      User.create(userData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          req.session.userId = user._id;
          return res.redirect('/profile');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});

router.post('/', mid.requiresLogin,(req, res, next) => {
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          var pet = new Pet({
            name: req.body.name,
            breed: req.body.breed,
            age: req.body.age,
            owner: req.session.userId
          });

          user.pets.push(pet);
          user.save().then((doc) => {
            // console.log(doc);
          });

          pet.save().then((pet) => {
            res.send(pet);
          }, (err) => {
            res.status(400).send(err);
          });
        }
      });
      return res.render('profile');
      next();
});

router.get('/', mid.requiresLogin, (req, res, next) => {
  Pet.find({}, (err, result) => {
    if (err) {
      return next(err);
    }else {
    
      console.log("result+===== "+result.name);
    }

  })
  next();
});

module.exports = router;
