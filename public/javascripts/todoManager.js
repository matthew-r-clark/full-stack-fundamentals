function TodoManager(todos) {
  this.list = this.formatTodos(todos) || [];
  this.dueMonthsList = [];
  this.dueMonthsCompletedList = [];
  this.totalTodoCount = 0;
  this.completedTodoCount = 0;
  this.selectedGroup = undefined;
  this.selectedList = 'All Todos';
  this.onlyCompleted = false;
  this.displayTodos();
}

TodoManager.prototype.formatTodos = function(todos) {
  if (todos) {
    todos.forEach(todo => this.trimDueDate(todo));
    return todos;
  }
}

TodoManager.prototype.resetMainListState = function() {
  this.selectedGroup = undefined;
  this.selectedList = 'All Todos';
  this.onlyCompleted = false;
}

TodoManager.prototype.add = function(todo) {
  this.trimDueDate(todo);
  this.list.push(todo);
  this.resetMainListState();
  this.displayTodos();
}

TodoManager.prototype.update = function(todo) {
  this.trimDueDate(todo);
  let oldTodo = this.get(todo.id);
  let index = this.list.indexOf(oldTodo);
  this.list[index] = todo;
  this.displayTodos();
}

TodoManager.prototype.delete = function(id) {
  let todo = this.get(id);
  let index = this.list.indexOf(todo);
  this.list.splice(index, 1);
  this.displayTodos();
}

TodoManager.prototype.get = function(id) {
  return this.list.filter(t => String(t.id) === String(id))[0];
}

TodoManager.prototype.trimDueDate = function(todo) {
  if (!todo) {
    console.error('todo not defined');
    return;
  }
  todo.day = todo.day.trim();
  todo.month = todo.month.trim();
  todo.year = todo.year.trim();
}

TodoManager.prototype.displayAllTodos = function() {
  this.selectedGroup = undefined;
  this.onlyCompleted = false;
  this.selectedList = 'All Todos';
  this.displayTodos();
},

TodoManager.prototype.displayAllCompletedTodos = function() {
  this.selectedGroup = undefined;
  this.onlyCompleted = true;
  this.selectedList = 'Completed';
  this.displayTodos();
},

TodoManager.prototype.displayTodosByGroup = function(group) {
  this.selectedGroup = this.selectedList = group;
  this.onlyCompleted = false;
  this.displayTodos();
},

TodoManager.prototype.displayCompletedTodosByGroup = function(group) {
  this.selectedGroup = this.selectedList = group;
  this.onlyCompleted = true;
  this.displayTodos();
},

TodoManager.prototype.displayTodos = function() {
  this.refresh();
  this.displayMainList();
  this.displayGroupsAndCounts();
  this.setGroupMenuButtonBackground();
}

TodoManager.prototype.refresh = function() {
  this.sort();
  this.updateCounts();
  this.updateDueMonthList();
  this.updateDueMonthCompletedList();
}

TodoManager.prototype.sort = function() {
  this.list.sort(this.sortByTitle)
           .sort(this.sortByDay)
           .sort(this.sortByMonth)
           .sort(this.sortByYear);
}

TodoManager.prototype.sortByTitle = function(a, b) {
  if (a.title > b.title) {
    return 1;
  } else if (a.title < b.title) {
    return -1;
  } else {
    return 0;
  }
}

TodoManager.prototype.sortByday = function(a, b) {
  if (a.day > b.day) {
    return 1;
  } else if (a.day < b.day) {
    return -1;
  } else {
    return 0;
  }
}

TodoManager.prototype.sortByMonth = function(a, b) {
  if (a.month > b.month) {
    return 1;
  } else if (a.month < b.month) {
    return -1;
  } else {
    return 0;
  }
}

TodoManager.prototype.sortByYear = function(a, b) {
  if (a.year > b.year) {
    return 1;
  } else if (a.year < b.year) {
    return -1;
  } else {
    return 0;
  }
}

TodoManager.prototype.updateCounts = function() {
  this.totalTodoCount = this.list.length;
  this.completedTodoCount = this.list.filter(t => t.completed).length;
}

TodoManager.prototype.displayMainList = function() {
  let todos = this.list;

  if (this.selectedGroup) {
    todos = this.getTodosFromDueMonth(this.selectedGroup);
  }

  if (this.onlyCompleted) {
    todos = todos.filter(todo => todo.completed);
  }

  let $todoList = $('#todo-list');

  let todoListTemplate = Handlebars.compile($('#todo-list-template').html());
  let todoListHtml = todoListTemplate({todos: todos});
  $todoList.html(todoListHtml);
}

