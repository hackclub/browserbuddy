type MascotProps = {
  type?: string;
  stage?: string;
  color?: string;
};

const MascotDisplay = ({
  type = "dragon",
  stage = "0",
  color = "red",
}: MascotProps) => {
  return (
    <>
      <img
        src={
          "/assets/images/mascots/" + type + "-" + stage + "-" + color + ".PNG"
        }
        className="h-64 w-full"
        alt={"Pixel art of a " + color + " stage " + stage + " " + type}
      ></img>
    </>
  );
};

export default MascotDisplay;
