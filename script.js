// Tarefas de exemplo em modo tutorial
const initialTasks = [
    {
        id: 1,
        title: "📌 Bem-vindo ao Kanban!",
        description: "Este é seu quadro interativo. Arraste este card para a coluna 'Em Progresso' para ver como funciona.",
        category: "tutorial",
        priority: "medium",
        status: "todo",
    },
    {
        id: 2,
        title: "➕ Adicionar nova tarefa",
        description: "Clique no botão 'Adicionar tarefa' em qualquer coluna para criar uma nova atividade.",
        category: "tutorial",
        priority: "low",
        status: "todo",
    },
    {
        id: 3,
        title: "✏️ Editar ou excluir",
        description: "Use os ícones de lápis e lixeira nos cards para editar ou remover tarefas.",
        category: "tutorial",
        priority: "low",
        status: "todo",
    },
    {
        id: 4,
        title: "📤 Exportar progresso",
        description: "Clique no botão 'Exportar JSON' para salvar suas tarefas e compartilhar com seu mentor.",
        category: "tutorial",
        priority: "medium",
        status: "doing",
    },
    {
        id: 5,
        title: "🎯 Exemplo de tarefa concluída",
        description: "Esta tarefa já foi finalizada. Veja como ela aparece na coluna 'Concluído'.",
        category: "tarefa",
        priority: "high",
        status: "done",
    },
    {
        id: 6,
        title: "💡 Ideia para projeto",
        description: "Use a coluna Backlog para armazenar ideias futuras.",
        category: "ideia",
        priority: "low",
        status: "backlog",
    }
];

let tasks = JSON.parse(localStorage.getItem('kanbanTutorialTasks')) || initialTasks;
let nextId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 7;

// Elementos do DOM
const todoTasks = document.getElementById('todo-tasks');
const doingTasks = document.getElementById('doing-tasks');
const doneTasks = document.getElementById('done-tasks');
const backlogTasks = document.getElementById('backlog-tasks');
const exportBtn = document.getElementById('exportBtn');
const taskModal = document.getElementById('taskModal');
const modalTitle = document.getElementById('modalTitle');
const taskId = document.getElementById('taskId');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskCategory = document.getElementById('taskCategory');
const taskPriority = document.getElementById('taskPriority');
const taskStatus = document.getElementById('taskStatus');
const taskForm = document.getElementById('taskForm');
const closeModal = document.getElementById('closeModal');

// ==================== FUNÇÕES PRINCIPAIS ====================
function saveToLocalStorage() {
    localStorage.setItem('kanbanTutorialTasks', JSON.stringify(tasks));
}

function renderTasks() {
    // Limpar colunas
    todoTasks.innerHTML = '';
    doingTasks.innerHTML = '';
    doneTasks.innerHTML = '';
    backlogTasks.innerHTML = '';

    tasks.forEach(task => {
        const taskEl = createTaskElement(task);
        document.getElementById(`${task.status}-tasks`).appendChild(taskEl);
    });

    updateCounters();
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task';
    div.draggable = true;
    div.dataset.taskId = task.id;

    div.innerHTML = `
        <div class="task-header">
            <span class="task-title">${task.title}</span>
            <span class="task-category">${getCategoryLabel(task.category)}</span>
        </div>
        <div class="task-description">${task.description || ''}</div>
        <div class="task-footer">
            <span class="task-priority priority-${task.priority}">${getPriorityLabel(task.priority)}</span>
            <div class="task-actions">
                <button class="task-btn edit-btn" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                <button class="task-btn delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;

    // Eventos internos
    div.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
    div.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);

    return div;
}

function getCategoryLabel(cat) {
    const map = { tutorial: '📘 Tutorial', tarefa: '📌 Tarefa', ideia: '💡 Ideia' };
    return map[cat] || cat;
}

function getPriorityLabel(prio) {
    const map = { high: 'Alta', medium: 'Média', low: 'Baixa' };
    return map[prio] || prio;
}

function updateCounters() {
    const counts = { todo: 0, doing: 0, done: 0, backlog: 0 };
    tasks.forEach(t => counts[t.status]++);

    document.getElementById('todo-count').textContent = counts.todo;
    document.getElementById('doing-count').textContent = counts.doing;
    document.getElementById('done-count').textContent = counts.done;
    document.getElementById('backlog-count').textContent = counts.backlog;

    document.getElementById('total-tasks').textContent = tasks.length;
    const completed = counts.done;
    document.getElementById('completed-tasks').textContent = completed;
    const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    document.getElementById('progress-percent').textContent = percent + '%';
}

// ==================== DRAG AND DROP ====================
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
    e.target.style.opacity = '0.5';
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
}

// Configurar drop nas colunas
document.querySelectorAll('.tasks').forEach(col => {
    col.addEventListener('dragover', e => e.preventDefault());
    col.addEventListener('drop', e => {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        const newStatus = e.target.closest('.column').dataset.status;
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            saveToLocalStorage();
            renderTasks();
        }
    });
});

// ==================== MODAL (ADICIONAR/EDITAR) ====================
function openModal(title, status = 'todo', task = null) {
    modalTitle.textContent = title;
    if (task) {
        taskId.value = task.id;
        taskTitle.value = task.title;
        taskDescription.value = task.description || '';
        taskCategory.value = task.category;
        taskPriority.value = task.priority;
        taskStatus.value = task.status;
    } else {
        taskId.value = '';
        taskTitle.value = '';
        taskDescription.value = '';
        taskCategory.value = 'tarefa';
        taskPriority.value = 'medium';
        taskStatus.value = status;
    }
    taskModal.style.display = 'flex';
}

function closeModalFn() {
    taskModal.style.display = 'none';
}

// Botões "Adicionar tarefa"
document.querySelectorAll('.add-task').forEach(btn => {
    btn.addEventListener('click', () => openModal('Nova Tarefa', btn.dataset.status));
});

closeModal.addEventListener('click', closeModalFn);
window.addEventListener('click', e => {
    if (e.target === taskModal) closeModalFn();
});

// Salvar tarefa (nova ou editada)
taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const id = taskId.value;
    const taskData = {
        id: id ? parseInt(id) : nextId++,
        title: taskTitle.value,
        description: taskDescription.value,
        category: taskCategory.value,
        priority: taskPriority.value,
        status: taskStatus.value,
    };

    if (id) {
        const index = tasks.findIndex(t => t.id === parseInt(id));
        tasks[index] = taskData;
    } else {
        tasks.push(taskData);
    }
    saveToLocalStorage();
    renderTasks();
    closeModalFn();
});

// ==================== EDITAR E EXCLUIR ====================
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) openModal('Editar Tarefa', task.status, task);
}

function deleteTask(id) {
    if (confirm('Remover esta tarefa?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveToLocalStorage();
        renderTasks();
    }
}

// ==================== EXPORTAR JSON ====================
exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

// ==================== INICIALIZAÇÃO ====================
renderTasks();