"use strict";

const express     = require('express');
const bodyParser  = require('body-parser');
const morgan      = require('morgan');
const mongoose    = require('mongoose');
const passport    = require('passport');
const jwt         = require('jwt-simple');

const config      = require('./config/database')
const port        = process.env.PORT || 8080;

const User        = require('./app/models/User');

const app         = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(passport.initialize());

app.get('/', function(req, res) {
  res.send('HEY ! :) API is at http://localhost:' + port + '/api');
})

mongoose.connect(config.database);
require('./config/passport')(passport);

var apiRoutes = express.Router();

apiRoutes.post('/signup', function(req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({ info: { success: false, code: "4.0.0", msg: 'Provide name & password' }, data: null });
  }
  else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password
    });
    newUser.save(function(err) {
      if (err) {
        return res.json({ info: { success: false, code: "4.0.1", msg: "Username already exists"} , data: null});
      }
      res.json({info: {success: true, code: "2.0.0", msg: "Create new user successful"}, data: {newUser} }); // create user success
    }) // newUser.save
  }
})

apiRoutes.post('/signin', function(req, res) {
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;
    if (!user){
      res.json({info: { success: false, code: "4.0.2", msg: "No user found" }, data: null});
    }
    else {
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch && !err) {
          var token = jwt.encode(user, config.secret);
          res.json({ info: {success: true, code: "2.0.1", msg: "Authentification successful"}, data: {token: 'JWT ' + token, user: user} });
        }
        else {
          res.json({ info: { success: false, code: "4.0.3", msg: "Wrong password"}, data: null});
        }
      })
    }
  })
})

app.use('/api', apiRoutes);

app.listen(port);
console.log('Server started :)');
