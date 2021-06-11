console.log("2048")
var boardData = {};
var currentScore;
var realMove = false;

function tileKey(row, col) {
    return "row" + row + "col" + col;
}

function createBoard() {
    board = document.querySelector("#board")

    for (var row=0;row<4;row++) {
        var rowDiv = document.createElement("div");
        rowDiv.classList.add("row");
        board.appendChild(rowDiv);
        
        for (var col=0;col<4;col++) {
            var tileDiv = document.createElement("div");
            var key = tileKey(row, col);
            tileDiv.classList.add("tile");
            tileDiv.id = key;
            rowDiv.append(tileDiv);
        }
    }
}

function updateBoard() {
    for (var row=0;row<4;row++) {
        for (var col=0;col<4;col++) {
            var key = tileKey(row, col);
            var value = boardData[key];
            var tileDiv = document.querySelector("#"+key);
            tileDiv.className = "tile";
            if (value) {
                tileDiv.innerHTML = value;
                tileDiv.classList.add("tile-" + value);
            } else {
                tileDiv.innerHTML = "";
            }
        }
    }
    var scoreSpan = document.querySelector("#current-score span");
    scoreSpan.innerHTML = currentScore;
}

function getEmptyTiles() {
    var emptyTiles = [];
    for (var row=0;row<4;row++) {
        for (var col=0;col<4;col++) {
            var key = tileKey(row,col);
            if (!boardData[key]) {
                emptyTiles.push(key);
            }
        }
    }
    return emptyTiles;
}

function generateRandomTile() {
    var emptyTiles = getEmptyTiles();
    var randomIndex = Math.floor(Math.random() * emptyTiles.length);
    var randomTileKey = emptyTiles[randomIndex];
    if (randomTileKey) {
        if (Math.random() < 0.11) {
            boardData[randomTileKey] = 4;
        } else {
            boardData[randomTileKey] = 2;
        }
    }
}

function newGame() {
    boardData = {};
    currentScore = 0;
    generateRandomTile();
    generateRandomTile();
    updateBoard();
    localStorage.clear();
}

// assumes input contains no blanks, only numbers
function combineTiles(numbers) {
    var newNumbers = [];
    while (numbers.length > 0) {                // while there are still numbers
        if (numbers.length == 1) {              // if there's only one number:
            newNumbers.push(numbers[0]);        //      push it to the new list
            numbers.splice(0, 1);               //      remove first number
        } else if (numbers[0] == numbers[1]) {  // if next two numbers match:
            var sum = numbers[0] + numbers[1];  //      combine them
            newNumbers.push(sum);               //      push the sum new list
            numbers.splice(0,2);                //      remove both from input list
            if (realMove) {
                currentScore += sum;            //      ( add your points to the score )
            }                                             
        } else {                                // else the next two numbers don't match
            newNumbers.push(numbers[0]);        //      add first number to new list
            numbers.splice(0,1);                //      remove first number from input list
        }
    }
    while (newNumbers.length < 4) { // ensure that newNumbers has length 4
        newNumbers.push(undefined);
    }
    return newNumbers;
}

function getNumbersRow(row) {
    var numbers = [];
    for (var col=0;col<4;col++) {
        var key = tileKey(row,col);
        var value = boardData[key];
        if (value) {
            numbers.push(value);
        }
    }
    return numbers;
}

function getNumbersCol(col) {
    var numbers = [];
    for (var row=0;row<4;row++) {
        var key = tileKey(row,col);
        var value = boardData[key];
        if (value) {
            numbers.push(value);
        }
    }
    return numbers;
}

function setNumbersRow(row,newNumbers) {
    for (var col=0;col<4;col++) {
        var key = tileKey(row,col);
        var value = newNumbers[col];
        boardData[key] = value;
    }
}

function setNumbersCol(col,newNumbers) {
    for (var row=0;row<4;row++) {
        var key = tileKey(row,col);
        var value = newNumbers[row];
        boardData[key] = value;
    }
}

function combineRowLeft(row) {
    var numbers = getNumbersRow(row);
    var newNumbers = combineTiles(numbers);
    setNumbersRow(row, newNumbers);
}

