import { useRef, useEffect } from 'react';

const MUSIC_URL = '/music/when-god-made-you.mp3';

interface MusicPlayerProps {
  autoPlayOnOpen?: boolean;
}

export function MusicPlayer({ autoPlayOnOpen = false }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (autoPlayOnOpen) {
      const timer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.volume = 0.25;
          audioRef.current.play().catch(() => {
            // Browser autoplay policy may block until user interaction
          });
        }
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [autoPlayOnOpen]);

  return <audio ref={audioRef} preload="auto" src={MUSIC_URL} />;
}
