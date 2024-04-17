import React, { useEffect } from "react";

// Add the click sound file path here (you can use a sound file of your choice)
const clickSoundFilePath = "../../public/sounds/lol_click.ogg";

interface ClickProps {
  children: React.ReactNode;
}

const Click: React.FC<ClickProps> = ({ children }) => {
  useEffect(() => {
    const audio = new Audio(clickSoundFilePath);

    // Function to play the click sound
    const playClickSound = () => {
      audio.currentTime = 0;
      audio
        .play()
        .catch((error) => console.error("Error playing click sound:", error));
    };

    // Attach the click event listener to the document
    document.addEventListener("click", playClickSound);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", playClickSound);
    };
  }, []);

  return <>{children}</>;
};

export default Click;
