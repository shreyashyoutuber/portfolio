/**
 * Todo Application Logic
 * Master DOM Manipulation, Event Handling, and Local Data Persistence
 */

document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const itemsLeft = document.getElementById('items-left');
  const clearCompletedBtn = document.getElementById('clear-completed');
  const filterBtns = document.querySelectorAll('.filter-btn');

  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const todoQuote = document.getElementById('todo-quote');

  const quotes = [
    "The secret of getting ahead is getting started.",
    "Small progress is still progress.",
    "Don't stop until you're proud.",
    "Your future self will thank you for what you do today.",
    "Quality is not an act, it is a habit.",
    "Accessibility is not a feature, it's a right.",
    "Clean code always looks like it was written by someone who cares."
  ];

  let todos = JSON.parse(localStorage.getItem('shrey-todos')) || [];
  let currentFilter = 'all';

  // ─── INITIAL RENDER ───
  renderTodos();
  setRandomQuote();

  // ─── EVENT LISTENERS ───
  
  // Create Task
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
      addTodo(text);
      todoInput.value = '';
      setRandomQuote();
    }
  });

  // Delegated Event Handling (Update/Delete)
  todoList.addEventListener('click', (e) => {
    const target = e.target;
    const todoItem = target.closest('.todo-item');
    if (!todoItem) return;
    
    const id = parseInt(todoItem.dataset.id);

    // Toggle Complete
    if (target.classList.contains('todo-checkbox') || target.closest('.todo-checkbox')) {
      toggleTodo(id);
    }
    
    // Delete Task
    if (target.classList.contains('delete') || target.closest('.delete')) {
      deleteTodo(id);
    }

    // Edit Task
    if (target.classList.contains('edit') || target.closest('.edit')) {
      const currentText = todoItem.querySelector('.todo-text').textContent;
      const newText = prompt('Edit your task:', currentText);
      if (newText !== null && newText.trim() !== "" && newText !== currentText) {
        editTodo(id, newText.trim());
      }
    }
  });

  // Filter Handling
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  // Clear Completed
  clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(t => !t.completed);
    saveAndRender();
  });

  // ─── CORE FUNCTIONS ───

  function setRandomQuote() {
    const index = Math.floor(Math.random() * quotes.length);
    todoQuote.textContent = `"${quotes[index]}"`;
  }

  function addTodo(text) {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    todos.unshift(newTodo);
    saveAndRender();
  }

  function toggleTodo(id) {
    todos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveAndRender();
  }

  function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveAndRender();
  }

  function editTodo(id, text) {
    todos = todos.map(todo => 
      todo.id === id ? { ...todo, text } : todo
    );
    saveAndRender();
  }

  function saveAndRender() {
    localStorage.setItem('shrey-todos', JSON.stringify(todos));
    renderTodos();
  }

  function renderTodos() {
    const filteredTodos = todos.filter(todo => {
      if (currentFilter === 'active') return !todo.completed;
      if (currentFilter === 'completed') return todo.completed;
      return true;
    });

    todoList.innerHTML = '';
    
    if (filteredTodos.length === 0) {
      todoList.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No tasks found.</p>`;
    }

    filteredTodos.forEach(todo => {
      const div = document.createElement('div');
      div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      div.dataset.id = todo.id;
      div.innerHTML = `
        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" role="checkbox" aria-checked="${todo.completed}" tabindex="0"></div>
        <span class="todo-text">${escapeHTML(todo.text)}</span>
        <div class="todo-actions">
          <button class="todo-btn edit" aria-label="Edit task">✎</button>
          <button class="todo-btn delete" aria-label="Delete task">×</button>
        </div>
      `;
      todoList.appendChild(div);
    });

    updateStats();
  }

  function updateStats() {
    const total = todos.length;
    const completedCount = todos.filter(t => t.completed).length;
    const activeCount = total - completedCount;
    
    itemsLeft.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;
    
    const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
  }

  function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
  }
});
