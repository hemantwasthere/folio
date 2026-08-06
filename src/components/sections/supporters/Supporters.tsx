"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

import { getSupportersData } from "@/data/supporters";
import Tooltip from "@/components/ui/Tooltip";

const Supporters: React.FC = () => {
  const t = useTranslations("Supporters");

  const supporters = getSupportersData();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: "linear" } }}
      transition={{ duration: 0.3, ease: "linear" }}
      className="wrapper"
    >
      <div className="flex flex-col items-start md:items-center mt-0 mb-6">
        <h2>{t("supporters")}</h2>
        <p>{t("thankyou")}!</p>
      </div>

      <div className="flex flex-wrap justify-start gap-8 mb-12 md:justify-center">
        {supporters.map(({ name, icon, href, message }) => (
          <div key={name}>
            <Tooltip tip={message} tabIndex={2}>
              <div className="flex flex-col items-center gap-2">
                <Link
                  href={href}
                  className="offset_ring rounded-full"
                  onClick={() => {
                    posthog.capture(`Supporter(${name}) link clicked`, {
                      Clicked: true,
                    });
                  }}
                >
                  <Image
                    src={icon}
                    alt={name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                </Link>
                <h6>{name}</h6>
              </div>
            </Tooltip>
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default Supporters;
