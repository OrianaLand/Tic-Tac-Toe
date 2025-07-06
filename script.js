const GameBoard = (() => {
  const rows = 3;
  const columns = 3;
  let board = [];

  const generateBoard = () => {
    board = [];
    let cellCounter = 1;
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < columns; j++) {
        board[i].push(cell(cellCounter));
        cellCounter++;
      }
    }
  };

  const getBoard = () => board;

  const placeMark = (square, playerMark) => {
    if (square.getValue()) {
      console.log("cell is occupied! Try again");
      return false;
    }
    square.addMark(playerMark);
    console.log("mark placed");
    return true;
  };

  //prints board state on the console just for visual aid.
  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
    console.log(boardWithCellValues);
  };

  generateBoard();

  return { getBoard, placeMark, printBoard, reset: generateBoard };
})();

function cell(cellNum) {
  let value = 0;

  const addMark = (playerMark) => (value = playerMark);
  const getValue = () => value;
  const cellNumber = cellNum;

  return { addMark, getValue, cellNumber };
}

const GameController = ((
  playerOneName = "Player one (X)",
  playerTwoName = "Player Two (O)"
) => {
  const players = [
    {
      name: playerOneName,
      mark: 1,
      cellsMarked: [],
    },
    {
      name: playerTwoName,
      mark: 2,
      cellsMarked: [],
    },
  ];

  // Win conditions use cell numbers 1–9 (not array indices):
  const winConditions = [
    [1, 2, 3], //these match cell.cellNumber, not board[row][col] indices
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];

  let activePlayer = players[0];
  let winner = "";
  let gameOver = false;
  let tie = false;

  const isGameOver = () => gameOver;

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    GameBoard.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  const storeMarkedCell = (player, square) => {
    player.cellsMarked.push(square.cellNumber);
    player.cellsMarked.sort(function (a, b) {
      return a - b;
    });
    console.log(player.cellsMarked);
  };

  const isWinningRound = (playerMoves) => {
    return winConditions.some((winCon) =>
      winCon.every((cell) => playerMoves.includes(cell))
    ); //retuns a boolean based on if a win condition is found
  };

  const resetGame = () => {
    // Reset game board and player states
    GameBoard.reset();
    for (let i = 0; i < players.length; i++) {
      players[i].cellsMarked = [];
    }
    // Start new game from round 1
    roundCounter = 1;
    gameOver = false; // Allow playing again
    printNewRound();
  };

  let roundCounter = 1;

  const playRound = (square) => {
    if (gameOver)
      return {
        gameEnded: true,
        message: "Game has ended. Reset board to play again",
        winner,
      };

    console.log(`Round #${roundCounter}`);
    console.log(`${getActivePlayer().name} mark is ${getActivePlayer().mark}`);
    const markPlaced = GameBoard.placeMark(square, getActivePlayer().mark);
    if (markPlaced) {
      storeMarkedCell(getActivePlayer(), square);

      if (roundCounter > 4) {
        //Check if the mark placed wins the game
        console.log("5 MOVES. CHECK FOR A WINNER!");
        let playerCellsMarked = getActivePlayer().cellsMarked;
        console.log(isWinningRound(playerCellsMarked));

        if (isWinningRound(playerCellsMarked)) {
          let playerWon = getActivePlayer();
          winner = playerWon.name;
          console.log(playerWon.name + " wins");
          gameOver = true; //prevents more moves
          /* switchPlayerTurn();
          resetGame(); */

          return {
            gameEnded: true,
            message: `${playerWon.name} wins!`,
            winner,
          };
        }
      }

      if (roundCounter === 9) {
        console.log("It's a tie!");
        gameOver = true;
        tie = true;
        /* switchPlayerTurn();
        resetGame(); */
        return { gameEnded: true, message: "It's a tie!", winner: "" };
      }

      switchPlayerTurn();
      roundCounter++;
    }
    printNewRound();
    return { gameEnded: false };
  };

  // Start of the game
  printNewRound();

  return {
    playRound,
    getActivePlayer,
    switchPlayerTurn,
    getBoard: () => GameBoard.getBoard(),
    resetGame,
    isGameOver,
  };
})();

const DisplayController = (() => {
  const game = GameController;
  const playerTurn = document.querySelector(".turn");
  const boardContainer = document.querySelector(".board");
  const resetBtn = document.querySelector("button");

  // Add one listener to the container
  boardContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("cell")) {
      const row = parseInt(e.target.dataset.row);
      const col = parseInt(e.target.dataset.col);
      const board = game.getBoard();
      const cell = board[row][col];
      //Store the state of the game to show win/tie message
      const result = game.playRound(cell);

      if (result && result.gameEnded) {
        showMessage(result.winner, result.gameEnded);
      }

      renderBoard();
    }
  });

  resetBtn.addEventListener("click", () => {
    game.resetGame();
    game.switchPlayerTurn(); //This might be removed later
    renderBoard();
    clearMessage();
  });

  const renderBoard = () => {
    boardContainer.textContent = "";
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer().name;

    if (game.isGameOver()) {
      playerTurn.textContent = "Game Over";
    } else {
      playerTurn.textContent = activePlayer;
    }

    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        const cellDiv = document.createElement("div");
        cellDiv.classList.add("cell");
        cellDiv.dataset.row = i;
        cellDiv.dataset.col = j;

        const value = cell.getValue();
        if (value === 1) cellDiv.textContent = "X";
        else if (value === 2) cellDiv.textContent = "O";

        boardContainer.appendChild(cellDiv);
      });
    });
  };

  const showMessage = (winner, gameEnded) => {
    const winnerMessage = document.querySelector(".winner-message");
    const gameoverMessage = document.querySelector(".gameover-message");

    if (!winner && gameEnded) {
      winnerMessage.textContent = "It's a Tie!";
      playerTurn.textContent = "Game Over";
    }

    if (winner) {
      winnerMessage.textContent = `${winner} is the winner!`;
      playerTurn.textContent = "Game Over";
    }
    winnerMessage.style.display = "block";
    gameoverMessage.style.display = "block";
  };

  const clearMessage = () => {
    const winnerMessage = document.querySelector(".winner-message");
    const gameoverMessage = document.querySelector(".gameover-message");
    gameoverMessage.style.display = "none";
    winnerMessage.style.display = "none";
  };

  renderBoard();
})();

//Hacer commit
//Revisar aplicar sugerencias de Claudita sobre el player turn display cuando termina el juego
