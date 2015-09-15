var express = require('express');
var router = express.Router();
var captchapng = require('captchapng');
var bodyParser = require('body-parser')

var Datastore = require('nedb')
  , db = {};
db.users = new Datastore({ filename: 'users.db', autoload: true });
db.apps = new Datastore({ filename: 'apps.db', autoload: true });

var crypto = require('crypto')

var urlencodedParser = bodyParser.urlencoded({ extended: false })

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) { 
  res.render('login', { title: '登录' });
});

router.get('/join', function(req, res, next) {
  res.render('join', { title: '注册' });
});

router.get('/logout', function(req, res, next) {
  req.session.login = false;

  res.render('login', { title: 'Express' });
});

router.post('/login', urlencodedParser, function(req, res, next) {
  //login success
  if (req.session.checkcode != req.body.code) {
    res.render('login', { title: '登录', code: true });
  }
  else {
    var username = req.body.username
    var pwd = req.body.pwd

    db.users.find({username: username}, function(err, docs) {
  
      if (docs.length == 0) {//username is not exist
        res.render('login', { title: '登录', username: true });
      }
      else {
        var user = docs[0]
        var pwdHash = crypto.createHmac('sha1', user.timestamp + '').update(pwd).digest('hex')
        if (user.pwd != pwdHash) {
          res.render('login', { title: '登录', pwd: true });
        }
        else {
          req.session.login = true
          req.session.username = username
          res.redirect('console/list')
        }
      }
    });   
  } 
});

router.post('/join', urlencodedParser, function(req, res, next) {
  var username = req.body.username;
  var pwd1 = req.body.pwd1;
  var pwd2 = req.body.pwd2;

  db.users.count({username: username}, function(err, count){
    if (count > 0) {
      res.render('join', { title: '注册', username: true });
    }
    else {
      if (pwd1 !== pwd2) {
        res.render('join', { title: '注册', pwd1: true, pwd2: true });
      }
      else {
        var timestamp = new Date().getTime()
        var pwdHash = crypto.createHmac('sha1', timestamp + '').update(pwd1).digest('hex')

        db.users.insert({username: username, pwd: pwdHash, timestamp: timestamp}, function(err){
          res.render('join', { title: '注册' });
        })
      }
    }
  });
});

router.get('/console/list', function(req, res, next) {
  if (req.session.login == true) {
    var username = req.session.username;
    db.apps.find({username: username}, function(err, docs) {
        console.log(docs);
      res.render('list', { title: '应用列表', username: req.session.username, apps: docs });
    });
  }
  else {
    res.redirect('/login');
  }
});

router.get('/console/app', function(req, res, next) {
  if (req.session.login == true) {
    var username = req.session.username;
    
    db.apps.find({username: username}, function(err, docs) {
      res.render('app', { title: '应用列表', username: req.session.username, apps: docs });
    });
  }
  else {
    res.redirect('/login');
  }
});

router.get('/console/app/delete', function(req, res, next) {
  if (req.session.login == true) {
    var username = req.session.username;
    var id = req.query.id;
    console.log(id);
    
    db.apps.remove({username: username, _id: id}, function(err, docs) {
      res.redirect('/console/list');
    });
  }
  else {
    res.redirect('/login');
  }
});

router.post('/console/app', function(req, res, next) {
  if (req.session.login == true) {
    var username = req.session.username;
    var appName = req.body.appName;
    db.apps.insert({username: username, appName: appName}, function(err, docs) {
      res.redirect('/console/list');
    });
  }
  else {
    res.redirect('/login');
  }
});

router.get('/checkcode', function(req, res, next) {
  var width = 100;
  var height = 30;

  var code = parseInt(Math.random()*9000+1000);
  req.session.checkcode = code;

  var p = new captchapng(width, height, code);
  p.color(0, 0, 0, 0); 
  p.color(80, 80, 80, 255);

  var img = p.getBase64();
  var imgbase64 = new Buffer(img,'base64');
  res.writeHead(200, {
    'Content-Type': 'image/png'
  });
  res.end(imgbase64);
});

module.exports = router;
