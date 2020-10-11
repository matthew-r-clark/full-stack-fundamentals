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
app.use((req, res, next) => {  // added only to display in iframe
  res.removeHeader('X-Frame-Options');
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

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
app.get('/', function(req, res) {
  res.status(200);
  res.sendFile('./public/views/index.html', { root: __dirname });
});

app.post('/login', Auth.authorize, function(req, res) {
  res.sendStatus(200);
});

app.post('/create_user', async function(req, res, next) {
  let user = req.body;
  user.password = await Auth.generateHash(user.password);

  try {
    let newUser = await User.addUser(user);
    req.login(newUser);
    res.sendStatus(200);
  } catch(err) {
    if (userAlreadyExists(err)) {
      res.status(400).send('User already exists.');
    } else {
      handleError(err);
    }
  }
});

app.post('/logout', function(req, res) {
  if (req.isAuthorized) {
    req.logout();
    res.status(202).send('You have been logged out.');
  } else {
    res.sendStatus(401);
  }
});

app.use(Auth.guard);

app.get('/api/username', function(req, res) {
  let user = req.session.user;
  if (user) {
    res.send(user.username);
  } else {
    res.sendStatus(404);
  }
});

app.get('/api/todos', async function(req, res) {
  let username = req.session.user.username;
  let todos = await Todo.getTodosForUser(username);
  res.status(200);
  res.json(todos);
});

app.post('/api/todos', async function(req, res) {
  if (isValidNewTodo(req.body)) {
    let todoData = buildTodo(req.body);
    let userId = req.session.user.id;
    let newTodo = await Todo.addTodo(userId, todoData);
    res.status(201);
    res.json(newTodo);
  } else {
    res.status(400).send('Todo cannot be saved.');
  }
});

app.put('/api/todos/:id', async function(req, res) {
  let id = req.params.id;
  let newTodoData = req.body;

  let originalTodo = await Todo.getTodoById(id);
  if (originalTodo) {
    if (isValidUpdatedTodo(newTodoData)) {
      if (newTodoData.completed === undefined) {
        newTodoData.completed = originalTodo.completed;
      }
      await Todo.updateTodo(id, newTodoData);
      let updatedTodo = await Todo.getTodoById(id);
      res.status(200);
      res.json(updatedTodo);
    } else {
      res.status(400);
      res.send('Todo cannot be saved.');
    }
  } else {
    res.status(404);
    res.send('The todo could not be found.');
  }
});

app.delete('/api/todos/:id', async function(req, res) {
  let id = req.params.id;

  let todo = await Todo.getTodoById(id);
  if (todo) {
    await Todo.deleteTodo(id);
    res.sendStatus(204);
  } else {
    res.status(404);
    res.send('The todo could not be found.');
  }
});