import React from "react";
import { motion } from "framer-motion";
import useThemeStore from "../store/themeStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faStop } from "@fortawesome/free-solid-svg-icons";

const PressableScale = ({ children, onPress, style }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onPress}
      style={style}
      className="flex items-center justify-center overflow-hidden"
    >
      {children}
    </motion.button>
  );
};

const SplitButton = ({ mainAction, leftAction, rightAction, splitted }) => {
  const colors = useThemeStore((state) => state.colors);

  const containerStyle = {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    height: "70px",
    justifyContent: "center",
    paddingLeft: "40px",
    paddingRight: "40px",
  };

  const baseButtonStyle = {
    height: "70px",
    justifyContent: "center",
    borderRadius: "30px",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: "4px",
    borderStyle: "solid",
    borderColor: colors.buttonBorder,
  };

  return (
    <div style={containerStyle}>
      <motion.div
        animate={{
          width: splitted ? "calc(50% - 5px)" : "0px",
          opacity: splitted ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{
          ...baseButtonStyle,
          backgroundColor: colors.accent,
        }}
      >
        <PressableScale
          onPress={leftAction.onPress}
          style={{ width: "100%", height: "100%" }}
        >
          <FontAwesomeIcon icon={faPlay} size="2x" color={colors.iconFill} />
        </PressableScale>
      </motion.div>

      <motion.div
        animate={{
          width: splitted ? "calc(50% - 5px)" : "100%",
          marginLeft: splitted ? "10px" : "0px",
          backgroundColor: splitted ? colors.secondary : colors.accent,
        }}
        transition={{ duration: 0.3 }}
        style={{
          ...baseButtonStyle,
        }}
      >
        <PressableScale
          onPress={splitted ? rightAction.onPress : mainAction.onPress}
          style={{ width: "100%", height: "100%" }}
        >
          <FontAwesomeIcon
            icon={!splitted ? faPause : faStop}
            size="2x"
            color={colors.iconFill}
          />
        </PressableScale>
      </motion.div>
    </div>
  );
};

export default SplitButton;
