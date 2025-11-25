// ===========================================
// 1. FIREBASE CONFIGURATION (ΒΑΛΕ ΤΑ ΔΙΚΑ ΣΟΥ ΚΛΕΙΔΙΑ ΕΔΩ)
// ===========================================
const firebaseConfig = {
    const firebaseConfig = {
    apiKey: "AIzaSy...", 
    authDomain: "guessthenumbergame-53441.firebaseapp.com",
    // >>> ΑΥΤΗ Η ΓΡΑΜΜΗ ΕΙΝΑΙ Η ΠΙΟ ΣΗΜΑΝΤΙΚΗ:
    projectId: "guessthenumbergame-53441", 
    // <<<
    storageBucket: "guessthenumbergame-53441.appspot.com",
    messagingSenderId: "1059...",
    appId: "1:1059..."
};
// Initialize Firebase and Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const scoresCollection = db.collection('global_scores'); // Όνομα συλλογής στη βάση δεδομένων

// ===========================================
// 2. GLOBAL GAME VARIABLES AND HTML ELEMENTS
// ===========================================
let randomNumber;
let attempts = 0;
let gameOver = false;
let playerName = '';

const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const greeting = document.getElementById('greeting');
const playerNameInput = document.getElementById('playerNameInput');
const startButton = document.getElementById('startButton');
const guessInput = document.getElementById('guessInput');
const checkButton = document.getElementById('checkButton');
const message = document.getElementById('message');
const attemptsDisplay = document.getElementById('attempts');
const restartButton = document.getElementById('restartButton');
const leaderboardBody = document.querySelector('#leaderboard-table tbody');


// ===========================================
// 3. FIREBASE LEADERBOARD LOGIC
// ===========================================

// Saves a new score to Firebase
async function saveScore(name, score) {
    try {
        await scoresCollection.add({
            name: name,
            score: score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("Score successfully written to database!");
        renderLeaderboard(); // Φόρτωσε ξανά τον πίνακα για να φανεί το νέο σκορ
    } catch (e) {
        console.error("Error adding document: ", e);
        // Alert only for critical errors, as the global leaderboard is critical
        alert("Could not save score. Please check the Firebase connection."); 
    }
}

// Fetches and displays the top 10 scores from Firebase
async function renderLeaderboard() {
    leaderboardBody.innerHTML = '<tr><td colspan="2">Loading global scores...</td></tr>';
    
    try {
        // Fetch top 10 scores, ordered by attempts ascending (lowest score is best)
        const snapshot = await scoresCollection
            .orderBy('score', 'asc') 
            .limit(10) 
            .get();

        leaderboardBody.innerHTML = ''; 

        if (snapshot.empty) {
            leaderboardBody.innerHTML = '<tr><td colspan="2">No global scores recorded yet.</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const row = leaderboardBody.insertRow();
            const nameCell = row.insertCell();
            const scoreCell = row.insertCell();
            
            nameCell.textContent = data.name;
            scoreCell.textContent = data.score;
        });
    } catch (e) {
        console.error("Error fetching documents: ", e);
        leaderboardBody.innerHTML = '<tr><td colspan="2">Error loading scores. Check Firebase rules.</td></tr>';
    }
}


// ===========================================
// 4. GAME LOGIC
// ===========================================

function startNewGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    gameOver = false;
    
    attemptsDisplay.textContent = `Attempts: ${attempts}`;
    message.textContent = '';
    message.style.color = '#333';
    guessInput.value = '';
    
    guessInput.disabled = false;
    checkButton.disabled = false;
    restartButton.style.display = 'none';
    
    // Εμφάνισε τον πίνακα κατάταξης σε κάθε νέα έναρξη παιχνιδιού
    renderLeaderboard(); 
}

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
        // GAME OVER: Save score to Firebase!
        message.textContent = `🎉 Congratulations, ${playerName}! You found the number ${randomNumber} in ${attempts} attempts!`;
        message.style.color = 'green';
        gameOver = true;
        
        saveScore(playerName, attempts); // ΚΑΛΕΙ ΤΗΝ FIREBASE ΣΥΝΑΡΤΗΣΗ
        
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

function handleStartGame() {
    const inputName = playerNameInput.value.trim(); 
    
    if (inputName === '') {
        alert('Please enter your nickname.');
        return;
    }

    playerName = inputName;
    
    welcomeScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    
    greeting.textContent = `Welcome, ${playerName}!`;
    
    startNewGame();
}

// ===========================================
// 5. EVENT LISTENERS AND INITIALIZATION
// ===========================================

startButton.addEventListener('click', handleStartGame);
playerNameInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handleStartGame();
    }
});

checkButton.addEventListener('click', checkGuess);
guessInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        checkGuess();
    }
});

restartButton.addEventListener('click', startNewGame);

// Load the global leaderboard when the page starts
document.addEventListener('DOMContentLoaded', () => {
    renderLeaderboard(); 
});

