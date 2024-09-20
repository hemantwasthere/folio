"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import posthog from "posthog-js";
import React, { useEffect, useState, useTransition } from "react";

import Tooltip from "@/components/atoms/Tooltip";
import { setUserLocale } from "@/services/locale";
import RichPresence from "../molecules/RichPresence";

interface AboutProps {
  currentLocale: string;
}

const About: React.FC<AboutProps> = ({ currentLocale }) => {
  const [age, setAge] = useState<ReturnType<typeof getAge>>();
  const t = useTranslations("About");


  const [isPending, startTransition] = useTransition();

  const locale = useLocale();

  console.log(currentLocale)

  // i didnt write this idk
  const getAge = () => {
    let birthDate = new Date("2003/11/16");
    const ageMs = Date.now() - birthDate.getTime();
    const preciseAge = (ageMs / 31536000000).toFixed(10);
    return preciseAge;
  };

  useEffect(() => {
    setAge(getAge());
    setInterval(() => {
      setAge(getAge());
    }, 1000);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: "linear" } }}
      transition={{ duration: 0.3, ease: "linear" }}

      id="about"
      className="wrapper flex flex-col md:flex-row mb-24 md:grid grid-cols-[1fr_1fr] md:items-center gap-16"
    >

      <RichPresence />

      <div
        className="relative leading-[1.75rem] 
            before:content-['hem'] before:h-[300px] before:text-[150px] before:font-[700] before:-z-10 before:select-none before:translate-x-[130%] before:translate-y-[8%] webkit_text_stroke before:opacity-[0.22] before:absolute
            after:content-['ant'] after:h-[300px] after:text-[200px] after:font-[700] after:-z-10 after:select-none after:translate-x-[140%] after:translate-y-[-35%] webkit_text_stroke_after after:opacity-[0.22] after:absolute"
      >
        <h2 className="md:hidden mb-4 md:mt-4 md:mb-0">bio</h2>
        <div className="text-text_secondary font-[300] text-[1.1rem] tracking-[-0rem] leading-[1.75rem]">
          {t("about1")}{" "}
          {age && (
            <Tooltip tip={age} tabIndex={3}>
              <span className="bio_span">{Math.floor(Number(age))}</span>
            </Tooltip>
          )}
          {" "}{t("about2")}{" "}<span className="bio_span">2021</span>{" "}
          {t("about3")}<span className="bio_span">2022</span>{" "}
          {t("about4")}{" "}
          <Tooltip tip="🤓" tabIndex={2}>
            <Link
              className="no-underline offset_ring rounded-[7px]"
              href="https://github.com/hemantwasthere"
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                posthog.capture('"open source" link clicked', {
                  Clicked: true,
                });
              }}
            > <span className="bio_span">open source</span>
            </Link>
          </Tooltip>{" "}

          {t("about5")}

          {currentLocale === "ja" && (
            <Tooltip tip="🦀 yoo, u've found an easter 🥚!">
              <button tabIndex={-1} className="hover:underline" onClick={() => {
                startTransition(() => {
                  setUserLocale(locale === "en" ? "ja" : "en");
                });
              }}>
                rust
              </button>
            </Tooltip>
          )}

          {t("about6")}

          {currentLocale === "en" && (
            <>
              <Tooltip tip="🦀 demn, u've found another easter 🥚 too!">
                <button tabIndex={-1} className="hover:underline" onClick={() => {
                  startTransition(() => {
                    setUserLocale(locale === "en" ? "ja" : "en");
                  });
                }}>
                  rust
                </button>
              </Tooltip>
              .
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default About;
