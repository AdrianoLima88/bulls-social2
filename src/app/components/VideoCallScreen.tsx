import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, Phone, X } from 'lucide-react';

export const VideoCallScreen = ({
  onEnd,
  userName,
  userAvatar,
  localStream,
  remoteStream,
  callStatus,
}: {
  onEnd: () => void;
  userName?: string;
  userAvatar?: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStatus: string;
}) => {
  const [isMuted,      setIsMuted]      = useState(false);
  const [isVideoOn,    setIsVideoOn]    = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const isConnected = callStatus === 'connected';

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!isConnected) return;
    const id = setInterval(() => setCallDuration(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [isConnected]);

  useEffect(() => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = !isMuted; });
  }, [isMuted, localStream]);

  useEffect(() => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = isVideoOn; });
  }, [isVideoOn, localStream]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const label = callStatus === 'calling' ? 'Calling...'
    : isConnected ? fmt(callDuration)
    : 'Connecting...';

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col">
      {/* Fundo: vídeo remoto ou avatar */}
      <div className="flex-1 relative bg-gradient-to-b from-slate-800 to-slate-900">

        {remoteStream ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-6xl font-bold">{userAvatar || '?'}</span>
              </div>
              <p className="text-white text-xl font-semibold">{userName || 'User'}</p>
              {!isConnected && <p className="text-white/70 text-sm mt-1 animate-pulse">{label}</p>}
            </div>
          </div>
        )}

        {/* Barra superior */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">{userName || 'User'}</h2>
              <p className="text-white/80 text-sm">{label}</p>
            </div>
            <button onClick={onEnd} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* PiP — câmera local */}
        <div className="absolute top-20 right-4 w-28 h-36 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
          {isVideoOn && localStream ? (
            <>
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
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

        {/* Indicadores */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
          {isMuted    && <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"><MicOff className="w-3 h-3" /> Muted</div>}
          {!isVideoOn && <div className="bg-slate-700 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"><VideoOff className="w-3 h-3" /> Camera off</div>}
        </div>
      </div>

      {/* Controles */}
      <div className="bg-black/80 p-6">
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'}`}>
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>
          <button onClick={onEnd} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg">
            <Phone className="w-7 h-7 text-white rotate-[135deg]" />
          </button>
          <button onClick={() => setIsVideoOn(!isVideoOn)} className={`w-14 h-14 rounded-full flex items-center justify-center transition ${!isVideoOn ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'}`}>
            {isVideoOn ? <VideoIcon className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
};
