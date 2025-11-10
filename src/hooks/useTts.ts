import { useState, useRef, useCallback, useEffect } from 'react';
import { generateSpeech } from '@/src/services';
import { decode, decodeAudioData } from '@/src/utils/audioUtils';
import type { TtsState } from '@/src/types';

export const useTts = (markdown: string) => {
  const [ttsState, setTtsState] = useState<TtsState>('idle');
  const [ttsError, setTtsError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const pausedAtRef = useRef<number>(0);
  const startedAtRef = useRef<number>(0);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.onended = null;
          audioSourceRef.current.stop();
        } catch {
          // Already stopped or not started
        }
        audioSourceRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current
          .close()
          .catch(() => {
            // Ignore errors during cleanup
          })
          .finally(() => {
            audioContextRef.current = null;
          });
      }
      audioBufferRef.current = null;
      pausedAtRef.current = 0;
      startedAtRef.current = 0;
    };
  }, []);

  const handleStopTts = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setTtsState('idle');
    pausedAtRef.current = 0;
    startedAtRef.current = 0;
    audioBufferRef.current = null;
  }, []);

  const handleTtsPlayPause = useCallback(async () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext ||
          (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)({
          sampleRate: 24000,
        });
      } catch {
        setTtsError('Audio playback not supported.');
        return;
      }
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    setTtsError(null);

    switch (ttsState) {
      case 'playing':
        if (audioSourceRef.current && audioContextRef.current) {
          pausedAtRef.current = audioContextRef.current.currentTime - startedAtRef.current;
          audioSourceRef.current.onended = null;
          audioSourceRef.current.stop();
          audioSourceRef.current = null;
          setTtsState('paused');
        }
        break;
      case 'paused':
        if (audioContextRef.current && audioBufferRef.current) {
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBufferRef.current;
          source.connect(audioContextRef.current.destination);
          startedAtRef.current = audioContextRef.current.currentTime - pausedAtRef.current;
          source.start(0, pausedAtRef.current % audioBufferRef.current.duration);
          source.onended = handleStopTts;
          audioSourceRef.current = source;
          setTtsState('playing');
        }
        break;
      case 'idle':
        if (!markdown.trim()) return;
        handleStopTts();
        setTtsState('loading');
        try {
          const audioData = await generateSpeech(markdown);
          const decodedBuffer = await decodeAudioData(
            decode(audioData),
            audioContextRef.current,
            24000,
            1
          );
          audioBufferRef.current = decodedBuffer;
          const source = audioContextRef.current.createBufferSource();
          source.buffer = decodedBuffer;
          source.connect(audioContextRef.current.destination);
          pausedAtRef.current = 0;
          startedAtRef.current = audioContextRef.current.currentTime;
          source.start(0);
          source.onended = handleStopTts;
          audioSourceRef.current = source;
          setTtsState('playing');
        } catch (err) {
          setTtsError(err instanceof Error ? err.message : 'Failed to generate audio.');
          setTtsState('idle');
        }
        break;
    }
  }, [markdown, ttsState, handleStopTts]);

  return {
    ttsState,
    ttsError,
    handleTtsPlayPause,
    handleStopTts,
  };
};
