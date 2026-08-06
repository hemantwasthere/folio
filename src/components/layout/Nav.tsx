"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";
import React from "react";

import { cn } from "@/lib/utils";
interface NavProps {
  href: string;
  section: string;
  isSelected: boolean;
}

const Nav: React.FC<NavProps> = ({ href, section, isSelected }) => {
  const src = href === "#home" ? "home" : href === "#about" ? "about" : "work";

  return (
    <Link
      href={href}
      className={cn(
        "no-underline list-none font-jetbrains rounded-[100px] active:scale-95 offset_ring shrink-0"
      )}
      onClick={() => {
        posthog.capture(`"${href}" clicked`, {
          Clicked: true,
        });
      }}
    >
      <div
        className="bg-transparent hover:bg-transparent border-none text-text_secondary text-[1.1rem] select-none flex flex-col items-center gap-[.75rem] py-[13px] sm:px-[25px] rounded-[100px] cursor-pointer md:hover:bg-elevation_four group"
        style={{
          transition:
            "background-color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <div
          className={cn(
            "md:hidden delay-[.3s] py-[6px] px-[24px] rounded-[100px] md:p-0",
            {
              "bg-elevation_four": isSelected,
            }
          )}
          style={{
            transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <Image
            className={cn(
              "scale-[0.95] delay-[.3s] group-hover:text-text_primary group-hover:opacity-100 group-active:opacity-100 flex items-center justify-center opacity-50",
              {
                "opacity-100 text-text_primary": isSelected,
              }
            )}
            src={`/icons/${src}.svg`}
            alt={src}
            width={24}
            height={24}
            style={{
              transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          />
        </div>
        <h5
          className={cn(
            "delay-[.5s] group-hover:text-text_primary group-hover:opacity-100 opacity-80",
            {
              "text-text_primary opacity-100": isSelected,
            }
          )}
          style={{
            transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {section}
        </h5>
      </div>
    </Link>
  );
};

export default Nav;
