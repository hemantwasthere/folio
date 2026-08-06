'use client'

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import Tooltip from "@/components/ui/Tooltip";
import BlogGrid from "@/components/sections/blog/BlogGrid";

const Blog: React.FC = () => {
  const t = useTranslations("Blog");

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: "linear" } }}
      transition={{ duration: 0.3, ease: "linear" }}
    >
      <div
        className="wrapper flex justify-start mt-0 !mb-[0.3rem] md:mb-0 md:justify-center before:content-['&&'] before:h-[300px] before:text-[175px] before:font-[700] before:-z-10 before:select-none before:translate-x-[-25%] before:translate-y-[-20%] sm:before:translate-x-[-310%] sm:before:translate-y-[-28%] webkit_text_stroke before:opacity-[0.25] before:tracking-[-0.075em] before:absolute
        text-transparent"
        id="aw"
      >
        <Tooltip tip={t("blogTooltip")} tabIndex={2}>
          <h2 className="inline-block mb-4">
            <span className="text-accent">{t("blog")}</span>:{t("work")}
          </h2>
        </Tooltip>
      </div>
      <BlogGrid />
    </motion.section>
  );
};

export default Blog;
