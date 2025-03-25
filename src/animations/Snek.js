import React, { useState } from 'react';
import { motion } from 'framer-motion';
// If using Create React App or Vite:
import ReactP5Wrapper from 'react-p5';
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function SnakeGamePopup({ open, setOpen }) {
  // We'll track whether the game has started
  const [gameStarted, setGameStarted] = React.useState(false);
  // Track if the player has died
  const [gameOver, setGameOver] = React.useState(false);

  // The snake game data stored in refs so it persists across renders
  const snakeRef = React.useRef([]);
  const foodRef = React.useRef({ x: 0, y: 0 });
  const directionRef = React.useRef({ x: 1, y: 0 });

  const gridSize = 20;

  // p5 setup function
  const setup = (p5, parentRef) => {
    p5.createCanvas(400, 400).parent(parentRef);
    // Slower speed for easier playing
    p5.frameRate(5);

    resetGame();
  };

  // Initialize or reset the snake
  const resetGame = () => {
    snakeRef.current = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
    ];
    directionRef.current = { x: 1, y: 0 };
  };

  // Place food at a random location
  const spawnFood = (p5) => {
    const cols = p5.floor(p5.width / gridSize);
    const rows = p5.floor(p5.height / gridSize);
    foodRef.current = {
      x: p5.floor(p5.random(cols)),
      y: p5.floor(p5.random(rows)),
    };
  };

  // Check if the snake runs into itself
  const checkSelfCollision = (head) => {
    const snake = snakeRef.current;
    // Compare head to every segment except the last one (which is the head)
    // Actually, you can include the last one if you haven't shifted the array yet
    for (let i = 0; i < snake.length - 1; i++) {
      const segment = snake[i];
      if (segment.x === head.x && segment.y === head.y) {
        return true;
      }
    }
    return false;
  };

  // The main draw loop
  const draw = (p5) => {
    p5.background(220);

    // If the game hasn’t started, show a “Click START” message
    if (!gameStarted) {
      p5.fill(0);
      p5.textSize(24);
      p5.textAlign(p5.CENTER, p5.CENTER);

      if (gameOver) {
        // If we died, show a message
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(24);
        p5.text('Game Over!', p5.width / 2, p5.height / 2 - 20);
        p5.text('Click START to try again.', p5.width / 2, p5.height / 2 + 20);
      } else {
        p5.text('Click START to play', p5.width / 2, p5.height / 2);
      }
      return;
    }

    // Move the snake
    const snake = snakeRef.current;
    const food = foodRef.current;
    const head = { ...snake[snake.length - 1] };

    head.x += directionRef.current.x;
    head.y += directionRef.current.y;

    snake.push(head);
    snake.shift(); // remove tail

    const cols = p5.floor(p5.width / gridSize);
    const rows = p5.floor(p5.height / gridSize);

    // Wrap around edges
    if (head.x < 0) head.x = cols - 1;
    if (head.x >= cols) head.x = 0;
    if (head.y < 0) head.y = rows - 1;
    if (head.y >= rows) head.y = 0;

    // Check collision with food
    if (head.x === food.x && head.y === food.y) {
      // Grow snake by duplicating its tail
      const tail = { ...snake[0] };
      snake.unshift(tail);
      spawnFood(p5);
    }

    // Check self-collision
    if (checkSelfCollision(head)) {
      // End the game
      setGameStarted(false);
      setGameOver(true);
      return; // Skip drawing the snake and food
    }

    // Draw snake
    p5.fill(0);
    snake.forEach((segment) => {
      p5.rect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });

    // Draw food
    p5.fill('red');
    p5.rect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
  };

  // Listen for arrow key presses
  const keyPressed = (p5) => {
    switch (p5.keyCode) {
      case p5.LEFT_ARROW:
        if (directionRef.current.x === 0) directionRef.current = { x: -1, y: 0 };
        break;
      case p5.RIGHT_ARROW:
        if (directionRef.current.x === 0) directionRef.current = { x: 1, y: 0 };
        break;
      case p5.UP_ARROW:
        if (directionRef.current.y === 0) directionRef.current = { x: 0, y: -1 };
        break;
      case p5.DOWN_ARROW:
        if (directionRef.current.y === 0) directionRef.current = { x: 0, y: 1 };
        break;
      default:
        break;
    }
  };

  // Start the game or restart if gameOver
  const handleStart = (p5) => {
    setGameOver(false);
    resetGame();
    setGameStarted(true);
  };

  return (
    <>
      {open && (
        <div 
            className="flex flex-col items-center justify-center gap-4 p-4"
            >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="rounded-2xl bg-white p-6 shadow-md"
            >
              <div className="flex justify-between justify-center px-2">
                <span className="text-2xl">Snek</span>

                {/* START button */}
                {!gameStarted && (
                    <button
                    type="button"
                    className="mb-4 block rounded-xl border px-4 py-2 text-base bg-lime-400 hover:bg-lime-300"
                    onClick={() => handleStart()}
                    >
                    START
                    </button>
                )}

                {/* Close button */}
                <button
                  type="button"
                  className="mb-4 block rounded-xl border px-4 py-2 text-sm hover:shadow"
                  onClick={() => {
                    setGameStarted(false);
                    setOpen(false);
                  }}
                >
                  Close
                </button>
              </div>

              

              {/* Snake game canvas */}
              <ReactP5Wrapper
                setup={setup}
                draw={draw}
                keyPressed={keyPressed}
              />
            </motion.div>
          </motion.div>
        </div>
      )}
    </>
  );
}
