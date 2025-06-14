// Function to capture audio from the Podbean podcast player
const capturePodcastAudio = () => {
  // Find the <audio> element on the page
  const podcastAudio = document.querySelector('audio');

  if (podcastAudio) {
    console.log('Podcast player found.');

    // Start transcription when audio starts playing
    podcastAudio.addEventListener('play', () => {
      console.log('Podcast playback started');
      transcribeAudio(podcastAudio);
    });
  } else {
    console.log('No podcast audio element found on this page.');
  }
};

// Transcription function using the Web Speech API
const transcribeAudio = (audioElement) => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.continuous = true;  // Keep transcribing while audio plays
  recognition.interimResults = true;

  // Start the recognition when the audio starts
  recognition.start();

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    // Store the transcription in local storage
    chrome.storage.local.set({ transcription: transcript });
  };

  recognition.onerror = (error) => {
    console.error('Error in transcription:', error);
  };
};

// Start the process of capturing audio when the page loads
capturePodcastAudio();
