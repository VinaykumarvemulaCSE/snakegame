import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause } from 'lucide-react';

const GRID_SIZE = 25;
const TILE_COUNT = 20; 
const CANVAS_SIZE = 500;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 140; // ms per tick

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [corruptionMode, setCorruptionMode] = useState(false);
  
  const [scorePopups, setScorePopups] = useState<Array<{ id: number, x: number, y: number, text: string }>>([]);
  const [isShaking, setIsShaking] = useState(false);
  
  const directionRef = useRef(INITIAL_DIRECTION);
  const lastMoveDirectionRef = useRef(INITIAL_DIRECTION);
  const inputQueueRef = useRef<{x: number, y: number}[]>([]);
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('snakeHighScore', highScore.toString());
  }, [highScore]);

  // Generate random food
  const generateFood = (currentSnake: {x: number, y: number}[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
      };
      // eslint-disable-next-line no-loop-func
      const collision = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!collision) break;
    }
    return newFood;
  };

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    lastMoveDirectionRef.current = INITIAL_DIRECTION;
    inputQueueRef.current = [];
    setScore(0);
    setGameOver(false);
    setIsStarted(true);
    setIsPaused(false);
    setCorruptionMode(false);
    setFood(generateFood(INITIAL_SNAKE));
  };

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "w", "a", "s", "d"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      if (e.key === ' ' && isStarted && !gameOver) {
        setIsPaused(p => !p);
        return;
      }

      if (e.key === ' ' && (!isStarted || gameOver)) {
        startGame();
        return;
      }

      if (isPaused || !isStarted || gameOver) return;

      const baseDirection = inputQueueRef.current.length > 0 
        ? inputQueueRef.current[inputQueueRef.current.length - 1] 
        : lastMoveDirectionRef.current;

      const { x, y } = baseDirection;
      const key = e.key.toLowerCase();
      let newDirection = null;
      
      switch (key) {
        case 'arrowup':
        case 'w':
          if (y !== 1) newDirection = { x: 0, y: -1 };
          break;
        case 'arrowdown':
        case 's':
          if (y !== -1) newDirection = { x: 0, y: 1 };
          break;
        case 'arrowleft':
        case 'a':
          if (x !== 1) newDirection = { x: -1, y: 0 };
          break;
        case 'arrowright':
        case 'd':
          if (x !== -1) newDirection = { x: 1, y: 0 };
          break;
      }
      
      if (newDirection) {
         if (inputQueueRef.current.length < 2) {
           inputQueueRef.current.push(newDirection);
           directionRef.current = newDirection;
         }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, gameOver, isPaused]);

  // Game Loop
  useEffect(() => {
    if (!isStarted || gameOver || isPaused) return;

    const moveSnake = () => {
      // Process input queue
      if (inputQueueRef.current.length > 0) {
        directionRef.current = inputQueueRef.current.shift()!;
      }
      
      lastMoveDirectionRef.current = directionRef.current;
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        head.x += directionRef.current.x;
        head.y += directionRef.current.y;

        // Death condition
        if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT || 
            prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        if (head.x === food.x && head.y === food.y) {
          setScore(s => {
            const newScore = s + 16; // 16 bytes per food
            setHighScore(h => Math.max(h, newScore));
            if (newScore > 0 && newScore % 80 === 0) {
                setCorruptionMode(true);
                setTimeout(() => setCorruptionMode(false), 500);
            }
            return newScore;
          });
          
          // Visual Feedback Effect
          const popupId = Date.now() + Math.random();
          setScorePopups(prev => [...prev, { id: popupId, x: head.x, y: head.y, text: '+16' }]);
          setIsShaking(true);
          
          setTimeout(() => {
             setScorePopups(prev => prev.filter(p => p.id !== popupId));
          }, 800);
          setTimeout(() => setIsShaking(false), 300);

          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const currentSpeed = Math.max(30, BASE_SPEED - Math.floor(score / 50) * 5);
    gameLoopRef.current = window.setInterval(moveSnake, currentSpeed);

    return () => {
      if (gameLoopRef.current) window.clearInterval(gameLoopRef.current);
    };
  }, [isStarted, gameOver, isPaused, food, score]);

  // Helper for mobile controls
  const handleMobileInput = (newDir: {x: number, y: number}) => {
     if (isPaused || !isStarted || gameOver) return;
     const baseDirection = inputQueueRef.current.length > 0 
        ? inputQueueRef.current[inputQueueRef.current.length - 1] 
        : lastMoveDirectionRef.current;
        
     const invalidReverse = (baseDirection.x !== 0 && newDir.x === -baseDirection.x) || 
                            (baseDirection.y !== 0 && newDir.y === -baseDirection.y);
                            
     if (!invalidReverse && inputQueueRef.current.length < 2) {
       inputQueueRef.current.push(newDir);
       directionRef.current = newDir;
     }
  };

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Base Fill
    ctx.fillStyle = '#050505'; 
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (!isStarted && !gameOver) return;

    // Draw Grid Background lines to look like raw memory sectors
    ctx.strokeStyle = '#ff00ff22';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw Food (Data Packet)
    ctx.shadowBlur = 15;
    ctx.shadowColor = corruptionMode ? '#fffb00' : '#ff00ff';
    ctx.fillStyle = corruptionMode ? '#fffb00' : '#ff00ff'; // Yellow or Magenta
    ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    
    // Draw Snake (Memory Corruption)
    snake.forEach((segment, index) => {
      ctx.shadowBlur = index === 0 ? 15 : 8;
      ctx.shadowColor = index === 0 ? '#00ffff' : (corruptionMode ? '#00ffff' : '#00ffff');
      ctx.fillStyle = index === 0 ? '#ffffff' : (corruptionMode ? '#00ffff' : '#00aaaa');
      
      const padding = 1;
      const xOffset = gameOver ? Math.random() * 4 - 2 : 0;
      const yOffset = gameOver ? Math.random() * 4 - 2 : 0;

      ctx.fillRect(
        segment.x * GRID_SIZE + padding + xOffset,
        segment.y * GRID_SIZE + padding + yOffset,
        GRID_SIZE - padding * 2,
        GRID_SIZE - padding * 2
      );
    });

    // Reset shadow
    ctx.shadowBlur = 0;

  }, [snake, food, isStarted, gameOver, corruptionMode]);

  return (
    <div className="flex flex-col items-center select-none font-arcade w-full mt-6">
      <div className="flex justify-between w-full max-w-[500px] mb-4 
                      border-b-[2px] border-dashed border-[var(--color-blue-glow)] pb-2 glow-border-bottom">
        <div className="flex flex-col text-[var(--color-cyan)] neon-text-cyan">
          <span className="text-[10px] uppercase mb-1">MEM_LEAK_BYTES</span>
          <span className="text-xl">0x{score.toString(16).toUpperCase().padStart(4, '0')}</span>
        </div>
        <div className="flex flex-col items-end text-[var(--color-magenta)] neon-text-magenta">
          <span className="text-[10px] uppercase mb-1">MAX_CORRUPTION</span>
          <span className="text-xl">0x{highScore.toString(16).toUpperCase().padStart(4, '0')}</span>
        </div>
      </div>

      <div className={`relative glass-canvas-container overflow-hidden p-0 w-full max-w-[500px] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)] ${isShaking ? 'animate-shake-subtle' : ''}`} tabIndex={0}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-auto object-contain bg-[var(--color-black)] relative z-0 mix-blend-screen"
        />

        {/* Score Popups */}
        {scorePopups.map(popup => (
          <div 
            key={popup.id}
            className="absolute pointer-events-none z-20 transition-none"
            style={{
              left: `${((popup.x + 0.5) / TILE_COUNT) * 100}%`,
              top: `${((popup.y) / TILE_COUNT) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="animate-popup text-[var(--color-magenta)] font-arcade text-[12px] md:text-sm neon-text-magenta flex items-center justify-center">
              {popup.text}
            </div>
          </div>
        ))}

        {!isStarted && !gameOver && (
          <div className="absolute inset-0 bg-[#050005]/70 flex flex-col items-center justify-center text-center p-6 z-10 border border-[var(--color-cyan)] m-2 shadow-[inset_0_0_20px_var(--color-cyan)] rounded-lg backdrop-blur-md">
            <h1 className="text-2xl md:text-3xl text-white mb-6 glitch uppercase neon-text-cyan" data-text="AWAITING_INPUT">AWAITING_INPUT</h1>
            <p className="text-[var(--color-magenta)] text-[10px] md:text-xs mb-8 leading-loose uppercase neon-text-magenta">
              {">"} COMMAND: WASD OR ARROWS<br/>{">"} PAUSE: SPACEBAR
            </p>
            <button 
              onClick={startGame}
              className="px-6 py-4 bg-black/50 border-2 border-[var(--color-cyan)] shadow-[0_0_15px_rgba(0,255,255,0.4)] text-white text-xs md:text-sm uppercase font-bold hover:bg-[var(--color-cyan)] hover:border-[var(--color-cyan)] hover:shadow-[0_0_20px_var(--color-cyan)] hover:text-black transition-all rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)]"
            >
              [ INJECT_PAYLOAD ]
            </button>
          </div>
        )}

        {isPaused && !gameOver && isStarted && (
          <div className="absolute inset-0 bg-[var(--color-cyan)]/10 mix-blend-color-burn flex items-center justify-center z-10 backdrop-blur-sm">
             <div className="bg-black/70 border-2 neon-border-magenta py-4 px-8 backdrop-blur-md rounded-xl">
               <h2 className="text-xl md:text-2xl text-[var(--color-magenta)] neon-text-magenta uppercase blink glitch" data-text="THREAD_FROZEN">THREAD_FROZEN</h2>
             </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-[#ff00ff]/20 flex flex-col items-center justify-center text-center p-6 z-10 backdrop-blur-sm">
            <div className="bg-black/80 border-2 neon-border-magenta p-6 backdrop-blur-md rounded-xl">
                <h2 className="text-2xl md:text-3xl text-white mb-4 uppercase glitch neon-text-magenta" data-text="KERNEL_PANIC">KERNEL_PANIC</h2>
                <div className="text-[var(--color-yellow)] neon-text-yellow text-sm mb-6 flex flex-col">
                  <span>SIGSEGV (11)</span> 
                  <span className="text-[var(--color-cyan)] text-xs mt-2 font-glitch tracking-widest text-left">
                    at memory address: 0x000F8<br/>
                    registers dumped.<br/>
                    bytes corrupted: {score}
                  </span>
                </div>
                <button 
                onClick={startGame}
                className="px-8 py-3 bg-transparent border-2 neon-border-cyan text-[var(--color-cyan)] text-xs md:text-sm uppercase hover:bg-[var(--color-cyan)] hover:text-black hover:shadow-[0_0_20px_var(--color-cyan)] transition-all active:translate-y-1 block w-full rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)]"
                >
                [ OVERRIDE_AND_REBOOT ]
                </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Harsh Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 mt-6 md:hidden max-w-[220px] w-full mx-auto touch-none">
        <div></div>
        <button className="bg-black/40 border border-[var(--color-cyan)] p-4 flex items-center justify-center text-[var(--color-cyan)] active:bg-[var(--color-cyan)] active:text-black rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.2)] touch-manipulation"
                onPointerDown={(e) => { e.preventDefault(); handleMobileInput({x: 0, y: -1}); }}><ArrowUp size={24} className="drop-shadow-[0_0_5px_currentColor]" /></button>
        <div></div>
        <button className="bg-black/40 border border-[var(--color-cyan)] p-4 flex items-center justify-center text-[var(--color-cyan)] active:bg-[var(--color-cyan)] active:text-black rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.2)] touch-manipulation"
                onPointerDown={(e) => { e.preventDefault(); handleMobileInput({x: -1, y: 0}); }}><ArrowLeft size={24} className="drop-shadow-[0_0_5px_currentColor]" /></button>
        <button className="bg-black/40 border border-[var(--color-magenta)] p-4 flex items-center justify-center text-[var(--color-magenta)] active:bg-[var(--color-magenta)] active:text-black rounded-xl shadow-[0_0_15px_rgba(255,0,255,0.2)] flex-col gap-1 touch-manipulation"
                onClick={(e) => { e.preventDefault(); isStarted ? !gameOver && setIsPaused(p => !p) : startGame()}}>
          {isStarted && !isPaused ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
        </button>
        <button className="bg-black/40 border border-[var(--color-cyan)] p-4 flex items-center justify-center text-[var(--color-cyan)] active:bg-[var(--color-cyan)] active:text-black rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.2)] touch-manipulation"
                onPointerDown={(e) => { e.preventDefault(); handleMobileInput({x: 1, y: 0}); }}><ArrowRight size={24} className="drop-shadow-[0_0_5px_currentColor]" /></button>
        <div></div>
        <button className="bg-black/40 border border-[var(--color-cyan)] p-4 flex items-center justify-center text-[var(--color-cyan)] active:bg-[var(--color-cyan)] active:text-black rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.2)] touch-manipulation"
                onPointerDown={(e) => { e.preventDefault(); handleMobileInput({x: 0, y: 1}); }}><ArrowDown size={24} className="drop-shadow-[0_0_5px_currentColor]" /></button>
        <div></div>
      </div>
    </div>
  );
}
