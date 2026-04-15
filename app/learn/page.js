'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

const journeyData = [
  {
    id: 1,
    landmark: 'City Museum',
    landmarkSpanish: 'Museo de la Ciudad',
    category: 'culture',
    vocabulary: [
      { word: 'museo', translation: 'museum', example: 'El museo esta abierto los domingos.', phonetic: 'moo-SEH-oh' },
      { word: 'arte', translation: 'art', example: 'Me gusta el arte moderno.', phonetic: 'AR-teh' },
      { word: 'historia', translation: 'history', example: 'La historia es fascinante.', phonetic: 'ees-TOR-ee-ah' },
    ]
  },
  {
    id: 2,
    landmark: 'Central Park',
    landmarkSpanish: 'Parque Central',
    category: 'nature',
    vocabulary: [
      { word: 'parque', translation: 'park', example: 'Vamos al parque esta tarde.', phonetic: 'PAR-keh' },
      { word: 'arbol', translation: 'tree', example: 'El arbol es muy alto.', phonetic: 'AR-bol' },
      { word: 'naturaleza', translation: 'nature', example: 'Amo la naturaleza.', phonetic: 'nah-too-rah-LEH-sah' },
    ]
  },
  {
    id: 3,
    landmark: 'Train Station',
    landmarkSpanish: 'Estacion de Tren',
    category: 'transport',
    vocabulary: [
      { word: 'tren', translation: 'train', example: 'El tren llega a las tres.', phonetic: 'trehn' },
      { word: 'viaje', translation: 'trip/journey', example: 'Tengo un viaje manana.', phonetic: 'bee-AH-heh' },
      { word: 'billete', translation: 'ticket', example: 'Necesito comprar un billete.', phonetic: 'bee-YEH-teh' },
    ]
  },
  {
    id: 4,
    landmark: 'Shopping District',
    landmarkSpanish: 'Zona Comercial',
    category: 'shopping',
    vocabulary: [
      { word: 'tienda', translation: 'store', example: 'La tienda cierra a las nueve.', phonetic: 'tee-EHN-dah' },
      { word: 'comprar', translation: 'to buy', example: 'Quiero comprar un regalo.', phonetic: 'kohm-PRAR' },
      { word: 'precio', translation: 'price', example: 'Cual es el precio?', phonetic: 'PREH-see-oh' },
    ]
  },
  {
    id: 5,
    landmark: 'Restaurant Row',
    landmarkSpanish: 'Calle de Restaurantes',
    category: 'food',
    vocabulary: [
      { word: 'restaurante', translation: 'restaurant', example: 'El restaurante es excelente.', phonetic: 'rehs-tow-RAHN-teh' },
      { word: 'comida', translation: 'food', example: 'La comida esta deliciosa.', phonetic: 'koh-MEE-dah' },
      { word: 'mesa', translation: 'table', example: 'Una mesa para dos, por favor.', phonetic: 'MEH-sah' },
    ]
  }
]

const categoryColors = {
  culture: { accent: '#d97706', glow: 'rgba(217,119,6,0.4)', bg: 'rgba(217,119,6,0.15)' },
  nature: { accent: '#059669', glow: 'rgba(5,150,105,0.4)', bg: 'rgba(5,150,105,0.15)' },
  transport: { accent: '#2563eb', glow: 'rgba(37,99,235,0.4)', bg: 'rgba(37,99,235,0.15)' },
  shopping: { accent: '#db2777', glow: 'rgba(219,39,119,0.4)', bg: 'rgba(219,39,119,0.15)' },
  food: { accent: '#dc2626', glow: 'rgba(220,38,38,0.4)', bg: 'rgba(220,38,38,0.15)' }
}

