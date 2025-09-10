// To-Do List Application
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    // Initialize DOM elements
    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.searchInput = document.getElementById('searchInput');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.emptyState = document.getElementById('emptyState');
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');
        this.pendingCount = document.getElementById('pendingCount');
    }

    // Bind event listeners
    bindEvents() {
        // Add task button click
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        
        // Enter key to add task
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Search functionality
        this.searchInput.addEventListener('input', () => this.render());

        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Task list click delegation
        this.taskList.addEventListener('click', (e) => {
            const taskId = e.target.closest('.task-item')?.dataset.taskId;
            if (!taskId) return;

            if (e.target.classList.contains('complete-btn') || e.target.classList.contains('uncomplete-btn')) {
                this.toggleComplete(taskId);
            } else if (e.target.classList.contains('delete-btn')) {
                this.deleteTask(taskId);
            }
        });
    }

    // Generate unique ID for tasks
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Add new task
    addTask() {
        const text = this.taskInput.value.trim();
        const priority = this.prioritySelect.value;

        // Validate input
        if (!text) {
            this.showError('Please enter a task!');
            return;
        }

        // Create new task
        const newTask = {
            id: this.generateId(),
            text: text,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Add to tasks array
        this.tasks.unshift(newTask);

        // Clear input
        this.taskInput.value = '';
        this.prioritySelect.value = 'low';

        // Save and render
        this.saveTasks();
        this.render();

        // Focus back to input for better UX
        this.taskInput.focus();
    }

    // Toggle task completion
    toggleComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    // Delete task
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.render();
        }
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter button states
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.render();
    }

    // Filter tasks based on current filter and search
    getFilteredTasks() {
        let filtered = this.tasks;

        // Apply status filter
        switch (this.currentFilter) {
            case 'completed':
                filtered = filtered.filter(task => task.completed);
                break;
            case 'pending':
                filtered = filtered.filter(task => !task.completed);
                break;
            default:
                // 'all' - no filtering needed
                break;
        }

        // Apply search filter
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(task => 
                task.text.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    // Render tasks to DOM
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Clear current tasks
        this.taskList.innerHTML = '';

        // Show/hide empty state
        if (filteredTasks.length === 0) {
            this.emptyState.classList.remove('hidden');
            if (this.currentFilter !== 'all' || this.searchInput.value.trim()) {
                this.emptyState.querySelector('p').textContent = 'No tasks match your criteria.';
            } else {
                this.emptyState.querySelector('p').textContent = 'No tasks yet. Add one above!';
            }
        } else {
            this.emptyState.classList.add('hidden');
        }

        // Render each task
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.taskList.appendChild(taskElement);
        });

        // Update stats
        this.updateStats();
    }

    // Create task DOM element
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.taskId = task.id;

        li.innerHTML = `
            <div class="task-content">
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <span class="priority-label priority-${task.priority}">${task.priority}</span>
            </div>
            <div class="task-actions">
                <button class="${task.completed ? 'uncomplete-btn' : 'complete-btn'} task-btn">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="delete-btn task-btn">Delete</button>
            </div>
        `;

        return li;
    }

    // Update task statistics
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
        this.pendingCount.textContent = pending;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show error message
    showError(message) {
        // Create or update error element
        let errorElement = document.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc3545;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }, 3000);
    }

    // Save tasks to localStorage
    saveTasks() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showError('Error saving tasks. Please try again.');
        }
    }

    // Load tasks from localStorage
    loadTasks() {
        try {
            const saved = localStorage.getItem('todoTasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }
}

// CSS animation for error messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});