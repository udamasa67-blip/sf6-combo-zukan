import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Play, X } from "lucide-react";
import { type ComboVideoAsset } from "@/lib/comboData";
import { NotationDisplay } from "./TokenTooltip";

type ComboVideoProps = {
  asset?: ComboVideoAsset;
  notation?: string;
  description?: string;
};

const activeVideoListeners = new Set<(key: string | null) => void>();
let activeVideoKey: string | null = null;

function setActiveVideo(key: string | null) {
  activeVideoKey = key;
  activeVideoListeners.forEach((listener) => listener(activeVideoKey));
}

export function ComboVideo({ asset, notation, description }: ComboVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoadPoster, setShouldLoadPoster] = useState(false);
  const [currentActiveVideoKey, setCurrentActiveVideoKey] = useState(activeVideoKey);
  const [isExpanded, setIsExpanded] = useState(false);
  const videoKey = asset?.video ?? null;
  const isPlaying = Boolean(videoKey && currentActiveVideoKey === videoKey);

  useEffect(() => {
    if (!asset || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        if (!visible && activeVideoKey === asset.video) {
          setActiveVideo(null);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [asset]);

  useEffect(() => {
    if (!asset || !containerRef.current || shouldLoadPoster) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoadPoster(true);
        observer.disconnect();
      },
      { rootMargin: "700px 0px", threshold: 0 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [asset, shouldLoadPoster]);

  useEffect(() => {
    const listener = (key: string | null) => setCurrentActiveVideoKey(key);
    activeVideoListeners.add(listener);
    return () => {
      activeVideoListeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!videoKey) return;
    return () => {
      if (activeVideoKey === videoKey) {
        setActiveVideo(null);
      }
    };
  }, [videoKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible && isPlaying) {
      void video.play().catch(() => {
        /* autoplay may be blocked in some browser modes */
      });
      return;
    }

    video.pause();
  }, [isVisible, isPlaying]);

  useEffect(() => {
    if (!isExpanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
    };

    document.body.classList.add("combo-video-modal-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("combo-video-modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isExpanded]);

  if (!asset) return null;

  return (
    <>
      <div ref={containerRef} className="combo-video-shell" aria-label={asset.label ?? "コンボ動画"}>
        {isPlaying ? (
          <>
            <video
              ref={videoRef}
              className="combo-video"
              poster={asset.poster}
              preload="none"
              muted
              playsInline
              loop
            >
              <source src={asset.video} type="video/webm" />
            </video>
            <button
              type="button"
              className="combo-video-expand"
              onClick={() => setIsExpanded(true)}
              aria-label={`${asset.label ?? "コンボ動画"}を拡大`}
              title="拡大"
            >
              <Maximize2 size={15} />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="combo-video-poster"
            onClick={() => setActiveVideo(asset.video)}
            aria-label={`${asset.label ?? "コンボ動画"}を再生`}
          >
            {shouldLoadPoster ? (
              <img src={asset.poster} alt={asset.label ?? "コンボ動画サムネイル"} loading="lazy" decoding="async" />
            ) : (
              <span className="combo-video-poster-placeholder" aria-hidden="true" />
            )}
            <span className="combo-video-play">
              <Play size={16} fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      {isExpanded &&
        createPortal(
          <div className="combo-video-modal" role="dialog" aria-modal="true" aria-label={asset.label ?? "コンボ動画拡大表示"}>
            <button type="button" className="combo-video-modal-backdrop" onClick={() => setIsExpanded(false)} aria-label="拡大表示を閉じる" />
            <div className="combo-video-modal-panel">
              <button type="button" className="combo-video-close" onClick={() => setIsExpanded(false)} aria-label="閉じる" title="閉じる">
                <X size={18} />
              </button>
              {notation && (
                <div className="combo-video-modal-notation">
                  <NotationDisplay notation={notation} />
                </div>
              )}
              <div className="combo-video-modal-frame">
                <video className="combo-video-modal-player" poster={asset.poster} autoPlay muted playsInline loop>
                  <source src={asset.video} type="video/webm" />
                </video>
              </div>
              {description && <p className="combo-video-modal-description">{description}</p>}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
