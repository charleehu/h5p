var express = require('express');
var multer = require('multer');
//var upload = require('jquery-file-upload-middleware');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')

var routes = require('./routes/index');

var app = express();

require('string.prototype.endswith');

//upload.configure({
//        uploadDir: __dirname + '/public',
//        uploadUrl: '/uploads',
//        imageVersions: {
//            thumbnail: {
//                width: 80,
//                height: 80
//            }
//        }
//    });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'tmp')
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  }),
  limits: {
    fileSize: 1024 * 1024 * 10 //10M
  },
  fileFilter: function(req, file, cb) {
    cb(new Error('上传文件必须为zip'), file.originalname.endsWith('zip'));
  }
}).single('apptar'));

app.use('/', routes);
//app.use('/upload', upload.fileHandler());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
