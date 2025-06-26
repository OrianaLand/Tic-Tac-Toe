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
    let winner = winConditions.some((winCon) =>
      winCon.every((cell) => playerMoves.includes(cell))
    );

    return winner;
  };

  const resetGame = () => {
    // Reset game board and player states
    GameBoard.reset();
    for (let i = 0; i < players.length; i++) {
      players[i].cellsMarked = [];
    }
    // Start new game from round 1
    roundCounter = 1;
    printNewRound();
  };

  let roundCounter = 1;

  const playRound = (square) => {
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
          console.log(playerWon.name + " wins");
          resetGame();
          return;
        }
      }

      if (roundCounter === 9) {
        console.log("It's a tie!");
        resetGame();
        return;
      }

      switchPlayerTurn();
      roundCounter++;
    }
    printNewRound();
  };

  // Start of the game
  printNewRound();
  //returning getBoard method only for testing in console. It will be removed later on
  return { playRound, getActivePlayer, getBoard: () => GameBoard.getBoard() };
})();

const game = GameController;
