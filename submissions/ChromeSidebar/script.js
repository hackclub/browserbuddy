let userName;
let APIKEYValue;
let defaultPromptValue;
let modelTypeValue;

import { GoogleGenerativeAI } from "./gemini.js";

const config = localStorage.getItem('config');

console.log(config);
if (config) {
  const Obj = JSON.parse(config);
  const name = Obj.name;
  const APIKEY = Obj.APIKEY;
  const defaultPrompt = Obj.prompt;
  const modelType = Obj.modelType;

  if (name) {
    console.log(name); 
    userName = name;
  } else {
    console.log('Name is empty.');
    userName = 'You';
  }
  if (APIKEY) {
    console.log(APIKEY);
    APIKEYValue = APIKEY;
  } else {
    console.log('APIKEY is empty.');
    alert('API Key is empty. Please set it in settings.');
  }
  if (defaultPrompt) {
    console.log(defaultPrompt);
    defaultPromptValue = defaultPrompt;
  } else {
    console.log('Default prompt is empty.');
    defaultPromptValue = 'Hello, You are my study assistant.';
  }
  if (modelType) {
    console.log(modelType);
    document.getElementById('modname').innerText = modelType;
    modelTypeValue = modelType;
  } else {
    console.log('Model type is empty.');
    modelTypeValue = 'gemini-1.5-flash';
  }
} else {
  console.log('No config found in localStorage.');
  window.location.href = 'settings.html';
}

function scrollToBottom() {
  const responseaiElement = document.getElementById('responseai');
  responseaiElement.scrollTop = responseaiElement.scrollHeight;
}

const genAI = new GoogleGenerativeAI(APIKEYValue);

async function run() {
  const model = genAI.getGenerativeModel({ model: modelTypeValue });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: defaultPromptValue }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
    generationConfig: {},
  });

  async function sendPrompt() {
    const prompt = document.getElementById('promptInput').value;
    if (!prompt) return;

    try {
      chat._history.push({
        role: "user",
        parts: [{ text: prompt }],
      });
      const result = await chat.sendMessageStream(prompt);
      let text = '';
      const responseaiElement = document.getElementById('responseai');
      responseaiElement.innerText += '✨:\n'
      for await (const chunk of result.stream) {
        const chunkText = await chunk.text();
        console.log(chunkText);
        text += chunkText;
        responseaiElement.innerText += chunkText;
        scrollToBottom();
      }
      chat._history.push({
        role: "model",
        parts: [{ text: text }],
      });
      console.log(chat._history)
    } catch (error) {
      console.error("Error sending message to Google Generative AI:", error);
    }
  }

  document.getElementById('promptInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendPrompt();
      document.getElementById('responseai').innerText += `${userName}:\n ${document.getElementById('promptInput').value}\n`;
      document.getElementById('promptInput').value = '';
    }
  });
}

run();
