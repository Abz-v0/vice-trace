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
  const staticHumRef = useRef(null);
  const audioContextRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [userName, setUserName] = useState('GUEST');
  const [inputName, setInputName] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [evidenceImage, setEvidenceImage] = useState("/evidence1.jpg");
  const [bootLines, setBootLines] = useState([]);
  const [analysisAnswer, setAnalysisAnswer] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [uploadError, setUploadError] = useState('');

  const getAudioContext = () => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // --- AMBIENT STATIC HUM (CRT terminal atmosphere) ---
  const startStaticHum = () => {
    if (staticHumRef.current) return; // already running
    const ctx = getAudioContext();
    if (!ctx) return;
    const bufferSize = 2 * ctx.sampleRate; // 2 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Shape it: bandpass filter to sound like CRT static, not white noise
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 800;
    bandpass.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.value = 0.012; // very subtle

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    staticHumRef.current = { noise, gain };
  };

  // --- OPTIMIZED SOUND API LOGIC ---
  const playSound = (type) => {
    if (typeof window !== 'undefined') {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;
      
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
        playNote(523.25, audioCtx.currentTime, 0.1); // C
        playNote(659.25, audioCtx.currentTime + 0.1, 0.1); // E
        playNote(783.99, audioCtx.currentTime + 0.2, 0.2); // G
      }
    }
  };

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

  const handleSave = ({ dataUrl, blob }) => {
    console.info('Saved', dataUrl.length, 'characters');
    playSound('success');
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `VICE_TRACE_Evidence_${userName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setAnalysisAnswer('');
    setAnalysisError('');
    setGameState('analysis');
  };

  const handleLoadError = () => {
    console.error("IMAGE FAILED TO LOAD");
    playSound('error');
  };

  const handleError = (error) => console.error("EDITOR ERROR:", error);

  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleAccessFile = () => {
    playSound('click');
    if (inputName.trim()) setUserName(inputName.trim().toUpperCase().replace(/\s+/g, '_'));
    setGameState('connecting');
  };

  const startBootSequence = () => {
    fadeAudioIn();
    startStaticHum();
    setBootLines([]);
    setGameState('booting');
  };

  const submitAnalysis = (event) => {
    event.preventDefault();
    const normalizedAnswer = analysisAnswer.replace(/[^0-9]/g, '');
    if (normalizedAnswer === '0213') {
      playSound('success');
      setAnalysisError('');
      setGameState('accusing');
      return;
    }
    playSound('error');
    setAnalysisError('The recovered time does not match the artifact pattern. Re-open the evidence and inspect the bottom-right timestamp.');
  };

  const handleNameKeyDown = (e) => {
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
      if (!file.type.startsWith('image/')) {
        setUploadError('Unsupported file. Upload a JPG, PNG, WebP, or another image file.');
        event.target.value = '';
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setUploadError('Evidence file is too large. Use an image smaller than 8 MB.');
        event.target.value = '';
        return;
      }
      playSound('click');
      setUploadError('');
      const reader = new FileReader();
      reader.onload = (e) => setEvidenceImage(e.target.result);
      reader.onerror = () => setUploadError('Evidence could not be read. Please try another image.');
      reader.readAsDataURL(file);
      event.target.value = '';
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
      
      const interval = setInterval(() => {
        if (currentLine < lines.length) {
          setBootLines(prev => [...prev, lines[currentLine]]);
          currentLine++;
        } else {
          clearInterval(interval);
          setTimeout(() => setGameState('briefing'), 1000);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'connecting') return;
    const timer = window.setTimeout(() => setGameState('editor'), 3000);
    return () => window.clearTimeout(timer);
  }, [gameState]);

  useEffect(() => () => {
    staticHumRef.current?.noise.stop();
    audioContextRef.current?.close();
  }, []);

  // --- RENDER SCREEN LOGIC ---
  const renderScreen = () => {
    if (gameState === 'start') {
      return (
        <main className="crt-effect min-h-screen bg-black bg-cover bg-center flex flex-col items-center justify-center p-8" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url('/bg.jpg')" }}>
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-cyan-400 tracking-widest glitch-text mb-8">VICE//TRACE</h1>
            <button onClick={startBootSequence} className="btn-press text-xl text-pink-500 animate-pulse border border-pink-500/50 px-5 py-3 hover:bg-pink-500 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
              [ INITIALIZE TERMINAL ]
            </button>
            <p className="mt-4 text-xs text-cyan-100/60">Audio starts muted by default. Use the terminal controls to enable it.</p>
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
            <button onClick={() => setGameState('briefing')} className="btn-press mt-6 text-xs text-cyan-300 underline hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">[ SKIP BOOT SEQUENCE ]</button>
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
                onKeyDown={handleNameKeyDown}
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
            <div className="w-64 h-2 bg-zinc-800 mt-4 overflow-hidden border border-cyan-500/30">
              <div className="h-full bg-cyan-500" style={{ animation: 'fillBar 3s linear forwards' }}></div>
            </div>
          </div>
        </main>
      );
    }

    if (gameState === 'analysis') {
      return (
        <main className="crt-effect glitch-in min-h-screen bg-black bg-cover bg-center text-white flex flex-col items-center justify-center p-8" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url('/bg.jpg')" }}>
          <div className="border-2 border-cyan-500 p-8 max-w-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)] bg-black/80">
            <p className="text-xs text-cyan-200/70 mb-2">CHAIN OF CUSTODY // EXHIBIT EXPORTED</p>
            <h1 className="text-3xl font-bold mb-5 text-cyan-400 tracking-widest">VERIFY RECOVERED DATA</h1>
            <div className="border border-cyan-500/30 bg-cyan-950/20 p-4 text-sm text-cyan-100 space-y-2">
              <p><span className="text-pink-500">OBJECTIVE:</span> Confirm the original time hidden by the altered camera stamp.</p>
              <p>Use your annotated export and the evidence viewer. The visual artifact is in the bottom-right timestamp.</p>
            </div>
            <form onSubmit={submitAnalysis} className="mt-6">
              <label htmlFor="recovered-time" className="block text-xs text-cyan-200/70 mb-2">RECOVERED TIME (24-HOUR FORMAT)</label>
              <input
                id="recovered-time"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={analysisAnswer}
                onChange={(event) => setAnalysisAnswer(event.target.value)}
                placeholder="e.g. 02:13"
                className="w-full bg-zinc-900 border border-cyan-500/50 text-white px-3 py-3 text-lg focus:outline-none focus:border-pink-500"
                aria-describedby={analysisError ? 'analysis-error' : undefined}
              />
              {analysisError && <p id="analysis-error" role="alert" className="mt-3 text-sm text-red-400">{analysisError}</p>}
              <button type="submit" className="btn-press mt-5 w-full bg-cyan-500 text-black font-bold py-3 hover:bg-pink-500 hover:text-white transition-colors">[ VERIFY FINDING ]</button>
            </form>
            <button onClick={() => { playSound('click'); setGameState('editor'); }} className="mt-5 w-full text-xs text-zinc-400 hover:text-white transition-colors">[ &lt; RETURN TO EVIDENCE ]</button>
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
              <p className="leading-relaxed text-lg">Recovered timestamp confirmed. Before Internal Affairs throws this out, identify exactly what the suspect altered in this photograph.</p>
              <p className="text-pink-500 font-bold">Choose carefully. Accusing the wrong person ends your career.</p>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <button onClick={() => makeAccusation(false)} className="btn-press w-full bg-zinc-800 text-white font-bold py-4 text-lg tracking-wide border border-zinc-600 hover:bg-zinc-700 hover:border-red-500 transition-all">A) The victim&apos;s face was blurred to hide their identity.</button>
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
        <div className="border-2 border-green-500 p-8 max-w-2xl shadow-[0_0_30px_rgba(34,197,94,0.4)] bg-black/80 text-center">
          <h1 className="text-4xl font-bold mb-2 text-green-500 tracking-widest glitch-text">CASE CLOSED: #001</h1>
          
          {/* THE NEW RANK DISPLAY */}
          <p className="text-xl text-pink-500 font-bold tracking-widest mb-6 animate-pulse">
            RANK: INTERNAL AFFAIRS HERO
          </p>

          <p className="text-sm mb-6 text-green-200/70">INTERNAL AFFAIRS REPORT</p>
          <div className="space-y-4 text-md text-white text-left">
            <p><span className="font-bold text-green-400">FINDINGS:</span> Correct. The timestamp on the security camera was altered.</p>
            <p className="leading-relaxed">By using the Enhance tool to increase the exposure, or the Zoom tool to inspect the bottom-right corner, you noticed the digital artifacts around the date stamp.</p>
            <p className="leading-relaxed">The murder actually happened at <span className="font-bold text-pink-500">02:13 AM</span>, not 04:15 AM. The suspect used the altered time to establish a fake alibi.</p>
          </div>
          <button onClick={() => { playSound('click'); setGameState('briefing'); }} className="btn-press mt-8 w-full bg-green-500 text-black font-bold py-3 hover:bg-pink-500 transition-colors">[ RETURN TO MAIN MENU ]</button>
        </div>
      </main>
    );
  }

    // EDITOR STATE (Default return)
    return (
      <main className="crt-effect glitch-in min-h-screen bg-zinc-950 bg-cover bg-center text-white flex flex-col p-4 sm:p-6" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url('/bg.jpg')" }}>
        
        {/* Custom HUD Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b-2 border-cyan-500/50 pb-2 px-2 z-10 gap-2">
          <div className="flex items-center gap-3">
            <span className="text-pink-500 animate-pulse text-lg">●</span>
            <h1 className="text-sm sm:text-xl text-cyan-400 tracking-widest">VICE//TRACE</h1>
            <span className="hidden sm:inline text-xs text-zinc-500">:: EVIDENCE_VIEWER.exe</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 items-center">
            <button onClick={toggleMute} className="btn-press text-[10px] sm:text-xs text-cyan-400 hover:text-white border border-cyan-500/50 hover:border-cyan-500 px-2 py-1 transition-colors" aria-label="Toggle Music">[ {isMuted ? 'UNMUTE' : 'MUTE'} ]</button>

            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUploadNew} className="hidden" />
            <button onClick={() => { playSound('click'); fileInputRef.current?.click(); }} className="btn-press text-[10px] sm:text-xs text-green-400 hover:text-white border border-green-500/50 hover:border-green-500 px-2 py-1 transition-colors" aria-label="Upload New Evidence">[ UPLOAD ]</button>

            <button onClick={handleResetEvidence} className="btn-press text-[10px] sm:text-xs text-yellow-500 hover:text-white border border-yellow-500/50 hover:border-yellow-500 px-2 py-1 transition-colors" aria-label="Reset Evidence">[ RESET ]</button>
            <button onClick={() => { playSound('click'); setGameState('briefing'); }} className="btn-press text-[10px] sm:text-xs text-red-500 hover:text-white border border-red-500/50 hover:border-red-500 px-2 py-1 transition-colors" aria-label="Close File">[ CLOSE ]</button>
          </div>
        </header>

        <section className="mb-4 border border-cyan-500/30 bg-black/70 px-3 py-2 text-xs text-cyan-100/80 z-10" aria-label="Case objective">
          <span className="text-pink-500 font-bold">CASE OBJECTIVE:</span> Inspect the bottom-right camera timestamp. Enhance or zoom the artifact, annotate it, then use <span className="text-cyan-300">SUBMIT FINDINGS</span> to export your exhibit and verify the recovered time.
          {uploadError && <p role="alert" className="mt-2 text-red-400">{uploadError}</p>}
        </section>

        {/* Hardware Bezel Wrapper for the Editor */}
        <div className="flex-1 w-full p-2 sm:p-4 bg-black border-[6px] border-zinc-800 rounded-xl shadow-[inset_0_0_30px_rgba(0,0,0,0.8),0_0_25px_rgba(34,211,238,0.15)]" style={{ height: '70vh', minHeight: '400px' }}>
          <div className="spy-cursor w-full h-full bg-zinc-900 border border-cyan-500/20">
            <ImageEditor 
              ref={editorRef}
              image={evidenceImage}  
              minHeight="100%" 
              options={{
                projectId: 289525, // <--- PROJECT ID ADDED HERE
                theme: 'dark',
                defaultPrompt: "You are a VCPD Forensic AI Assistant. Help the detective enhance, inspect, and find the altered timestamp in this evidence photo.",
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
                  },
                  // <--- AI ASSISTANT UNLOCKED HERE --->
                  ai: {
                    enabled: true,
                    assistant: true
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
        </div>
        
        {/* Hardware Status Bar Footer */}
        <footer className="mt-4 flex flex-col sm:flex-row justify-center sm:justify-between text-center text-[10px] sm:text-xs text-cyan-200/50 px-2 z-10 gap-1 font-mono">
          <span>SYS_V1.0.4 // SECURE</span>
          <span className="animate-pulse hidden sm:inline">● LOGGING ACTIVITY</span>
          <span>DETECTIVE: {userName}</span>
        </footer>
      </main>
    );
  };

  // Final Return (Wraps the audio and the renderScreen function)
  return (
    <>
      <audio ref={audioRef} src="/music.mp3" loop autoPlay muted={isMuted} />
      {renderScreen()}
    </>
  );
}
