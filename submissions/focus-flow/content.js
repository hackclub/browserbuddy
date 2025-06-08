let overlay = null;
let explanationOverlay = null;

function createOverlay(task, pomodoroState) {
  if (overlay) {
    document.body.removeChild(overlay);
  }

  overlay = document.createElement("div");
  overlay.className = "focus-flow-overlay";

  const content = document.createElement("div");
  content.className = "focus-flow-content";

  const icon = document.createElement("div");
  icon.className = "focus-flow-icon";
  icon.innerHTML = "🎯";

  const title = document.createElement("h1");
  title.textContent = "Stay Focused!";

  const message = document.createElement("p");
  const timerMessage = pomodoroState
    ? `\n\nYou have ${Math.floor(pomodoroState.timeLeft / 60)}:${String(
        pomodoroState.timeLeft % 60
      ).padStart(2, "0")} minutes left in your ${
        pomodoroState.isBreak ? "break" : "work session"
      }!`
    : "";
  message.textContent = `This page isn't relevant to your current task: ${task}. ${timerMessage}`;

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  const backButton = document.createElement("button");
  backButton.textContent = "Go Back";
  backButton.onclick = () => window.history.back();

  const explainButton = document.createElement("button");
  explainButton.textContent = "Explain Why I Need This";
  explainButton.className = "secondary";
  explainButton.onclick = () => showExplanationForm(task);

  buttonContainer.appendChild(backButton);
  buttonContainer.appendChild(explainButton);

  content.appendChild(icon);
  content.appendChild(title);
  content.appendChild(message);
  content.appendChild(buttonContainer);
  overlay.appendChild(content);

  document.body.appendChild(overlay);
}

function showExplanationForm(task) {
  if (explanationOverlay) {
    document.body.removeChild(explanationOverlay);
  }

  explanationOverlay = document.createElement("div");
  explanationOverlay.className = "focus-flow-overlay explanation";

  const content = document.createElement("div");
  content.className = "focus-flow-content";

  const title = document.createElement("h2");
  title.textContent = "Explain Your Need";

  const form = document.createElement("form");
  form.onsubmit = (e) => {
    e.preventDefault();
    handleExplanation(e, task);
  };

  const textarea = document.createElement("textarea");
  textarea.placeholder =
    "Please explain why this website is relevant to your current task...";
  textarea.required = true;
  textarea.rows = 4;
  textarea.style.whiteSpace = "pre-wrap";

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Submit";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";
  cancelButton.className = "secondary";
  cancelButton.onclick = () => {
    if (explanationOverlay) {
      document.body.removeChild(explanationOverlay);
      explanationOverlay = null;
    }
  };

  buttonContainer.appendChild(submitButton);
  buttonContainer.appendChild(cancelButton);

  form.appendChild(textarea);
  form.appendChild(buttonContainer);

  content.appendChild(title);
  content.appendChild(form);
  explanationOverlay.appendChild(content);

  document.body.appendChild(explanationOverlay);
}

async function handleExplanation(e, task) {
  e.preventDefault();
  const explanation = e.target.querySelector("textarea").value;

  const result = await chrome.runtime.sendMessage({
    type: "CHECK_EXPLANATION",
    url: window.location.href,
    task,
    explanation,
  });

  if (result.approved) {
    if (overlay) {
      document.body.removeChild(overlay);
      overlay = null;
    }
    if (explanationOverlay) {
      document.body.removeChild(explanationOverlay);
      explanationOverlay = null;
    }
    showNotification("Access granted based on your explanation");
  } else {
    alert("Your explanation was not sufficient. The website remains blocked.");
    if (explanationOverlay) {
      document.body.removeChild(explanationOverlay);
      explanationOverlay = null;
    }
  }
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "focus-flow-notification";

  const icon = document.createElement("span");
  icon.textContent = "✨";

  const messageSpan = document.createElement("span");
  messageSpan.textContent = message;

  notification.appendChild(icon);
  notification.appendChild(messageSpan);

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

async function checkPage() {
  const settings = await chrome.storage.sync.get([
    "isEnabled",
    "tasks",
    "pomodoroState",
  ]);

  if (!settings.isEnabled) {
    if (overlay) {
      document.body.removeChild(overlay);
      overlay = null;
    }
    if (explanationOverlay) {
      document.body.removeChild(explanationOverlay);
      explanationOverlay = null;
    }
    return;
  }

  // Allows all websites during break time
  if (settings.pomodoroState?.isBreak) {
    if (overlay) {
      document.body.removeChild(overlay);
      overlay = null;
    }
    return;
  }

  const currentFocus = settings.tasks.find((task) => task.pinned);
  if (!currentFocus) {
    return;
  }

  try {
    const result = await chrome.runtime.sendMessage({
      type: "CHECK_RELEVANCE",
      url: window.location.href,
      task: currentFocus.text,
    });

    if (!result.relevant) {
      createOverlay(currentFocus.text, settings.pomodoroState);
    } else {
      showNotification("This website is relevant to your task!");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkPage();

let lastUrl = window.location.href;
new MutationObserver(() => {
  if (lastUrl !== window.location.href) {
    lastUrl = window.location.href;
    checkPage();
  }
}).observe(document, { subtree: true, childList: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TIMER_COMPLETE") {
    showNotification(message.message);
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.pomodoroState) {
    const newState = changes.pomodoroState.newValue;
    if (newState?.isBreak && overlay) {
      document.body.removeChild(overlay);
      overlay = null;
    } else if (changes.pomodoroState.oldValue?.isBreak && !newState?.isBreak) {
      checkPage();
    }
  }
});
