import React, { useEffect, useRef } from 'react';
import { Phone, Video, X } from 'lucide-react';
import type { CallUser, CallType } from '../../hooks/useWebRTCCall';

export const IncomingCallScreen = ({
  caller,
  callType,
  onAnswer,
  onReject,
}: {
  caller: CallUser;
  callType: CallType;
  onAnswer: () => void;
  onReject: () => void;
}) => {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Ring tone usando Web Audio API
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctxRef.current = ctx;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);

      const ring = () => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 480;
        osc.connect(gain);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 440;
        osc2.connect(gain);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0, ctx.currentTime + 0.9);
        osc2.start(ctx.currentTime + 0.5);
        osc2.stop(ctx.currentTime + 0.9);
      };

      ring();
      const id = setInterval(ring, 2000);
      return () => { clearInterval(id); ctx.close(); };
    } catch {}
  }, []);

  const initials = caller.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm mx-4 bg-gradient-to-b from-green-700 to-green-900 rounded-3xl p-8 text-center shadow-2xl">

        {/* Pulse rings */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-40 h-40 bg-white/10 rounded-full animate-ping" />
          <div className="absolute w-32 h-32 bg-white/15 rounded-full animate-pulse" />
          <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden relative z-10 shadow-xl">
            {caller.avatar_url
              ? <img src={caller.avatar_url} alt={caller.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-white/30 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">{initials}</span>
                </div>
            }
          </div>
        </div>

        <p className="text-white/70 text-sm mb-1">
          Incoming {callType === 'video' ? 'video ' : ''}call
        </p>
        <h2 className="text-white text-2xl font-bold mb-8">{caller.name}</h2>

        <div className="flex items-center justify-center gap-16">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onReject}
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 active:scale-95 transition shadow-lg"
            >
              <X className="w-7 h-7 text-white" />
            </button>
            <span className="text-white/70 text-xs font-medium">Decline</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onAnswer}
              className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center hover:bg-green-300 active:scale-95 transition shadow-lg"
            >
              {callType === 'video'
                ? <Video className="w-7 h-7 text-white" />
                : <Phone className="w-7 h-7 text-white" />
              }
            </button>
            <span className="text-white/70 text-xs font-medium">Answer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
