// Questions for the Quiz
const quizData = [
    {
        question: "What does 'let' declare in JavaScript?",
        options: ["A constant value", "A changeable variable", "A function", "An array"],
        correct: 1
    },
    {
        question: "Which is the strict equality operator?",
        options: ["==", "=", "===", "!="],
        correct: 2
    },
    {
        question: "What is the purpose of a for loop?",
        options: ["To declare variables", "To repeat code a set number of times", "To handle events", "To style elements"],
        correct: 1
    },
    {
        question: "How do you select an element by ID in the DOM?",
        options: ["querySelector", "getElementById", "createElement", "appendChild"],
        correct: 1
    }
    ,
    {
        question: "What keyword is used to define a constant in JavaScript?",
        options: ["let", "var", "const", "define"],
        correct: 2
    },
    {
        question: "Which method is used to write a message in the browser console?",
        options: ["alert()", "print()", "console.log()", "document.write()"],
        correct: 2
    },
    {
        question: "Which symbol is used for single-line comments in JavaScript?",
        options: ["/* */", "//", "<!-- -->", "#"],
        correct: 1
    },
    {
        question: "What will `typeof null` return?",
        options: ["'object'", "'null'", "'undefined'", "'number'"],
        correct: 0
    },
    {
        question: "Which statement stops the execution of a loop?",
        options: ["return", "stop", "exit", "break"],
        correct: 3
    },
    {
        question: "Which function converts a string to an integer?",
        options: ["parseInt()", "int()", "toInteger()", "Number()"],
        correct: 0
    }
];

let currentQuestion = 0;
let score = 0;
let totalQuestions = quizData.length;
let selectedAnswer = -1;
let timerInterval; // For per-question timer
const QUESTION_TIME = 30; // seconds per question
let timeLeft = QUESTION_TIME; // current remaining time
let highScore = parseInt(localStorage.getItem('jsQuizHighScore')) || 0;

// Utility: Update progress bar
function updateProgress() {
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('current-q').textContent = currentQuestion + 1;
    document.getElementById('total-q').textContent = totalQuestions;
}
// Extension: Start timer for each question
function getTimerColor(remaining) {
    // Interpolate from green (#28a745) -> orange (#FFA500) -> red (#FF0000)
    const green = { r: 40, g: 167, b: 69 };   // #28a745
    const orange = { r: 255, g: 165, b: 0 };  // #FFA500
    const red = { r: 255, g: 0, b: 0 };       // #FF0000

    // t = 0 at full time, 1 at timeout
    let t = 1 - (remaining / QUESTION_TIME);
    t = Math.max(0, Math.min(1, t));

    let c;
    if (t <= 0.5) {
        // green -> orange
        const tt = t / 0.5; // 0..1
        c = {
            r: Math.round(green.r + (orange.r - green.r) * tt),
            g: Math.round(green.g + (orange.g - green.g) * tt),
            b: Math.round(green.b + (orange.b - green.b) * tt)
        };
    } else {
        // orange -> red
        const tt = (t - 0.5) / 0.5; // 0..1
        c = {
            r: Math.round(orange.r + (red.r - orange.r) * tt),
            g: Math.round(orange.g + (red.g - orange.g) * tt),
            b: Math.round(orange.b + (red.b - orange.b) * tt)
        };
    }

    return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

function startTimer() {
    // ensure any previous timer is cleared
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timeLeft = QUESTION_TIME;
    const timerContainer = document.getElementById('timer-container');
    const timerText = document.getElementById('timer-text');
    const timerFill = document.getElementById('timer-fill');

    timerContainer.style.display = 'block';
    timerText.textContent = timeLeft;
    timerFill.style.width = '100%';
    timerFill.style.backgroundColor = getTimerColor(timeLeft);

    timerInterval = setInterval(() => {
        timeLeft--;
        timerText.textContent = timeLeft;
        timerFill.style.width = (timeLeft / QUESTION_TIME * 100) + '%';
        timerFill.style.backgroundColor = getTimerColor(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            nextQuestion(); // Auto-advance on timeout
        }
    }, 1000);
}


// Extension: Clear timer
function clearTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        document.getElementById('timer-container').style.display = 'none';
    }
}
function loadQuestion() {
    try {
    const q = quizData[currentQuestion];
    if (!q) throw new Error('No question data');
    document.getElementById('question').textContent = q.question;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.classList.add('option');
        btn.setAttribute('aria-label', `Option: ${option}`);
        btn.onclick = () => selectOption(index);
        optionsDiv.appendChild(btn);
    });

        document.getElementById('next-btn').style.display = 'none';
        updateProgress();
        startTimer(); // Extension: Timer starts
    } catch (error) {
        console.error('Error loading question:', error);
        document.getElementById('question').innerHTML = '<p style="color: red;">Error loading question. Check console.</p>';
    }

}
function selectOption(index) {
    if (selectedAnswer !== -1) return; // Prevent multiple clicks
    selectedAnswer = index;
    clearTimer(); // Stop timer on answer

    const options = document.querySelectorAll('.option');
    const correctIndex = quizData[currentQuestion].correct;

    // Disable all options immediately
    options.forEach(opt => (opt.disabled = true));

    // 🔹 Step 1: Start flip animation + flip sound
    const selected = options[index];
    selected.classList.add('flip');
    playSound("flip"); // Play flip sound immediately

    // 🔹 Step 2: Show the Next button right away
    document.getElementById('next-btn').style.display = 'block';

    // 🔹 Step 3: After flip ends (600ms), reveal correctness + play feedback sound
    setTimeout(() => {
        options.forEach((opt, i) => {
            opt.classList.remove('correct', 'incorrect', 'flip');
            if (i === correctIndex) {
                opt.classList.add('correct');
            } else if (i === index && i !== correctIndex) {
                opt.classList.add('incorrect');
            }
        });

        // Play sound AFTER flip completes
        if (index === correctIndex) {
            playSound("correct");
        } else {
            playSound("incorrect");
        }
    }, 600); // match the CSS animation time
}

