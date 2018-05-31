angular.module('todoApp', [])
  .controller('TodoListController', function() {
    var todoList = this;
    todoList.todos = [
      {text:'learn AngularJS', done:true},
      {text:'build an AngularJS app', done:false}
    ];
 
    todoList.addTodo = function() {
      if (todoList.todoText){
        let text=todoList.todoText.trim();
        if (text){
          todoList.todos.push({text:text, done:false});
          todoList.todoText = '';
        }
      }
    };
 
    todoList.remaining = function() {
      var count = 0;
      // angular.forEach(todoList.todos, function(todo) {
      //   count += todo.done ? 0 : 1;
      // });
      for (var todo of todoList.todos){
        if (!todo.done)
          count++;
      }
      return count;
    };
 
    todoList.archive = function() {
      var oldTodos = todoList.todos;
      todoList.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) todoList.todos.push(todo);
      });
    };
  });
