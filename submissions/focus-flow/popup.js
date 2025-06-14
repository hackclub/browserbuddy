class FocusFlow {
  constructor() {
    this.initializeElements();
    this.initializeEventListeners();
    this.loadSettings();
    this.initializePomodoro();
    this.initializeTaskList();
    this.apiKeyInput = document.getElementById("apiKeyInput");
    this.apiKeyError = document.getElementById("apiKeyError");
    this.apiKeyStatus = document.getElementById("apiKeyStatus");
    this.saveApiKeyButton = document.getElementById("saveApiKey");
    this.initializeApiKey();

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === "sync" && changes.pomodoroState) {
        const newState = changes.pomodoroState.newValue;
        if (newState) {
          this.timeLeft = newState.timeLeft;
          this.isBreak = newState.isBreak;
          this.isRunning = newState.isRunning;
          this.updateTimerDisplay();
        }
      }
    });
  }

  initializeElements() {
    this.flowToggle = document.getElementById("flowToggle");
    this.statusDiv = document.getElementById("status");
    this.tabButtons = document.querySelectorAll(".tab-btn");
    this.tabContents = document.querySelectorAll(".tab-content");

    // Timer
    this.timerDisplay = document.getElementById("timeDisplay");
    this.startButton = document.getElementById("startTimer");
    this.resetButton = document.getElementById("resetTimer");
    this.workDuration = document.getElementById("workDuration");
    this.breakDuration = document.getElementById("breakDuration");

    // Tasks
    this.tasksContainer = document.getElementById("tasksContainer");
    this.addTaskButton = document.getElementById("addTask");

    this.currentFocusContainer = document.getElementById(
      "currentFocusContainer"
    );

    this.timerStatus = document.getElementById("timerStatus");
  }

  initializeEventListeners() {
    this.flowToggle.addEventListener("change", () => this.updateFlowStatus());

    // Switching Tabs
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        this.tabButtons.forEach((btn) => btn.classList.remove("active"));
        this.tabContents.forEach((content) =>
          content.classList.remove("active")
        );

        button.classList.add("active");
        document
          .getElementById(`${button.dataset.tab}-tab`)
          .classList.add("active");
      });
    });
  }

  async loadSettings() {
    const settings = await chrome.storage.sync.get([
      "isEnabled",
      "currentTask",
      "tasks",
      "pomodoroState",
    ]);
    this.flowToggle.checked = settings.isEnabled ?? false;

    if (settings.tasks) {
      settings.tasks.forEach((task) => this.createTaskElement(task));
    }

    if (settings.pomodoroState) {
      this.restorePomodoroState(settings.pomodoroState);
    }

    this.updateFlowStatus();
  }

  restorePomodoroState(state) {
    this.timeLeft = state.timeLeft;
    this.isBreak = state.isBreak;
    this.isRunning = state.isRunning;
    this.workDuration.value = state.workDuration;
    this.breakDuration.value = state.breakDuration;

    this.updateTimerDisplay();

    if (this.isRunning) {
      this.startTimer();
    } else {
      this.startButton.textContent = "Start";
    }
  }

  async updateFlowStatus() {
    const isEnabled = this.flowToggle.checked;
    const settings = await chrome.storage.sync.get("apiKey");

    if (isEnabled && !settings.apiKey) {
      this.flowToggle.checked = false;
      alert("Please add an API key in Settings before enabling Focus Flow");

      this.tabButtons.forEach((btn) => btn.classList.remove("active"));
      this.tabContents.forEach((content) => content.classList.remove("active"));

      const settingsTab = document.querySelector('[data-tab="settings"]');
      settingsTab.classList.add("active");
      document.getElementById("settings-tab").classList.add("active");
      return;
    }

    // Testing the API Key
    if (isEnabled) {
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${settings.apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4",
              messages: [{ role: "user", content: "test" }],
            }),
          }
        );

        if (!response.ok) {
          this.flowToggle.checked = false;
          alert(
            "Your API key appears to be invalid. Please update it in Settings."
          );
          return;
        }
      } catch (error) {
        this.flowToggle.checked = false;
        alert(
          "Your API key appears to be invalid. Please update it in Settings."
        );
        return;
      }
    }

    await chrome.storage.sync.set({ isEnabled });
    this.statusDiv.textContent = isEnabled
      ? "Focus Mode: On"
      : "Focus Mode: Off";
    this.statusDiv.className = `status ${isEnabled ? "active" : "inactive"}`;

    if (isEnabled) {
      this.isRunning = true;
      this.startButton.textContent = "Pause";
      chrome.runtime.sendMessage({ type: "START_TIMER" });
      this.savePomodoroState();
    } else {
      this.isRunning = false;
      this.isBreak = false;
      this.timeLeft = parseInt(this.workDuration.value) * 60;
      this.startButton.textContent = "Start";
      chrome.runtime.sendMessage({ type: "RESET_TIMER" });
      this.updateTimerDisplay();
      this.savePomodoroState();
    }
  }

  // Pomodoro Timer
  initializePomodoro() {
    this.isRunning = false;
    this.timeLeft = parseInt(this.workDuration.value) * 60;
    this.isBreak = false;

    this.startButton.addEventListener("click", () => this.toggleTimer());
    this.resetButton.addEventListener("click", () => this.resetTimer());
    this.workDuration.addEventListener("change", () => this.resetTimer());
    this.breakDuration.addEventListener("change", () => this.resetTimer());

    if (this.flowToggle.checked) {
      this.startTimer();
    }

    this.updateTimerDisplay();
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isRunning = true;
    this.startButton.textContent = "Pause";
    chrome.runtime.sendMessage({ type: "START_TIMER" });
    this.savePomodoroState();
  }

  pauseTimer() {
    this.isRunning = false;
    this.startButton.textContent = "Start";
    chrome.runtime.sendMessage({ type: "PAUSE_TIMER" });
    this.savePomodoroState();
  }

  updateTimer() {
    if (this.timeLeft > 0) {
      this.timeLeft--;
      this.updateTimerDisplay();
      this.savePomodoroState();
    } else {
      this.handleTimerComplete();
    }
  }

  handleTimerComplete() {
    this.isBreak = !this.isBreak;
    this.timeLeft =
      (this.isBreak
        ? parseInt(this.breakDuration.value)
        : parseInt(this.workDuration.value)) * 60;
    this.updateTimerDisplay();
    this.savePomodoroState();

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "TIMER_COMPLETE",
          message: this.isBreak
            ? "Time for a break!"
            : "Your break time is over!",
        });
      }
    });
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.timerDisplay.textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    this.timerStatus.textContent = this.isBreak ? "Break Time" : "Work Time";
  }

  resetTimer() {
    this.isRunning = false;
    this.isBreak = false;
    this.timeLeft = parseInt(this.workDuration.value) * 60;
    this.startButton.textContent = "Start";
    chrome.runtime.sendMessage({ type: "RESET_TIMER" });
    this.updateTimerDisplay();
    this.savePomodoroState();
  }

  savePomodoroState() {
    chrome.storage.sync.set({
      pomodoroState: {
        timeLeft: this.timeLeft,
        isBreak: this.isBreak,
        isRunning: this.isRunning,
        workDuration: parseInt(this.workDuration.value),
        breakDuration: parseInt(this.breakDuration.value),
      },
    });
  }

  // Task List
  initializeTaskList() {
    this.addTaskButton.addEventListener("click", () => this.addTask());

    this.tasksContainer.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("task-item")) {
        e.target.classList.add("dragging");
      }
    });

    this.tasksContainer.addEventListener("dragend", (e) => {
      if (e.target.classList.contains("task-item")) {
        e.target.classList.remove("dragging");
        this.saveTasks();
      }
    });

    this.tasksContainer.addEventListener("dragover", (e) => {
      e.preventDefault();
      const draggable = document.querySelector(".task-item.dragging");
      if (!draggable) return;

      const afterElement = this.getDragAfterElement(
        this.tasksContainer,
        e.clientY
      );
      if (afterElement) {
        this.tasksContainer.insertBefore(draggable, afterElement);
      } else {
        this.tasksContainer.appendChild(draggable);
      }
    });
  }

  addTask() {
    const taskText = prompt("Enter task:");
    if (taskText?.trim()) {
      this.createTaskElement({ text: taskText, pinned: false });
      this.saveTasks();
    }
  }

  createTaskElement(task) {
    const taskElement = document.createElement("div");
    taskElement.className = "task-item";
    taskElement.draggable = true;

    const text = document.createElement("span");
    text.textContent = task.text;

    const pinButton = document.createElement("button");
    pinButton.className = `pin-button ${task.pinned ? "pinned" : ""}`;
    pinButton.innerHTML = "📌";
    pinButton.addEventListener("click", () => this.togglePin(taskElement));

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.innerHTML = "×";
    deleteButton.addEventListener("click", () => {
      taskElement.remove();
      this.saveTasks();
    });

    taskElement.appendChild(text);
    taskElement.appendChild(pinButton);
    taskElement.appendChild(deleteButton);

    if (task.pinned) {
      this.setCurrentFocus(taskElement);
    } else {
      this.tasksContainer.appendChild(taskElement);
    }
  }

  togglePin(taskElement) {
    const pinButton = taskElement.querySelector(".pin-button");
    const isPinned = pinButton.classList.contains("pinned");

    if (!isPinned) {
      this.setCurrentFocus(taskElement);
    } else {
      this.removeCurrentFocus();
    }

    this.saveTasks();
    this.updateFlowStatus();
  }

  setCurrentFocus(taskElement) {
    this.removeCurrentFocus();
    taskElement.querySelector(".pin-button").classList.add("pinned");
    this.currentFocusContainer.appendChild(taskElement);
  }

  removeCurrentFocus() {
    const currentFocus = this.currentFocusContainer.querySelector(".task-item");
    if (currentFocus) {
      currentFocus.querySelector(".pin-button").classList.remove("pinned");
      this.tasksContainer.appendChild(currentFocus);
    }
  }

  getPinnedTask() {
    const pinnedElement =
      this.currentFocusContainer.querySelector(".task-item");
    if (pinnedElement) {
      return { text: pinnedElement.querySelector("span").textContent };
    }
    return null;
  }

  getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".task-item:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  async saveTasks() {
    const tasks = Array.from(this.tasksContainer.children).map(
      (taskElement) => ({
        text: taskElement.querySelector("span").textContent,
        pinned: false,
      })
    );

    const currentFocus = this.currentFocusContainer.querySelector(".task-item");
    if (currentFocus) {
      tasks.push({
        text: currentFocus.querySelector("span").textContent,
        pinned: true,
      });
    }

    await chrome.storage.sync.set({ tasks });
  }

  async initializeApiKey() {
    const settings = await chrome.storage.sync.get("apiKey");
    if (settings.apiKey) {
      this.apiKeyInput.value = settings.apiKey;
    }

    this.saveApiKeyButton.addEventListener("click", async () => {
      const apiKey = this.apiKeyInput.value.trim();

      await chrome.storage.sync.set({ apiKey });
      this.apiKeyStatus.textContent = "API key saved!";

      const isEnabled = await chrome.storage.sync.get("isEnabled");
      if (isEnabled.isEnabled) {
        this.flowToggle.checked = false;
        await this.updateFlowStatus();
      }

      if (apiKey) {
        this.apiKeyError.textContent = "";
        this.apiKeyStatus.textContent = "Checking API key...";
        this.saveApiKeyButton.disabled = true;

        try {
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: "test" }],
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Invalid API key");
          }

          this.apiKeyError.textContent = "";
          this.apiKeyStatus.textContent = "API key is valid!";
        } catch (error) {
          this.apiKeyError.textContent =
            "Warning: This API key appears to be invalid";
        } finally {
          this.saveApiKeyButton.disabled = false;
          setTimeout(() => {
            this.apiKeyStatus.textContent = "";
          }, 3000);
        }
      }
    });

    this.apiKeyInput.addEventListener("input", () => {
      this.apiKeyError.textContent = "";
      this.apiKeyStatus.textContent = "";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FocusFlow();
});
