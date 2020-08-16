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

// General
    setUsername: function(username) {
      $('#username').text(username);
    },
    reloadPageContent: function() {
      this.sendRequestGetAllTodos();
    },
    setTodos: function(list) {
      list = list || [];
      if (this.todos) {
        this.todos.updateList(list);
      } else {
        this.todos = new TodoManager(list);
      }
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

// Todo modal and form
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
      HandlebarsTemplates.todoForm(todo);
      this.setCompleteButton(todo);
      this.generateDateOptions(todo);
      this.bindTodoModalEventHandlers();
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

// Login modal and form
    displayLoginModal: function() {
      this.showLoginModal();
      this.buildLoginForm();
    },
    buildLoginForm: function() {
      HandlebarsTemplates.loginForm();
      this.bindLoginModalEventHandlers();
      this.displayLoginFlashMessage();
    },
    bindLoginModalEventHandlers: function() {
      $('#login-form').submit(this.handleSubmitLogin.bind(this));
      $('#create-user-link').click(this.handleCreateUserClick.bind(this));
    },
    displayCreateUserModal: function() {
      this.showLoginModal();
      this.buildCreateUserForm();
    },
    buildCreateUserForm: function() {
      HandlebarsTemplates.createUserForm();
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
      $('#create-form').submit(this.handleSubmitCreateUserForm.bind(this));
      $('#login-link').click(this.handleExistingAccountClick.bind(this));
    },
    handleExistingAccountClick: function(event) {
      event.preventDefault();
      let username = $('#username-field').val();
      $('.user-form').remove();
      this.buildLoginForm();
      if (username) {
        $('#username-field').val(username);
        $('#password-field').focus();
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

// Event handlers
    handleCloseModal: function(event) {
      if ($(event.target).hasClass('modal')) {
        this.hideTodoModal();
      }
    },
    handleValidateTodoTitleOnBlur: function(event) {
      let todoTitle = event.target;
      if (!todoTitle.validity.valid) {
        this.setTodoFlashMessage('You must enter a title at least 3 characters long.');
        this.displayTodoFlashMessage();
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
    handleCreateUserClick: function(event) {
      event.preventDefault();
      let username = $('#username-field').val();
      $('.user-form').remove();
      this.buildCreateUserForm();
      if (username) {
        $('#username-field').val(username);
        $('#password-field').focus();
      }
    },
    handleSubmitLogin: function(event) {
      event.preventDefault();
      let $username = $('#username-field').get(0);
      let $password = $('#password-field').get(0);
      if (!$username.validity.valid) {
        this.setLoginFlashMessage('Username field cannot be blank.');
        this.displayLoginFlashMessage();
      } else if (!$password.validity.valid) {
        this.setLoginFlashMessage('Password field cannot be blank.');
        this.displayLoginFlashMessage();
      } else {
        this.sendLoginRequest();
      }
    },
    handleSubmitCreateUserForm: function(event) {
      event.preventDefault();
      let $username = $('#username-field').get(0);
      let $password = $('#password-field').get(0);
      if (!$username.validity.valid) {
        this.setLoginFlashMessage('Username field cannot be blank.');
        this.displayLoginFlashMessage();
      } else if (!$password.validity.valid) {
        this.setLoginFlashMessage('Password field cannot be blank.');
        this.displayLoginFlashMessage();
      } else {
        this.sendCreateUserRequest.call(this);
      }
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
    handleClearTodoFlashMessage: function() {
      this.setTodoFlashMessage();
      this.displayTodoFlashMessage();
    },

// Bind elements and event listenrs
    bindTodoModalEventHandlers: function() {
      $('form').submit(this.handleFormSubmission.bind(this));
      $('#toggle-complete-button').click(this.handleToggleCompletedStatus.bind(this));
      $('#todo-modal').click(this.handleCloseModal.bind(this));
      this.bindTextareaListeners();
      $('input').on('blur', this.handleValidateTodoTitleOnBlur.bind(this));
      $('input').on('focus', this.handleClearTodoFlashMessage.bind(this));
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

// Server requests
    sendRequestSubmitForm: async function($form) {
      let json = serializeFormToJson($form.get(0));
      let method = $form.attr('method');
      let url = $form.attr('action');

      let response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      this.handleTodosResponse(response);
    },
    sendRequestToggleCompletedStatusById: async function(id) {
      let todo = this.todos.get(id);
      let form = $('#todo-form').get(0);
      let json = form ? serializeFormToJson(form) : todo;
      json.completed = !todo.completed;

      let response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      this.handleTodosResponse(response);
    },
    sendRequestDeleteTodoById: async function(id) {
      let response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      this.handleTodosResponse(response);
    },
    sendRequestGetAllTodos: async function() {
      let response = await fetch('/api/todos');
      if (response.status === 200) {
        this.setTodos(await response.json());
      } else {
        this.handleLoginResponse(response);
      }
    },
    sendRequestForUsername: async function() {
      let response = await fetch('/api/username');
      if (response.status === 200) {
        this.setUsername(await response.text());
      } else {
        this.handleLoginResponse(response);
      }
    },
    sendLogoutRequest: async function() {
      let response = await fetch('/logout', { method: 'POST' });
      this.handleLogoutResponse(response);
    },
    sendLoginRequest: async function() {
      let $loginForm = $('#login-form');
      let json = serializeFormToJson($loginForm.get(0));
      let method = $loginForm.attr('method');
      let url = $loginForm.attr('action');

      let response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      this.handleLoginResponse(response);
    },
    sendCreateUserRequest: async function() {
      let $createForm = $('#create-form');
      let json = serializeFormToJson($createForm.get(0));
      let method = $createForm.attr('method');
      let url = $createForm.attr('action');

      let response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      this.handleLoginResponse(response);
    },
    handleTodosResponse: async function(response) {
      this.hideTodoModal();
      switch(response.status) {
        case 200:
          this.todos.update(await response.json());
          break;
        case 201:
          this.todos.add(await response.json());
          break;
        case 204:
          this.todos.delete(await response.text());
          break;
        case 401:
          this.setLoginFlashMessage(await response.text());
          this.displayLoginModal();
          break;
        default:
          console.error(response.status, response.statusText);
      }
    },
    handleLoginResponse: async function(response) {
      switch(response.status) {
        case 200:
          this.hideLoginModal();
          this.sendRequestForUsername();
          break;
        case 202:
        case 400:
        case 401:
        case 404:
          this.setLoginFlashMessage(await response.text());
          if ($('form').get(0)) {
            this.displayLoginFlashMessage();
          } else {
            this.displayLoginModal();
          }
        default:
          console.error(response.status, response.statusText);
      }
    },
    handleLogoutResponse: async function(response) {
      switch(response.status) {
        case 202:
        case 401:
          this.setLoginFlashMessage(await response.text());
          this.displayLoginModal();
          break;
        default:
          console.error(response.status, response.statusText);
      }
    },
    
    init: function() {
      this.todos;
      this.sendRequestForUsername();
      this.sendRequestGetAllTodos();
      this.bindElements();
      this.bindEventHandlers();
      HandlebarsHelpers.register();
      this.setRefreshRate(REFRESH_RATE_IN_SECONDS);
    }
  };

  App.init();
});