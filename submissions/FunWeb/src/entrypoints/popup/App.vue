<script lang="ts" setup>
import { ref } from "vue";

const feedbackMessage = ref(""); // Feedback message state

const sendMessage = (action: string) => {
  chrome.runtime.sendMessage({action: action})
}
const sendScriptToBackground = (scriptName: string) => {
  chrome.runtime.sendMessage({
    action: "executeFunScript",
    scriptName,
  });
  // Display feedback message
  feedbackMessage.value = `Feature "${scriptName}" applied!`;
  setTimeout(() => (feedbackMessage.value = ""), 3000); // Clear message after 3 seconds
};
</script>

<template>
  <div
       class="popup-container bg-gray-900 text-white min-h-[300px] max-h-[400px] w-[300px] rounded-lg shadow-lg p-4 flex flex-col items-center space-y-4">
    <!-- Feedback UI -->
    <p v-if="feedbackMessage"
       class="feedback text-green-400 font-semibold text-sm">
      {{ feedbackMessage }}
    </p>

    <!-- Button List -->
    <ul class="button-list w-full space-y-2">
      <li>
        <button @click="sendScriptToBackground('upsideDownWeb')"
                class="fun-button">Upside Down Web</button>
      </li>
      <li>
        <button @click="sendScriptToBackground('noVisualStuff')"
                class="fun-button">No Visual Stuff</button>
      </li>
      <li>
        <button @click="sendScriptToBackground('shakeOnType')"
                class="fun-button">Shake on Type</button>
      </li>
      <li>
        <button @click="sendScriptToBackground('blockyWeb')"
                class="fun-button">Blocky Web</button>
      </li>
      <li>
        <button @click="sendScriptToBackground('terminalWeb')"
                class="fun-button">Terminal Web</button>
      </li>
    </ul>
    <button @click="sendMessage('reloadTab')"
            class="mt-4 bg-blue-500 text-white p-2 rounded w-full">Undo Changes (reload)</button>

  </div>
</template>

<style scoped>
.button-list {
  list-style-type: none; /* Remove default list styling */
  padding: 0; /* Remove padding */
}

.fun-button {
  width: 100%; /* Make buttons full width */
  padding: 10px; /* Add padding for better touch targets */
  background-color: #4a4a4a; /* Button background color */
  border: none; /* Remove border */
  border-radius: 5px; /* Rounded corners */
  cursor: pointer; /* Pointer cursor on hover */
  transition: background-color 0.3s; /* Smooth background color transition */
}

.fun-button:hover {
  background-color: #6a6a6a; /* Darker background on hover */
}
</style>
