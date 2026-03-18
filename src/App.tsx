import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Settings,
  Pause,
  X as CloseIcon,
  Play
} from 'lucide-react';

// --- SVGs & Assets ---
const BeeBotSVG = ({ dir = 0, style, className }) => (
  <svg viewBox="0 0 100 100" style={{ transform: `rotate(${dir}deg)`, ...style }} className={`transition-transform duration-500 ease-in-out ${className}`}>
    {/* Shadow */}
    <ellipse cx="50" cy="55" rx="42" ry="46" fill="rgba(0,0,0,0.3)" />
    {/* Body */}
    <path d="M 10 50 Q 10 10 50 10 Q 90 10 90 50 Q 90 90 50 90 Q 10 90 10 50" fill="#FFD000" />
    {/* Black Stripes */}
    <path d="M 14 35 Q 50 25 86 35 L 89 45 Q 50 35 11 45 Z" fill="#222" />
    <path d="M 10 65 Q 50 55 90 65 L 86 75 Q 50 65 14 75 Z" fill="#222" />
    {/* Eyes */}
    <circle cx="30" cy="25" r="8" fill="white" />
    <circle cx="70" cy="25" r="8" fill="white" />
    <circle cx="30" cy="23" r="3" fill="black" />
    <circle cx="70" cy="23" r="3" fill="black" />
    {/* Smile */}
    <path d="M 30 80 Q 50 95 70 80" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
    {/* Buttons on back (simplified) */}
    <circle cx="50" cy="50" r="6" fill="#8bc34a" />
    <path d="M 50 38 L 47 43 L 53 43 Z" fill="#ff8c42" />
    <path d="M 50 62 L 47 57 L 53 57 Z" fill="#ff8c42" />
  </svg>
);

const FlowerSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    <circle cx="50" cy="30" r="20" fill="#FF4081" />
    <circle cx="70" cy="50" r="20" fill="#FF4081" />
    <circle cx="60" cy="75" r="20" fill="#FF4081" />
    <circle cx="40" cy="75" r="20" fill="#FF4081" />
    <circle cx="30" cy="50" r="20" fill="#FF4081" />
    <circle cx="50" cy="50" r="12" fill="#FFC107" />
    <circle cx="50" cy="50" r="4" fill="#FF9800" />
  </svg>
);

// Curved arrow SVGs specifically for the orange buttons
const CurvedArrowLeft = ({ width = 36, height = 36, strokeWidth = 4 }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} stroke="white" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 18 19 Q 18 9 10 9 L 4 9 M 10 15 L 4 9 L 10 3" />
  </svg>
);

const CurvedArrowRight = ({ width = 36, height = 36, strokeWidth = 4 }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} stroke="white" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 6 19 Q 6 9 14 9 L 20 9 M 14 15 L 20 9 L 14 3" />
  </svg>
);

const StraightArrowUp = ({ width = 36, height = 36, strokeWidth = 4 }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} stroke="white" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 12 21 L 12 3 M 6 9 L 12 3 L 18 9" />
  </svg>
);

const StraightArrowDown = ({ width = 36, height = 36, strokeWidth = 4 }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} stroke="white" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 12 3 L 12 21 M 6 15 L 12 21 L 18 15" />
  </svg>
);

