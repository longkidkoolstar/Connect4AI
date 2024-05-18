// ==UserScript==
// @name         Connect 4 AI for papergames
// @namespace    https://github.com/longkidkoolstar
// @version      0.1
// @description  Adds an AI player to Connect 4 on papergames.io
// @author       longkidkoolstar
// @icon         https://th.bing.com/th/id/R.2ea02f33df030351e0ea9bd6df0db744?rik=Pnmqtc4WLvL0ow&pid=ImgRaw&r=0
// @match        https://papergames.io/*
// @license      none
// @grant        none
// ==/UserScript==


console.log("Test Mode!");

(function() {
    'use strict';

    // Check if username is stored in local storage
    var username = localStorage.getItem('username');

    if (!username) {
        // Alert the user
        alert('Username is not stored in local storage.');

        // Prompt the user to enter the username
        username = prompt('Please enter your Papergames username (case-sensitive):');

        // Save the username to local storage
        localStorage.setItem('username', username);
    }

 var player;

    function updateBoard() {
        var profileOpeners = document.querySelectorAll(".text-truncate.cursor-pointer");
        var profileOpener = null;

        profileOpeners.forEach(function(opener) {
            if (opener.textContent.trim() === username) {
                profileOpener = opener;
            }
        });

        var chronometer = document.querySelector("app-chronometer");

        var numberElement;
        if (profileOpener.parentNode.querySelectorAll("span[_ngcontent-serverapp-c155]").length > 0) {
            numberElement = profileOpener.parentNode.querySelectorAll("span[_ngcontent-serverapp-c155]")[2]; // Select the third element with the number
        } else if (profileOpener.parentNode.querySelectorAll("span[_ngcontent-serverapp-c154]").length > 0) {
            numberElement = profileOpener.parentNode.querySelectorAll("span[_ngcontent-serverapp-c154]")[2]; // Select the third element with the number
        } else if (profileOpener.parentNode.querySelectorAll("span[_ngcontent-serverapp-c153]").length > 0) {
            numberElement = profileOpener.parentNode.querySelectorAll("span[_ngcontent-serverapp-c153]")[2]; // Select the third element with the number
        }
        var profileOpenerParent = profileOpener.parentNode.parentNode;

        var svgElementDark = profileOpenerParent.querySelector("circle.circle-dark");
        var svgElementLight = profileOpenerParent.querySelector("circle.circle-light");

        if (svgElementDark) {
            player = 'R'; // Player is playing as "R"
        } else if (svgElementLight) {
            player = 'B'; // Player is playing as "B"
        }

        var currentElement = chronometer || numberElement; // Use chronometer if it exists, otherwise use the number element

        if (currentElement && currentElement.textContent !== prevChronometerValue && profileOpener) {
            prevChronometerValue = currentElement.textContent;
            simulateCellClick(getBestMove());
        } else {
            console.log("Waiting for AI's turn...");
        }

        return player;
    }

    var prevChronometerValue = "";

    function getBoardState() {
        const boardContainer = document.querySelector("#connect4 > table");
        const rows = boardContainer.querySelectorAll("tr");
        let boardState = [];

        for (let row = 0; row < rows.length; row++) {
            const cells = rows[row].querySelectorAll("td");
            let rowState = [];

            for (let col = 0; col < cells.length; col++) {
                const cell = cells[col];
                let cellState = "E"; // Default: Empty

                if (cell.querySelector("circle.circle-dark")) {
                    cellState = "R"; // Red
                } else if (cell.querySelector("circle.circle-light")) {
                    cellState = "B"; // Blue
                }

                rowState.push(cellState);
            }

            boardState.push(rowState);
        }

        return boardState;
    }

    function simulateCellClick(cell) {
        var event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        cell.dispatchEvent(event);
    }

    function makeMove(col) {
        const boardContainer = document.querySelector("#connect4 > table");
        const rows = boardContainer.querySelectorAll("tr");
        const row = rows[rows.length - 1]; // Select the bottom row
        const cells = row.querySelectorAll("td");

        // Select the cell in the specified column
        const cell = cells[col];

        // Click the cell
        simulateCellClick(cell);
    }

    function getBestMove(player) {
        const boardState = getBoardState();
        const depth = 4; // Depth of the Minimax algorithm
    
        // Call the Minimax algorithm to get the best move
        const bestMove = minimax(boardState, depth, true, player).col;
        return bestMove;
    }
    function minimax(board, depth, maximizingPlayer, player) {
        

        const validMoves = getValidMoves(board);
        const isTerminal = isGameOver(board) || depth === 0;
    
        if (isTerminal) {
            const score = evaluateBoard(board);
            return { score };
        }
    
        if (maximizingPlayer) {
            let maxScore = -Infinity;
            let bestMove;
    
            for (let col of validMoves) {
                const newBoard = makeMoveInBoard(board, col, player);
                const score = minimax(newBoard, depth - 1, false, player).score;
    
                if (score > maxScore) {
                    maxScore = score;
                    bestMove = col;
                }
            }
    
            return { score: maxScore, col: bestMove };
        } else {
            let minScore = Infinity;
            let bestMove;
    
            for (let col of validMoves) {
                const newBoard = makeMoveInBoard(board, col, getOpponent(player));
                const score = minimax(newBoard, depth - 1, true, player).score;
    
                if (score < minScore) {
                    minScore = score;
                    bestMove = col;
                }
            }
    
            return { score: minScore, col: bestMove };
        }
    }

    function getValidMoves(board) {
        const validMoves = [];

        for (let col = 0; col < board[0].length; col++) {
            if (board[0][col] === "E") {
                validMoves.push(col);
            }
        }

        return validMoves;
    }

    function isGameOver(board) {
        // Check for a win in rows
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length - 3; col++) {
                if (
                    board[row][col] !== "E" &&
                    board[row][col] === board[row][col + 1] &&
                    board[row][col] === board[row][col + 2] &&
                    board[row][col] === board[row][col + 3]
                ) {
                    return true;
                }
            }
        }

        // Check for a win in columns
        for (let col = 0; col < board[0].length; col++) {
            for (let row = 0; row < board.length - 3; row++) {
                if (
                    board[row][col] !== "E" &&
                    board[row][col] === board[row + 1][col] &&
                    board[row][col] === board[row + 2][col] &&
                    board[row][col] === board[row + 3][col]
                ) {
                    return true;
                }
            }
        }

        // Check for a win in diagonals (top-left to bottom-right)
        for (let row = 0; row < board.length - 3; row++) {
            for (let col = 0; col < board[row].length - 3; col++) {
                if (
                    board[row][col] !== "E" &&
                    board[row][col] === board[row + 1][col + 1] &&
                    board[row][col] === board[row + 2][col + 2] &&
                    board[row][col] === board[row + 3][col + 3]
                ) {
                    return true;
                }
            }
        }

        // Check for a win in diagonals (top-right to bottom-left)
        for (let row = 0; row < board.length - 3; row++) {
            for (let col = 3; col < board[row].length; col++) {
                if (
                    board[row][col] !== "E" &&
                    board[row][col] === board[row + 1][col - 1] &&
                    board[row][col] === board[row + 2][col - 2] &&
                    board[row][col] === board[row + 3][col - 3]
                ) {
                    return true;
                }
            }
        }

        // Check for a draw
        for (let row of board) {
            if (row.includes("E")) {
                return false;
            }
        }

        return true;
    }

    function evaluateBoard(board) {
        let score = 0;

        // Evaluate rows
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length - 3; col++) {
                const window = board[row].slice(col, col + 4);
                score += evaluateWindow(window);
            }
        }

        // Evaluate columns
        for (let col = 0; col < board[0].length; col++) {
            for (let row = 0; row < board.length - 3; row++) {
                const window = [
                    board[row][col],
                    board[row + 1][col],
                    board[row + 2][col],
                    board[row + 3][col]
                ];
                score += evaluateWindow(window);
            }
        }

        // Evaluate diagonals (top-left to bottom-right)
        for (let row = 0; row < board.length - 3; row++) {
            for (let col = 0; col < board[row].length - 3; col++) {
                const window = [
                    board[row][col],
                    board[row + 1][col + 1],
                    board[row + 2][col + 2],
                    board[row + 3][col + 3]
                ];
                score += evaluateWindow(window);
            }
        }

        // Evaluate diagonals (top-right to bottom-left)
        for (let row = 0; row < board.length - 3; row++) {
            for (let col = 3; col < board[row].length; col++) {
                const window = [
                    board[row][col],
                    board[row + 1][col - 1],
                    board[row + 2][col - 2],
                    board[row + 3][col - 3]
                ];
                score += evaluateWindow(window);
            }
        }

        return score;
    }

    function evaluateWindow(window) {
        const playerPieces = window.filter(cell => cell === player).length;
        const opponentPieces = window.filter(cell => cell === getOpponent(player)).length;
        const emptySpaces = window.filter(cell => cell === "E").length;

        if (playerPieces === 4) {
            return 100;
        } else if (playerPieces === 3 && emptySpaces === 1) {
            return 5;
        } else if (playerPieces === 2 && emptySpaces === 2) {
            return 2;
        } else if (opponentPieces === 3 && emptySpaces === 1) {
            return -4;
        } else {
            return 0;
        }
    }

    function makeMoveInBoard(board, col, player) {
        const newBoard = JSON.parse(JSON.stringify(board));

        for (let row = newBoard.length - 1; row >= 0; row--) {
            if (newBoard[row][col] === "E") {
                newBoard[row][col] = player;
                break;
            }
        }

        return newBoard;
    }

    function getOpponent(player) {
        return player === "R" ? "B" : "R";
    }

    setInterval(function() {
        const player = updateBoard();
        initAITurn(player);
    }, 1000);

    function initAITurn(player) {
        const boardState = getBoardState();
        const bestMove = getBestMove(player);
        makeMove(bestMove);
        //console.log("AI Prediction: " + evaluateBoard(boardState));
        //console.log("Next Move: " + bestMove);
    }

    function displayAIInfo() {
        const boardState = getBoardState();
        const validMoves = getValidMoves(boardState);
        const opponent = getOpponent(player);

        console.log("AI Information:");
        console.log("Player: " + player);
        console.log("Opponent: " + opponent);
        console.log("Valid Moves: " + validMoves);
        console.log("Board State:");
        console.log(boardState);
    }

    setInterval(() => {
        //displayAIInfo();
    }, 1000);



