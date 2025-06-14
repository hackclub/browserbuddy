import React, { useEffect, useState } from "react";
import useTimerStore from "@/store/timerStore";
import useThemeStore from "@/store/themeStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface DurationPickerProps {
  onDurationChange?: (duration: number) => void;
}

const DurationPicker: React.FC<DurationPickerProps> = ({
  onDurationChange,
}) => {
  const colors = useThemeStore((state) => state.colors);
  const duration = useTimerStore((state) => state.duration);
  const setDuration = useTimerStore((state) => state.setDuration);

  const initialTotalMinutes = duration > 0 ? Math.floor(duration / 60) : 30;
  const [minutes, setMinutes] = useState(initialTotalMinutes % 60);
  const [hours, setHours] = useState(Math.floor(initialTotalMinutes / 60));

  useEffect(() => {
    const totalSeconds = (hours * 60 + minutes) * 60;
    setDuration(totalSeconds);
    if (onDurationChange) {
      onDurationChange(totalSeconds);
    }
  }, [hours, minutes, setDuration, onDurationChange]);

  const incrementMinutes = () => {
    if (minutes === 55) {
      setMinutes(0);
      setHours((h) => h + 1);
    } else {
      setMinutes((m) => m + 5);
    }
  };

  const decrementMinutes = () => {
    if (minutes === 0) {
      if (hours > 0) {
        setMinutes(55);
        setHours((h) => h - 1);
      }
    } else {
      setMinutes((m) => m - 5);
    }
  };

  const incrementHours = () => {
    if (hours < 12) setHours((h) => h + 1);
  };

  const decrementHours = () => {
    if (hours > 0) setHours((h) => h - 1);
  };

  const presets = [
    { label: "Pomodoro", value: 25 },
    { label: "Break", value: 5 },
    { label: "Meeting", value: 30 },
    { label: "Focus", value: 45 },
  ];

  const handlePresetClick = (totalMinutes: number) => {
    setHours(Math.floor(totalMinutes / 60));
    setMinutes(totalMinutes % 60);
  };

  const formatTwoDigits = (num: number) => num.toString().padStart(2, "0");

  const brutalistBox = {
    backgroundColor: "#ffffff",
    border: "3px solid #000000",
    borderBottomWidth: "6px",
    borderRightWidth: "6px",
    boxShadow: "3px 3px 0px #000000",
    transform: "none",
    padding: "0.75rem",
  };

  const brutalistButton = {
    backgroundColor: colors.accent || "#ff5d5d",
    border: "2px solid #000000",
    borderBottomWidth: "4px",
    borderRightWidth: "4px",
    boxShadow: "2px 2px 0px #000000",
    transition: "all 0.1s ease",
    transform: "none",
  };

  const brutalistPreset = (isActive: boolean) => ({
    backgroundColor: isActive ? "#ffd166" : "#f0f0f0",
    border: "2px solid #000000",
    borderBottomWidth: isActive ? "4px" : "4px",
    borderRightWidth: isActive ? "4px" : "4px",
    boxShadow: isActive ? "3px 3px 0px #000000" : "2px 2px 0px #000000",
    transform: "none",
    transition: "all 0.2s ease",
  });

  return (
    <div className="flex flex-col items-center w-full space-y-5">
      <div
        className="flex items-center justify-center w-full max-w-xs rounded-md"
        style={brutalistBox}
      >
        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-center">
            <button
              className="w-12 h-12 flex items-center justify-center rounded-md hover:bg-gray-100 active:bg-gray-200 mb-1"
              style={brutalistButton}
              onClick={incrementHours}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "translateY(2px)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "none")}
              aria-label="Increase hours"
            >
              <FontAwesomeIcon icon={faChevronUp} className="h-4 w-4" />
            </button>

            <div
              className="text-3xl font-bold py-1 px-3 rounded-md mx-1 bg-gray-100"
              style={{
                fontFamily: "PixelCodeMedium",
                border: "2px solid #000",
                borderBottomWidth: "4px",
                borderRightWidth: "4px",
              }}
            >
              {formatTwoDigits(hours)}
            </div>

            <button
              className="w-12 h-12 flex items-center justify-center rounded-md hover:bg-gray-100 active:bg-gray-200 mt-1"
              style={brutalistButton}
              onClick={decrementHours}
              disabled={hours === 0}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "translateY(2px)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "none")}
              aria-label="Decrease hours"
            >
              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
            </button>
            <div className="text-xs font-bold">HRS</div>
          </div>

          <div className="text-3xl font-black">:</div>

          <div className="flex flex-col items-center">
            <button
              className="w-12 h-12 flex items-center justify-center rounded-md hover:bg-gray-100 active:bg-gray-200 mb-1"
              style={brutalistButton}
              onClick={incrementMinutes}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "translateY(2px)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "none")}
              aria-label="Increase minutes"
            >
              <FontAwesomeIcon icon={faChevronUp} className="h-4 w-4" />
            </button>

            <div
              className="text-3xl font-bold py-1 px-3 rounded-md mx-1 bg-gray-100"
              style={{
                fontFamily: "PixelCodeMedium",
                border: "2px solid #000",
                borderBottomWidth: "4px",
                borderRightWidth: "4px",
              }}
            >
              {formatTwoDigits(minutes)}
            </div>

            <button
              className="w-12 h-12 flex items-center justify-center rounded-md hover:bg-gray-100 active:bg-gray-200 mt-1"
              style={brutalistButton}
              onClick={decrementMinutes}
              disabled={hours === 0 && minutes === 0}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "translateY(2px)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "none")}
              aria-label="Decrease minutes"
            >
              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
            </button>
            <div className="text-xs font-bold">MINS</div>
          </div>
        </div>
      </div>

      <div
        className="text-center bg-yellow-300 px-3 py-1 rounded-md text-sm"
        style={{
          border: "2px solid #000",
          borderBottomWidth: "4px",
          borderRightWidth: "4px",
          boxShadow: "2px 2px 0px #000000",
          transform: "none",
        }}
      >
        <span style={{ fontFamily: "PixelCodeMedium", fontWeight: "bold" }}>
          {hours > 0 ? `${hours} hr${hours > 1 ? "s" : ""} ` : ""}
          {minutes > 0 ? `${minutes} min` : hours === 0 ? "0 min" : ""}
        </span>
      </div>

      <div className="w-full">
        <h3
          className="text-base font-bold mb-2 inline-block px-3 py-1"
          style={{
            fontFamily: "PixelCodeMedium",
            backgroundColor: "#000",
            color: "#fff",
            clipPath: "polygon(0 0, 100% 0%, 100% 100%, 0% 100%)",
          }}
        >
          PRESETS
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const isActive = hours * 60 + minutes === preset.value;
            return (
              <button
                key={preset.label}
                className="flex items-center justify-between p-3 rounded-md transition-all"
                style={brutalistPreset(isActive)}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.transform = "none";
                }}
                onClick={() => handlePresetClick(preset.value)}
              >
                <span
                  style={{
                    fontFamily: "PixelCodeMedium",
                    fontWeight: "bold",
                  }}
                >
                  {preset.label}
                </span>
                <span className="text-xs bg-black text-white px-2 py-0.5 rounded-sm font-bold">
                  {preset.value >= 60
                    ? `${Math.floor(preset.value / 60)}h ${
                        preset.value % 60 > 0 ? `${preset.value % 60}m` : ""
                      }`
                    : `${preset.value}m`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DurationPicker;
