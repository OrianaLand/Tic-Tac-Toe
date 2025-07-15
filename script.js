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
        board[i].push(cell(cellCounter)); // Assign a number 1-9 to each cell to check win conditions
        cellCounter++;
      }
    }
  };

  const getBoard = () => board;

  const placeMark = (square, playerMark) => {
    if (square.getValue()) {
      //Don't place a mark on an occupied cell
      return false;
    }
    square.addMark(playerMark);
    return true;
  };

  //prints board state on the console just for visual aid.
  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
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

const GameController = (() => {
  let players = [
    {
      name: "",
      mark: 1,
      cellsMarked: [],
      gamesWon: 0,
    },
    {
      name: "",
      mark: 2,
      cellsMarked: [],
      gamesWon: 0,
    },
  ];

  // Win conditions use cell numbers 1–9 (not array indices):
  const winConditions = [
    [1, 2, 3],
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
  };

  const storeMarkedCell = (player, square) => {
    player.cellsMarked.push(square.cellNumber);
    player.cellsMarked.sort(function (a, b) {
      return a - b;
    });
  };

  const isWinningRound = (playerMoves) => {
    return winConditions.some((winCon) =>
      winCon.every((cell) => playerMoves.includes(cell))
    ); //retuns a boolean based on if a win condition is found
  };

  const resetGame = () => {
    // Reset game board and player states
    GameBoard.reset();
    activePlayer = players[0];
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
        playerWon,
      };

    const markPlaced = GameBoard.placeMark(square, getActivePlayer().mark);

    if (markPlaced) {
      storeMarkedCell(getActivePlayer(), square);

      if (roundCounter > 4) {
        //Check if the mark placed wins the game
        let playerCellsMarked = getActivePlayer().cellsMarked;

        if (isWinningRound(playerCellsMarked)) {
          let playerWon = getActivePlayer();
          winner = playerWon.name;
          playerWon.gamesWon++; // Increments winner's counter
          gameOver = true; // Prevents more moves

          return {
            gameEnded: true,
            message: `${playerWon.name} wins!`,
            winner,
            playerWon,
          };
        }
      }

      if (roundCounter === 9) {
        gameOver = true;
        tie = true;

        return { gameEnded: true, message: "It's a tie!", winner: "" };
      }

      switchPlayerTurn();
      roundCounter++;
    }
    printNewRound();
    return { gameEnded: false };
  };

  const updatePlayersName = (playerOneName, playerTwoName) => {
    players[0].name = playerOneName || "Player 1 (X)";
    players[1].name = playerTwoName || "Player 2 (O)";
  };

  const getGameStats = () => {
    return {
      playerOne: {
        name: players[0].name,
        gamesWon: players[0].gamesWon,
      },
      playerTwo: {
        name: players[1].name,
        gamesWon: players[1].gamesWon,
      },
    };
  };

  const resetPlayersWonGames = () => {
    players[0].gamesWon = 0;
    players[1].gamesWon = 0;
  };

  // Start of the game
  printNewRound();

  return {
    playRound,
    getActivePlayer,
    switchPlayerTurn,
    getBoard: () => GameBoard.getBoard(),
    resetGame,
    updatePlayersName,
    resetPlayersWonGames,
    getGameStats,
    isGameOver,
  };
})();

const DisplayController = (() => {
  const game = GameController;
  const playerTurn = document.querySelector(".turn");
  const boardContainer = document.querySelector(".board");
  const startBtn = document.querySelector("#start-game");
  const resetBtn = document.querySelector("#reset-board");
  const newGameBtn = document.querySelector("#new-game");
  const playerOneInput = document.querySelector("#player-one");
  const playerTwoInput = document.querySelector("#player-two");
  const turnText = "'s turn";
  const playerOneScore = document.querySelector(".player-one-score");
  const playerTwoScore = document.querySelector(".player-two-score");

  const updateScoreDisplay = () => {
    const stats = game.getGameStats();

    playerOneScore.textContent = stats.playerOne.gamesWon;
    playerTwoScore.textContent = stats.playerTwo.gamesWon;
  };

  startBtn.addEventListener("click", () => {
    const playerOne = playerOneInput.value || "Player 1 (x)";
    const playerTwo = playerTwoInput.value || "Player 2 (o)";
    game.updatePlayersName(playerOne, playerTwo);
    game.resetGame();
    renderBoard();
    updateScoreDisplay();

    startBtn.style.display = "none";
    resetBtn.style.display = "inline";
    newGameBtn.style.display = "inline";
    playerTurn.textContent = `${game.getActivePlayer().name}${turnText}`;
    /* game.getActivePlayer().name; */

    playerOneInput.disabled = true;
    playerTwoInput.disabled = true;
    document.querySelector(".board").classList.remove("disabled");
  });

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
        updateScoreDisplay();
        document.querySelector(".board").classList.add("disabled");
      }

      renderBoard(row, col);
    }
  });

  resetBtn.addEventListener("click", () => {
    const currentPlayer = game.getActivePlayer();
    game.resetGame();

    //Keeps the same active player so that only the board is reset
    if (currentPlayer.mark !== 1) {
      game.switchPlayerTurn();
    }
    renderBoard();
    clearMessage();
    document.querySelector(".board").classList.remove("disabled");
  });

  newGameBtn.addEventListener("click", () => {
    boardContainer.classList.add("disabled");

    game.resetGame();
    game.resetPlayersWonGames();
    renderBoard();
    clearMessage();
    updateScoreDisplay();

    startBtn.style.display = "inline";
    resetBtn.style.display = "none";
    newGameBtn.style.display = "none";
    playerTurn.textContent = "";

    playerOneInput.disabled = false;
    playerTwoInput.disabled = false;
    playerOneInput.value = "";
    playerTwoInput.value = "";
  });

  const renderBoard = (newRow = null, newCol = null) => {
    boardContainer.textContent = "";
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer().name;
    updateScoreDisplay();

    if (game.isGameOver()) {
      playerTurn.textContent = "Game Over";
    } else if (activePlayer) {
      playerTurn.textContent = `${activePlayer}${turnText}`;
    }

    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        const cellDiv = document.createElement("div");
        cellDiv.classList.add("cell");
        cellDiv.dataset.row = i;
        cellDiv.dataset.col = j;

        const value = cell.getValue();
        if (value === 1) {
          const mark = document.createElement("span");
          mark.textContent = "X";
          mark.classList.add("player-one");
          // Only animate if this is the new cell being marked
          if (i === newRow && j === newCol) {
            mark.classList.add("cell-mark");
          }
          cellDiv.appendChild(mark);
        } else if (value === 2) {
          const mark = document.createElement("span");
          mark.textContent = "O";
          mark.classList.add("player-two");
          // Only animate if this is the new cell being marked
          if (i === newRow && j === newCol) {
            mark.classList.add("cell-mark");
          }
          cellDiv.appendChild(mark);
        }
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
