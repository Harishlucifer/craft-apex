"use client";

import { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  FullScreenToggle – toggle browser fullscreen mode                  */
/* ------------------------------------------------------------------ */

export function FullScreenToggle() {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullscreen = () => {
    const doc = window.document;

    if (
      !doc.fullscreenElement &&
      !(doc as any).mozFullScreenElement &&
      !(doc as any).webkitFullscreenElement
    ) {
      // Enter fullscreen
      setIsFullScreen(true);
      doc.body.classList.add("fullscreen-enable");
      const el = doc.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if ((el as any).mozRequestFullScreen) {
        (el as any).mozRequestFullScreen();
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      setIsFullScreen(false);
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if ((doc as any).mozCancelFullScreen) {
        (doc as any).mozCancelFullScreen();
      } else if ((doc as any).webkitCancelFullScreen) {
        (doc as any).webkitCancelFullScreen();
      }
    }

    // Handle fullscreen exit via Escape or browser UI
    const exitHandler = () => {
      if (
        !(doc as any).webkitIsFullScreen &&
        !(doc as any).mozFullScreen &&
        !(doc as any).msFullscreenElement
      ) {
        doc.body.classList.remove("fullscreen-enable");
        setIsFullScreen(false);
      }
    };
    doc.addEventListener("fullscreenchange", exitHandler);
    doc.addEventListener("webkitfullscreenchange", exitHandler);
    doc.addEventListener("mozfullscreenchange", exitHandler);
  };

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      className="hidden h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 sm:flex"
      aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
      id="fullscreen-toggle-btn"
    >
      {isFullScreen ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </button>
  );
}
