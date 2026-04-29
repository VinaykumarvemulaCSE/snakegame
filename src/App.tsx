import { motion } from 'motion/react';
import React from 'react';
import { MusicPlayer } from './components/MusicPlayer';
import { SnakeGame } from './components/SnakeGame';

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-black)] text-[var(--color-cyan)] p-4 flex flex-col items-center relative font-sans screen-tear pb-24">
      <div className="static-noise"></div>
      <div className="scanlines"></div>

      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          y: { type: "spring", stiffness: 100, damping: 10, mass: 1 },
          opacity: { duration: 0.5 },
          scale: { duration: 2, repeat: Infinity, ease: "linear" },
          filter: { duration: 4, repeat: Infinity, ease: "linear" }
        }}
        whileInView={{ scale: [1, 1.01, 0.99, 1], filter: ["hue-rotate(0deg)", "hue-rotate(50deg)", "hue-rotate(-50deg)", "hue-rotate(0deg)"] }}
        className="mb-4 text-center mt-4 z-10 w-full pb-4"
      >
        <div className="inline-block glass-panel glass-panel-glow-cyan p-6 rounded-2xl">
          <h1
            className="text-3xl md:text-5xl tracking-tighter glitch inline-block uppercase font-bold text-white px-4 py-2 neon-text-cyan font-arcade"
            data-text="GLITCH_PROTOCOL.exe"
          >
            GLITCH_PROTOCOL.exe
          </h1>
          <p className="font-glitch text-lg md:text-2xl text-[var(--color-magenta)] uppercase mt-2 neon-text-magenta">
            <span className="text-[var(--color-cyan)] neon-text-cyan underline blink motion-safe:animate-pulse">_RAW_DATA_STREAM_</span> // STATUS: ONLINE
          </p>
        </div>
      </motion.header>

      <main className="flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8 w-full max-w-[1400px] mx-auto z-10 flex-1 px-2 mt-8">
        
        {/* Left Side: Audio Interface */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          className="w-full xl:w-[350px] flex justify-center glass-panel glass-panel-glow-magenta rounded-2xl p-6 relative group transition-all duration-300 hover:glass-panel-glow-cyan"
        >
          <div className="absolute top-[-10px] right-4 bg-[var(--color-magenta)] text-white text-[10px] px-3 py-1 font-bold rounded-full group-hover:bg-[var(--color-cyan)] shadow-[0_0_10px_var(--color-magenta)] group-hover:shadow-[0_0_10px_var(--color-cyan)] transition-colors group-hover:text-black">PID_8472</div>
          <MusicPlayer />
        </motion.div>

        {/* Right Side: Execution Canvas */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.4 }}
          className="w-full xl:max-w-[700px] flex-1 flex justify-center glass-panel glass-panel-glow-cyan rounded-2xl p-6 relative group"
        >
          <div className="absolute top-[-10px] left-4 bg-[var(--color-cyan)] text-black text-[10px] px-3 py-1 font-bold rounded-full shadow-[0_0_10px_var(--color-cyan)]">KERNEL_THREAD_0</div>
          <SnakeGame />
        </motion.div>

      </main>

      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileInView={{ x: [0, 5, -5, 0] }}
        transition={{ 
          opacity: { delay: 1, duration: 0.5 },
          x: { duration: 2, repeat: Infinity, ease: "linear" }
        }}
        className="mt-12 text-center text-[10px] font-glitch text-[var(--color-magenta)] uppercase tracking-widest z-10 w-full mb-8 neon-text-magenta"
      >
        <p className="glitch" data-text=">> END_OF_TRANSMISSION <<">{">> END_OF_TRANSMISSION <<"}</p>
      </motion.footer>
    </div>
  );
}
