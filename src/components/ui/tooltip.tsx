import { useState } from "react";

import { cn } from "@/lib/utils";

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  tip: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  tip,
  active,
  children,
  className,
  ...props
}) => {
  const [isHover, setIsHover] = useState(false);

  return (
    <div className={cn("relative inline-block", className)}>
      <p
        style={{
          transition:
            "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out, margin-top 0.2s ease-in-out",
        }}
        className={cn(
          "font-normal font-jetbrains text-sm absolute inline-block whitespace-nowrap opacity-0 left-[50%] top-0 leading-normal translate-x-[-50%] translate-y-[-120%] py-[0.15rem] px-2 rounded-md bg-accent text-elevation_one text-[.9rem] tracking-[-.075em] after:border-solid after:border-transparent after:border-l-10 after:border-r-10 after:border-t-10 after:border-t-accent after:-bottom-2 after:content-[' '] after:h-0 after:w-0 after:left-[50%] after:-ml-2.5 after:absolute z-50",
          {
            "opacity-100 -mt-2 visible": isHover || active,
          }
        )}
      >
        {tip}
      </p>
      <div
        className="offset_ring"
        onMouseOver={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onFocus={() => setIsHover(true)}
        onBlur={() => setIsHover(false)}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export default Tooltip;
