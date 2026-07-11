/**
 * WebRTC live streaming via Supabase Realtime broadcast (signaling channel).
 *
 * Architecture: P2P — host creates one RTCPeerConnection per viewer.
 * Works for up to ~10 simultaneous viewers (hardware-limited on the host device).
 *
 * Signaling flow:
 *  1. Viewer joins → sends  { viewer_join }  to host
 *  2. Host receives → creates offer → sends  { offer }  to viewer
 *  3. Viewer receives offer → creates answer → sends  { answer }  back
 *  4. Both exchange  { ice }  candidates
 *  5. WebRTC connection established — video + audio flow peer-to-peer
 */

import { useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase/client';

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
};

type Signal =
  | { type: 'viewer_join'; from: string; to: string }
  | { type: 'offer';        from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: 'answer';       from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: 'ice';          from: string; to: string; candidate: RTCIceCandidateInit }
  | { type: 'viewer_leave'; from: string; to: string };

// ─── HOST ─────────────────────────────────────────────────────────────────────

/**
 * Call in WatchLiveScreen when isHost === true.
 * Watches the signaling channel and creates a WebRTC connection for each viewer
 * that joins, forwarding the local camera+mic stream to them.
 */
export function useWebRTCHost(
  liveId: string | null,
  hostId: string | null,
  localStream: MediaStream | null,
) {
  const pcsRef = useRef(new Map<string, RTCPeerConnection>());

  useEffect(() => {
    if (!liveId || !hostId || !localStream) return;

    const channel = supabase.channel(`webrtc_${liveId}`, {
      config: { broadcast: { self: false } },
    });

    const send = (msg: Signal) =>
      channel.send({ type: 'broadcast', event: 'sig', payload: msg });

    const makePC = async (viewerId: string) => {
      // Close any pre-existing connection for this viewer
      pcsRef.current.get(viewerId)?.close();

      const pc = new RTCPeerConnection(ICE_CONFIG);
      pcsRef.current.set(viewerId, pc);

      // Add every local track (video + audio) to the peer connection
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      // Forward ICE candidates to the viewer
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          send({ type: 'ice', from: hostId, to: viewerId, candidate: candidate.toJSON() });
        }
      };

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      send({ type: 'offer', from: hostId, to: viewerId, sdp: offer });
    };

    channel
      .on('broadcast', { event: 'sig' }, async ({ payload }: { payload: Signal }) => {
        // Ignore messages not addressed to this host
        if (payload.to !== hostId) return;

        switch (payload.type) {
          case 'viewer_join':
            await makePC(payload.from);
            break;

          case 'answer': {
            const pc = pcsRef.current.get(payload.from);
            if (pc && pc.signalingState !== 'stable') {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            }
            break;
          }

          case 'ice': {
            const pc = pcsRef.current.get(payload.from);
            if (pc) {
              try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch {}
            }
            break;
          }

          case 'viewer_leave':
            pcsRef.current.get(payload.from)?.close();
            pcsRef.current.delete(payload.from);
            break;
        }
      })
      .subscribe();

    return () => {
      pcsRef.current.forEach(pc => pc.close());
      pcsRef.current.clear();
      supabase.removeChannel(channel);
    };
  }, [liveId, hostId, localStream]);
}

// ─── VIEWER ───────────────────────────────────────────────────────────────────

/**
 * Call in WatchLiveScreen when isHost === false.
 * Sends a join signal to the host and sets up the incoming WebRTC stream.
 * Retries the join announcement every 3 s in case the host wasn't subscribed yet.
 */
export function useWebRTCViewer(
  liveId: string | null,
  hostId: string | null,
  viewerId: string | null,
  onStream: (stream: MediaStream) => void,
  onConnectionState?: (state: RTCPeerConnectionState) => void,
) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteStream = useRef(new MediaStream());
  const retryRef = useRef<ReturnType<typeof setInterval>>();
  const gotOfferRef = useRef(false);

  useEffect(() => {
    if (!liveId || !hostId || !viewerId) return;

    const channel = supabase.channel(`webrtc_${liveId}`, {
      config: { broadcast: { self: false } },
    });

    const send = (msg: Signal) =>
      channel.send({ type: 'broadcast', event: 'sig', payload: msg });

    const pc = new RTCPeerConnection(ICE_CONFIG);
    pcRef.current = pc;

    // Receive remote tracks (video + audio)
    pc.ontrack = ({ track }) => {
      remoteStream.current.addTrack(track);
      onStream(remoteStream.current);
    };

    pc.onconnectionstatechange = () => {
      onConnectionState?.(pc.connectionState);
    };

    // Forward ICE candidates to host
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        send({ type: 'ice', from: viewerId, to: hostId, candidate: candidate.toJSON() });
      }
    };

    channel
      .on('broadcast', { event: 'sig' }, async ({ payload }: { payload: Signal }) => {
        // Ignore messages not for this viewer
        if (payload.to !== viewerId) return;

        switch (payload.type) {
          case 'offer': {
            if (gotOfferRef.current) break; // deduplicate retries
            gotOfferRef.current = true;
            clearInterval(retryRef.current); // stop retrying

            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            send({ type: 'answer', from: viewerId, to: hostId, sdp: answer });
            break;
          }

          case 'ice':
            if (payload.from === hostId) {
              try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch {}
            }
            break;
        }
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') return;

        // Announce presence once, then retry every 3 s until we get an offer
        const join = () => send({ type: 'viewer_join', from: viewerId, to: hostId });
        join();
        retryRef.current = setInterval(() => {
          if (gotOfferRef.current) {
            clearInterval(retryRef.current);
          } else {
            join();
          }
        }, 3000);

        // Give up after 30 s (host might be offline)
        setTimeout(() => clearInterval(retryRef.current), 30_000);
      });

    return () => {
      clearInterval(retryRef.current);
      try { send({ type: 'viewer_leave', from: viewerId, to: hostId }); } catch {}
      pc.close();
      supabase.removeChannel(channel);
    };
  }, [liveId, hostId, viewerId]); // eslint-disable-line react-hooks/exhaustive-deps
}
