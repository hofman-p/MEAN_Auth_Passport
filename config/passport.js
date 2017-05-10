const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const db = require('./database');
var User = require('../app/models/User');

module.exports = function(passport) {
  var opts = {};
  opts.secretOrKey = db.secret;
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.id}, function(err, user) {
      if (err) {
        return done(err, false); // no user
      }
      if (user) {
        done(null, user); // found a user
      }
      else {
        done(null, false); // found user but problem
      }
    }); // User.findOne
  })); // passport.use
};
