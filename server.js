require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { User, Todo } = require('./database');
const Auth = require('./authService');
const port = process.env.PORT;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(Auth.init);

const sessionOptions = {
  genid: (req) => {
    return uuidv4();
  },
  store: new FileStore(),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
};
app.use(session(sessionOptions));

app.listen(port, function() {
  console.log('Listening on port ' + port);
});

function handleError(error) {
  console.error(error);
}

function isValidNewTodo(data) {
  if (
    (!data.title || data.title.length < 3) ||
    (data.day && data.day.length !== 2) ||
    (data.month && data.month.length !== 2) ||
    (data.year && data.year.length !== 4)
  ) {
    return false;
  }
  return true;
}

function isValidUpdatedTodo(data) {
  if (
    (data.title && data.title.length < 3) ||
    (data.day && data.day.length !== 2) ||
    (data.month && data.month.length !== 2) ||
    (data.year && data.year.length !== 4)
  ) {
    return false;
  }
  return true;
}

function buildTodo(data) {
  let todo = {
    title: data.title,
    day: data.day || '',
    month: data.month || '',
    year: data.year || '',
    completed: false,
    description: data.description || '',
  };
  return todo;
}

function userAlreadyExists(err) {
  let regex = /Key \(username\)=\(.+\) already exists./;
  return regex.test(err.detail);
}

// ROUTES
app.get('/', Auth.guard, function(req, res) {
  console.log('sending file - within root GET route handler');
  res.status(200);
  res.sendFile('./public/views/index.html', { root: __dirname });
});

app.get('/login', Auth.allow, function(req, res) {
  console.log('sending file - within login GET route handler');
  res.status(200);
  res.sendFile('./public/views/login.html', { root: __dirname });
});

app.post('/login', Auth.authorize, function(req, res) {
  console.log('sending status 200 - within login POST route handler');
  res.sendStatus(200);
});

app.get('/logout', function(req, res) {
  req.logout();
  console.log('redirecting to login from logout GET route handler');
  res.redirect('/login');
});

app.get('/create_user', Auth.allow, function(req, res) {
  console.log('sending file - within create_user GET route handler');
  res.status(200);
  res.sendFile('./public/views/createUser.html', { root: __dirname });
});

app.post('/create_user', function(req, res, next) {
  let user = req.body;
  Auth.generateHash(user.password, function(err, hash) {
    if (err) { handleError(err); }
    user.password = hash;
    console.log('user after generating hash');
    console.log(user);

    User.addUser(user)
        .then((newUser) => {
          req.login(newUser);
          console.log('new user logged in - within create_user POST route handler');
          res.sendStatus(200);
        })
        .catch((err) => {
          if (userAlreadyExists(err)) {
            console.log('user already exists - within create_user POST route handler');
            res.status(400).send('User already exists.');
          } else {
            handleError(err);
          }
        });
  });
});

app.get('/api/username', function(req, res) {
  if (req.session.user) {
    console.log('sending username - within api/username GET route handler');
    res.send(req.session.user.username);
  } else {
    console.log('sending 404 - within api/username GET route handler');
    res.sendStatus(404);
  }
});

app.get('/api/todos', function(req, res) {
  Todo.getTodosForUser(req.session.user.username)
      .then(data => {
        res.status(200);
        res.json(data);
      })
      .catch(handleError);
});

app.post('/api/todos', function(req, res) {
  if (isValidNewTodo(req.body)) {
    let todo = buildTodo(req.body);
    Todo.addTodo(req.session.user.id, todo)
        .then((result) => {
          res.status(201);
          res.json(result);
        })
        .catch(handleError);
  } else {
    console.log('todo cannot be saved - within api/todos POST route handler');
    res.status(400);
    res.send('Todo cannot be saved.');
  }
});

app.put('/api/todos/:id', function(req, res) {
  let id = req.params.id;
  let todoData = req.body;
  let todoStatus = todoData.completed;
  Todo.getTodoById(id)
      .then(result => {
        if (result[0]) {
          let originalTodoStatus = result[0].completed;
          if (isValidUpdatedTodo(todoData)) {
            if (todoStatus === undefined) {
              todoData.completed = originalTodoStatus;
            }
            Todo.updateTodo(id, todoData)
                .then(() => {
                  Todo.getTodoById(id)
                      .then(result => {
                        let todo = result[0];
                        res.status(200);
                        res.json(todo);
                      })
                      .catch(handleError);
                })
                .catch(handleError);
          } else {
            console.log('todo cannot be saved - within api/todos/:id PUT route handler');
            res.status(400);
            res.send('Todo cannot be saved.');
          }
        } else {
          console.log('todo could not be found - within api/todos/:id PUT route handler');
          res.status(404);
          res.send('The todo could not be found.');
        }
      })
      .catch(handleError);
});

app.delete('/api/todos/:id', function(req, res) {
  let id = req.params.id;
  Todo.getTodoById(id)
      .then(result => {
        if (result[0]) {
          Todo.deleteTodo(id)
              .then(() => {
                console.log('confirmation of delete - within api/todos/:id DELETE route handler');
                res.sendStatus(204)
              })
              .catch(handleError);
        } else {
          console.log('todo could not be found - within api/todos/:id DELETE route handler');
          res.status(404);
          res.send('The todo could not be found.');
        }
      })
      .catch(handleError);
});