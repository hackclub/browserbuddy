// Global variables
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const taskList = document.getElementById('task-list');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const addTaskButton = document.getElementById('add-task');
const newTaskInput = document.getElementById('new-task');

// Motivational Quotes (can add more quotes here)
const quotes = [
  { text: "The best way to predict the future is to create it.", author: "Abraham Lincoln" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
];

// Task data stored in localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Function to set the daily quote
function setDailyQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  quoteText.textContent = quotes[randomIndex].text;
  quoteAuthor.textContent = `- ${quotes[randomIndex].author}`;
}

// Function to render the task list
function renderTaskList() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.name;
    li.classList.toggle('completed', task.completed);

    // Create the Remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-task');
    removeButton.addEventListener('click', () => removeTask(index));

    // Append the remove button to the task item
    li.appendChild(removeButton);
    li.addEventListener('click', () => toggleTaskCompletion(index));
    taskList.appendChild(li);
  });
  updateProgress();
}

// Function to toggle task completion
function toggleTaskCompletion(index) {
  tasks[index].completed = !tasks[index].completed;
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTaskList();
}

// Function to remove a task
function removeTask(index) {
  tasks.splice(index, 1); // Remove the task from the array
  localStorage.setItem('tasks', JSON.stringify(tasks)); // Update localStorage
  renderTaskList(); // Re-render the task list
}

// Function to update the progress tracker
function updateProgress() {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `${completedTasks}/${totalTasks} tasks completed`;
}

// Add new task
addTaskButton.addEventListener('click', () => {
  const taskName = newTaskInput.value.trim();
  if (taskName) {
    tasks.push({ name: taskName, completed: false });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    newTaskInput.value = '';
    renderTaskList();
  }
});

// Initialize the extension
setDailyQuote();
renderTaskList();