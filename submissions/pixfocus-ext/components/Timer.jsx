import React, { useEffect, useState } from "react";
import useThemeStore from "@/store/themeStore";
import useTimerStore from "@/store/timerStore";

const Timer = ({ time }) => {
  const colors = useThemeStore((state) => state.colors);
  const duration = useTimerStore((state) => state.duration);
  const [displayTime, setDisplayTime] = useState(time);

  useEffect(() => {
    if (!time && duration) {
      setDisplayTime(duration);
    } else {
      setDisplayTime(time);
    }
  }, [time, duration]);

  const formatTimeDisplay = (seconds) => {
    if (!seconds) return "00:00";
    const totalMinutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${totalMinutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="text-5xl font-pixelmed" style={{ color: colors.text }}>
      {formatTimeDisplay(displayTime)}
    </div>
  );
};

export default Timer;
