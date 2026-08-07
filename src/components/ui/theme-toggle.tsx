"use client";

import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

import Tooltip from "./tooltip";
import { CurrentLocaleProps } from "../sections/about/about";

const ThemeToggle: React.FC<CurrentLocaleProps> = ({ currentLocale }) => {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    /* The offsets are percentages of the name's own width, so the dot keeps
       tracking the "t" as the heading scales between breakpoints. */
    <Tooltip
      tip="🌕 yoo, u've found an easter 🥚"
      className={cn("absolute right-[0.5%] -top-6 md:right-[3.7%] md:-top-7", {
        "right-[14%]! -top-10!": currentLocale === 'ja'
      })}
    >
      <button
        tabIndex={-1}
        aria-label="Toggle theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="w-6 h-6 rounded-full animate-bounce delay-500 border-4 transition-all cursor-pointer bg-(--toggle-fill) border-(--toggle-ring) offset_ring"
      />
    </Tooltip>
  );
};

export default ThemeToggle;
