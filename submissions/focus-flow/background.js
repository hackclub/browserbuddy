let timerInterval = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CHECK_RELEVANCE") {
    checkRelevance(message.url, message.task)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  }

  if (message.type === "CHECK_EXPLANATION") {
    checkExplanation(message.url, message.task, message.explanation)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  }

  if (message.type === "START_TIMER") {
    startTimer();
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "PAUSE_TIMER") {
    pauseTimer();
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "RESET_TIMER") {
    resetTimer();
    sendResponse({ success: true });
    return true;
  }
});

// Timer
async function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  const settings = await chrome.storage.sync.get("pomodoroState");
  if (!settings.pomodoroState) return;

  timerInterval = setInterval(async () => {
    const current = await chrome.storage.sync.get("pomodoroState");
    if (!current.pomodoroState) return;

    const newState = { ...current.pomodoroState };

    if (newState.timeLeft > 0) {
      newState.timeLeft--;
      await chrome.storage.sync.set({ pomodoroState: newState });
    } else {
      await handleTimerComplete();
    }
  }, 1000);
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

async function resetTimer() {
  pauseTimer();
  const settings = await chrome.storage.sync.get("pomodoroState");
  if (!settings.pomodoroState) return;

  const newState = {
    ...settings.pomodoroState,
    timeLeft: settings.pomodoroState.workDuration * 60,
    isBreak: false,
    isRunning: false,
  };

  await chrome.storage.sync.set({ pomodoroState: newState });
}

async function handleTimerComplete() {
  const settings = await chrome.storage.sync.get("pomodoroState");
  if (!settings.pomodoroState) return;

  const newState = {
    ...settings.pomodoroState,
    isBreak: !settings.pomodoroState.isBreak,
    timeLeft:
      (!settings.pomodoroState.isBreak
        ? settings.pomodoroState.breakDuration
        : settings.pomodoroState.workDuration) * 60,
  };

  await chrome.storage.sync.set({ pomodoroState: newState });

  const tabs = await chrome.tabs.query({});
  tabs.forEach((tab) => {
    chrome.tabs
      .sendMessage(tab.id, {
        type: "TIMER_COMPLETE",
        message: newState.isBreak
          ? "Time for a break!"
          : "Break's over! Back to work!",
      })
      .catch(() => {});
  });
}

async function checkRelevance(url, task) {
  try {
    const settings = await chrome.storage.sync.get("apiKey");
    if (!settings.apiKey) {
      return { relevant: false, error: "No API key found" };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that determines if a webpage is relevant to a user's current calendar event. Respond with a JSON object containing a 'relevant' key with a boolean value.",
          },
          {
            role: "user",
            content: `Current event: "${task}". Webpage URL: ${url}. Is this webpage relevant to the event? Be strict on this - if there is a website that may not be relevant, such as youtube for "study for test", return false. However, don't be overly strict - websites like google are fine, since the user will search on there.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    const relevanceResponse = JSON.parse(data.choices[0].message.content);
    return { relevant: relevanceResponse.relevant };
  } catch (error) {
    console.error("Error checking relevance:", error);
    return { relevant: false, error: error.message };
  }
}

async function checkExplanation(url, task, explanation) {
  try {
    const settings = await chrome.storage.sync.get("apiKey");
    if (!settings.apiKey) {
      return { approved: false, error: "No API key found" };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a strict productivity assistant that evaluates if a user's explanation for needing to access a blocked website is valid and relevant to their current task. Respond with a JSON object containing an 'approved' key with a boolean value.",
          },
          {
            role: "user",
            content: `Current task: "${task}". Website URL: ${url}. User's explanation: "${explanation}". Is this explanation valid and does it justify accessing this website for their current task?`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    const explanationResponse = JSON.parse(data.choices[0].message.content);
    return { approved: explanationResponse.approved };
  } catch (error) {
    console.error("Error checking explanation:", error);
    return { approved: false, error: error.message };
  }
}
