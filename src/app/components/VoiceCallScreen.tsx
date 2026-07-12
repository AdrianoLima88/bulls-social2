import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, VolumeX, Phone } from 'lucide-react';

export const VoiceCallScreen = ({ onEnd, userName, userAvatar }) => {
  const [isMuted, setIsMuted]           = useState(false);
  const [isSpeakerOn, setIsSpeakerOn]   = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus]     = useState('Calling...');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel]     = useState([15, 25, 35, 20, 30]);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number>(0);

  // Request microphone
  useEffect(() => {
    let analyser: AnalyserNode | null = null;
    let audioCtx: AudioContext | null = null;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        streamRef.current = stream;
        setHasPermission(true);

        audioCtx  = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser  = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        audioCtx.createMediaStreamSource(stream).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser!.getByteFrequencyData(data);
          setAudioLevel([0,1,2,3,4].map(i => Math.max(12, data[i * 3] / 4.5)));
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        // Simulate call connecting
        setTimeout(() => setCallStatus('Connected'), 2500);
      })
      .catch(() => setHasPermission(false));

    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioCtx?.close();
    };
  }, []);

  // Duration timer
  useEffect(() => {
    if (callStatus !== 'Connected') return;
    const id = setInterval(() => setCallDuration(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [callStatus]);

  // Mute/unmute real mic
  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !isMuted; });
  }, [isMuted]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-green-600 to-green-800 z-50 flex flex-col items-center justify-between p-8">
      {/* Close */}
      <div className="w-full flex justify-end">
        <button onClick={onEnd} className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-6">
          {callStatus === 'Connected' && (
            <>
              <div className="absolute inset-0 -m-8 rounded-full bg-white/20 animate-ping" />
              <div className="absolute inset-0 -m-4 rounded-full bg-white/30 animate-pulse" />
            </>
          )}
          <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center relative z-10">
            <span className="text-white text-5xl font-bold">{userAvatar || '?'}</span>
          </div>
        </div>

        <h2 className="text-white text-3xl font-bold mb-2">{userName || 'User'}</h2>
        <p className="text-white/80 text-lg">
          {callStatus === 'Connected' ? fmt(callDuration) : callStatus}
        </p>

        {/* Audio bars */}
        {callStatus === 'Connected' && !isMuted && (
          <div className="flex gap-1 mt-6 items-end h-12">
            {audioLevel.map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-white rounded-full transition-all duration-75"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        )}

        {hasPermission === false && (
          <p className="text-white/60 text-xs mt-4">Microphone access not granted</p>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition ${isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'}`}
          >
            {isMuted ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
          </button>

          <button
            onClick={onEnd}
            className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
          >
            <Phone className="w-8 h-8 text-white rotate-[135deg]" />
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className="w-16 h-16 rounded-full flex items-center justify-center transition bg-white/20 hover:bg-white/30"
          >
            {isSpeakerOn ? <Volume2 className="w-7 h-7 text-white" /> : <VolumeX className="w-7 h-7 text-white/50" />}
          </button>
        </div>
        <div className="text-center space-y-1">
          {isMuted     && <p className="text-white/80 text-sm">🔇 Microphone off</p>}
          {!isSpeakerOn && <p className="text-white/80 text-sm">🔈 Speaker off</p>}
        </div>
      </div>
    </div>
  );
};
