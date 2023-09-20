const questionBox = document.getElementById('question-box');
const questionText = document.getElementById('question');
const answerButtonsBox = document.getElementById('answers');
const answerButtons = document.getElementsByClassName('answer');
const gameBoard = document.getElementById('game-board');

let currentPlayer = 0;
let board = [];
let boardResolution = 5; // Assuming 5x5 board
let boardGenerated = false;
let started = false;

const questions = [
    { question: "What is the capital of France?", answers: ["Paris", "London", "Berlin", "Rome"], correct: 0 },
    { question: "What is the capital of Japan?", answers: ["Tokyo", "Kyoto", "Osaka", "Nagoya"], correct: 0 },
    { question: "What is the capital of India?", answers: ["New Delhi", "Mumbai", "Kolkata", "Chennai"], correct: 0 },
    { question: "What is the capital of China?", answers: ["Beijing", "Shanghai", "Hong Kong", "Shenzhen"], correct: 0 },
    { question: "What is the capital of Russia?", answers: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg"], correct: 0 },
    // Add more questions here
];

// {position: [4, 0], solved: 0, failed: 0, name: 'Player 1', color: 'blue'}
let players = [];

function generateBoard() {
    // Randomize the questions for each tile.
    // Each tile can have a random question assigned to it, or no question assigned to it.
    for (let i = 0; i < boardResolution; i++) {
        board[i] = [];
        
        for (let j = 0; j < boardResolution; j++) {
            // 70% chance of a question tile
            if (Math.random() < 0.70) {
                board[i][j] = {question: true, players: []};
            } else {
                board[i][j] = {question: false, players: []};
            }
        }
    }

    for (let i = 0; i < boardResolution; i++) { 
        for (let j = 0; j < boardResolution; j++) {
            // Add the tiles to the board
            if (board[i][j].question) { 
                // Add a question tile
                var div = document.createElement('div');
                div.id = 'tile-' + i + '-' + j;
                div.classList.add('question-tile');
            } else {
                // Add a normal tile
                var div = document.createElement('div');
                div.id = 'tile-' + i + '-' + j;
                div.classList.add('tile');
            }

            gameBoard.appendChild(div);
        }
    }

    // apply player colors
    for (let i = 0; i < players.length; i++) {
        var playerTile = document.getElementById('tile-' + players[i].position[0] + '-' + players[i].position[1]);
        
        var div = document.createElement('div');
        div.classList.add('player-piece');
        div.style.backgroundColor = players[i].color;
        playerTile.appendChild(div);
    }

    boardGenerated = true;
    started = false;
}

const direction = {
    forward: 0,
    backward: 1,
}

function getNextPosition(row, col, direction, steps) {
    let _row = row
    let _col = col

    for (let i = 0; i < steps; i++) {
        switch (direction) {
            case 0: // forward
                // max row and col (end)
                if (_row === 0 && _col === boardResolution - 1) {
                    break;
                }

                // move to next row
                if (_col == boardResolution - 1) {
                    _row -= 1;
                    _col = 0;
                } else {
                    // move to next col normally
                    _col += 1;
                }
                break;
            case 1: // backward
                // max row and col (start)
                if (_row === boardResolution - 1 && _col === 0) {
                    break;
                }

                // move to next row
                if (_col == 0) {
                    _col = boardResolution - 1;
                    _row += 1;
                } else {
                    // move to next col normally
                    _col -= 1;
                }
                break;
        }
    }
    return [_row, _col];
}

function playerGetNextPosition(player, direction, steps) {
    return getNextPosition(player.position[0], player.position[1], direction, steps);
}

function playerStep(player, direction, steps) {
    let expected = playerGetNextPosition(player, direction, steps);
    player.position[0] = expected[0];
    player.position[1] = expected[1];
    checkForWinner();
}

function checkForWinner() {
    for (let i = 0; i < players.length; i++) {
        if (players[i].position[0] === 0 && players[i].position[1] === boardResolution - 1) {
            alert(players[i].name + ' has won the game!');

            let statsStr = 'Game stats:\n';
            for (let j = 0; j < players.length; j++) {
                statsStr += players[j].name + ': ' + players[j].solved + ' correct, ' + players[j].failed + ' incorrect\n';
            }
            alert(statsStr);            
        }
    }
}

let addPlayerPopup = true;

function showAddPlayer() {
    if (started) {
        alert('Please create a new game before adding new players!')
        return;
    }
    document.getElementById('add-player-box').style.display = 'block';
}

function checkNextTurn() {
    if (currentPlayer === players.length - 1) {
        currentPlayer = 0;
    } else {
        currentPlayer += 1;
    }

    alert('It is now ' + players[currentPlayer].name + '\'s turn.');
}
function diceRotateAnimation() {
    if (!started)
        started = true;

    if (!boardGenerated) {
        alert('Please generate a board before rolling the dice!');
        return;
    }

    document.getElementById('dice').classList.add('dice-rotate');
    
    // Show random numbers on the dice while rolling
    let interval = setInterval(() => {
        document.getElementById('dice').textContent = Math.floor(Math.random() * 6) + 1;
    }, 50);

    setTimeout(() => {
        document.getElementById('dice').classList.remove('dice-rotate');
        clearInterval(interval);
        document.getElementById('dice').textContent = '';

        setTimeout(() => {
            rollDice();
        }, 200);
    }, 2000);
}

function rollDice() {
    let roll = Math.floor(Math.random() * 6) + 1;

    document.getElementById('dice').textContent = roll;
    setTimeout(() => {
        alert(players[currentPlayer].name + ' rolled a ' + roll + '!');
    }, 10);

    let nextPosition = playerGetNextPosition(players[currentPlayer], direction.forward, roll);
    if (board[nextPosition[0]][nextPosition[1]].question) {
        displayQuestion(roll);
    } else {
        setTimeout(() => {
            alert('You landed on a normal tile. No question for you!');
        }, 10);
        for (i = 0; i < roll; i++) {
            playerStep(players[currentPlayer], direction.forward, roll);
        }
        checkNextTurn();
    }

    redrawPlayersBoard();
}

function addPlayer() {
    pName = document.getElementById('newPlayerName').value;
    color = document.getElementById('newPlayerColor').value;
    players.push({position: [4, 0], solved: 0, failed: 0, name: pName, color: color});

    document.getElementById('newPlayerName').value = '';
    document.getElementById('newPlayerColor').value = '';
    
    document.getElementById('add-player-box').style.display = 'none';
    redrawPlayersList();
    redrawPlayersBoard();
}

function redrawPlayersList() { 
    // Clear the players list
    document.getElementById('players').innerHTML = '';
    for (let i = 0; i < players.length; i++) {
        var div = document.createElement('div');
        div.classList.add('flex', 'flex-row', 'pmargin');
        div.style.color = players[i].color;

        var xBtn = document.createElement('button');
        xBtn.textContent = 'X';
        xBtn.addEventListener('click', () => {
            if (!confirm('Are you sure you want to remove ' + players[i].name + '?')) {
                return;
            }

            players.splice(i, 1);
            redrawPlayersList();
            redrawPlayersBoard();
        });

        div.textContent = players[i].name;
        div.appendChild(xBtn);
        document.getElementById('players').appendChild(div);
    }
}

function redrawPlayersBoard() {
    let pieces = document.getElementsByClassName('player-piece');
    let count = pieces.length;
    for (let i = 0; i < count; i++) {
        pieces[0].remove();
    }

    for (let i = 0; i < players.length; i++) {
        var playerTile = document.getElementById('tile-' + players[i].position[0] + '-' + players[i].position[1]);
        
        var div = document.createElement('div');
        div.classList.add('player-piece');
        div.style.backgroundColor = players[i].color;
        playerTile.appendChild(div);
    }
}

function getQuestion() {
    return questions[Math.floor(Math.random() * questions.length)];
}

function redrawAll() {
    redrawPlayersList();
    redrawPlayersBoard();
}

function resetGame() {
    if (boardGenerated) {
        if (!confirm('Are you sure you want to start a new game?'))
            return;
    }

    if (players.length === 0) {
        alert('Please add players to the game!');
        return;
    }

    currentPlayer = 0;
    board = [];
    boardGenerated = false;
    started = false;

    // Clear the game board
    document.getElementById('game-board').innerHTML = '';
    document.getElementById('dice').textContent = '';
    generateBoard();
    resetPlayersPositions();
    redrawPlayersBoard();
}

function resetPlayersPositions() {
    for (let i = 0; i < players.length; i++) {
        players[i].position[0] = boardResolution - 1;
        players[i].position[1] = 0;
    }
}
// Function to display a question
function displayQuestion(roll) {
    const randomQuestion = getQuestion();
    questionText.textContent = randomQuestion.question;

    for (let i = 0; i < randomQuestion.answers.length; i++) {
        var btn = document.createElement('button');
        btn.classList.add('answer');
        answerButtonsBox.appendChild(btn);
    }

    for (let i = 0; i < answerButtons.length; i++) {
        answerButtons[i].textContent = randomQuestion.answers[i];
        answerButtons[i].addEventListener('click', () => checkAnswer(i, randomQuestion.correct, roll));
    }

    questionBox.style.display = 'block';
}
// Function to check the answer
function checkAnswer(selectedIndex, correctIndex, roll) {
    if (selectedIndex === correctIndex) {
        // Move the player forward and update positions
        alert('Correct! Move forward '+ roll +' spaces.');
        // Move the player forward
        playerStep(players[currentPlayer], direction.forward, roll);

        // Update the player's solved questions
        players[currentPlayer].solved += 1;
        checkNextTurn();
    } else {
        // Move the player backward and update positions
        alert('Incorrect! Move back '+ roll +' spaces.');
        // Move the player backward
        playerStep(players[currentPlayer], direction.backward, roll);
        
        // Update the player's failed questions
        players[currentPlayer].failed += 1;
        checkNextTurn();
    }
    questionBox.style.display = 'none';
    answerButtonsBox.innerHTML = '';
    redrawAll();
}
