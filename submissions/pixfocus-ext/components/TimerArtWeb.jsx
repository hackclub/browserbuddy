import React, { useEffect } from "react";
import CoffeeCupSvg from "../variants/CoffeeCupSvg";
import Animations from "../variants/Animations";
import useThemeStore from "../store/themeStore";

const TimerArtVariants = {
  COFFEE_CUP: "COFFEE_CUP",
  FIRE_CAMP: "FIRE_CAMP",
  OWL: "OWL",
  RABBIT: "RABBIT",
};

const TimerArt = ({ variant = "COFFEE_CUP", progress, style }) => {
  useEffect(() => {
    useThemeStore.getState().setTheme(variant);
  }, [variant]);

  const renderArt = () => {
    switch (variant) {
      case TimerArtVariants.COFFEE_CUP:
        return <CoffeeCupSvg progress={progress} />;
      case TimerArtVariants.FIRE_CAMP:
      case TimerArtVariants.OWL:
      case TimerArtVariants.RABBIT:
        return <Animations type={variant} />;
      default:
        return <CoffeeCupSvg progress={progress} />;
    }
  };

  return <div className="w-[300px] h-auto">{renderArt()}</div>;
};

export { TimerArt, TimerArtVariants };
