<template>
  <div class="d-flex justify-content-end">
    <div class="btn-group btn-group-sm" role="group">
      <button
        type="button"
        class="btn btn-primary"
        :class="{ active: theme === 'light' }"
        data-bs-theme-value="light"
        @click="setTheme('light')"
        title="Light mode"
      >
        <i class="bi bi-sun-fill"></i>
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :class="{ active: theme === 'dark' }"
        data-bs-theme-value="dark"
        @click="setTheme('dark')"
        title="Dark mode"
      >
        <i class="bi bi-moon-stars-fill"></i>
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :class="{ active: theme === 'auto' }"
        data-bs-theme-value="auto"
        @click="setTheme('auto')"
        title="Auto mode"
      >
        <i class="bi bi-circle-half"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const storedTheme = localStorage.getItem("theme");

const getPreferredTheme = () => {
  if (storedTheme) {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const theme = ref(getPreferredTheme());

function setTheme(value) {
  theme.value = value;
  localStorage.setItem("theme", value);
  if (
    value === "auto" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-bs-theme", value);
  }
}

function showActiveTheme(value) {
  // Do nothing in Vue 3 as we're using a ref instead of updating a DOM element
}

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (storedTheme !== "light" || storedTheme !== "dark") {
      theme.value = getPreferredTheme();
      setTheme(theme.value);
    }
  });
</script>
