require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const repo = require('./database');

const port = process.env.PORT;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// ROUTES
app.get('/', function(req, res) {
  if (req.isAuthenticated()) {
    res.status(200);
    res.sendFile('./public/views/index.html', { root: __dirname });
  } else {
    res.redirect('/login');
  }
});

app.get('/login', function(req, res) {
  res.status(200);
  res.sendFile('./public/views/login.html', { root: __dirname });
});

app.post('/login', function(req, res, next) {

});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login');
});

app.post('/api/createUser', function(req, res, next) {
  let user = req.body;
  repo.addUser(user)
      .then((newUser) => {
        req.login(newUser, function(err) {
          if (err) { return next(err); }
          return res.redirect('/');
        });
      })
      .catch(handleError);
});

app.get('/api/username', function(req, res) {
  res.send(req.user.username);
});

app.get('/api/todos', function(req, res) {
  repo.getTodosForUser(req.user.username)
      .then(data => {
        res.status(200);
        res.json(data);
      })
      .catch(handleError);
});

app.post('/api/todos', function(req, res) {
  if (isValidNewTodo(req.body)) {
    let todo = buildTodo(req.body);
    repo.addTodo(req.user.id, todo)
        .then((result) => {
          res.status(201);
          res.json(result);
        })
        .catch(handleError);
  } else {
    res.status(400);
    res.send('Todo cannot be saved.');
  }
});

app.put('/api/todos/:id', function(req, res) {
  let id = req.params.id;
  let todoData = req.body;
  let todoStatus = todoData.completed;
  repo.getTodoById(id)
      .then(result => {
        if (result[0]) {
          let originalTodoStatus = result[0].completed;
          if (isValidUpdatedTodo(todoData)) {
            if (todoStatus === undefined) {
              todoData.completed = originalTodoStatus;
            }
            repo.updateTodo(id, todoData)
                .then(() => {
                  repo.getTodoById(id)
                      .then(result => {
                        let todo = result[0];
                        res.status(200);
                        res.json(todo);
                      })
                      .catch(handleError);
                })
                .catch(handleError);
          } else {
            res.status(400);
            res.send('Todo cannot be saved.');
          }
        } else {
          res.status(404);
          res.send('The todo could not be found.');
        }
      })
      .catch(handleError);
});

app.delete('/api/todos/:id', function(req, res) {
  let id = req.params.id;
  repo.getTodoById(id)
      .then(result => {
        if (result[0]) {
          repo.deleteTodo(id)
              .then(() => res.sendStatus(204))
              .catch(handleError);
        } else {
          res.status(404);
          res.send('The todo could not be found.');
        }
      })
      .catch(handleError);
});