export default function LearnPage() {
  const [currentLandmarkIndex, setCurrentLandmarkIndex] = useState(0)
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0)
  const [learned, setLearned] = useState([])
  const [skipped, setSkipped] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [continuousListen, setContinuousListen] = useState(false)
  const [toast, setToast] = useState(null)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(false)
  const [journeyProgress, setJourneyProgress] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [videoSource, setVideoSource] = useState('youtube')
  const [audioState, setAudioState] = useState('idle')
  const [autoMode, setAutoMode] = useState(true)
  const [sessionLog, setSessionLog] = useState([])
  const [logInterval, setLogInterval] = useState(null)
  const [lastCommand, setLastCommand] = useState('')
  const [wordAnim, setWordAnim] = useState('enter')
  const [landmarkAnim, setLandmarkAnim] = useState(false)
  const [feedbackAnim, setFeedbackAnim] = useState(null)
  const [sessionStart] = useState(Date.now())
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [waveformBars, setWaveformBars] = useState(Array(24).fill(3))
  const videoRef = useRef(null)
  const recognitionRef = useRef(null)
  const autoTimerRef = useRef(null)

  const currentLandmark = journeyData[currentLandmarkIndex]
  const currentVocab = currentLandmark.vocabulary[currentVocabIndex]
  const colors = categoryColors[currentLandmark.category]

  // Session timer
  useEffect(() => {
    const t = setInterval(() => setSessionSeconds(Math.floor((Date.now() - sessionStart) / 1000)), 1000)
    return () => clearInterval(t)
  }, [sessionStart])

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  // Waveform animation
  useEffect(() => {
    if (audioState === 'speaking-word' || audioState === 'speaking-translation') {
      const t = setInterval(() => {
        setWaveformBars(Array(24).fill(0).map(() => 3 + Math.random() * 22))
      }, 80)
      return () => clearInterval(t)
    } else if (isListening) {
      const t = setInterval(() => {
        setWaveformBars(Array(24).fill(0).map(() => 3 + Math.random() * 12))
      }, 120)
      return () => clearInterval(t)
    } else {
      setWaveformBars(Array(24).fill(3))
    }
  }, [audioState, isListening])

  const speakWord = useCallback((text, lang = 'es-ES', rate = 0.75) => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return }
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = rate
      utterance.onend = resolve
      utterance.onerror = resolve
      window.speechSynthesis.speak(utterance)
    })
  }, [])

  const speakCurrentWord = useCallback(async () => {
    const vocab = journeyData[currentLandmarkIndex]?.vocabulary[currentVocabIndex]
    if (!vocab) return

    setAudioState('speaking-word')
    await speakWord(vocab.word, 'es-ES', 0.7)
    
    await new Promise(r => setTimeout(r, 500))
    
    setAudioState('speaking-translation')
    await speakWord(`This means: ${vocab.translation}`, 'en-US', 0.9)
    
    await new Promise(r => setTimeout(r, 300))
    setAudioState('speaking-word')
    await speakWord(vocab.word, 'es-ES', 0.8)
    
    setAudioState('waiting')
  }, [currentLandmarkIndex, currentVocabIndex, speakWord])

  // Journey simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setJourneyProgress(prev => {
        const next = prev + 0.3
        const thresholds = [20, 40, 60, 80]
        const newIdx = thresholds.filter(t => next >= t).length
        if (newIdx !== currentLandmarkIndex && newIdx < journeyData.length) {
          setLandmarkAnim(true)
          setTimeout(() => {
            setCurrentLandmarkIndex(newIdx)
            setCurrentVocabIndex(0)
            setWordAnim('enter')
            speakWord(`Approaching ${journeyData[newIdx].landmark}. Let's learn some ${journeyData[newIdx].category} vocabulary.`, 'en-US', 0.9)
          }, 600)
          setTimeout(() => setLandmarkAnim(false), 2000)
        }
        return next >= 100 ? 100 : next
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [currentLandmarkIndex, speakWord])

  // Auto-play on word change
  useEffect(() => {
    if (autoMode) {
      setWordAnim('enter')
      const timer = setTimeout(() => speakCurrentWord(), 600)
      return () => clearTimeout(timer)
    }
  }, [currentVocabIndex, currentLandmarkIndex, autoMode, speakCurrentWord])

  // Auto-advance
  useEffect(() => {
    if (autoMode && audioState === 'waiting') {
      autoTimerRef.current = setTimeout(() => moveToNext(), 5000)
      return () => clearTimeout(autoTimerRef.current)
    }
  }, [audioState, autoMode])

  // Camera
  useEffect(() => {
    async function initCamera() {
      if (videoSource !== 'webcam') {
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop())
          setCameraStream(null)
        }
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        setCameraStream(stream)
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraError(false)
      } catch {
        setCameraError(true)
      }
    }
    initCamera()
    return () => { if (cameraStream) cameraStream.getTracks().forEach(t => t.stop()) }
  }, [videoSource])

  // Speech Recognition
  useEffect(() => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SR) return
    
    recognitionRef.current = new SR()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onresult = (e) => {
      const cmd = e.results[0][0].transcript.toLowerCase()
      setLastCommand(cmd)
      handleVoiceCommand(cmd)
      logEvent('voice_command', { command: cmd })
    }
    recognitionRef.current.onerror = () => {
      setIsListening(false)
      if (continuousListen) setTimeout(() => startListening(), 500)
    }
    recognitionRef.current.onend = () => {
      setIsListening(false)
      if (continuousListen) setTimeout(() => startListening(), 300)
    }
  }, [continuousListen])

  const logEvent = useCallback((type, data = {}) => {
    setSessionLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      sessionTime: Math.floor((Date.now() - sessionStart) / 1000),
      type,
      landmark: currentLandmark?.landmark,
      word: currentVocab?.word,
      progress: Math.round(journeyProgress),
      learnedCount: learned.length,
      skippedCount: skipped.length,
      audioState,
      ...data
    }])
  }, [sessionStart, currentLandmark, currentVocab, journeyProgress, learned, skipped, audioState])

  const handleVoiceCommand = (command) => {
    if (command.includes('next') || command.includes('skip') || command.includes('pass')) {
      handleSkip()
    } else if (command.includes('learn') || command.includes('got it') || command.includes('know') || command.includes('yes')) {
      handleLearned()
    } else if (command.includes('repeat') || command.includes('again') || command.includes('say')) {
      speakCurrentWord()
      showToast('Repeating...', 'info')
    } else if (command.includes('example') || command.includes('sentence')) {
      const v = journeyData[currentLandmarkIndex]?.vocabulary[currentVocabIndex]
      if (v) speakWord(v.example, 'es-ES', 0.7).then(() => speakWord(v.example, 'en-US', 0.9))
      showToast('Example', 'info')
    } else if (command.includes('pause') || command.includes('stop')) {
      setAutoMode(false)
      window.speechSynthesis.cancel()
      showToast('Paused', 'info')
    } else if (command.includes('resume') || command.includes('continue') || command.includes('go')) {
      setAutoMode(true)
      showToast('Resumed', 'info')
    } else {
      showToast(`"${command}"`, 'info')
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try { setIsListening(true); recognitionRef.current.start() } catch { setIsListening(false) }
    }
  }

  const toggleContinuousListen = () => {
    if (continuousListen) {
      setContinuousListen(false)
      setIsListening(false)
      try { recognitionRef.current?.stop() } catch {}
    } else {
      setContinuousListen(true)
      startListening()
    }
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2200)
  }

  const handleLearned = () => {
    const key = `${currentLandmarkIndex}-${currentVocabIndex}`
    if (!learned.includes(key)) setLearned(prev => [...prev, key])
    setFeedbackAnim('learned')
    showToast('Learned!', 'success')
    logEvent('word_learned', { word: currentVocab.word })
    setTimeout(() => { setFeedbackAnim(null); moveToNext() }, 700)
  }

  const handleSkip = () => {
    const key = `${currentLandmarkIndex}-${currentVocabIndex}`
    if (!skipped.includes(key) && !learned.includes(key)) setSkipped(prev => [...prev, key])
    setFeedbackAnim('skipped')
    showToast('Skipped', 'skip')
    logEvent('word_skipped', { word: currentVocab.word })
    setTimeout(() => { setFeedbackAnim(null); moveToNext() }, 500)
  }

  const moveToNext = () => {
    window.speechSynthesis.cancel()
    setAudioState('idle')
    setWordAnim('exit')
    setTimeout(() => {
      if (currentVocabIndex < currentLandmark.vocabulary.length - 1) {
        setCurrentVocabIndex(prev => prev + 1)
      } else if (currentLandmarkIndex < journeyData.length - 1) {
        setCurrentVocabIndex(0)
      }
      setWordAnim('enter')
    }, 300)
  }

  // Auto session logging
  const toggleAutoLog = () => {
    if (logInterval) {
      clearInterval(logInterval)
      setLogInterval(null)
      showToast('Logging stopped', 'info')
    } else {
      const id = setInterval(() => logEvent('auto_snapshot'), 30000)
      setLogInterval(id)
      logEvent('session_started')
      showToast('Session logging active', 'success')
    }
  }

  useEffect(() => { return () => { if (logInterval) clearInterval(logInterval) } }, [logInterval])

  const downloadLog = () => {
    const headers = 'timestamp,sessionTime,type,landmark,word,progress,learnedCount,skippedCount,audioState,command\n'
    const rows = sessionLog.map(e => 
      `${e.timestamp},${e.sessionTime},${e.type},${e.landmark || ''},${e.word || ''},${e.progress},${e.learnedCount},${e.skippedCount},${e.audioState},"${e.command || ''}"`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `av-learning-session-${Date.now()}.csv`
    a.click()
  }

  const totalWords = journeyData.reduce((acc, l) => acc + l.vocabulary.length, 0)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0f', position: 'relative', overflow: 'hidden', userSelect: 'none', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* === FULL-SCREEN VIDEO === */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {videoSource === 'youtube' && (
          <iframe
            src="https://www.youtube.com/embed/u-tALux5Ve0?autoplay=1&mute=1&loop=1&playlist=u-tALux5Ve0&controls=0&showinfo=0&modestbranding=1"
            style={{ position: 'absolute', top: '50%', left: '50%', width: '200%', height: '200%', transform: 'translate(-50%, -50%)', border: 'none', pointerEvents: 'none' }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}
        {videoSource === 'webcam' && !cameraError && (
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {videoSource === 'webcam' && cameraError && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff', gap: '1rem' }}>
            <div style={{ fontSize: '3rem', opacity: 0.3 }}>📷</div>
            <p style={{ fontSize: '1.1rem' }}>Camera access needed</p>
            <button onClick={() => setVideoSource('youtube')} style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
              Use Simulated Drive
            </button>
          </div>
        )}

        {/* Cinematic gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.7) 100%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)`, pointerEvents: 'none' }} />
      </div>

      {/* === LANDMARK APPROACH FLASH === */}
      {landmarkAnim && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none',
          background: `radial-gradient(circle at center, ${colors.glow} 0%, transparent 70%)`,
          animation: 'landmarkFlash 2s ease-out forwards'
        }} />
      )}

      {/* === FEEDBACK ANIMATIONS === */}
      {feedbackAnim && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none',
          background: feedbackAnim === 'learned'
            ? 'radial-gradient(circle at center, rgba(34,197,94,0.25) 0%, transparent 60%)'
            : 'radial-gradient(circle at center, rgba(251,191,36,0.2) 0%, transparent 60%)',
          animation: 'feedbackPulse 0.7s ease-out forwards'
        }} />
      )}

      {/* === TOP HUD === */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
        {/* Left: branding + timer */}
        <div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            AV Learning
          </div>
          <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 500, marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>Barcelona Route</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
              {formatTime(sessionSeconds)}
            </span>
          </div>
        </div>

        {/* Center: landmark pill */}
        <div style={{
          background: colors.bg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.accent}44`,
          color: '#fff',
          padding: '0.45rem 1.25rem',
          borderRadius: '24px',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          boxShadow: `0 4px 25px ${colors.glow}`,
          transition: 'all 0.5s ease'
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.accent }} />
          {currentLandmark.landmark}
          <span style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: 400 }}>
            {currentLandmarkIndex + 1}/{journeyData.length}
          </span>
        </div>

        {/* Right: settings */}
        <button onClick={() => setSettingsOpen(true)} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>

      {/* === CENTER WORD DISPLAY === */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', zIndex: 10, pointerEvents: 'none',
        animation: wordAnim === 'enter' ? 'wordEnter 0.5s ease-out forwards' : wordAnim === 'exit' ? 'wordExit 0.3s ease-in forwards' : 'none',
        width: '90%', maxWidth: '700px'
      }}>
        {/* Word */}
        <div style={{
          color: '#fff',
          fontSize: 'clamp(3.5rem, 10vw, 6rem)',
          fontWeight: 700,
          textShadow: `0 0 80px ${colors.glow}, 0 4px 30px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.5)`,
          letterSpacing: '0.03em', lineHeight: 1,
          marginBottom: '0.4rem'
        }}>
          {currentVocab.word}
        </div>

        {/* Translation */}
        <div style={{
          color: 'rgba(255,255,255,0.75)',
          fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)',
          fontWeight: 300, letterSpacing: '0.05em',
          textShadow: '0 2px 15px rgba(0,0,0,0.5)'
        }}>
          {currentVocab.translation}
        </div>

        {/* Waveform visualizer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginTop: '1.5rem', height: '28px' }}>
          {waveformBars.map((h, i) => (
            <div key={i} style={{
              width: '3px',
              height: `${h}px`,
              borderRadius: '2px',
              background: audioState.startsWith('speaking') ? colors.accent 
                        : isListening ? '#ef4444'
                        : 'rgba(255,255,255,0.15)',
              transition: 'height 0.08s ease, background 0.3s',
              opacity: audioState === 'idle' && !isListening ? 0.3 : 0.9
            }} />
          ))}
        </div>

        {/* State label */}
        <div style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', fontWeight: 400, letterSpacing: '0.03em' }}>
          {audioState === 'speaking-word' ? 'Playing pronunciation...'
           : audioState === 'speaking-translation' ? 'Translation...'
           : audioState === 'waiting' ? 'Say "next", "I know this", or "repeat"'
           : isListening ? 'Listening for command...'
           : autoMode ? 'Starting...' : 'Tap mic or say a command'}
        </div>
      </div>

      {/* === BOTTOM HUD === */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 1.5rem 1.25rem', zIndex: 10 }}>
        
        {/* Controls row */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          
          {/* Skip */}
          <button onClick={handleSkip} style={{
            padding: '0.65rem 1.4rem', borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(15px)', color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
            transition: 'all 0.2s'
          }}>
            Skip
          </button>

          {/* MIC - main action */}
          <button onClick={toggleContinuousListen} style={{
            width: '72px', height: '72px', borderRadius: '50%',
            border: `3px solid ${continuousListen ? '#ef4444' : 'rgba(255,255,255,0.25)'}`,
            background: continuousListen ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(15px)', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: continuousListen ? '0 0 40px rgba(239,68,68,0.35), inset 0 0 20px rgba(239,68,68,0.1)' : '0 0 30px rgba(0,0,0,0.2)',
            transition: 'all 0.3s',
            animation: isListening ? 'micPulse 2s infinite' : 'none'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>

          {/* I know this */}
          <button onClick={handleLearned} style={{
            padding: '0.65rem 1.4rem', borderRadius: '24px', border: 'none',
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)`,
            color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            boxShadow: `0 4px 25px ${colors.glow}`,
            transition: 'all 0.2s'
          }}>
            I know this
          </button>
        </div>

        {/* Mode + last command */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <button onClick={() => setAutoMode(!autoMode)} style={{
            padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600,
            border: 'none', cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase',
            background: autoMode ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
            color: autoMode ? '#4ade80' : 'rgba(255,255,255,0.4)',
            transition: 'all 0.2s'
          }}>
            {autoMode ? 'AUTO' : 'MANUAL'}
          </button>
          {lastCommand && (
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>
              "{lastCommand}"
            </span>
          )}
          {continuousListen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'blink 1.5s infinite' }} />
              <span style={{ color: 'rgba(239,68,68,0.7)', fontSize: '0.7rem', fontWeight: 500 }}>MIC</span>
            </div>
          )}
        </div>

        {/* Journey progress */}
        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
          {/* Landmark dots on progress */}
          <div style={{ position: 'absolute', top: '-8px', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 1%' }}>
            {journeyData.map((l, i) => {
              const pos = i === 0 ? 0 : [20, 40, 60, 80, 100][i-1] || 100
              return (
                <div key={i} style={{
                  position: 'absolute', left: `${i * 25}%`,
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: i <= currentLandmarkIndex ? colors.accent : 'rgba(255,255,255,0.15)',
                  border: i === currentLandmarkIndex ? `2px solid #fff` : '2px solid transparent',
                  transition: 'all 0.5s',
                  transform: 'translateX(-50%)'
                }} />
              )
            })}
          </div>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{
              height: '100%', width: `${journeyProgress}%`,
              background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}88)`,
              transition: 'width 0.8s ease', borderRadius: '2px',
              boxShadow: `0 0 10px ${colors.glow}`
            }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          <span><span style={{ color: '#4ade80', fontWeight: 600 }}>{learned.length}</span> learned</span>
          <span>{Math.round(15 - journeyProgress * 0.15)} min left</span>
          <span>{currentVocabIndex + 1}/{currentLandmark.vocabulary.length} words</span>
          <span><span style={{ color: '#fbbf24', fontWeight: 600 }}>{skipped.length}</span> skipped</span>
        </div>
      </div>

      {/* === TOAST === */}
      {toast && (
        <div style={{
          position: 'absolute', top: '68%', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? 'rgba(34,197,94,0.2)' : toast.type === 'skip' ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : toast.type === 'skip' ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.15)'}`,
          color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '20px',
          fontSize: '0.85rem', fontWeight: 500, zIndex: 50,
          animation: 'toastIn 0.25s ease-out'
        }}>
          {toast.type === 'success' && <span style={{ marginRight: '0.4rem' }}>✓</span>}
          {toast.message}
        </div>
      )}

      {/* === SETTINGS MODAL === */}
      {settingsOpen && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSettingsOpen(false) }}>
          <div style={{
            background: 'linear-gradient(180deg, #16162a 0%, #0f0f1e 100%)',
            borderRadius: '20px', padding: '1.75rem', maxWidth: '420px', width: '92%', color: '#fff',
            maxHeight: '85vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Settings</h2>
              <button onClick={() => setSettingsOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✕</button>
            </div>

            {/* Video Source */}
            <SettingSection label="Video Source">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[['youtube', 'Simulated Drive'], ['webcam', 'Dashcam (Webcam)']].map(([val, lbl]) => (
                  <button key={val} onClick={() => setVideoSource(val)} style={{
                    flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none',
                    background: videoSource === val ? colors.accent : 'rgba(255,255,255,0.06)',
                    color: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem',
                    transition: 'all 0.2s'
                  }}>{lbl}</button>
                ))}
              </div>
            </SettingSection>

            {/* Learning Mode */}
            <SettingSection label="Learning Mode">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[[true, 'Auto (Hands-free)'], [false, 'Manual']].map(([val, lbl]) => (
                  <button key={String(val)} onClick={() => setAutoMode(val)} style={{
                    flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none',
                    background: autoMode === val ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                    color: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem',
                    transition: 'all 0.2s'
                  }}>{lbl}</button>
                ))}
              </div>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>
                Auto: speaks and advances automatically. Voice commands always work.
              </p>
            </SettingSection>

            {/* Research Tools */}
            <SettingSection label="Study Session Tools">
              <button onClick={toggleAutoLog} style={{
                width: '100%', padding: '0.7rem', borderRadius: '10px',
                border: `1px solid ${logInterval ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                background: logInterval ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500
              }}>
                {logInterval ? `Logging Active (${sessionLog.length} events)` : 'Start Session Logging'}
              </button>
              {sessionLog.length > 0 && (
                <button onClick={downloadLog} style={{
                  width: '100%', padding: '0.65rem', borderRadius: '10px', marginTop: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.8rem'
                }}>
                  Download CSV ({sessionLog.length} events)
                </button>
              )}
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>
                Logs interactions, voice commands, word events, and progress snapshots every 30s.
              </p>
            </SettingSection>

            {/* Voice Commands */}
            <SettingSection label="Voice Commands Reference">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {[
                  ['"Next" / "Skip"', 'Skip word'],
                  ['"I know this"', 'Mark learned'],
                  ['"Repeat"', 'Hear again'],
                  ['"Example"', 'Full sentence'],
                  ['"Pause"', 'Stop auto-play'],
                  ['"Continue"', 'Resume auto']
                ].map(([cmd, desc]) => (
                  <div key={cmd} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.6rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{cmd}</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.15rem' }}>{desc}</div>
                  </div>
                ))}
              </div>
            </SettingSection>

            <Link href="/settings" style={{
              display: 'block', padding: '0.65rem', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
              textAlign: 'center', textDecoration: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: '0.8rem', marginTop: '0.5rem'
            }}>
              API Keys Configuration →
            </Link>
          </div>
        </div>
      )}

      {/* === CSS ANIMATIONS === */}
      <style jsx>{`
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(239,68,68,0.35), inset 0 0 20px rgba(239,68,68,0.1); }
          50% { box-shadow: 0 0 60px rgba(239,68,68,0.5), inset 0 0 30px rgba(239,68,68,0.15); border-color: #f87171; }
        }
        @keyframes wordEnter {
          0% { opacity: 0; transform: translate(-50%, -45%) scale(0.92); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes wordExit {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -55%) scale(0.95); }
        }
        @keyframes landmarkFlash {
          0% { opacity: 0; }
          15% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes feedbackPulse {
          0% { opacity: 0; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.1); }
        }
        @keyframes toastIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

function SettingSection({ label, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
