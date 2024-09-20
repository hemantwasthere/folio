"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import Tooltip from "./Tooltip";

const ThemeToggle = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return (
    <Tooltip tip="🌕 yoo, u've found an easter 🥚" className="absolute right-[63.7%] -top-4 md:right-[21%] md:-top-2">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="w-6 h-6 rounded-full animate-bounce delay-500 border-4 transition-all bg-[#ffeccf] border-[#ffbb52] dark:bg-[#bc938c] dark:border-[#845443] offset_ring"
      />
    </Tooltip>
  );
};

export default ThemeToggle;
