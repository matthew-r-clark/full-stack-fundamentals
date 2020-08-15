const REFRESH_RATE_IN_SECONDS = 60 * 5;

let tempDays = [];
for (let i = 1; i <= 31; i += 1) {
  let name = String(i);
  let value = String(i).padStart(2, '0');
  day = {name: name, value: value};
  tempDays.push(day);
}
const days = tempDays;

const months = [
  {name: 'Jan', value: '01'}, {name: 'Feb', value: '02'}, {name: 'Mar', value: '03'},
  {name: 'Apr', value: '04'}, {name: 'May', value: '05'}, {name: 'Jun', value: '06'},
  {name: 'Jul', value: '07'}, {name: 'Aug', value: '08'}, {name: 'Sep', value: '09'},
  {name: 'Oct', value: '10'}, {name: 'Nov', value: '11'}, {name: 'Dec', value: '12'},
];

let tempYears = ['2020', '2021', '2022', '2023', '2024', '2025'];
tempYears = tempYears.map(function(year) {
  return {name: year, value: year};
});
const years = tempYears;

function serializeFormToJson(form) {
  let formData = new FormData(form);
  let serializedData = {};
  for (let [key, value] of formData.entries()) {
    serializedData[key] = value;
  }
  return serializedData;
}

$(function() {
  const App = {
    todoFlashMessage: '',
    loginFlashMessage: '',

    setUsername: function(username) {
      $('#username').text(username);
    },
    displayTodoModal: function(todo) {
      this.showTodoModal();
      this.buildTodoForm(todo);
    },
    showTodoModal: function() {
      this.setTodoFlashMessage();
      let $modal = $('#todo-modal');
      $modal.fadeIn();
    },
    hideTodoModal: function() {
      this.setTodoFlashMessage();
      let $modal = $('#todo-modal');
      $modal.fadeOut();
      setTimeout(function() {
        $('.todo-form').remove();
      },400);
    },
    buildTodoForm: function(todo) {
      this.generateTodoFormTemplateHtml(todo);
      this.setCompleteButton(todo);
      this.generateDateOptions(todo);
      this.bindTodoModalEventHandlers();
    },
    displayLoginModal: function() {
      this.showLoginModal();
      this.buildLoginForm();
    },
    buildLoginForm: function() {
      this.generateLoginFormTemplateHtml();
      this.bindLoginModalEventHandlers();
      this.displayLoginFlashMessage();
    },
    bindLoginModalEventHandlers: function() {
      $('#login-form').submit(this.handleSubmitLoginRequest.bind(this));
      $('#create-user-link').click(this.handleCreateUserClick.bind(this));
    },
    handleCreateUserClick: function(event) {
      event.preventDefault();
      let username = $('#username-field').val();
      $('.user-form').remove();
      this.buildCreateUserForm();
      if (username) {
        $('#username-field').val(username);
      }
    },
    displayCreateUserModal: function() {
      this.showLoginModal();
      this.buildCreateUserForm();
    },
    buildCreateUserForm: function() {
      this.generateCreateUserFormTemplateHtml();
      this.bindCreateUserModalEventHandlers();
      this.displayLoginFlashMessage();
    },
    displayTodoFlashMessage: function() {
      $('#todo-flash-message').text(this.todoFlashMessage);
      this.todoFlashMessage = '';
    },
    displayLoginFlashMessage: function() {
      $('#login-flash-message').text(this.loginFlashMessage);
      this.loginFlashMessage = '';
    },
    bindCreateUserModalEventHandlers: function() {
      $('#create-form').submit(this.handleSubmitCreateUserRequest.bind(this));
      $('#login-link').click(this.handleExistingAccountClick.bind(this));
    },
    handleExistingAccountClick: function(event) {
      event.preventDefault();
      let username = $('#username-field').val();
      $('.user-form').remove();
      this.buildLoginForm();
      if (username) {
        $('#username-field').val(username);
      }
    },
    showLoginModal: function() {
      let $modal = $('#login-modal');
      $modal.fadeIn();
    },
    hideLoginModal: function() {
      this.setLoginFlashMessage();
      this.reloadPageContent();
      let $modal = $('#login-modal');
      $modal.fadeOut();
      setTimeout(function() {
        $('.user-form').remove();
      },400);
    },
    setCompleteButton: function(todo) {
      let $button = $('#toggle-complete-button');
      if (todo && todo.completed) {
        $button.html('Mark as Incomplete');
      } else {
        $button.html('Mark as Completed');
      }
    },
    generateDateOptions: function(todo) {
      let day, month, year;
      if (todo) {
        day = todo.day;
        month = todo.month;
        year = todo.year;
      }
      
      this.generateDayOptions(day);
      this.generateMonthOptions(month);
      this.generateYearOptions(year);
    },
    generateDayOptions: function(selectedDay) {
      let $dueDay = $('#due-day');
      days.forEach(function(day) {
        let $option = $(document.createElement('option'));
        $option.text(day.name).val(day.value);
        if (selectedDay && selectedDay === day.value) {
          $option.attr('selected', true);
        }
        $dueDay.append($option);
      });
    },
    generateMonthOptions: function(selectedMonth) {
      let $dueMonth = $('#due-month');
      months.forEach(function(month) {
        let $option = $(document.createElement('option'));
        $option.text(month.name).val(month.value);
        if (selectedMonth && selectedMonth === month.value) {
          $option.attr('selected', true);
        }
        $dueMonth.append($option);
      });
    },
    generateYearOptions: function(selectedYear) {
      let $dueYear = $('#due-year');
      years.forEach(function(year) {
        let $option = $(document.createElement('option'));
        $option.text(year.name).val(year.value);
        if (selectedYear && selectedYear === year.value) {
          $option.attr('selected', true);
        }
        $dueYear.append($option);
      });
    },
    generateTodoFormTemplateHtml: function(todo) {
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
    generateLoginFormTemplateHtml: function() {
      let loginFormTemplate = Handlebars.compile($('#login-template').html());
      $('#login-form-container').html(loginFormTemplate());
      $('#username-field').focus();
    },
    generateCreateUserFormTemplateHtml: function() {
      let createUserFormTemplate = Handlebars.compile($('#create-user-template').html());
      $('#login-form-container').html(createUserFormTemplate());
      $('#username-field').focus();
    },

    handleCloseModal: function(event) {
      if ($(event.target).hasClass('modal')) {
        this.hideTodoModal();
      }
    },
    handleFormSubmission: function(event) {
      event.preventDefault();
      let todoTitle = $('#form-title').get(0);
      if (todoTitle.validity.valid) {
        let $form = $(event.target);
        this.sendRequestSubmitForm($form);
      } else {
        this.setTodoFlashMessage('You must enter a title at least 3 characters long.');
        this.displayTodoFlashMessage();
      }
    },
    handleToggleCompletedStatus: function(event) {
      event.preventDefault();
      let id = $(event.target).data('todo-id');
      if (id) {
        this.sendRequestToggleCompletedStatusById(id);
      } else {
        this.setTodoFlashMessage('Cannot mark as completed until item is created.');
      }
    },
    handleAddNewTodoClick: function(event) {
      this.displayTodoModal();
    },
    handleTodoItemClick: function(event) {
      let $target = $(event.target);
      if ($target.hasClass('todo-title')) {
        let id = $target.data('todo-id');
        let todo = this.todos.get(id);
        this.displayTodoModal(todo);
      } else if ($target.hasClass('todo-item')) {
        this.handleToggleCompletedStatus(event);
      } else if ($target.hasClass('delete-icon')) {
        let id = $target.data('todo-id');
        this.sendRequestDeleteTodoById(id);
      }
    },
    handleLogoutLinkClick: function(event) {
      event.preventDefault();
      this.sendLogoutRequest();
    },

    reloadPageContent: function() {
      this.sendRequestGetAllTodos();
      // this.sendRequestForUsername();
    },
    displayAllTodos: function() {
      this.todos.displayAllTodos();
    },
    displayCompletedTodos: function() {
      this.todos.displayAllCompletedTodos();
    },
    displayTodosByGroup: function(event) {
      let $target = $(event.target);
      if ($target.hasClass('due-month') || $target.hasClass('count')) {
        $target = $target.parent();
      }
      if ($target.hasClass('due-month-header')) {
        let group = $target.data('group');
        this.todos.displayTodosByGroup(group);
      }
    },
    displayCompletedTodosByGroup: function(event) {
      let $target = $(event.target);
      if ($target.hasClass('due-month') || $target.hasClass('count')) {
        $target = $target.parent();
      }
      if ($target.hasClass('due-month-header')) {
        let group = $target.data('group');
        this.todos.displayCompletedTodosByGroup(group);
      }
    },

    setAllTodosHoverIcon: function(event) {
      $('.all-todos-icon').attr('src', './img/all-todos-hover-icon.png');
    },
    unsetAllTodosHoverIcon: function(event) {
      $('.all-todos-icon').attr('src', './img/all-todos-icon.png');
    },
    setCompletedHoverIcon: function(event) {
      $('.completed-icon').attr('src', './img/completed-hover-icon.png');
    },
    unsetCompletedHoverIcon: function(event) {
      $('.completed-icon').attr('src', './img/completed-icon.png');
    },

    bindTodoModalEventHandlers: function() {
      $('form').submit(this.handleFormSubmission.bind(this));
      $('#toggle-complete-button').click(this.handleToggleCompletedStatus.bind(this));
      $('#todo-modal').click(this.handleCloseModal.bind(this));
      this.bindTextareaListeners();
      $('input').on('focus', function() {
        this.setTodoFlashMessage();
        this.displayTodoFlashMessage();
      }.bind(this));
    },
    bindTextareaListeners: function() {
      let shiftPressed = false;
      $('textarea').keydown(function(event) {
        if (event.key === 'Enter' && !shiftPressed) {
          event.preventDefault();
          let $form = $('form');
          $form.submit();
        } else if (event.key === 'Shift') {
          shiftPressed = true;
        }
      });

      $('textarea').keyup(function(event) {
        if (event.key === 'Shift') {
          shiftPressed = false;
        }
      });
    },
    bindElements: function() {
      this.$addTodoButton = $('#add-todo');
      this.$todoList = $('#todo-list');
      this.$allTodosGroup = $('#all-todos-group');
      this.$completedTodosGroup = $('#completed-todos-group');
      this.$allLists = $('#all-lists');
      this.$completedLists = $('#completed-lists');
      this.$formContainer = $('#form-container');
    },
    bindEventHandlers: function() {
      this.$addTodoButton.click(this.handleAddNewTodoClick.bind(this));
      this.$todoList.click(this.handleTodoItemClick.bind(this));
      this.$allTodosGroup.click(this.displayAllTodos.bind(this));
      this.$completedTodosGroup.click(this.displayCompletedTodos.bind(this));
      this.$allLists.click(this.displayTodosByGroup.bind(this));
      this.$completedLists.click(this.displayCompletedTodosByGroup.bind(this));
      this.$allTodosGroup.mouseenter(this.setAllTodosHoverIcon);
      this.$allTodosGroup.mouseleave(this.unsetAllTodosHoverIcon);
      this.$completedTodosGroup.mouseenter(this.setCompletedHoverIcon);
      this.$completedTodosGroup.mouseleave(this.unsetCompletedHoverIcon);
      $('#logout-link').click(this.handleLogoutLinkClick.bind(this));
    },

    createHandlebarsHelpers: function() {
      this.registerHandlebarsDateHelper();
      this.registerHandlebarsTodoItemHelper();
      this.registerHandlebarsFormFieldsHelper();
    },
    registerHandlebarsDateHelper: function() {
      Handlebars.registerHelper("date", function() {
        return TodoManager.prototype.getDueMonthForTodo(this);
      });
    },
    registerHandlebarsTodoItemHelper: function() {
      Handlebars.registerHelper("todoItem", function() {
        let todoItemTemplate = Handlebars.compile($('#todo-item-template').html());
        let html = todoItemTemplate(this);
        return html;
      });
    },
    registerHandlebarsFormFieldsHelper: function() {
      Handlebars.registerHelper("formFields", function() {
        let formFieldsTemplate = Handlebars.compile($('#form-fields-template').html());
        let html = formFieldsTemplate(this);
        return html;
      });
    },

    sendRequestSubmitForm: function($form) {
      let json = serializeFormToJson($form.get(0));
      let method = $form.attr('method');
      let url = $form.attr('action');
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.responseType = 'json';
      xhr.addEventListener('load', this.handleServerResponse.bind(this));
      xhr.send(JSON.stringify(json));
    },
    sendRequestToggleCompletedStatusById(id) {
      let todo = this.todos.get(id);
      let form = $('form').get(0);
      let json = form ? serializeFormToJson(form) : todo;
      json.completed = !todo.completed;
      let xhr = new XMLHttpRequest();
      xhr.open('put', `/api/todos/${id}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.responseType = 'json';
      xhr.addEventListener('load', this.handleServerResponse.bind(this));
      xhr.send(JSON.stringify(json));
    },
    sendRequestDeleteTodoById: function(id) {
      let xhr = new XMLHttpRequest();
      xhr.open('delete', `/api/todos/${id}`);
      xhr.todoId = id;
      xhr.addEventListener('load', this.handleServerResponse.bind(this));
      xhr.send();
    },
    sendRequestGetAllTodos: function() {
      let xhr = new XMLHttpRequest();
      xhr.open('get', '/api/todos');
      xhr.responseType = 'json';
      xhr.addEventListener('load', function() {
        if (xhr.status === 401) {
          this.setLoginFlashMessage('You are not logged in.');
          this.displayLoginModal();
          this.setTodos();
        } else {
          this.setTodos(xhr.response);
        }
      }.bind(this));
      xhr.send();
    },
    setTodos: function(response) {
      response = response || [];
      if (this.todos) {
        this.todos.updateList(response);
      } else {
        this.todos = new TodoManager(response);
      }
    },
    sendRequestForUsername: function() {
      let xhr = new XMLHttpRequest();
      xhr.open('get', '/api/username');
      xhr.responseType = 'text';
      xhr.addEventListener('load', function() {
        if (xhr.status === 200) {
          this.setUsername(xhr.response);
        } else if (xhr.status === 401) {
          this.setLoginFlashMessage(xhr.response);
          this.displayLoginModal();
        }
      }.bind(this));
      xhr.send();
    },
    sendLogoutRequest: function() {
      let xhr = new XMLHttpRequest();
      xhr.open('post', '/logout');
      xhr.resposeType = 'text';
      xhr.addEventListener('load', function() {
        if (xhr.status === 202) {
          this.setLoginFlashMessage(xhr.response);
          this.displayLoginModal();
        }
      }.bind(this));
      xhr.send();
    },
    handleServerResponse: function(event) {
      let xhr = event.currentTarget;
      this.hideTodoModal();
      switch(xhr.status) {
        case 200:
          this.todos.update(xhr.response);
          break;
        case 201:
          this.todos.add(xhr.response);
          break;
        case 204:
          this.todos.delete(xhr.todoId);
          break;
        case 401:
          this.setLoginFlashMessage(xhr.status);
          this.displayLoginModal();
          break;
        case 400:
        case 404:
          console.error(xhr.statusText);
      }
    },
    handleSubmitLoginRequest: function(event) {
      event.preventDefault();
      let $loginForm = $('#login-form');
      let json = serializeFormToJson($loginForm.get(0));
      let method = $loginForm.attr('method');
      let url = $loginForm.attr('action');
  
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.addEventListener('load', function() {
        switch(xhr.status) {
          case 200:
            this.hideLoginModal();
            break;
          case 401:
            this.setLoginFlashMessage(xhr.response);
            this.displayLoginFlashMessage();
            break;
          case 404:
            this.setLoginFlashMessage(xhr.response);
            this.displayLoginFlashMessage();
            break;
        }
      }.bind(this));
      xhr.send(JSON.stringify(json));
    },
    handleSubmitCreateUserRequest: function(event) {
      event.preventDefault();
      let $createForm = $('#create-form');
      let json = serializeFormToJson($createForm.get(0));
      let method = $createForm.attr('method');
      let url = $createForm.attr('action');
  
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.addEventListener('load', function() {
        switch(xhr.status) {
          case 200:
            this.hideLoginModal();
            break;
          case 400:
            this.setLoginFlashMessage(xhr.response);
            this.displayLoginFlashMessage();
            break;
        }
      }.bind(this));
      xhr.send(JSON.stringify(json));
    },
    setLoginFlashMessage: function(message) {
      if (!message) {
        message = '';
      }
      this.loginFlashMessage = message;
    },
    setTodoFlashMessage: function(message) {
      if (!message) {
        message = '';
      }
      this.todoFlashMessage = message;
    },
    setRefreshRate: function(seconds) {
      setInterval(function() {
        console.log('performing autorefresh');
        if (!$('form').get(0)) {
          this.reloadPageContent();
        } else {
          console.log('form found, skipping refresh');
        }
      }.bind(this), seconds * 1000);
    },
    init: function() {
      this.todos;
      this.sendRequestForUsername();
      this.sendRequestGetAllTodos();
      this.bindElements();
      this.bindEventHandlers();
      this.createHandlebarsHelpers();
      this.setRefreshRate(REFRESH_RATE_IN_SECONDS);
    }
  };

  App.init();
});