function combineColUp(col) {
    var numbers = getNumbersCol(col);
    var newNumbers = combineTiles(numbers);
    setNumbersCol(col, newNumbers);
}

function combineRowRight(row) {
    var numbers = getNumbersRow(row);
    numbers = numbers.reverse();
    var newNumbers = combineTiles(numbers);
    setNumbersRow(row, newNumbers.reverse());
}

function combineColDown(col) {
    var numbers = getNumbersCol(col);
    numbers = numbers.reverse();
    var newNumbers = combineTiles(numbers);
    setNumbersCol(col, newNumbers.reverse());
}

function boardChanged(oldBoard) {
    // return true or false
    for (var row=0;row<4;row++) {
        for (var col=0;col<4;col++){
            var key = tileKey(row,col);
            if (oldBoard[key] != boardData[key]) {
                return true;
            }
        }
    }
    return false;
}

// game over detection
function isGameOver() {
    var oldBoard = Object.assign({},boardData);
    if (anyLegalMoves(oldBoard)) {
        return false;
    }
    return true;
}

// check every move. if any moves change the board, revert the board
// thus, we still have legal moves
function anyLegalMoves(oldBoard) {
    realMove = false;
    for (var i=0;i<16;i++) {
        if (i < 4) {
            combineRowLeft(i);
        } else if (i < 7) {
            combineRowRight(i);
        } else if (i < 11) {
            combineColDown(i);
        } else if (i < 16) {
            combineColUp(i);
        }
        if (boardChanged(oldBoard)) {
            boardData = Object.assign({},oldBoard);
            return true
        }
    }
    return false;
}

function move(direction) {
    realMove = true;
    // make a deep copy of the data
    var oldBoard = Object.assign({}, boardData);
    for (var i=0;i<4;i++) {
        if (direction == "left") {
            combineRowLeft(i);
        } else if (direction == "right") {
            combineRowRight(i);
        } else if (direction == "up") {
            combineColUp(i);
        } else if (direction == "down") {
            combineColDown(i);
        }
    }
    if (boardChanged(oldBoard)) {
        generateRandomTile();
        if (isGameOver()) {
            setTimeout(function(){
                alert("game over");
                localStorage.clear();
            }, 2000);
            
        }
        updateBoard();
    }
    saveGame();
    realMove = false;
}

// key listening
document.addEventListener('keydown', function(event) {
    switch (event.code) {
        case "ArrowLeft":
            move("left");
            break;
        case "ArrowRight":
            move("right");
            break;
        case "ArrowDown":
            move("down");
            break;
        case "ArrowUp":
            move("up");
            break;
        default:
            break;
    }
});

// disable arrow key scroll
window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

var newGameButton = document.querySelector("#new-game");
newGameButton.onclick = newGame;

var url = "https://highscoreapi.herokuapp.com/scores";
var submitScoreButton = document.querySelector("#submit-score");
submitScoreButton.onclick = function () {
  var name = prompt("Enter your initials:");
  var data = {
    "name": name,
    "score": currentScore
  };
  fetch("https://highscoreapi.herokuapp.com/scores", {
    // options for fetch
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(function (response) {
    // response handler function
    console.log("Successfully submitted score to server.");
  });
};

var getScoresButton = document.querySelector("#get-scores");
getScoresButton.onclick = function () {
    var highScoreList = document.querySelector("#high-scores")
    highScoreList.innerHTML = "";
    fetch(url).then(function (response) {
        response.json().then(function (data) {
            console.log("data from the server:",data);
            data.forEach(function (score) {
                var listScore = document.createElement("li");
                listScore.innerHTML = score.name + ": " + score.score;
                highScoreList.appendChild(listScore);
            });
        });
    });
};


// retain game state across instances
function saveGame() {
    localStorage.setItem("currentScore",currentScore);
    localStorage.setItem("boardData",JSON.stringify(boardData));
}

function loadGame() {
    currentScore = parseInt(localStorage.getItem("currentScore"), 10);
    boardData = JSON.parse(localStorage.getItem("boardData"));
    updateBoard();
}

// on page bootup
createBoard();
if (localStorage.getItem("currentScore")) {
    loadGame();
} else {
    newGame();
}