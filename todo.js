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
  const todoCategory = document.getElementById('todo-category');
  const todoDate = document.getElementById('todo-date');

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
  let draggedItemId = null;

  // ─── INITIAL RENDER ───
  renderTodos();
  setRandomQuote();

  // ─── EVENT LISTENERS ───

  // Create Task
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    const category = todoCategory.value;
    const date = todoDate.value;

    if (text) {
      addTodo(text, category, date);
      todoInput.value = '';
      todoDate.value = '';
      setRandomQuote();
    }
  });

  // Delegated Event Handling
  todoList.addEventListener('click', (e) => {
    const target = e.target;
    const todoItem = target.closest('.todo-item');
    if (!todoItem) return;

    const id = parseInt(todoItem.dataset.id);

    if (target.classList.contains('todo-checkbox') || target.closest('.todo-checkbox')) {
      toggleTodo(id);
    }

    if (target.classList.contains('delete') || target.closest('.delete')) {
      deleteTodo(id);
    }

    if (target.classList.contains('edit') || target.closest('.edit')) {
      const currentText = todoItem.querySelector('.todo-text').textContent;
      const newText = prompt('Edit your task:', currentText);
      if (newText !== null && newText.trim() !== "" && newText !== currentText) {
        editTodo(id, newText.trim());
      }
    }
  });

  // Drag & Drop Handlers
  todoList.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.todo-item');
    if (!item) return;
    draggedItemId = parseInt(item.dataset.id);
    item.classList.add('dragging');
  });

  todoList.addEventListener('dragend', (e) => {
    const item = e.target.closest('.todo-item');
    if (item) item.classList.remove('dragging');
    draggedItemId = null;
  });

  todoList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(todoList, e.clientY);
    const dragging = document.querySelector('.dragging');
    if (afterElement == null) {
      todoList.appendChild(dragging);
    } else {
      todoList.insertBefore(dragging, afterElement);
    }
  });

  todoList.addEventListener('drop', (e) => {
    e.preventDefault();
    const newOrder = Array.from(todoList.querySelectorAll('.todo-item')).map(item =>
      todos.find(t => t.id === parseInt(item.dataset.id))
    );
    todos = newOrder;
    saveAndRender();
  });

  // Helper for Drag & Drop
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

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

  function addTodo(text, category, dueDate) {
    const newTodo = {
      id: Date.now(),
      text,
      category,
      dueDate,
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
      const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
      const div = document.createElement('div');
      div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      div.dataset.id = todo.id;
      div.draggable = true;
      div.innerHTML = `
        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" role="checkbox" aria-checked="${todo.completed}" tabindex="0"></div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 0.25rem;">
          <span class="todo-text">${escapeHTML(todo.text)}</span>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <span style="font-size: 0.7rem; color: var(--accent-primary); background: rgba(0,212,170,0.1); padding: 0.1rem 0.5rem; border-radius: 4px;">${todo.category || 'Other'}</span>
            ${todo.dueDate ? `<span style="font-size: 0.7rem; color: ${isOverdue ? '#ef4444' : 'var(--text-secondary)'};">📅 ${new Date(todo.dueDate).toLocaleDateString()}</span>` : ''}
          </div>
        </div>
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
})