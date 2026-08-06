import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import Nav from "@/components/layout/Nav";

const NavHost: React.FC = () => {
  // getting the scroll position
  const [y, setY] = useState(0);

  const handleNavigation = () => {
    const windowScroll = window.scrollY;
    setY(windowScroll);
  };

  const t = useTranslations("Nav");

  useEffect(() => {
    window.addEventListener("scroll", handleNavigation);
    return () => {
      window.removeEventListener("scroll", handleNavigation);
    };
  }, []);

  return (
    <nav className="flex items-center justify-center">
      <div
        className={cn(
          "bottom-0 top-auto p-0 bg-elevation_one w-full md:w-160 rounded-t-xl md:rounded-xl text-center items-center fixed md:top-0 md:bottom-auto md:py-5 z-15 md:bg-bg_color",
          {
            "md:border-none md:border-b-accent_opacity": y < 20,
            "md:border-b-[1.5px] md:border-b-accent_opacity md:py-2 md:mt-2 md:w-136 md:bg-elevation_five md:backdrop-blur-[15px] webkit_backdrop_filter_15px":
              y > 20,
          }
        )}
        style={{
          transition: "all 0.5s ease",
        }}
      >
        <div className="flex gap-[2vw] md:gap-16 justify-evenly md:justify-center">
          <Nav href="#home" section="/" isSelected={y < 300} />
          <Nav href="#about" section={t("about")} isSelected={y > 300 && y < 550} />
          <Nav href="#work" section={t("work")} isSelected={y > 550} />
        </div>
      </div>
    </nav>
  );
};

export default NavHost;
