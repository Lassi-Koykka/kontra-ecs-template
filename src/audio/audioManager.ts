import { IAudioClipBuffers, IAudioManager } from "./types";

export const createAudioManager = (
  audioCtx: AudioContext,
  buffers: IAudioClipBuffers,
  initialVolume?: number
): IAudioManager => {
  const masterGain = audioCtx.createGain()
  !!initialVolume && masterGain.gain.setValueAtTime(initialVolume, audioCtx.currentTime)
  masterGain.connect(audioCtx.destination);
  return {
    audioCtx,
    buffers,
    playClip: (clip: string, options = {}) => {
      const { when, volume, offset, duration, loop, onEnded } = options;
      const buf = buffers[clip];
      if (buf) {
        const source = audioCtx.createBufferSource();
        const clipGain = audioCtx.createGain()
        !!volume && clipGain.gain.setValueAtTime(volume, audioCtx.currentTime)
        source.buffer = buf;
        source.loop = !!loop;
        source.connect(clipGain)
        clipGain.connect(masterGain)
        source.start(when, offset, duration);
        if(onEnded) source.onended = () => onEnded()
      }
    },
  };
};
