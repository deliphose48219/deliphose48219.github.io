/* global $, sessionStorage*/

////////////////////////////////////////////////////////////////////////////////
///////////////////////// VARIABLE DECLARATIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// HTML jQuery Objects
var board = $("#board");
var scoreElement = $("#score");
var highScoreElement = $("#highScore");

// Game Variables
var score = 0; // variable to keep track of the score
var started = false; // variable to keep track of whether the game has started

var apple = {};

const snake = {};

// Constant Variables
var ROWS = 20;
var COLUMNS = 20;
var SQUARE_SIZE = 20;
var KEY = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
};

// interval variable required for stopping the update function when the game ends
var updateInterval;

// variable to keep track of the key (keycode) last pressed by the user
var activeKey;
var restarting = false;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////// GAME SETUP //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

$("body").on("keydown", handleKeyDown);

// start the game
init();

function init() {
  board.empty();
  started = false;
  restarting = false;
  activeKey = undefined;
  snake.body = []; // Start with an empty body
  makeSnakeSquare(10, 10);
  makeSnakeSquare(10, 9);
  makeSnakeSquare(10, 8);
  snake.head = snake.body[0];
  snake.head.direction = "right";
  snake.body.forEach(function (snakeSquare) {
    snakeSquare.direction = snake.head.direction;
  });

  makeApple();
  updateInterval = setInterval(update, 100);
}

////////////////////////////////////////////////////////////////////////////////
///////////////////////// PROGRAM FUNCTIONS ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/*
 * On each update tick update the snake's position and check for
 * collisions with the walls.
 */
function update() {
  if (!started) {
    return;
  }

  var previousTailPosition = moveSnake();

  if (hasHitWall() || hasCollidedWithSnake()) {
    endGame();
    return;
  }

  if (hasCollidedWithApple()) {
    handleAppleCollision(previousTailPosition);
  }
}

function checkForNewDirection() {
  var directions = {};
  directions[KEY.LEFT] = "left";
  directions[KEY.RIGHT] = "right";
  directions[KEY.UP] = "up";
  directions[KEY.DOWN] = "down";

  var newDirection = directions[activeKey];
  if (!newDirection) {
    return;
  }

  var isMovingHorizontally =
    snake.head.direction === "left" || snake.head.direction === "right";
  var isNewDirectionHorizontal =
    newDirection === "left" || newDirection === "right";

  if (isMovingHorizontally !== isNewDirectionHorizontal) {
    snake.head.direction = newDirection;
  }
}

function moveSnake() {
  var tail = snake.tail;
  var previousTailPosition = {
    row: tail.row,
    column: tail.column,
    direction: tail.direction,
  };

  checkForNewDirection();

  for (var i = snake.body.length - 1; i > 0; i--) {
    moveBodyAToBodyB(snake.body[i], snake.body[i - 1]);
    repositionSquare(snake.body[i]);
  }

  if (snake.head.direction === "left") {
    snake.head.column--;
  } else if (snake.head.direction === "right") {
    snake.head.column++;
  } else if (snake.head.direction === "up") {
    snake.head.row--;
  } else if (snake.head.direction === "down") {
    snake.head.row++;
  }

  repositionSquare(snake.head);
  return previousTailPosition;
}

function hasHitWall() {
  return (
    snake.head.row < 0 ||
    snake.head.row >= ROWS ||
    snake.head.column < 0 ||
    snake.head.column >= COLUMNS
  );
}

function hasCollidedWithApple() {
  return snake.head.row === apple.row && snake.head.column === apple.column;
}

function handleAppleCollision(previousTailPosition) {
  score++;
  scoreElement.text("Score: " + score);

  apple.element.remove();
  makeSnakeSquare(previousTailPosition.row, previousTailPosition.column);
  snake.tail.direction = previousTailPosition.direction;

  if (!makeApple()) {
    endGame("You win! The board is full.");
  }
}

function hasCollidedWithSnake() {
  for (var i = 1; i < snake.body.length; i++) {
    if (
      snake.head.row === snake.body[i].row &&
      snake.head.column === snake.body[i].column
    ) {
      return true;
    }
  }

  return false;
}

