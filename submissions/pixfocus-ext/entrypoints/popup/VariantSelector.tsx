import React from "react";
import { Link } from "react-router";
import { TimerArtVariants } from "@/components/TimerArtWeb";
import useThemeStore from "@/store/themeStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { AnimationAssets } from "@/utils/animationAssets";

// Import coffee cup image directly
import coffeeCupBg from "@/assets/Mugshop.png";

const VariantSelector: React.FC = () => {
  const colors = useThemeStore((state) => state.colors);
  const setVariant = useThemeStore((state) => state.setTheme);
  const currentVariant = useThemeStore((state) => state.currentTheme);

  // Get image based on variant ID
  const getVariantImage = (variantId) => {
    switch (variantId) {
      case TimerArtVariants.COFFEE_CUP:
        return coffeeCupBg;
      case TimerArtVariants.FIRE_CAMP:
        return AnimationAssets.FIRE_CAMP;
      case TimerArtVariants.OWL:
        return AnimationAssets.OWL;
      case TimerArtVariants.RABBIT:
        return AnimationAssets.RABBIT;
      default:
        return coffeeCupBg;
    }
  };

  // Create variant data from TimerArtVariants enum
  const variantData = Object.entries(TimerArtVariants).map(([key, value]) => ({
    id: value,
    name: key.charAt(0) + key.slice(1).toLowerCase().replace("_", " "),
  }));

  return (
    <div
      className="w-[400px] h-[500px] flex flex-col items-center p-4"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="self-start w-full mb-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center p-2 rounded-md hover:bg-black/10 active:bg-black/20"
          style={{
            border: "2px solid #000",
            borderBottomWidth: "4px",
            borderRightWidth: "4px",
            boxShadow: "2px 2px 0px #000",
            backgroundColor: colors.accent,
            color: colors.iconFill,
          }}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
        </Link>
      </div>

      <h2
        className="text-2xl font-bold mb-6 font-pixelmed"
        style={{ color: colors.text }}
      >
        Select Timer Art
      </h2>

      <div className="grid grid-cols-2 gap-4 w-full">
        {variantData.map((variant) => (
          <div
            key={variant.id}
            className={`cursor-pointer transition-all transform hover:scale-105 flex flex-col items-center rounded-lg ${
              currentVariant === variant.id
                ? "border-4 border-dashed"
                : "border-4"
            }`}
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.buttonBorder,
            }}
            onClick={() => setVariant(variant.id)}
          >
            <div className="w-full p-3 flex flex-col items-center">
              <div
                className="w-[120px] h-[120px] flex items-center justify-center bg-cover bg-center rounded-md"
                style={{
                  backgroundImage: `url(${getVariantImage(variant.id)})`,
                }}
              />
              <p
                className="mt-2 text-center font-pixelmed"
                style={{ color: colors.text }}
              >
                {variant.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariantSelector;
