"use client";

import { useTheme } from "next-themes";

import Tooltip from "./tooltip";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Tooltip
      tip="🌕 yoo, u've found an easter 🥚"
      className="absolute right-[63.7%] -top-4 md:right-[21%] md:-top-2"
    >
      <button
        tabIndex={-1}
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="w-6 h-6 rounded-full animate-bounce delay-500 border-4 transition-all bg-[var(--toggle-fill)] border-[var(--toggle-ring)] offset_ring"
      />
    </Tooltip>
  );
};

export default ThemeToggle;
