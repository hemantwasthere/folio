"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

import Tooltip from "@/components/ui/tooltip";
import {
  getSignatureInkOpacity,
  getSignatureOrder,
  getSignatureRotation,
} from "@/lib/signatures";
import type { Signature } from "@/types";

interface SignatureWallProps {
  signatures: Signature[];
  loading: boolean;
  errorMessage: string;
  connected: boolean;
  authWaiting: boolean;
  alreadySigned: boolean;
  signedInEmail: string;
  onOpen: () => void;
  onSignOut: () => void;
}

const SignatureWall: React.FC<SignatureWallProps> = ({
  signatures,
  loading,
  errorMessage,
  connected,
  authWaiting,
  alreadySigned,
  signedInEmail,
  onOpen,
  onSignOut,
}) => {
  const t = useTranslations("Signatures");
  // The wall is headed by the site owner's name, so it reads as your page that
  // people are signing. Pulled from Hero rather than duplicated per namespace.
  const hero = useTranslations("Hero");

  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);

  // Newest-first from the query, but the wall reads better scattered — and the
  // order has to be stable, so it is derived from the id rather than shuffled.
  const scattered = useMemo(
    () =>
      [...signatures].sort(
        (a, b) => getSignatureOrder(a.id) - getSignatureOrder(b.id)
      ),
    [signatures]
  );

  // Every other row is nudged sideways so the columns do not line up into a
  // visible grid. That needs the real column count, which only `auto-fill`
  // knows, so it is read back off the computed style.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const measure = () => {
      const template = window.getComputedStyle(grid).gridTemplateColumns;
      setColumns(Math.max(1, template.split(" ").filter(Boolean).length));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
      {/* Deliberately outside `.wrapper` so the rule runs the full width of the
          viewport rather than stopping at the content column — it is closing off
          the portfolio, not dividing a section within it. */}
      <hr className="w-full h-px border-none bg-elevation_one mt-14 mb-9 md:mt-20 md:mb-10" />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3, ease: "linear" } }}
        transition={{ duration: 0.3, ease: "linear" }}
        id="sign"
        className="wrapper mb-8 md:mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-3.5 md:mb-5">
          <div>
            <h2 className="text-[clamp(2.35rem,4vw,2.8rem)] leading-none">
              {hero("name")}
            </h2>
            <p className="mt-2 text-[0.85rem] md:text-[0.95rem]">{t("prompt")}</p>
          </div>

          {/* Signing is one-per-account, so once you have, the only way to add
              another is with a different account — the button becomes the way
              out of this one rather than disappearing. */}
          <button
            type="button"
            onClick={alreadySigned ? onSignOut : onOpen}
            disabled={authWaiting}
            className="self-start shrink-0 font-jetbrains text-[0.85rem] md:text-base py-2.5 px-4 rounded-xl border border-elevation_four bg-elevation_one text-text_primary cursor-pointer transition-[filter,transform] duration-200 hover:brightness-110 hover:-translate-y-px active:scale-[97%] disabled:opacity-70 disabled:cursor-progress disabled:translate-y-0 offset_ring"
          >
            {authWaiting
              ? t("waiting")
              : alreadySigned
                ? `${t("signOut")} ↗`
                : `${t("add")} ↗`}
          </button>
        </div>

        {!connected ? (
          <p className="mb-3 text-[0.9rem]">{t("notConnected")}</p>
        ) : loading ? (
          <p className="mb-3 text-[0.9rem]">{t("loading")}</p>
        ) : alreadySigned ? (
          <p className="mb-3 text-[0.9rem]">
            {signedInEmail
              ? t("alreadySignedAs", { email: signedInEmail })
              : t("alreadySigned")}
          </p>
        ) : (
          scattered.length === 0 && (
            <p className="mb-3 text-[0.9rem]">{t("empty")}</p>
          )
        )}

        {errorMessage && (
          <p className="mb-3 text-[0.9rem] text-accent" role="alert">
            {errorMessage}
          </p>
        )}

        <div
          ref={gridRef}
          aria-live="polite"
          className="grid items-center gap-x-2 gap-y-1 md:gap-x-2.5 md:gap-y-1.5 min-h-22 md:min-h-34 pr-2 md:pr-3 grid-cols-[repeat(auto-fill,minmax(84px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(130px,1fr))]"
        >
          {scattered.map((signature, index) => (
            <div
              key={signature.id}
              className="flex justify-center"
              style={{
                // Odd rows only, so the offset alternates down the wall.
                transform:
                  columns > 1 && Math.floor(index / columns) % 2 === 1
                    ? "translateX(12px)"
                    : undefined,
              }}
            >
              <Tooltip
                tip={
                  signature.message?.trim()
                    ? `[${signature.name}] ${signature.message.trim()}`
                    : signature.name
                }
                tabIndex={2}
              >
                <span
                  className="signature_item block"
                  aria-label={t("signatureBy", { name: signature.name })}
                  role="img"
                  style={
                    {
                      "--signature-rotation": `${getSignatureRotation(signature.id)}deg`,
                    } as React.CSSProperties
                  }
                >
                  <span
                    aria-hidden="true"
                    className="signature_ink"
                    style={
                      {
                        "--signature-image": `url('${signature.signature_data}')`,
                        "--signature-opacity": getSignatureInkOpacity(
                          signature.id
                        ),
                      } as React.CSSProperties
                    }
                  />
                </span>
              </Tooltip>
            </div>
          ))}
        </div>
      </motion.section>
    </>
  );
};

export default SignatureWall;
