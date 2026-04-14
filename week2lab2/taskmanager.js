let tasks = [];
let nextTaskId = 1;

let currentColumn = "todo";
let editingTaskId = null;

const taskCounter = document.getElementById("taskCounter");
const priorityFilter = document.getElementById("priorityFilter");

const todoList = document.getElementById("todoList");
const inprogressList = document.getElementById("inprogressList");
const doneList = document.getElementById("doneList");

const addTaskButtons = document.querySelectorAll(".add-task-btn");
const clearDoneBtn = document.getElementById("clearDoneBtn");

const taskModal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById("taskDescription");
const taskPriorityInput = document.getElementById("taskPriority");
const taskDueDateInput = document.getElementById("taskDueDate");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");

function updateTaskCounter() {
  const count = tasks.length;
  if (count === 1) {
    taskCounter.textContent = "1 Task";
  } else {
    taskCounter.textContent = count + " Tasks";
  }
}

function getListByColumn(columnId) {
  if (columnId === "todo") return todoList;
  if (columnId === "inprogress") return inprogressList;
  return doneList;
}

function getPriorityBadgeClass(priority) {
  if (priority === "high") return "badge-high";
  if (priority === "medium") return "badge-medium";
  return "badge-low";
}

function getPriorityCardClass(priority) {
  if (priority === "high") return "priority-high";
  if (priority === "medium") return "priority-medium";
  return "priority-low";
}

function clearList(listElement) {
  while (listElement.firstChild) {
    listElement.removeChild(listElement.firstChild);
  }
}

function showEmptyMessageIfNeeded(listElement) {
  if (!listElement.firstChild) {
    const emptyItem = document.createElement("li");
    emptyItem.classList.add("empty-text");
    emptyItem.textContent = "No tasks here yet.";
    listElement.appendChild(emptyItem);
  }
}

function removeEmptyMessage(listElement) {
  const firstChild = listElement.firstChild;
  if (firstChild && firstChild.classList.contains("empty-text")) {
    listElement.removeChild(firstChild);
  }
}

function createTaskCard(taskObj) {
  const li = document.createElement("li");
  li.classList.add("task-card");
  li.classList.add(getPriorityCardClass(taskObj.priority));
  li.setAttribute("data-id", String(taskObj.id));
  li.setAttribute("data-priority", taskObj.priority);

  const title = document.createElement("span");
  title.classList.add("task-title");
  title.textContent = taskObj.title;
  title.setAttribute("data-role", "task-title");

  const desc = document.createElement("p");
  desc.classList.add("task-desc");
  if (taskObj.description.trim() === "") {
    desc.textContent = "No description";
  } else {
    desc.textContent = taskObj.description;
  }

  const meta = document.createElement("div");
  meta.classList.add("task-meta");

  const priorityBadge = document.createElement("span");
  priorityBadge.classList.add("priority-badge");
  priorityBadge.classList.add(getPriorityBadgeClass(taskObj.priority));
  priorityBadge.textContent = taskObj.priority;

  const dueDate = document.createElement("span");
  dueDate.classList.add("due-date");
  if (taskObj.dueDate) {
    dueDate.textContent = "Due: " + taskObj.dueDate;
  } else {
    dueDate.textContent = "Due: No due date";
  }

  meta.appendChild(priorityBadge);
  meta.appendChild(dueDate);

  const actions = document.createElement("div");
  actions.classList.add("task-actions");

  const editBtn = document.createElement("button");
  editBtn.classList.add("btn-edit");
  editBtn.setAttribute("data-action", "edit");
  editBtn.setAttribute("data-id", String(taskObj.id));
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("btn-delete");
  deleteBtn.setAttribute("data-action", "delete");
  deleteBtn.setAttribute("data-id", String(taskObj.id));
  deleteBtn.textContent = "Delete";

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(title);
  li.appendChild(desc);
  li.appendChild(meta);
  li.appendChild(actions);

  return li;
}

function addTask(columnId, taskObj) {
  const list = getListByColumn(columnId);
  removeEmptyMessage(list);
  const card = createTaskCard(taskObj);
  list.appendChild(card);
  updateTaskCounter();
  applyPriorityFilter();
}

function deleteTask(taskId) {
  const card = document.querySelector('[data-id="' + taskId + '"]');
  if (!card) return;

  card.classList.add("fade-out");

  setTimeout(function () {
    const index = tasks.findIndex(function (task) {
      return task.id === taskId;
    });

    if (index !== -1) {
      const columnId = tasks[index].column;
      tasks.splice(index, 1);

      const list = getListByColumn(columnId);
      if (card.parentNode) {
        card.parentNode.removeChild(card);
      }

      showEmptyMessageIfNeeded(list);
      updateTaskCounter();
    }
  }, 350);
}

function editTask(taskId) {
  const foundTask = tasks.find(function (task) {
    return task.id === taskId;
  });

  if (!foundTask) return;

  editingTaskId = taskId;
  currentColumn = foundTask.column;

  modalTitle.textContent = "Edit Task";
  taskTitleInput.value = foundTask.title;
  taskDescriptionInput.value = foundTask.description;
  taskPriorityInput.value = foundTask.priority;
  taskDueDateInput.value = foundTask.dueDate;

  openModal();
}

function updateTask(taskId, updatedData) {
  const task = tasks.find(function (item) {
    return item.id === taskId;
  });

  if (!task) return;

  task.title = updatedData.title;
  task.description = updatedData.description;
  task.priority = updatedData.priority;
  task.dueDate = updatedData.dueDate;
  task.column = updatedData.column;

  renderAllTasks();
}

