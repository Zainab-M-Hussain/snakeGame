'use client';
import React, { useState, useEffect, useRef } from "react";

const GRID_SIZE = 20;
const SPEED = 200; // Snake speed in ms

type Position = {
  x: number;
  y: number;
};

const App: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<"UP" | "DOWN" | "LEFT" | "RIGHT">("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [boxSize, setBoxSize] = useState(20); // Size of each grid box
  const gameLoop = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate random position for food
  const generateFood = () => ({
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  });

  // Handle keypress for direction
  const handleKeyPress = (e: KeyboardEvent) => {
    if (gameOver) return;
    switch (e.key) {
      case "ArrowUp":
        if (direction !== "DOWN") setDirection("UP");
        break;
      case "ArrowDown":
        if (direction !== "UP") setDirection("DOWN");
        break;
      case "ArrowLeft":
        if (direction !== "RIGHT") setDirection("LEFT");
        break;
      case "ArrowRight":
        if (direction !== "LEFT") setDirection("RIGHT");
        break;
    }
  };

  // Move the snake
  const moveSnake = () => {
    const newSnake = [...snake];
    const head = newSnake[0];

    let newHead: Position;
    switch (direction) {
      case "UP":
        newHead = { x: head.x, y: (head.y - 1 + GRID_SIZE) % GRID_SIZE };
        break;
      case "DOWN":
        newHead = { x: head.x, y: (head.y + 1) % GRID_SIZE };
        break;
      case "LEFT":
        newHead = { x: (head.x - 1 + GRID_SIZE) % GRID_SIZE, y: head.y };
        break;
      case "RIGHT":
        newHead = { x: (head.x + 1) % GRID_SIZE, y: head.y };
        break;
      default:
        return;
    }

    // Check for collision with itself
    if (newSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(newHead);

    // Check if food is eaten
    if (newHead.x === food.x && newHead.y === food.y) {
      setFood(generateFood());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  // Start game loop
  useEffect(() => {
    if (gameOver) return;
    gameLoop.current = setInterval(moveSnake, SPEED);
    return () => {
      if (gameLoop.current) clearInterval(gameLoop.current);
    };
  }, [snake, direction, gameOver]);

  // Handle keyboard events
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction, gameOver]);

  // Adjust box size based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newBoxSize = width < 500 ? Math.floor(width / GRID_SIZE) - 2 : 20;
      setBoxSize(newBoxSize);
    };

    handleResize(); // Set initial size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Snake Game</h1>
      {gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
            onClick={() => {
              setSnake([{ x: 10, y: 10 }]);
              setFood(generateFood());
              setDirection("RIGHT");
              setGameOver(false);
            }}
          >
            Restart
          </button>
        </div>
      ) : (
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${boxSize}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${boxSize}px)`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={index}
                className={`w-${boxSize} h-${boxSize} ${
                  isSnake ? "bg-green-500" : isFood ? "bg-red-500" : "bg-gray-800"
                }`}
                style={{ width: `${boxSize}px`, height: `${boxSize}px` }}
              ></div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default App;

