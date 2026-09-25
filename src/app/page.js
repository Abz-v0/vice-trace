"use client";

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';

const ImageEditor = dynamic(() => import('@unlayer/react-image-editor'), {
  ssr: false,
  loading: () => <p className="text-cyan-400 font-mono animate-pulse">MOUNTING EVIDENCE DRIVE...</p>,
});

const HINTS = [
  'Start with ENHANCE. Raise the exposure just enough to separate the red timestamp from the wet pavement.',
  'The alteration is not elsewhere in the scene. ZOOM into the lower-right camera overlay and inspect the first two time digits.',
  'The displayed stamp says 04:15, but the recovered sequence begins with 02 and ends with 13.',
];

const CASES = {
  metro: {
    id: '001',
    title: 'The Vice City Metro Incident',
    location: 'DOWNTOWN // CAM_04',
    image: '/evidence1.jpg',
    objective: 'Inspect the bottom-right camera timestamp. Enhance or zoom the artifact, annotate it, then export your exhibit.',
    recoveryPrompt: 'Confirm the original time hidden by the altered camera stamp.',
    recoveryAnswer: '0213',
    recoveryPlaceholder: 'e.g. 02:13',
    boardClues: ['Timestamp pixels show compression seams around the changed digits.', 'The camera lens has a visible crack across the corner.', 'The pavement reflections are brighter on the left.'],
    boardConclusions: ['The overlay was edited after capture to create a false alibi.', 'The camera clock lost power before the incident.', 'The suspect entered the scene from the west.'],
    boardPair: [0, 0],
    evidenceHint: 'The visual artifact is in the bottom-right timestamp.',
    hints: HINTS,
    accusationPrompt: 'Recovered timestamp confirmed. Identify exactly what the suspect altered in this photograph.',
    choices: [
      'The victim\'s face was blurred to hide their identity.',
      'A murder weapon was photoshopped out of the frame.',
      'The timestamp on the security camera was altered.',
    ],
    correctChoice: 2,
    findings: 'Correct. The timestamp on the security camera was altered.',
    solution: 'The murder happened at 02:13 AM, not 04:15 AM. The suspect used the altered time to establish a fake alibi.',
  },
  marina: {
    id: '002',
    title: 'The Marina Exchange',
    location: 'MIRAGE MARINA // CAM_11',
    image: '/evidence2.jpg',
    objective: 'Inspect the waterline beneath the speedboat. Enhance the dark reflection and mark the inconsistent silhouette before exporting your exhibit.',
    recoveryPrompt: 'Confirm where the impossible silhouette appears in the evidence.',
    recoveryAnswer: 'reflection',
    recoveryPlaceholder: 'e.g. reflection',
    boardClues: ['A human shape appears only in the water beneath the boat.', 'The dock lights cast long pink streaks across the harbor.', 'A dark coupe is parked near the marina entrance.'],
    boardConclusions: ['A witness was composited into the image to place them at the exchange.', 'The witness boarded the speedboat before the camera arrived.', 'The coupe driver was standing on the dock.'],
    boardPair: [0, 0],
    evidenceHint: 'The dock is empty. Compare it with the reflection directly beneath the moored speedboat.',
    hints: [
      'The dock itself is not the altered area. Bring up the dark detail in the water beneath the foreground speedboat.',
      'Compare the empty stretch of dock with its reflected version—one contains a figure that has no source.',
      'The clue is a human silhouette that appears only in the water reflection.',
    ],
    accusationPrompt: 'The reflection anomaly has been verified. Identify the manipulation used to manufacture an alibi.',
    choices: [
      'A human silhouette was composited into the water reflection while the physical dock remained empty.',
      'The sports coupe was recolored to conceal its owner.',
      'The neon waterfront building was removed from the background.',
    ],
    correctChoice: 0,
    findings: 'Correct. The reflected silhouette was composited into the water to place a witness at the marina.',
    solution: 'The dock was empty when the camera recorded the scene. The fabricated reflection was used to support a false witness statement and protect the boat owner.',
  },
  courier: {
    id: '003',
    title: 'The Courier’s Double',
    location: 'SEABREEZE MARKET // CAM_19',
    image: '/evidence3.jpg',
    objective: 'Compare the two red delivery scooters. ZOOM in, mark the repeated details, and export the exhibit.',
    recoveryPrompt: 'Confirm the item that was duplicated to fabricate the courier’s route.',
    recoveryAnswer: 'scooter',
    recoveryPlaceholder: 'e.g. scooter',
    boardClues: ['Both red scooters repeat the same torn seat and blue cargo bag.', 'The foreground scooter has a brighter headlight.', 'Rainwater runs toward the harbor drain.'],
    boardConclusions: ['One scooter was cloned to fabricate a second stop on the route.', 'Two different couriers arrived at the market together.', 'The delivery bag was switched after the drop-off.'],
    boardPair: [0, 0],
    evidenceHint: 'Compare the foreground red scooter with the red scooter beneath the market awning.',
    hints: [
      'There are two red scooters, but there should only be one courier vehicle in this delivery zone.',
      'ZOOM into the cargo bags, saddle damage, and rear hardware on both scooters.',
      'The second red scooter is a clone: its blue bag and unique damage repeat exactly.',
    ],
    accusationPrompt: 'The duplicate vehicle has been verified. Identify the manipulation used to falsify the delivery route.',
    choices: [
      'A second red delivery scooter was digitally cloned into the surveillance frame.',
      'The waterfront lights were recolored to hide a warning signal.',
      'The market shutters were opened to create a false entry point.',
    ],
    correctChoice: 0,
    findings: 'Correct. A second delivery scooter was cloned into the frame to make one courier appear to be in two places at once.',
    solution: 'The duplicate was used to validate an impossible delivery route. The real courier could not have reached the second pickup point in time.',
  },
  penthouse: {
    id: '004',
    title: 'The Penthouse Alibi',
    location: 'HORIZON TOWER // CAM_27',
    image: '/evidence4.jpg',
    objective: 'Inspect the terrace floor. Enhance contrast and compare the potted palm’s shadow with the other objects before exporting your exhibit.',
    recoveryPrompt: 'Confirm which object casts the impossible shadow.',
    recoveryAnswer: 'palm',
    recoveryPlaceholder: 'e.g. palm',
    boardClues: ['The palm shadow points toward the visible sunrise.', 'The lounge chair casts a long shadow across the terrace.', 'The pool reflects the bright sky.'],
    boardConclusions: ['The plant shadow was altered to misrepresent the time of capture.', 'The terrace lights were turned on before dawn.', 'The image was captured after sunset.'],
    boardPair: [0, 0],
    evidenceHint: 'The sunrise is on the right. Compare the potted palm’s shadow with the chair and table shadows.',
    hints: [
      'Use the sun as a reference point: every genuine shadow should fall away from it.',
      'The lounge chair and table follow the morning light. One plant does not.',
      'The potted palm’s shadow points toward the sunrise, so it was composited into the image.',
    ],
    accusationPrompt: 'The lighting anomaly has been verified. Identify the alteration used to support the penthouse alibi.',
    choices: [
      'The potted palm’s shadow was composited in the wrong direction to falsify the time of the image.',
      'The pool water was recolored to conceal chemical evidence.',
      'The skyline was digitally moved closer to the terrace.',
    ],
    correctChoice: 0,
    findings: 'Correct. The palm shadow was altered to make the image appear to have been recorded later in the morning.',
    solution: 'The genuine sunrise direction proves the photo was taken before the suspect’s claimed arrival. The altered shadow was meant to manufacture a later timestamp without changing the camera overlay.',
  },
  manifest: {
    id: '005',
    title: 'The Missing Manifest',
    location: 'PORT ARCADIA // EVIDENCE DESK',
    image: '/evidence5.jpg',
    objective: 'Enhance the folded manifest on the desk. Isolate the faint route code beneath the folded corner and export your exhibit.',
    recoveryPrompt: 'Enter the recovered container route code.',
    recoveryAnswer: 'LT47',
    recoveryPlaceholder: 'e.g. LT-47',
    boardClues: ['A faint LT-47 code is written beneath the folded manifest corner.', 'The flashlight is pointed toward the warehouse door.', 'Rain is visible through the loading shutter.'],
    boardConclusions: ['A container was diverted off the official inspection route.', 'The manifest was printed after the vessel departed.', 'The warehouse was closed when the cargo arrived.'],
    boardPair: [0, 0],
    evidenceHint: 'The code is written on the manifest beneath the folded corner, beside the flashlight.',
    hints: [
      'The warehouse yard is a distraction. Focus on the paperwork under the desk lamp.',
      'Increase brightness only slightly; the folded corner hides a faint two-letter, two-number route code.',
      'The recovered route code is LT-47.',
    ],
    accusationPrompt: 'The route code has been recovered. Identify what was concealed in the warehouse evidence.',
    choices: [
      'The route code on the shipping manifest was hidden to divert a container from the official records.',
      'The cargo vessel was removed from the harbor background.',
      'The flashlight was duplicated to make the office look occupied.',
    ],
    correctChoice: 0,
    findings: 'Correct. The concealed route code exposed a container diversion that never appeared in the official shipping record.',
    solution: 'Route LT-47 directed the container away from Port Arcadia’s inspection lane. The folded corner was used to obscure the only surviving record of the diversion.',
  },
};

