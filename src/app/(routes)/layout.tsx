"use client";

import { useEffect, useRef, useState } from "react";

import Cursor from "@/components/ui/cursor";
import ResumeButton from "@/components/layout/resume-button";
import NavHost from "@/components/layout/nav-host";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(1);
  const idleTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const audioRef = useRef<HTMLAudioElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMouseX(e.clientX);
    setMouseY(e.clientY);
    setOpacity(1);

    clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => setOpacity(0), 2000);
  };

  useEffect(() => {
    const play = () => {
      void audioRef.current?.play();
    };

    document.addEventListener("mousedown", play);
    return () => {
      document.removeEventListener("mousedown", play);
      clearTimeout(idleTimeout.current);
    };
  }, []);

  return (
    <div
      onMouseMove={onMouseMove}
      onMouseDown={() => setScale(1.25)}
      onMouseUp={() => setScale(1)}
    >
      <ResumeButton />
      <audio ref={audioRef} src="/sounds/click.mp3" />
      <NavHost />
      <Cursor mouseX={mouseX} mouseY={mouseY} scale={scale} opacity={opacity} />
      {children}
    </div>
  );
}
