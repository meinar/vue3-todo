<template>
  <div class="container py-5">
    <h1 class="display-4">Todo List</h1>
    <p class="lead mb-4">
      A simple todo app aiming to be as unobtrusive as possible, allowing you to focus on your tasks and be as productive as possible.
    </p>
    <div class="input-group mb-3">
      <input
        type="text"
        class="form-control form-control-lg"
        placeholder="Add a new task"
        v-model="state.newTaskInput"
        @keydown.enter="addTask"
        @keyup.enter="addTask"
        ref="newTaskInput"
      />
      <button
        class="btn btn-primary btn-lg"
        @click="addTask"
        :disabled="!state.newTaskInput"
      >
        Add
      </button>
    </div>

    <div v-if="categories.length" class="categories">
      Categories:
      <span
        class="category badge bg-primary me-2"
        v-for="(category, index) in categories"
        :key="index"
      >
        {{ category }}
      </span>
    </div>
    <div class="tasks mt-4">
      <div
        class="card task mb-3"
        v-for="(task, index) in state.tasks"
        :key="index"
        :draggable="true"
        @dragstart="dragStartHandler(index)"
        @dragover.prevent
        @drop="dropHandler(index)"
        :class="{ 'task--completed': task.completed }"
      >
        <div class="card-body p-0">
          <div class="row">
            <div class="col d-flex">
              <div class="handle p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-three-dots-vertical"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5z"
                  />
                </svg>
              </div>
              <div
                class="form-check__wrapper p-3 flex-grow-1"
                @click="task.completed = !task.completed"
                :title="`Created at ${dateIsoStringToDate(task.createdAt)}`"
              >
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    v-model="task.completed"
                  />
                  <label
                    class="form-check-label ms-2 d-block"
                    :class="{ completed: task.completed }"
                  >
                    {{ task.title }}

                    <span v-if="task.category" class="badge bg-primary ms-2">
                      {{ task.category }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div class="col col-auto" v-if="task.completed && false">
              <button
                class="btn btn-sm btn-danger m-3"
                @click="deleteTask(index)"
                :disabled="!task.completed"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="buttons mt-3 mb-5 d-flex">

      <div class="btn-group btn-group-sm" role="group">
        <button
          class="btn btn-outline-primary"
          @click="downloadBackup"
          :disabled="!state.tasks.length"
        >
          <i class="bi bi-download me-1" />
          Download Backup
        </button>

        <button class="btn btn-outline-primary" @click="uploadBackup">
          <i class="bi bi-upload me-1" />
          Upload Backup
        </button>
      </div>

      <button class="btn btn-danger ms-auto" @click="clearCompleted">
        <i class="bi bi-trash3-fill me-1" />
        Clear Completed
      </button>
    </div>

    <div class="card my-3">
      <div class="card-header">
        <h2 class="card-title h4 mb-0">How to use</h2>
      </div>
      <div class="card-body">
        <p>
          To add a regular to-do task to the app, simply type the task into the
          input field and hit enter.
        </p>

        <p class="mb-0">
          To add a category to your to-do task, simply add a colon (<code>:</code>) after the
          category name, followed by a space, and then type in the task name.
          For example, if you want to add a task with the category "work", you
          would type "work: task name" into the input field and hit enter. The
          task will be added to the to-do list with the category "work".
        </p>
      </div>
    </div>

    <div class="card my-3">
      <div class="card-header">
        <h2 class="card-title h4 mb-0">How it works</h2>
      </div>
      <div class="card-body">
        <p class="mb-0">
          The Todo app is a simple task manager built using
          <a
            href="https://vuejs.org/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-decoration-none"
            >Vue.js</a
          >, a popular JavaScript framework for building user interfaces. Users
          can create new tasks, mark them as completed, and delete them as
          needed. Tasks are stored locally using the browser's
          <code>localStorage</code> API, so they persist across page refreshes.
          The app also allows users to drag and drop tasks to reorder them, and
          it includes a <em>"Clear Completed"</em> button to remove all
          completed tasks from the list. Additionally, the app includes
          import/export functionality, allowing users to save their task list as
          a JSON file or load a previously saved list into the app.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, onMounted, ref, inject, computed } from "vue";
