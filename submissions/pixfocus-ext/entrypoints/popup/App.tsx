import React, { useEffect, useState } from "react";
import "./style.css";
import { TimerArt } from "@/components/TimerArtWeb";
import Timer from "@/components/Timer";
import useTimerStore from "@/store/timerStore";
import useThemeStore from "@/store/themeStore";
import { useTimer } from "@/components/useTimer";
import SplitButton from "@/components/SplitButton";
import { Link } from "react-router";

function App() {
  // Move the hook inside the component
  const duration = useTimerStore((state) => state.duration);
  const [isSplit, setIsSplit] = useState(false);

  const {
    timeRemaining,
    isActive,
    start,
    pause,
    stop,
    getProgress,
    isComplete,
  } = useTimer(duration);

  // Update split button state based on timer status
  useEffect(() => {
    setIsSplit(!isActive);
  }, [isActive]);

  // Define actions for the SplitButton
  const mainAction = {
    onPress: pause,
  };

  const leftAction = {
    onPress: start,
  };

  const rightAction = {
    onPress: stop,
  };

  const colors = useThemeStore((state) => state.colors);
  const currentVariant = useThemeStore((state) => state.currentTheme);

  return (
    <div
      className="w-[400px] h-[500px] flex flex-col items-center justify-center"
      style={{ backgroundColor: colors.primary }}
    >
      <Link
        to="/variants"
        className="cursor-pointer hover:opacity-90 transition-opacity"
      >
        <TimerArt
          variant={currentVariant || "COFFEE_CUP"}
          progress={getProgress()}
        />
      </Link>
      <Link to="/configure">
        <Timer time={timeRemaining} />
      </Link>

      <div className="p-8 w-full">
        <SplitButton
          mainAction={mainAction}
          leftAction={leftAction}
          rightAction={rightAction}
          splitted={isSplit}
        />
      </div>
    </div>
  );
}

export default App;
