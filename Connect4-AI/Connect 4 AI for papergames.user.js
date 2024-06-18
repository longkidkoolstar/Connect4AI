// ==UserScript==
// @name         Connect 4 AI for papergames
// @namespace    https://github.com/longkidkoolstar
// @version      0.4
// @description  Adds an AI player to Connect 4 on papergames.io
// @author       longkidkoolstar
// @icon         https://th.bing.com/th/id/R.2ea02f33df030351e0ea9bd6df0db744?rik=Pnmqtc4WLvL0ow&pid=ImgRaw&r=0
// @match        https://papergames.io/*
// @license      none
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var username = localStorage.getItem('username');

    if (!username) {
        alert('Username is not stored in local storage.');
        username = prompt('Please enter your Papergames username (case-sensitive):');
        localStorage.setItem('username', username);
    }

    var player;
    var opponent;
    var prevChronometerValue = '';
    const MAX_DEPTH = 4; // Increase the maximum depth for better decision-making

    function updateBoard() {
        var profileOpeners = document.querySelectorAll(".text-truncate.cursor-pointer");
        var profileOpener = Array.from(profileOpeners).find(opener => opener.textContent.trim() === username);

        var chronometer = document.querySelector("app-chronometer");
        var numberElement;

        if (profileOpener) {
            var profileParent = profileOpener.parentNode;
            var numberElement = profileOpener.parentNode.querySelectorAll("span")[4];

            var profileOpenerParent = profileOpener.parentNode.parentNode;
            var svgElementDark = profileOpenerParent.querySelector("circle.circle-dark");
            var svgElementLight = profileOpenerParent.querySelector("circle.circle-light");

            if (svgElementDark) {
                player = 'R';
                opponent = 'B';
            } else if (svgElementLight) {
                player = 'B';
                opponent = 'R';
            }
        }

        var currentElement = chronometer || numberElement;
        if (currentElement && currentElement.textContent !== prevChronometerValue && profileOpener) {
            prevChronometerValue = currentElement.textContent;
            simulateCellClick(findBestMove(getBoardState(), player, opponent));
        }
    }

    function getBoardState() {
        const boardContainer = document.querySelector("#connect4 > table");
        const rows = boardContainer.querySelectorAll("tr");
        let boardState = [];

        rows.forEach(row => {
            let rowState = [];
            row.querySelectorAll("td").forEach(cell => {
                if (cell.querySelector("circle.circle-dark")) {
                    rowState.push("R");
                } else if (cell.querySelector("circle.circle-light")) {
                    rowState.push("B");
                } else {
                    rowState.push("E");
                }
            });
            boardState.push(rowState);
        });

        return boardState;
    }

    function simulateCellClick(cell) {
        var event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        });
        cell.dispatchEvent(event);
    }

    function findBestMove(boardState, player, opponent) {
        let bestScore = -Infinity;
        let bestMove = null;

        let moves = [];
        for (let col = 0; col < boardState[0].length; col++) {
            const row = getAvailableRow(boardState, col);
            if (row !== -1) {
                boardState[row][col] = player;
                let score = evaluateBoard(boardState, player, opponent);
                boardState[row][col] = "E";
                moves.push({ col, score });
            }
        }

        moves.sort((a, b) => b.score - a.score);

        for (let move of moves) {
            const row = getAvailableRow(boardState, move.col);
            boardState[row][move.col] = player;
            let score = minimax(boardState, 0, false, player, opponent, -Infinity, Infinity);
            boardState[row][move.col] = "E";
            if (score > bestScore) {
                bestScore = score;
                bestMove = move.col;
            }
        }

        const boardContainer = document.querySelector("#connect4 > table");
        const rows = boardContainer.querySelectorAll("tr");
        const bottomRow = rows[rows.length - 1];
        const cells = bottomRow.querySelectorAll("td");
        return cells[bestMove];
    }

    function getAvailableRow(boardState, col) {
        for (let row = boardState.length - 1; row >= 0; row--) {
            if (boardState[row][col] === "E") {
                return row;
            }
        }
        return -1;
    }

    function minimax(boardState, depth, isMaximizing, player, opponent, alpha, beta) {
        let result = checkWinner(boardState);
        if (result !== null) {
            if (result === player) {
                return 10 - depth;
            } else if (result === opponent) {
                return depth - 10;
            } else {
                return 0;
            }
        }

        if (depth >= MAX_DEPTH) {
            return evaluateBoard(boardState, player, opponent);
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let col = 0; col < boardState[0].length; col++) {
                const row = getAvailableRow(boardState, col);
                if (row !== -1) {
                    boardState[row][col] = player;
                    let score = minimax(boardState, depth + 1, false, player, opponent, alpha, beta);
                    boardState[row][col] = "E";
                    bestScore = Math.max(score, bestScore);
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let col = 0; col < boardState[0].length; col++) {
                const row = getAvailableRow(boardState, col);
                if (row !== -1) {
                    boardState[row][col] = opponent;
                    let score = minimax(boardState, depth + 1, true, player, opponent, alpha, beta);
                    boardState[row][col] = "E";
                    bestScore = Math.min(score, bestScore);
                    beta = Math.min(beta, score);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
            return bestScore;
        }
    }

    function evaluateBoard(boardState, player, opponent) {
        let score = 0;
        score += evaluateDirection(boardState, player, opponent, 0, 1); // Horizontal
        score += evaluateDirection(boardState, player, opponent, 1, 0); // Vertical
        score += evaluateDirection(boardState, player, opponent, 1, 1); // Diagonal /
        score += evaluateDirection(boardState, player, opponent, 1, -1); // Diagonal \

        return score;
    }

    function evaluateDirection(boardState, player, opponent, dx, dy) {
        let score = 0;

        for (let row = 0; row < boardState.length; row++) {
            for (let col = 0; col < boardState[0].length; col++) {
                let playerCount = 0;
                let opponentCount = 0;

                for (let i = 0; i < 4; i++) {
                    const x = row + dx * i;
                    const y = col + dy * i;

                    if (x >= 0 && x < boardState.length && y >= 0 && y < boardState[0].length) {
                        if (boardState[x][y] === player) {
                            playerCount++;
                        } else if (boardState[x][y] === opponent) {
                            opponentCount++;
                        }
                    }
                }

                if (playerCount > 0 && opponentCount === 0) {
                    score += Math.pow(10, playerCount);
                } else if (opponentCount > 0 && playerCount === 0) {
                    score -= Math.pow(10, opponentCount);
                }
            }
        }

        return score;
    }

    function checkWinner(boardState) {
        const directions = [
            { x: 0, y: 1 },  // horizontal
            { x: 1, y: 0 },  // vertical
            { x: 1, y: 1 },  // diagonal /
            { x: 1, y: -1 }  // diagonal \
        ];

        for (let row = 0; row < boardState.length; row++) {
            for (let col = 0; col < boardState[0].length; col++) {
                if (boardState[row][col] !== "E") {
                    const current = boardState[row][col];
                    for (let direction of directions) {
                        let count = 0;
                        for (let i = 0; i < 4; i++) {
                            const x = row + direction.x * i;
                            const y = col + direction.y * i;
                            if (x >= 0 && x < boardState.length && y >= 0 && y < boardState[0].length && boardState[x][y] === current) {
                                count++;
                            } else {
                                break;
                            }
                        }
                        if (count === 4) {
                            return current;
                        }
                    }
                }
            }
        }

        for (let row of boardState) {
            if (row.includes("E")) {
                return null;
            }
        }

        return "Draw";
    }

    setInterval(function() {
        updateBoard();
    }, 1000);
})();
