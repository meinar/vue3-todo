<template>
  <div class="container py-5">
    <h1 class="display-4">Todo List</h1>
    <p class="lead mb-4">
      A simple todo list app built with Vue 3 and Bootstrap 5.
    </p>
    <div class="input-group mb-3">
      <input
        type="text"
        class="form-control form-control-lg"
        placeholder="Add a new task"
        v-model="state.newTaskInput"
        @keydown.enter="addTask"
        ref="newTaskInput"
      />
      <button class="btn btn-primary btn-lg" @click="addTask">Add</button>
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
        :class="{'task--completed': task.completed}"
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
              >
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    v-model="task.completed"
                  />
                  <label
                    class="form-check-label ms-2"
                    :class="{ completed: task.completed }"
                  >
                    {{ task.title }}
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
    <div class="buttons mt-3 d-flex">
      <!-- button to download backup -->
      <button class="btn btn-primary me-2" @click="downloadBackup" :disabled="!state.tasks.length">
        Download Backup
      </button>

      <!-- button to upload backup -->
      <button class="btn btn-primary" @click="uploadBackup">
        Upload Backup
      </button>

      <!-- button to clear completed tasks -->
      <button class="btn btn-danger ms-auto" @click="clearCompleted">
        Clear Completed
      </button>
    </div>

    <div class="card mt-5">
      <div class="card-header">
        <h2 class="card-title h4 mb-0">
          How it works
        </h2>
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
          >, a popular JavaScript framework for building user interfaces. Users can
          create new tasks, mark them as completed, and delete them as needed. Tasks
          are stored locally using the browser's <code>localStorage</code> API, so
          they persist across page refreshes. The app also allows users to drag and
          drop tasks to reorder them, and it includes a
          <em>"Clear Completed"</em> button to remove all completed tasks from the
          list. Additionally, the app includes import/export functionality, allowing
          users to save their task list as a JSON file or load a previously saved
          list into the app.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, onMounted, ref } from "vue";

const localStorage = window.localStorage;

const state = reactive({
  newTaskInput: "",
  tasks: JSON.parse(localStorage.getItem("tasks")) || [],
});

const addTask = () => {
  state.tasks.push({
    title: state.newTaskInput,
    completed: false,
  });
  state.newTaskInput = "";
};

const deleteTask = (index) => {
  state.tasks.splice(index, 1);
};

const clearCompleted = () => {
  state.tasks = state.tasks.filter((task) => !task.completed);
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
    color: grey;
    background-color: #f3f3f3;
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
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0, 0.025);
    }
  }
}
</style>
