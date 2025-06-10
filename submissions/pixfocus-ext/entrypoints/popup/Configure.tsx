import React from "react";
import { Link } from "react-router";
import DurationPicker from "@/components/DurationPicker";
import useThemeStore from "@/store/themeStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

const Configure: React.FC = () => {
  const colors = useThemeStore((state) => state.colors);

  return (
    <div
      className="w-[400px] h-[500px] flex flex-col items-center p-4" // Reduced padding from p-6 to p-4
      style={{ backgroundColor: colors.primary }}
    >
      {/* Back button in top left - straight design */}
      <div className="self-start w-full mb-1"> {/* Reduced margin from mb-2 to mb-1 */}
        <Link
          to="/"
          className="inline-flex items-center justify-center p-2 rounded-md hover:bg-black/10 active:bg-black/20"
          style={{
            border: "2px solid #000", // Thinner border
            borderBottomWidth: "4px", // Reduced from 5px
            borderRightWidth: "4px", // Reduced from 5px
            boxShadow: "2px 2px 0px #000",
            backgroundColor: colors.accent,
            color: colors.secondary,
            transform: "none",
          }}
          title="Back to Timer"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
        </Link>
      </div>

      <div className="w-full flex-1 overflow-hidden"> {/* Added overflow-hidden to prevent scroll */}
        <DurationPicker compact={true} /> {/* Added compact prop */}
      </div>
    </div>
  );
};

export default Configure;
