const fs = require('fs');

module.exports = {
  addUser: fs.readFileSync('./sql/queries/addUser.sql', 'utf8'),
  addTodo: fs.readFileSync('./sql/queries/addTodo.sql', 'utf8'),
  getTodosForUser: fs.readFileSync('./sql/queries/getTodosForUser.sql', 'utf8'),
  updateTodo: fs.readFileSync('./sql/queries/updateTodo.sql', 'utf8'),
}