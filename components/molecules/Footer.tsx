"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import posthog from "posthog-js";

import Tooltip from "../atoms/Tooltip";
import Socials from "./Socials";

const Footer: React.FC = () => {
  const t = useTranslations("Footer");

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: "linear" } }}
      transition={{ duration: 0.3, ease: "linear" }}
      className="wrapper"
    >
      <hr className="h-[1px] border-none w-full mb-6 md:mb-8 bg-elevation_one" />
      <div className="pb-[2.4rem] flex flex-col justify-between items-center md:flex-row">
        <Socials />
        <h6 className="text-center leading-10 mt-0 font-jetbrains">
          {t("madewithpain")}. &#60;3
          <Tooltip tip={t("youarehere")} tabIndex={2}>
            <span className="rounded-[7px] py-[0.15rem] px-[0.5rem] w-fit ml-4 mr-[0.4rem] font-jetbrains bg-elevation_one">
              V2
            </span>
          </Tooltip>
          <Tooltip tip={t("howtodelete")} tabIndex={2}>
            <Link
              className="transition-[0.3s_var(--bezier-one)] no-underline font-[0.9rem] rounded-[7px] py-[0.15rem] px-[0.5rem] hover:font-[400] hover:w-fit text-tex font-jetbrains hover:text-elevation_one hover:bg-accent offset_ring"
              href="https://v1.hemant.lol"
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                posthog.capture("Footer V1 link clicked", {
                  Clicked: true,
                });
              }}
            >
              V1
            </Link>
          </Tooltip>
        </h6>
      </div>
    </motion.footer>
  );
};

export default Footer;
