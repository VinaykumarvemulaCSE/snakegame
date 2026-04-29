import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

const AUDIO_STREAM = [
  { id: 1, hash: 'SECTOR_0x1', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, hash: 'SECTOR_0x2', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, hash: 'SECTOR_0x3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export function MusicPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;
    
    if (audio.src !== AUDIO_STREAM[currentIndex].url) {
      audio.src = AUDIO_STREAM[currentIndex].url;
      audio.load();
      if (isPlaying) {
        audio.play().catch(console.error);
      }
    }

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    const handleEnded = () => nextStream();

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // When play state changes *after* the initial mount load
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying && audio.paused) {
      audio.play().catch(console.error);
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextStream = () => setCurrentIndex((prev) => (prev + 1) % AUDIO_STREAM.length);
  const prevStream = () => setCurrentIndex((prev) => (prev - 1 + AUDIO_STREAM.length) % AUDIO_STREAM.length);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioRef.current.currentTime = percentage * audioRef.current.duration;
    setProgress(percentage * 100);
  };

  return (
    <div className="w-full flex flex-col items-stretch mt-4">
      
      <div className="flex flex-col mb-6 border-none neon-border-purple p-4 bg-[var(--color-blue-dark)]/50 rounded-xl shadow-[inset_0_0_20px_var(--color-blue-glow)]">
        <div className="text-[10px] text-[var(--color-cyan)] neon-text-cyan mb-1 uppercase tracking-widest flex justify-between font-arcade">
          <span>// MEDIA_BUFFER</span>
          <span className="text-[var(--color-yellow)] neon-text-yellow">{isPlaying ? "ACTIVE" : "IDLE"}</span>
        </div>
        <h2 className="text-sm font-arcade text-white uppercase truncate flex items-center gap-2 mt-2">
          <span className="text-[var(--color-purple-glow)] neon-text-purple blink motion-safe:animate-[pulse_1s_steps(2)_infinite] text-[10px]">{">>"}</span>
          <span className={isPlaying ? "glitch" : ""} data-text={AUDIO_STREAM[currentIndex].hash}>
            {AUDIO_STREAM[currentIndex].hash}
          </span>
        </h2>
      </div>

      <div 
        className="w-full border-none neon-border-blue h-4 mb-6 relative overflow-hidden bg-black flex grid grid-cols-12 shadow-[0_0_10px_var(--color-blue-glow)] rounded-full cursor-pointer touch-none"
        onClick={handleProgressClick}
        title="Seek Audio"
      >
        <div 
          className="absolute top-0 left-0 bottom-0 bg-[var(--color-cyan)] shadow-[0_0_10px_var(--color-cyan)] transition-all duration-75 pointer-events-none" 
          style={{ width: `${progress}%` }}
        ></div>
        {/* Fake grid lines over progress bar */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="border-r border-[var(--color-black)]/50 h-full z-10 w-full pointer-events-none" />
        ))}
      </div>

      <div className="flex items-center justify-between space-x-3 mb-8">
        <button onClick={prevStream} className="p-3 border-none bg-[var(--color-blue-dark)] text-[var(--color-cyan)] hover:bg-[var(--color-blue-glow)] hover:text-white shadow-[0_0_15px_var(--color-blue-glow)] font-arcade hover:shadow-[0_0_25px_var(--color-cyan)] active:translate-y-1 transition-all duration-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cyan)] flex items-center justify-center">
          <SkipBack size={24} className="drop-shadow-[0_0_8px_currentColor]" />
        </button>
        <button 
          onClick={togglePlay} 
          className="py-3 px-6 flex-1 flex justify-center items-center gap-3 border border-[var(--color-cyan)] bg-[var(--color-black)]/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] text-[var(--color-cyan)] hover:bg-[var(--color-cyan)] hover:text-[var(--color-black)] hover:shadow-[0_0_25px_var(--color-cyan)] font-arcade text-xl uppercase active:bg-[var(--color-blue-glow)] active:translate-y-1 transition-all duration-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cyan)]"
        >
          {isPlaying ? <Pause className="drop-shadow-[0_0_8px_currentColor]" size={28} /> : <Play className="drop-shadow-[0_0_8px_currentColor]" size={28} fill="currentColor" />}
          <span className="hidden sm:inline">{isPlaying ? "SUSPEND" : "EXECUTE"}</span>
        </button>
        <button onClick={nextStream} className="p-3 border-none bg-[var(--color-blue-dark)] text-[var(--color-cyan)] hover:bg-[var(--color-blue-glow)] hover:text-white shadow-[0_0_15px_var(--color-blue-glow)] font-arcade hover:shadow-[0_0_25px_var(--color-cyan)] active:translate-y-1 transition-all duration-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cyan)] flex items-center justify-center">
          <SkipForward size={24} className="drop-shadow-[0_0_8px_currentColor]" />
        </button>
      </div>

      <div className="border-t border-dashed border-[var(--color-blue-glow)] pt-4 flex flex-col gap-2 relative">
         <span className="text-[10px] text-[var(--color-cyan)] uppercase font-arcade mb-2 tracking-widest text-shadow drop-shadow-[0_0_5px_var(--color-cyan)]">GAIN_OUTPUT [{Math.round(volume * 100)}%]</span>
         <div className="flex items-center gap-4">
            <button onClick={() => setVolume(0)} className="text-[var(--color-cyan)] hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-cyan)] rounded">
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input 
              type="range" 
              min="0" max="1" step="0.05" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-grow h-2 bg-black appearance-none border border-[var(--color-blue-glow)] rounded-full cursor-crosshair focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cyan)]
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-cyan)] [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--color-cyan)]"
            />
         </div>
      </div>
      
      {/* Visual noise filler block */}
      <div className="mt-8 p-4 bg-[var(--color-black)]/30 rounded-lg border border-[var(--color-blue-glow)]/30 select-none" aria-hidden="true" tabIndex={-1}>
        <div className="w-full text-[8px] font-glitch text-[var(--color-blue-glow)] opacity-80 h-24 overflow-hidden leading-tight flex flex-col pointer-events-none select-none">
          <span>DATA_DUMP_START</span>
          <span>0x0010: a3 1f 2b 4c 9a 0f 1e 22 - 3b 4c 5d 6e 7f 8a 9b</span>
          <span>0x0020: 8c 7d 6e 5f 4a 3b 2c 1d - 0e 1f 2a 3b 4c 5d 6e</span>
          <span>0x0030: ff 1a 2b 3c 4d 5e 6f 7a - 8b 9c ad be cf d0 e1</span>
          <span>0x0040: 12 34 56 78 9a bc de f0 - 11 22 33 44 55 66 77</span>
          <span className="text-[var(--color-yellow)] animate-pulse">0x0050: ERR_CHECKSUM_FAILED</span>
          <span className="text-[var(--color-cyan)]">0x0060: CORRUPTED_BYTES_DETECTED</span>
          <span>DATA_DUMP_END</span>
        </div>
      </div>
    </div>
  );
}
