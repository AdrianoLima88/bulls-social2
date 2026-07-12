import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected';
export type CallType  = 'voice' | 'video';

export interface CallUser {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface IncomingCallData {
  from: CallUser;
  type: CallType;
  offer: RTCSessionDescriptionInit;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const useWebRTCCall = () => {
  const { user, profile } = useAuth();

  const [callState,    setCallState]    = useState<CallState>('idle');
  const [callType,     setCallType]     = useState<CallType>('voice');
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [localStream,  setLocalStream]  = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteUser,   setRemoteUser]   = useState<CallUser | null>(null);

  const pcRef           = useRef<RTCPeerConnection | null>(null);
  const myChannelRef    = useRef<any>(null);
  const targetChanRef   = useRef<any>(null);
  const pendingIceRef   = useRef<RTCIceCandidateInit[]>([]);
  const callStateRef    = useRef<CallState>('idle');
  const localStreamRef  = useRef<MediaStream | null>(null);

  // Keep refs in sync
  useEffect(() => { callStateRef.current = callState; }, [callState]);
  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);

  // ── Open own signaling channel ──────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const ch = supabase.channel(`call:${user.id}`, {
      config: { broadcast: { self: false, ack: false } },
    });

    ch.on('broadcast', { event: 'offer' }, ({ payload }) => {
      if (callStateRef.current !== 'idle') return; // Já em chamada
      setIncomingCall({
        from: payload.from,
        type: payload.callType as CallType,
        offer: payload.sdp,
      });
    });

    ch.on('broadcast', { event: 'answer' }, async ({ payload }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        for (const c of pendingIceRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        }
        pendingIceRef.current = [];
        setCallState('connected');
      } catch (e) { console.error('setRemoteDescription (answer):', e); }
    });

    ch.on('broadcast', { event: 'ice' }, async ({ payload }) => {
      if (!pcRef.current) return;
      if (pcRef.current.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {});
      } else {
        pendingIceRef.current.push(payload.candidate);
      }
    });

    ch.on('broadcast', { event: 'hangup' }, () => cleanup());
    ch.on('broadcast', { event: 'reject'  }, () => cleanup());

    ch.subscribe();
    myChannelRef.current = ch;

    return () => {
      supabase.removeChannel(ch);
      myChannelRef.current = null;
    };
  }, [user?.id]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const openTargetChannel = useCallback((targetId: string) => {
    if (targetChanRef.current) {
      supabase.removeChannel(targetChanRef.current);
    }
    const ch = supabase.channel(`call:${targetId}`, {
      config: { broadcast: { self: false, ack: false } },
    });
    ch.subscribe();
    targetChanRef.current = ch;
    return ch;
  }, []);

  const sendToTarget = useCallback((event: string, payload: object) => {
    targetChanRef.current?.send({ type: 'broadcast', event, payload });
  }, []);

  const buildPC = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) sendToTarget('ice', { candidate: candidate.toJSON() });
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0] ?? (() => { const s = new MediaStream(); s.addTrack(e.track); return s; })();
      setRemoteStream(stream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setCallState('connected');
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) cleanup();
    };

    pcRef.current = pc;
    return pc;
  }, [sendToTarget]);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current   = null;
    pendingIceRef.current = [];

    const s = localStreamRef.current;
    if (s) s.getTracks().forEach(t => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setCallState('idle');
    setIncomingCall(null);
    setRemoteUser(null);

    if (targetChanRef.current) {
      supabase.removeChannel(targetChanRef.current);
      targetChanRef.current = null;
    }
  }, []);

  // ── Public API ───────────────────────────────────────────────────────────
  const startCall = useCallback(async (target: CallUser, type: CallType) => {
    if (!user || !profile) return;
    if (callStateRef.current !== 'idle') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      setLocalStream(stream);
      setCallType(type);
      setCallState('calling');
      setRemoteUser(target);

      openTargetChannel(target.id);
      const pc = buildPC();
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendToTarget('offer', {
        from: { id: user.id, name: profile.name, avatar_url: profile.avatar_url ?? null },
        callType: type,
        sdp: offer,
      });
    } catch (e) {
      console.error('startCall error:', e);
      cleanup();
    }
  }, [user, profile, openTargetChannel, buildPC, sendToTarget, cleanup]);

  const answerCall = useCallback(async () => {
    if (!incomingCall || !user || !profile) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incomingCall.type === 'video',
      });
      setLocalStream(stream);
      setCallType(incomingCall.type);
      setRemoteUser(incomingCall.from);
      setIncomingCall(null);
      setCallState('connected');

      openTargetChannel(incomingCall.from.id);
      const pc = buildPC();
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      for (const c of pendingIceRef.current) {
        await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
      }
      pendingIceRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendToTarget('answer', { sdp: answer });
    } catch (e) {
      console.error('answerCall error:', e);
      cleanup();
    }
  }, [incomingCall, user, profile, openTargetChannel, buildPC, sendToTarget, cleanup]);

  const rejectCall = useCallback(() => {
    if (!incomingCall) return;
    openTargetChannel(incomingCall.from.id);
    sendToTarget('reject', {});
    setIncomingCall(null);
    if (targetChanRef.current) {
      supabase.removeChannel(targetChanRef.current);
      targetChanRef.current = null;
    }
  }, [incomingCall, openTargetChannel, sendToTarget]);

  const endCall = useCallback(() => {
    sendToTarget('hangup', {});
    cleanup();
  }, [sendToTarget, cleanup]);

  return {
    callState,
    callType,
    incomingCall,
    localStream,
    remoteStream,
    remoteUser,
    startCall,
    answerCall,
    rejectCall,
    endCall,
  };
};