// --- Game Data (6 Unique Levels) ---
const GARDEN_LEVELS = [
  {
    // Level 1: Simple straight line
    gridSize: 5,
    beeStart: { x: 2, y: 4, dir: 0 }, // Facing North
    goal: { x: 2, y: 0 },
    map: [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0]
    ],
    veggies: [{ x: 1, y: 2 }, { x: 3, y: 3 }],
    plants: [{ x: 4, y: 1 }, { x: 0, y: 0 }]
  },
  {
    // Level 2: One turn
    gridSize: 5,
    beeStart: { x: 1, y: 4, dir: 0 },
    goal: { x: 3, y: 2 },
    map: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 0, 0]
    ],
    veggies: [{ x: 2, y: 2 }],
    plants: [{ x: 4, y: 4 }, { x: 0, y: 1 }]
  },
  {
    // Level 3: Z-Shape
    gridSize: 5,
    beeStart: { x: 1, y: 4, dir: 0 },
    goal: { x: 3, y: 1 },
    map: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 0, 0],
      [0, 1, 0, 0, 0]
    ],
    veggies: [{ x: 2, y: 4 }, { x: 2, y: 1 }],
    plants: [{ x: 0, y: 2 }, { x: 4, y: 1 }]
  },
  {
    // Level 4: U-Shape Box
    gridSize: 5,
    beeStart: { x: 3, y: 4, dir: 0 },
    goal: { x: 1, y: 4 },
    map: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0]
    ],
    veggies: [{ x: 2, y: 3 }, { x: 2, y: 2 }],
    plants: [{ x: 0, y: 0 }, { x: 4, y: 4 }]
  },
  {
    // Level 5: The Snake/Spiral
    gridSize: 5,
    beeStart: { x: 0, y: 4, dir: 0 },
    goal: { x: 2, y: 2 },
    map: [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 1, 1, 1],
      [1, 0, 0, 0, 0]
    ],
    veggies: [{ x: 1, y: 2 }, { x: 3, y: 2 }],
    plants: [{ x: 1, y: 4 }, { x: 2, y: 1 }]
  },
  {
    // Level 6: The Original Complex Garden
    gridSize: 5,
    beeStart: { x: 4, y: 3, dir: 0 },
    goal: { x: 1, y: 3 },
    map: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1],
      [0, 1, 0, 0, 1],
      [0, 1, 0, 0, 1],
      [0, 0, 0, 0, 0],
    ],
    veggies: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 3 }],
    plants: [{ x: 0, y: 4 }]
  }
];

const MOVE_DELAY = 600;