import debounce from "lodash/debounce";

const limit = (fn) => debounce(fn, 1500, { leading: true, trailing: false });
const toast = inject("toast");
const localStorage = window.localStorage;

const createTask = (task) => {
  // everything before : is the category
  const category = task.includes(":") ? task.split(":")[0].trim() : null;
  const title = task.includes(":") ? task.split(":")[1].trim() : task;

  return {
    title,
    completed: false,
    createdAt: new Date().toISOString(),
    category,
  };
};

const categories = computed(() => {
  const categories = state.tasks
    .map((task) => task.category)
    .filter((categroy) => categroy);
  return [...new Set(categories)];
});

const state = reactive({
  newTaskInput: "",
  tasks: JSON.parse(localStorage.getItem("tasks")) || [],
});

// uses browser's locale to format date and time
const dateIsoStringToDate = (dateString) => {
  const dateObject = new Date(dateString);
  const time = dateObject.toLocaleTimeString();
  const date = dateObject.toLocaleDateString();

  return `${date} ${time}`;
};

const addTask = limit(() => {
  if (!state.newTaskInput) {
    return;
  }

  // check if task already exists, ignore case
  const taskExists = state.tasks.some(
    (task) => task.title.toLowerCase() === state.newTaskInput.toLowerCase()
  );

  if (taskExists) {
    toast.warning("Task already exists");
    return;
  }

  state.tasks.push(createTask(state.newTaskInput));
  state.newTaskInput = "";

  toast.success("Task added successfully");
});

const deleteTask = (index) => {
  state.tasks.splice(index, 1);
  toast.success("Task deleted successfully");
};

const clearCompleted = () => {
  state.tasks = state.tasks.filter((task) => !task.completed);
  toast.success("All completed tasks deleted successfully");
};

const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(state.tasks));
};

const dragStartHandler = (index) => {
  state.draggedIndex = index;
};

const dropHandler = (index) => {
  if (state.draggedIndex === index) {
    return;
  }
  const taskToMove = state.tasks[state.draggedIndex];
  state.tasks.splice(state.draggedIndex, 1);
  state.tasks.splice(index, 0, taskToMove);
};

const downloadBackup = () => {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(state.tasks));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "tasks.json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();

  toast.success("Backup downloaded successfully");
};

const mergeTasks = (tasks) => {
  // check if tasks are identical, if so, notify user and skip
  if (JSON.stringify(state.tasks) === JSON.stringify(tasks)) {
    alert("Backup is identical to current tasks.");
    return;
  }

  const newTasks = [];
  for (const task of tasks) {
    const existingTask = state.tasks.find(
      (existingTask) => existingTask.title === task.title
    );

    // skip existing tasks with the same completed status
    if (existingTask && existingTask.completed === task.completed) {
      continue;
    }

    if (existingTask) {
      existingTask.completed = confirm(
        `Task "${task.title}" already exists, but has a different completed status. Do you want to complete it?`
      );
    } else {
      newTasks.push(task);
    }
  }

  state.tasks = [...state.tasks, ...newTasks];
};

// upload backup and try to merge it with existing tasks
const uploadBackup = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const tasks = JSON.parse(e.target.result);
      mergeTasks(tasks);
    };
    reader.readAsText(file);
  };
  input.click();

  toast.success("Backup uploaded successfully");
};

const newTaskInput = ref(null);

onMounted(() => {
  state.newTaskInput = "";
  newTaskInput.value.focus();
});

watch(
  () => state.tasks,
  () => saveTasks(),
  { deep: true }
);
</script>

<style lang="scss" scoped>
.completed {
  text-decoration: line-through;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.task {
  cursor: move;
  overflow: hidden;
  position: relative;

  &--completed {
    opacity: 0.5;
  }
}

.form-check__wrapper {
  &,
  label,
  input {
    cursor: pointer;
  }

  &:hover {
    &:after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.03);
    }
  }
}
</style>
