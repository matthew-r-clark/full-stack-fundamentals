const { User } = require('./database');
const bcrypt = require('bcrypt');
const saltRounds = Number(process.env.SALT_ROUNDS);

function handleError(error) {
  console.error(error);
}

function Auth() {}

Auth.prototype.init = function(req, res, next) {
  req.isAuthorized = function() {
    return req.session.user && req.session.user.authorized;
  }

  req.login = function(user) {
    console.log(user);
    delete user.password;
    this.session.user = user;
    this.session.user.authorized = true;
  };

  req.logout = function() {
    delete this.session.user;
  }

  next();
}

Auth.prototype.guard = function(req, res, next) {
  if (!req.session.user || !req.session.user.authorized) {
    console.log('redirecting to login from Auth.guard()');
    res.redirect('/login');
  } else {
    next();
  }
}

Auth.prototype.allow = function(req, res, next) {
  if (req.session.user && req.session.user.authorized) {
    console.log('redirecting to root from Auth.allow()');
    res.redirect('/');
  } else {
    next();
  }
}

Auth.prototype.authorize = function(req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  User.getUserByName(username)
      .then(data => {
        let user = data[0];
        if (!user) {
          console.log('user does not exist - within Auth.authorize()');
          res.status(404).send('User does not exist.');
        } else {
          bcrypt.compare(password, user.password, function(err, isValid) {
            if (err) { handleError(err); }
            if (!isValid) {
              console.log('invalid password - within Auth.authorize()');
              res.status(401).send('Invalid password.');
            } else {
              req.login(user);
              next();
            }
          })
        }
      })
      .catch(handleError);
}

Auth.prototype.generateHash = function(password, callback) {
  bcrypt.hash(password, saltRounds, callback);
}

module.exports = new Auth();