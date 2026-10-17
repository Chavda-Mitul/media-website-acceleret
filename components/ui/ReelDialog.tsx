"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { media } from "@/lib/media";
import { Button } from "@/components/ui/Button";

type ReelDialogProps = {
  open: boolean;
  onClose: () => void;
};

// Full-screen showreel player. Native <dialog> provides focus trapping and Esc-to-close.
export function ReelDialog({ open, onClose }: ReelDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lenis = useLenis();
  // Whether this dialog stopped Lenis, so closing only undoes its own lock (not, e.g., the initial loader's).
  const lockedScroll = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    if (!dialog || !video) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
      if (lenis) {
        lenis.stop();
        lockedScroll.current = true;
      }
      gsap.fromTo(dialog, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
      gsap.fromTo(frameRef.current, { scale: 0.92 }, { scale: 1, duration: 0.9, ease: "expo.out" });
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
      if (dialog.open) dialog.close();
      if (lockedScroll.current) {
        lenis?.start();
        lockedScroll.current = false;
      }
    }
  }, [open, lenis]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Showreel"
      data-lenis-prevent=""
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none bg-tiny-black p-4 text-tiny-white backdrop:bg-transparent md:p-10"
    >
      <div className="flex h-full items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div ref={frameRef} className="relative aspect-video w-full max-w-[min(100%,calc((100dvh-5rem)*16/9))]">
          <video
            ref={videoRef}
            src={media.reelVideo}
            poster={media.reelPoster}
            controls
            playsInline
            preload="none"
            className="h-full w-full rounded-lg bg-tiny-black object-cover"
          />
        </div>
      </div>
      <Button tone="glass" size="sm" onClick={onClose} className="absolute right-4 top-4 md:right-6 md:top-6">
        Close
      </Button>
    </dialog>
  );
}
