const exercises = {
    math: [
        { question: "What is 5 + 7?", answer: "12" },
        { question: "What is 9 x 3?", answer: "27" }
    ],
    memory: [
        { question: "Repeat: apple, banana, cherry", answer: "apple, banana, cherry" }
    ],
    vocabulary: [
        { question: "What is a synonym of 'happy'?", answer: "joyful" }
    ]
};

let currentSkill = "";
let currentExercise = {};

document.getElementById('startBtn').addEventListener('click', () => {
    currentSkill = document.getElementById('skillSelector').value;
    const randomIndex = Math.floor(Math.random() * exercises[currentSkill].length);
    currentExercise = exercises[currentSkill][randomIndex];

    document.getElementById('exerciseArea').innerHTML = `
        <p>${currentExercise.question}</p>
        <input type="text" id="answerInput" />
        <button id="submitAnswer">Submit</button>
        <p id="feedback"></p>
    `;

    document.getElementById('submitAnswer').addEventListener('click', () => {
        const userAnswer = document.getElementById('answerInput').value.trim().toLowerCase();
        const correctAnswer = currentExercise.answer.toLowerCase();
        const feedback = userAnswer === correctAnswer ? "Correct!" : `Wrong! Correct answer: ${currentExercise.answer}`;
        document.getElementById('feedback').innerText = feedback;

        chrome.storage.local.get(['progress'], (result) => {
            const newProgress = (result.progress || 0) + 1;
            chrome.storage.local.set({ progress: newProgress });
        });
    });
});
