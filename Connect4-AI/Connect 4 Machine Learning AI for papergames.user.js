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
    
    
    function updateBoard() {
  
      var profileOpeners = document.querySelectorAll(".text-truncate.cursor-pointer");
      var profileOpener = null;
  
      profileOpeners.forEach(function(opener) {
          if (opener.textContent.trim() === username) {
              profileOpener = opener;
          }
      });
  
      console.log("Profile Opener: ", profileOpener); // Debug log for the profile opener element
  
      var chronometer = document.querySelector("app-chronometer");
      console.log("Chronometer Element: ", chronometer); // Debug log for the chronometer element
  
       var numberElement;
      if (profileOpener.parentNode.querySelectorAll("span[_ngcontent-serverapp-c155]").length > 0) {
          numberElement = profileOpener.parentNode.querySelectorAll("span[_ngcontent-serverapp-c155]")[2]; // Select the third element with the number
      } else if (profileOpener.parentNode.querySelectorAll("span[_ngcontent-serverapp-c154]").length > 0) {
          numberElement = profileOpener.parentNode.querySelectorAll("span[_ngcontent-serverapp-c154]")[2]; // Select the third element with the number
      } else if (profileOpener.parentNode.querySelectorAll("span[_ngcontent-serverapp-c153]").length > 0) {
          numberElement = profileOpener.parentNode.querySelectorAll("span[_ngcontent-serverapp-c153]")[2]; // Select the third element with the number
      }
      var profileOpenerParent = profileOpener.parentNode.parentNode;
      console.log("Profile Opener Parent: ", profileOpenerParent); // Debug log for the profile opener parent element
                   var svgElementDark = profileOpenerParent.querySelector("circle.circle-dark");
                   var svgElementLight = profileOpenerParent.querySelector("circle.circle-light");
  
  console.log("dark-svg", svgElementDark)
  console.log("light-svg", svgElementLight)
                   if (svgElementDark) {
                       player = 'R'; // Player is playing as "R"
                   } else if (svgElementLight) {
                       player = 'B'; // Player is playing as "B"
                   }
      //console.log("svgElement", svgElement);
  
      console.log("Number Element: ", numberElement); // Debug log for the number element
      var currentElement = chronometer || numberElement; // Use chronometer if it exists, otherwise use the number element
      console.log("Current Element: ", currentElement); // Debug log for the current element
  
      console.log("Cell: ", cell);
      console.log("Current Element: ", currentElement);
  
      if (cell && currentElement.textContent !== prevChronometerValue && profileOpener) {
          prevChronometerValue = currentElement.textContent;
          simulateCellClick(cell);
      } else {
          console.log("Waiting for AI's turn...");
      }
  
      return player;
  }
  
  var player;
  
  //updateBoard();
  setInterval(function() {
    updateBoard();
      console.log("Profile Opener: ", profileOpener);
      console.log("Chronometer Element: ", chronometer);
      console.log("Profile Opener Parent: ", profileOpenerParent);
      console.log("svgElement", svgElement);
      console.log("Number Element: ", numberElement);
      console.log("Current Element: ", currentElement);
  }, 1000);
  
  
  
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
  
    function makeRandomMove() {
        const boardContainer = document.querySelector("#connect4 > table");
        const rows = boardContainer.querySelectorAll("tr");
        const row = rows[rows.length - 1]; // Select the bottom row
        const cells = row.querySelectorAll("td");
  
        // Select a random cell
        const randomCellIndex = Math.floor(Math.random() * cells.length);
        const cell = cells[randomCellIndex];
  
        // Click the cell
        simulateCellClick(cell);
    }
  
    function initAITurn() {
  
    
      console.log("Player: ", player);
      const boardState = getBoardState();
      console.log("Board State: ", boardState);
  
      // Determine the player the AI is playing as
      if (!player) {
          for (let row of boardState) {
              for (let cell of row) {
                  if (cell !== "E") {
                      player = cell === "R" ? "B" : "R";
                      break;
                  }
              }
  
              if (player) {
                  break;
              }
          }
      }
  
  
      // Make a random move
      makeRandomMove();
  }
  
  setInterval(function() {
      const player = updateBoard();
      initAITurn(player);
  }, 1000);
  
    setInterval(function() {
        initAITurn();
    }, 1000);
  })();
  
  function displayAIBoard() {
    const boardState = boardState();
    for (let row = 0; row < boardState.length; row++) {
      let rowString = "";
      for (let col = 0; col < boardState[row].length; col++) {
        rowString += boardState[row][col] + " ";
        if (col < boardState[row].length - 1) {
          rowString += "|";
        }
      }
      console.log(rowString);
    }
  }
  
  setInterval(() => {
    displayAIBoard();
  }, 1000);
  
  