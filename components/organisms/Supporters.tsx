"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

import { getSupportersData } from "@/data/supporters";
import Tooltip from "../atoms/Tooltip";

const Supporters: React.FC = () => {
  const t = useTranslations("Supporters");

  const supporters = getSupportersData();

  return (
    <section className="wrapper">
      <div className="flex flex-col items-start md:items-center mt-0 mb-6">
        <h2>{t("supporters")}</h2>
        <p>{t("thankyou")}!</p>
      </div>

      <div className="flex flex-wrap justify-start gap-8 mb-12 md:justify-center">
        {supporters.map(({ name, icon, href, message }, i) => (
          <div key={name}>
            <Tooltip tip={message}>
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
    </section>
  );
};

export default Supporters;
