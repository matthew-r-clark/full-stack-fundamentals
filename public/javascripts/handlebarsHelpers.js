HandlebarsTemplates = {
  todoForm: function(todo) {
    let $formContainer = $('#todo-form-container');
    if (todo) {
      let editFormTemplate = Handlebars.compile($('#edit-todo-template').html());
      $formContainer.html(editFormTemplate(todo));
    } else {
      let addFormTemplate = Handlebars.compile($('#add-todo-template').html());
      $formContainer.html(addFormTemplate());
    }
    $('#form-title').focus();
  },
  loginForm: function() {
    let loginFormTemplate = Handlebars.compile($('#login-template').html());
    $('#login-form-container').html(loginFormTemplate());
    $('#username-field').focus();
  },
  createUserForm: function() {
    let createUserFormTemplate = Handlebars.compile($('#create-user-template').html());
    $('#login-form-container').html(createUserFormTemplate());
    $('#username-field').focus();
  },
}

HandlebarsHelpers = {
  register: function() {
    this.date();
    this.todoItem();
    this.formFields();
  },
  date: function() {
    Handlebars.registerHelper("date", function() {
      return TodoManager.prototype.getDueMonthForTodo(this);
    });
  },
  todoItem: function() {
    Handlebars.registerHelper("todoItem", function() {
      let todoItemTemplate = Handlebars.compile($('#todo-item-template').html());
      let html = todoItemTemplate(this);
      return html;
    });
  },
  formFields: function() {
    Handlebars.registerHelper("formFields", function() {
      let formFieldsTemplate = Handlebars.compile($('#form-fields-template').html());
      let html = formFieldsTemplate(this);
      return html;
    });
  },
};