function renderAllTasks() {
  clearList(todoList);
  clearList(inprogressList);
  clearList(doneList);

  tasks.forEach(function (task) {
    const list = getListByColumn(task.column);
    const card = createTaskCard(task);
    list.appendChild(card);
  });

  showEmptyMessageIfNeeded(todoList);
  showEmptyMessageIfNeeded(inprogressList);
  showEmptyMessageIfNeeded(doneList);

  updateTaskCounter();
  applyPriorityFilter();
}

function openModal() {
  taskModal.classList.remove("hidden");
}

function closeModal() {
  taskModal.classList.add("hidden");
  resetModal();
}

function resetModal() {
  modalTitle.textContent = "Add Task";
  taskTitleInput.value = "";
  taskDescriptionInput.value = "";
  taskPriorityInput.value = "high";
  taskDueDateInput.value = "";
  editingTaskId = null;
}

function saveTask() {
  const title = taskTitleInput.value.trim();
  const description = taskDescriptionInput.value.trim();
  const priority = taskPriorityInput.value;
  const dueDate = taskDueDateInput.value;

  if (title === "") {
    alert("Task title is required.");
    taskTitleInput.focus();
    return;
  }

  if (editingTaskId === null) {
    const newTask = {
      id: nextTaskId,
      title: title,
      description: description,
      priority: priority,
      dueDate: dueDate,
      column: currentColumn
    };

    nextTaskId += 1;
    tasks.push(newTask);
    addTask(currentColumn, newTask);
  } else {
    updateTask(editingTaskId, {
      title: title,
      description: description,
      priority: priority,
      dueDate: dueDate,
      column: currentColumn
    });
  }

  closeModal();
}

function applyPriorityFilter() {
  const selectedPriority = priorityFilter.value;
  const cards = document.querySelectorAll(".task-card");

  cards.forEach(function (card) {
    const cardPriority = card.getAttribute("data-priority");
    const shouldHide =
      selectedPriority !== "all" && cardPriority !== selectedPriority;

    card.classList.toggle("is-hidden", shouldHide);
  });
}

function handleColumnClick(event) {
  const action = event.target.getAttribute("data-action");
  const idStr = event.target.getAttribute("data-id");

  if (!action || !idStr) return;

  const taskId = parseInt(idStr, 10);

  if (action === "delete") {
    deleteTask(taskId);
  }

  if (action === "edit") {
    editTask(taskId);
  }
}

function startInlineEdit(titleElement, taskId) {
  const task = tasks.find(function (item) {
    return item.id === taskId;
  });

  if (!task) return;

  const input = document.createElement("input");
  input.type = "text";
  input.value = task.title;
  input.classList.add("inline-edit-input");

  function commitChange() {
    const newValue = input.value.trim();
    if (newValue !== "") {
      task.title = newValue;
    }
    renderAllTasks();
  }

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      commitChange();
    }
  });

  input.addEventListener("blur", function () {
    commitChange();
  });

  if (titleElement.parentNode) {
    titleElement.parentNode.replaceChild(input, titleElement);
    input.focus();
    input.select();
  }
}

function handleTitleDoubleClick(event) {
  const titleElement = event.target.closest('[data-role="task-title"]');
  if (!titleElement) return;

  const parentCard = titleElement.closest(".task-card");
  if (!parentCard) return;

  const taskId = parseInt(parentCard.getAttribute("data-id"), 10);
  startInlineEdit(titleElement, taskId);
}

function clearDoneTasks() {
  const doneTasks = tasks.filter(function (task) {
    return task.column === "done";
  });

  if (doneTasks.length === 0) {
    alert("No done tasks to clear.");
    return;
  }

  doneTasks.forEach(function (task, index) {
    setTimeout(function () {
      const card = doneList.querySelector('[data-id="' + task.id + '"]');
      if (card) {
        card.classList.add("fade-out");
      }
    }, index * 100);
  });

  setTimeout(function () {
    tasks = tasks.filter(function (task) {
      return task.column !== "done";
    });

    renderAllTasks();
  }, doneTasks.length * 100 + 400);
}

function setupAddTaskButtons() {
  addTaskButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentColumn = button.getAttribute("data-column");
      editingTaskId = null;
      modalTitle.textContent = "Add Task";
      openModal();
    });
  });
}

function seedSampleTasks() {
  tasks.push({
    id: nextTaskId++,
    title: "Finish DOM lab",
    description: "Complete all task board requirements",
    priority: "high",
    dueDate: "2026-04-20",
    column: "todo"
  });

  tasks.push({
    id: nextTaskId++,
    title: "Revise JavaScript",
    description: "Practice event delegation and DOM methods",
    priority: "medium",
    dueDate: "2026-04-21",
    column: "inprogress"
  });

  tasks.push({
    id: nextTaskId++,
    title: "Submit lab",
    description: "Record screen and upload files",
    priority: "low",
    dueDate: "2026-04-22",
    column: "done"
  });
}

function init() {
  setupAddTaskButtons();

  saveTaskBtn.addEventListener("click", saveTask);
  cancelTaskBtn.addEventListener("click", closeModal);

  priorityFilter.addEventListener("change", applyPriorityFilter);

  todoList.addEventListener("click", handleColumnClick);
  inprogressList.addEventListener("click", handleColumnClick);
  doneList.addEventListener("click", handleColumnClick);

  todoList.addEventListener("dblclick", handleTitleDoubleClick);
  inprogressList.addEventListener("dblclick", handleTitleDoubleClick);
  doneList.addEventListener("dblclick", handleTitleDoubleClick);

  clearDoneBtn.addEventListener("click", clearDoneTasks);

  taskModal.addEventListener("click", function (event) {
    if (event.target === taskModal) {
      closeModal();
    }
  });

  seedSampleTasks();
  renderAllTasks();
}

init();