const path = require('path'),
      fs = require('fs'),
      port = process.env.PORT || 3000;

const express = require('express'),
      bodyParser = require('body-parser'),
      favicon = require('serve-favicon'),
      multer = require('multer'),
      mongoose = require('mongoose'),
      session = require('express-session'),
      MongoStore = require('connect-mongo')(session),
      app = express();

const upload = multer({dest: "./uploads"}),
      config = require('./config/config.json'),
      routes = require('./router/index');




// CREATE LOGGER
app.use((req, res, next) => {
  var now = new Date().toString();

  var log = `${now}: ${req.method} ${req.url}`;
  fs.appendFile('server.log', log + '\n', (err) => {
    if (err) {
      console.log('Unable to append to server.log');
    }
  });
   next();
});

mongoose.Promise = global.Promise;
// MongoDB Connection
mongoose.connect(config.production.MONGODB_URI, (err) => {
  if (err) return console.log("Error database");
  console.log("Database Connected Ok!!!");
});

const conn = mongoose.connection;
var gfs;
const Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

// mongo error
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once("open", () => {
  gfs = Grid(conn.db);
  app.get('/', (req, res) => {
    res.render('home');
  });
});


// MIDDLEWARE
// * use for tracking pages
app.use(session({
  secret: "this can be whatever here",
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: conn
  })
}));


/// make user ID available in templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId;
  next();
});


// parse incoming requests
app.use(favicon(path.join(__dirname, 'public', 'images/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// serve static files from /public
app.use(express.static(__dirname + '/public'));


// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');


// include routes
app.use('/', routes);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});


// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// listen on port 3000
app.listen(port,  () => {
  console.log('Express app listening on port 3000');
});
