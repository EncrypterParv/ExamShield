import { useRef, useState, useCallback, useEffect } from "react";

const CHUNK_INTERVAL_MS = 1000;   // 1s chunks into buffer
const BUFFER_SECONDS    = 20;     // keep rolling 20s in memory
const CLIP_SECONDS      = 15;     // save 15s on flag

// ─── Audio classification thresholds ──────────────────────────────────────────
function classifyAudio(level) {
  if (level >= 0.70) return { label: "Multiple voices detected",  icon: "🗣️", severity: "high"   };
  if (level >= 0.30) return { label: "Background noise detected", icon: "🔊", severity: "medium" };
  return               { label: "No unusual audio",               icon: "✅", severity: "low"    };
}

export default function useProctoring() {
  // Screen recording
  const screenStreamRef  = useRef(null);   // getDisplayMedia stream
  const recorderRef      = useRef(null);   // MediaRecorder on screen stream
  const chunksRef        = useRef([]);     // rolling { blob, ts }[]

  // Mic audio (separate, audio-only stream)
  const micStreamRef     = useRef(null);
  const audioCtxRef      = useRef(null);
  const analyserRef      = useRef(null);
  const audioLevelRef    = useRef(0);
  const rafRef           = useRef(null);

  const [screenReady,      setScreenReady]      = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [screenEnded,      setScreenEnded]      = useState(false); // user stopped share

  // ── Start rolling MediaRecorder on screen stream ────────────────────────
  const startRecorder = useCallback((stream) => {
    const preferred = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];
    let mimeType = "";
    for (const m of preferred) {
      if (MediaRecorder.isTypeSupported(m)) { mimeType = m; break; }
    }

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push({ blob: e.data, ts: Date.now() });
        const cutoff = Date.now() - BUFFER_SECONDS * 1000;
        chunksRef.current = chunksRef.current.filter(c => c.ts >= cutoff);
      }
    };

    recorder.start(CHUNK_INTERVAL_MS);
  }, []);

  // ── Start mic-only audio analysis ───────────────────────────────────────
  const startMicAudio = useCallback(async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = micStream;

      const ctx      = new (window.AudioContext || window.webkitAudioContext)();
      const source   = ctx.createMediaStreamSource(micStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current  = ctx;
      analyserRef.current  = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sumSq = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sumSq += v * v;
        }
        audioLevelRef.current = Math.sqrt(sumSq / data.length);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // Mic denied — non-fatal, audio observation defaults to "No unusual audio"
    }
  }, []);

  // ── Request screen share + start mic ────────────────────────────────────
  const startProctoring = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 15, max: 30 } },
        audio: false,   // capture mic separately to avoid echo issues
      });

      screenStreamRef.current = screenStream;

      // Detect if student manually stops sharing
      screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        setScreenReady(false);
        setScreenEnded(true);
      });

      startRecorder(screenStream);
      setScreenReady(true);

      // Start mic separately (non-blocking — may fail if denied)
      startMicAudio();
    } catch (err) {
      console.warn("ExamShield — screen share denied:", err.message);
      setPermissionDenied(true);
    }
  }, [startRecorder, startMicAudio]);

  // ── Grab last CLIP_SECONDS of buffer as a Blob URL ──────────────────────
  const saveClip = useCallback(() => {
    const cutoff   = Date.now() - CLIP_SECONDS * 1000;
    const relevant = chunksRef.current.filter(c => c.ts >= cutoff).map(c => c.blob);
    if (!relevant.length) return null;
    const mime = recorderRef.current?.mimeType || "video/webm";
    return URL.createObjectURL(new Blob(relevant, { type: mime }));
  }, []);

  // ── Take a screenshot from the screen stream via canvas ─────────────────
  const takeScreenshot = useCallback(() => {
    const track = screenStreamRef.current?.getVideoTracks()[0];
    if (!track) return null;

    try {
      const capture = new ImageCapture(track);
      // ImageCapture.grabFrame returns a Promise<ImageBitmap>
      // We return a Promise here; callers can await it
      return capture.grabFrame().then((bitmap) => {
        const canvas = document.createElement("canvas");
        canvas.width  = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext("2d").drawImage(bitmap, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.7);
      }).catch(() => null);
    } catch {
      return Promise.resolve(null);
    }
  }, []);

  // ── Capture full evidence bundle ─────────────────────────────────────────
  const captureEvidence = useCallback(async () => {
    const audioLevel = audioLevelRef.current;
    const audio      = classifyAudio(audioLevel);

    const screenshotDataUrl = await takeScreenshot();

    return {
      recordingBlobUrl : saveClip(),
      screenshotDataUrl,
      audioObservation : audio.label,
      audioIcon        : audio.icon,
      audioSeverity    : audio.severity,
      audioLevel       : Math.round(audioLevel * 100),
    };
  }, [saveClip, takeScreenshot]);

  // ── Stop everything ──────────────────────────────────────────────────────
  const stopProctoring = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close().catch(() => {});
    setScreenReady(false);
  }, []);

  useEffect(() => () => stopProctoring(), [stopProctoring]);

  return {
    screenReady,
    permissionDenied,
    screenEnded,
    startProctoring,
    captureEvidence,
    stopProctoring,
  };
}