TodoManager.prototype.displayGroupsAndCounts = function() {
  $('#due-month-name').text(this.selectedList);
  let todoGroupCount;
  if (this.onlyCompleted) {
    todoGroupCount = this.getDueMonthCompletedCount();
  } else {
    todoGroupCount = this.getDueMonthCount()
  }
  $('#due-month-count').text(todoGroupCount);

  $('#all-todos-count').text(this.totalTodoCount);
  let listTemplate = Handlebars.compile($('#due-month-list').html());
  let html = listTemplate({dueMonths: this.dueMonthsList});
  $('#all-lists').html(html);

  $('#completed-todos-count').text(this.completedTodoCount);
  let completedListTemplate = Handlebars.compile($('#due-month-completed-list').html());
  html = completedListTemplate({dueMonths: this.dueMonthsCompletedList});
  $('#completed-lists').html(html);
}

TodoManager.prototype.setGroupMenuButtonBackground = function() {
  this.resetSelectedNavItem();
  let $button;
  let group = this.selectedGroup;
  if (!this.selectedGroup && !this.onlyCompleted) {
    $button = $('#all-todos-group');
  } else if (!this.selectedGroup && this.onlyCompleted) {
    $button = $('#completed-todos-group');
  } else if (this.selectedGroup && !this.onlyCompleted) {
    $button = $('#all-lists').find(`[data-group='${group}']`);
  } else if (this.selectedGroup && this.onlyCompleted) {
    $button = $('#completed-lists').find(`[data-group='${group}']`);
  }
  $button.addClass('selected-due-month');
  $button.find('span.count').addClass('selected-count');
}

TodoManager.prototype.resetSelectedNavItem = function() {
  $('.selected-due-month').removeClass('selected-due-month');
  $('.selected-count').removeClass('selected-count');
}

TodoManager.prototype.getTodosFromDueMonth = function(dueMonth) {
  let todos;
  if (dueMonth === "No Due Date") {
    todos = this.list.filter(function(todo) {
      return !todo.month || !todo.year;
    });
  } else if (dueMonth) {
    dueMonth = this.parseDueMonth(dueMonth);
    todos = this.list.filter(function(todo) {
      return todo.month === dueMonth.month &&
             todo.year === "20" + dueMonth.year;
    });
  }
  return todos;
}

TodoManager.prototype.getDueMonthCount = function(dueMonth) {
  dueMonth = dueMonth || this.selectedGroup;
  if (dueMonth) {
    return this.getTodosFromDueMonth(dueMonth).length;
  } else {
    return this.totalTodoCount;
  }
}

TodoManager.prototype.getDueMonthCompletedCount = function(dueMonth) {
  dueMonth = dueMonth || this.selectedGroup;
  if (dueMonth) {
    return this.getTodosFromDueMonth(dueMonth)
               .filter(todo => todo.completed)
               .length;
  } else {
    return this.completedTodoCount;
  }
}

TodoManager.prototype.dueMonthHasAnyCompleted = function(dueMonth) {
  return this.getTodosFromDueMonth(dueMonth)
             .filter(todo => todo.completed)
             .length > 0;
}

TodoManager.prototype.getDueMonthForTodo = function(todo) {
  if (todo.month && todo.year) {
    let month = todo.month;
    let year = todo.year.substring(2, 4);
    return `${month}/${year}`;
  }
  return 'No Due Date';
}

TodoManager.prototype.parseDueMonth = function(dueMonth) {
  let array = dueMonth.split('/');
  return {
    month: array[0],
    year: array[1],
  };
}

TodoManager.prototype.updateDueMonthList = function() {
  let dueMonths = [];
  let added = [];
  this.list.forEach(function(todo) {
    let dueMonth = this.getDueMonthForTodo(todo);
    let dueMonthObject = {
      month: dueMonth,
      count: this.getDueMonthCount(dueMonth),
    };
    if (!added.includes(dueMonth)) {
      dueMonths.push(dueMonthObject);
      added.push(dueMonth);
    }
  }.bind(this));
  this.dueMonthsList = dueMonths;
}

TodoManager.prototype.updateDueMonthCompletedList = function() {
  this.dueMonthsCompletedList = this.dueMonthsList
      .filter(m => this.dueMonthHasAnyCompleted(m.month))
      .map(m => {
        m = $.extend({}, m);
        m.count = this.getDueMonthCompletedCount(m.month);
        return m;
      });
}