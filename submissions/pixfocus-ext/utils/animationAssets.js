// Import assets using relative paths
import rabbit from "../assets/rabbits.gif"; //yep my mac cant tell difference between R and r so i just added "s" both here and the filename
import firecamp from "../assets/firecamp.gif";
import owl from "../assets/owl.gif";

export const AnimationAssets = {
  RABBIT: rabbit,
  FIRE_CAMP: firecamp,
  OWL: owl,
};

export const getAnimationAsset = (type) => {
  const normalizedType = type.toUpperCase();
  return AnimationAssets[normalizedType] || AnimationAssets.FIRE_CAMP;
};