// Create a container for the dropdown
var dropdownContainer = document.createElement('div');
dropdownContainer.style.position = 'fixed';
dropdownContainer.style.bottom = '20px';
dropdownContainer.style.left = '20px';
dropdownContainer.style.zIndex = '9998';
dropdownContainer.style.backgroundColor = '#1b2837';
dropdownContainer.style.border = '1px solid #18bc9c';
dropdownContainer.style.borderRadius = '5px';

// Create a button to toggle the dropdown
var toggleButton = document.createElement('button');
toggleButton.textContent = 'Settings';
toggleButton.style.padding = '5px 10px';
toggleButton.style.border = 'none';
toggleButton.classList.add('btn', 'btn-secondary', 'mb-2', 'ng-star-inserted');
toggleButton.style.backgroundColor = '#007bff';
toggleButton.style.color = 'white';
toggleButton.style.borderRadius = '5px';
toggleButton.addEventListener('mouseover', function() {
    toggleButton.style.opacity = '0.5'; // Dim the button when hovered over
});
toggleButton.addEventListener('mouseout', function() {
    toggleButton.style.opacity = '1'; // Restore the button opacity when mouse leaves
});

// Create the dropdown content
var dropdownContent = document.createElement('div');
dropdownContent.style.display = 'none';
dropdownContent.style.padding = '8px';


