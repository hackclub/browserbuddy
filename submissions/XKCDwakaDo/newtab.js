document.addEventListener('DOMContentLoaded', function() {
    const imgElement = document.getElementById('comic');
  
    fetch('https://xkcd.com/info.0.json')
      .then(response => response.json())
      .then(data => {
        imgElement.src = data.img;
        imgElement.alt = data.alt;
      })
      .catch(error => {
        console.error('Error fetching the comic:', error);
      });

    // Check if 'userInput' exists in localStorage
    let name = localStorage.getItem('name');
    let id = localStorage.getItem('id');

    if (!name) {
      // Prompt the user for input
      let userInput = prompt("Please enter your name:");
      if (userInput != null) {
        userInput = userInput.toLowerCase();
      }
      // Store the input in localStorage
      localStorage.setItem('name', userInput);
      name = userInput;
    }

    if (!id) {
      // Prompt the user for input
      let userInput = prompt("Please enter your hackatime username (hit cancel if you don't have one):");
      
      // Store the input in localStorage
      localStorage.setItem('id', userInput);
      id = userInput;
    }

    // Display the input in the HTML
    document.getElementById('display-input').textContent = name;
    console.log(id);

    if (id !== 'null' && id !== null) {
      /*const codingTimeLink = document.getElementById('coding-time-link');
      if (codingTimeLink) {
        codingTimeLink.textContent = ;
      }*/
      
      fetch(`https://waka.hackclub.com/api/compat/wakatime/v1/users/${id}/stats/today`)
        .then(response => response.json())
        .then(data => {
          const codingTimeLink = document.getElementById('coding-time-link');
          if (codingTimeLink) {
            codingTimeLink.textContent = 'coding time today: ' + data.data.human_readable_total;
          }
          console.log(data.data.human_readable_total);
        })
        .catch(error => {
          console.log('Error fetching the data:', error);
        });
    }

    if (id == null) {
      const codingTimeLink = document.getElementById('coding-time-link');
      if (codingTimeLink) {
        codingTimeLink.textContent = '';
      }
    }
    // Get today's date in YYYY-MM-DD format
    function getTodayDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }

    // Check and reset todos if it's a new day
    function checkAndResetTodos() {
      const storedDate = localStorage.getItem('todoDate');
      const today = getTodayDate();

      if (storedDate !== today) {
        localStorage.setItem('todos', JSON.stringify([]));
        localStorage.setItem('todoDate', today);
        todos = [];
      } else {
        todos = JSON.parse(localStorage.getItem('todos')) || [];
      }
    }

    // Initialize todo list from localStorage
    let todos = [];

    // Function to render todos
    function renderTodos() {
      const todoList = document.getElementById('todo-list');
      todoList.innerHTML = '';
      
      // Sort todos: incomplete first, completed last
      const sortedTodos = todos.sort((a, b) => a.completed - b.completed);
      
      sortedTodos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.marginBottom = '5px';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.style.marginRight = '10px';
        checkbox.style.backgroundColor = '#ffffff';
        checkbox.onclick = () => {
          todos[index].completed = checkbox.checked;
          localStorage.setItem('todos', JSON.stringify(todos));
          renderTodos();
        };
        
        const span = document.createElement('span');
        span.textContent = todo.text;
        if (todo.completed) {
          span.style.textDecoration = 'line-through';
          span.style.color = '#888';
        }
        
        li.appendChild(checkbox);
        li.appendChild(span);
        todoList.appendChild(li);
      });
    }

    // Add todo event
    document.getElementById('add-todo').addEventListener('click', () => {
      const todoInput = document.getElementById('todo-input');
      const newTodoText = todoInput.value.trim();
      if (newTodoText) {
        todos.push({ text: newTodoText, completed: false });
        localStorage.setItem('todos', JSON.stringify(todos));
        todoInput.value = '';
        renderTodos();
      }
    });

    document.addEventListener("DOMContentLoaded", function() {
      const codingContainer = document.getElementById('coding-time-container');

      /*if (!displayTime || displayTime.textContent.trim() === '') {
        codingContainer.style.display = 'none';
        console.log('No coding time found');
      }*/
    });

    // On page load
    window.onload = () => {
      checkAndResetTodos();
      renderTodos();
    };
});