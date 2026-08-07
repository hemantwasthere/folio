"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import SynthKeyboard from "@/components/sections/synth/synth-keyboard";
import SynthScreen from "@/components/sections/synth/synth-screen";
import {
  INSTRUMENTS,
  NOTES,
  SynthEngine,
  type SynthNote,
} from "@/lib/synth";

/** Computer-keyboard key → the note it plays. */
const KEYED_NOTES = new Map(NOTES.map((note) => [note.key, note]));

/** How many notes fit across the staff on the screen. */
const STAFF_NOTES = 4;

/**
 * Media queries the render depends on. `useSyncExternalStore` rather than an
 * effect so the server and the hydrating client agree on a value first and the
 * real one arrives in the same pass, instead of as a second render.
 */
const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
};

/**
 * A playable synth, because a portfolio is allowed to have a toy in it.
 * Inspired by the one on ky.fyi — the sound engine, the artwork and the layout
 * here are all our own, and everything is synthesised in the browser so it
 * ships no audio files.
 */
const Synth: React.FC = () => {
  const t = useTranslations("Synth");

  const [instrument, setInstrument] = useState(0);
  // The screen is a PLAY button until this flips, exactly like the machine it
  // is modelled after — which also means no AudioContext exists until someone
  // has actually asked for one.
  const [enabled, setEnabled] = useState(false);
  const [pressed, setPressed] = useState<ReadonlySet<string>>(new Set());
  // The last few notes, oldest first — the screen writes them out like a bar of
  // music rather than showing one at a time.
  const [history, setHistory] = useState<readonly string[]>([]);

  // The letters label computer-keyboard shortcuts, so they are noise on a
  // device that does not have one.
  const showLetters = !useMediaQuery("(pointer: coarse)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SynthEngine | null>(null);
  const spinRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Whether a pointer is currently held down, so entering a key mid-drag knows
  // whether it should sound.
  const draggingRef = useRef(false);

  const engine = () => (engineRef.current ??= new SynthEngine());

  useEffect(
    () => () => {
      if (spinRef.current) clearTimeout(spinRef.current);
      engineRef.current?.dispose();
      engineRef.current = null;
    },
    []
  );

  const press = useCallback(
    (note: SynthNote) => {
      setPressed((current) => {
        if (current.has(note.id)) return current;

        const next = new Set(current);
        next.add(note.id);
        return next;
      });

      setHistory((current) => [...current, note.id].slice(-STAFF_NOTES));
      engine().play(note.id, INSTRUMENTS[instrument].id);
    },
    [instrument]
  );

  const release = useCallback((note: SynthNote) => {
    setPressed((current) => {
      if (!current.has(note.id)) return current;

      const next = new Set(current);
      next.delete(note.id);
      return next;
    });

    engineRef.current?.release(note.id);
  }, []);

  const onPointerDownKey = useCallback(
    (note: SynthNote) => {
      draggingRef.current = true;
      press(note);
    },
    [press]
  );

  const onPointerEnterKey = useCallback(
    (note: SynthNote) => {
      if (draggingRef.current) press(note);
    },
    [press]
  );

  // A pointer released anywhere — including outside the keyboard — has to let
  // every held key go, otherwise a drag off the edge leaves notes stuck down.
  useEffect(() => {
    const stop = () => {
      draggingRef.current = false;
      setPressed(new Set());
      engineRef.current?.releaseAll();
    };

    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);

    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("blur", stop);
    };
  }, []);

  const step = useCallback((by: number) => {
    setInstrument(
      (current) => (current + by + INSTRUMENTS.length) % INSTRUMENTS.length
    );
    engineRef.current?.blip();
  }, []);

  /**
   * The instrument name is a slot machine: spin the list, slowing down under
   * friction, and land wherever it stops.
   */
  const shuffle = useCallback(() => {
    if (spinRef.current) return;

    engine().resume();
    posthog.capture("Synth instrument shuffled", { Clicked: true });

    if (reducedMotion) {
      setInstrument(Math.floor(Math.random() * INSTRUMENTS.length));
      engine().chime();
      return;
    }

    let speed = 40;
    // A random head start, so two spins never feel like the same animation.
    const pull = 5 + Math.floor(Math.random() * 22);
    let ticks = 0;

    const advance = () => {
      setInstrument((current) => (current + 1) % INSTRUMENTS.length);
      engine().blip();
      ticks += 1;

      speed *= 1.3;
      if (ticks <= pull) speed *= 0.8;

      if (speed >= 480) {
        spinRef.current = null;
        engine().chime();
        return;
      }

      spinRef.current = setTimeout(advance, speed);
    };

    spinRef.current = setTimeout(advance, speed);
  }, [reducedMotion]);

  /** Hitting PLAY wakes the screen and spins for an instrument. */
  const start = useCallback(() => {
    if (enabled) return;

    setEnabled(true);
    posthog.capture("Synth started", { Clicked: true });
    shuffle();
  }, [enabled, shuffle]);

  // Computer keyboard, but only while the synth itself has focus — otherwise
  // typing anywhere on the page would set it off.
  useEffect(() => {
    const focused = () =>
      Boolean(
        containerRef.current &&
          document.activeElement &&
          containerRef.current.contains(document.activeElement)
      );

    const down = (event: KeyboardEvent) => {
      if (!focused() || event.metaKey || event.ctrlKey || event.altKey) return;

      // Keyboard equivalent of clicking PLAY, since the screen is the only way
      // in and it is not itself focusable.
      if (!enabled) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          start();
        }
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        step(event.key === "ArrowLeft" ? -1 : 1);
        return;
      }

      const note = KEYED_NOTES.get(event.key.toLowerCase());
      if (!note) return;

      event.preventDefault();
      // Held keys auto-repeat, but a note only starts once.
      if (!event.repeat) press(note);
    };

    const up = (event: KeyboardEvent) => {
      const note = KEYED_NOTES.get(event.key.toLowerCase());
      if (note) release(note);
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [enabled, press, release, start, step]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: "linear" } }}
      transition={{ duration: 0.3, ease: "linear" }}
      // The extra top padding buys air above the heading: the repos grid ends
      // flush, and this wants to read as a break from the portfolio rather than
      // the next item in it.
      className="wrapper pt-10 md:pt-16 pb-5 md:pb-0"
      id="play"
    >
      <div className="title flex justify-start mt-0 md:justify-center">
        <h2 className="inline-block mb-4">
          <span className="text-accent">{t("noise")}</span>:{t("maker")}
        </h2>
      </div>

      <div className="flex flex-col items-center mb-8 md:mb-12">
        <div
          ref={containerRef}
          tabIndex={0}
          // It swallows letter keys while focused, which is exactly what
          // `application` tells a screen reader to expect. The instructions are
          // the visible hint below rather than a second, hidden copy.
          role="application"
          aria-label={t("label")}
          aria-describedby="synth-hint"
          onPointerDown={() => engine().resume()}
          className="synth w-full max-w-[34rem] rounded-2xl offset_ring"
        >
          <svg
            viewBox="0 0 320 198"
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible touch-none select-none"
            aria-hidden="true"
          >
            <rect
              className="fill-[var(--synth-shell)] stroke-[var(--synth-edge)]"
              x={2}
              y={2}
              width={316}
              height={194}
              rx={16}
              strokeWidth={2.5}
            />
            <SynthScreen
              enabled={enabled}
              instrumentId={INSTRUMENTS[instrument].id}
              instrumentName={t(`instruments.${INSTRUMENTS[instrument].id}`)}
              history={history}
              startLabel={t("start")}
              prevLabel={t("previous")}
              nextLabel={t("next")}
              shuffleLabel={t("shuffle")}
              onStart={start}
              onPrev={() => step(-1)}
              onNext={() => step(1)}
              onShuffle={shuffle}
            />
            <SynthKeyboard
              pressed={pressed}
              enabled={enabled}
              showLetters={showLetters}
              onPress={onPointerDownKey}
              onRelease={release}
              onEnter={onPointerEnterKey}
            />
          </svg>
        </div>

        <p
          id="synth-hint"
          className="mt-3.5 max-w-[34rem] text-center text-[0.75rem] md:text-[0.85rem] font-jetbrains"
        >
          {!enabled
            ? t("hintIdle")
            : showLetters
              ? t("hint")
              : t("hintTouch")}
        </p>
      </div>
    </motion.section>
  );
};

export default Synth;
