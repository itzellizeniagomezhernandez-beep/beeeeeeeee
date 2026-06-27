import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const STORAGE_KEY = "beast-music-muted";
const STREAM_URL = "/api/music/stream";

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [hasMusic, setHasMusic] = useState(false);
  const [ready, setReady] = useState(false);

  // Check if music URL is configured
  useEffect(() => {
    async function checkMusic() {
      try {
        const res = await fetch("/api/settings/music_url");
        if (res.ok) {
          const data = await res.json();
          if (data?.value) setHasMusic(true);
        }
      } catch {}
    }
    checkMusic();
    const interval = setInterval(checkMusic, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Create audio element once music is confirmed available
  useEffect(() => {
    if (!hasMusic) return;

    const audio = new Audio();
    audio.src = STREAM_URL;
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = "auto";
    audioRef.current = audio;

    function tryPlay() {
      audio.play().catch(() => {});
    }

    // Play immediately once enough data is loaded
    audio.addEventListener("canplay", tryPlay, { once: true });

    // Also try on any user interaction as fallback
    const onInteraction = () => { tryPlay(); };
    document.addEventListener("click", onInteraction);
    document.addEventListener("touchstart", onInteraction);

    // Start loading
    audio.load();
    setReady(true);

    return () => {
      audio.pause();
      audio.src = "";
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("touchstart", onInteraction);
    };
  }, [hasMusic]);

  // Sync muted state
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
    localStorage.setItem(STORAGE_KEY, String(muted));
  }, [muted]);

  // When unmuting, ensure audio is playing
  function handleToggle() {
    const newMuted = !muted;
    setMuted(newMuted);
    if (!newMuted && audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.play().catch(() => {});
    }
  }

  if (!hasMusic || !ready) return null;

  return (
    <button
      onClick={handleToggle}
      title={muted ? "Activar música" : "Mutear música"}
      className="fixed bottom-24 right-5 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:scale-110 border border-primary/40"
      style={{ background: "rgba(10,10,20,0.92)", backdropFilter: "blur(8px)" }}
    >
      {muted
        ? <VolumeX className="w-5 h-5 text-zinc-500" />
        : <Volume2 className="w-5 h-5 text-primary drop-shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
      }
    </button>
  );
}
