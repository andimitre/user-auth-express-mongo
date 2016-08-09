var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var routes = require('./routes/index');
var auth = require('./routes/auth');

//congirue github Strategy
// use, uses the strategies
passport.use(new GitHubStrategy({
  clientID: "",
  clientSecret: "",
  callbackURL: 'http://localhost:3000/auth/github/return'
}, function(accessToken, refreshToken, profile, done){
  if(profile.emails[0]){
    User.findOneAndUpdate({
      email: profile.emails[0].value
    }, {
      name: profile.displayName || profile.username,
      email: profile.emails[0].value,
      photo: profile.photos[0].value
    }, {
      upsert: true
    }, done);
  } else {
    var noEmailError = new Error('No Email available.');
    done(noEmailError, null);
  }
}));
// translate data structure for storage
passport.serializeUser(function(user, done){
  done(null, user._id);
});
// reconstruct stored data
passport.deserializeUser(function(userId, done){
  // the value is the user id
  User.findById(userId,done);
});
var app = express();


// use sessions for tracking logins

// mongodb connection
mongoose.connect("mongodb://localhost:27017/test");
var db = mongoose.connection;
// mongo error
db.on('error', console.error.bind(console, 'connection error'));
// session for express session
// app.use(session({
//   //the secret is used to sign the cookie, to ensure that only this application created the cookie
//   secret: 'daddy',
//   resave: true,
//   saveUninitialized: false,
//   store: new MongoStore({
//     mongooseConnection: db
//   })
// }));

// set up for passport
var sessionOptions = {
  secret: " this is super secret ",
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: db
  })
}

app.use(session(sessionOptions));
// initialize passport
app.use(passport.initialize());
// restore session
app.use(passport.session());




// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// include routes

app.use('/', routes);
app.use('/auth', auth);

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});
