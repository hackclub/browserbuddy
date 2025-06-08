// hooks/useTimer.js
import { useState, useEffect, useCallback, useRef } from "react";
import { TimerService } from "./timerService";

export const useTimer = (initialDuration) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleTimerComplete = useCallback(() => {
    setIsComplete(true);
    setIsActive(false);
  }, []);

  useEffect(() => {
    const newTimer = new TimerService(
      initialDuration,
      (time) => setTimeRemaining(time),
      handleTimerComplete
    );
    setTimer(newTimer);

    return () => {
      newTimer.cleanup();
    };
  }, [initialDuration, handleTimerComplete]);

  const start = useCallback(() => {
    if (timer) {
      timer.start();
      setIsActive(true);
    }
  }, [timer]);

  const pause = useCallback(() => {
    if (timer) {
      timer.pause();
      setIsActive(false);
    }
  }, [timer]);

  const stop = useCallback(() => {
    if (timer) {
      timer.stop();
      setIsComplete(false);
      setIsActive(false);
    }
  }, [timer, isComplete]);

  const getProgress = useCallback(() => {
    return timer ? timer.getProgress() : 0;
  }, [timer]);

  return {
    timeRemaining,
    isActive,
    start,
    pause,
    stop,
    getProgress,
    isComplete,
  };
};
