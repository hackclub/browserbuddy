import React, { useState, useEffect } from "react";
import "./ErrorMessage.css";
import errorSound from "../../assets/sound/error-message.mp3";
export default function Component({ message, duration = 5000, onClose }) {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const slideInTimeout = setTimeout(() => setIsVisible(true), 50);
    const errorAudio = new Audio(errorSound);
    errorAudio.play();
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress <= 0) {
          clearInterval(interval);
          setIsVisible(false);
          setTimeout(onClose, 300);
          return 0;
        }
        return prevProgress - 100 / (duration / 100);
      });
    }, 100);

    return () => {
      clearTimeout(slideInTimeout);
      clearInterval(interval);
    };
  }, [duration, onClose]);

  return (
    <div className={`error-message ${isVisible ? "visible" : ""}`}>
      <p>{message}</p>
      <div className="slider" style={{ width: `${progress}%` }}></div>
    </div>
  );
}
