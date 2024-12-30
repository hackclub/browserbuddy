document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
  
    const loadTodos = () => {
      chrome.storage.sync.get('todos', (data) => {
        const todos = data.todos || [];
        todos.forEach(addTodoToList);
      });
    };
  
    const saveTodos = (todos) => {
      chrome.storage.sync.set({ todos });
    };
  
    const addTodoToList = (todoText) => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.textContent = todoText;
  
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        li.remove();
        const todos = [...document.querySelectorAll('.todo-item')].map(item => item.textContent.replace('Delete', '').trim());
        saveTodos(todos);
      });
  
      li.appendChild(deleteButton);
      todoList.appendChild(li);
    };
  
    todoForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const todoText = todoInput.value.trim();
      if (todoText) {
        addTodoToList(todoText);
        const todos = [...document.querySelectorAll('.todo-item')].map(item => item.textContent.replace('Delete', '').trim());
        saveTodos(todos);
        todoInput.value = '';
      }
    });
  
    loadTodos();
  });
  