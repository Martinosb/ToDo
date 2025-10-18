// State management
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// DOM elements
const todoInput = document.getElementById('todoInput');
const deadlineInput = document.getElementById('deadlineInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
    updateStats();
});

// Add todo
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        // Add shake animation to input
        todoInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            todoInput.style.animation = '';
        }, 500);
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        deadline: deadlineInput.value || null
    };
    
    todos.unshift(todo);
    saveTodos();
    renderTodos();
    updateStats();
    
    todoInput.value = '';
    deadlineInput.value = '';
    todoInput.focus();
}

// Render todos
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No tasks yet. Add one above!</div>';
        return;
    }
    
    todoList.innerHTML = filteredTodos.map(todo => {
        let deadlineHtml = '';
        if (todo.deadline) {
            const deadlineDate = new Date(todo.deadline);
            const now = new Date();
            const isOverdue = deadlineDate < now && !todo.completed;
            const deadlineClass = isOverdue ? 'overdue' : '';
            
            deadlineHtml = `
                <div class="deadline ${deadlineClass}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${formatDeadline(todo.deadline)}
                </div>
            `;
        }
        
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo(${todo.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div class="todo-content">
                    <span class="todo-text">${escapeHtml(todo.text)}</span>
                    ${deadlineHtml}
                </div>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </li>
        `;
    }).join('');
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Delete todo
function deleteTodo(id) {
    const todoElement = document.querySelector(`[data-id="${id}"]`);
    todoElement.style.animation = 'todoSlideOut 0.3s ease-out';
    
    setTimeout(() => {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
    }, 300);
}

// Filter todos
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(t => !t.completed);
        case 'completed':
            return todos.filter(t => t.completed);
        default:
            return todos;
    }
}

// Clear completed
clearCompletedBtn.addEventListener('click', () => {
    if (todos.some(t => t.completed)) {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
        updateStats();
    }
});

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    
    totalTasksSpan.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
    completedTasksSpan.textContent = `${completed} completed`;
}

// Local storage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Utility function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Format deadline for display
function formatDeadline(deadline) {
    const date = new Date(deadline);
    const now = new Date();
    const diffMs = date - now;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    // If overdue
    if (diffMs < 0) {
        const overdueDays = Math.abs(diffDays);
        const overdueHours = Math.abs(diffHours);
        if (overdueDays > 0) {
            return `Overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`;
        } else if (overdueHours > 0) {
            return `Overdue by ${overdueHours} ${overdueHours === 1 ? 'hour' : 'hours'}`;
        } else {
            return 'Overdue';
        }
    }
    
    // If due soon
    if (diffDays === 0) {
        if (diffHours === 0) {
            return `Due in ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'}`;
        }
        return `Due in ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
    } else if (diffDays === 1) {
        return 'Due tomorrow';
    } else if (diffDays < 7) {
        return `Due in ${diffDays} days`;
    }
    
    // Format date for further deadlines
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return `Due ${date.toLocaleDateString('en-US', options)}`;
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes todoSlideOut {
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