// Create the "Auto Queue" tab
var autoQueueTab = document.createElement('div');
autoQueueTab.textContent = 'Auto Queue';
autoQueueTab.style.padding = '5px 0';
autoQueueTab.style.cursor = 'pointer';

// Create the "Depth Slider" tab
var depthSliderTab = document.createElement('div');
depthSliderTab.textContent = 'Depth Slider';
depthSliderTab.style.padding = '5px 0';
depthSliderTab.style.cursor = 'pointer';

// Create the settings for "Auto Queue"
var autoQueueSettings = document.createElement('div');
autoQueueSettings.textContent = 'Auto Queue Settings';
autoQueueSettings.style.display = 'none'; // Initially hidden
autoQueueSettings.style.padding = '10px';

// Create the settings for "Depth Slider"
var depthSliderSettings = document.createElement('div');
depthSliderSettings.style.display = 'none'; // Initially displayed for this tab
depthSliderSettings.style.padding = '10px';

// Create the depth slider
var depthSlider = document.createElement('input');
depthSlider.type = 'range';
depthSlider.min = '1';
depthSlider.max = '100';
var storedDepth = localStorage.getItem('depth');
depthSlider.value = storedDepth !== null ? storedDepth : '20';

// Add event listener to the depth slider
depthSlider.addEventListener('input', function(event) {
    var depth = Math.round(depthSlider.value);
    localStorage.setItem('depth', depth.toString());

    // Show the popup with the current depth value
    var popup = document.querySelector('.depth-popup'); // Use an existing popup or create a new one
    if (!popup) {
        popup = document.createElement('div');
        popup.classList.add('depth-popup');
        popup.style.position = 'fixed';
        popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        popup.style.color = 'white';
        popup.style.padding = '5px 10px';
        popup.style.borderRadius = '5px';
        popup.style.zIndex = '9999';
        popup.style.display = 'none';
        document.body.appendChild(popup);
    }

    popup.innerText = 'Depth: ' + depth;
    popup.style.display = 'block';

    // Calculate slider position and adjust popup position
    var sliderRect = depthSlider.getBoundingClientRect();
    var popupX = sliderRect.left + ((depthSlider.value - depthSlider.min) / (depthSlider.max - depthSlider.min)) * sliderRect.width - popup.clientWidth / 2;
    var popupY = sliderRect.top - popup.clientHeight - 10;

    popup.style.left = popupX + 'px';
    popup.style.top = popupY + 'px';

    // Start a timer to hide the popup after a certain duration (e.g., 2 seconds)
    setTimeout(function() {
        popup.style.display = 'none';
    }, 2000);
});

