import React from "react";
// import useSound from "use-sound";
// import clicksound from "../../public/sounds/click.mp3";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children }) => {
  // const [play] = useSound("../../public/sounds/click.mp3", {
  //     volume: 1
  // });

  return (
    <button
      // onClick={play}
      style={{
        transition:
          "filter 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
      className="rounded-[16px] flex items-center justify-center relative w-full sm:w-max cursor-pointer bg-elevation_one select-none mt-5 py-4 px-8 md:py-4 md:pr-8 md:pl-12 text-accent font-[300] text-[18px] md:text-[1.6rem] font-jetbrains tracking-[-.075em] border border-elevation_four active:scale-[95%] hover:brightness-[110%] offset_ring"
    >
      <span className='hidden md:block absolute rounded-tl-[16px] rounded-bl-[16px] top-0 left-0 content-[""] h-full w-[1.6rem] bg-accent' />
      {children}
    </button>
  );
};

export default Button;
