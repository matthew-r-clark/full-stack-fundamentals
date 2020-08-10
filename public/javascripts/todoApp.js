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
    setUsername: function(username) {
      $('#username').text(username);
    },
    displayModal: function(todo) {
      this.showModal();
      this.buildForm(todo);
      this.bindModalEventHandlers();
    },
    showModal: function() {
      let $modal = $('#modal');
      $modal.fadeIn();
    },
    hideModal: function() {
      let $modal = $('#modal');
      $modal.fadeOut();
      setTimeout(function() {
        $('form').remove();
      },400);
    },
    buildForm: function(todo) {
      $('#form-content').html(this.generateFormTemplateHtml(todo));
      $('form').find('input').focus();
      this.setCompleteButton(todo);
      this.generateDateOptions(todo);
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
    generateFormTemplateHtml: function(todo) {
      if (todo) {
        let editFormTemplate = Handlebars.compile($('#edit-todo-template').html());
        return editFormTemplate(todo);
      } else {
        let addFormTemplate = Handlebars.compile($('#add-todo-template').html());
        return addFormTemplate();
      }
    },

    handleCloseModal: function(event) {
      if ($(event.target).hasClass('modal')) {
        this.hideModal();
      }
    },
    handleFormSubmission: function(event) {
      event.preventDefault();
      let todoTitle = $('#form-title').get(0);
      if (todoTitle.validity.valid) {
        let $form = $(event.target);
        this.sendRequestSubmitForm($form);
      } else {
        alert('You must enter a title at least 3 characters long.');
      }
    },
    handleToggleCompletedStatus: function(event) {
      let id = $(event.target).data('todo-id');
      if (id) {
        this.sendRequestToggleCompletedStatusById(id);
      } else {
        event.preventDefault();
        alert('Cannot mark as complete as item has not been created yet!');
      }
    },
    handleAddNewTodoClick: function(event) {
      this.displayModal();
    },
    handleTodoItemClick: function(event) {
      let $target = $(event.target);
      if ($target.hasClass('todo-title')) {
        let id = $target.data('todo-id');
        let todo = this.todos.get(id);
        this.displayModal(todo);
      } else if ($target.hasClass('todo-item')) {
        this.handleToggleCompletedStatus(event);
      } else if ($target.hasClass('delete-icon')) {
        let id = $target.data('todo-id');
        this.sendRequestDeleteTodoById(id);
      }
    },

    displayAllTodos: function(event) {
      this.todos.displayAllTodos();
    },
    displayCompletedTodos: function(event) {
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

    bindModalEventHandlers: function() {
      $('form').submit(this.handleFormSubmission.bind(this));
      $('#toggle-complete-button').click(this.handleToggleCompletedStatus.bind(this));
      $('#modal').click(this.handleCloseModal.bind(this));
      this.bindTextareaListeners();
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
      xhr.addEventListener('load', function() {
        switch(xhr.status) {
          case 200:
            this.todos.update(xhr.response);
            break;
          case 201:
            this.todos.add(xhr.response);
            break;
          case 400:
          case 404:
            console.error(xhr.statusText);
        }
        this.hideModal();
      }.bind(this));
      xhr.send(JSON.stringify(json));
    },
    sendRequestToggleCompletedStatusById(id) {
      let todo = this.todos.get(id);
      let $form = $('form');
      let json;
      if ($form.get(0)) {
        json = serializeFormToJson($form.get(0));
      } else {
        json = todo;
      }
      json.completed = !todo.completed;
      let xhr = new XMLHttpRequest();
      xhr.open('put', `/api/todos/${id}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.responseType = 'json';
      xhr.addEventListener('load', function() {
        switch(xhr.status) {
          case 200:
            this.todos.update(xhr.response);
            break;
          case 400:
          case 404:
            console.error(xhr.statusText);
        }
        this.hideModal();
      }.bind(this));
      xhr.send(JSON.stringify(json));
    },
    sendRequestDeleteTodoById: function(id) {
      let xhr = new XMLHttpRequest();
      xhr.open('delete', `/api/todos/${id}`);
      xhr.addEventListener('load', function() {
        switch(xhr.status) {
          case 204:
            this.todos.delete(id);
            break;
          case 404:
            console.error(xhr.statusText);
        }
      }.bind(this));
      xhr.send();
    },
    sendRequestGetAllTodos: function() {
      let xhr = new XMLHttpRequest();
      xhr.open('get', '/api/todos');
      xhr.responseType = 'json';
      xhr.addEventListener('load', function() {
        this.todos = new TodoManager(xhr.response);
      }.bind(this));
      xhr.send();
    },
    sendRequestForUsername: function() {
      let xhr = new XMLHttpRequest();
      xhr.open('get', '/api/username');
      xhr.responseType = 'text';
      xhr.addEventListener('load', function() {
        this.setUsername(xhr.response);
      }.bind(this));
      xhr.send();
    },
    init: function() {
      this.todos;
      this.sendRequestForUsername();
      this.sendRequestGetAllTodos();
      this.bindElements();
      this.bindEventHandlers();
      this.createHandlebarsHelpers();
    }
  };

  App.init();
});