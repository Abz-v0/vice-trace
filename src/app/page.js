"use client";

import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';

const ImageEditor = dynamic(() => import('@unlayer/react-image-editor'), {
  ssr: false,
  loading: () => <p className="text-cyan-400 font-mono animate-pulse">MOUNTING EVIDENCE DRIVE...</p>,
});

export default function Home() {
  const editorRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null); 
  const [gameState, setGameState] = useState('start');
  const [userName, setUserName] = useState('GUEST');
  const [inputName, setInputName] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [evidenceImage, setEvidenceImage] = useState("/evidence1.jpg");
  const [bootLines, setBootLines] = useState([]);

  // --- OPTIMIZED SOUND API LOGIC ---
  const playSound = (type) => {
    if (typeof window !== 'undefined') {
      if (!window.audioCtx) {
        window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioCtx = window.audioCtx;
      
      const playNote = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      if (type === 'click') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'error') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.5);
      } else if (type === 'success') {
        // Fixed: 3 separate oscillators for an actual ascending chord
        playNote(523.25, audioCtx.currentTime, 0.1); // C
        playNote(659.25, audioCtx.currentTime + 0.1, 0.1); // E
        playNote(783.99, audioCtx.currentTime + 0.2, 0.2); // G
      }
    }
  };

  // Fixed: Sets volume to 0.15 on unmute
  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      if (!newMutedState) {
        audioRef.current.volume = 0.15;
        audioRef.current.play().then(() => console.log("Music is playing!")).catch(e => console.log("Audio play blocked", e));
      }
      setIsMuted(newMutedState);
    }
  };

  // Fixed: Null guard added
  const fadeAudioIn = () => {
    if (audioRef.current) {
      audioRef.current.muted = false;
      setIsMuted(false);
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        const fadeInterval = setInterval(() => {
          if (audioRef.current && audioRef.current.volume < 0.14) {
            audioRef.current.volume = Math.min(audioRef.current.volume + 0.01, 0.15);
          } else {
            clearInterval(fadeInterval);
          }
        }, 200);
      }).catch(e => console.log("Audio play blocked", e));
    }
  };

  // Fixed: Logs "characters" instead of "bytes"
  const handleSave = ({ dataUrl, blob }) => {
    console.info('Saved', dataUrl.length, 'characters');
    playSound('success');
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `VICE_TRACE_Evidence_${userName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setGameState('accusing');
  };

  const handleLoadError = () => {
    console.error("IMAGE FAILED TO LOAD");
    playSound('error');
  };

  const handleError = (error) => console.error("EDITOR ERROR:", error);

  // Dynamic Date
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleAccessFile = () => {
    playSound('click');
    if (inputName.trim()) setUserName(inputName.trim().toUpperCase().replace(/\s+/g, '_'));
    setGameState('connecting');
    setTimeout(() => {
      setGameState('editor');
    }, 3000); 
  };

  // Enter key support
  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAccessFile();
    }
  };

  const makeAccusation = (isCorrect) => {
    playSound(isCorrect ? 'success' : 'error');
    setGameState(isCorrect ? 'solved' : 'failed');
  };

  const handleResetEvidence = () => {
    playSound('click');
    editorRef.current?.editor?.reset();
  };

  const handleUploadNew = (event) => {
    const file = event.target.files[0];
    if (file) {
      playSound('click');
      const reader = new FileReader();
      reader.onload = (e) => setEvidenceImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Sequential Boot Sequence Logic
  useEffect(() => {
    if (gameState === 'booting') {
      const lines = [
        "VCPD OS v1.0.4 (c) 2025 Leonida State Police",
        "Initializing system... OK",
        "Mounting /dev/evidence... OK",
        "Bypassing firewall... OK",
        "Establishing secure uplink... OK",
        "Loading VICE//TRACE interface...",
        "WELCOME, DETECTIVE."
      ];
      
      let currentLine = 0;
      setBootLines([]);
      
      const interval = setInterval(() => {
        if (currentLine < lines.length) {
          setBootLines(prev => [...prev, lines[currentLine]]);
          currentLine++;
        } else {
          clearInterval(interval);
          setTimeout(() => setGameState('briefing'), 1000);
        }
      }, 500); // Reveals a new line every 0.5s

      return () => clearInterval(interval);
    }
  }, [gameState]);

  const renderScreen = () => {
    if (gameState === 'start') {
      return (
        <main className="crt-effect min-h-screen bg-black bg-cover bg-center flex flex-col items-center justify-center p-8 cursor-pointer" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url('/bg.jpg')" }} onClick={() => { fadeAudioIn(); setGameState('booting'); }}>
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-cyan-400 tracking-widest glitch-text mb-8">VICE//TRACE</h1>
            <p className="text-xl text-pink-500 animate-pulse">[ CLICK TO INITIALIZE TERMINAL ]</p>
          </div>
        </main>
      );
    }

    if (gameState === 'booting') {
      return (
        <main className="crt-effect min-h-screen bg-black flex flex-col items-center justify-center p-8 text-green-400">
          <div className="w-full max-w-2xl font-mono text-sm space-y-2">
            {bootLines.map((line, index) => (
              <p key={index} className={index === bootLines.length - 1 ? "text-pink-500 animate-pulse" : ""}>
                {line}
              </p>
            ))}
          </div>
        </main>
      );
    }

    if (gameState === 'briefing') {
      return (
        <main className="crt-effect glitch-in min-h-screen bg-black bg-cover bg-center text-green-400 flex flex-col items-center justify-center p-8" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('/bg.jpg')" }}>
          <div className="border-2 border-cyan-500 p-8 max-w-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] bg-black/80">
            <div className="flex justify-between items-center mb-4 border-b border-cyan-500/50 pb-2">
              <h1 className="text-4xl font-bold text-cyan-400 tracking-widest glitch-text">VICE//TRACE</h1>
              <span className="text-xs text-pink-500 animate-pulse">● REC</span>
            </div>
            <p className="text-sm mb-6 text-cyan-200/70">VCPD INTERNAL DATABASE // DO NOT DISTRIBUTE</p>
            
            <div className="space-y-4 text-md text-green-300">
              <p><span className="font-bold text-white">CASE:</span> #001 - The Vice City Metro Incident</p>
              {/* Dynamic Date */}
              <p><span className="font-bold text-white">DATE:</span> {currentDate}</p>
              <p><span className="font-bold text-pink-500">STATUS:</span> EVIDENCE TAMPERED</p>
              <hr className="border-cyan-500/30 my-4" />
              <p className="leading-relaxed">Detective, we have a problem. The evidence tech swears the file was clean when he uploaded it, but Internal Affairs thinks the photo has been altered to protect a suspect.</p>
              <p className="leading-relaxed">Your job is to open the evidence file. Use the tools to enhance, zoom, and inspect the image. Find what was changed. Find the lie.</p>
            </div>

            <div className="mt-6 mb-4">
              <label className="block text-xs text-cyan-200/70 mb-1">DETECTIVE BADGE NAME:</label>
              <input 
                type="text" 
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyPress={handleNameKeyPress} // Enter key support
                placeholder="ENTER YOUR NAME..."
                className="w-full bg-zinc-900 border border-cyan-500/50 text-white px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>

            <button onClick={handleAccessFile} className="btn-press mt-2 w-full bg-cyan-500 text-black font-bold py-3 text-lg tracking-wider hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              [ ACCESS EVIDENCE FILE ]
            </button>
          </div>
        </main>
      );
    }

    if (gameState === 'connecting') {
      return (
        <main className="crt-effect min-h-screen bg-black flex flex-col items-center justify-center p-8 text-cyan-400">
          <div className="text-center space-y-4">
            <h1 className="text-2xl tracking-widest animate-pulse">ESTABLISHING SECURE UPLINK...</h1>
            <div className="text-sm text-pink-500 font-mono">
              <p>DECRYPTING SECTOR 4...</p>
              <p>BYPASSING FIREWALL...</p>
              <p>LOADING EVIDENCE_VIEWER.exe...</p>
            </div>
            {/* Fixed: Actual progress bar fill */}
            <div className="w-64 h-2 bg-zinc-800 mt-4 overflow-hidden border border-cyan-500/30">
              <div className="h-full bg-cyan-500" style={{ animation: 'fillBar 3s linear forwards' }}></div>
            </div>
          </div>
        </main>
      );
    }

    if (gameState === 'accusing') {
      return (
        <main className="crt-effect glitch-in min-h-screen bg-black bg-cover bg-center text-white flex flex-col items-center justify-center p-8" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url('/bg.jpg')" }}>
          <div className="border-2 border-yellow-500 p-8 max-w-2xl shadow-[0_0_30px_rgba(234,179,8,0.3)] bg-black/70">
            <h1 className="text-3xl font-bold mb-2 text-yellow-500 tracking-widest">SUBMIT FINDINGS</h1>
            <p className="text-sm mb-6 text-yellow-200/70">INTERNAL AFFAIRS REVIEW</p>
            
            <div className="space-y-4 text-md text-white">
              <p className="leading-relaxed text-lg">You have reviewed the evidence. Before Internal Affairs throws this out, you need to tell them exactly what the suspect altered in this photograph.</p>
              <p className="text-pink-500 font-bold">Choose carefully. Accusing the wrong person ends your career.</p>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <button onClick={() => makeAccusation(false)} className="btn-press w-full bg-zinc-800 text-white font-bold py-4 text-lg tracking-wide border border-zinc-600 hover:bg-zinc-700 hover:border-red-500 transition-all">A) The victim's face was blurred to hide their identity.</button>
              <button onClick={() => makeAccusation(false)} className="btn-press w-full bg-zinc-800 text-white font-bold py-4 text-lg tracking-wide border border-zinc-600 hover:bg-zinc-700 hover:border-red-500 transition-all">B) A murder weapon was photoshopped out of the frame.</button>
              <button onClick={() => makeAccusation(true)} className="btn-press w-full bg-zinc-800 text-white font-bold py-4 text-lg tracking-wide border border-zinc-600 hover:bg-zinc-700 hover:border-green-500 transition-all">C) The timestamp on the security camera was altered.</button>
            </div>
            
            <button onClick={() => { playSound('click'); setGameState('editor'); }} className="mt-6 w-full text-xs text-zinc-400 hover:text-white transition-colors">[ &lt; BACK TO EVIDENCE ]</button>
          </div>
        </main>
      );
    }

    if (gameState === 'failed') {
      return (
        <main className="crt-effect glitch-in min-h-screen bg-black text-red-500 flex flex-col items-center justify-center p-8">
          <div className="border-2 border-red-500 p-8 max-w-2xl shadow-[0_0_30px_rgba(239,68,68,0.5)] bg-black/80 text-center">
            <h1 className="text-4xl font-bold mb-4 tracking-widest glitch-text">CASE DISMISSED</h1>
            <p className="text-md text-white mb-6">You accused the wrong person. The suspect walked free, and Internal Affairs has suspended you.</p>
            <button onClick={() => { playSound('click'); setGameState('editor'); }} className="btn-press mt-4 w-full bg-red-500 text-black font-bold py-3 hover:bg-red-400 transition-colors">[ TRY AGAIN ]</button>
          </div>
        </main>
      );
    }

    if (gameState === 'solved') {
      return (
        <main className="crt-effect glitch-in min-h-screen bg-black bg-cover bg-center text-red-400 flex flex-col items-center justify-center p-8" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url('/bg.jpg')" }}>
          <div className="border-2 border-green-500 p-8 max-w-2xl shadow-[0_0_30px_rgba(34,197,94,0.4)] bg-black/80">
            <h1 className="text-4xl font-bold mb-4 text-green-500 tracking-widest">CASE CLOSED: #001</h1>
            <p className="text-sm mb-6 text-green-200/70">INTERNAL AFFAIRS REPORT</p>
            <div className="space-y-4 text-md text-white">
              <p><span className="font-bold text-green-400">FINDINGS:</span> Correct. The timestamp on the security camera was altered.</p>
              <p className="leading-relaxed">By using the Enhance tool to increase the exposure, or the Zoom tool to inspect the bottom right corner, you noticed the digital artifacts around the date stamp.</p>
              <p className="leading-relaxed">The murder actually happened at <span className="font-bold text-pink-500">02:13 AM</span>, not 04:15 AM. The suspect used the altered time to establish a fake alibi.</p>
            </div>
            <button onClick={() => { playSound('click'); setGameState('briefing'); }} className="btn-press mt-8 w-full bg-green-500 text-black font-bold py-3 hover:bg-pink-500 transition-colors">[ RETURN TO MAIN MENU ]</button>
          </div>
        </main>
      );
    }

    // EDITOR STATE
    return (
      <main className="crt-effect glitch-in min-h-screen bg-zinc-950 bg-cover bg-center text-white flex flex-col p-4" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url('/bg.jpg')" }}>
        <header className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b-2 border-cyan-500/50 pb-2 px-2 z-10 gap-2">
          <h1 className="text-sm sm:text-xl text-cyan-400 tracking-widest flex items-center gap-2">
            <span className="text-pink-500 animate-pulse">●</span> VICE//TRACE :: EVIDENCE_VIEWER.exe
          </h1>
          <div className="flex flex-wrap justify-center gap-2 items-center">
            <button onClick={toggleMute} className="btn-press text-[10px] sm:text-xs text-xs text-cyan-400 hover:text-white border border-cyan-500/50 hover:border-cyan-500 px-2 py-1 transition-colors mr-2" aria-label="Toggle Music">[ {isMuted ? 'UNMUTE MUSIC' : 'MUTE MUSIC'} ]</button>

            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUploadNew} className="hidden" />
            <button onClick={() => { playSound('click'); fileInputRef.current?.click(); }} className="btn-press text-xs text-green-400 hover:text-white border border-green-500/50 hover:border-green-500 px-2 py-1 transition-colors" aria-label="Upload New Evidence">[ UPLOAD NEW EVIDENCE ]</button>

            <button onClick={handleResetEvidence} className="btn-press text-[10px] sm:text-xs text-xs text-yellow-500 hover:text-white border border-yellow-500/50 hover:border-yellow-500 px-2 py-1 transition-colors" aria-label="Reset Evidence">[ RESET EVIDENCE ]</button>
            <button onClick={() => { playSound('click'); setGameState('briefing'); }} className="btn-press text-[10px] sm:text-xs text-xs text-zinc-400 hover:text-red-500 border border-zinc-600 hover:border-red-500 px-2 py-1 transition-colors" aria-label="Close File">[ X CLOSE FILE ]</button>
          </div>
        </header>

        <div className="spy-cursor w-full p-2 border-2 border-cyan-500/30 rounded-lg shadow-[0_0_25px_rgba(34,211,238,0.15)] bg-black/50" style={{ height: '70vh', minHeight: '400px' }}>
          <ImageEditor 
            ref={editorRef}
            image={evidenceImage}  
            minHeight="100%" 
            options={{
              theme: 'dark',
              features: {
                imageEditor: {
                  dock: 'left', 
                  tools: {
                    resize: false,
                    stickers: false,
                    frame: false,
                    shapes: { icon: 'fa-eye-slash' }, 
                    crop: { icon: 'fa-search-plus' }, 
                    filter: { icon: 'fa-magic' },
                    draw: { icon: 'fa-pen' },
                    text: { icon: 'fa-stamp' },
                  }
                }
              },
              translations: {
                en: {
                  'image_editor.toolbar.save': 'SUBMIT FINDINGS',
                  'image_editor.toolbar.cancel': 'CLOSE FILE',
                  'image_editor.tools.filter': 'ENHANCE',
                  'image_editor.tools.crop': 'ZOOM',
                  'image_editor.tools.draw': 'MARK',
                  'image_editor.tools.text': 'ANNOTATE',
                  'image_editor.tools.shapes': 'REDACT',
                }
              }
            }} 
            onSave={handleSave} 
            onCancel={() => { playSound('click'); setGameState('briefing'); }} 
            onLoadError={handleLoadError} 
            onError={handleError}         
          />
        </div>
        
        <footer className="mt-4 flex flex-col sm:flex-row justify-center sm:justify-between text-center text-xs text-cyan-200/50 px-2 z-10 gap-1">
          <span>VCPD TERMINAL v1.0.4</span>
          <span className="animate-pulse">CONNECTION SECURE // LOGGING ACTIVITY</span>
          <span>USER: DETECTIVE_{userName}</span>
        </footer>
      </main>
    );
  };

  return (
    <>
      {/* Removed invalid volume prop, controlled via JS */}
      <audio ref={audioRef} src="/music.mp3" loop autoPlay muted={isMuted} />
      {renderScreen()}
    </>
  );
}