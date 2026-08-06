"use client";

import {
  Cancel01Icon,
  Delete02Icon,
  Redo02Icon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { SIGNATURE_MESSAGE_MAX, SIGNATURE_NAME_MAX } from "@/lib/signatures";
import type { SignaturePayload, SignaturePoint, SignatureStroke } from "@/types";

// The pad always exports at this resolution regardless of how wide it renders,
// so every signature on the wall is masked from a same-sized PNG.
const CANVAS_WIDTH = 520;
const CANVAS_HEIGHT = 280;
const STROKE_WIDTH = 5;

interface SignatureModalProps {
  open: boolean;
  saving: boolean;
  errorMessage: string;
  signedInEmail: string;
  onClose: () => void;
  onSubmit: (payload: SignaturePayload) => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  open,
  saving,
  errorMessage,
  signedInEmail,
  onClose,
  onSubmit,
}) => {
  const t = useTranslations("Signatures");
  const { resolvedTheme } = useTheme();

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [strokes, setStrokes] = useState<SignatureStroke[]>([]);
  const [redoStack, setRedoStack] = useState<SignatureStroke[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  // Live points bypass state on purpose — pointermove fires far faster than
  // React can commit, and re-rendering per sample makes the line lag the cursor.
  const currentStrokeRef = useRef<SignatureStroke | null>(null);
  const accentRef = useRef("#000000");

  const canSubmit = name.trim().length > 0 && strokes.length > 0 && !saving;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = accentRef.current;
    ctx.fillStyle = accentRef.current;

    const paint = (stroke: SignatureStroke) => {
      const { points, width } = stroke;
      if (points.length === 0) return;

      ctx.lineWidth = width;
      ctx.beginPath();

      if (points.length === 1) {
        // A tap is a dot, which a zero-length path would not draw.
        ctx.arc(points[0].x, points[0].y, width / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    };

    strokes.forEach(paint);
    if (currentStrokeRef.current) paint(currentStrokeRef.current);
  }, [strokes]);

  // The ink is drawn in the accent colour, which flips with the theme.
  useEffect(() => {
    if (!open) return;

    accentRef.current =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#000000";
    render();
  }, [open, resolvedTheme, render]);

  useEffect(() => {
    render();
  }, [render]);

  // Escape closes, and the page behind the backdrop should not scroll away.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pointFrom = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 } satisfies SignaturePoint;

    // The canvas renders at CSS width but draws in its own coordinate space.
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    } satisfies SignaturePoint;
  };

  const startStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;

    drawingRef.current = true;
    currentStrokeRef.current = {
      width: STROKE_WIDTH,
      points: [pointFrom(event)],
    };
    canvasRef.current?.setPointerCapture(event.pointerId);
    render();
  };

  const continueStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !currentStrokeRef.current) return;

    currentStrokeRef.current.points.push(pointFrom(event));
    render();
  };

  const endStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    const stroke = currentStrokeRef.current;
    currentStrokeRef.current = null;

    if (stroke && stroke.points.length > 0) {
      setStrokes((previous) => [...previous, stroke]);
      setRedoStack([]);
      return;
    }

    render();
  };

  const undo = () => {
    setStrokes((previous) => {
      if (previous.length === 0) return previous;
      const next = previous.slice(0, -1);
      setRedoStack((stack) => [...stack, previous[previous.length - 1]]);
      return next;
    });
  };

  const redo = () => {
    setRedoStack((previous) => {
      if (previous.length === 0) return previous;
      setStrokes((current) => [...current, previous[previous.length - 1]]);
      return previous.slice(0, -1);
    });
  };

  const clear = () => {
    currentStrokeRef.current = null;
    setStrokes([]);
    setRedoStack([]);
  };

  function close() {
    setName("");
    setMessage("");
    clear();
    onClose();
  }

  const submit = () => {
    const canvas = canvasRef.current;
    if (!canSubmit || !canvas) return;

    onSubmit({
      name: name.trim(),
      message: message.trim() || null,
      signature_data: canvas.toDataURL("image/png"),
    });
  };

  const toolButton =
    "inline-grid place-items-center w-8.5 h-8.5 rounded-[10px] border border-elevation_four bg-elevation_one text-text_primary cursor-pointer transition hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:brightness-100 offset_ring";
  const field =
    "w-full text-[0.95rem] font-spacegrotesk py-2.5 px-3 rounded-[10px] border border-elevation_four bg-elevation_one text-text_primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent_opacity";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center p-3 bg-elevation_six backdrop-blur-md cursor-pointer select-none"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2, ease: "linear" } }}
          transition={{ duration: 0.25, ease: "linear" }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={t("modalTitle")}
            className="grid gap-3 md:gap-4 w-[min(580px,100%)] max-h-[95vh] overflow-auto cursor-auto p-3.5 md:p-5 rounded-[20px] border border-elevation_four bg-bg_color shadow-[0_30px_70px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40, transition: { duration: 0.2 } }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <header className="flex items-start justify-between gap-4 pb-2.5 border-b border-elevation_four">
              <h3 className="leading-none">{t("modalTitle")}</h3>
              <button
                type="button"
                aria-label={t("close")}
                onClick={close}
                className="shrink-0 inline-grid place-items-center w-8 h-8 rounded-lg border border-elevation_four bg-elevation_one text-text_primary cursor-pointer transition hover:bg-accent hover:text-bg_color offset_ring"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
              </button>
            </header>

            <p className="text-[0.82rem] md:text-[0.88rem] leading-snug">
              {t("modalBlurb")}
            </p>

            {signedInEmail && (
              <p className="-mt-2 text-[0.78rem] font-jetbrains text-accent">
                {t("signedInAs", { email: signedInEmail })}
              </p>
            )}

            <div className="grid gap-2.5 md:gap-3 md:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[0.78rem] font-jetbrains uppercase text-text_secondary">
                    {t("nameLabel")} *
                  </span>
                  <span
                    aria-live="polite"
                    className="text-[0.68rem] font-jetbrains text-text_secondary"
                  >
                    {name.length}/{SIGNATURE_NAME_MAX}
                  </span>
                </span>
                <input
                  type="text"
                  required
                  maxLength={SIGNATURE_NAME_MAX}
                  placeholder={t("namePlaceholder")}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={field}
                />
              </label>

              <label className="grid gap-1.5 md:col-span-2">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[0.78rem] font-jetbrains uppercase text-text_secondary">
                    {t("messageLabel")}
                  </span>
                  <span
                    aria-live="polite"
                    className="text-[0.68rem] font-jetbrains text-text_secondary"
                  >
                    {message.length}/{SIGNATURE_MESSAGE_MAX}
                  </span>
                </span>
                <textarea
                  rows={2}
                  maxLength={SIGNATURE_MESSAGE_MAX}
                  placeholder={t("messagePlaceholder")}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className={`${field} resize-none`}
                />
              </label>
            </div>

            <div className="signature_pad rounded-xl border border-elevation_four overflow-hidden">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                aria-label={t("padLabel")}
                className="block w-full min-h-39 md:min-h-55 touch-none cursor-crosshair"
                onPointerDown={startStroke}
                onPointerMove={continueStroke}
                onPointerUp={endStroke}
                onPointerLeave={endStroke}
                onPointerCancel={endStroke}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={undo}
                disabled={strokes.length === 0}
                aria-label={t("undo")}
                title={t("undo")}
                className={toolButton}
              >
                <HugeiconsIcon icon={Undo02Icon} size={17} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={redoStack.length === 0}
                aria-label={t("redo")}
                title={t("redo")}
                className={toolButton}
              >
                <HugeiconsIcon icon={Redo02Icon} size={17} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={clear}
                disabled={strokes.length === 0}
                aria-label={t("clear")}
                title={t("clear")}
                className={toolButton}
              >
                <HugeiconsIcon icon={Delete02Icon} size={17} strokeWidth={1.5} />
              </button>
            </div>

            {errorMessage && (
              <p className="text-[0.85rem] leading-snug text-accent" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="font-jetbrains text-[0.8rem] md:text-[0.9rem] py-2 px-3.5 rounded-[10px] border border-elevation_four bg-elevation_one text-text_primary cursor-pointer transition hover:brightness-110 offset_ring"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="font-jetbrains text-[0.8rem] md:text-[0.9rem] py-2 px-3.5 rounded-[10px] border border-elevation_four bg-accent text-bg_color cursor-pointer transition hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 offset_ring"
              >
                {saving ? t("saving") : t("place")}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignatureModal;