const CASE_SUMMARIES = {
  metro: 'Recover a falsified surveillance timestamp.',
  marina: 'Expose an impossible reflection in the marina water.',
  courier: 'Prove a courier vehicle was digitally duplicated.',
  penthouse: 'Find the shadow that contradicts the sunrise.',
  manifest: 'Recover a concealed container route code.',
};

const ANALYST_TRANSMISSIONS = {
  metro: {
    briefing: 'The camera overlay is loud, but the pixels around it are louder. Do not trust the first time you see.',
    debrief: 'Clean recovery. The suspect spent more effort changing the clock than hiding the damage around it.',
  },
  marina: {
    briefing: 'Water does not invent witnesses. If a person appears in a reflection, find the person casting it.',
    debrief: 'Good. A reflection needs a source. This one had none.',
  },
  courier: {
    briefing: 'A courier can be late. They cannot be in two loading bays at once. Compare what should be unique.',
    debrief: 'Two scooters, one set of scars. The route was manufactured.',
  },
  penthouse: {
    briefing: 'Light is a witness that cannot be bribed. Start with the sun, then interrogate every shadow.',
    debrief: 'The sunrise testified against the alibi. Shadows keep better time than suspects.',
  },
  manifest: {
    briefing: 'Paper lies quietly. Raise the detail slowly—too much enhancement can bury the ink you need.',
    debrief: 'LT-47 is enough to pull the container history. Nice restraint on the enhancement.',
  },
};

