import React from "react";
import { getAnimationAsset } from "../utils/animationAssets";

const Animations = ({ type }) => {
  return (
    <div style={styles.container}>
      <img
        style={styles.image}
        src={getAnimationAsset(type)}
        alt={`${type} animation`}
        onError={(error) => console.error("Image loading error:", error)}
      />
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transition: "opacity 1000ms ease",
  },
};

export default Animations;
