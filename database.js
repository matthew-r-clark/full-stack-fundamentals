const initOptions = {
  connect(client, dc, useCount) {
    console.log('\n= Connected to database.');
  },
  disconnect(client, dc) {
    console.log('= Disconnecting from database.\n');
 },
 query(e) {
   console.log('QUERY:', e.query);
 }
};
const pgp = require('pg-promise')(initOptions);
const db = pgp(process.env.DATABASE_URL);
const queries = require('./queries');

module.exports = {
  addUser: function(user) {
    let sql = queries.addUser;
    let params = [user.username, user.password];
    return db.one(sql, params);
  },
  getUserByName: function(username) {
    let sql = 'SELECT * FROM users WHERE username = $1';
    return db.any(sql, username);
  },
  getUserById: function(id) {
    let sql = 'SELECT * FROM users WHERE id = $1';
    return db.any(sql, id);
  },
  addTodo: function(userId, todo) {
    let sql = queries.addTodo;
    let params = [
      userId,
      todo.title,
      todo.day,
      todo.month,
      todo.year,
      todo.description
    ];

    return db.one(sql, params);
  },
  getTodoById: function(id) {
    let sql = 'SELECT * FROM todos WHERE id = $1';
    return db.any(sql, id);
  },
  updateTodo: function(id, data) {
    let sql = queries.updateTodo;
    let params = [
      data.title,
      data.day,
      data.month,
      data.year,
      data.completed,
      data.description,
      id
    ];
    return db.none(sql, params)
  },
  getTodosForUser: function(username) {
    let sql = queries.getTodosForUser;
    return db.any(sql, [username]);
  },
  deleteTodo: function(id) {
    let sql = 'DELETE FROM todos WHERE id = $1';
    return db.none(sql, id);
  },
};