const loadDetectiveRecord = () => {
  if (typeof window === 'undefined') return { cases: {}, totalScore: 0 };
  try {
    return JSON.parse(window.localStorage.getItem('vice-trace-detective-record')) || { cases: {}, totalScore: 0 };
  } catch {
    return { cases: {}, totalScore: 0 };
  }
};

const getRank = (score) => {
  if (score >= 90) return 'S-RANK DETECTIVE';
  if (score >= 70) return 'INTERNAL AFFAIRS HERO';
  if (score >= 45) return 'FORENSIC SPECIALIST';
  return 'STREET ROOKIE';
};

export default function Home() {
  const editorRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null); 
  const staticHumRef = useRef(null);
  const audioContextRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [selectedCaseKey, setSelectedCaseKey] = useState('metro');
  const [userName, setUserName] = useState('GUEST');
  const [inputName, setInputName] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [evidenceImage, setEvidenceImage] = useState("/evidence1.jpg");
  const [bootLines, setBootLines] = useState([]);
  const [analysisAnswer, setAnalysisAnswer] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [analysisAttempts, setAnalysisAttempts] = useState(0);
  const [boardClueChoice, setBoardClueChoice] = useState(null);
  const [boardConclusionChoice, setBoardConclusionChoice] = useState(null);
  const [boardError, setBoardError] = useState('');
  const [boardSolved, setBoardSolved] = useState(false);
  const [caseScore, setCaseScore] = useState(100);
  const [caseDuration, setCaseDuration] = useState(0);
  const [shareStatus, setShareStatus] = useState('');
  const caseStartedAtRef = useRef(null);
  const [detectiveRecord, setDetectiveRecord] = useState(loadDetectiveRecord);
  const currentCase = CASES[selectedCaseKey];

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
    let noiseSeed = 123456789;
    for (let i = 0; i < bufferSize; i++) {
      noiseSeed = (noiseSeed * 1664525 + 1013904223) % 4294967296;
      output[i] = (noiseSeed / 2147483648) - 1;
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

  const handleSave = ({ dataUrl }) => {
    console.info('Saved', dataUrl.length, 'characters');
    playSound('success');
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `VICE_TRACE_Case_${currentCase.id}_${userName}.png`;
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

  const handleAccessFile = (event) => {
    playSound('click');
    if (inputName.trim()) setUserName(inputName.trim().toUpperCase().replace(/\s+/g, '_'));
    caseStartedAtRef.current = event?.timeStamp || 0;
    setHintLevel(0);
    setAnalysisAttempts(0);
    setBoardClueChoice(null);
    setBoardConclusionChoice(null);
    setBoardError('');
    setBoardSolved(false);
    setCaseScore(100);
    setCaseDuration(0);
    setShareStatus('');
    setGameState('connecting');
  };

  const prepareCaseEvidence = (caseKey) => {
    const caseFile = CASES[caseKey];
    if (!['marina', 'penthouse', 'manifest'].includes(caseKey) || typeof window === 'undefined') {
      setEvidenceImage(caseFile.image);
      return;
    }

    const sourceImage = new window.Image();
    sourceImage.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = sourceImage.naturalWidth;
      canvas.height = sourceImage.naturalHeight;
      const context = canvas.getContext('2d');
      context.drawImage(sourceImage, 0, 0);

      if (caseKey === 'marina') {
        // Deliberate evidence tamper: a faint figure exists only in the water reflection.
        const reflectionX = canvas.width * 0.56;
        const reflectionY = canvas.height * 0.74;
        context.save();
        context.globalAlpha = 0.32;
        context.filter = 'blur(2px)';
        context.fillStyle = '#d8b85b';
        context.beginPath();
        context.ellipse(reflectionX, reflectionY, canvas.width * 0.008, canvas.height * 0.015, 0, 0, Math.PI * 2);
        context.fill();
        context.fillRect(reflectionX - canvas.width * 0.009, reflectionY + canvas.height * 0.01, canvas.width * 0.018, canvas.height * 0.09);
        context.globalAlpha = 0.2;
        context.fillRect(reflectionX - canvas.width * 0.018, reflectionY + canvas.height * 0.11, canvas.width * 0.036, canvas.height * 0.008);
        context.fillRect(reflectionX - canvas.width * 0.013, reflectionY + canvas.height * 0.14, canvas.width * 0.026, canvas.height * 0.006);
        context.restore();
      }

      if (caseKey === 'penthouse') {
        // Deliberate evidence tamper: a palm shadow points back toward the sunrise.
        context.save();
        context.globalAlpha = 0.2;
        context.filter = 'blur(4px)';
        context.fillStyle = '#2b1a0e';
        context.beginPath();
        context.moveTo(canvas.width * 0.39, canvas.height * 0.52);
        context.bezierCurveTo(canvas.width * 0.47, canvas.height * 0.54, canvas.width * 0.54, canvas.height * 0.59, canvas.width * 0.58, canvas.height * 0.66);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.61);
        context.lineTo(canvas.width * 0.42, canvas.height * 0.57);
        context.closePath();
        context.fill();
        context.restore();
      }

      if (caseKey === 'manifest') {
        // Deliberate evidence tamper: a faint route code is concealed on the folded manifest.
        context.save();
        context.globalAlpha = 0.48;
        context.filter = 'blur(0.35px)';
        context.fillStyle = '#342418';
        context.font = `${Math.round(canvas.width * 0.018)}px Georgia, serif`;
        context.rotate(-0.09);
        context.fillText('LT-47', canvas.width * 0.47, canvas.height * 0.74);
        context.restore();
      }

      setEvidenceImage(canvas.toDataURL('image/jpeg', 0.92));
    };
    sourceImage.onerror = () => setEvidenceImage(caseFile.image);
    sourceImage.src = caseFile.image;
  };

  const selectCase = (caseKey) => {
    playSound('click');
    setSelectedCaseKey(caseKey);
    prepareCaseEvidence(caseKey);
    setUploadError('');
    setGameState('briefing');
  };

  const startBootSequence = () => {
    fadeAudioIn();
    startStaticHum();
    setBootLines([]);
    setGameState('booting');
  };

  const submitAnalysis = (event) => {
    event.preventDefault();
    const normalizedAnswer = analysisAnswer.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const expectedAnswer = currentCase.recoveryAnswer.replace(/[^a-z0-9]/g, '');
    if (normalizedAnswer === expectedAnswer) {
      playSound('success');
      setAnalysisError('');
      setBoardClueChoice(null);
      setBoardConclusionChoice(null);
      setBoardError('');
      setGameState('board');
      return;
    }
    playSound('error');
    setAnalysisAttempts((attempts) => attempts + 1);
    setCaseScore((score) => Math.max(0, score - 10));
    setAnalysisError(`The recovered detail does not match the evidence. Re-open the exhibit and ${currentCase.evidenceHint.toLowerCase()}`);
  };

  const submitEvidenceBoard = (event) => {
    event.preventDefault();
    if (boardSolved) return;
    if (boardClueChoice === null || boardConclusionChoice === null) {
      setBoardError('Select one observed detail and one conclusion to connect the evidence.');
      return;
    }
    if (boardClueChoice !== currentCase.boardPair[0] || boardConclusionChoice !== currentCase.boardPair[1]) {
      playSound('error');
      setBoardError('That link does not hold up under review. Recheck the exhibit or request an analyst note.');
      setCaseScore((score) => Math.max(0, score - 5));
      return;
    }
    playSound('success');
    setBoardError('');
    setBoardSolved(true);
    setCaseScore((score) => Math.min(100, score + 5));
  };

  const revealHint = () => {
    if (hintLevel >= currentCase.hints.length) return;
    playSound('click');
    setHintLevel((level) => level + 1);
    setCaseScore((score) => Math.max(0, score - 15));
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAccessFile();
    }
  };

  const saveCaseResult = (finalScore) => {
    const previous = detectiveRecord.cases?.[selectedCaseKey];
    const caseResult = {
      bestScore: Math.max(previous?.bestScore || 0, finalScore),
      completed: true,
    };
    const cases = { ...detectiveRecord.cases, [selectedCaseKey]: caseResult };
    const totalScore = Object.values(cases).reduce((total, result) => total + result.bestScore, 0);
    const nextRecord = { cases, totalScore };
    window.localStorage.setItem('vice-trace-detective-record', JSON.stringify(nextRecord));
    setDetectiveRecord(nextRecord);
  };

  const makeAccusation = (isCorrect, event) => {
    playSound(isCorrect ? 'success' : 'error');
    if (isCorrect && caseStartedAtRef.current) {
      const elapsedSeconds = Math.max(0, Math.floor(((event?.timeStamp || caseStartedAtRef.current) - caseStartedAtRef.current) / 1000));
      const finalScore = Math.max(0, caseScore - Math.min(20, Math.floor(elapsedSeconds / 30)));
      setCaseDuration(elapsedSeconds);
      setCaseScore(finalScore);
      saveCaseResult(finalScore);
    }
    setGameState(isCorrect ? 'solved' : 'failed');
  };

  const handleShareReport = async () => {
    const report = `VICE//TRACE case #001 closed by ${userName}. Score: ${caseScore}/100. Rank: ${getRank(caseScore)}. Can you find the lie?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'VICE//TRACE Case Report', text: report });
        setShareStatus('Case report shared.');
      } else {
        await navigator.clipboard.writeText(report);
        setShareStatus('Case report copied to clipboard.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setShareStatus('Sharing was unavailable. Copy the report from this screen instead.');
    }
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
          setTimeout(() => setGameState('files'), 1000);
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
            <button onClick={() => setGameState('files')} className="btn-press mt-6 text-xs text-cyan-300 underline hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">[ SKIP BOOT SEQUENCE ]</button>
          </div>
        </main>
      );
    }

    if (gameState === 'files') {
      const completedCases = Object.values(detectiveRecord.cases).filter((caseResult) => caseResult.completed).length;
      const averageScore = completedCases ? Math.round(detectiveRecord.totalScore / completedCases) : 0;
      return (
        <main className="crt-effect glitch-in min-h-screen bg-black bg-cover bg-center text-green-400 flex flex-col items-center justify-center p-5 sm:p-8" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.95)), url('/bg.jpg')" }}>
          <section className="w-full max-w-5xl border-2 border-cyan-500 bg-black/85 p-5 sm:p-8 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            <div className="flex flex-col gap-4 border-b border-cyan-500/50 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs text-pink-500">VCPD INTERNAL DATABASE // CASE FILES</p>
                <h1 className="mt-1 text-3xl font-bold tracking-widest text-cyan-400 sm:text-4xl">VICE//TRACE</h1>
              </div>
              <div className="grid grid-cols-3 border border-cyan-500/30 text-center text-[10px] sm:text-xs">
                <span className="border-r border-cyan-500/30 px-3 py-2"><strong className="block text-cyan-300">CLOSED</strong>{completedCases}/{Object.keys(CASES).length}</span>
                <span className="border-r border-cyan-500/30 px-3 py-2"><strong className="block text-cyan-300">AVG SCORE</strong>{averageScore || '--'}</span>
                <span className="px-3 py-2"><strong className="block text-pink-400">RANK</strong>{completedCases ? getRank(averageScore) : 'UNRANKED'}</span>
              </div>
            </div>
            <p className="mt-5 text-sm text-cyan-100/70">Select an active investigation. Your best score for each completed case is stored on this device.</p>
            <div className="analyst-signal mt-4 flex items-center gap-3 border border-pink-500/30 bg-pink-950/20 px-3 py-2 text-xs text-pink-100">
              <span className="animate-pulse text-pink-400">●</span>
              <span><strong>ANALYST M. VOSS // ONLINE</strong> — Five evidence packets await review.</span>
            </div>
            <div className="mt-5" aria-label={`${completedCases} of ${Object.keys(CASES).length} cases closed`}>
              <div className="mb-2 flex justify-between text-[10px] tracking-widest text-cyan-200/70"><span>INVESTIGATION PROGRESS</span><span>{completedCases} / {Object.keys(CASES).length}</span></div>
              <div className="h-1.5 overflow-hidden bg-zinc-800"><div className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 transition-[width] duration-700" style={{ width: `${(completedCases / Object.keys(CASES).length) * 100}%` }} /></div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(CASES).map(([caseKey, caseFile]) => {
                const result = detectiveRecord.cases?.[caseKey];
                return (
                  <button key={caseKey} onClick={() => selectCase(caseKey)} className="case-card group overflow-hidden border border-cyan-500/40 bg-zinc-950 text-left transition hover:border-pink-500 hover:bg-cyan-950/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
                    <div className="relative h-44 overflow-hidden">
                      <Image src={caseFile.image} alt={`Case ${caseFile.id} evidence preview`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90" />
                      <span className="absolute left-3 top-3 border border-pink-500/50 bg-black/80 px-2 py-1 text-[10px] text-pink-300">CASE {caseFile.id}</span>
                      {result?.completed && <span className="absolute right-3 top-3 border border-green-500/50 bg-black/80 px-2 py-1 text-[10px] text-green-300">CLOSED // {result.bestScore}</span>}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-cyan-200/60">{caseFile.location}</p>
                      <h2 className="mt-1 text-xl font-bold text-cyan-300">{caseFile.title}</h2>
                      <p className="mt-3 text-xs text-green-200/70">{CASE_SUMMARIES[caseKey]}</p>
                      <span className="mt-4 inline-block text-xs text-pink-400 group-hover:text-white">[ OPEN CASE FILE ]</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      );
    }

    if (gameState === 'briefing') {
      return (
        <main className="crt-effect glitch-in min-h-screen bg-black bg-cover bg-center text-green-400 flex flex-col items-center justify-center p-8" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('/bg.jpg')" }}>
          <div className="case-briefing border-2 border-cyan-500 p-5 sm:p-8 max-w-4xl w-full shadow-[0_0_30px_rgba(34,211,238,0.3)] bg-black/80">
            <div className="flex justify-between items-center mb-4 border-b border-cyan-500/50 pb-2">
              <h1 className="text-4xl font-bold text-cyan-400 tracking-widest glitch-text">VICE//TRACE</h1>
              <span className="text-xs text-pink-500 animate-pulse">● REC</span>
            </div>
            <p className="text-sm mb-6 text-cyan-200/70">VCPD INTERNAL DATABASE // DO NOT DISTRIBUTE</p>
            
            <div className="case-briefing-grid gap-6 text-md text-green-300">
              <div className="space-y-4">
                <p><span className="font-bold text-white">CASE:</span> #{currentCase.id} - {currentCase.title}</p>
                <p><span className="font-bold text-white">LOCATION:</span> {currentCase.location}</p>
                <p><span className="font-bold text-white">DATE:</span> {currentDate}</p>
                <p><span className="font-bold text-pink-500">STATUS:</span> EVIDENCE TAMPERED</p>
                <hr className="border-cyan-500/30 my-4" />
                <p className="leading-relaxed">Detective, we have a problem. Internal Affairs believes this image was altered to protect someone involved in the incident.</p>
                <p className="leading-relaxed">Your job is to open the evidence file. Use the tools to enhance, zoom, and inspect the image. Find what was changed. Find the lie.</p>
                <div className="analyst-transmission border-l-2 border-pink-500 bg-pink-950/20 px-3 py-3 text-sm text-pink-100">
                  <p className="mb-1 text-[10px] tracking-widest text-pink-400">SECURE MESSAGE // ANALYST M. VOSS</p>
                  <p>“{ANALYST_TRANSMISSIONS[selectedCaseKey].briefing}”</p>
                </div>
              </div>
              <div className="relative min-h-48 overflow-hidden border border-pink-500/40 bg-zinc-950">
                <Image src={currentCase.image} alt={`Case ${currentCase.id} evidence preview`} fill sizes="(max-width: 640px) 100vw, 360px" className="object-cover opacity-75" priority />
                <span className="absolute bottom-2 left-2 border border-pink-500/50 bg-black/80 px-2 py-1 text-[10px] text-pink-300">EXHIBIT {currentCase.id}-A // TAMPER SUSPECTED</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[10px] sm:text-xs">
              <span className="border border-cyan-500/30 px-2 py-2 text-cyan-200">1. INSPECT</span>
              <span className="border border-cyan-500/30 px-2 py-2 text-cyan-200">2. VERIFY</span>
              <span className="border border-cyan-500/30 px-2 py-2 text-cyan-200">3. ACCUSE</span>
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
            <button onClick={() => setGameState('files')} className="btn-press mt-3 w-full text-xs text-zinc-400 hover:text-white">[ &lt; BACK TO CASE FILES ]</button>
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
            <p className="text-xs text-cyan-200/70 mb-2">CASE {currentCase.id} {'//'} EXHIBIT EXPORTED</p>
            <h1 className="text-3xl font-bold mb-5 text-cyan-400 tracking-widest">VERIFY RECOVERED DATA</h1>
            <div className="border border-cyan-500/30 bg-cyan-950/20 p-4 text-sm text-cyan-100 space-y-2">
              <p><span className="text-pink-500">OBJECTIVE:</span> {currentCase.recoveryPrompt}</p>
              <p>Use your annotated export and the evidence viewer. {currentCase.evidenceHint}</p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border border-cyan-500/20 px-3 py-2 text-xs">
              <span>CASE SCORE: <strong className="text-pink-400">{caseScore}/100</strong></span>
              <span>RECOVERY ATTEMPTS: <strong className="text-cyan-300">{analysisAttempts}</strong></span>
            </div>
            <form onSubmit={submitAnalysis} className="mt-6">
              <label htmlFor="recovered-time" className="block text-xs text-cyan-200/70 mb-2">RECOVERED EVIDENCE DETAIL</label>
              <input
                id="recovered-time"
                type="text"
                inputMode={selectedCaseKey === 'metro' ? 'numeric' : 'text'}
                autoComplete="off"
                value={analysisAnswer}
                onChange={(event) => setAnalysisAnswer(event.target.value)}
                placeholder={currentCase.recoveryPlaceholder}
                className="w-full bg-zinc-900 border border-cyan-500/50 text-white px-3 py-3 text-lg focus:outline-none focus:border-pink-500"
                aria-describedby={analysisError ? 'analysis-error' : undefined}
              />
              {analysisError && <p id="analysis-error" role="alert" className="mt-3 text-sm text-red-400">{analysisError}</p>}
              <button type="submit" className="btn-press mt-5 w-full bg-cyan-500 text-black font-bold py-3 hover:bg-pink-500 hover:text-white transition-colors">[ VERIFY FINDING ]</button>
            </form>
            <div className="mt-5 border-t border-cyan-500/20 pt-4">
              {hintLevel > 0 && <p className="mb-3 text-sm text-yellow-200">ANALYST NOTE: {currentCase.hints[hintLevel - 1]}</p>}
              <button onClick={revealHint} disabled={hintLevel >= currentCase.hints.length} className="btn-press w-full border border-yellow-500/60 px-3 py-2 text-xs text-yellow-300 hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-40">
                {hintLevel >= currentCase.hints.length ? '[ ALL ANALYST NOTES DECRYPTED ]' : `[ REQUEST ANALYST NOTE — -15 SCORE ]`}
              </button>
            </div>
            <button onClick={() => { playSound('click'); setGameState('editor'); }} className="mt-5 w-full text-xs text-zinc-400 hover:text-white transition-colors">[ &lt; RETURN TO EVIDENCE ]</button>
          </div>
        </main>
      );
    }

    if (gameState === 'board') {
      return (
        <main className="crt-effect glitch-in min-h-[100dvh] bg-black bg-cover bg-center text-white flex flex-col items-center justify-center p-5 sm:p-8" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.86), rgba(0,0,0,0.96)), url('/bg.jpg')" }}>
          <section className="w-full max-w-5xl border border-cyan-500/60 bg-black/90 p-5 sm:p-8 shadow-[0_0_35px_rgba(34,211,238,0.18)]">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cyan-500/30 pb-4">
              <div>
                <p className="text-[10px] tracking-[0.25em] text-pink-400">VCPD FORENSICS // DEDUCTION BOARD</p>
                <h1 className="mt-2 text-2xl font-bold tracking-wider text-cyan-300 sm:text-3xl">CONNECT THE EVIDENCE</h1>
              </div>
              <span className="border border-cyan-500/30 px-3 py-2 text-xs text-cyan-100">CASE {currentCase.id} · SCORE {caseScore}</span>
            </div>
            <p className="mt-4 max-w-3xl text-sm text-zinc-300">Before you accuse anyone, connect the observed detail to the conclusion it supports. Select one card in each column.</p>

            <form onSubmit={submitEvidenceBoard} className="mt-6">
              <div className="evidence-board-grid relative grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
                <fieldset className="space-y-3">
                  <legend className="mb-3 text-xs font-bold tracking-widest text-pink-300">OBSERVED IN THE EXHIBIT</legend>
                  {currentCase.boardClues.map((clue, index) => (
                    <button type="button" key={clue} aria-pressed={boardClueChoice === index} onClick={() => { setBoardClueChoice(index); setBoardError(''); }} className={`evidence-card w-full border p-4 text-left text-sm transition-all ${boardClueChoice === index ? 'border-pink-400 bg-pink-950/50 text-white shadow-[0_0_18px_rgba(244,114,182,0.2)]' : 'border-zinc-700 bg-zinc-950/80 text-zinc-300 hover:border-cyan-500/60'}`}>
                      <span className="mb-2 block text-[10px] text-cyan-400">FRAGMENT 0{index + 1}</span>{clue}
                    </button>
                  ))}
                </fieldset>

                <div className="evidence-link-visual hidden items-center justify-center px-2 md:flex" aria-hidden="true">
                  <span className={`link-node ${boardClueChoice !== null && boardConclusionChoice !== null ? 'link-node-active' : ''}`}>↔</span>
                </div>

                <fieldset className="space-y-3">
                  <legend className="mb-3 text-xs font-bold tracking-widest text-cyan-300">WHAT IT PROVES</legend>
                  {currentCase.boardConclusions.map((conclusion, index) => (
                    <button type="button" key={conclusion} aria-pressed={boardConclusionChoice === index} onClick={() => { setBoardConclusionChoice(index); setBoardError(''); }} className={`evidence-card w-full border p-4 text-left text-sm transition-all ${boardConclusionChoice === index ? 'border-cyan-300 bg-cyan-950/50 text-white shadow-[0_0_18px_rgba(34,211,238,0.2)]' : 'border-zinc-700 bg-zinc-950/80 text-zinc-300 hover:border-cyan-500/60'}`}>
                      <span className="mb-2 block text-[10px] text-pink-400">DEDUCTION 0{index + 1}</span>{conclusion}
                    </button>
                  ))}
                </fieldset>
              </div>

              {boardError && <p role="alert" className="mt-4 border-l-2 border-red-400 bg-red-950/30 px-3 py-2 text-sm text-red-200">{boardError}</p>}
              {boardSolved && <p role="status" className="mt-4 border-l-2 border-green-400 bg-green-950/30 px-3 py-2 text-sm text-green-200">Evidence chain confirmed. +5 case points awarded.</p>}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button type="button" onClick={() => setGameState('analysis')} className="btn-press border border-zinc-600 px-4 py-3 text-xs text-zinc-300 hover:border-cyan-400 hover:text-white">[ REVIEW RECOVERED DETAIL ]</button>
                {boardSolved ? (
                  <button type="button" onClick={() => { playSound('click'); setGameState('accusing'); }} className="btn-press bg-cyan-400 px-5 py-3 text-sm font-bold text-black hover:bg-pink-400">[ CONTINUE TO INTERNAL AFFAIRS ]</button>
                ) : (
                  <button type="submit" className="btn-press bg-cyan-500 px-5 py-3 text-sm font-bold text-black hover:bg-pink-400">[ VERIFY EVIDENCE LINK ]</button>
                )}
              </div>
            </form>
            <div className="mt-6 flex items-center gap-3 border-t border-pink-500/20 pt-4 text-xs text-pink-100/80">
              <span className="text-pink-400">● ANALYST M. VOSS</span><span>“A theory is only as strong as the detail that supports it.”</span>
            </div>
          </section>
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
              <p className="leading-relaxed text-lg">{currentCase.accusationPrompt}</p>
              <p className="text-pink-500 font-bold">Choose carefully. Accusing the wrong person ends your career.</p>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              {currentCase.choices.map((choice, index) => (
                <button key={choice} onClick={(event) => makeAccusation(index === currentCase.correctChoice, event)} className="btn-press w-full bg-zinc-800 text-white font-bold py-4 text-left text-base sm:text-lg tracking-wide border border-zinc-600 hover:bg-zinc-700 hover:border-green-500 transition-all">
                  {String.fromCharCode(65 + index)}) {choice}
                </button>
              ))}
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
            <p className="text-md text-white mb-6">You accused the wrong person. The evidence is still available—return to Case #{currentCase.id} and inspect it again.</p>
            <button onClick={() => { playSound('click'); setGameState('editor'); }} className="btn-press mt-4 w-full bg-red-500 text-black font-bold py-3 hover:bg-red-400 transition-colors">[ TRY AGAIN ]</button>
          </div>
        </main>
      );
    }

  if (gameState === 'solved') {
    return (
      <main className="crt-effect glitch-in min-h-screen bg-black bg-cover bg-center text-red-400 flex flex-col items-center justify-center p-8" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url('/bg.jpg')" }}>
        <div className="border-2 border-green-500 p-8 max-w-2xl shadow-[0_0_30px_rgba(34,197,94,0.4)] bg-black/80 text-center">
          <h1 className="text-4xl font-bold mb-2 text-green-500 tracking-widest glitch-text">CASE CLOSED: #{currentCase.id}</h1>
          
          <p className="text-xl text-pink-500 font-bold tracking-widest mb-6 animate-pulse">
            RANK: {getRank(caseScore)}
          </p>

          <div className="mb-6 grid grid-cols-3 border border-green-500/30 text-center text-xs text-green-100">
            <div className="border-r border-green-500/30 px-2 py-3"><span className="block text-green-400">SCORE</span>{caseScore}/100</div>
            <div className="border-r border-green-500/30 px-2 py-3"><span className="block text-green-400">TIME</span>{Math.floor(caseDuration / 60)}:{String(caseDuration % 60).padStart(2, '0')}</div>
            <div className="px-2 py-3"><span className="block text-green-400">HINTS</span>{hintLevel}</div>
          </div>

          <p className="text-sm mb-6 text-green-200/70">INTERNAL AFFAIRS REPORT</p>
          <div className="space-y-4 text-md text-white text-left">
            <p><span className="font-bold text-green-400">FINDINGS:</span> {currentCase.findings}</p>
            <p className="leading-relaxed">By using the Enhance tool and ZOOM view, you isolated the visual inconsistency in the evidence.</p>
            <p className="leading-relaxed">{currentCase.solution}</p>
            <div className="analyst-transmission border-l-2 border-cyan-400 bg-cyan-950/30 px-3 py-3 text-sm text-cyan-100">
              <p className="mb-1 text-[10px] tracking-widest text-cyan-300">DEBRIEF // ANALYST M. VOSS</p>
              <p>“{ANALYST_TRANSMISSIONS[selectedCaseKey].debrief}”</p>
            </div>
          </div>
          <button onClick={handleShareReport} className="btn-press mt-8 w-full border border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold py-3 hover:bg-cyan-400 hover:text-black transition-colors">[ SHARE CASE REPORT ]</button>
          {shareStatus && <p role="status" className="mt-3 text-xs text-cyan-200">{shareStatus}</p>}
          <button onClick={() => { playSound('click'); setGameState('files'); }} className="btn-press mt-3 w-full bg-green-500 text-black font-bold py-3 hover:bg-pink-500 transition-colors">[ RETURN TO CASE FILES ]</button>
        </div>
      </main>
    );
  }

    // EDITOR STATE (Default return)
    return (
      <main className="crt-effect glitch-in min-h-[100dvh] bg-zinc-950 bg-cover bg-center text-white flex flex-col p-2 sm:p-6" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url('/bg.jpg')" }}>
        
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
            <button onClick={() => { playSound('click'); setGameState('files'); }} className="btn-press text-[10px] sm:text-xs text-red-500 hover:text-white border border-red-500/50 hover:border-red-500 px-2 py-1 transition-colors" aria-label="Close File">[ CLOSE ]</button>
          </div>
        </header>

        <section className="mb-2 sm:mb-4 border border-cyan-500/30 bg-black/70 px-3 py-2 text-xs text-cyan-100/80 z-10" aria-label="Case objective">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p><span className="text-pink-500 font-bold">CASE {currentCase.id} OBJECTIVE:</span> {currentCase.objective} Then use <span className="text-cyan-300">SUBMIT FINDINGS</span> to verify your recovered detail.</p>
            <span className="shrink-0 text-pink-300">SCORE {caseScore}/100</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] sm:hidden">
            <span className="border border-cyan-500/30 px-2 py-1">Pinch/zoom photo to inspect</span>
            <span className="border border-cyan-500/30 px-2 py-1">Toolbar scrolls sideways</span>
          </div>
          {uploadError && <p role="alert" className="mt-2 text-red-400">{uploadError}</p>}
        </section>

        {/* Hardware Bezel Wrapper for the Editor */}
        <div className="evidence-workspace flex-1 w-full p-1 sm:p-4 bg-black border-4 sm:border-[6px] border-zinc-800 rounded-lg sm:rounded-xl shadow-[inset_0_0_30px_rgba(0,0,0,0.8),0_0_25px_rgba(34,211,238,0.15)]">
          <div className="spy-cursor w-full h-full bg-zinc-900 border border-cyan-500/20">
            <ImageEditor 
              ref={editorRef}
              image={evidenceImage}  
              minHeight="100%" 
              options={{
                projectId: 289525, // <--- PROJECT ID ADDED HERE
                theme: 'dark',
                defaultPrompt: `You are a VCPD Forensic AI Assistant. Help the detective enhance, inspect, and identify the anomaly in Case ${currentCase.id}: ${currentCase.objective}`,
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
              onCancel={() => { playSound('click'); setGameState('files'); }}
              onLoadError={handleLoadError} 
              onError={handleError}         
            />
          </div>
        </div>
        
        {/* Hardware Status Bar Footer */}
        <footer className="mt-4 flex flex-col sm:flex-row justify-center sm:justify-between text-center text-[10px] sm:text-xs text-cyan-200/50 px-2 z-10 gap-1 font-mono">
          <span>SYS_V1.0.4 {'//'} SECURE</span>
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