export default function App() {
  const [screen, setScreen] = useState('splash'); // 'splash', 'levels', 'game'

  // Game State
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const currentLevel = GARDEN_LEVELS[currentLevelIdx];

  const [beePos, setBeePos] = useState({ ...currentLevel.beeStart });
  const [commands, setCommands] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [execIndex, setExecIndex] = useState(-1);

  const historyRef = useRef(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollLeft = historyRef.current.scrollWidth;
    }
  }, [commands, execIndex]);

  const triggerVibrate = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
  };

  const loadLevel = (idx) => {
    triggerVibrate();
    setCurrentLevelIdx(idx);
    setBeePos({ ...GARDEN_LEVELS[idx].beeStart });
    setCommands([]);
    setShowWin(false);
    setIsExecuting(false);
    setExecIndex(-1);
    setScreen('game');
  };

  const addCommand = (cmd) => {
    if (isExecuting || showWin || commands.length >= 40) return;
    triggerVibrate();
    setCommands(prev => [...prev, cmd]);
  };

  const clearCommands = () => {
    if (isExecuting) return;
    triggerVibrate();
    setCommands([]);
    setExecIndex(-1);
  };

  const resetGame = () => {
    setBeePos({ ...currentLevel.beeStart });
    setCommands([]);
    setShowWin(false);
    setIsExecuting(false);
    setExecIndex(-1);
  };

  const executeProgram = async () => {
    if (isExecuting || commands.length === 0 || showWin) return;
    triggerVibrate();
    setIsExecuting(true);

    let curX = beePos.x;
    let curY = beePos.y;
    let curDir = beePos.dir;

    for (let i = 0; i < commands.length; i++) {
      setExecIndex(i);
      const cmd = commands[i];

      if (cmd === 'PAUSE') {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      await new Promise(r => setTimeout(r, MOVE_DELAY));

      if (cmd === 'LEFT') {
        curDir -= 90;
        setBeePos(prev => ({ ...prev, dir: curDir }));
      } else if (cmd === 'RIGHT') {
        curDir += 90;
        setBeePos(prev => ({ ...prev, dir: curDir }));
      } else {
        const step = cmd === 'FORWARD' ? 1 : -1;
        let nextX = curX;
        let nextY = curY;

        // Normalize direction for movement math (e.g. -90 becomes 270)
        const facing = ((curDir % 360) + 360) % 360;

        if (facing === 0) nextY -= step;      // North
        else if (facing === 90) nextX += step; // East
        else if (facing === 180) nextY += step; // South
        else if (facing === 270) nextX -= step; // West

        // Check map boundaries and path validation
        // The real Bee-Bot app stops if it hits a wall/dirt on this specific level type
        if (nextX >= 0 && nextX < currentLevel.gridSize &&
          nextY >= 0 && nextY < currentLevel.gridSize &&
          currentLevel.map[nextY][nextX] === 1) { // 1 = Path
          curX = nextX;
          curY = nextY;
          setBeePos({ x: curX, y: curY, dir: curDir });
        } else {
          // Hit a wall/dirt - error state. Original app just stops or makes a sound.
          break;
        }
      }
    }

    // Check Win
    if (curX === currentLevel.goal.x && curY === currentLevel.goal.y) {
      setTimeout(() => setShowWin(true), 500);
    }

    setIsExecuting(false);
    setExecIndex(-1);
    setCommands([]);
  };

  // --- Screens ---

  if (screen === 'splash') {
    return (
      <div className="fixed inset-0 bg-[#304B82] flex flex-col items-center justify-center font-sans select-none touch-none">
        <h1 className="text-white text-5xl font-black mb-8 drop-shadow-md">Bee-Bot<sup className="text-2xl">®</sup></h1>
        <div className="w-64 h-64 relative mb-16">
          <BeeBotSVG dir={0} className="w-full h-full drop-shadow-2xl scale-125" />
        </div>
        <button
          onClick={() => { triggerVibrate(); setScreen('levels'); }}
          className="bg-[#F8A02A] text-white text-3xl font-black py-4 px-16 rounded-xl shadow-[0_6px_0_#D8801A] active:shadow-[0_0px_0_#D8801A] active:translate-y-[6px] transition-all"
        >
          Start
        </button>
        <p className="absolute bottom-6 text-white/70 text-sm">© Copyright TTS Group Limited</p>
      </div>
    );
  }

  if (screen === 'levels') {
    return (
      <div className="fixed inset-0 bg-[#539A3A] flex flex-col font-sans select-none touch-none">
        {/* Top Bar */}
        <div className="h-14 bg-[#48872F] flex items-center justify-between px-4 shadow-md z-10">
          <button onClick={() => setScreen('splash')} className="text-[#A5D289] hover:text-white transition-colors">
            <Home size={32} />
          </button>
          <h1 className="text-white text-xl font-bold">Bee-Bot<sup className="text-xs">®</sup></h1>
          <button className="text-[#A5D289] hover:text-white transition-colors">
            <Settings size={32} />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center overflow-y-auto">
          {/* Header Card */}
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg mb-8 relative border-4 border-[#A5D289]">
            <h2 className="text-[#4B5E9F] text-2xl font-bold text-center mb-2">Bee-Bot in the Garden!</h2>
            <p className="text-[#E08A27] text-center font-semibold">
              Can you help Bee-Bot on his mission to pollinate the flowers in the garden?
            </p>
            {/* Decoration */}
            <div className="absolute -top-6 -left-4 w-16 h-16"><FlowerSVG /></div>
          </div>

          {/* Level Grid */}
          <div className="bg-[#6BB936] w-full max-w-md rounded-2xl p-6 shadow-inner grid grid-cols-3 gap-6 justify-items-center">
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <button
                key={lvl}
                onClick={() => loadLevel(lvl - 1)}
                className="relative flex flex-col items-center w-20 active:scale-95 transition-transform"
              >
                <div className="w-20 h-20 bg-white rounded-full p-2 shadow-md relative border-2 border-[#5CA42A]">
                  <FlowerSVG />
                  <div className="absolute -top-1 -right-1 bg-[#4B5E9F] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                    {lvl}
                  </div>
                </div>
                <span className="text-white font-bold mt-2 text-sm drop-shadow-md">Level {lvl}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#6BB936] flex flex-col font-sans select-none touch-none overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-[#48872F] flex items-center justify-between px-4 shadow-md z-20">
        <button onClick={() => setScreen('levels')} className="text-[#A5D289] hover:text-white transition-colors">
          <Home size={32} />
        </button>
        <h1 className="text-white text-xl font-bold">Bee-Bot<sup className="text-xs">®</sup></h1>
        <button onClick={resetGame} className="text-[#A5D289] hover:text-white transition-colors">
          <Settings size={32} />
        </button>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative flex items-start justify-center pt-8 overflow-hidden">

        {/* Command History Bar */}
        <div
          ref={historyRef}
          className="absolute top-2 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-16 bg-black/40 backdrop-blur-md rounded-2xl flex items-center px-4 gap-2 overflow-x-auto shadow-xl z-40 border border-white/20 scroll-smooth"
        >
          {commands.length === 0 ? (
            <span className="text-white/60 font-bold text-sm mx-auto tracking-widest uppercase">Program Bee-Bot...</span>
          ) : (
            commands.map((cmd, i) => (
              <div
                key={i}
                className={`w-10 h-10 shrink-0 rounded-[12px] flex items-center justify-center shadow-md transition-all duration-300
                  ${cmd === 'PAUSE' ? 'bg-[#395a82]' : 'bg-[#ff8c42]'}
                  ${execIndex === i ? 'ring-4 ring-white scale-110 brightness-125' : 'opacity-90'}
                `}
              >
                {cmd === 'FORWARD' && <StraightArrowUp width={24} height={24} strokeWidth={3} />}
                {cmd === 'BACKWARD' && <StraightArrowDown width={24} height={24} strokeWidth={3} />}
                {cmd === 'LEFT' && <CurvedArrowLeft width={24} height={24} strokeWidth={3} />}
                {cmd === 'RIGHT' && <CurvedArrowRight width={24} height={24} strokeWidth={3} />}
                {cmd === 'PAUSE' && <Pause size={18} color="white" fill="white" />}
              </div>
            ))
          )}
        </div>

        {/* The Fence & Board */}
        <div className="relative border-[16px] border-[#A2703D] rounded-xl shadow-2xl overflow-hidden bg-[#7B5836] mt-12">
          {/* Wooden fence posts decoration (CSS trick) */}
          <div className="absolute inset-[-16px] border-[16px] border-dashed border-[#8A5A2B] rounded-xl pointer-events-none opacity-50"></div>

          <div
            className="grid relative"
            style={{
              gridTemplateColumns: `repeat(${currentLevel.gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${currentLevel.gridSize}, 1fr)`,
              width: 'min(90vw, 500px)',
              height: 'min(90vw, 500px)',
            }}
          >
            {currentLevel.map.map((row, y) =>
              row.map((cell, x) => {
                const isPath = cell === 1;
                const isGoal = x === currentLevel.goal.x && y === currentLevel.goal.y;

                // Decorative cabbages and plants derived from level data
                const isDirtWithVeg = !isPath && currentLevel.veggies?.some(v => v.x === x && v.y === y);
                const isDirtWithPlant = !isPath && currentLevel.plants?.some(p => p.x === x && p.y === y);

                return (
                  <div key={`${x}-${y}`} className={`relative flex items-center justify-center border-[0.5px] border-black/10 ${isPath ? 'bg-[#E6E6E6]' : 'bg-[#7B5836]'}`}>
                    {/* Grid styling for path */}
                    {isPath && <div className="absolute inset-0 border-2 border-white/40 m-1 rounded-sm shadow-inner"></div>}

                    {/* Veggies */}
                    {isDirtWithVeg && <span className="text-3xl drop-shadow-md">🥬</span>}
                    {isDirtWithPlant && <span className="text-4xl drop-shadow-md">🌿</span>}

                    {/* Goal (Flower) */}
                    {isGoal && (
                      <div className="absolute w-[80%] h-[80%] z-0">
                        <FlowerSVG />
                      </div>
                    )}
                  </div>
                )
              })
            )}

            {/* Smoothly Animated Bee-Bot Overlay */}
            <div
              className="absolute z-20 transition-all duration-500 ease-in-out flex items-center justify-center pointer-events-none"
              style={{
                width: `${100 / currentLevel.gridSize}%`,
                height: `${100 / currentLevel.gridSize}%`,
                left: `${beePos.x * (100 / currentLevel.gridSize)}%`,
                top: `${beePos.y * (100 / currentLevel.gridSize)}%`,
              }}
            >
              <BeeBotSVG dir={beePos.dir} className="w-[90%] h-[90%]" />
            </div>

          </div>
        </div>

        {/* Floating Controls Overlay (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-30 pointer-events-none">
          {/* We use a grid to perfectly align the distinctive UI buttons */}
          <div className="grid grid-cols-3 grid-rows-3 gap-2 items-center justify-items-center w-56 h-56 pointer-events-auto">

            {/* Row 1 */}
            <div />
            <ControlButton
              shape="pill-v"
              color="#ff8c42" shadow="#cc5500"
              icon={<StraightArrowUp />}
              onClick={() => addCommand('FORWARD')}
            />
            <div />

            {/* Row 2 */}
            <ControlButton
              shape="pill-h"
              color="#ff8c42" shadow="#cc5500"
              icon={<CurvedArrowLeft />}
              onClick={() => addCommand('LEFT')}
            />
            <ControlButton
              shape="circle"
              color="#8bc34a" shadow="#689f38"
              icon={<span className="text-white font-black text-2xl tracking-widest">GO</span>}
              onClick={executeProgram}
            />
            <ControlButton
              shape="pill-h"
              color="#ff8c42" shadow="#cc5500"
              icon={<CurvedArrowRight />}
              onClick={() => addCommand('RIGHT')}
            />

            {/* Row 3 */}
            <ControlButton
              shape="square"
              color="#395a82" shadow="#223b5c"
              icon={<CloseIcon size={28} color="white" strokeWidth={4} />}
              onClick={clearCommands}
            />
            <ControlButton
              shape="pill-v"
              color="#ff8c42" shadow="#cc5500"
              icon={<StraightArrowDown />}
              onClick={() => addCommand('BACKWARD')}
            />
            <ControlButton
              shape="square"
              color="#395a82" shadow="#223b5c"
              icon={<Pause size={24} color="white" fill="white" />}
              onClick={() => addCommand('PAUSE')}
            />

          </div>
        </div>

      </div>

      {/* Win Screen Modal */}
      {showWin && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#539A3A] w-full max-w-sm rounded-[32px] border-[6px] border-[#3F7C28] shadow-2xl overflow-hidden flex flex-col items-center">
            {/* Header */}
            <div className="bg-[#71BA49] w-full py-4 text-center border-b-[6px] border-[#3F7C28]">
              <h2 className="text-white text-2xl font-bold uppercase tracking-wide">You did it</h2>
            </div>

            {/* Body */}
            <div className="p-8 flex flex-col items-center relative w-full overflow-hidden">
              {/* Sunburst background effect */}
              <div className="absolute inset-0 bg-[repeating-conic-gradient(#5CA42A_0_15deg,#539A3A_15deg_30deg)] opacity-50 z-0"></div>

              <div className="relative z-10 flex flex-col items-center">
                <h3 className="text-white text-4xl font-black mb-4 drop-shadow-lg filter drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]">Great Job!</h3>
                <div className="w-32 h-32 relative mb-6">
                  {/* Stars */}
                  <span className="absolute -left-4 top-10 text-4xl text-[#FFC107] drop-shadow-md">⭐</span>
                  <span className="absolute -right-4 top-10 text-4xl text-[#FFC107] drop-shadow-md">⭐</span>
                  <span className="absolute left-1/2 -translate-x-1/2 -top-4 text-5xl text-[#FFC107] drop-shadow-md">⭐</span>
                  <FlowerSVG />
                </div>

                <button
                  onClick={resetGame}
                  className="bg-[#F8A02A] text-white text-2xl font-black py-3 px-16 rounded-xl shadow-[0_6px_0_#D8801A] active:shadow-[0_0px_0_#D8801A] active:translate-y-[6px] transition-all border-2 border-[#FFD54F]"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom highly-specific button component for the floating controls
const ControlButton = ({ shape, color, shadow, icon, onClick }) => {
  let sizeClasses = '';

  if (shape === 'pill-v') sizeClasses = 'w-[60px] h-[80px] rounded-full';
  if (shape === 'pill-h') sizeClasses = 'w-[80px] h-[60px] rounded-full';
  if (shape === 'circle') sizeClasses = 'w-[80px] h-[80px] rounded-full border-4 border-[#C8E6C9]';
  if (shape === 'square') sizeClasses = 'w-[60px] h-[50px] rounded-[16px]';

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: color,
        boxShadow: `0 6px 0 ${shadow}, 0 10px 10px rgba(0,0,0,0.3)`
      }}
      className={`
        ${sizeClasses} flex items-center justify-center
        active:translate-y-[6px] transition-transform active:shadow-[0_0px_0_${shadow}]
      `}
    >
      {icon}
    </button>
  );
};