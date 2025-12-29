// --- 1. State Variables ---
let currentSession = 'Work';
let timeLeft; // We leave this empty now because loadSettings() will set it
let isRunning = false;
let intervalId;
let workSessionCount = 0;

// Default Durations (These get overwritten by loadSettings)
let workDuration = 25 * 60;
let shortBreakDuration = 5 * 60;
let longBreakDuration = 15 * 60;

// State Variables
let workStep = 0; // In seconds
let breakStep = 0; // In seconds

// --- 2. DOM Element References ---
const timeDisplay = document.getElementById('time-display');
const sessionLabel = document.getElementById('session-label');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const resetButton = document.getElementById('reset-btn');
const alarmSound = document.getElementById('alarm-sound');
const workStepInput = document.getElementById('work-step');
const breakStepInput = document.getElementById('break-step');

// New Settings References
const workInput = document.getElementById('work-input');
const shortInput = document.getElementById('short-input');
const longInput = document.getElementById('long-input');
const applyBtn = document.getElementById('apply-settings');

// --- 3. Settings Functions ---
function applySettings() {
    workDuration = parseInt(workInput.value) * 60;
    shortBreakDuration = parseInt(shortInput.value) * 60;
    longBreakDuration = parseInt(longInput.value) * 60;

    localStorage.setItem('pomodoro-work', workInput.value);
    localStorage.setItem('pomodoro-short', shortInput.value);
    localStorage.setItem('pomodoro-long', longInput.value);

    resetTimer(); 
    alert("Settings Saved!");
    // Convert step minutes to seconds
    workStep = parseInt(workStepInput.value) * 60;
    breakStep = parseInt(breakStepInput.value) * 60;

    // Save steps to localStorage too
    localStorage.setItem('pomodoro-work-step', workStepInput.value);
    localStorage.setItem('pomodoro-break-step', breakStepInput.value);

    resetTimer();
    alert("Progressive settings applied!")
}

function loadSettings() {
    const savedWork = localStorage.getItem('pomodoro-work');
    const savedShort = localStorage.getItem('pomodoro-short');
    const savedLong = localStorage.getItem('pomodoro-long');

    if (savedWork) {
        workInput.value = savedWork;
        workDuration = parseInt(savedWork) * 60;
    }
    // ... repeat for short and long ...

    resetTimer(); // This ensures the screen shows the correct loaded time
}

// Formats seconds into MM:SS string
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    // Add padding (05 instead of 5)
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Updates the display every second
function updateDisplay() {
    timeDisplay.textContent = formatTime(timeLeft);
}

// Switches between Work and Break sessions
function switchSession() {
    if (currentSession === 'Work') {
        // 1. Apply the "Progressive" change for the NEXT work session
        workDuration = Math.max(60, workDuration + workStep); 
        
        workSessionCount++;

        // 2. Decide which break to take
        if (workSessionCount % 4 === 0) {
            currentSession = 'Long Break';
            timeLeft = longBreakDuration;
        } else {
            currentSession = 'Short Break';
            timeLeft = shortBreakDuration;
        }
    } else {
        // 1. If we just finished a break, increment/decrement the break for next time
        shortBreakDuration = Math.max(60, shortBreakDuration + breakStep);
        
        // 2. Always go back to Work after a break
        currentSession = 'Work';
        timeLeft = workDuration;
    }

    // 3. Update the Input Boxes so the user sees the new "Goal"
    workInput.value = workDuration / 60;
    shortInput.value = shortBreakDuration / 60;

    // 4. Update the Visuals
    sessionLabel.textContent = currentSession;
    updateTheme();   // Change colors
    updateDisplay(); // Change the 00:00 to the new starting time
}

// The heart of the timer: runs every 1000 milliseconds (1 second)
function countdown() {
    if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
    } else {
        // 1. Stop the current interval
        clearInterval(intervalId);
        isRunning = false;

        // 2. Play the alarm
        alarmSound.play().catch(e => console.log("Audio blocked or missing"));

        // 3. Switch the session (This updates durations and themes)
        switchSession();

        // 4. THE KEY CHANGE: Automatically start the next session
        // We use a tiny delay (100ms) to ensure the UI updates before the next tick
        setTimeout(() => {
            startTimer();
        }, 100); 
    }
}

// --- 4. Control Functions ---

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        document.querySelector('.timer-container').classList.add('running');
        intervalId = setInterval(countdown, 1000);
    }
}

function updateTheme() {
    if (currentSession === 'Work') {
        document.body.classList.add('work-theme');
        document.body.classList.remove('break-theme');
    } else {
        document.body.classList.add('break-theme');
        document.body.classList.remove('work-theme');
    }
}

function pauseTimer() {
    clearInterval(intervalId);
    isRunning = false;
    document.querySelector('.timer-container').classList.remove('running');
}

function resetTimer() {
    // 1. Stop the countdown
    clearInterval(intervalId);
    isRunning = false;

    // 2. Force the state back to the beginning
    currentSession = 'Work';
    workSessionCount = 0; // Optional: Reset the 4-session streak

    // 3. Set time back to the defined work duration
    timeLeft = workDuration;

    // 4. Update all visuals
    sessionLabel.textContent = currentSession;
    updateTheme();   // Switches color back to Red (Work)
    updateDisplay(); // Updates the 25:00 and Tab title
    
    // Remove the pulse animation if you added it
    document.querySelector('.timer-container').classList.remove('running');
}

// --- 5. Event Listeners ---
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
applyBtn.addEventListener('click', applySettings); // Don't forget this!

// --- 6. Run on Startup ---
loadSettings();

// Initial call to set the display to 25:00
updateDisplay();
