'use client'

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import DiscoverButton from "@/components/atoms/DiscoverButton";
import HeroImage from "@/components/atoms/HeroImage";
import Socials from "@/components/molecules/Socials";
import { cn } from "@/lib/utils";
import { setUserLocale } from "@/services/locale";
import ThemeToggle from "../atoms/ThemeToggle";

const Hero: React.FC = () => {
  const t = useTranslations("Hero");
  const [isPending, startTransition] = useTransition();

  const locale = useLocale();

  return (
    <section
      id="home"
      className={cn("wrapper scroll-mt-[20rem] block sm:flex justify-between items-center mb-[2.75rem] md:mb-[5.75rem] mt-[4rem] sm:mt-[5rem] md:mt-[6.5rem] lg:mt-[7rem]",
        isPending && 'pointer-events-none opacity-60')}
    >
      <button onClick={() => {
        startTransition(() => {
          setUserLocale(locale === "en" ? "ja" : "en");
        });
      }}>
        change locale: ({locale})
      </button>
      <div className="relative w-fit">
        <h1 className='before:content-["///"] before:h-[300px] before:text-[175px] before:font-[700] before:-z-10 before:select-none before:translate-x-[-95%] before:translate-y-0 webkit_text_stroke before:opacity-[0.25] before:tracking-[-.1em] before:absolute text-[65px] md:text-[96px] text-text_primary font-semibold w-fit'>
          {t("name")}
        </h1>
        <ThemeToggle />
        <h4 className="mt-4 text-[22px] md:text-[26px]">
          {t("innovative")} Frontend  {t("wizard")}.
          <br className="hidden md:block" /> {t("transforming")}
        </h4>
        <div className="mt-4 mb-[1.7rem]">
          <Socials />
        </div>
        <DiscoverButton buttonTitle={t("discover")} />
      </div>
      <HeroImage />
    </section>
  );
};

export default Hero;
