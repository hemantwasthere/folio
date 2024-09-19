"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-6 h-6 rounded-full absolute right-[63.7%] -top-4  md:right-[21%] md:-top-2 animate-bounce delay-500 border-4 transition-all bg-[#ffeccf] border-[#ffbb52] dark:bg-[#bc938c] dark:border-[#845443]"
    />
  );
};

export default ThemeToggle;
