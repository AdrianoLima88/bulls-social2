// Module-level store that keeps the local MediaStream alive
// when navigating from StartLiveScreen → WatchLiveScreen.
// (React state is destroyed on unmount; a module variable persists.)

let _stream: MediaStream | null = null;
let _filter: string = 'none';

export const liveStreamStore = {
  setStream(stream: MediaStream | null) {
    _stream = stream;
  },
  getStream(): MediaStream | null {
    return _stream;
  },
  setFilter(filter: string) {
    _filter = filter;
  },
  getFilter(): string {
    return _filter;
  },
  /** Stop all tracks and clear the store (call when ending the live). */
  clear() {
    if (_stream) {
      _stream.getTracks().forEach(t => t.stop());
      _stream = null;
    }
    _filter = 'none';
  },
};
