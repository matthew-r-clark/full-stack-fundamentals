const { User } = require('./database');
const bcrypt = require('bcrypt');
const saltRounds = Number(process.env.SALT_ROUNDS);

function validatePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function Auth() {}

Auth.prototype.init = function(req, res, next) {
  req.isAuthorized = function() {
    return req.session.user && req.session.user.authorized;
  }

  req.login = function(user) {
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
    res.status(401).send('You are not logged in.');
  } else {
    next();
  }
}

Auth.prototype.authorize = async function(req, res, next) {
  let username = req.body.username;
  let password = req.body.password;

  let data = await User.getUserByName(username);
  let user = data[0];
  if (!user) {
    res.status(404).send('User does not exist.');
  } else {
    let isValid = await validatePassword(password, user.password);
    if (!isValid) {
      res.status(401).send('Invalid password.');
    } else {
      req.login(user);
      next();
    }
  }
}



Auth.prototype.generateHash = function(password) {
  return bcrypt.hash(password, saltRounds);
}

module.exports = new Auth();