const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(bodyParser.json());

app.listen(port, function() {
  console.log('Listening on port ' + port);
});

app.get('/', function(req, res) {
  let indexHtml = fs.readFileSync('./public/index.html', 'utf8');
  res.status(200);
  res.send(indexHtml);
});


// API
let todos = [];


// Helpers
let generateId = (function() {
  let count = 0;
  return function() {
    count += 1;
    return String(count);
  }
})();

if (!Array.prototype.first) {
  Array.prototype.first = function() {
    return this[0];
  }
}

function getTodo(id) {
  let todo = todos.filter(todo => todo.id === id).first();
  return todo;
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

function buildNewTodo(data) {
  let todo = {
    id: generateId(),
    title: data.title,
    day: data.day || '',
    month: data.month || '',
    year: data.year || '',
    completed: false,
    description: data.description || '',
  };
  return todo;
}

function updateTodo(id, data) {
  let todo = getTodo(id);
  Object.getOwnPropertyNames(data).forEach(property => {
    todo[property] = data[property];
  });
}

function deleteTodo(id) {
  let todo = getTodo(id);
  let index = todos.indexOf(todo);
  todos.splice(index, 1);
}


// Routing
app.get('/api/todos', function(req, res) {
  res.status(200);
  res.json(todos);
});

app.post('/api/todos', function(req, res) {
  if (isValidNewTodo(req.body)) {
    let todo = buildNewTodo(req.body);
    todos.push(todo);
    res.status(201);
    res.json(todo);
  } else {
    res.status(400);
    res.send('Todo cannot be saved.');
  }
});

app.put('/api/todos/:id', function(req, res) {
  let id = req.params.id;
  if (getTodo(id)) {
    if (isValidUpdatedTodo(req.body)) {
      updateTodo(id, req.body);
      let todo = getTodo(id);
      res.status(200);
      res.json(todo);
    } else {
      res.status(400);
      res.send('Todo cannot be saved.');
    }
  } else {
    res.status(404);
    res.send('The todo could not be found.');
  }
});

app.delete('/api/todos/:id', function(req, res) {
  let id = req.params.id;
  if (getTodo(id)) {
    deleteTodo(id);
    res.sendStatus(204);
  } else {
    res.status(404);
    res.send('The todo could not be found.');
  }
});