'use client'

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import DiscoverButton from "@/components/sections/hero/discover-button";
import HeroImage from "@/components/sections/hero/hero-image";
import Socials from "@/components/ui/socials";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/theme-toggle";

const Hero: React.FC = () => {
  const t = useTranslations("Hero");

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: "linear" } }}
      transition={{ duration: 0.3, ease: "linear" }}
      id="home"
      className={cn("wrapper scroll-mt-80 block sm:flex justify-between items-center mb-11 md:mb-23 mt-16 sm:mt-20 md:mt-26 lg:mt-28",
        false && 'pointer-events-none opacity-60')}
    >
      <div className="relative w-fit">
        <h1 className='before:content-["///"] before:h-75 before:text-[175px] before:font-bold before:-z-10 before:select-none before:translate-x-[-95%] before:translate-y-0 webkit_text_stroke before:opacity-25 before:-tracking-widest before:absolute text-[65px] md:text-[96px] text-text_primary font-semibold w-fit'>
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
    </motion.section>
  );
};

export default Hero;
