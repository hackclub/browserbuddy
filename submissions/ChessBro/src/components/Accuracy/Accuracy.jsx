import React from "react";
import "./Accuracy.css";

const Accuracy = ({ PGN }) => {
  const white = PGN.accuracy ? PGN.accuracy.white : 100;
  const black = PGN.accuracy ? PGN.accuracy.black : 100;
  return (
    <div className="accuracy">
      <div className="accuracy-color" id="white-accuracy">
        {`${white}%`}
      </div>
      <a id="accuracy-heading">Accuracy</a>
      <div className="accuracy-color" id="black-accuracy">
        {`${black}%`}
      </div>
    </div>
  );
};

export default Accuracy;
