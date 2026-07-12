import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, Phone, Maximize2, SwitchCamera } from 'lucide-react';

export const VideoCallScreen = ({ onEnd, userName, userAvatar }) => {
  const [isMuted,    setIsMuted]    = useState(false);
  const [isVideoOn,  setIsVideoOn]  = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus,   setCallStatus]   = useState('Calling...');
  const [facingMode,   setFacingMode]   = useState<'user' | 'environment'>('user');
  const streamRef      = useRef<MediaStream | null>(null);
  const localVideoRef  = useRef<HTMLVideoElement>(null);

  const startMedia = async (facing: 'user' | 'environment') => {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: true,
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      // Apply current mute/video state
      stream.getAudioTracks().forEach(t => { t.enabled = !isMuted; });
      stream.getVideoTracks().forEach(t => { t.enabled = isVideoOn; });
    } catch {
      setIsVideoOn(false);
    }
  };

  useEffect(() => {
    startMedia(facingMode);
    setTimeout(() => setCallStatus('Connected'), 2500);
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (callStatus !== 'Connected') return;
    const id = setInterval(() => setCallDuration(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [callStatus]);

  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !isMuted; });
  }, [isMuted]);

  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = isVideoOn; });
  }, [isVideoOn]);

  const switchCamera = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    startMedia(next);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Remote user background */}
      <div className="flex-1 relative bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-6xl font-bold">{userAvatar || '?'}</span>
            </div>
            <p className="text-white text-xl font-semibold">{userName || 'User'}</p>
            {callStatus !== 'Connected' && (
              <p className="text-white/70 text-sm mt-1 animate-pulse">{callStatus}</p>
            )}
          </div>
        </div>

        {/* Top info */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">{userName || 'User'}</h2>
              <p className="text-white/80 text-sm">
                {callStatus === 'Connected' ? fmt(callDuration) : callStatus}
              </p>
            </div>
            <button
              onClick={onEnd}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* PiP — local camera */}
        <div className="absolute top-20 right-4 w-28 h-36 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
          {isVideoOn ? (
            <>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute bottom-1 left-0 right-0 text-center">
                <span className="text-white text-xs font-semibold bg-black/40 px-1.5 py-0.5 rounded">You</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center gap-1">
              <VideoOff className="w-8 h-8 text-white/50" />
              <span className="text-white/50 text-xs">You</span>
            </div>
          )}
        </div>

        {/* Status pills */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
          {isMuted && (
            <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <MicOff className="w-3 h-3" /> Muted
            </div>
          )}
          {!isVideoOn && (
            <div className="bg-slate-700 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <VideoOff className="w-3 h-3" /> Camera off
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/80 p-6">
        <div className="flex items-center justify-center gap-4">
          <button onClick={switchCamera} className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
            <SwitchCamera className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>
          <button onClick={onEnd} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg">
            <Phone className="w-7 h-7 text-white rotate-[135deg]" />
          </button>
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${!isVideoOn ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'}`}
          >
            {isVideoOn ? <VideoIcon className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
          </button>
          <button onClick={onEnd} className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