function endGame(message) {
  clearInterval(updateInterval);
  started = false;
  restarting = true;

  highScoreElement.text("High Score: " + calculateHighScore());
  scoreElement.text("Score: 0");
  score = 0;

  board.empty();
  $("<div>")
    .addClass("game-over")
    .text(message || "Game over! Restarting...")
    .appendTo(board);

  setTimeout(init, 1000);
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/* Create an HTML element for the apple using jQuery. Then find a random
 * position on the board that is not occupied and position the apple there.
 */
function makeApple() {
  var randomPosition = getRandomAvailablePosition();
  if (!randomPosition) {
    return false;
  }

  apple.element = $("<div>").addClass("apple").appendTo(board);
  apple.row = randomPosition.row;
  apple.column = randomPosition.column;
  repositionSquare(apple);
  return true;
}

/* Create an HTML element for a snakeSquare using jQuery. Then, given a row and
 * column on the board, position it on the screen. Finally, add the new
 * snakeSquare to the snake.body Array and set a new tail.
 */
function makeSnakeSquare(row, column) {
  const snakeSquare = {};
  snakeSquare.element = $("<div>").addClass("snake").appendTo(board);
  snakeSquare.row = row;
  snakeSquare.column = column;

  repositionSquare(snakeSquare);

  if (snake.body.length === 0) {
    snakeSquare.element.attr("id", "snake-head");
  }

  snake.body.push(snakeSquare);
  snake.tail = snakeSquare;
}

function moveBodyAToBodyB(bodyA, bodyB) {
  bodyA.row = bodyB.row;
  bodyA.column = bodyB.column;
  bodyA.direction = bodyB.direction;
}

/* 
  event.which returns the keycode of the key that is pressed when the
  keydown event occurs
  
  The KEY Object creates a map for the Arrow Keys to their keycode:

    KEY.LEFT = 37
    KEY.UP = 38
    KEY.RIGHT = 39
    KEY.DOWN = 40
*/
function handleKeyDown(event) {
  var keyCodes = {
    ArrowLeft: KEY.LEFT,
    ArrowUp: KEY.UP,
    ArrowRight: KEY.RIGHT,
    ArrowDown: KEY.DOWN,
  };
  var keyCode = keyCodes[event.key] || event.which || event.keyCode;

  if (
    restarting ||
    (keyCode !== KEY.LEFT &&
      keyCode !== KEY.RIGHT &&
      keyCode !== KEY.UP &&
      keyCode !== KEY.DOWN)
  ) {
    return;
  }

  event.preventDefault();
  activeKey = keyCode;
  started = true;
}

/* Given a gameSquare (which may be a snakeSquare or the apple), position
 * the gameSquare on the screen.
 */
function repositionSquare(square) {
  var squareElement = square.element;
  var row = square.row;
  var column = square.column;

  var buffer = 20;

  // position the square on the screen according to the row and column
  squareElement.css("left", column * SQUARE_SIZE + buffer);
  squareElement.css("top", row * SQUARE_SIZE + buffer);
}

/* Returns a (row,column) Object that is not occupied by another game component
 */
function getRandomAvailablePosition() {
  var availablePositions = [];

  for (var row = 0; row < ROWS; row++) {
    for (var column = 0; column < COLUMNS; column++) {
      var isOccupied = snake.body.some(function (snakeSquare) {
        return snakeSquare.row === row && snakeSquare.column === column;
      });

      if (!isOccupied) {
        availablePositions.push({ row: row, column: column });
      }
    }
  }

  if (availablePositions.length === 0) {
    return null;
  }

  return availablePositions[
    Math.floor(Math.random() * availablePositions.length)
  ];
}

function calculateHighScore() {
  // retrieve the high score from session storage if it exists, or set it to 0
  var highScore = sessionStorage.getItem("highScore") || 0;

  if (score > highScore) {
    sessionStorage.setItem("highScore", score);
    highScore = score;
    alert("New High Score!");
  }

  return highScore;
}