function playSound(type) {
    let audioPath = "";
    switch (type) {
        case "flip":
            audioPath = "sounds/flip.mp3";
            break;
        case "correct":
            audioPath = "sounds/correct.mp3";
            break;
        case "incorrect":
            audioPath = "sounds/incorrect.mp3";
            break;
        case "next":
            audioPath = "sounds/next.mp3";
            break;
        case "end":
            audioPath = "sounds/end.mp3";
            break;
        default:
            return;
    }

    // Stop any previous end music before playing new one
    if (window.endMusic && !window.endMusic.paused) {
        window.endMusic.pause();
        window.endMusic.currentTime = 0;
        window.endMusic = null;
    }

    const audio = new Audio(audioPath);

    // Only assign to endMusic if it's the final song (but no looping)
    if (type === "end") {
        window.endMusic = audio;
        audio.loop = false; // only play once
    }

    audio.play().catch(err => console.warn("Audio play error:", err));
}

function nextQuestion() {
    playSound("next"); // Play sound when Next is pressed

    if (selectedAnswer === quizData[currentQuestion].correct) {
        score++;
    }
    currentQuestion++;
    selectedAnswer = -1;

    if (currentQuestion < totalQuestions) {
        loadQuestion();
    } else {
        showScore();
    }
}

function showScore() {
    clearTimer();

    // safe guards
    const qc = document.getElementById('question-container');
    const sc = document.getElementById('score-container');
    if (qc) qc.style.display = 'none';
    if (sc) sc.style.display = 'block';

    const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;

    playSound("end");

    const scoreCircle = document.getElementById('score-circle-text');
    const totalScoreEl = document.getElementById('total-score');
    const scoreEl = document.getElementById('score');
    const totalEl = document.getElementById('total');
    if (scoreCircle) scoreCircle.textContent = score;
    if (totalScoreEl) totalScoreEl.textContent = totalQuestions;
    if (scoreEl) scoreEl.textContent = score;
    if (totalEl) totalEl.textContent = totalQuestions;

    let feedback = '';
    if (percentage >= 80) feedback = "Outstanding! You're a JavaScript wizard. 🌟";
    else if (percentage >= 60) feedback = "Well done! Keep practicing those concepts. 👍";
    else feedback = "Good start—dive back into the lecture notes for a refresh. 📚";

    const feedbackEl = document.getElementById('feedback');
    if (feedbackEl) feedbackEl.textContent = feedback;

    // Extension: High score (guard DOM)
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('jsQuizHighScore', highScore);
        const highScoreBox = document.getElementById('high-score');
        const highScoreVal = document.getElementById('high-score-val');
        if (highScoreBox) highScoreBox.style.display = 'block';
        if (highScoreVal) highScoreVal.textContent = highScore;
    }

    console.log('showScore done:', { score, totalQuestions, percentage, highScore });
}
// ...existing code...
function restartQuiz() {
    // Stop looping end music completely before restart
    if (window.endMusic && !window.endMusic.paused) {
        window.endMusic.pause();
        window.endMusic.currentTime = 0;
        window.endMusic = null; // this is the key fix
    }

    currentQuestion = 0;
    score = 0;
    selectedAnswer = -1;

    const qc = document.getElementById('question-container');
    const sc = document.getElementById('score-container');
    const hs = document.getElementById('high-score');

    if (qc) qc.style.display = 'block';
    if (sc) sc.style.display = 'none';
    if (hs) hs.style.display = 'none';

    // Play a short restart sound (can be the same as "next" or "end")
    playSound("next");

    quizData.sort(() => Math.random() - 0.5);

    console.log('restartQuiz: Restart complete.');
    loadQuestion();
}

// Accessibility: Keyboard Navigation (Space = Restart)
document.addEventListener('keydown', (event) => {
    const options = document.querySelectorAll('.option');
    const nextBtn = document.getElementById('next-btn');
    const playAgainBtn = document.getElementById('play-again');

    // 1 Press Space to restart quiz if Play Again button is visible
    if (event.code === 'Enter' && playAgainBtn && playAgainBtn.offsetParent !== null) {
        event.preventDefault(); // Prevent page scrolling
        playAgainBtn.click();
        return;
    }

    // 2 Press 1–4 to select an answer option
    if (event.key >= '1' && event.key <= '4') {
        const index = parseInt(event.key) - 1;
        if (options[index]) options[index].click();
    }

    // 3 Press Enter to go to the next question (if visible)
    if (event.key === 'Enter' && nextBtn && nextBtn.style.display === 'block') {
        nextBtn.click();
    }
});


// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Shuffle questions before starting the quiz
    quizData.sort(() => Math.random() - 0.5);

    loadQuestion(); // Load the first (now randomized) question
});
