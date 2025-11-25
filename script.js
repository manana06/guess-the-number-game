// Global Game Variables
let randomNumber;
let attempts = 0;
let gameOver = false;
let playerName = '';

// Select All HTML Elements
// Screens
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const greeting = document.getElementById('greeting');
// Nickname Input
const playerNameInput = document.getElementById('playerNameInput');
const startButton = document.getElementById('startButton');
// Game
const guessInput = document.getElementById('guessInput');
const checkButton = document.getElementById('checkButton');
const message = document.getElementById('message');
const attemptsDisplay = document.getElementById('attempts');
const restartButton = document.getElementById('restartButton');
// Leaderboard
const leaderboardBody = document.querySelector('#leaderboard-table tbody');
const resetLeaderboardButton = document.getElementById('resetLeaderboardButton');


// ===========================================
// LEADERBOARD LOGIC (Save & Load)
// ===========================================

// Loads scores from localStorage
function getLeaderboard() {
    const jsonScores = localStorage.getItem('guessingGameLeaderboard');
    return jsonScores ? JSON.parse(jsonScores) : [];
}

// Saves a new score
function saveScore(name, score) {
    const leaderboard = getLeaderboard();
    
    // Add the new score
    leaderboard.push({ name: name, score: score });
    
    // Sort (fewer attempts is better)
    leaderboard.sort((a, b) => a.score - b.score);
    
    // Keep only the top 10 (optional)
    const topScores = leaderboard.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('guessingGameLeaderboard', JSON.stringify(topScores));
    
    // Update the on-screen table
    renderLeaderboard();
}

// Displays the leaderboard on the HTML
function renderLeaderboard() {
    leaderboardBody.innerHTML = ''; // Clear the table
    const scores = getLeaderboard();

    if (scores.length === 0) {
        leaderboardBody.innerHTML = '<tr><td colspan="2">No scores recorded yet.</td></tr>';
        return;
    }

    scores.forEach(item => {
        const row = leaderboardBody.insertRow();
        const nameCell = row.insertCell();
        const scoreCell = row.insertCell();
        
        nameCell.textContent = item.name;
        scoreCell.textContent = item.score;
    });
}

// ===========================================
// GAME START AND LOGIC
// ===========================================

// Starts a new game round
function startNewGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    gameOver = false;
    
    // Reset game elements
    attemptsDisplay.textContent = `Attempts: ${attempts}`;
    message.textContent = '';
    message.style.color = '#333';
    guessInput.value = '';
    
    // Enable input/button and hide restart button
    guessInput.disabled = false;
    checkButton.disabled = false;
    restartButton.style.display = 'none';
}

// Function to check the guess
function checkGuess() {
    if (gameOver) return;

    const guess = parseInt(guessInput.value);

    if (isNaN(guess) || guess < 1 || guess > 100) {
        message.textContent = "❌ Please enter a valid number between 1 and 100.";
        return;
    }

    attempts++;
    attemptsDisplay.textContent = `Attempts: ${attempts}`;

    if (guess === randomNumber) {
        // GAME OVER: Player wins
        message.textContent = `🎉 Congratulations, ${playerName}! You found the number ${randomNumber} in ${attempts} attempts!`;
        message.style.color = 'green';
        gameOver = true;
        
        // Save the score
        saveScore(playerName, attempts); 
        
        // Lock input and show restart button
        guessInput.disabled = true;
        checkButton.disabled = true;
        restartButton.style.display = 'block';

    } else if (guess < randomNumber) {
        message.textContent = '📉 Too Low! Try a higher number.';
        message.style.color = 'blue';
    } else {
        message.textContent = '📈 Too High! Try a lower number.';
        message.style.color = 'red';
    }
    
    guessInput.value = '';
}

// Handles the start of the game
function handleStartGame() {
    // Clean up the name and remove unnecessary spaces
    const inputName = playerNameInput.value.trim(); 
    
    if (inputName === '') {
        alert('Please enter your nickname.');
        return;
    }

    playerName = inputName;
    
    // Change screen: From Welcome to Game
    welcomeScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    
    // Display greeting with the player's nickname
    greeting.textContent = `Welcome, ${playerName}!`;
    
    // Start the first round
    startNewGame();
}

// ===========================================
// EVENT LISTENERS
// ===========================================

// 1. Start game from welcome screen
startButton.addEventListener('click', handleStartGame);
playerNameInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handleStartGame();
    }
});

// 2. Check guess
checkButton.addEventListener('click', checkGuess);
guessInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        checkGuess();
    }
});

// 3. Restart game (with the same nickname)
restartButton.addEventListener('click', startNewGame);

// 4. Clear the Leaderboard
resetLeaderboardButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the leaderboard?')) {
        localStorage.removeItem('guessingGameLeaderboard');
        renderLeaderboard();
    }
});

// ===========================================
// INITIALIZATION (Runs when the page loads)
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    renderLeaderboard(); // Load the leaderboard at the start
});