// Append the depth slider to the "Depth Slider" settings
depthSliderSettings.appendChild(depthSlider);


// Create the settings for "Auto Queue"
var autoQueueSettings = document.createElement('div');
autoQueueSettings.style.padding = '10px';

// Create the "Auto Queue" toggle button
var autoQueueToggleButton = document.createElement('button');
autoQueueToggleButton.textContent = 'Auto Queue Off';
autoQueueToggleButton.style.marginTop = '10px';
autoQueueToggleButton.style.display = 'none';
autoQueueToggleButton.classList.add('btn', 'btn-secondary', 'mb-2', 'ng-star-inserted');
autoQueueToggleButton.style.backgroundColor = 'red'; // Initially red for "Off"
autoQueueToggleButton.style.color = 'white';
autoQueueToggleButton.addEventListener('click', toggleAutoQueue);

autoQueueSettings.appendChild(autoQueueToggleButton);

var isAutoQueueOn = false; // Track the state

function toggleAutoQueue() {
    // Toggle the state
    isAutoQueueOn = !isAutoQueueOn;
    localStorage.setItem('isToggled', isAutoQueueOn);

    // Update the button text and style based on the state
    autoQueueToggleButton.textContent = isAutoQueueOn ? 'Auto Queue On' : 'Auto Queue Off';
    autoQueueToggleButton.style.backgroundColor = isAutoQueueOn ? 'green' : 'red';
}

function clickLeaveRoomButton() {
    var leaveRoomButton = document.querySelector("button.btn-light.ng-tns-c189-7");
    if (leaveRoomButton) {
        leaveRoomButton.click();
    }
}


function clickPlayOnlineButton() {
    var playOnlineButton = document.querySelector("button.btn-secondary.flex-grow-1");
    if (playOnlineButton) {
        playOnlineButton.click();
    }
}

// Periodically check for buttons when the toggle is on
function checkButtonsPeriodically() {
    if (isAutoQueueOn) {
        clickLeaveRoomButton();
        clickPlayOnlineButton();
    }
}




// Set up periodic checking
setInterval(checkButtonsPeriodically, 1000);


   // Append the toggle button to the "Auto Queue" settings
   autoQueueSettings.appendChild(autoQueueToggleButton);
 
   // Add event listeners to the tabs to toggle their respective settings
   autoQueueTab.addEventListener('click', function() {
       // Hide the depth slider settings
       depthSliderSettings.style.display = 'none';
       // Show the auto queue settings
       autoQueueSettings.style.display = 'block';
       autoQueueToggleButton.style.display = 'block';
   });

   depthSliderTab.addEventListener('click', function() {
       // Hide the auto queue settings
       autoQueueSettings.style.display = 'none';
       // Show the depth slider settings
       depthSliderSettings.style.display = 'block';
   });

   // Append the tabs and settings to the dropdown content
   dropdownContent.appendChild(autoQueueTab);
   dropdownContent.appendChild(autoQueueSettings);
   dropdownContent.appendChild(depthSliderTab);
   dropdownContent.appendChild(depthSliderSettings);

   // Append the button and dropdown content to the container
   dropdownContainer.appendChild(toggleButton);
   dropdownContainer.appendChild(dropdownContent);

   // Toggle the dropdown when the button is clicked
   toggleButton.addEventListener('click', function() {
       if (dropdownContent.style.display === 'none') {
           dropdownContent.style.display = 'block';
       } else {
           dropdownContent.style.display = 'none';
       }
   });

   // Append the dropdown container to the document body
   document.body.appendChild(dropdownContainer);
})();
